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
    eyebrow: "🔥 SUPER SALE IS LIVE",
    title: "Shop More.",
    highlight: "Pay Less.",
    description:
      "Discover premium products, everyday essentials and exciting deals — all in one beautiful shopping experience.",
    button: "Shop Now",
    secondary: "Explore Deals",
    badge: "Up to 70% OFF",
  },
  {
    eyebrow: "✨ PRIMECART PICKS",
    title: "Curated.",
    highlight: "Just For You.",
    description:
      "Explore hand-picked products across electronics, fashion, beauty, home and gaming.",
    button: "Explore Picks",
    secondary: "View Categories",
    badge: "Premium Selection",
  },
  {
    eyebrow: "⚡ FLASH DEALS",
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

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return categories;

    return categories.filter((category) =>
      category.name.toLowerCase().includes(query)
    );
  }, [search]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((value) =>
        value <= 0 ? 2 * 60 * 60 + 18 * 60 + 45 : value - 1
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const slider = window.setInterval(() => {
      setActiveSlide((value) => (value + 1) % heroSlides.length);
    }, 6500);

    return () => window.clearInterval(slider);
  }, []);

  const formattedTime = formatTime(timeLeft);

  const handleSubscribe = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");
  };

  const nextSlide = () => {
    setActiveSlide(
      (value) => (value + 1) % heroSlides.length
    );
  };

  const previousSlide = () => {
    setActiveSlide(
      (value) =>
        (value - 1 + heroSlides.length) % heroSlides.length
    );
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#faf8f3] pb-20 text-[#171512] md:pb-0">

      {/* =========================================================
          TOP ANNOUNCEMENT
      ========================================================= */}

      <div className="hidden bg-[#171512] text-white sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-[11px] sm:px-6 sm:text-xs">
          <p className="font-medium tracking-wide">
            ✨ Premium shopping. Better prices. Smarter choices.
          </p>

          <div className="flex items-center gap-5 text-white/70">
            <span>Free delivery above ₹499</span>
            <span>Easy returns</span>
            <span>Secure checkout</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <nav className="sticky top-0 z-50 border-b border-[#ece7db] bg-white/95 shadow-[0_4px_20px_rgba(40,30,10,0.04)] backdrop-blur-xl">

        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-3 sm:h-[74px] sm:gap-4 sm:px-6">

          {/* LOGO */}

          <Link
            href="/"
            className="flex min-w-0 shrink-0 items-center gap-2"
          >
            <Image
              src="/logo.png"
              alt="PrimeCart Logo"
              width={48}
              height={48}
              className="h-10 w-10 object-contain sm:h-12 sm:w-12"
              priority
            />

            <div className="hidden min-w-0 sm:block">
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                Prime<span className="text-[#D4AF37]">Cart</span>
              </h1>

              <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-gray-500">
                Premium Shopping
              </p>
            </div>

            {/* compact mobile brand */}
            <div className="block sm:hidden">
              <h1 className="text-lg font-extrabold tracking-tight">
                Prime<span className="text-[#D4AF37]">Cart</span>
              </h1>
            </div>
          </Link>

          {/* DESKTOP NAV */}

          <div className="ml-3 hidden items-center gap-6 lg:flex">
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

            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1.5 font-medium text-gray-600 transition hover:text-[#D4AF37]"
              >
                Categories
                <ChevronDown size={15} />
              </button>

              <div className="invisible absolute left-1/2 top-full mt-4 w-[540px] -translate-x-1/2 translate-y-2 rounded-3xl border border-[#ece7db] bg-white p-5 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
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
                        <p className="truncate font-semibold">
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

          <div className="ml-auto hidden max-w-[300px] flex-1 md:flex">
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
                <div className="absolute left-0 right-0 top-[52px] overflow-hidden rounded-2xl border border-[#ece7db] bg-white p-2 shadow-2xl">
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

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5 md:ml-3">

            <button
              type="button"
              onClick={() =>
                setSearchOpen((value) => !value)
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6f2e9] transition active:scale-95 md:hidden"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            <Link
              href="/auth/login"
              className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#f6f2e9] transition hover:bg-[#eee5d1] sm:flex"
              aria-label="Wishlist"
            >
              <Heart size={18} />
            </Link>

            <Link
              href="/auth/login"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6f2e9] transition active:scale-95 sm:h-10 sm:w-10"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={18} />

              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[8px] font-bold text-white">
                0
              </span>
            </Link>

            <Link
              href="/auth/login"
              className="hidden rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold transition hover:border-[#D4AF37] hover:text-[#D4AF37] md:block"
            >
              Login
            </Link>

            <Link
              href="/auth/register"
              className="hidden rounded-xl bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c69f2f] hover:shadow-lg md:block"
            >
              Register
            </Link>

            <button
              type="button"
              onClick={() =>
                setOpenMenu((value) => !value)
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ece7db] active:scale-95 lg:hidden sm:h-10 sm:w-10"
              aria-label="Open menu"
            >
              {openMenu ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE SEARCH */}

        {searchOpen && (
          <div className="border-t border-[#ece7db] bg-white px-3 py-3 sm:px-4 md:hidden">
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
                className="h-12 w-full rounded-2xl border border-[#e9e3d7] bg-[#faf8f3] pl-11 pr-4 text-sm outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
              />
            </div>

            {search.trim() && (
              <div className="mt-2 max-h-64 overflow-y-auto rounded-2xl border border-[#ece7db] bg-white p-2 shadow-lg">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <Link
                      key={category.name}
                      href={`/dashboard/categories/${category.slug}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearch("");
                      }}
                      className="flex items-center gap-3 rounded-xl p-3 active:bg-[#faf8f3]"
                    >
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={40}
                        height={40}
                        className="h-9 w-9 object-contain"
                      />

                      <div className="min-w-0">
                        <p className="truncate font-semibold">
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
          <div className="max-h-[calc(100vh-64px)] overflow-y-auto border-t border-[#ece7db] bg-white px-3 py-4 shadow-xl sm:px-4 lg:hidden">
            <div className="grid gap-1.5">
              {[
                ["Home", "/"],
                ["Shop", "/auth/login"],
                [
                  "Categories",
                  "/auth/login",
                ],
                ["Deals", "/auth/login"],
                ["Contact", "/auth/login"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpenMenu(false)}
                  className="rounded-xl px-4 py-3.5 font-medium text-gray-700 transition active:bg-[#faf8f3] hover:bg-[#faf8f3] hover:text-[#D4AF37]"
                >
                  {label}
                </Link>
              ))}

              <div className="mt-2 grid grid-cols-2 gap-2.5">
                <Link
                  href="/auth/login"
                  onClick={() => setOpenMenu(false)}
                  className="rounded-xl border border-gray-300 px-4 py-3 text-center text-sm font-semibold"
                >
                  Login
                </Link>

                <Link
                  href="/auth/register"
                  onClick={() => setOpenMenu(false)}
                  className="rounded-xl bg-[#D4AF37] px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

{/* =========================================================
    HERO
========================================================= */}

<section className="px-3 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
  <div
    className="
      relative
      mx-auto
      max-w-[1380px]
      overflow-hidden
      rounded-[22px]
      border
      border-[#eadfc9]
      bg-[#fffdfa]
      shadow-[0_18px_50px_rgba(80,60,20,0.10)]
      sm:rounded-[28px]
    "
  >
    <div
      className="
        grid
        grid-cols-2
        min-h-[320px]
sm:min-h-[430px]
lg:min-h-[540px]
      "
    >
      {/* =====================================================
          LEFT CONTENT
      ===================================================== */}
      <div
        className="
          relative
          z-10
          flex
          min-w-0
          flex-col
          justify-center
          px-3
          py-6
          sm:px-7
          sm:py-10
          lg:px-14
          lg:py-16
          xl:px-16
        "
      >
        {/* Sale Badge */}
        <div
          className="
            mb-3
            inline-flex
            w-fit
            max-w-full
            items-center
            gap-1
            rounded-full
            border
            border-[#ead9b7]
            bg-[#fffaf0]
            px-2
            py-1
            text-[8px]
            font-medium
            text-[#c28f20]
            sm:mb-5
            sm:gap-2
            sm:px-3
            sm:py-1.5
            sm:text-xs
            lg:mb-7
            lg:px-4
            lg:py-2
            lg:text-sm
          "
        >
          <span className="text-[10px] sm:text-sm lg:text-base">
            🔥
          </span>

          <span className="truncate">
            Super Sale is Live!
          </span>
        </div>

        {/* Heading */}
        <h1
          className="
            max-w-[620px]
            font-serif
            text-[25px]
            font-bold
            leading-[0.98]
            tracking-[-1.2px]
            text-[#111111]
            sm:text-[45px]
            sm:tracking-[-1.8px]
            lg:text-[68px]
            lg:tracking-[-2px]
            xl:text-[76px]
          "
        >
          Shop More.
          <br />

          <span className="text-[#d5ad32]">
            Pay Less.
          </span>
        </h1>

        {/* Description */}
        <p
          className="
            mt-3
            max-w-[560px]
            text-[9px]
            leading-[1.55]
            text-[#4f4a42]
            sm:mt-5
            sm:text-[13px]
            sm:leading-6
            lg:mt-7
            lg:text-[18px]
            lg:leading-7
          "
        >
          Discover the best products at unbeatable prices.
          Your one-stop destination for all your needs.
        </p>

        {/* Buttons */}
        <div
          className="
            mt-4
            flex
            flex-col
            gap-2
            sm:mt-6
            sm:flex-row
            sm:gap-3
            lg:mt-8
          "
        >
          <Link
            href="/auth/login"
            className="
              inline-flex
              h-9
              items-center
              justify-center
              gap-1
              rounded-lg
              bg-[#d8af32]
              px-3
              text-[9px]
              font-semibold
              text-white
              shadow-[0_7px_18px_rgba(207,166,45,0.20)]
              transition-all
              duration-300
              hover:-translate-y-1
              hover:bg-[#c99f25]
              hover:shadow-[0_12px_25px_rgba(207,166,45,0.28)]
              sm:h-11
              sm:gap-1.5
              sm:rounded-xl
              sm:px-5
              sm:text-xs
              lg:h-14
              lg:gap-2
              lg:px-8
              lg:text-[15px]
            "
          >
            Shop Now

            <ArrowRight
              className="
                h-3
                w-3
                sm:h-3.5
                sm:w-3.5
                lg:h-4
                lg:w-4
              "
            />
          </Link>

          <Link
            href="/auth/login"
            className="
              inline-flex
              h-9
              items-center
              justify-center
              rounded-lg
              border
              border-[#d9dce2]
              bg-white
              px-3
              text-[9px]
              font-semibold
              text-[#171717]
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-[#d5ad32]
              hover:text-[#b88b20]
              hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)]
              sm:h-11
              sm:rounded-xl
              sm:px-5
              sm:text-xs
              lg:h-14
              lg:px-8
              lg:text-[15px]
            "
          >
            Explore Deals
          </Link>
        </div>

        {/* Customers */}
        <div
          className="
            mt-5
            flex
            min-w-0
            items-center
            gap-2
            sm:mt-7
            sm:gap-3
            lg:mt-10
            lg:gap-4
          "
        >
          {/* Avatar Stack */}
          <div className="flex shrink-0 -space-x-2 sm:-space-x-3">
            <div
              className="
                h-6
                w-6
                rounded-full
                border
                border-white
                bg-[#d9dde5]
                sm:h-8
                sm:w-8
                lg:h-10
                lg:w-10
                lg:border-2
              "
            />

            <div
              className="
                h-6
                w-6
                rounded-full
                border
                border-white
                bg-[#aeb7c8]
                sm:h-8
                sm:w-8
                lg:h-10
                lg:w-10
                lg:border-2
              "
            />

            <div
              className="
                h-6
                w-6
                rounded-full
                border
                border-white
                bg-[#737e92]
                sm:h-8
                sm:w-8
                lg:h-10
                lg:w-10
                lg:border-2
              "
            />
          </div>

          <p
            className="
              min-w-0
              text-[8px]
              leading-3
              text-[#444]
              sm:text-xs
              lg:text-sm
            "
          >
            Join{" "}
            <span className="font-semibold text-[#d0a52e]">
              10,000+
            </span>{" "}
            Happy Customers
          </p>
        </div>
      </div>

     {/* =====================================================
    RIGHT IMAGE
===================================================== */}
<div
  className="
    relative
    min-h-full
    overflow-hidden
    bg-[#fffdfa]
  "
>
  <Image
    src="/hero-product.png"
    alt="PrimeCart premium collection"
    fill
    priority
    sizes="50vw"
    className="
      object-contain
      object-center
      scale-[1.02]
      transition-transform
      duration-700
      ease-out
      sm:scale-[1.04]
      lg:object-cover
      lg:scale-[0.95]
      lg:hover:scale-[1.015]
    "
  />
</div>
    </div>
  </div>
</section>

      {/* =========================================================
          BENEFITS
      ========================================================= */}

      <section className="px-3 py-3 sm:px-6 sm:py-5">
        <div className="mx-auto max-w-7xl">

          <div className="grid overflow-hidden rounded-3xl border border-[#e9e2d5] bg-white shadow-sm sm:grid-cols-2 lg:grid-cols-4">

            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className={`flex min-w-0 items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5 sm:py-6 ${
                    index !== benefits.length - 1
                      ? "border-b border-[#eee8dc] sm:border-r lg:border-b-0"
                      : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff7e5] text-[#b58c24] sm:h-12 sm:w-12 sm:rounded-2xl">
                    <Icon size={19} className="sm:h-[22px] sm:w-[22px]" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold sm:text-base">
                      {benefit.title}
                    </h3>

                    <p className="mt-0.5 text-[10px] leading-4 text-gray-500 sm:text-xs">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

{/* =========================================================
    FLASH DEALS
========================================================= */}

<section className="px-3 py-10 sm:px-6 sm:py-14 lg:py-20">
  <div className="mx-auto max-w-7xl">

    {/* HEADER */}

    <div className="mb-7 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">

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

      {/* TIMER */}

      <div className="flex w-full items-center justify-center gap-1.5 sm:w-auto sm:justify-end sm:gap-2">

        <div className="min-w-[58px] rounded-xl bg-[#171512] px-2.5 py-2 text-center text-white sm:min-w-[64px] sm:px-3">
          <p className="text-lg font-black leading-none">
            {formattedTime.hours}
          </p>

          <p className="mt-1 text-[8px] uppercase tracking-wider text-white/60">
            Hrs
          </p>
        </div>

        <span className="font-bold text-[#b58c24]">
          :
        </span>

        <div className="min-w-[58px] rounded-xl bg-[#171512] px-2.5 py-2 text-center text-white sm:min-w-[64px] sm:px-3">
          <p className="text-lg font-black leading-none">
            {formattedTime.minutes}
          </p>

          <p className="mt-1 text-[8px] uppercase tracking-wider text-white/60">
            Min
          </p>
        </div>

        <span className="font-bold text-[#b58c24]">
          :
        </span>

        <div className="min-w-[58px] rounded-xl bg-[#171512] px-2.5 py-2 text-center text-white sm:min-w-[64px] sm:px-3">
          <p className="text-lg font-black leading-none">
            {formattedTime.seconds}
          </p>

          <p className="mt-1 text-[8px] uppercase tracking-wider text-white/60">
            Sec
          </p>
        </div>
      </div>
    </div>

    {/* DEAL CARDS */}

    <div
      className="
        flex
        gap-4
        overflow-x-auto
        pb-4
        snap-x
        snap-mandatory
        scrollbar-hide

        sm:grid
        sm:grid-cols-2
        sm:gap-5
        sm:overflow-visible
        sm:pb-0
        sm:snap-none

        md:grid-cols-3
      "
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >

      {dealItems.map((deal) => (
        <Link
          key={deal.title}
          href={deal.href}
          className="
            group
            relative
            w-[82vw]
            min-w-[82vw]
            shrink-0
            snap-start
            overflow-hidden
            rounded-[24px]
            border
            border-[#e9e2d5]
            bg-white
            p-3.5
            shadow-sm
            transition
            duration-300
            active:scale-[0.98]

            sm:w-auto
            sm:min-w-0
            sm:shrink
            sm:rounded-[28px]
            sm:p-5
            sm:active:scale-100

            sm:hover:-translate-y-1
            sm:hover:shadow-xl
          "
        >

          {/* DISCOUNT BADGE */}

          <div className="absolute right-3 top-3 z-10 rounded-full bg-[#171512] px-2.5 py-1.5 text-[8px] font-bold tracking-wider text-white sm:right-4 sm:top-4 sm:px-3 sm:text-[10px]">
            {deal.discount}
          </div>

          {/* IMAGE */}

          <div className="flex h-[190px] items-center justify-center rounded-[20px] bg-[#faf8f3] sm:h-[220px] sm:rounded-[22px]">

            <Image
              src={deal.image}
              alt={deal.title}
              width={300}
              height={240}
              className="
                h-[160px]
                w-full
                object-contain
                transition
                duration-500
                sm:h-[190px]
                sm:group-hover:scale-105
              "
            />

          </div>

          {/* CONTENT */}

          <div className="flex items-end justify-between gap-3 px-1 pt-4 sm:pt-5">

            <div className="min-w-0">

              <p className="truncate text-lg font-black sm:text-xl">
                {deal.title}
              </p>

              <p className="mt-1 line-clamp-2 text-xs text-gray-500 sm:text-sm">
                {deal.subtitle}
              </p>

            </div>

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-[#e8e1d4]
                transition

                sm:h-10
                sm:w-10
                sm:group-hover:border-[#D4AF37]
                sm:group-hover:bg-[#D4AF37]
                sm:group-hover:text-white
              "
            >
              <ArrowUpRight size={17} />
            </div>

          </div>
        </Link>
      ))}
    </div>

    {/* MOBILE SWIPE INDICATOR */}

    <div className="mt-3 flex items-center justify-center gap-1.5 sm:hidden">
      <span className="h-1.5 w-5 rounded-full bg-[#D4AF37]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[#d9d2c5]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[#d9d2c5]" />
    </div>

  </div>
</section>

      {/* =========================================================
          CATEGORIES
      ========================================================= */}

      <section className="bg-white px-3 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">

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
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#b58c24] transition hover:gap-3 sm:text-base"
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
                <div className="flex h-28 items-center justify-center overflow-hidden px-3 pt-3 sm:h-40 sm:px-4 sm:pt-4">
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
                    <h3 className="truncate text-sm font-bold sm:text-base">
                      {category.name}
                    </h3>

                    <ArrowUpRight
                      size={14}
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

  {/* =========================================================
          PRIME CART ADVANTAGE
          MOBILE = HORIZONTAL LIKE CATEGORY
      ========================================================= */}

      <section className="px-3 py-11 sm:px-6 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl">

          <div className="mb-6 sm:mb-9">
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

          {/* HORIZONTAL ON MOBILE */}

          <div className="pc-scrollbar-none flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:pb-0 md:snap-none">

            {primeFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group relative min-w-[82vw] snap-start overflow-hidden rounded-[26px] border border-[#e8e1d4] bg-white p-5 shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl sm:min-w-[62vw] sm:p-7 md:min-w-0 md:p-8"
                >
                  <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-[#D4AF37]/10 transition duration-700 group-hover:scale-150" />

                  <div className="relative">

                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58c24] transition duration-300 group-hover:scale-105 sm:h-14 sm:w-14">
                        <Icon size={24} />
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ece7db] transition group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white sm:h-10 sm:w-10">
                        <ArrowUpRight size={16} />
                      </div>
                    </div>

                    <h3 className="mt-5 text-xl font-black sm:mt-6 sm:text-2xl">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-500 sm:mt-3">
                      {feature.description}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#b58c24] sm:mt-6 sm:text-sm">
                      {feature.label}

                      <ArrowRight
                        size={15}
                        className="transition group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* MOBILE SWIPE INDICATOR */}

          <div className="mt-1 flex justify-center gap-1.5 md:hidden">
            {primeFeatures.map((feature, index) => (
              <span
                key={feature.title}
                className={`h-1.5 rounded-full ${
                  index === 0
                    ? "w-6 bg-[#D4AF37]"
                    : "w-1.5 bg-[#d9d2c5]"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          PRIMEPOINTS
      ========================================================= */}

      <section className="px-3 pb-12 sm:px-6 sm:pb-16 lg:pb-20">
        <div className="mx-auto max-w-7xl">

          <div className="relative overflow-hidden rounded-[28px] bg-[#171512] px-5 py-9 text-white sm:rounded-[32px] sm:px-10 sm:py-12 lg:px-14">

            <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#D4AF37]/20 blur-3xl" />

            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">

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
                  href="/auth/login"
                  className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c69f2f] sm:mt-7 sm:px-6 sm:py-3.5"
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

      {/* =========================================================
          NEWSLETTER
      ========================================================= */}

      <section className="border-y border-[#ece7db] bg-white px-3 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff5dc] text-[#b58c24] sm:h-14 sm:w-14">
            <ShoppingBag size={22} />
          </div>

          <h2 className="mt-4 text-2xl font-black sm:mt-5 sm:text-4xl">
            Stay in the PrimeCart loop
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:mt-3 sm:text-base">
            Get notified about new arrivals, exclusive offers and
            limited-time deals.
          </p>

          {subscribed ? (
            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-[#d9e9d9] bg-[#f4fbf4] px-4 py-4 text-sm font-semibold text-green-700">
              ✓ You&apos;re subscribed. Welcome to PrimeCart!
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="mx-auto mt-6 flex max-w-xl flex-col gap-2 rounded-2xl border border-[#e8e1d4] bg-[#faf8f3] p-2 sm:mt-7 sm:flex-row"
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
                className="h-12 rounded-xl bg-[#D4AF37] px-6 text-sm font-bold text-white transition hover:bg-[#c69f2f]"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
      
{/* =========================================================
          COMPACT MOBILE FOOTER
      ========================================================= */}

      <footer className="bg-[#faf8f3] px-3 pb-24 pt-9 sm:px-6 sm:pb-8 sm:pt-14">

        <div className="mx-auto max-w-7xl">

          {/* BRAND */}

          <div className="border-b border-[#e7e0d4] pb-6 sm:pb-10">

            <Link
              href="/"
              className="flex items-center gap-2.5"
            >
              <Image
                src="/logo.png"
                alt="PrimeCart Logo"
                width={46}
                height={46}
                className="h-10 w-10 object-contain sm:h-12 sm:w-12"
              />

              <div>
                <h2 className="text-xl font-black sm:text-2xl">
                  Prime<span className="text-[#D4AF37]">
                    Cart
                  </span>
                </h2>

                <p className="text-[10px] text-gray-500 sm:text-xs">
                  Premium Shopping Store
                </p>
              </div>
            </Link>

            <p className="mt-3 max-w-sm text-xs leading-5 text-gray-500 sm:mt-5 sm:text-sm sm:leading-6">
              Your one-stop destination for premium products,
              smart shopping tools and better deals.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 sm:mt-5">
              <span className="rounded-full border border-[#e5ddcf] bg-white px-3 py-1 text-[10px] font-semibold text-gray-600 sm:py-1.5 sm:text-xs">
                Secure Shopping
              </span>

              <span className="rounded-full border border-[#e5ddcf] bg-white px-3 py-1 text-[10px] font-semibold text-gray-600 sm:py-1.5 sm:text-xs">
                Easy Returns
              </span>
            </div>
          </div>

          {/* MOBILE COMPACT LINKS */}

          <div className="grid grid-cols-3 gap-3 border-b border-[#e7e0d4] py-6 sm:hidden">

            <div>
              <h3 className="text-xs font-bold">
                Quick Links
              </h3>

              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href="/"
                  className="text-[11px] text-gray-500 transition hover:text-[#D4AF37]"
                >
                  Home
                </Link>

                <Link
                  href="/auth/login"
                  className="text-[11px] text-gray-500 transition hover:text-[#D4AF37]"
                >
                  Shop
                </Link>

                <Link
                  href="/auth/login"
                  className="text-[11px] text-gray-500 transition hover:text-[#D4AF37]"
                >
                  Categories
                </Link>

                <Link
                  href="/auth/login"
                  className="text-[11px] text-gray-500 transition hover:text-[#D4AF37]"
                >
                  Deals
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold">
                Support
              </h3>

              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  className="text-[11px] text-gray-500 transition hover:text-[#D4AF37]"
                >
                  Contact
                </Link>

                <Link
                  href="/auth/login"
                  className="text-[11px] text-gray-500 transition hover:text-[#D4AF37]"
                >
                  Shipping
                </Link>

                <Link
                  href="/auth/login"
                  className="text-[11px] text-gray-500 transition hover:text-[#D4AF37]"
                >
                  Returns
                </Link>

                <Link
                  href="/auth/login"
                  className="text-[11px] text-gray-500 transition hover:text-[#D4AF37]"
                >
                  Privacy
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold">
                Why Us?
              </h3>

              <div className="mt-3 space-y-2.5">

                <div className="flex items-center gap-1.5">
                  <ShieldCheck
                    size={14}
                    className="shrink-0 text-[#D4AF37]"
                  />

                  <span className="text-[10px] text-gray-500">
                    Secure
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Truck
                    size={14}
                    className="shrink-0 text-[#D4AF37]"
                  />

                  <span className="text-[10px] text-gray-500">
                    Reliable
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Headphones
                    size={14}
                    className="shrink-0 text-[#D4AF37]"
                  />

                  <span className="text-[10px] text-gray-500">
                    Support
                  </span>
                </div>

              </div>
            </div>
          </div>

          {/* DESKTOP FOOTER LINKS */}

          <div className="hidden gap-10 border-b border-[#e7e0d4] py-10 sm:grid sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr]">

            <div>
              <h3 className="font-bold">
                Quick Links
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-sm text-gray-500">
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
                  href="/auth/login"
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

            <div>
              <h3 className="font-bold">
                Customer Service
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-sm text-gray-500">
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

            <div>
              <h3 className="font-bold">
                Why PrimeCart?
              </h3>

              <div className="mt-4 space-y-4">

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

          {/* COPYRIGHT */}

          <div className="flex flex-col gap-1.5 py-4 text-center text-[10px] text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:py-6 sm:text-left sm:text-xs">
            <p>
              © 2026 PrimeCart. All Rights Reserved.
            </p>

            <p>
              Made for a smarter shopping experience.
            </p>
          </div>
        </div>
      </footer>

      {/* =========================================================
          MOBILE BOTTOM NAV
      ========================================================= */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e7e0d4] bg-white/95 px-2 py-1.5 shadow-[0_-5px_25px_rgba(50,35,10,0.08)] backdrop-blur-xl md:hidden">

        <div className="mx-auto flex max-w-md items-center justify-around">

          <Link
            href="/"
            className="flex min-w-[52px] flex-col items-center gap-0.5 px-2 py-1 text-[#D4AF37]"
          >
            <ShoppingBag size={18} />

            <span className="text-[9px] font-semibold">
              Home
            </span>
          </Link>

          <Link
            href="/dashboard/categories/electronics"
            className="flex min-w-[52px] flex-col items-center gap-0.5 px-2 py-1 text-gray-500"
          >
            <Search size={18} />

            <span className="text-[9px] font-semibold">
              Shop
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="flex min-w-[52px] flex-col items-center gap-0.5 px-2 py-1 text-gray-500"
          >
            <Heart size={18} />

            <span className="text-[9px] font-semibold">
              Wishlist
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="relative flex min-w-[52px] flex-col items-center gap-0.5 px-2 py-1 text-gray-500"
          >
            <ShoppingCart size={18} />

            <span className="absolute right-1 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[8px] font-bold text-white">
              0
            </span>

            <span className="text-[9px] font-semibold">
              Cart
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="flex min-w-[52px] flex-col items-center gap-0.5 px-2 py-1 text-gray-500"
          >
            <UserRound size={18} />

            <span className="text-[9px] font-semibold">
              Account
            </span>
          </Link>

        </div>
      </div>
    </main>
  );
}
