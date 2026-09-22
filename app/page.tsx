"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  Check,
  ChevronRight,
  Clock3,
  Gift,
  Heart,
  Layers3,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Target,
  Truck,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

/* =========================================================
   DATA
========================================================= */

const categories = [
  {
    name: "Mobile",
    slug: "mobile",
    icon: "📱",
    subtitle: "Smartphones & accessories",
  },
  {
    name: "Home & Living",
    slug: "home-living",
    icon: "🏠",
    subtitle: "Make your space better",
  },
  {
    name: "Appliance",
    slug: "appliance",
    icon: "⚡",
    subtitle: "Everyday essentials",
  },
  {
    name: "Footwear",
    slug: "footwear",
    icon: "👟",
    subtitle: "Style meets comfort",
  },
  {
    name: "Watch",
    slug: "watch",
    icon: "⌚",
    subtitle: "Time in your style",
  },
  {
    name: "Bag",
    slug: "bag",
    icon: "👜",
    subtitle: "Carry it your way",
  },
  {
    name: "Toy & Baby",
    slug: "toy-baby",
    icon: "🧸",
    subtitle: "For little moments",
  },
  {
    name: "Automotive",
    slug: "automotive",
    icon: "🚗",
    subtitle: "Drive better",
  },
  {
    name: "Fashion",
    slug: "fashion",
    icon: "👕",
    subtitle: "Your everyday style",
  },
  {
    name: "Gaming",
    slug: "gaming",
    icon: "🎮",
    subtitle: "Level up your setup",
  },
];

const products = [
  {
    name: "Smartphone Pro Max",
    slug: "smartphone-pro-max",
    category: "Mobile",
    price: "₹24,999",
    originalPrice: "₹31,999",
    discount: "22% OFF",
    rating: "4.8",
    reviews: "1.2k",
    emoji: "📱",
    tag: "Best Seller",
  },
  {
    name: "Wireless Bluetooth Headphones",
    slug: "wireless-bluetooth-headphones",
    category: "Electronics",
    price: "₹2,499",
    originalPrice: "₹4,999",
    discount: "50% OFF",
    rating: "4.7",
    reviews: "864",
    emoji: "🎧",
    tag: "Trending",
  },
  {
    name: "Classic Denim Jacket",
    slug: "classic-denim-jacket",
    category: "Fashion",
    price: "₹1,799",
    originalPrice: "₹2,999",
    discount: "40% OFF",
    rating: "4.6",
    reviews: "532",
    emoji: "🧥",
    tag: "Popular",
  },
  {
    name: "Luxury Face Serum",
    slug: "luxury-face-serum",
    category: "Beauty",
    price: "₹899",
    originalPrice: "₹1,499",
    discount: "40% OFF",
    rating: "4.8",
    reviews: "421",
    emoji: "✨",
    tag: "Top Rated",
  },
];

const deals = [
  {
    title: "Upgrade Your Tech",
    subtitle: "Smartphones, audio & accessories",
    button: "Shop Electronics",
    href: "/categories/mobile",
    icon: "📱",
  },
  {
    title: "Style Refresh",
    subtitle: "Fresh looks for every day",
    button: "Explore Fashion",
    href: "/categories/fashion",
    icon: "👕",
  },
  {
    title: "Make Home Better",
    subtitle: "Useful products for your space",
    button: "Shop Home",
    href: "/categories/home-living",
    icon: "🏠",
  },
];

const benefits = [
  {
    icon: Truck,
    title: "Fast Delivery",
    text: "Get your orders delivered quickly and safely.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Shopping",
    text: "Your account and shopping experience stay protected.",
  },
  {
    icon: BadgeCheck,
    title: "Quality Products",
    text: "Discover products selected for a better experience.",
  },
  {
    icon: Gift,
    title: "Great Deals",
    text: "Find useful offers and value-packed products.",
  },
];

const smartFeatures = [
  {
    icon: Brain,
    title: "PrimeMatch",
    tag: "Smart Discovery",
    text: "Tell us your needs, budget and priorities and discover products that fit you better.",
  },
  {
    icon: Target,
    title: "Budget Builder",
    tag: "Budget Smart",
    text: "Set your spending limit and build your shopping list without losing control.",
  },
  {
    icon: Layers3,
    title: "Build My Setup",
    tag: "Complete Setup",
    text: "Create complete setups for gaming, college, work, fitness and home.",
  },
  {
    icon: Gift,
    title: "Mystery Deal",
    tag: "Surprise",
    text: "Discover surprise offers and special deals selected for PrimeCart shoppers.",
  },
];

