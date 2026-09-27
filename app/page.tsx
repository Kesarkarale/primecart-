"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  Clock3,
  Facebook,
  Heart,
  Headphones,
  Instagram,
  Mail,
  Menu,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  Twitter,
  UserRound,
  X,
  Zap,
} from "lucide-react";

const categories = [
  {
    name: "Electronics",
    subtitle: "Smart technology",
    products: "2500+ Products",
    image: "/electronics.png",
    href: "/categories/electronics",
  },
  {
    name: "Fashion",
    subtitle: "Style your way",
    products: "1800+ Products",
    image: "/fashion.png",
    href: "/categories/fashion",
  },
  {
    name: "Watches",
    subtitle: "Timeless style",
    products: "1200+ Products",
    image: "/watch.png",
    href: "/categories/watches",
  },
  {
    name: "Beauty",
    subtitle: "Care & beauty",
    products: "800+ Products",
    image: "/beauty.png",
    href: "/categories/beauty",
  },
  {
    name: "Home & Living",
    subtitle: "Make it yours",
    products: "1500+ Products",
    image: "/home.png",
    href: "/categories/home-and-living",
  },
  {
    name: "Gaming",
    subtitle: "Level up",
    products: "950+ Products",
    image: "/gaming.png",
    href: "/categories/gaming",
  },
];

const benefits = [
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick and reliable delivery across India.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Protected checkout with secure payments.",
  },
  {
    icon: PackageCheck,
    title: "Easy Returns",
    description: "Simple returns for a stress-free experience.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We're always here when you need us.",
  },
];

const lifestyle = [
  {
    title: "Work From Home",
    text: "Build a smarter workspace.",
    tag: "Explore Setup",
  },
  {
    title: "Gaming Zone",
    text: "Upgrade your gaming experience.",
    tag: "Build Your Setup",
  },
  {
    title: "Everyday Style",
    text: "Fresh looks for every occasion.",
    tag: "Shop Fashion",
  },
];

