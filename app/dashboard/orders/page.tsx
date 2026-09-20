"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Package,
  Search,
  ShoppingBag,
  Truck,
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

type Order = {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items?: OrderItem[];
};

function getImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;

  const value = imageUrl.trim();

  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getStatusConfig(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized === "delivered" ||
    normalized === "completed"
  ) {
    return {
      label: "Delivered",
      icon: CheckCircle2,
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return {
      label: "Cancelled",
      icon: XCircle,
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (
    normalized === "shipped" ||
    normalized === "out_for_delivery"
  ) {
    return {
      label:
        normalized === "out_for_delivery"
          ? "Out for Delivery"
          : "Shipped",
      icon: Truck,
      className: "bg-blue-50 text-blue-700 border-blue-200",
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
      className: "bg-purple-50 text-purple-700 border-purple-200",
    };
  }

  return {
    label: "Pending",
    icon: Clock3,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  };
}

export default function OrdersPage() {
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      /*
       * IMPORTANT:
       * This assumes your database has:
       *
       * orders
       * - id
       * - user_id
       * - status
       * - total_amount
       * - created_at
       *
       * order_items
       * - id
       * - order_id
       * - product_id
       * - product_name
       * - quantity
       * - price
       * - image_url
       */

      const { data, error } = await supabase
        .from("orders")
        .select(`
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
        `)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Orders error:", error);
        setOrders([]);
        return;
      }

      setOrders((data as Order[]) || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      order.order_items?.some((item) =>
        item.product_name
          .toLowerCase()
          .includes(search.toLowerCase())
      );

    const matchesFilter =
      filter === "all" ||
      order.status.toLowerCase() === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#eadfca] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfca] bg-white text-[#8b6b25] transition hover:bg-[#fffaf0]"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <h1 className="text-lg font-bold sm:text-xl">
                My Orders
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Track and manage your PrimeCart orders
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/products"
            className="hidden items-center gap-2 rounded-xl bg-[#c9a24d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b8913f] sm:flex"
          >
            <ShoppingBag size={17} />
            Continue Shopping
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page intro */}
        <div className="mb-6 rounded-2xl border border-[#eadfca] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff8e8] text-[#b58a32]">
                  <Package size={21} />
                </div>

                <span className="text-sm font-semibold text-[#9b762b]">
                  PrimeCart Orders
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Your Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View your purchases, order status and delivery details.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#eadfca] bg-[#fffdf8] px-4 py-3">
                <p className="text-xs text-gray-500">Total Orders</p>
                <p className="mt-1 text-xl font-bold">
                  {orders.length}
                </p>
              </div>

              <div className="rounded-xl border border-[#eadfca] bg-[#fffdf8] px-4 py-3">
                <p className="text-xs text-gray-500">Delivered</p>
                <p className="mt-1 text-xl font-bold text-emerald-600">
                  {
                    orders.filter((order) =>
                      ["delivered", "completed"].includes(
                        order.status.toLowerCase()
                      )
                    ).length
                  }
                </p>
              </div>

              <div className="col-span-2 rounded-xl border border-[#eadfca] bg-[#fffdf8] px-4 py-3 sm:col-span-1">
                <p className="text-xs text-gray-500">
                  In Progress
                </p>
                <p className="mt-1 text-xl font-bold text-[#b58a32]">
                  {
                    orders.filter(
                      (order) =>
                        !["delivered", "completed", "cancelled", "canceled"].includes(
                          order.status.toLowerCase()
                        )
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 rounded-2xl border border-[#eadfca] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order ID or product..."
                className="h-11 w-full rounded-xl border border-[#e5dccb] bg-[#fffdf8] pl-10 pr-4 text-sm outline-none transition focus:border-[#c9a24d] focus:ring-2 focus:ring-[#c9a24d]/10"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { value: "all", label: "All Orders" },
                { value: "pending", label: "Pending" },
                { value: "processing", label: "Processing" },
                { value: "shipped", label: "Shipped" },
                { value: "delivered", label: "Delivered" },
                { value: "cancelled", label: "Cancelled" },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    filter === item.value
                      ? "border-[#c9a24d] bg-[#c9a24d] text-white"
                      : "border-[#e5dccb] bg-white text-gray-600 hover:bg-[#fffaf0]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-[#eadfca] bg-white p-5"
              >
                <div className="mb-5 h-5 w-40 rounded bg-gray-200" />

                <div className="flex gap-4">
                  <div className="h-24 w-24 rounded-xl bg-gray-200" />

                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                    <div className="h-4 w-1/3 rounded bg-gray-200" />
                    <div className="h-4 w-1/4 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filteredOrders.length === 0 && (
          <div className="rounded-2xl border border-[#eadfca] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff8e8] text-[#b58a32]">
              <ShoppingBag size={28} />
            </div>

            <h3 className="mt-5 text-xl font-bold">
              {orders.length === 0
                ? "No orders yet"
                : "No matching orders"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {orders.length === 0
                ? "Your completed purchases will appear here. Start shopping and place your first PrimeCart order."
                : "Try changing your search or selecting another order status."}
            </p>

            {orders.length === 0 && (
              <Link
                href="/dashboard/products"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#c9a24d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b8913f]"
              >
                Start Shopping
                <ArrowRight size={17} />
              </Link>
            )}
          </div>
        )}

        {/* Orders */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const status = getStatusConfig(order.status);
              const StatusIcon = status.icon;

              const items = order.order_items || [];

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-[#eadfca] bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Order header */}
                  <div className="border-b border-[#eee6d7] bg-[#fffdf8] px-5 py-4 sm:px-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                            Order ID
                          </p>

                          <p className="mt-0.5 text-sm font-semibold">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                            Ordered On
                          </p>

                          <p className="mt-0.5 text-sm font-medium text-gray-700">
                            {formatDate(order.created_at)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                            Items
                          </p>

                          <p className="mt-0.5 text-sm font-medium text-gray-700">
                            {items.reduce(
                              (total, item) =>
                                total + item.quantity,
                              0
                            )}{" "}
                            item(s)
                          </p>
                        </div>
                      </div>

                      <div
                        className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
                      >
                        <StatusIcon size={14} />
                        {status.label}
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-[#eee6d7]">
                    {items.length > 0 ? (
                      items.map((item) => {
                        const image = getImageUrl(
                          item.image_url
                        );

                        return (
                          <div
                            key={item.id}
                            className="flex gap-4 px-5 py-5 sm:px-6"
                          >
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#eee6d7] bg-[#faf9f6] sm:h-24 sm:w-24">
                              {image ? (
                                <Image
                                  src={image}
                                  alt={item.product_name}
                                  fill
                                  className="object-contain p-2"
                                  sizes="96px"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                  <Package size={25} />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base">
                                {item.product_name}
                              </h3>

                              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                <span>
                                  Qty:{" "}
                                  <strong className="text-gray-700">
                                    {item.quantity}
                                  </strong>
                                </span>

                                <span>
                                  Price:{" "}
                                  <strong className="text-gray-700">
                                    {formatPrice(
                                      Number(item.price)
                                    )}
                                  </strong>
                                </span>
                              </div>

                              <p className="mt-2 text-sm font-bold text-[#a67c25]">
                                {formatPrice(
                                  Number(item.price) *
                                    item.quantity
                                )}
                              </p>
                            </div>

                            {item.product_id && (
                              <Link
                                href={`/dashboard/products/${item.product_id}`}
                                className="hidden h-9 shrink-0 items-center gap-1 rounded-lg border border-[#e5dccb] px-3 text-xs font-semibold text-gray-600 transition hover:border-[#c9a24d] hover:text-[#9b762b] sm:flex"
                              >
                                View
                                <ArrowRight size={14} />
                              </Link>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-6 py-8 text-center text-sm text-gray-500">
                        No item details available for this order.
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col gap-4 border-t border-[#eee6d7] bg-[#fffdf8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                      <p className="text-xs text-gray-500">
                        Total Amount
                      </p>

                      <p className="mt-0.5 text-xl font-bold text-[#9b762b]">
                        {formatPrice(
                          Number(order.total_amount)
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-xl border border-[#e5dccb] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#c9a24d] hover:text-[#9b762b]"
                      >
                        View Details
                      </button>

                      {!["cancelled", "canceled"].includes(
                        order.status.toLowerCase()
                      ) && (
                        <button
                          type="button"
                          className="rounded-xl bg-[#c9a24d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b8913f]"
                        >
                          Track Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
