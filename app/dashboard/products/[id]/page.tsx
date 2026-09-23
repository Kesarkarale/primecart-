"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Box,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  CreditCard,
  Heart,
  Home,
  Info,
  Minus,
  Package,
  Percent,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  Undo2,
  UserRound,
  X,
  ZoomIn,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { createClient } from "@/lib/supabase/client";

/* =========================================================
   TYPES
========================================================= */

type Product = {
  id: string;
  name: string;
  slug: string | null;
  short_description: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  image_url: string | null;
  brand: string | null;
  rating: number | null;
  reviews_count: number | null;
  is_featured: boolean | null;
  is_flash_sale: boolean | null;
  is_active: boolean | null;
  category_id: string | null;
  created_at?: string;
};

type Category = {
  id: string;
  name: string;
  slug: string | null;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

type RecentlyViewedItem = {
  id: string;
  viewedAt: number;
};

type ImageFallbackProps = {
  src: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const CART_KEY = "primecart-cart";
const RECENT_KEY = "primecart-recently-viewed";

const gold = "#b9975b";
const goldDark = "#96723b";

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(value: number | null | undefined) {
  return `₹${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
}

function getDiscount(product: Product | null) {
  if (
    !product ||
    !product.original_price ||
    product.original_price <= product.price
  ) {
    return 0;
  }

  return Math.round(
    ((product.original_price - product.price) / product.original_price) * 100
  );
}

function getSavings(product: Product | null) {
  if (!product?.original_price) return 0;

  return Math.max(0, product.original_price - product.price);
}

function getImageCandidates(value: string | null | undefined) {
  if (!value) return [];

  const image = value.trim();

  if (!image) return [];

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return [image];
  }

  const clean = image.startsWith("/") ? image : `/${image}`;

  const candidates = [clean];

  if (clean.startsWith("/products/")) {
    const withoutProducts = clean.replace(/^\/products\//, "/");

    if (withoutProducts !== clean) {
      candidates.push(withoutProducts);
    }
  } else {
    candidates.push(`/products${clean}`);
  }

  return [...new Set(candidates)];
}

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const value = localStorage.getItem(CART_KEY);
    if (!value) return [];

    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(CART_KEY, JSON.stringify(items));

  window.dispatchEvent(
    new CustomEvent("cart-updated", {
      detail: {
        items,
        count: items.reduce((sum, item) => sum + item.quantity, 0),
      },
    })
  );
}

function readRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];

  try {
    const value = localStorage.getItem(RECENT_KEY);

    if (!value) return [];

    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecentlyViewed(productId: string) {
  if (typeof window === "undefined" || !productId) return;

  const existing = readRecentlyViewed();

  const filtered = existing.filter((item) => item.id !== productId);

  const updated = [
    {
      id: productId,
      viewedAt: Date.now(),
    },
    ...filtered,
  ].slice(0, 12);

  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

/* =========================================================
   SMART PRODUCT IMAGE
========================================================= */

function SmartProductImage({
  src,
  alt,
  fill = false,
  className = "",
  priority = false,
  sizes,
}: ImageFallbackProps) {
  const candidates = useMemo(() => getImageCandidates(src), [src]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [src]);

  const current = candidates[index];

  if (!current) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-[#f7f1e7] text-[#b7aa97] ${className}`}
      >
        <ShoppingBag size={38} strokeWidth={1.2} />
      </div>
    );
  }

  const handleError = () => {
    if (index < candidates.length - 1) {
      setIndex((value) => value + 1);
    } else {
      setIndex(candidates.length);
    }
  };

  if (index >= candidates.length) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#f7f1e7] text-[#b7aa97]">
        <ShoppingBag size={40} strokeWidth={1.2} />
        <span className="mt-2 text-xs">Image unavailable</span>
      </div>
    );
  }

  if (
    current.startsWith("http://") ||
    current.startsWith("https://")
  ) {
    return (
      <img
        src={current}
        alt={alt}
        className={className}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        style={
          fill
            ? {
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }
            : undefined
        }
      />
    );
  }

  return (
    <Image
      src={current}
      alt={alt}
      fill={fill}
      priority={priority}
      sizes={sizes}
      className={className}
      onError={handleError}
    />
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  onWishlist,
  wishlisted,
}: {
  product: Product;
  onWishlist?: (product: Product) => void;
  wishlisted?: boolean;
}) {
  const discount = getDiscount(product);

  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-[#eadfcb] bg-white shadow-[0_8px_30px_rgba(84,63,32,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(84,63,32,0.13)]">
      <Link href={`/dashboard/products/${product.id}`}>
        <div className="relative h-[245px] overflow-hidden bg-[#faf7f1]">
          {discount > 0 && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-[#f4e4c4] px-3 py-1 text-[11px] font-bold text-[#8a642c]">
              {discount}% OFF
            </span>
          )}

          {product.is_flash_sale && (
            <span className="absolute right-3 top-3 z-10 rounded-full bg-[#fff3d8] px-3 py-1 text-[11px] font-bold text-[#946c2e]">
              FLASH
            </span>
          )}

          <SmartProductImage
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 280px"
            className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.06]"
          />
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/dashboard/products/${product.id}`}
            className="min-w-0 flex-1"
          >
            {product.brand && (
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a28d6d]">
                {product.brand}
              </p>
            )}

            <h3 className="line-clamp-2 min-h-[42px] text-sm font-semibold leading-5 text-[#433a2e] transition-colors group-hover:text-[#9b7337]">
              {product.name}
            </h3>
          </Link>

          {onWishlist && (
            <button
              type="button"
              onClick={() => onWishlist(product)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
                wishlisted
                  ? "border-[#d5bb86] bg-[#fbf3e2] text-[#9b7337]"
                  : "border-[#eadfcb] bg-white text-[#8d806c] hover:border-[#d4bd8d] hover:text-[#9b7337]"
              }`}
              aria-label="Wishlist"
            >
              <Heart
                size={16}
                fill={wishlisted ? "currentColor" : "none"}
              />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#f4ead9] px-2 py-1 text-[11px] font-bold text-[#7e6339]">
            <Star size={11} fill="currentColor" />
            {Number(product.rating || 0).toFixed(1)}
          </span>

          <span className="text-[11px] text-[#9d9384]">
            ({product.reviews_count || 0})
          </span>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-lg font-extrabold text-[#40372c]">
            {formatPrice(product.price)}
          </span>

          {product.original_price &&
            product.original_price > product.price && (
              <span className="pb-0.5 text-xs text-[#a59b8d] line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BENEFIT CARD
========================================================= */

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
    <div className="rounded-2xl border border-[#eadfcb] bg-white p-4 transition hover:border-[#d9c397] hover:shadow-[0_10px_30px_rgba(84,63,32,0.07)]">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7eddc] text-[#9a7339]">
        {icon}
      </div>

      <h3 className="text-sm font-bold text-[#443a2e]">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-[#8e8475]">{text}</p>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const productId = Array.isArray(params?.id)
    ? params.id[0]
    : String(params?.id || "");

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>(
    []
  );
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [cartLoading, setCartLoading] = useState(false);

  const [shareMessage, setShareMessage] = useState("");

  const [zoomOpen, setZoomOpen] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [toast, setToast] = useState("");

  const [cartCount, setCartCount] = useState(0);

  const [recentLoaded, setRecentLoaded] = useState(false);

  /* =====================================================
     LOAD CART COUNT
  ===================================================== */

  useEffect(() => {
    const updateCartCount = () => {
      const cart = readCart();

      setCartCount(
        cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
      );
    };

    updateCartCount();

    window.addEventListener("cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, []);

  /* =====================================================
     TOAST
  ===================================================== */

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast("");
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [toast]);

  /* =====================================================
     LOAD PRODUCT
  ===================================================== */

  const loadProduct = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    setPageError("");

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setProduct(null);
        setPageError("This product could not be found.");
        return;
      }

      const currentProduct = data as Product;

      setProduct(currentProduct);

      /* ---------------------------------------------------
         CATEGORY
      --------------------------------------------------- */

      if (currentProduct.category_id) {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id,name,slug")
          .eq("id", currentProduct.category_id)
          .maybeSingle();

        setCategory((categoryData as Category) || null);
      } else {
        setCategory(null);
      }

      /* ---------------------------------------------------
         RELATED PRODUCTS
      --------------------------------------------------- */

      if (currentProduct.category_id) {
        const { data: relatedData } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .eq("category_id", currentProduct.category_id)
          .neq("id", currentProduct.id)
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(12);

        setRelatedProducts((relatedData as Product[]) || []);
      } else {
        setRelatedProducts([]);
      }

      /* ---------------------------------------------------
         RECOMMENDED PRODUCTS
      --------------------------------------------------- */

      const { data: recommendationData } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .neq("id", currentProduct.id)
        .order("is_featured", { ascending: false })
        .order("rating", { ascending: false })
        .limit(12);

      setRecommendedProducts((recommendationData as Product[]) || []);

      /* ---------------------------------------------------
         WISHLIST
      --------------------------------------------------- */

      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: wishlistData } = await supabase
          .from("wishlist")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", currentProduct.id)
          .maybeSingle();

        setWishlisted(Boolean(wishlistData));
      }

      /* ---------------------------------------------------
         RECENTLY VIEWED
      --------------------------------------------------- */

      saveRecentlyViewed(currentProduct.id);

      const recent = readRecentlyViewed().filter(
        (item) => item.id !== currentProduct.id
      );

      const recentIds = recent.map((item) => item.id).slice(0, 8);

      if (recentIds.length) {
        const { data: recentData } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .in("id", recentIds);

        const mapped = ((recentData as Product[]) || []).sort(
          (a, b) =>
            recentIds.indexOf(a.id) - recentIds.indexOf(b.id)
        );

        setRecentProducts(mapped);
      } else {
        setRecentProducts([]);
      }

      setRecentLoaded(true);
    } catch (error) {
      console.error("Product load error:", error);

      setPageError("Unable to load this product right now.");
    } finally {
      setLoading(false);
    }
  }, [productId, supabase]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  /* =====================================================
     IMAGE
  ===================================================== */

  const imageCandidates = useMemo(() => {
    return getImageCandidates(product?.image_url);
  }, [product?.image_url]);

  const activeImage =
    imageCandidates[activeImageIndex] || imageCandidates[0] || null;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product?.id]);

  /* =====================================================
     PRODUCT VALUES
  ===================================================== */

  const discount = getDiscount(product);

  const savings = getSavings(product);

  const rating = Number(product?.rating || 0);

  const reviewCount = Number(product?.reviews_count || 0);

  const stock = Number(product?.stock || 0);

  const isOutOfStock = stock <= 0;

  const maxQuantity = Math.max(1, Math.min(stock || 1, 10));

  const progress =
    product && product.original_price
      ? Math.min(100, Math.max(0, discount))
      : 0;

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const addProductToCart = useCallback(
    (qty = quantity) => {
      if (!product || isOutOfStock) return false;

      const cart = readCart();

      const existingIndex = cart.findIndex(
        (item) => item.id === product.id
      );

      const safeQuantity = Math.max(
        1,
        Math.min(qty, maxQuantity)
      );

      if (existingIndex >= 0) {
        cart[existingIndex] = {
          ...cart[existingIndex],
          quantity: Math.min(
            maxQuantity,
            cart[existingIndex].quantity + safeQuantity
          ),
        };
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: safeQuantity,
        });
      }

      saveCart(cart);

      setToast("Product added to your cart.");

      return true;
    },
    [product, quantity, maxQuantity, isOutOfStock]
  );

  const handleAddToCart = () => {
    setCartLoading(true);

    addProductToCart(quantity);

    window.setTimeout(() => {
      setCartLoading(false);
    }, 450);
  };

  /* =====================================================
     BUY NOW
  ===================================================== */

  const handleBuyNow = () => {
    if (!product || isOutOfStock) return;

    const added = addProductToCart(quantity);

    if (added) {
      router.push("/dashboard/checkout");
    }
  };

  /* =====================================================
     WISHLIST
  ===================================================== */

  const toggleWishlist = async () => {
    if (!product || wishlistLoading) return;

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
          .eq("product_id", product.id);

        if (error) throw error;

        setWishlisted(false);
        setToast("Removed from wishlist.");
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: product.id,
          });

        if (error) throw error;

        setWishlisted(true);
        setToast("Added to wishlist.");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      setToast("Unable to update wishlist.");
    } finally {
      setWishlistLoading(false);
    }
  };

  /* =====================================================
     SHARE
  ===================================================== */

  const shareProduct = async () => {
    if (!product) return;

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

        return;
      }

      await navigator.clipboard.writeText(url);

      setShareMessage("Product link copied!");

      window.setTimeout(() => {
        setShareMessage("");
      }, 2200);
    } catch {
      // user cancelled share
    }
  };

  /* =====================================================
     RELATED WISHLIST
  ===================================================== */

  const handleRelatedWishlist = async (item: Product) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: existing } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", item.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("wishlist")
          .delete()
          .eq("id", existing.id);

        setToast("Removed from wishlist.");
      } else {
        await supabase.from("wishlist").insert({
          user_id: user.id,
          product_id: item.id,
        });

        setToast("Added to wishlist.");
      }
    } catch (error) {
      console.error(error);
      setToast("Unable to update wishlist.");
    }
  };

  /* =====================================================
     QUANTITY
  ===================================================== */

  const decreaseQuantity = () => {
    setQuantity((value) => Math.max(1, value - 1));
  };

  const increaseQuantity = () => {
    setQuantity((value) => Math.min(maxQuantity, value + 1));
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf8f2] text-[#443a2e]">
        <style jsx global>{`
          @keyframes pcShimmer {
            0% {
              background-position: -600px 0;
            }
            100% {
              background-position: 600px 0;
            }
          }

          .pc-shimmer {
            background: linear-gradient(
              90deg,
              #f4eee4 25%,
              #fffaf2 50%,
              #f4eee4 75%
            );
            background-size: 600px 100%;
            animation: pcShimmer 1.5s infinite linear;
          }
        `}</style>

        <div className="mx-auto max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="h-14 rounded-2xl pc-shimmer" />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="h-[620px] rounded-[28px] pc-shimmer" />

            <div className="space-y-5">
              <div className="h-8 w-32 rounded pc-shimmer" />
              <div className="h-20 rounded pc-shimmer" />
              <div className="h-36 rounded-[24px] pc-shimmer" />
              <div className="h-16 rounded pc-shimmer" />
              <div className="h-16 rounded pc-shimmer" />
              <div className="h-14 rounded-full pc-shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf8f2] px-5">
        <div className="w-full max-w-md rounded-[28px] border border-[#eadfcb] bg-white p-8 text-center shadow-[0_18px_50px_rgba(84,63,32,0.08)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f8eee0] text-[#a0773b]">
            <Package size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-[#43392e]">
            Product not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#8c8171]">
            {pageError ||
              "The product may have been removed or is no longer available."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => router.back()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#dfd0b8] bg-white px-4 py-3 text-sm font-bold text-[#625541] transition hover:bg-[#faf5ed]"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>

            <Link
              href="/dashboard/products"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#b9975b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#a6834d]"
            >
              Browse Products
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#fbf8f2] text-[#443a2e]">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes pcFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pcScale {
          from {
            opacity: 0;
            transform: scale(0.97);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pcFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes pcPulseGold {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(185, 151, 91, 0);
          }

          50% {
            box-shadow: 0 0 0 7px rgba(185, 151, 91, 0.08);
          }
        }

        .pc-fade-up {
          animation: pcFadeUp 0.65s ease both;
        }

        .pc-scale {
          animation: pcScale 0.55s ease both;
        }

        .pc-float {
          animation: pcFloat 3.5s ease-in-out infinite;
        }

        .pc-pulse-gold {
          animation: pcPulseGold 2.2s ease-in-out infinite;
        }

        .pc-section {
          scroll-margin-top: 110px;
        }

        .pc-hide-scrollbar {
          scrollbar-width: none;
        }

        .pc-hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .pc-fade-up,
          .pc-scale,
          .pc-float,
          .pc-pulse-gold {
            animation: none !important;
          }
        }
      `}</style>

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-40 border-b border-[#eadfcb]/80 bg-[#fffdf9]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#eadfcb] bg-white text-[#756957] transition hover:border-[#d3bc8b] hover:text-[#9a7339]"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <Link
            href="/dashboard"
            className="hidden items-center gap-2 sm:flex"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4e7cf] text-[#987239]">
              <ShoppingBag size={19} />
            </div>

            <div>
              <p className="text-base font-extrabold tracking-tight text-[#40372d]">
                Prime<span className="text-[#b18a4d]">Cart</span>
              </p>

              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a99b87]">
                Premium Shopping
              </p>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard/products"
              className="hidden items-center gap-2 rounded-xl border border-[#eadfcb] bg-white px-4 py-2.5 text-xs font-bold text-[#685b49] transition hover:border-[#d5bd8b] hover:text-[#9b7439] md:flex"
            >
              <Search size={15} />
              Products
            </Link>

            <button
              onClick={shareProduct}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfcb] bg-white text-[#756957] transition hover:border-[#d3bc8b] hover:text-[#9a7339]"
              aria-label="Share"
            >
              <Share2 size={17} />
            </button>

            <button
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                wishlisted
                  ? "border-[#d6bc89] bg-[#fbf1df] text-[#9a7339]"
                  : "border-[#eadfcb] bg-white text-[#756957] hover:border-[#d3bc8b] hover:text-[#9a7339]"
              }`}
              aria-label="Wishlist"
            >
              <Heart
                size={17}
                fill={wishlisted ? "currentColor" : "none"}
              />
            </button>

            <Link
              href="/dashboard/wishlist"
              className="hidden h-10 items-center justify-center rounded-xl border border-[#eadfcb] bg-white px-3 text-[#756957] transition hover:border-[#d3bc8b] hover:text-[#9a7339] sm:flex"
            >
              <Heart size={16} />
            </Link>

            <Link
              href="/dashboard/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfcb] bg-white text-[#756957] transition hover:border-[#d3bc8b] hover:text-[#9a7339]"
              aria-label="Cart"
            >
              <ShoppingCart size={17} />

              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b9975b] px-1 text-[9px] font-extrabold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="mx-auto max-w-[1500px] px-4 pt-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#9a8e7c]">
            <Link
              href="/dashboard"
              className="transition hover:text-[#9a7339]"
            >
              Home
            </Link>

            <ChevronRight size={13} />

            <Link
              href="/dashboard/products"
              className="transition hover:text-[#9a7339]"
            >
              Products
            </Link>

            {category && (
              <>
                <ChevronRight size={13} />

                <Link
                  href={`/dashboard/categories/${category.slug || category.id}`}
                  className="transition hover:text-[#9a7339]"
                >
                  {category.name}
                </Link>
              </>
            )}

            <ChevronRight size={13} />

            <span className="max-w-[250px] truncate font-semibold text-[#675b4a]">
              {product.name}
            </span>
          </div>
        </div>

        {/* =================================================
            MAIN PRODUCT AREA
        ================================================= */}

        <section className="mx-auto max-w-[1500px] px-4 pb-8 pt-5 sm:px-6 lg:px-8">
          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.12fr)_minmax(400px,0.88fr)] xl:gap-10">
            {/* =============================================
                IMAGE GALLERY
            ============================================= */}

            <div className="pc-scale">
              <div className="overflow-hidden rounded-[30px] border border-[#eadfcb] bg-white shadow-[0_15px_55px_rgba(84,63,32,0.07)]">
                <div className="relative flex min-h-[470px] items-center justify-center bg-[#faf7f1] sm:min-h-[570px] lg:min-h-[650px]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.9),transparent_58%)]" />

                  {product.is_featured && (
                    <span className="absolute left-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-full border border-[#e4cfaa] bg-[#fffaf0]/95 px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8c672f] shadow-sm">
                      <Sparkles size={13} />
                      Prime Pick
                    </span>
                  )}

                  {product.is_flash_sale && (
                    <span className="absolute right-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#b9975b] px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white shadow-md">
                      <Clock3 size={13} />
                      Flash Deal
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setZoomOpen(true)}
                    className="absolute bottom-5 right-5 z-10 flex items-center gap-2 rounded-full border border-[#e5d8c3] bg-white/95 px-4 py-2.5 text-xs font-bold text-[#655947] shadow-sm backdrop-blur transition hover:border-[#cdb27d] hover:text-[#9a7339]"
                  >
                    <ZoomIn size={15} />
                    View larger
                  </button>

                  {activeImage ? (
                    <div className="absolute inset-0">
                      <SmartProductImage
                        src={activeImage}
                        alt={product.name}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-contain p-8 sm:p-12 lg:p-16"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#b7aa97]">
                      <ShoppingBag size={58} strokeWidth={1.1} />
                      <p className="mt-3 text-sm">Product image unavailable</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                    className={`absolute bottom-5 left-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border shadow-sm backdrop-blur transition ${
                      wishlisted
                        ? "border-[#d5bc8b] bg-[#fff8ea] text-[#a0783d]"
                        : "border-[#e4d8c5] bg-white/95 text-[#776b59] hover:border-[#ccb27f] hover:text-[#9a7339]"
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart
                      size={19}
                      fill={wishlisted ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                {/* THUMBNAILS */}

                <div className="border-t border-[#eee4d4] bg-white px-4 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((value) =>
                          Math.max(0, value - 1)
                        )
                      }
                      disabled={activeImageIndex === 0}
                      className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#eadfcb] text-[#796c5b] transition hover:border-[#d2b983] disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="pc-hide-scrollbar flex flex-1 gap-3 overflow-x-auto">
                      {imageCandidates.length > 0 ? (
                        imageCandidates.map((image, index) => (
                          <button
                            key={`${image}-${index}`}
                            type="button"
                            onClick={() => setActiveImageIndex(index)}
                            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-[#faf7f1] transition ${
                              activeImageIndex === index
                                ? "border-[#b9975b] ring-2 ring-[#b9975b]/15"
                                : "border-[#eadfcb] hover:border-[#d2b983]"
                            }`}
                          >
                            <SmartProductImage
                              src={image}
                              alt={`${product.name} view ${index + 1}`}
                              fill
                              sizes="80px"
                              className="object-contain p-2"
                            />
                          </button>
                        ))
                      ) : (
                        <div className="flex h-20 items-center text-xs text-[#988c7c]">
                          No preview available
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((value) =>
                          Math.min(
                            imageCandidates.length - 1,
                            value + 1
                          )
                        )
                      }
                      disabled={
                        activeImageIndex >=
                        imageCandidates.length - 1
                      }
                      className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#eadfcb] text-[#796c5b] transition hover:border-[#d2b983] disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* GALLERY TRUST STRIP */}

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-[#eadfcb] bg-white px-3 py-3 text-center">
                  <ShieldCheck
                    size={18}
                    className="mx-auto text-[#9b753d]"
                  />
                  <p className="mt-1 text-[10px] font-bold text-[#665a49]">
                    Secure Shopping
                  </p>
                </div>

                <div className="rounded-2xl border border-[#eadfcb] bg-white px-3 py-3 text-center">
                  <BadgeCheck
                    size={18}
                    className="mx-auto text-[#9b753d]"
                  />
                  <p className="mt-1 text-[10px] font-bold text-[#665a49]">
                    Genuine Product
                  </p>
                </div>

                <div className="rounded-2xl border border-[#eadfcb] bg-white px-3 py-3 text-center">
                  <RotateCcw
                    size={18}
                    className="mx-auto text-[#9b753d]"
                  />
                  <p className="mt-1 text-[10px] font-bold text-[#665a49]">
                    Easy Returns
                  </p>
                </div>

                <div className="rounded-2xl border border-[#eadfcb] bg-white px-3 py-3 text-center">
                  <Truck
                    size={18}
                    className="mx-auto text-[#9b753d]"
                  />
                  <p className="mt-1 text-[10px] font-bold text-[#665a49]">
                    Fast Delivery
                  </p>
                </div>
              </div>
            </div>

            {/* =============================================
                PRODUCT INFORMATION
            ============================================= */}

            <div className="pc-fade-up lg:sticky lg:top-[88px]">
              <div className="rounded-[30px] border border-[#eadfcb] bg-white p-5 shadow-[0_15px_55px_rgba(84,63,32,0.07)] sm:p-7">
                {/* BRAND */}

                {product.brand && (
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#a18966]">
                      {product.brand}
                    </span>

                    <span className="h-1 w-1 rounded-full bg-[#d2b986]" />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#aa9e8d]">
                      PrimeCart
                    </span>
                  </div>
                )}

                {/* TITLE */}

                <h1 className="text-2xl font-extrabold leading-tight tracking-[-0.025em] text-[#40372d] sm:text-[30px]">
                  {product.name}
                </h1>

                {/* SHORT DESCRIPTION */}

                {product.short_description && (
                  <p className="mt-3 text-sm leading-6 text-[#817667] sm:text-[15px]">
                    {product.short_description}
                  </p>
                )}

                {/* RATING */}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => scrollToSection("reviews")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#f5ead7] px-2.5 py-1.5 text-xs font-extrabold text-[#795c32]"
                  >
                    <Star size={13} fill="currentColor" />
                    {rating.toFixed(1)}
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection("reviews")}
                    className="text-xs font-semibold text-[#8d806e] underline-offset-2 hover:text-[#9b7438] hover:underline"
                  >
                    {reviewCount.toLocaleString("en-IN")} ratings & reviews
                  </button>

                  {product.is_featured && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-[#ead9b9] bg-[#fffaf0] px-2.5 py-1.5 text-[10px] font-bold text-[#92703b]">
                      <Sparkles size={12} />
                      Featured
                    </span>
                  )}
                </div>

                <div className="my-6 h-px bg-[#eee5d7]" />

                {/* PRICE */}

                <div className="rounded-[22px] border border-[#eadfcb] bg-[#fcf8f0] p-5">
                  <div className="flex flex-wrap items-end gap-3">
                    <span className="text-3xl font-black tracking-tight text-[#3f362c] sm:text-4xl">
                      {formatPrice(product.price)}
                    </span>

                    {product.original_price &&
                      product.original_price > product.price && (
                        <span className="pb-1 text-sm text-[#a2988b] line-through">
                          {formatPrice(product.original_price)}
                        </span>
                      )}

                    {discount > 0 && (
                      <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-[#e9f1e5] px-2.5 py-1 text-[11px] font-extrabold text-[#58724f]">
                        <Percent size={11} />
                        {discount}% off
                      </span>
                    )}
                  </div>

                  {savings > 0 && (
                    <p className="mt-2 text-xs font-semibold text-[#66825d]">
                      You save {formatPrice(savings)} on this order
                    </p>
                  )}

                  <p className="mt-2 text-[11px] text-[#988c7c]">
                    Inclusive of applicable taxes
                  </p>
                </div>

                {/* FLASH DEAL */}

                {product.is_flash_sale && (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#ecd5a9] bg-[#fff7e7] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1dfba] text-[#956d32]">
                      <Clock3 size={19} />
                    </div>

                    <div>
                      <p className="text-xs font-extrabold text-[#74572f]">
                        Limited-time Flash Deal
                      </p>

                      <p className="mt-0.5 text-[11px] text-[#9a8463]">
                        Grab this offer while the current deal is active.
                      </p>
                    </div>
                  </div>
                )}

                {/* STOCK */}

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#625645]">
                      Availability
                    </span>

                    {isOutOfStock ? (
                      <span className="text-xs font-bold text-red-600">
                        Out of stock
                      </span>
                    ) : stock <= 10 ? (
                      <span className="text-xs font-bold text-[#b56c31]">
                        Only {stock} left
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#63805c]">
                        <Check size={13} />
                        In stock
                      </span>
                    )}
                  </div>

                  {!isOutOfStock && (
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eee6d8]">
                      <div
                        className="h-full rounded-full bg-[#b9975b] transition-all"
                        style={{
                          width: `${Math.max(
                            12,
                            Math.min(
                              100,
                              stock <= 10 ? stock * 8 : 72
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  )}

                  {discount > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-[#9b8d7b]">
                      <BarChart3 size={12} />
                      {progress}% discount currently applied
                    </div>
                  )}
                </div>

                {/* QUANTITY */}

                {!isOutOfStock && (
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#625645]">
                      Quantity
                    </span>

                    <div className="flex items-center overflow-hidden rounded-xl border border-[#ded1bb] bg-white">
                      <button
                        type="button"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="flex h-10 w-10 items-center justify-center text-[#6f6251] transition hover:bg-[#faf5ed] disabled:opacity-30"
                      >
                        <Minus size={15} />
                      </button>

                      <span className="flex h-10 min-w-11 items-center justify-center border-x border-[#e9dfcf] text-sm font-extrabold text-[#4b4033]">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={increaseQuantity}
                        disabled={quantity >= maxQuantity}
                        className="flex h-10 w-10 items-center justify-center text-[#6f6251] transition hover:bg-[#faf5ed] disabled:opacity-30"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ACTIONS */}

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || cartLoading}
                    className="group flex h-13 items-center justify-center gap-2 rounded-2xl border border-[#cbaa6e] bg-[#fffaf0] px-4 text-sm font-extrabold text-[#8d6833] transition hover:bg-[#f9eedc] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cartLoading ? (
                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <ShoppingCart
                        size={18}
                        className="transition-transform group-hover:-translate-y-0.5"
                      />
                    )}

                    {cartLoading ? "Adding..." : "Add to Cart"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="pc-pulse-gold flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#b9975b] px-4 text-sm font-extrabold text-white shadow-[0_10px_25px_rgba(185,151,91,0.22)] transition hover:bg-[#a7844e] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingBag size={18} />
                    Buy Now
                  </button>
                </div>

                {/* WISHLIST + SHARE */}

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#eadfcb] bg-white text-xs font-bold text-[#716452] transition hover:border-[#d3bb88] hover:text-[#9b7338]"
                  >
                    <Heart
                      size={15}
                      fill={wishlisted ? "currentColor" : "none"}
                    />
                    {wishlisted ? "Wishlisted" : "Add Wishlist"}
                  </button>

                  <button
                    type="button"
                    onClick={shareProduct}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#eadfcb] bg-white text-xs font-bold text-[#716452] transition hover:border-[#d3bb88] hover:text-[#9b7338]"
                  >
                    <Share2 size={15} />
                    Share Product
                  </button>
                </div>

                {/* PURCHASE BENEFITS */}

                <div className="mt-6 grid gap-3 border-t border-[#eee5d7] pt-5 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Truck
                      size={18}
                      className="mt-0.5 shrink-0 text-[#9a7339]"
                    />

                    <div>
                      <p className="text-xs font-bold text-[#544839]">
                        Fast Delivery
                      </p>
                      <p className="mt-0.5 text-[10px] leading-4 text-[#978b7b]">
                        Reliable delivery with secure packaging.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Undo2
                      size={18}
                      className="mt-0.5 shrink-0 text-[#9a7339]"
                    />

                    <div>
                      <p className="text-xs font-bold text-[#544839]">
                        Easy Returns
                      </p>
                      <p className="mt-0.5 text-[10px] leading-4 text-[#978b7b]">
                        Hassle-free return experience.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-[#9a7339]"
                    />

                    <div>
                      <p className="text-xs font-bold text-[#544839]">
                        Secure Payment
                      </p>
                      <p className="mt-0.5 text-[10px] leading-4 text-[#978b7b]">
                        Protected checkout and payment flow.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BadgeCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-[#9a7339]"
                    />

                    <div>
                      <p className="text-xs font-bold text-[#544839]">
                        PrimeCart Promise
                      </p>
                      <p className="mt-0.5 text-[10px] leading-4 text-[#978b7b]">
                        Quality-focused shopping experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            STICKY PRODUCT NAV
        ================================================= */}

        <div className="sticky top-[68px] z-30 border-y border-[#eadfcb] bg-[#fffdf9]/95 backdrop-blur-xl">
          <div className="mx-auto max-w-[1500px] overflow-x-auto px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-max items-center gap-1 py-2">
              {[
                ["overview", "Overview"],
                ["details", "Details"],
                ["reviews", "Reviews"],
                ["related", "Related Products"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-[#756856] transition hover:bg-[#f7efe1] hover:text-[#966f36]"
                >
                  {label}
                </button>
              ))}

              <div className="ml-auto hidden items-center gap-2 pl-4 md:flex">
                <span className="text-[10px] font-semibold text-[#9b907f]">
                  Secure shopping
                </span>

                <ShieldCheck
                  size={14}
                  className="text-[#9a7339]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            OVERVIEW
        ================================================= */}

        <section
          id="overview"
          className="pc-section mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8"
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <BenefitCard
              icon={<Truck size={19} />}
              title="Fast & Reliable Delivery"
              text="Get your order packed securely and delivered through a reliable shopping flow."
            />

            <BenefitCard
              icon={<RotateCcw size={19} />}
              title="Easy Returns"
              text="A simple return-friendly experience designed around convenient shopping."
            />

            <BenefitCard
              icon={<CreditCard size={19} />}
              title="Secure Payments"
              text="Shop confidently with a protected and streamlined checkout experience."
            />

            <BenefitCard
              icon={<BadgeCheck size={19} />}
              title="PrimeCart Promise"
              text="A premium shopping experience with quality-focused product discovery."
            />
          </div>
        </section>

        {/* =================================================
            DETAILS
        ================================================= */}

        <section
          id="details"
          className="pc-section mx-auto max-w-[1500px] px-4 pb-12 sm:px-6 lg:px-8"
        >
          <div className="overflow-hidden rounded-[28px] border border-[#eadfcb] bg-white shadow-[0_12px_40px_rgba(84,63,32,0.055)]">
            <div className="border-b border-[#eee5d7] px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5ead8] text-[#99733d]">
                  <Info size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-[#443a2e]">
                    Product Details
                  </h2>

                  <p className="mt-0.5 text-xs text-[#978b7a]">
                    Everything you need to know about this product
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[1.25fr_0.75fr]">
              <div>
                <h3 className="text-sm font-extrabold text-[#514636]">
                  Description
                </h3>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#7e7364]">
                  {product.description ||
                    product.short_description ||
                    "Product details will be available soon."}
                </p>
              </div>

              <div className="rounded-2xl border border-[#eadfcb] bg-[#fcf9f4] p-5">
                <h3 className="text-sm font-extrabold text-[#514636]">
                  Product Summary
                </h3>

                <div className="mt-4 divide-y divide-[#e9dfcf]">
                  <div className="flex justify-between gap-4 py-3">
                    <span className="text-xs text-[#958978]">
                      Brand
                    </span>
                    <span className="text-right text-xs font-bold text-[#55493a]">
                      {product.brand || "PrimeCart"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 py-3">
                    <span className="text-xs text-[#958978]">
                      Category
                    </span>
                    <span className="text-right text-xs font-bold text-[#55493a]">
                      {category?.name || "General"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 py-3">
                    <span className="text-xs text-[#958978]">
                      Availability
                    </span>
                    <span
                      className={`text-right text-xs font-bold ${
                        isOutOfStock
                          ? "text-red-600"
                          : "text-[#63805c]"
                      }`}
                    >
                      {isOutOfStock
                        ? "Out of stock"
                        : `${stock} units available`}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 py-3">
                    <span className="text-xs text-[#958978]">
                      Rating
                    </span>
                    <span className="text-right text-xs font-bold text-[#55493a]">
                      {rating.toFixed(1)} / 5
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 py-3">
                    <span className="text-xs text-[#958978]">
                      Reviews
                    </span>
                    <span className="text-right text-xs font-bold text-[#55493a]">
                      {reviewCount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#eee5d7] bg-[#fffaf1] px-5 py-5 sm:px-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1e1c4] text-[#96703a]">
                  <Sparkles size={19} />
                </div>

                <div>
                  <p className="text-sm font-extrabold text-[#55432d]">
                    PrimeCart Promise
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#8d7d68]">
                    We focus on a clean, secure and premium shopping
                    experience from product discovery to checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            REVIEWS
        ================================================= */}

        <section
          id="reviews"
          className="pc-section mx-auto max-w-[1500px] px-4 pb-12 sm:px-6 lg:px-8"
        >
          <div className="rounded-[28px] border border-[#eadfcb] bg-white p-5 shadow-[0_12px_40px_rgba(84,63,32,0.055)] sm:p-7">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#a18b68]">
                  Customer Feedback
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-[#443a2e]">
                  Ratings & Reviews
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-black text-[#443a2e]">
                    {rating.toFixed(1)}
                  </p>

                  <div className="mt-1 flex justify-center text-[#b9975b]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={14}
                        fill={
                          index < Math.round(rating)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="h-14 w-px bg-[#eadfcb]" />

                <div>
                  <p className="text-sm font-bold text-[#55493a]">
                    {reviewCount.toLocaleString("en-IN")}
                  </p>

                  <p className="text-[10px] text-[#9b907f]">
                    ratings & reviews
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const ratio =
                  star === 5
                    ? 72
                    : star === 4
                    ? 19
                    : star === 3
                    ? 6
                    : star === 2
                    ? 2
                    : 1;

                return (
                  <div
                    key={star}
                    className="flex items-center gap-3"
                  >
                    <span className="flex w-8 items-center gap-1 text-xs font-bold text-[#766a59]">
                      {star}
                      <Star
                        size={11}
                        fill="currentColor"
                        className="text-[#b9975b]"
                      />
                    </span>

                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eee7da]">
                      <div
                        className="h-full rounded-full bg-[#b9975b]"
                        style={{
                          width: `${ratio}%`,
                        }}
                      />
                    </div>

                    <span className="w-8 text-right text-[10px] text-[#9d9180]">
                      {ratio}%
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-[#dfd0b8] bg-[#fcf8f1] p-4">
              <div className="flex items-start gap-3">
                <Info
                  size={16}
                  className="mt-0.5 shrink-0 text-[#9b7439]"
                />

                <p className="text-xs leading-5 text-[#887b69]">
                  This summary uses the rating and review count stored
                  for this product. Individual customer reviews are
                  displayed only when review-level data is available.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            RELATED PRODUCTS
        ================================================= */}

        <section
          id="related"
          className="pc-section mx-auto max-w-[1500px] px-4 pb-12 sm:px-6 lg:px-8"
        >
          {relatedProducts.length > 0 && (
            <>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#a18b68]">
                    Explore More
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold text-[#443a2e]">
                    More from {category?.name || "this category"}
                  </h2>

                  <p className="mt-1 text-xs text-[#948878]">
                    Discover more products related to what you are viewing.
                  </p>
                </div>

                <Link
                  href="/dashboard/products"
                  className="hidden items-center gap-1 text-xs font-bold text-[#967039] hover:underline sm:flex"
                >
                  View all
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {relatedProducts.slice(0, 10).map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    onWishlist={handleRelatedWishlist}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* =================================================
            YOU MAY ALSO LIKE
        ================================================= */}

        {recommendedProducts.length > 0 && (
          <section className="mx-auto max-w-[1500px] px-4 pb-12 sm:px-6 lg:px-8">
            <div className="mb-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#a18b68]">
                PrimeCart Suggestions
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-[#443a2e]">
                You May Also Like
              </h2>

              <p className="mt-1 text-xs text-[#948878]">
                More products worth exploring across PrimeCart.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {recommendedProducts
                .filter(
                  (item) =>
                    item.id !== product.id &&
                    !relatedProducts.some(
                      (related) => related.id === item.id
                    )
                )
                .slice(0, 6)
                .map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    onWishlist={handleRelatedWishlist}
                  />
                ))}
            </div>
          </section>
        )}

        {/* =================================================
            RECENTLY VIEWED
        ================================================= */}

        {recentLoaded && recentProducts.length > 0 && (
          <section className="mx-auto max-w-[1500px] px-4 pb-14 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#a18b68]">
                  Your Journey
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-[#443a2e]">
                  Recently Viewed
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(RECENT_KEY);
                  setRecentProducts([]);
                }}
                className="text-xs font-bold text-[#90734a] hover:underline"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {recentProducts.slice(0, 5).map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onWishlist={handleRelatedWishlist}
                />
              ))}
            </div>
          </section>
        )}

        {/* =================================================
            FINAL CTA
        ================================================= */}

        <section className="mx-auto max-w-[1500px] px-4 pb-28 sm:px-6 lg:px-8 lg:pb-14">
          <div className="relative overflow-hidden rounded-[30px] border border-[#dfcda9] bg-[#f7ecd9] p-7 sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/40 blur-3xl" />

            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2 text-[#8f6b36]">
                  <Sparkles size={17} />

                  <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]">
                    PrimeCart Experience
                  </span>
                </div>

                <h2 className="mt-2 max-w-2xl text-2xl font-extrabold leading-tight text-[#4c3e2e] sm:text-3xl">
                  Find more products that fit your style and budget.
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#806f58]">
                  Explore categories, compare products and discover
                  smarter shopping options across PrimeCart.
                </p>
              </div>

              <Link
                href="/dashboard/products"
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#b9975b] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(185,151,91,0.2)] transition hover:bg-[#a7844e]"
              >
                Explore Products
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ===================================================
          MOBILE BOTTOM PURCHASE BAR
      =================================================== */}

      {!isOutOfStock && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e6dbc8] bg-[#fffdf9]/96 p-3 shadow-[0_-12px_35px_rgba(68,52,28,0.12)] backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center gap-2">
            <div className="hidden min-w-0 flex-1 sm:block">
              <p className="truncate text-xs font-bold text-[#5d503f]">
                {product.name}
              </p>

              <p className="text-sm font-black text-[#44382b]">
                {formatPrice(product.price)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#cbaa6e] bg-[#fff9ee] px-3 text-xs font-extrabold text-[#8f6833]"
            >
              <ShoppingCart size={17} />
              Add to Cart
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#b9975b] px-3 text-xs font-extrabold text-white"
            >
              <ShoppingBag size={17} />
              Buy Now
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          SHARE MESSAGE
      =================================================== */}

      {shareMessage && (
        <div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-[#dbc69b] bg-white px-5 py-3 text-xs font-bold text-[#76592f] shadow-[0_15px_40px_rgba(62,48,27,0.15)]">
          <span className="flex items-center gap-2">
            <Copy size={14} />
            {shareMessage}
          </span>
        </div>
      )}

      {/* ===================================================
          TOAST
      =================================================== */}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[80] -translate-x-1/2 sm:bottom-7">
          <div className="flex items-center gap-3 rounded-2xl border border-[#dbc89e] bg-[#fffdf9] px-5 py-3.5 text-xs font-bold text-[#66513a] shadow-[0_15px_45px_rgba(55,43,24,0.16)]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f1e2c5] text-[#96703a]">
              <Check size={15} />
            </div>

            {toast}
          </div>
        </div>
      )}

      {/* ===================================================
          IMAGE ZOOM MODAL
      =================================================== */}

      {zoomOpen && activeImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#241e17]/80 p-4 backdrop-blur-sm"
          onClick={() => setZoomOpen(false)}
        >
          <div
            className="relative flex h-[88vh] w-full max-w-6xl items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-[#faf7f1]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#e1d5c2] bg-white text-[#635645] shadow-sm transition hover:text-[#9a7339]"
              aria-label="Close"
            >
              <X size={19} />
            </button>

            <SmartProductImage
              src={activeImage}
              alt={product.name}
              fill
              priority
              sizes="90vw"
              className="object-contain p-6 sm:p-12"
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-[#e5d9c6] bg-white/95 px-4 py-2 text-[10px] font-bold text-[#756756] shadow-sm">
              {product.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
