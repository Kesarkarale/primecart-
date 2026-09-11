"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  Home,
  Minus,
  Moon,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  Sun,
  Truck,
  User,
  X,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* =========================================================
   DEMO PRODUCT DATA
   Later this can be replaced with Supabase products table.
========================================================= */

const product = {
  id: "1",

  name: "Samsung Galaxy Smartphone Pro Max",

  brand: "Samsung",

  category: "Electronics",

  rating: 4.8,

  reviews: 1248,

  price: 54999,

  originalPrice: 64999,

  stock: 12,

  deliveryDays: "3–5 days",

  images: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=90",

    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=90",

    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1200&q=90",

    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1200&q=90",
  ],

  shortDescription:
    "Experience powerful performance, a stunning AMOLED display and an advanced camera system with the latest Samsung Galaxy smartphone.",

  description:
    "The Samsung Galaxy Smartphone Pro Max combines premium design, powerful performance and an immersive viewing experience. Its high-quality AMOLED display delivers vibrant colours and deep contrast, while the advanced camera system helps you capture detailed photos and videos in a wide range of conditions. With powerful hardware, long-lasting battery life and fast connectivity, this smartphone is designed for productivity, entertainment, photography and everyday use.",

  highlights: [
    "Premium AMOLED display",
    "Powerful next-generation processor",
    "Advanced multi-camera system",
    "All-day battery performance",
    "Fast charging support",
    "5G connectivity",
  ],

  specifications: [
    {
      label: "Brand",
      value: "Samsung",
    },
    {
      label: "Model",
      value: "Galaxy Pro Max",
    },
    {
      label: "Display",
      value: "6.7 inch AMOLED",
    },
    {
      label: "RAM",
      value: "12 GB",
    },
    {
      label: "Storage",
      value: "256 GB",
    },
    {
      label: "Rear Camera",
      value: "50 MP + 12 MP + 10 MP",
    },
    {
      label: "Front Camera",
      value: "12 MP",
    },
    {
      label: "Battery",
      value: "5000 mAh",
    },
    {
      label: "Connectivity",
      value: "5G, Wi-Fi, Bluetooth",
    },
    {
      label: "Operating System",
      value: "Android",
    },
  ],
};

