"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  CreditCard,
  Gift,
  Heart,
  Lock,
  Minus,
  PackageCheck,
  Plus,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Truck,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  image_url?: string | null;
  brand?: string | null;
  stock?: number | null;
  rating?: number | null;
  reviews_count?: number | null;
  category_id?: string | null;
  is_active?: boolean;
};

type CartItem = Product & {
  quantity: number;
};

type SavedItem = CartItem;

type NoticeType = "success" | "error" | "info";

type Notice = {
  type: NoticeType;
  message: string;
};

const CART_KEY = "primecart-cart";
const SAVED_KEY = "primecart-saved";
const RECENT_KEY = "primecart-recently-viewed";
const CHECKOUT_CART_KEY = "primecart-checkout-cart";
const CHECKOUT_SUMMARY_KEY = "primecart-checkout-summary";
const WISHLIST_KEY = "primecart-wishlist";

const FREE_SHIPPING_LIMIT = 999;
const STANDARD_SHIPPING = 79;

const COUPONS = {
  PRIME10: {
    type: "percent" as const,
    value: 10,
    maxDiscount: 500,
    minimum: 0,
    label: "10% OFF up to ₹500",
  },
  WELCOME: {
    type: "flat" as const,
    value: 150,
    minimum: 999,
    label: "₹150 OFF above ₹999",
  },
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getImageUrl(image?: string | null) {
  if (!image) return "/placeholder-product.png";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/")
  ) {
    return image;
  }

  return `/${image}`;
}

function readStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  try {
    const value = localStorage.getItem(key);

    if (!value) return [];

    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore localStorage errors.
  }
}

function normalizeItem(
  item: Partial<CartItem>
): CartItem | null {
  if (!item.id || !item.name) return null;

  return {
    id: String(item.id),
    name: String(item.name),
    price: Number(item.price) || 0,
    original_price:
      item.original_price !== null &&
      item.original_price !== undefined
        ? Number(item.original_price)
        : null,
    image_url: item.image_url ?? null,
    brand: item.brand ?? null,
    stock:
      item.stock !== null && item.stock !== undefined
        ? Number(item.stock)
        : 99,
    rating:
      item.rating !== null && item.rating !== undefined
        ? Number(item.rating)
        : null,
    reviews_count:
      item.reviews_count !== null &&
      item.reviews_count !== undefined
        ? Number(item.reviews_count)
        : null,
    category_id: item.category_id ?? null,
    is_active: item.is_active ?? true,
    quantity: Math.max(1, Number(item.quantity) || 1),
  };
}

