
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// React hooks.
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

// Animations.
import { motion, type Variants } from "framer-motion";

// Icons.
import {
  ArrowRight,
  BarChart3,
  Baby,
  Car,
  CheckCircle2,
  Eye,
  Footprints,
  Gamepad2,
  Heart,
  Home,
  Layers3,
  Menu,
  Package,
  Search,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  WashingMachine,
  UserRound,
  Watch,
  X,
  Zap,
} from "lucide-react";

// Existing Supabase client — project connection कायम.
import { createClient } from "@/lib/supabase/client";

// -------------------- TYPES --------------------

// Category च्या नावापासून image, slug आणि keywords पर्यंतची माहिती.
type Category = {
  name: string;
  slug: string;
  description: string;
  icon: React.ElementType;
  image: string;
  keywords: string[];
};

// Supabase products table मधून वापरली जाणारी fields.
type Product = {
  id: string;
  category_id: string | null;
  name: string;
  image_url: string | null;
  price: number | null;
  original_price?: number | null;
  rating: number | null;
  stock?: number | null;
  is_flash_sale: boolean | null;
  category_slug?: string;
};

// एका category चे सर्व calculated statistics.
type CategoryStats = {
  products: Product[];
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  flashDeals: number;
  averageRating: number;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  discountPercentage: number;
};

// -------------------- CATEGORY MASTER DATA --------------------
// महत्त्वाचे: प्रत्येक slug हा database मधील categories.slug शी
// match झाला पाहिजे. Slug वेगळा असल्यास count चुकीचा दिसू शकतो.

const categories: Category[] = [
  {
    name: "Home & Living",
    slug: "home-living",
    description:
      "Furniture, decor, kitchen essentials and everyday products for a better home.",
    icon: Home,
    image: "/home.png",
    keywords: ["home", "living", "furniture", "decor", "kitchen"],
  },
  {
    name: "Mobiles",
    slug: "mobiles",
    description:
      "Smartphones, accessories and mobile essentials for everyday connectivity.",
    icon: Smartphone,
    image: "/mobiles.png",
    keywords: ["mobile", "phone", "smartphone", "electronics"],
  },
  {
    name: "Appliances",
    slug: "appliances",
    description:
      "Smart appliances designed to make everyday tasks easier and faster.",
    icon: WashingMachine,
    image: "/appliances.png",
    keywords: ["appliance", "air fryer", "kitchen", "electric"],
  },
  {
    name: "Footwear",
    slug: "footwear",
    description:
      "Sneakers, running shoes, sandals and footwear for every occasion.",
    icon: Footprints,
    image: "/footware.png",
    keywords: ["footwear", "shoes", "sneakers", "running"],
  },
  {
    name: "Watch",
    slug: "watch",
    description:
      "Classic watches and smart timepieces designed for every style.",
    icon: Watch,
    image: "/watch.png",
    keywords: ["watch", "smartwatch", "time", "accessories"],
  },
  {
    name: "Bag",
    slug: "bag",
    description:
      "Backpacks, handbags, travel bags and everyday carry essentials.",
    icon: ShoppingBag,
    image: "/bag.png",
    keywords: ["bag", "backpack", "travel", "handbag"],
  },
  {
    name: "Toy & Baby",
    slug: "toy-baby",
    description:
      "Toys, baby products and thoughtful essentials for little ones.",
    icon: Baby,
    image: "/toy.png",
    keywords: ["toy", "baby", "kids", "children"],
  },
  {
    name: "Automotive",
    slug: "automotive",
    description:
      "Useful car and bike accessories for safer and smarter journeys.",
    icon: Car,
    image: "/automative.png",
    keywords: ["car", "bike", "automotive", "vehicle"],
  },
  {
    name: "Fashion",
    slug: "fashion",
    description:
      "Clothing and lifestyle essentials designed around your style.",
    icon: Shirt,
    image: "/fashion.png",
    keywords: ["fashion", "clothing", "shirt", "jacket"],
  },
  {
    name: "Gaming",
    slug: "gaming",
    description:
      "Gaming accessories, gear and entertainment essentials.",
    icon: Gamepad2,
    image: "/gaming.png",
    keywords: ["gaming", "game", "console", "accessories"],
  },
  {
    name: "Sports & Outdoor",
    slug: "sports-outdoor",
    description:
      "Sports equipment, fitness gear, outdoor adventure and active lifestyle essentials.",
    icon: Footprints,
    image: "/sports-outdoor.png",
    keywords: [
      "sports",
      "outdoor",
      "fitness",
      "gym",
      "cricket",
      "football",
      "badminton",
      "cycling",
      "camping",
      "exercise",
    ],
  },
  {
    name: "Eyewear",
    slug: "eyewear",
    description:
      "Sunglasses, eyeglasses and stylish eyewear for everyday comfort and protection.",
    icon: Eye,
    image: "/eyeware.png",
    keywords: [
      "eyewear",
      "glasses",
      "sunglasses",
      "spectacles",
      "frames",
      "optical",
    ],
  },
  {
    name: "Books",
    slug: "books",
    description:
      "Bestsellers, educational books, fiction, non-fiction and books for every reader.",
    icon: Layers3,
    image: "/books.png",
    keywords: [
      "books",
      "book",
      "fiction",
      "non-fiction",
      "education",
      "novels",
      "reading",
    ],
  },
  {
    name: "Beauty",
    slug: "beauty",
    description:
      "Skincare, makeup, haircare, fragrances and everyday beauty essentials.",
    icon: Sparkles,
    image: "/beauty.png",
    keywords: [
      "beauty",
      "skincare",
      "makeup",
      "cosmetics",
      "haircare",
      "fragrance",
      "personal care",
    ],
  },
  {
    name: "Electronics",
    slug: "electronics",
    description:
      "Smart electronics, audio devices, accessories and everyday tech essentials.",
    icon: Smartphone,
    image: "/electronics.png",
    keywords: [
      "electronics",
      "electronic",
      "gadgets",
      "audio",
      "speaker",
      "headphones",
      "tech",
      "accessories",
    ],
  },
];

// -------------------- ANIMATION CONFIGURATION --------------------
// Framer Motion animation reusable variants.

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045 },
  },
};

// -------------------- HELPER FUNCTIONS --------------------

