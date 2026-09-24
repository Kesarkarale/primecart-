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
  SlidersHorizontal,
  ShieldCheck,
  CircleAlert,
  RotateCcw,
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
  search: number;
  availability: number;
};

type MatchProduct = Product & {
  categoryName: string;
  matchScore: number;
  reasons: string[];
  breakdown: Breakdown;
  matchLabel: string;
};

type Budget = {
  id: string;
  label: string;
  min: number;
  max: number;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

/* =========================================================
   CONSTANTS
========================================================= */

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
   IMAGE / MONEY HELPERS
========================================================= */

function imageUrl(value: string | null) {
  if (!value?.trim()) return null;

  const cleaned = value.trim();

  if (
    cleaned.startsWith("http://") ||
    cleaned.startsWith("https://") ||
    cleaned.startsWith("/")
  ) {
    return cleaned;
  }

  return `/${cleaned}`;
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function discount(price: number, original: number | null) {
  if (!original || original <= price) return 0;

  return Math.round(((original - price) / original) * 100);
}

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

/* =========================================================
   PURPOSE KEYWORDS
========================================================= */

const PURPOSE_KEYWORDS: Record<
  string,
  {
    primary: string[];
    secondary: string[];
  }
> = {
  everyday: {
    primary: [
      "mobile",
      "phone",
      "smartphone",
      "watch",
      "bag",
      "wallet",
      "bottle",
      "headphone",
      "earbuds",
    ],
    secondary: [
      "shirt",
      "home",
      "kitchen",
      "travel",
      "accessory",
      "daily",
      "essential",
    ],
  },

  work: {
    primary: [
      "laptop",
      "keyboard",
      "mouse",
      "monitor",
      "office",
      "desk",
      "notebook",
      "study",
      "work",
    ],
    secondary: [
      "book",
      "tablet",
      "printer",
      "headphone",
      "backpack",
      "chair",
      "organizer",
      "productivity",
    ],
  },

  entertainment: {
    primary: [
      "gaming",
      "game",
      "headphone",
      "headset",
      "earbuds",
      "speaker",
      "console",
      "tv",
    ],
    secondary: [
      "bluetooth",
      "music",
      "controller",
      "keyboard",
      "mouse",
      "streaming",
      "audio",
    ],
  },

  fitness: {
    primary: [
      "fitness",
      "gym",
      "yoga",
      "running",
      "sports",
      "shoe",
      "dumbbell",
      "workout",
    ],
    secondary: [
      "bottle",
      "training",
      "active",
      "exercise",
      "sport",
      "health",
      "fitness",
    ],
  },

  style: {
    primary: [
      "fashion",
      "shirt",
      "tshirt",
      "hoodie",
      "jacket",
      "denim",
      "clothing",
      "watch",
      "bag",
    ],
    secondary: [
      "wallet",
      "shoe",
      "goggle",
      "sunglass",
      "accessory",
      "style",
      "wear",
    ],
  },

  home: {
    primary: [
      "home",
      "living",
      "kitchen",
      "coffee",
      "cookware",
      "appliance",
      "air fryer",
      "kettle",
      "oven",
      "mixer",
    ],
    secondary: [
      "decor",
      "furniture",
      "storage",
      "cleaning",
      "electric",
      "house",
      "dining",
    ],
  },
};

/* =========================================================
   CATEGORY KEYWORDS
========================================================= */

function keywordsForCategory(categoryName: string) {
  const value = normalize(categoryName);

  if (value.includes("mobile")) {
    return [
      "mobile",
      "phone",
      "smartphone",
      "iphone",
      "android",
      "tablet",
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
      "boots",
    ];
  }

  if (value.includes("watch")) {
    return ["watch", "smartwatch", "time", "fitness watch"];
  }

  if (value.includes("bag")) {
    return ["bag", "backpack", "luggage", "wallet", "purse"];
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
      "dashboard",
      "car accessory",
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
      "microwave",
      "washing",
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
      "learning",
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
      "storage",
    ];
  }

  return value
    .split(/\s+/)
    .filter(Boolean);
}

/* =========================================================
   TEXT SEARCH
========================================================= */

function searchableProduct(product: Product, category?: Category) {
  return [
    product.name,
    product.brand || "",
    product.short_description || "",
    product.description || "",
    category?.name || "",
    category?.slug || "",
  ]
    .join(" ")
    .toLowerCase();
}

/* =========================================================
   PURPOSE SCORE
========================================================= */

function getPurposeScore(
  product: Product,
  category: Category | undefined,
  purpose: string
) {
  const config = PURPOSE_KEYWORDS[purpose];

  if (!config) return 50;

  const searchable = searchableProduct(product, category);

  const primaryMatches = config.primary.filter((word) =>
    searchable.includes(word.toLowerCase())
  ).length;

  const secondaryMatches = config.secondary.filter((word) =>
    searchable.includes(word.toLowerCase())
  ).length;

  if (primaryMatches >= 2) return 100;
  if (primaryMatches === 1) return 88;
  if (secondaryMatches >= 2) return 72;
  if (secondaryMatches === 1) return 60;

  return 35;
}

/* =========================================================
   BUDGET SCORE
========================================================= */

function getBudgetScore(
  priceValue: number,
  budgetId: string
) {
  const selected = BUDGETS.find(
    (item) => item.id === budgetId
  );

  if (!selected) return 50;

  const price = Number(priceValue) || 0;

  if (selected.max === Infinity) {
    if (price >= selected.min) return 100;

    const difference = selected.min - price;

    if (difference <= 1000) return 82;
    if (difference <= 3000) return 68;

    return 45;
  }

  if (
    price >= selected.min &&
    price <= selected.max
  ) {
    const range = selected.max - selected.min || 1;
    const middle = selected.min + range / 2;

    const distanceFromMiddle = Math.abs(
      price - middle
    );

    const normalized =
      100 -
      (distanceFromMiddle / (range / 2)) * 15;

    return clamp(Math.round(normalized), 85, 100);
  }

  const difference =
    price < selected.min
      ? selected.min - price
      : price - selected.max;

  const range =
    selected.max - selected.min || 1000;

  const ratio = difference / range;

  if (ratio <= 0.2) return 78;
  if (ratio <= 0.5) return 62;
  if (ratio <= 1) return 45;

  return 25;
}

/* =========================================================
   CATEGORY SCORE
========================================================= */

function getCategoryScore(
  product: Product,
  categories: Category[],
  categoryId: string
) {
  if (categoryId === "all") return 85;

  const selected = categories.find(
    (item) => item.id === categoryId
  );

  if (!selected) return 50;

  if (product.category_id === categoryId) {
    return 100;
  }

  const searchable = searchableProduct(
    product,
    categories.find(
      (item) => item.id === product.category_id
    )
  );

  const keywords = keywordsForCategory(
    selected.name
  );

  const matches = keywords.filter((word) =>
    searchable.includes(word.toLowerCase())
  ).length;

  if (matches >= 2) return 68;
  if (matches === 1) return 52;

  return 8;
}

/* =========================================================
   BRAND SCORE
========================================================= */

function getBrandScore(
  product: Product,
  selectedBrand: string
) {
  if (selectedBrand === "Any Brand") {
    return 85;
  }

  if (!product.brand) return 5;

  if (
    normalize(product.brand) ===
    normalize(selectedBrand)
  ) {
    return 100;
  }

  return 5;
}

/* =========================================================
   RATING SCORE
========================================================= */

function getRatingScore(product: Product) {
  const rating = clamp(
    Number(product.rating) || 0,
    0,
    5
  );

  const reviewCount =
    Number(product.reviews_count) || 0;

  let score = (rating / 5) * 100;

  if (reviewCount >= 500) {
    score += 5;
  } else if (reviewCount >= 100) {
    score += 3;
  }

  return clamp(Math.round(score));
}

/* =========================================================
   SEARCH SCORE
========================================================= */

function getSearchScore(
  product: Product,
  category: Category | undefined,
  search: string
) {
  const query = normalize(search);

  if (!query) return 80;

  const words = query
    .split(/\s+/)
    .filter(Boolean);

  const name = normalize(product.name);
  const brand = normalize(product.brand);
  const categoryName = normalize(category?.name);
  const description = normalize(
    `${product.short_description || ""} ${
      product.description || ""
    }`
  );

  let score = 0;

  for (const word of words) {
    if (name.includes(word)) {
      score += 40;
    } else if (brand.includes(word)) {
      score += 30;
    } else if (categoryName.includes(word)) {
      score += 25;
    } else if (description.includes(word)) {
      score += 15;
    }
  }

  return clamp(score);
}

/* =========================================================
   AVAILABILITY SCORE
========================================================= */

function getAvailabilityScore(product: Product) {
  const stock = Number(product.stock) || 0;

  if (stock <= 0) return 0;
  if (stock <= 3) return 70;
  if (stock <= 5) return 88;

  return 100;
}

/* =========================================================
   MATCH LABEL
========================================================= */

function matchLabel(score: number) {
  if (score >= 90) return "Excellent Match";
  if (score >= 80) return "Strong Match";
  if (score >= 70) return "Good Match";
  if (score >= 55) return "Possible Match";

  return "Alternative";
}

/* =========================================================
   SCORE PRODUCT
========================================================= */

function scoreProduct(
  product: Product,
  categories: Category[],
  purpose: string,
  budget: string,
  categoryId: string,
  brand: string,
  search: string
): MatchProduct {
  const category = categories.find(
    (item) => item.id === product.category_id
  );

  const purposeScore = getPurposeScore(
    product,
    category,
    purpose
  );

  const budgetScore = getBudgetScore(
    Number(product.price),
    budget
  );

  const categoryScore = getCategoryScore(
    product,
    categories,
    categoryId
  );

  const brandScore = getBrandScore(
    product,
    brand
  );

  const ratingScore =
    getRatingScore(product);

  const searchScore = getSearchScore(
    product,
    category,
    search
  );

  const availabilityScore =
    getAvailabilityScore(product);

  /*
    WEIGHTING

    Purpose       30%
    Budget        25%
    Category      20%
    Brand         10%
    Rating        10%
    Search         3%
    Availability   2%
  */

  let score =
    purposeScore * 0.3 +
    budgetScore * 0.25 +
    categoryScore * 0.2 +
    brandScore * 0.1 +
    ratingScore * 0.1 +
    searchScore * 0.03 +
    availabilityScore * 0.02;

  /*
    Exact preference penalties
  */

  if (
    categoryId !== "all" &&
    categoryScore < 20
  ) {
    score -= 20;
  }

  if (
    brand !== "Any Brand" &&
    brandScore < 20
  ) {
    score -= 18;
  }

  if (product.stock <= 0) {
    score -= 40;
  }

  if (product.is_featured) {
    score += 1.5;
  }

  if (product.is_flash_sale) {
    score += 1.5;
  }

  score = clamp(
    Math.round(score),
    product.stock > 0 ? 25 : 10,
    99
  );

  const reasons: string[] = [];

  if (budgetScore >= 90) {
    reasons.push("Excellent budget fit");
  } else if (budgetScore >= 75) {
    reasons.push("Fits your budget");
  } else if (budgetScore >= 60) {
    reasons.push("Near your budget");
  }

  if (categoryScore >= 95) {
    reasons.push("Exact category match");
  } else if (categoryScore >= 65) {
    reasons.push("Related to your category");
  }

  if (purposeScore >= 90) {
    reasons.push("Strongly fits your purpose");
  } else if (purposeScore >= 70) {
    reasons.push("Matches your purpose");
  }

  if (brandScore >= 95) {
    reasons.push("Preferred brand");
  }

  if (ratingScore >= 90) {
    reasons.push("Highly rated");
  }

  if (product.is_flash_sale) {
    reasons.push("Flash deal available");
  }

  if (product.stock > 0 && product.stock <= 5) {
    reasons.push("Limited stock");
  }

  if (search && searchScore >= 70) {
    reasons.push("Strong search match");
  }

  if (!reasons.length) {
    reasons.push("Potential alternative");
  }

  return {
    ...product,
    categoryName:
      category?.name || "PrimeCart",
    matchScore: score,
    matchLabel: matchLabel(score),
    reasons: reasons.slice(0, 4),
    breakdown: {
      budget: budgetScore,
      category: categoryScore,
      purpose: purposeScore,
      rating: ratingScore,
      brand: brandScore,
      search: searchScore,
      availability: availabilityScore,
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
        <span className="text-[10px] font-bold text-gray-500">
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
}: {
  src: string | null;
  alt: string;
}) {
  if (!src) {
    return (
      <div className="flex h-full items-center justify-center text-gray-300">
        <ShoppingBag size={45} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-contain p-6 transition duration-500 group-hover:scale-105"
      sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
    />
  );
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
  const image = imageUrl(product.image_url);

  const off = discount(
    Number(product.price),
    product.original_price
      ? Number(product.original_price)
      : null
  );

  return (
    <article className="group overflow-hidden rounded-[24px] border border-[#e8dfcf] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#d9bf7b] hover:shadow-[0_20px_50px_rgba(80,60,20,0.10)]">
      {/* IMAGE */}
      <div className="relative h-[275px] overflow-hidden bg-[#faf9f6]">
        <ProductImage
          src={image}
          alt={product.name}
        />

        {/* RANK */}
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-[#171717] px-3 py-1.5 text-[10px] font-black text-white shadow">
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
          aria-label="Toggle wishlist"
          onClick={onWishlist}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border bg-white/95 shadow-sm transition ${
            wished
              ? "border-red-200 text-red-500"
              : "border-[#e5dccb] text-gray-500 hover:border-red-200 hover:text-red-500"
          }`}
        >
          <Heart
            size={18}
            fill={
              wished ? "currentColor" : "none"
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
        <div className="flex items-center justify-between gap-2">
          <span className="max-w-[70%] truncate text-[10px] font-black uppercase tracking-[0.14em] text-[#a17b2f]">
            {product.categoryName}
          </span>

          {product.is_featured && (
            <span className="flex items-center gap-1 text-[10px] font-black text-[#a17b2f]">
              <BadgeCheck size={12} />
              FEATURED
            </span>
          )}
        </div>

        <Link
          href={`/dashboard/products/${product.id}`}
        >
          <h3 className="mt-2 line-clamp-2 min-h-[48px] text-[15px] font-black leading-6 transition-colors group-hover:text-[#a17b2f]">
            {product.name}
          </h3>
        </Link>

        {product.brand && (
          <p className="mt-1 text-xs font-medium text-gray-400">
            {product.brand}
          </p>
        )}

        {/* MATCH LABEL */}
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#fffaf0] px-2.5 py-1.5 text-[10px] font-black text-[#9b762b]">
          <Sparkles size={11} />
          {product.matchLabel}
        </div>

        {/* REASONS */}
        <div className="mt-3 min-h-[52px] space-y-1">
          {product.reasons
            .slice(0, 2)
            .map((reason) => (
              <div
                key={reason}
                className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600"
              >
                <Check size={11} />
                {reason}
              </div>
            ))}
        </div>

        {/* RATING */}
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-[#fff4d8] px-2 py-1 text-[11px] font-black text-[#956f27]">
            <Star
              size={11}
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
        <div className="mt-3 flex items-end gap-2">
          <span className="text-xl font-black">
            {money(Number(product.price))}
          </span>

          {product.original_price &&
            Number(product.original_price) >
              Number(product.price) && (
              <span className="mb-0.5 text-xs text-gray-400 line-through">
                {money(
                  Number(product.original_price)
                )}
              </span>
            )}
        </div>

        {/* STOCK */}
        <div className="mt-2">
          {product.stock > 0 ? (
            <span className="text-[10px] font-bold text-emerald-600">
              {product.stock <= 5
                ? `Only ${product.stock} left`
                : "In stock"}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-red-500">
              Currently unavailable
            </span>
          )}
        </div>

        {/* ACTIONS */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={
              product.stock <= 0
            }
            onClick={onCart}
            className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-black transition ${
              product.stock <= 0
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
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
                <ShoppingCart size={15} />
                Add to Cart
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
}

/* =========================================================
   SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#eee6d7] bg-white">
      <div className="h-[275px] animate-pulse bg-[#f1eee7]" />

      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-[#eee8dc]" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-[#eee8dc]" />
        <div className="h-5 w-3/5 animate-pulse rounded bg-[#eee8dc]" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-[#eee8dc]" />
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

  const [cart, setCart] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [matching, setMatching] =
    useState(false);

  const [matched, setMatched] =
    useState(false);

  const [error, setError] =
    useState("");

  const [toast, setToast] = useState("");

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

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

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
          .select("id,name,slug")
          .order("name"),

        supabase
          .from("wishlist")
          .select("product_id")
          .eq("user_id", user.id),
      ]);

      if (productResult.error) {
        throw productResult.error;
      }

      if (categoryResult.error) {
        throw categoryResult.error;
      }

      if (wishlistResult.error) {
        throw wishlistResult.error;
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
        (wishlistResult.data || []).map(
          (item) => item.product_id
        )
      );

      loadLocalCart();
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

  /* =======================================================
     CART SYNC
  ======================================================= */

  function loadLocalCart() {
    try {
      const raw =
        localStorage.getItem(
          "primecart-cart"
        );

      if (!raw) {
        setCart([]);
        return;
      }

      const items = JSON.parse(
        raw
      ) as CartItem[];

      setCart(
        items.map((item) => item.id)
      );
    } catch (err) {
      console.error(
        "Cart sync error:",
        err
      );

      setCart([]);
    }
  }

  useEffect(() => {
    loadLocalCart();

    const handleCartUpdate = () => {
      loadLocalCart();
    };

    window.addEventListener(
      "cart-updated",
      handleCartUpdate
    );

    window.addEventListener(
      "storage",
      handleCartUpdate
    );

    return () => {
      window.removeEventListener(
        "cart-updated",
        handleCartUpdate
      );

      window.removeEventListener(
        "storage",
        handleCartUpdate
      );
    };
  }, []);

  /* =======================================================
     TOAST
  ======================================================= */

  function showToast(message: string) {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2400);
  }

  /* =======================================================
     RESULTS
  ======================================================= */

  const results = useMemo(() => {
    let data = products.map(
      (product) =>
        scoreProduct(
          product,
          categories,
          purpose,
          budget,
          category,
          brand,
          search
        )
    );

    /*
      When exact category/brand is selected,
      don't allow unrelated out-of-stock items
      to dominate the results.
    */

    data.sort((a, b) => {
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
        category !== "all" &&
        a.breakdown.category !==
          b.breakdown.category
      ) {
        return (
          b.breakdown.category -
          a.breakdown.category
        );
      }

      if (
        brand !== "Any Brand" &&
        a.breakdown.brand !==
          b.breakdown.brand
      ) {
        return (
          b.breakdown.brand -
          a.breakdown.brand
        );
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
        Number(b.reviews_count) -
        Number(a.reviews_count)
      );
    });

    return data;
  }, [
    products,
    categories,
    purpose,
    budget,
    category,
    brand,
    search,
  ]);

  const searchableResults = useMemo(() => {
    if (!search.trim()) {
      return results;
    }

    const query = normalize(search);

    return results.filter((product) => {
      const categoryObject =
        categories.find(
          (item) =>
            item.id ===
            product.category_id
        );

      const text = searchableProduct(
        product,
        categoryObject
      );

      return query
        .split(/\s+/)
        .filter(Boolean)
        .every((word) =>
          text.includes(word)
        );
    });
  }, [
    results,
    search,
    categories,
  ]);

  const topMatch =
    searchableResults.find(
      (product) => product.stock > 0
    ) || searchableResults[0];

  const activeCategory =
    category === "all"
      ? null
      : categories.find(
          (item) =>
            item.id === category
        );

  const selectedPurpose =
    PURPOSES.find(
      (item) => item.id === purpose
    );

  const selectedBudget =
    BUDGETS.find(
      (item) => item.id === budget
    );

  /*
    Before clicking Find My Prime Match,
    show only a compact preview.
  */

  const displayedProducts =
    matched
      ? searchableResults
      : searchableResults.slice(0, 8);

  /* =======================================================
     RUN MATCH
  ======================================================= */

  async function runMatch() {
    if (loading || matching) return;

    setMatching(true);
    setMatched(false);

    /*
      Small delay gives the matching experience
      a deliberate "analysis" state while the
      actual results are calculated synchronously.
    */

    await new Promise((resolve) =>
      setTimeout(resolve, 700)
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
    }, 120);
  }

  /* =======================================================
     RESET
  ======================================================= */

  function reset() {
    setPurpose("everyday");
    setBudget("1000-5000");
    setCategory("all");
    setBrand("Any Brand");
    setSearch("");
    setMatched(false);

    showToast(
      "PrimeMatch preferences reset"
    );
  }

  /* =======================================================
     WISHLIST
  ======================================================= */

  async function toggleWishlist(
    productId: string
  ) {
    try {
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
            .eq(
              "user_id",
              user.id
            )
            .eq(
              "product_id",
              productId
            );

        if (error) {
          throw error;
        }

        setWishlist((items) =>
          items.filter(
            (id) =>
              id !== productId
          )
        );

        showToast(
          "Removed from wishlist"
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
          throw error;
        }

        setWishlist((items) => [
          ...items,
          productId,
        ]);

        showToast(
          "Added to wishlist ❤️"
        );
      }
    } catch (err) {
      console.error(
        "Wishlist error:",
        err
      );

      showToast(
        "Unable to update wishlist"
      );
    }
  }

  /* =======================================================
     CART
  ======================================================= */

  function addCart(product: Product) {
    try {
      const existing =
        localStorage.getItem(
          "primecart-cart"
        );

      let items: CartItem[] = [];

      if (existing) {
        try {
          items = JSON.parse(
            existing
          ) as CartItem[];
        } catch {
          items = [];
        }
      }

      const found = items.find(
        (item) =>
          item.id === product.id
      );

      if (found) {
        found.quantity += 1;
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

      setCart(
        items.map((item) => item.id)
      );

      window.dispatchEvent(
        new Event("cart-updated")
      );

      showToast(
        `${product.name} added to cart`
      );
    } catch (err) {
      console.error(
        "Cart error:",
        err
      );

      showToast(
        "Unable to add product to cart"
      );
    }
  }

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  function EmptyResults() {
    return (
      <div className="rounded-[28px] border border-[#eadfca] bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff5dc] text-[#b58a32]">
          <Search size={25} />
        </div>

        <h3 className="mt-5 text-xl font-black">
          No close matches found
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
          Try changing your category,
          brand or budget. PrimeMatch
          will then look for the closest
          available alternatives.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#c9a24d] px-5 text-xs font-black text-white transition hover:bg-[#b58d3f]"
        >
          <RotateCcw size={15} />
          Reset Preferences
        </button>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* TOAST */}
      {toast && (
        <div className="fixed right-5 top-5 z-[100] animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[#e5dccb] bg-white px-4 py-3 shadow-[0_15px_45px_rgba(50,40,20,0.15)]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff3d3] text-[#a17b2f]">
              <Check size={15} />
            </div>

            <span className="text-xs font-black text-gray-700">
              {toast}
            </span>

            <button
              type="button"
              onClick={() => setToast("")}
              className="text-gray-400 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#e8deca] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e6decd] bg-white text-gray-600 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] hover:text-[#9b762b]"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a24d] text-white shadow-lg shadow-[#c9a24d]/20">
                <Sparkles size={18} />
              </div>

              <div>
                <h1 className="text-base font-black tracking-tight">
                  PrimeMatch
                </h1>

                <p className="hidden text-[10px] font-semibold text-gray-400 sm:block">
                  Personalized shopping intelligence
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/products"
              className="flex items-center gap-2 rounded-xl border border-[#e5dccb] bg-white px-4 py-2.5 text-xs font-black text-gray-700 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] hover:text-[#9b762b]"
            >
              <ShoppingBag size={15} />

              <span className="hidden sm:block">
                Browse Products
              </span>
            </Link>

            <Link
              href="/dashboard/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5dccb] bg-white text-gray-600 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] hover:text-[#9b762b]"
            >
              <ShoppingCart size={17} />

              {cart.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c9a24d] px-1 text-[9px] font-black text-white">
                  {cart.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[32px] border border-[#eadfca] bg-white shadow-sm">
          <div className="absolute -right-32 -top-40 h-[500px] w-[500px] rounded-full bg-[#f5e7c5] opacity-60 blur-3xl" />

          <div className="absolute -bottom-48 -left-32 h-[500px] w-[500px] rounded-full bg-[#fbf1da] blur-3xl" />

          <div className="relative grid min-h-[430px] items-center gap-12 px-6 py-12 sm:px-10 lg:grid-cols-[1.05fr_.95fr] lg:px-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e9ddc2] bg-[#fffaf0] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#9b762b]">
                <Sparkles size={13} />
                PrimeCart Intelligence
              </div>

              <h2 className="mt-6 max-w-3xl text-[42px] font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-[64px]">
                Shopping,
                <br />
                <span className="text-[#b58a32]">
                  personalized.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
                Tell PrimeMatch what you
                need. We compare your
                purpose, budget, category,
                brand and product quality
                to surface the closest
                PrimeCart matches.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {[
                  "Smart matching",
                  "Real products",
                  "Transparent scoring",
                  "Budget aware",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#eee5d5] bg-[#fffdf9] px-3 py-2 text-[11px] font-bold text-gray-600"
                  >
                    <Check
                      size={13}
                      className="text-[#b58a32]"
                    />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* HERO VISUAL */}
            <div className="relative hidden h-[350px] lg:block">
              <div className="absolute left-1/2 top-1/2 h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#eadfca]" />

              <div className="absolute left-1/2 top-1/2 h-[235px] w-[235px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#d8bb72]" />

              <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[38px] bg-[#c9a24d] text-white shadow-[0_25px_70px_rgba(201,162,77,0.3)]">
                <Sparkles size={28} />

                <span className="mt-2 text-[34px] font-black">
                  AI
                </span>

                <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                  Match Engine
                </span>
              </div>

              <div className="absolute left-0 top-14 rounded-2xl border border-[#eadfca] bg-white p-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <Target
                    size={16}
                    className="text-[#b58a32]"
                  />

                  <span className="text-xs font-black">
                    Your Preferences
                  </span>
                </div>

                <p className="mt-1 text-[10px] text-gray-400">
                  Budget • Category • Brand
                </p>
              </div>

              <div className="absolute bottom-8 right-0 rounded-2xl border border-[#eadfca] bg-white p-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <TrendingUp
                    size={16}
                    className="text-emerald-600"
                  />

                  <span className="text-xs font-black">
                    Smart Ranking
                  </span>
                </div>

                <p className="mt-1 text-[10px] text-gray-400">
                  Best matches first
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH */}
        <section className="mt-6 rounded-[24px] border border-[#eadfca] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setMatched(false);
                }}
                placeholder="Search products, brands or categories..."
                className="h-12 w-full rounded-xl border border-[#e5dccb] bg-[#fffdf9] pl-11 pr-10 text-sm font-medium outline-none transition focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 rounded-xl bg-[#fffaf0] px-5 text-xs font-black text-[#956f27]">
              <ShoppingBag size={15} />
              {searchableResults.length} Products
            </div>
          </div>
        </section>

        {/* BUILDER */}
        <section className="mt-6 overflow-hidden rounded-[28px] border border-[#eadfca] bg-white shadow-sm">
          <div className="border-b border-[#eee6d7] px-5 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5dc] text-[#b58a32]">
                <Target size={20} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                  Match Builder
                </p>

                <h3 className="text-lg font-black">
                  Tell us what you need
                </h3>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {/* PURPOSE */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-black">
                  01. Shopping purpose
                </h4>

                <span className="text-[10px] font-bold text-gray-400">
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
                      onClick={() => {
                        setPurpose(item.id);
                        setMatched(false);
                      }}
                      className={`relative rounded-2xl border p-4 text-left transition-all ${
                        active
                          ? "border-[#c9a24d] bg-[#fffaf0] shadow-[0_8px_25px_rgba(201,162,77,0.12)]"
                          : "border-[#e9e1d2] hover:border-[#d4b46a] hover:bg-[#fffdf9]"
                      }`}
                    >
                      {active && (
                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a24d] text-white">
                          <Check size={11} />
                        </span>
                      )}

                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm ${
                          active
                            ? "bg-[#c9a24d] text-white"
                            : "bg-[#f6f2ea] text-[#9b762b]"
                        }`}
                      >
                        {item.icon}
                      </span>

                      <p className="mt-3 text-sm font-black">
                        {item.title}
                      </p>

                      <p className="mt-1 text-[10px] text-gray-400">
                        {item.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BUDGET */}
            <div className="mt-8">
              <h4 className="mb-3 text-sm font-black">
                02. Your budget
              </h4>

              <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                {BUDGETS.map((item) => {
                  const active =
                    budget === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setBudget(item.id);
                        setMatched(false);
                      }}
                      className={`flex items-center justify-between rounded-xl border px-4 py-4 text-left transition ${
                        active
                          ? "border-[#c9a24d] bg-[#fffaf0] text-[#956f27]"
                          : "border-[#e9e1d2] hover:border-[#d5b76d]"
                      }`}
                    >
                      <span className="text-sm font-black">
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

            {/* CATEGORY + BRAND */}
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black">
                  03. Category
                </label>

                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(
                        e.target.value
                      );
                      setMatched(false);
                    }}
                    className="h-12 w-full appearance-none rounded-xl border border-[#e5dccb] bg-[#fffdf9] px-4 pr-10 text-sm font-semibold outline-none focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
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
                    size={16}
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
                    onChange={(e) => {
                      setBrand(
                        e.target.value
                      );
                      setMatched(false);
                    }}
                    className="h-12 w-full appearance-none rounded-xl border border-[#e5dccb] bg-[#fffdf9] px-4 pr-10 text-sm font-semibold outline-none focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
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
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* SELECTED FILTERS */}
            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#f7f3eb] px-3 py-1.5 text-[10px] font-bold text-gray-600">
                {selectedPurpose?.title}
              </span>

              <span className="rounded-full bg-[#f7f3eb] px-3 py-1.5 text-[10px] font-bold text-gray-600">
                {selectedBudget?.label}
              </span>

              {activeCategory && (
                <span className="rounded-full bg-[#fff4d8] px-3 py-1.5 text-[10px] font-bold text-[#956f27]">
                  {activeCategory.name}
                </span>
              )}

              {brand !== "Any Brand" && (
                <span className="rounded-full bg-[#fff4d8] px-3 py-1.5 text-[10px] font-bold text-[#956f27]">
                  {brand}
                </span>
              )}

              {search && (
                <span className="rounded-full bg-[#fff4d8] px-3 py-1.5 text-[10px] font-bold text-[#956f27]">
                  Search: {search}
                </span>
              )}
            </div>

            {/* ACTION */}
            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#eee6d7] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e5dccb] px-5 text-sm font-black text-gray-600 hover:bg-[#fffaf0]"
              >
                <RefreshCw size={15} />
                Reset
              </button>

              <button
                type="button"
                disabled={
                  loading ||
                  matching
                }
                onClick={runMatch}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-7 text-sm font-black text-white shadow-lg shadow-[#c9a24d]/20 transition hover:bg-[#b58d3f] disabled:opacity-60"
              >
                {matching ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
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

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <CircleAlert
                size={20}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div className="flex-1">
                <p className="text-sm font-bold text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadData}
                  className="mt-3 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <section className="mt-8">
            <div className="mb-5">
              <div className="h-3 w-28 animate-pulse rounded bg-[#e9e2d5]" />
              <div className="mt-2 h-7 w-60 animate-pulse rounded bg-[#e9e2d5]" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <ProductSkeleton
                  key={index}
                />
              ))}
            </div>
          </section>
        )}

        {/* TOP MATCH */}
        {!loading &&
          matched &&
          topMatch && (
            <section
              id="match-results"
              className="mt-8 scroll-mt-24"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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

                  <h3 className="mt-1 text-2xl font-black">
                    We found your strongest match.
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Based on your selected
                    preferences and current
                    PrimeCart products.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMatched(false)
                  }
                  className="inline-flex items-center gap-2 text-xs font-black text-[#9b762b]"
                >
                  Change preferences
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-[#dec68b] bg-[#fffaf0] shadow-sm">
                <div className="grid lg:grid-cols-[.9fr_1.1fr]">
                  {/* IMAGE */}
                  <div className="relative min-h-[430px] bg-white">
                    <ProductImage
                      src={imageUrl(
                        topMatch.image_url
                      )}
                      alt={topMatch.name}
                    />

                    <div className="absolute left-6 top-6 rounded-full bg-[#171717] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white">
                      #1 Prime Match
                    </div>

                    <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-xl border border-[#eadfca] bg-white/95 px-3 py-2 text-[10px] font-black text-[#9b762b] shadow-sm">
                      <Sparkles size={12} />
                      {topMatch.matchScore}% compatible
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="p-6 sm:p-9">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#9b762b]">
                        {topMatch.categoryName}
                      </span>

                      {topMatch.is_flash_sale && (
                        <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-black text-red-600">
                          <Zap size={11} />
                          Flash Deal
                        </span>
                      )}

                      {topMatch.is_featured && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-600">
                          <BadgeCheck size={11} />
                          Featured
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-3xl font-black leading-tight">
                      {topMatch.name}
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
                        ).toFixed(1)}
                      </span>

                      <span className="text-xs text-gray-500">
                        {topMatch.reviews_count ||
                          0}{" "}
                        reviews
                      </span>

                      {topMatch.brand && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-gray-300" />

                          <span className="text-xs font-bold text-gray-500">
                            {topMatch.brand}
                          </span>
                        </>
                      )}
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
                          <>
                            <span className="mb-1 text-sm text-gray-400 line-through">
                              {money(
                                Number(
                                  topMatch.original_price
                                )
                              )}
                            </span>

                            <span className="mb-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-600">
                              {discount(
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

                    {/* SCORE */}
                    <div className="mt-6 rounded-2xl border border-[#eadfca] bg-white p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#a17b2f]">
                            Match Intelligence
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Why this product
                            matches your
                            preferences
                          </p>
                        </div>

                        <div className="relative flex h-[78px] w-[78px] shrink-0 items-center justify-center rounded-full border-[6px] border-[#eadfca]">
                          <div className="absolute inset-[-6px] rounded-full border-[6px] border-[#c9a24d] border-r-transparent border-b-transparent rotate-45" />

                          <span className="text-lg font-black text-[#956f27]">
                            {
                              topMatch.matchScore
                            }
                            %
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        <ScoreBar
                          label="Purpose Fit"
                          value={
                            topMatch
                              .breakdown
                              .purpose
                          }
                        />

                        <ScoreBar
                          label="Budget Fit"
                          value={
                            topMatch
                              .breakdown
                              .budget
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
                          label="Brand Fit"
                          value={
                            topMatch
                              .breakdown
                              .brand
                          }
                        />

                        <ScoreBar
                          label="Product Rating"
                          value={
                            topMatch
                              .breakdown
                              .rating
                          }
                        />
                      </div>
                    </div>

                    {/* WHY */}
                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      {topMatch.reasons
                        .slice(0, 4)
                        .map((reason) => (
                          <div
                            key={reason}
                            className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-emerald-700"
                          >
                            <Check size={14} />
                            {reason}
                          </div>
                        ))}
                    </div>

                    {/* ACTION */}
                    <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                      <button
                        type="button"
                        disabled={
                          topMatch.stock <= 0
                        }
                        onClick={() =>
                          addCart(
                            topMatch
                          )
                        }
                        className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-black transition ${
                          topMatch.stock <= 0
                            ? "cursor-not-allowed bg-gray-200 text-gray-400"
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
                            <Check size={16} />
                            Added to Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart
                              size={16}
                            />
                            Add to Cart
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleWishlist(
                            topMatch.id
                          )
                        }
                        className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-5 text-xs font-black transition ${
                          wishlist.includes(
                            topMatch.id
                          )
                            ? "border-red-200 bg-red-50 text-red-500"
                            : "border-[#e5dccb] bg-white text-gray-600 hover:border-red-200 hover:text-red-500"
                        }`}
                      >
                        <Heart
                          size={16}
                          fill={
                            wishlist.includes(
                              topMatch.id
                            )
                              ? "currentColor"
                              : "none"
                          }
                        />

                        {wishlist.includes(
                          topMatch.id
                        )
                          ? "Saved"
                          : "Wishlist"}
                      </button>

                      <Link
                        href={`/dashboard/products/${topMatch.id}`}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e5dccb] bg-white px-5 text-xs font-black text-gray-700 transition hover:border-[#c9a24d] hover:text-[#9b762b]"
                      >
                        View Product
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

        {/* RESULTS */}
        {!loading && (
          <section
            className={`mt-10 ${
              matched
                ? "scroll-mt-24"
                : ""
            }`}
          >
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal
                    size={15}
                    className="text-[#b58a32]"
                  />

                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                    {matched
                      ? "More Matches"
                      : "Explore Matches"}
                  </p>
                </div>

                <h3 className="mt-1 text-2xl font-black">
                  {matched
                    ? "More products you may like"
                    : "Products matched to your preferences"}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Ranked using PrimeMatch
                  compatibility signals.
                </p>
              </div>

              {!matched &&
                searchableResults.length >
                  8 && (
                  <span className="rounded-full bg-[#fffaf0] px-3 py-2 text-[10px] font-black text-[#956f27]">
                    Showing top 8
                  </span>
                )}
            </div>

            {displayedProducts.length ===
            0 ? (
              <EmptyResults />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedProducts.map(
                  (product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      rank={index + 1}
                      wished={wishlist.includes(
                        product.id
                      )}
                      added={cart.includes(
                        product.id
                      )}
                      onWishlist={() =>
                        toggleWishlist(
                          product.id
                        )
                      }
                      onCart={() =>
                        addCart(product)
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>
        )}

        {/* HOW IT WORKS */}
        {!loading && (
          <section className="mt-12 overflow-hidden rounded-[28px] border border-[#eadfca] bg-white">
            <div className="border-b border-[#eee6d7] px-5 py-6 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5dc] text-[#b58a32]">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                    PrimeMatch
                  </p>

                  <h3 className="text-lg font-black">
                    How your match is calculated
                  </h3>
                </div>
              </div>
            </div>

            <div className="grid gap-0 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Understand",
                  text: "We read your purpose, budget, category, brand and search preferences.",
                },
                {
                  number: "02",
                  title: "Compare",
                  text: "Each active PrimeCart product receives compatibility scores across multiple factors.",
                },
                {
                  number: "03",
                  title: "Rank",
                  text: "Available products with stronger preference matches are surfaced first.",
                },
              ].map((item, index) => (
                <div
                  key={item.number}
                  className={`p-6 sm:p-8 ${
                    index > 0
                      ? "border-t border-[#eee6d7] md:border-l md:border-t-0"
                      : ""
                  }`}
                >
                  <span className="text-xs font-black text-[#c9a24d]">
                    {item.number}
                  </span>

                  <h4 className="mt-3 text-base font-black">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-xs leading-6 text-gray-500">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="h-10" />
      </main>
    </div>
  );
}
