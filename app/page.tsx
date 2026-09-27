"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Headphones,
  Heart,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  Truck,
  User,
  X,
  Zap,
} from "lucide-react";

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    image: "/electronics.png",
    count: "1200+ Products",
  },
  {
    name: "Fashion",
    slug: "fashion",
    image: "/fashion.png",
    count: "2500+ Products",
  },
  {
    name: "Watches",
    slug: "watches",
    image: "/watch.png",
    count: "450+ Products",
  },
  {
    name: "Beauty",
    slug: "beauty",
    image: "/beauty.png",
    count: "900+ Products",
  },
  {
    name: "Home & Living",
    slug: "home-and-living",
    image: "/home.png",
    count: "1800+ Products",
  },
  {
    name: "Gaming",
    slug: "gaming",
    image: "/gaming.png",
    count: "700+ Products",
  },
];

const features = [
  {
    icon: Truck,
    title: "Fast Delivery",
    text: "Quick & reliable delivery",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    text: "100% safe checkout",
  },
  {
    icon: Tag,
    title: "Best Prices",
    text: "Deals you'll love",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    text: "We're always here",
  },
];

const products = [
  {
    id: 1,
    name: "Smartphone X Pro",
    category: "Electronics",
    price: "₹29,999",
    oldPrice: "₹39,999",
    discount: "25% OFF",
    rating: "4.8",
    reviews: "1.2k",
    image: "/products/smartphone-x-pro.png",
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "Wireless Headphones",
    category: "Electronics",
    price: "₹2,499",
    oldPrice: "₹4,999",
    discount: "50% OFF",
    rating: "4.7",
    reviews: "890",
    image: "/products/wireless-headphones.png",
    badge: "Hot Deal",
  },
  {
    id: 3,
    name: "Premium Denim Jacket",
    category: "Fashion",
    price: "₹1,799",
    oldPrice: "₹3,499",
    discount: "49% OFF",
    rating: "4.6",
    reviews: "640",
    image: "/products/denim-jacket.png",
    badge: "Trending",
  },
  {
    id: 4,
    name: "Running Shoes",
    category: "Footwear",
    price: "₹1,999",
    oldPrice: "₹3,999",
    discount: "50% OFF",
    rating: "4.8",
    reviews: "1.1k",
    image: "/products/sports-running-shoes.png",
    badge: "Popular",
  },
];

