"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  Loader2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Category = {
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  brand: string | null;
  rating: number | null;
  reviews_count: number | null;
  stock: number | null;
  category_id: string | null;
  categories: Category | Category[] | null;
};

export default function ProductsPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [wishlist, setWishlist] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        price,
        original_price,
        image_url,
        brand,
        rating,
        reviews_count,
        stock,
        category_id,
        categories (
          name,
          slug
        )
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError(error.message);
      setProducts([]);
    } else {
      setProducts((data as Product[]) || []);
    }

    setLoading(false);
  }

  async function fetchCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("name, slug")
      .order("name", { ascending: true });

    if (!error && data) {
      setCategories(data);
    }
  }

  function toggleWishlist(id: string) {
    setWishlist((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryData = Array.isArray(product.categories)
        ? product.categories[0]
        : product.categories;

      const categoryName = categoryData?.name || "";

      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.brand || "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        categoryName.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  function getDiscount(product: Product) {
    if (
      !product.original_price ||
      product.original_price <= product.price
    ) {
      return 0;
    }

    return Math.round(
      ((product.original_price - product.price) /
        product.original_price) *
        100
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top Bar */}
      <div className="bg-gray-950 px-4 py-2 text-center text-sm text-white">
        Free delivery on orders above ₹999
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl"
          >
            <span className="rounded-xl bg-black px-3 py-2 text-white">
              P
            </span>
            <span>PrimeCart</span>
          </Link>

          {/* Search */}
          <div className="hidden flex-1 md:block">
            <div className="relative mx-auto max-w-2xl">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products or brands..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 outline-none transition focus:border-black focus:bg-white"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              className="relative rounded-full p-3 hover:bg-gray-100"
              aria-label="Wishlist"
            >
              <Heart size={21} />
              {wishlist.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs text-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              className="rounded-full p-3 hover:bg-gray-100"
              aria-label="Cart"
            >
              <ShoppingCart size={21} />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-4 md:hidden">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border bg-gray-50 py-3 pl-11 pr-4 outline-none focus:border-black"
            />
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Heading */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
                PrimeCart Store
              </p>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                All Products
              </h1>

              <p className="mt-2 text-gray-500">
                Discover products you'll love.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <SlidersHorizontal size={17} />
              {filteredProducts.length} products
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                selectedCategory === "All"
                  ? "bg-black text-white"
                  : "border bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => setSelectedCategory(category.name)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                  selectedCategory === category.name
                    ? "bg-black text-white"
                    : "border bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="flex items-center gap-3 text-gray-500">
              <Loader2 className="animate-spin" size={24} />
              Loading products...
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="font-semibold text-red-700">
              Unable to load products
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={fetchProducts}
              className="mt-5 rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Products */}
        {!loading && !error && (
          <>
            {filteredProducts.length === 0 ? (
              <div className="rounded-3xl border bg-white p-16 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Search size={28} className="text-gray-400" />
                </div>

                <h2 className="text-xl font-semibold">
                  No products found
                </h2>

                <p className="mt-2 text-gray-500">
                  Try another search or category.
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                  }}
                  className="mt-5 rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => {
                  const discount = getDiscount(product);

                  const isWishlisted = wishlist.includes(product.id);

                  const categoryData = Array.isArray(product.categories)
                    ? product.categories[0]
                    : product.categories;

                  return (
                    <article
                      key={product.id}
                      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <Link href={`/products/${product.slug}`}>
                          <img
                            src={
                              product.image_url ||
                              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
                            }
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </Link>

                        {discount > 0 && (
                          <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                            {discount}% OFF
                          </span>
                        )}

                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition ${
                            isWishlisted
                              ? "text-red-500"
                              : "text-gray-700 hover:text-red-500"
                          }`}
                          aria-label="Add to wishlist"
                        >
                          <Heart
                            size={19}
                            fill={isWishlisted ? "currentColor" : "none"}
                          />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                          {categoryData?.name || "Product"}
                        </p>

                        <Link href={`/products/${product.slug}`}>
                          <h2 className="line-clamp-2 min-h-[48px] text-sm font-semibold text-gray-900 hover:underline sm:text-base">
                            {product.name}
                          </h2>
                        </Link>

                        {product.brand && (
                          <p className="mt-1 text-xs text-gray-500">
                            {product.brand}
                          </p>
                        )}

                        {/* Rating */}
                        <div className="mt-3 flex items-center gap-1">
                          <div className="flex items-center gap-0.5 rounded bg-green-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                            <span>
                              {(product.rating || 0).toFixed(1)}
                            </span>
                            <Star size={11} fill="currentColor" />
                          </div>

                          <span className="text-xs text-gray-400">
                            ({product.reviews_count || 0})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-lg font-bold">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </span>

                          {product.original_price &&
                            product.original_price > product.price && (
                              <span className="text-sm text-gray-400 line-through">
                                ₹
                                {Number(
                                  product.original_price
                                ).toLocaleString("en-IN")}
                              </span>
                            )}
                        </div>

                        {/* Stock */}
                        <p
                          className={`mt-2 text-xs font-medium ${
                            product.stock && product.stock > 0
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {product.stock && product.stock > 0
                            ? product.stock < 10
                              ? `Only ${product.stock} left`
                              : "In Stock"
                            : "Out of Stock"}
                        </p>

                        <Link
                          href={`/products/${product.slug}`}
                          className="mt-4 block w-full rounded-xl bg-black py-2.5 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                          View Product
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row">
            <div>
              <div className="text-xl font-bold">PrimeCart</div>
              <p className="mt-2 text-sm text-gray-500">
                Shop smarter. Live better.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} PrimeCart. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
