"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import { useEffect, useMemo, useState } from "react";

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
  created_at?: string;
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

function getDiscount(
  price: number,
  originalPrice: number
) {
  if (!originalPrice || originalPrice <= price) return 0;

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100
  );
}

function addProductToCart(
  product: Product,
  quantity: number
) {
  try {
    const cartKey = "primecart-cart";

    const storedCart = localStorage.getItem(cartKey);

    const cart = storedCart
      ? JSON.parse(storedCart)
      : [];

    const existingIndex = cart.findIndex(
      (item: {
        id?: string;
        product_id?: string;
      }) =>
        item.product_id === product.id ||
        item.id === product.id
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity =
        Number(cart[existingIndex].quantity || 1) +
        quantity;
    } else {
      cart.push({
        id: product.id,
        product_id: product.id,
        name: product.name,
        price: Number(product.price ?? 0),
        image_url: product.image_url,
        quantity,
      });
    }

    localStorage.setItem(
      cartKey,
      JSON.stringify(cart)
    );

    window.dispatchEvent(
      new Event("cart-updated")
    );

    return true;
  } catch (error) {
    console.error("Cart error:", error);
    return false;
  }
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const productId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [product, setProduct] =
    useState<Product | null>(null);

  const [category, setCategory] =
    useState<Category | null>(null);

  const [relatedProducts, setRelatedProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] =
    useState(true);

  const [notFound, setNotFound] =
    useState(false);

  const [error, setError] = useState("");

  const [imageError, setImageError] =
    useState(false);

  const [quantity, setQuantity] = useState(1);

  const [wishlist, setWishlist] =
    useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] =
    useState<"success" | "error">("success");

  useEffect(() => {
    if (!productId) return;

    let mounted = true;

    async function fetchProduct() {
      setLoading(true);
      setError("");
      setNotFound(false);
      setImageError(false);
      setProduct(null);
      setCategory(null);
      setWishlist(false);
      setQuantity(1);

      try {
        const {
          data: productData,
          error: productError,
        } = await supabase
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
              is_active,
              created_at
            `
          )
          .eq("id", productId)
          .eq("is_active", true)
          .maybeSingle();

        if (productError) {
          throw productError;
        }

        if (!mounted) return;

        if (!productData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const currentProduct =
          productData as Product;

        setProduct(currentProduct);

        if (currentProduct.category_id) {
          const {
            data: categoryData,
          } = await supabase
            .from("categories")
            .select("id, name, slug")
            .eq(
              "id",
              currentProduct.category_id
            )
            .maybeSingle();

          if (
            mounted &&
            categoryData
          ) {
            setCategory(
              categoryData as Category
            );
          }
        }

        setLoading(false);
      } catch (err) {
        console.error(
          "Product detail error:",
          err
        );

        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this product."
        );

        setLoading(false);
      }
    }

    fetchProduct();

    return () => {
      mounted = false;
    };
  }, [productId, supabase]);

  /*
   * RELATED PRODUCTS
   * Same category only.
   */
  useEffect(() => {
    if (!product) return;

    let mounted = true;

    async function fetchRelatedProducts() {
      setRelatedLoading(true);

      try {
        let query = supabase
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
              is_active,
              created_at
            `
          )
          .eq("is_active", true)
          .neq("id", product.id)
          .limit(12);

        if (product.category_id) {
          query = query.eq(
            "category_id",
            product.category_id
          );
        }

        const {
          data,
          error: relatedError,
        } = await query;

        if (!mounted) return;

        if (relatedError) {
          console.error(
            "Related products error:",
            relatedError
          );

          setRelatedProducts([]);
        } else {
          setRelatedProducts(
            (data || []) as Product[]
          );
        }
      } catch (err) {
        console.error(
          "Related products error:",
          err
        );

        if (mounted) {
          setRelatedProducts([]);
        }
      } finally {
        if (mounted) {
          setRelatedLoading(false);
        }
      }
    }

    fetchRelatedProducts();

    return () => {
      mounted = false;
    };
  }, [product, supabase]);

  /*
   * CHECK WISHLIST
   */
  useEffect(() => {
    if (!product) return;

    let mounted = true;

    async function checkWishlist() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !mounted) return;

        const { data } = await supabase
          .from("wishlist")
          .select("id")
          .eq("user_id", user.id)
          .eq(
            "product_id",
            product.id
          )
          .maybeSingle();

        if (mounted) {
          setWishlist(Boolean(data));
        }
      } catch (err) {
        console.error(
          "Wishlist check error:",
          err
        );
      }
    }

    checkWishlist();

    return () => {
      mounted = false;
    };
  }, [product, supabase]);

  function showMessage(
    text: string,
    type: "success" | "error" = "success"
  ) {
    setMessage(text);
    setMessageType(type);

    window.setTimeout(() => {
      setMessage("");
    }, 2600);
  }

  async function toggleWishlist() {
    if (!product) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(
        `/auth/login?next=/dashboard/products/${product.id}`
      );
      return;
    }

    if (wishlist) {
      const {
        error: deleteError,
      } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq(
          "product_id",
          product.id
        );

      if (deleteError) {
        console.error(deleteError);

        showMessage(
          "Unable to remove from wishlist.",
          "error"
        );

        return;
      }

      setWishlist(false);

      showMessage(
        "Removed from wishlist."
      );
    } else {
      const {
        error: insertError,
      } = await supabase
        .from("wishlist")
        .insert({
          user_id: user.id,
          product_id: product.id,
        });

      if (insertError) {
        console.error(insertError);

        showMessage(
          "Unable to add to wishlist.",
          "error"
        );

        return;
      }

      setWishlist(true);

      showMessage(
        "Added to wishlist."
      );
    }
  }

  function handleAddToCart() {
    if (!product) return;

    const stock = Number(
      product.stock ?? 0
    );

    if (stock <= 0) return;

    const success =
      addProductToCart(
        product,
        quantity
      );

    if (success) {
      showMessage(
        quantity === 1
          ? "Added to cart."
          : `${quantity} items added to cart.`
      );
    } else {
      showMessage(
        "Unable to add product to cart.",
        "error"
      );
    }
  }

  function handleBuyNow() {
    if (!product) return;

    const stock = Number(
      product.stock ?? 0
    );

    if (stock <= 0) return;

    const success =
      addProductToCart(
        product,
        quantity
      );

    if (success) {
      router.push("/dashboard/cart");
    } else {
      showMessage(
        "Unable to continue.",
        "error"
      );
    }
  }

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
      if (
        navigator.share
      ) {
        await navigator.share(
          shareData
        );
        return;
      }

      await navigator.clipboard.writeText(
        window.location.href
      );

      showMessage(
        "Product link copied."
      );
    } catch {
      try {
        await navigator.clipboard.writeText(
          window.location.href
        );

        showMessage(
          "Product link copied."
        );
      } catch {
        showMessage(
          "Unable to share this product.",
          "error"
        );
      }
    }
  }

  function scrollRelated(
    direction: "left" | "right"
  ) {
    const container =
      document.getElementById(
        "related-products"
      );

    if (!container) return;

    container.scrollBy({
      left:
        direction === "right"
          ? 650
          : -650,
      behavior: "smooth",
    });
  }

  /*
   * LOADING
   */
  if (loading) {
    return <ProductLoading />;
  }

  /*
   * ERROR
   */
  if (error) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-5 py-10 text-[var(--foreground)]">
        <div className="mx-auto flex min-h-[75vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[30px] border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-[0_20px_70px_rgba(151,117,56,0.08)] sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <ImageOff size={28} />
            </div>

            <h1 className="mt-5 text-2xl font-black">
              Unable to load product
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]/50">
              {error}
            </p>

            <Link
              href="/dashboard/products"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--gold-dark)]"
            >
              <ArrowLeft size={16} />
              Back to Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * NOT FOUND
   */
  if (notFound || !product) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-5 py-10 text-[var(--foreground)]">
        <div className="mx-auto flex min-h-[75vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[30px] border border-[var(--border)] bg-[var(--card)] p-10 text-center shadow-[0_20px_70px_rgba(151,117,56,0.08)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--gold-dark)]">
              <ImageOff size={28} />
            </div>

            <h1 className="mt-5 text-2xl font-black">
              Product Not Found
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]/50">
              This product may have been removed
              or the product link is invalid.
            </p>

            <Link
              href="/dashboard/products"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--gold-dark)]"
            >
              <ArrowLeft size={16} />
              Back to All Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const imageUrl =
    getImageUrl(product.image_url);

  const price = Number(
    product.price ?? 0
  );

  const originalPrice = Number(
    product.original_price ?? 0
  );

  const stock = Number(
    product.stock ?? 0
  );

  const rating = Number(
    product.rating ?? 0
  );

  const discount = getDiscount(
    price,
    originalPrice
  );

  const savings =
    originalPrice > price
      ? originalPrice - price
      : 0;

  const deliveryDate =
    new Date();

  deliveryDate.setDate(
    deliveryDate.getDate() + 3
  );

  const deliveryText =
    deliveryDate.toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
      }
    );

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* =====================================================
          TOAST
      ===================================================== */}
      {message && (
        <div className="fixed right-4 top-4 z-[100] animate-[toastIn_.3s_ease-out] sm:right-6 sm:top-6">
          <div className="flex max-w-[calc(100vw-32px)] items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.14)]">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                messageType === "success"
                  ? "bg-[var(--gold)] text-white"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {messageType === "success" ? (
                <Check size={17} />
              ) : (
                <X size={17} />
              )}
            </div>

            <span className="text-sm font-bold">
              {message}
            </span>

            <button
              type="button"
              onClick={() =>
                setMessage("")
              }
              className="ml-1 text-[var(--foreground)]/30 transition hover:text-[var(--foreground)]"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          TOP BAR
      ===================================================== */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1500px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <Link
            href="/dashboard"
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gold)] text-lg font-black text-white shadow-[0_8px_20px_rgba(185,151,91,0.2)] transition group-hover:scale-105">
              P
            </div>

            <div>
              <div className="text-lg font-black tracking-tight sm:text-xl">
                Prime
                <span className="text-[var(--gold-dark)]">
                  Cart
                </span>
              </div>

              <div className="hidden text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--foreground)]/35 sm:block">
                Shop Smarter
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/products"
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-bold text-[var(--foreground)]/65 transition hover:border-[var(--gold)] hover:text-[var(--gold-dark)] sm:px-4"
            >
              <ArrowLeft size={16} />
              <span className="hidden xs:inline sm:inline">
                Products
              </span>
            </Link>

            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-xl bg-[var(--gold)] px-4 py-2 text-sm font-black text-white transition hover:bg-[var(--gold-dark)] sm:flex"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}
      <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        {/* BREADCRUMB */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[var(--foreground)]/45 sm:text-sm">
          <Link
            href="/dashboard"
            className="transition hover:text-[var(--gold-dark)]"
          >
            Dashboard
          </Link>

          <ChevronRight size={13} />

          <Link
            href="/dashboard/products"
            className="transition hover:text-[var(--gold-dark)]"
          >
            Products
          </Link>

          {category && (
            <>
              <ChevronRight size={13} />

              <Link
                href={`/dashboard/categories/${category.slug}`}
                className="transition hover:text-[var(--gold-dark)]"
              >
                {category.name}
              </Link>
            </>
          )}

          <ChevronRight size={13} />

          <span className="max-w-[180px] truncate font-bold text-[var(--foreground)]/70">
            {product.name}
          </span>
        </div>

        {/* =====================================================
            PRODUCT HERO
        ===================================================== */}
        <section className="grid gap-7 lg:grid-cols-[minmax(0,1.04fr)_minmax(420px,.96fr)] lg:gap-9 xl:gap-12">
          {/* IMAGE CARD */}
          <div className="animate-[fadeUp_.45s_ease-out] rounded-[30px] border border-[var(--border)] bg-[var(--card)] p-3 shadow-[0_20px_70px_rgba(151,117,56,0.06)] sm:p-5">
            <div className="relative aspect-square overflow-hidden rounded-[24px] bg-[var(--muted)]">
              {/* Top badges */}
              <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-2 sm:left-5 sm:top-5">
                {product.is_flash_sale && (
                  <span className="flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                    <Zap
                      size={12}
                      fill="currentColor"
                    />
                    Flash Deal
                  </span>
                )}

                {product.is_featured && (
                  <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)]/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--gold-dark)] backdrop-blur">
                    <Sparkles size={12} />
                    Featured
                  </span>
                )}
              </div>

              {/* Wishlist */}
              <button
                type="button"
                onClick={toggleWishlist}
                aria-label="Wishlist"
                className={`absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-xl transition hover:scale-105 sm:right-5 sm:top-5 ${
                  wishlist
                    ? "border-red-500/20 bg-red-500/10 text-red-500"
                    : "border-[var(--border)] bg-[var(--card)]/90 text-[var(--foreground)]/55 hover:text-red-500"
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

              {imageUrl && !imageError ? (
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-contain p-8 transition duration-700 hover:scale-[1.035] sm:p-12 lg:p-16"
                  onError={() =>
                    setImageError(true)
                  }
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-[var(--foreground)]/25">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--card)]">
                    <ImageOff size={30} />
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    Image unavailable
                  </p>
                </div>
              )}

              {/* Bottom image badge */}
              {discount > 0 && (
                <div className="absolute bottom-4 left-4 rounded-xl bg-[var(--card)]/90 px-3 py-2 text-xs font-black text-[var(--gold-dark)] shadow-lg backdrop-blur sm:bottom-5 sm:left-5">
                  Save {discount}%
                </div>
              )}
            </div>

            {/* Trust strip */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MiniTrust
                icon={<Truck size={16} />}
                text="Fast Delivery"
              />

              <MiniTrust
                icon={<RotateCcw size={16} />}
                text="Easy Returns"
              />

              <MiniTrust
                icon={<ShieldCheck size={16} />}
                text="Secure Buy"
              />

              <MiniTrust
                icon={<BadgeCheck size={16} />}
                text="Quality"
              />
            </div>
          </div>

          {/* DETAILS */}
          <div className="animate-[fadeUp_.55s_ease-out]">
            <div className="rounded-[30px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_20px_70px_rgba(151,117,56,0.05)] sm:p-7 lg:p-8">
              {/* Category + Brand */}
              <div className="flex flex-wrap items-center gap-2">
                {category && (
                  <Link
                    href={`/dashboard/categories/${category.slug}`}
                    className="rounded-full bg-[var(--gold)]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--gold-dark)] transition hover:bg-[var(--gold)] hover:text-white"
                  >
                    {category.name}
                  </Link>
                )}

                {product.brand && (
                  <span className="rounded-full bg-[var(--muted)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--foreground)]/50">
                    {product.brand}
                  </span>
                )}
              </div>

              {/* Product name */}
              <h1 className="mt-5 text-3xl font-black leading-[1.08] tracking-[-0.035em] sm:text-4xl xl:text-[43px]">
                {product.name}
              </h1>

              {/* Short description */}
              {product.short_description && (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--foreground)]/55 sm:text-[15px]">
                  {product.short_description}
                </p>
              )}

              {/* Rating */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-lg bg-[var(--gold)] px-2.5 py-1.5 text-xs font-black text-white">
                  {rating.toFixed(1)}
                  <Star
                    size={13}
                    fill="currentColor"
                  />
                </div>

                <span className="text-sm font-semibold text-[var(--foreground)]/50">
                  {(
                    product.reviews_count ??
                    0
                  ).toLocaleString(
                    "en-IN"
                  )}{" "}
                  reviews
                </span>

                <span className="h-1 w-1 rounded-full bg-[var(--border)]" />

                {stock > 0 ? (
                  <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    In Stock
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm font-bold text-red-500">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Out of Stock
                  </span>
                )}
              </div>

              <div className="my-7 h-px bg-[var(--border)]" />

              {/* Price */}
              <div>
                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-4xl font-black tracking-tight sm:text-[42px]">
                    {formatPrice(price)}
                  </span>

                  {originalPrice > price && (
                    <span className="pb-1 text-base text-[var(--foreground)]/30 line-through sm:text-lg">
                      {formatPrice(
                        originalPrice
                      )}
                    </span>
                  )}

                  {discount > 0 && (
                    <span className="mb-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-black text-emerald-600">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {savings > 0 && (
                  <p className="mt-2 text-sm font-bold text-emerald-600">
                    You save{" "}
                    {formatPrice(savings)}
                  </p>
                )}

                <p className="mt-1 text-[11px] text-[var(--foreground)]/35">
                  Inclusive of applicable taxes
                </p>
              </div>

              {/* Delivery box */}
              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold-dark)]">
                    <Truck size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-black">
                      Free delivery
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[var(--foreground)]/50">
                      Get it by{" "}
                      <span className="font-bold text-[var(--foreground)]/75">
                        {deliveryText}
                      </span>
                    </p>

                    <p className="mt-0.5 text-[11px] text-[var(--foreground)]/35">
                      Delivery availability may
                      vary by location.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              {stock > 0 && (
                <div className="mt-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black">
                      Quantity
                    </p>

                    {stock < 10 && (
                      <p className="mt-1 text-[11px] font-bold text-orange-600">
                        Only {stock} left
                      </p>
                    )}
                  </div>

                  <div className="flex h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--card)]">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          (value) =>
                            Math.max(
                              1,
                              value - 1
                            )
                        )
                      }
                      disabled={
                        quantity <= 1
                      }
                      className="flex h-full w-11 items-center justify-center text-[var(--foreground)]/45 transition hover:text-[var(--gold-dark)] disabled:opacity-25"
                    >
                      <Minus size={15} />
                    </button>

                    <span className="w-10 text-center text-sm font-black">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          (value) =>
                            Math.min(
                              stock,
                              value + 1
                            )
                        )
                      }
                      disabled={
                        quantity >= stock
                      }
                      className="flex h-full w-11 items-center justify-center text-[var(--foreground)]/45 transition hover:text-[var(--gold-dark)] disabled:opacity-25"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* Main actions */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={stock <= 0}
                  onClick={
                    handleAddToCart
                  }
                  className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-[var(--gold)] bg-[var(--gold)]/10 px-5 text-sm font-black text-[var(--gold-dark)] transition hover:-translate-y-0.5 hover:bg-[var(--gold)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ShoppingCart size={19} />
                  Add to Cart
                </button>

                <button
                  type="button"
                  disabled={stock <= 0}
                  onClick={
                    handleBuyNow
                  }
                  className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[var(--gold)] px-5 text-sm font-black text-white shadow-[0_12px_30px_rgba(185,151,91,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--gold-dark)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ShoppingBag size={19} />
                  Buy Now
                </button>
              </div>

              {/* Secondary actions */}
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
                <button
                  type="button"
                  onClick={
                    toggleWishlist
                  }
                  className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition ${
                    wishlist
                      ? "border-red-500/20 bg-red-500/10 text-red-500"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]/60 hover:border-[var(--gold)] hover:text-[var(--gold-dark)]"
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
                  onClick={
                    handleShare
                  }
                  aria-label="Share product"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-bold text-[var(--foreground)]/60 transition hover:border-[var(--gold)] hover:text-[var(--gold-dark)]"
                >
                  <Share2 size={17} />

                  <span className="hidden sm:inline">
                    Share
                  </span>
                </button>
              </div>
            </div>

            {/* Service cards */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ServiceCard
                icon={<Truck />}
                title="Free Delivery"
                text="On eligible orders"
              />

              <ServiceCard
                icon={<RotateCcw />}
                title="Easy Returns"
                text="7 day return policy"
              />

              <ServiceCard
                icon={<ShieldCheck />}
                title="Secure Payment"
                text="Safe & protected"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            PRODUCT INFORMATION
        ===================================================== */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_12px_40px_rgba(151,117,56,0.04)] sm:p-8">
            <div className="flex items-center gap-3">
              <div className="h-7 w-1 rounded-full bg-[var(--gold)]" />

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--gold-dark)]">
                  PRODUCT INFORMATION
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Product Details
                </h2>
              </div>
            </div>

            {/* Info grid */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoItem
                label="Brand"
                value={
                  product.brand ||
                  "PrimeCart"
                }
              />

              <InfoItem
                label="Category"
                value={
                  category?.name ||
                  "General"
                }
              />

              <InfoItem
                label="Availability"
                value={
                  stock > 0
                    ? "In Stock"
                    : "Out of Stock"
                }
              />

              <InfoItem
                label="Customer Rating"
                value={`${rating.toFixed(
                  1
                )} / 5`}
              />
            </div>

            <div className="mt-7 border-t border-[var(--border)] pt-7">
              <h3 className="text-base font-black">
                About this product
              </h3>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--foreground)]/55 sm:text-[15px]">
                {product.description ||
                  product.short_description ||
                  "No detailed description is available for this product."}
              </p>
            </div>
          </div>

          {/* Promise */}
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_12px_40px_rgba(151,117,56,0.04)] sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--gold-dark)]">
              PRIMECART PROMISE
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Shop with confidence
            </h2>

            <div className="mt-6 space-y-5">
              <PromiseItem
                icon={<Truck />}
                title="Reliable Delivery"
                text="Fast and carefully handled delivery."
              />

              <PromiseItem
                icon={<ShieldCheck />}
                title="Secure Checkout"
                text="Protected shopping experience."
              />

              <PromiseItem
                icon={<RotateCcw />}
                title="Easy Returns"
                text="Simple returns on eligible products."
              />

              <PromiseItem
                icon={<BadgeCheck />}
                title="Quality Assured"
                text="Product information from your catalog."
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            HIGHLIGHTS
        ===================================================== */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <HighlightCard
            icon={
              <Check
                size={21}
              />
            }
            title="Genuine Product"
            text="Quality checked products."
          />

          <HighlightCard
            icon={
              <Truck
                size={21}
              />
            }
            title="Fast Delivery"
            text="Reliable delivery service."
          />

          <HighlightCard
            icon={
              <ShieldCheck
                size={21}
              />
            }
            title="Secure Shopping"
            text="Your purchase is protected."
          />

          <HighlightCard
            icon={
              <RotateCcw
                size={21}
              />
            }
            title="Easy Returns"
            text="Simple return experience."
          />
        </section>

        {/* =====================================================
            RELATED PRODUCTS
        ===================================================== */}
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gold-dark)]">
                YOU MAY ALSO LIKE
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Related Products
              </h2>

              <p className="mt-1 text-sm text-[var(--foreground)]/45">
                More products from{" "}
                <span className="font-bold text-[var(--foreground)]/65">
                  {category?.name ||
                    "this collection"}
                </span>
              </p>
            </div>

            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={() =>
                  scrollRelated("left")
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]/55 transition hover:border-[var(--gold)] hover:text-[var(--gold-dark)]"
              >
                <ArrowLeft size={17} />
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollRelated("right")
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]/55 transition hover:border-[var(--gold)] hover:text-[var(--gold-dark)]"
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
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {relatedProducts.map(
                (
                  relatedProduct,
                  index
                ) => (
                  <RelatedProductCard
                    key={
                      relatedProduct.id
                    }
                    product={
                      relatedProduct
                    }
                    index={index}
                  />
                )
              )}
            </div>
          ) : (
            <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--gold)]">
                <Sparkles size={25} />
              </div>

              <h3 className="mt-4 text-lg font-black">
                More products coming soon
              </h3>

              <p className="mt-1 text-sm text-[var(--foreground)]/45">
                There are no more products in
                this category yet.
              </p>
            </div>
          )}
        </section>

        {/* =====================================================
            BOTTOM CTA
        ===================================================== */}
        <section className="relative mt-10 overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--card)]">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[var(--gold)]/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 p-7 sm:p-10 md:flex-row md:items-center md:justify-between lg:p-12">
            <div>
              <div className="flex items-center gap-2 text-[var(--gold-dark)]">
                <Sparkles size={17} />

                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  PrimeCart Shopping
                </span>
              </div>

              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                Find something else you'll love.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--foreground)]/45">
                Explore more products, categories
                and exclusive PrimeCart deals.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[var(--gold)] px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[var(--gold-dark)]"
            >
              Browse All Products
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </div>

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}
      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .related-card-animation {
          animation: cardIn 0.45s ease both;
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function MiniTrust({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl bg-[var(--muted)] px-2 py-3">
      <span className="text-[var(--gold-dark)]">
        {icon}
      </span>

      <span className="text-[10px] font-bold text-[var(--foreground)]/60 sm:text-[11px]">
        {text}
      </span>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold-dark)]">
        {icon}
      </div>

      <p className="mt-3 text-xs font-black">
        {title}
      </p>

      <p className="mt-1 text-[10px] leading-5 text-[var(--foreground)]/45">
        {text}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[var(--muted)] px-4 py-3.5">
      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--foreground)]/35">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold">
        {value}
      </p>
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
        <h3 className="text-sm font-black">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-[var(--foreground)]/45">
          {text}
        </p>
      </div>
    </div>
  );
}

function HighlightCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(151,117,56,0.08)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold-dark)]">
        {icon}
      </div>

      <p className="mt-3 text-sm font-black">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-[var(--foreground)]/45">
        {text}
      </p>
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
  const imageUrl =
    getImageUrl(product.image_url);

  const price = Number(
    product.price ?? 0
  );

  const originalPrice = Number(
    product.original_price ?? 0
  );

  const rating = Number(
    product.rating ?? 0
  );

  const discount = getDiscount(
    price,
    originalPrice
  );

  return (
    <Link
      href={`/dashboard/products/${product.id}`}
      className="related-card-animation group w-[250px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition duration-300 hover:-translate-y-1 hover:border-[var(--gold)] hover:shadow-[0_18px_45px_rgba(151,117,56,0.12)] sm:w-[275px]"
      style={{
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Image */}
      <div className="relative h-[235px] overflow-hidden bg-[var(--muted)]">
        {product.is_flash_sale && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-[var(--gold)] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white">
            <Zap
              size={10}
              fill="currentColor"
            />
            Deal
          </div>
        )}

        {!product.is_flash_sale &&
          discount > 0 && (
            <div className="absolute left-3 top-3 z-10 rounded-full bg-[var(--gold)]/10 px-2.5 py-1 text-[9px] font-black text-[var(--gold-dark)]">
              {discount}% OFF
            </div>
          )}

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            unoptimized
            sizes="275px"
            className="object-contain p-6 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--foreground)]/25">
            <ImageOff size={40} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--gold-dark)]">
          {product.brand ||
            "PrimeCart"}
        </p>

        <h3 className="mt-1.5 line-clamp-2 min-h-[42px] text-sm font-black leading-5">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="mt-3 flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-md bg-[var(--gold)] px-1.5 py-1 text-[10px] font-black text-white">
            {rating.toFixed(1)}
            <Star
              size={9}
              fill="currentColor"
            />
          </span>

          <span className="text-[10px] text-[var(--foreground)]/35">
            {product.reviews_count ??
              0}{" "}
            reviews
          </span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-end gap-2">
          <span className="text-lg font-black">
            {formatPrice(price)}
          </span>

          {originalPrice > price && (
            <span className="pb-0.5 text-[11px] text-[var(--foreground)]/30 line-through">
              {formatPrice(
                originalPrice
              )}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
          <Truck size={12} />
          Free delivery
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   LOADING
========================================================= */

function ProductLoading() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex h-[68px] max-w-[1500px] items-center px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-[var(--muted)]" />

            <div>
              <div className="h-5 w-28 animate-pulse rounded bg-[var(--muted)]" />

              <div className="mt-1.5 h-2 w-16 animate-pulse rounded bg-[var(--muted)]" />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6 h-4 w-64 animate-pulse rounded bg-[var(--muted)]" />

        <div className="grid gap-7 lg:grid-cols-[1.04fr_.96fr]">
          <div className="aspect-square animate-pulse rounded-[30px] bg-[var(--muted)]" />

          <div className="space-y-4">
            <div className="h-[580px] animate-pulse rounded-[30px] bg-[var(--muted)]" />

            <div className="h-28 animate-pulse rounded-2xl bg-[var(--muted)]" />
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   RELATED SKELETON
========================================================= */

function RelatedSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="w-[250px] shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] sm:w-[275px]"
        >
          <div className="h-[235px] animate-pulse bg-[var(--muted)]" />

          <div className="space-y-3 p-4">
            <div className="h-2.5 w-20 animate-pulse rounded bg-[var(--muted)]" />

            <div className="h-4 w-full animate-pulse rounded bg-[var(--muted)]" />

            <div className="h-4 w-28 animate-pulse rounded bg-[var(--muted)]" />

            <div className="h-6 w-24 animate-pulse rounded bg-[var(--muted)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
