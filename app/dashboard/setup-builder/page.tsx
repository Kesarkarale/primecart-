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
  CircleDollarSign,
  Heart,
  Laptop,
  Monitor,
  Mouse,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Target,
  Keyboard,
  Headphones,
  Gamepad2,
  BriefcaseBusiness,
  Home,
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

type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

type SetupType =
  | "work"
  | "gaming"
  | "study"
  | "creator"
  | "everyday";

type SetupCategory =
  | "monitor"
  | "keyboard"
  | "mouse"
  | "headphones"
  | "accessories";

const setupTypes = [
  {
    id: "work" as SetupType,
    title: "Work Setup",
    description: "Productivity, meetings & daily work",
    icon: BriefcaseBusiness,
  },
  {
    id: "gaming" as SetupType,
    title: "Gaming Setup",
    description: "Performance, comfort & immersion",
    icon: Gamepad2,
  },
  {
    id: "study" as SetupType,
    title: "Study Setup",
    description: "Focused, comfortable learning",
    icon: Laptop,
  },
  {
    id: "creator" as SetupType,
    title: "Creator Setup",
    description: "Content, audio & creative work",
    icon: Monitor,
  },
  {
    id: "everyday" as SetupType,
    title: "Everyday Setup",
    description: "A balanced setup for everything",
    icon: Home,
  },
];

const setupCategories: {
  id: SetupCategory;
  title: string;
  description: string;
  keywords: string[];
}[] = [
  {
    id: "monitor",
    title: "Display",
    description: "Monitor or display",
    keywords: [
      "monitor",
      "display",
      "screen",
      "led",
      "gaming monitor",
    ],
  },
  {
    id: "keyboard",
    title: "Keyboard",
    description: "Fast & comfortable typing",
    keywords: [
      "keyboard",
      "mechanical",
      "wireless keyboard",
    ],
  },
  {
    id: "mouse",
    title: "Mouse",
    description: "Precision & control",
    keywords: [
      "mouse",
      "gaming mouse",
      "wireless mouse",
    ],
  },
  {
    id: "headphones",
    title: "Audio",
    description: "Headphones & sound",
    keywords: [
      "headphone",
      "headphones",
      "earphone",
      "earbuds",
      "speaker",
      "audio",
    ],
  },
  {
    id: "accessories",
    title: "Accessories",
    description: "Complete your workspace",
    keywords: [
      "webcam",
      "stand",
      "desk",
      "hub",
      "cable",
      "mouse pad",
      "lamp",
      "accessory",
    ],
  },
];

const budgetOptions = [
  { label: "₹5K", value: 5000 },
  { label: "₹10K", value: 10000 },
  { label: "₹20K", value: 20000 },
  { label: "₹35K", value: 35000 },
  { label: "₹50K", value: 50000 },
];

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

  if (image.startsWith("/")) {
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
  originalPrice: number | null
) {
  if (!originalPrice || originalPrice <= price) {
    return 0;
  }

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100
  );
}

function matchesSetupCategory(
  product: Product,
  category: SetupCategory
) {
  const text = `${product.name} ${
    product.short_description || ""
  } ${product.description || ""} ${
    product.brand || ""
  }`.toLowerCase();

  const config = setupCategories.find(
    (item) => item.id === category
  );

  if (!config) return false;

  return config.keywords.some((keyword) =>
    text.includes(keyword.toLowerCase())
  );
}

function getSetupScore(
  product: Product,
  budget: number,
  setupType: SetupType
) {
  const price = Number(product.price);
  const rating = Number(product.rating || 0);
  const reviews = Number(product.reviews_count || 0);

  let score = 0;

  if (price <= budget * 0.2) {
    score += 18;
  } else if (price <= budget * 0.35) {
    score += 24;
  } else if (price <= budget * 0.55) {
    score += 28;
  } else if (price <= budget * 0.75) {
    score += 23;
  } else if (price <= budget) {
    score += 16;
  }

  score += Math.round((rating / 5) * 30);

  score += Math.min(
    12,
    Math.round(reviews / 20)
  );

  if (product.is_featured) {
    score += 8;
  }

  if (product.is_flash_sale) {
    score += 7;
  }

  if (setupType === "gaming") {
    if (
      product.name.toLowerCase().includes("gaming")
    ) {
      score += 8;
    }
  }

  if (setupType === "creator") {
    if (
      /audio|headphone|monitor|keyboard|mouse|speaker/i.test(
        product.name
      )
    ) {
      score += 7;
    }
  }

  if (setupType === "work") {
    if (
      /keyboard|mouse|monitor|headphone|webcam/i.test(
        product.name
      )
    ) {
      score += 7;
    }
  }

  if (setupType === "study") {
    if (
      /keyboard|mouse|headphone|lamp|stand/i.test(
        product.name
      )
    ) {
      score += 7;
    }
  }

  if (setupType === "everyday") {
    score += 5;
  }

  if (product.stock <= 0) {
    score -= 30;
  }

  return Math.max(
    0,
    Math.min(99, score)
  );
}

