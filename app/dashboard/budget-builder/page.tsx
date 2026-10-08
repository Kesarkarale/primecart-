
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronDown,
  Copy,
  CircleDollarSign,
  GitCompare,
  Lightbulb,
  Clock3,
  Crown,
  Heart,
  Layers3,
  Plus,
  RotateCcw,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Wand2,
  X,
  Target,
  TrendingDown,
  Wallet,
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

const budgetOptions = [
  { label: "₹2K", value: 2000 },
  { label: "₹5K", value: 5000 },
  { label: "₹10K", value: 10000 },
  { label: "₹20K", value: 20000 },
  { label: "₹50K", value: 50000 },
];

const shoppingGoals = [
  {
    id: "value",
    title: "Maximum Value",
    description: "Best products for every rupee",
    icon: TrendingDown,
  },
  {
    id: "quality",
    title: "Quality First",
    description: "Prioritize ratings and reliability",
    icon: BadgeCheck,
  },
  {
    id: "premium",
    title: "Premium",
    description: "Higher-end products within budget",
    icon: Crown,
  },
  {
    id: "multiple",
    title: "More Products",
    description: "Build a complete shopping cart",
    icon: Layers3,
  },
];

/*
 * PrimeCart Budget Builder - exact category/subcategory map provided by Kesar.
 * Products are matched using the supplied keywords against product name,
 * brand, slug and description because the current products table does not
 * expose a dedicated subcategory_id field.
 */
const SUBCATEGORY_MAP: Record<string, { label: string; keywords: string[] }[]> = {
  fashion: [
    { label: "T-Shirts", keywords: ["tshirt", "t-shirt", "tee", "t shirt"] },
    { label: "Shirts", keywords: ["shirt", "formal shirt", "casual shirt", "oxford"] },
    { label: "Tops", keywords: ["top", "crop top", "tank top", "camisole"] },
    { label: "Jeans", keywords: ["jeans", "denim"] },
    { label: "Trousers & Pants", keywords: ["trouser", "pants", "chino", "cargo"] },
    { label: "Dresses", keywords: ["dress", "gown", "maxi dress", "midi"] },
    { label: "Skirts", keywords: ["skirt", "mini skirt", "midi skirt"] },
    { label: "Jackets & Coats", keywords: ["jacket", "coat", "blazer", "overcoat"] },
    { label: "Hoodies & Sweatshirts", keywords: ["hoodie", "sweatshirt", "sweater"] },
    { label: "Ethnic Wear", keywords: ["kurta", "kurti", "saree", "ethnic", "salwar", "lehenga", "anarkali"] },
    { label: "Innerwear", keywords: ["innerwear", "inner wear", "bra", "brief", "boxer"] },
    { label: "Sleepwear", keywords: ["sleepwear", "nightwear", "night suit", "pyjama", "pajama"] },
    { label: "Sportswear", keywords: ["activewear", "sportswear", "track pants", "gym wear"] },
    { label: "Fashion Accessories", keywords: ["belt", "cap", "scarf", "tie", "socks", "accessory"] },
  ],
  mobile: [
    { label: "Smartphones", keywords: ["mobile", "phone", "smartphone", "iphone", "android"] },
    { label: "Cases & Covers", keywords: ["case", "cover", "back cover"] },
    { label: "Chargers & Adapters", keywords: ["charger", "charging", "adapter", "gan charger"] },
    { label: "Power Banks", keywords: ["power bank", "powerbank"] },
    { label: "Screen Protectors", keywords: ["screen protector", "tempered", "glass protector"] },
    { label: "Cables", keywords: ["cable", "usb cable", "type c", "lightning cable"] },
    { label: "Mobile Holders", keywords: ["mobile holder", "phone holder", "stand"] },
    { label: "Mobile Accessories", keywords: ["mobile accessory", "phone accessory"] },
  ],
  electronics: [
    { label: "Headphones & Earbuds", keywords: ["headphone", "headset", "earphone", "earbuds"] },
    { label: "Speakers", keywords: ["speaker", "soundbar", "bluetooth speaker"] },
    { label: "Keyboards", keywords: ["keyboard", "mechanical keyboard"] },
    { label: "Mice", keywords: ["mouse", "mice"] },
    { label: "Monitors", keywords: ["monitor", "display"] },
    { label: "Cameras", keywords: ["camera", "dslr", "mirrorless", "action camera"] },
    { label: "Printers", keywords: ["printer", "printing"] },
    { label: "Projectors", keywords: ["projector"] },
    { label: "Networking", keywords: ["router", "wifi", "network", "switch"] },
    { label: "Computer Accessories", keywords: ["webcam", "hub", "mouse pad", "computer accessory"] },
  ],
  "home & kitchen": [
    { label: "Kitchen Essentials", keywords: ["kitchen", "cookware", "pan", "pot", "utensil"] },
    { label: "Cookware", keywords: ["cookware", "kadai", "pressure cooker", "tawa"] },
    { label: "Coffee & Tea", keywords: ["coffee", "tea", "kettle", "mug"] },
    { label: "Dining & Serveware", keywords: ["dining", "plate", "bowl", "glass", "serveware"] },
    { label: "Home Decor", keywords: ["decor", "decoration", "wall", "lamp", "cushion", "vase"] },
    { label: "Storage & Organization", keywords: ["storage", "organizer", "rack", "box", "container"] },
    { label: "Furniture", keywords: ["furniture", "chair", "table", "sofa", "desk", "shelf"] },
    { label: "Bedding & Bath", keywords: ["bedsheet", "bedding", "pillow", "towel", "bath"] },
    { label: "Cleaning", keywords: ["cleaning", "mop", "broom", "cleaner"] },
  ],
  appliance: [
    { label: "Kitchen Appliances", keywords: ["air fryer", "mixer", "oven", "microwave", "kettle", "coffee maker", "toaster"] },
    { label: "Refrigerators", keywords: ["refrigerator", "fridge"] },
    { label: "Washing Machines", keywords: ["washing machine", "washer"] },
    { label: "Air Conditioners", keywords: ["air conditioner", "ac", "split ac"] },
    { label: "Fans", keywords: ["fan", "ceiling fan", "table fan"] },
    { label: "Coolers", keywords: ["cooler", "air cooler"] },
    { label: "Vacuum Cleaners", keywords: ["vacuum", "vacuum cleaner"] },
    { label: "Geysers & Water Heaters", keywords: ["geyser", "water heater"] },
    { label: "Irons", keywords: ["iron", "steam iron"] },
  ],
  footwear: [
    { label: "Sneakers", keywords: ["sneaker", "sneakers"] },
    { label: "Running Shoes", keywords: ["running", "running shoe"] },
    { label: "Sports Shoes", keywords: ["sports shoe", "training shoe"] },
    { label: "Casual Shoes", keywords: ["casual shoe", "casual shoes"] },
    { label: "Formal Shoes", keywords: ["formal shoe", "loafers", "loafer", "oxford shoe"] },
    { label: "Sandals", keywords: ["sandal", "sandals"] },
    { label: "Slippers", keywords: ["slipper", "slippers", "flip flop"] },
    { label: "Boots", keywords: ["boot", "boots"] },
    { label: "Heels", keywords: ["heel", "heels", "stiletto"] },
    { label: "Kids Footwear", keywords: ["kids shoe", "kids footwear", "children shoe"] },
  ],
  beauty: [
    { label: "Face Care", keywords: ["face wash", "cleanser", "face cream", "face care"] },
    { label: "Serums", keywords: ["serum", "face serum"] },
    { label: "Moisturizers", keywords: ["moisturizer", "moisturiser", "hydrating cream"] },
    { label: "Sunscreen", keywords: ["sunscreen", "sun screen", "spf"] },
    { label: "Makeup", keywords: ["makeup", "make up"] },
    { label: "Lip Makeup", keywords: ["lipstick", "lip gloss", "lip balm", "lip liner"] },
    { label: "Eye Makeup", keywords: ["mascara", "eyeliner", "kajal", "eyeshadow"] },
    { label: "Foundation & Concealer", keywords: ["foundation", "concealer", "compact"] },
    { label: "Hair Care", keywords: ["shampoo", "conditioner", "hair mask", "hair oil", "hair care"] },
    { label: "Hair Styling", keywords: ["hair dryer", "straightener", "curler", "styling"] },
    { label: "Fragrance", keywords: ["perfume", "fragrance", "deodorant", "body spray"] },
    { label: "Bath & Body", keywords: ["body wash", "body lotion", "body scrub", "bath", "body care"] },
    { label: "Oral Care", keywords: ["toothpaste", "toothbrush", "oral care"] },
    { label: "Men's Grooming", keywords: ["shaving", "beard", "trimmer", "razor", "mens grooming"] },
    { label: "Beauty Tools", keywords: ["beauty tool", "makeup brush", "sponge", "facial tool"] },
    { label: "Nail Care", keywords: ["nail", "nail polish", "manicure"] },
  ],
  "toy & baby": [
    { label: "Toys", keywords: ["toy", "toys", "doll", "car toy"] },
    { label: "Board Games", keywords: ["board game", "board games"] },
    { label: "Puzzles", keywords: ["puzzle", "jigsaw"] },
    { label: "Educational Toys", keywords: ["educational", "learning toy", "stem"] },
    { label: "Baby Care", keywords: ["baby", "diaper", "feeding", "infant"] },
    { label: "Baby Clothing", keywords: ["baby clothes", "baby clothing", "newborn"] },
    { label: "Baby Feeding", keywords: ["feeding bottle", "baby feeding", "bottle"] },
    { label: "Kids Games", keywords: ["kids game", "game for kids"] },
    { label: "Remote Control Toys", keywords: ["remote control", "rc car", "rc toy"] },
    { label: "Outdoor Toys", keywords: ["outdoor toy", "ride on", "scooter"] },
  ],
  sports: [
    { label: "Fitness & Gym", keywords: ["fitness", "gym", "dumbbell", "workout", "gym equipment"] },
    { label: "Running", keywords: ["running", "jogging"] },
    { label: "Yoga", keywords: ["yoga", "mat", "meditation"] },
    { label: "Sportswear", keywords: ["sportswear", "track", "activewear", "jersey"] },
    { label: "Cricket", keywords: ["cricket", "bat", "ball", "wicket"] },
    { label: "Football", keywords: ["football", "soccer"] },
    { label: "Badminton", keywords: ["badminton", "racket", "shuttle"] },
    { label: "Cycling", keywords: ["cycle", "cycling", "bicycle"] },
    { label: "Camping & Outdoor", keywords: ["camping", "tent", "hiking", "outdoor"] },
    { label: "Sports Accessories", keywords: ["sports accessory", "sports accessories"] },
  ],
  automotive: [
    { label: "Car Accessories", keywords: ["car", "car accessory", "car cover", "dashboard"] },
    { label: "Bike Accessories", keywords: ["bike", "motorcycle", "helmet", "biker"] },
    { label: "Car Electronics", keywords: ["car audio", "dash cam", "gps", "car charger"] },
    { label: "Cleaning & Care", keywords: ["cleaning", "polish", "car care", "cleaner"] },
    { label: "Interior Accessories", keywords: ["seat cover", "floor mat", "car interior"] },
    { label: "Exterior Accessories", keywords: ["car cover", "exterior", "mirror"] },
    { label: "Tools & Maintenance", keywords: ["tool", "maintenance", "puncture", "repair"] },
    { label: "Safety Accessories", keywords: ["safety", "reflector", "first aid", "emergency"] },
  ],
  gaming: [
    { label: "Gaming Keyboards", keywords: ["gaming keyboard", "mechanical keyboard"] },
    { label: "Gaming Mice", keywords: ["gaming mouse", "gaming mice"] },
    { label: "Gaming Headsets", keywords: ["gaming headset", "gaming headphone"] },
    { label: "Controllers", keywords: ["controller", "gamepad"] },
    { label: "Consoles", keywords: ["console", "playstation", "xbox", "nintendo"] },
    { label: "Gaming Monitors", keywords: ["gaming monitor"] },
    { label: "Gaming Chairs", keywords: ["gaming chair"] },
    { label: "Gaming Accessories", keywords: ["gaming accessory", "mouse pad", "streaming"] },
    { label: "PC Gaming", keywords: ["gaming pc", "gaming desktop", "graphics card", "gpu"] },
  ],
  watch: [
    { label: "Smartwatches", keywords: ["smartwatch", "smart watch"] },
    { label: "Analog Watches", keywords: ["analog", "analogue", "wrist watch"] },
    { label: "Digital Watches", keywords: ["digital watch"] },
    { label: "Sports Watches", keywords: ["sports watch", "fitness watch"] },
    { label: "Luxury Watches", keywords: ["luxury watch", "premium watch"] },
    { label: "Watch Accessories", keywords: ["watch strap", "watch band", "watch accessory"] },
  ],
  bag: [
    { label: "Backpacks", keywords: ["backpack", "backpacks"] },
    { label: "Handbags", keywords: ["handbag", "hand bag"] },
    { label: "Sling Bags", keywords: ["sling bag", "crossbody"] },
    { label: "Travel Bags", keywords: ["travel bag", "luggage", "duffle", "duffel"] },
    { label: "Laptop Bags", keywords: ["laptop bag", "laptop backpack"] },
    { label: "School Bags", keywords: ["school bag", "school backpack"] },
    { label: "Wallets", keywords: ["wallet", "card holder"] },
    { label: "Clutches", keywords: ["clutch", "clutches"] },
  ],
  books: [
    { label: "Study & Academic", keywords: ["study", "academic", "textbook", "college"] },
    { label: "Competitive Exams", keywords: ["competitive exam", "entrance", "upsc", "mpsc", "ssc", "bank exam"] },
    { label: "Fiction", keywords: ["fiction", "novel", "story"] },
    { label: "Non-Fiction", keywords: ["non fiction", "nonfiction"] },
    { label: "Self Help", keywords: ["self help", "personal development", "motivation"] },
    { label: "Business & Finance", keywords: ["business", "finance", "investment", "entrepreneur"] },
    { label: "Children's Books", keywords: ["children", "kids book", "kids books"] },
    { label: "Comics & Graphic Novels", keywords: ["comic", "graphic novel", "manga"] },
  ],
  eyewear: [
    { label: "Sunglasses", keywords: ["sunglass", "sunglasses"] },
    { label: "Eyeglasses", keywords: ["eyeglass", "spectacle", "glasses"] },
    { label: "Blue Light Glasses", keywords: ["blue light", "computer glasses"] },
    { label: "Reading Glasses", keywords: ["reading glasses", "reading glass"] },
    { label: "Kids Eyewear", keywords: ["kids eyewear", "kids glasses"] },
    { label: "Eyewear Accessories", keywords: ["eyewear accessory", "glasses case", "cleaning cloth"] },
  ],
};

