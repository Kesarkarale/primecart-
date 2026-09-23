"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Home,
  Smartphone,
  WashingMachine,
  Footprints,
  Watch,
  ShoppingBag,
  Baby,
  Car,
  Shirt,
  Gamepad2,
  Search,
  X,
  Sparkles,
  Grid3X3,
  Package,
  RefreshCw,
  TrendingUp,
  Zap,
  Star,
  SlidersHorizontal,
  WalletCards,
  WandSparkles,
} from "lucide-react";

import { createClient } from "@supabase/supabase-js";

/* =========================================================
   SUPABASE
========================================================= */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

/* =========================================================
   CATEGORY DATA
========================================================= */

const categories = [
  {
    name: "Home & Living",
    slug: "home-living",
    description:
      "Furniture, decor, kitchen and everyday essentials for your home.",
    icon: Home,
    label: "Home Essentials",
  },
  {
    name: "Mobile",
    slug: "mobile",
    description:
      "Smartphones, accessories and mobile essentials for everyday use.",
    icon: Smartphone,
    label: "Tech & Mobile",
  },
  {
    name: "Appliance",
    slug: "appliance",
    description:
      "Smart and useful appliances designed to make life easier.",
    icon: WashingMachine,
    label: "Smart Appliances",
  },
  {
    name: "Footwear",
    slug: "footwear",
    description:
      "Shoes, sneakers, sandals and everyday footwear for every style.",
    icon: Footprints,
    label: "Shoes & Sneakers",
  },
  {
    name: "Watch",
    slug: "watch",
    description:
      "Smart watches and classic timepieces for every occasion.",
    icon: Watch,
    label: "Timepieces",
  },
  {
    name: "Bag",
    slug: "bag",
    description:
      "Backpacks, handbags and travel bags for work, travel and lifestyle.",
    icon: ShoppingBag,
    label: "Bags & Travel",
  },
  {
    name: "Toy & Baby",
    slug: "toy-baby",
    description:
      "Toys, baby products and kids essentials for little ones.",
    icon: Baby,
    label: "Kids & Baby",
  },
  {
    name: "Automotive",
    slug: "automotive",
    description:
      "Car and bike accessories for a smoother everyday drive.",
    icon: Car,
    label: "Auto Essentials",
  },
  {
    name: "Fashion",
    slug: "fashion",
    description:
      "Clothing, accessories and lifestyle fashion for your everyday look.",
    icon: Shirt,
    label: "Style & Fashion",
  },
  {
    name: "Gaming",
    slug: "gaming",
    description:
      "Gaming accessories and entertainment gear for your setup.",
    icon: Gamepad2,
    label: "Gaming Gear",
  },
];

/* =========================================================
   FILTERS
========================================================= */

const filters = [
  { id: "all", label: "All" },
  { id: "popular", label: "Popular" },
  { id: "tech", label: "Tech" },
  { id: "lifestyle", label: "Lifestyle" },
];

/* =========================================================
   ANIMATIONS
========================================================= */

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: "easeOut",
    },
  },
};

/* =========================================================
   TYPES
========================================================= */

type ProductRow = {
  id: string;
  category_id: string | null;
  name: string;
  image_url: string | null;
  price: number | null;
  rating: number | null;
  is_flash_sale: boolean | null;
  categories:
    | {
        slug: string;
      }
    | {
        slug: string;
      }[]
    | null;
};

type CategoryStats = {
  slug: string;
  count: number;
  rating: number;
  flashSaleCount: number;
  products: ProductRow[];
};

/* =========================================================
   IMAGE HELPER
========================================================= */

