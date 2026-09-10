"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  Sun,
  Moon,
  Truck,
  UserRound,
  X,
  ShieldCheck,
  Headphones,
  RotateCcw,
  Clock3,
  Gem,
} from "lucide-react";

/* =========================================================
   CATEGORIES
========================================================= */

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

/* =========================================================
   FEATURED PRODUCTS
========================================================= */

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

/* =========================================================
   SERVICES
========================================================= */

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
    description: "Our support team is always here to help.",
  },
];

/* =========================================================
   HOME PAGE
========================================================= */

export default function HomePage() {
  const [openMenu, setOpenMenu] = useState(false);

  const [isDark, setIsDark] = useState(false);

  const [wishlist, setWishlist] = useState<number[]>([]);

  const [email, setEmail] = useState("");

  /* =======================================================
     LOAD SAVED THEME
  ======================================================= */

  useEffect(() => {
    const savedTheme = localStorage.getItem("primecart-theme");

    if (savedTheme === "dark") {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, []);

  /* =======================================================
     THEME TOGGLE
  ======================================================= */

  const toggleTheme = () => {
    setIsDark((current) => {
      const nextTheme = !current;

      localStorage.setItem(
        "primecart-theme",
        nextTheme ? "dark" : "light"
      );

      return nextTheme;
    });
  };

  /* =======================================================
     WISHLIST
  ======================================================= */

  const toggleWishlist = (index: number) => {
    setWishlist((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  };

  /* =======================================================
     THEME CLASSES
  ======================================================= */

  const pageBg = isDark
    ? "bg-[#171512] text-[#f8f5ed]"
    : "bg-[#fcfbf8] text-[#171717]";

  const navbarBg = isDark
    ? "bg-[#1d1b17]/95 border-[#3b3629]"
    : "bg-white/95 border-[#ebe6da]";

  const cardBg = isDark
    ? "bg-[#211f1a] border-[#39352b]"
    : "bg-white border-[#e9e4d8]";

  const mutedText = isDark
    ? "text-[#b9b4a7]"
    : "text-[#6f6b63]";

  const headingText = isDark
    ? "text-[#faf7ef]"
    : "text-[#171717]";

  const goldText = "text-[#c9a227]";

  const goldBg =
    "bg-[#c9a227] hover:bg-[#b58e1c]";

  return (
    <main
      className={`min-h-screen overflow-hidden transition-colors duration-300 ${pageBg}`}
    >
      {/* =====================================================
          ANNOUNCEMENT BAR
      ===================================================== */}

      <div
        className={
          isDark
            ? "bg-[#252117] border-b border-[#403925]"
            : "bg-[#f5f0e2] border-b border-[#e8dec4]"
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-center text-[10px] sm:text-xs tracking-wide">
          <span className={`${goldText} font-bold mr-2`}>
            PRIME OFFER
          </span>

          Free shipping on orders above ₹499

          <span className="mx-2 opacity-40">•</span>

          Easy returns within 7 days

          <span className="hidden sm:inline mx-2 opacity-40">
            •
          </span>

          <span className="hidden sm:inline">
            Premium shopping experience
          </span>
        </div>
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${navbarBg}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[76px] flex items-center justify-between gap-5">
          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12">
              <Image
                src="/logo.png"
                alt="PrimeCart Logo"
                fill
                priority
                className="object-contain"
              />
            </div>

            <div>
              <h1
                className={`text-[21px] sm:text-2xl font-bold tracking-tight ${headingText}`}
              >
                Prime
                <span className={goldText}>Cart</span>
              </h1>

              <p
                className={`text-[8px] sm:text-[9px] uppercase tracking-[0.22em] ${mutedText}`}
              >
                Premium Shopping
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <Link
              href="/"
              className={`${goldText} relative after:absolute after:left-0 after:-bottom-2 after:w-full after:h-[2px] after:bg-[#c9a227]`}
            >
              Home
            </Link>

            <Link
              href="/login"
              className="hover:text-[#c9a227] transition"
            >
              Shop
            </Link>

            <Link
              href="/login"
              className="hover:text-[#c9a227] transition"
            >
              Categories
            </Link>

            <Link
              href="/login"
              className="hover:text-[#c9a227] transition"
            >
              Deals
            </Link>

            <Link
              href="/login"
              className="hover:text-[#c9a227] transition"
            >
              Contact
            </Link>
          </div>

          {/* RIGHT ACTIONS */}

          <div className="hidden md:flex items-center gap-1">
            {/* SEARCH */}

            <Link
              href="/login"
              aria-label="Search"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                isDark
                  ? "hover:bg-[#302c23]"
                  : "hover:bg-[#f7f3e8]"
              }`}
            >
              <Search size={18} strokeWidth={1.8} />
            </Link>

            {/* WISHLIST */}

            <Link
              href="/login"
              aria-label="Wishlist"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                isDark
                  ? "hover:bg-[#302c23]"
                  : "hover:bg-[#f7f3e8]"
              }`}
            >
              <Heart size={18} strokeWidth={1.8} />
            </Link>

            {/* CART */}

            <Link
              href="/login"
              aria-label="Shopping Cart"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                isDark
                  ? "hover:bg-[#302c23]"
                  : "hover:bg-[#f7f3e8]"
              }`}
            >
              <ShoppingCart size={18} strokeWidth={1.8} />
            </Link>

            {/* THEME SWITCH */}

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`ml-1 w-10 h-10 rounded-full flex items-center justify-center transition ${
                isDark
                  ? "bg-[#302c23] text-[#e1bf45] hover:bg-[#3a352a]"
                  : "bg-[#f7f3e8] text-[#9b7713] hover:bg-[#eee5cf]"
              }`}
            >
              {isDark ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            <div
              className={`w-px h-7 mx-3 ${
                isDark
                  ? "bg-[#3b362d]"
                  : "bg-[#e4dfd4]"
              }`}
            />

            {/* LOGIN */}

            <Link
              href="/login"
              className={`px-5 py-2.5 rounded-full border text-sm font-medium transition ${
                isDark
                  ? "border-[#554d3b] hover:border-[#c9a227] hover:text-[#d8b83d]"
                  : "border-[#d8d3c8] hover:border-[#c9a227] hover:text-[#a37d12]"
              }`}
            >
              Login
            </Link>

            {/* REGISTER */}

            <Link
              href="/register"
              className={`ml-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold shadow-sm transition ${goldBg}`}
            >
              Register
            </Link>
          </div>

          {/* MOBILE */}

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDark
                  ? "bg-[#302c23] text-[#e1bf45]"
                  : "bg-[#f7f3e8] text-[#9b7713]"
              }`}
            >
              {isDark ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            <button
              onClick={() => setOpenMenu(!openMenu)}
              aria-label="Open menu"
              className={`w-10 h-10 rounded-full border flex items-center justify-center ${
                isDark
                  ? "border-[#494333]"
                  : "border-[#ded9cf]"
              }`}
            >
              {openMenu ? (
                <X size={19} />
              ) : (
                <Menu size={19} />
              )}
            </button>
          </div>
        </div>

        {/* ===================================================
            MOBILE MENU
        =================================================== */}

        {openMenu && (
          <div
            className={`md:hidden border-t ${
              isDark
                ? "bg-[#1d1b17] border-[#3b3629]"
                : "bg-white border-[#ebe6dc]"
            }`}
          >
            <div className="max-w-7xl mx-auto px-5 py-6">
              <div className="flex flex-col gap-1">
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
                    className={`px-4 py-3.5 rounded-xl font-medium transition ${
                      isDark
                        ? "hover:bg-[#2a271f] hover:text-[#d4af37]"
                        : "hover:bg-[#faf6eb] hover:text-[#b28b18]"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <Link
                  href="/login"
                  onClick={() => setOpenMenu(false)}
                  className={`py-3 rounded-xl border text-center font-medium ${
                    isDark
                      ? "border-[#514a39]"
                      : "border-[#ddd8cd]"
                  }`}
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

              {/* MOBILE THEME */}

              <button
                onClick={toggleTheme}
                className={`mt-3 w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium ${
                  isDark
                    ? "bg-[#2b281f] text-[#e0bd42]"
                    : "bg-[#f7f3e8] text-[#9a7715]"
                }`}
              >
                {isDark ? (
                  <>
                    <Sun size={17} />
                    Switch to Light Mode
                  </>
                ) : (
                  <>
                    <Moon size={17} />
                    Switch to Dark Mode
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div
          className={`relative overflow-hidden rounded-[28px] sm:rounded-[38px] border transition-colors duration-300 ${
            isDark
              ? "bg-[#242119] border-[#403a2d]"
              : "bg-white border-[#e9e4d9]"
          }`}
        >
          {/* GOLD DECORATION */}

          <div
            className={`absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full border ${
              isDark
                ? "border-[#d4af37]/15"
                : "border-[#d4af37]/20"
            }`}
          />

          <div
            className={`absolute -bottom-48 left-[38%] w-[520px] h-[520px] rounded-full border ${
              isDark
                ? "border-[#d4af37]/10"
                : "border-[#d4af37]/10"
            }`}
          />

          <div className="relative grid lg:grid-cols-2 min-h-[570px]">
            {/* HERO LEFT */}

            <div className="flex flex-col justify-center px-7 sm:px-12 lg:px-16 py-14 lg:py-16 z-10">
              <div
                className={`inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold ${
                  isDark
                    ? "bg-[#d4af37]/10 border-[#d4af37]/25 text-[#e0bf4d]"
                    : "bg-[#faf5e7] border-[#e1d3ad] text-[#a47c0d]"
                }`}
              >
                <Gem size={14} />
                Premium shopping experience
              </div>

              <h2
                className={`mt-7 text-5xl sm:text-6xl lg:text-[76px] leading-[0.94] font-serif tracking-tight ${headingText}`}
              >
                Shop
                <br />
                <span className={`${goldText} italic`}>
                  beautifully.
                </span>
              </h2>

              <p
                className={`mt-7 max-w-lg text-base sm:text-lg leading-relaxed ${mutedText}`}
              >
                Discover premium products, exclusive deals and
                everyday essentials — carefully selected for a
                better shopping experience.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="/login"
                  className={`group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold transition ${goldBg}`}
                >
                  Shop Now
                  <ArrowRight
                    size={17}
                    className="group-hover:translate-x-1 transition"
                  />
                </Link>

                <Link
                  href="/login"
                  className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border font-medium transition ${
                    isDark
                      ? "border-[#554d3d] hover:border-[#c9a227] hover:text-[#d7b53b]"
                      : "border-[#d9d4c9] hover:border-[#c9a227] hover:text-[#a17a11]"
                  }`}
                >
                  Explore Deals
                  <ChevronRight size={17} />
                </Link>
              </div>

              {/* STATS */}

              <div
                className={`flex flex-wrap items-center gap-8 mt-10 pt-7 border-t ${
                  isDark
                    ? "border-[#403a2d]"
                    : "border-[#ebe6dc]"
                }`}
              >
                <div>
                  <p className={`text-2xl font-bold ${headingText}`}>
                    10K+
                  </p>

                  <p className={`text-xs mt-1 ${mutedText}`}>
                    Happy Customers
                  </p>
                </div>

                <div>
                  <p className={`text-2xl font-bold ${headingText}`}>
                    5K+
                  </p>

                  <p className={`text-xs mt-1 ${mutedText}`}>
                    Products
                  </p>
                </div>

                <div>
                  <p className={`text-2xl font-bold ${headingText}`}>
                    4.8
                  </p>

                  <p
                    className={`text-xs mt-1 flex items-center gap-1 ${mutedText}`}
                  >
                    <Star
                      size={12}
                      className="fill-[#d4af37] text-[#d4af37]"
                    />
                    Customer Rating
                  </p>
                </div>
              </div>
            </div>

            {/* HERO RIGHT */}

            <div className="relative flex items-center justify-center min-h-[320px] lg:min-h-0">
              <div
                className={`absolute w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] rounded-full blur-2xl ${
                  isDark
                    ? "bg-[#d4af37]/10"
                    : "bg-[#d4af37]/10"
                }`}
              />

              <Image
                src="/hero-product.png"
                alt="PrimeCart Products"
                width={900}
                height={900}
                priority
                className="relative z-10 w-[92%] sm:w-[86%] lg:w-[104%] max-w-[650px] object-contain drop-shadow-[0_25px_45px_rgba(150,115,20,0.15)]"
              />

              {/* FLOATING CARD */}

              <div
                className={`absolute bottom-7 right-6 sm:right-10 z-20 backdrop-blur-md rounded-2xl px-4 py-3 border ${
                  isDark
                    ? "bg-[#29251d]/90 border-[#554b35]"
                    : "bg-white/90 border-[#e5ddca]"
                }`}
              >
                <p
                  className={`text-[9px] uppercase tracking-[0.2em] font-bold ${goldText}`}
                >
                  Prime Selection
                </p>

                <p
                  className={`text-sm font-semibold mt-1 ${headingText}`}
                >
                  Curated for you
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST FEATURES
      ===================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div
          className={`rounded-[25px] border shadow-sm grid grid-cols-2 lg:grid-cols-4 overflow-hidden ${cardBg}`}
        >
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
                  index % 2 === 0
                    ? "border-r"
                    : ""
                } ${
                  index >= 2
                    ? "border-t lg:border-t-0"
                    : ""
                } ${
                  isDark
                    ? "border-[#39352c]"
                    : "border-[#eee9df]"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isDark
                      ? "bg-[#302b20] text-[#d8b43a]"
                      : "bg-[#faf5e7] text-[#a98418]"
                  }`}
                >
                  <Icon size={20} strokeWidth={1.7} />
                </div>

                <div>
                  <h3
                    className={`font-semibold text-sm sm:text-base ${headingText}`}
                  >
                    {item.title}
                  </h3>

                  <p className={`text-xs sm:text-sm mt-1 ${mutedText}`}>
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
      ===================================================== */}

      <section
        id="categories"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16"
      >
        <div className="flex items-end justify-between mb-8">
          <div>
            <p
              className={`uppercase tracking-[0.2em] text-xs font-bold ${goldText}`}
            >
              Explore collection
            </p>

            <h2
              className={`mt-2 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold ${headingText}`}
            >
              Shop by Category
            </h2>
          </div>

          <Link
            href="/login"
            className={`hidden sm:flex items-center gap-1 text-sm font-semibold ${goldText} hover:gap-2 transition-all`}
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
              className={`group rounded-[22px] border overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${cardBg}`}
            >
              <div
                className={`h-36 sm:h-40 flex items-center justify-center overflow-hidden ${
                  isDark
                    ? "bg-[#2a271f]"
                    : "bg-[#faf7ef]"
                }`}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-contain p-5 group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-4">
                <h3
                  className={`font-semibold text-sm sm:text-base group-hover:text-[#c9a227] transition ${headingText}`}
                >
                  {category.name}
                </h3>

                <p className={`text-xs mt-1 ${mutedText}`}>
                  {category.products}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center sm:hidden mt-7">
          <Link
            href="/login"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-semibold ${goldBg}`}
          >
            View All Categories
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* =====================================================
          FEATURED PRODUCTS
      ===================================================== */}

      <section
        id="featured"
        className={`border-y transition-colors duration-300 ${
          isDark
            ? "bg-[#1c1a16] border-[#39352c]"
            : "bg-white border-[#ebe6dc]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="text-center mb-10">
            <p
              className={`uppercase tracking-[0.2em] text-xs font-bold ${goldText}`}
            >
              Curated for you
            </p>

            <h2
              className={`mt-2 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold ${headingText}`}
            >
              Featured Products
            </h2>

            <p
              className={`max-w-xl mx-auto mt-4 text-sm sm:text-base ${mutedText}`}
            >
              Handpicked products that combine quality, style
              and exceptional value.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product, index) => (
              <div
                key={product.name}
                className={`group rounded-[25px] border overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${cardBg}`}
              >
                {/* PRODUCT IMAGE */}

                <div
                  className={`relative h-64 flex items-center justify-center overflow-hidden ${
                    isDark
                      ? "bg-[#29261f]"
                      : "bg-[#faf7ef]"
                  }`}
                >
                  <span
                    className={`absolute left-4 top-4 z-10 text-[9px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full ${
                      isDark
                        ? "bg-[#d4af37] text-[#201d15]"
                        : "bg-[#29261f] text-white"
                    }`}
                  >
                    {product.badge}
                  </span>

                  <button
                    onClick={() => toggleWishlist(index)}
                    aria-label="Toggle wishlist"
                    className={`absolute right-4 top-4 z-10 w-9 h-9 rounded-full shadow-sm flex items-center justify-center hover:scale-110 transition ${
                      isDark
                        ? "bg-[#353127]"
                        : "bg-white"
                    }`}
                  >
                    <Heart
                      size={17}
                      className={
                        wishlist.includes(index)
                          ? "fill-[#c9a227] text-[#c9a227]"
                          : isDark
                          ? "text-[#ddd6c5]"
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

                {/* PRODUCT DETAILS */}

                <div className="p-5">
                  <p
                    className={`text-[10px] uppercase tracking-widest font-bold ${goldText}`}
                  >
                    {product.category}
                  </p>

                  <h3
                    className={`font-semibold mt-2 line-clamp-2 min-h-[48px] ${headingText}`}
                  >
                    {product.name}
                  </h3>

                  {/* RATING */}

                  <div className="flex items-center gap-1 mt-3">
                    <Star
                      size={14}
                      className="fill-[#d4af37] text-[#d4af37]"
                    />

                    <span
                      className={`text-sm font-medium ${headingText}`}
                    >
                      {product.rating}
                    </span>

                    <span className={`text-xs ${mutedText}`}>
                      ({product.reviews})
                    </span>
                  </div>

                  {/* PRICE */}

                  <div className="flex items-center gap-2 mt-4">
                    <span
                      className={`text-xl font-bold ${headingText}`}
                    >
                      {product.price}
                    </span>

                    <span className={`text-sm line-through ${mutedText}`}>
                      {product.oldPrice}
                    </span>
                  </div>

                  {/* CART */}

                  <Link
                    href="/login"
                    className={`mt-4 w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition ${goldBg}`}
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
              className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full border font-semibold transition ${
                isDark
                  ? "border-[#c9a227] text-[#d5b23c] hover:bg-[#c9a227] hover:text-white"
                  : "border-[#c9a227] text-[#a27c12] hover:bg-[#c9a227] hover:text-white"
              }`}
            >
              Explore All Products
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          DEALS
      ===================================================== */}

      <section
        id="deals"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-14"
      >
        <div
          className={`relative overflow-hidden rounded-[30px] border ${
            isDark
              ? "bg-[#29251d] border-[#51472f]"
              : "bg-[#f5efdf] border-[#e5d9b9]"
          }`}
        >
          <div
            className={`absolute -right-24 -top-24 w-72 h-72 rounded-full border-[35px] ${
              isDark
                ? "border-[#d4af37]/10"
                : "border-[#c9a227]/10"
            }`}
          />

          <div className="relative grid lg:grid-cols-2 items-center gap-8 px-7 sm:px-12 lg:px-16 py-12">
            <div>
              <div
                className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold ${goldText}`}
              >
                <Clock3 size={15} />
                Limited Time Offer
              </div>

              <h2
                className={`mt-4 text-4xl sm:text-5xl font-serif font-bold ${headingText}`}
              >
                Exceptional deals.
                <br />
                <span className={goldText}>
                  Everyday.
                </span>
              </h2>

              <p className={`mt-4 max-w-lg leading-relaxed ${mutedText}`}>
                Enjoy exclusive prices on selected products before
                the offer ends. Premium quality without the premium
                price.
              </p>

              <Link
                href="/login"
                className={`inline-flex items-center gap-2 mt-7 px-7 py-3.5 rounded-full text-white font-semibold transition ${goldBg}`}
              >
                Shop Deals
                <ArrowRight size={17} />
              </Link>
            </div>

            {/* OFFER CARD */}

            <div className="flex lg:justify-end">
              <div
                className={`rounded-[25px] border p-7 sm:p-9 w-full max-w-sm shadow-sm ${
                  isDark
                    ? "bg-[#332e24] border-[#564b34]"
                    : "bg-white border-[#e7dfcc]"
                }`}
              >
                <p
                  className={`text-xs uppercase tracking-[0.2em] ${mutedText}`}
                >
                  Today's offer
                </p>

                <div className="flex items-end gap-2 mt-2">
                  <span
                    className={`text-6xl font-bold ${headingText}`}
                  >
                    50
                  </span>

                  <span
                    className={`text-3xl font-bold mb-2 ${goldText}`}
                  >
                    %
                  </span>

                  <span
                    className={`mb-3 ${mutedText}`}
                  >
                    OFF
                  </span>
                </div>

                <div
                  className={`h-px my-5 ${
                    isDark
                      ? "bg-[#4b4435]"
                      : "bg-[#e7e1d4]"
                  }`}
                />

                <div
                  className={`flex items-center gap-2 text-sm ${mutedText}`}
                >
                  <Check
                    size={16}
                    className={goldText}
                  />
                  Selected premium products
                </div>

                <div
                  className={`flex items-center gap-2 text-sm mt-3 ${mutedText}`}
                >
                  <Check
                    size={16}
                    className={goldText}
                  />
                  Limited time availability
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY PRIMECART
      ===================================================== */}

      <section
        id="services"
        className={
          isDark
            ? "bg-[#201e19] border-y border-[#39352c]"
            : "bg-[#f7f4ec] border-y border-[#e9e3d6]"
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
            <div>
              <p
                className={`uppercase tracking-[0.2em] text-xs font-bold ${goldText}`}
              >
                Why PrimeCart
              </p>

              <h2
                className={`mt-3 text-4xl sm:text-5xl font-serif ${headingText}`}
              >
                Shopping made
                <br />
                <span className={`${goldText} italic`}>
                  effortless.
                </span>
              </h2>

              <p
                className={`mt-5 leading-relaxed max-w-md ${mutedText}`}
              >
                From discovering the right product to getting it
                delivered to your doorstep, PrimeCart is designed
                around a simple and premium shopping experience.
              </p>

              <Link
                href="/login"
                className={`inline-flex items-center gap-2 mt-7 text-sm font-semibold ${goldText} hover:gap-3 transition-all`}
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
                    className={`rounded-[22px] border p-6 transition ${
                      isDark
                        ? "bg-[#29261f] border-[#443e31] hover:border-[#c9a227]/40"
                        : "bg-white border-[#e7e1d6] hover:border-[#d4af37]/50"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                        isDark
                          ? "bg-[#373126] text-[#d7b43e]"
                          : "bg-[#faf5e7] text-[#a68116]"
                      }`}
                    >
                      <Icon
                        size={21}
                        strokeWidth={1.7}
                      />
                    </div>

                    <h3
                      className={`font-semibold mt-5 ${headingText}`}
                    >
                      {service.title}
                    </h3>

                    <p
                      className={`text-sm leading-relaxed mt-2 ${mutedText}`}
                    >
                      {service.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          NEWSLETTER
      ===================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div
          className={`rounded-[30px] border px-6 sm:px-12 py-12 text-center ${
            isDark
              ? "bg-[#211f1a] border-[#3e392e]"
              : "bg-white border-[#e8e3d8]"
          }`}
        >
          <div
            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
              isDark
                ? "bg-[#352f22] text-[#d6b33d]"
                : "bg-[#faf5e7] text-[#a68116]"
            }`}
          >
            <Sparkles size={21} />
          </div>

          <h2
            className={`mt-5 text-3xl sm:text-4xl font-serif font-bold ${headingText}`}
          >
            Stay in the PrimeCart circle
          </h2>

          <p
            className={`mt-3 max-w-xl mx-auto text-sm sm:text-base ${mutedText}`}
          >
            Get first access to new arrivals, exclusive offers
            and premium deals.
          </p>

          <div className="flex flex-col sm:flex-row max-w-lg mx-auto gap-2 mt-7">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className={`flex-1 px-5 py-3.5 rounded-full border outline-none text-sm transition ${
                isDark
                  ? "bg-[#2b281f] border-[#4b4435] text-white placeholder:text-[#8e897d] focus:border-[#c9a227]"
                  : "bg-[#faf9f6] border-[#ddd8cd] text-[#171717] placeholder:text-gray-400 focus:border-[#c9a227]"
              }`}
            />

            <button
              className={`px-7 py-3.5 rounded-full text-white font-semibold text-sm transition ${goldBg}`}
            >
              Subscribe
            </button>
          </div>

          <p
            className={`text-[11px] mt-4 ${mutedText}`}
          >
            No spam. Only useful PrimeCart updates.
          </p>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className={`border-t ${
          isDark
            ? "bg-[#1b1915] border-[#39352c]"
            : "bg-white border-[#e8e3d8]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* BRAND */}

            <div>
              <Link
                href="/"
                className="flex items-center gap-2.5"
              >
                <div className="relative w-12 h-12">
                  <Image
                    src="/logo.png"
                    alt="PrimeCart"
                    fill
                    className="object-contain"
                  />
                </div>

                <div>
                  <h2
                    className={`text-2xl font-bold ${headingText}`}
                  >
                    Prime
                    <span className={goldText}>
                      Cart
                    </span>
                  </h2>

                  <p
                    className={`text-[9px] uppercase tracking-[0.2em] ${mutedText}`}
                  >
                    Premium Shopping
                  </p>
                </div>
              </Link>

              <p
                className={`text-sm leading-relaxed mt-5 max-w-xs ${mutedText}`}
              >
                Your destination for premium products, exclusive
                deals and a better way to shop online.
              </p>

              <div className="flex items-center gap-2 mt-6">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    isDark
                      ? "bg-[#302b20] text-[#d6b33d]"
                      : "bg-[#faf5e7] text-[#a68116]"
                  }`}
                >
                  <ShoppingBag size={17} />
                </div>

                <span
                  className={`text-sm font-medium ${headingText}`}
                >
                  Premium shopping experience
                </span>
              </div>
            </div>

            {/* SHOP */}

            <div>
              <h3
                className={`font-semibold text-lg ${headingText}`}
              >
                Shop
              </h3>

              <div
                className={`flex flex-col gap-3 mt-5 text-sm ${mutedText}`}
              >
                <Link
                  href="/login"
                  className="hover:text-[#c9a227] transition"
                >
                  All Products
                </Link>

                <Link
                  href="/login"
                  className="hover:text-[#c9a227] transition"
                >
                  Categories
                </Link>

                <Link
                  href="/login"
                  className="hover:text-[#c9a227] transition"
                >
                  Featured Products
                </Link>

                <Link
                  href="/login"
                  className="hover:text-[#c9a227] transition"
                >
                  Deals & Offers
                </Link>
              </div>
            </div>

            {/* CUSTOMER CARE */}

            <div>
              <h3
                className={`font-semibold text-lg ${headingText}`}
              >
                Customer Care
              </h3>

              <div
                className={`flex flex-col gap-3 mt-5 text-sm ${mutedText}`}
              >
                <Link
                  href="/login"
                  className="hover:text-[#c9a227] transition"
                >
                  Contact Us
                </Link>

                <Link
                  href="/login"
                  className="hover:text-[#c9a227] transition"
                >
                  Shipping Policy
                </Link>

                <Link
                  href="/login"
                  className="hover:text-[#c9a227] transition"
                >
                  Returns & Refunds
                </Link>

                <Link
                  href="/login"
                  className="hover:text-[#c9a227] transition"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* HELP */}

            <div>
              <h3
                className={`font-semibold text-lg ${headingText}`}
              >
                Need Help?
              </h3>

              <p
                className={`text-sm leading-relaxed mt-5 ${mutedText}`}
              >
                Our support team is available whenever you need
                assistance with your PrimeCart experience.
              </p>

              <Link
                href="/login"
                className={`inline-flex items-center gap-2 mt-5 text-sm font-semibold ${goldText}`}
              >
                <Headphones size={17} />
                Contact Support
              </Link>

              <div
                className={`flex items-center gap-3 mt-6 ${mutedText}`}
              >
                <div
                  className={`w-9 h-9 rounded-full border flex items-center justify-center ${
                    isDark
                      ? "border-[#4a4436]"
                      : "border-[#e2ddd2]"
                  }`}
                >
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

        <div
          className={`border-t ${
            isDark
              ? "border-[#39352c]"
              : "border-[#e8e3d8]"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <p className={mutedText}>
              © 2026 PrimeCart. All Rights Reserved.
            </p>

            <p
              className={`flex items-center gap-1 ${mutedText}`}
            >
              Crafted for modern shopping
              <span className={goldText}>✦</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
