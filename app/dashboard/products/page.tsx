"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Heart,
  ImageOff,
  Search,
  ShoppingCart,
  SlidersHorizontal,
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

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/")) {
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
        // Products are already fetched newest first.
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

  const selectedCategoryName =
    categories.find((item) => item.id === selectedCategory)?.name;

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-4 px-5 sm:px-8 lg:px-10">
          {/* LOGO */}
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a227] text-lg font-black text-white shadow-sm">
              P
            </div>

            <div className="hidden sm:block">
              <div className="text-xl font-black tracking-tight">
                Prime<span className="text-[#b08a00]">Cart</span>
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
                placeholder="Search products, brands and more..."
                className="h-11 w-full rounded-xl border border-black/[0.07] bg-[#fafafa] pl-11 pr-11 text-sm outline-none transition focus:border-[#c9a227]/60 focus:bg-white"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-black"
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
              className="hidden items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#c9a227]/40 hover:bg-[#fffaf0] sm:flex"
            >
              Categories
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#c9a227]"
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
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link
            href="/dashboard"
            className="transition hover:text-black"
          >
            Dashboard
          </Link>

          <span>/</span>

          <span className="font-semibold text-gray-900">
            Products
          </span>
        </div>

        {/* PAGE TITLE */}
        <section className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#fff8df] px-4 py-2 text-xs font-bold uppercase tracking-[0.13em] text-[#967400]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9a227]" />
            PrimeCart Collection
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                All <span className="text-[#b08a00]">Products</span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Explore our complete collection of products,
                curated to help you shop smarter.
              </p>
            </div>

            {!loading && !error && (
              <div className="rounded-2xl border border-black/[0.06] bg-white px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Products Available
                </p>

                <p className="mt-1 text-2xl font-black">
                  {filteredProducts.length}
                </p>
              </div>
            )}
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
              className="h-12 w-full rounded-xl border border-black/[0.07] bg-white pl-11 pr-10 text-sm outline-none focus:border-[#c9a227]/60"
            />
          </div>
        </div>

        {/* FILTER BAR */}
        <section className="mb-8 rounded-2xl border border-black/[0.06] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.025)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* CATEGORIES */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  selectedCategory === "all"
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-[#faf8f3]"
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
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    selectedCategory === category.id
                      ? "bg-[#fff5d4] text-[#8c6c00]"
                      : "text-gray-600 hover:bg-[#faf8f3]"
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
                className="flex items-center gap-2 rounded-xl border border-black/[0.07] px-4 py-2.5 text-sm font-semibold md:hidden"
              >
                <SlidersHorizontal size={16} />
                Filter
              </button>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-11 appearance-none rounded-xl border border-black/[0.07] bg-white pl-4 pr-10 text-sm font-semibold outline-none focus:border-[#c9a227]/60"
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
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* MOBILE FILTER INFO */}
          {mobileFilter && (
            <div className="mt-3 border-t border-black/[0.06] pt-3 md:hidden">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <SlidersHorizontal size={14} />
                Choose a category above to filter products.
              </div>
            </div>
          )}
        </section>

        {/* SELECTED FILTER */}
        {!loading && selectedCategory !== "all" && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Showing:
            </span>

            <span className="rounded-full bg-[#fff5d4] px-3 py-1 text-xs font-bold text-[#8c6c00]">
              {selectedCategoryName}
            </span>

            <button
              onClick={() => setSelectedCategory("all")}
              className="ml-1 text-gray-400 hover:text-black"
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
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white"
              >
                <div className="aspect-square animate-pulse bg-gray-100" />

                <div className="space-y-3 p-5">
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                  <div className="h-5 w-4/5 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-3/5 animate-pulse rounded bg-gray-100" />
                  <div className="h-6 w-28 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-100 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <X size={28} />
            </div>

            <h2 className="text-2xl font-black">
              Unable to load products
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c9a227]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div className="rounded-3xl border border-black/[0.06] bg-white px-6 py-20 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#faf6e8] text-[#b08a00]">
                <Search size={28} />
              </div>

              <h2 className="text-2xl font-black">
                No products found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                We couldn't find products matching your
                current search or category filter.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                }}
                className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c9a227]"
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
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-bold text-gray-900">
                    {filteredProducts.length}
                  </span>{" "}
                  products
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryName={
                      categories.find(
                        (category) =>
                          category.id === product.category_id
                      )?.name
                    }
                  />
                ))}
              </div>
            </section>
          )}
      </div>
    </main>
  );
}

