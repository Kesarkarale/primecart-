"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Clock3,
  CreditCard,
  ExternalLink,
  Heart,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  X,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

/* =========================================================
   TYPES
========================================================= */

type OrderItem = {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string | null;
};

type OrderAddress = {
  full_name?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  postal_code?: string;
  country?: string;
};

type Order = {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;

  payment_method?: string | null;
  delivery_charge?: number | null;
  discount?: number | null;
  subtotal?: number | null;
  shipping_address?: OrderAddress | null;

  order_items: OrderItem[];
};

type LocalOrder = {
  id: string;
  user_id?: string;
  status?: string;
  total_amount?: number;
  created_at?: string;
  payment_method?: string;
  delivery_charge?: number;
  discount?: number;
  subtotal?: number;
  shipping_address?: OrderAddress;
  order_items?: OrderItem[];
};

type StatusConfig = {
  label: string;
  icon: React.ReactNode;
  className: string;
  badgeClass: string;
};

type FilterValue =
  | "all"
  | "placed"
  | "processing"
  | "confirmed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

type SortValue = "newest" | "oldest" | "highest" | "lowest";

/* =========================================================
   IMAGE HELPERS
========================================================= */

function getImageCandidates(imageUrl?: string | null) {
  if (!imageUrl) {
    return ["/placeholder-product.png"];
  }

  const value = imageUrl.trim();

  if (!value) {
    return ["/placeholder-product.png"];
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  ) {
    if (value.startsWith("/products/")) {
      return [value, value.replace("/products/", "/")];
    }

    return [value];
  }

  return [
    `/products/${value}`,
    `/${value}`,
    `/images/products/${value}`,
    "/placeholder-product.png",
  ];
}

/* =========================================================
   PRODUCT IMAGE
========================================================= */

function ProductImage({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}) {
  const candidates = useMemo(() => getImageCandidates(src), [src]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [src]);

  return (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#eadfc9] bg-[#faf8f3]">
      <Image
        src={candidates[index] ?? "/placeholder-product.png"}
        alt={alt}
        fill
        sizes="96px"
        className="object-contain p-2"
        onError={() => {
          if (index < candidates.length - 1) {
            setIndex((current) => current + 1);
          }
        }}
      />
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(value: number | null | undefined) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeStatus(status?: string) {
  return (status || "placed")
    .toLowerCase()
    .trim()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");
}

function getStatusConfig(status?: string): StatusConfig {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "confirmed":
      return {
        label: "Confirmed",
        icon: <CheckCircle2 size={15} />,
        className: "text-blue-700",
        badgeClass: "border-blue-200 bg-blue-50",
      };

    case "processing":
      return {
        label: "Processing",
        icon: <Clock3 size={15} />,
        className: "text-amber-700",
        badgeClass: "border-amber-200 bg-amber-50",
      };

    case "shipped":
      return {
        label: "Shipped",
        icon: <Truck size={15} />,
        className: "text-purple-700",
        badgeClass: "border-purple-200 bg-purple-50",
      };

    case "out_for_delivery":
      return {
        label: "Out for Delivery",
        icon: <Truck size={15} />,
        className: "text-orange-700",
        badgeClass: "border-orange-200 bg-orange-50",
      };

    case "delivered":
      return {
        label: "Delivered",
        icon: <CheckCircle2 size={15} />,
        className: "text-emerald-700",
        badgeClass: "border-emerald-200 bg-emerald-50",
      };

    case "cancelled":
    case "canceled":
      return {
        label: "Cancelled",
        icon: <XCircle size={15} />,
        className: "text-red-700",
        badgeClass: "border-red-200 bg-red-50",
      };

    case "placed":
    default:
      return {
        label: "Order Placed",
        icon: <Package size={15} />,
        className: "text-[#8a6a2f]",
        badgeClass: "border-[#eadfc9] bg-[#fffaf0]",
      };
  }
}

function getOrderProgress(status?: string) {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "placed":
      return 0;

    case "confirmed":
      return 1;

    case "processing":
      return 2;

    case "shipped":
      return 3;

    case "out_for_delivery":
      return 3;

    case "delivered":
      return 4;

    case "cancelled":
    case "canceled":
      return -1;

    default:
      return 0;
  }
}

function getOrderSignature(order: Order) {
  return `${order.id}-${order.created_at}`;
}

