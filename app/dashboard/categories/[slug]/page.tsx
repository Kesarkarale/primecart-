"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Filter,
  Heart,
  ImageOff,
  Package,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  X,
  Zap,
  Clock3,
  Eye,
  Plus,
  Minus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

/* =========================================================
   TYPES
========================================================= */

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
  created_at?: string;
};

const categoryNames: Record<string, string> = {
  "home-living": "Home & Living",
  mobile: "Mobile",
  appliance: "Appliance",
  footwear: "Footwear",
  watch: "Watch",
  bag: "Bag",
  "toy-baby": "Toy & Baby",
  automotive: "Automotive",
  fashion: "Fashion",
  gaming: "Gaming",
};

const RECENT_STORAGE_KEY = "primecart_recently_viewed";
const CART_STORAGE_KEY = "primecart_cart";

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(value: number | string | null) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function getImageCandidates(imageUrl: string | null) {
  if (!imageUrl?.trim()) return [];

  const value = imageUrl.trim();

  if (/^https?:\/\//i.test(value)) {
    return [value];
  }

  const clean = value.replace(/^\/+/, "");

  return Array.from(
    new Set([
      `/${clean}`,
      `/products/${clean}`,
    ])
  );
}

function getDiscount(product: Product) {
  const price = Number(product.price ?? 0);
  const original = Number(product.original_price ?? 0);

  if (original <= price || original <= 0) return 0;

  return Math.round(((original - price) / original) * 100);
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function CategoryProductsPage() {
  const params = useParams();

  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
        ? params.slug[0]
        : "";

  const supabase = useMemo(() => createClient(), []);

  const [category, setCategory] =
    useState<Category | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [relatedCategories, setRelatedCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Search */
  const [search, setSearch] = useState("");

  /* Sort */
  const [sort, setSort] = useState("featured");

  /* Filters */
  const [showMobileFilter, setShowMobileFilter] =
    useState(false);

  const [inStockOnly, setInStockOnly] =
    useState(false);

  const [flashOnly, setFlashOnly] =
    useState(false);

  const [featuredOnly, setFeaturedOnly] =
    useState(false);

  const [minimumRating, setMinimumRating] =
    useState(0);

  const [selectedBrand, setSelectedBrand] =
    useState("all");

  const [minPrice, setMinPrice] =
    useState(0);

  const [maxPrice, setMaxPrice] =
    useState(100000);

  /* Wishlist */
  const [wishlistIds, setWishlistIds] =
    useState<string[]>([]);

  /* Cart */
  const [cartCount, setCartCount] =
    useState(0);

  /* Quick view */
  const [quickViewProduct, setQuickViewProduct] =
    useState<Product | null>(null);

  /* Toast */
  const [toast, setToast] = useState("");

  /* Recently viewed */
  const [recentlyViewed, setRecentlyViewed] =
    useState<Product[]>([]);

  /* =========================================================
     LOAD CATEGORY + PRODUCTS
  ========================================================= */

  useEffect(() => {
    if (!slug) return;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const { data: categoryData, error: categoryError } =
          await supabase
            .from("categories")
            .select("id, name, slug")
            .eq("slug", slug)
            .maybeSingle();

        if (categoryError) {
          throw categoryError;
        }

        if (!categoryData) {
          setCategory(null);
          setProducts([]);
          setError("Category not found.");
          return;
        }

        setCategory(categoryData);

        const { data: productData, error: productError } =
          await supabase
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
                is_active,
                created_at
              `
            )
            .eq("category_id", categoryData.id)
            .eq("is_active", true)
            .order("created_at", {
              ascending: false,
            });

        if (productError) {
          throw productError;
        }

        setProducts(productData ?? []);

        /* Related categories */
        const { data: categoryList } =
          await supabase
            .from("categories")
            .select("id, name, slug")
            .neq("id", categoryData.id)
            .order("name");

        setRelatedCategories(
          (categoryList ?? []).slice(0, 8)
        );
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load category products."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug, supabase]);

  /* =========================================================
     LOAD WISHLIST
  ========================================================= */

  useEffect(() => {
    async function loadWishlist() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } =
        await supabase
          .from("wishlist")
          .select("product_id")
          .eq("user_id", user.id);

      if (error) {
        console.error(
          "Wishlist loading error:",
          error
        );
        return;
      }

      setWishlistIds(
        (data ?? []).map(
          (item) => item.product_id
        )
      );
    }

    loadWishlist();
  }, [supabase]);

  /* =========================================================
     LOAD CART COUNT
  ========================================================= */

  useEffect(() => {
    function updateCartCount() {
      try {
        const raw =
          localStorage.getItem(
            CART_STORAGE_KEY
          );

        if (!raw) {
          setCartCount(0);
          return;
        }

        const cart = JSON.parse(raw);

        if (!Array.isArray(cart)) {
          setCartCount(0);
          return;
        }

        const count = cart.reduce(
          (
            total: number,
            item: {
              quantity?: number;
            }
          ) =>
            total +
            Number(item.quantity ?? 0),
          0
        );

        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    }

    updateCartCount();

    window.addEventListener(
      "primecart-cart-updated",
      updateCartCount
    );

    window.addEventListener(
      "storage",
      updateCartCount
    );

    return () => {
      window.removeEventListener(
        "primecart-cart-updated",
        updateCartCount
      );

      window.removeEventListener(
        "storage",
        updateCartCount
      );
    };
  }, []);

  /* =========================================================
     LOAD RECENTLY VIEWED
  ========================================================= */

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(
          RECENT_STORAGE_KEY
        );

      if (!raw) return;

      const ids: string[] = JSON.parse(raw);

      if (!Array.isArray(ids)) return;

      const recent = ids
        .map((id) =>
          products.find(
            (product) => product.id === id
          )
        )
        .filter(Boolean) as Product[];

      setRecentlyViewed(recent);
    } catch {
      setRecentlyViewed([]);
    }
  }, [products]);

  /* =========================================================
     BRANDS
  ========================================================= */

  const brands = useMemo(() => {
    const values = products
      .map((product) =>
        product.brand?.trim()
      )
      .filter(Boolean) as string[];

    return Array.from(
      new Set(values)
    ).sort();
  }, [products]);

  /* =========================================================
     FILTERED PRODUCTS
  ========================================================= */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const searchValue =
      search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(searchValue) ||
          product.brand
            ?.toLowerCase()
            .includes(searchValue) ||
          product.short_description
            ?.toLowerCase()
            .includes(searchValue) ||
          product.description
            ?.toLowerCase()
            .includes(searchValue)
      );
    }

    if (inStockOnly) {
      result = result.filter(
        (product) =>
          Number(product.stock ?? 0) > 0
      );
    }

    if (flashOnly) {
      result = result.filter(
        (product) =>
          product.is_flash_sale
      );
    }

    if (featuredOnly) {
      result = result.filter(
        (product) =>
          product.is_featured
      );
    }

    if (minimumRating > 0) {
      result = result.filter(
        (product) =>
          Number(product.rating ?? 0) >=
          minimumRating
      );
    }

    if (selectedBrand !== "all") {
      result = result.filter(
        (product) =>
          product.brand ===
          selectedBrand
      );
    }

    result = result.filter((product) => {
      const price = Number(
        product.price ?? 0
      );

      return (
        price >= minPrice &&
        price <= maxPrice
      );
    });

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
        result.sort(
          (a, b) =>
            getDiscount(b) -
            getDiscount(a)
        );
        break;

      case "newest":
        result.sort(
          (a, b) =>
            new Date(
              b.created_at ?? ""
            ).getTime() -
            new Date(
              a.created_at ?? ""
            ).getTime()
        );
        break;

      default:
        result.sort(
          (a, b) =>
            Number(
              Boolean(b.is_featured)
            ) -
            Number(
              Boolean(a.is_featured)
            )
        );
    }

    return result;
  }, [
    products,
    search,
    sort,
    inStockOnly,
    flashOnly,
    featuredOnly,
    minimumRating,
    selectedBrand,
    minPrice,
    maxPrice,
  ]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    const total = products.length;

    const stock = products.filter(
      (product) =>
        Number(product.stock ?? 0) > 0
    ).length;

    const flash = products.filter(
      (product) =>
        product.is_flash_sale
    ).length;

    const ratings = products
      .map((product) =>
        Number(product.rating ?? 0)
      )
      .filter(
        (rating) => rating > 0
      );

    const avg =
      ratings.length > 0
        ? ratings.reduce(
            (sum, rating) =>
              sum + rating,
            0
          ) / ratings.length
        : 0;

    return {
      total,
      stock,
      flash,
      avg,
    };
  }, [products]);

  /* =========================================================
     FILTER STATE
  ========================================================= */

  const hasFilters =
    search.trim() !== "" ||
    inStockOnly ||
    flashOnly ||
    featuredOnly ||
    minimumRating > 0 ||
    selectedBrand !== "all" ||
    minPrice > 0 ||
    maxPrice < 100000;

  function clearFilters() {
    setSearch("");
    setSort("featured");
    setInStockOnly(false);
    setFlashOnly(false);
    setFeaturedOnly(false);
    setMinimumRating(0);
    setSelectedBrand("all");
    setMinPrice(0);
    setMaxPrice(100000);
  }

  /* =========================================================
     TOAST
  ========================================================= */

  function showToast(message: string) {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2200);
  }

  /* =========================================================
     WISHLIST
  ========================================================= */

  async function toggleWishlist(
    product: Product
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      showToast(
        "Please login to use wishlist"
      );
      return;
    }

    const exists =
      wishlistIds.includes(product.id);

    if (exists) {
      const { error } =
        await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", product.id);

      if (error) {
        console.error(error);
        showToast(
          "Unable to remove from wishlist"
        );
        return;
      }

      setWishlistIds((current) =>
        current.filter(
          (id) => id !== product.id
        )
      );

      showToast(
        "Removed from wishlist"
      );
    } else {
      const { error } =
        await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: product.id,
          });

      if (error) {
        console.error(error);
        showToast(
          "Unable to add to wishlist"
        );
        return;
      }

      setWishlistIds((current) => [
        ...current,
        product.id,
      ]);

      showToast(
        "Added to wishlist ❤️"
      );
    }
  }

  /* =========================================================
     CART
  ========================================================= */

  function addToCart(product: Product) {
    try {
      const raw =
        localStorage.getItem(
          CART_STORAGE_KEY
        );

      const cart = raw
        ? JSON.parse(raw)
        : [];

      if (!Array.isArray(cart)) {
        throw new Error(
          "Invalid cart"
        );
      }

      const existingIndex =
        cart.findIndex(
          (item: {
            product_id?: string;
          }) =>
            item.product_id ===
            product.id
        );

      if (existingIndex >= 0) {
        cart[existingIndex].quantity =
          Number(
            cart[existingIndex]
              .quantity ?? 0
          ) + 1;
      } else {
        cart.push({
          product_id: product.id,
          name: product.name,
          price: Number(
            product.price ?? 0
          ),
          original_price: Number(
            product.original_price ?? 0
          ),
          image_url:
            product.image_url,
          quantity: 1,
          brand: product.brand,
        });
      }

      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      );

      window.dispatchEvent(
        new Event(
          "primecart-cart-updated"
        )
      );

      setCartCount(
        cart.reduce(
          (
            total: number,
            item: {
              quantity?: number;
            }
          ) =>
            total +
            Number(item.quantity ?? 0),
          0
        )
      );

      showToast(
        `${product.name} added to cart`
      );
    } catch (error) {
      console.error(error);
      showToast(
        "Unable to add product to cart"
      );
    }
  }

  /* =========================================================
     RECENTLY VIEWED
  ========================================================= */

  function saveRecentlyViewed(
    product: Product
  ) {
    try {
      const raw =
        localStorage.getItem(
          RECENT_STORAGE_KEY
        );

      const current: string[] = raw
        ? JSON.parse(raw)
        : [];

      const updated = [
        product.id,
        ...current.filter(
          (id) =>
            id !== product.id
        ),
      ].slice(0, 8);

      localStorage.setItem(
        RECENT_STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch {
      /* ignore */
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#c9a227]/10 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-3 px-4 sm:px-8 lg:px-10">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#d8b84c] to-[#b58a16] font-black text-white shadow-sm">
              P
            </div>

            <div className="hidden sm:block">
              <div className="text-xl font-black tracking-tight">
                Prime
                <span className="text-[#b08a00]">
                  Cart
                </span>
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                Shop Smarter
              </div>
            </div>
          </Link>

          {/* SEARCH */}

          <div className="mx-auto hidden max-w-2xl flex-1 md:block">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder={`Search in ${
                  category?.name ??
                  "this category"
                }...`}
                className="h-11 w-full rounded-xl border border-black/[0.07] bg-[#fafafa] pl-11 pr-10 text-sm outline-none transition focus:border-[#c9a227]/50 focus:bg-white focus:ring-4 focus:ring-[#c9a227]/5"
              />

              {search && (
                <button
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#a17c00]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* CART */}

            <Link
              href="/dashboard/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.07] bg-white text-gray-600 transition hover:border-[#c9a227]/30 hover:bg-[#fffaf0] hover:text-[#927000]"
              aria-label="Cart"
            >
              <ShoppingCart
                size={18}
              />

              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c9a227] px-1 text-[10px] font-black text-white">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/categories"
              className="hidden items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#c9a227]/30 hover:bg-[#fffaf0] sm:flex"
            >
              <ArrowLeft size={15} />
              Categories
            </Link>

            <Link
              href="/dashboard/products"
              className="hidden rounded-xl bg-[#c9a227] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#b18b16] md:block"
            >
              All Products
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-8 lg:px-10 lg:py-9">
        {/* BREADCRUMB */}

        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link
            href="/dashboard"
            className="hover:text-[#a17c00]"
          >
            Dashboard
          </Link>

          <span>/</span>

          <Link
            href="/dashboard/categories"
            className="hover:text-[#a17c00]"
          >
            Categories
          </Link>

          <span>/</span>

          <span className="font-semibold text-gray-900">
            {category?.name ??
              categoryNames[slug] ??
              "Category"}
          </span>
        </div>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative mb-8 overflow-hidden rounded-[30px] border border-[#c9a227]/15 bg-white shadow-[0_15px_50px_rgba(0,0,0,0.045)]">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#f8e9a9]/30 blur-3xl" />

          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-[#f5e8bd]/30 blur-3xl" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c9a227]/15 bg-[#fff9e8] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#987500]">
                  <Sparkles size={13} />
                  Premium Collection
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  {category?.name ??
                    categoryNames[slug] ??
                    "Category"}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                  Discover carefully selected
                  products with trusted ratings,
                  great prices and exclusive
                  PrimeCart deals.
                </p>

                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatBox
                    icon={
                      <Package size={16} />
                    }
                    label="Products"
                    value={stats.total}
                  />

                  <StatBox
                    icon={
                      <Check size={16} />
                    }
                    label="In Stock"
                    value={stats.stock}
                  />

                  <StatBox
                    icon={
                      <Zap size={16} />
                    }
                    label="Flash Deals"
                    value={stats.flash}
                  />

                  <StatBox
                    icon={
                      <Star
                        size={16}
                        fill="currentColor"
                      />
                    }
                    label="Avg Rating"
                    value={
                      stats.avg
                        ? stats.avg.toFixed(
                            1
                          )
                        : "—"
                    }
                  />
                </div>
              </div>

              <div className="hidden lg:flex">
                <div className="relative flex h-[220px] w-[270px] items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-[#fff8dc] to-[#f7f1dc]">
                  <div className="absolute h-40 w-40 rounded-full bg-[#d5b544]/20 blur-2xl" />

                  <Sparkles
                    size={90}
                    strokeWidth={1}
                    className="relative text-[#c9a227]/60"
                  />

                  <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/80 bg-white/75 px-4 py-3 text-center backdrop-blur-md">
                    <p className="text-xs font-black uppercase tracking-widest text-[#a17c00]">
                      PrimeCart Picks
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Curated for smarter
                      shopping
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            RELATED CATEGORIES
        ===================================================== */}

        {relatedCategories.length > 0 && (
          <section className="mb-7">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">
                  Explore More
                </h2>

                <p className="text-xs text-gray-500">
                  Browse other collections
                </p>
              </div>

              <Link
                href="/dashboard/categories"
                className="text-xs font-bold text-[#a17c00] hover:text-[#806200]"
              >
                All Categories
              </Link>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {relatedCategories.map(
                (item) => (
                  <Link
                    key={item.id}
                    href={`/dashboard/categories/${item.slug}`}
                    className="shrink-0 rounded-full border border-black/[0.07] bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-[#c9a227]/40 hover:bg-[#fff9e8] hover:text-[#927000]"
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>
          </section>
        )}

        {/* =====================================================
            TOOLBAR
        ===================================================== */}

        <section className="mb-6 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_8px_25px_rgba(0,0,0,0.025)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setShowMobileFilter(true)
                }
                className="flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-[#fffaf0] md:hidden"
              >
                <SlidersHorizontal
                  size={16}
                />
                Filters
              </button>

              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-black text-gray-900">
                  {filteredProducts.length}
                </span>{" "}
                of{" "}
                <span className="font-black text-gray-900">
                  {products.length}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="hidden text-sm font-bold text-[#a17c00] hover:text-[#806200] sm:block"
                >
                  Clear all
                </button>
              )}

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(
                      e.target.value
                    )
                  }
                  className="h-11 appearance-none rounded-xl border border-black/[0.08] bg-white pl-4 pr-10 text-sm font-semibold outline-none focus:border-[#c9a227]/50"
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

          {hasFilters && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-black/[0.05] pt-4">
              {search && (
                <FilterChip
                  label={`Search: ${search}`}
                  onRemove={() =>
                    setSearch("")
                  }
                />
              )}

              {inStockOnly && (
                <FilterChip
                  label="In Stock"
                  onRemove={() =>
                    setInStockOnly(false)
                  }
                />
              )}

              {flashOnly && (
                <FilterChip
                  label="Flash Sale"
                  onRemove={() =>
                    setFlashOnly(false)
                  }
                />
              )}

              {featuredOnly && (
                <FilterChip
                  label="Featured"
                  onRemove={() =>
                    setFeaturedOnly(false)
                  }
                />
              )}

              {minimumRating > 0 && (
                <FilterChip
                  label={`${minimumRating}+ Rating`}
                  onRemove={() =>
                    setMinimumRating(0)
                  }
                />
              )}

              {selectedBrand !==
                "all" && (
                <FilterChip
                  label={selectedBrand}
                  onRemove={() =>
                    setSelectedBrand(
                      "all"
                    )
                  }
                />
              )}

              {minPrice > 0 && (
                <FilterChip
                  label={`From ${formatPrice(
                    minPrice
                  )}`}
                  onRemove={() =>
                    setMinPrice(0)
                  }
                />
              )}

              {maxPrice <
                100000 && (
                <FilterChip
                  label={`Under ${formatPrice(
                    maxPrice
                  )}`}
                  onRemove={() =>
                    setMaxPrice(
                      100000
                    )
                  }
                />
              )}
            </div>
          )}
        </section>

        {/* MOBILE SEARCH */}

        <div className="mb-6 md:hidden">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search products..."
              className="h-12 w-full rounded-xl border border-black/[0.07] bg-white pl-11 pr-10 text-sm outline-none focus:border-[#c9a227]/50"
            />
          </div>
        </div>

        {/* =====================================================
            PRODUCT AREA
        ===================================================== */}

        <div className="grid gap-6 lg:grid-cols-[255px_1fr]">
          {/* FILTER */}

          <aside className="hidden lg:block">
            <FilterPanel
              brands={brands}
              inStockOnly={inStockOnly}
              setInStockOnly={
                setInStockOnly
              }
              flashOnly={flashOnly}
              setFlashOnly={
                setFlashOnly
              }
              featuredOnly={featuredOnly}
              setFeaturedOnly={
                setFeaturedOnly
              }
              minimumRating={
                minimumRating
              }
              setMinimumRating={
                setMinimumRating
              }
              selectedBrand={
                selectedBrand
              }
              setSelectedBrand={
                setSelectedBrand
              }
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              clearFilters={
                clearFilters
              }
            />
          </aside>

          <div>
            {/* LOADING */}

            {loading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({
                  length: 9,
                }).map((_, index) => (
                  <ProductSkeleton
                    key={index}
                  />
                ))}
              </div>
            )}

            {/* ERROR */}

            {!loading && error && (
              <div className="rounded-3xl border border-red-100 bg-white p-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <X size={25} />
                </div>

                <h2 className="text-xl font-black">
                  Something went wrong
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
                  {error}
                </p>

                <Link
                  href="/dashboard/categories"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#c9a227] px-5 py-3 text-sm font-bold text-white hover:bg-[#b18b16]"
                >
                  <ArrowLeft size={16} />
                  Back to Categories
                </Link>
              </div>
            )}

            {/* EMPTY */}

            {!loading &&
              !error &&
              filteredProducts.length ===
                0 && (
                <div className="rounded-3xl border border-black/[0.06] bg-white px-6 py-20 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff8df] text-[#b08a00]">
                    <Search size={27} />
                  </div>

                  <h2 className="text-2xl font-black">
                    No products found
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                    Try another search or
                    remove some filters.
                  </p>

                  <button
                    onClick={
                      clearFilters
                    }
                    className="mt-6 rounded-xl bg-[#c9a227] px-5 py-3 text-sm font-bold text-white hover:bg-[#b18b16]"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

            {/* PRODUCTS */}

            {!loading &&
              !error &&
              filteredProducts.length >
                0 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map(
                    (product) => (
                      <ProductCard
                        key={product.id}
                        product={
                          product
                        }
                        wishlisted={wishlistIds.includes(
                          product.id
                        )}
                        onWishlist={() =>
                          toggleWishlist(
                            product
                          )
                        }
                        onCart={() =>
                          addToCart(
                            product
                          )
                        }
                        onQuickView={() => {
                          saveRecentlyViewed(
                            product
                          );
                          setQuickViewProduct(
                            product
                          );
                        }}
                      />
                    )
                  )}
                </div>
              )}
          </div>
        </div>

        {/* =====================================================
            RECENTLY VIEWED
        ===================================================== */}

        {recentlyViewed.length >
          0 && (
          <section className="mt-14 border-t border-black/[0.06] pt-10">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Clock3
                    size={18}
                    className="text-[#a17c00]"
                  />

                  <h2 className="text-xl font-black">
                    Recently Viewed
                  </h2>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Products you checked recently
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {recentlyViewed
                .filter(
                  (item) =>
                    item.category_id ===
                    category?.id
                )
                .slice(0, 4)
                .map((product) => (
                  <MiniProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
            </div>
          </section>
        )}
      </div>

      {/* =====================================================
          MOBILE FILTER DRAWER
      ===================================================== */}

      {showMobileFilter && (
        <div className="fixed inset-0 z-[100]">
          <button
            onClick={() =>
              setShowMobileFilter(
                false
              )
            }
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            aria-label="Close filters"
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-[#faf8f3] p-5 sm:left-auto sm:top-0 sm:w-[390px] sm:rounded-none">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">
                  Filters
                </h2>

                <p className="text-xs text-gray-500">
                  Refine your products
                </p>
              </div>

              <button
                onClick={() =>
                  setShowMobileFilter(
                    false
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            <FilterPanel
              brands={brands}
              inStockOnly={inStockOnly}
              setInStockOnly={
                setInStockOnly
              }
              flashOnly={flashOnly}
              setFlashOnly={
                setFlashOnly
              }
              featuredOnly={featuredOnly}
              setFeaturedOnly={
                setFeaturedOnly
              }
              minimumRating={
                minimumRating
              }
              setMinimumRating={
                setMinimumRating
              }
              selectedBrand={
                selectedBrand
              }
              setSelectedBrand={
                setSelectedBrand
              }
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              clearFilters={
                clearFilters
              }
            />

            <button
              onClick={() =>
                setShowMobileFilter(
                  false
                )
              }
              className="mt-5 w-full rounded-xl bg-[#c9a227] py-3.5 text-sm font-black text-white"
            >
              Show{" "}
              {filteredProducts.length}{" "}
              Products
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          QUICK VIEW
      ===================================================== */}

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() =>
            setQuickViewProduct(null)
          }
          onCart={() =>
            addToCart(
              quickViewProduct
            )
          }
        />
      )}

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[300] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-[#c9a227]/20 bg-white px-5 py-3.5 text-sm font-bold text-gray-800 shadow-[0_15px_50px_rgba(0,0,0,0.15)]">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff3c4] text-[#a17c00]">
            <Check size={15} />
          </div>

          {toast}
        </div>
      )}
    </main>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  wishlisted,
  onWishlist,
  onCart,
  onQuickView,
}: {
  product: Product;
  wishlisted: boolean;
  onWishlist: () => void;
  onCart: () => void;
  onQuickView: () => void;
}) {
  const [imageIndex, setImageIndex] =
    useState(0);

  const images = getImageCandidates(
    product.image_url
  );

  const image =
    images[imageIndex];

  const price = Number(
    product.price ?? 0
  );

  const originalPrice = Number(
    product.original_price ?? 0
  );

  const stock = Number(
    product.stock ?? 0
  );

  const discount =
    getDiscount(product);

  return (
    <Link
      href={`/dashboard/products/${product.id}`}
      className="group block overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.035)] transition duration-300 hover:-translate-y-1 hover:border-[#c9a227]/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.09)]"
    >
      {/* IMAGE */}

      <div className="relative aspect-square overflow-hidden bg-[#f8f7f3]">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-[1.045]"
            onError={() =>
              setImageIndex(
                (current) =>
                  current + 1
              )
            }
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <ImageOff size={32} />

            <span className="mt-2 text-xs">
              Image unavailable
            </span>
          </div>
        )}

        {/* BADGES */}

        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {product.is_flash_sale && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff1c2] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#8d6d00]">
              <Zap size={11} />
              Flash Sale
            </span>
          )}

          {discount > 0 && (
            <span className="rounded-full bg-[#c9a227] px-3 py-1.5 text-[10px] font-black text-white">
              {discount}% OFF
            </span>
          )}

          {product.is_featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#927000] backdrop-blur">
              <Sparkles size={10} />
              Featured
            </span>
          )}
        </div>

        {/* WISHLIST */}

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onWishlist();
          }}
          aria-label="Wishlist"
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition ${
            wishlisted
              ? "border-red-100 bg-red-50 text-red-500"
              : "border-white/70 bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500"
          }`}
        >
          <Heart
            size={18}
            fill={
              wishlisted
                ? "currentColor"
                : "none"
            }
          />
        </button>

        {/* QUICK VIEW */}

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onQuickView();
          }}
          className="absolute bottom-4 left-4 flex translate-y-3 items-center gap-1.5 rounded-xl border border-white/80 bg-white/95 px-3 py-2 text-xs font-bold text-gray-700 opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#fff8df] hover:text-[#8d6d00]"
        >
          <Eye size={13} />
          Quick View
        </button>

        {/* CART */}

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            if (stock > 0) {
              onCart();
            }
          }}
          disabled={stock <= 0}
          className={`absolute bottom-4 right-4 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full text-white opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 ${
            stock > 0
              ? "bg-[#c9a227] hover:bg-[#b18b16]"
              : "cursor-not-allowed bg-gray-400"
          }`}
          aria-label="Add to cart"
        >
          <ShoppingCart size={17} />
        </button>
      </div>

      {/* INFO */}

      <div className="p-5">
        {product.brand && (
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#a17c00]">
            {product.brand}
          </p>
        )}

        <h2 className="line-clamp-2 text-[17px] font-extrabold leading-6 tracking-tight transition group-hover:text-[#a17c00]">
          {product.name}
        </h2>

        {product.short_description && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
            {product.short_description}
          </p>
        )}

        {/* RATING */}

        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-[#fff7d9] px-2 py-1 text-xs font-bold text-[#856600]">
            <Star
              size={12}
              fill="currentColor"
            />

            {Number(
              product.rating ?? 0
            ).toFixed(1)}
          </div>

          <span className="text-xs text-gray-400">
            ({product.reviews_count ?? 0})
          </span>
        </div>

        {/* PRICE */}

        <div className="mt-4 flex flex-wrap items-end gap-2">
          <span className="text-xl font-black">
            {formatPrice(price)}
          </span>

          {originalPrice > price && (
            <span className="pb-0.5 text-sm text-gray-400 line-through">
              {formatPrice(
                originalPrice
              )}
            </span>
          )}
        </div>

        {/* STOCK */}

        <div className="mt-3 flex items-center justify-between">
          {stock <= 0 ? (
            <span className="text-xs font-bold text-red-500">
              Out of stock
            </span>
          ) : stock <= 5 ? (
            <span className="text-xs font-bold text-orange-500">
              Only {stock} left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              In stock
            </span>
          )}

          <span className="text-xs font-semibold text-gray-400 group-hover:text-[#a17c00]">
            View details
            <ArrowRight
              size={13}
              className="ml-1 inline"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   FILTER PANEL
========================================================= */

function FilterPanel({
  brands,
  inStockOnly,
  setInStockOnly,
  flashOnly,
  setFlashOnly,
  featuredOnly,
  setFeaturedOnly,
  minimumRating,
  setMinimumRating,
  selectedBrand,
  setSelectedBrand,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  clearFilters,
}: {
  brands: string[];
  inStockOnly: boolean;
  setInStockOnly: (
    value: boolean
  ) => void;
  flashOnly: boolean;
  setFlashOnly: (
    value: boolean
  ) => void;
  featuredOnly: boolean;
  setFeaturedOnly: (
    value: boolean
  ) => void;
  minimumRating: number;
  setMinimumRating: (
    value: number
  ) => void;
  selectedBrand: string;
  setSelectedBrand: (
    value: string
  ) => void;
  minPrice: number;
  setMinPrice: (
    value: number
  ) => void;
  maxPrice: number;
  setMaxPrice: (
    value: number
  ) => void;
  clearFilters: () => void;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_8px_25px_rgba(0,0,0,0.025)]">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter
            size={17}
            className="text-[#a17c00]"
          />

          <h3 className="font-black">
            Filters
          </h3>
        </div>

        <button
          onClick={clearFilters}
          className="text-xs font-bold text-[#a17c00]"
        >
          Reset
        </button>
      </div>

      <div className="border-b border-black/[0.05] pb-5">
        <p className="mb-3 text-xs font-black uppercase tracking-wider text-gray-500">
          Availability
        </p>

        <FilterToggle
          label="In Stock"
          checked={inStockOnly}
          onChange={setInStockOnly}
        />

        <FilterToggle
          label="Flash Sale"
          checked={flashOnly}
          onChange={setFlashOnly}
        />

        <FilterToggle
          label="Featured"
          checked={featuredOnly}
          onChange={setFeaturedOnly}
        />
      </div>

      {/* RATING */}

      <div className="border-b border-black/[0.05] py-5">
        <p className="mb-3 text-xs font-black uppercase tracking-wider text-gray-500">
          Rating
        </p>

        {[4, 3, 2].map(
          (rating) => (
            <button
              key={rating}
              onClick={() =>
                setMinimumRating(
                  minimumRating ===
                    rating
                    ? 0
                    : rating
                )
              }
              className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm ${
                minimumRating ===
                rating
                  ? "bg-[#fff8df] text-[#8d6d00]"
                  : "text-gray-600 hover:bg-[#faf8f3]"
              }`}
            >
              <div className="flex text-[#c9a227]">
                {Array.from({
                  length: 5,
                }).map(
                  (_, index) => (
                    <Star
                      key={index}
                      size={12}
                      fill={
                        index < rating
                          ? "currentColor"
                          : "none"
                      }
                    />
                  )
                )}
              </div>

              <span>& up</span>
            </button>
          )
        )}
      </div>

      {/* PRICE */}

      <div className="border-b border-black/[0.05] py-5">
        <p className="mb-3 text-xs font-black uppercase tracking-wider text-gray-500">
          Price Range
        </p>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) =>
              setMinPrice(
                Math.max(
                  0,
                  Number(
                    e.target.value
                  )
                )
              )
            }
            placeholder="Min"
            className="h-10 w-full rounded-lg border border-black/[0.08] px-3 text-xs outline-none focus:border-[#c9a227]"
          />

          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(
                Math.max(
                  0,
                  Number(
                    e.target.value
                  )
                )
              )
            }
            placeholder="Max"
            className="h-10 w-full rounded-lg border border-black/[0.08] px-3 text-xs outline-none focus:border-[#c9a227]"
          />
        </div>

        <div className="mt-3 text-xs font-bold text-[#a17c00]">
          {formatPrice(minPrice)} –{" "}
          {formatPrice(maxPrice)}
        </div>
      </div>

      {/* BRAND */}

      {brands.length > 0 && (
        <div className="pt-5">
          <p className="mb-3 text-xs font-black uppercase tracking-wider text-gray-500">
            Brand
          </p>

          <div className="max-h-52 space-y-1 overflow-y-auto">
            <BrandOption
              label="All Brands"
              selected={
                selectedBrand ===
                "all"
              }
              onClick={() =>
                setSelectedBrand(
                  "all"
                )
              }
            />

            {brands.map(
              (brand) => (
                <BrandOption
                  key={brand}
                  label={brand}
                  selected={
                    selectedBrand ===
                    brand
                  }
                  onClick={() =>
                    setSelectedBrand(
                      brand
                    )
                  }
                />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   FILTER TOGGLE
========================================================= */

function FilterToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (
    value: boolean
  ) => void;
}) {
  return (
    <button
      onClick={() =>
        onChange(!checked)
      }
      className="mb-2 flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm text-gray-600 hover:bg-[#faf8f3]"
    >
      <span>{label}</span>

      <span
        className={`relative h-5 w-9 rounded-full transition ${
          checked
            ? "bg-[#c9a227]"
            : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
            checked
              ? "left-[18px]"
              : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

/* =========================================================
   BRAND OPTION
========================================================= */

function BrandOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
        selected
          ? "bg-[#fff8df] font-bold text-[#8d6d00]"
          : "text-gray-600 hover:bg-[#faf8f3]"
      }`}
    >
      <span>{label}</span>

      {selected && (
        <Check size={15} />
      )}
    </button>
  );
}

/* =========================================================
   FILTER CHIP
========================================================= */

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-2 rounded-full border border-[#c9a227]/20 bg-[#fff9e8] px-3 py-1.5 text-xs font-bold text-[#8f6e00]"
    >
      {label}
      <X size={12} />
    </button>
  );
}

/* =========================================================
   STAT BOX
========================================================= */

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.05] bg-[#fcfbf7] p-3.5">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff4c9] text-[#a17c00]">
        {icon}
      </div>

      <p className="text-lg font-black">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white">
      <div className="aspect-square animate-pulse bg-gray-100" />

      <div className="space-y-3 p-5">
        <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-3/5 animate-pulse rounded bg-gray-100" />
        <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

/* =========================================================
   MINI PRODUCT
========================================================= */

function MiniProductCard({
  product,
}: {
  product: Product;
}) {
  const [imageIndex, setImageIndex] =
    useState(0);

  const images =
    getImageCandidates(
      product.image_url
    );

  return (
    <Link
      href={`/dashboard/products/${product.id}`}
      className="group overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-square bg-[#f8f7f3]">
        {images[imageIndex] ? (
          <img
            src={images[imageIndex]}
            alt={product.name}
            className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105"
            onError={() =>
              setImageIndex(
                (current) =>
                  current + 1
              )
            }
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <ImageOff />
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="line-clamp-2 text-sm font-bold group-hover:text-[#a17c00]">
          {product.name}
        </p>

        <p className="mt-2 text-sm font-black">
          {formatPrice(
            product.price
          )}
        </p>
      </div>
    </Link>
  );
}

/* =========================================================
   QUICK VIEW
========================================================= */

function QuickViewModal({
  product,
  onClose,
  onCart,
}: {
  product: Product;
  onClose: () => void;
  onCart: () => void;
}) {
  const [imageIndex, setImageIndex] =
    useState(0);

  const images =
    getImageCandidates(
      product.image_url
    );

  const price = Number(
    product.price ?? 0
  );

  const original = Number(
    product.original_price ?? 0
  );

  const discount =
    getDiscount(product);

  const stock = Number(
    product.stock ?? 0
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        aria-label="Close"
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.06] bg-white shadow-sm"
        >
          <X size={18} />
        </button>

        <div className="grid md:grid-cols-2">
          {/* IMAGE */}

          <div className="flex min-h-[350px] items-center justify-center bg-[#f8f7f3] p-8 md:min-h-[520px]">
            {images[imageIndex] ? (
              <img
                src={images[imageIndex]}
                alt={product.name}
                className="max-h-[450px] w-full object-contain"
                onError={() =>
                  setImageIndex(
                    (current) =>
                      current + 1
                  )
                }
              />
            ) : (
              <ImageOff
                size={45}
                className="text-gray-300"
              />
            )}
          </div>

          {/* INFO */}

          <div className="flex flex-col justify-center p-7 sm:p-9">
            {product.brand && (
              <p className="text-xs font-black uppercase tracking-[0.15em] text-[#a17c00]">
                {product.brand}
              </p>
            )}

            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              {product.name}
            </h2>

            <div className="mt-4 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-md bg-[#fff7d9] px-2.5 py-1.5 text-xs font-bold text-[#856600]">
                <Star
                  size={13}
                  fill="currentColor"
                />

                {Number(
                  product.rating ?? 0
                ).toFixed(1)}
              </span>

              <span className="text-sm text-gray-400">
                {product.reviews_count ??
                  0}{" "}
                reviews
              </span>
            </div>

            <p className="mt-5 text-sm leading-6 text-gray-500">
              {product.short_description ||
                product.description ||
                "Premium quality product from PrimeCart."}
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-black">
                {formatPrice(price)}
              </span>

              {original > price && (
                <>
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(
                      original
                    )}
                  </span>

                  <span className="rounded-full bg-[#fff1c2] px-2.5 py-1 text-xs font-black text-[#8d6d00]">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <div className="mt-5">
              {stock <= 0 ? (
                <span className="font-bold text-red-500">
                  Out of stock
                </span>
              ) : stock <= 5 ? (
                <span className="font-bold text-orange-500">
                  Only {stock} left
                </span>
              ) : (
                <span className="font-bold text-emerald-600">
                  In stock
                </span>
              )}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                onClick={onCart}
                disabled={stock <= 0}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#c9a227] px-5 py-3.5 text-sm font-black text-white hover:bg-[#b18b16] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <ShoppingCart
                  size={17}
                />
                Add to Cart
              </button>

              <Link
                href={`/dashboard/products/${product.id}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#c9a227]/30 bg-[#fffaf0] px-5 py-3.5 text-sm font-black text-[#8d6d00] hover:bg-[#fff5d4]"
              >
                View Product
                <ArrowRight
                  size={16}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
