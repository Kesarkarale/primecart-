"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  search: number;
  availability: number;
};

type MatchProduct = Product & {
  categoryName: string;
  matchScore: number;
  reasons: string[];
  breakdown: Breakdown;
  matchLabel: string;
  valueScore: number;
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

type PreferenceWeights = {
  budget: number;
  quality: number;
  brand: number;
  rating: number;
};

type SearchIntent = {
  detectedBudget: string | null;
  detectedPurpose: string | null;
  detectedCategory: string | null;
  detectedBrand: string | null;
  words: string[];
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
    keywords: [
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
      "daily",
      "everyday",
      "essential",
    ],
  },
  {
    id: "work",
    title: "Work & Study",
    subtitle: "Productivity",
    icon: "◫",
    keywords: [
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
      "college",
      "student",
      "coding",
      "computer",
    ],
  },
  {
    id: "entertainment",
    title: "Entertainment",
    subtitle: "Audio & gaming",
    icon: "▶",
    keywords: [
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
      "movie",
      "entertainment",
      "streaming",
    ],
  },
  {
    id: "fitness",
    title: "Fitness",
    subtitle: "Active lifestyle",
    icon: "⌁",
    keywords: [
      "fitness",
      "gym",
      "yoga",
      "running",
      "sports",
      "shoe",
      "dumbbell",
      "workout",
      "bottle",
      "fitness",
      "training",
    ],
  },
  {
    id: "style",
    title: "Style",
    subtitle: "Fashion & looks",
    icon: "◇",
    keywords: [
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
      "style",
      "clothing",
    ],
  },
  {
    id: "home",
    title: "Home",
    subtitle: "Home essentials",
    icon: "⌂",
    keywords: [
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
      "home",
      "living",
    ],
  },
] as const;

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

const DEFAULT_WEIGHTS: PreferenceWeights = {
  budget: 30,
  quality: 25,
  brand: 15,
  rating: 15,
};

const HISTORY_KEY = "primecart-prime-match-history";

/* =========================================================
   HELPERS
========================================================= */

function money(value: number) {
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
  return Math.max(
    min,
    Math.min(max, Math.round(value))
  );
}

function normalize(value: string | null | undefined) {
  return (value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function imageCandidates(value: string | null) {
  if (!value?.trim()) {
    return [];
  }

  const clean = value.trim();

  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://")
  ) {
    return [clean];
  }

  if (clean.startsWith("/")) {
    return [
      `/products/${clean.replace(/^\/+/, "")}`,
      clean,
    ];
  }

  return [
    `/products/${clean}`,
    `/${clean}`,
  ];
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

  if (
    value.includes("fashion") ||
    value.includes("cloth")
  ) {
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

  if (
    value.includes("footwear") ||
    value.includes("foot wear")
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
    ];
  }

  return [value];
}

function productSearchText(
  product: Product,
  categoryName: string
) {
  return normalize(
    [
      product.name,
      product.brand,
      product.short_description,
      product.description,
      categoryName,
      product.slug,
    ].join(" ")
  );
}

/* =========================================================
   NATURAL LANGUAGE SEARCH
========================================================= */

function detectBudgetFromSearch(
  query: string
) {
  const value = normalize(query);

  const numericMatch = value.match(
    /(?:under|below|within|upto|up to|less than|around|budget)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k)?/i
  );

  if (numericMatch) {
    const raw = Number(numericMatch[1]);
    const amount = numericMatch[2]
      ? raw * 1000
      : raw;

    if (amount < 1000) {
      return "under-1000";
    }

    if (amount <= 5000) {
      return "1000-5000";
    }

    if (amount <= 15000) {
      return "5000-15000";
    }

    return "15000-plus";
  }

  if (
    value.includes("under 1k") ||
    value.includes("under ₹1k")
  ) {
    return "under-1000";
  }

  if (
    value.includes("under 5k") ||
    value.includes("under ₹5k")
  ) {
    return "1000-5000";
  }

  if (
    value.includes("under 15k") ||
    value.includes("under ₹15k")
  ) {
    return "5000-15000";
  }

  return null;
}

function detectPurposeFromSearch(
  query: string
) {
  const value = normalize(query);

  let best:
    | {
        id: string;
        score: number;
      }
    | null = null;

  for (const purpose of PURPOSES) {
    const score = purpose.keywords.reduce(
      (total, keyword) =>
        value.includes(keyword)
          ? total + 1
          : total,
      0
    );

    if (
      score > 0 &&
      (!best || score > best.score)
    ) {
      best = {
        id: purpose.id,
        score,
      };
    }
  }

  return best?.id || null;
}

function detectCategoryFromSearch(
  query: string,
  categories: Category[]
) {
  const value = normalize(query);

  for (const category of categories) {
    const keywords =
      keywordsForCategory(category.name);

    if (
      keywords.some((keyword) =>
        value.includes(normalize(keyword))
      )
    ) {
      return category.id;
    }

    if (
      value.includes(normalize(category.name))
    ) {
      return category.id;
    }
  }

  return null;
}

function detectBrandFromSearch(
  query: string,
  brands: string[]
) {
  const value = normalize(query);

  return (
    brands.find((brand) =>
      value.includes(normalize(brand))
    ) || null
  );
}

function parseSearchIntent(
  query: string,
  categories: Category[],
  brands: string[]
): SearchIntent {
  return {
    detectedBudget: detectBudgetFromSearch(
      query
    ),
    detectedPurpose:
      detectPurposeFromSearch(query),
    detectedCategory:
      detectCategoryFromSearch(
        query,
        categories
      ),
    detectedBrand: detectBrandFromSearch(
      query,
      brands
    ),
    words: normalize(query)
      .split(" ")
      .filter(Boolean),
  };
}

/* =========================================================
   SCORING
========================================================= */

function scoreBudget(
  product: Product,
  selectedBudget: Budget | undefined
) {
  if (!selectedBudget) {
    return 70;
  }

  const price = Number(product.price) || 0;

  if (
    price >= selectedBudget.min &&
    price <= selectedBudget.max
  ) {
    return 100;
  }

  if (
    selectedBudget.max !== Infinity &&
    price > selectedBudget.max
  ) {
    const difference =
      price - selectedBudget.max;

    if (difference <= 500) return 90;
    if (difference <= 1500) return 75;
    if (difference <= 3000) return 55;
    if (difference <= 5000) return 35;

    return 15;
  }

  const difference =
    selectedBudget.min - price;

  if (difference <= 500) return 92;
  if (difference <= 1500) return 82;
  if (difference <= 3000) return 68;

  return 50;
}

function scorePurpose(
  product: Product,
  categoryName: string,
  purpose: string
) {
  const selected =
    PURPOSES.find(
      (item) => item.id === purpose
    );

  if (!selected) {
    return 60;
  }

  const text = productSearchText(
    product,
    categoryName
  );

  const hits = selected.keywords.filter(
    (keyword) =>
      text.includes(normalize(keyword))
  ).length;

  if (hits >= 4) return 100;
  if (hits >= 3) return 95;
  if (hits >= 2) return 88;
  if (hits >= 1) return 75;

  return 45;
}

function scoreCategory(
  product: Product,
  categoryId: string,
  categories: Category[]
) {
  if (categoryId === "all") {
    return 80;
  }

  if (product.category_id === categoryId) {
    return 100;
  }

  const selected =
    categories.find(
      (item) => item.id === categoryId
    );

  if (!selected) {
    return 60;
  }

  const categoryKeywords =
    keywordsForCategory(
      selected.name
    );

  const text = productSearchText(
    product,
    selected.name
  );

  if (
    categoryKeywords.some((keyword) =>
      text.includes(normalize(keyword))
    )
  ) {
    return 65;
  }

  return 20;
}

function scoreBrand(
  product: Product,
  brand: string
) {
  if (
    !brand ||
    brand === "Any Brand"
  ) {
    return 80;
  }

  if (
    normalize(product.brand) ===
    normalize(brand)
  ) {
    return 100;
  }

  return 18;
}

function scoreRating(
  product: Product
) {
  const rating =
    Number(product.rating) || 0;

  const reviews =
    Number(product.reviews_count) || 0;

  const base =
    (rating / 5) * 100;

  const reviewConfidence =
    reviews >= 1000
      ? 100
      : reviews >= 500
        ? 96
        : reviews >= 100
          ? 92
          : reviews >= 20
            ? 85
            : 72;

  return clamp(
    base * 0.75 +
      reviewConfidence * 0.25
  );
}

