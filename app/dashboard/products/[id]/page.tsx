"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Heart,
  ImageOff,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Share2,
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
};

function getImageUrl(image: string | null) {
  if (!image) return null;

  if (image.startsWith("http")) return image;

  if (image.startsWith("/")) return image;

  return `/${image}`;
}

function formatPrice(price: number | string | null) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const supabase = createClient();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) {
        setProduct(data);
      }

      setLoading(false);
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f3] p-10">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f3]">
        <div className="text-center">
          <h1 className="text-3xl font-black">
            Product Not Found
          </h1>

          <Link
            href="/dashboard/products"
            className="mt-5 inline-block rounded-xl bg-black px-5 py-3 text-white"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(product.image_url);

  const price = Number(product.price || 0);
  const original = Number(product.original_price || 0);

  const discount =
    original > price
      ? Math.round(((original - price) / original) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#171717]">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a227] text-white font-black">
              P
            </div>

            <div>
              <div className="text-xl font-black">
                Prime<span className="text-[#b08a00]">Cart</span>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/products"
            className="flex items-center gap-2 rounded-xl border px-4 py-2"
          >
            <ArrowLeft size={16} />
            Products
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-[1400px] px-5 py-10">

        <div className="grid gap-10 lg:grid-cols-2">

          {/* IMAGE */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f5f5f5]">

              {imageUrl && !imageError ? (
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageOff size={50} />
                </div>
              )}

              {discount > 0 && (
                <div className="absolute left-4 top-4 rounded-full bg-[#c9a227] px-4 py-2 text-xs font-bold text-white">
                  {discount}% OFF
                </div>
              )}
            </div>
          </div>

          {/* DETAILS */}
          <div>

            {product.brand && (
              <p className="text-sm uppercase text-[#a17c00] font-bold">
                {product.brand}
              </p>
            )}

            <h1 className="mt-2 text-4xl font-black">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-md bg-[#fff5d4] px-3 py-1 text-sm font-bold text-[#8c6c00]">
                <Star size={14} fill="currentColor" />
                {product.rating}
              </div>

              <span className="text-gray-500">
                {product.reviews_count} Reviews
              </span>
            </div>

            {/* Description */}
            <p className="mt-5 text-gray-600 leading-7">
              {product.description ||
                product.short_description}
            </p>

            {/* Price */}
            <div className="mt-8 flex items-end gap-3">
              <span className="text-4xl font-black">
                {formatPrice(price)}
              </span>

              {original > price && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(original)}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="mt-4">
              {Number(product.stock) > 0 ? (
                <span className="text-green-600 font-semibold">
                  ● In Stock
                </span>
              ) : (
                <span className="text-red-500 font-semibold">
                  ● Out of Stock
                </span>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="flex items-center gap-2 rounded-xl bg-black px-7 py-4 text-white font-bold hover:bg-[#c9a227]">
                <ShoppingCart size={18} />
                Add To Cart
              </button>

              <button
                onClick={() =>
                  setWishlist(!wishlist)
                }
                className={`flex items-center gap-2 rounded-xl border px-7 py-4 font-bold ${
                  wishlist
                    ? "border-red-200 bg-red-50 text-red-500"
                    : ""
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
                Wishlist
              </button>

              <button className="flex items-center gap-2 rounded-xl border px-7 py-4">
                <Share2 size={18} />
                Share
              </button>
            </div>

            {/* Features */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">

              <div className="rounded-2xl bg-white p-5">
                <Truck className="text-[#c9a227]" />
                <h3 className="mt-3 font-bold">
                  Free Delivery
                </h3>
                <p className="text-sm text-gray-500">
                  Above ₹999
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5">
                <RotateCcw className="text-[#c9a227]" />
                <h3 className="mt-3 font-bold">
                  Easy Return
                </h3>
                <p className="text-sm text-gray-500">
                  7 Days Return
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5">
                <ShieldCheck className="text-[#c9a227]" />
                <h3 className="mt-3 font-bold">
                  Secure Payment
                </h3>
                <p className="text-sm text-gray-500">
                  100% Safe
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
