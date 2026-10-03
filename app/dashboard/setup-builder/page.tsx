
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
  Headphones,
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
      "monitor", "computer display", "desktop display",
      "gaming display", "led display",
    ],
  },
  {
    id: "keyboard",
    title: "Keyboard",
    description: "Typing and gaming controls",
    icon: Keyboard,
    keywords: ["keyboard", "keypad"],
  },
  {
    id: "mouse",
    title: "Mouse",
    description: "Navigation and precision control",
    icon: Mouse,
    keywords: ["mouse", "trackball"],
  },
  {
    id: "audio",
    title: "Audio",
    description: "Headphones, headsets and speakers",
    icon: Headphones,
    keywords: [
      "headphones", "headphone", "headset", "earphones",
      "earbuds", "speaker", "computer audio",
    ],
  },
  {
    id: "webcam",
    title: "Webcam",
    description: "Cameras for calls and streaming",
    icon: Webcam,
    keywords: ["webcam", "web camera", "conference camera"],
  },
  {
    id: "microphone",
    title: "Microphone",
    description: "Voice recording and streaming",
    icon: Mic,
    keywords: ["microphone", "usb mic", "studio mic"],
  },
  {
    id: "controller",
    title: "Controller",
    description: "Gamepads and gaming controllers",
    icon: Gamepad2,
    keywords: ["game controller", "gamepad", "game pad", "joystick"],
  },
  {
    id: "accessories",
    title: "Accessories",
    description: "Useful computer and desk accessories",
    icon: Package,
    keywords: [
      "mouse pad", "mousepad", "desk mat", "laptop stand",
      "monitor stand", "headphone stand", "usb hub",
      "capture card", "hdmi cable", "usb cable", "usb adapter",
      "desk lamp", "cooling pad", "laptop cooler",
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
    display: { title: "Office Monitor", description: "Documents and multitasking" },
    keyboard: { title: "Work Keyboard", description: "Comfortable typing" },
    mouse: { title: "Productivity Mouse", description: "Daily navigation" },
    audio: { title: "Meeting Audio", description: "Calls and meetings" },
    webcam: { title: "Meeting Webcam", description: "Video meetings" },
    accessories: { title: "Desk Essentials", description: "Stands, hubs and accessories" },
  },
  gaming: {
    display: { title: "Gaming Monitor", description: "Responsive gameplay" },
    keyboard: { title: "Gaming Keyboard", description: "Gaming controls" },
    mouse: { title: "Gaming Mouse", description: "Precise movements" },
    audio: { title: "Gaming Audio", description: "Immersive sound" },
    controller: { title: "Game Controller", description: "Supported games" },
    accessories: { title: "Gaming Accessories", description: "Mats, stands and gear" },
  },
  study: {
    display: { title: "Study Monitor", description: "Lessons and reading" },
    keyboard: { title: "Study Keyboard", description: "Notes and assignments" },
    mouse: { title: "Study Mouse", description: "Everyday learning" },
    audio: { title: "Class Audio", description: "Lectures and classes" },
    webcam: { title: "Online Class Webcam", description: "Virtual lessons" },
    accessories: { title: "Study Accessories", description: "Stands, lamps and hubs" },
  },
  creator: {
    display: { title: "Creator Monitor", description: "Editing and design" },
    keyboard: { title: "Creative Keyboard", description: "Creative workflows" },
    mouse: { title: "Precision Mouse", description: "Editing and design" },
    audio: { title: "Creator Audio", description: "Monitoring and playback" },
    webcam: { title: "Creator Webcam", description: "Recording and streaming" },
    microphone: { title: "Recording Microphone", description: "Voice capture" },
    accessories: { title: "Creator Accessories", description: "Capture cards, stands and hubs" },
  },
  everyday: {
    display: { title: "Everyday Monitor", description: "General computer use" },
    keyboard: { title: "Everyday Keyboard", description: "Daily typing" },
    mouse: { title: "Everyday Mouse", description: "Reliable navigation" },
    audio: { title: "Everyday Audio", description: "Music and entertainment" },
    accessories: { title: "Tech Accessories", description: "Useful computer accessories" },
  },
};

