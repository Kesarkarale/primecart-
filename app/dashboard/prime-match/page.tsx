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
  UserRound,
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

type MatchedProduct = Product & {
  categoryName: string;
  matchScore: number;
  reasons: string[];
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
    subtitle: "Fun & media",
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

const BRANDS = [
  "Any Brand",
  "Samsung",
  "Apple",
  "Sony",
  "Nike",
  "Adidas",
  "Levi's",
  "Boat",
  "JBL",
  "HP",
  "Dell",
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

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function discount(
  price: number,
  original: number | null
) {
  if (!original || original <= price) return 0;

  return Math.round(((original - price) / original) * 100);
}

function keywordsForPurpose(id: string) {
  const map: Record<string, string[]> = {
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

  return map[id] || [];
}

function keywordsForCategory(name: string) {
  const category = name.toLowerCase();

  if (category.includes("mobile")) {
    return ["mobile", "phone", "smartphone", "iphone", "android"];
  }

  if (category.includes("fashion")) {
    return [
      "fashion",
      "shirt",
      "tshirt",
      "hoodie",
      "jacket",
      "denim",
    ];
  }

  if (category.includes("footwear")) {
    return [
      "shoe",
      "sneaker",
      "footwear",
      "running",
      "sandals",
      "slipper",
    ];
  }

  if (category.includes("watch")) {
    return ["watch", "smartwatch", "time"];
  }

  if (category.includes("bag")) {
    return ["bag", "backpack", "luggage", "wallet"];
  }

  if (category.includes("gaming")) {
    return [
      "gaming",
      "game",
      "keyboard",
      "mouse",
      "controller",
      "headset",
    ];
  }

  if (category.includes("automotive")) {
    return [
      "car",
      "automotive",
      "bike",
      "vehicle",
      "motor",
    ];
  }

  if (category.includes("appliance")) {
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
    category.includes("toy") ||
    category.includes("baby")
  ) {
    return [
      "toy",
      "baby",
      "kids",
      "children",
      "game",
    ];
  }

  if (category.includes("home")) {
    return [
      "home",
      "living",
      "kitchen",
      "cookware",
      "decor",
      "coffee",
    ];
  }

  return [category];
}

export default function PrimeMatchPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

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
    loadPage();
  }, []);

  async function loadPage() {
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
        productResponse,
        categoryResponse,
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

      setProducts(
        (productResponse.data as Product[]) || []
      );

      setCategories(
        (categoryResponse.data as Category[]) || []
      );

      setWishlist(
        ((wishlistResponse.data || []) as {
          product_id: string;
        }[]).map((item) => item.product_id)
      );
    } catch (error) {
      console.error("Prime Match:", error);
    } finally {
      setLoading(false);
    }
  }

  const matchedProducts = useMemo<MatchedProduct[]>(() => {
    const selectedBudget = BUDGETS.find(
      (item) => item.id === budget
    );

    const selectedCategory = categories.find(
      (item) => item.id === category
    );

    const purposeKeywords =
      keywordsForPurpose(purpose);

    const categoryKeywords = selectedCategory
      ? keywordsForCategory(selectedCategory.name)
      : [];

    return products
      .map((product) => {
        const text = [
          product.name,
          product.brand || "",
          product.short_description || "",
          product.description || "",
        ]
          .join(" ")
          .toLowerCase();

        let score = 40;
        const reasons: string[] = [];

        // Exact category
        if (
          selectedCategory &&
          product.category_id === selectedCategory.id
        ) {
          score += 25;
          reasons.push("Exact category match");
        }

        // Purpose
        if (
          purposeKeywords.some((word) =>
            text.includes(word.toLowerCase())
          )
        ) {
          score += 18;
          reasons.push("Fits your purpose");
        }

        // Category keywords
        if (
          selectedCategory &&
          categoryKeywords.some((word) =>
            text.includes(word.toLowerCase())
          )
        ) {
          score += 8;
        }

        // Budget
        if (selectedBudget) {
          const price = Number(product.price);

          if (
            price >= selectedBudget.min &&
            price <= selectedBudget.max
          ) {
            score += 15;
            reasons.push("Within your budget");
          } else {
            score -= 10;
          }
        }

        // Brand
        if (brand !== "Any Brand") {
          if (
            product.brand &&
            product.brand.toLowerCase() ===
              brand.toLowerCase()
          ) {
            score += 15;
            reasons.push("Preferred brand");
          }
        }

        // Rating
        if (Number(product.rating) >= 4.5) {
          score += 5;
          reasons.push("Highly rated");
        } else if (Number(product.rating) >= 4) {
          score += 3;
        }

        // Featured
        if (product.is_featured) {
          score += 3;
        }

        // Flash sale
        if (product.is_flash_sale) {
          score += 2;
          reasons.push("Special deal");
        }

        // Stock
        if (product.stock <= 0) {
          score -= 25;
        }

        score = Math.round(
          Math.max(20, Math.min(99, score))
        );

        if (!reasons.length) {
          reasons.push("Good overall match");
        }

        const categoryName =
          categories.find(
            (item) => item.id === product.category_id
          )?.name || "PrimeCart Pick";

        return {
          ...product,
          categoryName,
          matchScore: score,
          reasons: reasons.slice(0, 3),
        };
      })
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }

        return (
          Number(b.rating) - Number(a.rating)
        );
      });
  }, [
    products,
    categories,
    purpose,
    budget,
    category,
    brand,
  ]);

  const topMatch = matchedProducts[0];

  async function findMatches() {
    setMatching(true);
    setMatched(false);

    await new Promise((resolve) =>
      setTimeout(resolve, 900)
    );

    setMatched(true);
    setMatching(false);

    setTimeout(() => {
      document
        .getElementById("prime-match-results")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  function reset() {
    setPurpose("everyday");
    setBudget("1000-5000");
    setCategory("all");
    setBrand("Any Brand");
    setMatched(false);
  }

  async function toggleWishlist(productId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const exists = wishlist.includes(productId);

    if (exists) {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) {
        console.error(error);
        return;
      }

      setWishlist((current) =>
        current.filter((id) => id !== productId)
      );
    } else {
      const { error } = await supabase
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
      const saved = localStorage.getItem(
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

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="sticky top-0 z-50 border-b border-[#e9dfcc] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8dfcf] bg-white text-gray-600 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] hover:text-[#a17b2f]"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c9a24d] text-white">
                  <Sparkles size={15} />
                </div>

                <h1 className="text-base font-bold sm:text-lg">
                  Prime Match
                </h1>
              </div>

              <p className="hidden text-[11px] text-gray-500 sm:block">
                Your personal shopping assistant
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/products"
            className="hidden items-center gap-2 rounded-xl border border-[#e5dccb] px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] sm:flex"
          >
            Explore Products
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="relative overflow-hidden rounded-[28px] border border-[#eadfca] bg-white shadow-sm">
          <div className="absolute right-[-100px] top-[-130px] h-[380px] w-[380px] rounded-full bg-[#f5e4b7]/40 blur-3xl" />

          <div className="absolute bottom-[-160px] left-[-100px] h-[360px] w-[360px] rounded-full bg-[#f8efd9] blur-3xl" />

          <div className="relative grid min-h-[400px] items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#eadfca] bg-[#fffaf0] px-3.5 py-2 text-xs font-bold text-[#9b762b]">
                <Sparkles size={14} />
                PRIME MATCH
                <span className="h-1 w-1 rounded-full bg-[#c9a24d]" />
                SMART SHOPPING
              </div>

              <h2 className="mt-5 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-[56px]">
                Don't search for the right product.
                <span className="block text-[#b58a32]">
                  Let it find you.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
                Tell us what you need, how much you want to
                spend and what matters to you. Prime Match
                analyzes our products and finds your strongest
                matches.
              </p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                <div className="flex items-center gap-2 rounded-xl border border-[#eee5d4] bg-[#fffdf8] px-3 py-2 text-xs font-semibold">
                  <Target
                    size={15}
                    className="text-[#c9a24d]"
                  />
                  Personalized
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-[#eee5d4] bg-[#fffdf8] px-3 py-2 text-xs font-semibold">
                  <TrendingUp
                    size={15}
                    className="text-[#c9a24d]"
                  />
                  Smart scoring
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-[#eee5d4] bg-[#fffdf8] px-3 py-2 text-xs font-semibold">
                  <BadgeCheck
                    size={15}
                    className="text-[#c9a24d]"
                  />
                  Real products
                </div>
              </div>
            </div>

            {/* Match Visual */}
            <div className="hidden justify-center lg:flex">
              <div className="relative flex h-[310px] w-[310px] items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-[#eadfca]" />

                <div className="absolute inset-7 rounded-full border border-dashed border-[#d7bd7b]" />

                <div className="absolute inset-14 rounded-full bg-[#fffaf0]" />

                <div className="relative z-10 flex h-32 w-32 flex-col items-center justify-center rounded-[30px] bg-[#c9a24d] text-white shadow-2xl shadow-[#c9a24d]/20">
                  <Sparkles size={34} />
                  <span className="mt-2 text-3xl font-black">
                    96%
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest">
                    Match
                  </span>
                </div>

                <div className="absolute left-0 top-16 rounded-2xl border border-[#eadfca] bg-white px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fff4d8] text-[#b58a32]">
                      <Target size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">
                        Preference
                      </p>
                      <p className="text-xs font-bold">
                        Your Budget
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-10 right-0 rounded-2xl border border-[#eadfca] bg-white px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef8f0] text-emerald-600">
                      <Check size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">
                        Result
                      </p>
                      <p className="text-xs font-bold">
                        Perfect Fit
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* BUILDER */}
        {/* ================================================= */}

        <section className="mt-6 overflow-hidden rounded-[24px] border border-[#eadfca] bg-white shadow-sm">
          <div className="border-b border-[#eee6d7] px-5 py-5 sm:px-7">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff7e4] text-[#b58a32]">
                <Target size={20} />
              </div>

              <div>
                <h3 className="text-lg font-bold">
                  Build your perfect match
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  A few preferences are all we need to
                  personalize your recommendations.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {/* Purpose */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-bold">
                  01. What are you shopping for?
                </label>

                <span className="text-[11px] font-medium text-gray-400">
                  Choose one
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
                      className={`group relative rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-[#c9a24d] bg-[#fffaf0] shadow-sm"
                          : "border-[#e9e1d2] bg-white hover:border-[#d5b76d] hover:bg-[#fffdf8]"
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
                            : "bg-[#f7f3eb] text-[#a17b2f]"
                        }`}
                      >
                        {item.icon}
                      </span>

                      <p
                        className={`mt-3 text-sm font-bold ${
                          active
                            ? "text-[#956f27]"
                            : "text-gray-800"
                        }`}
                      >
                        {item.title}
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-500">
                        {item.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget */}
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-bold">
                  02. What's your budget?
                </label>

                <span className="rounded-full bg-[#fff8e8] px-2.5 py-1 text-[10px] font-bold text-[#9b762b]">
                  Flexible
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                {BUDGETS.map((item) => {
                  const active = budget === item.id;

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
                      <span className="text-sm font-bold">
                        {item.label}
                      </span>

                      {active && (
                        <Check size={16} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selectors */}
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  03. Product category
                </label>

                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-[#e5dccb] bg-[#fffdf9] px-4 pr-10 text-sm font-medium outline-none transition focus:border-[#c9a24d] focus:ring-2 focus:ring-[#c9a24d]/10"
                  >
                    <option value="all">
                      All Categories
                    </option>

                    {categories.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  04. Preferred brand
                </label>

                <div className="relative">
                  <select
                    value={brand}
                    onChange={(e) =>
                      setBrand(e.target.value)
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-[#e5dccb] bg-[#fffdf9] px-4 pr-10 text-sm font-medium outline-none transition focus:border-[#c9a24d] focus:ring-2 focus:ring-[#c9a24d]/10"
                  >
                    {BRANDS.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#eee6d7] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e5dccb] px-5 text-sm font-semibold text-gray-600 transition hover:bg-[#fffaf0]"
              >
                <RotateCcw size={16} />
                Reset
              </button>

              <button
                type="button"
                disabled={matching || loading}
                onClick={findMatches}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-7 text-sm font-bold text-white shadow-lg shadow-[#c9a24d]/10 transition hover:bg-[#b68e3e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {matching ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Finding your matches...
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

        {/* ================================================= */}
        {/* MATCH SUMMARY */}
        {/* ================================================= */}

        {matched && topMatch && (
          <section className="mt-6 rounded-[24px] border border-[#eadfca] bg-[#fffdf8] p-5 sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c9a24d] text-white">
                    <Sparkles size={15} />
                  </span>

                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#a17b2f]">
                    Match Complete
                  </span>
                </div>

                <h3 className="mt-3 text-2xl font-black">
                  We found products for you.
                </h3>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                  Based on your selected preferences, these
                  products received the strongest Prime Match
                  scores.
                </p>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-[#eadfca] bg-white p-4">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-[6px] border-[#eadfca]">
                  <div className="absolute inset-[-6px] rounded-full border-[6px] border-[#c9a24d] border-l-transparent border-b-transparent rotate-[-35deg]" />

                  <div className="text-center">
                    <span className="block text-xl font-black text-[#9b762b]">
                      {topMatch.matchScore}%
                    </span>

                    <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400">
                      Best Match
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400">
                    Top recommendation
                  </p>

                  <p className="mt-1 max-w-[180px] truncate text-sm font-bold">
                    {topMatch.name}
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-xs text-[#9b762b]">
                    <Star
                      size={12}
                      fill="currentColor"
                    />
                    {Number(
                      topMatch.rating || 0
                    ).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================================================= */}
        {/* RESULTS */}
        {/* ================================================= */}

        <section
          id="prime-match-results"
          className="mt-8 scroll-mt-24"
        >
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black">
                  {matched
                    ? "Your Prime Matches"
                    : "Recommended For You"}
                </h3>

                {matched && (
                  <span className="rounded-full bg-[#fff3d2] px-2.5 py-1 text-[10px] font-bold text-[#956f27]">
                    Personalized
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {loading
                  ? "Loading products..."
                  : matched
                    ? `${matchedProducts.length} products analyzed`
                    : "Explore some recommendations or build your personalized match above."}
              </p>
            </div>

            {matched && (
              <button
                type="button"
                onClick={() => setMatched(false)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#9b762b] hover:underline"
              >
                <RotateCcw size={15} />
                Change Preferences
              </button>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
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
                    <div className="h-11 w-full animate-pulse rounded-xl bg-[#eeeae2]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading &&
            matchedProducts.length === 0 && (
              <div className="rounded-[24px] border border-[#eadfca] bg-white px-6 py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff7e4] text-[#b58a32]">
                  <Target size={28} />
                </div>

                <h4 className="mt-5 text-xl font-bold">
                  No products found
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Try changing your category, budget or brand
                  preference.
                </p>

                <button
                  type="button"
                  onClick={reset}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#c9a24d] px-5 py-3 text-sm font-bold text-white"
                >
                  <RotateCcw size={15} />
                  Reset Match
                </button>
              </div>
            )}

          {/* Products */}
          {!loading &&
            matchedProducts.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {(matched
                  ? matchedProducts
                  : matchedProducts.slice(0, 8)
                ).map((product) => {
                  const image = getImageUrl(
                    product.image_url
                  );

                  const off = discount(
                    Number(product.price),
                    product.original_price
                      ? Number(
                          product.original_price
                        )
                      : null
                  );

                  const wished = wishlist.includes(
                    product.id
                  );

                  const added = cart.includes(
                    product.id
                  );

                  const outOfStock =
                    product.stock <= 0;

                  return (
                    <article
                      key={product.id}
                      className="group overflow-hidden rounded-[22px] border border-[#eadfca] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* Product image */}
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

                        {/* Match */}
                        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[#171717] px-3 py-1.5 text-[11px] font-bold text-white shadow-md">
                          <Target size={12} />
                          {product.matchScore}% Match
                        </div>

                        {/* Deal */}
                        {product.is_flash_sale && (
                          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white">
                            <Zap size={11} />
                            FLASH DEAL
                          </div>
                        )}

                        {off > 0 &&
                          !product.is_flash_sale && (
                            <div className="absolute bottom-3 left-3 rounded-full bg-[#c9a24d] px-2.5 py-1 text-[10px] font-bold text-white">
                              {off}% OFF
                            </div>
                          )}

                        {/* Wishlist */}
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
                              : "border-[#e8dfcf] text-gray-500 hover:border-red-200 hover:text-red-500"
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
                      </div>

                      {/* Details */}
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="max-w-[65%] truncate text-[10px] font-bold uppercase tracking-[0.14em] text-[#a17b2f]">
                            {product.categoryName}
                          </span>

                          {product.is_featured && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-[#a17b2f]">
                              <Sparkles size={11} />
                              PICK
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/dashboard/products/${product.id}`}
                        >
                          <h4 className="mt-2 line-clamp-2 min-h-[48px] text-[15px] font-bold leading-6 transition group-hover:text-[#a17b2f]">
                            {product.name}
                          </h4>
                        </Link>

                        {product.brand && (
                          <p className="mt-1 text-xs text-gray-400">
                            {product.brand}
                          </p>
                        )}

                        {/* Reasons */}
                        <div className="mt-4 min-h-[43px] space-y-1">
                          {product.reasons
                            .slice(0, 2)
                            .map((reason) => (
                              <div
                                key={reason}
                                className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600"
                              >
                                <Check size={11} />
                                {reason}
                              </div>
                            ))}
                        </div>

                        {/* Rating */}
                        <div className="mt-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#fff4d8] px-2 py-1 text-[11px] font-bold text-[#956f27]">
                            <Star
                              size={11}
                              fill="currentColor"
                            />
                            {Number(
                              product.rating || 0
                            ).toFixed(1)}
                          </span>

                          <span className="text-[11px] text-gray-400">
                            {product.reviews_count || 0}{" "}
                            reviews
                          </span>
                        </div>

                        {/* Price */}
                        <div className="mt-3 flex items-end gap-2">
                          <span className="text-xl font-black">
                            {money(
                              Number(product.price)
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
                                {money(
                                  Number(
                                    product.original_price
                                  )
                                )}
                              </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            disabled={outOfStock}
                            onClick={() =>
                              addToCart(product)
                            }
                            className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-bold transition ${
                              outOfStock
                                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                                : added
                                  ? "bg-emerald-600 text-white"
                                  : "bg-[#c9a24d] text-white hover:bg-[#b58d3f]"
                            }`}
                          >
                            {added ? (
                              <>
                                <Check size={15} />
                                Added
                              </>
                            ) : (
                              <>
                                <ShoppingCart
                                  size={15}
                                />
                                {outOfStock
                                  ? "Out of Stock"
                                  : "Add to Cart"}
                              </>
                            )}
                          </button>

                          <Link
                            href={`/dashboard/products/${product.id}`}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5dccb] text-gray-600 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] hover:text-[#9b762b]"
                          >
                            <ArrowRight size={17} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
        </section>

        {/* ================================================= */}
        {/* WHY PRIME MATCH */}
        {/* ================================================= */}

        <section className="mt-12">
          <div className="mb-6 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b58a32]">
              PRIME MATCH
            </span>

            <h3 className="mt-2 text-2xl font-black">
              Shopping, but more personal.
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
              Prime Match helps you spend less time searching
              and more time choosing.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[22px] border border-[#eadfca] bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32]">
                <UserRound size={22} />
              </div>

              <h4 className="mt-5 font-bold">
                Based on you
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Your budget, shopping purpose, category and
                brand preferences shape your recommendations.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#eadfca] bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32]">
                <Target size={22} />
              </div>

              <h4 className="mt-5 font-bold">
                Clear match scores
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Every recommendation gets a match percentage
                so you can quickly compare your options.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#eadfca] bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32]">
                <CircleHelp size={22} />
              </div>

              <h4 className="mt-5 font-bold">
                Know why it matches
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                See the reasons behind each recommendation
                instead of simply getting a product list.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-8 overflow-hidden rounded-[24px] border border-[#dfc98f] bg-[#fff7e4]">
          <div className="flex flex-col items-center justify-between gap-5 px-6 py-8 text-center sm:px-10 md:flex-row md:text-left">
            <div>
              <h3 className="text-xl font-black">
                Still not sure what to buy?
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Run Prime Match again and let your preferences
                guide you.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#c9a24d] px-5 text-sm font-bold text-white transition hover:bg-[#b58d3f]"
            >
              <Sparkles size={16} />
              Find My Match
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
