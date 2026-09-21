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
  Tag,
  Trash2,
  Truck,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CartProduct = {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  image_url?: string | null;
  brand?: string | null;
  stock?: number | null;
  category?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
};

type CartItem = CartProduct & {
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
const CHECKOUT_CART_KEY = "primecart-checkout-cart";
const CHECKOUT_SUMMARY_KEY = "primecart-checkout-summary";

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
    label: "₹150 OFF on orders above ₹999",
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
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore localStorage errors.
  }
}

function normalizeCartItem(item: Partial<CartItem>): CartItem | null {
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
    category: item.category ?? null,
    rating:
      item.rating !== null && item.rating !== undefined
        ? Number(item.rating)
        : null,
    reviews_count:
      item.reviews_count !== null && item.reviews_count !== undefined
        ? Number(item.reviews_count)
        : null,
    quantity: Math.max(1, Number(item.quantity) || 1),
  };
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);

  const [notice, setNotice] = useState<Notice | null>(null);

  const [removedId, setRemovedId] = useState<string | null>(null);

  useEffect(() => {
    const storedCart = readStorage<Partial<CartItem>>(CART_KEY)
      .map(normalizeCartItem)
      .filter((item): item is CartItem => item !== null);

    const storedSaved = readStorage<Partial<SavedItem>>(SAVED_KEY)
      .map(normalizeCartItem)
      .filter((item): item is SavedItem => item !== null);

    setCart(storedCart);
    setSavedItems(storedSaved);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      saveStorage(CART_KEY, cart);
    }
  }, [cart, loading]);

  useEffect(() => {
    if (!loading) {
      saveStorage(SAVED_KEY, savedItems);
    }
  }, [savedItems, loading]);

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const itemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cart]);

  const originalTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const original = item.original_price || item.price;
      return total + Math.max(original, item.price) * item.quantity;
    }, 0);
  }, [cart]);

  const productSavings = Math.max(originalTotal - subtotal, 0);

  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_LIMIT
    ? 0
    : STANDARD_SHIPPING;

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || !COUPONS[appliedCoupon as keyof typeof COUPONS]) {
      return 0;
    }

    const selected =
      COUPONS[appliedCoupon as keyof typeof COUPONS];

    if (subtotal < selected.minimum) {
      return 0;
    }

    if (selected.type === "percent") {
      return Math.min(
        Math.round((subtotal * selected.value) / 100),
        selected.maxDiscount ?? Number.MAX_SAFE_INTEGER
      );
    }

    return Math.min(selected.value, subtotal);
  }, [appliedCoupon, subtotal]);

  const grandTotal = Math.max(
    subtotal + shipping - couponDiscount,
    0
  );

  const totalSavings = productSavings + couponDiscount;

  const freeShippingRemaining = Math.max(
    FREE_SHIPPING_LIMIT - subtotal,
    0
  );

  const shippingProgress = Math.min(
    Math.round((subtotal / FREE_SHIPPING_LIMIT) * 100),
    100
  );

  const totalItems = cart.length;

  function showNotice(
    message: string,
    type: NoticeType = "success"
  ) {
    setNotice({
      type,
      message,
    });
  }

  function persistCart(nextCart: CartItem[]) {
    setCart(nextCart);
    saveStorage(CART_KEY, nextCart);
  }

  function updateQuantity(id: string, direction: "increase" | "decrease") {
    const item = cart.find((product) => product.id === id);

    if (!item) return;

    const stock = item.stock ?? 99;

    setUpdatingId(id);

    setTimeout(() => {
      const nextCart = cart
        .map((product) => {
          if (product.id !== id) return product;

          const nextQuantity =
            direction === "increase"
              ? Math.min(product.quantity + 1, Math.max(stock, 1))
              : product.quantity - 1;

          return {
            ...product,
            quantity: nextQuantity,
          };
        })
        .filter((product) => product.quantity > 0);

      persistCart(nextCart);

      if (direction === "increase" && item.quantity >= stock) {
        showNotice(
          `Only ${stock} unit${stock === 1 ? "" : "s"} available.`,
          "info"
        );
      }

      setUpdatingId(null);
    }, 120);
  }

  function removeItem(id: string) {
    setRemovedId(id);

    window.setTimeout(() => {
      const removed = cart.find((item) => item.id === id);

      const nextCart = cart.filter((item) => item.id !== id);

      persistCart(nextCart);
      setRemovedId(null);

      if (removed) {
        showNotice(`${removed.name} removed from your cart.`, "info");
      }
    }, 180);
  }

  function saveForLater(item: CartItem) {
    const exists = savedItems.some((saved) => saved.id === item.id);

    if (!exists) {
      setSavedItems((previous) => [
        ...previous,
        {
          ...item,
          quantity: 1,
        },
      ]);
    }

    const nextCart = cart.filter((product) => product.id !== item.id);
    persistCart(nextCart);

    showNotice("Product saved for later.");
  }

  function moveToCart(item: SavedItem) {
    const existing = cart.find((product) => product.id === item.id);

    if (existing) {
      const stock = existing.stock ?? 99;

      persistCart(
        cart.map((product) =>
          product.id === item.id
            ? {
                ...product,
                quantity: Math.min(
                  product.quantity + item.quantity,
                  Math.max(stock, 1)
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
          quantity: Math.max(1, item.quantity),
        },
      ]);
    }

    setSavedItems((previous) =>
      previous.filter((saved) => saved.id !== item.id)
    );

    showNotice("Product moved back to your cart.");
  }

  function removeSavedItem(id: string) {
    setSavedItems((previous) =>
      previous.filter((item) => item.id !== id)
    );

    showNotice("Saved product removed.", "info");
  }

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();

    if (!code) {
      showNotice("Enter a coupon code first.", "error");
      return;
    }

    const selected =
      COUPONS[code as keyof typeof COUPONS];

    if (!selected) {
      showNotice("This coupon code is not valid.", "error");
      return;
    }

    if (subtotal < selected.minimum) {
      showNotice(
        `Add ${formatPrice(
          selected.minimum - subtotal
        )} more to use ${code}.`,
        "info"
      );
      return;
    }

    setAppliedCoupon(code);
    setCouponOpen(false);

    showNotice(`${code} applied successfully.`);
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCoupon("");
    showNotice("Coupon removed.", "info");
  }

  function proceedToCheckout() {
    if (!cart.length) {
      showNotice("Your cart is empty.", "error");
      return;
    }

    const checkoutSummary = {
      itemCount,
      subtotal,
      shipping,
      couponDiscount,
      appliedCoupon,
      totalSavings,
      grandTotal,
    };

    saveStorage(CHECKOUT_CART_KEY, cart);
    saveStorage(CHECKOUT_SUMMARY_KEY, [checkoutSummary]);

    window.location.href = "/dashboard/checkout";
  }

  function continueShopping() {
    window.location.href = "/dashboard/products";
  }

  if (loading) {
    return <CartLoading />;
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#17130d] dark:bg-[#0c0b09] dark:text-white">
      {/* Notification */}
      {notice && (
        <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm">
          <div
            className={[
              "flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl dark:bg-[#171512]",
              notice.type === "success"
                ? "border-emerald-200 dark:border-emerald-900"
                : notice.type === "error"
                  ? "border-red-200 dark:border-red-900"
                  : "border-[#eadfc9] dark:border-[#3a3224]",
            ].join(" ")}
          >
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
              onClick={() => setNotice(null)}
              className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Close notification"
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#d6b875] via-[#b9975b] to-[#8f6b31] text-white shadow-lg shadow-[#b9975b]/20">
              <ShoppingBag className="h-5 w-5" />
            </div>

            <div className="leading-none">
              <div className="text-lg font-black tracking-tight">
                Prime<span className="text-[#b9975b]">Cart</span>
              </div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-gray-400">
                Premium Shopping
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/dashboard/products"
              className="text-sm font-semibold text-gray-600 transition hover:text-[#a17a35] dark:text-gray-300 dark:hover:text-[#d6b875]"
            >
              Continue Shopping
            </Link>

            <Link
              href="/dashboard/orders"
              className="text-sm font-semibold text-gray-600 transition hover:text-[#a17a35] dark:text-gray-300 dark:hover:text-[#d6b875]"
            >
              My Orders
            </Link>

            <div className="flex items-center gap-2 rounded-full border border-[#eadfc9] bg-[#faf8f3] px-3 py-2 dark:border-[#332d23] dark:bg-[#171512]">
              <Lock className="h-3.5 w-3.5 text-[#a17a35]" />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                Secure Checkout
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-[#f8f1df] px-3 py-2 text-[#8f6b31] dark:bg-[#201c15]">
            <ShoppingCart className="h-4 w-4" />
            <span className="text-xs font-black">
              {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-12">
        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-2 text-xs font-medium text-gray-500">
          <Link
            href="/dashboard"
            className="transition hover:text-[#a17a35]"
          >
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#17130d] dark:text-white">
            Shopping Cart
          </span>
        </nav>

        {/* Top heading */}
        <section className="mb-8 overflow-hidden rounded-[28px] border border-[#eadfc9] bg-white shadow-[0_15px_45px_rgba(72,52,18,0.06)] dark:border-[#2f2a22] dark:bg-[#12110e]">
          <div className="relative p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#b9975b]/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-24 w-56 rounded-full bg-[#eadfc9]/30 blur-3xl dark:bg-[#b9975b]/5" />

            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#eadfc9] bg-[#faf8f3] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#9a7539] dark:border-[#332d23] dark:bg-[#191712]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Your Shopping Bag
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Shopping Cart
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                  Review your selected products, apply offers, and
                  complete your order securely.
                </p>
              </div>

              <button
                type="button"
                onClick={continueShopping}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9c7a4] bg-white px-5 py-3 text-sm font-bold text-[#8f6b31] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#faf8f3] dark:border-[#4a3d28] dark:bg-[#171512] dark:text-[#d6b875]"
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
                    You&apos;ve unlocked FREE shipping on this order!
                  </span>
                  <Check className="ml-auto h-5 w-5" />
                </div>
              ) : (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">
                      Add{" "}
                      <span className="font-black text-[#9a7539]">
                        {formatPrice(freeShippingRemaining)}
                      </span>{" "}
                      more for FREE shipping
                    </span>
                    <Truck className="h-4 w-4 shrink-0 text-[#a17a35]" />
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
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* Left */}
            <div className="min-w-0 space-y-5">
              {/* Cart header */}
              <section className="rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-sm dark:border-[#2f2a22] dark:bg-[#12110e] sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black">
                      Your Items
                    </h2>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {totalItems} product{totalItems === 1 ? "" : "s"} •{" "}
                      {itemCount} unit{itemCount === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="rounded-full bg-[#faf8f3] px-3 py-1.5 text-xs font-bold text-[#8f6b31] dark:bg-[#1c1914] dark:text-[#d6b875]">
                    {formatPrice(subtotal)} subtotal
                  </div>
                </div>
              </section>

              {/* Cart items */}
              <div className="space-y-4">
                {cart.map((item) => {
                  const original =
                    item.original_price &&
                    item.original_price > item.price
                      ? item.original_price
                      : item.price;

                  const discount =
                    original > item.price
                      ? Math.round(
                          ((original - item.price) / original) * 100
                        )
                      : 0;

                  const stock = item.stock ?? 99;

                  return (
                    <article
                      key={item.id}
                      className={[
                        "group relative overflow-hidden rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-[#2f2a22] dark:bg-[#12110e]",
                        removedId === item.id
                          ? "scale-[0.98] opacity-0"
                          : "opacity-100",
                      ].join(" ")}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row">
                        {/* Image */}
                        <Link
                          href={`/dashboard/products/${item.id}`}
                          className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl border border-[#eee6d8] bg-[#faf8f3] sm:h-36 sm:w-36 dark:border-[#2b261f] dark:bg-[#191712]"
                        >
                          <Image
                            src={getImageUrl(item.image_url)}
                            alt={item.name}
                            fill
                            sizes="144px"
                            className="object-contain p-3 transition duration-500 group-hover:scale-105"
                            onError={(event) => {
                              event.currentTarget.src =
                                "/placeholder-product.png";
                            }}
                          />

                          {discount > 0 && (
                            <span className="absolute left-2 top-2 rounded-md bg-[#8f6b31] px-2 py-1 text-[10px] font-black text-white shadow">
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
                                className="line-clamp-2 text-base font-black leading-6 transition hover:text-[#a17a35]"
                              >
                                {item.name}
                              </Link>

                              {item.category && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  {item.category}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {item.rating !== null &&
                              item.rating !== undefined && (
                                <span className="rounded-md bg-[#fff8e9] px-2 py-1 text-[10px] font-bold text-[#8f6b31] dark:bg-[#211c13]">
                                  ★ {item.rating.toFixed(1)}
                                  {item.reviews_count
                                    ? ` (${item.reviews_count})`
                                    : ""}
                                </span>
                              )}

                            {stock <= 5 && stock > 0 && (
                              <span className="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-700 dark:bg-orange-950/30 dark:text-orange-300">
                                Only {stock} left
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
                                    updatingId === item.id
                                  }
                                  className="flex h-full w-10 items-center justify-center text-gray-500 transition hover:bg-[#faf8f3] hover:text-[#8f6b31] disabled:opacity-50 dark:hover:bg-[#211e18]"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>

                                <span className="flex min-w-10 items-center justify-center border-x border-[#dfd3bd] text-sm font-black dark:border-[#40372a]">
                                  {item.quantity}
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
                                    updatingId === item.id ||
                                    item.quantity >= stock
                                  }
                                  className="flex h-full w-10 items-center justify-center text-gray-500 transition hover:bg-[#faf8f3] hover:text-[#8f6b31] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-[#211e18]"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="sm:text-right">
                              <div className="flex items-center gap-2 sm:justify-end">
                                {original > item.price && (
                                  <span className="text-xs text-gray-400 line-through">
                                    {formatPrice(
                                      original * item.quantity
                                    )}
                                  </span>
                                )}

                                <span className="text-xl font-black">
                                  {formatPrice(
                                    item.price * item.quantity
                                  )}
                                </span>
                              </div>

                              <p className="mt-1 text-[11px] text-gray-500">
                                {formatPrice(item.price)} each
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#f0e9dd] pt-3 dark:border-[#29251f]">
                            <button
                              type="button"
                              onClick={() => saveForLater(item)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 transition hover:text-[#8f6b31] dark:text-gray-400 dark:hover:text-[#d6b875]"
                            >
                              <Heart className="h-3.5 w-3.5" />
                              Save for later
                            </button>

                            <span className="h-3 w-px bg-[#dfd3bd] dark:bg-[#40372a]" />

                            <Link
                              href={`/dashboard/products/${item.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 transition hover:text-[#8f6b31] dark:text-gray-400 dark:hover:text-[#d6b875]"
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
                <BenefitCard
                  icon={<Truck className="h-5 w-5" />}
                  title="Fast Delivery"
                  text="Reliable delivery to your doorstep."
                />

                <BenefitCard
                  icon={<ShieldCheck className="h-5 w-5" />}
                  title="Secure Shopping"
                  text="Your checkout is protected."
                />

                <BenefitCard
                  icon={<RefreshCcw className="h-5 w-5" />}
                  title="Easy Returns"
                  text="Simple returns on eligible products."
                />
              </section>

              {/* Saved */}
              {savedItems.length > 0 && (
                <section className="rounded-2xl border border-[#eadfc9] bg-white p-5 shadow-sm dark:border-[#2f2a22] dark:bg-[#12110e]">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black">
                        Saved for Later
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        {savedItems.length} saved product
                        {savedItems.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <Heart className="h-5 w-5 text-[#b9975b]" />
                  </div>

                  <div className="space-y-3">
                    {savedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-[#eee6d8] p-3 dark:border-[#2c271f]"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#faf8f3] dark:bg-[#191712]">
                          <Image
                            src={getImageUrl(item.image_url)}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-contain p-1.5"
                            onError={(event) => {
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
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => moveToCart(item)}
                          className="hidden rounded-lg bg-[#f8f1df] px-3 py-2 text-xs font-black text-[#8f6b31] transition hover:bg-[#eadfc9] sm:block dark:bg-[#211c14] dark:text-[#d6b875]"
                        >
                          Move to Cart
                        </button>

                        <button
                          type="button"
                          onClick={() => moveToCart(item)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f8f1df] text-[#8f6b31] sm:hidden"
                          aria-label="Move to cart"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeSavedItem(item.id)
                          }
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          aria-label="Remove saved product"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-4">
                {/* Summary */}
                <section className="overflow-hidden rounded-2xl border border-[#d9c7a4] bg-white shadow-[0_18px_50px_rgba(72,52,18,0.08)] dark:border-[#443823] dark:bg-[#12110e]">
                  <div className="border-b border-[#eee6d8] bg-gradient-to-r from-[#fffdf8] to-[#faf5e9] p-5 dark:border-[#2b261f] dark:from-[#171510] dark:to-[#14120f]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-black">
                          Order Summary
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                          {itemCount} item
                          {itemCount === 1 ? "" : "s"} in your cart
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
                          setCouponOpen((value) => !value)
                        }
                        className="flex w-full items-center justify-between gap-3 p-3.5 text-left transition hover:bg-[#fcfaf6] dark:hover:bg-[#181611]"
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
                                  {appliedCoupon} applied
                                </p>
                                <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-500">
                                  You&apos;re saving{" "}
                                  {formatPrice(couponDiscount)}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={removeCoupon}
                                className="text-[10px] font-black text-red-600 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex gap-2">
                                <input
                                  value={coupon}
                                  onChange={(event) =>
                                    setCoupon(
                                      event.target.value.toUpperCase()
                                    )
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      applyCoupon();
                                    }
                                  }}
                                  placeholder="Enter coupon code"
                                  className="min-w-0 flex-1 rounded-lg border border-[#dfd3bd] bg-white px-3 py-2.5 text-xs font-semibold outline-none transition placeholder:text-gray-400 focus:border-[#b9975b] focus:ring-2 focus:ring-[#b9975b]/15 dark:border-[#40372a] dark:bg-[#171512]"
                                />

                                <button
                                  type="button"
                                  onClick={applyCoupon}
                                  className="rounded-lg bg-[#8f6b31] px-4 py-2 text-xs font-black text-white transition hover:bg-[#7d5d2c]"
                                >
                                  Apply
                                </button>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCoupon("PRIME10")
                                  }
                                  className="rounded-md border border-[#eadfc9] px-2 py-1 text-[10px] font-bold text-[#8f6b31] hover:bg-[#faf8f3] dark:border-[#40372a]"
                                >
                                  PRIME10
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setCoupon("WELCOME")
                                  }
                                  className="rounded-md border border-[#eadfc9] px-2 py-1 text-[10px] font-bold text-[#8f6b31] hover:bg-[#faf8f3] dark:border-[#40372a]"
                                >
                                  WELCOME
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Price breakdown */}
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Subtotal
                        </span>
                        <span className="font-bold">
                          {formatPrice(subtotal)}
                        </span>
                      </div>

                      {productSavings > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            Product savings
                          </span>
                          <span className="font-bold text-emerald-600">
                            -{formatPrice(productSavings)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Delivery
                        </span>
                        <span
                          className={
                            shipping === 0
                              ? "font-bold text-emerald-600"
                              : "font-bold"
                          }
                        >
                          {shipping === 0
                            ? "FREE"
                            : formatPrice(shipping)}
                        </span>
                      </div>

                      {couponDiscount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            Coupon discount
                          </span>
                          <span className="font-bold text-emerald-600">
                            -{formatPrice(couponDiscount)}
                          </span>
                        </div>
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
                        {formatPrice(grandTotal)}
                      </p>
                    </div>

                    {totalSavings > 0 && (
                      <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                        <Gift className="h-4 w-4" />
                        You&apos;re saving {formatPrice(totalSavings)}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={proceedToCheckout}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8f6b31] via-[#b9975b] to-[#8f6b31] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#8f6b31]/20 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                    >
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-semibold text-gray-400">
                      <Lock className="h-3 w-3" />
                      Secure encrypted checkout
                    </div>
                  </div>
                </section>

                {/* PrimeCart Promise */}
                <section className="rounded-2xl border border-[#eadfc9] bg-white p-5 shadow-sm dark:border-[#2f2a22] dark:bg-[#12110e]">
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#b9975b]" />
                    <h3 className="text-sm font-black">
                      PrimeCart Promise
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <MiniPromise
                      icon={<PackageCheck className="h-4 w-4" />}
                      title="Quality Checked"
                      text="Products from trusted sellers"
                    />

                    <MiniPromise
                      icon={<Truck className="h-4 w-4" />}
                      title="Reliable Delivery"
                      text="Track your order anytime"
                    />

                    <MiniPromise
                      icon={<RefreshCcw className="h-4 w-4" />}
                      title="Easy Returns"
                      text="Hassle-free eligible returns"
                    />

                    <MiniPromise
                      icon={<ShieldCheck className="h-4 w-4" />}
                      title="Secure Payments"
                      text="Protected checkout experience"
                    />
                  </div>
                </section>

                {/* Payment methods */}
                <section className="rounded-2xl border border-[#eadfc9] bg-white p-5 shadow-sm dark:border-[#2f2a22] dark:bg-[#12110e]">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-black">
                      We Accept
                    </h3>

                    <WalletCards className="h-4 w-4 text-[#b9975b]" />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {["UPI", "VISA", "RuPay", "COD"].map(
                      (method) => (
                        <div
                          key={method}
                          className="flex h-9 items-center justify-center rounded-lg border border-[#eee6d8] bg-[#fcfaf6] text-[9px] font-black text-gray-500 dark:border-[#2d2820] dark:bg-[#181611] dark:text-gray-400"
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
                      <p className="mt-1 text-[10px] leading-4 text-gray-500 dark:text-gray-400">
                        Final delivery date will be confirmed at checkout.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Mobile checkout bar */}
      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#d9c7a4] bg-white/95 p-3 shadow-[0_-10px_35px_rgba(72,52,18,0.12)] backdrop-blur-xl dark:border-[#3b3123] dark:bg-[#0f0e0c]/95 lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Total
              </p>
              <p className="truncate text-lg font-black text-[#8f6b31] dark:text-[#d6b875]">
                {formatPrice(grandTotal)}
              </p>
            </div>

            <button
              type="button"
              onClick={proceedToCheckout}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#8f6b31] px-4 text-sm font-black text-white shadow-lg shadow-[#8f6b31]/20 transition active:scale-[0.98]"
            >
              Checkout
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </main>
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
    <div className="rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-sm dark:border-[#2f2a22] dark:bg-[#12110e]">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8f1df] text-[#9a7539] dark:bg-[#211c14]">
        {icon}
      </div>

      <h3 className="text-xs font-black">{title}</h3>

      <p className="mt-1 text-[10px] leading-4 text-gray-500 dark:text-gray-400">
        {text}
      </p>
    </div>
  );
}

function MiniPromise({
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

      <div className="min-w-0">
        <p className="text-xs font-bold">{title}</p>
        <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
          {text}
        </p>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-[#eadfc9] bg-white px-6 py-16 text-center shadow-[0_18px_55px_rgba(72,52,18,0.06)] dark:border-[#2f2a22] dark:bg-[#12110e] sm:px-10 sm:py-24">
      <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-[#b9975b]/10 blur-3xl" />

      <div className="relative mx-auto max-w-md">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#fff9ea] to-[#f3e8cf] text-[#a17a35] shadow-inner dark:from-[#211c14] dark:to-[#19150f]">
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
          Looks like you haven&apos;t added anything yet. Discover
          products you&apos;ll love and start building your cart.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8f6b31] to-[#b9975b] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[#8f6b31]/20 transition hover:-translate-y-0.5"
          >
            Explore Products
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/dashboard/categories"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9c7a4] bg-white px-6 py-3.5 text-sm font-black text-[#8f6b31] transition hover:bg-[#faf8f3] dark:border-[#443823] dark:bg-[#171512] dark:text-[#d6b875]"
          >
            Browse Categories
          </Link>
        </div>

        <div className="mt-9 grid grid-cols-3 gap-2 border-t border-[#eee6d8] pt-6 dark:border-[#2b261f]">
          <div>
            <p className="text-sm font-black">Secure</p>
            <p className="mt-1 text-[9px] text-gray-400">
              Checkout
            </p>
          </div>

          <div className="border-x border-[#eee6d8] dark:border-[#2b261f]">
            <p className="text-sm font-black">Fast</p>
            <p className="mt-1 text-[9px] text-gray-400">
              Delivery
            </p>
          </div>

          <div>
            <p className="text-sm font-black">Easy</p>
            <p className="mt-1 text-[9px] text-gray-400">
              Returns
            </p>
          </div>
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

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-52 animate-pulse rounded-2xl bg-white dark:bg-[#12110e]"
              />
            ))}
          </div>

          <div className="h-[520px] animate-pulse rounded-2xl bg-white dark:bg-[#12110e]" />
        </div>
      </div>
    </main>
  );
}
