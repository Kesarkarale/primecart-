"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Grid2X2,
  Heart,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Tag,
  Truck,
  User,
  X,
  Zap,
  ShieldCheck,
  RotateCcw,
  PackageCheck,
  Gift,
  LayoutGrid,
  List,
} from "lucide-react";

import { createClient } from "@supabase/supabase-js";

type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string | null;
  short_description: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  image_url: string | null;
  brand: string | null;
  rating: number | null;
  reviews_count: number | null;
  is_featured: boolean;
  is_flash_sale: boolean;
};

type Category = {
  id: string;
  name: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

const gold = "#b8872d";

const categoryIcons: Record<string, string> = {
  mobile: "📱",
  smartphones: "📱",
  home: "🏠",
  appliance: "⚙️",
  appliances: "⚙️",
  footwear: "👟",
  shoes: "👟",
  watch: "⌚",
  watches: "⌚",
  bag: "👜",
  bags: "👜",
  toy: "🧸",
  baby: "🧸",
  automotive: "🚗",
  fashion: "👗",
  gaming: "🎮",
  electronics: "💻",
  beauty: "✨",
  books: "📚",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function discountPercent(
  price: number,
  originalPrice: number | null
) {
  if (!originalPrice || originalPrice <= price) return 0;

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100
  );
}

function imageUrl(value: string | null) {
  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  ) {
    return value;
  }

  return `/products/${value}`;
}

function getCategoryIcon(name: string) {
  const key = name.toLowerCase().trim();

  for (const [item, icon] of Object.entries(categoryIcons)) {
    if (key.includes(item)) {
      return icon;
    }
  }

  return "🛍️";
}

