"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Check,
  ChevronDown,
  Eye,
  Filter,
  Heart,
  ImageOff,
  Package,
  RotateCcw,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  Truck,
  X,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

/* =========================================================
   TYPES
========================================================= */

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number | string | null;
  original_price: number | string | null;
  stock: number | null;
  image_url: string | null;
  brand: string | null;
  rating: number | string | null;
  reviews_count: number | null;
  is_featured: boolean | null;
  is_flash_sale: boolean | null;
  is_active: boolean | null;
  created_at?: string;
};

type SortValue =
  | "featured"
  | "newest"
  | "rating"
  | "reviews"
  | "discount"
  | "price-low"
  | "price-high";

type CartItem = {
  id: string;
  name: string;
  price: number;
  original_price: number;
  image_url: string | null;
  quantity: number;
  stock: number;
};

/* =========================================================
   CATEGORY NAMES
========================================================= */

const categoryNames: Record<string, string> = {
  "home-living": "Home & Living",
  mobile: "Mobile",
  appliance: "Appliance",
  footwear: "Footwear",
  watch: "Watch",
  bag: "Bag",
  "toy-baby": "Toy & Baby",
  automotive: "Automotive",
  fashion: "Fashion",
  gaming: "Gaming",
};

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(value: number | string | null) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDiscount(product: Product) {
  const price = Number(product.price ?? 0);
  const original = Number(product.original_price ?? 0);

  if (
    price <= 0 ||
    original <= 0 ||
    original <= price
  ) {
    return 0;
  }

  return Math.round(
    ((original - price) / original) * 100
  );
}

function getImageCandidates(
  value: string | null | undefined
) {
  if (!value) return [];

  const image = value.trim();

  if (!image) return [];

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return [image];
  }

  const clean = image.replace(/^\/+/, "");

  return [
    `/${clean}`,
    `/products/${clean}`,
    `/images/${clean}`,
    `/product-images/${clean}`,
  ];
}

