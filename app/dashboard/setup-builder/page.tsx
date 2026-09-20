"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleDollarSign,
  Gamepad2,
  Headphones,
  Heart,
  Home,
  Keyboard,
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
  Trash2,
  Trophy,
  WalletCards,
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

type ComponentType =
  | "display"
  | "keyboard"
  | "mouse"
  | "audio"
  | "accessories";

type PriorityType =
  | "balanced"
  | "value"
  | "quality"
  | "savings";

type SetupProduct = Product & {
  matchScore: number;
  component: ComponentType;
};

const setupTypes: {
  id: SetupType;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof BriefcaseBusiness;
}[] = [
  {
    id: "work",
    title: "Work",
    subtitle: "Productivity",
    description:
      "A clean and productive workspace for everyday work.",
    icon: BriefcaseBusiness,
  },
  {
    id: "gaming",
    title: "Gaming",
    subtitle: "Performance",
    description:
      "Immersive gear focused on gaming and performance.",
    icon: Gamepad2,
  },
  {
    id: "study",
    title: "Study",
    subtitle: "Focus",
    description:
      "A comfortable setup for learning and deep focus.",
    icon: Laptop,
  },
  {
    id: "creator",
    title: "Creator",
    subtitle: "Creative",
    description:
      "A versatile workspace for content and creative work.",
    icon: Monitor,
  },
  {
    id: "everyday",
    title: "Everyday",
    subtitle: "Balanced",
    description:
      "A flexible setup for work, entertainment and daily use.",
    icon: Home,
  },
];

const components: {
  id: ComponentType;
  title: string;
  description: string;
  icon: typeof Monitor;
  keywords: string[];
}[] = [
  {
    id: "display",
    title: "Display",
    description: "Monitor & screen",
    icon: Monitor,
    keywords: [
      "monitor",
      "display",
      "screen",
      "led",
      "tv",
    ],
  },
  {
    id: "keyboard",
    title: "Keyboard",
    description: "Typing & control",
    icon: Keyboard,
    keywords: [
      "keyboard",
      "mechanical",
    ],
  },
  {
    id: "mouse",
    title: "Mouse",
    description: "Precision & navigation",
    icon: Mouse,
    keywords: [
      "mouse",
    ],
  },
  {
    id: "audio",
    title: "Audio",
    description: "Headphones & sound",
    icon: Headphones,
    keywords: [
      "headphone",
      "headphones",
      "earbuds",
      "earphone",
      "speaker",
      "audio",
    ],
  },
  {
    id: "accessories",
    title: "Accessories",
    description: "Workspace extras",
    icon: Package,
    keywords: [
      "webcam",
      "stand",
      "hub",
      "cable",
      "lamp",
      "mouse pad",
      "accessory",
      "desk",
      "bag",
    ],
  },
];

const budgetPresets = [
  {
    label: "Starter",
    amount: 5000,
  },
  {
    label: "Balanced",
    amount: 10000,
  },
  {
    label: "Pro",
    amount: 20000,
  },
  {
    label: "Premium",
    amount: 35000,
  },
  {
    label: "Ultimate",
    amount: 50000,
  },
];

const priorityOptions: {
  id: PriorityType;
  title: string;
  description: string;
}[] = [
  {
    id: "balanced",
    title: "Balanced",
    description:
      "Best overall combination",
  },
  {
    id: "value",
    title: "Best Value",
    description:
      "More features for your money",
  },
  {
    id: "quality",
    title: "Top Quality",
    description:
      "Prioritize ratings & reviews",
  },
  {
    id: "savings",
    title: "Maximum Savings",
    description:
      "Prioritize discounts",
  },
];

const setupKeywords: Record<
  SetupType,
  string[]
> = {
  work: [
    "office",
    "work",
    "business",
    "productivity",
    "wireless",
    "keyboard",
    "mouse",
    "monitor",
  ],
  gaming: [
    "gaming",
    "game",
    "rgb",
    "mechanical",
    "gaming mouse",
    "headphone",
    "monitor",
  ],
  study: [
    "study",
    "student",
    "learning",
    "keyboard",
    "mouse",
    "headphone",
    "lamp",
  ],
  creator: [
    "creator",
    "content",
    "studio",
    "audio",
    "monitor",
    "headphone",
    "microphone",
  ],
  everyday: [
    "wireless",
    "smart",
    "keyboard",
    "mouse",
    "speaker",
    "headphone",
  ],
};

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
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

function discountPercent(
  price: number,
  original: number | null
) {
  if (
    !original ||
    original <= price
  ) {
    return 0;
  }

  return Math.round(
    ((original - price) /
      original) *
      100
  );
}

function detectComponent(
  product: Product
): ComponentType | null {
  const text =
    `${product.name} ${
      product.short_description || ""
    } ${
      product.description || ""
    } ${
      product.brand || ""
    }`.toLowerCase();

  for (const component of components) {
    if (
      component.keywords.some(
        (keyword) =>
          text.includes(
            keyword.toLowerCase()
          )
      )
    ) {
      return component.id;
    }
  }

  return null;
}