function ProductCard({
  product,
  categoryName,
}: {
  product: Product;
  categoryName?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  const imageUrl = getImageUrl(product.image_url);

  const price = Number(product.price ?? 0);
  const originalPrice = Number(product.original_price ?? 0);

  const discount =
    originalPrice > price
      ? Math.round(
          ((originalPrice - price) / originalPrice) * 100
        )
      : 0;

  const rating = Number(product.rating ?? 0);

  return (
    <article className="group overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.035)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.09)]">
      {/* IMAGE */}
      <div className="relative aspect-square overflow-hidden bg-[#f7f6f2]">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
            <ImageOff size={34} />

            <span className="mt-2 text-xs font-semibold">
              Image unavailable
            </span>
          </div>
        )}

        {/* TOP BADGES */}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {product.is_flash_sale && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              <Zap size={11} fill="currentColor" />
              Flash Sale
            </span>
          )}

          {product.is_featured && (
            <span className="rounded-full bg-[#c9a227] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              Featured
            </span>
          )}

          {discount > 0 && (
            <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#8c6c00] shadow-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* WISHLIST */}
        <button
          onClick={() => setWishlist(!wishlist)}
          aria-label="Add to wishlist"
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition ${
            wishlist
              ? "border-red-100 bg-red-50 text-red-500"
              : "border-white/80 bg-white/90 text-gray-600 hover:text-red-500"
          }`}
        >
          <Heart
            size={18}
            fill={wishlist ? "currentColor" : "none"}
          />
        </button>

        {/* CART */}
        <button
          aria-label="Add to cart"
          className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-3 items-center justify-center rounded-full bg-black text-white opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#c9a227]"
        >
          <ShoppingCart size={18} />
        </button>
      </div>

      {/* DETAILS */}
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          {categoryName ? (
            <span className="rounded-full bg-[#faf6e8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#967400]">
              {categoryName}
            </span>
          ) : (
            <span />
          )}

          {product.brand && (
            <span className="max-w-[50%] truncate text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {product.brand}
            </span>
          )}
        </div>

        <Link
          href={`/dashboard/products/${product.id}`}
          className="line-clamp-2 text-[17px] font-extrabold leading-6 tracking-tight transition hover:text-[#a17b00]"
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
          <span className="inline-flex items-center gap-1 rounded-md bg-[#fff6d8] px-2 py-1 text-xs font-bold text-[#846400]">
            <Star size={12} fill="currentColor" />
            {rating.toFixed(1)}
          </span>

          <span className="text-xs text-gray-400">
            {product.reviews_count ?? 0} reviews
          </span>
        </div>

        {/* PRICE */}
        <div className="mt-4 flex items-end gap-2">
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
        <div className="mt-3">
          {Number(product.stock ?? 0) > 0 ? (
            <span className="text-xs font-semibold text-emerald-600">
              ● In stock
            </span>
          ) : (
            <span className="text-xs font-semibold text-red-500">
              ● Out of stock
            </span>
          )}
        </div>

        {/* VIEW */}
        <Link
          href={`/dashboard/products/${product.id}`}
          className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border border-black/[0.08] text-sm font-bold text-gray-700 transition hover:border-[#c9a227] hover:bg-[#fffaf0] hover:text-[#927000]"
        >
          View Product
          <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}
