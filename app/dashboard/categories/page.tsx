"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Baby,
  BarChart3,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Footprints,
  Gamepad2,
  Home,
  Search,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  WashingMachine,
  Watch,
  X,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Category = {
  name: string;
  slug: string;
  description: string;
  icon: React.ElementType;
  image: string;
  keywords: string[];
};

type Product = {
  id: string;
  category_id: string | null;
  name: string;
  image_url: string | null;
  price: number | null;
  rating: number | null;
  is_flash_sale: boolean | null;
  category_slug?: string;
};

type CategoryStats = {
  total: number;
  inStock: number;
  flashDeals: number;
  averageRating: number;
  products: Product[];
};

const categories: Category[] = [
  {
    name: "Home & Living",
    slug: "home-living",
    description:
      "Furniture, decor, kitchen essentials and everything for a better home.",
    icon: Home,
    image: "/appliances.png",
    keywords: ["home", "living", "furniture", "decor", "kitchen"],
  },
  {
    name: "Mobile",
    slug: "mobile",
    description:
      "Smartphones, mobile accessories and everyday tech essentials.",
    icon: Smartphone,
    image: "/smartphone-x-pro.png",
    keywords: ["mobile", "phone", "smartphone", "electronics"],
  },
  {
    name: "Appliance",
    slug: "appliance",
    description:
      "Smart appliances designed to make everyday tasks easier.",
    icon: WashingMachine,
    image: "/air-fryer.png",
    keywords: ["appliance", "air fryer", "kitchen", "electric"],
  },
  {
    name: "Footwear",
    slug: "footwear",
    description:
      "Sneakers, running shoes, sandals and footwear for every occasion.",
    icon: Footprints,
    image: "/sports-running-shoes.png",
    keywords: ["footwear", "shoes", "sneakers", "running"],
  },
  {
    name: "Watch",
    slug: "watch",
    description:
      "Classic watches and smart timepieces for every style.",
    icon: Watch,
    image: "/classic-watch.png",
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
      "Useful car and bike accessories for safer, smarter journeys.",
    icon: Car,
    image: "/automotive.png",
    keywords: ["car", "bike", "automotive", "vehicle"],
  },
  {
    name: "Fashion",
    slug: "fashion",
    description:
      "Clothing and lifestyle essentials designed around your style.",
    icon: Shirt,
    image: "/denim-jacket.png",
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
];

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

function getProductImage(imageUrl?: string | null) {
  if (!imageUrl) {
    return "/logo.png";
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

function formatPrice(price: number | null) {
  if (price === null || Number.isNaN(price)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function getCategoryFallbackImage(category: Category) {
  return category.image;
}

export default function CategoriesPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(
          `
            id,
            category_id,
            name,
            image_url,
            price,
            rating,
            stock,
            is_flash_sale,
            categories!inner(
              slug
            )
          `,
        )
        .eq("is_active", true);

      if (error) {
        console.error("Categories products error:", error);

        if (mounted) {
          setProducts([]);
          setLoading(false);
        }

        return;
      }

      const formatted: Product[] = (data ?? []).map((item: any) => ({
        id: item.id,
        category_id: item.category_id,
        name: item.name,
        image_url: item.image_url,
        price: item.price,
        rating: item.rating,
        is_flash_sale: item.is_flash_sale,
        category_slug: Array.isArray(item.categories)
          ? item.categories?.[0]?.slug
          : item.categories?.slug,
      }));

      if (mounted) {
        setProducts(formatted);
        setLoading(false);
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const statsByCategory = useMemo(() => {
    const stats: Record<string, CategoryStats> = {};

    categories.forEach((category) => {
      const categoryProducts = products.filter(
        (product) => product.category_slug === category.slug,
      );

      const ratings = categoryProducts
        .map((product) => Number(product.rating))
        .filter((rating) => Number.isFinite(rating) && rating > 0);

      const flashDeals = categoryProducts.filter(
        (product) => product.is_flash_sale,
      ).length;

      stats[category.slug] = {
        total: categoryProducts.length,
        inStock: categoryProducts.length,
        flashDeals,
        averageRating:
          ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) /
              ratings.length
            : 0,
        products: categoryProducts.slice(0, 3),
      };
    });

    return stats;
  }, [products]);

  const totalProducts = products.length;

  const totalFlashDeals = products.filter(
    (product) => product.is_flash_sale,
  ).length;

  const overallRating = useMemo(() => {
    const ratings = products
      .map((product) => Number(product.rating))
      .filter((rating) => Number.isFinite(rating) && rating > 0);

    if (!ratings.length) return 0;

    return (
      ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    );
  }, [products]);

  const filteredCategories = useMemo(() => {
    let result = [...categories];

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((category) => {
        const searchable = [
          category.name,
          category.description,
          ...category.keywords,
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      });
    }

    if (activeFilter === "Deals") {
      result = result.filter(
        (category) => (statsByCategory[category.slug]?.flashDeals ?? 0) > 0,
      );
    }

    if (activeFilter === "Popular") {
      result = result.filter(
        (category) => (statsByCategory[category.slug]?.total ?? 0) > 0,
      );
    }

    if (activeFilter === "Top Rated") {
      result = result.filter(
        (category) =>
          (statsByCategory[category.slug]?.averageRating ?? 0) >= 4,
      );
    }

    if (sortBy === "products") {
      result.sort(
        (a, b) =>
          (statsByCategory[b.slug]?.total ?? 0) -
          (statsByCategory[a.slug]?.total ?? 0),
      );
    }

    if (sortBy === "rating") {
      result.sort(
        (a, b) =>
          (statsByCategory[b.slug]?.averageRating ?? 0) -
          (statsByCategory[a.slug]?.averageRating ?? 0),
      );
    }

    if (sortBy === "deals") {
      result.sort(
        (a, b) =>
          (statsByCategory[b.slug]?.flashDeals ?? 0) -
          (statsByCategory[a.slug]?.flashDeals ?? 0),
      );
    }

    return result;
  }, [search, activeFilter, sortBy, statsByCategory]);

  const trendingCategories = useMemo(() => {
    return [...categories]
      .sort(
        (a, b) =>
          (statsByCategory[b.slug]?.total ?? 0) -
          (statsByCategory[a.slug]?.total ?? 0),
      )
      .slice(0, 4);
  }, [statsByCategory]);

  return (
    <main className="min-h-screen bg-[#fffdf9] text-[#24211b]">
      {/* TOP BAR */}
      <div className="border-b border-[#eadfc9] bg-[#fffaf0]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-center gap-4 px-5 py-2 text-[11px] font-semibold text-[#806b3d] sm:gap-7 sm:text-xs">
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
            <ShoppingBag size={13} />
            Easy Returns
          </span>
        </div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#eadfc9]/80 bg-[#fffdf9]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#fff7df] shadow-sm ring-1 ring-[#c79a3b]/20">
              <img
                src="/logo.png"
                alt="PrimeCart"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <div className="text-xl font-black tracking-tight text-[#2a261e]">
                Prime<span className="text-[#b8872d]">Cart</span>
              </div>

              <div className="hidden text-[9px] font-bold uppercase tracking-[0.2em] text-[#a99873] sm:block">
                Shop Smarter
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#746a57] transition hover:bg-[#fff8e8] hover:text-[#8e6b24]"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/products"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#746a57] transition hover:bg-[#fff8e8] hover:text-[#8e6b24]"
            >
              Products
            </Link>

            <Link
              href="/dashboard/categories"
              className="rounded-xl bg-[#fff4d8] px-4 py-2.5 text-sm font-bold text-[#9a741e] ring-1 ring-[#c79a3b]/15"
            >
              Categories
            </Link>
          </nav>

          <Link
            href="/dashboard/products"
            className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-[#c79a3b] to-[#b8872d] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(184,135,45,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(184,135,45,0.28)] sm:flex"
          >
            Shop Products
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
        {/* BREADCRUMB */}
        <div className="mb-7 flex items-center gap-2 text-sm text-[#9a907d]">
          <Link
            href="/dashboard"
            className="transition hover:text-[#a67b22]"
          >
            Dashboard
          </Link>

          <ChevronRight size={14} />

          <span className="font-semibold text-[#50483a]">
            Categories
          </span>
        </div>

        {/* HERO */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative overflow-hidden rounded-[32px] border border-[#eadfc9] bg-gradient-to-br from-[#fffdf8] via-[#fffaf0] to-[#f9f0d9] px-6 py-8 shadow-[0_18px_60px_rgba(120,90,30,0.07)] sm:px-9 sm:py-10 lg:px-12 lg:py-12"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#c79a3b]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-[#e5c66d]/10 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c79a3b]/20 bg-white/70 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#9a741e] shadow-sm">
                <Sparkles size={13} />
                Explore PrimeCart
              </div>

              <h1 className="max-w-3xl text-3xl font-black tracking-[-0.04em] text-[#29251d] sm:text-4xl lg:text-6xl">
                Shop smarter with the right{" "}
                <span className="text-[#b8872d]">category.</span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#7c715d] sm:text-base">
                Explore products across everyday essentials, technology,
                fashion, gaming and more — all organized to make your
                shopping journey simpler.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c79a3b] to-[#b8872d] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(184,135,45,0.2)] transition hover:-translate-y-0.5"
                >
                  Explore Products
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/dashboard/primematch"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#d8c69f] bg-white/80 px-5 py-3 text-sm font-bold text-[#80601f] transition hover:border-[#c79a3b] hover:bg-[#fff8e7]"
                >
                  <Sparkles size={16} />
                  Try PrimeMatch
                </Link>
              </div>
            </div>

            {/* HERO STATS */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <StatCard
                icon={<ShoppingBag size={19} />}
                value={loading ? "—" : totalProducts.toString()}
                label="Products"
              />

              <StatCard
                icon={<Zap size={19} />}
                value={loading ? "—" : totalFlashDeals.toString()}
                label="Flash Deals"
              />

              <StatCard
                icon={<Star size={19} />}
                value={
                  loading || !overallRating
                    ? "—"
                    : overallRating.toFixed(1)
                }
                label="Avg Rating"
              />

              <StatCard
                icon={<BarChart3 size={19} />}
                value={categories.length.toString()}
                label="Categories"
              />
            </div>
          </div>
        </motion.section>

        {/* TRENDING */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-[#a47a22]">
                <TrendingUp size={15} />
                Trending Now
              </div>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Popular categories
              </h2>

              <p className="mt-1 text-sm text-[#8d8372]">
                Quickly jump into categories people are exploring.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="hidden items-center gap-1 text-sm font-bold text-[#a47720] sm:flex"
            >
              View products
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {trendingCategories.map((category, index) => {
              const Icon = category.icon;
              const stats = statsByCategory[category.slug];

              return (
                <Link
                  key={category.slug}
                  href={`/dashboard/categories/${category.slug}`}
                  className="group"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                    className="relative overflow-hidden rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-[0_8px_25px_rgba(0,0,0,0.025)] transition duration-300 hover:-translate-y-1 hover:border-[#c79a3b]/40 hover:shadow-[0_15px_35px_rgba(130,95,25,0.08)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff8e7] text-[#b8872d] transition group-hover:bg-[#c79a3b] group-hover:text-white">
                        <Icon size={21} />
                      </div>

                      <ArrowRight
                        size={16}
                        className="text-[#b5a98f] transition group-hover:translate-x-1 group-hover:text-[#a47720]"
                      />
                    </div>

                    <h3 className="mt-4 text-sm font-extrabold">
                      {category.name}
                    </h3>

                    <p className="mt-1 text-xs text-[#938875]">
                      {stats?.total ?? 0} products
                    </p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* SEARCH + FILTER */}
        <section className="mt-10">
          <div className="rounded-2xl border border-[#eadfc9] bg-white p-3 shadow-[0_10px_35px_rgba(0,0,0,0.035)] sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a99b80]"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search categories..."
                  className="h-12 w-full rounded-xl border border-[#eadfc9] bg-[#fffdf9] pl-11 pr-11 text-sm font-medium text-[#342e24] outline-none transition placeholder:text-[#aaa08f] focus:border-[#c79a3b] focus:ring-4 focus:ring-[#c79a3b]/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#998d78] transition hover:bg-[#fff3d6] hover:text-[#8e6b24]"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#dfcfac] bg-[#fff9eb] px-5 text-sm font-bold text-[#856525] transition hover:border-[#c79a3b] hover:bg-[#fff4d8] lg:hidden"
              >
                Filters
                <BarChart3 size={16} />
              </button>

              <div
                className={`${
                  showFilters ? "flex" : "hidden"
                } flex-col gap-2 lg:flex lg:flex-row`}
              >
                {["All", "Popular", "Deals", "Top Rated"].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`h-11 rounded-xl px-4 text-sm font-bold transition ${
                      activeFilter === filter
                        ? "bg-[#fff0c7] text-[#8e6b24] ring-1 ring-[#c79a3b]/25"
                        : "text-[#7d7465] hover:bg-[#fff9ed] hover:text-[#8e6b24]"
                    }`}
                  >
                    {filter}
                  </button>
                ))}

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-11 rounded-xl border border-[#eadfc9] bg-[#fffdf9] px-4 text-sm font-bold text-[#6f6657] outline-none focus:border-[#c79a3b]"
                >
                  <option value="popular">Sort: Popular</option>
                  <option value="products">Most Products</option>
                  <option value="rating">Highest Rated</option>
                  <option value="deals">Most Deals</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CATEGORY SECTION */}
        <section className="mt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-[#a47a22]">
                All Categories
              </div>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Explore everything
              </h2>

              <p className="mt-1 text-sm text-[#8d8372]">
                {filteredCategories.length} categories available
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[370px] animate-pulse rounded-[28px] border border-[#eadfc9] bg-white"
                >
                  <div className="h-48 rounded-t-[28px] bg-[#f6f0e2]" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/3 rounded bg-[#f3ecdc]" />
                    <div className="h-4 w-full rounded bg-[#f6f0e2]" />
                    <div className="h-4 w-4/5 rounded bg-[#f6f0e2]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <EmptyState
              search={search}
              onClear={() => {
                setSearch("");
                setActiveFilter("All");
              }}
            />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredCategories.map((category) => {
                const Icon = category.icon;
                const stats = statsByCategory[category.slug];

                return (
                  <motion.div key={category.slug} variants={fadeUp}>
                    <Link
                      href={`/dashboard/categories/${category.slug}`}
                      className="group block h-full"
                    >
                      <article className="relative h-full overflow-hidden rounded-[28px] border border-[#eadfc9] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.035)] transition duration-300 hover:-translate-y-1.5 hover:border-[#c79a3b]/40 hover:shadow-[0_20px_50px_rgba(130,95,25,0.1)]">
                        {/* IMAGE */}
                        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#fffaf0] to-[#f7efdc]">
                          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#c79a3b]/10 blur-2xl" />

                          <img
                            src={getCategoryFallbackImage(category)}
                            alt={category.name}
                            className="relative z-10 h-full w-full object-contain p-7 transition duration-500 group-hover:scale-105"
                            onError={(event) => {
                              event.currentTarget.src = "/logo.png";
                            }}
                          />

                          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#89671e] shadow-sm backdrop-blur">
                            <Icon size={12} />
                            {category.name}
                          </div>

                          {stats?.flashDeals > 0 && (
                            <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[#c79a3b] px-3 py-1.5 text-[10px] font-black text-white shadow-sm">
                              <Zap size={11} />
                              {stats.flashDeals} Deals
                            </div>
                          )}
                        </div>

                        {/* CONTENT */}
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-xl font-black tracking-tight text-[#302a20]">
                                {category.name}
                              </h3>

                              <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#887e6c]">
                                {category.description}
                              </p>
                            </div>

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#eadfc9] text-[#a98a50] transition group-hover:border-[#c79a3b]/30 group-hover:bg-[#fff6df] group-hover:text-[#a47720]">
                              <ArrowRight
                                size={15}
                                className="transition-transform group-hover:translate-x-0.5"
                              />
                            </div>
                          </div>

                          {/* STATS */}
                          <div className="mt-5 grid grid-cols-3 divide-x divide-[#eee6d6] rounded-xl border border-[#eee6d6] bg-[#fffdf9]">
                            <MiniStat
                              value={stats?.total ?? 0}
                              label="Products"
                            />

                            <MiniStat
                              value={stats?.flashDeals ?? 0}
                              label="Deals"
                            />

                            <MiniStat
                              value={
                                stats?.averageRating
                                  ? stats.averageRating.toFixed(1)
                                  : "—"
                              }
                              label="Rating"
                              star
                            />
                          </div>

                          {/* PREVIEW PRODUCTS */}
                          {stats?.products?.length > 0 && (
                            <div className="mt-5 flex items-center gap-2">
                              {stats.products.map((product) => (
                                <div
                                  key={product.id}
                                  className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[#eadfc9] bg-[#fffaf0]"
                                  title={product.name}
                                >
                                  <img
                                    src={getProductImage(product.image_url)}
                                    alt={product.name}
                                    className="h-full w-full object-contain p-1"
                                    onError={(event) => {
                                      event.currentTarget.src = "/logo.png";
                                    }}
                                  />
                                </div>
                              ))}

                              <span className="ml-auto flex items-center gap-1 text-xs font-bold text-[#9b8760]">
                                Explore
                                <ArrowRight size={13} />
                              </span>
                            </div>
                          )}

                          <div className="mt-5 flex items-center justify-between border-t border-[#f0e9dc] pt-4">
                            <span className="text-sm font-bold text-[#a47720]">
                              Explore products
                            </span>

                            {stats?.flashDeals ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-[#bd8121]">
                                <Clock3 size={12} />
                                Limited deals
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-[#9c927f]">
                                <CheckCircle2 size={12} />
                                Available now
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </section>

        {/* SMART SHOPPING SECTION */}
        <section className="mt-12 grid gap-5 lg:grid-cols-2">
          {/* PRIME MATCH */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[28px] border border-[#eadfc9] bg-gradient-to-br from-[#fffaf0] to-[#f8efd9] p-6 sm:p-8"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#c79a3b]/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c79a3b] text-white shadow-[0_8px_20px_rgba(184,135,45,0.2)]">
                <Sparkles size={22} />
              </div>

              <div className="text-xs font-black uppercase tracking-[0.15em] text-[#a47720]">
                PrimeMatch
              </div>

              <h3 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Not sure what to choose?
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#817562]">
                Tell PrimeMatch what you need, your budget and priorities.
                Get product suggestions tailored around your requirements.
              </p>

              <Link
                href="/dashboard/primematch"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c79a3b] to-[#b8872d] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(184,135,45,0.2)] transition hover:-translate-y-0.5"
              >
                Find My Products
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          {/* BUDGET BUILDER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="relative overflow-hidden rounded-[28px] border border-[#eadfc9] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.035)] sm:p-8"
          >
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-[#e8ca75]/15 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2cc] text-[#a47720] ring-1 ring-[#c79a3b]/20">
                <BarChart3 size={22} />
              </div>

              <div className="text-xs font-black uppercase tracking-[0.15em] text-[#a47720]">
                Budget Builder
              </div>

              <h3 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Build more within your budget.
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#817562]">
                Set a budget and create a smart shopping plan without
                manually checking hundreds of products.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {["₹5K", "₹10K", "₹25K", "Custom"].map((budget) => (
                  <span
                    key={budget}
                    className="rounded-full border border-[#eadfc9] bg-[#fffaf0] px-3 py-1.5 text-xs font-bold text-[#8b7140]"
                  >
                    {budget}
                  </span>
                ))}
              </div>

              <Link
                href="/dashboard/budget-builder"
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#d9c79e] bg-[#fff8e7] px-5 py-3 text-sm font-bold text-[#866521] transition hover:border-[#c79a3b] hover:bg-[#fff1cb]"
              >
                Build My Budget
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* BOTTOM CTA */}
        <section className="mt-12 overflow-hidden rounded-[28px] border border-[#eadfc9] bg-[#fffaf0]">
          <div className="flex flex-col items-center justify-between gap-5 px-6 py-8 text-center sm:px-10 lg:flex-row lg:text-left">
            <div>
              <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-[#a47720] lg:justify-start">
                <Sparkles size={14} />
                PrimeCart
              </div>

              <h3 className="mt-2 text-2xl font-black tracking-tight">
                Ready to discover your next favourite product?
              </h3>

              <p className="mt-1 text-sm text-[#897e6a]">
                Browse the complete PrimeCart product collection.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#c79a3b] to-[#b8872d] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(184,135,45,0.2)] transition hover:-translate-y-0.5"
            >
              View All Products
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-[#eadfc9] bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff3d4] text-[#a47720]">
        {icon}
      </div>

      <div className="mt-4 text-2xl font-black text-[#302a20] sm:text-3xl">
        {value}
      </div>

      <div className="mt-1 text-xs font-semibold text-[#958a76]">
        {label}
      </div>
    </div>
  );
}

function MiniStat({
  value,
  label,
  star = false,
}: {
  value: number | string;
  label: string;
  star?: boolean;
}) {
  return (
    <div className="px-2 py-3 text-center">
      <div className="flex items-center justify-center gap-1 text-sm font-black text-[#4a4030]">
        {star && <Star size={12} className="fill-[#c79a3b] text-[#c79a3b]" />}
        {value}
      </div>

      <div className="mt-0.5 text-[10px] font-semibold text-[#a09787]">
        {label}
      </div>
    </div>
  );
}

function EmptyState({
  search,
  onClear,
}: {
  search: string;
  onClear: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-[#dbcdaF] bg-[#fffaf0] px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0c7] text-[#a47720]">
        <Search size={26} />
      </div>

      <h3 className="mt-5 text-xl font-black">
        No categories found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8e8472]">
        We couldn&apos;t find any category matching{" "}
        <span className="font-bold text-[#6e5b37]">
          &quot;{search}&quot;
        </span>
        .
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-6 rounded-xl bg-gradient-to-r from-[#c79a3b] to-[#b8872d] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(184,135,45,0.18)] transition hover:-translate-y-0.5"
      >
        Clear Filters
      </button>
    </div>
  );
}
