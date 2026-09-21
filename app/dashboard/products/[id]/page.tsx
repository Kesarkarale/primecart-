"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Home,
  Lock,
  MapPin,
  PackageCheck,
  Pencil,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Truck,
  WalletCards,
} from "lucide-react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

type Address = {
  id: string;
  fullName: string;
  mobile: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  type: "Home" | "Work";
};

const DELIVERY_CHARGE = 0;
const FREE_DELIVERY_LIMIT = 999;

function getImageUrl(value: string | null) {
  if (!value) return null;

  const image = value.trim();

  if (!image) return null;

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

function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem("primecart-cart");

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    "primecart-cart",
    JSON.stringify(cart),
  );

  window.dispatchEvent(new Event("cart-updated"));
}

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [selectedAddress, setSelectedAddress] =
    useState<string>("");

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [editingAddress, setEditingAddress] =
    useState<Address | null>(null);

  const [showItems, setShowItems] =
    useState(true);

  const [paymentMethod, setPaymentMethod] =
    useState<"cod" | "online">("cod");

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] =
    useState(false);

  const [couponMessage, setCouponMessage] =
    useState("");

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    type: "Home" as "Home" | "Work",
  });

  useEffect(() => {
    const items = getCart();

    setCart(items);

    try {
      const savedAddresses =
        localStorage.getItem(
          "primecart-addresses",
        );

      if (savedAddresses) {
        const parsed = JSON.parse(
          savedAddresses,
        );

        if (
          Array.isArray(parsed) &&
          parsed.length > 0
        ) {
          setAddresses(parsed);
          setSelectedAddress(parsed[0].id);
        }
      }
    } catch {
      // Ignore invalid local storage.
    }

    setLoading(false);
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.price) *
          Number(item.quantity),
      0,
    );
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + Number(item.quantity),
      0,
    );
  }, [cart]);

  const discount = couponApplied
    ? Math.min(
        Math.round(subtotal * 0.1),
        500,
      )
    : 0;

  const deliveryCharge =
    subtotal >= FREE_DELIVERY_LIMIT
      ? 0
      : subtotal > 0
        ? 49
        : 0;

  const total =
    subtotal -
    discount +
    deliveryCharge;

  function updateQuantity(
    productId: string,
    change: number,
  ) {
    setCart((current) => {
      const updated = current
        .map((item) => {
          if (item.id !== productId) {
            return item;
          }

          return {
            ...item,
            quantity: Math.max(
              1,
              Number(item.quantity) + change,
            ),
          };
        })
        .filter(
          (item) => Number(item.quantity) > 0,
        );

      saveCart(updated);

      return updated;
    });
  }

  function removeItem(productId: string) {
    setCart((current) => {
      const updated = current.filter(
        (item) => item.id !== productId,
      );

      saveCart(updated);

      return updated;
    });
  }

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();

    if (!code) {
      setCouponMessage(
        "Please enter a coupon code.",
      );
      return;
    }

    if (code === "PRIME10") {
      setCouponApplied(true);
      setCouponMessage(
        "Coupon applied! You saved 10% on your order.",
      );
    } else {
      setCouponApplied(false);
      setCouponMessage(
        "Invalid coupon. Try PRIME10.",
      );
    }
  }

  function openNewAddress() {
    setEditingAddress(null);

    setForm({
      fullName: "",
      mobile: "",
      address: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      type: "Home",
    });

    setShowAddressForm(true);
  }

  function editAddress(address: Address) {
    setEditingAddress(address);

    setForm({
      fullName: address.fullName,
      mobile: address.mobile,
      address: address.address,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      type: address.type,
    });

    setShowAddressForm(true);
  }

  function saveAddress() {
    if (
      !form.fullName.trim() ||
      !form.mobile.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    ) {
      alert(
        "Please fill all required address fields.",
      );
      return;
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      alert(
        "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      alert(
        "Please enter a valid 6-digit pincode.",
      );
      return;
    }

    let updatedAddresses: Address[];

    if (editingAddress) {
      updatedAddresses = addresses.map(
        (address) =>
          address.id === editingAddress.id
            ? {
                ...address,
                ...form,
              }
            : address,
      );
    } else {
      const newAddress: Address = {
        id: `address-${Date.now()}`,
        ...form,
      };

      updatedAddresses = [
        ...addresses,
        newAddress,
      ];

      setSelectedAddress(newAddress.id);
    }

    setAddresses(updatedAddresses);

    localStorage.setItem(
      "primecart-addresses",
      JSON.stringify(updatedAddresses),
    );

    setShowAddressForm(false);
    setEditingAddress(null);
  }

  function placeOrder() {
    if (placingOrder) return;

    if (!selectedAddress) {
      alert(
        "Please select a delivery address.",
      );
      return;
    }

    if (cart.length === 0) {
      router.push("/dashboard/products");
      return;
    }

    setPlacingOrder(true);

    /*
     * For now this completes the checkout UI flow.
     * Supabase order insertion can be connected to
     * the exact orders/order_items schema separately.
     */

    const orderId =
      `PC-${Date.now().toString().slice(-8)}`;

    const selected =
      addresses.find(
        (address) =>
          address.id === selectedAddress,
      );

    const orderData = {
      orderId,
      items: cart,
      address: selected,
      paymentMethod,
      subtotal,
      discount,
      deliveryCharge,
      total,
      createdAt:
        new Date().toISOString(),
    };

    localStorage.setItem(
      "primecart-last-order",
      JSON.stringify(orderData),
    );

    saveCart([]);

    window.setTimeout(() => {
      router.push(
        `/dashboard/order-success?order=${orderId}`,
      );
    }, 800);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-7 w-52 animate-pulse rounded bg-[var(--muted)]" />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_390px]">
            <div className="h-100 animate-pulse rounded-3xl bg-[var(--muted)]" />
            <div className="h-120 animate-pulse rounded-3xl bg-[var(--muted)]" />
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)] px-4 py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--muted)]">
            <ShoppingBag className="h-9 w-9 text-[var(--gold)]" />
          </div>

          <h1 className="mt-6 text-2xl font-black">
            Your cart is empty
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Add some products to your cart before
            proceeding to checkout.
          </p>

          <Link
            href="/dashboard/products"
            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--gold)] px-6 text-sm font-bold text-white transition hover:bg-[var(--gold-dark)]"
          >
            Browse Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Top Checkout Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gold)] shadow-md shadow-[var(--gold)]/20">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>

              <span className="text-xl font-black tracking-tight">
                Prime<span className="text-[var(--gold)]">
                  Cart
                </span>
              </span>
            </Link>

            <div className="hidden items-center gap-2 text-sm font-semibold text-[var(--muted-foreground)] sm:flex">
              <Lock className="h-4 w-4 text-emerald-600" />
              Secure Checkout
            </div>

            <Link
              href="/dashboard/products"
              className="flex items-center gap-1.5 text-sm font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--gold-dark)]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                Continue Shopping
              </span>
              <span className="sm:hidden">
                Back
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Checkout Progress */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-center gap-2 sm:gap-5">
            <div className="flex items-center gap-2 text-xs font-bold sm:text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--gold)] text-white">
                <Check className="h-4 w-4" />
              </span>
              Cart
            </div>

            <div className="h-px w-8 bg-[var(--gold)] sm:w-16" />

            <div className="flex items-center gap-2 text-xs font-bold text-[var(--gold-dark)] sm:text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--gold)] text-white">
                2
              </span>
              Delivery
            </div>

            <div className="h-px w-8 bg-[var(--border)] sm:w-16" />

            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)] sm:text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)]">
                3
              </span>
              Payment
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold-dark)]">
            PrimeCart Checkout
          </p>

          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Complete your order
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Review your items, delivery address and
            payment method.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_390px] lg:items-start">
          {/* LEFT */}
          <div className="space-y-5">
            {/* Delivery Address */}
            <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--muted)]">
                    <MapPin className="h-4.5 w-4.5 text-[var(--gold)]" />
                  </div>

                  <div>
                    <h2 className="font-black">
                      Delivery Address
                    </h2>

                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openNewAddress}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--gold)] px-3 py-2 text-xs font-bold text-[var(--gold-dark)] transition hover:bg-[var(--muted)]"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    Add New
                  </span>
                </button>
              </div>

              <div className="p-5 sm:p-6">
                {addresses.length === 0 ? (
                  <button
                    type="button"
                    onClick={openNewAddress}
                    className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--gold)] bg-[var(--muted)]/50 px-5 py-9 text-center transition hover:bg-[var(--muted)]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--card)] shadow-sm">
                      <Plus className="h-5 w-5 text-[var(--gold)]" />
                    </div>

                    <p className="mt-4 text-sm font-bold">
                      Add a delivery address
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Enter your address to continue.
                    </p>
                  </button>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() =>
                          setSelectedAddress(
                            address.id,
                          )
                        }
                        className={`cursor-pointer rounded-2xl border p-4 transition ${
                          selectedAddress ===
                          address.id
                            ? "border-[var(--gold)] bg-[var(--muted)] shadow-sm"
                            : "border-[var(--border)] hover:border-[var(--gold)]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              selectedAddress ===
                              address.id
                                ? "border-[var(--gold)] bg-[var(--gold)]"
                                : "border-[var(--border)]"
                            }`}
                          >
                            {selectedAddress ===
                              address.id && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-black">
                                {address.fullName}
                              </span>

                              <span className="rounded-md bg-[var(--card)] px-2 py-0.5 text-[10px] font-bold">
                                {address.type}
                              </span>
                            </div>

                            <p className="mt-1 text-xs font-semibold text-[var(--muted-foreground)]">
                              {address.mobile}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                              {address.address}
                              {address.landmark
                                ? `, ${address.landmark}`
                                : ""}
                              , {address.city},{" "}
                              {address.state} -{" "}
                              {address.pincode}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              editAddress(address);
                            }}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] transition hover:bg-[var(--card)]"
                            aria-label="Edit address"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Address Form */}
            {showAddressForm && (
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
                  <h2 className="font-black">
                    {editingAddress
                      ? "Edit Address"
                      : "Add New Address"}
                  </h2>

                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Enter your delivery details.
                  </p>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-bold">
                      Full Name *
                    </label>

                    <input
                      value={form.fullName}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          fullName:
                            e.target.value,
                        })
                      }
                      placeholder="Enter full name"
                      className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-sm outline-none transition focus:border-[var(--gold)]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold">
                      Mobile Number *
                    </label>

                    <input
                      value={form.mobile}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          mobile:
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                        })
                      }
                      inputMode="numeric"
                      placeholder="10-digit mobile"
                      className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-sm outline-none transition focus:border-[var(--gold)]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold">
                      Pincode *
                    </label>

                    <input
                      value={form.pincode}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          pincode:
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6),
                        })
                      }
                      inputMode="numeric"
                      placeholder="6-digit pincode"
                      className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-sm outline-none transition focus:border-[var(--gold)]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-bold">
                      Address *
                    </label>

                    <textarea
                      value={form.address}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          address:
                            e.target.value,
                        })
                      }
                      placeholder="House No., Building, Street, Area"
                      rows={3}
                      className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-3 text-sm outline-none transition focus:border-[var(--gold)]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold">
                      Landmark
                    </label>

                    <input
                      value={form.landmark}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          landmark:
                            e.target.value,
                        })
                      }
                      placeholder="Nearby landmark"
                      className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-sm outline-none transition focus:border-[var(--gold)]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold">
                      City *
                    </label>

                    <input
                      value={form.city}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          city:
                            e.target.value,
                        })
                      }
                      placeholder="City"
                      className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-sm outline-none transition focus:border-[var(--gold)]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold">
                      State *
                    </label>

                    <input
                      value={form.state}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          state:
                            e.target.value,
                        })
                      }
                      placeholder="State"
                      className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-sm outline-none transition focus:border-[var(--gold)]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold">
                      Address Type
                    </label>

                    <div className="flex gap-2">
                      {(
                        ["Home", "Work"] as const
                      ).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              type,
                            })
                          }
                          className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-bold transition ${
                            form.type === type
                              ? "border-[var(--gold)] bg-[var(--muted)] text-[var(--gold-dark)]"
                              : "border-[var(--border)]"
                          }`}
                        >
                          {type === "Home" ? (
                            <Home className="h-4 w-4" />
                          ) : (
                            <PackageCheck className="h-4 w-4" />
                          )}
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 sm:col-span-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setShowAddressForm(false)
                      }
                      className="h-11 rounded-xl border border-[var(--border)] px-5 text-sm font-bold"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={saveAddress}
                      className="h-11 rounded-xl bg-[var(--gold)] px-6 text-sm font-bold text-white transition hover:bg-[var(--gold-dark)]"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Order Items */}
            <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
              <button
                type="button"
                onClick={() =>
                  setShowItems((value) => !value)
                }
                className="flex w-full items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4 text-left sm:px-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--muted)]">
                    <ShoppingBag className="h-4.5 w-4.5 text-[var(--gold)]" />
                  </div>

                  <div>
                    <h2 className="font-black">
                      Order Items
                    </h2>

                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                      {totalItems}{" "}
                      {totalItems === 1
                        ? "item"
                        : "items"}{" "}
                      in your order
                    </p>
                  </div>
                </div>

                {showItems ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              {showItems && (
                <div className="divide-y divide-[var(--border)]">
                  {cart.map((item) => {
                    const image = getImageUrl(
                      item.image_url,
                    );

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 p-5 sm:p-6"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)] sm:h-24 sm:w-24">
                          {image ? (
                            <Image
                              src={image}
                              alt={item.name}
                              fill
                              className="object-contain p-2"
                              sizes="96px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-[var(--muted-foreground)]">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="line-clamp-2 text-sm font-bold sm:text-base">
                                {item.name}
                              </h3>

                              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                                Sold by PrimeCart
                              </p>
                            </div>

                            <p className="shrink-0 text-sm font-black sm:text-base">
                              {formatPrice(
                                Number(
                                  item.price,
                                ) *
                                  Number(
                                    item.quantity,
                                  ),
                              )}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center overflow-hidden rounded-lg border border-[var(--border)]">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    -1,
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center text-sm transition hover:bg-[var(--muted)]"
                              >
                                −
                              </button>

                              <span className="flex h-8 w-9 items-center justify-center border-x border-[var(--border)] text-xs font-bold">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    1,
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center text-sm transition hover:bg-[var(--muted)]"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeItem(
                                  item.id,
                                )
                              }
                              className="text-xs font-bold text-red-500 transition hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Payment */}
            <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
              <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--muted)]">
                    <CreditCard className="h-4.5 w-4.5 text-[var(--gold)]" />
                  </div>

                  <div>
                    <h2 className="font-black">
                      Payment Method
                    </h2>

                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                      Choose how you'd like to pay.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-5 sm:p-6">
                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod("cod")
                  }
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    paymentMethod === "cod"
                      ? "border-[var(--gold)] bg-[var(--muted)]"
                      : "border-[var(--border)] hover:border-[var(--gold)]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      paymentMethod === "cod"
                        ? "bg-[var(--gold)] text-white"
                        : "bg-[var(--muted)] text-[var(--gold)]"
                    }`}
                  >
                    <WalletCards className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-black">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Pay when your order arrives.
                    </p>
                  </div>

                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      paymentMethod === "cod"
                        ? "border-[var(--gold)] bg-[var(--gold)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    {paymentMethod === "cod" && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod("online")
                  }
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    paymentMethod === "online"
                      ? "border-[var(--gold)] bg-[var(--muted)]"
                      : "border-[var(--border)] hover:border-[var(--gold)]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      paymentMethod === "online"
                        ? "bg-[var(--gold)] text-white"
                        : "bg-[var(--muted)] text-[var(--gold)]"
                    }`}
                  >
                    <Smartphone className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-black">
                      Online Payment
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      UPI, cards, net banking and wallets.
                    </p>
                  </div>

                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      paymentMethod === "online"
                        ? "border-[var(--gold)] bg-[var(--gold)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    {paymentMethod === "online" && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT - ORDER SUMMARY */}
          <aside className="lg:sticky lg:top-5">
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
              <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
                <h2 className="text-lg font-black">
                  Order Summary
                </h2>
              </div>

              <div className="p-5 sm:p-6">
                {/* Mini Items */}
                <div className="space-y-3">
                  {cart.slice(0, 3).map((item) => {
                    const image = getImageUrl(
                      item.image_url,
                    );

                    return (
                      <div
                        key={item.id}
                        className="flex gap-3"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]">
                          {image ? (
                            <Image
                              src={image}
                              alt={item.name}
                              fill
                              className="object-contain p-1"
                              sizes="56px"
                            />
                          ) : null}

                          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--foreground)] px-1 text-[9px] font-bold text-[var(--background)]">
                            {item.quantity}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-xs font-semibold leading-5">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs font-bold">
                          {formatPrice(
                            Number(item.price) *
                              Number(
                                item.quantity,
                              ),
                          )}
                        </span>
                      </div>
                    );
                  })}

                  {cart.length > 3 && (
                    <p className="pt-1 text-xs font-semibold text-[var(--gold-dark)]">
                      + {cart.length - 3} more{" "}
                      {cart.length - 3 === 1
                        ? "item"
                        : "items"}
                    </p>
                  )}
                </div>

                <div className="my-5 h-px bg-[var(--border)]" />

                {/* Coupon */}
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide">
                    Apply Coupon
                  </p>

                  <div className="flex gap-2">
                    <input
                      value={coupon}
                      onChange={(e) =>
                        setCoupon(
                          e.target.value.toUpperCase(),
                        )
                      }
                      placeholder="Enter coupon"
                      disabled={couponApplied}
                      className="h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold uppercase outline-none focus:border-[var(--gold)]"
                    />

                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponApplied}
                      className="h-11 rounded-xl border border-[var(--gold)] px-4 text-xs font-bold text-[var(--gold-dark)] transition hover:bg-[var(--muted)] disabled:opacity-50"
                    >
                      {couponApplied
                        ? "Applied"
                        : "Apply"}
                    </button>
                  </div>

                  {couponMessage && (
                    <p
                      className={`mt-2 text-xs font-semibold ${
                        couponApplied
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {couponMessage}
                    </p>
                  )}

                  {!couponApplied && (
                    <p className="mt-2 text-[10px] text-[var(--muted-foreground)]">
                      Try <b>PRIME10</b> to get 10%
                      off.
                    </p>
                  )}
                </div>

                <div className="my-5 h-px bg-[var(--border)]" />

                {/* Price */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--muted-foreground)]">
                      Price ({totalItems}{" "}
                      {totalItems === 1
                        ? "item"
                        : "items"})
                    </span>

                    <span className="font-semibold">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[var(--muted-foreground)]">
                      Delivery
                    </span>

                    {deliveryCharge === 0 ? (
                      <span className="font-bold text-emerald-600">
                        FREE
                      </span>
                    ) : (
                      <span className="font-semibold">
                        {formatPrice(
                          deliveryCharge,
                        )}
                      </span>
                    )}
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--muted-foreground)]">
                        Coupon Discount
                      </span>

                      <span className="font-bold text-emerald-600">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="my-5 h-px bg-[var(--border)]" />

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-base font-black">
                      Total
                    </p>

                    <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                      Inclusive of applicable taxes
                    </p>
                  </div>

                  <span className="text-2xl font-black">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Place Order */}
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={
                    placingOrder ||
                    !selectedAddress
                  }
                  className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--gold)] px-5 text-sm font-black text-white shadow-lg shadow-[var(--gold)]/20 transition hover:bg-[var(--gold-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {placingOrder ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      Place Order
                      <ArrowRight className="h-4.5 w-4.5" />
                    </>
                  )}
                </button>

                {!selectedAddress && (
                  <p className="mt-2 text-center text-[10px] font-semibold text-red-500">
                    Select a delivery address to
                    continue.
                  </p>
                )}

                {/* Security */}
                <div className="mt-5 rounded-xl bg-[var(--muted)] p-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                    <p className="text-[10px] leading-5 text-[var(--muted-foreground)]">
                      Your order is protected with
                      PrimeCart's secure checkout. Your
                      payment details are encrypted and
                      never stored without permission.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Promise */}
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--muted)]">
                  <Truck className="h-4.5 w-4.5 text-[var(--gold)]" />
                </div>

                <div>
                  <p className="text-sm font-black">
                    PrimeCart Delivery
                  </p>

                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Fast & reliable delivery
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Secure packaging
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Easy returns on eligible products
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Trusted payment experience
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <p className="text-xs text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} PrimeCart.
            Secure shopping made simple.
          </p>

          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            Secure Checkout
          </div>
        </div>
      </footer>
    </div>
  );
}
