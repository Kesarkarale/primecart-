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
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sun,
  Trash2,
  Truck,
  User,
  X,
  PackageCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type CartItem = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  stock: number;
};

const formatPrice = (price: number) =>
  `₹${price.toLocaleString("en-IN")}`;

export default function CartPage() {
  const supabase = createClient();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [userName, setUserName] = useState("Account");
  const [theme, setTheme] = useState("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("primecart-theme") || "light";

    setTheme(savedTheme);

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    loadCart();
    loadUser();

    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener(
      "primecart-cart-updated",
      handleCartUpdate
    );

    window.addEventListener("storage", handleCartUpdate);

    return () => {
      window.removeEventListener(
        "primecart-cart-updated",
        handleCartUpdate
      );

      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  const loadCart = () => {
    const storedCart = localStorage.getItem("primecart-cart");

    if (!storedCart) {
      setCart([]);
      return;
    }

    try {
      const parsed: CartItem[] = JSON.parse(storedCart);
      setCart(parsed);
    } catch {
      setCart([]);
    }
  };

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

  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);

    localStorage.setItem(
      "primecart-cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(new Event("primecart-cart-updated"));
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    localStorage.setItem("primecart-theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const increaseQuantity = (id: string) => {
    const updated = cart.map((item) => {
      if (item.id !== id) return item;

      return {
        ...item,
        quantity: Math.min(item.quantity + 1, item.stock),
      };
    });

    saveCart(updated);
  };

  const decreaseQuantity = (id: string) => {
    const updated = cart.map((item) => {
      if (item.id !== id) return item;

      return {
        ...item,
        quantity: Math.max(item.quantity - 1, 1),
      };
    });

    saveCart(updated);
  };

  const removeItem = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cart]
  );

  const originalTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + item.originalPrice * item.quantity,
        0
      ),
    [cart]
  );

  const discount = originalTotal - subtotal;

  const deliveryCharge = subtotal >= 999 || subtotal === 0 ? 0 : 79;

  const total = subtotal + deliveryCharge;

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#181818] dark:bg-[#080808] dark:text-white">
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

          <Link
            href="/dashboard"
            className="shrink-0 text-2xl font-black tracking-tight"
          >
            Prime<span className="text-[#c7973e]">Cart</span>
          </Link>

          <div className="hidden min-w-0 flex-1 lg:block">
            <div className="mx-auto flex max-w-2xl items-center rounded-2xl border border-black/10 bg-[#f6f3ec] px-4 dark:border-white/10 dark:bg-white/5">
              <Search
                size={19}
                className="text-black/45 dark:text-white/45"
              />

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
          >
            {theme === "dark" ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
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
            className="relative rounded-xl bg-[#f6f3ec] p-2.5 dark:bg-white/10"
          >
            <ShoppingCart size={21} />

            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c7973e] px-1 text-[10px] font-bold text-white">
                {totalItems}
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

      {/* Mobile Menu */}
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

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-xs text-black/45 dark:text-white/45">
            <Link href="/dashboard">Home</Link>
            <ChevronRight size={13} />
            <span>Cart</span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Shopping Cart
              </h1>

              <p className="mt-2 text-sm text-black/50 dark:text-white/50">
                {totalItems === 0
                  ? "Your cart is currently empty."
                  : `${totalItems} item${
                      totalItems > 1 ? "s" : ""
                    } in your cart`}
              </p>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm font-semibold text-red-500 hover:text-red-600"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {cart.length === 0 ? (
          /* Empty cart */
          <section className="rounded-3xl border border-black/10 bg-white p-10 text-center dark:border-white/10 dark:bg-[#111] sm:p-16">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#f6f0e3] dark:bg-[#211b10]">
              <ShoppingCart
                size={42}
                className="text-[#b18437]"
              />
            </div>

            <h2 className="mt-7 text-2xl font-black">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/50 dark:text-white/50">
              Looks like you haven't added anything to your cart
              yet. Explore our products and find something you
              love.
            </p>

            <Link
              href="/dashboard"
              className="mx-auto mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-[#b18437] px-7 text-sm font-bold text-white hover:bg-[#9b742e]"
            >
              Continue Shopping
              <ArrowRight size={18} />
            </Link>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Cart items */}
            <div className="space-y-4">
              {cart.map((item) => {
                const itemTotal = item.price * item.quantity;
                const itemDiscount =
                  item.originalPrice - item.price;

                return (
                  <article
                    key={item.id}
                    className="rounded-3xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-[#111] sm:p-5"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row">
                      {/* Image */}
                      <Link
                        href={`/products/${item.id}`}
                        className="flex h-48 shrink-0 items-center justify-center rounded-2xl bg-[#f7f5ef] p-5 dark:bg-white/5 sm:h-40 sm:w-40"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#a47b32]">
                              PrimeCart
                            </p>

                            <Link
                              href={`/products/${item.id}`}
                              className="line-clamp-2 text-lg font-bold hover:text-[#b18437]"
                            >
                              {item.name}
                            </Link>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="shrink-0 rounded-xl p-2 text-black/40 hover:bg-red-50 hover:text-red-500 dark:text-white/40 dark:hover:bg-red-900/20"
                            aria-label="Remove product"
                          >
                            <Trash2 size={19} />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xl font-black">
                            {formatPrice(item.price)}
                          </span>

                          <span className="text-sm text-black/40 line-through dark:text-white/40">
                            {formatPrice(item.originalPrice)}
                          </span>

                          <span className="text-xs font-bold text-green-600">
                            {Math.round(
                              (itemDiscount /
                                item.originalPrice) *
                                100
                            )}
                            % off
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                          <Truck size={14} />
                          Free delivery
                        </div>

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-5">
                          {/* Quantity */}
                          <div className="flex h-10 items-center rounded-xl border border-black/10 dark:border-white/10">
                            <button
                              onClick={() =>
                                decreaseQuantity(item.id)
                              }
                              className="px-3 hover:text-[#b18437]"
                            >
                              <Minus size={15} />
                            </button>

                            <span className="w-8 text-center text-sm font-bold">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                increaseQuantity(item.id)
                              }
                              disabled={
                                item.quantity >= item.stock
                              }
                              className="px-3 hover:text-[#b18437] disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Plus size={15} />
                            </button>
                          </div>

                          {/* Wishlist */}
                          <button className="flex items-center gap-2 text-xs font-semibold text-black/50 hover:text-[#b18437] dark:text-white/50">
                            <Heart size={16} />
                            Move to Wishlist
                          </button>

                          <span className="ml-auto text-lg font-black">
                            {formatPrice(itemTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* Continue shopping */}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#9a742f] hover:text-[#b18437]"
              >
                <ArrowLeft size={17} />
                Continue Shopping
              </Link>
            </div>

            {/* Summary */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#111]">
                <h2 className="text-xl font-black">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black/55 dark:text-white/55">
                      Price ({totalItems} items)
                    </span>

                    <span className="font-semibold">
                      {formatPrice(originalTotal)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-black/55 dark:text-white/55">
                      Discount
                    </span>

                    <span className="font-semibold text-green-600">
                      − {formatPrice(discount)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-black/55 dark:text-white/55">
                      Delivery
                    </span>

                    {deliveryCharge === 0 ? (
                      <span className="font-semibold text-green-600">
                        FREE
                      </span>
                    ) : (
                      <span className="font-semibold">
                        {formatPrice(deliveryCharge)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="my-6 border-t border-black/10 dark:border-white/10" />

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">
                    Total Amount
                  </span>

                  <span className="text-2xl font-black">
                    {formatPrice(total)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-xs font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    You are saving {formatPrice(discount)} on
                    this order!
                  </div>
                )}

                <button
                  onClick={() => {
                    window.location.href = "/checkout";
                  }}
                  className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#b18437] font-bold text-white hover:bg-[#9b742e]"
                >
                  Proceed to Checkout
                  <ArrowRight size={19} />
                </button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-black/55 dark:text-white/55">
                    <ShieldCheck
                      size={18}
                      className="text-[#b18437]"
                    />
                    Secure and encrypted payments
                  </div>

                  <div className="flex items-center gap-3 text-xs text-black/55 dark:text-white/55">
                    <Truck
                      size={18}
                      className="text-[#b18437]"
                    />
                    Fast and reliable delivery
                  </div>

                  <div className="flex items-center gap-3 text-xs text-black/55 dark:text-white/55">
                    <PackageCheck
                      size={18}
                      className="text-[#b18437]"
                    />
                    Easy 7-day returns
                  </div>
                </div>
              </div>

              {/* Free delivery card */}
              {subtotal < 999 && subtotal > 0 && (
                <div className="mt-4 rounded-2xl border border-[#d8b66a]/30 bg-[#fbf5e7] p-4 dark:bg-[#211b10]">
                  <p className="text-sm font-bold">
                    Add{" "}
                    {formatPrice(999 - subtotal)} more
                  </p>

                  <p className="mt-1 text-xs text-black/55 dark:text-white/55">
                    to unlock FREE delivery.
                  </p>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#b18437]"
                      style={{
                        width: `${Math.min(
                          (subtotal / 999) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {subtotal >= 999 && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <Check size={18} />
                  You unlocked FREE delivery!
                </div>
              )}
            </aside>
          </div>
        )}
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
