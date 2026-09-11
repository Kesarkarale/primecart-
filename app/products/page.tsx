"use client";

import {
  ChevronDown,
  Filter,
  Heart,
  MapPin,
  Menu,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  stock: number;
  image: string;
  badge?: string;
};

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Samsung Galaxy Smartphone Pro Max",
    category: "Electronics",
    price: 64999,
    originalPrice: 74999,
    rating: 4.6,
    reviews: 2847,
    stock: 18,
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85",
    badge: "Best Seller",
  },
  {
    id: "2",
    name: "Sony Wireless Noise Cancelling Headphones",
    category: "Electronics",
    price: 18999,
    originalPrice: 24999,
    rating: 4.7,
    reviews: 1829,
    stock: 25,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
    badge: "Top Rated",
  },
  {
    id: "3",
    name: "Levis Premium Denim Jacket",
    category: "Fashion",
    price: 2999,
    originalPrice: 4499,
    rating: 4.5,
    reviews: 934,
    stock: 32,
    image:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=85",
    badge: "Trending",
  },
  {
    id: "4",
    name: "GlowCare Vitamin C Face Serum",
    category: "Beauty",
    price: 799,
    originalPrice: 1199,
    rating: 4.4,
    reviews: 1256,
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85",
    badge: "Popular",
  },
  {
    id: "5",
    name: "Premium Smart Watch Series 9",
    category: "Electronics",
    price: 4999,
    originalPrice: 6999,
    rating: 4.3,
    reviews: 756,
    stock: 21,
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=85",
    badge: "New",
  },
  {
    id: "6",
    name: "Premium Ceramic Home Dinner Set",
    category: "Home & Kitchen",
    price: 2499,
    originalPrice: 3999,
    rating: 4.5,
    reviews: 421,
    stock: 14,
    image:
      "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=900&q=85",
    badge: "Deal",
  },
  {
    id: "7",
    name: "Premium Running Sports Shoes",
    category: "Sports",
    price: 3499,
    originalPrice: 4999,
    rating: 4.6,
    reviews: 638,
    stock: 28,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    badge: "Best Seller",
  },
  {
    id: "8",
    name: "Premium Classic Leather Watch",
    category: "Fashion",
    price: 5999,
    originalPrice: 7999,
    rating: 4.4,
    reviews: 385,
    stock: 16,
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85",
    badge: "Premium",
  },
  {
    id: "9",
    name: "Apple Style Wireless Earbuds Pro",
    category: "Electronics",
    price: 6999,
    originalPrice: 9999,
    rating: 4.5,
    reviews: 1142,
    stock: 30,
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85",
    badge: "Hot Deal",
  },
  {
    id: "10",
    name: "Minimal Premium Women's Handbag",
    category: "Fashion",
    price: 2199,
    originalPrice: 3299,
    rating: 4.4,
    reviews: 542,
    stock: 19,
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85",
    badge: "Trending",
  },
  {
    id: "11",
    name: "Modern Home Table Lamp",
    category: "Home & Kitchen",
    price: 1499,
    originalPrice: 2299,
    rating: 4.3,
    reviews: 284,
    stock: 24,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
    badge: "Popular",
  },
  {
    id: "12",
    name: "Premium Fitness Training Bag",
    category: "Sports",
    price: 1799,
    originalPrice: 2499,
    rating: 4.5,
    reviews: 319,
    stock: 26,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
    badge: "New",
  },
];

const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Beauty",
  "Home & Kitchen",
  "Sports",
  "Books",
];

