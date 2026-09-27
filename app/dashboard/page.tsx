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
  Headphones,
  Heart,
  Menu,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  UserRound,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Category = {
  name: string;
  products: string;
  image: string;
  slug: string;
};

type HeroSlide = {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  button: string;
  secondary: string;
  badge: string;
};

/* =========================================================
   DATA
========================================================= */

const categories: Category[] = [
  {
    name: "Electronics",
    products: "2500+ Products",
    image: "/electronics.png",
    slug: "electronics",
  },
  {
    name: "Fashion",
    products: "1800+ Products",
    image: "/fashion.png",
    slug: "fashion",
  },
  {
    name: "Watches",
    products: "1200+ Products",
    image: "/watch.png",
    slug: "watches",
  },
  {
    name: "Beauty",
    products: "800+ Products",
    image: "/beauty.png",
    slug: "beauty",
  },
  {
    name: "Home & Living",
    products: "1500+ Products",
    image: "/home.png",
    slug: "home-and-living",
  },
  {
    name: "Gaming",
    products: "950+ Products",
    image: "/gaming.png",
    slug: "gaming",
  },
];

const heroSlides: HeroSlide[] = [
  {
    eyebrow: "SUPER SALE IS LIVE",
    title: "Shop More.",
    highlight: "Pay Less.",
    description:
      "Discover premium products, everyday essentials and exciting deals — all in one beautiful shopping experience.",
    button: "Shop Now",
    secondary: "Explore Deals",
    badge: "Up to 70% OFF",
  },
  {
    eyebrow: "PRIMECART PICKS",
    title: "Curated.",
    highlight: "Just For You.",
    description:
      "Explore hand-picked products across electronics, fashion, beauty, home and gaming.",
    button: "Explore Picks",
    secondary: "View Categories",
    badge: "Premium Selection",
  },
  {
    eyebrow: "FLASH DEALS",
    title: "Big Deals.",
    highlight: "Limited Time.",
    description:
      "Don't miss today's exclusive offers. Grab your favourites before the timer runs out.",
    button: "Grab Deals",
    secondary: "Shop Everything",
    badge: "Limited Time",
  },
];

const benefits = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "On orders above ₹499",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "Safe & encrypted checkout",
  },
  {
    icon: BadgeCheck,
    title: "Genuine Products",
    description: "Quality you can trust",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We're here to help",
  },
];

const primeFeatures = [
  {
    icon: Sparkles,
    title: "PrimeMatch",
    description:
      "Tell us what you need, your budget and priorities. Find products that fit your requirements.",
    href: "/dashboard/prime-match",
    label: "Find My Match",
  },
  {
    icon: Zap,
    title: "Budget Builder",
    description:
      "Plan your shopping intelligently and discover the best combination within your budget.",
    href: "/dashboard/budget-builder",
    label: "Build Budget",
  },
  {
    icon: PackageCheck,
    title: "Build My Setup",
    description:
      "Create complete gaming, college, work, fitness or home setups with ease.",
    href: "/dashboard/setup-builder",
    label: "Build Setup",
  },
  {
    icon: Star,
    title: "PrimePoints",
    description:
      "Shop, complete challenges and collect rewards while becoming a PrimeCart member.",
    href: "/dashboard/prime-points",
    label: "Earn Rewards",
  },
];

