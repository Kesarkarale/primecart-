"use client";

// ============================================================
// IMPORTS — page, database, navigation, icons आणि React hooks
// ============================================================

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  BadgePercent,
  BookOpen,
  Car,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  Filter,
  Gamepad2,
  Heart,
  Home,
  Laptop,
  LayoutGrid,
  LoaderCircle,
  Package,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Star,
  Tag,
  Watch,
  X,
  Baby,
  Dumbbell,
  Glasses,
  Shirt,
  Zap,
  RefreshCw,
  AlertCircle,
  Boxes,
  TrendingUp,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import "./categories.css";

// ============================================================
// TYPES — TypeScript ला कोणता data मिळणार ते सांगतात
// ============================================================

type Category = {
  name: string;
  slug: string;
  description: string;
  image: string;
  keywords: string[];
  icon: typeof Package;
};

type Product = {
  id: string;
  category_slug: string;
  name: string;
  image_url: string | null;
  price: number;
  original_price: number;
  rating: number;
  stock: number | null;
  is_flash_sale: boolean;
};

type CategoryStats = {
  products: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  deals: number;
  averageRating: number;
  minPrice: number | null;
  maxPrice: number | null;
  preview: Product[];
};

type FilterType =
  | "all"
  | "deals"
  | "top-rated"
  | "in-stock"
  | "low-stock";

type SortType =
  | "products"
  | "rating"
  | "deals"
  | "price-low"
  | "price-high"
  | "name";

// ============================================================
// CATEGORY MASTER DATA — category names, routes, icons, images
// Product counts आणि prices मात्र Supabase मधून येतात.
// ============================================================

const CATEGORIES: Category[] = [
  {
    name: "Home & Living",
    slug: "home-living",
    description: "Make your home more beautiful, comfortable and organized.",
    image: "/home-living.png",
    keywords: ["home", "living", "decor", "furniture", "kitchen"],
    icon: Home,
  },
  {
    name: "Mobiles",
    slug: "mobiles",
    description: "Smartphones, mobile accessories and everyday essentials.",
    image: "/mobiles.png",
    keywords: ["mobile", "phone", "smartphone", "android", "iphone"],
    icon: Smartphone,
  },
  {
    name: "Appliances",
    slug: "appliances",
    description: "Useful appliances for a smarter, easier everyday life.",
    image: "/appliances.png",
    keywords: ["appliance", "washing machine", "fridge", "kitchen"],
    icon: Zap,
  },
  {
    name: "Footwear",
    slug: "footwear",
    description: "Everyday shoes, sneakers, sandals and sports footwear.",
    image: "/footwear.png",
    keywords: ["shoes", "sneakers", "sandals", "footwear"],
    icon: ShoppingBag,
  },
  {
    name: "Watches",
    slug: "watch",
    description: "Classic, smart and premium watches for every occasion.",
    image: "/watch.png",
    keywords: ["watch", "smartwatch", "wristwatch", "timepiece"],
    icon: Watch,
  },
  {
    name: "Bags",
    slug: "bag",
    description: "Backpacks, handbags, travel bags and daily carry essentials.",
    image: "/bag.png",
    keywords: ["bag", "backpack", "handbag", "luggage", "wallet"],
    icon: ShoppingBag,
  },
  {
    name: "Toys & Baby",
    slug: "toy-baby",
    description: "Toys, baby care, learning and playtime essentials.",
    image: "/toy-baby.png",
    keywords: ["toy", "baby", "kids", "toys", "infant"],
    icon: Baby,
  },
  {
    name: "Automotive",
    slug: "automotive",
    description: "Car and bike accessories, tools and travel essentials.",
    image: "/automotive.png",
    keywords: ["car", "bike", "automotive", "vehicle", "auto"],
    icon: Car,
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Clothing, modern styles and everyday fashion essentials.",
    image: "/fashion.png",
    keywords: ["fashion", "clothes", "clothing", "shirt", "dress"],
    icon: Shirt,
  },
  {
    name: "Gaming",
    slug: "gaming",
    description: "Gaming accessories, gear and entertainment essentials.",
    image: "/gaming.png",
    keywords: ["gaming", "game", "console", "controller", "accessories"],
    icon: Gamepad2,
  },
  {
    name: "Sports & Outdoor",
    slug: "sports-outdoor",
    description: "Sports equipment, fitness gear and outdoor adventure items.",
    image: "/sports-outdoor.png",
    keywords: ["sports", "outdoor", "fitness", "camping", "gym"],
    icon: Dumbbell,
  },
  {
    name: "Eyewear",
    slug: "eyewear",
    description: "Sunglasses, frames and eyewear for different occasions.",
    image: "/eyewear.png",
    keywords: ["eyewear", "glasses", "sunglasses", "spectacles"],
    icon: Glasses,
  },
  {
    name: "Books",
    slug: "books",
    description: "Books, learning resources and inspiration for curious minds.",
    image: "/books.png",
    keywords: ["books", "novel", "education", "reading", "study"],
    icon: BookOpen,
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty",
    description: "Skincare, beauty, grooming and personal care essentials.",
    image: "/beauty.png",
    keywords: ["beauty", "skincare", "makeup", "grooming", "personal care"],
    icon: Sparkles,
  },
  {
    name: "Electronics",
    slug: "electronics",
    description: "Everyday electronics, computer gear and smart accessories.",
    image: "/electronics.png",
    keywords: ["electronics", "laptop", "computer", "headphones", "tech"],
    icon: Laptop,
  },
];

