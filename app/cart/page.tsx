"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  Truck,
  Tag,
} from "lucide-react";

type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

const CART_KEY = "primecart-cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Unable to load cart:", error);
      setCart([]);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, loaded]);

  function increaseQuantity(id: string) {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(id: string) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(id: string) {
    setCart((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function clearCart() {
    setCart([]);
  }

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0
    );
  }, [cart]);

  const deliveryCharge = subtotal >= 999 || subtotal === 0 ? 0 : 49;

  const discount = subtotal >= 5000 ? Math.round(subtotal * 0.05) : 0;

  const total = subtotal + deliveryCharge - discount;

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading cart...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top Bar */}
      <div className="bg-gray-950 px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        Free delivery on orders above ₹999
      </div>

      {/* Navbar */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold"
          >
            <span className="rounded-xl bg-black px-3 py-2 text-white">
              P
            </span>

            <span>PrimeCart</span>
          </Link>

          <Link
            href="/products"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            Continue Shopping
          </Link>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* Heading */}
        <div className="mb-8">
          <Link
            href="/products"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
          >
            <ArrowLeft size={17} />
            Continue Shopping
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                PrimeCart
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Your Cart
              </h1>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="w-fit text-sm font-medium text-red-500 hover:text-red-700"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {/* Empty Cart */}
        {cart.length === 0 ? (
          <div className="rounded-3xl border bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <ShoppingBag
                size={34}
                className="text-gray-400"
              />
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              Looks like you haven't added anything to your cart yet.
              Start shopping and find something you love.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-black px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <ShoppingBag size={18} />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Cart Items */}
            <section className="space-y-4">
              {cart.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link
                      href={`/products/${item.slug}`}
                      className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-36 sm:w-36"
                    >
                      <img
                        src={
                          item.image_url ||
                          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80"
                        }
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.slug}`}
                        className="line-clamp-2 text-base font-semibold hover:underline sm:text-lg"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-2 text-lg font-bold">
                        ₹
                        {Number(item.price).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        {/* Quantity */}
                        <div className="flex h-10 items-center overflow-hidden rounded-lg border">
                          <button
                            onClick={() =>
                              decreaseQuantity(item.id)
                            }
                            className="flex h-full w-9 items-center justify-center hover:bg-gray-100"
                          >
                            <Minus size={15} />
                          </button>

                          <span className="flex w-10 justify-center text-sm font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              increaseQuantity(item.id)
                            }
                            className="flex h-full w-9 items-center justify-center hover:bg-gray-100"
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="mt-4 flex justify-between border-t pt-4 text-sm">
                    <span className="text-gray-500">
                      Item Total
                    </span>

                    <span className="font-semibold">
                      ₹
                      {(
                        Number(item.price) * item.quantity
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                </article>
              ))}

              {/* Benefits */}
              <div className="grid gap-3 pt-2 sm:grid-cols-3">
                <div className="rounded-2xl border bg-white p-4">
                  <Truck size={21} />

                  <p className="mt-3 text-sm font-semibold">
                    Fast Delivery
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Quick doorstep delivery
                  </p>
                </div>

                <div className="rounded-2xl border bg-white p-4">
                  <ShieldCheck size={21} />

                  <p className="mt-3 text-sm font-semibold">
                    Secure Payment
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Safe & secure checkout
                  </p>
                </div>

                <div className="rounded-2xl border bg-white p-4">
                  <Tag size={21} />

                  <p className="mt-3 text-sm font-semibold">
                    Best Deals
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Great prices every day
                  </p>
                </div>
              </div>
            </section>

            {/* Order Summary */}
            <aside className="lg:sticky lg:top-6 lg:h-fit">
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Subtotal
                    </span>

                    <span className="font-medium">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Delivery
                    </span>

                    {deliveryCharge === 0 ? (
                      <span className="font-semibold text-green-600">
                        FREE
                      </span>
                    ) : (
                      <span className="font-medium">
                        ₹{deliveryCharge}
                      </span>
                    )}
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>5% Discount</span>

                      <span className="font-semibold">
                        -₹{discount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="my-6 border-t" />

                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">
                    Total
                  </span>

                  <span className="text-2xl font-bold">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Free Delivery Message */}
                {subtotal < 999 && (
                  <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                    Add{" "}
                    <span className="font-bold text-black">
                      ₹
                      {(999 - subtotal).toLocaleString(
                        "en-IN"
                      )}
                    </span>{" "}
                    more to get free delivery.
                  </div>
                )}

                {subtotal >= 5000 && (
                  <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                    🎉 You unlocked an extra 5% discount!
                  </div>
                )}

                {/* Checkout */}
                <Link
                  href="/checkout"
                  className="mt-6 flex w-full items-center justify-center rounded-xl bg-black py-4 text-sm font-bold text-white transition hover:bg-gray-800"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/products"
                  className="mt-3 flex w-full items-center justify-center rounded-xl border py-3.5 text-sm font-semibold hover:bg-gray-50"
                >
                  Continue Shopping
                </Link>

                <p className="mt-5 text-center text-xs leading-5 text-gray-400">
                  Your payment information is encrypted and
                  securely processed.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col justify-between gap-4 text-sm text-gray-500 sm:flex-row">
            <p>
              © {new Date().getFullYear()} PrimeCart. All rights
              reserved.
            </p>

            <div className="flex gap-5">
              <Link
                href="/"
                className="hover:text-black"
              >
                Home
              </Link>

              <Link
                href="/products"
                className="hover:text-black"
              >
                Products
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
