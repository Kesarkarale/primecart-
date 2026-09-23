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
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  CreditCard,
  Gift,
  Landmark,
  LockKeyhole,
  MapPin,
  Minus,
  Package,
  Pencil,
  Plus,
  PlusCircle,
  QrCode,
  ReceiptIndianRupee,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Trash2,
  Truck,
  Wallet,
  X,
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

type PaymentMethod =
  | "upi"
  | "card"
  | "netbanking"
  | "wallet"
  | "emi"
  | "cod";

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
const ORDER_KEY = "primecart-orders";
const LAST_ORDER_KEY = "primecart-last-order";

const FREE_DELIVERY_LIMIT = 999;
const DELIVERY_CHARGE = 49;
const COUPON_CODE = "PRIME10";

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

  const isRemote =
    current.startsWith("http://") ||
    current.startsWith("https://") ||
    current.startsWith("data:");

  if (isRemote) {
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
   SUCCESS SOUND
   IMPORTANT:
   This is triggered from the Place Order click flow.
========================================================= */

function playOrderSuccessSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }

    const now = audioContext.currentTime;

    const notes = [
      {
        frequency: 523.25,
        start: now,
        duration: 0.18,
      },
      {
        frequency: 659.25,
        start: now + 0.12,
        duration: 0.18,
      },
      {
        frequency: 783.99,
        start: now + 0.24,
        duration: 0.3,
      },
    ];

    notes.forEach((note) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(
        note.frequency,
        note.start
      );

      gain.gain.setValueAtTime(0.0001, note.start);

      gain.gain.exponentialRampToValueAtTime(
        0.055,
        note.start + 0.025
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        note.start + note.duration
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(note.start);
      oscillator.stop(note.start + note.duration + 0.03);
    });

    window.setTimeout(() => {
      audioContext.close().catch(() => {});
    }, 1200);
  } catch (error) {
    console.log("Order success sound unavailable:", error);
  }
}

/* =========================================================
   DEFAULT ADDRESS
========================================================= */

const DEFAULT_ADDRESS: Address = {
  id: "default-address",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
};

/* =========================================================
   PAYMENT LABEL
========================================================= */

function getPaymentLabel(method: PaymentMethod) {
  switch (method) {
    case "upi":
      return "UPI";
    case "card":
      return "Credit / Debit Card";
    case "netbanking":
      return "Net Banking";
    case "wallet":
      return "Wallet";
    case "emi":
      return "EMI";
    case "cod":
      return "Cash on Delivery";
    default:
      return "Payment";
  }
}

