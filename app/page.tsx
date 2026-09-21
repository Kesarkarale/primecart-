"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  ChevronRight,
  Gift,
  Heart,
  Layers3,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Target,
  Trophy,
  Truck,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

const categories = [
  { name: "Mobile", icon: "📱", count: "Smartphones & accessories" },
  { name: "Home & Living", icon: "🏠", count: "Make your space better" },
  { name: "Appliance", icon: "⚡", count: "Everyday essentials" },
  { name: "Footwear", icon: "👟", count: "Style meets comfort" },
  { name: "Watch", icon: "⌚", count: "Time in your style" },
  { name: "Bag", icon: "👜", count: "Carry it your way" },
  { name: "Toy & Baby", icon: "🧸", count: "For little moments" },
  { name: "Automotive", icon: "🚗", count: "Drive better" },
  { name: "Fashion", icon: "👕", count: "Your everyday style" },
  { name: "Gaming", icon: "🎮", count: "Level up your setup" },
];

const features = [
  {
    icon: Brain,
    title: "PrimeMatch",
    text: "Tell us what you need, your budget and priorities. PrimeCart helps you discover products that actually fit.",
    tag: "Smart Discovery",
  },
  {
    icon: Target,
    title: "Budget Builder",
    text: "Set your spending limit and build a useful shopping list without losing control of your budget.",
    tag: "Budget Smart",
  },
  {
    icon: Layers3,
    title: "Build My Setup",
    text: "Create complete setups for gaming, college, work, fitness, home and more.",
    tag: "Complete Setup",
  },
  {
    icon: Trophy,
    title: "PrimePoints",
    text: "Shop, explore and engage with PrimeCart to collect points and unlock rewards.",
    tag: "Rewards",
  },
  {
    icon: Gift,
    title: "Mystery Deal",
    text: "Open surprise offers and discover deals selected for PrimeCart shoppers.",
    tag: "Surprise",
  },
  {
    icon: Zap,
    title: "Flash Deals",
    text: "Catch limited-time offers before they disappear and make every purchase count.",
    tag: "Limited Time",
  },
];

const steps = [
  {
    number: "01",
    title: "Tell us what you need",
    text: "Choose a category, shopping goal or situation.",
  },
  {
    number: "02",
    title: "Set your preferences",
    text: "Add your budget, priorities and product preferences.",
  },
  {
    number: "03",
    title: "Discover better products",
    text: "Explore relevant choices instead of endlessly scrolling.",
  },
];

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Secure",
    text: "Protected account experience",
  },
  {
    icon: Truck,
    title: "Reliable",
    text: "Easy shopping & delivery",
  },
  {
    icon: BadgeCheck,
    title: "Relevant",
    text: "Smarter product discovery",
  },
];

