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
  Truck,
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

type SortValue =
  | "featured"
  | "rating"
  | "price-low"
  | "price-high"
  | "discount"
  | "newest";

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

function formatPrice(value: number | string | null) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/* -------------------------------------------------------
   IMAGE HELPERS
------------------------------------------------------- */

function normalizeImage(value: string | null | undefined) {
  if (!value) return null;

  const image = value.trim();

  if (!image) return null;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return image;
  }

  return `/${image}`;
}

function getImageCandidates(value: string | null | undefined) {
  if (!value) return [];

  const image = value.trim();

  if (!image) return [];

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return [image];
  }

  const clean = image.replace(/^\/+/, "");

  const candidates = [
    `/${clean}`,
    `/products/${clean}`,
    `/images/${clean}`,
    `/product-images/${clean}`,
  ];

  return [...new Set(candidates)];
}

/* -------------------------------------------------------
   PRODUCT HELPERS
------------------------------------------------------- */

function getDiscount(product: Product) {
  const price = Number(product.price ?? 0);
  const original = Number(product.original_price ?? 0);

  if (original <= 0 || price <= 0 || original <= price) {
    return 0;
  }

  return Math.round(((original - price) / original) * 100);
}

function getStockLabel(stock: number | null) {
  const value = Number(stock ?? 0);

  if (value <= 0) {
    return {
      label: "Out of stock",
      className: "text-red-500",
    };
  }

  if (value <= 5) {
    return {
      label: `Only ${value} left`,
      className: "text-orange-600",
    };
  }

  return {
    label: "In stock",
    className: "text-emerald-600",
  };
}

