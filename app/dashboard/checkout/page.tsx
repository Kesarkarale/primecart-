"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ElementType } from "react";
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

/* =========================================================
   TYPES
========================================================= */

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

/* =========================================================
   CONSTANTS
========================================================= */

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
  icon: ElementType;
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

function formatPrice(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
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
    const fileName = image.replace("/products/", "");

    return [
      image,
      `/${fileName}`,
    ];
  }

  if (image.startsWith("products/")) {
    const fileName = image.replace("products/", "");

    return [
      `/${image}`,
      `/${fileName}`,
    ];
  }

  if (image.startsWith("/public/products/")) {
    return [
      image.replace("/public", ""),
      `/${image.split("/").pop()}`,
    ];
  }

  if (image.startsWith("public/products/")) {
    return [
      `/${image.replace("public/", "")}`,
      `/${image.split("/").pop()}`,
    ];
  }

  if (image.startsWith("/")) {
    return [
      `/products/${image.slice(1)}`,
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

  const currentSrc = candidates[index];

  if (!currentSrc) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#faf8f3]">
        <Package
          size={25}
          className="text-[#b8ad9c]"
        />
      </div>
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      unoptimized
      className="object-contain p-2.5"
      sizes="96px"
      onError={() => {
        if (index < candidates.length - 1) {
          setIndex((current) => current + 1);
        }
      }}
    />
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function CheckoutPage() {
  const router = useRouter();

  /* CART */
  const [items, setItems] = useState<CartItem[]>([]);

  /* ADDRESS */
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] =
    useState("");

  /* PAYMENT */
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("upi");

  const [expandedPayment, setExpandedPayment] =
    useState<PaymentMethod>("upi");

  const [selectedUpi, setSelectedUpi] =
    useState("gpay");

  const [upiId, setUpiId] = useState("");

  const [cardNumber, setCardNumber] =
    useState("");

  const [cardName, setCardName] =
    useState("");

  const [cardExpiry, setCardExpiry] =
    useState("");

  const [cardCvv, setCardCvv] =
    useState("");

  const [selectedBank, setSelectedBank] =
    useState("");

  const [selectedWallet, setSelectedWallet] =
    useState("paytm");

  const [emiMonths, setEmiMonths] =
    useState("6");

  /* COUPON */
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] =
    useState(false);
  const [couponError, setCouponError] =
    useState("");

  /* ADDRESS FORM */
  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [editingAddressId, setEditingAddressId] =
    useState<string | null>(null);

  const [addressForm, setAddressForm] =
    useState<Address>(defaultAddress);

  /* UI */
  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [showMobileSummary, setShowMobileSummary] =
    useState(false);

  const [toast, setToast] = useState("");

  /* =========================================================
     LOAD LOCAL DATA
  ========================================================= */

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem(CART_KEY);

      if (savedCart) {
        const parsed = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          setItems(
            parsed.map((item) => ({
              ...item,
              quantity: Math.max(
                1,
                Number(item.quantity || 1)
              ),
              price: Number(item.price || 0),
              original_price:
                item.original_price == null
                  ? null
                  : Number(item.original_price),
            }))
          );
        }
      }

      const savedAddresses =
        localStorage.getItem(ADDRESS_KEY);

      if (savedAddresses) {
        const parsed =
          JSON.parse(savedAddresses);

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

  /* =========================================================
     TOAST
  ========================================================= */

  function showToast(message: string) {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2800);
  }

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const selectedAddress = useMemo(() => {
    return (
      addresses.find(
        (address) =>
          address.id === selectedAddressId
      ) || null
    );
  }, [
    addresses,
    selectedAddressId,
  ]);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 1),
      0
    );
  }, [items]);

  const totalMrp = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        Number(
          item.original_price ||
            item.price ||
            0
        ) *
          Number(item.quantity || 1),
      0
    );
  }, [items]);

  const productDiscount = Math.max(
    totalMrp - subtotal,
    0
  );

  const couponDiscount = couponApplied
    ? Math.min(
        Math.round(subtotal * 0.1),
        500
      )
    : 0;

  const deliveryCharge =
    subtotal - couponDiscount >= 999
      ? 0
      : 49;

  const total = Math.max(
    subtotal -
      couponDiscount +
      deliveryCharge,
    0
  );

  const totalItems = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 1),
    0
  );

  const totalSavings =
    productDiscount + couponDiscount;

  /* =========================================================
     CART
  ========================================================= */

  function syncCart(nextItems: CartItem[]) {
    setItems(nextItems);

    try {
      if (nextItems.length === 0) {
        localStorage.removeItem(CART_KEY);
      } else {
        localStorage.setItem(
          CART_KEY,
          JSON.stringify(nextItems)
        );
      }
    } catch {
      // Ignore localStorage failure.
    }
  }

  function updateQuantity(
    id: string,
    change: number
  ) {
    const next = items
      .map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          quantity: Math.max(
            1,
            Number(item.quantity || 1) +
              change
          ),
        };
      });

    syncCart(next);
  }

  function removeItem(id: string) {
    const removed = items.find(
      (item) => item.id === id
    );

    const next = items.filter(
      (item) => item.id !== id
    );

    syncCart(next);

    if (removed) {
      showToast(
        `${removed.name} removed from cart.`
      );
    }
  }

  /* =========================================================
     COUPON
  ========================================================= */

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();

    setCouponError("");

    if (!code) {
      setCouponError(
        "Enter a coupon code."
      );
      return;
    }

    if (code !== "PRIME10") {
      setCouponApplied(false);

      setCouponError(
        "Invalid coupon code. Try PRIME10."
      );

      return;
    }

    setCoupon(code);
    setCouponApplied(true);
    showToast(
      "PRIME10 applied successfully."
    );
  }

  function removeCoupon() {
    setCoupon("");
    setCouponApplied(false);
    setCouponError("");

    showToast("Coupon removed.");
  }

  /* =========================================================
     ADDRESS
  ========================================================= */

  function openNewAddress() {
    setAddressForm({
      ...defaultAddress,
      id: `address-${Date.now()}`,
    });

    setEditingAddressId(null);
    setShowAddressForm(true);
  }

  function editAddress(address: Address) {
    setAddressForm({
      ...address,
    });

    setEditingAddressId(address.id);
    setShowAddressForm(true);
  }

  function saveAddress() {
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
      showToast(
        "Please fill all address details."
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      showToast(
        "Enter a valid 10-digit mobile number."
      );
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      showToast(
        "Enter a valid 6-digit pincode."
      );
      return;
    }

    const cleanedAddress: Address = {
      ...addressForm,
      name,
      phone,
      address,
      city,
      state,
      pincode,
    };

    let updatedAddresses: Address[];

    if (editingAddressId) {
      updatedAddresses =
        addresses.map((item) =>
          item.id === editingAddressId
            ? cleanedAddress
            : item
        );
    } else {
      updatedAddresses = [
        ...addresses,
        cleanedAddress,
      ];
    }

    try {
      localStorage.setItem(
        ADDRESS_KEY,
        JSON.stringify(updatedAddresses)
      );
    } catch {
      showToast(
        "Unable to save address."
      );
      return;
    }

    setAddresses(updatedAddresses);
    setSelectedAddressId(
      cleanedAddress.id
    );

    setAddressForm(defaultAddress);
    setEditingAddressId(null);
    setShowAddressForm(false);

    showToast(
      editingAddressId
        ? "Address updated successfully."
        : "Address added successfully."
    );
  }

  function deleteAddress(id: string) {
    const target = addresses.find(
      (address) => address.id === id
    );

    const updated =
      addresses.filter(
        (address) => address.id !== id
      );

    setAddresses(updated);

    try {
      localStorage.setItem(
        ADDRESS_KEY,
        JSON.stringify(updated)
      );
    } catch {
      // Ignore.
    }

    if (selectedAddressId === id) {
      setSelectedAddressId(
        updated[0]?.id || ""
      );
    }

    if (target) {
      showToast(
        `${target.type} address deleted.`
      );
    }
  }

  /* =========================================================
     PAYMENT
  ========================================================= */

  function validatePayment() {
    if (paymentMethod === "upi") {
      if (selectedUpi === "upi-id") {
        const value =
          upiId.trim();

        if (
          !value ||
          !/^[\w.-]+@[\w.-]+$/.test(value)
        ) {
          showToast(
            "Enter a valid UPI ID."
          );
          return false;
        }
      }
    }

    if (paymentMethod === "card") {
      const number =
        cardNumber.replace(/\s/g, "");

      if (number.length !== 16) {
        showToast(
          "Enter a valid 16-digit card number."
        );
        return false;
      }

      if (!cardName.trim()) {
        showToast(
          "Enter the name on your card."
        );
        return false;
      }

      if (
        !/^\d{2}\/\d{2}$/.test(
          cardExpiry
        )
      ) {
        showToast(
          "Enter a valid expiry date."
        );
        return false;
      }

      if (cardCvv.length !== 3) {
        showToast(
          "Enter a valid 3-digit CVV."
        );
        return false;
      }
    }

    if (
      paymentMethod === "netbanking" &&
      !selectedBank
    ) {
      showToast(
        "Please select your bank."
      );
      return false;
    }

    if (
      paymentMethod === "wallet" &&
      !selectedWallet
    ) {
      showToast(
        "Please select a wallet."
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
      return selectedBank
        ? `Net Banking - ${selectedBank}`
        : "Net Banking";
    }

    if (paymentMethod === "wallet") {
      return `Wallet - ${selectedWallet}`;
    }

    if (paymentMethod === "emi") {
      return `EMI - ${emiMonths} months`;
    }

    return "Cash on Delivery";
  }

  /* =========================================================
     PLACE ORDER
  ========================================================= */

  async function placeOrder() {
    if (placingOrder) return;

    if (items.length === 0) {
      showToast("Your cart is empty.");
      return;
    }

    if (!selectedAddress) {
      showToast(
        "Please select a delivery address."
      );
      return;
    }

    if (!validatePayment()) {
      return;
    }

    setPlacingOrder(true);

    try {
      const orderId =
        `PC-${Date.now()
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
        delivery:
          deliveryCharge,
        discount:
          totalSavings,
        address:
          selectedAddress,
        items,
      };

      let existingOrders: OrderRecord[] =
        [];

      try {
        const stored =
          localStorage.getItem(
            ORDERS_KEY
          );

        const parsed = stored
          ? JSON.parse(stored)
          : [];

        if (Array.isArray(parsed)) {
          existingOrders = parsed;
        }
      } catch {
        existingOrders = [];
      }

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

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 1000)
      );

      router.push(
        `/dashboard/order-success?order=${orderId}`
      );
    } catch {
      setPlacingOrder(false);

      showToast(
        "Something went wrong. Please try again."
      );
    }
  }

  /* =========================================================
     FORMATTING
  ========================================================= */

  function formatCardNumber(
    value: string
  ) {
    const numbers = value
      .replace(/\D/g, "")
      .slice(0, 16);

    return numbers
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  function formatExpiry(
    value: string
  ) {
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

  /* =========================================================
     EMPTY CART
  ========================================================= */

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#faf8f3] text-[#17130d]">
        <header className="border-b border-[#eadfc9] bg-white">
          <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5">
            <Link
              href="/dashboard/products"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b9975b] text-white shadow-sm">
                <ArrowLeft size={18} />
              </div>

              <div>
                <p className="text-sm font-bold">
                  Checkout
                </p>

                <p className="text-[10px] text-[#8b8070]">
                  PrimeCart secure checkout
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-2 text-xs font-semibold text-[#977538] sm:flex">
              <ShieldCheck size={17} />
              Secure Checkout
            </div>
          </div>
        </header>

        <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-5xl items-center justify-center px-5 py-12">
          <div className="w-full max-w-xl rounded-[32px] border border-[#eadfc9] bg-white p-8 text-center shadow-[0_25px_80px_rgba(60,40,10,0.08)] sm:p-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#f7f0df] text-[#a47d3d]">
              <Package size={38} />
            </div>

            <div className="mx-auto mt-5 flex w-fit items-center gap-1 rounded-full border border-[#eadfc9] bg-[#fcfaf6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#977538]">
              <Zap size={11} />
              Checkout Ready
            </div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756b5d]">
              Add products to your cart and come back here
              to complete your secure PrimeCart order.
            </p>

            <Link
              href="/dashboard/products"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#b9975b] px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(185,151,91,0.22)] transition hover:-translate-y-0.5 hover:bg-[#977538]"
            >
              Continue Shopping
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#faf8f3] pb-20 text-[#17130d] lg:pb-8">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#eadfc9] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1450px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/cart"
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b9975b] text-white shadow-sm transition group-hover:bg-[#977538]">
              <ArrowLeft size={18} />
            </div>

            <div>
              <p className="text-base font-extrabold tracking-tight">
                Checkout
              </p>

              <p className="hidden text-[10px] font-medium text-[#887d6c] sm:block">
                Secure & easy payment
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <div className="flex items-center gap-2 text-[#977538]">
              <ShieldCheck size={19} />

              <span className="text-xs font-bold">
                100% Secure Checkout
              </span>
            </div>

            <div className="h-5 w-px bg-[#eadfc9]" />

            <div className="flex items-center gap-2 text-[#756b5d]">
              <Lock size={16} />

              <span className="text-xs font-semibold">
                Your data is protected
              </span>
            </div>
          </div>

          <Link
            href="/dashboard/products"
            className="text-xs font-bold text-[#756b5d] transition hover:text-[#977538]"
          >
            Continue Shopping
          </Link>
        </div>
      </header>

      {/* =====================================================
          PROGRESS
      ===================================================== */}

      <section className="border-b border-[#eadfc9] bg-white">
        <div className="mx-auto max-w-[1450px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-3xl items-center">
            {[
              ["1", "Cart"],
              ["2", "Address"],
              ["3", "Payment"],
              ["4", "Confirmation"],
            ].map(
              ([number, label], index) => {
                const completed =
                  index < 3;

                const active =
                  index === 2;

                return (
                  <div
                    key={number}
                    className="flex min-w-0 flex-1 items-center"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold transition ${
                          completed || active
                            ? "bg-[#b9975b] text-white shadow-[0_5px_15px_rgba(185,151,91,0.2)]"
                            : "bg-[#f4efe5] text-[#a49a8b]"
                        }`}
                      >
                        {completed ? (
                          <Check size={14} />
                        ) : (
                          number
                        )}
                      </div>

                      <span
                        className={`hidden truncate text-xs font-bold sm:block ${
                          completed || active
                            ? "text-[#514839]"
                            : "text-[#a49a8b]"
                        }`}
                      >
                        {label}
                      </span>
                    </div>

                    {index < 3 && (
                      <div
                        className={`mx-2 h-px flex-1 sm:mx-5 ${
                          index < 2
                            ? "bg-[#cdb98d]"
                            : "bg-[#eadfc9]"
                        }`}
                      />
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div className="mx-auto max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] xl:gap-8">
          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-5">
            {/* =================================================
                ADDRESS
            ================================================= */}

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

                    <p className="text-[11px] text-[#8b8070]">
                      Choose where you want your order delivered
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openNewAddress}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8c7a5] px-3 py-2 text-xs font-bold text-[#977538] transition hover:bg-[#fbf7ee]"
                >
                  <Plus size={15} />
                  <span className="hidden sm:inline">
                    Add New
                  </span>
                  <span className="sm:hidden">
                    Add
                  </span>
                </button>
              </div>

              <div className="space-y-3 p-5 sm:p-6">
                {addresses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#d9cdb9] bg-[#fcfaf6] p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f7f0df] text-[#b9975b]">
                      <MapPin size={25} />
                    </div>

                    <p className="mt-4 text-sm font-extrabold">
                      Add a delivery address
                    </p>

                    <p className="mt-1 text-xs text-[#887d6c]">
                      We need your address to deliver the order.
                    </p>

                    <button
                      type="button"
                      onClick={openNewAddress}
                      className="mt-5 rounded-xl bg-[#b9975b] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#977538]"
                    >
                      Add Address
                    </button>
                  </div>
                ) : (
                  addresses.map(
                    (address) => {
                      const selected =
                        selectedAddressId ===
                        address.id;

                      return (
                        <div
                          key={address.id}
                          onClick={() =>
                            setSelectedAddressId(
                              address.id
                            )
                          }
                          className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
                            selected
                              ? "border-[#b9975b] bg-[#fcfaf6] shadow-[0_8px_25px_rgba(185,151,91,0.12)]"
                              : "border-[#eee6d8] bg-white hover:border-[#d6c39f] hover:shadow-sm"
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

                                <span className="rounded-md bg-[#f4efe5] px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#80683f]">
                                  {address.type}
                                </span>

                                {selected && (
                                  <span className="rounded-md bg-[#edf8f0] px-2 py-1 text-[9px] font-extrabold text-green-700">
                                    SELECTED
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#655c50]">
                                <Phone size={11} />
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
                                type="button"
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
                                type="button"
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
                      );
                    }
                  )
                )}

                {/* ADDRESS FORM */}

                {showAddressForm && (
                  <div className="animate-in fade-in slide-in-from-top-2 rounded-2xl border border-[#d9c9aa] bg-[#fcfaf6] p-4 duration-300 sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold">
                          {editingAddressId
                            ? "Edit Address"
                            : "Add New Address"}
                        </h3>

                        <p className="mt-0.5 text-[10px] text-[#8b8070]">
                          Enter your delivery details
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(
                            false
                          );
                          setEditingAddressId(
                            null
                          );
                          setAddressForm(
                            defaultAddress
                          );
                        }}
                        className="rounded-lg p-1.5 text-[#877b6b] hover:bg-[#eee6d8]"
                      >
                        <X size={17} />
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        value={addressForm.name}
                        onChange={(event) =>
                          setAddressForm({
                            ...addressForm,
                            name: event.target.value,
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
                          value={
                            addressForm.phone
                          }
                          maxLength={10}
                          inputMode="numeric"
                          onChange={(event) =>
                            setAddressForm({
                              ...addressForm,
                              phone: event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10),
                            })
                          }
                          placeholder="Mobile number"
                          className="h-11 w-full rounded-xl border border-[#ddd2c0] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#b9975b] focus:ring-2 focus:ring-[#b9975b]/10"
                        />
                      </div>

                      <input
                        value={
                          addressForm.address
                        }
                        onChange={(event) =>
                          setAddressForm({
                            ...addressForm,
                            address:
                              event.target.value,
                          })
                        }
                        placeholder="House no., Building, Street"
                        className="h-11 rounded-xl border border-[#ddd2c0] bg-white px-3 text-sm outline-none transition focus:border-[#b9975b] focus:ring-2 focus:ring-[#b9975b]/10 sm:col-span-2"
                      />

                      <input
                        value={
                          addressForm.city
                        }
                        onChange={(event) =>
                          setAddressForm({
                            ...addressForm,
                            city:
                              event.target.value,
                          })
                        }
                        placeholder="City"
                        className="h-11 rounded-xl border border-[#ddd2c0] bg-white px-3 text-sm outline-none transition focus:border-[#b9975b]"
                      />

                      <input
                        value={
                          addressForm.state
                        }
                        onChange={(event) =>
                          setAddressForm({
                            ...addressForm,
                            state:
                              event.target.value,
                          })
                        }
                        placeholder="State"
                        className="h-11 rounded-xl border border-[#ddd2c0] bg-white px-3 text-sm outline-none transition focus:border-[#b9975b]"
                      />

                      <input
                        value={
                          addressForm.pincode
                        }
                        maxLength={6}
                        inputMode="numeric"
                        onChange={(event) =>
                          setAddressForm({
                            ...addressForm,
                            pincode:
                              event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6),
                          })
                        }
                        placeholder="Pincode"
                        className="h-11 rounded-xl border border-[#ddd2c0] bg-white px-3 text-sm outline-none transition focus:border-[#b9975b]"
                      />

                      <select
                        value={
                          addressForm.type
                        }
                        onChange={(event) =>
                          setAddressForm({
                            ...addressForm,
                            type:
                              event.target.value as Address["type"],
                          })
                        }
                        className="h-11 rounded-xl border border-[#ddd2c0] bg-white px-3 text-sm outline-none focus:border-[#b9975b]"
                      >
                        <option value="Home">
                          Home
                        </option>
                        <option value="Work">
                          Work
                        </option>
                        <option value="Other">
                          Other
                        </option>
                      </select>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(
                            false
                          );
                          setEditingAddressId(
                            null
                          );
                        }}
                        className="rounded-xl border border-[#ddd2c0] bg-white px-4 py-2.5 text-xs font-bold transition hover:bg-[#f5f0e6]"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={saveAddress}
                        className="rounded-xl bg-[#b9975b] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#977538]"
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

            {/* =================================================
                PAYMENT
            ================================================= */}

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

                    <p className="text-[11px] text-[#8b8070]">
                      Select your preferred payment option
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="overflow-hidden rounded-2xl border border-[#e9dfce]">
                  {paymentOptions.map(
                    (option, index) => {
                      const Icon =
                        option.icon;

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
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
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
                                  {
                                    option.title
                                  }
                                </span>

                                {option.id ===
                                  "upi" && (
                                  <span className="rounded-full bg-[#e9f7ee] px-2 py-0.5 text-[8px] font-extrabold tracking-wide text-green-700">
                                    RECOMMENDED
                                  </span>
                                )}
                              </div>

                              <p className="mt-0.5 text-[10px] text-[#8a7e6d]">
                                {
                                  option.subtitle
                                }
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
                              <div className="animate-in fade-in slide-in-from-top-1 border-t border-[#eee6d8] bg-[#fcfaf6] p-4 duration-300 sm:p-5">
                                {/* UPI */}

                                {option.id ===
                                  "upi" && (
                                  <div>
                                    <p className="mb-3 text-xs font-extrabold text-[#655c50]">
                                      Pay using UPI
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
                                            type="button"
                                            key={id}
                                            onClick={() =>
                                              setSelectedUpi(
                                                id
                                              )
                                            }
                                            className={`rounded-xl border p-3 text-center transition ${
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
                                              {
                                                label
                                              }
                                            </span>
                                          </button>
                                        )
                                      )}
                                    </div>

                                    {selectedUpi ===
                                      "upi-id" && (
                                      <div className="mt-4">
                                        <label className="mb-1.5 block text-xs font-bold">
                                          Enter UPI ID
                                        </label>

                                        <input
                                          value={
                                            upiId
                                          }
                                          onChange={(
                                            event
                                          ) =>
                                            setUpiId(
                                              event
                                                .target
                                                .value
                                            )
                                          }
                                          placeholder="yourname@upi"
                                          className="h-11 w-full rounded-xl border border-[#dcd1c0] bg-white px-3 text-sm outline-none focus:border-[#b9975b] focus:ring-2 focus:ring-[#b9975b]/10"
                                        />
                                      </div>
                                    )}

                                    <div className="mt-4 flex items-start gap-2 rounded-xl bg-white p-3">
                                      <ShieldCheck
                                        size={
                                          16
                                        }
                                        className="mt-0.5 shrink-0 text-green-600"
                                      />

                                      <p className="text-[10px] leading-4 text-[#756b5d]">
                                        Your UPI payment is processed securely. A live payment gateway can be connected later for real transactions.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* CARD */}

                                {option.id ===
                                  "card" && (
                                  <div>
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                      <p className="text-xs font-extrabold">
                                        Enter card details
                                      </p>

                                      <div className="flex gap-1.5 text-[8px] font-extrabold text-[#897d6d]">
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
                                          value={
                                            cardNumber
                                          }
                                          onChange={(
                                            event
                                          ) =>
                                            setCardNumber(
                                              formatCardNumber(
                                                event
                                                  .target
                                                  .value
                                              )
                                            )
                                          }
                                          placeholder="1234 5678 9012 3456"
                                          inputMode="numeric"
                                          autoComplete="cc-number"
                                          className="h-11 w-full rounded-xl border border-[#dcd1c0] bg-white px-3 text-sm tracking-wider outline-none focus:border-[#b9975b] focus:ring-2 focus:ring-[#b9975b]/10"
                                        />
                                      </div>

                                      <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-xs font-semibold text-[#655c50]">
                                          Name on Card
                                        </label>

                                        <input
                                          value={
                                            cardName
                                          }
                                          onChange={(
                                            event
                                          ) =>
                                            setCardName(
                                              event
                                                .target
                                                .value
                                            )
                                          }
                                          placeholder="Enter name as on card"
                                          autoComplete="cc-name"
                                          className="h-11 w-full rounded-xl border border-[#dcd1c0] bg-white px-3 text-sm outline-none focus:border-[#b9975b]"
                                        />
                                      </div>

                                      <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-[#655c50]">
                                          Expiry
                                        </label>

                                        <input
                                          value={
                                            cardExpiry
                                          }
                                          onChange={(
                                            event
                                          ) =>
                                            setCardExpiry(
                                              formatExpiry(
                                                event
                                                  .target
                                                  .value
                                              )
                                            )
                                          }
                                          placeholder="MM/YY"
                                          inputMode="numeric"
                                          autoComplete="cc-exp"
                                          className="h-11 w-full rounded-xl border border-[#dcd1c0] bg-white px-3 text-sm outline-none focus:border-[#b9975b]"
                                        />
                                      </div>

                                      <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-[#655c50]">
                                          CVV
                                        </label>

                                        <input
                                          value={
                                            cardCvv
                                          }
                                          onChange={(
                                            event
                                          ) =>
                                            setCardCvv(
                                              event
                                                .target
                                                .value
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
                                          type="password"
                                          placeholder="•••"
                                          inputMode="numeric"
                                          autoComplete="cc-csc"
                                          className="h-11 w-full rounded-xl border border-[#dcd1c0] bg-white px-3 text-sm outline-none focus:border-[#b9975b]"
                                        />
                                      </div>
                                    </div>

                                    <div className="mt-4 flex gap-2 rounded-xl bg-white p-3">
                                      <Lock
                                        size={
                                          15
                                        }
                                        className="mt-0.5 text-[#977538]"
                                      />

                                      <p className="text-[10px] leading-4 text-[#756b5d]">
                                        Card details are encrypted and securely processed. PrimeCart does not store your CVV.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* NET BANKING */}

                                {option.id ===
                                  "netbanking" && (
                                  <div>
                                    <p className="mb-3 text-xs font-extrabold">
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
                                            key={bank}
                                            onClick={() =>
                                              setSelectedBank(
                                                bank
                                              )
                                            }
                                            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                                              selectedBank ===
                                              bank
                                                ? "border-[#b9975b] bg-white shadow-sm"
                                                : "border-[#e1d8c9] bg-white hover:border-[#cdb88d]"
                                            }`}
                                          >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f0e6] text-[#977538]">
                                              <Landmark
                                                size={
                                                  17
                                                }
                                              />
                                            </div>

                                            <span className="text-xs font-semibold">
                                              {
                                                bank
                                              }
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
                                    <p className="mb-3 text-xs font-extrabold">
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
                                            key={wallet}
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

                                            <span className="mt-2 block text-[10px] font-extrabold">
                                              {
                                                wallet
                                              }
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
                                    <p className="mb-3 text-xs font-extrabold">
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
                                            key={month}
                                            onClick={() =>
                                              setEmiMonths(
                                                month
                                              )
                                            }
                                            className={`rounded-xl border p-3 text-center transition ${
                                              emiMonths ===
                                              month
                                                ? "border-[#b9975b] bg-white shadow-sm"
                                                : "border-[#e1d8c9] bg-white hover:border-[#cdb88d]"
                                            }`}
                                          >
                                            <p className="text-sm font-extrabold">
                                              {
                                                month
                                              }{" "}
                                              Months
                                            </p>

                                            <p className="mt-1 text-[9px] text-[#887d6c]">
                                              Easy installments
                                            </p>
                                          </button>
                                        )
                                      )}
                                    </div>

                                    <div className="mt-4 rounded-xl bg-white p-3 text-[10px] leading-4 text-[#756b5d]">
                                      EMI availability depends on your bank/card. Final interest and EMI amount will be shown by the payment provider.
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
                                        <p className="text-xs font-extrabold">
                                          Cash on Delivery
                                        </p>

                                        <p className="mt-1 text-[10px] leading-4 text-[#756b5d]">
                                          Pay securely in cash when your order arrives at your doorstep.
                                        </p>
                                      </div>
                                    </div>

                                    <div className="mt-3 flex gap-2 rounded-xl bg-[#fff8e8] p-3 text-[10px] text-[#765d2e]">
                                      <CircleAlert
                                        size={
                                          14
                                        }
                                        className="shrink-0"
                                      />

                                      <span>
                                        COD availability can depend on the product and delivery location.
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

            {/* =================================================
                ORDER ITEMS
            ================================================= */}

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

                <div className="rounded-full bg-[#f7f0df] px-3 py-1.5 text-[9px] font-extrabold text-[#80683f]">
                  {items.length} PRODUCT
                  {items.length !== 1
                    ? "S"
                    : ""}
                </div>
              </div>

              <div className="divide-y divide-[#eee6d8]">
                {items.map((item) => {
                  const discount =
                    getDiscount(
                      item.price,
                      item.original_price
                    );

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 p-4 transition hover:bg-[#fdfbf7] sm:gap-5 sm:p-5"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#eee6d8] bg-[#faf8f3] sm:h-24 sm:w-24">
                        <ProductImage
                          src={
                            item.image_url
                          }
                          alt={
                            item.name
                          }
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-extrabold leading-5">
                              {
                                item.name
                              }
                            </p>

                            {item.brand && (
                              <p className="mt-1 text-[10px] font-medium text-[#887d6c]">
                                {
                                  item.brand
                                }
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.id
                              )
                            }
                            className="shrink-0 rounded-lg p-1.5 text-[#aa8d8d] transition hover:bg-red-50 hover:text-red-500 sm:hidden"
                          >
                            <Trash2
                              size={14}
                            />
                          </button>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-extrabold">
                            {formatPrice(
                              item.price
                            )}
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

                                <span className="rounded-md bg-[#edf8f0] px-1.5 py-0.5 text-[9px] font-extrabold text-green-600">
                                  {
                                    discount
                                  }
                                  % OFF
                                </span>
                              </>
                            )}
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center overflow-hidden rounded-lg border border-[#ddd2c0] bg-white">
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
                              <Minus
                                size={
                                  13
                                }
                              />
                            </button>

                            <span className="flex h-8 min-w-9 items-center justify-center border-x border-[#ddd2c0] px-1 text-xs font-extrabold">
                              {
                                item.quantity
                              }
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
                              <Plus
                                size={
                                  13
                                }
                              />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.id
                              )
                            }
                            className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold text-[#9b6f6f] transition hover:bg-red-50 hover:text-red-600 sm:flex"
                          >
                            <Trash2
                              size={13}
                            />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* =================================================
                SECURITY FEATURES
            ================================================= */}

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure Payments",
                  text: "Protected checkout",
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
                const Icon =
                  item.icon;

                return (
                  <div
                    key={item.title}
                    className="group flex items-center gap-3 rounded-2xl border border-[#eadfc9] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(70,45,10,0.06)]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f0df] text-[#977538] transition group-hover:bg-[#f1e5ca]">
                      <Icon size={17} />
                    </div>

                    <div>
                      <p className="text-[11px] font-extrabold">
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
            <div className="overflow-hidden rounded-[24px] border border-[#eadfc9] bg-white shadow-[0_18px_45px_rgba(70,45,10,0.07)]">
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

                  <p className="mt-1 text-[10px] text-[#887d6c]">
                    {totalItems} item
                    {totalItems !==
                    1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <span className="lg:hidden">
                  {showMobileSummary ? (
                    <ChevronUp
                      size={18}
                    />
                  ) : (
                    <ChevronDown
                      size={18}
                    />
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
                <div className="space-y-3 p-5">
                  {/* PRICE */}

                  <div className="flex justify-between text-xs">
                    <span className="text-[#756b5d]">
                      Price ({totalItems} items)
                    </span>

                    <span className="font-semibold">
                      {formatPrice(
                        totalMrp
                      )}
                    </span>
                  </div>

                  {/* PRODUCT DISCOUNT */}

                  <div className="flex justify-between text-xs">
                    <span className="text-[#756b5d]">
                      Product Discount
                    </span>

                    <span className="font-semibold text-green-600">
                      -{" "}
                      {formatPrice(
                        productDiscount
                      )}
                    </span>
                  </div>

                  {/* COUPON */}

                  <div className="flex justify-between text-xs">
                    <span className="text-[#756b5d]">
                      Coupon Discount
                    </span>

                    <span className="font-semibold text-green-600">
                      -{" "}
                      {formatPrice(
                        couponDiscount
                      )}
                    </span>
                  </div>

                  {/* DELIVERY */}

                  <div className="flex justify-between text-xs">
                    <span className="text-[#756b5d]">
                      Delivery Charges
                    </span>

                    <span
                      className={`font-semibold ${
                        deliveryCharge ===
                        0
                          ? "text-green-600"
                          : ""
                      }`}
                    >
                      {deliveryCharge ===
                      0
                        ? "FREE"
                        : formatPrice(
                            deliveryCharge
                          )}
                    </span>
                  </div>

                  <div className="my-3 border-t border-dashed border-[#ded4c5]" />

                  {/* TOTAL */}

                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-sm font-extrabold">
                        Total Amount
                      </span>

                      <p className="mt-1 text-[9px] text-[#948978]">
                        Inclusive of applicable charges
                      </p>
                    </div>

                    <span className="text-xl font-black">
                      {formatPrice(
                        total
                      )}
                    </span>
                  </div>

                  {/* SAVINGS */}

                  {totalSavings > 0 && (
                    <div className="rounded-xl border border-[#d9efdF] bg-[#edf8f0] p-3 text-center">
                      <p className="text-[10px] font-extrabold text-green-700">
                        🎉 You are saving{" "}
                        {formatPrice(
                          totalSavings
                        )}
                      </p>

                      <p className="mt-0.5 text-[9px] text-green-700/80">
                        Great choice! You got a better deal.
                      </p>
                    </div>
                  )}

                  {/* COUPON */}

                  <div className="pt-2">
                    <div className="mb-2 flex items-center gap-2">
                      <Gift
                        size={15}
                        className="text-[#977538]"
                      />

                      <span className="text-xs font-extrabold">
                        Apply Coupon
                      </span>
                    </div>

                    {!couponApplied ? (
                      <>
                        <div className="flex gap-2">
                          <input
                            value={
                              coupon
                            }
                            onChange={(
                              event
                            ) => {
                              setCoupon(
                                event.target.value.toUpperCase()
                              );
                              setCouponError(
                                ""
                              );
                            }}
                            placeholder="Enter coupon code"
                            className="h-10 min-w-0 flex-1 rounded-xl border border-[#ddd2c0] bg-white px-3 text-xs font-semibold uppercase outline-none transition focus:border-[#b9975b] focus:ring-2 focus:ring-[#b9975b]/10"
                          />

                          <button
                            type="button"
                            onClick={
                              applyCoupon
                            }
                            className="h-10 rounded-xl bg-[#f5f0e6] px-4 text-xs font-extrabold text-[#977538] transition hover:bg-[#eee4d1]"
                          >
                            Apply
                          </button>
                        </div>

                        {couponError && (
                          <p className="mt-2 flex items-center gap-1 text-[10px] font-medium text-red-500">
                            <CircleAlert
                              size={
                                11
                              }
                            />
                            {
                              couponError
                            }
                          </p>
                        )}

                        <p className="mt-2 text-[9px] text-[#948978]">
                          Try{" "}
                          <span className="font-extrabold text-[#80683f]">
                            PRIME10
                          </span>{" "}
                          for 10% off, up to ₹500.
                        </p>
                      </>
                    ) : (
                      <div className="flex items-center justify-between rounded-xl border border-[#d9efdF] bg-[#edf8f0] p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-green-600">
                            <Check
                              size={
                                14
                              }
                            />
                          </div>

                          <div>
                            <p className="text-[10px] font-extrabold text-green-700">
                              PRIME10 Applied
                            </p>

                            <p className="text-[9px] text-green-700/70">
                              You saved{" "}
                              {formatPrice(
                                couponDiscount
                              )}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={
                            removeCoupon
                          }
                          className="rounded-lg p-1.5 text-green-700 transition hover:bg-white"
                          title="Remove coupon"
                        >
                          <X
                            size={14}
                          />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PLACE ORDER */}

                  <button
                    type="button"
                    onClick={
                      placeOrder
                    }
                    disabled={
                      placingOrder
                    }
                    className="group relative mt-3 flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#b9975b] px-5 text-sm font-extrabold text-white shadow-[0_12px_25px_rgba(185,151,91,0.25)] transition-all duration-300 hover:bg-[#977538] hover:shadow-[0_15px_32px_rgba(185,151,91,0.32)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-700 group-hover:translate-x-full" />

                    {placingOrder ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                        Processing Order...
                      </>
                    ) : (
                      <>
                        <Lock
                          size={16}
                        />

                        Place Order

                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>

                  <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[9px] leading-4 text-[#948978]">
                    <ShieldCheck
                      size={12}
                    />

                    Safe & secure checkout powered by PrimeCart
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                SELECTED ADDRESS
            ================================================= */}

            {selectedAddress && (
              <div className="mt-4 rounded-[20px] border border-[#eadfc9] bg-white p-4 shadow-[0_8px_25px_rgba(70,45,10,0.04)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={14}
                      className="text-[#977538]"
                    />

                    <p className="text-xs font-extrabold">
                      Delivering To
                    </p>
                  </div>

                  <span className="rounded-md bg-[#f4efe5] px-2 py-1 text-[9px] font-extrabold text-[#80683f]">
                    {
                      selectedAddress.type
                    }
                  </span>
                </div>

                <p className="mt-3 text-xs font-extrabold">
                  {
                    selectedAddress.name
                  }
                </p>

                <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#756b5d]">
                  {
                    selectedAddress.address
                  }
                  ,{" "}
                  {
                    selectedAddress.city
                  }
                  ,{" "}
                  {
                    selectedAddress.state
                  }{" "}
                  -{" "}
                  {
                    selectedAddress.pincode
                  }
                </p>

                <div className="mt-2 flex items-center gap-1 text-[10px] text-[#887d6c]">
                  <Phone size={11} />
                  {
                    selectedAddress.phone
                  }
                </div>

                <button
                  type="button"
                  onClick={() =>
                    editAddress(
                      selectedAddress
                    )
                  }
                  className="mt-3 flex items-center gap-1.5 text-[10px] font-extrabold text-[#977538]"
                >
                  <Edit3
                    size={12}
                  />
                  Change Address
                </button>
              </div>
            )}

            {/* =================================================
                DELIVERY NOTE
            ================================================= */}

            <div className="rounded-[20px] border border-[#eadfc9] bg-gradient-to-r from-[#fffdf9] to-[#f8f1e3] p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#b9975b] shadow-sm">
                  <Truck
                    size={17}
                  />
                </div>

                <div>
                  <p className="text-xs font-extrabold">
                    Free delivery on orders above ₹999
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-[#817665]">
                    Your order will be securely packed and delivered to your selected address.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* =====================================================
          MOBILE BOTTOM BAR
      ===================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#eadfc9] bg-white/95 p-3 shadow-[0_-10px_35px_rgba(40,30,10,0.1)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-medium text-[#887d6c]">
              Total Amount
            </p>

            <p className="text-lg font-black">
              {formatPrice(total)}
            </p>
          </div>

          <button
            type="button"
            onClick={
              placeOrder
            }
            disabled={
              placingOrder
            }
            className="flex h-12 min-w-[165px] items-center justify-center gap-2 rounded-xl bg-[#b9975b] px-5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(185,151,91,0.25)] transition hover:bg-[#977538] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {placingOrder ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Processing
              </>
            ) : (
              <>
                Place Order
                <ArrowRight
                  size={16}
                />
              </>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[100] w-[calc(100%-32px)] max-w-sm -translate-x-1/2 animate-in fade-in slide-in-from-bottom-3 duration-300 lg:bottom-8">
          <div className="flex items-center gap-3 rounded-2xl border border-[#d9c9aa] bg-white px-4 py-3.5 shadow-[0_18px_50px_rgba(50,35,10,0.18)]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f7f0df] text-[#977538]">
              <Check
                size={16}
              />
            </div>

            <p className="min-w-0 flex-1 text-xs font-bold text-[#514839]">
              {toast}
            </p>

            <button
              type="button"
              onClick={() =>
                setToast("")
              }
              className="rounded-lg p-1 text-[#9a8e7c] hover:bg-[#f5f0e6]"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          BOTTOM SPACE FOR MOBILE BAR
      ===================================================== */}

      <div className="h-16 lg:hidden" />
    </main>
  );
}
