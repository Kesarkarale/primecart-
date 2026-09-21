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
  Search,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
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

function getImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;

  const value = imageUrl.trim();

  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  ) {
    return value;
  }

  return `/${value}`;
}

export default function ProductsPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sort, setSort] = useState("featured");

  const [mobileFilter, setMobileFilter] = useState(false);

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
  }>({
    show: false,
    message: "",
  });

  /*
   * LOAD PRODUCTS + CATEGORIES
   */
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [productsResult, categoriesResult] = await Promise.all([
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
            .order("created_at", { ascending: false }),

          supabase
            .from("categories")
            .select("id, name, slug")
            .order("name", { ascending: true }),
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
         * Load local wishlist first.
         */
        try {
          const localWishlist = localStorage.getItem(WISHLIST_KEY);

          if (localWishlist) {
            const parsed = JSON.parse(localWishlist);

            if (Array.isArray(parsed)) {
              setWishlistIds(
                parsed
                  .map((item) =>
                    typeof item === "string" ? item : item.product_id
                  )
                  .filter(Boolean)
              );
            }
          }
        } catch {
          // Ignore invalid local wishlist
        }

        /*
         * If logged in, load Supabase wishlist.
         */
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: wishlistData } = await supabase
            .from("wishlist")
            .select("product_id")
            .eq("user_id", user.id);

          if (wishlistData) {
            setWishlistIds(
              wishlistData
                .map((item) => item.product_id)
                .filter(Boolean)
            );
          }
        }
      } catch (err) {
        console.error("Products page error:", err);

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
   * AUTO HIDE TOAST
   */
  useEffect(() => {
    if (!toast.show) return;

    const timer = window.setTimeout(() => {
      setToast({
        show: false,
        message: "",
      });
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [toast.show]);

  /*
   * FILTER + SEARCH + SORT
   */
  const filteredProducts = useMemo(() => {
    let result = [...products];

    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((product) => {
        return (
          product.name.toLowerCase().includes(searchValue) ||
          product.brand?.toLowerCase().includes(searchValue) ||
          product.short_description
            ?.toLowerCase()
            .includes(searchValue) ||
          product.description
            ?.toLowerCase()
            .includes(searchValue)
        );
      });
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        (product) => product.category_id === selectedCategory
      );
    }

    switch (sort) {
      case "price-low":
        result.sort(
          (a, b) =>
            Number(a.price ?? 0) - Number(b.price ?? 0)
        );
        break;

      case "price-high":
        result.sort(
          (a, b) =>
            Number(b.price ?? 0) - Number(a.price ?? 0)
        );
        break;

      case "rating":
        result.sort(
          (a, b) =>
            Number(b.rating ?? 0) - Number(a.rating ?? 0)
        );
        break;

      case "newest":
        break;

      case "featured":
      default:
        result.sort(
          (a, b) =>
            Number(Boolean(b.is_featured)) -
            Number(Boolean(a.is_featured))
        );
        break;
    }

    return result;
  }, [products, search, selectedCategory, sort]);

  /*
   * ADD TO CART
   */
  function addToCart(product: Product) {
    if (Number(product.stock ?? 0) <= 0) {
      showToast("This product is currently out of stock.");
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
        const existing = cart[existingIndex];

        const nextQuantity = Math.min(
          Number(existing.quantity ?? 1) + 1,
          Number(product.stock ?? 1)
        );

        cart[existingIndex] = {
          ...existing,
          quantity: nextQuantity,
        };
      } else {
        cart.push({
          ...product,
          quantity: 1,
        });
      }

      localStorage.setItem(CART_KEY, JSON.stringify(cart));

      showToast(`${product.name} added to cart.`);
    } catch (err) {
      console.error("Cart error:", err);
      showToast("Unable to add product to cart.");
    } finally {
      window.setTimeout(() => {
        setAddingProductId(null);
      }, 450);
    }
  }

  /*
   * WISHLIST
   */
  async function toggleWishlist(productId: string) {
    const isCurrentlyWishlisted = wishlistIds.includes(productId);

    const nextIds = isCurrentlyWishlisted
      ? wishlistIds.filter((id) => id !== productId)
      : [...wishlistIds, productId];

    setWishlistIds(nextIds);

    /*
     * Local fallback
     */
    try {
      localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(nextIds)
      );
    } catch {
      // Ignore localStorage errors
    }

    /*
     * Supabase sync
     */
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast(
          isCurrentlyWishlisted
            ? "Removed from wishlist."
            : "Added to wishlist."
        );
        return;
      }

      if (isCurrentlyWishlisted) {
        const { error: deleteError } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (deleteError) {
          throw deleteError;
        }

        showToast("Removed from wishlist.");
      } else {
        const { error: insertError } = await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: productId,
          });

        if (insertError) {
          throw insertError;
        }

        showToast("Added to wishlist.");
      }
    } catch (err) {
      console.error("Wishlist error:", err);

      /*
       * Keep UI responsive even if DB sync fails.
       */
      showToast(
        isCurrentlyWishlisted
          ? "Removed from wishlist."
          : "Added to wishlist."
      );
    }
  }

  function showToast(message: string) {
    setToast({
      show: true,
      message,
    });
  }

  const selectedCategoryName =
    categories.find(
      (item) => item.id === selectedCategory
    )?.name;

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#17130d]">
      {/* TOAST */}
      {toast.show && (
        <div className="fixed bottom-5 left-1/2 z-[100] w-[calc(100%-32px)] max-w-md -translate-x-1/2 animate-[toastIn_0.35s_ease-out]">
          <div className="flex items-center gap-3 rounded-2xl border border-[#eadfc9] bg-white px-4 py-3.5 shadow-[0_18px_60px_rgba(40,30,15,0.18)]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#b9975b] text-white">
              <Check size={18} />
            </div>

            <p className="flex-1 text-sm font-bold text-[#17130d]">
              {toast.message}
            </p>

            <button
              onClick={() =>
                setToast({
                  show: false,
                  message: "",
                })
              }
              className="text-gray-400 transition hover:text-black"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#eadfc9] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-4 px-5 sm:px-8 lg:px-10">
          {/* LOGO */}
          <Link
            href="/dashboard"
            className="group flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b9975b] text-lg font-black text-white shadow-[0_6px_20px_rgba(185,151,91,0.25)] transition duration-300 group-hover:rotate-[-4deg] group-hover:scale-105">
              P
            </div>

            <div className="hidden sm:block">
              <div className="text-xl font-black tracking-tight text-[#17130d]">
                Prime<span className="text-[#b08a00]">Cart</span>
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#978d7e]">
                Shop Smarter
              </div>
            </div>
          </Link>

          {/* SEARCH */}
          <div className="mx-auto hidden max-w-2xl flex-1 md:block">
            <div className="group relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b9285] transition group-focus-within:text-[#b9975b]"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands and more..."
                className="h-11 w-full rounded-xl border border-[#eadfc9] bg-[#faf8f3] pl-11 pr-11 text-sm text-[#17130d] outline-none transition duration-300 placeholder:text-[#aaa194] focus:border-[#b9975b] focus:bg-white focus:shadow-[0_0_0_4px_rgba(185,151,91,0.08)]"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b9285] transition hover:text-[#17130d]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard/categories"
              className="hidden items-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-4 py-2.5 text-sm font-semibold text-[#625b50] transition duration-300 hover:-translate-y-0.5 hover:border-[#b9975b] hover:bg-[#fffaf0] hover:text-[#8c6c00] sm:flex"
            >
              Categories
            </Link>

            <Link
              href="/dashboard/orders"
              className="hidden items-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-4 py-2.5 text-sm font-semibold text-[#625b50] transition duration-300 hover:border-[#b9975b] hover:text-[#8c6c00] lg:flex"
            >
              My Orders
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-[#17130d] px-4 py-2.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#b9975b] hover:shadow-lg"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">
                Dashboard
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
        {/* BREADCRUMB */}
        <div className="mb-7 flex items-center gap-2 text-sm text-[#8c8375]">
          <Link
            href="/dashboard"
            className="transition hover:text-[#8c6c00]"
          >
            Dashboard
          </Link>

          <span>/</span>

          <span className="font-semibold text-[#17130d]">
            Products
          </span>
        </div>

        {/* HERO / TITLE */}
        <section className="relative mb-8 overflow-hidden rounded-[28px] border border-[#eadfc9] bg-white p-6 shadow-[0_12px_45px_rgba(60,45,20,0.04)] sm:p-8 lg:p-10">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#b9975b]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-[#eadfc9]/40 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#eadfc9] bg-[#fffaf0] px-4 py-2 text-xs font-bold uppercase tracking-[0.13em] text-[#967400]">
                <Sparkles size={14} />
                PrimeCart Collection
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[#17130d] sm:text-4xl lg:text-5xl">
                All{" "}
                <span className="text-[#b08a00]">
                  Products
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756b5c] sm:text-base">
                Explore our complete collection of products,
                carefully selected to make every shopping experience
                smarter and easier.
              </p>
            </div>

            {!loading && !error && (
              <div className="grid grid-cols-2 gap-3 sm:flex">
                <div className="rounded-2xl border border-[#eadfc9] bg-[#faf8f3] px-5 py-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9a9184]">
                    Available
                  </p>

                  <p className="mt-1 text-2xl font-black text-[#17130d]">
                    {products.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#eadfc9] bg-[#fffaf0] px-5 py-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9a9184]">
                    Showing
                  </p>

                  <p className="mt-1 text-2xl font-black text-[#b08a00]">
                    {filteredProducts.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* MOBILE SEARCH */}
        <div className="mb-5 md:hidden">
          <div className="group relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b9285]"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="h-12 w-full rounded-xl border border-[#eadfc9] bg-white pl-11 pr-10 text-sm outline-none transition focus:border-[#b9975b] focus:shadow-[0_0_0_4px_rgba(185,151,91,0.08)]"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* FILTER BAR */}
        <section className="mb-8 rounded-2xl border border-[#eadfc9] bg-white p-3 shadow-[0_8px_30px_rgba(60,45,20,0.035)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* CATEGORIES */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition duration-300 ${
                  selectedCategory === "all"
                    ? "bg-[#17130d] text-white shadow-md"
                    : "text-[#625b50] hover:bg-[#faf8f3] hover:text-[#17130d]"
                }`}
              >
                All Products
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    setSelectedCategory(category.id)
                  }
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-300 ${
                    selectedCategory === category.id
                      ? "bg-[#fff5d4] text-[#8c6c00] shadow-sm"
                      : "text-[#625b50] hover:bg-[#faf8f3] hover:text-[#17130d]"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* SORT */}
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setMobileFilter(!mobileFilter)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition md:hidden ${
                  mobileFilter
                    ? "border-[#b9975b] bg-[#fffaf0] text-[#8c6c00]"
                    : "border-[#eadfc9] bg-white text-[#625b50]"
                }`}
              >
                <SlidersHorizontal size={16} />
                Filter
              </button>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-11 appearance-none rounded-xl border border-[#eadfc9] bg-white pl-4 pr-10 text-sm font-semibold text-[#4f493f] outline-none transition focus:border-[#b9975b]"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-low">
                    Price: Low to High
                  </option>
                  <option value="price-high">
                    Price: High to Low
                  </option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7d7468]"
                />
              </div>
            </div>
          </div>

          {mobileFilter && (
            <div className="mt-3 border-t border-[#eadfc9] pt-3 md:hidden">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#756b5c]">
                <SlidersHorizontal size={14} />
                Choose a category above to filter products.
              </div>
            </div>
          )}
        </section>

        {/* ACTIVE FILTER */}
        {!loading && selectedCategory !== "all" && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-sm text-[#8c8375]">
              Showing:
            </span>

            <span className="rounded-full bg-[#fff5d4] px-3 py-1 text-xs font-bold text-[#8c6c00]">
              {selectedCategoryName}
            </span>

            <button
              onClick={() => setSelectedCategory("all")}
              className="ml-1 text-[#9b9285] transition hover:text-[#17130d]"
              aria-label="Clear category"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-100 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <X size={28} />
            </div>

            <h2 className="text-2xl font-black">
              Unable to load products
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#756b5c]">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-[#17130d] px-5 py-3 text-sm font-bold text-white transition duration-300 hover:bg-[#b9975b]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div className="rounded-3xl border border-[#eadfc9] bg-white px-6 py-20 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#fffaf0] text-[#b08a00]">
                <Search size={28} />
              </div>

              <h2 className="text-2xl font-black">
                No products found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756b5c]">
                We couldn't find products matching your
                current search or category filter.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                }}
                className="mt-6 rounded-xl bg-[#17130d] px-5 py-3 text-sm font-bold text-white transition duration-300 hover:bg-[#b9975b]"
              >
                Clear Filters
              </button>
            </div>
          )}

        {/* PRODUCTS */}
        {!loading &&
          !error &&
          filteredProducts.length > 0 && (
            <section>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-[#8c8375]">
                  Showing{" "}
                  <span className="font-bold text-[#17130d]">
                    {filteredProducts.length}
                  </span>{" "}
                  products
                </p>

                {wishlistIds.length > 0 && (
                  <Link
                    href="/dashboard/wishlist"
                    className="hidden items-center gap-1.5 text-xs font-bold text-[#8c6c00] transition hover:text-[#6e5300] sm:flex"
                  >
                    <Heart size={14} fill="currentColor" />
                    {wishlistIds.length} wishlisted
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    categoryName={
                      categories.find(
                        (category) =>
                          category.id === product.category_id
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
                ))}
              </div>
            </section>
          )}
      </div>

      <style jsx>{`
        @keyframes toastIn {
          0% {
            opacity: 0;
            transform: translate(-50%, 20px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        @keyframes productIn {
          0% {
            opacity: 0;
            transform: translateY(18px);
          }
          100% {
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
            #faf8f3 50%,
            #f2eee6 75%
          );
          background-size: 500px 100%;
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>
    </main>
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
  const [imageError, setImageError] = useState(false);

  const imageUrl = getImageUrl(product.image_url);

  const price = Number(product.price ?? 0);
  const originalPrice = Number(
    product.original_price ?? 0
  );

  const stock = Number(product.stock ?? 0);

  const discount =
    originalPrice > price
      ? Math.round(
          ((originalPrice - price) / originalPrice) * 100
        )
      : 0;

  const rating = Number(product.rating ?? 0);

  return (
    <article
      className="group overflow-hidden rounded-[26px] border border-[#eadfc9] bg-white shadow-[0_8px_30px_rgba(60,45,20,0.035)] transition-all duration-500 hover:-translate-y-2 hover:border-[#d8c69e] hover:shadow-[0_24px_60px_rgba(60,45,20,0.11)]"
      style={{
        animation: `productIn 0.55s ease-out ${Math.min(
          index * 0.055,
          0.4
        )}s both`,
      }}
    >
      {/* IMAGE */}
      <div className="relative aspect-square overflow-hidden bg-[#f7f4ed]">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.08]"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-[#a29a8d]">
            <ImageOff size={34} />

            <span className="mt-2 text-xs font-semibold">
              Image unavailable
            </span>
          </div>
        )}

        {/* IMAGE OVERLAY */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

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
            <span className="rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#8c6c00] shadow-sm backdrop-blur">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* WISHLIST */}
        <button
          onClick={onWishlist}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${
            isWishlisted
              ? "scale-110 border-red-100 bg-red-50 text-red-500 shadow-md"
              : "border-white/80 bg-white/90 text-[#6c6459] hover:scale-110 hover:text-red-500"
          }`}
        >
          <Heart
            size={18}
            fill={isWishlisted ? "currentColor" : "none"}
            className="transition-transform duration-300"
          />
        </button>

        {/* DESKTOP QUICK CART */}
        <button
          onClick={onAddToCart}
          disabled={stock <= 0 || isAdding}
          aria-label="Add to cart"
          className={`absolute bottom-4 right-4 flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold text-white shadow-xl transition-all duration-300 ${
            stock <= 0
              ? "cursor-not-allowed bg-gray-400"
              : "bg-[#17130d] opacity-0 translate-y-3 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#b9975b]"
          }`}
        >
          {isAdding ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Adding
            </>
          ) : (
            <>
              <ShoppingCart size={17} />
              Add
            </>
          )}
        </button>

        {/* MOBILE CART BUTTON */}
        <button
          onClick={onAddToCart}
          disabled={stock <= 0 || isAdding}
          className={`absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-xl md:hidden ${
            stock <= 0
              ? "bg-gray-400"
              : "bg-[#17130d]"
          }`}
        >
          {isAdding ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <ShoppingCart size={18} />
          )}
        </button>
      </div>

      {/* DETAILS */}
      <div className="p-5">
        {/* CATEGORY + BRAND */}
        <div className="mb-2.5 flex items-center justify-between gap-2">
          {categoryName ? (
            <span className="max-w-[65%] truncate rounded-full bg-[#faf6e8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#967400]">
              {categoryName}
            </span>
          ) : (
            <span />
          )}

          {product.brand && (
            <span className="max-w-[40%] truncate text-[10px] font-bold uppercase tracking-wider text-[#9a9184]">
              {product.brand}
            </span>
          )}
        </div>

        {/* PRODUCT NAME */}
        <Link
          href={`/dashboard/products/${product.id}`}
          className="line-clamp-2 text-[17px] font-extrabold leading-6 tracking-tight text-[#17130d] transition duration-300 hover:text-[#a17b00]"
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
          <span className="inline-flex items-center gap-1 rounded-md bg-[#fff6d8] px-2 py-1 text-xs font-bold text-[#846400]">
            <Star
              size={12}
              fill="currentColor"
            />
            {rating.toFixed(1)}
          </span>

          <span className="text-xs text-[#9b9285]">
            {product.reviews_count ?? 0} reviews
          </span>
        </div>

        {/* PRICE */}
        <div className="mt-4 flex items-end gap-2">
          <span className="text-xl font-black tracking-tight text-[#17130d]">
            {formatPrice(price)}
          </span>

          {originalPrice > price && (
            <span className="pb-0.5 text-sm text-[#a39a8e] line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* STOCK */}
        <div className="mt-3 flex items-center justify-between">
          {stock > 0 ? (
            <span className="text-xs font-bold text-emerald-600">
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

          {discount > 0 && (
            <span className="text-[11px] font-bold text-[#a17b00]">
              Save {formatPrice(originalPrice - price)}
            </span>
          )}
        </div>

        {/* ACTIONS */}
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <Link
            href={`/dashboard/products/${product.id}`}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#eadfc9] text-sm font-bold text-[#625b50] transition duration-300 hover:border-[#b9975b] hover:bg-[#fffaf0] hover:text-[#927000]"
          >
            View Product
            <ArrowRight size={15} />
          </Link>

          <button
            onClick={onAddToCart}
            disabled={stock <= 0 || isAdding}
            aria-label="Add product to cart"
            className={`flex h-10 w-11 items-center justify-center rounded-xl transition-all duration-300 ${
              stock <= 0
                ? "cursor-not-allowed bg-[#f0ede7] text-[#aaa298]"
                : "bg-[#17130d] text-white hover:bg-[#b9975b]"
            }`}
          >
            {isAdding ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <ShoppingBag size={17} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| PRODUCT SKELETON
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

        <div className="product-shimmer h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
