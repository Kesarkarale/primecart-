"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Menu,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

/* =========================================================
   TYPES
========================================================= */

type Product = {
  id: string;
  name: string;
  slug?: string | null;
  short_description?: string | null;
  description?: string | null;
  price: number;
  original_price?: number | null;
  stock?: number | null;
  image_url?: string | null;
  brand?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  is_featured?: boolean | null;
  is_flash_sale?: boolean | null;
  is_active?: boolean | null;
  category_id?: string | null;
};

type Category = {
  id?: string;
  name: string;
  slug: string;
  image: string;
  products?: string;
};

/* =========================================================
   STATIC CATEGORIES
========================================================= */

const categories: Category[] = [
  {
    name: "Electronics",
    slug: "electronics",
    image: "/electronics.png",
    products: "Smart tech",
  },
  {
    name: "Fashion",
    slug: "fashion",
    image: "/fashion.png",
    products: "Latest styles",
  },
  {
    name: "Watches",
    slug: "watches",
    image: "/watch.png",
    products: "Premium watches",
  },
  {
    name: "Beauty",
    slug: "beauty",
    image: "/beauty.png",
    products: "Beauty essentials",
  },
  {
    name: "Home & Living",
    slug: "home-and-living",
    image: "/home.png",
    products: "For your home",
  },
  {
    name: "Gaming",
    slug: "gaming",
    image: "/gaming.png",
    products: "Gaming gear",
  },
];

/* =========================================================
   HERO SLIDES
========================================================= */

const heroSlides = [
  {
    eyebrow: "PRIMECART EXCLUSIVE",
    title: "Shop Smarter.",
    highlight: "Choose Better.",
    description:
      "Discover products that match your needs, budget and lifestyle — all from one intelligent shopping destination.",
    badge: "Smart Shopping",
    primary: "Explore Products",
    secondary: "Try PrimeMatch",
  },
  {
    eyebrow: "FLASH DEALS",
    title: "Big Deals.",
    highlight: "Limited Time.",
    description:
      "Grab exciting offers across electronics, fashion, beauty, home and more before the deals disappear.",
    badge: "Limited Time",
    primary: "Shop Deals",
    secondary: "View Categories",
  },
  {
    eyebrow: "PRIMECART PICKS",
    title: "Curated For",
    highlight: "You.",
    description:
      "Explore hand-picked products selected to make your everyday shopping experience easier.",
    badge: "Editor's Picks",
    primary: "Explore Picks",
    secondary: "Find My Match",
  },
];

/* =========================================================
   FEATURE CARDS
========================================================= */