function scoreSearch(
  product: Product,
  categoryName: string,
  query: string
) {
  if (!query.trim()) {
    return 70;
  }

  const text = productSearchText(
    product,
    categoryName
  );

  const words = normalize(query)
    .split(" ")
    .filter(
      (word) =>
        word.length >= 3 &&
        ![
          "for",
          "the",
          "and",
          "with",
          "under",
          "from",
          "need",
          "want",
          "best",
          "give",
          "show",
          "around",
        ].includes(word)
    );

  if (!words.length) {
    return 70;
  }

  const hits = words.filter(
    (word) =>
      text.includes(word)
  ).length;

  return clamp(
    (hits / words.length) * 100
  );
}

function scoreAvailability(
  product: Product
) {
  if (product.stock <= 0) {
    return 5;
  }

  if (product.stock <= 5) {
    return 85;
  }

  return 100;
}

function getMatchLabel(
  score: number
) {
  if (score >= 90) return "Excellent Match";
  if (score >= 80) return "Strong Match";
  if (score >= 70) return "Good Match";
  if (score >= 60) return "Possible Match";

  return "Alternative";
}

function scoreProduct(
  product: Product,
  categories: Category[],
  purpose: string,
  budget: string,
  categoryId: string,
  brand: string,
  search: string,
  weights: PreferenceWeights
): MatchProduct {
  const category =
    categories.find(
      (item) =>
        item.id === product.category_id
    );

  const categoryName =
    category?.name || "PrimeCart";

  const budgetData =
    BUDGETS.find(
      (item) => item.id === budget
    );

  const budgetScore = scoreBudget(
    product,
    budgetData
  );

  const purposeScore = scorePurpose(
    product,
    categoryName,
    purpose
  );

  const categoryScore =
    scoreCategory(
      product,
      categoryId,
      categories
    );

  const brandScore = scoreBrand(
    product,
    brand
  );

  const ratingScore =
    scoreRating(product);

  const searchScore = scoreSearch(
    product,
    categoryName,
    search
  );

  const availabilityScore =
    scoreAvailability(product);

  /*
    Dynamic weights:
    budget      -> user importance
    quality     -> product quality
    brand       -> brand preference
    rating      -> rating/review confidence

    Purpose/category remain strong core signals.
  */

  const totalWeight =
    weights.budget +
    weights.quality +
    weights.brand +
    weights.rating;

  const normalizedBudget =
    weights.budget /
    totalWeight;

  const normalizedQuality =
    weights.quality /
    totalWeight;

  const normalizedBrand =
    weights.brand /
    totalWeight;

  const normalizedRating =
    weights.rating /
    totalWeight;

  let score =
    budgetScore * normalizedBudget * 0.36 +
    (
      purposeScore * 0.55 +
      categoryScore * 0.45
    ) *
      normalizedQuality *
      0.34 +
    brandScore *
      normalizedBrand *
      0.12 +
    ratingScore *
      normalizedRating *
      0.18;

  /*
    Search is a relevance signal.
  */

  if (search.trim()) {
    score =
      score * 0.88 +
      searchScore * 0.12;
  }

  /*
    Availability.
  */

  score =
    score * 0.97 +
    availabilityScore * 0.03;

  /*
    Product boosts.
  */

  if (product.is_featured) {
    score += 1.5;
  }

  if (product.is_flash_sale) {
    score += 1.5;
  }

  /*
    Strong preference penalties.
  */

  if (
    categoryId !== "all" &&
    categoryScore <= 20
  ) {
    score -= 8;
  }

  if (
    brand !== "Any Brand" &&
    brandScore <= 18
  ) {
    score -= 5;
  }

  if (product.stock <= 0) {
    score -= 25;
  }

  const finalScore = clamp(
    score,
    5,
    99
  );

  const reasons: string[] = [];

  if (budgetScore >= 95) {
    reasons.push(
      "Perfect budget fit"
    );
  } else if (budgetScore >= 80) {
    reasons.push(
      "Comfortably near your budget"
    );
  }

  if (categoryScore >= 95) {
    reasons.push(
      "Exact category match"
    );
  } else if (categoryScore >= 60) {
    reasons.push(
      "Related to your category"
    );
  }

  if (purposeScore >= 88) {
    reasons.push(
      "Strongly fits your purpose"
    );
  } else if (purposeScore >= 70) {
    reasons.push(
      "Fits your shopping purpose"
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

  if (searchScore >= 80) {
    reasons.push(
      "Matches your search"
    );
  }

  if (product.is_flash_sale) {
    reasons.push(
      "Special deal available"
    );
  }

  if (product.stock > 0) {
    reasons.push(
      product.stock <= 5
        ? `Only ${product.stock} left`
        : "Currently in stock"
    );
  }

  if (!reasons.length) {
    reasons.push(
      "Good overall match"
    );
  }

  /*
    Value score:
    rating + discount + price fit.
  */

  const discountPercent =
    discount(
      Number(product.price),
      product.original_price
        ? Number(product.original_price)
        : null
    );

  const valueScore = clamp(
    ratingScore * 0.45 +
      budgetScore * 0.35 +
      discountPercent * 0.2
  );

  return {
    ...product,
    categoryName,
    matchScore: finalScore,
    reasons: Array.from(
      new Set(reasons)
    ).slice(0, 4),
    matchLabel:
      getMatchLabel(finalScore),
    valueScore,
    breakdown: {
      budget: budgetScore,
      category: categoryScore,
      purpose: purposeScore,
      rating: ratingScore,
      brand: brandScore,
      search: searchScore,
      availability:
        availabilityScore,
    },
  };
}

/* =========================================================
   IMAGE COMPONENT
========================================================= */

function ProductImage({
  src,
  alt,
  className = "",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const candidates =
    useMemo(
      () => imageCandidates(src),
      [src]
    );

  const [index, setIndex] =
    useState(0);

  const [failed, setFailed] =
    useState(false);

  useEffect(() => {
    setIndex(0);
    setFailed(false);
  }, [src]);

  if (
    failed ||
    !candidates[index]
  ) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[#fffaf0] to-[#f4eee1] ${className}`}
      >
        <div className="flex flex-col items-center gap-2 text-[#c4aa70]">
          <ShoppingBag size={42} />
          <span className="text-[9px] font-black uppercase tracking-[0.18em]">
            PrimeCart
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={candidates[index]}
      alt={alt}
      fill
      unoptimized={
        candidates[index].startsWith(
          "http"
        )
      }
      onError={() => {
        if (
          index <
          candidates.length - 1
        ) {
          setIndex((current) =>
            current + 1
          );
        } else {
          setFailed(true);
        }
      }}
      className={`object-contain p-6 transition duration-500 ${className}`}
      sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
    />
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

        <span className="text-[10px] font-black text-[#9b762b]">
          {value}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[#eee8dc]">
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
   CUSTOM SEARCHABLE DROPDOWN
========================================================= */

function SearchableDropdown({
  label,
  value,
  options,
  placeholder,
  onChange,
  counts,
  icon,
}: {
  label: string;
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  placeholder: string;
  onChange: (value: string) => void;
  counts?: Record<string, number>;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const filtered = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    if (!query) {
      return options;
    }

    return options.filter(
      (item) =>
        item.label
          .toLowerCase()
          .includes(query)
    );
  }, [options, search]);

  const selected =
    options.find(
      (item) =>
        item.value === value
    ) || options[0];

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-black">
        {label}
      </label>

      <button
        type="button"
        onClick={() =>
          setOpen((current) =>
            !current
          )
        }
        className="flex h-12 w-full items-center justify-between rounded-xl border border-[#e5dccb] bg-[#fffdf9] px-4 text-left outline-none transition hover:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
      >
        <span className="flex items-center gap-2 truncate">
          {icon}
          <span className="truncate text-sm font-semibold">
            {selected?.label ||
              placeholder}
          </span>
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close dropdown"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() =>
              setOpen(false)
            }
          />

          <div className="absolute left-0 right-0 top-[78px] z-50 overflow-hidden rounded-2xl border border-[#e7dcc7] bg-white p-2 shadow-[0_25px_70px_rgba(60,45,20,0.16)]">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                autoFocus
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder={`Search ${label.toLowerCase()}...`}
                className="h-10 w-full rounded-xl border border-[#eee5d5] bg-[#fffdf9] pl-9 pr-3 text-xs font-medium outline-none focus:border-[#c9a24d]"
              />
            </div>

            <div className="mt-2 max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <Search
                    size={20}
                    className="mx-auto text-gray-300"
                  />
                  <p className="mt-2 text-xs font-bold text-gray-400">
                    No results found
                  </p>
                </div>
              ) : (
                filtered.map(
                  (item) => {
                    const active =
                      item.value ===
                      value;

                    const count =
                      counts?.[
                        item.value
                      ];

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          onChange(
                            item.value
                          );
                          setOpen(
                            false
                          );
                          setSearch(
                            ""
                          );
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                          active
                            ? "bg-[#fff6df] text-[#956f27]"
                            : "hover:bg-[#faf7f0]"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {active ? (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c9a24d] text-white">
                              <Check
                                size={11}
                              />
                            </span>
                          ) : (
                            <span className="h-5 w-5 shrink-0 rounded-full border border-[#e6ddce]" />
                          )}

                          <span className="truncate text-xs font-bold">
                            {item.label}
                          </span>
                        </span>

                        {typeof count ===
                          "number" && (
                          <span className="ml-2 shrink-0 rounded-full bg-[#f6f2ea] px-2 py-1 text-[9px] font-black text-gray-500">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  }
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
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
  compared,
  onWishlist,
  onCart,
  onCompare,
}: {
  product: MatchProduct;
  rank: number;
  wished: boolean;
  added: boolean;
  compared: boolean;
  onWishlist: () => void;
  onCart: () => void;
  onCompare: () => void;
}) {
  const off = discount(
    Number(product.price),
    product.original_price
      ? Number(product.original_price)
      : null
  );

  return (
    <article className="group overflow-hidden rounded-[24px] border border-[#e8dfcf] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#d9bf7b] hover:shadow-[0_20px_50px_rgba(80,60,20,0.10)]">
      <div className="relative h-[275px] overflow-hidden bg-[#faf9f6]">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-[#171717] px-3 py-1.5 text-[10px] font-black text-white shadow">
          #{rank}
        </div>

        <div className="absolute left-4 top-14 flex items-center gap-1.5 rounded-full border border-[#eadfca] bg-white/95 px-3 py-1.5 text-[10px] font-black text-[#9b762b] shadow-sm">
          <Sparkles size={11} />
          {product.matchScore}% Match
        </div>

        <button
          type="button"
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
              wished
                ? "currentColor"
                : "none"
            }
          />
        </button>

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

        <div className="mt-4 min-h-[58px] space-y-1">
          {product.reasons
            .slice(0, 3)
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

        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-[#fff4d8] px-2 py-1 text-[11px] font-black text-[#956f27]">
            <Star
              size={11}
              fill="currentColor"
            />
            {Number(
              product.rating || 0
            ).toFixed(1)}
          </span>

          <span className="text-[11px] text-gray-400">
            {product.reviews_count ||
              0}{" "}
            reviews
          </span>
        </div>

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

        <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2">
          <button
            type="button"
            disabled={
              product.stock <= 0
            }
            onClick={onCart}
            className={`flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-black transition ${
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
                <ShoppingCart
                  size={15}
                />
                Add to Cart
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCompare}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
              compared
                ? "border-[#c9a24d] bg-[#fff6df] text-[#9b762b]"
                : "border-[#e5dccb] text-gray-500 hover:border-[#c9a24d] hover:text-[#9b762b]"
            }`}
            title="Compare"
          >
            <Compare size={16} />
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
    <div className="overflow-hidden rounded-[24px] border border-[#eadfca] bg-white">
      <div className="h-[275px] animate-pulse bg-[#eeeae2]" />

      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-[#eeeae2]" />
        <div className="h-5 w-full animate-pulse rounded bg-[#eeeae2]" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-[#eeeae2]" />
        <div className="h-4 w-full animate-pulse rounded bg-[#eeeae2]" />
        <div className="h-8 w-1/3 animate-pulse rounded bg-[#eeeae2]" />
        <div className="h-11 animate-pulse rounded-xl bg-[#eeeae2]" />
      </div>
    </div>
  );
}

/* =========================================================
   TOP MATCH
========================================================= */

function TopMatch({
  product,
  wished,
  added,
  onWishlist,
  onCart,
}: {
  product: MatchProduct;
  wished: boolean;
  added: boolean;
  onWishlist: () => void;
  onCart: () => void;
}) {
  const off = discount(
    Number(product.price),
    product.original_price
      ? Number(product.original_price)
      : null
  );

  return (
    <section
      id="match-results"
      className="scroll-mt-24"
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

          <h3 className="mt-1 text-2xl font-black">
            We found a strong match.
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Here is the product that best
            matches your current preferences.
          </p>
        </div>

        <span className="w-fit rounded-full bg-[#fff4d8] px-3 py-2 text-[10px] font-black text-[#956f27]">
          {product.matchLabel}
        </span>
      </div>

      <div className="overflow-hidden rounded-[30px] border border-[#dfc98f] bg-white shadow-[0_20px_70px_rgba(80,60,20,0.08)]">
        <div className="grid lg:grid-cols-[.95fr_1.05fr]">
          <div className="relative min-h-[390px] overflow-hidden bg-[#faf8f2]">
            <ProductImage
              src={product.image_url}
              alt={product.name}
            />

            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-[#171717] px-4 py-2 text-xs font-black text-white">
              <Sparkles size={13} />
              #1 Prime Match
            </div>

            {off > 0 && (
              <div className="absolute bottom-5 left-5 rounded-full bg-[#c9a24d] px-4 py-2 text-xs font-black text-white">
                Save {off}%
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#fff5dc] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#9b762b]">
                {product.categoryName}
              </span>

              {product.brand && (
                <span className="rounded-full bg-[#f6f3ec] px-3 py-1.5 text-[10px] font-black text-gray-600">
                  {product.brand}
                </span>
              )}
            </div>

            <Link
              href={`/dashboard/products/${product.id}`}
            >
              <h2 className="mt-4 text-2xl font-black leading-tight transition hover:text-[#a17b2f] sm:text-3xl">
                {product.name}
              </h2>
            </Link>

            <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">
              {product.short_description ||
                product.description ||
                "A carefully selected PrimeCart product matched to your shopping preferences."}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">
                  Match score
                </p>

                <p className="mt-1 text-5xl font-black text-[#b58a32]">
                  {product.matchScore}%
                </p>
              </div>

              <div className="h-14 w-px bg-[#eee5d5]" />

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">
                  Rating
                </p>

                <p className="mt-1 flex items-center gap-1 text-xl font-black">
                  <Star
                    size={17}
                    fill="#c9a24d"
                    className="text-[#c9a24d]"
                  />
                  {Number(
                    product.rating || 0
                  ).toFixed(1)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#eee5d5] bg-[#fffdf9] p-4">
              <div className="flex items-center gap-2">
                <CircleHelp
                  size={16}
                  className="text-[#b58a32]"
                />

                <h4 className="text-xs font-black">
                  Why this matches you
                </h4>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {product.reasons.map(
                  (reason) => (
                    <div
                      key={reason}
                      className="flex items-center gap-2 text-[11px] font-bold text-emerald-700"
                    >
                      <Check size={13} />
                      {reason}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <ScoreBar
                label="Budget Fit"
                value={
                  product.breakdown.budget
                }
              />

              <ScoreBar
                label="Purpose"
                value={
                  product.breakdown.purpose
                }
              />

              <ScoreBar
                label="Category"
                value={
                  product.breakdown.category
                }
              />

              <ScoreBar
                label="Rating Quality"
                value={
                  product.breakdown.rating
                }
              />

              <ScoreBar
                label="Brand"
                value={
                  product.breakdown.brand
                }
              />

              <ScoreBar
                label="Search Relevance"
                value={
                  product.breakdown.search
                }
              />
            </div>

            <div className="mt-7 flex items-end gap-3">
              <span className="text-3xl font-black">
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
                  <span className="mb-1 text-sm text-gray-400 line-through">
                    {money(
                      Number(
                        product.original_price
                      )
                    )}
                  </span>
                )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={
                  product.stock <= 0
                }
                onClick={onCart}
                className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-black transition ${
                  product.stock <= 0
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : added
                      ? "bg-emerald-600 text-white"
                      : "bg-[#c9a24d] text-white hover:bg-[#b58d3f]"
                }`}
              >
                {added ? (
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

              <button
                type="button"
                onClick={onWishlist}
                className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-black ${
                  wished
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-[#dfcfa9] bg-white text-gray-700 hover:border-[#c9a24d]"
                }`}
              >
                <Heart
                  size={17}
                  fill={
                    wished
                      ? "currentColor"
                      : "none"
                  }
                />
                {wished
                  ? "Saved"
                  : "Wishlist"}
              </button>

              <Link
                href={`/dashboard/products/${product.id}`}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#dfcfa9] bg-white px-5 text-sm font-black text-gray-700 hover:border-[#c9a24d] hover:text-[#9b762b]"
              >
                View
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   COMPARISON
========================================================= */

function ComparisonTable({
  products,
  onRemove,
}: {
  products: MatchProduct[];
  onRemove: (
    id: string
  ) => void;
}) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="mt-10 rounded-[28px] border border-[#eadfca] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Compare
              size={17}
              className="text-[#b58a32]"
            />

            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
              Product Comparison
            </span>
          </div>

          <h3 className="mt-1 text-2xl font-black">
            Compare your shortlisted products
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Select up to 3 products from the
            recommendations.
          </p>
        </div>

        <span className="w-fit rounded-full bg-[#fff5dc] px-3 py-2 text-[10px] font-black text-[#956f27]">
          {products.length}/3 selected
        </span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 overflow-hidden rounded-2xl border border-[#eee5d5]">
          <thead>
            <tr>
              <th className="w-40 border-b border-r border-[#eee5d5] bg-[#fffaf0] p-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">
                Compare
              </th>

              {products.map(
                (product) => (
                  <th
                    key={product.id}
                    className="border-b border-[#eee5d5] p-4 text-left align-top"
                  >
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          onRemove(
                            product.id
                          )
                        }
                        className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-lg bg-[#f7f3eb] text-gray-400 hover:text-red-500"
                      >
                        <X size={13} />
                      </button>

                      <div className="relative h-28 w-full">
                        <ProductImage
                          src={
                            product.image_url
                          }
                          alt={
                            product.name
                          }
                        />
                      </div>

                      <p className="mt-2 line-clamp-2 pr-6 text-xs font-black">
                        {product.name}
                      </p>
                    </div>
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {[
              {
                label: "PrimeMatch",
                get: (p: MatchProduct) =>
                  `${p.matchScore}%`,
              },
              {
                label: "Price",
                get: (p: MatchProduct) =>
                  money(
                    Number(p.price)
                  ),
              },
              {
                label: "Rating",
                get: (p: MatchProduct) =>
                  `${Number(
                    p.rating || 0
                  ).toFixed(1)} ★`,
              },
              {
                label: "Reviews",
                get: (p: MatchProduct) =>
                  String(
                    p.reviews_count ||
                      0
                  ),
              },
              {
                label: "Brand",
                get: (p: MatchProduct) =>
                  p.brand ||
                  "Unbranded",
              },
              {
                label: "Deal",
                get: (p: MatchProduct) => {
                  const off =
                    discount(
                      Number(
                        p.price
                      ),
                      p.original_price
                        ? Number(
                            p.original_price
                          )
                        : null
                    );

                  return off > 0
                    ? `${off}% OFF`
                    : "—";
                },
              },
              {
                label: "Stock",
                get: (p: MatchProduct) =>
                  p.stock > 0
                    ? "Available"
                    : "Out of stock",
              },
              {
                label: "Value",
                get: (p: MatchProduct) =>
                  `${p.valueScore}%`,
              },
            ].map((row) => (
              <tr key={row.label}>
                <td className="border-r border-t border-[#eee5d5] bg-[#fffdf9] p-4 text-xs font-black text-gray-500">
                  {row.label}
                </td>

                {products.map(
                  (product) => (
                    <td
                      key={product.id}
                      className="border-t border-[#eee5d5] p-4 text-xs font-black"
                    >
                      {row.get(product)}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* =========================================================
   CATEGORY / BRAND COUNT HELPERS
========================================================= */

function buildCategoryCounts(
  products: Product[]
) {
  const counts: Record<
    string,
    number
  > = {
    all: products.length,
  };

  for (const product of products) {
    if (!product.category_id) {
      continue;
    }

    counts[product.category_id] =
      (counts[product.category_id] ||
        0) + 1;
  }

  return counts;
}

function buildBrandCounts(
  products: Product[]
) {
  const counts: Record<
    string,
    number
  > = {
    "Any Brand": products.length,
  };

  for (const product of products) {
    const brand =
      product.brand?.trim();

    if (!brand) {
      continue;
    }

    counts[brand] =
      (counts[brand] || 0) + 1;
  }

  return counts;
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function PrimeMatchPage() {
  const supabase = useMemo(
    () => createClient(),
    []
  );

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

  const [productError, setProductError] =
    useState("");

  const [wishlistError, setWishlistError] =
    useState("");

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

  const [weights, setWeights] =
    useState<PreferenceWeights>(
      DEFAULT_WEIGHTS
    );

  const [compareIds, setCompareIds] =
    useState<string[]>([]);

  const [showWeights, setShowWeights] =
    useState(false);

  const [showHistory, setShowHistory] =
    useState(false);

  const [history, setHistory] =
    useState<
      {
        query: string;
        purpose: string;
        budget: string;
        category: string;
        brand: string;
        timestamp: number;
      }[]
    >([]);

  const [toast, setToast] =
    useState("");

  /* =======================================================
     TOAST
  ======================================================= */

  const showToast = useCallback(
    (message: string) => {
      setToast(message);

      window.setTimeout(() => {
        setToast("");
      }, 2500);
    },
    []
  );

  /* =======================================================
     LOAD CART
  ======================================================= */

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          "primecart-cart"
        );

      if (!stored) {
        return;
      }

      const items = JSON.parse(
        stored
      ) as CartItem[];

      setCart(
        items.map(
          (item) => item.id
        )
      );
    } catch {
      setCart([]);
    }
  }, []);

  /* =======================================================
     CART SYNC
  ======================================================= */

  useEffect(() => {
    function syncCart() {
      try {
        const stored =
          localStorage.getItem(
            "primecart-cart"
          );

        if (!stored) {
          setCart([]);
          return;
        }

        const items = JSON.parse(
          stored
        ) as CartItem[];

        setCart(
          items.map(
            (item) => item.id
          )
        );
      } catch {
        setCart([]);
      }
    }

    window.addEventListener(
      "storage",
      syncCart
    );

    window.addEventListener(
      "cart-updated",
      syncCart
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncCart
      );

      window.removeEventListener(
        "cart-updated",
        syncCart
      );
    };
  }, []);

  /* =======================================================
     LOAD HISTORY
  ======================================================= */

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          HISTORY_KEY
        );

      if (stored) {
        setHistory(
          JSON.parse(stored)
        );
      }
    } catch {
      setHistory([]);
    }
  }, []);

  /* =======================================================
     SAVE HISTORY
  ======================================================= */

  function saveHistory() {
    const entry = {
      query: search,
      purpose,
      budget,
      category,
      brand,
      timestamp: Date.now(),
    };

    const next = [
      entry,
      ...history,
    ].slice(0, 5);

    setHistory(next);

    try {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(next)
      );
    } catch {
      // Ignore localStorage errors.
    }
  }

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData = useCallback(
    async () => {
      try {
        setLoading(true);
        setProductError("");
        setWishlistError("");

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) {
          window.location.href =
            "/auth/login";
          return;
        }

        /*
          Products + categories are required.
          Wishlist is optional.
        */

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
            .eq(
              "is_active",
              true
            ),

          supabase
            .from("categories")
            .select(
              "id,name,slug"
            )
            .order("name"),

          supabase
            .from("wishlist")
            .select(
              "product_id"
            )
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

        const productData =
          (productResult.data ||
            []) as Product[];

        const categoryData =
          (categoryResult.data ||
            []) as Category[];

        setProducts(
          productData
        );

        setCategories(
          categoryData
        );

        const uniqueBrands =
          Array.from(
            new Set(
              productData
                .map(
                  (item) =>
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

        setBrands(
          uniqueBrands
        );

        /*
          Wishlist is optional.
          This is important because the previous
          version showed the whole page as failed
          when wishlist query failed.
        */

        if (
          wishlistResult.error
        ) {
          console.error(
            "Wishlist load error:",
            wishlistResult.error
          );

          setWishlistError(
            "Wishlist could not be loaded. Product matching is still available."
          );

          setWishlist([]);
        } else {
          setWishlist(
            (
              wishlistResult.data ||
              []
            ).map(
              (item) =>
                item.product_id
            )
          );
        }
      } catch (error) {
        console.error(
          "PrimeMatch load error:",
          error
        );

        setProductError(
          "We couldn't load PrimeMatch products. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =======================================================
     SEARCH INTENT
  ======================================================= */

  const searchIntent =
    useMemo(
      () =>
        parseSearchIntent(
          search,
          categories,
          brands
        ),
      [
        search,
        categories,
        brands,
      ]
    );

  /* =======================================================
     SEARCH SUGGESTION ACTION
  ======================================================= */

  function applySearchIntent() {
    if (
      searchIntent.detectedBudget
    ) {
      setBudget(
        searchIntent.detectedBudget
      );
    }

    if (
      searchIntent.detectedPurpose
    ) {
      setPurpose(
        searchIntent.detectedPurpose
      );
    }

    if (
      searchIntent.detectedCategory
    ) {
      setCategory(
        searchIntent.detectedCategory
      );
    }

    if (
      searchIntent.detectedBrand
    ) {
      setBrand(
        searchIntent.detectedBrand
      );
    }

    showToast(
      "Smart search preferences detected."
    );
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
          search,
          weights
        )
    );

    /*
      When an exact category or brand is selected,
      don't completely destroy results.
      Exact matches are ranked first.
      This gives us smart fallback behaviour.
    */

    data.sort(
      (a, b) => {
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
          a.category_id === category &&
          b.category_id !== category
        ) {
          return -1;
        }

        if (
          category !== "all" &&
          a.category_id !== category &&
          b.category_id === category
        ) {
          return 1;
        }

        if (
          brand !== "Any Brand" &&
          normalize(a.brand) ===
            normalize(brand) &&
          normalize(b.brand) !==
            normalize(brand)
        ) {
          return -1;
        }

        if (
          brand !== "Any Brand" &&
          normalize(a.brand) !==
            normalize(brand) &&
          normalize(b.brand) ===
            normalize(brand)
        ) {
          return 1;
        }

        return (
          b.matchScore -
            a.matchScore ||
          b.valueScore -
            a.valueScore ||
          Number(b.rating) -
            Number(a.rating) ||
          Number(
            b.reviews_count
          ) -
            Number(
              a.reviews_count
            )
        );
      }
    );

    return data;
  }, [
    products,
    categories,
    purpose,
    budget,
    category,
    brand,
    search,
    weights,
  ]);

  const topMatch =
    results.find(
      (product) =>
        product.stock > 0
    ) || results[0];

  /* =======================================================
     SPECIAL SECTIONS
  ======================================================= */

  const bestValue = useMemo(() => {
    return [...results]
      .filter(
        (item) =>
          item.stock > 0
      )
      .sort(
        (a, b) =>
          b.valueScore -
          a.valueScore
      )[0];
  }, [results]);

  const budgetPick = useMemo(() => {
    return [...results]
      .filter(
        (item) =>
          item.stock > 0
      )
      .sort(
        (a, b) => {
          const aBudget =
            a.breakdown.budget;
          const bBudget =
            b.breakdown.budget;

          return (
            bBudget -
            aBudget
          );
        }
      )[0];
  }, [results]);

  const highlyRated = useMemo(() => {
    return [...results]
      .filter(
        (item) =>
          item.stock > 0
      )
      .sort(
        (a, b) =>
          Number(b.rating) -
            Number(a.rating) ||
          Number(
            b.reviews_count
          ) -
            Number(
              a.reviews_count
            )
      )[0];
  }, [results]);

  const bestDeal = useMemo(() => {
    return [...results]
      .filter(
        (item) =>
          item.stock > 0
      )
      .sort(
        (a, b) => {
          const aDeal =
            discount(
              Number(a.price),
              a.original_price
                ? Number(
                    a.original_price
                  )
                : null
            );

          const bDeal =
            discount(
              Number(b.price),
              b.original_price
                ? Number(
                    b.original_price
                  )
                : null
            );

          return (
            bDeal - aDeal
          );
        }
      )[0];
  }, [results]);

  const premiumAlternative =
    useMemo(() => {
      const basePrice =
        topMatch
          ? Number(
              topMatch.price
            )
          : 0;

      return [...results]
        .filter(
          (item) =>
            item.stock > 0 &&
            Number(item.price) >
              basePrice
        )
        .sort(
          (a, b) =>
            b.matchScore -
            a.matchScore
        )[0];
    }, [results, topMatch]);

  /* =======================================================
     CATEGORY COUNTS
  ======================================================= */

  const categoryCounts =
    useMemo(
      () =>
        buildCategoryCounts(
          products
        ),
      [products]
    );

  const brandCounts =
    useMemo(
      () =>
        buildBrandCounts(
          products
        ),
      [products]
    );

  const categoryOptions =
    useMemo(
      () => [
        {
          value: "all",
          label: "All Categories",
        },
        ...categories.map(
          (item) => ({
            value: item.id,
            label: item.name,
          })
        ),
      ],
      [categories]
    );

  const brandOptions =
    useMemo(
      () => [
        {
          value: "Any Brand",
          label: "Any Brand",
        },
        ...brands.map(
          (item) => ({
            value: item,
            label: item,
          })
        ),
      ],
      [brands]
    );

  /* =======================================================
     LIVE MATCH POTENTIAL
  ======================================================= */

  const matchPotential =
    useMemo(() => {
      const values = [
        topMatch?.breakdown.purpose ||
          0,
        topMatch?.breakdown.budget ||
          0,
        topMatch?.breakdown.category ||
          0,
        topMatch?.breakdown.brand ||
          0,
        topMatch?.breakdown.rating ||
          0,
      ];

      if (!values.length) {
        return 0;
      }

      return clamp(
        values.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / values.length
      );
    }, [topMatch]);

  /* =======================================================
     COMPARE PRODUCTS
  ======================================================= */

  const compareProducts =
    useMemo(
      () =>
        compareIds
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
          ),
      [compareIds, results]
    );

  function toggleCompare(
    productId: string
  ) {
    setCompareIds(
      (current) => {
        if (
          current.includes(
            productId
          )
        ) {
          return current.filter(
            (id) =>
              id !== productId
          );
        }

        if (current.length >= 3) {
          showToast(
            "You can compare up to 3 products."
          );

          return current;
        }

        return [
          ...current,
          productId,
        ];
      }
    );
  }

  /* =======================================================
     RUN MATCH
  ======================================================= */

  async function runMatch() {
    if (!products.length) {
      showToast(
        "No products are available to match."
      );
      return;
    }

    setMatching(true);
    setMatched(false);

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          850
        )
    );

    saveHistory();

    setMatched(true);
    setMatching(false);

    setTimeout(() => {
      document
        .getElementById(
          "match-results"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 150);
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
    setWeights(
      DEFAULT_WEIGHTS
    );
    setMatched(false);
    setCompareIds([]);
    showToast(
      "Preferences reset."
    );
  }

  /* =======================================================
     APPLY HISTORY
  ======================================================= */

  function applyHistoryItem(
    item: {
      query: string;
      purpose: string;
      budget: string;
      category: string;
      brand: string;
    }
  ) {
    setSearch(item.query);
    setPurpose(item.purpose);
    setBudget(item.budget);
    setCategory(item.category);
    setBrand(item.brand);
    setMatched(false);
    setShowHistory(false);

    showToast(
      "Previous preferences restored."
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
      } =
        await supabase.auth.getUser();

      if (!user) {
        window.location.href =
          "/auth/login";
        return;
      }

      setWishlistError("");

      const exists =
        wishlist.includes(
          productId
        );

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

        setWishlist(
          (items) =>
            items.filter(
              (id) =>
                id !== productId
            )
        );

        showToast(
          "Removed from wishlist."
        );
      } else {
        const { error } =
          await supabase
            .from("wishlist")
            .insert({
              user_id: user.id,
              product_id:
                productId,
            });

        if (error) {
          throw error;
        }

        setWishlist(
          (items) => [
            ...items,
            productId,
          ]
        );

        showToast(
          "Added to wishlist."
        );
      }
    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );

      setWishlistError(
        "Wishlist update failed. Please try again."
      );
    }
  }

  /* =======================================================
     CART
  ======================================================= */

  function addCart(
    product: Product
  ) {
    try {
      const existing =
        localStorage.getItem(
          "primecart-cart"
        );

      let items: CartItem[] =
        [];

      if (existing) {
        try {
          items =
            JSON.parse(
              existing
            );
        } catch {
          items = [];
        }
      }

      const found =
        items.find(
          (item) =>
            item.id ===
            product.id
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
        JSON.stringify(
          items
        )
      );

      setCart(
        (current) =>
          current.includes(
            product.id
          )
            ? current
            : [
                ...current,
                product.id,
              ]
      );

      window.dispatchEvent(
        new Event(
          "cart-updated"
        )
      );

      showToast(
        `${product.name} added to cart.`
      );
    } catch (error) {
      console.error(
        "Cart error:",
        error
      );

      showToast(
        "Could not add product to cart."
      );
    }
  }

  /* =======================================================
     BUY NOW
  ======================================================= */

  function buyNow(
    product: Product
  ) {
    addCart(product);

    setTimeout(() => {
      window.location.href =
        "/dashboard/cart";
    }, 250);
  }

  /* =======================================================
     WEIGHT SLIDER
  ======================================================= */

  function updateWeight(
    key: keyof PreferenceWeights,
    value: number
  ) {
    setWeights(
      (current) => ({
        ...current,
        [key]: value,
      })
    );
  }

  /* =======================================================
     DISPLAY PRODUCTS
  ======================================================= */

  const displayedProducts =
    matched
      ? results
      : results.slice(0, 8);

  const moreMatches =
    matched
      ? results.filter(
          (product) =>
            product.id !==
            topMatch?.id
        )
      : results.slice(0, 8);

  const activeCategory =
    category === "all"
      ? null
      : categories.find(
          (item) =>
            item.id === category
        );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* ===================================================
          TOAST
      =================================================== */}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-2xl border border-[#e2cf9c] bg-[#171717] px-5 py-3 text-xs font-black text-white shadow-2xl">
          <div className="flex items-center gap-2">
            <Check
              size={14}
              className="text-[#d8b75e]"
            />
            {toast}
          </div>
        </div>
      )}

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#e8deca] bg-white/95 backdrop-blur-xl">
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
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5dccb] bg-white text-gray-600 hover:border-[#c9a24d] hover:text-[#9b762b]"
            >
              <ShoppingCart
                size={17}
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-10">
        {/* =================================================
            HERO
        ================================================= */}

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
                Tell PrimeMatch what you need.
                We analyze your budget, purpose,
                category, brand, quality and
                product relevance to create a
                personalized ranking.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {[
                  "Smart matching",
                  "Real products",
                  "Transparent scores",
                  "Best value",
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
                  Budget • Purpose • Category
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

        {/* =================================================
            SMART SEARCH
        ================================================= */}

        <section className="mt-6 rounded-[24px] border border-[#eadfca] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Search
                    size={16}
                    className="text-[#b58a32]"
                  />

                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                    Smart Search
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-400">
                  Try natural language — e.g.
                  wireless headphones for gaming
                  under ₹5000
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowHistory(
                    (current) =>
                      !current
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-[#e8dfcf] px-3 py-2 text-[10px] font-black text-gray-600 hover:border-[#c9a24d] hover:text-[#9b762b]"
              >
                <Clock3 size={13} />
                History
              </button>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
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
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      applySearchIntent();
                    }
                  }}
                  placeholder="Example: wireless headphones for gaming under ₹5000"
                  className="h-13 w-full rounded-xl border border-[#e5dccb] bg-[#fffdf9] pl-11 pr-11 text-sm font-medium outline-none transition focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
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

              <button
                type="button"
                onClick={
                  applySearchIntent
                }
                disabled={!search.trim()}
                className="h-13 rounded-xl bg-[#171717] px-6 text-xs font-black text-white transition hover:bg-[#2a2a2a] disabled:opacity-40"
              >
                Understand My Need
              </button>

              <div className="flex items-center justify-center gap-2 rounded-xl bg-[#fffaf0] px-5 py-3 text-xs font-black text-[#956f27]">
                <ShoppingBag size={15} />
                {products.length} Products
              </div>
            </div>

            {search.trim() && (
              <div className="flex flex-wrap gap-2">
                {searchIntent.detectedPurpose && (
                  <span className="rounded-full bg-[#fff5dc] px-3 py-1.5 text-[10px] font-black text-[#956f27]">
                    Purpose detected
                  </span>
                )}

                {searchIntent.detectedBudget && (
                  <span className="rounded-full bg-[#fff5dc] px-3 py-1.5 text-[10px] font-black text-[#956f27]">
                    Budget detected
                  </span>
                )}

                {searchIntent.detectedCategory && (
                  <span className="rounded-full bg-[#fff5dc] px-3 py-1.5 text-[10px] font-black text-[#956f27]">
                    Category detected
                  </span>
                )}

                {searchIntent.detectedBrand && (
                  <span className="rounded-full bg-[#fff5dc] px-3 py-1.5 text-[10px] font-black text-[#956f27]">
                    Brand detected
                  </span>
                )}
              </div>
            )}
          </div>

          {showHistory &&
            history.length > 0 && (
              <div className="mt-4 border-t border-[#eee6d7] pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-black">
                    Recent Match Searches
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setHistory(
                        []
                      );

                      localStorage.removeItem(
                        HISTORY_KEY
                      );
                    }}
                    className="text-[10px] font-black text-red-500"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {history.map(
                    (
                      item,
                      index
                    ) => (
                      <button
                        key={`${item.timestamp}-${index}`}
                        type="button"
                        onClick={() =>
                          applyHistoryItem(
                            item
                          )
                        }
                        className="max-w-full truncate rounded-xl border border-[#e8dfcf] bg-[#fffdf9] px-3 py-2 text-left text-[10px] font-bold text-gray-600 hover:border-[#c9a24d]"
                      >
                        {item.query ||
                          `${
                            PURPOSES.find(
                              (p) =>
                                p.id ===
                                item.purpose
                            )?.title ||
                            "PrimeMatch"
                          } • ${
                            BUDGETS.find(
                              (b) =>
                                b.id ===
                                item.budget
                            )?.label ||
                            ""
                          }`}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
        </section>

        {/* =================================================
            MATCH BUILDER
        ================================================= */}

        <section className="mt-6 overflow-visible rounded-[28px] border border-[#eadfca] bg-white shadow-sm">
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
                            item.id
                          )
                        }
                        className={`relative rounded-2xl border p-4 text-left transition-all ${
                          active
                            ? "border-[#c9a24d] bg-[#fffaf0] shadow-[0_8px_25px_rgba(201,162,77,0.12)]"
                            : "border-[#e9e1d2] hover:border-[#d4b46a] hover:bg-[#fffdf9]"
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
                          className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm ${
                            active
                              ? "bg-[#c9a24d] text-white"
                              : "bg-[#f6f2ea] text-[#9b762b]"
                          }`}
                        >
                          {
                            item.icon
                          }
                        </span>

                        <p className="mt-3 text-sm font-black">
                          {
                            item.title
                          }
                        </p>

                        <p className="mt-1 text-[10px] text-gray-400">
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

            {/* BUDGET */}
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-black">
                  02. Your budget
                </h4>

                <span className="text-[10px] font-bold text-gray-400">
                  Flexible matching enabled
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
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
                            item.id
                          )
                        }
                        className={`flex items-center justify-between rounded-xl border px-4 py-4 text-left transition ${
                          active
                            ? "border-[#c9a24d] bg-[#fffaf0] text-[#956f27]"
                            : "border-[#e9e1d2] hover:border-[#d5b76d]"
                        }`}
                      >
                        <span className="text-sm font-black">
                          {
                            item.label
                          }
                        </span>

                        {active && (
                          <Check
                            size={16}
                          />
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* CATEGORY + BRAND */}
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <SearchableDropdown
                label="03. Category"
                value={category}
                options={
                  categoryOptions
                }
                placeholder="All Categories"
                onChange={
                  setCategory
                }
                counts={
                  categoryCounts
                }
              />

              <SearchableDropdown
                label="04. Preferred brand"
                value={brand}
                options={
                  brandOptions
                }
                placeholder="Any Brand"
                onChange={setBrand}
                counts={
                  brandCounts
                }
              />
            </div>

            {/* PREFERENCE IMPORTANCE */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-[#eadfca] bg-[#fffdf9]">
              <button
                type="button"
                onClick={() =>
                  setShowWeights(
                    (current) =>
                      !current
                  )
                }
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4d8] text-[#b58a32]">
                    <BarChart3
                      size={18}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a17b2f]">
                      Advanced
                      Matching
                    </p>

                    <h4 className="text-sm font-black">
                      What matters most to you?
                    </h4>
                  </div>
                </div>

                {showWeights ? (
                  <ChevronUp
                    size={17}
                    className="text-gray-400"
                  />
                ) : (
                  <ChevronDown
                    size={17}
                    className="text-gray-400"
                  />
                )}
              </button>

              {showWeights && (
                <div className="grid gap-5 border-t border-[#eee6d7] p-5 sm:grid-cols-2">
                  {[
                    {
                      key: "budget" as const,
                      label: "Budget Fit",
                      description:
                        "Prioritize products close to your budget.",
                    },
                    {
                      key: "quality" as const,
                      label: "Purpose & Category",
                      description:
                        "Prioritize relevance to what you need.",
                    },
                    {
                      key: "brand" as const,
                      label: "Brand Preference",
                      description:
                        "Give more importance to your selected brand.",
                    },
                    {
                      key: "rating" as const,
                      label: "Rating & Reviews",
                      description:
                        "Prioritize highly-rated products.",
                    },
                  ].map(
                    (item) => (
                      <div
                        key={
                          item.key
                        }
                        className="rounded-xl border border-[#eee5d5] bg-white p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black">
                              {
                                item.label
                              }
                            </p>

                            <p className="mt-1 text-[10px] leading-5 text-gray-400">
                              {
                                item.description
                              }
                            </p>
                          </div>

                          <span className="rounded-full bg-[#fff5dc] px-2.5 py-1 text-[10px] font-black text-[#956f27]">
                            {
                              weights[
                                item.key
                              ]
                            }
                            %
                          </span>
                        </div>

                        <input
                          type="range"
                          min="5"
                          max="50"
                          value={
                            weights[
                              item.key
                            ]
                          }
                          onChange={(
                            event
                          ) =>
                            updateWeight(
                              item.key,
                              Number(
                                event
                                  .target
                                  .value
                              )
                            )
                          }
                          className="mt-4 w-full accent-[#c9a24d]"
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* SELECTED FILTERS */}
            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#f7f3eb] px-3 py-1.5 text-[10px] font-bold text-gray-600">
                {
                  PURPOSES.find(
                    (item) =>
                      item.id ===
                      purpose
                  )?.title
                }
              </span>

              <span className="rounded-full bg-[#f7f3eb] px-3 py-1.5 text-[10px] font-bold text-gray-600">
                {
                  BUDGETS.find(
                    (item) =>
                      item.id ===
                      budget
                  )?.label
                }
              </span>

              {activeCategory && (
                <span className="rounded-full bg-[#fff4d8] px-3 py-1.5 text-[10px] font-bold text-[#956f27]">
                  {
                    activeCategory.name
                  }
                </span>
              )}

              {brand !==
                "Any Brand" && (
                <span className="rounded-full bg-[#fff4d8] px-3 py-1.5 text-[10px] font-bold text-[#956f27]">
                  {brand}
                </span>
              )}

              {search.trim() && (
                <span className="max-w-full truncate rounded-full bg-[#fff4d8] px-3 py-1.5 text-[10px] font-bold text-[#956f27]">
                  Search:
                  {" "}
                  {search}
                </span>
              )}
            </div>

            {/* LIVE POTENTIAL */}
            <div className="mt-7 rounded-2xl border border-[#dfc98f] bg-[#fff8e8] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp
                      size={16}
                      className="text-[#a17b2f]"
                    />

                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a17b2f]">
                      Live Match Potential
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Your current preferences are
                    already producing a
                    {` `}
                    <span className="font-black text-[#956f27]">
                      {matchPotential}%
                    </span>
                    {` `}
                    potential match.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-2 w-40 overflow-hidden rounded-full bg-[#eadfca]">
                    <div
                      className="h-full rounded-full bg-[#c9a24d] transition-all duration-500"
                      style={{
                        width: `${matchPotential}%`,
                      }}
                    />
                  </div>

                  <span className="text-lg font-black text-[#956f27]">
                    {
                      matchPotential
                    }%
                  </span>
                </div>
              </div>
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
                onClick={
                  runMatch
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-7 text-sm font-black text-white shadow-lg shadow-[#c9a24d]/20 transition hover:bg-[#b58d3f] disabled:opacity-60"
              >
                {matching ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Finding Your Matches...
                  </>
                ) : (
                  <>
                    <Sparkles
                      size={17}
                    />
                    Find My Prime Match
                    <ArrowRight
                      size={17}
                    />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* =================================================
            ERRORS
        ================================================= */}

        {productError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-red-600">
                  {productError}
                </p>

                <p className="mt-1 text-xs text-red-500">
                  Your preferences are safe. Try
                  loading PrimeMatch again.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  loadData
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            </div>
          </div>
        )}

        {wishlistError && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Info
                size={15}
                className="text-amber-600"
              />

              <p className="text-[10px] font-bold text-amber-700">
                {wishlistError}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setWishlistError(
                  ""
                )
              }
              className="text-amber-600"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* =================================================
            TOP MATCH
        ================================================= */}

        {!loading &&
          matched &&
          topMatch && (
            <div className="mt-8">
              <TopMatch
                product={
                  topMatch
                }
                wished={wishlist.includes(
                  topMatch.id
                )}
                added={cart.includes(
                  topMatch.id
                )}
                onWishlist={() =>
                  toggleWishlist(
                    topMatch.id
                  )
                }
                onCart={() =>
                  addCart(
                    topMatch
                  )
                }
              />
            </div>
          )}

        {/* =================================================
            SMART PICKS
        ================================================= */}

        {!loading &&
          matched &&
          results.length > 0 && (
            <section className="mt-10">
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={16}
                    className="text-[#b58a32]"
                  />

                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                    Smart Picks
                  </span>
                </div>

                <h3 className="mt-1 text-2xl font-black">
                  More ways to shop your match
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                  {
                    label:
                      "Best Value",
                    description:
                      "Strong quality + price balance.",
                    product:
                      bestValue,
                    icon: (
                      <TrendingUp
                        size={18}
                      />
                    ),
                  },
                  {
                    label:
                      "Budget Pick",
                    description:
                      "Great fit without stretching your budget.",
                    product:
                      budgetPick,
                    icon: (
                      <TrendingDown
                        size={18}
                      />
                    ),
                  },
                  {
                    label:
                      "Highly Rated",
                    description:
                      "Strong ratings and review confidence.",
                    product:
                      highlyRated,
                    icon: (
                      <Star
                        size={18}
                      />
                    ),
                  },
                  {
                    label:
                      "Best Deal",
                    description:
                      "Highest active discount among matches.",
                    product:
                      bestDeal,
                    icon: (
                      <Zap
                        size={18}
                      />
                    ),
                  },
                  {
                    label:
                      "Premium Alternative",
                    description:
                      "A higher-priced stronger alternative.",
                    product:
                      premiumAlternative,
                    icon: (
                      <BadgeCheck
                        size={18}
                      />
                    ),
                  },
                ].map(
                  (item) => {
                    if (
                      !item.product
                    ) {
                      return (
                        <div
                          key={
                            item.label
                          }
                          className="rounded-2xl border border-dashed border-[#e5dccb] bg-white p-5"
                        >
                          <p className="text-xs font-black text-gray-400">
                            {
                              item.label
                            }
                          </p>

                          <p className="mt-2 text-[10px] leading-5 text-gray-400">
                            No suitable alternative
                            is currently available.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={
                          item.label
                        }
                        href={`/dashboard/products/${item.product.id}`}
                        className="group rounded-2xl border border-[#eadfca] bg-white p-5 transition hover:-translate-y-1 hover:border-[#d7bd78] hover:shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff5dc] text-[#b58a32]">
                            {
                              item.icon
                            }
                          </div>

                          <span className="rounded-full bg-[#fff5dc] px-2.5 py-1 text-[9px] font-black text-[#956f27]">
                            {
                              item.product
                                .matchScore
                            }%
                          </span>
                        </div>

                        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.15em] text-[#a17b2f]">
                          {
                            item.label
                          }
                        </p>

                        <h4 className="mt-2 line-clamp-2 text-sm font-black group-hover:text-[#a17b2f]">
                          {
                            item.product
                              .name
                          }
                        </h4>

                        <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-gray-400">
                          {
                            item.description
                          }
                        </p>

                        <p className="mt-4 text-base font-black">
                          {money(
                            Number(
                              item.product
                                .price
                            )
                          )}
                        </p>
                      </Link>
                    );
                  }
                )}
              </div>
            </section>
          )}

        {/* =================================================
            PRODUCTS
        ================================================= */}

        <section
          id="products"
          className="mt-10 scroll-mt-24"
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-2xl font-black">
                  {matched
                    ? "Your Ranked Matches"
                    : "Recommended Products"}
                </h3>

                {matched && (
                  <span className="rounded-full bg-[#fff3d2] px-2.5 py-1 text-[10px] font-black text-[#956f27]">
                    Smart Ranked
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {matched
                  ? `${results.length} products ranked according to your preferences.`
                  : "Explore products before running your personalized match."}
              </p>
            </div>

            {matched && (
              <button
                type="button"
                onClick={() =>
                  setMatched(
                    false
                  )
                }
                className="flex items-center gap-2 text-xs font-black text-[#9b762b] hover:underline"
              >
                <RefreshCw
                  size={14}
                />
                Change Preferences
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[
                1, 2, 3, 4,
              ].map(
                (item) => (
                  <ProductSkeleton
                    key={item}
                  />
                )
              )}
            </div>
          ) : displayedProducts.length ===
            0 ? (
            <div className="rounded-[28px] border border-[#eadfca] bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32]">
                <Search
                  size={27}
                />
              </div>

              <h3 className="mt-5 text-xl font-black">
                No products found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Try changing your search,
                category, brand or budget
                preferences. PrimeMatch will
                automatically look for close
                alternatives.
              </p>

              <button
                type="button"
                onClick={reset}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#c9a24d] px-5 py-3 text-sm font-black text-white"
              >
                <RefreshCw
                  size={15}
                />
                Reset Preferences
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayedProducts.map(
                (
                  product,
                  index
                ) => (
                  <ProductCard
                    key={
                      product.id
                    }
                    product={
                      product
                    }
                    rank={
                      index + 1
                    }
                    wished={wishlist.includes(
                      product.id
                    )}
                    added={cart.includes(
                      product.id
                    )}
                    compared={compareIds.includes(
                      product.id
                    )}
                    onWishlist={() =>
                      toggleWishlist(
                        product.id
                      )
                    }
                    onCart={() =>
                      addCart(
                        product
                      )
                    }
                    onCompare={() =>
                      toggleCompare(
                        product.id
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* =================================================
            COMPARE
        ================================================= */}

        {compareProducts.length >
          0 && (
          <ComparisonTable
            products={
              compareProducts
            }
            onRemove={(
              id
            ) =>
              setCompareIds(
                (current) =>
                  current.filter(
                    (
                      item
                    ) =>
                      item !==
                      id
                  )
              )
            }
          />
        )}

        {/* =================================================
            SMART FALLBACK
        ================================================= */}

        {matched &&
          category !==
            "all" &&
          results.length > 0 &&
          results[0]
            .breakdown
            .category <
            95 && (
            <section className="mt-10 rounded-[26px] border border-[#eadfca] bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff5dc] text-[#b58a32]">
                  <Info
                    size={19}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-black">
                    Smart fallback is active
                  </h3>

                  <p className="mt-1 text-xs leading-6 text-gray-500">
                    PrimeMatch could not find a
                    perfect match for every selected
                    preference, so related products
                    are still included instead of
                    showing an empty result.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#f7f3eb] px-3 py-1.5 text-[10px] font-bold text-gray-600">
                      Category priority
                    </span>

                    {brand !==
                      "Any Brand" && (
                      <span className="rounded-full bg-[#f7f3eb] px-3 py-1.5 text-[10px] font-bold text-gray-600">
                        Brand preference
                      </span>
                    )}

                    <span className="rounded-full bg-[#fff5dc] px-3 py-1.5 text-[10px] font-bold text-[#956f27]">
                      Close alternatives
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

        {/* =================================================
            MORE MATCHES
        ================================================= */}

        {matched &&
          moreMatches.length >
            0 && (
            <section className="mt-14">
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={15}
                    className="text-[#b58a32]"
                  />

                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                    More Matches
                  </span>
                </div>

                <h3 className="mt-1 text-2xl font-black">
                  More products you may like
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Ranked using PrimeMatch
                  compatibility signals.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {moreMatches
                  .slice(
                    0,
                    8
                  )
                  .map(
                    (
                      product,
                      index
                    ) => (
                      <ProductCard
                        key={
                          product.id
                        }
                        product={
                          product
                        }
                        rank={
                          index + 2
                        }
                        wished={wishlist.includes(
                          product.id
                        )}
                        added={cart.includes(
                          product.id
                        )}
                        compared={compareIds.includes(
                          product.id
                        )}
                        onWishlist={() =>
                          toggleWishlist(
                            product.id
                          )
                        }
                        onCart={() =>
                          addCart(
                            product
                          )
                        }
                        onCompare={() =>
                          toggleCompare(
                            product.id
                          )
                        }
                      />
                    )
                  )}
              </div>
            </section>
          )}

        {/* =================================================
            HOW IT WORKS
        ================================================= */}

        <section className="mt-14">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b58a32]">
              THE PRIME MATCH SYSTEM
            </span>

            <h3 className="mt-2 text-2xl font-black sm:text-3xl">
              A smarter way to discover products.
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              PrimeMatch combines your preferences
              with product data to create a
              transparent personalized ranking.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                number:
                  "01",
                icon: (
                  <Target
                    size={20}
                  />
                ),
                title:
                  "Set your preferences",
                text:
                  "Choose your purpose, budget, category, brand and what matters most.",
              },
              {
                number:
                  "02",
                icon: (
                  <BarChart3
                    size={20}
                  />
                ),
                title:
                  "Products are analyzed",
                text:
                  "PrimeMatch evaluates relevance, budget fit, quality, ratings, brand and availability.",
              },
              {
                number:
                  "03",
                icon: (
                  <Sparkles
                    size={20}
                  />
                ),
                title:
                  "Get transparent matches",
                text:
                  "See your match percentage, reasons and detailed score breakdown before buying.",
              },
            ].map(
              (item) => (
                <div
                  key={
                    item.number
                  }
                  className="rounded-[24px] border border-[#eadfca] bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff6df] text-[#b58a32]">
                      {
                        item.icon
                      }
                    </div>

                    <span className="text-3xl font-black text-[#f0e8d7]">
                      {
                        item.number
                      }
                    </span>
                  </div>

                  <h4 className="mt-6 text-base font-black">
                    {
                      item.title
                    }
                  </h4>

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

        <section className="mt-8 overflow-hidden rounded-[28px] border border-[#dfc98f] bg-[#fff7e4]">
          <div className="flex flex-col gap-6 px-6 py-8 sm:px-9 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles
                  size={15}
                  className="text-[#b58a32]"
                />

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9b762b]">
                  PrimeCart
                </span>
              </div>

              <h3 className="mt-2 text-xl font-black">
                Not sure what to choose?
              </h3>

              <p className="mt-1 max-w-xl text-sm text-gray-500">
                Change your preferences, adjust what
                matters most, or try a natural-language
                search and let PrimeMatch recalculate
                your recommendations.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior:
                    "smooth",
                })
              }
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-6 text-sm font-black text-white transition hover:bg-[#b58d3f]"
            >
              <Sparkles
                size={16}
              />
              Find My Match
            </button>
          </div>
        </section>

        <div className="h-10" />
      </main>

      {/* ===================================================
          MOBILE STICKY MATCH
      =================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e8deca] bg-white/95 p-3 shadow-[0_-10px_40px_rgba(60,45,20,0.08)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#a17b2f]">
              Match Potential
            </p>

            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#eee5d5]">
                <div
                  className="h-full rounded-full bg-[#c9a24d]"
                  style={{
                    width: `${matchPotential}%`,
                  }}
                />
              </div>

              <span className="text-xs font-black text-[#956f27]">
                {
                  matchPotential
                }%
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={
              loading ||
              matching
            }
            onClick={
              runMatch
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-5 text-xs font-black text-white disabled:opacity-50"
          >
            {matching ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Sparkles
                size={15}
              />
            )}

            Match
          </button>
        </div>
      </div>
    </div>
  );
}