const deals = [
  {
    name: "Smartphone X Pro",
    price: "₹29,999",
    oldPrice: "₹39,999",
    image: "/products/smartphone-x-pro.png",
    discount: "25% OFF",
  },
  {
    name: "Wireless Headphones",
    price: "₹2,499",
    oldPrice: "₹4,999",
    image: "/products/wireless-headphones.png",
    discount: "50% OFF",
  },
  {
    name: "Running Shoes",
    price: "₹1,999",
    oldPrice: "₹3,999",
    image: "/products/sports-running-shoes.png",
    discount: "50% OFF",
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState<number[]>([]);

  const slides = [
    {
      eyebrow: "PRIMECART EXCLUSIVE",
      title: "Shop More.",
      highlight: "Pay Less.",
      description:
        "Discover premium products, exciting deals and everyday essentials—all in one place.",
      button: "Start Shopping",
      href: "/dashboard/products",
    },
    {
      eyebrow: "LIMITED TIME DEALS",
      title: "Big Deals.",
      highlight: "Bigger Savings.",
      description:
        "Grab handpicked products at prices that make every purchase feel smarter.",
      button: "Explore Deals",
      href: "/products?deal=true",
    },
    {
      eyebrow: "SMARTER SHOPPING",
      title: "Find What",
      highlight: "Fits You.",
      description:
        "From PrimeMatch to Budget Builder, PrimeCart helps you shop with confidence.",
      button: "Explore PrimeCart",
      href: "/dashboard",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const toggleLike = (id: number) => {
    setLiked((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffdf9] text-[#211d17]">
      {/* TOP BAR */}
      <div className="hidden bg-[#211d17] px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white sm:block">
        ✨ Free delivery on eligible orders &nbsp; • &nbsp; Easy returns
        &nbsp; • &nbsp; Secure payments
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#eadfca] bg-[#fffdf9]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:h-[76px] lg:px-8">
          {/* MOBILE MENU */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#eadfca] bg-white lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* LOGO */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="PrimeCart home"
          >
            <Image
              src="/logo.png"
              alt="PrimeCart"
              width={150}
              height={48}
              className="h-auto w-[112px] object-contain sm:w-[130px] lg:w-[145px]"
              priority
            />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="ml-5 hidden items-center gap-7 lg:flex">
            <Link
              href="/"
              className="text-sm font-semibold text-[#b8872d]"
            >
              Home
            </Link>
            <Link
              href="/dashboard/products"
              className="text-sm font-medium text-[#625b50] transition hover:text-[#b8872d]"
            >
              Shop
            </Link>
            <Link
              href="#categories"
              className="text-sm font-medium text-[#625b50] transition hover:text-[#b8872d]"
            >
              Categories
            </Link>
            <Link
              href="#deals"
              className="text-sm font-medium text-[#625b50] transition hover:text-[#b8872d]"
            >
              Deals
            </Link>
          </nav>

          {/* SEARCH */}
          <div className="ml-auto hidden max-w-[410px] flex-1 lg:block">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b9284]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands & categories..."
                className="h-11 w-full rounded-full border border-[#e6dac3] bg-[#faf7f0] pl-11 pr-4 text-sm outline-none transition focus:border-[#c79a3b] focus:bg-white"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-4">
            <button
              onClick={() => setSearchOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#f7f0e2] lg:hidden"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <Link
              href="/dashboard/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#f7f0e2]"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </Link>

            <Link
              href="/dashboard/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#f7f0e2]"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              <span className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#c79a3b] px-1 text-[9px] font-bold text-white">
                0
              </span>
            </Link>

            <Link
              href="/auth/login"
              className="hidden h-10 items-center gap-2 rounded-full border border-[#d8c8a8] bg-white px-5 text-sm font-semibold transition hover:border-[#b8872d] hover:bg-[#fbf5e8] sm:flex"
            >
              <User size={17} />
              Login
            </Link>
          </div>
        </div>

        {/* MOBILE SEARCH */}
        {searchOpen && (
          <div className="border-t border-[#eadfca] bg-white px-4 py-3 lg:hidden">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b9284]"
              />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="h-11 w-full rounded-full border border-[#e3d7c2] bg-[#faf7f0] pl-11 pr-4 text-sm outline-none focus:border-[#c79a3b]"
              />
            </div>
          </div>
        )}
      </header>

      {/* MOBILE DRAWER */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
          />

          <aside className="absolute left-0 top-0 flex h-full w-[84%] max-w-[340px] flex-col bg-[#fffdf9] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eadfca] px-5 py-5">
              <Image
                src="/logo.png"
                alt="PrimeCart"
                width={130}
                height={42}
                className="w-[125px] object-contain"
              />

              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5eee1]"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col px-4 py-5">
              {[
                ["Home", "/"],
                ["Shop All Products", "/dashboard/products"],
                ["Categories", "#categories"],
                ["Flash Deals", "#deals"],
                ["PrimeMatch", "/dashboard/prime-match"],
                ["Budget Builder", "/dashboard/budget-builder"],
                ["Build My Setup", "/dashboard/setup-builder"],
                ["PrimePoints", "/dashboard/prime-points"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3.5 text-[15px] font-medium text-[#4f493f] transition hover:bg-[#f8f1e5] hover:text-[#b8872d]"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t border-[#eadfca] p-4">
              <Link
                href="/auth/login"
                className="flex h-12 items-center justify-center rounded-full bg-[#c79a3b] text-sm font-bold text-white shadow-lg shadow-[#c79a3b]/20"
              >
                Login / Register
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fffdf9] via-[#fbf6ec] to-[#f5ead6]">
        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
          <div className="relative min-h-[470px] overflow-hidden rounded-[28px] border border-[#eadcc4] bg-[#f9f1e2] shadow-[0_20px_60px_rgba(90,65,25,0.08)] sm:min-h-[510px] lg:min-h-[570px]">
            {/* decorative shapes */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#d4af37]/10 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-[#c79a3b]/10 blur-3xl" />

            <div className="relative grid h-full min-h-[470px] items-center lg:grid-cols-[0.95fr_1.05fr] lg:min-h-[570px]">
              {/* TEXT */}
              <div className="z-10 px-6 pb-4 pt-10 sm:px-10 lg:px-16 lg:py-12">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d9c294] bg-white/75 px-3.5 py-2 text-[10px] font-bold tracking-[0.16em] text-[#a27624] sm:text-xs">
                  <Sparkles size={13} />
                  {slides[activeSlide].eyebrow}
                </div>

                <h1 className="max-w-[620px] text-[42px] font-black leading-[0.98] tracking-[-0.04em] text-[#241f18] sm:text-[56px] lg:text-[70px]">
                  {slides[activeSlide].title}
                  <br />
                  <span className="text-[#b8872d]">
                    {slides[activeSlide].highlight}
                  </span>
                </h1>

                <p className="mt-5 max-w-[500px] text-sm leading-6 text-[#6d6458] sm:text-base sm:leading-7">
                  {slides[activeSlide].description}
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={slides[activeSlide].href}
                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#c79a3b] px-7 text-sm font-bold text-white shadow-lg shadow-[#c79a3b]/20 transition hover:-translate-y-0.5 hover:bg-[#b8872d]"
                  >
                    {slides[activeSlide].button}
                    <ArrowRight size={17} />
                  </Link>

                  <Link
                    href="/dashboard/products"
                    className="flex h-12 items-center justify-center rounded-full border border-[#d7c5a3] bg-white/80 px-7 text-sm font-bold text-[#51483c] transition hover:bg-white"
                  >
                    Browse Products
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#746b5e]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-[#b8872d]" />
                    Secure checkout
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Truck size={15} className="text-[#b8872d]" />
                    Easy delivery
                  </span>
                </div>
              </div>

              {/* IMAGE */}
              <div className="relative flex h-[245px] items-center justify-center px-4 sm:h-[300px] lg:h-full lg:min-h-[570px] lg:px-8">
                <div className="absolute h-[220px] w-[220px] rounded-full bg-[#d4af37]/10 blur-2xl sm:h-[310px] sm:w-[310px] lg:h-[390px] lg:w-[390px]" />

                <Image
                  src="/hero-product.png"
                  alt="PrimeCart products"
                  width={720}
                  height={600}
                  priority
                  className="relative z-10 h-full max-h-[300px] w-full max-w-[650px] object-contain drop-shadow-[0_25px_30px_rgba(85,58,20,0.16)] sm:max-h-[360px] lg:max-h-[500px]"
                />

                {/* floating card */}
                <div className="absolute bottom-4 left-5 z-20 hidden rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-xl backdrop-blur sm:block lg:bottom-12 lg:left-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbf1dc] text-[#b8872d]">
                      <Zap size={18} fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#968976]">
                        Today's highlight
                      </p>
                      <p className="text-sm font-bold text-[#302a22]">
                        Premium deals
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SLIDER CONTROLS */}
            <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2 sm:bottom-7 sm:right-7">
              <button
                onClick={() =>
                  setActiveSlide(
                    (activeSlide - 1 + slides.length) % slides.length
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dcc9a6] bg-white/85 backdrop-blur transition hover:bg-white"
                aria-label="Previous slide"
              >
                <ChevronLeft size={17} />
              </button>

              <div className="flex gap-1.5">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeSlide === index
                        ? "w-6 bg-[#b8872d]"
                        : "w-1.5 bg-[#cdbd9f]"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() =>
                  setActiveSlide((activeSlide + 1) % slides.length)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dcc9a6] bg-white/85 backdrop-blur transition hover:bg-white"
                aria-label="Next slide"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-[#eee4d3] bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-y divide-[#eee4d3] sm:grid-cols-4 sm:divide-y-0">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="flex items-center gap-3 px-4 py-5 sm:px-6 lg:px-8 lg:py-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#faf2e2] text-[#b8872d]">
                  <Icon size={19} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#332d25] sm:text-sm">
                    {feature.title}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-[#8b8276] sm:text-xs">
                    {feature.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CATEGORIES */}
      <section
        id="categories"
        className="scroll-mt-24 bg-[#fffdf9] py-12 sm:py-16 lg:py-20"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b8872d]">
                Explore
              </p>
              <h2 className="text-2xl font-black tracking-tight text-[#28231d] sm:text-3xl lg:text-4xl">
                Shop by Category
              </h2>
              <p className="mt-2 max-w-[560px] text-sm text-[#81786c]">
                Find everything you need, organized just the way you like it.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="hidden shrink-0 items-center gap-1 text-sm font-bold text-[#b8872d] sm:flex"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* MOBILE HORIZONTAL / DESKTOP GRID */}
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:grid lg:grid-cols-6 lg:overflow-visible">
            {filteredCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group w-[150px] shrink-0 snap-start sm:w-[175px] lg:w-auto"
              >
                <div className="relative aspect-square overflow-hidden rounded-[22px] border border-[#eadfca] bg-[#faf6ed] transition duration-300 group-hover:-translate-y-1 group-hover:border-[#d5b66e] group-hover:shadow-[0_15px_35px_rgba(96,69,27,0.12)]">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 1024px) 175px, 16vw"
                    className="object-contain p-5 transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold text-[#9b7227] shadow-sm backdrop-blur">
                    Explore
                  </div>
                </div>

                <div className="px-1 pt-3">
                  <h3 className="text-sm font-bold text-[#342e26]">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-[10px] text-[#91887c]">
                    {category.count}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/dashboard/products"
            className="mt-5 flex h-11 items-center justify-center gap-2 rounded-full border border-[#decba8] bg-white text-sm font-bold text-[#a27624] sm:hidden"
          >
            View All Categories
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* DEALS */}
      <section
        id="deals"
        className="scroll-mt-24 border-y border-[#eadfca] bg-[#f8f2e7] py-12 sm:py-16 lg:py-20"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Zap size={16} className="text-[#c58e21]" fill="currentColor" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b8872d]">
                  Limited Time
                </span>
              </div>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                Flash Deals
              </h2>

              <p className="mt-2 text-sm text-[#81786c]">
                Deals that won't wait around.
              </p>
            </div>

            <Link
              href="/products?deal=true"
              className="hidden items-center gap-1 text-sm font-bold text-[#b8872d] sm:flex"
            >
              View All Deals
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3">
            {deals.map((deal) => (
              <div
                key={deal.name}
                className="relative min-w-[285px] snap-start overflow-hidden rounded-[24px] border border-[#e6d8bd] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:min-w-0"
              >
                <div className="absolute right-4 top-4 rounded-full bg-[#fff1d2] px-2.5 py-1 text-[10px] font-black text-[#a27624]">
                  {deal.discount}
                </div>

                <div className="flex h-[190px] items-center justify-center rounded-[18px] bg-[#faf7f0]">
                  <Image
                    src={deal.image}
                    alt={deal.name}
                    width={250}
                    height={190}
                    className="h-full w-full object-contain p-5"
                  />
                </div>

                <div className="pt-4">
                  <div className="mb-2 flex items-center gap-1 text-[10px] text-[#b8872d]">
                    <Clock3 size={12} />
                    Limited stock
                  </div>

                  <h3 className="line-clamp-1 text-base font-bold">
                    {deal.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-black text-[#28231d]">
                      {deal.price}
                    </span>
                    <span className="text-xs text-[#9b9286] line-through">
                      {deal.oldPrice}
                    </span>
                  </div>

                  <Link
                    href="/dashboard/products"
                    className="mt-4 flex h-10 items-center justify-center rounded-full bg-[#211d17] text-xs font-bold text-white transition hover:bg-[#b8872d]"
                  >
                    Shop Deal
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b8872d]">
                Handpicked for you
              </p>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                Trending Products
              </h2>
              <p className="mt-2 text-sm text-[#81786c]">
                Popular picks customers are loving right now.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="hidden items-center gap-1 text-sm font-bold text-[#b8872d] sm:flex"
            >
              See All
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {products.map((product) => {
              const isLiked = liked.includes(product.id);

              return (
                <article
                  key={product.id}
                  className="group relative overflow-hidden rounded-[20px] border border-[#ebe2d3] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#d8c08b] hover:shadow-[0_18px_45px_rgba(77,57,26,0.10)]"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#faf7f0]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain p-4 transition duration-500 group-hover:scale-105 sm:p-6"
                    />

                    <span className="absolute left-2.5 top-2.5 rounded-full bg-[#211d17] px-2 py-1 text-[8px] font-bold text-white sm:left-3 sm:top-3 sm:text-[9px]">
                      {product.badge}
                    </span>

                    <button
                      onClick={() => toggleLike(product.id)}
                      className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border bg-white/90 backdrop-blur transition sm:right-3 sm:top-3 ${
                        isLiked
                          ? "border-[#d7b05c] text-[#b8872d]"
                          : "border-[#eadfca] text-[#766e63]"
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart
                        size={15}
                        fill={isLiked ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  <div className="p-3 sm:p-4">
                    <p className="text-[9px] font-medium text-[#a18f73] sm:text-[10px]">
                      {product.category}
                    </p>

                    <h3 className="mt-1 line-clamp-1 text-xs font-bold text-[#342e27] sm:text-sm">
                      {product.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="flex items-center gap-0.5 rounded bg-[#f5ead5] px-1.5 py-0.5 text-[9px] font-bold text-[#9a6e20]">
                        {product.rating}
                        <Star size={9} fill="currentColor" />
                      </span>
                      <span className="text-[9px] text-[#a29a8f]">
                        ({product.reviews})
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-black text-[#29231c] sm:text-lg">
                        {product.price}
                      </span>
                      <span className="text-[9px] text-[#9d958a] line-through sm:text-xs">
                        {product.oldPrice}
                      </span>
                    </div>

                    <p className="mt-1 text-[9px] font-bold text-[#4e8b4c] sm:text-[10px]">
                      {product.discount}
                    </p>

                    <Link
                      href={`/products/${product.id}`}
                      className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-full border border-[#dbc79e] text-[10px] font-bold text-[#a27624] transition hover:bg-[#faf3e4] sm:h-10 sm:text-xs"
                    >
                      View Product
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SMART SHOPPING */}
      <section className="bg-[#fffaf1] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b8872d]">
              More than shopping
            </p>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              Shop Smarter with PrimeCart
            </h2>
            <p className="mx-auto mt-2 max-w-[650px] text-sm leading-6 text-[#81786c]">
              Tools designed to help you discover the right products, stay
              within budget and get more value from every order.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Sparkles,
                title: "PrimeMatch",
                text: "Tell us what you need and we'll help you find the right match.",
                href: "/dashboard/prime-match",
              },
              {
                icon: Tag,
                title: "Budget Builder",
                text: "Plan your shopping around a budget without overspending.",
                href: "/dashboard/budget-builder",
              },
              {
                icon: ShoppingBag,
                title: "Build My Setup",
                text: "Create complete setups for gaming, college, work and more.",
                href: "/dashboard/setup-builder",
              },
              {
                icon: Star,
                title: "PrimePoints",
                text: "Earn points through shopping, challenges and special activities.",
                href: "/dashboard/prime-points",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-[22px] border border-[#e9ddc8] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#d5b66e] hover:shadow-[0_18px_40px_rgba(92,65,25,0.09)] sm:p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#faf1dd] text-[#b8872d] transition group-hover:bg-[#c79a3b] group-hover:text-white">
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-5 text-base font-black text-[#332d25]">
                    {item.title}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-xs leading-5 text-[#82796d]">
                    {item.text}
                  </p>

                  <div className="mt-5 flex items-center gap-1 text-xs font-bold text-[#b8872d]">
                    Explore
                    <ArrowRight
                      size={14}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRIME CART CTA */}
      <section className="bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="relative overflow-hidden rounded-[28px] bg-[#211d17] px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#c79a3b]/20 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#d4af37]/10 blur-3xl" />

            <div className="relative flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#7f6840] bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#e3c783]">
                  <Sparkles size={12} />
                  PrimeCart Exclusive
                </div>

                <h2 className="max-w-[650px] text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Your smarter way to shop starts here.
                </h2>

                <p className="mt-3 max-w-[620px] text-sm leading-6 text-[#c9c0b1]">
                  Discover products, unlock better deals and make every
                  shopping decision count.
                </p>
              </div>

              <Link
                href="/dashboard/products"
                className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#d0a445] px-7 text-sm font-bold text-white transition hover:bg-[#c79a3b]"
              >
                Explore PrimeCart
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e9dfce] bg-[#faf7f0] pb-24 sm:pb-8">
        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
            <div>
              <Image
                src="/logo.png"
                alt="PrimeCart"
                width={145}
                height={45}
                className="w-[135px] object-contain"
              />

              <p className="mt-4 max-w-[350px] text-xs leading-6 text-[#81786c]">
                A smarter shopping experience designed around better products,
                better prices and better decisions.
              </p>

              <div className="mt-5 flex items-center gap-2">
                {["Instagram", "Facebook", "X"].map((social) => (
                  <button
                    key={social}
                    className="flex h-9 items-center justify-center rounded-full border border-[#ded2bc] bg-white px-3 text-[10px] font-semibold text-[#70685d] transition hover:border-[#c79a3b] hover:text-[#b8872d]"
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black">Shop</h3>
              <div className="mt-4 flex flex-col gap-3 text-xs text-[#777064]">
                <Link href="/dashboard/products" className="hover:text-[#b8872d]">
                  All Products
                </Link>
                <Link href="#categories" className="hover:text-[#b8872d]">
                  Categories
                </Link>
                <Link href="#deals" className="hover:text-[#b8872d]">
                  Flash Deals
                </Link>
                <Link href="/dashboard/wishlist" className="hover:text-[#b8872d]">
                  Wishlist
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black">PrimeCart</h3>
              <div className="mt-4 flex flex-col gap-3 text-xs text-[#777064]">
                <Link href="/dashboard/prime-match" className="hover:text-[#b8872d]">
                  PrimeMatch
                </Link>
                <Link href="/dashboard/budget-builder" className="hover:text-[#b8872d]">
                  Budget Builder
                </Link>
                <Link href="/dashboard/setup-builder" className="hover:text-[#b8872d]">
                  Build My Setup
                </Link>
                <Link href="/dashboard/prime-points" className="hover:text-[#b8872d]">
                  PrimePoints
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black">Stay Updated</h3>
              <p className="mt-3 text-xs leading-5 text-[#81786c]">
                Get updates about new products and special offers.
              </p>

              <div className="mt-4 flex rounded-full border border-[#ded2bc] bg-white p-1.5">
                <input
                  placeholder="Your email"
                  className="min-w-0 flex-1 bg-transparent px-3 text-xs outline-none"
                />
                <button className="rounded-full bg-[#c79a3b] px-4 py-2 text-[10px] font-bold text-white">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-[#e4d9c6] pt-6 text-center text-[10px] text-[#938a7e] sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p>© {new Date().getFullYear()} PrimeCart. All rights reserved.</p>
            <p>Made for a smarter shopping experience.</p>
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e6dac4] bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl sm:hidden">
        <div className="grid grid-cols-5">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 py-1 text-[#b8872d]"
          >
            <ShoppingBag size={18} />
            <span className="text-[9px] font-bold">Home</span>
          </Link>

          <Link
            href="/dashboard/products"
            className="flex flex-col items-center gap-1 py-1 text-[#71695e]"
          >
            <Search size={18} />
            <span className="text-[9px] font-medium">Shop</span>
          </Link>

          <Link
            href="/products?deal=true"
            className="flex flex-col items-center gap-1 py-1 text-[#71695e]"
          >
            <Zap size={18} />
            <span className="text-[9px] font-medium">Deals</span>
          </Link>

          <Link
            href="/dashboard/wishlist"
            className="flex flex-col items-center gap-1 py-1 text-[#71695e]"
          >
            <Heart size={18} />
            <span className="text-[9px] font-medium">Wishlist</span>
          </Link>

          <Link
            href="/auth/login"
            className="flex flex-col items-center gap-1 py-1 text-[#71695e]"
          >
            <User size={18} />
            <span className="text-[9px] font-medium">Account</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
