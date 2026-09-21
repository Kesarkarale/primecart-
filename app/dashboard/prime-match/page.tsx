"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleHelp,
  Heart,
  RefreshCw,
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

type MatchBreakdown = {
  budget: number;
  purpose: number;
  category: number;
  rating: number;
  brand: number;
  availability: number;
};

type MatchProduct = Product & {
  categoryName: string;
  matchScore: number;
  reasons: string[];
  breakdown: MatchBreakdown;
};

type BudgetOption = {
  id: string;
  label: string;
  min: number;
  max: number;
};

const PURPOSES = [
  {
    id: "everyday",
    title: "Everyday",
    description: "Daily essentials",
    symbol: "✦",
  },
  {
    id: "work",
    title: "Work & Study",
    description: "Productivity",
    symbol: "◫",
  },
  {
    id: "entertainment",
    title: "Entertainment",
    description: "Audio & gaming",
    symbol: "▶",
  },
  {
    id: "fitness",
    title: "Fitness",
    description: "Active lifestyle",
    symbol: "⌁",
  },
  {
    id: "style",
    title: "Style",
    description: "Fashion & looks",
    symbol: "◇",
  },
  {
    id: "home",
    title: "Home",
    description: "Home essentials",
    symbol: "⌂",
  },
];

const BUDGETS: BudgetOption[] = [
  {
    id: "under-1000",
    label: "Under ₹1,000",
    min: 0,
    max: 1000,
  },
  {
    id: "1000-5000",
    label: "₹1,000 – ₹5,000",
    min: 1000,
    max: 5000,
  },
  {
    id: "5000-15000",
    label: "₹5,000 – ₹15,000",
    min: 5000,
    max: 15000,
  },
  {
    id: "15000-plus",
    label: "₹15,000+",
    min: 15000,
    max: Infinity,
  },
];

const PURPOSE_KEYWORDS: Record<string, string[]> = {
  everyday: [
    "mobile",
    "phone",
    "smartphone",
    "watch",
    "bag",
    "bottle",
    "headphone",
    "earbuds",
    "shirt",
    "speaker",
    "wallet",
    "accessory",
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
    "notebook",
    "printer",
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
    "controller",
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
    "training",
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
    "mixer",
    "oven",
  ],
};

function normalize(value: string | null | undefined) {
  return (value || "").toLowerCase().trim();
}

function imageUrl(value: string | null) {
  if (!value) return null;

  const clean = value.trim();

  if (!clean) return null;

  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("/")
  ) {
    return clean;
  }

  return `/${clean}`;
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
  original: number | null,
) {
  if (!original || original <= price) return 0;

  return Math.round(
    ((original - price) / original) * 100,
  );
}