function getProductImage(imageUrl: string | null) {
  if (!imageUrl) {
    return null;
  }

  if (
    imageUrl.startsWith("/") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `/${imageUrl}`;
}

/* =========================================================
   PAGE
========================================================= */

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [stats, setStats] = useState<CategoryStats[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     LOAD CATEGORY DATA
  ======================================================= */

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("products")
        .select(
          `
          id,
          category_id,
          name,
          image_url,
          price,
          rating,
          is_flash_sale,
          categories!inner(
            slug
          )
        `
        )
        .eq("is_active", true);

      if (queryError) {
        throw queryError;
      }

      const rows = (data || []) as ProductRow[];

      const calculatedStats: CategoryStats[] = categories.map(
        (category) => {
          const categoryProducts = rows.filter((product) => {
            const relation = product.categories;

            if (!relation) return false;

            if (Array.isArray(relation)) {
              return relation.some(
                (item) => item.slug === category.slug
              );
            }

            return relation.slug === category.slug;
          });

          const ratings = categoryProducts
            .map((product) => Number(product.rating || 0))
            .filter((rating) => rating > 0);

          const averageRating =
            ratings.length > 0
              ? ratings.reduce((sum, value) => sum + value, 0) /
                ratings.length
              : 0;

          const flashSaleCount = categoryProducts.filter(
            (product) => product.is_flash_sale === true
          ).length;

          return {
            slug: category.slug,
            count: categoryProducts.length,
            rating: averageRating,
            flashSaleCount,
            products: categoryProducts.slice(0, 3),
          };
        }
      );

      setStats(calculatedStats);
    } catch (err) {
      console.error("Category data error:", err);

      setError(
        "We couldn't load live category data. You can still browse all categories."
      );

      setStats(
        categories.map((category) => ({
          slug: category.slug,
          count: 0,
          rating: 0,
          flashSaleCount: 0,
          products: [],
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoryData();
  }, []);

  /* =======================================================
     HELPERS
  ======================================================= */

  const getStats = (slug: string) => {
    return (
      stats.find((item) => item.slug === slug) || {
        slug,
        count: 0,
        rating: 0,
        flashSaleCount: 0,
        products: [],
      }
    );
  };

  const totalProducts = useMemo(() => {
    return stats.reduce((sum, item) => sum + item.count, 0);
  }, [stats]);

  const totalFlashProducts = useMemo(() => {
    return stats.reduce(
      (sum, item) => sum + item.flashSaleCount,
      0
    );
  }, [stats]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = categories.filter((category) => {
      if (!query) return true;

      return (
        category.name.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query) ||
        category.label.toLowerCase().includes(query)
      );
    });

    if (activeFilter === "popular") {
      result = result.filter(
        (category) => getStats(category.slug).count > 0
      );

      result.sort(
        (a, b) =>
          getStats(b.slug).count - getStats(a.slug).count
      );
    }

    if (activeFilter === "tech") {
      const tech = [
        "mobile",
        "appliance",
        "watch",
        "gaming",
      ];

      result = result.filter((category) =>
        tech.includes(category.slug)
      );
    }

    if (activeFilter === "lifestyle") {
      const lifestyle = [
        "home-living",
        "footwear",
        "bag",
        "toy-baby",
        "automotive",
        "fashion",
      ];

      result = result.filter((category) =>
        lifestyle.includes(category.slug)
      );
    }

    return result;
  }, [searchQuery, activeFilter, stats]);

  const clearFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
  };

  /* =======================================================
     TOP CATEGORY
  ======================================================= */

  const topCategorySlug = useMemo(() => {
    if (!stats.length) return "";

    return [...stats].sort((a, b) => b.count - a.count)[0]?.slug || "";
  }, [stats]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#29251f] dark:bg-[#11100d] dark:text-[#f5eee2]">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#e8dfcf] bg-white/95 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#15130f]/95">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* LOGO */}

          <Link
            href="/dashboard"
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#e2c55e] via-[#c9a227] to-[#a98513] text-white shadow-[0_7px_20px_rgba(185,145,35,0.20)]">
              <span className="relative z-10 text-lg font-black">
                P
              </span>

              <div className="absolute -right-3 -top-3 h-7 w-7 rounded-full bg-white/25 blur-md" />
            </div>

            <div>
              <div className="text-xl font-black tracking-tight text-[#171717] dark:text-white">
                Prime<span className="text-[#b08a00]">Cart</span>
              </div>

              <div className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a39b8d] sm:block">
                Shop Smarter
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#756f65] transition hover:bg-[#faf7ef] hover:text-[#9b7600] dark:text-[#b9b0a1] dark:hover:bg-white/[0.06]"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/products"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#756f65] transition hover:bg-[#faf7ef] hover:text-[#9b7600] dark:text-[#b9b0a1] dark:hover:bg-white/[0.06]"
            >
              Products
            </Link>

            <Link
              href="/dashboard/categories"
              className="rounded-xl border border-[#d9bd67]/40 bg-[#fff8df] px-4 py-2.5 text-sm font-bold text-[#8d6d00] shadow-sm dark:border-[#c9a227]/25 dark:bg-[#332b18] dark:text-[#e1c766]"
            >
              Categories
            </Link>

            {/* GOLD DASHBOARD BUTTON — NO BLACK */}

            <Link
              href="/dashboard"
              className="ml-1 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#b28b16] px-5 py-2.5 text-sm font-bold text-white shadow-[0_7px_20px_rgba(190,150,35,0.20)] transition duration-300 hover:-translate-y-0.5 hover:from-[#b9951e] hover:to-[#a17c0e] hover:shadow-[0_10px_25px_rgba(190,150,35,0.28)]"
            >
              Dashboard
              <ArrowRight size={15} />
            </Link>
          </nav>

          {/* MOBILE */}

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-[#d9bd67]/35 bg-[#fff8df] px-3.5 py-2.5 text-sm font-bold text-[#8d6d00] dark:bg-[#332b18] dark:text-[#e0c35d]"
          >
            <Home size={16} />
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* ===================================================
          PAGE
      =================================================== */}

      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
        {/* BREADCRUMB */}

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 flex items-center gap-2 text-sm"
        >
          <Link
            href="/dashboard"
            className="font-medium text-[#8b857a] transition hover:text-[#a17b00]"
          >
            Dashboard
          </Link>

          <ChevronRight
            size={15}
            className="text-[#b8b1a5]"
          />

          <span className="font-semibold text-[#39342d] dark:text-[#eee5d7]">
            Categories
          </span>
        </motion.div>

        {/* ===================================================
            HERO
        =================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-7 overflow-hidden rounded-[30px] border border-[#eadfc9] bg-white shadow-[0_10px_40px_rgba(80,65,35,0.045)] dark:border-white/[0.08] dark:bg-[#181612]"
        >
          {/* DECORATIVE GOLD */}

          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#c9a227]/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-28 right-72 h-52 w-52 rounded-full bg-[#c9a227]/[0.06] blur-3xl" />

          <div className="relative px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d6bd70]/35 bg-[#fffaf0] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#9a7800] dark:border-[#c9a227]/25 dark:bg-[#332b18] dark:text-[#e0c35d]">
                  <Sparkles size={13} />
                  Explore PrimeCart
                </div>

                <h1 className="text-3xl font-black tracking-[-0.04em] text-[#211e19] dark:text-white sm:text-4xl lg:text-5xl">
                  What are you{" "}
                  <span className="bg-gradient-to-r from-[#ad8500] via-[#c9a227] to-[#dfc45d] bg-clip-text text-transparent">
                    shopping for?
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#787268] dark:text-[#aaa195] sm:text-base">
                  Explore carefully organized categories and
                  discover products that match your everyday needs,
                  lifestyle and interests.
                </p>
              </div>

              {/* STATS */}

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="min-w-[90px] rounded-2xl border border-[#eadfc9] bg-[#fffdf8] px-3 py-4 text-center dark:border-white/[0.08] dark:bg-[#211e18]">
                  <Grid3X3
                    size={17}
                    className="mx-auto text-[#b08a00]"
                  />

                  <div className="mt-1 text-xl font-black text-[#29251f] dark:text-white">
                    {categories.length}
                  </div>

                  <div className="text-[10px] font-semibold text-[#918a7e]">
                    Categories
                  </div>
                </div>

                <div className="min-w-[90px] rounded-2xl border border-[#eadfc9] bg-[#fffdf8] px-3 py-4 text-center dark:border-white/[0.08] dark:bg-[#211e18]">
                  <Package
                    size={17}
                    className="mx-auto text-[#b08a00]"
                  />

                  <div className="mt-1 text-xl font-black text-[#29251f] dark:text-white">
                    {loading ? "—" : totalProducts}
                  </div>

                  <div className="text-[10px] font-semibold text-[#918a7e]">
                    Products
                  </div>
                </div>

                <div className="min-w-[90px] rounded-2xl border border-[#eadfc9] bg-[#fffdf8] px-3 py-4 text-center dark:border-white/[0.08] dark:bg-[#211e18]">
                  <Zap
                    size={17}
                    className="mx-auto text-[#b08a00]"
                  />

                  <div className="mt-1 text-xl font-black text-[#29251f] dark:text-white">
                    {loading ? "—" : totalFlashProducts}
                  </div>

                  <div className="text-[10px] font-semibold text-[#918a7e]">
                    Flash Deals
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ===================================================
            SEARCH
        =================================================== */}

        <section className="mb-5">
          <div className="relative max-w-2xl">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a59e92]"
            />

            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="h-14 w-full rounded-2xl border border-[#e3d9c7] bg-white pl-12 pr-12 text-sm font-medium text-[#29251f] outline-none shadow-[0_6px_25px_rgba(70,55,30,0.035)] transition placeholder:text-[#aaa397] focus:border-[#c9a227]/60 focus:ring-4 focus:ring-[#c9a227]/10 dark:border-white/[0.08] dark:bg-[#181612] dark:text-white dark:placeholder:text-[#857d71]"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#91897c] transition hover:bg-[#fff8df] hover:text-[#9a7800]"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {/* FILTERS */}

          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
            <SlidersHorizontal
              size={15}
              className="mr-1 shrink-0 text-[#968e82]"
            />

            {filters.map((filter) => {
              const active = activeFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    active
                      ? "border border-[#c9a227]/50 bg-[#fff4c9] text-[#8d6d00] shadow-sm dark:bg-[#3b3119] dark:text-[#e3c662]"
                      : "border border-[#e4dac6] bg-white text-[#756f65] hover:border-[#c9a227]/40 hover:bg-[#fffaf0] hover:text-[#967300] dark:border-white/[0.08] dark:bg-[#181612] dark:text-[#aaa195]"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#eadfc9] bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08] dark:bg-[#181612]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff8df] text-[#a17b00]">
                <Package size={17} />
              </div>

              <p className="text-sm text-[#756f65] dark:text-[#aaa195]">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={loadCategoryData}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d7bd68]/40 bg-[#fff8df] px-4 py-2.5 text-xs font-bold text-[#8d6d00] transition hover:bg-[#fff0bd]"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* RESULT */}

        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold text-[#37322b] dark:text-[#eee5d7]">
              {filteredCategories.length}{" "}
              {filteredCategories.length === 1
                ? "category"
                : "categories"}
            </p>

            {searchQuery && (
              <p className="mt-1 text-xs text-[#918a7e]">
                Results for &quot;{searchQuery}&quot;
              </p>
            )}
          </div>

          {(searchQuery || activeFilter !== "all") && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-[#a17b00] hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* ===================================================
            SKELETON
        =================================================== */}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category.slug}
                className="min-h-[320px] animate-pulse rounded-[26px] border border-[#e8dfd1] bg-white p-6 dark:border-white/[0.08] dark:bg-[#181612]"
              >
                <div className="h-[60px] w-[60px] rounded-[19px] bg-[#f0eadf] dark:bg-[#28241d]" />

                <div className="mt-6 h-3 w-24 rounded bg-[#f0eadf] dark:bg-[#28241d]" />

                <div className="mt-3 h-6 w-36 rounded bg-[#ebe4d8] dark:bg-[#28241d]" />

                <div className="mt-3 space-y-2">
                  <div className="h-3 w-full rounded bg-[#f0eadf] dark:bg-[#28241d]" />
                  <div className="h-3 w-4/5 rounded bg-[#f0eadf] dark:bg-[#28241d]" />
                </div>

                <div className="mt-5 h-8 w-24 rounded-xl bg-[#f0eadf] dark:bg-[#28241d]" />

                <div className="mt-7 border-t border-[#eee8de] pt-5 dark:border-white/[0.06]">
                  <div className="h-4 w-28 rounded bg-[#f0eadf] dark:bg-[#28241d]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length > 0 ? (
          /* =================================================
             CATEGORY CARDS
          ================================================= */

          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              const categoryStats = getStats(category.slug);

              const isPopular =
                category.slug === topCategorySlug &&
                categoryStats.count > 0;

              return (
                <motion.div
                  key={category.slug}
                  variants={cardVariants}
                  className="h-full"
                >
                  <Link
                    href={`/dashboard/categories/${category.slug}`}
                    className="group block h-full"
                  >
                    <article className="relative flex h-full min-h-[360px] flex-col overflow-hidden rounded-[26px] border border-[#e7dfd1] bg-white p-6 shadow-[0_8px_35px_rgba(80,65,35,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#d3b45c]/55 hover:shadow-[0_20px_50px_rgba(100,75,20,0.11)] dark:border-white/[0.08] dark:bg-[#181612]">
                      {/* TOP LINE */}

                      <div className="absolute left-0 top-0 h-1 w-0 bg-gradient-to-r from-[#b08a00] via-[#c9a227] to-[#e2c866] transition-all duration-500 group-hover:w-full" />

                      {/* GLOW */}

                      <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-[#c9a227]/10 blur-3xl transition group-hover:bg-[#c9a227]/20" />

                      {/* BADGES */}

                      <div className="relative flex min-h-[30px] items-start justify-between">
                        <span className="rounded-full border border-[#dfcc8d]/50 bg-[#fffaf0] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#9a7800] dark:bg-[#332b18] dark:text-[#e0c35d]">
                          {category.label}
                        </span>

                        <div className="flex gap-1.5">
                          {isPopular && (
                            <span className="flex items-center gap-1 rounded-full border border-[#dfcc8d]/50 bg-[#fffaf0] px-2 py-1 text-[9px] font-bold text-[#9a7800] dark:bg-[#332b18] dark:text-[#e0c35d]">
                              <TrendingUp size={10} />
                              Popular
                            </span>
                          )}

                          {categoryStats.flashSaleCount > 0 && (
                            <span className="flex items-center gap-1 rounded-full border border-[#efd58c] bg-[#fff7dc] px-2 py-1 text-[9px] font-bold text-[#9a7800]">
                              <Zap size={10} />
                              Sale
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ICON */}

                      <div className="relative mt-4 flex items-center justify-between">
                        <div className="flex h-[60px] w-[60px] items-center justify-center rounded-[19px] border border-[#e8dcb9] bg-gradient-to-br from-[#fffaf0] to-[#faf3dc] text-[#aa8500] transition-all duration-300 group-hover:border-[#c9a227]/30 group-hover:bg-gradient-to-br group-hover:from-[#c9a227] group-hover:to-[#a98208] group-hover:text-white group-hover:shadow-[0_10px_25px_rgba(190,150,35,0.22)] dark:border-[#c9a227]/20 dark:from-[#302814] dark:to-[#262116]">
                          <Icon
                            size={28}
                            strokeWidth={1.8}
                            className="transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e7e0d5] bg-white text-[#a8a094] transition group-hover:border-[#d7bd68]/40 group-hover:bg-[#fffaf0] group-hover:text-[#a17b00] dark:border-white/[0.08] dark:bg-[#211e18]">
                          <ArrowRight size={16} />
                        </div>
                      </div>

                      {/* TITLE */}

                      <div className="relative mt-5">
                        <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#25221d] transition-colors group-hover:text-[#9b7600] dark:text-[#f6f0e5] dark:group-hover:text-[#e0c35d]">
                          {category.name}
                        </h2>

                        <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#817b72] dark:text-[#aaa195]">
                          {category.description}
                        </p>
                      </div>

                      {/* STATS */}

                      <div className="relative mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-[#faf7ef] px-3 py-2.5 dark:bg-[#211e18]">
                          <div className="flex items-center gap-1.5">
                            <Package
                              size={13}
                              className="text-[#aa8500]"
                            />

                            <span className="text-xs font-bold text-[#5f594f] dark:text-[#c1b8a9]">
                              {categoryStats.count}
                            </span>
                          </div>

                          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#999184]">
                            Products
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#faf7ef] px-3 py-2.5 dark:bg-[#211e18]">
                          <div className="flex items-center gap-1.5">
                            <Star
                              size={13}
                              className="fill-[#c9a227] text-[#c9a227]"
                            />

                            <span className="text-xs font-bold text-[#5f594f] dark:text-[#c1b8a9]">
                              {categoryStats.rating > 0
                                ? categoryStats.rating.toFixed(1)
                                : "—"}
                            </span>
                          </div>

                          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#999184]">
                            Rating
                          </p>
                        </div>
                      </div>

                      {/* PRODUCT PREVIEW */}

                      {categoryStats.products.length > 0 && (
                        <div className="relative mt-4 flex items-center gap-2">
                          {categoryStats.products.map(
                            (product) => {
                              const image = getProductImage(
                                product.image_url
                              );

                              return (
                                <div
                                  key={product.id}
                                  className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[#e8dfd1] bg-[#faf8f3] dark:border-white/[0.08] dark:bg-[#211e18]"
                                  title={product.name}
                                >
                                  {image ? (
                                    <img
                                      src={image}
                                      alt=""
                                      className="h-full w-full object-contain p-1.5"
                                    />
                                  ) : (
                                    <Package
                                      size={17}
                                      className="text-[#b49b58]"
                                    />
                                  )}
                                </div>
                              );
                            }
                          )}

                          {categoryStats.count > 3 && (
                            <span className="text-[10px] font-bold text-[#9a7800]">
                              +{categoryStats.count - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* FOOTER */}

                      <div className="relative mt-auto pt-5">
                        <div className="flex items-center justify-between border-t border-[#eee8de] pt-5 dark:border-white/[0.06]">
                          <span className="text-sm font-bold text-[#9e7a08] dark:text-[#d2b24f]">
                            Explore products
                          </span>

                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff8df] text-[#a17b00] transition-all duration-300 group-hover:bg-[#c9a227] group-hover:text-white dark:bg-[#332a17] dark:text-[#dfc25f]">
                            <ArrowRight
                              size={15}
                              className="transition-transform group-hover:translate-x-0.5"
                            />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              );
            })}
          </motion.section>
        ) : (
          /* =================================================
             EMPTY STATE
          ================================================= */

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-[#e7dfd1] bg-white px-6 py-16 text-center dark:border-white/[0.08] dark:bg-[#181612]"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff8df] text-[#a27c00] dark:bg-[#342c18] dark:text-[#e0c35d]">
              <Search size={27} />
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-[#29251f] dark:text-white">
              No categories found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#837c72] dark:text-[#a59d91]">
              We couldn&apos;t find a category matching{" "}
              <span className="font-bold text-[#9b7600]">
                &quot;{searchQuery}&quot;
              </span>
              .
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-[#d7bd68]/45 bg-[#fff8df] px-5 py-3 text-sm font-bold text-[#8d6d00] transition hover:bg-[#ffefbd]"
            >
              <X size={16} />
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* ===================================================
            SMART SHOPPING CTA
        =================================================== */}

        <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* PRIMEMATCH */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[26px] border border-[#eadfc9] bg-white p-6 dark:border-white/[0.08] dark:bg-[#181612] sm:p-7"
          >
            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#c9a227]/10 blur-3xl" />

            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff8df] text-[#a17b00] dark:bg-[#332b18] dark:text-[#dfc25f]">
                <WandSparkles size={21} />
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#aa8b31]">
                PrimeMatch
              </p>

              <h3 className="mt-1 text-xl font-black text-[#29251f] dark:text-white">
                Not sure what to buy?
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#817b72] dark:text-[#aaa195]">
                Tell PrimeCart what you need, your budget and your
                priorities. Get recommendations made around you.
              </p>

              <Link
                href="/dashboard/primematch"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#b28b16] px-5 py-3 text-sm font-bold text-white shadow-[0_7px_20px_rgba(190,150,35,0.18)] transition hover:-translate-y-0.5 hover:from-[#b9951e] hover:to-[#a17c0e]"
              >
                Try PrimeMatch
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          {/* BUDGET BUILDER */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[26px] border border-[#eadfc9] bg-gradient-to-br from-[#fffdf8] to-[#fff8e8] p-6 dark:border-white/[0.08] dark:from-[#181612] dark:to-[#211e18] sm:p-7"
          >
            <div className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-[#c9a227]/10 blur-3xl" />

            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#a17b00] shadow-sm dark:bg-[#302814] dark:text-[#dfc25f]">
                <WalletCards size={21} />
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#aa8b31]">
                Budget Builder
              </p>

              <h3 className="mt-1 text-xl font-black text-[#29251f] dark:text-white">
                Shop within your budget.
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#817b72] dark:text-[#aaa195]">
                Set your budget and build a smart product collection
                without losing track of what matters.
              </p>

              <Link
                href="/dashboard/budget-builder"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#d4b85f]/50 bg-white px-5 py-3 text-sm font-bold text-[#8d6d00] shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9a227] hover:bg-[#fffaf0] dark:bg-[#211e18] dark:text-[#dfc25f]"
              >
                Build Your Budget
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ===================================================
            BOTTOM PRODUCT CTA
        =================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mt-6 overflow-hidden rounded-[26px] border border-[#eadfc9] bg-white p-6 dark:border-white/[0.08] dark:bg-[#181612] sm:p-7"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[#c9a227]/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#9a7800] dark:text-[#dfc25f]">
                <Sparkles size={16} />
                PrimeCart Collection
              </div>

              <h3 className="mt-1 text-lg font-extrabold text-[#29251f] dark:text-white">
                Prefer browsing everything?
              </h3>

              <p className="mt-1 max-w-xl text-sm leading-6 text-[#817b72] dark:text-[#aaa195]">
                Explore the complete PrimeCart product collection
                and discover your next favourite product.
              </p>
            </div>

            {/* GOLD BUTTON — NO BLACK */}

            <Link
              href="/dashboard/products"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#b28b16] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(190,150,35,0.20)] transition duration-300 hover:-translate-y-0.5 hover:from-[#b9951e] hover:to-[#a17c0e] hover:shadow-[0_12px_28px_rgba(190,150,35,0.28)]"
            >
              View All Products
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
