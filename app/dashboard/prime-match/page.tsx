"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Heart,
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

function getimageUrl(value: string | null) {
  if (!value?.trim()) return null;

  const cleaned = value.trim();

  // Full URL
  if (
    cleaned.startsWith("http://") ||
    cleaned.startsWith("https://")
  ) {
    return cleaned;
  }

  // Already absolute public path
  if (cleaned.startsWith("/")) {
    return cleaned;
  }

  // IMPORTANT:
  // If your images are inside:
  // public/products/
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
    purposeScore * 0.24 +
    categoryScore * 0.18 +
    budgetScore *
      normalizedBudget *
      0.30 +
    ratingScore *
      normalizedRating *
      0.16 +
    brandScore *
      normalizedBrand *
      0.10 +
    availabilityScore * 0.02 +
    searchScore * 0.04;

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

  if (ratingScore >= 90) {
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
      rating: ratingScore,
      brand: brandScore,
      availability:
        availabilityScore,
      search: searchScore,
    },
  };
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
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] =
    useState(false);

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
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={className}
    />
  );
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
        <div className="absolute left-4 top-4 rounded-full bg-[#171717] px-3 py-1.5 text-[10px] font-black text-white shadow">
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
            <span className="flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-[10px] font-black text-white">
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
          <h3 className="line-clamp-2 min-h-[48px] text-base font-black leading-6 text-gray-900 transition hover:text-[#a17b2f]">
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
          <span className="text-xl font-black text-gray-950">
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
                ? "bg-green-600 text-white"
                : "bg-[#171717] text-white hover:bg-[#2b2b2b]"
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

  const results =
    filteredResults;

  const topMatch =
    results[0] || null;

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
          .sort(
            (a, b) =>
              Number(b.price) -
                Number(a.price) ||
              b.matchScore -
                a.matchScore
          )[0] || null
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
      if (!topMatch) {
        return 0;
      }

      return topMatch.matchScore;
    }, [topMatch]);

  /* =====================================================
     CART
  ===================================================== */

  function addToCart(
    product: MatchProduct
  ) {
    try {
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
        current[
          existingIndex
        ] = {
          ...current[
            existingIndex
          ],
          quantity:
            Number(
              current[
                existingIndex
              ]?.quantity
            ) + 1,
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

  /* =====================================================
     RUN MATCH
  ===================================================== */

  async function runMatch() {
    if (loading) return;

    setMatching(true);
    setMatched(false);

    await new Promise(
      (resolve) =>
        window.setTimeout(
          resolve,
          650
        )
    );

    setMatched(true);
    setMatching(false);

    window.setTimeout(() => {
      document
        .getElementById(
          "match-results"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
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

    setMatched(false);
    setCompareIds([]);
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
    <main className="min-h-screen bg-[#fcfbf8] text-gray-900">
      {/* =================================================
          TOAST
      ================================================= */}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
          <div className="flex max-w-[90vw] items-center gap-3 rounded-2xl border border-[#dec68b] bg-[#171717] px-5 py-3 text-sm font-bold text-white shadow-2xl">
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
                <span className="text-5xl font-black text-gray-950">
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
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X
                      size={14}
                    />
                  </button>
                )}
              </div>
            </div>

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
                className="flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#171717] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-black/10 transition hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:opacity-60"
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
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white"
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

                      <div className="absolute left-6 top-6 rounded-full bg-[#171717] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white">
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
                          <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-black text-red-600">
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
                          className="flex items-center justify-center gap-2 rounded-2xl bg-[#171717] px-5 py-3.5 text-xs font-black text-white transition hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
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
                  : "Products ready to match"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {loading
                  ? "Loading products..."
                  : `${results.length} products available for your current preferences.`}
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
            results.length ===
              0 && (
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
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#171717] px-5 py-3 text-xs font-black text-white"
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
            results.length >
              0 && (
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

        <section className="mt-8 rounded-[30px] bg-[#171717] px-6 py-10 text-white sm:px-10">
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
