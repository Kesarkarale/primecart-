"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Filter,
  Heart,
  ImageOff,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  X,
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

function getImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;

  const value = imageUrl.trim();

  if (!value) return null;

  // Already a complete URL
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  // DB stores /image.png
  if (value.startsWith("/")) {
    return value;
  }

  // DB stores image.png
  return `/${value}`;
}

export default function CategoryProductsPage() {
  const params = useParams();

  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
        ? params.slug[0]
        : "";

  const supabase = createClient();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");

  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function loadCategoryProducts() {
      setLoading(true);
      setError("");

      try {
        // 1. Find category by slug
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

        // 2. Fetch products belonging to category
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
  }, [slug]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
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

    // Sorting
    if (sort === "price-low") {
      result.sort(
        (a, b) => Number(a.price ?? 0) - Number(b.price ?? 0)
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) => Number(b.price ?? 0) - Number(a.price ?? 0)
      );
    }

    if (sort === "rating") {
      result.sort(
        (a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0)
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
  }, [products, search, sort]);

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-4 px-5 sm:px-8 lg:px-10">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a227] font-black text-white">
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
          <div className="mx-auto hidden max-w-xl flex-1 md:block">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search in ${category?.name ?? "this category"}...`}
                className="h-11 w-full rounded-xl border border-black/[0.07] bg-[#fafafa] pl-11 pr-10 text-sm outline-none transition focus:border-[#c9a227]/50 focus:bg-white"
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
              href="/dashboard/categories"
              className="hidden items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#c9a227]/30 hover:bg-[#fffaf0] sm:flex"
            >
              <ArrowLeft size={15} />
              Categories
            </Link>

            <Link
              href="/dashboard/products"
              className="hidden rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#c9a227] md:block"
            >
              All Products
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
            className="transition hover:text-black"
          >
            Dashboard
          </Link>

          <span>/</span>

          <Link
            href="/dashboard/categories"
            className="transition hover:text-black"
          >
            Categories
          </Link>

          <span>/</span>

          <span className="font-semibold text-gray-900">
            {category?.name ?? categoryNames[slug] ?? "Category"}
          </span>
        </div>

        {/* TITLE */}
        <section className="mb-8 rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.035)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#fff8df] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#987500]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c9a227]" />
                Category Collection
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                {category?.name ?? categoryNames[slug] ?? "Category"}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {loading
                  ? "Finding products for you..."
                  : `${filteredProducts.length} ${
                      filteredProducts.length === 1
                        ? "product"
                        : "products"
                    } available`}
              </p>
            </div>

            {/* SORT */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 md:hidden"
              >
                <SlidersHorizontal size={16} />
                Filter
              </button>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-11 appearance-none rounded-xl border border-black/[0.08] bg-white pl-4 pr-10 text-sm font-semibold outline-none transition focus:border-[#c9a227]/50"
                >
                  <option value="featured">Featured</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* MOBILE SEARCH */}
          <div className="mt-5 md:hidden">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="h-11 w-full rounded-xl border border-black/[0.07] bg-[#fafafa] pl-11 pr-10 text-sm outline-none focus:border-[#c9a227]/50"
              />
            </div>
          </div>
        </section>

        {/* MOBILE FILTER */}
        {showFilter && (
          <div className="mb-6 rounded-2xl border border-black/[0.07] bg-white p-5 md:hidden">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                <Filter size={17} />
                Sort Products
              </div>

              <button onClick={() => setShowFilter(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                ["featured", "Featured"],
                ["rating", "Top Rated"],
                ["price-low", "Price Low"],
                ["price-high", "Price High"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    setSort(value);
                    setShowFilter(false);
                  }}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                    sort === value
                      ? "border-[#c9a227] bg-[#fff8df] text-[#8d6d00]"
                      : "border-black/[0.07] bg-white text-gray-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
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
          <div className="rounded-3xl border border-red-100 bg-white p-10 text-center">
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
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white"
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
            <div className="rounded-3xl border border-black/[0.06] bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#faf6e8] text-[#b08a00]">
                <Search size={27} />
              </div>

              <h2 className="text-2xl font-black">
                No products found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {search
                  ? "Try another search term or clear your search."
                  : "There are currently no active products in this category."}
              </p>

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white"
                >
                  Clear Search
                </button>
              )}
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
                  />
                ))}
              </div>
            </section>
          )}
      </div>
    </main>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  const imageUrl = getImageUrl(product.image_url);

  const price = Number(product.price ?? 0);
  const originalPrice = Number(product.original_price ?? 0);

  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  return (
    <article className="group overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.035)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.09)]">
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
            <ImageOff size={32} />
            <span className="mt-2 text-xs font-semibold">
              Image unavailable
            </span>
          </div>
        )}

        {/* BADGES */}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {product.is_flash_sale && (
            <span className="rounded-full bg-black px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">
              Flash Sale
            </span>
          )}

          {discount > 0 && (
            <span className="rounded-full bg-[#c9a227] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">
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
              : "border-white/70 bg-white/90 text-gray-600 hover:text-red-500"
          }`}
        >
          <Heart
            size={18}
            fill={wishlist ? "currentColor" : "none"}
          />
        </button>

        {/* CART BUTTON */}
        <button
          className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-black text-white opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#c9a227]"
          aria-label="Add to cart"
        >
          <ShoppingCart size={17} />
        </button>
      </div>

      {/* INFO */}
      <div className="p-5">
        {product.brand && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a17c00]">
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
            ({product.reviews_count ?? 0})
          </span>
        </div>

        {/* PRICE */}
        <div className="mt-4 flex items-end gap-2">
          <span className="text-xl font-black">
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
              In stock
            </span>
          ) : (
            <span className="text-xs font-semibold text-red-500">
              Out of stock
            </span>
          )}
        </div>

        {/* VIEW PRODUCT */}
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
