"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  RotateCcw,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Target,
  SlidersHorizontal,
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

type MatchProduct = Product & {
  categoryName: string;
  matchScore: number;
  matchReasons: string[];
};

const PURPOSES = [
  {
    id: "everyday",
    label: "Everyday Use",
    description: "Useful products for daily life",
  },
  {
    id: "work",
    label: "Work & Study",
    description: "Products for productivity",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    description: "Gaming, audio and fun",
  },
  {
    id: "fitness",
    label: "Fitness",
    description: "Sports and active lifestyle",
  },
  {
    id: "style",
    label: "Style & Fashion",
    description: "Fashion and personal style",
  },
  {
    id: "home",
    label: "Home",
    description: "Make your home better",
  },
];

const PRICE_RANGES = [
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

const BRAND_OPTIONS = [
  "Any Brand",
  "Samsung",
  "Apple",
  "Sony",
  "Nike",
  "Adidas",
  "Levi's",
  "Boat",
  "JBL",
  "HP",
  "Dell",
];

function getImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;

  const value = imageUrl.trim();

  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
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

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function productContains(product: Product, values: string[]) {
  const text = normalize(
    [
      product.name,
      product.brand || "",
      product.short_description || "",
      product.description || "",
    ].join(" ")
  );

  return values.some((value) =>
    text.includes(normalize(value))
  );
}

function getPurposeKeywords(purpose: string) {
  switch (purpose) {
    case "work":
      return [
        "laptop",
        "keyboard",
        "mouse",
        "monitor",
        "headphone",
        "headset",
        "notebook",
        "book",
        "desk",
        "office",
        "study",
      ];

    case "entertainment":
      return [
        "gaming",
        "speaker",
        "headphone",
        "headset",
        "earbuds",
        "bluetooth",
        "console",
        "tv",
        "game",
      ];

    case "fitness":
      return [
        "fitness",
        "gym",
        "yoga",
        "running",
        "sports",
        "shoe",
        "dumbbell",
        "bat",
        "bottle",
        "workout",
      ];

    case "style":
      return [
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
      ];

    case "home":
      return [
        "home",
        "kitchen",
        "coffee",
        "cookware",
        "appliance",
        "air fryer",
        "kettle",
        "furniture",
        "decor",
        "living",
      ];

    case "everyday":
    default:
      return [
        "mobile",
        "phone",
        "watch",
        "bag",
        "bottle",
        "headphone",
        "shirt",
        "home",
        "kitchen",
        "accessory",
      ];
  }
}

function getCategoryKeywords(categoryName: string) {
  const category = normalize(categoryName);

  if (category.includes("mobile")) {
    return ["mobile", "phone", "smartphone", "iphone", "android"];
  }

  if (category.includes("fashion")) {
    return [
      "shirt",
      "tshirt",
      "hoodie",
      "jacket",
      "fashion",
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
    return ["watch", "smartwatch", "time"];
  }

  if (category.includes("bag")) {
    return ["bag", "backpack", "luggage", "wallet"];
  }

  if (category.includes("automotive")) {
    return [
      "car",
      "automotive",
      "bike",
      "vehicle",
      "dashboard",
      "motor",
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

  if (category.includes("appliance")) {
    return [
      "appliance",
      "air fryer",
      "kettle",
      "coffee",
      "mixer",
      "oven",
    ];
  }

  if (category.includes("toy") || category.includes("baby")) {
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

export default function PrimeMatchPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);

  const [purpose, setPurpose] = useState("everyday");
  const [budget, setBudget] = useState("1000-5000");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("Any Brand");

  const [showFilters, setShowFilters] = useState(true);
  const [hasMatched, setHasMatched] = useState(false);

  const [cartIds, setCartIds] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      const [productsResult, categoriesResult, wishlistResult] =
        await Promise.all([
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
            .select("id, name, slug")
            .order("name"),

          supabase
            .from("wishlist")
            .select("product_id")
            .eq("user_id", user.id),
        ]);

      if (productsResult.error) {
        console.error(productsResult.error);
      }

      if (categoriesResult.error) {
        console.error(categoriesResult.error);
      }

      setProducts(
        (productsResult.data as Product[]) || []
      );

      setCategories(
        (categoriesResult.data as Category[]) || []
      );

      setWishlistIds(
        ((wishlistResult.data || []) as {
          product_id: string;
        }[]).map((item) => item.product_id)
      );
    } catch (error) {
      console.error("Prime Match load error:", error);
    } finally {
      setLoading(false);
    }
  }

  const matchedProducts = useMemo<MatchProduct[]>(() => {
    const selectedPurposeKeywords =
      getPurposeKeywords(purpose);

    const selectedCategory =
      categories.find((item) => item.id === category);

    const selectedCategoryKeywords = selectedCategory
      ? getCategoryKeywords(selectedCategory.name)
      : [];

    const selectedBudget = PRICE_RANGES.find(
      (item) => item.id === budget
    );

    const result = products
      .map((product) => {
        let score = 45;
        const reasons: string[] = [];

        const productText = normalize(
          [
            product.name,
            product.brand || "",
            product.short_description || "",
            product.description || "",
          ].join(" ")
        );

        // Purpose matching
        if (
          selectedPurposeKeywords.some((keyword) =>
            productText.includes(normalize(keyword))
          )
        ) {
          score += 20;
          reasons.push("Matches your purpose");
        }

        // Category matching
        if (
          selectedCategory &&
          selectedCategoryKeywords.some((keyword) =>
            productText.includes(normalize(keyword))
          )
        ) {
          score += 15;
          reasons.push("Matches your category");
        }

        // Better: use actual category relation
        if (
          selectedCategory &&
          product.category_id === selectedCategory.id
        ) {
          score += 25;
          reasons.push("Exact category match");
        }

        // Budget matching
        if (selectedBudget) {
          const inBudget =
            Number(product.price) >= selectedBudget.min &&
            Number(product.price) <= selectedBudget.max;

          if (inBudget) {
            score += 15;
            reasons.push("Within your budget");
          } else {
            score -= 10;
          }
        }

        // Brand matching
        if (brand !== "Any Brand") {
          if (
            product.brand &&
            normalize(product.brand) === normalize(brand)
          ) {
            score += 15;
            reasons.push("Preferred brand");
          } else if (
            productContains(product, [brand])
          ) {
            score += 10;
            reasons.push("Brand preference match");
          }
        }

        // Rating
        if (Number(product.rating) >= 4.5) {
          score += 5;
          reasons.push("Highly rated");
        } else if (Number(product.rating) >= 4) {
          score += 3;
        }

        // Featured
        if (product.is_featured) {
          score += 3;
        }

        // Flash sale
        if (product.is_flash_sale) {
          score += 2;
          reasons.push("Special deal");
        }

        // Stock
        if (product.stock <= 0) {
          score -= 25;
        }

        score = Math.max(20, Math.min(99, score));

        if (reasons.length === 0) {
          reasons.push("Good overall match");
        }

        return {
          ...product,
          categoryName:
            selectedCategory?.name || "Recommended",
          matchScore: score,
          matchReasons: reasons.slice(0, 3),
        };
      })
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }

        return Number(b.rating) - Number(a.rating);
      });

    return result;
  }, [
    products,
    categories,
    purpose,
    budget,
    category,
    brand,
  ]);

  const visibleProducts = hasMatched
    ? matchedProducts
    : matchedProducts.slice(0, 8);

  async function findMyMatches() {
    setMatching(true);
    setHasMatched(false);

    await new Promise((resolve) =>
      setTimeout(resolve, 700)
    );

    setHasMatched(true);
    setMatching(false);

    window.scrollTo({
      top: 600,
      behavior: "smooth",
    });
  }

  function resetMatch() {
    setPurpose("everyday");
    setBudget("1000-5000");
    setCategory("all");
    setBrand("Any Brand");
    setHasMatched(false);
  }

  async function toggleWishlist(productId: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      const alreadySaved = wishlistIds.includes(productId);

      if (alreadySaved) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) {
          console.error(error);
          return;
        }

        setWishlistIds((current) =>
          current.filter((id) => id !== productId)
        );
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: productId,
          });

        if (error) {
          console.error(error);
          return;
        }

        setWishlistIds((current) => [
          ...current,
          productId,
        ]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function addToCart(product: Product) {
    try {
      const stored = localStorage.getItem(
        "primecart-cart"
      );

      let cart: {
        id: string;
        name: string;
        price: number;
        image_url: string | null;
        quantity: number;
      }[] = [];

      if (stored) {
        try {
          cart = JSON.parse(stored);
        } catch {
          cart = [];
        }
      }

      const existing = cart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image_url: product.image_url,
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

      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#eadfca] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfca] bg-white text-[#8b6b25] transition hover:bg-[#fffaf0]"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <Sparkles
                  size={17}
                  className="text-[#c9a24d]"
                />

                <h1 className="text-lg font-bold sm:text-xl">
                  Prime Match
                </h1>
              </div>

              <p className="hidden text-xs text-gray-500 sm:block">
                Find products that match you
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/products"
            className="hidden items-center gap-2 rounded-xl border border-[#e5dccb] px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-[#fffaf0] sm:flex"
          >
            Browse Products
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-[#eadfca] bg-white shadow-sm">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#f7e8bd]/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#f7e8bd]/30 blur-3xl" />

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#eadfca] bg-[#fffaf0] px-3 py-1.5 text-xs font-semibold text-[#9b762b]">
                <Sparkles size={14} />
                Smart Shopping Assistant
              </div>

              <h2 className="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Find your{" "}
                <span className="text-[#b58a32]">
                  perfect match.
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
                Tell PrimeCart what you're looking for,
                your budget and preferences. We'll analyze
                our products and show you the best matching
                options.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-[#fffaf0] px-3 py-2 text-xs font-semibold text-[#9b762b]">
                  <Target size={15} />
                  Smart Matching
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-[#fffaf0] px-3 py-2 text-xs font-semibold text-[#9b762b]">
                  <Zap size={15} />
                  Real Products
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-[#fffaf0] px-3 py-2 text-xs font-semibold text-[#9b762b]">
                  <Check size={15} />
                  Personalized
                </div>
              </div>
            </div>

            <div className="hidden items-center justify-center lg:flex">
              <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-[#eadfca] bg-[#fffdf8]">
                <div className="absolute inset-7 rounded-full border border-dashed border-[#d9bd78]" />

                <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-[#c9a24d] text-white shadow-xl shadow-[#c9a24d]/20">
                  <Sparkles size={48} />
                </div>

                <div className="absolute left-4 top-14 rounded-xl border border-[#eadfca] bg-white px-3 py-2 text-xs font-bold shadow-sm">
                  98% Match
                </div>

                <div className="absolute bottom-10 right-0 rounded-xl border border-[#eadfca] bg-white px-3 py-2 text-xs font-bold shadow-sm">
                  Your Choice
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preference Builder */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-[#eadfca] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#eee6d7] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff8e8] text-[#b58a32]">
                <SlidersHorizontal size={19} />
              </div>

              <div>
                <h3 className="font-bold">
                  Build Your Match
                </h3>

                <p className="text-xs text-gray-500">
                  Set your shopping preferences
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-[#fffaf0]"
            >
              {showFilters ? "Hide" : "Show"}
              <ChevronDown
                size={15}
                className={`transition ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {showFilters && (
            <div className="p-5 sm:p-6">
              {/* Purpose */}
              <div>
                <label className="mb-3 block text-sm font-bold">
                  What are you shopping for?
                </label>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                  {PURPOSES.map((item) => {
                    const active = purpose === item.id;

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() =>
                          setPurpose(item.id)
                        }
                        className={`rounded-xl border p-3 text-left transition ${
                          active
                            ? "border-[#c9a24d] bg-[#fffaf0] shadow-sm"
                            : "border-[#e5dccb] bg-white hover:border-[#d8bd7a] hover:bg-[#fffdf8]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              active
                                ? "text-[#9b762b]"
                                : "text-gray-800"
                            }`}
                          >
                            {item.label}
                          </span>

                          {active && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a24d] text-white">
                              <Check size={12} />
                            </div>
                          )}
                        </div>

                        <p className="mt-1 text-[11px] leading-4 text-gray-500">
                          {item.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget + Category + Brand */}
              <div className="mt-7 grid gap-6 lg:grid-cols-3">
                {/* Budget */}
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Your Budget
                  </label>

                  <div className="relative">
                    <select
                      value={budget}
                      onChange={(e) =>
                        setBudget(e.target.value)
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-[#e5dccb] bg-[#fffdf8] px-4 pr-10 text-sm font-medium outline-none transition focus:border-[#c9a24d] focus:ring-2 focus:ring-[#c9a24d]/10"
                    >
                      {PRICE_RANGES.map((item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.label}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Product Category
                  </label>

                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value)
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-[#e5dccb] bg-[#fffdf8] px-4 pr-10 text-sm font-medium outline-none transition focus:border-[#c9a24d] focus:ring-2 focus:ring-[#c9a24d]/10"
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

                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>

                {/* Brand */}
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Preferred Brand
                  </label>

                  <div className="relative">
                    <select
                      value={brand}
                      onChange={(e) =>
                        setBrand(e.target.value)
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-[#e5dccb] bg-[#fffdf8] px-4 pr-10 text-sm font-medium outline-none transition focus:border-[#c9a24d] focus:ring-2 focus:ring-[#c9a24d]/10"
                    >
                      {BRAND_OPTIONS.map((item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-7 flex flex-col gap-3 border-t border-[#eee6d7] pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetMatch}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#e5dccb] px-5 text-sm font-semibold text-gray-600 transition hover:bg-[#fffaf0]"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={findMyMatches}
                  disabled={matching || loading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-7 text-sm font-bold text-white shadow-sm transition hover:bg-[#b8913f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {matching ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Finding Matches...
                    </>
                  ) : (
                    <>
                      <Sparkles size={17} />
                      Find My Matches
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Results Header */}
        <section className="mb-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold sm:text-2xl">
                  {hasMatched
                    ? "Your Prime Matches"
                    : "Recommended For You"}
                </h3>

                {hasMatched && (
                  <span className="rounded-full bg-[#fff8e8] px-2.5 py-1 text-xs font-bold text-[#9b762b]">
                    Personalized
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {hasMatched
                  ? `${matchedProducts.length} products matched your preferences`
                  : "Set your preferences above to get personalized results."}
              </p>
            </div>

            {hasMatched && (
              <button
                type="button"
                onClick={() => setHasMatched(false)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#9b762b] hover:underline"
              >
                <RotateCcw size={15} />
                Adjust Preferences
              </button>
            )}
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-[#eadfca] bg-white"
              >
                <div className="h-60 bg-gray-200" />

                <div className="space-y-3 p-4">
                  <div className="h-4 w-20 rounded bg-gray-200" />
                  <div className="h-5 w-full rounded bg-gray-200" />
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                  <div className="h-6 w-1/3 rounded bg-gray-200" />
                  <div className="h-10 w-full rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Products */}
        {!loading && visibleProducts.length === 0 && (
          <div className="rounded-2xl border border-[#eadfca] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff8e8] text-[#b58a32]">
              <Search size={28} />
            </div>

            <h3 className="mt-5 text-xl font-bold">
              No matching products found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Try selecting a different category, budget or
              brand to discover more products.
            </p>

            <button
              type="button"
              onClick={resetMatch}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#c9a24d] px-5 py-3 text-sm font-semibold text-white"
            >
              <RotateCcw size={16} />
              Reset Preferences
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && visibleProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => {
              const image = getImageUrl(
                product.image_url
              );

              const discount = getDiscount(
                Number(product.price),
                product.original_price
                  ? Number(product.original_price)
                  : null
              );

              const isWishlisted = wishlistIds.includes(
                product.id
              );

              const isAdded = cartIds.includes(
                product.id
              );

              const outOfStock = product.stock <= 0;

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-[#eadfca] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative h-60 overflow-hidden bg-[#faf9f6]">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-contain p-5 transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <ShoppingCart size={38} />
                      </div>
                    )}

                    {/* Match Score */}
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#171717] px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                      <Target size={13} />
                      {product.matchScore}% Match
                    </div>

                    {/* Discount */}
                    {discount > 0 && (
                      <span className="absolute bottom-3 left-3 rounded-full bg-[#c9a24d] px-2.5 py-1 text-xs font-bold text-white">
                        {discount}% OFF
                      </span>
                    )}

                    {/* Wishlist */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleWishlist(product.id)
                      }
                      className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border bg-white/95 shadow-sm transition ${
                        isWishlisted
                          ? "border-red-200 text-red-500"
                          : "border-[#eadfca] text-gray-500 hover:text-red-500"
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart
                        size={18}
                        fill={
                          isWishlisted
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#a17c31]">
                        {product.categoryName}
                      </span>

                      {product.is_flash_sale && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                          <Zap size={12} />
                          DEAL
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/products/${product.id}`}
                    >
                      <h4 className="mt-1 line-clamp-2 min-h-[48px] text-base font-bold text-gray-900 transition group-hover:text-[#a17c31]">
                        {product.name}
                      </h4>
                    </Link>

                    {product.brand && (
                      <p className="mt-1 text-xs text-gray-500">
                        by {product.brand}
                      </p>
                    )}

                    {/* Match Reasons */}
                    <div className="mt-3 min-h-[48px] space-y-1">
                      {product.matchReasons
                        .slice(0, 2)
                        .map((reason) => (
                          <div
                            key={reason}
                            className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600"
                          >
                            <Check size={12} />
                            {reason}
                          </div>
                        ))}
                    </div>

                    {/* Rating */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-md bg-[#fff8e8] px-2 py-1 text-xs font-semibold text-[#9b762b]">
                        <Star
                          size={12}
                          fill="currentColor"
                        />
                        {Number(product.rating || 0).toFixed(
                          1
                        )}
                      </div>

                      <span className="text-xs text-gray-400">
                        ({product.reviews_count || 0})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mt-3 flex items-end gap-2">
                      <span className="text-xl font-bold">
                        {formatPrice(
                          Number(product.price)
                        )}
                      </span>

                      {product.original_price &&
                        Number(product.original_price) >
                          Number(product.price) && (
                          <span className="mb-0.5 text-sm text-gray-400 line-through">
                            {formatPrice(
                              Number(
                                product.original_price
                              )
                            )}
                          </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        disabled={outOfStock}
                        onClick={() =>
                          addToCart(product)
                        }
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                          outOfStock
                            ? "cursor-not-allowed bg-gray-200 text-gray-500"
                            : isAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-[#c9a24d] text-white hover:bg-[#b8913f]"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={16} />
                            Added
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={16} />
                            {outOfStock
                              ? "Out of Stock"
                              : "Add to Cart"}
                          </>
                        )}
                      </button>

                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e5dccb] text-gray-600 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] hover:text-[#9b762b]"
                        aria-label="View product"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* How Prime Match Works */}
        <section className="mt-10 rounded-2xl border border-[#eadfca] bg-white p-6 sm:p-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#b58a32]">
              How It Works
            </span>

            <h3 className="mt-2 text-2xl font-bold">
              Shopping made personal
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
              Prime Match combines your preferences with
              your available PrimeCart products.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-[#eee6d7] bg-[#fffdf8] p-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff8e8] text-[#b58a32]">
                <SlidersHorizontal size={22} />
              </div>

              <h4 className="mt-4 font-bold">
                1. Tell us what you need
              </h4>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Select your purpose, category, budget and
                preferred brand.
              </p>
            </div>

            <div className="rounded-2xl border border-[#eee6d7] bg-[#fffdf8] p-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff8e8] text-[#b58a32]">
                <Target size={22} />
              </div>

              <h4 className="mt-4 font-bold">
                2. Prime Match analyzes
              </h4>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Products are matched against your selected
                preferences and product information.
              </p>
            </div>

            <div className="rounded-2xl border border-[#eee6d7] bg-[#fffdf8] p-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff8e8] text-[#b58a32]">
                <Sparkles size={22} />
              </div>

              <h4 className="mt-4 font-bold">
                3. Find your match
              </h4>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Explore products with a personalized match
                percentage and reasons.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
