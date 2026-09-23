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
  Home,
  MapPin,
  Package,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type CartItem = {
  id: string;
  product_id?: string;
  name: string;
  price: number;
  original_price?: number | null;
  quantity: number;
  image_url?: string | null;
  stock?: number | null;
  brand?: string | null;
};

type Address = {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
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
  items: CartItem[];
};

const ORDER_KEY = "primecart-orders";
const LAST_ORDER_KEY = "primecart-last-order";

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback;

    const parsed = JSON.parse(value);

    return parsed as T;
  } catch {
    return fallback;
  }
}

function getImageCandidates(value?: string | null) {
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

  if (image.startsWith("/products/")) {
    return [image];
  }

  if (image.startsWith("products/")) {
    return [`/${image}`];
  }

  if (image.startsWith("/public/products/")) {
    return [image.replace("/public", "")];
  }

  if (image.startsWith("public/products/")) {
    return [`/${image.replace("public/", "")}`];
  }

  if (image.startsWith("/")) {
    return [image];
  }

  return [`/${image}`, `/products/${image}`];
}

/* =========================================================
   IMAGE
========================================================= */

function ProductImage({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}) {
  const candidates = useMemo(
    () => getImageCandidates(src),
    [src]
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [src]);

  const current = candidates[index];

  if (!current) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#faf6ee]">
        <ShoppingBag
          size={28}
          strokeWidth={1.4}
          className="text-[#c2b39b]"
        />
      </div>
    );
  }

  const remote =
    current.startsWith("http://") ||
    current.startsWith("https://") ||
    current.startsWith("data:");

  if (remote) {
    return (
      <img
        src={current}
        alt={alt}
        className="h-full w-full object-contain p-3"
        onError={() => {
          if (index < candidates.length - 1) {
            setIndex((value) => value + 1);
          }
        }}
      />
    );
  }

  return (
    <Image
      src={current}
      alt={alt}
      fill
      sizes="100px"
      className="object-contain p-3"
      onError={() => {
        if (index < candidates.length - 1) {
          setIndex((value) => value + 1);
        }
      }}
    />
  );
}

/* =========================================================
   DATE
========================================================= */

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