// Product image path normalize करतो.
// Database मध्ये filename किंवा /filename दोन्ही चालतात.
function getImage(src?: string | null) {
  if (!src?.trim()) return "/logo.png";

  const value = src.trim();

  if (
    value.startsWith("/") ||
    /^https?:\/\//i.test(value)
  ) {
    return value;
  }

  return `/${value}`;
}

// Indian Rupee format.
function money(value: number | null | undefined) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

// Null, undefined किंवा invalid number सुरक्षितपणे 0 करतो.
function safeNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

// localStorage मधून array safely read करतो.
function readStoredArray(key: string): string[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(key) || "[]",
    );

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is string => typeof item === "string",
    );
  } catch {
    return [];
  }
}

// -------------------- MAIN PAGE --------------------

export default function CategoriesPage() {
  // Existing Supabase connection.
  const supabase = useMemo(() => createClient(), []);

  // Next.js programmatic navigation.
  const router = useRouter();

  // Database मधून load झालेली active products list.
  const [products, setProducts] = useState<Product[]>([]);

  // Loading state.
  const [loading, setLoading] = useState(true);

  // Search, filter आणि sorting states.
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("recommended");

  // Mobile filter drawer visibility.
  const [showMobileFilters, setShowMobileFilters] =
    useState(false);

  // Eye/Quick Preview modal साठी selected category.
  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  // Recently viewed categories.
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  // Wishlisted category slugs.
  const [wishlistCategories, setWishlistCategories] =
    useState<string[]>([]);

  // Mobile bottom navigation मधील cart badge साठी count.
  const [cartCount, setCartCount] = useState(0);

  // -------------------- LOAD LOCAL PREFERENCES --------------------
  // Recent categories आणि category wishlist localStorage मध्ये असतात.
  useEffect(() => {
    setRecentSlugs(
      readStoredArray("primecart_recent_categories"),
    );

    setWishlistCategories(
      readStoredArray("primecart_category_wishlist"),
    );
  }, []);

  // -------------------- MOBILE CART BADGE --------------------
  // Dashboard प्रमाणे cart count localStorage मधून sync करतो.
  // Existing cart logic ला touch करत नाही.
  useEffect(() => {
    const readCartCount = () => {
      try {
        const raw = localStorage.getItem("primecart-cart") || "[]";
        const parsed: unknown = JSON.parse(raw);

        if (!Array.isArray(parsed)) {
          setCartCount(0);
          return;
        }

        const total = parsed.reduce((sum, item) => {
          if (item && typeof item === "object") {
            const value = Number(
              (item as { quantity?: unknown }).quantity ?? 1,
            );

            return sum + (Number.isFinite(value) && value > 0 ? value : 1);
          }

          return sum + 1;
        }, 0);

        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    readCartCount();

    const handleCartUpdate = () => readCartCount();

    window.addEventListener(
      "primecart-cart-updated",
      handleCartUpdate,
    );
    window.addEventListener("storage", handleCartUpdate);

    return () => {
      window.removeEventListener(
        "primecart-cart-updated",
        handleCartUpdate,
      );
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  // -------------------- LOAD PRODUCTS FROM SUPABASE --------------------
  // FIX: Supabase मधील response limit मुळे products कमी मिळू नयेत
  // म्हणून range() वापरून batches मध्ये records आणतो.
  //
  // येथे is_active = true मुद्दाम कायम आहे.
  // त्यामुळे inactive products category count मध्ये येणार नाहीत.
  //
  // categories!inner(slug) मुळे संबंधित category चा slug मिळतो.
  // --------------------

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);

      try {
        const pageSize = 1000;
        let from = 0;
        const allRows: any[] = [];

        while (true) {
          const { data, error } = await supabase
            .from("products")
            .select(`
              id,
              category_id,
              name,
              image_url,
              price,
              original_price,
              rating,
              stock,
              is_flash_sale,
              categories!inner (
                slug
              )
            `)
            .eq("is_active", true)
            .order("id", { ascending: true })
            .range(from, from + pageSize - 1);

          if (error) {
            throw error;
          }

          const batch = data ?? [];

          allRows.push(...batch);

          // शेवटचा batch मिळाल्यावर loop थांबतो.
          if (batch.length < pageSize) {
            break;
          }

          from += pageSize;
        }

        // Duplicate IDs आल्यास एकच record ठेवतो.
        const uniqueRows = Array.from(
          new Map(
            allRows.map((item) => [String(item.id), item]),
          ).values(),
        );

        // Supabase response आपल्या Product type मध्ये convert करतो.
        const mappedProducts: Product[] = uniqueRows.map(
          (item: any) => ({
            id: String(item.id),
            category_id:
              item.category_id == null
                ? null
                : String(item.category_id),
            name: item.name,
            image_url: item.image_url,
            price: item.price,
            original_price: item.original_price,
            rating: item.rating,
            stock: item.stock,
            is_flash_sale: item.is_flash_sale,
            category_slug: Array.isArray(item.categories)
              ? item.categories[0]?.slug
              : item.categories?.slug,
          }),
        );

        if (active) {
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error(
          "PrimeCart categories product loading error:",
          error,
        );

        if (active) {
          setProducts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [supabase]);

  // -------------------- CATEGORY-WISE STATISTICS --------------------
  // इथे category slug नुसार products group केले जातात.
  //
  // total          = active products count
  // inStock        = stock 5 पेक्षा जास्त असलेले products
  // lowStock       = stock 1 ते 5 असलेले products
  // outOfStock     = stock 0 किंवा कमी असलेले products
  // flashDeals     = flash sale products
  // averageRating  = average product rating
  // minPrice/maxPrice = category price range
  // --------------------

  const stats = useMemo(() => {
    const output: Record<string, CategoryStats> = {};

    categories.forEach((category) => {
      const list = products.filter(
        (product) =>
          product.category_slug?.trim().toLowerCase() ===
          category.slug.trim().toLowerCase(),
      );

      const inStock = list.filter(
        (product) => safeNumber(product.stock) > 5,
      ).length;

      const lowStock = list.filter((product) => {
        const stock = safeNumber(product.stock);
        return stock > 0 && stock <= 5;
      }).length;

      const outOfStock = list.filter(
        (product) => safeNumber(product.stock) <= 0,
      ).length;

      const flashDeals = list.filter(
        (product) => product.is_flash_sale === true,
      ).length;

      const ratings = list
        .map((product) => safeNumber(product.rating))
        .filter((rating) => rating > 0);

      const prices = list
        .map((product) => safeNumber(product.price))
        .filter((price) => price > 0);

      const discounts = list
        .map((product) => {
          const price = safeNumber(product.price);
          const original = safeNumber(product.original_price);

          if (price <= 0 || original <= price) return 0;

          return ((original - price) / original) * 100;
        })
        .filter((discount) => discount > 0);

      output[category.slug] = {
        // Preview साठी पहिली पाच products.
        products: list.slice(0, 5),

        // पूर्ण list ची count.
        total: list.length,

        inStock,
        lowStock,
        outOfStock,
        flashDeals,

        averageRating: ratings.length
          ? ratings.reduce((a, b) => a + b, 0) /
            ratings.length
          : 0,

        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,

        averagePrice: prices.length
          ? prices.reduce((a, b) => a + b, 0) / prices.length
          : 0,

        discountPercentage: discounts.length
          ? discounts.reduce((a, b) => a + b, 0) /
            discounts.length
          : 0,
      };
    });

    return output;
  }, [products]);

  // -------------------- OVERALL STATISTICS --------------------

  const totalProducts = products.length;

  const totalDeals = products.filter(
    (product) => product.is_flash_sale === true,
  ).length;

  const overallRatings = products
    .map((product) => safeNumber(product.rating))
    .filter((rating) => rating > 0);

  const overallRating = overallRatings.length
    ? overallRatings.reduce((a, b) => a + b, 0) /
      overallRatings.length
    : 0;

  // -------------------- CATEGORY SEARCH, FILTER AND SORT --------------------
  // Search category name, description आणि keywords वर काम करतो.
  // Filters: All, Deals, Top Rated, In Stock.
  // Sorting: product count, rating, deals, price.
  // --------------------

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = categories.filter((category) => {
      if (!query) return true;

      return [
        category.name,
        category.description,
        ...category.keywords,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    if (filter === "Deals") {
      result = result.filter(
        (category) => stats[category.slug]?.flashDeals > 0,
      );
    }

    if (filter === "Top Rated") {
      result = result.filter(
        (category) => stats[category.slug]?.averageRating >= 4,
      );
    }

    if (filter === "In Stock") {
      result = result.filter(
        (category) => stats[category.slug]?.inStock > 0,
      );
    }

    // Recommended sorting मध्ये category order कायम ठेवतो.
    if (sort === "products") {
      result.sort(
        (a, b) =>
          (stats[b.slug]?.total ?? 0) -
          (stats[a.slug]?.total ?? 0),
      );
    }

    if (sort === "rating") {
      result.sort(
        (a, b) =>
          (stats[b.slug]?.averageRating ?? 0) -
          (stats[a.slug]?.averageRating ?? 0),
      );
    }

    if (sort === "deals") {
      result.sort(
        (a, b) =>
          (stats[b.slug]?.flashDeals ?? 0) -
          (stats[a.slug]?.flashDeals ?? 0),
      );
    }

    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          (stats[a.slug]?.minPrice ?? 0) -
          (stats[b.slug]?.minPrice ?? 0),
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) =>
          (stats[b.slug]?.maxPrice ?? 0) -
          (stats[a.slug]?.maxPrice ?? 0),
      );
    }

    return result;
  }, [search, filter, sort, stats]);

  // -------------------- TRENDING CATEGORIES --------------------
  // सर्वाधिक products असलेल्या चार categories.
  const trending = useMemo(
    () =>
      [...categories]
        .sort(
          (a, b) =>
            (stats[b.slug]?.total ?? 0) -
            (stats[a.slug]?.total ?? 0),
        )
        .slice(0, 4),
    [stats],
  );

  // -------------------- RECENTLY VIEWED --------------------
  const recentlyViewed = useMemo(
    () =>
      recentSlugs
        .map((slug) =>
          categories.find((category) => category.slug === slug),
        )
        .filter(Boolean) as Category[],
    [recentSlugs],
  );

  // -------------------- RECOMMENDED CATEGORIES --------------------
  // Recently viewed categories वगळून बाकी categories मधून picks.
  const recommended = useMemo(
    () =>
      [...categories]
        .filter(
          (category) => !recentSlugs.includes(category.slug),
        )
        .sort((a, b) => {
          const score = (slug: string) =>
            (stats[slug]?.averageRating ?? 0) * 2 +
            (stats[slug]?.flashDeals ?? 0) +
            (stats[slug]?.total ?? 0) / 10;

          return score(b.slug) - score(a.slug);
        })
        .slice(0, 4),
    [recentSlugs, stats],
  );

  // -------------------- OPEN CATEGORY --------------------
  // Recent categories update करतो.
  // Full card आणि preview actions मध्ये ही function वापरता येते.
  const openCategory = useCallback(
    (category: Category) => {
      setRecentSlugs((previous) => {
        const updated = [
          category.slug,
          ...previous.filter((slug) => slug !== category.slug),
        ].slice(0, 5);

        try {
          localStorage.setItem(
            "primecart_recent_categories",
            JSON.stringify(updated),
          );
        } catch {
          // Browser storage unavailable असल्यास page चालू राहतो.
        }

        return updated;
      });
    },
    [],
  );

  // -------------------- CATEGORY WISHLIST --------------------
  // Category wishlist browser localStorage मध्ये save होते.
  const toggleCategoryWishlist = useCallback((slug: string) => {
    setWishlistCategories((previous) => {
      const updated = previous.includes(slug)
        ? previous.filter((item) => item !== slug)
        : [...previous, slug];

      try {
        localStorage.setItem(
          "primecart_category_wishlist",
          JSON.stringify(updated),
        );
      } catch {
        // Browser storage unavailable असल्यास ignore.
      }

      return updated;
    });
  }, []);

  // -------------------- NAVIGATE TO CATEGORY --------------------
  // Correct dynamic route: /dashboard/categories/[slug]
  const navigateToCategory = useCallback(
    (category: Category) => {
      openCategory(category);
      setSelectedCategory(null);

      router.push(`/dashboard/categories/${category.slug}`);
    },
    [openCategory, router],
  );

  // ============================================================
  // PAGE UI START
  // ============================================================

  return (
    <main className="min-h-screen bg-[#fffdf9] text-[#29251d]">

      {/* -------------------- TOP PROMISE STRIP -------------------- */}
      <div className="border-b border-[#eadfc9] bg-[#fff9ec]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-center gap-4 px-5 py-2 text-[10px] font-bold text-[#88724a] sm:gap-8 sm:text-xs">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} />
            Secure Shopping
          </span>
          <span className="hidden sm:block">•</span>
          <span className="flex items-center gap-1.5">
            <Zap size={13} />
            Exclusive Deals
          </span>
          <span className="hidden sm:block">•</span>
          <span className="flex items-center gap-1.5">
            <Package size={13} />
            Easy Returns
          </span>
        </div>
      </div>

      {/* -------------------- STICKY HEADER -------------------- */}
      <header className="sticky top-0 z-50 border-b border-[#eadfc9]/80 bg-[#fffdf9]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* Logo and dashboard navigation. */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#fff5d9] ring-1 ring-[#c79a3b]/20">
              <img
                src="/logo.png"
                alt="PrimeCart"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight">
                Prime<span className="text-[#b8872d]">Cart</span>
              </div>
              <div className="hidden text-[9px] font-bold uppercase tracking-[0.2em] text-[#a59880] sm:block">
                Shop Smarter
              </div>
            </div>
          </Link>

          {/* Desktop navigation. */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#766c5b] hover:bg-[#fff8e8]"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/products"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#766c5b] hover:bg-[#fff8e8]"
            >
              Products
            </Link>
            <Link
              href="/dashboard/categories"
              className="rounded-xl bg-[#fff0c9] px-4 py-2.5 text-sm font-bold text-[#916b1e]"
            >
              Categories
            </Link>
          </nav>

          {/* Shop products and mobile filter button. */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/products"
              className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-[#c79a3b] to-[#b8872d] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 sm:flex"
            >
              Shop Products
              <ArrowRight size={15} />
            </Link>

            <button
              type="button"
              aria-label="Open category filters"
              onClick={() => setShowMobileFilters(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#766c5b] md:hidden"
            >
              <Menu size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* -------------------- PAGE CONTENT CONTAINER -------------------- */}
      <div className="mx-auto max-w-[1500px] px-5 pb-32 pt-7 sm:px-8 lg:px-10 lg:pb-10 lg:pt-10">

        {/* -------------------- BREADCRUMB -------------------- */}
        <div className="mb-7 flex items-center gap-2 text-sm text-[#9c927f]">
          <Link href="/dashboard" className="hover:text-[#a47720]">
            Dashboard
          </Link>
          <span>›</span>
          <span className="font-bold text-[#50483a]">Categories</span>
        </div>

        {/* -------------------- HERO SECTION -------------------- */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-[32px] border border-[#eadfc9] bg-gradient-to-br from-[#fffdf8] via-[#fffaf0] to-[#f8efd9] px-6 py-9 shadow-[0_20px_65px_rgba(120,90,30,0.07)] sm:px-9 lg:px-12 lg:py-12"
        >
          <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-[#c79a3b]/10 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c79a3b]/20 bg-white/75 px-4 py-2 text-[10px] font-black uppercase tracking-[0.17em] text-[#9a741e]">
                <Sparkles size={13} />
                Smart Shopping
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.045em] sm:text-4xl lg:text-6xl">
                Find what you need,
                <span className="text-[#b8872d]"> faster.</span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#7f7461] sm:text-base">
                Explore PrimeCart categories, discover trending products,
                compare deals and find the right products for your needs.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/primematch"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c79a3b] to-[#b8872d] px-5 py-3 text-sm font-bold text-white shadow-sm"
                >
                  <Sparkles size={16} />
                  Try PrimeMatch
                </Link>
                <Link
                  href="/dashboard/products"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#dfcfac] bg-white/80 px-5 py-3 text-sm font-bold text-[#816222]"
                >
                  Browse Products
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Overall statistics from loaded products. */}
            <div className="grid grid-cols-2 gap-3">
              <HeroStat
                icon={<Layers3 size={18} />}
                value={String(categories.length)}
                label="Categories"
              />
              <HeroStat
                icon={<ShoppingBag size={18} />}
                value={loading ? "…" : String(totalProducts)}
                label="Active Products"
              />
              <HeroStat
                icon={<Zap size={18} />}
                value={loading ? "…" : String(totalDeals)}
                label="Live Deals"
              />
              <HeroStat
                icon={<Star size={18} />}
                value={overallRating ? overallRating.toFixed(1) : "—"}
                label="Avg Rating"
              />
            </div>
          </div>
        </motion.section>

        {/* -------------------- SHOP BY INTENT -------------------- */}
        <section className="mt-10">
          <SectionHeading
            eyebrow="Shop by intent"
            title="What are you shopping for?"
            description="Start with a goal instead of searching through everything."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <IntentCard
              icon={<Gamepad2 size={22} />}
              title="Build a Gaming Setup"
              text="Gaming gear, accessories and essentials."
              href="/dashboard/setup-builder?type=gaming"
            />
            <IntentCard
              icon={<Home size={22} />}
              title="Setup My Home"
              text="Useful products for a smarter home."
              href="/dashboard/setup-builder?type=home"
            />
            <IntentCard
              icon={<Smartphone size={22} />}
              title="Upgrade My Tech"
              text="Mobile, electronics and everyday tech."
              href="/dashboard/categories/mobiles"
            />
            <IntentCard
              icon={<ShoppingBag size={22} />}
              title="Shop Within Budget"
              text="Create a smart shopping plan."
              href="/dashboard/budget-builder"
            />
          </div>
        </section>

        {/* -------------------- TRENDING CATEGORIES -------------------- */}
        <section className="mt-11">
          <SectionHeading
            eyebrow="Trending"
            title="Popular categories"
            description="Explore categories with the most active products."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-3 md:grid-cols-4"
          >
            {trending.map((category) => {
              const stat = stats[category.slug];

              return (
                <motion.div
                  key={category.slug}
                  variants={cardVariants}
                >
                  <Link
                    href={`/dashboard/categories/${category.slug}`}
                    onClick={() => openCategory(category)}
                    className="group block h-full"
                  >
                    <div className="h-full overflow-hidden rounded-2xl border border-[#eadfc9] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#c79a3b]/40">
                      <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-[#fffaf0] to-[#f7efdc] sm:h-36">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-contain p-5 transition group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/logo.png";
                          }}
                        />
                        {stat?.flashDeals > 0 && (
                          <span className="absolute left-3 top-3 rounded-full bg-[#c79a3b] px-2.5 py-1 text-[9px] font-black text-white">
                            ⚡ Deals
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-sm font-black">
                            {category.name}
                          </h3>
                          <ArrowRight size={14} />
                        </div>

                        <div className="mt-2 text-[11px] text-[#958a78]">
                          {stat?.total ?? 0} active products
                        </div>

                        {stat?.averageRating > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-xs font-bold text-[#806b43]">
                            <Star size={11} className="fill-[#c79a3b] text-[#c79a3b]" />
                            {stat.averageRating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* -------------------- SEARCH, FILTER AND SORT -------------------- */}
        <section className="mt-11">
          <div className="rounded-2xl border border-[#eadfc9] bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row">
              {/* Category search input. */}
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a79b85]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search categories or shopping needs..."
                  className="h-12 w-full rounded-xl border border-[#eadfc9] bg-[#fffdf9] pl-11 pr-11 text-sm outline-none focus:border-[#c79a3b]"
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Desktop filter buttons. */}
              <div className="hidden items-center gap-1 lg:flex">
                {["All", "Deals", "Top Rated", "In Stock"].map((item) => (
                  <FilterButton
                    key={item}
                    active={filter === item}
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </FilterButton>
                ))}
              </div>

              {/* Category sorting dropdown. */}
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-12 rounded-xl border border-[#eadfc9] bg-[#fffdf9] px-4 text-sm font-bold text-[#746957] outline-none"
              >
                <option value="recommended">Recommended</option>
                <option value="products">Most Products</option>
                <option value="rating">Highest Rated</option>
                <option value="deals">Most Deals</option>
                <option value="price-low">Lowest Starting Price</option>
                <option value="price-high">Highest Price</option>
              </select>
            </div>
          </div>
        </section>

        {/* -------------------- RECENTLY VIEWED CATEGORIES -------------------- */}
        {recentlyViewed.length > 0 && (
          <section className="mt-11">
            <SectionHeading
              eyebrow="Continue exploring"
              title="Recently viewed"
              description="Pick up where you left off."
            />
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recentlyViewed.map((category) => (
                <MiniCategory
                  key={category.slug}
                  category={category}
                  stats={stats[category.slug]}
                  onOpen={() => navigateToCategory(category)}
                />
              ))}
            </div>
          </section>
        )}

        {/* -------------------- ALL CATEGORY CARDS -------------------- */}
        <section className="mt-11">
          <div className="mb-6">
            <div className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-[#a47720]">
              All Categories
            </div>
            <h2 className="text-2xl font-black sm:text-3xl">
              Explore everything
            </h2>
            <p className="mt-1 text-sm text-[#8d8372]">
              {filteredCategories.length} categories available
            </p>
          </div>

          {/* While products load, show skeleton cards. */}
          {loading ? (
            <LoadingGrid />
          ) : filteredCategories.length === 0 ? (
            <EmptyState
              onClear={() => {
                setSearch("");
                setFilter("All");
              }}
            />
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredCategories.map((category) => (
                <motion.div
                  key={category.slug}
                  variants={cardVariants}
                  className="h-full"
                >
                  <CategoryCard
                    category={category}
                    stats={stats[category.slug]}
                    isWishlisted={wishlistCategories.includes(category.slug)}
                    onWishlist={() => toggleCategoryWishlist(category.slug)}
                    onPreview={() => {
                      openCategory(category);
                      setSelectedCategory(category);
                    }}
                    onExplore={() => navigateToCategory(category)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* -------------------- RECOMMENDED CATEGORIES -------------------- */}
        <section className="mt-12">
          <div className="rounded-[30px] border border-[#eadfc9] bg-gradient-to-br from-[#fffaf0] to-[#f8efd9] p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-[#a47720]">
                  <Sparkles size={14} />
                  PrimeCart Picks
                </div>
                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  Categories worth exploring
                </h2>
                <p className="mt-1 text-sm text-[#887d6a]">
                  A mix of ratings, products and active deals.
                </p>
              </div>
              <Link
                href="/dashboard/primematch"
                className="inline-flex items-center gap-2 self-start rounded-xl border border-[#d9c79e] bg-white px-4 py-2.5 text-sm font-bold text-[#866521]"
              >
                Personalize with PrimeMatch
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recommended.map((category) => (
                <MiniCategory
                  key={category.slug}
                  category={category}
                  stats={stats[category.slug]}
                  onOpen={() => navigateToCategory(category)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* -------------------- SMART TOOLS -------------------- */}
        <section className="mt-12 grid gap-5 lg:grid-cols-3">
          <ToolCard
            icon={<Sparkles size={22} />}
            eyebrow="PrimeMatch"
            title="Tell us what you need."
            description="Get product suggestions based on your needs, priorities and budget."
            href="/dashboard/primematch"
            primary
          />
          <ToolCard
            icon={<BarChart3 size={22} />}
            eyebrow="Budget Builder"
            title="Plan your shopping."
            description="Create a product combination around the amount you want to spend."
            href="/dashboard/budget-builder"
          />
          <ToolCard
            icon={<Gamepad2 size={22} />}
            eyebrow="Setup Builder"
            title="Build your setup."
            description="Create gaming, college, work, fitness or home setups."
            href="/dashboard/setup-builder"
          />
        </section>

        {/* -------------------- FINAL SHOPPING CTA -------------------- */}
        <section className="mt-12 rounded-[30px] border border-[#eadfc9] bg-white px-6 py-9 text-center shadow-sm sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0c8] text-[#a47720]">
            <ShoppingBag size={25} />
          </div>
          <h2 className="mt-5 text-2xl font-black sm:text-3xl">
            Ready to start shopping?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#887d6b]">
            Explore the complete PrimeCart collection and discover products
            across every category.
          </p>
          <Link
            href="/dashboard/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c79a3b] to-[#b8872d] px-6 py-3 text-sm font-bold text-white"
          >
            View All Products
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>

      {/* -------------------- MOBILE FILTER DRAWER -------------------- */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close category filters"
            className="absolute inset-0 bg-[#5b4a2d]/25 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="absolute bottom-0 left-0 right-0 rounded-t-[28px] border-t border-[#eadfc9] bg-[#fffdf9] p-5 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">Filter Categories</h3>
                <p className="text-xs text-[#958a78]">
                  Choose what you want to explore.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfc9]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {["All", "Deals", "Top Rated", "In Stock"].map((item) => (
                <FilterButton
                  key={item}
                  active={filter === item}
                  onClick={() => {
                    setFilter(item);
                    setShowMobileFilters(false);
                  }}
                >
                  {item}
                </FilterButton>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* -------------------- QUICK PREVIEW MODAL -------------------- */}
      {selectedCategory && (
        <QuickPreview
          category={selectedCategory}
          stats={stats[selectedCategory.slug]}
          onClose={() => setSelectedCategory(null)}
          onWishlist={() =>
            toggleCategoryWishlist(selectedCategory.slug)
          }
          wishlisted={wishlistCategories.includes(selectedCategory.slug)}
          onExplore={() => navigateToCategory(selectedCategory)}
        />
      )}

      {/* ============================================================
          MOBILE BOTTOM NAVIGATION
          Dashboard सारखाच mobile-only navigation bar.
          Categories page वर Categories active राहते.
          Desktop view वर हा पूर्णपणे hidden आहे.
          ============================================================ */}
      <nav
        aria-label="Mobile shopping navigation"
        className="fixed bottom-3 left-3 right-3 z-[90] md:hidden"
      >
        <div className="mx-auto flex max-w-md items-center justify-between rounded-[28px] border border-[#eadfc9] bg-white/95 px-2 py-2 shadow-[0_12px_40px_rgba(60,45,20,0.14)] backdrop-blur-xl">
          {/* Home */}
          <Link
            href="/dashboard"
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[#8f897d] transition active:scale-95"
          >
            <div className="flex h-7 items-center justify-center">
              <Home size={24} strokeWidth={2.1} />
            </div>
            <span className="text-[11px] font-bold">Home</span>
          </Link>

          {/* Categories — ACTIVE */}
          <Link
            href="/dashboard/categories"
            aria-current="page"
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[#a47720] transition active:scale-95"
          >
            <div className="relative flex h-7 items-center justify-center">
              <span className="absolute -top-1 h-1 w-8 rounded-full bg-[#c79a3b]" />
              <Layers3 size={24} strokeWidth={2.1} />
            </div>
            <span className="text-[11px] font-extrabold">Categories</span>
          </Link>

          {/* Wishlist */}
          <Link
            href="/dashboard/wishlist"
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[#8f897d] transition active:scale-95"
          >
            <div className="flex h-7 items-center justify-center">
              <Heart size={25} strokeWidth={2} />
            </div>
            <span className="text-[11px] font-bold">Wishlist</span>
          </Link>

          {/* Cart */}
          <Link
            href="/dashboard/cart"
            className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[#8f897d] transition active:scale-95"
          >
            <div className="relative flex h-7 items-center justify-center">
              <ShoppingCart size={25} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b8872d] px-1 text-[9px] font-black text-white ring-2 ring-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold">Cart</span>
          </Link>

          {/* Account */}
          <Link
            href="/dashboard/profile"
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[#8f897d] transition active:scale-95"
          >
            <div className="flex h-7 items-center justify-center">
              <UserRound size={24} strokeWidth={2.1} />
            </div>
            <span className="text-[11px] font-bold">Account</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}

// ============================================================
// REUSABLE COMPONENTS
// प्रत्येक component वर त्याचा purpose comment दिलेला आहे.
// ============================================================

// -------------------- HERO STAT CARD --------------------
// Hero मध्ये total categories, products, deals आणि rating दाखवतो.

function HeroStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-[#eadfc9] bg-white/80 p-3 shadow-sm sm:p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff2cf] text-[#a47720] sm:h-9 sm:w-9">
        {icon}
      </div>
      <div className="mt-2 min-w-0 break-words text-xl font-black leading-tight tabular-nums sm:mt-3 sm:text-2xl">
        {value}
      </div>
      <div className="mt-1 break-words text-[10px] font-semibold leading-tight text-[#958a76] sm:text-xs">
        {label}
      </div>
    </div>
  );
}

// -------------------- SECTION HEADING --------------------
// प्रत्येक major section साठी समान heading layout.

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-[#a47720]">
        {eyebrow}
      </div>
      <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
        {title}
      </h2>
      <p className="mt-1 text-sm text-[#8d8372]">{description}</p>
    </div>
  );
}

// -------------------- SHOPPING INTENT CARD --------------------
// Setup Builder, home setup आणि budget builder साठी shortcut card.

function IntentCard({
  icon,
  title,
  text,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link href={href} className="group block h-full">
      <div className="h-full rounded-2xl border border-[#eadfc9] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#c79a3b]/40">
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff6df] text-[#b8872d] transition group-hover:bg-[#c79a3b] group-hover:text-white">
            {icon}
          </div>
          <ArrowRight size={16} className="text-[#b4a78f]" />
        </div>
        <h3 className="mt-5 font-black">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-[#8c816f]">{text}</p>
      </div>
    </Link>
  );
}

// -------------------- FILTER BUTTON --------------------
// Desktop आणि mobile दोन्हीकडे वापरला जाणारा filter button.

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
        active
          ? "bg-[#fff0c8] text-[#8d681d] ring-1 ring-[#c79a3b]/25"
          : "text-[#786e5e] hover:bg-[#fff8e9]"
      }`}
    >
      {children}
    </button>
  );
}

// -------------------- FULL CATEGORY CARD --------------------
// मुख्य fix:
// Card च्या कोणत्याही रिकाम्या भागावर किंवा माहितीवर क्लिक केल्यास
// category उघडते.
//
// Wishlist आणि Preview buttons मात्र स्वतंत्र काम करतात.
// त्यामुळे त्या buttons वर click केल्यावर category navigation होत नाही.
// --------------------

function CategoryCard({
  category,
  stats,
  isWishlisted,
  onWishlist,
  onPreview,
  onExplore,
}: {
  category: Category;
  stats: CategoryStats;
  isWishlisted: boolean;
  onWishlist: () => void;
  onPreview: () => void;
  onExplore: () => void;
}) {
  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Explore ${category.name}`}
      onClick={onExplore}
      onKeyDown={(event) => {
        // Keyboard focus असताना card Enter/Space ने उघडतो.
        // Inner buttons वर keyboard वापरल्यास त्यांची action चालते.
        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          onExplore();
        }
      }}
      className="group relative h-full cursor-pointer overflow-hidden rounded-[28px] border border-[#eadfc9] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.035)] transition duration-300 hover:-translate-y-1.5 hover:border-[#c79a3b]/40 hover:shadow-[0_20px_50px_rgba(130,95,25,0.1)] focus:outline-none focus:ring-2 focus:ring-[#c79a3b]"
    >
      {/* CATEGORY IMAGE */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#fffaf0] to-[#f7efdc]">
        <img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-contain p-7 transition duration-500 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/logo.png";
          }}
        />

        {/* Category name badge. */}
        <div className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[10px] font-black text-[#866521] shadow-sm">
          {category.name}
        </div>

        {/* Wishlist is independent from card navigation. */}
        <button
          type="button"
          aria-label={
            isWishlisted
              ? `Remove ${category.name} from wishlist`
              : `Add ${category.name} to wishlist`
          }
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onWishlist();
          }}
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition ${
            isWishlisted
              ? "border-[#c79a3b]/30 bg-[#fff0c8] text-[#a47720]"
              : "border-white/80 bg-white/90 text-[#9c907b] hover:text-[#a47720]"
          }`}
        >
          <Heart
            size={15}
            className={isWishlisted ? "fill-current" : ""}
          />
        </button>

        {/* Live flash deal count. */}
        {stats.flashDeals > 0 && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-[#c79a3b] px-3 py-1.5 text-[10px] font-black text-white shadow-sm">
            <Zap size={11} />
            {stats.flashDeals} Live Deals
          </div>
        )}
      </div>

      {/* CATEGORY DESCRIPTION AND STATISTICS */}
      <div className="p-5">
        <h3 className="text-xl font-black tracking-tight">
          {category.name}
        </h3>

        <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#887e6c]">
          {category.description}
        </p>

        {/* Minimum and maximum product prices. */}
        <div className="mt-4 rounded-xl bg-[#fffaf0] px-3 py-2.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#a08f70]">
            Price range
          </div>
          <div className="mt-1 font-black text-[#5c4a28]">
            {stats.minPrice
              ? `${money(stats.minPrice)} – ${money(stats.maxPrice)}`
              : "Explore products"}
          </div>
        </div>

        {/* Category product count, stock and rating. */}
        <div className="mt-4 grid grid-cols-3 divide-x divide-[#eee6d6] rounded-xl border border-[#eee6d6] bg-[#fffdf9]">
          <SmallStat value={stats.total} label="Products" />
          <SmallStat value={stats.inStock} label="In Stock" />
          <SmallStat
            value={
              stats.averageRating
                ? stats.averageRating.toFixed(1)
                : "—"
            }
            label="Rating"
            star
          />
        </div>

        {/* Stock availability and average discount. */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            {stats.lowStock > 0 ? (
              <>
                <span className="h-2 w-2 rounded-full bg-[#d09b35]" />
                <span className="text-[#a47720]">
                  Limited stock available
                </span>
              </>
            ) : stats.inStock > 0 ? (
              <>
                <span className="h-2 w-2 rounded-full bg-[#8ba66b]" />
                <span className="text-[#71855b]">
                  Products available
                </span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-[#b9afa0]" />
                <span className="text-[#8d8375]">
                  Check availability
                </span>
              </>
            )}
          </div>

          {stats.discountPercentage > 0 && (
            <span className="text-[11px] font-black text-[#b47a1d]">
              ~{Math.round(stats.discountPercentage)}% avg deal
            </span>
          )}
        </div>

        {/* Small product image previews. */}
        {stats.products.length > 0 && (
          <div className="mt-5 flex items-center gap-2">
            {stats.products.slice(0, 3).map((product) => (
              <div
                key={product.id}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#eadfc9] bg-[#fffaf0]"
              >
                <img
                  src={getImage(product.image_url)}
                  alt={product.name}
                  className="h-full w-full object-contain p-1"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/logo.png";
                  }}
                />
              </div>
            ))}
            {stats.products.length > 3 && (
              <span className="text-xs font-bold text-[#998d78]">
                +{stats.products.length - 3}
              </span>
            )}
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">

          {/* Explore button uses the same category route as the card. */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onExplore();
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c79a3b] to-[#b8872d] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"
          >
            Explore
            <ArrowRight size={15} />
          </button>

          {/* Preview button opens modal without navigating away. */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPreview();
            }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#eadfc9] bg-[#fffaf0] text-[#907448] transition hover:border-[#c79a3b] hover:bg-[#fff1cd]"
            title="Quick preview"
            aria-label={`Preview ${category.name}`}
          >
            <Eye size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

// -------------------- SMALL STAT --------------------
// Category card मधील individual statistic.

function SmallStat({
  value,
  label,
  star,
}: {
  value: number | string;
  label: string;
  star?: boolean;
}) {
  return (
    <div className="px-2 py-3 text-center">
      <div className="flex items-center justify-center gap-1 text-sm font-black text-[#4d4230]">
        {star && (
          <Star size={11} className="fill-[#c79a3b] text-[#c79a3b]" />
        )}
        {value}
      </div>
      <div className="mt-0.5 text-[10px] font-semibold text-[#a09787]">
        {label}
      </div>
    </div>
  );
}

// -------------------- MINI CATEGORY --------------------
// Recently viewed आणि recommended sections मधील compact card.
// Card click केल्यावर category route उघडतो.

function MiniCategory({
  category,
  stats,
  onOpen,
}: {
  category: Category;
  stats: CategoryStats;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group min-w-[235px] flex-1 rounded-2xl border border-[#eadfc9] bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#c79a3b]/40"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#fff8e8]">
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-contain p-2"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/logo.png";
            }}
          />
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-sm font-black">
            {category.name}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#948875]">
            <span>{stats.total} products</span>
            {stats.averageRating > 0 && (
              <>
                <span>•</span>
                <Star size={11} className="fill-[#c79a3b] text-[#c79a3b]" />
                <span>{stats.averageRating.toFixed(1)}</span>
              </>
            )}
          </div>
          {stats.flashDeals > 0 && (
            <div className="mt-1 text-[10px] font-bold text-[#b47b20]">
              {stats.flashDeals} active deals
            </div>
          )}
        </div>

        <ArrowRight
          size={15}
          className="ml-auto shrink-0 text-[#b8aa91] transition group-hover:translate-x-1"
        />
      </div>
    </button>
  );
}

// -------------------- SMART TOOL CARD --------------------
// PrimeMatch, Budget Builder आणि Setup Builder shortcuts.

function ToolCard({
  icon,
  eyebrow,
  title,
  description,
  href,
  primary,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  primary?: boolean;
}) {
  return (
    <div
      className={`rounded-[26px] border p-6 ${
        primary
          ? "border-[#eadfc9] bg-gradient-to-br from-[#fffaf0] to-[#f8efd9]"
          : "border-[#eadfc9] bg-white"
      }`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff1ce] text-[#a47720]">
        {icon}
      </div>
      <div className="mt-5 text-[10px] font-black uppercase tracking-[0.15em] text-[#a47720]">
        {eyebrow}
      </div>
      <h3 className="mt-2 text-xl font-black">{title}</h3>
      <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#897e6c]">
        {description}
      </p>
      <Link
        href={href}
        className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${
          primary
            ? "bg-gradient-to-r from-[#c79a3b] to-[#b8872d] text-white"
            : "border border-[#d9c79e] bg-[#fff8e7] text-[#866521]"
        }`}
      >
        Explore
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

// -------------------- LOADING SKELETON --------------------
// Supabase query चालू असताना blank page न दाखवता placeholders दाखवतो.

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-[500px] animate-pulse rounded-[28px] border border-[#eadfc9] bg-white"
        >
          <div className="h-52 rounded-t-[28px] bg-[#f6f0e2]" />
          <div className="space-y-4 p-5">
            <div className="h-5 w-2/3 rounded bg-[#f3ecdc]" />
            <div className="h-4 w-full rounded bg-[#f6f0e2]" />
            <div className="h-4 w-4/5 rounded bg-[#f6f0e2]" />
            <div className="h-12 rounded-xl bg-[#f8f2e6]" />
            <div className="h-14 rounded-xl bg-[#f8f2e6]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// -------------------- EMPTY SEARCH STATE --------------------
// Search/filter नुसार category मिळाली नाही तर हा component दिसतो.

function EmptyState({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-[#d9cbae] bg-[#fffaf0] px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0c8] text-[#a47720]">
        <Search size={26} />
      </div>
      <h3 className="mt-5 text-xl font-black">No categories found</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8e8472]">
        Try another search or remove the active filters to see more categories.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-6 rounded-xl bg-gradient-to-r from-[#c79a3b] to-[#b8872d] px-5 py-3 text-sm font-bold text-white"
      >
        Clear Filters
      </button>
    </div>
  );
}

// -------------------- QUICK PREVIEW MODAL --------------------
// Eye button किंवा card मधील Preview action वर हा modal उघडतो.
// Products ची summary, stock, rating आणि price range दाखवतो.

function QuickPreview({
  category,
  stats,
  onClose,
  onWishlist,
  wishlisted,
  onExplore,
}: {
  category: Category;
  stats: CategoryStats;
  onClose: () => void;
  onWishlist: () => void;
  wishlisted: boolean;
  onExplore: () => void;
}) {
  const Icon = category.icon;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop click closes modal. */}
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute inset-0 bg-[#4f412a]/30 backdrop-blur-sm"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${category.name} preview`}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-auto rounded-[30px] border border-[#eadfc9] bg-[#fffdf9] shadow-2xl"
      >
        {/* Modal close button. */}
        <div className="sticky right-0 top-0 z-20 flex justify-end p-4">
          <button
            type="button"
            aria-label="Close preview"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfc9] bg-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-7 px-6 pb-7 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:pb-10">

          {/* Large category image. */}
          <div className="relative flex min-h-[270px] items-center justify-center overflow-hidden rounded-[26px] bg-gradient-to-br from-[#fffaf0] to-[#f7efdc]">
            <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white bg-white/90 px-3 py-1.5 text-xs font-bold text-[#866521]">
              <Icon size={13} />
              {category.name}
            </div>
            <img
              src={category.image}
              alt={category.name}
              className="max-h-[310px] w-full object-contain p-8"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/logo.png";
              }}
            />
          </div>

          {/* Category information and product previews. */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.15em] text-[#a47720]">
                  Quick Preview
                </div>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  {category.name}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Toggle category wishlist"
                onClick={onWishlist}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  wishlisted
                    ? "border-[#c79a3b]/30 bg-[#fff0c8] text-[#a47720]"
                    : "border-[#eadfc9] bg-white text-[#9c907b]"
                }`}
              >
                <Heart
                  size={17}
                  className={wishlisted ? "fill-current" : ""}
                />
              </button>
            </div>

            <p className="mt-4 text-sm leading-7 text-[#807563]">
              {category.description}
            </p>

            {/* Four category statistics. */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <PreviewStat value={stats.total} label="Products" />
              <PreviewStat value={stats.inStock} label="In Stock" />
              <PreviewStat
                value={
                  stats.averageRating
                    ? stats.averageRating.toFixed(1)
                    : "—"
                }
                label="Rating"
              />
              <PreviewStat value={stats.flashDeals} label="Deals" />
            </div>

            {/* Price range. */}
            <div className="mt-5 rounded-2xl border border-[#eadfc9] bg-[#fffaf0] p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.13em] text-[#a08f70]">
                Price Range
              </div>
              <div className="mt-1 text-lg font-black text-[#5c4a28]">
                {stats.minPrice
                  ? `${money(stats.minPrice)} – ${money(stats.maxPrice)}`
                  : "Browse products"}
              </div>
            </div>

            {/* Product preview list — maximum four products. */}
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-black">Popular products</h3>
                <span className="text-xs font-bold text-[#9b8760]">
                  {Math.min(stats.products.length, 4)} previewed
                </span>
              </div>

              <div className="space-y-2">
                {stats.products.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-xl border border-[#eadfc9] bg-white p-2.5"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#fffaf0]">
                      <img
                        src={getImage(product.image_url)}
                        alt={product.name}
                        className="h-full w-full object-contain p-1"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "/logo.png";
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">
                        {product.name}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-[#938875]">
                        {product.rating ? (
                          <span className="flex items-center gap-1">
                            <Star size={10} className="fill-[#c79a3b] text-[#c79a3b]" />
                            {product.rating}
                          </span>
                        ) : null}
                        <span>•</span>
                        <span>
                          {safeNumber(product.stock) > 0
                            ? "In stock"
                            : "Out of stock"}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm font-black text-[#6d572d]">
                      {money(product.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opens the full category products page. */}
            <button
              type="button"
              onClick={onExplore}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c79a3b] to-[#b8872d] px-5 py-3.5 text-sm font-bold text-white shadow-sm"
            >
              Explore {category.name}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// -------------------- QUICK PREVIEW STAT --------------------
// Preview modal मधील compact statistics card.

function PreviewStat({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-[#eadfc9] bg-white px-3 py-3 text-center">
      <div className="text-lg font-black">{value}</div>
      <div className="mt-0.5 text-[10px] font-semibold text-[#9c917e]">
        {label}
      </div>
    </div>
  );
}
