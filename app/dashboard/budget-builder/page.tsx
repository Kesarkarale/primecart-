"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Calculator,
  Check,
  ChevronDown,
  CircleDollarSign,
  Heart,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  WalletCards,
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

const BUDGET_PRESETS = [
  {
    label: "₹2,000",
    value: 2000,
  },
  {
    label: "₹5,000",
    value: 5000,
  },
  {
    label: "₹10,000",
    value: 10000,
  },
  {
    label: "₹20,000",
    value: 20000,
  },
  {
    label: "₹50,000",
    value: 50000,
  },
];

const GOALS = [
  {
    id: "essentials",
    title: "Smart Essentials",
    subtitle: "Get the basics without overspending",
    icon: "◈",
  },
  {
    id: "best-value",
    title: "Best Value",
    subtitle: "Maximum value for every rupee",
    icon: "₹",
  },
  {
    id: "premium",
    title: "Premium Picks",
    subtitle: "Spend more where it matters",
    icon: "✦",
  },
  {
    id: "multiple",
    title: "Multiple Products",
    subtitle: "Build a complete shopping list",
    icon: "▦",
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

function getDiscount(
  price: number,
  originalPrice: number | null
) {
  if (!originalPrice || originalPrice <= price) {
    return 0;
  }

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100
  );
}

function getProductScore(
  product: Product,
  goal: string,
  budget: number
) {
  const price = Number(product.price);
  const rating = Number(product.rating || 0);

  let score = 0;

  const budgetRatio = price / budget;

  if (budgetRatio <= 0.2) {
    score += 22;
  } else if (budgetRatio <= 0.4) {
    score += 25;
  } else if (budgetRatio <= 0.65) {
    score += 28;
  } else if (budgetRatio <= 0.85) {
    score += 25;
  } else if (budgetRatio <= 1) {
    score += 18;
  } else {
    score += 5;
  }

  score += Math.round(
    (rating / 5) * 25
  );

  score += Math.min(
    15,
    Math.round(
      (product.reviews_count || 0) / 20
    )
  );

  if (product.is_featured) {
    score += 8;
  }

  if (product.is_flash_sale) {
    score += 8;
  }

  if (goal === "best-value") {
    const discount = getDiscount(
      price,
      product.original_price
        ? Number(product.original_price)
        : null
    );

    score += Math.min(12, discount);
  }

  if (goal === "premium") {
    if (rating >= 4.5) {
      score += 10;
    }

    if (price > budget * 0.35) {
      score += 7;
    }
  }

  if (goal === "essentials") {
    if (price <= budget * 0.35) {
      score += 8;
    }
  }

  if (goal === "multiple") {
    if (price <= budget * 0.3) {
      score += 10;
    }
  }

  if (product.stock <= 0) {
    score -= 30;
  }

  return Math.max(0, Math.min(99, score));
}

export default function BudgetBuilderPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [built, setBuilt] = useState(false);

  const [budget, setBudget] = useState(10000);
  const [customBudget, setCustomBudget] =
    useState("10000");

  const [goal, setGoal] =
    useState("best-value");

  const [category, setCategory] =
    useState("all");

  const [wishlist, setWishlist] =
    useState<string[]>([]);

  const [cart, setCart] = useState<string[]>(
    []
  );

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
        productsResponse,
        categoriesResponse,
        wishlistResponse,
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
          .select(
            "id, name, slug"
          )
          .order("name"),

        supabase
          .from("wishlist")
          .select("product_id")
          .eq("user_id", user.id),
      ]);

      setProducts(
        (productsResponse.data as Product[]) ||
          []
      );

      setCategories(
        (categoriesResponse.data as Category[]) ||
          []
      );

      setWishlist(
        (
          (wishlistResponse.data || []) as {
            product_id: string;
          }[]
        ).map(
          (item) => item.product_id
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const selectedCategory =
    categories.find(
      (item) => item.id === category
    );

  const eligibleProducts = useMemo(() => {
    let list = products.filter(
      (product) =>
        product.stock > 0 &&
        Number(product.price) <= budget
    );

    if (category !== "all") {
      list = list.filter(
        (product) =>
          product.category_id === category
      );
    }

    return list
      .map((product) => ({
        ...product,
        score: getProductScore(
          product,
          goal,
          budget
        ),
      }))
      .sort(
        (a, b) => b.score - a.score
      );
  }, [
    products,
    category,
    goal,
    budget,
  ]);

  const smartPicks = useMemo(() => {
    const picks: Product[] = [];
    let remaining = budget;

    for (const product of eligibleProducts) {
      if (
        picks.length >=
        (goal === "multiple" ? 5 : 4)
      ) {
        break;
      }

      const price = Number(product.price);

      if (price <= remaining) {
        picks.push(product);
        remaining -= price;
      }
    }

    return picks;
  }, [
    eligibleProducts,
    budget,
    goal,
  ]);

  const recommendedProducts =
    useMemo(() => {
      return eligibleProducts.slice(
        0,
        8
      );
    }, [eligibleProducts]);

  const spent = smartPicks.reduce(
    (sum, product) =>
      sum + Number(product.price),
    0
  );

  const remaining =
    budget - spent;

  const savings = smartPicks.reduce(
    (sum, product) => {
      const original =
        product.original_price
          ? Number(
              product.original_price
            )
          : Number(product.price);

      return (
        sum +
        Math.max(
          0,
          original -
            Number(product.price)
        )
      );
    },
    0
  );

  const budgetUsed =
    budget > 0
      ? Math.min(
          100,
          Math.round(
            (spent / budget) * 100
          )
        )
      : 0;

  function updateBudget(
    value: number
  ) {
    const safeValue = Math.max(
      500,
      Math.min(
        100000,
        Math.round(value)
      )
    );

    setBudget(safeValue);
    setCustomBudget(
      String(safeValue)
    );
    setBuilt(false);
  }

  function handleCustomBudget(
    value: string
  ) {
    setCustomBudget(value);

    const numeric =
      Number(
        value.replace(/[^0-9]/g, "")
      );

    if (
      numeric >= 500 &&
      numeric <= 100000
    ) {
      setBudget(numeric);
      setBuilt(false);
    }
  }

  async function buildPlan() {
    setBuilding(true);
    setBuilt(false);

    await new Promise((resolve) =>
      setTimeout(resolve, 1000)
    );

    setBuilt(true);
    setBuilding(false);

    setTimeout(() => {
      document
        .getElementById("plan")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 150);
  }

  function resetBuilder() {
    setBudget(10000);
    setCustomBudget("10000");
    setGoal("best-value");
    setCategory("all");
    setBuilt(false);
  }

  async function toggleWishlist(
    productId: string
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href =
        "/auth/login";
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
          .eq(
            "product_id",
            productId
          );

      if (error) {
        console.error(error);
        return;
      }

      setWishlist((current) =>
        current.filter(
          (id) =>
            id !== productId
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

  function addToCart(
    product: Product
  ) {
    try {
      const saved =
        localStorage.getItem(
          "primecart-cart"
        );

      let items: {
        id: string;
        name: string;
        price: number;
        image_url: string | null;
        quantity: number;
      }[] = [];

      if (saved) {
        try {
          items = JSON.parse(saved);
        } catch {
          items = [];
        }
      }

      const existing =
        items.find(
          (item) =>
            item.id ===
            product.id
        );

      if (existing) {
        existing.quantity += 1;
      } else {
        items.push({
          id: product.id,
          name: product.name,
          price: Number(
            product.price
          ),
          image_url:
            product.image_url,
          quantity: 1,
        });
      }

      localStorage.setItem(
        "primecart-cart",
        JSON.stringify(items)
      );

      setCart((current) =>
        current.includes(product.id)
          ? current
          : [
              ...current,
              product.id,
            ]
      );

      window.dispatchEvent(
        new Event("cart-updated")
      );
    } catch (error) {
      console.error(error);
    }
  }

  function addPlanToCart() {
    smartPicks.forEach(
      (product) => {
        addToCart(product);
      }
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#e8deca] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5dccb] bg-white text-gray-600 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] hover:text-[#9b762b]"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c9a24d] text-white">
                <WalletCards
                  size={17}
                />
              </div>

              <div>
                <h1 className="text-base font-black">
                  Budget Builder
                </h1>

                <p className="hidden text-[10px] text-gray-400 sm:block">
                  Build more. Spend smarter.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/products"
            className="hidden items-center gap-2 rounded-xl border border-[#e5dccb] px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] sm:flex"
          >
            Browse Products
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[30px] border border-[#eadfca] bg-white shadow-sm">
          <div className="absolute -right-40 -top-40 h-[450px] w-[450px] rounded-full bg-[#f5e5b9]/40 blur-3xl" />

          <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#f9f0dd] blur-3xl" />

          <div className="relative grid items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#eadfca] bg-[#fffaf0] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#9b762b]">
                <CircleDollarSign
                  size={13}
                />
                PrimeCart Smart Shopping
              </div>

              <h2 className="mt-5 max-w-2xl text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-[58px]">
                Your budget.
                <span className="block text-[#b58a32]">
                  Your perfect cart.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
                Set a budget and tell us what you want.
                Budget Builder creates a smart shopping plan
                that helps you get more value without losing
                control of your spending.
              </p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-xl border border-[#eee5d5] bg-[#fffdf8] px-3 py-2 text-xs font-bold">
                  <Calculator
                    size={14}
                    className="text-[#c9a24d]"
                  />
                  Smart allocation
                </span>

                <span className="inline-flex items-center gap-2 rounded-xl border border-[#eee5d5] bg-[#fffdf8] px-3 py-2 text-xs font-bold">
                  <TrendingDown
                    size={14}
                    className="text-[#c9a24d]"
                  />
                  Avoid overspending
                </span>

                <span className="inline-flex items-center gap-2 rounded-xl border border-[#eee5d5] bg-[#fffdf8] px-3 py-2 text-xs font-bold">
                  <BadgeCheck
                    size={14}
                    className="text-[#c9a24d]"
                  />
                  Real products
                </span>
              </div>
            </div>

            {/* HERO BUDGET CARD */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="rounded-[28px] border border-[#eadfca] bg-[#fffaf0] p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                      Your Budget
                    </p>

                    <p className="mt-1 text-3xl font-black">
                      {formatPrice(
                        budget
                      )}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c9a24d] text-white">
                    <WalletCards
                      size={21}
                    />
                  </div>
                </div>

                <div className="mt-7">
                  <div className="mb-2 flex justify-between text-[10px] font-bold">
                    <span className="text-gray-400">
                      Smart allocation
                    </span>

                    <span className="text-[#956f27]">
                      {budgetUsed}%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-[#eadfca]">
                    <div
                      className="h-full rounded-full bg-[#c9a24d] transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          budgetUsed,
                          5
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Planned Spend
                    </p>

                    <p className="mt-1 text-sm font-black">
                      {formatPrice(
                        spent
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Left Over
                    </p>

                    <p className="mt-1 text-sm font-black text-emerald-600">
                      {formatPrice(
                        remaining
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BUILDER */}
        <section className="mt-6 overflow-hidden rounded-[26px] border border-[#eadfca] bg-white shadow-sm">
          <div className="border-b border-[#eee6d7] px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff6df] text-[#b58a32]">
                <Calculator size={20} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b58a32]">
                  Build Your Plan
                </p>

                <h3 className="mt-0.5 text-lg font-black">
                  How should we use your budget?
                </h3>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {/* BUDGET */}
            <div>
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <label className="text-sm font-black">
                    01. Set your shopping budget
                  </label>

                  <p className="mt-1 text-xs text-gray-400">
                    Choose a preset or enter your own amount.
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-[#956f27]">
                    ₹
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={customBudget}
                    onChange={(e) =>
                      handleCustomBudget(
                        e.target.value
                      )
                    }
                    className="h-12 w-36 rounded-xl border border-[#dfd5c2] bg-[#fffdf9] pl-8 pr-3 text-right text-sm font-black outline-none focus:border-[#c9a24d] focus:ring-2 focus:ring-[#c9a24d]/10"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                {BUDGET_PRESETS.map(
                  (item) => {
                    const active =
                      budget ===
                      item.value;

                    return (
                      <button
                        key={
                          item.value
                        }
                        type="button"
                        onClick={() =>
                          updateBudget(
                            item.value
                          )
                        }
                        className={`rounded-xl border px-4 py-3.5 text-sm font-black transition ${
                          active
                            ? "border-[#c9a24d] bg-[#fffaf0] text-[#956f27]"
                            : "border-[#e9e1d2] text-gray-600 hover:border-[#d5b76d]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  }
                )}
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
                    updateBudget(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e9dfcb] accent-[#c9a24d]"
                />

                <div className="mt-2 flex justify-between text-[10px] font-bold text-gray-400">
                  <span>₹500</span>
                  <span>₹50,000+</span>
                </div>
              </div>
            </div>

            {/* GOAL */}
            <div className="mt-9">
              <div className="mb-3">
                <label className="text-sm font-black">
                  02. What's your shopping goal?
                </label>

                <p className="mt-1 text-xs text-gray-400">
                  This changes how products are prioritized.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {GOALS.map((item) => {
                  const active =
                    goal === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setGoal(
                          item.id
                        )
                      }
                      className={`relative rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-[#c9a24d] bg-[#fffaf0]"
                          : "border-[#e9e1d2] hover:border-[#d5b76d]"
                      }`}
                    >
                      {active && (
                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a24d] text-white">
                          <Check
                            size={11}
                          />
                        </span>
                      )}

                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${
                          active
                            ? "bg-[#c9a24d] text-white"
                            : "bg-[#f7f3eb] text-[#9b762b]"
                        }`}
                      >
                        {item.icon}
                      </span>

                      <p
                        className={`mt-3 text-sm font-black ${
                          active
                            ? "text-[#956f27]"
                            : "text-gray-800"
                        }`}
                      >
                        {item.title}
                      </p>

                      <p className="mt-1 text-[10px] leading-4 text-gray-400">
                        {item.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CATEGORY */}
            <div className="mt-8">
              <label className="mb-2 block text-sm font-black">
                03. Focus category
              </label>

              <div className="relative max-w-xl">
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(
                      e.target.value
                    );
                    setBuilt(false);
                  }}
                  className="h-12 w-full appearance-none rounded-xl border border-[#e5dccb] bg-[#fffdf9] px-4 pr-10 text-sm font-semibold outline-none focus:border-[#c9a24d] focus:ring-2 focus:ring-[#c9a24d]/10"
                >
                  <option value="all">
                    All Categories
                  </option>

                  {categories.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
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

            {/* ACTION */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#eee6d7] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={
                  resetBuilder
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e5dccb] px-5 text-sm font-bold text-gray-600 transition hover:bg-[#fffaf0]"
              >
                <RotateCcw
                  size={16}
                />
                Reset
              </button>

              <button
                type="button"
                onClick={
                  buildPlan
                }
                disabled={
                  loading ||
                  building
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-7 text-sm font-black text-white shadow-lg shadow-[#c9a24d]/15 transition hover:bg-[#b58d3f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {building ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Building Your Plan...
                  </>
                ) : (
                  <>
                    <Sparkles
                      size={17}
                    />
                    Build My Budget Plan
                    <ArrowRight
                      size={17}
                    />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* PLAN */}
        {built && (
          <section
            id="plan"
            className="mt-6 scroll-mt-24"
          >
            {/* SUMMARY */}
            <div className="overflow-hidden rounded-[26px] border border-[#dfc98f] bg-[#fffaf0]">
              <div className="border-b border-[#eadfca] px-5 py-5 sm:px-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c9a24d] text-white">
                        <Sparkles
                          size={15}
                        />
                      </span>

                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a17b2f]">
                        Your Smart Plan
                      </p>
                    </div>

                    <h3 className="mt-2 text-2xl font-black">
                      {formatPrice(
                        budget
                      )}{" "}
                      shopping plan
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {selectedCategory
                        ? `Focused on ${selectedCategory.name}`
                        : "Optimized across PrimeCart products"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      addPlanToCart
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-5 text-sm font-black text-white hover:bg-[#b58d3f]"
                  >
                    <ShoppingCart
                      size={16}
                    />
                    Add Plan to Cart
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-[#eadfca] sm:grid-cols-4">
                <div className="p-5 sm:p-6">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Budget
                  </p>

                  <p className="mt-2 text-lg font-black">
                    {formatPrice(
                      budget
                    )}
                  </p>
                </div>

                <div className="p-5 sm:p-6">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Planned Spend
                  </p>

                  <p className="mt-2 text-lg font-black">
                    {formatPrice(
                      spent
                    )}
                  </p>
                </div>

                <div className="border-t border-[#eadfca] p-5 sm:border-t-0 sm:p-6">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Remaining
                  </p>

                  <p className="mt-2 text-lg font-black text-emerald-600">
                    {formatPrice(
                      remaining
                    )}
                  </p>
                </div>

                <div className="border-t border-[#eadfca] p-5 sm:border-t-0 sm:p-6">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Savings
                  </p>

                  <p className="mt-2 text-lg font-black text-[#956f27]">
                    {formatPrice(
                      savings
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* SELECTED PRODUCTS */}
            <div className="mt-6">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h3 className="text-xl font-black">
                    Your Recommended Cart
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Products selected to maximize your
                    budget.
                  </p>
                </div>

                <span className="hidden rounded-full bg-[#fff3d2] px-3 py-1.5 text-[10px] font-black text-[#956f27] sm:block">
                  {smartPicks.length} PRODUCTS
                </span>
              </div>

              {smartPicks.length === 0 ? (
                <div className="rounded-[24px] border border-[#eadfca] bg-white px-6 py-16 text-center">
                  <CircleDollarSign
                    size={38}
                    className="mx-auto text-[#c9a24d]"
                  />

                  <h4 className="mt-4 text-lg font-black">
                    No products fit this plan
                  </h4>

                  <p className="mt-2 text-sm text-gray-500">
                    Try increasing your budget or selecting
                    all categories.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {smartPicks.map(
                    (
                      product,
                      index
                    ) => {
                      const image =
                        getImageUrl(
                          product.image_url
                        );

                      const discount =
                        getDiscount(
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
                        <div
                          key={
                            product.id
                          }
                          className="group flex flex-col gap-4 rounded-[22px] border border-[#eadfca] bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center"
                        >
                          <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-[#faf9f6] sm:h-28 sm:w-28">
                            {image ? (
                              <Image
                                src={
                                  image
                                }
                                alt={
                                  product.name
                                }
                                fill
                                className="object-contain p-3"
                                sizes="112px"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-gray-300">
                                <ShoppingCart
                                  size={
                                    30
                                  }
                                />
                              </div>
                            )}

                            <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#171717] text-[10px] font-black text-white">
                              {index +
                                1}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {product.brand && (
                                <span className="text-[9px] font-black uppercase tracking-wider text-[#a17b2f]">
                                  {
                                    product.brand
                                  }
                                </span>
                              )}

                              {discount >
                                0 && (
                                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-600">
                                  {
                                    discount
                                  }
                                  % OFF
                                </span>
                              )}
                            </div>

                            <Link
                              href={`/dashboard/products/${product.id}`}
                            >
                              <h4 className="mt-1 line-clamp-2 text-base font-black transition group-hover:text-[#a17b2f]">
                                {
                                  product.name
                                }
                              </h4>
                            </Link>

                            <div className="mt-2 flex flex-wrap items-center gap-3">
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#fff4d8] px-2 py-1 text-[10px] font-black text-[#956f27]">
                                <Star
                                  size={
                                    10
                                  }
                                  fill="currentColor"
                                />
                                {Number(
                                  product.rating ||
                                    0
                                ).toFixed(
                                  1
                                )}
                              </span>

                              <span className="text-[10px] text-gray-400">
                                {
                                  product.reviews_count
                                }{" "}
                                reviews
                              </span>

                              <span className="text-[10px] font-bold text-emerald-600">
                                Great value
                              </span>
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

                              {product.original_price &&
                                Number(
                                  product.original_price
                                ) >
                                  Number(
                                    product.price
                                  ) && (
                                  <p className="text-[10px] text-gray-400 line-through">
                                    {formatPrice(
                                      Number(
                                        product.original_price
                                      )
                                    )}
                                  </p>
                                )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                addToCart(
                                  product
                                )
                              }
                              className={`mt-0 inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-black sm:mt-3 ${
                                cart.includes(
                                  product.id
                                )
                                  ? "bg-emerald-600 text-white"
                                  : "bg-[#fff4d8] text-[#956f27] hover:bg-[#f8e7bd]"
                              }`}
                            >
                              {cart.includes(
                                product.id
                              ) ? (
                                <>
                                  <Check
                                    size={
                                      14
                                    }
                                  />
                                  Added
                                </>
                              ) : (
                                <>
                                  <ShoppingCart
                                    size={
                                      14
                                    }
                                  />
                                  Add
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

        {/* PRODUCT RECOMMENDATIONS */}
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                More options
              </p>

              <h3 className="mt-1 text-2xl font-black">
                Products Within Your Budget
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Explore more products that fit your spending
                range.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="hidden items-center gap-2 text-sm font-bold text-[#9b762b] hover:underline sm:flex"
            >
              View All
              <ArrowRight
                size={15}
              />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="h-[430px] animate-pulse rounded-[22px] bg-[#eeeae2]"
                  />
                )
              )}
            </div>
          ) : recommendedProducts.length ===
            0 ? (
            <div className="rounded-[24px] border border-[#eadfca] bg-white px-6 py-16 text-center">
              <CircleDollarSign
                size={38}
                className="mx-auto text-[#c9a24d]"
              />

              <h4 className="mt-4 text-lg font-black">
                No products found
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                Increase your budget to discover more
                products.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recommendedProducts.map(
                (product) => {
                  const image =
                    getImageUrl(
                      product.image_url
                    );

                  const wished =
                    wishlist.includes(
                      product.id
                    );

                  const added =
                    cart.includes(
                      product.id
                    );

                  const discount =
                    getDiscount(
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
                      key={
                        product.id
                      }
                      className="group overflow-hidden rounded-[22px] border border-[#eadfca] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative h-60 overflow-hidden bg-[#faf9f6]">
                        {image ? (
                          <Image
                            src={
                              image
                            }
                            alt={
                              product.name
                            }
                            fill
                            className="object-contain p-5 transition duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-300">
                            <ShoppingCart
                              size={
                                40
                              }
                            />
                          </div>
                        )}

                        <div className="absolute left-3 top-3 rounded-full bg-[#c9a24d] px-3 py-1.5 text-[10px] font-black text-white">
                          {product.score}% VALUE
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            toggleWishlist(
                              product.id
                            )
                          }
                          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border bg-white/95 shadow-sm ${
                            wished
                              ? "border-red-200 text-red-500"
                              : "border-[#e8dfcf] text-gray-500 hover:text-red-500"
                          }`}
                        >
                          <Heart
                            size={
                              18
                            }
                            fill={
                              wished
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>

                        {discount >
                          0 && (
                          <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-black text-white">
                            {
                              discount
                            }
                            % OFF
                          </span>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#a17b2f]">
                            {categories.find(
                              (
                                item
                              ) =>
                                item.id ===
                                product.category_id
                            )?.name ||
                              "PrimeCart"}
                          </span>

                          {product.is_flash_sale && (
                            <span className="flex items-center gap-1 text-[9px] font-black text-red-500">
                              <Zap
                                size={
                                  10
                                }
                              />
                              DEAL
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/dashboard/products/${product.id}`}
                        >
                          <h4 className="mt-2 line-clamp-2 min-h-[44px] text-[15px] font-black leading-5 transition group-hover:text-[#a17b2f]">
                            {
                              product.name
                            }
                          </h4>
                        </Link>

                        {product.brand && (
                          <p className="mt-1 text-xs text-gray-400">
                            {
                              product.brand
                            }
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#fff4d8] px-2 py-1 text-[10px] font-black text-[#956f27]">
                            <Star
                              size={
                                10
                              }
                              fill="currentColor"
                            />
                            {Number(
                              product.rating ||
                                0
                            ).toFixed(
                              1
                            )}
                          </span>

                          <span className="text-[10px] text-gray-400">
                            {
                              product.reviews_count
                            }{" "}
                            reviews
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
                              <span className="mb-0.5 text-xs text-gray-400 line-through">
                                {formatPrice(
                                  Number(
                                    product.original_price
                                  )
                                )}
                              </span>
                            )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            addToCart(
                              product
                            )
                          }
                          className={`mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-black ${
                            added
                              ? "bg-emerald-600 text-white"
                              : "bg-[#c9a24d] text-white hover:bg-[#b58d3f]"
                          }`}
                        >
                          {added ? (
                            <>
                              <Check
                                size={
                                  15
                                }
                              />
                              Added to Cart
                            </>
                          ) : (
                            <>
                              <ShoppingCart
                                size={
                                  15
                                }
                              />
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* WHY BUDGET BUILDER */}
        <section className="mt-12">
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b58a32]">
              WHY BUDGET BUILDER
            </span>

            <h3 className="mt-2 text-2xl font-black">
              More control. Better shopping.
            </h3>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <div className="rounded-[22px] border border-[#eadfca] bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32]">
                <WalletCards
                  size={21}
                />
              </div>

              <h4 className="mt-5 text-base font-black">
                Stay within budget
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Set your spending limit first and discover
                products that fit inside it.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#eadfca] bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32]">
                <TrendingDown
                  size={21}
                />
              </div>

              <h4 className="mt-5 text-base font-black">
                Find better value
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Ratings, discounts, product quality and price
                are considered while ranking products.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#eadfca] bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32]">
                <Sparkles
                  size={21}
                />
              </div>

              <h4 className="mt-5 text-base font-black">
                Build a complete cart
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Instead of picking one product, create a
                balanced shopping plan within your budget.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-8 overflow-hidden rounded-[26px] border border-[#dfc98f] bg-[#fff7e4]">
          <div className="flex flex-col items-center justify-between gap-5 px-6 py-8 text-center md:flex-row md:px-10 md:text-left">
            <div>
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <Sparkles
                  size={16}
                  className="text-[#b58a32]"
                />

                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9b762b]">
                  PrimeCart
                </span>
              </div>

              <h3 className="mt-2 text-xl font-black">
                Want to change your plan?
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Adjust your budget and build a completely
                new shopping plan.
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
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#c9a24d] px-5 text-sm font-black text-white transition hover:bg-[#b58d3f]"
            >
              <Calculator
                size={15}
              />
              Rebuild Budget
            </button>
          </div>
        </section>

        <div className="h-8" />
      </main>
    </div>
  );
}