const steps = [
  {
    number: "01",
    title: "Explore",
    text: "Browse categories and discover products that match your needs.",
  },
  {
    number: "02",
    title: "Compare",
    text: "Check prices, ratings and product details before deciding.",
  },
  {
    number: "03",
    title: "Shop",
    text: "Add your favourites to cart and enjoy a simple shopping experience.",
  },
];

/* =========================================================
   ANIMATIONS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: "easeOut" as const,
    },
  },
};

const fadeLeft = {
  hidden: {
    opacity: 0,
    x: -35,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut" as const,
    },
  },
};

const fadeRight = {
  hidden: {
    opacity: 0,
    x: 35,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut" as const,
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

const scaleIn = {
  hidden: {
    opacity: 0,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

/* =========================================================
   HOME PAGE
========================================================= */

export default function HomePage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <main className="min-h-screen overflow-hidden bg-[#fffdf9] text-[#211b12]">

      {/* =====================================================
          TOP ANNOUNCEMENT BAR
      ===================================================== */}

      <div className="bg-[#b8872d] px-4 py-2 text-center text-[10px] font-bold tracking-wide text-white sm:text-[11px]">
        Free shipping on selected orders • Easy returns • Secure shopping
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-[100] border-b border-[#eee5d6] bg-[#fffdf9]/95 backdrop-blur-xl">

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

          <div className="flex h-[72px] items-center gap-4">

            {/* LOGO */}

            <Link
              href="/logo.png"
              className="group flex shrink-0 items-center gap-2.5"
            >
              <motion.div
                whileHover={{
                  rotate: 5,
                  scale: 1.04,
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c79a3b] text-white shadow-[0_8px_20px_rgba(184,135,45,0.2)]"
              >
                <Sparkles size={19} />
              </motion.div>

              <div className="text-[21px] font-black tracking-[-0.9px]">
                Prime<span className="text-[#b8872d]">Cart</span>
              </div>
            </Link>

            {/* DESKTOP SEARCH */}

            <div className="hidden flex-1 md:block">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mx-auto flex h-11 max-w-[560px] items-center overflow-hidden rounded-xl border border-[#e4d9c7] bg-white transition focus-within:border-[#c79a3b] focus-within:ring-4 focus-within:ring-[#c79a3b]/10"
              >
                <Search
                  size={18}
                  className="ml-4 shrink-0 text-[#9b9182]"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for products, brands and more..."
                  className="h-full flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[#a69d90]"
                />

                <button
                  type="submit"
                  className="mr-1 flex h-9 items-center rounded-lg bg-[#c79a3b] px-5 text-xs font-black text-white transition hover:bg-[#ae7d25]"
                >
                  Search
                </button>
              </form>
            </div>

            {/* NAV ACTIONS */}

            <div className="ml-auto hidden items-center gap-1 lg:flex">

              <Link
                href="/auth/login"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[#62594d] transition hover:bg-[#f8f2e8] hover:text-[#9a7127]"
              >
                <UserRound size={18} />

                <span className="text-xs font-bold">
                  Account
                </span>
              </Link>

              <Link
                href="/wishlist"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#62594d] transition hover:bg-[#f8f2e8] hover:text-[#9a7127]"
                aria-label="Wishlist"
              >
                <Heart size={19} />
              </Link>

              <Link
                href="/cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#62594d] transition hover:bg-[#f8f2e8] hover:text-[#9a7127]"
                aria-label="Cart"
              >
                <ShoppingCart size={19} />

                <span className="absolute right-1 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c79a3b] px-1 text-[8px] font-black text-white">
                  0
                </span>
              </Link>

              <Link
                href="/auth/register"
                className="ml-2 flex items-center gap-2 rounded-xl bg-[#c79a3b] px-4 py-2.5 text-xs font-black text-white shadow-[0_8px_20px_rgba(184,135,45,0.2)] transition hover:-translate-y-0.5 hover:bg-[#ae7d25]"
              >
                Start Shopping
                <ArrowRight size={14} />
              </Link>

            </div>

            {/* MOBILE MENU */}

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-[#e4d9c7] bg-white text-[#554c40] md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenu ? (
                <X size={19} />
              ) : (
                <Menu size={19} />
              )}
            </button>

          </div>

          {/* MOBILE SEARCH */}

          <div className="pb-3 md:hidden">
            <div className="flex h-10 items-center rounded-xl border border-[#e4d9c7] bg-white">
              <Search
                size={16}
                className="ml-3 text-[#9b9182]"
              />

              <input
                placeholder="Search products..."
                className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none"
              />

              <button className="mr-1 rounded-lg bg-[#c79a3b] px-3 py-2 text-[10px] font-black text-white">
                Search
              </button>
            </div>
          </div>

        </div>

        {/* MOBILE MENU */}

        {mobileMenu && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            className="border-t border-[#eee5d6] bg-white md:hidden"
          >
            <div className="mx-auto max-w-[1400px] space-y-1 px-4 py-4">

              <Link
                href="/categories"
                onClick={() => setMobileMenu(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#faf5ec]"
              >
                Categories
                <ChevronRight size={16} />
              </Link>

              <a
                href="#deals"
                onClick={() => setMobileMenu(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#faf5ec]"
              >
                Today's Deals
                <ChevronRight size={16} />
              </a>

              <a
                href="#features"
                onClick={() => setMobileMenu(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#faf5ec]"
              >
                PrimeCart Features
                <ChevronRight size={16} />
              </a>

              <Link
                href="/auth/login"
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#faf5ec]"
              >
                <UserRound size={17} />
                Login
              </Link>

              <Link
                href="/auth/register"
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#c79a3b] px-4 py-3 text-sm font-black text-white"
              >
                Start Shopping
                <ArrowRight size={16} />
              </Link>

            </div>
          </motion.div>
        )}

      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-[#eee5d6]">

        <div className="absolute -left-40 top-20 h-[450px] w-[450px] rounded-full bg-[#ead7a9]/25 blur-3xl" />
        <div className="absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-[#f1dfb7]/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pb-24 lg:pt-20">

          {/* HERO COPY */}

          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >

            <div className="inline-flex items-center gap-2 rounded-full border border-[#e6d2a6] bg-[#fbf2df] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.13em] text-[#956d24]">
              <Sparkles size={13} />
              A smarter shopping experience
            </div>

            <h1 className="mt-6 text-[47px] font-black leading-[0.98] tracking-[-3px] sm:text-[63px] lg:text-[76px]">
              Everything you want.
              <br />
              <span className="text-[#b8872d]">
                One smarter cart.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-[590px] text-[15px] leading-7 text-[#756d61] sm:text-base lg:mx-0">
              Discover products, compare your choices, find better deals
              and shop according to your budget — all in one beautiful
              shopping experience.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">

              <Link
                href="/categories"
                className="group flex items-center gap-2 rounded-xl bg-[#c79a3b] px-5 py-3.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(184,135,45,0.2)] transition hover:-translate-y-1 hover:bg-[#ae7d25] hover:shadow-[0_16px_32px_rgba(184,135,45,0.25)]"
              >
                Shop Now
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#deals"
                className="group flex items-center gap-2 rounded-xl border border-[#ded2bf] bg-white px-5 py-3.5 text-sm font-black text-[#5d554a] transition hover:-translate-y-0.5 hover:border-[#c79a3b] hover:text-[#9a7127]"
              >
                Explore Deals
                <ChevronRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </a>

            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 lg:justify-start">

              {[
                ["✓", "Secure payments"],
                ["✓", "Easy returns"],
                ["✓", "Smart discovery"],
              ].map(([icon, text]) => (
                <div
                  key={text}
                  className="flex items-center gap-2 text-[11px] font-semibold text-[#756c5e]"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f3e6ca] text-[9px] font-black text-[#a27727]">
                    {icon}
                  </span>
                  {text}
                </div>
              ))}

            </div>

          </motion.div>

          {/* HERO SHOPPING CARD */}

          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate="visible"
            className="relative mx-auto w-full max-w-[620px]"
          >

            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative overflow-hidden rounded-[30px] border border-[#e7dcc9] bg-white p-4 shadow-[0_30px_80px_rgba(75,54,20,0.13)] sm:p-5"
            >

              {/* CARD HEADER */}

              <div className="flex items-center justify-between border-b border-[#eee7da] pb-4">

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b8872d]">
                    PrimeCart Picks
                  </p>

                  <h3 className="mt-1 text-lg font-black tracking-tight">
                    Products made for you
                  </h3>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbf2df] text-[#a37826]">
                  <ShoppingBag size={19} />
                </div>

              </div>

              {/* PRODUCT GRID */}

              <div className="mt-4 grid grid-cols-2 gap-3">

                {products.slice(0, 4).map((product, index) => (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    className="group rounded-2xl border border-[#eee7da] bg-[#fffdfa] p-3 transition hover:-translate-y-1 hover:border-[#d8bd7d] hover:shadow-[0_15px_30px_rgba(73,52,19,0.08)]"
                  >

                    <div
                      className={`relative flex h-[145px] items-center justify-center overflow-hidden rounded-xl ${
                        index === 0
                          ? "bg-[#f4e8cc]"
                          : index === 1
                            ? "bg-[#eee9e0]"
                            : index === 2
                              ? "bg-[#eee1d4]"
                              : "bg-[#f1e8da]"
                      }`}
                    >

                      <span className="text-[65px] transition duration-300 group-hover:scale-110">
                        {product.emoji}
                      </span>

                      <span className="absolute left-2 top-2 rounded-md bg-[#c79a3b] px-2 py-1 text-[7px] font-black text-white">
                        {product.tag}
                      </span>

                      <button
                        onClick={(e) => e.preventDefault()}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#7d7467] shadow-sm"
                        aria-label="Wishlist"
                      >
                        <Heart size={13} />
                      </button>

                    </div>

                    <p className="mt-3 text-[9px] font-bold uppercase tracking-wide text-[#a47a29]">
                      {product.category}
                    </p>

                    <h4 className="mt-1 truncate text-[12px] font-black">
                      {product.name}
                    </h4>

                    <div className="mt-2 flex items-center gap-1">
                      <Star
                        size={11}
                        fill="currentColor"
                        className="text-[#d19e37]"
                      />

                      <span className="text-[9px] font-bold">
                        {product.rating}
                      </span>

                      <span className="text-[8px] text-[#999083]">
                        ({product.reviews})
                      </span>
                    </div>

                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-sm font-black">
                        {product.price}
                      </span>

                      <span className="text-[9px] text-[#aaa194] line-through">
                        {product.originalPrice}
                      </span>
                    </div>

                  </Link>
                ))}

              </div>

              {/* MATCH STRIP */}

              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f8f1e4] px-4 py-3">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c79a3b] text-white">
                    <Sparkles size={14} />
                  </div>

                  <div>
                    <p className="text-[8px] font-bold text-[#968a78]">
                      Smart recommendation
                    </p>

                    <p className="text-[10px] font-black text-[#51483b]">
                      Find products that match you
                    </p>
                  </div>

                </div>

                <Link
                  href="/primematch"
                  className="flex h-8 items-center gap-1 rounded-lg bg-white px-3 text-[9px] font-black text-[#9a7127] shadow-sm"
                >
                  Try it
                  <ArrowRight size={12} />
                </Link>

              </div>

            </motion.div>

            {/* FLOATING BADGE */}

            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -left-2 top-10 hidden items-center gap-2 rounded-2xl border border-[#e7dccb] bg-white px-3 py-2.5 shadow-[0_15px_35px_rgba(60,44,19,0.12)] sm:flex lg:-left-8"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbf0d7] text-lg">
                💰
              </div>

              <div>
                <p className="text-[8px] text-[#93897b]">
                  Smart Budget
                </p>

                <p className="text-xs font-black">
                  ₹30,000
                </p>
              </div>

            </motion.div>

            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -right-2 bottom-10 hidden items-center gap-2 rounded-2xl border border-[#e7dccb] bg-white px-3 py-2.5 shadow-[0_15px_35px_rgba(60,44,19,0.12)] sm:flex lg:-right-8"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbf0d7] text-lg">
                ⭐
              </div>

              <div>
                <p className="text-[8px] text-[#93897b]">
                  PrimePoints
                </p>

                <p className="text-xs font-black text-[#a27727]">
                  +120 earned
                </p>
              </div>

            </motion.div>

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          SHOPPING BENEFITS
      ===================================================== */}

      <section className="border-b border-[#eee5d6] bg-white">

        <div className="mx-auto grid max-w-[1400px] grid-cols-2 md:grid-cols-4">

          {benefits.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                }}
                className={`flex gap-3 px-5 py-6 sm:px-8 ${
                  index < 3
                    ? "border-r border-[#eee7da]"
                    : ""
                }`}
              >

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fbf1dc] text-[#a37826]">
                  <Icon size={19} />
                </div>

                <div>
                  <h3 className="text-[12px] font-black">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-[9px] leading-4 text-[#8b8276]">
                    {item.text}
                  </p>
                </div>

              </motion.div>
            );
          })}

        </div>

      </section>

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <section
        id="categories"
        className="py-20 sm:py-24"
      >

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
            }}
            className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
          >

            <div>

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a37826]">
                SHOP BY CATEGORY
              </span>

              <h2 className="mt-3 text-[38px] font-black leading-[1.04] tracking-[-2px] sm:text-[52px]">
                Find what
                <br />
                <span className="text-[#b8872d]">
                  you need.
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-[#7d7468]">
                Explore popular categories and discover products for
                everyday life, work, entertainment and more.
              </p>

            </div>

            <Link
              href="/categories"
              className="group flex w-fit items-center gap-2 rounded-xl border border-[#ded2bf] bg-white px-4 py-3 text-xs font-black text-[#5e5549] transition hover:border-[#c79a3b] hover:text-[#9a7127]"
            >
              View all categories
              <ArrowRight
                size={14}
                className="transition group-hover:translate-x-1"
              />
            </Link>

          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.05,
            }}
            className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >

            {categories.map((category) => (
              <motion.div
                key={category.slug}
                variants={scaleIn}
                whileHover={{
                  y: -5,
                }}
              >

                <Link
                  href={`/categories/${category.slug}`}
                  className="group block overflow-hidden rounded-[20px] border border-[#e9dfcf] bg-white p-4 transition duration-300 hover:border-[#d5b66d] hover:shadow-[0_18px_40px_rgba(70,51,18,0.08)]"
                >

                  <div className="flex items-start justify-between">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#faf4e7] text-[32px] transition duration-300 group-hover:scale-105 group-hover:bg-[#f6ead0]">
                      {category.icon}
                    </div>

                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#faf7f1] text-[#a37826] transition group-hover:bg-[#c79a3b] group-hover:text-white">
                      <ArrowRight size={13} />
                    </div>

                  </div>

                  <h3 className="mt-5 text-[13px] font-black">
                    {category.name}
                  </h3>

                  <p className="mt-1 text-[9px] leading-4 text-[#92897c]">
                    {category.subtitle}
                  </p>

                </Link>

              </motion.div>
            ))}

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          FEATURED PRODUCTS
      ===================================================== */}

      <section className="border-y border-[#eee5d6] bg-[#faf6ef] py-20 sm:py-24">

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a37826]">
                FEATURED PRODUCTS
              </span>

              <h2 className="mt-3 text-[38px] font-black tracking-[-2px] sm:text-[50px]">
                Trending
                <span className="text-[#b8872d]">
                  {" "}right now.
                </span>
              </h2>

            </div>

            <Link
              href="/products"
              className="group flex w-fit items-center gap-2 rounded-xl border border-[#ded2bf] bg-white px-4 py-3 text-xs font-black text-[#5e5549] transition hover:border-[#c79a3b] hover:text-[#9a7127]"
            >
              View all products
              <ArrowRight
                size={14}
                className="transition group-hover:translate-x-1"
              />
            </Link>

          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.05,
            }}
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >

            {products.map((product) => (
              <motion.div
                key={product.slug}
                variants={fadeUp}
                whileHover={{
                  y: -6,
                }}
                className="group overflow-hidden rounded-[22px] border border-[#e8dfd1] bg-white transition hover:border-[#d4b46b] hover:shadow-[0_20px_45px_rgba(69,49,18,0.09)]"
              >

                <div className="relative flex h-[230px] items-center justify-center bg-[#f7f1e6]">

                  <span className="text-[105px] transition duration-500 group-hover:scale-110">
                    {product.emoji}
                  </span>

                  <span className="absolute left-3 top-3 rounded-lg bg-[#c79a3b] px-2.5 py-1.5 text-[8px] font-black text-white">
                    {product.discount}
                  </span>

                  <button
                    type="button"
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#7f7669] shadow-sm transition hover:bg-[#fbf0d9] hover:text-[#b8872d]"
                    aria-label="Add to wishlist"
                  >
                    <Heart size={16} />
                  </button>

                </div>

                <div className="p-4">

                  <div className="flex items-center justify-between gap-2">

                    <span className="text-[9px] font-black uppercase tracking-wide text-[#a37826]">
                      {product.category}
                    </span>

                    <div className="flex items-center gap-1 text-[9px] font-bold">
                      <Star
                        size={11}
                        fill="currentColor"
                        className="text-[#d09c35]"
                      />
                      {product.rating}
                    </div>

                  </div>

                  <h3 className="mt-2 truncate text-sm font-black">
                    {product.name}
                  </h3>

                  <div className="mt-3 flex items-end gap-2">

                    <span className="text-lg font-black">
                      {product.price}
                    </span>

                    <span className="text-[10px] text-[#a49a8d] line-through">
                      {product.originalPrice}
                    </span>

                  </div>

                  <div className="mt-4 flex gap-2">

                    <Link
                      href={`/products/${product.slug}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#dfd3c0] px-3 py-2.5 text-[10px] font-black text-[#62594c] transition hover:border-[#c79a3b] hover:text-[#9a7127]"
                    >
                      View Details
                    </Link>

                    <Link
                      href="/cart"
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c79a3b] text-white transition hover:bg-[#ae7d25]"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart size={15} />
                    </Link>

                  </div>

                </div>

              </motion.div>
            ))}

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          DEAL BANNERS
      ===================================================== */}

      <section
        id="deals"
        className="py-20 sm:py-24"
      >

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

          <div className="flex items-end justify-between gap-4">

            <div>

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a37826]">
                SPECIAL OFFERS
              </span>

              <h2 className="mt-3 text-[38px] font-black tracking-[-2px] sm:text-[50px]">
                Deals made
                <span className="text-[#b8872d]">
                  {" "}for you.
                </span>
              </h2>

            </div>

            <div className="hidden items-center gap-2 rounded-xl bg-[#fbf1dc] px-3 py-2 text-[10px] font-black text-[#956d24] sm:flex">
              <Clock3 size={14} />
              Limited time offers
            </div>

          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">

            {deals.map((deal, index) => (
              <motion.div
                key={deal.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                }}
                whileHover={{
                  y: -5,
                }}
                className={`relative overflow-hidden rounded-[25px] border p-7 ${
                  index === 1
                    ? "border-[#e3cf9f] bg-[#f4e5c3]"
                    : index === 2
                      ? "border-[#e7dccb] bg-[#f3eee5]"
                      : "border-[#e7d6b3] bg-[#f8efd9]"
                }`}
              >

                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-[#b8872d]/10" />

                <div className="relative">

                  <div className="flex items-start justify-between">

                    <span className="text-5xl">
                      {deal.icon}
                    </span>

                    <span className="rounded-lg bg-white/70 px-2.5 py-1.5 text-[8px] font-black uppercase text-[#9b7227]">
                      Special
                    </span>

                  </div>

                  <h3 className="mt-7 text-[23px] font-black tracking-tight">
                    {deal.title}
                  </h3>

                  <p className="mt-2 max-w-[280px] text-xs leading-5 text-[#766c5d]">
                    {deal.subtitle}
                  </p>

                  <Link
                    href={deal.href}
                    className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-[#c79a3b] px-4 py-3 text-xs font-black text-white transition hover:bg-[#ae7d25]"
                  >
                    {deal.button}
                    <ArrowRight
                      size={14}
                      className="transition group-hover:translate-x-1"
                    />
                  </Link>

                </div>

              </motion.div>
            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          PRIMEMATCH
      ===================================================== */}

      <section
        id="features"
        className="px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8"
      >

        <div className="mx-auto max-w-[1400px]">

          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
            }}
            className="relative overflow-hidden rounded-[30px] border border-[#dfca9a] bg-gradient-to-br from-[#f7ecd5] via-[#f1dfb9] to-[#e7cf9b]"
          >

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[#a47b2b]/10" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-[#a47b2b]/10" />

            <div className="relative grid items-center gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_0.9fr] lg:p-14">

              <div>

                <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-[9px] font-black uppercase tracking-[0.15em] text-[#916b28]">
                  <Sparkles size={12} />
                  Smart shopping
                </span>

                <h2 className="mt-5 text-[40px] font-black leading-[1.02] tracking-[-2px] sm:text-[54px]">
                  Meet
                  <br />
                  <span className="text-[#a87824]">
                    PrimeMatch.
                  </span>
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-[#6f624e]">
                  Not sure what to buy? Tell PrimeMatch your requirements,
                  budget and priorities. Get a simpler way to discover
                  products that fit your shopping goal.
                </p>

                <div className="mt-7 grid gap-2 sm:grid-cols-2">

                  {[
                    "Budget-aware discovery",
                    "Need-based suggestions",
                    "Compare relevant products",
                    "Save time while shopping",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-xs font-bold text-[#675a48]"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#b8872d]">
                        <Check size={12} />
                      </span>
                      {item}
                    </div>
                  ))}

                </div>

                <Link
                  href="/primematch"
                  className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-[#c79a3b] px-5 py-3.5 text-sm font-black text-white shadow-[0_10px_25px_rgba(145,103,31,0.18)] transition hover:-translate-y-1 hover:bg-[#ae7d25]"
                >
                  Try PrimeMatch
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>

              </div>

              {/* PRIMEMATCH VISUAL */}

              <div className="relative flex min-h-[360px] items-center justify-center">

                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 28,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute h-[300px] w-[300px] rounded-full border border-[#9f772c]/15"
                />

                <motion.div
                  animate={{
                    rotate: -360,
                  }}
                  transition={{
                    duration: 38,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute h-[230px] w-[230px] rounded-full border border-[#9f772c]/15"
                />

                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="relative z-10 flex h-36 w-36 items-center justify-center rounded-full border border-[#c49b4b] bg-white text-[#b8872d] shadow-[0_25px_60px_rgba(100,72,20,0.16)]"
                >
                  <Brain size={52} />
                </motion.div>

                <div className="absolute left-2 top-12 rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm backdrop-blur-md sm:left-8">

                  <p className="text-[8px] text-[#928573]">
                    Shopping goal
                  </p>

                  <p className="mt-1 text-xs font-black">
                    Gaming Setup
                  </p>

                </div>

                <div className="absolute right-0 top-[42%] rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm backdrop-blur-md sm:right-4">

                  <p className="text-[8px] text-[#928573]">
                    Budget
                  </p>

                  <p className="mt-1 text-xs font-black">
                    ₹50,000
                  </p>

                </div>

                <div className="absolute bottom-7 left-10 rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm backdrop-blur-md sm:left-16">

                  <p className="text-[8px] text-[#928573]">
                    Match score
                  </p>

                  <p className="mt-1 text-xs font-black text-[#a87824]">
                    96%
                  </p>

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          SMART FEATURES
      ===================================================== */}

      <section className="border-y border-[#eee5d6] bg-[#faf7f1] py-20 sm:py-24">

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
            }}
            className="mx-auto max-w-2xl text-center"
          >

            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a37826]">
              MORE THAN A STORE
            </span>

            <h2 className="mt-3 text-[38px] font-black tracking-[-2px] sm:text-[52px]">
              Shopping tools
              <br />
              <span className="text-[#b8872d]">
                built for you.
              </span>
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#7c7468]">
              PrimeCart brings useful tools together so your shopping
              experience feels simpler and more personal.
            </p>

          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
            }}
            className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >

            {smartFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  whileHover={{
                    y: -6,
                  }}
                  className="group rounded-[23px] border border-[#e7ddce] bg-white p-6 transition hover:border-[#d4b56b] hover:shadow-[0_20px_45px_rgba(68,49,18,0.08)]"
                >

                  <div className="flex items-start justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbf0d9] text-[#a37826] transition group-hover:bg-[#c79a3b] group-hover:text-white">
                      <Icon size={21} />
                    </div>

                    <span className="rounded-lg bg-[#faf7f1] px-2 py-1.5 text-[7px] font-black uppercase tracking-wide text-[#958a7b]">
                      {feature.tag}
                    </span>

                  </div>

                  <h3 className="mt-6 text-[18px] font-black">
                    {feature.title}
                  </h3>

                  <p className="mt-2.5 text-[11px] leading-6 text-[#7e7569]">
                    {feature.text}
                  </p>

                  <Link
                    href="/auth/register"
                    className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-black text-[#a37826]"
                  >
                    Explore
                    <ArrowRight size={13} />
                  </Link>

                </motion.div>
              );
            })}

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="how"
        className="py-20 sm:py-24"
      >

        <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">

          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
            }}
          >

            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a37826]">
              HOW IT WORKS
            </span>

            <h2 className="mt-4 text-[40px] font-black leading-[1.03] tracking-[-2px] sm:text-[54px]">
              Simple shopping.
              <br />
              <span className="text-[#b8872d]">
                Better decisions.
              </span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#7b7266]">
              From discovering products to placing your order, PrimeCart
              keeps your shopping journey simple and easy to understand.
            </p>

            <Link
              href="/auth/register"
              className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-[#c79a3b] px-5 py-3.5 text-sm font-black text-white shadow-[0_10px_25px_rgba(184,135,45,0.18)] transition hover:-translate-y-1 hover:bg-[#ae7d25]"
            >
              Get Started
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </Link>

          </motion.div>

          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
            }}
            className="relative"
          >

            <div className="absolute bottom-8 left-[25px] top-8 w-px bg-[#dfd2bd]" />

            <div className="space-y-3">

              {steps.map((step) => (
                <motion.div
                  key={step.number}
                  whileHover={{
                    x: 5,
                  }}
                  className="relative flex gap-5 rounded-[22px] border border-transparent p-5 transition hover:border-[#eadfcd] hover:bg-[#fcfaf6] sm:gap-7 sm:p-7"
                >

                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#ddcba6] bg-[#fbf0d9] text-[10px] font-black text-[#987127]">
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

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="pb-20 sm:pb-24">

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
            }}
            className="relative overflow-hidden rounded-[30px] border border-[#dfc891] bg-gradient-to-br from-[#f8edda] via-[#f1dfb9] to-[#e6cb91] px-6 py-16 text-center sm:px-10 sm:py-20"
          >

            <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full border border-[#a37826]/10" />
            <div className="absolute -bottom-36 -right-24 h-80 w-80 rounded-full border border-[#a37826]/10" />

            <div className="relative mx-auto max-w-2xl">

              <span className="inline-flex items-center gap-2 rounded-full bg-white/65 px-3 py-2 text-[9px] font-black uppercase tracking-[0.15em] text-[#916b28]">
                <Sparkles size={12} />
                Your next shopping experience
              </span>

              <h2 className="mt-5 text-[39px] font-black leading-[1.03] tracking-[-2px] sm:text-[57px]">
                Ready to shop
                <br />
                <span className="text-[#a87824]">
                  smarter?
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#74684f]">
                Discover products, explore deals and find a shopping
                experience designed around you.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">

                <Link
                  href="/auth/register"
                  className="group flex items-center gap-2 rounded-xl bg-[#c79a3b] px-6 py-3.5 text-sm font-black text-white shadow-[0_12px_30px_rgba(120,86,25,0.18)] transition hover:-translate-y-1 hover:bg-[#ae7d25]"
                >
                  Create Account
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/products"
                  className="flex items-center gap-2 rounded-xl border border-[#cdb887] bg-white/70 px-6 py-3.5 text-sm font-black text-[#645744] transition hover:bg-white"
                >
                  Browse Products
                  <ShoppingBag size={16} />
                </Link>

              </div>

            </div>

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[#e7ddce] bg-[#faf6ef]">

        <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-8">

          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">

            {/* BRAND */}

            <div>

              <Link
                href="/"
                className="flex items-center gap-2.5"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c79a3b] text-white">
                  <Sparkles size={18} />
                </div>

                <div className="text-xl font-black tracking-tight">
                  Prime<span className="text-[#b8872d]">
                    Cart
                  </span>
                </div>

              </Link>

              <p className="mt-5 max-w-sm text-xs leading-6 text-[#807668]">
                A modern shopping experience built around better product
                discovery, useful deals and smarter choices.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">

                {[
                  "Secure Shopping",
                  "Easy Returns",
                  "Smart Discovery",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-[#e3d8c6] bg-white px-2.5 py-1.5 text-[8px] font-bold text-[#756b5d]"
                  >
                    ✓ {item}
                  </span>
                ))}

              </div>

            </div>

            <FooterColumn
              title="Shop"
              links={[
                ["All Products", "/products"],
                ["Categories", "/categories"],
                ["Today's Deals", "#deals"],
                ["Featured", "/products"],
              ]}
            />

            <FooterColumn
              title="PrimeCart"
              links={[
                ["PrimeMatch", "/primematch"],
                ["Budget Builder", "/auth/register"],
                ["PrimePoints", "/auth/register"],
                ["How It Works", "#how"],
              ]}
            />

            <FooterColumn
              title="Account"
              links={[
                ["Login", "/auth/login"],
                ["Create Account", "/auth/register"],
                ["Wishlist", "/wishlist"],
                ["Cart", "/cart"],
              ]}
            />

          </div>

          <div className="mt-12 flex flex-col justify-between gap-3 border-t border-[#e3d8c7] pt-6 text-[10px] text-[#958a7c] sm:flex-row">

            <span>
              © 2026 PrimeCart. All rights reserved.
            </span>

            <span>
              Shop smarter. Discover better.
            </span>

          </div>

        </div>

      </footer>

    </main>
  );
}

/* =========================================================
   FOOTER COLUMN
========================================================= */

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>

      <h4 className="text-[10px] font-black uppercase tracking-[0.16em] text-[#a37826]">
        {title}
      </h4>

      <div className="mt-5 flex flex-col gap-3">

        {links.map(([label, href]) => (
          <Link
            key={label}
            href={href}
            className="w-fit text-xs text-[#756b5d] transition hover:text-[#b8872d]"
          >
            {label}
          </Link>
        ))}

      </div>

    </div>
  );
}
