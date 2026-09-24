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
  purpose: number;
  budget: number;
  category: number;
  brand: number;
  rating: number;
  availability: number;
};

type MatchProduct = Product & {
  categoryName: string;
  categorySlug: string;
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

type CartItem = {
  id: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
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

const CART_KEY = "primecart-cart";

/* =========================================================
   HELPERS
========================================================= */

function normalize(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function imageUrl(value: string | null) {
  if (!value?.trim()) return null;

  const image = value.trim();

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/")
  ) {
    return image;
  }

  return `/${image}`;
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

function clamp(
  value: number,
  min = 0,
  max = 100
) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

/* =========================================================
   PURPOSE KEYWORDS
========================================================= */

function purposeKeywords(
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
      "shirt",
      "headphone",
      "earbuds",
      "home",
      "kitchen",
    ],

    work: [
      "laptop",
      "computer",
      "keyboard",
      "mouse",
      "monitor",
      "office",
      "desk",
      "study",
      "book",
      "notebook",
      "work",
      "tablet",
      "printer",
      "headphone",
    ],

    entertainment: [
      "gaming",
      "game",
      "speaker",
      "headphone",
      "headset",
      "earbuds",
      "bluetooth",
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
      "sneaker",
      "workout",
      "dumbbell",
      "bottle",
      "fitness",
      "active",
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
      "sunglass",
      "goggle",
      "clothing",
    ],

    home: [
      "home",
      "living",
      "kitchen",
      "coffee",
      "coffee maker",
      "cookware",
      "appliance",
      "kettle",
      "decor",
      "mixer",
      "oven",
      "furniture",
    ],
  };

  return map[purpose] || [];
}

/* =========================================================
   CATEGORY KEYWORDS
========================================================= */

function categoryKeywords(
  categoryName: string
) {
  const value = normalize(categoryName);

  if (
    value.includes("mobile") ||
    value.includes("phone")
  ) {
    return [
      "mobile",
      "phone",
      "smartphone",
      "iphone",
      "android",
      "tablet",
    ];
  }

  if (
    value.includes("fashion") ||
    value.includes("clothing")
  ) {
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
    value.includes("foot wear")
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
    return [
      "watch",
      "smartwatch",
      "time",
      "wrist",
    ];
  }

  if (value.includes("bag")) {
    return [
      "bag",
      "backpack",
      "luggage",
      "wallet",
      "purse",
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
      "washing",
      "microwave",
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
      "play",
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
   BUDGET SCORE
========================================================= */

function calculateBudgetScore(
  price: number,
  budgetId: string
) {
  const selected = BUDGETS.find(
    (item) => item.id === budgetId
  );

  if (!selected) return 70;

  const productPrice = Number(price) || 0;

  if (
    productPrice >= selected.min &&
    productPrice <= selected.max
  ) {
    return 100;
  }

  if (selected.id === "15000-plus") {
    if (productPrice >= 15000) return 100;
    if (productPrice >= 12000) return 88;
    if (productPrice >= 10000) return 78;
    if (productPrice >= 7500) return 65;
    return 48;
  }

  const range =
    Math.max(
      selected.max - selected.min,
      1000
    );

  const distance =
    productPrice < selected.min
      ? selected.min - productPrice
      : productPrice - selected.max;

  const ratio = distance / range;

  if (ratio <= 0.25) return 85;
  if (ratio <= 0.5) return 72;
  if (ratio <= 1) return 55;
  if (ratio <= 1.5) return 40;

  return 25;
}

/* =========================================================
   SCORE PRODUCT
========================================================= */

function scoreProduct(
  product: Product,
  categories: Category[],
  purpose: string,
  budget: string,
  selectedCategory: string,
  selectedBrand: string,
  search: string
): MatchProduct {
  const category = categories.find(
    (item) => item.id === product.category_id
  );

  const categoryName =
    category?.name || "Other";

  const categorySlug =
    category?.slug || "";

  const searchable = normalize(
    [
      product.name,
      product.brand,
      product.short_description,
      product.description,
      categoryName,
      categorySlug,
    ].join(" ")
  );

  /* ---------------- PURPOSE ---------------- */

  const pWords = purposeKeywords(purpose);

  const purposeMatches = pWords.filter(
    (word) =>
      searchable.includes(normalize(word))
  );

  let purposeScore = 48;

  if (purposeMatches.length >= 4) {
    purposeScore = 100;
  } else if (purposeMatches.length === 3) {
    purposeScore = 94;
  } else if (purposeMatches.length === 2) {
    purposeScore = 87;
  } else if (purposeMatches.length === 1) {
    purposeScore = 74;
  }

  /* ---------------- BUDGET ---------------- */

  const budgetScore =
    calculateBudgetScore(
      Number(product.price),
      budget
    );

  /* ---------------- CATEGORY ---------------- */

  let categoryScore = 82;

  if (selectedCategory === "all") {
    categoryScore = 82;
  } else if (
    product.category_id === selectedCategory
  ) {
    categoryScore = 100;
  } else {
    const selected = categories.find(
      (item) =>
        item.id === selectedCategory
    );

    if (
      selected &&
      categoryKeywords(selected.name).some(
        (word) =>
          searchable.includes(
            normalize(word)
          )
      )
    ) {
      categoryScore = 65;
    } else {
      categoryScore = 20;
    }
  }

  /* ---------------- BRAND ---------------- */

  let brandScore = 82;

  if (
    selectedBrand === "Any Brand"
  ) {
    brandScore = 82;
  } else if (
    normalize(product.brand) ===
    normalize(selectedBrand)
  ) {
    brandScore = 100;
  } else {
    brandScore = 18;
  }

  /* ---------------- RATING ---------------- */

  const rating =
    Math.max(
      0,
      Math.min(
        5,
        Number(product.rating) || 0
      )
    );

  const ratingScore = clamp(
    45 + (rating / 5) * 55
  );

  /* ---------------- STOCK ---------------- */

  const availabilityScore =
    product.stock > 10
      ? 100
      : product.stock > 5
        ? 94
        : product.stock > 0
          ? 84
          : 10;

  /* ---------------- SEARCH ---------------- */

  let searchBonus = 0;

  const searchText =
    normalize(search);

  if (searchText) {
    const terms = searchText
      .split(/\s+/)
      .filter(Boolean);

    let matchedTerms = 0;

    for (const term of terms) {
      if (
        searchable.includes(term)
      ) {
        matchedTerms += 1;
      }
    }

    if (terms.length > 0) {
      searchBonus =
        (matchedTerms / terms.length) *
        8;
    }
  }

  /* ---------------- FINAL SCORE ---------------- */

  let score =
    purposeScore * 0.24 +
    budgetScore * 0.26 +
    categoryScore * 0.22 +
    brandScore * 0.10 +
    ratingScore * 0.12 +
    availabilityScore * 0.06;

  score += searchBonus;

  if (product.is_featured) {
    score += 2;
  }

  if (product.is_flash_sale) {
    score += 2;
  }

  if (product.stock <= 0) {
    score -= 20;
  }

  score = clamp(score, 1, 99);

  /* ---------------- REASONS ---------------- */

  const reasons: string[] = [];

  if (budgetScore >= 95) {
    reasons.push(
      "Perfect budget fit"
    );
  } else if (budgetScore >= 78) {
    reasons.push(
      "Comfortably near your budget"
    );
  }

  if (categoryScore >= 95) {
    reasons.push(
      "Exact category match"
    );
  }

  if (purposeScore >= 88) {
    reasons.push(
      "Strongly fits your purpose"
    );
  } else if (purposeScore >= 72) {
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

  if (
    product.is_flash_sale &&
    product.original_price
  ) {
    reasons.push(
      `${getDiscount(
        Number(product.price),
        Number(product.original_price)
      )}% deal`
    );
  }

  if (
    product.stock > 0 &&
    product.stock <= 5
  ) {
    reasons.push(
      `Only ${product.stock} left`
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
    categorySlug,
    matchScore: score,
    reasons: reasons.slice(0, 3),
    breakdown: {
      purpose: purposeScore,
      budget: budgetScore,
      category: categoryScore,
      brand: brandScore,
      rating: ratingScore,
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
        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
          {label}
        </span>

        <span className="text-[10px] font-black text-[#9b762b]">
          {Math.round(value)}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[#eee7d9]">
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
  const [failed, setFailed] =
    useState(false);

  const finalSrc = imageUrl(src);

  if (!finalSrc || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#faf7f0]">
        <div className="text-center">
          <ShoppingCart
            size={34}
            className="mx-auto text-[#d1b77b]"
          />

          <p className="mt-2 text-[10px] font-bold text-gray-400">
            Image unavailable
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={finalSrc}
      alt={alt}
      className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-105"
      onError={() => setFailed(true)}
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
  const discountPercent =
    getDiscount(
      Number(product.price),
      product.original_price
    );

  return (
    <article className="group overflow-hidden rounded-[24px] border border-[#eadfca] bg-white shadow-[0_8px_35px_rgba(91,67,24,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(91,67,24,0.11)]">
      {/* IMAGE */}

      <div className="relative h-[270px] overflow-hidden bg-[#fcfaf5]">
        <ProductImage
          src={product.image_url}
          alt={product.name}
        />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-[#c9a24d] px-2.5 py-1 text-[10px] font-black text-white shadow-sm">
            #{rank}
          </span>

          <span className="rounded-full border border-[#e8dcc4] bg-white/95 px-2.5 py-1 text-[10px] font-black text-[#8d6c2c] backdrop-blur">
            {Math.round(product.matchScore)}% Match
          </span>
        </div>

        <button
          type="button"
          onClick={onWishlist}
          aria-label="Toggle wishlist"
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border bg-white/95 shadow-sm backdrop-blur transition ${
            wished
              ? "border-red-200 text-red-500"
              : "border-[#e8dcc4] text-gray-500 hover:border-[#c9a24d] hover:text-[#9b762b]"
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
        </button>

        {product.is_flash_sale && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-600">
            <Zap size={12} />
            Flash Deal
          </div>
        )}

        {discountPercent > 0 && (
          <div className="absolute bottom-4 right-4 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* CONTENT */}

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-[#ae8432]">
            {product.categoryName}
          </span>

          {product.brand && (
            <span className="truncate text-[10px] font-bold text-gray-400">
              {product.brand}
            </span>
          )}
        </div>

        <Link
          href={`/dashboard/products/${product.id}`}
          className="mt-2 block"
        >
          <h3 className="line-clamp-2 min-h-[48px] text-base font-black leading-6 text-gray-900 transition hover:text-[#9b762b]">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 min-h-[40px] text-xs leading-5 text-gray-500">
          {product.short_description ||
            product.description ||
            "A quality PrimeCart product selected for your preferences."}
        </p>

        {/* RATING */}

        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star
              size={14}
              className="fill-[#d0a548] text-[#d0a548]"
            />

            <span className="text-xs font-black text-gray-800">
              {Number(product.rating || 0).toFixed(1)}
            </span>
          </div>

          <span className="text-[11px] text-gray-400">
            ({product.reviews_count || 0})
          </span>

          {product.stock > 0 && (
            <span className="ml-auto text-[10px] font-bold text-emerald-600">
              In stock
            </span>
          )}

          {product.stock <= 0 && (
            <span className="ml-auto text-[10px] font-bold text-red-500">
              Out of stock
            </span>
          )}
        </div>

        {/* PRICE */}

        <div className="mt-4 flex items-end gap-2">
          <span className="text-xl font-black text-gray-950">
            {money(Number(product.price))}
          </span>

          {product.original_price &&
            product.original_price >
              product.price && (
              <span className="pb-0.5 text-xs font-bold text-gray-400 line-through">
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
            .slice(0, 2)
            .map((reason) => (
              <div
                key={reason}
                className="flex items-center gap-2 text-[11px] font-bold text-gray-600"
              >
                <Check
                  size={13}
                  className="shrink-0 text-[#b38a36]"
                />
                <span className="truncate">
                  {reason}
                </span>
              </div>
            ))}
        </div>

        {/* ACTIONS */}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCart}
            disabled={product.stock <= 0}
            className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-xs font-black transition ${
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
    <div className="overflow-hidden rounded-[24px] border border-[#eadfca] bg-white">
      <div className="h-[270px] animate-pulse bg-[#eeeae2]" />

      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-[#eeeae2]" />
        <div className="h-5 w-full animate-pulse rounded bg-[#eeeae2]" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#eeeae2]" />
        <div className="h-7 w-1/3 animate-pulse rounded bg-[#eeeae2]" />
        <div className="h-11 animate-pulse rounded-xl bg-[#eeeae2]" />
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

  const [actionMessage, setActionMessage] =
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

  /* =======================================================
     LOAD DATA
  ======================================================= */

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

      /*
       * PRODUCTS + CATEGORIES are critical.
       * WISHLIST is optional.
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
          .eq("is_active", true),

        supabase
          .from("categories")
          .select(
            "id,name,slug"
          )
          .order("name", {
            ascending: true,
          }),

        /*
         * IMPORTANT:
         * Wishlist failure should NOT break PrimeMatch.
         */
        supabase
          .from("wishlist")
          .select("product_id")
          .eq(
            "user_id",
            user.id
          ),
      ]);

      /* PRODUCTS */

      if (productResult.error) {
        console.error(
          "PrimeMatch products error:",
          productResult.error
        );

        throw new Error(
          "Unable to load products."
        );
      }

      /* CATEGORIES */

      if (categoryResult.error) {
        console.error(
          "PrimeMatch categories error:",
          categoryResult.error
        );

        /*
         * Do not completely break the page.
         * Product data can still be shown.
         */
      }

      const productData =
        (productResult.data ||
          []) as Product[];

      const categoryData =
        (categoryResult.data ||
          []) as Category[];

      setProducts(productData);
      setCategories(categoryData);

      /* ===================================================
         DYNAMIC BRANDS
      =================================================== */

      const uniqueBrands =
        Array.from(
          new Map(
            productData
              .map((product) => {
                const value =
                  product.brand?.trim();

                if (!value) {
                  return null;
                }

                return [
                  normalize(value),
                  value,
                ] as const;
              })
              .filter(
                (
                  item
                ): item is readonly [
                  string,
                  string
                ] => Boolean(item)
              )
          ).values()
        ).sort((a, b) =>
          a.localeCompare(b)
        );

      setBrands(uniqueBrands);

      /* ===================================================
         WISHLIST
      =================================================== */

      if (wishlistResult.error) {
        /*
         * Wishlist can fail because of:
         * - RLS
         * - table policy
         * - missing table
         *
         * PrimeMatch should still work.
         */
        console.warn(
          "Wishlist unavailable:",
          wishlistResult.error
        );

        setWishlist([]);
      } else {
        setWishlist(
          (wishlistResult.data || [])
            .map(
              (item) =>
                item.product_id
            )
            .filter(Boolean)
        );
      }

      /* ===================================================
         CART
      =================================================== */

      try {
        const saved =
          window.localStorage.getItem(
            CART_KEY
          );

        if (saved) {
          const parsed =
            JSON.parse(saved);

          if (Array.isArray(parsed)) {
            const ids = parsed
              .map(
                (item: CartItem) =>
                  item.productId ||
                  item.id
              )
              .filter(Boolean);

            setCart(ids);
          }
        }
      } catch (cartError) {
        console.warn(
          "Cart restore failed:",
          cartError
        );
      }
    } catch (err) {
      console.error(
        "PrimeMatch load error:",
        err
      );

      setError(
        "Products could not be loaded. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  /* =======================================================
     CLEAR MESSAGE
  ======================================================= */

  useEffect(() => {
    if (!actionMessage) return;

    const timer =
      window.setTimeout(() => {
        setActionMessage("");
      }, 2500);

    return () =>
      window.clearTimeout(timer);
  }, [actionMessage]);

  /* =======================================================
     BRAND VALIDATION
  ======================================================= */

  useEffect(() => {
    if (
      brand !== "Any Brand" &&
      brands.length > 0 &&
      !brands.some(
        (item) =>
          normalize(item) ===
          normalize(brand)
      )
    ) {
      setBrand("Any Brand");
    }
  }, [brands, brand]);

  /* =======================================================
     CATEGORY VALIDATION
  ======================================================= */

  useEffect(() => {
    if (
      category !== "all" &&
      categories.length > 0 &&
      !categories.some(
        (item) =>
          item.id === category
      )
    ) {
      setCategory("all");
    }
  }, [categories, category]);

  /* =======================================================
     MATCH RESULTS
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

    const query =
      normalize(search);

    /*
     * Search:
     * Keep relevant products only when user
     * explicitly searches.
     */
    if (query) {
      const terms =
        query
          .split(/\s+/)
          .filter(Boolean);

      data = data.filter(
        (product) => {
          const searchable =
            normalize(
              [
                product.name,
                product.brand,
                product.short_description,
                product.description,
                product.categoryName,
              ].join(" ")
            );

          return terms.some(
            (term) =>
              searchable.includes(term)
          );
        }
      );
    }

    /*
     * Selected category:
     * Exact category first.
     */
    if (category !== "all") {
      data.sort((a, b) => {
        const aExact =
          a.category_id === category
            ? 1
            : 0;

        const bExact =
          b.category_id === category
            ? 1
            : 0;

        return (
          bExact - aExact ||
          b.matchScore -
            a.matchScore
        );
      });
    } else {
      data.sort(
        (a, b) =>
          b.matchScore -
            a.matchScore ||
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

    /*
     * Preferred brand:
     * Exact brand first.
     */
    if (
      brand !== "Any Brand"
    ) {
      data.sort((a, b) => {
        const aBrand =
          normalize(a.brand) ===
          normalize(brand)
            ? 1
            : 0;

        const bBrand =
          normalize(b.brand) ===
          normalize(brand)
            ? 1
            : 0;

        return (
          bBrand - aBrand ||
          b.matchScore -
            a.matchScore
        );
      });
    }

    /*
     * In-stock products first.
     */
    data.sort((a, b) => {
      const aStock =
        a.stock > 0 ? 1 : 0;

      const bStock =
        b.stock > 0 ? 1 : 0;

      return (
        bStock - aStock ||
        b.matchScore -
          a.matchScore
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

  /* =======================================================
     DISPLAYED PRODUCTS
  ======================================================= */

  const displayedProducts =
    useMemo(() => {
      if (!matched) {
        return results.slice(0, 12);
      }

      return results;
    }, [results, matched]);

  const topMatch =
    results.find(
      (item) => item.stock > 0
    ) || results[0];

  /* =======================================================
     SMART SECTIONS
  ======================================================= */

  const bestValue =
    useMemo(() => {
      return [...results]
        .filter(
          (item) =>
            item.stock > 0
        )
        .sort((a, b) => {
          const aValue =
            a.matchScore +
            Number(a.rating) * 4;

          const bValue =
            b.matchScore +
            Number(b.rating) * 4;

          return bValue - aValue;
        })
        .slice(0, 4);
    }, [results]);

  const highlyRated =
    useMemo(() => {
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
        )
        .slice(0, 4);
    }, [results]);

  /* =======================================================
     RUN MATCH
  ======================================================= */

  async function runMatch() {
    setMatching(true);
    setError("");

    /*
     * Small delay makes the interaction feel
     * like a real recommendation analysis.
     */
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
        .getElementById("match-results")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 80);
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
    setError("");

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  }

  /* =======================================================
     ADD CART
  ======================================================= */

  function addCart(
    product: Product
  ) {
    if (product.stock <= 0) {
      setActionMessage(
        "This product is currently out of stock."
      );
      return;
    }

    try {
      const saved =
        window.localStorage.getItem(
          CART_KEY
        );

      const existing: CartItem[] =
        saved
          ? JSON.parse(saved)
          : [];

      const productId =
        product.id;

      const index =
        existing.findIndex(
          (item) =>
            (item.productId ||
              item.id) ===
            productId
        );

      if (index >= 0) {
        existing[index].quantity =
          Number(
            existing[index]
              .quantity || 0
          ) + 1;
      } else {
        existing.push({
          id: product.id,
          productId:
            product.id,
          name: product.name,
          price: Number(
            product.price
          ),
          quantity: 1,
          image:
            imageUrl(
              product.image_url
            ) || undefined,
        });
      }

      window.localStorage.setItem(
        CART_KEY,
        JSON.stringify(existing)
      );

      setCart((prev) =>
        prev.includes(product.id)
          ? prev
          : [
              ...prev,
              product.id,
            ]
      );

      window.dispatchEvent(
        new Event("cart-updated")
      );

      setActionMessage(
        "Product added to cart."
      );
    } catch (err) {
      console.error(
        "Cart error:",
        err
      );

      setActionMessage(
        "Could not add product to cart."
      );
    }
  }

  /* =======================================================
     CART SYNC
  ======================================================= */

  useEffect(() => {
    function syncCart() {
      try {
        const saved =
          window.localStorage.getItem(
            CART_KEY
          );

        if (!saved) {
          setCart([]);
          return;
        }

        const parsed =
          JSON.parse(saved);

        if (!Array.isArray(parsed)) {
          setCart([]);
          return;
        }

        setCart(
          parsed
            .map(
              (item: CartItem) =>
                item.productId ||
                item.id
            )
            .filter(Boolean)
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
        setActionMessage(
          "Please login to use wishlist."
        );

        return;
      }

      const already =
        wishlist.includes(
          productId
        );

      if (already) {
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

        setWishlist((prev) =>
          prev.filter(
            (id) =>
              id !== productId
          )
        );

        setActionMessage(
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

        setWishlist((prev) => [
          ...prev,
          productId,
        ]);

        setActionMessage(
          "Added to wishlist."
        );
      }
    } catch (err) {
      console.error(
        "Wishlist error:",
        err
      );

      setActionMessage(
        "Wishlist could not be updated."
      );
    }
  }

  /* =======================================================
     SELECTED FILTER LABELS
  ======================================================= */

  const purposeLabel =
    PURPOSES.find(
      (item) =>
        item.id === purpose
    )?.title || "Everyday";

  const budgetLabel =
    BUDGETS.find(
      (item) =>
        item.id === budget
    )?.label || "₹1K – ₹5K";

  const categoryLabel =
    category === "all"
      ? "All Categories"
      : categories.find(
          (item) =>
            item.id === category
        )?.name ||
        "All Categories";

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#fcfaf6] text-gray-950">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-[#eadfca] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e8dcc4] bg-white text-gray-700 transition hover:border-[#c9a24d] hover:text-[#9b762b]"
              aria-label="Back"
            >
              <ArrowLeft size={19} />
            </Link>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c9a24d] text-white shadow-[0_8px_25px_rgba(185,142,54,0.25)]">
              <Sparkles size={19} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-black sm:text-xl">
                PrimeMatch
              </h1>

              <p className="truncate text-[10px] font-bold text-gray-400 sm:text-xs">
                Personalized shopping intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/products"
              className="hidden h-11 items-center gap-2 rounded-xl border border-[#e8dcc4] bg-white px-4 text-sm font-black text-gray-700 transition hover:border-[#c9a24d] hover:text-[#9b762b] sm:flex"
            >
              Browse Products
            </Link>

            <Link
              href="/dashboard/cart"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8dcc4] bg-white text-gray-700 transition hover:border-[#c9a24d] hover:text-[#9b762b]"
            >
              <ShoppingCart size={18} />
            </Link>
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* HERO */}

        <section className="overflow-hidden rounded-[30px] border border-[#e6d7b9] bg-white shadow-[0_15px_55px_rgba(87,63,25,0.07)]">
          <div className="relative px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#fff3d2] blur-3xl" />

            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7ad] bg-[#fff9eb] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#9b762b]">
                <Sparkles size={13} />
                Smart Product Discovery
              </div>

              <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Find products that
                <span className="text-[#b58a32]">
                  {" "}
                  actually fit you.
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Tell PrimeMatch what you need,
                your budget, category and
                preferred brand. We rank products
                using multiple compatibility
                signals.
              </p>
            </div>

            {/* SEARCH */}

            <div className="relative mt-7 max-w-3xl">
              <div className="flex h-14 items-center gap-3 rounded-2xl border border-[#e6dac4] bg-[#fffdf9] px-4 transition focus-within:border-[#c9a24d] focus-within:ring-4 focus-within:ring-[#c9a24d]/10">
                <Search
                  size={19}
                  className="shrink-0 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search e.g. gaming headphones, running shoes, smartphone..."
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-gray-400"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            BUILDER
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-[30px] border border-[#e6d7b9] bg-white shadow-[0_15px_55px_rgba(87,63,25,0.06)]">
          <div className="border-b border-[#eee4d2] px-5 py-6 sm:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b58a32]">
                  Build your match
                </span>

                <h3 className="mt-1 text-2xl font-black">
                  Tell us what you need
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <BadgeCheck
                  size={15}
                  className="text-[#b58a32]"
                />
                Personalized ranking
              </div>
            </div>
          </div>

          <div className="space-y-8 p-5 sm:p-8">
            {/* PURPOSE */}

            <div>
              <div className="mb-4">
                <span className="text-xs font-black text-gray-400">
                  01.
                </span>

                <span className="ml-2 text-sm font-black">
                  What are you shopping for?
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PURPOSES.map(
                  (item) => {
                    const active =
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
                        className={`group relative rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-[#c9a24d] bg-[#fff9eb] shadow-[0_8px_25px_rgba(185,142,54,0.10)]"
                            : "border-[#e8dfcf] bg-white hover:border-[#d7c18d] hover:bg-[#fffdf8]"
                        }`}
                      >
                        {active && (
                          <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#c9a24d] text-white">
                            <Check size={13} />
                          </div>
                        )}

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                            active
                              ? "bg-[#c9a24d] text-white"
                              : "bg-[#fff7e3] text-[#ae8432]"
                          }`}
                        >
                          {item.icon}
                        </div>

                        <p className="mt-3 text-sm font-black">
                          {item.title}
                        </p>

                        <p className="mt-1 text-xs font-medium text-gray-400">
                          {item.subtitle}
                        </p>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* BUDGET */}

            <div>
              <div className="mb-4">
                <span className="text-xs font-black text-gray-400">
                  02.
                </span>

                <span className="ml-2 text-sm font-black">
                  What is your budget?
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {BUDGETS.map(
                  (item) => {
                    const active =
                      budget ===
                      item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setBudget(
                            item.id
                          )
                        }
                        className={`relative flex h-14 items-center justify-between rounded-2xl border px-4 text-left transition ${
                          active
                            ? "border-[#c9a24d] bg-[#fff9eb] text-[#956f27]"
                            : "border-[#e8dfcf] bg-white hover:border-[#d7c18d]"
                        }`}
                      >
                        <span className="text-sm font-black">
                          {item.label}
                        </span>

                        {active && (
                          <Check size={17} />
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* CATEGORY + BRAND */}

            <div className="grid gap-6 lg:grid-cols-2">
              {/* CATEGORY */}

              <div>
                <div className="mb-3">
                  <span className="text-xs font-black text-gray-400">
                    03.
                  </span>

                  <span className="ml-2 text-sm font-black">
                    Category
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value
                      )
                    }
                    className="h-14 w-full appearance-none rounded-2xl border border-[#e8dfcf] bg-[#fffdf9] px-4 pr-11 text-sm font-black text-gray-800 outline-none transition hover:border-[#d7c18d] focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
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

                {categories.length ===
                  0 &&
                  !loading && (
                    <p className="mt-2 text-[11px] font-semibold text-amber-600">
                      Categories could not
                      be loaded. Products
                      are still available.
                    </p>
                  )}
              </div>

              {/* BRAND */}

              <div>
                <div className="mb-3">
                  <span className="text-xs font-black text-gray-400">
                    04.
                  </span>

                  <span className="ml-2 text-sm font-black">
                    Preferred brand
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={brand}
                    onChange={(e) =>
                      setBrand(
                        e.target.value
                      )
                    }
                    className="h-14 w-full appearance-none rounded-2xl border border-[#e8dfcf] bg-[#fffdf9] px-4 pr-11 text-sm font-black text-gray-800 outline-none transition hover:border-[#d7c18d] focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
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

                {brands.length ===
                  0 &&
                  !loading && (
                    <p className="mt-2 text-[11px] font-semibold text-gray-400">
                      No product brands
                      found in your
                      active products.
                    </p>
                  )}
              </div>
            </div>

            {/* SELECTED FILTERS */}

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#f7f2e8] px-3 py-1.5 text-[11px] font-bold text-[#8e6d31]">
                {purposeLabel}
              </span>

              <span className="rounded-full bg-[#f7f2e8] px-3 py-1.5 text-[11px] font-bold text-[#8e6d31]">
                {budgetLabel}
              </span>

              <span className="rounded-full bg-[#f7f2e8] px-3 py-1.5 text-[11px] font-bold text-[#8e6d31]">
                {categoryLabel}
              </span>

              <span className="rounded-full bg-[#f7f2e8] px-3 py-1.5 text-[11px] font-bold text-[#8e6d31]">
                {brand}
              </span>

              {search && (
                <span className="rounded-full bg-[#fff3d2] px-3 py-1.5 text-[11px] font-bold text-[#8e6d31]">
                  Search: {search}
                </span>
              )}
            </div>

            {/* ACTIONS */}

            <div className="flex flex-col gap-3 border-t border-[#eee4d2] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e6dccb] bg-white px-5 text-sm font-black text-gray-600 transition hover:border-[#c9a24d] hover:text-[#9b762b]"
              >
                <RefreshCw size={15} />
                Reset
              </button>

              <button
                type="button"
                onClick={runMatch}
                disabled={
                  loading ||
                  matching ||
                  products.length ===
                    0
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c39a43] px-7 text-sm font-black text-white shadow-[0_10px_30px_rgba(185,142,54,0.22)] transition hover:bg-[#b58d3f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {matching ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Finding your matches...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
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
            ERROR
        ================================================= */}

        {error && (
          <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-red-700">
                  {error}
                </p>

                <p className="mt-1 text-xs font-medium text-red-500">
                  Please check your Supabase
                  connection and try again.
                </p>
              </div>

              <button
                type="button"
                onClick={loadData}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-black text-white hover:bg-red-700"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            </div>
          </section>
        )}

        {/* =================================================
            TOP MATCH
        ================================================= */}

        {matched &&
          topMatch && (
            <section
              id="match-results"
              className="mt-8 scroll-mt-28"
            >
              <div className="mb-5">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b58a32]">
                  Your #1 result
                </span>

                <h3 className="mt-1 text-2xl font-black sm:text-3xl">
                  Your Prime Match
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  The product with the strongest
                  compatibility score based on
                  your current preferences.
                </p>
              </div>

              <div className="overflow-hidden rounded-[30px] border border-[#dfcfab] bg-white shadow-[0_20px_70px_rgba(86,63,22,0.09)]">
                <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
                  {/* IMAGE */}

                  <div className="relative min-h-[350px] bg-[#fcfaf5] lg:min-h-[480px]">
                    <ProductImage
                      src={
                        topMatch.image_url
                      }
                      alt={topMatch.name}
                    />

                    <div className="absolute left-5 top-5 rounded-full bg-[#c9a24d] px-3 py-1.5 text-[10px] font-black text-white">
                      BEST MATCH
                    </div>

                    <div className="absolute bottom-5 left-5 rounded-2xl border border-[#eadfca] bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
                      <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">
                        Match Score
                      </p>

                      <p className="mt-1 text-3xl font-black text-[#9b762b]">
                        {Math.round(
                          topMatch.matchScore
                        )}
                        %
                      </p>
                    </div>
                  </div>

                  {/* DETAILS */}

                  <div className="p-6 sm:p-8 lg:p-10">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#fff4d9] px-3 py-1.5 text-[10px] font-black text-[#956f27]">
                        {topMatch.categoryName}
                      </span>

                      {topMatch.brand && (
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-black text-gray-600">
                          {topMatch.brand}
                        </span>
                      )}

                      {topMatch.is_flash_sale && (
                        <span className="rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-black text-red-600">
                          Flash Deal
                        </span>
                      )}
                    </div>

                    <h3 className="mt-5 text-2xl font-black leading-tight sm:text-3xl">
                      {topMatch.name}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                      {topMatch.short_description ||
                        topMatch.description ||
                        "A personalized PrimeMatch recommendation for you."}
                    </p>

                    {/* PRICE */}

                    <div className="mt-5 flex items-end gap-3">
                      <span className="text-3xl font-black">
                        {money(
                          Number(
                            topMatch.price
                          )
                        )}
                      </span>

                      {topMatch.original_price &&
                        topMatch.original_price >
                          topMatch.price && (
                          <>
                            <span className="text-sm font-bold text-gray-400 line-through">
                              {money(
                                Number(
                                  topMatch.original_price
                                )
                              )}
                            </span>

                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
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

                    {/* REASONS */}

                    <div className="mt-6">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-400">
                        Why this matches
                      </p>

                      <div className="mt-3 space-y-2">
                        {topMatch.reasons.map(
                          (reason) => (
                            <div
                              key={reason}
                              className="flex items-center gap-2 text-sm font-bold text-gray-700"
                            >
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fff4d9] text-[#a87f30]">
                                <Check
                                  size={13}
                                />
                              </div>

                              {reason}
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* BREAKDOWN */}

                    <div className="mt-7 rounded-2xl border border-[#eee4d2] bg-[#fffdf9] p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-400">
                          Match breakdown
                        </p>

                        <Target
                          size={16}
                          className="text-[#b58a32]"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <ScoreBar
                          label="Purpose"
                          value={
                            topMatch
                              .breakdown
                              .purpose
                          }
                        />

                        <ScoreBar
                          label="Budget"
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
                          label="Brand"
                          value={
                            topMatch
                              .breakdown
                              .brand
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
                          label="Availability"
                          value={
                            topMatch
                              .breakdown
                              .availability
                          }
                        />
                      </div>
                    </div>

                    {/* BUTTONS */}

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() =>
                          addCart(
                            topMatch
                          )
                        }
                        disabled={
                          topMatch.stock <=
                          0
                        }
                        className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black text-white transition ${
                          topMatch.stock <=
                          0
                            ? "cursor-not-allowed bg-gray-300"
                            : cart.includes(
                                  topMatch.id
                                )
                              ? "bg-emerald-600"
                              : "bg-[#c9a24d] hover:bg-[#b58d3f]"
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
                        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e1d4bb] bg-white px-6 text-sm font-black text-gray-700 transition hover:border-[#c9a24d] hover:text-[#9b762b]"
                      >
                        View Details
                        <ArrowRight
                          size={16}
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

        {/* =================================================
            SMART SECTIONS
        ================================================= */}

        {matched &&
          results.length > 0 && (
            <>
              {/* BEST VALUE */}

              {bestValue.length > 0 && (
                <section className="mt-10">
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b58a32]">
                        Best value
                      </span>

                      <h3 className="mt-1 text-2xl font-black">
                        Strong matches for the money
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Products balancing match,
                        quality and price.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {bestValue.map(
                      (product, index) => (
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
                        />
                      )
                    )}
                  </div>
                </section>
              )}

              {/* HIGHLY RATED */}

              {highlyRated.length > 0 && (
                <section className="mt-12">
                  <div className="mb-5">
                    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b58a32]">
                      Quality signal
                    </span>

                    <h3 className="mt-1 text-2xl font-black">
                      Highly rated matches
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Strong customer ratings among
                      your matching products.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {highlyRated.map(
                      (product, index) => (
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
                        />
                      )
                    )}
                  </div>
                </section>
              )}
            </>
          )}

        {/* =================================================
            ALL RESULTS
        ================================================= */}

        <section
          id="match-results"
          className="mt-12 scroll-mt-28"
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b58a32]">
                  {matched
                    ? "More matches"
                    : "Explore"}
                </span>

                {matched && (
                  <span className="rounded-full bg-[#fff4d9] px-2.5 py-1 text-[10px] font-black text-[#956f27]">
                    Smart Ranked
                  </span>
                )}
              </div>

              <h3 className="mt-1 text-2xl font-black sm:text-3xl">
                {matched
                  ? "Your ranked products"
                  : "More products you may like"}
              </h3>

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
                  setMatched(false)
                }
                className="inline-flex items-center gap-2 text-xs font-black text-[#9b762b] hover:underline"
              >
                <RefreshCw size={14} />
                Change Preferences
              </button>
            )}
          </div>

          {/* LOADING */}

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
            /* EMPTY */

            <div className="rounded-[28px] border border-[#eadfca] bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32]">
                <Search size={27} />
              </div>

              <h3 className="mt-5 text-xl font-black">
                No matching products found
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
                Try changing the category,
                brand, budget or search term.
                You can also reset your
                preferences and start again.
              </p>

              <button
                type="button"
                onClick={reset}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#c9a24d] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b58d3f]"
              >
                <RefreshCw size={15} />
                Reset Preferences
              </button>
            </div>
          ) : (
            /* PRODUCT GRID */

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayedProducts.map(
                (product, index) => (
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
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* =================================================
            HOW IT WORKS
        ================================================= */}

        <section className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b58a32]">
              THE PRIME MATCH SYSTEM
            </span>

            <h3 className="mt-2 text-2xl font-black sm:text-3xl">
              A smarter way to discover products.
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              PrimeMatch compares your shopping
              preferences against product data and
              creates a transparent compatibility
              ranking.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                number: "01",
                icon: (
                  <Target size={20} />
                ),
                title:
                  "Set your preferences",
                text:
                  "Choose your purpose, budget, category and preferred brand.",
              },
              {
                number: "02",
                icon: (
                  <TrendingUp
                    size={20}
                  />
                ),
                title:
                  "Products are analyzed",
                text:
                  "PrimeMatch compares relevance, budget, category, brand, rating and availability.",
              },
              {
                number: "03",
                icon: (
                  <Sparkles
                    size={20}
                  />
                ),
                title:
                  "Get your matches",
                text:
                  "Your strongest products appear first with transparent match reasons.",
              },
            ].map((item) => (
              <div
                key={
                  item.number
                }
                className="rounded-[24px] border border-[#eadfca] bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff6df] text-[#b58a32]">
                    {item.icon}
                  </div>

                  <span className="text-3xl font-black text-[#f0e8d7]">
                    {item.number}
                  </span>
                </div>

                <h4 className="mt-6 text-base font-black">
                  {item.title}
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================
            FINAL CTA
        ================================================= */}

        <section className="mt-10 overflow-hidden rounded-[28px] border border-[#dfc98f] bg-[#fff7e4]">
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
                Want to explore another match?
              </h3>

              <p className="mt-1 max-w-xl text-sm text-gray-500">
                Change your preferences and
                PrimeMatch will recalculate the
                recommendations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setMatched(false);

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-6 text-sm font-black text-white transition hover:bg-[#b58d3f]"
            >
              <Sparkles size={16} />
              Change Preferences
            </button>
          </div>
        </section>

        <div className="h-12" />
      </main>

      {/* =================================================
          TOAST
      ================================================= */}

      {actionMessage && (
        <div className="fixed bottom-5 right-5 z-[80] max-w-[calc(100vw-2rem)] rounded-2xl border border-[#dfc98f] bg-white px-4 py-3 text-xs font-black text-gray-800 shadow-[0_20px_60px_rgba(80,60,20,0.18)]">
          {actionMessage}
        </div>
      )}
    </div>
  );
}
