"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Heart,
  Menu,
  Minus,
  Moon,
  PackageCheck,
  Plus,
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

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number;
  stock: number;
  delivery: string;
  images: string[];
  shortDescription: string;
  description: string;
  highlights: string[];
  specifications: {
    [key: string]: string;
  };
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  stock: number;
};

const product: Product = {
  id: "1",
  name: "Samsung Galaxy Smartphone Pro Max",
  brand: "Samsung",
  category: "Electronics",
  rating: 4.8,
  reviews: 1248,
  price: 54999,
  originalPrice: 64999,
  stock: 12,
  delivery: "3–5 days",
  images: [
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1592286927505-1def25115558?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1000&q=85",
  ],
  shortDescription:
    "Experience powerful performance, stunning display and premium design with the Samsung Galaxy Smartphone Pro Max.",
  description:
    "The Samsung Galaxy Smartphone Pro Max combines premium design, powerful performance and an immersive display. Built for entertainment, photography, gaming and everyday productivity, it delivers a smooth and reliable smartphone experience.",
  highlights: [
    "Premium AMOLED display",
    "Powerful next-generation processor",
    "Advanced multi-camera system",
    "All-day battery performance",
    "Fast charging support",
    "5G connectivity",
    "Premium glass and metal design",
    "Advanced security features",
  ],
  specifications: {
    Brand: "Samsung",
    Model: "Galaxy Smartphone Pro Max",
    Display: "6.7-inch AMOLED",
    Resolution: "2400 × 1080 pixels",
    Processor: "Octa-core",
    RAM: "12 GB",
    Storage: "256 GB",
    Camera: "50 MP + 12 MP + 10 MP",
    FrontCamera: "32 MP",
    Battery: "5000 mAh",
    Network: "5G",
    OperatingSystem: "Android",
    Warranty: "1 Year Manufacturer Warranty",
  },
};

const reviews = [
  {
    name: "Rahul S.",
    rating: 5,
    text: "Excellent phone. Display quality and performance are amazing.",
  },
  {
    name: "Priya M.",
    rating: 5,
    text: "The phone looks premium and the camera quality is really good.",
  },
  {
    name: "Amit K.",
    rating: 4,
    text: "Very smooth performance and battery backup is impressive.",
  },
];

const formatPrice = (price: number) =>
  `₹${price.toLocaleString("en-IN")}`;

