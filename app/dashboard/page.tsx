"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  Laptop,
  Baby,
  Gamepad2,
  Gift,
  Clock3,
  CheckCircle2,
  Plus,
  Minus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  discount: string;
  rating: number;
  reviews: number;
  image: string;
  badge: string;
  delivery: string;
};

const categories = [
  {
    name: "Electronics",
    icon: Smartphone,
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Fashion",
    icon: Shirt,
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Beauty",
    icon: Sparkle,
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Home & Kitchen",
    icon: Home,
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Sports",
    icon: Dumbbell,
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Books",
    icon: BookOpen,
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Watches",
    icon: Watch,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Gaming",
    icon: Gamepad2,
    image:
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=85",
  },
];

const products: Product[] = [
  {
    id: 1,
    name: "Samsung Galaxy Smartphone Pro Max",
    category: "Electronics",
    price: 54999,
    oldPrice: 64999,
    discount: "15% OFF",
    rating: 4.8,
    reviews: 1248,
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=85",
    badge: "Best Seller",
    delivery: "FREE Delivery Tomorrow",
  },
  {
    id: 2,
    name: "Sony Wireless Noise Cancelling Headphones",
    category: "Electronics",
    price: 12499,
    oldPrice: 15999,
    discount: "22% OFF",
    rating: 4.7,
    reviews: 856,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85",
    badge: "Top Rated",
    delivery: "FREE Delivery Tomorrow",
  },
  {
    id: 3,
    name: "Levis Premium Denim Jacket",
    category: "Fashion",
    price: 3499,
    oldPrice: 4999,
    discount: "30% OFF",
    rating: 4.6,
    reviews: 524,
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85",
    badge: "Trending",
    delivery: "FREE Delivery in 2 Days",
  },
  {
    id: 4,
    name: "GlowCare Vitamin C Face Serum",
    category: "Beauty",
    price: 899,
    oldPrice: 1299,
    discount: "31% OFF",
    rating: 4.5,
    reviews: 2134,
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=85",
    badge: "Popular",
    delivery: "FREE Delivery Tomorrow",
  },
  {
    id: 5,
    name: "Premium Smart Watch Series 9",
    category: "Watches",
    price: 5999,
    oldPrice: 7999,
    discount: "25% OFF",
    rating: 4.6,
    reviews: 734,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85",
    badge: "Deal",
    delivery: "FREE Delivery Tomorrow",
  },
  {
    id: 6,
    name: "Modern Home Ceramic Table Set",
    category: "Home & Kitchen",
    price: 2199,
    oldPrice: 2999,
    discount: "27% OFF",
    rating: 4.4,
    reviews: 318,
    image:
      "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=800&q=85",
    badge: "New",
    delivery: "FREE Delivery in 2 Days",
  },
  {
    id: 7,
    name: "Premium Running Sports Shoes",
    category: "Sports",
    price: 2899,
    oldPrice: 3999,
    discount: "28% OFF",
    rating: 4.5,
    reviews: 642,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85",
    badge: "Trending",
    delivery: "FREE Delivery Tomorrow",
  },
  {
    id: 8,
    name: "Classic Leather Analog Watch",
    category: "Watches",
    price: 4299,
    oldPrice: 5999,
    discount: "28% OFF",
    rating: 4.7,
    reviews: 451,
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=85",
    badge: "Top Rated",
    delivery: "FREE Delivery Tomorrow",
  },
];

