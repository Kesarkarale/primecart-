"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Home,
  Smartphone,
  WashingMachine,
  Footprints,
  Watch,
  ShoppingBag,
  Baby,
  Car,
  Shirt,
  Gamepad2,
  Search,
  X,
  Sparkles,
  Grid3X3,
} from "lucide-react";

const categories = [
  {
    name: "Home & Living",
    slug: "home-living",
    description: "Furniture, decor, kitchen and everyday essentials",
    icon: Home,
    label: "Everyday Essentials",
  },
  {
    name: "Mobile",
    slug: "mobile",
    description: "Smartphones, accessories and mobile essentials",
    icon: Smartphone,
    label: "Tech & Mobile",
  },
  {
    name: "Appliance",
    slug: "appliance",
    description: "Smart and useful home appliances",
    icon: WashingMachine,
    label: "Smart Appliances",
  },
  {
    name: "Footwear",
    slug: "footwear",
    description: "Shoes, sneakers, sandals and more",
    icon: Footprints,
    label: "Shoes & Sneakers",
  },
  {
    name: "Watch",
    slug: "watch",
    description: "Smart watches and classic timepieces",
    icon: Watch,
    label: "Timepieces",
  },
  {
    name: "Bag",
    slug: "bag",
    description: "Backpacks, handbags and travel bags",
    icon: ShoppingBag,
    label: "Bags & Travel",
  },
  {
    name: "Toy & Baby",
    slug: "toy-baby",
    description: "Toys, baby products and kids essentials",
    icon: Baby,
    label: "Kids & Baby",
  },
  {
    name: "Automotive",
    slug: "automotive",
    description: "Car and bike accessories",
    icon: Car,
    label: "Auto Essentials",
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Clothing, accessories and lifestyle fashion",
    icon: Shirt,
    label: "Style & Fashion",
  },
  {
    name: "Gaming",
    slug: "gaming",
    description: "Gaming accessories and entertainment gear",
    icon: Gamepad2,
    label: "Gaming Gear",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) => {
      return (
        category.name.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query) ||
        category.label.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* =========================================================
          HEADER
      ========================================================= */}
      <header className="sticky top-0 z-50 border-b border-[#e8dfcf] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* LOGO */}
          <Link
            href="/dashboard"
            className="group flex items-center gap-3"
            aria-label="PrimeCart Dashboard"
          >
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#d5b347] via-[#c9a227] to-[#a98513] text-white shadow-[0_7px_20px_rgba(185,145,35,0.22)]">
              <span className="relative z-10 text-lg font-black">P</span>

              <div className="absolute -right-3 -top-3 h-7 w-7 rounded-full bg-white/20 blur-md" />
            </div>

            <div>
              <div className="text-xl font-black tracking-tight text-[#171717]">
                Prime<span className="text-[#b08a00]">Cart</span>
              </div>

              <div className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a39b8d] sm:block">
                Shop Smarter
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#746f66] transition hover:bg-[#faf8f3] hover:text-[#171717]"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/products"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#746f66] transition hover:bg-[#faf8f3] hover:text-[#171717]"
            >
              Products
            </Link>

            <Link
              href="/dashboard/categories"
              className="rounded-xl border border-[#d9bd67]/30 bg-[#fff8df] px-4 py-2.5 text-sm font-bold text-[#8d6d00] shadow-sm"
            >
              Categories
            </Link>

            <Link
              href="/dashboard"
              className="ml-1 flex items-center gap-2 rounded-xl bg-[#171717] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#b08a00]"
            >
              Dashboard
              <ArrowRight size={15} />
            </Link>
          </nav>

          {/* MOBILE DASHBOARD BUTTON */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-[#fff8df] px-3.5 py-2.5 text-sm font-bold text-[#8d6d00] md:hidden"
          >
            <Home size={16} />
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* =========================================================
          PAGE CONTENT
      ========================================================= */}
      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
        {/* BREADCRUMB */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-7 flex items-center gap-2 text-sm"
        >
          <Link
            href="/dashboard"
            className="font-medium text-[#8b857a] transition hover:text-[#9b7600]"
          >
            Dashboard
          </Link>

          <ChevronRight size={15} className="text-[#b8b1a5]" />

          <span className="font-semibold text-[#332f29]">
            Categories
          </span>
        </motion.div>

        {/* =======================================================
            HERO / TITLE
        ======================================================= */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-9 overflow-hidden rounded-[28px] border border-[#eadfc9] bg-white px-6 py-7 shadow-[0_10px_40px_rgba(80,65,35,0.045)] sm:px-8 sm:py-8 lg:px-10"
        >
          {/* BACKGROUND DECOR */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#d4b13f]/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 right-48 h-48 w-48 rounded-full bg-[#d4b13f]/[0.06] blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            {/* TITLE */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d6bd70]/35 bg-[#fffaf0] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#9a7800]">
                <Sparkles size={13} />
                Explore Categories
              </div>

              <h1 className="text-3xl font-black tracking-[-0.03em] text-[#171717] sm:text-4xl lg:text-5xl">
                Shop by{" "}
                <span className="bg-gradient-to-r from-[#b08a00] to-[#c6a334] bg-clip-text text-transparent">
                  Category
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#787268] sm:text-base">
                Discover products organized around the things you shop for
                most. Choose a category and explore everything available on
                PrimeCart.
              </p>
            </div>

            {/* CATEGORY COUNT */}
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff8df] text-[#a17c00]">
                <Grid3X3 size={21} />
              </div>

              <div>
                <div className="text-2xl font-black text-[#29251f]">
                  {categories.length}
                </div>

                <div className="text-xs font-semibold text-[#918a7e]">
                  Shopping Categories
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* =======================================================
            SEARCH BAR
        ======================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mb-7"
        >
          <div className="relative max-w-2xl">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a59e92]"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search categories..."
              aria-label="Search categories"
              className="h-14 w-full rounded-2xl border border-[#e4dac6] bg-white pl-12 pr-12 text-sm font-medium text-[#29251f] outline-none shadow-[0_6px_25px_rgba(70,55,30,0.035)] transition placeholder:text-[#aaa397] focus:border-[#c9a227]/60 focus:ring-4 focus:ring-[#c9a227]/10"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#91897c] transition hover:bg-[#faf6e8] hover:text-[#8d6d00]"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </motion.div>

        {/* =======================================================
            SEARCH RESULT INFO
        ======================================================= */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-center justify-between gap-3"
          >
            <p className="text-sm font-medium text-[#7d766c]">
              Showing{" "}
              <span className="font-bold text-[#29251f]">
                {filteredCategories.length}
              </span>{" "}
              {filteredCategories.length === 1 ? "category" : "categories"}{" "}
              for{" "}
              <span className="font-bold text-[#9b7600]">
                &quot;{searchQuery}&quot;
              </span>
            </p>
          </motion.div>
        )}

        {/* =======================================================
            CATEGORY GRID
        ======================================================= */}
        {filteredCategories.length > 0 ? (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredCategories.map((category) => {
              const Icon = category.icon;

              return (
                <motion.div
                  key={category.slug}
                  variants={cardVariants}
                  className="h-full"
                >
                  <Link
                    href={`/dashboard/categories/${category.slug}`}
                    className="group block h-full"
                  >
                    <article className="relative flex h-full min-h-[285px] flex-col overflow-hidden rounded-[26px] border border-[#e7dfd1] bg-white p-6 shadow-[0_8px_35px_rgba(80,65,35,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#d3b45c]/50 hover:shadow-[0_20px_50px_rgba(100,75,20,0.10)]">
                      {/* GOLD GLOW */}
                      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#c9a227]/[0.08] blur-2xl transition duration-500 group-hover:bg-[#c9a227]/[0.17]" />

                      {/* DECORATIVE LINE */}
                      <div className="absolute left-0 top-0 h-1 w-0 bg-gradient-to-r from-[#b08a00] to-[#e0c768] transition-all duration-500 group-hover:w-full" />

                      {/* TOP ROW */}
                      <div className="relative flex items-start justify-between">
                        <div className="relative flex h-[60px] w-[60px] items-center justify-center rounded-[19px] border border-[#e8dcb9] bg-gradient-to-br from-[#fffaf0] to-[#faf3dc] text-[#aa8500] transition-all duration-300 group-hover:border-[#c9a227]/30 group-hover:bg-gradient-to-br group-hover:from-[#c9a227] group-hover:to-[#a98208] group-hover:text-white group-hover:shadow-[0_10px_25px_rgba(190,150,35,0.22)]">
                          <Icon
                            size={28}
                            strokeWidth={1.8}
                            className="transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e7e0d5] bg-white text-[#a8a094] transition-all duration-300 group-hover:border-[#d7bd68]/40 group-hover:bg-[#fffaf0] group-hover:text-[#a17b00]">
                          <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-0.5"
                          />
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="relative mt-6 flex-1">
                        <div className="mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#aa8b31]">
                            {category.label}
                          </span>
                        </div>

                        <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#25221d] transition-colors duration-300 group-hover:text-[#9b7600]">
                          {category.name}
                        </h2>

                        <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#817b72]">
                          {category.description}
                        </p>
                      </div>

                      {/* FOOTER */}
                      <div className="relative mt-6 flex items-center justify-between border-t border-[#eee8de] pt-5">
                        <span className="text-sm font-bold text-[#9e7a08]">
                          Explore products
                        </span>

                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff8df] text-[#a17b00] transition-all duration-300 group-hover:bg-[#c9a227] group-hover:text-white">
                          <ArrowRight
                            size={15}
                            className="transition-transform duration-300 group-hover:translate-x-0.5"
                          />
                        </span>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              );
            })}
          </motion.section>
        ) : (
          /* =====================================================
             EMPTY SEARCH STATE
          ===================================================== */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-[#e7dfd1] bg-white px-6 py-16 text-center shadow-[0_8px_35px_rgba(80,65,35,0.035)]"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff8df] text-[#a27c00]">
              <Search size={27} />
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-[#29251f]">
              No categories found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#837c72]">
              We couldn&apos;t find a category matching{" "}
              <span className="font-bold text-[#9b7600]">
                &quot;{searchQuery}&quot;
              </span>
              .
            </p>

            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#171717] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#b08a00]"
            >
              <X size={16} />
              Clear Search
            </button>
          </motion.div>
        )}

        {/* =======================================================
            BOTTOM INFO
        ======================================================= */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mt-8 overflow-hidden rounded-[24px] border border-[#eadfc9] bg-gradient-to-r from-[#fffdf8] via-white to-[#fffaf0] p-6 sm:p-7"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#9a7800]">
                <Sparkles size={16} />
                PrimeCart Collections
              </div>

              <h3 className="mt-1 text-lg font-extrabold text-[#29251f]">
                Find what you need, faster.
              </h3>

              <p className="mt-1 max-w-xl text-sm leading-6 text-[#817b72]">
                Explore products across all PrimeCart categories and discover
                items that fit your shopping needs.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#b08a00]"
            >
              View All Products
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
