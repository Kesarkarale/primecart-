"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  CreditCard,
  Edit3,
  Gift,
  Landmark,
  Lock,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  QrCode,
  ShieldCheck,
  Smartphone,
  Trash2,
  Truck,
  Wallet,
  X,
  Zap,
} from "lucide-react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  quantity: number;
  image_url?: string | null;
  brand?: string | null;
};

type Address = {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type: "Home" | "Work" | "Other";
};

type PaymentMethod =
  | "upi"
  | "card"
  | "netbanking"
  | "wallet"
  | "cod"
  | "emi";

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

const CART_KEY = "primecart-cart";
const ADDRESS_KEY = "primecart-addresses";
const ORDERS_KEY = "primecart-orders";

const defaultAddress: Address = {
  id: "default-address",
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  type: "Home",
};

const paymentOptions: {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}[] = [
  {
    id: "upi",
    title: "UPI",
    subtitle: "Google Pay, PhonePe, Paytm & more",
    icon: Smartphone,
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    subtitle: "Visa, Mastercard, RuPay & more",
    icon: CreditCard,
  },
  {
    id: "netbanking",
    title: "Net Banking",
    subtitle: "All major banks supported",
    icon: Landmark,
  },
  {
    id: "wallet",
    title: "Wallets",
    subtitle: "Paytm, Mobikwik & other wallets",
    icon: Wallet,
  },
  {
    id: "emi",
    title: "EMI",
    subtitle: "Easy monthly installments",
    icon: Building2,
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    subtitle: "Pay when your order arrives",
    icon: Banknote,
  },
];

function getImageUrl(value?: string | null) {
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
  return `₹${value.toLocaleString("en-IN")}`;
}

