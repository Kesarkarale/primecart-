"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Heart,
  ImageOff,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  X,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

/* =========================================================
   TYPES
========================================================= */

type Product = {
  id: string;
  name: string;
  slug: string;
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
  category_id: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

/* =========================================================
   HELPERS
========================================================= */

function getImageUrl(value: string | null) {
  if (!value) return null;

  const image = value.trim();

  if (!image) return null;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/")
  ) {
    return image;
  }

  return `/${image}`;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getDiscount(price: number, original: number | null) {
  if (!original || original <= price) return 0;

  return Math.round(((original - price) / original) * 100);
}

function getSavings(price: number, original: number | null) {
  if (!original || original <= price) return 0;

  return original - price;
}

/* =========================================================
   RELATED PRODUCT CARD
========================================================= */

function RelatedProductCard({
  product,
}: {
  product: Product;
}) {
  const image = getImageUrl(product.image_url);

  const discount = getDiscount(
    Number(product.price),
    product.original_price
      ? Number(product.original_price)
      : null,
  );

  return (
    <Link
      href={`/dashboard/products/${product.id}`}
      className="group overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/40 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--muted)]">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 220px"
            className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--foreground)]/25">
            <ImageOff size={38} />
          </div>
        )}

        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--foreground)] px-2.5 py-1 text-[9px] font-black text-[var(--background)]">
            {discount}% OFF
          </span>
        )}

        {product.is_flash_sale && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-[var(--gold)] px-2.5 py-1 text-[9px] font-black text-white">
            <Zap size={10} fill="currentColor" />
            DEAL
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="truncate text-[9px] font-black uppercase tracking-[0.16em] text-[var(--foreground)]/40">
          {product.brand || "PrimeCart"}
        </p>

        <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-black leading-5">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--gold)] px-1.5 py-0.5 text-[10px] font-black text-white">
            {Number(product.rating || 0).toFixed(1)}
            <Star size={9} fill="currentColor" />
          </span>

          <span className="text-[10px] text-[var(--foreground)]/40">
            {product.reviews_count || 0} reviews
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-base font-black">
            {formatPrice(Number(product.price))}
          </span>

          {product.original_price &&
            Number(product.original_price) >
              Number(product.price) && (
              <span className="text-[10px] text-[var(--foreground)]/35 line-through">
                {formatPrice(Number(product.original_price))}
              </span>
            )}
        </div>

        <div className="mt-3 flex items-center gap-1 text-[10px] font-black text-[var(--gold-dark)]">
          View product
          <ArrowRight
            size={12}
            className="transition-transform group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const productId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [product, setProduct] = useState<Product | null>(
    null,
  );

  const [category, setCategory] = useState<Category | null>(
    null,
  );

  const [relatedProducts, setRelatedProducts] = useState<
    Product[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  const [cartMessage, setCartMessage] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  /* =======================================================
     LOAD PRODUCT
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      if (!productId) {
        setError("Product not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        setProduct(null);
        setCategory(null);
        setRelatedProducts([]);
        setWishlist(false);
        setQuantity(1);
        setActiveImage(0);

        const { data, error: productError } =
          await supabase
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
              is_featured,
              is_flash_sale,
              is_active,
              category_id
            `,
            )
            .eq("id", productId)
            .eq("is_active", true)
            .maybeSingle();

        if (productError) {
          throw productError;
        }

        if (!data) {
          if (mounted) {
            setError("This product is no longer available.");
            setLoading(false);
          }

          return;
        }

        const currentProduct = data as Product;

        if (!mounted) return;

        setProduct(currentProduct);

        if (currentProduct.category_id) {
          const { data: categoryData } =
            await supabase
              .from("categories")
              .select("id,name,slug")
              .eq("id", currentProduct.category_id)
              .maybeSingle();

          if (mounted && categoryData) {
            setCategory(categoryData as Category);
          }
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: wishlistData } =
            await supabase
              .from("wishlist")
              .select("id")
              .eq("user_id", user.id)
              .eq("product_id", currentProduct.id)
              .maybeSingle();

          if (mounted) {
            setWishlist(Boolean(wishlistData));
          }
        }
      } catch (err) {
        console.error("Product detail error:", err);

        if (mounted) {
          setError("Unable to load this product.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [productId, supabase]);

  /* =======================================================
     RELATED PRODUCTS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadRelated() {
      if (!product?.category_id) {
        setRelatedLoading(false);
        return;
      }

      try {
        setRelatedLoading(true);

        const { data, error: relatedError } =
          await supabase
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
              is_featured,
              is_flash_sale,
              is_active,
              category_id
            `,
            )
            .eq("category_id", product.category_id)
            .eq("is_active", true)
            .neq("id", product.id)
            .order("is_featured", {
              ascending: false,
            })
            .order("rating", {
              ascending: false,
            })
            .limit(8);

        if (relatedError) {
          throw relatedError;
        }

        if (mounted) {
          setRelatedProducts((data ?? []) as Product[]);
        }
      } catch (err) {
        console.error("Related products error:", err);

        if (mounted) {
          setRelatedProducts([]);
        }
      } finally {
        if (mounted) {
          setRelatedLoading(false);
        }
      }
    }

    loadRelated();

    return () => {
      mounted = false;
    };
  }, [product, supabase]);

  /* =======================================================
     IMPORTANT NULL GUARD
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-5 w-28 animate-pulse rounded bg-[var(--muted)]" />

          <div className="mt-7 grid gap-7 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="aspect-square animate-pulse rounded-[28px] bg-[var(--muted)]" />

            <div className="space-y-4">
              <div className="h-4 w-32 animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-12 w-full animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-5 w-44 animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-24 w-full animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-14 w-full animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-14 w-full animate-pulse rounded bg-[var(--muted)]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5">
        <div className="w-full max-w-md rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--gold)]">
            <ShoppingBag size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Product unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]/50">
            {error || "We could not find this product."}
          </p>

          <Link
            href="/dashboard/products"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-5 py-3 text-xs font-black text-white"
          >
            <ArrowLeft size={15} />
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  /* =======================================================
     DERIVED VALUES
  ======================================================= */

  const discount = getDiscount(
    Number(product.price),
    product.original_price
      ? Number(product.original_price)
      : null,
  );

  const savings = getSavings(
    Number(product.price),
    product.original_price
      ? Number(product.original_price)
      : null,
  );

  const image = getImageUrl(product.image_url);

  const maxQuantity = Math.max(
    1,
    Math.min(Number(product.stock), 10),
  );

  /* =======================================================
     CART
  ======================================================= */

  function addToCart() {
    try {
      const saved = localStorage.getItem("primecart-cart");

      let items: {
        id: string;
        name: string;
        price: number;
        image_url: string | null;
        quantity: number;
      }[] = [];

      if (saved) {
        try {
          const parsed = JSON.parse(saved);

          if (Array.isArray(parsed)) {
            items = parsed;
          }
        } catch {
          items = [];
        }
      }

      const existing = items.find(
        (item) => item.id === product.id,
      );

      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + quantity,
          maxQuantity,
        );
      } else {
        items.push({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image_url: product.image_url,
          quantity,
        });
      }

      localStorage.setItem(
        "primecart-cart",
        JSON.stringify(items),
      );

      window.dispatchEvent(new Event("cart-updated"));

      setCartMessage("Added to cart");

      window.setTimeout(() => {
        setCartMessage("");
      }, 2200);
    } catch (err) {
      console.error("Cart error:", err);
    }
  }

  /* =======================================================
     WISHLIST
  ======================================================= */

  async function toggleWishlist() {
    try {
      setWishlistLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      if (wishlist) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", product.id);

        if (error) throw error;

        setWishlist(false);
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: product.id,
          });

        if (error) throw error;

        setWishlist(true);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    } finally {
      setWishlistLoading(false);
    }
  }

  /* =======================================================
     SHARE
  ======================================================= */

  async function shareProduct() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text:
            product.short_description ||
            `Check out ${product.name} on PrimeCart.`,
          url,
        });

        setShareMessage("Shared successfully");
      } else {
        await navigator.clipboard.writeText(url);
        setShareMessage("Product link copied");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setShareMessage("Product link copied");
      } catch {
        setShareMessage("Unable to share");
      }
    }

    window.setTimeout(() => {
      setShareMessage("");
    }, 2000);
  }

  /* =======================================================
     BUY NOW
  ======================================================= */

  function buyNow() {
    if (product.stock <= 0) return;

    addToCart();

    window.setTimeout(() => {
      router.push("/dashboard");
    }, 300);
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard/products"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] transition hover:border-[var(--gold)] hover:text-[var(--gold-dark)]"
            >
              <ArrowLeft size={18} />
            </Link>

            <Link
              href="/dashboard"
              className="hidden items-center gap-2 sm:flex"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--foreground)] text-[var(--background)]">
                <ShoppingBag size={17} />
              </div>

              <span className="text-lg font-black">
                Prime<span className="text-[var(--gold)]">Cart</span>
              </span>
            </Link>

            <div className="hidden h-5 w-px bg-[var(--border)] sm:block" />

            <span className="truncate text-xs font-bold text-[var(--foreground)]/45">
              Product Details
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/wishlist"
              className="hidden h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-xs font-black sm:flex"
            >
              <Heart size={16} />
              Wishlist
            </Link>

            <Link
              href="/dashboard/products"
              className="flex h-10 items-center gap-2 rounded-xl bg-[var(--gold)] px-4 text-xs font-black text-white transition hover:bg-[var(--gold-dark)]"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:block">
                Continue Shopping
              </span>
              <span className="sm:hidden">Shop</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ===================================================
          PAGE
      =================================================== */}

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-5 sm:px-6 lg:px-8">
        {/* Breadcrumb */}

        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-[var(--foreground)]/40">
          <Link
            href="/dashboard"
            className="hover:text-[var(--gold-dark)]"
          >
            Home
          </Link>

          <ChevronRight size={12} />

          <Link
            href="/dashboard/products"
            className="hover:text-[var(--gold-dark)]"
          >
            Products
          </Link>

          {category && (
            <>
              <ChevronRight size={12} />

              <Link
                href={`/dashboard/categories/${category.slug}`}
                className="hover:text-[var(--gold-dark)]"
              >
                {category.name}
              </Link>
            </>
          )}

          <ChevronRight size={12} />

          <span className="max-w-[220px] truncate text-[var(--foreground)]/60">
            {product.name}
          </span>
        </nav>

        {/* =================================================
            PRODUCT AREA
        ================================================= */}

        <section className="grid items-start gap-7 lg:grid-cols-[1.04fr_0.96fr]">
          {/* =================================================
              LEFT / GALLERY
          ================================================= */}

          <div className="lg:sticky lg:top-[88px]">
            <div className="grid gap-3 sm:grid-cols-[82px_1fr]">
              {/* Thumbnail */}

              <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col">
                <button
                  onClick={() => setActiveImage(0)}
                  className={`relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border-2 bg-[var(--muted)] transition ${
                    activeImage === 0
                      ? "border-[var(--gold)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      sizes="68px"
                      className="object-contain p-2"
                    />
                  ) : (
                    <ImageOff className="m-auto mt-5" size={20} />
                  )}
                </button>

                {product.is_featured && (
                  <div className="hidden h-[68px] w-[68px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--muted)] sm:flex">
                    <Sparkles
                      size={20}
                      className="text-[var(--gold)]"
                    />
                  </div>
                )}

                <div className="hidden h-[68px] w-[68px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--muted)] sm:flex">
                  <BadgeCheck
                    size={20}
                    className="text-emerald-500"
                  />
                </div>
              </div>

              {/* Main image */}

              <div className="order-1 sm:order-2">
                <div className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
                  {/* Badges */}

                  <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
                    {product.is_featured && (
                      <span className="flex items-center gap-1.5 rounded-full bg-[var(--foreground)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--background)]">
                        <BadgeCheck size={12} />
                        Featured
                      </span>
                    )}

                    {product.is_flash_sale && (
                      <span className="flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white">
                        <Zap size={11} fill="currentColor" />
                        Flash Deal
                      </span>
                    )}
                  </div>

                  {/* Wishlist */}

                  <button
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                    className={`absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border bg-[var(--card)]/90 backdrop-blur transition ${
                      wishlist
                        ? "border-red-200 text-red-500"
                        : "border-[var(--border)] text-[var(--foreground)]/50 hover:border-[var(--gold)] hover:text-[var(--gold-dark)]"
                    }`}
                  >
                    <Heart
                      size={19}
                      fill={
                        wishlist
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>

                  {/* Product */}

                  <div className="relative aspect-square min-h-[360px] bg-[var(--muted)] sm:min-h-[510px]">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        priority
                        sizes="(max-width:1024px) 100vw, 55vw"
                        className="object-contain p-8 sm:p-14 lg:p-16"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center text-[var(--foreground)]/25">
                          <ImageOff
                            size={52}
                            className="mx-auto"
                          />
                          <p className="mt-3 text-xs font-bold">
                            Image unavailable
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Bottom image info */}

                    <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                      <span className="rounded-full border border-[var(--border)] bg-[var(--card)]/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider backdrop-blur">
                        Genuine Product
                      </span>

                      <button
                        onClick={shareProduct}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur transition hover:border-[var(--gold)] hover:text-[var(--gold-dark)]"
                      >
                        <Share2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>

                {shareMessage && (
                  <div className="mt-3 rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 px-4 py-3 text-center text-xs font-black text-[var(--gold-dark)]">
                    {shareMessage}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT / PURCHASE PANEL
          ================================================= */}

          <div className="lg:sticky lg:top-[88px]">
            <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-7">
              {/* Brand */}

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gold-dark)]">
                  {product.brand || "PrimeCart Exclusive"}
                </span>

                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black text-emerald-600">
                  <BadgeCheck size={11} />
                  Verified
                </span>
              </div>

              {/* Title */}

              <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                {product.name}
              </h1>

              {/* Description */}

              {product.short_description && (
                <p className="mt-3 text-sm leading-6 text-[var(--foreground)]/55">
                  {product.short_description}
                </p>
              )}

              {/* Rating */}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-lg bg-[var(--gold)] px-2.5 py-1.5 text-xs font-black text-white">
                  {Number(product.rating || 0).toFixed(1)}
                  <Star size={12} fill="currentColor" />
                </span>

                <span className="text-xs font-bold text-[var(--foreground)]/50">
                  {product.reviews_count || 0} ratings
                </span>

                <span className="h-4 w-px bg-[var(--border)]" />

                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/35">
                  PrimeCart Verified
                </span>
              </div>

              <div className="my-6 h-px bg-[var(--border)]" />

              {/* Price */}

              <div>
                {discount > 0 && (
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                      Limited time offer
                    </span>

                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black text-emerald-600">
                      SAVE {discount}%
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-3xl font-black tracking-tight sm:text-4xl">
                    {formatPrice(Number(product.price))}
                  </span>

                  {product.original_price &&
                    Number(product.original_price) >
                      Number(product.price) && (
                      <span className="mb-1 text-sm text-[var(--foreground)]/35 line-through">
                        {formatPrice(
                          Number(product.original_price),
                        )}
                      </span>
                    )}
                </div>

                <p className="mt-1 text-[10px] text-[var(--foreground)]/40">
                  Inclusive of applicable taxes
                </p>
              </div>

              {/* Savings */}

              {savings > 0 && (
                <div className="mt-5 flex items-center justify-between rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
                  <div>
                    <p className="text-xs font-black text-emerald-600">
                      You save {formatPrice(savings)}
                    </p>

                    <p className="mt-1 text-[10px] text-[var(--foreground)]/45">
                      Best price available on PrimeCart
                    </p>
                  </div>

                  <Sparkles
                    size={20}
                    className="text-emerald-500"
                  />
                </div>
              )}

              {/* Stock */}

              <div className="mt-5">
                {product.stock > 0 ? (
                  <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                        <Check size={18} />
                      </div>

                      <div>
                        <p className="text-xs font-black text-emerald-600">
                          In Stock
                        </p>

                        <p className="mt-0.5 text-[10px] text-[var(--foreground)]/45">
                          {product.stock <= 5
                            ? `Only ${product.stock} left`
                            : "Ready to ship"}
                        </p>
                      </div>
                    </div>

                    {product.stock <= 5 && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-orange-600">
                        <Clock3 size={11} />
                        Selling fast
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-red-500/10 p-4 text-xs font-black text-red-600">
                    Currently out of stock
                  </div>
                )}
              </div>

              {/* Quantity */}

              {product.stock > 0 && (
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black">
                      Quantity
                    </p>

                    <p className="mt-1 text-[10px] text-[var(--foreground)]/40">
                      Maximum 10 per order
                    </p>
                  </div>

                  <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--muted)]">
                    <button
                      onClick={() =>
                        setQuantity((value) =>
                          Math.max(1, value - 1),
                        )
                      }
                      disabled={quantity <= 1}
                      className="flex h-10 w-10 items-center justify-center disabled:opacity-30"
                    >
                      <Minus size={15} />
                    </button>

                    <span className="flex h-10 min-w-10 items-center justify-center border-x border-[var(--border)] text-sm font-black">
                      {quantity}
                    </span>

                    <button
                      onClick={() =>
                        setQuantity((value) =>
                          Math.min(
                            maxQuantity,
                            value + 1,
                          ),
                        )
                      }
                      disabled={quantity >= maxQuantity}
                      className="flex h-10 w-10 items-center justify-center disabled:opacity-30"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* Main actions */}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={addToCart}
                  disabled={product.stock <= 0}
                  className="flex h-13 items-center justify-center gap-2 rounded-2xl border border-[var(--gold)] bg-[var(--gold)]/10 px-5 text-sm font-black text-[var(--gold-dark)] transition hover:bg-[var(--gold)] hover:text-white disabled:opacity-40"
                >
                  {cartMessage ? (
                    <>
                      <Check size={18} />
                      Added
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={buyNow}
                  disabled={product.stock <= 0}
                  className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-[var(--gold)] px-5 text-sm font-black text-white shadow-lg shadow-[var(--gold)]/20 transition hover:bg-[var(--gold-dark)] disabled:opacity-40"
                >
                  <Zap size={17} fill="currentColor" />
                  Buy Now
                </button>
              </div>

              {/* Wishlist */}

              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border text-xs font-black transition ${
                  wishlist
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-[var(--border)] hover:border-[var(--gold)] hover:text-[var(--gold-dark)]"
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
                  ? "Remove from Wishlist"
                  : "Add to Wishlist"}
              </button>

              {/* Trust row */}

              <div className="mt-7 grid grid-cols-2 gap-2">
                {[
                  {
                    icon: Truck,
                    title: "Fast Delivery",
                    text: "Quick shipping",
                  },
                  {
                    icon: RotateCcw,
                    title: "Easy Returns",
                    text: "7 day returns",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Secure Payment",
                    text: "Protected checkout",
                  },
                  {
                    icon: BadgeCheck,
                    title: "Genuine",
                    text: "Verified product",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-3"
                    >
                      <Icon
                        size={17}
                        className="text-[var(--gold)]"
                      />

                      <p className="mt-2 text-[10px] font-black">
                        {item.title}
                      </p>

                      <p className="mt-1 text-[9px] text-[var(--foreground)]/40">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            DELIVERY STRIP
        ================================================= */}

        <section className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold-dark)]">
              <Truck size={18} />
            </div>

            <div>
              <p className="text-xs font-black">
                Fast Delivery
              </p>
              <p className="mt-0.5 text-[10px] text-[var(--foreground)]/40">
                Reliable shipping to your doorstep
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold-dark)]">
              <RotateCcw size={18} />
            </div>

            <div>
              <p className="text-xs font-black">
                Easy Returns
              </p>
              <p className="mt-0.5 text-[10px] text-[var(--foreground)]/40">
                Simple 7-day return policy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold-dark)]">
              <ShieldCheck size={18} />
            </div>

            <div>
              <p className="text-xs font-black">
                Secure Shopping
              </p>
              <p className="mt-0.5 text-[10px] text-[var(--foreground)]/40">
                Safe and protected shopping
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            DETAILS
        ================================================= */}

        <section className="mt-7 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          {/* Description */}

          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold-dark)]">
                <Sparkles size={19} />
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--gold-dark)]">
                  Product information
                </p>

                <h2 className="mt-1 text-xl font-black">
                  About this item
                </h2>
              </div>
            </div>

            <div className="mt-6">
              {product.description ? (
                <p className="whitespace-pre-line text-sm leading-7 text-[var(--foreground)]/65">
                  {product.description}
                </p>
              ) : product.short_description ? (
                <p className="text-sm leading-7 text-[var(--foreground)]/65">
                  {product.short_description}
                </p>
              ) : (
                <p className="text-sm text-[var(--foreground)]/40">
                  Detailed description is currently unavailable.
                </p>
              )}
            </div>

            {/* Highlights */}

            <div className="mt-8 border-t border-[var(--border)] pt-6">
              <h3 className="text-sm font-black">
                Product highlights
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Brand",
                    product.brand || "PrimeCart",
                  ],
                  [
                    "Category",
                    category?.name || "General",
                  ],
                  [
                    "Rating",
                    `${Number(product.rating || 0).toFixed(1)} / 5`,
                  ],
                  [
                    "Reviews",
                    `${product.reviews_count || 0}`,
                  ],
                  [
                    "Availability",
                    product.stock > 0
                      ? "In Stock"
                      : "Out of Stock",
                  ],
                  [
                    "Product Status",
                    product.is_featured
                      ? "Featured"
                      : "Standard",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-3"
                  >
                    <span className="text-[10px] font-bold text-[var(--foreground)]/40">
                      {label}
                    </span>

                    <span className="text-right text-xs font-black">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Why PrimeCart */}

          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-7">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--gold-dark)]">
              PrimeCart Promise
            </p>

            <h2 className="mt-1 text-xl font-black">
              Shop with confidence
            </h2>

            <div className="mt-6 space-y-5">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure Shopping",
                  text: "Your shopping experience is protected.",
                },
                {
                  icon: Truck,
                  title: "Reliable Delivery",
                  text: "Fast and dependable order fulfilment.",
                },
                {
                  icon: RotateCcw,
                  title: "Easy Returns",
                  text: "Eligible products can be returned within 7 days.",
                },
                {
                  icon: BadgeCheck,
                  title: "Verified Information",
                  text: "Product information is presented clearly.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold-dark)]">
                      <Icon size={18} />
                    </div>

                    <div>
                      <h3 className="text-xs font-black">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-[10px] leading-5 text-[var(--foreground)]/45">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================
            RELATED PRODUCTS
        ================================================= */}

        {category && (
          <section className="mt-12">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--gold)]" />

                  <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--gold-dark)]">
                    More from {category.name}
                  </span>
                </div>

                <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                  You may also like
                </h2>

                <p className="mt-1 text-xs text-[var(--foreground)]/40">
                  Discover more products from this category.
                </p>
              </div>

              <Link
                href={`/dashboard/categories/${category.slug}`}
                className="group flex items-center gap-1 text-xs font-black text-[var(--gold-dark)]"
              >
                View all
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>

            {relatedLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--card)]"
                  >
                    <div className="aspect-square animate-pulse bg-[var(--muted)]" />

                    <div className="space-y-3 p-4">
                      <div className="h-3 w-20 animate-pulse rounded bg-[var(--muted)]" />
                      <div className="h-8 w-full animate-pulse rounded bg-[var(--muted)]" />
                      <div className="h-4 w-24 animate-pulse rounded bg-[var(--muted)]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : relatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {relatedProducts.map((item) => (
                  <RelatedProductCard
                    key={item.id}
                    product={item}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[26px] border border-[var(--border)] bg-[var(--card)] p-10 text-center">
                <ShoppingBag
                  size={30}
                  className="mx-auto text-[var(--foreground)]/20"
                />

                <h3 className="mt-3 text-sm font-black">
                  More products coming soon
                </h3>

                <p className="mt-1 text-xs text-[var(--foreground)]/40">
                  Explore the complete {category.name} collection.
                </p>

                <Link
                  href={`/dashboard/categories/${category.slug}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-5 py-2.5 text-xs font-black text-white"
                >
                  Browse Category
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </section>
        )}

        {/* =================================================
            FINAL CTA
        ================================================= */}

        <section className="relative mt-12 overflow-hidden rounded-[30px] bg-[var(--foreground)] p-6 text-[var(--background)] sm:p-9">
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[var(--gold)]/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[var(--gold)]">
                <Sparkles size={15} />

                <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                  PrimeCart
                </span>
              </div>

              <h2 className="mt-2 text-xl font-black sm:text-2xl">
                Shop smarter. Discover better.
              </h2>

              <p className="mt-1 max-w-xl text-xs leading-5 opacity-50">
                Explore more products, discover better deals and find
                products that match your shopping needs.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--gold)] px-5 py-3 text-xs font-black text-white transition hover:bg-[var(--gold-dark)]"
            >
              Explore Products
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </div>

      {/* ===================================================
          ANIMATION
      =================================================== */}

      <style jsx global>{`
        @keyframes primecart-detail-enter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .primecart-detail-enter {
          animation: primecart-detail-enter 0.45s ease both;
        }
      `}</style>
    </main>
  );
}
