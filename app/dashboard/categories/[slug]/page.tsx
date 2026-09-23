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

/* =========================================================
   ROBUST IMAGE PATH HANDLER
========================================================= */

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

  /* Search + sort */
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");

  /* Filters */
  const [showFilter, setShowFilter] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [flashOnly, setFlashOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [minimumRating, setMinimumRating] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState("all");

  /* Price */
  const [maxPrice, setMaxPrice] = useState(100000);

  /* Quick view */
  const [quickViewProduct, setQuickViewProduct] =
    useState<Product | null>(null);

  /* =========================================================
     LOAD CATEGORY + PRODUCTS
  ========================================================= */

  useEffect(() => {
    if (!slug) return;

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
          setCategory(null);
          setProducts([]);
          setError("Category not found.");
          setLoading(false);
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
                is_active
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
      } catch (err) {
        console.error("Category products error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCategoryProducts();
  }, [slug, supabase]);

  /* =========================================================
     BRANDS
  ========================================================= */

  const brands = useMemo(() => {
    const values = products
      .map((product) => product.brand?.trim())
      .filter(Boolean) as string[];

    return Array.from(new Set(values)).sort();
  }, [products]);

  /* =========================================================
     CATEGORY STATS
  ========================================================= */

  const stats = useMemo(() => {
    const total = products.length;

    const inStock = products.filter(
      (product) => Number(product.stock ?? 0) > 0
    ).length;

    const flash = products.filter(
      (product) => product.is_flash_sale
    ).length;

    const ratings = products
      .map((product) => Number(product.rating ?? 0))
      .filter((rating) => rating > 0);

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) /
          ratings.length
        : 0;

    return {
      total,
      inStock,
      flash,
      averageRating,
    };
  }, [products]);

  /* =========================================================
     FILTER + SORT
  ========================================================= */

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

    if (inStockOnly) {
      result = result.filter(
        (product) => Number(product.stock ?? 0) > 0
      );
    }

    if (flashOnly) {
      result = result.filter(
        (product) => product.is_flash_sale
      );
    }

    if (featuredOnly) {
      result = result.filter(
        (product) => product.is_featured
      );
    }

    if (minimumRating > 0) {
      result = result.filter(
        (product) =>
          Number(product.rating ?? 0) >= minimumRating
      );
    }

    if (selectedBrand !== "all") {
      result = result.filter(
        (product) => product.brand === selectedBrand
      );
    }

    result = result.filter(
      (product) =>
        Number(product.price ?? 0) <= maxPrice
    );

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

    if (sort === "rating") {
      result.sort(
        (a, b) =>
          Number(b.rating ?? 0) -
          Number(a.rating ?? 0)
      );
    }

    if (sort === "discount") {
      result.sort((a, b) => {
        const aDiscount =
          Number(a.original_price ?? 0) >
          Number(a.price ?? 0)
            ? ((Number(a.original_price ?? 0) -
                Number(a.price ?? 0)) /
                Number(a.original_price ?? 0)) *
              100
            : 0;

        const bDiscount =
          Number(b.original_price ?? 0) >
          Number(b.price ?? 0)
            ? ((Number(b.original_price ?? 0) -
                Number(b.price ?? 0)) /
                Number(b.original_price ?? 0)) *
              100
            : 0;

        return bDiscount - aDiscount;
      });
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
    inStockOnly,
    flashOnly,
    featuredOnly,
    minimumRating,
    selectedBrand,
    maxPrice,
  ]);

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  function clearFilters() {
    setSearch("");
    setSort("featured");
    setInStockOnly(false);
    setFlashOnly(false);
    setFeaturedOnly(false);
    setMinimumRating(0);
    setSelectedBrand("all");
    setMaxPrice(100000);
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    inStockOnly ||
    flashOnly ||
    featuredOnly ||
    minimumRating > 0 ||
    selectedBrand !== "all" ||
    maxPrice < 100000;

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#c9a227]/10 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-4 px-5 sm:px-8 lg:px-10">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#d8b84c] to-[#b58a16] text-lg font-black text-white shadow-sm">
              P
            </div>

            <div className="hidden sm:block">
              <div className="text-xl font-black tracking-tight">
                Prime<span className="text-[#b08a00]">
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
                  setSearch(e.target.value)
                }
                placeholder={`Search in ${
                  category?.name ?? "this category"
                }...`}
                className="h-11 w-full rounded-xl border border-black/[0.07] bg-[#fafafa] pl-11 pr-10 text-sm outline-none transition focus:border-[#c9a227]/50 focus:bg-white focus:ring-4 focus:ring-[#c9a227]/5"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#b08a00]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard/categories"
              className="hidden items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#c9a227]/40 hover:bg-[#fffaf0] hover:text-[#927000] sm:flex"
            >
              <ArrowLeft size={15} />
              Categories
            </Link>

            <Link
              href="/dashboard/products"
              className="hidden rounded-xl bg-[#c9a227] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#b18b16] hover:shadow-md md:block"
            >
              All Products
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        {/* BREADCRUMB */}

        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link
            href="/dashboard"
            className="transition hover:text-[#a17c00]"
          >
            Dashboard
          </Link>

          <span>/</span>

          <Link
            href="/dashboard/categories"
            className="transition hover:text-[#a17c00]"
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

          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[#f5e8bd]/30 blur-3xl" />

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
                  Explore carefully selected products from this
                  collection with trusted ratings, great prices
                  and exciting offers.
                </p>

                {/* STATS */}

                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatBox
                    icon={<Package size={16} />}
                    label="Products"
                    value={stats.total}
                  />

                  <StatBox
                    icon={<Check size={16} />}
                    label="In Stock"
                    value={stats.inStock}
                  />

                  <StatBox
                    icon={<Zap size={16} />}
                    label="Flash Deals"
                    value={stats.flash}
                  />

                  <StatBox
                    icon={<Star size={16} fill="currentColor" />}
                    label="Avg Rating"
                    value={
                      stats.averageRating
                        ? stats.averageRating.toFixed(1)
                        : "—"
                    }
                  />
                </div>
              </div>

              {/* CATEGORY VISUAL */}

              <div className="hidden lg:flex lg:w-[300px] lg:justify-end">
                <div className="relative flex h-[220px] w-[260px] items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-[#fff8dc] to-[#f7f1dc]">
                  <div className="absolute h-40 w-40 rounded-full bg-[#d5b544]/20 blur-2xl" />

                  <Sparkles
                    size={90}
                    strokeWidth={1}
                    className="relative text-[#c9a227]/60"
                  />

                  <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/80 bg-white/75 px-4 py-3 text-center backdrop-blur-md">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#a17c00]">
                      PrimeCart Picks
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Curated for smarter shopping
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            TOOLBAR
        ===================================================== */}

        <section className="mb-6 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_8px_25px_rgba(0,0,0,0.025)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setShowFilter(true)
                }
                className="flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-[#c9a227]/40 hover:bg-[#fffaf0] md:hidden"
              >
                <SlidersHorizontal size={16} />
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
                </span>{" "}
                products
              </p>
            </div>

            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="hidden text-sm font-bold text-[#a17c00] transition hover:text-[#806200] sm:block"
                >
                  Clear all
                </button>
              )}

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(e.target.value)
                  }
                  className="h-11 appearance-none rounded-xl border border-black/[0.08] bg-white pl-4 pr-10 text-sm font-semibold outline-none transition focus:border-[#c9a227]/50 focus:ring-4 focus:ring-[#c9a227]/5"
                >
                  <option value="featured">
                    Featured
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

          {/* ACTIVE CHIPS */}

          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-black/[0.05] pt-4">
              {search && (
                <FilterChip
                  label={`Search: ${search}`}
                  onRemove={() => setSearch("")}
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

              {selectedBrand !== "all" && (
                <FilterChip
                  label={selectedBrand}
                  onRemove={() =>
                    setSelectedBrand("all")
                  }
                />
              )}

              {maxPrice < 100000 && (
                <FilterChip
                  label={`Under ${formatPrice(maxPrice)}`}
                  onRemove={() =>
                    setMaxPrice(100000)
                  }
                />
              )}
            </div>
          )}
        </section>

        {/* =====================================================
            MOBILE SEARCH
        ===================================================== */}

        <div className="mb-6 md:hidden">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search products..."
              className="h-12 w-full rounded-xl border border-black/[0.07] bg-white pl-11 pr-10 text-sm outline-none focus:border-[#c9a227]/50 focus:ring-4 focus:ring-[#c9a227]/5"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>

        {/* =====================================================
            CONTENT AREA
        ===================================================== */}

        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
          {/* DESKTOP FILTER */}

          <aside className="hidden lg:block">
            <FilterPanel
              brands={brands}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              flashOnly={flashOnly}
              setFlashOnly={setFlashOnly}
              featuredOnly={featuredOnly}
              setFeaturedOnly={setFeaturedOnly}
              minimumRating={minimumRating}
              setMinimumRating={setMinimumRating}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              clearFilters={clearFilters}
            />
          </aside>

          <div>
            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 9 }).map(
                  (_, index) => (
                    <ProductSkeleton
                      key={index}
                    />
                  )
                )}
              </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {!loading && error && (
              <div className="rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
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
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#c9a227] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#b18b16]"
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
                <div className="rounded-3xl border border-black/[0.06] bg-white px-6 py-20 text-center shadow-sm">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff8df] text-[#b08a00]">
                    <Search size={27} />
                  </div>

                  <h2 className="text-2xl font-black">
                    No products found
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                    Try changing your search or filters
                    to discover more products.
                  </p>

                  <button
                    onClick={clearFilters}
                    className="mt-6 rounded-xl bg-[#c9a227] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#b18b16]"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

            {/* =================================================
                PRODUCTS
            ================================================= */}

            {!loading &&
              !error &&
              filteredProducts.length > 0 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map(
                    (product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={() =>
                          setQuickViewProduct(
                            product
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE FILTER DRAWER
      ===================================================== */}

      {showFilter && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            aria-label="Close filter"
            onClick={() =>
              setShowFilter(false)
            }
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-[#faf8f3] p-5 shadow-2xl sm:left-auto sm:top-0 sm:w-[380px] sm:rounded-none">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-lg font-black">
                  Filters
                </p>

                <p className="text-xs text-gray-500">
                  Refine your products
                </p>
              </div>

              <button
                onClick={() =>
                  setShowFilter(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            <FilterPanel
              brands={brands}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              flashOnly={flashOnly}
              setFlashOnly={setFlashOnly}
              featuredOnly={featuredOnly}
              setFeaturedOnly={setFeaturedOnly}
              minimumRating={minimumRating}
              setMinimumRating={setMinimumRating}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              clearFilters={clearFilters}
            />

            <button
              onClick={() =>
                setShowFilter(false)
              }
              className="mt-5 w-full rounded-xl bg-[#c9a227] py-3.5 text-sm font-black text-white shadow-sm"
            >
              Show {filteredProducts.length} Products
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          QUICK VIEW MODAL
      ===================================================== */}

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() =>
            setQuickViewProduct(null)
          }
        />
      )}
    </main>
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

      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
    </div>
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
  maxPrice,
  setMaxPrice,
  clearFilters,
}: {
  brands: string[];
  inStockOnly: boolean;
  setInStockOnly: (value: boolean) => void;
  flashOnly: boolean;
  setFlashOnly: (value: boolean) => void;
  featuredOnly: boolean;
  setFeaturedOnly: (value: boolean) => void;
  minimumRating: number;
  setMinimumRating: (value: number) => void;
  selectedBrand: string;
  setSelectedBrand: (value: string) => void;
  maxPrice: number;
  setMaxPrice: (value: number) => void;
  clearFilters: () => void;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_8px_25px_rgba(0,0,0,0.025)]">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={17} className="text-[#a17c00]" />

          <h3 className="font-black">
            Filters
          </h3>
        </div>

        <button
          onClick={clearFilters}
          className="text-xs font-bold text-[#a17c00] hover:text-[#806200]"
        >
          Reset
        </button>
      </div>

      {/* AVAILABILITY */}

      <div className="border-b border-black/[0.05] pb-5">
        <p className="mb-3 text-xs font-black uppercase tracking-wider text-gray-500">
          Availability
        </p>

        <FilterToggle
          checked={inStockOnly}
          onChange={setInStockOnly}
          label="In Stock"
        />

        <FilterToggle
          checked={flashOnly}
          onChange={setFlashOnly}
          label="Flash Sale"
        />

        <FilterToggle
          checked={featuredOnly}
          onChange={setFeaturedOnly}
          label="Featured"
        />
      </div>

      {/* RATING */}

      <div className="border-b border-black/[0.05] py-5">
        <p className="mb-3 text-xs font-black uppercase tracking-wider text-gray-500">
          Rating
        </p>

        {[4, 3, 2].map((rating) => (
          <button
            key={rating}
            onClick={() =>
              setMinimumRating(
                minimumRating === rating
                  ? 0
                  : rating
              )
            }
            className={`mb-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition ${
              minimumRating === rating
                ? "bg-[#fff8df] text-[#8d6d00]"
                : "text-gray-600 hover:bg-[#faf8f3]"
            }`}
          >
            <div className="flex items-center gap-0.5 text-[#c9a227]">
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <Star
                  key={index}
                  size={13}
                  fill={
                    index < rating
                      ? "currentColor"
                      : "none"
                  }
                />
              ))}
            </div>

            <span>& up</span>
          </button>
        ))}
      </div>

      {/* PRICE */}

      <div className="border-b border-black/[0.05] py-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-wider text-gray-500">
            Maximum Price
          </p>

          <span className="text-xs font-black text-[#a17c00]">
            {formatPrice(maxPrice)}
          </span>
        </div>

        <input
          type="range"
          min="500"
          max="100000"
          step="500"
          value={maxPrice}
          onChange={(e) =>
            setMaxPrice(
              Number(e.target.value)
            )
          }
          className="w-full accent-[#c9a227]"
        />

        <div className="mt-2 flex justify-between text-[10px] text-gray-400">
          <span>₹500</span>
          <span>₹1,00,000</span>
        </div>
      </div>

      {/* BRAND */}

      {brands.length > 0 && (
        <div className="pt-5">
          <p className="mb-3 text-xs font-black uppercase tracking-wider text-gray-500">
            Brand
          </p>

          <div className="max-h-48 space-y-1 overflow-y-auto">
            <button
              onClick={() =>
                setSelectedBrand("all")
              }
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                selectedBrand === "all"
                  ? "bg-[#fff8df] font-bold text-[#8d6d00]"
                  : "text-gray-600 hover:bg-[#faf8f3]"
              }`}
            >
              <span>All Brands</span>

              {selectedBrand === "all" && (
                <Check size={15} />
              )}
            </button>

            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() =>
                  setSelectedBrand(brand)
                }
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                  selectedBrand === brand
                    ? "bg-[#fff8df] font-bold text-[#8d6d00]"
                    : "text-gray-600 hover:bg-[#faf8f3]"
                }`}
              >
                <span>{brand}</span>

                {selectedBrand === brand && (
                  <Check size={15} />
                )}
              </button>
            ))}
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
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="mb-2 flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm text-gray-600 transition hover:bg-[#faf8f3]"
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
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${
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
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView: () => void;
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const [wishlist, setWishlist] = useState(false);

  const imageCandidates = useMemo(
    () =>
      getImageCandidates(
        product.image_url
      ),
    [product.image_url]
  );

  const currentImage =
    imageCandidates[imageIndex];

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
    originalPrice > price
      ? Math.round(
          ((originalPrice - price) /
            originalPrice) *
            100
        )
      : 0;

  return (
    <Link
      href={`/dashboard/products/${product.id}`}
      className="group block overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.035)] transition duration-300 hover:-translate-y-1 hover:border-[#c9a227]/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.09)]"
    >
      {/* IMAGE */}

      <div className="relative aspect-square overflow-hidden bg-[#f8f7f3]">
        {currentImage ? (
          <img
            src={currentImage}
            alt={product.name}
            className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-[1.045]"
            onError={() => {
              setImageIndex(
                (current) =>
                  current + 1
              );
            }}
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

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.04] via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

        {/* BADGES */}

        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {product.is_flash_sale && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff1c2] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#8d6d00] shadow-sm">
              <Zap size={11} />
              Flash Sale
            </span>
          )}

          {discount > 0 && (
            <span className="rounded-full bg-[#c9a227] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              {discount}% OFF
            </span>
          )}

          {product.is_featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#927000] backdrop-blur">
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
            setWishlist(!wishlist);
          }}
          aria-label="Wishlist"
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition ${
            wishlist
              ? "border-red-100 bg-red-50 text-red-500"
              : "border-white/70 bg-white/90 text-gray-600 hover:border-red-100 hover:bg-red-50 hover:text-red-500"
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

        {/* QUICK VIEW */}

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onQuickView();
          }}
          className="absolute bottom-4 left-4 translate-y-3 rounded-xl border border-white/80 bg-white/95 px-3 py-2 text-xs font-bold text-gray-700 opacity-0 shadow-lg backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#fff8df] hover:text-[#8d6d00]"
        >
          Quick View
        </button>

        {/* CART */}

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          aria-label="Add to cart"
          className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-[#c9a227] text-white opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#b18b16]"
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
            ({product.reviews_count ?? 0} reviews)
          </span>
        </div>

        {/* PRICE */}

        <div className="mt-4 flex flex-wrap items-end gap-2">
          <span className="text-xl font-black tracking-tight">
            {formatPrice(price)}
          </span>

          {originalPrice > price && (
            <span className="pb-0.5 text-sm text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* STOCK */}

        <div className="mt-3 flex items-center justify-between">
          {stock > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              In stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Out of stock
            </span>
          )}

          <span className="text-xs font-semibold text-gray-400 transition group-hover:text-[#a17c00]">
            View details
            <ArrowRight
              size={13}
              className="ml-1 inline transition group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   PRODUCT SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white">
      <div className="aspect-square animate-pulse bg-gray-100" />

      <div className="space-y-3 p-5">
        <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />

        <div className="h-5 w-4/5 animate-pulse rounded bg-gray-100" />

        <div className="h-4 w-3/5 animate-pulse rounded bg-gray-100" />

        <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />

        <div className="h-6 w-28 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

/* =========================================================
   QUICK VIEW
========================================================= */

function QuickViewModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [imageIndex, setImageIndex] = useState(0);

  const images = getImageCandidates(
    product.image_url
  );

  const price = Number(
    product.price ?? 0
  );

  const originalPrice = Number(
    product.original_price ?? 0
  );

  const discount =
    originalPrice > price
      ? Math.round(
          ((originalPrice - price) /
            originalPrice) *
            100
        )
      : 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        onClick={onClose}
        aria-label="Close quick view"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-black/[0.06] bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.06] bg-white text-gray-600 shadow-sm transition hover:bg-[#fff8df] hover:text-[#927000]"
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
                className="max-h-[460px] w-full object-contain"
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
                {product.reviews_count ?? 0} reviews
              </span>
            </div>

            <p className="mt-5 text-sm leading-6 text-gray-500">
              {product.short_description ||
                product.description ||
                "Premium quality product from PrimeCart."}
            </p>

            <div className="mt-6 flex items-end gap-3">
              <span className="text-3xl font-black">
                {formatPrice(price)}
              </span>

              {originalPrice > price && (
                <>
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(
                      originalPrice
                    )}
                  </span>

                  <span className="rounded-full bg-[#fff1c2] px-2.5 py-1 text-xs font-black text-[#8d6d00]">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm">
              {Number(product.stock ?? 0) >
              0 ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-emerald-600">
                    In stock
                  </span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="font-bold text-red-500">
                    Out of stock
                  </span>
                </>
              )}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/dashboard/products/${product.id}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#c9a227] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#b18b16]"
              >
                View Full Product
                <ArrowRight size={16} />
              </Link>

              <button
                onClick={onClose}
                className="rounded-xl border border-black/[0.08] bg-white px-5 py-3.5 text-sm font-bold text-gray-700 transition hover:bg-[#faf8f3]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
