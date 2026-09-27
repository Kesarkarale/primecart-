"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  Clock3,
  Facebook,
  Headphones,
  Heart,
  Instagram,
  Mail,
  MapPin,
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
    products: "2500+ Products",
    image: "/products/electronics.png",
    href: "/categories/electronics",
    accent: "Smart Tech",
  },
  {
    name: "Fashion",
    products: "1800+ Products",
    image: "/products/fashion.png",
    href: "/categories/fashion",
    accent: "New Styles",
  },
  {
    name: "Watches",
    products: "1200+ Products",
    image: "/products/watch.png",
    href: "/categories/watches",
    accent: "Premium Time",
  },
  {
    name: "Beauty",
    products: "800+ Products",
    image: "/products/perfume23.png",
    href: "/categories/beauty",
    accent: "Self Care",
  },
  {
    name: "Home & Living",
    products: "1500+ Products",
    image: "/products/home.png",
    href: "/categories/home-and-living",
    accent: "Live Better",
  },
  {
    name: "Gaming",
    products: "950+ Products",
    image: "/products/gaming.png",
    href: "/categories/gaming",
    accent: "Level Up",
  },
];

const benefits = [
  {
    icon: Truck,
    title: "Fast & Reliable Delivery",
    description: "Get your orders delivered safely and on time.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Your payment and personal information stay protected.",
  },
  {
    icon: BadgeCheck,
    title: "Quality Products",
    description: "Shop from carefully selected products and brands.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "We're here whenever you need help with your order.",
  },
];

const stats = [
  { value: "10K+", label: "Happy Customers" },
  { value: "8K+", label: "Products" },
  { value: "50+", label: "Top Brands" },
  { value: "24/7", label: "Support" },
];

