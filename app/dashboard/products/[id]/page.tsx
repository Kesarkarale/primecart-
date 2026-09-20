"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Heart,
  ImageOff,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

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

type Category = {
  id: string;
  name: string;
  slug: string;
};

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

function formatPrice(value: number | string | null) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export default function ProductDetailPage() {
  const params = useParams();

  const productId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  const supabase = createClient();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const [imageError, setImageError] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!productId) return;

    async function fetchProduct() {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        /*
         * PRODUCT
         */
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
            .eq("id", productId)
            .maybeSingle();

        if (productError) {
          console.error("Product query error:", productError);
          throw productError;
        }

        if (!productData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setProduct(productData);

        /*
         * CATEGORY
         */
        if (productData.category_id) {
          const { data: categoryData } = await supabase
            .from("categories")
            .select("id, name, slug")
            .eq("id", productData.category_id)
            .maybeSingle();

          if (categoryData) {
            setCategory(categoryData);
          }
        }
      } catch (err) {
        console.error("Product detail error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this product."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  /*
   * LOADING
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f3]">
        <header className="border-b border-black/[0.06] bg-white">
          <div className="mx-auto flex h-[72px] max-w-[1500px] items-center px-5 sm:px-8 lg:px-10">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a227] font-black text-white">
                P
              </div>

              <div className="text-xl font-black">
                Prime<span className="text-[#b08a00]">Cart</span>
              </div>
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-3xl bg-gray-200" />

            <div className="space-y-5 py-5">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-4/5 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-1/3 animate-pulse rounded bg-gray-200" />
              <div className="h-20 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-14 w-72 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ERROR
   */
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8f3] px-5">
        <div className="w-full max-w-lg rounded-3xl border border-black/[0.06] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <ImageOff size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Unable to load product
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error}
          </p>

          <Link
            href="/dashboard/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft size={16} />
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  /*
   * NOT FOUND
   */
  if (notFound || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8f3] px-5">
        <div className="w-full max-w-lg rounded-3xl border border-black/[0.06] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#faf6e8] text-[#b08a00]">
            <ImageOff size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Product Not Found
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            This product may have been removed or the product
            link is invalid.
          </p>

          <Link
            href="/dashboard/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c9a227]"
          >
            <ArrowLeft size={16} />
            Back to All Products
          </Link>
        </div>
      </main>
    );
  }

  const imageUrl = getImageUrl(product.image_url);

  const price = Number(product.price ?? 0);
  const originalPrice = Number(product.original_price ?? 0);
  const stock = Number(product.stock ?? 0);
  const rating = Number(product.rating ?? 0);

  const discount =
    originalPrice > price
      ? Math.round(
          ((originalPrice - price) / originalPrice) * 100
        )
      : 0;

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a227] text-lg font-black text-white shadow-sm">
              P
            </div>

            <div>
              <div className="text-xl font-black tracking-tight">
                Prime<span className="text-[#b08a00]">Cart</span>
              </div>

              <div className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 sm:block">
                Shop Smarter
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/products"
              className="flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#c9a227]/40 hover:bg-[#fffaf0]"
            >
              <ArrowLeft size={16} />
              <span>Products</span>
            </Link>

            <Link
              href="/dashboard"
              className="hidden rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#c9a227] sm:block"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <div className="mx-auto max-w-[1400px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
        {/* BREADCRUMB */}
        <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link
            href="/dashboard"
            className="transition hover:text-black"
          >
            Dashboard
          </Link>

          <span>/</span>

          <Link
            href="/dashboard/products"
            className="transition hover:text-black"
          >
            Products
          </Link>

          {category && (
            <>
              <span>/</span>

              <Link
                href={`/dashboard/categories/${category.slug}`}
                className="transition hover:text-black"
              >
                {category.name}
              </Link>
            </>
          )}

          <span>/</span>

          <span className="max-w-[200px] truncate font-semibold text-gray-900">
            {product.name}
          </span>
        </div>

        {/* =====================================================
            PRODUCT
        ===================================================== */}
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* IMAGE */}
          <div className="rounded-[28px] border border-black/[0.06] bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.035)] sm:p-6">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f7f6f2]">
              {imageUrl && !imageError ? (
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                  <ImageOff size={48} />

                  <p className="mt-3 text-sm font-semibold">
                    Image unavailable
                  </p>
                </div>
              )}

              {/* DISCOUNT */}
              {discount > 0 && (
                <div className="absolute left-5 top-5 rounded-full bg-[#c9a227] px-4 py-2 text-xs font-black text-white shadow-md">
                  {discount}% OFF
                </div>
              )}

              {/* FLASH SALE */}
              {product.is_flash_sale && (
                <div className="absolute bottom-5 left-5 rounded-full bg-black px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md">
                  Flash Sale
                </div>
              )}

              {/* WISHLIST */}
              <button
                type="button"
                onClick={() => setWishlist(!wishlist)}
                aria-label="Wishlist"
                className={`absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition ${
                  wishlist
                    ? "border-red-100 bg-red-50 text-red-500"
                    : "border-white/80 bg-white/90 text-gray-600 hover:text-red-500"
                }`}
              >
                <Heart
                  size={20}
                  fill={
                    wishlist
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            </div>
          </div>

          {/* DETAILS */}
          <div>
            {/* CATEGORY + BRAND */}
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <Link
                  href={`/dashboard/categories/${category.slug}`}
                  className="rounded-full bg-[#fff5d4] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8d6d00]"
                >
                  {category.name}
                </Link>
              )}

              {product.brand && (
                <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {product.brand}
                </span>
              )}
            </div>

            {/* NAME */}
            <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[44px]">
              {product.name}
            </h1>

            {/* SHORT DESCRIPTION */}
            {product.short_description && (
              <p className="mt-4 text-base leading-7 text-gray-500">
                {product.short_description}
              </p>
            )}

            {/* RATING */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-[#fff5d4] px-3 py-2 text-sm font-bold text-[#846400]">
                <Star size={15} fill="currentColor" />
                {rating.toFixed(1)}
              </div>

              <span className="text-sm text-gray-500">
                {product.reviews_count ?? 0} reviews
              </span>

              <span className="h-1 w-1 rounded-full bg-gray-300" />

              {stock > 0 ? (
                <span className="text-sm font-semibold text-emerald-600">
                  In Stock
                </span>
              ) : (
                <span className="text-sm font-semibold text-red-500">
                  Out of Stock
                </span>
              )}
            </div>

            {/* DIVIDER */}
            <div className="my-7 h-px bg-black/[0.07]" />

            {/* PRICE */}
            <div>
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-4xl font-black tracking-tight">
                  {formatPrice(price)}
                </span>

                {originalPrice > price && (
                  <span className="pb-1 text-lg text-gray-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}

                {discount > 0 && (
                  <span className="pb-1 text-sm font-bold text-emerald-600">
                    Save {formatPrice(originalPrice - price)}
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Inclusive of all applicable taxes
              </p>
            </div>

            {/* QUANTITY */}
            {stock > 0 && (
              <div className="mt-7">
                <p className="mb-2 text-sm font-bold">
                  Quantity
                </p>

                <div className="flex h-11 w-fit items-center rounded-xl border border-black/[0.08] bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) =>
                        Math.max(1, value - 1)
                      )
                    }
                    className="flex h-full w-11 items-center justify-center text-gray-500 transition hover:text-black"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="w-10 text-center text-sm font-bold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) =>
                        Math.min(stock, value + 1)
                      )
                    }
                    className="flex h-full w-11 items-center justify-center text-gray-500 transition hover:text-black"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {stock < 10 && (
                  <p className="mt-2 text-xs font-semibold text-orange-600">
                    Only {stock} left in stock
                  </p>
                )}
              </div>
            )}

            {/* ACTIONS */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={stock <= 0}
                className="flex h-13 flex-1 items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 text-sm font-black text-white transition hover:bg-[#c9a227] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <ShoppingCart size={19} />
                Add to Cart
              </button>

              <button
                type="button"
                disabled={stock <= 0}
                className="flex h-13 flex-1 items-center justify-center rounded-xl bg-[#c9a227] px-6 py-4 text-sm font-black text-white transition hover:bg-[#ad8a12] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Buy Now
              </button>
            </div>

            {/* SECONDARY ACTIONS */}
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => setWishlist(!wishlist)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                  wishlist
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-black/[0.08] bg-white text-gray-700 hover:border-[#c9a227]/50"
                }`}
              >
                <Heart
                  size={17}
                  fill={
                    wishlist
                      ? "currentColor"
                      : "none"
                  }
                />

                {wishlist
                  ? "Added to Wishlist"
                  : "Add to Wishlist"}
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-black/[0.08] bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-[#c9a227]/50"
              >
                <Share2 size={17} />
                <span className="hidden sm:inline">
                  Share
                </span>
              </button>
            </div>

            {/* SERVICE CARDS */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
                <Truck
                  size={20}
                  className="text-[#b08a00]"
                />

                <p className="mt-3 text-sm font-bold">
                  Free Delivery
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  On orders above ₹999
                </p>
              </div>

              <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
                <RotateCcw
                  size={20}
                  className="text-[#b08a00]"
                />

                <p className="mt-3 text-sm font-bold">
                  Easy Returns
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  7 day return policy
                </p>
              </div>

              <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
                <ShieldCheck
                  size={20}
                  className="text-[#b08a00]"
                />

                <p className="mt-3 text-sm font-bold">
                  Secure Payment
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Safe & protected
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            DESCRIPTION
        ===================================================== */}
        <section className="mt-10 rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.025)] sm:p-8">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1 rounded-full bg-[#c9a227]" />

            <h2 className="text-2xl font-black">
              Product Details
            </h2>
          </div>

          <div className="mt-6 max-w-4xl">
            <p className="whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">
              {product.description ||
                product.short_description ||
                "No detailed description available for this product."}
            </p>
          </div>
        </section>

        {/* =====================================================
            HIGHLIGHTS
        ===================================================== */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
            <Check
              className="text-emerald-600"
              size={21}
            />

            <p className="mt-3 text-sm font-bold">
              Genuine Product
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Quality checked products.
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
            <Truck
              className="text-[#b08a00]"
              size={21}
            />

            <p className="mt-3 text-sm font-bold">
              Fast Delivery
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Reliable delivery service.
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
            <ShieldCheck
              className="text-[#b08a00]"
              size={21}
            />

            <p className="mt-3 text-sm font-bold">
              Secure Shopping
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Your purchase is protected.
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
            <RotateCcw
              className="text-[#b08a00]"
              size={21}
            />

            <p className="mt-3 text-sm font-bold">
              Easy Returns
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Simple return experience.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
