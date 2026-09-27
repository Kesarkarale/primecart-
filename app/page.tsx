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
  offer: string;
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
    eyebrow: "SUPER SALE IS LIVE",
    title: "Shop More.",
    highlight: "Pay Less.",
    description:
      "Discover premium products, everyday essentials and exciting deals — all in one beautiful shopping experience.",
    button: "Shop Now",
    secondary: "Explore Deals",
    badge: "UP TO 70% OFF",
    offer: "Limited-time savings",
  },
  {
    eyebrow: "PRIMECART PICKS",
    title: "Curated.",
    highlight: "Just For You.",
    description:
      "Explore hand-picked products across electronics, fashion, beauty, home and gaming.",
    button: "Explore Picks",
    secondary: "View Categories",
    badge: "PREMIUM SELECTION",
    offer: "Editor's favourites",
  },
  {
    eyebrow: "FLASH DEALS",
    title: "Big Deals.",
    highlight: "Limited Time.",
    description:
      "Don't miss today's exclusive offers. Grab your favourites before the timer runs out.",
    button: "Grab Deals",
    secondary: "Shop Everything",
    badge: "LIMITED TIME",
    offer: "Deals ending soon",
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
    number: "01",
    title: "PrimeMatch",
    description:
      "Tell us what you need, your budget and priorities. Find products that fit your requirements.",
    href: "/dashboard/prime-match",
    label: "Find My Match",
  },
  {
    icon: Zap,
    number: "02",
    title: "Budget Builder",
    description:
      "Plan your shopping intelligently and discover the best combination within your budget.",
    href: "/dashboard/budget-builder",
    label: "Build Budget",
  },
  {
    icon: PackageCheck,
    number: "03",
    title: "Build My Setup",
    description:
      "Create complete gaming, college, work, fitness or home setups with ease.",
    href: "/dashboard/setup-builder",
    label: "Build Setup",
  },
  {
    icon: Star,
    number: "04",
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
    tag: "Trending",
  },
  {
    title: "Fashion",
    subtitle: "Refresh your everyday style",
    discount: "UP TO 50% OFF",
    image: "/fashion.png",
    href: "/dashboard/categories/fashion",
    tag: "Popular",
  },
  {
    title: "Home & Living",
    subtitle: "Make your space feel better",
    discount: "UP TO 45% OFF",
    image: "/home.png",
    href: "/dashboard/categories/home-and-living",
    tag: "New",
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

  useEffect(() => {
    if (!openMenu) return;

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpenMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [openMenu]);

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
    setActiveSlide((value) => (value + 1) % heroSlides.length);
  };

  const previousSlide = () => {
    setActiveSlide(
      (value) => (value - 1 + heroSlides.length) % heroSlides.length
    );
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#faf9f6] text-[#171512] selection:bg-[#d4af37]/20">
      {/* =========================================================
          ANNOUNCEMENT BAR
      ========================================================= */}

      <div className="hidden bg-[#171512] text-white sm:block">
        <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-between px-5 text-[11px] sm:px-8">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <Sparkles size={13} className="text-[#d4af37]" />
            <span>Premium shopping. Better prices. Smarter choices.</span>
          </div>

          <div className="flex items-center gap-6 text-white/65">
            <span>Free delivery above ₹499</span>
            <span>Easy returns</span>
            <span>Secure checkout</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <nav className="sticky top-0 z-50 border-b border-[#ebe6dc] bg-white/95 shadow-[0_5px_25px_rgba(35,27,10,0.045)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* LOGO */}

          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-[#d4af37]/10 blur-md transition group-hover:bg-[#d4af37]/20" />

              <Image
                src="/logo.png"
                alt="PrimeCart Logo"
                width={48}
                height={48}
                priority
                className="relative h-10 w-10 object-contain sm:h-11 sm:w-11"
              />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-[21px] font-black leading-none tracking-[-0.04em]">
                Prime<span className="text-[#d4af37]">Cart</span>
              </h1>

              <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#8d887e]">
                Premium Shopping
              </p>
            </div>
          </Link>

          {/* DESKTOP NAV */}

          <div className="ml-5 hidden items-center gap-6 lg:flex">
            <Link
              href="/"
              className="relative py-2 text-sm font-bold text-[#b38a22]"
            >
              Home
              <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#d4af37]" />
            </Link>

            <Link
              href="/auth/login"
              className="py-2 text-sm font-medium text-[#666159] transition hover:text-[#b38a22]"
            >
              Shop
            </Link>

            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1 py-2 text-sm font-medium text-[#666159] transition hover:text-[#b38a22]"
              >
                Categories
                <ChevronDown
                  size={14}
                  className="transition group-hover:rotate-180"
                />
              </button>

              <div className="invisible absolute left-1/2 top-full mt-3 w-[570px] -translate-x-1/2 translate-y-2 rounded-[26px] border border-[#ebe5d9] bg-white p-5 opacity-0 shadow-[0_25px_70px_rgba(40,30,10,0.14)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-base font-black">
                      Shop Categories
                    </p>
                    <p className="mt-1 text-xs text-[#918c83]">
                      Explore our most-loved collections
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff7e3] text-[#b38a22]">
                    <Sparkles size={17} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={`/dashboard/categories/${category.slug}`}
                      className="group/item flex items-center gap-3 rounded-2xl border border-transparent p-3 transition hover:border-[#ead9a9] hover:bg-[#fffbf2]"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f8f6f0]">
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={42}
                          height={42}
                          className="h-9 w-9 object-contain transition group-hover/item:scale-110"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {category.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#99938a]">
                          {category.products}
                        </p>
                      </div>

                      <ArrowUpRight
                        size={14}
                        className="ml-auto shrink-0 text-[#c8c2b6] transition group-hover/item:text-[#d4af37]"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/auth/login"
              className="py-2 text-sm font-medium text-[#666159] transition hover:text-[#b38a22]"
            >
              Deals
            </Link>

            <Link
              href="/auth/login"
              className="py-2 text-sm font-medium text-[#666159] transition hover:text-[#b38a22]"
            >
              Contact
            </Link>
          </div>

          {/* SEARCH */}

          <div className="relative ml-auto hidden max-w-[370px] flex-1 md:flex lg:ml-7">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#99938a]"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search products or categories..."
              className="h-11 w-full rounded-2xl border border-[#e9e3d8] bg-[#f9f7f2] pl-11 pr-4 text-sm text-[#24211d] outline-none transition placeholder:text-[#aaa49a] focus:border-[#d4af37] focus:bg-white focus:ring-4 focus:ring-[#d4af37]/10"
            />

            {searchOpen && search.trim() && (
              <div className="absolute left-0 right-0 top-[52px] overflow-hidden rounded-2xl border border-[#ebe5da] bg-white p-2 shadow-[0_20px_50px_rgba(30,25,15,0.12)]">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <Link
                      key={category.name}
                      href={`/dashboard/categories/${category.slug}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearch("");
                      }}
                      className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-[#faf8f2]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8f6f0]">
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={35}
                          height={35}
                          className="h-8 w-8 object-contain"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-bold">
                          {category.name}
                        </p>
                        <p className="text-[11px] text-[#99938a]">
                          {category.products}
                        </p>
                      </div>

                      <ArrowRight
                        size={14}
                        className="ml-auto text-[#c9c2b6]"
                      />
                    </Link>
                  ))
                ) : (
                  <div className="p-5 text-center text-sm text-[#8d887f]">
                    No matching category found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACTIONS */}

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchOpen((value) => !value);
                setOpenMenu(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f4ed] text-[#454039] transition hover:bg-[#f0eadc] hover:text-[#b38a22] md:hidden"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            <Link
              href="/auth/login"
              className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#f7f4ed] text-[#454039] transition hover:bg-[#f0eadc] hover:text-[#b38a22] sm:flex"
              aria-label="Wishlist"
            >
              <Heart size={18} />
            </Link>

            <Link
              href="/auth/login"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f4ed] text-[#454039] transition hover:bg-[#f0eadc] hover:text-[#b38a22]"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={18} />

              <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-white bg-[#d4af37] px-1 text-[8px] font-black text-white">
                0
              </span>
            </Link>

            <Link
              href="/auth/login"
              className="hidden h-10 items-center justify-center rounded-xl border border-[#ddd6ca] px-4 text-sm font-bold text-[#3f3a34] transition hover:border-[#d4af37] hover:text-[#b38a22] md:flex"
            >
              Login
            </Link>

            <Link
              href="/auth/register"
              className="hidden h-10 items-center justify-center rounded-xl bg-[#d4af37] px-4 text-sm font-bold text-white shadow-[0_8px_22px_rgba(212,175,55,0.22)] transition hover:-translate-y-0.5 hover:bg-[#c59f30] hover:shadow-[0_12px_28px_rgba(212,175,55,0.28)] md:flex"
            >
              Register
            </Link>

            <button
              type="button"
              onClick={() => {
                setOpenMenu((value) => !value);
                setSearchOpen(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8e2d7] text-[#37332e] transition hover:border-[#d4af37] hover:text-[#b38a22] lg:hidden"
              aria-label="Open menu"
            >
              {openMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MOBILE SEARCH */}

        {searchOpen && (
          <div className="border-t border-[#eee8de] bg-white px-4 py-3 md:hidden">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b958b]"
              />

              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products or categories..."
                className="h-12 w-full rounded-2xl border border-[#e6dfd3] bg-[#faf8f3] pl-11 pr-4 text-sm outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10"
              />
            </div>

            {search.trim() && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-[#ebe5da] bg-white p-1.5 shadow-lg">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <Link
                      key={category.name}
                      href={`/dashboard/categories/${category.slug}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearch("");
                      }}
                      className="flex items-center gap-3 rounded-xl p-3 hover:bg-[#faf8f2]"
                    >
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={38}
                        height={38}
                        className="h-9 w-9 object-contain"
                      />

                      <div>
                        <p className="text-sm font-bold">
                          {category.name}
                        </p>
                        <p className="text-[11px] text-[#99938a]">
                          {category.products}
                        </p>
                      </div>

                      <ArrowRight
                        size={14}
                        className="ml-auto text-[#c8c1b6]"
                      />
                    </Link>
                  ))
                ) : (
                  <p className="p-4 text-center text-sm text-[#8d887f]">
                    No category found.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* MOBILE MENU */}

        {openMenu && (
          <div className="border-t border-[#eee8de] bg-white px-4 py-5 shadow-[0_15px_35px_rgba(30,25,15,0.08)] lg:hidden">
            <div className="mx-auto max-w-md">
              <div className="mb-4 rounded-2xl bg-[#faf8f3] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b38a22]">
                  PrimeCart
                </p>
                <p className="mt-1 text-sm font-semibold text-[#46413a]">
                  Premium shopping, made simpler.
                </p>
              </div>

              <div className="grid gap-1">
                {[
                  ["Home", "/"],
                  ["Shop", "/auth/login"],
                  ["Categories", "/dashboard/categories/electronics"],
                  ["Deals", "/auth/login"],
                  ["Contact", "/auth/login"],
                ].map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setOpenMenu(false)}
                    className="rounded-xl px-4 py-3.5 text-sm font-semibold text-[#514c45] transition hover:bg-[#faf8f3] hover:text-[#b38a22]"
                  >
                    {label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Link
                  href="/auth/login"
                  onClick={() => setOpenMenu(false)}
                  className="rounded-xl border border-[#ddd6ca] px-4 py-3 text-center text-sm font-bold"
                >
                  Login
                </Link>

                <Link
                  href="/auth/register"
                  onClick={() => setOpenMenu(false)}
                  className="rounded-xl bg-[#d4af37] px-4 py-3 text-center text-sm font-bold text-white"
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

      <section className="px-3 pb-7 pt-3 sm:px-5 sm:pt-5 lg:px-7 lg:pt-7">
        <div className="mx-auto max-w-[1440px]">
          <div className="relative overflow-hidden rounded-[26px] border border-[#e8e0d2] bg-white shadow-[0_22px_80px_rgba(65,48,15,0.08)] sm:rounded-[34px] lg:rounded-[42px]">
            {/* Background glow */}

            <div className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-[#d4af37]/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-48 left-[30%] h-[440px] w-[440px] rounded-full bg-[#f5ead0] blur-3xl" />

            <div className="pointer-events-none absolute left-[48%] top-0 h-full w-px bg-gradient-to-b from-transparent via-[#eadfca] to-transparent opacity-60" />

            <div className="relative grid min-h-[620px] lg:grid-cols-[0.96fr_1.04fr]">
              {/* LEFT */}

              <div className="relative z-10 flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#ead8a5] bg-[#fffaf0] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#ad8420] sm:text-xs">
                  <Sparkles size={13} />
                  {currentSlide.eyebrow}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#171512] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-white">
                    {currentSlide.badge}
                  </span>

                  <span className="rounded-full border border-[#e8dfcd] bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#857f75]">
                    {currentSlide.offer}
                  </span>
                </div>

                <h2 className="mt-6 max-w-[650px] text-[46px] font-black leading-[0.94] tracking-[-0.055em] text-[#181613] sm:text-[62px] lg:text-[76px] xl:text-[84px]">
                  {currentSlide.title}
                  <br />
                  <span className="text-[#d4af37]">
                    {currentSlide.highlight}
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-[15px] leading-7 text-[#716b63] sm:text-[17px]">
                  {currentSlide.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/auth/login"
                    className="group inline-flex items-center gap-2 rounded-2xl bg-[#d4af37] px-6 py-3.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(212,175,55,0.22)] transition hover:-translate-y-0.5 hover:bg-[#c69f2f] hover:shadow-[0_16px_34px_rgba(212,175,55,0.3)]"
                  >
                    {currentSlide.button}

                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </Link>

                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#ddd6ca] bg-white px-6 py-3.5 text-sm font-bold text-[#3e3933] transition hover:border-[#d4af37] hover:text-[#ad8420]"
                  >
                    {currentSlide.secondary}
                  </Link>
                </div>

                {/* Trust */}

                <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <div>
                    <p className="text-xl font-black">10K+</p>
                    <p className="mt-0.5 text-[10px] font-medium text-[#918b82]">
                      Happy Customers
                    </p>
                  </div>

                  <div className="h-8 w-px bg-[#e5ded1]" />

                  <div>
                    <p className="flex items-center gap-1 text-xl font-black">
                      4.8
                      <Star
                        size={15}
                        fill="currentColor"
                        className="text-[#d4af37]"
                      />
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium text-[#918b82]">
                      Customer Rating
                    </p>
                  </div>

                  <div className="h-8 w-px bg-[#e5ded1]" />

                  <div>
                    <p className="text-xl font-black">2500+</p>
                    <p className="mt-0.5 text-[10px] font-medium text-[#918b82]">
                      Products
                    </p>
                  </div>
                </div>

                {/* Slider controls */}

                <div className="mt-8 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={previousSlide}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd6ca] bg-white transition hover:border-[#d4af37] hover:text-[#b38a22]"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={17} />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {heroSlides.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          activeSlide === index
                            ? "w-8 bg-[#d4af37]"
                            : "w-1.5 bg-[#d9d2c5]"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={nextSlide}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd6ca] bg-white transition hover:border-[#d4af37] hover:text-[#b38a22]"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>

              {/* RIGHT */}

              <div className="relative flex min-h-[350px] items-center justify-center px-5 pb-12 lg:min-h-full lg:px-7 lg:pb-0">
                <div className="absolute h-[275px] w-[275px] rounded-full border border-[#e6d7b4] bg-[#f8efd9] shadow-[0_0_80px_rgba(212,175,55,0.14)] sm:h-[370px] sm:w-[370px] lg:h-[470px] lg:w-[470px]" />

                <div className="absolute h-[205px] w-[205px] rounded-full border border-white/80 bg-white/30 sm:h-[280px] sm:w-[280px] lg:h-[360px] lg:w-[360px]" />

                {/* top card */}

                <div className="absolute right-5 top-7 z-20 rounded-2xl border border-[#e7ddc7] bg-white/90 px-4 py-3 shadow-[0_15px_35px_rgba(40,30,10,0.1)] backdrop-blur sm:right-8 sm:top-10">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff4d6] text-[#b38a22]">
                      <Zap size={15} />
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-[#9b948a]">
                        Today&apos;s highlight
                      </p>
                      <p className="mt-0.5 text-xs font-black">
                        Premium Deals
                      </p>
                    </div>
                  </div>
                </div>

                {/* bottom card */}

                <div className="absolute bottom-9 left-4 z-20 rounded-2xl border border-[#e7ddc7] bg-white/90 px-4 py-3 shadow-[0_15px_35px_rgba(40,30,10,0.1)] backdrop-blur sm:left-8 lg:bottom-14">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff4d8] text-[#b38a22]">
                      <ShieldCheck size={17} />
                    </div>

                    <div>
                      <p className="text-xs font-black">Safe Shopping</p>
                      <p className="mt-0.5 text-[9px] text-[#8f897f]">
                        Secure checkout
                      </p>
                    </div>
                  </div>
                </div>

                {/* offer pill */}

                <div className="absolute bottom-6 right-5 z-20 hidden rounded-full border border-[#ead9aa] bg-[#171512] px-4 py-2 text-[9px] font-black uppercase tracking-wider text-[#f1d77e] sm:block lg:right-9 lg:bottom-10">
                  Premium picks
                </div>

                <Image
                  src="/hero-product.png"
                  alt="PrimeCart premium shopping"
                  width={900}
                  height={900}
                  priority
                  className="relative z-10 w-[92%] max-w-[530px] object-contain drop-shadow-[0_30px_35px_rgba(45,30,8,0.16)] sm:w-[76%] lg:w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TRUST / BENEFITS
      ========================================================= */}

      <section className="px-4 py-2 sm:px-6">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid overflow-hidden rounded-[24px] border border-[#e9e2d7] bg-white shadow-[0_8px_30px_rgba(50,40,20,0.035)] sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className={`flex items-center gap-3.5 px-5 py-5 sm:px-6 ${
                    index !== benefits.length - 1
                      ? "border-b border-[#eee8de] sm:border-r lg:border-b-0"
                      : ""
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e4] text-[#b38a22]">
                    <Icon size={20} />
                  </div>

                  <div>
                    <h3 className="text-sm font-black">
                      {benefit.title}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-[#8e887f]">
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

      <section className="px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#b38a22]">
                <Zap size={14} />
                Limited Time
              </div>

              <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                Flash Deals
              </h2>

              <p className="mt-2 max-w-xl text-sm text-[#878178] sm:text-base">
                Trending categories, special prices and limited-time savings.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="rounded-xl bg-[#171512] px-3 py-2 text-center text-white">
                <p className="text-base font-black leading-none sm:text-lg">
                  {formattedTime.hours}
                </p>
                <p className="mt-1 text-[8px] uppercase tracking-wider text-white/55">
                  Hrs
                </p>
              </div>

              <span className="font-black text-[#c19a35]">:</span>

              <div className="rounded-xl bg-[#171512] px-3 py-2 text-center text-white">
                <p className="text-base font-black leading-none sm:text-lg">
                  {formattedTime.minutes}
                </p>
                <p className="mt-1 text-[8px] uppercase tracking-wider text-white/55">
                  Min
                </p>
              </div>

              <span className="font-black text-[#c19a35]">:</span>

              <div className="rounded-xl bg-[#171512] px-3 py-2 text-center text-white">
                <p className="text-base font-black leading-none sm:text-lg">
                  {formattedTime.seconds}
                </p>
                <p className="mt-1 text-[8px] uppercase tracking-wider text-white/55">
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
                className="group relative overflow-hidden rounded-[28px] border border-[#e8e1d5] bg-white p-4 shadow-[0_8px_28px_rgba(45,35,15,0.04)] transition duration-300 hover:-translate-y-1.5 hover:border-[#dfca8f] hover:shadow-[0_20px_45px_rgba(45,35,15,0.09)] sm:p-5"
              >
                <div className="absolute left-5 top-5 z-10 rounded-full bg-[#fff5da] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#ad8420]">
                  {deal.tag}
                </div>

                <div className="absolute right-5 top-5 z-10 rounded-full bg-[#171512] px-3 py-1.5 text-[9px] font-black tracking-wider text-white">
                  {deal.discount}
                </div>

                <div className="flex h-[220px] items-center justify-center overflow-hidden rounded-[22px] bg-[#faf8f3] sm:h-[245px]">
                  <Image
                    src={deal.image}
                    alt={deal.title}
                    width={350}
                    height={260}
                    className="h-[190px] w-[90%] object-contain transition duration-500 group-hover:scale-110 sm:h-[215px]"
                  />
                </div>

                <div className="flex items-end justify-between gap-4 px-1 pb-1 pt-5">
                  <div>
                    <p className="text-xl font-black tracking-tight">
                      {deal.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#8d877e] sm:text-sm">
                      {deal.subtitle}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#b38a22]">
                      Shop collection
                      <ArrowRight size={13} />
                    </div>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e5ded2] transition group-hover:border-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-white">
                    <ArrowUpRight size={17} />
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

      <section className="border-y border-[#eee8df] bg-white px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#b38a22]">
                Explore Store
              </p>

              <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                Shop By Category
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#858078] sm:text-base">
                Browse popular collections and find products that fit your
                lifestyle.
              </p>
            </div>

            <Link
              href="/dashboard/categories/electronics"
              className="group inline-flex items-center gap-2 text-sm font-black text-[#ad8420]"
            >
              View all categories
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                href={`/dashboard/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-[25px] border border-[#ebe5da] bg-[#faf8f3] transition duration-300 hover:-translate-y-1 hover:border-[#ddc57f] hover:bg-white hover:shadow-[0_18px_40px_rgba(45,35,15,0.08)]"
              >
                <div className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-[#b38a22] opacity-0 shadow-sm transition group-hover:opacity-100">
                  <ArrowUpRight size={12} />
                </div>

                <div className="flex h-32 items-center justify-center overflow-hidden px-4 pt-4 sm:h-36">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={180}
                    height={160}
                    className="h-full w-full object-contain transition duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="border-t border-[#eee8de] bg-white p-3.5 sm:p-4">
                  <h3 className="truncate text-sm font-black">
                    {category.name}
                  </h3>

                  <p className="mt-1 text-[10px] font-medium text-[#918b82]">
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
      ========================================================= */}

      <section className="px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-9">
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#b38a22]">
              More than shopping
            </p>

            <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              The PrimeCart Advantage
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#858078] sm:text-base">
              Smart tools designed to make buying easier, faster and more
              rewarding.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {primeFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group relative overflow-hidden rounded-[28px] border border-[#e8e1d5] bg-white p-6 shadow-[0_7px_28px_rgba(45,35,15,0.035)] transition duration-300 hover:-translate-y-1 hover:border-[#ddc57f] hover:shadow-[0_20px_50px_rgba(45,35,15,0.08)] sm:p-7"
                >
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#d4af37]/8 transition duration-500 group-hover:scale-150" />

                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-13 w-13 h-14 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b38a22]">
                          <Icon size={25} />
                        </div>

                        <span className="text-[10px] font-black tracking-[0.16em] text-[#bcb5aa]">
                          {feature.number}
                        </span>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ebe5da] transition group-hover:border-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-white">
                        <ArrowUpRight size={15} />
                      </div>
                    </div>

                    <h3 className="mt-6 text-xl font-black tracking-tight sm:text-2xl">
                      {feature.title}
                    </h3>

                    <p className="mt-2.5 max-w-lg text-sm leading-6 text-[#817b72]">
                      {feature.description}
                    </p>

                    <div className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[#ad8420]">
                      {feature.label}
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

      {/* =========================================================
          PRIMEPOINTS
      ========================================================= */}

      <section className="px-4 pb-16 sm:px-6 lg:pb-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="relative overflow-hidden rounded-[32px] bg-[#171512] px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-14">
            <div className="absolute -right-32 -top-40 h-96 w-96 rounded-full bg-[#d4af37]/20 blur-3xl" />

            <div className="absolute -bottom-40 left-[35%] h-80 w-80 rounded-full bg-[#d4af37]/10 blur-3xl" />

            <div className="absolute right-[38%] top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent lg:block" />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_390px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/35 bg-[#d4af37]/10 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#e8cb72]">
                  <Star size={13} fill="currentColor" />
                  PrimePoints
                </div>

                <h2 className="mt-5 max-w-2xl text-3xl font-black leading-[1.05] tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                  Shop. Earn.
                  <span className="text-[#d4af37]">
                    {" "}
                    Get Rewarded.
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
                  Turn your shopping activity into rewards with PrimePoints.
                  Complete challenges, collect points and unlock exclusive
                  benefits.
                </p>

                <Link
                  href="/dashboard/prime-points"
                  className="group mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#d4af37] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#c69f2f]"
                >
                  Explore PrimePoints
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
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
                    className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4 text-center backdrop-blur-sm sm:p-6"
                  >
                    <p className="text-2xl font-black text-[#d4af37]">
                      {number}
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-white/65 sm:text-sm">
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

      <section className="border-y border-[#ece7df] bg-white px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff5dc] text-[#b38a22]">
            <ShoppingBag size={23} />
          </div>

          <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            Stay in the PrimeCart loop
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#858078] sm:text-base">
            Get notified about new arrivals, exclusive offers and limited-time
            deals.
          </p>

          {subscribed ? (
            <div className="mx-auto mt-7 max-w-xl rounded-2xl border border-[#d5e8d6] bg-[#f3fbf3] px-5 py-4 text-sm font-bold text-green-700">
              ✓ You&apos;re subscribed. Welcome to PrimeCart!
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="mx-auto mt-7 flex max-w-xl flex-col gap-2 rounded-[20px] border border-[#e7e0d5] bg-[#faf8f3] p-2 shadow-sm sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                className="h-12 min-w-0 flex-1 rounded-xl bg-transparent px-4 text-sm outline-none placeholder:text-[#a39c92]"
              />

              <button
                type="submit"
                className="h-12 rounded-xl bg-[#d4af37] px-6 text-sm font-black text-white transition hover:bg-[#c69f2f]"
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
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-10 border-b border-[#e7e0d4] pb-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
            {/* BRAND */}

            <div>
              <Link
                href="/"
                className="group flex items-center gap-3"
              >
                <Image
                  src="/logo.png"
                  alt="PrimeCart Logo"
                  width={50}
                  height={50}
                  className="h-12 w-12 object-contain transition group-hover:scale-105"
                />

                <div>
                  <h2 className="text-2xl font-black tracking-tight">
                    Prime<span className="text-[#d4af37]">Cart</span>
                  </h2>

                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8e887f]">
                    Premium Shopping Store
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-6 text-[#817b72]">
                Your one-stop destination for premium products, smart shopping
                tools and better deals.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#e3dccf] bg-white px-3 py-1.5 text-[10px] font-bold text-[#69635b]">
                  Secure Shopping
                </span>

                <span className="rounded-full border border-[#e3dccf] bg-white px-3 py-1.5 text-[10px] font-bold text-[#69635b]">
                  Easy Returns
                </span>

                <span className="rounded-full border border-[#e3dccf] bg-white px-3 py-1.5 text-[10px] font-bold text-[#69635b]">
                  Genuine Products
                </span>
              </div>
            </div>

            {/* QUICK LINKS */}

            <div>
              <h3 className="text-sm font-black">Quick Links</h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-[#777168]">
                <Link
                  href="/"
                  className="transition hover:text-[#d4af37]"
                >
                  Home
                </Link>

                <Link
                  href="/auth/login"
                  className="transition hover:text-[#d4af37]"
                >
                  Shop
                </Link>

                <Link
                  href="/dashboard/categories/electronics"
                  className="transition hover:text-[#d4af37]"
                >
                  Categories
                </Link>

                <Link
                  href="/auth/login"
                  className="transition hover:text-[#d4af37]"
                >
                  Deals
                </Link>
              </div>
            </div>

            {/* CUSTOMER */}

            <div>
              <h3 className="text-sm font-black">
                Customer Service
              </h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-[#777168]">
                <Link
                  href="/auth/login"
                  className="transition hover:text-[#d4af37]"
                >
                  Contact Us
                </Link>

                <Link
                  href="/auth/login"
                  className="transition hover:text-[#d4af37]"
                >
                  Shipping Policy
                </Link>

                <Link
                  href="/auth/login"
                  className="transition hover:text-[#d4af37]"
                >
                  Returns
                </Link>

                <Link
                  href="/auth/login"
                  className="transition hover:text-[#d4af37]"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* TRUST */}

            <div>
              <h3 className="text-sm font-black">
                Why PrimeCart?
              </h3>

              <div className="mt-5 space-y-4">
                <div className="flex gap-3">
                  <ShieldCheck
                    className="mt-0.5 shrink-0 text-[#d4af37]"
                    size={18}
                  />

                  <div>
                    <p className="text-sm font-bold">
                      Secure shopping
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-[#8b857c]">
                      Safe and protected checkout experience.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Truck
                    className="mt-0.5 shrink-0 text-[#d4af37]"
                    size={18}
                  />

                  <div>
                    <p className="text-sm font-bold">
                      Reliable delivery
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-[#8b857c]">
                      Easy and convenient order delivery.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Headphones
                    className="mt-0.5 shrink-0 text-[#d4af37]"
                    size={18}
                  />

                  <div>
                    <p className="text-sm font-bold">
                      Customer support
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-[#8b857c]">
                      Help whenever you need it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 py-6 text-center text-[10px] text-[#8b857d] sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p>© 2026 PrimeCart. All Rights Reserved.</p>

            <p>Made for a smarter shopping experience.</p>
          </div>
        </div>
      </footer>

      {/* =========================================================
          MOBILE BOTTOM NAV
      ========================================================= */}

      <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-[#e7e0d4] bg-white/95 px-2 py-2 shadow-[0_-8px_30px_rgba(50,35,10,0.09)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <Link
            href="/"
            className="flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[#c09a32]"
          >
            <ShoppingBag size={18} />
            <span className="text-[9px] font-black">Home</span>
          </Link>

          <Link
            href="/dashboard/categories/electronics"
            className="flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[#817b72]"
          >
            <Search size={18} />
            <span className="text-[9px] font-bold">Shop</span>
          </Link>

          <Link
            href="/auth/login"
            className="flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[#817b72]"
          >
            <Heart size={18} />
            <span className="text-[9px] font-bold">Wishlist</span>
          </Link>

          <Link
            href="/auth/login"
            className="relative flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[#817b72]"
          >
            <ShoppingCart size={18} />

            <span className="absolute right-1.5 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#d4af37] px-1 text-[7px] font-black text-white">
              0
            </span>

            <span className="text-[9px] font-bold">Cart</span>
          </Link>

          <Link
            href="/auth/login"
            className="flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[#817b72]"
          >
            <UserRound size={18} />
            <span className="text-[9px] font-bold">Account</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
