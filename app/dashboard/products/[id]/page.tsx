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

function getImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;

  const value = imageUrl.trim();

  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  ) {
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

function getDiscount(price: number, original: number | null) {
  if (!original || original <= price) return 0;

  return Math.round(((original - price) / original) * 100);
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function RelatedProductCard({
  product,
}: {
  product: Product;
}) {
  const image = getImageUrl(product.image_url);

  const discount = getDiscount(
    Number(product.price),
    product.original_price ? Number(product.original_price) : null,
  );

  return (
    <Link
      href={`/dashboard/products/${product.id}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--muted)]">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
            className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--foreground)]/30">
            <ImageOff size={38} />
          </div>
        )}

        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--gold)] px-2.5 py-1 text-[9px] font-black text-white">
            {discount}% OFF
          </span>
        )}

        {product.is_flash_sale && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-[var(--foreground)] px-2.5 py-1 text-[9px] font-black text-[var(--background)]">
            <Zap size={10} fill="currentColor" />
            DEAL
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--foreground)]/45">
          {product.brand || "PrimeCart"}
        </p>

        <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-black leading-5 text-[var(--card-foreground)]">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--gold)] px-1.5 py-0.5 text-[10px] font-black text-white">
            {Number(product.rating || 0).toFixed(1)}
            <Star size={9} fill="currentColor" />
          </span>

          <span className="text-[10px] text-[var(--foreground)]/45">
            ({product.reviews_count || 0})
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-base font-black text-[var(--card-foreground)]">
            {formatPrice(Number(product.price))}
          </span>

          {product.original_price &&
            Number(product.original_price) > Number(product.price) && (
              <span className="text-[10px] text-[var(--foreground)]/40 line-through">
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
   MAIN PAGE
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

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [buying, setBuying] = useState(false);

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
        setQuantity(1);
        setWishlist(false);

        const { data: productData, error: productError } =
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

        if (!productData) {
          if (mounted) {
            setError("This product could not be found.");
            setLoading(false);
          }

          return;
        }

        const currentProduct = productData as Product;

        if (!mounted) return;

        setProduct(currentProduct);

        if (currentProduct.category_id) {
          const { data: categoryData } = await supabase
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
          const { data: wishlistData } = await supabase
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
        console.error("Product loading error:", err);

        if (mounted) {
          setError("Unable to load this product. Please try again.");
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
     LOAD RELATED PRODUCTS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadRelatedProducts() {
      if (!product?.category_id) {
        setRelatedProducts([]);
        return;
      }

      try {
        setRelatedLoading(true);

        const { data, error: relatedError } = await supabase
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
          .order("is_featured", { ascending: false })
          .order("rating", { ascending: false })
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

    loadRelatedProducts();

    return () => {
      mounted = false;
    };
  }, [product, supabase]);

  /* =======================================================
     PRODUCT GUARD
  ======================================================= */

  const discount = product
    ? getDiscount(
        Number(product.price),
        product.original_price
          ? Number(product.original_price)
          : null,
      )
    : 0;

  const image = product ? getImageUrl(product.image_url) : null;

  const maxQuantity = product
    ? Math.max(1, Math.min(product.stock, 10))
    : 1;

  /* =======================================================
     CART
  ======================================================= */

  function addToCart(
    selectedProduct: Product,
    selectedQuantity: number,
  ) {
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
        (item) => item.id === selectedProduct.id,
      );

      if (existing) {
        existing.quantity += selectedQuantity;
      } else {
        items.push({
          id: selectedProduct.id,
          name: selectedProduct.name,
          price: Number(selectedProduct.price),
          image_url: selectedProduct.image_url,
          quantity: selectedQuantity,
        });
      }

      localStorage.setItem(
        "primecart-cart",
        JSON.stringify(items),
      );

      window.dispatchEvent(new Event("cart-updated"));

      setCartAdded(true);

      window.setTimeout(() => {
        setCartAdded(false);
      }, 2200);
    } catch (err) {
      console.error("Cart error:", err);
    }
  }

  /* =======================================================
     WISHLIST
  ======================================================= */

  async function toggleWishlist() {
    if (!product) return;

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
        const { error: deleteError } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", product.id);

        if (deleteError) {
          throw deleteError;
        }

        setWishlist(false);
      } else {
        const { error: insertError } = await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: product.id,
          });

        if (insertError) {
          throw insertError;
        }

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

  async function handleShare() {
    if (!product) return;

    const shareData = {
      title: product.name,
      text:
        product.short_description ||
        `Check out ${product.name} on PrimeCart.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage("Shared successfully");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage("Product link copied");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage("Product link copied");
      } catch {
        setShareMessage("Unable to share");
      }
    }

    window.setTimeout(() => {
      setShareMessage("");
    }, 2200);
  }

  /* =======================================================
     BUY NOW
  ======================================================= */

  function handleBuyNow() {
    if (!product || product.stock <= 0) return;

    setBuying(true);

    addToCart(product, quantity);

    window.setTimeout(() => {
      router.push("/dashboard");
    }, 350);
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-6 w-32 animate-pulse rounded-lg bg-[var(--muted)]" />

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="h-[520px] animate-pulse rounded-[28px] bg-[var(--muted)]" />

            <div className="space-y-5">
              <div className="h-5 w-32 animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-12 w-full animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-6 w-40 animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-32 w-full animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-16 w-full animate-pulse rounded bg-[var(--muted)]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR / NOT FOUND
  ======================================================= */

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5 text-[var(--foreground)]">
        <div className="w-full max-w-md rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--gold)]">
            <ShoppingBag size={28} />
          </div>

          <h1 className="mt-6 text-2xl font-black">
            Product unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]/55">
            {error || "This product is no longer available."}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/products"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--gold)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--gold-dark)]"
            >
              <ArrowLeft size={16} />
              Browse Products
            </Link>

            <Link
              href="/dashboard"
              className="flex flex-1 items-center justify-center rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-black transition hover:bg-[var(--muted)]"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN PRODUCT PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard/products"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] transition hover:border-[var(--gold)] hover:text-[var(--gold-dark)]"
              aria-label="Back to products"
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

              <span className="text-lg font-black tracking-tight">
                Prime<span className="text-[var(--gold)]">Cart</span>
              </span>
            </Link>

            <div className="hidden h-5 w-px bg-[var(--border)] sm:block" />

            <span className="truncate text-xs font-bold text-[var(--foreground)]/50">
              Product Details
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/wishlist"
              className="hidden h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-xs font-black transition hover:border-[var(--gold)] sm:flex"
            >
              <Heart size={16} />
              Wishlist
            </Link>

            <Link
              href="/dashboard/products"
              className="flex h-10 items-center gap-2 rounded-xl bg-[var(--gold)] px-3.5 text-xs font-black text-white transition hover:bg-[var(--gold-dark)]"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Continue Shopping</span>
              <span className="sm:hidden">Shop</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:pt-7">
        {/* Breadcrumb */}

        <div className="mb-6 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-[var(--foreground)]/45">
          <Link
            href="/dashboard"
            className="hover:text-[var(--gold-dark)]"
          >
            Home
          </Link>

          <ChevronRight size={13} />

          <Link
            href="/dashboard/products"
            className="hover:text-[var(--gold-dark)]"
          >
            Products
          </Link>

          {category && (
            <>
              <ChevronRight size={13} />

              <Link
                href={`/dashboard/categories/${category.slug}`}
                className="hover:text-[var(--gold-dark)]"
              >
                {category.name}
              </Link>
            </>
          )}

          <ChevronRight size={13} />

          <span className="max-w-[180px] truncate text-[var(--foreground)]/65">
            {product.name}
          </span>
        </div>

        {/* =================================================
            PRODUCT HERO
        ================================================= */}

        <section className="grid items-start gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
          {/* IMAGE CARD */}

          <div className="lg:sticky lg:top-[90px]">
            <div className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
              <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
                {product.is_featured && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--foreground)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--background)]">
                    <BadgeCheck size={12} />
                    Featured
                  </span>
                )}

                {product.is_flash_sale && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white">
                    <Zap size={11} fill="currentColor" />
                    Flash Deal
                  </span>
                )}
              </div>

              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-xl transition ${
                  wishlist
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-[var(--border)] bg-[var(--card)]/90 text-[var(--foreground)]/55 hover:border-[var(--gold)] hover:text-[var(--gold-dark)]"
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart
                  size={19}
                  fill={wishlist ? "currentColor" : "none"}
                />
              </button>

              <div className="relative aspect-square min-h-[360px] bg-[var(--muted)] sm:min-h-[500px]">
                {image ? (
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-contain p-8 sm:p-12 lg:p-16"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--foreground)]/25">
                    <div className="text-center">
                      <ImageOff
                        size={54}
                        className="mx-auto"
                      />
                      <p className="mt-3 text-sm font-bold">
                        Image unavailable
                      </p>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                  <div className="rounded-full border border-[var(--border)] bg-[var(--card)]/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider backdrop-blur">
                    Genuine Product
                  </div>

                  <button
                    onClick={handleShare}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]/90 transition hover:border-[var(--gold)] hover:text-[var(--gold-dark)]"
                    aria-label="Share product"
                  >
                    <Share2 size={17} />
                  </button>
                </div>
              </div>
            </div>

            {shareMessage && (
              <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-center text-xs font-bold text-[var(--gold-dark)]">
                {shareMessage}
              </div>
            )}
          </div>

          {/* PRODUCT INFO */}

          <div className="min-w-0 lg:sticky lg:top-[90px]">
            <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-7">
              {/* Brand */}

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gold-dark)]">
                  {product.brand || "PrimeCart Exclusive"}
                </span>

                {product.stock > 0 && (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-600">
                    In Stock
                  </span>
                )}
              </div>

              {/* Title */}

              <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-[var(--card-foreground)] sm:text-3xl lg:text-[34px]">
                {product.name}
              </h1>

              {/* Short description */}

              {product.short_description && (
                <p className="mt-3 text-sm leading-6 text-[var(--foreground)]/55">
                  {product.short_description}
                </p>
              )}

              {/* Rating */}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--gold)] px-2.5 py-1.5 text-xs font-black text-white">
                  {Number(product.rating || 0).toFixed(1)}
                  <Star size={12} fill="currentColor" />
                </div>

                <span className="text-xs font-bold text-[var(--foreground)]/55">
                  {product.reviews_count || 0} ratings & reviews
                </span>

                <span className="h-4 w-px bg-[var(--border)]" />

                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/40">
                  Verified Product
                </span>
              </div>

              <div className="my-6 h-px bg-[var(--border)]" />

              {/* Price */}

              <div>
                {discount > 0 && (
                  <p className="mb-1 text-xs font-black uppercase tracking-wider text-emerald-600">
                    Limited offer • Save {discount}%
                  </p>
                )}

                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-3xl font-black tracking-tight text-[var(--card-foreground)] sm:text-4xl">
                    {formatPrice(Number(product.price))}
                  </span>

                  {product.original_price &&
                    Number(product.original_price) >
                      Number(product.price) && (
                      <span className="mb-1 text-sm text-[var(--foreground)]/40 line-through">
                        {formatPrice(
                          Number(product.original_price),
                        )}
                      </span>
                    )}
                </div>

                <p className="mt-1 text-[10px] font-medium text-[var(--foreground)]/40">
                  Inclusive of all applicable taxes
                </p>
              </div>

              {/* Offer strip */}

              {discount > 0 && (
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)] text-white">
                    <Zap size={18} fill="currentColor" />
                  </div>

                  <div>
                    <p className="text-xs font-black">
                      Special PrimeCart Deal
                    </p>

                    <p className="mt-0.5 text-[10px] text-[var(--foreground)]/50">
                      Save {formatPrice(
                        Number(product.original_price || 0) -
                          Number(product.price),
                      )}{" "}
                      on this product.
                    </p>
                  </div>
                </div>
              )}

              {/* Stock */}

              <div className="mt-5">
                {product.stock > 0 ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-emerald-600">
                        In stock
                      </p>

                      <p className="mt-1 text-[10px] text-[var(--foreground)]/45">
                        {product.stock <= 5
                          ? `Only ${product.stock} left — order soon`
                          : "Ready to ship"}
                      </p>
                    </div>

                    <Truck
                      size={20}
                      className="text-[var(--gold)]"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl bg-red-500/10 px-4 py-3 text-xs font-black text-red-600">
                    Currently out of stock
                  </div>
                )}
              </div>

              {/* Quantity */}

              {product.stock > 0 && (
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-3">
                  <div>
                    <p className="text-xs font-black">
                      Quantity
                    </p>

                    <p className="mt-0.5 text-[10px] text-[var(--foreground)]/45">
                      Max 10 per order
                    </p>
                  </div>

                  <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--card)]">
                    <button
                      onClick={() =>
                        setQuantity((current) =>
                          Math.max(1, current - 1),
                        )
                      }
                      disabled={quantity <= 1}
                      className="flex h-10 w-10 items-center justify-center text-[var(--foreground)]/60 transition hover:text-[var(--gold-dark)] disabled:opacity-30"
                    >
                      <Minus size={15} />
                    </button>

                    <span className="flex h-10 min-w-10 items-center justify-center border-x border-[var(--border)] text-sm font-black">
                      {quantity}
                    </span>

                    <button
                      onClick={() =>
                        setQuantity((current) =>
                          Math.min(maxQuantity, current + 1),
                        )
                      }
                      disabled={quantity >= maxQuantity}
                      className="flex h-10 w-10 items-center justify-center text-[var(--foreground)]/60 transition hover:text-[var(--gold-dark)] disabled:opacity-30"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* Buttons */}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => {
                    if (product.stock > 0) {
                      addToCart(product, quantity);
                    }
                  }}
                  disabled={product.stock <= 0}
                  className="flex h-13 items-center justify-center gap-2 rounded-2xl border border-[var(--gold)] bg-[var(--gold)]/10 px-5 text-sm font-black text-[var(--gold-dark)] transition hover:bg-[var(--gold)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {cartAdded ? (
                    <>
                      <Check size={18} />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0 || buying}
                  className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-[var(--gold)] px-5 text-sm font-black text-white shadow-lg shadow-[var(--gold)]/15 transition hover:bg-[var(--gold-dark)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Zap size={17} fill="currentColor" />
                  {buying ? "Opening..." : "Buy Now"}
                </button>
              </div>

              {/* Wishlist */}

              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border text-sm font-black transition ${
                  wishlist
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-[var(--border)] hover:border-[var(--gold)] hover:text-[var(--gold-dark)]"
                }`}
              >
                <Heart
                  size={17}
                  fill={wishlist ? "currentColor" : "none"}
                />

                {wishlist
                  ? "Remove from Wishlist"
                  : "Add to Wishlist"}
              </button>

              {/* Service cards */}

              <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                    title: "Secure",
                    text: "Safe shopping",
                  },
                  {
                    icon: BadgeCheck,
                    title: "Verified",
                    text: "Genuine product",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-3 text-center"
                    >
                      <Icon
                        size={17}
                        className="mx-auto text-[var(--gold)]"
                      />

                      <p className="mt-2 text-[9px] font-black">
                        {item.title}
                      </p>

                      <p className="mt-0.5 text-[8px] text-[var(--foreground)]/40">
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
            PRODUCT INFORMATION
        ================================================= */}

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          {/* About */}

          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold-dark)]">
                <Sparkles size={19} />
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--gold-dark)]">
                  Product information
                </p>

                <h2 className="mt-0.5 text-xl font-black">
                  About this item
                </h2>
              </div>
            </div>

            {product.description ? (
              <div className="mt-6 whitespace-pre-line text-sm leading-7 text-[var(--foreground)]/65">
                {product.description}
              </div>
            ) : product.short_description ? (
              <p className="mt-6 text-sm leading-7 text-[var(--foreground)]/65">
                {product.short_description}
              </p>
            ) : (
              <p className="mt-6 text-sm text-[var(--foreground)]/45">
                Detailed product information will be available soon.
              </p>
            )}

            {/* Highlights */}

            <div className="mt-7 border-t border-[var(--border)] pt-6">
              <h3 className="text-sm font-black">
                Product highlights
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "Brand",
                    value: product.brand || "PrimeCart",
                  },
                  {
                    title: "Customer Rating",
                    value: `${Number(product.rating || 0).toFixed(1)} / 5`,
                  },
                  {
                    title: "Reviews",
                    value: `${product.reviews_count || 0} reviews`,
                  },
                  {
                    title: "Availability",
                    value:
                      product.stock > 0
                        ? "In Stock"
                        : "Out of Stock",
                  },
                  {
                    title: "Product Type",
                    value: category?.name || "General",
                  },
                  {
                    title: "PrimeCart Status",
                    value: product.is_featured
                      ? "Featured Product"
                      : "Standard Product",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-3"
                  >
                    <span className="text-xs font-bold text-[var(--foreground)]/45">
                      {item.title}
                    </span>

                    <span className="text-right text-xs font-black">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shopping promise */}

          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-7">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--gold-dark)]">
              PrimeCart Promise
            </p>

            <h2 className="mt-1 text-xl font-black">
              Shop with confidence
            </h2>

            <div className="mt-6 space-y-4">
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
                  title: "Verified Products",
                  text: "Products are listed with verified information.",
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
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--gold)]" />

                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--gold-dark)]">
                    More from {category.name}
                  </p>
                </div>

                <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                  Related products
                </h2>

                <p className="mt-1 text-xs text-[var(--foreground)]/45">
                  More products from the same category.
                </p>
              </div>

              <Link
                href={`/dashboard/categories/${category.slug}`}
                className="group inline-flex items-center gap-1 text-xs font-black text-[var(--gold-dark)]"
              >
                View category
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
                    className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
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
                {relatedProducts.map((relatedProduct) => (
                  <RelatedProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-8 text-center">
                <ShoppingBag
                  size={30}
                  className="mx-auto text-[var(--foreground)]/25"
                />

                <p className="mt-3 text-sm font-black">
                  No related products yet
                </p>

                <p className="mt-1 text-xs text-[var(--foreground)]/45">
                  Explore more products in {category.name}.
                </p>

                <Link
                  href={`/dashboard/categories/${category.slug}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-4 py-2.5 text-xs font-black text-white"
                >
                  Browse {category.name}
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </section>
        )}

        {/* =================================================
            FINAL CTA
        ================================================= */}

        <section className="mt-12 overflow-hidden rounded-[28px] bg-[var(--foreground)] p-6 text-[var(--background)] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[var(--gold)]">
                <Sparkles size={15} />

                <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                  PrimeCart
                </span>
              </div>

              <h2 className="mt-2 text-xl font-black sm:text-2xl">
                Find more products made for you.
              </h2>

              <p className="mt-1 max-w-xl text-xs leading-5 opacity-50">
                Explore categories, discover deals and make smarter shopping
                decisions with PrimeCart.
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
          NATIVE ANIMATIONS
      =================================================== */}

      <style jsx global>{`
        @keyframes primecart-fade-up {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .primecart-fade-up {
          animation: primecart-fade-up 0.45s ease both;
        }
      `}</style>
    </main>
  );
}
