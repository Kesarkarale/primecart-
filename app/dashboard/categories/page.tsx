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
  SlidersHorizontal,
} from "lucide-react";

import { createClient } from "@supabase/supabase-js";

/* =========================================================
   SUPABASE CLIENT
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
    accent: "Warm Living",
  },
  {
    name: "Mobile",
    slug: "mobile",
    description:
      "Smartphones, accessories and mobile essentials for everyday use.",
    icon: Smartphone,
    label: "Tech & Mobile",
    accent: "Smart Tech",
  },
  {
    name: "Appliance",
    slug: "appliance",
    description:
      "Smart and useful appliances designed to make life easier.",
    icon: WashingMachine,
    label: "Smart Appliances",
    accent: "Home Tech",
  },
  {
    name: "Footwear",
    slug: "footwear",
    description:
      "Shoes, sneakers, sandals and everyday footwear for every style.",
    icon: Footprints,
    label: "Shoes & Sneakers",
    accent: "Step in Style",
  },
  {
    name: "Watch",
    slug: "watch",
    description:
      "Smart watches and classic timepieces for every occasion.",
    icon: Watch,
    label: "Timepieces",
    accent: "Timeless Style",
  },
  {
    name: "Bag",
    slug: "bag",
    description:
      "Backpacks, handbags and travel bags for work, travel and lifestyle.",
    icon: ShoppingBag,
    label: "Bags & Travel",
    accent: "Carry Better",
  },
  {
    name: "Toy & Baby",
    slug: "toy-baby",
    description:
      "Toys, baby products and kids essentials for little ones.",
    icon: Baby,
    label: "Kids & Baby",
    accent: "Little Joys",
  },
  {
    name: "Automotive",
    slug: "automotive",
    description:
      "Car and bike accessories for a smoother everyday drive.",
    icon: Car,
    label: "Auto Essentials",
    accent: "Drive Better",
  },
  {
    name: "Fashion",
    slug: "fashion",
    description:
      "Clothing, accessories and lifestyle fashion for your everyday look.",
    icon: Shirt,
    label: "Style & Fashion",
    accent: "Your Style",
  },
  {
    name: "Gaming",
    slug: "gaming",
    description:
      "Gaming accessories and entertainment gear for your setup.",
    icon: Gamepad2,
    label: "Gaming Gear",
    accent: "Level Up",
  },
];

/* =========================================================
   FILTERS
========================================================= */

const filters = [
  {
    id: "all",
    label: "All Categories",
  },
  {
    id: "popular",
    label: "Popular",
  },
  {
    id: "tech",
    label: "Tech",
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
  },
];