function getEstimatedDelivery(value: string) {
  const date = new Date(
    value || Date.now()
  );

  date.setDate(date.getDate() + 5);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/* =========================================================
   PAGE
========================================================= */

export default function OrderSuccessPage() {
  const [order, setOrder] =
    useState<OrderRecord | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [copied, setCopied] =
    useState(false);

  const [celebration, setCelebration] =
    useState(true);

  useEffect(() => {
    try {
      const params = new URLSearchParams(
        window.location.search
      );

      const orderId = params.get("order");

      const orders = safeParse<OrderRecord[]>(
        localStorage.getItem(ORDER_KEY),
        []
      );

      let foundOrder: OrderRecord | null =
        null;

      if (orderId) {
        foundOrder =
          orders.find(
            (item) =>
              String(item.id) ===
              String(orderId)
          ) || null;
      }

      if (!foundOrder) {
        foundOrder = safeParse<OrderRecord | null>(
          localStorage.getItem(
            LAST_ORDER_KEY
          ),
          null
        );
      }

      setOrder(foundOrder);

      const timer = window.setTimeout(() => {
        setCelebration(false);
      }, 2500);

      return () => {
        window.clearTimeout(timer);
      };
    } catch (error) {
      console.error(
        "Order success load error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  async function copyOrderId() {
    if (!order?.id) return;

    try {
      await navigator.clipboard.writeText(
        order.id
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbf8f2]">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="animate-pulse text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-[#eee5d5]" />

            <div className="mx-auto mt-7 h-8 w-72 rounded-lg bg-[#eee5d5]" />

            <div className="mx-auto mt-3 h-4 w-96 max-w-full rounded bg-[#f0e8da]" />
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!order) {
    return (
      <main className="min-h-screen bg-[#fbf8f2]">
        <header className="border-b border-[#eadfcb] bg-white">
          <div className="mx-auto flex h-[72px] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-[#eadfcb] bg-[#fffaf1]">
                <Image
                  src="/logo.png"
                  alt="PrimeCart"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>

              <div>
                <p className="text-lg font-black text-[#40372d]">
                  PrimeCart
                </p>

                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#a08c6d]">
                  Premium Shopping
                </p>
              </div>
            </Link>
          </div>
        </header>

        <section className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-[30px] border border-[#eadfcb] bg-white p-8 text-center shadow-[0_25px_80px_rgba(75,59,35,0.08)] sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f6eddd] text-[#a47b40]">
              <Package size={34} />
            </div>

            <h1 className="mt-6 text-2xl font-black text-[#40372d]">
              Order details not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#8d8171]">
              The order could not be found on this
              device.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard/orders"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#b9975b] px-5 text-xs font-black text-white"
              >
                View Orders
                <ArrowRight size={15} />
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#ded2c0] bg-white px-5 text-xs font-black text-[#625748]"
              >
                <Home size={15} />
                Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const totalItems = order.items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const estimatedDelivery =
    getEstimatedDelivery(order.createdAt);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbf8f2] text-[#40372d]">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-[#eadfcb] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-[#eadfcb] bg-[#fffaf1]">
              <Image
                src="/logo.png"
                alt="PrimeCart"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>

            <div className="hidden sm:block">
              <p className="text-lg font-black text-[#40372d]">
                PrimeCart
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#a08c6d]">
                Premium Shopping
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-[#e6dccb] bg-[#fffdf9] px-3 py-2 text-[10px] font-black text-[#786b5b]">
            <CheckCircle2
              size={14}
              className="text-[#b9975b]"
            />
            Order Confirmed
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 pb-12 sm:px-6 lg:px-8 lg:py-10">
        {/* =================================================
            SUCCESS HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-[32px] border border-[#eadfcb] bg-white px-5 py-10 text-center shadow-[0_25px_80px_rgba(75,59,35,0.08)] sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#f3e3c3]/50 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-[#ead9b7]/40 blur-3xl" />

          {/* SUCCESS ICON */}
          <div className="relative mx-auto h-28 w-28">
            {celebration && (
              <>
                <span className="absolute left-0 top-8 h-2 w-2 animate-ping rounded-full bg-[#b9975b]" />

                <span className="absolute right-0 top-3 h-2 w-2 animate-ping rounded-full bg-[#d7b978]" />

                <span className="absolute bottom-5 left-1 h-2 w-2 animate-ping rounded-full bg-[#c7a76b]" />
              </>
            )}

            <div className="absolute inset-0 animate-success-pop rounded-full bg-[#d8bb80]/20" />

            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#d7bb81] via-[#b9975b] to-[#98713c] shadow-[0_20px_45px_rgba(185,151,91,0.30)]">
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
              className="absolute -right-1 top-2 animate-float text-[#b9975b]"
            />

            <Sparkles
              size={16}
              className="absolute -left-2 bottom-5 animate-float-delayed text-[#d2b574]"
            />
          </div>

          <p className="mt-7 text-[10px] font-black uppercase tracking-[0.25em] text-[#b08c53]">
            Thank you for shopping with us
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#3f372e] sm:text-4xl">
            Order Placed Successfully!
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#8d8171] sm:text-base">
            Your order has been confirmed successfully.
            We&apos;ve saved your order details and
            you can track your order anytime.
          </p>

          {/* ORDER ID */}
          <div className="mx-auto mt-7 flex w-fit max-w-full flex-col items-center gap-2 rounded-2xl border border-[#eadfcb] bg-[#fcfaf6] px-4 py-3 sm:flex-row">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9b8e7c]">
              Order ID
            </span>

            <span className="max-w-[220px] truncate font-mono text-sm font-black text-[#51483c]">
              {order.id}
            </span>

            <button
              type="button"
              onClick={copyOrderId}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-black text-[#a07b42] hover:bg-[#f4ead8]"
            >
              {copied ? (
                <>
                  <Check size={13} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={13} />
                  Copy
                </>
              )}
            </button>
          </div>

          <p className="mt-4 text-[10px] font-semibold text-[#a09687]">
            Placed on {formatDate(order.createdAt)}
          </p>

          {/* ACTIONS */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard/orders"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#b9975b] px-7 text-sm font-black text-white shadow-[0_10px_25px_rgba(185,151,91,0.20)] transition hover:-translate-y-0.5 hover:bg-[#a9844d]"
            >
              <Package size={17} />
              View My Orders
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            <Link
              href="/dashboard/products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#dfd1bb] bg-white px-7 text-sm font-black text-[#5d5143] transition hover:-translate-y-0.5 hover:bg-[#faf6ee]"
            >
              <ShoppingBag size={17} />
              Continue Shopping
            </Link>
          </div>
        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* DELIVERY JOURNEY */}
            <section className="rounded-[28px] border border-[#eadfcb] bg-white p-5 shadow-[0_12px_40px_rgba(75,59,35,0.05)] sm:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b08c53]">
                    Order journey
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#40372d]">
                    Delivery Status
                  </h2>
                </div>

                <div className="rounded-xl bg-[#f8efdf] p-2.5 text-[#a67c42]">
                  <Truck size={19} />
                </div>
              </div>

              <div className="mt-7">
                <div className="relative grid grid-cols-3">
                  <div className="absolute left-[16%] right-[16%] top-5 h-px bg-[#e8dece]" />

                  <div className="absolute left-[16%] top-5 h-px w-[34%] bg-[#b9975b]" />

                  <StatusStep
                    title="Order Placed"
                    subtitle="Confirmed"
                    active
                    icon={Check}
                  />

                  <StatusStep
                    title="Processing"
                    subtitle="Preparing"
                    icon={Package}
                  />

                  <StatusStep
                    title="Delivery"
                    subtitle={estimatedDelivery}
                    icon={Truck}
                  />
                </div>
              </div>
            </section>

            {/* ADDRESS */}
            <section className="rounded-[28px] border border-[#eadfcb] bg-white p-5 shadow-[0_12px_40px_rgba(75,59,35,0.05)] sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b08c53]">
                    Delivery
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#40372d]">
                    Shipping Address
                  </h2>
                </div>

                <div className="rounded-xl bg-[#f8efdf] p-2.5 text-[#a67c42]">
                  <MapPin size={19} />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#eadfcb] bg-[#fcfaf6] p-5">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#ad8448] shadow-sm">
                    <UserRound size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-black text-[#51483c]">
                      {order.address.fullName}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#8e8271]">
                      {order.address.phone}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-[#766b5d]">
                      {order.address.addressLine1}
                      {order.address.addressLine2
                        ? `, ${order.address.addressLine2}`
                        : ""}
                      <br />
                      {order.address.city},{" "}
                      {order.address.state} -{" "}
                      {order.address.pincode}
                    </p>

                    {order.address.landmark && (
                      <p className="mt-2 text-[10px] font-semibold text-[#968a79]">
                        Landmark:{" "}
                        {order.address.landmark}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ITEMS */}
            <section className="rounded-[28px] border border-[#eadfcb] bg-white p-5 shadow-[0_12px_40px_rgba(75,59,35,0.05)] sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b08c53]">
                    Your purchase
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#40372d]">
                    Ordered Items
                  </h2>
                </div>

                <span className="rounded-full bg-[#f7eddb] px-3 py-1.5 text-[10px] font-black text-[#9d783f]">
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}
                </span>
              </div>

              <div className="mt-5 divide-y divide-[#eee5d8]">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 py-5 first:pt-1"
                  >
                    <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-2xl border border-[#eadfcb] bg-[#faf7f0]">
                      <ProductImage
                        src={item.image_url}
                        alt={item.name}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      {item.brand && (
                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#a3937d]">
                          {item.brand}
                        </p>
                      )}

                      <h3 className="mt-1 line-clamp-2 text-sm font-black leading-5 text-[#51483c]">
                        {item.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold text-[#938777]">
                        <span>
                          Qty: {item.quantity}
                        </span>

                        <span>
                          {formatPrice(item.price)}{" "}
                          each
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-black text-[#a17a43]">
                        {formatPrice(
                          item.price *
                            item.quantity
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* HELP */}
            <section className="rounded-[28px] border border-[#eadfcb] bg-gradient-to-br from-[#fffdf9] to-[#f8f0e1] p-5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-[#51483c]">
                    Need help with your order?
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-[#8f8271]">
                    You can check your order anytime
                    from the My Orders section.
                  </p>
                </div>

                <Link
                  href="/dashboard/orders"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dccba9] bg-white px-4 text-[10px] font-black text-[#9b753e] transition hover:bg-[#fffaf1]"
                >
                  Track Order
                  <ArrowRight size={14} />
                </Link>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside className="lg:sticky lg:top-[92px] lg:self-start">
            <section className="overflow-hidden rounded-[28px] border border-[#eadfcb] bg-white shadow-[0_15px_50px_rgba(75,59,35,0.07)]">
              <div className="border-b border-[#eee5d8] bg-[#fcfaf6] px-5 py-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b08c53]">
                  Payment summary
                </p>

                <h2 className="mt-1 text-xl font-black text-[#40372d]">
                  Order Details
                </h2>
              </div>

              <div className="space-y-4 p-5">
                <SummaryRow
                  label="Subtotal"
                  value={formatPrice(
                    order.subtotal
                  )}
                />

                {order.discount > 0 && (
                  <SummaryRow
                    label="Savings"
                    value={`-${formatPrice(
                      order.discount
                    )}`}
                    green
                  />
                )}

                <SummaryRow
                  label="Delivery"
                  value={
                    order.delivery === 0
                      ? "FREE"
                      : formatPrice(
                          order.delivery
                        )
                  }
                  green={
                    order.delivery === 0
                  }
                />

                <div className="border-t border-dashed border-[#e4d9c9] pt-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-[#948878]">
                        Total Paid
                      </p>

                      <p className="mt-1 text-2xl font-black text-[#3f372e]">
                        {formatPrice(
                          order.total
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#f7eddb] px-3 py-2 text-right">
                      <p className="text-[8px] font-black uppercase tracking-wider text-[#a07b42]">
                        Payment
                      </p>

                      <p className="mt-1 text-[10px] font-black text-[#665844]">
                        {order.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DELIVERY ESTIMATE */}
                <div className="rounded-2xl border border-[#e8dcc7] bg-[#fffaf1] p-4">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#ae874c] shadow-sm">
                      <Clock3 size={17} />
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-[#5c5041]">
                        Estimated delivery
                      </p>

                      <p className="mt-1 text-sm font-black text-[#a17a43]">
                        By{" "}
                        {estimatedDelivery}
                      </p>

                      <p className="mt-1 text-[9px] leading-4 text-[#938777]">
                        Delivery estimate may change
                        depending on location and
                        availability.
                      </p>
                    </div>
                  </div>
                </div>

                {/* TRUST */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-[#eee5d8] bg-[#fcfaf6] p-3">
                    <CheckCircle2
                      size={17}
                      className="text-[#a17a43]"
                    />

                    <p className="mt-2 text-[9px] font-black text-[#766b5c]">
                      Order confirmed
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#eee5d8] bg-[#fcfaf6] p-3">
                    <Truck
                      size={17}
                      className="text-[#a17a43]"
                    />

                    <p className="mt-2 text-[9px] font-black text-[#766b5c]">
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
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>

                <Link
                  href="/dashboard/products"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#dfd1bb] bg-white text-[10px] font-black text-[#65594a] transition hover:bg-[#faf6ee]"
                >
                  <ShoppingBag size={15} />
                  Continue Shopping
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #fbf8f2;
        }

        @keyframes success-pop {
          0% {
            opacity: 0;
            transform: scale(0.65);
          }

          60% {
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
          animation: success-pop 0.7s
            cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .animate-float {
          animation: float 2.5s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out
            0.5s infinite;
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   STATUS STEP
========================================================= */

function StatusStep({
  title,
  subtitle,
  active = false,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  active?: boolean;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
}) {
  return (
    <div className="relative z-10 flex flex-col items-center text-center">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white ${
          active
            ? "bg-[#b9975b] text-white shadow-[0_8px_20px_rgba(185,151,91,0.25)]"
            : "bg-[#f3ede2] text-[#a79a87]"
        }`}
      >
        <Icon size={17} />
      </div>

      <p
        className={`mt-3 text-[10px] font-black ${
          active
            ? "text-[#51483c]"
            : "text-[#918575]"
        }`}
      >
        {title}
      </p>

      <p className="mt-1 max-w-[100px] text-[9px] font-semibold leading-4 text-[#a49a8c]">
        {subtitle}
      </p>
    </div>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="font-semibold text-[#8b7f70]">
        {label}
      </span>

      <span
        className={`font-bold ${
          green
            ? "text-[#5e885f]"
            : "text-[#51483c]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
