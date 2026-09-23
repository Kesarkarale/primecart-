"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Truck,
  ShoppingBag,
  ArrowRight,
  Home,
  Download,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  CalendarDays,
  CreditCard,
  MapPin,
  Loader2,
} from "lucide-react";

type OrderItem = {
  id?: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  image?: string;
  brand?: string;
};

type OrderAddress = {
  fullName?: string;
  name?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  postalCode?: string;
};

type OrderRecord = {
  id: string;
  createdAt?: string;
  status?: string;
  paymentMethod?: string;
  total?: number;
  subtotal?: number;
  delivery?: number;
  discount?: number;
  address?: OrderAddress;
  items?: OrderItem[];
};

const ORDER_KEY = "primecart-orders";
const LAST_ORDER_KEY = "primecart-last-order";

function formatPrice(value: number) {
  return `₹${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
}

function formatDate(value?: string) {
  if (!value) return "Today";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Today";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getImageUrl(value?: string) {
  if (!value) return "/placeholder-product.png";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  ) {
    return value;
  }

  return `/products/${value}`;
}

function getPaymentLabel(method?: string) {
  switch (method) {
    case "upi":
      return "UPI";
    case "card":
      return "Credit / Debit Card";
    case "netbanking":
      return "Net Banking";
    case "wallet":
      return "Wallet";
    case "emi":
      return "EMI";
    case "cod":
      return "Cash on Delivery";
    default:
      return method || "Payment";
  }
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();

  const orderIdFromUrl = searchParams.get("order");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [soundAvailable, setSoundAvailable] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem(ORDER_KEY);

      let foundOrder: OrderRecord | null = null;

      if (storedOrders) {
        const orders: OrderRecord[] = JSON.parse(storedOrders);

        if (orderIdFromUrl) {
          foundOrder =
            orders.find((item) => item.id === orderIdFromUrl) || null;
        }
      }

      if (!foundOrder) {
        const lastOrder = localStorage.getItem(LAST_ORDER_KEY);

        if (lastOrder) {
          const parsed = JSON.parse(lastOrder);

          if (!orderIdFromUrl || parsed?.id === orderIdFromUrl) {
            foundOrder = parsed;
          }
        }
      }

      setOrder(foundOrder);
    } catch (error) {
      console.error("Failed to load order:", error);
    } finally {
      setLoading(false);
    }
  }, [orderIdFromUrl]);

  /*
   * ORDER SUCCESS SOUND
   *
   * MP3 location:
   * public/sounds/order-success.mp3
   *
   * Browser may block autoplay.
   * We try to play automatically first.
   * If blocked, the user can click "Play Confirmation Sound".
   */
  useEffect(() => {
    if (loading || !order) return;

    const timer = window.setTimeout(() => {
      const audio = audioRef.current;

      if (!audio) return;

      audio.currentTime = 0;
      audio.volume = 0.85;

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setSoundPlaying(true);
          })
          .catch((error) => {
            console.warn("Autoplay was blocked by the browser:", error);
            setSoundPlaying(false);
          });
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [loading, order]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, []);

  const handleAudioEnded = () => {
    setSoundPlaying(false);
  };

  const handleAudioPlay = () => {
    setSoundPlaying(true);
  };

  const handleAudioPause = () => {
    setSoundPlaying(false);
  };

  const handleAudioError = () => {
    setSoundAvailable(false);
    setSoundPlaying(false);
    console.error(
      "Order success sound could not be loaded. Check public/sounds/order-success.mp3"
    );
  };

  const playSoundManually = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    try {
      audio.currentTime = 0;
      audio.volume = 0.85;

      await audio.play();

      setSoundPlaying(true);
    } catch (error) {
      console.error("Could not play confirmation sound:", error);
    }
  };

  const toggleSound = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      await playSoundManually();
    } else {
      audio.pause();
      setSoundPlaying(false);
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
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const subtotal = Number(order?.subtotal || 0);
  const delivery = Number(order?.delivery || 0);
  const discount = Number(order?.discount || 0);
  const total = Number(order?.total || 0);

  const itemCount = useMemo(() => {
    if (!order?.items) return 0;

    return order.items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  }, [order]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbf8f2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#eadfcb] border-t-[#b9975b] animate-spin" />
          <p className="text-sm font-semibold text-[#796e5d]">
            Loading your order...
          </p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#fbf8f2] text-[#4a4034]">
        <header className="h-[72px] bg-white border-b border-[#eadfcb] flex items-center px-5 md:px-10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#b9975b] flex items-center justify-center text-white font-black">
              P
            </div>

            <div>
              <div className="font-black text-lg tracking-tight">
                PrimeCart
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#9b907f]">
                Smart Shopping
              </div>
            </div>
          </Link>
        </header>

        <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-5">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#eadfcb] shadow-[0_20px_70px_rgba(74,64,52,0.10)] p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#f5ead6] flex items-center justify-center">
              <Package className="w-8 h-8 text-[#b9975b]" />
            </div>

            <h1 className="mt-5 text-2xl font-black">
              Order not found
            </h1>

            <p className="mt-2 text-sm text-[#796e5d] leading-6">
              We couldn't find this order in your current browser session.
            </p>

            <Link
              href="/dashboard"
              className="mt-6 h-12 px-6 rounded-xl bg-[#b9975b] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#96723b] transition"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const address = order.address || {};
  const items = order.items || [];

  return (
    <main className="min-h-screen bg-[#fbf8f2] text-[#4a4034]">
      {/* Confirmation audio */}
      <audio
        ref={audioRef}
        src="/sounds/order-success.mp3"
        preload="auto"
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
      />

      {/* Decorative success particles */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          <span className="confetti c1" />
          <span className="confetti c2" />
          <span className="confetti c3" />
          <span className="confetti c4" />
          <span className="confetti c5" />
          <span className="confetti c6" />
          <span className="confetti c7" />
          <span className="confetti c8" />
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 h-[72px] bg-white/95 backdrop-blur-xl border-b border-[#eadfcb]">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#b9975b] flex items-center justify-center shadow-[0_8px_25px_rgba(185,151,91,0.25)]">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>

            <div>
              <div className="font-black text-lg tracking-tight">
                PrimeCart
              </div>

              <div className="hidden sm:block text-[10px] uppercase tracking-[0.22em] text-[#9b907f]">
                Smart Shopping
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {soundAvailable && (
              <button
                onClick={toggleSound}
                className={`h-10 px-3 sm:px-4 rounded-xl border flex items-center gap-2 text-sm font-bold transition ${
                  soundPlaying
                    ? "bg-[#f5ead6] border-[#dcc596] text-[#96723b]"
                    : "bg-white border-[#eadfcb] text-[#796e5d] hover:border-[#b9975b]"
                }`}
                title={
                  soundPlaying
                    ? "Stop confirmation sound"
                    : "Play confirmation sound"
                }
              >
                {soundPlaying ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}

                <span className="hidden sm:inline">
                  {soundPlaying ? "Sound On" : "Play Sound"}
                </span>
              </button>
            )}

            <Link
              href="/dashboard"
              className="h-10 px-3 sm:px-4 rounded-xl bg-[#f8f3e9] border border-[#eadfcb] flex items-center gap-2 text-sm font-bold text-[#5e5345] hover:bg-[#f5ead6] transition"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Success Hero */}
        <section className="relative overflow-hidden bg-white rounded-[32px] border border-[#eadfcb] shadow-[0_20px_70px_rgba(74,64,52,0.08)]">
          <div className="absolute -top-28 -right-28 w-72 h-72 rounded-full bg-[#f5ead6] blur-3xl opacity-70" />
          <div className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full bg-[#f8f3e9] blur-3xl" />

          <div className="relative px-5 py-10 sm:px-8 md:px-12 md:py-14 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-[#f5ead6] border border-[#dcc596] flex items-center justify-center success-pop">
              <div className="w-16 h-16 rounded-full bg-[#b9975b] flex items-center justify-center shadow-[0_12px_35px_rgba(185,151,91,0.30)]">
                <CheckCircle2 className="w-9 h-9 text-white" strokeWidth={2.5} />
              </div>
            </div>

            <div className="mt-7 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f8f3e9] border border-[#eadfcb] text-xs font-bold text-[#96723b]">
              <Sparkles className="w-3.5 h-3.5" />
              Order Confirmed
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#40372e]">
              Thank you for your order!
            </h1>

            <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-7 text-[#796e5d]">
              Your order has been successfully placed. We’re getting
              everything ready for you.
            </p>

            <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#fbf8f2] border border-[#eadfcb]">
              <span className="text-xs font-semibold text-[#9b907f]">
                Order ID
              </span>

              <span className="font-black text-sm text-[#4a4034] break-all">
                {order.id}
              </span>

              <button
                onClick={copyOrderId}
                className="w-8 h-8 rounded-lg bg-white border border-[#eadfcb] flex items-center justify-center hover:border-[#b9975b] transition"
                title="Copy order ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-[#796e5d]" />
                )}
              </button>
            </div>

            {/* Sound CTA */}
            {soundAvailable && !soundPlaying && (
              <button
                onClick={playSoundManually}
                className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#b9975b] text-white text-sm font-bold shadow-[0_10px_25px_rgba(185,151,91,0.22)] hover:bg-[#96723b] transition"
              >
                <Volume2 className="w-4 h-4" />
                Play Order Confirmation Sound
              </button>
            )}
          </div>
        </section>

        {/* Status */}
        <section className="mt-6 bg-white rounded-3xl border border-[#eadfcb] p-5 sm:p-7 shadow-[0_12px_40px_rgba(74,64,52,0.05)]">
          <div className="flex items-center justify-between mb-7">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] font-bold text-[#b9975b]">
                Order progress
              </p>
              <h2 className="mt-1 text-xl font-black">
                Your order is on its way
              </h2>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f8f3e9] text-xs font-bold text-[#96723b]">
              <Truck className="w-4 h-4" />
              Processing
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              {
                icon: CheckCircle2,
                title: "Order Placed",
                text: "Confirmed",
                active: true,
              },
              {
                icon: Package,
                title: "Processing",
                text: "Preparing",
                active: true,
              },
              {
                icon: Truck,
                title: "Shipped",
                text: "Coming soon",
                active: false,
              },
              {
                icon: ShoppingBag,
                title: "Delivered",
                text: "Coming soon",
                active: false,
              },
            ].map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="relative">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        step.active
                          ? "bg-[#b9975b] text-white"
                          : "bg-[#f8f3e9] text-[#9b907f]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="font-bold text-sm">{step.title}</p>
                      <p className="text-xs text-[#9b907f] mt-0.5">
                        {step.text}
                      </p>
                    </div>
                  </div>

                  {index < 3 && (
                    <div className="hidden sm:block absolute top-[22px] left-[58px] right-[-18px] h-px bg-[#eadfcb]" />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Details */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Left */}
          <div className="space-y-6">
            {/* Order Items */}
            <section className="bg-white rounded-3xl border border-[#eadfcb] shadow-[0_12px_40px_rgba(74,64,52,0.05)] overflow-hidden">
              <div className="px-5 sm:px-7 py-5 border-b border-[#f0e8da] flex items-center justify-between">
                <div>
                  <h2 className="font-black text-lg">Order Items</h2>
                  <p className="text-xs text-[#9b907f] mt-1">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </p>
                </div>

                <ShoppingBag className="w-5 h-5 text-[#b9975b]" />
              </div>

              <div className="divide-y divide-[#f0e8da]">
                {items.map((item, index) => (
                  <div
                    key={`${item.id || item.productId || item.name}-${index}`}
                    className="p-5 sm:px-7 flex gap-4"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#fbf8f2] border border-[#eadfcb] flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={getImageUrl(item.image_url || item.image)}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                        onError={(event) => {
                          event.currentTarget.src =
                            "/placeholder-product.png";
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      {item.brand && (
                        <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#b9975b]">
                          {item.brand}
                        </p>
                      )}

                      <h3 className="mt-1 font-bold text-sm sm:text-base leading-6 line-clamp-2">
                        {item.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#796e5d]">
                        <span className="px-2 py-1 rounded-lg bg-[#f8f3e9]">
                          Qty: {item.quantity}
                        </span>

                        <span>×</span>

                        <span className="font-semibold">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-black text-sm sm:text-base">
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

            {/* Delivery */}
            <section className="bg-white rounded-3xl border border-[#eadfcb] shadow-[0_12px_40px_rgba(74,64,52,0.05)] p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#f5ead6] flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#96723b]" />
                </div>

                <div>
                  <h2 className="font-black text-lg">Delivery Address</h2>
                  <p className="text-xs text-[#9b907f] mt-1">
                    Your order will be delivered here
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-[#fbf8f2] border border-[#eadfcb] p-4">
                <p className="font-bold text-sm">
                  {address.fullName || address.name || "Customer"}
                </p>

                {address.phone && (
                  <p className="mt-1 text-sm text-[#796e5d]">
                    {address.phone}
                  </p>
                )}

                <p className="mt-2 text-sm text-[#796e5d] leading-6">
                  {address.addressLine1 || address.address || ""}
                  {address.addressLine2
                    ? `, ${address.addressLine2}`
                    : ""}
                  {(address.city || address.state) && (
                    <>
                      <br />
                      {[address.city, address.state]
                        .filter(Boolean)
                        .join(", ")}
                    </>
                  )}
                  {(address.pincode || address.postalCode) && (
                    <>
                      {" - "}
                      {address.pincode || address.postalCode}
                    </>
                  )}
                </p>
              </div>
            </section>

            {/* Payment */}
            <section className="bg-white rounded-3xl border border-[#eadfcb] shadow-[0_12px_40px_rgba(74,64,52,0.05)] p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#f5ead6] flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#96723b]" />
                </div>

                <div>
                  <h2 className="font-black text-lg">
                    Payment Information
                  </h2>
                  <p className="text-xs text-[#9b907f] mt-1">
                    Selected payment method
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#fbf8f2] border border-[#eadfcb] p-4">
                <div>
                  <p className="text-xs text-[#9b907f]">Payment Method</p>
                  <p className="mt-1 font-bold text-sm">
                    {getPaymentLabel(order.paymentMethod)}
                  </p>
                </div>

                <ShieldCheck className="w-5 h-5 text-[#b9975b]" />
              </div>
            </section>
          </div>

          {/* Right summary */}
          <aside>
            <div className="lg:sticky lg:top-[92px] bg-white rounded-3xl border border-[#eadfcb] shadow-[0_15px_50px_rgba(74,64,52,0.08)] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#f0e8da]">
                <h2 className="font-black text-lg">Order Summary</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#796e5d]">Subtotal</span>
                    <span className="font-semibold">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#796e5d]">Delivery</span>
                    <span
                      className={`font-semibold ${
                        delivery === 0 ? "text-green-600" : ""
                      }`}
                    >
                      {delivery === 0 ? "FREE" : formatPrice(delivery)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#796e5d]">
                        Discount
                      </span>
                      <span className="font-semibold text-green-600">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="my-5 border-t border-dashed border-[#eadfcb]" />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-[#9b907f]">
                      Total Amount
                    </p>
                    <p className="mt-1 text-2xl font-black text-[#40372e]">
                      {formatPrice(total)}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-green-600">
                    Paid / Confirmed
                  </span>
                </div>

                <div className="mt-6 rounded-2xl bg-[#f8f3e9] border border-[#eadfcb] p-4">
                  <div className="flex gap-3">
                    <CalendarDays className="w-5 h-5 text-[#b9975b] shrink-0" />

                    <div>
                      <p className="text-xs font-bold">
                        Order placed
                      </p>

                      <p className="mt-1 text-xs text-[#796e5d]">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#fbf8f2] border border-[#eadfcb] p-4">
                  <div className="flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#b9975b] shrink-0" />

                    <div>
                      <p className="text-xs font-bold">
                        PrimeCart Order Protection
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#796e5d]">
                        Keep your order ID handy for future order
                        tracking.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.print()}
                    className="h-11 rounded-xl border border-[#eadfcb] bg-white text-[#5e5345] text-sm font-bold flex items-center justify-center gap-2 hover:border-[#b9975b] transition"
                  >
                    <Download className="w-4 h-4" />
                    Print
                  </button>

                  <Link
                    href="/dashboard/orders"
                    className="h-11 rounded-xl bg-[#b9975b] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#96723b] transition"
                  >
                    My Orders
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <Link
                  href="/dashboard"
                  className="mt-3 h-11 rounded-xl bg-[#f8f3e9] border border-[#eadfcb] text-[#5e5345] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#f5ead6] transition"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom reassurance */}
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#eadfcb] p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f5ead6] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#96723b]" />
            </div>

            <div>
              <p className="font-bold text-sm">Secure Checkout</p>
              <p className="text-xs text-[#9b907f] mt-1">
                Order details saved safely
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#eadfcb] p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f5ead6] flex items-center justify-center">
              <Truck className="w-5 h-5 text-[#96723b]" />
            </div>

            <div>
              <p className="font-bold text-sm">Delivery Updates</p>
              <p className="text-xs text-[#9b907f] mt-1">
                Track progress from My Orders
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#eadfcb] p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f5ead6] flex items-center justify-center">
              <Package className="w-5 h-5 text-[#96723b]" />
            </div>

            <div>
              <p className="font-bold text-sm">Order Confirmed</p>
              <p className="text-xs text-[#9b907f] mt-1">
                Keep your order ID for reference
              </p>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .success-pop {
          animation: successPop 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)
            both;
        }

        @keyframes successPop {
          0% {
            opacity: 0;
            transform: scale(0.55);
          }

          70% {
            opacity: 1;
            transform: scale(1.08);
          }

          100% {
            transform: scale(1);
          }
        }

        .confetti {
          position: absolute;
          top: -20px;
          width: 8px;
          height: 14px;
          border-radius: 2px;
          background: #b9975b;
          animation: fall 3.8s linear forwards;
        }

        .c1 {
          left: 8%;
          animation-delay: 0.1s;
        }

        .c2 {
          left: 18%;
          width: 6px;
          height: 10px;
          animation-delay: 0.5s;
        }

        .c3 {
          left: 31%;
          animation-delay: 0.2s;
        }

        .c4 {
          left: 48%;
          width: 6px;
          height: 11px;
          animation-delay: 0.8s;
        }

        .c5 {
          left: 64%;
          animation-delay: 0.35s;
        }

        .c6 {
          left: 76%;
          width: 6px;
          height: 10px;
          animation-delay: 0.7s;
        }

        .c7 {
          left: 88%;
          animation-delay: 0.25s;
        }

        .c8 {
          left: 94%;
          width: 6px;
          height: 11px;
          animation-delay: 0.9s;
        }

        @keyframes fall {
          0% {
            transform: translateY(-30px) rotate(0deg);
            opacity: 0;
          }

          10% {
            opacity: 1;
          }

          100% {
            transform: translateY(105vh) rotate(520deg);
            opacity: 0;
          }
        }

        @media print {
          header {
            display: none;
          }

          main {
            background: white;
          }

          .confetti {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
