
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  CircleDollarSign,
  Gamepad2,
  Headphones,
  Heart,
  Home,
  Keyboard,
  Laptop,
  Monitor,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Target,
  Trophy,
  WalletCards,
  Zap,
  Mouse,
  Webcam,
  Mic,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type SetupType = "work" | "gaming" | "study" | "creator" | "everyday";
type PriorityType = "balanced" | "value" | "quality" | "savings";
type ComponentType =
  | "display"
  | "keyboard"
  | "mouse"
  | "audio"
  | "webcam"
  | "microphone"
  | "controller"
  | "accessories";

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
  category_name?: string | null;
};

type SetupProduct = Product & {
  component: ComponentType;
  matchScore: number;
};

type Notice = {
  type: "success" | "error" | "info";
  message: string;
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
    description: "A productive workspace for everyday work.",
    icon: BriefcaseBusiness,
  },
  {
    id: "gaming",
    title: "Gaming",
    subtitle: "Performance",
    description: "Gaming peripherals focused on performance.",
    icon: Gamepad2,
  },
  {
    id: "study",
    title: "Study",
    subtitle: "Focus",
    description: "Comfortable essentials for learning.",
    icon: Laptop,
  },
  {
    id: "creator",
    title: "Creator",
    subtitle: "Creative",
    description: "Gear for recording, streaming and editing.",
    icon: Monitor,
  },
  {
    id: "everyday",
    title: "Everyday",
    subtitle: "Balanced",
    description: "Flexible gear for everyday computer use.",
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
    description: "Computer monitors and displays",
    icon: Monitor,
    keywords: [
      "gaming monitor", "computer monitor", "desktop monitor",
      "led monitor", "monitor", "display monitor",
    ],
  },
  {
    id: "keyboard",
    title: "Keyboard",
    description: "Typing and gaming controls",
    icon: Keyboard,
    keywords: [
      "mechanical keyboard", "gaming keyboard",
      "wireless keyboard", "computer keyboard", "keyboard",
    ],
  },
  {
    id: "mouse",
    title: "Mouse",
    description: "Navigation and precision control",
    icon: Mouse,
    keywords: [
      "gaming mouse", "computer mouse",
      "wireless mouse", "optical mouse", "mouse",
    ],
  },
  {
    id: "audio",
    title: "Audio",
    description: "Headphones, headsets and speakers",
    icon: Headphones,
    keywords: [
      "gaming headset", "gaming headphones", "headphones",
      "headphone", "headset", "earphones", "earbuds",
      "bluetooth speaker", "computer speaker", "speaker",
    ],
  },
  {
    id: "webcam",
    title: "Webcam",
    description: "Cameras for calls and streaming",
    icon: Laptop,
    keywords: ["webcam", "web camera", "streaming camera", "conference camera"],
  },
  {
    id: "microphone",
    title: "Microphone",
    description: "Voice recording and streaming",
    icon: Mic,
    keywords: [
      "condenser microphone", "usb microphone",
      "studio microphone", "lavalier microphone",
      "microphone", "usb mic", "studio mic", "mic",
    ],
  },
  {
    id: "controller",
    title: "Controller",
    description: "Gamepads and gaming controllers",
    icon: Gamepad2,
    keywords: [
      "gaming controller", "game controller",
      "wireless controller", "gamepad", "game pad", "joystick",
    ],
  },
  {
    id: "accessories",
    title: "Accessories",
    description: "Useful computer and desk accessories",
    icon: Package,
    keywords: [
      "mouse pad", "mousepad", "desk mat",
      "laptop stand", "monitor stand", "headphone stand",
      "usb hub", "capture card", "hdmi cable", "usb cable",
      "usb adapter", "gaming desk", "desk lamp",
      "laptop cooling pad", "cooling pad",
    ],
  },
];

const componentsByPurpose: Record<SetupType, ComponentType[]> = {
  work: ["display", "keyboard", "mouse", "audio", "webcam", "accessories"],
  gaming: ["display", "keyboard", "mouse", "audio", "controller", "accessories"],
  study: ["display", "keyboard", "mouse", "audio", "webcam", "accessories"],
  creator: [
    "display", "keyboard", "mouse", "audio",
    "webcam", "microphone", "accessories",
  ],
  everyday: ["display", "keyboard", "mouse", "audio", "accessories"],
};

const purposeLabels: Record<
  SetupType,
  Partial<Record<ComponentType, { title: string; description: string }>>
> = {
  work: {
    display: { title: "Office Monitor", description: "For documents and multitasking" },
    keyboard: { title: "Work Keyboard", description: "For comfortable typing" },
    mouse: { title: "Productivity Mouse", description: "For daily navigation" },
    audio: { title: "Meeting Audio", description: "For calls and meetings" },
    webcam: { title: "Meeting Webcam", description: "For video meetings" },
    accessories: { title: "Desk Essentials", description: "Stands, hubs and accessories" },
  },
  gaming: {
    display: { title: "Gaming Monitor", description: "For responsive gameplay" },
    keyboard: { title: "Gaming Keyboard", description: "For gaming and control" },
    mouse: { title: "Gaming Mouse", description: "For precise movements" },
    audio: { title: "Gaming Audio", description: "For immersive sound" },
    controller: { title: "Game Controller", description: "For supported games" },
    accessories: { title: "Gaming Accessories", description: "Mats, stands and gaming gear" },
  },
  study: {
    display: { title: "Study Monitor", description: "For lessons and reading" },
    keyboard: { title: "Study Keyboard", description: "For notes and assignments" },
    mouse: { title: "Study Mouse", description: "For everyday learning" },
    audio: { title: "Class Audio", description: "For lectures and classes" },
    webcam: { title: "Online Class Webcam", description: "For virtual lessons" },
    accessories: { title: "Study Accessories", description: "Stands, lamps and hubs" },
  },
  creator: {
    display: { title: "Creator Monitor", description: "For editing and design" },
    keyboard: { title: "Creative Keyboard", description: "For creative workflows" },
    mouse: { title: "Precision Mouse", description: "For editing and design" },
    audio: { title: "Creator Audio", description: "For editing and monitoring" },
    webcam: { title: "Creator Webcam", description: "For recording and streaming" },
    microphone: { title: "Recording Microphone", description: "For voice capture" },
    accessories: { title: "Creator Accessories", description: "Capture cards, stands and hubs" },
  },
  everyday: {
    display: { title: "Everyday Monitor", description: "For general computer use" },
    keyboard: { title: "Everyday Keyboard", description: "For daily typing" },
    mouse: { title: "Everyday Mouse", description: "For reliable navigation" },
    audio: { title: "Everyday Audio", description: "For music and entertainment" },
    accessories: { title: "Tech Accessories", description: "Useful computer accessories" },
  },
};