/* =========================================================
   CHECKOUT PAGE
========================================================= */

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("upi");

  const [expandedPayment, setExpandedPayment] =
    useState<PaymentMethod>("upi");

  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const [couponError, setCouponError] = useState("");

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [editingAddressId, setEditingAddressId] =
    useState<string | null>(null);

  const [addressForm, setAddressForm] =
    useState<Address>(DEFAULT_ADDRESS);

  const [addressError, setAddressError] = useState("");

  const [upiId, setUpiId] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [bank, setBank] = useState("");

  const [wallet, setWallet] = useState("");

  const [isPlacingOrder, setIsPlacingOrder] =
    useState(false);

  const [pageLoading, setPageLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [showMobileSummary, setShowMobileSummary] =
    useState(false);

  /* =======================================================
     LOAD LOCAL DATA
  ======================================================= */

  useEffect(() => {
    try {
      const storedCart = safeParse<CartItem[]>(
        localStorage.getItem(CART_KEY),
        []
      );

      const storedAddresses = safeParse<Address[]>(
        localStorage.getItem(ADDRESS_KEY),
        []
      );

      setCart(
        storedCart.map((item) => ({
          ...item,
          quantity: Math.max(
            1,
            Number(item.quantity || 1)
          ),
        }))
      );

      setAddresses(storedAddresses);

      if (storedAddresses.length > 0) {
        setSelectedAddressId(storedAddresses[0].id);
      }
    } catch (error) {
      console.error("Checkout load error:", error);
    } finally {
      setPageLoading(false);
    }
  }, []);

  /* =======================================================
     CALCULATIONS
  ======================================================= */

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0),
      0
    );
  }, [cart]);

  const totalMrp = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(
          item.original_price || item.price || 0
        ) *
          Number(item.quantity || 0),
      0
    );
  }, [cart]);

  const productSavings = Math.max(
    0,
    totalMrp - subtotal
  );

  const couponDiscount = appliedCoupon
    ? Math.min(Math.round(subtotal * 0.1), 500)
    : 0;

  const afterCoupon = Math.max(
    0,
    subtotal - couponDiscount
  );

  const delivery =
    afterCoupon >= FREE_DELIVERY_LIMIT
      ? 0
      : DELIVERY_CHARGE;

  const total = Math.max(
    0,
    afterCoupon + delivery
  );

  const freeDeliveryProgress = Math.min(
    100,
    (afterCoupon / FREE_DELIVERY_LIMIT) * 100
  );

  const remainingForFreeDelivery = Math.max(
    0,
    FREE_DELIVERY_LIMIT - afterCoupon
  );

  const totalItems = cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const selectedAddress =
    addresses.find(
      (address) =>
        address.id === selectedAddressId
    ) || null;

  /* =======================================================
     UPDATE CART
  ======================================================= */

  function saveCart(nextCart: CartItem[]) {
    setCart(nextCart);
    localStorage.setItem(
      CART_KEY,
      JSON.stringify(nextCart)
    );
  }

  function increaseQuantity(id: string) {
    const next = cart.map((item) => {
      if (item.id !== id) return item;

      const stock = Number(item.stock || 999);

      return {
        ...item,
        quantity: Math.min(
          Number(item.quantity || 1) + 1,
          stock
        ),
      };
    });

    saveCart(next);
  }

  function decreaseQuantity(id: string) {
    const next = cart
      .map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          quantity: Math.max(
            1,
            Number(item.quantity || 1) - 1
          ),
        };
      });

    saveCart(next);
  }

  function removeItem(id: string) {
    const next = cart.filter(
      (item) => item.id !== id
    );

    saveCart(next);
  }

  /* =======================================================
     COUPON
  ======================================================= */

  function applyCoupon() {
    setCouponError("");

    const value = coupon.trim().toUpperCase();

    if (!value) {
      setCouponError("Enter a coupon code.");
      return;
    }

    if (value !== COUPON_CODE) {
      setAppliedCoupon("");
      setCouponError(
        "Invalid coupon. Try PRIME10."
      );
      return;
    }

    setAppliedCoupon(value);
    setCoupon(value);
  }

  function removeCoupon() {
    setCoupon("");
    setAppliedCoupon("");
    setCouponError("");
  }

  /* =======================================================
     ADDRESS
  ======================================================= */

  function openAddAddress() {
    setEditingAddressId(null);

    setAddressForm({
      ...DEFAULT_ADDRESS,
      id: `address-${Date.now()}`,
    });

    setAddressError("");
    setShowAddressForm(true);
  }

  function openEditAddress(address: Address) {
    setEditingAddressId(address.id);
    setAddressForm({ ...address });
    setAddressError("");
    setShowAddressForm(true);
  }

  function validateAddress() {
    if (!addressForm.fullName.trim()) {
      return "Please enter your full name.";
    }

    if (
      !/^[6-9]\d{9}$/.test(
        addressForm.phone.trim()
      )
    ) {
      return "Please enter a valid 10-digit mobile number.";
    }

    if (!addressForm.addressLine1.trim()) {
      return "Please enter your address.";
    }

    if (!addressForm.city.trim()) {
      return "Please enter your city.";
    }

    if (!addressForm.state.trim()) {
      return "Please enter your state.";
    }

    if (
      !/^\d{6}$/.test(
        addressForm.pincode.trim()
      )
    ) {
      return "Please enter a valid 6-digit pincode.";
    }

    return "";
  }

  function saveAddress() {
    const error = validateAddress();

    if (error) {
      setAddressError(error);
      return;
    }

    const nextAddress = {
      ...addressForm,
      id:
        editingAddressId ||
        addressForm.id ||
        `address-${Date.now()}`,
    };

    let nextAddresses: Address[];

    if (editingAddressId) {
      nextAddresses = addresses.map(
        (address) =>
          address.id === editingAddressId
            ? nextAddress
            : address
      );
    } else {
      nextAddresses = [
        ...addresses,
        nextAddress,
      ];
    }

    setAddresses(nextAddresses);

    localStorage.setItem(
      ADDRESS_KEY,
      JSON.stringify(nextAddresses)
    );

    setSelectedAddressId(nextAddress.id);
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressError("");
  }

  function deleteAddress(id: string) {
    const nextAddresses = addresses.filter(
      (address) => address.id !== id
    );

    setAddresses(nextAddresses);

    localStorage.setItem(
      ADDRESS_KEY,
      JSON.stringify(nextAddresses)
    );

    if (selectedAddressId === id) {
      setSelectedAddressId(
        nextAddresses[0]?.id || ""
      );
    }
  }

  /* =======================================================
     PAYMENT VALIDATION
  ======================================================= */

  function validatePayment() {
    if (paymentMethod === "upi") {
      if (
        !/^[\w.-]+@[\w.-]+$/.test(
          upiId.trim()
        )
      ) {
        return "Please enter a valid UPI ID.";
      }
    }

    if (paymentMethod === "card") {
      const cleanCard = cardNumber.replace(
        /\s/g,
        ""
      );

      if (!/^\d{16}$/.test(cleanCard)) {
        return "Please enter a valid 16-digit card number.";
      }

      if (!cardName.trim()) {
        return "Please enter the cardholder name.";
      }

      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        return "Enter card expiry as MM/YY.";
      }

      if (!/^\d{3,4}$/.test(cardCvv)) {
        return "Please enter a valid CVV.";
      }
    }

    if (paymentMethod === "netbanking") {
      if (!bank) {
        return "Please select your bank.";
      }
    }

    if (paymentMethod === "wallet") {
      if (!wallet) {
        return "Please select a wallet.";
      }
    }

    return "";
  }

  /* =======================================================
     PLACE ORDER
  ======================================================= */

  async function placeOrder() {
    setErrorMessage("");

    if (cart.length === 0) {
      setErrorMessage(
        "Your cart is empty."
      );
      return;
    }

    if (!selectedAddress) {
      setErrorMessage(
        "Please select or add a delivery address."
      );
      return;
    }

    const paymentError =
      validatePayment();

    if (paymentError) {
      setErrorMessage(paymentError);

      document
        .getElementById("payment-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

      return;
    }

    setIsPlacingOrder(true);

    /*
     * Generate the order first.
     */
    const orderId =
      `PC-${Date.now().toString().slice(-8)}`;

    const order: OrderRecord = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: "Order Placed",
      paymentMethod:
        getPaymentLabel(paymentMethod),
      total,
      subtotal,
      delivery,
      discount:
        productSavings + couponDiscount,
      address: selectedAddress,
      items: cart,
    };

    try {
      const previousOrders =
        safeParse<OrderRecord[]>(
          localStorage.getItem(ORDER_KEY),
          []
        );

      const updatedOrders = [
        order,
        ...previousOrders,
      ];

      /*
       * Save order.
       */
      localStorage.setItem(
        ORDER_KEY,
        JSON.stringify(updatedOrders)
      );

      localStorage.setItem(
        LAST_ORDER_KEY,
        JSON.stringify(order)
      );

      /*
       * Clear cart after successful order creation.
       */
      localStorage.removeItem(CART_KEY);

      /*
       * IMPORTANT:
       * This is called directly from the Place Order
       * click flow, so browser audio permission is available.
       */
      playOrderSuccessSound();

      /*
       * Small delay so the success chime can start
       * before navigation.
       */
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 750);
      });

      router.push(
        `/dashboard/order-success?order=${encodeURIComponent(
          orderId
        )}`
      );
    } catch (error) {
      console.error(
        "Place order error:",
        error
      );

      setErrorMessage(
        "Something went wrong while placing your order. Please try again."
      );

      setIsPlacingOrder(false);
    }
  }

  /* =======================================================
     EMPTY CART
  ======================================================= */

  if (!pageLoading && cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#fbf8f2]">
        <header className="border-b border-[#eadfcb] bg-white">
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

              <div>
                <p className="text-lg font-black text-[#40372d]">
                  PrimeCart
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#a08c6d]">
                  Checkout
                </p>
              </div>
            </Link>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-[30px] border border-[#eadfcb] bg-white p-8 text-center shadow-[0_25px_80px_rgba(75,59,35,0.08)] sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f6eddd] text-[#a47b40]">
              <ShoppingBag size={34} />
            </div>

            <h1 className="mt-6 text-2xl font-black text-[#40372d]">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#8e8271]">
              Add some products to your cart before
              continuing to checkout.
            </p>

            <Link
              href="/dashboard/products"
              className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#b9975b] px-7 text-sm font-black text-white transition hover:bg-[#a9844d]"
            >
              Start Shopping
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-[#fbf8f2] p-6">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-16 rounded-2xl bg-white" />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="h-[700px] rounded-3xl bg-white" />
            <div className="h-[500px] rounded-3xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbf8f2] text-[#40372d]">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#eadfcb] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/cart"
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
              <p className="text-lg font-black tracking-tight text-[#40372d]">
                PrimeCart
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#a08c6d]">
                Secure Checkout
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#e6dccb] bg-[#fffdf9] px-3 py-2 text-[10px] font-bold text-[#796d5d] sm:flex">
              <LockKeyhole
                size={14}
                className="text-[#b9975b]"
              />
              Secure Checkout
            </div>

            <Link
              href="/dashboard/cart"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e3d8c7] bg-white px-3 text-xs font-bold text-[#625849] transition hover:bg-[#faf6ef]"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">
                Back to Cart
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 pb-32 sm:px-6 lg:px-8 lg:py-10">
        {/* =================================================
            CHECKOUT STEPS
        ================================================= */}

        <section className="mb-7 rounded-[24px] border border-[#eadfcb] bg-white p-4 shadow-[0_10px_35px_rgba(75,59,35,0.04)] sm:p-5">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            {[
              {
                label: "Cart",
                icon: ShoppingBag,
                active: true,
              },
              {
                label: "Address",
                icon: MapPin,
                active: true,
              },
              {
                label: "Payment",
                icon: CreditCard,
                active: true,
              },
              {
                label: "Confirmation",
                icon: CheckCircle2,
                active: false,
              },
            ].map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.label}
                  className="relative flex flex-1 items-center"
                >
                  <div className="flex min-w-0 flex-col items-center text-center">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                        step.active
                          ? "border-[#b9975b] bg-[#b9975b] text-white"
                          : "border-[#e2d8c7] bg-white text-[#a89b89]"
                      }`}
                    >
                      {step.active ? (
                        <Check size={15} />
                      ) : (
                        <Icon size={15} />
                      )}
                    </div>

                    <span
                      className={`mt-2 hidden text-[10px] font-black sm:block ${
                        step.active
                          ? "text-[#5d5040]"
                          : "text-[#9a8f7f]"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {index < 3 && (
                    <div
                      className={`mx-2 h-px flex-1 ${
                        index < 2
                          ? "bg-[#cdb88f]"
                          : "bg-[#e9dfcf]"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#ebc9c3] bg-[#fff7f5] p-4 text-sm font-semibold text-[#9c5c54]">
            <X size={18} className="mt-0.5 shrink-0" />

            <div className="flex-1">
              {errorMessage}
            </div>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="text-[#a76a62]"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =================================================
            FREE DELIVERY BAR
        ================================================= */}

        <section className="mb-6 overflow-hidden rounded-[22px] border border-[#eadfcb] bg-gradient-to-r from-[#fffdf9] to-[#f8f0e1] p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#ad8448] shadow-sm">
              <Truck size={19} />
            </div>

            <div className="min-w-0 flex-1">
              {delivery === 0 ? (
                <>
                  <p className="text-xs font-black text-[#557d5a]">
                    🎉 You unlocked FREE delivery!
                  </p>

                  <p className="mt-1 text-[10px] font-semibold text-[#8b806f]">
                    Your order qualifies for free delivery.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-black text-[#5b5041]">
                    Add {formatPrice(remainingForFreeDelivery)} more
                    for FREE delivery
                  </p>

                  <p className="mt-1 text-[10px] font-semibold text-[#8b806f]">
                    Free delivery on orders above{" "}
                    {formatPrice(FREE_DELIVERY_LIMIT)}.
                  </p>
                </>
              )}

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e8dfd1]">
                <div
                  className="h-full rounded-full bg-[#b9975b] transition-all duration-500"
                  style={{
                    width: `${freeDeliveryProgress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="space-y-6">
            {/* ADDRESS */}
            <section className="rounded-[28px] border border-[#eadfcb] bg-white p-5 shadow-[0_12px_40px_rgba(75,59,35,0.05)] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b08c53]">
                    Step 1
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#40372d]">
                    Delivery Address
                  </h2>

                  <p className="mt-1 text-xs text-[#958a7b]">
                    Where should we deliver your order?
                  </p>
                </div>

                <div className="rounded-xl bg-[#f8efdf] p-2.5 text-[#a67c42]">
                  <MapPin size={19} />
                </div>
              </div>

              {addresses.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-[#ddcfba] bg-[#fcfaf6] p-7 text-center">
                  <MapPin
                    size={26}
                    className="mx-auto text-[#bda987]"
                  />

                  <p className="mt-3 text-sm font-black text-[#5c5041]">
                    No saved address
                  </p>

                  <p className="mt-1 text-xs text-[#988c7c]">
                    Add your delivery address to continue.
                  </p>

                  <button
                    type="button"
                    onClick={openAddAddress}
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#b9975b] px-4 text-xs font-black text-white"
                  >
                    <PlusCircle size={15} />
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="mt-6 grid gap-3">
                  {addresses.map((address) => {
                    const selected =
                      address.id === selectedAddressId;

                    return (
                      <div
                        key={address.id}
                        className={`relative rounded-2xl border p-4 transition ${
                          selected
                            ? "border-[#b9975b] bg-[#fffaf1] shadow-[0_8px_25px_rgba(185,151,91,0.10)]"
                            : "border-[#e9dfd0] bg-white hover:border-[#d7c6a9]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedAddressId(
                              address.id
                            )
                          }
                          className="absolute inset-0 z-0"
                          aria-label={`Select address for ${address.fullName}`}
                        />

                        <div className="relative z-10 flex gap-3">
                          <div
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              selected
                                ? "border-[#b9975b]"
                                : "border-[#d8cdbb]"
                            }`}
                          >
                            {selected && (
                              <div className="h-2.5 w-2.5 rounded-full bg-[#b9975b]" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-black text-[#51483c]">
                                {address.fullName}
                              </p>

                              <span className="rounded-md bg-[#f4ead7] px-2 py-0.5 text-[9px] font-black text-[#9c773f]">
                                HOME
                              </span>

                              <span className="text-xs font-semibold text-[#8f8372]">
                                {address.phone}
                              </span>
                            </div>

                            <p className="mt-2 text-xs leading-5 text-[#766b5d]">
                              {address.addressLine1}
                              {address.addressLine2
                                ? `, ${address.addressLine2}`
                                : ""}
                              <br />
                              {address.city},{" "}
                              {address.state} -{" "}
                              {address.pincode}
                            </p>

                            {address.landmark && (
                              <p className="mt-1 text-[10px] font-semibold text-[#9a8d7c]">
                                Landmark:{" "}
                                {address.landmark}
                              </p>
                            )}
                          </div>

                          <div className="relative z-20 flex shrink-0 gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openEditAddress(address)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8c7d6a] transition hover:bg-[#f4ecdf] hover:text-[#a27b42]"
                              title="Edit address"
                            >
                              <Pencil size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteAddress(address.id)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a28b86] transition hover:bg-[#fff2f0] hover:text-[#a45e55]"
                              title="Delete address"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={openAddAddress}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-[#d9c9ae] bg-[#fffdf9] text-xs font-black text-[#a17b42] transition hover:bg-[#faf4e8]"
                  >
                    <PlusCircle size={15} />
                    Add New Address
                  </button>
                </div>
              )}
            </section>

            {/* PAYMENT */}
            <section
              id="payment-section"
              className="rounded-[28px] border border-[#eadfcb] bg-white p-5 shadow-[0_12px_40px_rgba(75,59,35,0.05)] sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b08c53]">
                    Step 2
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#40372d]">
                    Payment Method
                  </h2>

                  <p className="mt-1 text-xs text-[#958a7b]">
                    Choose how you&apos;d like to pay.
                  </p>
                </div>

                <div className="rounded-xl bg-[#f8efdf] p-2.5 text-[#a67c42]">
                  <CreditCard size={19} />
                </div>
              </div>

              <div className="mt-6 space-y-2.5">
                {/* UPI */}
                <PaymentOption
                  method="upi"
                  title="UPI"
                  subtitle="Google Pay, PhonePe, Paytm & more"
                  icon={QrCode}
                  selected={paymentMethod === "upi"}
                  expanded={
                    expandedPayment === "upi"
                  }
                  onSelect={() => {
                    setPaymentMethod("upi");
                    setExpandedPayment("upi");
                  }}
                >
                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-bold text-[#675b4c]">
                      UPI ID
                    </label>

                    <input
                      value={upiId}
                      onChange={(e) =>
                        setUpiId(e.target.value)
                      }
                      placeholder="example@upi"
                      className="h-11 w-full rounded-xl border border-[#e3d9c9] bg-white px-3 text-sm outline-none transition placeholder:text-[#b1a697] focus:border-[#b9975b] focus:ring-4 focus:ring-[#b9975b]/10"
                    />
                  </div>
                </PaymentOption>

                {/* CARD */}
                <PaymentOption
                  method="card"
                  title="Credit / Debit Card"
                  subtitle="Visa, Mastercard, RuPay"
                  icon={CreditCard}
                  selected={paymentMethod === "card"}
                  expanded={
                    expandedPayment === "card"
                  }
                  onSelect={() => {
                    setPaymentMethod("card");
                    setExpandedPayment("card");
                  }}
                >
                  <div className="mt-4 space-y-3">
                    <input
                      value={cardNumber}
                      onChange={(e) => {
                        const value =
                          e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 16);

                        const formatted =
                          value.match(/.{1,4}/g)?.join(" ") ||
                          "";

                        setCardNumber(formatted);
                      }}
                      placeholder="Card number"
                      inputMode="numeric"
                      className="h-11 w-full rounded-xl border border-[#e3d9c9] bg-white px-3 text-sm outline-none focus:border-[#b9975b] focus:ring-4 focus:ring-[#b9975b]/10"
                    />

                    <input
                      value={cardName}
                      onChange={(e) =>
                        setCardName(e.target.value)
                      }
                      placeholder="Cardholder name"
                      className="h-11 w-full rounded-xl border border-[#e3d9c9] bg-white px-3 text-sm outline-none focus:border-[#b9975b] focus:ring-4 focus:ring-[#b9975b]/10"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={cardExpiry}
                        onChange={(e) => {
                          let value =
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);

                          if (value.length > 2) {
                            value =
                              value.slice(0, 2) +
                              "/" +
                              value.slice(2);
                          }

                          setCardExpiry(value);
                        }}
                        placeholder="MM/YY"
                        inputMode="numeric"
                        className="h-11 rounded-xl border border-[#e3d9c9] bg-white px-3 text-sm outline-none focus:border-[#b9975b] focus:ring-4 focus:ring-[#b9975b]/10"
                      />

                      <input
                        value={cardCvv}
                        onChange={(e) =>
                          setCardCvv(
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4)
                          )
                        }
                        placeholder="CVV"
                        type="password"
                        inputMode="numeric"
                        className="h-11 rounded-xl border border-[#e3d9c9] bg-white px-3 text-sm outline-none focus:border-[#b9975b] focus:ring-4 focus:ring-[#b9975b]/10"
                      />
                    </div>
                  </div>
                </PaymentOption>

                {/* NETBANKING */}
                <PaymentOption
                  method="netbanking"
                  title="Net Banking"
                  subtitle="Pay directly from your bank"
                  icon={Landmark}
                  selected={
                    paymentMethod === "netbanking"
                  }
                  expanded={
                    expandedPayment === "netbanking"
                  }
                  onSelect={() => {
                    setPaymentMethod("netbanking");
                    setExpandedPayment("netbanking");
                  }}
                >
                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-bold text-[#675b4c]">
                      Select Bank
                    </label>

                    <div className="relative">
                      <select
                        value={bank}
                        onChange={(e) =>
                          setBank(e.target.value)
                        }
                        className="h-11 w-full appearance-none rounded-xl border border-[#e3d9c9] bg-white px-3 pr-10 text-sm outline-none focus:border-[#b9975b]"
                      >
                        <option value="">
                          Choose your bank
                        </option>
                        <option value="SBI">
                          State Bank of India
                        </option>
                        <option value="HDFC">
                          HDFC Bank
                        </option>
                        <option value="ICICI">
                          ICICI Bank
                        </option>
                        <option value="Axis">
                          Axis Bank
                        </option>
                        <option value="Kotak">
                          Kotak Mahindra Bank
                        </option>
                      </select>

                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#988b78]"
                      />
                    </div>
                  </div>
                </PaymentOption>

                {/* WALLET */}
                <PaymentOption
                  method="wallet"
                  title="Wallet"
                  subtitle="Use your preferred wallet"
                  icon={Wallet}
                  selected={
                    paymentMethod === "wallet"
                  }
                  expanded={
                    expandedPayment === "wallet"
                  }
                  onSelect={() => {
                    setPaymentMethod("wallet");
                    setExpandedPayment("wallet");
                  }}
                >
                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-bold text-[#675b4c]">
                      Select Wallet
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        "Paytm",
                        "PhonePe",
                        "Amazon Pay",
                      ].map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() =>
                            setWallet(name)
                          }
                          className={`rounded-xl border px-3 py-3 text-xs font-black transition ${
                            wallet === name
                              ? "border-[#b9975b] bg-[#fff9ef] text-[#a17a42]"
                              : "border-[#e6dccd] bg-white text-[#746858] hover:bg-[#faf6ef]"
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                </PaymentOption>

                {/* EMI */}
                <PaymentOption
                  method="emi"
                  title="EMI"
                  subtitle="Flexible payment options"
                  icon={ReceiptIndianRupee}
                  selected={
                    paymentMethod === "emi"
                  }
                  expanded={
                    expandedPayment === "emi"
                  }
                  onSelect={() => {
                    setPaymentMethod("emi");
                    setExpandedPayment("emi");
                  }}
                >
                  <div className="mt-4 rounded-xl border border-[#eadfcb] bg-[#fcfaf6] p-3 text-xs leading-5 text-[#7f7364]">
                    EMI availability depends on your
                    selected payment provider and
                    eligibility.
                  </div>
                </PaymentOption>

                {/* COD */}
                <PaymentOption
                  method="cod"
                  title="Cash on Delivery"
                  subtitle="Pay when your order arrives"
                  icon={Banknote}
                  selected={
                    paymentMethod === "cod"
                  }
                  expanded={
                    expandedPayment === "cod"
                  }
                  onSelect={() => {
                    setPaymentMethod("cod");
                    setExpandedPayment("cod");
                  }}
                >
                  <div className="mt-4 rounded-xl border border-[#eadfcb] bg-[#fcfaf6] p-3 text-xs leading-5 text-[#7f7364]">
                    You can pay the delivery partner
                    when your order arrives.
                  </div>
                </PaymentOption>
              </div>
            </section>

            {/* ORDER ITEMS */}
            <section className="rounded-[28px] border border-[#eadfcb] bg-white p-5 shadow-[0_12px_40px_rgba(75,59,35,0.05)] sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b08c53]">
                    Your cart
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#40372d]">
                    Order Items
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
                {cart.map((item) => (
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

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-[#a17a43]">
                          {formatPrice(item.price)}
                        </span>

                        {item.original_price &&
                          item.original_price >
                            item.price && (
                            <span className="text-[10px] font-semibold text-[#a49a8b] line-through">
                              {formatPrice(
                                item.original_price
                              )}
                            </span>
                          )}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex h-8 items-center overflow-hidden rounded-lg border border-[#dfd4c4]">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item.id
                              )
                            }
                            disabled={
                              item.quantity <= 1
                            }
                            className="flex h-full w-8 items-center justify-center text-[#746858] transition hover:bg-[#f8f2e9] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus size={13} />
                          </button>

                          <span className="flex h-full min-w-8 items-center justify-center border-x border-[#dfd4c4] px-2 text-xs font-black text-[#51483c]">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                item.id
                              )
                            }
                            className="flex h-full w-8 items-center justify-center text-[#746858] transition hover:bg-[#f8f2e9]"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.id)
                          }
                          className="text-[10px] font-bold text-[#a17f76] transition hover:text-[#a75d53]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-black text-[#51483c]">
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

            {/* SECURITY */}
            <section className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure Checkout",
                  text: "Protected checkout experience",
                },
                {
                  icon: BadgeCheck,
                  title: "Order Protection",
                  text: "Clear order tracking",
                },
                {
                  icon: Truck,
                  title: "Easy Delivery",
                  text: "Track your order journey",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[#eadfcb] bg-white p-4"
                  >
                    <Icon
                      size={19}
                      className="text-[#ad8448]"
                    />

                    <p className="mt-2 text-xs font-black text-[#5a4e40]">
                      {item.title}
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-[#948878]">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </section>
          </div>

          {/* =================================================
              RIGHT SUMMARY
          ================================================= */}

          <aside className="hidden lg:block">
            <div className="sticky top-[92px]">
              <OrderSummary
                subtotal={subtotal}
                totalMrp={totalMrp}
                productSavings={productSavings}
                couponDiscount={couponDiscount}
                delivery={delivery}
                total={total}
                coupon={coupon}
                appliedCoupon={appliedCoupon}
                couponError={couponError}
                onCouponChange={setCoupon}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={removeCoupon}
                isPlacingOrder={isPlacingOrder}
                onPlaceOrder={placeOrder}
                totalItems={totalItems}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* =====================================================
          MOBILE BOTTOM BAR
      ===================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e4d8c6] bg-white/95 p-3 shadow-[0_-10px_35px_rgba(75,59,35,0.10)] backdrop-blur-xl lg:hidden">
        {showMobileSummary && (
          <div className="mb-3 max-h-[65vh] overflow-y-auto rounded-2xl border border-[#eadfcb] bg-[#fffdf9] p-4">
            <OrderSummary
              subtotal={subtotal}
              totalMrp={totalMrp}
              productSavings={productSavings}
              couponDiscount={couponDiscount}
              delivery={delivery}
              total={total}
              coupon={coupon}
              appliedCoupon={appliedCoupon}
              couponError={couponError}
              onCouponChange={setCoupon}
              onApplyCoupon={applyCoupon}
              onRemoveCoupon={removeCoupon}
              isPlacingOrder={isPlacingOrder}
              onPlaceOrder={placeOrder}
              totalItems={totalItems}
              compact
            />
          </div>
        )}

        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setShowMobileSummary(
                (value) => !value
              )
            }
            className="flex h-12 min-w-0 flex-1 items-center justify-between rounded-xl border border-[#e3d7c5] bg-white px-4"
          >
            <div className="text-left">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#978a79]">
                Total
              </p>

              <p className="text-base font-black text-[#40372d]">
                {formatPrice(total)}
              </p>
            </div>

            {showMobileSummary ? (
              <ChevronDown
                size={17}
                className="text-[#9d896c]"
              />
            ) : (
              <ChevronUp
                size={17}
                className="text-[#9d896c]"
              />
            )}
          </button>

          <button
            type="button"
            onClick={placeOrder}
            disabled={isPlacingOrder}
            className="flex h-12 min-w-[145px] items-center justify-center gap-2 rounded-xl bg-[#b9975b] px-5 text-sm font-black text-white shadow-[0_8px_25px_rgba(185,151,91,0.25)] transition hover:bg-[#a9844d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPlacingOrder ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Placing...
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

      {/* =====================================================
          ADDRESS MODAL
      ===================================================== */}

      {showAddressForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#30271d]/40 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[#eadfcb] bg-white shadow-[0_30px_100px_rgba(45,34,20,0.22)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eee5d8] bg-white px-5 py-4 sm:px-7">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b08c53]">
                  Delivery
                </p>

                <h2 className="mt-1 text-xl font-black text-[#40372d]">
                  {editingAddressId
                    ? "Edit Address"
                    : "Add New Address"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddressForm(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#faf6ef] text-[#766958]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-5 sm:p-7">
              {addressError && (
                <div className="mb-4 rounded-xl border border-[#eccfc9] bg-[#fff7f5] p-3 text-xs font-semibold text-[#9a5e56]">
                  {addressError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full Name"
                  value={addressForm.fullName}
                  onChange={(value) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      fullName: value,
                    }))
                  }
                  placeholder="Enter full name"
                />

                <Field
                  label="Mobile Number"
                  value={addressForm.phone}
                  onChange={(value) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      phone: value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    }))
                  }
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                />

                <div className="sm:col-span-2">
                  <Field
                    label="Address"
                    value={addressForm.addressLine1}
                    onChange={(value) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        addressLine1: value,
                      }))
                    }
                    placeholder="House no., building, street"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Field
                    label="Area / Locality"
                    value={addressForm.addressLine2}
                    onChange={(value) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        addressLine2: value,
                      }))
                    }
                    placeholder="Area, locality"
                  />
                </div>

                <Field
                  label="City"
                  value={addressForm.city}
                  onChange={(value) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      city: value,
                    }))
                  }
                  placeholder="City"
                />

                <Field
                  label="State"
                  value={addressForm.state}
                  onChange={(value) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      state: value,
                    }))
                  }
                  placeholder="State"
                />

                <Field
                  label="Pincode"
                  value={addressForm.pincode}
                  onChange={(value) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      pincode: value
                        .replace(/\D/g, "")
                        .slice(0, 6),
                    }))
                  }
                  placeholder="6-digit pincode"
                  inputMode="numeric"
                />

                <Field
                  label="Landmark"
                  value={addressForm.landmark}
                  onChange={(value) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      landmark: value,
                    }))
                  }
                  placeholder="Optional"
                />
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowAddressForm(false)
                  }
                  className="h-11 rounded-xl border border-[#dfd3c1] bg-white px-5 text-xs font-black text-[#665a4b]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveAddress}
                  className="h-11 rounded-xl bg-[#b9975b] px-6 text-xs font-black text-white transition hover:bg-[#a9844d]"
                >
                  Save Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

        button,
        input,
        select {
          font: inherit;
        }

        ::selection {
          background: #e4d1aa;
          color: #40372d;
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputMode?: "numeric" | "text";
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-[#665a4b]">
        {label}
      </span>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        inputMode={inputMode}
        className="h-11 w-full rounded-xl border border-[#e3d9c9] bg-white px-3 text-sm text-[#51483c] outline-none transition placeholder:text-[#b0a496] focus:border-[#b9975b] focus:ring-4 focus:ring-[#b9975b]/10"
      />
    </label>
  );
}

/* =========================================================
   PAYMENT OPTION
========================================================= */

function PaymentOption({
  method,
  title,
  subtitle,
  icon: Icon,
  selected,
  expanded,
  onSelect,
  children,
}: {
  method: PaymentMethod;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition ${
        selected
          ? "border-[#b9975b] bg-[#fffaf1]"
          : "border-[#e9dfd0] bg-white"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            selected
              ? "bg-[#f2e5cf] text-[#a17a43]"
              : "bg-[#f8f4ec] text-[#8e806d]"
          }`}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-[#51483c]">
            {title}
          </p>

          <p className="mt-0.5 text-[10px] font-semibold text-[#9a8d7b]">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected
              ? "border-[#b9975b]"
              : "border-[#d7ccba]"
          }`}
        >
          {selected && (
            <div className="h-2.5 w-2.5 rounded-full bg-[#b9975b]" />
          )}
        </div>

        {expanded ? (
          <ChevronUp
            size={16}
            className="text-[#a18d70]"
          />
        ) : (
          <ChevronDown
            size={16}
            className="text-[#a18d70]"
          />
        )}
      </button>

      {expanded && (
        <div className="border-t border-[#eee5d8] px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ORDER SUMMARY
========================================================= */

function OrderSummary({
  subtotal,
  totalMrp,
  productSavings,
  couponDiscount,
  delivery,
  total,
  coupon,
  appliedCoupon,
  couponError,
  onCouponChange,
  onApplyCoupon,
  onRemoveCoupon,
  isPlacingOrder,
  onPlaceOrder,
  totalItems,
  compact = false,
}: {
  subtotal: number;
  totalMrp: number;
  productSavings: number;
  couponDiscount: number;
  delivery: number;
  total: number;
  coupon: string;
  appliedCoupon: string;
  couponError: string;
  onCouponChange: (value: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  isPlacingOrder: boolean;
  onPlaceOrder: () => void;
  totalItems: number;
  compact?: boolean;
}) {
  return (
    <section
      className={`rounded-[28px] border border-[#eadfcb] bg-white shadow-[0_15px_50px_rgba(75,59,35,0.07)] ${
        compact ? "p-4" : "overflow-hidden"
      }`}
    >
      {!compact && (
        <div className="border-b border-[#eee5d8] bg-[#fcfaf6] px-6 py-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b08c53]">
            Final step
          </p>

          <h2 className="mt-1 text-xl font-black text-[#40372d]">
            Price Details
          </h2>
        </div>
      )}

      <div
        className={
          compact
            ? "space-y-4"
            : "space-y-5 p-6"
        }
      >
        {/* Coupon */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Gift
              size={15}
              className="text-[#ad8448]"
            />

            <p className="text-xs font-black text-[#5b5041]">
              Apply Coupon
            </p>
          </div>

          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-xl border border-[#d9e6d6] bg-[#f5fbf3] px-3 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={16}
                  className="text-[#5d8a5d]"
                />

                <div>
                  <p className="text-xs font-black text-[#547354]">
                    {appliedCoupon}
                  </p>

                  <p className="text-[9px] font-semibold text-[#789074]">
                    Coupon applied successfully
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onRemoveCoupon}
                className="text-[10px] font-black text-[#9c6e64]"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) =>
                    onCouponChange(
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="Enter coupon"
                  className="h-11 min-w-0 flex-1 rounded-xl border border-[#e3d9c9] bg-white px-3 text-xs font-bold uppercase outline-none focus:border-[#b9975b] focus:ring-4 focus:ring-[#b9975b]/10"
                />

                <button
                  type="button"
                  onClick={onApplyCoupon}
                  className="h-11 rounded-xl border border-[#cdb88f] bg-[#fffaf0] px-4 text-xs font-black text-[#9c753d] transition hover:bg-[#f8efdf]"
                >
                  Apply
                </button>
              </div>

              <p className="mt-2 text-[9px] font-semibold text-[#a09585]">
                Try <span className="font-black">PRIME10</span>{" "}
                for 10% off up to ₹500.
              </p>

              {couponError && (
                <p className="mt-1 text-[10px] font-semibold text-[#a25f56]">
                  {couponError}
                </p>
              )}
            </>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-[#e4d9c9]" />

        {/* Rows */}
        <div className="space-y-3">
          <SummaryRow
            label={`Price (${totalItems} ${
              totalItems === 1
                ? "item"
                : "items"
            })`}
            value={formatPrice(totalMrp)}
          />

          {productSavings > 0 && (
            <SummaryRow
              label="Product Discount"
              value={`-${formatPrice(
                productSavings
              )}`}
              green
            />
          )}

          {couponDiscount > 0 && (
            <SummaryRow
              label="Coupon Discount"
              value={`-${formatPrice(
                couponDiscount
              )}`}
              green
            />
          )}

          <SummaryRow
            label="Subtotal"
            value={formatPrice(subtotal)}
          />

          <SummaryRow
            label="Delivery Charges"
            value={
              delivery === 0
                ? "FREE"
                : formatPrice(delivery)
            }
            green={delivery === 0}
          />
        </div>

        {/* Total */}
        <div className="border-t border-[#e8dece] pt-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#8f8271]">
                Total Amount
              </p>

              <p className="mt-1 text-2xl font-black tracking-tight text-[#3f372e]">
                {formatPrice(total)}
              </p>
            </div>

            {productSavings +
              couponDiscount >
              0 && (
              <div className="rounded-xl bg-[#f5eddd] px-3 py-2 text-right">
                <p className="text-[9px] font-black uppercase tracking-wider text-[#9d773e]">
                  You save
                </p>

                <p className="text-xs font-black text-[#668063]">
                  {formatPrice(
                    productSavings +
                      couponDiscount
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Place order */}
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={isPlacingOrder}
          className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#b9975b] text-sm font-black text-white shadow-[0_10px_28px_rgba(185,151,91,0.24)] transition hover:bg-[#a9844d] hover:shadow-[0_14px_32px_rgba(185,151,91,0.30)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPlacingOrder ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Placing Order...
            </>
          ) : (
            <>
              Place Order
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-[9px] font-semibold text-[#968a7a]">
          <LockKeyhole
            size={12}
            className="text-[#a98346]"
          />
          Secure checkout experience
        </div>
      </div>
    </section>
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
