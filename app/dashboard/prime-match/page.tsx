"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Check,
  ChevronDown,
  CircleHelp,
  Filter,
  Heart,
  Loader2,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  Zap,
  X,
  SlidersHorizontal,
  Crown,
  BadgeCheck,
  Brain,
  ScanSearch,
  WalletCards,
  Tags,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

/* =========================================================
   TYPES
========================================================= */

type Product = {
  id: string;
  category_id?: string | null;
  name: string;
  slug?: string | null;
  short_description?: string | null;
  description?: string | null;
  price: number;
  original_price?: number | null;
  stock?: number | null;
  image_url?: string | null;
  brand?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  is_featured?: boolean | null;
  is_flash_sale?: boolean | null;
  is_active?: boolean | null;
};

type Category = {
  id: string;
  name: string;
};

type BudgetKey =
  | "under-1000"
  | "1000-5000"
  | "5000-15000"
  | "15000-plus";

type Importance = {
  budget: number;
  quality: number;
  brand: number;
  rating: number;
};

type ScoreBreakdown = {
  purpose: number;
  category: number;
  budget: number;
  quality: number;
  brand: number;
  rating: number;
  availability: number;
  search: number;
};

type MatchProduct = Product & {
  score: number;
  breakdown: ScoreBreakdown;
  reasons: string[];
};

type MatchingStage = {
  label: string;
  icon: React.ElementType;
};

/* =========================================================
   CONSTANTS
========================================================= */

const PRODUCT_IMAGE_FALLBACK = "/product-placeholder.png";

const PURPOSES = [
  {
    id: "everyday",
    label: "Everyday",
    description: "Daily essentials & useful products",
    icon: "✨",
    keywords: [
      "daily",
      "everyday",
      "home",
      "utility",
      "essential",
      "general",
    ],
  },
  {
    id: "work",
    label: "Work & Study",
    description: "Products for productivity",
    icon: "💼",
    keywords: [
      "work",
      "office",
      "study",
      "laptop",
      "desk",
      "book",
      "computer",
      "productivity",
    ],
  },
  {
    id: "entertainment",
    label: "Entertainment",
    description: "Gaming, audio & fun",
    icon: "🎮",
    keywords: [
      "gaming",
      "game",
      "entertainment",
      "headphone",
      "speaker",
      "music",
      "movie",
      "console",
    ],
  },
  {
    id: "fitness",
    label: "Fitness",
    description: "Workout & active lifestyle",
    icon: "🏃",
    keywords: [
      "fitness",
      "gym",
      "sports",
      "running",
      "workout",
      "health",
      "training",
      "shoe",
    ],
  },
  {
    id: "style",
    label: "Style",
    description: "Fashion, watches & accessories",
    icon: "✨",
    keywords: [
      "fashion",
      "style",
      "watch",
      "bag",
      "shoe",
      "clothing",
      "jacket",
      "wallet",
      "accessory",
    ],
  },
  {
    id: "home",
    label: "Home",
    description: "Home & living products",
    icon: "🏠",
    keywords: [
      "home",
      "living",
      "kitchen",
      "appliance",
      "furniture",
      "coffee",
      "decor",
      "house",
    ],
  },
];