const heroSlides = [
  {
    tag: "PRIME DEALS",
    title: "Big savings on",
    highlight: "everyday favourites.",
    text: "Shop electronics, fashion, beauty, home essentials and more at prices you'll love.",
    button: "Shop Now",
    category: "All",
    image:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1800&q=90",
  },
  {
    tag: "ELECTRONICS SALE",
    title: "Upgrade your",
    highlight: "tech today.",
    text: "Discover smartphones, headphones, smartwatches and accessories from top brands.",
    button: "Shop Electronics",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1800&q=90",
  },
  {
    tag: "FASHION FEST",
    title: "Style that makes",
    highlight: "a statement.",
    text: "Explore trending fashion, premium denim and everyday styles at amazing prices.",
    button: "Explore Fashion",
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=90",
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
  const [cartCount, setCartCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [heroIndex, setHeroIndex] = useState(0);
  const [locationOpen, setLocationOpen] = useState(false);
  const [pincode, setPincode] = useState("421301");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("primecart-theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
    }

    const savedWishlist = localStorage.getItem("primecart-wishlist");

    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch {
        setWishlist([]);
      }
    }

    const savedCart = localStorage.getItem("primecart-cart");

    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);

        const count = Array.isArray(cart)
          ? cart.reduce(
              (total: number, item: { quantity?: number }) =>
                total + (item.quantity || 0),
              0
            )
          : 0;

        setCartCount(count);
      } catch {
        setCartCount(0);
      }
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

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;

    setDarkMode(next);

    localStorage.setItem(
      "primecart-theme",
      next ? "dark" : "light"
    );
  };

  const toggleWishlist = (id: number) => {
    setWishlist((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];

      localStorage.setItem(
        "primecart-wishlist",
        JSON.stringify(next)
      );

      return next;
    });
  };

  const addToCart = (product: Product) => {
    try {
      const existing = localStorage.getItem("primecart-cart");

      const cart = existing ? JSON.parse(existing) : [];

      const index = cart.findIndex(
        (item: { id: number }) => item.id === product.id
      );

      if (index >= 0) {
        cart[index].quantity =
          (cart[index].quantity || 1) + 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.oldPrice,
          image: product.image,
          quantity: 1,
          stock: 20,
        });
      }

      localStorage.setItem(
        "primecart-cart",
        JSON.stringify(cart)
      );

      const count = cart.reduce(
        (total: number, item: { quantity?: number }) =>
          total + (item.quantity || 0),
        0
      );

      setCartCount(count);
    } catch {
      setCartCount((count) => count + 1);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const filteredProducts = useMemo(() => {
    let result =
      activeCategory === "All"
        ? products
        : products.filter(
            (product) => product.category === activeCategory
          );

    if (search.trim()) {
      result = result.filter((product) =>
        `${product.name} ${product.category}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    return result;
  }, [activeCategory, search]);

  const currentHero = heroSlides[heroIndex];

  const firstName = userName.split(" ")[0];

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-[#0b0b0a] text-white"
          : "bg-[#f5f4f1] text-[#202020]"
      }`}
    >
      {/* =====================================================
          TOP OFFER BAR
      ====================================================== */}

      <div className="bg-[#b8892e] px-4 py-2 text-center text-[11px] font-semibold tracking-wide text-white sm:text-xs">
        <span className="hidden sm:inline">
          🎉 Great deals every day
          <span className="mx-3 opacity-50">•</span>
        </span>

        Free shipping on orders above ₹999

        <span className="mx-2 opacity-50">•</span>

        Easy returns within 7 days
      </div>

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
          darkMode
            ? "border-[#28251f] bg-[#11110f]/95"
            : "border-[#e5e0d7] bg-white/95"
        }`}
      >
        <div className="mx-auto flex min-h-[68px] max-w-[1550px] items-center gap-2 px-3 sm:px-5 lg:gap-4 lg:px-8">
          {/* MOBILE MENU */}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl lg:hidden"
          >
            <Menu size={22} />
          </button>

          {/* LOGO */}

          <Link
            href="/dashboard"
            className="shrink-0"
          >
            <img
              src="/logo.png"
              alt="PrimeCart"
              className="h-9 w-auto object-contain sm:h-11"
            />
          </Link>

          {/* LOCATION */}

          <div className="relative hidden xl:block">
            <button
              type="button"
              onClick={() =>
                setLocationOpen(!locationOpen)
              }
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left transition ${
                darkMode
                  ? "hover:bg-[#1b1a17]"
                  : "hover:bg-[#faf8f3]"
              }`}
            >
              <MapPin
                size={19}
                className="text-[#bd8b2d]"
              />

              <div>
                <p className="text-[10px] text-gray-500">
                  Deliver to
                </p>

                <p className="text-xs font-bold">
                  {pincode}, Maharashtra
                </p>
              </div>

              <ChevronDown size={14} />
            </button>

            {locationOpen && (
              <div
                className={`absolute left-0 top-14 w-72 rounded-2xl border p-4 shadow-2xl ${
                  darkMode
                    ? "border-[#353129] bg-[#181714]"
                    : "border-[#e4ded4] bg-white"
                }`}
              >
                <p className="text-sm font-bold">
                  Choose delivery location
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Enter your pincode to check delivery
                  availability.
                </p>

                <div className="mt-4 flex gap-2">
                  <input
                    value={pincode}
                    onChange={(e) =>
                      setPincode(e.target.value)
                    }
                    maxLength={6}
                    className={`h-10 flex-1 rounded-lg border px-3 text-sm outline-none ${
                      darkMode
                        ? "border-[#3b382f] bg-[#11110f]"
                        : "border-[#ded8ce] bg-[#faf9f6]"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setLocationOpen(false)
                    }
                    className="rounded-lg bg-[#bd8b2d] px-4 text-xs font-bold text-white"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SEARCH */}

          <div className="relative mx-auto hidden max-w-3xl flex-1 md:block">
            <Search
              size={19}
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                searchFocused
                  ? "text-[#b88728]"
                  : "text-gray-400"
              }`}
            />

            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              onFocus={() => setSearchFocused(true)}
              onBlur={() =>
                setTimeout(
                  () => setSearchFocused(false),
                  150
                )
              }
              placeholder="Search for products, brands and more..."
              className={`h-12 w-full rounded-xl border pl-11 pr-14 text-sm outline-none transition ${
                darkMode
                  ? "border-[#3a372f] bg-[#1a1917] text-white placeholder:text-gray-600 focus:border-[#bd8b2d]"
                  : "border-[#ddd8cf] bg-[#f8f7f4] text-[#222] placeholder:text-gray-400 focus:border-[#bd8b2d]"
              }`}
            />

            <button
              type="button"
              className="absolute right-1.5 top-1/2 flex h-9 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-[#bd8b2d] text-white transition hover:bg-[#a97720]"
            >
              <Search size={17} />
            </button>

            {searchFocused && search.trim() && (
              <div
                className={`absolute left-0 right-0 top-14 overflow-hidden rounded-2xl border p-2 shadow-2xl ${
                  darkMode
                    ? "border-[#353129] bg-[#171613]"
                    : "border-[#e4ded5] bg-white"
                }`}
              >
                {filteredProducts
                  .slice(0, 4)
                  .map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                          {product.name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-500">
                          ₹
                          {product.price.toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>

          {/* RIGHT ACTIONS */}

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* THEME */}

            <button
              type="button"
              onClick={toggleTheme}
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                darkMode
                  ? "text-[#e0b95e] hover:bg-[#1d1b18]"
                  : "text-[#92701f] hover:bg-[#faf8f3]"
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>

            {/* ACCOUNT */}

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
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#bd8b2d] text-xs font-bold text-white">
                  {userName
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="hidden text-left lg:block">
                  <p className="max-w-[105px] truncate text-xs font-bold">
                    Hello, {firstName}
                  </p>

                  <p className="text-[10px] text-gray-500">
                    Account & Lists
                  </p>
                </div>

                <ChevronDown size={14} />
              </button>

              {accountOpen && (
                <div
                  className={`absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border p-2 shadow-2xl ${
                    darkMode
                      ? "border-[#353129] bg-[#181714]"
                      : "border-[#e4ded5] bg-white"
                  }`}
                >
                  <div className="border-b px-3 pb-3 pt-2">
                    <p className="truncate text-sm font-bold">
                      {userName}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                      {userEmail}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <UserCircle size={17} />
                    My Profile
                  </Link>

                  <Link
                    href="/orders"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <Package size={17} />
                    My Orders
                  </Link>

                  <Link
                    href="/wishlist"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <Heart size={17} />
                    Wishlist
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* ORDERS */}

            <Link
              href="/orders"
              className={`hidden h-10 items-center gap-2 rounded-xl px-3 sm:flex ${
                darkMode
                  ? "hover:bg-[#1d1b18]"
                  : "hover:bg-[#faf8f3]"
              }`}
            >
              <Package size={19} />

              <div className="hidden lg:block">
                <p className="text-[10px] text-gray-500">
                  Track
                </p>

                <p className="text-xs font-bold">
                  Orders
                </p>
              </div>
            </Link>

            {/* WISHLIST */}

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
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#bd8b2d] px-1 text-[9px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* CART */}

            <Link
              href="/cart"
              className={`relative flex h-10 items-center gap-2 rounded-xl px-2 sm:px-3 ${
                darkMode
                  ? "hover:bg-[#1d1b18]"
                  : "hover:bg-[#faf8f3]"
              }`}
            >
              <ShoppingCart size={21} />

              <span className="hidden text-xs font-bold lg:block">
                Cart
              </span>

              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#bd8b2d] px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* MOBILE SEARCH */}

        <div
          className={`border-t px-3 py-3 md:hidden ${
            darkMode
              ? "border-[#28251f]"
              : "border-[#eee9e1]"
          }`}
        >
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search products, brands & more..."
              className={`h-11 w-full rounded-xl border pl-11 pr-4 text-sm outline-none ${
                darkMode
                  ? "border-[#39362f] bg-[#1a1917]"
                  : "border-[#ddd8cf] bg-[#f8f7f4]"
              }`}
            />
          </div>
        </div>

        {/* CATEGORY NAV */}

        <div
          className={`hidden border-t lg:block ${
            darkMode
              ? "border-[#28251f]"
              : "border-[#eee9e1]"
          }`}
        >
          <div className="mx-auto flex h-12 max-w-[1550px] items-center gap-1 overflow-x-auto px-5 lg:px-8">
            {[
              "All",
              "Electronics",
              "Fashion",
              "Beauty",
              "Home & Kitchen",
              "Sports",
              "Books",
              "Watches",
              "Gaming",
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
                className={`flex h-10 shrink-0 items-center gap-1 rounded-lg px-4 text-xs font-semibold transition ${
                  activeCategory === item
                    ? "bg-[#bd8b2d] text-white"
                    : darkMode
                    ? "text-gray-400 hover:bg-white/5 hover:text-white"
                    : "text-gray-600 hover:bg-[#f7f3ea] hover:text-[#9c711e]"
                }`}
              >
                {item === "Deals" && (
                  <Zap size={13} />
                )}

                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* =====================================================
          MOBILE SIDEBAR
      ====================================================== */}

      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-[60] bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-[300px] transform transition-transform duration-300 lg:hidden ${
          menuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } ${
          darkMode
            ? "bg-[#141310]"
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
            className="rounded-lg p-2"
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#bd8b2d] text-sm font-bold text-white">
                {userName
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  Hello, {firstName}
                </p>

                <p className="mt-1 text-xs text-gray-500">
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
              href="/orders"
              icon={<Package size={18} />}
              label="My Orders"
              onClick={() => setMenuOpen(false)}
            />

            <MobileNav
              href="/wishlist"
              icon={<Heart size={18} />}
              label="My Wishlist"
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

            <div className="my-4 border-t border-gray-200 dark:border-[#302d27]" />

            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium"
            >
              {darkMode ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}

              {darkMode
                ? "Light Mode"
                : "Dark Mode"}
            </button>

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

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-[1550px] px-3 pb-14 pt-4 sm:px-5 lg:px-8">
        {/* WELCOME */}

        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae7c20]">
              PrimeCart Shopping
            </p>

            <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              Welcome back, {firstName} 👋
            </h1>
          </div>

          <Link
            href="/orders"
            className="hidden items-center gap-1 text-xs font-bold text-[#ae7c20] sm:flex"
          >
            View your orders
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="relative min-h-[330px] overflow-hidden rounded-3xl sm:min-h-[390px] lg:min-h-[430px]">
          <img
            src={currentHero.image}
            alt={currentHero.title}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-700"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />

          <div className="relative flex min-h-[330px] items-center px-6 py-10 sm:min-h-[390px] sm:px-10 lg:min-h-[430px] lg:px-16">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-widest backdrop-blur-md sm:text-xs">
                <Sparkles size={13} />
                {currentHero.tag}
              </div>

              <h2 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                {currentHero.title}
                <br />
                <span className="text-[#e2b85d]">
                  {currentHero.highlight}
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                {currentHero.text}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setActiveCategory(
                      currentHero.category
                    )
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#bd8b2d] px-5 text-xs font-bold text-white transition hover:bg-[#a97820] sm:h-12 sm:px-6 sm:text-sm"
                >
                  {currentHero.button}
                  <ArrowRight size={16} />
                </button>

                <Link
                  href="/products"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/15 sm:h-12 sm:px-6 sm:text-sm"
                >
                  View All Products
                </Link>
              </div>

              {/* HERO TRUST */}

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-white/60 sm:text-xs">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  Genuine Products
                </span>

                <span className="flex items-center gap-1.5">
                  <Truck size={13} />
                  Fast Delivery
                </span>

                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} />
                  Secure Payment
                </span>
              </div>
            </div>
          </div>

          {/* SLIDER DOTS */}

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setHeroIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  heroIndex === index
                    ? "w-8 bg-white"
                    : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        </section>

        {/* =====================================================
            QUICK SERVICE STRIP
        ====================================================== */}

        <section className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
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
            title="Customer Support"
            text="We're here to help"
            darkMode={darkMode}
          />
        </section>

        {/* =====================================================
            SHOP BY CATEGORY
        ====================================================== */}

        <section className="mt-9">
          <SectionHeading
            title="Shop by Category"
            subtitle="Everything you need, all in one place"
            link="/categories"
            darkMode={darkMode}
          />

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() =>
                    setActiveCategory(
                      category.name
                    )
                  }
                  className={`group overflow-hidden rounded-2xl border text-left transition duration-300 ${
                    darkMode
                      ? "border-[#2d2a24] bg-[#151411] hover:-translate-y-1 hover:border-[#66522e]"
                      : "border-[#e4ded5] bg-white hover:-translate-y-1 hover:border-[#d3b56e] hover:shadow-lg"
                  }`}
                >
                  <div className="relative h-28 overflow-hidden sm:h-32">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    <div className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-[#a97720] shadow-sm">
                      <Icon size={16} />
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="text-[11px] font-bold sm:text-xs">
                      {category.name}
                    </p>

                    <p className="mt-1 text-[9px] text-gray-400">
                      Shop now →
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            DEALS BANNER
        ====================================================== */}

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#bd8b2d] text-white">
                  <Zap size={16} />
                </div>

                <h2 className="text-xl font-bold sm:text-2xl">
                  Deals of the Day
                </h2>
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Limited-time offers. Grab them before they're gone.
              </p>
            </div>

            <Link
              href="/products"
              className="flex items-center gap-1 text-xs font-bold text-[#ae7c20]"
            >
              View all
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <DealBanner
              title="Electronics Mega Sale"
              subtitle="UP TO 60% OFF"
              text="Smartphones, headphones & accessories"
              image="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1200&q=85"
              onClick={() =>
                setActiveCategory("Electronics")
              }
            />

            <DealBanner
              title="Fashion Fest"
              subtitle="STARTING ₹499"
              text="Latest styles for every occasion"
              image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85"
              onClick={() =>
                setActiveCategory("Fashion")
              }
            />

            <DealBanner
              title="Home Essentials"
              subtitle="UP TO 50% OFF"
              text="Upgrade your home today"
              image="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85"
              onClick={() =>
                setActiveCategory("Home & Kitchen")
              }
            />
          </div>
        </section>

        {/* =====================================================
            PRODUCT SECTION
        ====================================================== */}

        <section className="mt-10">
          <SectionHeading
            title={
              activeCategory === "All"
                ? "Featured Products"
                : activeCategory
            }
            subtitle="Top picks selected for you"
            link="/products"
            darkMode={darkMode}
          />

          {/* FILTERS */}

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
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
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-[11px] font-bold transition ${
                  activeCategory === category
                    ? "border-[#bd8b2d] bg-[#bd8b2d] text-white"
                    : darkMode
                    ? "border-[#38342d] text-gray-400 hover:border-[#bd8b2d]"
                    : "border-[#ddd7cd] bg-white text-gray-600 hover:border-[#bd8b2d]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div
              className={`mt-5 rounded-2xl border py-20 text-center ${
                darkMode
                  ? "border-[#2e2b25] bg-[#151411]"
                  : "border-[#e7e1d8] bg-white"
              }`}
            >
              <Search
                size={40}
                className="mx-auto text-gray-400"
              />

              <h3 className="mt-4 font-bold">
                No products found
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Try another search or category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="mt-5 rounded-lg bg-[#bd8b2d] px-5 py-2 text-xs font-bold text-white"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
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
                  onAddToCart={() =>
                    addToCart(product)
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            BEST SELLERS
        ====================================================== */}

        {activeCategory === "All" && !search && (
          <section className="mt-12">
            <SectionHeading
              title="Best Sellers"
              subtitle="Loved by thousands of PrimeCart shoppers"
              link="/products"
              darkMode={darkMode}
            />

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {products
                .slice(0, 4)
                .map((product) => (
                  <MiniProduct
                    key={product.id}
                    product={product}
                    darkMode={darkMode}
                  />
                ))}
            </div>
          </section>
        )}

        {/* =====================================================
            BIG PROMOTION
        ====================================================== */}

        <section
          className={`mt-12 overflow-hidden rounded-3xl ${
            darkMode
              ? "bg-[#211c15]"
              : "bg-[#f0e2c1]"
          }`}
        >
          <div className="grid items-center lg:grid-cols-2">
            <div className="p-7 sm:p-10 lg:p-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#bd8b2d] px-3 py-1.5 text-[10px] font-bold tracking-wider text-white">
                <Percent size={13} />
                PRIME DEAL
              </div>

              <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
                More choice.
                <br />
                More savings.
                <br />
                <span className="text-[#b27f1d]">
                  More PrimeCart.
                </span>
              </h2>

              <p
                className={`mt-4 max-w-lg text-sm leading-6 ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              >
                Discover amazing products across electronics,
                fashion, beauty, home essentials and more.
                Your next favourite product is waiting.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#bd8b2d] px-5 text-xs font-bold text-white transition hover:bg-[#a97820] sm:text-sm"
              >
                Explore All Products
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="relative hidden h-[340px] lg:block">
              <img
                src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=85"
                alt="PrimeCart shopping"
                className="h-full w-full object-cover"
              />

              <div
                className={`absolute inset-0 bg-gradient-to-r ${
                  darkMode
                    ? "from-[#211c15] to-transparent"
                    : "from-[#f0e2c1] to-transparent"
                }`}
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            TRUST FEATURES
        ====================================================== */}

        <section className="mt-12">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TrustCard
              icon={<Truck size={21} />}
              title="Fast & Reliable Delivery"
              text="Get your products delivered safely to your doorstep."
              darkMode={darkMode}
            />

            <TrustCard
              icon={<ShieldCheck size={21} />}
              title="100% Secure Payments"
              text="Your payment information is protected with secure checkout."
              darkMode={darkMode}
            />

            <TrustCard
              icon={<RotateCcw size={21} />}
              title="Easy Returns"
              text="Simple 7-day return policy for eligible products."
              darkMode={darkMode}
            />

            <TrustCard
              icon={<Headphones size={21} />}
              title="Customer Support"
              text="Our support team is ready whenever you need help."
              darkMode={darkMode}
            />
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="mt-14">
          <div
            className={`grid gap-8 border-t py-10 sm:grid-cols-2 lg:grid-cols-5 ${
              darkMode
                ? "border-[#2b2822]"
                : "border-[#e4ded4]"
            }`}
          >
            <div className="lg:col-span-2">
              <img
                src="/logo.png"
                alt="PrimeCart"
                className={`h-11 w-auto ${
                  darkMode
                    ? "brightness-0 invert"
                    : ""
                }`}
              />

              <p
                className={`mt-4 max-w-sm text-xs leading-6 ${
                  darkMode
                    ? "text-gray-500"
                    : "text-gray-500"
                }`}
              >
                PrimeCart is your trusted online shopping
                destination for quality products, great deals
                and a simple, secure shopping experience.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span
                  className={`rounded-lg border px-3 py-2 text-[10px] font-semibold ${
                    darkMode
                      ? "border-[#343129] text-gray-500"
                      : "border-[#ddd7ce] text-gray-500"
                  }`}
                >
                  ✓ Genuine Products
                </span>

                <span
                  className={`rounded-lg border px-3 py-2 text-[10px] font-semibold ${
                    darkMode
                      ? "border-[#343129] text-gray-500"
                      : "border-[#ddd7ce] text-gray-500"
                  }`}
                >
                  ✓ Secure Shopping
                </span>
              </div>
            </div>

            <FooterColumn
              title="Shop"
              links={[
                ["All Products", "/products"],
                ["Electronics", "/products"],
                ["Fashion", "/products"],
                ["Beauty", "/products"],
              ]}
              darkMode={darkMode}
            />

            <FooterColumn
              title="Customer Care"
              links={[
                ["My Orders", "/orders"],
                ["Returns", "/help"],
                ["Help Center", "/help"],
                ["Contact Us", "/help"],
              ]}
              darkMode={darkMode}
            />

            <FooterColumn
              title="Account"
              links={[
                ["My Profile", "/profile"],
                ["Wishlist", "/wishlist"],
                ["Shopping Cart", "/cart"],
                ["Privacy", "/privacy"],
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
              <Link href="/privacy">
                Privacy
              </Link>

              <Link href="/terms">
                Terms
              </Link>

              <Link href="/help">
                Help
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* ============================================================
   PRODUCT CARD
============================================================ */

function ProductCard({
  product,
  darkMode,
  isWishlisted,
  onWishlist,
  onAddToCart,
}: {
  product: Product;
  darkMode: boolean;
  isWishlisted: boolean;
  onWishlist: () => void;
  onAddToCart: () => void;
}) {
  return (
    <div
      className={`group overflow-hidden rounded-2xl border transition duration-300 ${
        darkMode
          ? "border-[#2d2a24] bg-[#151411] hover:-translate-y-1 hover:border-[#65512c]"
          : "border-[#e3ddd4] bg-white hover:-translate-y-1 hover:border-[#d3b56e] hover:shadow-xl"
      }`}
    >
      {/* IMAGE */}

      <div
        className={`relative aspect-square overflow-hidden ${
          darkMode
            ? "bg-[#211f1a]"
            : "bg-[#f8f6f1]"
        }`}
      >
        <Link
          href={`/product/${product.id}`}
          className="block h-full w-full"
        >
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        </Link>

        {/* BADGE */}

        <span className="absolute left-2 top-2 rounded-md bg-[#bd8b2d] px-2 py-1 text-[8px] font-extrabold uppercase tracking-wide text-white sm:left-3 sm:top-3 sm:text-[9px]">
          {product.badge}
        </span>

        {/* WISHLIST */}

        <button
          type="button"
          onClick={onWishlist}
          aria-label="Add to wishlist"
          className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full shadow-md backdrop-blur sm:right-3 sm:top-3 ${
            darkMode
              ? "bg-black/55 text-white"
              : "bg-white/95 text-gray-600"
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
                ? "text-[#bd8b2d]"
                : ""
            }
          />
        </button>
      </div>

      {/* DETAILS */}

      <div className="p-3 sm:p-4">
        <p className="text-[9px] font-bold uppercase tracking-wider text-[#ad7d20]">
          {product.category}
        </p>

        <Link href={`/product/${product.id}`}>
          <h3 className="mt-1 line-clamp-2 min-h-[38px] text-xs font-bold leading-5 sm:text-sm">
            {product.name}
          </h3>
        </Link>

        {/* RATING */}

        <div className="mt-2 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded bg-green-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
            {product.rating}

            <Star
              size={8}
              fill="currentColor"
            />
          </span>

          <span className="text-[9px] text-gray-400">
            ({product.reviews.toLocaleString("en-IN")})
          </span>
        </div>

        {/* PRICE */}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-base font-extrabold sm:text-lg">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          <span className="text-[10px] text-gray-400 line-through">
            ₹{product.oldPrice.toLocaleString("en-IN")}
          </span>

          <span className="text-[9px] font-bold text-green-600">
            {product.discount}
          </span>
        </div>

        {/* DELIVERY */}

        <div className="mt-2 flex items-center gap-1 text-[9px] text-gray-500">
          <Truck size={11} />
          {product.delivery}
        </div>

        {/* ADD CART */}

        <button
          type="button"
          onClick={onAddToCart}
          className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#bd8b2d] text-[10px] font-extrabold text-white transition hover:bg-[#a97820] sm:h-10 sm:text-xs"
        >
          <ShoppingCart size={14} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   MINI PRODUCT
============================================================ */

function MiniProduct({
  product,
  darkMode,
}: {
  product: Product;
  darkMode: boolean;
}) {
  return (
    <Link
      href={`/product/${product.id}`}
      className={`group flex gap-3 rounded-2xl border p-3 transition hover:-translate-y-1 ${
        darkMode
          ? "border-[#2d2a24] bg-[#151411] hover:border-[#66522e]"
          : "border-[#e4ded5] bg-white hover:border-[#d3b56e] hover:shadow-lg"
      }`}
    >
      <div
        className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl ${
          darkMode
            ? "bg-[#211f1a]"
            : "bg-[#f7f5ef]"
        }`}
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-wide text-[#ad7d20]">
          {product.category}
        </p>

        <h3 className="mt-1 line-clamp-2 text-xs font-bold leading-4">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-extrabold">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          <span className="text-[9px] text-gray-400 line-through">
            ₹{product.oldPrice.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
   DEAL BANNER
============================================================ */

function DealBanner({
  title,
  subtitle,
  text,
  image,
  onClick,
}: {
  title: string;
  subtitle: string;
  text: string;
  image: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative min-h-[220px] overflow-hidden rounded-2xl text-left"
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

      <div className="relative flex min-h-[220px] flex-col justify-center p-6 text-white">
        <p className="text-[10px] font-extrabold tracking-widest text-[#e3bc63]">
          {subtitle}
        </p>

        <h3 className="mt-2 max-w-[230px] text-xl font-extrabold">
          {title}
        </h3>

        <p className="mt-2 max-w-[220px] text-[10px] leading-5 text-white/65">
          {text}
        </p>

        <span className="mt-5 flex w-fit items-center gap-1 text-[10px] font-bold">
          Shop now
          <ArrowRight size={13} />
        </span>
      </div>
    </button>
  );
}

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
  title,
  subtitle,
  link,
  darkMode,
}: {
  title: string;
  subtitle: string;
  link: string;
  darkMode: boolean;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          {title}
        </h2>

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
        className="flex shrink-0 items-center gap-1 text-[10px] font-extrabold text-[#ae7c20] sm:text-xs"
      >
        View all
        <ChevronRight size={14} />
      </Link>
    </div>
  );
}

/* ============================================================
   SERVICE
============================================================ */

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
          : "border-[#e5dfd6] bg-white"
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
        <p className="truncate text-[10px] font-extrabold sm:text-xs">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[9px] text-gray-400">
          {text}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   TRUST CARD
============================================================ */

function TrustCard({
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
      className={`rounded-2xl border p-5 ${
        darkMode
          ? "border-[#2e2b25] bg-[#151411]"
          : "border-[#e4ded5] bg-white"
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbf1dc] text-[#ad7d20]">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-extrabold">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-gray-500">
        {text}
      </p>
    </div>
  );
}

/* ============================================================
   MOBILE NAV
============================================================ */

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

/* ============================================================
   FOOTER COLUMN
============================================================ */

function FooterColumn({
  title,
  links,
  darkMode,
}: {
  title: string;
  links: [string, string][];
  darkMode: boolean;
}) {
  return (
    <div>
      <h3 className="text-sm font-extrabold">
        {title}
      </h3>

      <div
        className={`mt-4 space-y-3 text-xs ${
          darkMode
            ? "text-gray-500"
            : "text-gray-500"
        }`}
      >
        {links.map(([label, href]) => (
          <Link
            key={label}
            href={href}
            className="block transition hover:text-[#b27f1d]"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