function categoryKeywords(name: string) {
  const category = normalize(name);

  if (category.includes("mobile")) {
    return [
      "mobile",
      "phone",
      "smartphone",
      "iphone",
      "android",
    ];
  }

  if (category.includes("fashion")) {
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
    return [
      "watch",
      "smartwatch",
      "time",
    ];
  }

  if (category.includes("bag")) {
    return [
      "bag",
      "backpack",
      "luggage",
      "wallet",
    ];
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

function budgetScore(
  price: number,
  budget: BudgetOption | undefined,
) {
  if (!budget) return 60;

  if (
    price >= budget.min &&
    price <= budget.max
  ) {
    return 100;
  }

  if (price < budget.min) {
    const difference = budget.min - price;

    return Math.max(
      45,
      Math.round(
        100 -
          (difference /
            Math.max(
              budget.min,
              1,
            )) *
            45,
      ),
    );
  }

  if (!Number.isFinite(budget.max)) {
    return price <= budget.min * 1.3
      ? 88
      : 68;
  }

  const difference = price - budget.max;

  return Math.max(
    30,
    Math.round(
      100 -
        (difference /
          Math.max(
            budget.max,
            1,
          )) *
          60,
    ),
  );
}

function purposeScore(
  text: string,
  purpose: string,
) {
  const keywords =
    PURPOSE_KEYWORDS[purpose] || [];

  const matches = keywords.filter(
    (keyword) =>
      text.includes(keyword),
  ).length;

  if (matches >= 3) return 100;
  if (matches === 2) return 93;
  if (matches === 1) return 78;

  return 52;
}

function categoryScore(
  product: Product,
  category: Category | undefined,
  selectedCategory: string,
  text: string,
) {
  if (selectedCategory === "all") {
    return 75;
  }

  if (
    product.category_id ===
    selectedCategory
  ) {
    return 100;
  }

  if (category) {
    const keywords =
      categoryKeywords(
        category.name,
      );

    const matches = keywords.filter(
      (keyword) =>
        text.includes(keyword),
    ).length;

    if (matches >= 2) return 82;
    if (matches === 1) return 68;
  }

  return 25;
}

function ratingScore(
  rating: number,
  reviews: number,
) {
  const safeRating = Math.min(
    5,
    Math.max(0, rating),
  );

  const base =
    (safeRating / 5) * 100;

  const confidence = Math.min(
    1,
    Math.log10(
      Math.max(
        1,
        reviews,
      ) + 1,
    ) / 3,
  );

  return Math.round(
    base *
      (0.75 +
        confidence * 0.25),
  );
}

function createMatch(
  product: Product,
  categories: Category[],
  purpose: string,
  budgetId: string,
  selectedCategory: string,
  selectedBrand: string,
): MatchProduct {
  const category = categories.find(
    (item) =>
      item.id ===
      product.category_id,
  );

  const text = [
    product.name,
    product.brand,
    product.short_description,
    product.description,
    category?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const budget = BUDGETS.find(
    (item) =>
      item.id === budgetId,
  );

  const budgetFit = budgetScore(
    Number(product.price),
    budget,
  );

  const purposeFit = purposeScore(
    text,
    purpose,
  );

  const categoryFit = categoryScore(
    product,
    categories.find(
      (item) =>
        item.id ===
        selectedCategory,
    ),
    selectedCategory,
    text,
  );

  const brandFit =
    selectedBrand === "Any Brand"
      ? 80
      : normalize(product.brand) ===
          normalize(selectedBrand)
        ? 100
        : 30;

  const ratingFit = ratingScore(
    Number(product.rating || 0),
    Number(
      product.reviews_count || 0,
    ),
  );

  const availability =
    product.stock > 10
      ? 100
      : product.stock > 0
        ? 82
        : 0;

  let score = Math.round(
    budgetFit * 0.28 +
      purposeFit * 0.22 +
      categoryFit * 0.2 +
      ratingFit * 0.15 +
      brandFit * 0.08 +
      availability * 0.07,
  );

  if (product.is_featured) {
    score += 2;
  }

  if (product.is_flash_sale) {
    score += 2;
  }

  if (
    discountPercent(
      Number(product.price),
      product.original_price,
    ) >= 20
  ) {
    score += 2;
  }

  score = Math.max(
    0,
    Math.min(99, score),
  );

  const reasons: string[] = [];

  if (budgetFit >= 90) {
    reasons.push(
      "Excellent budget fit",
    );
  } else if (budgetFit >= 75) {
    reasons.push(
      "Close to your budget",
    );
  }

  if (purposeFit >= 90) {
    reasons.push(
      "Strong purpose match",
    );
  } else if (purposeFit >= 75) {
    reasons.push(
      "Fits your use case",
    );
  }

  if (categoryFit >= 95) {
    reasons.push(
      "Exact category match",
    );
  } else if (categoryFit >= 75) {
    reasons.push(
      "Relevant category",
    );
  }

  if (ratingFit >= 90) {
    reasons.push(
      "Highly rated",
    );
  }

  if (brandFit >= 95) {
    reasons.push(
      "Preferred brand",
    );
  }

  if (product.is_flash_sale) {
    reasons.push(
      "Flash deal available",
    );
  }

  if (availability >= 90) {
    reasons.push(
      "Good stock availability",
    );
  }

  if (!reasons.length) {
    reasons.push(
      "Good overall match",
    );
  }

  return {
    ...product,
    categoryName:
      category?.name ||
      "PrimeCart Pick",
    matchScore: score,
    reasons: reasons.slice(0, 3),
    breakdown: {
      budget: budgetFit,
      purpose: purposeFit,
      category: categoryFit,
      rating: ratingFit,
      brand: brandFit,
      availability,
    },
  };
}

function MatchRing({
  score,
  large = false,
}: {
  score: number;
  large?: boolean;
}) {
  const size = large ? 150 : 105;
  const radius = large ? 57 : 40;
  const circumference =
    2 * Math.PI * radius;

  const offset =
    circumference -
    (score / 100) * circumference;

  return (
    <div
      className="relative shrink-0"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        viewBox="0 0 130 130"
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          className="text-[#e9dfcc] dark:text-[#3a3125]"
        />

        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-[#c9a24d]"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-black text-[#92702d] dark:text-[#d9b86c] ${
            large
              ? "text-3xl"
              : "text-xl"
          }`}
        >
          {score}%
        </span>

        <span className="text-[8px] font-black uppercase tracking-[0.18em] text-gray-400">
          Match
        </span>
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-500">
          {label}
        </span>

        <span className="text-[10px] font-black">
          {value}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[#eee7d9] dark:bg-[#3a3125]">
        <div
          className="h-full rounded-full bg-[#c9a24d] transition-all duration-700"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}

export default function PrimeMatchPage() {
  const supabase = createClient();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [brands, setBrands] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [matching, setMatching] =
    useState(false);

  const [hasMatched, setHasMatched] =
    useState(false);

  const [error, setError] =
    useState("");

  const [purpose, setPurpose] =
    useState("everyday");

  const [budget, setBudget] =
    useState("1000-5000");

  const [category, setCategory] =
    useState("all");

  const [brand, setBrand] =
    useState("Any Brand");

  const [wishlist, setWishlist] =
    useState<string[]>([]);

  const [cartIds, setCartIds] =
    useState<string[]>([]);

  const [toast, setToast] =
    useState("");

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const syncCart = () => {
      const stored =
        localStorage.getItem(
          "primecart-cart",
        );

      if (!stored) {
        setCartIds([]);
        return;
      }

      try {
        const items =
          JSON.parse(stored) as {
            id: string;
          }[];

        setCartIds(
          items.map(
            (item) => item.id,
          ),
        );
      } catch {
        setCartIds([]);
      }
    };

    syncCart();

    window.addEventListener(
      "cart-updated",
      syncCart,
    );

    window.addEventListener(
      "storage",
      syncCart,
    );

    return () => {
      window.removeEventListener(
        "cart-updated",
        syncCart,
      );

      window.removeEventListener(
        "storage",
        syncCart,
      );
    };
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer =
      window.setTimeout(
        () => setToast(""),
        2500,
      );

    return () =>
      window.clearTimeout(timer);
  }, [toast]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        window.location.href =
          "/auth/login";
        return;
      }

      const [
        productsResponse,
        categoriesResponse,
        wishlistResponse,
      ] = await Promise.all([
        supabase
          .from("products")
          .select(
            "id, category_id, name, slug, short_description, description, price, original_price, stock, image_url, brand, rating, reviews_count, is_featured, is_flash_sale, is_active",
          )
          .eq(
            "is_active",
            true,
          ),

        supabase
          .from("categories")
          .select(
            "id, name, slug",
          )
          .order("name"),

        supabase
          .from("wishlist")
          .select(
            "product_id",
          )
          .eq(
            "user_id",
            user.id,
          ),
      ]);

      if (productsResponse.error) {
        throw productsResponse.error;
      }

      if (
        categoriesResponse.error
      ) {
        throw categoriesResponse.error;
      }

      if (wishlistResponse.error) {
        throw wishlistResponse.error;
      }

      const productRows =
        (productsResponse.data ||
          []) as Product[];

      const categoryRows =
        (categoriesResponse.data ||
          []) as Category[];

      setProducts(productRows);
      setCategories(categoryRows);

      const uniqueBrands =
        Array.from(
          new Set(
            productRows
              .map(
                (item) =>
                  item.brand?.trim(),
              )
              .filter(
                (
                  value,
                ): value is string =>
                  Boolean(value),
              ),
          ),
        ).sort((a, b) =>
          a.localeCompare(b),
        );

      setBrands(uniqueBrands);

      setWishlist(
        (
          (wishlistResponse.data ||
            []) as {
            product_id: string;
          }[]
        ).map(
          (item) =>
            item.product_id,
        ),
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load Prime Match products.",
      );
    } finally {
      setLoading(false);
    }
  }

  const rankedProducts =
    useMemo(() => {
      return products
        .map((product) =>
          createMatch(
            product,
            categories,
            purpose,
            budget,
            category,
            brand,
          ),
        )
        .sort((a, b) => {
          if (
            b.matchScore !==
            a.matchScore
          ) {
            return (
              b.matchScore -
              a.matchScore
            );
          }

          return (
            Number(b.rating) -
            Number(a.rating)
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

  const topMatch =
    rankedProducts[0];

  const averageScore =
    useMemo(() => {
      if (!rankedProducts.length) {
        return 0;
      }

      const list =
        rankedProducts.slice(
          0,
          Math.min(
            6,
            rankedProducts.length,
          ),
        );

      return Math.round(
        list.reduce(
          (sum, item) =>
            sum + item.matchScore,
          0,
        ) / list.length,
      );
    }, [rankedProducts]);

  const visibleProducts =
    rankedProducts.slice(
      0,
      hasMatched ? 12 : 8,
    );

  async function runMatch() {
    if (!products.length) {
      setToast(
        "No active products are available.",
      );
      return;
    }

    setMatching(true);
    setHasMatched(false);

    await new Promise(
      (resolve) =>
        window.setTimeout(
          resolve,
          900,
        ),
    );

    setMatching(false);
    setHasMatched(true);

    setTimeout(() => {
      document
        .getElementById(
          "match-results",
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  function resetPreferences() {
    setPurpose("everyday");
    setBudget("1000-5000");
    setCategory("all");
    setBrand("Any Brand");
    setHasMatched(false);
  }

  async function toggleWishlist(
    productId: string,
  ) {
    const {
      data: { user },
    } =
      await supabase.auth.getUser();

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
          .eq(
            "user_id",
            user.id,
          )
          .eq(
            "product_id",
            productId,
          );

      if (error) {
        console.error(error);

        setToast(
          "Unable to remove wishlist item.",
        );

        return;
      }

      setWishlist(
        (current) =>
          current.filter(
            (id) =>
              id !== productId,
          ),
      );

      setToast(
        "Removed from wishlist.",
      );

      return;
    }

    const { error } =
      await supabase
        .from("wishlist")
        .insert({
          user_id: user.id,
          product_id: productId,
        });

    if (error) {
      if (
        error.code ===
        "23505"
      ) {
        setWishlist(
          (current) =>
            current.includes(
              productId,
            )
              ? current
              : [
                  ...current,
                  productId,
                ],
        );

        return;
      }

      console.error(error);

      setToast(
        "Unable to add wishlist item.",
      );

      return;
    }

    setWishlist(
      (current) => [
        ...current,
        productId,
      ],
    );

    setToast(
      "Added to wishlist.",
    );
  }

  function addToCart(
    product: Product,
  ) {
    if (product.stock <= 0) {
      setToast(
        "This product is out of stock.",
      );

      return;
    }

    try {
      const stored =
        localStorage.getItem(
          "primecart-cart",
        );

      let items: {
        id: string;
        name: string;
        price: number;
        image_url: string | null;
        quantity: number;
      }[] = [];

      if (stored) {
        try {
          items = JSON.parse(stored);
        } catch {
          items = [];
        }
      }

      const existing =
        items.find(
          (item) =>
            item.id ===
            product.id,
        );

      if (existing) {
        if (
          existing.quantity <
          product.stock
        ) {
          existing.quantity += 1;
        } else {
          setToast(
            "Maximum available stock reached.",
          );

          return;
        }
      } else {
        items.push({
          id: product.id,
          name: product.name,
          price: Number(
            product.price,
          ),
          image_url:
            product.image_url,
          quantity: 1,
        });
      }

      localStorage.setItem(
        "primecart-cart",
        JSON.stringify(items),
      );

      setCartIds(
        (current) =>
          current.includes(
            product.id,
          )
            ? current
            : [
                ...current,
                product.id,
              ],
      );

      window.dispatchEvent(
        new Event(
          "cart-updated",
        ),
      );

      setToast(
        `${product.name} added to cart.`,
      );
    } catch (err) {
      console.error(err);

      setToast(
        "Unable to add product to cart.",
      );
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-2xl border border-[#dbc48d] bg-white px-5 py-3 text-sm font-bold text-[#8e6b2a] shadow-2xl dark:border-[#514329] dark:bg-[#181612] dark:text-[#d9b86c]">
          {toast}
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#eadfca] bg-white/90 backdrop-blur-xl dark:border-[#393126] dark:bg-[#12100d]/90">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7dece] text-gray-500 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] hover:text-[#9a762f] dark:border-[#393126] dark:text-gray-300 dark:hover:bg-[#211d15]"
            >
              ←
            </Link>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a24d] text-white shadow-md shadow-[#c9a24d]/20">
              <Sparkles size={18} />
            </div>

            <div>
              <h1 className="text-sm font-black sm:text-base">
                Prime Match
              </h1>

              <p className="hidden text-[10px] font-medium text-gray-400 sm:block">
                Your personalized shopping intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-full border border-[#eadfca] bg-[#fffaf0] px-3 py-1.5 text-[10px] font-black text-[#98732d] dark:border-[#403524] dark:bg-[#211d15] dark:text-[#d9b86c] sm:flex sm:items-center sm:gap-1.5">
              <BadgeCheck size={13} />
              LIVE CATALOGUE
            </div>

            <Link
              href="/dashboard/products"
              className="flex h-10 items-center gap-2 rounded-xl border border-[#e5dccb] px-3 text-xs font-black text-gray-600 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] dark:border-[#393126] dark:text-gray-300 dark:hover:bg-[#211d15] sm:px-4 sm:text-sm"
            >
              Browse
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[30px] border border-[#eadfca] bg-white shadow-sm dark:border-[#393126] dark:bg-[#181612]">

          <div className="absolute -right-28 -top-32 h-[430px] w-[430px] rounded-full bg-[#f1dfae]/40 blur-3xl dark:bg-[#876a2f]/10" />

          <div className="absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-[#faf0d7] blur-3xl dark:bg-[#332918]/30" />

          <div className="relative grid min-h-[370px] items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-14 lg:py-12">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e9dfca] bg-[#fffaf0] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#9b762b] dark:border-[#4b3e2a] dark:bg-[#211d15] dark:text-[#d9b86c]">
                <Sparkles size={13} />
                PrimeCart Intelligence
              </div>

              <h2 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-[62px]">
                Shopping made
                <span className="block text-[#b58a32]">
                  personal.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-gray-500 dark:text-gray-400 sm:text-base">
                Prime Match understands
                your budget, purpose,
                category and preferences —
                then ranks products from
                your actual PrimeCart
                catalogue.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-[#eee5d6] bg-[#fffdf9] px-3 py-2 text-xs font-bold dark:border-[#393126] dark:bg-[#211d15]">
                  <Target
                    size={14}
                    className="text-[#c9a24d]"
                  />
                  Personalized
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-[#eee5d6] bg-[#fffdf9] px-3 py-2 text-xs font-bold dark:border-[#393126] dark:bg-[#211d15]">
                  <TrendingUp
                    size={14}
                    className="text-[#c9a24d]"
                  />
                  Smart Ranking
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-[#eee5d6] bg-[#fffdf9] px-3 py-2 text-xs font-bold dark:border-[#393126] dark:bg-[#211d15]">
                  <BadgeCheck
                    size={14}
                    className="text-[#c9a24d]"
                  />
                  Live Products
                </div>
              </div>
            </div>

            {/* HERO SCORE */}
            <div className="hidden justify-center lg:flex">
              <div className="relative flex h-[330px] w-[330px] items-center justify-center">

                <div className="absolute inset-0 rounded-full border border-[#e8ddc8]" />

                <div className="absolute inset-8 rounded-full border border-dashed border-[#d6b768]" />

                <div className="absolute inset-16 rounded-full bg-[#fffaf0] dark:bg-[#211d15]" />

                <div className="relative z-10 flex flex-col items-center">
                  <MatchRing
                    score={
                      topMatch?.matchScore ||
                      0
                    }
                    large
                  />

                  <div className="mt-[-4px] text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-400">
                      Current Match
                    </p>

                    <p className="mt-1 text-xs font-black text-[#9b762b] dark:text-[#d9b86c]">
                      {hasMatched
                        ? "Preferences analyzed"
                        : "Ready to analyze"}
                    </p>
                  </div>
                </div>

                <div className="absolute left-0 top-16 rounded-2xl border border-[#eadfca] bg-white px-4 py-3 shadow-lg dark:border-[#393126] dark:bg-[#181612]">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Products
                  </p>

                  <p className="mt-1 text-sm font-black">
                    {products.length}
                  </p>
                </div>

                <div className="absolute bottom-12 right-0 rounded-2xl border border-[#eadfca] bg-white px-4 py-3 shadow-lg dark:border-[#393126] dark:bg-[#181612]">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Average
                  </p>

                  <p className="mt-1 text-sm font-black text-[#9b762b]">
                    {averageScore}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BUILDER */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">

          <div className="overflow-hidden rounded-[26px] border border-[#eadfca] bg-white shadow-sm dark:border-[#393126] dark:bg-[#181612]">

            <div className="border-b border-[#eee5d6] px-5 py-5 dark:border-[#393126] sm:px-7">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32] dark:bg-[#211d15]">
                    <Target size={20} />
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                      Match Builder
                    </p>

                    <h3 className="mt-0.5 text-lg font-black">
                      Tell us what you need
                    </h3>
                  </div>
                </div>

                <span className="hidden items-center gap-1.5 text-[10px] font-bold text-gray-400 sm:flex">
                  <CircleHelp size={13} />
                  Adjust anytime
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-7">

              {/* PURPOSE */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black">
                    <span className="mr-2 text-[#c9a24d]">
                      01
                    </span>
                    What's the main purpose?
                  </p>

                  <span className="text-[10px] font-semibold text-gray-400">
                    Choose one
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PURPOSES.map(
                    (item) => {
                      const active =
                        purpose ===
                        item.id;

                      return (
                        <button
                          key={
                            item.id
                          }
                          type="button"
                          onClick={() =>
                            setPurpose(
                              item.id,
                            )
                          }
                          className={`group relative rounded-2xl border p-4 text-left transition-all ${
                            active
                              ? "border-[#c9a24d] bg-[#fffaf0] shadow-sm dark:bg-[#211d15]"
                              : "border-[#e9e1d2] hover:border-[#d5b76d] hover:bg-[#fffdf9] dark:border-[#393126] dark:hover:bg-[#211d15]"
                          }`}
                        >
                          {active && (
                            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a24d] text-white">
                              <Check size={11} />
                            </span>
                          )}

                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm transition ${
                              active
                                ? "bg-[#c9a24d] text-white"
                                : "bg-[#f7f2e7] text-[#9b762b] dark:bg-[#211d15]"
                            }`}
                          >
                            {
                              item.symbol
                            }
                          </span>

                          <p className="mt-3 text-xs font-black sm:text-sm">
                            {
                              item.title
                            }
                          </p>

                          <p className="mt-1 text-[10px] text-gray-400">
                            {
                              item.description
                            }
                          </p>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {/* BUDGET */}
              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black">
                    <span className="mr-2 text-[#c9a24d]">
                      02
                    </span>
                    What's your budget?
                  </p>

                  <span className="rounded-full bg-[#fff6df] px-3 py-1 text-[10px] font-black text-[#98732d] dark:bg-[#211d15] dark:text-[#d9b86c]">
                    {
                      BUDGETS.find(
                        (item) =>
                          item.id ===
                          budget,
                      )?.label
                    }
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {BUDGETS.map(
                    (item) => {
                      const active =
                        budget ===
                        item.id;

                      return (
                        <button
                          key={
                            item.id
                          }
                          type="button"
                          onClick={() =>
                            setBudget(
                              item.id,
                            )
                          }
                          className={`flex min-h-[50px] items-center justify-between rounded-xl border px-3 text-left transition ${
                            active
                              ? "border-[#c9a24d] bg-[#fffaf0] text-[#956f27] dark:bg-[#211d15] dark:text-[#d9b86c]"
                              : "border-[#e9e1d2] hover:border-[#d5b76d] dark:border-[#393126]"
                          }`}
                        >
                          <span className="text-[11px] font-black sm:text-xs">
                            {
                              item.label
                            }
                          </span>

                          {active && (
                            <Check
                              size={
                                14
                              }
                            />
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {/* CATEGORY / BRAND */}
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-black">
                    <span className="mr-2 text-[#c9a24d]">
                      03
                    </span>
                    Category
                  </p>

                  <div className="relative">
                    <select
                      value={
                        category
                      }
                      onChange={(
                        event,
                      ) =>
                        setCategory(
                          event
                            .target
                            .value,
                        )
                      }
                      className="h-12 w-full appearance-none rounded-xl border border-[#e5dccb] bg-[#fffdf9] px-4 pr-10 text-xs font-bold outline-none transition focus:border-[#c9a24d] dark:border-[#393126] dark:bg-[#181612]"
                    >
                      <option value="all">
                        All Categories
                      </option>

                      {categories.map(
                        (
                          item,
                        ) => (
                          <option
                            key={
                              item.id
                            }
                            value={
                              item.id
                            }
                          >
                            {
                              item.name
                            }
                          </option>
                        ),
                      )}
                    </select>

                    <ChevronDown
                      size={
                        16
                      }
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-black">
                    <span className="mr-2 text-[#c9a24d]">
                      04
                    </span>
                    Preferred brand
                  </p>

                  <div className="relative">
                    <select
                      value={brand}
                      onChange={(
                        event,
                      ) =>
                        setBrand(
                          event
                            .target
                            .value,
                        )
                      }
                      className="h-12 w-full appearance-none rounded-xl border border-[#e5dccb] bg-[#fffdf9] px-4 pr-10 text-xs font-bold outline-none transition focus:border-[#c9a24d] dark:border-[#393126] dark:bg-[#181612]"
                    >
                      <option value="Any Brand">
                        Any Brand
                      </option>

                      {brands.map(
                        (
                          item,
                        ) => (
                          <option
                            key={
                              item
                            }
                            value={
                              item
                            }
                          >
                            {
                              item
                            }
                          </option>
                        ),
                      )}
                    </select>

                    <ChevronDown
                      size={
                        16
                      }
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION */}
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#eee5d6] pt-6 dark:border-[#393126] sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={
                    resetPreferences
                  }
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e5dccb] px-5 text-xs font-black text-gray-600 transition hover:bg-[#fffaf0] dark:border-[#393126] dark:text-gray-300 dark:hover:bg-[#211d15]"
                >
                  <RefreshCw
                    size={15}
                  />
                  Reset
                </button>

                <button
                  type="button"
                  disabled={
                    loading ||
                    matching ||
                    !products.length
                  }
                  onClick={() =>
                    void runMatch()
                  }
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-7 text-xs font-black text-white shadow-lg shadow-[#c9a24d]/15 transition hover:bg-[#b58d3f] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                >
                  {matching ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles
                        size={16}
                      />
                      Find My Prime Match
                      <ArrowRight
                        size={16}
                      />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* LIVE PREVIEW */}
          <aside className="rounded-[26px] border border-[#eadfca] bg-[#fffaf0] p-5 dark:border-[#393126] dark:bg-[#211d15] sm:p-6">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a27a2b]">
                  Live Preview
                </p>

                <h3 className="mt-1 text-base font-black">
                  Your match profile
                </h3>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#b58a32] dark:bg-[#181612]">
                <Sparkles size={16} />
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <MatchRing
                score={
                  topMatch?.matchScore ||
                  0
                }
                large
              />
            </div>

            <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
              {hasMatched
                ? "Best current match"
                : "Preview score"}
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-white p-3.5 dark:bg-[#181612]">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Shopping for
                </p>

                <p className="mt-1 text-sm font-black capitalize">
                  {
                    PURPOSES.find(
                      (item) =>
                        item.id ===
                        purpose,
                    )?.title
                  }
                </p>
              </div>

              <div className="rounded-2xl bg-white p-3.5 dark:bg-[#181612]">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Budget
                </p>

                <p className="mt-1 text-sm font-black">
                  {
                    BUDGETS.find(
                      (item) =>
                        item.id ===
                        budget,
                    )?.label
                  }
                </p>
              </div>

              <div className="rounded-2xl bg-white p-3.5 dark:bg-[#181612]">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Category
                </p>

                <p className="mt-1 text-sm font-black">
                  {category ===
                  "all"
                    ? "All Categories"
                    : categories.find(
                        (item) =>
                          item.id ===
                          category,
                      )?.name ||
                      "Selected category"}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#eadfca] bg-white p-4 dark:border-[#393126] dark:bg-[#181612]">
              <div className="flex items-center gap-2">
                <Check
                  size={15}
                  className="text-emerald-600"
                />

                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                  Preferences update your ranking instantly
                </span>
              </div>
            </div>
          </aside>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadData()
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* RESULTS */}
        <section
          id="match-results"
          className="mt-10 scroll-mt-24"
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-2xl font-black">
                  {hasMatched
                    ? "Your Prime Matches"
                    : "Recommended For You"}
                </h3>

                {hasMatched && (
                  <span className="rounded-full bg-[#fff3d2] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#956f27] dark:bg-[#211d15] dark:text-[#d9b86c]">
                    Ranked Live
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {hasMatched
                  ? `${rankedProducts.length} products ranked according to your preferences.`
                  : "A preview of products matching your current profile."}
              </p>
            </div>

            {hasMatched && (
              <button
                type="button"
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  })
                }
                className="inline-flex items-center gap-2 text-xs font-black text-[#9b762b] hover:underline"
              >
                <RefreshCw
                  size={14}
                />
                Refine Match
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[
                1, 2, 3, 4,
              ].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-[22px] border border-[#eadfca] bg-white dark:border-[#393126] dark:bg-[#181612]"
                >
                  <div className="h-64 animate-pulse bg-[#eeeae2] dark:bg-[#211d15]" />

                  <div className="space-y-3 p-5">
                    <div className="h-3 w-20 animate-pulse rounded bg-[#eeeae2] dark:bg-[#211d15]" />
                    <div className="h-5 w-full animate-pulse rounded bg-[#eeeae2] dark:bg-[#211d15]" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-[#eeeae2] dark:bg-[#211d15]" />
                    <div className="h-8 w-1/3 animate-pulse rounded bg-[#eeeae2] dark:bg-[#211d15]" />
                    <div className="h-11 animate-pulse rounded-xl bg-[#eeeae2] dark:bg-[#211d15]" />
                  </div>
                </div>
              ))}
            </div>
          ) : !visibleProducts.length ? (
            <div className="rounded-[25px] border border-[#eadfca] bg-white px-6 py-20 text-center dark:border-[#393126] dark:bg-[#181612]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32] dark:bg-[#211d15]">
                <Target size={28} />
              </div>

              <h4 className="mt-5 text-xl font-black">
                No suitable products found
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Try another category,
                budget or brand to
                discover more PrimeCart
                matches.
              </p>

              <button
                type="button"
                onClick={
                  resetPreferences
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#c9a24d] px-5 py-3 text-xs font-black text-white"
              >
                <RefreshCw
                  size={14}
                />
                Reset Preferences
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map(
                (
                  product,
                  index,
                ) => {
                  const image =
                    imageUrl(
                      product.image_url,
                    );

                  const discount =
                    discountPercent(
                      Number(
                        product.price,
                      ),
                      product.original_price,
                    );

                  const wished =
                    wishlist.includes(
                      product.id,
                    );

                  const added =
                    cartIds.includes(
                      product.id,
                    );

                  return (
                    <article
                      key={
                        product.id
                      }
                      className="group overflow-hidden rounded-[23px] border border-[#eadfca] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-[#393126] dark:bg-[#181612]"
                    >
                      {/* IMAGE */}
                      <div className="relative h-[270px] overflow-hidden bg-[#faf9f6] dark:bg-[#211d15]">

                        {image ? (
                          <Image
                            src={image}
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
                              size={42}
                            />
                          </div>
                        )}

                        {/* RANK */}
                        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[#171717] px-3 py-1.5 text-[10px] font-black text-white shadow">
                          #{index + 1}
                          <span className="text-[#d9b86c]">
                            {product.matchScore}%
                          </span>
                        </div>

                        {/* WISHLIST */}
                        <button
                          type="button"
                          aria-label="Wishlist"
                          onClick={() =>
                            void toggleWishlist(
                              product.id,
                            )
                          }
                          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border bg-white/95 shadow-sm transition ${
                            wished
                              ? "border-red-200 text-red-500"
                              : "border-[#e7dece] text-gray-500 hover:border-red-200 hover:text-red-500"
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

                        {/* BADGES */}
                        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                          {discount >
                            0 && (
                            <span className="rounded-full bg-[#c9a24d] px-2.5 py-1 text-[9px] font-black text-white">
                              {discount}%
                              OFF
                            </span>
                          )}

                          {product.is_flash_sale && (
                            <span className="flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[9px] font-black text-white">
                              <Zap
                                size={
                                  10
                                }
                              />
                              FLASH
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="max-w-[70%] truncate text-[9px] font-black uppercase tracking-[0.15em] text-[#a17b2f]">
                            {
                              product.categoryName
                            }
                          </span>

                          {product.is_featured && (
                            <span className="flex items-center gap-1 text-[9px] font-black text-[#a17b2f]">
                              <Sparkles
                                size={
                                  10
                                }
                              />
                              PICK
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/dashboard/products/${product.id}`}
                        >
                          <h4 className="mt-2 line-clamp-2 min-h-[46px] text-[15px] font-black leading-6 transition group-hover:text-[#a17b2f]">
                            {
                              product.name
                            }
                          </h4>
                        </Link>

                        {product.brand && (
                          <p className="mt-1 text-[11px] font-medium text-gray-400">
                            {
                              product.brand
                            }
                          </p>
                        )}

                        {/* REASONS */}
                        <div className="mt-4 min-h-[39px] space-y-1.5">
                          {product.reasons
                            .slice(
                              0,
                              2,
                            )
                            .map(
                              (
                                reason,
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
                              ),
                            )}
                        </div>

                        {/* RATING */}
                        <div className="mt-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#fff4d8] px-2 py-1 text-[10px] font-black text-[#956f27] dark:bg-[#211d15] dark:text-[#d9b86c]">
                            <Star
                              size={
                                10
                              }
                              fill="currentColor"
                            />
                            {Number(
                              product.rating ||
                                0,
                            ).toFixed(
                              1,
                            )}
                          </span>

                          <span className="text-[10px] text-gray-400">
                            {
                              product.reviews_count
                            }{" "}
                            reviews
                          </span>
                        </div>

                        {/* PRICE */}
                        <div className="mt-3 flex items-end gap-2">
                          <span className="text-xl font-black">
                            {formatPrice(
                              Number(
                                product.price,
                              ),
                            )}
                          </span>

                          {product.original_price &&
                            Number(
                              product.original_price,
                            ) >
                              Number(
                                product.price,
                              ) && (
                              <span className="mb-0.5 text-xs text-gray-400 line-through">
                                {formatPrice(
                                  Number(
                                    product.original_price,
                                  ),
                                )}
                              </span>
                            )}
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            disabled={
                              product.stock <=
                              0
                            }
                            onClick={() =>
                              addToCart(
                                product,
                              )
                            }
                            className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-[11px] font-black transition ${
                              product.stock <=
                              0
                                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                                : added
                                  ? "bg-emerald-600 text-white"
                                  : "bg-[#c9a24d] text-white hover:bg-[#b58d3f]"
                            }`}
                          >
                            {product.stock <=
                            0 ? (
                              "Out of Stock"
                            ) : added ? (
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
                                Add to Cart
                              </>
                            )}
                          </button>

                          <Link
                            href={`/dashboard/products/${product.id}`}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5dccb] text-gray-600 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] hover:text-[#9b762b] dark:border-[#393126] dark:text-gray-300 dark:hover:bg-[#211d15]"
                          >
                            <ArrowRight
                              size={
                                16
                              }
                            />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </section>

        {/* TOP MATCH DETAILS */}
        {hasMatched &&
          topMatch && (
            <section className="mt-12 overflow-hidden rounded-[28px] border border-[#eadfca] bg-white shadow-sm dark:border-[#393126] dark:bg-[#181612]">

              <div className="border-b border-[#eee5d6] px-6 py-5 dark:border-[#393126] sm:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                      Match Intelligence
                    </p>

                    <h3 className="mt-1 text-xl font-black">
                      Why this product ranked #1
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                    <BadgeCheck
                      size={14}
                      className="text-emerald-600"
                    />
                    Based on your current preferences
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-[0.85fr_1.15fr]">

                {/* PRODUCT */}
                <div className="border-b border-[#eee5d6] p-6 dark:border-[#393126] lg:border-b-0 lg:border-r sm:p-8">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#171717] px-3 py-1.5 text-[9px] font-black text-white">
                      #1 TOP MATCH
                    </span>

                    <span className="rounded-full bg-[#fff4d8] px-3 py-1.5 text-[9px] font-black text-[#956f27] dark:bg-[#211d15] dark:text-[#d9b86c]">
                      {topMatch.matchScore}% MATCH
                    </span>
                  </div>

                  <div className="mt-6 flex flex-col items-center text-center">
                    <div className="relative h-56 w-full">
                      {imageUrl(
                        topMatch.image_url,
                      ) ? (
                        <Image
                          src={
                            imageUrl(
                              topMatch.image_url,
                            )!
                          }
                          alt={
                            topMatch.name
                          }
                          fill
                          className="object-contain"
                          sizes="500px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-300">
                          <ShoppingCart
                            size={
                              48
                            }
                          />
                        </div>
                      )}
                    </div>

                    <span className="mt-5 text-[9px] font-black uppercase tracking-[0.18em] text-[#a17b2f]">
                      {
                        topMatch.categoryName
                      }
                    </span>

                    <Link
                      href={`/dashboard/products/${topMatch.id}`}
                      className="mt-2 text-xl font-black transition hover:text-[#a17b2f]"
                    >
                      {
                        topMatch.name
                      }
                    </Link>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="flex items-center gap-1 rounded-lg bg-[#fff4d8] px-2.5 py-1.5 text-xs font-black text-[#956f27] dark:bg-[#211d15] dark:text-[#d9b86c]">
                        <Star
                          size={
                            12
                          }
                          fill="currentColor"
                        />
                        {Number(
                          topMatch.rating ||
                            0,
                        ).toFixed(
                          1,
                        )}
                      </span>

                      <span className="text-xs text-gray-400">
                        {
                          topMatch.reviews_count
                        }{" "}
                        reviews
                      </span>
                    </div>

                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-2xl font-black">
                        {formatPrice(
                          Number(
                            topMatch.price,
                          ),
                        )}
                      </span>

                      {topMatch.original_price &&
                        Number(
                          topMatch.original_price,
                        ) >
                          Number(
                            topMatch.price,
                          ) && (
                          <span className="mb-0.5 text-xs text-gray-400 line-through">
                            {formatPrice(
                              Number(
                                topMatch.original_price,
                              ),
                            )}
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                {/* ANALYSIS */}
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <MatchRing
                      score={
                        topMatch.matchScore
                      }
                    />

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#a17b2f]">
                        Overall compatibility
                      </p>

                      <h4 className="mt-1 text-2xl font-black">
                        Strong match for you
                      </h4>

                      <p className="mt-2 max-w-lg text-xs leading-6 text-gray-500">
                        This score is calculated
                        from your budget,
                        shopping purpose,
                        category preference,
                        product rating,
                        brand preference and
                        stock availability.
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    <ScoreBar
                      label="Budget Fit"
                      value={
                        topMatch
                          .breakdown
                          .budget
                      }
                    />

                    <ScoreBar
                      label="Purpose Fit"
                      value={
                        topMatch
                          .breakdown
                          .purpose
                      }
                    />

                    <ScoreBar
                      label="Category Fit"
                      value={
                        topMatch
                          .breakdown
                          .category
                      }
                    />

                    <ScoreBar
                      label="Rating Quality"
                      value={
                        topMatch
                          .breakdown
                          .rating
                      }
                    />

                    <ScoreBar
                      label="Brand Fit"
                      value={
                        topMatch
                          .breakdown
                          .brand
                      }
                    />

                    <ScoreBar
                      label="Availability"
                      value={
                        topMatch
                          .breakdown
                          .availability
                      }
                    />
                  </div>

                  <div className="mt-7 rounded-2xl bg-[#fffaf0] p-5 dark:bg-[#211d15]">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#a17b2f]">
                      Key reasons
                    </p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {topMatch.reasons.map(
                        (
                          reason,
                        ) => (
                          <div
                            key={
                              reason
                            }
                            className="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-bold dark:bg-[#181612]"
                          >
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
                              <Check
                                size={
                                  11
                                }
                              />
                            </span>

                            {
                              reason
                            }
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                    <button
                      type="button"
                      onClick={() =>
                        addToCart(
                          topMatch,
                        )
                      }
                      disabled={
                        topMatch.stock <=
                        0
                      }
                      className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-black ${
                        topMatch.stock <=
                        0
                          ? "cursor-not-allowed bg-gray-200 text-gray-500"
                          : cartIds.includes(
                                topMatch.id,
                              )
                            ? "bg-emerald-600 text-white"
                            : "bg-[#c9a24d] text-white hover:bg-[#b58d3f]"
                      }`}
                    >
                      {cartIds.includes(
                        topMatch.id,
                      ) ? (
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

                    <Link
                      href={`/dashboard/products/${topMatch.id}`}
                      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e5dccb] px-5 text-xs font-black text-gray-700 hover:border-[#c9a24d] hover:text-[#9b762b] dark:border-[#393126] dark:text-gray-200"
                    >
                      View Details
                      <ArrowRight
                        size={
                          15
                        }
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

        {/* HOW IT WORKS */}
        <section className="mt-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#b58a32]">
              THE PRIME MATCH ENGINE
            </span>

            <h3 className="mt-2 text-2xl font-black sm:text-3xl">
              From preferences to
              the right product.
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Prime Match turns your
              shopping preferences into a
              transparent product ranking.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              {
                number: "01",
                icon: Target,
                title:
                  "Set your preferences",
                description:
                  "Choose your purpose, budget, category and preferred brand.",
              },
              {
                number: "02",
                icon: TrendingUp,
                title:
                  "Products are scored",
                description:
                  "Each active product is evaluated against your selected signals.",
              },
              {
                number: "03",
                icon: Sparkles,
                title:
                  "Matches are ranked",
                description:
                  "The strongest matches move to the top so you can shop faster.",
              },
            ].map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={
                      item.number
                    }
                    className="group rounded-[23px] border border-[#eadfca] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg dark:border-[#393126] dark:bg-[#181612]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32] dark:bg-[#211d15]">
                        <Icon
                          size={21}
                        />
                      </div>

                      <span className="text-3xl font-black text-[#eee4d2] dark:text-[#393126]">
                        {
                          item.number
                        }
                      </span>
                    </div>

                    <h4 className="mt-5 text-base font-black">
                      {
                        item.title
                      }
                    </h4>

                    <p className="mt-2 text-xs leading-6 text-gray-500">
                      {
                        item.description
                      }
                    </p>
                  </div>
                );
              },
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-8 overflow-hidden rounded-[27px] border border-[#dfc98f] bg-[#fff7e4] dark:border-[#4d402b] dark:bg-[#211d15]">
          <div className="flex flex-col items-center justify-between gap-5 px-6 py-8 text-center md:flex-row md:px-10 md:text-left">
            <div>
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <Sparkles
                  size={15}
                  className="text-[#b58a32]"
                />

                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#9b762b]">
                  PrimeCart
                </span>
              </div>

              <h3 className="mt-2 text-xl font-black">
                Not quite right?
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Refine your preferences
                and discover another set
                of personalized matches.
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
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#c9a24d] px-5 text-xs font-black text-white transition hover:bg-[#b58d3f]"
            >
              <RefreshCw
                size={14}
              />
              Refine My Match
            </button>
          </div>
        </section>

        <div className="h-10" />
      </main>
    </div>
  );
}
