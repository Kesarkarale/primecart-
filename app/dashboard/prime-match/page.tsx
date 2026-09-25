"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Check,
  ChevronDown,
  Heart,
  History,
  Lightbulb,
  Loader2,
  RefreshCw,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  X,
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

type Breakdown = {
  budget: number;
  category: number;
  purpose: number;
  quality: number;
  rating: number;
  brand: number;
  availability: number;
  search: number;
};

type MatchProduct = Product & {
  categoryName: string;
  matchScore: number;
  reasons: string[];
  breakdown: Breakdown;
};

type Budget = {
  id: string;
  label: string;
  min: number;
  max: number;
};

type Importance = {
  budget: number;
  quality: number;
  brand: number;
  rating: number;
};

type MatchHistoryEntry = {
  purpose: string;
  budget: string;
  category: string;
  brand: string;
  search: string;
  createdAt: number;
};

/* =========================================================
   CONSTANTS
========================================================= */

const PRODUCT_IMAGE_FALLBACK = "/product-placeholder.png";

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

const BUDGETS: Budget[] = [
  {
    id: "under-1000",
    label: "Under ₹1K",
    min: 0,
    max: 1000,
  },
  {
    id: "1000-5000",
    label: "₹1K – ₹5K",
    min: 1000,
    max: 5000,
  },
  {
    id: "5000-15000",
    label: "₹5K – ₹15K",
    min: 5000,
    max: 15000,
  },
  {
    id: "15000-plus",
    label: "₹15K+",
    min: 15000,
    max: Infinity,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getImageUrl(value: string | null) {
  if (!value?.trim()) return null;

  const cleaned = value.trim();

  if (
    cleaned.startsWith("http://") ||
    cleaned.startsWith("https://")
  ) {
    return cleaned;
  }

  if (cleaned.startsWith("/")) {
    return cleaned;
  }

  return `/products/${cleaned}`;
}

function money(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function discount(
  price: number,
  original: number | null
) {
  if (!original || original <= price) {
    return 0;
  }

  return Math.round(
    ((original - price) / original) * 100
  );
}

function clamp(
  value: number,
  min = 0,
  max = 100
) {
  return Math.max(min, Math.min(max, value));
}

function normalize(value: string | null | undefined) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

/* =========================================================
   KEYWORDS
========================================================= */

function keywordsForPurpose(
  purpose: string
) {
  const map: Record<string, string[]> = {
    everyday: [
      "mobile",
      "phone",
      "smartphone",
      "watch",
      "bag",
      "wallet",
      "bottle",
      "headphone",
      "earbuds",
      "shirt",
      "home",
      "kitchen",
      "daily",
      "essential",
    ],

    work: [
      "laptop",
      "keyboard",
      "mouse",
      "monitor",
      "office",
      "book",
      "study",
      "desk",
      "work",
      "notebook",
      "tablet",
      "printer",
      "headphone",
      "backpack",
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
      "music",
      "controller",
      "keyboard",
      "mouse",
    ],

    fitness: [
      "fitness",
      "gym",
      "yoga",
      "running",
      "sports",
      "shoe",
      "shoes",
      "training",
      "workout",
      "active",
      "sportswear",
      "dumbbell",
      "fitness",
    ],

    style: [
      "fashion",
      "shirt",
      "tshirt",
      "hoodie",
      "jacket",
      "denim",
      "dress",
      "clothing",
      "watch",
      "bag",
      "wallet",
      "sunglasses",
      "shoe",
      "footwear",
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
      "furniture",
      "storage",
    ],
  };

  return map[purpose] || [];
}

function keywordsForCategory(
  category: string
) {
  const value = normalize(category);

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
      "dress",
    ];
  }

  if (
    value.includes("footwear") ||
    value.includes("foot wear") ||
    value.includes("shoe")
  ) {
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
    return [
      "watch",
      "smartwatch",
      "time",
    ];
  }

  if (value.includes("bag")) {
    return [
      "bag",
      "backpack",
      "luggage",
      "wallet",
    ];
  }

  if (
    value.includes("gaming") ||
    value.includes("game")
  ) {
    return [
      "gaming",
      "game",
      "keyboard",
      "mouse",
      "controller",
      "headset",
      "console",
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
      "refrigerator",
      "washing machine",
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

  if (
    value.includes("home") ||
    value.includes("living")
  ) {
    return [
      "home",
      "living",
      "kitchen",
      "cookware",
      "decor",
      "coffee",
      "furniture",
    ];
  }

  return [value];
}

/* =========================================================
   PURPOSE MATCH
========================================================= */

function calculatePurposeScore(
  product: Product,
  categoryName: string,
  purpose: string
) {
  if (!purpose) {
    return 80;
  }

  const keywords =
    keywordsForPurpose(purpose);

  const text = normalize(
    [
      product.name,
      product.brand,
      product.short_description,
      product.description,
      categoryName,
    ].join(" ")
  );

  if (!keywords.length) {
    return 75;
  }

  let hits = 0;

  keywords.forEach((keyword) => {
    if (text.includes(normalize(keyword))) {
      hits++;
    }
  });

  if (hits >= 3) return 100;
  if (hits === 2) return 92;
  if (hits === 1) return 78;

  return 48;
}

/* =========================================================
   BUDGET MATCH
========================================================= */

function calculateBudgetScore(
  productPrice: number,
  budgetId: string
) {
  const selected =
    BUDGETS.find(
      (item) => item.id === budgetId
    );

  if (!selected) {
    return 80;
  }

  const price = Number(productPrice) || 0;

  if (
    price >= selected.min &&
    price <= selected.max
  ) {
    return 100;
  }

  if (price < selected.min) {
    const difference =
      selected.min - price;

    if (selected.min === 0) {
      return 100;
    }

    const ratio =
      difference / selected.min;

    if (ratio <= 0.15) return 94;
    if (ratio <= 0.30) return 86;
    if (ratio <= 0.60) return 72;

    return 55;
  }

  if (
    selected.max !== Infinity
  ) {
    const difference =
      price - selected.max;

    if (difference <= 500) return 94;
    if (difference <= 1500) return 82;
    if (difference <= 3000) return 68;
    if (difference <= 5000) return 55;

    return 35;
  }

  return 90;
}

/* =========================================================
   QUALITY SCORE
========================================================= */

function calculateQualityScore(product: Product) {
  const rating = clamp((Number(product.rating) || 0) / 5 * 100);
  const reviews = Math.max(0, Number(product.reviews_count) || 0);

  // Reviews contribute with diminishing returns so a product with
  // 20,000 reviews does not unfairly dominate a product with 2,000.
  const reviewScore = clamp(
    Math.round((Math.log10(reviews + 1) / 4) * 100)
  );

  const stockScore = product.stock > 0 ? 100 : 0;

  return clamp(
    Math.round(
      rating * 0.68 +
      reviewScore * 0.22 +
      stockScore * 0.10
    )
  );
}

/* =========================================================
   SEARCH SCORE
========================================================= */

function calculateSearchScore(
  product: Product,
  categoryName: string,
  search: string
) {
  const query = normalize(search);

  if (!query) {
    return 80;
  }

  const name = normalize(product.name);
  const brand = normalize(product.brand);
  const category = normalize(
    categoryName
  );
  const description = normalize(
    `${product.short_description || ""} ${
      product.description || ""
    }`
  );

  if (name === query) return 100;
  if (name.includes(query)) return 100;
  if (brand === query) return 96;
  if (brand.includes(query)) return 92;
  if (category.includes(query)) return 90;
  if (description.includes(query)) return 80;

  const terms = query.split(/\s+/);

  const matchedTerms =
    terms.filter(
      (term) =>
        name.includes(term) ||
        brand.includes(term) ||
        category.includes(term) ||
        description.includes(term)
    ).length;

  if (
    terms.length > 0 &&
    matchedTerms === terms.length
  ) {
    return 94;
  }

  if (matchedTerms > 0) {
    return 65;
  }

  return 25;
}

/* =========================================================
   PRODUCT SCORING
========================================================= */

function scoreProduct(
  product: Product,
  categories: Category[],
  purpose: string,
  budget: string,
  categoryId: string,
  brand: string,
  search: string,
  importance: Importance
): MatchProduct {
  const categoryObject =
    categories.find(
      (item) =>
        item.id === product.category_id
    );

  const categoryName =
    categoryObject?.name ||
    "PrimeCart";

  const searchable = normalize(
    [
      product.name,
      product.brand,
      product.short_description,
      product.description,
      categoryName,
    ].join(" ")
  );

  /* PURPOSE */

  const purposeScore =
    calculatePurposeScore(
      product,
      categoryName,
      purpose
    );

  /* BUDGET */

  const budgetScore =
    calculateBudgetScore(
      Number(product.price),
      budget
    );

  /* CATEGORY */

  let categoryScore = 80;

  if (categoryId === "all") {
    categoryScore = 80;
  } else if (
    product.category_id === categoryId
  ) {
    categoryScore = 100;
  } else {
    const selectedCategory =
      categories.find(
        (item) => item.id === categoryId
      );

    if (selectedCategory) {
      const categoryKeywords =
        keywordsForCategory(
          selectedCategory.name
        );

      const matched =
        categoryKeywords.some(
          (keyword) =>
            searchable.includes(
              normalize(keyword)
            )
        );

      categoryScore = matched
        ? 68
        : 25;
    } else {
      categoryScore = 25;
    }
  }

  /* BRAND */

  let brandScore = 80;

  if (
    brand === "Any Brand" ||
    brand === "all"
  ) {
    brandScore = 80;
  } else if (
    normalize(product.brand) ===
    normalize(brand)
  ) {
    brandScore = 100;
  } else {
    brandScore = 25;
  }

  /* RATING */

  const rating =
    Number(product.rating) || 0;

  const ratingScore = clamp(
    Math.round((rating / 5) * 100)
  );

  /* QUALITY */

  const qualityScore =
    calculateQualityScore(product);

  /* AVAILABILITY */

  let availabilityScore = 100;

  if (product.stock <= 0) {
    availabilityScore = 0;
  } else if (product.stock <= 3) {
    availabilityScore = 78;
  } else if (product.stock <= 10) {
    availabilityScore = 90;
  }

  /* SEARCH */

  const searchScore =
    calculateSearchScore(
      product,
      categoryName,
      search
    );

  /* =====================================================
     DYNAMIC WEIGHTS
  ===================================================== */

  const rawWeights = {
    budget: importance.budget,
    quality: importance.quality,
    brand: importance.brand,
    rating: importance.rating,
  };

  const totalPriority =
    rawWeights.budget +
    rawWeights.quality +
    rawWeights.brand +
    rawWeights.rating;

  const normalizedBudget =
    totalPriority > 0
      ? rawWeights.budget /
        totalPriority
      : 0.25;

  const normalizedQuality =
    totalPriority > 0
      ? rawWeights.quality /
        totalPriority
      : 0.25;

  const normalizedBrand =
    totalPriority > 0
      ? rawWeights.brand /
        totalPriority
      : 0.25;

  const normalizedRating =
    totalPriority > 0
      ? rawWeights.rating /
        totalPriority
      : 0.25;

  /*
    Purpose + category always remain important.
    User-controlled importance decides how
    budget / quality / brand / rating are balanced.
  */

  const score =
    purposeScore * 0.20 +
    categoryScore * 0.16 +
    budgetScore *
      normalizedBudget *
      0.18 +
    qualityScore *
      normalizedQuality *
      0.16 +
    ratingScore *
      normalizedRating *
      0.10 +
    brandScore *
      normalizedBrand *
      0.08 +
    availabilityScore * 0.04 +
    searchScore * 0.08;

  let finalScore =
    Math.round(score);

  if (product.is_featured) {
    finalScore += 2;
  }

  if (product.is_flash_sale) {
    finalScore += 2;
  }

  if (product.stock <= 0) {
    finalScore -= 20;
  }

  finalScore = clamp(
    finalScore,
    20,
    99
  );

  /* =====================================================
     REASONS
  ===================================================== */

  const reasons: string[] = [];

  if (budgetScore >= 95) {
    reasons.push(
      "Perfect budget fit"
    );
  } else if (budgetScore >= 80) {
    reasons.push(
      "Comfortably within your budget"
    );
  }

  if (categoryScore >= 95) {
    reasons.push(
      "Exact category match"
    );
  } else if (
    categoryScore >= 65
  ) {
    reasons.push(
      "Related to your category"
    );
  }

  if (purposeScore >= 90) {
    reasons.push(
      "Strongly fits your purpose"
    );
  } else if (
    purposeScore >= 75
  ) {
    reasons.push(
      "Good fit for your purpose"
    );
  }

  if (brandScore >= 95) {
    reasons.push(
      "Preferred brand"
    );
  }

  if (qualityScore >= 90) {
    reasons.push(
      "Strong overall quality"
    );
  } else if (ratingScore >= 90) {
    reasons.push(
      "Highly rated"
    );
  }

  if (
    product.is_flash_sale &&
    discount(
      Number(product.price),
      product.original_price
    ) > 0
  ) {
    reasons.push(
      "Great active deal"
    );
  }

  if (
    product.stock > 0 &&
    product.stock <= 5
  ) {
    reasons.push(
      "Limited stock"
    );
  }

  if (searchScore >= 90) {
    reasons.push(
      "Matches your search"
    );
  }

  if (!reasons.length) {
    reasons.push(
      "Good overall match"
    );
  }

  return {
    ...product,
    categoryName,
    matchScore: finalScore,
    reasons: Array.from(
      new Set(reasons)
    ).slice(0, 4),
    breakdown: {
      budget: budgetScore,
      category: categoryScore,
      purpose: purposeScore,
      quality: qualityScore,
      rating: ratingScore,
      brand: brandScore,
      availability:
        availabilityScore,
      search: searchScore,
    },
  };
}

/* =========================================================
   SMART SHOPPING INTELLIGENCE
========================================================= */

type SmartQuery = {
  budgetMax: number | null;
  purpose: string | null;
  categoryHint: string | null;
  keywords: string[];
};

function parseSmartQuery(query: string): SmartQuery {
  const value = normalize(query);
  const numberMatch = value.match(/(?:under|below|less than|upto|up to|within|under rs|under ₹|below rs|below ₹)\s*₹?\s*([\d,]+)/i)
    || value.match(/₹\s*([\d,]+)/i)
    || value.match(/(?:rs\.?|inr)\s*([\d,]+)/i);

  const budgetMax = numberMatch
    ? Number(String(numberMatch[1]).replace(/,/g, ""))
    : null;

  let purpose: string | null = null;
  if (/\b(running|gym|fitness|workout|sports|yoga|training)\b/i.test(value)) purpose = "fitness";
  else if (/\b(study|student|office|work|work from home|productivity|desk)\b/i.test(value)) purpose = "work";
  else if (/\b(gaming|game|console|music|movie|movies|speaker|headset)\b/i.test(value)) purpose = "entertainment";
  else if (/\b(fashion|shirt|dress|jacket|watch|bag|wallet|style)\b/i.test(value)) purpose = "style";
  else if (/\b(home|kitchen|coffee|appliance|decor|furniture)\b/i.test(value)) purpose = "home";

  let categoryHint: string | null = null;
  if (/\b(shoes?|sneakers?|footwear|running shoes)\b/i.test(value)) categoryHint = "footwear";
  else if (/\b(phone|mobile|smartphone|iphone|android)\b/i.test(value)) categoryHint = "mobile";
  else if (/\b(laptop|notebook|computer)\b/i.test(value)) categoryHint = "work";
  else if (/\b(headphones?|earbuds?|headset|speaker)\b/i.test(value)) categoryHint = "audio";
  else if (/\b(watch|smartwatch)\b/i.test(value)) categoryHint = "watch";
  else if (/\b(bag|backpack|wallet)\b/i.test(value)) categoryHint = "bag";

  const stopWords = new Set(["mala","mujhe","i","need","want","for","under","below","less","than","rs","inr","the","a","an","with","and","please","pahije","chahiye","ke","liye","hai"]);
  const keywords = value
    .replace(/₹?\s*[\d,]+/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .slice(0, 8);

  return { budgetMax, purpose, categoryHint, keywords };
}

function getProfileLabel(value: number) {
  if (value >= 85) return "Very high";
  if (value >= 65) return "High";
  if (value >= 40) return "Balanced";
  return "Light";
}

/* =========================================================
   MATCH PRESENTATION HELPERS
========================================================= */

function getMatchTier(score: number) {
  if (score >= 92) return { label: "Excellent Match", tone: "excellent" };
  if (score >= 84) return { label: "Strong Match", tone: "strong" };
  if (score >= 72) return { label: "Good Match", tone: "good" };
  return { label: "Potential Match", tone: "potential" };
}

function getSmartSearchHints(query: string) {
  const value = normalize(query);
  if (!value) return [];

  const hints: string[] = [];
  if (/\b(?:under|below|less than)\s*\d+/i.test(value)) hints.push("Budget detected");
  if (/\b(?:running|gym|fitness|workout|sports)\b/i.test(value)) hints.push("Fitness intent");
  if (/\b(?:study|office|work|laptop|desk)\b/i.test(value)) hints.push("Work & Study intent");
  if (/\b(?:gaming|game|console|headset)\b/i.test(value)) hints.push("Entertainment intent");
  if (/\b(?:fashion|shirt|dress|jacket|shoes|watch|bag)\b/i.test(value)) hints.push("Style intent");
  if (/\b(?:home|kitchen|coffee|appliance|decor)\b/i.test(value)) hints.push("Home intent");
  return hints;
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
        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
          {label}
        </span>

        <span className="text-[10px] font-black text-[#9b762b]">
          {value}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[#eee8dc]">
        <div
          className="h-full rounded-full bg-[#c9a24d] transition-all duration-700"
          style={{
            width: `${clamp(value)}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT IMAGE
========================================================= */

function ProductImage({
  src,
  alt,
  className = "",
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const imageSrc =
    src || PRODUCT_IMAGE_FALLBACK;

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-[#faf8f3] text-[#c9a24d] ${className}`}
      >
        <ShoppingBag size={42} />
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

/* =========================================================
   MATCH CONFIDENCE
========================================================= */

function matchConfidence(score: number) {
  if (score >= 92) {
    return { label: "Excellent match", tone: "bg-emerald-50 text-emerald-700" };
  }
  if (score >= 82) {
    return { label: "Strong match", tone: "bg-[#fff4d6] text-[#8d6924]" };
  }
  if (score >= 70) {
    return { label: "Good match", tone: "bg-blue-50 text-blue-700" };
  }
  return { label: "Potential match", tone: "bg-gray-100 text-gray-600" };
}

/* =========================================================
   MATCH BADGE
========================================================= */

function MatchBadge({
  product,
}: {
  product: MatchProduct;
}) {
  const discountValue =
    discount(
      Number(product.price),
      product.original_price
    );

  if (
    product.matchScore >= 90
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#fff3ce] px-2.5 py-1 text-[10px] font-black text-[#916b22]">
        <Sparkles size={11} />
        Best Match
      </span>
    );
  }

  if (
    discountValue >= 30
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-600">
        <Zap size={11} />
        Best Deal
      </span>
    );
  }

  if (
    Number(product.rating) >= 4.5
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-600">
        <Star size={11} fill="currentColor" />
        Top Rated
      </span>
    );
  }

  if (
    Number(product.price) <= 2000
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-black text-green-700">
        <Target size={11} />
        Budget Pick
      </span>
    );
  }

  return null;
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  rank,
  wished,
  added,
  onWishlist,
  onCart,
}: {
  product: MatchProduct;
  rank: number;
  wished: boolean;
  added: boolean;
  onWishlist: () => void;
  onCart: () => void;
}) {
  const off = discount(
    Number(product.price),
    product.original_price
  );

  return (
    <article className="group overflow-hidden rounded-[26px] border border-[#e8dfcf] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#d9bf7b] hover:shadow-[0_22px_55px_rgba(80,60,20,0.10)]">
      {/* IMAGE */}
      <div className="relative h-[280px] overflow-hidden bg-[#faf9f6]">
        <Link
          href={`/dashboard/products/${product.id}`}
          className="block h-full w-full"
        >
          <ProductImage
            src={getImageUrl(
              product.image_url
            )}
            alt={product.name}
            className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-105"
          />
        </Link>

        {/* RANK */}
        <div className="absolute left-4 top-4 rounded-full bg-[#fff0c8] px-3 py-1.5 text-[10px] font-black text-[#8f6b25] shadow-sm">
          #{rank}
        </div>

        {/* MATCH */}
        <div className="absolute left-4 top-14 flex items-center gap-1.5 rounded-full border border-[#eadfca] bg-white/95 px-3 py-1.5 text-[10px] font-black text-[#9b762b] shadow-sm">
          <Sparkles size={11} />
          {product.matchScore}% Match
        </div>

        {/* WISHLIST */}
        <button
          type="button"
          onClick={onWishlist}
          aria-label="Wishlist"
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border bg-white/95 shadow-sm transition ${
            wished
              ? "border-red-200 text-red-500"
              : "border-[#e5dccb] text-gray-500 hover:border-red-200 hover:text-red-500"
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

        {/* DEALS */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          {off > 0 && (
            <span className="rounded-full bg-[#c9a24d] px-3 py-1.5 text-[10px] font-black text-white">
              {off}% OFF
            </span>
          )}

          {product.is_flash_sale && (
            <span className="flex items-center gap-1 rounded-full bg-[#fff1d2] px-3 py-1.5 text-[10px] font-black text-[#9b762b]">
              <Zap size={10} />
              DEAL
            </span>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="max-w-[65%] truncate text-[10px] font-black uppercase tracking-[0.14em] text-[#a17b2f]">
            {product.categoryName}
          </span>

          <MatchBadge
            product={product}
          />
        </div>

        <Link
          href={`/dashboard/products/${product.id}`}
          className="mt-2 block"
        >
          <h3 className="line-clamp-2 min-h-[48px] text-base font-black leading-6 text-[#3f3525] transition hover:text-[#a17b2f]">
            {product.name}
          </h3>
        </Link>

        {product.brand && (
          <p className="mt-1 text-xs font-semibold text-gray-400">
            {product.brand}
          </p>
        )}

        {/* RATING */}
        <div className="mt-3 flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-md bg-[#fff7e4] px-2 py-1 text-[11px] font-black text-[#956f27]">
            <Star
              size={12}
              fill="currentColor"
            />
            {Number(product.rating || 0).toFixed(
              1
            )}
          </span>

          <span className="text-[11px] text-gray-400">
            {product.reviews_count || 0} reviews
          </span>
        </div>

        {/* PRICE */}
        <div className="mt-4 flex items-end gap-2">
          <span className="text-xl font-black text-[#3f3525]">
            {money(
              Number(product.price)
            )}
          </span>

          {product.original_price &&
            Number(
              product.original_price
            ) >
              Number(product.price) && (
              <span className="mb-0.5 text-xs text-gray-400 line-through">
                {money(
                  Number(
                    product.original_price
                  )
                )}
              </span>
            )}
        </div>

        {/* REASONS */}
        <div className="mt-4 space-y-1.5">
          {product.reasons
            .slice(0, 3)
            .map((reason) => (
              <div
                key={reason}
                className="flex items-center gap-2 text-[11px] font-semibold text-gray-500"
              >
                <Check
                  size={12}
                  className="shrink-0 text-[#b58a32]"
                />
                <span>{reason}</span>
              </div>
            ))}
        </div>

        {/* ACTIONS */}
        <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            disabled={
              product.stock <= 0
            }
            onClick={onCart}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black transition ${
              product.stock <= 0
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : added
                ? "bg-[#edf7f0] text-[#3d7a55] border border-[#cfe6d7]"
                : "bg-[#c9a24d] text-white hover:bg-[#b58a32]"
            }`}
          >
            {added ? (
              <>
                <Check size={15} />
                Added
              </>
            ) : product.stock <= 0 ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingCart size={15} />
                Add to Cart
              </>
            )}
          </button>

          <Link
            href={`/dashboard/products/${product.id}`}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e4dac8] text-[#9b762b] transition hover:bg-[#fff9ed]"
          >
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-[#eee7db] bg-white">
      <div className="h-[280px] animate-pulse bg-[#f3f0e9]" />

      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-[#eee8dc]" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-[#eee8dc]" />
        <div className="h-5 w-3/5 animate-pulse rounded bg-[#eee8dc]" />
        <div className="h-8 w-1/2 animate-pulse rounded bg-[#eee8dc]" />
        <div className="h-11 animate-pulse rounded-xl bg-[#eee8dc]" />
      </div>
    </div>
  );
}

/* =========================================================
   IMPORTANCE SLIDER
========================================================= */

function ImportanceSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (
    value: number
  ) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#eee5d6] bg-[#fffdfa] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-black text-gray-700">
          {label}
        </span>

        <span className="rounded-full bg-[#fff4d6] px-2.5 py-1 text-[10px] font-black text-[#956f27]">
          {value}%
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
        className="w-full accent-[#c9a24d]"
      />
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function PrimeMatchPage() {
  const supabase = createClient();

  /* DATA */

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

  /* UI */

  const [loading, setLoading] =
    useState(true);

  const [matching, setMatching] =
    useState(false);

  const [matched, setMatched] =
    useState(false);

  const [matchedResults, setMatchedResults] =
    useState<MatchProduct[]>([]);

const [matchStage, setMatchStage] =
  useState(0);

  const [error, setError] =
    useState("");

  const [toast, setToast] =
    useState("");

  /* PREFERENCES */

  const [purpose, setPurpose] =
    useState("everyday");

  const [budget, setBudget] =
    useState("1000-5000");

  const [category, setCategory] =
    useState("all");

  const [brand, setBrand] =
    useState("Any Brand");

  const [search, setSearch] =
    useState("");

  const [importance, setImportance] =
    useState<Importance>({
      budget: 70,
      quality: 75,
      brand: 40,
      rating: 65,
    });

  /* COMPARISON */

  const [compareIds, setCompareIds] =
    useState<string[]>([]);

  const [history, setHistory] =
    useState<MatchHistoryEntry[]>([]);

  const [surpriseId, setSurpriseId] =
    useState<string | null>(null);

  /* =====================================================
     TOAST
  ===================================================== */

  useEffect(() => {
    if (!toast) return;

    const timer =
      window.setTimeout(() => {
        setToast("");
      }, 2200);

    return () =>
      window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("prime-match-history") || "[]"
      );
      setHistory(Array.isArray(stored) ? stored.slice(0, 5) : []);
    } catch {
      setHistory([]);
    }
  }, []);

  /* =====================================================
     CART SYNC
  ===================================================== */

  function syncCart() {
    try {
      const stored =
        localStorage.getItem(
          "primecart-cart"
        );

      if (!stored) {
        setCartIds([]);
        return;
      }

      const parsed =
        JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        setCartIds([]);
        return;
      }

      const ids = parsed
        .map((item: any) =>
          String(
            item?.product_id ??
              item?.productId ??
              item?.id ??
              ""
          )
        )
        .filter(Boolean);

      setCartIds(ids);
    } catch {
      setCartIds([]);
    }
  }

  useEffect(() => {
    syncCart();

    const handleCartUpdate =
      () => syncCart();

    const handleStorage =
      () => syncCart();

    window.addEventListener(
      "cart-updated",
      handleCartUpdate
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "cart-updated",
        handleCartUpdate
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  /* =====================================================
     LOAD DATA
  ===================================================== */

  useEffect(() => {
    loadData();
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
        productResult,
        categoryResult,
        wishlistResult,
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
            `
          )
          .eq("is_active", true),

        supabase
          .from("categories")
          .select(
            "id,name,slug"
          )
          .order("name", {
            ascending: true,
          }),

        supabase
          .from("wishlist")
          .select("product_id")
          .eq(
            "user_id",
            user.id
          ),
      ]);

      if (productResult.error) {
        throw productResult.error;
      }

      if (categoryResult.error) {
        throw categoryResult.error;
      }

      /*
        Wishlist error should not block
        the entire PrimeMatch page.
      */
      if (wishlistResult.error) {
        console.warn(
          "Wishlist could not be loaded:",
          wishlistResult.error
        );
      }

      const productData =
        (productResult.data ||
          []) as Product[];

      const categoryData =
        (categoryResult.data ||
          []) as Category[];

      setProducts(productData);
      setCategories(categoryData);

      const uniqueBrands =
        Array.from(
          new Set(
            productData
              .map((item) =>
                item.brand?.trim()
              )
              .filter(
                (
                  item
                ): item is string =>
                  Boolean(item)
              )
          )
        ).sort((a, b) =>
          a.localeCompare(b)
        );

      setBrands(uniqueBrands);

      setWishlist(
        (
          wishlistResult.data ||
          []
        ).map(
          (item) =>
            String(item.product_id)
        )
      );

      syncCart();
    } catch (err) {
      console.error(
        "PrimeMatch load error:",
        err
      );

      setError(
        "Something went wrong while loading PrimeMatch. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     RESULTS
  ===================================================== */

  const allResults = useMemo(() => {
    return products
      .map((product) =>
        scoreProduct(
          product,
          categories,
          purpose,
          budget,
          category,
          brand,
          search,
          importance
        )
      )
      .sort((a, b) => {
        /*
          In-stock products come first.
        */
        if (
          a.stock > 0 &&
          b.stock <= 0
        ) {
          return -1;
        }

        if (
          a.stock <= 0 &&
          b.stock > 0
        ) {
          return 1;
        }

        if (
          b.matchScore !==
          a.matchScore
        ) {
          return (
            b.matchScore -
            a.matchScore
          );
        }

        if (
          Number(b.rating) !==
          Number(a.rating)
        ) {
          return (
            Number(b.rating) -
            Number(a.rating)
          );
        }

        return (
          Number(
            b.reviews_count
          ) -
          Number(
            a.reviews_count
          )
        );
      });
  }, [
    products,
    categories,
    purpose,
    budget,
    category,
    brand,
    search,
    importance,
  ]);

  const filteredResults =
    useMemo(() => {
      if (!search.trim()) {
        return allResults;
      }

      const query =
        normalize(search);

      return allResults.filter(
        (product) => {
          const text =
            normalize(
              [
                product.name,
                product.brand,
                product.categoryName,
                product.short_description,
                product.description,
              ].join(" ")
            );

          return query
            .split(/\s+/)
            .some((term) =>
              text.includes(term)
            );
        }
      );
    }, [
      allResults,
      search,
    ]);

  // Products stay hidden until the user explicitly runs PrimeMatch.
  // After matching, we keep a snapshot so changing controls does not
  // silently rewrite the already-presented recommendations.
  const results =
    matched ? matchedResults : [];

  const topMatch =
    results[0] || null;

  const matchTier = topMatch
    ? getMatchTier(topMatch.matchScore)
    : null;

  const averageMatch = results.length
    ? Math.round(
        results.slice(0, Math.min(5, results.length))
          .reduce((sum, item) => sum + item.matchScore, 0) /
        Math.min(5, results.length)
      )
    : 0;

  const bestSaving = results.length
    ? Math.max(
        0,
        ...results.map((item) =>
          Math.max(
            0,
            Number(item.original_price || 0) - Number(item.price || 0)
          )
        )
      )
    : 0;

  const smartSearchHints = useMemo(
    () => getSmartSearchHints(search),
    [search]
  );

  const smartQuery = useMemo(
    () => parseSmartQuery(search),
    [search]
  );

  const profile = useMemo(() => {
    const quality = importance.quality;
    const budgetFocus = importance.budget;
    const brandFocus = importance.brand;
    const ratingFocus = importance.rating;
    return {
      budget: budgetFocus,
      quality,
      brand: brandFocus,
      rating: ratingFocus,
      budgetLabel: getProfileLabel(budgetFocus),
      qualityLabel: getProfileLabel(quality),
      brandLabel: getProfileLabel(brandFocus),
      ratingLabel: getProfileLabel(ratingFocus),
    };
  }, [importance]);

  const budgetAdvisor = useMemo(() => {
    if (!results.length) return null;
    const selected = BUDGETS.find((item) => item.id === budget);
    const available = results.filter((item) => item.stock > 0);
    if (!selected || !available.length) return null;
    const inRange = available.filter((item) => Number(item.price) >= selected.min && Number(item.price) <= selected.max);
    const source = inRange.length ? inRange : available;
    const best = [...source].sort((a, b) => b.matchScore - a.matchScore)[0];
    const cheapest = [...available].sort((a, b) => Number(a.price) - Number(b.price))[0];
    const avg = Math.round(source.slice(0, Math.min(10, source.length)).reduce((sum, item) => sum + Number(item.price), 0) / Math.min(10, source.length));
    return { count: inRange.length, best, cheapest, avg, max: selected.max };
  }, [results, budget]);

  const matchAnalytics = useMemo(() => {
    if (!results.length) return null;
    return {
      analysed: products.length,
      matched: results.length,
      inBudget: results.filter((item) => item.breakdown.budget >= 95).length,
      highRated: results.filter((item) => Number(item.rating) >= 4.5).length,
      deals: results.filter((item) => discount(Number(item.price), item.original_price) >= 20).length,
      available: results.filter((item) => item.stock > 0).length,
    };
  }, [results, products.length]);

  /* =====================================================
     SPECIAL RECOMMENDATIONS
  ===================================================== */

  const bestValue =
    useMemo(() => {
      const available =
        results.filter(
          (product) =>
            product.stock > 0
        );

      return (
        [...available].sort(
          (a, b) => {
            const valueA =
              a.matchScore +
              Number(a.rating) * 5 +
              discount(
                Number(a.price),
                a.original_price
              ) *
                0.4;

            const valueB =
              b.matchScore +
              Number(b.rating) * 5 +
              discount(
                Number(b.price),
                b.original_price
              ) *
                0.4;

            return valueB - valueA;
          }
        )[0] || null
      );
    }, [results]);

  const budgetPick =
    useMemo(() => {
      const available =
        results.filter(
          (product) =>
            product.stock > 0
        );

      return (
        [...available].sort(
          (a, b) =>
            Number(a.price) -
              Number(b.price) ||
            b.matchScore -
              a.matchScore
        )[0] || null
      );
    }, [results]);

  const topRated =
    useMemo(() => {
      return (
        [...results]
          .filter(
            (product) =>
              product.stock > 0
          )
          .sort(
            (a, b) =>
              Number(b.rating) -
                Number(a.rating) ||
              b.reviews_count -
                a.reviews_count
          )[0] || null
      );
    }, [results]);

  const premiumPick =
    useMemo(() => {
      return (
        [...results]
          .filter(
            (product) =>
              product.stock > 0
          )
          .sort((a, b) => {
            const qualityA =
              a.breakdown.quality * 0.55 +
              a.breakdown.rating * 0.30 +
              Math.min(100, a.reviews_count / 20) * 0.15;
            const qualityB =
              b.breakdown.quality * 0.55 +
              b.breakdown.rating * 0.30 +
              Math.min(100, b.reviews_count / 20) * 0.15;

            return (qualityB - qualityA) ||
              (b.matchScore - a.matchScore);
          })[0] || null
      );
    }, [results]);

  const compareProducts =
    useMemo(() => {
      return compareIds
        .map((id) =>
          results.find(
            (product) =>
              product.id === id
          )
        )
        .filter(
          (
            item
          ): item is MatchProduct =>
            Boolean(item)
        );
    }, [
      compareIds,
      results,
    ]);

  /* =====================================================
     LIVE MATCH POTENTIAL
  ===================================================== */

  const livePotential =
  useMemo(() => {
    if (!matched || !topMatch) {
      return 0;
    }

    return topMatch.matchScore;
  }, [matched, topMatch]);

  /* =====================================================
     CART
  ===================================================== */

  function addToCart(
    product: MatchProduct
  ) {
    try {
      if (product.stock <= 0) {
        setToast("This product is currently out of stock.");
        return;
      }
      const stored =
        localStorage.getItem(
          "primecart-cart"
        );

      let current: any[] = [];

      if (stored) {
        try {
          const parsed =
            JSON.parse(stored);

          if (Array.isArray(parsed)) {
            current = parsed;
          }
        } catch {
          current = [];
        }
      }

      const existingIndex =
        current.findIndex(
          (item) =>
            String(
              item?.product_id ??
                item?.productId ??
                item?.id ??
                ""
            ) ===
            String(product.id)
        );

      if (
        existingIndex >= 0
      ) {
        const currentQuantity =
          Number(
            current[existingIndex]?.quantity
          ) || 0;

        if (
          product.stock > 0 &&
          currentQuantity >= product.stock
        ) {
          setToast(`Only ${product.stock} available in stock`);
          return;
        }

        current[existingIndex] = {
          ...current[existingIndex],
          quantity: currentQuantity + 1,
        };
      } else {
        current.push({
          id: product.id,
          product_id:
            product.id,
          productId:
            product.id,
          name: product.name,
          price: Number(
            product.price
          ),
          image_url:
            product.image_url,
          image:
            product.image_url,
          quantity: 1,
          stock: product.stock,
        });
      }

      localStorage.setItem(
        "primecart-cart",
        JSON.stringify(current)
      );

      setCartIds((previous) =>
        previous.includes(
          product.id
        )
          ? previous
          : [
              ...previous,
              product.id,
            ]
      );

      window.dispatchEvent(
        new Event("cart-updated")
      );

      setToast(
        `${product.name} added to cart`
      );
    } catch (err) {
      console.error(
        "Cart error:",
        err
      );

      setToast(
        "Could not add product to cart."
      );
    }
  }

  /* =====================================================
     WISHLIST
  ===================================================== */

  async function toggleWishlist(
    product: MatchProduct
  ) {
    try {
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
        wishlist.includes(
          product.id
        );

      if (exists) {
        const { error: deleteError } =
          await supabase
            .from("wishlist")
            .delete()
            .eq(
              "user_id",
              user.id
            )
            .eq(
              "product_id",
              product.id
            );

        if (deleteError) {
          throw deleteError;
        }

        setWishlist((previous) =>
          previous.filter(
            (id) =>
              id !== product.id
          )
        );

        setToast(
          "Removed from wishlist"
        );
      } else {
        const { error: insertError } =
          await supabase
            .from("wishlist")
            .insert({
              user_id: user.id,
              product_id:
                product.id,
            });

        if (insertError) {
          throw insertError;
        }

        setWishlist((previous) => [
          ...previous,
          product.id,
        ]);

        setToast(
          "Added to wishlist"
        );
      }
    } catch (err) {
      console.error(
        "Wishlist error:",
        err
      );

      setToast(
        "Could not update wishlist."
      );
    }
  }

  /* =====================================================
     COMPARE
  ===================================================== */

  function toggleCompare(
    productId: string
  ) {
    setCompareIds(
      (previous) => {
        if (
          previous.includes(
            productId
          )
        ) {
          return previous.filter(
            (id) =>
              id !== productId
          );
        }

        if (
          previous.length >= 3
        ) {
          setToast(
            "You can compare up to 3 products."
          );

          return previous;
        }

        return [
          ...previous,
          productId,
        ];
      }
    );
  }

  function applySmartSearch() {
    if (!search.trim()) {
      setToast("Type what you are looking for first.");
      return;
    }

    const parsed = smartQuery;
    if (parsed.purpose) setPurpose(parsed.purpose);

    if (parsed.budgetMax !== null) {
      const match = BUDGETS.find((item) => parsed.budgetMax !== null && parsed.budgetMax <= item.max);
      if (match) setBudget(match.id);
    }

    if (parsed.categoryHint) {
      const categoryMatch = categories.find((item) => {
        const name = normalize(item.name);
        return name.includes(parsed.categoryHint || "") || keywordsForCategory(item.name).some((word) => parsed.categoryHint === "footwear" ? word.includes("shoe") || word.includes("foot") : name.includes(word));
      });
      if (categoryMatch) setCategory(categoryMatch.id);
    }

    setToast("PrimeMatch understood your search preferences.");
  }

  function surpriseMe() {
    if (!results.length) {
      setToast("Run PrimeMatch first to unlock Surprise Me.");
      return;
    }
    const pool = results.filter((item) => item.stock > 0);
    const candidates = pool.length ? pool : results;
    const current = topMatch?.id;
    const alternatives = candidates.filter((item) => item.id !== current);
    const picked = alternatives[Math.floor(Math.random() * Math.max(1, alternatives.length))] || candidates[0];
    setSurpriseId(picked.id);
    setToast("✨ Surprise recommendation found for you.");
    window.setTimeout(() => document.getElementById("surprise-match")?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  }

  /* =====================================================
     RUN MATCH
  ===================================================== */

async function runMatch() {
  if (loading || matching) return;

  setMatching(true);
  setMatched(false);
  setMatchedResults([]);
  setMatchStage(0);
  setCompareIds([]);
  setError("");

  const stages = [
    900,
    900,
    900,
    900,
    850,
  ];

  for (let index = 0; index < stages.length; index++) {
    setMatchStage(index);

    await new Promise<void>((resolve) =>
      window.setTimeout(resolve, stages[index])
    );
  }

  // Freeze the exact recommendations generated from the current
  // preferences. This makes the result screen stable and predictable.
  setMatchedResults([...filteredResults]);
  setMatchStage(5);
  setMatched(true);
  setMatching(false);

  try {
    const history = JSON.parse(
      localStorage.getItem("prime-match-history") || "[]"
    );
    const entry = {
      purpose,
      budget,
      category,
      brand,
      search: search.trim(),
      createdAt: Date.now(),
    };
    const next = [entry, ...(Array.isArray(history) ? history : [])]
      .filter((item, index, arr) =>
        index === arr.findIndex((other) =>
          other.purpose === item.purpose &&
          other.budget === item.budget &&
          other.category === item.category &&
          other.brand === item.brand &&
          other.search === item.search
        )
      )
      .slice(0, 5);
    localStorage.setItem("prime-match-history", JSON.stringify(next));
    setHistory(next);
  } catch {
    // Match history is optional and should never block recommendations.
  }

  window.setTimeout(() => {
    document
      .getElementById("match-results")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, 150);
}
  /* =====================================================
     RESET
  ===================================================== */

 function resetPreferences() {
  setPurpose("everyday");
  setBudget("1000-5000");
  setCategory("all");
  setBrand("Any Brand");
  setSearch("");

  setImportance({
    budget: 70,
    quality: 75,
    brand: 40,
    rating: 65,
  });

  setMatching(false);
  setMatched(false);
  setMatchedResults([]);
  setMatchStage(0);
  setCompareIds([]);
  setSurpriseId(null);
}

  /* =====================================================
     SELECTED CATEGORY
  ===================================================== */

  const activeCategory =
    category === "all"
      ? null
      : categories.find(
          (item) =>
            item.id === category
        );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#fcfbf8] text-[#3f3525]">
      {/* =================================================
          TOAST
      ================================================= */}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
          <div className="flex max-w-[90vw] items-center gap-3 rounded-2xl border border-[#dec68b] bg-white px-5 py-3 text-sm font-bold text-[#6f582d] shadow-[0_18px_45px_rgba(151,116,45,0.18)]">
            <Check
              size={17}
              className="text-[#d5b15d]"
            />
            {toast}
          </div>
        </div>
      )}

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-[#eee5d6] bg-[#fcfbf8]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-black text-gray-600 transition hover:text-[#a17b2f]"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">
              Dashboard
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff2cf] text-[#a17b2f]">
              <Sparkles
                size={18}
              />
            </div>

            <div>
              <p className="text-sm font-black tracking-tight">
                PrimeMatch
              </p>
              <p className="hidden text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400 sm:block">
                Smart shopping
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e4dac8] bg-white text-gray-700 transition hover:border-[#c9a24d] hover:text-[#9b762b]"
          >
            <ShoppingCart size={18} />

            {cartIds.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c9a24d] px-1 text-[9px] font-black text-white">
                {cartIds.length}
              </span>
            )}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-[32px] border border-[#eadfc9] bg-gradient-to-br from-[#fffaf0] via-white to-[#f9f5ea] px-6 py-9 shadow-sm sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#e8cc83]/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e6d6af] bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#9b762b]">
                <Sparkles size={12} />
                Personalised shopping
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
                Find products that
                <span className="block text-[#b58a32]">
                  actually fit you.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
                Tell PrimeMatch what you need,
                your budget, preferred category
                and brand. We rank the available
                products based on your priorities.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-gray-600 shadow-sm">
                  <BadgeCheck
                    size={15}
                    className="text-[#b58a32]"
                  />
                  Smart ranking
                </div>

                <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-gray-600 shadow-sm">
                  <Target
                    size={15}
                    className="text-[#b58a32]"
                  />
                  Budget aware
                </div>

                <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-gray-600 shadow-sm">
                  <Zap
                    size={15}
                    className="text-[#b58a32]"
                  />
                  Deal aware
                </div>
              </div>
            </div>

            {/* LIVE POTENTIAL */}
            <div className="rounded-[28px] border border-[#e8d8b2] bg-white/90 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a17b2f]">
                    Live Match Potential
                  </p>

                  <p className="mt-1 text-xs font-semibold text-gray-400">
                    Based on your current preferences
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff4d6] text-[#9b762b]">
                  <TrendingUp
                    size={19}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-black text-[#3f3525]">
                  {livePotential}%
                </span>

                <span className="mb-2 text-xs font-bold text-gray-400">
                  potential
                </span>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#eee8dc]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#b58a32] to-[#e0c274] transition-all duration-700"
                  style={{
                    width: `${livePotential}%`,
                  }}
                />
              </div>

              <p className="mt-4 text-xs leading-5 text-gray-500">
                Adjust your preferences below
                to change the ranking instantly.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            RECENT PRIME MATCHES
        ================================================= */}

        {history.length > 0 && !matched && (
          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <History size={14} className="text-[#b58a32]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                    Your recent matches
                  </p>
                </div>
                <h2 className="mt-1 text-xl font-black">Pick up where you left off</h2>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {history.map((item, index) => {
                const purposeLabel = PURPOSES.find((p) => p.id === item.purpose)?.title || item.purpose;
                const budgetLabel = BUDGETS.find((b) => b.id === item.budget)?.label || item.budget;
                const categoryLabel = item.category === "all" ? "All Categories" : categories.find((c) => c.id === item.category)?.name || "Category";
                return (
                  <button
                    key={`${item.createdAt}-${index}`}
                    type="button"
                    onClick={() => {
                      setPurpose(item.purpose);
                      setBudget(item.budget);
                      setCategory(item.category);
                      setBrand(item.brand);
                      setSearch(item.search);
                      setMatched(false);
                      setMatchedResults([]);
                      setToast("Previous PrimeMatch preferences restored");
                    }}
                    className="rounded-2xl border border-[#e9dfcc] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9a24d] hover:shadow-md"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff3d2] text-[#a17b2f]">
                      <History size={15} />
                    </span>
                    <p className="mt-3 line-clamp-1 text-xs font-black text-[#4c4030]">{purposeLabel}</p>
                    <p className="mt-1 line-clamp-1 text-[10px] font-semibold text-gray-400">{budgetLabel} · {categoryLabel}</p>
                    {item.search && (
                      <p className="mt-2 line-clamp-1 text-[10px] font-bold text-[#9b762b]">“{item.search}”</p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* =================================================
            SHOPPING PROFILE
        ================================================= */}
        <section className="mt-8 rounded-[28px] border border-[#eadfc9] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">Your shopping profile</p>
              <h2 className="mt-1 text-xl font-black">What matters most to you</h2>
              <p className="mt-1 text-sm text-gray-500">PrimeMatch uses these priorities to shape your recommendations.</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff3d2] text-[#9b762b]"><Target size={19} /></div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Budget", profile.budget, profile.budgetLabel],
              ["Quality", profile.quality, profile.qualityLabel],
              ["Brand", profile.brand, profile.brandLabel],
              ["Rating", profile.rating, profile.ratingLabel],
            ].map(([label, value, level]) => (
              <div key={String(label)} className="rounded-2xl border border-[#eee5d6] bg-[#fffdfa] p-4">
                <div className="flex items-center justify-between gap-2"><span className="text-xs font-black text-[#4c4030]">{label}</span><span className="text-[10px] font-black text-[#9b762b]">{level}</span></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eee8dc]"><div className="h-full rounded-full bg-gradient-to-r from-[#c9a24d] to-[#e5ca82]" style={{ width: `${Number(value)}%` }} /></div>
                <p className="mt-2 text-[10px] font-bold text-gray-400">{Number(value)}% importance</p>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================
            BUILDER
        ================================================= */}

        <section className="mt-8">
          <div className="mb-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
              Step 1
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Tell us what you need
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              PrimeMatch uses these choices to
              personalize your product ranking.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#e8dfcf] bg-white p-5 shadow-sm sm:p-7">
            {/* PURPOSE */}

            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black">
                    What is this for?
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    Choose the main purpose.
                  </p>
                </div>

                <span className="rounded-full bg-[#fff6df] px-3 py-1.5 text-[10px] font-black text-[#956f27]">
                  Required
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {PURPOSES.map(
                  (item) => {
                    const selected =
                      purpose ===
                      item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setPurpose(
                            item.id
                          )
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-[#c9a24d] bg-[#fff8e8] shadow-sm"
                            : "border-[#eee5d6] bg-white hover:border-[#dbc58e] hover:bg-[#fffdfa]"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${
                            selected
                              ? "bg-[#c9a24d] text-white"
                              : "bg-[#f6f2e9] text-[#a17b2f]"
                          }`}
                        >
                          {
                            item.icon
                          }
                        </div>

                        <p className="mt-3 text-xs font-black">
                          {
                            item.title
                          }
                        </p>

                        <p className="mt-1 text-[10px] font-semibold text-gray-400">
                          {
                            item.subtitle
                          }
                        </p>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* SEARCH */}
            <div className="mt-7">
              <label className="mb-2 block text-xs font-black text-gray-700">
                Search for something specific
              </label>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="e.g. wireless headphones, running shoes, smartphone..."
                  className="h-12 w-full rounded-2xl border border-[#e4dac8] bg-[#fffdfa] pl-11 pr-11 text-sm font-semibold outline-none transition placeholder:text-gray-400 focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 hover:bg-[#fff8e8] hover:text-[#9b762b]"
                  >
                    <X
                      size={14}
                    />
                  </button>
                )}
              </div>

              {smartSearchHints.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {smartSearchHints.map((hint) => (
                    <span key={hint} className="inline-flex items-center gap-1.5 rounded-full border border-[#ead9ad] bg-[#fff8e8] px-3 py-1.5 text-[10px] font-black text-[#8f6b25]">
                      <Sparkles size={11} />
                      {hint}
                    </span>
                  ))}
                  <span className="text-[10px] font-semibold text-gray-400 self-center">PrimeMatch will use these signals while ranking.</span>
                </div>
              )}
            </div>

            {/* SMART SEARCH UNDERSTANDING */}
            {search.trim() && (
              <div className="mt-3 rounded-2xl border border-[#eadfc9] bg-[#fffaf0] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9b762b]">Smart search understanding</p>
                    <p className="mt-1 text-xs font-semibold text-gray-500">PrimeMatch can translate your words into shopping preferences.</p>
                  </div>
                  <button type="button" onClick={applySmartSearch} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8c38f] bg-white px-4 py-2.5 text-[10px] font-black text-[#8f6b24] transition hover:bg-[#fff4d6] sm:w-auto">
                    <Sparkles size={13} /> Apply smart search
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {smartQuery.budgetMax !== null && <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-[#956f27]">Budget ≤ {money(smartQuery.budgetMax)}</span>}
                  {smartQuery.purpose && <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-[#956f27]">Purpose: {PURPOSES.find((item) => item.id === smartQuery.purpose)?.title}</span>}
                  {smartQuery.categoryHint && <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-[#956f27]">Category: {smartQuery.categoryHint}</span>}
                  {smartQuery.keywords.slice(0, 4).map((word) => <span key={word} className="rounded-full border border-[#eadfc9] bg-white px-3 py-1.5 text-[10px] font-bold text-gray-500">{word}</span>)}
                </div>
              </div>
            )}

            {/* FILTER GRID */}
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {/* BUDGET */}
              <div>
                <label className="mb-2 block text-xs font-black text-gray-700">
                  Budget
                </label>

                <div className="relative">
                  <select
                    value={budget}
                    onChange={(event) =>
                      setBudget(
                        event.target
                          .value
                      )
                    }
                    className="h-12 w-full appearance-none rounded-2xl border border-[#e4dac8] bg-[#fffdfa] px-4 pr-10 text-sm font-bold outline-none transition focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
                  >
                    {BUDGETS.map(
                      (item) => (
                        <option
                          key={
                            item.id
                          }
                          value={
                            item.id
                          }
                        >
                          {
                            item.label
                          }
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              {/* CATEGORY */}
              <div>
                <label className="mb-2 block text-xs font-black text-gray-700">
                  Category
                </label>

                <div className="relative">
                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(
                        event.target
                          .value
                      )
                    }
                    className="h-12 w-full appearance-none rounded-2xl border border-[#e4dac8] bg-[#fffdfa] px-4 pr-10 text-sm font-bold outline-none transition focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
                  >
                    <option value="all">
                      All Categories
                    </option>

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
                          {
                            item.name
                          }
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              {/* BRAND */}
              <div>
                <label className="mb-2 block text-xs font-black text-gray-700">
                  Brand
                </label>

                <div className="relative">
                  <select
                    value={brand}
                    onChange={(event) =>
                      setBrand(
                        event.target
                          .value
                      )
                    }
                    className="h-12 w-full appearance-none rounded-2xl border border-[#e4dac8] bg-[#fffdfa] px-4 pr-10 text-sm font-bold outline-none transition focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
                  >
                    <option value="Any Brand">
                      Any Brand
                    </option>

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
                          {
                            item
                          }
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* IMPORTANCE */}
            <div className="mt-8 border-t border-[#eee5d6] pt-7">
              <div className="mb-4">
                <h3 className="text-sm font-black">
                  What matters most to you?
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Move the sliders to personalize
                  your recommendation weights.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ImportanceSlider
                  label="Budget"
                  value={
                    importance.budget
                  }
                  onChange={(
                    value
                  ) =>
                    setImportance(
                      (
                        previous
                      ) => ({
                        ...previous,
                        budget:
                          value,
                      })
                    )
                  }
                />

                <ImportanceSlider
                  label="Quality"
                  value={
                    importance.quality
                  }
                  onChange={(
                    value
                  ) =>
                    setImportance(
                      (
                        previous
                      ) => ({
                        ...previous,
                        quality:
                          value,
                      })
                    )
                  }
                />

                <ImportanceSlider
                  label="Brand"
                  value={
                    importance.brand
                  }
                  onChange={(
                    value
                  ) =>
                    setImportance(
                      (
                        previous
                      ) => ({
                        ...previous,
                        brand:
                          value,
                      })
                    )
                  }
                />

                <ImportanceSlider
                  label="Rating"
                  value={
                    importance.rating
                  }
                  onChange={(
                    value
                  ) =>
                    setImportance(
                      (
                        previous
                      ) => ({
                        ...previous,
                        rating:
                          value,
                      })
                    )
                  }
                />
              </div>
            </div>

            {/* SELECTED FILTERS */}
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                Selected:
              </span>

              <span className="rounded-full bg-[#fff4d6] px-3 py-1.5 text-[10px] font-black text-[#956f27]">
                {
                  PURPOSES.find(
                    (item) =>
                      item.id ===
                      purpose
                  )?.title
                }
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-black text-gray-600">
                {
                  BUDGETS.find(
                    (item) =>
                      item.id ===
                      budget
                  )?.label
                }
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-black text-gray-600">
                {activeCategory
                  ?.name ||
                  "All Categories"}
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-black text-gray-600">
                {brand}
              </span>

              <button
                type="button"
                onClick={
                  resetPreferences
                }
                className="ml-auto flex items-center gap-1.5 text-[10px] font-black text-gray-400 transition hover:text-[#9b762b]"
              >
                <RefreshCw
                  size={12}
                />
                Reset
              </button>
            </div>

            {/* FIND MATCH */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={
                  runMatch
                }
                disabled={
                  loading ||
                  matching
                }
                className="flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#c9a24d] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[#c9a24d]/20 transition hover:bg-[#b58a32] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {matching ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Finding your match...
                  </>
                ) : (
                  <>
                    <Sparkles
                      size={18}
                    />
                    Find My Prime Match
                    <ArrowRight
                      size={17}
                    />
                  </>
                )}
              </button>

              <Link
                href="/dashboard/products"
                className="flex h-13 items-center justify-center gap-2 rounded-2xl border border-[#dfd3bf] bg-white px-6 py-3.5 text-sm font-black text-gray-700 transition hover:border-[#c9a24d] hover:text-[#9b762b]"
              >
                Browse all products
              </Link>
            </div>
          </div>
        </section>

              {/* MATCHING ANIMATION */}

{matching && (
  <section className="mt-8">
    <div className="overflow-hidden rounded-[30px] border border-[#e8dfcf] bg-white shadow-sm">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#fffaf0] via-white to-[#f8f3e7] px-6 py-12 sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e8cc83]/20 blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#fff1c8] text-[#a17b2f] shadow-sm">
            <Sparkles
              size={34}
              className="animate-pulse"
            />
          </div>

          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-[#a17b2f]">
            PrimeMatch Intelligence
          </p>

          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Finding your perfect match
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
            We are analysing your preferences,
            budget, product quality and ratings.
          </p>

          <div className="mx-auto mt-8 max-w-xl space-y-3 text-left">
            {[
              {
                title: "Understanding your preferences",
                icon: Target,
              },
              {
                title: "Scanning available products",
                icon: Search,
              },
              {
                title: "Checking your budget",
                icon: ShoppingBag,
              },
              {
                title: "Comparing quality & ratings",
                icon: Star,
              },
              {
                title: "Finding your best matches",
                icon: Sparkles,
              },
            ].map((stage, index) => {
              const Icon = stage.icon;

              const active =
                matchStage === index;

              const completed =
                matchStage > index;

              return (
                <div
                  key={stage.title}
                  className={`flex items-center gap-4 rounded-2xl border p-4 transition-all duration-500 ${
                    active
                      ? "border-[#d8bd70] bg-[#fff8e8] shadow-sm"
                      : completed
                      ? "border-[#e7dcc5] bg-[#fffdfa]"
                      : "border-[#eee7db] bg-white"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                      active
                        ? "bg-[#c9a24d] text-white"
                        : completed
                        ? "bg-[#fff0c8] text-[#a17b2f]"
                        : "bg-[#f5f2eb] text-gray-400"
                    }`}
                  >
                    {completed ? (
                      <Check size={17} />
                    ) : active ? (
                      <Icon
                        size={17}
                        className="animate-pulse"
                      />
                    ) : (
                      <Icon size={17} />
                    )}
                  </div>

                  <div className="flex-1">
                    <p
                      className={`text-xs font-black ${
                        active
                          ? "text-[#8f6b25]"
                          : completed
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      {stage.title}
                    </p>

                    {active && (
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eadfca]">
                        <div className="h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-[#c9a24d]" />
                      </div>
                    )}
                  </div>

                  {completed && (
                    <Check
                      size={17}
                      className="text-[#b58a32]"
                    />
                  )}

                  {active && (
                    <Loader2
                      size={17}
                      className="animate-spin text-[#b58a32]"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </section>
)}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-7 rounded-[24px] border border-red-200 bg-red-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-red-700">
                  PrimeMatch could not load.
                </p>

                <p className="mt-1 text-xs text-red-500">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  loadData
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-[#dec68b] bg-[#fff5dd] px-5 py-2.5 text-xs font-black text-[#8f6b25]"
              >
                <RefreshCw
                  size={14}
                />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            RESULTS
        ================================================= */}

        {!loading &&
          matched &&
          topMatch && (
            <>
              {/* TOP MATCH */}
              <section
                id="match-results"
                className="mt-10 scroll-mt-24"
              >
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles
                        size={16}
                        className="text-[#b58a32]"
                      />

                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                        Your Prime Match
                      </p>
                    </div>

                    <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                      We found a strong match.
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Based on your selected
                      preferences and product data.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setMatched(
                        false
                      )
                    }
                    className="flex items-center gap-2 text-xs font-black text-[#9b762b]"
                  >
                    Change preferences
                    <ArrowRight
                      size={14}
                    />
                  </button>
                </div>

                <div className="overflow-hidden rounded-[30px] border border-[#dec68b] bg-[#fffaf0] shadow-sm">
                  <div className="grid lg:grid-cols-[.9fr_1.1fr]">
                    {/* IMAGE */}
                    <div className="relative min-h-[420px] bg-white">
                      <ProductImage
                        src={getImageUrl(
                          topMatch.image_url
                        )}
                        alt={
                          topMatch.name
                        }
                        className="h-full min-h-[420px] w-full object-contain p-10"
                      />

                      <div className="absolute left-6 top-6 rounded-full bg-[#c9a24d] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white">
                        #1 Prime Match
                      </div>

                      <div className="absolute bottom-6 left-6 rounded-full border border-[#eadfca] bg-white/95 px-4 py-2 text-xs font-black text-[#9b762b] shadow-sm">
                        {topMatch.matchScore}% Match
                      </div>
                    </div>

                    {/* DETAILS */}
                    <div className="p-6 sm:p-9">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#9b762b]">
                          {
                            topMatch.categoryName
                          }
                        </span>

                        {topMatch.brand && (
                          <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-gray-600">
                            {
                              topMatch.brand
                            }
                          </span>
                        )}

                        {topMatch.is_flash_sale && (
                          <span className="flex items-center gap-1 rounded-full bg-[#fff1d2] px-3 py-1.5 text-[10px] font-black text-[#9b762b]">
                            <Zap
                              size={11}
                            />
                            Flash Deal
                          </span>
                        )}
                      </div>

                      <h3 className="mt-4 text-3xl font-black leading-tight">
                        {
                          topMatch.name
                        }
                      </h3>

                      {topMatch.short_description && (
                        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                          {
                            topMatch.short_description
                          }
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-black text-[#956f27]">
                          <Star
                            size={13}
                            fill="currentColor"
                          />
                          {Number(
                            topMatch.rating ||
                              0
                          ).toFixed(
                            1
                          )}
                        </span>

                        <span className="text-xs text-gray-400">
                          {
                            topMatch.reviews_count
                          }{" "}
                          reviews
                        </span>

                        <span className="text-xs font-black text-green-600">
                          {topMatch.stock >
                          0
                            ? "In stock"
                            : "Out of stock"}
                        </span>
                      </div>

                      <div className="mt-5 flex items-end gap-3">
                        <span className="text-3xl font-black">
                          {money(
                            Number(
                              topMatch.price
                            )
                          )}
                        </span>

                        {topMatch.original_price &&
                          Number(
                            topMatch.original_price
                          ) >
                            Number(
                              topMatch.price
                            ) && (
                            <span className="mb-1 text-sm text-gray-400 line-through">
                              {money(
                                Number(
                                  topMatch.original_price
                                )
                              )}
                            </span>
                          )}
                      </div>

                      {/* WHY */}
                      <div className="mt-7">
                        <div className="mb-4 flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff0c8] text-[#9b762b]">
                            <Target
                              size={15}
                            />
                          </div>

                          <div>
                            <p className="text-xs font-black">
                              Why this matches
                            </p>

                            <p className="text-[10px] font-semibold text-gray-400">
                              Your preference breakdown
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <ScoreBar
                            label="Budget fit"
                            value={
                              topMatch
                                .breakdown
                                .budget
                            }
                          />

                          <ScoreBar
                            label="Quality"
                            value={
                              topMatch
                                .breakdown
                                .quality
                            }
                          />

                          <ScoreBar
                            label="Category"
                            value={
                              topMatch
                                .breakdown
                                .category
                            }
                          />

                          <ScoreBar
                            label="Purpose"
                            value={
                              topMatch
                                .breakdown
                                .purpose
                            }
                          />

                          <ScoreBar
                            label="Rating"
                            value={
                              topMatch
                                .breakdown
                                .rating
                            }
                          />

                          <ScoreBar
                            label="Brand"
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
                      </div>

                      {/* REASONS */}
                      <div className="mt-6 rounded-2xl border border-[#eadfc8] bg-white/70 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#a17b2f]">
                          Match highlights
                        </p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {topMatch.reasons.map(
                            (
                              reason
                            ) => (
                              <div
                                key={
                                  reason
                                }
                                className="flex items-center gap-2 text-xs font-semibold text-gray-600"
                              >
                                <Check
                                  size={
                                    14
                                  }
                                  className="text-[#b58a32]"
                                />
                                {
                                  reason
                                }
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr]">
                        <button
                          type="button"
                          disabled={
                            topMatch.stock <=
                            0
                          }
                          onClick={() =>
                            addToCart(
                              topMatch
                            )
                          }
                          className="flex items-center justify-center gap-2 rounded-2xl bg-[#c9a24d] px-5 py-3.5 text-xs font-black text-white transition hover:bg-[#b58a32] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                        >
                          <ShoppingCart
                            size={16}
                          />
                          {cartIds.includes(
                            topMatch.id
                          )
                            ? "Added to Cart"
                            : "Add to Cart"}
                        </button>

                        <Link
                          href={`/dashboard/products/${topMatch.id}`}
                          className="flex items-center justify-center gap-2 rounded-2xl border border-[#d9c79f] bg-white px-5 py-3.5 text-xs font-black text-[#956f27] transition hover:bg-[#fff8e8]"
                        >
                          View Product
                          <ArrowRight
                            size={15}
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  TOP 3 PERSONALIZED MATCHES
              ================================================= */}

              <section className="mt-10">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                      Personalized shortlist
                    </p>
                    <h2 className="mt-1 text-2xl font-black">Your top 3 matches</h2>
                    <p className="mt-1 text-sm text-gray-500">The strongest options from your current preferences.</p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#fff4d6] px-3 py-1.5 text-[10px] font-black text-[#956f27]">
                    <Award size={13} />
                    Avg. top match {averageMatch}%
                  </span>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                  {results.slice(0, 3).map((product, index) => {
                    const tier = getMatchTier(product.matchScore);
                    return (
                      <article key={product.id} className="overflow-hidden rounded-[26px] border border-[#e8dfcf] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(100,75,25,0.10)]">
                        <div className="relative h-64 bg-[#faf8f2]">
                          <ProductImage
                            src={getImageUrl(product.image_url)}
                            alt={product.name}
                            className="h-full w-full object-contain p-7"
                          />
                          <div className="absolute left-4 top-4 flex items-center gap-2">
                            <span className="rounded-full bg-[#fff0c8] px-3 py-1.5 text-[10px] font-black text-[#8f6b25]">#{index + 1}</span>
                            <span className="rounded-full border border-[#ead9ad] bg-white/95 px-3 py-1.5 text-[10px] font-black text-[#956f27]">{tier.label}</span>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-2xl font-black text-[#9b762b]">{product.matchScore}%</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#fffaf0] px-2.5 py-1 text-[10px] font-black text-[#8f6b25]">
                              <Star size={11} fill="currentColor" /> {Number(product.rating || 0).toFixed(1)}
                            </span>
                          </div>
                          <Link href={`/dashboard/products/${product.id}`} className="mt-2 block line-clamp-2 text-base font-black leading-6 hover:text-[#9b762b]">{product.name}</Link>
                          <p className="mt-1 text-[10px] font-semibold text-gray-400">{product.categoryName} · {product.brand || "Any brand"}</p>
                          <div className="mt-4 flex items-end justify-between gap-3">
                            <span className="text-lg font-black">{money(Number(product.price))}</span>
                            {discount(Number(product.price), product.original_price) > 0 && (
                              <span className="rounded-full bg-[#fff4d6] px-2 py-1 text-[9px] font-black text-[#956f27]">{discount(Number(product.price), product.original_price)}% OFF</span>
                            )}
                          </div>
                          <div className="mt-4 space-y-2">
                            {product.reasons.slice(0, 2).map((reason) => (
                              <div key={reason} className="flex items-center gap-2 text-[10px] font-semibold text-gray-500">
                                <Check size={12} className="shrink-0 text-[#b58a32]" /> {reason}
                              </div>
                            ))}
                          </div>
                          <div className="mt-5 grid grid-cols-2 gap-2">
                            <button type="button" disabled={product.stock <= 0} onClick={() => addToCart(product)} className="flex items-center justify-center gap-1.5 rounded-xl bg-[#c9a24d] px-3 py-2.5 text-[10px] font-black text-white transition hover:bg-[#b58a32] disabled:cursor-not-allowed disabled:bg-[#f1ede4] disabled:text-gray-400">
                              <ShoppingCart size={13} /> {cartIds.includes(product.id) ? "Added" : "Add to Cart"}
                            </button>
                            <Link href={`/dashboard/products/${product.id}`} className="flex items-center justify-center gap-1.5 rounded-xl border border-[#dfd3bf] bg-white px-3 py-2.5 text-[10px] font-black text-[#956f27] hover:bg-[#fff8e8]">
                              View <ArrowRight size={13} />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* =================================================
                  MATCH SUMMARY
              ================================================= */}

              <section className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-[#e8dfcf] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3d2] text-[#9b762b]"><Target size={18} /></div>
                    <div><p className="text-[10px] font-black uppercase tracking-wider text-[#a17b2f]">Match confidence</p><p className="mt-1 text-lg font-black">{matchTier?.label || "Ready"}</p></div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-gray-500">Your top recommendation scores {topMatch?.matchScore || 0}% across budget, purpose, quality, category and availability.</p>
                </div>
                <div className="rounded-[24px] border border-[#e8dfcf] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3d2] text-[#9b762b]"><Lightbulb size={18} /></div>
                    <div><p className="text-[10px] font-black uppercase tracking-wider text-[#a17b2f]">Budget insight</p><p className="mt-1 text-lg font-black">{bestValue ? money(Number(bestValue.price)) : "—"}</p></div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-gray-500">Best-value recommendation balancing match quality, price, rating and active savings.</p>
                </div>
                <div className="rounded-[24px] border border-[#e8dfcf] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3d2] text-[#9b762b]"><Award size={18} /></div>
                    <div><p className="text-[10px] font-black uppercase tracking-wider text-[#a17b2f]">Potential saving</p><p className="mt-1 text-lg font-black">{bestSaving > 0 ? money(bestSaving) : "No active saving"}</p></div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-gray-500">Largest current saving found among your matched products.</p>
                </div>
              </section>

              {/* =================================================
                  BUDGET ADVISOR + ANALYTICS
              ================================================= */}
              {budgetAdvisor && (
                <section className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
                  <div className="rounded-[26px] border border-[#e8dfcf] bg-gradient-to-br from-[#fffaf0] to-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a17b2f]">Budget advisor</p><h3 className="mt-1 text-xl font-black">Make the most of your budget</h3></div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3d2] text-[#9b762b]"><TrendingUp size={18} /></div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-[#eadfc9] bg-white p-4"><p className="text-[10px] font-bold text-gray-400">In budget</p><p className="mt-1 text-xl font-black text-[#9b762b]">{budgetAdvisor.count}</p><p className="text-[10px] text-gray-400">matched products</p></div>
                      <div className="rounded-2xl border border-[#eadfc9] bg-white p-4"><p className="text-[10px] font-bold text-gray-400">Best match</p><p className="mt-1 text-xl font-black">{money(Number(budgetAdvisor.best.price))}</p><p className="text-[10px] text-gray-400">{budgetAdvisor.best.matchScore}% fit</p></div>
                      <div className="rounded-2xl border border-[#eadfc9] bg-white p-4"><p className="text-[10px] font-bold text-gray-400">Average price</p><p className="mt-1 text-xl font-black">{money(budgetAdvisor.avg)}</p><p className="text-[10px] text-gray-400">top available options</p></div>
                    </div>
                    <p className="mt-4 text-xs leading-5 text-gray-500">{budgetAdvisor.count ? "You have several products inside your selected budget. PrimeMatch is prioritising the strongest match instead of simply choosing the cheapest item." : "There are no exact in-budget products, so PrimeMatch is showing the closest alternatives."}</p>
                  </div>

                  {matchAnalytics && (
                    <div className="rounded-[26px] border border-[#e8dfcf] bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3d2] text-[#9b762b]"><Award size={18} /></div><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a17b2f]">Recommendation analytics</p><h3 className="mt-1 text-xl font-black">What PrimeMatch found</h3></div></div>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        {[["Analysed", matchAnalytics.analysed],["Matched", matchAnalytics.matched],["In budget", matchAnalytics.inBudget],["Highly rated", matchAnalytics.highRated],["Great deals", matchAnalytics.deals],["Available", matchAnalytics.available]].map(([label,value]) => <div key={String(label)} className="rounded-2xl bg-[#fffaf0] p-3"><p className="text-[10px] font-bold text-gray-400">{label}</p><p className="mt-1 text-lg font-black text-[#8f6b24]">{value}</p></div>)}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* =================================================
                  SMART SURPRISE
              ================================================= */}
              <section id="surprise-match" className="mt-8 rounded-[26px] border border-[#eadfc9] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a17b2f]">Something unexpected</p><h3 className="mt-1 text-xl font-black">✨ Surprise me</h3><p className="mt-1 text-xs leading-5 text-gray-500">Get a relevant alternative from your matched products without changing your preferences.</p></div>
                  <button type="button" onClick={surpriseMe} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d9c79f] bg-white px-5 py-3 text-xs font-black text-[#8f6b24] transition hover:bg-[#fff8e8]"><Sparkles size={15} /> Surprise Me</button>
                </div>
                {surpriseId && (() => { const product = results.find((item) => item.id === surpriseId); if (!product) return null; return <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[#eadfc9] bg-[#fffaf0] p-4 sm:flex-row sm:items-center"><div className="h-28 w-full shrink-0 rounded-xl bg-white sm:w-28"><ProductImage src={getImageUrl(product.image_url)} alt={product.name} className="h-full w-full object-contain p-3" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#fff3d2] px-2.5 py-1 text-[9px] font-black text-[#8f6b24]">Surprise Pick</span><span className="text-[10px] font-black text-[#9b762b]">{product.matchScore}% match</span></div><Link href={`/dashboard/products/${product.id}`} className="mt-2 block truncate text-sm font-black hover:text-[#9b762b]">{product.name}</Link><p className="mt-1 text-[10px] text-gray-400">{product.categoryName} · {money(Number(product.price))} · {Number(product.rating || 0).toFixed(1)}★</p></div></div>; })()}
              </section>

              {/* =================================================
                  SMART PICKS
              ================================================= */}

              <section className="mt-10">
                <div className="mb-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                    Smart alternatives
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    More ways to shop your match
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      label: "Best Value",
                      text: "Balanced price + match",
                      product:
                        bestValue,
                      icon: (
                        <TrendingUp
                          size={17}
                        />
                      ),
                    },
                    {
                      label: "Budget Pick",
                      text: "Lower price option",
                      product:
                        budgetPick,
                      icon: (
                        <Target
                          size={17}
                        />
                      ),
                    },
                    {
                      label: "Top Rated",
                      text: "Highest rated option",
                      product:
                        topRated,
                      icon: (
                        <Star
                          size={17}
                          fill="currentColor"
                        />
                      ),
                    },
                    {
                      label: "Premium Pick",
                      text: "Higher-end option",
                      product:
                        premiumPick,
                      icon: (
                        <Sparkles
                          size={17}
                        />
                      ),
                    },
                  ].map(
                    (item) => (
                      <div
                        key={
                          item.label
                        }
                        className="overflow-hidden rounded-[24px] border border-[#e8dfcf] bg-white"
                      >
                        {item.product ? (
                          <>
                            <Link
                              href={`/dashboard/products/${item.product.id}`}
                              className="block"
                            >
                              <div className="relative h-44 bg-[#faf9f6]">
                                <ProductImage
                                  src={getImageUrl(
                                    item
                                      .product
                                      .image_url
                                  )}
                                  alt={
                                    item
                                      .product
                                      .name
                                  }
                                  className="h-full w-full object-contain p-5"
                                />

                                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-black text-[#956f27] shadow-sm">
                                  {
                                    item.icon
                                  }
                                  {
                                    item.label
                                  }
                                </div>
                              </div>
                            </Link>

                            <div className="p-4">
                              <p className="text-[10px] font-bold text-gray-400">
                                {
                                  item.text
                                }
                              </p>

                              <Link
                                href={`/dashboard/products/${item.product.id}`}
                                className="mt-1 block line-clamp-2 text-sm font-black hover:text-[#9b762b]"
                              >
                                {
                                  item
                                    .product
                                    .name
                                }
                              </Link>

                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-sm font-black">
                                  {money(
                                    Number(
                                      item
                                        .product
                                        .price
                                    )
                                  )}
                                </span>

                                <span className="rounded-full bg-[#fff4d6] px-2 py-1 text-[9px] font-black text-[#956f27]">
                                  {
                                    item
                                      .product
                                      .matchScore
                                  }
                                  %
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex h-64 items-center justify-center p-6 text-center">
                            <div>
                              <ShoppingBag
                                size={
                                  28
                                }
                                className="mx-auto text-gray-300"
                              />

                              <p className="mt-3 text-xs font-bold text-gray-400">
                                No suitable
                                product found
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* =================================================
                  COMPARE
              ================================================= */}

              <section className="mt-10">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                      Compare
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      Compare your shortlisted products
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Select up to 3 products from
                      the results below.
                    </p>
                  </div>

                  {compareProducts.length >
                    0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setCompareIds(
                          []
                        )
                      }
                      className="text-xs font-black text-gray-400 hover:text-red-500"
                    >
                      Clear comparison
                    </button>
                  )}
                </div>

                {compareProducts.length >
                0 ? (
                  <div className="overflow-x-auto rounded-[26px] border border-[#e8dfcf] bg-white">
                    <table className="w-full min-w-[760px] text-left">
                      <thead>
                        <tr className="border-b border-[#eee5d6] bg-[#fffdfa]">
                          <th className="w-40 px-5 py-4 text-[10px] font-black uppercase tracking-wide text-gray-400">
                            Feature
                          </th>

                          {compareProducts.map(
                            (
                              product
                            ) => (
                              <th
                                key={
                                  product.id
                                }
                                className="px-5 py-4"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className="line-clamp-2 text-xs font-black">
                                    {
                                      product.name
                                    }
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleCompare(
                                        product.id
                                      )
                                    }
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <X
                                      size={
                                        14
                                      }
                                    />
                                  </button>
                                </div>
                              </th>
                            )
                          )}
                        </tr>
                      </thead>

                      <tbody>
                        <tr className="border-b border-[#f0eadf]">
                          <td className="px-5 py-4 text-xs font-black text-gray-500">
                            Match
                          </td>

                          {compareProducts.map(
                            (
                              product
                            ) => (
                              <td
                                key={
                                  product.id
                                }
                                className="px-5 py-4 text-sm font-black text-[#9b762b]"
                              >
                                {
                                  product.matchScore
                                }
                                %
                              </td>
                            )
                          )}
                        </tr>

                        <tr className="border-b border-[#f0eadf]">
                          <td className="px-5 py-4 text-xs font-black text-gray-500">
                            Price
                          </td>

                          {compareProducts.map(
                            (
                              product
                            ) => (
                              <td
                                key={
                                  product.id
                                }
                                className="px-5 py-4 text-sm font-black"
                              >
                                {money(
                                  Number(
                                    product.price
                                  )
                                )}
                              </td>
                            )
                          )}
                        </tr>

                        <tr className="border-b border-[#f0eadf]">
                          <td className="px-5 py-4 text-xs font-black text-gray-500">
                            Rating
                          </td>

                          {compareProducts.map(
                            (
                              product
                            ) => (
                              <td
                                key={
                                  product.id
                                }
                                className="px-5 py-4 text-sm font-black"
                              >
                                <span className="inline-flex items-center gap-1">
                                  <Star
                                    size={
                                      13
                                    }
                                    fill="currentColor"
                                    className="text-[#c9a24d]"
                                  />
                                  {Number(
                                    product.rating ||
                                      0
                                  ).toFixed(
                                    1
                                  )}
                                </span>
                              </td>
                            )
                          )}
                        </tr>

                        <tr className="border-b border-[#f0eadf]">
                          <td className="px-5 py-4 text-xs font-black text-gray-500">
                            Category
                          </td>

                          {compareProducts.map(
                            (
                              product
                            ) => (
                              <td
                                key={
                                  product.id
                                }
                                className="px-5 py-4 text-xs font-bold text-gray-600"
                              >
                                {
                                  product.categoryName
                                }
                              </td>
                            )
                          )}
                        </tr>

                        <tr>
                          <td className="px-5 py-4 text-xs font-black text-gray-500">
                            Brand
                          </td>

                          {compareProducts.map(
                            (
                              product
                            ) => (
                              <td
                                key={
                                  product.id
                                }
                                className="px-5 py-4 text-xs font-bold text-gray-600"
                              >
                                {product.brand ||
                                  "Generic"}
                              </td>
                            )
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-[26px] border border-dashed border-[#ddcfb5] bg-white p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff5dd] text-[#b58a32]">
                      <Target
                        size={21}
                      />
                    </div>

                    <p className="mt-3 text-sm font-black">
                      No products selected
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Use the Compare button on
                      product cards below.
                    </p>
                  </div>
                )}
              </section>
            </>
          )}

        {/* =================================================
            PRODUCT RESULTS
        ================================================= */}

        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles
                  size={15}
                  className="text-[#b58a32]"
                />

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                  Ranked products
                </p>
              </div>

              <h2 className="mt-1 text-2xl font-black">
               {matched
                 ? "Your ranked matches"
                 : "Ready to find your match?"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {loading
                 ? "Loading PrimeCart intelligence..."
                 : matched
                 ? `${results.length} products matched to your preferences.`
                : "Choose your preferences above and let PrimeMatch find the right products for you."}
                </p>
            </div>

            {matched && (
              <button
                type="button"
                onClick={
                  runMatch
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-[#dfd3bf] bg-white px-4 py-2.5 text-xs font-black text-gray-600 transition hover:border-[#c9a24d] hover:text-[#9b762b]"
              >
                <RefreshCw
                  size={14}
                />
                Refresh Match
              </button>
            )}
          </div>

          {/* LOADING */}
          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({
                length: 8,
              }).map(
                (_, index) => (
                  <ProductSkeleton
                    key={
                      index
                    }
                  />
                )
              )}
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
  matched &&
  !matching &&
  results.length === 0 && (

              <div className="rounded-[28px] border border-dashed border-[#ddcfb5] bg-white px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff5dd] text-[#b58a32]">
                  <Search
                    size={26}
                  />
                </div>

                <h3 className="mt-5 text-xl font-black">
                  No matching products found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Try changing the category,
                  brand, budget or search term.
                  PrimeMatch will automatically
                  recalculate the results.
                </p>

                <button
                  type="button"
                  onClick={
                    resetPreferences
                  }
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#c9a24d] px-5 py-3 text-xs font-black text-white"
                >
                  <RefreshCw
                    size={14}
                  />
                  Reset Preferences
                </button>
              </div>
            )}

          {/* PRODUCTS */}
          {!loading &&
  matched &&
  !matching &&
  results.length > 0 && (

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map(
                  (
                    product,
                    index
                  ) => (
                    <div
                      key={
                        product.id
                      }
                      className="relative"
                    >
                      <ProductCard
                        product={
                          product
                        }
                        rank={
                          index + 1
                        }
                        wished={wishlist.includes(
                          product.id
                        )}
                        added={cartIds.includes(
                          product.id
                        )}
                        onWishlist={() =>
                          toggleWishlist(
                            product
                          )
                        }
                        onCart={() =>
                          addToCart(
                            product
                          )
                        }
                      />

                      {/* COMPARE BUTTON */}
                      <button
                        type="button"
                        onClick={() =>
                          toggleCompare(
                            product.id
                          )
                        }
                        className={`absolute bottom-[88px] right-5 rounded-lg px-2.5 py-1.5 text-[9px] font-black transition ${
                          compareIds.includes(
                            product.id
                          )
                            ? "bg-[#fff0c8] text-[#956f27]"
                            : "bg-white/95 text-gray-500 shadow-sm hover:text-[#956f27]"
                        }`}
                      >
                        {compareIds.includes(
                          product.id
                        )
                          ? "✓ Comparing"
                          : "Compare"}
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
        </section>

        {/* =================================================
            PRIMEPOINTS PREVIEW
        ================================================= */}
        {matched && topMatch && (
          <section className="mt-8 rounded-[28px] border border-[#eadfc9] bg-gradient-to-r from-[#fffaf0] via-white to-[#fff7e4] p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div><div className="flex items-center gap-2 text-[#9b762b]"><Award size={17} /><span className="text-[10px] font-black uppercase tracking-[0.18em]">PrimePoints preview</span></div><h2 className="mt-2 text-2xl font-black">Earn {Math.max(20, Math.round(topMatch.matchScore * 1.25))} PrimePoints on this match</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">A small reward for discovering products through PrimeMatch. This is a preview UI and does not change your existing rewards database.</p></div>
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border border-[#e6d4a7] bg-white text-2xl font-black text-[#b58a32] shadow-sm">{Math.max(20, Math.round(topMatch.matchScore * 1.25))}</div>
            </div>
          </section>
        )}

        {/* =================================================
            HOW IT WORKS
        ================================================= */}

        <section className="mt-12 overflow-hidden rounded-[30px] border border-[#eadfc9] bg-white">
          <div className="border-b border-[#eee5d6] bg-[#fffaf0] px-6 py-7 sm:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
              How PrimeMatch works
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Shopping, but more personal.
            </h2>
          </div>

          <div className="grid gap-0 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Tell us what you need",
                text: "Choose your purpose, budget, category and preferred brand.",
                icon: (
                  <Target
                    size={19}
                  />
                ),
              },
              {
                number: "02",
                title: "Set your priorities",
                text: "Tell PrimeMatch whether price, quality, brand or rating matters more.",
                icon: (
                  <TrendingUp
                    size={19}
                  />
                ),
              },
              {
                number: "03",
                title: "Get ranked matches",
                text: "Products are scored using your preferences, product data, ratings and availability.",
                icon: (
                  <Sparkles
                    size={19}
                  />
                ),
              },
            ].map(
              (item, index) => (
                <div
                  key={
                    item.number
                  }
                  className={`p-6 sm:p-8 ${
                    index <
                    2
                      ? "border-b md:border-b-0 md:border-r border-[#eee5d6]"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#c9a24d]">
                      {item.number}
                    </span>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff5dc] text-[#a17b2f]">
                      {
                        item.icon
                      }
                    </div>
                  </div>

                  <h3 className="mt-7 text-base font-black">
                    {
                      item.title
                    }
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {
                      item.text
                    }
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        {/* =================================================
            FINAL CTA
        ================================================= */}

        <section className="mt-8 rounded-[30px] border border-[#eadfc9] bg-white px-6 py-10 text-gray-800 sm:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#d8b866]">
                <Sparkles
                  size={17}
                />

                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  PrimeCart Intelligence
                </span>
              </div>

              <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                Still exploring?
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                Change your preferences and PrimeMatch
                will recalculate the ranking for you.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior:
                    "smooth",
                });
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#c9a24d] px-6 py-3.5 text-xs font-black text-white transition hover:bg-[#b58a32]"
            >
              <ArrowLeft
                size={15}
                className="rotate-90"
              />
              Change Preferences
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
