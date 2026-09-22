"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
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
  Truck,
  Trophy,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  {
    name: "Mobile",
    icon: "📱",
    count: "Smartphones & accessories",
  },
  {
    name: "Home & Living",
    icon: "🏠",
    count: "Make your space better",
  },
  {
    name: "Appliance",
    icon: "⚡",
    count: "Everyday essentials",
  },
  {
    name: "Footwear",
    icon: "👟",
    count: "Style meets comfort",
  },
  {
    name: "Watch",
    icon: "⌚",
    count: "Time in your style",
  },
  {
    name: "Bag",
    icon: "👜",
    count: "Carry it your way",
  },
  {
    name: "Toy & Baby",
    icon: "🧸",
    count: "For little moments",
  },
  {
    name: "Automotive",
    icon: "🚗",
    count: "Drive better",
  },
  {
    name: "Fashion",
    icon: "👕",
    count: "Your everyday style",
  },
  {
    name: "Gaming",
    icon: "🎮",
    count: "Level up your setup",
  },
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

const products = [
  {
    name: "Smartphone Pro Max",
    category: "Mobile",
    price: "₹24,999",
    oldPrice: "₹31,999",
    rating: "4.8",
    reviews: "1.2k",
    image: "/products/smartphone-x-pro.png",
    badge: "Best Seller",
  },
  {
    name: "Wireless Headphones",
    category: "Electronics",
    price: "₹3,499",
    oldPrice: "₹5,999",
    rating: "4.7",
    reviews: "846",
    image: "/products/wireless-headphones.png",
    badge: "Popular",
  },
  {
    name: "Classic Denim Jacket",
    category: "Fashion",
    price: "₹1,899",
    oldPrice: "₹2,999",
    rating: "4.6",
    reviews: "534",
    image: "/products/denim-jacket.png",
    badge: "Trending",
  },
  {
    name: "Modern Coffee Maker",
    category: "Appliance",
    price: "₹4,299",
    oldPrice: "₹6,499",
    rating: "4.8",
    reviews: "391",
    image: "/products/coffee-maker.png",
    badge: "Hot Deal",
  },
];

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function HomePage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [productIndex, setProductIndex] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const nextProducts = () => {
    setProductIndex((prev) =>
      prev + 1 >= products.length ? 0 : prev + 1
    );
  };

  const previousProducts = () => {
    setProductIndex((prev) =>
      prev - 1 < 0 ? products.length - 1 : prev - 1
    );
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#fcfaf6] text-[#17140e]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-[100] border-b border-[#e9e1d4] bg-[#fcfaf6]/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#17140e] text-[#e1bd66] shadow-[0_8px_20px_rgba(23,20,14,0.14)]"
            >
              <Sparkles size={19} />
            </motion.div>

            <div className="text-[21px] font-black tracking-[-0.9px]">
              Prime<span className="text-[#b8872d]">Cart</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            <a
              href="#features"
              className="nav-link"
            >
              Why PrimeCart
            </a>

            <a
              href="#categories"
              className="nav-link"
            >
              Categories
            </a>

            <a
              href="#trending"
              className="nav-link"
            >
              Trending
            </a>

            <a
              href="#how"
              className="nav-link"
            >
              How It Works
            </a>
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/auth/login"
              className="rounded-xl px-4 py-2.5 text-[13px] font-bold text-[#665d50] transition hover:bg-white hover:text-[#17140e]"
            >
              Login
            </Link>

            <Link
              href="/auth/register"
              className="group flex items-center gap-2 rounded-xl bg-[#17140e] px-5 py-3 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(23,20,14,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b8872d] hover:shadow-[0_12px_25px_rgba(184,135,45,0.25)]"
            >
              Get Started
              <ArrowRight
                size={15}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5dccd] bg-white shadow-sm sm:hidden"
          >
            {mobileMenu ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[#e9e1d4] bg-white sm:hidden"
            >
              <div className="space-y-1 px-4 py-4">
                {[
                  ["Why PrimeCart", "#features"],
                  ["Categories", "#categories"],
                  ["Trending", "#trending"],
                  ["How It Works", "#how"],
                ].map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setMobileMenu(false)}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#625a4e] hover:bg-[#faf7f1]"
                  >
                    {label}
                  </a>
                ))}

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#eee7da] pt-3">
                  <Link
                    href="/auth/login"
                    className="rounded-xl border border-[#ded4c2] px-4 py-3 text-center text-sm font-bold"
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
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-[-180px] top-[80px] h-[500px] w-[500px] rounded-full bg-[#ead6a7]/25 blur-3xl" />

        <div className="pointer-events-none absolute right-[-180px] top-0 h-[520px] w-[520px] rounded-full bg-[#d8bd7d]/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1320px] items-center gap-14 px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:pb-28 lg:pt-24">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-[#e6d5b1] bg-[#f9f1df] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#8c6826]"
            >
              <Sparkles size={13} />
              A smarter way to shop
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-7 text-[50px] font-black leading-[0.97] tracking-[-3px] sm:text-[65px] lg:text-[78px]"
            >
              Don&apos;t just shop.
              <br />
              <span className="bg-gradient-to-r from-[#b8872d] via-[#d1a44d] to-[#9d7125] bg-clip-text text-transparent">
                Shop smarter.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-7 max-w-[600px] text-[15px] leading-7 text-[#71695e] sm:text-base lg:mx-0"
            >
              Discover products based on your needs, budget and lifestyle.
              PrimeCart makes shopping simpler, smarter and more personal.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
            >
              <Link
                href="/auth/register"
                className="group flex min-h-[50px] items-center gap-2 rounded-xl bg-[#17140e] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(23,20,14,0.18)] transition duration-300 hover:-translate-y-1 hover:bg-[#b8872d] hover:shadow-[0_18px_35px_rgba(184,135,45,0.25)]"
              >
                Start Shopping
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#features"
                className="flex min-h-[50px] items-center gap-2 rounded-xl border border-[#dcd0bc] bg-white px-6 py-3.5 text-sm font-bold text-[#4e473d] shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#c6a864] hover:bg-[#fffdf9]"
              >
                Explore PrimeCart
                <ChevronRight size={16} />
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-4 lg:justify-start"
            >
              {trustPoints.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-2 text-left"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f6ecd8]">
                      <Icon size={16} className="text-[#b8872d]" />
                    </div>

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
            </motion.div>
          </motion.div>

          {/* HERO VISUAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
            }}
            className="relative mx-auto min-h-[500px] w-full max-w-[570px]"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ead8ad]/35 blur-3xl"
            />

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-1/2 top-1/2 z-10 w-[94%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-[#e7dcc7] bg-white p-4 shadow-[0_35px_90px_rgba(70,50,18,0.15)] sm:p-5"
            >
              <div className="flex items-center justify-between border-b border-[#eee7da] pb-4">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#b8872d]">
                    PrimeMatch
                  </p>

                  <h3 className="mt-1 text-lg font-black tracking-tight sm:text-xl">
                    Your perfect match
                  </h3>
                </div>

                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f6ecd8] text-sm font-black text-[#8c6826]"
                >
                  92%
                </motion.div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#ece5d9] bg-[#fbfaf7] px-3 py-2.5">
                <Search size={15} className="text-[#9c9385]" />
                <span className="text-[10px] text-[#948a7b]">
                  Looking for something special?
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-[#eee7da] bg-[#faf8f3] p-3.5 sm:p-4">
                <div className="flex gap-3">
                  <div className="relative h-[82px] w-[82px] shrink-0 overflow-hidden rounded-2xl bg-[#eee3cf]">
                    <Image
                      src="/products/smartphone-x-pro.png"
                      alt="Smartphone Pro Max"
                      fill
                      sizes="82px"
                      className="object-contain p-2"
                    />
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

                      <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#17140e] text-white transition hover:bg-[#b8872d]">
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
                      className="rounded-lg bg-white px-2.5 py-1.5 text-[8px] font-bold text-[#766d60] shadow-sm"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-[#17140e] px-4 py-3 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#d8b45f]" />
                  <span className="text-[9px] font-semibold text-white/70">
                    3 more products match your preferences
                  </span>
                </div>

                <ChevronRight size={14} className="text-[#d8b45f]" />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute left-0 top-[55px] z-20 flex items-center gap-2 rounded-2xl border border-[#e8dfd0] bg-white px-3 py-2.5 shadow-[0_15px_35px_rgba(60,44,19,0.12)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5ead2] text-lg">
                💰
              </div>

              <div>
                <p className="text-[8px] text-[#93897b]">
                  Your budget
                </p>
                <p className="mt-0.5 text-xs font-black">
                  ₹30,000
                </p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 9, 0] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
              }}
              className="absolute bottom-[60px] right-0 z-20 flex items-center gap-2 rounded-2xl border border-[#e8dfd0] bg-white px-3 py-2.5 shadow-[0_15px_35px_rgba(60,44,19,0.12)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5ead2] text-lg">
                ⭐
              </div>

              <div>
                <p className="text-[8px] text-[#93897b]">
                  PrimePoints
                </p>
                <p className="mt-0.5 text-xs font-black text-[#9b7227]">
                  +120 earned
                </p>
              </div>
            </motion.div>

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
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-[#ebe3d5] bg-white">
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 sm:grid-cols-4">
          {[
            ["Smart", "Product discovery"],
            ["10+", "Shopping categories"],
            ["6", "Smart shopping tools"],
            ["1", "Simple experience"],
          ].map(([number, label], index) => (
            <motion.div
              key={label}
              whileHover={{ backgroundColor: "#fcfaf6" }}
              className={`px-4 py-7 text-center ${
                index !== 3
                  ? "border-r border-[#eee7da]"
                  : ""
              }`}
            >
              <p className="text-2xl font-black tracking-tight">
                {number}
              </p>

              <p className="mt-1 text-[10px] font-medium text-[#8a8175] sm:text-[11px]">
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section id="trending" className="py-24 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
          >
            <div>
              <span className="section-label">
                TRENDING NOW
              </span>

              <h2 className="mt-3 text-[40px] font-black leading-[1.03] tracking-[-2px] sm:text-[52px]">
                Products people
                <br />
                <span className="gold-text">
                  are loving.
                </span>
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6 text-[#7c7468]">
                Discover popular products selected from the PrimeCart
                collection.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={previousProducts}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#ddd3c1] bg-white transition hover:border-[#b8872d] hover:bg-[#fffaf0]"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={nextProducts}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#ddd3c1] bg-white transition hover:border-[#b8872d] hover:bg-[#fffaf0]"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {products.map((product, index) => (
              <motion.div
                variants={fadeUp}
                key={product.name}
                whileHover={{ y: -7 }}
                className={`group overflow-hidden rounded-[25px] border border-[#e8dfd1] bg-white shadow-[0_8px_25px_rgba(55,42,18,0.035)] ${
                  index === productIndex
                    ? "ring-1 ring-[#caa75d]/40"
                    : ""
                }`}
              >
                <div className="relative aspect-square overflow-hidden bg-[#f7f4ee]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-contain p-8 transition duration-500 group-hover:scale-110"
                  />

                  <span className="absolute left-4 top-4 rounded-full bg-[#17140e] px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-white">
                    {product.badge}
                  </span>

                  <button className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[#625a50] shadow-sm transition hover:text-red-500">
                    <Heart size={16} />
                  </button>
                </div>

                <div className="p-5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#ad8029]">
                    {product.category}
                  </span>

                  <h3 className="mt-2 text-[16px] font-black">
                    {product.name}
                  </h3>

                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="flex items-center gap-1 rounded-md bg-[#fff5d9] px-2 py-1 text-[10px] font-bold text-[#8c6826]">
                      <Star size={11} fill="currentColor" />
                      {product.rating}
                    </span>

                    <span className="text-[10px] text-[#938a7d]">
                      {product.reviews} reviews
                    </span>
                  </div>

                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-xl font-black">
                      {product.price}
                    </span>

                    <span className="text-xs text-[#aaa095] line-through">
                      {product.oldPrice}
                    </span>
                  </div>

                  <Link
                    href="/auth/register"
                    className="mt-4 flex min-h-[43px] items-center justify-center gap-2 rounded-xl bg-[#17140e] text-xs font-bold text-white transition hover:bg-[#b8872d]"
                  >
                    View Product
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="border-y border-[#ebe3d5] bg-[#f7f2e9] py-24 sm:py-28"
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="section-label">
              WHY PRIMECART
            </span>

            <h2 className="mt-4 text-[40px] font-black leading-[1.03] tracking-[-2.3px] sm:text-[54px]">
              Shopping should feel
              <br />
              <span className="gold-text">
                personal.
              </span>
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#7c7468] sm:text-[15px]">
              Tools designed to make product discovery easier, faster
              and more relevant to you.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -7 }}
                  key={feature.title}
                  className="group relative overflow-hidden rounded-[25px] border border-[#e6ddcf] bg-white p-6 shadow-[0_8px_25px_rgba(60,45,18,0.025)] transition"
                >
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#f4e6c6] opacity-0 blur-2xl transition group-hover:opacity-80" />

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
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section
        id="categories"
        className="border-b border-[#e9e0d2] bg-[#fcfaf6] py-24 sm:py-28"
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="section-label">
                EXPLORE
              </span>

              <h2 className="mt-3 text-[40px] font-black leading-[1.03] tracking-[-2px] sm:text-[52px]">
                Find your
                <br />
                <span className="gold-text">
                  category.
                </span>
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6 text-[#7c7468]">
                From everyday essentials to your next big upgrade.
              </p>
            </div>

            <Link
              href="/auth/register"
              className="flex w-fit items-center gap-2 rounded-xl border border-[#d8cdbb] bg-white px-5 py-3 text-xs font-black text-[#5b5144] shadow-sm transition hover:-translate-y-0.5 hover:border-[#b9975b]"
            >
              Explore all categories
              <ArrowRight size={15} />
            </Link>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
          >
            {categories.map((category) => (
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -6, scale: 1.01 }}
                key={category.name}
              >
                <Link
                  href="/auth/register"
                  className="group block min-h-[160px] rounded-[22px] border border-[#e6ddcf] bg-white p-5 shadow-[0_8px_25px_rgba(60,45,18,0.025)] transition hover:border-[#d1b779] hover:shadow-[0_20px_40px_rgba(70,51,18,0.08)]"
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PRIME MATCH */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[32px] border border-[#dfd2bb] bg-white shadow-[0_20px_70px_rgba(70,50,18,0.06)]">
            <div className="grid lg:grid-cols-[1fr_0.9fr]">
              <div className="p-7 sm:p-10 lg:p-16">
                <span className="section-label">
                  SMART SHOPPING
                </span>

                <h2 className="mt-4 text-[40px] font-black leading-[1.03] tracking-[-2px] sm:text-[55px]">
                  Meet
                  <br />
                  <span className="gold-text">
                    PrimeMatch.
                  </span>
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-[#756d61]">
                  Tell PrimeCart what you need, your budget and what matters
                  most. PrimeMatch helps you discover products that fit your
                  requirements.
                </p>

                <div className="mt-7 space-y-3">
                  {[
                    "Tell us your shopping goal",
                    "Set your preferred budget",
                    "Discover relevant products",
                    "Compare your options",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm font-semibold text-[#51493f]"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f5ecd9] text-[#9a742c]">
                        <Check size={13} />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>

                <Link
                  href="/auth/register"
                  className="mt-8 inline-flex min-h-[50px] items-center gap-2 rounded-xl bg-[#17140e] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(23,20,14,0.15)] transition hover:-translate-y-1 hover:bg-[#b8872d]"
                >
                  Try PrimeMatch
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="relative min-h-[440px] overflow-hidden bg-[#17140e]">
                <div className="absolute left-1/2 top-1/2 h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d0a74e]/20" />

                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 35,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#d0a74e]/10"
                />

                <motion.div
                  animate={{
                    scale: [1, 1.06, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                  className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#806733] bg-[#2d2415] text-[#d9b45d] shadow-[0_0_90px_rgba(210,169,75,0.14)]"
                >
                  <Brain size={52} />
                </motion.div>

                <FloatingInfo
                  className="left-6 top-14 sm:left-10"
                  label="Shopping goal"
                  value="Gaming Setup"
                />

                <FloatingInfo
                  className="right-5 top-[45%] sm:right-10"
                  label="Budget"
                  value="₹50,000"
                />

                <FloatingInfo
                  className="bottom-12 left-12 sm:left-20"
                  label="Match score"
                  value="96%"
                  gold
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="border-y border-[#ebe3d5] bg-[#f7f2e9] py-24 sm:py-28"
      >
        <div className="mx-auto grid max-w-[1320px] items-center gap-16 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <span className="section-label">
              HOW IT WORKS
            </span>

            <h2 className="mt-4 text-[40px] font-black leading-[1.03] tracking-[-2px] sm:text-[54px]">
              Less scrolling.
              <br />
              <span className="gold-text">
                Better choices.
              </span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#7c7468]">
              PrimeCart turns your shopping goal into a simpler,
              personalized journey.
            </p>

            <Link
              href="/auth/register"
              className="mt-7 inline-flex min-h-[50px] items-center gap-2 rounded-xl bg-[#17140e] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(23,20,14,0.14)] transition hover:-translate-y-1 hover:bg-[#b8872d]"
            >
              Try PrimeCart
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="relative">
            <div className="absolute bottom-0 left-[30px] top-0 w-px bg-[#ded2bd]" />

            <div className="space-y-2">
              {steps.map((step) => (
                <motion.div
                  whileHover={{ x: 6 }}
                  key={step.number}
                  className="group relative flex gap-5 rounded-[22px] p-5 transition hover:bg-white sm:gap-7 sm:p-7"
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
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DIFFERENCE */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-[32px] bg-[#17140e] text-white lg:grid-cols-[1fr_0.9fr]">
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
                essentials or something for your home, PrimeCart helps
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
                className="mt-9 inline-flex min-h-[50px] items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#17140e] shadow-[0_10px_25px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:bg-[#f4ead8]"
              >
                Create Your Account
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,#4a3b20_0%,#282116_38%,#17140e_72%)]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute h-[280px] w-[280px] rounded-full border border-[#cba85c]/15"
              />

              <div className="absolute h-[390px] w-[390px] rounded-full border border-[#cba85c]/10" />

              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                className="relative flex h-40 w-40 items-center justify-center rounded-full border border-[#705b31] bg-[#2e2617] text-[#d7b15d] shadow-[0_0_80px_rgba(205,168,83,0.12)]"
              >
                <Brain size={54} />
              </motion.div>

              <FloatingInfo
                className="left-6 top-14 sm:left-10"
                label="Shopping goal"
                value="Gaming Setup"
                dark
              />

              <FloatingInfo
                className="right-5 top-[45%] sm:right-10"
                label="Budget"
                value="₹50,000"
                dark
              />

              <FloatingInfo
                className="bottom-12 left-12 sm:left-20"
                label="Match score"
                value="96%"
                gold
                dark
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 sm:pb-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#f0dfb8] to-[#e6cf99] px-6 py-20 text-center shadow-[0_20px_60px_rgba(90,66,25,0.08)] sm:px-10">
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
                className="mt-8 inline-flex min-h-[51px] items-center gap-2 rounded-xl bg-[#17140e] px-7 py-3.5 text-sm font-black text-white shadow-[0_12px_30px_rgba(23,20,14,0.18)] transition hover:-translate-y-1 hover:bg-[#b8872d]"
              >
                Get Started
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#17140e] text-white">
        <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
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
                ["Trending", "#trending"],
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

      {/* BACK TO TOP */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[#17140e] text-white shadow-[0_12px_30px_rgba(0,0,0,0.2)] transition hover:bg-[#b8872d]"
            aria-label="Back to top"
          >
            <ChevronDown
              size={18}
              className="rotate-180"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* LOCAL STYLES */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        .nav-link {
          font-size: 13px;
          font-weight: 600;
          color: #71695d;
          transition: all 0.25s ease;
        }

        .nav-link:hover {
          color: #17140e;
        }

        .section-label {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.2em;
          color: #a37826;
        }

        .gold-text {
          background: linear-gradient(
            90deg,
            #b8872d,
            #d0a44d,
            #9d7125
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        ::selection {
          background: #d7b15d;
          color: #17140e;
        }
      `}</style>
    </main>
  );
}

function FloatingInfo({
  className,
  label,
  value,
  gold = false,
  dark = false,
}: {
  className: string;
  label: string;
  value: string;
  gold?: boolean;
  dark?: boolean;
}) {
  return (
    <motion.div
      animate={{
        y: [0, -7, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute z-20 rounded-2xl border p-3 backdrop-blur-md ${className} ${
        dark
          ? "border-white/10 bg-white/[0.07]"
          : "border-[#e8dfd0] bg-white shadow-[0_15px_35px_rgba(60,44,19,0.12)]"
      }`}
    >
      <p
        className={`text-[8px] ${
          dark ? "text-white/45" : "text-[#93897b]"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-1 text-xs font-black ${
          gold
            ? "text-[#d8b45f]"
            : dark
            ? "text-white"
            : "text-[#17140e]"
        }`}
      >
        {value}
      </p>
    </motion.div>
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