export default function CartPage() {
  const supabase = createClient();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>(
    []
  );

  const [wishlist, setWishlist] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [recommendationLoading, setRecommendationLoading] =
    useState(true);

  const [updatingId, setUpdatingId] = useState<string | null>(
    null
  );

  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(
    null
  );
  const [couponOpen, setCouponOpen] = useState(false);

  const [notice, setNotice] = useState<Notice | null>(null);

  const [removedId, setRemovedId] = useState<string | null>(null);

  const [validatingCart, setValidatingCart] = useState(false);

  const showNotice = useCallback(
    (message: string, type: NoticeType = "success") => {
      setNotice({
        message,
        type,
      });
    },
    []
  );

  /*
   * Load local cart.
   */
  useEffect(() => {
    const storedCart = readStorage<Partial<CartItem>>(CART_KEY)
      .map(normalizeItem)
      .filter((item): item is CartItem => item !== null);

    const storedSaved = readStorage<Partial<SavedItem>>(SAVED_KEY)
      .map(normalizeItem)
      .filter((item): item is SavedItem => item !== null);

    const storedWishlist = readStorage<string>(WISHLIST_KEY);

    setCart(storedCart);
    setSavedItems(storedSaved);
    setWishlist(
      storedWishlist.filter(
        (value): value is string => typeof value === "string"
      )
    );

    setLoading(false);
  }, []);

  /*
   * Persist cart.
   */
  useEffect(() => {
    if (!loading) {
      writeStorage(CART_KEY, cart);
    }
  }, [cart, loading]);

  /*
   * Persist saved products.
   */
  useEffect(() => {
    if (!loading) {
      writeStorage(SAVED_KEY, savedItems);
    }
  }, [savedItems, loading]);

  /*
   * Persist wishlist.
   */
  useEffect(() => {
    if (!loading) {
      writeStorage(WISHLIST_KEY, wishlist);
    }
  }, [wishlist, loading]);

  /*
   * Auto-hide notification.
   */
  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [notice]);

  /*
   * Fetch professional recommendations.
   */
  useEffect(() => {
    let active = true;

    async function loadRecommendations() {
      setRecommendationLoading(true);

      try {
        const categoryIds = Array.from(
          new Set(
            cart
              .map((item) => item.category_id)
              .filter(
                (id): id is string =>
                  Boolean(id)
              )
          )
        );

        let query = supabase
          .from("products")
          .select(
            "id,name,price,original_price,image_url,brand,stock,rating,reviews_count,category_id,is_active"
          )
          .eq("is_active", true)
          .gt("stock", 0)
          .limit(12);

        if (categoryIds.length > 0) {
          query = query.in("category_id", categoryIds);
        } else {
          query = query.eq("is_featured", true);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        if (!active) return;

        const cartIds = new Set(cart.map((item) => item.id));

        const filtered = (data ?? []).filter(
          (product) => !cartIds.has(product.id)
        );

        setRecommendations(filtered as Product[]);
      } catch {
        /*
         * Recommendation failure should never break cart.
         */
        if (active) {
          setRecommendations([]);
        }
      } finally {
        if (active) {
          setRecommendationLoading(false);
        }
      }
    }

    if (!loading) {
      loadRecommendations();
    }

    return () => {
      active = false;
    };
  }, [cart, loading, supabase]);

  const itemCount = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + item.price * item.quantity,
        0
      ),
    [cart]
  );

  const originalTotal = useMemo(
    () =>
      cart.reduce((total, item) => {
        const original =
          item.original_price &&
          item.original_price > item.price
            ? item.original_price
            : item.price;

        return total + original * item.quantity;
      }, 0),
    [cart]
  );

  const productSavings = Math.max(
    originalTotal - subtotal,
    0
  );

  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= FREE_SHIPPING_LIMIT
        ? 0
        : STANDARD_SHIPPING;

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;

    const selected =
      COUPONS[
        appliedCoupon as keyof typeof COUPONS
      ];

    if (!selected) return 0;

    if (subtotal < selected.minimum) return 0;

    if (selected.type === "percent") {
      return Math.min(
        Math.round(
          (subtotal * selected.value) / 100
        ),
        selected.maxDiscount
      );
    }

    return Math.min(
      selected.value,
      subtotal
    );
  }, [appliedCoupon, subtotal]);

  const grandTotal = Math.max(
    subtotal +
      shipping -
      couponDiscount,
    0
  );

  const totalSavings =
    productSavings + couponDiscount;

  const freeShippingRemaining = Math.max(
    FREE_SHIPPING_LIMIT - subtotal,
    0
  );

  const shippingProgress = Math.min(
    Math.round(
      (subtotal / FREE_SHIPPING_LIMIT) * 100
    ),
    100
  );

  function persistCart(nextCart: CartItem[]) {
    setCart(nextCart);
    writeStorage(CART_KEY, nextCart);
  }

  function updateQuantity(
    id: string,
    direction: "increase" | "decrease"
  ) {
    const current = cart.find(
      (item) => item.id === id
    );

    if (!current) return;

    const stock = Math.max(
      current.stock ?? 99,
      1
    );

    if (
      direction === "increase" &&
      current.quantity >= stock
    ) {
      showNotice(
        `Only ${stock} unit${stock === 1 ? "" : "s"} available.`,
        "info"
      );
      return;
    }

    setUpdatingId(id);

    window.setTimeout(() => {
      const nextCart = cart
        .map((item) => {
          if (item.id !== id) return item;

          const quantity =
            direction === "increase"
              ? Math.min(
                  item.quantity + 1,
                  stock
                )
              : item.quantity - 1;

          return {
            ...item,
            quantity,
          };
        })
        .filter(
          (item) => item.quantity > 0
        );

      persistCart(nextCart);
      setUpdatingId(null);
    }, 120);
  }

  function removeItem(id: string) {
    setRemovedId(id);

    window.setTimeout(() => {
      const removed = cart.find(
        (item) => item.id === id
      );

      const nextCart = cart.filter(
        (item) => item.id !== id
      );

      persistCart(nextCart);
      setRemovedId(null);

      if (removed) {
        showNotice(
          `${removed.name} removed from your cart.`,
          "info"
        );
      }
    }, 180);
  }

  function saveForLater(item: CartItem) {
    const exists = savedItems.some(
      (saved) => saved.id === item.id
    );

    if (!exists) {
      setSavedItems((previous) => [
        ...previous,
        {
          ...item,
          quantity: 1,
        },
      ]);
    }

    persistCart(
      cart.filter(
        (product) => product.id !== item.id
      )
    );

    showNotice("Product saved for later.");
  }

  function moveToCart(item: SavedItem) {
    const existing = cart.find(
      (product) => product.id === item.id
    );

    if (existing) {
      const stock = Math.max(
        existing.stock ?? 99,
        1
      );

      persistCart(
        cart.map((product) =>
          product.id === item.id
            ? {
                ...product,
                quantity: Math.min(
                  product.quantity +
                    item.quantity,
                  stock
                ),
              }
            : product
        )
      );
    } else {
      persistCart([
        ...cart,
        {
          ...item,
          quantity: 1,
        },
      ]);
    }

    setSavedItems((previous) =>
      previous.filter(
        (saved) => saved.id !== item.id
      )
    );

    showNotice(
      "Product moved back to your cart."
    );
  }

  function removeSavedItem(id: string) {
    setSavedItems((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );

    showNotice(
      "Saved product removed.",
      "info"
    );
  }

  function toggleWishlist(id: string) {
    const exists = wishlist.includes(id);

    setWishlist((previous) =>
      exists
        ? previous.filter(
            (item) => item !== id
          )
        : [...previous, id]
    );

    showNotice(
      exists
        ? "Removed from wishlist."
        : "Added to wishlist."
    );
  }

  function addRecommendationToCart(
    product: Product
  ) {
    const existing = cart.find(
      (item) => item.id === product.id
    );

    if (existing) {
      const stock = Math.max(
        product.stock ?? 99,
        1
      );

      if (existing.quantity >= stock) {
        showNotice(
          "Maximum available quantity already in cart.",
          "info"
        );
        return;
      }

      persistCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        )
      );
    } else {
      persistCart([
        ...cart,
        {
          ...product,
          quantity: 1,
        },
      ]);
    }

    showNotice(
      `${product.name} added to cart.`
    );
  }

  function applyCoupon() {
    const code = coupon
      .trim()
      .toUpperCase();

    if (!code) {
      showNotice(
        "Enter a coupon code first.",
        "error"
      );
      return;
    }

    const selected =
      COUPONS[
        code as keyof typeof COUPONS
      ];

    if (!selected) {
      showNotice(
        "This coupon code is not valid.",
        "error"
      );
      return;
    }

    if (subtotal < selected.minimum) {
      showNotice(
        `Add ${formatPrice(
          selected.minimum -
            subtotal
        )} more to use ${code}.`,
        "info"
      );
      return;
    }

    setAppliedCoupon(code);
    setCouponOpen(false);

    showNotice(
      `${code} applied successfully.`
    );
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCoupon("");

    showNotice(
      "Coupon removed.",
      "info"
    );
  }

  /*
   * Validate latest stock before checkout.
   */
  async function validateCartBeforeCheckout() {
    if (!cart.length) {
      showNotice(
        "Your cart is empty.",
        "error"
      );
      return false;
    }

    setValidatingCart(true);

    try {
      const ids = cart.map(
        (item) => item.id
      );

      const { data, error } =
        await supabase
          .from("products")
          .select(
            "id,name,price,original_price,stock,is_active,image_url,brand,rating,reviews_count,category_id"
          )
          .in("id", ids);

      if (error) {
        throw error;
      }

      const products =
        (data ?? []) as Product[];

      const productMap = new Map(
        products.map((product) => [
          product.id,
          product,
        ])
      );

      let changed = false;

      const nextCart: CartItem[] = [];

      for (const item of cart) {
        const latest =
          productMap.get(item.id);

        if (
          !latest ||
          latest.is_active === false
        ) {
          changed = true;

          showNotice(
            `${item.name} is no longer available.`,
            "error"
          );

          continue;
        }

        const latestStock =
          Number(latest.stock ?? 0);

        if (latestStock <= 0) {
          changed = true;

          showNotice(
            `${item.name} is currently out of stock.`,
            "error"
          );

          continue;
        }

        const quantity = Math.min(
          item.quantity,
          latestStock
        );

        if (
          quantity !== item.quantity ||
          latest.price !== item.price
        ) {
          changed = true;
        }

        nextCart.push({
          ...item,
          ...latest,
          quantity,
        });
      }

      if (changed) {
        persistCart(nextCart);

        if (!nextCart.length) {
          return false;
        }

        showNotice(
          "Cart updated with the latest stock and prices.",
          "info"
        );

        return false;
      }

      return true;
    } catch {
      /*
       * If validation cannot reach Supabase,
       * don't silently pretend the cart was verified.
       */
      showNotice(
        "Could not verify your cart. Please try again.",
        "error"
      );

      return false;
    } finally {
      setValidatingCart(false);
    }
  }

  async function proceedToCheckout() {
    const valid =
      await validateCartBeforeCheckout();

    if (!valid) return;

    const checkoutSummary = {
      itemCount,
      subtotal,
      shipping,
      couponDiscount,
      appliedCoupon,
      totalSavings,
      grandTotal,
    };

    writeStorage(
      CHECKOUT_CART_KEY,
      cart
    );

    writeStorage(
      CHECKOUT_SUMMARY_KEY,
      [checkoutSummary]
    );

    window.location.href =
      "/dashboard/checkout";
  }

  function continueShopping() {
    window.location.href =
      "/dashboard/products";
  }

  if (loading) {
    return <CartLoading />;
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#17130d] dark:bg-[#0c0b09] dark:text-white">
      {/* Notification */}
      {notice && (
        <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm">
          <div className="flex items-start gap-3 rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-2xl dark:border-[#3a3224] dark:bg-[#171512]">
            <div
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                notice.type === "success"
                  ? "bg-emerald-50 text-emerald-600"
                  : notice.type === "error"
                    ? "bg-red-50 text-red-600"
                    : "bg-[#f8f1df] text-[#a17a35]",
              ].join(" ")}
            >
              {notice.type === "success" ? (
                <Check className="h-4 w-4" />
              ) : notice.type === "error" ? (
                <X className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>

            <p className="flex-1 pt-1 text-sm font-medium">
              {notice.message}
            </p>

            <button
              type="button"
              onClick={() =>
                setNotice(null)
              }
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#eadfc9] bg-white/95 backdrop-blur-xl dark:border-[#2a261f] dark:bg-[#0c0b09]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#d6b875] via-[#b9975b] to-[#8f6b31] text-white shadow-lg">
              <ShoppingBag className="h-5 w-5" />
            </div>

            <div>
              <div className="text-lg font-black tracking-tight">
                Prime
                <span className="text-[#b9975b]">
                  Cart
                </span>
              </div>

              <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-gray-400">
                Premium Shopping
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/dashboard/products"
              className="text-sm font-semibold text-gray-600 hover:text-[#a17a35] dark:text-gray-300"
            >
              Continue Shopping
            </Link>

            <Link
              href="/dashboard/orders"
              className="text-sm font-semibold text-gray-600 hover:text-[#a17a35] dark:text-gray-300"
            >
              My Orders
            </Link>

            <div className="flex items-center gap-2 rounded-full border border-[#eadfc9] bg-[#faf8f3] px-3 py-2 dark:border-[#332d23] dark:bg-[#171512]">
              <Lock className="h-3.5 w-3.5 text-[#a17a35]" />
              <span className="text-xs font-bold">
                Secure Checkout
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-[#f8f1df] px-3 py-2 text-[#8f6b31] dark:bg-[#201c15]">
            <ShoppingCart className="h-4 w-4" />
            <span className="text-xs font-black">
              {itemCount}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-12">
        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-2 text-xs text-gray-500">
          <Link
            href="/dashboard"
            className="hover:text-[#a17a35]"
          >
            Home
          </Link>

          <span>/</span>

          <span className="font-semibold text-[#17130d] dark:text-white">
            Cart
          </span>
        </nav>

        {/* Hero */}
        <section className="mb-7 overflow-hidden rounded-[28px] border border-[#eadfc9] bg-white shadow-[0_15px_45px_rgba(72,52,18,0.06)] dark:border-[#2f2a22] dark:bg-[#12110e]">
          <div className="relative p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[#b9975b]/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#eadfc9] bg-[#faf8f3] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#9a7539] dark:border-[#332d23] dark:bg-[#191712]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Smart Cart
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Shopping Cart
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                  Review your products, unlock offers,
                  and checkout securely.
                </p>
              </div>

              <button
                type="button"
                onClick={continueShopping}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9c7a4] bg-white px-5 py-3 text-sm font-bold text-[#8f6b31] hover:bg-[#faf8f3] dark:border-[#4a3d28] dark:bg-[#171512]"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Shipping progress */}
          {cart.length > 0 && (
            <div className="border-t border-[#eee6d8] bg-[#fcfaf6] px-6 py-4 dark:border-[#29251f] dark:bg-[#15130f] sm:px-8">
              {shippingProgress >= 100 ? (
                <div className="flex items-center gap-3 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                    <Truck className="h-4 w-4" />
                  </div>

                  <span>
                    FREE shipping unlocked!
                  </span>

                  <Check className="ml-auto h-5 w-5" />
                </div>
              ) : (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">
                      Add{" "}
                      <span className="font-black text-[#9a7539]">
                        {formatPrice(
                          freeShippingRemaining
                        )}
                      </span>{" "}
                      more for FREE delivery
                    </span>

                    <Truck className="h-4 w-4 text-[#a17a35]" />
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#eadfc9] dark:bg-[#30291e]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#8f6b31] via-[#b9975b] to-[#d6b875] transition-all duration-500"
                      style={{
                        width: `${shippingProgress}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {cart.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              {/* LEFT */}
              <div className="min-w-0 space-y-5">
                {/* Cart title */}
                <section className="rounded-2xl border border-[#eadfc9] bg-white p-5 shadow-sm dark:border-[#2f2a22] dark:bg-[#12110e]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-black">
                        Your Items
                      </h2>

                      <p className="mt-1 text-xs text-gray-500">
                        {itemCount} item
                        {itemCount === 1
                          ? ""
                          : "s"} selected
                      </p>
                    </div>

                    <span className="rounded-full bg-[#f8f1df] px-3 py-1.5 text-xs font-black text-[#8f6b31] dark:bg-[#211c14] dark:text-[#d6b875]">
                      {formatPrice(
                        subtotal
                      )}
                    </span>
                  </div>
                </section>

                {/* Cart items */}
                <div className="space-y-4">
                  {cart.map((item) => {
                    const original =
                      item.original_price &&
                      item.original_price >
                        item.price
                        ? item.original_price
                        : item.price;

                    const discount =
                      original > item.price
                        ? Math.round(
                            ((original -
                              item.price) /
                              original) *
                              100
                          )
                        : 0;

                    const stock =
                      Math.max(
                        item.stock ?? 99,
                        0
                      );

                    return (
                      <article
                        key={item.id}
                        className={[
                          "group rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-[#2f2a22] dark:bg-[#12110e]",
                          removedId ===
                          item.id
                            ? "scale-[0.98] opacity-0"
                            : "",
                        ].join(" ")}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row">
                          {/* Product image */}
                          <Link
                            href={`/dashboard/products/${item.id}`}
                            className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl border border-[#eee6d8] bg-[#faf8f3] sm:h-36 sm:w-36 dark:border-[#2b261f] dark:bg-[#191712]"
                          >
                            <Image
                              src={getImageUrl(
                                item.image_url
                              )}
                              alt={item.name}
                              fill
                              sizes="144px"
                              className="object-contain p-3 transition duration-500 group-hover:scale-105"
                              onError={(
                                event
                              ) => {
                                event.currentTarget.src =
                                  "/placeholder-product.png";
                              }}
                            />

                            {discount >
                              0 && (
                              <span className="absolute left-2 top-2 rounded-md bg-[#8f6b31] px-2 py-1 text-[10px] font-black text-white">
                                {discount}% OFF
                              </span>
                            )}
                          </Link>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                {item.brand && (
                                  <p className="mb-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#a17a35]">
                                    {item.brand}
                                  </p>
                                )}

                                <Link
                                  href={`/dashboard/products/${item.id}`}
                                  className="line-clamp-2 text-base font-black leading-6 hover:text-[#a17a35]"
                                >
                                  {item.name}
                                </Link>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(
                                    item.id
                                  )
                                }
                                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.rating !==
                                null &&
                                item.rating !==
                                  undefined && (
                                  <span className="rounded-md bg-[#fff8e9] px-2 py-1 text-[10px] font-bold text-[#8f6b31] dark:bg-[#211c14]">
                                    ★{" "}
                                    {item.rating.toFixed(
                                      1
                                    )}
                                    {item.reviews_count
                                      ? ` (${item.reviews_count})`
                                      : ""}
                                  </span>
                                )}

                              {stock ===
                                0 && (
                                <span className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700 dark:bg-red-950/30 dark:text-red-400">
                                  Out of stock
                                </span>
                              )}

                              {stock > 0 &&
                                stock <=
                                  5 && (
                                  <span className="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-700 dark:bg-orange-950/30 dark:text-orange-300">
                                    Only{" "}
                                    {stock}{" "}
                                    left
                                  </span>
                                )}

                              {stock > 5 && (
                                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                                  In Stock
                                </span>
                              )}
                            </div>

                            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                              {/* Quantity */}
                              <div>
                                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                  Quantity
                                </p>

                                <div className="inline-flex h-10 items-center overflow-hidden rounded-xl border border-[#dfd3bd] bg-white dark:border-[#40372a] dark:bg-[#171512]">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuantity(
                                        item.id,
                                        "decrease"
                                      )
                                    }
                                    disabled={
                                      updatingId ===
                                      item.id
                                    }
                                    className="flex h-full w-10 items-center justify-center text-gray-500 hover:bg-[#faf8f3] hover:text-[#8f6b31] disabled:opacity-50 dark:hover:bg-[#211e18]"
                                  >
                                    <Minus className="h-3.5 w-3.5" />
                                  </button>

                                  <span className="flex min-w-10 items-center justify-center border-x border-[#dfd3bd] text-sm font-black dark:border-[#40372a]">
                                    {
                                      item.quantity
                                    }
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuantity(
                                        item.id,
                                        "increase"
                                      )
                                    }
                                    disabled={
                                      updatingId ===
                                        item.id ||
                                      item.quantity >=
                                        stock
                                    }
                                    className="flex h-full w-10 items-center justify-center text-gray-500 hover:bg-[#faf8f3] hover:text-[#8f6b31] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-[#211e18]"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Price */}
                              <div className="sm:text-right">
                                <div className="flex items-center gap-2 sm:justify-end">
                                  {original >
                                    item.price && (
                                    <span className="text-xs text-gray-400 line-through">
                                      {formatPrice(
                                        original *
                                          item.quantity
                                      )}
                                    </span>
                                  )}

                                  <span className="text-xl font-black">
                                    {formatPrice(
                                      item.price *
                                        item.quantity
                                    )}
                                  </span>
                                </div>

                                <p className="mt-1 text-[11px] text-gray-500">
                                  {formatPrice(
                                    item.price
                                  )}{" "}
                                  each
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#f0e9dd] pt-3 dark:border-[#29251f]">
                              <button
                                type="button"
                                onClick={() =>
                                  saveForLater(
                                    item
                                  )
                                }
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#8f6b31]"
                              >
                                <Heart className="h-3.5 w-3.5" />
                                Save for later
                              </button>

                              <span className="h-3 w-px bg-[#dfd3bd] dark:bg-[#40372a]" />

                              <Link
                                href={`/dashboard/products/${item.id}`}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#8f6b31]"
                              >
                                View product
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Benefits */}
                <section className="grid gap-3 sm:grid-cols-3">
                  <Benefit
                    icon={
                      <Truck className="h-5 w-5" />
                    }
                    title="Fast Delivery"
                    text="Reliable delivery to your doorstep."
                  />

                  <Benefit
                    icon={
                      <ShieldCheck className="h-5 w-5" />
                    }
                    title="Secure Shopping"
                    text="Protected checkout experience."
                  />

                  <Benefit
                    icon={
                      <RefreshCcw className="h-5 w-5" />
                    }
                    title="Easy Returns"
                    text="Simple returns on eligible products."
                  />
                </section>

                {/* Saved */}
                {savedItems.length >
                  0 && (
                  <section className="rounded-2xl border border-[#eadfc9] bg-white p-5 shadow-sm dark:border-[#2f2a22] dark:bg-[#12110e]">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-black">
                          Saved for Later
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                          Keep products here for later.
                        </p>
                      </div>

                      <Heart className="h-5 w-5 text-[#b9975b]" />
                    </div>

                    <div className="space-y-3">
                      {savedItems.map(
                        (item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-xl border border-[#eee6d8] p-3 dark:border-[#2c271f]"
                          >
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#faf8f3] dark:bg-[#191712]">
                              <Image
                                src={getImageUrl(
                                  item.image_url
                                )}
                                alt={
                                  item.name
                                }
                                fill
                                sizes="64px"
                                className="object-contain p-1.5"
                                onError={(
                                  event
                                ) => {
                                  event.currentTarget.src =
                                    "/placeholder-product.png";
                                }}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/dashboard/products/${item.id}`}
                                className="line-clamp-1 text-sm font-bold hover:text-[#a17a35]"
                              >
                                {item.name}
                              </Link>

                              <p className="mt-1 text-sm font-black text-[#8f6b31]">
                                {formatPrice(
                                  item.price
                                )}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                moveToCart(
                                  item
                                )
                              }
                              className="hidden rounded-lg bg-[#f8f1df] px-3 py-2 text-xs font-black text-[#8f6b31] sm:block"
                            >
                              Move to Cart
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                removeSavedItem(
                                  item.id
                                )
                              }
                              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                )}

                {/* Recommendations */}
                <RecommendationSection
                  products={
                    recommendations
                  }
                  loading={
                    recommendationLoading
                  }
                  wishlist={wishlist}
                  onWishlist={
                    toggleWishlist
                  }
                  onAddToCart={
                    addRecommendationToCart
                  }
                />
              </div>

              {/* RIGHT */}
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="space-y-4">
                  {/* Order summary */}
                  <section className="overflow-hidden rounded-2xl border border-[#d9c7a4] bg-white shadow-[0_18px_50px_rgba(72,52,18,0.08)] dark:border-[#443823] dark:bg-[#12110e]">
                    <div className="border-b border-[#eee6d8] bg-gradient-to-r from-[#fffdf8] to-[#faf5e9] p-5 dark:border-[#2b261f] dark:from-[#171510] dark:to-[#14120f]">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-black">
                            Order Summary
                          </h2>

                          <p className="mt-1 text-xs text-gray-500">
                            {itemCount} item
                            {itemCount === 1
                              ? ""
                              : "s"} in cart
                          </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8f1df] text-[#9a7539] dark:bg-[#211c14]">
                          <CreditCard className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      {/* Coupon */}
                      <div className="mb-5 overflow-hidden rounded-xl border border-[#eadfc9] dark:border-[#332d23]">
                        <button
                          type="button"
                          onClick={() =>
                            setCouponOpen(
                              (value) =>
                                !value
                            )
                          }
                          className="flex w-full items-center justify-between gap-3 p-3.5 text-left hover:bg-[#fcfaf6] dark:hover:bg-[#181611]"
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8f1df] text-[#9a7539] dark:bg-[#211c14]">
                              <Tag className="h-4 w-4" />
                            </span>

                            <span>
                              <span className="block text-xs font-black">
                                Apply Coupon
                              </span>

                              <span className="block text-[10px] text-gray-500">
                                Save more on your order
                              </span>
                            </span>
                          </span>

                          {couponOpen ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                        </button>

                        {couponOpen && (
                          <div className="border-t border-[#eee6d8] p-3.5 dark:border-[#332d23]">
                            {appliedCoupon ? (
                              <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/20">
                                <div>
                                  <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                                    {
                                      appliedCoupon
                                    }{" "}
                                    applied
                                  </p>

                                  <p className="mt-0.5 text-[10px] text-emerald-600">
                                    Saving{" "}
                                    {formatPrice(
                                      couponDiscount
                                    )}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={
                                    removeCoupon
                                  }
                                  className="text-[10px] font-black text-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex gap-2">
                                  <input
                                    value={
                                      coupon
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      setCoupon(
                                        event
                                          .target
                                          .value
                                          .toUpperCase()
                                      )
                                    }
                                    onKeyDown={(
                                      event
                                    ) => {
                                      if (
                                        event.key ===
                                        "Enter"
                                      ) {
                                        applyCoupon();
                                      }
                                    }}
                                    placeholder="Enter coupon"
                                    className="min-w-0 flex-1 rounded-lg border border-[#dfd3bd] bg-white px-3 py-2.5 text-xs font-semibold outline-none focus:border-[#b9975b] dark:border-[#40372a] dark:bg-[#171512]"
                                  />

                                  <button
                                    type="button"
                                    onClick={
                                      applyCoupon
                                    }
                                    className="rounded-lg bg-[#8f6b31] px-4 py-2 text-xs font-black text-white"
                                  >
                                    Apply
                                  </button>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCoupon(
                                        "PRIME10"
                                      )
                                    }
                                    className="rounded-md border border-[#eadfc9] px-2 py-1 text-[10px] font-bold text-[#8f6b31]"
                                  >
                                    PRIME10
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCoupon(
                                        "WELCOME"
                                      )
                                    }
                                    className="rounded-md border border-[#eadfc9] px-2 py-1 text-[10px] font-bold text-[#8f6b31]"
                                  >
                                    WELCOME
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="space-y-3 text-sm">
                        <PriceRow
                          label="Subtotal"
                          value={formatPrice(
                            subtotal
                          )}
                        />

                        {productSavings >
                          0 && (
                          <PriceRow
                            label="Product savings"
                            value={`-${formatPrice(
                              productSavings
                            )}`}
                            green
                          />
                        )}

                        <PriceRow
                          label="Delivery"
                          value={
                            shipping ===
                            0
                              ? "FREE"
                              : formatPrice(
                                  shipping
                                )
                          }
                          green={
                            shipping ===
                            0
                          }
                        />

                        {couponDiscount >
                          0 && (
                          <PriceRow
                            label="Coupon discount"
                            value={`-${formatPrice(
                              couponDiscount
                            )}`}
                            green
                          />
                        )}
                      </div>

                      <div className="my-5 border-t border-dashed border-[#dfd3bd] dark:border-[#40372a]" />

                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500">
                            Total Amount
                          </p>

                          <p className="mt-1 text-[10px] text-gray-400">
                            Inclusive of applicable taxes
                          </p>
                        </div>

                        <p className="text-2xl font-black text-[#8f6b31] dark:text-[#d6b875]">
                          {formatPrice(
                            grandTotal
                          )}
                        </p>
                      </div>

                      {totalSavings >
                        0 && (
                        <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                          <Gift className="h-4 w-4" />
                          You save{" "}
                          {formatPrice(
                            totalSavings
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={
                          proceedToCheckout
                        }
                        disabled={
                          validatingCart
                        }
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8f6b31] via-[#b9975b] to-[#8f6b31] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#8f6b31]/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {validatingCart ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Checking Cart...
                          </>
                        ) : (
                          <>
                            Proceed to Checkout
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>

                      <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-semibold text-gray-400">
                        <Lock className="h-3 w-3" />
                        Secure encrypted checkout
                      </div>
                    </div>
                  </section>

                  {/* Promise */}
                  <section className="rounded-2xl border border-[#eadfc9] bg-white p-5 shadow-sm dark:border-[#2f2a22] dark:bg-[#12110e]">
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#b9975b]" />
                      <h3 className="text-sm font-black">
                        PrimeCart Promise
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <Promise
                        icon={
                          <PackageCheck className="h-4 w-4" />
                        }
                        title="Quality Checked"
                        text="Products from trusted sellers"
                      />

                      <Promise
                        icon={
                          <Truck className="h-4 w-4" />
                        }
                        title="Reliable Delivery"
                        text="Track your order anytime"
                      />

                      <Promise
                        icon={
                          <RefreshCcw className="h-4 w-4" />
                        }
                        title="Easy Returns"
                        text="Hassle-free eligible returns"
                      />

                      <Promise
                        icon={
                          <ShieldCheck className="h-4 w-4" />
                        }
                        title="Secure Payments"
                        text="Protected checkout experience"
                      />
                    </div>
                  </section>

                  {/* Payment */}
                  <section className="rounded-2xl border border-[#eadfc9] bg-white p-5 shadow-sm dark:border-[#2f2a22] dark:bg-[#12110e]">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-black">
                        We Accept
                      </h3>

                      <WalletCards className="h-4 w-4 text-[#b9975b]" />
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[
                        "UPI",
                        "VISA",
                        "RuPay",
                        "COD",
                      ].map(
                        (method) => (
                          <div
                            key={method}
                            className="flex h-9 items-center justify-center rounded-lg border border-[#eee6d8] bg-[#fcfaf6] text-[9px] font-black text-gray-500 dark:border-[#2d2820] dark:bg-[#181611]"
                          >
                            {method}
                          </div>
                        )
                      )}
                    </div>
                  </section>

                  {/* Delivery */}
                  <section className="rounded-2xl border border-[#eadfc9] bg-gradient-to-br from-[#fffdf8] to-[#f8f1df] p-5 dark:border-[#332d23] dark:from-[#171510] dark:to-[#211c14]">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#9a7539] shadow-sm dark:bg-[#171512]">
                        <Clock3 className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-xs font-black">
                          Estimated Delivery
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#8f6b31] dark:text-[#d6b875]">
                          3–7 business days
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-gray-500">
                          Final delivery date will be confirmed at checkout.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>

      {/* Mobile checkout */}
      {cart.length >
        0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#d9c7a4] bg-white/95 p-3 shadow-[0_-10px_35px_rgba(72,52,18,0.12)] backdrop-blur-xl dark:border-[#3b3123] dark:bg-[#0f0e0c]/95 lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Total
              </p>

              <p className="truncate text-lg font-black text-[#8f6b31] dark:text-[#d6b875]">
                {formatPrice(
                  grandTotal
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={
                proceedToCheckout
              }
              disabled={
                validatingCart
              }
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#8f6b31] px-4 text-sm font-black text-white disabled:opacity-60"
            >
              {validatingCart
                ? "Checking..."
                : "Checkout"}

              {!validatingCart && (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function PriceRow({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 dark:text-gray-400">
        {label}
      </span>

      <span
        className={
          green
            ? "font-bold text-emerald-600"
            : "font-bold"
        }
      >
        {value}
      </span>
    </div>
  );
}

function Benefit({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-sm dark:border-[#2f2a22] dark:bg-[#12110e]">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8f1df] text-[#9a7539] dark:bg-[#211c14]">
        {icon}
      </div>

      <h3 className="text-xs font-black">
        {title}
      </h3>

      <p className="mt-1 text-[10px] leading-4 text-gray-500 dark:text-gray-400">
        {text}
      </p>
    </div>
  );
}

function Promise({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f8f1df] text-[#9a7539] dark:bg-[#211c14]">
        {icon}
      </div>

      <div>
        <p className="text-xs font-bold">
          {title}
        </p>

        <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
          {text}
        </p>
      </div>
    </div>
  );
}

function RecommendationSection({
  products,
  loading,
  wishlist,
  onWishlist,
  onAddToCart,
}: {
  products: Product[];
  loading: boolean;
  wishlist: string[];
  onWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
}) {
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[#eadfc9] bg-white p-5 shadow-sm dark:border-[#2f2a22] dark:bg-[#12110e]">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#b9975b]" />

            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9a7539]">
              Curated For You
            </span>
          </div>

          <h2 className="text-xl font-black">
            You May Also Like
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Products selected based on your cart.
          </p>
        </div>

        <Link
          href="/dashboard/products"
          className="hidden items-center gap-1 text-xs font-black text-[#8f6b31] sm:flex"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-xl bg-[#f5f0e6] dark:bg-[#1b1813]"
              />
            )
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {products
            .slice(0, 6)
            .map((product) => {
              const original =
                product.original_price &&
                product.original_price >
                  product.price
                  ? product.original_price
                  : product.price;

              const discount =
                original >
                product.price
                  ? Math.round(
                      ((original -
                        product.price) /
                        original) *
                        100
                    )
                  : 0;

              const liked =
                wishlist.includes(
                  product.id
                );

              return (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-xl border border-[#eee6d8] bg-white transition hover:-translate-y-0.5 hover:shadow-lg dark:border-[#2c271f] dark:bg-[#15130f]"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#faf8f3] dark:bg-[#191712]">
                    <Link
                      href={`/dashboard/products/${product.id}`}
                    >
                      <Image
                        src={getImageUrl(
                          product.image_url
                        )}
                        alt={
                          product.name
                        }
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-contain p-4 transition duration-500 group-hover:scale-105"
                        onError={(
                          event
                        ) => {
                          event.currentTarget.src =
                            "/placeholder-product.png";
                        }}
                      />
                    </Link>

                    {discount >
                      0 && (
                      <span className="absolute left-2 top-2 rounded-md bg-[#8f6b31] px-1.5 py-1 text-[8px] font-black text-white">
                        {discount}% OFF
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onWishlist(
                          product.id
                        )
                      }
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur dark:bg-[#171512]/90"
                      aria-label="Wishlist"
                    >
                      <Heart
                        className={[
                          "h-4 w-4",
                          liked
                            ? "fill-[#b9975b] text-[#b9975b]"
                            : "text-gray-500",
                        ].join(
                          " "
                        )}
                      />
                    </button>
                  </div>

                  <div className="p-3">
                    {product.brand && (
                      <p className="truncate text-[8px] font-black uppercase tracking-wider text-[#a17a35]">
                        {product.brand}
                      </p>
                    )}

                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="mt-1 line-clamp-2 min-h-9 text-xs font-black leading-4 hover:text-[#a17a35]"
                    >
                      {product.name}
                    </Link>

                    {product.rating !==
                      null &&
                      product.rating !==
                        undefined && (
                        <div className="mt-2 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-[#b9975b] text-[#b9975b]" />

                          <span className="text-[9px] font-bold text-gray-500">
                            {product.rating.toFixed(
                              1
                            )}
                          </span>
                        </div>
                      )}

                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-sm font-black text-[#8f6b31] dark:text-[#d6b875]">
                        {formatPrice(
                          product.price
                        )}
                      </span>

                      {original >
                        product.price && (
                        <span className="text-[9px] text-gray-400 line-through">
                          {formatPrice(
                            original
                          )}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onAddToCart(
                          product
                        )
                      }
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#f8f1df] px-2 py-2.5 text-[10px] font-black text-[#8f6b31] transition hover:bg-[#eadfc9] dark:bg-[#211c14] dark:text-[#d6b875]"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </section>
  );
}

function EmptyCart() {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-[#eadfc9] bg-white px-6 py-16 text-center shadow-[0_18px_55px_rgba(72,52,18,0.06)] dark:border-[#2f2a22] dark:bg-[#12110e] sm:px-10 sm:py-24">
      <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-[#b9975b]/10 blur-3xl" />

      <div className="relative mx-auto max-w-md">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#fff9ea] to-[#f3e8cf] text-[#a17a35] dark:from-[#211c14] dark:to-[#19150f]">
          <ShoppingCart className="h-10 w-10" />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f8f1df] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#8f6b31] dark:bg-[#211c14] dark:text-[#d6b875]">
          <Zap className="h-3.5 w-3.5" />
          Ready to shop?
        </div>

        <h2 className="mt-4 text-2xl font-black sm:text-3xl">
          Your cart is waiting
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
          Discover products you&apos;ll love and
          start building your cart.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8f6b31] to-[#b9975b] px-6 py-3.5 text-sm font-black text-white shadow-lg"
          >
            Explore Products
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/dashboard/categories"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9c7a4] bg-white px-6 py-3.5 text-sm font-black text-[#8f6b31] dark:border-[#443823] dark:bg-[#171512] dark:text-[#d6b875]"
          >
            Browse Categories
          </Link>
        </div>
      </div>
    </section>
  );
}

function CartLoading() {
  return (
    <main className="min-h-screen bg-[#faf8f3] dark:bg-[#0c0b09]">
      <div className="border-b border-[#eadfc9] bg-white dark:border-[#2f2a22] dark:bg-[#12110e]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="h-10 w-32 animate-pulse rounded-xl bg-[#eee6d8] dark:bg-[#252118]" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-[#eee6d8] dark:bg-[#252118]" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 h-44 animate-pulse rounded-[28px] bg-white dark:bg-[#12110e]" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-2xl bg-white dark:bg-[#12110e]" />

            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="h-52 animate-pulse rounded-2xl bg-white dark:bg-[#12110e]"
                />
              )
            )}
          </div>

          <div className="h-[520px] animate-pulse rounded-2xl bg-white dark:bg-[#12110e]" />
        </div>
      </div>
    </main>
  );
}