/* =========================================================
   ANIMATION VARIANTS
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

type ProductCount = {
  slug: string;
  count: number;
};

/* =========================================================
   PAGE
========================================================= */

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [productCounts, setProductCounts] = useState<ProductCount[]>([]);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     LOAD PRODUCT COUNTS
  ======================================================= */

  const loadProductCounts = async () => {
    try {
      setLoadingCounts(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("products")
        .select(
          `
          category_id,
          categories!inner(
            slug
          )
        `
        )
        .eq("is_active", true);

      if (fetchError) {
        throw fetchError;
      }

      const countMap: Record<string, number> = {};

      data?.forEach((item: any) => {
        const slug = item?.categories?.slug;

        if (slug) {
          countMap[slug] = (countMap[slug] || 0) + 1;
        }
      });

      const result = categories.map((category) => ({
        slug: category.slug,
        count: countMap[category.slug] || 0,
      }));

      setProductCounts(result);
    } catch (err) {
      console.error("Category product count error:", err);

      setError(
        "Unable to load product counts right now. Categories are still available."
      );

      setProductCounts(
        categories.map((category) => ({
          slug: category.slug,
          count: 0,
        }))
      );
    } finally {
      setLoadingCounts(false);
    }
  };

  useEffect(() => {
    loadProductCounts();
  }, []);

  /* =======================================================
     GET PRODUCT COUNT
  ======================================================= */

  const getProductCount = (slug: string) => {
    return productCounts.find((item) => item.slug === slug)?.count ?? 0;
  };

  /* =======================================================
     TOTAL PRODUCTS
  ======================================================= */

  const totalProducts = useMemo(() => {
    return productCounts.reduce((total, item) => total + item.count, 0);
  }, [productCounts]);

  /* =======================================================
     FILTER CATEGORIES
  ======================================================= */

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = [...categories];

    if (query) {
      result = result.filter((category) => {
        return (
          category.name.toLowerCase().includes(query) ||
          category.description.toLowerCase().includes(query) ||
          category.label.toLowerCase().includes(query) ||
          category.accent.toLowerCase().includes(query)
        );
      });
    }

    if (activeFilter === "popular") {
      result = result.filter(
        (category) => getProductCount(category.slug) > 0
      );

      result.sort(
        (a, b) =>
          getProductCount(b.slug) - getProductCount(a.slug)
      );
    }

    if (activeFilter === "tech") {
      const techSlugs = [
        "mobile",
        "appliance",
        "watch",
        "gaming",
      ];

      result = result.filter((category) =>
        techSlugs.includes(category.slug)
      );
    }

    if (activeFilter === "lifestyle") {
      const lifestyleSlugs = [
        "home-living",
        "footwear",
        "bag",
        "toy-baby",
        "automotive",
        "fashion",
      ];

      result = result.filter((category) =>
        lifestyleSlugs.includes(category.slug)
      );
    }

    return result;
  }, [searchQuery, activeFilter, productCounts]);

  /* =======================================================
     CLEAR SEARCH
  ======================================================= */

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#171717] transition-colors dark:bg-[#11100d] dark:text-[#f6f1e7]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#e8dfcf] bg-white/95 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#15130f]/95">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* LOGO */}

          <Link
            href="/dashboard"
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#d8b94f] via-[#c9a227] to-[#a98513] text-white shadow-[0_7px_20px_rgba(185,145,35,0.22)]">
              <span className="relative z-10 text-lg font-black">
                P
              </span>

              <div className="absolute -right-3 -top-3 h-7 w-7 rounded-full bg-white/20 blur-md" />
            </div>

            <div>
              <div className="text-xl font-black tracking-tight text-[#171717] dark:text-[#f8f1e5]">
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
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#746f66] transition hover:bg-[#faf8f3] hover:text-[#171717] dark:text-[#b9b0a1] dark:hover:bg-white/[0.06] dark:hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/products"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#746f66] transition hover:bg-[#faf8f3] hover:text-[#171717] dark:text-[#b9b0a1] dark:hover:bg-white/[0.06] dark:hover:text-white"
            >
              Products
            </Link>

            <Link
              href="/dashboard/categories"
              className="border border-[#d9bd67]/30 bg-[#fff8df] px-4 py-2.5 text-sm font-bold text-[#8d6d00] shadow-sm rounded-xl dark:border-[#c9a227]/30 dark:bg-[#3a3018] dark:text-[#e1c766]"
            >
              Categories
            </Link>

            <Link
              href="/dashboard"
              className="ml-1 flex items-center gap-2 rounded-xl bg-[#171717] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#b08a00]"
            >
              Dashboard
              <ArrowRight size={15} />
            </Link>
          </nav>

          {/* MOBILE */}

          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-[#fff8df] px-3.5 py-2.5 text-sm font-bold text-[#8d6d00] md:hidden dark:bg-[#3a3018] dark:text-[#e0c35d]"
          >
            <Home size={16} />
            Home
          </Link>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
        {/* BREADCRUMB */}

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-7 flex items-center gap-2 text-sm"
        >
          <Link
            href="/dashboard"
            className="font-medium text-[#8b857a] transition hover:text-[#9b7600]"
          >
            Dashboard
          </Link>

          <ChevronRight
            size={15}
            className="text-[#b8b1a5]"
          />

          <span className="font-semibold text-[#332f29] dark:text-[#eee5d7]">
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
          className="relative mb-7 overflow-hidden rounded-[30px] border border-[#eadfc9] bg-white px-6 py-7 shadow-[0_10px_40px_rgba(80,65,35,0.045)] dark:border-white/[0.08] dark:bg-[#181612] sm:px-8 sm:py-8 lg:px-10"
        >
          {/* GLOW */}

          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#d4b13f]/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 right-48 h-48 w-48 rounded-full bg-[#d4b13f]/[0.06] blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d6bd70]/35 bg-[#fffaf0] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#9a7800] dark:border-[#c9a227]/25 dark:bg-[#302814] dark:text-[#e0c35d]">
                <Sparkles size={13} />
                Explore Categories
              </div>

              <h1 className="text-3xl font-black tracking-[-0.03em] text-[#171717] dark:text-white sm:text-4xl lg:text-5xl">
                Shop by{" "}
                <span className="bg-gradient-to-r from-[#b08a00] to-[#c6a334] bg-clip-text text-transparent">
                  Category
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#787268] dark:text-[#aaa195] sm:text-base">
                Explore everything on PrimeCart through curated
                shopping categories. Find products faster and
                discover something new.
              </p>
            </div>

            {/* STATS */}

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf8] px-5 py-4 dark:border-white/[0.08] dark:bg-[#211e18]">
                <div className="flex items-center gap-2">
                  <Grid3X3
                    size={16}
                    className="text-[#b08a00]"
                  />

                  <span className="text-2xl font-black text-[#29251f] dark:text-white">
                    {categories.length}
                  </span>
                </div>

                <p className="mt-1 text-[11px] font-semibold text-[#918a7e]">
                  Categories
                </p>
              </div>

              <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf8] px-5 py-4 dark:border-white/[0.08] dark:bg-[#211e18]">
                <div className="flex items-center gap-2">
                  <Package
                    size={16}
                    className="text-[#b08a00]"
                  />

                  <span className="text-2xl font-black text-[#29251f] dark:text-white">
                    {loadingCounts ? "—" : totalProducts}
                  </span>
                </div>

                <p className="mt-1 text-[11px] font-semibold text-[#918a7e]">
                  Active Products
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ===================================================
            SEARCH + FILTER
        =================================================== */}

        <section className="mb-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* SEARCH */}

            <div className="relative w-full max-w-2xl">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a59e92]"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search categories..."
                aria-label="Search categories"
                className="h-14 w-full rounded-2xl border border-[#e4dac6] bg-white pl-12 pr-12 text-sm font-medium text-[#29251f] outline-none shadow-[0_6px_25px_rgba(70,55,30,0.035)] transition placeholder:text-[#aaa397] focus:border-[#c9a227]/60 focus:ring-4 focus:ring-[#c9a227]/10 dark:border-white/[0.08] dark:bg-[#181612] dark:text-white dark:placeholder:text-[#857d71]"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#91897c] transition hover:bg-[#faf6e8] hover:text-[#8d6d00] dark:hover:bg-white/[0.06]"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            {/* FILTER LABEL */}

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#91897e]">
              <SlidersHorizontal size={15} />
              Filter
            </div>
          </div>

          {/* FILTER CHIPS */}

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => {
              const active = activeFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                    active
                      ? "bg-[#171717] text-white shadow-sm dark:bg-[#c9a227] dark:text-[#17130a]"
                      : "border border-[#e4dac6] bg-white text-[#756f65] hover:border-[#c9a227]/40 hover:text-[#967300] dark:border-white/[0.08] dark:bg-[#181612] dark:text-[#aaa195]"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ===================================================
            ERROR MESSAGE
        =================================================== */}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#eadfc9] bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08] dark:bg-[#181612]"
          >
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
              onClick={loadProductCounts}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#171717] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#b08a00]"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </motion.div>
        )}

        {/* ===================================================
            RESULT INFO
        =================================================== */}

        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#37322b] dark:text-[#eee5d7]">
              {searchQuery
                ? `${filteredCategories.length} ${
                    filteredCategories.length === 1
                      ? "category"
                      : "categories"
                  } found`
                : `${filteredCategories.length} categories`}
            </p>

            {searchQuery && (
              <p className="mt-1 text-xs text-[#918a7e]">
                Results for &quot;{searchQuery}&quot;
              </p>
            )}
          </div>

          {activeFilter !== "all" && (
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className="text-xs font-bold text-[#9b7600] hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* ===================================================
            LOADING SKELETON
        =================================================== */}

        {loadingCounts ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category.slug}
                className="min-h-[290px] animate-pulse rounded-[26px] border border-[#e8dfd1] bg-white p-6 dark:border-white/[0.08] dark:bg-[#181612]"
              >
                <div className="h-[60px] w-[60px] rounded-[19px] bg-[#f2ede3] dark:bg-[#28241d]" />

                <div className="mt-6 h-3 w-24 rounded bg-[#f2ede3] dark:bg-[#28241d]" />

                <div className="mt-3 h-6 w-36 rounded bg-[#eee8dc] dark:bg-[#28241d]" />

                <div className="mt-3 space-y-2">
                  <div className="h-3 w-full rounded bg-[#f2ede3] dark:bg-[#28241d]" />
                  <div className="h-3 w-4/5 rounded bg-[#f2ede3] dark:bg-[#28241d]" />
                </div>

                <div className="mt-8 border-t border-[#eee8de] pt-5 dark:border-white/[0.06]">
                  <div className="h-4 w-28 rounded bg-[#f2ede3] dark:bg-[#28241d]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length > 0 ? (
          /* =================================================
             CATEGORY GRID
          ================================================= */

          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredCategories.map((category, index) => {
              const Icon = category.icon;
              const count = getProductCount(category.slug);

              const isTopCategory =
                count > 0 &&
                count ===
                  Math.max(
                    ...productCounts.map((item) => item.count)
                  );

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
                    <article className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-[26px] border border-[#e7dfd1] bg-white p-6 shadow-[0_8px_35px_rgba(80,65,35,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#d3b45c]/50 hover:shadow-[0_20px_50px_rgba(100,75,20,0.10)] dark:border-white/[0.08] dark:bg-[#181612] dark:hover:border-[#c9a227]/30">
                      {/* TOP GOLD LINE */}

                      <div className="absolute left-0 top-0 h-1 w-0 bg-gradient-to-r from-[#b08a00] to-[#e0c768] transition-all duration-500 group-hover:w-full" />

                      {/* BACKGROUND GLOW */}

                      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#c9a227]/[0.08] blur-2xl transition duration-500 group-hover:bg-[#c9a227]/[0.17]" />

                      {/* POPULAR BADGE */}

                      {isTopCategory && (
                        <div className="absolute right-5 top-5 z-10 flex items-center gap-1.5 rounded-full border border-[#d8bd68]/30 bg-[#fffaf0] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#9a7800] dark:border-[#c9a227]/25 dark:bg-[#342c18] dark:text-[#e0c35d]">
                          <TrendingUp size={11} />
                          Popular
                        </div>
                      )}

                      {/* ICON */}

                      <div className="relative flex items-start justify-between">
                        <div className="flex h-[60px] w-[60px] items-center justify-center rounded-[19px] border border-[#e8dcb9] bg-gradient-to-br from-[#fffaf0] to-[#faf3dc] text-[#aa8500] transition-all duration-300 group-hover:border-[#c9a227]/30 group-hover:bg-gradient-to-br group-hover:from-[#c9a227] group-hover:to-[#a98208] group-hover:text-white group-hover:shadow-[0_10px_25px_rgba(190,150,35,0.22)] dark:border-[#c9a227]/20 dark:from-[#302814] dark:to-[#262116]">
                          <Icon
                            size={28}
                            strokeWidth={1.8}
                            className="transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e7e0d5] bg-white text-[#a8a094] transition-all duration-300 group-hover:border-[#d7bd68]/40 group-hover:bg-[#fffaf0] group-hover:text-[#a17b00] dark:border-white/[0.08] dark:bg-[#211e18]">
                          <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-0.5"
                          />
                        </div>
                      </div>

                      {/* CONTENT */}

                      <div className="relative mt-6 flex-1">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#aa8b31]">
                            {category.label}
                          </span>

                          {index < 3 && !isTopCategory && (
                            <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#aaa196]">
                              Featured
                            </span>
                          )}
                        </div>

                        <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#25221d] transition-colors duration-300 group-hover:text-[#9b7600] dark:text-[#f6f0e5] dark:group-hover:text-[#e0c35d]">
                          {category.name}
                        </h2>

                        <p className="mt-2 min-h-[50px] text-sm leading-6 text-[#817b72] dark:text-[#aaa195]">
                          {category.description}
                        </p>

                        {/* PRODUCT COUNT */}

                        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#faf7ef] px-3 py-2 dark:bg-[#211e18]">
                          <Package
                            size={14}
                            className="text-[#aa8500]"
                          />

                          <span className="text-xs font-bold text-[#6f695f] dark:text-[#bdb4a6]">
                            {count}{" "}
                            {count === 1
                              ? "product"
                              : "products"}
                          </span>
                        </div>
                      </div>

                      {/* FOOTER */}

                      <div className="relative mt-6 flex items-center justify-between border-t border-[#eee8de] pt-5 dark:border-white/[0.06]">
                        <span className="text-sm font-bold text-[#9e7a08] dark:text-[#d2b24f]">
                          Explore products
                        </span>

                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff8df] text-[#a17b00] transition-all duration-300 group-hover:bg-[#c9a227] group-hover:text-white dark:bg-[#332a17] dark:text-[#dfc25f]">
                          <ArrowRight
                            size={15}
                            className="transition-transform duration-300 group-hover:translate-x-0.5"
                          />
                        </span>
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
            className="rounded-[28px] border border-[#e7dfd1] bg-white px-6 py-16 text-center shadow-[0_8px_35px_rgba(80,65,35,0.035)] dark:border-white/[0.08] dark:bg-[#181612]"
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

            <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#b08a00]"
                >
                  <X size={16} />
                  Clear Search
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2d8c7] bg-white px-5 py-3 text-sm font-bold text-[#6f685e] transition hover:border-[#c9a227]/40 hover:text-[#987500] dark:border-white/[0.08] dark:bg-[#211e18] dark:text-[#b9b0a2]"
              >
                Show All Categories
              </button>
            </div>
          </motion.div>
        )}

        {/* ===================================================
            BOTTOM CTA
        =================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="relative mt-8 overflow-hidden rounded-[26px] border border-[#eadfc9] bg-gradient-to-r from-[#fffdf8] via-white to-[#fffaf0] p-6 dark:border-white/[0.08] dark:from-[#181612] dark:via-[#1b1915] dark:to-[#211e18] sm:p-7"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[#c9a227]/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#9a7800] dark:text-[#dfc25f]">
                <Sparkles size={16} />
                PrimeCart Collections
              </div>

              <h3 className="mt-1 text-lg font-extrabold text-[#29251f] dark:text-white">
                Find what you need, faster.
              </h3>

              <p className="mt-1 max-w-xl text-sm leading-6 text-[#817b72] dark:text-[#aaa195]">
                Explore products across PrimeCart and discover
                items that fit your shopping needs.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#b08a00]"
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
