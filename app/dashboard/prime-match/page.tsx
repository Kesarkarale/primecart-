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

/* =========================================================
   TYPES
========================================================= */

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

type Budget = {
  id: string;
  label: string;
  min: number;
  max: number;
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

/* =========================================================
   CONSTANTS
========================================================= */

const PURPOSES = [
  {
    id: "everyday",
    title: "Everyday",
    description: "Daily essentials",
    icon: "✦",
  },
  {
    id: "work",
    title: "Work & Study",
    description: "Productivity",
    icon: "◫",
  },
  {
    id: "entertainment",
    title: "Entertainment",
    description: "Audio & gaming",
    icon: "▶",
  },
  {
    id: "fitness",
    title: "Fitness",
    description: "Active lifestyle",
    icon: "⌁",
  },
  {
    id: "style",
    title: "Style",
    description: "Fashion & looks",
    icon: "◇",
  },
  {
    id: "home",
    title: "Home",
    description: "Home essentials",
    icon: "⌂",
  },
];

const BUDGETS: Budget[] = [
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

/* =========================================================
   HELPERS
========================================================= */

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function getImageUrl(value: string | null) {
  if (!value) return null;

  const image = value.trim();

  if (!image) return null;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/")
  ) {
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
  originalPrice: number | null,
) {
  if (!originalPrice || originalPrice <= price) {
    return 0;
  }

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100,
  );
}

function getCategoryKeywords(categoryName: string) {
  const name = normalize(categoryName);

  if (name.includes("mobile")) {
    return [
      "mobile",
      "phone",
      "smartphone",
      "iphone",
      "android",
    ];
  }

  if (name.includes("fashion")) {
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

  if (name.includes("footwear")) {
    return [
      "shoe",
      "sneaker",
      "footwear",
      "running",
      "sandals",
      "slipper",
    ];
  }

  if (name.includes("watch")) {
    return [
      "watch",
      "smartwatch",
      "time",
    ];
  }

  if (name.includes("bag")) {
    return [
      "bag",
      "backpack",
      "luggage",
      "wallet",
    ];
  }

  if (name.includes("gaming")) {
    return [
      "gaming",
      "game",
      "keyboard",
      "mouse",
      "controller",
      "headset",
    ];
  }

  if (name.includes("automotive")) {
    return [
      "car",
      "automotive",
      "bike",
      "vehicle",
      "motor",
    ];
  }

  if (name.includes("appliance")) {
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
    name.includes("toy") ||
    name.includes("baby")
  ) {
    return [
      "toy",
      "baby",
      "kids",
      "children",
      "game",
    ];
  }

  if (name.includes("home")) {
    return [
      "home",
      "living",
      "kitchen",
      "cookware",
      "decor",
      "coffee",
    ];
  }

  return [name];
}

function getBudgetScore(
  price: number,
  budget: Budget,
) {
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
            Math.max(budget.min, 1)) *
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
          Math.max(budget.max, 1)) *
          60,
    ),
  );
}

function getPurposeScore(
  text: string,
  purpose: string,
) {
  const keywords =
    PURPOSE_KEYWORDS[purpose] || [];

  const matches = keywords.filter((keyword) =>
    text.includes(keyword),
  ).length;

  if (matches >= 3) return 100;
  if (matches === 2) return 93;
  if (matches === 1) return 78;

  return 52;
}

function getCategoryScore(
  product: Product,
  categories: Category[],
  selectedCategory: string,
  text: string,
) {
  /* IMPORTANT:
     "all" means every category gets a neutral score.
  */
  if (selectedCategory === "all") {
    return 80;
  }

  if (
    product.category_id ===
    selectedCategory
  ) {
    return 100;
  }

  const selectedCategoryData =
    categories.find(
      (item) =>
        item.id === selectedCategory,
    );

  if (!selectedCategoryData) {
    return 60;
  }

  const keywords =
    getCategoryKeywords(
      selectedCategoryData.name,
    );

  const matches = keywords.filter((keyword) =>
    text.includes(keyword),
  ).length;

  if (matches >= 2) return 82;
  if (matches === 1) return 68;

  return 25;
}

