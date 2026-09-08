"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Loader2,
  Check,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Category = {
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  stock: number | null;
  image_url: string | null;
  brand: string | null;
  rating: number | null;
  reviews_count: number | null;
  category_id: string | null;
  categories: Category | Category[] | null;
};

export default function ProductDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const supabase = createClient();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  async function fetchProduct() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
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
        category_id,
        categories (
          name,
          slug
        )
      `
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error(error);
      setError(error.message);
      setProduct(null);
    } else {
      setProduct(data as Product);
    }

    setLoading(false);
  }

  function getCategoryName() {
    if (!product?.categories) return "Product";

    if (Array.isArray(product.categories)) {
      return product.categories[0]?.name || "Product";
    }

    return product.categories.name || "Product";
  }

  function getDiscount() {
    if (
      !product?.original_price ||
      product.original_price <= product.price
    ) {
      return 0;
    }

    return Math.round(
      ((product.original_price - product.price) /
        product.original_price) *
        100
    );
  }

  function increaseQuantity() {
    if (!product?.stock) return;

    setQuantity((current) =>
      Math.min(current + 1, product.stock as number)
    );
  }

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function addToCart() {
    if (!product || !product.stock || product.stock <= 0) return;

    const existingCart = JSON.parse(
      localStorage.getItem("primecart-cart") || "[]"
    );

    const existingItem = existingCart.find(
      (item: { id: string }) => item.id === product.id
    );

    let updatedCart;

    if (existingItem) {
      updatedCart = existingCart.map(
        (item: { id: string; quantity: number }) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + quantity,
                  product.stock as number
                ),
              }
            : item
      );
    } else {
      updatedCart = [
        ...existingCart,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image_url: product.image_url,
          quantity,
        },
      ];
    }

    localStorage.setItem(
      "primecart-cart",
      JSON.stringify(updatedCart)
    );

    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 2500);
  }

  function buyNow() {
    addToCart();

    setTimeout(() => {
      window.location.href = "/cart";
    }, 300);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 size={25} className="animate-spin" />
          Loading product...
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-xl rounded-3xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <ShoppingCart size={28} className="text-gray-400" />
          </div>

          <h1 className="text-2xl font-bold">
            Product not found
          </h1>

          <p className="mt-2 text-gray-500">
            This product may have been removed or is no longer available.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft size={17} />
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  const discount = getDiscount();

  const outOfStock = !product.stock || product.stock <= 0;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Announcement */}
      <div className="bg-gray-950 px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        Free delivery on orders above ₹999
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold"
          >
            <span className="rounded-xl bg-black px-3 py-2 text-white">
              P
            </span>
            <span>PrimeCart</span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/products"
              className="hidden rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-100 sm:block"
            >
              Products
            </Link>

            <button
              onClick={() => setWishlist(!wishlist)}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                wishlist
                  ? "bg-red-50 text-red-500"
                  : "hover:bg-gray-100"
              }`}
            >
              <Heart
                size={20}
                fill={wishlist ? "currentColor" : "none"}
              />
            </button>

            <Link
              href="/cart"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
            >
              <ShoppingCart size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-black">
            Home
          </Link>

          <span>/</span>

          <Link href="/products" className="hover:text-black">
            Products
          </Link>

          <span>/</span>

          <span className="font-medium text-gray-900">
            {product.name}
          </span>
        </div>

        {/* Product */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div>
            <div className="relative overflow-hidden rounded-3xl bg-white">
              <div className="aspect-square">
                <img
                  src={
                    product.image_url ||
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80"
                  }
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {discount > 0 && (
                <span className="absolute left-5 top-5 rounded-full bg-black px-4 py-2 text-sm font-bold text-white">
                  {discount}% OFF
                </span>
              )}

              <button
                onClick={() => setWishlist(!wishlist)}
                className={`absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md ${
                  wishlist ? "text-red-500" : "text-gray-700"
                }`}
              >
                <Heart
                  size={22}
                  fill={wishlist ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {/* Category */}
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              {getCategoryName()}
            </p>

            {/* Brand */}
            {product.brand && (
              <p className="mt-3 text-sm font-medium text-gray-500">
                {product.brand}
              </p>
            )}

            {/* Name */}
            <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {product.name}
            </h1>

            {/* Short Description */}
            {product.short_description && (
              <p className="mt-4 text-base leading-7 text-gray-600">
                {product.short_description}
              </p>
            )}

            {/* Rating */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1 text-sm font-semibold text-white">
                <span>
                  {(product.rating || 0).toFixed(1)}
                </span>

                <Star size={14} fill="currentColor" />
              </div>

              <span className="text-sm text-gray-500">
                {product.reviews_count || 0} Reviews
              </span>
            </div>

            <div className="my-7 border-t" />

            {/* Price */}
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-4xl font-bold">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>

              {product.original_price &&
                product.original_price > product.price && (
                  <>
                    <span className="mb-1 text-lg text-gray-400 line-through">
                      ₹
                      {Number(
                        product.original_price
                      ).toLocaleString("en-IN")}
                    </span>

                    <span className="mb-1 text-sm font-bold text-green-600">
                      {discount}% off
                    </span>
                  </>
                )}
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Inclusive of all taxes
            </p>

            {/* Stock */}
            <div className="mt-6">
              {outOfStock ? (
                <div className="inline-flex rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                  Out of Stock
                </div>
              ) : product.stock! < 10 ? (
                <div className="inline-flex rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
                  Only {product.stock} left in stock
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-600">
                  <Check size={16} />
                  In Stock
                </div>
              )}
            </div>

            {/* Quantity */}
            {!outOfStock && (
              <div className="mt-7">
                <p className="mb-3 text-sm font-semibold">
                  Quantity
                </p>

                <div className="flex h-12 w-fit items-center overflow-hidden rounded-xl border bg-white">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="flex h-full w-12 items-center justify-center hover:bg-gray-100 disabled:opacity-30"
                  >
                    <Minus size={17} />
                  </button>

                  <span className="flex w-12 justify-center font-semibold">
                    {quantity}
                  </span>

                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock!}
                    className="flex h-full w-12 items-center justify-center hover:bg-gray-100 disabled:opacity-30"
                  >
                    <Plus size={17} />
                  </button>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                onClick={addToCart}
                disabled={outOfStock}
                className={`flex items-center justify-center gap-2 rounded-xl py-4 font-semibold transition ${
                  outOfStock
                    ? "cursor-not-allowed bg-gray-200 text-gray-400"
                    : addedToCart
                    ? "bg-green-600 text-white"
                    : "border border-black bg-white text-black hover:bg-gray-100"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check size={19} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={19} />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={buyNow}
                disabled={outOfStock}
                className={`rounded-xl py-4 font-semibold transition ${
                  outOfStock
                    ? "cursor-not-allowed bg-gray-200 text-gray-400"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                Buy Now
              </button>
            </div>

            {/* Benefits */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-white p-4">
                <Truck size={22} />
                <p className="mt-3 text-sm font-semibold">
                  Fast Delivery
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Quick doorstep delivery
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-4">
                <ShieldCheck size={22} />
                <p className="mt-3 text-sm font-semibold">
                  Secure Payment
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  100% secure checkout
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-4">
                <RotateCcw size={22} />
                <p className="mt-3 text-sm font-semibold">
                  Easy Returns
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Simple return policy
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <section className="mt-16 rounded-3xl border bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold">
            Product Description
          </h2>

          <div className="mt-5 leading-8 text-gray-600">
            {product.description ? (
              <p className="whitespace-pre-line">
                {product.description}
              </p>
            ) : (
              <p>
                Experience quality and convenience with{" "}
                {product.name}. This product is carefully selected
                for PrimeCart customers.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-10 border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-8 text-sm text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} PrimeCart</p>

          <div className="flex gap-5">
            <Link href="/" className="hover:text-black">
              Home
            </Link>

            <Link href="/products" className="hover:text-black">
              Products
            </Link>

            <Link href="/cart" className="hover:text-black">
              Cart
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