export default function HomePage() {
  const [openMenu, setOpenMenu] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fcfaf5] text-[#171614]">
      {/* =========================================================
          TOP ANNOUNCEMENT BAR
      ========================================================= */}

      <div className="bg-[#171614] px-4 py-2.5 text-center text-[11px] font-medium tracking-wide text-white sm:text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
          <Sparkles size={13} className="text-[#e1bb62]" />
          <span>
            Premium shopping made simple — Free delivery on orders above ₹499
          </span>
          <Sparkles size={13} className="text-[#e1bb62]" />
        </div>
      </div>

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <nav className="sticky top-0 z-50 border-b border-[#ebe4d5] bg-white/95 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20">
          {/* LOGO */}

          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 sm:gap-3"
            onClick={() => setOpenMenu(false)}
          >
            <div className="relative flex h-11 w-11 items-center justify-center sm:h-12 sm:w-12">
              <Image
                src="/logo.png"
                alt="PrimeCart Logo"
                width={55}
                height={55}
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>

            <div className="leading-none">
              <div className="text-[20px] font-extrabold tracking-tight sm:text-[23px]">
                Prime<span className="text-[#c79a3b]">Cart</span>
              </div>

              <div className="mt-1 hidden text-[9px] font-medium uppercase tracking-[0.22em] text-gray-400 sm:block">
                Premium Shopping
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV */}

          <div className="hidden items-center gap-7 lg:flex xl:gap-9">
            <Link
              href="#home"
              className="text-sm font-semibold text-[#c08d2d] transition hover:text-[#a87520]"
            >
              Home
            </Link>

            <Link
              href="#categories"
              className="text-sm font-medium text-gray-600 transition hover:text-[#c08d2d]"
            >
              Shop
            </Link>

            <Link
              href="#categories"
              className="text-sm font-medium text-gray-600 transition hover:text-[#c08d2d]"
            >
              Categories
            </Link>

            <Link
              href="#deals"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-[#c08d2d]"
            >
              Deals
              <span className="rounded-full bg-[#fff2cf] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#a87520]">
                Hot
              </span>
            </Link>

            <Link
              href="#why-primecart"
              className="text-sm font-medium text-gray-600 transition hover:text-[#c08d2d]"
            >
              Why Us
            </Link>
          </div>

          {/* RIGHT ACTIONS */}

          <div className="flex items-center gap-2 sm:gap-2.5">
            <Link
              href="/login"
              aria-label="Search"
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#eee7d9] bg-[#faf8f3] text-gray-600 transition hover:border-[#d8bb78] hover:bg-[#fffaf0] hover:text-[#b17e24] sm:flex"
            >
              <Search size={18} />
            </Link>

            <Link
              href="/login"
              aria-label="Wishlist"
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#eee7d9] bg-[#faf8f3] text-gray-600 transition hover:border-[#d8bb78] hover:bg-[#fffaf0] hover:text-[#b17e24] md:flex"
            >
              <Heart size={18} />
            </Link>

            <Link
              href="/login"
              aria-label="Shopping Cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#eee7d9] bg-[#faf8f3] text-gray-600 transition hover:border-[#d8bb78] hover:bg-[#fffaf0] hover:text-[#b17e24]"
            >
              <ShoppingCart size={18} />

              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c79a3b] px-1 text-[8px] font-bold text-white">
                0
              </span>
            </Link>

            <Link
              href="/login"
              className="hidden h-10 items-center gap-2 rounded-xl border border-[#ded8cc] px-4 text-sm font-semibold text-gray-700 transition hover:border-[#c79a3b] hover:text-[#b17e24] md:flex"
            >
              <UserRound size={16} />
              Login
            </Link>

            <Link
              href="/register"
              className="hidden h-10 items-center justify-center rounded-xl bg-[#c79a3b] px-5 text-sm font-bold text-white shadow-[0_7px_18px_rgba(199,154,59,0.2)] transition hover:-translate-y-0.5 hover:bg-[#b8872d] hover:shadow-[0_10px_24px_rgba(199,154,59,0.28)] md:flex"
            >
              Register
            </Link>

            <button
              type="button"
              aria-label={openMenu ? "Close menu" : "Open menu"}
              onClick={() => setOpenMenu(!openMenu)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eee7d9] bg-[#faf8f3] text-gray-700 transition hover:border-[#d8bb78] hover:text-[#b17e24] lg:hidden"
            >
              {openMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}

        {openMenu && (
          <div className="border-t border-[#eee7d9] bg-white px-4 pb-5 pt-4 shadow-lg lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {[
                ["Home", "#home"],
                ["Shop", "#categories"],
                ["Categories", "#categories"],
                ["Deals", "#deals"],
                ["Why PrimeCart", "#why-primecart"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpenMenu(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-[#faf7ef] hover:text-[#b17e24]"
                >
                  {label}
                  <ChevronRight size={16} />
                </Link>
              ))}

              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#eee7d9] pt-4">
                <Link
                  href="/login"
                  onClick={() => setOpenMenu(false)}
                  className="flex h-11 items-center justify-center rounded-xl border border-[#ddd7ca] text-sm font-semibold"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setOpenMenu(false)}
                  className="flex h-11 items-center justify-center rounded-xl bg-[#c79a3b] text-sm font-bold text-white"
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

      <section id="home" className="relative overflow-hidden">
        {/* Decorative background */}

        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#ecd9a9]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#e5c77d]/15 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8 lg:pb-16 lg:pt-10">
          <div className="relative overflow-hidden rounded-[28px] border border-[#e9dfcb] bg-white shadow-[0_18px_60px_rgba(74,56,22,0.08)] sm:rounded-[36px] lg:rounded-[42px]">
            {/* inner glow */}

            <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(213,177,92,0.16),transparent_65%)]" />

            <div className="grid min-h-[590px] items-center lg:grid-cols-[0.93fr_1.07fr]">
              {/* HERO CONTENT */}

              <div className="relative z-10 px-6 pb-4 pt-9 sm:px-10 sm:pt-12 lg:px-14 lg:py-14 xl:px-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e5c982] bg-[#fffaf0] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#ad7a20] sm:px-4 sm:text-xs">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c79a3b] text-white">
                    <Zap size={11} fill="currentColor" />
                  </span>
                  Super Sale is Live
                </div>

                <h1 className="mt-6 max-w-[650px] text-[43px] font-extrabold leading-[0.98] tracking-[-0.045em] text-[#171614] sm:text-[57px] lg:mt-8 lg:text-[70px] xl:text-[78px]">
                  Shop More.
                  <br />
                  <span className="relative inline-block text-[#c79a3b]">
                    Pay Less.
                    <span className="absolute -bottom-2 left-0 h-1 w-2/3 rounded-full bg-[#ead39b]" />
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-[15px] leading-7 text-gray-600 sm:text-lg sm:leading-8">
                  Discover products you love, explore exclusive deals, and
                  enjoy a premium shopping experience designed around you.
                </p>

                {/* CTA */}

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/login"
                    className="group inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#c79a3b] px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(199,154,59,0.24)] transition hover:-translate-y-1 hover:bg-[#b8872d] hover:shadow-[0_14px_30px_rgba(199,154,59,0.3)]"
                  >
                    Shop Now
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>

                  <Link
                    href="#deals"
                    className="group inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-[#ded7c9] bg-white px-7 py-3.5 text-sm font-bold text-gray-800 transition hover:-translate-y-1 hover:border-[#c79a3b] hover:bg-[#fffaf0]"
                  >
                    Explore Deals
                    <ArrowUpRight
                      size={17}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>

                {/* TRUST */}

                <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-[#eee7db] pt-7">
                  <div className="flex items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#e7d8b6] text-xs font-bold shadow-sm">
                      K
                    </div>
                    <div className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#d5c29b] text-xs font-bold shadow-sm">
                      A
                    </div>
                    <div className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#bda77a] text-xs font-bold shadow-sm">
                      R
                    </div>
                    <div className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#171614] text-[10px] font-bold text-white shadow-sm">
                      +
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <Star
                          key={item}
                          size={13}
                          fill="#c79a3b"
                          className="text-[#c79a3b]"
                        />
                      ))}
                      <span className="ml-1 text-xs font-bold text-gray-800">
                        4.9/5
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      Loved by <span className="font-bold text-[#b17e24]">10,000+</span>{" "}
                      shoppers
                    </p>
                  </div>
                </div>
              </div>

              {/* HERO IMAGE */}

              <div className="relative flex min-h-[330px] items-center justify-center px-5 pb-8 sm:min-h-[430px] sm:px-8 lg:min-h-[590px] lg:px-2 lg:pb-0">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e9d49f]/25 blur-3xl sm:h-[390px] sm:w-[390px] lg:h-[500px] lg:w-[500px]" />

                <div className="relative z-10 w-full max-w-[430px] sm:max-w-[540px] lg:max-w-[650px]">
                  <Image
                    src="/hero-product.png"
                    alt="PrimeCart premium products"
                    width={900}
                    height={900}
                    priority
                    className="h-auto w-full object-contain drop-shadow-[0_25px_35px_rgba(56,43,18,0.12)] transition-transform duration-700 hover:scale-[1.025]"
                  />
                </div>

                {/* Floating badge */}

                <div className="absolute bottom-8 left-4 z-20 hidden rounded-2xl border border-white/70 bg-white/90 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.1)] backdrop-blur-md sm:block lg:bottom-12 lg:left-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4d8] text-[#b17e24]">
                      <PackageCheck size={20} />
                    </div>

                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                        Shopping made easy
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-gray-800">
                        Delivered with care
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute right-4 top-8 z-20 hidden rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.1)] backdrop-blur-md sm:block lg:right-8 lg:top-16">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
                    <span className="text-xs font-bold text-gray-700">
                      Fresh deals daily
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          STATS
      ========================================================= */}

      <section className="mx-auto max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-[#e9e2d5] bg-white shadow-[0_8px_35px_rgba(75,56,20,0.05)] sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex items-center justify-center gap-4 px-5 py-6 text-center sm:py-7 ${
                index !== stats.length - 1
                  ? "border-b border-[#eee8dc] sm:border-r lg:border-b-0"
                  : ""
              } ${
                index === 1
                  ? "sm:border-b-0 lg:border-b-0"
                  : ""
              }`}
            >
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-[#b17e24] sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500 sm:text-xs">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          CATEGORY SECTION
      ========================================================= */}

      <section
        id="categories"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#b17e24]">
              <span className="h-px w-7 bg-[#c79a3b]" />
              Explore Collection
            </div>

            <h2 className="text-3xl font-extrabold tracking-[-0.035em] text-[#171614] sm:text-4xl lg:text-5xl">
              Shop by Category
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              Find exactly what you need from our carefully organised
              collections.
            </p>
          </div>

          <Link
            href="/login"
            className="group inline-flex items-center gap-2 self-start rounded-xl border border-[#ded7c9] bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-[#c79a3b] hover:text-[#b17e24] sm:self-auto"
          >
            View All
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group overflow-hidden rounded-[22px] border border-[#ebe5d9] bg-white shadow-[0_5px_20px_rgba(67,51,20,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#ddc184] hover:shadow-[0_16px_35px_rgba(87,62,17,0.1)]"
            >
              <div className="relative flex h-[145px] items-center justify-center overflow-hidden bg-[#faf7ef] sm:h-[165px]">
                <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-[#b17e24] opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100">
                  Explore
                </div>

                <Image
                  src={category.image}
                  alt={category.name}
                  width={260}
                  height={180}
                  className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="p-3.5 sm:p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-bold text-gray-900 sm:text-[15px]">
                    {category.name}
                  </h3>

                  <ChevronRight
                    size={15}
                    className="shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#c79a3b]"
                  />
                </div>

                <p className="text-[10px] font-medium text-[#b17e24] sm:text-[11px]">
                  {category.accent}
                </p>

                <p className="mt-1 text-[10px] text-gray-400 sm:text-[11px]">
                  {category.products}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================
          DEAL BANNER
      ========================================================= */}

      <section id="deals" className="scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[30px] bg-[#1b1916] px-6 py-9 shadow-[0_20px_55px_rgba(27,25,22,0.12)] sm:px-10 sm:py-11 lg:px-14 lg:py-12">
            {/* decorative circles */}

            <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full border-[45px] border-[#c79a3b]/10" />
            <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#c79a3b]/5 blur-2xl" />

            <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#c79a3b]/30 bg-[#c79a3b]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#e5c77d]">
                  <Zap size={12} fill="currentColor" />
                  Limited Time
                </div>

                <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
                  Big deals.
                  <span className="text-[#d8b45f]"> Bigger savings.</span>
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                  Don't miss exclusive offers across electronics, fashion,
                  beauty, gaming and more.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <Clock3 className="text-[#d8b45f]" size={22} />

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-500">
                      Deals
                    </p>
                    <p className="text-sm font-bold text-white">
                      Updated Daily
                    </p>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="group flex items-center justify-center gap-2 rounded-2xl bg-[#c79a3b] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#d2a94e]"
                >
                  Shop Deals
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY PRIMECART
      ========================================================= */}

      <section
        id="why-primecart"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#b17e24]">
            <Sparkles size={14} />
            The PrimeCart Difference
          </div>

          <h2 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl lg:text-5xl">
            Shopping that feels{" "}
            <span className="text-[#c79a3b]">better.</span>
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            From discovery to delivery, PrimeCart is designed to make online
            shopping simple, secure and enjoyable.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="group rounded-[24px] border border-[#ebe5d9] bg-white p-6 shadow-[0_5px_22px_rgba(70,51,15,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ddc184] hover:shadow-[0_16px_35px_rgba(87,62,17,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff5dc] text-[#b17e24] transition-transform duration-300 group-hover:scale-105">
                  <Icon size={22} />
                </div>

                <h3 className="mt-5 text-base font-bold text-gray-900">
                  {benefit.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          PRIME CART EXPERIENCE
      ========================================================= */}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="grid overflow-hidden rounded-[30px] border border-[#e8dfce] bg-[#fffdf8] lg:grid-cols-[1.05fr_0.95fr]">
          {/* LEFT */}

          <div className="p-7 sm:p-10 lg:p-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f8eed5] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ad7a20]">
              <ShoppingBag size={13} />
              More than shopping
            </div>

            <h2 className="mt-5 max-w-xl text-3xl font-extrabold leading-tight tracking-[-0.035em] sm:text-4xl">
              Discover your next{" "}
              <span className="text-[#c79a3b]">favorite find.</span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
              Explore handpicked categories, exciting deals and products
              selected to give you more value every time you shop.
            </p>

            <div className="mt-7 space-y-4">
              {[
                "Curated products across everyday categories",
                "Easy browsing with organised collections",
                "Secure checkout and reliable delivery",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c79a3b] text-white">
                    <BadgeCheck size={13} />
                  </div>

                  <span className="text-sm font-medium text-gray-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/login"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-[#171614] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2c2924]"
            >
              Start Shopping
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* RIGHT VISUAL */}

          <div className="relative flex min-h-[330px] items-center justify-center overflow-hidden bg-[#f6f0e3] p-6 sm:min-h-[400px] lg:min-h-full">
            <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d9c18a]/40 sm:h-[340px] sm:w-[340px]" />

            <div className="absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e7d29c]/30 blur-xl sm:h-[250px] sm:w-[250px]" />

            <div className="relative z-10 w-full max-w-[400px]">
              <Image
                src="/hero-product.png"
                alt="PrimeCart shopping collection"
                width={700}
                height={700}
                className="h-auto w-full object-contain drop-shadow-[0_22px_30px_rgba(51,40,17,0.16)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          NEWSLETTER
      ========================================================= */}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="relative overflow-hidden rounded-[30px] bg-[#f0e5cc] px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/35 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#a87520]">
                <Mail size={14} />
                PrimeCart Updates
              </div>

              <h2 className="text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
                Get the best deals in your inbox.
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Be the first to know about new arrivals, exclusive offers and
                special PrimeCart drops.
              </p>
            </div>

            <div className="w-full max-w-xl">
              {subscribed ? (
                <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-white/80 px-5 py-4 text-sm font-semibold text-green-700">
                  <BadgeCheck size={20} />
                  You're subscribed to PrimeCart updates!
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col gap-2 rounded-2xl bg-white/70 p-2 backdrop-blur sm:flex-row"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="h-12 min-w-0 flex-1 rounded-xl border border-transparent bg-transparent px-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#d9c184]"
                  />

                  <button
                    type="submit"
                    className="h-12 shrink-0 rounded-xl bg-[#171614] px-6 text-sm font-bold text-white transition hover:bg-[#2b2824]"
                  >
                    Subscribe
                  </button>
                </form>
              )}

              <p className="mt-2 px-1 text-[10px] text-gray-500">
                No spam. Just useful offers and PrimeCart updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="border-t border-[#e8e1d5] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.1fr]">
            {/* BRAND */}

            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="PrimeCart Logo"
                  width={52}
                  height={52}
                  className="object-contain"
                />

                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    Prime<span className="text-[#c79a3b]">Cart</span>
                  </h2>

                  <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                    Premium Shopping
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-7 text-gray-500">
                Your destination for quality products, exciting deals and a
                simple premium shopping experience.
              </p>

              <div className="mt-5 flex items-center gap-2">
                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ebe5d9] text-gray-500 transition hover:border-[#c79a3b] hover:bg-[#fffaf0] hover:text-[#b17e24]"
                >
                  <Instagram size={16} />
                </a>

                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ebe5d9] text-gray-500 transition hover:border-[#c79a3b] hover:bg-[#fffaf0] hover:text-[#b17e24]"
                >
                  <Facebook size={16} />
                </a>

                <a
                  href="#"
                  aria-label="Twitter"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ebe5d9] text-gray-500 transition hover:border-[#c79a3b] hover:bg-[#fffaf0] hover:text-[#b17e24]"
                >
                  <Twitter size={16} />
                </a>
              </div>
            </div>

            {/* SHOP */}

            <div>
              <h3 className="text-sm font-extrabold text-gray-900">
                Shop
              </h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-gray-500">
                <Link
                  href="#categories"
                  className="transition hover:text-[#b17e24]"
                >
                  Categories
                </Link>

                <Link
                  href="#deals"
                  className="transition hover:text-[#b17e24]"
                >
                  Deals
                </Link>

                <Link
                  href="/login"
                  className="transition hover:text-[#b17e24]"
                >
                  Products
                </Link>

                <Link
                  href="/login"
                  className="transition hover:text-[#b17e24]"
                >
                  Wishlist
                </Link>
              </div>
            </div>

            {/* CUSTOMER */}

            <div>
              <h3 className="text-sm font-extrabold text-gray-900">
                Customer Care
              </h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-gray-500">
                <Link
                  href="/login"
                  className="transition hover:text-[#b17e24]"
                >
                  Contact Us
                </Link>

                <Link
                  href="/login"
                  className="transition hover:text-[#b17e24]"
                >
                  Shipping Policy
                </Link>

                <Link
                  href="/login"
                  className="transition hover:text-[#b17e24]"
                >
                  Returns & Refunds
                </Link>

                <Link
                  href="/login"
                  className="transition hover:text-[#b17e24]"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* CONTACT */}

            <div>
              <h3 className="text-sm font-extrabold text-gray-900">
                Need Help?
              </h3>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff5df] text-[#b17e24]">
                    <Headphones size={16} />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">
                      Support
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-700">
                      Available 24/7
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff5df] text-[#b17e24]">
                    <MapPin size={16} />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">
                      Delivery
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-700">
                      Across India
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER BOTTOM */}

          <div className="mt-10 flex flex-col gap-3 border-t border-[#eee8dc] pt-6 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 PrimeCart. All Rights Reserved.</p>

            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} />
                Secure Shopping
              </span>

              <span className="flex items-center gap-1.5">
                <PackageCheck size={13} />
                Quality Assured
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================
          MOBILE BOTTOM ACTION BAR
      ========================================================= */}

      <div className="fixed bottom-3 left-3 right-3 z-40 flex items-center justify-around rounded-2xl border border-[#e4dac5] bg-white/95 p-2 shadow-[0_12px_35px_rgba(42,32,14,0.14)] backdrop-blur-xl md:hidden">
        <Link
          href="#home"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[#b17e24]"
        >
          <ShoppingBag size={18} />
          <span className="text-[9px] font-bold">Home</span>
        </Link>

        <Link
          href="#categories"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-gray-500 transition hover:bg-[#faf7ef] hover:text-[#b17e24]"
        >
          <Search size={18} />
          <span className="text-[9px] font-bold">Explore</span>
        </Link>

        <Link
          href="/login"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-gray-500 transition hover:bg-[#faf7ef] hover:text-[#b17e24]"
        >
          <Heart size={18} />
          <span className="text-[9px] font-bold">Wishlist</span>
        </Link>

        <Link
          href="/login"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-gray-500 transition hover:bg-[#faf7ef] hover:text-[#b17e24]"
        >
          <ShoppingCart size={18} />
          <span className="text-[9px] font-bold">Cart</span>
        </Link>

        <Link
          href="/login"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-gray-500 transition hover:bg-[#faf7ef] hover:text-[#b17e24]"
        >
          <UserRound size={18} />
          <span className="text-[9px] font-bold">Account</span>
        </Link>
      </div>
    </main>
  );
}
