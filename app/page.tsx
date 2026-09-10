"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  ArrowRight,
  Check,
  ChevronRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  UserRound,
  X,
  ShieldCheck,
  Headphones,
  RotateCcw,
  Clock3,
} from "lucide-react";

const categories = [
  {
    name: "Electronics",
    products: "2500+ Products",
    image: "/products/electronics.png",
  },
  {
    name: "Fashion",
    products: "1800+ Products",
    image: "/products/fashion.png",
  },
  {
    name: "Watches",
    products: "1200+ Products",
    image: "/products/watch.png",
  },
  {
    name: "Beauty",
    products: "800+ Products",
    image: "/products/perfume23.png",
  },
  {
    name: "Home & Living",
    products: "1500+ Products",
    image: "/products/home.png",
  },
  {
    name: "Gaming",
    products: "950+ Products",
    image: "/products/gaming.png",
  },
];

const products = [
  {
    name: "Samsung Smartphone Pro Max",
    category: "Electronics",
    price: "₹49,999",
    oldPrice: "₹59,999",
    rating: "4.8",
    reviews: "328",
    image: "/products/phone.png",
    badge: "Best Seller",
  },
  {
    name: "Sony Premium Headphones",
    category: "Electronics",
    price: "₹8,499",
    oldPrice: "₹11,999",
    rating: "4.7",
    reviews: "214",
    image: "/products/headphones.png",
    badge: "Trending",
  },
  {
    name: "Levis Premium Denim Jacket",
    category: "Fashion",
    price: "₹3,299",
    oldPrice: "₹4,999",
    rating: "4.6",
    reviews: "156",
    image: "/products/jacket.png",
    badge: "New",
  },
  {
    name: "GlowCare Luxury Serum",
    category: "Beauty",
    price: "₹1,499",
    oldPrice: "₹2,199",
    rating: "4.9",
    reviews: "492",
    image: "/products/serum.png",
    badge: "Top Rated",
  },
];

const services = [
  {
    icon: Truck,
    title: "Free & Fast Delivery",
    description: "Free delivery on eligible orders above ₹499.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Your payments are protected with trusted security.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "Simple and hassle-free returns within 7 days.",
  },
  {
    icon: Headphones,
    title: "24/7 Customer Support",
    description: "We're always here whenever you need us.",
  },
];

