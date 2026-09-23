"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Heart,
  ImageOff,
  Minus,
  PackageCheck,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  UserRound,
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
  created_at?: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type CartItem = {
  id: string;
  product_id?: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  stock?: number | null;
};

/* =========================================================
   HELPERS
========================================================= */

const CART_KEY = "primecart-cart";
const WISHLIST_KEY = "primecart-wishlist";
const RECENT_KEY = "primecart-recently-viewed";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getImageCandidates(value: string | null) {
  if (!value) return [];

  const image = value.trim();

  if (!image) return [];

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return [image];
  }

  if (image.startsWith("/")) {
    return [image];
  }

  return [`/${image}`, `/products/${image}`];
}

function getDiscount(
  price: number,
  originalPrice: number | null,
) {
  if (!originalPrice || originalPrice <= price) return 0;

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100,
  );
}

function getSavings(
  price: number,
  originalPrice: number | null,
) {
  if (!originalPrice || originalPrice <= price) return 0;

  return originalPrice - price;
}

function safeParse<T>(
  value: string | null,
  fallback: T,
): T {
  try {
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/* =========================================================
   PRODUCT IMAGE
========================================================= */

function ProductImage({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  const candidates = useMemo(
    () => getImageCandidates(src),
    [src],
  );

  const current = candidates[index];

  if (!current) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-[#faf7f0] ${className}`}
      >
        <div className="flex flex-col items-center gap-2 text-[#b8aa93]">
          <ImageOff size={42} strokeWidth={1.4} />
          <span className="text-xs font-medium">
            Image unavailable
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={current}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 1024px) 100vw, 55vw"
      className={`object-contain ${className}`}
      onError={() => {
        if (index < candidates.length - 1) {
          setIndex((value) => value + 1);
        }
      }}
    />
  );
}

/* =========================================================
   STAR RATING
========================================================= */

function StarRating({
  rating,
  reviews,
  large = false,
}: {
  rating: number;
  reviews: number;
  large?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        className={`inline-flex items-center gap-1.5 rounded-lg bg-[#f5ead7] px-2.5 py-1.5 ${
          large ? "text-sm" : "text-xs"
        } font-bold text-[#8d672d]`}
      >
        <span>{rating.toFixed(1)}</span>

        <Star
          className="fill-current"
          size={large ? 16 : 13}
        />
      </div>

      <span
        className={`${
          large ? "text-sm" : "text-xs"
        } text-[#938775]`}
      >
        {reviews.toLocaleString("en-IN")}{" "}
        {reviews === 1 ? "review" : "reviews"}
      </span>
    </div>
  );
}

/* =========================================================
   RELATED PRODUCT CARD
========================================================= */

function RelatedProductCard({
  product,
  onWishlist,
  wishlisted,
}: {
  product: Product;
  onWishlist: (product: Product) => void;
  wishlisted: boolean;
}) {
  const discount = getDiscount(
    Number(product.price),
    product.original_price
      ? Number(product.original_price)
      : null,
  );

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#ebe1d2] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#d8c298] hover:shadow-[0_20px_50px_rgba(79,57,24,0.10)]">
      <div className="relative aspect-square overflow-hidden bg-[#faf7f0]">
        <Link href={`/dashboard/products/${product.id}`}>
          <ProductImage
            src={product.image_url}
            alt={product.name}
            className="p-7 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </Link>

        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-[#f1dfbc] px-2.5 py-1 text-[9px] font-extrabold text-[#8b642c]">
            {discount}% OFF
          </span>
        )}

        <button
          type="button"
          onClick={() => onWishlist(product)}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition ${
            wishlisted
              ? "border-red-200 bg-red-50 text-red-500"
              : "border-white bg-white/90 text-[#8a7c68] hover:text-[#a97b32]"
          }`}
        >
          <Heart
            size={16}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="p-4">
        {product.brand && (
          <p className="truncate text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#a28c68]">
            {product.brand}
          </p>
        )}

        <Link href={`/dashboard/products/${product.id}`}>
          <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-bold leading-5 text-[#403427] transition hover:text-[#a77b32]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3">
          <StarRating
            rating={Number(product.rating || 0)}
            reviews={Number(product.reviews_count || 0)}
          />
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-lg font-black text-[#3d3124]">
            {formatPrice(Number(product.price))}
          </span>

          {product.original_price &&
            Number(product.original_price) >
              Number(product.price) && (
              <span className="pb-0.5 text-xs text-[#aaa092] line-through">
                {formatPrice(
                  Number(product.original_price),
                )}
              </span>
            )}
        </div>

        <Link
          href={`/dashboard/products/${product.id}`}
          className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e5d9c7] bg-[#fffdf9] text-xs font-bold text-[#735a36] transition hover:border-[#cdb27e] hover:bg-[#faf3e6]"
        >
          View Product
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-[#faf8f3]">
      <div className="h-16 animate-pulse border-b border-[#eee5d8] bg-white" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-4 w-72 animate-pulse rounded bg-[#eee6da]" />

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-[#eee6da]" />

          <div className="space-y-5">
            <div className="h-5 w-28 animate-pulse rounded bg-[#eee6da]" />
            <div className="h-12 w-4/5 animate-pulse rounded bg-[#eee6da]" />
            <div className="h-20 animate-pulse rounded bg-[#eee6da]" />
            <div className="h-16 w-1/2 animate-pulse rounded bg-[#eee6da]" />
            <div className="h-14 animate-pulse rounded-xl bg-[#eee6da]" />
            <div className="h-14 animate-pulse rounded-xl bg-[#eee6da]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    [],
  );

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

  const [moreProducts, setMoreProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [wishlisted, setWishlisted] =
    useState(false);

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  const [cartLoading, setCartLoading] =
    useState(false);

  const [activeImage, setActiveImage] =
    useState<string | null>(null);

  const [shareMessage, setShareMessage] =
    useState("");

  const [toast, setToast] = useState("");

  const [activeTab, setActiveTab] =
    useState<"description" | "specifications" | "reviews">(
      "description",
    );

  const [showAllDescription, setShowAllDescription] =
    useState(false);

  const [recentIds, setRecentIds] =
    useState<string[]>([]);

  const [recentProducts, setRecentProducts] =
    useState<Product[]>([]);

  /* =======================================================
     TOAST
  ======================================================= */

  const showToast = useCallback(
    (message: string) => {
      setToast(message);

      window.setTimeout(() => {
        setToast("");
      }, 2500);
    },
    [],
  );

  /* =======================================================
     LOAD PRODUCT
  ======================================================= */

  useEffect(() => {
    if (!productId) return;

    let mounted = true;

    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const { data, error: productError } =
          await supabase
            .from("products")
            .select("*")
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

        const mainCandidates = getImageCandidates(
          loadedProduct.image_url,
        );

        setActiveImage(mainCandidates[0] || null);

        /* CATEGORY */

        if (loadedProduct.category_id) {
          const { data: categoryData } =
            await supabase
              .from("categories")
              .select("id,name,slug")
              .eq(
                "id",
                loadedProduct.category_id,
              )
              .maybeSingle();

          if (mounted && categoryData) {
            setCategory(categoryData as Category);
          }

          /* SAME CATEGORY */

          const { data: relatedData } =
            await supabase
              .from("products")
              .select("*")
              .eq(
                "category_id",
                loadedProduct.category_id,
              )
              .eq("is_active", true)
              .neq("id", loadedProduct.id)
              .order("is_featured", {
                ascending: false,
              })
              .order("rating", {
                ascending: false,
              })
              .limit(8);

          if (mounted && relatedData) {
            setRelatedProducts(
              relatedData as Product[],
            );
          }

          /* MORE FROM CATEGORY */

          const { data: moreData } =
            await supabase
              .from("products")
              .select("*")
              .eq(
                "category_id",
                loadedProduct.category_id,
              )
              .eq("is_active", true)
              .neq("id", loadedProduct.id)
              .order("created_at", {
                ascending: false,
              })
              .limit(12);

          if (mounted && moreData) {
            setMoreProducts(
              moreData as Product[],
            );
          }
        }

        /* WISHLIST */

        const {
          data: { user },
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

        /* RECENTLY VIEWED */

        try {
          const current = safeParse<string[]>(
            localStorage.getItem(RECENT_KEY),
            [],
          );

          const next = [
            loadedProduct.id,
            ...current.filter(
              (id) => id !== loadedProduct.id,
            ),
          ].slice(0, 10);

          localStorage.setItem(
            RECENT_KEY,
            JSON.stringify(next),
          );

          if (mounted) {
            setRecentIds(next);
          }
        } catch {
          // Ignore local storage errors.
        }

        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);

        if (mounted) {
          setError(
            "Something went wrong while loading the product.",
          );
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
     LOAD RECENT PRODUCTS
  ======================================================= */

  useEffect(() => {
    if (!recentIds.length) return;

    async function loadRecentProducts() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .in("id", recentIds)
        .eq("is_active", true);

      if (!data) return;

      const ordered = recentIds
        .map((id) =>
          (data as Product[]).find(
            (item) => item.id === id,
          ),
        )
        .filter(Boolean) as Product[];

      setRecentProducts(ordered);
    }

    loadRecentProducts();
  }, [recentIds, supabase]);

  /* =======================================================
     NULL GUARD
  ======================================================= */

  if (loading) {
    return <ProductSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f3] px-4">
        <div className="w-full max-w-lg rounded-3xl border border-[#e8dece] bg-white p-8 text-center shadow-[0_25px_70px_rgba(72,50,20,0.10)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f7edda] text-[#a87b32]">
            <ShoppingBag size={30} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-[#3f3326]">
            Product unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#938675]">
            {error || "This product could not be found."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#e4d9c9] px-5 text-sm font-bold text-[#5e4e3a] transition hover:bg-[#faf5ec]"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>

            <Link
              href="/dashboard/products"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#b9975b] px-5 text-sm font-bold text-white transition hover:bg-[#a77e42]"
            >
              Browse Products
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     DERIVED
  ======================================================= */

  const currentProduct = product;

  const price = Number(currentProduct.price || 0);

  const originalPrice = currentProduct.original_price
    ? Number(currentProduct.original_price)
    : null;

  const discount = getDiscount(
    price,
    originalPrice,
  );

  const savings = getSavings(
    price,
    originalPrice,
  );

  const rating = Number(
    currentProduct.rating || 0,
  );

  const reviews = Number(
    currentProduct.reviews_count || 0,
  );

  const stock = Number(
    currentProduct.stock || 0,
  );

  const outOfStock = stock <= 0;

  const maxQuantity = Math.max(
    1,
    Math.min(stock, 10),
  );

  const description =
    currentProduct.description ||
    currentProduct.short_description ||
    "Product details are not available yet.";

  /* =======================================================
     CART
  ======================================================= */

  function addToCart(quantityToAdd = quantity) {
    if (outOfStock || cartLoading) return;

    setCartLoading(true);

    try {
      const cart = safeParse<CartItem[]>(
        localStorage.getItem(CART_KEY),
        [],
      );

      const index = cart.findIndex(
        (item) =>
          item.product_id === currentProduct.id ||
          item.id === currentProduct.id,
      );

      if (index >= 0) {
        cart[index].quantity = Math.min(
          stock,
          Number(cart[index].quantity || 0) +
            quantityToAdd,
        );
      } else {
        cart.push({
          id: currentProduct.id,
          product_id: currentProduct.id,
          name: currentProduct.name,
          price,
          image_url: currentProduct.image_url,
          quantity: Math.min(
            quantityToAdd,
            stock,
          ),
          stock,
        });
      }

      localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart),
      );

      window.dispatchEvent(
        new Event("cart-updated"),
      );

      showToast("Product added to cart");
    } catch (err) {
      console.error(err);
      showToast("Unable to add product");
    } finally {
      window.setTimeout(() => {
        setCartLoading(false);
      }, 450);
    }
  }

  /* =======================================================
     BUY NOW
  ======================================================= */

  function buyNow() {
    if (outOfStock) return;

    try {
      const cart = safeParse<CartItem[]>(
        localStorage.getItem(CART_KEY),
        [],
      );

      const index = cart.findIndex(
        (item) =>
          item.product_id === currentProduct.id ||
          item.id === currentProduct.id,
      );

      if (index >= 0) {
        cart[index].quantity = Math.min(
          stock,
          quantity,
        );
      } else {
        cart.push({
          id: currentProduct.id,
          product_id: currentProduct.id,
          name: currentProduct.name,
          price,
          image_url: currentProduct.image_url,
          quantity,
          stock,
        });
      }

      localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart),
      );

      window.dispatchEvent(
        new Event("cart-updated"),
      );

      router.push("/dashboard/checkout");
    } catch {
      showToast("Unable to continue to checkout");
    }
  }

  /* =======================================================
     WISHLIST
  ======================================================= */

  async function toggleWishlist() {
    if (wishlistLoading) return;

    setWishlistLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      if (wishlisted) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq(
            "product_id",
            currentProduct.id,
          );

        if (error) throw error;

        setWishlisted(false);
        showToast("Removed from wishlist");
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: currentProduct.id,
          });

        if (error) {
          if (
            !error.message
              .toLowerCase()
              .includes("duplicate")
          ) {
            throw error;
          }
        }

        setWishlisted(true);
        showToast("Added to wishlist");
      }
    } catch (err) {
      console.error(err);
      showToast("Unable to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  }

  /* =======================================================
     RELATED WISHLIST
  ======================================================= */

  async function toggleRelatedWishlist(
    item: Product,
  ) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: existing } =
        await supabase
          .from("wishlist")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", item.id)
          .maybeSingle();

      if (existing) {
        await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", item.id);

        showToast("Removed from wishlist");
      } else {
        await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: item.id,
          });

        showToast("Added to wishlist");
      }
    } catch {
      showToast("Unable to update wishlist");
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
          title: currentProduct.name,
          text:
            currentProduct.short_description ||
            `Check out ${currentProduct.name} on PrimeCart.`,
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(url);

      setShareMessage("Link copied!");

      window.setTimeout(() => {
        setShareMessage("");
      }, 2200);
    } catch {
      // user cancelled
    }
  }

  /* =======================================================
     SCROLL HELPERS
  ======================================================= */

  function scrollToSection(id: string) {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#43372a]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#e9dfcf] bg-[#fffdf9]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5dbcb] bg-white transition hover:bg-[#f8f2e8]"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>

            <Link
              href="/dashboard/products"
              className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-[#6b5941] transition hover:bg-[#f8f2e8] sm:flex"
            >
              <ShoppingBag
                size={16}
                className="text-[#b18a4e]"
              />
              Products
            </Link>
          </div>

          <Link
            href="/dashboard"
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#d8b66a] to-[#a77d36] text-sm font-black text-white shadow-lg shadow-[#b9975b]/20">
              P
            </div>

            <span className="hidden text-lg font-black tracking-tight sm:block">
              Prime
              <span className="text-[#b9975b]">
                Cart
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={shareProduct}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5dbcb] bg-white transition hover:bg-[#f8f2e8]"
              aria-label="Share"
            >
              <Share2 size={17} />

              {shareMessage && (
                <span className="absolute right-0 top-12 whitespace-nowrap rounded-lg bg-[#34291d] px-3 py-2 text-xs font-bold text-white shadow-xl">
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
                  : "border-[#e5dbcb] bg-white hover:bg-[#f8f2e8]"
              }`}
            >
              <Heart
                size={18}
                fill={
                  wishlisted
                    ? "currentColor"
                    : "none"
                }
              />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <div className="mx-auto max-w-[1400px] px-4 pt-5 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-[#9a8d7b]">
          <Link
            href="/dashboard"
            className="transition hover:text-[#a47a34]"
          >
            Home
          </Link>

          <ChevronRight size={13} />

          <Link
            href="/dashboard/products"
            className="transition hover:text-[#a47a34]"
          >
            Products
          </Link>

          {category && (
            <>
              <ChevronRight size={13} />

              <Link
                href={`/dashboard/categories/${category.slug}`}
                className="transition hover:text-[#a47a34]"
              >
                {category.name}
              </Link>
            </>
          )}

          <ChevronRight size={13} />

          <span className="max-w-[240px] truncate font-semibold text-[#514333]">
            {currentProduct.name}
          </span>
        </nav>
      </div>

      {/* =====================================================
          MAIN PRODUCT AREA
      ===================================================== */}

      <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          {/* =================================================
              LEFT GALLERY
          ================================================= */}

          <section>
            <div className="relative overflow-hidden rounded-[28px] border border-[#e9dfcf] bg-white shadow-[0_15px_50px_rgba(67,48,20,0.06)]">
              <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
                {currentProduct.is_featured && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3e3224] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                    <Sparkles size={11} />
                    Featured
                  </span>
                )}

                {currentProduct.is_flash_sale && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e74a3b] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                    <Zap
                      size={11}
                      fill="currentColor"
                    />
                    Flash Deal
                  </span>
                )}
              </div>

              {discount > 0 && (
                <span className="absolute right-5 top-5 z-10 rounded-full bg-[#f0dfbe] px-3 py-1.5 text-[10px] font-extrabold text-[#8d672d]">
                  {discount}% OFF
                </span>
              )}

              <div className="relative aspect-square min-h-[360px] bg-[#faf7f0] sm:min-h-[480px]">
                {activeImage ? (
                  <ProductImage
                    src={activeImage}
                    alt={currentProduct.name}
                    priority
                    className="p-10 transition-transform duration-700 hover:scale-[1.025] sm:p-14 lg:p-20"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageOff
                      size={55}
                      className="text-[#b9a98d]"
                    />
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-[#c39b54]/5" />
              </div>
            </div>

            {/* THUMBNAILS */}

            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {getImageCandidates(
                currentProduct.image_url,
              ).map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  type="button"
                  onClick={() =>
                    setActiveImage(item)
                  }
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all ${
                    activeImage === item
                      ? "border-[#b9975b] shadow-[0_6px_20px_rgba(185,151,91,0.20)]"
                      : "border-[#e7ddce] hover:border-[#ceb47f]"
                  }`}
                >
                  <ProductImage
                    src={item}
                    alt={`${currentProduct.name} ${index + 1}`}
                    className="p-2"
                  />
                </button>
              ))}
            </div>

            {/* TRUST */}

            <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-[#e9dfd1] bg-white">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure",
                  text: "Safe payment",
                },
                {
                  icon: Truck,
                  title: "Fast Delivery",
                  text: "Reliable shipping",
                },
                {
                  icon: RotateCcw,
                  title: "Easy Returns",
                  text: "Simple returns",
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={`flex flex-col items-center justify-center gap-1 px-2 py-4 text-center ${
                      index !== 0
                        ? "border-l border-[#eee5d8]"
                        : ""
                    }`}
                  >
                    <Icon
                      size={20}
                      className="text-[#b18a4e]"
                    />

                    <p className="text-[10px] font-extrabold text-[#514333] sm:text-xs">
                      {item.title}
                    </p>

                    <p className="hidden text-[9px] text-[#a09584] sm:block">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* =================================================
              RIGHT PRODUCT INFO
          ================================================= */}

          <section className="lg:sticky lg:top-24 lg:self-start">
            {currentProduct.brand && (
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#a67a36]">
                {currentProduct.brand}
              </p>
            )}

            <h1 className="mt-2 text-3xl font-black leading-[1.08] tracking-[-0.035em] text-[#3d3023] sm:text-4xl lg:text-[46px]">
              {currentProduct.name}
            </h1>

            {currentProduct.short_description && (
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#887b69] sm:text-base">
                {currentProduct.short_description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <StarRating
                rating={rating}
                reviews={reviews}
                large
              />

              {!outOfStock && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf6e9] px-3 py-1.5 text-xs font-bold text-[#628354]">
                  <span className="h-2 w-2 rounded-full bg-[#75a15e]" />
                  In Stock
                </span>
              )}
            </div>

            <div className="my-6 h-px bg-[#e9dfd1]" />

            {/* PRICE CARD */}

            <div className="rounded-2xl border border-[#e9decd] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-4xl font-black tracking-[-0.035em] text-[#3c3023]">
                  {formatPrice(price)}
                </span>

                {originalPrice &&
                  originalPrice > price && (
                    <span className="pb-1 text-base text-[#a59a89] line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}

                {discount > 0 && (
                  <span className="mb-1 rounded-lg bg-[#e9f5e5] px-2.5 py-1 text-xs font-extrabold text-[#668b57]">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {savings > 0 && (
                <p className="mt-2 text-sm font-bold text-[#648957]">
                  You save {formatPrice(savings)}
                </p>
              )}

              <p className="mt-2 text-[11px] text-[#9c9181]">
                Inclusive of applicable taxes
              </p>
            </div>

            {/* FLASH */}

            {currentProduct.is_flash_sale && (
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#efd9a8] bg-[#fff7e6] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f9e8c0] text-[#aa7929]">
                    <Clock3 size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-extrabold text-[#6f4f20]">
                      Limited-time deal
                    </p>

                    <p className="text-[11px] text-[#9a753f]">
                      Grab this offer while it lasts.
                    </p>
                  </div>
                </div>

                <Zap
                  size={20}
                  className="fill-[#dca43c] text-[#dca43c]"
                />
              </div>
            )}

            {/* DELIVERY */}

            <div className="mt-5 rounded-2xl border border-[#e9dfd1] bg-white p-5">
              <div className="flex items-center gap-2">
                <Truck
                  size={18}
                  className="text-[#ad8240]"
                />

                <h3 className="text-sm font-extrabold">
                  Delivery & Service
                </h3>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#faf7f0] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#a0917e]">
                    Delivery
                  </p>

                  <p className="mt-1 text-xs font-bold text-[#4f4130]">
                    Fast doorstep delivery
                  </p>
                </div>

                <div className="rounded-xl bg-[#faf7f0] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#a0917e]">
                    Returns
                  </p>

                  <p className="mt-1 text-xs font-bold text-[#4f4130]">
                    Easy eligible returns
                  </p>
                </div>
              </div>
            </div>

            {/* STOCK */}

            <div className="mt-5 flex items-center justify-between">
              <div>
                {outOfStock ? (
                  <p className="text-sm font-extrabold text-red-500">
                    Currently unavailable
                  </p>
                ) : stock <= 10 ? (
                  <p className="text-sm font-bold text-orange-500">
                    Only {stock} left in stock
                  </p>
                ) : (
                  <p className="text-sm font-bold text-[#668b57]">
                    Available in stock
                  </p>
                )}
              </div>

              {!outOfStock && (
                <div className="h-2 w-32 overflow-hidden rounded-full bg-[#eee5d8]">
                  <div
                    className="h-full rounded-full bg-[#b9975b] transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          18,
                          (stock / 50) * 100,
                        ),
                      )}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* QUANTITY */}

            <div className="mt-6">
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#817361]">
                Quantity
              </p>

              <div className="flex w-fit items-center overflow-hidden rounded-xl border border-[#e2d7c6] bg-white">
                <button
                  type="button"
                  disabled={
                    quantity <= 1 ||
                    outOfStock
                  }
                  onClick={() =>
                    setQuantity((value) =>
                      Math.max(1, value - 1),
                    )
                  }
                  className="flex h-12 w-12 items-center justify-center transition hover:bg-[#faf5ed] disabled:opacity-30"
                >
                  <Minus size={16} />
                </button>

                <span className="flex h-12 w-14 items-center justify-center border-x border-[#e2d7c6] text-sm font-black">
                  {quantity}
                </span>

                <button
                  type="button"
                  disabled={
                    quantity >= maxQuantity ||
                    outOfStock
                  }
                  onClick={() =>
                    setQuantity((value) =>
                      Math.min(
                        maxQuantity,
                        value + 1,
                      ),
                    )
                  }
                  className="flex h-12 w-12 items-center justify-center transition hover:bg-[#faf5ed] disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => addToCart()}
                disabled={
                  outOfStock ||
                  cartLoading
                }
                className="group flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#b9975b] bg-white text-sm font-extrabold text-[#98702f] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#fbf5e9] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart
                  size={20}
                  className="transition-transform group-hover:scale-110"
                />

                {cartLoading
                  ? "Adding..."
                  : "Add to Cart"}
              </button>

              <button
                type="button"
                onClick={buyNow}
                disabled={outOfStock}
                className="group flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#b9975b] text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(185,151,91,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a77f42] hover:shadow-[0_18px_40px_rgba(185,151,91,0.32)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag
                  size={20}
                  className="transition-transform group-hover:scale-110"
                />

                Buy Now
              </button>
            </div>

            <button
              type="button"
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className={`mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border text-sm font-extrabold transition ${
                wishlisted
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-[#e4d9ca] bg-white hover:bg-[#faf5ed]"
              }`}
            >
              <Heart
                size={17}
                fill={
                  wishlisted
                    ? "currentColor"
                    : "none"
                }
              />

              {wishlisted
                ? "Saved to Wishlist"
                : "Add to Wishlist"}
            </button>

            {/* BENEFITS */}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure Checkout",
                  text: "Protected payment experience",
                },
                {
                  icon: PackageCheck,
                  title: "Quality Checked",
                  text: "Carefully listed products",
                },
                {
                  icon: RefreshCcw,
                  title: "Easy Returns",
                  text: "Simple eligible returns",
                },
                {
                  icon: UserRound,
                  title: "Prime Support",
                  text: "Help when you need it",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[#ebe1d3] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7edda] text-[#a67a35]">
                        <Icon size={16} />
                      </div>

                      <div>
                        <p className="text-xs font-extrabold">
                          {item.title}
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-[#9a8f80]">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* =================================================
            QUICK INFO STRIP
        ================================================= */}

        <section className="mt-12 grid overflow-hidden rounded-3xl border border-[#e9dfd1] bg-white sm:grid-cols-3">
          {[
            {
              icon: Truck,
              title: "Fast & Reliable Delivery",
              text: "Get your order delivered safely to your doorstep.",
            },
            {
              icon: ShieldCheck,
              title: "Secure Shopping",
              text: "Your checkout and payment experience stays protected.",
            },
            {
              icon: RotateCcw,
              title: "Easy Returns",
              text: "Eligible products come with a simple return experience.",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`flex items-start gap-4 p-6 ${
                  index !== 0
                    ? "border-t sm:border-l sm:border-t-0"
                    : ""
                } border-[#eee5d8]`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7edda] text-[#a77c38]">
                  <Icon size={20} />
                </div>

                <div>
                  <h3 className="text-sm font-extrabold">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#988c7b]">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* =================================================
            PRODUCT INFORMATION
        ================================================= */}

        <section
          id="product-information"
          className="scroll-mt-24 mt-12 overflow-hidden rounded-3xl border border-[#e9dfd1] bg-white"
        >
          {/* TABS */}

          <div className="border-b border-[#eee5d8] px-4 sm:px-7">
            <div className="flex gap-7 overflow-x-auto">
              {[
                {
                  id: "description",
                  label: "About this product",
                },
                {
                  id: "specifications",
                  label: "Specifications",
                },
                {
                  id: "reviews",
                  label: "Ratings & Reviews",
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.id as
                        | "description"
                        | "specifications"
                        | "reviews",
                    )
                  }
                  className={`relative whitespace-nowrap py-5 text-sm font-extrabold transition ${
                    activeTab === tab.id
                      ? "text-[#9d712f]"
                      : "text-[#887b6a] hover:text-[#554737]"
                  }`}
                >
                  {tab.label}

                  {activeTab === tab.id && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#b9975b]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            {/* DESCRIPTION */}

            {activeTab === "description" && (
              <div className="animate-[fadeIn_.35s_ease-out]">
                <div className="max-w-4xl">
                  <h2 className="text-2xl font-black tracking-tight text-[#3f3224]">
                    About this product
                  </h2>

                  <div
                    className={`mt-5 overflow-hidden text-sm leading-8 text-[#817667] ${
                      showAllDescription
                        ? ""
                        : "max-h-48"
                    }`}
                  >
                    <p className="whitespace-pre-line">
                      {description}
                    </p>
                  </div>

                  {description.length > 500 && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowAllDescription(
                          (value) => !value,
                        )
                      }
                      className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-[#a47732]"
                    >
                      {showAllDescription
                        ? "Show Less"
                        : "Read More"}

                      <ChevronDown
                        size={14}
                        className={
                          showAllDescription
                            ? "rotate-180"
                            : ""
                        }
                      />
                    </button>
                  )}
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    "Quality Checked",
                    "Secure Payment",
                    "Easy Returns",
                    "Reliable Support",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-[#ebe2d5] bg-[#fcfaf6] p-4"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf4e5] text-[#6e915e]">
                        <Check size={15} />
                      </div>

                      <span className="text-xs font-bold text-[#554737]">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SPECIFICATIONS */}

            {activeTab === "specifications" && (
              <div className="animate-[fadeIn_.35s_ease-out]">
                <h2 className="text-2xl font-black tracking-tight">
                  Product Specifications
                </h2>

                <div className="mt-6 overflow-hidden rounded-2xl border border-[#ebe2d5]">
                  {[
                    [
                      "Brand",
                      currentProduct.brand ||
                        "PrimeCart",
                    ],
                    [
                      "Category",
                      category?.name || "General",
                    ],
                    [
                      "Product ID",
                      currentProduct.id,
                    ],
                    [
                      "Availability",
                      outOfStock
                        ? "Out of Stock"
                        : "In Stock",
                    ],
                    [
                      "Customer Rating",
                      `${rating.toFixed(1)} / 5`,
                    ],
                    [
                      "Reviews",
                      reviews.toLocaleString(
                        "en-IN",
                      ),
                    ],
                  ].map(([label, value], index) => (
                    <div
                      key={label}
                      className={`grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[220px_1fr] ${
                        index !== 0
                          ? "border-t border-[#eee5d8]"
                          : ""
                      } ${
                        index % 2 === 0
                          ? "bg-[#fcfaf6]"
                          : "bg-white"
                      }`}
                    >
                      <span className="text-xs font-bold text-[#938775]">
                        {label}
                      </span>

                      <span className="break-all text-xs font-extrabold text-[#4c3e2e]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEWS */}

            {activeTab === "reviews" && (
              <div className="animate-[fadeIn_.35s_ease-out]">
                <h2 className="text-2xl font-black tracking-tight">
                  Ratings & Reviews
                </h2>

                <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr]">
                  <div className="rounded-2xl border border-[#ebe1d3] bg-[#fcfaf6] p-6 text-center">
                    <p className="text-5xl font-black text-[#3e3123]">
                      {rating.toFixed(1)}
                    </p>

                    <div className="mt-3 flex justify-center gap-1 text-[#b9975b]">
                      {Array.from({
                        length: 5,
                      }).map((_, index) => (
                        <Star
                          key={index}
                          size={17}
                          fill={
                            index < Math.round(rating)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
                    </div>

                    <p className="mt-3 text-xs text-[#968a79]">
                      Based on{" "}
                      {reviews.toLocaleString(
                        "en-IN",
                      )}{" "}
                      reviews
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(
                      (star) => (
                        <div
                          key={star}
                          className="flex items-center gap-3"
                        >
                          <span className="w-10 text-xs font-bold text-[#766856]">
                            {star} star
                          </span>

                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eee7dc]">
                            <div
                              className="h-full rounded-full bg-[#b9975b]"
                              style={{
                                width:
                                  star ===
                                  Math.round(rating)
                                    ? "72%"
                                    : star ===
                                        5
                                      ? "58%"
                                      : star ===
                                          4
                                        ? "26%"
                                        : "8%",
                              }}
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="mt-7 rounded-2xl border border-dashed border-[#dcc9a5] bg-[#fffaf1] p-5">
                  <div className="flex gap-3">
                    <BadgeCheck
                      size={20}
                      className="shrink-0 text-[#b18a4e]"
                    />

                    <div>
                      <p className="text-sm font-extrabold">
                        Customer reviews
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#918473]">
                        Review content can be connected
                        here when customer review data is
                        available in your Supabase schema.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            RELATED PRODUCTS
        ================================================= */}

        {relatedProducts.length > 0 && (
          <section className="mt-14 scroll-mt-24">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 rounded-full bg-[#b9975b]" />

                  <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Related Products
                  </h2>
                </div>

                <p className="mt-2 text-sm text-[#958979]">
                  Products from the same category that
                  you may like.
                </p>
              </div>

              {category && (
                <Link
                  href={`/dashboard/categories/${category.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-extrabold text-[#9d712f] transition hover:gap-2"
                >
                  View Category
                  <ArrowRight size={15} />
                </Link>
              )}
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts
                .slice(0, 8)
                .map((item) => (
                  <RelatedProductCard
                    key={item.id}
                    product={item}
                    onWishlist={
                      toggleRelatedWishlist
                    }
                    wishlisted={false}
                  />
                ))}
            </div>
          </section>
        )}

        {/* =================================================
            FREQUENTLY VIEWED / MORE FROM CATEGORY
        ================================================= */}

        {moreProducts.length > 0 && (
          <section className="mt-14">
            <div className="rounded-3xl border border-[#e9dfd1] bg-white p-6 sm:p-8">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7edda] text-[#a57935]">
                    <Sparkles size={17} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black sm:text-2xl">
                      More from{" "}
                      {category?.name ||
                        "this category"}
                    </h2>

                    <p className="mt-1 text-xs text-[#998d7c]">
                      Explore more products you might
                      love.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {moreProducts
                  .slice(0, 4)
                  .map((item) => (
                    <RelatedProductCard
                      key={item.id}
                      product={item}
                      onWishlist={
                        toggleRelatedWishlist
                      }
                      wishlisted={false}
                    />
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            RECENTLY VIEWED
        ================================================= */}

        {recentProducts.filter(
          (item) => item.id !== currentProduct.id,
        ).length > 0 && (
          <section className="mt-14">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-[#b9975b]" />

              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  Recently Viewed
                </h2>

                <p className="mt-1 text-sm text-[#968a79]">
                  Continue exploring products you viewed
                  recently.
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {recentProducts
                .filter(
                  (item) =>
                    item.id !==
                    currentProduct.id,
                )
                .slice(0, 4)
                .map((item) => (
                  <RelatedProductCard
                    key={item.id}
                    product={item}
                    onWishlist={
                      toggleRelatedWishlist
                    }
                    wishlisted={false}
                  />
                ))}
            </div>
          </section>
        )}

        {/* =================================================
            FINAL CTA
        ================================================= */}

        <section className="mt-14">
          <div className="relative overflow-hidden rounded-[30px] border border-[#dfcfb0] bg-[#fffdf8] p-7 sm:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#b9975b]/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e5d6b8] bg-[#faf3e4] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-[#9b702f]">
                  <Sparkles size={12} />
                  PrimeCart Shopping
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                  Ready to make it yours?
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#918574]">
                  Add this product to your cart and
                  continue your shopping journey with
                  PrimeCart.
                </p>
              </div>

              <button
                type="button"
                onClick={() => addToCart()}
                disabled={
                  outOfStock ||
                  cartLoading
                }
                className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#b9975b] px-7 text-sm font-extrabold text-white shadow-lg shadow-[#b9975b]/20 transition hover:-translate-y-0.5 hover:bg-[#a77f42] disabled:opacity-50"
              >
                <ShoppingCart size={18} />

                {cartLoading
                  ? "Adding..."
                  : "Add to Cart"}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          MOBILE BOTTOM BAR
      ===================================================== */}

      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#e5dbcc] bg-[#fffdf9]/95 p-3 shadow-[0_-10px_35px_rgba(50,35,15,0.08)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-2xl gap-2">
          <button
            type="button"
            onClick={() => addToCart()}
            disabled={
              outOfStock ||
              cartLoading
            }
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#b9975b] bg-white text-sm font-extrabold text-[#96702f] disabled:opacity-50"
          >
            <ShoppingCart size={17} />
            Add
          </button>

          <button
            type="button"
            onClick={buyNow}
            disabled={outOfStock}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#b9975b] text-sm font-extrabold text-white disabled:opacity-50"
          >
            <ShoppingBag size={17} />
            Buy Now
          </button>
        </div>
      </div>

      <div className="h-20 lg:hidden" />

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 animate-[toastIn_.3s_ease-out]">
          <div className="flex items-center gap-2 rounded-xl bg-[#34291d] px-4 py-3 text-xs font-bold text-white shadow-[0_15px_40px_rgba(40,28,12,0.25)]">
            <Check
              size={15}
              className="text-[#d9b86e]"
            />

            {toast}
          </div>
        </div>
      )}

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translate(-50%, 12px);
          }

          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
