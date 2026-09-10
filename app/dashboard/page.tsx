"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  MapPin,
  Package,
  Moon,
  Sun,
  Star,
  ArrowRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  LogOut,
  UserCircle,
  ShoppingBag,
  Zap,
  Percent,
  Sparkles,
  Smartphone,
  Shirt,
  Sparkle,
  Home,
  Dumbbell,
  BookOpen,
  Watch,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const categories = [
  {
    name: "Electronics",
    icon: Smartphone,
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Fashion",
    icon: Shirt,
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Beauty",
    icon: Sparkle,
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Home & Kitchen",
    icon: Home,
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Sports",
    icon: Dumbbell,
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Books",
    icon: BookOpen,
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Watches",
    icon: Watch,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
  },
];

const products = [
  {
    id: 1,
    name: "Samsung Galaxy Smartphone Pro Max",
    category: "Electronics",
    price: 54999,
    oldPrice: 64999,
    discount: "15% off",
    rating: 4.8,
    reviews: 1248,
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Sony Wireless Noise Cancelling Headphones",
    category: "Electronics",
    price: 12499,
    oldPrice: 15999,
    discount: "22% off",
    rating: 4.7,
    reviews: 856,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
    badge: "Top Rated",
  },
  {
    id: 3,
    name: "Levis Premium Denim Jacket",
    category: "Fashion",
    price: 3499,
    oldPrice: 4999,
    discount: "30% off",
    rating: 4.6,
    reviews: 524,
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80",
    badge: "Trending",
  },
  {
    id: 4,
    name: "GlowCare Vitamin C Face Serum",
    category: "Beauty",
    price: 899,
    oldPrice: 1299,
    discount: "31% off",
    rating: 4.5,
    reviews: 2134,
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=700&q=80",
    badge: "Popular",
  },
  {
    id: 5,
    name: "Premium Smart Watch Series 9",
    category: "Watches",
    price: 5999,
    oldPrice: 7999,
    discount: "25% off",
    rating: 4.6,
    reviews: 734,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
    badge: "Deal",
  },
  {
    id: 6,
    name: "Modern Home Ceramic Table Set",
    category: "Home & Kitchen",
    price: 2199,
    oldPrice: 2999,
    discount: "27% off",
    rating: 4.4,
    reviews: 318,
    image:
      "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=700&q=80",
    badge: "New",
  },
  {
    id: 7,
    name: "Premium Running Sports Shoes",
    category: "Sports",
    price: 2899,
    oldPrice: 3999,
    discount: "28% off",
    rating: 4.5,
    reviews: 642,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
    badge: "Trending",
  },
  {
    id: 8,
    name: "Classic Leather Analog Watch",
    category: "Watches",
    price: 4299,
    oldPrice: 5999,
    discount: "28% off",
    rating: 4.7,
    reviews: 451,
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80",
    badge: "Top Rated",
  },
];