const priorityOptions: {
  id: PriorityType;
  title: string;
  description: string;
}[] = [
  { id: "balanced", title: "Balanced", description: "Balance quality and price." },
  { id: "value", title: "Best Value", description: "Prioritize quality per rupee." },
  { id: "quality", title: "Quality First", description: "Prioritize ratings and review confidence." },
  { id: "savings", title: "Maximum Savings", description: "Prefer suitable lower-priced products." },
];

const budgetPresets = [
  { label: "Starter", amount: 5000 },
  { label: "Balanced", amount: 10000 },
  { label: "Pro", amount: 20000 },
  { label: "Premium", amount: 35000 },
  { label: "Ultimate", amount: 50000 },
];

const blockedNames = [
  "screen protector", "tempered glass", "sunscreen", "moisturizer",
  "moisturiser", "serum", "face wash", "lipstick", "foundation",
  "shampoo", "conditioner", "saree", "kurta", "dress", "t shirt",
  "jeans", "detergent", "cooking oil", "snack", "biscuit",
  "beauty", "skincare", "skin care", "cosmetic", "face cream",
  "body lotion", "perfume", "toothpaste", "food", "toy",
  "mobile phone", "smartphone", "tablet", "refrigerator",
  "washing machine", "television", "smart tv",
];

const blockedCategories = [
  "beauty", "skincare", "skin care", "personal care", "fashion",
  "clothing", "footwear", "grocery", "groceries", "food",
  "beverage", "toys", "baby", "jewellery", "jewelry", "automotive",
];

const allowedAccessories: Record<SetupType, string[]> = {
  work: [
    "mouse pad", "mousepad", "desk mat", "laptop stand",
    "monitor stand", "headphone stand", "usb hub", "usb cable",
    "hdmi cable", "usb adapter", "desk lamp",
  ],
  study: [
    "mouse pad", "mousepad", "desk mat", "laptop stand",
    "monitor stand", "headphone stand", "usb hub", "usb cable",
    "hdmi cable", "usb adapter", "desk lamp",
  ],
  everyday: [
    "mouse pad", "mousepad", "desk mat", "laptop stand",
    "monitor stand", "headphone stand", "usb hub", "usb cable",
    "hdmi cable", "usb adapter",
  ],
  gaming: [
    "mouse pad", "mousepad", "desk mat", "cooling pad",
    "laptop cooler", "usb hub", "gaming desk", "laptop stand",
    "monitor stand", "headphone stand", "usb cable", "hdmi cable",
    "usb adapter",
  ],
  creator: [
    "capture card", "usb hub", "laptop stand", "monitor stand",
    "desk mat", "usb cable", "hdmi cable", "usb adapter",
  ],
};

