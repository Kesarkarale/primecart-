"use client";

import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Headphones,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  User,
  X,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

const categories = [
  {
    name: "Electronics",
    subtitle: "Latest gadgets",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Fashion",
    subtitle: "Style for everyone",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Beauty",
    subtitle: "Beauty essentials",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Home & Kitchen",
    subtitle: "Make life easier",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Sports",
    subtitle: "Move your way",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Books",
    subtitle: "Explore new worlds",
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80",
  },
];

const products = [
  {
    name: "Smartphone Pro Max",
    brand: "Samsung",
    price: "₹49,999",
    oldPrice: "₹59,999",
    rating: "4.6",
    reviews: "245",
    badge: "Featured",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Wireless Bluetooth Headphones",
    brand: "Sony",
    price: "₹1,999",
    oldPrice: "₹2,999",
    rating: "4.5",
    reviews: "120",
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Classic Denim Jacket",
    brand: "Levis",
    price: "₹1,499",
    oldPrice: "₹2,499",
    rating: "4.4",
    reviews: "89",
    badge: "Trending",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Luxury Face Serum",
    brand: "GlowCare",
    price: "₹899",
    oldPrice: "₹1,299",
    rating: "4.5",
    reviews: "76",
    badge: "Sale",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const toggleWishlist = (index: number) => {
    setWishlist((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Top announcement bar */}
      <div className="bg-slate-950 px-4 py-2.5 text-center text-sm text-white">
        <span className="font-medium">Free shipping</span> on orders above ₹999
        <span className="mx-2 text-slate-500">•</span>
        Easy returns within 7 days
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a href="#" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg">
              <ShoppingCart size={21} strokeWidth={2.3} />
            </div>

            <div>
              <div className="text-xl font-black tracking-tight">
                Prime<span className="text-blue-600">Cart</span>
              </div>
              <div className="hidden text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:block">
                Shop smarter
              </div>
            </div>
          </a>

          {/* Desktop search */}
          <div className="hidden flex-1 md:block">
            <div className="relative mx-auto max-w-xl">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search products, brands and more..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button className="hidden rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:block">
              <Heart size={21} />
            </button>

            <button className="hidden rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:block">
              <User size={21} />
            </button>

            <button className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
              <ShoppingCart size={22} />
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                0
              </span>
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-xl p-2.5 text-slate-700 hover:bg-slate-100 md:hidden"
            >
              {menuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden border-t border-slate-100 md:block">
          <div className="mx-auto flex h-12 max-w-7xl items-center justify-center gap-8 px-6 text-sm font-semibold">
            <a href="#" className="text-blue-600">
              Home
            </a>
            <a href="#categories" className="text-slate-600 hover:text-blue-600">
              Categories
            </a>
            <a href="#featured" className="text-slate-600 hover:text-blue-600">
              Featured
            </a>
            <a href="#deals" className="text-slate-600 hover:text-blue-600">
              Deals
            </a>
            <a href="#services" className="text-slate-600 hover:text-blue-600">
              Why PrimeCart
            </a>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-5 md:hidden">
            <div className="mb-4 flex items-center rounded-xl bg-slate-50 px-3">
              <Search size={18} className="text-slate-400" />
              <input
                className="h-11 flex-1 bg-transparent px-3 text-sm outline-none"
                placeholder="Search products..."
              />
            </div>

            <div className="space-y-1">
              {["Home", "Categories", "Featured", "Deals", "Why PrimeCart"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item === "Home" ? "" : item.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {item}
                  </a>
                )
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="mx-auto grid min-h-[570px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-blue-200 backdrop-blur">
              <Sparkles size={14} />
              Your everyday shopping destination
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[1.03] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Everything you need.
              <span className="block text-blue-400">All in one cart.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Discover quality products across electronics, fashion, beauty,
              home, sports and more — all at prices you'll love.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#featured"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-xl shadow-blue-950/30 transition hover:bg-blue-500"
              >
                Shop now
                <ArrowRight size={18} />
              </a>

              <a
                href="#categories"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Explore categories
                <ChevronRight size={17} />
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-blue-400" />
                Secure payments
              </span>
              <span className="flex items-center gap-2">
                <Truck size={15} className="text-blue-400" />
                Fast delivery
              </span>
              <span className="flex items-center gap-2">
                <Headphones size={15} className="text-blue-400" />
                Customer support
              </span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden h-[480px] lg:block">
            <div className="absolute right-0 top-1/2 h-[430px] w-[430px] -translate-y-1/2 rounded-full bg-blue-600/20 blur-3xl" />

            <div className="absolute right-4 top-1/2 w-[390px] -translate-y-1/2 rotate-3 overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur">
              <img
                src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1000&q=85"
                alt="PrimeCart shopping"
                className="h-[405px] w-full rounded-[1.5rem] object-cover"
              />
            </div>

            <div className="absolute bottom-12 left-2 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-300">Happy shoppers</p>
                  <p className="text-lg font-bold text-white">10K+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="services" className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-100 sm:grid-cols-4">
          {[
            {
              icon: Truck,
              title: "Free Delivery",
              text: "On orders ₹999+",
            },
            {
              icon: ShieldCheck,
              title: "Secure Payment",
              text: "100% protected",
            },
            {
              icon: Clock3,
              title: "Easy Returns",
              text: "7-day returns",
            },
            {
              icon: Headphones,
              title: "24/7 Support",
              text: "We're here to help",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-3 px-4 py-6 sm:px-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={19} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 sm:text-sm">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Shop by category
              </p>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Find what you love
              </h2>
            </div>

            <a
              href="#categories"
              className="hidden items-center gap-1 text-sm font-bold text-blue-600 sm:flex"
            >
              View all
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <a
                href="#featured"
                key={category.name}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {category.subtitle}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section id="featured" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Handpicked for you
              </p>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Featured products
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Popular picks worth adding to your cart.
              </p>
            </div>

            <button className="hidden items-center gap-1 text-sm font-bold text-blue-600 sm:flex">
              View all
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product, index) => (
              <article
                key={product.name}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow-sm">
                    {product.badge}
                  </span>

                  <button
                    onClick={() => toggleWishlist(index)}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105"
                  >
                    <Heart
                      size={17}
                      className={
                        wishlist.includes(index)
                          ? "fill-red-500 text-red-500"
                          : "text-slate-600"
                      }
                    />
                  </button>
                </div>

                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {product.brand}
                  </p>

                  <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-bold leading-5 text-slate-900">
                    {product.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex items-center gap-1 rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                      <Star size={10} className="fill-current" />
                      {product.rating}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-base font-black text-slate-950">
                      {product.price}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      {product.oldPrice}
                    </span>
                  </div>

                  <button className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-xs font-bold text-white transition hover:bg-blue-600">
                    <ShoppingCart size={15} />
                    Add to cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Deal banner */}
      <section id="deals" className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-blue-600">
          <div className="grid items-center gap-8 px-7 py-12 sm:px-12 lg:grid-cols-2 lg:px-16 lg:py-14">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white">
                <Sparkles size={14} />
                Limited time offer
              </div>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Big savings.
                <br />
                Better shopping.
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6 text-blue-100">
                Grab exciting deals across your favourite categories before
                they're gone.
              </p>

              <button className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-blue-700 transition hover:bg-blue-50">
                Shop deals
                <ArrowRight size={17} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                ["50%", "OFF"],
                ["40%", "OFF"],
                ["30%", "OFF"],
              ].map(([number, label]) => (
                <div
                  key={number}
                  className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/10"
                >
                  <span className="text-3xl font-black text-white sm:text-4xl">
                    {number}
                  </span>
                  <span className="mt-1 text-xs font-bold text-blue-100">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
                  <ShoppingCart size={19} />
                </div>
                <span className="text-xl font-black">
                  Prime<span className="text-blue-400">Cart</span>
                </span>
              </div>

              <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
                A smarter way to shop your everyday essentials, favourites and
                everything in between.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold">Shop</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-400">
                <a href="#categories" className="block hover:text-white">
                  Categories
                </a>
                <a href="#featured" className="block hover:text-white">
                  Featured products
                </a>
                <a href="#deals" className="block hover:text-white">
                  Deals
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold">Help</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-400">
                <a href="#" className="block hover:text-white">
                  Contact us
                </a>
                <a href="#" className="block hover:text-white">
                  Shipping
                </a>
                <a href="#" className="block hover:text-white">
                  Returns
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold">PrimeCart</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-400">
                <a href="#" className="block hover:text-white">
                  About us
                </a>
                <a href="#" className="block hover:text-white">
                  Privacy policy
                </a>
                <a href="#" className="block hover:text-white">
                  Terms & conditions
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-7 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} PrimeCart. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