const priorityOptions: {
  id: PriorityType;
  title: string;
  description: string;
}[] = [
  {
    id: "balanced",
    title: "Balanced",
    description: "Balance price, ratings and usefulness.",
  },
  {
    id: "value",
    title: "Best Value",
    description: "Prioritize useful features for the price.",
  },
  {
    id: "quality",
    title: "Quality First",
    description: "Prioritize ratings and review confidence.",
  },
  {
    id: "savings",
    title: "Maximum Savings",
    description: "Prefer suitable lower-priced products.",
  },
];

const budgetPresets = [
  { label: "Starter", amount: 5000 },
  { label: "Balanced", amount: 10000 },
  { label: "Pro", amount: 20000 },
  { label: "Premium", amount: 35000 },
  { label: "Ultimate", amount: 50000 },
];

const purposeKeywords: Record<SetupType, string[]> = {
  work: ["office", "business", "productivity", "ergonomic", "silent", "wireless"],
  gaming: ["gaming", "game", "rgb", "mechanical", "low latency", "controller"],
  study: ["study", "student", "learning", "online class", "lecture", "reading"],
  creator: ["creator", "content", "studio", "editing", "streaming", "microphone"],
  everyday: ["everyday", "daily", "home", "versatile", "comfortable", "wireless"],
};

const blockedNames = [
  "sunscreen", "screen protector", "tempered glass", "moisturizer",
  "moisturiser", "serum", "face wash", "lipstick", "foundation",
  "shampoo", "conditioner", "saree", "kurta", "dress", "t shirt",
  "jeans", "detergent", "cooking oil", "snack", "biscuit",
  "beauty", "skincare", "skin care", "cosmetic", "face cream",
  "body lotion", "perfume", "toothpaste", "food", "toy",
];

const blockedCategories = [
  "beauty", "skincare", "skin care", "personal care", "fashion",
  "clothing", "footwear", "grocery", "groceries", "food",
  "beverage", "toys", "baby", "jewellery", "jewelry", "automotive",
];

