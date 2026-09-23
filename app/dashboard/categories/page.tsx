"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Baby,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
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
  original_price?: number | null;
  rating: number | null;
  stock?: number | null;
  is_flash_sale: boolean | null;
  category_slug?: string;
};

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
    name: "Mobile",
    slug: "mobile",
    description:
      "Smartphones, accessories and mobile essentials for everyday connectivity.",
    icon: Smartphone,
    image: "/mobiles.png",
    keywords: ["mobile", "phone", "smartphone", "electronics"],
  },
  {
    name: "Appliance",
    slug: "appliance",
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
    image: "/sports-running-shoes.png",
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
    image: "/automotive.png",
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
      duration: 0.5,
      ease: "easeOut",
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
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
    },
  },
};

function getImage(src?: string | null) {
  if (!src) return "/logo.png";

  if (
    src.startsWith("/") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  ) {
    return src;
  }

  return `/${src}`;
}

function money(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function safeNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function CategoriesPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("recommended");

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const [wishlistCategories, setWishlistCategories] = useState<string[]>(
    [],
  );

  useEffect(() => {
    try {
      const recent = JSON.parse(
        localStorage.getItem("primecart_recent_categories") || "[]",
      );

      if (Array.isArray(recent)) {
        setRecentSlugs(recent);
      }

      const wishlist = JSON.parse(
        localStorage.getItem("primecart_category_wishlist") || "[]",
      );

      if (Array.isArray(wishlist)) {
        setWishlistCategories(wishlist);
      }
    } catch {
      setRecentSlugs([]);
      setWishlistCategories([]);
    }
  }, []);

  useEffect(() => {
    let active = true;

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
            original_price,
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
        console.error("PrimeCart categories error:", error);

        if (active) {
          setProducts([]);
          setLoading(false);
        }

        return;
      }

      const result: Product[] = (data ?? []).map((item: any) => ({
        id: item.id,
        category_id: item.category_id,
        name: item.name,
        image_url: item.image_url,
        price: item.price,
        original_price: item.original_price,
        rating: item.rating,
        stock: item.stock,
        is_flash_sale: item.is_flash_sale,
        category_slug: Array.isArray(item.categories)
          ? item.categories?.[0]?.slug
          : item.categories?.slug,
      }));

      if (active) {
        setProducts(result);
        setLoading(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [supabase]);

  const stats = useMemo(() => {
    const output: Record<string, CategoryStats> = {};

    categories.forEach((category) => {
      const list = products.filter(
        (product) => product.category_slug === category.slug,
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

      const discountValues = list
        .map((product) => {
          const price = safeNumber(product.price);
          const original = safeNumber(product.original_price);

          if (original <= 0 || price <= 0 || original <= price) {
            return 0;
          }

          return ((original - price) / original) * 100;
        })
        .filter((discount) => discount > 0);

      output[category.slug] = {
        products: list.slice(0, 5),
        total: list.length,
        inStock,
        lowStock,
        outOfStock,
        flashDeals,
        averageRating: ratings.length
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0,
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        averagePrice: prices.length
          ? prices.reduce((a, b) => a + b, 0) / prices.length
          : 0,
        discountPercentage: discountValues.length
          ? discountValues.reduce((a, b) => a + b, 0) /
            discountValues.length
          : 0,
      };
    });

    return output;
  }, [products]);

  const totalProducts = products.length;

  const totalDeals = products.filter(
    (product) => product.is_flash_sale,
  ).length;

  const ratings = products
    .map((product) => safeNumber(product.rating))
    .filter((rating) => rating > 0);

  const overallRating = ratings.length
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0;

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

    if (sort === "products") {
      result.sort(
        (a, b) =>
          stats[b.slug]?.total - stats[a.slug]?.total,
      );
    }

    if (sort === "rating") {
      result.sort(
        (a, b) =>
          stats[b.slug]?.averageRating -
          stats[a.slug]?.averageRating,
      );
    }

    if (sort === "deals") {
      result.sort(
        (a, b) =>
          stats[b.slug]?.flashDeals -
          stats[a.slug]?.flashDeals,
      );
    }

    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          stats[a.slug]?.minPrice - stats[b.slug]?.minPrice,
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) =>
          stats[b.slug]?.maxPrice - stats[a.slug]?.maxPrice,
      );
    }

    return result;
  }, [search, filter, sort, stats]);

  const trending = useMemo(() => {
    return [...categories]
      .sort(
        (a, b) =>
          stats[b.slug]?.total - stats[a.slug]?.total,
      )
      .slice(0, 4);
  }, [stats]);

  const recentlyViewed = useMemo(() => {
    return recentSlugs
      .map((slug) => categories.find((category) => category.slug === slug))
      .filter(Boolean) as Category[];
  }, [recentSlugs]);

  const recommended = useMemo(() => {
    return [...categories]
      .filter((category) => !recentSlugs.includes(category.slug))
      .sort((a, b) => {
        const aScore =
          stats[a.slug]?.averageRating * 2 +
          stats[a.slug]?.flashDeals +
          stats[a.slug]?.total / 10;

        const bScore =
          stats[b.slug]?.averageRating * 2 +
          stats[b.slug]?.flashDeals +
          stats[b.slug]?.total / 10;

        return bScore - aScore;
      })
      .slice(0, 4);
  }, [recentSlugs, stats]);

  function openCategory(category: Category) {
    setSelectedCategory(category);

    const updated = [
      category.slug,
      ...recentSlugs.filter((slug) => slug !== category.slug),
    ].slice(0, 5);

    setRecentSlugs(updated);

    try {
      localStorage.setItem(
        "primecart_recent_categories",
        JSON.stringify(updated),
      );
    } catch {
      // Ignore localStorage errors.
    }
  }

  function toggleCategoryWishlist(slug: string) {
    const exists = wishlistCategories.includes(slug);

    const updated = exists
      ? wishlistCategories.filter((item) => item !== slug)
      : [...wishlistCategories, slug];

    setWishlistCategories(updated);

    try {
      localStorage.setItem(
        "primecart_category_wishlist",
        JSON.stringify(updated),
      );
    } catch {
      // Ignore localStorage errors.
    }
  }

  return (
    <main className="min-h-screen bg-[#fffdf9] text-[#29251d]">
      {/* TOP STRIP */}
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

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#eadfc9]/80 bg-[#fffdf9]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
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

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#766c5b] hover:bg-[#fff8e8] hover:text-[#986f20]"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/products"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#766c5b] hover:bg-[#fff8e8] hover:text-[#986f20]"
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

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/products"
              className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-[#c79a3b] to-[#b8872d] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_22px_rgba(184,135,45,0.2)] transition hover:-translate-y-0.5 sm:flex"
            >
              Shop Products
              <ArrowRight size={15} />
            </Link>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#766c5b] md:hidden"
              onClick={() => setShowMobileFilters(true)}
            >
              <Menu size={19} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
        {/* BREADCRUMB */}
        <div className="mb-7 flex items-center gap-2 text-sm text-[#9c927f]">
          <Link
            href="/dashboard"
            className="hover:text-[#a47720]"
          >
            Dashboard
          </Link>

          <ChevronRight size={14} />

          <span className="font-bold text-[#50483a]">
            Categories
          </span>
        </div>

        {/* HERO */}
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
                <span className="text-[#b8872d]">
                  {" "}
                  faster.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#7f7461] sm:text-base">
                Explore PrimeCart categories, discover trending products,
                compare deals and find the right products for your needs.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/primematch"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c79a3b] to-[#b8872d] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(184,135,45,0.2)] hover:-translate-y-0.5"
                >
                  <Sparkles size={16} />
                  Try PrimeMatch
                </Link>

                <Link
                  href="/dashboard/products"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#dfcfac] bg-white/80 px-5 py-3 text-sm font-bold text-[#816222] hover:border-[#c79a3b] hover:bg-[#fff7e2]"
                >
                  Browse Products
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <HeroStat
                icon={<Layers3 size={18} />}
                value={categories.length.toString()}
                label="Categories"
              />

              <HeroStat
                icon={<ShoppingBag size={18} />}
                value={loading ? "—" : totalProducts.toString()}
                label="Products"
              />

              <HeroStat
                icon={<Zap size={18} />}
                value={loading ? "—" : totalDeals.toString()}
                label="Live Deals"
              />

              <HeroStat
                icon={<Star size={18} />}
                value={
                  overallRating
                    ? overallRating.toFixed(1)
                    : "—"
                }
                label="Avg Rating"
              />
            </div>
          </div>
        </motion.section>

        {/* SHOPPING INTENTS */}
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
              href="/dashboard/categories/mobile"
            />

            <IntentCard
              icon={<ShoppingBag size={22} />}
              title="Shop Within Budget"
              text="Create a smart shopping plan."
              href="/dashboard/budget-builder"
            />
          </div>
        </section>

        {/* TRENDING */}
        <section className="mt-11">
          <SectionHeading
            eyebrow="Trending"
            title="Popular categories"
            description="Explore categories with the most product activity."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-3 md:grid-cols-4"
          >
            {trending.map((category) => {
              const Icon = category.icon;
              const stat = stats[category.slug];

              return (
                <motion.div
                  key={category.slug}
                  variants={cardVariants}
                >
                  <Link
                    href={`/dashboard/categories/${category.slug}`}
                    className="group block"
                  >
                    <div className="rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-[0_8px_25px_rgba(0,0,0,0.025)] transition hover:-translate-y-1 hover:border-[#c79a3b]/40 hover:shadow-[0_15px_35px_rgba(130,95,25,0.08)]">
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff7e1] text-[#b8872d] group-hover:bg-[#c79a3b] group-hover:text-white">
                          <Icon size={21} />
                        </div>

                        <ArrowRight
                          size={15}
                          className="text-[#b7aa92] group-hover:translate-x-1 group-hover:text-[#a47720]"
                        />
                      </div>

                      <h3 className="mt-4 text-sm font-black">
                        {category.name}
                      </h3>

                      <div className="mt-1 flex items-center gap-2 text-xs text-[#958a78]">
                        <span>
                          {stat?.total ?? 0} products
                        </span>

                        {stat?.flashDeals > 0 && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-[#b77d1d]">
                              {stat.flashDeals} deals
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* SEARCH */}
        <section className="mt-11">
          <div className="rounded-2xl border border-[#eadfc9] bg-white p-3 shadow-[0_10px_35px_rgba(0,0,0,0.035)]">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a79b85]"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search categories, products or shopping needs..."
                  className="h-12 w-full rounded-xl border border-[#eadfc9] bg-[#fffdf9] pl-11 pr-11 text-sm font-medium outline-none placeholder:text-[#aaa08f] focus:border-[#c79a3b] focus:ring-4 focus:ring-[#c79a3b]/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#988d79] hover:bg-[#fff5de]"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="hidden items-center gap-1 lg:flex">
                {["All", "Deals", "Top Rated", "In Stock"].map(
                  (item) => (
                    <FilterButton
                      key={item}
                      active={filter === item}
                      onClick={() => setFilter(item)}
                    >
                      {item}
                    </FilterButton>
                  ),
                )}
              </div>

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-12 rounded-xl border border-[#eadfc9] bg-[#fffdf9] px-4 text-sm font-bold text-[#746957] outline-none focus:border-[#c79a3b]"
              >
                <option value="recommended">
                  Recommended
                </option>
                <option value="products">
                  Most Products
                </option>
                <option value="rating">
                  Highest Rated
                </option>
                <option value="deals">
                  Most Deals
                </option>
                <option value="price-low">
                  Lowest Starting Price
                </option>
                <option value="price-high">
                  Highest Price
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* RECENTLY VIEWED */}
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
                  onOpen={() => openCategory(category)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ALL CATEGORIES */}
        <section className="mt-11">
          <div className="mb-6 flex items-end justify-between">
            <div>
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
          </div>

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
              {filteredCategories.map((category) => {
                const stat = stats[category.slug];

                return (
                  <motion.div
                    key={category.slug}
                    variants={cardVariants}
                  >
                    <CategoryCard
                      category={category}
                      stats={stat}
                      isWishlisted={wishlistCategories.includes(
                        category.slug,
                      )}
                      onWishlist={() =>
                        toggleCategoryWishlist(category.slug)
                      }
                      onPreview={() => openCategory(category)}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </section>

        {/* RECOMMENDED */}
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
                className="inline-flex items-center gap-2 self-start rounded-xl border border-[#d9c79e] bg-white px-4 py-2.5 text-sm font-bold text-[#866521] hover:border-[#c79a3b]"
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
                  onOpen={() => openCategory(category)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* SMART TOOLS */}
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

        {/* FINAL CTA */}
        <section className="mt-12 rounded-[30px] border border-[#eadfc9] bg-white px-6 py-9 text-center shadow-[0_10px_35px_rgba(0,0,0,0.035)] sm:px-10">
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
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c79a3b] to-[#b8872d] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(184,135,45,0.2)] hover:-translate-y-0.5"
          >
            View All Products
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-[#5b4a2d]/25 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute bottom-0 left-0 right-0 rounded-t-[28px] border-t border-[#eadfc9] bg-[#fffdf9] p-5 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">
                  Filter Categories
                </h3>

                <p className="text-xs text-[#958a78]">
                  Choose what you want to explore.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowMobileFilters(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfc9]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {["All", "Deals", "Top Rated", "In Stock"].map(
                (item) => (
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
                ),
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* QUICK PREVIEW MODAL */}
      {selectedCategory && (
        <QuickPreview
          category={selectedCategory}
          stats={stats[selectedCategory.slug]}
          onClose={() => setSelectedCategory(null)}
          onWishlist={() =>
            toggleCategoryWishlist(selectedCategory.slug)
          }
          wishlisted={wishlistCategories.includes(
            selectedCategory.slug,
          )}
        />
      )}
    </main>
  );
}

/* ------------------------------------------------ */
/* COMPONENTS */
/* ------------------------------------------------ */

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
    <div className="rounded-2xl border border-[#eadfc9] bg-white/80 p-4 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff2cf] text-[#a47720]">
        {icon}
      </div>

      <div className="mt-3 text-2xl font-black">
        {value}
      </div>

      <div className="mt-0.5 text-xs font-semibold text-[#958a76]">
        {label}
      </div>
    </div>
  );
}

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

      <p className="mt-1 text-sm text-[#8d8372]">
        {description}
      </p>
    </div>
  );
}

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
    <Link href={href} className="group">
      <div className="h-full rounded-2xl border border-[#eadfc9] bg-white p-5 shadow-[0_8px_25px_rgba(0,0,0,0.025)] transition hover:-translate-y-1 hover:border-[#c79a3b]/40 hover:shadow-[0_15px_35px_rgba(130,95,25,0.08)]">
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff6df] text-[#b8872d] group-hover:bg-[#c79a3b] group-hover:text-white">
            {icon}
          </div>

          <ArrowRight
            size={16}
            className="text-[#b4a78f] transition group-hover:translate-x-1 group-hover:text-[#a47720]"
          />
        </div>

        <h3 className="mt-5 font-black">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-[#8c816f]">
          {text}
        </p>
      </div>
    </Link>
  );
}

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
          : "text-[#786e5e] hover:bg-[#fff8e9] hover:text-[#946c1e]"
      }`}
    >
      {children}
    </button>
  );
}

function CategoryCard({
  category,
  stats,
  isWishlisted,
  onWishlist,
  onPreview,
}: {
  category: Category;
  stats: CategoryStats;
  isWishlisted: boolean;
  onWishlist: () => void;
  onPreview: () => void;
}) {
  return (
    <article className="group relative h-full overflow-hidden rounded-[28px] border border-[#eadfc9] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.035)] transition duration-300 hover:-translate-y-1.5 hover:border-[#c79a3b]/40 hover:shadow-[0_20px_50px_rgba(130,95,25,0.1)]">
      {/* IMAGE */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#fffaf0] to-[#f7efdc]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#c79a3b]/10 blur-2xl" />

        <img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-contain p-7 transition duration-500 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = "/logo.png";
          }}
        />

        <div className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[10px] font-black text-[#866521] shadow-sm backdrop-blur">
          {category.name}
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            onWishlist();
          }}
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur transition ${
            isWishlisted
              ? "border-[#c79a3b]/30 bg-[#fff0c8] text-[#a47720]"
              : "border-white/80 bg-white/90 text-[#9c907b] hover:text-[#a47720]"
          }`}
        >
          <Heart
            size={15}
            className={
              isWishlisted ? "fill-current" : ""
            }
          />
        </button>

        {stats.flashDeals > 0 && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-[#c79a3b] px-3 py-1.5 text-[10px] font-black text-white shadow-sm">
            <Zap size={11} />
            {stats.flashDeals} Live Deals
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-black tracking-tight">
              {category.name}
            </h3>

            <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#887e6c]">
              {category.description}
            </p>
          </div>
        </div>

        {/* PRICE */}
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

        {/* STATS */}
        <div className="mt-4 grid grid-cols-3 divide-x divide-[#eee6d6] rounded-xl border border-[#eee6d6] bg-[#fffdf9]">
          <SmallStat
            value={stats.total}
            label="Products"
          />

          <SmallStat
            value={stats.inStock}
            label="In Stock"
          />

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

        {/* STOCK */}
        <div className="mt-4 flex items-center justify-between">
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

        {/* PRODUCT PREVIEW */}
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

        {/* ACTIONS */}
        <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
          <Link
            href={`/dashboard/categories/${category.slug}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c79a3b] to-[#b8872d] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(184,135,45,0.15)] transition hover:-translate-y-0.5"
          >
            Explore
            <ArrowRight size={15} />
          </Link>

          <button
            type="button"
            onClick={onPreview}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#eadfc9] bg-[#fffaf0] text-[#907448] transition hover:border-[#c79a3b] hover:bg-[#fff1cd] hover:text-[#8c681f]"
            title="Quick preview"
          >
            <Eye size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

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
          <Star
            size={11}
            className="fill-[#c79a3b] text-[#c79a3b]"
          />
        )}

        {value}
      </div>

      <div className="mt-0.5 text-[10px] font-semibold text-[#a09787]">
        {label}
      </div>
    </div>
  );
}

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
      className="group min-w-[235px] flex-1 rounded-2xl border border-[#eadfc9] bg-white p-4 text-left shadow-[0_8px_25px_rgba(0,0,0,0.025)] transition hover:-translate-y-1 hover:border-[#c79a3b]/40"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#fff8e8]">
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-contain p-2"
            onError={(event) => {
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
                <Star
                  size={11}
                  className="fill-[#c79a3b] text-[#c79a3b]"
                />
                <span>
                  {stats.averageRating.toFixed(1)}
                </span>
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
          className="ml-auto shrink-0 text-[#b8aa91] transition group-hover:translate-x-1 group-hover:text-[#a47720]"
        />
      </div>
    </button>
  );
}

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

      <h3 className="mt-2 text-xl font-black">
        {title}
      </h3>

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

function EmptyState({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-[#d9cbaE] bg-[#fffaf0] px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0c8] text-[#a47720]">
        <Search size={26} />
      </div>

      <h3 className="mt-5 text-xl font-black">
        No categories found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8e8472]">
        Try another search or remove the active filters to see more
        categories.
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

function QuickPreview({
  category,
  stats,
  onClose,
  onWishlist,
  wishlisted,
}: {
  category: Category;
  stats: CategoryStats;
  onClose: () => void;
  onWishlist: () => void;
  wishlisted: boolean;
}) {
  const Icon = category.icon;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute inset-0 bg-[#4f412a]/30 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-auto rounded-[30px] border border-[#eadfc9] bg-[#fffdf9] shadow-2xl"
      >
        <div className="sticky right-0 top-0 z-20 flex justify-end p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#766c5b] shadow-sm hover:bg-[#fff7e4]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-7 px-6 pb-7 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:pb-10">
          <div className="relative flex min-h-[270px] items-center justify-center overflow-hidden rounded-[26px] bg-gradient-to-br from-[#fffaf0] to-[#f7efdc]">
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white bg-white/90 px-3 py-1.5 text-xs font-bold text-[#866521]">
              <Icon size={13} />
              {category.name}
            </div>

            <img
              src={category.image}
              alt={category.name}
              className="h-full max-h-[310px] w-full object-contain p-8"
              onError={(event) => {
                event.currentTarget.src = "/logo.png";
              }}
            />
          </div>

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
                onClick={onWishlist}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  wishlisted
                    ? "border-[#c79a3b]/30 bg-[#fff0c8] text-[#a47720]"
                    : "border-[#eadfc9] bg-white text-[#9c907b]"
                }`}
              >
                <Heart
                  size={17}
                  className={
                    wishlisted ? "fill-current" : ""
                  }
                />
              </button>
            </div>

            <p className="mt-4 text-sm leading-7 text-[#807563]">
              {category.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <PreviewStat
                value={stats.total}
                label="Products"
              />

              <PreviewStat
                value={stats.inStock}
                label="In Stock"
              />

              <PreviewStat
                value={
                  stats.averageRating
                    ? stats.averageRating.toFixed(1)
                    : "—"
                }
                label="Rating"
              />

              <PreviewStat
                value={stats.flashDeals}
                label="Deals"
              />
            </div>

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

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-black">
                  Popular products
                </h3>

                <span className="text-xs font-bold text-[#9b8760]">
                  {stats.products.length} previewed
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
                            <Star
                              size={10}
                              className="fill-[#c79a3b] text-[#c79a3b]"
                            />
                            {product.rating}
                          </span>
                        ) : null}

                        {product.stock !== undefined && (
                          <>
                            <span>•</span>
                            <span>
                              {safeNumber(product.stock) > 0
                                ? "In stock"
                                : "Out of stock"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-sm font-black text-[#6d572d]">
                      {money(product.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href={`/dashboard/categories/${category.slug}`}
              onClick={onClose}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c79a3b] to-[#b8872d] px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(184,135,45,0.2)]"
            >
              Explore {category.name}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PreviewStat({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-[#eadfc9] bg-white px-3 py-3 text-center">
      <div className="text-lg font-black">
        {value}
      </div>

      <div className="mt-0.5 text-[10px] font-semibold text-[#9c917e]">
        {label}
      </div>
    </div>
  );
}
