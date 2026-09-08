"use client";

import {
  ArrowLeft,
  Heart,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { useState } from "react";

const products = [
  {
    name: "Smartphone Pro Max",
    brand: "Samsung",
    category: "Electronics",
    price: 49999,
    oldPrice: 59999,
    rating: 4.6,
    reviews: 245,
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Wireless Bluetooth Headphones",
    brand: "Sony",
    category: "Electronics",
    price: 1999,
    oldPrice: 2999,
    rating: 4.5,
    reviews: 120,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Classic Denim Jacket",
    brand: "Levis",
    category: "Fashion",
    price: 1499,
    oldPrice: 2499,
    rating: 4.4,
    reviews: 89,
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Luxury Face Serum",
    brand: "GlowCare",
    category: "Beauty",
    price: 899,
    oldPrice: 1299,
    rating: 4.5,
    reviews: 76,
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Modern Coffee Maker",
    brand: "Philips",
    category: "Home & Kitchen",
    price: 3499,
    oldPrice: 4999,
    rating: 4.3,
    reviews: 54,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Running Sports Shoes",
    brand: "Nike",
    category: "Sports",
    price: 2299,
    oldPrice: 3499,
    rating: 4.7,
    reviews: 198,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "The Power of Habits",
    brand: "Penguin",
    category: "Books",
    price: 499,
    oldPrice: 699,
    rating: 4.6,
    reviews: 312,
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Premium Smart Watch",
    brand: "Noise",
    category: "Electronics",
    price: 2999,
    oldPrice: 4999,
    rating: 4.4,
    reviews: 167,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
  },
];

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Beauty",
  "Home & Kitchen",
  "Sports",
  "Books",
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.brand.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const toggleWishlist = (name: string) => {
    setWishlist((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <ShoppingCart size={21} />
            </div>

            <span className="text-xl font-black tracking-tight">
              Prime<span className="text-blue-600">Cart</span>
            </span>
          </a>

          <div className="relative hidden flex-1 md:block">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100">
              <Heart size={21} />
            </button>

            <button className="relative rounded-xl p-2.5 text-slate-600 hover:bg-slate-100">
              <ShoppingCart size={21} />
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                0
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Page heading */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <a
            href="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to home
          </a>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                PrimeCart Store
              </p>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                All Products
              </h1>

              <p className="mt-3 text-sm text-slate-500">
                Discover products picked for your everyday needs.
              </p>
            </div>

            <div className="text-sm text-slate-500">
              <span className="font-bold text-slate-900">
                {filteredProducts.length}
              </span>{" "}
              products
            </div>
          </div>
        </div>
      </section>

      {/* Mobile search */}
      <div className="bg-white px-4 py-4 md:hidden">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <SlidersHorizontal size={17} />
                <h2 className="font-bold">Categories</h2>
              </div>

              <div className="mt-4 space-y-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                      selectedCategory === category
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <div>
            {/* Category pills */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${
                    selectedCategory === category
                      ? "bg-slate-950 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
                <Search className="mx-auto text-slate-300" size={40} />

                <h2 className="mt-4 text-lg font-bold">
                  No products found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Try another search or category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <article
                    key={product.name}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold shadow-sm">
                        {product.category}
                      </span>

                      <button
                        onClick={() => toggleWishlist(product.name)}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md"
                      >
                        <Heart
                          size={17}
                          className={
                            wishlist.includes(product.name)
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

                      <h2 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-bold leading-5">
                        {product.name}
                      </h2>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="flex items-center gap-1 rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                          <Star size={10} className="fill-current" />
                          {product.rating}
                        </span>

                        <span className="text-[10px] text-slate-400">
                          ({product.reviews})
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-base font-black">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>

                        <span className="text-xs text-slate-400 line-through">
                          ₹{product.oldPrice.toLocaleString("en-IN")}
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
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