function getDiscount(price: number, original?: number | null) {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

export default function CheckoutPage() {
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("upi");

  const [expandedPayment, setExpandedPayment] =
    useState<PaymentMethod>("upi");

  const [selectedUpi, setSelectedUpi] = useState("gpay");
  const [upiId, setUpiId] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [selectedBank, setSelectedBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("paytm");

  const [emiMonths, setEmiMonths] = useState("6");

  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(
    null
  );

  const [addressForm, setAddressForm] =
    useState<Address>(defaultAddress);

  const [placingOrder, setPlacingOrder] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);

      if (savedCart) {
        const parsed = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }

      const savedAddresses = localStorage.getItem(ADDRESS_KEY);

      if (savedAddresses) {
        const parsed = JSON.parse(savedAddresses);

        if (Array.isArray(parsed)) {
          setAddresses(parsed);

          if (parsed.length > 0) {
            setSelectedAddressId(parsed[0].id);
          }
        }
      }
    } catch {
      setItems([]);
      setAddresses([]);
    }
  }, []);

  const selectedAddress = useMemo(() => {
    return (
      addresses.find((address) => address.id === selectedAddressId) ||
      null
    );
  }, [addresses, selectedAddressId]);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [items]);

  const totalMrp = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        (item.original_price || item.price) * item.quantity,
      0
    );
  }, [items]);

  const productDiscount = Math.max(totalMrp - subtotal, 0);

  const couponDiscount = couponApplied
    ? Math.min(Math.round(subtotal * 0.1), 500)
    : 0;

  const deliveryCharge =
    subtotal - couponDiscount >= 999 ? 0 : 49;

  const total = Math.max(
    subtotal - couponDiscount + deliveryCharge,
    0
  );

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  function updateQuantity(id: string, change: number) {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: Math.max(
                  1,
                  item.quantity + change
                ),
              }
            : item
        )
    );
  }

  function removeItem(id: string) {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function applyCoupon() {
    setCouponError("");

    if (!coupon.trim()) {
      setCouponError("Enter a coupon code.");
      return;
    }

    if (coupon.trim().toUpperCase() !== "PRIME10") {
      setCouponApplied(false);
      setCouponError("Invalid coupon code.");
      return;
    }

    setCouponApplied(true);
  }

  function saveAddress() {
    if (
      !addressForm.name.trim() ||
      !addressForm.phone.trim() ||
      !addressForm.address.trim() ||
      !addressForm.city.trim() ||
      !addressForm.state.trim() ||
      !addressForm.pincode.trim()
    ) {
      alert("Please fill all address details.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(addressForm.phone)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(addressForm.pincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    let updatedAddresses: Address[];

    if (editingAddressId) {
      updatedAddresses = addresses.map((address) =>
        address.id === editingAddressId
          ? addressForm
          : address
      );
    } else {
      updatedAddresses = [
        ...addresses,
        {
          ...addressForm,
          id: `address-${Date.now()}`,
        },
      ];
    }

    localStorage.setItem(
      ADDRESS_KEY,
      JSON.stringify(updatedAddresses)
    );

    setAddresses(updatedAddresses);

    const newAddressId = editingAddressId
      ? editingAddressId
      : updatedAddresses[updatedAddresses.length - 1].id;

    setSelectedAddressId(newAddressId);

    setAddressForm(defaultAddress);
    setEditingAddressId(null);
    setShowAddressForm(false);
  }

  function editAddress(address: Address) {
    setAddressForm(address);
    setEditingAddressId(address.id);
    setShowAddressForm(true);
  }

  function deleteAddress(id: string) {
    const updated = addresses.filter(
      (address) => address.id !== id
    );

    setAddresses(updated);
    localStorage.setItem(
      ADDRESS_KEY,
      JSON.stringify(updated)
    );

    if (selectedAddressId === id) {
      setSelectedAddressId(updated[0]?.id || "");
    }
  }

  function validatePayment() {
    if (paymentMethod === "upi") {
      if (selectedUpi === "upi-id") {
        if (!upiId.trim() || !upiId.includes("@")) {
          alert("Please enter a valid UPI ID.");
          return false;
        }
      }
    }

    if (paymentMethod === "card") {
      if (
        cardNumber.replace(/\s/g, "").length !== 16 ||
        !cardName.trim() ||
        cardExpiry.length !== 5 ||
        cardCvv.length !== 3
      ) {
        alert("Please enter valid card details.");
        return false;
      }
    }

    if (paymentMethod === "netbanking" && !selectedBank) {
      alert("Please select your bank.");
      return false;
    }

    if (paymentMethod === "wallet" && !selectedWallet) {
      alert("Please select a wallet.");
      return false;
    }

    return true;
  }

  function getPaymentLabel() {
    if (paymentMethod === "upi") {
      if (selectedUpi === "gpay") return "UPI - Google Pay";
      if (selectedUpi === "phonepe") return "UPI - PhonePe";
      if (selectedUpi === "paytm") return "UPI - Paytm";
      return "UPI";
    }

    if (paymentMethod === "card") return "Credit / Debit Card";
    if (paymentMethod === "netbanking") return "Net Banking";
    if (paymentMethod === "wallet") return `Wallet - ${selectedWallet}`;
    if (paymentMethod === "emi") return `EMI - ${emiMonths} months`;

    return "Cash on Delivery";
  }

  async function placeOrder() {
    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (!selectedAddress) {
      alert("Please select a delivery address.");
      return;
    }

    if (!validatePayment()) return;

    setPlacingOrder(true);

    try {
      const orderId = `PC-${Date.now()
        .toString()
        .slice(-8)}`;

      const order: OrderRecord = {
        id: orderId,
        createdAt: new Date().toISOString(),
        status: "Placed",
        paymentMethod: getPaymentLabel(),
        total,
        subtotal,
        delivery: deliveryCharge,
        discount: productDiscount + couponDiscount,
        address: selectedAddress,
        items,
      };

      const existingOrders = JSON.parse(
        localStorage.getItem(ORDERS_KEY) || "[]"
      );

      const updatedOrders = [
        order,
        ...(Array.isArray(existingOrders)
          ? existingOrders
          : []),
      ];

      localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify(updatedOrders)
      );

      localStorage.setItem(
        "primecart-last-order",
        JSON.stringify(order)
      );

      localStorage.removeItem(CART_KEY);

      await new Promise((resolve) =>
        setTimeout(resolve, 900)
      );

      router.push(
        `/dashboard/order-success?order=${orderId}`
      );
    } catch {
      alert("Something went wrong while placing your order.");
      setPlacingOrder(false);
    }
  }

  function formatCardNumber(value: string) {
    const numbers = value.replace(/\D/g, "").slice(0, 16);

    return numbers.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(value: string) {
    const numbers = value.replace(/\D/g, "").slice(0, 4);

    if (numbers.length > 2) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    }

    return numbers;
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#faf8f3]">
        <div className="mx-auto flex min-h-[75vh] max-w-5xl items-center justify-center px-5 py-12">
          <div className="w-full max-w-xl rounded-[32px] border border-[#eadfc9] bg-white p-10 text-center shadow-[0_25px_80px_rgba(60,40,10,0.08)]">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f7f0df] text-[#a47d3d]">
              <Package size={34} />
            </div>

            <h1 className="text-3xl font-bold text-[#17130d]">
              Your cart is empty
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#756b5d]">
              Add some products to your cart and come back
              here to complete your order.
            </p>

            <Link
              href="/dashboard/products"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#b9975b] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#977538]"
            >
              Continue Shopping
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#17130d]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#eadfc9] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1450px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/cart"
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b9975b] text-white shadow-sm">
              <ArrowLeft size={19} />
            </div>

            <div>
              <p className="text-base font-bold">
                Checkout
              </p>
              <p className="hidden text-[11px] text-[#887d6c] sm:block">
                Secure & easy payment
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <div className="flex items-center gap-2 text-[#977538]">
              <ShieldCheck size={19} />
              <span className="text-xs font-semibold">
                100% Secure Checkout
              </span>
            </div>

            <div className="h-5 w-px bg-[#eadfc9]" />

            <div className="flex items-center gap-2 text-[#756b5d]">
              <Lock size={17} />
              <span className="text-xs font-semibold">
                Your data is protected
              </span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-semibold text-[#756b5d] transition hover:text-[#977538]"
          >
            Continue Shopping
          </Link>
        </div>
      </header>

      {/* PROGRESS */}
      <div className="border-b border-[#eadfc9] bg-white">
        <div className="mx-auto max-w-[1450px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-3xl items-center justify-center">
            {[
              ["1", "Cart"],
              ["2", "Address"],
              ["3", "Payment"],
              ["4", "Confirmation"],
            ].map(([number, label], index) => (
              <div
                key={number}
                className="flex flex-1 items-center"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      index <= 2
                        ? "bg-[#b9975b] text-white"
                        : "bg-[#f4efe5] text-[#a49a8b]"
                    }`}
                  >
                    {index < 2 ? (
                      <Check size={15} />
                    ) : (
                      number
                    )}
                  </div>

                  <span
                    className={`hidden text-xs font-semibold sm:block ${
                      index <= 2
                        ? "text-[#514839]"
                        : "text-[#a49a8b]"
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {index < 3 && (
                  <div className="mx-2 h-px flex-1 bg-[#eadfc9] sm:mx-5" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] xl:gap-8">
          {/* LEFT */}
          <div className="space-y-5">
            {/* ADDRESS */}
            <section className="overflow-hidden rounded-[24px] border border-[#eadfc9] bg-white shadow-[0_12px_35px_rgba(70,45,10,0.05)]">
              <div className="flex items-center justify-between border-b border-[#eee6d8] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7f0df] text-[#a47d3d]">
                    <MapPin size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold">
                      Delivery Address
                    </h2>
                    <p className="text-xs text-[#8b8070]">
                      Choose where you want your order delivered
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setAddressForm(defaultAddress);
                    setEditingAddressId(null);
                    setShowAddressForm(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8c7a5] px-3 py-2 text-xs font-bold text-[#977538] transition hover:bg-[#fbf7ee]"
                >
                  <Plus size={15} />
                  Add New
                </button>
              </div>

              <div className="space-y-3 p-5 sm:p-6">
                {addresses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#d9cdb9] bg-[#fcfaf6] p-7 text-center">
                    <MapPin
                      size={25}
                      className="mx-auto text-[#b9975b]"
                    />

                    <p className="mt-3 text-sm font-bold">
                      Add a delivery address
                    </p>

                    <p className="mt-1 text-xs text-[#887d6c]">
                      We need your address to calculate delivery
                    </p>

                    <button
                      onClick={() => {
                        setAddressForm(defaultAddress);
                        setEditingAddressId(null);
                        setShowAddressForm(true);
                      }}
                      className="mt-4 rounded-xl bg-[#b9975b] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#977538]"
                    >
                      Add Address
                    </button>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() =>
                        setSelectedAddressId(address.id)
                      }
                      className={`cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
                        selectedAddressId === address.id
                          ? "border-[#b9975b] bg-[#fcfaf6] shadow-[0_8px_25px_rgba(185,151,91,0.12)]"
                          : "border-[#eee6d8] bg-white hover:border-[#d6c39f]"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            selectedAddressId === address.id
                              ? "border-[#b9975b]"
                              : "border-[#cfc5b5]"
                          }`}
                        >
                          {selectedAddressId ===
                            address.id && (
                            <div className="h-2.5 w-2.5 rounded-full bg-[#b9975b]" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold">
                              {address.name}
                            </span>

                            <span className="rounded-md bg-[#f4efe5] px-2 py-1 text-[10px] font-bold text-[#80683f]">
                              {address.type}
                            </span>
                          </div>

                          <p className="mt-1 text-xs font-medium text-[#655c50]">
                            {address.phone}
                          </p>

                          <p className="mt-2 text-xs leading-5 text-[#756b5d]">
                            {address.address},{" "}
                            {address.city},{" "}
                            {address.state} -{" "}
                            {address.pincode}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-start gap-1">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              editAddress(address);
                            }}
                            className="rounded-lg p-2 text-[#8c806e] transition hover:bg-[#f5f0e6] hover:text-[#977538]"
                            title="Edit"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteAddress(address.id);
                            }}
                            className="rounded-lg p-2 text-[#a78c8c] transition hover:bg-red-50 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* ADDRESS FORM */}
                {showAddressForm && (
                  <div className="animate-in fade-in slide-in-from-top-2 rounded-2xl border border-[#d9c9aa] bg-[#fcfaf6] p-4 duration-300 sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold">
                          {editingAddressId
                            ? "Edit Address"
                            : "Add New Address"}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-[#8b8070]">
                          Enter your delivery details
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setShowAddressForm(false)
                        }
                        className="rounded-lg p-1.5 text-[#877b6b] hover:bg-[#eee6d8]"
                      >
                        <X size={17} />
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        value={addressForm.name}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="Full name"
                        className="h-11 rounded-xl border border-[#ddd2c0] bg-white px-3 text-sm outline-none transition focus:border-[#b9975b] focus:ring-2 focus:ring-[#b9975b]/10"
                      />

                      <div className="relative">
                        <Phone
                          size={15}
                          className="absolute left-3 top-3.5 text-[#9c9180]"
                        />
                        <input
                          value={addressForm.phone}
                          maxLength={10}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              phone: e.target.value
                                .replace(/\D/g, ""),
                            })
                          }
                          placeholder="Mobile number"
                          className="h-11 w-full rounded-xl border border-[#ddd2c0] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#b9975b] focus:ring-2 focus:ring-[#b9975b]/10"
                        />
                      </div>

                      <input
                        value={addressForm.address}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            address: e.target.value,
                          })
                        }
                        placeholder="House no., Building, Street"
                        className="h-11 rounded-xl border border-[#ddd2c0] bg-white px-3 text-sm outline-none transition focus:border-[#b9975b] focus:ring-2 focus:ring-[#b9975b]/10 sm:col-span-2"
                      />

                      <input
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            city: e.target.value,
                          })
                        }
                        placeholder="City"
                        className="h-11 rounded-xl border border-[#ddd2c0] bg-white px-3 text-sm outline-none focus:border-[#b9975b]"
                      />

                      <input
                        value={addressForm.state}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            state: e.target.value,
                          })
                        }
                        placeholder="State"
                        className="h-11 rounded-xl border border-[#ddd2c0] bg-white px-3 text-sm outline-none focus:border-[#b9975b]"
                      />

                      <input
                        value={addressForm.pincode}
                        maxLength={6}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            pincode: e.target.value
                              .replace(/\D/g, ""),
                          })
                        }
                        placeholder="Pincode"
                        className="h-11 rounded-xl border border-[#ddd2c0] bg-white px-3 text-sm outline-none focus:border-[#b9975b]"
                      />

                      <select
                        value={addressForm.type}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            type: e.target.value as Address["type"],
                          })
                        }
                        className="h-11 rounded-xl border border-[#ddd2c0] bg-white px-3 text-sm outline-none focus:border-[#b9975b]"
                      >
                        <option>Home</option>
                        <option>Work</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() =>
                          setShowAddressForm(false)
                        }
                        className="rounded-xl border border-[#ddd2c0] px-4 py-2.5 text-xs font-bold"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={saveAddress}
                        className="rounded-xl bg-[#b9975b] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#977538]"
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* PAYMENT */}
            <section className="overflow-hidden rounded-[24px] border border-[#eadfc9] bg-white shadow-[0_12px_35px_rgba(70,45,10,0.05)]">
              <div className="border-b border-[#eee6d8] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7f0df] text-[#a47d3d]">
                    <CreditCard size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold">
                      Payment Method
                    </h2>
                    <p className="text-xs text-[#8b8070]">
                      Select your preferred payment option
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="overflow-hidden rounded-2xl border border-[#e9dfce]">
                  {paymentOptions.map((option, index) => {
                    const Icon = option.icon;
                    const selected =
                      paymentMethod === option.id;
                    const expanded =
                      expandedPayment === option.id;

                    return (
                      <div
                        key={option.id}
                        className={
                          index !== paymentOptions.length - 1
                            ? "border-b border-[#eee6d8]"
                            : ""
                        }
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentMethod(option.id);
                            setExpandedPayment(option.id);
                          }}
                          className={`flex w-full items-center gap-3 p-4 text-left transition ${
                            selected
                              ? "bg-[#fcfaf6]"
                              : "bg-white hover:bg-[#fcfaf6]"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              selected
                                ? "bg-[#f3e7cd] text-[#977538]"
                                : "bg-[#f7f4ee] text-[#817666]"
                            }`}
                          >
                            <Icon size={19} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">
                                {option.title}
                              </span>

                              {option.id === "upi" && (
                                <span className="rounded-full bg-[#e9f7ee] px-2 py-0.5 text-[9px] font-bold text-green-700">
                                  RECOMMENDED
                                </span>
                              )}
                            </div>

                            <p className="mt-0.5 text-[11px] text-[#8a7e6d]">
                              {option.subtitle}
                            </p>
                          </div>

                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              selected
                                ? "border-[#b9975b]"
                                : "border-[#cfc5b6]"
                            }`}
                          >
                            {selected && (
                              <div className="h-2.5 w-2.5 rounded-full bg-[#b9975b]" />
                            )}
                          </div>

                          {expanded ? (
                            <ChevronUp
                              size={16}
                              className="text-[#a0907a]"
                            />
                          ) : (
                            <ChevronDown
                              size={16}
                              className="text-[#a0907a]"
                            />
                          )}
                        </button>

                        {selected && expanded && (
                          <div className="animate-in fade-in slide-in-from-top-1 border-t border-[#eee6d8] bg-[#fcfaf6] p-4 duration-300 sm:p-5">
                            {/* UPI */}
                            {option.id === "upi" && (
                              <div>
                                <p className="mb-3 text-xs font-bold text-[#655c50]">
                                  Pay using UPI
                                </p>

                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                  {[
                                    ["gpay", "Google Pay"],
                                    ["phonepe", "PhonePe"],
                                    ["paytm", "Paytm"],
                                    ["upi-id", "Other UPI"],
                                  ].map(([id, label]) => (
                                    <button
                                      key={id}
                                      onClick={() =>
                                        setSelectedUpi(id)
                                      }
                                      className={`rounded-xl border p-3 text-center transition ${
                                        selectedUpi === id
                                          ? "border-[#b9975b] bg-white shadow-sm"
                                          : "border-[#e2d8c7] bg-white hover:border-[#cdb88d]"
                                      }`}
                                    >
                                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f0e6] text-[#977538]">
                                        {id === "upi-id" ? (
                                          <QrCode size={18} />
                                        ) : (
                                          <Smartphone size={18} />
                                        )}
                                      </div>

                                      <span className="mt-2 block text-[10px] font-bold">
                                        {label}
                                      </span>
                                    </button>
                                  ))}
                                </div>

                                {selectedUpi === "upi-id" && (
                                  <div className="mt-4">
                                    <label className="mb-1.5 block text-xs font-bold">
                                      Enter UPI ID
                                    </label>

                                    <input
                                      value={upiId}
                                      onChange={(e) =>
                                        setUpiId(e.target.value)
                                      }
                                      placeholder="yourname@upi"
                                      className="h-11 w-full rounded-xl border border-[#dcd1c0] bg-white px-3 text-sm outline-none focus:border-[#b9975b] focus:ring-2 focus:ring-[#b9975b]/10"
                                    />
                                  </div>
                                )}

                                <div className="mt-4 flex items-start gap-2 rounded-xl bg-white p-3">
                                  <ShieldCheck
                                    size={16}
                                    className="mt-0.5 shrink-0 text-green-600"
                                  />
                                  <p className="text-[10px] leading-4 text-[#756b5d]">
                                    Your UPI payment is processed
                                    securely. You will be redirected
                                    to your payment app when a live
                                    payment gateway is connected.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* CARD */}
                            {option.id === "card" && (
                              <div>
                                <div className="mb-4 flex items-center justify-between">
                                  <p className="text-xs font-bold">
                                    Enter card details
                                  </p>

                                  <div className="flex gap-1.5 text-[9px] font-bold text-[#897d6d]">
                                    <span className="rounded border border-[#ded4c5] px-2 py-1">
                                      VISA
                                    </span>
                                    <span className="rounded border border-[#ded4c5] px-2 py-1">
                                      RuPay
                                    </span>
                                    <span className="rounded border border-[#ded4c5] px-2 py-1">
                                      MC
                                    </span>
                                  </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-semibold text-[#655c50]">
                                      Card Number
                                    </label>

                                    <input
                                      value={cardNumber}
                                      onChange={(e) =>
                                        setCardNumber(
                                          formatCardNumber(
                                            e.target.value
                                          )
                                        )
                                      }
                                      placeholder="1234 5678 9012 3456"
                                      inputMode="numeric"
                                      className="h-11 w-full rounded-xl border border-[#dcd1c0] bg-white px-3 text-sm tracking-wider outline-none focus:border-[#b9975b] focus:ring-2 focus:ring-[#b9975b]/10"
                                    />
                                  </div>

                                  <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-semibold text-[#655c50]">
                                      Name on Card
                                    </label>

                                    <input
                                      value={cardName}
                                      onChange={(e) =>
                                        setCardName(e.target.value)
                                      }
                                      placeholder="Enter name as on card"
                                      className="h-11 w-full rounded-xl border border-[#dcd1c0] bg-white px-3 text-sm outline-none focus:border-[#b9975b]"
                                    />
                                  </div>

                                  <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-[#655c50]">
                                      Expiry
                                    </label>

                                    <input
                                      value={cardExpiry}
                                      onChange={(e) =>
                                        setCardExpiry(
                                          formatExpiry(
                                            e.target.value
                                          )
                                        )
                                      }
                                      placeholder="MM/YY"
                                      inputMode="numeric"
                                      className="h-11 w-full rounded-xl border border-[#dcd1c0] bg-white px-3 text-sm outline-none focus:border-[#b9975b]"
                                    />
                                  </div>

                                  <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-[#655c50]">
                                      CVV
                                    </label>

                                    <input
                                      value={cardCvv}
                                      onChange={(e) =>
                                        setCardCvv(
                                          e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 3)
                                        )
                                      }
                                      type="password"
                                      placeholder="•••"
                                      inputMode="numeric"
                                      className="h-11 w-full rounded-xl border border-[#dcd1c0] bg-white px-3 text-sm outline-none focus:border-[#b9975b]"
                                    />
                                  </div>
                                </div>

                                <div className="mt-4 flex gap-2 rounded-xl bg-white p-3">
                                  <Lock
                                    size={15}
                                    className="mt-0.5 text-[#977538]"
                                  />
                                  <p className="text-[10px] leading-4 text-[#756b5d]">
                                    Card details are encrypted and
                                    securely processed. PrimeCart does
                                    not store your CVV.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* NET BANKING */}
                            {option.id === "netbanking" && (
                              <div>
                                <p className="mb-3 text-xs font-bold">
                                  Select your bank
                                </p>

                                <div className="grid gap-2 sm:grid-cols-2">
                                  {[
                                    "State Bank of India",
                                    "HDFC Bank",
                                    "ICICI Bank",
                                    "Axis Bank",
                                    "Kotak Mahindra Bank",
                                    "Bank of Baroda",
                                  ].map((bank) => (
                                    <button
                                      key={bank}
                                      onClick={() =>
                                        setSelectedBank(bank)
                                      }
                                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                                        selectedBank === bank
                                          ? "border-[#b9975b] bg-white"
                                          : "border-[#e1d8c9] bg-white hover:border-[#cdb88d]"
                                      }`}
                                    >
                                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f0e6] text-[#977538]">
                                        <Landmark size={17} />
                                      </div>

                                      <span className="text-xs font-semibold">
                                        {bank}
                                      </span>

                                      {selectedBank === bank && (
                                        <Check
                                          size={15}
                                          className="ml-auto text-[#977538]"
                                        />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* WALLET */}
                            {option.id === "wallet" && (
                              <div>
                                <p className="mb-3 text-xs font-bold">
                                  Select wallet
                                </p>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                  {[
                                    "paytm",
                                    "mobikwik",
                                    "amazon",
                                    "freecharge",
                                  ].map((wallet) => (
                                    <button
                                      key={wallet}
                                      onClick={() =>
                                        setSelectedWallet(wallet)
                                      }
                                      className={`rounded-xl border p-4 text-center capitalize transition ${
                                        selectedWallet === wallet
                                          ? "border-[#b9975b] bg-white shadow-sm"
                                          : "border-[#e1d8c9] bg-white hover:border-[#cdb88d]"
                                      }`}
                                    >
                                      <Wallet
                                        size={20}
                                        className="mx-auto text-[#977538]"
                                      />

                                      <span className="mt-2 block text-[10px] font-bold">
                                        {wallet}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* EMI */}
                            {option.id === "emi" && (
                              <div>
                                <p className="mb-3 text-xs font-bold">
                                  Choose EMI tenure
                                </p>

                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                  {["3", "6", "9", "12"].map(
                                    (month) => (
                                      <button
                                        key={month}
                                        onClick={() =>
                                          setEmiMonths(month)
                                        }
                                        className={`rounded-xl border p-3 text-center transition ${
                                          emiMonths === month
                                            ? "border-[#b9975b] bg-white"
                                            : "border-[#e1d8c9] bg-white"
                                        }`}
                                      >
                                        <p className="text-sm font-bold">
                                          {month} Months
                                        </p>
                                        <p className="mt-1 text-[9px] text-[#887d6c]">
                                          Easy installments
                                        </p>
                                      </button>
                                    )
                                  )}
                                </div>

                                <div className="mt-4 rounded-xl bg-white p-3 text-[10px] leading-4 text-[#756b5d]">
                                  EMI availability depends on your
                                  bank/card. Final interest and EMI
                                  amount will be shown by the payment
                                  provider.
                                </div>
                              </div>
                            )}

                            {/* COD */}
                            {option.id === "cod" && (
                              <div className="rounded-2xl bg-white p-4">
                                <div className="flex gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f0df] text-[#977538]">
                                    <Banknote size={19} />
                                  </div>

                                  <div>
                                    <p className="text-xs font-bold">
                                      Cash on Delivery
                                    </p>

                                    <p className="mt-1 text-[10px] leading-4 text-[#756b5d]">
                                      Pay securely in cash when your
                                      order is delivered to your
                                      doorstep.
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-3 flex gap-2 rounded-xl bg-[#fff8e8] p-3 text-[10px] text-[#765d2e]">
                                  <CircleAlert
                                    size={14}
                                    className="shrink-0"
                                  />
                                  COD may not be available for all
                                  products and locations.
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* PRODUCTS */}
            <section className="overflow-hidden rounded-[24px] border border-[#eadfc9] bg-white shadow-[0_12px_35px_rgba(70,45,10,0.05)]">
              <div className="flex items-center justify-between border-b border-[#eee6d8] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7f0df] text-[#a47d3d]">
                    <Package size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold">
                      Order Items
                    </h2>
                    <p className="text-xs text-[#8b8070]">
                      {totalItems} item
                      {totalItems !== 1 ? "s" : ""} in your order
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-[#eee6d8]">
                {items.map((item) => {
                  const image = getImageUrl(item.image_url);
                  const discount = getDiscount(
                    item.price,
                    item.original_price
                  );

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 p-4 sm:gap-5 sm:p-5"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#eee6d8] bg-[#faf8f3] sm:h-24 sm:w-24">
                        {image ? (
                          <Image
                            src={image}
                            alt={item.name}
                            fill
                            className="object-contain p-2"
                            sizes="96px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[9px] text-[#9c9180]">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-bold">
                          {item.name}
                        </p>

                        {item.brand && (
                          <p className="mt-1 text-[10px] text-[#887d6c]">
                            {item.brand}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold">
                            {formatPrice(item.price)}
                          </span>

                          {item.original_price &&
                            item.original_price >
                              item.price && (
                              <>
                                <span className="text-[10px] text-[#a49a8c] line-through">
                                  {formatPrice(
                                    item.original_price
                                  )}
                                </span>

                                <span className="text-[10px] font-bold text-green-600">
                                  {discount}% off
                                </span>
                              </>
                            )}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center overflow-hidden rounded-lg border border-[#ddd2c0]">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, -1)
                              }
                              className="flex h-7 w-7 items-center justify-center hover:bg-[#f5f0e6]"
                            >
                              <Minus size={13} />
                            </button>

                            <span className="flex h-7 min-w-8 items-center justify-center border-x border-[#ddd2c0] text-xs font-bold">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(item.id, 1)
                              }
                              className="flex h-7 w-7 items-center justify-center hover:bg-[#f5f0e6]"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <button
                            onClick={() =>
                              removeItem(item.id)
                            }
                            className="flex items-center gap-1 text-[10px] font-bold text-[#9b6f6f] hover:text-red-600"
                          >
                            <Trash2 size={13} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECURITY */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure Payments",
                  text: "100% protected checkout",
                },
                {
                  icon: Truck,
                  title: "Fast Delivery",
                  text: "Reliable doorstep delivery",
                },
                {
                  icon: BadgeCheck,
                  title: "Easy Returns",
                  text: "Simple return experience",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 rounded-2xl border border-[#eadfc9] bg-white p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7f0df] text-[#977538]">
                      <Icon size={17} />
                    </div>

                    <div>
                      <p className="text-[11px] font-bold">
                        {item.title}
                      </p>

                      <p className="mt-0.5 text-[9px] text-[#887d6c]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SUMMARY */}
          <aside className="lg:sticky lg:top-[98px] lg:h-fit">
            <div className="overflow-hidden rounded-[24px] border border-[#eadfc9] bg-white shadow-[0_18px_45px_rgba(70,45,10,0.07)]">
              <button
                onClick={() =>
                  setShowMobileSummary(!showMobileSummary)
                }
                className="flex w-full items-center justify-between border-b border-[#eee6d8] p-5 text-left lg:cursor-default"
              >
                <div>
                  <p className="text-base font-bold">
                    Price Details
                  </p>
                  <p className="mt-1 text-[10px] text-[#887d6c]">
                    {totalItems} item
                    {totalItems !== 1 ? "s" : ""}
                  </p>
                </div>

                <span className="lg:hidden">
                  {showMobileSummary ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </span>
              </button>

              <div
                className={`${
                  showMobileSummary
                    ? "block"
                    : "hidden lg:block"
                }`}
              >
                <div className="space-y-3 p-5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#756b5d]">
                      Price ({totalItems} items)
                    </span>
                    <span className="font-semibold">
                      {formatPrice(totalMrp)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-[#756b5d]">
                      Product Discount
                    </span>
                    <span className="font-semibold text-green-600">
                      - {formatPrice(productDiscount)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-[#756b5d]">
                      Coupon Discount
                    </span>
                    <span className="font-semibold text-green-600">
                      - {formatPrice(couponDiscount)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-[#756b5d]">
                      Delivery Charges
                    </span>
                    <span
                      className={`font-semibold ${
                        deliveryCharge === 0
                          ? "text-green-600"
                          : ""
                      }`}
                    >
                      {deliveryCharge === 0
                        ? "FREE"
                        : formatPrice(deliveryCharge)}
                    </span>
                  </div>

                  <div className="my-3 border-t border-dashed border-[#ded4c5]" />

                  <div className="flex items-end justify-between">
                    <span className="text-sm font-bold">
                      Total Amount
                    </span>

                    <span className="text-xl font-extrabold">
                      {formatPrice(total)}
                    </span>
                  </div>

                  {totalMrp - total > 0 && (
                    <div className="rounded-xl bg-[#edf8f0] p-3 text-center text-[10px] font-bold text-green-700">
                      You are saving{" "}
                      {formatPrice(totalMrp - total)} on this order
                    </div>
                  )}

                  {/* COUPON */}
                  <div className="pt-2">
                    <div className="mb-2 flex items-center gap-2">
                      <Gift
                        size={15}
                        className="text-[#977538]"
                      />
                      <span className="text-xs font-bold">
                        Apply Coupon
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        value={coupon}
                        onChange={(e) => {
                          setCoupon(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        disabled={couponApplied}
                        placeholder="Enter coupon code"
                        className="h-10 min-w-0 flex-1 rounded-xl border border-[#ddd2c0] bg-white px-3 text-xs font-semibold outline-none focus:border-[#b9975b]"
                      />

                      <button
                        onClick={applyCoupon}
                        disabled={couponApplied}
                        className="h-10 rounded-xl bg-[#f5f0e6] px-4 text-xs font-bold text-[#977538] transition hover:bg-[#eee4d1] disabled:cursor-default disabled:opacity-60"
                      >
                        {couponApplied ? "Applied" : "Apply"}
                      </button>
                    </div>

                    {couponError && (
                      <p className="mt-2 text-[10px] font-medium text-red-500">
                        {couponError}
                      </p>
                    )}

                    {couponApplied && (
                      <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-green-600">
                        <Check size={12} />
                        PRIME10 applied successfully
                      </p>
                    )}

                    {!couponApplied && (
                      <p className="mt-2 text-[9px] text-[#948978]">
                        Try PRIME10 for 10% off, up to ₹500.
                      </p>
                    )}
                  </div>

                  {/* PLACE ORDER */}
                  <button
                    onClick={placeOrder}
                    disabled={placingOrder}
                    className="group relative mt-3 flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#b9975b] px-5 text-sm font-extrabold text-white shadow-[0_12px_25px_rgba(185,151,91,0.25)] transition-all duration-300 hover:bg-[#977538] hover:shadow-[0_15px_32px_rgba(185,151,91,0.32)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-700 group-hover:translate-x-full" />

                    {placingOrder ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        Place Order
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>

                  <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[9px] leading-4 text-[#948978]">
                    <ShieldCheck size={12} />
                    Safe & secure checkout powered by PrimeCart
                  </p>
                </div>
              </div>
            </div>

            {/* SELECTED ADDRESS MINI CARD */}
            {selectedAddress && (
              <div className="mt-4 rounded-[20px] border border-[#eadfc9] bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold">
                    Delivering To
                  </p>

                  <span className="rounded-md bg-[#f4efe5] px-2 py-1 text-[9px] font-bold text-[#80683f]">
                    {selectedAddress.type}
                  </span>
                </div>

                <p className="mt-2 text-xs font-bold">
                  {selectedAddress.name}
                </p>

                <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#756b5d]">
                  {selectedAddress.address},{" "}
                  {selectedAddress.city},{" "}
                  {selectedAddress.state} -{" "}
                  {selectedAddress.pincode}
                </p>

                <p className="mt-1 text-[10px] text-[#887d6c]">
                  {selectedAddress.phone}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* MOBILE BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#eadfc9] bg-white/95 p-3 shadow-[0_-10px_35px_rgba(40,30,10,0.1)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] text-[#887d6c]">
              Total Amount
            </p>
            <p className="text-lg font-extrabold">
              {formatPrice(total)}
            </p>
          </div>

          <button
            onClick={placeOrder}
            disabled={placingOrder}
            className="flex h-12 min-w-[170px] items-center justify-center gap-2 rounded-xl bg-[#b9975b] px-5 text-sm font-bold text-white shadow-lg disabled:opacity-70"
          >
            {placingOrder ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Processing
              </>
            ) : (
              <>
                Place Order
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="h-20 lg:hidden" />
    </main>
  );
}