const dealItems = [
  {
    title: "Electronics",
    subtitle: "Smart tech for everyday life",
    discount: "UP TO 60% OFF",
    image: "/electronics.png",
    href: "/dashboard/categories/electronics",
  },
  {
    title: "Fashion",
    subtitle: "Refresh your everyday style",
    discount: "UP TO 50% OFF",
    image: "/fashion.png",
    href: "/dashboard/categories/fashion",
  },
  {
    title: "Home & Living",
    subtitle: "Make your space feel better",
    discount: "UP TO 45% OFF",
    image: "/home.png",
    href: "/dashboard/categories/home-and-living",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function HomePage() {
  const [openMenu, setOpenMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  const [timeLeft, setTimeLeft] = useState(
    2 * 60 * 60 + 18 * 60 + 45
  );

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const currentSlide = heroSlides[activeSlide];

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return categories;

    return categories.filter((category) =>
      category.name.toLowerCase().includes(query)
    );
  }, [search]);

  /* =========================================================
     FLASH DEAL TIMER
  ========================================================= */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 0) {
          return 2 * 60 * 60 + 18 * 60 + 45;
        }

        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  /* =========================================================
     HERO AUTO SLIDER
  ========================================================= */

  useEffect(() => {
    const slider = window.setInterval(() => {
      setActiveSlide((value) => (value + 1) % heroSlides.length);
    }, 6500);

    return () => window.clearInterval(slider);
  }, []);

  const formattedTime = formatTime(timeLeft);

  /* =========================================================
     NEWSLETTER
  ========================================================= */

  const handleSubscribe = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");
  };

  /* =========================================================
     SLIDER CONTROLS
  ========================================================= */

  const nextSlide = () => {
    setActiveSlide(
      (value) => (value + 1) % heroSlides.length
    );
  };

  const previousSlide = () => {
    setActiveSlide(
      (value) =>
        (value - 1 + heroSlides.length) %
        heroSlides.length
    );
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#faf8f3] text-[#171512]">

      {/* =====================================================
          ANNOUNCEMENT BAR
      ===================================================== */}

      <div className="hidden bg-[#171512] text-white sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2.5 text-xs sm:px-6">
          <p className="font-medium tracking-wide">
            ✨ Premium shopping. Better prices. Smarter choices.
          </p>

          <div className="flex items-center gap-6 text-white/75">
            <span>Free delivery above ₹499</span>
            <span>Easy returns</span>
            <span>Secure checkout</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="sticky top-0 z-50 border-b border-[#ece7db] bg-white/95 shadow-[0_4px_20px_rgba(40,30,10,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-7xl items-center gap-3 px-3 sm:h-[74px] sm:px-6">

          {/* LOGO */}

          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
          >
            <Image
              src="/logo.png"
              alt="PrimeCart Logo"
              width={48}
              height={48}
              priority
              className="h-10 w-10 object-contain sm:h-12 sm:w-12"
            />

            <div className="hidden min-[400px]:block">
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                Prime<span className="text-[#D4AF37]">Cart</span>
              </h1>

              <p className="hidden text-[9px] font-medium uppercase tracking-[0.18em] text-gray-500 sm:block">
                Premium Shopping
              </p>
            </div>
          </Link>

          {/* DESKTOP NAV */}

          <div className="ml-4 hidden items-center gap-6 lg:flex xl:gap-8">

            <Link
              href="/"
              className="font-semibold text-[#D4AF37]"
            >
              Home
            </Link>

            <Link
              href="/auth/login"
              className="font-medium text-gray-600 transition hover:text-[#D4AF37]"
            >
              Shop
            </Link>

            {/* CATEGORY DROPDOWN */}

            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1.5 font-medium text-gray-600 transition hover:text-[#D4AF37]"
              >
                Categories
                <ChevronDown size={15} />
              </button>

              <div className="invisible absolute left-1/2 top-full mt-4 w-[550px] -translate-x-1/2 translate-y-2 rounded-3xl border border-[#ece7db] bg-white p-5 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">

                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">
                      Shop Categories
                    </p>

                    <p className="text-sm text-gray-500">
                      Explore everything in one place
                    </p>
                  </div>

                  <Sparkles
                    className="text-[#D4AF37]"
                    size={20}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={`/dashboard/categories/${category.slug}`}
                      className="group/item flex items-center gap-3 rounded-2xl border border-[#f0ece3] p-3 transition hover:border-[#D4AF37]/50 hover:bg-[#fffaf0]"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#faf8f3]">
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={44}
                          height={44}
                          className="h-10 w-10 object-contain"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold">
                          {category.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {category.products}
                        </p>
                      </div>

                      <ArrowUpRight
                        size={15}
                        className="ml-auto text-gray-300 transition group-hover/item:text-[#D4AF37]"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/auth/login"
              className="font-medium text-gray-600 transition hover:text-[#D4AF37]"
            >
              Deals
            </Link>

            <Link
              href="/auth/login"
              className="font-medium text-gray-600 transition hover:text-[#D4AF37]"
            >
              Contact
            </Link>
          </div>

          {/* DESKTOP SEARCH */}

          <div className="ml-auto hidden max-w-[330px] flex-1 md:flex">
            <div className="relative w-full">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onFocus={() => setSearchOpen(true)}
                placeholder="Search products, categories..."
                className="h-11 w-full rounded-2xl border border-[#e9e3d7] bg-[#faf8f3] pl-11 pr-4 text-sm outline-none transition focus:border-[#D4AF37] focus:bg-white focus:ring-4 focus:ring-[#D4AF37]/10"
              />

              {searchOpen && search.trim() && (
                <div className="absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-2xl border border-[#ece7db] bg-white p-2 shadow-2xl">

                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <Link
                        key={category.name}
                        href={`/dashboard/categories/${category.slug}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearch("");
                        }}
                        className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-[#faf8f3]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#faf8f3]">
                          <Image
                            src={category.image}
                            alt={category.name}
                            width={35}
                            height={35}
                            className="h-8 w-8 object-contain"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            {category.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {category.products}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No matching category found.
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex items-center gap-1.5 sm:gap-2">

            <button
              type="button"
              onClick={() =>
                setSearchOpen((value) => !value)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f2e9] transition hover:bg-[#eee5d1] md:hidden"
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            <Link
              href="/auth/login"
              className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#f6f2e9] transition hover:bg-[#eee5d1] sm:flex"
              aria-label="Wishlist"
            >
              <Heart size={19} />
            </Link>

            <Link
              href="/auth/login"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f2e9] transition hover:bg-[#eee5d1]"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={19} />

              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[9px] font-bold text-white">
                0
              </span>
            </Link>

            <Link
              href="/auth/login"
              className="hidden rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold transition hover:border-[#D4AF37] hover:text-[#D4AF37] md:block"
            >
              Login
            </Link>

            <Link
              href="/auth/register"
              className="hidden rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c69f2f] hover:shadow-lg md:block"
            >
              Register
            </Link>

            <button
              type="button"
              onClick={() =>
                setOpenMenu((value) => !value)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ece7db] lg:hidden"
              aria-label="Open menu"
            >
              {openMenu ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE SEARCH */}

        {searchOpen && (
          <div className="border-t border-[#ece7db] bg-white px-3 py-3 md:hidden">
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
                placeholder="Search products or categories..."
                className="h-12 w-full rounded-2xl border border-[#e9e3d7] bg-[#faf8f3] pl-11 pr-4 outline-none focus:border-[#D4AF37]"
              />
            </div>

            {search.trim() && (
              <div className="mt-2 rounded-2xl border border-[#ece7db] bg-white p-2 shadow-lg">

                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <Link
                      key={category.name}
                      href={`/dashboard/categories/${category.slug}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearch("");
                      }}
                      className="flex items-center gap-3 rounded-xl p-3 hover:bg-[#faf8f3]"
                    >
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={40}
                        height={40}
                        className="h-9 w-9 object-contain"
                      />

                      <div>
                        <p className="font-semibold">
                          {category.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {category.products}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="p-3 text-center text-sm text-gray-500">
                    No category found.
                  </p>
                )}

              </div>
            )}
          </div>
        )}

        {/* MOBILE MENU */}

        {openMenu && (
          <div className="border-t border-[#ece7db] bg-white px-3 py-4 shadow-xl lg:hidden">

            <div className="grid gap-1.5">

              <Link
                href="/"
                onClick={() => setOpenMenu(false)}
                className="rounded-xl px-4 py-3.5 font-medium text-gray-700 hover:bg-[#faf8f3] hover:text-[#D4AF37]"
              >
                Home
              </Link>

              <Link
                href="/auth/login"
                onClick={() => setOpenMenu(false)}
                className="rounded-xl px-4 py-3.5 font-medium text-gray-700 hover:bg-[#faf8f3] hover:text-[#D4AF37]"
              >
                Shop
              </Link>

              <Link
                href="/dashboard/categories/electronics"
                onClick={() => setOpenMenu(false)}
                className="rounded-xl px-4 py-3.5 font-medium text-gray-700 hover:bg-[#faf8f3] hover:text-[#D4AF37]"
              >
                Categories
              </Link>

              <Link
                href="/auth/login"
                onClick={() => setOpenMenu(false)}
                className="rounded-xl px-4 py-3.5 font-medium text-gray-700 hover:bg-[#faf8f3] hover:text-[#D4AF37]"
              >
                Deals
              </Link>

              <Link
                href="/auth/login"
                onClick={() => setOpenMenu(false)}
                className="rounded-xl px-4 py-3.5 font-medium text-gray-700 hover:bg-[#faf8f3] hover:text-[#D4AF37]"
              >
                Contact
              </Link>

              <div className="mt-2 grid grid-cols-2 gap-3">

                <Link
                  href="/auth/login"
                  onClick={() => setOpenMenu(false)}
                  className="rounded-xl border border-gray-300 px-4 py-3 text-center font-semibold"
                >
                  Login
                </Link>

                <Link
                  href="/auth/register"
                  onClick={() => setOpenMenu(false)}
                  className="rounded-xl bg-[#D4AF37] px-4 py-3 text-center font-semibold text-white"
                >
                  Register
                </Link>

              </div>
            </div>
          </div>
        )}
      </nav>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="px-3 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">

        <div className="mx-auto max-w-7xl">

          <div className="relative overflow-hidden rounded-[26px] border border-[#e9e1d2] bg-white shadow-[0_18px_60px_rgba(74,57,20,0.07)] sm:rounded-[34px] lg:rounded-[40px]">

            {/* subtle background */}

            <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-[#f5ead0] blur-3xl" />

            <div className="relative grid min-h-[350px] grid-cols-2 items-stretch sm:min-h-[430px] lg:min-h-[515px]">

              {/* =================================================
                  HERO LEFT
              ================================================= */}

              <div className="relative z-10 flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-12 lg:px-14 lg:py-14">

                <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#D4AF37]/30 bg-[#fffaf0] px-3 py-1.5 text-[8px] font-bold uppercase tracking-wide text-[#b58c24] sm:px-4 sm:py-2 sm:text-xs">
                  <Sparkles size={12} />
                  {currentSlide.eyebrow}
                </div>

                <div className="mt-3 inline-flex w-fit rounded-full bg-[#171512] px-2.5 py-1 text-[8px] font-bold text-white sm:mt-4 sm:px-3 sm:py-1.5 sm:text-xs">
                  {currentSlide.badge}
                </div>

                <h2 className="mt-4 max-w-xl text-[30px] font-black leading-[0.95] tracking-[-0.04em] text-[#171512] sm:mt-5 sm:text-[48px] lg:text-[66px] xl:text-[72px]">
                  {currentSlide.title}
                  <br />
                  <span className="text-[#D4AF37]">
                    {currentSlide.highlight}
                  </span>
                </h2>

                <p className="mt-3 max-w-lg text-[10px] leading-4 text-gray-600 sm:mt-5 sm:text-sm sm:leading-6 lg:text-base lg:leading-7">
                  {currentSlide.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">

                  <Link
                    href="/auth/login"
                    className="group inline-flex items-center gap-1.5 rounded-xl bg-[#D4AF37] px-3.5 py-2.5 text-[10px] font-bold text-white shadow-lg shadow-[#D4AF37]/20 transition hover:-translate-y-0.5 hover:bg-[#c69f2f] sm:gap-2 sm:rounded-2xl sm:px-6 sm:py-3.5 sm:text-sm"
                  >
                    {currentSlide.button}

                    <ArrowRight
                      size={14}
                      className="transition group-hover:translate-x-1 sm:h-[18px] sm:w-[18px]"
                    />
                  </Link>

                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8ca] bg-white px-3.5 py-2.5 text-[10px] font-semibold text-gray-800 transition hover:border-[#D4AF37] hover:text-[#b58c24] sm:gap-2 sm:rounded-2xl sm:px-6 sm:py-3.5 sm:text-sm"
                  >
                    {currentSlide.secondary}
                  </Link>

                </div>

                {/* TRUST STATS */}

                <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-6 lg:gap-7">

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
                      2500+
                    </p>

                    <p className="text-[8px] text-gray-500 sm:text-xs">
                      Products
                    </p>
                  </div>

                </div>

                {/* SLIDER */}

                <div className="mt-5 flex items-center gap-2 sm:mt-8 sm:gap-3">

                  <button
                    type="button"
                    onClick={previousSlide}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ded8ca] bg-white transition hover:border-[#D4AF37] hover:text-[#D4AF37] sm:h-10 sm:w-10"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={14} className="sm:h-[18px] sm:w-[18px]" />
                  </button>

                  <div className="flex items-center gap-1.5">

                    {heroSlides.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          setActiveSlide(index)
                        }
                        aria-label={`Go to slide ${index + 1}`}
                        className={`h-1.5 rounded-full transition-all sm:h-2 ${
                          activeSlide === index
                            ? "w-5 bg-[#D4AF37] sm:w-7"
                            : "w-1.5 bg-[#d9d2c5] sm:w-2"
                        }`}
                      />
                    ))}

                  </div>

                  <button
                    type="button"
                    onClick={nextSlide}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ded8ca] bg-white transition hover:border-[#D4AF37] hover:text-[#D4AF37] sm:h-10 sm:w-10"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={14} className="sm:h-[18px] sm:w-[18px]" />
                  </button>

                </div>
              </div>

              {/* =================================================
                  HERO IMAGE
              ================================================= */}

              <div className="relative flex min-h-full items-center justify-center overflow-hidden bg-[#fffdfa]">

                {/* soft image backdrop */}

                <div className="absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f5ead0] sm:h-[310px] sm:w-[310px] lg:h-[440px] lg:w-[440px]" />

                {/* image */}

                <Image
                  src="/hero-product.png"
                  alt="PrimeCart premium collection"
                  width={900}
                  height={900}
                  priority
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 48vw, 50vw"
                  className="relative z-10 h-auto w-[108%] max-w-none object-contain sm:w-[96%] lg:w-[88%] xl:w-[84%]"
                />

                {/* small badge */}

                <div className="absolute right-2 top-4 z-20 rounded-xl border border-[#e9dfc9] bg-white/95 px-2.5 py-2 shadow-lg backdrop-blur-sm sm:right-6 sm:top-8 sm:rounded-2xl sm:px-4 sm:py-3 lg:right-10">

                  <p className="text-[7px] font-bold uppercase tracking-wider text-gray-400 sm:text-[10px]">
                    Today's highlight
                  </p>

                  <p className="mt-0.5 text-[9px] font-bold sm:mt-1 sm:text-sm">
                    Premium Deals
                  </p>

                </div>

                <div className="absolute bottom-5 left-2 z-20 hidden rounded-2xl border border-[#e9dfc9] bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm sm:block lg:bottom-10 lg:left-7">

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
          BENEFITS
      ===================================================== */}

      <section className="px-3 py-3 sm:px-6 sm:py-5">

        <div className="mx-auto max-w-7xl">

          <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#e9e2d5] bg-white shadow-sm sm:grid-cols-2 lg:grid-cols-4 lg:rounded-3xl">

            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className={`
                    flex min-w-0 items-center gap-2.5
                    px-3 py-3
                    sm:gap-4 sm:px-5 sm:py-6
                    ${
                      index % 2 === 0
                        ? "border-r border-[#eee8dc]"
                        : ""
                    }
                    ${
                      index < 2
                        ? "border-b border-[#eee8dc] lg:border-b-0"
                        : ""
                    }
                    lg:border-r
                    lg:last:border-r-0
                  `}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff7e5] text-[#b58c24] sm:h-11 sm:w-11 sm:rounded-xl lg:h-12 lg:w-12 lg:rounded-2xl">
                    <Icon
                      size={16}
                      className="sm:h-5 sm:w-5 lg:h-[22px] lg:w-[22px]"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-[10px] font-bold leading-tight sm:text-sm lg:text-base">
                      {benefit.title}
                    </h3>

                    <p className="mt-0.5 line-clamp-1 text-[7px] leading-3 text-gray-500 sm:text-[11px] sm:leading-4 lg:text-xs">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* =====================================================
          FLASH DEALS
      ===================================================== */}

      <section className="px-3 py-12 sm:px-6 sm:py-16 lg:py-20">

        <div className="mx-auto max-w-7xl">

          <div className="mb-7 flex flex-col justify-between gap-5 sm:mb-8 sm:flex-row sm:items-end">

            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#b58c24] sm:text-sm">
                <Zap size={15} />
                Limited Time
              </div>

              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Flash Deals
              </h2>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Grab the deal before the clock runs out.
              </p>
            </div>

            <div className="flex items-center gap-1.5">

              {[
                ["hours", formattedTime.hours, "Hrs"],
                ["minutes", formattedTime.minutes, "Min"],
                ["seconds", formattedTime.seconds, "Sec"],
              ].map(([key, value, label], index) => (
                <div
                  key={key}
                  className="flex items-center gap-1.5"
                >
                  {index > 0 && (
                    <span className="font-bold text-[#b58c24]">
                      :
                    </span>
                  )}

                  <div className="min-w-[47px] rounded-xl bg-[#171512] px-2.5 py-2 text-center text-white">
                    <p className="text-lg font-black leading-none">
                      {value}
                    </p>

                    <p className="mt-1 text-[8px] uppercase tracking-wider text-white/60">
                      {label}
                    </p>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* MOBILE HORIZONTAL / DESKTOP GRID */}

          <div
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:pb-0 sm:snap-none md:grid-cols-3"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {dealItems.map((deal) => (
              <Link
                key={deal.title}
                href={deal.href}
                className="group relative w-[84vw] min-w-[84vw] shrink-0 snap-start overflow-hidden rounded-[26px] border border-[#e9e2d5] bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-auto sm:min-w-0 sm:shrink sm:rounded-[28px] sm:p-5"
              >

                <div className="absolute right-4 top-4 z-10 rounded-full bg-[#171512] px-3 py-1.5 text-[9px] font-bold tracking-wider text-white">
                  {deal.discount}
                </div>

                <div className="flex h-[200px] items-center justify-center overflow-hidden rounded-[22px] bg-[#faf8f3] sm:h-[220px]">

                  <Image
                    src={deal.image}
                    alt={deal.title}
                    width={300}
                    height={240}
                    className="h-[175px] w-full object-contain transition duration-500 group-hover:scale-105 sm:h-[190px]"
                  />

                </div>

                <div className="flex items-end justify-between gap-3 px-1 pt-5">

                  <div>
                    <p className="text-xl font-black">
                      {deal.title}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {deal.subtitle}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e8e1d4] transition group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white">
                    <ArrowUpRight size={18} />
                  </div>

                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <section className="bg-white px-3 py-14 sm:px-6 sm:py-16 lg:py-20">

        <div className="mx-auto max-w-7xl">

          <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#b58c24] sm:text-sm">
                Explore Store
              </p>

              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Shop By Category
              </h2>

              <p className="mt-2 max-w-xl text-sm text-gray-500 sm:text-base">
                Find exactly what you need from our growing collection.
              </p>
            </div>

            <Link
              href="/dashboard/categories/electronics"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#b58c24] transition hover:gap-3"
            >
              View all categories
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">

            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/dashboard/categories/${category.slug}`}
                className="group overflow-hidden rounded-2xl border border-[#ece7db] bg-[#faf8f3] transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/40 hover:bg-white hover:shadow-xl sm:rounded-3xl"
              >

                <div className="flex h-32 items-center justify-center overflow-hidden px-3 pt-3 sm:h-40 sm:px-4 sm:pt-4">

                  <Image
                    src={category.image}
                    alt={category.name}
                    width={180}
                    height={160}
                    className="h-full w-full object-contain transition duration-500 group-hover:scale-110"
                  />

                </div>

                <div className="bg-white p-3 sm:p-4">

                  <div className="flex items-center justify-between gap-2">

                    <h3 className="text-sm font-bold sm:text-base">
                      {category.name}
                    </h3>

                    <ArrowUpRight
                      size={15}
                      className="shrink-0 text-gray-300 transition group-hover:text-[#D4AF37]"
                    />

                  </div>

                  <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                    {category.products}
                  </p>

                </div>
              </Link>
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          PRIME CART ADVANTAGE
      ===================================================== */}

      <section className="px-3 py-14 sm:px-6 sm:py-16 lg:py-20">

        <div className="mx-auto max-w-7xl">

          <div className="mb-9">

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#b58c24] sm:text-sm">
              More than shopping
            </p>

            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              The PrimeCart Advantage
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">
              Smart shopping tools designed to make buying easier,
              faster and more rewarding.
            </p>

          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:gap-5">

            {primeFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group relative overflow-hidden rounded-[26px] border border-[#e8e1d4] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-[30px] sm:p-8"
                >

                  <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-[#D4AF37]/10 transition group-hover:scale-150" />

                  <div className="relative">

                    <div className="flex items-start justify-between">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58c24] sm:h-14 sm:w-14">
                        <Icon size={24} />
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ece7db] transition group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white sm:h-10 sm:w-10">
                        <ArrowUpRight size={17} />
                      </div>

                    </div>

                    <h3 className="mt-5 text-xl font-black sm:mt-6 sm:text-2xl">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-500 sm:mt-3">
                      {feature.description}
                    </p>

                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#b58c24] sm:mt-6">
                      {feature.label}

                      <ArrowRight
                        size={16}
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
          PRIMEPOINTS
      ===================================================== */}

      <section className="px-3 pb-14 sm:px-6 sm:pb-16 lg:pb-20">

        <div className="mx-auto max-w-7xl">

          <div className="relative overflow-hidden rounded-[28px] bg-[#171512] px-5 py-9 text-white sm:rounded-[32px] sm:px-10 sm:py-12 lg:px-14">

            <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#D4AF37]/20 blur-3xl" />

            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-10">

              <div>

                <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#e4c46a] sm:px-4 sm:py-2 sm:text-xs">
                  <Star size={13} fill="currentColor" />
                  PrimePoints
                </div>

                <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight sm:mt-5 sm:text-4xl lg:text-5xl">
                  Shop. Earn.
                  <span className="text-[#D4AF37]">
                    {" "}Get Rewarded.
                  </span>
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:mt-4 sm:text-base sm:leading-7">
                  Turn your shopping activity into rewards with
                  PrimePoints. Complete challenges, collect points
                  and unlock exclusive benefits.
                </p>

                <Link
                  href="/dashboard/prime-points"
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c69f2f] sm:mt-7 sm:px-6 sm:py-3.5"
                >
                  Explore PrimePoints
                  <ArrowRight size={17} />
                </Link>

              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-4">

                {[
                  ["01", "Shop"],
                  ["02", "Earn"],
                  ["03", "Redeem"],
                ].map(([number, label]) => (
                  <div
                    key={number}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm sm:p-6"
                  >
                    <p className="text-xl font-black text-[#D4AF37] sm:text-2xl">
                      {number}
                    </p>

                    <p className="mt-1 text-[10px] font-semibold text-white/70 sm:text-sm">
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
          NEWSLETTER
      ===================================================== */}

      <section className="border-y border-[#ece7db] bg-white px-3 py-14 sm:px-6 sm:py-16">

        <div className="mx-auto max-w-3xl text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff5dc] text-[#b58c24] sm:h-14 sm:w-14">
            <ShoppingBag size={23} />
          </div>

          <h2 className="mt-4 text-3xl font-black sm:mt-5 sm:text-4xl">
            Stay in the PrimeCart loop
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500 sm:text-base">
            Get notified about new arrivals, exclusive offers and
            limited-time deals.
          </p>

          {subscribed ? (
            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-[#d9e9d9] bg-[#f4fbf4] px-5 py-4 text-sm font-semibold text-green-700">
              ✓ You're subscribed. Welcome to PrimeCart!
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="mx-auto mt-6 flex max-w-xl flex-col gap-2 rounded-2xl border border-[#e8e1d4] bg-[#faf8f3] p-2 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email address"
                className="h-12 min-w-0 flex-1 rounded-xl bg-transparent px-4 text-sm outline-none"
              />

              <button
                type="submit"
                className="h-12 rounded-xl bg-[#D4AF37] px-6 font-bold text-white transition hover:bg-[#c69f2f]"
              >
                Subscribe
              </button>
            </form>
          )}

        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-[#faf8f3] px-4 pb-24 pt-12 sm:px-6 md:pb-8 md:pt-14">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-9 border-b border-[#e7e0d4] pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr] lg:gap-10 lg:pb-12">

            {/* BRAND */}

            <div>

              <Link
                href="/"
                className="flex items-center gap-3"
              >
                <Image
                  src="/logo.png"
                  alt="PrimeCart Logo"
                  width={50}
                  height={50}
                  className="h-11 w-11 object-contain sm:h-12 sm:w-12"
                />

                <div>
                  <h2 className="text-2xl font-black">
                    Prime<span className="text-[#D4AF37]">
                      Cart
                    </span>
                  </h2>

                  <p className="text-xs text-gray-500">
                    Premium Shopping Store
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-6 text-gray-500">
                Your one-stop destination for premium products,
                smart shopping tools and better deals.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">

                <span className="rounded-full border border-[#e5ddcf] bg-white px-3 py-1.5 text-xs font-semibold text-gray-600">
                  Secure Shopping
                </span>

                <span className="rounded-full border border-[#e5ddcf] bg-white px-3 py-1.5 text-xs font-semibold text-gray-600">
                  Easy Returns
                </span>

              </div>
            </div>

            {/* QUICK LINKS */}

            <div>

              <h3 className="font-bold">
                Quick Links
              </h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-gray-500">

                <Link
                  href="/"
                  className="transition hover:text-[#D4AF37]"
                >
                  Home
                </Link>

                <Link
                  href="/auth/login"
                  className="transition hover:text-[#D4AF37]"
                >
                  Shop
                </Link>

                <Link
                  href="/dashboard/categories/electronics"
                  className="transition hover:text-[#D4AF37]"
                >
                  Categories
                </Link>

                <Link
                  href="/auth/login"
                  className="transition hover:text-[#D4AF37]"
                >
                  Deals
                </Link>

              </div>
            </div>

            {/* CUSTOMER SERVICE */}

            <div>

              <h3 className="font-bold">
                Customer Service
              </h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-gray-500">

                <Link
                  href="/auth/login"
                  className="transition hover:text-[#D4AF37]"
                >
                  Contact Us
                </Link>

                <Link
                  href="/auth/login"
                  className="transition hover:text-[#D4AF37]"
                >
                  Shipping Policy
                </Link>

                <Link
                  href="/auth/login"
                  className="transition hover:text-[#D4AF37]"
                >
                  Returns
                </Link>

                <Link
                  href="/auth/login"
                  className="transition hover:text-[#D4AF37]"
                >
                  Privacy Policy
                </Link>

              </div>
            </div>

            {/* WHY PRIMECART */}

            <div>

              <h3 className="font-bold">
                Why PrimeCart?
              </h3>

              <div className="mt-5 space-y-4">

                <div className="flex gap-3">

                  <ShieldCheck
                    className="mt-0.5 shrink-0 text-[#D4AF37]"
                    size={19}
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      Secure shopping
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Safe and protected checkout experience.
                    </p>
                  </div>

                </div>

                <div className="flex gap-3">

                  <Truck
                    className="mt-0.5 shrink-0 text-[#D4AF37]"
                    size={19}
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      Reliable delivery
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Easy and convenient order delivery.
                    </p>
                  </div>

                </div>

                <div className="flex gap-3">

                  <Headphones
                    className="mt-0.5 shrink-0 text-[#D4AF37]"
                    size={19}
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      Customer support
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Help whenever you need it.
                    </p>
                  </div>

                </div>

              </div>
            </div>

          </div>

          <div className="flex flex-col gap-3 py-6 text-center text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">

            <p>
              © 2026 PrimeCart. All Rights Reserved.
            </p>

            <p>
              Made for a smarter shopping experience.
            </p>

          </div>

        </div>
      </footer>

      {/* =====================================================
          MOBILE BOTTOM NAV
      ===================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e7e0d4] bg-white/95 px-2 py-2 shadow-[0_-5px_25px_rgba(50,35,10,0.08)] backdrop-blur-xl md:hidden">

        <div className="mx-auto flex max-w-md items-center justify-around">

          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-3 py-1 text-[#D4AF37]"
          >
            <ShoppingBag size={19} />
            <span className="text-[10px] font-semibold">
              Home
            </span>
          </Link>

          <Link
            href="/dashboard/categories/electronics"
            className="flex flex-col items-center gap-1 px-3 py-1 text-gray-500"
          >
            <Search size={19} />
            <span className="text-[10px] font-semibold">
              Shop
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="flex flex-col items-center gap-1 px-3 py-1 text-gray-500"
          >
            <Heart size={19} />
            <span className="text-[10px] font-semibold">
              Wishlist
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="relative flex flex-col items-center gap-1 px-3 py-1 text-gray-500"
          >
            <ShoppingCart size={19} />

            <span className="absolute right-1 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[8px] font-bold text-white">
              0
            </span>

            <span className="text-[10px] font-semibold">
              Cart
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="flex flex-col items-center gap-1 px-3 py-1 text-gray-500"
          >
            <UserRound size={19} />
            <span className="text-[10px] font-semibold">
              Account
            </span>
          </Link>

        </div>
      </div>

    </main>
  );
}
