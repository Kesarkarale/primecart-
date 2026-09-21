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

type Budget = {
  id: string;
  label: string;
  min: number;
  max: number;
};

type Breakdown = {
  budget: number;
  category: number;
  purpose: number;
  rating: number;
  brand: number;
  availability: number;
};

type MatchedProduct = Product & {
  categoryName: string;
  matchScore: number;
  reasons: string[];
  breakdown: Breakdown;
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
    max: Number.POSITIVE_INFINITY,
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
    "home",
    "kitchen",
    "wallet",
    "speaker",
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
    "tv",
    "controller",
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
    "training",
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

  return image.startsWith("/") ? image : `/${image}`;
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
  const value = normalize(categoryName);

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

function scoreBudget(
  price: number,
  budget: Budget | undefined,
) {
  if (!budget) return 65;

  if (
    price >= budget.min &&
    price <= budget.max
  ) {
    return 100;
  }

  if (price < budget.min) {
    const difference = budget.min - price;
    const base = Math.max(budget.min, 1);

    return Math.max(
      40,
      Math.round(
        100 - (difference / base) * 50,
      ),
    );
  }

  if (!Number.isFinite(budget.max)) {
    return price <= budget.min * 1.25
      ? 85
      : 65;
  }

  const difference = price - budget.max;
  const base = Math.max(budget.max, 1);

  return Math.max(
    25,
    Math.round(
      100 - (difference / base) * 70,
    ),
  );
}

function scorePurpose(
  productText: string,
  purpose: string,
) {
  const keywords =
    PURPOSE_KEYWORDS[purpose] || [];

  if (!keywords.length) return 60;

  const hits = keywords.filter((keyword) =>
    productText.includes(keyword),
  ).length;

  if (hits >= 3) return 100;
  if (hits === 2) return 92;
  if (hits === 1) return 78;

  return 52;
}

function scoreCategory(
  product: Product,
  category: Category | undefined,
  selectedCategory: string,
  productText: string,
) {
  if (selectedCategory === "all") {
    return 75;
  }

  if (product.category_id === selectedCategory) {
    return 100;
  }

  if (category) {
    const keywords =
      getCategoryKeywords(category.name);

    const hits = keywords.filter((keyword) =>
      productText.includes(keyword),
    ).length;

    if (hits >= 2) return 78;
    if (hits === 1) return 65;
  }

  return 25;
}

function scoreRating(
  rating: number,
  reviews: number,
) {
  const safeRating = Math.max(
    0,
    Math.min(5, rating),
  );

  const ratingScore =
    (safeRating / 5) * 100;

  const confidence = Math.min(
    1,
    Math.log10(
      Math.max(1, reviews) + 1,
    ) / 3,
  );

  return Math.round(
    ratingScore *
      (0.75 + confidence * 0.25),
  );
}

function scoreProduct(
  product: Product,
  categories: Category[],
  selectedPurpose: string,
  selectedBudget: string,
  selectedCategory: string,
  selectedBrand: string,
): MatchedProduct {
  const productCategory =
    categories.find(
      (item) =>
        item.id === product.category_id,
    );

  const productText = [
    product.name,
    product.brand,
    product.short_description,
    product.description,
    productCategory?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const budget = BUDGETS.find(
    (item) => item.id === selectedBudget,
  );

  const budgetScore = scoreBudget(
    Number(product.price),
    budget,
  );

  const purposeScore = scorePurpose(
    productText,
    selectedPurpose,
  );

  const categoryScore = scoreCategory(
    product,
    categories.find(
      (item) => item.id === selectedCategory,
    ),
    selectedCategory,
    productText,
  );

  const brandScore =
    selectedBrand === "Any Brand"
      ? 80
      : normalize(product.brand) ===
          normalize(selectedBrand)
        ? 100
        : 30;

  const ratingScore = scoreRating(
    Number(product.rating || 0),
    Number(product.reviews_count || 0),
  );

  const availabilityScore =
    Number(product.stock) > 10
      ? 100
      : Number(product.stock) > 0
        ? 82
        : 0;

  let score = Math.round(
    budgetScore * 0.28 +
      categoryScore * 0.2 +
      purposeScore * 0.22 +
      ratingScore * 0.15 +
      brandScore * 0.08 +
      availabilityScore * 0.07,
  );

  if (product.is_featured) score += 2;

  if (product.is_flash_sale) score += 2;

  if (
    getDiscount(
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

  if (budgetScore >= 90) {
    reasons.push("Excellent budget fit");
  } else if (budgetScore >= 75) {
    reasons.push("Close to your budget");
  }

  if (categoryScore >= 95) {
    reasons.push("Exact category match");
  } else if (categoryScore >= 75) {
    reasons.push("Relevant category");
  }

  if (purposeScore >= 90) {
    reasons.push(
      "Strongly fits your purpose",
    );
  } else if (purposeScore >= 75) {
    reasons.push("Matches your use case");
  }

  if (ratingScore >= 90) {
    reasons.push("Highly rated");
  }

  if (brandScore >= 95) {
    reasons.push("Preferred brand");
  }

  if (product.is_flash_sale) {
    reasons.push("Flash deal available");
  }

  if (availabilityScore >= 90) {
    reasons.push("Good stock availability");
  }

  if (!reasons.length) {
    reasons.push("Good overall match");
  }

  return {
    ...product,
    categoryName:
      productCategory?.name ||
      "PrimeCart Pick",
    matchScore: score,
    reasons: reasons.slice(0, 3),
    breakdown: {
      budget: budgetScore,
      category: categoryScore,
      purpose: purposeScore,
      rating: ratingScore,
      brand: brandScore,
      availability: availabilityScore,
    },
  };
}

function CircularScore({
  score,
}: {
  score: number;
}) {
  const radius = 44;
  const circumference =
    2 * Math.PI * radius;

  const dash =
    circumference -
    (score / 100) * circumference;

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 110 110"
      >
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-[#eadfca] dark:text-[#3a3125]"
        />

        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dash}
          className="text-[#c9a24d]"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-[#8f6d2b] dark:text-[#d9b86c]">
          {score}%
        </span>

        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
          Match
        </span>
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

  const [matched, setMatched] =
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

  const [cart, setCart] =
    useState<string[]>([]);

  const [toast, setToast] =
    useState("");

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const syncCart = () => {
      const saved =
        localStorage.getItem(
          "primecart-cart",
        );

      if (!saved) {
        setCart([]);
        return;
      }

      try {
        const items =
          JSON.parse(saved) as {
            id: string;
          }[];

        setCart(
          items.map((item) => item.id),
        );
      } catch {
        setCart([]);
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
        2200,
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
          .eq("is_active", true),

        supabase
          .from("categories")
          .select(
            "id, name, slug",
          )
          .order("name"),

        supabase
          .from("wishlist")
          .select("product_id")
          .eq(
            "user_id",
            user.id,
          ),
      ]);

      if (productsResponse.error) {
        throw productsResponse.error;
      }

      if (categoriesResponse.error) {
        throw categoriesResponse.error;
      }

      if (wishlistResponse.error) {
        throw wishlistResponse.error;
      }

      const productData =
        (productsResponse.data ||
          []) as Product[];

      const categoryData =
        (categoriesResponse.data ||
          []) as Category[];

      setProducts(productData);
      setCategories(categoryData);

      const uniqueBrands =
        Array.from(
          new Set(
            productData
              .map((item) =>
                item.brand?.trim(),
              )
              .filter(
                (
                  item,
                ): item is string =>
                  Boolean(item),
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
        "We couldn't load your Prime Match products. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const matchedProducts =
    useMemo(() => {
      return products
        .map((product) =>
          scoreProduct(
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
    }, [
      products,
      categories,
      purpose,
      budget,
      category,
      brand,
    ]);

  const topMatch =
    matchedProducts[0];

  const visibleProducts =
    matched
      ? matchedProducts.slice(
          0,
          12,
        )
      : matchedProducts.slice(
          0,
          8,
        );

  const selectedBudget =
    BUDGETS.find(
      (item) =>
        item.id === budget,
    );

  const averageMatch =
    useMemo(() => {
      if (!matchedProducts.length) {
        return 0;
      }

      const count = Math.min(
        8,
        matchedProducts.length,
      );

      return Math.round(
        matchedProducts
          .slice(0, count)
          .reduce(
            (sum, item) =>
              sum +
              item.matchScore,
            0,
          ) / count,
      );
    }, [matchedProducts]);

  async function runMatch() {
    if (!products.length) {
      setToast(
        "No active products available.",
      );
      return;
    }

    setMatching(true);
    setMatched(false);

    await new Promise(
      (resolve) =>
        window.setTimeout(
          resolve,
          900,
        ),
    );

    setMatched(true);
    setMatching(false);

    window.setTimeout(() => {
      document
        .getElementById(
          "results",
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
    setMatched(false);
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
      wishlist.includes(
        productId,
      );

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
          "Couldn't remove from wishlist.",
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
      if (error.code === "23505") {
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
        "Couldn't add to wishlist.",
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
    if (Number(product.stock) <= 0) {
      setToast(
        "This product is currently out of stock.",
      );

      return;
    }

    try {
      const saved =
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

      if (saved) {
        try {
          items = JSON.parse(saved);
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
          Number(product.stock)
        ) {
          existing.quantity += 1;
        } else {
          setToast(
            "You reached the available stock limit.",
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

      setCart(
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
        "Couldn't add this product to cart.",
      );
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-2xl border border-[#d9c28b] bg-white px-5 py-3 text-sm font-bold text-[#8f6d2b] shadow-2xl dark:bg-[#181612] dark:text-[#d9b86c]">
          {toast}
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#eadfca] bg-white/90 backdrop-blur-xl dark:border-[#393126] dark:bg-[#12100d]/90">
        <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5dccb] text-gray-600 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] hover:text-[#9b762b] dark:border-[#393126] dark:text-gray-300 dark:hover:bg-[#211d15]"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a24d] text-white shadow-sm">
              <Sparkles size={18} />
            </div>

            <div>
              <h1 className="text-base font-black">
                Prime Match
              </h1>

              <p className="hidden text-[10px] text-gray-400 sm:block">
                Personal shopping intelligence
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/products"
            className="hidden items-center gap-2 rounded-xl border border-[#e5dccb] px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] dark:border-[#393126] dark:text-gray-200 dark:hover:bg-[#211d15] sm:flex"
          >
            Browse Products
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[30px] border border-[#eadfca] bg-white shadow-sm dark:border-[#393126] dark:bg-[#181612]">
          <div className="absolute -right-32 -top-40 h-[440px] w-[440px] rounded-full bg-[#f4e3b4]/40 blur-3xl dark:bg-[#8a6a2d]/10" />

          <div className="absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-[#f8efdc] blur-3xl dark:bg-[#3a3020]/40" />

          <div className="relative grid items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#eadfca] bg-[#fffaf0] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#9b762b] dark:border-[#4a3d29] dark:bg-[#211d15] dark:text-[#d9b86c]">
                <Sparkles size={13} />
                PrimeCart Intelligence
              </div>

              <h2 className="mt-5 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[58px]">
                Find products that
                <span className="block text-[#b58a32]">
                  actually fit you.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-gray-500 dark:text-gray-400 sm:text-base">
                Tell Prime Match what you need,
                what you want to spend, and what
                matters most. We compare your
                preferences with your live
                PrimeCart catalogue.
              </p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {[
                  ["Personalized", Target],
                  ["Smart scoring", TrendingUp],
                  ["Real products", BadgeCheck],
                ].map(([label, Icon]) => {
                  const IconComponent =
                    Icon as typeof Target;

                  return (
                    <span
                      key={label as string}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#eee5d5] bg-[#fffdf8] px-3 py-2 text-xs font-bold dark:border-[#393126] dark:bg-[#211d15]"
                    >
                      <IconComponent
                        size={14}
                        className="text-[#c9a24d]"
                      />

                      {label as string}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="hidden justify-center lg:flex">
              <div className="relative flex h-[330px] w-[330px] items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-[#eadfca] dark:border-[#393126]" />

                <div className="absolute inset-8 rounded-full border border-dashed border-[#d4b56b]" />

                <div className="absolute inset-16 rounded-full bg-[#fffaf0] dark:bg-[#211d15]" />

                <div className="relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-[34px] bg-[#c9a24d] text-white shadow-2xl shadow-[#c9a24d]/25">
                  <Sparkles size={30} />

                  <span className="mt-2 text-4xl font-black">
                    AI
                  </span>

                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                    Match Engine
                  </span>
                </div>

                <div className="absolute left-0 top-16 rounded-2xl border border-[#eadfca] bg-white px-4 py-3 shadow-lg dark:border-[#393126] dark:bg-[#181612]">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Budget
                  </p>

                  <p className="mt-1 text-xs font-black">
                    Fit checked
                  </p>
                </div>

                <div className="absolute bottom-10 right-0 rounded-2xl border border-[#eadfca] bg-white px-4 py-3 shadow-lg dark:border-[#393126] dark:bg-[#181612]">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Results
                  </p>

                  <p className="mt-1 text-xs font-black text-emerald-600">
                    Ranked for you
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PREFERENCES */}
        <section className="mt-6 overflow-hidden rounded-[26px] border border-[#eadfca] bg-white shadow-sm dark:border-[#393126] dark:bg-[#181612]">
          <div className="border-b border-[#eee6d7] px-5 py-5 dark:border-[#393126] sm:px-7">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff6df] text-[#b58a32] dark:bg-[#211d15]">
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

              <div className="hidden items-center gap-2 text-xs font-bold text-gray-400 sm:flex">
                <CircleHelp size={14} />
                No new data required
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
                          ? "border-[#c9a24d] bg-[#fffaf0] shadow-sm dark:bg-[#211d15]"
                          : "border-[#e9e1d2] hover:border-[#d5b76d] hover:bg-[#fffdf8] dark:border-[#393126] dark:hover:bg-[#211d15]"
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
                            : "bg-[#f7f3eb] text-[#9b762b] dark:bg-[#211d15]"
                        }`}
                      >
                        {item.icon}
                      </span>

                      <p className="mt-3 text-sm font-black">
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

                <span className="rounded-full bg-[#fff7e4] px-2.5 py-1 text-[10px] font-bold text-[#956f27] dark:bg-[#211d15] dark:text-[#d9b86c]">
                  {selectedBudget?.label ||
                    "Select range"}
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
                          ? "border-[#c9a24d] bg-[#fffaf0] text-[#956f27] dark:bg-[#211d15] dark:text-[#d9b86c]"
                          : "border-[#e9e1d2] hover:border-[#d5b76d] dark:border-[#393126]"
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
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black">
                  03. Product category
                </label>

                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value,
                      )
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-[#e5dccb] bg-[#fffdf9] px-4 pr-10 text-sm font-semibold outline-none focus:border-[#c9a24d] dark:border-[#393126] dark:bg-[#181612]"
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
                      ),
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
                      setBrand(
                        e.target.value,
                      )
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-[#e5dccb] bg-[#fffdf9] px-4 pr-10 text-sm font-semibold outline-none focus:border-[#c9a24d] dark:border-[#393126] dark:bg-[#181612]"
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
                      ),
                    )}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#eee6d7] pt-6 dark:border-[#393126] sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={resetPreferences}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e5dccb] px-5 text-sm font-bold text-gray-600 transition hover:bg-[#fffaf0] dark:border-[#393126] dark:text-gray-300 dark:hover:bg-[#211d15]"
              >
                <RefreshCw size={16} />
                Reset
              </button>

              <button
                type="button"
                disabled={
                  loading ||
                  matching ||
                  products.length === 0
                }
                onClick={() =>
                  void runMatch()
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-7 text-sm font-black text-white shadow-lg shadow-[#c9a24d]/15 transition hover:bg-[#b58d3f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {matching ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Analyzing Catalogue...
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
          <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  void loadData()
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white"
              >
                <RefreshCw size={15} />
                Retry
              </button>
            </div>
          </section>
        )}

        {/* TOP MATCH */}
        {matched && topMatch && (
          <section className="mt-6 overflow-hidden rounded-[26px] border border-[#dfc98f] bg-[#fffaf0] dark:border-[#4d402b] dark:bg-[#211d15]">
            <div className="border-b border-[#eadfca] px-5 py-4 dark:border-[#4d402b] sm:px-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
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

                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <span>
                    {matchedProducts.length}{" "}
                    products analyzed
                  </span>

                  <span className="h-1 w-1 rounded-full bg-gray-300" />

                  <span>
                    Avg. {averageMatch}%
                    {" "}match
                  </span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              <div className="relative min-h-[360px] bg-white dark:bg-[#181612]">
                {getImageUrl(
                  topMatch.image_url,
                ) ? (
                  <Image
                    src={
                      getImageUrl(
                        topMatch.image_url,
                      )!
                    }
                    alt={topMatch.name}
                    fill
                    className="object-contain p-8"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                ) : (
                  <div className="flex min-h-[360px] items-center justify-center text-gray-300">
                    <ShoppingCart size={50} />
                  </div>
                )}

                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-[#171717] px-4 py-2 text-xs font-black text-white">
                  <Target size={14} />
                  TOP MATCH
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#9b762b] dark:bg-[#181612] dark:text-[#d9b86c]">
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
                  <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {topMatch.short_description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-black text-[#956f27] dark:bg-[#181612]">
                    <Star
                      size={13}
                      fill="currentColor"
                    />
                    {Number(
                      topMatch.rating || 0,
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

                      <span className="text-xs font-semibold text-gray-500">
                        {topMatch.brand}
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-5 flex items-end gap-3">
                  <span className="text-3xl font-black">
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
                      <>
                        <span className="mb-1 text-sm text-gray-400 line-through">
                          {formatPrice(
                            Number(
                              topMatch.original_price,
                            ),
                          )}
                        </span>

                        <span className="mb-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-600">
                          {getDiscount(
                            Number(
                              topMatch.price,
                            ),
                            Number(
                              topMatch.original_price,
                            ),
                          )}
                          % OFF
                        </span>
                      </>
                    )}
                </div>

                <div className="mt-6 rounded-2xl border border-[#eadfca] bg-white p-4 dark:border-[#4d402b] dark:bg-[#181612]">
                  <div className="flex items-center justify-between gap-5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#a17b2f]">
                        Match Intelligence
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Based on your selected preferences
                      </p>
                    </div>

                    <CircularScore
                      score={
                        topMatch.matchScore
                      }
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      [
                        "Budget Fit",
                        topMatch
                          .breakdown
                          .budget,
                      ],
                      [
                        "Category Fit",
                        topMatch
                          .breakdown
                          .category,
                      ],
                      [
                        "Purpose Fit",
                        topMatch
                          .breakdown
                          .purpose,
                      ],
                      [
                        "Rating",
                        topMatch
                          .breakdown
                          .rating,
                      ],
                      [
                        "Brand Fit",
                        topMatch
                          .breakdown
                          .brand,
                      ],
                      [
                        "Availability",
                        topMatch
                          .breakdown
                          .availability,
                      ],
                    ].map(
                      ([label, value]) => (
                        <div
                          key={
                            label as string
                          }
                        >
                          <div className="mb-1 flex justify-between text-[10px] font-bold">
                            <span className="text-gray-500">
                              {label as string}
                            </span>

                            <span>
                              {value as number}%
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-[#eee7d9] dark:bg-[#3a3125]">
                            <div
                              className="h-full rounded-full bg-[#c9a24d]"
                              style={{
                                width: `${value}%`,
                              }}
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-black uppercase tracking-wider">
                    Why we picked this
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {topMatch.reasons.map(
                      (reason) => (
                        <div
                          key={reason}
                          className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-emerald-700 dark:bg-[#181612]"
                        >
                          <Check size={14} />
                          {reason}
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    disabled={
                      topMatch.stock <=
                      0
                    }
                    onClick={() =>
                      addToCart(
                        topMatch,
                      )
                    }
                    className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-black transition ${
                      topMatch.stock <=
                      0
                        ? "cursor-not-allowed bg-gray-200 text-gray-500"
                        : cart.includes(
                              topMatch.id,
                            )
                          ? "bg-emerald-600 text-white"
                          : "bg-[#c9a24d] text-white hover:bg-[#b58d3f]"
                    }`}
                  >
                    {cart.includes(
                      topMatch.id,
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
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#dfcfa9] bg-white px-5 text-sm font-black text-gray-700 transition hover:border-[#c9a24d] hover:text-[#9b762b] dark:border-[#4d402b] dark:bg-[#181612] dark:text-gray-200"
                  >
                    View Product
                    <ArrowRight
                      size={16}
                    />
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
                    ? "Your Ranked Matches"
                    : "Recommended For You"}
                </h3>

                {matched && (
                  <span className="rounded-full bg-[#fff3d2] px-2.5 py-1 text-[10px] font-black text-[#956f27] dark:bg-[#211d15] dark:text-[#d9b86c]">
                    LIVE RANKING
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {matched
                  ? `${matchedProducts.length} active products analyzed using your preferences.`
                  : "Preview products that currently fit your preferences."}
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
                <RefreshCw size={15} />
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
                    className="overflow-hidden rounded-[22px] border border-[#eadfca] bg-white dark:border-[#393126] dark:bg-[#181612]"
                  >
                    <div className="h-64 animate-pulse bg-[#eeeae2] dark:bg-[#211d15]" />

                    <div className="space-y-3 p-5">
                      <div className="h-3 w-20 animate-pulse rounded bg-[#eeeae2] dark:bg-[#211d15]" />

                      <div className="h-5 w-full animate-pulse rounded bg-[#eeeae2] dark:bg-[#211d15]" />

                      <div className="h-4 w-2/3 animate-pulse rounded bg-[#eeeae2] dark:bg-[#211d15]" />

                      <div className="h-7 w-1/3 animate-pulse rounded bg-[#eeeae2] dark:bg-[#211d15]" />

                      <div className="h-11 animate-pulse rounded-xl bg-[#eeeae2] dark:bg-[#211d15]" />
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="rounded-[24px] border border-[#eadfca] bg-white px-6 py-20 text-center dark:border-[#393126] dark:bg-[#181612]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32] dark:bg-[#211d15]">
                <Target size={28} />
              </div>

              <h4 className="mt-5 text-xl font-black">
                No products found
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Try another category,
                budget or brand. Prime
                Match uses only active
                products from your current
                catalogue.
              </p>

              <button
                type="button"
                onClick={
                  resetPreferences
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#c9a24d] px-5 py-3 text-sm font-black text-white"
              >
                <RefreshCw size={15} />
                Reset Preferences
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map(
                (product, index) => {
                  const image =
                    getImageUrl(
                      product.image_url,
                    );

                  const discount =
                    getDiscount(
                      Number(
                        product.price,
                      ),
                      product.original_price
                        ? Number(
                            product.original_price,
                          )
                        : null,
                    );

                  const wished =
                    wishlist.includes(
                      product.id,
                    );

                  const added =
                    cart.includes(
                      product.id,
                    );

                  return (
                    <article
                      key={product.id}
                      className="group overflow-hidden rounded-[22px] border border-[#eadfca] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-[#393126] dark:bg-[#181612]"
                    >
                      <div className="relative h-64 overflow-hidden bg-[#faf9f6] dark:bg-[#211d15]">
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

                        <div className="absolute left-3 top-3 rounded-full bg-[#171717] px-3 py-1.5 text-[10px] font-black text-white">
                          #{index + 1} ·{" "}
                          {product.matchScore}%
                        </div>

                        <button
                          type="button"
                          aria-label={
                            wished
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                          onClick={() =>
                            void toggleWishlist(
                              product.id,
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

                        <div className="absolute bottom-3 left-3 flex gap-2">
                          {discount >
                            0 && (
                            <span className="rounded-full bg-[#c9a24d] px-2.5 py-1 text-[10px] font-black text-white">
                              {discount}%
                              OFF
                            </span>
                          )}

                          {product.is_flash_sale && (
                            <span className="flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-black text-white">
                              <Zap
                                size={10}
                              />
                              DEAL
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="max-w-[72%] truncate text-[10px] font-black uppercase tracking-[0.14em] text-[#a17b2f]">
                            {
                              product.categoryName
                            }
                          </span>

                          {product.is_featured && (
                            <span className="flex items-center gap-1 text-[10px] font-black text-[#a17b2f]">
                              <Sparkles
                                size={11}
                              />
                              PICK
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/dashboard/products/${product.id}`}
                        >
                          <h4 className="mt-2 line-clamp-2 min-h-[48px] text-[15px] font-black leading-6 transition group-hover:text-[#a17b2f]">
                            {
                              product.name
                            }
                          </h4>
                        </Link>

                        {product.brand && (
                          <p className="mt-1 text-xs text-gray-400">
                            {
                              product.brand
                            }
                          </p>
                        )}

                        <div className="mt-4 min-h-[42px] space-y-1">
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
                                  {reason}
                                </div>
                              ),
                            )}
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#fff4d8] px-2 py-1 text-[11px] font-black text-[#956f27] dark:bg-[#211d15] dark:text-[#d9b86c]">
                            <Star
                              size={
                                11
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

                          <span className="text-[11px] text-gray-400">
                            {
                              product.reviews_count
                            }{" "}
                            reviews
                          </span>
                        </div>

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
                            className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-black transition ${
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
                                Add to Cart
                              </>
                            )}
                          </button>

                          <Link
                            href={`/dashboard/products/${product.id}`}
                            aria-label={`View ${product.name}`}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5dccb] text-gray-600 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] hover:text-[#9b762b] dark:border-[#393126] dark:text-gray-300 dark:hover:bg-[#211d15]"
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
                },
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
              A smarter way to narrow
              your choices.
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Prime Match combines your
              selected purpose, budget,
              category, brand preference,
              ratings and availability to
              rank live products.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Target,
                step: "STEP 01",
                title:
                  "Set your preferences",
                text:
                  "Tell us what you need, how much you want to spend and what category or brand matters.",
              },
              {
                icon: TrendingUp,
                step: "STEP 02",
                title:
                  "Products are scored",
                text:
                  "Every active product is evaluated using the same transparent matching signals.",
              },
              {
                icon: Sparkles,
                step: "STEP 03",
                title:
                  "See ranked matches",
                text:
                  "Your strongest match appears first, followed by a ranked shortlist you can actually shop.",
              },
            ].map((item) => {
              const Icon =
                item.icon;

              return (
                <div
                  key={item.step}
                  className="rounded-[22px] border border-[#eadfca] bg-white p-6 shadow-sm dark:border-[#393126] dark:bg-[#181612]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32] dark:bg-[#211d15]">
                    <Icon size={21} />
                  </div>

                  <p className="mt-5 text-[10px] font-black uppercase tracking-wider text-[#b58a32]">
                    {item.step}
                  </p>

                  <h4 className="mt-1 text-base font-black">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mt-8 overflow-hidden rounded-[26px] border border-[#dfc98f] bg-[#fff7e4] dark:border-[#4d402b] dark:bg-[#211d15]">
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
                Change your preferences
                and build a fresh
                recommendation set.
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
