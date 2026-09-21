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
  Heart,
  Lock,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type CartProduct = {
  id: string;
  name: string;
  slug?: string;
  price: number;
  original_price?: number | null;
  image_url?: string | null;
  brand?: string | null;
  stock?: number;
  category?: string | null;
};

type CartItem = CartProduct & {
  quantity: number;
};

type SavedItem = CartItem;

const CART_KEY = "primecart-cart";
const SAVED_KEY = "primecart-saved";

const FREE_SHIPPING_LIMIT = 999;
const SHIPPING_CHARGE = 79;

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

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponOpen, setCouponOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    setCart(readStorage<CartItem[]>(CART_KEY, []));
    setSaved(readStorage<SavedItem[]>(SAVED_KEY, []));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    }
  }, [saved, loading]);

  const itemCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0
      ),
    [cart]
  );

  const originalTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Number(item.original_price || item.price) * item.quantity,
        0
      ),
    [cart]
  );

  const productSavings = Math.max(originalTotal - subtotal, 0);

  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= FREE_SHIPPING_LIMIT
        ? 0
        : SHIPPING_CHARGE;

  const totalSavings = productSavings + couponDiscount;

  const grandTotal = Math.max(
    subtotal + shipping - couponDiscount,
    0
  );

  const remainingForFreeShipping = Math.max(
    FREE_SHIPPING_LIMIT - subtotal,
    0
  );

  const shippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_LIMIT) * 100,
    100
  );

  function updateCart(nextCart: CartItem[]) {
    setCart(nextCart);
  }

  function increaseQuantity(id: string) {
    updateCart(
      cart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(
                item.quantity + 1,
                item.stock && item.stock > 0 ? item.stock : 99
              ),
            }
          : item
      )
    );
  }

  function decreaseQuantity(id: string) {
    const item = cart.find((product) => product.id === id);

    if (!item) return;

    if (item.quantity <= 1) {
      removeItem(id);
      return;
    }

    updateCart(
      cart.map((product) =>
        product.id === id
          ? {
              ...product,
              quantity: product.quantity - 1,
            }
          : product
      )
    );
  }

  function removeItem(id: string) {
    const item = cart.find((product) => product.id === id);

    if (!item) return;

    setRemovingId(id);

    window.setTimeout(() => {
      setCart((current) => current.filter((product) => product.id !== id));
      setRemovingId(null);
      toast.success(`${item.name} removed from cart`);
    }, 250);
  }

  function moveToSaved(item: CartItem) {
    const alreadySaved = saved.some((product) => product.id === item.id);

    if (!alreadySaved) {
      setSaved((current) => [...current, item]);
    }

    setCart((current) => current.filter((product) => product.id !== item.id));

    toast.success("Product saved for later");
  }

  function moveToCart(item: SavedItem) {
    const alreadyInCart = cart.find((product) => product.id === item.id);

    if (alreadyInCart) {
      setCart((current) =>
        current.map((product) =>
          product.id === item.id
            ? {
                ...product,
                quantity: product.quantity + item.quantity,
              }
            : product
        )
      );
    } else {
      setCart((current) => [...current, item]);
    }

    setSaved((current) =>
      current.filter((product) => product.id !== item.id)
    );

    toast.success("Product moved to cart");
  }

  function removeSaved(id: string) {
    setSaved((current) =>
      current.filter((product) => product.id !== id)
    );

    toast.success("Removed from saved items");
  }

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();

    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (code === "PRIME10") {
      const discount = Math.min(subtotal * 0.1, 500);

      setCouponDiscount(Math.round(discount));
      setAppliedCoupon(code);

      toast.success("Coupon applied successfully");
      return;
    }

    if (code === "WELCOME") {
      if (subtotal < 999) {
        toast.error("WELCOME requires a minimum cart value of ₹999");
        return;
      }

      setCouponDiscount(150);
      setAppliedCoupon(code);

      toast.success("₹150 discount applied");
      return;
    }

    toast.error("Invalid coupon code");
  }

  function removeCoupon() {
    setAppliedCoupon("");
    setCouponDiscount(0);
    setCoupon("");
    toast.success("Coupon removed");
  }

  function proceedToCheckout() {
    if (!cart.length) {
      toast.error("Your cart is empty");
      return;
    }

    localStorage.setItem(
      "primecart-checkout-cart",
      JSON.stringify(cart)
    );

    localStorage.setItem(
      "primecart-checkout-summary",
      JSON.stringify({
        subtotal,
        shipping,
        couponDiscount,
        grandTotal,
        appliedCoupon,
      })
    );

    window.location.href = "/dashboard/checkout";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f3]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-10 w-56 animate-pulse rounded-xl bg-[#eadfc9]" />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-48 animate-pulse rounded-3xl bg-white shadow-sm"
                />
              ))}
            </div>

            <div className="h-[420px] animate-pulse rounded-3xl bg-white shadow-sm" />
          </div>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#faf8f3]">
        <div className="mx-auto flex min-h-[78vh] max-w-4xl items-center justify-center px-4 py-16">
          <div className="w-full rounded-[32px] border border-[#eadfc9] bg-white p-8 text-center shadow-[0_20px_70px_rgba(60,45,20,0.08)] sm:p-14">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#f7f0df]">
              <ShoppingBag className="h-11 w-11 text-[#b9975b]" />
            </div>

            <div className="mt-7">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#b9975b]">
                PrimeCart
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-[#17130d] sm:text-4xl">
                Your cart is waiting
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#7d7364] sm:text-base">
                Looks like you haven't added anything yet. Explore our
                collection and find something you’ll love.
              </p>
            </div>

            <div className="mx-auto mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Truck,
                  title: "Fast Delivery",
                },
                {
                  icon: ShieldCheck,
                  title: "Secure Checkout",
                },
                {
                  icon: PackageCheck,
                  title: "Easy Returns",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[#eee5d5] bg-[#fcfaf6] p-4"
                  >
                    <Icon className="mx-auto h-5 w-5 text-[#b9975b]" />
                    <p className="mt-2 text-xs font-bold text-[#4b4337]">
                      {item.title}
                    </p>
                  </div>
                );
              })}
            </div>

            <Link
              href="/dashboard/products"
              className="mx-auto mt-9 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#17130d] px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#2a241c]"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] pb-16">
      {/* Top Header */}
      <div className="border-b border-[#eadfc9] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/products"
            className="group inline-flex items-center gap-2 text-sm font-bold text-[#51483b] transition hover:text-[#b9975b]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfc9] bg-white transition group-hover:border-[#b9975b]">
              <ArrowLeft className="h-4 w-4" />
            </span>

            <span className="hidden sm:inline">
              Continue Shopping
            </span>
          </Link>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#b9975b]" />
              <span className="text-lg font-black tracking-tight text-[#17130d]">
                Shopping Cart
              </span>
            </div>

            <p className="mt-0.5 text-xs text-[#8b806f]">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f7f0df] text-xs font-black text-[#977538]">
            {itemCount}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-7 flex items-center gap-2 text-xs font-medium text-[#8b806f]">
          <Link
            href="/dashboard"
            className="transition hover:text-[#b9975b]"
          >
            Home
          </Link>

          <span>/</span>

          <span className="font-bold text-[#4f473c]">
            Cart
          </span>
        </div>

        {/* Free Shipping Progress */}
        <section className="mb-7 overflow-hidden rounded-3xl border border-[#eadfc9] bg-white shadow-[0_10px_35px_rgba(60,45,20,0.05)]">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7f0df]">
                  {shipping === 0 ? (
                    <Check className="h-5 w-5 text-[#977538]" />
                  ) : (
                    <Truck className="h-5 w-5 text-[#b9975b]" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-black text-[#29231b]">
                    {shipping === 0
                      ? "Free shipping unlocked!"
                      : `Add ${formatPrice(
                          remainingForFreeShipping
                        )} more for FREE delivery`}
                  </p>

                  <p className="mt-1 text-xs text-[#8b806f]">
                    {shipping === 0
                      ? "Your order qualifies for free standard delivery."
                      : "Free delivery on orders above ₹999."}
                  </p>
                </div>
              </div>

              <span className="text-xs font-black text-[#977538]">
                {Math.round(shippingProgress)}%
              </span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#f1eadc]">
              <div
                className="h-full rounded-full bg-[#b9975b] transition-all duration-500"
                style={{
                  width: `${shippingProgress}%`,
                }}
              />
            </div>
          </div>
        </section>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_390px]">
          {/* LEFT */}
          <div className="space-y-5">
            {/* Cart Items */}
            <section className="overflow-hidden rounded-3xl border border-[#eadfc9] bg-white shadow-[0_10px_35px_rgba(60,45,20,0.05)]">
              <div className="flex items-center justify-between border-b border-[#eee5d5] px-5 py-5 sm:px-6">
                <div>
                  <h2 className="text-lg font-black text-[#17130d]">
                    Cart Items
                  </h2>

                  <p className="mt-1 text-xs text-[#8b806f]">
                    Review your selected products
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfc9] text-[#6f6557] transition hover:border-[#b9975b] hover:text-[#977538] sm:hidden"
                >
                  {expanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div
                className={`divide-y divide-[#eee5d5] ${
                  expanded ? "block" : "hidden sm:block"
                }`}
              >
                {cart.map((item) => {
                  const discount =
                    item.original_price &&
                    item.original_price > item.price
                      ? Math.round(
                          ((item.original_price - item.price) /
                            item.original_price) *
                            100
                        )
                      : 0;

                  const maxStock =
                    item.stock && item.stock > 0
                      ? item.stock
                      : 99;

                  return (
                    <article
                      key={item.id}
                      className={`group p-5 transition-all duration-300 sm:p-6 ${
                        removingId === item.id
                          ? "translate-x-3 opacity-0"
                          : "opacity-100"
                      }`}
                    >
                      <div className="flex gap-4 sm:gap-5">
                        {/* Image */}
                        <Link
                          href={`/dashboard/products/${item.id}`}
                          className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-[#eee5d5] bg-[#faf8f3] sm:h-36 sm:w-36"
                        >
                          <Image
                            src={getImageUrl(item.image_url)}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 112px, 144px"
                            className="object-contain p-3 transition duration-500 group-hover:scale-105"
                          />

                          {discount > 0 && (
                            <span className="absolute left-2 top-2 rounded-lg bg-[#17130d] px-2 py-1 text-[10px] font-black text-white">
                              -{discount}%
                            </span>
                          )}
                        </Link>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              {item.brand && (
                                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#b9975b]">
                                  {item.brand}
                                </p>
                              )}

                              <Link
                                href={`/dashboard/products/${item.id}`}
                                className="line-clamp-2 text-sm font-black leading-5 text-[#282219] transition hover:text-[#977538] sm:text-base"
                              >
                                {item.name}
                              </Link>

                              {item.category && (
                                <p className="mt-1 text-xs text-[#8b806f]">
                                  {item.category}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#9b9183] transition hover:bg-red-50 hover:text-red-500"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-lg font-black text-[#17130d]">
                              {formatPrice(item.price)}
                            </span>

                            {item.original_price &&
                              item.original_price > item.price && (
                                <span className="text-xs font-medium text-[#9b9183] line-through">
                                  {formatPrice(
                                    item.original_price
                                  )}
                                </span>
                              )}

                            {discount > 0 && (
                              <span className="text-xs font-black text-emerald-600">
                                {discount}% OFF
                              </span>
                            )}
                          </div>

                          {/* Stock */}
                          <div className="mt-2 flex items-center gap-2">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                maxStock <= 5
                                  ? "bg-orange-500"
                                  : "bg-emerald-500"
                              }`}
                            />

                            <span className="text-[11px] font-semibold text-[#777062]">
                              {maxStock <= 5
                                ? `Only ${maxStock} left`
                                : "In stock"}
                            </span>
                          </div>

                          {/* Bottom actions */}
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center rounded-xl border border-[#dfd4c1] bg-white">
                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(item.id)
                                }
                                className="flex h-9 w-9 items-center justify-center text-[#665c4f] transition hover:bg-[#faf8f3] hover:text-[#977538]"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>

                              <span className="flex h-9 min-w-9 items-center justify-center border-x border-[#dfd4c1] px-2 text-xs font-black text-[#29231b]">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  increaseQuantity(item.id)
                                }
                                disabled={
                                  item.quantity >= maxStock
                                }
                                className="flex h-9 w-9 items-center justify-center text-[#665c4f] transition hover:bg-[#faf8f3] hover:text-[#977538] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => moveToSaved(item)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#706657] transition hover:text-[#977538]"
                            >
                              <Heart className="h-3.5 w-3.5" />
                              Save for later
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Delivery Promise */}
            <section className="rounded-3xl border border-[#eadfc9] bg-white p-5 shadow-[0_10px_35px_rgba(60,45,20,0.05)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f0df]">
                  <Sparkles className="h-5 w-5 text-[#b9975b]" />
                </div>

                <div>
                  <h3 className="text-sm font-black text-[#29231b]">
                    PrimeCart Promise
                  </h3>

                  <p className="mt-1 text-xs text-[#8b806f]">
                    Everything you need for a smooth shopping experience.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: Truck,
                    title: "Fast Delivery",
                    text: "Quick & reliable shipping",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Secure Payment",
                    text: "Protected checkout",
                  },
                  {
                    icon: PackageCheck,
                    title: "Easy Returns",
                    text: "Hassle-free returns",
                  },
                ].map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="rounded-2xl border border-[#eee5d5] bg-[#fcfaf6] p-4"
                    >
                      <Icon className="h-5 w-5 text-[#b9975b]" />

                      <p className="mt-3 text-xs font-black text-[#3b342a]">
                        {feature.title}
                      </p>

                      <p className="mt-1 text-[11px] text-[#8b806f]">
                        {feature.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Saved For Later */}
            {saved.length > 0 && (
              <section className="overflow-hidden rounded-3xl border border-[#eadfc9] bg-white shadow-[0_10px_35px_rgba(60,45,20,0.05)]">
                <div className="border-b border-[#eee5d5] px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-[#b9975b]" />

                    <div>
                      <h2 className="text-lg font-black text-[#17130d]">
                        Saved for Later
                      </h2>

                      <p className="mt-1 text-xs text-[#8b806f]">
                        {saved.length} saved{" "}
                        {saved.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-[#eee5d5]">
                  {saved.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-5"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#eee5d5] bg-[#faf8f3]">
                        <Image
                          src={getImageUrl(item.image_url)}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-contain p-2"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/dashboard/products/${item.id}`}
                          className="line-clamp-1 text-sm font-bold text-[#342d24] hover:text-[#977538]"
                        >
                          {item.name}
                        </Link>

                        <p className="mt-1 text-sm font-black text-[#17130d]">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveToCart(item)}
                          className="rounded-xl bg-[#17130d] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#2a241c]"
                        >
                          Move to Cart
                        </button>

                        <button
                          type="button"
                          onClick={() => removeSaved(item.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfc9] text-[#8b806f] transition hover:border-red-200 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT SUMMARY */}
          <aside className="lg:sticky lg:top-5">
            <section className="overflow-hidden rounded-3xl border border-[#eadfc9] bg-white shadow-[0_15px_45px_rgba(60,45,20,0.08)]">
              <div className="border-b border-[#eee5d5] p-5 sm:p-6">
                <h2 className="text-lg font-black text-[#17130d]">
                  Order Summary
                </h2>

                <p className="mt-1 text-xs text-[#8b806f]">
                  Secure checkout with PrimeCart
                </p>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#706657]">
                    Subtotal ({itemCount} items)
                  </span>

                  <span className="font-bold text-[#342d24]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#706657]">
                    Delivery
                  </span>

                  {shipping === 0 ? (
                    <span className="font-black text-emerald-600">
                      FREE
                    </span>
                  ) : (
                    <span className="font-bold text-[#342d24]">
                      {formatPrice(shipping)}
                    </span>
                  )}
                </div>

                {couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#706657]">
                      Coupon ({appliedCoupon})
                    </span>

                    <span className="font-black text-emerald-600">
                      -{formatPrice(couponDiscount)}
                    </span>
                  </div>
                )}

                {productSavings > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#706657]">
                      Product savings
                    </span>

                    <span className="font-black text-emerald-600">
                      -{formatPrice(productSavings)}
                    </span>
                  </div>
                )}

                <div className="border-t border-dashed border-[#dfd4c1] pt-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm font-black text-[#29231b]">
                        Total
                      </p>

                      {totalSavings > 0 && (
                        <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                          You save {formatPrice(totalSavings)}
                        </p>
                      )}
                    </div>

                    <p className="text-2xl font-black tracking-tight text-[#17130d]">
                      {formatPrice(grandTotal)}
                    </p>
                  </div>
                </div>

                {/* Coupon */}
                <div className="overflow-hidden rounded-2xl border border-[#eadfc9]">
                  <button
                    type="button"
                    onClick={() => setCouponOpen(!couponOpen)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <span className="flex items-center gap-2 text-xs font-black text-[#40382d]">
                      <Tag className="h-4 w-4 text-[#b9975b]" />
                      Apply Coupon
                    </span>

                    {couponOpen ? (
                      <ChevronUp className="h-4 w-4 text-[#8b806f]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#8b806f]" />
                    )}
                  </button>

                  {couponOpen && (
                    <div className="border-t border-[#eee5d5] p-4">
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
                          <div>
                            <p className="text-xs font-black text-emerald-700">
                              {appliedCoupon}
                            </p>

                            <p className="mt-0.5 text-[10px] text-emerald-600">
                              Coupon applied
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={removeCoupon}
                            className="text-xs font-bold text-red-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <input
                              value={coupon}
                              onChange={(e) =>
                                setCoupon(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  applyCoupon();
                                }
                              }}
                              placeholder="Enter coupon code"
                              className="min-w-0 flex-1 rounded-xl border border-[#dfd4c1] bg-[#fcfaf6] px-3 py-2.5 text-xs font-semibold text-[#342d24] outline-none placeholder:text-[#a49a8b] focus:border-[#b9975b]"
                            />

                            <button
                              type="button"
                              onClick={applyCoupon}
                              className="rounded-xl bg-[#17130d] px-4 text-xs font-black text-white transition hover:bg-[#2a241c]"
                            >
                              Apply
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setCoupon("PRIME10")}
                              className="rounded-lg border border-[#eadfc9] bg-[#faf8f3] px-2.5 py-1.5 text-[10px] font-bold text-[#776b5b]"
                            >
                              PRIME10
                            </button>

                            <button
                              type="button"
                              onClick={() => setCoupon("WELCOME")}
                              className="rounded-lg border border-[#eadfc9] bg-[#faf8f3] px-2.5 py-1.5 text-[10px] font-bold text-[#776b5b]"
                            >
                              WELCOME
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Checkout */}
                <button
                  type="button"
                  onClick={proceedToCheckout}
                  className="group flex w-full items-center justify-between rounded-2xl bg-[#17130d] px-5 py-4 text-sm font-black text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#2a241c]"
                >
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Proceed to Checkout
                  </span>

                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>

                {/* Security */}
                <div className="flex items-center justify-center gap-2 pt-1 text-[10px] font-semibold text-[#8b806f]">
                  <Lock className="h-3.5 w-3.5 text-[#b9975b]" />
                  Secure & encrypted checkout
                </div>
              </div>
            </section>

            {/* Payment methods */}
            <section className="mt-4 rounded-3xl border border-[#eadfc9] bg-white p-5 shadow-[0_10px_35px_rgba(60,45,20,0.05)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#b9975b]" />

                <p className="text-xs font-black text-[#342d24]">
                  Safe & Secure Payments
                </p>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-[#8b806f]">
                Your payment information is protected using secure
                encryption.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {["UPI", "Cards", "Net Banking", "Wallets", "COD"].map(
                  (method) => (
                    <span
                      key={method}
                      className="rounded-lg border border-[#eee5d5] bg-[#fcfaf6] px-2.5 py-1.5 text-[10px] font-bold text-[#756a5b]"
                    >
                      {method}
                    </span>
                  )
                )}
              </div>
            </section>

            {/* Delivery */}
            <section className="mt-4 rounded-3xl border border-[#eadfc9] bg-white p-5 shadow-[0_10px_35px_rgba(60,45,20,0.05)]">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f0df]">
                  <Clock3 className="h-5 w-5 text-[#b9975b]" />
                </div>

                <div>
                  <p className="text-xs font-black text-[#342d24]">
                    Estimated Delivery
                  </p>

                  <p className="mt-1 text-sm font-black text-[#17130d]">
                    3–7 Business Days
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-[#8b806f]">
                    Delivery estimate may vary by location.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* Mobile sticky checkout */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#eadfc9] bg-white/95 p-3 shadow-[0_-10px_35px_rgba(60,45,20,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-[#8b806f]">
              Total
            </p>

            <p className="text-lg font-black text-[#17130d]">
              {formatPrice(grandTotal)}
            </p>
          </div>

          <button
            type="button"
            onClick={proceedToCheckout}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#17130d] px-4 py-3.5 text-xs font-black text-white"
          >
            Checkout
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
