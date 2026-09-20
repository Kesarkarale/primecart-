"use client";

import Link from "next/link";
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
} from "lucide-react";

const categories = [
  {
    name: "Home & Living",
    slug: "home-living",
    description: "Furniture, decor, kitchen and everyday essentials",
    icon: Home,
  },
  {
    name: "Mobile",
    slug: "mobile",
    description: "Smartphones, accessories and mobile essentials",
    icon: Smartphone,
  },
  {
    name: "Appliance",
    slug: "appliance",
    description: "Smart and useful home appliances",
    icon: WashingMachine,
  },
  {
    name: "Footwear",
    slug: "footwear",
    description: "Shoes, sneakers, sandals and more",
    icon: Footprints,
  },
  {
    name: "Watch",
    slug: "watch",
    description: "Smart watches and classic timepieces",
    icon: Watch,
  },
  {
    name: "Bag",
    slug: "bag",
    description: "Backpacks, handbags and travel bags",
    icon: ShoppingBag,
  },
  {
    name: "Toy & Baby",
    slug: "toy-baby",
    description: "Toys, baby products and kids essentials",
    icon: Baby,
  },
  {
    name: "Automotive",
    slug: "automotive",
    description: "Car and bike accessories",
    icon: Car,
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Clothing, accessories and lifestyle fashion",
    icon: Shirt,
  },
  {
    name: "Gaming",
    slug: "gaming",
    description: "Gaming accessories and entertainment gear",
    icon: Gamepad2,
  },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a227] font-black text-white shadow-sm">
              P
            </div>

            <div>
              <div className="text-xl font-black tracking-tight">
                Prime<span className="text-[#b08a00]">Cart</span>
              </div>
              <div className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 sm:block">
                Shop Smarter
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/dashboard/products"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-[#faf8f3] hover:text-black"
            >
              Products
            </Link>

            <Link
              href="/dashboard/categories"
              className="rounded-xl bg-[#f8f1d9] px-4 py-2.5 text-sm font-bold text-[#8d6d00]"
            >
              Categories
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#c9a227]"
            >
              Dashboard
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        {/* BREADCRUMB */}
        <div className="mb-7 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-black">
            Dashboard
          </Link>

          <ChevronRight size={15} />

          <span className="font-semibold text-gray-900">
            Categories
          </span>
        </div>

        {/* TITLE */}
        <section className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#c9a227]/20 bg-[#fffaf0] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#9a7800]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9a227]" />
            Explore Categories
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Shop by <span className="text-[#b08a00]">Category</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Discover products organized around the things you shop for most.
            Choose a category to explore all available products.
          </p>
        </section>

        {/* CATEGORY GRID */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.slug}
                href={`/dashboard/categories/${category.slug}`}
                className="group"
              >
                <div className="relative h-full overflow-hidden rounded-3xl border border-black/[0.07] bg-white p-6 shadow-[0_8px_35px_rgba(0,0,0,0.035)] transition duration-300 hover:-translate-y-1 hover:border-[#c9a227]/40 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
                  {/* GOLD GLOW */}
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#c9a227]/10 blur-2xl transition group-hover:bg-[#c9a227]/20" />

                  <div className="relative flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#faf6e8] text-[#b08a00] transition group-hover:bg-[#c9a227] group-hover:text-white">
                      <Icon size={27} strokeWidth={1.8} />
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.06] text-gray-400 transition group-hover:border-[#c9a227]/30 group-hover:bg-[#fffaf0] group-hover:text-[#a27c00]">
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>

                  <div className="relative mt-6">
                    <h2 className="text-xl font-extrabold tracking-tight">
                      {category.name}
                    </h2>

                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
                      {category.description}
                    </p>
                  </div>

                  <div className="relative mt-6 flex items-center gap-2 text-sm font-bold text-[#a17b00]">
                    Explore products
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