// ============================================================
// CONSTANTS — pagination, currency आणि default values
// ============================================================

const PAGE_SIZE = 1000;

const EMPTY_STATS: CategoryStats = {
  products: 0,
  inStock: 0,
  lowStock: 0,
  outOfStock: 0,
  deals: 0,
  averageRating: 0,
  minPrice: null,
  maxPrice: null,
  preview: [],
};

// ============================================================
// HELPERS — number, price, image आणि category slug normalize
// ============================================================

function safeNumber(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getProductImage(imageUrl: string | null): string {
  if (!imageUrl) return "/product-placeholder.png";

  if (
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("/")
  ) {
    return imageUrl;
  }

  return `/products/${imageUrl}`;
}

function normalizeSlug(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function getDiscount(price: number, originalPrice: number): number {
  if (originalPrice <= price || originalPrice <= 0) return 0;

  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

// ============================================================
// MAIN PAGE — Supabase data, search, filters, sorting, UI state
// ============================================================

export default function CategoriesPage() {
  // ---- SUPABASE CLIENT ----
  // useMemo मुळे प्रत्येक render मध्ये नवीन client तयार होत नाही.
  const supabase = useMemo(() => createClient(), []);

  // ---- PAGE STATE ----
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("products");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [previewCategory, setPreviewCategory] = useState<Category | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // ============================================================
  // DATABASE FETCH — active products आणि category slug
  // प्रत्येक batch 1000 products घेते, त्यामुळे मोठा catalog सुद्धा
  // एकाच request च्या row limit वर अवलंबून राहत नाही.
  // ============================================================

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setFetchError("");

    try {
      const allRows: Product[] = [];
      let from = 0;

      while (true) {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id,
            name,
            image_url,
            price,
            original_price,
            rating,
            stock,
            is_flash_sale,
            categories!inner(slug)
          `)
          .eq("is_active", true)
          .order("id", { ascending: true })
          .range(from, from + PAGE_SIZE - 1);

        if (error) throw error;

        const rows = (data ?? []) as unknown as Array<{
          id: string;
          name: string;
          image_url: string | null;
          price: number | string | null;
          original_price: number | string | null;
          rating: number | string | null;
          stock: number | null;
          is_flash_sale: boolean | null;
          categories:
            | { slug: string | null }
            | Array<{ slug: string | null }>
            | null;
        }>;

        const batch: Product[] = rows.map((row) => {
          const categoryRelation = Array.isArray(row.categories)
            ? row.categories[0]
            : row.categories;

          return {
            id: String(row.id),
            name: row.name ?? "Unnamed product",
            image_url: row.image_url ?? null,
            price: safeNumber(row.price),
            original_price: safeNumber(row.original_price),
            rating: safeNumber(row.rating),
            stock:
              row.stock === null || row.stock === undefined
                ? null
                : safeNumber(row.stock),
            is_flash_sale: row.is_flash_sale === true,
            category_slug: normalizeSlug(categoryRelation?.slug),
          };
        });

        allRows.push(...batch);

        if (rows.length < PAGE_SIZE) break;

        from += PAGE_SIZE;
      }

      setProducts(allRows);
    } catch (error) {
      console.error("Categories page: product fetch failed:", error);
      setFetchError(
        error instanceof Error
          ? error.message
          : "Products load झाले नाहीत. Supabase connection तपासा."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // ---- LOAD DATABASE DATA ----
  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  // ---- LOAD SAVED WISHLIST AND RECENT CATEGORIES ----
  // localStorage access फक्त browser मध्ये केला जातो.
  useEffect(() => {
    try {
      const savedWishlist = JSON.parse(
        localStorage.getItem("primecart-wishlist") || "[]"
      );

      if (Array.isArray(savedWishlist)) {
        setWishlist(
          savedWishlist.map((item) =>
            typeof item === "string" ? item : String(item?.id ?? "")
          )
        );
      }

      const savedRecent = JSON.parse(
        localStorage.getItem("primecart-recent-categories") || "[]"
      );

      if (Array.isArray(savedRecent)) {
        setRecentlyViewed(
          savedRecent.filter((item): item is string => typeof item === "string")
        );
      }
    } catch (error) {
      console.warn("Saved category preferences could not be read:", error);
    }
  }, []);

  // ============================================================
  // CATEGORY STATISTICS — actual database product counts
  // Stock, deal, price आणि average rating इथे calculate होतात.
  // ============================================================

  const stats = useMemo(() => {
    const result: Record<string, CategoryStats> = {};

    for (const category of CATEGORIES) {
      const categoryProducts = products.filter(
        (product) => product.category_slug === category.slug
      );

      const prices = categoryProducts
        .map((product) => product.price)
        .filter((price) => price > 0);

      const ratings = categoryProducts
        .map((product) => product.rating)
        .filter((rating) => rating > 0);

      result[category.slug] = {
        products: categoryProducts.length,

        // ---- STOCK COUNTS ----
        inStock: categoryProducts.filter(
          (product) => product.stock !== null && product.stock > 0
        ).length,

        lowStock: categoryProducts.filter(
          (product) =>
            product.stock !== null &&
            product.stock > 0 &&
            product.stock <= 5
        ).length,

        outOfStock: categoryProducts.filter(
          (product) =>
            product.stock !== null && product.stock <= 0
        ).length,

        // ---- DEALS COUNT ----
        deals: categoryProducts.filter(
          (product) => product.is_flash_sale
        ).length,

        // ---- AVERAGE RATING ----
        averageRating:
          ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) /
              ratings.length
            : 0,

        // ---- PRICE RANGE ----
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
        maxPrice: prices.length > 0 ? Math.max(...prices) : null,

        // ---- CATEGORY PREVIEW PRODUCTS ----
        preview: [...categoryProducts]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5),
      };
    }

    return result;
  }, [products]);

  // ============================================================
  // OVERALL STATS — page header मधील summary cards
  // ============================================================

  const overallStats = useMemo(() => {
    return {
      categories: CATEGORIES.length,
      products: products.length,
      inStock: products.filter(
        (product) => product.stock !== null && product.stock > 0
      ).length,
      deals: products.filter((product) => product.is_flash_sale).length,
      lowStock: products.filter(
        (product) =>
          product.stock !== null &&
          product.stock > 0 &&
          product.stock <= 5
      ).length,
    };
  }, [products]);

  // ============================================================
  // SEARCH + FILTER + SORT — category cards वर लागू होणारे rules
  // Search category नाव, description, keywords आणि product नाव तपासते.
  // ============================================================

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = CATEGORIES.filter((category) => {
      const categoryStats = stats[category.slug] ?? EMPTY_STATS;

      const matchesCategory =
        !query ||
        category.name.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query) ||
        category.keywords.some((keyword) =>
          keyword.toLowerCase().includes(query)
        );

      const matchesProduct =
        !query ||
        products.some(
          (product) =>
            product.category_slug === category.slug &&
            product.name.toLowerCase().includes(query)
        );

      const matchesSearch = matchesCategory || matchesProduct;

      let matchesFilter = true;

      if (filter === "deals") {
        matchesFilter = categoryStats.deals > 0;
      } else if (filter === "top-rated") {
        matchesFilter = categoryStats.averageRating >= 4;
      } else if (filter === "in-stock") {
        matchesFilter = categoryStats.inStock > 0;
      } else if (filter === "low-stock") {
        matchesFilter = categoryStats.lowStock > 0;
      }

      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      const aStats = stats[a.slug] ?? EMPTY_STATS;
      const bStats = stats[b.slug] ?? EMPTY_STATS;

      switch (sort) {
        case "rating":
          return bStats.averageRating - aStats.averageRating;

        case "deals":
          return bStats.deals - aStats.deals;

        case "price-low":
          return (
            (aStats.minPrice ?? Number.POSITIVE_INFINITY) -
            (bStats.minPrice ?? Number.POSITIVE_INFINITY)
          );

        case "price-high":
          return (
            (bStats.maxPrice ?? 0) - (aStats.maxPrice ?? 0)
          );

        case "name":
          return a.name.localeCompare(b.name);

        case "products":
        default:
          return bStats.products - aStats.products;
      }
    });
  }, [search, filter, sort, stats, products]);

  // ---- WISHLIST TOGGLE ----
  // Category wishlist browser मध्ये save होते.
  const toggleWishlist = (slug: string) => {
    setWishlist((current) => {
      const next = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug];

      try {
        localStorage.setItem("primecart-wishlist", JSON.stringify(next));
      } catch (error) {
        console.warn("Wishlist could not be saved:", error);
      }

      return next;
    });
  };

  // ---- RECENT CATEGORY TRACKING ----
  const rememberCategory = (slug: string) => {
    setRecentlyViewed((current) => {
      const next = [slug, ...current.filter((item) => item !== slug)].slice(
        0,
        5
      );

      try {
        localStorage.setItem(
          "primecart-recent-categories",
          JSON.stringify(next)
        );
      } catch (error) {
        console.warn("Recent categories could not be saved:", error);
      }

      return next;
    });
  };

  // ---- FILTER LABELS ----
  const filterOptions: Array<{
    value: FilterType;
    label: string;
    icon: typeof LayoutGrid;
  }> = [
    { value: "all", label: "All Categories", icon: LayoutGrid },
    { value: "deals", label: "Flash Deals", icon: BadgePercent },
    { value: "top-rated", label: "Top Rated", icon: Star },
    { value: "in-stock", label: "In Stock", icon: Check },
    { value: "low-stock", label: "Low Stock", icon: AlertCircle },
  ];

  // ============================================================
  // CATEGORY CARD — प्रत्येक category चा visual card
  // ============================================================

  const renderCategoryCard = (category: Category) => {
    const categoryStats = stats[category.slug] ?? EMPTY_STATS;
    const Icon = category.icon;
    const isSaved = wishlist.includes(category.slug);

    return (
      <article className="cat-card" key={category.slug}>
        {/* ---- CATEGORY IMAGE / ICON ---- */}
        <Link
          href={`/dashboard/categories/${category.slug}`}
          className="cat-card-visual"
          onClick={() => rememberCategory(category.slug)}
        >
          <img
            src={category.image}
            alt={category.name}
            className="cat-card-image"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <span className="cat-card-image-shade" />

          <span className="cat-card-icon">
            <Icon size={23} strokeWidth={1.8} />
          </span>

          {categoryStats.deals > 0 && (
            <span className="cat-card-deal">
              <Tag size={12} />
              {categoryStats.deals} deals
            </span>
          )}

          <span className="cat-card-open">
            <ArrowUpDown size={15} />
          </span>
        </Link>

        {/* ---- CATEGORY DETAILS ---- */}
        <div className="cat-card-content">
          <div className="cat-card-title-row">
            <div className="cat-card-title-wrap">
              <Link
                href={`/dashboard/categories/${category.slug}`}
                className="cat-card-title"
                onClick={() => rememberCategory(category.slug)}
              >
                {category.name}
              </Link>

              <p className="cat-card-description">{category.description}</p>
            </div>

            {/* ---- SAVE CATEGORY ---- */}
            <button
              type="button"
              className={`cat-save-btn ${isSaved ? "is-saved" : ""}`}
              onClick={() => toggleWishlist(category.slug)}
              aria-label={
                isSaved ? "Remove category from wishlist" : "Save category"
              }
              title={isSaved ? "Remove from saved" : "Save category"}
            >
              <Heart size={17} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>

          {/* ---- DATABASE COUNTS ---- */}
          <div className="cat-card-stats">
            <div className="cat-card-stat">
              <span className="cat-card-stat-number">
                {categoryStats.products}
              </span>
              <span className="cat-card-stat-label">Products</span>
            </div>

            <div className="cat-card-stat">
              <span className="cat-card-stat-number cat-stock-number">
                {categoryStats.inStock}
              </span>
              <span className="cat-card-stat-label">In stock</span>
            </div>

            <div className="cat-card-stat">
              <span className="cat-card-stat-number">
                {categoryStats.averageRating > 0
                  ? categoryStats.averageRating.toFixed(1)
                  : "—"}
              </span>
              <span className="cat-card-stat-label">
                <Star size={11} fill="currentColor" />
                Rating
              </span>
            </div>
          </div>

          {/* ---- PRICE RANGE FROM DATABASE ---- */}
          <div className="cat-card-price-row">
            {categoryStats.minPrice !== null &&
            categoryStats.maxPrice !== null ? (
              <span className="cat-card-price">
                {formatPrice(categoryStats.minPrice)}
                {categoryStats.minPrice !== categoryStats.maxPrice &&
                  ` – ${formatPrice(categoryStats.maxPrice)}`}
              </span>
            ) : (
              <span className="cat-card-no-price">No active products</span>
            )}

            {categoryStats.lowStock > 0 && (
              <span className="cat-low-stock-label">
                {categoryStats.lowStock} low stock
              </span>
            )}
          </div>

          {/* ---- CATEGORY ACTIONS ---- */}
          <div className="cat-card-actions">
            <button
              type="button"
              className="cat-preview-btn"
              onClick={() => setPreviewCategory(category)}
            >
              <Eye size={15} />
              Quick view
            </button>

            <Link
              href={`/dashboard/categories/${category.slug}`}
              className="cat-explore-btn"
              onClick={() => rememberCategory(category.slug)}
            >
              Explore
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </article>
    );
  };

  // ============================================================
  // FILTER CONTROLS — desktop sidebar आणि mobile drawer मध्ये वापरले
  // ============================================================

  const renderFilters = () => (
    <>
      <div className="cat-filter-heading">
        <div>
          <span className="cat-eyebrow">REFINE RESULTS</span>
          <h3>Filters</h3>
        </div>

        <button
          type="button"
          className="cat-text-btn"
          onClick={() => {
            setFilter("all");
            setSort("products");
            setSearch("");
          }}
        >
          Reset
        </button>
      </div>

      {/* ---- FILTER BY PRODUCT STATUS ---- */}
      <div className="cat-filter-group">
        <h4>Category type</h4>

        {filterOptions.map((option) => {
          const Icon = option.icon;

          return (
            <button
              type="button"
              key={option.value}
              className={`cat-filter-option ${
                filter === option.value ? "active" : ""
              }`}
              onClick={() => {
                setFilter(option.value);
                setMobileFiltersOpen(false);
              }}
            >
              <span className="cat-filter-option-left">
                <Icon size={16} />
                {option.label}
              </span>

              {filter === option.value && <Check size={16} />}
            </button>
          );
        })}
      </div>

      {/* ---- SORT RESULTS ---- */}
      <div className="cat-filter-group">
        <h4>Sort categories</h4>

        <label className="cat-select-wrap">
          <span className="cat-sr-only">Sort categories</span>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortType)}
          >
            <option value="products">Most products</option>
            <option value="rating">Highest rating</option>
            <option value="deals">Most deals</option>
            <option value="price-low">Lowest starting price</option>
            <option value="price-high">Highest maximum price</option>
            <option value="name">Name: A to Z</option>
          </select>

          <ChevronDown size={16} />
        </label>
      </div>

      {/* ---- LIVE INVENTORY SUMMARY ---- */}
      <div className="cat-inventory-box">
        <div className="cat-inventory-icon">
          <Boxes size={18} />
        </div>

        <div>
          <strong>Inventory overview</strong>
          <p>{overallStats.products} active products</p>
        </div>

        <div className="cat-inventory-divider" />

        <div className="cat-inventory-line">
          <span>In stock</span>
          <strong>{overallStats.inStock}</strong>
        </div>

        <div className="cat-inventory-line">
          <span>Low stock</span>
          <strong>{overallStats.lowStock}</strong>
        </div>

        <div className="cat-inventory-line">
          <span>Flash deals</span>
          <strong>{overallStats.deals}</strong>
        </div>
      </div>
    </>
  );

  // ============================================================
  // PAGE JSX — page header, hero, stats, search, filters, grid
  // ============================================================

  return (
    <main className="categories-page">
      {/* ---- BREADCRUMB ---- */}
      <nav className="cat-breadcrumb" aria-label="Breadcrumb">
        <Link href="/dashboard">Home</Link>
        <span>/</span>
        <span>Categories</span>
      </nav>

      {/* ---- PAGE HEADER ---- */}
      <header className="cat-page-header">
        <div>
          <span className="cat-eyebrow">
            <Sparkles size={13} />
            THE PRIME CART COLLECTION
          </span>

          <h1>
            Find your next <span>favourite.</span>
          </h1>

          <p>
            Explore curated categories, discover new products and find the
            right essentials for your everyday life.
          </p>
        </div>

        <Link href="/dashboard" className="cat-back-dashboard">
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
      </header>

      {/* ---- HERO SUMMARY STATS ---- */}
      <section className="cat-summary-grid" aria-label="Catalog summary">
        <div className="cat-summary-card">
          <span className="cat-summary-icon">
            <LayoutGrid size={19} />
          </span>
          <div>
            <span className="cat-summary-label">Categories</span>
            <strong>{overallStats.categories}</strong>
            <small>Curated collections</small>
          </div>
        </div>

        <div className="cat-summary-card">
          <span className="cat-summary-icon">
            <Package size={19} />
          </span>
          <div>
            <span className="cat-summary-label">Active products</span>
            <strong>{loading ? "…" : overallStats.products}</strong>
            <small>From your database</small>
          </div>
        </div>

        <div className="cat-summary-card">
          <span className="cat-summary-icon">
            <Check size={19} />
          </span>
          <div>
            <span className="cat-summary-label">Available</span>
            <strong>{loading ? "…" : overallStats.inStock}</strong>
            <small>Currently in stock</small>
          </div>
        </div>

        <div className="cat-summary-card">
          <span className="cat-summary-icon">
            <BadgePercent size={19} />
          </span>
          <div>
            <span className="cat-summary-label">Flash deals</span>
            <strong>{loading ? "…" : overallStats.deals}</strong>
            <small>Marked as flash sale</small>
          </div>
        </div>
      </section>

      {/* ---- SEARCH BAR ---- */}
      <section className="cat-search-panel">
        <div className="cat-search-box">
          <Search size={20} />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories or products..."
            aria-label="Search categories or products"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="cat-search-clear"
            >
              <X size={17} />
            </button>
          )}
        </div>

        <button
          type="button"
          className="cat-mobile-filter-toggle"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <SlidersHorizontal size={17} />
          Filters
          {filter !== "all" && <span className="cat-filter-dot" />}
        </button>
      </section>

      {/* ---- QUICK FILTER CHIPS ---- */}
      <div className="cat-quick-filters">
        {filterOptions.map((option) => {
          const Icon = option.icon;

          return (
            <button
              type="button"
              key={option.value}
              className={`cat-quick-chip ${
                filter === option.value ? "active" : ""
              }`}
              onClick={() => setFilter(option.value)}
            >
              <Icon size={15} />
              {option.label}
            </button>
          );
        })}

        <span className="cat-result-count">
          {loading ? "Loading..." : `${filteredCategories.length} results`}
        </span>
      </div>

      {/* ---- ERROR MESSAGE ---- */}
      {fetchError && (
        <section className="cat-error-panel" role="alert">
          <AlertCircle size={20} />

          <div>
            <strong>Products load झाले नाहीत</strong>
            <p>{fetchError}</p>
            <small>
              Supabase connection, table names आणि RLS policies तपासा.
            </small>
          </div>

          <button type="button" onClick={() => void fetchProducts()}>
            <RefreshCw size={15} />
            Retry
          </button>
        </section>
      )}

      {/* ---- MAIN CONTENT: FILTER SIDEBAR + CATEGORY GRID ---- */}
      <section className="cat-main-layout">
        {/* ---- DESKTOP FILTER SIDEBAR ---- */}
        <aside className="cat-sidebar">{renderFilters()}</aside>

        {/* ---- CATEGORY RESULTS ---- */}
        <div className="cat-results">
          <div className="cat-results-header">
            <div>
              <span className="cat-eyebrow">BROWSE COLLECTIONS</span>
              <h2>
                {filter === "all"
                  ? "All categories"
                  : filterOptions.find((option) => option.value === filter)
                      ?.label}
              </h2>
            </div>

            <span className="cat-results-total">
              {loading
                ? "Loading catalog"
                : `${filteredCategories.length} collections`}
            </span>
          </div>

          {/* ---- LOADING STATE ---- */}
          {loading ? (
            <div className="cat-loading-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="cat-skeleton-card" key={index}>
                  <div className="cat-skeleton-image" />
                  <div className="cat-skeleton-line wide" />
                  <div className="cat-skeleton-line" />
                  <div className="cat-skeleton-line short" />
                </div>
              ))}
            </div>
          ) : fetchError ? (
            <div className="cat-empty-state">
              <span className="cat-empty-icon">
                <AlertCircle size={25} />
              </span>
              <h3>Catalog unavailable</h3>
              <p>Database data मिळाल्यावर categories इथे दिसतील.</p>
              <button
                type="button"
                className="cat-primary-btn"
                onClick={() => void fetchProducts()}
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="cat-grid">
              {filteredCategories.map(renderCategoryCard)}
            </div>
          ) : (
            /* ---- NO SEARCH / FILTER RESULTS ---- */
            <div className="cat-empty-state">
              <span className="cat-empty-icon">
                <Search size={25} />
              </span>

              <h3>No matching categories</h3>

              <p>
                दुसरा search शब्द वापर किंवा filters reset करून पुन्हा प्रयत्न
                कर.
              </p>

              <button
                type="button"
                className="cat-primary-btn"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                  setSort("products");
                }}
              >
                <X size={16} />
                Clear search and filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ---- RECENTLY VIEWED CATEGORIES ---- */}
      {!loading && recentlyViewed.length > 0 && (
        <section className="cat-recent-section">
          <div className="cat-section-heading">
            <div>
              <span className="cat-eyebrow">
                <Clock3 size={13} />
                PICK UP WHERE YOU LEFT OFF
              </span>
              <h2>Recently explored</h2>
            </div>
          </div>

          <div className="cat-recent-list">
            {recentlyViewed
              .map((slug) => CATEGORIES.find((category) => category.slug === slug))
              .filter((category): category is Category => Boolean(category))
              .map((category) => {
                const Icon = category.icon;

                return (
                  <Link
                    href={`/dashboard/categories/${category.slug}`}
                    className="cat-recent-item"
                    key={category.slug}
                  >
                    <span className="cat-recent-icon">
                      <Icon size={18} />
                    </span>
                    <span>{category.name}</span>
                    <ArrowRight size={15} />
                  </Link>
                );
              })}
          </div>
        </section>
      )}

      {/* ========================================================
          QUICK PREVIEW MODAL — category products, stock, prices
          ======================================================== */}

      {previewCategory && (
        <div
          className="cat-modal-backdrop"
          role="presentation"
          onClick={() => setPreviewCategory(null)}
        >
          <section
            className="cat-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cat-preview-title"
            onClick={(event) => event.stopPropagation()}
          >
            {/* ---- MODAL HEADER ---- */}
            <div className="cat-modal-header">
              <div className="cat-modal-title-wrap">
                <span className="cat-eyebrow">CATEGORY QUICK VIEW</span>
                <h2 id="cat-preview-title">{previewCategory.name}</h2>
                <p>{previewCategory.description}</p>
              </div>

              <button
                type="button"
                className="cat-modal-close"
                onClick={() => setPreviewCategory(null)}
                aria-label="Close category preview"
              >
                <X size={20} />
              </button>
            </div>

            {/* ---- MODAL STATS ---- */}
            <div className="cat-modal-stats">
              <div>
                <span>Products</span>
                <strong>
                  {(stats[previewCategory.slug] ?? EMPTY_STATS).products}
                </strong>
              </div>

              <div>
                <span>In stock</span>
                <strong>
                  {(stats[previewCategory.slug] ?? EMPTY_STATS).inStock}
                </strong>
              </div>

              <div>
                <span>Flash deals</span>
                <strong>
                  {(stats[previewCategory.slug] ?? EMPTY_STATS).deals}
                </strong>
              </div>
            </div>

            {/* ---- PREVIEW PRODUCT LIST ---- */}
            <div className="cat-preview-products-heading">
              <h3>Popular products</h3>
              <span>From active catalog</span>
            </div>

            {(stats[previewCategory.slug] ?? EMPTY_STATS).preview.length > 0 ? (
              <div className="cat-preview-products">
                {(stats[previewCategory.slug] ?? EMPTY_STATS).preview.map(
                  (product) => (
                    <div className="cat-preview-product" key={product.id}>
                      <div className="cat-preview-product-image-wrap">
                        <img
                          src={getProductImage(product.image_url)}
                          alt={product.name}
                          className="cat-preview-product-image"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      </div>

                      <div className="cat-preview-product-info">
                        <strong>{product.name}</strong>

                        <div className="cat-preview-product-meta">
                          {product.rating > 0 && (
                            <span>
                              <Star size={12} fill="currentColor" />
                              {product.rating.toFixed(1)}
                            </span>
                          )}

                          {product.is_flash_sale && (
                            <span className="cat-mini-deal">Flash deal</span>
                          )}

                          {product.stock === null ? (
                            <span className="cat-stock-unknown">
                              Stock unknown
                            </span>
                          ) : product.stock > 0 ? (
                            <span className="cat-stock-available">
                              In stock
                            </span>
                          ) : (
                            <span className="cat-stock-unavailable">
                              Out of stock
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="cat-preview-product-price">
                        <strong>{formatPrice(product.price)}</strong>

                        {product.original_price > product.price && (
                          <del>{formatPrice(product.original_price)}</del>
                        )}

                        {getDiscount(product.price, product.original_price) >
                          0 && (
                          <small>
                            {getDiscount(
                              product.price,
                              product.original_price
                            )}
                            % off
                          </small>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="cat-modal-no-products">
                <Package size={22} />
                <p>या category मध्ये सध्या active products नाहीत.</p>
              </div>
            )}

            {/* ---- MODAL FOOTER ---- */}
            <div className="cat-modal-footer">
              <button
                type="button"
                className="cat-modal-secondary"
                onClick={() => toggleWishlist(previewCategory.slug)}
              >
                <Heart
                  size={16}
                  fill={
                    wishlist.includes(previewCategory.slug)
                      ? "currentColor"
                      : "none"
                  }
                />
                {wishlist.includes(previewCategory.slug)
                  ? "Saved"
                  : "Save category"}
              </button>

              <Link
                href={`/dashboard/categories/${previewCategory.slug}`}
                className="cat-modal-primary"
                onClick={() => {
                  rememberCategory(previewCategory.slug);
                  setPreviewCategory(null);
                }}
              >
                Explore category
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================
          MOBILE FILTER DRAWER — only visible when opened
          ======================================================== */}

      {mobileFiltersOpen && (
        <div
          className="cat-drawer-backdrop"
          role="presentation"
          onClick={() => setMobileFiltersOpen(false)}
        >
          <aside
            className="cat-filter-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Category filters"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cat-drawer-top">
              <div>
                <span className="cat-eyebrow">PERSONALIZE RESULTS</span>
                <h2>Filters & sorting</h2>
              </div>

              <button
                type="button"
                className="cat-modal-close"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {renderFilters()}

            <button
              type="button"
              className="cat-drawer-apply"
              onClick={() => setMobileFiltersOpen(false)}
            >
              Show {filteredCategories.length} categories
              <ArrowRight size={17} />
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
