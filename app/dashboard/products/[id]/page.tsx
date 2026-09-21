"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  ChevronRight,
  Clock3,
  Heart,
  ImageOff,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string | null;
  short_description: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  image_url: string | null;
  brand: string | null;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_flash_sale: boolean;
  is_active: boolean;
  created_at: string;
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

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getDiscount(price: number, originalPrice: number | null) {
  if (!originalPrice || originalPrice <= price) return 0;

  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function addToCart(product: Product, quantity: number) {
  try {
    const key = "primecart-cart";

    const existing = localStorage.getItem(key);
    const cart = existing ? JSON.parse(existing) : [];

    const existingIndex = cart.findIndex(
      (item: { product_id?: string; id?: string }) =>
        item.product_id === product.id || item.id === product.id
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity =
        Number(cart[existingIndex].quantity || 1) + quantity;
    } else {
      cart.push({
        id: product.id,
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity,
      });
    }

    localStorage.setItem(key, JSON.stringify(cart));

    window.dispatchEvent(new Event("cart-updated"));

    return true;
  } catch {
    return false;
  }
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const productId = String(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);

  const [cartMessage, setCartMessage] = useState("");
  const [error, setError] = useState("");

  const [relatedScroll, setRelatedScroll] = useState(0);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      setLoading(true);
      setError("");

      const { data, error: productError } = await supabase
        .from("products")
        .select(`
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
        `)
        .eq("id", productId)
        .eq("is_active", true)
        .maybeSingle();

      if (!mounted) return;

      if (productError) {
        console.error(productError);
        setError("Unable to load this product.");
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Product not found.");
        setLoading(false);
        return;
      }

      const currentProduct = data as Product;

      setProduct(currentProduct);

      if (currentProduct.category_id) {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id, name, slug")
          .eq("id", currentProduct.category_id)
          .maybeSingle();

        if (mounted && categoryData) {
          setCategory(categoryData as Category);
        }
      }

      setLoading(false);
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [productId, supabase]);

  useEffect(() => {
    if (!product) return;

    let mounted = true;

    async function loadRelatedProducts() {
      setRelatedLoading(true);

      let query = supabase
        .from("products")
        .select(`
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
        `)
        .eq("is_active", true)
        .neq("id", product.id)
        .limit(12);

      if (product.category_id) {
        query = query.eq("category_id", product.category_id);
      }

      const { data, error: relatedError } = await query;

      if (!mounted) return;

      if (relatedError) {
        console.error(relatedError);
        setRelatedProducts([]);
      } else {
        setRelatedProducts((data || []) as Product[]);
      }

      setRelatedLoading(false);
    }

    loadRelatedProducts();

    return () => {
      mounted = false;
    };
  }, [product, supabase]);

  useEffect(() => {
    async function checkWishlist() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !product) return;

      const { data } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle();

      if (data) {
        setWishlist(true);
      }
    }

    if (product) {
      checkWishlist();
    }
  }, [product, supabase]);

  async function toggleWishlist() {
    if (!product) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (wishlist) {
      const { error: deleteError } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", product.id);

      if (!deleteError) {
        setWishlist(false);
        showMessage("Removed from wishlist");
      }
    } else {
      const { error: insertError } = await supabase
        .from("wishlist")
        .insert({
          user_id: user.id,
          product_id: product.id,
        });

      if (!insertError) {
        setWishlist(true);
        showMessage("Added to wishlist");
      }
    }
  }

  function showMessage(message: string) {
    setCartMessage(message);

    window.setTimeout(() => {
      setCartMessage("");
    }, 2500);
  }

  function handleAddToCart() {
    if (!product || product.stock <= 0) return;

    const success = addToCart(product, quantity);

    if (success) {
      showMessage(
        quantity === 1
          ? "Product added to your cart"
          : `${quantity} items added to your cart`
      );
    }
  }

  function handleBuyNow() {
    if (!product || product.stock <= 0) return;

    addToCart(product, quantity);
    router.push("/dashboard/cart");
  }

  function scrollRelated(direction: "left" | "right") {
    const container = document.getElementById("related-products");

    if (!container) return;

    const amount = 720;

    container.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  }

  const discount = product
    ? getDiscount(product.price, product.original_price)
    : 0;

  const deliveryDate = new Date();

  deliveryDate.setDate(deliveryDate.getDate() + 3);

  const deliveryText = deliveryDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  if (loading) {
    return <ProductLoading />;
  }

  if (!product || error) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-5 py-10 text-[var(--foreground)]">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-center shadow-[0_20px_70px_rgba(151,117,56,0.08)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--gold)]">
              <ImageOff size={28} />
            </div>

            <h1 className="text-2xl font-black">
              Product unavailable
            </h1>

            <p className="mt-2 text-sm text-[var(--foreground)]/55">
              {error || "This product could not be found."}
            </p>

            <Link
              href="/dashboard/products"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--gold-dark)]"
            >
              Browse Products
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const imageUrl = getImageUrl(product.image_url);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Toast */}
      {cartMessage && (
        <div className="fixed right-5 top-5 z-[100] animate-[slideDown_.35s_ease-out]">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gold)] text-white">
              <Check size={16} />
            </div>

            <span className="text-sm font-bold">
              {cartMessage}
            </span>

            <button
              onClick={() => setCartMessage("")}
              className="ml-2 text-[var(--foreground)]/35 transition hover:text-[var(--foreground)]"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Top navigation */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex max-w-[1500px] items-center gap-2 px-5 py-4 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--foreground)]/60 transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <ChevronRight
            size={15}
            className="text-[var(--foreground)]/25"
          />

          <Link
            href="/dashboard/products"
            className="text-sm font-semibold text-[var(--foreground)]/55 transition hover:text-[var(--gold-dark)]"
          >
            Products
          </Link>

          {category && (
            <>
              <ChevronRight
                size={15}
                className="text-[var(--foreground)]/25"
              />

              <span className="text-sm font-semibold text-[var(--gold-dark)]">
                {category.name}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8 lg:py-10">
        {/* Main product area */}
        <section className="grid gap-7 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,.9fr)]">
          {/* Product image */}
          <div className="rounded-[30px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_20px_70px_rgba(151,117,56,0.06)] lg:p-7">
            <div className="relative overflow-hidden rounded-[24px] bg-[var(--muted)]">
              {product.is_flash_sale && (
                <div className="absolute left-5 top-5 z-10 flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-3 py-1.5 text-xs font-black text-white shadow-lg">
                  <Zap size={13} fill="currentColor" />
                  FLASH DEAL
                </div>
              )}

              <button
                onClick={toggleWishlist}
                aria-label="Wishlist"
                className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]/90 text-[var(--gold)] shadow-lg backdrop-blur transition hover:scale-105"
              >
                <Heart
                  size={20}
                  fill={wishlist ? "currentColor" : "none"}
                />
              </button>

              <div className="relative flex min-h-[420px] items-center justify-center p-10 sm:min-h-[520px] lg:min-h-[610px]">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    priority
                    unoptimized
                    className="object-contain p-8 transition duration-500 hover:scale-[1.04] sm:p-14"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-[var(--foreground)]/30">
                    <ImageOff size={60} />
                    <span className="text-sm font-semibold">
                      Image unavailable
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Trust strip */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <TrustItem
                icon={<Truck size={18} />}
                title="Fast Delivery"
              />

              <TrustItem
                icon={<RotateCcw size={18} />}
                title="Easy Returns"
              />

              <TrustItem
                icon={<ShieldCheck size={18} />}
                title="Secure Buy"
              />

              <TrustItem
                icon={<BadgeCheck size={18} />}
                title="Quality Assured"
              />
            </div>
          </div>

          {/* Product information / buy box */}
          <div className="space-y-5">
            <div className="rounded-[30px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_20px_70px_rgba(151,117,56,0.06)] lg:p-8">
              {category && (
                <Link
                  href={`/dashboard/categories/${category.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[var(--gold-dark)] transition hover:bg-[var(--gold)] hover:text-white"
                >
                  {category.name}
                  <ArrowRight size={12} />
                </Link>
              )}

              <div className="mt-5 flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--foreground)]/35">
                    {product.brand || "PrimeCart Collection"}
                  </p>

                  <h1 className="mt-2 text-2xl font-black leading-tight tracking-[-0.03em] sm:text-3xl lg:text-[38px]">
                    {product.name}
                  </h1>
                </div>
              </div>

              {product.short_description && (
                <p className="mt-4 text-[15px] leading-7 text-[var(--foreground)]/60">
                  {product.short_description}
                </p>
              )}

              {/* Rating */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-lg bg-[var(--gold)] px-2.5 py-1.5 text-white">
                  <span className="text-sm font-black">
                    {Number(product.rating || 0).toFixed(1)}
                  </span>

                  <Star size={14} fill="currentColor" />
                </div>

                <span className="text-sm font-semibold text-[var(--foreground)]/50">
                  {Number(product.reviews_count || 0).toLocaleString(
                    "en-IN"
                  )}{" "}
                  ratings
                </span>

                <span className="h-4 w-px bg-[var(--border)]" />

                <span className="text-sm font-bold text-[var(--gold-dark)]">
                  {product.is_featured
                    ? "Featured Product"
                    : "PrimeCart Pick"}
                </span>
              </div>

              <div className="my-7 h-px bg-[var(--border)]" />

              {/* Price */}
              <div>
                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-4xl font-black tracking-tight">
                    {formatPrice(product.price)}
                  </span>

                  {product.original_price &&
                    product.original_price > product.price && (
                      <span className="pb-1 text-base text-[var(--foreground)]/35 line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}

                  {discount > 0 && (
                    <span className="mb-1 rounded-lg bg-[var(--gold)]/10 px-2 py-1 text-sm font-black text-[var(--gold-dark)]">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {discount > 0 && (
                  <p className="mt-2 text-sm font-semibold text-[var(--gold-dark)]">
                    Limited-time PrimeCart price
                  </p>
                )}
              </div>

              {/* Stock */}
              <div className="mt-6">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="font-bold text-emerald-600">
                      In Stock
                    </span>

                    {product.stock <= 10 && (
                      <span className="text-[var(--foreground)]/45">
                        — Only {product.stock} left
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm font-bold text-red-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    Currently unavailable
                  </div>
                )}
              </div>

              {/* Delivery */}
              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-4">
                <div className="flex items-start gap-3">
                  <Truck
                    size={20}
                    className="mt-0.5 shrink-0 text-[var(--gold)]"
                  />

                  <div>
                    <p className="text-sm font-black">
                      Free delivery
                    </p>

                    <p className="mt-1 text-sm text-[var(--foreground)]/55">
                      Get it by{" "}
                      <span className="font-bold text-[var(--foreground)]">
                        {deliveryText}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-black">Quantity</span>

                <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--card)]">
                  <button
                    disabled={quantity <= 1}
                    onClick={() =>
                      setQuantity((value) => Math.max(1, value - 1))
                    }
                    className="flex h-10 w-10 items-center justify-center text-[var(--foreground)]/55 transition hover:text-[var(--gold-dark)] disabled:opacity-30"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="w-10 text-center text-sm font-black">
                    {quantity}
                  </span>

                  <button
                    disabled={
                      product.stock <= 0 ||
                      quantity >= product.stock
                    }
                    onClick={() =>
                      setQuantity((value) =>
                        Math.min(product.stock, value + 1)
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center text-[var(--foreground)]/55 transition hover:text-[var(--gold-dark)] disabled:opacity-30"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  disabled={product.stock <= 0}
                  onClick={handleAddToCart}
                  className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-[var(--gold)] bg-[var(--gold)]/10 text-sm font-black text-[var(--gold-dark)] transition hover:bg-[var(--gold)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ShoppingCart size={19} />
                  Add to Cart
                </button>

                <button
                  disabled={product.stock <= 0}
                  onClick={handleBuyNow}
                  className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[var(--gold)] text-sm font-black text-white shadow-[0_12px_30px_rgba(185,151,91,0.25)] transition hover:bg-[var(--gold-dark)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ShoppingBag size={19} />
                  Buy Now
                </button>
              </div>

              <button
                onClick={toggleWishlist}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] text-sm font-bold text-[var(--foreground)]/65 transition hover:border-[var(--gold)] hover:text-[var(--gold-dark)]"
              >
                <Heart
                  size={18}
                  fill={wishlist ? "currentColor" : "none"}
                />
                {wishlist
                  ? "Remove from Wishlist"
                  : "Add to Wishlist"}
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <BenefitCard
                icon={<ShieldCheck />}
                title="Secure Payments"
                text="Your payment information is protected."
              />

              <BenefitCard
                icon={<RotateCcw />}
                title="Easy Returns"
                text="Simple returns on eligible products."
              />

              <BenefitCard
                icon={<Clock3 />}
                title="PrimeCart Support"
                text="We're here when you need help."
              />
            </div>
          </div>
        </section>

        {/* Product highlights */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 lg:p-8">
            <SectionHeading
              eyebrow="PRODUCT INFORMATION"
              title="About this product"
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoRow
                label="Brand"
                value={product.brand || "PrimeCart"}
              />

              <InfoRow
                label="Category"
                value={category?.name || "General"}
              />

              <InfoRow
                label="Availability"
                value={
                  product.stock > 0 ? "In Stock" : "Out of Stock"
                }
              />

              <InfoRow
                label="Customer Rating"
                value={`${Number(product.rating || 0).toFixed(1)} / 5`}
              />
            </div>

            {product.description && (
              <div className="mt-7 border-t border-[var(--border)] pt-7">
                <h3 className="text-base font-black">
                  Product Description
                </h3>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--foreground)]/60">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 lg:p-8">
            <SectionHeading
              eyebrow="PRIMECART PROMISE"
              title="Shop with confidence"
            />

            <div className="mt-6 space-y-5">
              <PromiseItem
                icon={<Truck />}
                title="Reliable Delivery"
                text="Fast and carefully handled delivery."
              />

              <PromiseItem
                icon={<ShieldCheck />}
                title="Secure Checkout"
                text="Protected payment experience."
              />

              <PromiseItem
                icon={<RotateCcw />}
                title="Easy Returns"
                text="Hassle-free eligible returns."
              />

              <PromiseItem
                icon={<BadgeCheck />}
                title="Verified Product Info"
                text="Details are sourced from your catalog."
              />
            </div>
          </div>
        </section>

        {/* Related products */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gold-dark)]">
                KEEP EXPLORING
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Related products
              </h2>

              <p className="mt-1 text-sm text-[var(--foreground)]/50">
                More products from{" "}
                <span className="font-bold">
                  {category?.name || "this collection"}
                </span>
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                onClick={() => scrollRelated("left")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]/60 transition hover:border-[var(--gold)] hover:text-[var(--gold-dark)]"
              >
                <ArrowLeft size={17} />
              </button>

              <button
                onClick={() => scrollRelated("right")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]/60 transition hover:border-[var(--gold)] hover:text-[var(--gold-dark)]"
              >
                <ArrowRight size={17} />
              </button>
            </div>
          </div>

          {relatedLoading ? (
            <RelatedSkeleton />
          ) : relatedProducts.length > 0 ? (
            <div
              id="related-products"
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {relatedProducts.map((relatedProduct, index) => (
                <RelatedProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
              <Sparkles
                size={28}
                className="mx-auto text-[var(--gold)]"
              />

              <h3 className="mt-3 font-black">
                More products coming soon
              </h3>

              <p className="mt-1 text-sm text-[var(--foreground)]/50">
                We don't have more products in this category yet.
              </p>
            </div>
          )}
        </section>

        {/* Bottom CTA */}
        <section className="mt-10 overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--card)]">
          <div className="relative p-7 sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--gold)]/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2 text-[var(--gold-dark)]">
                  <Sparkles size={18} />
                  <span className="text-xs font-black uppercase tracking-[0.18em]">
                    PrimeCart Shopping
                  </span>
                </div>

                <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                  Find something else you'll love.
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--foreground)]/50">
                  Explore more products, categories and exclusive
                  PrimeCart deals.
                </p>
              </div>

              <Link
                href="/dashboard/products"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[var(--gold)] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[var(--gold-dark)]"
              >
                Browse All Products
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes productFade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .product-card-animation {
          animation: productFade 0.45s ease both;
        }
      `}</style>
    </main>
  );
}

/* ---------------------------------------------------------
   Components
--------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gold-dark)]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-xl font-black tracking-tight">
        {title}
      </h2>
    </div>
  );
}

function TrustItem({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl bg-[var(--muted)] px-3 py-3 text-center">
      <span className="text-[var(--gold)]">{icon}</span>

      <span className="text-xs font-bold text-[var(--foreground)]/65">
        {title}
      </span>
    </div>
  );
}

function BenefitCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold-dark)]">
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-black">{title}</h3>

          <p className="mt-1 text-xs leading-5 text-[var(--foreground)]/50">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[var(--muted)] px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/35">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}

function PromiseItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold-dark)]">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-black">{title}</h3>

        <p className="mt-1 text-xs leading-5 text-[var(--foreground)]/50">
          {text}
        </p>
      </div>
    </div>
  );
}

function RelatedProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const imageUrl = getImageUrl(product.image_url);

  const discount = getDiscount(
    product.price,
    product.original_price
  );

  return (
    <Link
      href={`/dashboard/products/${product.id}`}
      className="product-card-animation group w-[255px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition duration-300 hover:-translate-y-1 hover:border-[var(--gold)] hover:shadow-[0_18px_45px_rgba(151,117,56,0.13)] sm:w-[285px]"
      style={{
        animationDelay: `${index * 70}ms`,
      }}
    >
      {/* Image */}
      <div className="relative h-[245px] overflow-hidden bg-[var(--muted)]">
        {product.is_flash_sale && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-[var(--gold)] px-2.5 py-1 text-[10px] font-black text-white">
            <Zap size={11} fill="currentColor" />
            DEAL
          </div>
        )}

        {discount > 0 && !product.is_flash_sale && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-[var(--gold)]/10 px-2.5 py-1 text-[10px] font-black text-[var(--gold-dark)]">
            {discount}% OFF
          </div>
        )}

        <div className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]/90 text-[var(--foreground)]/50 backdrop-blur transition group-hover:text-[var(--gold-dark)]">
          <Heart size={16} />
        </div>

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            unoptimized
            className="object-contain p-7 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--foreground)]/25">
            <ImageOff size={40} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-[var(--gold-dark)]">
          {product.brand || "PrimeCart"}
        </p>

        <h3 className="mt-1.5 line-clamp-2 min-h-[42px] text-sm font-black leading-5">
          {product.name}
        </h3>

        <div className="mt-3 flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-md bg-[var(--gold)] px-1.5 py-1 text-[10px] font-black text-white">
            {Number(product.rating || 0).toFixed(1)}
            <Star size={10} fill="currentColor" />
          </span>

          <span className="text-[11px] text-[var(--foreground)]/40">
            {product.reviews_count || 0} reviews
          </span>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-lg font-black">
            {formatPrice(product.price)}
          </span>

          {product.original_price &&
            product.original_price > product.price && (
              <span className="pb-0.5 text-xs text-[var(--foreground)]/30 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
          <Truck size={13} />
          Free delivery
        </div>
      </div>
    </Link>
  );
}

function RelatedSkeleton() {
  return (
    <div className="flex gap-5 overflow-hidden">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="w-[255px] shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] sm:w-[285px]"
        >
          <div className="h-[245px] animate-pulse bg-[var(--muted)]" />

          <div className="space-y-3 p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-[var(--muted)]" />

            <div className="h-5 w-full animate-pulse rounded bg-[var(--muted)]" />

            <div className="h-5 w-24 animate-pulse rounded bg-[var(--muted)]" />

            <div className="h-6 w-28 animate-pulse rounded bg-[var(--muted)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductLoading() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-5 text-[var(--foreground)] lg:p-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 h-8 w-48 animate-pulse rounded-xl bg-[var(--muted)]" />

        <div className="grid gap-7 xl:grid-cols-[1.1fr_.9fr]">
          <div className="min-h-[600px] animate-pulse rounded-[30px] bg-[var(--muted)]" />

          <div className="space-y-5">
            <div className="h-[600px] animate-pulse rounded-[30px] bg-[var(--muted)]" />

            <div className="h-32 animate-pulse rounded-2xl bg-[var(--muted)]" />
          </div>
        </div>
      </div>
    </main>
  );
}