const customerReviews = [
  {
    id: 1,
    name: "Rahul M.",
    rating: 5,
    title: "Excellent phone",
    text:
      "The display and camera quality are amazing. Performance is also very smooth.",
    date: "2 weeks ago",
    verified: true,
  },

  {
    id: 2,
    name: "Priya S.",
    rating: 5,
    title: "Worth the price",
    text:
      "Good build quality and battery life. Delivery was also very fast.",
    date: "1 month ago",
    verified: true,
  },

  {
    id: 3,
    name: "Amit K.",
    rating: 4,
    title: "Great overall",
    text:
      "Very good smartphone for daily use, gaming and photography.",
    date: "1 month ago",
    verified: true,
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function ProductPage() {
  const supabase = createClient();

  const [darkMode, setDarkMode] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);

  const [quantity, setQuantity] = useState(1);

  const [wishlist, setWishlist] = useState(false);

  const [cartCount, setCartCount] = useState(0);

  const [pincode, setPincode] = useState("");

  const [deliveryMessage, setDeliveryMessage] = useState("");

  const [deliveryChecked, setDeliveryChecked] = useState(false);

  const [userName, setUserName] = useState("");

  const [mobileMenu, setMobileMenu] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [showAddedMessage, setShowAddedMessage] =
    useState(false);

  /* =========================================================
     THEME
  ========================================================= */

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("primecart-theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = !darkMode;

    setDarkMode(nextTheme);

    localStorage.setItem(
      "primecart-theme",
      nextTheme ? "dark" : "light"
    );
  };

  /* =========================================================
     USER
  ========================================================= */

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const metadata = user.user_metadata || {};

      setUserName(
        metadata.full_name ||
          metadata.name ||
          user.email?.split("@")[0] ||
          "Account"
      );
    };

    getUser();
  }, [supabase]);

  /* =========================================================
     PRICE
  ========================================================= */

  const discount = Math.round(
    ((product.originalPrice - product.price) /
      product.originalPrice) *
      100
  );

  const totalPrice = useMemo(() => {
    return product.price * quantity;
  }, [quantity]);

  /* =========================================================
     QUANTITY
  ========================================================= */

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(current + 1, product.stock)
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(current - 1, 1)
    );
  };

  /* =========================================================
     CART
  ========================================================= */

  const addToCart = () => {
    setCartCount((current) => current + quantity);

    setShowAddedMessage(true);

    setTimeout(() => {
      setShowAddedMessage(false);
    }, 2500);
  };

  /* =========================================================
     DELIVERY
  ========================================================= */

  const checkDelivery = () => {
    const validPincode = /^[1-9][0-9]{5}$/;

    if (!validPincode.test(pincode)) {
      setDeliveryChecked(false);

      setDeliveryMessage(
        "Please enter a valid 6-digit pincode."
      );

      return;
    }

    setDeliveryChecked(true);

    setDeliveryMessage(
      `Delivery available. Estimated delivery in ${product.deliveryDays}.`
    );
  };

  /* =========================================================
     BUY NOW
  ========================================================= */

  const buyNow = () => {
    setCartCount((current) => current + quantity);

    window.location.href = "/cart";
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const value = searchText.trim();

    if (!value) return;

    window.location.href = `/products?search=${encodeURIComponent(
      value
    )}`;
  };

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-[#0c0c0b] text-white"
          : "bg-[#f6f5f2] text-[#222]"
      }`}
    >
      {/* =====================================================
          TOP OFFER BAR
      ====================================================== */}

      <div className="bg-[#b88728] px-4 py-2 text-center text-[11px] font-medium text-white sm:text-xs">
        Free shipping on orders above ₹999
        <span className="mx-2 opacity-50">•</span>
        Easy returns within 7 days
        <span className="mx-2 hidden opacity-50 sm:inline">
          •
        </span>
        <span className="hidden sm:inline">
          Secure payments
        </span>
      </div>

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
          darkMode
            ? "border-[#292722] bg-[#11110f]/95"
            : "border-[#e7e2d9] bg-white/95"
        }`}
      >
        <div className="mx-auto flex h-[68px] max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Mobile menu */}

          <button
            type="button"
            onClick={() => setMobileMenu(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl lg:hidden"
            aria-label="Open menu"
          >
            <span className="text-lg">☰</span>
          </button>

          {/* Logo */}

          <Link
            href="/dashboard"
            className="shrink-0"
          >
            <img
              src="/logo.png"
              alt="PrimeCart"
              className="h-9 w-auto sm:h-10"
            />
          </Link>

          {/* Search */}

          <form
            onSubmit={handleSearch}
            className="mx-auto hidden max-w-2xl flex-1 md:block"
          >
            <div className="relative">
              <Search
                size={17}
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                  darkMode
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              />

              <input
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
                placeholder="Search for products, brands and more..."
                className={`h-11 w-full rounded-xl border pl-11 pr-12 text-xs outline-none transition ${
                  darkMode
                    ? "border-[#39362f] bg-[#1a1917] text-white placeholder:text-gray-600 focus:border-[#c49635]"
                    : "border-[#ded9d0] bg-[#f8f7f4] text-[#222] placeholder:text-gray-400 focus:border-[#c49635]"
                }`}
              />

              <button
                type="submit"
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-[#c49635] text-white"
              >
                <Search size={14} />
              </button>
            </div>
          </form>

          {/* Navbar actions */}

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* Theme */}

            <button
              type="button"
              onClick={toggleTheme}
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                darkMode
                  ? "text-[#d7ac54] hover:bg-[#1c1b18]"
                  : "text-[#92701f] hover:bg-[#faf8f3]"
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>

            {/* Wishlist */}

            <Link
              href="/wishlist"
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${
                darkMode
                  ? "hover:bg-[#1c1b18]"
                  : "hover:bg-[#faf8f3]"
              }`}
            >
              <Heart
                size={19}
                fill={
                  wishlist
                    ? "currentColor"
                    : "none"
                }
                className={
                  wishlist
                    ? "text-[#c49635]"
                    : ""
                }
              />
            </Link>

            {/* Cart */}

            <Link
              href="/cart"
              className={`relative flex h-10 items-center gap-2 rounded-xl px-2 sm:px-3 ${
                darkMode
                  ? "hover:bg-[#1c1b18]"
                  : "hover:bg-[#faf8f3]"
              }`}
            >
              <ShoppingCart size={20} />

              <span className="hidden text-xs font-semibold sm:block">
                Cart
              </span>

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c49635] px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account */}

            <Link
              href="/profile"
              className={`hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold lg:flex ${
                darkMode
                  ? "hover:bg-[#1c1b18]"
                  : "hover:bg-[#faf8f3]"
              }`}
            >
              <User size={16} />

              <span className="max-w-[100px] truncate">
                {userName || "Account"}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Search */}

        <div className="border-t px-4 py-3 md:hidden">
          <form
            onSubmit={handleSearch}
            className="relative"
          >
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              placeholder="Search products..."
              className={`h-11 w-full rounded-xl border pl-11 pr-4 text-xs outline-none ${
                darkMode
                  ? "border-[#39362f] bg-[#1a1917]"
                  : "border-[#ded9d0] bg-[#f8f7f4]"
              }`}
            />
          </form>
        </div>
      </header>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      {mobileMenu && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-[70] h-full w-[285px] transform transition-transform duration-300 lg:hidden ${
          mobileMenu
            ? "translate-x-0"
            : "-translate-x-full"
        } ${
          darkMode
            ? "bg-[#151411]"
            : "bg-white"
        }`}
      >
        <div className="flex h-[70px] items-center justify-between border-b px-5">
          <img
            src="/logo.png"
            alt="PrimeCart"
            className="h-9 w-auto"
          />

          <button
            type="button"
            onClick={() => setMobileMenu(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-xs text-gray-500">
            Welcome back
          </p>

          <p className="mt-1 text-base font-bold">
            {userName || "PrimeCart Customer"}
          </p>

          <div className="mt-6 space-y-1">
            <MobileLink
              href="/dashboard"
              label="Shop Home"
              onClick={() => setMobileMenu(false)}
            />

            <MobileLink
              href="/products"
              label="All Products"
              onClick={() => setMobileMenu(false)}
            />

            <MobileLink
              href="/wishlist"
              label="Wishlist"
              onClick={() => setMobileMenu(false)}
            />

            <MobileLink
              href="/cart"
              label="Shopping Cart"
              onClick={() => setMobileMenu(false)}
            />

            <MobileLink
              href="/orders"
              label="My Orders"
              onClick={() => setMobileMenu(false)}
            />

            <MobileLink
              href="/profile"
              label="My Profile"
              onClick={() => setMobileMenu(false)}
            />
          </div>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}

      <div className="mx-auto max-w-[1500px] px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        {/* ===================================================
            BREADCRUMB
        ==================================================== */}

        <div
          className={`mb-5 flex items-center gap-1 overflow-x-auto whitespace-nowrap text-[11px] ${
            darkMode
              ? "text-gray-500"
              : "text-gray-500"
          }`}
        >
          <Link
            href="/dashboard"
            className="flex items-center"
          >
            <Home size={13} />
          </Link>

          <ChevronRight size={13} />

          <Link href="/products">
            Products
          </Link>

          <ChevronRight size={13} />

          <Link href="/products">
            {product.category}
          </Link>

          <ChevronRight size={13} />

          <span className="max-w-[220px] truncate text-[#b27f1d]">
            {product.name}
          </span>
        </div>

        {/* ===================================================
            BACK BUTTON
        ==================================================== */}

        <Link
          href="/dashboard"
          className={`mb-5 inline-flex items-center gap-2 text-xs font-semibold ${
            darkMode
              ? "text-gray-400 hover:text-white"
              : "text-gray-600 hover:text-[#b27f1d]"
          }`}
        >
          <ArrowLeft size={15} />
          Continue Shopping
        </Link>

        {/* ===================================================
            PRODUCT CARD
        ==================================================== */}

        <section
          className={`overflow-hidden rounded-3xl border ${
            darkMode
              ? "border-[#302d27] bg-[#151411]"
              : "border-[#e5dfd6] bg-white"
          }`}
        >
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            {/* ===============================================
                IMAGE SECTION
            ================================================ */}

            <div className="p-4 sm:p-7 lg:p-9">
              <div className="grid gap-4 sm:grid-cols-[78px_minmax(0,1fr)]">
                {/* Thumbnails */}

                <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:flex-col">
                  {product.images.map(
                    (image, index) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() =>
                          setSelectedImage(index)
                        }
                        className={`h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-[72px] sm:w-[72px] ${
                          selectedImage === index
                            ? "border-[#c49635]"
                            : darkMode
                            ? "border-[#36332d] hover:border-[#62512f]"
                            : "border-[#e6e0d7] hover:border-[#d2b66e]"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${
                            index + 1
                          }`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    )
                  )}
                </div>

                {/* Main Image */}

                <div
                  className={`relative order-1 aspect-square overflow-hidden rounded-2xl sm:order-2 ${
                    darkMode
                      ? "bg-[#211f1b]"
                      : "bg-[#f8f6f1]"
                  }`}
                >
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-300"
                  />

                  {/* Discount */}

                  <div className="absolute left-4 top-4 rounded-lg bg-[#c49635] px-3 py-1.5 text-[10px] font-bold text-white shadow">
                    {discount}% OFF
                  </div>

                  {/* Wishlist */}

                  <button
                    type="button"
                    onClick={() =>
                      setWishlist(!wishlist)
                    }
                    className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full shadow-lg backdrop-blur ${
                      darkMode
                        ? "bg-black/50 text-white"
                        : "bg-white/90 text-gray-700"
                    }`}
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      size={20}
                      fill={
                        wishlist
                          ? "currentColor"
                          : "none"
                      }
                      className={
                        wishlist
                          ? "text-[#c49635]"
                          : ""
                      }
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* ===============================================
                PRODUCT DETAILS
            ================================================ */}

            <div
              className={`border-t p-5 sm:p-8 lg:border-l lg:border-t-0 lg:p-10 ${
                darkMode
                  ? "border-[#302d27]"
                  : "border-[#e7e1d8]"
              }`}
            >
              {/* Brand + stock */}

              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#fbf0d8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#9a701f]">
                  {product.brand}
                </span>

                <span className="flex items-center gap-1 text-[11px] font-bold text-green-600">
                  <Check size={14} />
                  In Stock
                </span>
              </div>

              {/* Product name */}

              <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl lg:text-[38px]">
                {product.name}
              </h1>

              {/* Short description */}

              <p
                className={`mt-4 text-sm leading-6 ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              >
                {product.shortDescription}
              </p>

              {/* Rating */}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-bold text-white">
                  {product.rating}
                  <Star
                    size={11}
                    fill="currentColor"
                  />
                </div>

                <span
                  className={`text-xs ${
                    darkMode
                      ? "text-gray-500"
                      : "text-gray-500"
                  }`}
                >
                  {product.reviews.toLocaleString(
                    "en-IN"
                  )}{" "}
                  Ratings & Reviews
                </span>
              </div>

              {/* Divider */}

              <div
                className={`my-6 border-t ${
                  darkMode
                    ? "border-[#302d27]"
                    : "border-[#ebe5dc]"
                }`}
              />

              {/* Price */}

              <div>
                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-3xl font-bold sm:text-4xl">
                    ₹
                    {product.price.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  <span
                    className={`mb-1 text-sm line-through ${
                      darkMode
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}
                  >
                    ₹
                    {product.originalPrice.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  <span className="mb-1 text-sm font-bold text-green-600">
                    {discount}% off
                  </span>
                </div>

                <p className="mt-1 text-[11px] text-gray-500">
                  Inclusive of all taxes
                </p>
              </div>

              {/* =================================================
                  OFFERS
              ================================================== */}

              <div
                className={`mt-6 rounded-2xl border p-4 ${
                  darkMode
                    ? "border-[#453b2c] bg-[#211e18]"
                    : "border-[#ead9b5] bg-[#fffaf0]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap
                    size={17}
                    className="text-[#c49635]"
                  />

                  <h2 className="text-sm font-bold">
                    Special Offers
                  </h2>
                </div>

                <div className="mt-3 space-y-2.5">
                  <Offer
                    text="Extra 5% off on selected payment methods"
                  />

                  <Offer
                    text="Free delivery on this product"
                  />

                  <Offer
                    text="Easy 7-day replacement available"
                  />

                  <Offer
                    text="Secure checkout with PrimeCart"
                  />
                </div>
              </div>

              {/* =================================================
                  DELIVERY
              ================================================== */}

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold">
                    Delivery
                  </p>

                  <span className="text-[10px] text-gray-500">
                    Check availability
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Truck
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      value={pincode}
                      onChange={(event) => {
                        setPincode(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        );

                        setDeliveryMessage("");
                        setDeliveryChecked(false);
                      }}
                      placeholder="Enter 6-digit pincode"
                      inputMode="numeric"
                      className={`h-11 w-full rounded-xl border pl-9 pr-3 text-xs outline-none transition ${
                        darkMode
                          ? "border-[#39362f] bg-[#1b1916] text-white focus:border-[#c49635]"
                          : "border-[#ddd8cf] bg-[#faf9f6] focus:border-[#c49635]"
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={checkDelivery}
                    className="h-11 rounded-xl border border-[#c49635] px-4 text-xs font-bold text-[#a97920] transition hover:bg-[#fff8e9]"
                  >
                    Check
                  </button>
                </div>

                {deliveryMessage && (
                  <div
                    className={`mt-2 flex items-center gap-1 text-[11px] ${
                      deliveryChecked
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {deliveryChecked && (
                      <Check size={13} />
                    )}

                    {deliveryMessage}
                  </div>
                )}
              </div>

              {/* =================================================
                  QUANTITY
              ================================================== */}

              <div className="mt-6 flex flex-wrap items-end gap-5">
                <div>
                  <p className="mb-2 text-xs font-bold">
                    Quantity
                  </p>

                  <div
                    className={`flex h-11 items-center overflow-hidden rounded-xl border ${
                      darkMode
                        ? "border-[#39362f]"
                        : "border-[#ddd8cf]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="flex h-full w-10 items-center justify-center disabled:opacity-30"
                    >
                      <Minus size={14} />
                    </button>

                    <span className="flex w-10 justify-center text-sm font-bold">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={
                        quantity >= product.stock
                      }
                      className="flex h-full w-10 items-center justify-center disabled:opacity-30"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-gray-500">
                    Total price
                  </p>

                  <p className="mt-0.5 text-lg font-bold">
                    ₹
                    {totalPrice.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
              </div>

              {/* Stock info */}

              <p className="mt-3 text-[10px] text-gray-500">
                Only {product.stock} units available
              </p>

              {/* =================================================
                  ACTION BUTTONS
              ================================================== */}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={addToCart}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#c49635] text-sm font-bold text-[#a97920] transition hover:bg-[#fff8e9]"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={buyNow}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c49635] text-sm font-bold text-white transition hover:bg-[#ae8128]"
                >
                  Buy Now
                  <ArrowRight size={17} />
                </button>
              </div>

              {/* Added notification */}

              {showAddedMessage && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-xs font-semibold text-green-700 dark:bg-green-950/20 dark:text-green-500">
                  <Check size={16} />
                  Product added to cart successfully.
                </div>
              )}

              {/* =================================================
                  PRODUCT BENEFITS
              ================================================== */}

              <div className="mt-7 grid grid-cols-3 gap-2">
                <Benefit
                  icon={<Truck size={17} />}
                  title="Fast Delivery"
                  darkMode={darkMode}
                />

                <Benefit
                  icon={<ShieldCheck size={17} />}
                  title="Secure Payment"
                  darkMode={darkMode}
                />

                <Benefit
                  icon={<RotateCcw size={17} />}
                  title="Easy Returns"
                  darkMode={darkMode}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            PRODUCT HIGHLIGHTS
        ====================================================== */}

        <section
          className={`mt-6 rounded-3xl border p-5 sm:p-7 ${
            darkMode
              ? "border-[#302d27] bg-[#151411]"
              : "border-[#e5dfd6] bg-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbefd4] text-[#ad7d20]">
              <Package size={17} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Product Highlights
              </h2>

              <p className="mt-0.5 text-[11px] text-gray-500">
                Everything you need to know
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {product.highlights.map(
              (highlight) => (
                <div
                  key={highlight}
                  className={`flex items-center gap-3 rounded-xl p-3 ${
                    darkMode
                      ? "bg-[#201e1a]"
                      : "bg-[#faf8f3]"
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fbefd4] text-[#ad7d20]">
                    <Check size={15} />
                  </div>

                  <span className="text-xs font-medium">
                    {highlight}
                  </span>
                </div>
              )
            )}
          </div>
        </section>

        {/* =====================================================
            SPECIFICATIONS
        ====================================================== */}

        <section
          className={`mt-6 rounded-3xl border p-5 sm:p-7 ${
            darkMode
              ? "border-[#302d27] bg-[#151411]"
              : "border-[#e5dfd6] bg-white"
          }`}
        >
          <h2 className="text-xl font-bold">
            Specifications
          </h2>

          <p className="mt-1 text-[11px] text-gray-500">
            Product technical details
          </p>

          <div className="mt-5 overflow-hidden rounded-xl border border-inherit">
            {product.specifications.map(
              (specification, index) => (
                <div
                  key={specification.label}
                  className={`grid grid-cols-[42%_58%] text-xs ${
                    index % 2 === 0
                      ? darkMode
                        ? "bg-[#1b1916]"
                        : "bg-[#faf9f6]"
                      : ""
                  }`}
                >
                  <div
                    className={`border-r px-4 py-3 font-medium ${
                      darkMode
                        ? "border-[#302d27] text-gray-500"
                        : "border-[#e8e2d9] text-gray-500"
                    }`}
                  >
                    {specification.label}
                  </div>

                  <div className="px-4 py-3 font-semibold">
                    {specification.value}
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* =====================================================
            DESCRIPTION
        ====================================================== */}

        <section
          className={`mt-6 rounded-3xl border p-5 sm:p-7 ${
            darkMode
              ? "border-[#302d27] bg-[#151411]"
              : "border-[#e5dfd6] bg-white"
          }`}
        >
          <h2 className="text-xl font-bold">
            Product Description
          </h2>

          <p
            className={`mt-4 max-w-5xl text-sm leading-7 ${
              darkMode
                ? "text-gray-400"
                : "text-gray-600"
            }`}
          >
            {product.description}
          </p>

          <div
            className={`mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4`}
          >
            <InfoBox
              title="Quality"
              text="Premium quality product"
              darkMode={darkMode}
            />

            <InfoBox
              title="Warranty"
              text="Manufacturer warranty"
              darkMode={darkMode}
            />

            <InfoBox
              title="Packaging"
              text="Secure product packaging"
              darkMode={darkMode}
            />

            <InfoBox
              title="Support"
              text="PrimeCart customer support"
              darkMode={darkMode}
            />
          </div>
        </section>

        {/* =====================================================
            REVIEWS
        ====================================================== */}

        <section
          className={`mt-6 rounded-3xl border p-5 sm:p-7 ${
            darkMode
              ? "border-[#302d27] bg-[#151411]"
              : "border-[#e5dfd6] bg-white"
          }`}
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold">
                Customer Reviews
              </h2>

              <div className="mt-2 flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 text-xs font-bold text-white">
                  {product.rating}
                  <Star
                    size={10}
                    fill="currentColor"
                  />
                </span>

                <span className="text-xs text-gray-500">
                  Based on{" "}
                  {product.reviews.toLocaleString(
                    "en-IN"
                  )}{" "}
                  ratings
                </span>
              </div>
            </div>

            <button
              type="button"
              className="flex h-10 items-center justify-center rounded-xl bg-[#c49635] px-5 text-xs font-bold text-white"
            >
              Write a Review
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {customerReviews.map((review) => (
              <div
                key={review.id}
                className={`rounded-2xl border p-4 ${
                  darkMode
                    ? "border-[#302d27] bg-[#1b1916]"
                    : "border-[#e8e2d9] bg-[#faf9f6]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 text-[10px] font-bold text-white">
                    {review.rating}
                    <Star
                      size={9}
                      fill="currentColor"
                    />
                  </span>

                  <span className="text-[10px] text-gray-500">
                    {review.date}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-bold">
                  {review.title}
                </h3>

                <p
                  className={`mt-2 text-xs leading-5 ${
                    darkMode
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  {review.text}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c49635] text-[9px] font-bold text-white">
                    {review.name
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold">
                      {review.name}
                    </p>

                    {review.verified && (
                      <p className="mt-0.5 flex items-center gap-1 text-[9px] text-green-600">
                        <Check size={9} />
                        Verified Purchase
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================
            TRUST SECTION
        ====================================================== */}

        <section
          className={`mt-6 rounded-3xl border p-5 sm:p-7 ${
            darkMode
              ? "border-[#302d27] bg-[#151411]"
              : "border-[#e5dfd6] bg-white"
          }`}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TrustItem
              icon={<ShieldCheck size={21} />}
              title="Secure Shopping"
              text="Your data is protected"
              darkMode={darkMode}
            />

            <TrustItem
              icon={<Truck size={21} />}
              title="Fast Delivery"
              text="Quick doorstep delivery"
              darkMode={darkMode}
            />

            <TrustItem
              icon={<RotateCcw size={21} />}
              title="Easy Returns"
              text="Simple 7-day returns"
              darkMode={darkMode}
            />

            <TrustItem
              icon={<Star size={21} />}
              title="Trusted Products"
              text="Quality products only"
              darkMode={darkMode}
            />
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer
          className={`mt-10 border-t pt-8 ${
            darkMode
              ? "border-[#302d27]"
              : "border-[#e5dfd6]"
          }`}
        >
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <img
                src="/logo.png"
                alt="PrimeCart"
                className={`h-10 w-auto ${
                  darkMode
                    ? "brightness-0 invert"
                    : ""
                }`}
              />

              <p
                className={`mt-4 max-w-xs text-xs leading-6 ${
                  darkMode
                    ? "text-gray-500"
                    : "text-gray-500"
                }`}
              >
                PrimeCart is your trusted destination for
                quality products, great deals and a smooth
                shopping experience.
              </p>
            </div>

            <FooterColumn
              title="Shop"
              links={[
                "All Products",
                "Electronics",
                "Fashion",
                "Beauty",
              ]}
            />

            <FooterColumn
              title="Customer Care"
              links={[
                "My Orders",
                "Returns",
                "Help Center",
                "Contact Us",
              ]}
            />

            <FooterColumn
              title="Account"
              links={[
                "My Profile",
                "Wishlist",
                "Shopping Cart",
                "Settings",
              ]}
            />
          </div>

          <div
            className={`mt-8 flex flex-col justify-between gap-3 border-t py-5 text-[11px] sm:flex-row ${
              darkMode
                ? "border-[#302d27] text-gray-600"
                : "border-[#e5dfd6] text-gray-400"
            }`}
          >
            <p>
              © 2026 PrimeCart. All rights reserved.
            </p>

            <div className="flex gap-5">
              <Link href="/privacy">
                Privacy
              </Link>

              <Link href="/terms">
                Terms
              </Link>

              <Link href="/help">
                Help
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* =========================================================
   OFFER COMPONENT
========================================================= */

function Offer({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Check
        size={14}
        className="mt-0.5 shrink-0 text-green-600"
      />

      <p className="text-[11px] text-gray-600 dark:text-gray-400">
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   BENEFIT COMPONENT
========================================================= */

function Benefit({
  icon,
  title,
  darkMode,
}: {
  icon: React.ReactNode;
  title: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center ${
        darkMode
          ? "border-[#302d27] bg-[#1b1916]"
          : "border-[#e8e2d9] bg-[#faf9f6]"
      }`}
    >
      <div className="text-[#b27f1d]">
        {icon}
      </div>

      <span className="text-[9px] font-semibold sm:text-[10px]">
        {title}
      </span>
    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  title,
  text,
  darkMode,
}: {
  title: string;
  text: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        darkMode
          ? "border-[#302d27] bg-[#1b1916]"
          : "border-[#e8e2d9] bg-[#faf9f6]"
      }`}
    >
      <p className="text-xs font-bold">
        {title}
      </p>

      <p
        className={`mt-1 text-[10px] ${
          darkMode
            ? "text-gray-500"
            : "text-gray-500"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   TRUST ITEM
========================================================= */

function TrustItem({
  icon,
  title,
  text,
  darkMode,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl p-4 ${
        darkMode
          ? "bg-[#1b1916]"
          : "bg-[#faf9f6]"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fbefd4] text-[#ad7d20]">
        {icon}
      </div>

      <div>
        <p className="text-xs font-bold">
          {title}
        </p>

        <p className="mt-1 text-[10px] text-gray-500">
          {text}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE NAV LINK
========================================================= */

function MobileLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
    >
      <span>{label}</span>

      <ChevronRight size={15} />
    </Link>
  );
}

/* =========================================================
   FOOTER COLUMN
========================================================= */

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: string[];
}) {
  return (
    <div>
      <h3 className="text-sm font-bold">
        {title}
      </h3>

      <div className="mt-4 space-y-3">
        {links.map((link) => (
          <Link
            key={link}
            href="/products"
            className="block text-xs text-gray-500 transition hover:text-[#b27f1d]"
          >
            {link}
          </Link>
        ))}
      </div>
    </div>
  );
}
