"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  Menu,
  Minus,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Truck,
  User,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
  delivery: "3 - 5 Days",
  description:
    "Experience powerful performance, stunning photography and an immersive display with the Samsung Galaxy Smartphone Pro Max. Designed for everyday productivity, entertainment and gaming with premium hardware and modern design.",
  images: [
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1000&q=85",
  ],
  highlights: [
    "Premium AMOLED display with vivid colours",
    "Powerful processor for smooth multitasking",
    "Advanced camera system",
    "All-day battery with fast charging",
    "Premium glass and metal design",
    "Large internal storage",
  ],
  specifications: [
    ["Brand", "Samsung"],
    ["Model", "Galaxy Smartphone Pro Max"],
    ["Display", "6.7 inch AMOLED"],
    ["RAM", "12 GB"],
    ["Storage", "256 GB"],
    ["Rear Camera", "200 MP + Ultra Wide"],
    ["Front Camera", "50 MP"],
    ["Battery", "5000 mAh"],
    ["Operating System", "Android"],
    ["Warranty", "1 Year Manufacturer Warranty"],
  ],
};

const reviews = [
  {
    name: "Rahul Patil",
    rating: 5,
    date: "2 days ago",
    text: "Excellent phone. Display and camera quality are amazing. Delivery was also very fast.",
  },
  {
    name: "Sneha Sharma",
    rating: 5,
    date: "1 week ago",
    text: "Very premium product. Performance is smooth and battery easily lasts the whole day.",
  },
  {
    name: "Amit Joshi",
    rating: 4,
    date: "2 weeks ago",
    text: "Good product for the price. Build quality feels premium.",
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN").format(price);
}

export default function ProductPage() {
  const supabase = createClient();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [userName, setUserName] = useState("Account");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showReviews, setShowReviews] = useState(true);

  const isDark = theme === "dark";

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem("primecart-theme");

    if (savedTheme === "dark") {
      setTheme("dark");
    }

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0];

        if (name) setUserName(name);
      }
    };

    loadUser();
    loadCartCount();
  }, []);

  useEffect(() => {
    localStorage.setItem("primecart-theme", theme);
  }, [theme]);

  const loadCartCount = () => {
    try {
      const cart = JSON.parse(
        localStorage.getItem("primecart-cart") || "[]"
      );

      const count = cart.reduce(
        (total: number, item: { quantity?: number }) =>
          total + (item.quantity || 1),
        0
      );

      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  const addToCart = () => {
    try {
      const oldCart = JSON.parse(
        localStorage.getItem("primecart-cart") || "[]"
      );

      const existingIndex = oldCart.findIndex(
        (item: { id: string }) => item.id === product.id
      );

      if (existingIndex >= 0) {
        oldCart[existingIndex].quantity += quantity;
      } else {
        oldCart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images[0],
          quantity,
          stock: product.stock,
        });
      }

      localStorage.setItem("primecart-cart", JSON.stringify(oldCart));
      loadCartCount();

      window.dispatchEvent(new Event("primecart-cart-updated"));

      alert("Product added to cart!");
    } catch {
      alert("Unable to add product to cart.");
    }
  };

  const buyNow = () => {
    addToCart();
    window.location.href = "/cart";
  };

  const checkDelivery = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryMessage("Please enter a valid 6-digit pincode.");
      return;
    }

    setDeliveryMessage(
      `Great! Delivery available to ${pincode}. Estimated delivery in ${product.delivery}.`
    );
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  return (
    <main
      className={
        isDark
          ? "min-h-screen bg-[#11100e] text-[#f7f3eb]"
          : "min-h-screen bg-[#faf8f3] text-[#171614]"
      }
    >
      {/* Announcement */}
      <div
        className={
          isDark
            ? "border-b border-white/10 bg-[#191816] px-4 py-2 text-center text-xs text-white/70"
            : "border-b border-black/5 bg-[#171614] px-4 py-2 text-center text-xs text-white"
        }
      >
        Free shipping on orders above ₹999 • Easy returns within 7 days
      </div>

      {/* Navbar */}
      <nav
        className={
          isDark
            ? "sticky top-0 z-50 border-b border-white/10 bg-[#11100e]/95 backdrop-blur-xl"
            : "sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur-xl"
        }
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-5 px-4 lg:px-8">
          {/* Mobile menu */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="rounded-xl p-2 lg:hidden"
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link href="/dashboard" className="shrink-0">
            <div className="text-2xl font-black tracking-tight">
              Prime<span className="text-[#b88a2a]">Cart</span>
            </div>
          </Link>

          {/* Search */}
          <div className="hidden flex-1 md:block">
            <div
              className={
                isDark
                  ? "flex h-11 items-center rounded-xl border border-white/10 bg-white/5"
                  : "flex h-11 items-center rounded-xl border border-black/10 bg-[#f7f5ef]"
              }
            >
              <Search className="ml-4 text-black/40 dark:text-white/40" size={19} />

              <input
                placeholder="Search for products, brands and more"
                className="h-full flex-1 bg-transparent px-3 text-sm outline-none"
              />

              <button className="mr-1 rounded-lg bg-[#b88a2a] px-5 py-2 text-sm font-semibold text-white">
                Search
              </button>
            </div>
          </div>

          {/* Account */}
          <Link
            href="/profile"
            className="hidden items-center gap-2 rounded-xl px-2 py-2 md:flex"
          >
            <User size={20} />
            <div className="hidden xl:block">
              <p className="text-[10px] opacity-50">Hello,</p>
              <p className="max-w-[100px] truncate text-sm font-semibold">
                {userName}
              </p>
            </div>
          </Link>

          {/* Orders */}
          <Link
            href="/orders"
            className="hidden items-center gap-2 rounded-xl px-2 py-2 lg:flex"
          >
            <Package size={21} />
            <span className="text-sm font-semibold">Orders</span>
          </Link>

          {/* Wishlist */}
          <button
            onClick={() => setWishlist(!wishlist)}
            className="relative rounded-xl p-2"
          >
            <Heart
              size={22}
              fill={wishlist ? "currentColor" : "none"}
              className={wishlist ? "text-[#b88a2a]" : ""}
            />
          </button>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative rounded-xl p-2"
          >
            <ShoppingCart size={23} />

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b88a2a] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className={
              isDark
                ? "rounded-xl border border-white/10 px-3 py-2 text-xs"
                : "rounded-xl border border-black/10 px-3 py-2 text-xs"
            }
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div
            className={
              isDark
                ? "border-t border-white/10 px-5 py-5"
                : "border-t border-black/5 bg-white px-5 py-5"
            }
          >
            <div className="mb-4 flex items-center gap-3">
              <Search size={18} />
              <input
                placeholder="Search products..."
                className="flex-1 bg-transparent py-2 outline-none"
              />
            </div>

            <div className="grid gap-3 text-sm font-semibold">
              <Link href="/dashboard">Home</Link>
              <Link href="/orders">Orders</Link>
              <Link href="/wishlist">Wishlist</Link>
              <Link href="/profile">My Account</Link>
              <Link href="/cart">Cart</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Category Navigation */}
      <div
        className={
          isDark
            ? "border-b border-white/10 bg-[#171614]"
            : "border-b border-black/5 bg-white"
        }
      >
        <div className="mx-auto flex max-w-7xl gap-7 overflow-x-auto px-4 py-3 text-sm font-medium lg:px-8">
          {[
            "Electronics",
            "Fashion",
            "Beauty",
            "Home & Kitchen",
            "Sports",
            "Books",
            "Deals",
            "New Arrivals",
          ].map((category) => (
            <Link
              key={category}
              href="/dashboard"
              className="whitespace-nowrap transition hover:text-[#b88a2a]"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
        {/* Breadcrumb */}
        <div className="mb-7 flex items-center gap-2 overflow-x-auto text-xs opacity-60">
          <Link href="/dashboard">Home</Link>
          <ChevronRight size={14} />
          <span>{product.category}</span>
          <ChevronRight size={14} />
          <span className="whitespace-nowrap">{product.name}</span>
        </div>

        {/* Product */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* LEFT - Images */}
          <div>
            <div
              className={
                isDark
                  ? "relative flex min-h-[480px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white"
                  : "relative flex min-h-[480px] items-center justify-center overflow-hidden rounded-3xl border border-black/5 bg-white"
              }
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-[430px] w-full object-contain p-8 transition duration-300"
              />

              {/* Wishlist */}
              <button
                onClick={() => setWishlist(!wishlist)}
                className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-sm"
              >
                <Heart
                  size={21}
                  fill={wishlist ? "#b88a2a" : "none"}
                  className={wishlist ? "text-[#b88a2a]" : "text-black"}
                />
              </button>

              {/* Arrows */}
              <button
                onClick={() =>
                  setSelectedImage(
                    selectedImage === 0
                      ? product.images.length - 1
                      : selectedImage - 1
                  )
                }
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md"
              >
                <ArrowLeft size={19} className="text-black" />
              </button>

              <button
                onClick={() =>
                  setSelectedImage(
                    selectedImage === product.images.length - 1
                      ? 0
                      : selectedImage + 1
                  )
                }
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md"
              >
                <ArrowRight size={19} className="text-black" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setSelectedImage(index)}
                  className={
                    selectedImage === index
                      ? "overflow-hidden rounded-2xl border-2 border-[#b88a2a] bg-white"
                      : "overflow-hidden rounded-2xl border border-black/10 bg-white"
                  }
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-24 w-full object-contain p-2"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT - Details */}
          <div>
            <div className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#b88a2a]">
              {product.brand}
            </div>

            <h1 className="text-3xl font-black leading-tight lg:text-4xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-[#b88a2a] px-3 py-1.5 text-sm font-bold text-white">
                {product.rating}
                <Star size={14} fill="currentColor" />
              </div>

              <span className="text-sm font-medium">
                {product.reviews.toLocaleString("en-IN")} Ratings & Reviews
              </span>

              <span className="text-xs opacity-50">
                | {product.stock} units available
              </span>
            </div>

            <div className="my-6 h-px bg-current opacity-10" />

            {/* Price */}
            <div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black">
                  ₹{formatPrice(product.price)}
                </span>

                <span className="mb-1 text-lg text-gray-400 line-through">
                  ₹{formatPrice(product.originalPrice)}
                </span>

                <span className="mb-1 text-lg font-bold text-green-600">
                  {discount}% OFF
                </span>
              </div>

              <p className="mt-2 text-sm opacity-60">
                Inclusive of all taxes
              </p>
            </div>

            {/* Offers */}
            <div
              className={
                isDark
                  ? "mt-6 rounded-2xl border border-[#b88a2a]/30 bg-[#b88a2a]/10 p-5"
                  : "mt-6 rounded-2xl border border-[#b88a2a]/20 bg-[#fff8e9] p-5"
              }
            >
              <h3 className="mb-3 font-bold">Special Offers</h3>

              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <Check className="mt-0.5 text-green-600" size={17} />
                  <span>Extra ₹1,000 off on selected bank cards</span>
                </div>

                <div className="flex gap-3">
                  <Check className="mt-0.5 text-green-600" size={17} />
                  <span>Free delivery on this product</span>
                </div>

                <div className="flex gap-3">
                  <Check className="mt-0.5 text-green-600" size={17} />
                  <span>7 days easy replacement available</span>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2 font-bold">
                <Truck size={19} className="text-[#b88a2a]" />
                Delivery
              </div>

              <div className="flex max-w-md overflow-hidden rounded-xl border border-black/10 bg-white">
                <MapPin className="ml-3 mt-3 text-gray-400" size={18} />

                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter pincode"
                  maxLength={6}
                  className="min-w-0 flex-1 px-3 py-3 text-sm text-black outline-none"
                />

                <button
                  onClick={checkDelivery}
                  className="px-5 text-sm font-bold text-[#b88a2a]"
                >
                  Check
                </button>
              </div>

              {deliveryMessage && (
                <p
                  className={`mt-2 text-sm ${
                    deliveryMessage.includes("Great")
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {deliveryMessage}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="mt-6">
              <p className="mb-3 text-sm font-bold">Quantity</p>

              <div className="flex w-fit items-center overflow-hidden rounded-xl border border-black/10 bg-white">
                <button
                  onClick={() =>
                    setQuantity((value) => Math.max(1, value - 1))
                  }
                  className="flex h-11 w-11 items-center justify-center text-black hover:bg-gray-100"
                >
                  <Minus size={17} />
                </button>

                <span className="flex h-11 w-12 items-center justify-center border-x border-black/10 text-sm font-bold text-black">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity((value) =>
                      Math.min(product.stock, value + 1)
                    )
                  }
                  className="flex h-11 w-11 items-center justify-center text-black hover:bg-gray-100"
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                onClick={addToCart}
                className="flex h-14 items-center justify-center gap-3 rounded-2xl border-2 border-[#b88a2a] font-bold text-[#b88a2a] transition hover:bg-[#b88a2a] hover:text-white"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>

              <button
                onClick={buyNow}
                className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#b88a2a] font-bold text-white shadow-lg transition hover:brightness-95"
              >
                <Zap size={20} />
                Buy Now
              </button>
            </div>

            {/* Benefits */}
            <div className="mt-7 grid grid-cols-3 gap-2">
              <div
                className={
                  isDark
                    ? "rounded-2xl border border-white/10 p-4 text-center"
                    : "rounded-2xl border border-black/5 bg-white p-4 text-center"
                }
              >
                <Truck className="mx-auto mb-2 text-[#b88a2a]" size={22} />
                <p className="text-xs font-semibold">Free Delivery</p>
              </div>

              <div
                className={
                  isDark
                    ? "rounded-2xl border border-white/10 p-4 text-center"
                    : "rounded-2xl border border-black/5 bg-white p-4 text-center"
                }
              >
                <ShieldCheck
                  className="mx-auto mb-2 text-[#b88a2a]"
                  size={22}
                />
                <p className="text-xs font-semibold">Secure Payment</p>
              </div>

              <div
                className={
                  isDark
                    ? "rounded-2xl border border-white/10 p-4 text-center"
                    : "rounded-2xl border border-black/5 bg-white p-4 text-center"
                }
              >
                <Package
                  className="mx-auto mb-2 text-[#b88a2a]"
                  size={22}
                />
                <p className="text-xs font-semibold">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Highlights */}
        <section
          className={
            isDark
              ? "mt-12 overflow-hidden rounded-3xl border border-white/10 bg-[#181715]"
              : "mt-12 overflow-hidden rounded-3xl border border-black/5 bg-white"
          }
        >
          <div className="border-b border-current/10 px-6 py-5 lg:px-8">
            <h2 className="text-2xl font-black">Product Highlights</h2>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3 lg:p-8">
            {product.highlights.map((highlight) => (
              <div key={highlight} className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#b88a2a]/15">
                  <Check size={14} className="text-[#b88a2a]" />
                </div>

                <p className="text-sm leading-6 opacity-80">
                  {highlight}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Specifications + Description */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section
            className={
              isDark
                ? "overflow-hidden rounded-3xl border border-white/10 bg-[#181715]"
                : "overflow-hidden rounded-3xl border border-black/5 bg-white"
            }
          >
            <div className="border-b border-current/10 px-6 py-5">
              <h2 className="text-2xl font-black">Specifications</h2>
            </div>

            <div>
              {product.specifications.map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-2 border-b border-current/5 px-6 py-4 text-sm last:border-0"
                >
                  <span className="opacity-50">{key}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section
            className={
              isDark
                ? "rounded-3xl border border-white/10 bg-[#181715] p-6"
                : "rounded-3xl border border-black/5 bg-white p-6"
            }
          >
            <h2 className="text-2xl font-black">Product Description</h2>

            <p className="mt-5 text-sm leading-7 opacity-70">
              {product.description}
            </p>

            <div className="mt-7 rounded-2xl bg-[#b88a2a]/10 p-5">
              <div className="flex gap-3">
                <ShieldCheck
                  className="shrink-0 text-[#b88a2a]"
                  size={22}
                />

                <div>
                  <h3 className="font-bold">Genuine Product Guarantee</h3>
                  <p className="mt-1 text-xs leading-5 opacity-60">
                    PrimeCart ensures that products listed on the platform
                    are sourced from verified sellers and brands.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Reviews */}
        <section
          className={
            isDark
              ? "mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#181715]"
              : "mt-6 overflow-hidden rounded-3xl border border-black/5 bg-white"
          }
        >
          <button
            onClick={() => setShowReviews(!showReviews)}
            className="flex w-full items-center justify-between px-6 py-5 text-left"
          >
            <div>
              <h2 className="text-2xl font-black">Customer Reviews</h2>

              <div className="mt-2 flex items-center gap-2">
                <span className="font-bold">{product.rating}/5</span>

                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={15}
                      fill="#b88a2a"
                      className="text-[#b88a2a]"
                    />
                  ))}
                </div>

                <span className="text-xs opacity-50">
                  {product.reviews} reviews
                </span>
              </div>
            </div>

            <ChevronDown
              size={22}
              className={`transition ${
                showReviews ? "rotate-180" : ""
              }`}
            />
          </button>

          {showReviews && (
            <div className="border-t border-current/10">
              {reviews.map((review) => (
                <div
                  key={review.name}
                  className="border-b border-current/5 p-6 last:border-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold">{review.name}</p>

                      <div className="mt-1 flex gap-1">
                        {Array.from({ length: review.rating }).map(
                          (_, index) => (
                            <Star
                              key={index}
                              size={14}
                              fill="#b88a2a"
                              className="text-[#b88a2a]"
                            />
                          )
                        )}
                      </div>
                    </div>

                    <span className="text-xs opacity-40">
                      {review.date}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 opacity-70">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer
        className={
          isDark
            ? "mt-16 border-t border-white/10 bg-[#0c0c0b]"
            : "mt-16 border-t border-black/5 bg-[#171614] text-white"
        }
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4 lg:px-8">
          <div>
            <div className="text-2xl font-black">
              Prime<span className="text-[#b88a2a]">Cart</span>
            </div>

            <p className="mt-4 text-sm leading-6 text-white/50">
              Your trusted destination for quality products, great prices
              and a smooth shopping experience.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Shop</h3>

            <div className="mt-4 grid gap-3 text-sm text-white/50">
              <Link href="/dashboard">All Products</Link>
              <Link href="/dashboard">Deals</Link>
              <Link href="/dashboard">New Arrivals</Link>
              <Link href="/wishlist">Wishlist</Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Customer Care</h3>

            <div className="mt-4 grid gap-3 text-sm text-white/50">
              <span>Help Center</span>
              <span>Shipping & Delivery</span>
              <span>Returns</span>
              <span>Contact Us</span>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Why PrimeCart?</h3>

            <div className="mt-4 grid gap-3 text-sm text-white/50">
              <span>✓ Secure Payments</span>
              <span>✓ Genuine Products</span>
              <span>✓ Easy Returns</span>
              <span>✓ Fast Delivery</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-white/40">
          © 2026 PrimeCart. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
