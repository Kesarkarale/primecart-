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

type Breakdown = {
  budget: number;
  category: number;
  purpose: number;
  rating: number;
  brand: number;
};

type MatchProduct = Product & {
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

const BUDGETS = [
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

function imageUrl(value: string | null) {
  if (!value?.trim()) return null;

  const valueTrimmed = value.trim();

  if (
    valueTrimmed.startsWith("http://") ||
    valueTrimmed.startsWith("https://") ||
    valueTrimmed.startsWith("/")
  ) {
    return valueTrimmed;
  }

  return `/${valueTrimmed}`;
}

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
  if (!original || original <= price) return 0;

  return Math.round(
    ((original - price) / original) * 100
  );
}

function keywordsForPurpose(
  purpose: string
) {
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
      "wallet",
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
      "mixer",
      "oven",
    ],
  };

  return map[purpose] || [];
}

function keywordsForCategory(
  category: string
) {
  const value = category.toLowerCase();

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

function scoreProduct(
  product: Product,
  categories: Category[],
  purpose: string,
  budget: string,
  categoryId: string,
  brand: string
): MatchProduct {
  const category = categories.find(
    (item) => item.id === product.category_id
  );

  const searchable = [
    product.name,
    product.brand || "",
    product.short_description || "",
    product.description || "",
    category?.name || "",
  ]
    .join(" ")
    .toLowerCase();

  /* PURPOSE */
  const purposeWords =
    keywordsForPurpose(purpose);

  const purposeScore =
    purposeWords.some((word) =>
      searchable.includes(
        word.toLowerCase()
      )
    )
      ? 100
      : 50;

  /* BUDGET */
  const selectedBudget =
    BUDGETS.find(
      (item) => item.id === budget
    );

  let budgetScore = 45;

  if (selectedBudget) {
    const price = Number(product.price);

    if (
      price >= selectedBudget.min &&
      price <= selectedBudget.max
    ) {
      budgetScore = 100;
    } else {
      const difference =
        price < selectedBudget.min
          ? selectedBudget.min - price
          : price - selectedBudget.max;

      if (difference <= 1000) {
        budgetScore = 78;
      } else if (difference <= 3000) {
        budgetScore = 60;
      } else {
        budgetScore = 30;
      }
    }
  }

  /* CATEGORY */
  let categoryScore = 75;

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

    if (
      selectedCategory &&
      keywordsForCategory(
        selectedCategory.name
      ).some((word) =>
        searchable.includes(
          word.toLowerCase()
        )
      )
    ) {
      categoryScore = 68;
    } else {
      categoryScore = 20;
    }
  }

  /* BRAND */
  let brandScore = 75;

  if (brand === "Any Brand") {
    brandScore = 80;
  } else if (
    product.brand?.trim().toLowerCase() ===
    brand.trim().toLowerCase()
  ) {
    brandScore = 100;
  } else {
    brandScore = 20;
  }

  /* RATING */
  const rating = Number(product.rating) || 0;

  const ratingScore = Math.max(
    50,
    Math.min(
      100,
      Math.round((rating / 5) * 100)
    )
  );

  let score = Math.round(
    budgetScore * 0.28 +
      categoryScore * 0.27 +
      purposeScore * 0.20 +
      ratingScore * 0.15 +
      brandScore * 0.10
  );

  if (product.is_featured) score += 2;
  if (product.is_flash_sale) score += 2;
  if (product.stock <= 0) score -= 20;

  score = Math.max(
    20,
    Math.min(99, score)
  );

  const reasons: string[] = [];

  if (budgetScore >= 95) {
    reasons.push("Perfect budget fit");
  } else if (budgetScore >= 70) {
    reasons.push("Near your budget");
  }

  if (categoryScore >= 95) {
    reasons.push("Exact category match");
  }

  if (purposeScore >= 90) {
    reasons.push("Fits your purpose");
  }

  if (brandScore >= 95) {
    reasons.push("Preferred brand");
  }

  if (ratingScore >= 90) {
    reasons.push("Highly rated");
  }

  if (product.is_flash_sale) {
    reasons.push("Special deal");
  }

  if (!reasons.length) {
    reasons.push("Good overall match");
  }

  return {
    ...product,
    categoryName:
      category?.name || "PrimeCart",
    matchScore: score,
    reasons: reasons.slice(0, 3),
    breakdown: {
      budget: budgetScore,
      category: categoryScore,
      purpose: purposeScore,
      rating: ratingScore,
      brand: brandScore,
    },
  };
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
  const image = imageUrl(
    product.image_url
  );

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

        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-contain p-6 transition duration-500 group-hover:scale-105"
            sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <ShoppingBag size={42} />
          </div>
        )}

        {/* RANK */}
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-[#171717] px-3 py-1.5 text-[10px] font-black text-white shadow">
          #{rank}
        </div>

        {/* SCORE */}
        <div className="absolute left-4 top-14 flex items-center gap-1.5 rounded-full border border-[#eadfca] bg-white/95 px-3 py-1.5 text-[10px] font-black text-[#9b762b] shadow-sm">
          <Sparkles size={11} />
          {product.matchScore}% Match
        </div>

        {/* WISHLIST */}
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

        {/* DEALS */}
        <div className="absolute bottom-4 left-4 flex gap-2">

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

        {/* REASONS */}
        <div className="mt-4 min-h-[43px] space-y-1">

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
            {Number(
              product.rating || 0
            ).toFixed(1)}
          </span>

          <span className="text-[11px] text-gray-400">
            {product.reviews_count || 0}{" "}
            reviews
          </span>

        </div>

        {/* PRICE */}
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
          .select(
            "id,name,slug"
          )
          .order("name"),

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
        (
          wishlistResult.data || []
        ).map(
          (item) => item.product_id
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while loading Prime Match."
      );
    } finally {
      setLoading(false);
    }
  }

  const results = useMemo(() => {
    let data = products.map(
      (product) =>
        scoreProduct(
          product,
          categories,
          purpose,
          budget,
          category,
          brand
        )
    );

    if (search.trim()) {
      const query =
        search.toLowerCase().trim();

      data = data.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(query) ||
          product.brand
            ?.toLowerCase()
            .includes(query) ||
          product.categoryName
            .toLowerCase()
            .includes(query)
      );
    }

    return data.sort(
      (a, b) =>
        b.matchScore -
          a.matchScore ||
        Number(b.rating) -
          Number(a.rating) ||
        Number(b.reviews_count) -
          Number(a.reviews_count)
    );
  }, [
    products,
    categories,
    purpose,
    budget,
    category,
    brand,
    search,
  ]);

  const topMatch = results[0];

  const activeCategory =
    category === "all"
      ? null
      : categories.find(
          (item) =>
            item.id === category
        );

  async function runMatch() {
    setMatching(true);
    setMatched(false);

    await new Promise((resolve) =>
      setTimeout(resolve, 900)
    );

    setMatched(true);
    setMatching(false);

    setTimeout(() => {
      document
        .getElementById("match-results")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 150);
  }

  function reset() {
    setPurpose("everyday");
    setBudget("1000-5000");
    setCategory("all");
    setBrand("Any Brand");
    setSearch("");
    setMatched(false);
  }

  async function toggleWishlist(
    productId: string
  ) {
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
        console.error(error);
        return;
      }

      setWishlist((items) =>
        items.filter(
          (id) =>
            id !== productId
        )
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
        console.error(error);
        return;
      }

      setWishlist((items) => [
        ...items,
        productId,
      ]);
    }
  }

  function addCart(product: Product) {
    try {
      const existing =
        localStorage.getItem(
          "primecart-cart"
        );

      let items: {
        id: string;
        name: string;
        price: number;
        image_url: string | null;
        quantity: number;
      }[] = [];

      if (existing) {
        try {
          items = JSON.parse(
            existing
          );
        } catch {
          items = [];
        }
      }

      const found =
        items.find(
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

      setCart((current) =>
        current.includes(product.id)
          ? current
          : [
              ...current,
              product.id,
            ]
      );

      window.dispatchEvent(
        new Event("cart-updated")
      );
    } catch (err) {
      console.error(err);
    }
  }

  const displayedProducts =
    matched
      ? results
      : results.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#171717]">

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

          <Link
            href="/dashboard/products"
            className="flex items-center gap-2 rounded-xl border border-[#e5dccb] bg-white px-4 py-2.5 text-xs font-black text-gray-700 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] hover:text-[#9b762b]"
          >
            <ShoppingBag size={15} />
            <span className="hidden sm:block">
              Browse Products
            </span>
          </Link>

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
                Tell PrimeMatch what you're
                looking for and we'll analyze your
                preferences against real PrimeCart
                products to find your strongest
                matches.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">

                {[
                  "Smart matching",
                  "Real products",
                  "Personalized results",
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
                onChange={(e) =>
                  setSearch(e.target.value)
                }
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
              {results.length} Products
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
                    onChange={(e) =>
                      setCategory(
                        e.target.value
                      )
                    }
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
                    onChange={(e) =>
                      setBrand(
                        e.target.value
                      )
                    }
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
                {PURPOSES.find(
                  (item) =>
                    item.id === purpose
                )?.title}
              </span>

              <span className="rounded-full bg-[#f7f3eb] px-3 py-1.5 text-[10px] font-bold text-gray-600">
                {
                  BUDGETS.find(
                    (item) =>
                      item.id === budget
                  )?.label
                }
              </span>

              {activeCategory && (
                <span className="rounded-full bg-[#fff4d8] px-3 py-1.5 text-[10px] font-bold text-[#956f27]">
                  {activeCategory.name}
                </span>
              )}

              {brand !==
                "Any Brand" && (
                <span className="rounded-full bg-[#fff4d8] px-3 py-1.5 text-[10px] font-bold text-[#956f27]">
                  {brand}
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
                  loading || matching
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
                    Finding Your Matches...
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
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">

            <p className="text-sm font-bold text-red-600">
              {error}
            </p>

            <button
              onClick={loadData}
              className="mt-3 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white"
            >
              Try Again
            </button>

          </div>
        )}

        {/* TOP MATCH */}
        {!loading &&
          matched &&
          topMatch && (
            <section
              id="match-results"
              className="mt-8 scroll-mt-24"
            >

              <div className="mb-4 flex items-end justify-between">

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
                </div>

                <button
                  onClick={() =>
                    setMatched(false)
                  }
                  className="hidden items-center gap-2 text-xs font-black text-[#9b762b] sm:flex"
                >
                  Change preferences
                  <ArrowRight size={14} />
                </button>

              </div>

              <div className="overflow-hidden rounded-[28px] border border-[#dec68b] bg-[#fffaf0] shadow-sm">

                <div className="grid lg:grid-cols-[.9fr_1.1fr]">

                  {/* IMAGE */}
                  <div className="relative min-h-[430px] bg-white">

                    {imageUrl(
                      topMatch.image_url
                    ) ? (
                      <Image
                        src={
                          imageUrl(
                            topMatch.image_url
                          )!
                        }
                        alt={
                          topMatch.name
                        }
                        fill
                        className="object-contain p-10"
                        sizes="(max-width:1024px) 100vw,45vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <ShoppingBag size={55} />
                      </div>
                    )}

                    <div className="absolute left-6 top-6 rounded-full bg-[#171717] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white">
                      #1 Prime Match
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

                    <div className="mt-4 flex items-center gap-3">

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

                      <div className="flex items-center justify-between">

                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#a17b2f]">
                            Match Intelligence
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Why this product matches you
                          </p>
                        </div>

                        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[6px] border-[#eadfca]">
                          <span className="text-lg font-black text-[#956f27]">
                            {topMatch.matchScore}%
                          </span>
                        </div>

                      </div>

                      <div className="mt-5 space-y-3">

                        <ScoreBar
                          label="Budget Fit"
                          value={
                            topMatch.breakdown
                              .budget
                          }
                        />

                        <ScoreBar
                          label="Category Fit"
                          value={
                            topMatch.breakdown
                              .category
                          }
                        />

                        <ScoreBar
                          label="Purpose Fit"
                          value={
                            topMatch.breakdown
                              .purpose
                          }
                        />

                        <ScoreBar
                          label="Product Rating"
                          value={
                            topMatch.breakdown
                              .rating
                          }
                        />

                        <ScoreBar
                          label="Brand Fit"
                          value={
                            topMatch.breakdown
                              .brand
                          }
                        />

                      </div>
                    </div>

                    {/* WHY */}
                    <div className="mt-5 grid gap-2 sm:grid-cols-2">

                      {topMatch.reasons.map(
                        (reason) => (
                          <div
                            key={reason}
                            className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-emerald-700"
                          >
                            <Check size={14} />
                            {reason}
                          </div>
                        )
                      )}

                    </div>

                    {/* ACTION */}
                    <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">

                      <button
                        disabled={
                          topMatch.stock <= 0
                        }
                        onClick={() =>
                          addCart(
                            topMatch
                          )
                        }
                        className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-black ${
                          topMatch.stock <=
                          0
                            ? "bg-gray-200 text-gray-500"
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
                        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#dfcfa9] bg-white px-6 text-sm font-black text-gray-700 hover:border-[#c9a24d] hover:text-[#9b762b]"
                      >
                        View Details
                        <ArrowRight size={16} />
                      </Link>

                    </div>

                  </div>
                </div>
              </div>
            </section>
          )}

        {/* PRODUCTS */}
        <section
          id="products"
          className="mt-10 scroll-mt-24"
        >

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

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
                onClick={() =>
                  setMatched(false)
                }
                className="flex items-center gap-2 text-xs font-black text-[#9b762b] hover:underline"
              >
                <RefreshCw size={14} />
                Change Preferences
              </button>
            )}

          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-[24px] border border-[#eadfca] bg-white"
                  >
                    <div className="h-[275px] animate-pulse bg-[#eeeae2]" />

                    <div className="space-y-3 p-5">
                      <div className="h-3 w-24 animate-pulse rounded bg-[#eeeae2]" />
                      <div className="h-5 w-full animate-pulse rounded bg-[#eeeae2]" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-[#eeeae2]" />
                      <div className="h-8 w-1/3 animate-pulse rounded bg-[#eeeae2]" />
                      <div className="h-11 animate-pulse rounded-xl bg-[#eeeae2]" />
                    </div>
                  </div>
                )
              )}

            </div>
          ) : displayedProducts.length ===
            0 ? (
            <div className="rounded-[28px] border border-[#eadfca] bg-white px-6 py-20 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff6df] text-[#b58a32]">
                <Search size={27} />
              </div>

              <h3 className="mt-5 text-xl font-black">
                No products found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Try changing your search,
                category, brand or budget
                preferences.
              </p>

              <button
                onClick={reset}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#c9a24d] px-5 py-3 text-sm font-black text-white"
              >
                <RefreshCw size={15} />
                Reset Preferences
              </button>

            </div>
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

        {/* HOW IT WORKS */}
        <section className="mt-14">

          <div className="mx-auto max-w-2xl text-center">

            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b58a32]">
              THE PRIME MATCH SYSTEM
            </span>

            <h3 className="mt-2 text-2xl font-black sm:text-3xl">
              A smarter way to discover products.
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              PrimeMatch combines your shopping
              preferences with product data to
              create a personalized ranking.
            </p>

          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">

            {[
              {
                number: "01",
                icon: <Target size={20} />,
                title:
                  "Set your preferences",
                text:
                  "Choose your purpose, budget, category and preferred brand.",
              },
              {
                number: "02",
                icon: (
                  <TrendingUp size={20} />
                ),
                title:
                  "Products are analyzed",
                text:
                  "PrimeMatch compares your choices with product quality and relevance.",
              },
              {
                number: "03",
                icon: (
                  <Sparkles size={20} />
                ),
                title:
                  "Get your matches",
                text:
                  "Your strongest products appear first with transparent match reasons.",
              },
            ].map((item) => (
              <div
                key={item.number}
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

        {/* FINAL CTA */}
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

              <p className="mt-1 text-sm text-gray-500">
                Change your preferences and let
                PrimeMatch find another set of
                recommendations.
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
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-6 text-sm font-black text-white transition hover:bg-[#b58d3f]"
            >
              <Sparkles size={16} />
              Find My Match
            </button>

          </div>
        </section>

        <div className="h-10" />

      </main>
    </div>
  );
}
