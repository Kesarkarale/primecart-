"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Crown,
  Heart,
  Layers3,
  Plus,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  Wallet,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  image_url: string | null;
  brand: string | null;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_flash_sale: boolean;
  is_active: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

const budgetOptions = [
  { label: "₹2K", value: 2000 },
  { label: "₹5K", value: 5000 },
  { label: "₹10K", value: 10000 },
  { label: "₹20K", value: 20000 },
  { label: "₹50K", value: 50000 },
];

const shoppingGoals = [
  {
    id: "value",
    title: "Maximum Value",
    description: "Best products for every rupee",
    icon: TrendingDown,
  },
  {
    id: "quality",
    title: "Quality First",
    description: "Prioritize ratings and reliability",
    icon: BadgeCheck,
  },
  {
    id: "premium",
    title: "Premium",
    description: "Higher-end products within budget",
    icon: Crown,
  },
  {
    id: "multiple",
    title: "More Products",
    description: "Build a complete shopping cart",
    icon: Layers3,
  },
];

function getImageUrl(value: string | null) {
  if (!value) return null;

  const image = value.trim();

  if (!image) return null;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return image;
  }

  return `/${image}`;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function discountPercent(
  price: number,
  originalPrice: number | null
) {
  if (!originalPrice || originalPrice <= price) return 0;

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100
  );
}

function getProductScore(
  product: Product,
  budget: number,
  goal: string
) {
  const price = Number(product.price);
  const rating = Number(product.rating || 0);
  const reviews = Number(product.reviews_count || 0);

  let score = 0;

  const budgetUsage = price / budget;

  if (budgetUsage <= 0.15) score += 18;
  else if (budgetUsage <= 0.3) score += 25;
  else if (budgetUsage <= 0.5) score += 28;
  else if (budgetUsage <= 0.75) score += 24;
  else if (budgetUsage <= 1) score += 17;
  else score += 4;

  score += Math.round((rating / 5) * 28);

  score += Math.min(15, Math.round(reviews / 15));

  if (product.is_featured) score += 8;
  if (product.is_flash_sale) score += 8;

  const discount = discountPercent(
    price,
    product.original_price
      ? Number(product.original_price)
      : null
  );

  if (goal === "value") {
    score += Math.min(13, discount);
  }

  if (goal === "quality") {
    if (rating >= 4.5) score += 12;
    else if (rating >= 4) score += 7;
  }

  if (goal === "premium") {
    if (price >= budget * 0.4) score += 8;
    if (rating >= 4.5) score += 7;
  }

  if (goal === "multiple") {
    if (price <= budget * 0.25) score += 12;
    else if (price <= budget * 0.4) score += 7;
  }

  if (product.stock <= 0) score -= 30;

  return Math.max(0, Math.min(99, score));
}