function normalize(value: string | null | undefined) {
  return (value || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function hasWholePhrase(text: string, phrase: string) {
  return (` ${normalize(text)} `).includes(` ${normalize(phrase)} `);
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

  return [...new Set([
    `/${clean}`,
    `/products/${clean}`,
    `/product-images/${clean}`,
    `/images/${clean}`,
    `/images/products/${clean}`,
  ])];
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

  if (!candidates[index]) {
    return (
      <div className="flex h-full w-full items-center justify-center text-[#c9a24d]">
        <Package size={34} />
      </div>
    );
  }

  return (
    <img
      src={candidates[index]}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setIndex((old) => old + 1)}
    />
  );
}

function detectComponent(product: Product): ComponentType | null {
  const name = normalize(product.name);
  const category = normalize(product.category_name);

  if (!name) return null;

  if (blockedNames.some((term) => hasWholePhrase(name, term))) return null;

  if (
    category &&
    blockedCategories.some((term) => hasWholePhrase(category, term))
  ) {
    return null;
  }

  // Never mistake a mouse pad for a mouse or a stand for a microphone.
  if (
    hasWholePhrase(name, "mouse pad") ||
    hasWholePhrase(name, "mousepad") ||
    hasWholePhrase(name, "desk mat")
  ) {
    return "accessories";
  }

  if (
    hasWholePhrase(name, "microphone stand") ||
    hasWholePhrase(name, "webcam stand") ||
    hasWholePhrase(name, "headphone stand") ||
    hasWholePhrase(name, "monitor stand") ||
    hasWholePhrase(name, "laptop stand")
  ) {
    return "accessories";
  }

  if (components.find((c) => c.id === "controller")!.keywords.some((k) => hasWholePhrase(name, k))) {
    return "controller";
  }

  if (components.find((c) => c.id === "webcam")!.keywords.some((k) => hasWholePhrase(name, k))) {
    return "webcam";
  }

  if (components.find((c) => c.id === "microphone")!.keywords.some((k) => hasWholePhrase(name, k))) {
    return "microphone";
  }

  if (components.find((c) => c.id === "accessories")!.keywords.some((k) => hasWholePhrase(name, k))) {
    return "accessories";
  }

  if (components.find((c) => c.id === "keyboard")!.keywords.some((k) => hasWholePhrase(name, k))) {
    return "keyboard";
  }

  if (
    hasWholePhrase(name, "gaming mouse") ||
    hasWholePhrase(name, "computer mouse") ||
    hasWholePhrase(name, "wireless mouse") ||
    hasWholePhrase(name, "optical mouse") ||
    name === "mouse"
  ) {
    return "mouse";
  }

  if (components.find((c) => c.id === "audio")!.keywords.some((k) => hasWholePhrase(name, k))) {
    return "audio";
  }

  if (
    hasWholePhrase(name, "monitor") ||
    hasWholePhrase(name, "computer display") ||
    hasWholePhrase(name, "desktop display") ||
    hasWholePhrase(name, "gaming display")
  ) {
    return "display";
  }

  return null;
}

function isPurposeSuitable(product: Product, purpose: SetupType) {
  const component = detectComponent(product);
  const name = normalize(product.name);

  if (!component || !componentsByPurpose[purpose].includes(component)) {
    return false;
  }

  // A display must be a computer monitor, not a phone screen protector,
  // television, or unrelated display accessory.
  if (
    component === "display" &&
    (
      hasWholePhrase(name, "screen protector") ||
      hasWholePhrase(name, "smart tv") ||
      hasWholePhrase(name, "television")
    )
  ) {
    return false;
  }

  const gamingSpecific = [
    "gaming keyboard", "gaming mouse", "gaming headset",
    "gaming controller", "gaming monitor", "rgb gaming",
  ].some((term) => hasWholePhrase(name, term));

  if (["work", "study", "everyday"].includes(purpose) && gamingSpecific) {
    return false;
  }

  if (
    component === "accessories" &&
    !allowedAccessories[purpose].some((term) => hasWholePhrase(name, term))
  ) {
    return false;
  }

  if (purpose === "creator" && component === "controller") return false;

  return true;
}

function scoreProduct(
  product: Product,
  purpose: SetupType,
  budget: number,
  priority: PriorityType
) {
  const price = Number(product.price);
  const rating = Math.max(0, Math.min(5, Number(product.rating || 0)));
  const reviews = Math.max(0, Number(product.reviews_count || 0));
  const discount = discountPercent(price, product.original_price);
  const share = price / Math.max(1, budget);

  let score = rating * 8;
  score += Math.min(10, Math.log10(reviews + 1) * 4);

  if (share <= 0.15) score += 6;
  else if (share <= 0.35) score += 10;
  else if (share <= 0.6) score += 8;
  else score += 3;

  if (product.is_featured) score += 2;
  if (product.is_flash_sale) score += 2;

  if (priority === "quality") {
    score = rating * 14 + Math.min(25, Math.log10(reviews + 1) * 10);
    if (rating >= 4.5) score += 8;
    if (reviews < 5) score -= 5;
  } else if (priority === "savings") {
    score = 60 - share * 35 + Math.min(20, discount * 0.4) + rating * 2;
  } else if (priority === "value") {
    score = (rating * 12 + Math.min(20, Math.log10(reviews + 1) * 8)) /
      Math.max(0.2, share);
    score += Math.min(10, discount * 0.2);
  }

  if (purpose === "gaming" && /gaming|mechanical|rgb|low latency/i.test(product.name)) {
    score += 4;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function rankProducts(
  list: SetupProduct[],
  priority: PriorityType,
  budget: number
) {
  return [...list].sort((a, b) => {
    if (priority === "quality") {
      return (
        b.rating - a.rating ||
        b.reviews_count - a.reviews_count ||
        a.price - b.price
      );
    }

    if (priority === "savings") {
      return (
        a.price - b.price ||
        b.rating - a.rating ||
        b.reviews_count - a.reviews_count
      );
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

    const target = budget * 0.28;
    return (
      Math.abs(a.price - target) - Math.abs(b.price - target) ||
      b.matchScore - a.matchScore ||
      a.price - b.price
    );
  });
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

  // null means the user deliberately removed this component.
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
          .gt("stock", 0)
          .order("name", { ascending: true })
          .limit(2000),

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
          "Products could not be loaded. Check Supabase tables, RLS policies and connection.",
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
      .filter((product) => {
        if (
          !product.is_active ||
          product.stock <= 0 ||
          !Number.isFinite(product.price) ||
          product.price <= 0 ||
          product.price > budget
        ) {
          return false;
        }

        const component = detectComponent(product);

        return (
          component !== null &&
          selectedComponents.includes(component) &&
          isPurposeSuitable(product, setupType)
        );
      })
      .map((product) => {
        const component = detectComponent(product)!;

        return {
          ...product,
          component,
          matchScore: scoreProduct(product, setupType, budget, priority),
        };
      });
  }, [products, budget, setupType, priority, selectedComponents]);

  // Build a complete set by reserving the cheapest available product
  // for each remaining component before selecting a more expensive one.
  const recommendedProducts = useMemo<SetupProduct[]>(() => {
    const chosen: SetupProduct[] = [];
    let remaining = budget;

    const lists = new Map<ComponentType, SetupProduct[]>();

    for (const component of selectedComponents) {
      lists.set(
        component,
        rankProducts(
          matchedProducts.filter((product) => product.component === component),
          priority,
          budget
        )
      );
    }

    for (let index = 0; index < selectedComponents.length; index += 1) {
      const component = selectedComponents[index];
      const candidates = lists.get(component) || [];
      const laterComponents = selectedComponents.slice(index + 1);

      const reserve = laterComponents.reduce((sum, later) => {
        const list = lists.get(later) || [];
        return sum + (list.length ? Math.min(...list.map((p) => p.price)) : 0);
      }, 0);

      const affordable = candidates.filter(
        (product) => product.price <= remaining - reserve
      );

      if (!affordable.length) continue;

      // Rotate only among the top-ranked options; all remain budget-safe.
      const pool = affordable.slice(0, Math.min(5, affordable.length));
      const offset = pool.length
        ? (buildSeed + index * 2) % pool.length
        : 0;

      const selected = pool[offset];

      if (selected && selected.price <= remaining) {
        chosen.push(selected);
        remaining -= selected.price;
      }
    }

    return chosen;
  }, [matchedProducts, selectedComponents, budget, priority, buildSeed]);

  const finalProducts = useMemo<SetupProduct[]>(() => {
    const selected: SetupProduct[] = [];
    let runningTotal = 0;

    // Explicit choices are respected first. Any choice that no longer exists
    // under the current filters is not included.
    for (const component of selectedComponents) {
      if (!Object.prototype.hasOwnProperty.call(manualChoices, component)) {
        continue;
      }

      const id = manualChoices[component];
      if (!id) continue;

      const product = matchedProducts.find(
        (item) => item.id === id && item.component === component
      );

      if (!product || runningTotal + product.price > budget) continue;

      selected.push(product);
      runningTotal += product.price;
    }

    for (const component of selectedComponents) {
      if (Object.prototype.hasOwnProperty.call(manualChoices, component)) {
        continue;
      }

      const product = recommendedProducts.find(
        (item) => item.component === component
      );

      if (!product || selected.some((item) => item.component === component)) {
        continue;
      }

      if (runningTotal + product.price > budget) continue;

      selected.push(product);
      runningTotal += product.price;
    }

    return selected;
  }, [
    selectedComponents,
    manualChoices,
    matchedProducts,
    recommendedProducts,
    budget,
  ]);

  const setupTotal = finalProducts.reduce((sum, item) => sum + item.price, 0);
  const setupSavings = finalProducts.reduce(
    (sum, item) =>
      sum + Math.max(0, Number(item.original_price || item.price) - item.price),
    0
  );
  const remainingBudget = Math.max(0, budget - setupTotal);
  const budgetUsage =
    budget > 0 ? Math.min(100, Math.round((setupTotal / budget) * 100)) : 0;

  const averageRating = finalProducts.length
    ? finalProducts.reduce((sum, item) => sum + item.rating, 0) /
      finalProducts.length
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
        if (current.length <= 1) {
          setNotice({
            type: "info",
            message: "Select at least one component for your setup.",
          });
          return current;
        }

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

    if (currentChoice === productId) {
      setManualChoices((current) => {
        const next = { ...current };
        delete next[product.component];
        return next;
      });

      setNotice({
        type: "success",
        message: "Default recommendation restored.",
      });
      return;
    }

    const otherTotal = finalProducts
      .filter((item) => item.component !== product.component)
      .reduce((sum, item) => sum + item.price, 0);

    if (otherTotal + product.price > budget) {
      setNotice({
        type: "error",
        message: `This selection exceeds your ${formatPrice(budget)} budget. Choose a cheaper product or remove another component.`,
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
    if (loading) return;

    if (!selectedComponents.length) {
      setNotice({ type: "error", message: "Select at least one component." });
      return;
    }

    setBuilding(true);
    setNotice(null);
    setManualChoices({});
    setBuildSeed((current) => current + 1);

    // Yield one frame so the building state is visible.
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

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
        setNotice({
          type: "success",
          message: `${product.name} added to cart.`,
        });
      }

      return true;
    } catch (error) {
      console.error("Setup Builder cart error:", error);

      if (!silent) {
        setNotice({
          type: "error",
          message: "Could not update your cart. Check cart_items and its permissions.",
        });
      }

      return false;
    }
  }

  async function addCompleteSetup() {
    if (!finalProducts.length) {
      setNotice({
        type: "info",
        message: "No products are available. Try increasing your budget or changing components.",
      });
      return;
    }

    if (setupTotal > budget) {
      setNotice({
        type: "error",
        message: "Your setup exceeds the budget. Replace a product first.",
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
                Choose your purpose, set your maximum budget and find relevant
                products from your real catalogue.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Real catalogue", "Budget-aware", "Custom components", "Wishlist & cart"].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#e9e1d4] bg-[#fffdf9] px-3 py-2 text-[10px] font-bold text-gray-600"
                  >
                    <Check size={12} className="text-[#b58a32]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mx-auto w-full max-w-[440px] rounded-[25px] border border-[#e8dcc3] bg-[#fffaf0] p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#a17b2f]">Current plan</p>
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
                  <div className="h-full rounded-full bg-[#c9a24d] transition-all" style={{ width: `${budgetUsage}%` }} />
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
                    step >= number ? "bg-[#c9a24d] text-white" : "bg-[#f2eee6] text-gray-400"
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
                <button type="button" onClick={() => setStep(2)} className="flex h-11 items-center gap-2 rounded-xl bg-[#c9a24d] px-6 text-xs font-black text-white">
                  Continue <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-5 sm:p-8 lg:p-10">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#b58a32]">Step 02 · Budget</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">Set your maximum budget.</h2>
              <p className="mt-2 text-sm text-gray-500">The combined total of selected products must stay within this amount.</p>

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
                        budget === preset.amount ? "border-[#c9a24d] bg-[#fff5dc] text-[#956f27]" : "border-[#e5ddcf] hover:border-[#d0b46c]"
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
                      onChange={(event) => setCustomBudget(event.target.value)}
                      className="h-11 min-w-0 flex-1 rounded-xl border border-[#ddd4c3] bg-white px-4 text-sm font-bold outline-none focus:border-[#c9a24d]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const amount = Number(customBudget);

                        if (!Number.isFinite(amount) || amount < 2000 || amount > 100000) {
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
                <button type="button" onClick={() => setStep(1)} className="flex h-11 items-center gap-2 rounded-xl border border-[#e4dccd] px-5 text-xs font-black">
                  <ArrowLeft size={15} /> Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="flex h-11 items-center gap-2 rounded-xl bg-[#c9a24d] px-6 text-xs font-black text-white">
                  Continue <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-5 sm:p-8 lg:p-10">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#b58a32]">Step 03 · Preferences</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">Choose your components.</h2>
              <p className="mt-2 text-sm text-gray-500">Select components and decide how products should be ranked.</p>

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
                  <p className="mt-1 text-xs text-gray-500">This changes product ranking.</p>
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
                <button type="button" onClick={() => setStep(2)} className="flex h-11 items-center gap-2 rounded-xl border border-[#e4dccd] px-5 text-xs font-black">
                  <ArrowLeft size={15} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => void buildSetup()}
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
                  <p className="mt-2 text-sm text-gray-500">Review recommended products and customize components.</p>
                </div>
                <button type="button" onClick={resetAll} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e4dccd] px-4 text-xs font-black">
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
                    Each component shows matching alternatives. Choosing another product replaces that component.
                  </p>
                </div>

                {loading ? (
                  <div className="rounded-2xl border border-[#e8dfd0] bg-white p-10 text-center">
                    <RefreshCw size={24} className="mx-auto animate-spin text-[#b58a32]" />
                    <p className="mt-3 text-sm font-bold">Loading catalogue...</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {selectedComponents.map((component) => {
                      const config = components.find((item) => item.id === component)!;
                      const Icon = config.icon;

                      const choices = rankProducts(
                        matchedProducts.filter((item) => item.component === component),
                        priority,
                        budget
                      ).slice(0, 5);

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
                            <div className="p-5">
                              <p className="text-xs text-gray-500">No matching in-stock product is available for this component within your budget.</p>
                              <button type="button" onClick={() => setStep(2)} className="mt-3 text-xs font-black text-[#956f27] underline">Change budget</button>
                            </div>
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
                                        {product.stock} in stock · {product.matchScore}% score
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

                    {finalProducts.length < selectedComponents.length && (
                      <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                        Some components have no affordable match. Try a larger budget or select fewer components.
                      </p>
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
                    <p>• Product names are checked against component-specific keywords.</p>
                    <p>• Active, in-stock products within the maximum budget are considered.</p>
                    <p>• Quality First prioritizes ratings and review counts.</p>
                    <p>• Best Value considers ratings relative to price.</p>
                    <p>• Maximum Savings ranks lower-priced matching products first.</p>
                    <p>• Each component can have one selected product.</p>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}

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