function calculateMatch(
  product: Product,
  setupType: SetupType,
  budget: number,
  priority: PriorityType
) {
  const price = Number(
    product.price || 0
  );

  const rating = Number(
    product.rating || 0
  );

  const reviews = Number(
    product.reviews_count || 0
  );

  let score = 0;

  // Budget fit
  if (price <= budget * 0.15) {
    score += 25;
  } else if (
    price <=
    budget * 0.3
  ) {
    score += 23;
  } else if (
    price <=
    budget * 0.5
  ) {
    score += 20;
  } else if (
    price <=
    budget * 0.75
  ) {
    score += 15;
  } else if (
    price <= budget
  ) {
    score += 10;
  }

  // Rating
  score += Math.round(
    (rating / 5) * 25
  );

  // Reviews
  score += Math.min(
    12,
    Math.round(reviews / 20)
  );

  // Setup purpose
  const productText =
    `${product.name} ${
      product.short_description ||
      ""
    } ${
      product.description || ""
    }`.toLowerCase();

  const purposeMatches =
    setupKeywords[
      setupType
    ].filter((keyword) =>
      productText.includes(
        keyword
      )
    ).length;

  score += Math.min(
    18,
    purposeMatches * 4
  );

  // Featured
  if (product.is_featured) {
    score += 5;
  }

  // Flash sale
  if (product.is_flash_sale) {
    score += 4;
  }

  // Priority
  const discount =
    discountPercent(
      price,
      product.original_price
        ? Number(
            product.original_price
          )
        : null
    );

  if (priority === "quality") {
    score += Math.round(
      rating * 2
    );
  }

  if (priority === "savings") {
    score += Math.min(
      10,
      discount
    );
  }

  if (priority === "value") {
    score += Math.min(
      8,
      Math.round(
        (rating * 2 +
          discount) /
          2
      )
    );
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

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [wishlist, setWishlist] =
    useState<string[]>([]);

  const [cartIds, setCartIds] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [building, setBuilding] =
    useState(false);

  const [step, setStep] =
    useState(1);

  const [setupType, setSetupType] =
    useState<SetupType>("work");

  const [budget, setBudget] =
    useState(20000);

  const [customBudget, setCustomBudget] =
    useState("20000");

  const [priority, setPriority] =
    useState<PriorityType>(
      "balanced"
    );

  const [
    selectedComponents,
    setSelectedComponents,
  ] = useState<ComponentType[]>(
    components.map(
      (component) =>
        component.id
    )
  );

  const [
    selectedProducts,
    setSelectedProducts,
  ] = useState<string[]>([]);

  const [
    setupBuilt,
    setSetupBuilt,
  ] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

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
        productResponse,
        categoryResponse,
        wishlistResponse,
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
            "id, name, slug"
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

      setProducts(
        (productResponse.data ||
          []) as Product[]
      );

      setCategories(
        (categoryResponse.data ||
          []) as Category[]
      );

      setWishlist(
        (
          wishlistResponse.data ||
          []
        ).map(
          (item) =>
            item.product_id
        )
      );
    } catch (error) {
      console.error(
        "Setup Builder:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  const matchedProducts =
    useMemo<SetupProduct[]>(() => {
      return products
        .filter(
          (product) =>
            product.stock > 0 &&
            Number(
              product.price
            ) <= budget
        )
        .map((product) => {
          const component =
            detectComponent(
              product
            );

          return {
            ...product,
            component:
              component ||
              "accessories",
            matchScore:
              calculateMatch(
                product,
                setupType,
                budget,
                priority
              ),
          };
        })
        .filter((product) =>
          selectedComponents.includes(
            product.component
          )
        )
        .sort(
          (a, b) =>
            b.matchScore -
            a.matchScore
        );
    }, [
      products,
      budget,
      setupType,
      priority,
      selectedComponents,
    ]);

  const recommendedProducts =
    useMemo(() => {
      const result: SetupProduct[] =
        [];

      for (const component of selectedComponents) {
        if (
          result.some(
            (item) =>
              item.component ===
              component
          )
        ) {
          continue;
        }

        const match =
          matchedProducts.find(
            (item) =>
              item.component ===
              component
          );

        if (match) {
          result.push(match);
        }
      }

      for (const product of matchedProducts) {
        if (
          result.length >= 6
        ) {
          break;
        }

        if (
          !result.some(
            (item) =>
              item.id ===
              product.id
          )
        ) {
          result.push(
            product
          );
        }
      }

      return result.slice(
        0,
        6
      );
    }, [
      matchedProducts,
      selectedComponents,
    ]);

  const finalProducts =
    selectedProducts.length
      ? selectedProducts
          .map((id) =>
            matchedProducts.find(
              (product) =>
                product.id === id
            )
          )
          .filter(
            Boolean
          ) as SetupProduct[]
      : recommendedProducts;

  const setupTotal =
    finalProducts.reduce(
      (sum, product) =>
        sum +
        Number(
          product.price
        ),
      0
    );

  const setupSavings =
    finalProducts.reduce(
      (sum, product) => {
        const original =
          product.original_price
            ? Number(
                product.original_price
              )
            : Number(
                product.price
              );

        return (
          sum +
          Math.max(
            0,
            original -
              Number(
                product.price
              )
          )
        );
      },
      0
    );

  const remainingBudget =
    Math.max(
      0,
      budget -
        setupTotal
    );

  const budgetUsage =
    budget > 0
      ? Math.min(
          100,
          Math.round(
            (setupTotal /
              budget) *
              100
          )
        )
      : 0;

  const averageRating =
    finalProducts.length
      ? finalProducts.reduce(
          (sum, product) =>
            sum +
            Number(
              product.rating || 0
            ),
          0
        ) /
        finalProducts.length
      : 0;

  const setupScore =
    finalProducts.length
      ? Math.min(
          99,
          Math.round(
            finalProducts.reduce(
              (sum, product) =>
                sum +
                product.matchScore,
              0
            ) /
              finalProducts.length
          )
        )
      : 0;

  function setNewBudget(
    value: number
  ) {
    const safeValue =
      Math.max(
        2000,
        Math.min(
          100000,
          Math.round(value)
        )
      );

    setBudget(
      safeValue
    );

    setCustomBudget(
      String(safeValue)
    );

    setSetupBuilt(
      false
    );

    setSelectedProducts(
      []
    );
  }

  function toggleComponent(
    id: ComponentType
  ) {
    setSelectedComponents(
      (current) => {
        if (
          current.includes(id)
        ) {
          if (
            current.length ===
            1
          ) {
            return current;
          }

          return current.filter(
            (item) =>
              item !== id
          );
        }

        return [
          ...current,
          id,
        ];
      }
    );

    setSetupBuilt(
      false
    );
  }

  function toggleProduct(
    productId: string
  ) {
    const product =
      matchedProducts.find(
        (item) =>
          item.id ===
          productId
      );

    if (!product) {
      return;
    }

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

        const currentTotal =
          current.reduce(
            (sum, id) => {
              const item =
                matchedProducts.find(
                  (productItem) =>
                    productItem.id ===
                    id
                );

              return (
                sum +
                Number(
                  item?.price ||
                    0
                )
              );
            },
            0
          );

        if (
          currentTotal +
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

    setSetupBuilt(
      false
    );
  }

  function nextStep() {
    setStep(
      (current) =>
        Math.min(
          4,
          current + 1
        )
    );
  }

  function previousStep() {
    setStep(
      (current) =>
        Math.max(
          1,
          current - 1
        )
    );
  }

  async function buildSetup() {
    setBuilding(
      true
    );

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          1200
        )
    );

    setSetupBuilt(
      true
    );

    setBuilding(
      false
    );

    setStep(4);

    setTimeout(() => {
      document
        .getElementById(
          "setup-results"
        )
        ?.scrollIntoView({
          behavior:
            "smooth",
          block: "start",
        });
    }, 200);
  }

  function resetAll() {
    setStep(1);
    setSetupType(
      "work"
    );
    setBudget(20000);
    setCustomBudget(
      "20000"
    );
    setPriority(
      "balanced"
    );
    setSelectedComponents(
      components.map(
        (item) =>
          item.id
      )
    );
    setSelectedProducts(
      []
    );
    setSetupBuilt(
      false
    );
  }

  function getCart(): CartItem[] {
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
    const cart =
      getCart();

    const existing =
      cart.find(
        (item) =>
          item.id ===
          product.id
      );

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
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

    saveCart(cart);

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

  function addCompleteSetup() {
    finalProducts.forEach(
      (product) =>
        addToCart(
          product
        )
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
        console.error(
          error
        );
        return;
      }

      setWishlist(
        (current) =>
          current.filter(
            (id) =>
              id !==
              productId
          )
      );
    } else {
      const { error } =
        await supabase
          .from("wishlist")
          .insert({
            user_id:
              user.id,
            product_id:
              productId,
          });

      if (error) {
        console.error(
          error
        );
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

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#181818]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#e8dfcf] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7dfd0] text-gray-500 transition hover:border-[#c9a24d] hover:text-[#a17b2f]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a24d] text-white shadow-sm">
                <Sparkles size={18} />
              </div>

              <div>
                <h1 className="text-sm font-black sm:text-base">
                  Setup Studio
                </h1>

                <p className="hidden text-[10px] font-medium text-gray-400 sm:block">
                  Build My Setup · PrimeCart
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/products"
              className="hidden h-10 items-center gap-2 rounded-xl border border-[#e7dfd0] px-4 text-[10px] font-black text-gray-600 transition hover:border-[#c9a24d] sm:flex"
            >
              <ShoppingCart size={14} />
              Browse Products
            </Link>

            <Link
              href="/dashboard"
              className="flex h-10 items-center gap-2 rounded-xl bg-[#fff4d7] px-4 text-[10px] font-black text-[#956f27]"
            >
              Dashboard
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[32px] border border-[#e5d8bd] bg-white">
          <div className="absolute -right-32 -top-40 h-[550px] w-[550px] rounded-full bg-[#f1dca7]/30 blur-3xl" />

          <div className="relative grid items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-16 lg:py-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e8dcc3] bg-[#fffaf0] px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                <Sparkles size={12} />
                PrimeCart Smart Studio
              </div>

              <h2 className="mt-6 max-w-3xl text-[42px] font-black leading-[1.02] tracking-[-0.045em] sm:text-5xl lg:text-[64px]">
                Build your
                <span className="block text-[#b58a32]">
                  perfect setup.
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
                Tell us what you need, set your budget and
                choose what matters most. PrimeCart will turn
                your preferences into a personalized setup.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {[
                  "Smart matching",
                  "Real catalogue",
                  "Budget aware",
                  "Personalized",
                ].map(
                  (item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#e9e1d4] bg-[#fffdf9] px-3 py-2 text-[9px] font-black text-gray-600"
                    >
                      <Check
                        size={11}
                        className="text-[#b58a32]"
                      />
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* HERO PREVIEW */}
            <div className="mx-auto w-full max-w-[420px]">
              <div className="rounded-[30px] border border-[#e8dcc3] bg-[#fffaf0] p-5 shadow-[0_25px_70px_rgba(120,90,30,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                      Current plan
                    </p>

                    <p className="mt-1 text-xl font-black">
                      {
                        setupTypes.find(
                          (item) =>
                            item.id ===
                            setupType
                        )?.title
                      }{" "}
                      Setup
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c9a24d] text-white">
                    <Target size={20} />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                      Budget
                    </span>

                    <span className="text-lg font-black">
                      {formatPrice(
                        budget
                      )}
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eee6d7]">
                    <div
                      className="h-full rounded-full bg-[#c9a24d] transition-all"
                      style={{
                        width: `${Math.max(
                          4,
                          Math.min(
                            100,
                            budgetUsage
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[9px] text-gray-400">
                    <span>
                      Allocated
                    </span>
                    <span>
                      {budgetUsage}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-white p-3">
                    <Monitor
                      size={16}
                      className="text-[#b58a32]"
                    />
                    <p className="mt-2 text-[9px] font-black">
                      Display
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-3">
                    <Keyboard
                      size={16}
                      className="text-[#b58a32]"
                    />
                    <p className="mt-2 text-[9px] font-black">
                      Keyboard
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-3">
                    <Headphones
                      size={16}
                      className="text-[#b58a32]"
                    />
                    <p className="mt-2 text-[9px] font-black">
                      Audio
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROGRESS */}
        <section className="mt-6 rounded-[24px] border border-[#e8dfd0] bg-white px-5 py-5 sm:px-8">
          <div className="flex items-center justify-between gap-3">
            {[
              {
                number: 1,
                title: "Purpose",
              },
              {
                number: 2,
                title: "Budget",
              },
              {
                number: 3,
                title: "Preferences",
              },
              {
                number: 4,
                title: "Your Setup",
              },
            ].map(
              (item, index) => (
                <div
                  key={
                    item.number
                  }
                  className="flex flex-1 items-center"
                >
                  <button
                    type="button"
                    onClick={() =>
                      item.number <=
                        step &&
                      setStep(
                        item.number
                      )
                    }
                    className="flex items-center gap-2"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                        step >=
                        item.number
                          ? "bg-[#c9a24d] text-white"
                          : "bg-[#f2eee6] text-gray-400"
                      }`}
                    >
                      {step >
                      item.number ? (
                        <Check
                          size={
                            13
                          }
                        />
                      ) : (
                        item.number
                      )}
                    </span>

                    <span
                      className={`hidden text-[10px] font-black sm:block ${
                        step >=
                        item.number
                          ? "text-[#956f27]"
                          : "text-gray-400"
                      }`}
                    >
                      {
                        item.title
                      }
                    </span>
                  </button>

                  {index <
                    3 && (
                    <div className="mx-2 h-px flex-1 bg-[#e8e0d2] sm:mx-5">
                      <div
                        className="h-full bg-[#c9a24d] transition-all"
                        style={{
                          width:
                            step >
                            item.number
                              ? "100%"
                              : "0%",
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </section>

        {/* BUILDER */}
        <section className="mt-6 rounded-[30px] border border-[#e8dfd0] bg-white shadow-sm">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="p-5 sm:p-8 lg:p-10">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                  Step 01 · Purpose
                </p>

                <h3 className="mt-2 text-2xl font-black sm:text-3xl">
                  What are you building?
                </h3>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                  Choose the environment that best describes
                  how you plan to use your setup.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                          setSetupBuilt(
                            false
                          );
                        }}
                        className={`relative rounded-[24px] border p-5 text-left transition duration-200 ${
                          active
                            ? "border-[#c9a24d] bg-[#fffaf0] shadow-[0_12px_35px_rgba(150,110,35,0.08)]"
                            : "border-[#e8e0d2] bg-white hover:-translate-y-1 hover:border-[#d2b66e] hover:shadow-md"
                        }`}
                      >
                        {active && (
                          <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#c9a24d] text-white">
                            <Check
                              size={
                                12
                              }
                            />
                          </span>
                        )}

                        <span
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                            active
                              ? "bg-[#c9a24d] text-white"
                              : "bg-[#fff5dd] text-[#a17b2f]"
                          }`}
                        >
                          <Icon
                            size={
                              21
                            }
                          />
                        </span>

                        <p className="mt-5 text-base font-black">
                          {
                            item.title
                          }
                        </p>

                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#a17b2f]">
                          {
                            item.subtitle
                          }
                        </p>

                        <p className="mt-3 text-[10px] leading-5 text-gray-400">
                          {
                            item.description
                          }
                        </p>
                      </button>
                    );
                  }
                )}
              </div>

              <div className="mt-8 flex justify-end border-t border-[#eee8dd] pt-6">
                <button
                  type="button"
                  onClick={
                    nextStep
                  }
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#c9a24d] px-7 text-xs font-black text-white shadow-lg shadow-[#c9a24d]/10 hover:bg-[#b58a3d]"
                >
                  Continue
                  <ArrowRight
                    size={15}
                  />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="p-5 sm:p-8 lg:p-10">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                    Step 02 · Budget
                  </p>

                  <h3 className="mt-2 text-2xl font-black sm:text-3xl">
                    How much do you want to spend?
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    We will keep your recommendations within
                    this budget.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e8dcc3] bg-[#fffaf0] px-5 py-4 text-right">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Your budget
                  </p>

                  <p className="mt-1 text-2xl font-black text-[#956f27]">
                    {formatPrice(
                      budget
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-[26px] border border-[#e8dfd0] bg-[#fffdf9] p-5 sm:p-8">
                <div className="flex flex-col items-center justify-center">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-[8px] border-[#c9a24d]/20 bg-[#fffaf0]">
                    <div className="text-center">
                      <WalletCards
                        size={21}
                        className="mx-auto text-[#b58a32]"
                      />

                      <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-gray-400">
                        Budget
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-3xl font-black">
                    {formatPrice(
                      budget
                    )}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Flexible setup budget
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {budgetPresets.map(
                    (preset) => {
                      const active =
                        budget ===
                        preset.amount;

                      return (
                        <button
                          key={
                            preset.amount
                          }
                          type="button"
                          onClick={() =>
                            setNewBudget(
                              preset.amount
                            )
                          }
                          className={`rounded-xl border px-3 py-3 text-center transition ${
                            active
                              ? "border-[#c9a24d] bg-[#fff5dc] text-[#956f27]"
                              : "border-[#e5ddcf] hover:border-[#d0b46c]"
                          }`}
                        >
                          <p className="text-[9px] font-black uppercase">
                            {
                              preset.label
                            }
                          </p>

                          <p className="mt-1 text-sm font-black">
                            {formatPrice(
                              preset.amount
                            )}
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>

                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                      Custom budget
                    </span>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#a17b2f]">
                        ₹
                      </span>

                      <input
                        value={
                          customBudget
                        }
                        inputMode="numeric"
                        onChange={(
                          event
                        ) => {
                          const value =
                            event.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );

                          setCustomBudget(
                            value
                          );

                          const number =
                            Number(
                              value
                            );

                          if (
                            number >=
                              2000 &&
                            number <=
                              100000
                          ) {
                            setBudget(
                              number
                            );
                            setSetupBuilt(
                              false
                            );
                          }
                        }}
                        className="h-10 w-32 rounded-xl border border-[#ddd4c3] bg-white pl-7 pr-3 text-right text-sm font-black outline-none focus:border-[#c9a24d]"
                      />
                    </div>
                  </div>

                  <input
                    type="range"
                    min="2000"
                    max="50000"
                    step="500"
                    value={Math.min(
                      budget,
                      50000
                    )}
                    onChange={(event) =>
                      setNewBudget(
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                    className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e8dfcf] accent-[#c9a24d]"
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

              <div className="mt-8 flex justify-between border-t border-[#eee8dd] pt-6">
                <button
                  type="button"
                  onClick={
                    previousStep
                  }
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#e4dccd] px-5 text-xs font-black text-gray-600"
                >
                  <ArrowLeft
                    size={15}
                  />
                  Back
                </button>

                <button
                  type="button"
                  onClick={
                    nextStep
                  }
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#c9a24d] px-7 text-xs font-black text-white"
                >
                  Continue
                  <ArrowRight
                    size={15}
                  />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="p-5 sm:p-8 lg:p-10">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                  Step 03 · Preferences
                </p>

                <h3 className="mt-2 text-2xl font-black sm:text-3xl">
                  Make it yours.
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Tell us which components and shopping style
                  matter most.
                </p>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
                {/* COMPONENTS */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-black">
                        Components
                      </h4>

                      <p className="mt-1 text-[10px] text-gray-400">
                        Select what you want in your setup.
                      </p>
                    </div>

                    <span className="rounded-full bg-[#fff5dc] px-3 py-1.5 text-[9px] font-black text-[#956f27]">
                      {
                        selectedComponents.length
                      }{" "}
                      selected
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {components.map(
                      (component) => {
                        const Icon =
                          component.icon;

                        const active =
                          selectedComponents.includes(
                            component.id
                          );

                        return (
                          <button
                            key={
                              component.id
                            }
                            type="button"
                            onClick={() =>
                              toggleComponent(
                                component.id
                              )
                            }
                            className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                              active
                                ? "border-[#c9a24d] bg-[#fffaf0]"
                                : "border-[#e8e0d2] hover:border-[#d2b66e]"
                            }`}
                          >
                            <span
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                active
                                  ? "bg-[#c9a24d] text-white"
                                  : "bg-[#f7f3eb] text-[#a17b2f]"
                              }`}
                            >
                              <Icon
                                size={
                                  18
                                }
                              />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block text-xs font-black">
                                {
                                  component.title
                                }
                              </span>

                              <span className="mt-1 block text-[9px] text-gray-400">
                                {
                                  component.description
                                }
                              </span>
                            </span>

                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                active
                                  ? "border-[#c9a24d] bg-[#c9a24d] text-white"
                                  : "border-[#ddd5c7] text-transparent"
                              }`}
                            >
                              <Check
                                size={
                                  12
                                }
                              />
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* PRIORITY */}
                <div>
                  <div>
                    <h4 className="text-base font-black">
                      What matters most?
                    </h4>

                    <p className="mt-1 text-[10px] text-gray-400">
                      We use this to rank products.
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {priorityOptions.map(
                      (option) => {
                        const active =
                          priority ===
                          option.id;

                        return (
                          <button
                            key={
                              option.id
                            }
                            type="button"
                            onClick={() => {
                              setPriority(
                                option.id
                              );
                              setSetupBuilt(
                                false
                              );
                            }}
                            className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left ${
                              active
                                ? "border-[#c9a24d] bg-[#fffaf0]"
                                : "border-[#e8e0d2]"
                            }`}
                          >
                            <span
                              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                active
                                  ? "bg-[#c9a24d] text-white"
                                  : "bg-[#f7f3eb] text-[#a17b2f]"
                              }`}
                            >
                              {option.id ===
                              "balanced" ? (
                                <Target
                                  size={
                                    17
                                  }
                                />
                              ) : option.id ===
                                "value" ? (
                                <CircleDollarSign
                                  size={
                                    17
                                  }
                                />
                              ) : option.id ===
                                "quality" ? (
                                <Trophy
                                  size={
                                    17
                                  }
                                />
                              ) : (
                                <Zap
                                  size={
                                    17
                                  }
                                />
                              )}
                            </span>

                            <span className="flex-1">
                              <span className="block text-xs font-black">
                                {
                                  option.title
                                }
                              </span>

                              <span className="mt-1 block text-[9px] text-gray-400">
                                {
                                  option.description
                                }
                              </span>
                            </span>

                            {active && (
                              <Check
                                size={
                                  16
                                }
                                className="text-[#b58a32]"
                              />
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-[#eadfca] bg-[#fffaf0] p-4">
                <div className="flex items-start gap-3">
                  <Sparkles
                    size={18}
                    className="mt-0.5 shrink-0 text-[#b58a32]"
                  />

                  <div>
                    <p className="text-xs font-black">
                      Smart matching is ready
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-gray-500">
                      PrimeCart will combine your{" "}
                      <strong>
                        {
                          setupTypes.find(
                            (item) =>
                              item.id ===
                              setupType
                          )?.title
                        }
                      </strong>{" "}
                      preference,{" "}
                      <strong>
                        {formatPrice(
                          budget
                        )}
                      </strong>{" "}
                      budget and{" "}
                      <strong>
                        {
                          priorityOptions.find(
                            (item) =>
                              item.id ===
                              priority
                          )?.title
                        }
                      </strong>{" "}
                      priority.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between border-t border-[#eee8dd] pt-6">
                <button
                  type="button"
                  onClick={
                    previousStep
                  }
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#e4dccd] px-5 text-xs font-black text-gray-600"
                >
                  <ArrowLeft
                    size={15}
                  />
                  Back
                </button>

                <button
                  type="button"
                  onClick={
                    buildSetup
                  }
                  disabled={
                    building ||
                    loading
                  }
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#c9a24d] px-7 text-xs font-black text-white shadow-lg shadow-[#c9a24d]/15 disabled:opacity-60"
                >
                  {building ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Building...
                    </>
                  ) : (
                    <>
                      <Sparkles
                        size={
                          15
                        }
                      />
                      Build My Setup
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 PREVIEW */}
          {step === 4 && (
            <div className="p-5 sm:p-8 lg:p-10">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                    Step 04 · Setup
                  </p>

                  <h3 className="mt-2 text-2xl font-black sm:text-3xl">
                    Your setup is ready.
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Review your recommended components below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    resetAll
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e4dccd] px-4 text-[10px] font-black text-gray-600"
                >
                  <RefreshCw
                    size={13}
                  />
                  Start Over
                </button>
              </div>

              {/* QUICK SCORE */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-[#e8dfd0] bg-[#fffaf0] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                      Setup Score
                    </span>

                    <Trophy
                      size={16}
                      className="text-[#b58a32]"
                    />
                  </div>

                  <p className="mt-3 text-3xl font-black">
                    {setupScore}
                    <span className="text-sm text-gray-400">
                      /100
                    </span>
                  </p>

                  <div className="mt-3 h-1.5 rounded-full bg-[#e8dfcf]">
                    <div
                      className="h-full rounded-full bg-[#c9a24d]"
                      style={{
                        width: `${setupScore}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e8dfd0] bg-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                      Products
                    </span>

                    <Package
                      size={16}
                      className="text-[#b58a32]"
                    />
                  </div>

                  <p className="mt-3 text-3xl font-black">
                    {
                      finalProducts.length
                    }
                  </p>

                  <p className="mt-1 text-[9px] text-gray-400">
                    Components selected
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e8dfd0] bg-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                      Rating
                    </span>

                    <Star
                      size={16}
                      className="fill-[#c9a24d] text-[#c9a24d]"
                    />
                  </div>

                  <p className="mt-3 text-3xl font-black">
                    {averageRating.toFixed(
                      1
                    )}
                  </p>

                  <p className="mt-1 text-[9px] text-gray-400">
                    Average product rating
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e8dfd0] bg-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                      Savings
                    </span>

                    <Zap
                      size={16}
                      className="text-emerald-600"
                    />
                  </div>

                  <p className="mt-3 text-3xl font-black text-emerald-600">
                    {formatPrice(
                      setupSavings
                    )}
                  </p>

                  <p className="mt-1 text-[9px] text-gray-400">
                    Estimated catalogue savings
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* RESULTS */}
        {setupBuilt && (
          <section
            id="setup-results"
            className="mt-7 scroll-mt-24"
          >
            <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
              {/* PRODUCTS */}
              <div>
                <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                      Smart Recommendations
                    </p>

                    <h3 className="mt-1 text-2xl font-black">
                      Your curated setup
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Products selected using your purpose,
                      budget and priorities.
                    </p>
                  </div>

                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#fff4d8] px-3 py-1.5 text-[9px] font-black text-[#956f27]">
                    <BadgeCheck
                      size={11}
                    />
                    {setupScore}% setup match
                  </span>
                </div>

                {finalProducts.length ===
                0 ? (
                  <div className="rounded-[26px] border border-[#e8dfd0] bg-white p-16 text-center">
                    <Search
                      size={38}
                      className="mx-auto text-[#c9a24d]"
                    />

                    <h4 className="mt-4 text-lg font-black">
                      No suitable products found
                    </h4>

                    <p className="mt-2 text-sm text-gray-500">
                      Try increasing your budget or selecting
                      more components.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {finalProducts.map(
                      (
                        product,
                        index
                      ) => {
                        const image =
                          getImageUrl(
                            product.image_url
                          );

                        const wished =
                          wishlist.includes(
                            product.id
                          );

                        const added =
                          cartIds.includes(
                            product.id
                          );

                        const discount =
                          discountPercent(
                            Number(
                              product.price
                            ),
                            product.original_price
                              ? Number(
                                  product.original_price
                                )
                              : null
                          );

                        const ComponentIcon =
                          components.find(
                            (item) =>
                              item.id ===
                              product.component
                          )?.icon ||
                          Package;

                        return (
                          <article
                            key={
                              product.id
                            }
                            className="group overflow-hidden rounded-[26px] border border-[#e8dfd0] bg-white transition hover:border-[#d3b76e] hover:shadow-lg"
                          >
                            <div className="flex flex-col sm:flex-row">
                              <div className="relative h-56 w-full shrink-0 bg-[#faf9f6] sm:h-48 sm:w-48">
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
                                    sizes="192px"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-gray-300">
                                    <Package
                                      size={
                                        38
                                      }
                                    />
                                  </div>
                                )}

                                <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#181818] text-[9px] font-black text-white">
                                  {index +
                                    1}
                                </span>

                                {discount >
                                  0 && (
                                  <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[9px] font-black text-white">
                                    {
                                      discount
                                    }
                                    % OFF
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleWishlist(
                                      product.id
                                    )
                                  }
                                  className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border bg-white/95 ${
                                    wished
                                      ? "border-red-200 text-red-500"
                                      : "border-[#e6ddce] text-gray-500"
                                  }`}
                                >
                                  <Heart
                                    size={
                                      16
                                    }
                                    fill={
                                      wished
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                </button>
                              </div>

                              <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
                                <div>
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#fff5dc] px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#956f27]">
                                      <ComponentIcon
                                        size={
                                          11
                                        }
                                      />
                                      {
                                        components.find(
                                          (
                                            item
                                          ) =>
                                            item.id ===
                                            product.component
                                        )?.title
                                      }
                                    </span>

                                    <span className="text-[9px] font-black text-[#b58a32]">
                                      {
                                        product.matchScore
                                      }
                                      % MATCH
                                    </span>
                                  </div>

                                  <Link
                                    href={`/dashboard/products/${product.id}`}
                                  >
                                    <h4 className="mt-3 text-lg font-black group-hover:text-[#a17b2f]">
                                      {
                                        product.name
                                      }
                                    </h4>
                                  </Link>

                                  {product.brand && (
                                    <p className="mt-1 text-[10px] font-bold text-gray-400">
                                      {
                                        product.brand
                                      }
                                    </p>
                                  )}

                                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                                    {
                                      product.short_description
                                    }
                                  </p>

                                  <div className="mt-3 flex flex-wrap items-center gap-2">
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

                                    {product.is_flash_sale && (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-black text-red-500">
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

                                <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                                  <div>
                                    <div className="flex items-end gap-2">
                                      <span className="text-2xl font-black">
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
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleProduct(
                                          product.id
                                        )
                                      }
                                      className={`flex h-10 items-center gap-2 rounded-xl px-4 text-[10px] font-black ${
                                        selectedProducts.includes(
                                          product.id
                                        )
                                          ? "bg-[#c9a24d] text-white"
                                          : "border border-[#e3dacb] text-gray-600"
                                      }`}
                                    >
                                      {selectedProducts.includes(
                                        product.id
                                      ) ? (
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
                                          Customize
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
                                      className={`flex h-10 items-center gap-2 rounded-xl px-4 text-[10px] font-black ${
                                        added
                                          ? "bg-emerald-600 text-white"
                                          : "bg-[#fff3d4] text-[#956f27]"
                                      }`}
                                    >
                                      {added ? (
                                        <Check
                                          size={
                                            13
                                          }
                                        />
                                      ) : (
                                        <ShoppingCart
                                          size={
                                            13
                                          }
                                        />
                                      )}

                                      {added
                                        ? "Added"
                                        : "Add"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* STICKY SUMMARY */}
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="overflow-hidden rounded-[28px] border border-[#dfc98e] bg-white shadow-sm">
                  <div className="bg-[#fff7e3] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                          Setup Summary
                        </p>

                        <h4 className="mt-1 text-lg font-black">
                          {
                            setupTypes.find(
                              (item) =>
                                item.id ===
                                setupType
                            )?.title
                          }{" "}
                          Setup
                        </h4>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c9a24d] text-white">
                        <Sparkles
                          size={18}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400">
                        Setup value
                      </span>

                      <span className="text-lg font-black">
                        {formatPrice(
                          setupTotal
                        )}
                      </span>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#eee6d7]">
                      <div
                        className="h-full rounded-full bg-[#c9a24d] transition-all"
                        style={{
                          width: `${Math.max(
                            2,
                            budgetUsage
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="mt-2 flex justify-between text-[9px] text-gray-400">
                      <span>
                        {budgetUsage}% used
                      </span>

                      <span>
                        {formatPrice(
                          remainingBudget
                        )}{" "}
                        left
                      </span>
                    </div>

                    <div className="my-5 h-px bg-[#eee8dd]" />

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[10px] text-gray-500">
                          Budget
                        </span>

                        <span className="text-[10px] font-black">
                          {formatPrice(
                            budget
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[10px] text-gray-500">
                          Products
                        </span>

                        <span className="text-[10px] font-black">
                          {
                            finalProducts.length
                          }
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[10px] text-gray-500">
                          Savings
                        </span>

                        <span className="text-[10px] font-black text-emerald-600">
                          {formatPrice(
                            setupSavings
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[10px] text-gray-500">
                          Match score
                        </span>

                        <span className="text-[10px] font-black text-[#a17b2f]">
                          {
                            setupScore
                          }
                          %
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        addCompleteSetup
                      }
                      disabled={
                        finalProducts.length ===
                        0
                      }
                      className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c9a24d] text-xs font-black text-white shadow-lg shadow-[#c9a24d]/15 disabled:opacity-50"
                    >
                      <ShoppingCart
                        size={15}
                      />
                      Add Complete Setup
                    </button>

                    <Link
                      href="/dashboard/products"
                      className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e4dccd] text-[10px] font-black text-gray-600"
                    >
                      Browse More Products
                      <ArrowRight
                        size={13}
                      />
                    </Link>
                  </div>
                </div>

                {/* WHY THIS SETUP */}
                <div className="mt-4 rounded-[24px] border border-[#e8dfd0] bg-white p-5">
                  <div className="flex items-center gap-2">
                    <BadgeCheck
                      size={17}
                      className="text-[#b58a32]"
                    />

                    <h4 className="text-sm font-black">
                      Why this setup?
                    </h4>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#c9a24d]" />

                      <p className="text-[10px] leading-5 text-gray-500">
                        Products are matched to your{" "}
                        <strong className="text-gray-700">
                          {
                            setupTypes.find(
                              (item) =>
                                item.id ===
                                setupType
                            )?.title
                          }
                        </strong>{" "}
                        purpose.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#c9a24d]" />

                      <p className="text-[10px] leading-5 text-gray-500">
                        Recommendations stay within your{" "}
                        <strong className="text-gray-700">
                          {formatPrice(
                            budget
                          )}
                        </strong>{" "}
                        budget.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#c9a24d]" />

                      <p className="text-[10px] leading-5 text-gray-500">
                        Ranking considers ratings, reviews,
                        pricing and your priority.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}

        {/* EXPLORE COMPONENTS */}
        <section className="mt-14">
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#b58a32]">
              Setup Components
            </p>

            <h3 className="mt-2 text-2xl font-black">
              Everything starts here
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
              Choose the essentials that make your workspace
              feel complete.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {components.map(
              (component) => {
                const Icon =
                  component.icon;

                return (
                  <button
                    key={
                      component.id
                    }
                    type="button"
                    onClick={() =>
                      toggleComponent(
                        component.id
                      )
                    }
                    className="rounded-[22px] border border-[#e8dfd0] bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-[#d2b66e] hover:shadow-md"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff5dc] text-[#b58a32]">
                      <Icon size={20} />
                    </div>

                    <h4 className="mt-4 text-sm font-black">
                      {
                        component.title
                      }
                    </h4>

                    <p className="mt-1 text-[9px] text-gray-400">
                      {
                        component.description
                      }
                    </p>
                  </button>
                );
              }
            )}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mt-10 overflow-hidden rounded-[30px] border border-[#dfc98e] bg-[#fff6df]">
          <div className="relative flex flex-col items-center justify-between gap-6 px-6 py-10 text-center md:flex-row md:px-10 md:text-left">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#956f27]">
                PrimeCart Setup Studio
              </p>

              <h3 className="mt-2 text-2xl font-black">
                Build less. Choose smarter.
              </h3>

              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Your setup should fit your workflow, your
                budget and your style.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetAll();

                window.scrollTo({
                  top: 0,
                  behavior:
                    "smooth",
                });
              }}
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#c9a24d] px-6 text-xs font-black text-white"
            >
              <RefreshCw
                size={15}
              />
              Build Again
            </button>
          </div>
        </section>

        <div className="h-12" />
      </main>
    </div>
  );
}