function getRatingScore(
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
      Math.max(1, reviews) + 1,
    ) / 3,
  );

  return Math.round(
    base *
      (0.75 + confidence * 0.25),
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
  const productCategory =
    categories.find(
      (item) =>
        item.id ===
        product.category_id,
    );

  const text = [
    product.name,
    product.brand,
    product.short_description,
    product.description,
    productCategory?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const budget =
    BUDGETS.find(
      (item) =>
        item.id === budgetId,
    ) || BUDGETS[1];

  const budgetScore =
    getBudgetScore(
      Number(product.price),
      budget,
    );

  const purposeScore =
    getPurposeScore(
      text,
      purpose,
    );

  const categoryScore =
    getCategoryScore(
      product,
      categories,
      selectedCategory,
      text,
    );

  /* IMPORTANT:
     "Any Brand" means no brand penalty.
  */
  const brandScore =
    selectedBrand === "Any Brand"
      ? 85
      : normalize(product.brand) ===
          normalize(selectedBrand)
        ? 100
        : 30;

  const ratingScore =
    getRatingScore(
      Number(product.rating || 0),
      Number(
        product.reviews_count || 0,
      ),
    );

  const availabilityScore =
    product.stock > 10
      ? 100
      : product.stock > 0
        ? 82
        : 0;

  let matchScore = Math.round(
    budgetScore * 0.28 +
      purposeScore * 0.22 +
      categoryScore * 0.2 +
      ratingScore * 0.15 +
      brandScore * 0.08 +
      availabilityScore * 0.07,
  );

  if (product.is_featured) {
    matchScore += 2;
  }

  if (product.is_flash_sale) {
    matchScore += 2;
  }

  if (
    getDiscount(
      Number(product.price),
      product.original_price,
    ) >= 20
  ) {
    matchScore += 2;
  }

  matchScore = Math.max(
    0,
    Math.min(99, matchScore),
  );

  const reasons: string[] = [];

  if (budgetScore >= 90) {
    reasons.push("Excellent budget fit");
  } else if (budgetScore >= 75) {
    reasons.push("Close to your budget");
  }

  if (purposeScore >= 90) {
    reasons.push("Strong purpose match");
  } else if (purposeScore >= 75) {
    reasons.push("Fits your use case");
  }

  if (categoryScore >= 95) {
    reasons.push("Exact category match");
  } else if (categoryScore >= 75) {
    reasons.push("Relevant category");
  }

  if (ratingScore >= 90) {
    reasons.push("Highly rated");
  }

  if (
    selectedBrand !== "Any Brand" &&
    brandScore >= 95
  ) {
    reasons.push("Preferred brand");
  }

  if (selectedBrand === "Any Brand") {
    reasons.push("Brand-flexible match");
  }

  if (product.is_flash_sale) {
    reasons.push("Flash deal available");
  }

  if (availabilityScore >= 90) {
    reasons.push("Good stock availability");
  }

  return {
    ...product,
    categoryName:
      productCategory?.name ||
      "PrimeCart Pick",
    matchScore,
    reasons:
      reasons.length > 0
        ? reasons.slice(0, 3)
        : ["Good overall match"],
    breakdown: {
      budget: budgetScore,
      purpose: purposeScore,
      category: categoryScore,
      rating: ratingScore,
      brand: brandScore,
      availability: availabilityScore,
    },
  };
}

/* =========================================================
   SCORE RING
========================================================= */

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

/* =========================================================
   SCORE BAR
========================================================= */

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

/* =========================================================
   MAIN PAGE
========================================================= */

export default function PrimeMatchPage() {
  const supabase = createClient();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [brands, setBrands] =
    useState<string[]>([]);

  const [wishlist, setWishlist] =
    useState<string[]>([]);

  const [cartIds, setCartIds] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [matching, setMatching] =
    useState(false);

  const [matched, setMatched] =
    useState(false);

  const [error, setError] =
    useState("");

  const [toast, setToast] =
    useState("");

  /* DEFAULT VALUES */

  const [purpose, setPurpose] =
    useState("everyday");

  const [budget, setBudget] =
    useState("1000-5000");

  /* VERY IMPORTANT */

  const [category, setCategory] =
    useState("all");

  const [brand, setBrand] =
    useState("Any Brand");

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    void loadData();
  }, []);

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
            `
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
            `,
          )
          .eq(
            "is_active",
            true,
          )
          .order(
            "created_at",
            {
              ascending: false,
            },
          ),

        supabase
          .from("categories")
          .select(
            "id, name, slug",
          )
          .order("name", {
            ascending: true,
          }),

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

      /* =====================================================
         GET UNIQUE BRANDS FROM PRODUCTS
      ===================================================== */

      const uniqueBrands =
        Array.from(
          new Set(
            productRows
              .map((product) =>
                product.brand?.trim(),
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

      /* =====================================================
         ALWAYS RESET TO VALID DEFAULT OPTIONS
      ===================================================== */

      setCategory("all");
      setBrand("Any Brand");
    } catch (err) {
      console.error(
        "Prime Match load error:",
        err,
      );

      setError(
        "Unable to load Prime Match data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     CART SYNC
  ======================================================= */

  useEffect(() => {
    function syncCart() {
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
    }

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

  /* =======================================================
     TOAST
  ======================================================= */

  useEffect(() => {
    if (!toast) return;

    const timer =
      window.setTimeout(() => {
        setToast("");
      }, 2500);

    return () =>
      window.clearTimeout(timer);
  }, [toast]);

  /* =======================================================
     MATCHING
  ======================================================= */

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

      const topProducts =
        rankedProducts.slice(
          0,
          Math.min(
            6,
            rankedProducts.length,
          ),
        );

      return Math.round(
        topProducts.reduce(
          (sum, product) =>
            sum +
            product.matchScore,
          0,
        ) / topProducts.length,
      );
    }, [rankedProducts]);

  const visibleProducts =
    rankedProducts.slice(
      0,
      matched ? 12 : 8,
    );

  /* =======================================================
     RUN MATCH
  ======================================================= */

  async function runMatch() {
    if (!products.length) {
      setToast(
        "No active products found.",
      );
      return;
    }

    setMatching(true);
    setMatched(false);

    await new Promise(
      (resolve) =>
        window.setTimeout(
          resolve,
          800,
        ),
    );

    setMatching(false);
    setMatched(true);

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

  /* =======================================================
     RESET
  ======================================================= */

  function resetPreferences() {
    setPurpose("everyday");
    setBudget("1000-5000");

    /* IMPORTANT */
    setCategory("all");
    setBrand("Any Brand");

    setMatched(false);
  }

  /* =======================================================
     WISHLIST
  ======================================================= */

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
      console.error(error);

      setToast(
        "Unable to add to wishlist.",
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

  /* =======================================================
     ADD TO CART
  ======================================================= */

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
          existing.quantity >=
          product.stock
        ) {
          setToast(
            "Maximum available stock reached.",
          );
          return;
        }

        existing.quantity += 1;
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

  /* =======================================================
     UI
  ======================================================= */

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

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a24d] text-white shadow-md">
              <Sparkles size={18} />
            </div>

            <div>
              <h1 className="text-sm font-black sm:text-base">
                Prime Match
              </h1>

              <p className="hidden text-[10px] text-gray-400 sm:block">
                Personalized shopping intelligence
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/products"
            className="flex h-10 items-center gap-2 rounded-xl border border-[#e5dccb] px-3 text-xs font-black text-gray-600 hover:border-[#c9a24d] dark:border-[#393126] dark:text-gray-300"
          >
            Browse Products
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[30px] border border-[#eadfca] bg-white dark:border-[#393126] dark:bg-[#181612]">

          <div className="absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-[#f0dca8]/30 blur-3xl" />

          <div className="relative grid items-center gap-10 px-6 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-14">

            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#eadfca] bg-[#fffaf0] px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#9b762b] dark:border-[#403524] dark:bg-[#211d15] dark:text-[#d9b86c]">
                <Sparkles size={12} />
                PrimeCart Intelligence
              </span>

              <h2 className="mt-5 max-w-3xl text-4xl font-black leading-[1.03] sm:text-5xl lg:text-6xl">
                Find what
                <span className="block text-[#b58a32]">
                  fits you.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-gray-500 dark:text-gray-400 sm:text-base">
                Tell Prime Match what you
                need, your budget and your
                preferences. We rank products
                from your actual catalogue.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                <span className="flex items-center gap-2 rounded-xl border border-[#eee5d6] bg-[#fffdf9] px-3 py-2 text-[10px] font-black dark:border-[#393126] dark:bg-[#211d15]">
                  <Target
                    size={13}
                    className="text-[#c9a24d]"
                  />
                  Personalized
                </span>

                <span className="flex items-center gap-2 rounded-xl border border-[#eee5d6] bg-[#fffdf9] px-3 py-2 text-[10px] font-black dark:border-[#393126] dark:bg-[#211d15]">
                  <TrendingUp
                    size={13}
                    className="text-[#c9a24d]"
                  />
                  Smart Ranking
                </span>

                <span className="flex items-center gap-2 rounded-xl border border-[#eee5d6] bg-[#fffdf9] px-3 py-2 text-[10px] font-black dark:border-[#393126] dark:bg-[#211d15]">
                  <BadgeCheck
                    size={13}
                    className="text-[#c9a24d]"
                  />
                  Live Products
                </span>
              </div>
            </div>

            <div className="hidden justify-center lg:flex">
              <div className="relative flex h-[300px] w-[300px] items-center justify-center rounded-full border border-[#eadfca] dark:border-[#393126]">
                <div className="absolute inset-8 rounded-full border border-dashed border-[#d4b66d]" />

                <div className="flex flex-col items-center">
                  <MatchRing
                    score={
                      topMatch?.matchScore ||
                      0
                    }
                    large
                  />

                  <p className="mt-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Current Match
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN BUILDER */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">

          {/* BUILDER */}
          <div className="rounded-[26px] border border-[#eadfca] bg-white dark:border-[#393126] dark:bg-[#181612]">

            <div className="border-b border-[#eee5d6] px-5 py-5 dark:border-[#393126] sm:px-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32] dark:bg-[#211d15]">
                    <Target size={20} />
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                      Match Builder
                    </p>

                    <h3 className="text-lg font-black">
                      Tell us what you need
                    </h3>
                  </div>
                </div>

                <span className="hidden items-center gap-1 text-[10px] text-gray-400 sm:flex">
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
                    Main purpose
                  </p>

                  <span className="text-[10px] text-gray-400">
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
                          className={`relative rounded-2xl border p-4 text-left transition ${
                            active
                              ? "border-[#c9a24d] bg-[#fffaf0] dark:bg-[#211d15]"
                              : "border-[#e9e1d2] hover:border-[#d5b76d] dark:border-[#393126]"
                          }`}
                        >
                          {active && (
                            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a24d] text-white">
                              <Check size={11} />
                            </span>
                          )}

                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7f2e7] text-sm text-[#9b762b] dark:bg-[#211d15]">
                            {item.icon}
                          </span>

                          <p className="mt-3 text-xs font-black">
                            {item.title}
                          </p>

                          <p className="mt-1 text-[10px] text-gray-400">
                            {item.description}
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
                    Your budget
                  </p>

                  <span className="text-[10px] font-black text-[#9b762b]">
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
                          className={`flex min-h-[50px] items-center justify-between rounded-xl border px-3 text-left ${
                            active
                              ? "border-[#c9a24d] bg-[#fffaf0] text-[#956f27] dark:bg-[#211d15]"
                              : "border-[#e9e1d2] dark:border-[#393126]"
                          }`}
                        >
                          <span className="text-[11px] font-black">
                            {item.label}
                          </span>

                          {active && (
                            <Check
                              size={14}
                            />
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {/* CATEGORY + BRAND */}
              <div className="mt-8 grid gap-5 md:grid-cols-2">

                {/* CATEGORY */}
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
                      onChange={(e) =>
                        setCategory(
                          e.target
                            .value,
                        )
                      }
                      className="h-12 w-full appearance-none rounded-xl border border-[#e5dccb] bg-[#fffdf9] px-4 pr-10 text-xs font-bold outline-none focus:border-[#c9a24d] dark:border-[#393126] dark:bg-[#181612]"
                    >
                      {/* ALWAYS SHOW */}
                      <option value="all">
                        All Categories
                      </option>

                      {/* DATABASE CATEGORIES */}
                      {categories.map(
                        (item) => (
                          <option
                            key={
                              item.id
                            }
                            value={
                              item.id
                            }
                          >
                            {item.name}
                          </option>
                        ),
                      )}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>

                  <p className="mt-2 text-[10px] text-gray-400">
                    Selected:{" "}
                    <span className="font-black text-[#9b762b]">
                      {category ===
                      "all"
                        ? "All Categories"
                        : categories.find(
                            (item) =>
                              item.id ===
                              category,
                          )?.name ||
                          "All Categories"}
                    </span>
                  </p>
                </div>

                {/* BRAND */}
                <div>
                  <p className="mb-2 text-sm font-black">
                    <span className="mr-2 text-[#c9a24d]">
                      04
                    </span>
                    Preferred Brand
                  </p>

                  <div className="relative">
                    <select
                      value={brand}
                      onChange={(e) =>
                        setBrand(
                          e.target
                            .value,
                        )
                      }
                      className="h-12 w-full appearance-none rounded-xl border border-[#e5dccb] bg-[#fffdf9] px-4 pr-10 text-xs font-bold outline-none focus:border-[#c9a24d] dark:border-[#393126] dark:bg-[#181612]"
                    >
                      {/* ALWAYS SHOW */}
                      <option value="Any Brand">
                        Any Brand
                      </option>

                      {/* DATABASE BRANDS */}
                      {brands.map(
                        (item) => (
                          <option
                            key={
                              item
                            }
                            value={
                              item
                            }
                          >
                            {item}
                          </option>
                        ),
                      )}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>

                  <p className="mt-2 text-[10px] text-gray-400">
                    Selected:{" "}
                    <span className="font-black text-[#9b762b]">
                      {brand ||
                        "Any Brand"}
                    </span>
                  </p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#eee5d6] pt-6 dark:border-[#393126] sm:flex-row sm:items-center sm:justify-between">

                <button
                  type="button"
                  onClick={
                    resetPreferences
                  }
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e5dccb] px-5 text-xs font-black dark:border-[#393126]"
                >
                  <RefreshCw size={15} />
                  Reset
                </button>

                <button
                  type="button"
                  disabled={
                    loading ||
                    matching ||
                    products.length ===
                      0
                  }
                  onClick={() =>
                    void runMatch()
                  }
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-7 text-xs font-black text-white shadow-lg shadow-[#c9a24d]/20 disabled:opacity-50 sm:text-sm"
                >
                  {matching ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Finding Matches...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Find My Prime Match
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* LIVE PREVIEW */}
          <aside className="rounded-[26px] border border-[#eadfca] bg-[#fffaf0] p-5 dark:border-[#393126] dark:bg-[#211d15] sm:p-6">

            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a27a2b]">
              Live Preview
            </p>

            <h3 className="mt-1 text-base font-black">
              Your match profile
            </h3>

            <div className="mt-6 flex justify-center">
              <MatchRing
                score={
                  topMatch?.matchScore ||
                  0
                }
                large
              />
            </div>

            <div className="mt-6 space-y-3">

              <div className="rounded-2xl bg-white p-4 dark:bg-[#181612]">
                <p className="text-[9px] font-black uppercase text-gray-400">
                  Purpose
                </p>

                <p className="mt-1 text-sm font-black">
                  {
                    PURPOSES.find(
                      (item) =>
                        item.id ===
                        purpose,
                    )?.title
                  }
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 dark:bg-[#181612]">
                <p className="text-[9px] font-black uppercase text-gray-400">
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

              <div className="rounded-2xl bg-white p-4 dark:bg-[#181612]">
                <p className="text-[9px] font-black uppercase text-gray-400">
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
                      "All Categories"}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 dark:bg-[#181612]">
                <p className="text-[9px] font-black uppercase text-gray-400">
                  Brand
                </p>

                <p className="mt-1 text-sm font-black">
                  {brand ||
                    "Any Brand"}
                </p>
              </div>
            </div>
          </aside>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadData()
              }
              className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* RESULTS */}
        <section
          id="match-results"
          className="mt-10 scroll-mt-24"
        >
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black">
                  {matched
                    ? "Your Prime Matches"
                    : "Recommended For You"}
                </h3>

                {matched && (
                  <span className="rounded-full bg-[#fff3d2] px-2.5 py-1 text-[9px] font-black text-[#956f27]">
                    LIVE RANKING
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {matched
                  ? `${rankedProducts.length} products ranked according to your preferences.`
                  : "Preview based on your current preferences."}
              </p>
            </div>

            <div className="text-xs font-bold text-gray-400">
              {products.length} active products
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="h-[480px] animate-pulse rounded-[23px] bg-[#eeeae2] dark:bg-[#211d15]"
                  />
                ),
              )}
            </div>
          ) : !visibleProducts.length ? (
            <div className="rounded-[25px] border border-[#eadfca] bg-white px-6 py-20 text-center dark:border-[#393126] dark:bg-[#181612]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32]">
                <Target size={28} />
              </div>

              <h4 className="mt-5 text-xl font-black">
                No products found
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your preferences.
              </p>

              <button
                type="button"
                onClick={
                  resetPreferences
                }
                className="mt-5 rounded-xl bg-[#c9a24d] px-5 py-3 text-xs font-black text-white"
              >
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
                    getImageUrl(
                      product.image_url,
                    );

                  const discount =
                    getDiscount(
                      Number(
                        product.price,
                      ),
                      product.original_price,
                    );

                  const isWished =
                    wishlist.includes(
                      product.id,
                    );

                  const isAdded =
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
                            sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-300">
                            <ShoppingCart
                              size={45}
                            />
                          </div>
                        )}

                        <div className="absolute left-3 top-3 rounded-full bg-[#171717] px-3 py-1.5 text-[10px] font-black text-white">
                          #{index + 1} ·{" "}
                          {
                            product.matchScore
                          }%
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            void toggleWishlist(
                              product.id,
                            )
                          }
                          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow ${
                            isWished
                              ? "text-red-500"
                              : "text-gray-500"
                          }`}
                        >
                          <Heart
                            size={18}
                            fill={
                              isWished
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>

                        <div className="absolute bottom-3 left-3 flex gap-2">
                          {discount >
                            0 && (
                            <span className="rounded-full bg-[#c9a24d] px-2.5 py-1 text-[9px] font-black text-white">
                              {discount}% OFF
                            </span>
                          )}

                          {product.is_flash_sale && (
                            <span className="flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[9px] font-black text-white">
                              <Zap size={10} />
                              FLASH
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="p-5">

                        <div className="flex justify-between">
                          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#a17b2f]">
                            {
                              product.categoryName
                            }
                          </span>

                          {product.is_featured && (
                            <span className="text-[9px] font-black text-[#a17b2f]">
                              <Sparkles
                                size={10}
                                className="inline"
                              />{" "}
                              PICK
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/dashboard/products/${product.id}`}
                        >
                          <h4 className="mt-2 line-clamp-2 min-h-[46px] text-[15px] font-black leading-6 group-hover:text-[#a17b2f]">
                            {
                              product.name
                            }
                          </h4>
                        </Link>

                        {product.brand && (
                          <p className="mt-1 text-[11px] text-gray-400">
                            {
                              product.brand
                            }
                          </p>
                        )}

                        {/* REASONS */}
                        <div className="mt-4 min-h-[38px] space-y-1">
                          {product.reasons
                            .slice(0, 2)
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
                                    size={11}
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
                          <span className="flex items-center gap-1 rounded-md bg-[#fff4d8] px-2 py-1 text-[10px] font-black text-[#956f27]">
                            <Star
                              size={10}
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
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(
                                  Number(
                                    product.original_price,
                                  ),
                                )}
                              </span>
                            )}
                        </div>

                        {/* ACTION */}
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
                            className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-[11px] font-black ${
                              product.stock <=
                              0
                                ? "bg-gray-200 text-gray-500"
                                : isAdded
                                  ? "bg-emerald-600 text-white"
                                  : "bg-[#c9a24d] text-white hover:bg-[#b58d3f]"
                            }`}
                          >
                            {product.stock <=
                            0 ? (
                              "Out of Stock"
                            ) : isAdded ? (
                              <>
                                <Check
                                  size={14}
                                />
                                Added
                              </>
                            ) : (
                              <>
                                <ShoppingCart
                                  size={14}
                                />
                                Add to Cart
                              </>
                            )}
                          </button>

                          <Link
                            href={`/dashboard/products/${product.id}`}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5dccb] hover:border-[#c9a24d] dark:border-[#393126]"
                          >
                            <ArrowRight
                              size={16}
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

        {/* TOP MATCH */}
        {matched &&
          topMatch && (
            <section className="mt-12 overflow-hidden rounded-[28px] border border-[#eadfca] bg-white dark:border-[#393126] dark:bg-[#181612]">

              <div className="border-b border-[#eee5d6] px-6 py-5 dark:border-[#393126]">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                  Match Intelligence
                </p>

                <h3 className="mt-1 text-xl font-black">
                  Why this is your #1 match
                </h3>
              </div>

              <div className="grid lg:grid-cols-[0.8fr_1.2fr]">

                {/* PRODUCT */}
                <div className="border-b border-[#eee5d6] p-6 dark:border-[#393126] lg:border-b-0 lg:border-r">

                  <div className="flex justify-center">
                    <MatchRing
                      score={
                        topMatch.matchScore
                      }
                      large
                    />
                  </div>

                  <div className="relative mt-6 h-56">
                    {getImageUrl(
                      topMatch.image_url,
                    ) ? (
                      <Image
                        src={
                          getImageUrl(
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
                    ) : null}
                  </div>

                  <p className="mt-4 text-center text-[9px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                    {
                      topMatch.categoryName
                    }
                  </p>

                  <h3 className="mt-2 text-center text-xl font-black">
                    {
                      topMatch.name
                    }
                  </h3>

                  <p className="mt-3 text-center text-2xl font-black">
                    {formatPrice(
                      Number(
                        topMatch.price,
                      ),
                    )}
                  </p>
                </div>

                {/* BREAKDOWN */}
                <div className="p-6 sm:p-8">

                  <div className="flex items-center gap-5">
                    <MatchRing
                      score={
                        topMatch.matchScore
                      }
                    />

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#a17b2f]">
                        Compatibility
                      </p>

                      <h4 className="mt-1 text-xl font-black">
                        Strong match
                      </h4>

                      <p className="mt-2 text-xs leading-6 text-gray-500">
                        Your preferences are
                        compared against
                        product data to
                        calculate this score.
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
                      Why it matches
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
                            <Check
                              size={13}
                              className="text-emerald-600"
                            />

                            {
                              reason
                            }
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        addToCart(
                          topMatch,
                        )
                      }
                      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] text-xs font-black text-white"
                    >
                      <ShoppingCart
                        size={15}
                      />
                      Add to Cart
                    </button>

                    <Link
                      href={`/dashboard/products/${topMatch.id}`}
                      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e5dccb] px-5 text-xs font-black dark:border-[#393126]"
                    >
                      View
                      <ArrowRight
                        size={15}
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
              HOW PRIME MATCH WORKS
            </span>

            <h3 className="mt-2 text-2xl font-black sm:text-3xl">
              From preferences to the
              right product.
            </h3>

            <p className="mt-3 text-sm text-gray-500">
              A transparent ranking system
              built around your shopping
              preferences.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              {
                number: "01",
                icon: Target,
                title:
                  "Set preferences",
                text:
                  "Choose purpose, budget, category and brand.",
              },
              {
                number: "02",
                icon: TrendingUp,
                title:
                  "Products are scored",
                text:
                  "Every active product is evaluated against your choices.",
              },
              {
                number: "03",
                icon: Sparkles,
                title:
                  "Matches are ranked",
                text:
                  "The strongest products automatically move to the top.",
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
                    className="rounded-[23px] border border-[#eadfca] bg-white p-6 dark:border-[#393126] dark:bg-[#181612]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32] dark:bg-[#211d15]">
                        <Icon
                          size={21}
                        />
                      </div>

                      <span className="text-3xl font-black text-[#eee4d2]">
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
                      {item.text}
                    </p>
                  </div>
                );
              },
            )}
          </div>
        </section>

        <div className="h-10" />
      </main>
    </div>
  );
}