export default function CategoryProductsPage() {
  const params = useParams();

  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
        ? params.slug[0]
        : "";

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("featured");

  const [showFilter, setShowFilter] = useState(false);
  const [showQuickView, setShowQuickView] = useState<Product | null>(null);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [ratingFilter, setRatingFilter] = useState("0");
  const [stockOnly, setStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function loadCategoryProducts() {
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
          if (!cancelled) {
            setCategory(null);
            setProducts([]);
            setError("Category not found.");
            setLoading(false);
          }

          return;
        }

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
            .order("created_at", { ascending: false });

        if (productError) {
          throw productError;
        }

        if (!cancelled) {
          setCategory(categoryData);
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

  const categoryStats = useMemo(() => {
    const total = products.length;

    const inStock = products.filter(
      (product) => Number(product.stock ?? 0) > 0
    ).length;

    const flashSale = products.filter(
      (product) => Boolean(product.is_flash_sale)
    ).length;

    const discounted = products.filter(
      (product) => getDiscount(product) > 0
    ).length;

    const averageRating =
      total > 0
        ? products.reduce(
            (sum, product) => sum + Number(product.rating ?? 0),
            0
          ) / total
        : 0;

    return {
      total,
      inStock,
      flashSale,
      discounted,
      averageRating,
    };
  }, [products]);

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
            .includes(searchValue)
        );
      });
    }

    const min = Number(minPrice);
    const max = Number(maxPrice);

    if (minPrice && !Number.isNaN(min)) {
      result = result.filter(
        (product) => Number(product.price ?? 0) >= min
      );
    }

    if (maxPrice && !Number.isNaN(max)) {
      result = result.filter(
        (product) => Number(product.price ?? 0) <= max
      );
    }

    if (ratingFilter !== "0") {
      const minimumRating = Number(ratingFilter);

      result = result.filter(
        (product) =>
          Number(product.rating ?? 0) >= minimumRating
      );
    }

    if (stockOnly) {
      result = result.filter(
        (product) => Number(product.stock ?? 0) > 0
      );
    }

    if (discountOnly) {
      result = result.filter(
        (product) => getDiscount(product) > 0
      );
    }

    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price ?? 0) - Number(b.price ?? 0)
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price ?? 0) - Number(a.price ?? 0)
      );
    }

    if (sort === "rating") {
      result.sort(
        (a, b) =>
          Number(b.rating ?? 0) - Number(a.rating ?? 0)
      );
    }

    if (sort === "discount") {
      result.sort(
        (a, b) =>
          getDiscount(b) - getDiscount(a)
      );
    }

    if (sort === "featured") {
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
    sort,
    minPrice,
    maxPrice,
    ratingFilter,
    stockOnly,
    discountOnly,
  ]);

  const activeFilters =
    Number(Boolean(minPrice)) +
    Number(Boolean(maxPrice)) +
    Number(ratingFilter !== "0") +
    Number(stockOnly) +
    Number(discountOnly);

  function clearFilters() {
    setMinPrice("");
    setMaxPrice("");
    setRatingFilter("0");
    setStockOnly(false);
    setDiscountOnly(false);
    setSearch("");
    setSort("featured");
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* TOP STRIP */}
      <div className="hidden border-b border-[#eadfc9] bg-[#fffaf0] sm:block">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-2 text-[11px] font-semibold text-[#876a12] sm:px-8 lg:px-10">
          <span>Free shipping on eligible orders</span>

          <div className="flex items-center gap-5">
            <span>Easy Returns</span>
            <span>Secure Shopping</span>
            <span>PrimeCart Promise</span>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#eadfc9] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-4 px-5 sm:px-8 lg:px-10">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#d6b34a] to-[#b8872d] font-black text-white shadow-[0_5px_15px_rgba(184,135,45,0.2)]">
              P
            </div>

            <div className="hidden sm:block">
              <div className="text-xl font-black tracking-tight">
                Prime
                <span className="text-[#b8872d]">Cart</span>
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search in ${
                  category?.name ??
                  categoryNames[slug] ??
                  "this category"
                }...`}
                className="h-11 w-full rounded-xl border border-[#eadfc9] bg-[#faf9f5] pl-11 pr-10 text-sm font-medium outline-none transition focus:border-[#c9a227] focus:bg-white focus:ring-4 focus:ring-[#c9a227]/10"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-[#fff8df] hover:text-[#987500]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard/categories"
              className="hidden items-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#c9a227] hover:bg-[#fffaf0] hover:text-[#8d6d00] sm:flex"
            >
              <ArrowLeft size={15} />
              Categories
            </Link>

            <Link
              href="/dashboard/products"
              className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-[#d1aa38] to-[#b8872d] px-4 py-2.5 text-sm font-bold text-white shadow-[0_7px_18px_rgba(184,135,45,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(184,135,45,0.25)] md:flex"
            >
              All Products
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        {/* BREADCRUMB */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link
            href="/dashboard"
            className="transition hover:text-[#a17c00]"
          >
            Dashboard
          </Link>

          <span className="text-gray-300">/</span>

          <Link
            href="/dashboard/categories"
            className="transition hover:text-[#a17c00]"
          >
            Categories
          </Link>

          <span className="text-gray-300">/</span>

          <span className="font-semibold text-gray-900">
            {category?.name ??
              categoryNames[slug] ??
              "Category"}
          </span>
        </div>

        {/* HERO */}
        <section className="relative mb-7 overflow-hidden rounded-[30px] border border-[#eadfc9] bg-white shadow-[0_12px_45px_rgba(80,60,20,0.05)]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#d5b04a]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#d5b04a]/10 blur-3xl" />

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ead9a6] bg-[#fffaf0] px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#927000]">
                <Sparkles size={13} />
                PrimeCart Collection
              </div>

              <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Shop{" "}
                <span className="text-[#b8872d]">
                  {category?.name ??
                    categoryNames[slug] ??
                    "Category"}
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
                Explore carefully selected products, exclusive
                deals and everyday essentials from this category.
              </p>

              {/* STATS */}
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatBox
                  icon={<Package size={16} />}
                  value={categoryStats.total}
                  label="Products"
                />

                <StatBox
                  icon={<Check size={16} />}
                  value={categoryStats.inStock}
                  label="In Stock"
                />

                <StatBox
                  icon={<Zap size={16} />}
                  value={categoryStats.flashSale}
                  label="Flash Deals"
                />

                <StatBox
                  icon={<Star size={16} />}
                  value={
                    categoryStats.averageRating > 0
                      ? categoryStats.averageRating.toFixed(1)
                      : "—"
                  }
                  label="Avg Rating"
                />
              </div>
            </div>

            <div className="hidden items-center justify-center lg:flex">
              <div className="flex h-36 w-36 items-center justify-center rounded-[32px] border border-[#eadfc9] bg-[#fffaf0] shadow-inner">
                <Tag
                  size={54}
                  strokeWidth={1.2}
                  className="text-[#c19a2e]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* MOBILE SEARCH */}
        <div className="mb-5 md:hidden">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="h-12 w-full rounded-xl border border-[#eadfc9] bg-white pl-11 pr-10 text-sm outline-none focus:border-[#c9a227] focus:ring-4 focus:ring-[#c9a227]/10"
            />
          </div>
        </div>

        {/* TOOLBAR */}
        <section className="mb-6 rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-[0_7px_25px_rgba(80,60,20,0.035)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">
                {loading
                  ? "Finding products..."
                  : `${filteredProducts.length} products found`}
              </p>

              {activeFilters > 0 && (
                <p className="mt-1 text-xs text-[#9a7800]">
                  {activeFilters} filter
                  {activeFilters > 1 ? "s" : ""} active
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowFilter(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-[#c9a227] hover:bg-[#fffaf0] hover:text-[#8d6d00]"
              >
                <SlidersHorizontal size={16} />
                Filters

                {activeFilters > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c9a227] px-1.5 text-[10px] font-black text-white">
                    {activeFilters}
                  </span>
                )}
              </button>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(e.target.value as SortValue)
                  }
                  className="h-11 appearance-none rounded-xl border border-[#eadfc9] bg-white pl-4 pr-10 text-sm font-bold outline-none transition focus:border-[#c9a227] focus:ring-4 focus:ring-[#c9a227]/10"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Top Rated</option>
                  <option value="discount">Biggest Discount</option>
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

          {/* FILTER CHIPS */}
          {activeFilters > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#f0eadc] pt-4">
              {minPrice && (
                <FilterChip
                  label={`Min ₹${minPrice}`}
                  onRemove={() => setMinPrice("")}
                />
              )}

              {maxPrice && (
                <FilterChip
                  label={`Max ₹${maxPrice}`}
                  onRemove={() => setMaxPrice("")}
                />
              )}

              {ratingFilter !== "0" && (
                <FilterChip
                  label={`${ratingFilter}★ & above`}
                  onRemove={() => setRatingFilter("0")}
                />
              )}

              {stockOnly && (
                <FilterChip
                  label="In stock"
                  onRemove={() => setStockOnly(false)}
                />
              )}

              {discountOnly && (
                <FilterChip
                  label="Discounted"
                  onRemove={() => setDiscountOnly(false)}
                />
              )}

              <button
                onClick={clearFilters}
                className="ml-1 text-xs font-bold text-[#9a7800] hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </section>

        {/* MAIN AREA */}
        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
          {/* DESKTOP FILTER */}
          <aside className="hidden lg:block">
            <FilterPanel
              minPrice={minPrice}
              maxPrice={maxPrice}
              ratingFilter={ratingFilter}
              stockOnly={stockOnly}
              discountOnly={discountOnly}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              setRatingFilter={setRatingFilter}
              setStockOnly={setStockOnly}
              setDiscountOnly={setDiscountOnly}
              clearFilters={clearFilters}
            />
          </aside>

          <div>
            {/* LOADING */}
            {loading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            )}

            {/* ERROR */}
            {!loading && error && (
              <div className="rounded-[28px] border border-red-100 bg-white p-10 text-center shadow-[0_10px_35px_rgba(0,0,0,0.03)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <X size={27} />
                </div>

                <h2 className="text-xl font-black">
                  Something went wrong
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
                  {error}
                </p>

                <Link
                  href="/dashboard/categories"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d1aa38] to-[#b8872d] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"
                >
                  <ArrowLeft size={16} />
                  Back to Categories
                </Link>
              </div>
            )}

            {/* EMPTY */}
            {!loading &&
              !error &&
              filteredProducts.length === 0 && (
                <div className="rounded-[28px] border border-[#eadfc9] bg-white px-6 py-16 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff8df] text-[#b8872d]">
                    {search || activeFilters > 0 ? (
                      <Search size={27} />
                    ) : (
                      <Package size={27} />
                    )}
                  </div>

                  <h2 className="text-2xl font-black">
                    No products found
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                    {search || activeFilters > 0
                      ? "Try changing your search or filters to discover more products."
                      : "There are currently no active products in this category."}
                  </p>

                  {(search || activeFilters > 0) && (
                    <button
                      onClick={clearFilters}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d1aa38] to-[#b8872d] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"
                    >
                      Clear Filters
                      <X size={15} />
                    </button>
                  )}
                </div>
              )}

            {/* PRODUCTS */}
            {!loading &&
              !error &&
              filteredProducts.length > 0 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={() =>
                        setShowQuickView(product)
                      }
                    />
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {showFilter && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            aria-label="Close filters"
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setShowFilter(false)}
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-[30px] border-t border-[#eadfc9] bg-[#faf8f3] p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-lg font-black">
                  Filters
                </p>

                <p className="text-xs text-gray-500">
                  Refine your category results
                </p>
              </div>

              <button
                onClick={() => setShowFilter(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfc9] bg-white text-gray-500"
              >
                <X size={17} />
              </button>
            </div>

            <FilterPanel
              minPrice={minPrice}
              maxPrice={maxPrice}
              ratingFilter={ratingFilter}
              stockOnly={stockOnly}
              discountOnly={discountOnly}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              setRatingFilter={setRatingFilter}
              setStockOnly={setStockOnly}
              setDiscountOnly={setDiscountOnly}
              clearFilters={clearFilters}
            />

            <button
              onClick={() => setShowFilter(false)}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#d1aa38] to-[#b8872d] text-sm font-black text-white shadow-[0_8px_20px_rgba(184,135,45,0.2)]"
            >
              Show {filteredProducts.length} Products
            </button>
          </div>
        </div>
      )}

      {/* QUICK VIEW */}
      {showQuickView && (
        <QuickView
          product={showQuickView}
          onClose={() => setShowQuickView(null)}
        />
      )}
    </main>
  );
}

/* -------------------------------------------------------
   STAT BOX
------------------------------------------------------- */

function StatBox({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-3.5">
      <div className="mb-2 flex items-center gap-2 text-[#b8872d]">
        {icon}
        <span className="text-lg font-black text-gray-900">
          {value}
        </span>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------
   FILTER PANEL
------------------------------------------------------- */

function FilterPanel({
  minPrice,
  maxPrice,
  ratingFilter,
  stockOnly,
  discountOnly,
  setMinPrice,
  setMaxPrice,
  setRatingFilter,
  setStockOnly,
  setDiscountOnly,
  clearFilters,
}: {
  minPrice: string;
  maxPrice: string;
  ratingFilter: string;
  stockOnly: boolean;
  discountOnly: boolean;
  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;
  setRatingFilter: (value: string) => void;
  setStockOnly: (value: boolean) => void;
  setDiscountOnly: (value: boolean) => void;
  clearFilters: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-[#eadfc9] bg-white p-5 shadow-[0_8px_28px_rgba(80,60,20,0.035)]">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={17} className="text-[#b8872d]" />
          <h3 className="font-black">Filters</h3>
        </div>

        <button
          onClick={clearFilters}
          className="text-xs font-bold text-[#9a7800] hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {/* PRICE */}
        <div>
          <p className="mb-3 text-sm font-bold">
            Price Range
          </p>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              className="h-10 w-full rounded-xl border border-[#eadfc9] bg-[#faf9f5] px-3 text-sm outline-none focus:border-[#c9a227]"
            />

            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              className="h-10 w-full rounded-xl border border-[#eadfc9] bg-[#faf9f5] px-3 text-sm outline-none focus:border-[#c9a227]"
            />
          </div>
        </div>

        {/* RATING */}
        <div>
          <p className="mb-3 text-sm font-bold">
            Customer Rating
          </p>

          <div className="space-y-2">
            {["4", "3", "2"].map((value) => (
              <button
                key={value}
                onClick={() =>
                  setRatingFilter(
                    ratingFilter === value ? "0" : value
                  )
                }
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition ${
                  ratingFilter === value
                    ? "border-[#c9a227] bg-[#fff8df] text-[#8d6d00]"
                    : "border-[#eadfc9] bg-white text-gray-600 hover:bg-[#fffaf0]"
                }`}
              >
                <span className="flex items-center gap-2">
                  {value}★ & above
                </span>

                {ratingFilter === value && (
                  <Check size={15} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* AVAILABILITY */}
        <div>
          <p className="mb-3 text-sm font-bold">
            Availability
          </p>

          <button
            onClick={() => setStockOnly(!stockOnly)}
            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition ${
              stockOnly
                ? "border-[#c9a227] bg-[#fff8df] text-[#8d6d00]"
                : "border-[#eadfc9] bg-white text-gray-600"
            }`}
          >
            <span className="flex items-center gap-2">
              <Truck size={15} />
              In stock only
            </span>

            {stockOnly && <Check size={15} />}
          </button>
        </div>

        {/* DEALS */}
        <div>
          <p className="mb-3 text-sm font-bold">
            Offers
          </p>

          <button
            onClick={() =>
              setDiscountOnly(!discountOnly)
            }
            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition ${
              discountOnly
                ? "border-[#c9a227] bg-[#fff8df] text-[#8d6d00]"
                : "border-[#eadfc9] bg-white text-gray-600"
            }`}
          >
            <span className="flex items-center gap-2">
              <Tag size={15} />
              Discounted products
            </span>

            {discountOnly && <Check size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   FILTER CHIP
------------------------------------------------------- */

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
      className="inline-flex items-center gap-1.5 rounded-full border border-[#ead9a6] bg-[#fffaf0] px-3 py-1.5 text-xs font-bold text-[#927000]"
    >
      {label}
      <X size={12} />
    </button>
  );
}

