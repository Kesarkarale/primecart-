"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Star,
  Zap,
  Sparkles,
  Clock3,
  Tag,
  Gift,
} from "lucide-react";

/* =========================================================
   DATA
========================================================= */

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    image: "/electronics.png",
    count: "2500+ Products",
  },
  {
    name: "Fashion",
    slug: "fashion",
    image: "/fashion.png",
    count: "1800+ Products",
  },
  {
    name: "Watches",
    slug: "watches",
    image: "/watch.png",
    count: "1200+ Products",
  },
  {
    name: "Beauty",
    slug: "beauty",
    image: "/beauty.png",
    count: "800+ Products",
  },
  {
    name: "Home & Living",
    slug: "home-and-living",
    image: "/home.png",
    count: "1500+ Products",
  },
  {
    name: "Gaming",
    slug: "gaming",
    image: "/gaming.png",
    count: "950+ Products",
  },
];

const products = [
  {
    id: 1,
    name: "Smartphone X Pro",
    slug: "smartphone-x-pro",
    category: "Electronics",
    image: "/products/smartphone-x-pro.png",
    price: "₹29,999",
    oldPrice: "₹39,999",
    discount: "25% OFF",
    rating: "4.8",
    reviews: "1,248",
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "Wireless Headphones",
    slug: "wireless-headphones",
    category: "Electronics",
    image: "/products/wireless-headphones.png",
    price: "₹2,499",
    oldPrice: "₹4,999",
    discount: "50% OFF",
    rating: "4.7",
    reviews: "892",
    badge: "Hot Deal",
  },
  {
    id: 3,
    name: "Premium Denim Jacket",
    slug: "denim-jacket",
    category: "Fashion",
    image: "/products/denim-jacket.png",
    price: "₹1,799",
    oldPrice: "₹3,499",
    discount: "49% OFF",
    rating: "4.6",
    reviews: "641",
    badge: "Trending",
  },
  {
    id: 4,
    name: "Sports Running Shoes",
    slug: "sports-running-shoes",
    category: "Footwear",
    image: "/products/sports-running-shoes.png",
    price: "₹1,999",
    oldPrice: "₹3,999",
    discount: "50% OFF",
    rating: "4.8",
    reviews: "1,104",
    badge: "Popular",
  },
];

