"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Copy,
  Check,
  ArrowRight,
  Home,
  ShoppingBag,
  Printer,
  Volume2,
  VolumeX,
  Sparkles,
  Clock3,
  ShieldCheck,
} from "lucide-react";

type OrderItem = {
  id?: string | number;
  productId?: string | number;
  name?: string;
  image?: string;
  image_url?: string;
  price?: number;
  quantity?: number;
};

type Address = {
  id?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  mobile?: string;
  addressLine1?: string;
  addressLine2?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  zipCode?: string;
};

type Order = {
  id?: string;
  orderId?: string;
  createdAt?: string;
  status?: string;
  paymentMethod?: string;
  total?: number;
  subtotal?: number;
  delivery?: number;
  discount?: number;
  savings?: number;
  address?: Address;
  items?: OrderItem[];
};

function getImageUrl(image?: string) {
  if (!image) {
    return "/logo.png";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/")
  ) {
    return image;
  }

  return `/products/${image}`;
}

function formatMoney(value: number | undefined) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundPlayed, setSoundPlayed] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const orderId = searchParams.get("order");

      const savedOrders = localStorage.getItem("primecart-orders");
      const lastOrder = localStorage.getItem("primecart-last-order");

      let foundOrder: Order | null = null;

      if (savedOrders) {
        try {
          const parsed = JSON.parse(savedOrders);

          if (Array.isArray(parsed)) {
            foundOrder =
              parsed.find(
                (item: Order) =>
                  String(item?.id || item?.orderId || "") === String(orderId)
              ) || null;
          }
        } catch {
          foundOrder = null;
        }
      }

      if (!foundOrder && lastOrder) {
        try {
          const parsedLastOrder = JSON.parse(lastOrder);

          if (
            !orderId ||
            String(parsedLastOrder?.id || parsedLastOrder?.orderId || "") ===
              String(orderId)
          ) {
            foundOrder = parsedLastOrder;
          }
        } catch {
          foundOrder = null;
        }
      }

      if (foundOrder) {
        setOrder(foundOrder);
      }
    } catch (error) {
      console.error("Unable to load order:", error);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!mounted || !order || !soundEnabled || soundPlayed) {
      return;
    }

    const timer = window.setTimeout(() => {
      const audio = audioRef.current;

      if (!audio) {
        return;
      }

      audio.volume = 0.8;

      audio
        .play()
        .then(() => {
          setSoundPlayed(true);
        })
        .catch(() => {
          // Browser autoplay policy may block automatic playback.
          // User can manually press the sound button.
        });
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [mounted, order, soundEnabled, soundPlayed]);

  const getOrderId = () => {
    if (!order) {
      return searchParams.get("order") || "PC-ORDER";
    }

    return order.id || order.orderId || searchParams.get("order") || "PC-ORDER";
  };

  const orderId = getOrderId();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(orderId));
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      // Clipboard may not be available in some browsers.
    }
  };

  const playSound = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    try {
      audio.currentTime = 0;
      audio.volume = 0.8;
      await audio.play();

      setSoundEnabled(true);
      setSoundPlayed(true);
    } catch (error) {
      console.error("Audio playback failed:", error);
    }
  };

  const toggleSound = () => {
    if (soundEnabled) {
      const audio = audioRef.current;

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      setSoundEnabled(false);
      return;
    }

    setSoundEnabled(true);
    playSound();
  };

  const handlePrint = () => {
    window.print();
  };

  const items = order?.items || [];

  const subtotal = Number(order?.subtotal || 0);
  const delivery = Number(order?.delivery || 0);
  const discount = Number(order?.discount || order?.savings || 0);
  const total = Number(
    order?.total || subtotal + delivery - discount
  );

  const address = order?.address;

  const paymentMethod =
    order?.paymentMethod
      ?.replace(/_/g, " ")
      ?.replace(/\b\w/g, (letter) => letter.toUpperCase()) ||
    "Online Payment";

  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#fffdf9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-[#ead7aa] border-t-[#b8872d] animate-spin" />

          <p className="text-sm font-medium text-[#766b5b]">
            Loading your order...
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/sounds/order-success.mp3"
        preload="auto"
      />

      <main className="min-h-screen bg-[#fffdf9] text-[#2b241b] print:bg-white">
        {/* Background decoration */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden print:hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#f4e6c5]/40 blur-3xl" />
          <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-[#f6ead0]/40 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#f9efd9]/50 blur-3xl" />
        </div>

        {/* Top bar */}
        <header className="relative z-10 border-b border-[#eadfca] bg-white/90 backdrop-blur-xl print:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#ead9b7] bg-white shadow-sm">
                <img
                  src="/logo.png"
                  alt="PrimeCart"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="text-left">
                <p className="text-lg font-black tracking-tight text-[#2d261d]">
                  Prime<span className="text-[#b8872d]">Cart</span>
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8b72]">
                  Shopping made premium
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={toggleSound}
              className="flex h-10 items-center gap-2 rounded-xl border border-[#e8dcc3] bg-white px-3 text-sm font-semibold text-[#645947] shadow-sm transition hover:border-[#c79a3b] hover:text-[#a57521]"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Sound On</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4" />
                  <span className="hidden sm:inline">Sound Off</span>
                </>
              )}
            </button>
          </div>
        </header>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {/* Success hero */}
          <section className="text-center">
            <div className="relative mx-auto mb-6 h-24 w-24">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#d9b45c]/20" />

              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#dec27f] bg-gradient-to-br from-[#fffaf0] to-[#f4e3b7] shadow-[0_18px_50px_rgba(184,135,45,0.18)]">
                <CheckCircle2 className="h-14 w-14 text-[#b8872d]" strokeWidth={1.8} />
              </div>
            </div>

            <div className="mb-3 flex items-center justify-center gap-2 text-[#b8872d]">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-[0.25em]">
                Order Confirmed
              </span>
              <Sparkles className="h-4 w-4" />
            </div>

            <h1 className="text-3xl font-black tracking-tight text-[#2d261d] sm:text-5xl">
              Thank you for your order!
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#766b5b] sm:text-base">
              Your order has been successfully placed. We&apos;ll keep you
              updated as your package moves towards you.
            </p>

            {/* Order ID */}
            <div className="mx-auto mt-6 flex w-fit max-w-full items-center gap-2 rounded-2xl border border-[#e7d9bc] bg-white px-4 py-3 shadow-sm">
              <div className="min-w-0">
                <p className="text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#a3947c]">
                  Order ID
                </p>

                <p className="mt-0.5 truncate text-sm font-black text-[#3b3022] sm:text-base">
                  {orderId}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#faf5e9] text-[#a57521] transition hover:bg-[#f3e6c7]"
                aria-label="Copy order ID"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Sound button */}
            {!soundPlayed && (
              <button
                type="button"
                onClick={playSound}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#d9bd79] bg-[#fffaf0] px-4 py-2.5 text-sm font-bold text-[#a57521] shadow-sm transition hover:bg-[#f9edcf]"
              >
                <Volume2 className="h-4 w-4" />
                Play Order Confirmation Sound
              </button>
            )}
          </section>

          {/* Progress */}
          <section className="mt-10 rounded-3xl border border-[#e9dec8] bg-white p-5 shadow-[0_12px_45px_rgba(70,50,20,0.06)] sm:p-7">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="text-lg font-black text-[#342a1e]">
                  Order progress
                </p>
                <p className="mt-1 text-xs text-[#8c7e68]">
                  Estimated delivery within 3–5 business days
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-full bg-[#f8f1df] px-3 py-1.5 sm:flex">
                <Clock3 className="h-4 w-4 text-[#b8872d]" />
                <span className="text-xs font-bold text-[#8b6a32]">
                  Processing
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: CheckCircle2,
                  title: "Confirmed",
                  active: true,
                },
                {
                  icon: Package,
                  title: "Packed",
                  active: false,
                },
                {
                  icon: Truck,
                  title: "Delivered",
                  active: false,
                },
              ].map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={step.title} className="relative text-center">
                    {index < 2 && (
                      <div className="absolute left-[58%] top-6 hidden h-px w-[84%] bg-[#e8dfcf] sm:block" />
                    )}

                    <div
                      className={`relative mx-auto flex h-12 w-12 items-center justify-center rounded-full border ${
                        step.active
                          ? "border-[#c79a3b] bg-[#f8edcf] text-[#b8872d]"
                          : "border-[#e5dccb] bg-[#faf9f6] text-[#b9ae9d]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <p
                      className={`mt-3 text-xs font-bold sm:text-sm ${
                        step.active
                          ? "text-[#7f5d24]"
                          : "text-[#958875]"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Main details */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            {/* Left */}
            <div className="space-y-6">
              {/* Items */}
              <section className="rounded-3xl border border-[#e9dec8] bg-white p-5 shadow-[0_12px_45px_rgba(70,50,20,0.06)] sm:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-black text-[#342a1e]">
                      Ordered items
                    </p>
                    <p className="mt-1 text-xs text-[#8c7e68]">
                      {items.length} {items.length === 1 ? "item" : "items"} in
                      this order
                    </p>
                  </div>

                  <ShoppingBag className="h-5 w-5 text-[#b8872d]" />
                </div>

                {items.length > 0 ? (
                  <div className="divide-y divide-[#eee6d8]">
                    {items.map((item, index) => {
                      const quantity = Number(item.quantity || 1);
                      const price = Number(item.price || 0);

                      return (
                        <div
                          key={`${item.id || item.productId || "item"}-${index}`}
                          className="flex gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#eee3cf] bg-[#faf8f3] sm:h-24 sm:w-24">
                            <img
                              src={getImageUrl(
                                item.image_url || item.image
                              )}
                              alt={item.name || "Product"}
                              className="h-full w-full object-contain p-2"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-sm font-bold text-[#403527] sm:text-base">
                              {item.name || "PrimeCart Product"}
                            </h3>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8b7d68]">
                              <span>
                                Qty:{" "}
                                <strong className="text-[#5d4b35]">
                                  {quantity}
                                </strong>
                              </span>

                              <span>
                                Unit price:{" "}
                                <strong className="text-[#5d4b35]">
                                  {formatMoney(price)}
                                </strong>
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-sm font-black text-[#3b3022] sm:text-base">
                              {formatMoney(price * quantity)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#dfd3bb] bg-[#fcfaf5] px-5 py-10 text-center">
                    <Package className="mx-auto h-8 w-8 text-[#b9a98c]" />
                    <p className="mt-3 text-sm font-semibold text-[#786a55]">
                      Order details are loading...
                    </p>
                  </div>
                )}
              </section>

              {/* Delivery */}
              <section className="rounded-3xl border border-[#e9dec8] bg-white p-5 shadow-[0_12px_45px_rgba(70,50,20,0.06)] sm:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8f0df]">
                    <MapPin className="h-5 w-5 text-[#b8872d]" />
                  </div>

                  <div>
                    <p className="font-black text-[#342a1e]">
                      Delivery address
                    </p>
                    <p className="text-xs text-[#8c7e68]">
                      Your package will be delivered here
                    </p>
                  </div>
                </div>

                {address ? (
                  <div className="rounded-2xl border border-[#eee3d0] bg-[#fcfaf6] p-4">
                    <p className="text-sm font-black text-[#433626]">
                      {address.fullName || address.name || "Customer"}
                    </p>

                    {(address.phone || address.mobile) && (
                      <p className="mt-1 text-xs font-medium text-[#82745f]">
                        {address.phone || address.mobile}
                      </p>
                    )}

                    <p className="mt-3 text-sm leading-6 text-[#746653]">
                      {address.addressLine1 ||
                        address.address ||
                        ""}
                      {address.addressLine2 && (
                        <>
                          <br />
                          {address.addressLine2}
                        </>
                      )}
                      {(address.city ||
                        address.state ||
                        address.pincode ||
                        address.zipCode) && (
                        <>
                          <br />
                          {[
                            address.city,
                            address.state,
                            address.pincode || address.zipCode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#dfd3bb] bg-[#fcfaf5] p-5 text-sm text-[#83745e]">
                    Delivery address information is not available.
                  </div>
                )}
              </section>
            </div>

            {/* Right */}
            <div className="space-y-6">
              {/* Summary */}
              <section className="rounded-3xl border border-[#dfdecf] bg-white p-5 shadow-[0_12px_45px_rgba(70,50,20,0.07)] sm:p-6">
                <p className="text-lg font-black text-[#342a1e]">
                  Order summary
                </p>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 text-[#756754]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#4d402f]">
                      {formatMoney(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-[#756754]">
                    <span>Delivery</span>
                    <span
                      className={`font-semibold ${
                        delivery === 0
                          ? "text-[#4b8a62]"
                          : "text-[#4d402f]"
                      }`}
                    >
                      {delivery === 0
                        ? "FREE"
                        : formatMoney(delivery)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between gap-4 text-[#4b8a62]">
                      <span>Discount</span>
                      <span className="font-bold">
                        -{formatMoney(discount)}
                      </span>
                    </div>
                  )}

                  <div className="my-4 border-t border-dashed border-[#ded3c0]" />

                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#8b7d69]">
                        Total paid
                      </p>
                      <p className="mt-1 text-2xl font-black text-[#2f271d]">
                        {formatMoney(total)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#f5eddb] px-3 py-1.5 text-xs font-bold text-[#896526]">
                      Paid
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section className="rounded-3xl border border-[#e9dec8] bg-white p-5 shadow-[0_12px_45px_rgba(70,50,20,0.06)] sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8f0df]">
                    <CreditCard className="h-5 w-5 text-[#b8872d]" />
                  </div>

                  <div>
                    <p className="font-black text-[#342a1e]">
                      Payment method
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#665742]">
                      {paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f7f5ef] px-3 py-2.5 text-xs text-[#716653]">
                  <ShieldCheck className="h-4 w-4 text-[#6b9878]" />
                  Your order information is securely stored.
                </div>
              </section>

              {/* Order date */}
              <section className="rounded-3xl border border-[#e9dec8] bg-[#fffaf0] p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#a28d68]">
                  Order placed
                </p>

                <p className="mt-2 text-base font-black text-[#4b3a25]">
                  {orderDate}
                </p>

                <p className="mt-2 text-xs leading-5 text-[#82745f]">
                  You&apos;ll receive updates about your order as it moves
                  through each delivery stage.
                </p>
              </section>
            </div>
          </div>

          {/* Actions */}
          <section className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#ded2bd] bg-white px-5 text-sm font-bold text-[#665642] shadow-sm transition hover:border-[#c79a3b] hover:text-[#a57521] print:hidden"
            >
              <Printer className="h-4 w-4" />
              Print Order
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard/orders")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#d9c8a7] bg-white px-5 text-sm font-bold text-[#665642] shadow-sm transition hover:border-[#c79a3b] hover:text-[#a57521] print:hidden"
            >
              <Package className="h-4 w-4" />
              My Orders
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#b8872d] px-6 text-sm font-black text-white shadow-[0_10px_25px_rgba(184,135,45,0.24)] transition hover:bg-[#a57521] print:hidden"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>

          {/* Footer */}
          <div className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-[#998c78] print:hidden">
            <Home className="h-3.5 w-3.5" />
            <span>Thank you for shopping with PrimeCart.</span>
          </div>
        </div>
      </main>
    </>
  );
}