export default function BudgetBuilderPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [planReady, setPlanReady] = useState(false);

  const [budget, setBudget] = useState(10000);
  const [customBudget, setCustomBudget] = useState("10000");

  const [goal, setGoal] = useState("value");
  const [categoryId, setCategoryId] = useState("all");

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [cartIds, setCartIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      const [
        productsResult,
        categoriesResult,
        wishlistResult,
      ] = await Promise.all([
        supabase
          .from("products")
          .select(`
            id,
            category_id,
            name,
            slug,
            short_description,
            description,
            price,
            original_price,
            stock,
            image_url,
            brand,
            rating,
            reviews_count,
            is_featured,
            is_flash_sale,
            is_active
          `)
          .eq("is_active", true),

        supabase
          .from("categories")
          .select("id, name, slug")
          .order("name"),

        supabase
          .from("wishlist")
          .select("product_id")
          .eq("user_id", user.id),
      ]);

      setProducts(
        (productsResult.data as Product[]) || []
      );

      setCategories(
        (categoriesResult.data as Category[]) || []
      );

      setWishlist(
        (
          (wishlistResult.data || []) as {
            product_id: string;
          }[]
        ).map((item) => item.product_id)
      );
    } catch (error) {
      console.error("Budget Builder:", error);
    } finally {
      setLoading(false);
    }
  }

  const rankedProducts = useMemo(() => {
    let list = products.filter(
      (product) =>
        product.stock > 0 &&
        Number(product.price) <= budget
    );

    if (categoryId !== "all") {
      list = list.filter(
        (product) =>
          product.category_id === categoryId
      );
    }

    return list
      .map((product) => ({
        ...product,
        score: getProductScore(
          product,
          budget,
          goal
        ),
      }))
      .sort(
        (a, b) => b.score - a.score
      );
  }, [products, budget, goal, categoryId]);

  const autoPlan = useMemo(() => {
    const result: Product[] = [];
    let remaining = budget;

    const limit =
      goal === "multiple"
        ? 6
        : goal === "premium"
        ? 3
        : 4;

    for (const product of rankedProducts) {
      if (result.length >= limit) break;

      const price = Number(product.price);

      if (price <= remaining) {
        result.push(product);
        remaining -= price;
      }
    }

    return result;
  }, [rankedProducts, budget, goal]);

  const activePlanIds =
    selectedProducts.length > 0
      ? selectedProducts
      : autoPlan.map((product) => product.id);

  const planProducts = activePlanIds
    .map((id) =>
      products.find(
        (product) => product.id === id
      )
    )
    .filter(Boolean) as Product[];

  const plannedSpend = planProducts.reduce(
    (total, product) =>
      total + Number(product.price),
    0
  );

  const remainingBudget =
    Math.max(0, budget - plannedSpend);

  const plannedSavings = planProducts.reduce(
    (total, product) => {
      const original = product.original_price
        ? Number(product.original_price)
        : Number(product.price);

      return (
        total +
        Math.max(
          0,
          original - Number(product.price)
        )
      );
    },
    0
  );

  const usage =
    budget > 0
      ? Math.min(
          100,
          Math.round(
            (plannedSpend / budget) * 100
          )
        )
      : 0;

  const selectedCategory = categories.find(
    (category) =>
      category.id === categoryId
  );

  const categoryName =
    selectedCategory?.name || "All Categories";

  function changeBudget(value: number) {
    const safe = Math.max(
      500,
      Math.min(100000, Math.round(value))
    );

    setBudget(safe);
    setCustomBudget(String(safe));
    setPlanReady(false);
    setSelectedProducts([]);
  }

  function handleBudgetInput(value: string) {
    const cleaned = value.replace(
      /[^0-9]/g,
      ""
    );

    setCustomBudget(cleaned);

    const numeric = Number(cleaned);

    if (
      numeric >= 500 &&
      numeric <= 100000
    ) {
      setBudget(numeric);
      setPlanReady(false);
      setSelectedProducts([]);
    }
  }

  async function buildBudgetPlan() {
    setBuilding(true);
    setPlanReady(false);

    await new Promise((resolve) =>
      setTimeout(resolve, 1100)
    );

    setSelectedProducts([]);
    setPlanReady(true);
    setBuilding(false);

    setTimeout(() => {
      document
        .getElementById("smart-plan")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 150);
  }

  function resetBuilder() {
    setBudget(10000);
    setCustomBudget("10000");
    setGoal("value");
    setCategoryId("all");
    setSelectedProducts([]);
    setPlanReady(false);
  }

  function togglePlanProduct(productId: string) {
    setSelectedProducts((current) => {
      if (current.includes(productId)) {
        return current.filter(
          (id) => id !== productId
        );
      }

      const product = products.find(
        (item) => item.id === productId
      );

      if (!product) return current;

      const currentSpend = current.reduce(
        (sum, id) => {
          const item = products.find(
            (productItem) =>
              productItem.id === id
          );

          return (
            sum +
            Number(item?.price || 0)
          );
        },
        0
      );

      if (
        currentSpend +
          Number(product.price) >
        budget
      ) {
        return current;
      }

      return [...current, productId];
    });
  }

  async function toggleWishlist(
    productId: string
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const exists =
      wishlist.includes(productId);

    if (exists) {
      const { error } =
        await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

      if (error) {
        console.error(error);
        return;
      }

      setWishlist((current) =>
        current.filter(
          (id) => id !== productId
        )
      );
    } else {
      const { error } =
        await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: productId,
          });

      if (error) {
        console.error(error);
        return;
      }

      setWishlist((current) => [
        ...current,
        productId,
      ]);
    }
  }

  function getCartItems(): CartItem[] {
    try {
      const saved =
        localStorage.getItem(
          "primecart-cart"
        );

      if (!saved) return [];

      const parsed = JSON.parse(saved);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  function saveCart(items: CartItem[]) {
    localStorage.setItem(
      "primecart-cart",
      JSON.stringify(items)
    );

    window.dispatchEvent(
      new Event("cart-updated")
    );
  }

  function addToCart(product: Product) {
    const items = getCartItems();

    const existing = items.find(
      (item) => item.id === product.id
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url,
        quantity: 1,
      });
    }

    saveCart(items);

    setCartIds((current) =>
      current.includes(product.id)
        ? current
        : [...current, product.id]
    );
  }

  function addEntirePlanToCart() {
    planProducts.forEach((product) => {
      addToCart(product);
    });
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#181818]">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#e9dfcd] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7dece] bg-white text-gray-500 transition hover:border-[#c9a24d] hover:text-[#a17b2f]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a24d] text-white shadow-sm">
                <Wallet size={18} />
              </div>

              <div>
                <h1 className="text-sm font-black sm:text-base">
                  Budget Builder
                </h1>

                <p className="hidden text-[10px] text-gray-400 sm:block">
                  Smart Budget Studio
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/products"
              className="hidden h-10 items-center gap-2 rounded-xl border border-[#e7dece] px-4 text-xs font-bold text-gray-600 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] sm:flex"
            >
              <ShoppingBag size={14} />
              Products
            </Link>

            <Link
              href="/dashboard"
              className="flex h-10 items-center gap-2 rounded-xl bg-[#fff6df] px-4 text-xs font-black text-[#956f27] transition hover:bg-[#f9eac7]"
            >
              Dashboard
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[32px] border border-[#e9ddc6] bg-white shadow-sm">
          <div className="absolute -right-32 -top-44 h-[550px] w-[550px] rounded-full bg-[#f4dfaa]/30 blur-3xl" />

          <div className="absolute -bottom-48 left-1/3 h-[500px] w-[500px] rounded-full bg-[#fff7e5] blur-3xl" />

          <div className="relative grid min-h-[400px] items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-16 lg:py-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#eadfc9] bg-[#fffaf0] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#a17b2f]">
                <Sparkles size={13} />
                PrimeCart Smart Shopping
              </div>

              <h2 className="mt-6 max-w-3xl text-[42px] font-black leading-[1.03] tracking-[-0.04em] sm:text-5xl lg:text-[64px]">
                Build your perfect cart
                <span className="block text-[#b58a32]">
                  without breaking your budget.
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
                Tell PrimeCart how much you want to spend.
                We&apos;ll help you discover products, balance
                your cart and make every rupee count.
              </p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {[
                  "Live budget tracking",
                  "Smart recommendations",
                  "Real PrimeCart products",
                ].map((text) => (
                  <span
                    key={text}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#ebe3d5] bg-[#fffdf9] px-3 py-2 text-[10px] font-bold text-gray-600"
                  >
                    <Check
                      size={13}
                      className="text-[#b58a32]"
                    />
                    {text}
                  </span>
                ))}
              </div>
            </div>

            {/* HERO VISUAL */}
            <div className="mx-auto w-full max-w-[440px]">
              <div className="relative rounded-[30px] border border-[#eadfca] bg-[#fffaf0] p-5 shadow-[0_20px_60px_rgba(120,90,30,0.08)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                      Current Budget
                    </p>

                    <p className="mt-1 text-3xl font-black">
                      {formatPrice(budget)}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c9a24d] text-white">
                    <CircleDollarSign size={21} />
                  </div>
                </div>

                <div className="relative mx-auto mt-7 flex h-44 w-44 items-center justify-center">
                  <svg
                    className="h-full w-full -rotate-90"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="#eadfca"
                      strokeWidth="9"
                    />

                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="#c9a24d"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray="301.6"
                      strokeDashoffset={
                        301.6 -
                        (301.6 * usage) /
                          100
                      }
                    />
                  </svg>

                  <div className="absolute text-center">
                    <p className="text-3xl font-black">
                      {usage}%
                    </p>

                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Allocated
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Planned
                    </p>

                    <p className="mt-1 text-sm font-black">
                      {formatPrice(plannedSpend)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Available
                    </p>

                    <p className="mt-1 text-sm font-black text-emerald-600">
                      {formatPrice(remainingBudget)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STUDIO */}
        <section className="mt-6 rounded-[28px] border border-[#e9dfcd] bg-white shadow-sm">
          <div className="border-b border-[#eee7da] px-5 py-5 sm:px-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5dc] text-[#b58a32]">
                  <Target size={20} />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                    Budget Studio
                  </p>

                  <h3 className="text-lg font-black">
                    Design your shopping plan
                  </h3>
                </div>
              </div>

              <div className="rounded-full bg-[#f7f2e8] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-gray-500">
                Step 1 · Preferences
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {/* BUDGET */}
            <div>
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Your spending limit
                  </p>

                  <h4 className="mt-1 text-xl font-black">
                    How much do you want to spend?
                  </h4>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#a17b2f]">
                    ₹
                  </span>

                  <input
                    value={customBudget}
                    inputMode="numeric"
                    onChange={(e) =>
                      handleBudgetInput(
                        e.target.value
                      )
                    }
                    className="h-12 w-40 rounded-xl border border-[#dfd5c3] bg-[#fffdf9] pl-8 pr-3 text-right text-base font-black outline-none transition focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {budgetOptions.map((item) => {
                  const active =
                    budget === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        changeBudget(
                          item.value
                        )
                      }
                      className={`h-12 rounded-xl border text-xs font-black transition ${
                        active
                          ? "border-[#c9a24d] bg-[#fff7e3] text-[#956f27] shadow-sm"
                          : "border-[#e8e0d2] text-gray-600 hover:border-[#d3b76f] hover:bg-[#fffdf9]"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5">
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={Math.min(
                    budget,
                    50000
                  )}
                  onChange={(e) =>
                    changeBudget(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e9e0d0] accent-[#c9a24d]"
                />

                <div className="mt-2 flex justify-between text-[9px] font-bold text-gray-400">
                  <span>₹500</span>
                  <span>₹50,000+</span>
                </div>
              </div>
            </div>

            {/* GOAL */}
            <div className="mt-10">
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                  Shopping style
                </p>

                <h4 className="mt-1 text-xl font-black">
                  What matters most to you?
                </h4>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {shoppingGoals.map(
                  (item) => {
                    const Icon = item.icon;
                    const active =
                      goal === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setGoal(
                            item.id
                          );
                          setPlanReady(
                            false
                          );
                          setSelectedProducts(
                            []
                          );
                        }}
                        className={`group relative rounded-2xl border p-4 text-left transition duration-200 ${
                          active
                            ? "border-[#c9a24d] bg-[#fffaf0] shadow-sm"
                            : "border-[#e9e2d5] hover:-translate-y-0.5 hover:border-[#d5b76c] hover:shadow-sm"
                        }`}
                      >
                        {active && (
                          <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a24d] text-white">
                            <Check size={11} />
                          </span>
                        )}

                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            active
                              ? "bg-[#c9a24d] text-white"
                              : "bg-[#f8f4ec] text-[#a17b2f]"
                          }`}
                        >
                          <Icon size={18} />
                        </span>

                        <p className="mt-4 text-sm font-black">
                          {item.title}
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-gray-400">
                          {item.description}
                        </p>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* CATEGORY */}
            <div className="mt-10">
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                  Shopping focus
                </p>

                <h4 className="mt-1 text-xl font-black">
                  Where do you want to spend it?
                </h4>
              </div>

              <div className="relative max-w-2xl">
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(
                      e.target.value
                    );
                    setPlanReady(
                      false
                    );
                    setSelectedProducts(
                      []
                    );
                  }}
                  className="h-13 w-full appearance-none rounded-2xl border border-[#e4dbca] bg-[#fffdf9] px-4 pr-11 text-sm font-bold text-gray-700 outline-none transition focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
                >
                  <option value="all">
                    Everything on PrimeCart
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* LIVE SUMMARY */}
            <div className="mt-10 grid overflow-hidden rounded-2xl border border-[#eadfca] bg-[#fffaf0] sm:grid-cols-4">
              <div className="border-b border-[#eadfca] p-4 sm:border-b-0 sm:border-r">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Budget
                </p>

                <p className="mt-1 text-lg font-black">
                  {formatPrice(budget)}
                </p>
              </div>

              <div className="border-b border-[#eadfca] p-4 sm:border-b-0 sm:border-r">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Focus
                </p>

                <p className="mt-1 truncate text-sm font-black">
                  {categoryName}
                </p>
              </div>

              <div className="border-b border-[#eadfca] p-4 sm:border-b-0 sm:border-r">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Goal
                </p>

                <p className="mt-1 text-sm font-black">
                  {
                    shoppingGoals.find(
                      (item) =>
                        item.id ===
                        goal
                    )?.title
                  }
                </p>
              </div>

              <div className="p-4">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Products Found
                </p>

                <p className="mt-1 text-sm font-black">
                  {rankedProducts.length}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#eee7da] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={resetBuilder}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e4dccd] px-5 text-xs font-black text-gray-600 transition hover:bg-[#fffaf0]"
              >
                <RefreshCw size={15} />
                Start Over
              </button>

              <button
                type="button"
                disabled={
                  loading ||
                  building
                }
                onClick={
                  buildBudgetPlan
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-7 text-xs font-black text-white shadow-lg shadow-[#c9a24d]/15 transition hover:bg-[#b48a3d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {building ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Analysing Products...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Build My Smart Plan
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* SMART PLAN */}
        {planReady && (
          <section
            id="smart-plan"
            className="mt-7 scroll-mt-24"
          >
            <div className="overflow-hidden rounded-[28px] border border-[#dfc98e] bg-white shadow-sm">
              <div className="bg-[#fff8e8] px-5 py-6 sm:px-8">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#a17b2f]">
                      <Sparkles size={12} />
                      Smart Plan Ready
                    </div>

                    <h3 className="mt-3 text-2xl font-black sm:text-3xl">
                      Your {formatPrice(budget)} cart
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Optimized for{" "}
                      <span className="font-bold text-gray-700">
                        {categoryName}
                      </span>{" "}
                      with{" "}
                      <span className="font-bold text-gray-700">
                        {
                          shoppingGoals.find(
                            (item) =>
                              item.id ===
                              goal
                          )?.title
                        }
                      </span>
                      .
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      addEntirePlanToCart
                    }
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-6 text-xs font-black text-white shadow-sm transition hover:bg-[#b48a3d]"
                  >
                    <ShoppingCart size={16} />
                    Add Complete Plan
                  </button>
                </div>
              </div>

              {/* PLAN METRICS */}
              <div className="grid grid-cols-2 border-t border-[#eadfca] sm:grid-cols-4">
                <div className="border-b border-[#eadfca] p-5 sm:border-b-0 sm:border-r">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Total Budget
                  </p>

                  <p className="mt-2 text-xl font-black">
                    {formatPrice(budget)}
                  </p>
                </div>

                <div className="border-b border-[#eadfca] p-5 sm:border-b-0 sm:border-r">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Cart Value
                  </p>

                  <p className="mt-2 text-xl font-black">
                    {formatPrice(plannedSpend)}
                  </p>
                </div>

                <div className="border-r border-[#eadfca] p-5">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Remaining
                  </p>

                  <p className="mt-2 text-xl font-black text-emerald-600">
                    {formatPrice(remainingBudget)}
                  </p>
                </div>

                <div className="p-5">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Estimated Savings
                  </p>

                  <p className="mt-2 text-xl font-black text-[#a17b2f]">
                    {formatPrice(plannedSavings)}
                  </p>
                </div>
              </div>

              {/* ALLOCATION */}
              <div className="border-t border-[#eadfca] p-5 sm:p-8">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b58a32]">
                      Budget Allocation
                    </p>

                    <h4 className="mt-1 text-lg font-black">
                      You&apos;re using {usage}% of your budget
                    </h4>
                  </div>

                  <span className="text-sm font-black text-[#956f27]">
                    {formatPrice(remainingBudget)} left
                  </span>
                </div>

                <div className="mt-4 h-4 overflow-hidden rounded-full bg-[#eee5d5]">
                  <div
                    className="h-full rounded-full bg-[#c9a24d] transition-all duration-700"
                    style={{
                      width: `${Math.max(
                        usage,
                        2
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-[9px] font-bold text-gray-400">
                  <span>₹0</span>
                  <span>{formatPrice(budget)}</span>
                </div>
              </div>
            </div>

            {/* PLAN PRODUCTS */}
            <div className="mt-7">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                    Curated for you
                  </p>

                  <h3 className="mt-1 text-2xl font-black">
                    Your Smart Cart
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    A balanced selection based on your budget
                    and shopping goal.
                  </p>
                </div>

                <span className="hidden rounded-full bg-[#fff3d5] px-3 py-1.5 text-[9px] font-black text-[#956f27] sm:block">
                  {planProducts.length} PICKS
                </span>
              </div>

              {planProducts.length === 0 ? (
                <div className="rounded-[24px] border border-[#eadfca] bg-white p-14 text-center">
                  <CircleDollarSign
                    size={38}
                    className="mx-auto text-[#c9a24d]"
                  />

                  <h4 className="mt-4 text-lg font-black">
                    No suitable plan found
                  </h4>

                  <p className="mt-2 text-sm text-gray-500">
                    Try increasing your budget or changing
                    your shopping focus.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {planProducts.map(
                    (product, index) => {
                      const image =
                        getImageUrl(
                          product.image_url
                        );

                      const discount =
                        discountPercent(
                          Number(
                            product.price
                          ),
                          product.original_price
                            ? Number(
                                product.original_price
                              )
                            : null
                        );

                      const added =
                        cartIds.includes(
                          product.id
                        );

                      return (
                        <div
                          key={
                            product.id
                          }
                          className="group flex flex-col gap-4 rounded-[22px] border border-[#e8dfcf] bg-white p-4 transition hover:border-[#d5bb7c] hover:shadow-md sm:flex-row sm:items-center"
                        >
                          <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-[#faf9f6] sm:h-28 sm:w-28">
                            {image ? (
                              <Image
                                src={image}
                                alt={product.name}
                                fill
                                className="object-contain p-3 transition duration-500 group-hover:scale-105"
                                sizes="112px"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-gray-300">
                                <ShoppingBag size={30} />
                              </div>
                            )}

                            <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#181818] text-[9px] font-black text-white">
                              {index + 1}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            {product.brand && (
                              <p className="text-[9px] font-black uppercase tracking-wider text-[#a17b2f]">
                                {product.brand}
                              </p>
                            )}

                            <Link
                              href={`/dashboard/products/${product.id}`}
                            >
                              <h4 className="mt-1 line-clamp-2 text-base font-black transition group-hover:text-[#a17b2f]">
                                {product.name}
                              </h4>
                            </Link>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#fff4d8] px-2 py-1 text-[10px] font-black text-[#956f27]">
                                <Star
                                  size={10}
                                  fill="currentColor"
                                />
                                {Number(
                                  product.rating || 0
                                ).toFixed(1)}
                              </span>

                              <span className="text-[10px] text-gray-400">
                                {product.reviews_count} reviews
                              </span>

                              {product.is_flash_sale && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-500">
                                  <Zap size={10} />
                                  Flash Deal
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                            <div>
                              <p className="text-lg font-black">
                                {formatPrice(
                                  Number(
                                    product.price
                                  )
                                )}
                              </p>

                              {discount > 0 && (
                                <div className="flex items-center gap-2 sm:justify-end">
                                  <span className="text-[10px] text-gray-400 line-through">
                                    {formatPrice(
                                      Number(
                                        product.original_price
                                      )
                                    )}
                                  </span>

                                  <span className="text-[9px] font-black text-emerald-600">
                                    {discount}% OFF
                                  </span>
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                addToCart(
                                  product
                                )
                              }
                              className={`mt-0 inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-[10px] font-black sm:mt-3 ${
                                added
                                  ? "bg-emerald-600 text-white"
                                  : "bg-[#fff3d4] text-[#956f27] hover:bg-[#f6e5bd]"
                              }`}
                            >
                              {added ? (
                                <>
                                  <Check size={13} />
                                  Added
                                </>
                              ) : (
                                <>
                                  <ShoppingCart size={13} />
                                  Add to Cart
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* EXPLORE */}
        <section className="mt-12">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                Explore
              </p>

              <h3 className="mt-1 text-2xl font-black">
                Smart picks within ₹{budget.toLocaleString("en-IN")}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Ranked using price, ratings, reviews, deals and
                your selected goal.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-2 text-xs font-black text-[#956f27]"
            >
              View All Products
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[410px] animate-pulse rounded-[24px] bg-[#ebe6dd]"
                />
              ))}
            </div>
          ) : rankedProducts.length === 0 ? (
            <div className="mt-6 rounded-[24px] border border-[#eadfca] bg-white p-16 text-center">
              <CircleDollarSign
                size={38}
                className="mx-auto text-[#c9a24d]"
              />

              <h4 className="mt-4 text-lg font-black">
                Nothing matches this budget
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                Try increasing your budget or selecting
                another category.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rankedProducts
                .slice(0, 8)
                .map((product) => {
                  const image =
                    getImageUrl(
                      product.image_url
                    );

                  const wished =
                    wishlist.includes(
                      product.id
                    );

                  const selected =
                    activePlanIds.includes(
                      product.id
                    );

                  const added =
                    cartIds.includes(
                      product.id
                    );

                  const discount =
                    discountPercent(
                      Number(
                        product.price
                      ),
                      product.original_price
                        ? Number(
                            product.original_price
                          )
                        : null
                    );

                  return (
                    <article
                      key={product.id}
                      className={`group overflow-hidden rounded-[24px] border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                        selected
                          ? "border-[#c9a24d]"
                          : "border-[#e8dfcf]"
                      }`}
                    >
                      <div className="relative h-60 overflow-hidden bg-[#faf9f6]">
                        {image ? (
                          <Image
                            src={image}
                            alt={product.name}
                            fill
                            className="object-contain p-5 transition duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-300">
                            <ShoppingBag size={40} />
                          </div>
                        )}

                        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#181818] px-3 py-1.5 text-[9px] font-black text-white">
                          <Sparkles size={10} />
                          {product.score}% MATCH
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            toggleWishlist(
                              product.id
                            )
                          }
                          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border bg-white/95 shadow-sm transition ${
                            wished
                              ? "border-red-200 text-red-500"
                              : "border-[#e8dfcf] text-gray-500 hover:text-red-500"
                          }`}
                        >
                          <Heart
                            size={18}
                            fill={
                              wished
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>

                        {discount > 0 && (
                          <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[9px] font-black text-white">
                            {discount}% OFF
                          </span>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <span className="max-w-[70%] truncate text-[9px] font-black uppercase tracking-wider text-[#a17b2f]">
                            {categories.find(
                              (item) =>
                                item.id ===
                                product.category_id
                            )?.name ||
                              "PrimeCart"}
                          </span>

                          {product.is_flash_sale && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-red-500">
                              <Zap size={10} />
                              DEAL
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/dashboard/products/${product.id}`}
                        >
                          <h4 className="mt-2 line-clamp-2 min-h-[42px] text-[15px] font-black leading-5 transition group-hover:text-[#a17b2f]">
                            {product.name}
                          </h4>
                        </Link>

                        {product.brand && (
                          <p className="mt-1 text-[10px] text-gray-400">
                            {product.brand}
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#fff4d8] px-2 py-1 text-[10px] font-black text-[#956f27]">
                            <Star
                              size={10}
                              fill="currentColor"
                            />
                            {Number(
                              product.rating || 0
                            ).toFixed(1)}
                          </span>

                          <span className="text-[10px] text-gray-400">
                            {product.reviews_count} reviews
                          </span>
                        </div>

                        <div className="mt-3 flex items-end gap-2">
                          <span className="text-xl font-black">
                            {formatPrice(
                              Number(
                                product.price
                              )
                            )}
                          </span>

                          {product.original_price &&
                            Number(
                              product.original_price
                            ) >
                              Number(
                                product.price
                              ) && (
                              <span className="mb-0.5 text-[10px] text-gray-400 line-through">
                                {formatPrice(
                                  Number(
                                    product.original_price
                                  )
                                )}
                              </span>
                            )}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              togglePlanProduct(
                                product.id
                              )
                            }
                            className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-[10px] font-black transition ${
                              selected
                                ? "bg-[#c9a24d] text-white"
                                : "border border-[#e4dccd] bg-white text-gray-600 hover:border-[#c9a24d] hover:text-[#956f27]"
                            }`}
                          >
                            {selected ? (
                              <>
                                <Check size={13} />
                                In Plan
                              </>
                            ) : (
                              <>
                                <Plus size={13} />
                                Add to Plan
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              addToCart(
                                product
                              )
                            }
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              added
                                ? "bg-emerald-600 text-white"
                                : "bg-[#fff3d4] text-[#956f27]"
                            }`}
                          >
                            {added ? (
                              <Check size={15} />
                            ) : (
                              <ShoppingCart size={15} />
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          )}
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-14">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b58a32]">
              How it works
            </p>

            <h3 className="mt-2 text-2xl font-black">
              Shopping with a plan
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
              Budget Builder turns a simple spending limit into
              a smarter way to shop.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                number: "01",
                icon: Wallet,
                title: "Set your budget",
                text: "Tell us exactly how much you want to spend.",
              },
              {
                number: "02",
                icon: BarChart3,
                title: "Choose your priorities",
                text: "Tell us whether you care about value, quality, premium products or quantity.",
              },
              {
                number: "03",
                icon: Sparkles,
                title: "Build your cart",
                text: "Explore smart recommendations and create a balanced cart.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.number}
                  className="relative overflow-hidden rounded-[24px] border border-[#e8dfcf] bg-white p-6 shadow-sm"
                >
                  <span className="absolute right-5 top-4 text-4xl font-black text-[#f2eadb]">
                    {item.number}
                  </span>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5dc] text-[#b58a32]">
                    <Icon size={19} />
                  </div>

                  <h4 className="mt-5 text-base font-black">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mt-8 overflow-hidden rounded-[28px] border border-[#dfc98e] bg-[#fff6df]">
          <div className="relative flex flex-col items-center justify-between gap-6 px-6 py-9 text-center sm:px-10 md:flex-row md:text-left">
            <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/40 blur-2xl" />

            <div className="relative">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <Clock3
                  size={15}
                  className="text-[#a17b2f]"
                />

                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#956f27]">
                  Shop smarter
                </span>
              </div>

              <h3 className="mt-2 text-xl font-black sm:text-2xl">
                Your budget should work for you.
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Rebuild your plan anytime as your priorities
                change.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="relative inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#c9a24d] px-5 text-xs font-black text-white transition hover:bg-[#b48a3d]"
            >
              <RefreshCw size={14} />
              Rebuild Plan
            </button>
          </div>
        </section>

        <div className="h-10" />
      </main>
    </div>
  );
}
