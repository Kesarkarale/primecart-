"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  ImageOff,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number | string | null;
  original_price: number | string | null;
  stock: number | null;
  image_url: string | null;
  brand: string | null;
  rating: number | string | null;
  reviews_count: number | null;
  is_featured: boolean | null;
  is_flash_sale: boolean | null;
  is_active: boolean | null;
};

type CartItem = Product & {
  quantity: number;
};

const CART_KEY = "primecart-cart";
const WISHLIST_KEY = "primecart-wishlist";

function formatPrice(value: number | string | null) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function getImageUrl(value: string | null) {
  if (!value) return null;

  const image = value.trim();

  if (!image) return null;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/")
  ) {
    return image;
  }

  return `/${image}`;
}

function getDiscount(
  price: number,
  originalPrice: number
) {
  if (!originalPrice || originalPrice <= price) return 0;

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100
  );
}

export default function ProductsPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [sort, setSort] = useState("featured");

  const [mobileFilters, setMobileFilters] =
    useState(false);

  const [wishlistIds, setWishlistIds] = useState<string[]>(
    []
  );

  const [cartCount, setCartCount] = useState(0);

  const [addingProductId, setAddingProductId] =
    useState<string | null>(null);

  const [toast, setToast] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [productsResult, categoriesResult] =
          await Promise.all([
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
                  is_flash_sale,
                  is_active
                `
              )
              .eq("is_active", true)
              .order("created_at", {
                ascending: false,
              }),

            supabase
              .from("categories")
              .select("id, name, slug")
              .order("name", {
                ascending: true,
              }),
          ]);

        if (productsResult.error) {
          throw productsResult.error;
        }

        if (categoriesResult.error) {
          throw categoriesResult.error;
        }

        setProducts(productsResult.data ?? []);
        setCategories(categoriesResult.data ?? []);

        /*
         * Local wishlist
         */
        try {
          const storedWishlist =
            localStorage.getItem(WISHLIST_KEY);

          if (storedWishlist) {
            const parsed = JSON.parse(storedWishlist);

            if (Array.isArray(parsed)) {
              setWishlistIds(
                parsed.filter(
                  (item): item is string =>
                    typeof item === "string"
                )
              );
            }
          }
        } catch {
          // ignore invalid local data
        }

        /*
         * Cart count
         */
        updateCartCount();

        /*
         * Supabase wishlist
         */
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("wishlist")
            .select("product_id")
            .eq("user_id", user.id);

          if (data) {
            setWishlistIds(
              data.map((item) => item.product_id)
            );
          }
        }
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CART COUNT
  |--------------------------------------------------------------------------
  */

  function updateCartCount() {
    try {
      const stored = localStorage.getItem(CART_KEY);

      if (!stored) {
        setCartCount(0);
        return;
      }

      const cart = JSON.parse(stored);

      if (!Array.isArray(cart)) {
        setCartCount(0);
        return;
      }

      const count = cart.reduce(
        (total: number, item: CartItem) =>
          total + Number(item.quantity ?? 1),
        0
      );

      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | TOAST
  |--------------------------------------------------------------------------
  */

  function showToast(message: string) {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2600);
  }

  /*
  |--------------------------------------------------------------------------
  | ADD CART
  |--------------------------------------------------------------------------
  */

  function addToCart(product: Product) {
    const stock = Number(product.stock ?? 0);

    if (stock <= 0) {
      showToast("This product is out of stock.");
      return;
    }

    setAddingProductId(product.id);

    try {
      const stored = localStorage.getItem(CART_KEY);

      let cart: CartItem[] = [];

      if (stored) {
        try {
          const parsed = JSON.parse(stored);

          if (Array.isArray(parsed)) {
            cart = parsed;
          }
        } catch {
          cart = [];
        }
      }

      const existingIndex = cart.findIndex(
        (item) => item.id === product.id
      );

      if (existingIndex >= 0) {
        const current = cart[existingIndex];

        cart[existingIndex] = {
          ...current,
          quantity: Math.min(
            Number(current.quantity ?? 1) + 1,
            stock
          ),
        };
      } else {
        cart.push({
          ...product,
          quantity: 1,
        });
      }

      localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
      );

      updateCartCount();

      showToast(`${product.name} added to cart.`);
    } catch {
      showToast("Unable to add product to cart.");
    }

    window.setTimeout(() => {
      setAddingProductId(null);
    }, 500);
  }

  /*
  |--------------------------------------------------------------------------
  | WISHLIST
  |--------------------------------------------------------------------------
  */

  async function toggleWishlist(productId: string) {
    const exists = wishlistIds.includes(productId);

    const next = exists
      ? wishlistIds.filter((id) => id !== productId)
      : [...wishlistIds, productId];

    setWishlistIds(next);

    try {
      localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(next)
      );
    } catch {
      // ignore
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast(
          exists
            ? "Removed from wishlist."
            : "Added to wishlist."
        );
        return;
      }

      if (exists) {
        await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        showToast("Removed from wishlist.");
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: productId,
          });

        if (error) throw error;

        showToast("Added to wishlist.");
      }
    } catch {
      showToast(
        exists
          ? "Removed from wishlist."
          : "Added to wishlist."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const query = search.trim().toLowerCase();

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
            .includes(query) ||
          product.description
            ?.toLowerCase()
            .includes(query)
        );
      });
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        (product) =>
          product.category_id === selectedCategory
      );
    }

    switch (sort) {
      case "price-low":
        result.sort(
          (a, b) =>
            Number(a.price ?? 0) -
            Number(b.price ?? 0)
        );
        break;

      case "price-high":
        result.sort(
          (a, b) =>
            Number(b.price ?? 0) -
            Number(a.price ?? 0)
        );
        break;

      case "rating":
        result.sort(
          (a, b) =>
            Number(b.rating ?? 0) -
            Number(a.rating ?? 0)
        );
        break;

      case "discount":
        result.sort((a, b) => {
          const aDiscount = getDiscount(
            Number(a.price ?? 0),
            Number(a.original_price ?? 0)
          );

          const bDiscount = getDiscount(
            Number(b.price ?? 0),
            Number(b.original_price ?? 0)
          );

          return bDiscount - aDiscount;
        });
        break;

      case "newest":
        break;

      default:
        result.sort(
          (a, b) =>
            Number(Boolean(b.is_featured)) -
            Number(Boolean(a.is_featured))
        );
    }

    return result;
  }, [
    products,
    search,
    selectedCategory,
    sort,
  ]);

  const flashProducts = useMemo(
    () =>
      products
        .filter(
          (product) =>
            product.is_flash_sale &&
            Number(product.stock ?? 0) > 0
        )
        .slice(0, 4),
    [products]
  );

  const featuredProducts = useMemo(
    () =>
      products
        .filter((product) => product.is_featured)
        .slice(0, 4),
    [products]
  );

  const selectedCategoryName =
    categories.find(
      (category) =>
        category.id === selectedCategory
    )?.name;

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#17130d]">
      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[100] w-[calc(100%-30px)] max-w-md -translate-x-1/2 animate-[toastIn_.3s_ease-out]">
          <div className="flex items-center gap-3 rounded-2xl border border-[#eadfc9] bg-white p-3.5 shadow-[0_20px_70px_rgba(40,30,10,.18)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#b9975b] text-white">
              <Check size={19} />
            </div>

            <p className="flex-1 text-sm font-bold">
              {toast}
            </p>

            <button
              onClick={() => setToast("")}
              className="text-gray-400 hover:text-black"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-[#eadfc9] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-4 px-5 sm:px-8 lg:px-10">
          <Link
            href="/dashboard"
            className="group flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b9975b] font-black text-white shadow-[0_7px_22px_rgba(185,151,91,.25)] transition duration-300 group-hover:scale-105 group-hover:rotate-[-4deg]">
              P
            </div>

            <div className="hidden sm:block">
              <div className="text-xl font-black tracking-tight">
                Prime<span className="text-[#b08a00]">
                  Cart
                </span>
              </div>

              <div className="text-[9px] font-bold uppercase tracking-[.2em] text-[#968d80]">
                Shop Smarter
              </div>
            </div>
          </Link>

          {/* SEARCH */}

          <div className="mx-auto hidden max-w-2xl flex-1 md:block">
            <div className="group relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9185] group-focus-within:text-[#b9975b]"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search products, brands and more..."
                className="h-11 w-full rounded-xl border border-[#eadfc9] bg-[#faf8f3] pl-11 pr-11 text-sm outline-none transition focus:border-[#b9975b] focus:bg-white focus:shadow-[0_0_0_4px_rgba(185,151,91,.08)]"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard/wishlist"
              className="hidden h-11 w-11 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#625b50] transition hover:border-[#b9975b] hover:text-red-500 sm:flex"
              aria-label="Wishlist"
            >
              <Heart size={18} />
            </Link>

            <Link
              href="/dashboard/orders"
              className="hidden rounded-xl border border-[#eadfc9] bg-white px-4 py-2.5 text-sm font-bold text-[#625b50] transition hover:border-[#b9975b] hover:text-[#8c6c00] lg:block"
            >
              My Orders
            </Link>

            <Link
              href="/dashboard/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#625b50] transition hover:border-[#b9975b] hover:text-[#8c6c00]"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />

              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b9975b] px-1 text-[9px] font-black text-white">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard"
              className="flex h-11 items-center gap-2 rounded-xl bg-[#17130d] px-4 text-sm font-bold text-white transition duration-300 hover:bg-[#b9975b]"
            >
              <ArrowLeft size={15} />

              <span className="hidden sm:inline">
                Dashboard
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
        {/* BREADCRUMB */}

        <div className="mb-6 flex items-center gap-2 text-sm text-[#8d8477]">
          <Link
            href="/dashboard"
            className="hover:text-[#8c6c00]"
          >
            Dashboard
          </Link>

          <span>/</span>

          <span className="font-bold text-[#17130d]">
            Products
          </span>
        </div>

        {/* HERO */}

        <section className="relative mb-8 overflow-hidden rounded-[30px] border border-[#eadfc9] bg-white shadow-[0_15px_50px_rgba(60,45,20,.05)]">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#b9975b]/10 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#eadfc9]/30 blur-3xl" />

          <div className="relative grid gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#eadfc9] bg-[#fffaf0] px-4 py-2 text-[11px] font-black uppercase tracking-[.16em] text-[#967400]">
                <Sparkles size={14} />
                PrimeCart Collection
              </div>

              <h1 className="max-w-3xl text-4xl font-black tracking-[-.04em] sm:text-5xl lg:text-6xl">
                Find what you{" "}
                <span className="text-[#b08a00]">
                  love.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756b5c] sm:text-base">
                Discover carefully selected products,
                exclusive deals and everyday essentials —
                all in one smarter shopping experience.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl bg-[#17130d] px-4 py-3 text-xs font-bold text-white">
                  <Package size={15} />
                  {products.length} Products
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-[#eadfc9] bg-[#faf8f3] px-4 py-3 text-xs font-bold text-[#625b50]">
                  <TrendingUp size={15} />
                  Curated For You
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex lg:flex-col">
              <StatCard
                label="Products"
                value={products.length}
              />

              <StatCard
                label="Categories"
                value={categories.length}
              />
            </div>
          </div>
        </section>

        {/* MOBILE SEARCH */}

        <div className="mb-5 md:hidden">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9185]"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search products..."
              className="h-12 w-full rounded-xl border border-[#eadfc9] bg-white pl-11 pr-10 text-sm outline-none focus:border-[#b9975b]"
            />
          </div>
        </div>

        {/* FLASH SALE */}

        {!loading &&
          !error &&
          flashProducts.length > 0 &&
          !search &&
          selectedCategory === "all" && (
            <section className="mb-9">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-[#967400]">
                    <Zap
                      size={15}
                      fill="currentColor"
                    />
                    Limited Time
                  </div>

                  <h2 className="mt-1 text-2xl font-black">
                    Flash Deals
                  </h2>
                </div>

                <span className="hidden text-xs font-semibold text-[#8d8477] sm:block">
                  Grab them before they're gone
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {flashProducts.map(
                  (product, index) => (
                    <MiniProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      onAddToCart={() =>
                        addToCart(product)
                      }
                    />
                  )
                )}
              </div>
            </section>
          )}

        {/* FILTER BAR */}

        <section className="sticky top-[72px] z-30 mb-7 rounded-2xl border border-[#eadfc9] bg-white/95 p-3 shadow-[0_8px_30px_rgba(60,45,20,.05)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() =>
                  setSelectedCategory("all")
                }
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  selectedCategory === "all"
                    ? "bg-[#17130d] text-white shadow-md"
                    : "text-[#625b50] hover:bg-[#faf8f3]"
                }`}
              >
                All
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    setSelectedCategory(category.id)
                  }
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    selectedCategory === category.id
                      ? "bg-[#fff5d4] text-[#8c6c00]"
                      : "text-[#625b50] hover:bg-[#faf8f3]"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setMobileFilters(!mobileFilters)
                }
                className="flex items-center gap-2 rounded-xl border border-[#eadfc9] px-4 py-2.5 text-sm font-bold md:hidden"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(e.target.value)
                  }
                  className="h-11 appearance-none rounded-xl border border-[#eadfc9] bg-white pl-4 pr-10 text-sm font-bold outline-none focus:border-[#b9975b]"
                >
                  <option value="featured">
                    Featured
                  </option>

                  <option value="newest">
                    Newest
                  </option>

                  <option value="rating">
                    Top Rated
                  </option>

                  <option value="discount">
                    Biggest Discount
                  </option>

                  <option value="price-low">
                    Price: Low to High
                  </option>

                  <option value="price-high">
                    Price: High to Low
                  </option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>
          </div>

          {mobileFilters && (
            <div className="mt-3 border-t border-[#eadfc9] pt-3 md:hidden">
              <p className="text-xs font-semibold text-[#756b5c]">
                Select a category above to filter
                products.
              </p>
            </div>
          )}
        </section>

        {/* ACTIVE FILTER */}

        {!loading &&
          selectedCategory !== "all" && (
            <div className="mb-5 flex items-center gap-2">
              <span className="text-sm text-[#8d8477]">
                Category:
              </span>

              <span className="rounded-full bg-[#fff5d4] px-3 py-1 text-xs font-bold text-[#8c6c00]">
                {selectedCategoryName}
              </span>

              <button
                onClick={() =>
                  setSelectedCategory("all")
                }
                className="text-gray-400 hover:text-black"
              >
                <X size={15} />
              </button>
            </div>
          )}

        {/* LOADING */}

        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map(
              (_, index) => (
                <ProductSkeleton key={index} />
              )
            )}
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-[28px] border border-red-100 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <X size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Unable to load products
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 rounded-xl bg-[#17130d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#b9975b]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div className="rounded-[28px] border border-[#eadfc9] bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fffaf0] text-[#b08a00]">
                <Search size={28} />
              </div>

              <h2 className="mt-5 text-2xl font-black">
                No products found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756b5c]">
                Try changing your search or selecting
                another category.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                }}
                className="mt-6 rounded-xl bg-[#17130d] px-6 py-3 text-sm font-bold text-white hover:bg-[#b9975b]"
              >
                Clear Filters
              </button>
            </div>
          )}

        {/* PRODUCT GRID */}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (
            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8d8477]">
                    Showing{" "}
                    <span className="font-black text-[#17130d]">
                      {filteredProducts.length}
                    </span>{" "}
                    products
                  </p>
                </div>

                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="hidden items-center gap-1.5 text-xs font-bold text-[#8c6c00] sm:flex"
                  >
                    Clear search
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map(
                  (product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      categoryName={
                        categories.find(
                          (category) =>
                            category.id ===
                            product.category_id
                        )?.name
                      }
                      isWishlisted={wishlistIds.includes(
                        product.id
                      )}
                      isAdding={
                        addingProductId === product.id
                      }
                      onWishlist={() =>
                        toggleWishlist(product.id)
                      }
                      onAddToCart={() =>
                        addToCart(product)
                      }
                    />
                  )
                )}
              </div>
            </section>
          )}

        {/* TRUST STRIP */}

        {!loading &&
          !error &&
          products.length > 0 && (
            <section className="mt-14 rounded-[28px] border border-[#eadfc9] bg-white p-6 sm:p-8">
              <div className="grid gap-6 sm:grid-cols-3">
                <TrustItem
                  icon={<Package size={19} />}
                  title="Quality Products"
                  text="Carefully selected products"
                />

                <TrustItem
                  icon={<ShoppingBag size={19} />}
                  title="Easy Shopping"
                  text="Simple and secure checkout"
                />

                <TrustItem
                  icon={<Check size={19} />}
                  title="Trusted Experience"
                  text="Designed for smarter shopping"
                />
              </div>
            </section>
          )}
      </div>

      <style jsx>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translate(-50%, 18px) scale(.96);
          }

          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        @keyframes productIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -500px 0;
          }

          100% {
            background-position: 500px 0;
          }
        }

        .product-shimmer {
          background: linear-gradient(
            90deg,
            #f2eee6 25%,
            #fbf9f4 50%,
            #f2eee6 75%
          );

          background-size: 500px 100%;
          animation: shimmer 1.4s infinite linear;
        }
      `}</style>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[#eadfc9] bg-[#faf8f3] px-5 py-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-[#9a9184]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-[#17130d]">
        {value}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| TRUST ITEM
|--------------------------------------------------------------------------
*/

function TrustItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff7df] text-[#a47e14]">
        {icon}
      </div>

      <div>
        <p className="text-sm font-black">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-[#8d8477]">
          {text}
        </p>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MINI FLASH CARD
|--------------------------------------------------------------------------
*/

function MiniProductCard({
  product,
  index,
  onAddToCart,
}: {
  product: Product;
  index: number;
  onAddToCart: () => void;
}) {
  const [imageError, setImageError] =
    useState(false);

  const imageUrl = getImageUrl(product.image_url);

  const price = Number(product.price ?? 0);

  const originalPrice = Number(
    product.original_price ?? 0
  );

  const discount = getDiscount(
    price,
    originalPrice
  );

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-[#eadfc9] bg-white transition duration-500 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(60,45,20,.10)]"
      style={{
        animation: `productIn .5s ease-out ${index * 70}ms both`,
      }}
    >
      <Link
        href={`/dashboard/products/${product.id}`}
        className="flex gap-4 p-3"
      >
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f7f4ed]">
          {imageUrl && !imageError ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="96px"
              className="object-cover transition duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <ImageOff size={20} />
            </div>
          )}

          {discount > 0 && (
            <span className="absolute left-1.5 top-1.5 rounded-md bg-[#17130d] px-1.5 py-1 text-[8px] font-black text-white">
              -{discount}%
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 py-1">
          <p className="line-clamp-2 text-sm font-black leading-5">
            {product.name}
          </p>

          <div className="mt-2 flex items-center gap-1">
            <Star
              size={12}
              fill="currentColor"
              className="text-[#b9975b]"
            />

            <span className="text-xs font-bold">
              {Number(
                product.rating ?? 0
              ).toFixed(1)}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-black">
              {formatPrice(price)}
            </span>

            {originalPrice > price && (
              <span className="text-[10px] text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        onClick={onAddToCart}
        className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#17130d] text-white opacity-0 transition group-hover:opacity-100 hover:bg-[#b9975b]"
        aria-label="Add to cart"
      >
        <ShoppingCart size={14} />
      </button>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PRODUCT CARD
|--------------------------------------------------------------------------
*/

function ProductCard({
  product,
  index,
  categoryName,
  isWishlisted,
  isAdding,
  onWishlist,
  onAddToCart,
}: {
  product: Product;
  index: number;
  categoryName?: string;
  isWishlisted: boolean;
  isAdding: boolean;
  onWishlist: () => void;
  onAddToCart: () => void;
}) {
  const [imageError, setImageError] =
    useState(false);

  const imageUrl = getImageUrl(product.image_url);

  const price = Number(product.price ?? 0);

  const originalPrice = Number(
    product.original_price ?? 0
  );

  const stock = Number(product.stock ?? 0);

  const rating = Number(product.rating ?? 0);

  const reviews = Number(
    product.reviews_count ?? 0
  );

  const discount = getDiscount(
    price,
    originalPrice
  );

  return (
    <article
      className="group overflow-hidden rounded-[26px] border border-[#eadfc9] bg-white shadow-[0_8px_30px_rgba(60,45,20,.035)] transition-all duration-500 hover:-translate-y-2 hover:border-[#d9c69a] hover:shadow-[0_25px_65px_rgba(60,45,20,.12)]"
      style={{
        animation: `productIn .55s ease-out ${Math.min(
          index * 45,
          450
        )}ms both`,
      }}
    >
      {/* IMAGE */}

      <div className="relative aspect-square overflow-hidden bg-[#f6f3ec]">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.07]"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-[#a39a8e]">
            <ImageOff size={34} />

            <span className="mt-2 text-xs font-semibold">
              Image unavailable
            </span>
          </div>
        )}

        {/* gradient */}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

        {/* BADGES */}

        <div className="absolute left-4 top-4 flex max-w-[70%] flex-col items-start gap-2">
          {product.is_flash_sale && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#17130d] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
              <Zap
                size={11}
                fill="currentColor"
                className="text-[#d5b878]"
              />
              Flash Sale
            </span>
          )}

          {product.is_featured && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b9975b] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
              <Sparkles size={11} />
              Featured
            </span>
          )}

          {discount > 0 && (
            <span className="rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#8c6c00] shadow-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* WISHLIST */}

        <button
          onClick={onWishlist}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${
            isWishlisted
              ? "scale-110 border-red-100 bg-red-50 text-red-500"
              : "border-white/80 bg-white/90 text-[#6c6459] hover:scale-110 hover:text-red-500"
          }`}
          aria-label="Wishlist"
        >
          <Heart
            size={18}
            fill={
              isWishlisted
                ? "currentColor"
                : "none"
            }
          />
        </button>

        {/* QUICK ADD */}

        {stock > 0 && (
          <button
            onClick={onAddToCart}
            disabled={isAdding}
            className="absolute bottom-4 left-4 right-4 hidden h-11 translate-y-3 items-center justify-center gap-2 rounded-xl bg-[#17130d] text-sm font-black text-white opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#b9975b] md:flex"
          >
            {isAdding ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart size={17} />
                Quick Add to Cart
              </>
            )}
          </button>
        )}

        {stock <= 0 && (
          <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/80 py-2.5 text-center text-xs font-black text-white backdrop-blur">
            Out of Stock
          </div>
        )}
      </div>

      {/* DETAILS */}

      <div className="p-5">
        {/* META */}

        <div className="mb-2.5 flex items-center justify-between gap-2">
          {categoryName ? (
            <span className="max-w-[65%] truncate rounded-full bg-[#faf6e8] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#967400]">
              {categoryName}
            </span>
          ) : (
            <span />
          )}

          {product.brand && (
            <span className="max-w-[40%] truncate text-[10px] font-black uppercase tracking-wider text-[#9a9184]">
              {product.brand}
            </span>
          )}
        </div>

        {/* TITLE */}

        <Link
          href={`/dashboard/products/${product.id}`}
          className="line-clamp-2 text-[17px] font-black leading-6 tracking-tight transition hover:text-[#a17b00]"
        >
          {product.name}
        </Link>

        {/* DESCRIPTION */}

        {product.short_description && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#756b5c]">
            {product.short_description}
          </p>
        )}

        {/* RATING */}

        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#fff6d8] px-2 py-1 text-xs font-black text-[#846400]">
            <Star
              size={12}
              fill="currentColor"
            />

            {rating.toFixed(1)}
          </span>

          <span className="text-xs text-[#9b9285]">
            {reviews} reviews
          </span>
        </div>

        {/* PRICE */}

        <div className="mt-4 flex items-end gap-2">
          <span className="text-xl font-black tracking-tight">
            {formatPrice(price)}
          </span>

          {originalPrice > price && (
            <span className="pb-0.5 text-sm text-[#aaa196] line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* SAVINGS */}

        {discount > 0 && (
          <p className="mt-1 text-[11px] font-bold text-[#a17b00]">
            You save{" "}
            {formatPrice(
              originalPrice - price
            )}
          </p>
        )}

        {/* STOCK */}

        <div className="mt-3 flex items-center justify-between">
          {stock > 0 ? (
            <span
              className={`text-xs font-bold ${
                stock <= 5
                  ? "text-orange-600"
                  : "text-emerald-600"
              }`}
            >
              <span className="mr-1">●</span>

              {stock <= 5
                ? `Only ${stock} left`
                : "In stock"}
            </span>
          ) : (
            <span className="text-xs font-bold text-red-500">
              <span className="mr-1">●</span>
              Out of stock
            </span>
          )}

          {product.is_flash_sale && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#8c6c00]">
              <Zap
                size={11}
                fill="currentColor"
              />
              Deal
            </span>
          )}
        </div>

        {/* ACTIONS */}

        <div className="mt-4 grid grid-cols-[1fr_46px] gap-2">
          <Link
            href={`/dashboard/products/${product.id}`}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#eadfc9] text-sm font-black text-[#625b50] transition duration-300 hover:border-[#b9975b] hover:bg-[#fffaf0] hover:text-[#927000]"
          >
            View Product
            <ArrowRight size={15} />
          </Link>

          <button
            onClick={onAddToCart}
            disabled={stock <= 0 || isAdding}
            className={`flex h-11 items-center justify-center rounded-xl transition-all duration-300 ${
              stock <= 0
                ? "cursor-not-allowed bg-[#f0ede7] text-[#aaa298]"
                : "bg-[#17130d] text-white hover:bg-[#b9975b]"
            }`}
          >
            {isAdding ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <ShoppingBag size={18} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| SKELETON
|--------------------------------------------------------------------------
*/

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-[#eadfc9] bg-white">
      <div className="product-shimmer aspect-square" />

      <div className="space-y-4 p-5">
        <div className="product-shimmer h-5 w-24 rounded-full" />

        <div className="product-shimmer h-5 w-4/5 rounded-lg" />

        <div className="product-shimmer h-4 w-3/5 rounded-lg" />

        <div className="product-shimmer h-5 w-20 rounded-lg" />

        <div className="product-shimmer h-7 w-32 rounded-lg" />

        <div className="product-shimmer h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}