export default function ProductPage() {
  const supabase = createClient();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState("Account");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [addedMessage, setAddedMessage] = useState("");

  const discount = useMemo(
    () =>
      Math.round(
        ((product.originalPrice - product.price) /
          product.originalPrice) *
          100
      ),
    []
  );

  const total = product.price * quantity;

  useEffect(() => {
    const theme = localStorage.getItem("primecart-theme");

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const storedCart = localStorage.getItem("primecart-cart");

    if (storedCart) {
      try {
        const cart: CartItem[] = JSON.parse(storedCart);
        setCartCount(
          cart.reduce((sum, item) => sum + item.quantity, 0)
        );
      } catch {
        setCartCount(0);
      }
    }

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserName(
          user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Account"
        );
      }
    };

    loadUser();
  }, [supabase.auth]);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");

    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("primecart-theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("primecart-theme", "dark");
    }
  };

  const updateCart = (newCart: CartItem[]) => {
    localStorage.setItem("primecart-cart", JSON.stringify(newCart));

    setCartCount(
      newCart.reduce((sum, item) => sum + item.quantity, 0)
    );

    window.dispatchEvent(new Event("primecart-cart-updated"));
  };

  const addToCart = () => {
    const storedCart = localStorage.getItem("primecart-cart");

    let cart: CartItem[] = [];

    if (storedCart) {
      try {
        cart = JSON.parse(storedCart);
      } catch {
        cart = [];
      }
    }

    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + quantity,
        product.stock
      );
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0],
        quantity,
        stock: product.stock,
      });
    }

    updateCart(cart);

    setAddedMessage("Added to cart successfully!");

    setTimeout(() => {
      setAddedMessage("");
    }, 2500);
  };

  const buyNow = () => {
    addToCart();

    setTimeout(() => {
      window.location.href = "/cart";
    }, 400);
  };

  const checkDelivery = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryMessage("Please enter a valid 6-digit pincode.");
      return;
    }

    setDeliveryMessage(
      "Delivery available to this location. Expected in 3–5 days."
    );
  };

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#181818] transition-colors dark:bg-[#080808] dark:text-white">
      {/* Announcement */}
      <div className="bg-[#17130d] px-4 py-2 text-center text-xs font-medium text-white dark:bg-[#d6aa4b] dark:text-black">
        Free shipping on orders above ₹999 • Easy returns within 7 days
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#111]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-6">
          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-xl p-2 hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <Link href="/dashboard" className="shrink-0">
            <div className="text-2xl font-black tracking-tight">
              Prime<span className="text-[#c7973e]">Cart</span>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 lg:block">
            <div className="mx-auto flex max-w-2xl items-center rounded-2xl border border-black/10 bg-[#f6f3ec] px-4 dark:border-white/10 dark:bg-white/5">
              <Search size={19} className="text-black/45 dark:text-white/45" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands and categories..."
                className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-black/40 dark:placeholder:text-white/40"
              />
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-xl p-2.5 hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Toggle theme"
          >
            <Sun className="hidden dark:block" size={20} />
            <Moon className="block dark:hidden" size={20} />
          </button>

          <Link
            href="/profile"
            className="hidden items-center gap-2 rounded-xl px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 sm:flex"
          >
            <User size={19} />

            <div className="hidden text-left xl:block">
              <p className="text-[10px] text-black/50 dark:text-white/50">
                Hello,
              </p>
              <p className="max-w-24 truncate text-xs font-semibold">
                {userName}
              </p>
            </div>
          </Link>

          <Link
            href="/cart"
            className="relative rounded-xl p-2.5 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ShoppingCart size={21} />

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c7973e] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Categories */}
        <div className="hidden border-t border-black/5 dark:border-white/5 lg:block">
          <div className="mx-auto flex max-w-7xl items-center gap-7 overflow-x-auto px-6 py-3 text-sm">
            {[
              "All",
              "Electronics",
              "Fashion",
              "Beauty",
              "Home & Kitchen",
              "Sports",
              "Books",
              "Deals",
            ].map((item) => (
              <Link
                key={item}
                href="/dashboard"
                className="whitespace-nowrap font-medium text-black/70 hover:text-[#b18437] dark:text-white/70 dark:hover:text-[#d6aa4b]"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 lg:hidden">
          <div className="h-full w-[82%] max-w-sm bg-white p-5 dark:bg-[#111]">
            <div className="mb-8 flex items-center justify-between">
              <div className="text-2xl font-black">
                Prime<span className="text-[#c7973e]">Cart</span>
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-xl p-2 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X />
              </button>
            </div>

            <div className="space-y-2">
              {[
                "All",
                "Electronics",
                "Fashion",
                "Beauty",
                "Home & Kitchen",
                "Sports",
                "Books",
                "Deals",
              ].map((item) => (
                <Link
                  key={item}
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 font-medium hover:bg-[#f5f1e8] dark:hover:bg-white/10"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-5 lg:px-6">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-black/50 dark:text-white/50">
          <Link href="/dashboard" className="hover:text-[#b18437]">
            Home
          </Link>
          <ChevronRight size={14} />
          <span>{product.category}</span>
          <ChevronRight size={14} />
          <span className="max-w-60 truncate text-black/70 dark:text-white/70">
            {product.name}
          </span>
        </div>

        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#9a742f] hover:text-[#c7973e]"
        >
          <ArrowLeft size={17} />
          Back to Shopping
        </Link>

        {/* Product main */}
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Images */}
          <div>
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-[#111]">
              <div className="absolute left-5 top-5 z-10 rounded-full bg-[#b98b38] px-3 py-1.5 text-xs font-bold text-white">
                {discount}% OFF
              </div>

              <button
                onClick={() => setWishlist(!wishlist)}
                className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#191919]"
              >
                <Heart
                  size={20}
                  className={
                    wishlist
                      ? "fill-[#b98b38] text-[#b98b38]"
                      : ""
                  }
                />
              </button>

              <div className="flex min-h-[430px] items-center justify-center rounded-2xl bg-[#f8f6f0] p-8 dark:bg-[#181818]">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="max-h-[460px] w-full object-contain"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden rounded-2xl border bg-white p-2 dark:bg-[#111] ${
                    selectedImage === index
                      ? "border-[#c7973e] ring-2 ring-[#c7973e]/20"
                      : "border-black/10 dark:border-white/10"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-24 w-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#a47b32]">
              {product.brand}
            </div>

            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-4 text-base leading-7 text-black/60 dark:text-white/60">
              {product.shortDescription}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-[#e8f5e9] px-2.5 py-1.5 text-sm font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                {product.rating}
                <Star size={14} className="fill-current" />
              </div>

              <span className="text-sm font-medium text-black/60 dark:text-white/60">
                {product.reviews.toLocaleString("en-IN")} ratings & reviews
              </span>

              <span className="h-4 w-px bg-black/20 dark:bg-white/20" />

              <span className="text-sm font-semibold text-green-600">
                In Stock
              </span>
            </div>

            <div className="my-7 border-y border-black/10 py-6 dark:border-white/10">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black">
                  {formatPrice(product.price)}
                </span>

                <span className="mb-1 text-lg text-black/40 line-through dark:text-white/40">
                  {formatPrice(product.originalPrice)}
                </span>

                <span className="mb-1 rounded-md bg-green-100 px-2 py-1 text-sm font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  {discount}% off
                </span>
              </div>

              <p className="mt-2 text-xs text-black/45 dark:text-white/45">
                Inclusive of all taxes
              </p>
            </div>

            {/* Offers */}
            <div className="rounded-2xl border border-[#d8b66a]/30 bg-[#fbf5e7] p-5 dark:border-[#d8b66a]/20 dark:bg-[#211b10]">
              <div className="mb-4 flex items-center gap-2 font-bold">
                <Zap size={18} className="text-[#b18437]" />
                Special Offers
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <Check size={17} className="mt-0.5 text-green-600" />
                  <span>Free delivery on this product</span>
                </div>

                <div className="flex gap-2">
                  <Check size={17} className="mt-0.5 text-green-600" />
                  <span>7-day easy return available</span>
                </div>

                <div className="flex gap-2">
                  <Check size={17} className="mt-0.5 text-green-600" />
                  <span>1-year manufacturer warranty</span>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Truck size={18} className="text-[#b18437]" />
                Check Delivery
              </div>

              <div className="flex gap-2">
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={6}
                  placeholder="Enter 6-digit pincode"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#c7973e] dark:border-white/10 dark:bg-[#111]"
                />

                <button
                  onClick={checkDelivery}
                  className="rounded-xl border border-[#b18437] px-5 text-sm font-bold text-[#9a742f] hover:bg-[#b18437] hover:text-white"
                >
                  Check
                </button>
              </div>

              {deliveryMessage && (
                <p className="mt-2 text-xs font-medium text-green-600">
                  {deliveryMessage}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <div>
                <p className="mb-2 text-xs font-semibold text-black/50 dark:text-white/50">
                  Quantity
                </p>

                <div className="flex h-11 items-center rounded-xl border border-black/10 dark:border-white/10">
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.max(1, q - 1))
                    }
                    className="px-3"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="w-10 text-center text-sm font-bold">
                    {quantity}
                  </span>

                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(product.stock, q + 1)
                      )
                    }
                    className="px-3"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-black/50 dark:text-white/50">
                  Total
                </p>

                <p className="text-xl font-black">
                  {formatPrice(total)}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                onClick={addToCart}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#b18437] font-bold text-[#9a742f] transition hover:bg-[#b18437] hover:text-white"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>

              <button
                onClick={buyNow}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#b18437] font-bold text-white transition hover:bg-[#9b742e]"
              >
                Buy Now
                <ArrowRight size={19} />
              </button>
            </div>

            {addedMessage && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <Check size={17} />
                {addedMessage}
              </div>
            )}

            {/* Benefits */}
            <div className="mt-7 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-[#111]">
                <Truck size={21} className="text-[#b18437]" />
                <p className="mt-3 text-xs font-bold">Fast Delivery</p>
                <p className="mt-1 text-[10px] text-black/45 dark:text-white/45">
                  3–5 days
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-[#111]">
                <ShieldCheck size={21} className="text-[#b18437]" />
                <p className="mt-3 text-xs font-bold">Secure Payment</p>
                <p className="mt-1 text-[10px] text-black/45 dark:text-white/45">
                  100% secure
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-[#111]">
                <PackageCheck size={21} className="text-[#b18437]" />
                <p className="mt-3 text-xs font-bold">Easy Returns</p>
                <p className="mt-1 text-[10px] text-black/45 dark:text-white/45">
                  7 days
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="mt-12 rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#111] sm:p-8">
          <h2 className="text-2xl font-black">Product Highlights</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {product.highlights.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-[#f8f6f0] p-4 dark:bg-white/5"
              >
                <Check
                  size={18}
                  className="mt-0.5 shrink-0 text-[#b18437]"
                />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Specifications */}
        <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#111] sm:p-8">
          <h2 className="text-2xl font-black">Specifications</h2>

          <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
            {Object.entries(product.specifications).map(
              ([key, value], index) => (
                <div
                  key={key}
                  className={`grid grid-cols-1 sm:grid-cols-[220px_1fr] ${
                    index !==
                    Object.entries(product.specifications).length - 1
                      ? "border-b border-black/10 dark:border-white/10"
                      : ""
                  }`}
                >
                  <div className="bg-[#f8f6f0] px-4 py-3 text-sm font-semibold dark:bg-white/5">
                    {key}
                  </div>

                  <div className="px-4 py-3 text-sm text-black/65 dark:text-white/65">
                    {value}
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* Description */}
        <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#111] sm:p-8">
          <h2 className="text-2xl font-black">Product Description</h2>

          <p className="mt-5 max-w-4xl text-sm leading-7 text-black/60 dark:text-white/60">
            {product.description}
          </p>
        </section>

        {/* Reviews */}
        <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#111] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">
                Customer Reviews
              </h2>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-black">
                  {product.rating}
                </span>

                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={17}
                      className="fill-[#c7973e] text-[#c7973e]"
                    />
                  ))}
                </div>

                <span className="text-sm text-black/50 dark:text-white/50">
                  {product.reviews} reviews
                </span>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {reviews.map((review) => (
              <div
                key={review.name}
                className="rounded-2xl bg-[#f8f6f0] p-5 dark:bg-white/5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{review.name}</span>

                  <div className="flex">
                    {Array.from({ length: review.rating }).map(
                      (_, index) => (
                        <Star
                          key={index}
                          size={14}
                          className="fill-[#c7973e] text-[#c7973e]"
                        />
                      )
                    )}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-black/60 dark:text-white/60">
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-14 border-t border-black/10 bg-white dark:border-white/10 dark:bg-[#0d0d0d]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
          <div>
            <div className="text-2xl font-black">
              Prime<span className="text-[#c7973e]">Cart</span>
            </div>

            <p className="mt-4 text-sm leading-6 text-black/50 dark:text-white/50">
              Your trusted destination for quality products,
              great deals and a better shopping experience.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Shop</h3>
            <div className="mt-4 space-y-3 text-sm text-black/55 dark:text-white/55">
              <Link href="/dashboard" className="block">
                Electronics
              </Link>
              <Link href="/dashboard" className="block">
                Fashion
              </Link>
              <Link href="/dashboard" className="block">
                Beauty
              </Link>
              <Link href="/dashboard" className="block">
                Home & Kitchen
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Customer Care</h3>
            <div className="mt-4 space-y-3 text-sm text-black/55 dark:text-white/55">
              <p>Help Center</p>
              <p>Returns</p>
              <p>Shipping</p>
              <p>Contact Us</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Why PrimeCart?</h3>
            <div className="mt-4 space-y-3 text-sm text-black/55 dark:text-white/55">
              <p>✓ Secure Payments</p>
              <p>✓ Fast Delivery</p>
              <p>✓ Easy Returns</p>
              <p>✓ Trusted Products</p>
            </div>
          </div>
        </div>

        <div className="border-t border-black/10 py-5 text-center text-xs text-black/40 dark:border-white/10 dark:text-white/40">
          © 2026 PrimeCart. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