const deals = [
  {
    title: "Electronics Mega Sale",
    subtitle: "Up to 60% OFF",
    text: "Smartphones, laptops & accessories",
    image:
      "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Fashion Fest",
    subtitle: "Starting ₹499",
    text: "Latest styles for every occasion",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Home Essentials",
    subtitle: "Up to 50% OFF",
    text: "Upgrade your home today",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function DashboardPage() {
  const supabase = createClient();

  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("PrimeCart User");
  const [userEmail, setUserEmail] = useState("");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cartCount, setCartCount] = useState(2);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const savedTheme = localStorage.getItem("primecart-theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
    }

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const metadata = user.user_metadata || {};

        setUserName(
          metadata.full_name ||
            metadata.name ||
            user.email?.split("@")[0] ||
            "PrimeCart User"
        );

        setUserEmail(user.email || "");
      }
    };

    loadUser();
  }, [supabase]);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);

    localStorage.setItem(
      "primecart-theme",
      next ? "dark" : "light"
    );
  };

  const toggleWishlist = (id: number) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const addToCart = () => {
    setCartCount((count) => count + 1);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter(
          (product) => product.category === activeCategory
        );

  const searchedProducts = filteredProducts.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-[#0d0d0c] text-white"
          : "bg-[#f6f5f2] text-[#222]"
      }`}
    >
      {/* ================= TOP OFFER BAR ================= */}
      <div className="bg-[#b88728] px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        Free shipping on orders above ₹999
        <span className="mx-2 opacity-50">•</span>
        Easy returns within 7 days
      </div>

      {/* ================= NAVBAR ================= */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
          darkMode
            ? "border-[#292722] bg-[#11110f]/95"
            : "border-[#e8e3da] bg-white/95"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 lg:hidden"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <img
              src="/logo.png"
              alt="PrimeCart"
              className="h-10 w-auto object-contain sm:h-11"
            />
          </Link>

          {/* Location */}
          <button
            type="button"
            className={`hidden items-center gap-2 rounded-xl px-3 py-2 text-left xl:flex ${
              darkMode
                ? "hover:bg-[#1b1a17]"
                : "hover:bg-[#faf8f3]"
            }`}
          >
            <MapPin
              size={18}
              className="text-[#c49635]"
            />

            <div>
              <p
                className={`text-[10px] ${
                  darkMode
                    ? "text-gray-500"
                    : "text-gray-500"
                }`}
              >
                Deliver to
              </p>

              <p className="text-xs font-semibold">
                Maharashtra, India
              </p>
            </div>
          </button>

          {/* Search */}
          <div className="relative mx-auto hidden max-w-2xl flex-1 md:block">
            <Search
              size={19}
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                darkMode
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for products, brands and more..."
              className={`h-12 w-full rounded-xl border pl-11 pr-14 text-sm outline-none transition ${
                darkMode
                  ? "border-[#39362f] bg-[#1a1917] text-white placeholder:text-gray-600 focus:border-[#c49635]"
                  : "border-[#ded9d0] bg-[#f8f7f4] text-[#222] placeholder:text-gray-400 focus:border-[#c49635]"
              }`}
            />

            <button
              type="button"
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-[#c49635] text-white"
            >
              <Search size={16} />
            </button>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* Theme */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                darkMode
                  ? "text-[#d9ad55] hover:bg-[#1d1b18]"
                  : "text-[#92701f] hover:bg-[#faf8f3]"
              }`}
            >
              {darkMode ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>

            {/* Account */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() =>
                  setAccountOpen(!accountOpen)
                }
                className={`flex items-center gap-2 rounded-xl px-2 py-2 ${
                  darkMode
                    ? "hover:bg-[#1d1b18]"
                    : "hover:bg-[#faf8f3]"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c49635] text-xs font-bold text-white">
                  {userName
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="hidden text-left lg:block">
                  <p className="max-w-[100px] truncate text-xs font-semibold">
                    {userName}
                  </p>
                  <p
                    className={`text-[10px] ${
                      darkMode
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    Account
                  </p>
                </div>

                <ChevronDown size={14} />
              </button>

              {accountOpen && (
                <div
                  className={`absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border p-2 shadow-2xl ${
                    darkMode
                      ? "border-[#35322c] bg-[#181714]"
                      : "border-[#e6e0d7] bg-white"
                  }`}
                >
                  <div className="border-b px-3 pb-3 pt-2">
                    <p className="truncate text-sm font-semibold">
                      {userName}
                    </p>
                    <p
                      className={`truncate text-xs ${
                        darkMode
                          ? "text-gray-500"
                          : "text-gray-400"
                      }`}
                    >
                      {userEmail}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <UserCircle size={17} />
                    My Profile
                  </Link>

                  <Link
                    href="/orders"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <Package size={17} />
                    My Orders
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${
                darkMode
                  ? "hover:bg-[#1d1b18]"
                  : "hover:bg-[#faf8f3]"
              }`}
            >
              <Heart size={20} />

              {wishlist.length > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c49635] px-1 text-[9px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className={`relative flex h-10 items-center gap-2 rounded-xl px-2 sm:px-3 ${
                darkMode
                  ? "hover:bg-[#1d1b18]"
                  : "hover:bg-[#faf8f3]"
              }`}
            >
              <ShoppingCart size={21} />

              <span className="hidden text-xs font-semibold lg:block">
                Cart
              </span>

              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c49635] px-1 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <div className="border-t px-4 py-3 md:hidden">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products and brands..."
              className={`h-11 w-full rounded-xl border pl-11 pr-4 text-sm outline-none ${
                darkMode
                  ? "border-[#39362f] bg-[#1a1917]"
                  : "border-[#ded9d0] bg-[#f8f7f4]"
              }`}
            />
          </div>
        </div>

        {/* Category nav */}
        <div
          className={`hidden border-t lg:block ${
            darkMode
              ? "border-[#292722]"
              : "border-[#eee9e1]"
          }`}
        >
          <div className="mx-auto flex h-11 max-w-[1500px] items-center justify-between overflow-x-auto px-4 sm:px-6 lg:px-8">
            {[
              "All",
              "Electronics",
              "Fashion",
              "Beauty",
              "Home & Kitchen",
              "Sports",
              "Books",
              "Watches",
              "Deals",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setActiveCategory(
                    item === "Deals" ? "All" : item
                  )
                }
                className={`whitespace-nowrap px-3 text-xs font-medium transition ${
                  activeCategory === item
                    ? "font-bold text-[#b27f1d]"
                    : darkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-[#b27f1d]"
                }`}
              >
                {item === "Deals" && (
                  <Zap
                    size={13}
                    className="mr-1 inline"
                  />
                )}
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ================= MOBILE SIDEBAR ================= */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-[290px] transform transition-transform duration-300 lg:hidden ${
          menuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } ${
          darkMode
            ? "bg-[#151411]"
            : "bg-white"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b px-5">
          <img
            src="/logo.png"
            alt="PrimeCart"
            className="h-10 w-auto"
          />

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
          >
            <X size={21} />
          </button>
        </div>

        <div className="p-4">
          <div
            className={`rounded-2xl p-4 ${
              darkMode
                ? "bg-[#211f1a]"
                : "bg-[#faf7ef]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c49635] text-sm font-bold text-white">
                {userName
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  Hello, {userName}
                </p>
                <p className="text-xs text-gray-500">
                  Welcome to PrimeCart
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-1">
            <MobileNav
              href="/dashboard"
              icon={<ShoppingBag size={18} />}
              label="Shop Home"
              onClick={() => setMenuOpen(false)}
            />

            <MobileNav
              href="/products"
              icon={<Package size={18} />}
              label="All Products"
              onClick={() => setMenuOpen(false)}
            />

            <MobileNav
              href="/orders"
              icon={<Package size={18} />}
              label="My Orders"
              onClick={() => setMenuOpen(false)}
            />

            <MobileNav
              href="/wishlist"
              icon={<Heart size={18} />}
              label="Wishlist"
              onClick={() => setMenuOpen(false)}
            />

            <MobileNav
              href="/cart"
              icon={<ShoppingCart size={18} />}
              label="Shopping Cart"
              onClick={() => setMenuOpen(false)}
            />

            <MobileNav
              href="/profile"
              icon={<User size={18} />}
              label="My Profile"
              onClick={() => setMenuOpen(false)}
            />

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-500"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="mx-auto max-w-[1500px] px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-5">
          <p
            className={`text-xs font-medium ${
              darkMode
                ? "text-[#d5a94b]"
                : "text-[#ad7d20]"
            }`}
          >
            PrimeCart Shopping
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {userName.split(" ")[0]} 👋
          </h1>
        </div>

        {/* ================= HERO ================= */}
        <section className="relative overflow-hidden rounded-3xl bg-[#171512]">
          <img
            src={deals[0].image}
            alt="Electronics sale"
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" />

          <div className="relative min-h-[310px] px-6 py-10 sm:min-h-[360px] sm:px-10 sm:py-14 lg:px-16">
            <div className="max-w-xl text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs backdrop-blur">
                <Sparkles size={13} />
                PrimeCart Exclusive
              </div>

              <h2 className="text-3xl font-bold leading-tight sm:text-5xl">
                Upgrade your tech.
                <br />
                <span className="text-[#e1b85a]">
                  Save more today.
                </span>
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-white/70 sm:text-base">
                Discover smartphones, headphones, laptops and
                more from your favourite brands at incredible
                prices.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setActiveCategory("Electronics")
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#c49635] px-5 text-sm font-bold text-white transition hover:bg-[#ae8128]"
                >
                  Shop Electronics
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  View Deals
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SERVICES ================= */}
        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Service
            icon={<Truck size={20} />}
            title="Free Delivery"
            text="On orders above ₹999"
            darkMode={darkMode}
          />

          <Service
            icon={<RotateCcw size={20} />}
            title="Easy Returns"
            text="7 day return policy"
            darkMode={darkMode}
          />

          <Service
            icon={<ShieldCheck size={20} />}
            title="Secure Payment"
            text="100% protected checkout"
            darkMode={darkMode}
          />

          <Service
            icon={<Headphones size={20} />}
            title="24/7 Support"
            text="We're here to help"
            darkMode={darkMode}
          />
        </section>

        {/* ================= CATEGORIES ================= */}
        <section className="mt-9">
          <SectionHeading
            title="Shop by Category"
            subtitle="Explore our most popular categories"
            link="/categories"
            darkMode={darkMode}
          />

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() =>
                    setActiveCategory(category.name)
                  }
                  className={`group overflow-hidden rounded-2xl border text-left transition ${
                    darkMode
                      ? "border-[#2e2b25] bg-[#151411] hover:border-[#66522e]"
                      : "border-[#e7e1d8] bg-white hover:border-[#d9bd78]"
                  }`}
                >
                  <div className="relative h-28 overflow-hidden sm:h-32">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-black/25" />

                    <div className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-[#a97920]">
                      <Icon size={16} />
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="text-xs font-bold">
                      {category.name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================= DEALS ================= */}
        <section className="mt-10">
          <SectionHeading
            title="Deals of the Day"
            subtitle="Limited-time offers you don't want to miss"
            link="/products"
            darkMode={darkMode}
            deal
          />

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {deals.map((deal) => (
              <div
                key={deal.title}
                className="group relative min-h-[210px] overflow-hidden rounded-2xl"
              >
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />

                <div className="relative flex min-h-[210px] flex-col justify-center p-6 text-white">
                  <p className="text-xs font-medium text-[#e4c56f]">
                    {deal.subtitle}
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    {deal.title}
                  </h3>

                  <p className="mt-2 max-w-[220px] text-xs text-white/65">
                    {deal.text}
                  </p>

                  <button
                    type="button"
                    className="mt-4 flex w-fit items-center gap-1 text-xs font-bold"
                  >
                    Shop now
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= PRODUCTS ================= */}
        <section className="mt-10">
          <SectionHeading
            title={
              activeCategory === "All"
                ? "Featured Products"
                : activeCategory
            }
            subtitle="Handpicked products at great prices"
            link="/products"
            darkMode={darkMode}
          />

          {/* Category filters */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {[
              "All",
              "Electronics",
              "Fashion",
              "Beauty",
              "Home & Kitchen",
              "Sports",
              "Watches",
            ].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setActiveCategory(category)
                }
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  activeCategory === category
                    ? "border-[#c49635] bg-[#c49635] text-white"
                    : darkMode
                    ? "border-[#38342d] text-gray-400 hover:border-[#c49635]"
                    : "border-[#ddd7cd] bg-white text-gray-600 hover:border-[#c49635]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {searchedProducts.length === 0 ? (
            <div
              className={`mt-5 rounded-2xl border py-16 text-center ${
                darkMode
                  ? "border-[#2e2b25] bg-[#151411]"
                  : "border-[#e7e1d8] bg-white"
              }`}
            >
              <Search
                size={35}
                className="mx-auto text-gray-400"
              />

              <h3 className="mt-3 font-bold">
                No products found
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Try searching for another product.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {searchedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  darkMode={darkMode}
                  isWishlisted={wishlist.includes(
                    product.id
                  )}
                  onWishlist={() =>
                    toggleWishlist(product.id)
                  }
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </section>

        {/* ================= BIG PROMOTION ================= */}
        <section
          className={`mt-10 overflow-hidden rounded-3xl ${
            darkMode
              ? "bg-[#201c16]"
              : "bg-[#f1e4c5]"
          }`}
        >
          <div className="grid items-center lg:grid-cols-2">
            <div className="p-7 sm:p-10 lg:p-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c49635] px-3 py-1.5 text-xs font-bold text-white">
                <Percent size={13} />
                PRIME DEAL
              </div>

              <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                Big savings.
                <br />
                Better shopping.
              </h2>

              <p
                className={`mt-3 max-w-lg text-sm leading-6 ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              >
                Get amazing deals across electronics, fashion,
                beauty, home essentials and more. Your favourite
                products are just a click away.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#c49635] px-5 text-sm font-bold text-white transition hover:bg-[#ae8128]"
              >
                Explore all deals
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="relative hidden h-[300px] lg:block">
              <img
                src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1000&q=80"
                alt="PrimeCart shopping"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#f1e4c5] to-transparent dark:from-[#201c16]" />
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="mt-12">
          <div
            className={`grid gap-8 border-t py-10 sm:grid-cols-2 lg:grid-cols-4 ${
              darkMode
                ? "border-[#2b2822]"
                : "border-[#e4ded4]"
            }`}
          >
            <div>
              <img
                src="/logo.png"
                alt="PrimeCart"
                className={`h-10 w-auto ${
                  darkMode ? "brightness-0 invert" : ""
                }`}
              />

              <p
                className={`mt-4 max-w-xs text-xs leading-6 ${
                  darkMode
                    ? "text-gray-500"
                    : "text-gray-500"
                }`}
              >
                Your trusted destination for quality products,
                great deals and a smooth shopping experience.
              </p>
            </div>

            <FooterColumn
              title="Shop"
              links={[
                "All Products",
                "Electronics",
                "Fashion",
                "Beauty",
              ]}
              darkMode={darkMode}
            />

            <FooterColumn
              title="Customer Care"
              links={[
                "My Orders",
                "Returns",
                "Help Center",
                "Contact Us",
              ]}
              darkMode={darkMode}
            />

            <FooterColumn
              title="Account"
              links={[
                "My Profile",
                "Wishlist",
                "Shopping Cart",
                "Settings",
              ]}
              darkMode={darkMode}
            />
          </div>

          <div
            className={`flex flex-col justify-between gap-3 border-t py-5 text-xs sm:flex-row ${
              darkMode
                ? "border-[#2b2822] text-gray-600"
                : "border-[#e4ded4] text-gray-400"
            }`}
          >
            <p>
              © 2026 PrimeCart. All rights reserved.
            </p>

            <div className="flex gap-5">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/help">Help</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function ProductCard({
  product,
  darkMode,
  isWishlisted,
  onWishlist,
  onAddToCart,
}: {
  product: (typeof products)[number];
  darkMode: boolean;
  isWishlisted: boolean;
  onWishlist: () => void;
  onAddToCart: () => void;
}) {
  return (
    <div
      className={`group overflow-hidden rounded-2xl border transition ${
        darkMode
          ? "border-[#2e2b25] bg-[#151411] hover:border-[#5c4b2d]"
          : "border-[#e5dfd6] bg-white hover:border-[#d6bb7a] hover:shadow-lg"
      }`}
    >
      {/* Image */}
      <div
        className={`relative aspect-square overflow-hidden ${
          darkMode
            ? "bg-[#211f1a]"
            : "bg-[#f8f6f1]"
        }`}
      >
        <Link href={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Badge */}
        <span className="absolute left-2 top-2 rounded-md bg-[#c49635] px-2 py-1 text-[9px] font-bold text-white sm:left-3 sm:top-3">
          {product.badge}
        </span>

        {/* Wishlist */}
        <button
          type="button"
          onClick={onWishlist}
          className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur sm:right-3 sm:top-3 ${
            darkMode
              ? "bg-black/50 text-white"
              : "bg-white/90 text-gray-600"
          }`}
        >
          <Heart
            size={16}
            fill={
              isWishlisted
                ? "currentColor"
                : "none"
            }
            className={
              isWishlisted
                ? "text-[#c49635]"
                : ""
            }
          />
        </button>
      </div>

      {/* Details */}
      <div className="p-3 sm:p-4">
        <p
          className={`text-[10px] font-semibold uppercase tracking-wide ${
            darkMode
              ? "text-[#d5a94b]"
              : "text-[#ad7d20]"
          }`}
        >
          {product.category}
        </p>

        <Link href={`/products/${product.id}`}>
          <h3 className="mt-1 line-clamp-2 min-h-[38px] text-xs font-semibold leading-5 sm:text-sm">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1">
          <span className="inline-flex items-center gap-1 rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {product.rating}
            <Star
              size={9}
              fill="currentColor"
            />
          </span>

          <span
            className={`text-[10px] ${
              darkMode
                ? "text-gray-600"
                : "text-gray-400"
            }`}
          >
            ({product.reviews.toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-base font-bold sm:text-lg">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          <span
            className={`text-[10px] line-through ${
              darkMode
                ? "text-gray-600"
                : "text-gray-400"
            }`}
          >
            ₹{product.oldPrice.toLocaleString("en-IN")}
          </span>

          <span className="text-[10px] font-bold text-green-600">
            {product.discount}
          </span>
        </div>

        {/* Cart */}
        <button
          type="button"
          onClick={onAddToCart}
          className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#c49635] text-xs font-bold text-white transition hover:bg-[#ae8128]"
        >
          <ShoppingCart size={14} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
  link,
  darkMode,
  deal = false,
}: {
  title: string;
  subtitle: string;
  link: string;
  darkMode: boolean;
  deal?: boolean;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          {deal && (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c49635] text-white">
              <Zap size={14} />
            </div>
          )}

          <h2 className="text-xl font-bold sm:text-2xl">
            {title}
          </h2>
        </div>

        <p
          className={`mt-1 text-xs ${
            darkMode
              ? "text-gray-500"
              : "text-gray-500"
          }`}
        >
          {subtitle}
        </p>
      </div>

      <Link
        href={link}
        className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#ad7d20]"
      >
        View all
        <ChevronRight size={14} />
      </Link>
    </div>
  );
}

function Service({
  icon,
  title,
  text,
  darkMode,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 sm:p-4 ${
        darkMode
          ? "border-[#2e2b25] bg-[#151411]"
          : "border-[#e6e0d7] bg-white"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          darkMode
            ? "bg-[#292319] text-[#d5a94b]"
            : "bg-[#fbf1dc] text-[#ad7d20]"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs font-bold">
          {title}
        </p>

        <p
          className={`mt-0.5 truncate text-[10px] ${
            darkMode
              ? "text-gray-600"
              : "text-gray-400"
          }`}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function MobileNav({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
    >
      {icon}
      {label}
    </Link>
  );
}

function FooterColumn({
  title,
  links,
  darkMode,
}: {
  title: string;
  links: string[];
  darkMode: boolean;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold">{title}</h3>

      <div
        className={`mt-4 space-y-3 text-xs ${
          darkMode
            ? "text-gray-500"
            : "text-gray-500"
        }`}
      >
        {links.map((link) => (
          <Link
            key={link}
            href="/products"
            className="block transition hover:text-[#b27f1d]"
          >
            {link}
          </Link>
        ))}
      </div>
    </div>
  );
}
