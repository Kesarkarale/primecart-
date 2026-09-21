"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function OrderSuccessPage() {
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("order");

    if (id) {
      setOrderId(id);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#faf8f3] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-3xl border border-[#eadfc9] bg-white shadow-[0_20px_70px_rgba(70,50,20,0.10)]">

          {/* Top Gold Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#fff9eb] via-[#fffdf8] to-[#f7edd8] px-6 py-12 text-center sm:px-10">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#b9975b]/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-[#b9975b]/10 blur-2xl" />

            <div className="relative mx-auto flex h-24 w-24 animate-[scale-in_0.5s_ease-out] items-center justify-center rounded-full bg-[#b9975b]/15">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#b9975b] text-white shadow-lg">
                <CheckCircle2 size={38} strokeWidth={2.2} />
              </div>
            </div>

            <div className="relative mt-7">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#eadfc9] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#977538]">
                <Sparkles size={14} />
                Order Confirmed
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[#17130d] sm:text-4xl">
                Thank you for your order!
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#756b5c] sm:text-base">
                Your order has been successfully placed. We’ll keep you updated
                about your delivery.
              </p>

              {orderId && (
                <div className="mx-auto mt-6 w-fit rounded-2xl border border-[#eadfc9] bg-white px-5 py-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b8172]">
                    Order ID
                  </p>

                  <p className="mt-1 font-mono text-sm font-bold text-[#17130d]">
                    #{orderId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-[#eadfc9] px-6 py-8 sm:px-10">
            <div className="grid gap-4 sm:grid-cols-2">

              <Link
                href="/dashboard/orders"
                className="group flex items-center justify-between rounded-2xl border border-[#eadfc9] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#b9975b] hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f8f1e4] text-[#977538]">
                    <Package size={23} />
                  </div>

                  <div>
                    <p className="font-bold text-[#17130d]">
                      View My Orders
                    </p>
                    <p className="mt-1 text-xs text-[#81786b]">
                      Track your recent orders
                    </p>
                  </div>
                </div>

                <ArrowRight
                  size={20}
                  className="text-[#b9975b] transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/dashboard/products"
                className="group flex items-center justify-between rounded-2xl bg-[#17130d] p-5 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#2a241b] hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#d5b878]">
                    <ShoppingBag size={23} />
                  </div>

                  <div>
                    <p className="font-bold">Continue Shopping</p>
                    <p className="mt-1 text-xs text-white/60">
                      Discover more products
                    </p>
                  </div>
                </div>

                <ArrowRight
                  size={20}
                  className="text-[#d5b878] transition-transform group-hover:translate-x-1"
                />
              </Link>

            </div>

            <div className="mt-7 text-center">
              <p className="text-xs text-[#8b8172]">
                Thank you for shopping with{" "}
                <span className="font-bold text-[#977538]">
                  PrimeCart
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </main>
  );
}