function hasWholePhrase(text: string, keyword: string) {
  const escaped = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function discountPercent(price: number, original: number | null) {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

function imageCandidates(value: string | null) {
  if (!value?.trim()) return [];

  const raw = value.trim();

  if (/^https?:\/\//i.test(raw)) return [raw];

  const clean = raw
    .replace(/^public\//i, "")
    .replace(/^\/+/, "");

  const paths = [
    `/${clean}`,
    `/products/${clean}`,
    `/product-images/${clean}`,
    `/images/${clean}`,
    `/images/products/${clean}`,
  ];

  return [...new Set(paths)];
}

function ProductImage({
  value,
  alt,
  className,
}: {
  value: string | null;
  alt: string;
  className?: string;
}) {
  const candidates = imageCandidates(value);
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [value]);

  const src = candidates[index];

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center text-[#c9a24d]">
        <Package size={34} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setIndex((old) => old + 1)}
    />
  );
}

function detectComponent(product: Product): ComponentType | null {
  const name = (product.name || "").toLowerCase().replace(/[_-]+/g, " ").trim();
  const category = (product.category_name || "").toLowerCase();

  if (!name) return null;
  if (blockedNames.some((term) => hasWholePhrase(name, term))) return null;
  if (
    category &&
    blockedCategories.some((term) => hasWholePhrase(category, term))
  ) {
    return null;
  }

  // Most specific types must be checked before general accessories/audio.
  const ordered: ComponentType[] = [
    "controller",
    "webcam",
    "microphone",
    "accessories",
    "keyboard",
    "mouse",
    "audio",
    "display",
  ];

  for (const id of ordered) {
    const config = components.find((item) => item.id === id);
    if (!config) continue;

    if (!config.keywords.some((keyword) => hasWholePhrase(name, keyword))) {
      continue;
    }

    if (id === "mouse" && /mouse[\s-]*pad|mousepad/i.test(name)) continue;

    if (
      id === "microphone" &&
      hasWholePhrase(name, "microphone stand")
    ) {
      return "accessories";
    }

    return id;
  }

  return null;
}

function isPurposeSuitable(product: Product, purpose: SetupType) {
  const component = detectComponent(product);
  const name = product.name.toLowerCase();

  if (!component || !componentsByPurpose[purpose].includes(component)) {
    return false;
  }

  const gamingSpecific = [
    "gaming keyboard", "gaming mouse", "gaming headset",
    "gaming controller", "gaming monitor", "gaming mouse pad",
    "rgb gaming",
  ].some((term) => hasWholePhrase(name, term));

  if (["work", "study", "everyday"].includes(purpose) && gamingSpecific) {
    return false;
  }

  if (purpose === "gaming" && component === "accessories") {
    const allowed = [
      "mouse pad", "mousepad", "cooling pad", "usb hub",
      "gaming desk", "laptop stand", "monitor stand",
      "headphone stand", "usb cable", "hdmi cable", "usb adapter",
    ];
    if (!allowed.some((term) => hasWholePhrase(name, term))) return false;
  }

  if (purpose === "creator" && component === "accessories") {
    const allowed = [
      "capture card", "usb hub", "laptop stand",
      "monitor stand", "desk mat", "usb cable",
      "hdmi cable", "usb adapter",
    ];
    if (!allowed.some((term) => hasWholePhrase(name, term))) return false;
  }

  return true;
}

function purposeRelevance(product: Product, purpose: SetupType) {
  const text = `${product.name} ${product.brand || ""}`.toLowerCase();
  return purposeKeywords[purpose].filter((keyword) =>
    hasWholePhrase(text, keyword)
  ).length;
}

function scoreProduct(
  product: Product,
  purpose: SetupType,
  budget: number,
  priority: PriorityType
) {
  const price = Number(product.price);
  const rating = Number(product.rating || 0);
  const reviews = Number(product.reviews_count || 0);
  const discount = discountPercent(price, product.original_price);

  let score = purposeRelevance(product, purpose) * 8;
  score += Math.round((rating / 5) * 20);
  score += Math.min(8, Math.round(reviews / 25));

  const share = price / Math.max(1, budget);

  if (share <= 0.15) score += 12;
  else if (share <= 0.3) score += 14;
  else if (share <= 0.5) score += 12;
  else if (share <= 0.75) score += 8;
  else score += 5;

  if (product.is_featured) score += 2;
  if (product.is_flash_sale) score += 2;

  if (priority === "quality") {
    score += rating * 4;
    score += Math.min(10, reviews / 15);
    if (rating >= 4.5) score += 5;
  } else if (priority === "savings") {
    score += Math.min(18, discount * 0.25);
    score += Math.max(0, 20 - share * 100) / 2;
  } else if (priority === "value") {
    score += rating * 2;
    score += Math.min(8, discount * 0.25);
    score += Math.min(6, reviews / 25);
  } else {
    score += rating * 1.5;
    if (share >= 0.12 && share <= 0.45) score += 7;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export default function SetupBuilderPage() {
  const [supabase] = useState(() => createClient());

  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [step, setStep] = useState(1);
  const [setupType, setSetupType] = useState<SetupType>("work");
  const [budget, setBudget] = useState(20000);
  const [customBudget, setCustomBudget] = useState("20000");
  const [priority, setPriority] = useState<PriorityType>("balanced");
  const [selectedComponents, setSelectedComponents] =
    useState<ComponentType[]>(componentsByPurpose.work);

  // A component can have one custom product, or null if intentionally removed.
  const [manualChoices, setManualChoices] = useState<
    Partial<Record<ComponentType, string | null>>
  >({});

  const [setupBuilt, setSetupBuilt] = useState(false);
  const [buildSeed, setBuildSeed] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setNotice(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        window.location.assign("/auth/login");
        return;
      }

      const [
        productResponse,
        wishlistResponse,
        cartResponse,
        categoryResponse,
      ] = await Promise.all([
        supabase
          .from("products")
          .select(
            "id,category_id,name,slug,short_description,description,price,original_price,stock,image_url,brand,rating,reviews_count,is_featured,is_flash_sale,is_active"
          )
          .eq("is_active", true)
          .gt("stock", 0),

        supabase
          .from("wishlist_items")
          .select("product_id")
          .eq("user_id", user.id),

        supabase
          .from("cart_items")
          .select("product_id")
          .eq("user_id", user.id),

        supabase.from("categories").select("id,name"),
      ]);

      if (productResponse.error) throw productResponse.error;
      if (wishlistResponse.error) throw wishlistResponse.error;
      if (cartResponse.error) throw cartResponse.error;

      const categoryNames = new Map<string, string>(
        (categoryResponse.data || []).map(
          (category: { id: string; name: string }) => [
            category.id,
            category.name,
          ]
        )
      );

      const rows = (productResponse.data || []) as Product[];

      setProducts(
        rows.map((product) => ({
          ...product,
          price: Number(product.price || 0),
          original_price:
            product.original_price == null
              ? null
              : Number(product.original_price),
          stock: Number(product.stock || 0),
          rating: Number(product.rating || 0),
          reviews_count: Number(product.reviews_count || 0),
          category_name: product.category_id
            ? categoryNames.get(product.category_id) || null
            : null,
        }))
      );

      setWishlist((wishlistResponse.data || []).map((item) => item.product_id));
      setCartIds((cartResponse.data || []).map((item) => item.product_id));
    } catch (error) {
      console.error("Setup Builder load error:", error);
      setNotice({
        type: "error",
        message:
          "Products could not be loaded. Check your Supabase tables, permissions and connection.",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const currentComponentOptions = useMemo(
    () =>
      components
        .filter((item) => componentsByPurpose[setupType].includes(item.id))
        .map((item) => ({
          ...item,
          ...(purposeLabels[setupType][item.id] || {}),
        })),
    [setupType]
  );

  const matchedProducts = useMemo<SetupProduct[]>(() => {
    return products
      .filter(
        (product) =>
          product.is_active &&
          product.stock > 0 &&
          product.price > 0 &&
          product.price <= budget &&
          selectedComponents.includes(detectComponent(product) as ComponentType) &&
          isPurposeSuitable(product, setupType)
      )
      .map((product) => {
        const component = detectComponent(product)!;
        return {
          ...product,
          component,
          matchScore: scoreProduct(product, setupType, budget, priority),
        };
      });
  }, [products, budget, setupType, priority, selectedComponents]);

  const recommendedProducts = useMemo<SetupProduct[]>(() => {
    const result: SetupProduct[] = [];
    let remaining = budget;
    const selected = selectedComponents.slice(0, 8);

    const candidatesFor = (component: ComponentType) =>
      matchedProducts.filter((item) => item.component === component);

    for (let index = 0; index < selected.length; index += 1) {
      const component = selected[index];
      const later = selected.slice(index + 1);

      // Reserve the cheapest suitable option for later components first.
      const reserve = later.reduce((sum, next) => {
        const options = candidatesFor(next);
        return sum + (options.length ? Math.min(...options.map((p) => p.price)) : 0);
      }, 0);

      const maxForThisComponent = Math.max(0, remaining - reserve);
      const candidates = candidatesFor(component).filter(
        (item) => item.price <= maxForThisComponent
      );

      if (!candidates.length) continue;

      const ranked = [...candidates].sort((a, b) => {
        if (priority === "quality") {
          return (
            b.rating - a.rating ||
            b.reviews_count - a.reviews_count ||
            b.matchScore - a.matchScore
          );
        }

        if (priority === "savings") {
          return a.price - b.price || b.rating - a.rating;
        }

        if (priority === "value") {
          const valueA =
            (a.rating * 2 + Math.log10(a.reviews_count + 1)) /
            Math.max(1, a.price);
          const valueB =
            (b.rating * 2 + Math.log10(b.reviews_count + 1)) /
            Math.max(1, b.price);
          return valueB - valueA || b.matchScore - a.matchScore;
        }

        const target = budget / Math.max(1, selected.length);
        return (
          Math.abs(a.price - target * 0.72) -
            Math.abs(b.price - target * 0.72) ||
          b.rating - a.rating ||
          b.matchScore - a.matchScore
        );
      });

      // Rotate within the best-ranked shortlist for variety, while preserving budget.
      const pool = ranked.slice(0, Math.min(8, ranked.length));
      const componentIndex = componentsByPurpose[setupType].indexOf(component);
      const offset = pool.length
        ? (buildSeed + componentIndex * 2) % pool.length
        : 0;
      const chosen = pool[offset];

      if (chosen && chosen.price <= remaining) {
        result.push(chosen);
        remaining -= chosen.price;
      }
    }

    return result;
  }, [matchedProducts, selectedComponents, budget, priority, setupType, buildSeed]);

  const finalProducts = useMemo<SetupProduct[]>(() => {
    return selectedComponents.flatMap((component) => {
      if (Object.prototype.hasOwnProperty.call(manualChoices, component)) {
        const id = manualChoices[component];
        if (!id) return [];
        const chosen = matchedProducts.find((item) => item.id === id);
        return chosen ? [chosen] : [];
      }

      const recommended = recommendedProducts.find(
        (item) => item.component === component
      );
      return recommended ? [recommended] : [];
    });
  }, [selectedComponents, manualChoices, matchedProducts, recommendedProducts]);

  const setupTotal = finalProducts.reduce((sum, product) => sum + product.price, 0);
  const setupSavings = finalProducts.reduce(
    (sum, product) =>
      sum + Math.max(0, Number(product.original_price || product.price) - product.price),
    0
  );
  const remainingBudget = Math.max(0, budget - setupTotal);
  const budgetUsage = budget > 0 ? Math.min(100, Math.round((setupTotal / budget) * 100)) : 0;
  const averageRating = finalProducts.length
    ? finalProducts.reduce((sum, item) => sum + item.rating, 0) / finalProducts.length
    : 0;
  const setupScore = finalProducts.length
    ? Math.round(
        finalProducts.reduce((sum, item) => sum + item.matchScore, 0) /
          finalProducts.length
      )
    : 0;

  function setNewBudget(value: number) {
    const safe = Math.max(2000, Math.min(100000, Math.round(value)));
    setBudget(safe);
    setCustomBudget(String(safe));
    setManualChoices({});
    setSetupBuilt(false);
    setNotice(null);
  }

  function changePurpose(value: SetupType) {
    setSetupType(value);
    setSelectedComponents(componentsByPurpose[value]);
    setManualChoices({});
    setSetupBuilt(false);
    setNotice(null);
  }

  function toggleComponent(id: ComponentType) {
    setSelectedComponents((current) => {
      if (current.includes(id)) {
        if (current.length <= 1) return current;
        return current.filter((item) => item !== id);
      }
      return [...current, id];
    });

    setManualChoices({});
    setSetupBuilt(false);
    setNotice(null);
  }

  function toggleProduct(productId: string) {
    const product = matchedProducts.find((item) => item.id === productId);
    if (!product) return;

    const currentChoice = manualChoices[product.component];

    // Clicking the already-customized product restores the recommendation.
    if (currentChoice === productId) {
      setManualChoices((current) => {
        const next = { ...current };
        delete next[product.component];
        return next;
      });
      setNotice({ type: "success", message: "Default recommendation restored." });
      return;
    }

    const otherTotal = finalProducts
      .filter((item) => item.component !== product.component)
      .reduce((sum, item) => sum + item.price, 0);

    if (otherTotal + product.price > budget) {
      setNotice({
        type: "error",
        message: `This selection exceeds your ${formatPrice(budget)} budget. Choose a less expensive option or remove another component.`,
      });
      return;
    }

    setManualChoices((current) => ({
      ...current,
      [product.component]: product.id,
    }));

    setNotice({
      type: "success",
      message: `${product.name} selected for your setup.`,
    });
  }

  async function buildSetup() {
    if (!selectedComponents.length) {
      setNotice({ type: "error", message: "Select at least one component." });
      return;
    }

    setBuilding(true);
    setNotice(null);
    setManualChoices({});
    setBuildSeed((current) => current + 1);

    // Keep the loading state visible without delaying the database query.
    await new Promise((resolve) => setTimeout(resolve, 250));

    setSetupBuilt(true);
    setStep(4);
    setBuilding(false);

    window.setTimeout(() => {
      document.getElementById("setup-results")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  function resetAll() {
    setStep(1);
    setSetupType("work");
    setBudget(20000);
    setCustomBudget("20000");
    setPriority("balanced");
    setSelectedComponents(componentsByPurpose.work);
    setManualChoices({});
    setBuildSeed((current) => current + 1);
    setSetupBuilt(false);
    setNotice(null);
  }

  async function addToCart(product: Product, silent = false): Promise<boolean> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        window.location.assign("/auth/login");
        return false;
      }

      if (product.stock < 1) {
        if (!silent) {
          setNotice({ type: "error", message: "This product is out of stock." });
        }
        return false;
      }

      const { data: existing, error: lookupError } = await supabase
        .from("cart_items")
        .select("id,quantity")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle();

      if (lookupError) throw lookupError;

      const quantity = Number(existing?.quantity || 0);

      if (quantity >= product.stock) {
        if (!silent) {
          setNotice({
            type: "error",
            message: `Only ${product.stock} unit(s) are available for ${product.name}.`,
          });
        }
        return false;
      }

      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({
            quantity: quantity + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
        });

        if (error) throw error;
      }

      setCartIds((current) =>
        current.includes(product.id) ? current : [...current, product.id]
      );
      window.dispatchEvent(new Event("cart-updated"));

      if (!silent) {
        setNotice({ type: "success", message: `${product.name} added to cart.` });
      }

      return true;
    } catch (error) {
      console.error("Setup Builder cart error:", error);
      if (!silent) {
        setNotice({
          type: "error",
          message: "Could not update your cart. Check your cart table and permissions.",
        });
      }
      return false;
    }
  }

  async function addCompleteSetup() {
    if (!finalProducts.length) {
      setNotice({
        type: "info",
        message: "No products are available for this setup. Try changing your budget or components.",
      });
      return;
    }

    // Final safety check before writing anything to the cart.
    if (setupTotal > budget) {
      setNotice({
        type: "error",
        message: "Your setup exceeds the budget. Remove or replace a product first.",
      });
      return;
    }

    let added = 0;
    for (const product of finalProducts) {
      if (await addToCart(product, true)) added += 1;
    }

    setNotice({
      type: added ? "success" : "error",
      message: added
        ? `${added} of ${finalProducts.length} products added to your cart.`
        : "No products were added. Check stock and try again.",
    });
  }

  async function toggleWishlist(productId: string) {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        window.location.assign("/auth/login");
        return;
      }

      if (wishlist.includes(productId)) {
        const { error } = await supabase
          .from("wishlist_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) throw error;

        setWishlist((current) => current.filter((id) => id !== productId));
        setNotice({ type: "success", message: "Removed from wishlist." });
      } else {
        const { error } = await supabase.from("wishlist_items").insert({
          user_id: user.id,
          product_id: productId,
        });

        if (error) throw error;

        setWishlist((current) =>
          current.includes(productId) ? current : [...current, productId]
        );
        setNotice({ type: "success", message: "Added to wishlist." });
      }
    } catch (error) {
      console.error("Setup Builder wishlist error:", error);
      setNotice({
        type: "error",
        message: "Could not update wishlist. Check wishlist_items and its permissions.",
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#181818]">
      <header className="sticky top-0 z-40 border-b border-[#e8dfcf] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[66px] max-w-[1500px] items-center justify-between gap-3 px-3 sm:h-[72px] sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard"
              aria-label="Back to dashboard"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e7dfd0] text-gray-600 hover:border-[#c9a24d]"
            >
              <ArrowLeft size={17} />
            </Link>
            <Link href="/dashboard" className="min-w-0">
              <p className="truncate text-sm font-black sm:text-base">
                PrimeCart <span className="text-[#b58a32]">Setup Studio</span>
              </p>
              <p className="hidden text-[10px] text-gray-400 sm:block">
                Build a setup that fits your budget
              </p>
            </Link>
          </div>

          <div className="flex shrink-0 gap-2">
            <Link
              href="/dashboard/wishlist"
              aria-label="Wishlist"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7dfd0] text-gray-600 hover:border-[#c9a24d]"
            >
              <Heart size={17} />
            </Link>
            <Link
              href="/dashboard/cart"
              aria-label="Cart"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7dfd0] text-gray-600 hover:border-[#c9a24d]"
            >
              <ShoppingCart size={17} />
            </Link>
            <Link
              href="/dashboard"
              className="flex h-10 items-center gap-2 rounded-xl bg-[#fff2d1] px-3 text-[10px] font-black text-[#956f27] sm:px-4"
            >
              <span className="hidden sm:inline">Dashboard</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
        {notice && (
          <div
            role="status"
            aria-live="polite"
            className={`mb-5 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : notice.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-[#e8dfd0] bg-white text-gray-700"
            }`}
          >
            <p>{notice.message}</p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss notification"
              className="rounded-lg p-1"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <section className="relative overflow-hidden rounded-[28px] border border-[#e5d8bd] bg-white">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#f1dca7]/40 blur-3xl" />
          <div className="relative grid items-center gap-7 p-5 sm:p-9 lg:grid-cols-[1.15fr_.85fr] lg:p-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e8dcc3] bg-[#fffaf0] px-3 py-2 text-[9px] font-black uppercase tracking-[.18em] text-[#a17b2f]">
                <Sparkles size={13} /> PrimeCart Smart Studio
              </span>
              <h1 className="mt-5 text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
                Build your <span className="text-[#b58a32]">perfect setup.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base sm:leading-7">
                Choose your purpose, set your maximum budget and let PrimeCart
                find relevant products from your real catalogue.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Real catalogue", "Budget-aware", "Custom components", "Wishlist & cart"].map(
                  (item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#e9e1d4] bg-[#fffdf9] px-3 py-2 text-[10px] font-bold text-gray-600"
                    >
                      <Check size={12} className="text-[#b58a32]" />
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="mx-auto w-full max-w-[440px] rounded-[25px] border border-[#e8dcc3] bg-[#fffaf0] p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#a17b2f]">
                    Current plan
                  </p>
                  <p className="mt-1 text-xl font-black">
                    {setupTypes.find((item) => item.id === setupType)?.title} Setup
                  </p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c9a24d] text-white">
                  <Target size={20} />
                </span>
              </div>
              <div className="mt-5 rounded-2xl bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-500">Maximum budget</span>
                  <strong className="text-lg">{formatPrice(budget)}</strong>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eee6d7]">
                  <div
                    className="h-full rounded-full bg-[#c9a24d] transition-all"
                    style={{ width: `${budgetUsage}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-gray-400">
                  <span>{finalProducts.length} components</span>
                  <span>{budgetUsage}% allocated</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: "Display", icon: Monitor },
                  { label: "Keyboard", icon: Keyboard },
                  { label: "Audio", icon: Headphones },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-xl bg-white p-3">
                      <Icon size={17} className="text-[#b58a32]" />
                      <p className="mt-2 text-[10px] font-black">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-[#e8dfd0] bg-white p-4 sm:p-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((number, index) => (
              <div key={number} className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => number <= step && setStep(number)}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    step >= number
                      ? "bg-[#c9a24d] text-white"
                      : "bg-[#f2eee6] text-gray-400"
                  }`}
                >
                  {step > number ? <Check size={14} /> : number}
                </button>
                <span className={`hidden text-[10px] font-black sm:block ${step >= number ? "text-[#956f27]" : "text-gray-400"}`}>
                  {["Purpose", "Budget", "Preferences", "Your Setup"][index]}
                </span>
                {index < 3 && <div className="h-px flex-1 bg-[#e8e0d2]" />}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-[#e8dfd0] bg-white">
          {step === 1 && (
            <div className="p-5 sm:p-8 lg:p-10">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#b58a32]">Step 01 · Purpose</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">What are you building?</h2>
              <p className="mt-2 text-sm text-gray-500">Choose the setup that matches how you use your computer.</p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {setupTypes.map((item) => {
                  const Icon = item.icon;
                  const active = setupType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => changePurpose(item.id)}
                      className={`relative rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 ${
                        active ? "border-[#c9a24d] bg-[#fffaf0] shadow-sm" : "border-[#e8e0d2] hover:border-[#d2b66e]"
                      }`}
                    >
                      {active && <Check size={16} className="absolute right-4 top-4 text-[#a17b2f]" />}
                      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${active ? "bg-[#c9a24d] text-white" : "bg-[#fff5dd] text-[#a17b2f]"}`}>
                        <Icon size={20} />
                      </span>
                      <p className="mt-4 font-black">{item.title}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#a17b2f]">{item.subtitle}</p>
                      <p className="mt-3 text-xs leading-5 text-gray-500">{item.description}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-7 flex justify-end border-t border-[#eee8dd] pt-5">
                <button onClick={() => setStep(2)} className="flex h-11 items-center gap-2 rounded-xl bg-[#c9a24d] px-6 text-xs font-black text-white">
                  Continue <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-5 sm:p-8 lg:p-10">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#b58a32]">Step 02 · Budget</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">Set your maximum budget.</h2>
              <p className="mt-2 text-sm text-gray-500">Recommendations and manual selections must stay within this amount.</p>

              <div className="mt-7 rounded-3xl border border-[#e8dfd0] bg-[#fffdf9] p-5 sm:p-8">
                <div className="text-center">
                  <WalletCards size={27} className="mx-auto text-[#b58a32]" />
                  <p className="mt-3 text-xs text-gray-500">Your maximum budget</p>
                  <p className="mt-1 text-3xl font-black text-[#956f27]">{formatPrice(budget)}</p>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {budgetPresets.map((preset) => (
                    <button
                      key={preset.amount}
                      type="button"
                      onClick={() => setNewBudget(preset.amount)}
                      className={`rounded-xl border px-3 py-3 text-center ${
                        budget === preset.amount
                          ? "border-[#c9a24d] bg-[#fff5dc] text-[#956f27]"
                          : "border-[#e5ddcf] hover:border-[#d0b46c]"
                      }`}
                    >
                      <p className="text-[9px] font-black uppercase">{preset.label}</p>
                      <p className="mt-1 text-sm font-black">{formatPrice(preset.amount)}</p>
                    </button>
                  ))}
                </div>

                <div className="mt-7">
                  <label htmlFor="custom-budget" className="text-xs font-bold text-gray-500">Custom budget (₹2,000–₹1,00,000)</label>
                  <div className="mt-2 flex gap-3">
                    <input
                      id="custom-budget"
                      type="number"
                      min={2000}
                      max={100000}
                      step={500}
                      value={customBudget}
                      onChange={(event) => {
                        const value = event.target.value;
                        setCustomBudget(value);
                        const amount = Number(value);
                        if (amount >= 2000 && amount <= 100000) {
                          setBudget(amount);
                          setManualChoices({});
                          setSetupBuilt(false);
                        }
                      }}
                      className="h-11 min-w-0 flex-1 rounded-xl border border-[#ddd4c3] bg-white px-4 text-sm font-bold outline-none focus:border-[#c9a24d]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const amount = Number(customBudget);
                        if (amount < 2000 || amount > 100000 || !Number.isFinite(amount)) {
                          setNotice({ type: "error", message: "Enter a budget between ₹2,000 and ₹1,00,000." });
                          return;
                        }
                        setNewBudget(amount);
                      }}
                      className="rounded-xl bg-[#c9a24d] px-5 text-xs font-black text-white"
                    >
                      Apply
                    </button>
                  </div>
                  <input
                    aria-label="Adjust budget"
                    type="range"
                    min={2000}
                    max={50000}
                    step={500}
                    value={Math.min(budget, 50000)}
                    onChange={(event) => setNewBudget(Number(event.target.value))}
                    className="mt-5 w-full accent-[#c9a24d]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>₹2,000</span><span>₹50,000</span>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex justify-between border-t border-[#eee8dd] pt-5">
                <button onClick={() => setStep(1)} className="flex h-11 items-center gap-2 rounded-xl border border-[#e4dccd] px-5 text-xs font-black"><ArrowLeft size={15} /> Back</button>
                <button onClick={() => setStep(3)} className="flex h-11 items-center gap-2 rounded-xl bg-[#c9a24d] px-6 text-xs font-black text-white">Continue <ArrowRight size={15} /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-5 sm:p-8 lg:p-10">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#b58a32]">Step 03 · Preferences</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">Choose your components.</h2>
              <p className="mt-2 text-sm text-gray-500">Select the components you want and how you want them ranked.</p>

              <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_.8fr]">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-black">Components</h3>
                    <span className="rounded-full bg-[#fff5dc] px-3 py-1.5 text-[10px] font-black text-[#956f27]">{selectedComponents.length} selected</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {currentComponentOptions.map((item) => {
                      const Icon = item.icon;
                      const active = selectedComponents.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleComponent(item.id)}
                          className={`flex items-center gap-3 rounded-2xl border p-4 text-left ${
                            active ? "border-[#c9a24d] bg-[#fffaf0]" : "border-[#e8e0d2]"
                          }`}
                        >
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? "bg-[#c9a24d] text-white" : "bg-[#f7f3eb] text-[#a17b2f]"}`}>
                            <Icon size={18} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-black">{item.title}</span>
                            <span className="mt-1 block text-[10px] text-gray-500">{item.description}</span>
                          </span>
                          <Check size={15} className={active ? "text-[#b58a32]" : "text-transparent"} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="font-black">What matters most?</h3>
                  <p className="mt-1 text-xs text-gray-500">This changes how products are ranked.</p>
                  <div className="mt-4 space-y-3">
                    {priorityOptions.map((item) => {
                      const active = priority === item.id;
                      const Icon =
                        item.id === "balanced" ? Target :
                        item.id === "value" ? CircleDollarSign :
                        item.id === "quality" ? Trophy : Zap;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setPriority(item.id);
                            setManualChoices({});
                            setSetupBuilt(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left ${
                            active ? "border-[#c9a24d] bg-[#fffaf0]" : "border-[#e8e0d2]"
                          }`}
                        >
                          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-[#c9a24d] text-white" : "bg-[#f7f3eb] text-[#a17b2f]"}`}>
                            <Icon size={18} />
                          </span>
                          <span className="flex-1">
                            <span className="block text-xs font-black">{item.title}</span>
                            <span className="mt-1 block text-[10px] text-gray-500">{item.description}</span>
                          </span>
                          {active && <Check size={16} className="text-[#b58a32]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-[#eadfca] bg-[#fffaf0] p-4">
                <div className="flex gap-3">
                  <Sparkles size={18} className="mt-0.5 shrink-0 text-[#b58a32]" />
                  <div>
                    <p className="text-xs font-black">Your selection</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {setupTypes.find((item) => item.id === setupType)?.title} · {formatPrice(budget)} · {priorityOptions.find((item) => item.id === priority)?.title} · {selectedComponents.length} components
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex justify-between border-t border-[#eee8dd] pt-5">
                <button onClick={() => setStep(2)} className="flex h-11 items-center gap-2 rounded-xl border border-[#e4dccd] px-5 text-xs font-black"><ArrowLeft size={15} /> Back</button>
                <button
                  onClick={buildSetup}
                  disabled={building || loading || selectedComponents.length === 0}
                  className="flex h-11 items-center gap-2 rounded-xl bg-[#c9a24d] px-6 text-xs font-black text-white disabled:opacity-50"
                >
                  {building ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  {building ? "Building..." : "Build My Setup"}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="p-5 sm:p-8 lg:p-10">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#b58a32]">Step 04 · Your Setup</p>
                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">Your setup is ready.</h2>
                  <p className="mt-2 text-sm text-gray-500">Review the recommended products and customize any component.</p>
                </div>
                <button onClick={resetAll} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e4dccd] px-4 text-xs font-black">
                  <RefreshCw size={14} /> Start Over
                </button>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "Setup score", value: `${setupScore}/100`, icon: Trophy },
                  { title: "Selected products", value: String(finalProducts.length), icon: Package },
                  { title: "Average rating", value: averageRating.toFixed(1), icon: Star },
                  { title: "Estimated savings", value: formatPrice(setupSavings), icon: Zap },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border border-[#e8dfd0] bg-[#fffaf0] p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">{item.title}</span>
                        <Icon size={16} className="text-[#b58a32]" />
                      </div>
                      <p className="mt-3 break-words text-2xl font-black">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {setupBuilt && step === 4 && (
          <section id="setup-results" className="mt-7 scroll-mt-24">
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0">
                <div className="mb-5">
                  <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#b58a32]">Smart recommendations</p>
                  <h2 className="mt-2 text-2xl font-black">Customize your setup</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Each component shows matching alternatives. Selecting another product replaces that component's current selection.
                  </p>
                </div>

                {loading ? (
                  <div className="rounded-2xl border border-[#e8dfd0] bg-white p-10 text-center">
                    <RefreshCw size={24} className="mx-auto animate-spin text-[#b58a32]" />
                    <p className="mt-3 text-sm font-bold">Loading catalogue...</p>
                  </div>
                ) : selectedComponents.every((component) => !matchedProducts.some((item) => item.component === component)) ? (
                  <div className="rounded-2xl border border-[#e8dfd0] bg-white p-10 text-center">
                    <Search size={34} className="mx-auto text-[#c9a24d]" />
                    <h3 className="mt-4 text-lg font-black">No suitable products found</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Your current filters did not find in-stock products in this budget. Try increasing your budget or changing the selected components.
                    </p>
                    <button onClick={() => setStep(2)} className="mt-5 rounded-xl bg-[#c9a24d] px-5 py-3 text-xs font-black text-white">Change budget</button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {selectedComponents.map((component) => {
                      const config = components.find((item) => item.id === component)!;
                      const Icon = config.icon;
                      const choices = matchedProducts
                        .filter((item) => item.component === component)
                        .sort((a, b) => b.matchScore - a.matchScore)
                        .slice(0, 5);
                      const current = finalProducts.find((item) => item.component === component);

                      return (
                        <div key={component} className="overflow-hidden rounded-2xl border border-[#e8dfd0] bg-white">
                          <div className="flex items-center justify-between gap-3 border-b border-[#eee8dd] bg-[#fffaf0] px-4 py-3 sm:px-5">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#c9a24d] text-white"><Icon size={17} /></span>
                              <div className="min-w-0">
                                <h3 className="text-sm font-black">{purposeLabels[setupType][component]?.title || config.title}</h3>
                                <p className="text-[10px] text-gray-500">{choices.length} matching option(s) shown</p>
                              </div>
                            </div>
                            <span className={`shrink-0 rounded-full px-3 py-1 text-[9px] font-black ${current ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                              {current ? "Selected" : "Not selected"}
                            </span>
                          </div>

                          {choices.length === 0 ? (
                            <p className="p-5 text-xs text-gray-500">No matching in-stock product is available for this component within your maximum budget.</p>
                          ) : (
                            <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
                              {choices.map((product) => {
                                const chosen = current?.id === product.id;
                                const wished = wishlist.includes(product.id);
                                const added = cartIds.includes(product.id);
                                const discount = discountPercent(product.price, product.original_price);

                                return (
                                  <article key={product.id} className={`flex min-w-0 flex-col overflow-hidden rounded-xl border transition ${chosen ? "border-[#c9a24d] bg-[#fffaf0]" : "border-[#eee6d7] bg-white hover:border-[#d7bf7d]"}`}>
                                    <div className="relative h-40 bg-[#faf9f6]">
                                      <ProductImage value={product.image_url} alt={product.name} className="h-full w-full object-contain p-4" />
                                      {discount > 0 && (
                                        <span className="absolute bottom-2 left-2 rounded-full bg-emerald-600 px-2 py-1 text-[9px] font-black text-white">{discount}% OFF</span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => void toggleWishlist(product.id)}
                                        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                                        className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border bg-white ${wished ? "border-red-200 text-red-500" : "border-[#e6ddce] text-gray-500"}`}
                                      >
                                        <Heart size={15} fill={wished ? "currentColor" : "none"} />
                                      </button>
                                    </div>

                                    <div className="flex flex-1 flex-col p-3">
                                      {product.brand && <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{product.brand}</p>}
                                      <Link href={`/dashboard/products/${product.id}`} className="mt-1">
                                        <h4 className="line-clamp-2 text-xs font-black leading-5 hover:text-[#a17b2f]">{product.name}</h4>
                                      </Link>
                                      <div className="mt-2 flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1 rounded-md bg-[#fff4d8] px-2 py-1 text-[9px] font-black text-[#956f27]">
                                          <Star size={10} fill="currentColor" /> {product.rating.toFixed(1)}
                                        </span>
                                        <span className="text-[9px] text-gray-400">{product.reviews_count} reviews</span>
                                      </div>

                                      <div className="mt-3 flex flex-wrap items-baseline gap-2">
                                        <span className="text-lg font-black">{formatPrice(product.price)}</span>
                                        {product.original_price && product.original_price > product.price && (
                                          <span className="text-[10px] text-gray-400 line-through">{formatPrice(product.original_price)}</span>
                                        )}
                                      </div>

                                      <p className="mt-1 text-[10px] text-gray-500">
                                        {product.stock} in stock · {product.matchScore}% match
                                      </p>

                                      <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                                        <button
                                          type="button"
                                          onClick={() => toggleProduct(product.id)}
                                          className={`flex h-9 items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-black ${chosen ? "bg-[#c9a24d] text-white" : "border border-[#e4dccd] text-gray-600"}`}
                                        >
                                          {chosen ? <Check size={13} /> : <Plus size={13} />}
                                          {chosen ? "Selected" : "Choose"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => void addToCart(product)}
                                          className={`flex h-9 items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-black ${added ? "bg-emerald-600 text-white" : "bg-[#fff3d4] text-[#956f27]"}`}
                                        >
                                          {added ? <Check size={13} /> : <ShoppingCart size={13} />}
                                          {added ? "In cart" : "Add"}
                                        </button>
                                      </div>
                                    </div>
                                  </article>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <aside className="lg:sticky lg:top-24">
                <div className="overflow-hidden rounded-[25px] border border-[#dfc98e] bg-white shadow-sm">
                  <div className="bg-[#fff7e3] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#a17b2f]">Setup summary</p>
                        <h3 className="mt-1 text-lg font-black">{setupTypes.find((item) => item.id === setupType)?.title} Setup</h3>
                      </div>
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c9a24d] text-white"><Sparkles size={19} /></span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500">Setup total</span>
                      <span className="text-xl font-black">{formatPrice(setupTotal)}</span>
                    </div>

                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#eee6d7]">
                      <div className="h-full rounded-full bg-[#c9a24d] transition-all" style={{ width: `${budgetUsage}%` }} />
                    </div>

                    <div className="mt-2 flex justify-between gap-2 text-[10px] text-gray-400">
                      <span>{budgetUsage}% used</span>
                      <span>{formatPrice(remainingBudget)} left</span>
                    </div>

                    <div className="my-5 h-px bg-[#eee8dd]" />

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between gap-3"><span className="text-gray-500">Maximum budget</span><strong>{formatPrice(budget)}</strong></div>
                      <div className="flex justify-between gap-3"><span className="text-gray-500">Selected products</span><strong>{finalProducts.length}</strong></div>
                      <div className="flex justify-between gap-3"><span className="text-gray-500">Estimated savings</span><strong className="text-emerald-600">{formatPrice(setupSavings)}</strong></div>
                      <div className="flex justify-between gap-3"><span className="text-gray-500">Setup score</span><strong className="text-[#a17b2f]">{setupScore}%</strong></div>
                    </div>

                    {setupTotal > budget && (
                      <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">Your selection exceeds the budget. Replace a product before adding the setup.</p>
                    )}

                    <button
                      type="button"
                      onClick={() => void addCompleteSetup()}
                      disabled={!finalProducts.length || setupTotal > budget}
                      className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c9a24d] text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ShoppingCart size={15} /> Add Complete Setup
                    </button>

                    <Link href="/dashboard/products" className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e4dccd] text-xs font-black text-gray-600">
                      Browse More Products <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-[#e8dfd0] bg-white p-5">
                  <div className="flex items-center gap-2">
                    <BadgeCheck size={17} className="text-[#b58a32]" />
                    <h3 className="text-sm font-black">How matching works</h3>
                  </div>
                  <div className="mt-4 space-y-3 text-xs leading-5 text-gray-500">
                    <p>• Product names are matched to the selected component.</p>
                    <p>• Only active, in-stock products within your item budget are considered.</p>
                    <p>• Quality First uses ratings and review counts to rank matching options.</p>
                    <p>• Each component can have only one selected product.</p>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </section>

        <section className="mt-10 rounded-[25px] border border-[#dfc98e] bg-[#fff6df] p-6 sm:p-9">
          <div className="flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#956f27]">PrimeCart Setup Studio</p>
              <h2 className="mt-2 text-2xl font-black">Build less. Choose smarter.</h2>
              <p className="mt-2 max-w-xl text-sm text-gray-500">A setup that fits your workflow, your budget and your style.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetAll();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#c9a24d] px-5 text-xs font-black text-white"
            >
              <RefreshCw size={14} /> Build Again
            </button>
          </div>
        </section>

        <div className="h-10" />
      </main>
    </div>
  );
}
