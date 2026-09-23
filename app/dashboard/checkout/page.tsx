"use client";

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
  CircleCheck,
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
  Sparkles,
  Trash2,
  Truck,
  Wallet,
  X,
  Zap,
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
  brand?: string | null;
  stock?: number | null;
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

type ToastType = "success" | "error" | "info";

type ToastState = {
  message: string;
  type: ToastType;
};

/* =========================================================
   CONSTANTS
========================================================= */

const CART_KEY = "primecart-cart";
const ADDRESS_KEY = "primecart-addresses";
const ORDERS_KEY = "primecart-orders";

const FREE_DELIVERY_LIMIT = 999;
const DELIVERY_CHARGE = 49;
const COUPON_CODE = "PRIME10";
const COUPON_PERCENT = 10;
const COUPON_MAX = 500;

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

/* =========================================================
   HELPERS
========================================================= */

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback;

    const parsed = JSON.parse(value);

    return parsed as T;
  } catch {
    return fallback;
  }
}

function formatPrice(value: number) {
  return `₹${Math.max(0, Number(value || 0)).toLocaleString("en-IN")}`;
}

function getDiscount(
  price: number,
  original?: number | null
) {
  if (!original || original <= price) return 0;

  return Math.round(
    ((original - price) / original) * 100
  );
}

function getImageUrl(value?: string | null) {
  if (!value) return "";

  const image = value.trim();

  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  if (image.startsWith("/products/")) {
    return image;
  }

  if (image.startsWith("products/")) {
    return `/${image}`;
  }

  if (image.startsWith("/public/products/")) {
    return image.replace("/public", "");
  }

  if (image.startsWith("public/products/")) {
    return `/${image.replace("public/", "")}`;
  }

  if (image.startsWith("/")) {
    return image;
  }

  return `/${image}`;
}

