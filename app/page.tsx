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
  Clock3,
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
    image: "/products/electronics.png",
    slug: "electronics",
  },
  {
    name: "Fashion",
    products: "1800+ Products",
    image: "/products/fashion.png",
    slug: "fashion",
  },
  {
    name: "Watches",
    products: "1200+ Products",
    image: "/products/watch.png",
    slug: "watches",
  },
  {
    name: "Beauty",
    products: "800+ Products",
    image: "/products/perfume23.png",
    slug: "beauty",
  },
  {
    name: "Home & Living",
    products: "1500+ Products",
    image: "/products/home.png",
    slug: "home-and-living",
  },
  {
    name: "Gaming",
    products: "950+ Products",
    image: "/products/gaming.png",
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
    href: "/primematch",
    label: "Find My Match",
  },
  {
    icon: Zap,
    title: "Budget Builder",
    description:
      "Plan your shopping intelligently and discover the best combination within your budget.",
    href: "/budget-builder",
    label: "Build Budget",
  },
  {
    icon: PackageCheck,
    title: "Build My Setup",
    description:
      "Create complete gaming, college, work, fitness or home setups with ease.",
    href: "/build-my-setup",
    label: "Build Setup",
  },
  {
    icon: Star,
    title: "PrimePoints",
    description:
      "Shop, complete challenges and collect rewards while becoming a PrimeCart member.",
    href: "/primepoints",
    label: "Earn Rewards",
  },
];