export default function ProductsPage() {
  const supabase = createClient();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [userName, setUserName] = useState("Account");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileFilter, setMobileFilter] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem("primecart-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }

    const savedWishlist = localStorage.getItem("primecart-wishlist");

    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);

        if (Array.isArray(parsed)) {
          setWishlist(parsed);
        }
      } catch {
        setWishlist([]);
      }
    }

    const savedCart = localStorage.getItem("primecart-cart");

    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);

        if (Array.isArray(cart)) {
          setCartCount(
            cart.reduce(
              (total: number, item: { quantity?: number }) =>
                total + Number(item.quantity || 1),
              0
            )
          );
        }
      } catch {
        setCartCount(0);
      }
    }

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserName(
          user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Account"
        );
      }
    };

    loadUser();
  }, [supabase]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("primecart-theme", theme);
  }, [theme]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const toggleWishlist = (id: string) => {
    let updated: string[];

    if (wishlist.includes(id)) {
      updated = wishlist.filter((item) => item !== id);
    } else {
      updated = [...wishlist, id];
    }

    setWishlist(updated);
    localStorage.setItem("primecart-wishlist", JSON.stringify(updated));
  };

  const addToCart = (product: Product) => {
    const saved = localStorage.getItem("primecart-cart");

    let cart: {
      id: string;
      name: string;
      price: number;
      originalPrice: number;
      image: string;
      quantity: number;
      stock: number;
    }[] = [];

    try {
      cart = saved ? JSON.parse(saved) : [];
    } catch {
      cart = [];
    }

    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + 1,
        product.stock
      );
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        quantity: 1,
        stock: product.stock,
      });
    }

    localStorage.setItem("primecart-cart", JSON.stringify(cart));

    setCartCount(
      cart.reduce((total, item) => total + Number(item.quantity || 1), 0)
    );
  };

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    if (category !== "All") {
      result = result.filter((product) => product.category === category);
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (sort === "discount") {
      result.sort((a, b) => {
        const discountA =
          ((a.originalPrice - a.price) / a.originalPrice) * 100;

        const discountB =
          ((b.originalPrice - b.price) / b.originalPrice) * 100;

        return discountB - discountA;
      });
    }

    return result;
  }, [category, search, sort]);

  const pageClass =
    theme === "dark"
      ? "bg-[#080808] text-white"
      : "bg-[#faf8f3] text-[#171717]";

  const cardClass =
    theme === "dark"
      ? "border-white/10 bg-[#111111]"
      : "border-[#e7e0d3] bg-white";

  return (
    <main className={`min-h-screen ${pageClass}`}>
      {/* Top announcement */}
      <div className="bg-[#b89032] px-4 py-2 text-center text-[11px] font-bold tracking-wide text-white sm:text-xs">
        Free shipping on orders above ₹999 • Easy returns within 7 days
      </div>

      {/* Navbar */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
          theme === "dark"
            ? "border-white/10 bg-[#080808]/95"
            : "border-[#e7e0d3] bg-white/95"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setMobileMenu(true)}
            className="rounded-xl p-2 lg:hidden"
          >
            <Menu size={23} />
          </button>

          <Link href="/dashboard" className="shrink-0">
            <img
              src="/logo.png"
              alt="PrimeCart"
              className="h-9 w-auto sm:h-10"
            />
          </Link>

          <div className="hidden items-center gap-2 xl:flex">
            <MapPin size={18} className="text-[#b89032]" />

            <div className="leading-tight">
              <p className="text-[10px] opacity-50">Deliver to</p>
              <p className="text-xs font-black">India</p>
            </div>
          </div>

          {/* Search */}
          <div className="mx-auto hidden max-w-2xl flex-1 md:block">
            <div
              className={`flex h-11 items-center rounded-xl border px-4 ${
                theme === "dark"
                  ? "border-white/10 bg-white/5"
                  : "border-[#ded7ca] bg-[#faf8f3]"
              }`}
            >
              <Search size={18} className="mr-3 opacity-50" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands and categories"
                className="w-full bg-transparent text-sm outline-none"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mr-2 opacity-50"
                >
                  <X size={16} />
                </button>
              )}

              <button className="rounded-lg bg-[#b89032] px-5 py-2 text-xs font-black text-white">
                Search
              </button>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* Theme */}
            <button
              onClick={() =>
                setTheme(theme === "light" ? "dark" : "light")
              }
              className={`rounded-xl px-3 py-2 text-sm font-bold ${
                theme === "dark"
                  ? "bg-white/5"
                  : "bg-[#f5f0e7]"
              }`}
            >
              {theme === "light" ? "☾" : "☀"}
            </button>

            {/* Account */}
            <div className="hidden items-center gap-2 lg:flex">
              <User size={20} />

              <div className="leading-tight">
                <p className="text-[10px] opacity-50">Hello,</p>
                <p className="max-w-24 truncate text-xs font-black">
                  {userName}
                </p>
              </div>
            </div>

            <Link
              href="/orders"
              className="hidden rounded-xl px-3 py-2 text-xs font-bold lg:block"
            >
              Orders
            </Link>

            <Link
              href="/wishlist"
              className="relative rounded-xl p-2.5"
            >
              <Heart size={21} />

              {wishlist.length > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b89032] px-1 text-[9px] font-black text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative rounded-xl p-2.5"
            >
              <ShoppingCart size={22} />

              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b89032] px-1 text-[10px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <div className="px-4 pb-3 md:hidden">
          <div
            className={`flex h-10 items-center rounded-xl border px-3 ${
              theme === "dark"
                ? "border-white/10 bg-white/5"
                : "border-[#ded7ca] bg-[#faf8f3]"
            }`}
          >
            <Search size={17} className="mr-2 opacity-50" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>
        </div>

        {/* Categories */}
        <nav
          className={`hidden border-t lg:block ${
            theme === "dark"
              ? "border-white/10"
              : "border-[#eee8dd]"
          }`}
        >
          <div className="mx-auto flex max-w-[1500px] gap-7 overflow-x-auto px-8 py-3 text-xs font-bold">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap transition ${
                  category === item
                    ? "text-[#b89032]"
                    : "opacity-70 hover:text-[#b89032]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileMenu(false)}
          />

          <aside
            className={`relative h-full w-[82%] max-w-sm p-5 shadow-2xl ${
              theme === "dark" ? "bg-[#111]" : "bg-white"
            }`}
          >
            <div className="mb-8 flex items-center justify-between">
              <img
                src="/logo.png"
                alt="PrimeCart"
                className="h-9 w-auto"
              />

              <button
                onClick={() => setMobileMenu(false)}
                className="rounded-xl p-2"
              >
                <X />
              </button>
            </div>

            <div className="space-y-2">
              <Link
                href="/dashboard"
                className="block rounded-xl px-4 py-3 font-bold"
              >
                Home
              </Link>

              <Link
                href="/products"
                className="block rounded-xl bg-[#b89032]/10 px-4 py-3 font-bold text-[#b89032]"
              >
                All Products
              </Link>

              <Link
                href="/orders"
                className="block rounded-xl px-4 py-3 font-bold"
              >
                My Orders
              </Link>

              <Link
                href="/wishlist"
                className="block rounded-xl px-4 py-3 font-bold"
              >
                Wishlist
              </Link>

              <Link
                href="/cart"
                className="block rounded-xl px-4 py-3 font-bold"
              >
                Cart
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Page */}
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-xs opacity-50">
          <Link href="/dashboard">Home</Link>
          <span>/</span>
          <span>Products</span>
          {category !== "All" && (
            <>
              <span>/</span>
              <span>{category}</span>
            </>
          )}
        </div>

        {/* Heading */}
        <section className="mb-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b89032]">
                PrimeCart Store
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                {category === "All"
                  ? "Explore All Products"
                  : category}
              </h1>

              <p className="mt-2 text-sm opacity-60">
                Discover quality products at great prices.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold opacity-50">
                {filteredProducts.length} products
              </span>

              {/* Sort desktop */}
              <div
                className={`relative hidden items-center gap-2 rounded-xl border px-3 py-2 sm:flex ${
                  theme === "dark"
                    ? "border-white/10 bg-[#111]"
                    : "border-[#ded7ca] bg-white"
                }`}
              >
                <span className="text-xs font-semibold opacity-50">
                  Sort:
                </span>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none bg-transparent pr-5 text-xs font-black outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-low">
                    Price: Low to High
                  </option>
                  <option value="price-high">
                    Price: High to Low
                  </option>
                  <option value="discount">Best Discount</option>
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2 opacity-50"
                />
              </div>

              {/* Mobile filter */}
              <button
                onClick={() => setMobileFilter(true)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black sm:hidden ${
                  theme === "dark"
                    ? "border-white/10"
                    : "border-[#ded7ca]"
                }`}
              >
                <SlidersHorizontal size={15} />
                Filter
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-7 lg:grid-cols-[230px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div
              className={`sticky top-28 rounded-2xl border p-5 ${cardClass}`}
            >
              <div className="mb-5 flex items-center gap-2">
                <Filter size={17} className="text-[#b89032]" />
                <h2 className="text-sm font-black">Shop By Category</h2>
              </div>

              <div className="space-y-1">
                {CATEGORIES.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-xs font-bold transition ${
                      category === item
                        ? "bg-[#b89032]/10 text-[#b89032]"
                        : "opacity-65 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <span>{item}</span>

                    {category === item && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#b89032]" />
                    )}
                  </button>
                ))}
              </div>

              <div
                className={`mt-7 rounded-xl p-4 ${
                  theme === "dark"
                    ? "bg-white/[0.04]"
                    : "bg-[#faf8f3]"
                }`}
              >
                <p className="text-xs font-black">PrimeCart Promise</p>

                <div className="mt-3 space-y-2 text-[11px] opacity-60">
                  <p>✓ Genuine products</p>
                  <p>✓ Secure payments</p>
                  <p>✓ Fast delivery</p>
                  <p>✓ Easy returns</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <section>
            {filteredProducts.length === 0 ? (
              <div
                className={`rounded-2xl border p-12 text-center ${cardClass}`}
              >
                <Search
                  size={38}
                  className="mx-auto opacity-30"
                />

                <h2 className="mt-4 text-xl font-black">
                  No products found
                </h2>

                <p className="mt-2 text-sm opacity-50">
                  Try another search or category.
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                  className="mt-5 rounded-xl bg-[#b89032] px-5 py-3 text-xs font-black text-white"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
                {filteredProducts.map((product) => {
                  const discount = Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  );

                  const isWishlisted = wishlist.includes(product.id);

                  return (
                    <article
                      key={product.id}
                      className={`group relative overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1 hover:shadow-xl ${cardClass}`}
                    >
                      {/* Image */}
                      <Link
                        href={`/product?id=${product.id}`}
                        className="block"
                      >
                        <div className="relative h-48 overflow-hidden bg-[#f7f5f0] sm:h-60">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-contain p-5 mix-blend-multiply transition duration-500 group-hover:scale-105"
                          />

                          {product.badge && (
                            <span className="absolute left-3 top-3 rounded-full bg-[#b89032] px-2.5 py-1 text-[9px] font-black text-white">
                              {product.badge}
                            </span>
                          )}

                          <span className="absolute bottom-3 left-3 rounded-full bg-green-600 px-2.5 py-1 text-[9px] font-black text-white">
                            {discount}% OFF
                          </span>
                        </div>
                      </Link>

                      {/* Wishlist */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition ${
                          isWishlisted
                            ? "bg-red-50 text-red-500"
                            : "bg-white text-gray-700"
                        }`}
                      >
                        <Heart
                          size={17}
                          fill={
                            isWishlisted
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>

                      {/* Info */}
                      <div className="p-3.5 sm:p-4">
                        <p className="text-[9px] font-black uppercase tracking-wider text-[#b89032]">
                          {product.category}
                        </p>

                        <Link
                          href={`/product?id=${product.id}`}
                        >
                          <h2 className="mt-1 line-clamp-2 min-h-10 text-xs font-black leading-5 sm:text-sm">
                            {product.name}
                          </h2>
                        </Link>

                        {/* Rating */}
                        <div className="mt-2 flex items-center gap-2">
                          <span className="flex items-center gap-1 rounded-md bg-green-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                            {product.rating}
                            <Star
                              size={10}
                              fill="currentColor"
                            />
                          </span>

                          <span className="text-[10px] opacity-50">
                            {product.reviews.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-base font-black sm:text-lg">
                            {formatPrice(product.price)}
                          </span>

                          <span className="text-[10px] text-gray-400 line-through sm:text-xs">
                            {formatPrice(product.originalPrice)}
                          </span>
                        </div>

                        {/* Stock */}
                        <p
                          className={`mt-2 text-[10px] font-bold ${
                            product.stock <= 15
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {product.stock <= 15
                            ? `Only ${product.stock} left`
                            : "In stock"}
                        </p>

                        {/* Add Cart */}
                        <button
                          onClick={() => addToCart(product)}
                          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#b89032] text-xs font-black text-white transition hover:bg-[#a27c29]"
                        >
                          <ShoppingCart size={15} />
                          Add to Cart
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Bottom features */}
      <section
        className={`border-y ${
          theme === "dark"
            ? "border-white/10 bg-[#111]"
            : "border-[#e7e0d3] bg-white"
        }`}
      >
        <div className="mx-auto grid max-w-[1500px] grid-cols-2 gap-4 px-5 py-8 sm:grid-cols-4 sm:px-8">
          <div className="text-center">
            <p className="text-sm font-black">Free Delivery</p>
            <p className="mt-1 text-[10px] opacity-50">
              On orders above ₹999
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm font-black">Secure Payments</p>
            <p className="mt-1 text-[10px] opacity-50">
              100% secure checkout
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm font-black">Easy Returns</p>
            <p className="mt-1 text-[10px] opacity-50">
              7-day return policy
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm font-black">Genuine Products</p>
            <p className="mt-1 text-[10px] opacity-50">
              Quality guaranteed
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`${
          theme === "dark"
            ? "bg-[#050505]"
            : "bg-[#faf8f3]"
        }`}
      >
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-4">
          <div>
            <img
              src="/logo.png"
              alt="PrimeCart"
              className="h-10 w-auto"
            />

            <p className="mt-4 max-w-xs text-sm leading-6 opacity-55">
              Quality products, great prices and a premium shopping
              experience — all in one place.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black">Shop</h3>

            <div className="space-y-3 text-sm opacity-55">
              <Link href="/products" className="block">
                All Products
              </Link>
              <Link href="/products" className="block">
                Electronics
              </Link>
              <Link href="/products" className="block">
                Fashion
              </Link>
              <Link href="/products" className="block">
                Beauty
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black">
              Customer Service
            </h3>

            <div className="space-y-3 text-sm opacity-55">
              <Link href="/orders" className="block">
                My Orders
              </Link>
              <Link href="/wishlist" className="block">
                Wishlist
              </Link>
              <Link href="/cart" className="block">
                Cart
              </Link>
              <Link href="/dashboard" className="block">
                Help Center
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black">
              PrimeCart Promise
            </h3>

            <div className="space-y-3 text-sm opacity-55">
              <p>✓ Genuine products</p>
              <p>✓ Secure checkout</p>
              <p>✓ Fast delivery</p>
              <p>✓ Easy returns</p>
            </div>
          </div>
        </div>

        <div
          className={`border-t px-5 py-5 text-center text-xs opacity-40 ${
            theme === "dark"
              ? "border-white/10"
              : "border-[#e7e0d3]"
          }`}
        >
          © {new Date().getFullYear()} PrimeCart. All rights reserved.
        </div>
      </footer>

      {/* Mobile Filter */}
      {mobileFilter && (
        <div className="fixed inset-0 z-[120] sm:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileFilter(false)}
          />

          <div
            className={`absolute bottom-0 left-0 right-0 rounded-t-3xl p-5 ${
              theme === "dark"
                ? "bg-[#111]"
                : "bg-white"
            }`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-black">
                Filter & Sort
              </h2>

              <button
                onClick={() => setMobileFilter(false)}
                className="rounded-xl p-2"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mb-3 text-xs font-black uppercase tracking-wider opacity-50">
              Category
            </p>

            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setCategory(item);
                  }}
                  className={`rounded-xl border px-3 py-3 text-left text-xs font-bold ${
                    category === item
                      ? "border-[#b89032] bg-[#b89032]/10 text-[#b89032]"
                      : theme === "dark"
                      ? "border-white/10"
                      : "border-[#e5ded2]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <p className="mb-3 mt-6 text-xs font-black uppercase tracking-wider opacity-50">
              Sort By
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                ["featured", "Featured"],
                ["rating", "Top Rated"],
                ["price-low", "Price: Low"],
                ["price-high", "Price: High"],
                ["discount", "Best Discount"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setSort(value)}
                  className={`rounded-xl border px-3 py-3 text-left text-xs font-bold ${
                    sort === value
                      ? "border-[#b89032] bg-[#b89032]/10 text-[#b89032]"
                      : theme === "dark"
                      ? "border-white/10"
                      : "border-[#e5ded2]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMobileFilter(false)}
              className="mt-6 h-12 w-full rounded-xl bg-[#b89032] text-sm font-black text-white"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