export default function HomePage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#fcfaf6] text-[#17140e]">
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-[100] border-b border-[#ebe3d5] bg-[#fcfaf6]/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-[74px] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#17140e] text-[#dcb75f] shadow-sm">
              <Sparkles size={19} />
            </div>

            <div className="text-[21px] font-black tracking-[-0.9px]">
              Prime<span className="text-[#b8872d]">Cart</span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            <a
              href="#features"
              className="text-[13px] font-semibold text-[#71695d] transition hover:text-[#17140e]"
            >
              Why PrimeCart
            </a>

            <a
              href="#categories"
              className="text-[13px] font-semibold text-[#71695d] transition hover:text-[#17140e]"
            >
              Categories
            </a>

            <a
              href="#how"
              className="text-[13px] font-semibold text-[#71695d] transition hover:text-[#17140e]"
            >
              How It Works
            </a>
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/auth/login"
              className="rounded-xl px-4 py-2.5 text-[13px] font-bold text-[#5e564b] transition hover:text-[#17140e]"
            >
              Login
            </Link>

            <Link
              href="/auth/register"
              className="flex items-center gap-2 rounded-xl bg-[#17140e] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#29251e]"
            >
              Get Started
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Mobile */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7dfd0] bg-white text-[#3c352b] sm:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenu ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {mobileMenu && (
          <div className="border-t border-[#ebe3d5] bg-white px-4 py-4 sm:hidden">
            <div className="mx-auto flex max-w-[1280px] flex-col gap-1">
              <a
                href="#features"
                onClick={() => setMobileMenu(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#625a4e] hover:bg-[#faf7f1]"
              >
                Why PrimeCart
              </a>

              <a
                href="#categories"
                onClick={() => setMobileMenu(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#625a4e] hover:bg-[#faf7f1]"
              >
                Categories
              </a>

              <a
                href="#how"
                onClick={() => setMobileMenu(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#625a4e] hover:bg-[#faf7f1]"
              >
                How It Works
              </a>

              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#eee7da] pt-3">
                <Link
                  href="/auth/login"
                  className="rounded-xl border border-[#e5dccb] px-4 py-3 text-center text-sm font-bold"
                >
                  Login
                </Link>

                <Link
                  href="/auth/register"
                  className="rounded-xl bg-[#17140e] px-4 py-3 text-center text-sm font-bold text-white"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden">
        {/* background decoration */}
        <div className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#ead6a7]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-[#d8bd7d]/15 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:grid-cols-[1fr_0.92fr] lg:px-8 lg:pb-28 lg:pt-24">
          {/* LEFT */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8d8b7] bg-[#f9f1df] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#8c6826]">
              <Sparkles size={13} />
              A smarter way to shop
            </div>

            <h1 className="mt-7 text-[50px] font-black leading-[0.98] tracking-[-3px] sm:text-[64px] lg:text-[76px]">
              Don&apos;t just shop.
              <br />
              <span className="text-[#b8872d]">Shop smarter.</span>
            </h1>

            <p className="mx-auto mt-7 max-w-[590px] text-[15px] leading-7 text-[#71695e] sm:text-base lg:mx-0">
              PrimeCart helps you discover the right products based on your
              needs, budget and lifestyle — giving you a simpler way to
              decide what is actually worth buying.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href="/auth/register"
                className="group flex items-center gap-2 rounded-xl bg-[#17140e] px-5 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(20,18,12,0.12)] transition hover:-translate-y-1"
              >
                Start Shopping
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#features"
                className="flex items-center gap-1.5 rounded-xl border border-[#e5dccb] bg-white px-5 py-3.5 text-sm font-bold text-[#51493e] transition hover:border-[#cdb783]"
              >
                Explore PrimeCart
                <ChevronRight size={16} />
              </a>
            </div>

            {/* mini trust */}
            <div className="mt-9 flex flex-wrap justify-center gap-x-5 gap-y-3 lg:justify-start">
              {trustPoints.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-2 text-left"
                  >
                    <Icon size={17} className="text-[#b8872d]" />

                    <div>
                      <p className="text-[11px] font-bold text-[#4f483e]">
                        {item.title}
                      </p>

                      <p className="text-[9px] text-[#91887b]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="relative mx-auto min-h-[500px] w-full max-w-[560px]">
            {/* glow */}
            <div className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ead8ad]/35 blur-3xl" />

            {/* Main dashboard mockup */}
            <div className="absolute left-1/2 top-1/2 z-10 w-[94%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-[#e7dcc7] bg-white p-4 shadow-[0_35px_90px_rgba(70,50,18,0.15)] sm:p-5">
              {/* mock header */}
              <div className="flex items-center justify-between border-b border-[#eee7da] pb-4">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#b8872d]">
                    PrimeMatch
                  </p>

                  <h3 className="mt-1 text-lg font-black tracking-tight sm:text-xl">
                    Your perfect match
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f6ecd8] text-sm font-black text-[#8c6826]">
                  92%
                </div>
              </div>

              {/* search bar */}
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#ece5d9] bg-[#fbfaf7] px-3 py-2.5">
                <Search size={15} className="text-[#9c9385]" />
                <span className="text-[10px] text-[#948a7b]">
                  Looking for something special?
                </span>
              </div>

              {/* product */}
              <div className="mt-4 rounded-2xl border border-[#eee7da] bg-[#faf8f3] p-3.5 sm:p-4">
                <div className="flex gap-3">
                  <div className="flex h-[82px] w-[82px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eee3cf] to-[#dfcfad] text-4xl">
                    📱
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-wider text-[#ad8029]">
                          Mobile
                        </span>

                        <h4 className="mt-1 truncate text-sm font-black">
                          Smartphone Pro Max
                        </h4>
                      </div>

                      <Heart
                        size={16}
                        className="shrink-0 text-[#9e9486]"
                      />
                    </div>

                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#9a7126]">
                      <Star size={11} fill="currentColor" />
                      4.8
                      <span className="font-medium text-[#958c80]">
                        · 1.2k reviews
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <strong className="text-base">
                        ₹24,999
                      </strong>

                      <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#17140e] text-white">
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[
                    "Within budget",
                    "Highly rated",
                    "Matches your needs",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-white px-2.5 py-1.5 text-[8px] font-bold text-[#766d60]"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* recommendation bar */}
              <div className="mt-3 flex items-center justify-between rounded-xl bg-[#17140e] px-4 py-3 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#d8b45f]" />

                  <span className="text-[9px] font-semibold text-white/70">
                    3 more products match your preferences
                  </span>
                </div>

                <ChevronRight size={14} className="text-[#d8b45f]" />
              </div>
            </div>

            {/* floating budget */}
            <div className="absolute left-0 top-[60px] z-20 flex items-center gap-2 rounded-2xl border border-[#e8dfd0] bg-white px-3 py-2.5 shadow-[0_15px_35px_rgba(60,44,19,0.12)] sm:left-[-8px]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5ead2] text-lg">
                💰
              </div>

              <div>
                <p className="text-[8px] text-[#93897b]">Your budget</p>
                <p className="mt-0.5 text-xs font-black">₹30,000</p>
              </div>
            </div>

            {/* floating points */}
            <div className="absolute bottom-[65px] right-0 z-20 flex items-center gap-2 rounded-2xl border border-[#e8dfd0] bg-white px-3 py-2.5 shadow-[0_15px_35px_rgba(60,44,19,0.12)] sm:right-[-8px]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5ead2] text-lg">
                ⭐
              </div>

              <div>
                <p className="text-[8px] text-[#93897b]">PrimePoints</p>
                <p className="mt-0.5 text-xs font-black text-[#9b7227]">
                  +120 earned
                </p>
              </div>
            </div>

            {/* floating profile */}
            <div className="absolute bottom-0 left-[18%] z-20 hidden items-center gap-2 rounded-2xl border border-[#e8dfd0] bg-white px-3 py-2.5 shadow-[0_15px_35px_rgba(60,44,19,0.12)] sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#17140e] text-white">
                <UserRound size={14} />
              </div>

              <div>
                <p className="text-[8px] text-[#93897b]">
                  Personalised for you
                </p>

                <p className="text-[10px] font-black">
                  Shopping profile ready
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          VALUE STRIP
      ===================================================== */}

      <section className="border-y border-[#ebe3d5] bg-white">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 sm:grid-cols-4">
          {[
            ["Smart", "Product discovery"],
            ["10+", "Shopping categories"],
            ["6", "Smart shopping tools"],
            ["1", "Simple experience"],
          ].map(([number, label], index) => (
            <div
              key={label}
              className={`px-4 py-6 text-center ${
                index !== 3 ? "border-r border-[#eee7da]" : ""
              } ${index === 1 ? "max-sm:border-r-0" : ""}`}
            >
              <p className="text-xl font-black tracking-tight sm:text-2xl">
                {number}
              </p>

              <p className="mt-1 text-[10px] font-medium text-[#8a8175] sm:text-[11px]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section id="features" className="py-24 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a37826]">
              WHY PRIMECART
            </span>

            <h2 className="mt-4 text-[40px] font-black leading-[1.03] tracking-[-2.3px] sm:text-[54px]">
              Shopping should feel
              <br />
              <span className="text-[#b8872d]">personal.</span>
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#7c7468] sm:text-[15px]">
              PrimeCart is designed around your shopping goals, budget and
              preferences — not just a never-ending product catalogue.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-[24px] border border-[#e8dfd1] bg-white p-6 transition duration-300 hover:-translate-y-1.5 hover:border-[#d5be88] hover:shadow-[0_22px_55px_rgba(66,49,19,0.08)]"
                >
                  <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#f5ead3] opacity-0 blur-2xl transition group-hover:opacity-70" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ecd9] text-[#95702b] transition group-hover:bg-[#17140e] group-hover:text-[#dcb75f]">
                        <Icon size={22} />
                      </div>

                      <span className="rounded-lg bg-[#faf7f1] px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wide text-[#8d8375]">
                        {feature.tag}
                      </span>
                    </div>

                    <h3 className="mt-7 text-[19px] font-black">
                      {feature.title}
                    </h3>

                    <p className="mt-2.5 min-h-[66px] text-[12px] leading-6 text-[#7c7469]">
                      {feature.text}
                    </p>

                    <div className="mt-6 flex items-center gap-1.5 text-[11px] font-black text-[#9b7227]">
                      Explore feature
                      <ArrowRight
                        size={14}
                        className="transition group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <section
        id="categories"
        className="border-y border-[#e9e0d2] bg-[#f5f0e7] py-24 sm:py-28"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a37826]">
                EXPLORE
              </span>

              <h2 className="mt-3 text-[40px] font-black leading-[1.03] tracking-[-2px] sm:text-[52px]">
                Find your
                <br />
                <span className="text-[#b8872d]">category.</span>
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6 text-[#7c7468]">
                From everyday essentials to your next big upgrade, explore
                everything in one place.
              </p>
            </div>

            <Link
              href="/auth/register"
              className="flex w-fit items-center gap-2 rounded-xl border border-[#ddcfb5] bg-white px-4 py-3 text-xs font-black text-[#5b5144] transition hover:border-[#b9975b]"
            >
              Explore all categories
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                href="/auth/register"
                key={category.name}
                className="group min-h-[155px] rounded-[21px] border border-[#e6ddcf] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#d1b779] hover:shadow-[0_18px_40px_rgba(70,51,18,0.07)]"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[34px] transition duration-300 group-hover:scale-110">
                    {category.icon}
                  </span>

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#faf7f1] text-[#9c752c] transition group-hover:bg-[#17140e] group-hover:text-white">
                    <ArrowRight size={13} />
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-[13px] font-black">
                    {category.name}
                  </h3>

                  <p className="mt-1 text-[9px] leading-4 text-[#938a7d]">
                    {category.count}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section id="how" className="py-24 sm:py-28">
        <div className="mx-auto grid max-w-[1280px] items-center gap-16 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a37826]">
              HOW IT WORKS
            </span>

            <h2 className="mt-4 text-[40px] font-black leading-[1.03] tracking-[-2px] sm:text-[54px]">
              Less scrolling.
              <br />
              <span className="text-[#b8872d]">Better choices.</span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#7c7468]">
              PrimeCart turns your shopping goal into a simpler,
              personalized journey so you can spend less time searching and
              more time choosing.
            </p>

            <Link
              href="/auth/register"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#17140e] px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-1"
            >
              Try PrimeCart
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="relative">
            <div className="absolute bottom-0 left-[30px] top-0 w-px bg-[#e3d9c7]" />

            <div className="space-y-2">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="group relative flex gap-5 rounded-[22px] p-5 transition hover:bg-[#faf7f1] sm:gap-7 sm:p-7"
                >
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#dfd0b3] bg-[#f7eedc] text-[10px] font-black text-[#916c28]">
                    {step.number}
                  </div>

                  <div className="pt-1">
                    <h3 className="text-lg font-black">
                      {step.title}
                    </h3>

                    <p className="mt-2 max-w-md text-[12px] leading-6 text-[#81786b]">
                      {step.text}
                    </p>
                  </div>

                  <ChevronRight
                    size={18}
                    className="ml-auto mt-2 hidden text-[#b9975b] sm:block"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          DIFFERENCE
      ===================================================== */}

      <section className="pb-24 sm:pb-28">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-[30px] bg-[#17140e] text-white lg:grid-cols-[1fr_0.9fr]">
            <div className="p-7 sm:p-10 lg:p-16">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d2aa54]">
                THE PRIMECART DIFFERENCE
              </span>

              <h2 className="mt-4 text-[40px] font-black leading-[1.02] tracking-[-2px] sm:text-[55px]">
                Stop searching
                <br />
                for <span className="text-[#d7b25d]">hours.</span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-white/55">
                Whether you need a new phone, gaming setup, college
                essentials or something for your home, PrimeCart helps you
                narrow down the choices.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "Personalized product discovery",
                  "Budget-aware recommendations",
                  "Situation-based shopping",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-xs font-semibold text-white/80"
                  >
                    <span className="text-[9px] font-black text-[#d4ad58]">
                      0{index + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              <Link
                href="/auth/register"
                className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[#17140e] transition hover:bg-[#f3ead9]"
              >
                Create Your Account
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,#4a3b20_0%,#282116_38%,#17140e_72%)]">
              <div className="absolute h-[280px] w-[280px] rounded-full border border-[#cba85c]/15" />
              <div className="absolute h-[390px] w-[390px] rounded-full border border-[#cba85c]/10" />

              <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-[#705b31] bg-[#2e2617] text-[#d7b15d] shadow-[0_0_80px_rgba(205,168,83,0.12)]">
                <Brain size={54} />
              </div>

              <div className="absolute left-6 top-14 rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-md sm:left-10">
                <p className="text-[8px] text-white/45">Shopping goal</p>
                <p className="mt-1 text-xs font-black">
                  Gaming Setup
                </p>
              </div>

              <div className="absolute right-5 top-[45%] rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-md sm:right-10">
                <p className="text-[8px] text-white/45">Budget</p>
                <p className="mt-1 text-xs font-black">
                  ₹50,000
                </p>
              </div>

              <div className="absolute bottom-12 left-12 rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-md sm:left-20">
                <p className="text-[8px] text-white/45">Match score</p>
                <p className="mt-1 text-xs font-black text-[#d8b45f]">
                  96%
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="pb-24 sm:pb-28">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[30px] bg-[#efdfba] px-6 py-20 text-center sm:px-10">
            <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full border border-[#a98238]/10" />
            <div className="absolute -bottom-48 -right-24 h-96 w-96 rounded-full border border-[#a98238]/10" />

            <div className="relative z-10 mx-auto max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#92702e]">
                READY TO SHOP DIFFERENTLY?
              </span>

              <h2 className="mt-4 text-[40px] font-black leading-[1.02] tracking-[-2px] sm:text-[58px]">
                Your smarter shopping
                <br />
                journey starts here.
              </h2>

              <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#74684f]">
                Create your PrimeCart account and discover a more
                personalized way to shop.
              </p>

              <Link
                href="/auth/register"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#17140e] px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-1"
              >
                Get Started
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-[#17140e] text-white">
        <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#29251d] text-[#dcb75f]">
                  <Sparkles size={18} />
                </div>

                <div className="text-xl font-black tracking-tight">
                  Prime<span className="text-[#d0a74e]">Cart</span>
                </div>
              </Link>

              <p className="mt-5 max-w-xs text-xs leading-6 text-white/45">
                A smarter shopping experience built around your needs,
                budget and preferences.
              </p>
            </div>

            <FooterColumn
              title="Explore"
              links={[
                ["Why PrimeCart", "#features"],
                ["Categories", "#categories"],
                ["How It Works", "#how"],
              ]}
            />

            <FooterColumn
              title="Account"
              links={[
                ["Login", "/auth/login"],
                ["Register", "/auth/register"],
              ]}
            />

            <FooterColumn
              title="PrimeCart"
              links={[
                ["PrimeMatch", "/auth/register"],
                ["Budget Builder", "/auth/register"],
                ["PrimePoints", "/auth/register"],
              ]}
            />
          </div>

          <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-5 text-[10px] text-white/35 sm:flex-row">
            <span>© 2026 PrimeCart. All rights reserved.</span>
            <span>Shop smarter. Discover better.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="text-[10px] font-black uppercase tracking-[0.16em] text-[#d1aa56]">
        {title}
      </h4>

      <div className="mt-5 flex flex-col gap-3">
        {links.map(([label, href]) => (
          <Link
            key={label}
            href={href}
            className="w-fit text-xs text-white/45 transition hover:text-white"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
