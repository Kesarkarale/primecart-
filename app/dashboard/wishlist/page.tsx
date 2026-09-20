"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Heart,
  HeartOff,
  ShoppingCart,
  Star,
  Trash2,
  Package,
} from "lucide-react";

import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { addToCart } from "@/lib/cart";

type Product = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  image_url: string | null;
  brand: string | null;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_flash_sale: boolean;
};

type WishlistRow = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

type WishlistProduct = WishlistRow & {
  product: Product | null;
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

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function getDiscount(
  price: number,
  originalPrice: number | null
) {
  if (!originalPrice || originalPrice <= price) return 0;

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100
  );
}

export default function WishlistPage() {
  const supabase = createClient();

  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(
    null
  );
  const [addingId, setAddingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      const { data, error } = await supabase
        .from("wishlist")
        .select(`
          id,
          user_id,
          product_id,
          created_at,
          product:products (
            id,
            name,
            slug,
            short_description,
            price,
            original_price,
            stock,
            image_url,
            brand,
            rating,
            reviews_count,
            is_featured,
            is_flash_sale
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Wishlist error:", error);
        toast.error("Unable to load wishlist.");
        setItems([]);
        return;
      }

      const formattedData: WishlistProduct[] =
        ((data as any[]) || []).map((item) => ({
          ...item,
          product: Array.isArray(item.product)
            ? item.product[0] || null
            : item.product || null,
        }));

      setItems(formattedData);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function removeFromWishlist(
    wishlistId: string,
    productName?: string
  ) {
    try {
      setRemovingId(wishlistId);

      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("id", wishlistId);

      if (error) {
        console.error(error);
        toast.error("Failed to remove from wishlist.");
        return;
      }

      setItems((current) =>
        current.filter((item) => item.id !== wishlistId)
      );

      toast.success(
        productName
          ? `${productName} removed from wishlist.`
          : "Removed from wishlist."
      );
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleAddToCart(product: Product) {
    if (product.stock <= 0) {
      toast.error("This product is currently out of stock.");
      return;
    }

    try {
      setAddingId(product.id);

      /*
       * Existing PrimeCart cart helper
       */
      await addToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url,
        quantity: 1,
      } as any);

      toast.success(`${product.name} added to cart.`);
    } catch (error) {
      console.error("Cart error:", error);
      toast.error("Unable to add product to cart.");
    } finally {
      setAddingId(null);
    }
  }

  const validItems = useMemo(
    () => items.filter((item) => item.product),
    [items]
  );

  const totalValue = useMemo(() => {
    return validItems.reduce(
      (total, item) =>
        total + Number(item.product?.price || 0),
      0
    );
  }, [validItems]);

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#eadfca] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfca] bg-white text-[#8b6b25] transition hover:bg-[#fffaf0]"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <h1 className="text-lg font-bold sm:text-xl">
                My Wishlist
              </h1>

              <p className="hidden text-xs text-gray-500 sm:block">
                Products you've saved for later
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/products"
            className="hidden items-center gap-2 rounded-xl bg-[#c9a24d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b8913f] sm:flex"
          >
            <ShoppingCart size={17} />
            Continue Shopping
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Top Section */}
        <section className="mb-6 rounded-2xl border border-[#eadfca] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff5f5] text-[#c95b5b]">
                <Heart
                  size={28}
                  fill="currentColor"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#9b762b]">
                  PrimeCart Wishlist
                </p>

                <h2 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">
                  Saved Products
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Keep your favourite products here and shop
                  them whenever you're ready.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#eadfca] bg-[#fffdf8] px-5 py-3">
                <p className="text-xs text-gray-500">
                  Saved Items
                </p>

                <p className="mt-1 text-xl font-bold">
                  {validItems.length}
                </p>
              </div>

              <div className="rounded-xl border border-[#eadfca] bg-[#fffdf8] px-5 py-3">
                <p className="text-xs text-gray-500">
                  Wishlist Value
                </p>

                <p className="mt-1 text-xl font-bold text-[#9b762b]">
                  {formatPrice(totalValue)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-[#eadfca] bg-white"
              >
                <div className="h-64 bg-gray-200" />

                <div className="space-y-3 p-4">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                  <div className="h-5 w-full rounded bg-gray-200" />
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                  <div className="h-5 w-1/3 rounded bg-gray-200" />
                  <div className="h-10 w-full rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty Wishlist */}
        {!loading && validItems.length === 0 && (
          <div className="rounded-2xl border border-[#eadfca] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#fff5f5] text-[#c95b5b]">
              <HeartOff size={34} />
            </div>

            <h3 className="mt-6 text-2xl font-bold">
              Your wishlist is empty
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You haven't saved any products yet. Explore
              PrimeCart and add products you love to your
              wishlist.
            </p>

            <Link
              href="/dashboard/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#c9a24d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b8913f]"
            >
              Explore Products
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* Wishlist Grid */}
        {!loading && validItems.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {validItems.map((item) => {
              const product = item.product!;

              const image = getImageUrl(product.image_url);

              const discount = getDiscount(
                Number(product.price),
                product.original_price
                  ? Number(product.original_price)
                  : null
              );

              const outOfStock = product.stock <= 0;

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-[#eadfca] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden bg-[#faf9f6]">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-contain p-5 transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <Package size={42} />
                      </div>
                    )}

                    {/* Discount */}
                    {discount > 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-[#c9a24d] px-2.5 py-1 text-xs font-bold text-white">
                        {discount}% OFF
                      </span>
                    )}

                    {/* Flash Sale */}
                    {product.is_flash_sale && (
                      <span className="absolute bottom-3 left-3 rounded-full bg-[#171717] px-2.5 py-1 text-xs font-semibold text-white">
                        Flash Deal
                      </span>
                    )}

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() =>
                        removeFromWishlist(
                          item.id,
                          product.name
                        )
                      }
                      disabled={removingId === item.id}
                      aria-label="Remove from wishlist"
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfca] bg-white/95 text-[#b74c4c] shadow-sm transition hover:bg-[#fff4f4] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  {/* Product Content */}
                  <div className="p-4">
                    {product.brand && (
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#a17c31]">
                        {product.brand}
                      </p>
                    )}

                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="mt-1 block"
                    >
                      <h3 className="line-clamp-2 min-h-[48px] text-base font-bold text-gray-900 transition group-hover:text-[#a17c31]">
                        {product.name}
                      </h3>
                    </Link>

                    {product.short_description && (
                      <p className="mt-1 line-clamp-2 min-h-[40px] text-xs leading-5 text-gray-500">
                        {product.short_description}
                      </p>
                    )}

                    {/* Rating */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-md bg-[#fff8e8] px-2 py-1 text-xs font-semibold text-[#9b762b]">
                        <Star
                          size={13}
                          fill="currentColor"
                        />
                        {Number(product.rating || 0).toFixed(1)}
                      </div>

                      <span className="text-xs text-gray-400">
                        ({product.reviews_count || 0} reviews)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(Number(product.price))}
                      </span>

                      {product.original_price &&
                        Number(product.original_price) >
                          Number(product.price) && (
                          <span className="mb-0.5 text-sm text-gray-400 line-through">
                            {formatPrice(
                              Number(product.original_price)
                            )}
                          </span>
                        )}
                    </div>

                    {/* Stock */}
                    <p
                      className={`mt-2 text-xs font-medium ${
                        outOfStock
                          ? "text-red-600"
                          : product.stock <= 5
                            ? "text-orange-600"
                            : "text-emerald-600"
                      }`}
                    >
                      {outOfStock
                        ? "Out of stock"
                        : product.stock <= 5
                          ? `Only ${product.stock} left`
                          : "In stock"}
                    </p>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        disabled={
                          outOfStock ||
                          addingId === product.id
                        }
                        onClick={() =>
                          handleAddToCart(product)
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-3 py-3 text-sm font-semibold text-white transition hover:bg-[#b8913f] disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        <ShoppingCart size={16} />

                        {addingId === product.id
                          ? "Adding..."
                          : outOfStock
                            ? "Out of Stock"
                            : "Add to Cart"}
                      </button>

                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e5dccb] text-gray-600 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] hover:text-[#9b762b]"
                        aria-label="View product"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && validItems.length > 0 && (
          <div className="mt-8 rounded-2xl border border-[#eadfca] bg-white p-5 sm:p-6">
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <div>
                <h3 className="text-lg font-bold">
                  Looking for something else?
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Discover more products from PrimeCart.
                </p>
              </div>

              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 rounded-xl border border-[#c9a24d] px-5 py-3 text-sm font-semibold text-[#9b762b] transition hover:bg-[#fffaf0]"
              >
                Browse Products
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
