"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Filter,
  Heart,
  ImageOff,
  RotateCcw,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  Truck,
  X,
  Zap,
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
};

type SortValue =
  | "featured"
  | "rating"
  | "price-low"
  | "price-high"
  | "discount"
  | "newest";

/* =========================================================
   CATEGORY FALLBACK NAMES
========================================================= */

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

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(value: number | string | null) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;

  const value = imageUrl.trim();

  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
}

function getDiscount(
  price: number | string | null,
  originalPrice: number | string | null
) {
  const current = Number(price ?? 0);
  const original = Number(originalPrice ?? 0);

  if (original <= 0 || current >= original) {
    return 0;
  }

  return Math.round(((original - current) / original) * 100);
}

function getProductDiscount(product: Product) {
  return getDiscount(product.price, product.original_price);
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

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* SEARCH / SORT */

  const [search, setSearch] = useState("");
  const [sort, setSort] =
    useState<SortValue>("featured");

  /* FILTERS */

  const [showFilter, setShowFilter] = useState(false);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [minRating, setMinRating] = useState(0);

  const [stockOnly, setStockOnly] = useState(false);
  const [flashOnly, setFlashOnly] = useState(false);

  /* =======================================================
     LOAD CATEGORY + PRODUCTS
  ======================================================= */

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function loadCategoryProducts() {
      setLoading(true);
      setError("");

      try {
        /* CATEGORY */

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
          if (!cancelled) {
            setCategory(null);
            setProducts([]);
            setError("Category not found.");
          }

          return;
        }

        if (!cancelled) {
          setCategory(categoryData);
        }

        /* PRODUCTS */

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
                is_active
              `
            )
            .eq("category_id", categoryData.id)
            .eq("is_active", true)
            .order("created_at", { ascending: false });

        if (productError) {
          throw productError;
        }

        if (!cancelled) {
          setProducts(productData ?? []);
        }
      } catch (err) {
        console.error("Category products error:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load products."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCategoryProducts();

    return () => {
      cancelled = true;
    };
  }, [slug, supabase]);

  /* =======================================================
     CATEGORY STATS
  ======================================================= */

  const categoryStats = useMemo(() => {
    const total = products.length;

    const inStock = products.filter(
      (product) => Number(product.stock ?? 0) > 0
    ).length;

    const flashSale = products.filter(
      (product) => Boolean(product.is_flash_sale)
    ).length;

    const discounted = products.filter(
      (product) => getProductDiscount(product) > 0
    ).length;

    const ratings = products
      .map((product) => Number(product.rating ?? 0))
      .filter((rating) => rating > 0);

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, value) => sum + value, 0) /
          ratings.length
        : 0;

    return {
      total,
      inStock,
      flashSale,
      discounted,
      averageRating,
    };
  }, [products]);

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const searchValue = search.trim().toLowerCase();

    /* SEARCH */

    if (searchValue) {
      result = result.filter((product) => {
        const nameMatch = product.name
          .toLowerCase()
          .includes(searchValue);

        const brandMatch = product.brand
          ?.toLowerCase()
          .includes(searchValue);

        const shortDescriptionMatch =
          product.short_description
            ?.toLowerCase()
            .includes(searchValue);

        return (
          nameMatch ||
          Boolean(brandMatch) ||
          Boolean(shortDescriptionMatch)
        );
      });
    }

    /* MIN PRICE */

    if (minPrice) {
      const minimum = Number(minPrice);

      if (!Number.isNaN(minimum)) {
        result = result.filter(
          (product) => Number(product.price ?? 0) >= minimum
        );
      }
    }

    /* MAX PRICE */

    if (maxPrice) {
      const maximum = Number(maxPrice);

      if (!Number.isNaN(maximum)) {
        result = result.filter(
          (product) => Number(product.price ?? 0) <= maximum
        );
      }
    }

    /* RATING */

    if (minRating > 0) {
      result = result.filter(
        (product) => Number(product.rating ?? 0) >= minRating
      );
    }

    /* STOCK */

    if (stockOnly) {
      result = result.filter(
        (product) => Number(product.stock ?? 0) > 0
      );
    }

    /* FLASH SALE */

    if (flashOnly) {
      result = result.filter(
        (product) => Boolean(product.is_flash_sale)
      );
    }

    /* SORT */

    if (sort === "featured") {
      result.sort(
        (a, b) =>
          Number(Boolean(b.is_featured)) -
          Number(Boolean(a.is_featured))
      );
    }

    if (sort === "rating") {
      result.sort(
        (a, b) =>
          Number(b.rating ?? 0) -
          Number(a.rating ?? 0)
      );
    }

    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price ?? 0) -
          Number(b.price ?? 0)
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price ?? 0) -
          Number(a.price ?? 0)
      );
    }

    if (sort === "discount") {
      result.sort(
        (a, b) =>
          getProductDiscount(b) -
          getProductDiscount(a)
      );
    }

    return result;
  }, [
    products,
    search,
    sort,
    minPrice,
    maxPrice,
    minRating,
    stockOnly,
    flashOnly,
  ]);

  /* =======================================================
     ACTIVE FILTER COUNT
  ======================================================= */

  const activeFilterCount =
    Number(Boolean(minPrice)) +
    Number(Boolean(maxPrice)) +
    Number(minRating > 0) +
    Number(stockOnly) +
    Number(flashOnly);

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  function resetFilters() {
    setMinPrice("");
    setMaxPrice("");
    setMinRating(0);
    setStockOnly(false);
    setFlashOnly(false);
    setSearch("");
    setSort("featured");
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* ===================================================
          TOP TRUST BAR
      =================================================== */}

      <div className="hidden border-b border-[#eadfc9] bg-[#fffdf9] lg:block">
        <div className="mx-auto flex h-9 max-w-[1500px] items-center justify-between px-10 text-[11px] font-semibold text-gray-500">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Truck size={13} className="text-[#b8872d]" />
              Easy & secure shopping
            </span>

            <span className="flex items-center gap-1.5">
              <RotateCcw size={13} className="text-[#b8872d]" />
              Easy returns
            </span>
          </div>

          <span>
            PrimeCart • Shop smarter, live better
          </span>
        </div>
      </div>

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#eadfc9] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-3 px-5 sm:px-8 lg:px-10">
          {/* LOGO */}

          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#d6b34a] to-[#b8872d] text-lg font-black text-white shadow-[0_6px_18px_rgba(184,135,45,0.22)]">
              P
            </div>

            <div className="hidden sm:block">
              <div className="text-xl font-black tracking-tight">
                Prime
                <span className="text-[#b8872d]">
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
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={`Search in ${
                  category?.name ?? "this category"
                }...`}
                className="h-11 w-full rounded-xl border border-[#eadfc9] bg-[#faf8f3] pl-11 pr-10 text-sm font-medium outline-none transition placeholder:text-gray-400 focus:border-[#c9a227] focus:bg-white focus:ring-4 focus:ring-[#c9a227]/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-[#fff8df] hover:text-[#9a7800]"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* ACTIONS */}

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard/categories"
              className="hidden items-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-[#c9a227]/50 hover:bg-[#fffaf0] hover:text-[#927000] sm:flex"
            >
              <ArrowLeft size={15} />
              Categories
            </Link>

            <Link
              href="/dashboard/products"
              className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-[#d1ad42] to-[#b8872d] px-4 py-2.5 text-sm font-black text-white shadow-[0_6px_18px_rgba(184,135,45,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(184,135,45,0.25)] md:flex"
            >
              All Products
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        {/* BREADCRUMB */}

        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link
            href="/dashboard"
            className="transition hover:text-[#9a7800]"
          >
            Dashboard
          </Link>

          <span className="text-gray-300">/</span>

          <Link
            href="/dashboard/categories"
            className="transition hover:text-[#9a7800]"
          >
            Categories
          </Link>

          <span className="text-gray-300">/</span>

          <span className="font-bold text-gray-900">
            {category?.name ??
              categoryNames[slug] ??
              "Category"}
          </span>
        </div>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative mb-8 overflow-hidden rounded-[30px] border border-[#eadfc9] bg-white shadow-[0_12px_45px_rgba(92,67,20,0.06)]">
          {/* Decorative elements */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#c9a227]/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#f5e7bd]/40 blur-3xl" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                {/* BADGE */}

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d9c27b]/40 bg-[#fffaf0] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#947200]">
                  <Sparkles
                    size={14}
                    className="text-[#c29a25]"
                  />
                  Category Collection
                </div>

                <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                  {category?.name ??
                    categoryNames[slug] ??
                    "Category"}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                  Discover carefully organized products,
                  exclusive offers and everyday essentials
                  from this collection.
                </p>

                {/* STATS */}

                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard
                    icon={<ShoppingCart size={16} />}
                    label="Products"
                    value={
                      loading
                        ? "—"
                        : String(categoryStats.total)
                    }
                  />

                  <StatCard
                    icon={<Check size={16} />}
                    label="In Stock"
                    value={
                      loading
                        ? "—"
                        : String(categoryStats.inStock)
                    }
                  />

                  <StatCard
                    icon={<Tag size={16} />}
                    label="Offers"
                    value={
                      loading
                        ? "—"
                        : String(categoryStats.discounted)
                    }
                  />

                  <StatCard
                    icon={<Star size={16} />}
                    label="Avg Rating"
                    value={
                      loading
                        ? "—"
                        : categoryStats.averageRating
                            ? categoryStats.averageRating.toFixed(
                                1
                              )
                            : "—"
                    }
                  />
                </div>
              </div>

              {/* FLASH SALE SUMMARY */}

              <div className="min-w-[230px] rounded-2xl border border-[#eadfc9] bg-[#fffaf0] p-5">
                <div className="flex items-center gap-2 text-[#967300]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Zap
                      size={17}
                      fill="currentColor"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">
                      Special Offers
                    </p>

                    <p className="mt-0.5 text-lg font-black text-gray-900">
                      {loading
                        ? "Checking..."
                        : `${categoryStats.flashSale} Flash Deals`}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-gray-500">
                  Explore discounted products available
                  in this category.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section className="mb-6 rounded-2xl border border-[#eadfc9] bg-white p-3 shadow-[0_7px_25px_rgba(92,67,20,0.035)] sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilter(true)}
                className="relative flex items-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-[#c9a227] hover:bg-[#fffaf0] hover:text-[#927000]"
              >
                <SlidersHorizontal size={16} />
                Filters

                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c9a227] px-1 text-[10px] font-black text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="hidden items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold text-[#9a7800] transition hover:bg-[#fffaf0] sm:flex"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              )}

              <p className="hidden text-sm text-gray-500 sm:block">
                Showing{" "}
                <span className="font-black text-gray-900">
                  {loading
                    ? "—"
                    : filteredProducts.length}
                </span>{" "}
                products
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-semibold text-gray-400 sm:block">
                Sort by
              </span>

              <div className="relative w-full sm:w-auto">
                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(
                      event.target.value as SortValue
                    )
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-[#eadfc9] bg-[#fffdf9] pl-4 pr-10 text-sm font-bold text-gray-700 outline-none transition focus:border-[#c9a227] focus:ring-4 focus:ring-[#c9a227]/10 sm:w-[190px]"
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

          {/* MOBILE SEARCH */}

          <div className="mt-3 md:hidden">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search products..."
                className="h-11 w-full rounded-xl border border-[#eadfc9] bg-[#faf8f3] pl-11 pr-10 text-sm outline-none focus:border-[#c9a227] focus:bg-white"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-[#fff8df] hover:text-[#927000]"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-[#eadfc9] bg-white"
                >
                  <div className="aspect-square animate-pulse bg-[#f3f1eb]" />

                  <div className="space-y-3 p-5">
                    <div className="h-3 w-20 animate-pulse rounded bg-[#eeeae0]" />

                    <div className="h-5 w-4/5 animate-pulse rounded bg-[#eeeae0]" />

                    <div className="h-4 w-3/5 animate-pulse rounded bg-[#eeeae0]" />

                    <div className="h-6 w-28 animate-pulse rounded bg-[#eeeae0]" />
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="rounded-3xl border border-red-100 bg-white px-6 py-16 text-center shadow-[0_10px_35px_rgba(0,0,0,0.03)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <X size={27} />
            </div>

            <h2 className="text-2xl font-black">
              Something went wrong
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
              {error}
            </p>

            <Link
              href="/dashboard/categories"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d1ad42] to-[#b8872d] px-5 py-3 text-sm font-black text-white shadow-[0_7px_20px_rgba(184,135,45,0.18)] transition hover:-translate-y-0.5"
            >
              <ArrowLeft size={16} />
              Back to Categories
            </Link>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div className="rounded-3xl border border-[#eadfc9] bg-white px-6 py-20 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff8df] text-[#b8872d]">
                {search ||
                activeFilterCount > 0 ? (
                  <Search size={27} />
                ) : (
                  <ShoppingCart size={27} />
                )}
              </div>

              <h2 className="text-2xl font-black">
                No products found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {search ||
                activeFilterCount > 0
                  ? "Try changing your search or filters to discover more products."
                  : "There are currently no active products in this category."}
              </p>

              {(search || activeFilterCount > 0) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d1ad42] to-[#b8872d] px-5 py-3 text-sm font-black text-white shadow-[0_7px_20px_rgba(184,135,45,0.18)] transition hover:-translate-y-0.5"
                >
                  <RotateCcw size={15} />
                  Clear All Filters
                </button>
              )}
            </div>
          )}

        {/* =================================================
            PRODUCTS
        ================================================= */}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (
            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    Explore{" "}
                    <span className="text-[#b8872d]">
                      Products
                    </span>
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Curated products from this category
                  </p>
                </div>

                <span className="rounded-full border border-[#eadfc9] bg-white px-3 py-1.5 text-xs font-bold text-gray-500">
                  {filteredProducts.length} results
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            </section>
          )}
      </div>

      {/* ===================================================
          FILTER DRAWER
      =================================================== */}

      {showFilter && (
        <div className="fixed inset-0 z-[100]">
          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setShowFilter(false)}
            className="absolute inset-0 bg-gray-950/30 backdrop-blur-[2px]"
          />

          {/* DRAWER */}

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[390px] flex-col bg-white shadow-[-15px_0_45px_rgba(0,0,0,0.12)]">
            {/* DRAWER HEADER */}

            <div className="flex items-center justify-between border-b border-[#eadfc9] px-5 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#a17c00]">
                  Refine Products
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Filters
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowFilter(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfc9] text-gray-500 transition hover:bg-[#fffaf0] hover:text-[#927000]"
              >
                <X size={18} />
              </button>
            </div>

            {/* DRAWER BODY */}

            <div className="flex-1 overflow-y-auto p-5">
              {/* PRICE */}

              <FilterSection title="Price Range">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={minPrice}
                    onChange={(
                      event: ChangeEvent<HTMLInputElement>
                    ) =>
                      setMinPrice(
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    inputMode="numeric"
                    placeholder="Min ₹"
                    className="h-11 rounded-xl border border-[#eadfc9] bg-[#faf8f3] px-3 text-sm font-semibold outline-none focus:border-[#c9a227] focus:bg-white"
                  />

                  <input
                    value={maxPrice}
                    onChange={(
                      event: ChangeEvent<HTMLInputElement>
                    ) =>
                      setMaxPrice(
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    inputMode="numeric"
                    placeholder="Max ₹"
                    className="h-11 rounded-xl border border-[#eadfc9] bg-[#faf8f3] px-3 text-sm font-semibold outline-none focus:border-[#c9a227] focus:bg-white"
                  />
                </div>
              </FilterSection>

              {/* RATING */}

              <FilterSection title="Minimum Rating">
                <div className="grid grid-cols-2 gap-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      type="button"
                      key={rating}
                      onClick={() =>
                        setMinRating(
                          minRating === rating ? 0 : rating
                        )
                      }
                      className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                        minRating === rating
                          ? "border-[#c9a227] bg-[#fff8df] text-[#8d6d00]"
                          : "border-[#eadfc9] bg-white text-gray-600 hover:bg-[#fffaf0]"
                      }`}
                    >
                      <Star
                        size={14}
                        fill="currentColor"
                      />
                      {rating}+
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* AVAILABILITY */}

              <FilterSection title="Availability">
                <FilterToggle
                  checked={stockOnly}
                  onChange={setStockOnly}
                  label="In-stock products only"
                  icon={<Check size={15} />}
                />

                <FilterToggle
                  checked={flashOnly}
                  onChange={setFlashOnly}
                  label="Flash sale products"
                  icon={
                    <Zap
                      size={15}
                      fill="currentColor"
                    />
                  }
                />
              </FilterSection>

              {/* SORT */}

              <FilterSection title="Sort By">
                <div className="space-y-2">
                  {[
                    ["featured", "Featured"],
                    ["newest", "Newest"],
                    ["rating", "Top Rated"],
                    ["discount", "Biggest Discount"],
                    ["price-low", "Price: Low to High"],
                    ["price-high", "Price: High to Low"],
                  ].map(([value, label]) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() =>
                        setSort(value as SortValue)
                      }
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition ${
                        sort === value
                          ? "border-[#c9a227] bg-[#fff8df] text-[#8d6d00]"
                          : "border-[#eadfc9] bg-white text-gray-600 hover:bg-[#fffaf0]"
                      }`}
                    >
                      {label}

                      {sort === value && (
                        <Check size={16} />
                      )}
                    </button>
                  ))}
                </div>
              </FilterSection>
            </div>

            {/* DRAWER FOOTER */}

            <div className="border-t border-[#eadfc9] bg-[#fffdf9] p-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex-1 rounded-xl border border-[#eadfc9] bg-white px-4 py-3 text-sm font-black text-gray-700 transition hover:bg-[#fffaf0]"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() => setShowFilter(false)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#d1ad42] to-[#b8872d] px-4 py-3 text-sm font-black text-white shadow-[0_7px_20px_rgba(184,135,45,0.18)]"
                >
                  View{" "}
                  {filteredProducts.length} Products
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf9] p-3.5">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff4cf] text-[#a27c00]">
        {icon}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-0.5 text-lg font-black text-gray-900">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   FILTER SECTION
========================================================= */

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#eadfc9] py-5 first:pt-0 last:border-b-0">
      <h3 className="mb-3 text-sm font-black text-gray-900">
        {title}
      </h3>

      {children}
    </div>
  );
}

/* =========================================================
   FILTER TOGGLE
========================================================= */

function FilterToggle({
  checked,
  onChange,
  label,
  icon,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="mb-2 flex w-full items-center justify-between rounded-xl border border-[#eadfc9] bg-white px-4 py-3 text-left transition hover:bg-[#fffaf0]"
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        {icon}
        {label}
      </span>

      <span
        className={`flex h-6 w-10 items-center rounded-full p-1 transition ${
          checked
            ? "bg-[#c9a227]"
            : "bg-gray-200"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
}: {
  product: Product;
}) {
  const [imageError, setImageError] = useState(false);

  const [wishlist, setWishlist] = useState(false);

  const [addedToCart, setAddedToCart] =
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

  const stock = Number(product.stock ?? 0);

  /* =======================================================
     LOAD WISHLIST STATE
  ======================================================= */

  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        "primecart_wishlist"
      );

      if (!stored) return;

      const wishlistIds: string[] =
        JSON.parse(stored);

      setWishlist(
        wishlistIds.includes(product.id)
      );
    } catch {
      // Ignore malformed localStorage
    }
  }, [product.id]);

  /* =======================================================
     WISHLIST
  ======================================================= */

  function toggleWishlist() {
    try {
      const stored = localStorage.getItem(
        "primecart_wishlist"
      );

      const ids: string[] = stored
        ? JSON.parse(stored)
        : [];

      let updated: string[];

      if (ids.includes(product.id)) {
        updated = ids.filter(
          (id) => id !== product.id
        );

        setWishlist(false);
      } else {
        updated = [...ids, product.id];

        setWishlist(true);
      }

      localStorage.setItem(
        "primecart_wishlist",
        JSON.stringify(updated)
      );
    } catch {
      setWishlist(!wishlist);
    }
  }

  /* =======================================================
     CART
  ======================================================= */

  function addToCart() {
    if (stock <= 0) return;

    try {
      const stored = localStorage.getItem(
        "primecart_cart"
      );

      const cart: Array<{
        id: string;
        quantity: number;
      }> = stored ? JSON.parse(stored) : [];

      const existing = cart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          id: product.id,
          quantity: 1,
        });
      }

      localStorage.setItem(
        "primecart_cart",
        JSON.stringify(cart)
      );

      setAddedToCart(true);

      window.setTimeout(() => {
        setAddedToCart(false);
      }, 1800);
    } catch {
      // Ignore localStorage errors
    }
  }

  return (
    <article className="group overflow-hidden rounded-[26px] border border-[#eadfc9] bg-white shadow-[0_8px_30px_rgba(92,67,20,0.045)] transition duration-300 hover:-translate-y-1 hover:border-[#d8bd72] hover:shadow-[0_18px_45px_rgba(92,67,20,0.10)]">
      {/* =================================================
          IMAGE
      ================================================= */}

      <div className="relative aspect-square overflow-hidden bg-[#f8f6f0]">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-5 transition duration-500 group-hover:scale-[1.04]"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
            <ImageOff size={32} />

            <span className="mt-2 text-xs font-semibold">
              Image unavailable
            </span>
          </div>
        )}

        {/* IMAGE OVERLAY */}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/[0.06] to-transparent opacity-0 transition group-hover:opacity-100" />

        {/* BADGES */}

        <div className="absolute left-4 top-4 flex max-w-[65%] flex-col items-start gap-2">
          {product.is_flash_sale && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff1c2] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#8a6900] shadow-sm">
              <Zap
                size={11}
                fill="currentColor"
              />
              Flash Sale
            </span>
          )}

          {discount > 0 && (
            <span className="rounded-full bg-[#c9a227] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              {discount}% OFF
            </span>
          )}

          {product.is_featured && (
            <span className="rounded-full border border-[#eadfc9] bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#947200] shadow-sm backdrop-blur">
              Featured
            </span>
          )}
        </div>

        {/* WISHLIST */}

        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={
            wishlist
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition ${
            wishlist
              ? "border-red-100 bg-red-50 text-red-500"
              : "border-[#eadfc9] bg-white/95 text-gray-500 hover:border-[#d8bd72] hover:bg-[#fffaf0] hover:text-[#a27c00]"
          }`}
        >
          <Heart
            size={18}
            fill={
              wishlist
                ? "currentColor"
                : "none"
            }
          />
        </button>

        {/* ADD TO CART */}

        <button
          type="button"
          onClick={addToCart}
          disabled={stock <= 0}
          className={`absolute bottom-4 right-4 flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-xs font-black shadow-lg transition duration-300 ${
            stock <= 0
              ? "cursor-not-allowed bg-gray-200 text-gray-400"
              : addedToCart
                ? "bg-emerald-600 text-white"
                : "translate-y-2 bg-gradient-to-r from-[#d1ad42] to-[#b8872d] text-white opacity-0 shadow-[0_8px_22px_rgba(184,135,45,0.25)] group-hover:translate-y-0 group-hover:opacity-100 hover:-translate-y-0.5"
          }`}
        >
          {stock <= 0 ? (
            <>
              <ShoppingCart size={16} />
              Sold Out
            </>
          ) : addedToCart ? (
            <>
              <Check size={16} />
              Added
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              Add to Cart
            </>
          )}
        </button>
      </div>

      {/* =================================================
          PRODUCT INFO
      ================================================= */}

      <div className="p-5">
        {/* BRAND */}

        {product.brand && (
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#a17c00]">
            {product.brand}
          </p>
        )}

        {/* NAME */}

        <Link
          href={`/dashboard/products/${product.id}`}
          className="line-clamp-2 text-[17px] font-extrabold leading-6 tracking-tight text-gray-900 transition hover:text-[#a17c00]"
        >
          {product.name}
        </Link>

        {/* DESCRIPTION */}

        {product.short_description && (
          <p className="mt-2 line-clamp-2 min-h-[40px] text-xs leading-5 text-gray-500">
            {product.short_description}
          </p>
        )}

        {/* RATING */}

        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-[#fff7d9] px-2 py-1 text-xs font-black text-[#856600]">
            <Star
              size={12}
              fill="currentColor"
            />

            {Number(product.rating ?? 0).toFixed(1)}
          </div>

          <span className="text-xs text-gray-400">
            {product.reviews_count ?? 0} reviews
          </span>
        </div>

        {/* PRICE */}

        <div className="mt-4 flex flex-wrap items-end gap-2">
          <span className="text-xl font-black tracking-tight text-gray-950">
            {formatPrice(price)}
          </span>

          {originalPrice > price && (
            <span className="pb-0.5 text-sm font-medium text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}

          {discount > 0 && (
            <span className="pb-0.5 text-xs font-black text-emerald-600">
              Save {discount}%
            </span>
          )}
        </div>

        {/* STOCK */}

        <div className="mt-3">
          {stock > 10 ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              In stock
            </span>
          ) : stock > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              Only {stock} left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Out of stock
            </span>
          )}
        </div>

        {/* VIEW PRODUCT */}

        <Link
          href={`/dashboard/products/${product.id}`}
          className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl border border-[#eadfc9] bg-[#fffdf9] text-sm font-black text-gray-700 transition hover:border-[#c9a227] hover:bg-[#fffaf0] hover:text-[#927000]"
        >
          View Product
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </article>
  );
}
