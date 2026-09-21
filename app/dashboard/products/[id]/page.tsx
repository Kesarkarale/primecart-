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

type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

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

function getDiscount(
  price: number,
  originalPrice: number | null,
): number {
  if (!originalPrice || originalPrice <= price) return 0;

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100,
  );
}

function getSavings(
  price: number,
  originalPrice: number | null,
): number {
  if (!originalPrice || originalPrice <= price) return 0;

  return originalPrice - price;
}

function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem("primecart-cart");

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    "primecart-cart",
    JSON.stringify(cart),
  );

  window.dispatchEvent(new Event("cart-updated"));
}

function RelatedProductCard({
  product,
}: {
  product: Product;
}) {
  const image = getImageUrl(product.image_url);

  return (
    <Link
      href={`/dashboard/products/${product.id}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--muted)]">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff
              className="h-10 w-10 text-[var(--gold)]"
              strokeWidth={1.5}
            />
          </div>
        )}

        {product.is_flash_sale && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white">
            <Zap className="h-3 w-3 fill-current" />
            FLASH
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="mb-1 text-xs text-[var(--muted-foreground)]">
          {product.brand || "PrimeCart"}
        </p>

        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-[var(--foreground)]">
          {product.name}
        </h3>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-[var(--foreground)]">
            {formatPrice(Number(product.price))}
          </span>

          {product.original_price &&
            Number(product.original_price) >
              Number(product.price) && (
              <span className="text-xs text-[var(--muted-foreground)] line-through">
                {formatPrice(
                  Number(product.original_price),
                )}
              </span>
            )}
        </div>

        <div className="mt-2 flex items-center gap-1 text-xs">
          <Star className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" />
          <span className="font-semibold text-[var(--foreground)]">
            {Number(product.rating || 0).toFixed(1)}
          </span>
          <span className="text-[var(--muted-foreground)]">
            ({product.reviews_count || 0})
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const productId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  const [product, setProduct] =
    useState<Product | null>(null);

  const [category, setCategory] =
    useState<Category | null>(null);

  const [relatedProducts, setRelatedProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  const [cartLoading, setCartLoading] =
    useState(false);

  const [activeImage, setActiveImage] =
    useState<string | null>(null);

  const [shareMessage, setShareMessage] =
    useState("");

  useEffect(() => {
    if (!productId) return;

    let mounted = true;

    async function loadProduct() {
      setLoading(true);
      setError("");

      const {
        data,
        error: productError,
      } = await supabase
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

      if (!mounted) return;

      if (productError) {
        console.error(productError);
        setError(
          "We couldn't load this product right now.",
        );
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Product not found.");
        setLoading(false);
        return;
      }

      const loadedProduct = data as Product;

      setProduct(loadedProduct);

      const mainImage = getImageUrl(
        loadedProduct.image_url,
      );

      setActiveImage(mainImage);

      if (loadedProduct.category_id) {
        const { data: categoryData } =
          await supabase
            .from("categories")
            .select("id, name, slug")
            .eq(
              "id",
              loadedProduct.category_id,
            )
            .maybeSingle();

        if (mounted && categoryData) {
          setCategory(categoryData as Category);
        }

        const {
          data: relatedData,
          error: relatedError,
        } = await supabase
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
          .eq(
            "category_id",
            loadedProduct.category_id,
          )
          .eq("is_active", true)
          .neq("id", loadedProduct.id)
          .order("is_featured", {
            ascending: false,
          })
          .order("created_at", {
            ascending: false,
          })
          .limit(4);

        if (
          mounted &&
          !relatedError &&
          relatedData
        ) {
          setRelatedProducts(
            relatedData as Product[],
          );
        }
      }

      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (user && mounted) {
        const { data: wishlistItem } =
          await supabase
            .from("wishlist")
            .select("id")
            .eq("user_id", user.id)
            .eq(
              "product_id",
              loadedProduct.id,
            )
            .maybeSingle();

        if (mounted) {
          setWishlisted(Boolean(wishlistItem));
        }
      }

      if (mounted) {
        setLoading(false);
      }
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [productId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <div className="border-b border-[var(--border)] bg-[var(--card)]">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
            <div className="h-9 w-9 animate-pulse rounded-xl bg-[var(--muted)]" />
            <div className="h-5 w-32 animate-pulse rounded bg-[var(--muted)]" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-5 w-64 animate-pulse rounded bg-[var(--muted)]" />

          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-3xl bg-[var(--muted)]" />

            <div className="space-y-5">
              <div className="h-7 w-24 animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-12 w-3/4 animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-20 w-full animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-14 w-1/2 animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-14 w-full animate-pulse rounded-2xl bg-[var(--muted)]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
        <div className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
            <ShoppingBag className="h-8 w-8 text-[var(--gold)]" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[var(--foreground)]">
            Product unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {error ||
              "This product could not be found."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>

            <Link
              href="/dashboard/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--gold-dark)]"
            >
              Browse Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Important:
   * After the null guard above, use this stable reference.
   * This prevents TypeScript's "product is possibly null"
   * errors in the JSX and event handlers.
   */
  const currentProduct: Product = product;

  const discount = getDiscount(
    Number(currentProduct.price),
    currentProduct.original_price
      ? Number(currentProduct.original_price)
      : null,
  );

  const savings = getSavings(
    Number(currentProduct.price),
    currentProduct.original_price
      ? Number(currentProduct.original_price)
      : null,
  );

  const image = getImageUrl(
    currentProduct.image_url,
  );

  const maxQuantity = Math.max(
    1,
    Math.min(Number(currentProduct.stock), 10),
  );

  const isOutOfStock =
    Number(currentProduct.stock) <= 0;

  const rating = Number(
    currentProduct.rating || 0,
  );

  const reviewCount = Number(
    currentProduct.reviews_count || 0,
  );

  function addToCart() {
    if (isOutOfStock || cartLoading) return;

    setCartLoading(true);

    const cart = getCart();

    const existingIndex = cart.findIndex(
      (item) => item.id === currentProduct.id,
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity = Math.min(
        cart[existingIndex].quantity + quantity,
        maxQuantity,
      );
    } else {
      cart.push({
        id: currentProduct.id,
        name: currentProduct.name,
        price: Number(currentProduct.price),
        image_url: currentProduct.image_url,
        quantity,
      });
    }

    saveCart(cart);

    window.setTimeout(() => {
      setCartLoading(false);
    }, 500);
  }

  async function toggleWishlist() {
    if (wishlistLoading) return;

    setWishlistLoading(true);

    try {
      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      if (wishlisted) {
        const { error: deleteError } =
          await supabase
            .from("wishlist")
            .delete()
            .eq("user_id", user.id)
            .eq(
              "product_id",
              currentProduct.id,
            );

        if (deleteError) {
          console.error(deleteError);
          return;
        }

        setWishlisted(false);
      } else {
        const { error: insertError } =
          await supabase
            .from("wishlist")
            .insert({
              user_id: user.id,
              product_id: currentProduct.id,
            });

        if (insertError) {
          console.error(insertError);
          return;
        }

        setWishlisted(true);
      }
    } finally {
      setWishlistLoading(false);
    }
  }

  async function shareProduct() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: currentProduct.name,
          text:
            currentProduct.short_description ||
            `Check out ${currentProduct.name} on PrimeCart.`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);

        setShareMessage("Link copied!");

        window.setTimeout(() => {
          setShareMessage("");
        }, 2000);
      }
    } catch {
      // User cancelled native share.
    }
  }

  function buyNow() {
    if (isOutOfStock) return;

    addToCart();

    window.setTimeout(() => {
      router.push("/dashboard/checkout");
    }, 300);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] transition hover:bg-[var(--muted)]"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="hidden h-6 w-px bg-[var(--border)] sm:block" />

            <Link
              href="/dashboard/products"
              className="hidden items-center gap-2 text-sm font-semibold sm:flex"
            >
              <ShoppingBag className="h-4 w-4 text-[var(--gold)]" />
              Products
            </Link>
          </div>

          <Link
            href="/dashboard"
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--gold)] shadow-lg shadow-[var(--gold)]/20">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>

            <span className="hidden text-lg font-extrabold tracking-tight sm:block">
              Prime<span className="text-[var(--gold)]">Cart</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={shareProduct}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] transition hover:bg-[var(--muted)]"
              aria-label="Share product"
            >
              <Share2 className="h-4.5 w-4.5" />

              {shareMessage && (
                <span className="absolute right-0 top-12 whitespace-nowrap rounded-lg bg-[var(--foreground)] px-3 py-2 text-xs font-semibold text-[var(--background)] shadow-xl">
                  {shareMessage}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                wishlisted
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-[var(--border)] hover:bg-[var(--muted)]"
              }`}
              aria-label={
                wishlisted
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
            >
              <Heart
                className={`h-5 w-5 ${
                  wishlisted ? "fill-current" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <Link
              href="/dashboard"
              className="transition hover:text-[var(--gold-dark)]"
            >
              Home
            </Link>

            <ChevronRight className="h-3.5 w-3.5" />

            <Link
              href="/dashboard/products"
              className="transition hover:text-[var(--gold-dark)]"
            >
              Products
            </Link>

            {category && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />

                <Link
                  href={`/dashboard/categories/${category.slug}`}
                  className="transition hover:text-[var(--gold-dark)]"
                >
                  {category.name}
                </Link>
              </>
            )}

            <ChevronRight className="h-3.5 w-3.5" />

            <span className="max-w-55 truncate text-[var(--foreground)]">
              {currentProduct.name}
            </span>
          </nav>
        </div>

        {/* Product Main */}
        <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            {/* Gallery */}
            <div>
              <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                  {currentProduct.is_featured && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--foreground)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--background)]">
                      <Sparkles className="h-3 w-3" />
                      Featured
                    </span>
                  )}

                  {currentProduct.is_flash_sale && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      <Zap className="h-3 w-3 fill-current" />
                      Flash Sale
                    </span>
                  )}
                </div>

                <div className="absolute right-4 top-4 z-10">
                  <button
                    type="button"
                    onClick={toggleWishlist}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition ${
                      wishlisted
                        ? "border-red-200 bg-red-50 text-red-500"
                        : "border-[var(--border)] bg-[var(--card)]/90 hover:bg-[var(--muted)]"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        wishlisted
                          ? "fill-current"
                          : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="relative aspect-square bg-[var(--muted)]">
                  {activeImage ? (
                    <Image
                      src={activeImage}
                      alt={currentProduct.name}
                      fill
                      priority
                      className="object-contain p-8 sm:p-12 lg:p-16"
                      sizes="(max-width: 1024px) 100vw, 55vw"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-[var(--muted-foreground)]">
                      <ImageOff className="h-14 w-14 text-[var(--gold)]" />
                      <span className="text-sm font-medium">
                        Image unavailable
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail */}
              {image && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImage(image)
                    }
                    className={`relative h-20 w-20 overflow-hidden rounded-2xl border-2 bg-[var(--card)] ${
                      activeImage === image
                        ? "border-[var(--gold)] shadow-md"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${currentProduct.name} thumbnail`}
                      fill
                      className="object-contain p-2"
                      sizes="80px"
                    />
                  </button>
                </div>
              )}

              {/* Trust strip */}
              <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                <div className="flex flex-col items-center gap-1.5 border-r border-[var(--border)] px-2 py-4 text-center">
                  <ShieldCheck className="h-5 w-5 text-[var(--gold)]" />
                  <span className="text-[10px] font-semibold sm:text-xs">
                    Secure Payment
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5 border-r border-[var(--border)] px-2 py-4 text-center">
                  <Truck className="h-5 w-5 text-[var(--gold)]" />
                  <span className="text-[10px] font-semibold sm:text-xs">
                    Fast Delivery
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5 px-2 py-4 text-center">
                  <RotateCcw className="h-5 w-5 text-[var(--gold)]" />
                  <span className="text-[10px] font-semibold sm:text-xs">
                    Easy Returns
                  </span>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {currentProduct.brand && (
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--gold-dark)]">
                  {currentProduct.brand}
                </p>
              )}

              <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {currentProduct.name}
              </h1>

              {currentProduct.short_description && (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">
                  {currentProduct.short_description}
                </p>
              )}

              {/* Rating */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5">
                  <Star className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />
                  <span className="text-sm font-bold">
                    {rating.toFixed(1)}
                  </span>
                </div>

                <span className="text-sm text-[var(--muted-foreground)]">
                  {reviewCount}{" "}
                  {reviewCount === 1
                    ? "review"
                    : "reviews"}
                </span>

                {currentProduct.stock > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    In Stock
                  </span>
                )}
              </div>

              <div className="my-6 h-px bg-[var(--border)]" />

              {/* Price */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-4xl font-black tracking-tight">
                    {formatPrice(
                      Number(currentProduct.price),
                    )}
                  </span>

                  {currentProduct.original_price &&
                    Number(
                      currentProduct.original_price,
                    ) >
                      Number(
                        currentProduct.price,
                      ) && (
                      <span className="pb-1 text-base text-[var(--muted-foreground)] line-through">
                        {formatPrice(
                          Number(
                            currentProduct.original_price,
                          ),
                        )}
                      </span>
                    )}

                  {discount > 0 && (
                    <span className="mb-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {savings > 0 && (
                  <p className="mt-2 text-sm font-semibold text-emerald-600">
                    You save {formatPrice(savings)}
                  </p>
                )}

                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Inclusive of all applicable taxes
                </p>
              </div>

              {/* Flash Sale */}
              {currentProduct.is_flash_sale && (
                <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                      <Clock3 className="h-4.5 w-4.5 text-amber-700" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-amber-900">
                        Limited-time deal
                      </p>
                      <p className="text-xs text-amber-700">
                        Grab this offer before it ends.
                      </p>
                    </div>
                  </div>

                  <Zap className="h-5 w-5 fill-amber-500 text-amber-500" />
                </div>
              )}

              {/* Stock */}
              <div className="mt-5 flex items-center justify-between">
                <div>
                  {isOutOfStock ? (
                    <p className="text-sm font-bold text-red-500">
                      Currently unavailable
                    </p>
                  ) : (
                    <p className="text-sm font-semibold">
                      {currentProduct.stock <= 10
                        ? `Only ${currentProduct.stock} left in stock`
                        : "Available in stock"}
                    </p>
                  )}
                </div>

                {!isOutOfStock && (
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-[var(--muted)]">
                    <div
                      className="h-full rounded-full bg-[var(--gold)] transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            15,
                            (Number(
                              currentProduct.stock,
                            ) /
                              50) *
                              100,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold">
                  Quantity
                </p>

                <div className="flex w-fit items-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
                  <button
                    type="button"
                    disabled={
                      quantity <= 1 ||
                      isOutOfStock
                    }
                    onClick={() =>
                      setQuantity((value) =>
                        Math.max(1, value - 1),
                      )
                    }
                    className="flex h-11 w-11 items-center justify-center transition hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="flex h-11 w-12 items-center justify-center border-x border-[var(--border)] text-sm font-bold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    disabled={
                      quantity >= maxQuantity ||
                      isOutOfStock
                    }
                    onClick={() =>
                      setQuantity((value) =>
                        Math.min(
                          maxQuantity,
                          value + 1,
                        ),
                      )
                    }
                    className="flex h-11 w-11 items-center justify-center transition hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={addToCart}
                  disabled={
                    isOutOfStock || cartLoading
                  }
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-[var(--gold)] bg-[var(--card)] px-5 text-sm font-bold text-[var(--gold-dark)] transition hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartLoading
                    ? "Adding..."
                    : "Add to Cart"}
                </button>

                <button
                  type="button"
                  onClick={buyNow}
                  disabled={isOutOfStock}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[var(--gold)] px-5 text-sm font-bold text-white shadow-lg shadow-[var(--gold)]/20 transition hover:bg-[var(--gold-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Buy Now
                </button>
              </div>

              {/* Wishlist */}
              <button
                type="button"
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border text-sm font-bold transition ${
                  wishlisted
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-[var(--border)] hover:bg-[var(--muted)]"
                }`}
              >
                <Heart
                  className={`h-4.5 w-4.5 ${
                    wishlisted
                      ? "fill-current"
                      : ""
                  }`}
                />
                {wishlisted
                  ? "Saved to Wishlist"
                  : "Add to Wishlist"}
              </button>

              {/* Benefits */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)]">
                      <Truck className="h-4.5 w-4.5 text-[var(--gold)]" />
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        Fast Delivery
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                        Reliable delivery to your
                        doorstep.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)]">
                      <ShieldCheck className="h-4.5 w-4.5 text-[var(--gold)]" />
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        Secure Checkout
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                        Your payment information stays
                        protected.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Details */}
        <section className="border-y border-[var(--border)] bg-[var(--card)]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 rounded-full bg-[var(--gold)]" />

                  <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Product Details
                  </h2>
                </div>

                <div className="mt-6">
                  {currentProduct.description ? (
                    <p className="whitespace-pre-line text-sm leading-8 text-[var(--muted-foreground)] sm:text-base">
                      {currentProduct.description}
                    </p>
                  ) : (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Product details are not available
                      yet.
                    </p>
                  )}
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)] p-4">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                    <div>
                      <p className="text-sm font-bold">
                        Quality Checked
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                        Carefully listed and checked for
                        quality.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)] p-4">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                    <div>
                      <p className="text-sm font-bold">
                        Easy Returns
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                        Simple return experience on
                        eligible orders.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)] p-4">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                    <div>
                      <p className="text-sm font-bold">
                        Secure Payments
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                        Protected payment experience.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)] p-4">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                    <div>
                      <p className="text-sm font-bold">
                        Customer Support
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                        Help whenever you need it.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Summary */}
              <div>
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-5 sm:p-6">
                  <h3 className="text-lg font-black">
                    Product Summary
                  </h3>

                  <div className="mt-5 divide-y divide-[var(--border)]">
                    <div className="flex items-center justify-between gap-4 py-3">
                      <span className="text-sm text-[var(--muted-foreground)]">
                        Brand
                      </span>

                      <span className="text-sm font-semibold text-right">
                        {currentProduct.brand ||
                          "PrimeCart"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-3">
                      <span className="text-sm text-[var(--muted-foreground)]">
                        Category
                      </span>

                      <span className="text-sm font-semibold text-right">
                        {category?.name || "General"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-3">
                      <span className="text-sm text-[var(--muted-foreground)]">
                        Rating
                      </span>

                      <span className="flex items-center gap-1 text-sm font-semibold">
                        <Star className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />
                        {rating.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-3">
                      <span className="text-sm text-[var(--muted-foreground)]">
                        Availability
                      </span>

                      <span
                        className={`text-sm font-bold ${
                          isOutOfStock
                            ? "text-red-500"
                            : "text-emerald-600"
                        }`}
                      >
                        {isOutOfStock
                          ? "Out of Stock"
                          : "In Stock"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-3xl bg-[var(--foreground)] p-5 text-[var(--background)] sm:p-6">
                  <div className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-[var(--gold)]" />

                    <div>
                      <h3 className="font-bold">
                        The PrimeCart Promise
                      </h3>

                      <p className="mt-2 text-xs leading-6 opacity-70">
                        A seamless shopping experience
                        with transparent pricing, secure
                        checkout and dependable service.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 rounded-full bg-[var(--gold)]" />

                  <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                    You May Also Like
                  </h2>
                </div>

                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Explore more products from the same
                  category.
                </p>
              </div>

              {category && (
                <Link
                  href={`/dashboard/categories/${category.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-bold text-[var(--gold-dark)] transition hover:gap-2"
                >
                  View Category
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <RelatedProductCard
                  key={item.id}
                  product={item}
                />
              ))}
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8 lg:pb-14">
          <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)]">
            <div className="relative p-7 sm:p-10">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--gold)]/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 text-xs font-bold">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" />
                    PrimeCart Shopping
                  </div>

                  <h2 className="mt-4 max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">
                    Ready to make it yours?
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
                    Add this product to your cart and
                    continue your shopping journey with
                    PrimeCart.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addToCart}
                  disabled={
                    isOutOfStock || cartLoading
                  }
                  className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[var(--gold)] px-6 text-sm font-bold text-white shadow-lg shadow-[var(--gold)]/20 transition hover:bg-[var(--gold-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartLoading
                    ? "Adding..."
                    : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Bottom Action */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--card)]/95 p-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-2">
          <button
            type="button"
            onClick={addToCart}
            disabled={
              isOutOfStock || cartLoading
            }
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--gold)] bg-[var(--card)] text-sm font-bold text-[var(--gold-dark)] disabled:opacity-50"
          >
            <ShoppingCart className="h-4.5 w-4.5" />
            Add
          </button>

          <button
            type="button"
            onClick={buyNow}
            disabled={isOutOfStock}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--gold)] text-sm font-bold text-white disabled:opacity-50"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            Buy Now
          </button>
        </div>
      </div>

      <div className="h-20 lg:hidden" />
    </div>
  );
}