const smartShoppingFeatures = [
  {
    icon: Sparkles,
    title: "PrimeMatch",
    description:
      "Find products according to your needs, budget and priorities.",
    href: "/dashboard/prime-match",
    button: "Find My Match",
  },
  {
    icon: SlidersHorizontal,
    title: "Budget Builder",
    description:
      "Plan your shopping and build the right combination within your budget.",
    href: "/dashboard/budget-builder",
    button: "Build Budget",
  },
  {
    icon: PackageCheck,
    title: "Build My Setup",
    description:
      "Create complete gaming, college, work, fitness or home setups.",
    href: "/dashboard/setup-builder",
    button: "Build Setup",
  },
  {
    icon: Star,
    title: "PrimePoints",
    description:
      "Earn points through shopping, challenges and PrimeCart activities.",
    href: "/dashboard/prime-points",
    button: "Earn Rewards",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getDiscount(
  price: number,
  originalPrice?: number | null
) {
  if (!originalPrice || originalPrice <= price) return 0;

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100
  );
}

function getImageUrl(image?: string | null) {
  if (!image) return "/hero-product.png";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/")
  ) {
    return image;
  }

  return `/${image}`;
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
}: {
  product: Product;
}) {
  const discount = getDiscount(
    product.price,
    product.original_price
  );

  const image = getImageUrl(product.image_url);

  return (
    <Link
      href={`/dashboard/product/${product.id}`}
      className="group relative flex min-w-[245px] flex-col overflow-hidden rounded-[24px] border border-[#ebe4d7] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-w-0"
    >
      {/* wishlist */}

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#ebe4d7] bg-white/95 text-gray-500 shadow-sm transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
        aria-label="Add to wishlist"
      >
        <Heart size={17} />
      </button>

      {/* discount */}

      {discount > 0 && (
        <div className="absolute left-3 top-3 z-10 rounded-full bg-[#171512] px-2.5 py-1 text-[10px] font-bold text-white">
          {discount}% OFF
        </div>
      )}

      {/* image */}

      <div className="relative flex h-[220px] items-center justify-center overflow-hidden bg-[#faf8f3] p-5">
        <Image
          src={image}
          alt={product.name}
          width={320}
          height={260}
          className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
        />
      </div>

      {/* info */}

      <div className="flex flex-1 flex-col p-4">

        {product.brand && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#b58c24]">
            {product.brand}
          </p>
        )}

        <h3 className="mt-1 line-clamp-2 min-h-[42px] text-sm font-bold leading-5 text-[#171512]">
          {product.name}
        </h3>

        {product.short_description && (
          <p className="mt-1 line-clamp-1 text-xs text-gray-500">
            {product.short_description}
          </p>
        )}

        <div className="mt-auto pt-4">

          <div className="flex items-end gap-2">
            <span className="text-lg font-black">
              {formatPrice(product.price)}
            </span>

            {product.original_price &&
              product.original_price > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
          </div>

          <div className="mt-2 flex items-center justify-between">

            <div className="flex items-center gap-1">
              <Star
                size={13}
                fill="currentColor"
                className="text-[#D4AF37]"
              />

              <span className="text-xs font-semibold">
                {product.rating
                  ? product.rating.toFixed(1)
                  : "New"}
              </span>

              {product.reviews_count ? (
                <span className="text-[10px] text-gray-400">
                  ({product.reviews_count})
                </span>
              ) : null}
            </div>

            <span className="flex items-center gap-1 text-xs font-semibold text-[#b58c24]">
              View
              <ArrowUpRight size={13} />
            </span>

          </div>
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function DashboardPage() {
  const supabase = createClient();

  /* -------------------------------------------------------
     UI STATE
  ------------------------------------------------------- */

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] =
    useState(false);

  const [search, setSearch] = useState("");

  const [activeSlide, setActiveSlide] = useState(0);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [userName, setUserName] = useState("Prime Shopper");

  const [cartCount] = useState(0);
  const [wishlistCount] = useState(0);

  /* -------------------------------------------------------
     FLASH DEAL TIMER
  ------------------------------------------------------- */

  const [timeLeft, setTimeLeft] = useState(
    2 * 60 * 60 + 18 * 60 + 45
  );

  /* -------------------------------------------------------
     LOAD USER
  ------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) return;

      const metadata = user.user_metadata ?? {};

      const name =
        metadata.full_name ||
        metadata.name ||
        user.email?.split("@")[0] ||
        "Prime Shopper";

      setUserName(String(name));
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  /* -------------------------------------------------------
     LOAD PRODUCTS
  ------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      setLoadingProducts(true);

      const { data, error } = await supabase
        .from("products")
        .select(
          `
            id,
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
            category_id
          `
        )
        .eq("is_active", true)
        .order("created_at", {
          ascending: false,
        })
        .limit(30);

      if (!mounted) return;

      if (!error && data) {
        setProducts(data as Product[]);
      } else {
        setProducts([]);
      }

      setLoadingProducts(false);
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /* -------------------------------------------------------
     TIMER
  ------------------------------------------------------- */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 0) {
          return 2 * 60 * 60 + 18 * 60 + 45;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  /* -------------------------------------------------------
     HERO AUTO SLIDER
  ------------------------------------------------------- */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide(
        (current) =>
          (current + 1) % heroSlides.length
      );
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  /* -------------------------------------------------------
     DERIVED PRODUCTS
  ------------------------------------------------------- */

  const featuredProducts = useMemo(() => {
    const featured = products.filter(
      (product) => product.is_featured
    );

    return featured.length
      ? featured.slice(0, 8)
      : products.slice(0, 8);
  }, [products]);

  const flashProducts = useMemo(() => {
    const flash = products.filter(
      (product) => product.is_flash_sale
    );

    return flash.length
      ? flash.slice(0, 8)
      : products
          .filter(
            (product) =>
              product.original_price &&
              product.original_price > product.price
          )
          .slice(0, 8);
  }, [products]);

  const primePicks = useMemo(() => {
    return products
      .filter((product) => {
        const rating = product.rating ?? 0;
        return rating >= 4;
      })
      .slice(0, 8);
  }, [products]);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [];

    return products
      .filter((product) => {
        return (
          product.name.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query) ||
          product.short_description
            ?.toLowerCase()
            .includes(query)
        );
      })
      .slice(0, 6);
  }, [products, search]);

  /* -------------------------------------------------------
     TIMER FORMAT
  ------------------------------------------------------- */

  const hours = String(
    Math.floor(timeLeft / 3600)
  ).padStart(2, "0");

  const minutes = String(
    Math.floor((timeLeft % 3600) / 60)
  ).padStart(2, "0");

  const seconds = String(
    timeLeft % 60
  ).padStart(2, "0");

  const currentHero = heroSlides[activeSlide];

  /* -------------------------------------------------------
     HERO CONTROLS
  ------------------------------------------------------- */

  function nextSlide() {
    setActiveSlide(
      (current) =>
        (current + 1) % heroSlides.length
    );
  }

  function previousSlide() {
    setActiveSlide(
      (current) =>
        (current - 1 + heroSlides.length) %
        heroSlides.length
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#faf8f3] text-[#171512]">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="hidden bg-[#171512] text-white sm:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-2 text-xs">

          <div className="flex items-center gap-2">
            <Sparkles
              size={13}
              className="text-[#D4AF37]"
            />

            <span>
              Welcome back, {userName}
            </span>
          </div>

          <div className="flex items-center gap-6 text-white/70">
            <span>Free delivery above ₹499</span>
            <span>Easy returns</span>
            <span>Secure payments</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#e9e2d5] bg-white/95 shadow-sm backdrop-blur-xl">

        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-3 px-3 sm:px-6 lg:gap-5">

          {/* LOGO */}

          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-2.5"
          >
            <Image
              src="/logo.png"
              alt="PrimeCart"
              width={50}
              height={50}
              priority
              className="h-10 w-10 object-contain sm:h-12 sm:w-12"
            />

            <div className="hidden min-[420px]:block">
              <p className="text-xl font-black tracking-tight sm:text-2xl">
                Prime<span className="text-[#D4AF37]">
                  Cart
                </span>
              </p>

              <p className="hidden text-[9px] uppercase tracking-[0.18em] text-gray-400 sm:block">
                Smart Shopping
              </p>
            </div>
          </Link>

          {/* NAV LINKS */}

          <nav className="ml-2 hidden items-center gap-6 lg:flex">

            <Link
              href="/dashboard"
              className="font-bold text-[#D4AF37]"
            >
              Home
            </Link>

            <Link
              href="/dashboard/categories/electronics"
              className="font-medium text-gray-600 transition hover:text-[#D4AF37]"
            >
              Shop
            </Link>

            <div className="group relative">

              <button
                type="button"
                className="flex items-center gap-1 font-medium text-gray-600 hover:text-[#D4AF37]"
              >
                Categories
                <ChevronDown size={15} />
              </button>

              <div className="invisible absolute left-1/2 top-full mt-4 w-[570px] -translate-x-1/2 translate-y-2 rounded-3xl border border-[#e9e2d5] bg-white p-5 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">

                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-black">
                      Shop Categories
                    </p>

                    <p className="text-sm text-gray-500">
                      Explore PrimeCart collections
                    </p>
                  </div>

                  <Sparkles
                    size={20}
                    className="text-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">

                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/dashboard/categories/${category.slug}`}
                      className="group/item flex items-center gap-3 rounded-2xl border border-[#eee8dc] p-3 transition hover:border-[#D4AF37]/40 hover:bg-[#fffaf0]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#faf8f3]">
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={42}
                          height={42}
                          className="h-9 w-9 object-contain"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-bold">
                          {category.name}
                        </p>

                        <p className="text-[10px] text-gray-500">
                          {category.products}
                        </p>
                      </div>

                      <ArrowUpRight
                        size={14}
                        className="ml-auto text-gray-300 group-hover/item:text-[#D4AF37]"
                      />
                    </Link>
                  ))}

                </div>
              </div>
            </div>

            <Link
              href="/dashboard/prime-match"
              className="font-medium text-gray-600 transition hover:text-[#D4AF37]"
            >
              PrimeMatch
            </Link>

            <Link
              href="/dashboard/budget-builder"
              className="font-medium text-gray-600 transition hover:text-[#D4AF37]"
            >
              Budget Builder
            </Link>

          </nav>

          {/* SEARCH */}

          <div className="relative ml-auto hidden max-w-[370px] flex-1 md:block">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search products, brands & categories..."
              className="h-11 w-full rounded-2xl border border-[#e8e1d4] bg-[#faf8f3] pl-11 pr-4 text-sm outline-none transition focus:border-[#D4AF37] focus:bg-white focus:ring-4 focus:ring-[#D4AF37]/10"
            />

            {/* SEARCH RESULTS */}

            {search.trim() && (
              <div className="absolute left-0 right-0 top-[52px] z-[60] overflow-hidden rounded-2xl border border-[#e8e1d4] bg-white p-2 shadow-2xl">

                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/dashboard/product/${product.id}`}
                      onClick={() => setSearch("")}
                      className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-[#faf8f3]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#faf8f3]">
                        <Image
                          src={getImageUrl(
                            product.image_url
                          )}
                          alt={product.name}
                          width={45}
                          height={45}
                          className="h-10 w-10 object-contain"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {product.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-5 text-center">
                    <Search
                      size={22}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-2 text-sm font-semibold">
                      No products found
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Try another search term
                    </p>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* ACTIONS */}

          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* mobile search */}

            <button
              type="button"
              onClick={() =>
                setMobileSearchOpen(
                  (value) => !value
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f3ea] md:hidden"
            >
              <Search size={19} />
            </button>

            {/* wishlist */}

            <Link
              href="/dashboard/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f3ea] transition hover:bg-[#eee6d5]"
            >
              <Heart size={19} />

              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[8px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* cart */}

            <Link
              href="/dashboard/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f3ea] transition hover:bg-[#eee6d5]"
            >
              <ShoppingCart size={19} />

              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[8px] font-bold text-white">
                {cartCount}
              </span>
            </Link>

            {/* profile */}

            <Link
              href="/profile"
              className="hidden h-10 items-center gap-2 rounded-xl border border-[#e8e1d4] bg-white px-3 transition hover:border-[#D4AF37] sm:flex"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff4d7] text-[#b58c24]">
                <UserRound size={15} />
              </div>

              <span className="max-w-[90px] truncate text-xs font-bold">
                {userName}
              </span>
            </Link>

            {/* mobile menu */}

            <button
              type="button"
              onClick={() =>
                setMenuOpen((value) => !value)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8e1d4] lg:hidden"
            >
              {menuOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>

          </div>
        </div>

        {/* MOBILE SEARCH */}

        {mobileSearchOpen && (
          <div className="border-t border-[#e9e2d5] bg-white px-3 py-3 md:hidden">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                autoFocus
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search products..."
                className="h-12 w-full rounded-2xl border border-[#e8e1d4] bg-[#faf8f3] pl-11 pr-4 text-sm outline-none focus:border-[#D4AF37]"
              />

            </div>

            {search.trim() && (
              <div className="mt-2 max-h-[350px] overflow-y-auto rounded-2xl border border-[#e8e1d4] bg-white p-2 shadow-xl">

                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/dashboard/product/${product.id}`}
                      onClick={() => {
                        setSearch("");
                        setMobileSearchOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-xl p-3 hover:bg-[#faf8f3]"
                    >
                      <Image
                        src={getImageUrl(
                          product.image_url
                        )}
                        alt={product.name}
                        width={45}
                        height={45}
                        className="h-10 w-10 object-contain"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {product.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="p-4 text-center text-sm text-gray-500">
                    No products found.
                  </p>
                )}

              </div>
            )}

          </div>
        )}

        {/* MOBILE MENU */}

        {menuOpen && (
          <div className="border-t border-[#e9e2d5] bg-white px-4 py-4 shadow-xl lg:hidden">

            <div className="grid gap-1">

              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-[#faf8f3]"
              >
                Home
              </Link>

              <Link
                href="/dashboard/categories/electronics"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-[#faf8f3]"
              >
                Shop
              </Link>

              <Link
                href="/dashboard/prime-match"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-[#faf8f3]"
              >
                PrimeMatch
              </Link>

              <Link
                href="/dashboard/budget-builder"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-[#faf8f3]"
              >
                Budget Builder
              </Link>

              <Link
                href="/dashboard/setup-builder"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-[#faf8f3]"
              >
                Build My Setup
              </Link>

              <Link
                href="/dashboard/prime-points"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-[#faf8f3]"
              >
                PrimePoints
              </Link>

              <Link
                href="/orders"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-[#faf8f3]"
              >
                My Orders
              </Link>

              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-[#faf8f3]"
              >
                My Profile
              </Link>

            </div>
          </div>
        )}
      </header>

      {/* =====================================================
          HERO BANNER
      ===================================================== */}

      <section className="px-3 pt-5 sm:px-6 sm:pt-7 lg:px-8">

        <div className="mx-auto max-w-[1440px]">

          <div className="relative overflow-hidden rounded-[28px] border border-[#e6dece] bg-white shadow-[0_20px_70px_rgba(74,57,20,0.08)] sm:rounded-[38px]">

            {/* soft background */}

            <div className="pointer-events-none absolute -right-24 -top-28 h-[340px] w-[340px] rounded-full bg-[#D4AF37]/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-40 left-[38%] h-[400px] w-[400px] rounded-full bg-[#f5ead0] blur-3xl" />

            <div className="relative grid min-h-[390px] grid-cols-2 lg:min-h-[530px]">

              {/* HERO CONTENT */}

              <div className="relative z-10 flex flex-col justify-center px-5 py-9 sm:px-9 sm:py-12 lg:px-14 lg:py-16">

                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#fffaf0] px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider text-[#b58c24] sm:px-4 sm:py-2 sm:text-xs">
                  <Sparkles size={12} />
                  {currentHero.eyebrow}
                </div>

                <div className="mt-3 w-fit rounded-full bg-[#171512] px-2.5 py-1 text-[8px] font-bold text-white sm:mt-4 sm:px-3 sm:py-1.5 sm:text-xs">
                  {currentHero.badge}
                </div>

                <h1 className="mt-4 text-[31px] font-black leading-[0.96] tracking-[-0.045em] sm:mt-5 sm:text-[50px] lg:text-[68px] xl:text-[74px]">

                  {currentHero.title}

                  <br />

                  <span className="text-[#D4AF37]">
                    {currentHero.highlight}
                  </span>

                </h1>

                <p className="mt-3 max-w-xl text-[10px] leading-4 text-gray-600 sm:mt-5 sm:text-sm sm:leading-6 lg:text-base lg:leading-7">
                  {currentHero.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">

                  <Link
                    href="/dashboard/categories/electronics"
                    className="group inline-flex items-center gap-1.5 rounded-xl bg-[#D4AF37] px-3.5 py-2.5 text-[10px] font-bold text-white shadow-lg shadow-[#D4AF37]/20 transition hover:-translate-y-0.5 hover:bg-[#c69f2f] sm:gap-2 sm:rounded-2xl sm:px-6 sm:py-3.5 sm:text-sm"
                  >
                    {currentHero.primary}

                    <ArrowRight
                      size={14}
                      className="transition group-hover:translate-x-1 sm:h-[18px] sm:w-[18px]"
                    />
                  </Link>

                  <Link
                    href="/dashboard/prime-match"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#ddd5c6] bg-white px-3.5 py-2.5 text-[10px] font-semibold sm:gap-2 sm:rounded-2xl sm:px-6 sm:py-3.5 sm:text-sm"
                  >
                    {currentHero.secondary}
                  </Link>

                </div>

                {/* HERO STATS */}

                <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-6">

                  <div>
                    <p className="text-sm font-black sm:text-xl">
                      10K+
                    </p>

                    <p className="text-[8px] text-gray-500 sm:text-xs">
                      Happy Customers
                    </p>
                  </div>

                  <div className="hidden h-8 w-px bg-[#e7e0d2] sm:block" />

                  <div>
                    <p className="flex items-center gap-1 text-sm font-black sm:text-xl">
                      4.8
                      <Star
                        size={11}
                        fill="currentColor"
                        className="text-[#D4AF37] sm:h-4 sm:w-4"
                      />
                    </p>

                    <p className="text-[8px] text-gray-500 sm:text-xs">
                      Customer Rating
                    </p>
                  </div>

                  <div className="hidden h-8 w-px bg-[#e7e0d2] sm:block" />

                  <div>
                    <p className="text-sm font-black sm:text-xl">
                      {products.length > 0
                        ? `${products.length}+`
                        : "2500+"}
                    </p>

                    <p className="text-[8px] text-gray-500 sm:text-xs">
                      Products
                    </p>
                  </div>

                </div>

                {/* SLIDER CONTROLS */}

                <div className="mt-5 flex items-center gap-2 sm:mt-7 sm:gap-3">

                  <button
                    type="button"
                    onClick={previousSlide}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd5c6] bg-white transition hover:border-[#D4AF37] hover:text-[#D4AF37] sm:h-10 sm:w-10"
                  >
                    <ChevronLeft size={15} />
                  </button>

                  <div className="flex items-center gap-1.5">

                    {heroSlides.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          setActiveSlide(index)
                        }
                        className={`h-1.5 rounded-full transition-all sm:h-2 ${
                          activeSlide === index
                            ? "w-6 bg-[#D4AF37] sm:w-7"
                            : "w-1.5 bg-[#d8d1c4] sm:w-2"
                        }`}
                        aria-label={`Slide ${
                          index + 1
                        }`}
                      />
                    ))}

                  </div>

                  <button
                    type="button"
                    onClick={nextSlide}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd5c6] bg-white transition hover:border-[#D4AF37] hover:text-[#D4AF37] sm:h-10 sm:w-10"
                  >
                    <ChevronRight size={15} />
                  </button>

                </div>
              </div>

              {/* HERO IMAGE CONTAINER */}

              <div className="relative flex min-h-full items-center justify-center overflow-hidden bg-[#fffdfa]">

                {/* image backdrop */}

                <div className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4e8c8] sm:h-[320px] sm:w-[320px] lg:h-[455px] lg:w-[455px]" />

                {/* PRODUCT IMAGE */}

                <Image
                  src="/hero-product.png"
                  alt="PrimeCart premium collection"
                  width={900}
                  height={900}
                  priority
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 48vw, 50vw"
                  className="relative z-10 h-auto w-[112%] max-w-none object-contain sm:w-[100%] lg:w-[88%] xl:w-[84%]"
                />

                {/* floating info */}

                <div className="absolute right-2 top-5 z-20 rounded-xl border border-[#e9dfc9] bg-white/95 px-2.5 py-2 shadow-lg backdrop-blur sm:right-6 sm:top-9 sm:rounded-2xl sm:px-4 sm:py-3 lg:right-10">

                  <p className="text-[7px] font-bold uppercase tracking-wider text-gray-400 sm:text-[9px]">
                    PrimeCart
                  </p>

                  <p className="mt-0.5 text-[9px] font-bold sm:text-sm">
                    Premium Picks
                  </p>

                </div>

                <div className="absolute bottom-5 left-2 z-20 hidden rounded-2xl border border-[#e9dfc9] bg-white/95 px-3 py-2 shadow-lg backdrop-blur sm:block lg:bottom-10 lg:left-8">

                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff4d8] text-[#b58c24]">
                      <ShieldCheck size={15} />
                    </div>

                    <div>
                      <p className="text-xs font-bold">
                        Safe Shopping
                      </p>

                      <p className="text-[10px] text-gray-500">
                        Secure checkout
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK BENEFITS
      ===================================================== */}

      <section className="px-3 py-4 sm:px-6">

        <div className="mx-auto max-w-[1440px]">

          <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#e9e2d5] bg-white shadow-sm lg:grid-cols-4 lg:rounded-3xl">

            {[
              {
                icon: Truck,
                title: "Free Delivery",
                text: "Above ₹499",
              },
              {
                icon: ShieldCheck,
                title: "Secure Payment",
                text: "100% protected",
              },
              {
                icon: BadgeCheck,
                title: "Genuine Products",
                text: "Quality assured",
              },
              {
                icon: PackageCheck,
                title: "Easy Returns",
                text: "Hassle-free",
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className={`flex items-center gap-3 px-3 py-4 sm:gap-4 sm:px-5 sm:py-5 ${
                    index < 2
                      ? "border-b border-[#eee8dc] lg:border-b-0"
                      : ""
                  } ${
                    index % 2 === 0
                      ? "border-r border-[#eee8dc] lg:border-r"
                      : ""
                  } lg:last:border-r-0`}
                >

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff7e5] text-[#b58c24] sm:h-11 sm:w-11">
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold sm:text-sm">
                      {item.title}
                    </p>

                    <p className="text-[8px] text-gray-500 sm:text-xs">
                      {item.text}
                    </p>
                  </div>

                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORY SHORTCUTS
      ===================================================== */}

      <section className="px-3 py-9 sm:px-6 sm:py-12">

        <div className="mx-auto max-w-[1440px]">

          <div className="mb-6 flex items-end justify-between">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b58c24] sm:text-xs">
                Explore
              </p>

              <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                Shop by Category
              </h2>
            </div>

            <Link
              href="/dashboard/categories/electronics"
              className="hidden items-center gap-1.5 text-sm font-semibold text-[#b58c24] sm:flex"
            >
              View All
              <ArrowRight size={16} />
            </Link>

          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">

            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/dashboard/categories/${category.slug}`}
                className="group overflow-hidden rounded-2xl border border-[#e9e2d5] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/40 hover:shadow-lg sm:rounded-3xl"
              >

                <div className="flex h-[95px] items-center justify-center bg-[#faf8f3] p-3 sm:h-[145px] sm:p-5">

                  <Image
                    src={category.image}
                    alt={category.name}
                    width={160}
                    height={140}
                    className="h-full w-full object-contain transition duration-500 group-hover:scale-110"
                  />

                </div>

                <div className="p-2.5 sm:p-4">

                  <div className="flex items-center justify-between gap-1">

                    <h3 className="truncate text-[10px] font-bold sm:text-sm">
                      {category.name}
                    </h3>

                    <ArrowUpRight
                      size={13}
                      className="shrink-0 text-gray-300 group-hover:text-[#D4AF37]"
                    />

                  </div>

                  <p className="mt-1 hidden text-[10px] text-gray-500 sm:block">
                    {category.products}
                  </p>

                </div>

              </Link>
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURED PRODUCTS
      ===================================================== */}

      <section className="bg-white px-3 py-12 sm:px-6 sm:py-16">

        <div className="mx-auto max-w-[1440px]">

          <div className="mb-7 flex items-end justify-between">

            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#b58c24] sm:text-xs">
                <Sparkles size={14} />
                Recommended
              </div>

              <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                Featured Products
              </h2>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Products worth checking out today.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="flex items-center gap-1.5 text-xs font-bold text-[#b58c24] sm:text-sm"
            >
              View All
              <ArrowRight size={15} />
            </Link>

          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[24px] border border-[#eee8dc] bg-white"
                >
                  <div className="h-[200px] animate-pulse bg-[#f2eee6]" />

                  <div className="space-y-3 p-4">
                    <div className="h-3 w-20 animate-pulse rounded bg-[#eee8dc]" />
                    <div className="h-8 w-full animate-pulse rounded bg-[#eee8dc]" />
                    <div className="h-5 w-24 animate-pulse rounded bg-[#eee8dc]" />
                  </div>
                </div>
              ))}

            </div>
          ) : featuredProducts.length > 0 ? (
            <div
              className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 md:grid-cols-3 lg:grid-cols-4"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="snap-start sm:snap-none"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#ddd5c6] bg-[#faf8f3] px-5 py-14 text-center">

              <ShoppingBag
                size={35}
                className="mx-auto text-[#D4AF37]"
              />

              <h3 className="mt-4 text-lg font-bold">
                Products coming soon
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add products from your Supabase dashboard to
                display them here.
              </p>

            </div>
          )}

        </div>
      </section>

      {/* =====================================================
          FLASH DEAL PRODUCTS
      ===================================================== */}

      <section className="px-3 py-12 sm:px-6 sm:py-16">

        <div className="mx-auto max-w-[1440px]">

          <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#b58c24] sm:text-xs">
                <Zap size={14} />
                Limited Time
              </div>

              <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                Flash Deals
              </h2>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Hurry! These prices won't stay forever.
              </p>

            </div>

            <div className="flex items-center gap-1.5">

              <div className="min-w-[46px] rounded-xl bg-[#171512] px-2.5 py-2 text-center text-white">
                <p className="text-lg font-black leading-none">
                  {hours}
                </p>

                <p className="mt-1 text-[7px] uppercase text-white/50">
                  Hrs
                </p>
              </div>

              <span className="font-bold text-[#D4AF37]">
                :
              </span>

              <div className="min-w-[46px] rounded-xl bg-[#171512] px-2.5 py-2 text-center text-white">
                <p className="text-lg font-black leading-none">
                  {minutes}
                </p>

                <p className="mt-1 text-[7px] uppercase text-white/50">
                  Min
                </p>
              </div>

              <span className="font-bold text-[#D4AF37]">
                :
              </span>

              <div className="min-w-[46px] rounded-xl bg-[#171512] px-2.5 py-2 text-center text-white">
                <p className="text-lg font-black leading-none">
                  {seconds}
                </p>

                <p className="mt-1 text-[7px] uppercase text-white/50">
                  Sec
                </p>
              </div>

            </div>
          </div>

          {flashProducts.length > 0 ? (
            <div
              className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 md:grid-cols-3 lg:grid-cols-4"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {flashProducts.map((product) => (
                <div
                  key={product.id}
                  className="snap-start sm:snap-none"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#ddd5c6] bg-white px-5 py-12 text-center">
              <Zap
                size={32}
                className="mx-auto text-[#D4AF37]"
              />

              <p className="mt-3 text-sm font-semibold">
                Flash deals will appear here.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* =====================================================
          SMART SHOPPING
      ===================================================== */}

      <section className="bg-white px-3 py-14 sm:px-6 sm:py-18">

        <div className="mx-auto max-w-[1440px]">

          <div className="mb-8">

            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b58c24] sm:text-xs">
              PrimeCart Tools
            </p>

            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              Shop Smarter with PrimeCart
            </h2>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-gray-500 sm:text-sm sm:leading-6">
              Shopping isn't only about finding products. PrimeCart
              helps you make better decisions based on your needs,
              budget and priorities.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {smartShoppingFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group relative overflow-hidden rounded-[26px] border border-[#e8e1d4] bg-[#fffdfa] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
                >

                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#D4AF37]/10 transition duration-500 group-hover:scale-150" />

                  <div className="relative">

                    <div className="flex items-start justify-between">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4d8] text-[#b58c24]">
                        <Icon size={23} />
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e8e1d4] transition group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white">
                        <ArrowUpRight size={16} />
                      </div>

                    </div>

                    <h3 className="mt-5 text-lg font-black">
                      {feature.title}
                    </h3>

                    <p className="mt-2 min-h-[60px] text-xs leading-5 text-gray-500">
                      {feature.description}
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#b58c24]">
                      {feature.button}
                      <ArrowRight
                        size={14}
                        className="transition group-hover:translate-x-1"
                      />
                    </div>

                  </div>
                </Link>
              );
            })}

          </div>
        </div>
      </section>

      {/* =====================================================
          PRIME CART PICKS
      ===================================================== */}

      {primePicks.length > 0 && (
        <section className="px-3 py-14 sm:px-6 sm:py-18">

          <div className="mx-auto max-w-[1440px]">

            <div className="mb-7 flex items-end justify-between">

              <div>

                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#b58c24] sm:text-xs">
                  <Star
                    size={14}
                    fill="currentColor"
                  />
                  Curated Selection
                </div>

                <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                  PrimeCart Picks
                </h2>

                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Highly-rated products from the store.
                </p>

              </div>

              <Link
                href="/dashboard/products"
                className="flex items-center gap-1.5 text-xs font-bold text-[#b58c24] sm:text-sm"
              >
                See More
                <ArrowRight size={15} />
              </Link>

            </div>

            <div
              className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 md:grid-cols-3 lg:grid-cols-4"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {primePicks.map((product) => (
                <div
                  key={product.id}
                  className="snap-start sm:snap-none"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* =====================================================
          PRIMEPOINTS BANNER
      ===================================================== */}

      <section className="px-3 pb-12 sm:px-6 sm:pb-16">

        <div className="mx-auto max-w-[1440px]">

          <div className="relative overflow-hidden rounded-[28px] bg-[#171512] px-5 py-9 text-white sm:rounded-[34px] sm:px-10 sm:py-12 lg:px-14">

            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#D4AF37]/20 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">

              <div>

                <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#e4c46a]">
                  <Star
                    size={13}
                    fill="currentColor"
                  />
                  PrimePoints
                </div>

                <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                  Shop. Earn.
                  <span className="text-[#D4AF37]">
                    {" "}Get Rewarded.
                  </span>
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
                  Earn PrimePoints while shopping and completing
                  PrimeCart challenges. Unlock rewards and
                  exclusive benefits.
                </p>

                <Link
                  href="/dashboard/prime-points"
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-5 py-3 font-bold text-white transition hover:bg-[#c69f2f]"
                >
                  Explore PrimePoints
                  <ArrowRight size={17} />
                </Link>

              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4">

                {[
                  ["01", "Shop"],
                  ["02", "Earn"],
                  ["03", "Redeem"],
                ].map(([number, label]) => (
                  <div
                    key={number}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm sm:p-6"
                  >
                    <p className="text-xl font-black text-[#D4AF37] sm:text-2xl">
                      {number}
                    </p>

                    <p className="mt-1 text-[10px] font-semibold text-white/65 sm:text-sm">
                      {label}
                    </p>
                  </div>
                ))}

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[#e8e1d4] bg-white px-4 pb-24 pt-12 md:pb-8">

        <div className="mx-auto max-w-[1440px]">

          <div className="grid gap-9 border-b border-[#e8e1d4] pb-10 sm:grid-cols-2 lg:grid-cols-4">

            {/* brand */}

            <div>

              <Link
                href="/dashboard"
                className="flex items-center gap-3"
              >
                <Image
                  src="/logo.png"
                  alt="PrimeCart"
                  width={48}
                  height={48}
                  className="h-11 w-11 object-contain"
                />

                <div>
                  <p className="text-xl font-black">
                    Prime<span className="text-[#D4AF37]">
                      Cart
                    </span>
                  </p>

                  <p className="text-[10px] uppercase tracking-wider text-gray-400">
                    Smart Shopping
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-6 text-gray-500">
                A smarter shopping experience built around
                products, value and better decisions.
              </p>

            </div>

            {/* shopping */}

            <div>

              <h3 className="font-bold">
                Shopping
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-sm text-gray-500">

                <Link
                  href="/dashboard/products"
                  className="hover:text-[#D4AF37]"
                >
                  All Products
                </Link>

                <Link
                  href="/dashboard/categories/electronics"
                  className="hover:text-[#D4AF37]"
                >
                  Categories
                </Link>

                <Link
                  href="/dashboard/wishlist"
                  className="hover:text-[#D4AF37]"
                >
                  Wishlist
                </Link>

                <Link
                  href="/dashboard/cart"
                  className="hover:text-[#D4AF37]"
                >
                  Cart
                </Link>

              </div>
            </div>

            {/* smart tools */}

            <div>

              <h3 className="font-bold">
                Smart Shopping
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-sm text-gray-500">

                <Link
                  href="/dashboard/prime-match"
                  className="hover:text-[#D4AF37]"
                >
                  PrimeMatch
                </Link>

                <Link
                  href="/dashboard/budget-builder"
                  className="hover:text-[#D4AF37]"
                >
                  Budget Builder
                </Link>

                <Link
                  href="/dashboard/setup-builder"
                  className="hover:text-[#D4AF37]"
                >
                  Build My Setup
                </Link>

                <Link
                  href="/dashboard/prime-points"
                  className="hover:text-[#D4AF37]"
                >
                  PrimePoints
                </Link>

              </div>
            </div>

            {/* support */}

            <div>

              <h3 className="font-bold">
                Support
              </h3>

              <div className="mt-4 space-y-4">

                <div className="flex gap-3">

                  <ShieldCheck
                    size={18}
                    className="shrink-0 text-[#D4AF37]"
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      Secure Shopping
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Protected shopping experience.
                    </p>
                  </div>

                </div>

                <div className="flex gap-3">

                  <Truck
                    size={18}
                    className="shrink-0 text-[#D4AF37]"
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      Easy Delivery
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Convenient delivery options.
                    </p>
                  </div>

                </div>

              </div>
            </div>

          </div>

          <div className="flex flex-col gap-2 py-5 text-center text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">

            <p>
              © 2026 PrimeCart. All Rights Reserved.
            </p>

            <p>
              Built for smarter shopping.
            </p>

          </div>

        </div>
      </footer>

      {/* =====================================================
          MOBILE BOTTOM NAV
      ===================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e8e1d4] bg-white/95 px-2 py-2 shadow-[0_-5px_25px_rgba(50,35,10,0.08)] backdrop-blur-xl md:hidden">

        <div className="mx-auto flex max-w-md items-center justify-around">

          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 px-3 py-1 text-[#D4AF37]"
          >
            <ShoppingBag size={19} />

            <span className="text-[10px] font-semibold">
              Home
            </span>
          </Link>

          <Link
            href="/dashboard/products"
            className="flex flex-col items-center gap-1 px-3 py-1 text-gray-500"
          >
            <Search size={19} />

            <span className="text-[10px] font-semibold">
              Shop
            </span>
          </Link>

          <Link
            href="/dashboard/wishlist"
            className="flex flex-col items-center gap-1 px-3 py-1 text-gray-500"
          >
            <Heart size={19} />

            <span className="text-[10px] font-semibold">
              Wishlist
            </span>
          </Link>

          <Link
            href="/dashboard/cart"
            className="relative flex flex-col items-center gap-1 px-3 py-1 text-gray-500"
          >
            <ShoppingCart size={19} />

            {cartCount > 0 && (
              <span className="absolute right-1 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[8px] font-bold text-white">
                {cartCount}
              </span>
            )}

            <span className="text-[10px] font-semibold">
              Cart
            </span>
          </Link>

          <Link
            href="/profile"
            className="flex flex-col items-center gap-1 px-3 py-1 text-gray-500"
          >
            <UserRound size={19} />

            <span className="text-[10px] font-semibold">
              Profile
            </span>
          </Link>

        </div>
      </div>

    </main>
  );
}