function normalizeText(value: string | null | undefined) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getSubcategories(category?: Category) {
  if (!category) return [];

  const rawKeys = [
    category.slug,
    category.name,
    category.slug?.replace(/-/g, " "),
  ].filter(Boolean) as string[];

  for (const rawKey of rawKeys) {
    const key = normalizeText(rawKey);
    const found = Object.entries(SUBCATEGORY_MAP).find(
      ([mapKey]) => normalizeText(mapKey) === key
    );
    if (found) return found[1].map((item) => item.label);
  }

  return [];
}

function matchesSubcategory(product: Product, subcategory: string) {
  if (subcategory === "all") return true;

  const entry = Object.values(SUBCATEGORY_MAP)
    .flat()
    .find((item) => item.label === subcategory);

  if (!entry) return false;

  const haystack = normalizeText(
    `${product.name} ${product.brand || ""} ${product.slug} ${product.short_description || ""} ${product.description || ""}`
  );

  return entry.keywords.some((keyword) =>
    haystack.includes(normalizeText(keyword))
  );
}

function seededOrder(id: string, seed: number) {
  let hash = (seed + 1) * 97 + 17;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash >>> 0;
}

function seededRank(id: string, seed: number) {
  return seededOrder(id, seed) / 4294967296;
}

function getImageUrl(value: string | null) {
  if (!value) return null;

  const image = value.trim();
  if (!image) return null;

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `/products/${image.replace(/^\/+/, "")}`;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function discountPercent(
  price: number,
  originalPrice: number | null
) {
  if (!originalPrice || originalPrice <= price) return 0;

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100
  );
}

function getProductScore(
  product: Product,
  budget: number,
  goal: string
) {
  const price = Number(product.price);
  const rating = Number(product.rating || 0);
  const reviews = Number(product.reviews_count || 0);

  let score = 0;

  const budgetUsage = budget > 0 ? price / budget : 1;

  if (budgetUsage <= 0.15) score += 18;
  else if (budgetUsage <= 0.3) score += 25;
  else if (budgetUsage <= 0.5) score += 28;
  else if (budgetUsage <= 0.75) score += 24;
  else if (budgetUsage <= 1) score += 17;
  else score += 4;

  score += Math.round((rating / 5) * 28);
  score += Math.min(15, Math.round(reviews / 15));

  if (product.is_featured) score += 8;
  if (product.is_flash_sale) score += 8;

  const discount = discountPercent(
    price,
    product.original_price
      ? Number(product.original_price)
      : null
  );

  if (goal === "value") {
    score += Math.min(13, discount);
  }

  if (goal === "quality") {
    if (rating >= 4.5) score += 12;
    else if (rating >= 4) score += 7;
  }

  if (goal === "premium") {
    if (price >= budget * 0.4) score += 8;
    if (rating >= 4.5) score += 7;
  }

  if (goal === "multiple") {
    if (price <= budget * 0.25) score += 12;
    else if (price <= budget * 0.4) score += 7;
  }

  if (product.stock <= 0) score -= 30;

  return Math.max(0, Math.min(99, score));
}

function ProductImage({
  src,
  alt,
  className = "",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const [hasFailed, setHasFailed] = useState(false);

  const imageSources = useMemo(() => {
    if (!src) return [];

    const value = src.trim();

    if (!value) return [];

    if (/^https?:\/\//i.test(value)) {
      return [value];
    }

    const clean = value.replace(/^\/+/, "");

    return [
      `/${clean}`,
      `/products/${clean}`,
      `/product-images/${clean}`,
      `/images/products/${clean}`,
    ];
  }, [src]);

  useEffect(() => {
    setImageIndex(0);
    setHasFailed(false);
  }, [src]);

  if (imageSources.length === 0 || hasFailed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#faf8f3] text-[#c79a3b]">
        <ShoppingBag size={32} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={imageSources[imageIndex]}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (imageIndex < imageSources.length - 1) {
          setImageIndex((prev) => prev + 1);
        } else {
          setHasFailed(true);
        }
      }}
    />
  );
}

