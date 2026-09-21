"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleHelp,
  Heart,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  Star,
  Target,
  TrendingUp,
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

type ScoreBreakdown = {
  budget: number;
  category: number;
  purpose: number;
  rating: number;
  brand: number;
};

type MatchedProduct = Product & {
  categoryName: string;
  matchScore: number;
  reasons: string[];
  breakdown: ScoreBreakdown;
};

const PURPOSES = [
  {
    id: "everyday",
    title: "Everyday",
    subtitle: "Daily essentials",
    icon: "✦",
  },
  {
    id: "work",
    title: "Work & Study",
    subtitle: "Productivity",
    icon: "◫",
  },
  {
    id: "entertainment",
    title: "Entertainment",
    subtitle: "Audio & gaming",
    icon: "▶",
  },
  {
    id: "fitness",
    title: "Fitness",
    subtitle: "Active lifestyle",
    icon: "⌁",
  },
  {
    id: "style",
    title: "Style",
    subtitle: "Fashion & looks",
    icon: "◇",
  },
  {
    id: "home",
    title: "Home",
    subtitle: "Home essentials",
    icon: "⌂",
  },
];

const BUDGETS = [
  {
    id: "under-1000",
    label: "Under ₹1K",
    full: "Under ₹1,000",
    min: 0,
    max: 1000,
  },
  {
    id: "1000-5000",
    label: "₹1K – ₹5K",
    full: "₹1,000 – ₹5,000",
    min: 1000,
    max: 5000,
  },
  {
    id: "5000-15000",
    label: "₹5K – ₹15K",
    full: "₹5,000 – ₹15,000",
    min: 5000,
    max: 15000,
  },
  {
    id: "15000-plus",
    label: "₹15K+",
    full: "₹15,000+",
    min: 15000,
    max: Infinity,
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

function purposeKeywords(id: string) {
  const keywords: Record<string, string[]> = {
    everyday: [
      "mobile",
      "phone",
      "watch",
      "bag",
      "bottle",
      "headphone",
      "shirt",
      "home",
      "kitchen",
      "wallet",
    ],

    work: [
      "laptop",
      "keyboard",
      "mouse",
      "monitor",
      "headphone",
      "office",
      "book",
      "study",
      "desk",
      "work",
    ],

    entertainment: [
      "gaming",
      "speaker",
      "headphone",
      "headset",
      "earbuds",
      "bluetooth",
      "game",
      "console",
      "tv",
    ],

    fitness: [
      "fitness",
      "gym",
      "yoga",
      "running",
      "sports",
      "shoe",
      "dumbbell",
      "workout",
      "bottle",
    ],

    style: [
      "fashion",
      "shirt",
      "tshirt",
      "hoodie",
      "jacket",
      "denim",
      "watch",
      "bag",
      "wallet",
      "shoe",
      "goggle",
      "sunglass",
    ],

    home: [
      "home",
      "living",
      "kitchen",
      "coffee",
      "cookware",
      "appliance",
      "air fryer",
      "kettle",
      "decor",
    ],
  };

  return keywords[id] || [];
}

function categoryKeywords(name: string) {
  const value = name.toLowerCase();

  if (value.includes("mobile")) {
    return [
      "mobile",
      "phone",
      "smartphone",
      "iphone",
      "android",
    ];
  }

  if (value.includes("fashion")) {
    return [
      "fashion",
      "shirt",
      "tshirt",
      "hoodie",
      "jacket",
      "denim",
      "clothing",
    ];
  }

  if (value.includes("footwear")) {
    return [
      "shoe",
      "sneaker",
      "footwear",
      "running",
      "sandals",
      "slipper",
    ];
  }

  if (value.includes("watch")) {
    return ["watch", "smartwatch", "time"];
  }

  if (value.includes("bag")) {
    return [
      "bag",
      "backpack",
      "luggage",
      "wallet",
    ];
  }

  if (value.includes("gaming")) {
    return [
      "gaming",
      "game",
      "keyboard",
      "mouse",
      "controller",
      "headset",
    ];
  }

  if (value.includes("automotive")) {
    return [
      "car",
      "automotive",
      "bike",
      "vehicle",
      "motor",
    ];
  }

  if (value.includes("appliance")) {
    return [
      "appliance",
      "air fryer",
      "kettle",
      "coffee",
      "oven",
      "mixer",
    ];
  }

  if (
    value.includes("toy") ||
    value.includes("baby")
  ) {
    return [
      "toy",
      "baby",
      "kids",
      "children",
      "game",
    ];
  }

  if (value.includes("home")) {
    return [
      "home",
      "living",
      "kitchen",
      "cookware",
      "decor",
      "coffee",
    ];
  }

  return [value];
}

function scoreProduct(
  product: Product,
  categories: Category[],
  selectedPurpose: string,
  selectedBudget: string,
  selectedCategory: string,
  selectedBrand: string
): MatchedProduct {
  const category = categories.find(
    (item) => item.id === product.category_id
  );

  const text = [
    product.name,
    product.brand || "",
    product.short_description || "",
    product.description || "",
    category?.name || "",
  ]
    .join(" ")
    .toLowerCase();

  const budget = BUDGETS.find(
    (item) => item.id === selectedBudget
  );

  const purposeWords =
    purposeKeywords(selectedPurpose);

  let purposeScore = 40;

  if (
    purposeWords.some((word) =>
      text.includes(word.toLowerCase())
    )
  ) {
    purposeScore = 100;
  } else {
    purposeScore = 60;
  }

  let budgetScore = 40;

  if (budget) {
    const price = Number(product.price);

    if (
      price >= budget.min &&
      price <= budget.max
    ) {
      budgetScore = 100;
    } else {
      const difference =
        price < budget.min
          ? budget.min - price
          : price - budget.max;

      if (difference <= 1000) {
        budgetScore = 70;
      } else {
        budgetScore = 35;
      }
    }
  }

  let categoryScore = 65;

  if (selectedCategory === "all") {
    categoryScore = 75;
  } else if (
    product.category_id === selectedCategory
  ) {
    categoryScore = 100;
  } else {
    const selected = categories.find(
      (item) => item.id === selectedCategory
    );

    if (
      selected &&
      categoryKeywords(selected.name).some((word) =>
        text.includes(word.toLowerCase())
      )
    ) {
      categoryScore = 70;
    } else {
      categoryScore = 30;
    }
  }

  let brandScore = 75;

  if (selectedBrand === "Any Brand") {
    brandScore = 80;
  } else if (
    product.brand &&
    product.brand.toLowerCase() ===
      selectedBrand.toLowerCase()
  ) {
    brandScore = 100;
  } else {
    brandScore = 35;
  }

  const rating = Number(product.rating || 0);

  let ratingScore = Math.round(
    Math.min(100, (rating / 5) * 100)
  );

  if (ratingScore < 50) {
    ratingScore = 50;
  }

  let score = Math.round(
    budgetScore * 0.28 +
      categoryScore * 0.25 +
      purposeScore * 0.22 +
      ratingScore * 0.15 +
      brandScore * 0.1
  );

  if (product.is_featured) {
    score += 2;
  }

  if (product.is_flash_sale) {
    score += 2;
  }

  if (product.stock <= 0) {
    score -= 20;
  }

  score = Math.max(
    20,
    Math.min(99, score)
  );

  const reasons: string[] = [];

  if (budgetScore >= 90) {
    reasons.push("Perfect budget fit");
  } else if (budgetScore >= 70) {
    reasons.push("Close to your budget");
  }

  if (categoryScore >= 90) {
    reasons.push("Exact category match");
  }

  if (purposeScore >= 90) {
    reasons.push("Fits your purpose");
  }

  if (brandScore >= 95) {
    reasons.push("Preferred brand");
  }

  if (ratingScore >= 90) {
    reasons.push("Highly rated");
  }

  if (product.is_flash_sale) {
    reasons.push("Special deal");
  }

  if (!reasons.length) {
    reasons.push("Good overall match");
  }

  return {
    ...product,
    categoryName:
      category?.name || "PrimeCart Pick",
    matchScore: score,
    reasons: reasons.slice(0, 3),
    breakdown: {
      budget: budgetScore,
      category: categoryScore,
      purpose: purposeScore,
      rating: ratingScore,
      brand: brandScore,
    },
  };
}

export default function PrimeMatchPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [matched, setMatched] = useState(false);

  const [purpose, setPurpose] = useState("everyday");
  const [budget, setBudget] = useState("1000-5000");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("Any Brand");

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);

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
          .select("id, name, slug")
          .order("name"),

        supabase
          .from("wishlist")
          .select("product_id")
          .eq("user_id", user.id),
      ]);

      const productData =
        (productsResponse.data as Product[]) || [];

      const categoryData =
        (categoriesResponse.data as Category[]) || [];

      setProducts(productData);
      setCategories(categoryData);

      const uniqueBrands = Array.from(
        new Set(
          productData
            .map((item) => item.brand?.trim())
            .filter(
              (item): item is string =>
                Boolean(item)
            )
        )
      ).sort((a, b) =>
        a.localeCompare(b)
      );

      setBrands(uniqueBrands);

      setWishlist(
        ((wishlistResponse.data || []) as {
          product_id: string;
        }[]).map(
          (item) => item.product_id
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const matchedProducts = useMemo(
    () => {
      return products
        .map((product) =>
          scoreProduct(
            product,
            categories,
            purpose,
            budget,
            category,
            brand
          )
        )
        .sort((a, b) => {
          if (
            b.matchScore !== a.matchScore
          ) {
            return b.matchScore - a.matchScore;
          }

          return (
            Number(b.rating) -
            Number(a.rating)
          );
        });
    },
    [
      products,
      categories,
      purpose,
      budget,
      category,
      brand,
    ]
  );

  const topMatch = matchedProducts[0];

  async function runMatch() {
    setMatching(true);
    setMatched(false);

    await new Promise((resolve) =>
      setTimeout(resolve, 1000)
    );

    setMatched(true);
    setMatching(false);

    setTimeout(() => {
      document
        .getElementById("results")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 150);
  }

  function resetPreferences() {
    setPurpose("everyday");
    setBudget("1000-5000");
    setCategory("all");
    setBrand("Any Brand");
    setMatched(false);
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

  function addToCart(product: Product) {
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

      const existing = items.find(
        (item) =>
          item.id === product.id
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        items.push({
          id: product.id,
          name: product.name,
          price: Number(product.price),
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
          : [...current, product.id]
      );

      window.dispatchEvent(
        new Event("cart-updated")
      );
    } catch (error) {
      console.error(error);
    }
  }

  const visibleProducts = matched
    ? matchedProducts
    : matchedProducts.slice(0, 8);

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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c9a24d] text-white shadow-sm">
                <Sparkles size={17} />
              </div>

              <div>
                <h1 className="text-base font-black">
                  Prime Match
                </h1>

                <p className="hidden text-[10px] text-gray-400 sm:block">
                  Your personal shopping assistant
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
          <div className="absolute -right-32 -top-40 h-[440px] w-[440px] rounded-full bg-[#f4e3b4]/40 blur-3xl" />

          <div className="absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-[#f8efdc] blur-3xl" />

          <div className="relative grid items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#eadfca] bg-[#fffaf0] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#9b762b]">
                <Sparkles size={13} />
                PrimeCart Intelligence
              </div>

              <h2 className="mt-5 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[58px]">
                Your next great
                <span className="block text-[#b58a32]">
                  purchase starts here.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
                Tell us what you need. Prime Match compares
                your preferences with our products and finds
                the options that fit you best.
              </p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-xl border border-[#eee5d5] bg-[#fffdf8] px-3 py-2 text-xs font-bold">
                  <Target
                    size={14}
                    className="text-[#c9a24d]"
                  />
                  Personalized
                </span>

                <span className="inline-flex items-center gap-2 rounded-xl border border-[#eee5d5] bg-[#fffdf8] px-3 py-2 text-xs font-bold">
                  <TrendingUp
                    size={14}
                    className="text-[#c9a24d]"
                  />
                  Smart scoring
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

            {/* HERO MATCH VISUAL */}
            <div className="hidden justify-center lg:flex">
              <div className="relative flex h-[330px] w-[330px] items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-[#eadfca]" />

                <div className="absolute inset-8 rounded-full border border-dashed border-[#d4b56b]" />

                <div className="absolute inset-16 rounded-full bg-[#fffaf0]" />

                <div className="relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-[34px] bg-[#c9a24d] text-white shadow-2xl shadow-[#c9a24d]/25">
                  <Sparkles size={30} />

                  <span className="mt-2 text-4xl font-black">
                    96%
                  </span>

                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                    Prime Match
                  </span>
                </div>

                <div className="absolute left-0 top-16 rounded-2xl border border-[#eadfca] bg-white px-4 py-3 shadow-lg">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Budget
                  </p>

                  <p className="mt-1 text-xs font-black">
                    Perfect Fit
                  </p>
                </div>

                <div className="absolute bottom-10 right-0 rounded-2xl border border-[#eadfca] bg-white px-4 py-3 shadow-lg">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Recommendation
                  </p>

                  <p className="mt-1 text-xs font-black text-emerald-600">
                    Highly Matched
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PREFERENCE BUILDER */}
        <section className="mt-6 overflow-hidden rounded-[26px] border border-[#eadfca] bg-white shadow-sm">
          <div className="border-b border-[#eee6d7] px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff6df] text-[#b58a32]">
                <Target size={20} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b58a32]">
                  Personalize
                </p>

                <h3 className="mt-0.5 text-lg font-black">
                  Build your perfect match
                </h3>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {/* PURPOSE */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-black">
                  01. What are you shopping for?
                </label>

                <span className="text-[10px] font-semibold text-gray-400">
                  Select one
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                {PURPOSES.map((item) => {
                  const active =
                    purpose === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setPurpose(item.id)
                      }
                      className={`relative rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-[#c9a24d] bg-[#fffaf0] shadow-sm"
                          : "border-[#e9e1d2] hover:border-[#d5b76d] hover:bg-[#fffdf8]"
                      }`}
                    >
                      {active && (
                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a24d] text-white">
                          <Check size={11} />
                        </span>
                      )}

                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm ${
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

                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {item.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BUDGET */}
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-black">
                  02. What's your budget?
                </label>

                <span className="rounded-full bg-[#fff7e4] px-2.5 py-1 text-[10px] font-bold text-[#956f27]">
                  Your comfort range
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                {BUDGETS.map((item) => {
                  const active =
                    budget === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setBudget(item.id)
                      }
                      className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition ${
                        active
                          ? "border-[#c9a24d] bg-[#fffaf0] text-[#956f27]"
                          : "border-[#e9e1d2] hover:border-[#d5b76d]"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-black">
                          {item.label}
                        </p>

                        {active && (
                          <p className="mt-0.5 text-[9px] font-medium text-gray-400">
                            Selected range
                          </p>
                        )}
                      </div>

                      {active && (
                        <Check size={16} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CATEGORY + BRAND */}
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black">
                  03. Product category
                </label>

                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
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

              <div>
                <label className="mb-2 block text-sm font-black">
                  04. Preferred brand
                </label>

                <div className="relative">
                  <select
                    value={brand}
                    onChange={(e) =>
                      setBrand(e.target.value)
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-[#e5dccb] bg-[#fffdf9] px-4 pr-10 text-sm font-semibold outline-none focus:border-[#c9a24d] focus:ring-2 focus:ring-[#c9a24d]/10"
                  >
                    <option value="Any Brand">
                      Any Brand
                    </option>

                    {brands.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
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
            </div>

            {/* BUTTONS */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#eee6d7] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={resetPreferences}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e5dccb] px-5 text-sm font-bold text-gray-600 transition hover:bg-[#fffaf0]"
              >
                <RotateCcw size={16} />
                Reset
              </button>

              <button
                type="button"
                disabled={
                  loading || matching
                }
                onClick={runMatch}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-7 text-sm font-black text-white shadow-lg shadow-[#c9a24d]/15 transition hover:bg-[#b58d3f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {matching ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Analyzing Products...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Find My Prime Match
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* TOP MATCH */}
        {matched && topMatch && (
          <section className="mt-6 overflow-hidden rounded-[26px] border border-[#dfc98f] bg-[#fffaf0]">
            <div className="border-b border-[#eadfca] px-5 py-4 sm:px-7">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c9a24d] text-white">
                  <Sparkles size={15} />
                </span>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a17b2f]">
                    Prime Match Result
                  </p>

                  <h3 className="text-base font-black">
                    Your strongest match
                  </h3>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              {/* Image */}
              <div className="relative min-h-[360px] bg-white">
                {getImageUrl(
                  topMatch.image_url
                ) ? (
                  <Image
                    src={
                      getImageUrl(
                        topMatch.image_url
                      )!
                    }
                    alt={topMatch.name}
                    fill
                    className="object-contain p-8"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                ) : (
                  <div className="flex h-full min-h-[360px] items-center justify-center text-gray-300">
                    <ShoppingCart size={50} />
                  </div>
                )}

                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-[#171717] px-4 py-2 text-xs font-black text-white">
                  <Target size={14} />
                  TOP MATCH
                </div>
              </div>

              {/* Info */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#9b762b]">
                    {topMatch.categoryName}
                  </span>

                  {topMatch.is_flash_sale && (
                    <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-black text-red-600">
                      <Zap size={11} />
                      FLASH DEAL
                    </span>
                  )}
                </div>

                <h3 className="mt-4 max-w-xl text-2xl font-black leading-tight sm:text-3xl">
                  {topMatch.name}
                </h3>

                {topMatch.short_description && (
                  <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                    {topMatch.short_description}
                  </p>
                )}

                {/* Rating */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-black text-[#956f27]">
                    <Star
                      size={13}
                      fill="currentColor"
                    />
                    {Number(
                      topMatch.rating || 0
                    ).toFixed(1)}
                  </span>

                  <span className="text-xs text-gray-500">
                    {topMatch.reviews_count || 0}{" "}
                    reviews
                  </span>

                  {topMatch.brand && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-gray-300" />

                      <span className="text-xs font-semibold text-gray-500">
                        {topMatch.brand}
                      </span>
                    </>
                  )}
                </div>

                {/* Price */}
                <div className="mt-5 flex items-end gap-3">
                  <span className="text-3xl font-black">
                    {formatPrice(
                      Number(topMatch.price)
                    )}
                  </span>

                  {topMatch.original_price &&
                    Number(
                      topMatch.original_price
                    ) >
                      Number(
                        topMatch.price
                      ) && (
                      <>
                        <span className="mb-1 text-sm text-gray-400 line-through">
                          {formatPrice(
                            Number(
                              topMatch.original_price
                            )
                          )}
                        </span>

                        <span className="mb-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-600">
                          {getDiscount(
                            Number(
                              topMatch.price
                            ),
                            Number(
                              topMatch.original_price
                            )
                          )}
                          % OFF
                        </span>
                      </>
                    )}
                </div>

                {/* Match Score */}
                <div className="mt-6 rounded-2xl border border-[#eadfca] bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#a17b2f]">
                        Prime Match Score
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Based on your preferences
                      </p>
                    </div>

                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-[5px] border-[#eadfca]">
                      <div className="absolute inset-[-5px] rounded-full border-[5px] border-[#c9a24d] border-b-transparent border-l-transparent rotate-[-25deg]" />

                      <span className="text-base font-black text-[#956f27]">
                        {topMatch.matchScore}%
                      </span>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="mt-5 space-y-3">
                    {[
                      [
                        "Budget Fit",
                        topMatch.breakdown.budget,
                      ],
                      [
                        "Category Fit",
                        topMatch.breakdown.category,
                      ],
                      [
                        "Purpose Fit",
                        topMatch.breakdown.purpose,
                      ],
                      [
                        "Rating",
                        topMatch.breakdown.rating,
                      ],
                      [
                        "Brand Fit",
                        topMatch.breakdown.brand,
                      ],
                    ].map(
                      ([label, value]) => (
                        <div key={label}>
                          <div className="mb-1 flex justify-between text-[10px] font-bold">
                            <span className="text-gray-500">
                              {label}
                            </span>

                            <span className="text-gray-700">
                              {value}%
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-[#eee7d9]">
                            <div
                              className="h-full rounded-full bg-[#c9a24d]"
                              style={{
                                width: `${value}%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Reasons */}
                <div className="mt-5">
                  <p className="text-xs font-black uppercase tracking-wider">
                    Why we picked this
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {topMatch.reasons.map(
                      (reason) => (
                        <div
                          key={reason}
                          className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-emerald-700"
                        >
                          <Check
                            size={14}
                          />
                          {reason}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    disabled={
                      topMatch.stock <= 0
                    }
                    onClick={() =>
                      addToCart(topMatch)
                    }
                    className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-black transition ${
                      topMatch.stock <= 0
                        ? "cursor-not-allowed bg-gray-200 text-gray-500"
                        : cart.includes(
                              topMatch.id
                            )
                          ? "bg-emerald-600 text-white"
                          : "bg-[#c9a24d] text-white hover:bg-[#b58d3f]"
                    }`}
                  >
                    {cart.includes(
                      topMatch.id
                    ) ? (
                      <>
                        <Check size={17} />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart
                          size={17}
                        />
                        Add to Cart
                      </>
                    )}
                  </button>

                  <Link
                    href={`/dashboard/products/${topMatch.id}`}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#dfcfa9] bg-white px-5 text-sm font-black text-gray-700 transition hover:border-[#c9a24d] hover:text-[#9b762b]"
                  >
                    View Product
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* RESULTS */}
        <section
          id="results"
          className="mt-10 scroll-mt-24"
        >
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black">
                  {matched
                    ? "More Prime Matches"
                    : "Recommended For You"}
                </h3>

                {matched && (
                  <span className="rounded-full bg-[#fff3d2] px-2.5 py-1 text-[10px] font-black text-[#956f27]">
                    Ranked
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {matched
                  ? `${matchedProducts.length} products analyzed and ranked for you`
                  : "Discover products based on your current preferences."}
              </p>
            </div>

            {matched && (
              <button
                type="button"
                onClick={() =>
                  setMatched(false)
                }
                className="inline-flex items-center gap-2 text-sm font-bold text-[#9b762b] hover:underline"
              >
                <RotateCcw size={15} />
                Change Preferences
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-[22px] border border-[#eadfca] bg-white"
                  >
                    <div className="h-64 animate-pulse bg-[#eeeae2]" />

                    <div className="space-y-3 p-5">
                      <div className="h-3 w-20 animate-pulse rounded bg-[#eeeae2]" />

                      <div className="h-5 w-full animate-pulse rounded bg-[#eeeae2]" />

                      <div className="h-4 w-2/3 animate-pulse rounded bg-[#eeeae2]" />

                      <div className="h-7 w-1/3 animate-pulse rounded bg-[#eeeae2]" />

                      <div className="h-11 animate-pulse rounded-xl bg-[#eeeae2]" />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="rounded-[24px] border border-[#eadfca] bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32]">
                <Target size={28} />
              </div>

              <h4 className="mt-5 text-xl font-black">
                No matching products
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Try another category, budget or brand
                preference.
              </p>

              <button
                type="button"
                onClick={resetPreferences}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#c9a24d] px-5 py-3 text-sm font-black text-white"
              >
                <RotateCcw size={15} />
                Reset Preferences
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map(
                (product, index) => {
                  const image =
                    getImageUrl(
                      product.image_url
                    );

                  const off =
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

                  const wished =
                    wishlist.includes(
                      product.id
                    );

                  const added =
                    cart.includes(
                      product.id
                    );

                  return (
                    <article
                      key={product.id}
                      className="group overflow-hidden rounded-[22px] border border-[#eadfca] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* Image */}
                      <div className="relative h-64 overflow-hidden bg-[#faf9f6]">
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
                            <ShoppingCart
                              size={42}
                            />
                          </div>
                        )}

                        {/* Rank */}
                        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[#171717] px-3 py-1.5 text-[10px] font-black text-white">
                          #{index + 1}
                          <span className="text-gray-400">
                            •
                          </span>
                          {product.matchScore}%
                        </div>

                        {/* Wishlist */}
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
                            size={18}
                            fill={
                              wished
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>

                        {/* Bottom badges */}
                        <div className="absolute bottom-3 left-3 flex gap-2">
                          {off > 0 && (
                            <span className="rounded-full bg-[#c9a24d] px-2.5 py-1 text-[10px] font-black text-white">
                              {off}% OFF
                            </span>
                          )}

                          {product.is_flash_sale && (
                            <span className="flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-black text-white">
                              <Zap size={10} />
                              DEAL
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="max-w-[70%] truncate text-[10px] font-black uppercase tracking-[0.14em] text-[#a17b2f]">
                            {product.categoryName}
                          </span>

                          {product.is_featured && (
                            <span className="flex items-center gap-1 text-[10px] font-black text-[#a17b2f]">
                              <Sparkles size={11} />
                              PICK
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/dashboard/products/${product.id}`}
                        >
                          <h4 className="mt-2 line-clamp-2 min-h-[48px] text-[15px] font-black leading-6 transition group-hover:text-[#a17b2f]">
                            {product.name}
                          </h4>
                        </Link>

                        {product.brand && (
                          <p className="mt-1 text-xs text-gray-400">
                            {product.brand}
                          </p>
                        )}

                        {/* Reasons */}
                        <div className="mt-4 min-h-[42px] space-y-1">
                          {product.reasons
                            .slice(0, 2)
                            .map(
                              (
                                reason
                              ) => (
                                <div
                                  key={
                                    reason
                                  }
                                  className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600"
                                >
                                  <Check
                                    size={
                                      11
                                    }
                                  />
                                  {
                                    reason
                                  }
                                </div>
                              )
                            )}
                        </div>

                        {/* Rating */}
                        <div className="mt-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#fff4d8] px-2 py-1 text-[11px] font-black text-[#956f27]">
                            <Star
                              size={
                                11
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

                          <span className="text-[11px] text-gray-400">
                            {product.reviews_count ||
                              0}{" "}
                            reviews
                          </span>
                        </div>

                        {/* Price */}
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

                        {/* Buttons */}
                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            disabled={
                              product.stock <=
                              0
                            }
                            onClick={() =>
                              addToCart(
                                product
                              )
                            }
                            className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-black ${
                              product.stock <=
                              0
                                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                                : added
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
                                Added
                              </>
                            ) : (
                              <>
                                <ShoppingCart
                                  size={
                                    15
                                  }
                                />
                                Add to
                                Cart
                              </>
                            )}
                          </button>

                          <Link
                            href={`/dashboard/products/${product.id}`}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5dccb] text-gray-600 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] hover:text-[#9b762b]"
                          >
                            <ArrowRight
                              size={
                                17
                              }
                            />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-12">
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b58a32]">
              HOW PRIME MATCH WORKS
            </span>

            <h3 className="mt-2 text-2xl font-black">
              Shopping made more personal.
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Prime Match combines your preferences with
              real product information to help narrow down
              your choices.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <div className="rounded-[22px] border border-[#eadfca] bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32]">
                <Target size={21} />
              </div>

              <p className="mt-5 text-[10px] font-black uppercase tracking-wider text-[#b58a32]">
                STEP 01
              </p>

              <h4 className="mt-1 text-base font-black">
                Tell us what matters
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Choose your purpose, budget, category and
                preferred brand.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#eadfca] bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32]">
                <TrendingUp size={21} />
              </div>

              <p className="mt-5 text-[10px] font-black uppercase tracking-wider text-[#b58a32]">
                STEP 02
              </p>

              <h4 className="mt-1 text-base font-black">
                Products get scored
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Each product is compared against your selected
                preferences and product quality signals.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#eadfca] bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32]">
                <Sparkles size={21} />
              </div>

              <p className="mt-5 text-[10px] font-black uppercase tracking-wider text-[#b58a32]">
                STEP 03
              </p>

              <h4 className="mt-1 text-base font-black">
                Discover your match
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                See your strongest match first, followed by
                ranked recommendations.
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
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
                Still deciding?
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Adjust your preferences and discover a
                different set of matches.
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
              <Sparkles size={15} />
              Find My Match
            </button>
          </div>
        </section>

        <div className="h-8" />
      </main>
    </div>
  );
}