const deals = [
  {
    title: "Smart Tech",
    discount: "UP TO 40% OFF",
    text: "Upgrade your everyday technology.",
  },
  {
    title: "Fashion Edit",
    discount: "UP TO 50% OFF",
    text: "New season styles at better prices.",
  },
  {
    title: "Home Essentials",
    discount: "UP TO 35% OFF",
    text: "Make your space feel better.",
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fcfaf6] text-[#171614]">
      {/* =========================================================
          TOP BAR
      ========================================================= */}

      <div className="bg-[#171614] text-white">
        <div className="mx-auto flex min-h-[34px] max-w-[1440px] items-center justify-between gap-4 px-4 text-[10px] sm:px-6 sm:text-[11px] lg:px-8">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-[#d8b45f]" />
            <span>Premium shopping. Better value.</span>
          </div>

          <div className="hidden items-center gap-5 sm:flex">
            <span>Free delivery above ₹499</span>
            <span className="h-3 w-px bg-white/20" />
            <span>Easy returns</span>
            <span className="h-3 w-px bg-white/20" />
            <span>Secure checkout</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header className="sticky top-0 z-50 border-b border-[#ebe5d9] bg-white/95 shadow-[0_4px_20px_rgba(0,0,0,0.035)] backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center gap-5 lg:h-[78px]">
            {/* LOGO */}

            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex shrink-0 items-center gap-2.5"
            >
              <Image
                src="/logo.png"
                alt="PrimeCart"
                width={52}
                height={52}
                priority
                className="h-11 w-11 object-contain sm:h-12 sm:w-12"
              />

              <div>
                <div className="text-[21px] font-extrabold tracking-[-0.04em] sm:text-[23px]">
                  Prime<span className="text-[#c79a3b]">Cart</span>
                </div>

                <div className="hidden text-[8px] font-bold uppercase tracking-[0.23em] text-gray-400 sm:block">
                  Premium Shopping
                </div>
              </div>
            </Link>

            {/* DESKTOP NAV */}

            <div className="ml-4 hidden items-center gap-7 lg:flex">
              <Link
                href="/"
                className="text-sm font-bold text-[#b17e24]"
              >
                Home
              </Link>

              <Link
                href="#categories"
                className="text-sm font-medium text-gray-600 transition hover:text-[#b17e24]"
              >
                Shop
              </Link>

              <button
                type="button"
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-[#b17e24]"
              >
                Categories
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    categoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <Link
                href="#deals"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-[#b17e24]"
              >
                Deals
                <span className="rounded-full bg-[#fff0ca] px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#a87520]">
                  Hot
                </span>
              </Link>

              <Link
                href="#why"
                className="text-sm font-medium text-gray-600 transition hover:text-[#b17e24]"
              >
                Why PrimeCart
              </Link>
            </div>

            {/* SEARCH */}

            <div className="ml-auto hidden max-w-[300px] flex-1 xl:block">
              <div className="group flex h-11 items-center gap-3 rounded-xl border border-[#e8e2d7] bg-[#faf9f5] px-4 transition focus-within:border-[#d4b56f] focus-within:bg-white">
                <Search
                  size={17}
                  className="shrink-0 text-gray-400 group-focus-within:text-[#b17e24]"
                />

                <input
                  type="text"
                  placeholder="Search products, brands..."
                  className="w-full bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
                />

                <span className="hidden rounded-md border border-[#e4ddd0] bg-white px-1.5 py-0.5 text-[8px] text-gray-400 2xl:block">
                  /
                </span>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="ml-auto flex items-center gap-2 xl:ml-0">
              <Link
                href="/auth/login"
                className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#ebe5da] bg-[#faf9f5] text-gray-600 transition hover:border-[#d8bb78] hover:text-[#b17e24] sm:flex"
              >
                <Search size={18} />
              </Link>

              <Link
                href="/auth/login"
                className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#ebe5da] bg-[#faf9f5] text-gray-600 transition hover:border-[#d8bb78] hover:text-[#b17e24] md:flex"
              >
                <Heart size={18} />
              </Link>

              <Link
                href="/auth/login"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#ebe5da] bg-[#faf9f5] text-gray-600 transition hover:border-[#d8bb78] hover:text-[#b17e24]"
              >
                <ShoppingCart size={18} />

                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c79a3b] px-1 text-[8px] font-bold text-white">
                  0
                </span>
              </Link>

              <Link
                href="/auth/login"
                className="hidden h-10 items-center gap-2 rounded-xl border border-[#ddd7cc] px-4 text-sm font-semibold text-gray-700 transition hover:border-[#c79a3b] hover:text-[#b17e24] md:flex"
              >
                <UserRound size={16} />
                Login
              </Link>

              <Link
                href="/auth/register"
                className="hidden h-10 items-center rounded-xl bg-[#c79a3b] px-5 text-sm font-bold text-white shadow-[0_7px_18px_rgba(199,154,59,0.18)] transition hover:-translate-y-0.5 hover:bg-[#b8872d] md:flex"
              >
                Register
              </Link>

              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ebe5da] bg-[#faf9f5] text-gray-700 lg:hidden"
                aria-label="Menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* CATEGORY DROPDOWN */}

          {categoryOpen && (
            <div className="absolute left-0 right-0 top-full hidden border-b border-[#e9e2d7] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] lg:block">
              <div className="mx-auto max-w-[1200px] px-8 py-7">
                <div className="grid grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      onClick={() => setCategoryOpen(false)}
                      className="group flex items-center gap-4 rounded-2xl border border-transparent p-3 transition hover:border-[#e9dfc8] hover:bg-[#fffaf0]"
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#f8f4ea]">
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={70}
                          height={70}
                          className="h-full w-full object-contain p-2 transition group-hover:scale-105"
                        />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          {category.name}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {category.subtitle}
                        </p>
                      </div>

                      <ChevronRight
                        size={16}
                        className="ml-auto text-gray-300 group-hover:text-[#b17e24]"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MOBILE MENU */}

          {menuOpen && (
            <div className="border-t border-[#eee7dc] py-4 lg:hidden">
              <div className="flex flex-col gap-1">
                {[
                  ["Home", "#home"],
                  ["Shop", "#categories"],
                  ["Categories", "#categories"],
                  ["Deals", "#deals"],
                  ["Why PrimeCart", "#why"],
                ].map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-700 hover:bg-[#faf7ef] hover:text-[#b17e24]"
                  >
                    {label}
                    <ChevronRight size={16} />
                  </Link>
                ))}

                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#eee7dc] pt-4">
                  <Link
                    href="/auth/login"
                    className="flex h-11 items-center justify-center rounded-xl border border-[#ddd7cc] text-sm font-bold"
                  >
                    Login
                  </Link>

                  <Link
                    href="/auth/register"
                    className="flex h-11 items-center justify-center rounded-xl bg-[#c79a3b] text-sm font-bold text-white"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}

      <section
        id="home"
        className="relative overflow-hidden scroll-mt-24"
      >
        <div className="absolute left-[-150px] top-20 h-[400px] w-[400px] rounded-full bg-[#e8d19a]/20 blur-[100px]" />
        <div className="absolute bottom-0 right-[-150px] h-[450px] w-[450px] rounded-full bg-[#e5c67e]/15 blur-[100px]" />

        <div className="relative mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="relative overflow-hidden rounded-[30px] border border-[#e8deca] bg-white shadow-[0_25px_70px_rgba(72,53,18,0.08)] sm:rounded-[40px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(213,178,95,0.14),transparent_30%)]" />

            <div className="grid min-h-[570px] lg:grid-cols-[0.92fr_1.08fr]">
              {/* CONTENT */}

              <div className="relative z-10 flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14 xl:px-16">
                <div className="flex w-fit items-center gap-2 rounded-full border border-[#e5cc91] bg-[#fffaf0] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#aa7620] sm:text-[11px]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c79a3b] text-white">
                    <Zap size={10} fill="currentColor" />
                  </span>
                  Summer Mega Sale
                </div>

                <h1 className="mt-6 max-w-[650px] text-[46px] font-extrabold leading-[0.96] tracking-[-0.055em] sm:text-[61px] lg:text-[72px] xl:text-[80px]">
                  Everything
                  <br />
                  you want.
                  <br />
                  <span className="text-[#c79a3b]">Better prices.</span>
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-7 text-gray-500 sm:text-base lg:text-[17px]">
                  Discover trending products, exclusive deals and everyday
                  essentials — all in one premium shopping destination.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/lauth/ogin"
                    className="group flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#c79a3b] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(199,154,59,0.25)] transition hover:-translate-y-1 hover:bg-[#b8872d]"
                  >
                    Start Shopping
                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-1"
                    />
                  </Link>

                  <Link
                    href="#deals"
                    className="group flex h-13 items-center justify-center gap-2 rounded-2xl border border-[#ded8cc] bg-white px-7 py-3.5 text-sm font-bold text-gray-800 transition hover:-translate-y-1 hover:border-[#c79a3b]"
                  >
                    View Deals
                    <ArrowUpRight
                      size={17}
                      className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>

                <div className="mt-9 flex flex-wrap items-center gap-5 border-t border-[#eee8dc] pt-6">
                  <div className="flex -space-x-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#e6d3a7] text-[10px] font-bold">
                      A
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#cbb98f] text-[10px] font-bold">
                      R
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#aa956b] text-[10px] font-bold">
                      S
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#25221d] text-[9px] font-bold text-white">
                      +10K
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={12}
                          fill="#c79a3b"
                          className="text-[#c79a3b]"
                        />
                      ))}
                      <span className="ml-1 text-xs font-bold">4.9</span>
                    </div>

                    <p className="mt-0.5 text-[11px] text-gray-500">
                      Trusted by 10,000+ shoppers
                    </p>
                  </div>
                </div>
              </div>

              {/* VISUAL */}

              <div className="relative flex min-h-[330px] items-center justify-center overflow-hidden bg-[#f8f3e8] px-4 pb-8 sm:min-h-[430px] sm:px-8 lg:min-h-full lg:pb-0">
                <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e5cb8e]/25 blur-3xl sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px]" />

                <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d7bd7b]/30 sm:h-[390px] sm:w-[390px] lg:h-[500px] lg:w-[500px]" />

                <div className="relative z-10 w-full max-w-[500px] lg:max-w-[630px]">
                  <Image
                    src="/hero-product.png"
                    alt="PrimeCart products"
                    width={900}
                    height={900}
                    priority
                    className="h-auto w-full object-contain drop-shadow-[0_30px_35px_rgba(55,42,16,0.14)] transition duration-700 hover:scale-[1.025]"
                  />
                </div>

                {/* OFFER FLOAT */}

                <div className="absolute left-4 top-5 z-20 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur-md sm:left-7 sm:top-8">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#171614] text-[#e1bd68]">
                      <Sparkles size={17} />
                    </div>

                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                        Today only
                      </p>
                      <p className="text-xs font-extrabold text-gray-900">
                        Special Deals
                      </p>
                    </div>
                  </div>
                </div>

                {/* DELIVERY FLOAT */}

                <div className="absolute bottom-5 right-4 z-20 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur-md sm:bottom-9 sm:right-7">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff3d4] text-[#b17e24]">
                      <Truck size={17} />
                    </div>

                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                        Delivery
                      </p>
                      <p className="text-xs font-extrabold text-gray-900">
                        Fast & Reliable
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          QUICK STATS
      ========================================================= */}

      <section className="mx-auto max-w-[1300px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[24px] border border-[#e9e2d5] bg-white shadow-[0_8px_30px_rgba(70,50,15,0.045)] sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["10K+", "Happy Customers"],
            ["8K+", "Products"],
            ["50+", "Trusted Brands"],
            ["24/7", "Customer Support"],
          ].map(([number, label], index) => (
            <div
              key={label}
              className={`flex items-center justify-center gap-3 px-4 py-5 sm:py-6 ${
                index !== 3
                  ? "border-b border-[#eee8dc] lg:border-b-0 lg:border-r"
                  : ""
              }`}
            >
              <div className="text-2xl font-extrabold tracking-tight text-[#b17e24] sm:text-3xl">
                {number}
              </div>

              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          CATEGORIES
      ========================================================= */}

      <section
        id="categories"
        className="mx-auto max-w-[1300px] scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="flex items-end justify-between gap-5">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b17e24] sm:text-xs">
              <span className="h-px w-7 bg-[#c79a3b]" />
              Explore Collections
            </div>

            <h2 className="text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
              Shop by Category
            </h2>

            <p className="mt-2 max-w-xl text-sm text-gray-500">
              Explore everything from everyday essentials to premium finds.
            </p>
          </div>

          <Link
            href="/auth/login"
            className="hidden items-center gap-2 text-xs font-bold text-[#a87520] sm:flex"
          >
            View all
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group overflow-hidden rounded-[22px] border border-[#ebe4d8] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#dbc07e] hover:shadow-[0_18px_35px_rgba(73,53,17,0.1)]"
            >
              <div className="relative flex h-[135px] items-center justify-center bg-[#faf7ef] sm:h-[155px]">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={240}
                  height={180}
                  className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-110"
                />

                <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[7px] font-bold uppercase tracking-wider text-[#b17e24] opacity-0 shadow-sm transition group-hover:opacity-100">
                  Explore
                </span>
              </div>

              <div className="p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-bold text-gray-900">
                    {category.name}
                  </h3>

                  <ChevronRight
                    size={14}
                    className="shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#b17e24]"
                  />
                </div>

                <p className="mt-1 text-[10px] font-medium text-gray-400">
                  {category.products}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================
          TRENDING PRODUCTS
      ========================================================= */}

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b17e24] sm:text-xs">
                <Sparkles size={14} />
                Trending now
              </div>

              <h2 className="text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
                Popular right now
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Discover products shoppers are loving.
              </p>
            </div>

            <Link
              href="/auth/login"
              className="hidden items-center gap-2 text-xs font-bold text-[#a87520] sm:flex"
            >
              Shop all
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              {
                name: "Premium Collection",
                label: "Editor's Pick",
              },
              {
                name: "Smart Essentials",
                label: "Trending",
              },
              {
                name: "Everyday Favorites",
                label: "Popular",
              },
              {
                name: "Premium Finds",
                label: "Top Rated",
              },
            ].map((product) => (
              <Link
                key={product.name}
                href="/auth/login"
                className="group relative overflow-hidden rounded-[24px] border border-[#ebe5da] bg-[#faf8f3] p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(71,51,15,0.09)]"
              >
                <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-[18px] bg-white sm:h-[220px]">
                  <Image
                    src="/hero-product.png"
                    alt={product.name}
                    width={350}
                    height={350}
                    className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-3 top-3 rounded-full bg-[#171614] px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-white">
                    {product.label}
                  </span>

                  <button
                    type="button"
                    aria-label="Add to wishlist"
                    onClick={(e) => e.preventDefault()}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
                  >
                    <Heart size={14} className="text-gray-500" />
                  </button>
                </div>

                <div className="px-1 pb-1 pt-4">
                  <div className="flex items-center gap-1">
                    <Star
                      size={11}
                      fill="#c79a3b"
                      className="text-[#c79a3b]"
                    />
                    <span className="text-[10px] font-bold">4.8</span>
                  </div>

                  <h3 className="mt-1.5 truncate text-sm font-bold text-gray-900">
                    {product.name}
                  </h3>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">
                      Explore collection
                    </span>

                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fff3d5] text-[#b17e24] transition group-hover:bg-[#c79a3b] group-hover:text-white">
                      <ArrowUpRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          DEALS
      ========================================================= */}

      <section
        id="deals"
        className="scroll-mt-24 bg-[#fcfaf6] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b17e24] sm:text-xs">
                <Zap size={14} />
                Limited offers
              </div>

              <h2 className="text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
                Deals worth checking
              </h2>
            </div>

            <Link
              href="/auth/login"
              className="hidden items-center gap-2 text-xs font-bold text-[#a87520] sm:flex"
            >
              See all deals
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {deals.map((deal, index) => (
              <Link
                href="/login"
                key={deal.title}
                className={`group relative min-h-[245px] overflow-hidden rounded-[28px] p-7 transition duration-300 hover:-translate-y-1 ${
                  index === 1
                    ? "bg-[#efe1bf]"
                    : index === 2
                    ? "bg-[#ebe7de]"
                    : "bg-[#e9dfc7]"
                }`}
              >
                <div className="absolute -bottom-20 -right-12 h-52 w-52 rounded-full border-[35px] border-white/25 transition duration-500 group-hover:scale-110" />

                <div className="relative z-10">
                  <span className="inline-flex rounded-full bg-white/70 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#9d7127]">
                    Limited Time
                  </span>

                  <h3 className="mt-6 text-2xl font-extrabold tracking-[-0.035em]">
                    {deal.title}
                  </h3>

                  <p className="mt-2 max-w-[240px] text-sm leading-6 text-gray-600">
                    {deal.text}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-[#a87520]">
                      {deal.discount}
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#171614] text-white transition group-hover:rotate-45">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          BIG PROMO
      ========================================================= */}

      <section className="mx-auto max-w-[1300px] px-4 py-2 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[30px] bg-[#171614] px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
          <div className="absolute right-[-80px] top-[-120px] h-[350px] w-[350px] rounded-full border-[55px] border-[#c79a3b]/10" />
          <div className="absolute bottom-[-150px] left-[40%] h-[350px] w-[350px] rounded-full bg-[#c79a3b]/5 blur-3xl" />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#dfbc6d]">
                <Sparkles size={14} />
                PrimeCart Exclusive
              </div>

              <h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                Your wishlist deserves
                <span className="text-[#d7b360]"> better prices.</span>
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                Find quality products, discover special offers and make every
                purchase feel worth it.
              </p>
            </div>

            <Link
              href="/auth/login"
              className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c79a3b] px-6 text-sm font-bold text-white transition hover:bg-[#d4ac50]"
            >
              Explore PrimeCart
              <ArrowRight
                size={17}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          LIFESTYLE
      ========================================================= */}

      <section className="mx-auto max-w-[1300px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b17e24] sm:text-xs">
            Curated for you
          </div>

          <h2 className="text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
            Shop by lifestyle
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            Explore collections built around the way you live, work and play.
          </p>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {lifestyle.map((item, index) => (
            <Link
              href="/auth/login"
              key={item.title}
              className="group relative min-h-[250px] overflow-hidden rounded-[28px] border border-[#e8e0d1] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(69,50,14,0.08)]"
            >
              <div
                className={`absolute bottom-[-80px] right-[-70px] h-64 w-64 rounded-full ${
                  index === 0
                    ? "bg-[#eee1c1]"
                    : index === 1
                    ? "bg-[#e5dfd1]"
                    : "bg-[#f0dfb7]"
                } transition duration-500 group-hover:scale-110`}
              />

              <div className="relative z-10">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#b17e24]">
                  PrimeCart Collection
                </span>

                <h3 className="mt-5 text-2xl font-extrabold tracking-[-0.035em]">
                  {item.title}
                </h3>

                <p className="mt-2 max-w-[220px] text-sm leading-6 text-gray-500">
                  {item.text}
                </p>

                <div className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-[#a87520]">
                  {item.tag}
                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================
          WHY PRIMECART
      ========================================================= */}

      <section
        id="why"
        className="scroll-mt-24 bg-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b17e24] sm:text-xs">
                <BadgeCheck size={14} />
                Why PrimeCart
              </div>

              <h2 className="text-3xl font-extrabold leading-tight tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                A better way to
                <span className="text-[#c79a3b]"> shop online.</span>
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-7 text-gray-500 sm:text-base">
                Everything you need for a smooth shopping experience — from
                discovery and deals to secure checkout and reliable delivery.
              </p>

              <Link
                href="/auth/login"
                className="group mt-7 inline-flex items-center gap-2 rounded-xl border border-[#ddd6c9] px-5 py-3 text-sm font-bold transition hover:border-[#c79a3b] hover:text-[#b17e24]"
              >
                Discover PrimeCart
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="group rounded-[24px] border border-[#ebe5da] bg-[#fcfaf6] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#dcc184] hover:bg-white hover:shadow-[0_15px_30px_rgba(72,52,15,0.07)]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff3d6] text-[#b17e24] transition group-hover:scale-105">
                      <Icon size={20} />
                    </div>

                    <h3 className="mt-5 text-sm font-extrabold">
                      {benefit.title}
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-gray-500">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          NEWSLETTER
      ========================================================= */}

      <section className="mx-auto max-w-[1300px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[30px] bg-[#f0e4c7] px-6 py-9 sm:px-10 sm:py-11 lg:px-14">
          <div className="absolute right-[-80px] top-[-120px] h-72 w-72 rounded-full bg-white/30 blur-3xl" />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#a87520]">
                <Mail size={14} />
                Stay in the loop
              </div>

              <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.035em] sm:text-3xl">
                Get the best deals before everyone else.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
                Subscribe for new arrivals, exclusive offers and PrimeCart
                updates.
              </p>
            </div>

            <div>
              {subscribed ? (
                <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-white/80 px-5 py-4 text-sm font-bold text-green-700">
                  <BadgeCheck size={20} />
                  You're subscribed!
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col gap-2 rounded-2xl bg-white/70 p-2 sm:flex-row"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="h-12 min-w-0 flex-1 rounded-xl bg-transparent px-4 text-sm outline-none placeholder:text-gray-400"
                  />

                  <button
                    type="submit"
                    className="h-12 rounded-xl bg-[#171614] px-6 text-sm font-bold text-white transition hover:bg-[#2c2925]"
                  >
                    Subscribe
                  </button>
                </form>
              )}

              <p className="mt-2 px-1 text-[9px] text-gray-500">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="border-t border-[#e9e2d7] bg-white">
        <div className="mx-auto max-w-[1300px] px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
            {/* BRAND */}

            <div>
              <Link href="/" className="flex w-fit items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="PrimeCart"
                  width={52}
                  height={52}
                  className="object-contain"
                />

                <div>
                  <h2 className="text-2xl font-extrabold tracking-[-0.04em]">
                    Prime<span className="text-[#c79a3b]">Cart</span>
                  </h2>

                  <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    Premium Shopping
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-7 text-gray-500">
                Your destination for quality products, better prices and a
                shopping experience made around you.
              </p>

              <div className="mt-5 flex gap-2">
                {[Instagram, Facebook, Twitter].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e1d5] text-gray-500 transition hover:border-[#c79a3b] hover:bg-[#fff9ed] hover:text-[#b17e24]"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {/* SHOP */}

            <div>
              <h3 className="text-sm font-extrabold">Shop</h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-gray-500">
                <Link href="#categories" className="hover:text-[#b17e24]">
                  Categories
                </Link>

                <Link href="#deals" className="hover:text-[#b17e24]">
                  Deals
                </Link>

                <Link href="/auth/login" className="hover:text-[#b17e24]">
                  Products
                </Link>

                <Link href="/auth/login" className="hover:text-[#b17e24]">
                  Wishlist
                </Link>
              </div>
            </div>

            {/* SUPPORT */}

            <div>
              <h3 className="text-sm font-extrabold">Support</h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-gray-500">
                <Link href="/auth/login" className="hover:text-[#b17e24]">
                  Contact Us
                </Link>

                <Link href="/auth/login" className="hover:text-[#b17e24]">
                  Shipping
                </Link>

                <Link href="/auth/login" className="hover:text-[#b17e24]">
                  Returns
                </Link>

                <Link href="/auth/login" className="hover:text-[#b17e24]">
                  Privacy
                </Link>
              </div>
            </div>

            {/* SERVICE */}

            <div>
              <h3 className="text-sm font-extrabold">PrimeCart Promise</h3>

              <div className="mt-5 space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff4dc] text-[#b17e24]">
                    <ShieldCheck size={16} />
                  </div>

                  <div>
                    <p className="text-xs font-bold">Secure Shopping</p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Protected checkout
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff4dc] text-[#b17e24]">
                    <Headphones size={16} />
                  </div>

                  <div>
                    <p className="text-xs font-bold">24/7 Support</p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      We're here to help
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-[#eee8dc] pt-6 text-[10px] text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 PrimeCart. All Rights Reserved.</p>

            <div className="flex flex-wrap gap-4">
              <span>Secure Payments</span>
              <span>•</span>
              <span>Easy Returns</span>
              <span>•</span>
              <span>Quality Products</span>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================
          MOBILE BOTTOM NAV
      ========================================================= */}

      <div className="fixed bottom-3 left-3 right-3 z-50 flex items-center justify-around rounded-2xl border border-[#e2d8c4] bg-white/95 p-1.5 shadow-[0_15px_40px_rgba(45,33,13,0.15)] backdrop-blur-xl md:hidden">
        <Link
          href="#home"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[#b17e24]"
        >
          <ShoppingBag size={17} />
          <span className="text-[8px] font-bold">Home</span>
        </Link>

        <Link
          href="#categories"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-gray-500"
        >
          <Search size={17} />
          <span className="text-[8px] font-bold">Explore</span>
        </Link>

        <Link
          href="/auth/login"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-gray-500"
        >
          <Heart size={17} />
          <span className="text-[8px] font-bold">Wishlist</span>
        </Link>

        <Link
          href="/auth/login"
          className="relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-gray-500"
        >
          <ShoppingCart size={17} />
          <span className="text-[8px] font-bold">Cart</span>
          <span className="absolute right-3 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#c79a3b] px-1 text-[7px] font-bold text-white">
            0
          </span>
        </Link>

        <Link
          href="/auth/login"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-gray-500"
        >
          <UserRound size={17} />
          <span className="text-[8px] font-bold">Account</span>
        </Link>
      </div>

      {/* Bottom spacing for mobile fixed nav */}

      <div className="h-20 md:hidden" />
    </main>
  );
}