export default function BudgetBuilderPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  /* DATABASE STATES */
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [cartQuantities, setCartQuantities] = useState<
    Record<string, number>
  >({});

  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [planReady, setPlanReady] = useState(false);

  const [budget, setBudget] = useState(0);
  const [customBudget, setCustomBudget] = useState("");

  const [goal, setGoal] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [subcategory, setSubcategory] = useState("all");
  const [buildSeed, setBuildSeed] = useState(0);
  const [previousPlanIds, setPreviousPlanIds] = useState<string[]>([]);

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [manualPlanMode, setManualPlanMode] = useState(false);
 
 /* SMART PLANNING */
  const [swapProductId, setSwapProductId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [savedPlan, setSavedPlan] = useState(false);
  const [notice, setNotice] = useState("");
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);
  const [cartLoading, setCartLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();

    try {
      setSavedPlan(
        Boolean(localStorage.getItem("primecart-budget-plan"))
      );
    } catch {
      setSavedPlan(false);
    }
  }, []);

  /*
   * ============================================================
   * LOAD PRODUCTS + CATEGORIES + WISHLIST + CART FROM SUPABASE
   * ============================================================
   */
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
        cartResult,
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
          .from("wishlist_items")
          .select("product_id")
          .eq("user_id", user.id),

        supabase
          .from("cart_items")
          .select("product_id, quantity")
          .eq("user_id", user.id),
      ]);

      if (productsResult.error) {
        console.error(
          "Products error:",
          productsResult.error
        );
      }

      if (categoriesResult.error) {
        console.error(
          "Categories error:",
          categoriesResult.error
        );
      }

      if (wishlistResult.error) {
        console.error(
          "Wishlist error:",
          wishlistResult.error
        );
      }

      if (cartResult.error) {
        console.error(
          "Cart error:",
          cartResult.error
        );
      }

      setProducts(
        (productsResult.data as Product[]) || []
      );

      setCategories(
        (categoriesResult.data as Category[]) || []
      );

      setWishlist(
        ((wishlistResult.data || []) as {
          product_id: string;
        }[]).map((item) => item.product_id)
      );

      const cartRows =
        (cartResult.data || []) as {
          product_id: string;
          quantity: number;
        }[];

      setCartIds(
        cartRows.map((item) => item.product_id)
      );

      const quantityMap: Record<string, number> = {};

      cartRows.forEach((item) => {
        quantityMap[item.product_id] = Number(
          item.quantity || 1
        );
      });

      setCartQuantities(quantityMap);
    } catch (error) {
      console.error(
        "Budget Builder load error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedCategory = categories.find(
    (category) => category.id === categoryId
  );

  const availableSubcategories = useMemo(
    () => getSubcategories(selectedCategory),
    [selectedCategory]
  );

  /* STRICT MATCHING: category/subcategory first, budget second. */
  const matchingProducts = useMemo(() => {
    let list = products.filter(
      (product) =>
        product.stock > 0 &&
        Number(product.price) > 0 &&
        Number.isFinite(Number(product.price))
    );

    if (categoryId !== "all") {
      list = list.filter(
        (product) => product.category_id === categoryId
      );
    }

    if (subcategory !== "all") {
      list = list.filter((product) =>
        matchesSubcategory(product, subcategory)
      );
    }

    return list;
  }, [products, categoryId, subcategory]);

  const rankedProducts = useMemo(() => {
    return matchingProducts
      .filter((product) => Number(product.price) <= budget)
      .map((product) => ({
        ...product,
        score: getProductScore(product, budget, goal),
      }))
      .sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (scoreDiff !== 0) return scoreDiff;
        return (
          seededOrder(a.id, buildSeed + 101) -
          seededOrder(b.id, buildSeed + 101)
        );
      });
  }, [matchingProducts, budget, goal, buildSeed]);

  const affordableMatchingProducts = useMemo(
    () =>
      matchingProducts.filter(
        (product) => Number(product.price) <= budget
      ),
    [matchingProducts, budget]
  );

  const hasExactMatchingProducts = matchingProducts.length > 0;
  const hasAffordableMatchingProducts =
    affordableMatchingProducts.length > 0;


  const autoPlan = useMemo(() => {
    if (
      budget <= 0 ||
      affordableMatchingProducts.length === 0
    ) {
      return [];
    }

    const eligible = [...affordableMatchingProducts];
    const previousSet = new Set(previousPlanIds);
    const freshEligible = eligible.filter((p) => !previousSet.has(p.id));
    // On every rebuild, use fresh products whenever any eligible alternatives exist.
    // Fall back to the full eligible pool only when every eligible product was
    // already used in the previous plan.
    const pool = freshEligible.length > 0 ? freshEligible : eligible;

    const result: Product[] = [];
    let remaining = budget;

    const pushIfFits = (product: Product) => {
      const price = Number(product.price);
      if (!Number.isFinite(price) || price <= 0 || price > remaining) {
        return false;
      }
      if (result.some((item) => item.id === product.id)) return false;
      result.push(product);
      remaining -= price;
      return true;
    };

    const randomTie = (a: Product, b: Product, offset: number) =>
      seededRank(a.id, buildSeed + offset) -
      seededRank(b.id, buildSeed + offset);

    const qualityScore = (product: Product) => {
      const rating = Math.min(5, Math.max(0, Number(product.rating || 0)));
      const reviews = Math.max(0, Number(product.reviews_count || 0));
      const reviewConfidence = Math.min(1, Math.log10(reviews + 1) / 4);
      const featured = product.is_featured ? 1 : 0;
      // Quality is primarily rating + review confidence, not price.
      return rating * 70 + reviewConfidence * 22 + featured * 8;
    };

    const valueScore = (product: Product) => {
      const price = Number(product.price);
      const original = product.original_price
        ? Number(product.original_price)
        : price;
      const discount = discountPercent(price, original);
      const rating = Number(product.rating || 0);
      const reviews = Math.min(15, Math.log10(Number(product.reviews_count || 0) + 1) * 5);
      const priceEfficiency = budget > 0 ? Math.max(0, 1 - price / budget) : 0;
      // Value = real discount + quality + useful price efficiency.
      return discount * 1.8 + rating * 8 + reviews + priceEfficiency * 18;
    };

    /* PREMIUM: genuinely higher-priced products, but still quality-aware and budget-safe. */
    if (goal === "premium") {
      const prices = eligible.map((p) => Number(p.price));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const premiumFloor = minPrice + (maxPrice - minPrice) * 0.55;

      const premiumOnly = pool.filter(
        (p) => Number(p.price) >= premiumFloor
      );
      const candidates = (premiumOnly.length ? premiumOnly : pool).sort((a, b) => {
        const qa = qualityScore(a);
        const qb = qualityScore(b);
        const priceBandA = Number(a.price) / Math.max(1, budget);
        const priceBandB = Number(b.price) / Math.max(1, budget);
        return (
          (priceBandB - priceBandA) * 45 +
          (qb - qa) +
          randomTie(a, b, 41) * 8
        );
      });

      // Rotate through the strongest premium candidates instead of always taking #1.
      const topCount = Math.min(8, candidates.length);
      const top = candidates.slice(0, topCount);
      if (top.length) {
        const anchor = top[(buildSeed + top.length) % top.length];
        pushIfFits(anchor);
      }

      const companions = [...candidates].sort(
        (a, b) =>
          Math.abs(Number(a.price) - remaining * 0.65) -
          Math.abs(Number(b.price) - remaining * 0.65) ||
          randomTie(a, b, 47)
      );

      for (const product of companions) {
        if (result.length >= 3) break;
        pushIfFits(product);
      }
      return result;
    }

    /* MAXIMUM VALUE: use the former Quality First algorithm, with quality-driven picks and controlled rotation. */
    if (goal === "value") {
      const candidates = [...pool].sort((a, b) => {
        const diff = qualityScore(b) - qualityScore(a);
        return diff || randomTie(a, b, 61);
      });

      const bestScore = candidates.length ? qualityScore(candidates[0]) : 0;
      // Keep products within 10% of the best quality score so variation never destroys quality.
      const qualityPool = candidates.filter(
        (product) => qualityScore(product) >= bestScore * 0.90
      );

      // Rotate the starting point on every Build/Return Build.
      const rotation = qualityPool.length
        ? buildSeed % qualityPool.length
        : 0;
      const rotated = qualityPool.length
        ? qualityPool.slice(rotation).concat(qualityPool.slice(0, rotation))
        : candidates;

      // First pick is quality-driven; later picks balance quality with the remaining budget.
      for (const product of rotated) {
        if (result.length >= 5) break;
        pushIfFits(product);
      }

      // If rotation caused too little budget usage, fill from the strongest remaining quality products.
      if (result.length === 0 && candidates.length) {
        pushIfFits(candidates[buildSeed % candidates.length]);
      }
      return result;
    }

    /* QUALITY FIRST: use the former Maximum Value algorithm, selecting the highest-priced matching product within budget. */
    if (goal === "quality") {
      const candidates = [...pool].sort((a, b) => {
        const priceDiff = Number(b.price) - Number(a.price);
        if (priceDiff !== 0) return priceDiff;
        const qualityDiff = qualityScore(b) - qualityScore(a);
        return qualityDiff || randomTie(a, b, 51);
      });

      // One clear maximum-value pick: the most expensive eligible item under budget.
      for (const product of candidates) {
        if (pushIfFits(product)) break;
      }
      return result;
    }

    /* MORE PRODUCTS: maximise item count without crossing total budget. */
    const candidates = [...pool].sort(
      (a, b) =>
        Number(a.price) - Number(b.price) ||
        randomTie(a, b, 71)
    );

    for (const product of candidates) {
      if (result.length >= 8) break;
      pushIfFits(product);
    }
    return result;
  }, [affordableMatchingProducts, budget, goal, buildSeed, previousPlanIds]);

  const activePlanIds = manualPlanMode
    ? selectedProducts
    : autoPlan.map((product) => product.id);

  /*
   * Final safety layer. Even if a saved/manual plan contains old products,
   * the visible plan is rebuilt cumulatively and can NEVER cross the budget.
   */
  const planProducts = useMemo(() => {
    const safe: Product[] = [];
    let total = 0;

    for (const id of activePlanIds) {
      const product = products.find((item) => item.id === id);
      if (!product || product.stock <= 0) continue;

      const price = Number(product.price);
      if (!Number.isFinite(price) || price <= 0) continue;
      if (price > budget) continue;
      if (
        categoryId !== "all" &&
        product.category_id !== categoryId
      ) continue;
      if (
        subcategory !== "all" &&
        !matchesSubcategory(product, subcategory)
      ) continue;
      if (total + price > budget) continue;
      if (safe.some((item) => item.id === product.id)) continue;

      safe.push(product);
      total += price;
    }

    return safe;
  }, [activePlanIds, products, budget, categoryId, subcategory]);

  const plannedSpend = planProducts.reduce(
    (total, product) =>
      total + Number(product.price),
    0
  );

  const planWithinBudget =
    budget > 0 && plannedSpend > 0 && plannedSpend <= budget;

  const remainingBudget = Math.max(
    0,
    budget - plannedSpend
  );

  const plannedSavings = planProducts.reduce(
    (total, product) => {
      const original = product.original_price
        ? Number(product.original_price)
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

  const usage =
    budget > 0
      ? Math.min(
          100,
          Math.round(
            (plannedSpend / budget) * 100
          )
        )
      : 0;

  const planAverageScore =
    planProducts.length > 0
      ? Math.round(
          planProducts.reduce(
            (sum, product) =>
              sum +
              getProductScore(
                product,
                budget,
                goal
              ),
            0
          ) / planProducts.length
        )
      : 0;

  const budgetHealth =
    usage >= 85
      ? {
          label: "Excellent allocation",
          text:
            "Most of your budget is being used efficiently.",
        }
      : usage >= 55
      ? {
          label: "Healthy plan",
          text:
            "You still have room for a few useful additions.",
        }
      : {
          label: "Budget available",
          text:
            "There is significant room to improve this cart.",
        };

  const remainingSuggestions = useMemo(() => {
    if (remainingBudget <= 0) return [];

    return rankedProducts
      .filter(
        (product) =>
          !activePlanIds.includes(product.id) &&
          Number(product.price) <=
            remainingBudget
      )
      .slice(0, 4);
  }, [
    rankedProducts,
    remainingBudget,
    activePlanIds,
  ]);

  const compareProducts = compareIds
    .map((id) =>
      products.find(
        (product) => product.id === id
      )
    )
    .filter(Boolean) as Product[];

  const swapOptions = swapProductId
    ? (() => {
        const current = products.find(
          (product) =>
            product.id === swapProductId
        );

        if (!current) return [];

        return rankedProducts
          .filter(
            (product) =>
              product.id !== current.id &&
              product.category_id ===
                current.category_id
          )
          .slice(0, 6);
      })()
    : [];

  const categoryName =
    selectedCategory?.name ||
    "All Categories";

  function showNotice(message: string) {
    setNotice(message);

    window.setTimeout(() => {
      setNotice("");
    }, 2400);
  }

  function changeBudget(value: number) {
    const safe = Math.max(
      500,
      Math.min(
        100000,
        Math.round(value)
      )
    );

    setBudget(safe);
    setCustomBudget(String(safe));
    setPlanReady(false);
  }

  function handleBudgetInput(value: string) {
    const cleaned = value.replace(
      /[^0-9]/g,
      ""
    );

    setCustomBudget(cleaned);

    if (!cleaned) return;

    const numeric = Number(cleaned);

    if (
      numeric >= 500 &&
      numeric <= 100000
    ) {
      setBudget(numeric);
      setPlanReady(false);
    }
  }

  async function buildBudgetPlan() {
    if (budget < 500) {
      showNotice("Please select a budget first.");
      return;
    }

    if (!goal) {
      showNotice("Please choose what matters most to you.");
      return;
    }

    if (!hasExactMatchingProducts) {
      setPlanReady(false);
      setSelectedProducts([]);
      setManualPlanMode(false);
      showNotice(
        "No matching product found for your selected category and subcategory."
      );
      return;
    }

    if (!hasAffordableMatchingProducts) {
      setPlanReady(false);
      setSelectedProducts([]);
      setManualPlanMode(false);
      showNotice(
        `No matching product found within ${formatPrice(
          budget
        )} for your selected category and subcategory.`
      );
      return;
    }

    setBuilding(true);
    setPlanReady(false);
    setManualPlanMode(false);
    // Exclude only products the user has actually seen in a completed plan.
    // On the first build, do not exclude the hidden precomputed autoPlan.
    setPreviousPlanIds(
      planReady ? planProducts.map((product) => product.id) : []
    );
    setSelectedProducts([]);
    setBuildSeed((current) => current + 1);

    await new Promise((resolve) => setTimeout(resolve, 650));

    setPlanReady(true);
    setBuilding(false);

    setTimeout(() => {
      document
        .getElementById("smart-plan")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 150);
  }


  function resetBuilder() {
    setBudget(0);
    setCustomBudget("");
    setGoal("");
    setCategoryId("all");
    setSubcategory("all");
    setSelectedProducts([]);
    setManualPlanMode(false);
    setPlanReady(false);
    setBuildSeed(0);
    setPreviousPlanIds([]);
  }

  function togglePlanProduct(productId: string) {
    setManualPlanMode(true);

    setSelectedProducts((current) => {
      const base = manualPlanMode
        ? current
        : autoPlan.map(
            (product) => product.id
          );

      if (base.includes(productId)) {
        return base.filter(
          (id) => id !== productId
        );
      }

      const product = products.find(
        (item) => item.id === productId
      );

      if (!product) return base;

      if (
        categoryId !== "all" &&
        product.category_id !== categoryId
      ) {
        showNotice("This product is outside your selected category.");
        return base;
      }

      if (
        subcategory !== "all" &&
        !matchesSubcategory(product, subcategory)
      ) {
        showNotice("This product is outside your selected subcategory.");
        return base;
      }

      const currentSpend = base.reduce(
        (sum, id) => {
          const item = products.find(
            (productItem) =>
              productItem.id === id
          );

          return (
            sum +
            Number(item?.price || 0)
          );
        },
        0
      );

      if (
        currentSpend +
          Number(product.price) >
        budget
      ) {
        showNotice(
          "This product would exceed your budget."
        );

        return base;
      }

      return [...base, productId];
    });

    setPlanReady(true);
  }


  function optimizePlan() {
    setPreviousPlanIds(planProducts.map((product) => product.id));
    setSelectedProducts([]);
    setManualPlanMode(false);
    setPlanReady(false);
    setBuildSeed((current) => current + 1);
    window.setTimeout(() => setPlanReady(true), 100);
    showNotice(
      "Your plan has been re-optimized with fresh product choices."
    );
  }

  function toggleCompare(productId: string) {
    setCompareIds((current) => {
      if (current.includes(productId)) {
        return current.filter(
          (id) => id !== productId
        );
      }

      if (current.length >= 3) {
        showNotice(
          "You can compare up to 3 products."
        );

        return current;
      }

      return [...current, productId];
    });
  }

  function swapProduct(
    currentId: string,
    replacementId: string
  ) {
    const replacement = products.find(
      (product) =>
        product.id === replacementId
    );

    if (!replacement) return;

    const currentSpendWithout =
      planProducts
        .filter(
          (product) =>
            product.id !== currentId
        )
        .reduce(
          (sum, product) =>
            sum +
            Number(product.price),
          0
        );

    if (
      currentSpendWithout +
        Number(replacement.price) >
      budget
    ) {
      showNotice(
        "This replacement would exceed your budget."
      );

      return;
    }

    setManualPlanMode(true);

    setSelectedProducts((current) => {
      const base =
        current.length > 0
          ? current
          : planProducts.map(
              (product) => product.id
            );

      return base.map((id) =>
        id === currentId
          ? replacementId
          : id
      );
    });

    setSwapProductId(null);
    setPlanReady(true);

    showNotice(
      "Product swapped successfully."
    );
  }

  function saveCurrentPlan() {
    try {
      localStorage.setItem(
        "primecart-budget-plan",
        JSON.stringify({
          budget,
          goal,
          categoryId,
          subcategory,
          productIds: activePlanIds,
          savedAt:
            new Date().toISOString(),
        })
      );

      setSavedPlan(true);

      showNotice(
        "Budget plan saved on this device."
      );
    } catch (error) {
      console.error(
        "Save budget plan:",
        error
      );
    }
  }

  function loadSavedPlan() {
    try {
      const raw =
        localStorage.getItem(
          "primecart-budget-plan"
        );

      if (!raw) {
        showNotice(
          "No saved budget plan found."
        );

        return;
      }

      const saved = JSON.parse(raw);

      if (
        typeof saved.budget ===
        "number"
      ) {
        setBudget(saved.budget);
        setCustomBudget(
          String(saved.budget)
        );
      }

      if (
        typeof saved.goal ===
        "string"
      ) {
        setGoal(saved.goal);
      }

      if (
        typeof saved.categoryId ===
        "string"
      ) {
        setCategoryId(
          saved.categoryId
        );
      }

      if (
        typeof saved.subcategory ===
        "string"
      ) {
        setSubcategory(
          saved.subcategory
        );
      }

      const savedIds: string[] =
        Array.isArray(saved.productIds)
          ? saved.productIds.filter((id: unknown): id is string => typeof id === "string")
          : [];

      const savedBudget =
        typeof saved.budget === "number"
          ? saved.budget
          : budget;

      let savedTotal = 0;
      const validIds: string[] = [];

      for (const id of savedIds) {
        const product = products.find((item) => item.id === id);
        if (!product || product.stock <= 0) continue;

        const price = Number(product.price);
        if (!Number.isFinite(price) || price <= 0) continue;
        if (price > savedBudget || savedTotal + price > savedBudget) continue;

        validIds.push(id);
        savedTotal += price;
      }

      setSelectedProducts(validIds);

      setManualPlanMode(
        validIds.length > 0
      );

      setPlanReady(
        validIds.length > 0
      );

      setSavedPlan(true);

      setTimeout(() => {
        document
          .getElementById(
            "smart-plan"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 150);
    } catch (error) {
      console.error(
        "Load budget plan:",
        error
      );
    }
  }

  async function sharePlan() {
    const shareText =
      `My PrimeCart Budget Plan: ${formatPrice(
        plannedSpend
      )} cart from a ${formatPrice(
        budget
      )} budget. ${
        planProducts.length
      } products selected.`;

    try {
      if (navigator.share) {
        await navigator.share({
          title:
            "My PrimeCart Budget Plan",
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(
          shareText
        );

        showNotice(
          "Plan summary copied to clipboard."
        );
      }
    } catch {
      // User cancelled share.
    }
  }

  function getMatchReasons(
    product: Product
  ) {
    const reasons: string[] = [];

    const price = Number(
      product.price
    );

    const rating = Number(
      product.rating || 0
    );

    const discount =
      discountPercent(
        price,
        product.original_price
          ? Number(
              product.original_price
            )
          : null
      );

    if (price <= budget)
      reasons.push(
        "Fits your budget"
      );

    if (rating >= 4.5)
      reasons.push(
        "Highly rated"
      );

    if (discount >= 10)
      reasons.push(
        `${discount}% discount`
      );

    if (product.is_flash_sale)
      reasons.push(
        "Flash deal"
      );

    if (product.is_featured)
      reasons.push(
        "Featured pick"
      );

    if (
      Number(
        product.reviews_count || 0
      ) >= 100
    ) {
      reasons.push(
        "Strong review volume"
      );
    }

    return reasons.slice(0, 4);
  }

  /*
   * ============================================================
   * WISHLIST - SUPABASE DATABASE
   * TABLE: wishlist_items
   * ============================================================
   */
  async function toggleWishlist(
    productId: string
  ) {
    if (wishlistLoading === productId)
      return;

    setWishlistLoading(productId);

    try {
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
            .from("wishlist_items")
            .delete()
            .eq("user_id", user.id)
            .eq(
              "product_id",
              productId
            );

        if (error) {
          console.error(
            "Wishlist delete:",
            error
          );

          showNotice(
            "Could not remove from wishlist."
          );

          return;
        }

        setWishlist((current) =>
          current.filter(
            (id) =>
              id !== productId
          )
        );

        showNotice(
          "Removed from wishlist."
        );
      } else {
        const { error } =
          await supabase
            .from("wishlist_items")
            .upsert(
              {
                user_id: user.id,
                product_id: productId,
              },
              {
                onConflict:
                  "user_id,product_id",
              }
            );

        if (error) {
          console.error(
            "Wishlist insert:",
            error
          );

          showNotice(
            "Could not add to wishlist."
          );

          return;
        }

        setWishlist((current) =>
          current.includes(productId)
            ? current
            : [
                ...current,
                productId,
              ]
        );

        showNotice(
          "Added to wishlist."
        );
      }
    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );

      showNotice(
        "Wishlist update failed."
      );
    } finally {
      setWishlistLoading(null);
    }
  }

  /*
   * ============================================================
   * ADD TO CART - SUPABASE DATABASE
   * TABLE: cart_items
   *
   * Existing product:
   * quantity = quantity + 1
   *
   * New product:
   * insert user_id + product_id + quantity
   * ============================================================
   */
  async function addToCart(
    product: Product
  ) {
    if (cartLoading === product.id)
      return;

    if (product.stock <= 0) {
      showNotice(
        "This product is currently out of stock."
      );

      return;
    }

    setCartLoading(product.id);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href =
          "/auth/login";
        return;
      }

      /*
       * Check whether product already
       * exists in user's cart.
       */
      const { data: existingItem, error: findError } =
        await supabase
          .from("cart_items")
          .select(
            "id, product_id, quantity"
          )
          .eq("user_id", user.id)
          .eq(
            "product_id",
            product.id
          )
          .maybeSingle();

      if (findError) {
        console.error(
          "Cart find error:",
          findError
        );

        showNotice(
          "Could not check your cart."
        );

        return;
      }

      if (existingItem) {
        const currentQuantity =
          Number(
            existingItem.quantity || 0
          );

        if (
          currentQuantity >=
          product.stock
        ) {
          showNotice(
            `Only ${product.stock} item(s) available in stock.`
          );

          return;
        }

        const newQuantity =
          currentQuantity + 1;

        const { error: updateError } =
          await supabase
            .from("cart_items")
            .update({
              quantity:
                newQuantity,
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              existingItem.id
            )
            .eq(
              "user_id",
              user.id
            );

        if (updateError) {
          console.error(
            "Cart update error:",
            updateError
          );

          showNotice(
            "Could not update cart."
          );

          return;
        }

        setCartIds((current) =>
          current.includes(product.id)
            ? current
            : [
                ...current,
                product.id,
              ]
        );

        setCartQuantities(
          (current) => ({
            ...current,
            [product.id]:
              newQuantity,
          })
        );

        showNotice(
          `Added ${product.name} to cart. Quantity: ${newQuantity}`
        );
      } else {
        const { error: insertError } =
          await supabase
            .from("cart_items")
            .insert({
              user_id: user.id,
              product_id:
                product.id,
              quantity: 1,
            });

        if (insertError) {
          console.error(
            "Cart insert error:",
            insertError
          );

          showNotice(
            "Could not add product to cart."
          );

          return;
        }

        setCartIds((current) =>
          current.includes(product.id)
            ? current
            : [
                ...current,
                product.id,
              ]
        );

        setCartQuantities(
          (current) => ({
            ...current,
            [product.id]: 1,
          })
        );

        showNotice(
          `${product.name} added to cart.`
        );
      }

      /*
       * Keep existing cart page/header
       * listeners synchronized.
       */
      window.dispatchEvent(
        new Event("cart-updated")
      );
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      showNotice(
        "Something went wrong while adding to cart."
      );
    } finally {
      setCartLoading(null);
    }
  }

  /*
   * ============================================================
   * ADD ENTIRE SMART PLAN TO DATABASE CART
   * ============================================================
   */
  async function addEntirePlanToCart() {
    if (planProducts.length === 0 || !planWithinBudget) {
      showNotice("There is no valid budget-safe plan to add.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href =
        "/auth/login";
      return;
    }

    setCartLoading("complete-plan");

    try {
      for (const product of planProducts) {
        if (product.stock <= 0)
          continue;

        const { data: existingItem, error } =
          await supabase
            .from("cart_items")
            .select(
              "id, quantity"
            )
            .eq(
              "user_id",
              user.id
            )
            .eq(
              "product_id",
              product.id
            )
            .maybeSingle();

        if (error) {
          console.error(
            "Plan cart lookup:",
            error
          );
          continue;
        }

        if (existingItem) {
          const currentQuantity =
            Number(
              existingItem.quantity ||
                0
            );

          /* Budget Builder adds one unit per recommended product. */
          const newQuantity = Math.min(
            Math.max(1, currentQuantity),
            product.stock
          );

          if (
            newQuantity !==
            currentQuantity
          ) {
            await supabase
              .from("cart_items")
              .update({
                quantity:
                  newQuantity,
                updated_at:
                  new Date().toISOString(),
              })
              .eq(
                "id",
                existingItem.id
              )
              .eq(
                "user_id",
                user.id
              );
          }

          setCartQuantities(
            (current) => ({
              ...current,
              [product.id]:
                newQuantity,
            })
          );
        } else {
          const { error: insertError } =
            await supabase
              .from("cart_items")
              .insert({
                user_id: user.id,
                product_id:
                  product.id,
                quantity: 1,
              });

          if (insertError) {
            console.error(
              "Plan cart insert:",
              insertError
            );
            continue;
          }

          setCartQuantities(
            (current) => ({
              ...current,
              [product.id]: 1,
            })
          );
        }

        setCartIds((current) =>
          current.includes(product.id)
            ? current
            : [
                ...current,
                product.id,
              ]
        );
      }

      window.dispatchEvent(
        new Event("cart-updated")
      );

      showNotice(
        "Complete smart plan added to your cart."
      );
    } catch (error) {
      console.error(
        "Complete plan cart error:",
        error
      );

      showNotice(
        "Some products could not be added to cart."
      );
    } finally {
      setCartLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#181818]">
      {/* ======================================================
          HEADER
      ====================================================== */}
      <header className="sticky top-0 z-50 border-b border-[#e9dfcd] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div
              className="flex min-w-0 items-center gap-2.5"
            >
              <img
                src="/logo.png"
                alt="PrimeCart"
                className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
              />
              <div className="min-w-0">
                <p className="truncate text-base font-black tracking-tight text-[#181818] sm:text-lg">
                  PrimeCart
                </p>
                <p className="hidden text-[9px] font-bold uppercase tracking-[0.16em] text-[#a17b2f] sm:block">
                  Budget Builder
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <Link
              href="/dashboard/wishlist"
              aria-label="Wishlist"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e7dece] text-gray-600 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] sm:h-10 sm:w-10"
            >
              <Heart size={16} />
            </Link>

            <Link
              href="/dashboard/cart"
              aria-label="Cart"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e7dece] text-gray-600 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] sm:h-10 sm:w-10"
            >
              <ShoppingCart size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* NOTICE */}
      {notice && (
        <div className="fixed bottom-5 left-1/2 z-[100] flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-2 rounded-full border border-[#dfc98e] bg-white px-5 py-3 text-center text-xs font-black text-[#956f27] shadow-2xl">
          <Check size={14} />
          {notice}
        </div>
      )}

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* ======================================================
            HERO
        ====================================================== */}
        <section className="relative overflow-hidden rounded-[32px] border border-[#e9ddc6] bg-white shadow-sm">
          <div className="absolute -right-32 -top-44 h-[550px] w-[550px] rounded-full bg-[#f4dfaa]/30 blur-3xl" />

          <div className="absolute -bottom-48 left-1/3 h-[500px] w-[500px] rounded-full bg-[#fff7e5] blur-3xl" />

          <div className="relative grid min-h-[235px] grid-cols-[1.12fr_0.88fr] items-center gap-3 px-3 py-4 sm:min-h-[320px] sm:gap-7 sm:px-8 sm:py-8 lg:min-h-[400px] lg:gap-10 lg:px-16 lg:py-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#eadfc9] bg-[#fffaf0] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#a17b2f]">
                <Sparkles size={13} />
                PrimeCart Smart Shopping
              </div>

              <h2 className="mt-3 max-w-3xl text-[24px] font-black leading-[1.03] tracking-[-0.04em] sm:mt-5 sm:text-4xl lg:text-[64px]">
                Build your perfect cart
                <span className="block text-[#b58a32]">
                  without breaking your budget.
                </span>
              </h2>

              <p className="mt-3 max-w-2xl text-[9px] leading-4 text-gray-500 sm:mt-4 sm:text-sm sm:leading-6 lg:text-base lg:leading-7">
                Tell PrimeCart how much you want to spend.
                We&apos;ll help you discover products, balance
                your cart and make every rupee count.
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2.5">
                {[
                  "Live budget tracking",
                  "Smart recommendations",
                  "Real PrimeCart products",
                ].map((text) => (
                  <span
                    key={text}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#ebe3d5] bg-[#fffdf9] px-2 py-1.5 text-[8px] font-bold text-gray-600 sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2 sm:text-[10px]"
                  >
                    <Check
                      size={13}
                      className="text-[#b58a32]"
                    />
                    {text}
                  </span>
                ))}
              </div>
            </div>

            <div className="mx-auto w-full max-w-[440px]">
              <div className="relative rounded-[20px] border border-[#eadfca] bg-[#fffaf0] p-3 shadow-[0_12px_35px_rgba(120,90,30,0.08)] sm:rounded-[28px] sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                      Current Budget
                    </p>

                    <p className="mt-1 text-lg font-black sm:text-3xl">
                      {budget > 0 ? formatPrice(budget) : "Select budget"}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c9a24d] text-white">
                    <CircleDollarSign size={21} />
                  </div>
                </div>

                <div className="relative mx-auto mt-3 flex h-24 w-24 items-center justify-center sm:mt-6 sm:h-36 sm:w-36 lg:h-44 lg:w-44">
                  <svg
                    className="h-full w-full -rotate-90"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="#eadfca"
                      strokeWidth="9"
                    />

                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="#c9a24d"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray="301.6"
                      strokeDashoffset={
                        301.6 -
                        (301.6 * usage) /
                          100
                      }
                    />
                  </svg>

                  <div className="absolute text-center">
                    <p className="text-xl font-black sm:text-3xl">
                      {usage}%
                    </p>

                    <p className="text-[7px] font-bold uppercase tracking-wider text-gray-400 sm:text-[9px]">
                      Allocated
                    </p>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-3 sm:gap-3">
                  <div className="rounded-2xl bg-white p-3">
                    <p className="text-[7px] font-bold uppercase tracking-wider text-gray-400 sm:text-[9px]">
                      Planned
                    </p>

                    <p className="mt-1 text-[10px] font-black sm:text-sm">
                      {formatPrice(plannedSpend)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-3">
                    <p className="text-[7px] font-bold uppercase tracking-wider text-gray-400 sm:text-[9px]">
                      Available
                    </p>

                    <p className="mt-1 text-[10px] font-black text-emerald-600 sm:text-sm">
                      {formatPrice(remainingBudget)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            BUDGET STUDIO
        ====================================================== */}
        <section className="mt-6 rounded-[28px] border border-[#e9dfcd] bg-white shadow-sm">
          <div className="border-b border-[#eee7da] px-5 py-5 sm:px-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5dc] text-[#b58a32]">
                  <Target size={20} />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                    Budget Studio
                  </p>

                  <h3 className="text-lg font-black">
                    Design your shopping plan
                  </h3>
                </div>
              </div>

              <div className="rounded-full bg-[#f7f2e8] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-gray-500">
                Step 1 · Preferences
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {/* BUDGET */}
            <div>
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Your spending limit
                  </p>

                  <h4 className="mt-1 text-xl font-black">
                    How much do you want to spend?
                  </h4>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#a17b2f]">
                    ₹
                  </span>

                  <input
                    value={customBudget}
                    inputMode="numeric"
                    onChange={(e) =>
                      handleBudgetInput(
                        e.target.value
                      )
                    }
                    className="h-12 w-40 rounded-xl border border-[#dfd5c3] bg-[#fffdf9] pl-8 pr-3 text-right text-base font-black outline-none transition focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
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
                            ? "border-[#c9a24d] bg-[#fff7e3] text-[#956f27] shadow-sm"
                            : "border-[#e8e0d2] text-gray-600 hover:border-[#d3b76f] hover:bg-[#fffdf9]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  }
                )}
              </div>

              <div className="mt-5">
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="500"
                  value={Math.max(500, Math.min(budget || 500, 100000))}
                  disabled={budget < 500}
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
                  <span>₹500</span>
                  <span>₹1,00,000</span>
                </div>
              </div>
            </div>

            {/* GOAL */}
            <div className="mt-10">
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                  Shopping style
                </p>

                <h4 className="mt-1 text-xl font-black">
                  What matters most to you?
                </h4>
              </div>

              <div className="-mx-1 grid grid-cols-1 gap-3 px-1 sm:grid-cols-2 lg:grid-cols-4">
                {shoppingGoals.map((item) => {
                  const Icon = item.icon;
                  const active = goal === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setGoal(item.id);
                        setPlanReady(false);
                      }}
                      className={`group relative overflow-hidden rounded-[22px] border p-4 text-left transition duration-200 sm:p-5 ${
                        active
                          ? "border-[#c9a24d] bg-[#fffaf0] shadow-[0_10px_30px_rgba(160,120,40,0.10)]"
                          : "border-[#e9e2d5] bg-white hover:-translate-y-0.5 hover:border-[#d5b76c] hover:shadow-md"
                      }`}
                    >
                      <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[#f8edcf]/60 blur-2xl" />

                      <div className="relative flex items-start justify-between gap-3">
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition ${
                            active
                              ? "bg-[#c9a24d] text-white shadow-md"
                              : "bg-[#fff6df] text-[#a17b2f] group-hover:bg-[#f8edcf]"
                          }`}
                        >
                          <Icon size={19} />
                        </span>

                        {active ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#c9a24d] text-white shadow-sm">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        ) : (
                          <span className="rounded-full border border-[#eadfca] px-2 py-1 text-[8px] font-black uppercase tracking-wider text-gray-400">
                            Select
                          </span>
                        )}
                      </div>

                      <p className="relative mt-5 text-[14px] font-black text-gray-900">
                        {item.title}
                      </p>
                      <p className="relative mt-1.5 min-h-[32px] text-[10px] leading-4 text-gray-400">
                        {item.description}
                      </p>

                      <div className={`relative mt-4 inline-flex items-center gap-1.5 text-[9px] font-black ${
                        active ? "text-[#956f27]" : "text-gray-400"
                      }`}>
                        {active ? "Selected for your plan" : "Use this preference"}
                        <ArrowRight size={11} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CATEGORY + SUBCATEGORY */}
            <div className="mt-10">
              <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Shopping focus
                  </p>
                  <h4 className="mt-1 text-xl font-black">
                    Where do you want to spend it?
                  </h4>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-400">
                    Pick a category first. We&apos;ll then show relevant subcategories
                    and build your plan around that focus.
                  </p>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#eadfca] bg-[#fffaf0] px-3 py-1.5 text-[9px] font-black text-[#a17b2f]">
                  <Sparkles size={11} />
                  Smart filtering
                </span>
              </div>

              <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
                <div className="relative">
                  <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setSubcategory("all");
                      setPlanReady(false);
                    }}
                    className="h-[54px] w-full appearance-none rounded-2xl border border-[#e4dbca] bg-[#fffdf9] px-4 pr-11 text-sm font-bold text-gray-700 outline-none transition focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10"
                  >
                    <option value="all">Everything on PrimeCart</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute bottom-4 right-4 text-gray-400"
                  />
                </div>

                <div className="relative">
                  <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">
                    Subcategory
                  </label>
                  <select
                    value={subcategory}
                    disabled={categoryId === "all" || availableSubcategories.length === 0}
                    onChange={(e) => {
                      setSubcategory(e.target.value);
                      setPlanReady(false);
                    }}
                    className="h-[54px] w-full appearance-none rounded-2xl border border-[#e4dbca] bg-[#fffdf9] px-4 pr-11 text-sm font-bold text-gray-700 outline-none transition focus:border-[#c9a24d] focus:ring-4 focus:ring-[#c9a24d]/10 disabled:cursor-not-allowed disabled:bg-[#f7f3eb] disabled:text-gray-400"
                  >
                    <option value="all">
                      {categoryId === "all"
                        ? "Select a category first"
                        : availableSubcategories.length
                        ? "All subcategories"
                        : "No subcategories available"}
                    </option>
                    {availableSubcategories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute bottom-4 right-4 text-gray-400"
                  />
                </div>
              </div>

              {categoryId !== "all" && availableSubcategories.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setSubcategory("all");
                      setPlanReady(false);
                    }}
                    className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-black transition ${
                      subcategory === "all"
                        ? "border-[#c9a24d] bg-[#fff7e3] text-[#956f27]"
                        : "border-[#e8e0d2] bg-white text-gray-500 hover:border-[#d5b76c]"
                    }`}
                  >
                    All
                  </button>
                  {availableSubcategories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSubcategory(item);
                        setPlanReady(false);
                      }}
                      className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-black transition ${
                        subcategory === item
                          ? "border-[#c9a24d] bg-[#c9a24d] text-white shadow-sm"
                          : "border-[#e8e0d2] bg-white text-gray-500 hover:border-[#d5b76c] hover:bg-[#fffaf0]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SUMMARY */}
            <div className="mt-10 grid overflow-hidden rounded-2xl border border-[#eadfca] bg-[#fffaf0] sm:grid-cols-2 lg:grid-cols-5">
              <div className="border-b border-[#eadfca] p-4 sm:border-b-0 sm:border-r">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Budget
                </p>

                <p className="mt-1 text-lg font-black">
                  {formatPrice(
                    budget
                  )}
                </p>
              </div>

              <div className="border-b border-[#eadfca] p-4 sm:border-b-0 sm:border-r">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Focus
                </p>

                <p className="mt-1 truncate text-sm font-black">
                  {categoryName}
                </p>
              </div>

              <div className="border-b border-[#eadfca] p-4 sm:border-b-0 sm:border-r">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Subcategory
                </p>
                <p className="mt-1 truncate text-sm font-black">
                  {subcategory === "all" ? "All" : subcategory}
                </p>
              </div>

              <div className="border-b border-[#eadfca] p-4 sm:border-b-0 sm:border-r">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Goal
                </p>

                <p className="mt-1 text-sm font-black">
                  {
                    shoppingGoals.find(
                      (item) =>
                        item.id ===
                        goal
                    )?.title
                  }
                </p>
              </div>

              <div className="p-4">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Products in Plan
                </p>

                <p className="mt-1 text-sm font-black">
                  {planReady
                    ? planProducts.length
                    : 0}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#eee7da] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={
                    resetBuilder
                  }
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e4dccd] px-5 text-xs font-black text-gray-600 transition hover:bg-[#fffaf0]"
                >
                  <RefreshCw size={15} />
                  Start Over
                </button>

                <button
                  type="button"
                  onClick={
                    loadSavedPlan
                  }
                  disabled={!savedPlan}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e4dccd] bg-white px-5 text-xs font-black text-[#956f27] transition hover:bg-[#fffaf0] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Bookmark size={15} />
                  Load Saved Plan
                </button>
              </div>

              <button
                type="button"
                disabled={
                  loading ||
                  building ||
                  budget < 500 ||
                  !goal
                }
                onClick={
                  buildBudgetPlan
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-7 text-xs font-black text-white shadow-lg shadow-[#c9a24d]/15 transition hover:bg-[#b48a3d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {building ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Analysing Products...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Build My Smart Plan
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>


        {/* ======================================================
            SMART PLAN
        ====================================================== */}
        {planReady && (
          <section
            id="smart-plan"
            className="mt-7 scroll-mt-24"
          >
            <div className="overflow-hidden rounded-[28px] border border-[#dfc98e] bg-white shadow-sm">
              <div className="bg-[#fff8e8] px-5 py-6 sm:px-8">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#a17b2f]">
                      <Sparkles size={12} />
                      Smart Plan Ready
                    </div>

                    <h3 className="mt-3 text-2xl font-black sm:text-3xl">
                      Your{" "}
                      {formatPrice(
                        budget
                      )}{" "}
                      cart
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Optimized for{" "}
                      <span className="font-bold text-gray-700">
                        {categoryName}
                      </span>{" "}
                      with{" "}
                      <span className="font-bold text-gray-700">
                        {
                          shoppingGoals.find(
                            (item) =>
                              item.id ===
                              goal
                          )?.title
                        }
                      </span>
                      .
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={
                        optimizePlan
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#dfcfaa] bg-white px-4 text-[10px] font-black text-[#956f27] transition hover:bg-[#fffaf0]"
                    >
                      <Wand2 size={14} />
                      Optimize
                    </button>

                    <button
                      type="button"
                      onClick={
                        saveCurrentPlan
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#dfcfaa] bg-white px-4 text-[10px] font-black text-[#956f27] transition hover:bg-[#fffaf0]"
                    >
                      {savedPlan ? (
                        <BookmarkCheck
                          size={14}
                        />
                      ) : (
                        <Bookmark
                          size={14}
                        />
                      )}

                      {savedPlan
                        ? "Saved"
                        : "Save Plan"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        sharePlan
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#dfcfaa] bg-white px-4 text-[10px] font-black text-[#956f27] transition hover:bg-[#fffaf0]"
                    >
                      <Copy size={14} />
                      Share
                    </button>

                    <button
                      type="button"
                      onClick={
                        addEntirePlanToCart
                      }
                      disabled={
                        cartLoading ===
                          "complete-plan" ||
                        !planWithinBudget
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-5 text-[10px] font-black text-white shadow-sm transition hover:bg-[#b48a3d] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {cartLoading ===
                      "complete-plan" ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart
                            size={15}
                          />
                          Add Complete Plan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* METRICS */}
              <div className="grid grid-cols-2 border-t border-[#eadfca] sm:grid-cols-4">
                <div className="border-b border-[#eadfca] p-5 sm:border-b-0 sm:border-r">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Total Budget
                  </p>

                  <p className="mt-2 text-xl font-black">
                    {formatPrice(
                      budget
                    )}
                  </p>
                </div>

                <div className="border-b border-[#eadfca] p-5 sm:border-b-0 sm:border-r">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Cart Value
                  </p>

                  <p className="mt-2 text-xl font-black">
                    {formatPrice(
                      plannedSpend
                    )}
                  </p>
                </div>

                <div className="border-r border-[#eadfca] p-5">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Remaining
                  </p>

                  <p className="mt-2 text-xl font-black text-emerald-600">
                    {formatPrice(
                      remainingBudget
                    )}
                  </p>
                </div>

                <div className="p-5">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Estimated Savings
                  </p>

                  <p className="mt-2 text-xl font-black text-[#a17b2f]">
                    {formatPrice(
                      plannedSavings
                    )}
                  </p>
                </div>
              </div>

              {/* ALLOCATION */}
              <div className="border-t border-[#eadfca] p-5 sm:p-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b58a32]">
                      Budget Allocation
                    </p>

                    <h4 className="mt-1 text-lg font-black">
                      You&apos;re using{" "}
                      {usage}% of your
                      budget
                    </h4>
                  </div>

                  <span className="text-sm font-black text-[#956f27]">
                    {formatPrice(
                      remainingBudget
                    )}{" "}
                    left
                  </span>
                </div>

                <div className="mt-4 h-4 overflow-hidden rounded-full bg-[#eee5d5]">
                  <div
                    className="h-full rounded-full bg-[#c9a24d] transition-all duration-700"
                    style={{
                      width: `${Math.max(
                        usage,
                        2
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-[9px] font-bold text-gray-400">
                  <span>₹0</span>
                  <span>
                    {formatPrice(
                      budget
                    )}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 border-t border-[#eadfca] p-5 sm:grid-cols-[1.2fr_0.8fr] sm:p-8">
                <div className="rounded-2xl border border-[#e9dfcd] bg-[#fffaf0] p-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb
                      size={15}
                      className="text-[#b58a32]"
                    />

                    <span className="text-[10px] font-black uppercase tracking-wider text-[#956f27]">
                      Budget Health
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-black">
                    {
                      budgetHealth.label
                    }
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {
                      budgetHealth.text
                    }
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e9dfcd] bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Smart Match
                    </span>

                    <span className="text-lg font-black text-[#a17b2f]">
                      {
                        planAverageScore
                      }
                      %
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eee5d5]">
                    <div
                      className="h-full rounded-full bg-[#c9a24d] transition-all duration-700"
                      style={{
                        width: `${planAverageScore}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-[10px] text-gray-400">
                    Based on price fit,
                    ratings, reviews and
                    your goal.
                  </p>
                </div>
              </div>
            </div>

            {/* PLAN PRODUCTS */}
            <div className="mt-7">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                    Curated for you
                  </p>

                  <h3 className="mt-1 text-2xl font-black">
                    Your Smart Cart
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    A balanced selection
                    based on your budget
                    and shopping goal.
                  </p>
                </div>

                <span className="hidden rounded-full bg-[#fff3d5] px-3 py-1.5 text-[9px] font-black text-[#956f27] sm:block">
                  {
                    planProducts.length
                  }{" "}
                  PICKS
                </span>
              </div>

              {planProducts.length ===
              0 ? (
                <div className="rounded-[24px] border border-[#eadfca] bg-white p-14 text-center">
                  <CircleDollarSign
                    size={38}
                    className="mx-auto text-[#c9a24d]"
                  />

                  <h4 className="mt-4 text-lg font-black">
                    No suitable plan
                    found
                  </h4>

                  <p className="mt-2 text-sm text-gray-500">
                    Try increasing
                    your budget or
                    changing your
                    shopping focus.
                  </p>
                </div>
              ) : (
                <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:overflow-visible md:pb-0">
                  {planProducts.map(
                    (
                      product,
                      index
                    ) => {
                      const image =
                        getImageUrl(
                          product.image_url
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

                      const added =
                        cartIds.includes(
                          product.id
                        );

                      const isCartLoading =
                        cartLoading ===
                        product.id;

                      return (
                        <div
                          key={
                            product.id
                          }
                          className="group flex min-w-[84vw] snap-start flex-col gap-4 rounded-[22px] border border-[#e8dfcf] bg-white p-4 transition hover:border-[#d5bb7c] hover:shadow-md sm:min-w-[420px] sm:flex-row sm:items-center md:min-w-0"
                        >
                          <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-[#faf9f6] sm:h-28 sm:w-28">
                            {image ? (
                              <ProductImage
                                src={
                                  image
                                }
                                alt={
                                  product.name
                                }
                                className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-gray-300">
                                <ShoppingBag
                                  size={
                                    30
                                  }
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

                            <h4 className="mt-1 line-clamp-2 text-base font-black">
                              {product.name}
                            </h4>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
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

                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSwapProductId(
                                    product.id
                                  )
                                }
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e6dcc8] px-2.5 text-[9px] font-black text-gray-600 hover:border-[#c9a24d] hover:text-[#956f27]"
                              >
                                <RotateCcw
                                  size={
                                    11
                                  }
                                />
                                Change Product
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  toggleCompare(
                                    product.id
                                  )
                                }
                                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[9px] font-black ${
                                  compareIds.includes(
                                    product.id
                                  )
                                    ? "bg-[#c9a24d] text-white"
                                    : "border border-[#e6dcc8] text-gray-600 hover:border-[#c9a24d] hover:text-[#956f27]"
                                }`}
                              >
                                <GitCompare
                                  size={
                                    11
                                  }
                                />

                                {compareIds.includes(
                                  product.id
                                )
                                  ? "Compared"
                                  : "Compare"}
                              </button>
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
                                    %
                                    OFF
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="mt-0 flex items-center gap-2 sm:mt-3">
                              <button
                                type="button"
                                disabled={wishlistLoading === product.id}
                                onClick={() => toggleWishlist(product.id)}
                                aria-label={
                                  wishlist.includes(product.id)
                                    ? "Remove from wishlist"
                                    : "Add to wishlist"
                                }
                                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                  wishlist.includes(product.id)
                                    ? "border-red-200 bg-red-50 text-red-500"
                                    : "border-[#e6dcc8] bg-white text-gray-500 hover:border-red-200 hover:text-red-500"
                                }`}
                              >
                                {wishlistLoading === product.id ? (
                                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                  <Heart
                                    size={15}
                                    fill={
                                      wishlist.includes(product.id)
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                )}
                              </button>

                              <button
                                type="button"
                                disabled={isCartLoading}
                                onClick={() => addToCart(product)}
                                aria-label="Add to cart"
                                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                  added
                                    ? "bg-emerald-600 text-white"
                                    : "bg-[#fff3d4] text-[#956f27] hover:bg-[#f6e5bd]"
                                }`}
                              >
                                {isCartLoading ? (
                                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : added ? (
                                  <Check size={15} />
                                ) : (
                                  <ShoppingCart size={15} />
                                )}
                              </button>
                            </div>
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

        {/* ======================================================
            REMAINING SUGGESTIONS
        ====================================================== */}
        {remainingSuggestions.length >
          0 &&
          planReady && (
            <section className="mt-7 rounded-[24px] border border-[#e8dfcf] bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                    You still have{" "}
                    {formatPrice(
                      remainingBudget
                    )}
                  </p>

                  <h3 className="mt-1 text-xl font-black">
                    Smart additions for
                    your remaining budget
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Useful products that
                    fit without crossing
                    your limit.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    optimizePlan
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#fff3d5] px-4 text-[10px] font-black text-[#956f27]"
                >
                  <Wand2 size={13} />
                  Optimize Again
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {remainingSuggestions.map(
                  (product) => (
                    <div
                      key={
                        product.id
                      }
                      className="flex items-center gap-3 rounded-2xl border border-[#eee6d8] bg-[#fffdf9] p-3"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f8f6f1]">
                        {getImageUrl(
                          product.image_url
                        ) ? (
                          <ProductImage
                            src={getImageUrl(
                              product.image_url
                            )}
                            alt={
                              product.name
                            }
                            className="h-full w-full object-contain p-1.5"
                          />
                        ) : (
                          <ShoppingBag
                            className="m-auto mt-4 text-gray-300"
                            size={
                              20
                            }
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black">
                          {
                            product.name
                          }
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-[#a17b2f]">
                          {formatPrice(
                            Number(
                              product.price
                            )
                          )}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            togglePlanProduct(
                              product.id
                            )
                          }
                          className="mt-2 text-[9px] font-black text-[#956f27]"
                        >
                          + Add to Plan
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

        {/* ======================================================
            COMPARE
        ====================================================== */}
        {compareProducts.length >=
          2 && (
          <section className="mt-7 overflow-hidden rounded-[24px] border border-[#dfc98e] bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[#eadfca] bg-[#fff8e8] px-5 py-4 sm:px-7">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-[#a17b2f]">
                  Quick comparison
                </p>

                <h3 className="mt-1 text-lg font-black">
                  Compare your selected
                  products
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCompareIds([])
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5dccb] bg-white text-gray-500"
              >
                <X size={15} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead>
                  <tr className="border-b border-[#eee7da] text-[9px] uppercase tracking-wider text-gray-400">
                    <th className="px-5 py-4 sm:px-7">
                      Feature
                    </th>

                    {compareProducts.map(
                      (product) => (
                        <th
                          key={
                            product.id
                          }
                          className="px-5 py-4"
                        >
                          {
                            product.name
                          }
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody className="text-xs">
                  {[
                    [
                      "Price",
                      (p: Product) =>
                        formatPrice(
                          Number(
                            p.price
                          )
                        ),
                    ],
                    [
                      "Rating",
                      (p: Product) =>
                        `${Number(
                          p.rating || 0
                        ).toFixed(
                          1
                        )} / 5`,
                    ],
                    [
                      "Reviews",
                      (p: Product) =>
                        `${p.reviews_count}`,
                    ],
                    [
                      "Discount",
                      (p: Product) =>
                        `${discountPercent(
                          Number(
                            p.price
                          ),
                          p.original_price
                            ? Number(
                                p.original_price
                              )
                            : null
                        )}%`,
                    ],
                    [
                      "Match",
                      (p: Product) =>
                        `${getProductScore(
                          p,
                          budget,
                          goal
                        )}%`,
                    ],
                  ].map(
                    ([label, value]) => (
                      <tr
                        key={String(
                          label
                        )}
                        className="border-b border-[#f0eadf] last:border-0"
                      >
                        <td className="px-5 py-4 font-black text-gray-500 sm:px-7">
                          {String(
                            label
                          )}
                        </td>

                        {compareProducts.map(
                          (
                            product
                          ) => (
                            <td
                              key={
                                product.id
                              }
                              className="px-5 py-4 font-black"
                            >
                              {(
                                value as (
                                  p: Product
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
          </section>
        )}

        {/* ======================================================
            EXPLORE
        ====================================================== */}
        {planReady && (
          <section className="mt-12">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                Explore
              </p>

              <h3 className="mt-1 text-2xl font-black">
                {budget > 0
                  ? `Smart picks within ₹${budget.toLocaleString("en-IN")}`
                  : "Choose your budget to explore picks"}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Every generated plan is calculated against your exact total budget — never as a per-product limit.
              </p>
            </div>


          </div>

          {loading ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="h-[410px] animate-pulse rounded-[24px] bg-[#ebe6dd]"
                  />
                )
              )}
            </div>
          ) : rankedProducts.length ===
            0 ? (
            <div className="mt-6 rounded-[24px] border border-[#eadfca] bg-white p-8 text-center sm:p-16">
              <CircleDollarSign
                size={38}
                className="mx-auto text-[#c9a24d]"
              />

              <h4 className="mt-4 text-lg font-black">
                No matching products found
              </h4>

              <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
                {!hasExactMatchingProducts
                  ? "No product matches your selected category and subcategory."
                  : `Products exist for ${categoryName}${
                      subcategory !== "all" ? ` → ${subcategory}` : ""
                    }, but none are available within ${formatPrice(
                      budget
                    )}. Increase your budget or change the selection.`}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#eadfca] bg-[#fffaf0] px-4 py-2 text-[10px] font-black text-[#956f27]">
                <Wallet size={13} />
                Budget: {formatPrice(budget)}
              </div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {rankedProducts
                .slice(0, 8)
                .map(
                  (product) => {
                    const image =
                      getImageUrl(
                        product.image_url
                      );

                    const wished =
                      wishlist.includes(
                        product.id
                      );

                    const selected =
                      activePlanIds.includes(
                        product.id
                      );

                    const added =
                      cartIds.includes(
                        product.id
                      );

                    const isWishlistLoading =
                      wishlistLoading ===
                      product.id;

                    const isCartLoading =
                      cartLoading ===
                      product.id;

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

                    return (
                      <article
                        key={
                          product.id
                        }
                        className={`group overflow-hidden rounded-[24px] border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                          selected
                            ? "border-[#c9a24d]"
                            : "border-[#e8dfcf]"
                        }`}
                      >
                        {/* IMAGE */}
                        <div className="relative h-60 overflow-hidden bg-[#faf9f6]">
                          {image ? (
                            <ProductImage
                              src={
                                image
                              }
                              alt={
                                product.name
                              }
                              className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-gray-300">
                              <ShoppingBag
                                size={
                                  40
                                }
                              />
                            </div>
                          )}

                          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#181818] px-3 py-1.5 text-[9px] font-black text-white">
                            <Sparkles
                              size={
                                10
                              }
                            />

                            {
                              product.score
                            }
                            %
                            MATCH
                          </div>

                          {/* WISHLIST BUTTON */}
                          <button
                            type="button"
                            disabled={
                              isWishlistLoading
                            }
                            onClick={() =>
                              toggleWishlist(
                                product.id
                              )
                            }
                            aria-label={
                              wished
                                ? "Remove from wishlist"
                                : "Add to wishlist"
                            }
                            className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border bg-white/95 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              wished
                                ? "border-red-200 text-red-500"
                                : "border-[#e8dfcf] text-gray-500 hover:text-red-500"
                            }`}
                          >
                            {isWishlistLoading ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
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
                            )}
                          </button>

                          {discount >
                            0 && (
                            <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[9px] font-black text-white">
                              {
                                discount
                              }
                              %
                              OFF
                            </span>
                          )}
                        </div>

                        {/* DETAILS */}
                        <div className="p-5">
                          <div className="flex items-center justify-between">
                            <span className="max-w-[70%] truncate text-[9px] font-black uppercase tracking-wider text-[#a17b2f]">
                              {categories.find(
                                (
                                  item
                                ) =>
                                  item.id ===
                                  product.category_id
                              )?.name ||
                                "PrimeCart"}
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

                          <h4 className="mt-2 line-clamp-2 min-h-[42px] text-[15px] font-black leading-5">
                            {product.name}
                          </h4>

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

                          {/* ACTIONS */}
                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              disabled={isWishlistLoading}
                              onClick={() => toggleWishlist(product.id)}
                              aria-label={
                                wished
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                wished
                                  ? "border-red-200 bg-red-50 text-red-500"
                                  : "border-[#e4dccd] bg-white text-gray-500 hover:border-red-200 hover:text-red-500"
                              }`}
                            >
                              {isWishlistLoading ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <Heart
                                  size={16}
                                  fill={wished ? "currentColor" : "none"}
                                />
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={isCartLoading}
                              onClick={() => addToCart(product)}
                              aria-label="Add to cart"
                              className={`flex h-10 flex-1 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                added
                                  ? "bg-emerald-600 text-white"
                                  : "bg-[#fff3d4] text-[#956f27] hover:bg-[#f6e5bd]"
                              }`}
                            >
                              {isCartLoading ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : added ? (
                                <Check size={15} />
                              ) : (
                                <ShoppingCart size={15} />
                              )}
                            </button>
                          </div>

                          {added && (
                            <div className="mt-2 text-center text-[9px] font-bold text-emerald-600">
                              In cart · Qty{" "}
                              {
                                cartQuantities[
                                  product.id
                                ]
                              }
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  }
                )}
            </div>
          )}
        </section>
        )}

        {/* ======================================================
            SWAP MODAL
        ====================================================== */}
        {swapProductId && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
            <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[#e5d7ba] bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eee7da] bg-white px-5 py-5 sm:px-7">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b58a32]">
                    Product Swap
                  </p>

                  <h3 className="mt-1 text-xl font-black">
                    Choose a better
                    alternative
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSwapProductId(
                      null
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5dccb] text-gray-500"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="p-5 sm:p-7">
                {swapOptions.length ===
                0 ? (
                  <div className="rounded-2xl bg-[#fffaf0] p-8 text-center">
                    <ShoppingBag
                      className="mx-auto text-[#c9a24d]"
                      size={30}
                    />

                    <p className="mt-3 text-sm font-black">
                      No same-category
                      alternatives
                      found
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Try another
                      product from
                      Explore.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {swapOptions.map(
                      (product) => (
                        <div
                          key={
                            product.id
                          }
                          className="flex items-center gap-4 rounded-2xl border border-[#e8dfcf] p-3 transition hover:border-[#c9a24d]"
                        >
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#faf9f6]">
                            {getImageUrl(
                              product.image_url
                            ) ? (
                              <ProductImage
                                src={getImageUrl(
                                  product.image_url
                                )}
                                alt={
                                  product.name
                                }
                                className="h-full w-full object-contain p-2"
                              />
                            ) : (
                              <ShoppingBag
                                className="m-auto mt-6 text-gray-300"
                                size={
                                  25
                                }
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black">
                              {
                                product.name
                              }
                            </p>

                            <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-gray-400">
                              <span className="font-bold text-[#956f27]">
                                {formatPrice(
                                  Number(
                                    product.price
                                  )
                                )}
                              </span>

                              <span>
                                ★{" "}
                                {Number(
                                  product.rating ||
                                    0
                                ).toFixed(
                                  1
                                )}
                              </span>

                              <span>
                                {
                                  getProductScore(
                                    product,
                                    budget,
                                    goal
                                  )
                                }
                                %
                                match
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              swapProduct(
                                swapProductId,
                                product.id
                              )
                            }
                            className="shrink-0 rounded-xl bg-[#c9a24d] px-3 py-2 text-[9px] font-black text-white"
                          >
                            Use This
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            HOW IT WORKS
        ====================================================== */}
        <section className="mt-14">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b58a32]">
              How it works
            </p>

            <h3 className="mt-2 text-2xl font-black">
              Shopping with a plan
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
              Budget Builder turns a
              simple spending limit into
              a smarter way to shop.
            </p>
          </div>

          <div className="-mx-1 mt-8 flex gap-4 overflow-x-auto px-1 pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {[
              {
                number: "01",
                icon: Wallet,
                title:
                  "Set your budget",
                text:
                  "Tell us exactly how much you want to spend.",
              },
              {
                number: "02",
                icon: BarChart3,
                title:
                  "Choose your priorities",
                text:
                  "Tell us whether you care about value, quality, premium products or quantity.",
              },
              {
                number: "03",
                icon: Sparkles,
                title:
                  "Build your cart",
                text:
                  "Explore smart recommendations and create a balanced cart.",
              },
            ].map((item) => {
              const Icon =
                item.icon;

              return (
                <div
                  key={
                    item.number
                  }
                  className="relative min-w-[82vw] snap-start overflow-hidden rounded-[24px] border border-[#e8dfcf] bg-white p-5 shadow-sm sm:min-w-[360px] md:min-w-0 md:p-6"
                >
                  <span className="absolute right-5 top-4 text-4xl font-black text-[#f2eadb]">
                    {
                      item.number
                    }
                  </span>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5dc] text-[#b58a32]">
                    <Icon size={19} />
                  </div>

                  <h4 className="mt-5 text-base font-black">
                    {
                      item.title
                    }
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================
            FINAL CTA
        ====================================================== */}
        <section className="mt-8 overflow-hidden rounded-[28px] border border-[#dfc98e] bg-[#fff6df]">
          <div className="relative flex flex-col items-center justify-between gap-6 px-6 py-9 text-center sm:px-10 md:flex-row md:text-left">
            <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/40 blur-2xl" />

            <div className="relative">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <Clock3
                  size={15}
                  className="text-[#a17b2f]"
                />

                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#956f27]">
                  Shop smarter
                </span>
              </div>

              <h3 className="mt-2 text-xl font-black sm:text-2xl">
                Your budget should work
                for you.
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Rebuild your plan anytime
                as your priorities change.
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
              className="relative inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#c9a24d] px-5 text-xs font-black text-white transition hover:bg-[#b48a3d]"
            >
              <RefreshCw size={14} />
              Rebuild Plan
            </button>
          </div>
        </section>

        <div className="h-10" />
      </main>
    </div>
  );
}