/* -------------------------------------------------------
   PRODUCT CARD
------------------------------------------------------- */

function ProductCard({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView: () => void;
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const [wishlist, setWishlist] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  const candidates = getImageCandidates(
    product.image_url
  );

  const currentImage =
    candidates[imageIndex] ?? null;

  const price = Number(product.price ?? 0);
  const originalPrice = Number(
    product.original_price ?? 0
  );

  const discount = getDiscount(product);
  const stock = getStockLabel(product.stock);

  function handleImageError() {
    if (imageIndex < candidates.length - 1) {
      setImageIndex((current) => current + 1);
    } else {
      setImageIndex(candidates.length);
    }
  }

  return (
    <article className="group overflow-hidden rounded-[26px] border border-[#eadfc9] bg-white shadow-[0_8px_30px_rgba(80,60,20,0.045)] transition duration-300 hover:-translate-y-1.5 hover:border-[#ddc57e] hover:shadow-[0_20px_50px_rgba(80,60,20,0.11)]">
      {/* IMAGE */}
      <div className="relative aspect-square overflow-hidden bg-[#f9f7f1]">
        {currentImage ? (
          <img
            src={normalizeImage(currentImage) ?? currentImage}
            alt={product.name}
            className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-[1.04]"
            onError={handleImageError}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
            <ImageOff size={34} strokeWidth={1.5} />
            <span className="mt-2 text-xs font-semibold">
              Image unavailable
            </span>

            <span className="mt-1 max-w-[80%] truncate text-[10px] text-gray-300">
              {product.image_url ?? "No image"}
            </span>
          </div>
        )}

        {/* IMAGE GRADIENT */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/[0.05] to-transparent" />

        {/* BADGES */}
        <div className="absolute left-4 top-4 flex max-w-[70%] flex-col items-start gap-2">
          {product.is_flash_sale && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0d4] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#a45c00] shadow-sm">
              <Zap size={11} fill="currentColor" />
              Flash Sale
            </span>
          )}

          {discount > 0 && (
            <span className="rounded-full bg-[#c9a227] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* WISHLIST */}
        <button
          onClick={() => setWishlist(!wishlist)}
          aria-label="Wishlist"
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition ${
            wishlist
              ? "border-red-100 bg-red-50 text-red-500"
              : "border-white/80 bg-white/90 text-gray-600 hover:border-[#ead9a6] hover:bg-[#fffaf0] hover:text-red-500"
          }`}
        >
          <Heart
            size={18}
            fill={wishlist ? "currentColor" : "none"}
          />
        </button>

        {/* QUICK VIEW */}
        <button
          onClick={onQuickView}
          className="absolute bottom-4 left-4 translate-y-3 rounded-xl border border-[#eadfc9] bg-white/95 px-3.5 py-2 text-xs font-bold text-gray-700 opacity-0 shadow-sm backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#fffaf0] hover:text-[#8d6d00]"
        >
          Quick View
        </button>

        {/* CART */}
        <button
          onClick={() => setCartAdded(true)}
          disabled={Number(product.stock ?? 0) <= 0}
          aria-label="Add to cart"
          className={`absolute bottom-4 right-4 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full shadow-lg transition duration-300 group-hover:translate-y-0 ${
            Number(product.stock ?? 0) <= 0
              ? "cursor-not-allowed bg-gray-200 text-gray-400"
              : cartAdded
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-[#d1aa38] to-[#b8872d] text-white hover:scale-105"
          }`}
        >
          {cartAdded ? (
            <Check size={17} />
          ) : (
            <ShoppingCart size={17} />
          )}
        </button>
      </div>

      {/* INFO */}
      <div className="p-5">
        {product.brand && (
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#a17c00]">
            {product.brand}
          </p>
        )}

        <Link
          href={`/dashboard/products/${product.id}`}
          className="line-clamp-2 text-[17px] font-extrabold leading-6 tracking-tight transition hover:text-[#a17c00]"
        >
          {product.name}
        </Link>

        {product.short_description && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
            {product.short_description}
          </p>
        )}

        {/* RATING */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-[#fff7d9] px-2 py-1 text-xs font-bold text-[#856600]">
            <Star size={12} fill="currentColor" />
            {Number(product.rating ?? 0).toFixed(1)}
          </div>

          <span className="text-xs text-gray-400">
            {product.reviews_count ?? 0} reviews
          </span>
        </div>

        {/* PRICE */}
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <span className="text-xl font-black">
            {formatPrice(price)}
          </span>

          {originalPrice > price && (
            <span className="pb-0.5 text-sm text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}

          {discount > 0 && (
            <span className="pb-0.5 text-xs font-black text-emerald-600">
              Save {formatPrice(originalPrice - price)}
            </span>
          )}
        </div>

        {/* STOCK */}
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`text-xs font-bold ${stock.className}`}
          >
            {stock.label}
          </span>

          {product.is_featured && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#a17c00]">
              <Sparkles size={11} />
              Featured
            </span>
          )}
        </div>

        {/* VIEW */}
        <Link
          href={`/dashboard/products/${product.id}`}
          className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border border-[#eadfc9] text-sm font-bold text-gray-700 transition hover:border-[#c9a227] hover:bg-[#fffaf0] hover:text-[#927000]"
        >
          View Product
          <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}

/* -------------------------------------------------------
   QUICK VIEW
------------------------------------------------------- */

function QuickView({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [imageIndex, setImageIndex] = useState(0);

  const candidates = getImageCandidates(
    product.image_url
  );

  const image =
    candidates[imageIndex] ?? null;

  const price = Number(product.price ?? 0);
  const original = Number(
    product.original_price ?? 0
  );

  const discount = getDiscount(product);

  function handleImageError() {
    if (imageIndex < candidates.length - 1) {
      setImageIndex((current) => current + 1);
    } else {
      setImageIndex(candidates.length);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        aria-label="Close quick view"
        onClick={onClose}
        className="absolute inset-0 bg-black/25 backdrop-blur-sm"
      />

      <div className="relative z-10 grid max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[30px] border border-[#eadfc9] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.2)] md:grid-cols-2">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfc9] bg-white text-gray-500 shadow-sm transition hover:bg-[#fffaf0] hover:text-[#8d6d00]"
        >
          <X size={18} />
        </button>

        {/* IMAGE */}
        <div className="flex min-h-[330px] items-center justify-center bg-[#f9f7f1] p-8 md:min-h-[520px]">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="max-h-[450px] w-full object-contain"
              onError={handleImageError}
            />
          ) : (
            <div className="text-center text-gray-400">
              <ImageOff
                size={40}
                className="mx-auto"
              />
              <p className="mt-2 text-sm">
                Image unavailable
              </p>
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="overflow-y-auto p-7 sm:p-9">
          {product.is_flash_sale && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#fff0d4] px-3 py-1.5 text-xs font-black text-[#a45c00]">
              <Zap size={13} fill="currentColor" />
              Flash Sale
            </div>
          )}

          {product.brand && (
            <p className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-[#a17c00]">
              {product.brand}
            </p>
          )}

          <h2 className="text-2xl font-black leading-tight sm:text-3xl">
            {product.name}
          </h2>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md bg-[#fff7d9] px-2 py-1 text-xs font-bold text-[#856600]">
              <Star size={12} fill="currentColor" />
              {Number(product.rating ?? 0).toFixed(1)}
            </div>

            <span className="text-xs text-gray-400">
              {product.reviews_count ?? 0} reviews
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <span className="text-3xl font-black">
              {formatPrice(price)}
            </span>

            {original > price && (
              <>
                <span className="text-base text-gray-400 line-through">
                  {formatPrice(original)}
                </span>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-600">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {product.short_description && (
            <p className="mt-5 text-sm leading-7 text-gray-500">
              {product.short_description}
            </p>
          )}

          {product.description && (
            <p className="mt-3 line-clamp-5 text-sm leading-7 text-gray-500">
              {product.description}
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-3">
              <Package
                size={17}
                className="mb-2 text-[#b8872d]"
              />
              <p className="text-xs text-gray-400">
                Availability
              </p>
              <p className="mt-1 text-sm font-bold">
                {Number(product.stock ?? 0) > 0
                  ? "In Stock"
                  : "Out of Stock"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-3">
              <Truck
                size={17}
                className="mb-2 text-[#b8872d]"
              />
              <p className="text-xs text-gray-400">
                Delivery
              </p>
              <p className="mt-1 text-sm font-bold">
                Easy Delivery
              </p>
            </div>
          </div>

          <Link
            href={`/dashboard/products/${product.id}`}
            onClick={onClose}
            className="mt-7 flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d1aa38] to-[#b8872d] text-sm font-black text-white shadow-[0_8px_20px_rgba(184,135,45,0.2)] transition hover:-translate-y-0.5"
          >
            View Full Product
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   SKELETON
------------------------------------------------------- */

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-[#eadfc9] bg-white">
      <div className="aspect-square animate-pulse bg-[#f1eee7]" />

      <div className="space-y-3 p-5">
        <div className="h-3 w-20 animate-pulse rounded bg-[#eeeae1]" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-[#eeeae1]" />
        <div className="h-4 w-3/5 animate-pulse rounded bg-[#eeeae1]" />
        <div className="h-6 w-28 animate-pulse rounded bg-[#eeeae1]" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-[#eeeae1]" />
      </div>
    </div>
  );
}