function getDeliveryDate() {
  const date = new Date();

  date.setDate(date.getDate() + 4);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/* =========================================================
   INPUT COMPONENT
========================================================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold text-[#655c50]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-[#ddd2c0] bg-white px-3 text-sm text-[#332b21] outline-none transition-all placeholder:text-[#aaa091] focus:border-[#b9975b] focus:ring-4 focus:ring-[#b9975b]/10"
      />
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function CheckoutPage() {
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] =
    useState("");

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
  const [selectedWallet, setSelectedWallet] =
    useState("paytm");

  const [emiMonths, setEmiMonths] = useState("6");

  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] =
    useState(false);
  const [couponError, setCouponError] = useState("");

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [editingAddressId, setEditingAddressId] =
    useState<string | null>(null);

  const [addressForm, setAddressForm] =
    useState<Address>(defaultAddress);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [showMobileSummary, setShowMobileSummary] =
    useState(false);

  const [toast, setToast] =
    useState<ToastState | null>(null);

  const [addressError, setAddressError] =
    useState("");

  /* =======================================================
     LOAD LOCAL DATA
  ======================================================= */

  useEffect(() => {
    try {
      const savedCart = safeParse<CartItem[]>(
        localStorage.getItem(CART_KEY),
        []
      );

      const normalizedCart = savedCart
        .filter((item) => item && item.id)
        .map((item) => ({
          ...item,
          quantity: Math.max(
            1,
            Number(item.quantity || 1)
          ),
          price: Number(item.price || 0),
        }));

      setItems(normalizedCart);

      const savedAddresses = safeParse<Address[]>(
        localStorage.getItem(ADDRESS_KEY),
        []
      );

      setAddresses(savedAddresses);

      if (savedAddresses.length > 0) {
        setSelectedAddressId(savedAddresses[0].id);
      }
    } catch {
      setItems([]);
      setAddresses([]);
    }
  }, []);

  /* =======================================================
     TOAST
  ======================================================= */

  function showToast(
    message: string,
    type: ToastType = "success"
  ) {
    setToast({
      message,
      type,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 2800);
  }

  /* =======================================================
     CALCULATIONS
  ======================================================= */

  const selectedAddress = useMemo(() => {
    return (
      addresses.find(
        (address) =>
          address.id === selectedAddressId
      ) || null
    );
  }, [addresses, selectedAddressId]);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0),
      0
    );
  }, [items]);

  const totalMrp = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        Number(
          item.original_price || item.price || 0
        ) *
          Number(item.quantity || 0),
      0
    );
  }, [items]);

  const productDiscount = Math.max(
    totalMrp - subtotal,
    0
  );

  const couponDiscount = couponApplied
    ? Math.min(
        Math.round(
          subtotal * (COUPON_PERCENT / 100)
        ),
        COUPON_MAX
      )
    : 0;

  const amountAfterDiscount =
    subtotal - couponDiscount;

  const deliveryCharge =
    amountAfterDiscount >= FREE_DELIVERY_LIMIT
      ? 0
      : DELIVERY_CHARGE;

  const total = Math.max(
    amountAfterDiscount + deliveryCharge,
    0
  );

  const totalItems = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const amountForFreeDelivery = Math.max(
    FREE_DELIVERY_LIMIT - amountAfterDiscount,
    0
  );

  const freeDeliveryProgress = Math.min(
    (amountAfterDiscount / FREE_DELIVERY_LIMIT) *
      100,
    100
  );

  const totalSavings =
    productDiscount + couponDiscount;

  /* =======================================================
     CART
  ======================================================= */

  function persistCart(next: CartItem[]) {
    setItems(next);

    try {
      localStorage.setItem(
        CART_KEY,
        JSON.stringify(next)
      );
    } catch {
      // ignore localStorage errors
    }
  }

  function updateQuantity(
    id: string,
    change: number
  ) {
    const next = items
      .map((item) => {
        if (item.id !== id) return item;

        const stock =
          Number(item.stock || 0);

        const maximum =
          stock > 0 ? stock : 99;

        return {
          ...item,
          quantity: Math.min(
            maximum,
            Math.max(
              1,
              Number(item.quantity || 1) +
                change
            )
          ),
        };
      })
      .filter(
        (item) => Number(item.quantity) > 0
      );

    persistCart(next);

    if (change > 0) {
      showToast("Quantity updated.", "info");
    }
  }

  function removeItem(id: string) {
    const removed = items.find(
      (item) => item.id === id
    );

    const next = items.filter(
      (item) => item.id !== id
    );

    persistCart(next);

    if (removed) {
      showToast(
        `${removed.name} removed from cart.`,
        "info"
      );
    }
  }

  /* =======================================================
     COUPON
  ======================================================= */

  function applyCoupon() {
    setCouponError("");

    const code = coupon.trim().toUpperCase();

    if (!code) {
      setCouponError(
        "Please enter a coupon code."
      );
      return;
    }

    if (code !== COUPON_CODE) {
      setCouponApplied(false);

      setCouponError(
        "This coupon code is invalid or expired."
      );

      return;
    }

    if (subtotal <= 0) {
      setCouponError(
        "Add products before applying a coupon."
      );
      return;
    }

    setCoupon(COUPON_CODE);
    setCouponApplied(true);

    showToast(
      "PRIME10 applied — 10% discount unlocked!"
    );
  }

  function removeCoupon() {
    setCoupon("");
    setCouponApplied(false);
    setCouponError("");

    showToast(
      "Coupon removed.",
      "info"
    );
  }

  /* =======================================================
     ADDRESS
  ======================================================= */

  function openNewAddress() {
    setAddressForm({
      ...defaultAddress,
      id: "default-address",
    });

    setEditingAddressId(null);
    setAddressError("");
    setShowAddressForm(true);
  }

  function editAddress(address: Address) {
    setAddressForm({
      ...address,
    });

    setEditingAddressId(address.id);
    setAddressError("");
    setShowAddressForm(true);
  }

  function saveAddress() {
    setAddressError("");

    const name =
      addressForm.name.trim();

    const phone =
      addressForm.phone.trim();

    const address =
      addressForm.address.trim();

    const city =
      addressForm.city.trim();

    const state =
      addressForm.state.trim();

    const pincode =
      addressForm.pincode.trim();

    if (
      !name ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      setAddressError(
        "Please complete all address fields."
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setAddressError(
        "Enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setAddressError(
        "Enter a valid 6-digit pincode."
      );
      return;
    }

    let updatedAddresses: Address[];

    if (editingAddressId) {
      updatedAddresses = addresses.map(
        (existing) =>
          existing.id === editingAddressId
            ? {
                ...addressForm,
                name,
                phone,
                address,
                city,
                state,
                pincode,
              }
            : existing
      );
    } else {
      const newAddress: Address = {
        ...addressForm,
        id: `address-${Date.now()}`,
        name,
        phone,
        address,
        city,
        state,
        pincode,
      };

      updatedAddresses = [
        ...addresses,
        newAddress,
      ];
    }

    try {
      localStorage.setItem(
        ADDRESS_KEY,
        JSON.stringify(updatedAddresses)
      );
    } catch {
      // ignore
    }

    setAddresses(updatedAddresses);

    const newAddressId =
      editingAddressId ||
      updatedAddresses[
        updatedAddresses.length - 1
      ].id;

    setSelectedAddressId(newAddressId);

    setAddressForm({
      ...defaultAddress,
    });

    setEditingAddressId(null);
    setShowAddressForm(false);

    showToast(
      editingAddressId
        ? "Address updated successfully."
        : "New address saved successfully."
    );
  }

  function deleteAddress(id: string) {
    const address =
      addresses.find(
        (item) => item.id === id
      );

    const updated =
      addresses.filter(
        (item) => item.id !== id
      );

    setAddresses(updated);

    try {
      localStorage.setItem(
        ADDRESS_KEY,
        JSON.stringify(updated)
      );
    } catch {
      // ignore
    }

    if (selectedAddressId === id) {
      setSelectedAddressId(
        updated[0]?.id || ""
      );
    }

    if (address) {
      showToast(
        `${address.type} address removed.`,
        "info"
      );
    }
  }

  /* =======================================================
     PAYMENT
  ======================================================= */

  function formatCardNumber(value: string) {
    const numbers = value
      .replace(/\D/g, "")
      .slice(0, 16);

    return numbers
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  function formatExpiry(value: string) {
    const numbers = value
      .replace(/\D/g, "")
      .slice(0, 4);

    if (numbers.length > 2) {
      return `${numbers.slice(
        0,
        2
      )}/${numbers.slice(2)}`;
    }

    return numbers;
  }

  function validatePayment() {
    if (paymentMethod === "upi") {
      if (
        selectedUpi === "upi-id" &&
        !/^[\w.-]+@[\w.-]+$/.test(
          upiId.trim()
        )
      ) {
        showToast(
          "Enter a valid UPI ID.",
          "error"
        );
        return false;
      }
    }

    if (paymentMethod === "card") {
      const number =
        cardNumber.replace(/\s/g, "");

      if (number.length !== 16) {
        showToast(
          "Enter a valid 16-digit card number.",
          "error"
        );
        return false;
      }

      if (!cardName.trim()) {
        showToast(
          "Enter the name on your card.",
          "error"
        );
        return false;
      }

      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        showToast(
          "Enter a valid expiry date.",
          "error"
        );
        return false;
      }

      if (cardCvv.length !== 3) {
        showToast(
          "Enter a valid 3-digit CVV.",
          "error"
        );
        return false;
      }
    }

    if (
      paymentMethod === "netbanking" &&
      !selectedBank
    ) {
      showToast(
        "Please select your bank.",
        "error"
      );
      return false;
    }

    if (
      paymentMethod === "wallet" &&
      !selectedWallet
    ) {
      showToast(
        "Please select a wallet.",
        "error"
      );
      return false;
    }

    return true;
  }

  function getPaymentLabel() {
    if (paymentMethod === "upi") {
      if (selectedUpi === "gpay") {
        return "UPI - Google Pay";
      }

      if (selectedUpi === "phonepe") {
        return "UPI - PhonePe";
      }

      if (selectedUpi === "paytm") {
        return "UPI - Paytm";
      }

      return "UPI";
    }

    if (paymentMethod === "card") {
      return "Credit / Debit Card";
    }

    if (paymentMethod === "netbanking") {
      return `Net Banking - ${selectedBank}`;
    }

    if (paymentMethod === "wallet") {
      return `Wallet - ${selectedWallet}`;
    }

    if (paymentMethod === "emi") {
      return `EMI - ${emiMonths} months`;
    }

    return "Cash on Delivery";
  }

  /* =======================================================
     PLACE ORDER
  ======================================================= */

  async function placeOrder() {
    if (placingOrder) return;

    if (items.length === 0) {
      showToast(
        "Your cart is empty.",
        "error"
      );
      return;
    }

    if (!selectedAddress) {
      setAddressError(
        "Please select a delivery address."
      );

      showToast(
        "Please select a delivery address.",
        "error"
      );

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
        createdAt:
          new Date().toISOString(),
        status: "Placed",
        paymentMethod:
          getPaymentLabel(),
        total,
        subtotal,
        delivery: deliveryCharge,
        discount:
          productDiscount +
          couponDiscount,
        address: selectedAddress,
        items,
      };

      const existingOrders =
        safeParse<OrderRecord[]>(
          localStorage.getItem(
            ORDERS_KEY
          ),
          []
        );

      const updatedOrders = [
        order,
        ...existingOrders,
      ];

      localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify(
          updatedOrders
        )
      );

      localStorage.setItem(
        "primecart-last-order",
        JSON.stringify(order)
      );

      localStorage.removeItem(
        CART_KEY
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      router.push(
        `/dashboard/order-success?order=${orderId}`
      );
    } catch (error) {
      console.error(
        "Order placement error:",
        error
      );

      setPlacingOrder(false);

      showToast(
        "Something went wrong. Please try again.",
        "error"
      );
    }
  }

  /* =======================================================
     EMPTY CART
  ======================================================= */

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#faf8f3] text-[#17130d]">
        <header className="sticky top-0 z-50 border-b border-[#eadfc9] bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] max-w-[1450px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href="/dashboard/products"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b9975b] text-white">
                <ArrowLeft size={18} />
              </div>

              <div>
                <p className="text-base font-bold">
                  Checkout
                </p>
                <p className="text-[10px] text-[#8a7e6d]">
                  PrimeCart secure checkout
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-2 text-[#977538] sm:flex">
              <ShieldCheck size={18} />
              <span className="text-xs font-bold">
                Secure Checkout
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto flex min-h-[78vh] max-w-5xl items-center justify-center px-5 py-12">
          <div className="w-full max-w-xl rounded-[32px] border border-[#eadfc9] bg-white p-8 text-center shadow-[0_30px_90px_rgba(60,40,10,0.08)] sm:p-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#f7f0df] text-[#a47d3d]">
              <Package size={38} />
            </div>

            <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#fcf7ec] px-3 py-1.5 text-[10px] font-bold text-[#977538]">
              <Sparkles size={12} />
              PRIMECART
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756b5d]">
              Looks like you haven't added anything
              yet. Discover products and build your
              perfect order.
            </p>

            <Link
              href="/dashboard/products"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#b9975b] px-7 text-sm font-bold text-white shadow-[0_12px_30px_rgba(185,151,91,0.25)] transition hover:-translate-y-0.5 hover:bg-[#977538]"
            >
              Continue Shopping
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#faf8f3] pb-24 text-[#17130d] lg:pb-0">
      {/* ===================================================
          TOAST
      =================================================== */}

      {toast && (
        <div className="fixed right-4 top-4 z-[100] w-[calc(100%-32px)] max-w-sm animate-[slideIn_.3s_ease-out]">
          <div
            className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-[0_20px_50px_rgba(40,30,10,0.15)] ${
              toast.type === "error"
                ? "border-red-100"
                : toast.type === "info"
                ? "border-[#eadfc9]"
                : "border-green-100"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                toast.type === "error"
                  ? "bg-red-50 text-red-500"
                  : toast.type === "info"
                  ? "bg-[#f7f0df] text-[#977538]"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {toast.type === "error" ? (
                <CircleAlert size={17} />
              ) : toast.type === "info" ? (
                <Sparkles size={17} />
              ) : (
                <CircleCheck size={17} />
              )}
            </div>

            <p className="flex-1 pt-1 text-xs font-semibold leading-5 text-[#514839]">
              {toast.message}
            </p>

            <button
              onClick={() => setToast(null)}
              className="text-[#9b907f]"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#eadfc9] bg-white/95 shadow-[0_3px_20px_rgba(70,45,10,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1450px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/cart"
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b9975b] text-white shadow-sm transition group-hover:bg-[#977538]">
              <ArrowLeft size={19} />
            </div>

            <div>
              <p className="text-base font-extrabold">
                Checkout
              </p>

              <p className="hidden text-[10px] font-medium text-[#887d6c] sm:block">
                Complete your order securely
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <div className="flex items-center gap-2 text-[#977538]">
              <ShieldCheck size={18} />

              <span className="text-[11px] font-bold">
                100% Secure Checkout
              </span>
            </div>

            <div className="h-5 w-px bg-[#eadfc9]" />

            <div className="flex items-center gap-2 text-[#756b5d]">
              <Lock size={16} />

              <span className="text-[11px] font-semibold">
                Your data is protected
              </span>
            </div>
          </div>

          <Link
            href="/dashboard/products"
            className="text-[11px] font-bold text-[#756b5d] transition hover:text-[#977538]"
          >
            Continue Shopping
          </Link>
        </div>
      </header>

      {/* ===================================================
          PROGRESS
      =================================================== */}

      <div className="border-b border-[#eadfc9] bg-white">
        <div className="mx-auto max-w-[1450px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-4xl items-center">
            {[
              {
                number: "1",
                label: "Cart",
                done: true,
              },
              {
                number: "2",
                label: "Address",
                done: Boolean(selectedAddress),
              },
              {
                number: "3",
                label: "Payment",
                done: Boolean(paymentMethod),
              },
              {
                number: "4",
                label: "Confirmation",
                done: false,
              },
            ].map((step, index) => (
              <div
                key={step.number}
                className="flex min-w-0 flex-1 items-center"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold transition-all ${
                      step.done
                        ? "bg-[#b9975b] text-white shadow-[0_5px_15px_rgba(185,151,91,0.25)]"
                        : "bg-[#f3eee5] text-[#a49a8b]"
                    }`}
                  >
                    {step.done ? (
                      <Check size={14} />
                    ) : (
                      step.number
                    )}
                  </div>

                  <span
                    className={`hidden text-[11px] font-bold sm:block ${
                      step.done
                        ? "text-[#514839]"
                        : "text-[#a49a8b]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index < 3 && (
                  <div className="mx-2 h-px flex-1 bg-[#e7ddcc] sm:mx-5" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="mx-auto max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] xl:gap-8">
          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-5">
            {/* ===============================================
                DELIVERY PROGRESS
            =============================================== */}

            <section className="overflow-hidden rounded-[24px] border border-[#eadfc9] bg-white shadow-[0_10px_30px_rgba(70,45,10,0.045)]">
              <div className="flex items-start gap-3 p-4 sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f0df] text-[#a47d3d]">
                  <Truck size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  {deliveryCharge === 0 ? (
                    <>
                      <div className="flex items-center gap-2">
                        <CircleCheck
                          size={15}
                          className="text-green-600"
                        />

                        <p className="text-xs font-extrabold text-green-700">
                          FREE delivery unlocked!
                        </p>
                      </div>

                      <p className="mt-1 text-[10px] text-[#887d6c]">
                        Your order qualifies for free
                        delivery.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-extrabold text-[#514839]">
                        Add {formatPrice(
                          amountForFreeDelivery
                        )} more for FREE delivery
                      </p>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eee6d8]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#b9975b] to-[#d6bb82] transition-all duration-500"
                          style={{
                            width: `${freeDeliveryProgress}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1.5 text-[9px] text-[#887d6c]">
                        Free delivery on orders above{" "}
                        {formatPrice(
                          FREE_DELIVERY_LIMIT
                        )}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* ===============================================
                ADDRESS
            =============================================== */}

            <section className="overflow-hidden rounded-[24px] border border-[#eadfc9] bg-white shadow-[0_12px_35px_rgba(70,45,10,0.05)]">
              <div className="flex items-center justify-between border-b border-[#eee6d8] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f0df] text-[#a47d3d]">
                    <MapPin size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-extrabold">
                      Delivery Address
                    </h2>

                    <p className="text-[10px] text-[#8b8070]">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <button
                  onClick={openNewAddress}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8c7a5] px-3 py-2 text-[10px] font-extrabold text-[#977538] transition hover:bg-[#fbf7ee]"
                >
                  <Plus size={14} />
                  <span className="hidden sm:inline">
                    Add New
                  </span>
                </button>
              </div>

              <div className="space-y-3 p-5 sm:p-6">
                {addresses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#d9cdb9] bg-[#fcfaf6] p-7 text-center">
                    <MapPin
                      size={27}
                      className="mx-auto text-[#b9975b]"
                    />

                    <p className="mt-3 text-sm font-extrabold">
                      No saved address
                    </p>

                    <p className="mt-1 text-[10px] text-[#887d6c]">
                      Add a delivery address to continue.
                    </p>

                    <button
                      onClick={openNewAddress}
                      className="mt-4 rounded-xl bg-[#b9975b] px-5 py-2.5 text-[10px] font-extrabold text-white transition hover:bg-[#977538]"
                    >
                      Add Delivery Address
                    </button>
                  </div>
                ) : (
                  addresses.map((address) => {
                    const selected =
                      selectedAddressId ===
                      address.id;

                    return (
                      <div
                        key={address.id}
                        onClick={() => {
                          setSelectedAddressId(
                            address.id
                          );
                          setAddressError("");
                        }}
                        className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
                          selected
                            ? "border-[#b9975b] bg-[#fcfaf6] shadow-[0_8px_25px_rgba(185,151,91,0.12)]"
                            : "border-[#eee6d8] hover:border-[#d6c39f]"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              selected
                                ? "border-[#b9975b]"
                                : "border-[#cfc5b5]"
                            }`}
                          >
                            {selected && (
                              <div className="h-2.5 w-2.5 rounded-full bg-[#b9975b]" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-extrabold">
                                {address.name}
                              </span>

                              <span className="rounded-md bg-[#f4efe5] px-2 py-1 text-[9px] font-extrabold text-[#80683f]">
                                {address.type}
                              </span>

                              {selected && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-[#edf8f0] px-2 py-1 text-[9px] font-extrabold text-green-700">
                                  <Check size={10} />
                                  Selected
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-[10px] font-semibold text-[#655c50]">
                              {address.phone}
                            </p>

                            <p className="mt-2 text-[11px] leading-5 text-[#756b5d]">
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
                                editAddress(
                                  address
                                );
                              }}
                              className="rounded-lg p-2 text-[#8c806e] transition hover:bg-[#f5f0e6] hover:text-[#977538]"
                              title="Edit address"
                            >
                              <Edit3 size={15} />
                            </button>

                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                deleteAddress(
                                  address.id
                                );
                              }}
                              className="rounded-lg p-2 text-[#a78c8c] transition hover:bg-red-50 hover:text-red-500"
                              title="Delete address"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {addressError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-[10px] font-semibold text-red-600">
                    <CircleAlert
                      size={14}
                      className="mt-0.5 shrink-0"
                    />
                    {addressError}
                  </div>
                )}

                {/* ADDRESS FORM */}

                {showAddressForm && (
                  <div className="rounded-2xl border border-[#d9c9aa] bg-[#fcfaf6] p-4 shadow-sm sm:p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold">
                          {editingAddressId
                            ? "Edit Address"
                            : "Add New Address"}
                        </h3>

                        <p className="mt-1 text-[10px] text-[#8b8070]">
                          Enter your complete delivery
                          details.
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setShowAddressForm(false)
                        }
                        className="rounded-lg p-2 text-[#877b6b] transition hover:bg-[#eee6d8]"
                      >
                        <X size={17} />
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field
                        label="Full Name"
                        value={addressForm.name}
                        onChange={(value) =>
                          setAddressForm({
                            ...addressForm,
                            name: value,
                          })
                        }
                        placeholder="Enter full name"
                      />

                      <Field
                        label="Mobile Number"
                        value={addressForm.phone}
                        onChange={(value) =>
                          setAddressForm({
                            ...addressForm,
                            phone: value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          })
                        }
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        inputMode="numeric"
                      />

                      <div className="sm:col-span-2">
                        <Field
                          label="Address"
                          value={addressForm.address}
                          onChange={(value) =>
                            setAddressForm({
                              ...addressForm,
                              address: value,
                            })
                          }
                          placeholder="House no., building, street"
                        />
                      </div>

                      <Field
                        label="City"
                        value={addressForm.city}
                        onChange={(value) =>
                          setAddressForm({
                            ...addressForm,
                            city: value,
                          })
                        }
                        placeholder="City"
                      />

                      <Field
                        label="State"
                        value={addressForm.state}
                        onChange={(value) =>
                          setAddressForm({
                            ...addressForm,
                            state: value,
                          })
                        }
                        placeholder="State"
                      />

                      <Field
                        label="Pincode"
                        value={addressForm.pincode}
                        onChange={(value) =>
                          setAddressForm({
                            ...addressForm,
                            pincode: value
                              .replace(/\D/g, "")
                              .slice(0, 6),
                          })
                        }
                        placeholder="6-digit pincode"
                        maxLength={6}
                        inputMode="numeric"
                      />

                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold text-[#655c50]">
                          Address Type
                        </label>

                        <select
                          value={addressForm.type}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              type: e.target
                                .value as Address["type"],
                            })
                          }
                          className="h-11 w-full rounded-xl border border-[#ddd2c0] bg-white px-3 text-sm outline-none transition focus:border-[#b9975b] focus:ring-4 focus:ring-[#b9975b]/10"
                        >
                          <option>Home</option>
                          <option>Work</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() =>
                          setShowAddressForm(false)
                        }
                        className="rounded-xl border border-[#ddd2c0] px-4 py-2.5 text-[10px] font-extrabold text-[#655c50] transition hover:bg-white"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={saveAddress}
                        className="rounded-xl bg-[#b9975b] px-5 py-2.5 text-[10px] font-extrabold text-white shadow-sm transition hover:bg-[#977538]"
                      >
                        {editingAddressId
                          ? "Update Address"
                          : "Save Address"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ===============================================
                PAYMENT
            =============================================== */}

            <section className="overflow-hidden rounded-[24px] border border-[#eadfc9] bg-white shadow-[0_12px_35px_rgba(70,45,10,0.05)]">
              <div className="border-b border-[#eee6d8] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f0df] text-[#a47d3d]">
                    <CreditCard size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-extrabold">
                      Payment Method
                    </h2>

                    <p className="text-[10px] text-[#8b8070]">
                      Choose how you want to pay.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="overflow-hidden rounded-2xl border border-[#e9dfce]">
                  {paymentOptions.map(
                    (option, index) => {
                      const Icon = option.icon;

                      const selected =
                        paymentMethod ===
                        option.id;

                      const expanded =
                        expandedPayment ===
                        option.id;

                      return (
                        <div
                          key={option.id}
                          className={
                            index !==
                            paymentOptions.length -
                              1
                              ? "border-b border-[#eee6d8]"
                              : ""
                          }
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentMethod(
                                option.id
                              );
                              setExpandedPayment(
                                option.id
                              );
                            }}
                            className={`flex w-full items-center gap-3 p-4 text-left transition ${
                              selected
                                ? "bg-[#fcfaf6]"
                                : "bg-white hover:bg-[#fcfaf6]"
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                                selected
                                  ? "bg-[#f3e7cd] text-[#977538]"
                                  : "bg-[#f7f4ee] text-[#817666]"
                              }`}
                            >
                              <Icon size={19} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-extrabold">
                                  {option.title}
                                </span>

                                {option.id ===
                                  "upi" && (
                                  <span className="rounded-full bg-[#e9f7ee] px-2 py-0.5 text-[8px] font-extrabold text-green-700">
                                    POPULAR
                                  </span>
                                )}

                                {option.id ===
                                  "cod" && (
                                  <span className="rounded-full bg-[#f7f0df] px-2 py-0.5 text-[8px] font-extrabold text-[#977538]">
                                    EASY
                                  </span>
                                )}
                              </div>

                              <p className="mt-0.5 text-[10px] text-[#8a7e6d]">
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

                          {selected &&
                            expanded && (
                              <div className="border-t border-[#eee6d8] bg-[#fcfaf6] p-4 sm:p-5">
                                {/* UPI */}

                                {option.id ===
                                  "upi" && (
                                  <div>
                                    <p className="mb-3 text-[11px] font-extrabold text-[#655c50]">
                                      Choose UPI option
                                    </p>

                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                      {[
                                        [
                                          "gpay",
                                          "Google Pay",
                                        ],
                                        [
                                          "phonepe",
                                          "PhonePe",
                                        ],
                                        [
                                          "paytm",
                                          "Paytm",
                                        ],
                                        [
                                          "upi-id",
                                          "Other UPI",
                                        ],
                                      ].map(
                                        ([
                                          id,
                                          label,
                                        ]) => (
                                          <button
                                            key={
                                              id
                                            }
                                            type="button"
                                            onClick={() =>
                                              setSelectedUpi(
                                                id
                                              )
                                            }
                                            className={`rounded-xl border p-3 text-center transition-all ${
                                              selectedUpi ===
                                              id
                                                ? "border-[#b9975b] bg-white shadow-sm"
                                                : "border-[#e2d8c7] bg-white hover:border-[#cdb88d]"
                                            }`}
                                          >
                                            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f0e6] text-[#977538]">
                                              {id ===
                                              "upi-id" ? (
                                                <QrCode
                                                  size={
                                                    18
                                                  }
                                                />
                                              ) : (
                                                <Smartphone
                                                  size={
                                                    18
                                                  }
                                                />
                                              )}
                                            </div>

                                            <span className="mt-2 block text-[9px] font-extrabold">
                                              {label}
                                            </span>
                                          </button>
                                        )
                                      )}
                                    </div>

                                    {selectedUpi ===
                                      "upi-id" && (
                                      <div className="mt-4">
                                        <Field
                                          label="UPI ID"
                                          value={
                                            upiId
                                          }
                                          onChange={
                                            setUpiId
                                          }
                                          placeholder="yourname@upi"
                                        />
                                      </div>
                                    )}

                                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#e8dfd1] bg-white p-3">
                                      <ShieldCheck
                                        size={15}
                                        className="mt-0.5 shrink-0 text-green-600"
                                      />

                                      <p className="text-[9px] leading-4 text-[#756b5d]">
                                        Your UPI details are
                                        handled securely.
                                        A live payment
                                        gateway can be
                                        connected when
                                        payments are
                                        enabled.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* CARD */}

                                {option.id ===
                                  "card" && (
                                  <div>
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                      <p className="text-[11px] font-extrabold">
                                        Enter card details
                                      </p>

                                      <div className="flex gap-1 text-[8px] font-bold text-[#897d6d]">
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
                                        <Field
                                          label="Card Number"
                                          value={
                                            cardNumber
                                          }
                                          onChange={(
                                            value
                                          ) =>
                                            setCardNumber(
                                              formatCardNumber(
                                                value
                                              )
                                            )
                                          }
                                          placeholder="1234 5678 9012 3456"
                                          inputMode="numeric"
                                        />
                                      </div>

                                      <div className="sm:col-span-2">
                                        <Field
                                          label="Name on Card"
                                          value={
                                            cardName
                                          }
                                          onChange={
                                            setCardName
                                          }
                                          placeholder="Enter name as on card"
                                        />
                                      </div>

                                      <Field
                                        label="Expiry"
                                        value={
                                          cardExpiry
                                        }
                                        onChange={(
                                          value
                                        ) =>
                                          setCardExpiry(
                                            formatExpiry(
                                              value
                                            )
                                          )
                                        }
                                        placeholder="MM/YY"
                                        inputMode="numeric"
                                      />

                                      <Field
                                        label="CVV"
                                        value={
                                          cardCvv
                                        }
                                        onChange={(
                                          value
                                        ) =>
                                          setCardCvv(
                                            value
                                              .replace(
                                                /\D/g,
                                                ""
                                              )
                                              .slice(
                                                0,
                                                3
                                              )
                                          )
                                        }
                                        placeholder="•••"
                                        type="password"
                                        inputMode="numeric"
                                      />
                                    </div>

                                    <div className="mt-4 flex gap-2 rounded-xl bg-white p-3">
                                      <Lock
                                        size={14}
                                        className="mt-0.5 text-[#977538]"
                                      />

                                      <p className="text-[9px] leading-4 text-[#756b5d]">
                                        Card details are
                                        protected. PrimeCart
                                        does not store your
                                        CVV.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* NET BANKING */}

                                {option.id ===
                                  "netbanking" && (
                                  <div>
                                    <p className="mb-3 text-[11px] font-extrabold">
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
                                      ].map(
                                        (bank) => (
                                          <button
                                            type="button"
                                            key={
                                              bank
                                            }
                                            onClick={() =>
                                              setSelectedBank(
                                                bank
                                              )
                                            }
                                            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                                              selectedBank ===
                                              bank
                                                ? "border-[#b9975b] bg-white"
                                                : "border-[#e1d8c9] bg-white hover:border-[#cdb88d]"
                                            }`}
                                          >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f5f0e6] text-[#977538]">
                                              <Landmark
                                                size={
                                                  17
                                                }
                                              />
                                            </div>

                                            <span className="text-[10px] font-bold">
                                              {bank}
                                            </span>

                                            {selectedBank ===
                                              bank && (
                                              <Check
                                                size={
                                                  15
                                                }
                                                className="ml-auto text-[#977538]"
                                              />
                                            )}
                                          </button>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* WALLET */}

                                {option.id ===
                                  "wallet" && (
                                  <div>
                                    <p className="mb-3 text-[11px] font-extrabold">
                                      Select wallet
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                      {[
                                        "paytm",
                                        "mobikwik",
                                        "amazon",
                                        "freecharge",
                                      ].map(
                                        (wallet) => (
                                          <button
                                            type="button"
                                            key={
                                              wallet
                                            }
                                            onClick={() =>
                                              setSelectedWallet(
                                                wallet
                                              )
                                            }
                                            className={`rounded-xl border p-4 text-center capitalize transition ${
                                              selectedWallet ===
                                              wallet
                                                ? "border-[#b9975b] bg-white shadow-sm"
                                                : "border-[#e1d8c9] bg-white hover:border-[#cdb88d]"
                                            }`}
                                          >
                                            <Wallet
                                              size={
                                                20
                                              }
                                              className="mx-auto text-[#977538]"
                                            />

                                            <span className="mt-2 block text-[9px] font-extrabold">
                                              {wallet}
                                            </span>
                                          </button>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* EMI */}

                                {option.id ===
                                  "emi" && (
                                  <div>
                                    <p className="mb-3 text-[11px] font-extrabold">
                                      Choose EMI tenure
                                    </p>

                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                      {[
                                        "3",
                                        "6",
                                        "9",
                                        "12",
                                      ].map(
                                        (month) => (
                                          <button
                                            type="button"
                                            key={
                                              month
                                            }
                                            onClick={() =>
                                              setEmiMonths(
                                                month
                                              )
                                            }
                                            className={`rounded-xl border p-3 text-center transition ${
                                              emiMonths ===
                                              month
                                                ? "border-[#b9975b] bg-white shadow-sm"
                                                : "border-[#e1d8c9] bg-white"
                                            }`}
                                          >
                                            <p className="text-sm font-extrabold">
                                              {month}{" "}
                                              Months
                                            </p>

                                            <p className="mt-1 text-[8px] text-[#887d6c]">
                                              Easy installments
                                            </p>
                                          </button>
                                        )
                                      )}
                                    </div>

                                    <div className="mt-4 rounded-xl bg-white p-3 text-[9px] leading-4 text-[#756b5d]">
                                      EMI availability and
                                      final charges depend
                                      on your bank/card and
                                      payment provider.
                                    </div>
                                  </div>
                                )}

                                {/* COD */}

                                {option.id ===
                                  "cod" && (
                                  <div className="rounded-2xl bg-white p-4">
                                    <div className="flex gap-3">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f0df] text-[#977538]">
                                        <Banknote
                                          size={
                                            19
                                          }
                                        />
                                      </div>

                                      <div>
                                        <p className="text-[11px] font-extrabold">
                                          Cash on Delivery
                                        </p>

                                        <p className="mt-1 text-[9px] leading-4 text-[#756b5d]">
                                          Pay when your order
                                          reaches your
                                          doorstep.
                                        </p>
                                      </div>
                                    </div>

                                    <div className="mt-3 flex gap-2 rounded-xl bg-[#fff8e8] p-3 text-[9px] text-[#765d2e]">
                                      <CircleAlert
                                        size={14}
                                        className="shrink-0"
                                      />

                                      <span>
                                        COD availability
                                        depends on product
                                        and delivery
                                        location.
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </section>

            {/* ===============================================
                ORDER ITEMS
            =============================================== */}

            <section className="overflow-hidden rounded-[24px] border border-[#eadfc9] bg-white shadow-[0_12px_35px_rgba(70,45,10,0.05)]">
              <div className="flex items-center justify-between border-b border-[#eee6d8] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f0df] text-[#a47d3d]">
                    <Package size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-extrabold">
                      Order Items
                    </h2>

                    <p className="text-[10px] text-[#8b8070]">
                      {totalItems} item
                      {totalItems !== 1
                        ? "s"
                        : ""}{" "}
                      in your order
                    </p>
                  </div>
                </div>

                <span className="hidden rounded-full bg-[#f7f0df] px-3 py-1.5 text-[9px] font-extrabold text-[#977538] sm:block">
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "PRODUCT"
                    : "PRODUCTS"}
                </span>
              </div>

              <div className="divide-y divide-[#eee6d8]">
                {items.map((item) => {
                  const image = getImageUrl(
                    item.image_url
                  );

                  const discount =
                    getDiscount(
                      item.price,
                      item.original_price
                    );

                  const itemTotal =
                    Number(item.price || 0) *
                    Number(item.quantity || 0);

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 p-4 sm:gap-5 sm:p-5"
                    >
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#eee6d8] bg-[#faf8f3] sm:h-28 sm:w-28">
                        {image ? (
                          <img
                            src={image}
                            alt={item.name}
                            className="h-full w-full object-contain p-2.5"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[9px] text-[#9c9180]">
                            No Image
                          </div>
                        )}

                        {discount > 0 && (
                          <span className="absolute left-2 top-2 rounded-md bg-green-600 px-1.5 py-1 text-[8px] font-extrabold text-white">
                            {discount}% OFF
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-extrabold leading-5">
                              {item.name}
                            </p>

                            {item.brand && (
                              <p className="mt-1 text-[9px] font-medium text-[#887d6c]">
                                {item.brand}
                              </p>
                            )}
                          </div>

                          <p className="hidden text-sm font-extrabold sm:block">
                            {formatPrice(itemTotal)}
                          </p>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-extrabold">
                            {formatPrice(item.price)}
                          </span>

                          {item.original_price &&
                            item.original_price >
                              item.price && (
                              <span className="text-[10px] text-[#a49a8c] line-through">
                                {formatPrice(
                                  item.original_price
                                )}
                              </span>
                            )}
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center overflow-hidden rounded-xl border border-[#ddd2c0] bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  -1
                                )
                              }
                              disabled={
                                item.quantity <=
                                1
                              }
                              className="flex h-8 w-8 items-center justify-center transition hover:bg-[#f5f0e6] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus size={13} />
                            </button>

                            <span className="flex h-8 min-w-9 items-center justify-center border-x border-[#ddd2c0] text-xs font-extrabold">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  1
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center transition hover:bg-[#f5f0e6]"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-extrabold sm:hidden">
                              {formatPrice(
                                itemTotal
                              )}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                removeItem(
                                  item.id
                                )
                              }
                              className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#9b6f6f] transition hover:text-red-600"
                            >
                              <Trash2
                                size={13}
                              />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ===============================================
                TRUST STRIP
            =============================================== */}

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure Payments",
                  text: "Protected checkout",
                },
                {
                  icon: Truck,
                  title: "Reliable Delivery",
                  text: "Doorstep delivery",
                },
                {
                  icon: BadgeCheck,
                  title: "Easy Returns",
                  text: "Simple return process",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-[0_8px_25px_rgba(70,45,10,0.035)]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f0df] text-[#977538]">
                      <Icon size={17} />
                    </div>

                    <div>
                      <p className="text-[10px] font-extrabold">
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

          {/* =================================================
              RIGHT SUMMARY
          ================================================= */}

          <aside className="lg:sticky lg:top-[98px] lg:h-fit">
            <div className="overflow-hidden rounded-[26px] border border-[#eadfc9] bg-white shadow-[0_18px_50px_rgba(70,45,10,0.075)]">
              {/* SUMMARY HEADER */}

              <button
                type="button"
                onClick={() =>
                  setShowMobileSummary(
                    !showMobileSummary
                  )
                }
                className="flex w-full items-center justify-between border-b border-[#eee6d8] p-5 text-left lg:cursor-default"
              >
                <div>
                  <p className="text-base font-extrabold">
                    Price Details
                  </p>

                  <p className="mt-1 text-[9px] text-[#887d6c]">
                    {totalItems} item
                    {totalItems !== 1
                      ? "s"
                      : ""}{" "}
                    • Secure checkout
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
                className={
                  showMobileSummary
                    ? "block"
                    : "hidden lg:block"
                }
              >
                <div className="space-y-4 p-5">
                  {/* PRICE */}

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#756b5d]">
                        Price ({totalItems} items)
                      </span>

                      <span className="font-bold">
                        {formatPrice(totalMrp)}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-[#756b5d]">
                        Product Discount
                      </span>

                      <span className="font-bold text-green-600">
                        - {formatPrice(
                          productDiscount
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-[#756b5d]">
                        Coupon Discount
                      </span>

                      <span className="font-bold text-green-600">
                        - {formatPrice(
                          couponDiscount
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-[#756b5d]">
                        Delivery Charges
                      </span>

                      <span
                        className={`font-bold ${
                          deliveryCharge === 0
                            ? "text-green-600"
                            : "text-[#514839]"
                        }`}
                      >
                        {deliveryCharge === 0
                          ? "FREE"
                          : formatPrice(
                              deliveryCharge
                            )}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-[#ded4c5]" />

                  {/* TOTAL */}

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm font-extrabold">
                        Total Amount
                      </p>

                      <p className="mt-1 text-[9px] text-[#887d6c]">
                        Inclusive of applicable charges
                      </p>
                    </div>

                    <span className="text-2xl font-black tracking-tight">
                      {formatPrice(total)}
                    </span>
                  </div>

                  {/* SAVINGS */}

                  {totalSavings > 0 && (
                    <div className="flex items-center justify-center gap-1.5 rounded-xl bg-[#edf8f0] p-3 text-center text-[10px] font-extrabold text-green-700">
                      <Zap size={13} />
                      You're saving{" "}
                      {formatPrice(
                        totalSavings
                      )}{" "}
                      on this order
                    </div>
                  )}

                  {/* COUPON */}

                  <div className="rounded-2xl border border-[#eee6d8] bg-[#fcfaf6] p-3.5">
                    <div className="mb-2.5 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f7f0df] text-[#977538]">
                        <Gift size={14} />
                      </div>

                      <div>
                        <p className="text-[10px] font-extrabold">
                          Have a coupon?
                        </p>

                        <p className="text-[8px] text-[#948978]">
                          Save more on your order
                        </p>
                      </div>
                    </div>

                    {couponApplied ? (
                      <div className="flex items-center justify-between rounded-xl border border-green-100 bg-white p-2.5">
                        <div className="flex items-center gap-2">
                          <CircleCheck
                            size={15}
                            className="text-green-600"
                          />

                          <div>
                            <p className="text-[10px] font-extrabold text-green-700">
                              PRIME10
                            </p>

                            <p className="text-[8px] text-[#887d6c]">
                              10% discount applied
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={
                            removeCoupon
                          }
                          className="text-[9px] font-extrabold text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <input
                            value={coupon}
                            onChange={(e) => {
                              setCoupon(
                                e.target.value.toUpperCase()
                              );
                              setCouponError(
                                ""
                              );
                            }}
                            placeholder="Enter coupon code"
                            className="h-10 min-w-0 flex-1 rounded-xl border border-[#ddd2c0] bg-white px-3 text-[10px] font-bold outline-none transition focus:border-[#b9975b] focus:ring-2 focus:ring-[#b9975b]/10"
                          />

                          <button
                            type="button"
                            onClick={
                              applyCoupon
                            }
                            className="h-10 rounded-xl bg-[#f5f0e6] px-4 text-[10px] font-extrabold text-[#977538] transition hover:bg-[#eee4d1]"
                          >
                            Apply
                          </button>
                        </div>

                        {couponError && (
                          <p className="mt-2 flex items-center gap-1 text-[9px] font-semibold text-red-500">
                            <CircleAlert
                              size={11}
                            />
                            {couponError}
                          </p>
                        )}

                        {!couponError && (
                          <p className="mt-2 text-[8px] text-[#948978]">
                            Try{" "}
                            <span className="font-extrabold text-[#977538]">
                              PRIME10
                            </span>{" "}
                            for 10% off, up to ₹500.
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* DELIVERY ESTIMATE */}

                  <div className="rounded-2xl border border-[#eadfc9] bg-[#fffdf9] p-3.5">
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7f0df] text-[#977538]">
                        <Truck size={16} />
                      </div>

                      <div>
                        <p className="text-[10px] font-extrabold">
                          Estimated Delivery
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-[#514839]">
                          {getDeliveryDate()} –{" "}
                          {(() => {
                            const date =
                              new Date();

                            date.setDate(
                              date.getDate() +
                                7
                            );

                            return date.toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                              }
                            );
                          })()}
                        </p>

                        <p className="mt-1 text-[8px] text-[#887d6c]">
                          Delivery timeline may vary by
                          location.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PLACE ORDER */}

                  <button
                    type="button"
                    onClick={placeOrder}
                    disabled={placingOrder}
                    className="group relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#b9975b] px-5 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(185,151,91,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#977538] hover:shadow-[0_16px_34px_rgba(185,151,91,0.32)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-700 group-hover:translate-x-full" />

                    {placingOrder ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Processing Order...
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

                  <p className="flex items-center justify-center gap-1.5 text-center text-[8px] leading-4 text-[#948978]">
                    <ShieldCheck size={11} />
                    Secure checkout • Your information is
                    protected
                  </p>
                </div>
              </div>
            </div>

            {/* ===============================================
                SELECTED ADDRESS
            =============================================== */}

            {selectedAddress && (
              <div className="mt-4 rounded-[22px] border border-[#eadfc9] bg-white p-4 shadow-[0_8px_25px_rgba(70,45,10,0.035)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={14}
                      className="text-[#977538]"
                    />

                    <p className="text-[10px] font-extrabold">
                      Delivering To
                    </p>
                  </div>

                  <span className="rounded-md bg-[#f4efe5] px-2 py-1 text-[8px] font-extrabold text-[#80683f]">
                    {selectedAddress.type}
                  </span>
                </div>

                <p className="mt-3 text-xs font-extrabold">
                  {selectedAddress.name}
                </p>

                <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-[#756b5d]">
                  {selectedAddress.address},{" "}
                  {selectedAddress.city},{" "}
                  {selectedAddress.state} -{" "}
                  {selectedAddress.pincode}
                </p>

                <div className="mt-2 flex items-center gap-1.5 text-[9px] text-[#887d6c]">
                  <Phone size={11} />
                  {selectedAddress.phone}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ===================================================
          MOBILE BOTTOM BAR
      =================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#eadfc9] bg-white/95 p-3 shadow-[0_-10px_35px_rgba(40,30,10,0.12)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setShowMobileSummary(
                !showMobileSummary
              )
            }
            className="min-w-0 flex-1 text-left"
          >
            <div className="flex items-center gap-1">
              <p className="text-[9px] font-medium text-[#887d6c]">
                Total Amount
              </p>

              {showMobileSummary ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronUp size={12} />
              )}
            </div>

            <p className="text-lg font-black">
              {formatPrice(total)}
            </p>
          </button>

          <button
            type="button"
            onClick={placeOrder}
            disabled={placingOrder}
            className="flex h-12 min-w-[165px] items-center justify-center gap-2 rounded-xl bg-[#b9975b] px-4 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(185,151,91,0.25)] transition hover:bg-[#977538] disabled:opacity-70"
          >
            {placingOrder ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Processing
              </>
            ) : (
              <>
                Place Order
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-12px) translateX(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </main>
  );
}
