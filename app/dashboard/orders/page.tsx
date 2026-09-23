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
  ChevronDown,
  ChevronUp,
  Clock3,
  Copy,
  ExternalLink,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Target,
  Truck,
  Trophy,
  WalletCards,
  Wrench,
  X,
  XCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

/* =========================================================
   TYPES
========================================================= */

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

type SortOption =
  | "newest"
  | "oldest"
  | "highest"
  | "lowest";

/* =========================================================
   CONSTANTS
========================================================= */

const CART_KEY = "primecart-cart";

/* =========================================================
   PRICE
========================================================= */

function formatPrice(
  value: number | null | undefined
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

/* =========================================================
   IMAGE HELPER

   IMPORTANT:
   DB can contain:
   sports-running-shoes.png
   products/sports-running-shoes.png
   /products/sports-running-shoes.png
   public/products/sports-running-shoes.png
========================================================= */

function getImageCandidates(
  value?: string | null
) {
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

  if (
    image.startsWith("/public/products/")
  ) {
    return [
      image.replace(
        "/public",
        ""
      ),
      image.replace(
        "/public/products/",
        "/"
      ),
    ];
  }

  if (
    image.startsWith("public/products/")
  ) {
    return [
      `/${image.replace(
        "public/",
        ""
      )}`,
      `/${image.replace(
        "public/products/",
        ""
      )}`,
    ];
  }

  if (
    image.startsWith("/products/")
  ) {
    return [
      image,
      image.replace(
        "/products/",
        "/"
      ),
    ];
  }

  if (
    image.startsWith("products/")
  ) {
    return [
      `/${image}`,
      `/${image.replace(
        "products/",
        ""
      )}`,
    ];
  }

  if (image.startsWith("/")) {
    return [
      `/products${image}`,
      image,
    ];
  }

  return [
    `/products/${image}`,
    `/${image}`,
  ];
}

/* =========================================================
   PRODUCT IMAGE

   Uses same image logic as Dashboard.
========================================================= */

function ProductImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const candidates =
    getImageCandidates(src);

  const [index, setIndex] =
    useState(0);

  useEffect(() => {
    setIndex(0);
  }, [src]);

  const current =
    candidates[index];

  if (!current) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-[#f7f2e9] ${className}`}
      >
        <Package
          size={28}
          strokeWidth={1.5}
          className="text-[#b9aa91]"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#faf7f0] ${className}`}
    >
      <Image
        src={current}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100px, 140px"
        className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
        onError={() => {
          if (
            index <
            candidates.length - 1
          ) {
            setIndex(index + 1);
          } else {
            setIndex(
              candidates.length
            );
          }
        }}
      />
    </div>
  );
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  value: string
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function formatDateTime(
  value: string
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

/* =========================================================
   STATUS
========================================================= */

function normalizeStatus(
  value: string
) {
  return String(value || "")
    .toLowerCase()
    .replace(
      /[\s-]+/g,
      "_"
    );
}

function getStatus(
  value: string
) {
  const status =
    normalizeStatus(value);

  if (
    status === "delivered" ||
    status === "completed"
  ) {
    return {
      label: "Delivered",
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (
    status === "cancelled" ||
    status === "canceled"
  ) {
    return {
      label: "Cancelled",
      icon: XCircle,
      className:
        "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (
    status === "out_for_delivery" ||
    status === "outfordelivery"
  ) {
    return {
      label: "Out for Delivery",
      icon: Truck,
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  if (status === "shipped") {
    return {
      label: "Shipped",
      icon: Truck,
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  if (
    status === "processing" ||
    status === "confirmed"
  ) {
    return {
      label:
        status === "confirmed"
          ? "Confirmed"
          : "Processing",
      icon: Package,
      className:
        "border-purple-200 bg-purple-50 text-purple-700",
    };
  }

  return {
    label: "Order Placed",
    icon: Clock3,
    className:
      "border-[#e6d5ae] bg-[#fff8e8] text-[#927000]",
  };
}

/* =========================================================
   PROGRESS
========================================================= */

function getProgress(
  value: string
) {
  const status =
    normalizeStatus(value);

  if (
    status === "cancelled" ||
    status === "canceled"
  ) {
    return -1;
  }

  if (
    status === "delivered" ||
    status === "completed"
  ) {
    return 5;
  }

  if (
    status === "out_for_delivery" ||
    status === "outfordelivery"
  ) {
    return 4;
  }

  if (status === "shipped") {
    return 3;
  }

  if (
    status === "processing" ||
    status === "confirmed"
  ) {
    return 2;
  }

  return 1;
}

/* =========================================================
   LOCAL ORDER NORMALIZER
========================================================= */

function normalizeLocalOrder(
  order: LocalOrder
): Order {
  return {
    id: order.id,
    user_id: "local",
    status:
      order.status || "placed",
    total_amount:
      Number(order.total) || 0,
    created_at:
      order.createdAt,

    payment_method:
      order.paymentMethod ||
      null,

    subtotal:
      order.subtotal ??
      null,

    delivery_charge:
      order.delivery ??
      null,

    discount:
      order.discount ??
      null,

    shipping_address:
      order.address ||
      null,

    order_items:
      order.items || [],
  };
}

/* =========================================================
   ADDRESS
========================================================= */

function getAddress(
  address?: OrderAddress | null
) {
  if (!address) {
    return "";
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
   PAYMENT
========================================================= */

function getPayment(
  value?: string | null
) {
  if (!value) {
    return "Not available";
  }

  return value
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

/* =========================================================
   SIDEBAR
========================================================= */

const mainNavigation = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: ShoppingBag,
  },
  {
    label: "Categories",
    href: "/dashboard/categories",
    icon: Home,
  },
  {
    label: "My Orders",
    href: "/dashboard/orders",
    icon: Package,
  },
  {
    label: "Wishlist",
    href: "/dashboard/wishlist",
    icon: Heart,
  },
];

const smartNavigation = [
  {
    label: "PrimeMatch",
    href: "/dashboard/prime-match",
    icon: Target,
  },
  {
    label: "Budget Builder",
    href: "/dashboard/budget-builder",
    icon: WalletCards,
  },
  {
    label: "Setup Builder",
    href: "/dashboard/setup-builder",
    icon: Wrench,
  },
  {
    label: "PrimePoints",
    href: "/dashboard/prime-points",
    icon: Trophy,
  },
];

function Sidebar({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean;
  setMobileOpen: (
    value: boolean
  ) => void;
}) {
  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close menu"
          onClick={() =>
            setMobileOpen(false)
          }
          className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-[90] flex h-screen w-[260px] flex-col border-r border-[#eadfc9] bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* LOGO */}

        <div className="flex h-[78px] items-center border-b border-[#eee6d8] px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#17130d] text-white shadow-lg">
              <ShoppingBag
                size={19}
              />
            </div>

            <div>
              <p className="text-[17px] font-black tracking-tight text-[#17130d]">
                Prime<span className="text-[#b9975b]">Cart</span>
              </p>

              <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#a39888]">
                Smart Shopping
              </p>
            </div>
          </Link>
        </div>

        {/* NAVIGATION */}

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#aaa091]">
            Main Menu
          </p>

          <nav className="space-y-1">
            {mainNavigation.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  item.href ===
                  "/dashboard/orders";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setMobileOpen(
                        false
                      )
                    }
                    className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[11px] font-bold transition-all ${
                      active
                        ? "bg-[#17130d] text-white shadow-[0_8px_20px_rgba(23,19,13,0.12)]"
                        : "text-[#756b5d] hover:bg-[#faf6ed] hover:text-[#977538]"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={
                        active
                          ? "text-[#d6b979]"
                          : "text-[#998c7b]"
                      }
                    />

                    {item.label}
                  </Link>
                );
              }
            )}
          </nav>

          <p className="mb-2 mt-7 px-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#aaa091]">
            Smart Shopping
          </p>

          <nav className="space-y-1">
            {smartNavigation.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setMobileOpen(
                        false
                      )
                    }
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 text-[11px] font-bold text-[#756b5d] transition-all hover:bg-[#faf6ed] hover:text-[#977538]"
                  >
                    <Icon
                      size={16}
                      className="text-[#998c7b] group-hover:text-[#b9975b]"
                    />

                    {item.label}
                  </Link>
                );
              }
            )}
          </nav>
        </div>

        {/* BOTTOM */}

        <div className="border-t border-[#eee6d8] p-4">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-[11px] font-bold text-[#756b5d] hover:bg-[#faf6ed]"
          >
            <Settings
              size={16}
            />
            Settings
          </Link>

          <Link
            href="/dashboard"
            className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-[11px] font-bold text-[#a0645c] hover:bg-[#fff3f1]"
          >
            <LogOut
              size={16}
            />
            Back to Dashboard
          </Link>
        </div>
      </aside>
    </>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function OrdersPage() {
  const supabase =
    createClient();

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  const [
    orders,
    setOrders,
  ] = useState<Order[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState("all");

  const [
    sort,
    setSort,
  ] = useState<SortOption>(
    "newest"
  );

  const [
    expandedOrder,
    setExpandedOrder,
  ] = useState<string | null>(
    null
  );

  const [
    trackingOrder,
    setTrackingOrder,
  ] = useState<string | null>(
    null
  );

  const [
    copiedOrder,
    setCopiedOrder,
  ] = useState<string | null>(
    null
  );

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /* =======================================================
     LOAD ORDERS
  ======================================================= */

  const loadOrders =
    useCallback(
      async (
        refresh = false
      ) => {
        try {
          if (refresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setErrorMessage("");

          let localOrders: Order[] =
            [];

          /* LOCAL ORDERS */

          try {
            const saved =
              localStorage.getItem(
                "primecart-orders"
              );

            if (saved) {
              const parsed =
                JSON.parse(
                  saved
                );

              if (
                Array.isArray(
                  parsed
                )
              ) {
                localOrders =
                  parsed.map(
                    (
                      order: LocalOrder
                    ) =>
                      normalizeLocalOrder(
                        order
                      )
                  );
              }
            }
          } catch (
            localError
          ) {
            console.error(
              "Local order error:",
              localError
            );
          }

          /* USER */

          const {
            data: {
              user,
            },
          } =
            await supabase.auth.getUser();

          if (!user) {
            window.location.href =
              "/auth/login";

            return;
          }

          /* SUPABASE */

          const {
            data,
            error,
          } =
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
              .eq(
                "user_id",
                user.id
              )
              .order(
                "created_at",
                {
                  ascending:
                    false,
                }
              );

          if (error) {
            console.error(
              "Supabase order error:",
              error
            );

            if (
              localOrders.length ===
              0
            ) {
              setErrorMessage(
                "Unable to load your orders. Please try again."
              );
            }
          }

          const databaseOrders =
            (data as Order[]) ||
            [];

          /* MERGE */

          const map =
            new Map<
              string,
              Order
            >();

          [
            ...localOrders,
            ...databaseOrders,
          ].forEach(
            (order) => {
              const key = `${order.id}|${new Date(
                order.created_at
              ).getTime()}`;

              const old =
                map.get(key);

              if (
                !old ||
                (old.user_id ===
                  "local" &&
                  order.user_id !==
                    "local")
              ) {
                map.set(
                  key,
                  order
                );
              }
            }
          );

          const finalOrders =
            Array.from(
              map.values()
            ).sort(
              (a, b) =>
                new Date(
                  b.created_at
                ).getTime() -
                new Date(
                  a.created_at
                ).getTime()
            );

          setOrders(
            finalOrders
          );
        } catch (error) {
          console.error(
            error
          );

          setErrorMessage(
            "Something went wrong while loading orders."
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

    const handleStorage =
      () => {
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

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredOrders =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      const result =
        orders.filter(
          (order) => {
            const status =
              normalizeStatus(
                order.status
              );

            const matchesSearch =
              !query ||
              order.id
                .toLowerCase()
                .includes(query) ||
              order.order_items?.some(
                (item) =>
                  item.product_name
                    .toLowerCase()
                    .includes(
                      query
                    )
              ) ||
              String(
                order.payment_method ||
                  ""
              )
                .toLowerCase()
                .includes(
                  query
                ) ||
              status.includes(
                query
              );

            let matchesFilter =
              true;

            if (
              filter ===
              "pending"
            ) {
              matchesFilter =
                [
                  "pending",
                  "placed",
                  "order_placed",
                ].includes(
                  status
                );
            }

            if (
              filter ===
              "processing"
            ) {
              matchesFilter =
                [
                  "processing",
                  "confirmed",
                ].includes(
                  status
                );
            }

            if (
              filter ===
              "shipped"
            ) {
              matchesFilter =
                [
                  "shipped",
                  "out_for_delivery",
                  "outfordelivery",
                ].includes(
                  status
                );
            }

            if (
              filter ===
              "delivered"
            ) {
              matchesFilter =
                [
                  "delivered",
                  "completed",
                ].includes(
                  status
                );
            }

            if (
              filter ===
              "cancelled"
            ) {
              matchesFilter =
                [
                  "cancelled",
                  "canceled",
                ].includes(
                  status
                );
            }

            return (
              matchesSearch &&
              matchesFilter
            );
          }
        );

      return result.sort(
        (a, b) => {
          if (
            sort ===
            "highest"
          ) {
            return (
              Number(
                b.total_amount
              ) -
              Number(
                a.total_amount
              )
            );
          }

          if (
            sort ===
            "lowest"
          ) {
            return (
              Number(
                a.total_amount
              ) -
              Number(
                b.total_amount
              )
            );
          }

          const aDate =
            new Date(
              a.created_at
            ).getTime();

          const bDate =
            new Date(
              b.created_at
            ).getTime();

          return sort ===
            "newest"
            ? bDate - aDate
            : aDate - bDate;
        }
      );
    }, [
      orders,
      search,
      filter,
      sort,
    ]);

  /* =======================================================
     STATS
  ======================================================= */

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

  const activeOrders =
    orders.filter(
      (order) =>
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

  const totalSpent =
    orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total_amount ||
            0
        ),
      0
    );

  /* =======================================================
     COPY
  ======================================================= */

  async function copyOrder(
    id: string
  ) {
    try {
      await navigator.clipboard.writeText(
        id
      );

      setCopiedOrder(id);

      setTimeout(() => {
        setCopiedOrder(
          null
        );
      }, 1800);
    } catch {
      // ignore
    }
  }

  /* =======================================================
     BUY AGAIN

     Same cart structure used by Dashboard:
     id, product_id, name, price, quantity,
     image_url, stock
  ======================================================= */

  function buyAgain(
    order: Order
  ) {
    try {
      const raw =
        localStorage.getItem(
          CART_KEY
        );

      const cart =
        raw
          ? JSON.parse(raw)
          : [];

      const nextCart =
        Array.isArray(cart)
          ? [...cart]
          : [];

      let added = 0;

      (
        order.order_items ||
        []
      ).forEach(
        (item) => {
          if (
            !item.product_id
          ) {
            return;
          }

          const index =
            nextCart.findIndex(
              (
                cartItem: {
                  id?: string;
                  product_id?: string;
                }
              ) =>
                String(
                  cartItem.product_id ||
                    cartItem.id
                ) ===
                String(
                  item.product_id
                )
            );

          if (index >= 0) {
            nextCart[
              index
            ] = {
              ...nextCart[
                index
              ],
              quantity:
                Number(
                  nextCart[
                    index
                  ]
                    .quantity ||
                    0
                ) +
                Number(
                  item.quantity ||
                    1
                ),
            };
          } else {
            nextCart.push({
              id: item.product_id,
              product_id:
                item.product_id,
              name:
                item.product_name,
              price:
                Number(
                  item.price || 0
                ),
              quantity:
                Number(
                  item.quantity ||
                    1
                ),
              image_url:
                item.image_url ||
                null,
            });
          }

          added++;
        }
      );

      localStorage.setItem(
        CART_KEY,
        JSON.stringify(
          nextCart
        )
      );

      window.dispatchEvent(
        new Event("storage")
      );

      setMessage(
        added
          ? `${added} product${
              added > 1
                ? "s"
                : ""
            } added to cart.`
          : "No products available for reorder."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch {
      setMessage(
        "Unable to add products to cart."
      );
    }
  }

  /* =======================================================
     FILTER COUNTS
  ======================================================= */

  const countStatus = (
    statuses: string[]
  ) =>
    orders.filter(
      (order) =>
        statuses.includes(
          normalizeStatus(
            order.status
          )
        )
    ).length;

  const filters = [
    {
      value: "all",
      label: "All Orders",
      count:
        totalOrders,
    },
    {
      value: "pending",
      label: "Placed",
      count: countStatus([
        "pending",
        "placed",
        "order_placed",
      ]),
    },
    {
      value: "processing",
      label: "Processing",
      count: countStatus([
        "processing",
        "confirmed",
      ]),
    },
    {
      value: "shipped",
      label: "Shipped",
      count: countStatus([
        "shipped",
        "out_for_delivery",
        "outfordelivery",
      ]),
    },
    {
      value: "delivered",
      label: "Delivered",
      count:
        deliveredOrders,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      count:
        cancelledOrders,
    },
  ];

  /* =======================================================
     CLEAR
  ======================================================= */

  function clearFilters() {
    setSearch("");
    setFilter("all");
    setSort("newest");
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#44382a]">
      {/* SIDEBAR */}

      <Sidebar
        mobileOpen={
          mobileSidebarOpen
        }
        setMobileOpen={
          setMobileSidebarOpen
        }
      />

      {/* MAIN */}

      <div className="min-h-screen lg:pl-[260px]">
        {/* =================================================
            TOP HEADER
        ================================================= */}

        <header className="sticky top-0 z-50 border-b border-[#eadfc9] bg-white/90 backdrop-blur-xl">
          <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setMobileSidebarOpen(
                    true
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#756b5d] lg:hidden"
              >
                <Menu
                  size={18}
                />
              </button>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b9975b]">
                  Shopping
                </p>

                <h1 className="text-lg font-black text-[#17130d]">
                  My Orders
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/wishlist"
                className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#756b5d] transition hover:border-[#d5bf8f] hover:text-[#b9975b] sm:flex"
              >
                <Heart
                  size={17}
                />
              </Link>

              <Link
                href="/dashboard/cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#756b5d] transition hover:border-[#d5bf8f] hover:text-[#b9975b]"
              >
                <ShoppingCart
                  size={17}
                />
              </Link>

              <Link
                href="/dashboard"
                className="hidden h-10 items-center gap-2 rounded-xl bg-[#17130d] px-4 text-[11px] font-black text-white transition hover:bg-[#b9975b] sm:flex"
              >
                <ArrowLeft
                  size={14}
                />
                Dashboard
              </Link>
            </div>
          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {/* HERO */}

          <section className="relative mb-6 overflow-hidden rounded-[26px] border border-[#eadfc9] bg-white shadow-[0_12px_40px_rgba(70,45,10,0.05)]">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#f4ead3] blur-3xl" />

            <div className="absolute -bottom-24 left-20 h-52 w-52 rounded-full bg-[#faf4e6] blur-3xl" />

            <div className="relative p-5 sm:p-7 lg:p-8">
              <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e8dcc3] bg-[#fffaf0] px-3 py-1.5">
                    <Sparkles
                      size={12}
                      className="text-[#b9975b]"
                    />

                    <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#927000]">
                      PrimeCart
                      Orders
                    </span>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight text-[#17130d] sm:text-3xl lg:text-4xl">
                    Your shopping
                    journey.
                  </h2>

                  <p className="mt-2 max-w-xl text-xs leading-6 text-[#817666] sm:text-sm">
                    Track your orders,
                    revisit your purchases
                    and manage everything
                    from one place.
                  </p>
                </div>

                {/* STATS */}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[610px]">
                  <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-4">
                    <Package
                      size={16}
                      className="text-[#b9975b]"
                    />

                    <p className="mt-2 text-xl font-black text-[#17130d]">
                      {totalOrders}
                    </p>

                    <p className="text-[9px] font-semibold text-[#9a8f7e]">
                      Total Orders
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-4">
                    <Truck
                      size={16}
                      className="text-blue-500"
                    />

                    <p className="mt-2 text-xl font-black text-blue-600">
                      {activeOrders}
                    </p>

                    <p className="text-[9px] font-semibold text-[#9a8f7e]">
                      Active
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-4">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500"
                    />

                    <p className="mt-2 text-xl font-black text-emerald-600">
                      {deliveredOrders}
                    </p>

                    <p className="text-[9px] font-semibold text-[#9a8f7e]">
                      Delivered
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-4">
                    <BadgeCheck
                      size={16}
                      className="text-[#b9975b]"
                    />

                    <p className="mt-2 truncate text-lg font-black text-[#927000]">
                      {formatPrice(
                        totalSpent
                      )}
                    </p>

                    <p className="text-[9px] font-semibold text-[#9a8f7e]">
                      Total Spent
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ERROR */}

          {errorMessage && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle
                size={17}
              />

              <p className="flex-1 text-[11px] font-semibold">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={() =>
                  loadOrders(true)
                }
                className="rounded-lg bg-white px-3 py-2 text-[10px] font-black shadow-sm"
              >
                Retry
              </button>
            </div>
          )}

          {/* =================================================
              SEARCH
          ================================================= */}

          <section className="mb-6 rounded-[22px] border border-[#eadfc9] bg-white p-4 shadow-[0_8px_30px_rgba(70,45,10,0.035)] sm:p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9d9180]"
                  />

                  <input
                    value={search}
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target
                          .value
                      )
                    }
                    placeholder="Search order ID, product, payment or status..."
                    className="h-11 w-full rounded-xl border border-[#e4dac9] bg-[#fffdf9] pl-10 pr-10 text-[11px] font-medium outline-none transition focus:border-[#b9975b] focus:ring-4 focus:ring-[#b9975b]/10"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearch("")
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9d9180]"
                    >
                      <X
                        size={14}
                      />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <select
                    value={sort}
                    onChange={(
                      event
                    ) =>
                      setSort(
                        event.target
                          .value as SortOption
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-[#e4dac9] bg-[#fffdf9] px-4 pr-10 text-[11px] font-bold text-[#665d51] outline-none focus:border-[#b9975b] sm:w-[180px]"
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
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9d9180]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    loadOrders(true)
                  }
                  disabled={
                    refreshing
                  }
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#17130d] px-5 text-[11px] font-black text-white transition hover:bg-[#b9975b] disabled:opacity-60"
                >
                  <RefreshCw
                    size={14}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh
                </button>
              </div>

              {/* FILTERS */}

              <div className="flex gap-2 overflow-x-auto pb-1">
                {filters.map(
                  (item) => (
                    <button
                      key={
                        item.value
                      }
                      type="button"
                      onClick={() =>
                        setFilter(
                          item.value
                        )
                      }
                      className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[10px] font-black transition ${
                        filter ===
                        item.value
                          ? "border-[#17130d] bg-[#17130d] text-white"
                          : "border-[#e4dac9] bg-white text-[#756b5d] hover:border-[#cbb78e] hover:text-[#927000]"
                      }`}
                    >
                      {
                        item.label
                      }

                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[8px] ${
                          filter ===
                          item.value
                            ? "bg-white/15"
                            : "bg-[#f5f0e7]"
                        }`}
                      >
                        {
                          item.count
                        }
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="space-y-5">
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-[24px] border border-[#eadfc9] bg-white p-5"
                  >
                    <div className="h-4 w-40 rounded bg-[#eee8dc]" />

                    <div className="mt-5 flex gap-4">
                      <div className="h-24 w-24 rounded-2xl bg-[#eee8dc]" />

                      <div className="flex-1">
                        <div className="h-4 w-2/3 rounded bg-[#eee8dc]" />

                        <div className="mt-3 h-3 w-1/3 rounded bg-[#f2eee7]" />

                        <div className="mt-4 h-3 w-1/4 rounded bg-[#f2eee7]" />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            filteredOrders.length ===
              0 && (
              <section className="rounded-[26px] border border-[#eadfc9] bg-white px-6 py-20 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#f7f0df] text-[#b9975b]">
                  <ShoppingBag
                    size={30}
                  />
                </div>

                <h3 className="mt-6 text-xl font-black text-[#17130d]">
                  {orders.length ===
                  0
                    ? "No orders yet"
                    : "No matching orders"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#827767]">
                  {orders.length ===
                  0
                    ? "Your PrimeCart purchases will appear here once you place your first order."
                    : "Try changing your search or order filter."}
                </p>

                {orders.length ===
                0 ? (
                  <Link
                    href="/dashboard/products"
                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#17130d] px-6 py-3 text-[11px] font-black text-white hover:bg-[#b9975b]"
                  >
                    Explore Products
                    <ArrowRight
                      size={14}
                    />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="mt-7 rounded-xl border border-[#dcccaf] px-6 py-3 text-[11px] font-black text-[#927000]"
                  >
                    Clear Filters
                  </button>
                )}
              </section>
            )}

          {/* =================================================
              ORDERS
          ================================================= */}

          {!loading &&
            filteredOrders.length >
              0 && (
              <div className="space-y-5">
                {filteredOrders.map(
                  (
                    order,
                    index
                  ) => {
                    const status =
                      getStatus(
                        order.status
                      );

                    const StatusIcon =
                      status.icon;

                    const items =
                      order.order_items ||
                      [];

                    const progress =
                      getProgress(
                        order.status
                      );

                    const expanded =
                      expandedOrder ===
                      order.id;

                    const tracking =
                      trackingOrder ===
                      order.id;

                    const itemCount =
                      items.reduce(
                        (
                          sum,
                          item
                        ) =>
                          sum +
                          Number(
                            item.quantity ||
                              0
                          ),
                        0
                      );

                    return (
                      <article
                        key={`${order.id}-${order.created_at}`}
                        className="group overflow-hidden rounded-[24px] border border-[#eadfc9] bg-white shadow-[0_10px_35px_rgba(70,45,10,0.04)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(70,45,10,0.08)]"
                        style={{
                          animation:
                            `orderIn .5s ease-out ${
                              index *
                              60
                            }ms both`,
                        }}
                      >
                        {/* ORDER HEADER */}

                        <div className="border-b border-[#eee6d8] bg-[#fffdf8] p-4 sm:p-5">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap items-center gap-5">
                              <div>
                                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[#aaa091]">
                                  Order ID
                                </p>

                                <div className="mt-1 flex items-center gap-1.5">
                                  <p className="font-mono text-xs font-black text-[#332d25]">
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
                                      copyOrder(
                                        order.id
                                      )
                                    }
                                    className="rounded-md p-1 text-[#9d9180] hover:bg-[#f3ede2]"
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
                                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[#aaa091]">
                                  Ordered
                                </p>

                                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-[#62594e]">
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
                                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[#aaa091]">
                                  Items
                                </p>

                                <p className="mt-1 text-[11px] font-bold text-[#62594e]">
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
                                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[#aaa091]">
                                  Total
                                </p>

                                <p className="mt-1 text-[11px] font-black text-[#927000]">
                                  {formatPrice(
                                    Number(
                                      order.total_amount
                                    )
                                  )}
                                </p>
                              </div>
                            </div>

                            <div
                              className={`flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-black ${status.className}`}
                            >
                              <StatusIcon
                                size={
                                  13
                                }
                              />

                              {
                                status.label
                              }
                            </div>
                          </div>
                        </div>

                        {/* PRODUCTS */}

                        <div className="divide-y divide-[#eee6d8]">
                          {items
                            .slice(
                              0,
                              3
                            )
                            .map(
                              (
                                item
                              ) => (
                                <div
                                  key={
                                    item.id
                                  }
                                  className="group/item flex gap-4 p-4 sm:p-5"
                                >
                                  {/* IMAGE */}

                                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#eee6d8] bg-[#faf7f0] sm:h-24 sm:w-24">
                                    <ProductImage
                                      src={
                                        item.image_url
                                      }
                                      alt={
                                        item.product_name
                                      }
                                    />
                                  </div>

                                  {/* INFO */}

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <h3 className="line-clamp-2 text-sm font-black text-[#28231d]">
                                          {
                                            item.product_name
                                          }
                                        </h3>

                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-[#887d6c]">
                                          <span>
                                            Qty:{" "}
                                            <strong className="text-[#4c443a]">
                                              {
                                                item.quantity
                                              }
                                            </strong>
                                          </span>

                                          <span>
                                            Unit:{" "}
                                            <strong className="text-[#4c443a]">
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
                                          className="hidden shrink-0 items-center gap-1 rounded-lg border border-[#e3d9c8] px-3 py-2 text-[9px] font-black text-[#756b5d] hover:border-[#b9975b] hover:text-[#927000] sm:flex"
                                        >
                                          View
                                          Product
                                          <ExternalLink
                                            size={
                                              11
                                            }
                                          />
                                        </Link>
                                      )}
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                      <p className="text-sm font-black text-[#927000]">
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
                                          className="text-[9px] font-black text-[#927000] sm:hidden"
                                        >
                                          View
                                          →
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}

                          {items.length >
                            3 && (
                            <div className="bg-[#fcfaf6] py-3 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedOrder(
                                    expanded
                                      ? null
                                      : order.id
                                  )
                                }
                                className="text-[10px] font-black text-[#927000] hover:underline"
                              >
                                +
                                {items.length -
                                  3}{" "}
                                more items
                                ·{" "}
                                {expanded
                                  ? "Hide"
                                  : "View All"}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* TRACKING */}

                        {tracking && (
                          <div className="border-t border-[#eee6d8] bg-[#fcfaf6] px-5 py-6 sm:px-7">
                            <div className="mb-6 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-black text-[#17130d]">
                                  Delivery
                                  Progress
                                </p>

                                <p className="mt-1 text-[9px] text-[#887d6c]">
                                  Current order
                                  status
                                </p>
                              </div>

                              <span className="text-[9px] font-black text-[#927000]">
                                {
                                  status.label
                                }
                              </span>
                            </div>

                            {progress ===
                            -1 ? (
                              <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                                <XCircle
                                  size={
                                    20
                                  }
                                  className="text-red-600"
                                />

                                <div>
                                  <p className="text-xs font-black text-red-700">
                                    Order
                                    Cancelled
                                  </p>

                                  <p className="mt-1 text-[9px] text-red-600">
                                    This order
                                    is no
                                    longer in
                                    delivery.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-6 sm:grid-cols-5 sm:gap-0">
                                {[
                                  {
                                    label:
                                      "Placed",
                                    icon: Check,
                                    step: 1,
                                  },
                                  {
                                    label:
                                      "Confirmed",
                                    icon: BadgeCheck,
                                    step: 2,
                                  },
                                  {
                                    label:
                                      "Shipped",
                                    icon: Truck,
                                    step: 3,
                                  },
                                  {
                                    label:
                                      "Out for Delivery",
                                    icon: Package,
                                    step: 4,
                                  },
                                  {
                                    label:
                                      "Delivered",
                                    icon: CheckCircle2,
                                    step: 5,
                                  },
                                ].map(
                                  (
                                    step,
                                    stepIndex
                                  ) => {
                                    const Icon =
                                      step.icon;

                                    const done =
                                      progress >=
                                      step.step;

                                    return (
                                      <div
                                        key={
                                          step.label
                                        }
                                        className="relative flex flex-col items-center text-center"
                                      >
                                        <div
                                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                                            done
                                              ? "border-[#b9975b] bg-[#b9975b] text-white"
                                              : "border-[#ddd2c0] bg-white text-[#aaa091]"
                                          }`}
                                        >
                                          <Icon
                                            size={
                                              16
                                            }
                                          />
                                        </div>

                                        <p
                                          className={`mt-2 text-[8px] font-black sm:text-[9px] ${
                                            done
                                              ? "text-[#927000]"
                                              : "text-[#9d9180]"
                                          }`}
                                        >
                                          {
                                            step.label
                                          }
                                        </p>

                                        {stepIndex <
                                          4 && (
                                          <div
                                            className={`absolute left-[calc(50%+24px)] right-[calc(-50%+24px)] top-5 hidden h-0.5 sm:block ${
                                              progress >
                                              step.step
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

                            <div className="mt-6 flex items-center gap-2 rounded-xl bg-white p-3 text-[9px] text-[#817666]">
                              <Clock3
                                size={
                                  13
                                }
                                className="text-[#b9975b]"
                              />

                              Order placed on{" "}
                              <strong className="text-[#4c443a]">
                                {formatDateTime(
                                  order.created_at
                                )}
                              </strong>
                            </div>
                          </div>
                        )}

                        {/* EXPANDED DETAILS */}

                        {expanded && (
                          <div className="border-t border-[#eee6d8] bg-white p-5 sm:p-6">
                            <div className="grid gap-4 md:grid-cols-3">
                              {/* PAYMENT */}

                              <div className="rounded-2xl border border-[#eadfc9] bg-[#fcfaf6] p-4">
                                <div className="flex items-center gap-2">
                                  <BadgeCheck
                                    size={
                                      15
                                    }
                                    className="text-[#b9975b]"
                                  />

                                  <p className="text-[11px] font-black">
                                    Payment
                                  </p>
                                </div>

                                <p className="mt-3 text-xs font-bold text-[#4c443a]">
                                  {getPayment(
                                    order.payment_method
                                  )}
                                </p>
                              </div>

                              {/* ADDRESS */}

                              <div className="rounded-2xl border border-[#eadfc9] bg-[#fcfaf6] p-4">
                                <div className="flex items-center gap-2">
                                  <Home
                                    size={
                                      15
                                    }
                                    className="text-[#b9975b]"
                                  />

                                  <p className="text-[11px] font-black">
                                    Delivery
                                    Address
                                  </p>
                                </div>

                                {order.shipping_address ? (
                                  <>
                                    <p className="mt-3 text-xs font-black">
                                      {
                                        order
                                          .shipping_address
                                          .name
                                      }
                                    </p>

                                    <p className="mt-1 text-[9px] leading-4 text-[#817666]">
                                      {getAddress(
                                        order.shipping_address
                                      )}
                                    </p>

                                    {order
                                      .shipping_address
                                      .phone && (
                                      <p className="mt-1 text-[9px] text-[#817666]">
                                        {
                                          order
                                            .shipping_address
                                            .phone
                                        }
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <p className="mt-3 text-[9px] text-[#817666]">
                                    Address
                                    information
                                    unavailable.
                                  </p>
                                )}
                              </div>

                              {/* SUMMARY */}

                              <div className="rounded-2xl border border-[#eadfc9] bg-[#fcfaf6] p-4">
                                <div className="flex items-center gap-2">
                                  <WalletCards
                                    size={
                                      15
                                    }
                                    className="text-[#b9975b]"
                                  />

                                  <p className="text-[11px] font-black">
                                    Price
                                    Summary
                                  </p>
                                </div>

                                <div className="mt-3 space-y-2 text-[9px]">
                                  {order.subtotal !=
                                    null && (
                                    <div className="flex justify-between">
                                      <span className="text-[#817666]">
                                        Subtotal
                                      </span>

                                      <strong>
                                        {formatPrice(
                                          Number(
                                            order.subtotal
                                          )
                                        )}
                                      </strong>
                                    </div>
                                  )}

                                  {Number(
                                    order.discount ||
                                      0
                                  ) >
                                    0 && (
                                    <div className="flex justify-between text-emerald-600">
                                      <span>
                                        Discount
                                      </span>

                                      <strong>
                                        -
                                        {formatPrice(
                                          Number(
                                            order.discount
                                          )
                                        )}
                                      </strong>
                                    </div>
                                  )}

                                  {order.delivery_charge !=
                                    null && (
                                    <div className="flex justify-between">
                                      <span className="text-[#817666]">
                                        Delivery
                                      </span>

                                      <strong>
                                        {Number(
                                          order.delivery_charge
                                        ) ===
                                        0
                                          ? "FREE"
                                          : formatPrice(
                                              Number(
                                                order.delivery_charge
                                              )
                                            )}
                                      </strong>
                                    </div>
                                  )}

                                  <div className="flex justify-between border-t border-dashed border-[#ddd2c0] pt-2">
                                    <strong>
                                      Total
                                    </strong>

                                    <strong className="text-[#927000]">
                                      {formatPrice(
                                        Number(
                                          order.total_amount
                                        )
                                      )}
                                    </strong>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* ALL ITEMS */}

                            {items.length >
                              3 && (
                              <div className="mt-4 rounded-2xl border border-[#eadfc9] bg-[#fcfaf6] p-4">
                                <p className="mb-3 text-[11px] font-black">
                                  All Products
                                </p>

                                <div className="space-y-2">
                                  {items
                                    .slice(
                                      3
                                    )
                                    .map(
                                      (
                                        item
                                      ) => (
                                        <div
                                          key={
                                            item.id
                                          }
                                          className="flex items-center gap-3 rounded-xl bg-white p-3"
                                        >
                                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#f7f2e9]">
                                            <ProductImage
                                              src={
                                                item.image_url
                                              }
                                              alt={
                                                item.product_name
                                              }
                                            />
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <p className="truncate text-[10px] font-black">
                                              {
                                                item.product_name
                                              }
                                            </p>

                                            <p className="mt-1 text-[9px] text-[#817666]">
                                              Qty{" "}
                                              {
                                                item.quantity
                                              }
                                            </p>
                                          </div>

                                          <p className="text-[10px] font-black text-[#927000]">
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

                        {/* FOOTER */}

                        <div className="flex flex-col gap-3 border-t border-[#eee6d8] bg-[#fffdf8] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                          <div className="flex items-center gap-2">
                            <ShieldCheck
                              size={
                                14
                              }
                              className="text-emerald-600"
                            />

                            <span className="text-[9px] font-semibold text-[#817666]">
                              Secure
                              PrimeCart
                              order
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setTrackingOrder(
                                  tracking
                                    ? null
                                    : order.id
                                )
                              }
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[9px] font-black transition ${
                                tracking
                                  ? "border-[#b9975b] bg-[#fff8e8] text-[#927000]"
                                  : "border-[#e2d8c8] bg-white text-[#756b5d] hover:border-[#b9975b] hover:text-[#927000]"
                              }`}
                            >
                              <Truck
                                size={
                                  13
                                }
                              />

                              {tracking
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
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2d8c8] bg-white px-3.5 py-2.5 text-[9px] font-black text-[#756b5d] hover:border-[#b9975b] hover:text-[#927000]"
                            >
                              <RefreshCw
                                size={
                                  13
                                }
                              />

                              Buy Again
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedOrder(
                                  expanded
                                    ? null
                                    : order.id
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#17130d] px-3.5 py-2.5 text-[9px] font-black text-white hover:bg-[#b9975b]"
                            >
                              {expanded
                                ? "Hide Details"
                                : "View Details"}

                              {expanded ? (
                                <ChevronUp
                                  size={
                                    13
                                  }
                                />
                              ) : (
                                <ChevronDown
                                  size={
                                    13
                                  }
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}

          {/* TRUST */}

          {!loading &&
            orders.length >
              0 && (
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-2xl border border-[#eadfc9] bg-white p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f0df] text-[#927000]">
                    <ShieldCheck
                      size={18}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-black">
                      Secure Orders
                    </p>

                    <p className="mt-1 text-[8px] text-[#817666]">
                      Your order
                      information stays
                      protected.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[#eadfc9] bg-white p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f0df] text-[#927000]">
                    <Truck
                      size={18}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-black">
                      Reliable Delivery
                    </p>

                    <p className="mt-1 text-[8px] text-[#817666]">
                      Follow your order
                      from placement to
                      delivery.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[#eadfc9] bg-white p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f0df] text-[#927000]">
                    <BadgeCheck
                      size={18}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-black">
                      PrimeCart Support
                    </p>

                    <p className="mt-1 text-[8px] text-[#817666]">
                      Everything you need
                      for your shopping
                      journey.
                    </p>
                  </div>
                </div>
              </div>
            )}
        </main>
      </div>

      {/* TOAST */}

      {message && (
        <div className="fixed bottom-5 left-1/2 z-[100] w-[calc(100%-32px)] max-w-md -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl border border-[#dcccaf] bg-white p-3 shadow-[0_15px_40px_rgba(50,35,10,0.18)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7f0df] text-[#927000]">
              <CheckCircle2
                size={17}
              />
            </div>

            <p className="flex-1 text-[10px] font-bold text-[#51483d]">
              {message}
            </p>

            <Link
              href="/dashboard/cart"
              className="rounded-lg bg-[#17130d] px-3 py-2 text-[9px] font-black text-white"
            >
              Cart
            </Link>
          </div>
        </div>
      )}

      {/* ANIMATION */}

      <style jsx global>{`
        @keyframes orderIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