export default function SetupBuilderPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(
    []
  );
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartIds, setCartIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [setupReady, setSetupReady] = useState(false);

  const [setupType, setSetupType] =
    useState<SetupType>("work");

  const [budget, setBudget] = useState(20000);
  const [customBudget, setCustomBudget] =
    useState("20000");

  const [focusCategory, setFocusCategory] =
    useState<"all" | SetupCategory>("all");

  const [selectedProducts, setSelectedProducts] =
    useState<string[]>([]);

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

      const [
        productsResult,
        categoriesResult,
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
          .select("id, name, slug")
          .order("name"),

        supabase
          .from("wishlist")
          .select("product_id")
          .eq("user_id", user.id),
      ]);

      setProducts(
        (productsResult.data as Product[]) || []
      );

      setCategories(
        (categoriesResult.data as Category[]) || []
      );

      setWishlist(
        (
          (wishlistResult.data || []) as {
            product_id: string;
          }[]
        ).map((item) => item.product_id)
      );
    } catch (error) {
      console.error(
        "Setup Builder Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  const setupProducts = useMemo(() => {
    let list = products.filter(
      (product) =>
        product.stock > 0 &&
        Number(product.price) <= budget
    );

    if (focusCategory !== "all") {
      list = list.filter((product) =>
        matchesSetupCategory(
          product,
          focusCategory
        )
      );
    }

    return list
      .map((product) => ({
        ...product,
        setupScore: getSetupScore(
          product,
          budget,
          setupType
        ),
      }))
      .sort(
        (a, b) =>
          b.setupScore - a.setupScore
      );
  }, [
    products,
    budget,
    setupType,
    focusCategory,
  ]);

  const smartSetup = useMemo(() => {
    const result: Product[] = [];
    let remaining = budget;

    const selectedCategories =
      focusCategory === "all"
        ? setupCategories.map(
            (item) => item.id
          )
        : [focusCategory];

    for (const category of selectedCategories) {
      if (result.length >= 5) break;

      const candidates =
        setupProducts.filter((product) =>
          matchesSetupCategory(
            product,
            category
          )
        );

      const product = candidates.find(
        (item) =>
          !result.some(
            (selected) =>
              selected.id === item.id
          ) &&
          Number(item.price) <=
            remaining
      );

      if (product) {
        result.push(product);
        remaining -= Number(
          product.price
        );
      }
    }

    for (const product of setupProducts) {
      if (result.length >= 5) break;

      if (
        result.some(
          (item) => item.id === product.id
        )
      ) {
        continue;
      }

      if (
        Number(product.price) <=
        remaining
      ) {
        result.push(product);
        remaining -= Number(
          product.price
        );
      }
    }

    return result;
  }, [
    setupProducts,
    budget,
    focusCategory,
  ]);

  const activeProductIds =
    selectedProducts.length > 0
      ? selectedProducts
      : smartSetup.map(
          (product) => product.id
        );

  const finalSetupProducts =
    activeProductIds
      .map((id) =>
        products.find(
          (product) =>
            product.id === id
        )
      )
      .filter(Boolean) as Product[];

  const setupSpend =
    finalSetupProducts.reduce(
      (total, product) =>
        total + Number(product.price),
      0
    );

  const remaining =
    Math.max(
      0,
      budget - setupSpend
    );

  const savings =
    finalSetupProducts.reduce(
      (total, product) => {
        const original =
          product.original_price
            ? Number(
                product.original_price
              )
            : Number(product.price);

        return (
          total +
          Math.max(
            0,
            original -
              Number(product.price)
          )
        );
      },
      0
    );

  const utilization =
    budget > 0
      ? Math.min(
          100,
          Math.round(
            (setupSpend / budget) *
              100
          )
        )
      : 0;

  function changeBudget(value: number) {
    const safe = Math.max(
      2000,
      Math.min(
        100000,
        Math.round(value)
      )
    );

    setBudget(safe);
    setCustomBudget(
      String(safe)
    );
    setSetupReady(false);
    setSelectedProducts([]);
  }

  function handleBudgetInput(
    value: string
  ) {
    const cleaned =
      value.replace(
        /[^0-9]/g,
        ""
      );

    setCustomBudget(cleaned);

    const numeric =
      Number(cleaned);

    if (
      numeric >= 2000 &&
      numeric <= 100000
    ) {
      setBudget(numeric);
      setSetupReady(false);
      setSelectedProducts([]);
    }
  }

  async function buildSetup() {
    setBuilding(true);
    setSetupReady(false);

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 1200)
    );

    setSelectedProducts([]);
    setSetupReady(true);
    setBuilding(false);

    setTimeout(() => {
      document
        .getElementById(
          "setup-result"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 150);
  }

  function resetBuilder() {
    setSetupType("work");
    setBudget(20000);
    setCustomBudget("20000");
    setFocusCategory("all");
    setSelectedProducts([]);
    setSetupReady(false);
  }

  function toggleProduct(
    productId: string
  ) {
    setSelectedProducts(
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

        const product =
          products.find(
            (item) =>
              item.id ===
              productId
          );

        if (!product) {
          return current;
        }

        const currentSpend =
          current.reduce(
            (sum, id) => {
              const item =
                products.find(
                  (p) =>
                    p.id === id
                );

              return (
                sum +
                Number(
                  item?.price || 0
                )
              );
            },
            0
          );

        if (
          currentSpend +
            Number(
              product.price
            ) >
          budget
        ) {
          return current;
        }

        return [
          ...current,
          productId,
        ];
      }
    );
  }

  async function toggleWishlist(
    productId: string
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
        console.error(error);
        return;
      }

      setWishlist(
        (current) =>
          current.filter(
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
            product_id:
              productId,
          });

      if (error) {
        console.error(error);
        return;
      }

      setWishlist(
        (current) => [
          ...current,
          productId,
        ]
      );
    }
  }

  function getCartItems(): CartItem[] {
    try {
      const saved =
        localStorage.getItem(
          "primecart-cart"
        );

      if (!saved) {
        return [];
      }

      const parsed =
        JSON.parse(saved);

      return Array.isArray(
        parsed
      )
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  function saveCart(
    items: CartItem[]
  ) {
    localStorage.setItem(
      "primecart-cart",
      JSON.stringify(items)
    );

    window.dispatchEvent(
      new Event(
        "cart-updated"
      )
    );
  }

  function addToCart(
    product: Product
  ) {
    const items =
      getCartItems();

    const existing =
      items.find(
        (item) =>
          item.id ===
          product.id
      );

    if (existing) {
      existing.quantity += 1;
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

    saveCart(items);

    setCartIds(
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
  }

  function addFullSetupToCart() {
    finalSetupProducts.forEach(
      (product) =>
        addToCart(product)
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#181818]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#e9dfcd] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7dece] text-gray-500 transition hover:border-[#c9a24d] hover:text-[#a17b2f]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a24d] text-white">
                <Sparkles size={18} />
              </div>

              <div>
                <h1 className="text-sm font-black sm:text-base">
                  Build My Setup
                </h1>

                <p className="hidden text-[10px] text-gray-400 sm:block">
                  PrimeCart Setup Studio
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/products"
              className="hidden h-10 items-center gap-2 rounded-xl border border-[#e7dece] px-4 text-xs font-bold text-gray-600 transition hover:border-[#c9a24d] sm:flex"
            >
              <ShoppingCart size={14} />
              Products
            </Link>

            <Link
              href="/dashboard"
              className="flex h-10 items-center gap-2 rounded-xl bg-[#fff6df] px-4 text-xs font-black text-[#956f27]"
            >
              Dashboard
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[32px] border border-[#e8dcc3] bg-white">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#f2dfad]/30 blur-3xl" />

          <div className="relative grid items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e9dfcb] bg-[#fffaf0] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#a17b2f]">
                <Sparkles size={13} />
                PrimeCart Smart Studio
              </div>

              <h2 className="mt-6 max-w-3xl text-[42px] font-black leading-[1.03] tracking-[-0.04em] sm:text-5xl lg:text-[62px]">
                Build a setup that
                <span className="block text-[#b58a32]">
                  works for you.
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
                Choose your purpose, set your budget and let
                PrimeCart help you discover the right products
                for a complete setup.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {[
                  "Purpose based",
                  "Budget friendly",
                  "Real products",
                  "Smart recommendations",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#eae2d5] bg-[#fffdf9] px-3 py-2 text-[10px] font-bold text-gray-600"
                  >
                    <Check
                      size={12}
                      className="text-[#b58a32]"
                    />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* HERO SETUP CARD */}
            <div className="mx-auto w-full max-w-[430px]">
              <div className="rounded-[30px] border border-[#eadfca] bg-[#fffaf0] p-5 shadow-[0_20px_60px_rgba(120,90,30,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                      Your setup
                    </p>

                    <p className="mt-1 text-xl font-black">
                      {
                        setupTypes.find(
                          (item) =>
                            item.id ===
                            setupType
                        )?.title
                      }
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c9a24d] text-white">
                    <Target size={20} />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    {
                      icon: Monitor,
                      label: "Display",
                    },
                    {
                      icon: Keyboard,
                      label: "Keyboard",
                    },
                    {
                      icon: Mouse,
                      label: "Mouse",
                    },
                    {
                      icon: Headphones,
                      label: "Audio",
                    },
                  ].map(
                    ({
                      icon: Icon,
                      label,
                    }) => (
                      <div
                        key={label}
                        className="rounded-2xl bg-white p-4"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff4d8] text-[#a17b2f]">
                          <Icon size={17} />
                        </div>

                        <p className="mt-3 text-[10px] font-black">
                          {label}
                        </p>
                      </div>
                    )
                  )}
                </div>

                <div className="mt-4 rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Setup Budget
                    </span>

                    <span className="text-base font-black">
                      {formatPrice(
                        budget
                      )}
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eee6d7]">
                    <div
                      className="h-full rounded-full bg-[#c9a24d]"
                      style={{
                        width: `${Math.min(
                          100,
                          utilization
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SETUP BUILDER */}
        <section className="mt-6 rounded-[28px] border border-[#e9dfcd] bg-white shadow-sm">
          <div className="border-b border-[#eee7da] px-5 py-5 sm:px-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5dc] text-[#b58a32]">
                  <Package size={20} />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                    Setup Studio
                  </p>

                  <h3 className="text-lg font-black">
                    Design your setup
                  </h3>
                </div>
              </div>

              <span className="rounded-full bg-[#f7f2e8] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-gray-500">
                Step 1 · Preferences
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {/* PURPOSE */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                Step 01
              </p>

              <h4 className="mt-1 text-xl font-black">
                What are you building?
              </h4>

              <p className="mt-1 text-sm text-gray-500">
                Select the purpose of your setup.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {setupTypes.map(
                  (item) => {
                    const Icon =
                      item.icon;

                    const active =
                      setupType ===
                      item.id;

                    return (
                      <button
                        key={
                          item.id
                        }
                        type="button"
                        onClick={() => {
                          setSetupType(
                            item.id
                          );
                          setSetupReady(
                            false
                          );
                          setSelectedProducts(
                            []
                          );
                        }}
                        className={`relative rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-[#c9a24d] bg-[#fffaf0] shadow-sm"
                            : "border-[#e8e0d2] hover:border-[#d3b76f] hover:shadow-sm"
                        }`}
                      >
                        {active && (
                          <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a24d] text-white">
                            <Check size={11} />
                          </span>
                        )}

                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            active
                              ? "bg-[#c9a24d] text-white"
                              : "bg-[#f8f4ec] text-[#a17b2f]"
                          }`}
                        >
                          <Icon size={18} />
                        </span>

                        <p className="mt-4 text-sm font-black">
                          {item.title}
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-gray-400">
                          {
                            item.description
                          }
                        </p>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* BUDGET */}
            <div className="mt-10">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Step 02
                  </p>

                  <h4 className="mt-1 text-xl font-black">
                    Set your setup budget
                  </h4>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#a17b2f]">
                    ₹
                  </span>

                  <input
                    value={
                      customBudget
                    }
                    inputMode="numeric"
                    onChange={(e) =>
                      handleBudgetInput(
                        e.target.value
                      )
                    }
                    className="h-12 w-40 rounded-xl border border-[#dfd5c3] bg-[#fffdf9] pl-8 pr-3 text-right text-base font-black outline-none focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {budgetOptions.map(
                  (item) => {
                    const active =
                      budget ===
                      item.value;

                    return (
                      <button
                        key={
                          item.value
                        }
                        type="button"
                        onClick={() =>
                          changeBudget(
                            item.value
                          )
                        }
                        className={`h-12 rounded-xl border text-xs font-black transition ${
                          active
                            ? "border-[#c9a24d] bg-[#fff7e3] text-[#956f27]"
                            : "border-[#e8e0d2] text-gray-600 hover:border-[#d3b76f]"
                        }`}
                      >
                        {
                          item.label
                        }
                      </button>
                    );
                  }
                )}
              </div>

              <div className="mt-5">
                <input
                  type="range"
                  min="2000"
                  max="50000"
                  step="500"
                  value={Math.min(
                    budget,
                    50000
                  )}
                  onChange={(e) =>
                    changeBudget(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e9e0d0] accent-[#c9a24d]"
                />

                <div className="mt-2 flex justify-between text-[9px] font-bold text-gray-400">
                  <span>
                    ₹2,000
                  </span>
                  <span>
                    ₹50,000+
                  </span>
                </div>
              </div>
            </div>

            {/* COMPONENT FOCUS */}
            <div className="mt-10">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                Step 03
              </p>

              <h4 className="mt-1 text-xl font-black">
                What do you want to focus on?
              </h4>

              <div className="mt-5 relative max-w-2xl">
                <select
                  value={
                    focusCategory
                  }
                  onChange={(e) => {
                    setFocusCategory(
                      e.target
                        .value as
                        | "all"
                        | SetupCategory
                    );
                    setSetupReady(
                      false
                    );
                    setSelectedProducts(
                      []
                    );
                  }}
                  className="h-13 w-full appearance-none rounded-2xl border border-[#e4dbca] bg-[#fffdf9] px-4 pr-11 text-sm font-bold text-gray-700 outline-none focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
                >
                  <option value="all">
                    Complete Setup
                  </option>

                  {setupCategories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.title
                        }
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* LIVE SUMMARY */}
            <div className="mt-10 grid overflow-hidden rounded-2xl border border-[#eadfca] bg-[#fffaf0] sm:grid-cols-4">
              <div className="border-b border-[#eadfca] p-4 sm:border-b-0 sm:border-r">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Setup Type
                </p>

                <p className="mt-1 text-sm font-black">
                  {
                    setupTypes.find(
                      (item) =>
                        item.id ===
                        setupType
                    )?.title
                  }
                </p>
              </div>

              <div className="border-b border-[#eadfca] p-4 sm:border-b-0 sm:border-r">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Budget
                </p>

                <p className="mt-1 text-sm font-black">
                  {formatPrice(
                    budget
                  )}
                </p>
              </div>

              <div className="border-b border-[#eadfca] p-4 sm:border-b-0 sm:border-r">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Products Found
                </p>

                <p className="mt-1 text-sm font-black">
                  {
                    setupProducts.length
                  }
                </p>
              </div>

              <div className="p-4">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Smart Picks
                </p>

                <p className="mt-1 text-sm font-black">
                  {
                    smartSetup.length
                  }
                </p>
              </div>
            </div>

            {/* ACTION */}
            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#eee7da] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={
                  resetBuilder
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e4dccd] px-5 text-xs font-black text-gray-600 hover:bg-[#fffaf0]"
              >
                <RefreshCw size={15} />
                Start Over
              </button>

              <button
                type="button"
                disabled={
                  loading ||
                  building
                }
                onClick={
                  buildSetup
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-7 text-xs font-black text-white shadow-lg shadow-[#c9a24d]/15 transition hover:bg-[#b48a3d] disabled:opacity-60"
              >
                {building ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Building Your Setup...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Build My Setup
                    <ArrowRight
                      size={15}
                    />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* SETUP RESULT */}
        {setupReady && (
          <section
            id="setup-result"
            className="mt-7 scroll-mt-24"
          >
            <div className="overflow-hidden rounded-[28px] border border-[#dfc98e] bg-white shadow-sm">
              {/* RESULT HEADER */}
              <div className="bg-[#fff8e8] px-5 py-7 sm:px-8">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#a17b2f]">
                      <BadgeCheck size={12} />
                      Setup Ready
                    </div>

                    <h3 className="mt-3 text-2xl font-black sm:text-3xl">
                      Your{" "}
                      {
                        setupTypes.find(
                          (item) =>
                            item.id ===
                            setupType
                        )?.title
                      }
                    </h3>

                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      A smart collection of products
                      selected around your budget and setup
                      purpose.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      addFullSetupToCart
                    }
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-6 text-xs font-black text-white"
                  >
                    <ShoppingCart
                      size={16}
                    />
                    Add Complete Setup
                  </button>
                </div>
              </div>

              {/* METRICS */}
              <div className="grid grid-cols-2 border-t border-[#eadfca] sm:grid-cols-4">
                <div className="border-b border-[#eadfca] p-5 sm:border-b-0 sm:border-r">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Setup Budget
                  </p>

                  <p className="mt-2 text-xl font-black">
                    {formatPrice(
                      budget
                    )}
                  </p>
                </div>

                <div className="border-b border-[#eadfca] p-5 sm:border-b-0 sm:border-r">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Setup Value
                  </p>

                  <p className="mt-2 text-xl font-black">
                    {formatPrice(
                      setupSpend
                    )}
                  </p>
                </div>

                <div className="border-r border-[#eadfca] p-5">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Remaining
                  </p>

                  <p className="mt-2 text-xl font-black text-emerald-600">
                    {formatPrice(
                      remaining
                    )}
                  </p>
                </div>

                <div className="p-5">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Estimated Savings
                  </p>

                  <p className="mt-2 text-xl font-black text-[#a17b2f]">
                    {formatPrice(
                      savings
                    )}
                  </p>
                </div>
              </div>

              {/* BUDGET BAR */}
              <div className="border-t border-[#eadfca] p-5 sm:p-8">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b58a32]">
                      Budget Intelligence
                    </p>

                    <h4 className="mt-1 text-lg font-black">
                      {utilization}% of your budget allocated
                    </h4>
                  </div>

                  <span className="text-sm font-black text-[#956f27]">
                    {formatPrice(
                      remaining
                    )}{" "}
                    available
                  </span>
                </div>

                <div className="mt-4 h-4 overflow-hidden rounded-full bg-[#eee5d5]">
                  <div
                    className="h-full rounded-full bg-[#c9a24d] transition-all duration-700"
                    style={{
                      width: `${Math.max(
                        2,
                        utilization
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* SETUP PRODUCTS */}
            <div className="mt-7">
              <div className="mb-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                  Curated setup
                </p>

                <h3 className="mt-1 text-2xl font-black">
                  Everything you need
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Your setup is built from products available
                  in your PrimeCart catalogue.
                </p>
              </div>

              {finalSetupProducts.length ===
              0 ? (
                <div className="rounded-[24px] border border-[#eadfca] bg-white p-16 text-center">
                  <Package
                    size={38}
                    className="mx-auto text-[#c9a24d]"
                  />

                  <h4 className="mt-4 text-lg font-black">
                    No complete setup found
                  </h4>

                  <p className="mt-2 text-sm text-gray-500">
                    Try increasing your budget or choosing
                    another setup type.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {finalSetupProducts.map(
                    (
                      product,
                      index
                    ) => {
                      const image =
                        getImageUrl(
                          product.image_url
                        );

                      const discount =
                        getDiscount(
                          Number(
                            product.price
                          ),
                          product.original_price
                            ? Number(
                                product.original_price
                              )
                            : null
                        );

                      const added =
                        cartIds.includes(
                          product.id
                        );

                      return (
                        <div
                          key={
                            product.id
                          }
                          className="group flex flex-col gap-4 rounded-[22px] border border-[#e8dfcf] bg-white p-4 transition hover:border-[#d5bb7c] hover:shadow-md sm:flex-row sm:items-center"
                        >
                          <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-[#faf9f6] sm:h-28 sm:w-28">
                            {image ? (
                              <Image
                                src={image}
                                alt={
                                  product.name
                                }
                                fill
                                className="object-contain p-3 transition group-hover:scale-105"
                                sizes="112px"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-gray-300">
                                <Package
                                  size={30}
                                />
                              </div>
                            )}

                            <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#181818] text-[9px] font-black text-white">
                              {index +
                                1}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            {product.brand && (
                              <p className="text-[9px] font-black uppercase tracking-wider text-[#a17b2f]">
                                {
                                  product.brand
                                }
                              </p>
                            )}

                            <Link
                              href={`/dashboard/products/${product.id}`}
                            >
                              <h4 className="mt-1 line-clamp-2 text-base font-black group-hover:text-[#a17b2f]">
                                {
                                  product.name
                                }
                              </h4>
                            </Link>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#fff4d8] px-2 py-1 text-[10px] font-black text-[#956f27]">
                                <Star
                                  size={10}
                                  fill="currentColor"
                                />
                                {Number(
                                  product.rating ||
                                    0
                                ).toFixed(
                                  1
                                )}
                              </span>

                              <span className="text-[10px] text-gray-400">
                                {
                                  product.reviews_count
                                }{" "}
                                reviews
                              </span>

                              {product.is_flash_sale && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-500">
                                  <Zap
                                    size={
                                      10
                                    }
                                  />
                                  Flash Deal
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                            <div>
                              <p className="text-lg font-black">
                                {formatPrice(
                                  Number(
                                    product.price
                                  )
                                )}
                              </p>

                              {discount >
                                0 && (
                                <div className="flex items-center gap-2 sm:justify-end">
                                  <span className="text-[10px] text-gray-400 line-through">
                                    {formatPrice(
                                      Number(
                                        product.original_price
                                      )
                                    )}
                                  </span>

                                  <span className="text-[9px] font-black text-emerald-600">
                                    {
                                      discount
                                    }
                                    % OFF
                                  </span>
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                addToCart(
                                  product
                                )
                              }
                              className={`mt-0 inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-[10px] font-black sm:mt-3 ${
                                added
                                  ? "bg-emerald-600 text-white"
                                  : "bg-[#fff3d4] text-[#956f27]"
                              }`}
                            >
                              {added ? (
                                <>
                                  <Check
                                    size={
                                      13
                                    }
                                  />
                                  Added
                                </>
                              ) : (
                                <>
                                  <ShoppingCart
                                    size={
                                      13
                                    }
                                  />
                                  Add to Cart
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* DISCOVER MORE */}
        <section className="mt-14">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                Discover
              </p>

              <h3 className="mt-1 text-2xl font-black">
                More products for your setup
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Pick individual components and customize your
                setup.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#fff3d5] px-3 py-1.5 text-[9px] font-black text-[#956f27]">
              <Search size={11} />
              {setupProducts.length} products
            </span>
          </div>

          {loading ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="h-[410px] animate-pulse rounded-[24px] bg-[#ebe6dd]"
                  />
                )
              )}
            </div>
          ) : setupProducts.length ===
            0 ? (
            <div className="mt-6 rounded-[24px] border border-[#eadfca] bg-white p-14 text-center">
              <CircleDollarSign
                size={38}
                className="mx-auto text-[#c9a24d]"
              />

              <h4 className="mt-4 text-lg font-black">
                No products found
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                Increase your budget or change the focus to
                discover more products.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {setupProducts
                .slice(0, 8)
                .map((product) => {
                  const image =
                    getImageUrl(
                      product.image_url
                    );

                  const wished =
                    wishlist.includes(
                      product.id
                    );

                  const selected =
                    activeProductIds.includes(
                      product.id
                    );

                  const added =
                    cartIds.includes(
                      product.id
                    );

                  const discount =
                    getDiscount(
                      Number(
                        product.price
                      ),
                      product.original_price
                        ? Number(
                            product.original_price
                          )
                        : null
                    );

                  return (
                    <article
                      key={
                        product.id
                      }
                      className={`group overflow-hidden rounded-[24px] border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                        selected
                          ? "border-[#c9a24d]"
                          : "border-[#e8dfcf]"
                      }`}
                    >
                      <div className="relative h-60 overflow-hidden bg-[#faf9f6]">
                        {image ? (
                          <Image
                            src={
                              image
                            }
                            alt={
                              product.name
                            }
                            fill
                            className="object-contain p-5 transition duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-300">
                            <Package
                              size={40}
                            />
                          </div>
                        )}

                        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#181818] px-3 py-1.5 text-[9px] font-black text-white">
                          <Sparkles
                            size={10}
                          />
                          {
                            product.setupScore
                          }
                          % MATCH
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            toggleWishlist(
                              product.id
                            )
                          }
                          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border bg-white/95 shadow-sm ${
                            wished
                              ? "border-red-200 text-red-500"
                              : "border-[#e8dfcf] text-gray-500"
                          }`}
                        >
                          <Heart
                            size={
                              18
                            }
                            fill={
                              wished
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>

                        {discount >
                          0 && (
                          <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[9px] font-black text-white">
                            {
                              discount
                            }
                            % OFF
                          </span>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <span className="max-w-[65%] truncate text-[9px] font-black uppercase tracking-wider text-[#a17b2f]">
                            PrimeCart
                          </span>

                          {product.is_flash_sale && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-red-500">
                              <Zap
                                size={
                                  10
                                }
                              />
                              DEAL
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/dashboard/products/${product.id}`}
                        >
                          <h4 className="mt-2 line-clamp-2 min-h-[42px] text-[15px] font-black leading-5 group-hover:text-[#a17b2f]">
                            {
                              product.name
                            }
                          </h4>
                        </Link>

                        {product.brand && (
                          <p className="mt-1 text-[10px] text-gray-400">
                            {
                              product.brand
                            }
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#fff4d8] px-2 py-1 text-[10px] font-black text-[#956f27]">
                            <Star
                              size={
                                10
                              }
                              fill="currentColor"
                            />
                            {Number(
                              product.rating ||
                                0
                            ).toFixed(
                              1
                            )}
                          </span>

                          <span className="text-[10px] text-gray-400">
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
                                product.price
                              )
                            )}
                          </span>

                          {product.original_price &&
                            Number(
                              product.original_price
                            ) >
                              Number(
                                product.price
                              ) && (
                              <span className="mb-0.5 text-[10px] text-gray-400 line-through">
                                {formatPrice(
                                  Number(
                                    product.original_price
                                  )
                                )}
                              </span>
                            )}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              toggleProduct(
                                product.id
                              )
                            }
                            className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-[10px] font-black ${
                              selected
                                ? "bg-[#c9a24d] text-white"
                                : "border border-[#e4dccd] text-gray-600 hover:border-[#c9a24d]"
                            }`}
                          >
                            {selected ? (
                              <>
                                <Check
                                  size={
                                    13
                                  }
                                />
                                Selected
                              </>
                            ) : (
                              <>
                                <Plus
                                  size={
                                    13
                                  }
                                />
                                Add
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              addToCart(
                                product
                              )
                            }
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              added
                                ? "bg-emerald-600 text-white"
                                : "bg-[#fff3d4] text-[#956f27]"
                            }`}
                          >
                            {added ? (
                              <Check
                                size={
                                  15
                                }
                              />
                            ) : (
                              <ShoppingCart
                                size={
                                  15
                                }
                              />
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          )}
        </section>

        {/* COMPONENTS */}
        <section className="mt-14">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b58a32]">
              Setup Components
            </p>

            <h3 className="mt-2 text-2xl font-black">
              Build it your way
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
              Choose the components that matter most for your
              workspace.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                icon: Monitor,
                title: "Display",
                text: "Screen & monitor",
              },
              {
                icon: Keyboard,
                title: "Keyboard",
                text: "Typing experience",
              },
              {
                icon: Mouse,
                title: "Mouse",
                text: "Precision control",
              },
              {
                icon: Headphones,
                title: "Audio",
                text: "Sound & calls",
              },
              {
                icon: Gamepad2,
                title: "Extras",
                text: "Complete the setup",
              },
            ].map(
              ({
                icon: Icon,
                title,
                text,
              }) => (
                <div
                  key={title}
                  className="rounded-[22px] border border-[#e8dfcf] bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff5dc] text-[#b58a32]">
                    <Icon
                      size={20}
                    />
                  </div>

                  <h4 className="mt-4 text-sm font-black">
                    {title}
                  </h4>

                  <p className="mt-1 text-[10px] text-gray-400">
                    {text}
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-10 overflow-hidden rounded-[28px] border border-[#dfc98e] bg-[#fff6df]">
          <div className="relative flex flex-col items-center justify-between gap-6 px-6 py-9 text-center md:flex-row md:text-left">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#956f27]">
                PrimeCart Setup Studio
              </p>

              <h3 className="mt-2 text-xl font-black sm:text-2xl">
                Your perfect setup starts with the right plan.
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Change your purpose or budget anytime and
                rebuild your setup.
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
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#c9a24d] px-5 text-xs font-black text-white hover:bg-[#b48a3d]"
            >
              <RefreshCw
                size={14}
              />
              Rebuild Setup
            </button>
          </div>
        </section>

        <div className="h-10" />
      </main>
    </div>
  );
}