function getStockInfo(stock: number | null) {
  const value = Number(stock ?? 0);

  if (value <= 0) {
    return {
      label: "Out of stock",
      className: "text-red-500",
    };
  }

  if (value <= 5) {
    return {
      label: `Only ${value} left`,
      className: "text-orange-600",
    };
  }

  return {
    label: "In stock",
    className: "text-emerald-600",
  };
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function CategoryProductsPage() {
  const params = useParams();

  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
        ? params.slug[0]
        : "";

  const supabase = useMemo(() => createClient(), []);

  /* -----------------------------
     DATA
  ----------------------------- */

  const [category, setCategory] =
    useState<Category | null>(null);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* -----------------------------
     SEARCH / SORT
  ----------------------------- */

  const [search, setSearch] = useState("");

  const [sort, setSort] =
    useState<SortValue>("featured");

  /* -----------------------------
     FILTERS
  ----------------------------- */

  const [selectedBrands, setSelectedBrands] =
    useState<string[]>([]);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [ratingFilter, setRatingFilter] =
    useState("0");

  const [stockOnly, setStockOnly] =
    useState(false);

  const [discountOnly, setDiscountOnly] =
    useState(false);

  const [flashOnly, setFlashOnly] =
    useState(false);

  const [featuredOnly, setFeaturedOnly] =
    useState(false);

  /* -----------------------------
     UI
  ----------------------------- */

  const [mobileFilters, setMobileFilters] =
    useState(false);

  const [quickView, setQuickView] =
    useState<Product | null>(null);

  const [cartCount, setCartCount] = useState(0);

  const [wishlistIds, setWishlistIds] =
    useState<string[]>([]);

  const [recentIds, setRecentIds] =
    useState<string[]>([]);

  /* =========================================================
     LOAD CATEGORY + PRODUCTS
  ========================================================= */

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const {
          data: categoryData,
          error: categoryError,
        } = await supabase
          .from("categories")
          .select("id, name, slug")
          .eq("slug", slug)
          .maybeSingle();

        if (categoryError) {
          throw categoryError;
        }

        if (!categoryData) {
          if (!cancelled) {
            setCategory(null);
            setProducts([]);
            setError("Category not found.");
          }

          return;
        }

        const {
          data: productData,
          error: productError,
        } = await supabase
          .from("products")
          .select(
            `
              id,
              category_id,
              name,
              slug,
              short_description,
              description,
              price,
              original_price,
              stock,
              image_url,
              brand,
              rating,
              reviews_count,
              is_featured,
              is_flash_sale,
              is_active,
              created_at
            `
          )
          .eq("category_id", categoryData.id)
          .eq("is_active", true)
          .order("created_at", {
            ascending: false,
          });

        if (productError) {
          throw productError;
        }

        if (!cancelled) {
          setCategory(categoryData);
          setProducts(productData ?? []);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load products."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [slug, supabase]);

  /* =========================================================
     LOCAL STORAGE
  ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedWishlist =
        localStorage.getItem(
          "primecart_wishlist"
        );

      if (storedWishlist) {
        const parsed = JSON.parse(
          storedWishlist
        );

        if (Array.isArray(parsed)) {
          setWishlistIds(parsed);
        }
      }

      const storedRecent =
        localStorage.getItem(
          "primecart_recently_viewed"
        );

      if (storedRecent) {
        const parsed = JSON.parse(
          storedRecent
        );

        if (Array.isArray(parsed)) {
          setRecentIds(parsed);
        }
      }

      const storedCart =
        localStorage.getItem(
          "primecart_cart"
        );

      if (storedCart) {
        const parsed = JSON.parse(
          storedCart
        );

        if (Array.isArray(parsed)) {
          const count = parsed.reduce(
            (sum: number, item: CartItem) =>
              sum + Number(item.quantity ?? 0),
            0
          );

          setCartCount(count);
        }
      }
    } catch (storageError) {
      console.error(
        "PrimeCart storage error:",
        storageError
      );
    }
  }, []);

  /* =========================================================
     BRANDS
  ========================================================= */

  const brands = useMemo(() => {
    const values = products
      .map((product) => product.brand?.trim())
      .filter(Boolean) as string[];

    return [...new Set(values)].sort(
      (a, b) => a.localeCompare(b)
    );
  }, [products]);

  /* =========================================================
     PRICE BOUNDS
  ========================================================= */

  const priceBounds = useMemo(() => {
    const prices = products
      .map((product) => Number(product.price ?? 0))
      .filter((price) => price > 0);

    if (!prices.length) {
      return {
        min: 0,
        max: 0,
      };
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [products]);

  /* =========================================================
     FILTERED PRODUCTS
  ========================================================= */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const searchValue =
      search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((product) => {
        return (
          product.name
            .toLowerCase()
            .includes(searchValue) ||
          product.brand
            ?.toLowerCase()
            .includes(searchValue) ||
          product.short_description
            ?.toLowerCase()
            .includes(searchValue) ||
          product.description
            ?.toLowerCase()
            .includes(searchValue)
        );
      });
    }

    if (selectedBrands.length > 0) {
      result = result.filter((product) =>
        selectedBrands.includes(
          product.brand?.trim() ?? ""
        )
      );
    }

    const minimum = Number(minPrice);
    const maximum = Number(maxPrice);

    if (
      minPrice &&
      !Number.isNaN(minimum)
    ) {
      result = result.filter(
        (product) =>
          Number(product.price ?? 0) >=
          minimum
      );
    }

    if (
      maxPrice &&
      !Number.isNaN(maximum)
    ) {
      result = result.filter(
        (product) =>
          Number(product.price ?? 0) <=
          maximum
      );
    }

    if (ratingFilter !== "0") {
      result = result.filter(
        (product) =>
          Number(product.rating ?? 0) >=
          Number(ratingFilter)
      );
    }

    if (stockOnly) {
      result = result.filter(
        (product) =>
          Number(product.stock ?? 0) > 0
      );
    }

    if (discountOnly) {
      result = result.filter(
        (product) => getDiscount(product) > 0
      );
    }

    if (flashOnly) {
      result = result.filter(
        (product) =>
          Boolean(product.is_flash_sale)
      );
    }

    if (featuredOnly) {
      result = result.filter(
        (product) =>
          Boolean(product.is_featured)
      );
    }

    /* SORT */

    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price ?? 0) -
          Number(b.price ?? 0)
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price ?? 0) -
          Number(a.price ?? 0)
      );
    }

    if (sort === "rating") {
      result.sort(
        (a, b) =>
          Number(b.rating ?? 0) -
          Number(a.rating ?? 0)
      );
    }

    if (sort === "reviews") {
      result.sort(
        (a, b) =>
          Number(b.reviews_count ?? 0) -
          Number(a.reviews_count ?? 0)
      );
    }

    if (sort === "discount") {
      result.sort(
        (a, b) =>
          getDiscount(b) -
          getDiscount(a)
      );
    }

    if (sort === "featured") {
      result.sort(
        (a, b) =>
          Number(Boolean(b.is_featured)) -
          Number(Boolean(a.is_featured))
      );
    }

    if (sort === "newest") {
      result.sort((a, b) => {
        return (
          new Date(
            b.created_at ?? 0
          ).getTime() -
          new Date(
            a.created_at ?? 0
          ).getTime()
        );
      });
    }

    return result;
  }, [
    products,
    search,
    selectedBrands,
    minPrice,
    maxPrice,
    ratingFilter,
    stockOnly,
    discountOnly,
    flashOnly,
    featuredOnly,
    sort,
  ]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    const total = products.length;

    const inStock = products.filter(
      (product) =>
        Number(product.stock ?? 0) > 0
    ).length;

    const flashDeals = products.filter(
      (product) =>
        Boolean(product.is_flash_sale)
    ).length;

    const discounted = products.filter(
      (product) =>
        getDiscount(product) > 0
    ).length;

    const averageRating =
      total > 0
        ? products.reduce(
            (sum, product) =>
              sum +
              Number(
                product.rating ?? 0
              ),
            0
          ) / total
        : 0;

    return {
      total,
      inStock,
      flashDeals,
      discounted,
      averageRating,
    };
  }, [products]);

  /* =========================================================
     ACTIVE FILTER COUNT
  ========================================================= */

  const activeFilterCount =
    selectedBrands.length +
    Number(Boolean(minPrice)) +
    Number(Boolean(maxPrice)) +
    Number(ratingFilter !== "0") +
    Number(stockOnly) +
    Number(discountOnly) +
    Number(flashOnly) +
    Number(featuredOnly);

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  function clearFilters() {
    setSearch("");
    setSelectedBrands([]);
    setMinPrice("");
    setMaxPrice("");
    setRatingFilter("0");
    setStockOnly(false);
    setDiscountOnly(false);
    setFlashOnly(false);
    setFeaturedOnly(false);
    setSort("featured");
  }

  /* =========================================================
     WISHLIST
  ========================================================= */

  function toggleWishlist(productId: string) {
    setWishlistIds((current) => {
      const exists = current.includes(
        productId
      );

      const next = exists
        ? current.filter(
            (id) => id !== productId
          )
        : [...current, productId];

      localStorage.setItem(
        "primecart_wishlist",
        JSON.stringify(next)
      );

      return next;
    });
  }

  /* =========================================================
     CART
  ========================================================= */

  function addToCart(product: Product) {
    try {
      const existing =
        localStorage.getItem(
          "primecart_cart"
        );

      const cart: CartItem[] =
        existing
          ? JSON.parse(existing)
          : [];

      const existingIndex =
        cart.findIndex(
          (item) =>
            item.id === product.id
        );

      if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: Number(
            product.price ?? 0
          ),
          original_price: Number(
            product.original_price ?? 0
          ),
          image_url: product.image_url,
          quantity: 1,
          stock: Number(
            product.stock ?? 0
          ),
        });
      }

      localStorage.setItem(
        "primecart_cart",
        JSON.stringify(cart)
      );

      const count = cart.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity ?? 0),
        0
      );

      setCartCount(count);

      window.dispatchEvent(
        new Event(
          "primecart-cart-updated"
        )
      );
    } catch (cartError) {
      console.error(
        "Cart error:",
        cartError
      );
    }
  }

  /* =========================================================
     RECENTLY VIEWED
  ========================================================= */

  function rememberProduct(productId: string) {
    setRecentIds((current) => {
      const next = [
        productId,
        ...current.filter(
          (id) => id !== productId
        ),
      ].slice(0, 8);

      localStorage.setItem(
        "primecart_recently_viewed",
        JSON.stringify(next)
      );

      return next;
    });
  }

  function openQuickView(product: Product) {
    rememberProduct(product.id);
    setQuickView(product);
  }

  /* =========================================================
     RECENT PRODUCTS
  ========================================================= */

  const recentProducts = useMemo(() => {
    return recentIds
      .map((id) =>
        products.find(
          (product) =>
            product.id === id
        )
      )
      .filter(Boolean) as Product[];
  }, [recentIds, products]);

  /* =========================================================
     FLASH PRODUCTS
  ========================================================= */

  const flashProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          product.is_flash_sale
      )
      .slice(0, 4);
  }, [products]);

  /* =========================================================
     RECOMMENDED PRODUCTS
  ========================================================= */

  const recommendedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const aScore =
          Number(a.rating ?? 0) * 2 +
          getDiscount(a) +
          Number(
            a.is_featured ? 10 : 0
          );

        const bScore =
          Number(b.rating ?? 0) * 2 +
          getDiscount(b) +
          Number(
            b.is_featured ? 10 : 0
          );

        return bScore - aScore;
      })
      .slice(0, 4);
  }, [products]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#171717] pb-20 lg:pb-0">
      {/* =====================================================
          TOP INFO STRIP
      ===================================================== */}

      <div className="hidden border-b border-[#eadfc9] bg-[#fffaf0] sm:block">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-2 text-[11px] font-semibold text-[#876a12] sm:px-8 lg:px-10">
          <span>
            Free shipping on eligible orders
          </span>

          <div className="flex items-center gap-5">
            <span>Easy Returns</span>
            <span>Secure Shopping</span>
            <span>
              PrimeCart Promise
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#eadfc9] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-4 px-5 sm:px-8 lg:px-10">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#d6b34a] to-[#b8872d] font-black text-white shadow-[0_5px_15px_rgba(184,135,45,0.2)]">
              P
            </div>

            <div className="hidden sm:block">
              <div className="text-xl font-black tracking-tight">
                Prime
                <span className="text-[#b8872d]">
                  Cart
                </span>
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                Shop Smarter
              </div>
            </div>
          </Link>

          {/* SEARCH */}
          <div className="mx-auto hidden max-w-2xl flex-1 md:block">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder={`Search in ${
                  category?.name ??
                  categoryNames[slug] ??
                  "this category"
                }...`}
                className="h-11 w-full rounded-xl border border-[#eadfc9] bg-[#faf9f5] pl-11 pr-10 text-sm font-medium outline-none transition focus:border-[#c9a227] focus:bg-white focus:ring-4 focus:ring-[#c9a227]/10"
              />

              {search && (
                <button
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full p-1 text-gray-400 transition hover:bg-[#fff8df] hover:text-[#987500]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard/categories"
              className="hidden items-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#c9a227] hover:bg-[#fffaf0] hover:text-[#8d6d00] sm:flex"
            >
              <ArrowLeft size={15} />
              Categories
            </Link>

            {/* CART */}
            <Link
              href="/dashboard/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-gray-700 transition hover:border-[#c9a227] hover:bg-[#fffaf0] hover:text-[#8d6d00]"
              aria-label="Cart"
            >
              <ShoppingCart size={19} />

              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c9a227] px-1 text-[10px] font-black text-white">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/products"
              className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-[#d1aa38] to-[#b8872d] px-4 py-2.5 text-sm font-bold text-white shadow-[0_7px_18px_rgba(184,135,45,0.18)] transition hover:-translate-y-0.5 md:flex"
            >
              All Products
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        {/* BREADCRUMB */}

        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link
            href="/dashboard"
            className="transition hover:text-[#a17c00]"
          >
            Dashboard
          </Link>

          <span className="text-gray-300">
            /
          </span>

          <Link
            href="/dashboard/categories"
            className="transition hover:text-[#a17c00]"
          >
            Categories
          </Link>

          <span className="text-gray-300">
            /
          </span>

          <span className="font-semibold text-gray-900">
            {category?.name ??
              categoryNames[slug] ??
              "Category"}
          </span>
        </div>

        {/* =====================================================
            CATEGORY HERO
        ===================================================== */}

        <section className="relative mb-7 overflow-hidden rounded-[30px] border border-[#eadfc9] bg-white shadow-[0_12px_45px_rgba(80,60,20,0.05)]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#d5b04a]/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#d5b04a]/10 blur-3xl" />

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ead9a6] bg-[#fffaf0] px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#927000]">
                <Sparkles size={13} />
                PrimeCart Collection
              </div>

              <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Shop{" "}
                <span className="text-[#b8872d]">
                  {category?.name ??
                    categoryNames[slug] ??
                    "Category"}
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
                Discover carefully selected products,
                exclusive deals and everyday essentials
                from this category.
              </p>

              {/* STATS */}

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatBox
                  icon={
                    <Package size={16} />
                  }
                  value={stats.total}
                  label="Products"
                />

                <StatBox
                  icon={
                    <Check size={16} />
                  }
                  value={stats.inStock}
                  label="In Stock"
                />

                <StatBox
                  icon={
                    <Zap size={16} />
                  }
                  value={stats.flashDeals}
                  label="Flash Deals"
                />

                <StatBox
                  icon={
                    <Star size={16} />
                  }
                  value={
                    stats.averageRating > 0
                      ? stats.averageRating.toFixed(
                          1
                        )
                      : "—"
                  }
                  label="Avg Rating"
                />
              </div>
            </div>

            <div className="hidden items-center justify-center lg:flex">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-[36px] border border-[#eadfc9] bg-[#fffaf0] shadow-inner">
                <div className="absolute inset-4 rounded-[28px] border border-[#ead9a6]" />

                <Sparkles
                  size={55}
                  strokeWidth={1.1}
                  className="text-[#c19a2e]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            MOBILE SEARCH
        ===================================================== */}

        <div className="mb-5 md:hidden">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search products..."
              className="h-12 w-full rounded-xl border border-[#eadfc9] bg-white pl-11 pr-10 text-sm outline-none focus:border-[#c9a227] focus:ring-4 focus:ring-[#c9a227]/10"
            />
          </div>
        </div>

        {/* =====================================================
            TOOLBAR
        ===================================================== */}

        <section className="mb-6 rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-[0_7px_25px_rgba(80,60,20,0.035)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">
                {loading
                  ? "Finding products..."
                  : `${filteredProducts.length} products found`}
              </p>

              {!loading &&
                products.length !==
                  filteredProducts.length && (
                  <p className="mt-1 text-xs text-gray-400">
                    Showing filtered results
                  </p>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  setMobileFilters(true)
                }
                className="inline-flex items-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-[#c9a227] hover:bg-[#fffaf0] hover:text-[#8d6d00] lg:hidden"
              >
                <SlidersHorizontal size={16} />

                Filters

                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c9a227] px-1.5 text-[10px] font-black text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(
                      e.target.value as SortValue
                    )
                  }
                  className="h-11 appearance-none rounded-xl border border-[#eadfc9] bg-white pl-4 pr-10 text-sm font-bold outline-none transition focus:border-[#c9a227] focus:ring-4 focus:ring-[#c9a227]/10"
                >
                  <option value="featured">
                    Recommended
                  </option>

                  <option value="newest">
                    Newest
                  </option>

                  <option value="rating">
                    Top Rated
                  </option>

                  <option value="reviews">
                    Most Reviewed
                  </option>

                  <option value="discount">
                    Biggest Discount
                  </option>

                  <option value="price-low">
                    Price: Low to High
                  </option>

                  <option value="price-high">
                    Price: High to Low
                  </option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* APPLIED FILTERS */}

          {activeFilterCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#f0eadc] pt-4">
              {selectedBrands.map(
                (brand) => (
                  <FilterChip
                    key={brand}
                    label={brand}
                    onRemove={() =>
                      setSelectedBrands(
                        (current) =>
                          current.filter(
                            (item) =>
                              item !== brand
                          )
                      )
                    }
                  />
                )
              )}

              {minPrice && (
                <FilterChip
                  label={`Min ₹${minPrice}`}
                  onRemove={() =>
                    setMinPrice("")
                  }
                />
              )}

              {maxPrice && (
                <FilterChip
                  label={`Max ₹${maxPrice}`}
                  onRemove={() =>
                    setMaxPrice("")
                  }
                />
              )}

              {ratingFilter !== "0" && (
                <FilterChip
                  label={`${ratingFilter}★ & above`}
                  onRemove={() =>
                    setRatingFilter("0")
                  }
                />
              )}

              {stockOnly && (
                <FilterChip
                  label="In Stock"
                  onRemove={() =>
                    setStockOnly(false)
                  }
                />
              )}

              {discountOnly && (
                <FilterChip
                  label="Discounted"
                  onRemove={() =>
                    setDiscountOnly(false)
                  }
                />
              )}

              {flashOnly && (
                <FilterChip
                  label="Flash Sale"
                  onRemove={() =>
                    setFlashOnly(false)
                  }
                />
              )}

              {featuredOnly && (
                <FilterChip
                  label="Featured"
                  onRemove={() =>
                    setFeaturedOnly(false)
                  }
                />
              )}

              <button
                onClick={clearFilters}
                className="ml-1 inline-flex items-center gap-1 text-xs font-bold text-[#9a7800] hover:underline"
              >
                <RotateCcw size={12} />
                Clear all
              </button>
            </div>
          )}
        </section>

        {/* =====================================================
            MAIN PRODUCT AREA
        ===================================================== */}

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* DESKTOP FILTER */}

          <aside className="hidden lg:block">
            <FilterPanel
              brands={brands}
              selectedBrands={
                selectedBrands
              }
              setSelectedBrands={
                setSelectedBrands
              }
              minPrice={minPrice}
              maxPrice={maxPrice}
              priceBounds={priceBounds}
              ratingFilter={ratingFilter}
              stockOnly={stockOnly}
              discountOnly={
                discountOnly
              }
              flashOnly={flashOnly}
              featuredOnly={
                featuredOnly
              }
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              setRatingFilter={
                setRatingFilter
              }
              setStockOnly={setStockOnly}
              setDiscountOnly={
                setDiscountOnly
              }
              setFlashOnly={
                setFlashOnly
              }
              setFeaturedOnly={
                setFeaturedOnly
              }
              clearFilters={
                clearFilters
              }
            />
          </aside>

          <div>
            {/* LOADING */}

            {loading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({
                  length: 8,
                }).map((_, index) => (
                  <ProductSkeleton
                    key={index}
                  />
                ))}
              </div>
            )}

            {/* ERROR */}

            {!loading && error && (
              <div className="rounded-[28px] border border-red-100 bg-white p-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <X size={27} />
                </div>

                <h2 className="text-xl font-black">
                  Something went wrong
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
                  {error}
                </p>

                <Link
                  href="/dashboard/categories"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d1aa38] to-[#b8872d] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"
                >
                  <ArrowLeft size={16} />
                  Back to Categories
                </Link>
              </div>
            )}

            {/* EMPTY */}

            {!loading &&
              !error &&
              filteredProducts.length ===
                0 && (
                <div className="rounded-[28px] border border-[#eadfc9] bg-white px-6 py-16 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff8df] text-[#b8872d]">
                    <Search size={27} />
                  </div>

                  <h2 className="text-2xl font-black">
                    No products found
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                    Try changing your search
                    or filters to discover
                    more products.
                  </p>

                  <button
                    onClick={
                      clearFilters
                    }
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d1aa38] to-[#b8872d] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"
                  >
                    <RotateCcw
                      size={15}
                    />
                    Clear Filters
                  </button>
                </div>
              )}

            {/* PRODUCT GRID */}

            {!loading &&
              !error &&
              filteredProducts.length >
                0 && (
                <>
                  <div className="mb-5 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Showing{" "}
                      <span className="font-black text-gray-900">
                        {
                          filteredProducts.length
                        }
                      </span>{" "}
                      products
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map(
                      (product) => (
                        <ProductCard
                          key={
                            product.id
                          }
                          product={
                            product
                          }
                          wishlist={
                            wishlistIds.includes(
                              product.id
                            )
                          }
                          onWishlist={() =>
                            toggleWishlist(
                              product.id
                            )
                          }
                          onAddToCart={() =>
                            addToCart(
                              product
                            )
                          }
                          onQuickView={() =>
                            openQuickView(
                              product
                            )
                          }
                        />
                      )
                    )}
                  </div>
                </>
              )}
          </div>
        </div>

        {/* =====================================================
            FLASH DEALS
        ===================================================== */}

        {!loading &&
          !error &&
          flashProducts.length > 0 && (
            <section className="mt-14">
              <SectionHeading
                icon={
                  <Zap
                    size={18}
                    fill="currentColor"
                  />
                }
                title="Flash Deals"
                subtitle="Limited-time offers picked from this category."
                href="#"
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {flashProducts.map(
                  (product) => (
                    <MiniProductCard
                      key={
                        product.id
                      }
                      product={
                        product
                      }
                      onAddToCart={() =>
                        addToCart(
                          product
                        )
                      }
                      onQuickView={() =>
                        openQuickView(
                          product
                        )
                      }
                    />
                  )
                )}
              </div>
            </section>
          )}

        {/* =====================================================
            RECOMMENDED
        ===================================================== */}

        {!loading &&
          !error &&
          recommendedProducts.length >
            0 && (
            <section className="mt-14">
              <SectionHeading
                icon={
                  <Sparkles size={18} />
                }
                title="You May Also Like"
                subtitle="Popular products based on ratings, offers and featured picks."
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {recommendedProducts.map(
                  (product) => (
                    <MiniProductCard
                      key={
                        product.id
                      }
                      product={
                        product
                      }
                      onAddToCart={() =>
                        addToCart(
                          product
                        )
                      }
                      onQuickView={() =>
                        openQuickView(
                          product
                        )
                      }
                    />
                  )
                )}
              </div>
            </section>
          )}

        {/* =====================================================
            RECENTLY VIEWED
        ===================================================== */}

        {!loading &&
          recentProducts.length > 0 && (
            <section className="mt-14">
              <SectionHeading
                icon={
                  <Eye size={18} />
                }
                title="Recently Viewed"
                subtitle="Products you've recently opened."
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {recentProducts
                  .slice(0, 4)
                  .map((product) => (
                    <MiniProductCard
                      key={
                        product.id
                      }
                      product={
                        product
                      }
                      onAddToCart={() =>
                        addToCart(
                          product
                        )
                      }
                      onQuickView={() =>
                        openQuickView(
                          product
                        )
                      }
                    />
                  ))}
              </div>
            </section>
          )}
      </div>

      {/* =====================================================
          MOBILE FILTER DRAWER
      ===================================================== */}

      {mobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            aria-label="Close filters"
            onClick={() =>
              setMobileFilters(false)
            }
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-[30px] border-t border-[#eadfc9] bg-[#faf8f3] p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black">
                  Filters
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Refine your products
                </p>
              </div>

              <button
                onClick={() =>
                  setMobileFilters(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfc9] bg-white text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <FilterPanel
              brands={brands}
              selectedBrands={
                selectedBrands
              }
              setSelectedBrands={
                setSelectedBrands
              }
              minPrice={minPrice}
              maxPrice={maxPrice}
              priceBounds={priceBounds}
              ratingFilter={ratingFilter}
              stockOnly={stockOnly}
              discountOnly={
                discountOnly
              }
              flashOnly={flashOnly}
              featuredOnly={
                featuredOnly
              }
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              setRatingFilter={
                setRatingFilter
              }
              setStockOnly={setStockOnly}
              setDiscountOnly={
                setDiscountOnly
              }
              setFlashOnly={
                setFlashOnly
              }
              setFeaturedOnly={
                setFeaturedOnly
              }
              clearFilters={
                clearFilters
              }
            />

            <button
              onClick={() =>
                setMobileFilters(false)
              }
              className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#d1aa38] to-[#b8872d] text-sm font-black text-white shadow-[0_8px_20px_rgba(184,135,45,0.2)]"
            >
              Show{" "}
              {
                filteredProducts.length
              }{" "}
              Products
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          QUICK VIEW
      ===================================================== */}

      {quickView && (
        <QuickView
          product={quickView}
          onClose={() =>
            setQuickView(null)
          }
          onAddToCart={() =>
            addToCart(quickView)
          }
        />
      )}

      {/* =====================================================
          MOBILE BOTTOM BAR
      ===================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#eadfc9] bg-white/95 p-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-3 gap-2">
          <button
            onClick={() =>
              setMobileFilters(true)
            }
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#eadfc9] bg-white text-sm font-bold text-gray-700"
          >
            <Filter size={16} />

            Filter

            {activeFilterCount > 0 && (
              <span className="rounded-full bg-[#c9a227] px-1.5 py-0.5 text-[10px] text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) =>
                setSort(
                  e.target.value as SortValue
                )
              }
              className="h-12 w-full appearance-none rounded-xl border border-[#eadfc9] bg-white px-3 text-center text-sm font-bold outline-none"
            >
              <option value="featured">
                Recommended
              </option>

              <option value="newest">
                Newest
              </option>

              <option value="rating">
                Top Rated
              </option>

              <option value="discount">
                Discount
              </option>

              <option value="price-low">
                Price Low
              </option>

              <option value="price-high">
                Price High
              </option>
            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          <Link
            href="/dashboard/cart"
            className="relative flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d1aa38] to-[#b8872d] text-sm font-black text-white"
          >
            <ShoppingCart
              size={17}
            />
            Cart

            {cartCount > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   STAT BOX
========================================================= */

function StatBox({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-3.5">
      <div className="mb-2 flex items-center gap-2 text-[#b8872d]">
        {icon}

        <span className="text-lg font-black text-gray-900">
          {value}
        </span>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   FILTER PANEL
========================================================= */

function FilterPanel({
  brands,
  selectedBrands,
  setSelectedBrands,
  minPrice,
  maxPrice,
  priceBounds,
  ratingFilter,
  stockOnly,
  discountOnly,
  flashOnly,
  featuredOnly,
  setMinPrice,
  setMaxPrice,
  setRatingFilter,
  setStockOnly,
  setDiscountOnly,
  setFlashOnly,
  setFeaturedOnly,
  clearFilters,
}: {
  brands: string[];
  selectedBrands: string[];
  setSelectedBrands: (
    value: string[] | ((current: string[]) => string[])
  ) => void;
  minPrice: string;
  maxPrice: string;
  priceBounds: {
    min: number;
    max: number;
  };
  ratingFilter: string;
  stockOnly: boolean;
  discountOnly: boolean;
  flashOnly: boolean;
  featuredOnly: boolean;
  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;
  setRatingFilter: (value: string) => void;
  setStockOnly: (value: boolean) => void;
  setDiscountOnly: (value: boolean) => void;
  setFlashOnly: (value: boolean) => void;
  setFeaturedOnly: (value: boolean) => void;
  clearFilters: () => void;
}) {
  function toggleBrand(brand: string) {
    setSelectedBrands((current) =>
      current.includes(brand)
        ? current.filter(
            (item) => item !== brand
          )
        : [...current, brand]
    );
  }

  return (
    <div className="rounded-[24px] border border-[#eadfc9] bg-white p-5 shadow-[0_8px_28px_rgba(80,60,20,0.035)]">
      {/* HEADER */}

      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={17}
            className="text-[#b8872d]"
          />

          <h3 className="font-black">
            Filters
          </h3>
        </div>

        <button
          onClick={clearFilters}
          className="text-xs font-bold text-[#9a7800] hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {/* BRAND */}

        {brands.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-bold">
              Brand
            </p>

            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {brands.map((brand) => {
                const active =
                  selectedBrands.includes(
                    brand
                  );

                return (
                  <button
                    key={brand}
                    onClick={() =>
                      toggleBrand(
                        brand
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? "border-[#c9a227] bg-[#fff8df] text-[#8d6d00]"
                        : "border-transparent text-gray-600 hover:border-[#eadfc9] hover:bg-[#fffaf0]"
                    }`}
                  >
                    <span className="truncate">
                      {brand}
                    </span>

                    {active && (
                      <Check
                        size={15}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PRICE */}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold">
              Price Range
            </p>

            {priceBounds.max > 0 && (
              <span className="text-[10px] text-gray-400">
                Up to{" "}
                {formatPrice(
                  priceBounds.max
                )}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) =>
                setMinPrice(
                  e.target.value
                )
              }
              placeholder="Min"
              className="h-10 w-full rounded-xl border border-[#eadfc9] bg-[#faf9f5] px-3 text-sm outline-none focus:border-[#c9a227]"
            />

            <input
              type="number"
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(
                  e.target.value
                )
              }
              placeholder="Max"
              className="h-10 w-full rounded-xl border border-[#eadfc9] bg-[#faf9f5] px-3 text-sm outline-none focus:border-[#c9a227]"
            />
          </div>
        </div>

        {/* RATING */}

        <div>
          <p className="mb-3 text-sm font-bold">
            Customer Rating
          </p>

          <div className="space-y-2">
            {["4", "3", "2"].map(
              (value) => {
                const active =
                  ratingFilter ===
                  value;

                return (
                  <button
                    key={value}
                    onClick={() =>
                      setRatingFilter(
                        active
                          ? "0"
                          : value
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition ${
                      active
                        ? "border-[#c9a227] bg-[#fff8df] text-[#8d6d00]"
                        : "border-[#eadfc9] bg-white text-gray-600 hover:bg-[#fffaf0]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Star
                        size={14}
                        fill={
                          active
                            ? "currentColor"
                            : "none"
                        }
                      />

                      {value}★ & above
                    </span>

                    {active && (
                      <Check
                        size={15}
                      />
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* AVAILABILITY */}

        <div>
          <p className="mb-3 text-sm font-bold">
            Availability
          </p>

          <FilterToggle
            active={stockOnly}
            onClick={() =>
              setStockOnly(
                !stockOnly
              )
            }
            icon={
              <Truck size={15} />
            }
            label="In stock only"
          />
        </div>

        {/* OFFERS */}

        <div>
          <p className="mb-3 text-sm font-bold">
            Offers
          </p>

          <div className="space-y-2">
            <FilterToggle
              active={
                discountOnly
              }
              onClick={() =>
                setDiscountOnly(
                  !discountOnly
                )
              }
              icon={
                <BadgePercent
                  size={15}
                />
              }
              label="Discounted products"
            />

            <FilterToggle
              active={flashOnly}
              onClick={() =>
                setFlashOnly(
                  !flashOnly
                )
              }
              icon={
                <Zap
                  size={15}
                />
              }
              label="Flash Sale"
            />

            <FilterToggle
              active={
                featuredOnly
              }
              onClick={() =>
                setFeaturedOnly(
                  !featuredOnly
                )
              }
              icon={
                <Sparkles
                  size={15}
                />
              }
              label="Featured"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FILTER TOGGLE
========================================================= */

function FilterToggle({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition ${
        active
          ? "border-[#c9a227] bg-[#fff8df] text-[#8d6d00]"
          : "border-[#eadfc9] bg-white text-gray-600 hover:bg-[#fffaf0]"
      }`}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>

      {active && (
        <Check size={15} />
      )}
    </button>
  );
}

/* =========================================================
   FILTER CHIP
========================================================= */

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#ead9a6] bg-[#fffaf0] px-3 py-1.5 text-xs font-bold text-[#927000]"
    >
      {label}

      <X size={12} />
    </button>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  wishlist,
  onWishlist,
  onAddToCart,
  onQuickView,
}: {
  product: Product;
  wishlist: boolean;
  onWishlist: () => void;
  onAddToCart: () => void;
  onQuickView: () => void;
}) {
  const [imageIndex, setImageIndex] =
    useState(0);

  const [added, setAdded] =
    useState(false);

  const candidates =
    getImageCandidates(
      product.image_url
    );

  const image =
    candidates[imageIndex] ?? null;

  const price = Number(
    product.price ?? 0
  );

  const original = Number(
    product.original_price ?? 0
  );

  const discount =
    getDiscount(product);

  const stock = getStockInfo(
    product.stock
  );

  function handleImageError() {
    if (
      imageIndex <
      candidates.length - 1
    ) {
      setImageIndex(
        (current) =>
          current + 1
      );
    } else {
      setImageIndex(
        candidates.length
      );
    }
  }

  function handleCart() {
    onAddToCart();

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1300);
  }

  return (
    <article className="group overflow-hidden rounded-[26px] border border-[#eadfc9] bg-white shadow-[0_8px_30px_rgba(80,60,20,0.045)] transition duration-300 hover:-translate-y-1.5 hover:border-[#ddc57e] hover:shadow-[0_20px_50px_rgba(80,60,20,0.11)]">
      {/* IMAGE */}

      <div className="relative aspect-square overflow-hidden bg-[#f9f7f1]">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-[1.05]"
            onError={
              handleImageError
            }
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
            <ImageOff
              size={35}
              strokeWidth={1.5}
            />

            <span className="mt-2 text-xs font-semibold">
              Image unavailable
            </span>

            <span className="mt-1 max-w-[80%] truncate text-[10px] text-gray-300">
              {product.image_url ??
                "No image"}
            </span>
          </div>
        )}

        {/* BADGES */}

        <div className="absolute left-4 top-4 flex max-w-[75%] flex-col items-start gap-2">
          {product.is_flash_sale && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0d4] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#a45c00] shadow-sm">
              <Zap
                size={11}
                fill="currentColor"
              />
              Flash Sale
            </span>
          )}

          {discount > 0 && (
            <span className="rounded-full bg-[#c9a227] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* WISHLIST */}

        <button
          onClick={onWishlist}
          aria-label="Wishlist"
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition ${
            wishlist
              ? "border-red-100 bg-red-50 text-red-500"
              : "border-white/80 bg-white/90 text-gray-600 hover:border-[#ead9a6] hover:bg-[#fffaf0] hover:text-red-500"
          }`}
        >
          <Heart
            size={18}
            fill={
              wishlist
                ? "currentColor"
                : "none"
            }
          />
        </button>

        {/* QUICK VIEW */}

        <button
          onClick={onQuickView}
          className="absolute bottom-4 left-4 flex translate-y-3 items-center gap-1.5 rounded-xl border border-[#eadfc9] bg-white/95 px-3.5 py-2 text-xs font-bold text-gray-700 opacity-0 shadow-sm backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#fffaf0] hover:text-[#8d6d00]"
        >
          <Eye size={14} />
          Quick View
        </button>

        {/* CART */}

        <button
          onClick={handleCart}
          disabled={
            Number(product.stock ?? 0) <=
            0
          }
          aria-label="Add to cart"
          className={`absolute bottom-4 right-4 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full shadow-lg transition duration-300 group-hover:translate-y-0 ${
            Number(product.stock ?? 0) <=
            0
              ? "cursor-not-allowed bg-gray-200 text-gray-400"
              : added
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-[#d1aa38] to-[#b8872d] text-white hover:scale-105"
          }`}
        >
          {added ? (
            <Check size={17} />
          ) : (
            <ShoppingCart
              size={17}
            />
          )}
        </button>
      </div>

      {/* INFO */}

      <div className="p-5">
        {product.brand && (
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#a17c00]">
            {product.brand}
          </p>
        )}

        <Link
          href={`/dashboard/products/${product.id}`}
          className="line-clamp-2 text-[17px] font-extrabold leading-6 tracking-tight transition hover:text-[#a17c00]"
        >
          {product.name}
        </Link>

        {product.short_description && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
            {
              product.short_description
            }
          </p>
        )}

        {/* RATING */}

        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-[#fff7d9] px-2 py-1 text-xs font-bold text-[#856600]">
            <Star
              size={12}
              fill="currentColor"
            />

            {Number(
              product.rating ?? 0
            ).toFixed(1)}
          </div>

          <span className="text-xs text-gray-400">
            {product.reviews_count ??
              0}{" "}
            reviews
          </span>
        </div>

        {/* PRICE */}

        <div className="mt-4 flex flex-wrap items-end gap-2">
          <span className="text-xl font-black">
            {formatPrice(price)}
          </span>

          {original > price && (
            <span className="pb-0.5 text-sm text-gray-400 line-through">
              {formatPrice(
                original
              )}
            </span>
          )}
        </div>

        {discount > 0 && (
          <p className="mt-1 text-xs font-black text-emerald-600">
            Save{" "}
            {formatPrice(
              original - price
            )}
          </p>
        )}

        {/* STOCK */}

        <div className="mt-3 flex items-center justify-between">
          <span
            className={`text-xs font-bold ${stock.className}`}
          >
            {stock.label}
          </span>

          {product.is_featured && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#a17c00]">
              <Sparkles
                size={11}
              />
              Featured
            </span>
          )}
        </div>

        {/* VIEW */}

        <Link
          href={`/dashboard/products/${product.id}`}
          className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border border-[#eadfc9] text-sm font-bold text-gray-700 transition hover:border-[#c9a227] hover:bg-[#fffaf0] hover:text-[#927000]"
        >
          View Product
          <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}

/* =========================================================
   MINI PRODUCT CARD
========================================================= */

function MiniProductCard({
  product,
  onAddToCart,
  onQuickView,
}: {
  product: Product;
  onAddToCart: () => void;
  onQuickView: () => void;
}) {
  const [imageIndex, setImageIndex] =
    useState(0);

  const candidates =
    getImageCandidates(
      product.image_url
    );

  const image =
    candidates[imageIndex] ?? null;

  const discount =
    getDiscount(product);

  const price = Number(
    product.price ?? 0
  );

  const original = Number(
    product.original_price ?? 0
  );

  function handleImageError() {
    if (
      imageIndex <
      candidates.length - 1
    ) {
      setImageIndex(
        (current) =>
          current + 1
      );
    } else {
      setImageIndex(
        candidates.length
      );
    }
  }

  return (
    <div className="group overflow-hidden rounded-[24px] border border-[#eadfc9] bg-white shadow-[0_7px_25px_rgba(80,60,20,0.035)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(80,60,20,0.08)]">
      <div className="relative aspect-square overflow-hidden bg-[#f9f7f1]">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105"
            onError={
              handleImageError
            }
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <ImageOff size={30} />
          </div>
        )}

        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-[#c9a227] px-2.5 py-1 text-[9px] font-black text-white">
            {discount}% OFF
          </span>
        )}

        <button
          onClick={onQuickView}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfc9] bg-white/95 text-gray-600 opacity-0 shadow-sm transition group-hover:opacity-100 hover:bg-[#fffaf0] hover:text-[#8d6d00]"
        >
          <Eye size={15} />
        </button>
      </div>

      <div className="p-4">
        {product.brand && (
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#a17c00]">
            {product.brand}
          </p>
        )}

        <Link
          href={`/dashboard/products/${product.id}`}
          className="mt-1 block line-clamp-2 text-sm font-extrabold leading-5 hover:text-[#a17c00]"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-center gap-1 text-xs text-[#856600]">
          <Star
            size={11}
            fill="currentColor"
          />
          {Number(
            product.rating ?? 0
          ).toFixed(1)}
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-base font-black">
            {formatPrice(price)}
          </span>

          {original > price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(
                original
              )}
            </span>
          )}
        </div>

        <button
          onClick={onAddToCart}
          disabled={
            Number(product.stock ?? 0) <=
            0
          }
          className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d1aa38] to-[#b8872d] text-xs font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          <ShoppingCart
            size={14}
          />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  href?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[#b8872d]">
            {icon}
          </span>

          <h2 className="text-2xl font-black tracking-tight">
            {title}
          </h2>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   QUICK VIEW
========================================================= */

function QuickView({
  product,
  onClose,
  onAddToCart,
}: {
  product: Product;
  onClose: () => void;
  onAddToCart: () => void;
}) {
  const [imageIndex, setImageIndex] =
    useState(0);

  const [added, setAdded] =
    useState(false);

  const candidates =
    getImageCandidates(
      product.image_url
    );

  const image =
    candidates[imageIndex] ?? null;

  const price = Number(
    product.price ?? 0
  );

  const original = Number(
    product.original_price ?? 0
  );

  const discount =
    getDiscount(product);

  function handleImageError() {
    if (
      imageIndex <
      candidates.length - 1
    ) {
      setImageIndex(
        (current) =>
          current + 1
      );
    } else {
      setImageIndex(
        candidates.length
      );
    }
  }

  function handleCart() {
    onAddToCart();

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1400);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        aria-label="Close quick view"
        onClick={onClose}
        className="absolute inset-0 bg-black/25 backdrop-blur-sm"
      />

      <div className="relative z-10 grid max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[30px] border border-[#eadfc9] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.2)] md:grid-cols-2">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfc9] bg-white text-gray-500 shadow-sm transition hover:bg-[#fffaf0] hover:text-[#8d6d00]"
        >
          <X size={18} />
        </button>

        {/* IMAGE */}

        <div className="flex min-h-[330px] items-center justify-center bg-[#f9f7f1] p-8 md:min-h-[560px]">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="max-h-[480px] w-full object-contain"
              onError={
                handleImageError
              }
            />
          ) : (
            <div className="text-center text-gray-400">
              <ImageOff
                size={42}
                className="mx-auto"
              />

              <p className="mt-2 text-sm">
                Image unavailable
              </p>
            </div>
          )}
        </div>

        {/* DETAILS */}

        <div className="overflow-y-auto p-7 sm:p-9">
          {product.is_flash_sale && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#fff0d4] px-3 py-1.5 text-xs font-black text-[#a45c00]">
              <Zap
                size={13}
                fill="currentColor"
              />
              Flash Sale
            </div>
          )}

          {product.brand && (
            <p className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-[#a17c00]">
              {product.brand}
            </p>
          )}

          <h2 className="text-2xl font-black leading-tight sm:text-3xl">
            {product.name}
          </h2>

          {/* RATING */}

          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md bg-[#fff7d9] px-2 py-1 text-xs font-bold text-[#856600]">
              <Star
                size={12}
                fill="currentColor"
              />

              {Number(
                product.rating ?? 0
              ).toFixed(1)}
            </div>

            <span className="text-xs text-gray-400">
              {product.reviews_count ??
                0}{" "}
              reviews
            </span>
          </div>

          {/* PRICE */}

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <span className="text-3xl font-black">
              {formatPrice(price)}
            </span>

            {original > price && (
              <>
                <span className="text-base text-gray-400 line-through">
                  {formatPrice(
                    original
                  )}
                </span>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-600">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {original > price && (
            <p className="mt-2 text-sm font-bold text-emerald-600">
              You save{" "}
              {formatPrice(
                original - price
              )}
            </p>
          )}

          {/* DESCRIPTION */}

          {product.short_description && (
            <p className="mt-5 text-sm leading-7 text-gray-500">
              {
                product.short_description
              }
            </p>
          )}

          {product.description && (
            <p className="mt-3 line-clamp-5 text-sm leading-7 text-gray-500">
              {product.description}
            </p>
          )}

          {/* BENEFITS */}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Benefit
              icon={
                <Package
                  size={17}
                />
              }
              title="Availability"
              value={
                Number(
                  product.stock ?? 0
                ) > 0
                  ? "In Stock"
                  : "Out of Stock"
              }
            />

            <Benefit
              icon={
                <Truck size={17} />
              }
              title="Delivery"
              value="Easy Delivery"
            />

            <Benefit
              icon={
                <RotateCcw
                  size={17}
                />
              }
              title="Returns"
              value="Easy Returns"
            />

            <Benefit
              icon={
                <Sparkles
                  size={17}
                />
              }
              title="PrimeCart"
              value="Verified Pick"
            />
          </div>

          {/* ACTIONS */}

          <div className="mt-7 grid grid-cols-2 gap-3">
            <button
              onClick={handleCart}
              disabled={
                Number(
                  product.stock ?? 0
                ) <= 0
              }
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#c9a227] bg-[#fffaf0] text-sm font-black text-[#8d6d00] transition hover:bg-[#fff5d6] disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
            >
              {added ? (
                <>
                  <Check size={17} />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart
                    size={17}
                  />
                  Add to Cart
                </>
              )}
            </button>

            <Link
              href={`/dashboard/products/${product.id}`}
              onClick={onClose}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d1aa38] to-[#b8872d] text-sm font-black text-white shadow-[0_8px_20px_rgba(184,135,45,0.2)] transition hover:-translate-y-0.5"
            >
              Buy / View
              <ArrowRight
                size={16}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BENEFIT
========================================================= */

function Benefit({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-3">
      <div className="mb-2 text-[#b8872d]">
        {icon}
      </div>

      <p className="text-xs text-gray-400">
        {title}
      </p>

      <p className="mt-1 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-[#eadfc9] bg-white">
      <div className="aspect-square animate-pulse bg-[#f1eee7]" />

      <div className="space-y-3 p-5">
        <div className="h-3 w-20 animate-pulse rounded bg-[#eeeae1]" />

        <div className="h-5 w-4/5 animate-pulse rounded bg-[#eeeae1]" />

        <div className="h-4 w-3/5 animate-pulse rounded bg-[#eeeae1]" />

        <div className="h-6 w-28 animate-pulse rounded bg-[#eeeae1]" />

        <div className="h-10 w-full animate-pulse rounded-xl bg-[#eeeae1]" />
      </div>
    </div>
  );
}