const BUDGETS: {
  id: BudgetKey;
  label: string;
  min: number;
  max: number;
}[] = [
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

const MATCHING_STAGES: MatchingStage[] = [
  {
    label: "Understanding your preferences",
    icon: Brain,
  },
  {
    label: "Scanning available products",
    icon: ScanSearch,
  },
  {
    label: "Checking your budget",
    icon: WalletCards,
  },
  {
    label: "Comparing quality & ratings",
    icon: Star,
  },
  {
    label: "Finding your strongest matches",
    icon: Target,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function normalize(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .trim();
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function discount(product: Product) {
  if (
    !product.original_price ||
    product.original_price <= product.price ||
    product.original_price <= 0
  ) {
    return 0;
  }

  return Math.round(
    ((product.original_price - product.price) /
      product.original_price) *
      100
  );
}

/* =========================================================
   IMAGE HANDLING
========================================================= */

function getImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return PRODUCT_IMAGE_FALLBACK;

  const value = imageUrl.trim();

  if (!value) return PRODUCT_IMAGE_FALLBACK;

  // Full URL
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  // Already an absolute local path
  if (value.startsWith("/")) {
    return value;
  }

  // Supabase storage URL/path
  if (value.includes("/storage/")) {
    return value.startsWith("/")
      ? value
      : `/${value}`;
  }

  // DB contains only filename
  return `/products/${value}`;
}

/* =========================================================
   CATEGORY ALIASES
========================================================= */

const CATEGORY_ALIASES: Record<string, string[]> = {
  "home & living": [
    "home",
    "living",
    "decor",
    "furniture",
    "kitchen",
    "house",
  ],
  mobile: [
    "mobile",
    "smartphone",
    "phone",
    "android",
    "iphone",
  ],
  appliance: [
    "appliance",
    "coffee",
    "kitchen",
    "electronic",
    "electronics",
  ],
  footwear: [
    "footwear",
    "shoe",
    "shoes",
    "sneaker",
    "running",
    "sandals",
  ],
  watch: [
    "watch",
    "watches",
    "smartwatch",
    "accessory",
  ],
  bag: [
    "bag",
    "backpack",
    "wallet",
    "luggage",
    "handbag",
  ],
  "toy & baby": [
    "toy",
    "baby",
    "kids",
    "child",
    "game",
  ],
  automotive: [
    "automotive",
    "car",
    "vehicle",
    "bike",
    "auto",
  ],
  fashion: [
    "fashion",
    "clothing",
    "dress",
    "jacket",
    "shirt",
    "jeans",
    "style",
  ],
  gaming: [
    "gaming",
    "game",
    "console",
    "controller",
    "headphone",
  ],
};

/* =========================================================
   PURPOSE SCORE
========================================================= */

function getPurposeScore(
  product: Product,
  categoryName: string,
  purposeId: string
) {
  const purpose = PURPOSES.find((item) => item.id === purposeId);

  if (!purpose) return 35;

  const searchable = normalize(
    [
      product.name,
      product.brand,
      product.short_description,
      product.description,
      categoryName,
    ].join(" ")
  );

  const hits = purpose.keywords.filter((keyword) =>
    searchable.includes(normalize(keyword))
  ).length;

  if (hits >= 4) return 100;
  if (hits === 3) return 92;
  if (hits === 2) return 82;
  if (hits === 1) return 65;

  return 35;
}

/* =========================================================
   BUDGET SCORE
========================================================= */

function getBudgetScore(product: Product, budget: BudgetKey) {
  const selected = BUDGETS.find((item) => item.id === budget);

  if (!selected) return 50;

  const price = Number(product.price || 0);

  if (price >= selected.min && price <= selected.max) {
    return 100;
  }

  // For 15k+ products
  if (selected.id === "15000-plus") {
    if (price >= 15000) return 100;

    if (price >= 12000) return 75;
    if (price >= 10000) return 55;
    return 30;
  }

  // Price below selected range
  if (price < selected.min) {
    const distance = selected.min - price;
    const percentage = selected.min
      ? distance / selected.min
      : 1;

    return clamp(90 - percentage * 80, 25, 90);
  }

  // Price above selected range
  const distance = price - selected.max;
  const percentage = selected.max
    ? distance / selected.max
    : 1;

  return clamp(85 - percentage * 100, 10, 85);
}

/* =========================================================
   QUALITY SCORE
========================================================= */

function getQualityScore(product: Product) {
  const rating = Number(product.rating || 0);
  const reviews = Number(product.reviews_count || 0);

  const ratingScore = clamp((rating / 5) * 100, 0, 100);

  let reviewConfidence = 40;

  if (reviews >= 1000) reviewConfidence = 100;
  else if (reviews >= 500) reviewConfidence = 90;
  else if (reviews >= 200) reviewConfidence = 82;
  else if (reviews >= 100) reviewConfidence = 75;
  else if (reviews >= 50) reviewConfidence = 65;
  else if (reviews >= 10) reviewConfidence = 55;

  const featuredBonus = product.is_featured ? 5 : 0;

  return clamp(
    ratingScore * 0.72 +
      reviewConfidence * 0.23 +
      featuredBonus,
    0,
    100
  );
}

/* =========================================================
   SEARCH SCORE
========================================================= */

function getSearchScore(
  product: Product,
  categoryName: string,
  search: string
) {
  const query = normalize(search);

  if (!query) return 50;

  const terms = query
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  if (!terms.length) return 50;

  const fields = {
    name: normalize(product.name),
    brand: normalize(product.brand),
    category: normalize(categoryName),
    description: normalize(
      `${product.short_description || ""} ${
        product.description || ""
      }`
    ),
  };

  let total = 0;

  for (const term of terms) {
    if (fields.name.includes(term)) {
      total += 100;
    } else if (fields.brand.includes(term)) {
      total += 92;
    } else if (fields.category.includes(term)) {
      total += 88;
    } else if (fields.description.includes(term)) {
      total += 65;
    }
  }

  return clamp(total / terms.length, 0, 100);
}

/* =========================================================
   CATEGORY SCORE
========================================================= */

function getCategoryScore(
  product: Product,
  categoryName: string,
  selectedCategory: string,
  categories: Category[]
) {
  if (selectedCategory === "all") return 60;

  const selected = categories.find(
    (category) => category.id === selectedCategory
  );

  if (!selected) return 50;

  const selectedName = normalize(selected.name);
  const currentName = normalize(categoryName);

  if (currentName === selectedName) {
    return 100;
  }

  const aliases = CATEGORY_ALIASES[selectedName] || [];

  const searchable = normalize(
    [
      product.name,
      product.brand,
      product.short_description,
      product.description,
      categoryName,
    ].join(" ")
  );

  const hits = aliases.filter((alias) =>
    searchable.includes(normalize(alias))
  ).length;

  if (hits >= 3) return 90;
  if (hits === 2) return 82;
  if (hits === 1) return 68;

  return 20;
}

/* =========================================================
   BRAND SCORE
========================================================= */

function getBrandScore(
  product: Product,
  selectedBrand: string
) {
  if (selectedBrand === "Any Brand") {
    return 70;
  }

  if (!product.brand) return 25;

  return normalize(product.brand) === normalize(selectedBrand)
    ? 100
    : 18;
}

/* =========================================================
   REASONS
========================================================= */

function buildReasons(
  product: Product,
  categoryName: string,
  breakdown: ScoreBreakdown,
  purposeId: string,
  budget: BudgetKey,
  selectedBrand: string
) {
  const reasons: string[] = [];

  const purpose = PURPOSES.find(
    (item) => item.id === purposeId
  );

  if (breakdown.purpose >= 80 && purpose) {
    reasons.push(`Strong fit for ${purpose.label.toLowerCase()}`);
  }

  if (breakdown.budget >= 85) {
    reasons.push("Fits your selected budget");
  } else if (breakdown.budget >= 65) {
    reasons.push("Close to your preferred budget");
  }

  if (breakdown.quality >= 85) {
    reasons.push("Strong quality signals");
  }

  if (breakdown.rating >= 85) {
    reasons.push("Highly rated by shoppers");
  }

  if (breakdown.category >= 90) {
    reasons.push(`Matches ${categoryName}`);
  }

  if (
    selectedBrand !== "Any Brand" &&
    breakdown.brand >= 90
  ) {
    reasons.push(`Matches your ${product.brand} preference`);
  }

  if (product.is_flash_sale) {
    reasons.push("Currently on flash sale");
  } else if (discount(product) >= 20) {
    reasons.push(`${discount(product)}% deal available`);
  }

  if ((product.stock || 0) > 0) {
    reasons.push("Currently in stock");
  }

  return reasons.slice(0, 4);
}

/* =========================================================
   SCORE PRODUCT
========================================================= */

function scoreProduct(
  product: Product,
  categoryName: string,
  preferences: {
    purpose: string;
    budget: BudgetKey;
    category: string;
    brand: string;
    search: string;
    importance: Importance;
  },
  categories: Category[]
): MatchProduct {
  const purposeScore = getPurposeScore(
    product,
    categoryName,
    preferences.purpose
  );

  const categoryScore = getCategoryScore(
    product,
    categoryName,
    preferences.category,
    categories
  );

  const budgetScore = getBudgetScore(
    product,
    preferences.budget
  );

  const qualityScore = getQualityScore(product);

  const brandScore = getBrandScore(
    product,
    preferences.brand
  );

  const ratingScore = clamp(
    (Number(product.rating || 0) / 5) * 100,
    0,
    100
  );

  const availabilityScore =
    Number(product.stock || 0) > 0 ? 100 : 0;

  const searchScore = getSearchScore(
    product,
    categoryName,
    preferences.search
  );

  const importance = preferences.importance;

  /*
    Dynamic weights.
    Purpose/category/search/availability remain fixed.
    User importance controls budget/quality/brand/rating.
  */

  const rawWeights = {
    budget: Math.max(importance.budget, 1),
    quality: Math.max(importance.quality, 1),
    brand: Math.max(importance.brand, 1),
    rating: Math.max(importance.rating, 1),
  };

  const dynamicTotal =
    rawWeights.budget +
    rawWeights.quality +
    rawWeights.brand +
    rawWeights.rating;

  const dynamicArea = 0.60;

  const budgetWeight =
    (rawWeights.budget / dynamicTotal) * dynamicArea;

  const qualityWeight =
    (rawWeights.quality / dynamicTotal) * dynamicArea;

  const brandWeight =
    (rawWeights.brand / dynamicTotal) * dynamicArea;

  const ratingWeight =
    (rawWeights.rating / dynamicTotal) * dynamicArea;

  const fixedScore =
    purposeScore * 0.16 +
    categoryScore * 0.10 +
    searchScore * 0.04 +
    availabilityScore * 0.02;

  let score =
    fixedScore +
    budgetScore * budgetWeight +
    qualityScore * qualityWeight +
    brandScore * brandWeight +
    ratingScore * ratingWeight;

  // Small product signals
  if (product.is_featured) {
    score += 2.5;
  }

  if (product.is_flash_sale) {
    score += 2;
  }

  if (discount(product) >= 30) {
    score += 1.5;
  }

  // Out of stock should never dominate recommendations
  if (Number(product.stock || 0) <= 0) {
    score -= 12;
  }

  score = clamp(score, 20, 99);

  const breakdown: ScoreBreakdown = {
    purpose: Math.round(purposeScore),
    category: Math.round(categoryScore),
    budget: Math.round(budgetScore),
    quality: Math.round(qualityScore),
    brand: Math.round(brandScore),
    rating: Math.round(ratingScore),
    availability: Math.round(availabilityScore),
    search: Math.round(searchScore),
  };

  const reasons = buildReasons(
    product,
    categoryName,
    breakdown,
    preferences.purpose,
    preferences.budget,
    preferences.brand
  );

  return {
    ...product,
    score: Math.round(score),
    breakdown,
    reasons,
  };
}

/* =========================================================
   ANIMATED PRODUCT IMAGE
========================================================= */

function ProductImage({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const [src, setSrc] = useState(
    getImageUrl(product.image_url)
  );

  return (
    <img
      src={src}
      alt={product.name}
      className={className}
      onError={() => {
        if (src !== PRODUCT_IMAGE_FALLBACK) {
          setSrc(PRODUCT_IMAGE_FALLBACK);
        }
      }}
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-medium text-slate-500">
          {label}
        </span>

        <span className="font-bold text-slate-700">
          {value}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[#f2eee4]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="h-full rounded-full bg-gradient-to-r from-[#b8872d] to-[#e1bd69]"
        />
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  rank,
  onAddToCart,
  onWishlist,
  isWishlisted,
  compareIds,
  onToggleCompare,
}: {
  product: MatchProduct;
  rank: number;
  onAddToCart: (product: Product) => void;
  onWishlist: (product: Product) => void;
  isWishlisted: boolean;
  compareIds: string[];
  onToggleCompare: (id: string) => void;
}) {
  const sale = discount(product);

  const compared = compareIds.includes(product.id);

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 24,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        delay: Math.min(rank * 0.05, 0.25),
      }}
      whileHover={{
        y: -5,
      }}
      className="group relative overflow-hidden rounded-3xl border border-[#eee5d3] bg-white shadow-[0_8px_30px_rgba(120,90,30,0.06)] transition-shadow hover:shadow-[0_16px_45px_rgba(120,90,30,0.12)]"
    >
      <div className="relative h-64 overflow-hidden bg-[#faf8f3]">
        <ProductImage
          product={product}
          className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-[#17130b] px-3 py-1.5 text-[11px] font-bold text-white shadow">
            #{rank}
          </span>

          <span className="flex items-center gap-1 rounded-full bg-[#fff8e8] px-3 py-1.5 text-[11px] font-bold text-[#9a6c1e] ring-1 ring-[#ead19c]">
            <Sparkles className="h-3 w-3" />
            {product.score}% Match
          </span>
        </div>

        {sale > 0 && (
          <span className="absolute bottom-4 left-4 rounded-full bg-[#fff0df] px-3 py-1.5 text-[11px] font-bold text-[#a65c1d]">
            {sale}% OFF
          </span>
        )}

        <button
          type="button"
          onClick={() => onWishlist(product)}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border bg-white/95 shadow-sm backdrop-blur transition ${
            isWishlisted
              ? "border-[#e7c16c] text-[#b8872d]"
              : "border-[#eee5d3] text-slate-500 hover:border-[#d7b35d] hover:text-[#b8872d]"
          }`}
          aria-label="Wishlist"
        >
          <Heart
            className="h-4 w-4"
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center gap-2 text-[11px]">
          <span className="rounded-full bg-[#f8f4eb] px-2.5 py-1 font-semibold text-[#8f6b2b]">
            {product.brand || "PrimeCart"}
          </span>

          {product.is_flash_sale && (
            <span className="flex items-center gap-1 text-[#b86d23]">
              <Zap className="h-3 w-3" />
              Flash Deal
            </span>
          )}
        </div>

        <Link
          href={`/dashboard/products/${product.id}`}
          className="line-clamp-2 min-h-[48px] text-base font-bold leading-6 text-[#211c12] transition-colors hover:text-[#b8872d]"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-1 text-[#b8872d]">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-bold text-slate-700">
              {Number(product.rating || 0).toFixed(1)}
            </span>
          </div>

          <span className="text-xs text-slate-400">
            ({product.reviews_count || 0} reviews)
          </span>
        </div>

        <div className="mt-4 flex items-end gap-2">
          <span className="text-xl font-black text-[#211c12]">
            {money(Number(product.price || 0))}
          </span>

          {product.original_price &&
            product.original_price > product.price && (
              <span className="pb-0.5 text-xs text-slate-400 line-through">
                {money(Number(product.original_price))}
              </span>
            )}
        </div>

        <div className="mt-4 space-y-2 rounded-2xl bg-[#fcfaf5] p-3">
          {product.reasons.slice(0, 2).map((reason) => (
            <div
              key={reason}
              className="flex items-start gap-2 text-[11px] text-slate-600"
            >
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b8872d]" />
              <span>{reason}</span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <ScoreBar
            label="Overall match"
            value={product.score}
          />
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#b8872d] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#a77724] active:scale-[0.98]"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>

          <button
            type="button"
            onClick={() => onToggleCompare(product.id)}
            className={`flex items-center justify-center rounded-xl border px-3 transition ${
              compared
                ? "border-[#d6b15a] bg-[#fff8e8] text-[#9a6c1e]"
                : "border-[#e7dfcf] bg-white text-slate-500 hover:border-[#d6b15a] hover:text-[#9a6c1e]"
            }`}
            title="Compare"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function PrimeMatchPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartIds, setCartIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [matched, setMatched] = useState(false);

  const [matchStage, setMatchStage] = useState(0);

  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [purpose, setPurpose] = useState("everyday");
  const [budget, setBudget] =
    useState<BudgetKey>("1000-5000");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("Any Brand");
  const [search, setSearch] = useState("");

  const [importance, setImportance] = useState<Importance>({
    budget: 70,
    quality: 75,
    brand: 40,
    rating: 65,
  });

  const [compareIds, setCompareIds] = useState<string[]>(
    []
  );

  // Snapshot of preferences when Find My Prime Match is clicked
  const [matchedPreferences, setMatchedPreferences] =
    useState({
      purpose: "everyday",
      budget: "1000-5000" as BudgetKey,
      category: "all",
      brand: "Any Brand",
      search: "",
      importance: {
        budget: 70,
        quality: 75,
        brand: 40,
        rating: 65,
      },
    });

  /* =======================================================
     TOAST
  ======================================================= */

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 2800);

    return () => clearTimeout(timer);
  }, [toast]);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

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
            .select("*")
            .eq("is_active", true)
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("categories")
            .select("id,name")
            .order("name", {
              ascending: true,
            }),

          supabase
            .from("wishlist")
            .select("product_id")
            .eq("user_id", user.id),
        ]);

        if (productsResponse.error) {
          throw productsResponse.error;
        }

        if (categoriesResponse.error) {
          throw categoriesResponse.error;
        }

        setProducts(productsResponse.data || []);
        setCategories(categoriesResponse.data || []);

        setWishlist(
          (wishlistResponse.data || [])
            .map((item) => item.product_id)
            .filter(Boolean)
        );

        const uniqueBrands = Array.from(
          new Set(
            (productsResponse.data || [])
              .map((product) =>
                String(product.brand || "").trim()
              )
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b));

        setBrands(uniqueBrands);

        try {
          const storedCart = localStorage.getItem(
            "primecart-cart"
          );

          if (storedCart) {
            const parsed = JSON.parse(storedCart);

            if (Array.isArray(parsed)) {
              const ids = parsed
                .map(
                  (item: {
                    product_id?: string;
                    productId?: string;
                    id?: string;
                  }) =>
                    item.product_id ||
                    item.productId ||
                    item.id
                )
                .filter(Boolean);

              setCartIds(ids);
            }
          }
        } catch {
          // Ignore malformed cart
        }
      } catch (err) {
        console.error(err);
        setError(
          "We couldn't load your PrimeMatch data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /* =======================================================
     CART SYNC
  ======================================================= */

  useEffect(() => {
    const handleCartUpdate = () => {
      try {
        const storedCart = localStorage.getItem(
          "primecart-cart"
        );

        if (!storedCart) {
          setCartIds([]);
          return;
        }

        const parsed = JSON.parse(storedCart);

        if (!Array.isArray(parsed)) {
          setCartIds([]);
          return;
        }

        setCartIds(
          parsed
            .map(
              (item: {
                product_id?: string;
                productId?: string;
                id?: string;
              }) =>
                item.product_id ||
                item.productId ||
                item.id
            )
            .filter(Boolean)
        );
      } catch {
        setCartIds([]);
      }
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
     CATEGORY MAP
  ======================================================= */

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();

    categories.forEach((item) => {
      map.set(item.id, item.name);
    });

    return map;
  }, [categories]);

  /* =======================================================
     RESULTS
  ======================================================= */

  const allResults = useMemo(() => {
    return products
      .map((product) => {
        const categoryName =
          categoryMap.get(product.category_id || "") ||
          "General";

        return scoreProduct(
          product,
          categoryName,
          matchedPreferences,
          categories
        );
      })
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        const ratingDiff =
          Number(b.rating || 0) -
          Number(a.rating || 0);

        if (ratingDiff !== 0) {
          return ratingDiff;
        }

        return (
          Number(b.reviews_count || 0) -
          Number(a.reviews_count || 0)
        );
      });
  }, [
    products,
    categoryMap,
    categories,
    matchedPreferences,
  ]);

  const filteredResults = useMemo(() => {
    return allResults.filter((product) => {
      if (
        matchedPreferences.search.trim() &&
        product.breakdown.search < 40
      ) {
        return false;
      }

      if (
        matchedPreferences.category !== "all" &&
        product.breakdown.category < 50
      ) {
        return false;
      }

      if (
        matchedPreferences.brand !== "Any Brand" &&
        product.breakdown.brand < 80
      ) {
        return false;
      }

      return true;
    });
  }, [allResults, matchedPreferences]);

  /*
    IMPORTANT:
    Products are intentionally hidden until matching completes.
  */
  const results = matched ? filteredResults : [];

  const topMatch = results[0] || null;

  const bestValue = useMemo(() => {
    return [...results]
      .sort((a, b) => {
        const valueA =
          a.score +
          discount(a) * 0.35 -
          Number(a.price || 0) / 10000;

        const valueB =
          b.score +
          discount(b) * 0.35 -
          Number(b.price || 0) / 10000;

        return valueB - valueA;
      })
      .find((item) => item.id !== topMatch?.id);
  }, [results, topMatch]);

  const budgetPick = useMemo(() => {
    return [...results]
      .sort(
        (a, b) =>
          b.breakdown.budget -
          a.breakdown.budget
      )
      .find((item) => item.id !== topMatch?.id);
  }, [results, topMatch]);

  const topRated = useMemo(() => {
    return [...results]
      .sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      )
      .find((item) => item.id !== topMatch?.id);
  }, [results, topMatch]);

  const premiumPick = useMemo(() => {
    return [...results]
      .sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      )
      .find((item) => item.id !== topMatch?.id);
  }, [results, topMatch]);

  const compareProducts = compareIds
    .map((id) =>
      results.find((product) => product.id === id)
    )
    .filter(Boolean) as MatchProduct[];

  /* =======================================================
     LIVE POTENTIAL
  ======================================================= */

  const livePotential = useMemo(() => {
    if (!products.length) return 0;

    const preview = products.map((product) => {
      const categoryName =
        categoryMap.get(product.category_id || "") ||
        "General";

      return scoreProduct(
        product,
        categoryName,
        {
          purpose,
          budget,
          category,
          brand,
          search,
          importance,
        },
        categories
      );
    });

    const sorted = [...preview].sort(
      (a, b) => b.score - a.score
    );

    return sorted[0]?.score || 0;
  }, [
    products,
    categoryMap,
    categories,
    purpose,
    budget,
    category,
    brand,
    search,
    importance,
  ]);

  /* =======================================================
     MATCHING
  ======================================================= */

  async function runMatch() {
    if (matching) return;

    setError("");
    setMatched(false);
    setMatchStage(0);
    setCompareIds([]);

    setMatchedPreferences({
      purpose,
      budget,
      category,
      brand,
      search: search.trim(),
      importance: {
        ...importance,
      },
    });

    setMatching(true);

    for (
      let index = 0;
      index < MATCHING_STAGES.length;
      index++
    ) {
      setMatchStage(index);

      await new Promise((resolve) =>
        setTimeout(resolve, 650)
      );
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 350)
    );

    setMatching(false);
    setMatched(true);

    setTimeout(() => {
      document
        .getElementById("match-results")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 150);
  }

  /* =======================================================
     RESET
  ======================================================= */

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
    setMatching(false);
    setMatchStage(0);
    setCompareIds([]);
    setError("");
  }

  /* =======================================================
     ADD TO CART
  ======================================================= */

  function addToCart(product: Product) {
    try {
      const stored =
        localStorage.getItem("primecart-cart");

      let cart: any[] = [];

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          cart = parsed;
        }
      }

      const existingIndex = cart.findIndex(
        (item) =>
          item.product_id === product.id ||
          item.productId === product.id ||
          item.id === product.id
      );

      if (existingIndex >= 0) {
        cart[existingIndex] = {
          ...cart[existingIndex],
          quantity:
            Number(cart[existingIndex].quantity || 1) + 1,
        };
      } else {
        cart.push({
          product_id: product.id,
          productId: product.id,
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          image: product.image_url,
          quantity: 1,
        });
      }

      localStorage.setItem(
        "primecart-cart",
        JSON.stringify(cart)
      );

      setCartIds((current) =>
        current.includes(product.id)
          ? current
          : [...current, product.id]
      );

      window.dispatchEvent(
        new Event("cart-updated")
      );

      setToast(`${product.name} added to cart`);
    } catch (err) {
      console.error(err);
      setToast("Unable to add product to cart");
    }
  }

  /* =======================================================
     WISHLIST
  ======================================================= */

  async function toggleWishlist(product: Product) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      const exists = wishlist.includes(product.id);

      if (exists) {
        const { error: deleteError } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", product.id);

        if (deleteError) throw deleteError;

        setWishlist((current) =>
          current.filter((id) => id !== product.id)
        );

        setToast("Removed from wishlist");
      } else {
        const { error: insertError } = await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: product.id,
          });

        if (insertError) throw insertError;

        setWishlist((current) => [
          ...current,
          product.id,
        ]);

        setToast("Added to wishlist");
      }
    } catch (err) {
      console.error(err);
      setToast("Unable to update wishlist");
    }
  }

  /* =======================================================
     COMPARE
  ======================================================= */

  function toggleCompare(id: string) {
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      if (current.length >= 3) {
        setToast("You can compare up to 3 products");
        return current;
      }

      return [...current, id];
    });
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf9] text-[#211c12]">
        <div className="flex min-h-screen items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-[#ead7aa] bg-white shadow-[0_15px_50px_rgba(120,90,30,0.10)]">
              <div className="absolute inset-0 animate-ping rounded-3xl border border-[#d7b35d]/30" />

              <Sparkles className="h-8 w-8 text-[#b8872d]" />
            </div>

            <p className="mt-5 text-sm font-bold text-slate-600">
              Preparing PrimeMatch...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Loading products and preferences
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#fffdf9] text-[#211c12]">
      {/* ===================================================
          TOAST
      =================================================== */}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.95,
            }}
            className="fixed right-5 top-5 z-[100] flex max-w-sm items-center gap-3 rounded-2xl border border-[#e5d19f] bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_18px_60px_rgba(0,0,0,0.12)]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff7e3] text-[#b8872d]">
              <Check className="h-4 w-4" />
            </span>

            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#eee5d3] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfcb] bg-[#fffdf9] text-slate-600 transition hover:border-[#d6b15a] hover:text-[#b8872d]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="hidden h-8 w-px bg-[#eadfcb] sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff5d9] text-[#b8872d]">
                  <Sparkles className="h-4 w-4" />
                </div>

                <h1 className="text-sm font-black tracking-tight text-[#211c12] sm:text-base">
                  PrimeMatch
                </h1>
              </div>

              <p className="hidden text-[10px] font-medium text-slate-400 sm:block">
                Your personalized shopping assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-[#eadfcb] bg-[#fffdf9] px-3 py-2 text-xs font-semibold text-slate-500 sm:flex">
              <Target className="h-3.5 w-3.5 text-[#b8872d]" />
              AI-powered matching
            </div>

            <Link
              href="/dashboard/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfcb] bg-white text-slate-600 transition hover:border-[#d6b15a] hover:text-[#b8872d]"
            >
              <ShoppingCart className="h-4.5 w-4.5" />

              {cartIds.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b8872d] px-1 text-[9px] font-black text-white">
                  {cartIds.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ===================================================
          HERO
      =================================================== */}

      <main>
        <section className="relative overflow-hidden border-b border-[#eee5d3]">
          <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#f7e9c5]/50 blur-3xl" />
          <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-[#f3e4bd]/40 blur-3xl" />

          <div className="relative mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_360px]">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ead39c] bg-[#fff8e8] px-3 py-1.5 text-xs font-bold text-[#9a6c1e]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Personalized shopping intelligence
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="max-w-3xl text-4xl font-black tracking-tight text-[#211c12] sm:text-5xl lg:text-6xl"
                >
                  Find products that{" "}
                  <span className="bg-gradient-to-r from-[#9b6b1f] via-[#c79a3b] to-[#e0bd70] bg-clip-text text-transparent">
                    actually fit you.
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 }}
                  className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base"
                >
                  Tell PrimeMatch what you need, how much you
                  want to spend and what matters most. We'll
                  analyze the available products and show you
                  the strongest matches.
                </motion.p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-[#eee4d1] bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                    <ShieldCheck className="h-4 w-4 text-[#b8872d]" />
                    Budget aware
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-[#eee4d1] bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                    <Star className="h-4 w-4 text-[#b8872d]" />
                    Quality focused
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-[#eee4d1] bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                    <Target className="h-4 w-4 text-[#b8872d]" />
                    Personalized
                  </div>
                </div>
              </div>

              {/* Potential Card */}
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.94,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.15,
                  duration: 0.5,
                }}
                className="rounded-3xl border border-[#eadbbd] bg-white p-6 shadow-[0_20px_70px_rgba(120,90,30,0.09)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                      Live match potential
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      Based on your current choices
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff7e3] text-[#b8872d]">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <span className="text-5xl font-black text-[#211c12]">
                      {livePotential}
                    </span>
                    <span className="ml-1 text-lg font-bold text-[#b8872d]">
                      %
                    </span>
                  </div>

                  <span className="mb-2 rounded-full bg-[#f6f1e6] px-3 py-1 text-[11px] font-bold text-[#80622e]">
                    {livePotential >= 80
                      ? "Excellent"
                      : livePotential >= 65
                      ? "Good"
                      : "Needs tuning"}
                  </span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#f2eee4]">
                  <motion.div
                    animate={{
                      width: `${livePotential}%`,
                    }}
                    transition={{
                      duration: 0.8,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-[#b8872d] to-[#e1bd69]"
                  />
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-400">
                  Your score updates as you change the matching
                  preferences.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =================================================
            BUILDER
        ================================================= */}

        <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-[#eadfcb] bg-white p-5 shadow-[0_15px_55px_rgba(120,90,30,0.06)] sm:p-7 lg:p-8">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff5d9] text-[#b8872d]">
                    <SlidersHorizontal className="h-4 w-4" />
                  </span>

                  <h3 className="text-xl font-black text-[#211c12]">
                    Build your shopping profile
                  </h3>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  Adjust these preferences before finding your
                  Prime Match.
                </p>
              </div>

              <button
                type="button"
                onClick={resetPreferences}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#e7dfcf] px-4 py-2.5 text-xs font-bold text-slate-500 transition hover:border-[#d6b15a] hover:text-[#9a6c1e]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            {/* Purpose */}
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-bold text-[#211c12]">
                  What are you shopping for?
                </label>

                <span className="text-xs text-slate-400">
                  Choose one
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {PURPOSES.map((item) => {
                  const selected = purpose === item.id;

                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setPurpose(item.id);
                        setMatched(false);
                      }}
                      className={`relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-[#d8b45e] bg-[#fff9eb] shadow-[0_8px_25px_rgba(190,145,45,0.12)]"
                          : "border-[#eee5d3] bg-white hover:border-[#dcc487] hover:bg-[#fffdf8]"
                      }`}
                    >
                      {selected && (
                        <motion.div
                          layoutId="purposeActive"
                          className="absolute inset-0 rounded-2xl border-2 border-[#d8b45e]"
                        />
                      )}

                      <div className="relative">
                        <span className="text-xl">
                          {item.icon}
                        </span>

                        <p className="mt-3 text-sm font-black text-[#211c12]">
                          {item.label}
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Search */}
            <div className="mt-8">
              <label className="mb-3 block text-sm font-bold text-[#211c12]">
                Looking for something specific?
              </label>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setMatched(false);
                  }}
                  placeholder="e.g. running shoes, smartphone, headphones..."
                  className="h-12 w-full rounded-xl border border-[#e7dfcf] bg-[#fffdf9] pl-11 pr-4 text-sm text-[#211c12] outline-none transition placeholder:text-slate-400 focus:border-[#d3ae56] focus:ring-4 focus:ring-[#d3ae56]/10"
                />
              </div>
            </div>

            {/* Selects */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {/* Budget */}
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500">
                  Budget
                </label>

                <div className="relative">
                  <select
                    value={budget}
                    onChange={(event) => {
                      setBudget(
                        event.target.value as BudgetKey
                      );
                      setMatched(false);
                    }}
                    className="h-12 w-full appearance-none rounded-xl border border-[#e7dfcf] bg-[#fffdf9] px-4 pr-10 text-sm font-semibold text-[#211c12] outline-none transition focus:border-[#d3ae56] focus:ring-4 focus:ring-[#d3ae56]/10"
                  >
                    {BUDGETS.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500">
                  Category
                </label>

                <div className="relative">
                  <select
                    value={category}
                    onChange={(event) => {
                      setCategory(event.target.value);
                      setMatched(false);
                    }}
                    className="h-12 w-full appearance-none rounded-xl border border-[#e7dfcf] bg-[#fffdf9] px-4 pr-10 text-sm font-semibold text-[#211c12] outline-none transition focus:border-[#d3ae56] focus:ring-4 focus:ring-[#d3ae56]/10"
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

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Brand */}
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500">
                  Brand
                </label>

                <div className="relative">
                  <select
                    value={brand}
                    onChange={(event) => {
                      setBrand(event.target.value);
                      setMatched(false);
                    }}
                    className="h-12 w-full appearance-none rounded-xl border border-[#e7dfcf] bg-[#fffdf9] px-4 pr-10 text-sm font-semibold text-[#211c12] outline-none transition focus:border-[#d3ae56] focus:ring-4 focus:ring-[#d3ae56]/10"
                  >
                    <option value="Any Brand">
                      Any Brand
                    </option>

                    {brands.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Importance */}
            <div className="mt-8 rounded-2xl border border-[#eee5d3] bg-[#fcfaf5] p-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-black text-[#211c12]">
                    What matters most to you?
                  </h4>

                  <p className="mt-1 text-xs text-slate-400">
                    PrimeMatch uses these weights while comparing
                    products.
                  </p>
                </div>

                <div className="mt-2 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#9a6c1e] ring-1 ring-[#ead9ad] sm:mt-0">
                  <Sparkles className="h-3 w-3" />
                  Smart weighting
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {(
                  [
                    ["budget", "Budget", WalletCards],
                    ["quality", "Quality", Award],
                    ["brand", "Brand", Tags],
                    ["rating", "Rating", Star],
                  ] as const
                ).map(
                  ([key, label, Icon]) => (
                    <div key={key}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-[#b8872d]" />
                          <span className="text-xs font-bold text-slate-600">
                            {label}
                          </span>
                        </div>

                        <span className="text-xs font-black text-[#9a6c1e]">
                          {importance[key]}%
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={importance[key]}
                        onChange={(event) => {
                          setImportance((current) => ({
                            ...current,
                            [key]: Number(
                              event.target.value
                            ),
                          }));

                          setMatched(false);
                        }}
                        className="w-full accent-[#b8872d]"
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Selected Chips */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-[#eadfcb] bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-[#b8872d]" />
                {
                  PURPOSES.find(
                    (item) => item.id === purpose
                  )?.label
                }
              </span>

              <span className="rounded-full border border-[#eadfcb] bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600">
                {
                  BUDGETS.find(
                    (item) => item.id === budget
                  )?.label
                }
              </span>

              <span className="rounded-full border border-[#eadfcb] bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600">
                {category === "all"
                  ? "All Categories"
                  : categories.find(
                      (item) => item.id === category
                    )?.name || "Category"}
              </span>

              <span className="rounded-full border border-[#eadfcb] bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600">
                {brand}
              </span>
            </div>

            {/* Find Button */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <motion.button
                type="button"
                onClick={runMatch}
                disabled={matching}
                whileHover={
                  !matching
                    ? {
                        y: -2,
                      }
                    : undefined
                }
                whileTap={
                  !matching
                    ? {
                        scale: 0.98,
                      }
                    : undefined
                }
                className="flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#a87522] via-[#c79a3b] to-[#d8b35e] px-6 text-sm font-black text-white shadow-[0_12px_30px_rgba(183,135,45,0.25)] transition disabled:cursor-not-allowed disabled:opacity-80"
              >
                {matching ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Finding your Prime Match...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Find My Prime Match
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>

              <Link
                href="/dashboard/products"
                className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#e4d9c4] bg-white px-6 text-sm font-bold text-slate-600 transition hover:border-[#d5b15b] hover:text-[#9a6c1e]"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        </section>

        {/* =================================================
            MATCHING ANIMATION
        ================================================= */}

        <AnimatePresence>
          {matching && (
            <motion.section
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="overflow-hidden"
            >
              <div className="mx-auto max-w-[1000px] px-4 pb-12 sm:px-6 lg:px-8">
                <div className="rounded-[32px] border border-[#eadfcb] bg-white p-7 shadow-[0_20px_70px_rgba(120,90,30,0.08)] sm:p-10">
                  <div className="text-center">
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff5d9] text-[#b8872d]"
                    >
                      <Sparkles className="h-7 w-7" />
                    </motion.div>

                    <h3 className="mt-5 text-2xl font-black text-[#211c12]">
                      PrimeMatch is analyzing your choices
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      Comparing products across multiple signals...
                    </p>
                  </div>

                  <div className="mx-auto mt-8 max-w-xl space-y-3">
                    {MATCHING_STAGES.map(
                      (stage, index) => {
                        const Icon = stage.icon;

                        const active =
                          index === matchStage;

                        const complete =
                          index < matchStage;

                        return (
                          <motion.div
                            key={stage.label}
                            initial={{
                              opacity: 0,
                              x: -15,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            transition={{
                              delay: index * 0.08,
                            }}
                            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                              active
                                ? "border-[#dfc27d] bg-[#fff9eb]"
                                : complete
                                ? "border-[#e7dfcf] bg-[#fcfaf5]"
                                : "border-transparent bg-[#faf9f6]"
                            }`}
                          >
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                active
                                  ? "bg-[#b8872d] text-white"
                                  : complete
                                  ? "bg-[#fff1c9] text-[#9a6c1e]"
                                  : "bg-white text-slate-300"
                              }`}
                            >
                              {complete ? (
                                <Check className="h-4 w-4" />
                              ) : active ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Icon className="h-4 w-4" />
                              )}
                            </div>

                            <span
                              className={`text-sm font-bold ${
                                active ||
                                complete
                                  ? "text-[#211c12]"
                                  : "text-slate-400"
                              }`}
                            >
                              {stage.label}
                            </span>

                            {active && (
                              <motion.span
                                initial={{
                                  opacity: 0,
                                }}
                                animate={{
                                  opacity: 1,
                                }}
                                className="ml-auto text-[10px] font-bold uppercase tracking-wider text-[#b8872d]"
                              >
                                Working
                              </motion.span>
                            )}
                          </motion.div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* =================================================
            RESULTS
        ================================================= */}

        <section
          id="match-results"
          className="mx-auto max-w-[1500px] scroll-mt-24 px-4 pb-14 sm:px-6 lg:px-8"
        >
          {/* PRE-MATCH STATE */}
          {!matched && !matching && (
            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-[32px] border border-dashed border-[#dccb9e] bg-gradient-to-br from-[#fffaf0] to-white px-6 py-16 text-center sm:px-10"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#fff3ce] text-[#b8872d] shadow-sm">
                <Target className="h-9 w-9" />
              </div>

              <h3 className="mt-6 text-2xl font-black text-[#211c12]">
                Your matches are waiting
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
                No products are shown yet. Set your preferences
                above and click{" "}
                <span className="font-bold text-[#9a6c1e]">
                  Find My Prime Match
                </span>{" "}
                to start the personalized matching process.
              </p>

              <div className="mx-auto mt-7 flex max-w-md flex-wrap justify-center gap-2">
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-slate-500 ring-1 ring-[#eadfcb]">
                  Budget
                </span>

                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-slate-500 ring-1 ring-[#eadfcb]">
                  Quality
                </span>

                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-slate-500 ring-1 ring-[#eadfcb]">
                  Rating
                </span>

                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-slate-500 ring-1 ring-[#eadfcb]">
                  Brand
                </span>
              </div>
            </motion.div>
          )}

          {/* ERROR */}
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}

          {/* MATCHED */}
          {matched && !matching && (
            <>
              {results.length === 0 ? (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className="rounded-[32px] border border-[#eadfcb] bg-white px-6 py-16 text-center shadow-sm sm:px-10"
                >
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#fff7e3] text-[#b8872d]">
                    <Search className="h-8 w-8" />
                  </div>

                  <h3 className="mt-6 text-2xl font-black text-[#211c12]">
                    We couldn't find an exact match
                  </h3>

                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
                    Try choosing{" "}
                    <span className="font-bold">
                      All Categories
                    </span>{" "}
                    or{" "}
                    <span className="font-bold">
                      Any Brand
                    </span>
                    , or use a broader search term.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setCategory("all");
                      setBrand("Any Brand");
                      setSearch("");
                      setMatched(false);
                    }}
                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#b8872d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a77724]"
                  >
                    <Sparkles className="h-4 w-4" />
                    Adjust Preferences
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* TOP MATCH */}
                  {topMatch && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 25,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.5,
                      }}
                      className="overflow-hidden rounded-[32px] border border-[#ead9ad] bg-white shadow-[0_18px_65px_rgba(120,90,30,0.09)]"
                    >
                      <div className="border-b border-[#eee5d3] bg-gradient-to-r from-[#fffaf0] via-white to-[#fff8e8] px-5 py-4 sm:px-7">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b8872d] text-white shadow-sm">
                              <Crown className="h-5 w-5" />
                            </div>

                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#a67826]">
                                Your Prime Match
                              </p>

                              <p className="text-sm font-bold text-[#211c12]">
                                Strongest match based on your preferences
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 rounded-full bg-[#fff2c9] px-3 py-1.5 text-xs font-black text-[#93671d]">
                              <Sparkles className="h-3.5 w-3.5" />
                              {topMatch.score}% Match
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                        {/* IMAGE */}
                        <div className="relative min-h-[360px] overflow-hidden bg-[#faf8f3]">
                          <ProductImage
                            product={topMatch}
                            className="h-full min-h-[360px] w-full object-contain p-10 transition-transform duration-700 hover:scale-105"
                          />

                          <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
                            {discount(topMatch) > 0 && (
                              <span className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black text-[#a65c1d] shadow-sm">
                                {discount(topMatch)}% OFF
                              </span>
                            )}

                            {topMatch.is_flash_sale && (
                              <span className="flex items-center gap-1 rounded-full bg-[#17130b]/90 px-3 py-1.5 text-[11px] font-black text-white">
                                <Zap className="h-3 w-3" />
                                Flash Deal
                              </span>
                            )}
                          </div>
                        </div>

                        {/* CONTENT */}
                        <div className="p-6 sm:p-8">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-[#f8f4eb] px-3 py-1.5 text-[11px] font-bold text-[#8f6b2b]">
                              {topMatch.brand ||
                                "PrimeCart"}
                            </span>

                            <span className="text-xs text-slate-400">
                              {categoryMap.get(
                                topMatch.category_id || ""
                              ) || "General"}
                            </span>
                          </div>

                          <Link
                            href={`/dashboard/products/${topMatch.id}`}
                            className="mt-4 block text-2xl font-black leading-tight text-[#211c12] transition hover:text-[#b8872d] sm:text-3xl"
                          >
                            {topMatch.name}
                          </Link>

                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                              <Star className="h-4 w-4 fill-[#b8872d] text-[#b8872d]" />
                              {Number(
                                topMatch.rating || 0
                              ).toFixed(1)}
                            </span>

                            <span className="text-xs text-slate-400">
                              {topMatch.reviews_count || 0} reviews
                            </span>

                            {Number(
                              topMatch.stock || 0
                            ) > 0 && (
                              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                                <Check className="h-3.5 w-3.5" />
                                In stock
                              </span>
                            )}
                          </div>

                          <div className="mt-5 flex items-end gap-3">
                            <span className="text-3xl font-black text-[#211c12]">
                              {money(
                                Number(topMatch.price || 0)
                              )}
                            </span>

                            {topMatch.original_price &&
                              topMatch.original_price >
                                topMatch.price && (
                                <span className="pb-1 text-sm text-slate-400 line-through">
                                  {money(
                                    Number(
                                      topMatch.original_price
                                    )
                                  )}
                                </span>
                              )}
                          </div>

                          <div className="mt-7 rounded-2xl border border-[#eee5d3] bg-[#fcfaf5] p-4">
                            <div className="mb-4 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-black text-[#211c12]">
                                  Why this matches
                                </p>

                                <p className="mt-1 text-[10px] text-slate-400">
                                  Based on your current profile
                                </p>
                              </div>

                              <div className="text-2xl font-black text-[#b8872d]">
                                {topMatch.score}%
                              </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <ScoreBar
                                label="Purpose"
                                value={
                                  topMatch.breakdown
                                    .purpose
                                }
                              />

                              <ScoreBar
                                label="Budget"
                                value={
                                  topMatch.breakdown
                                    .budget
                                }
                              />

                              <ScoreBar
                                label="Quality"
                                value={
                                  topMatch.breakdown
                                    .quality
                                }
                              />

                              <ScoreBar
                                label="Rating"
                                value={
                                  topMatch.breakdown
                                    .rating
                                }
                              />
                            </div>
                          </div>

                          <div className="mt-5 space-y-2">
                            {topMatch.reasons.map(
                              (reason) => (
                                <div
                                  key={reason}
                                  className="flex items-center gap-2 text-xs font-semibold text-slate-600"
                                >
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fff2cf] text-[#a97825]">
                                    <Check className="h-3 w-3" />
                                  </span>
                                  {reason}
                                </div>
                              )
                            )}
                          </div>

                          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <button
                              type="button"
                              onClick={() =>
                                addToCart(topMatch)
                              }
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#b8872d] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#a77724]"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Add to Cart
                            </button>

                            <Link
                              href={`/dashboard/products/${topMatch.id}`}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e2d7c2] px-5 py-3.5 text-sm font-black text-slate-600 transition hover:border-[#d2ad56] hover:text-[#9a6c1e]"
                            >
                              View Product
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* SMART ALTERNATIVES */}
                  <div className="mt-10">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a67826]">
                          Smart alternatives
                        </p>

                        <h3 className="mt-1 text-2xl font-black text-[#211c12]">
                          More ways to shop your match
                        </h3>
                      </div>

                      <p className="text-xs text-slate-400">
                        Different strengths, same personalized profile
                      </p>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        {
                          item: bestValue,
                          title: "Best Value",
                          icon: WalletCards,
                          text: "Strong balance of price & match",
                        },
                        {
                          item: budgetPick,
                          title: "Budget Pick",
                          icon: BadgeCheck,
                          text: "Closest fit to your budget",
                        },
                        {
                          item: topRated,
                          title: "Top Rated",
                          icon: Star,
                          text: "Highest shopper rating",
                        },
                        {
                          item: premiumPick,
                          title: "Premium Pick",
                          icon: Crown,
                          text: "Higher-end option",
                        },
                      ].map(
                        ({
                          item,
                          title,
                          icon: Icon,
                          text,
                        }) => {
                          if (!item) return null;

                          return (
                            <motion.div
                              key={`${title}-${item.id}`}
                              whileHover={{
                                y: -4,
                              }}
                              className="rounded-2xl border border-[#eee5d3] bg-white p-4 shadow-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff6df] text-[#b8872d]">
                                  <Icon className="h-4 w-4" />
                                </span>

                                <span className="text-lg font-black text-[#b8872d]">
                                  {item.score}%
                                </span>
                              </div>

                              <p className="mt-4 text-sm font-black text-[#211c12]">
                                {title}
                              </p>

                              <p className="mt-1 text-[11px] text-slate-400">
                                {text}
                              </p>

                              <div className="mt-3 flex items-center justify-between gap-3">
                                <span className="line-clamp-1 text-xs font-semibold text-slate-600">
                                  {item.name}
                                </span>

                                <Link
                                  href={`/dashboard/products/${item.id}`}
                                  className="shrink-0 text-[#b8872d]"
                                >
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              </div>
                            </motion.div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* PRODUCTS */}
                  <div className="mt-12">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#b8872d]" />

                          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a67826]">
                            Matched products
                          </p>
                        </div>

                        <h3 className="mt-1 text-2xl font-black text-[#211c12]">
                          Products that fit your profile
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          {results.length} personalized result
                          {results.length === 1 ? "" : "s"} found
                        </p>
                      </div>

                      <div className="flex items-center gap-2 rounded-full bg-[#f8f4eb] px-3 py-1.5 text-[11px] font-bold text-[#80622e]">
                        <Filter className="h-3 w-3" />
                        Sorted by match score
                      </div>
                    </div>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {results.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          rank={index + 1}
                          onAddToCart={addToCart}
                          onWishlist={toggleWishlist}
                          isWishlisted={wishlist.includes(
                            product.id
                          )}
                          compareIds={compareIds}
                          onToggleCompare={toggleCompare}
                        />
                      ))}
                    </div>
                  </div>

                  {/* COMPARE */}
                  <AnimatePresence>
                    {compareProducts.length >= 2 && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 20,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: 20,
                        }}
                        className="mt-12 overflow-hidden rounded-3xl border border-[#eadfcb] bg-white shadow-sm"
                      >
                        <div className="flex flex-col justify-between gap-3 border-b border-[#eee5d3] bg-[#fcfaf5] p-5 sm:flex-row sm:items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-[#b8872d]" />

                              <h3 className="text-lg font-black text-[#211c12]">
                                Compare your matches
                              </h3>
                            </div>

                            <p className="mt-1 text-xs text-slate-400">
                              Compare up to 3 personalized recommendations.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setCompareIds([])
                            }
                            className="text-xs font-bold text-slate-400 hover:text-[#9a6c1e]"
                          >
                            Clear comparison
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[720px] border-collapse">
                            <thead>
                              <tr>
                                <th className="w-40 border-b border-[#eee5d3] p-4 text-left text-xs font-bold text-slate-400">
                                  Feature
                                </th>

                                {compareProducts.map(
                                  (product) => (
                                    <th
                                      key={product.id}
                                      className="border-b border-[#eee5d3] p-4 text-left"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 shrink-0 rounded-xl bg-[#faf8f3] p-1">
                                          <ProductImage
                                            product={product}
                                            className="h-full w-full object-contain"
                                          />
                                        </div>

                                        <div className="min-w-0">
                                          <p className="line-clamp-2 text-xs font-black text-[#211c12]">
                                            {product.name}
                                          </p>

                                          <p className="mt-1 text-[11px] font-bold text-[#b8872d]">
                                            {product.score}% match
                                          </p>
                                        </div>
                                      </div>
                                    </th>
                                  )
                                )}
                              </tr>
                            </thead>

                            <tbody>
                              {[
                                [
                                  "Price",
                                  (product: MatchProduct) =>
                                    money(
                                      Number(product.price || 0)
                                    ),
                                ],
                                [
                                  "Rating",
                                  (product: MatchProduct) =>
                                    `${Number(
                                      product.rating || 0
                                    ).toFixed(1)} / 5`,
                                ],
                                [
                                  "Budget Fit",
                                  (product: MatchProduct) =>
                                    `${product.breakdown.budget}%`,
                                ],
                                [
                                  "Quality",
                                  (product: MatchProduct) =>
                                    `${product.breakdown.quality}%`,
                                ],
                                [
                                  "Purpose Fit",
                                  (product: MatchProduct) =>
                                    `${product.breakdown.purpose}%`,
                                ],
                              ].map(
                                ([label, getValue]) => (
                                  <tr key={String(label)}>
                                    <td className="border-b border-[#f1ebdf] p-4 text-xs font-bold text-slate-500">
                                      {label}
                                    </td>

                                    {compareProducts.map(
                                      (product) => (
                                        <td
                                          key={product.id}
                                          className="border-b border-[#f1ebdf] p-4 text-sm font-black text-[#211c12]"
                                        >
                                          {(
                                            getValue as (
                                              product: MatchProduct
                                            ) => string
                                          )(product)}
                                        </td>
                                      )
                                    )}
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </>
          )}
        </section>

        {/* =================================================
            HOW IT WORKS
        ================================================= */}

        <section className="border-y border-[#eee5d3] bg-[#fcfaf5]">
          <div className="mx-auto max-w-[1500px] px-4 py-14 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a67826]">
                How PrimeMatch works
              </p>

              <h3 className="mt-2 text-3xl font-black text-[#211c12]">
                From preference to product
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                PrimeMatch evaluates multiple signals instead of
                relying on one simple filter.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                {
                  number: "01",
                  icon: SlidersHorizontal,
                  title: "Tell us what matters",
                  text: "Choose purpose, budget, category, brand and importance levels.",
                },
                {
                  number: "02",
                  icon: Brain,
                  title: "PrimeMatch analyzes",
                  text: "Products are scored across purpose, budget, quality, rating, brand and availability.",
                },
                {
                  number: "03",
                  icon: Crown,
                  title: "Get your match",
                  text: "See your strongest match along with useful alternatives and comparisons.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.number}
                    whileHover={{
                      y: -4,
                    }}
                    className="rounded-3xl border border-[#eadfcb] bg-white p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#d0ad5a]">
                        {item.number}
                      </span>

                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff6df] text-[#b8872d]">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>

                    <h4 className="mt-7 text-lg font-black text-[#211c12]">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {item.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================
            FINAL CTA
        ================================================= */}

        <section className="mx-auto max-w-[1500px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] bg-[#211c12] px-6 py-12 text-center sm:px-10">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#c79a3b]/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-[#dcb969]/15 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c79a3b] text-white">
                <Sparkles className="h-5 w-5" />
              </div>

              <h3 className="mt-5 text-2xl font-black text-white sm:text-3xl">
                Let PrimeMatch do the searching.
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/60">
                Adjust your preferences anytime and run a fresh
                match whenever your shopping needs change.
              </p>

              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("match-results")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#211c12] transition hover:bg-[#fff6df]"
              >
                <Target className="h-4 w-4 text-[#b8872d]" />
                View My Match
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
