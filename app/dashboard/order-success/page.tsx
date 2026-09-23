"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  Home,
  MapPin,
  Package,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";

type OrderItem = {
  id?: string | number;
  productId?: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  image_url?: string;
};

type Address = {
  id?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
};

type OrderRecord = {
  id: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  delivery: number;
  discount: number;
  address: Address;
  items: OrderItem[];
};

const ORDER_STORAGE_KEY = "primecart-orders";
const LAST_ORDER_KEY = "primecart-last-order";
const SUCCESS_SOUND_KEY = "primecart-order-success-sound";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getImageCandidates(value?: string) {
  if (!value) {
    return ["/placeholder-product.png"];
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return [value];
  }

  if (value.startsWith("/")) {
    return [value];
  }

  return [`/${value}`, `/products/${value}`];
}

function ProductImage({
  src,
  alt,
}: {
  src?: string;
  alt: string;
}) {
  const candidates = useMemo(() => getImageCandidates(src), [src]);
  const [index, setIndex] = useState(0);

  const current = candidates[index] || candidates[0];

  const handleError = () => {
    if (index < candidates.length - 1) {
      setIndex((previous) => previous + 1);
    }
  };

  if (
    current.startsWith("http://") ||
    current.startsWith("https://") ||
    current.startsWith("data:")
  ) {
    return (
      <img
        src={current}
        alt={alt}
        onError={handleError}
        className="h-full w-full object-contain"
      />
    );
  }

  return (
    <Image
      src={current}
      alt={alt}
      fill
      sizes="120px"
      className="object-contain"
      onError={handleError}
    />
  );
}