export default function HomePage() {
  const [openMenu, setOpenMenu] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [email, setEmail] = useState("");

  const toggleWishlist = (index: number) => {
    setWishlist((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#171717] overflow-hidden">
      {/* =========================================================
          ANNOUNCEMENT BAR
      ========================================================= */}

      <div className="bg-[#171717] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-center text-[11px] sm:text-xs tracking-wide">
          <span className="text-[#d4af37] font-semibold mr-2">
            PRIME DEAL
          </span>

          Free shipping on orders above ₹499
          <span className="mx-2 text-gray-500">•</span>
          Easy returns within 7 days
        </div>
      </div>

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#e9e4d8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[76px] flex items-center justify-between gap-6">
          {/* LOGO */}

          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12">
              <Image
                src="/logo.png"
                alt="PrimeCart"
                fill
                className="object-contain"
              />
            </div>

            <div>
              <h1 className="text-[21px] sm:text-2xl font-bold tracking-tight text-[#151515]">
                Prime<span className="text-[#c9a227]">Cart</span>
              </h1>

              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-gray-500">
                Premium Shopping
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <Link
              href="/"
              className="text-[#c29a22] relative after:absolute after:left-0 after:-bottom-2 after:w-full after:h-[2px] after:bg-[#c9a227]"
            >
              Home
            </Link>

            <Link
              href="/login"
              className="hover:text-[#c29a27] transition"
            >
              Shop
            </Link>

            <Link
              href="/login"
              className="hover:text-[#c29a27] transition"
            >
              Categories
            </Link>

            <Link
              href="/login"
              className="hover:text-[#c29a27] transition"
            >
              Deals
            </Link>

            <Link
              href="/login"
              className="hover:text-[#c29a27] transition"
            >
              Contact
            </Link>
          </div>

          {/* DESKTOP ACTIONS */}

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              aria-label="Search"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f6f1e4] transition"
            >
              <Search size={19} strokeWidth={1.8} />
            </Link>

            <Link
              href="/login"
              aria-label="Wishlist"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f6f1e4] transition"
            >
              <Heart size={19} strokeWidth={1.8} />
            </Link>

            <Link
              href="/login"
              aria-label="Shopping Cart"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f6f1e4] transition"
            >
              <ShoppingCart size={19} strokeWidth={1.8} />
            </Link>

            <div className="w-px h-7 bg-[#e4dfd3] mx-2" />

            <Link
              href="/login"
              className="px-5 py-2.5 rounded-full border border-[#d8d3c8] text-sm font-medium hover:border-[#c9a227] hover:text-[#b28b18] transition"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="px-5 py-2.5 rounded-full bg-[#c9a227] text-white text-sm font-semibold shadow-sm hover:bg-[#b58e1e] transition"
            >
              Register
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="md:hidden w-10 h-10 rounded-full border border-[#ded9cd] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {openMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* MOBILE MENU */}

        {openMenu && (
          <div className="md:hidden border-t border-[#ebe6da] bg-white">
            <div className="max-w-7xl mx-auto px-5 py-6 flex flex-col gap-1">
              {[
                ["Home", "/"],
                ["Shop", "/login"],
                ["Categories", "/login"],
                ["Deals", "/login"],
                ["Contact", "/login"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpenMenu(false)}
                  className="px-4 py-3.5 rounded-xl hover:bg-[#faf7ef] hover:text-[#b28b18] transition font-medium"
                >
                  {label}
                </Link>
              ))}

              <div className="grid grid-cols-2 gap-3 mt-4">
                <Link
                  href="/login"
                  onClick={() => setOpenMenu(false)}
                  className="py-3 rounded-xl border border-[#dcd7cb] text-center font-medium"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setOpenMenu(false)}
                  className="py-3 rounded-xl bg-[#c9a227] text-white text-center font-semibold"
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[38px] bg-[#171717] min-h-[560px] lg:min-h-[620px]">
          {/* Decorative circles */}

          <div className="absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full border border-[#d4af37]/20" />

          <div className="absolute -bottom-44 left-[40%] w-[520px] h-[520px] rounded-full border border-[#d4af37]/10" />

          <div className="absolute top-20 right-[42%] w-2 h-2 rounded-full bg-[#d4af37]" />

          <div className="absolute bottom-32 left-[45%] w-1.5 h-1.5 rounded-full bg-[#d4af37]" />

          <div className="relative grid lg:grid-cols-2 min-h-[560px] lg:min-h-[620px]">
            {/* HERO CONTENT */}

            <div className="flex flex-col justify-center px-7 sm:px-12 lg:px-16 py-14 lg:py-16 z-10">
              <div className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#e2c65b] text-xs sm:text-sm font-medium">
                <Sparkles size={14} />
                Premium shopping, better prices
              </div>

              <h2 className="mt-7 text-5xl sm:text-6xl lg:text-[78px] leading-[0.95] font-serif text-white tracking-tight">
                Shop
                <br />
                <span className="text-[#d4af37] italic">
                  smarter.
                </span>
              </h2>

              <p className="mt-7 max-w-lg text-gray-300 text-base sm:text-lg leading-relaxed">
                Discover premium products, exclusive deals and everyday
                essentials — all in one beautiful shopping experience.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#d4af37] text-white font-semibold hover:bg-[#c39f29] transition"
                >
                  Shop Now
                  <ArrowRight
                    size={17}
                    className="group-hover:translate-x-1 transition"
                  />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition"
                >
                  Explore Deals
                  <ChevronRight size={17} />
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-8 mt-10 pt-7 border-t border-white/10">
                <div>
                  <p className="text-2xl font-bold text-white">10K+</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Happy Customers
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold text-white">5K+</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Products
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold text-white">4.8</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Star
                      size={12}
                      className="fill-[#d4af37] text-[#d4af37]"
                    />
                    Customer Rating
                  </p>
                </div>
              </div>
            </div>

            {/* HERO IMAGE */}

            <div className="relative flex items-center justify-center min-h-[320px] lg:min-h-0">
              <div className="absolute w-[330px] h-[330px] sm:w-[440px] sm:h-[440px] rounded-full bg-[#d4af37]/10 blur-2xl" />

              <Image
                src="/hero-product.png"
                alt="PrimeCart premium products"
                width={900}
                height={900}
                priority
                className="relative z-10 w-[90%] sm:w-[85%] lg:w-[105%] max-w-[650px] object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.5)]"
              />

              <div className="absolute bottom-7 right-7 sm:right-12 lg:right-16 z-20 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-[#d4af37]">
                  Featured
                </p>
                <p className="text-sm text-white font-medium mt-1">
                  Premium Collection
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TRUST BAR
      ========================================================= */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
        <div className="bg-white border border-[#e8e3d8] rounded-[25px] shadow-sm grid grid-cols-2 lg:grid-cols-4 overflow-hidden">
          {[
            {
              icon: Truck,
              title: "Free Delivery",
              text: "Above ₹499",
            },
            {
              icon: ShieldCheck,
              title: "Secure Payment",
              text: "100% protected",
            },
            {
              icon: RotateCcw,
              title: "Easy Returns",
              text: "Within 7 days",
            },
            {
              icon: Headphones,
              title: "24/7 Support",
              text: "Always available",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`p-5 sm:p-7 flex items-center gap-4 ${
                  index !== 1 && index !== 3
                    ? "border-r border-[#eee9de]"
                    : ""
                } ${
                  index >= 2
                    ? "border-t lg:border-t-0 border-[#eee9de]"
                    : ""
                }`}
              >
                <div className="w-11 h-11 rounded-2xl bg-[#faf6e9] text-[#b28b18] flex items-center justify-center shrink-0">
                  <Icon size={21} strokeWidth={1.7} />
                </div>

                <div>
                  <h3 className="font-semibold text-sm sm:text-base">
                    {item.title}
                  </h3>

                  <p className="text-gray-500 text-xs sm:text-sm mt-1">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          CATEGORIES
      ========================================================= */}

      <section
        id="categories"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16"
      >
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[#b28b18] uppercase tracking-[0.2em] text-xs font-bold">
              Explore collection
            </p>

            <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold">
              Shop by Category
            </h2>
          </div>

          <Link
            href="/login"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#b28b18] hover:gap-2 transition-all"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/categories/${category.name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace("&", "and")}`}
              className="group bg-white border border-[#e9e4d9] rounded-[22px] overflow-hidden hover:border-[#d4af37]/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-36 sm:h-40 bg-[#f8f5ed] flex items-center justify-center overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-contain p-5 group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-sm sm:text-base group-hover:text-[#b28b18] transition">
                  {category.name}
                </h3>

                <p className="text-gray-500 text-xs mt-1">
                  {category.products}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center sm:hidden mt-7">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#d4af37] text-white text-sm font-semibold"
          >
            View All Categories
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* =========================================================
          FEATURED PRODUCTS
      ========================================================= */}

      <section
        id="featured"
        className="bg-white border-y border-[#ebe6dc]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="text-center mb-10">
            <p className="text-[#b28b18] uppercase tracking-[0.2em] text-xs font-bold">
              Curated for you
            </p>

            <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold">
              Featured Products
            </h2>

            <p className="text-gray-500 max-w-xl mx-auto mt-4 text-sm sm:text-base">
              Handpicked products that combine quality, style and incredible
              value.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product, index) => (
              <div
                key={product.name}
                className="group border border-[#e8e3d8] rounded-[25px] bg-[#fdfcf9] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-64 bg-[#f7f4ed] flex items-center justify-center overflow-hidden">
                  <span className="absolute left-4 top-4 z-10 bg-[#171717] text-white text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full">
                    {product.badge}
                  </span>

                  <button
                    onClick={() => toggleWishlist(index)}
                    aria-label="Add to wishlist"
                    className="absolute right-4 top-4 z-10 w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-110 transition"
                  >
                    <Heart
                      size={17}
                      className={
                        wishlist.includes(index)
                          ? "fill-[#c9a227] text-[#c9a227]"
                          : "text-gray-700"
                      }
                    />
                  </button>

                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-widest text-[#b28b18] font-bold">
                    {product.category}
                  </p>

                  <h3 className="font-semibold mt-2 line-clamp-2 min-h-[48px]">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1 mt-3">
                    <Star
                      size={14}
                      className="fill-[#d4af37] text-[#d4af37]"
                    />

                    <span className="text-sm font-medium">
                      {product.rating}
                    </span>

                    <span className="text-xs text-gray-500">
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-xl font-bold">
                      {product.price}
                    </span>

                    <span className="text-sm text-gray-400 line-through">
                      {product.oldPrice}
                    </span>
                  </div>

                  <Link
                    href="/login"
                    className="mt-4 w-full py-3 rounded-xl bg-[#171717] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#c9a227] transition"
                  >
                    <ShoppingBag size={16} />
                    Add to Cart
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-[#d4af37] text-[#a98213] font-semibold hover:bg-[#d4af37] hover:text-white transition"
            >
              Explore All Products
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          DEALS BANNER
      ========================================================= */}

      <section id="deals" className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="relative overflow-hidden rounded-[30px] bg-[#efe8d5] border border-[#e0d4b3]">
          <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full border-[35px] border-[#d4af37]/10" />

          <div className="relative grid lg:grid-cols-2 items-center gap-8 px-7 sm:px-12 lg:px-16 py-12">
            <div>
              <div className="inline-flex items-center gap-2 text-[#a17c13] text-xs uppercase tracking-[0.2em] font-bold">
                <Clock3 size={15} />
                Limited Time Offer
              </div>

              <h2 className="mt-4 text-4xl sm:text-5xl font-serif font-bold">
                Luxury deals.
                <br />
                <span className="text-[#b18a19]">Every day.</span>
              </h2>

              <p className="mt-4 text-gray-600 max-w-lg leading-relaxed">
                Get exclusive prices on selected products before the offer
                ends. Premium quality without the premium price.
              </p>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-7 px-7 py-3.5 rounded-full bg-[#171717] text-white font-semibold hover:bg-[#c9a227] transition"
              >
                Shop Deals
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="flex lg:justify-end">
              <div className="bg-white/80 backdrop-blur-sm rounded-[25px] border border-white p-7 sm:p-9 w-full max-w-sm shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Today's offer
                </p>

                <div className="flex items-end gap-2 mt-2">
                  <span className="text-6xl font-bold text-[#171717]">
                    50
                  </span>

                  <span className="text-3xl font-bold text-[#b18a19] mb-2">
                    %
                  </span>

                  <span className="text-gray-500 mb-3">
                    OFF
                  </span>
                </div>

                <div className="h-px bg-[#e7e1d4] my-5" />

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-[#b18a19]" />
                  Selected premium products
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                  <Check size={16} className="text-[#b18a19]" />
                  Limited time availability
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY PRIMECART
      ========================================================= */}

      <section
        id="services"
        className="bg-[#171717] text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
            <div>
              <p className="text-[#d4af37] uppercase tracking-[0.2em] text-xs font-bold">
                Why PrimeCart
              </p>

              <h2 className="mt-3 text-4xl sm:text-5xl font-serif">
                Shopping made
                <br />
                <span className="text-[#d4af37] italic">
                  effortless.
                </span>
              </h2>

              <p className="mt-5 text-gray-400 leading-relaxed max-w-md">
                From discovering the right product to getting it delivered to
                your doorstep, PrimeCart is designed to make every step simple.
              </p>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-7 text-sm font-semibold text-[#d4af37] hover:gap-3 transition-all"
              >
                Discover PrimeCart
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <div
                    key={service.title}
                    className="rounded-[22px] border border-white/10 bg-white/[0.04] p-6 hover:bg-white/[0.07] hover:border-[#d4af37]/30 transition"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center">
                      <Icon size={21} strokeWidth={1.7} />
                    </div>

                    <h3 className="font-semibold mt-5">
                      {service.title}
                    </h3>

                    <p className="text-sm text-gray-400 leading-relaxed mt-2">
                      {service.description}
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="rounded-[30px] bg-white border border-[#e8e3d8] px-6 sm:px-12 py-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#faf5e6] text-[#b28b18] flex items-center justify-center">
            <Sparkles size={21} />
          </div>

          <h2 className="mt-5 text-3xl sm:text-4xl font-serif font-bold">
            Stay in the PrimeCart circle
          </h2>

          <p className="mt-3 text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
            Get first access to new arrivals, exclusive offers and premium
            deals.
          </p>

          <div className="flex flex-col sm:flex-row max-w-lg mx-auto gap-2 mt-7">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-5 py-3.5 rounded-full border border-[#ddd8cd] bg-[#faf9f6] outline-none focus:border-[#c9a227] text-sm"
            />

            <button className="px-7 py-3.5 rounded-full bg-[#171717] text-white font-semibold text-sm hover:bg-[#c9a227] transition">
              Subscribe
            </button>
          </div>

          <p className="text-[11px] text-gray-400 mt-4">
            No spam. Only useful PrimeCart updates.
          </p>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="bg-white border-t border-[#e8e3d8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* BRAND */}

            <div>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="relative w-12 h-12">
                  <Image
                    src="/logo.png"
                    alt="PrimeCart"
                    fill
                    className="object-contain"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">
                    Prime<span className="text-[#c9a227]">Cart</span>
                  </h2>

                  <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500">
                    Premium Shopping
                  </p>
                </div>
              </Link>

              <p className="text-sm text-gray-500 leading-relaxed mt-5 max-w-xs">
                Your destination for premium products, exclusive deals and a
                better way to shop online.
              </p>

              <div className="flex items-center gap-2 mt-6">
                <div className="w-9 h-9 rounded-full bg-[#faf6e9] flex items-center justify-center text-[#b28b18]">
                  <ShoppingBag size={17} />
                </div>

                <span className="text-sm font-medium">
                  Premium shopping experience
                </span>
              </div>
            </div>

            {/* SHOP */}

            <div>
              <h3 className="font-semibold text-lg">
                Shop
              </h3>

              <div className="flex flex-col gap-3 mt-5 text-sm text-gray-500">
                <Link
                  href="/login"
                  className="hover:text-[#b28b18] transition"
                >
                  All Products
                </Link>

                <Link
                  href="/login"
                  className="hover:text-[#b28b18] transition"
                >
                  Categories
                </Link>

                <Link
                  href="/login"
                  className="hover:text-[#b28b18] transition"
                >
                  Featured Products
                </Link>

                <Link
                  href="/login"
                  className="hover:text-[#b28b18] transition"
                >
                  Deals & Offers
                </Link>
              </div>
            </div>

            {/* CUSTOMER SERVICE */}

            <div>
              <h3 className="font-semibold text-lg">
                Customer Care
              </h3>

              <div className="flex flex-col gap-3 mt-5 text-sm text-gray-500">
                <Link
                  href="/login"
                  className="hover:text-[#b28b18] transition"
                >
                  Contact Us
                </Link>

                <Link
                  href="/login"
                  className="hover:text-[#b28b18] transition"
                >
                  Shipping Policy
                </Link>

                <Link
                  href="/login"
                  className="hover:text-[#b28b18] transition"
                >
                  Returns & Refunds
                </Link>

                <Link
                  href="/login"
                  className="hover:text-[#b28b18] transition"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* CONTACT */}

            <div>
              <h3 className="font-semibold text-lg">
                Need Help?
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed mt-5">
                Our support team is available whenever you need assistance.
              </p>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-[#b28b18]"
              >
                <Headphones size={17} />
                Contact Support
              </Link>

              <div className="flex items-center gap-3 mt-6 text-gray-500">
                <div className="w-9 h-9 rounded-full border border-[#e2ddd2] flex items-center justify-center">
                  <UserRound size={16} />
                </div>

                <span className="text-xs">
                  Trusted by 10,000+ shoppers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}

        <div className="border-t border-[#e8e3d8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>
              © 2026 PrimeCart. All Rights Reserved.
            </p>

            <p className="flex items-center gap-1">
              Made for modern shopping
              <span className="text-[#c9a227]">✦</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
