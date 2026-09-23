"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
  image_url: string | null;
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

  shipping_address?: OrderAddress | null;

  order_items?: OrderItem[];
};

type LocalOrder = {
  id: string;
  createdAt: string;
  status: string;
  paymentMethod?: string;
  total: number;
  subtotal?: number;
  delivery?: number;
  discount?: number;
  address?: OrderAddress | null;
  items: OrderItem[];
};

type StatusConfig = {
  label: string;
  icon: typeof CheckCircle2;
  badgeClass: string;
  iconClass: string;
};

type SortOption =
  | "newest"
  | "oldest"
  | "highest"
  | "lowest";

function getImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;

  const value = imageUrl.trim();

  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  ) {
    return value;
  }

  return `/${value}`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatDateTime(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function normalizeStatus(status: string) {
  return String(status || "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function getStatusConfig(status: string): StatusConfig {
  const normalized = normalizeStatus(status);

  if (
    normalized === "delivered" ||
    normalized === "completed"
  ) {
    return {
      label: "Delivered",
      icon: CheckCircle2,
      badgeClass:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      iconClass: "text-emerald-600",
    };
  }

  if (
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return {
      label: "Cancelled",
      icon: XCircle,
      badgeClass:
        "border-red-200 bg-red-50 text-red-700",
      iconClass: "text-red-600",
    };
  }

  if (
    normalized === "out_for_delivery" ||
    normalized === "outfordelivery"
  ) {
    return {
      label: "Out for Delivery",
      icon: Truck,
      badgeClass:
        "border-blue-200 bg-blue-50 text-blue-700",
      iconClass: "text-blue-600",
    };
  }

  if (normalized === "shipped") {
    return {
      label: "Shipped",
      icon: Truck,
      badgeClass:
        "border-blue-200 bg-blue-50 text-blue-700",
      iconClass: "text-blue-600",
    };
  }

  if (
    normalized === "processing" ||
    normalized === "confirmed"
  ) {
    return {
      label:
        normalized === "confirmed"
          ? "Confirmed"
          : "Processing",
      icon: Package,
      badgeClass:
        "border-purple-200 bg-purple-50 text-purple-700",
      iconClass: "text-purple-600",
    };
  }

  if (normalized === "pending") {
    return {
      label: "Pending",
      icon: Clock3,
      badgeClass:
        "border-orange-200 bg-orange-50 text-orange-700",
      iconClass: "text-orange-600",
    };
  }

  return {
    label: "Order Placed",
    icon: Clock3,
    badgeClass:
      "border-amber-200 bg-amber-50 text-amber-700",
    iconClass: "text-amber-600",
  };
}

function getOrderProgress(status: string) {
  const normalized = normalizeStatus(status);

  if (
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return -1;
  }

  if (
    normalized === "delivered" ||
    normalized === "completed"
  ) {
    return 5;
  }

  if (
    normalized === "out_for_delivery" ||
    normalized === "outfordelivery"
  ) {
    return 4;
  }

  if (normalized === "shipped") {
    return 3;
  }

  if (
    normalized === "processing" ||
    normalized === "confirmed"
  ) {
    return 2;
  }

  return 1;
}

function getLocalOrderAsOrder(
  order: LocalOrder
): Order {
  return {
    id: order.id,
    user_id: "local",
    status: order.status || "Placed",
    total_amount: Number(order.total) || 0,
    created_at: order.createdAt,
    payment_method:
      order.paymentMethod || null,
    subtotal:
      order.subtotal !== undefined
        ? Number(order.subtotal)
        : null,
    delivery_charge:
      order.delivery !== undefined
        ? Number(order.delivery)
        : null,
    discount:
      order.discount !== undefined
        ? Number(order.discount)
        : null,
    shipping_address:
      order.address || null,
    order_items: order.items || [],
  };
}

function getOrderSignature(order: Order) {
  return `${order.id}|${new Date(
    order.created_at
  ).getTime()}`;
}

function getPaymentLabel(payment?: string | null) {
  if (!payment) return "Payment details unavailable";

  return payment
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getAddressText(
  address?: OrderAddress | null
) {
  if (!address) return "";

  return [
    address.address,
    address.city,
    address.state,
    address.pincode
      ? `- ${address.pincode}`
      : "",
  ]
    .filter(Boolean)
    .join(", ");
}

export default function OrdersPage() {
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState("all");

  const [sort, setSort] =
    useState<SortOption>("newest");

  const [expandedOrder, setExpandedOrder] =
    useState<string | null>(null);

  const [showTimeline, setShowTimeline] =
    useState<string | null>(null);

  const [copiedOrder, setCopiedOrder] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [cartMessage, setCartMessage] =
    useState<string | null>(null);

  const loadOrders = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage(null);

        /*
         * ============================================
         * LOCAL ORDERS
         * ============================================
         */

        let localOrders: Order[] = [];

        try {
          const raw =
            localStorage.getItem(
              "primecart-orders"
            );

          if (raw) {
            const parsed = JSON.parse(raw);

            if (Array.isArray(parsed)) {
              localOrders = parsed
                .filter(Boolean)
                .map(
                  (order: LocalOrder) =>
                    getLocalOrderAsOrder(
                      order
                    )
                );
            }
          }
        } catch (error) {
          console.error(
            "Local orders error:",
            error
          );
        }

        /*
         * ============================================
         * SUPABASE ORDERS
         * ============================================
         */

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href =
            "/auth/login";
          return;
        }

        const { data, error } =
          await supabase
            .from("orders")
            .select(
              `
                id,
                user_id,
                status,
                total_amount,
                created_at,
                payment_method,
                delivery_charge,
                discount,
                subtotal,
                shipping_address,
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
          console.error(
            "Supabase orders error:",
            error
          );

          if (localOrders.length === 0) {
            setErrorMessage(
              "We couldn't load your orders right now. Please try again."
            );
          }
        }

        const databaseOrders =
          (data as Order[]) || [];

        /*
         * ============================================
         * MERGE LOCAL + DATABASE ORDERS
         * ============================================
         */

        const mergedMap = new Map<
          string,
          Order
        >();

        [
          ...localOrders,
          ...databaseOrders,
        ].forEach((order) => {
          const key =
            getOrderSignature(order);

          const existing =
            mergedMap.get(key);

          /*
           * Prefer database version because it
           * contains authoritative server data.
           */
          if (
            !existing ||
            (existing.user_id === "local" &&
              order.user_id !== "local")
          ) {
            mergedMap.set(key, order);
          }
        });

        const mergedOrders = Array.from(
          mergedMap.values()
        ).sort(
          (a, b) =>
            new Date(
              b.created_at
            ).getTime() -
            new Date(
              a.created_at
            ).getTime()
        );

        setOrders(mergedOrders);
      } catch (error) {
        console.error(
          "Failed to load orders:",
          error
        );

        setErrorMessage(
          "Something went wrong while loading your orders."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    loadOrders();

    function handleStorageChange() {
      loadOrders(true);
    }

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, [loadOrders]);

  /*
   * ============================================
   * FILTER + SEARCH + SORT
   * ============================================
   */

  const filteredOrders = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    const result = orders.filter(
      (order) => {
        const matchesSearch =
          !query ||
          order.id
            .toLowerCase()
            .includes(query) ||
          order.order_items?.some(
            (item) =>
              item.product_name
                .toLowerCase()
                .includes(query)
          ) ||
          String(
            order.payment_method || ""
          )
            .toLowerCase()
            .includes(query) ||
          normalizeStatus(
            order.status
          ).includes(query);

        const normalized =
          normalizeStatus(
            order.status
          );

        let matchesFilter = true;

        if (filter === "pending") {
          matchesFilter = [
            "pending",
            "placed",
            "order_placed",
          ].includes(normalized);
        }

        if (filter === "processing") {
          matchesFilter = [
            "processing",
            "confirmed",
          ].includes(normalized);
        }

        if (filter === "shipped") {
          matchesFilter = [
            "shipped",
            "out_for_delivery",
            "outfordelivery",
          ].includes(normalized);
        }

        if (filter === "delivered") {
          matchesFilter = [
            "delivered",
            "completed",
          ].includes(normalized);
        }

        if (filter === "cancelled") {
          matchesFilter = [
            "cancelled",
            "canceled",
          ].includes(normalized);
        }

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );

    return [...result].sort(
      (a, b) => {
        const dateA =
          new Date(
            a.created_at
          ).getTime();

        const dateB =
          new Date(
            b.created_at
          ).getTime();

        if (sort === "newest") {
          return dateB - dateA;
        }

        if (sort === "oldest") {
          return dateA - dateB;
        }

        if (sort === "highest") {
          return (
            Number(b.total_amount) -
            Number(a.total_amount)
          );
        }

        return (
          Number(a.total_amount) -
          Number(b.total_amount)
        );
      }
    );
  }, [
    orders,
    search,
    filter,
    sort,
  ]);

  /*
   * ============================================
   * STATS
   * ============================================
   */

  const totalOrders =
    orders.length;

  const deliveredOrders =
    orders.filter((order) =>
      [
        "delivered",
        "completed",
      ].includes(
        normalizeStatus(
          order.status
        )
      )
    ).length;

  const cancelledOrders =
    orders.filter((order) =>
      [
        "cancelled",
        "canceled",
      ].includes(
        normalizeStatus(
          order.status
        )
      )
    ).length;

  const activeOrders =
    orders.filter((order) =>
      ![
        "delivered",
        "completed",
        "cancelled",
        "canceled",
      ].includes(
        normalizeStatus(
          order.status
        )
      )
    ).length;

  const totalSpent =
    orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total_amount || 0
        ),
      0
    );

  const totalSaved =
    orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.discount || 0
        ),
      0
    );

  /*
   * ============================================
   * ACTIONS
   * ============================================
   */

  async function copyOrderId(
    orderId: string
  ) {
    try {
      await navigator.clipboard.writeText(
        orderId
      );

      setCopiedOrder(orderId);

      window.setTimeout(() => {
        setCopiedOrder(null);
      }, 1800);
    } catch (error) {
      console.error(
        "Unable to copy order ID:",
        error
      );
    }
  }

  function clearFilters() {
    setSearch("");
    setFilter("all");
    setSort("newest");
  }

  function buyAgain(order: Order) {
    try {
      const existingCartRaw =
        localStorage.getItem(
          "primecart-cart"
        );

      const existingCart =
        existingCartRaw
          ? JSON.parse(
              existingCartRaw
            )
          : [];

      const cart = Array.isArray(
        existingCart
      )
        ? [...existingCart]
        : [];

      let addedCount = 0;

      (order.order_items || []).forEach(
        (item) => {
          if (!item.product_id) return;

          const existingIndex =
            cart.findIndex(
              (cartItem: {
                id?: string;
                product_id?: string;
              }) =>
                String(
                  cartItem.id ??
                    cartItem.product_id
                ) ===
                String(
                  item.product_id
                )
            );

          if (existingIndex >= 0) {
            const current =
              Number(
                cart[existingIndex]
                  .quantity || 0
              );

            cart[
              existingIndex
            ] = {
              ...cart[
                existingIndex
              ],
              quantity:
                current +
                Number(
                  item.quantity || 1
                ),
            };
          } else {
            cart.push({
              id: item.product_id,
              product_id:
                item.product_id,
              name:
                item.product_name,
              product_name:
                item.product_name,
              price:
                Number(
                  item.price || 0
                ),
              quantity:
                Number(
                  item.quantity || 1
                ),
              image_url:
                item.image_url ||
                null,
              image:
                item.image_url ||
                null,
            });
          }

          addedCount += 1;
        }
      );

      localStorage.setItem(
        "primecart-cart",
        JSON.stringify(cart)
      );

      window.dispatchEvent(
        new Event("storage")
      );

      setCartMessage(
        addedCount > 0
          ? `${addedCount} product${
              addedCount > 1
                ? "s"
                : ""
            } added to your cart.`
          : "Products from this order are unavailable for reorder."
      );

      window.setTimeout(() => {
        setCartMessage(null);
      }, 3000);
    } catch (error) {
      console.error(
        "Buy again error:",
        error
      );

      setCartMessage(
        "Unable to add products to cart."
      );
    }
  }

  /*
   * ============================================
   * FILTER COUNTS
   * ============================================
   */

  const getCount = (
    statuses: string[]
  ) =>
    orders.filter((order) =>
      statuses.includes(
        normalizeStatus(
          order.status
        )
      )
    ).length;

  const filters = [
    {
      value: "all",
      label: "All",
      count: totalOrders,
    },
    {
      value: "pending",
      label: "Placed",
      count: getCount([
        "pending",
        "placed",
        "order_placed",
      ]),
    },
    {
      value: "processing",
      label: "Processing",
      count: getCount([
        "processing",
        "confirmed",
      ]),
    },
    {
      value: "shipped",
      label: "Shipped",
      count: getCount([
        "shipped",
        "out_for_delivery",
        "outfordelivery",
      ]),
    },
    {
      value: "delivered",
      label: "Delivered",
      count: deliveredOrders,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      count: cancelledOrders,
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#17130d]">
      {/* ==========================================
          TOAST
      ========================================== */}

      {cartMessage && (
        <div className="fixed bottom-5 left-1/2 z-[100] w-[calc(100%-32px)] max-w-md -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-3 rounded-2xl border border-[#d9c79f] bg-white px-4 py-3 shadow-[0_15px_40px_rgba(50,35,10,0.18)]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7f0df] text-[#977538]">
              <CheckCircle size={18} />
            </div>

            <p className="flex-1 text-xs font-semibold text-[#423a30]">
              {cartMessage}
            </p>

            <Link
              href="/dashboard/cart"
              className="rounded-lg bg-[#b9975b] px-3 py-2 text-[10px] font-bold text-white hover:bg-[#977538]"
            >
              View Cart
            </Link>
          </div>
        </div>
      )}

      {/* ==========================================
          HEADER
      ========================================== */}

      <header className="sticky top-0 z-50 border-b border-[#eadfc9] bg-white/90 shadow-[0_4px_25px_rgba(50,35,10,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#977538] transition-all duration-300 hover:-translate-x-0.5 hover:bg-[#fffaf0] hover:shadow-sm"
            >
              <ArrowLeft
                size={18}
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
              />
            </Link>

            <div>
              <h1 className="text-base font-bold sm:text-lg">
                My Orders
              </h1>

              <p className="hidden text-[11px] text-[#887d6c] sm:block">
                Track and manage your PrimeCart purchases
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                loadOrders(true)
              }
              disabled={refreshing}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#806b4a] transition hover:bg-[#fffaf0] disabled:opacity-60 sm:w-auto sm:gap-2 sm:px-3"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden text-xs font-semibold sm:inline">
                Refresh
              </span>
            </button>

            <Link
              href="/dashboard/products"
              className="hidden items-center gap-2 rounded-xl bg-[#b9975b] px-4 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(185,151,91,0.18)] transition-all duration-300 hover:bg-[#977538] hover:shadow-[0_10px_25px_rgba(185,151,91,0.25)] sm:flex"
            >
              <ShoppingBag size={16} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* ==========================================
            HERO
        ========================================== */}

        <section className="relative mb-6 overflow-hidden rounded-[28px] border border-[#eadfc9] bg-white shadow-[0_15px_45px_rgba(70,45,10,0.06)]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#f7edd8] opacity-70 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-[#f8f2e6] blur-3xl" />

          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
              <div className="animate-in fade-in slide-in-from-left-3 duration-500">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#eadfc9] bg-[#fffaf0] px-3 py-1.5">
                  <Sparkles
                    size={13}
                    className="text-[#b9975b]"
                  />

                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#977538]">
                    PrimeCart Orders
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                  Your Orders
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#756b5d]">
                  Everything you&apos;ve purchased
                  in one place. Track deliveries,
                  revisit products and manage
                  your order history.
                </p>

                {totalSaved > 0 && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#f7f4e9] px-3 py-2">
                    <BadgeCheck
                      size={15}
                      className="text-emerald-600"
                    />

                    <span className="text-[10px] font-semibold text-[#6f6659]">
                      You&apos;ve saved
                    </span>

                    <strong className="text-xs text-emerald-600">
                      {formatPrice(
                        totalSaved
                      )}
                    </strong>
                  </div>
                )}
              </div>

              {/* STATS */}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[590px]">
                <div className="group rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#887d6c]">
                      Orders
                    </span>

                    <Package
                      size={16}
                      className="text-[#b9975b]"
                    />
                  </div>

                  <p className="mt-2 text-xl font-extrabold">
                    {totalOrders}
                  </p>
                </div>

                <div className="group rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#887d6c]">
                      Active
                    </span>

                    <Truck
                      size={16}
                      className="text-blue-500"
                    />
                  </div>

                  <p className="mt-2 text-xl font-extrabold text-blue-600">
                    {activeOrders}
                  </p>
                </div>

                <div className="group rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#887d6c]">
                      Delivered
                    </span>

                    <CheckCircle2
                      size={16}
                      className="text-emerald-500"
                    />
                  </div>

                  <p className="mt-2 text-xl font-extrabold text-emerald-600">
                    {deliveredOrders}
                  </p>
                </div>

                <div className="group rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#887d6c]">
                      Spent
                    </span>

                    <BadgeCheck
                      size={16}
                      className="text-[#b9975b]"
                    />
                  </div>

                  <p className="mt-2 truncate text-lg font-extrabold text-[#977538]">
                    {formatPrice(
                      totalSpent
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            ERROR
        ========================================== */}

        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold">
                Unable to load some orders
              </p>

              <p className="mt-1 text-[11px] leading-5">
                {errorMessage}
              </p>
            </div>

            <button
              onClick={() =>
                loadOrders(true)
              }
              className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-red-700 shadow-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* ==========================================
            SEARCH / FILTER / SORT
        ========================================== */}

        <section className="mb-6 rounded-[22px] border border-[#eadfc9] bg-white p-4 shadow-[0_10px_30px_rgba(70,45,10,0.04)] sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-xl">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9c9180]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search order ID, product, payment or status..."
                  className="h-11 w-full rounded-xl border border-[#e3d9c8] bg-[#fffdf9] pl-10 pr-10 text-xs outline-none transition-all duration-300 placeholder:text-[#aaa091] focus:border-[#b9975b] focus:bg-white focus:ring-4 focus:ring-[#b9975b]/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#8e8374] hover:bg-[#f5f0e6]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(
                      e.target
                        .value as SortOption
                    )
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-[#e3d9c8] bg-[#fffdf9] px-4 pr-10 text-xs font-semibold text-[#655c50] outline-none focus:border-[#b9975b] focus:ring-4 focus:ring-[#b9975b]/10 sm:w-[180px]"
                >
                  <option value="newest">
                    Newest first
                  </option>

                  <option value="oldest">
                    Oldest first
                  </option>

                  <option value="highest">
                    Highest amount
                  </option>

                  <option value="lowest">
                    Lowest amount
                  </option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9c9180]"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map(
                (item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setFilter(
                        item.value
                      )
                    }
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[11px] font-bold transition-all duration-300 ${
                      filter === item.value
                        ? "border-[#b9975b] bg-[#b9975b] text-white shadow-[0_6px_18px_rgba(185,151,91,0.2)]"
                        : "border-[#e3d9c8] bg-white text-[#756b5d] hover:-translate-y-0.5 hover:border-[#cdb88d] hover:bg-[#fffaf0]"
                    }`}
                  >
                    {item.label}

                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                        filter ===
                        item.value
                          ? "bg-white/20"
                          : "bg-[#f5f0e6]"
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                )
              )}
            </div>

            {(search ||
              filter !== "all" ||
              sort !== "newest") && (
              <div className="flex items-center justify-between border-t border-[#eee6d8] pt-3">
                <p className="text-[10px] text-[#887d6c]">
                  Showing{" "}
                  <strong className="text-[#51483d]">
                    {
                      filteredOrders.length
                    }
                  </strong>{" "}
                  of{" "}
                  <strong className="text-[#51483d]">
                    {totalOrders}
                  </strong>{" "}
                  orders
                </p>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="text-[10px] font-bold text-[#977538] hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ==========================================
            LOADING
        ========================================== */}

        {loading && (
          <div className="space-y-5">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-[24px] border border-[#eadfc9] bg-white"
                >
                  <div className="animate-pulse">
                    <div className="border-b border-[#eee6d8] bg-[#fffdf8] p-5">
                      <div className="h-4 w-32 rounded bg-[#eee8dd]" />

                      <div className="mt-3 h-3 w-52 rounded bg-[#f2ede5]" />
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="flex gap-4">
                        <div className="h-24 w-24 rounded-2xl bg-[#eee8dd]" />

                        <div className="flex-1 space-y-3">
                          <div className="h-4 w-2/3 rounded bg-[#eee8dd]" />

                          <div className="h-3 w-1/3 rounded bg-[#f2ede5]" />

                          <div className="h-3 w-1/4 rounded bg-[#f2ede5]" />
                        </div>
                      </div>

                      <div className="h-16 rounded-xl bg-[#f5f0e6]" />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ==========================================
            EMPTY
        ========================================== */}

        {!loading &&
          filteredOrders.length ===
            0 && (
            <section className="rounded-[28px] border border-[#eadfc9] bg-white px-6 py-20 text-center shadow-[0_15px_40px_rgba(70,45,10,0.05)] animate-in fade-in zoom-in-95 duration-500">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#f7f0df] text-[#b9975b] shadow-sm">
                {orders.length ===
                0 ? (
                  <ShoppingBag
                    size={32}
                  />
                ) : (
                  <Search size={30} />
                )}
              </div>

              <h3 className="mt-6 text-xl font-extrabold">
                {orders.length ===
                0
                  ? "No orders yet"
                  : "No matching orders"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#817666]">
                {orders.length ===
                0
                  ? "Your PrimeCart purchases will appear here after you place an order."
                  : "Try a different search term, status or sorting option."}
              </p>

              {orders.length ===
              0 ? (
                <Link
                  href="/dashboard/products"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#b9975b] px-6 py-3 text-xs font-bold text-white shadow-[0_10px_25px_rgba(185,151,91,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#977538]"
                >
                  Start Shopping
                  <ArrowRight
                    size={15}
                  />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="mt-7 inline-flex items-center gap-2 rounded-xl border border-[#dcccaf] px-6 py-3 text-xs font-bold text-[#977538] transition hover:bg-[#fffaf0]"
                >
                  Clear Filters
                  <X size={15} />
                </button>
              )}
            </section>
          )}

        {/* ==========================================
            ORDER LIST
        ========================================== */}

        {!loading &&
          filteredOrders.length >
            0 && (
            <div className="space-y-5">
              {filteredOrders.map(
                (
                  order,
                  orderIndex
                ) => {
                  const status =
                    getStatusConfig(
                      order.status
                    );

                  const StatusIcon =
                    status.icon;

                  const items =
                    order.order_items ||
                    [];

                  const progress =
                    getOrderProgress(
                      order.status
                    );

                  const isExpanded =
                    expandedOrder ===
                    order.id;

                  const isTimelineOpen =
                    showTimeline ===
                    order.id;

                  const itemCount =
                    items.reduce(
                      (
                        total,
                        item
                      ) =>
                        total +
                        Number(
                          item.quantity ||
                            0
                        ),
                      0
                    );

                  const totalDiscount =
                    Number(
                      order.discount ||
                        0
                    );

                  return (
                    <article
                      key={`${order.id}-${order.created_at}`}
                      className="group overflow-hidden rounded-[24px] border border-[#eadfc9] bg-white shadow-[0_10px_35px_rgba(70,45,10,0.045)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(70,45,10,0.08)] animate-in fade-in slide-in-from-bottom-3 duration-500"
                      style={{
                        animationDelay: `${Math.min(
                          orderIndex *
                            70,
                          350
                        )}ms`,
                      }}
                    >
                      {/* ==================================
                          ORDER HEADER
                      ================================== */}

                      <div className="border-b border-[#eee6d8] bg-[#fffdf8] p-4 sm:p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#a19584]">
                                Order ID
                              </p>

                              <div className="mt-1 flex items-center gap-1.5">
                                <p className="font-mono text-xs font-bold text-[#423a30]">
                                  #
                                  {order.id
                                    .slice(
                                      0,
                                      12
                                    )
                                    .toUpperCase()}
                                </p>

                                <button
                                  type="button"
                                  onClick={() =>
                                    copyOrderId(
                                      order.id
                                    )
                                  }
                                  className="rounded-md p-1 text-[#9c9180] transition hover:bg-[#f5f0e6] hover:text-[#977538]"
                                  title="Copy order ID"
                                >
                                  {copiedOrder ===
                                  order.id ? (
                                    <Check
                                      size={
                                        12
                                      }
                                      className="text-emerald-600"
                                    />
                                  ) : (
                                    <Copy
                                      size={
                                        12
                                      }
                                    />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#a19584]">
                                Ordered On
                              </p>

                              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#655c50]">
                                <CalendarDays
                                  size={
                                    12
                                  }
                                  className="text-[#b9975b]"
                                />

                                {formatDate(
                                  order.created_at
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#a19584]">
                                Items
                              </p>

                              <p className="mt-1 text-xs font-semibold text-[#655c50]">
                                {
                                  itemCount
                                }{" "}
                                item
                                {itemCount !==
                                1
                                  ? "s"
                                  : ""}
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#a19584]">
                                Total
                              </p>

                              <p className="mt-1 text-xs font-extrabold text-[#977538]">
                                {formatPrice(
                                  Number(
                                    order.total_amount
                                  )
                                )}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold ${status.badgeClass}`}
                          >
                            <StatusIcon
                              size={13}
                              className={
                                status.iconClass
                              }
                            />

                            {status.label}
                          </div>
                        </div>
                      </div>

                      {/* ==================================
                          PRODUCT PREVIEW
                      ================================== */}

                      <div className="divide-y divide-[#eee6d8]">
                        {items.length >
                        0 ? (
                          <>
                            {items
                              .slice(
                                0,
                                3
                              )
                              .map(
                                (
                                  item
                                ) => {
                                  const image =
                                    getImageUrl(
                                      item.image_url
                                    );

                                  return (
                                    <div
                                      key={
                                        item.id
                                      }
                                      className="group/item flex gap-3 p-4 sm:gap-5 sm:p-5"
                                    >
                                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#eee6d8] bg-[#faf8f3] sm:h-24 sm:w-24">
                                        {image ? (
                                          <Image
                                            src={
                                              image
                                            }
                                            alt={
                                              item.product_name
                                            }
                                            fill
                                            className="object-contain p-2 transition-transform duration-500 group-hover/item:scale-105"
                                            sizes="96px"
                                          />
                                        ) : (
                                          <div className="flex h-full items-center justify-center text-[#aaa091]">
                                            <Package
                                              size={
                                                26
                                              }
                                            />
                                          </div>
                                        )}
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="min-w-0">
                                            <h3 className="line-clamp-2 text-sm font-bold text-[#28231d] sm:text-[15px]">
                                              {
                                                item.product_name
                                              }
                                            </h3>

                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                                              <span className="text-[10px] text-[#887d6c]">
                                                Qty:{" "}
                                                <strong className="text-[#4e463c]">
                                                  {
                                                    item.quantity
                                                  }
                                                </strong>
                                              </span>

                                              <span className="text-[10px] text-[#887d6c]">
                                                Unit:{" "}
                                                <strong className="text-[#4e463c]">
                                                  {formatPrice(
                                                    Number(
                                                      item.price
                                                    )
                                                  )}
                                                </strong>
                                              </span>
                                            </div>
                                          </div>

                                          {item.product_id && (
                                            <Link
                                              href={`/dashboard/products/${item.product_id}`}
                                              className="hidden shrink-0 items-center gap-1 rounded-lg border border-[#e3d9c8] px-3 py-2 text-[10px] font-bold text-[#756b5d] transition-all duration-300 hover:border-[#b9975b] hover:bg-[#fffaf0] hover:text-[#977538] sm:flex"
                                            >
                                              View Product
                                              <ArrowRight
                                                size={
                                                  12
                                                }
                                              />
                                            </Link>
                                          )}
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                          <p className="text-sm font-extrabold text-[#977538]">
                                            {formatPrice(
                                              Number(
                                                item.price
                                              ) *
                                                Number(
                                                  item.quantity
                                                )
                                            )}
                                          </p>

                                          {item.product_id && (
                                            <Link
                                              href={`/dashboard/products/${item.product_id}`}
                                              className="text-[10px] font-bold text-[#977538] sm:hidden"
                                            >
                                              View Product →
                                            </Link>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              )}

                            {items.length >
                              3 && (
                              <div className="flex items-center justify-center bg-[#fcfaf6] px-5 py-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedOrder(
                                      isExpanded
                                        ? null
                                        : order.id
                                    )
                                  }
                                  className="text-[10px] font-bold text-[#977538] hover:underline"
                                >
                                  +
                                  {items.length -
                                    3}{" "}
                                  more item
                                  {items.length -
                                    3 !==
                                  1
                                    ? "s"
                                    : ""}{" "}
                                  · View all
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="px-5 py-8 text-center text-xs text-[#887d6c]">
                            No product details available
                            for this order.
                          </div>
                        )}
                      </div>

                      {/* ==================================
                          TRACKING
                      ================================== */}

                      {isTimelineOpen && (
                        <div className="border-t border-[#eee6d8] bg-[#fcfaf6] px-5 py-6 sm:px-7 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                              <p className="text-xs font-extrabold">
                                Delivery Progress
                              </p>

                              <p className="mt-1 text-[10px] text-[#887d6c]">
                                Follow the current
                                stage of your PrimeCart
                                order.
                              </p>
                            </div>

                            <span className="text-[10px] font-bold text-[#977538]">
                              {status.label}
                            </span>
                          </div>

                          {progress ===
                          -1 ? (
                            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                              <XCircle
                                size={20}
                              />

                              <div>
                                <p className="text-xs font-bold">
                                  Order Cancelled
                                </p>

                                <p className="mt-1 text-[10px]">
                                  This order is no
                                  longer in the
                                  delivery process.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-5 sm:gap-0">
                              {[
                                {
                                  label: "Placed",
                                  icon: Check,
                                  step: 1,
                                },
                                {
                                  label: "Confirmed",
                                  icon: BadgeCheck,
                                  step: 2,
                                },
                                {
                                  label: "Shipped",
                                  icon: Truck,
                                  step: 3,
                                },
                                {
                                  label: "Out for Delivery",
                                  icon: Package,
                                  step: 4,
                                },
                                {
                                  label: "Delivered",
                                  icon: CheckCircle2,
                                  step: 5,
                                },
                              ].map(
                                (
                                  timeline,
                                  index
                                ) => {
                                  const Icon =
                                    timeline.icon;

                                  const completed =
                                    progress >=
                                    timeline.step;

                                  const isCurrent =
                                    progress ===
                                    timeline.step;

                                  return (
                                    <div
                                      key={
                                        timeline.label
                                      }
                                      className="relative"
                                    >
                                      <div className="flex flex-col items-center text-center">
                                        <div
                                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                                            completed
                                              ? "border-[#b9975b] bg-[#b9975b] text-white shadow-[0_6px_18px_rgba(185,151,91,0.2)]"
                                              : "border-[#ddd2c0] bg-white text-[#aaa091]"
                                          } ${
                                            isCurrent
                                              ? "ring-4 ring-[#b9975b]/10"
                                              : ""
                                          }`}
                                        >
                                          <Icon
                                            size={
                                              16
                                            }
                                          />
                                        </div>

                                        <p
                                          className={`mt-2 text-[9px] font-bold sm:text-[10px] ${
                                            completed
                                              ? "text-[#806536]"
                                              : "text-[#9c9180]"
                                          }`}
                                        >
                                          {
                                            timeline.label
                                          }
                                        </p>
                                      </div>

                                      {index <
                                        4 && (
                                        <div
                                          className={`absolute left-[calc(50%+25px)] right-[calc(-50%+25px)] top-5 hidden h-0.5 sm:block ${
                                            progress >=
                                            timeline.step +
                                              1
                                              ? "bg-[#b9975b]"
                                              : "bg-[#ddd2c0]"
                                          }`}
                                        />
                                      )}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          )}

                          <div className="mt-6 flex flex-col gap-2 rounded-xl bg-white p-3 text-[10px] text-[#756b5d] sm:flex-row sm:items-center">
                            <div className="flex items-center gap-2">
                              <Clock3
                                size={14}
                                className="text-[#b9975b]"
                              />

                              Order placed:
                            </div>

                            <strong className="text-[#4e463c]">
                              {formatDateTime(
                                order.created_at
                              )}
                            </strong>
                          </div>
                        </div>
                      )}

                      {/* ==================================
                          DETAILS
                      ================================== */}

                      {isExpanded && (
                        <div className="border-t border-[#eee6d8] bg-white px-5 py-5 sm:px-6 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="grid gap-4 md:grid-cols-3">
                            {/* PAYMENT */}

                            <div className="rounded-2xl border border-[#eadfc9] bg-[#fcfaf6] p-4">
                              <div className="flex items-center gap-2">
                                <WalletCards
                                  size={15}
                                  className="text-[#b9975b]"
                                />

                                <p className="text-xs font-bold">
                                  Payment Method
                                </p>
                              </div>

                              <p className="mt-3 text-xs font-semibold text-[#51483d]">
                                {getPaymentLabel(
                                  order.payment_method
                                )}
                              </p>

                              <p className="mt-1 text-[9px] text-[#968a79]">
                                Payment method used for
                                this order
                              </p>
                            </div>

                            {/* ADDRESS */}

                            <div className="rounded-2xl border border-[#eadfc9] bg-[#fcfaf6] p-4">
                              <div className="flex items-center gap-2">
                                <MapPin
                                  size={15}
                                  className="text-[#b9975b]"
                                />

                                <p className="text-xs font-bold">
                                  Delivery Address
                                </p>
                              </div>

                              {order.shipping_address ? (
                                <>
                                  <p className="mt-3 text-xs font-bold">
                                    {
                                      order
                                        .shipping_address
                                        .name
                                    }
                                  </p>

                                  <p className="mt-1 text-[10px] leading-4 text-[#756b5d]">
                                    {getAddressText(
                                      order.shipping_address
                                    )}
                                  </p>

                                  {order
                                    .shipping_address
                                    .phone && (
                                    <p className="mt-1 text-[10px] text-[#887d6c]">
                                      {
                                        order
                                          .shipping_address
                                          .phone
                                      }
                                    </p>
                                  )}
                                </>
                              ) : (
                                <p className="mt-3 text-[10px] text-[#887d6c]">
                                  Delivery address is not
                                  available for this order.
                                </p>
                              )}
                            </div>

                            {/* SUMMARY */}

                            <div className="rounded-2xl border border-[#eadfc9] bg-[#fcfaf6] p-4">
                              <div className="flex items-center gap-2">
                                <BadgeCheck
                                  size={15}
                                  className="text-[#b9975b]"
                                />

                                <p className="text-xs font-bold">
                                  Order Summary
                                </p>
                              </div>

                              <div className="mt-3 space-y-2 text-[10px]">
                                {order.subtotal !==
                                  undefined &&
                                  order.subtotal !==
                                    null && (
                                    <div className="flex justify-between">
                                      <span className="text-[#887d6c]">
                                        Subtotal
                                      </span>

                                      <span className="font-bold">
                                        {formatPrice(
                                          Number(
                                            order.subtotal
                                          )
                                        )}
                                      </span>
                                    </div>
                                  )}

                                {totalDiscount >
                                  0 && (
                                  <div className="flex justify-between">
                                    <span className="text-[#887d6c]">
                                      Discount
                                    </span>

                                    <span className="font-bold text-green-600">
                                      -
                                      {formatPrice(
                                        totalDiscount
                                      )}
                                    </span>
                                  </div>
                                )}

                                {order.delivery_charge !==
                                  undefined &&
                                  order.delivery_charge !==
                                    null && (
                                    <div className="flex justify-between">
                                      <span className="text-[#887d6c]">
                                        Delivery
                                      </span>

                                      <span className="font-bold">
                                        {Number(
                                          order.delivery_charge
                                        ) === 0
                                          ? "FREE"
                                          : formatPrice(
                                              Number(
                                                order.delivery_charge
                                              )
                                            )}
                                      </span>
                                    </div>
                                  )}

                                <div className="flex justify-between border-t border-dashed border-[#ddd2c0] pt-2">
                                  <span className="font-bold">
                                    Total
                                  </span>

                                  <span className="font-extrabold text-[#977538]">
                                    {formatPrice(
                                      Number(
                                        order.total_amount
                                      )
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ITEM LIST */}

                          {items.length >
                            3 && (
                            <div className="mt-4 rounded-2xl border border-[#eadfc9] bg-[#fcfaf6] p-4">
                              <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-bold">
                                  All Items
                                </p>

                                <span className="text-[10px] text-[#887d6c]">
                                  {
                                    items.length
                                  }{" "}
                                  products
                                </span>
                              </div>

                              <div className="space-y-2">
                                {items
                                  .slice(3)
                                  .map(
                                    (
                                      item
                                    ) => (
                                      <div
                                        key={
                                          item.id
                                        }
                                        className="flex items-center justify-between gap-3 rounded-xl bg-white p-3"
                                      >
                                        <div className="flex min-w-0 items-center gap-3">
                                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f7f3eb]">
                                            {getImageUrl(
                                              item.image_url
                                            ) ? (
                                              <Image
                                                src={
                                                  getImageUrl(
                                                    item.image_url
                                                  ) as string
                                                }
                                                alt={
                                                  item.product_name
                                                }
                                                fill
                                                className="object-contain p-1"
                                                sizes="40px"
                                              />
                                            ) : (
                                              <div className="flex h-full items-center justify-center text-[#aaa091]">
                                                <Package
                                                  size={
                                                    16
                                                  }
                                                />
                                              </div>
                                            )}
                                          </div>

                                          <div className="min-w-0">
                                            <p className="truncate text-[10px] font-bold text-[#423a30]">
                                              {
                                                item.product_name
                                              }
                                            </p>

                                            <p className="mt-0.5 text-[9px] text-[#887d6c]">
                                              Qty{" "}
                                              {
                                                item.quantity
                                              }
                                            </p>
                                          </div>
                                        </div>

                                        <p className="shrink-0 text-[10px] font-extrabold text-[#977538]">
                                          {formatPrice(
                                            Number(
                                              item.price
                                            ) *
                                              Number(
                                                item.quantity
                                              )
                                          )}
                                        </p>
                                      </div>
                                    )
                                  )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ==================================
                          FOOTER ACTIONS
                      ================================== */}

                      <div className="flex flex-col gap-3 border-t border-[#eee6d8] bg-[#fffdf8] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex items-center gap-2">
                          <ShieldCheck
                            size={15}
                            className="text-emerald-600"
                          />

                          <p className="text-[10px] text-[#756b5d]">
                            Secure PrimeCart order
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setShowTimeline(
                                isTimelineOpen
                                  ? null
                                  : order.id
                              )
                            }
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[10px] font-bold transition-all duration-300 ${
                              isTimelineOpen
                                ? "border-[#b9975b] bg-[#fffaf0] text-[#977538]"
                                : "border-[#e3d9c8] bg-white text-[#756b5d] hover:border-[#cdb88d] hover:text-[#977538]"
                            }`}
                          >
                            <Truck size={13} />

                            {isTimelineOpen
                              ? "Hide Tracking"
                              : "Track Order"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              buyAgain(
                                order
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#e3d9c8] bg-white px-3.5 py-2.5 text-[10px] font-bold text-[#756b5d] transition-all duration-300 hover:border-[#b9975b] hover:bg-[#fffaf0] hover:text-[#977538]"
                          >
                            <RefreshCw
                              size={13}
                            />
                            Buy Again
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedOrder(
                                isExpanded
                                  ? null
                                  : order.id
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#b9975b] px-3.5 py-2.5 text-[10px] font-bold text-white transition-all duration-300 hover:bg-[#977538]"
                          >
                            {isExpanded
                              ? "Hide Details"
                              : "View Details"}

                            {isExpanded ? (
                              <ChevronUp
                                size={13}
                              />
                            ) : (
                              <ChevronDown
                                size={13}
                              />
                            )}
                          </button>

                          {items.length >
                            0 &&
                            items[0]
                              ?.product_id && (
                              <Link
                                href={`/dashboard/products/${items[0].product_id}`}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#e3d9c8] bg-white px-3.5 py-2.5 text-[10px] font-bold text-[#756b5d] transition-all duration-300 hover:border-[#b9975b] hover:bg-[#fffaf0] hover:text-[#977538]"
                              >
                                <ExternalLink
                                  size={
                                    13
                                  }
                                />

                                Product
                              </Link>
                            )}
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}

        {/* ==========================================
            TRUST AREA
        ========================================== */}

        {!loading &&
          orders.length > 0 && (
            <section className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure Orders",
                  text: "Your order information is protected.",
                },
                {
                  icon: Truck,
                  title: "Reliable Delivery",
                  text: "Track your package from placement to delivery.",
                },
                {
                  icon: BadgeCheck,
                  title: "PrimeCart Support",
                  text: "We're here when you need help with an order.",
                },
              ].map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <div
                      key={
                        item.title
                      }
                      className="group flex items-center gap-3 rounded-2xl border border-[#eadfc9] bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f0df] text-[#977538] transition-transform duration-300 group-hover:scale-105">
                        <Icon
                          size={18}
                        />
                      </div>

                      <div>
                        <p className="text-[11px] font-bold">
                          {
                            item.title
                          }
                        </p>

                        <p className="mt-0.5 text-[9px] leading-4 text-[#887d6c]">
                          {
                            item.text
                          }
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </section>
          )}
      </main>
    </div>
  );
}
