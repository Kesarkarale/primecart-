"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Copy,
  CreditCard,
  Eye,
  Heart,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  X,
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
  id?: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  type?: string;
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
  shipping_address?: OrderAddress | string | null;

  order_items?: OrderItem[];
};

type LocalOrder = {
  id: string;
  createdAt: string;
  status?: string;
  paymentMethod?: string;
  total: number;
  subtotal?: number;
  delivery?: number;
  discount?: number;
  address?: OrderAddress | string;
  items?: OrderItem[];
};

type StatusConfig = {
  label: string;
  icon: React.ElementType;
  className: string;
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

type SortValue =
  | "newest"
  | "oldest"
  | "highest"
  | "lowest";

/* =========================================================
   IMAGE HELPERS
========================================================= */

function getImageCandidates(value?: string | null): string[] {
  if (!value) {
    return ["/products/placeholder.png", "/placeholder.png"];
  }

  const original = value.trim();

  if (!original) {
    return ["/products/placeholder.png", "/placeholder.png"];
  }

  if (
    original.startsWith("http://") ||
    original.startsWith("https://") ||
    original.startsWith("data:")
  ) {
    return [original];
  }

  const clean = original
    .replace(/^public\//, "")
    .replace(/^\/public\//, "")
    .replace(/^\/+/, "");

  const candidates: string[] = [];

  if (clean.startsWith("products/")) {
    candidates.push(`/${clean}`);
    candidates.push(`/${clean.replace(/^products\//, "")}`);
  } else {
    candidates.push(`/products/${clean}`);
    candidates.push(`/${clean}`);
  }

  candidates.push("/products/placeholder.png");
  candidates.push("/placeholder.png");

  return [...new Set(candidates)];
}

function ProductImage({
  src,
  alt,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  priority?: boolean;
}) {
  const candidates = useMemo(() => getImageCandidates(src), [src]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [src]);

  const currentSrc = candidates[index] ?? candidates[0];

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 768px) 100px, 140px"
      className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
      onError={() => {
        if (index < candidates.length - 1) {
          setIndex((prev) => prev + 1);
        }
      }}
    />
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function normalizeStatus(status?: string | null) {
  return String(status || "placed")
    .toLowerCase()
    .trim()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");
}

function getStatusConfig(status?: string): StatusConfig {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "delivered":
    case "completed":
      return {
        label: "Delivered",
        icon: Check,
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

    case "cancelled":
    case "canceled":
      return {
        label: "Cancelled",
        icon: X,
        className: "border-red-200 bg-red-50 text-red-600",
      };

    case "out_for_delivery":
      return {
        label: "Out for Delivery",
        icon: Truck,
        className:
          "border-blue-200 bg-blue-50 text-blue-700",
      };

    case "shipped":
      return {
        label: "Shipped",
        icon: Package,
        className:
          "border-indigo-200 bg-indigo-50 text-indigo-700",
      };

    case "processing":
      return {
        label: "Processing",
        icon: Clock3,
        className:
          "border-amber-200 bg-amber-50 text-amber-700",
      };

    case "confirmed":
      return {
        label: "Confirmed",
        icon: Check,
        className:
          "border-cyan-200 bg-cyan-50 text-cyan-700",
      };

    default:
      return {
        label: "Order Placed",
        icon: ShoppingBag,
        className:
          "border-[#eadfc9] bg-[#fbf7ed] text-[#9a742d]",
      };
  }
}

function getOrderProgress(status?: string) {
  const normalized = normalizeStatus(status);

  if (normalized === "cancelled" || normalized === "canceled") {
    return -1;
  }

  if (normalized === "delivered" || normalized === "completed") {
    return 4;
  }

  if (normalized === "out_for_delivery") {
    return 3;
  }

  if (normalized === "shipped") {
    return 2;
  }

  if (
    normalized === "processing" ||
    normalized === "confirmed"
  ) {
    return 1;
  }

  return 0;
}

function getOrderSignature(order: Order) {
  return `${order.id}-${order.created_at}`;
}

function getLocalOrderAsOrder(order: LocalOrder): Order {
  return {
    id: order.id,
    user_id: "local",
    status: order.status || "placed",
    total_amount: Number(order.total || 0),
    created_at: order.createdAt,
    payment_method: order.paymentMethod,
    delivery_charge: order.delivery,
    discount: order.discount,
    subtotal: order.subtotal,
    shipping_address: order.address,
    order_items: order.items || [],
  };
}

function getAddressText(
  address?: OrderAddress | string | null
) {
  if (!address) return null;

  if (typeof address === "string") {
    return address;
  }

  return [
    address.address,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");
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
  const [filter, setFilter] =
    useState<FilterValue>("all");

  const [sort, setSort] =
    useState<SortValue>("newest");

  const [expandedOrder, setExpandedOrder] =
    useState<string | null>(null);

  const [copiedOrder, setCopiedOrder] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadOrders = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        /* ---------------------------------------------
           LOCAL ORDERS
        --------------------------------------------- */

        let localOrders: Order[] = [];

        try {
          const stored = localStorage.getItem(
            "primecart-orders"
          );

          if (stored) {
            const parsed = JSON.parse(stored);

            if (Array.isArray(parsed)) {
              localOrders = parsed
                .map((item: LocalOrder) =>
                  getLocalOrderAsOrder(item)
                )
                .filter(Boolean);
            }
          }
        } catch {
          // Ignore invalid local storage.
        }

        /* ---------------------------------------------
           AUTH
        --------------------------------------------- */

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/auth/login";
          return;
        }

        /* ---------------------------------------------
           SUPABASE ORDERS

           Only uses columns that are confirmed in the
           current project schema.
        --------------------------------------------- */

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
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          if (localOrders.length === 0) {
            setErrorMessage(
              "We couldn't load your orders right now. Please try again."
            );
          }

          setOrders(localOrders);
          return;
        }

        const databaseOrders: Order[] =
          (data || []).map((order: any) => ({
            ...order,
            total_amount: Number(
              order.total_amount || 0
            ),
            order_items:
              order.order_items || [],
          }));

        /* ---------------------------------------------
           MERGE LOCAL + DATABASE ORDERS
        --------------------------------------------- */

        const merged = [
          ...databaseOrders,
          ...localOrders,
        ];

        const unique = new Map<string, Order>();

        merged.forEach((order) => {
          const key = getOrderSignature(order);

          if (!unique.has(key)) {
            unique.set(key, order);
          }
        });

        const finalOrders = Array.from(
          unique.values()
        ).sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

        setOrders(finalOrders);
      } catch (error) {
        console.error("Orders loading error:", error);

        if (orders.length === 0) {
          setErrorMessage(
            "Something went wrong while loading your orders."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [supabase, orders.length]
  );

  useEffect(() => {
    loadOrders();

    const handleStorage = () => {
      loadOrders(true);
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [loadOrders]);

  /* =====================================================
     FILTER + SORT
  ===================================================== */

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = orders.filter((order) => {
      const normalized = normalizeStatus(
        order.status
      );

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "cancelled"
            ? normalized === "cancelled" ||
              normalized === "canceled"
            : filter === "placed"
              ? normalized === "placed"
              : normalized === filter;

      if (!matchesFilter) return false;

      if (!query) return true;

      const orderMatch = order.id
        .toLowerCase()
        .includes(query);

      const productMatch = (
        order.order_items || []
      ).some((item) =>
        item.product_name
          ?.toLowerCase()
          .includes(query)
      );

      return orderMatch || productMatch;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );

        case "highest":
          return (
            Number(b.total_amount || 0) -
            Number(a.total_amount || 0)
          );

        case "lowest":
          return (
            Number(a.total_amount || 0) -
            Number(b.total_amount || 0)
          );

        default:
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
      }
    });

    return result;
  }, [orders, search, filter, sort]);

  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(() => {
    const totalOrders = orders.length;

    const deliveredOrders = orders.filter((order) => {
      const status = normalizeStatus(order.status);

      return (
        status === "delivered" ||
        status === "completed"
      );
    }).length;

    const cancelledOrders = orders.filter((order) => {
      const status = normalizeStatus(order.status);

      return (
        status === "cancelled" ||
        status === "canceled"
      );
    }).length;

    const activeOrders = orders.filter((order) => {
      const status = normalizeStatus(order.status);

      return (
        status !== "delivered" &&
        status !== "completed" &&
        status !== "cancelled" &&
        status !== "canceled"
      );
    }).length;

    const totalSpent = orders
      .filter((order) => {
        const status = normalizeStatus(
          order.status
        );

        return (
          status !== "cancelled" &&
          status !== "canceled"
        );
      })
      .reduce(
        (sum, order) =>
          sum + Number(order.total_amount || 0),
        0
      );

    return {
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      activeOrders,
      totalSpent,
    };
  }, [orders]);

  /* =====================================================
     COPY ORDER ID
  ===================================================== */

  async function copyOrderId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedOrder(id);

      setTimeout(() => {
        setCopiedOrder(null);
      }, 1800);
    } catch {
      // Ignore clipboard errors.
    }
  }

  /* =====================================================
     BUY AGAIN
  ===================================================== */

  function buyAgain(order: Order) {
    try {
      const existing = JSON.parse(
        localStorage.getItem("primecart-cart") ||
          "[]"
      );

      const cart = Array.isArray(existing)
        ? existing
        : [];

      (order.order_items || []).forEach((item) => {
        const existingIndex = cart.findIndex(
          (cartItem: any) =>
            String(
              cartItem.product_id ||
                cartItem.id
            ) === String(item.product_id)
        );

        if (existingIndex >= 0) {
          cart[existingIndex].quantity =
            Number(
              cart[existingIndex].quantity || 0
            ) + Number(item.quantity || 1);
        } else {
          cart.push({
            id: item.product_id,
            product_id: item.product_id,
            name: item.product_name,
            product_name: item.product_name,
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1),
            image_url: item.image_url || null,
          });
        }
      });

      localStorage.setItem(
        "primecart-cart",
        JSON.stringify(cart)
      );

      window.dispatchEvent(
        new Event("storage")
      );

      window.location.href =
        "/dashboard/cart";
    } catch (error) {
      console.error("Buy again error:", error);
    }
  }

  /* =====================================================
     CLEAR SEARCH
  ===================================================== */

  function clearSearch() {
    setSearch("");
    setFilter("all");
    setSort("newest");
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#211b13]">
      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="border-b border-[#eadfc9] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[64px] max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-[#5f503a] transition hover:text-[#a47a2c]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfc9] bg-[#fffdf8] transition group-hover:border-[#c8a65b]">
              <ArrowLeft
                size={17}
                strokeWidth={2}
              />
            </span>

            <span className="hidden sm:inline">
              Back to Dashboard
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/wishlist"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#80673e] transition hover:border-[#c8a65b] hover:bg-[#fffaf0]"
              aria-label="Wishlist"
            >
              <Heart size={17} />
            </Link>

            <Link
              href="/dashboard/cart"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#80673e] transition hover:border-[#c8a65b] hover:bg-[#fffaf0]"
              aria-label="Cart"
            >
              <ShoppingCart size={17} />
            </Link>

            <button
              type="button"
              onClick={() => loadOrders(true)}
              disabled={refreshing}
              className="flex h-9 items-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-3 text-sm font-semibold text-[#80673e] transition hover:border-[#c8a65b] hover:bg-[#fffaf0] disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* ===============================================
            HERO
        =============================================== */}

        <section className="relative overflow-hidden rounded-[28px] border border-[#eadfc9] bg-white p-5 shadow-[0_12px_45px_rgba(94,72,34,0.06)] sm:p-7 lg:p-9">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#f4e8c9]/60 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-20 h-64 w-64 rounded-full bg-[#f8f1df] blur-3xl" />

          <div className="relative">
            <div className="mb-5 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbf5e5] text-[#b48a3d]">
                <ShoppingBag
                  size={19}
                  strokeWidth={2}
                />
              </span>

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#a47a2c]">
                PrimeCart
              </span>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight text-[#201a12] sm:text-4xl lg:text-[46px] lg:leading-[1.08]">
                My Orders
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#786b59] sm:text-base">
                Keep track of your purchases, delivery
                progress and order details — all in one
                place.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                icon={Package}
                label="Total Orders"
                value={stats.totalOrders}
              />

              <StatCard
                icon={Truck}
                label="Active Orders"
                value={stats.activeOrders}
              />

              <StatCard
                icon={Check}
                label="Delivered"
                value={stats.deliveredOrders}
              />

              <StatCard
                icon={CreditCard}
                label="Total Spent"
                value={formatPrice(
                  stats.totalSpent
                )}
                compact
              />
            </div>
          </div>
        </section>

        {/* ===============================================
            ERROR
        =============================================== */}

        {errorMessage && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <X
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              {errorMessage}
            </div>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ===============================================
            TOOLBAR
        =============================================== */}

        <section className="mt-6 rounded-[24px] border border-[#eadfc9] bg-white p-4 shadow-[0_8px_30px_rgba(94,72,34,0.04)] sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            {/* Search */}
            <div className="relative w-full xl:max-w-md">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a39278]"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search orders or products..."
                className="h-12 w-full rounded-2xl border border-[#eadfc9] bg-[#fffdf9] pl-11 pr-4 text-sm text-[#33291c] outline-none transition placeholder:text-[#aa9d88] focus:border-[#c6a158] focus:ring-4 focus:ring-[#c6a158]/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#907f65] hover:bg-[#f7f1e5]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) =>
                  setSort(
                    e.target.value as SortValue
                  )
                }
                className="h-12 w-full appearance-none rounded-2xl border border-[#eadfc9] bg-[#fffdf9] px-4 pr-10 text-sm font-medium text-[#51432e] outline-none focus:border-[#c6a158] focus:ring-4 focus:ring-[#c6a158]/10 sm:w-[190px]"
              >
                <option value="newest">
                  Newest First
                </option>
                <option value="oldest">
                  Oldest First
                </option>
                <option value="highest">
                  Highest Amount
                </option>
                <option value="lowest">
                  Lowest Amount
                </option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#907f65]"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <FilterButton
              active={filter === "all"}
              onClick={() => setFilter("all")}
            >
              All Orders
            </FilterButton>

            <FilterButton
              active={filter === "placed"}
              onClick={() => setFilter("placed")}
            >
              Placed
            </FilterButton>

            <FilterButton
              active={filter === "processing"}
              onClick={() =>
                setFilter("processing")
              }
            >
              Processing
            </FilterButton>

            <FilterButton
              active={filter === "shipped"}
              onClick={() => setFilter("shipped")}
            >
              Shipped
            </FilterButton>

            <FilterButton
              active={filter === "out_for_delivery"}
              onClick={() =>
                setFilter("out_for_delivery")
              }
            >
              Out for Delivery
            </FilterButton>

            <FilterButton
              active={filter === "delivered"}
              onClick={() =>
                setFilter("delivered")
              }
            >
              Delivered
            </FilterButton>

            <FilterButton
              active={filter === "cancelled"}
              onClick={() =>
                setFilter("cancelled")
              }
            >
              Cancelled
            </FilterButton>
          </div>
        </section>

        {/* ===============================================
            RESULT COUNT
        =============================================== */}

        {!loading && (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#857863]">
              Showing{" "}
              <span className="font-semibold text-[#493b28]">
                {filteredOrders.length}
              </span>{" "}
              {filteredOrders.length === 1
                ? "order"
                : "orders"}
            </p>

            {(search ||
              filter !== "all" ||
              sort !== "newest") && (
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#a47a2c] hover:text-[#7e5c20]"
              >
                <RefreshCw size={14} />
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* ===============================================
            LOADING
        =============================================== */}

        {loading ? (
          <div className="mt-5 space-y-4">
            {[1, 2, 3].map((item) => (
              <OrderSkeleton key={item} />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          /* =============================================
             EMPTY
          ============================================= */

          <section className="mt-5 rounded-[28px] border border-[#eadfc9] bg-white px-5 py-16 text-center shadow-[0_8px_30px_rgba(94,72,34,0.04)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fbf5e6] text-[#b48a3d]">
              <ShoppingBag
                size={34}
                strokeWidth={1.7}
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#2c2318]">
              {search ||
              filter !== "all"
                ? "No matching orders"
                : "No orders yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#857863]">
              {search ||
              filter !== "all"
                ? "Try changing your search or filter to find what you're looking for."
                : "Your completed purchases will appear here once you place your first order."}
            </p>

            {search ||
            filter !== "all" ? (
              <button
                type="button"
                onClick={clearSearch}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#b9975b] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(185,151,91,0.22)] transition hover:bg-[#a98449]"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                href="/dashboard/products"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#b9975b] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(185,151,91,0.22)] transition hover:bg-[#a98449]"
              >
                <ShoppingBag size={16} />
                Start Shopping
              </Link>
            )}
          </section>
        ) : (
          /* =============================================
             ORDERS
          ============================================= */

          <div className="mt-5 space-y-4">
            {filteredOrders.map(
              (order, orderIndex) => {
                const status = getStatusConfig(
                  order.status
                );

                const StatusIcon = status.icon;

                const progress =
                  getOrderProgress(
                    order.status
                  );

                const isExpanded =
                  expandedOrder === order.id;

                const items =
                  order.order_items || [];

                const itemCount = items.reduce(
                  (sum, item) =>
                    sum +
                    Number(item.quantity || 0),
                  0
                );

                const addressText =
                  getAddressText(
                    order.shipping_address
                  );

                return (
                  <article
                    key={`${order.id}-${order.created_at}-${orderIndex}`}
                    className="group overflow-hidden rounded-[26px] border border-[#eadfc9] bg-white shadow-[0_8px_30px_rgba(94,72,34,0.045)] transition duration-300 hover:-translate-y-[1px] hover:shadow-[0_14px_40px_rgba(94,72,34,0.08)]"
                  >
                    {/* Order Header */}
                    <div className="border-b border-[#f0e8da] px-4 py-4 sm:px-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fbf5e7] text-[#ad843b]">
                            <Package
                              size={19}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-[#302619]">
                                Order #
                                {order.id
                                  .slice(0, 12)
                                  .toUpperCase()}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  copyOrderId(
                                    order.id
                                  )
                                }
                                className="flex h-7 items-center gap-1 rounded-lg border border-[#eadfc9] px-2 text-[#92754b] transition hover:bg-[#fffaf0]"
                              >
                                {copiedOrder ===
                                order.id ? (
                                  <>
                                    <Check
                                      size={12}
                                    />
                                    <span className="text-[11px] font-semibold">
                                      Copied
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy
                                      size={12}
                                    />
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#8b7c67]">
                              <span>
                                {formatDate(
                                  order.created_at
                                )}
                              </span>

                              <span className="h-1 w-1 rounded-full bg-[#cdbd9f]" />

                              <span>
                                {itemCount}{" "}
                                {itemCount === 1
                                  ? "item"
                                  : "items"}
                              </span>

                              <span className="h-1 w-1 rounded-full bg-[#cdbd9f]" />

                              <span>
                                {formatDateTime(
                                  order.created_at
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 lg:justify-end">
                          <div className="text-left lg:text-right">
                            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#998a73]">
                              Order Total
                            </p>

                            <p className="mt-1 text-lg font-bold text-[#2a2116]">
                              {formatPrice(
                                order.total_amount
                              )}
                            </p>
                          </div>

                          <div
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
                          >
                            <StatusIcon
                              size={13}
                            />
                            {status.label}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Items */}
                    <div className="px-4 py-4 sm:px-6">
                      {items.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#e6dac5] bg-[#fffdf9] p-5 text-center text-sm text-[#8c7c65]">
                          Product details are not
                          available for this order.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {items.map(
                            (item, itemIndex) => (
                              <div
                                key={
                                  item.id ||
                                  `${item.product_id}-${itemIndex}`
                                }
                                className="group flex gap-3 rounded-2xl border border-[#f0e8da] bg-[#fffdf9] p-3 transition hover:border-[#e5d4b3] hover:bg-[#fffaf1] sm:p-4"
                              >
                                {/* Image */}
                                <Link
                                  href={`/dashboard/products/${item.product_id}`}
                                  className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-xl border border-[#eadfc9] bg-white sm:h-[110px] sm:w-[110px]"
                                >
                                  <ProductImage
                                    src={
                                      item.image_url
                                    }
                                    alt={
                                      item.product_name
                                    }
                                    priority={
                                      orderIndex ===
                                        0 &&
                                      itemIndex ===
                                        0
                                    }
                                  />
                                </Link>

                                {/* Info */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                                    <div className="min-w-0">
                                      <Link
                                        href={`/dashboard/products/${item.product_id}`}
                                        className="line-clamp-2 text-sm font-bold text-[#33291c] transition hover:text-[#a47a2c] sm:text-base"
                                      >
                                        {
                                          item.product_name
                                        }
                                      </Link>

                                      <p className="mt-1 text-xs text-[#91816a]">
                                        Product ID:{" "}
                                        {
                                          item.product_id
                                        }
                                      </p>
                                    </div>

                                    <p className="shrink-0 text-sm font-bold text-[#2e2519]">
                                      {formatPrice(
                                        Number(
                                          item.price ||
                                            0
                                        ) *
                                          Number(
                                            item.quantity ||
                                              1
                                          )
                                      )}
                                    </p>
                                  </div>

                                  <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <span className="rounded-lg bg-[#f6efe1] px-2.5 py-1 text-xs font-semibold text-[#80653c]">
                                      Qty:{" "}
                                      {
                                        item.quantity
                                      }
                                    </span>

                                    <span className="text-xs text-[#8e7e67]">
                                      {formatPrice(
                                        item.price
                                      )}{" "}
                                      each
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Timeline */}
                    {isExpanded &&
                      progress >= 0 && (
                        <div className="border-t border-[#f0e8da] bg-[#fffdf9] px-4 py-5 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-[#302619]">
                                Delivery Progress
                              </p>

                              <p className="mt-1 text-xs text-[#8c7c67]">
                                Track your order from
                                placement to delivery.
                              </p>
                            </div>

                            <Truck
                              size={19}
                              className="text-[#b28a43]"
                            />
                          </div>

                          <div className="mt-6 overflow-x-auto pb-2">
                            <div className="min-w-[600px]">
                              <div className="relative flex justify-between">
                                <div className="absolute left-[8%] right-[8%] top-4 h-[2px] bg-[#e9deca]" />

                                <div
                                  className="absolute left-[8%] top-4 h-[2px] bg-[#b9975b] transition-all duration-700"
                                  style={{
                                    width:
                                      progress ===
                                        0
                                        ? "0%"
                                        : progress ===
                                            1
                                          ? "25%"
                                          : progress ===
                                              2
                                            ? "50%"
                                            : progress ===
                                                3
                                              ? "75%"
                                              : "100%",
                                  }}
                                />

                                {[
                                  {
                                    label: "Placed",
                                    icon: ShoppingBag,
                                  },
                                  {
                                    label: "Processing",
                                    icon: Clock3,
                                  },
                                  {
                                    label: "Shipped",
                                    icon: Package,
                                  },
                                  {
                                    label:
                                      "Out for Delivery",
                                    icon: Truck,
                                  },
                                  {
                                    label: "Delivered",
                                    icon: Check,
                                  },
                                ].map(
                                  (
                                    step,
                                    index
                                  ) => {
                                    const StepIcon =
                                      step.icon;

                                    const active =
                                      progress >=
                                      index;

                                    return (
                                      <div
                                        key={
                                          step.label
                                        }
                                        className="relative z-10 flex w-28 flex-col items-center text-center"
                                      >
                                        <div
                                          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${
                                            active
                                              ? "border-[#b9975b] bg-[#b9975b] text-white"
                                              : "border-[#dfd2ba] bg-white text-[#a9987e]"
                                          }`}
                                        >
                                          <StepIcon
                                            size={14}
                                          />
                                        </div>

                                        <p
                                          className={`mt-2 text-[11px] font-semibold ${
                                            active
                                              ? "text-[#6e5329]"
                                              : "text-[#9a8c78]"
                                          }`}
                                        >
                                          {
                                            step.label
                                          }
                                        </p>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="grid gap-4 border-t border-[#f0e8da] bg-white px-4 py-5 sm:px-6 lg:grid-cols-2">
                        {/* Payment */}
                        <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf9] p-4">
                          <div className="flex items-center gap-2">
                            <CreditCard
                              size={17}
                              className="text-[#b38a42]"
                            />

                            <h3 className="text-sm font-bold text-[#382d20]">
                              Payment Details
                            </h3>
                          </div>

                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between gap-4">
                              <span className="text-[#8b7b65]">
                                Payment Method
                              </span>

                              <span className="font-semibold text-[#4a3b28]">
                                {order.payment_method ||
                                  "Online / Checkout"}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span className="text-[#8b7b65]">
                                Items
                              </span>

                              <span className="font-semibold text-[#4a3b28]">
                                {itemCount}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span className="text-[#8b7b65]">
                                Order Date
                              </span>

                              <span className="font-semibold text-[#4a3b28]">
                                {formatDate(
                                  order.created_at
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf9] p-4">
                          <div className="flex items-center gap-2">
                            <MapPin
                              size={17}
                              className="text-[#b38a42]"
                            />

                            <h3 className="text-sm font-bold text-[#382d20]">
                              Delivery Address
                            </h3>
                          </div>

                          <div className="mt-4">
                            {typeof order.shipping_address ===
                            "object" &&
                            order.shipping_address ? (
                              <>
                                {order
                                  .shipping_address
                                  .name && (
                                  <p className="text-sm font-bold text-[#433524]">
                                    {
                                      order
                                        .shipping_address
                                        .name
                                    }
                                  </p>
                                )}

                                {order
                                  .shipping_address
                                  .phone && (
                                  <p className="mt-1 text-xs text-[#81715b]">
                                    {
                                      order
                                        .shipping_address
                                        .phone
                                    }
                                  </p>
                                )}

                                <p className="mt-2 text-sm leading-6 text-[#786b59]">
                                  {addressText ||
                                    "Address details unavailable"}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm leading-6 text-[#786b59]">
                                {addressText ||
                                  "Address details unavailable"}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf9] p-4 lg:col-span-2">
                          <div className="flex items-center gap-2">
                            <Sparkles
                              size={17}
                              className="text-[#b38a42]"
                            />

                            <h3 className="text-sm font-bold text-[#382d20]">
                              Price Summary
                            </h3>
                          </div>

                          <div className="mt-4 max-w-md space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#8b7b65]">
                                Subtotal
                              </span>

                              <span className="font-semibold text-[#4a3b28]">
                                {formatPrice(
                                  order.subtotal ??
                                    Number(
                                      order.total_amount ||
                                        0
                                    )
                                )}
                              </span>
                            </div>

                            {Number(
                              order.delivery_charge ||
                                0
                            ) > 0 && (
                              <div className="flex justify-between">
                                <span className="text-[#8b7b65]">
                                  Delivery
                                </span>

                                <span className="font-semibold text-[#4a3b28]">
                                  {formatPrice(
                                    order.delivery_charge
                                  )}
                                </span>
                              </div>
                            )}

                            {Number(
                              order.discount || 0
                            ) > 0 && (
                              <div className="flex justify-between text-emerald-700">
                                <span>
                                  Discount
                                </span>

                                <span className="font-semibold">
                                  -
                                  {formatPrice(
                                    order.discount
                                  )}
                                </span>
                              </div>
                            )}

                            <div className="my-3 border-t border-[#eadfc9]" />

                            <div className="flex justify-between">
                              <span className="font-bold text-[#382d20]">
                                Total
                              </span>

                              <span className="text-base font-bold text-[#a2772d]">
                                {formatPrice(
                                  order.total_amount
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex flex-col gap-3 border-t border-[#f0e8da] bg-[#fffdfb] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="flex items-center gap-2 text-xs text-[#8c7c67]">
                        <ShieldCheck
                          size={15}
                          className="text-[#a98449]"
                        />

                        <span>
                          Secure order with PrimeCart
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOrder(
                              isExpanded
                                ? null
                                : order.id
                            )
                          }
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-4 text-xs font-bold text-[#66543b] transition hover:border-[#c9a65d] hover:bg-[#fffaf0]"
                        >
                          <Eye size={15} />

                          {isExpanded
                            ? "Hide Details"
                            : "View Details"}

                          {isExpanded ? (
                            <ChevronUp
                              size={14}
                            />
                          ) : (
                            <ChevronDown
                              size={14}
                            />
                          )}
                        </button>

                        {progress >= 0 &&
                          progress < 4 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedOrder(
                                  order.id
                                )
                              }
                              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#b9975b] px-4 text-xs font-bold text-white shadow-[0_6px_16px_rgba(185,151,91,0.18)] transition hover:bg-[#a98449]"
                            >
                              <Truck size={15} />
                              Track Order
                            </button>
                          )}

                        {items.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              buyAgain(order)
                            }
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d9c294] bg-[#fffaf0] px-4 text-xs font-bold text-[#986f27] transition hover:bg-[#f8efd9]"
                          >
                            <RefreshCw
                              size={15}
                            />
                            Buy Again
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}

        {/* ===============================================
            TRUST SECTION
        =============================================== */}

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          <TrustCard
            icon={ShieldCheck}
            title="Secure Orders"
            description="Your shopping experience is protected."
          />

          <TrustCard
            icon={Truck}
            title="Reliable Delivery"
            description="Track your order every step of the way."
          />

          <TrustCard
            icon={Zap}
            title="PrimeCart Support"
            description="We're here whenever you need help."
          />
        </section>

        {/* Bottom spacing */}
        <div className="h-6" />
      </div>

      <style jsx global>{`
        @keyframes orderFadeUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        article {
          animation: orderFadeUp 0.45s ease-out both;
        }

        ::selection {
          background: rgba(185, 151, 91, 0.22);
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  compact = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  compact?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf9] p-4 transition hover:border-[#d8c39b] hover:shadow-[0_8px_24px_rgba(94,72,34,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8f0df] text-[#b18a47]">
          <Icon size={17} />
        </span>

        <Sparkles
          size={14}
          className="text-[#d1b57b]"
        />
      </div>

      <p className="mt-4 text-xs font-medium text-[#8e7e67]">
        {label}
      </p>

      <p
        className={`mt-1 font-bold text-[#302619] ${
          compact
            ? "text-base sm:text-lg"
            : "text-xl sm:text-2xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
        active
          ? "bg-[#b9975b] text-white shadow-[0_5px_14px_rgba(185,151,91,0.18)]"
          : "border border-[#eadfc9] bg-white text-[#78664a] hover:border-[#d6c092] hover:bg-[#fffaf0]"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   TRUST CARD
========================================================= */

function TrustCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#eadfc9] bg-white p-5 shadow-[0_6px_22px_rgba(94,72,34,0.035)]">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fbf5e7] text-[#ae843b]">
          <Icon size={18} />
        </span>

        <div>
          <h3 className="text-sm font-bold text-[#382d20]">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-[#8c7c67]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function OrderSkeleton() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-[#eadfc9] bg-white">
      <div className="animate-pulse p-5">
        <div className="flex gap-4">
          <div className="h-11 w-11 rounded-2xl bg-[#eee7d9]" />

          <div className="flex-1">
            <div className="h-4 w-48 rounded bg-[#eee7d9]" />
            <div className="mt-2 h-3 w-64 rounded bg-[#f1eadf]" />
          </div>

          <div className="hidden h-8 w-24 rounded-full bg-[#eee7d9] sm:block" />
        </div>

        <div className="mt-5 space-y-3">
          <div className="h-28 rounded-2xl bg-[#f7f2e9]" />
          <div className="h-28 rounded-2xl bg-[#f7f2e9]" />
        </div>

        <div className="mt-4 h-12 rounded-xl bg-[#f7f2e9]" />
      </div>
    </div>
  );
}
