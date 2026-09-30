"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-[#fffdf9]">
      <div className="flex flex-col items-center justify-center">
        
        {/* Logo */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#ead9b5]" />

          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#c79a3b]" />

          <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(199,154,59,0.15)]">
            <Image
              src="/logo.png"
              alt="PrimeCart"
              width={44}
              height={44}
              priority
              className="h-10 w-10 object-contain"
            />
          </div>
        </div>

        {/* Text */}
        <p className="mt-5 text-[12px] font-semibold tracking-[0.08em] text-[#8b6a2d]">
          Opening PrimeCart...
        </p>

        {/* Small progress line */}
        <div className="mt-3 h-[3px] w-28 overflow-hidden rounded-full bg-[#eee7d9]">
          <div className="h-full w-1/2 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-[#c79a3b]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </main>
  );
}