function getLocalOrderAsOrder(order: LocalOrder): Order {
  return {
    id: order.id,
    user_id: order.user_id || "local",
    status: order.status || "placed",
    total_amount: Number(order.total_amount || 0),
    created_at: order.created_at || new Date().toISOString(),
    payment_method: order.payment_method,
    delivery_charge: order.delivery_charge,
    discount: order.discount,
    subtotal: order.subtotal,
    shipping_address: order.shipping_address,
    order_items: order.order_items || [],
  };
}

function getAddressText(address?: OrderAddress | null) {
  if (!address) {
    return "Shipping address unavailable";
  }

  const parts = [
    address.address,
    address.address_line_1,
    address.address_line_2,
    address.city,
    address.state,
    address.pincode || address.postal_code,
    address.country,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "Shipping address unavailable";
}

/* =========================================================
   CANCEL ELIGIBILITY
========================================================= */

function canCancelOrder(status?: string) {
  const normalized = normalizeStatus(status);

  /*
    Professional ecommerce behaviour:
    Order can be cancelled before it is shipped.
  */
  return ["placed", "confirmed", "processing"].includes(normalized);
}

/* =========================================================
   TIMELINE
========================================================= */

function OrderTimeline({
  status,
}: {
  status: string;
}) {
  const progress = getOrderProgress(status);

  const steps = [
    {
      label: "Placed",
      icon: <Package size={15} />,
    },
    {
      label: "Confirmed",
      icon: <CheckCircle2 size={15} />,
    },
    {
      label: "Processing",
      icon: <Clock3 size={15} />,
    },
    {
      label: "Shipped",
      icon: <Truck size={15} />,
    },
    {
      label: "Delivered",
      icon: <Check size={15} />,
    },
  ];

  if (progress === -1) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-bold text-red-700">
          <XCircle size={17} />
          This order has been cancelled
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf9] p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9a835b]">
          Order Progress
        </p>

        <span className="text-xs font-bold text-[#6f6250]">
          {steps[Math.min(progress, steps.length - 1)]?.label}
        </span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-[620px] items-center">
          {steps.map((step, index) => {
            const active = index <= progress;
            const completed = index < progress;

            return (
              <div key={step.label} className="flex flex-1 items-center">
                <div className="flex min-w-[82px] flex-col items-center">
                  <div
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 transition",
                      active
                        ? "border-[#b9975b] bg-[#b9975b] text-white"
                        : "border-[#e5d9c3] bg-white text-[#b6a990]",
                    ].join(" ")}
                  >
                    {completed ? <Check size={16} /> : step.icon}
                  </div>

                  <span
                    className={[
                      "mt-2 text-[11px] font-bold",
                      active ? "text-[#5c4a2c]" : "text-[#9f9380]",
                    ].join(" ")}
                  >
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={[
                      "h-[2px] flex-1 rounded-full",
                      index < progress ? "bg-[#b9975b]" : "bg-[#e8dfd0]",
                    ].join(" ")}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function OrdersPage() {
  const supabase = useMemo(() => createClient(), []);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [sort, setSort] = useState<SortValue>("newest");

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [copiedOrder, setCopiedOrder] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* =======================================================
     CANCEL MODAL STATE
  ======================================================= */

  const [cancelOrder, setCancelOrder] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);

  /* =======================================================
     LOAD ORDERS
  ======================================================= */

  const loadOrders = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setErrorMessage("");
        setSuccessMessage("");

        /* -----------------------------------------------
           LOCAL ORDERS
        ------------------------------------------------ */

        let localOrders: Order[] = [];

        try {
          const stored = localStorage.getItem("primecart-orders");

          if (stored) {
            const parsed = JSON.parse(stored);

            if (Array.isArray(parsed)) {
              localOrders = parsed.map((item: LocalOrder) =>
                getLocalOrderAsOrder(item)
              );
            }
          }
        } catch (error) {
          console.error("Unable to read local orders:", error);
        }

        /* -----------------------------------------------
           AUTH USER
        ------------------------------------------------ */

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          window.location.href = "/auth/login";
          return;
        }

        /* -----------------------------------------------
           DATABASE ORDERS
           Only confirmed columns are selected.
        ------------------------------------------------ */

        const { data, error } = await supabase
          .from("orders")
          .select(
            `
              id,
              user_id,
              status,
              total_amount,
              created_at,
              order_items (
                id,
                product_id,
                product_name,
                quantity,
                price,
                image_url
              )
            `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Orders fetch error:", error);

          /*
            If database orders fail, still show local orders.
          */
          setOrders(localOrders);
          setErrorMessage(
            "We couldn't load your latest online orders. Showing saved orders instead."
          );
          return;
        }

        const databaseOrders: Order[] = (data || []).map((order: any) => ({
          id: String(order.id),
          user_id: String(order.user_id),
          status: order.status || "placed",
          total_amount: Number(order.total_amount || 0),
          created_at: order.created_at,
          order_items: Array.isArray(order.order_items)
            ? order.order_items
            : [],
        }));

        /* -----------------------------------------------
           MERGE DB + LOCAL
        ------------------------------------------------ */

        const merged = new Map<string, Order>();

        /*
          Local first.
        */
        for (const order of localOrders) {
          merged.set(order.id, order);
        }

        /*
          Database version wins when same order exists.
        */
        for (const order of databaseOrders) {
          merged.set(order.id, order);
        }

        const finalOrders = Array.from(merged.values()).sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

        setOrders(finalOrders);
      } catch (error) {
        console.error("Load orders error:", error);
        setErrorMessage("Something went wrong while loading your orders.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    loadOrders(true);
  }, [loadOrders]);

  /* =======================================================
     FILTER + SEARCH + SORT
  ======================================================= */

  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    let result = [...orders];

    if (filter !== "all") {
      result = result.filter(
        (order) => normalizeStatus(order.status) === filter
      );
    }

    if (searchValue) {
      result = result.filter((order) => {
        const orderId = order.id.toLowerCase();

        const productNames = order.order_items
          .map((item) => item.product_name)
          .join(" ")
          .toLowerCase();

        return (
          orderId.includes(searchValue) ||
          productNames.includes(searchValue)
        );
      });
    }

    result.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );

        case "highest":
          return b.total_amount - a.total_amount;

        case "lowest":
          return a.total_amount - b.total_amount;

        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
      }
    });

    return result;
  }, [orders, filter, search, sort]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const total = orders.length;

    const delivered = orders.filter(
      (order) => normalizeStatus(order.status) === "delivered"
    ).length;

    const cancelled = orders.filter((order) => {
      const status = normalizeStatus(order.status);

      return status === "cancelled" || status === "canceled";
    }).length;

    const active = orders.filter((order) => {
      const status = normalizeStatus(order.status);

      return !["delivered", "cancelled", "canceled"].includes(status);
    }).length;

    const totalSpent = orders
      .filter(
        (order) =>
          !["cancelled", "canceled"].includes(
            normalizeStatus(order.status)
          )
      )
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

    return {
      total,
      delivered,
      cancelled,
      active,
      totalSpent,
    };
  }, [orders]);

  /* =======================================================
     COPY ORDER ID
  ======================================================= */

  async function copyOrderId(id: string) {
    try {
      await navigator.clipboard.writeText(id);

      setCopiedOrder(id);

      window.setTimeout(() => {
        setCopiedOrder(null);
      }, 1800);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  /* =======================================================
     BUY AGAIN
  ======================================================= */

  function buyAgain(order: Order) {
    try {
      const existingCartRaw = localStorage.getItem("primecart-cart");

      let existingCart: any[] = [];

      if (existingCartRaw) {
        try {
          const parsed = JSON.parse(existingCartRaw);

          if (Array.isArray(parsed)) {
            existingCart = parsed;
          }
        } catch {
          existingCart = [];
        }
      }

      const newItems = order.order_items.map((item) => ({
        id: item.product_id,
        product_id: item.product_id,
        name: item.product_name,
        product_name: item.product_name,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        image_url: item.image_url || null,
      }));

      const merged = [...existingCart];

      for (const item of newItems) {
        const existingIndex = merged.findIndex(
          (cartItem) =>
            String(cartItem.product_id || cartItem.id) ===
            String(item.product_id)
        );

        if (existingIndex >= 0) {
          merged[existingIndex] = {
            ...merged[existingIndex],
            quantity:
              Number(merged[existingIndex].quantity || 0) +
              Number(item.quantity || 0),
          };
        } else {
          merged.push(item);
        }
      }

      localStorage.setItem("primecart-cart", JSON.stringify(merged));

      window.location.href = "/dashboard/cart";
    } catch (error) {
      console.error("Buy again error:", error);
      setErrorMessage("Unable to add products to cart.");
    }
  }

  /* =======================================================
     OPEN CANCEL MODAL
  ======================================================= */

  function openCancelModal(order: Order) {
    setErrorMessage("");
    setSuccessMessage("");
    setCancelOrder(order);
  }

  /* =======================================================
     CONFIRM CANCEL
  ======================================================= */

  async function confirmCancelOrder() {
    if (!cancelOrder) return;

    const order = cancelOrder;

    if (!canCancelOrder(order.status)) {
      setCancelOrder(null);

      setErrorMessage(
        "This order can no longer be cancelled because it has already moved to shipping."
      );

      return;
    }

    try {
      setCancelling(true);
      setErrorMessage("");
      setSuccessMessage("");

      /*
        -----------------------------------------------
        LOCAL-ONLY ORDER
        -----------------------------------------------

        If this order exists only in localStorage,
        update its status there.

        This is NOT a confirmation mechanism.
        The confirmation is the custom modal above.
      */

      if (order.user_id === "local") {
        try {
          const stored = localStorage.getItem("primecart-orders");

          if (stored) {
            const parsed = JSON.parse(stored);

            if (Array.isArray(parsed)) {
              const updated = parsed.map((item: LocalOrder) =>
                String(item.id) === String(order.id)
                  ? {
                      ...item,
                      status: "cancelled",
                    }
                  : item
              );

              localStorage.setItem(
                "primecart-orders",
                JSON.stringify(updated)
              );
            }
          }
        } catch (localError) {
          console.error("Local order cancellation error:", localError);

          setErrorMessage(
            "We couldn't cancel this saved order. Please try again."
          );

          return;
        }
      } else {
        /*
          -----------------------------------------------
          SUPABASE ORDER
          -----------------------------------------------
        */

        const { error } = await supabase
          .from("orders")
          .update({
            status: "cancelled",
          })
          .eq("id", order.id)
          .eq("user_id", order.user_id);

        if (error) {
          console.error("Cancel order error:", error);

          setErrorMessage(
            "We couldn't cancel this order. Please try again."
          );

          return;
        }
      }

      /*
        -----------------------------------------------
        UPDATE UI
        -----------------------------------------------
      */

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                status: "cancelled",
              }
            : currentOrder
        )
      );

      setExpandedOrder(null);
      setCancelOrder(null);

      setSuccessMessage(
        `Order #${order.id.slice(0, 8)} has been cancelled successfully.`
      );

      /*
        Automatically hide success message.
      */
      window.setTimeout(() => {
        setSuccessMessage("");
      }, 4500);
    } catch (error) {
      console.error("Cancel order error:", error);

      setErrorMessage(
        "Something went wrong while cancelling the order."
      );
    } finally {
      setCancelling(false);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#211b13]">
      {/* ===================================================
          TOP BAR
      =================================================== */}

      <div className="border-b border-[#eadfc9] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-3 py-2 text-sm font-bold text-[#5f513d] transition hover:border-[#b9975b] hover:bg-[#fffaf0]"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/wishlist"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#6d5a3b] transition hover:border-[#b9975b] hover:bg-[#fffaf0]"
              title="Wishlist"
            >
              <Heart size={17} />
            </Link>

            <Link
              href="/dashboard/cart"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#6d5a3b] transition hover:border-[#b9975b] hover:bg-[#fffaf0]"
              title="Cart"
            >
              <ShoppingCart size={17} />
            </Link>

            <button
              type="button"
              onClick={() => loadOrders(false)}
              disabled={refreshing}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#6d5a3b] transition hover:border-[#b9975b] hover:bg-[#fffaf0] disabled:cursor-not-allowed disabled:opacity-60"
              title="Refresh Orders"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {/* HERO */}

        <section className="relative overflow-hidden rounded-[30px] border border-[#eadfc9] bg-white shadow-[0_20px_60px_rgba(117,91,44,0.08)]">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#f5e8c8] opacity-60 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-[#f8f1df] blur-3xl" />

          <div className="relative grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-10 lg:py-10">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#eadfc9] bg-[#fffaf0] px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-[#8a6a2f]">
                <Sparkles size={13} />
                PrimeCart Orders
              </div>

              <h1 className="max-w-2xl text-3xl font-black tracking-tight text-[#211b13] sm:text-4xl lg:text-5xl">
                Your shopping journey,
                <span className="block text-[#b28a46]">
                  all in one place.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756957] sm:text-base">
                Track your purchases, revisit products, manage active
                orders and keep everything organised with PrimeCart.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#b9975b] px-5 py-3 text-sm font-black text-white shadow-[0_10px_25px_rgba(185,151,91,0.25)] transition hover:bg-[#a9864e]"
                >
                  Continue Shopping
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/dashboard/wishlist"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-5 py-3 text-sm font-black text-[#5f513d] transition hover:border-[#b9975b] hover:bg-[#fffaf0]"
                >
                  <Heart size={16} />
                  Wishlist
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-start lg:justify-end">
              <div className="flex h-28 w-28 items-center justify-center rounded-[28px] border border-[#eadfc9] bg-[#fffaf0] shadow-inner">
                <ShoppingBag
                  size={48}
                  strokeWidth={1.4}
                  className="text-[#b9975b]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {successMessage && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
            <div className="font-semibold">{successMessage}</div>
          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {errorMessage && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 shrink-0" size={18} />

            <div className="flex-1">
              <div className="font-bold">{errorMessage}</div>
            </div>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="rounded-lg p-1 transition hover:bg-red-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-[#eadfc9] bg-white p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff7e7] text-[#b9975b]">
              <Package size={17} />
            </div>

            <p className="text-2xl font-black text-[#211b13]">
              {stats.total}
            </p>

            <p className="mt-1 text-xs font-bold text-[#897b66]">
              Total Orders
            </p>
          </div>

          <div className="rounded-2xl border border-[#eadfc9] bg-white p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Truck size={17} />
            </div>

            <p className="text-2xl font-black text-[#211b13]">
              {stats.active}
            </p>

            <p className="mt-1 text-xs font-bold text-[#897b66]">
              Active Orders
            </p>
          </div>

          <div className="rounded-2xl border border-[#eadfc9] bg-white p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={17} />
            </div>

            <p className="text-2xl font-black text-[#211b13]">
              {stats.delivered}
            </p>

            <p className="mt-1 text-xs font-bold text-[#897b66]">
              Delivered
            </p>
          </div>

          <div className="rounded-2xl border border-[#eadfc9] bg-white p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <XCircle size={17} />
            </div>

            <p className="text-2xl font-black text-[#211b13]">
              {stats.cancelled}
            </p>

            <p className="mt-1 text-xs font-bold text-[#897b66]">
              Cancelled
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-[#eadfc9] bg-white p-4 sm:col-span-2 lg:col-span-1">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff7e7] text-[#b9975b]">
              <CreditCard size={17} />
            </div>

            <p className="truncate text-xl font-black text-[#211b13]">
              {formatPrice(stats.totalSpent)}
            </p>

            <p className="mt-1 text-xs font-bold text-[#897b66]">
              Total Spent
            </p>
          </div>
        </section>

        {/* =================================================
            SEARCH / FILTER
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-[#eadfc9] bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* SEARCH */}

            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3937b]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by order ID or product name..."
                className="h-11 w-full rounded-xl border border-[#eadfc9] bg-[#fffdf9] pl-11 pr-4 text-sm font-medium text-[#211b13] outline-none transition placeholder:text-[#aa9d89] focus:border-[#b9975b] focus:ring-2 focus:ring-[#b9975b]/10"
              />
            </div>

            {/* SORT */}

            <div className="relative">
              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as SortValue)
                }
                className="h-11 min-w-[170px] appearance-none rounded-xl border border-[#eadfc9] bg-[#fffdf9] px-4 pr-10 text-sm font-bold text-[#5f513d] outline-none focus:border-[#b9975b]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9d8e78]"
              />
            </div>
          </div>

          {/* FILTERS */}

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {[
              ["all", "All Orders"],
              ["placed", "Placed"],
              ["confirmed", "Confirmed"],
              ["processing", "Processing"],
              ["shipped", "Shipped"],
              ["out_for_delivery", "Out for Delivery"],
              ["delivered", "Delivered"],
              ["cancelled", "Cancelled"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value as FilterValue)}
                className={[
                  "shrink-0 rounded-full border px-4 py-2 text-xs font-black transition",
                  filter === value
                    ? "border-[#b9975b] bg-[#b9975b] text-white"
                    : "border-[#eadfc9] bg-white text-[#766650] hover:border-[#b9975b] hover:bg-[#fffaf0]",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <section className="mt-6 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-3xl border border-[#eadfc9] bg-white p-5"
              >
                <div className="h-5 w-40 rounded bg-[#eee6d8]" />

                <div className="mt-5 flex gap-4">
                  <div className="h-24 w-24 rounded-2xl bg-[#eee6d8]" />

                  <div className="flex-1">
                    <div className="h-5 w-1/2 rounded bg-[#eee6d8]" />
                    <div className="mt-3 h-4 w-1/3 rounded bg-[#eee6d8]" />
                    <div className="mt-5 h-10 w-full rounded-xl bg-[#eee6d8]" />
                  </div>
                </div>
              </div>
            ))}
          </section>
        ) : filteredOrders.length === 0 ? (
          /* =================================================
             EMPTY STATE
          ================================================= */

          <section className="mt-6 rounded-[28px] border border-[#eadfc9] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#fff7e7] text-[#b9975b]">
              <ShoppingBag size={34} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-[#211b13]">
              {search || filter !== "all"
                ? "No matching orders"
                : "No orders yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#82745f]">
              {search || filter !== "all"
                ? "Try changing your search or filter to find your orders."
                : "Your purchased products will appear here once you place your first order."}
            </p>

            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#b9975b] px-5 py-3 text-sm font-black text-white transition hover:bg-[#a9864e]"
            >
              Start Shopping
              <ArrowRight size={16} />
            </Link>
          </section>
        ) : (
          /* =================================================
             ORDERS LIST
          ================================================= */

          <section className="mt-6 space-y-5">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);

              const progress = getOrderProgress(order.status);

              const expanded = expandedOrder === order.id;

              const cancellable = canCancelOrder(order.status);

              const subtotal =
                order.subtotal ??
                order.order_items.reduce(
                  (sum, item) =>
                    sum +
                    Number(item.price || 0) *
                      Number(item.quantity || 0),
                  0
                );

              return (
                <article
                  key={getOrderSignature(order)}
                  className="overflow-hidden rounded-[28px] border border-[#eadfc9] bg-white shadow-[0_14px_45px_rgba(117,91,44,0.06)]"
                >
                  {/* ORDER HEADER */}

                  <div className="border-b border-[#eee5d7] px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-[0.14em] text-[#a18b68]">
                            Order
                          </span>

                          <span className="font-mono text-sm font-black text-[#3e3427]">
                            #{order.id.slice(0, 12)}
                          </span>

                          <button
                            type="button"
                            onClick={() => copyOrderId(order.id)}
                            className="rounded-lg p-1.5 text-[#8f806a] transition hover:bg-[#fff7e7] hover:text-[#8a6a2f]"
                            title="Copy Order ID"
                          >
                            {copiedOrder === order.id ? (
                              <Check size={14} />
                            ) : (
                              <Clipboard size={14} />
                            )}
                          </button>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#897b66]">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={14} />
                            {formatDateTime(order.created_at)}
                          </span>

                          <span className="h-1 w-1 rounded-full bg-[#cbbda7]" />

                          <span>
                            {order.order_items.length}{" "}
                            {order.order_items.length === 1
                              ? "item"
                              : "items"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div
                          className={[
                            "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black",
                            statusConfig.badgeClass,
                            statusConfig.className,
                          ].join(" ")}
                        >
                          {statusConfig.icon}
                          {statusConfig.label}
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-bold text-[#95856e]">
                            Total
                          </p>

                          <p className="text-lg font-black text-[#211b13]">
                            {formatPrice(order.total_amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ORDER BODY */}

                  <div className="p-5 sm:p-6">
                    {/* PRODUCTS */}

                    <div className="space-y-3">
                      {order.order_items.map((item) => (
                        <Link
                          key={item.id}
                          href={`/dashboard/products/${item.product_id}`}
                          className="group flex gap-4 rounded-2xl border border-transparent p-2 transition hover:border-[#eadfc9] hover:bg-[#fffaf0]"
                        >
                          <ProductImage
                            src={item.image_url}
                            alt={item.product_name}
                          />

                          <div className="min-w-0 flex-1 py-1">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="line-clamp-2 text-sm font-black text-[#2b241b] transition group-hover:text-[#9b773b]">
                                  {item.product_name}
                                </h3>

                                <p className="mt-1 text-xs font-semibold text-[#8f806b]">
                                  Quantity: {item.quantity}
                                </p>
                              </div>

                              <div className="shrink-0 text-left sm:text-right">
                                <p className="text-sm font-black text-[#211b13]">
                                  {formatPrice(
                                    Number(item.price || 0) *
                                      Number(item.quantity || 0)
                                  )}
                                </p>

                                <p className="mt-1 text-[11px] font-semibold text-[#9b8d78]">
                                  {formatPrice(item.price)} each
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#9b773b]">
                              View Product
                              <ArrowRight
                                size={13}
                                className="transition-transform group-hover:translate-x-0.5"
                              />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* TIMELINE */}

                    {progress >= 0 && (
                      <div className="mt-5">
                        <OrderTimeline status={order.status} />
                      </div>
                    )}

                    {/* EXPANDED DETAILS */}

                    {expanded && (
                      <div className="mt-5 grid gap-4 lg:grid-cols-3">
                        {/* PAYMENT */}

                        <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf9] p-4">
                          <div className="flex items-center gap-2">
                            <CreditCard
                              size={17}
                              className="text-[#b9975b]"
                            />

                            <h4 className="text-sm font-black text-[#3d3326]">
                              Payment
                            </h4>
                          </div>

                          <p className="mt-3 text-sm font-bold text-[#665945]">
                            {order.payment_method ||
                              "Payment details unavailable"}
                          </p>
                        </div>

                        {/* ADDRESS */}

                        <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf9] p-4">
                          <div className="flex items-center gap-2">
                            <MapPin
                              size={17}
                              className="text-[#b9975b]"
                            />

                            <h4 className="text-sm font-black text-[#3d3326]">
                              Delivery Address
                            </h4>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-[#665945]">
                            {getAddressText(order.shipping_address)}
                          </p>
                        </div>

                        {/* SUMMARY */}

                        <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf9] p-4">
                          <div className="flex items-center gap-2">
                            <ShoppingBag
                              size={17}
                              className="text-[#b9975b]"
                            />

                            <h4 className="text-sm font-black text-[#3d3326]">
                              Price Summary
                            </h4>
                          </div>

                          <div className="mt-3 space-y-2 text-sm">
                            <div className="flex justify-between gap-3 text-[#776a57]">
                              <span>Subtotal</span>
                              <span className="font-bold">
                                {formatPrice(subtotal)}
                              </span>
                            </div>

                            {typeof order.delivery_charge ===
                              "number" && (
                              <div className="flex justify-between gap-3 text-[#776a57]">
                                <span>Delivery</span>
                                <span className="font-bold">
                                  {formatPrice(
                                    order.delivery_charge
                                  )}
                                </span>
                              </div>
                            )}

                            {typeof order.discount === "number" &&
                              order.discount > 0 && (
                                <div className="flex justify-between gap-3 text-emerald-700">
                                  <span>Discount</span>
                                  <span className="font-bold">
                                    -{formatPrice(order.discount)}
                                  </span>
                                </div>
                              )}

                            <div className="my-2 border-t border-[#eadfc9]" />

                            <div className="flex justify-between gap-3 text-[#211b13]">
                              <span className="font-black">
                                Total
                              </span>

                              <span className="font-black">
                                {formatPrice(order.total_amount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="mt-5 flex flex-col gap-3 border-t border-[#eee5d7] pt-5 sm:flex-row sm:flex-wrap sm:items-center">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedOrder(
                            expanded ? null : order.id
                          )
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-4 text-xs font-black text-[#5f513d] transition hover:border-[#b9975b] hover:bg-[#fffaf0]"
                      >
                        {expanded ? (
                          <>
                            Hide Details
                            <ChevronUp size={15} />
                          </>
                        ) : (
                          <>
                            View Details
                            <ChevronDown size={15} />
                          </>
                        )}
                      </button>

                      {progress >= 0 &&
                        progress < 4 &&
                        normalizeStatus(order.status) !==
                          "cancelled" &&
                        normalizeStatus(order.status) !==
                          "canceled" && (
                          <button
                            type="button"
                            onClick={() =>
                              setSuccessMessage(
                                "Tracking information will be available as your order progresses."
                              )
                            }
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-4 text-xs font-black text-[#5f513d] transition hover:border-[#b9975b] hover:bg-[#fffaf0]"
                          >
                            <Truck size={15} />
                            Track Order
                          </button>
                        )}

                      {/* ==================================
                          CANCEL ORDER
                      ================================== */}

                      {cancellable && (
                        <button
                          type="button"
                          onClick={() => openCancelModal(order)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-xs font-black text-red-600 transition hover:border-red-300 hover:bg-red-50"
                        >
                          <X size={15} />
                          Cancel Order
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => buyAgain(order)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#b9975b] px-4 text-xs font-black text-white transition hover:bg-[#a9864e] sm:ml-auto"
                      >
                        <RotateCcw size={15} />
                        Buy Again
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* =================================================
            TRUST CARDS
        ================================================= */}

        <section className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#eadfc9] bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff7e7] text-[#b9975b]">
                <ShieldCheck size={18} />
              </div>

              <div>
                <p className="text-sm font-black text-[#3d3326]">
                  Secure Orders
                </p>

                <p className="mt-1 text-xs leading-5 text-[#897b66]">
                  Your order information stays protected.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#eadfc9] bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff7e7] text-[#b9975b]">
                <Zap size={18} />
              </div>

              <div>
                <p className="text-sm font-black text-[#3d3326]">
                  Easy Tracking
                </p>

                <p className="mt-1 text-xs leading-5 text-[#897b66]">
                  Follow your order journey from placement to delivery.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#eadfc9] bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff7e7] text-[#b9975b]">
                <Heart size={18} />
              </div>

              <div>
                <p className="text-sm font-black text-[#3d3326]">
                  Shop With Confidence
                </p>

                <p className="mt-1 text-xs leading-5 text-[#897b66]">
                  Revisit products anytime and buy them again easily.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ===================================================
          CANCEL CONFIRMATION MODAL
      =================================================== */}

      {cancelOrder && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#211b13]/45 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !cancelling) {
              setCancelOrder(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
            className="w-full max-w-md overflow-hidden rounded-[28px] border border-[#eadfc9] bg-white shadow-[0_30px_100px_rgba(33,27,19,0.22)]"
          >
            {/* MODAL HEADER */}

            <div className="relative border-b border-[#eee5d7] bg-[#fffaf0] px-6 py-6">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelOrder(null)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-[#897b66] transition hover:bg-white hover:text-[#211b13] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertTriangle size={23} />
              </div>

              <h2
                id="cancel-order-title"
                className="mt-4 text-xl font-black text-[#211b13]"
              >
                Cancel this order?
              </h2>

              <p className="mt-2 pr-7 text-sm leading-6 text-[#756957]">
                Are you sure you want to cancel this order? This action
                will update your order status.
              </p>
            </div>

            {/* ORDER PREVIEW */}

            <div className="px-6 py-5">
              <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf9] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#a18b68]">
                      Order ID
                    </p>

                    <p className="mt-1 font-mono text-sm font-black text-[#3d3326]">
                      #{cancelOrder.id.slice(0, 12)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#a18b68]">
                      Total
                    </p>

                    <p className="mt-1 text-sm font-black text-[#211b13]">
                      {formatPrice(cancelOrder.total_amount)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#eadfc9] pt-4">
                  {cancelOrder.order_items
                    .slice(0, 2)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 py-1.5"
                      >
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[#eadfc9] bg-white">
                          <Image
                            src={
                              getImageCandidates(
                                item.image_url
                              )[0]
                            }
                            alt={item.product_name}
                            fill
                            sizes="44px"
                            className="object-contain p-1"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="line-clamp-1 text-xs font-black text-[#44392b]">
                            {item.product_name}
                          </p>

                          <p className="mt-0.5 text-[11px] font-semibold text-[#968873]">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}

                  {cancelOrder.order_items.length > 2 && (
                    <p className="mt-2 text-xs font-bold text-[#9a8c78]">
                      + {cancelOrder.order_items.length - 2} more item
                      {cancelOrder.order_items.length - 2 === 1
                        ? ""
                        : "s"}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="flex gap-3">
                  <Clock3
                    size={17}
                    className="mt-0.5 shrink-0 text-amber-700"
                  />

                  <p className="text-xs font-semibold leading-5 text-amber-800">
                    Once cancelled, this order will be marked as
                    <span className="font-black"> Cancelled</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* MODAL ACTIONS */}

            <div className="flex flex-col-reverse gap-3 border-t border-[#eee5d7] px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelOrder(null)}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#eadfc9] bg-white px-5 text-sm font-black text-[#5f513d] transition hover:border-[#b9975b] hover:bg-[#fffaf0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep Order
              </button>

              <button
                type="button"
                disabled={cancelling}
                onClick={confirmCancelOrder}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelling ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X size={17} />
                    Yes, Cancel Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