const deals = [
  {
    name: "Smartphone X Pro",
    image: "/products/smartphone-x-pro.png",
    price: "₹29,999",
    oldPrice: "₹39,999",
    discount: "25% OFF",
  },
  {
    name: "Wireless Headphones",
    image: "/products/wireless-headphones.png",
    price: "₹2,499",
    oldPrice: "₹4,999",
    discount: "50% OFF",
  },
  {
    name: "Sports Running Shoes",
    image: "/products/sports-running-shoes.png",
    price: "₹1,999",
    oldPrice: "₹3,999",
    discount: "50% OFF",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function HomePage() {
  const [openMenu, setOpenMenu] = useState(false);
  const [categoryMenu, setCategoryMenu] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState<number[]>([]);

  const toggleWishlist = (id: number) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#faf8f3] text-[#211d17]">

      {/* =====================================================
          TOP ANNOUNCEMENT BAR
      ====================================================== */}

      <div className="bg-[#211d17] px-4 py-2 text-center text-[10px] font-medium tracking-wide text-white sm:text-[11px]">
        <span className="text-[#e1bd68]">✨</span>{" "}
        Free delivery on orders above ₹499
        <span className="mx-2 text-[#756b5d]">•</span>
        Easy Returns
        <span className="mx-2 text-[#756b5d]">•</span>
        Secure Payments
      </div>

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="sticky top-0 z-50 border-b border-[#e8dfd0] bg-white/95 backdrop-blur-xl">

        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:h-[76px] lg:px-8">

          {/* MOBILE MENU */}

          <button
            onClick={() => setOpenMenu(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e5dccd] bg-white lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* LOGO */}

          <Link href="/" className="flex shrink-0 items-center gap-2">

            <Image
              src="/logo.png"
              alt="PrimeCart"
              width={52}
              height={52}
              priority
              className="h-11 w-11 object-contain sm:h-12 sm:w-12"
            />

            <div className="hidden xs:block sm:block">
              <h1 className="text-[20px] font-bold leading-none tracking-tight text-[#211d17] sm:text-[23px]">
                Prime<span className="text-[#c79a3b]">Cart</span>
              </h1>

              <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.16em] text-[#968b7b] sm:text-[9px]">
                Premium Shopping
              </p>
            </div>

          </Link>

          {/* DESKTOP NAVIGATION */}

          <div className="ml-6 hidden items-center gap-7 lg:flex">

            <Link
              href="/"
              className="text-sm font-semibold text-[#c08d2d]"
            >
              Home
            </Link>

            <Link
              href="/dashboard/products"
              className="text-sm font-medium text-[#5e574d] transition hover:text-[#c08d2d]"
            >
              Shop
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setCategoryMenu(true)}
              onMouseLeave={() => setCategoryMenu(false)}
            >

              <button className="flex items-center gap-1 text-sm font-medium text-[#5e574d] transition hover:text-[#c08d2d]">
                Categories
                <ChevronDown size={14} />
              </button>

              {categoryMenu && (
                <div className="absolute left-1/2 top-full w-[600px] -translate-x-1/2 pt-4">
                  <div className="rounded-2xl border border-[#e6dccb] bg-white p-5 shadow-[0_20px_60px_rgba(60,45,20,0.14)]">

                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#c08d2d]">
                          Explore
                        </p>
                        <h3 className="mt-1 text-lg font-bold">
                          Shop by Category
                        </h3>
                      </div>

                      <Link
                        href="/dashboard/products"
                        className="text-xs font-semibold text-[#c08d2d]"
                      >
                        View All →
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/categories/${category.slug}`}
                          className="group rounded-xl border border-[#eee6d9] p-3 transition hover:border-[#d6b66d] hover:bg-[#fcf8ef]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf6ed]">
                              <Image
                                src={category.image}
                                alt={category.name}
                                width={44}
                                height={44}
                                className="h-full w-full object-contain p-1"
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold">
                                {category.name}
                              </p>
                              <p className="mt-1 text-[9px] text-[#958b7d]">
                                {category.count}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                  </div>
                </div>
              )}

            </div>

            <Link
              href="/products?deal=true"
              className="text-sm font-medium text-[#5e574d] transition hover:text-[#c08d2d]"
            >
              Deals
            </Link>

            <Link
              href="/dashboard/prime-match"
              className="text-sm font-medium text-[#5e574d] transition hover:text-[#c08d2d]"
            >
              PrimeMatch
            </Link>

          </div>

          {/* DESKTOP SEARCH */}

          <div className="ml-auto hidden max-w-[370px] flex-1 lg:block">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#938a7c]"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands and more..."
                className="h-11 w-full rounded-full border border-[#e3d8c6] bg-[#faf8f3] pl-11 pr-4 text-sm text-[#29241e] outline-none transition placeholder:text-[#aaa195] focus:border-[#c79a3b] focus:bg-white"
              />

            </div>

          </div>

          {/* RIGHT ACTIONS */}

          <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-4">

            <button
              onClick={() => setMobileSearch(!mobileSearch)}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-[#f5efe4] lg:hidden"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <Link
              href="/dashboard/wishlist"
              className="relative hidden h-10 w-10 items-center justify-center rounded-xl transition hover:bg-[#f5efe4] sm:flex"
              aria-label="Wishlist"
            >
              <Heart size={20} />

              {wishlist.length > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c79a3b] px-1 text-[8px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-[#f5efe4]"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />

              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c79a3b] px-1 text-[8px] font-bold text-white">
                0
              </span>
            </Link>

            <Link
              href="/auth/login"
              className="hidden h-10 items-center gap-2 rounded-xl border border-[#d8ccb9] px-5 text-sm font-semibold transition hover:border-[#c79a3b] hover:bg-[#fcf8ef] sm:flex"
            >
              <User size={16} />
              Login
            </Link>

            <Link
              href="/auth/register"
              className="hidden h-10 items-center rounded-xl bg-[#c79a3b] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#b8872d] md:flex"
            >
              Register
            </Link>

          </div>

        </div>

        {/* MOBILE SEARCH */}

        {mobileSearch && (
          <div className="border-t border-[#e8dfd0] bg-white px-4 py-3 lg:hidden">

            <div className="relative">

              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#958b7e]"
              />

              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="h-11 w-full rounded-full border border-[#dfd4c2] bg-[#faf8f3] pl-11 pr-4 text-sm outline-none focus:border-[#c79a3b]"
              />

            </div>

          </div>
        )}

      </nav>

      {/* =====================================================
          MOBILE DRAWER
      ====================================================== */}

      {openMenu && (
        <div className="fixed inset-0 z-[100] lg:hidden">

          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setOpenMenu(false)}
          />

          <aside className="absolute left-0 top-0 flex h-full w-[86%] max-w-[350px] flex-col bg-[#fffdf9] shadow-2xl">

            <div className="flex items-center justify-between border-b border-[#e8dfd0] px-5 py-5">

              <Link
                href="/"
                onClick={() => setOpenMenu(false)}
                className="flex items-center gap-2"
              >

                <Image
                  src="/logo.png"
                  alt="PrimeCart"
                  width={45}
                  height={45}
                  className="h-10 w-10 object-contain"
                />

                <div>
                  <p className="text-lg font-bold">
                    Prime<span className="text-[#c79a3b]">Cart</span>
                  </p>
                  <p className="text-[8px] uppercase tracking-wider text-[#958b7d]">
                    Premium Shopping
                  </p>
                </div>

              </Link>

              <button
                onClick={() => setOpenMenu(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4eee4]"
              >
                <X size={18} />
              </button>

            </div>

            <div className="overflow-y-auto px-4 py-5">

              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#b8872d]">
                Menu
              </p>

              <div className="flex flex-col">

                {[
                  ["Home", "/"],
                  ["Shop All Products", "/dashboard/products"],
                  ["Deals", "/products?deal=true"],
                  ["PrimeMatch", "/dashboard/prime-match"],
                  ["Budget Builder", "/dashboard/budget-builder"],
                  ["Build My Setup", "/dashboard/setup-builder"],
                  ["PrimePoints", "/dashboard/prime-points"],
                ].map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setOpenMenu(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-[#4e483f] transition hover:bg-[#f7f0e3] hover:text-[#b8872d]"
                  >
                    {label}
                    <ChevronRight size={15} className="text-[#b5a991]" />
                  </Link>
                ))}

              </div>

              <p className="mb-3 mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#b8872d]">
                Categories
              </p>

              <div className="grid grid-cols-2 gap-2">

                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/categories/${category.slug}`}
                    onClick={() => setOpenMenu(false)}
                    className="rounded-xl border border-[#e8dfd0] bg-white p-3"
                  >
                    <div className="flex items-center gap-2">

                      <div className="h-9 w-9 rounded-lg bg-[#faf7ef]">
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={36}
                          height={36}
                          className="h-full w-full object-contain p-1"
                        />
                      </div>

                      <p className="text-[10px] font-semibold">
                        {category.name}
                      </p>

                    </div>
                  </Link>
                ))}

              </div>

            </div>

            <div className="mt-auto border-t border-[#e8dfd0] p-4">

              <div className="grid grid-cols-2 gap-3">

                <Link
                  href="/auth/login"
                  onClick={() => setOpenMenu(false)}
                  className="flex h-11 items-center justify-center rounded-xl border border-[#d8ccb9] text-sm font-semibold"
                >
                  Login
                </Link>

                <Link
                  href="/auth/register"
                  onClick={() => setOpenMenu(false)}
                  className="flex h-11 items-center justify-center rounded-xl bg-[#c79a3b] text-sm font-bold text-white"
                >
                  Register
                </Link>

              </div>

            </div>

          </aside>

        </div>
      )}

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="border-b border-[#e9dfcf] bg-[#f7f0e3]">

        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

          <div className="grid min-h-[480px] items-center lg:grid-cols-[0.9fr_1.1fr] lg:min-h-[550px]">

            {/* LEFT */}

            <div className="relative z-10 py-12 sm:py-16 lg:py-20">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d8c08a] bg-white/75 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#a47623] sm:text-xs">
                <Sparkles size={13} />
                Premium Shopping Experience
              </div>

              <h1 className="max-w-[620px] text-[44px] font-black leading-[0.98] tracking-[-0.045em] text-[#211d17] sm:text-[58px] lg:text-[76px]">

                Shop More.

                <br />

                <span className="text-[#b8872d]">
                  Pay Less.
                </span>

              </h1>

              <p className="mt-6 max-w-[540px] text-sm leading-6 text-[#6d655a] sm:text-base sm:leading-7">
                Discover products you love at prices you'll love even more.
                From everyday essentials to premium picks, PrimeCart brings
                smarter shopping to your fingertips.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                <Link
                  href="/dashboard/products"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c79a3b] px-7 text-sm font-bold text-white shadow-lg shadow-[#c79a3b]/20 transition hover:-translate-y-0.5 hover:bg-[#b8872d]"
                >
                  Shop Now
                  <ArrowRight size={17} />
                </Link>

                <Link
                  href="/products?deal=true"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#d6c5a7] bg-white px-7 text-sm font-bold text-[#433c33] transition hover:border-[#c79a3b]"
                >
                  <Zap size={16} className="text-[#b8872d]" />
                  Explore Deals
                </Link>

              </div>

              {/* STATS */}

              <div className="mt-9 flex flex-wrap items-center gap-6 border-t border-[#dfd2bd] pt-6">

                <div>
                  <p className="text-lg font-black text-[#2b251e]">
                    10K+
                  </p>
                  <p className="text-[10px] text-[#8b8174]">
                    Happy Customers
                  </p>
                </div>

                <div className="h-8 w-px bg-[#d9ccb5]" />

                <div>
                  <p className="text-lg font-black text-[#2b251e]">
                    5K+
                  </p>
                  <p className="text-[10px] text-[#8b8174]">
                    Products
                  </p>
                </div>

                <div className="h-8 w-px bg-[#d9ccb5]" />

                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-black text-[#2b251e]">
                      4.8
                    </p>
                    <Star
                      size={13}
                      fill="currentColor"
                      className="text-[#c79a3b]"
                    />
                  </div>
                  <p className="text-[10px] text-[#8b8174]">
                    Customer Rating
                  </p>
                </div>

              </div>

            </div>

            {/* RIGHT IMAGE */}

            <div className="relative flex min-h-[270px] items-center justify-center lg:min-h-[550px]">

              <div className="absolute h-[250px] w-[250px] rounded-full bg-[#d4af37]/10 blur-3xl sm:h-[350px] sm:w-[350px] lg:h-[430px] lg:w-[430px]" />

              <Image
                src="/hero-product.png"
                alt="PrimeCart Products"
                width={900}
                height={700}
                priority
                className="relative z-10 h-auto max-h-[330px] w-full max-w-[650px] object-contain sm:max-h-[410px] lg:max-h-[500px]"
              />

              {/* FLOATING DEAL */}

              <div className="absolute bottom-7 left-2 z-20 hidden rounded-2xl border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur sm:block lg:left-0">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbf0d9] text-[#b8872d]">
                    <Tag size={18} />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#9b8c75]">
                      Today's Deals
                    </p>
                    <p className="text-sm font-black">
                      Up to 50% OFF
                    </p>
                  </div>

                </div>

              </div>

              <div className="absolute right-2 top-10 z-20 hidden rounded-2xl border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur sm:block lg:right-8">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7ead0] text-[#b8872d]">
                    <Truck size={15} />
                  </div>

                  <div>
                    <p className="text-[9px] text-[#958b7e]">
                      Delivery
                    </p>
                    <p className="text-xs font-bold">
                      Fast & Easy
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          SERVICE STRIP
      ====================================================== */}

      <section className="border-b border-[#e8dfd0] bg-white">

        <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-y divide-[#eee7dc] sm:grid-cols-4 sm:divide-y-0">

          {[
            {
              icon: Truck,
              title: "Free Delivery",
              text: "On orders above ₹499",
            },
            {
              icon: ShieldCheck,
              title: "Secure Payment",
              text: "100% secure checkout",
            },
            {
              icon: RotateCcw,
              title: "Easy Returns",
              text: "Simple return process",
            },
            {
              icon: Headphones,
              title: "24/7 Support",
              text: "We're here to help",
            },
          ].map((item) => {

            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-3 px-4 py-5 sm:px-6 lg:px-8"
              >

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#faf3e3] text-[#b8872d]">
                  <Icon size={18} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#332d25] sm:text-sm">
                    {item.title}
                  </p>

                  <p className="mt-0.5 truncate text-[9px] text-[#91887b] sm:text-[10px]">
                    {item.text}
                  </p>
                </div>

              </div>
            );
          })}

        </div>

      </section>

      {/* =====================================================
          CATEGORIES
      ====================================================== */}

      <section
        id="categories"
        className="bg-[#faf8f3] py-12 sm:py-16 lg:py-20"
      >

        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

          <div className="mb-7 flex items-end justify-between">

            <div>

              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b8872d]">
                Explore Collections
              </p>

              <h2 className="text-2xl font-black tracking-tight text-[#29241e] sm:text-3xl">
                Shop by Category
              </h2>

              <p className="mt-2 text-xs text-[#81786b] sm:text-sm">
                Everything you need, all in one place.
              </p>

            </div>

            <Link
              href="/products"
              className="hidden items-center gap-1 text-xs font-bold text-[#b8872d] sm:flex"
            >
              View All
              <ArrowRight size={14} />
            </Link>

          </div>

          {/* MOBILE SCROLL / DESKTOP GRID */}

          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:grid lg:grid-cols-6 lg:gap-4 lg:overflow-visible">

            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group w-[145px] shrink-0 snap-start sm:w-auto"
              >

                <div className="relative aspect-square overflow-hidden rounded-2xl border border-[#e9dfd0] bg-white transition duration-300 group-hover:-translate-y-1 group-hover:border-[#d4b56b] group-hover:shadow-[0_15px_35px_rgba(70,50,20,0.10)]">

                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 145px, 16vw"
                    className="object-contain p-5 transition duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-1 text-[8px] font-bold text-[#a47725] shadow-sm">
                    Shop
                  </span>

                </div>

                <div className="pt-3">

                  <h3 className="text-xs font-bold text-[#342e27] sm:text-sm">
                    {category.name}
                  </h3>

                  <p className="mt-1 text-[9px] text-[#968c7e] sm:text-[10px]">
                    {category.count}
                  </p>

                </div>

              </Link>
            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          DEAL OF THE DAY
      ====================================================== */}

      <section
        id="deals"
        className="border-y border-[#e8dfd0] bg-white py-12 sm:py-16 lg:py-20"
      >

        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

          <div className="mb-7 flex items-end justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2">
                <Zap
                  size={15}
                  fill="currentColor"
                  className="text-[#c79a3b]"
                />

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b8872d]">
                  Limited Time
                </span>
              </div>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Deal of the Day
              </h2>

              <p className="mt-2 text-xs text-[#81786b] sm:text-sm">
                Grab it before the deal disappears.
              </p>

            </div>

            <Link
              href="/products?deal=true"
              className="hidden items-center gap-1 text-xs font-bold text-[#b8872d] sm:flex"
            >
              View All Deals
              <ArrowRight size={14} />
            </Link>

          </div>

          <div className="grid overflow-hidden rounded-[24px] border border-[#e8dfd0] bg-[#f8f1e5] lg:grid-cols-[0.85fr_1.15fr]">

            {/* DEAL INFO */}

            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">

              <span className="w-fit rounded-full bg-[#211d17] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white">
                Flash Sale
              </span>

              <h3 className="mt-5 text-2xl font-black leading-tight sm:text-3xl">
                Upgrade your everyday essentials.
              </h3>

              <p className="mt-3 max-w-[430px] text-xs leading-5 text-[#756c60] sm:text-sm">
                Limited-time prices on products customers are loving right now.
              </p>

              <div className="mt-6 flex gap-2">

                {[
                  ["08", "HRS"],
                  ["24", "MIN"],
                  ["36", "SEC"],
                ].map(([number, label]) => (
                  <div
                    key={label}
                    className="flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-[#dfcfb2] bg-white"
                  >
                    <span className="text-sm font-black">
                      {number}
                    </span>

                    <span className="text-[7px] font-bold text-[#988c7b]">
                      {label}
                    </span>
                  </div>
                ))}

              </div>

              <Link
                href="/products?deal=true"
                className="mt-6 flex h-11 w-fit items-center gap-2 rounded-xl bg-[#c79a3b] px-6 text-xs font-bold text-white transition hover:bg-[#b8872d]"
              >
                Shop Flash Deals
                <ArrowRight size={14} />
              </Link>

            </div>

            {/* DEAL PRODUCTS */}

            <div className="grid grid-cols-3 gap-2 p-3 sm:gap-4 sm:p-5">

              {deals.map((deal) => (
                <Link
                  key={deal.name}
                  href="/dashboard/products"
                  className="group overflow-hidden rounded-2xl border border-[#e6dac6] bg-white p-2.5 transition hover:-translate-y-1 hover:shadow-lg sm:p-4"
                >

                  <div className="relative aspect-square rounded-xl bg-[#faf8f3]">

                    <Image
                      src={deal.image}
                      alt={deal.name}
                      fill
                      className="object-contain p-2 transition duration-500 group-hover:scale-105 sm:p-4"
                    />

                    <span className="absolute left-1.5 top-1.5 rounded-full bg-[#211d17] px-1.5 py-1 text-[7px] font-bold text-white sm:left-2 sm:top-2 sm:text-[8px]">
                      {deal.discount}
                    </span>

                  </div>

                  <p className="mt-2 line-clamp-1 text-[9px] font-bold sm:text-xs">
                    {deal.name}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-1">

                    <span className="text-xs font-black sm:text-sm">
                      {deal.price}
                    </span>

                    <span className="text-[8px] text-[#a29a8e] line-through sm:text-[10px]">
                      {deal.oldPrice}
                    </span>

                  </div>

                </Link>
              ))}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FEATURED PRODUCTS
      ====================================================== */}

      <section className="bg-[#faf8f3] py-12 sm:py-16 lg:py-20">

        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

          <div className="mb-7 flex items-end justify-between">

            <div>

              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b8872d]">
                Handpicked For You
              </p>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Featured Products
              </h2>

              <p className="mt-2 text-xs text-[#81786b] sm:text-sm">
                Popular picks worth checking out.
              </p>

            </div>

            <Link
              href="/dashboard/products"
              className="hidden items-center gap-1 text-xs font-bold text-[#b8872d] sm:flex"
            >
              View All Products
              <ArrowRight size={14} />
            </Link>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">

            {products.map((product) => {

              const isWishlisted = wishlist.includes(product.id);

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-[#e8dfd0] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#d6b66d] hover:shadow-[0_18px_45px_rgba(70,50,20,0.10)]"
                >

                  {/* IMAGE */}

                  <div className="relative aspect-square overflow-hidden bg-[#faf8f3]">

                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain p-4 transition duration-500 group-hover:scale-105 sm:p-6"
                    />

                    <span className="absolute left-2.5 top-2.5 rounded-full bg-[#211d17] px-2 py-1 text-[7px] font-bold text-white sm:text-[8px]">
                      {product.badge}
                    </span>

                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border bg-white/90 transition ${
                        isWishlisted
                          ? "border-[#d3af5e] text-[#b8872d]"
                          : "border-[#e8dfd0] text-[#6f675c]"
                      }`}
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={14}
                        fill={isWishlisted ? "currentColor" : "none"}
                      />
                    </button>

                  </div>

                  {/* CONTENT */}

                  <div className="p-3 sm:p-4">

                    <p className="text-[8px] font-medium uppercase tracking-wide text-[#a39176] sm:text-[9px]">
                      {product.category}
                    </p>

                    <h3 className="mt-1 line-clamp-1 text-xs font-bold text-[#302a23] sm:text-sm">
                      {product.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-1.5">

                      <span className="flex items-center gap-0.5 rounded bg-[#f5ead4] px-1.5 py-0.5 text-[8px] font-bold text-[#986d21] sm:text-[9px]">
                        {product.rating}
                        <Star size={8} fill="currentColor" />
                      </span>

                      <span className="text-[8px] text-[#9c9489] sm:text-[9px]">
                        {product.reviews}
                      </span>

                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">

                      <span className="text-sm font-black sm:text-lg">
                        {product.price}
                      </span>

                      <span className="text-[8px] text-[#a39a8e] line-through sm:text-[10px]">
                        {product.oldPrice}
                      </span>

                    </div>

                    <p className="mt-1 text-[8px] font-bold text-[#4e8b4c] sm:text-[9px]">
                      {product.discount}
                    </p>

                    <Link
                      href={`/products/${product.slug}`}
                      className="mt-3 flex h-9 items-center justify-center gap-1 rounded-lg border border-[#dcc9a4] text-[9px] font-bold text-[#9f7629] transition hover:bg-[#faf3e4] sm:h-10 sm:text-[10px]"
                    >
                      View Product
                      <ArrowRight size={11} />
                    </Link>

                  </div>

                </article>
              );

            })}

          </div>

        </div>

      </section>

      {/* =====================================================
          PROMOTIONAL BANNERS
      ====================================================== */}

      <section className="bg-white py-12 sm:py-16">

        <div className="mx-auto grid max-w-[1440px] gap-4 px-4 sm:px-6 md:grid-cols-2 lg:px-8">

          {/* BANNER 1 */}

          <Link
            href="/products?deal=true"
            className="group relative min-h-[260px] overflow-hidden rounded-[24px] bg-[#211d17] p-7 sm:p-9"
          >

            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#c79a3b]/20 blur-2xl" />

            <div className="relative z-10 max-w-[290px]">

              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#d7b65e]">
                Limited Offer
              </span>

              <h3 className="mt-4 text-2xl font-black leading-tight text-white sm:text-3xl">
                Big savings.
                <br />
                Small prices.
              </h3>

              <p className="mt-3 text-xs leading-5 text-[#c6bcae]">
                Discover selected products with special prices for a limited
                time.
              </p>

              <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#e1c477]">
                Shop Deals
                <ArrowRight
                  size={14}
                  className="transition group-hover:translate-x-1"
                />
              </span>

            </div>

          </Link>

          {/* BANNER 2 */}

          <Link
            href="/dashboard/prime-match"
            className="group relative min-h-[260px] overflow-hidden rounded-[24px] border border-[#e6dac7] bg-[#f7efe1] p-7 sm:p-9"
          >

            <div className="absolute -right-10 -bottom-20 h-60 w-60 rounded-full bg-[#d4af37]/10 blur-2xl" />

            <div className="relative z-10 max-w-[310px]">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#b8872d] shadow-sm">
                <Sparkles size={19} />
              </div>

              <h3 className="mt-5 text-2xl font-black leading-tight text-[#29231c] sm:text-3xl">
                Not sure what to buy?
              </h3>

              <p className="mt-3 text-xs leading-5 text-[#766d60]">
                Let PrimeMatch help you discover products based on your needs,
                preferences and budget.
              </p>

              <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#a27624]">
                Try PrimeMatch
                <ArrowRight
                  size={14}
                  className="transition group-hover:translate-x-1"
                />
              </span>

            </div>

          </Link>

        </div>

      </section>

      {/* =====================================================
          SMART SHOPPING
      ====================================================== */}

      <section className="bg-[#faf8f3] py-12 sm:py-16">

        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

          <div className="mb-8 text-center">

            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b8872d]">
              The PrimeCart Difference
            </p>

            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              More Than Just Shopping
            </h2>

            <p className="mx-auto mt-2 max-w-[620px] text-xs leading-5 text-[#81786b] sm:text-sm">
              Smart tools that make choosing, planning and shopping easier.
            </p>

          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {[
              {
                icon: Sparkles,
                title: "PrimeMatch",
                text: "Find products that fit your needs.",
                href: "/dashboard/prime-match",
              },
              {
                icon: Tag,
                title: "Budget Builder",
                text: "Plan your shopping within your budget.",
                href: "/dashboard/budget-builder",
              },
              {
                icon: Gift,
                title: "Build My Setup",
                text: "Create complete product setups.",
                href: "/dashboard/setup-builder",
              },
              {
                icon: Star,
                title: "PrimePoints",
                text: "Earn rewards while you shop.",
                href: "/dashboard/prime-points",
              },
            ].map((item) => {

              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center gap-4 rounded-2xl border border-[#e8dfd0] bg-white p-4 transition hover:-translate-y-1 hover:border-[#d6b66d] hover:shadow-lg sm:p-5"
                >

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#faf1dc] text-[#b8872d] transition group-hover:bg-[#c79a3b] group-hover:text-white">
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <h3 className="text-sm font-black">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-[10px] leading-4 text-[#847b6e]">
                      {item.text}
                    </p>

                  </div>

                  <ArrowRight
                    size={15}
                    className="shrink-0 text-[#b8872d] transition group-hover:translate-x-1"
                  />

                </Link>
              );

            })}

          </div>

        </div>

      </section>

      {/* =====================================================
          NEWSLETTER
      ====================================================== */}

      <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">

        <div className="mx-auto max-w-[1440px]">

          <div className="rounded-[24px] border border-[#e6dac7] bg-[#f7f0e4] px-5 py-9 text-center sm:px-10">

            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#b8872d] shadow-sm">
              <Headphones size={20} />
            </div>

            <h2 className="mt-4 text-xl font-black sm:text-2xl">
              Stay in the PrimeCart loop
            </h2>

            <p className="mx-auto mt-2 max-w-[520px] text-xs leading-5 text-[#81786b]">
              Get notified about new arrivals, exclusive deals and special
              offers.
            </p>

            <div className="mx-auto mt-5 flex max-w-[470px] rounded-xl border border-[#ddd0b9] bg-white p-1.5">

              <input
                type="email"
                placeholder="Enter your email address"
                className="min-w-0 flex-1 bg-transparent px-3 text-xs outline-none placeholder:text-[#aaa195]"
              />

              <button className="rounded-lg bg-[#c79a3b] px-4 py-2.5 text-[10px] font-bold text-white transition hover:bg-[#b8872d] sm:px-6">
                Subscribe
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-[#e8dfd0] bg-[#fffdf9] pb-24 sm:pb-0">

        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

            {/* BRAND */}

            <div>

              <Link href="/" className="flex items-center gap-2">

                <Image
                  src="/logo.png"
                  alt="PrimeCart"
                  width={48}
                  height={48}
                  className="h-11 w-11 object-contain"
                />

                <div>

                  <h2 className="text-xl font-bold">
                    Prime<span className="text-[#c79a3b]">Cart</span>
                  </h2>

                  <p className="text-[8px] uppercase tracking-[0.16em] text-[#978d7e]">
                    Premium Shopping
                  </p>

                </div>

              </Link>

              <p className="mt-4 max-w-[330px] text-xs leading-5 text-[#81786b]">
                Your smarter destination for quality products, great prices and
                a better shopping experience.
              </p>

            </div>

            {/* SHOP */}

            <div>

              <h3 className="text-sm font-black">
                Shop
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-xs text-[#766e62]">

                <Link
                  href="/dashboard/products"
                  className="hover:text-[#b8872d]"
                >
                  All Products
                </Link>

                <Link
                  href="#categories"
                  className="hover:text-[#b8872d]"
                >
                  Categories
                </Link>

                <Link
                  href="/products?deal=true"
                  className="hover:text-[#b8872d]"
                >
                  Deals
                </Link>

                <Link
                  href="/dashboard/wishlist"
                  className="hover:text-[#b8872d]"
                >
                  Wishlist
                </Link>

              </div>

            </div>

            {/* PRIME CART */}

            <div>

              <h3 className="text-sm font-black">
                PrimeCart
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-xs text-[#766e62]">

                <Link
                  href="/dashboard/prime-match"
                  className="hover:text-[#b8872d]"
                >
                  PrimeMatch
                </Link>

                <Link
                  href="/dashboard/budget-builder"
                  className="hover:text-[#b8872d]"
                >
                  Budget Builder
                </Link>

                <Link
                  href="/dashboard/setup-builder"
                  className="hover:text-[#b8872d]"
                >
                  Build My Setup
                </Link>

                <Link
                  href="/dashboard/prime-points"
                  className="hover:text-[#b8872d]"
                >
                  PrimePoints
                </Link>

              </div>

            </div>

            {/* SUPPORT */}

            <div>

              <h3 className="text-sm font-black">
                Support
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-xs text-[#766e62]">

                <Link
                  href="/auth/login"
                  className="hover:text-[#b8872d]"
                >
                  Contact Us
                </Link>

                <Link
                  href="/auth/login"
                  className="hover:text-[#b8872d]"
                >
                  Shipping Policy
                </Link>

                <Link
                  href="/auth/login"
                  className="hover:text-[#b8872d]"
                >
                  Returns
                </Link>

                <Link
                  href="/auth/login"
                  className="hover:text-[#b8872d]"
                >
                  Privacy Policy
                </Link>

              </div>

            </div>

          </div>

          <div className="mt-10 border-t border-[#e8dfd0] pt-6 text-center text-[10px] text-[#938a7e] sm:flex sm:items-center sm:justify-between sm:text-left">

            <p>
              © {new Date().getFullYear()} PrimeCart. All rights reserved.
            </p>

            <p className="mt-2 sm:mt-0">
              Premium shopping. Smarter choices.
            </p>

          </div>

        </div>

      </footer>

      {/* =====================================================
          MOBILE BOTTOM NAV
      ====================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e4dac9] bg-white/95 px-2 pb-[max(7px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl sm:hidden">

        <div className="grid grid-cols-5">

          <Link
            href="/"
            className="flex flex-col items-center gap-1 py-1 text-[#b8872d]"
          >
            <Search size={18} />
            <span className="text-[8px] font-bold">
              Home
            </span>
          </Link>

          <Link
            href="/dashboard/products"
            className="flex flex-col items-center gap-1 py-1 text-[#756d62]"
          >
            <ShoppingCart size={18} />
            <span className="text-[8px] font-medium">
              Shop
            </span>
          </Link>

          <Link
            href="/products?deal=true"
            className="flex flex-col items-center gap-1 py-1 text-[#756d62]"
          >
            <Zap size={18} />
            <span className="text-[8px] font-medium">
              Deals
            </span>
          </Link>

          <Link
            href="/dashboard/wishlist"
            className="flex flex-col items-center gap-1 py-1 text-[#756d62]"
          >
            <Heart size={18} />
            <span className="text-[8px] font-medium">
              Wishlist
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="flex flex-col items-center gap-1 py-1 text-[#756d62]"
          >
            <User size={18} />
            <span className="text-[8px] font-medium">
              Account
            </span>
          </Link>

        </div>

      </div>

    </main>
  );
}