const dealItems = [
  {
    title: "Electronics",
    subtitle: "Smart tech for everyday life",
    discount: "UP TO 60% OFF",
    image: "/products/electronics.png",
    href: "/categories/electronics",
  },
  {
    title: "Fashion",
    subtitle: "Refresh your everyday style",
    discount: "UP TO 50% OFF",
    image: "/products/fashion.png",
    href: "/categories/fashion",
  },
  {
    title: "Home & Living",
    subtitle: "Make your space feel better",
    discount: "UP TO 45% OFF",
    image: "/products/home.png",
    href: "/categories/home-and-living",
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
  const [timeLeft, setTimeLeft] = useState(2 * 60 * 60 + 18 * 60 + 45);
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
      setTimeLeft((value) => (value <= 0 ? 2 * 60 * 60 + 18 * 60 + 45 : value - 1));
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

  const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");
  };

  const nextSlide = () => {
    setActiveSlide((value) => (value + 1) % heroSlides.length);
  };

  const previousSlide = () => {
    setActiveSlide(
      (value) => (value - 1 + heroSlides.length) % heroSlides.length
    );
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#faf8f3] text-[#171512]">

      {/* =========================================================
          TOP ANNOUNCEMENT BAR
      ========================================================= */}

      <div className="hidden sm:block bg-[#171512] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2 text-xs sm:px-6">
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

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <nav className="sticky top-0 z-50 border-b border-[#ece7db] bg-white/95 shadow-[0_4px_20px_rgba(40,30,10,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center gap-4 px-4 sm:px-6">

          {/* LOGO */}

          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="PrimeCart Logo"
              width={48}
              height={48}
              className="h-11 w-11 object-contain sm:h-12 sm:w-12"
              priority
            />

            <div className="hidden xs:block">
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                Prime<span className="text-[#D4AF37]">Cart</span>
              </h1>

              <p className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-gray-500 sm:block">
                Premium Shopping
              </p>
            </div>
          </Link>

          {/* DESKTOP NAV */}

          <div className="ml-5 hidden items-center gap-7 lg:flex">
            <Link
              href="/"
              className="font-semibold text-[#D4AF37]"
            >
              Home
            </Link>

            <Link
              href="/login"
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
                    <p className="text-lg font-bold">Shop Categories</p>
                    <p className="text-sm text-gray-500">
                      Explore everything in one place
                    </p>
                  </div>

                  <Sparkles className="text-[#D4AF37]" size={20} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={`/categories/${category.slug}`}
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
                        <p className="font-semibold">{category.name}</p>
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
              href="/login"
              className="font-medium text-gray-600 transition hover:text-[#D4AF37]"
            >
              Deals
            </Link>

            <Link
              href="/login"
              className="font-medium text-gray-600 transition hover:text-[#D4AF37]"
            >
              Contact
            </Link>
          </div>

          {/* SEARCH */}

          <div className="ml-auto hidden max-w-[300px] flex-1 md:flex">
            <div className="relative w-full">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
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
                        href={`/categories/${category.slug}`}
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

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f2e9] transition hover:bg-[#eee5d1] md:hidden"
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            <Link
              href="/login"
              className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#f6f2e9] transition hover:bg-[#eee5d1] sm:flex"
              aria-label="Wishlist"
            >
              <Heart size={19} />
            </Link>

            <Link
              href="/login"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f2e9] transition hover:bg-[#eee5d1]"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={19} />

              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[9px] font-bold text-white">
                0
              </span>
            </Link>

            <Link
              href="/login"
              className="hidden rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold transition hover:border-[#D4AF37] hover:text-[#D4AF37] md:block"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="hidden rounded-xl bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c69f2f] hover:shadow-lg md:block"
            >
              Register
            </Link>

            <button
              type="button"
              onClick={() => setOpenMenu((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ece7db] lg:hidden"
              aria-label="Open menu"
            >
              {openMenu ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {/* MOBILE SEARCH */}

        {searchOpen && (
          <div className="border-t border-[#ece7db] bg-white px-4 py-3 md:hidden">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
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
                      href={`/categories/${category.slug}`}
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
                        <p className="font-semibold">{category.name}</p>
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
          <div className="border-t border-[#ece7db] bg-white px-4 py-5 shadow-xl lg:hidden">
            <div className="grid gap-2">
              {[
                ["Home", "/"],
                ["Shop", "/login"],
                ["Categories", "/categories/electronics"],
                ["Deals", "/login"],
                ["Contact", "/login"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpenMenu(false)}
                  className="rounded-xl px-4 py-3.5 font-medium text-gray-700 transition hover:bg-[#faf8f3] hover:text-[#D4AF37]"
                >
                  {label}
                </Link>
              ))}

              <div className="mt-2 grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setOpenMenu(false)}
                  className="rounded-xl border border-gray-300 px-4 py-3 text-center font-semibold"
                >
                  Login
                </Link>

                <Link
                  href="/register"
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

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="px-4 pb-8 pt-5 sm:px-6 lg:pt-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative min-h-[540px] overflow-hidden rounded-[30px] border border-[#e9e1d2] bg-white shadow-[0_20px_70px_rgba(74,57,20,0.08)] sm:rounded-[40px]">

            {/* decorative background */}

            <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-[#f4e8c8] blur-3xl" />

            <div className="relative grid min-h-[540px] items-center lg:grid-cols-[1.02fr_.98fr]">

              {/* LEFT */}

              <div className="z-10 px-6 py-12 sm:px-10 lg:px-14 lg:py-16">

                <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#fffaf0] px-4 py-2 text-xs font-bold tracking-wide text-[#b58c24] sm:text-sm">
                  <Sparkles size={15} />
                  {currentSlide.eyebrow}
                </div>

                <div className="mt-5 inline-flex rounded-full bg-[#171512] px-3 py-1.5 text-xs font-semibold text-white">
                  {currentSlide.badge}
                </div>

                <h2 className="mt-6 max-w-2xl text-[48px] font-black leading-[0.96] tracking-[-0.04em] text-[#171512] sm:text-[64px] lg:text-[76px]">
                  {currentSlide.title}
                  <br />
                  <span className="text-[#D4AF37]">
                    {currentSlide.highlight}
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
                  {currentSlide.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-6 py-3.5 font-bold text-white shadow-lg shadow-[#D4AF37]/20 transition hover:-translate-y-0.5 hover:bg-[#c69f2f]"
                  >
                    {currentSlide.button}
                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-1"
                    />
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#ded8ca] bg-white px-6 py-3.5 font-semibold text-gray-800 transition hover:border-[#D4AF37] hover:text-[#b58c24]"
                  >
                    {currentSlide.secondary}
                  </Link>
                </div>

                {/* mini trust */}

                <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                  <div>
                    <p className="text-xl font-black">10K+</p>
                    <p className="text-xs text-gray-500">Happy Customers</p>
                  </div>

                  <div className="h-9 w-px bg-[#e7e0d2]" />

                  <div>
                    <p className="flex items-center gap-1 text-xl font-black">
                      4.8
                      <Star
                        size={16}
                        fill="currentColor"
                        className="text-[#D4AF37]"
                      />
                    </p>
                    <p className="text-xs text-gray-500">Customer Rating</p>
                  </div>

                  <div className="h-9 w-px bg-[#e7e0d2]" />

                  <div>
                    <p className="text-xl font-black">2500+</p>
                    <p className="text-xs text-gray-500">Products</p>
                  </div>
                </div>

                {/* slide controls */}

                <div className="mt-9 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={previousSlide}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ded8ca] bg-white transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {heroSlides.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`h-2 rounded-full transition-all ${
                          activeSlide === index
                            ? "w-7 bg-[#D4AF37]"
                            : "w-2 bg-[#d9d2c5]"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={nextSlide}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ded8ca] bg-white transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* RIGHT */}

              <div className="relative flex min-h-[350px] items-center justify-center px-5 pb-10 lg:min-h-full lg:px-8 lg:pb-0">

                <div className="absolute h-[290px] w-[290px] rounded-full bg-[#f5ead0] sm:h-[380px] sm:w-[380px] lg:h-[470px] lg:w-[470px]" />

                <div className="absolute right-6 top-10 hidden rounded-2xl border border-[#e9dfc9] bg-white/95 px-4 py-3 shadow-xl sm:block lg:right-12">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Today's highlight
                  </p>
                  <p className="mt-1 font-bold">Premium Deals</p>
                </div>

                <div className="absolute bottom-12 left-6 z-10 hidden rounded-2xl border border-[#e9dfc9] bg-white/95 px-4 py-3 shadow-xl sm:block lg:left-10">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff4d8] text-[#b58c24]">
                      <ShieldCheck size={16} />
                    </div>

                    <div>
                      <p className="text-xs font-bold">Safe Shopping</p>
                      <p className="text-[10px] text-gray-500">
                        Secure checkout
                      </p>
                    </div>
                  </div>
                </div>

                <Image
                  src="/hero-product.png"
                  alt="PrimeCart premium shopping"
                  width={900}
                  height={900}
                  priority
                  className="relative z-[1] w-[88%] max-w-[570px] object-contain drop-shadow-[0_25px_30px_rgba(50,35,10,0.12)] sm:w-[75%] lg:w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BENEFITS
      ========================================================= */}

      <section className="px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid overflow-hidden rounded-3xl border border-[#e9e2d5] bg-white shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className={`flex items-center gap-4 px-5 py-6 ${
                    index !== benefits.length - 1
                      ? "border-b border-[#eee8dc] sm:border-r lg:border-b-0"
                      : ""
                  }`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e5] text-[#b58c24]">
                    <Icon size={22} />
                  </div>

                  <div>
                    <h3 className="font-bold">{benefit.title}</h3>
                    <p className="mt-0.5 text-xs text-gray-500">
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

      <section className="px-4 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-[#b58c24]">
                <Zap size={16} />
                Limited Time
              </div>

              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Flash Deals
              </h2>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Grab the deal before the clock runs out.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-[#171512] px-3 py-2 text-center text-white">
                <p className="text-lg font-black leading-none">
                  {formattedTime.hours}
                </p>
                <p className="mt-1 text-[9px] uppercase tracking-wider text-white/60">
                  Hrs
                </p>
              </div>

              <span className="font-bold text-[#b58c24]">:</span>

              <div className="rounded-xl bg-[#171512] px-3 py-2 text-center text-white">
                <p className="text-lg font-black leading-none">
                  {formattedTime.minutes}
                </p>
                <p className="mt-1 text-[9px] uppercase tracking-wider text-white/60">
                  Min
                </p>
              </div>

              <span className="font-bold text-[#b58c24]">:</span>

              <div className="rounded-xl bg-[#171512] px-3 py-2 text-center text-white">
                <p className="text-lg font-black leading-none">
                  {formattedTime.seconds}
                </p>
                <p className="mt-1 text-[9px] uppercase tracking-wider text-white/60">
                  Sec
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {dealItems.map((deal) => (
              <Link
                key={deal.title}
                href={deal.href}
                className="group relative overflow-hidden rounded-[28px] border border-[#e9e2d5] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute right-4 top-4 z-10 rounded-full bg-[#171512] px-3 py-1.5 text-[10px] font-bold tracking-wider text-white">
                  {deal.discount}
                </div>

                <div className="flex h-[220px] items-center justify-center rounded-[22px] bg-[#faf8f3]">
                  <Image
                    src={deal.image}
                    alt={deal.title}
                    width={300}
                    height={240}
                    className="h-[190px] w-full object-contain transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex items-end justify-between gap-3 px-1 pt-5">
                  <div>
                    <p className="text-xl font-black">{deal.title}</p>
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

      {/* =========================================================
          CATEGORIES
      ========================================================= */}

      <section className="bg-white px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">

          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-[#b58c24]">
                Explore Store
              </p>

              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Shop By Category
              </h2>

              <p className="mt-2 max-w-xl text-gray-500">
                Find exactly what you need from our growing collection.
              </p>
            </div>

            <Link
              href="/categories/electronics"
              className="inline-flex items-center gap-2 font-semibold text-[#b58c24] transition hover:gap-3"
            >
              View all categories
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/categories/${category.slug}`}
                className="group overflow-hidden rounded-3xl border border-[#ece7db] bg-[#faf8f3] transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/40 hover:bg-white hover:shadow-xl"
              >
                <div className="flex h-36 items-center justify-center overflow-hidden px-4 pt-4 sm:h-40">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={180}
                    height={160}
                    className="h-full w-full object-contain transition duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="bg-white p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold">{category.name}</h3>

                    <ArrowUpRight
                      size={15}
                      className="text-gray-300 transition group-hover:text-[#D4AF37]"
                    />
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    {category.products}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          PRIME CART EXCLUSIVE
      ========================================================= */}

      <section className="px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">

          <div className="mb-9">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-[#b58c24]">
              More than shopping
            </p>

            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              The PrimeCart Advantage
            </h2>

            <p className="mt-2 max-w-2xl text-gray-500">
              Smart shopping tools designed to make buying easier, faster and
              more rewarding.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {primeFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group relative overflow-hidden rounded-[30px] border border-[#e8e1d4] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8"
                >
                  <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-[#D4AF37]/10 transition group-hover:scale-150" />

                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58c24]">
                        <Icon size={26} />
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ece7db] transition group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white">
                        <ArrowUpRight size={17} />
                      </div>
                    </div>

                    <h3 className="mt-6 text-2xl font-black">
                      {feature.title}
                    </h3>

                    <p className="mt-3 max-w-lg leading-6 text-gray-500">
                      {feature.description}
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#b58c24]">
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

      {/* =========================================================
          PRIMEPOINTS PROMO
      ========================================================= */}

      <section className="px-4 pb-16 sm:px-6 lg:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[32px] bg-[#171512] px-6 py-12 text-white sm:px-10 lg:px-14">

            <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#D4AF37]/20 blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#e4c46a]">
                  <Star size={14} fill="currentColor" />
                  PrimePoints
                </div>

                <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                  Shop. Earn.
                  <span className="text-[#D4AF37]"> Get Rewarded.</span>
                </h2>

                <p className="mt-4 max-w-xl leading-7 text-white/65">
                  Turn your shopping activity into rewards with PrimePoints.
                  Complete challenges, collect points and unlock exclusive
                  benefits.
                </p>

                <Link
                  href="/primepoints"
                  className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-6 py-3.5 font-bold text-white transition hover:bg-[#c69f2f]"
                >
                  Explore PrimePoints
                  <ArrowRight size={17} />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  ["01", "Shop"],
                  ["02", "Earn"],
                  ["03", "Redeem"],
                ].map(([number, label]) => (
                  <div
                    key={number}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm sm:p-6"
                  >
                    <p className="text-2xl font-black text-[#D4AF37]">
                      {number}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white/70 sm:text-sm">
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

      <section className="border-y border-[#ece7db] bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff5dc] text-[#b58c24]">
            <ShoppingBag size={24} />
          </div>

          <h2 className="mt-5 text-3xl font-black sm:text-4xl">
            Stay in the PrimeCart loop
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            Get notified about new arrivals, exclusive offers and limited-time
            deals.
          </p>

          {subscribed ? (
            <div className="mx-auto mt-7 max-w-xl rounded-2xl border border-[#d9e9d9] bg-[#f4fbf4] px-5 py-4 text-sm font-semibold text-green-700">
              ✓ You&apos;re subscribed. Welcome to PrimeCart!
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="mx-auto mt-7 flex max-w-xl flex-col gap-2 rounded-2xl border border-[#e8e1d4] bg-[#faf8f3] p-2 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="bg-[#faf8f3] px-4 pb-24 pt-14 sm:px-6 md:pb-8">
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 border-b border-[#e7e0d4] pb-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr]">

            {/* BRAND */}

            <div>
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="PrimeCart Logo"
                  width={50}
                  height={50}
                  className="h-12 w-12 object-contain"
                />

                <div>
                  <h2 className="text-2xl font-black">
                    Prime<span className="text-[#D4AF37]">Cart</span>
                  </h2>

                  <p className="text-xs text-gray-500">
                    Premium Shopping Store
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-sm leading-6 text-gray-500">
                Your one-stop destination for premium products, smart shopping
                tools and better deals.
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
              <h3 className="font-bold">Quick Links</h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-gray-500">
                <Link href="/" className="transition hover:text-[#D4AF37]">
                  Home
                </Link>

                <Link
                  href="/login"
                  className="transition hover:text-[#D4AF37]"
                >
                  Shop
                </Link>

                <Link
                  href="/categories/electronics"
                  className="transition hover:text-[#D4AF37]"
                >
                  Categories
                </Link>

                <Link
                  href="/login"
                  className="transition hover:text-[#D4AF37]"
                >
                  Deals
                </Link>
              </div>
            </div>

            {/* CUSTOMER */}

            <div>
              <h3 className="font-bold">Customer Service</h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-gray-500">
                <Link
                  href="/login"
                  className="transition hover:text-[#D4AF37]"
                >
                  Contact Us
                </Link>

                <Link
                  href="/login"
                  className="transition hover:text-[#D4AF37]"
                >
                  Shipping Policy
                </Link>

                <Link
                  href="/login"
                  className="transition hover:text-[#D4AF37]"
                >
                  Returns
                </Link>

                <Link
                  href="/login"
                  className="transition hover:text-[#D4AF37]"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* TRUST */}

            <div>
              <h3 className="font-bold">Why PrimeCart?</h3>

              <div className="mt-5 space-y-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 shrink-0 text-[#D4AF37]" size={19} />

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
                  <Truck className="mt-0.5 shrink-0 text-[#D4AF37]" size={19} />

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
                  <Headphones className="mt-0.5 shrink-0 text-[#D4AF37]" size={19} />

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
            <p>© 2026 PrimeCart. All Rights Reserved.</p>

            <p>
              Made for a smarter shopping experience.
            </p>
          </div>
        </div>
      </footer>

      {/* =========================================================
          MOBILE BOTTOM NAV
      ========================================================= */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e7e0d4] bg-white/95 px-3 py-2 shadow-[0_-5px_25px_rgba(50,35,10,0.08)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">

          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-3 py-1 text-[#D4AF37]"
          >
            <ShoppingBag size={19} />
            <span className="text-[10px] font-semibold">Home</span>
          </Link>

          <Link
            href="/categories/electronics"
            className="flex flex-col items-center gap-1 px-3 py-1 text-gray-500"
          >
            <Search size={19} />
            <span className="text-[10px] font-semibold">Shop</span>
          </Link>

          <Link
            href="/login"
            className="flex flex-col items-center gap-1 px-3 py-1 text-gray-500"
          >
            <Heart size={19} />
            <span className="text-[10px] font-semibold">Wishlist</span>
          </Link>

          <Link
            href="/login"
            className="relative flex flex-col items-center gap-1 px-3 py-1 text-gray-500"
          >
            <ShoppingCart size={19} />

            <span className="absolute right-1 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[8px] font-bold text-white">
              0
            </span>

            <span className="text-[10px] font-semibold">Cart</span>
          </Link>

          <Link
            href="/login"
            className="flex flex-col items-center gap-1 px-3 py-1 text-gray-500"
          >
            <UserRound size={19} />
            <span className="text-[10px] font-semibold">Account</span>
          </Link>

        </div>
      </div>
    </main>
  );
}