function formatDate(value: string) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getEstimatedDelivery(createdAt: string) {
  const date = new Date(createdAt || Date.now());
  date.setDate(date.getDate() + 5);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showSoundPrompt, setShowSoundPrompt] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get("order");

      const storedOrders = JSON.parse(
        localStorage.getItem(ORDER_STORAGE_KEY) || "[]"
      );

      let foundOrder: OrderRecord | null = null;

      if (orderId) {
        foundOrder =
          storedOrders.find(
            (item: OrderRecord) => String(item.id) === String(orderId)
          ) || null;
      }

      if (!foundOrder) {
        const lastOrder = localStorage.getItem(LAST_ORDER_KEY);

        if (lastOrder) {
          try {
            foundOrder = JSON.parse(lastOrder);
          } catch {
            foundOrder = null;
          }
        }
      }

      setOrder(foundOrder);

      /*
       * Play order-success sound only once.
       *
       * Checkout page sets:
       * localStorage.setItem("primecart-order-success-sound", "true")
       *
       * before navigating here.
       */
      const shouldPlaySound =
        localStorage.getItem(SUCCESS_SOUND_KEY) === "true";

      if (shouldPlaySound) {
        localStorage.removeItem(SUCCESS_SOUND_KEY);
        setShowSoundPrompt(true);

        const timer = window.setTimeout(() => {
          playSuccessSound();
          setShowSoundPrompt(false);
        }, 350);

        return () => window.clearTimeout(timer);
      }
    } catch (error) {
      console.error("Failed to load order:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const playSuccessSound = () => {
    try {
      /*
       * Web Audio API creates a small premium success chime.
       * No external audio file is required.
       */
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) return;

      const context = new AudioContextClass();

      const now = context.currentTime;

      const playTone = (
        frequency: number,
        start: number,
        duration: number,
        volume: number
      ) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(
          volume,
          start + 0.025
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          start + duration
        );

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(start);
        oscillator.stop(start + duration + 0.03);
      };

      playTone(523.25, now, 0.18, 0.045);
      playTone(659.25, now + 0.12, 0.18, 0.045);
      playTone(783.99, now + 0.24, 0.28, 0.05);

      window.setTimeout(() => {
        context.close().catch(() => {});
      }, 900);
    } catch (error) {
      console.log("Success sound unavailable:", error);
    }
  };

  const copyOrderId = async () => {
    if (!order?.id) return;

    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbf8f2]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mx-auto h-24 w-24 rounded-full bg-[#eee5d5]" />
            <div className="mx-auto mt-6 h-8 w-72 rounded-lg bg-[#eee5d5]" />
            <div className="mx-auto mt-3 h-4 w-96 max-w-full rounded bg-[#f0e8da]" />

            <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="h-96 rounded-3xl bg-white" />
              <div className="h-80 rounded-3xl bg-white" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#fbf8f2]">
        <header className="border-b border-[#eadfcb] bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b9975b] text-white shadow-sm">
                <ShoppingBag size={20} />
              </div>

              <div>
                <p className="text-lg font-black tracking-tight text-[#40372d]">
                  PrimeCart
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a08c6d]">
                  Premium Shopping
                </p>
              </div>
            </Link>
          </div>
        </header>

        <section className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4">
          <div className="w-full max-w-xl rounded-[30px] border border-[#eadfcb] bg-white p-8 text-center shadow-[0_25px_80px_rgba(75,59,35,0.10)] sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f7ead4] text-[#a27a3e]">
              <Package size={34} />
            </div>

            <h1 className="mt-7 text-2xl font-black text-[#40372d]">
              Order details not found
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#8c806f]">
              We could not find the order details on this device. You can
              continue shopping or check your orders.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard/orders"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#b9975b] px-6 text-sm font-bold text-white transition hover:bg-[#a9844d]"
              >
                View Orders
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#dfd1bb] bg-white px-6 text-sm font-bold text-[#51483c] transition hover:bg-[#faf6ee]"
              >
                <Home size={17} />
                Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const itemCount = order.items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const estimatedDelivery = getEstimatedDelivery(order.createdAt);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbf8f2] text-[#40372d]">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full bg-[#f4e5c8]/50 blur-3xl" />
        <div className="absolute bottom-[-220px] right-[-180px] h-[480px] w-[480px] rounded-full bg-[#eadbbf]/40 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#eadfcb] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#e6d7bc] bg-[#fffaf1]">
              <Image
                src="/logo.png"
                alt="PrimeCart"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="hidden sm:block">
              <p className="text-lg font-black tracking-tight text-[#40372d]">
                PrimeCart
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a08c6d]">
                Premium Shopping
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-[#e5d9c6] bg-[#fffdf9] px-3 py-2 text-xs font-bold text-[#756957]">
            <CheckCircle2 size={15} className="text-[#b9975b]" />
            Order Confirmed
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Success Hero */}
        <section className="relative overflow-hidden rounded-[32px] border border-[#e8dcc8] bg-white px-5 py-10 text-center shadow-[0_25px_80px_rgba(75,59,35,0.08)] sm:px-10 sm:py-14">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute left-8 top-8 hidden h-16 w-16 rounded-full border border-[#ead9ba] sm:block" />
          <div className="pointer-events-none absolute right-10 top-10 hidden h-10 w-10 rounded-full bg-[#f8edda] sm:block" />
          <div className="pointer-events-none absolute bottom-8 left-16 hidden h-8 w-8 rounded-full bg-[#f3e6cf] sm:block" />

          {/* Success icon */}
          <div className="relative mx-auto h-28 w-28">
            <div className="absolute inset-0 animate-ping rounded-full bg-[#dcc596]/25" />

            <div className="relative flex h-28 w-28 animate-success-pop items-center justify-center rounded-full bg-gradient-to-br from-[#d8bb80] via-[#b9975b] to-[#98713c] shadow-[0_18px_45px_rgba(185,151,91,0.35)]">
              <div className="flex h-[82px] w-[82px] items-center justify-center rounded-full border border-white/30 bg-white/10">
                <Check
                  size={44}
                  strokeWidth={3}
                  className="text-white"
                />
              </div>
            </div>

            <Sparkles
              size={20}
              className="absolute -right-1 top-3 animate-float text-[#b9975b]"
            />
            <Sparkles
              size={16}
              className="absolute -left-2 bottom-5 animate-float-delayed text-[#d2b574]"
            />
          </div>

          <div className="mt-7">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#b08c53]">
              Thank you for shopping with us
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#3f372e] sm:text-4xl">
              Order Placed Successfully!
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#8c806f] sm:text-base">
              Your order has been confirmed. We&apos;ve saved your order
              details and will keep you updated as it moves towards delivery.
            </p>
          </div>

          {/* Order ID */}
          <div className="mx-auto mt-7 flex w-fit max-w-full flex-col items-center gap-2 rounded-2xl border border-[#eadfcb] bg-[#fcfaf6] px-4 py-3 sm:flex-row">
            <span className="text-xs font-semibold text-[#988a77]">
              Order ID
            </span>

            <span className="max-w-[230px] truncate font-mono text-sm font-black text-[#51483c]">
              {order.id}
            </span>

            <button
              type="button"
              onClick={copyOrderId}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-[#a07b42] transition hover:bg-[#f4ead8]"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>
          </div>

          <p className="mt-4 text-xs text-[#a19584]">
            Placed on {formatDate(order.createdAt)}
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard/orders"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#b9975b] px-7 text-sm font-bold text-white shadow-[0_10px_25px_rgba(185,151,91,0.22)] transition hover:-translate-y-0.5 hover:bg-[#a9844d]"
            >
              <Package size={17} />
              View My Orders
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>

            <Link
              href="/dashboard/products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#dfd1bb] bg-white px-7 text-sm font-bold text-[#51483c] transition hover:-translate-y-0.5 hover:bg-[#faf6ee]"
            >
              <ShoppingBag size={17} />
              Continue Shopping
            </Link>
          </div>

          {showSoundPrompt && (
            <div className="mt-5 text-xs font-semibold text-[#a07b42]">
              ♪ Order confirmation received
            </div>
          )}
        </section>

        {/* Main content */}
        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_370px]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Delivery timeline */}
            <section className="rounded-[28px] border border-[#eadfcb] bg-white p-5 shadow-[0_15px_50px_rgba(75,59,35,0.05)] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b08c53]">
                    Order journey
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[#40372d]">
                    Delivery Status
                  </h2>
                </div>

                <div className="rounded-xl bg-[#f8efdf] p-2.5 text-[#a57d43]">
                  <Truck size={19} />
                </div>
              </div>

              <div className="mt-7">
                <div className="relative grid grid-cols-3">
                  <div className="absolute left-[16%] right-[16%] top-5 h-0.5 bg-[#eadfcb]" />

                  <div className="absolute left-[16%] top-5 h-0.5 w-[34%] bg-[#b9975b]" />

                  {[
                    {
                      title: "Order Placed",
                      subtitle: "Confirmed",
                      icon: Check,
                      active: true,
                    },
                    {
                      title: "Processing",
                      subtitle: "Preparing",
                      icon: Package,
                      active: false,
                    },
                    {
                      title: "Delivered",
                      subtitle: estimatedDelivery,
                      icon: Home,
                      active: false,
                    },
                  ].map((step, index) => {
                    const Icon = step.icon;

                    return (
                      <div
                        key={step.title}
                        className="relative z-10 flex flex-col items-center text-center"
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white ${
                            step.active
                              ? "bg-[#b9975b] text-white shadow-[0_8px_20px_rgba(185,151,91,0.25)]"
                              : "bg-[#f3ede2] text-[#a79a87]"
                          }`}
                        >
                          <Icon size={17} />
                        </div>

                        <p
                          className={`mt-3 text-xs font-black ${
                            step.active
                              ? "text-[#51483c]"
                              : "text-[#918575]"
                          }`}
                        >
                          {step.title}
                        </p>

                        <p className="mt-1 max-w-[95px] text-[10px] font-semibold leading-4 text-[#a49a8c]">
                          {step.subtitle}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Delivery address */}
            <section className="rounded-[28px] border border-[#eadfcb] bg-white p-5 shadow-[0_15px_50px_rgba(75,59,35,0.05)] sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b08c53]">
                    Delivery
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[#40372d]">
                    Shipping Address
                  </h2>
                </div>

                <div className="rounded-xl bg-[#f8efdf] p-2.5 text-[#a57d43]">
                  <MapPin size={19} />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#eadfcb] bg-[#fcfaf6] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#b08c53] shadow-sm">
                    <UserRound size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="font-black text-[#51483c]">
                      {order.address.fullName}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#897d6d]">
                      {order.address.phone}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-[#756a5c]">
                      {order.address.addressLine1}
                      {order.address.addressLine2
                        ? `, ${order.address.addressLine2}`
                        : ""}
                      <br />
                      {order.address.city}, {order.address.state} -{" "}
                      {order.address.pincode}
                    </p>

                    {order.address.landmark && (
                      <p className="mt-2 text-xs font-semibold text-[#968a79]">
                        Landmark: {order.address.landmark}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Items */}
            <section className="rounded-[28px] border border-[#eadfcb] bg-white p-5 shadow-[0_15px_50px_rgba(75,59,35,0.05)] sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b08c53]">
                    Your purchase
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#40372d]">
                    Ordered Items
                  </h2>
                </div>

                <span className="rounded-full bg-[#f7eddb] px-3 py-1.5 text-xs font-black text-[#a17a43]">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="mt-5 divide-y divide-[#eee5d7]">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.productId || item.id || item.name}-${index}`}
                    className="flex gap-4 py-5 first:pt-1 last:pb-1"
                  >
                    <div className="relative h-[90px] w-[90px] shrink-0 overflow-hidden rounded-2xl border border-[#eadfcb] bg-[#fcfaf6]">
                      <ProductImage
                        src={item.image_url || item.image}
                        alt={item.name}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-black leading-5 text-[#51483c]">
                        {item.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-[#938777]">
                        <span>Qty: {item.quantity}</span>
                        <span>
                          {formatPrice(item.price)} each
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-black text-[#a17a43]">
                        {formatPrice(
                          Number(item.price || 0) *
                            Number(item.quantity || 0)
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Help */}
            <section className="rounded-[28px] border border-[#eadfcb] bg-gradient-to-br from-[#fffdf9] to-[#f8f0e1] p-5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black text-[#51483c]">
                    Need help with your order?
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#8f8271]">
                    You can track your order anytime from the Orders section.
                  </p>
                </div>

                <Link
                  href="/dashboard/orders"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dccba9] bg-white px-4 text-xs font-black text-[#9b753e] transition hover:bg-[#fffaf1]"
                >
                  Track Order
                  <ArrowRight size={14} />
                </Link>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside className="lg:sticky lg:top-[92px] lg:self-start">
            <section className="overflow-hidden rounded-[28px] border border-[#eadfcb] bg-white shadow-[0_20px_60px_rgba(75,59,35,0.07)]">
              <div className="border-b border-[#eee5d7] bg-[#fcfaf6] px-5 py-5 sm:px-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b08c53]">
                  Payment summary
                </p>

                <h2 className="mt-1 text-xl font-black text-[#40372d]">
                  Order Details
                </h2>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#8b7e6c]">
                    Subtotal
                  </span>
                  <span className="font-bold text-[#51483c]">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>

                {order.discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#8b7e6c]">
                      Discount
                    </span>
                    <span className="font-bold text-[#5d8a5d]">
                      -{formatPrice(order.discount)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#8b7e6c]">
                    Delivery
                  </span>

                  {order.delivery === 0 ? (
                    <span className="font-black text-[#5d8a5d]">
                      FREE
                    </span>
                  ) : (
                    <span className="font-bold text-[#51483c]">
                      {formatPrice(order.delivery)}
                    </span>
                  )}
                </div>

                <div className="border-t border-dashed border-[#e5dac8] pt-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#968978]">
                        Total Paid
                      </p>

                      <p className="mt-1 text-2xl font-black tracking-tight text-[#3f372e]">
                        {formatPrice(order.total)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#f7eddb] px-3 py-2 text-right">
                      <p className="text-[9px] font-black uppercase tracking-wider text-[#a07b42]">
                        Payment
                      </p>

                      <p className="mt-0.5 text-xs font-black text-[#665844]">
                        {order.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivery estimate */}
                <div className="mt-2 rounded-2xl border border-[#e8dcc7] bg-[#fffaf1] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#ae874c] shadow-sm">
                      <Clock3 size={17} />
                    </div>

                    <div>
                      <p className="text-xs font-black text-[#5c5041]">
                        Estimated delivery
                      </p>

                      <p className="mt-1 text-sm font-black text-[#a17a43]">
                        By {estimatedDelivery}
                      </p>

                      <p className="mt-1 text-[11px] leading-4 text-[#938777]">
                        Delivery estimate may change based on location and
                        availability.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trust */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-xl border border-[#eee5d7] bg-[#fcfaf6] p-3">
                    <CheckCircle2
                      size={17}
                      className="text-[#a17a43]"
                    />
                    <p className="mt-2 text-[10px] font-bold leading-4 text-[#766b5c]">
                      Order confirmed
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#eee5d7] bg-[#fcfaf6] p-3">
                    <Truck size={17} className="text-[#a17a43]" />
                    <p className="mt-2 text-[10px] font-bold leading-4 text-[#766b5c]">
                      Delivery tracking
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard/orders"
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#b9975b] text-sm font-black text-white shadow-[0_10px_25px_rgba(185,151,91,0.20)] transition hover:bg-[#a9844d]"
                >
                  Go to My Orders
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-0.5"
                  />
                </Link>

                <Link
                  href="/dashboard/products"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#dfd1bb] bg-white text-xs font-black text-[#65594a] transition hover:bg-[#faf6ee]"
                >
                  <ShoppingBag size={15} />
                  Continue Shopping
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <style jsx>{`
        @keyframes success-pop {
          0% {
            opacity: 0;
            transform: scale(0.65);
          }
          65% {
            opacity: 1;
            transform: scale(1.08);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .animate-success-pop {
          animation: success-pop 0.7s cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .animate-float {
          animation: float 2.5s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out 0.5s infinite;
        }
      `}</style>
    </main>
  );
}