export default function DashboardPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  const [view, setView] = useState<"grid" | "list">("grid");

  const [wishlist, setWishlist] = useState<string[]>([]);

  const [cartCount, setCartCount] = useState(0);

  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [heroIndex, setHeroIndex] = useState(0);

  const [toast, setToast] = useState<string | null>(null);

  const [showAllCategories, setShowAllCategories] =
    useState(false);

  const heroSlides = [
    {
      eyebrow: "PRIME DEALS",
      title: "Shop smarter.",
      highlight: "Live better.",
      text: "Premium products, better prices and a shopping experience designed around you.",
      button: "Explore Products",
      href: "#products",
    },
    {
      eyebrow: "PRIME MATCH",
      title: "Find what fits",
      highlight: "your budget.",
      text: "Discover products based on your needs, priorities and spending range.",
      button: "Try PrimeMatch",
      href: "/dashboard/prime-match",
    },
    {
      eyebrow: "FLASH SALE",
      title: "Limited time.",
      highlight: "Exclusive prices.",
      text: "Grab selected products before the timer runs out.",
      button: "Shop Deals",
      href: "#deals",
    },
  ];

  /* =====================================================
     INITIAL DATA
  ===================================================== */

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setCategoriesLoading(true);

      const [
        productsResponse,
        categoriesResponse,
      ] = await Promise.all([
        supabase
          .from("products")
          .select(
            `
              id,
              category_id,
              name,
              slug,
              short_description,
              description,
              price,
              original_price,
              stock,
              image_url,
              brand,
              rating,
              reviews_count,
              is_featured,
              is_flash_sale
            `
          )
          .eq("is_active", true)
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("categories")
          .select("id,name")
          .order("name", {
            ascending: true,
          }),
      ]);

      if (!productsResponse.error) {
        setProducts(
          (productsResponse.data || []) as Product[]
        );
      }

      if (!categoriesResponse.error) {
        setCategories(
          (categoriesResponse.data || []) as Category[]
        );
      }

      setLoading(false);
      setCategoriesLoading(false);
    }

    loadDashboard();
  }, []);

  /* =====================================================
     LOCAL STORAGE
  ===================================================== */

  useEffect(() => {
    try {
      const savedWishlist =
        localStorage.getItem("primecart-wishlist");

      const savedCart =
        localStorage.getItem("primecart-cart-count");

      const savedTheme =
        localStorage.getItem("primecart-theme");

      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }

      if (savedCart) {
        setCartCount(Number(savedCart) || 0);
      }

      if (savedTheme === "dark") {
        setDarkMode(true);
        document.documentElement.classList.add("dark");
      }
    } catch {
      // Ignore invalid local storage.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "primecart-wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(
      "primecart-cart-count",
      String(cartCount)
    );
  }, [cartCount]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) =>
        current === heroSlides.length - 1
          ? 0
          : current + 1
      );
    }, 6000);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  /* =====================================================
     THEME
  ===================================================== */

  function toggleTheme() {
    setDarkMode((current) => {
      const next = !current;

      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem(
          "primecart-theme",
          "dark"
        );
      } else {
        document.documentElement.classList.remove(
          "dark"
        );
        localStorage.setItem(
          "primecart-theme",
          "light"
        );
      }

      return next;
    });
  }

  /* =====================================================
     TOAST
  ===================================================== */

  function showToast(message: string) {
    setToast(message);

    window.setTimeout(() => {
      setToast(null);
    }, 2500);
  }

  /* =====================================================
     WISHLIST
  ===================================================== */

  function toggleWishlist(productId: string) {
    setWishlist((current) => {
      const exists = current.includes(productId);

      if (exists) {
        showToast("Removed from wishlist");
        return current.filter(
          (id) => id !== productId
        );
      }

      showToast("Added to wishlist");
      return [...current, productId];
    });
  }

  /* =====================================================
     CART
  ===================================================== */

  function addToCart(product: Product) {
    if (product.stock <= 0) {
      showToast("This product is currently out of stock");
      return;
    }

    setCartCount((count) => count + 1);

    showToast(`${product.name} added to cart`);
  }

  function buyNow(product: Product) {
    if (product.stock <= 0) {
      showToast("This product is currently out of stock");
      return;
    }

    localStorage.setItem(
      "primecart-buy-now",
      JSON.stringify({
        product,
        quantity: 1,
      })
    );

    router.push("/checkout");
  }

  /* =====================================================
     FILTERING
  ===================================================== */

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = [...products];

    if (category !== "All") {
      const selected = categories.find(
        (item) => item.name === category
      );

      if (selected) {
        result = result.filter(
          (product) =>
            product.category_id === selected.id
        );
      }
    }

    if (query) {
      result = result.filter((product) => {
        return (
          product.name
            .toLowerCase()
            .includes(query) ||
          product.brand
            ?.toLowerCase()
            .includes(query) ||
          product.short_description
            ?.toLowerCase()
            .includes(query)
        );
      });
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "rating") {
      result.sort(
        (a, b) =>
          (b.rating || 0) - (a.rating || 0)
      );
    }

    if (sort === "discount") {
      result.sort(
        (a, b) =>
          discountPercent(
            b.price,
            b.original_price
          ) -
          discountPercent(
            a.price,
            a.original_price
          )
      );
    }

    if (sort === "featured") {
      result.sort(
        (a, b) =>
          Number(b.is_featured) -
          Number(a.is_featured)
      );
    }

    return result;
  }, [
    products,
    categories,
    category,
    search,
    sort,
  ]);

  const featuredProducts = useMemo(
    () =>
      products
        .filter(
          (product) => product.is_featured
        )
        .slice(0, 8),
    [products]
  );

  const flashProducts = useMemo(
    () =>
      products
        .filter(
          (product) => product.is_flash_sale
        )
        .slice(0, 6),
    [products]
  );

  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, 8);

  /* =====================================================
     PRODUCT CARD
  ===================================================== */

  function ProductCard({
    product,
  }: {
    product: Product;
  }) {
    const discount = discountPercent(
      product.price,
      product.original_price
    );

    const image = imageUrl(product.image_url);

    return (
      <div
        className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
          darkMode
            ? "border-white/10 bg-[#11100d] hover:border-[#b8872d]/50"
            : "border-[#eee9df] bg-white hover:-translate-y-1 hover:border-[#d7b66c] hover:shadow-[0_18px_45px_rgba(184,135,45,0.12)]"
        }`}
      >
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
          {discount > 0 && (
            <span className="rounded-lg bg-[#b8872d] px-2.5 py-1 text-[10px] font-bold text-white">
              {discount}% OFF
            </span>
          )}

          {product.is_flash_sale && (
            <span className="flex items-center gap-1 rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white">
              <Zap className="h-3 w-3" />
              FLASH
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            toggleWishlist(product.id)
          }
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition ${
            wishlist.includes(product.id)
              ? "border-red-200 bg-red-50 text-red-500"
              : darkMode
              ? "border-white/10 bg-black/30 text-white/70 hover:text-red-400"
              : "border-[#eee9df] bg-white/90 text-slate-500 hover:text-red-500"
          }`}
        >
          <Heart
            className="h-4 w-4"
            fill={
              wishlist.includes(product.id)
                ? "currentColor"
                : "none"
            }
          />
        </button>

        <Link
          href={`/dashboard/product/${product.id}`}
          className="block"
        >
          <div
            className={`flex h-[230px] items-center justify-center overflow-hidden ${
              darkMode
                ? "bg-[#171511]"
                : "bg-[#faf8f3]"
            }`}
          >
            {image ? (
              <img
                src={image}
                alt={product.name}
                className="h-full w-full object-contain p-7 transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-300">
                <ShoppingBag className="h-12 w-12" />
                <span className="text-xs">
                  No image
                </span>
              </div>
            )}
          </div>
        </Link>

        <div className="p-4">
          {product.brand && (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#b8872d]">
              {product.brand}
            </p>
          )}

          <Link
            href={`/dashboard/product/${product.id}`}
          >
            <h3
              className={`line-clamp-2 min-h-[42px] text-sm font-semibold transition ${
                darkMode
                  ? "text-white hover:text-[#d8b96a]"
                  : "text-[#25211a] hover:text-[#b8872d]"
              }`}
            >
              {product.name}
            </h3>
          </Link>

          {product.short_description && (
            <p className="mt-1 line-clamp-1 text-xs text-slate-400">
              {product.short_description}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-1 text-[11px] font-semibold text-emerald-600">
              <Star
                className="h-3 w-3"
                fill="currentColor"
              />
              {Number(
                product.rating || 0
              ).toFixed(1)}
            </span>

            <span className="text-[11px] text-slate-400">
              ({product.reviews_count || 0})
            </span>
          </div>

          <div className="mt-3 flex items-end gap-2">
            <span
              className={`text-lg font-bold ${
                darkMode
                  ? "text-white"
                  : "text-[#201d17]"
              }`}
            >
              {formatPrice(product.price)}
            </span>

            {product.original_price &&
              product.original_price >
                product.price && (
                <span className="pb-0.5 text-xs text-slate-400 line-through">
                  {formatPrice(
                    product.original_price
                  )}
                </span>
              )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                addToCart(product)
              }
              disabled={product.stock <= 0}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#d9c08a] px-3 py-2.5 text-xs font-semibold text-[#9a6e1f] transition hover:bg-[#fff9ec] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Cart
            </button>

            <button
              type="button"
              onClick={() =>
                buyNow(product)
              }
              disabled={product.stock <= 0}
              className="rounded-xl bg-[#b8872d] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#9e7325] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {product.stock <= 0
                ? "Out of stock"
                : "Buy Now"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-[#080806] text-white"
          : "bg-[#faf8f3] text-[#25211a]"
      }`}
    >
      {/* =================================================
          TOP BAR
      ================================================= */}

      <div
        className={`hidden border-b py-2.5 lg:block ${
          darkMode
            ? "border-white/10 bg-[#0e0d0a]"
            : "border-[#eee8dc] bg-[#fffdf9]"
        }`}
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 text-[11px]">
          <div className="flex items-center gap-6 text-slate-500">
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-[#b8872d]" />
              Free shipping above ₹499
            </span>

            <span className="flex items-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5 text-[#b8872d]" />
              Easy returns
            </span>

            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#b8872d]" />
              Secure shopping
            </span>
          </div>

          <div className="flex items-center gap-5 text-slate-500">
            <Link
              href="/dashboard/orders"
              className="hover:text-[#b8872d]"
            >
              Track Order
            </Link>

            <Link
              href="/dashboard/prime-points"
              className="hover:text-[#b8872d]"
            >
              PrimePoints
            </Link>

            <Link
              href="/dashboard/settings"
              className="hover:text-[#b8872d]"
            >
              Help
            </Link>
          </div>
        </div>
      </div>

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
          darkMode
            ? "border-white/10 bg-[#080806]/90"
            : "border-[#eee8dc] bg-[#fffdf9]/95"
        }`}
      >
        <div className="mx-auto flex h-[74px] max-w-[1500px] items-center gap-4 px-4 sm:px-6">
          <button
            type="button"
            onClick={() =>
              setMobileMenu((value) => !value)
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e9dfcb] lg:hidden"
          >
            {mobileMenu ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b8872d] text-white shadow-lg shadow-[#b8872d]/20">
              <ShoppingBag className="h-5 w-5" />
            </div>

            <div className="hidden sm:block">
              <div className="text-xl font-black tracking-tight">
                Prime<span className="text-[#b8872d]">Cart</span>
              </div>

              <div className="text-[8px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                Shop smarter
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-[#b8872d]"
            >
              Home
            </Link>

            <a
              href="#categories"
              className="text-sm font-medium text-slate-500 transition hover:text-[#b8872d]"
            >
              Categories
            </a>

            <a
              href="#featured"
              className="text-sm font-medium text-slate-500 transition hover:text-[#b8872d]"
            >
              Featured
            </a>

            <a
              href="#deals"
              className="text-sm font-medium text-slate-500 transition hover:text-[#b8872d]"
            >
              Deals
            </a>

            <Link
              href="/dashboard/prime-match"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[#b8872d]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              PrimeMatch
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden w-[250px] xl:block">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search products..."
                  className={`h-10 w-full rounded-xl border pl-10 pr-4 text-xs outline-none transition ${
                    darkMode
                      ? "border-white/10 bg-white/5 text-white"
                      : "border-[#e8dfd0] bg-[#faf8f3]"
                  }`}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setSearchOpen(
                  (value) => !value
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-[#f5efe3] hover:text-[#b8872d] xl:hidden"
            >
              <Search className="h-4 w-4" />
            </button>

            <Link
              href="/dashboard/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-[#f5efe3] hover:text-[#b8872d]"
            >
              <Heart className="h-4 w-4" />

              {wishlist.length > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/orders"
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-[#f5efe3] hover:text-[#b8872d] sm:flex"
            >
              <PackageCheck className="h-4 w-4" />
            </Link>

            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-[#f5efe3] hover:text-[#b8872d]"
            >
              <ShoppingCart className="h-4 w-4" />

              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b8872d] px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-[#f5efe3] hover:text-[#b8872d] sm:flex"
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <Link
              href="/profile"
              className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#b8872d] text-white sm:flex"
            >
              <User className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-[#eee8dc] p-3 xl:hidden">
            <div className="relative mx-auto max-w-[1500px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                autoFocus
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search products..."
                className="h-11 w-full rounded-xl border border-[#e8dfd0] bg-[#faf8f3] pl-10 pr-4 text-sm outline-none focus:border-[#b8872d]"
              />
            </div>
          </div>
        )}

        {mobileMenu && (
          <div
            className={`border-t px-5 py-5 lg:hidden ${
              darkMode
                ? "border-white/10 bg-[#0e0d0a]"
                : "border-[#eee8dc] bg-white"
            }`}
          >
            <div className="flex flex-col gap-4">
              <Link
                href="/dashboard"
                className="font-semibold text-[#b8872d]"
              >
                Home
              </Link>

              <a href="#categories">
                Categories
              </a>

              <a href="#featured">
                Featured Products
              </a>

              <a href="#deals">
                Flash Deals
              </a>

              <Link href="/dashboard/prime-match">
                PrimeMatch
              </Link>

              <Link href="/dashboard/budget-builder">
                Budget Builder
              </Link>

              <Link href="/dashboard/setup">
                Build My Setup
              </Link>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 text-left"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}

                {darkMode
                  ? "Light Mode"
                  : "Dark Mode"}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="mx-auto max-w-[1500px] px-4 pt-5 sm:px-6 lg:pt-7">
        <div
          className={`relative min-h-[430px] overflow-hidden rounded-[30px] border ${
            darkMode
              ? "border-[#3a3020] bg-[#15120c]"
              : "border-[#eadfc9] bg-[#fffdf8]"
          }`}
        >
          <div className="absolute inset-0">
            <div
              className={`absolute right-[-100px] top-[-100px] h-[400px] w-[400px] rounded-full blur-3xl ${
                darkMode
                  ? "bg-[#b8872d]/10"
                  : "bg-[#b8872d]/10"
              }`}
            />

            <div className="absolute bottom-[-160px] left-[35%] h-[400px] w-[400px] rounded-full bg-[#d9b86c]/10 blur-3xl" />
          </div>

          <div className="relative grid min-h-[430px] items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.1fr_.9fr] lg:px-16">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d8bd7c] bg-[#fffaf0] px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-[#a8781f]">
                <Sparkles className="h-3.5 w-3.5" />
                {heroSlides[heroIndex].eyebrow}
              </div>

              <h1
                className={`text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl ${
                  darkMode
                    ? "text-white"
                    : "text-[#211d16]"
                }`}
              >
                {heroSlides[heroIndex].title}
                <br />
                <span className="text-[#b8872d]">
                  {heroSlides[heroIndex].highlight}
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                {heroSlides[heroIndex].text}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={
                    heroSlides[heroIndex].href
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-[#b8872d] px-5 py-3 text-sm font-bold text-white shadow-xl shadow-[#b8872d]/20 transition hover:bg-[#9f7527]"
                >
                  {heroSlides[heroIndex].button}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/dashboard/prime-match"
                  className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                    darkMode
                      ? "border-white/10 text-white hover:bg-white/5"
                      : "border-[#dfd4c1] text-[#5c513e] hover:bg-[#fffaf0]"
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-[#b8872d]" />
                  PrimeMatch
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-5 text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-[#b8872d]" />
                  Verified products
                </span>

                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#b8872d]" />
                  Secure checkout
                </span>

                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#b8872d]" />
                  Fast delivery
                </span>
              </div>
            </div>

            <div className="relative hidden h-[350px] lg:block">
              <div className="absolute right-4 top-1/2 w-[350px] -translate-y-1/2">
                <div className="relative rounded-[32px] border border-[#d9c08a] bg-white/80 p-5 shadow-[0_30px_80px_rgba(80,60,20,0.12)] backdrop-blur-xl">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b8872d]">
                        PrimeCart Picks
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#272218]">
                        Curated for you
                      </p>
                    </div>

                    <Gift className="h-6 w-6 text-[#b8872d]" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {(
                      featuredProducts.length
                        ? featuredProducts
                        : products
                    )
                      .slice(0, 4)
                      .map((product) => (
                        <div
                          key={product.id}
                          className="rounded-2xl border border-[#eee8dc] bg-[#faf8f3] p-3"
                        >
                          <div className="flex h-24 items-center justify-center">
                            {imageUrl(
                              product.image_url
                            ) ? (
                              <img
                                src={imageUrl(
                                  product.image_url
                                )!}
                                alt=""
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <ShoppingBag className="h-8 w-8 text-[#d0c4ac]" />
                            )}
                          </div>

                          <p className="mt-2 line-clamp-1 text-xs font-semibold text-[#342e24]">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs font-bold text-[#b8872d]">
                            {formatPrice(
                              product.price
                            )}
                          </p>
                        </div>
                      ))}
                  </div>

                  <div className="mt-4 rounded-xl bg-[#fff8e9] p-3 text-center">
                    <span className="text-xs font-semibold text-[#9a6e1f]">
                      Smart picks • Better value • Prime experience
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() =>
                  setHeroIndex(index)
                }
                className={`h-1.5 rounded-full transition-all ${
                  index === heroIndex
                    ? "w-7 bg-[#b8872d]"
                    : "w-1.5 bg-[#d4c7af]"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setHeroIndex(
                heroIndex === 0
                  ? heroSlides.length - 1
                  : heroIndex - 1
              )
            }
            className="absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e4d9c4] bg-white/80 text-[#8d7446] backdrop-blur transition hover:bg-white lg:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() =>
              setHeroIndex(
                heroIndex ===
                  heroSlides.length - 1
                  ? 0
                  : heroIndex + 1
              )
            }
            className="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e4d9c4] bg-white/80 text-[#8d7446] backdrop-blur transition hover:bg-white lg:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* =================================================
          QUICK FEATURES
      ================================================= */}

      <section className="mx-auto max-w-[1500px] px-4 pt-5 sm:px-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              icon: Truck,
              title: "Fast Delivery",
              text: "Reliable doorstep delivery",
            },
            {
              icon: ShieldCheck,
              title: "Secure Shopping",
              text: "Protected payments",
            },
            {
              icon: RotateCcw,
              title: "Easy Returns",
              text: "Simple return process",
            },
            {
              icon: BadgeCheck,
              title: "Verified Products",
              text: "Quality you can trust",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`flex items-center gap-3 rounded-2xl border p-4 ${
                  darkMode
                    ? "border-white/10 bg-[#11100d]"
                    : "border-[#eee8dc] bg-white"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff7e7] text-[#b8872d]">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-bold">
                    {item.title}
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =================================================
          CATEGORIES
      ================================================= */}

      <section
        id="categories"
        className="mx-auto max-w-[1500px] px-4 pt-12 sm:px-6"
      >
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#b8872d]">
              Explore
            </p>

            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              Shop by Category
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Find exactly what you are looking for.
            </p>
          </div>

          {categories.length > 8 && (
            <button
              type="button"
              onClick={() =>
                setShowAllCategories(
                  (value) => !value
                )
              }
              className="text-xs font-semibold text-[#b8872d]"
            >
              {showAllCategories
                ? "Show Less"
                : "View All"}
            </button>
          )}
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            <button
              type="button"
              onClick={() => {
                setCategory("All");
                document
                  .getElementById("products")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
              className={`rounded-2xl border p-4 text-center transition ${
                category === "All"
                  ? "border-[#caa85d] bg-[#fff8e9] shadow-sm"
                  : darkMode
                  ? "border-white/10 bg-[#11100d] hover:border-[#b8872d]/50"
                  : "border-[#eee8dc] bg-white hover:-translate-y-1 hover:border-[#d7b66c]"
              }`}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faf6ed] text-2xl">
                🛍️
              </div>

              <p className="mt-3 text-xs font-bold">
                All Products
              </p>
            </button>

            {visibleCategories.map(
              (item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCategory(item.name);

                    document
                      .getElementById(
                        "products"
                      )
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }}
                  className={`rounded-2xl border p-4 text-center transition ${
                    category === item.name
                      ? "border-[#caa85d] bg-[#fff8e9] shadow-sm"
                      : darkMode
                      ? "border-white/10 bg-[#11100d] hover:border-[#b8872d]/50"
                      : "border-[#eee8dc] bg-white hover:-translate-y-1 hover:border-[#d7b66c]"
                  }`}
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faf6ed] text-2xl">
                    {getCategoryIcon(
                      item.name
                    )}
                  </div>

                  <p className="mt-3 line-clamp-1 text-xs font-bold">
                    {item.name}
                  </p>
                </button>
              )
            )}
          </div>
        )}
      </section>

      {/* =================================================
          FEATURED
      ================================================= */}

      <section
        id="featured"
        className="mx-auto max-w-[1500px] px-4 pt-12 sm:px-6"
      >
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#b8872d]">
              Curated for you
            </p>

            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              Featured Products
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Popular picks selected for PrimeCart shoppers.
            </p>
          </div>

          <Link
            href="/dashboard/products"
            className="hidden items-center gap-1 text-xs font-bold text-[#b8872d] sm:flex"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div
                key={index}
                className="h-[430px] animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d8ccb7] bg-white p-12 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-[#c9b68f]" />
            <p className="mt-3 text-sm font-semibold">
              No featured products available
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}
          </div>
        )}
      </section>

      {/* =================================================
          FLASH DEALS
      ================================================= */}

      <section
        id="deals"
        className="mx-auto max-w-[1500px] px-4 pt-14 sm:px-6"
      >
        <div className="overflow-hidden rounded-[28px] border border-[#ead8ad] bg-[#fff8e9] p-5 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b8872d] text-white">
                  <Zap className="h-4 w-4" />
                </div>

                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#9b701f]">
                  Flash Deals
                </span>
              </div>

              <h2 className="mt-3 text-2xl font-black text-[#2c261b] sm:text-3xl">
                Deals that disappear fast
              </h2>

              <p className="mt-1 max-w-xl text-xs leading-6 text-[#806f4d]">
                Limited-time prices on selected products.
                Grab your favourites before the deal ends.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {[
                ["08", "HRS"],
                ["42", "MIN"],
                ["18", "SEC"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-xl bg-white px-4 py-3 text-center shadow-sm"
                >
                  <p className="text-xl font-black text-[#2c261b]">
                    {value}
                  </p>

                  <p className="text-[8px] font-bold text-[#9b701f]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {flashProducts.length > 0 && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flashProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}
          </div>
        )}
      </section>

      {/* =================================================
          ALL PRODUCTS
      ================================================= */}

      <section
        id="products"
        className="mx-auto max-w-[1500px] px-4 pb-16 pt-14 sm:px-6"
      >
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#b8872d]">
              Discover
            </p>

            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              {category === "All"
                ? "All Products"
                : category}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {filteredProducts.length} products found
              {search
                ? ` for "${search}"`
                : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

              <select
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target.value
                  )
                }
                className="h-10 appearance-none rounded-xl border border-[#e8dfd0] bg-white pl-9 pr-9 text-xs font-semibold text-slate-600 outline-none"
              >
                <option value="featured">
                  Featured
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="rating">
                  Highest Rated
                </option>

                <option value="discount">
                  Biggest Discount
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            <button
              type="button"
              onClick={() =>
                setView("grid")
              }
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                view === "grid"
                  ? "border-[#d6b86e] bg-[#fff8e9] text-[#b8872d]"
                  : "border-[#e8dfd0] bg-white text-slate-400"
              }`}
            >
              <Grid2X2 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() =>
                setView("list")
              }
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                view === "list"
                  ? "border-[#d6b86e] bg-[#fff8e9] text-[#b8872d]"
                  : "border-[#e8dfd0] bg-white text-slate-400"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#d8ccb7] bg-white px-6 py-16 text-center">
            <Search className="mx-auto h-10 w-10 text-[#cbbd9f]" />

            <h3 className="mt-4 text-lg font-bold">
              No products found
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Try another search or category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-5 rounded-xl bg-[#b8872d] px-5 py-2.5 text-xs font-bold text-white"
            >
              Clear Filters
            </button>
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map(
              (product) => {
                const image = imageUrl(
                  product.image_url
                );

                const discount =
                  discountPercent(
                    product.price,
                    product.original_price
                  );

                return (
                  <div
                    key={product.id}
                    className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center ${
                      darkMode
                        ? "border-white/10 bg-[#11100d]"
                        : "border-[#eee8dc] bg-white"
                    }`}
                  >
                    <Link
                      href={`/dashboard/product/${product.id}`}
                      className="flex h-28 w-full shrink-0 items-center justify-center rounded-xl bg-[#faf8f3] sm:w-32"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-contain p-3"
                        />
                      ) : (
                        <ShoppingBag className="h-8 w-8 text-[#cdbd9d]" />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      {product.brand && (
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#b8872d]">
                          {product.brand}
                        </p>
                      )}

                      <Link
                        href={`/dashboard/product/${product.id}`}
                      >
                        <h3 className="mt-1 line-clamp-2 text-base font-bold">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                        {product.short_description}
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <Star
                            className="h-3.5 w-3.5"
                            fill="currentColor"
                          />
                          {Number(
                            product.rating || 0
                          ).toFixed(1)}
                        </span>

                        <span className="text-xs text-slate-400">
                          {product.reviews_count ||
                            0}{" "}
                          reviews
                        </span>

                        {discount > 0 && (
                          <span className="text-xs font-bold text-[#b8872d]">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 sm:w-40">
                      <div>
                        <p className="text-lg font-black">
                          {formatPrice(
                            product.price
                          )}
                        </p>

                        {product.original_price &&
                          product.original_price >
                            product.price && (
                            <p className="text-xs text-slate-400 line-through">
                              {formatPrice(
                                product.original_price
                              )}
                            </p>
                          )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            addToCart(
                              product
                            )
                          }
                          className="rounded-xl border border-[#d9c08a] py-2 text-xs font-bold text-[#9a6e1f]"
                        >
                          Cart
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            buyNow(product)
                          }
                          className="rounded-xl bg-[#b8872d] py-2 text-xs font-bold text-white"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* =================================================
          PRIME FEATURES
      ================================================= */}

      <section className="border-y border-[#eee8dc] bg-[#fffdf9]">
        <div className="mx-auto max-w-[1500px] px-4 py-14 sm:px-6">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#b8872d]">
              More than shopping
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              The PrimeCart Experience
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-xs leading-6 text-slate-400">
              Smart tools designed to make every shopping
              decision easier.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/dashboard/prime-match",
                icon: Sparkles,
                title: "PrimeMatch",
                text: "Tell us your needs and budget. Find products that fit.",
              },
              {
                href: "/dashboard/budget-builder",
                icon: Tag,
                title: "Budget Builder",
                text: "Plan your shopping within a realistic budget.",
              },
              {
                href: "/dashboard/setup",
                icon: LayoutGrid,
                title: "Build My Setup",
                text: "Create gaming, college, work or lifestyle setups.",
              },
              {
                href: "/dashboard/prime-points",
                icon: Gift,
                title: "PrimePoints",
                text: "Earn points and unlock rewards while you shop.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-[#eee8dc] bg-white p-6 transition hover:-translate-y-1 hover:border-[#d7b66c] hover:shadow-[0_18px_40px_rgba(184,135,45,0.1)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7e7] text-[#b8872d] transition group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 text-sm font-black">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-slate-400">
                    {item.text}
                  </p>

                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#b8872d]">
                    Explore
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer
        className={`${
          darkMode
            ? "bg-[#080806]"
            : "bg-[#201c15]"
        } px-4 py-12 text-white sm:px-6`}
      >
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b8872d]">
                  <ShoppingBag className="h-5 w-5" />
                </div>

                <div className="text-xl font-black">
                  Prime<span className="text-[#d4af58]">
                    Cart
                  </span>
                </div>
              </div>

              <p className="mt-4 max-w-sm text-xs leading-6 text-white/50">
                A smarter shopping experience built around
                better discovery, better value and better
                decisions.
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs text-white/50">
                <ShieldCheck className="h-4 w-4 text-[#d4af58]" />
                Secure & trusted shopping
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af58]">
                Shop
              </h4>

              <div className="mt-4 flex flex-col gap-3 text-xs text-white/50">
                <a href="#categories">
                  Categories
                </a>
                <a href="#featured">
                  Featured
                </a>
                <a href="#deals">
                  Flash Deals
                </a>
                <Link href="/dashboard/products">
                  All Products
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af58]">
                Prime
              </h4>

              <div className="mt-4 flex flex-col gap-3 text-xs text-white/50">
                <Link href="/dashboard/prime-match">
                  PrimeMatch
                </Link>
                <Link href="/dashboard/budget-builder">
                  Budget Builder
                </Link>
                <Link href="/dashboard/setup">
                  Build My Setup
                </Link>
                <Link href="/dashboard/prime-points">
                  PrimePoints
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af58]">
                Account
              </h4>

              <div className="mt-4 flex flex-col gap-3 text-xs text-white/50">
                <Link href="/profile">
                  Profile
                </Link>
                <Link href="/dashboard/orders">
                  Orders
                </Link>
                <Link href="/dashboard/wishlist">
                  Wishlist
                </Link>
                <Link href="/dashboard/settings">
                  Settings
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-[10px] text-white/30 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} PrimeCart.
              All rights reserved.
            </p>

            <div className="flex gap-5">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </footer>

      {/* =================================================
          TOAST
      ================================================= */}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-[#dfc98e] bg-white px-5 py-3 shadow-2xl">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff5dd] text-[#b8872d]">
            <BadgeCheck className="h-4 w-4" />
          </div>

          <span className="text-xs font-semibold text-[#3a3224]">
            {toast}
          </span>

          <button
            type="button"
            onClick={() =>
              setToast(null)
            }
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </main>
  );
}
