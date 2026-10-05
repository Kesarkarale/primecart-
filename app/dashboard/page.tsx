"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "./dashboard.css";

import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Heart,
  Home,
  Laptop,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Tag,
  Truck,
  UserRound,
  Watch,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Package,
  Shirt,
  Footprints,
  Baby,
  Dumbbell,
  Car,
  BookOpen,
  Palette,
  Gamepad2,
  Monitor,
  X,
  LogOut,
  Settings,
  User,
  Zap,
  TrendingUp,
  Gift,
  Target,
  Wallet,
  Layers3,
  ArrowUpRight,
  CheckCircle2,
  Percent,
  Crown,
  ChevronUp,
} from "lucide-react";

type Product = {
  id: string | number;
  category_id: string | number | null;
  name: string;
  slug?: string | null;
  short_description?: string | null;
  description?: string | null;
  price: number | null;
  original_price: number | null;
  stock: number | null;
  image_url: string | null;
  brand?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  is_featured?: boolean | null;
  is_flash_sale?: boolean | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

type Category = {
  id: string | number;
  name: string;
};

type CartItem = {
  id: string | number;
  name: string;
  price: number;
  image_url?: string | null;
  quantity: number;
};

type UserInfo = {
  name: string;
  email: string;
};

const CART_KEY = "primecart-cart";
const THEME_KEY = "primecart-theme";

// Supabase tables used for persistent, user-specific cart and wishlist data.
const CART_TABLE = "cart_items";
const WISHLIST_TABLE = "wishlist_items";

const HERO_BANNERS = [
  "/banner/hero-banner.png",
  "/banner/hero-banner2.png",
  "/banner/hero-banner3.png",
  "/banner/hero-banner4.png",
  "/banner/hero-banner5.png",
  "/banner/hero-banner6.png",
  "/banner/hero-banner7.png",
  "/banner/hero-banner8.png",
];

const HERO_LINKS = [
  "/dashboard/products",
  "/dashboard/categories/beauty",
  "/dashboard/categories/home-and-kitchen",
  "/dashboard/categories/fashion",
  "/dashboard/prime-match",
  "/dashboard/categories/electronics",
  "/dashboard/budget-builder",
  "/dashboard/categories",
];

const CATEGORY_ORDER = [
  "Mobile",
  "Electronics",
  "Home & Kitchen",
  "Fashion",
  "Footwear",
  "Beauty",
  "Beauty & Personal Care",
  "Toy & Baby",
  "Toys & Baby",
  "Sports & Fitness",
  "Appliance",
  "Appliances",
  "Automotive",
  "Eyewear",
  "Books",
  "Gaming",
  "Watch",
  "Bag",
];

function getImageUrl(value?: string | null) {
  if (!value?.trim()) return "";
  const v = value.trim();

  if (/^https?:\/\//i.test(v) || v.startsWith("/")) {
    return v;
  }

  return `/${v}`;
}

function formatPrice(value: number | null | undefined) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getDiscount(
  price: number | null | undefined,
  original: number | null | undefined
) {
  if (!price || !original || original <= price) return 0;

  return Math.round(((original - price) / original) * 100);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getCategoryIcon(name: string) {
  const n = name.toLowerCase();

  if (n.includes("mobile")) return Smartphone;
  if (n.includes("electronic")) return Laptop;
  if (n.includes("home") || n.includes("kitchen")) return Home;
  if (n.includes("fashion")) return Shirt;
  if (n.includes("foot")) return Footprints;
  if (n.includes("beauty")) return Sparkles;
  if (n.includes("toy") || n.includes("baby")) return Baby;
  if (n.includes("sport")) return Dumbbell;
  if (n.includes("appliance")) return Monitor;
  if (n.includes("auto")) return Car;
  if (n.includes("eye")) return Eye;
  if (n.includes("book")) return BookOpen;
  if (n.includes("gaming")) return Gamepad2;
  if (n.includes("watch")) return Watch;
  if (n.includes("bag")) return ShoppingBag;

  return Package;
}

function getImageCandidates(value?: string | null) {
  if (!value?.trim()) return [];
  const raw = value.trim();
  if (/^https?:\/\//i.test(raw)) return [raw];

  const clean = raw.replace(/^public[\\/]/i, "").replace(/^\//, "");
  const encoded = clean.split("/").map(encodeURIComponent).join("/");
  return Array.from(new Set([
    `/${clean}`,
    `/${encoded}`,
    `/products/${clean}`,
    `/product/${clean}`,
    `/product-images/${clean}`,
    `/images/products/${clean}`,
    `/images/${clean}`,
    `/assets/products/${clean}`,
    `/assets/images/${clean}`,
    "/product-placeholder.png",
  ]));
}

function SafeProductImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className: string;
}) {
  const candidates = getImageCandidates(src);
  const [index, setIndex] = useState(0);

  if (!candidates.length || index >= candidates.length) {
    return <ShoppingBag size={42} strokeWidth={1.2} />;
  }

  return (
    <img
      src={candidates[index]}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setIndex((current) => current + 1)}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* PRODUCT CARD                                                               */
/* -------------------------------------------------------------------------- */

function ProductCard({
  product,
  category,
  wished,
  onWishlist,
  onCart,
  onOpen,
}: {
  product: Product;
  category: string;
  wished: boolean;
  onWishlist: () => void;
  onCart: () => void;
  onOpen: () => void;
}) {
  const discount = getDiscount(product.price, product.original_price);
  const stock = Number(product.stock ?? 0);

  return (
    <article className="product-card premium-reveal">
      <div className="product-card-glow" />

      <button
        className={`wish-btn ${wished ? "wished" : ""}`}
        aria-label="Wishlist"
        onClick={onWishlist}
      >
        <Heart
          size={18}
          fill={wished ? "currentColor" : "none"}
          strokeWidth={1.8}
        />
      </button>

      <div className="product-badges">
        {discount > 0 && (
          <span className="discount-badge">
            <Percent size={9} />
            {discount}% OFF
          </span>
        )}

        {product.is_featured && (
          <span className="mini-badge">
            <Crown size={9} />
            Bestseller
          </span>
        )}
      </div>

      <button
        className="product-image-wrap"
        onClick={onOpen}
        aria-label={`Open ${product.name}`}
      >
        {product.image_url ? (
          <SafeProductImage
            src={product.image_url}
            alt={product.name}
            className="product-image"
          />
        ) : (
          <ShoppingBag size={48} strokeWidth={1.2} />
        )}

        <span className="image-view">
          <Eye size={13} />
          Quick View
        </span>
      </button>

      <div className="product-copy">
        <div className="product-category">{category}</div>

        <button className="product-name" onClick={onOpen}>
          {product.name}
        </button>

        <div className="rating-row">
          <span className="rating-pill">
            {Number(product.rating || 0).toFixed(1)}
            <Star size={10} fill="currentColor" />
          </span>

          <span className="review-count">
            ({Number(product.reviews_count || 0).toLocaleString("en-IN")})
          </span>
        </div>

        <div className="price-row">
          <strong>{formatPrice(product.price)}</strong>

          {product.original_price &&
            product.original_price > Number(product.price || 0) && (
              <del>{formatPrice(product.original_price)}</del>
            )}
        </div>

        {stock > 0 && stock <= 10 && (
          <div className="stock-warning">
            <span />
            Only {stock} left
          </div>
        )}

        <button className="add-cart-btn" onClick={onCart}>
          <ShoppingCart size={13} />
          Add to Cart
        </button>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN DASHBOARD                                                             */
/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const categoryRailRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    email: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
const [searchLoading, setSearchLoading] = useState(false);

  const [wishlist, setWishlist] = useState<Array<string | number>>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [heroIndex, setHeroIndex] = useState(0);
  const [heroAspectRatio, setHeroAspectRatio] = useState(3.2);

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [toast, setToast] = useState("");
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  const [countdown, setCountdown] = useState({
    hours: 8,
    minutes: 42,
    seconds: 18,
  });

  /* ------------------------------------------------------------------------ */
  /* LOAD DASHBOARD + DATABASE CART/WISHLIST                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setErrorMessage("");

        const localCart = (): CartItem[] => {
          try {
            const value = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
            return Array.isArray(value) ? value : [];
          } catch {
            return [];
          }
        };


        const [
          { data: { user } },
          { data: productData, error: productError },
          { data: categoryData, error: categoryError },
        ] = await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from("products")
            .select(
              "id,category_id,name,slug,short_description,description,price,original_price,stock,image_url,brand,rating,reviews_count,is_featured,is_flash_sale,is_active,created_at"
            )
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(500),
          supabase
            .from("categories")
            .select("id,name")
            .order("name", { ascending: true }),
        ]);

        if (productError) throw productError;

        if (!mounted) return;

        const loadedProducts = (productData || []) as Product[];
        setProducts(loadedProducts);
        setCategories(categoryData || []);

        if (categoryError) {
          console.warn("Category loading warning:", categoryError.message);
        }

        if (user) {
          setUserLoggedIn(true);

          const meta = user.user_metadata || {};
          setUserInfo({
            name:
              meta.full_name ||
              meta.name ||
              user.email?.split("@")[0] ||
              "PrimeCart User",
            email: user.email || "",
          });

          /*
           * Database is the source of truth for logged-in users.
           * Existing localStorage data is migrated only when the user's
           * database tables are empty. Nothing is automatically deleted.
           */
          const [
            { data: dbCart, error: dbCartError },
            { data: dbWishlist, error: dbWishlistError },
          ] = await Promise.all([
            supabase
              .from(CART_TABLE)
              .select("id,product_id,quantity,created_at,updated_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: true }),
            supabase
              .from(WISHLIST_TABLE)
              .select("product_id,created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: true }),
          ]);

          if (dbCartError || dbWishlistError) {
            console.error("Cart/Wishlist database error:", {
              cart: dbCartError?.message,
              wishlist: dbWishlistError?.message,
            });

            if (mounted) {
              setErrorMessage(
                "Cart/Wishlist database tables are not ready. Run the PrimeCart cart & wishlist SQL once in Supabase SQL Editor."
              );
            }
          } else {
            const loadedProducts = (productData || []) as Product[];
            const productById = new Map(
              loadedProducts.map((product) => [String(product.id), product])
            );

            let finalCart: CartItem[] = (dbCart || []).map((item) => {
              const product = productById.get(String(item.product_id));

              return {
                id: item.product_id,
                name: product?.name || "PrimeCart Product",
                price: Number(product?.price || 0),
                image_url: product?.image_url || null,
                quantity: Math.max(1, Number(item.quantity || 1)),
              };
            });

            let finalWishlist: Array<string | number> = (dbWishlist || []).map(
              (item) => item.product_id
            );

            /* One-time safe migration from the old localStorage cart. */
            if (!dbCart?.length && localCart().length) {
              const rows = localCart()
                .filter((item) => item?.id != null)
                .map((item) => ({
                  user_id: user.id,
                  product_id: String(item.id),
                  quantity: Math.max(1, Number(item.quantity || 1)),
                }));

              if (rows.length) {
                const { error } = await supabase
                  .from(CART_TABLE)
                  .upsert(rows, { onConflict: "user_id,product_id" });

                if (!error) {
                  finalCart = rows.map((item) => {
                    const product = productById.get(String(item.product_id));

                    return {
                      id: item.product_id,
                      name: product?.name || "PrimeCart Product",
                      price: Number(product?.price || 0),
                      image_url: product?.image_url || null,
                      quantity: item.quantity,
                    };
                  });
                } else {
                  console.error("Cart migration failed:", error.message);
                }
              }
            }

            if (mounted) {
              setCart(finalCart);
              setWishlist(finalWishlist);
              localStorage.setItem(CART_KEY, JSON.stringify(finalCart));
            }
          }
        } else {
          /* Guest fallback: cart may stay local, wishlist is database-only. */
          const guestCart = localCart();
          setCart(guestCart);
          setWishlist([]);
        }

        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme === "dark" && mounted) {
          setTheme("dark");
        }
      } catch (error) {
        console.error("Dashboard loading error:", error);

        if (mounted) {
          setErrorMessage(
            "Unable to load PrimeCart right now. Please try again."
          );
        }
      } finally {
        if (mounted) {
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  /* ------------------------------------------------------------------------ */
  /* THEME                                                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );

    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  /* ------------------------------------------------------------------------ */
  /* HERO                                                                     */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex(
        (current) => (current + 1) % HERO_BANNERS.length
      );
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  /* ------------------------------------------------------------------------ */
  /* FLASH COUNTDOWN                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown((current) => {
        let { hours, minutes, seconds } = current;

        if (seconds > 0) {
          seconds -= 1;
        } else {
          seconds = 59;

          if (minutes > 0) {
            minutes -= 1;
          } else {
            minutes = 59;

            if (hours > 0) {
              hours -= 1;
            } else {
              hours = 8;
            }
          }
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  /* ------------------------------------------------------------------------ */
  /* TOAST                                                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast("");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [toast]);

  /* ------------------------------------------------------------------------ */
  /* CATEGORY MAP                                                             */
  /* ------------------------------------------------------------------------ */

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();

    categories.forEach((category) => {
      map.set(String(category.id), category.name);
    });

    return map;
  }, [categories]);

  /* ------------------------------------------------------------------------ */
  /* CATEGORY ORDER                                                           */
  /* ------------------------------------------------------------------------ */

  const visibleCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const ai = CATEGORY_ORDER.findIndex(
        (x) => x.toLowerCase() === a.name.toLowerCase()
      );

      const bi = CATEGORY_ORDER.findIndex(
        (x) => x.toLowerCase() === b.name.toLowerCase()
      );

      if (ai === -1 && bi === -1) {
        return a.name.localeCompare(b.name);
      }

      if (ai === -1) return 1;
      if (bi === -1) return -1;

      return ai - bi;
    });
  }, [categories]);

  const categoryCards = visibleCategories.slice(0, 12);

  /* ------------------------------------------------------------------------ */
  /* SEARCH                                                                   */
  /* ------------------------------------------------------------------------ */

useEffect(() => {
  let cancelled = false;

  const query = search.trim();

  if (!query) {
    setSearchResults([]);
    setSearchLoading(false);
    return;
  }

  setSearchLoading(true);

  const timer = window.setTimeout(async () => {
    try {
      /*
       * ---------------------------------------------------------------
       * STEP 1 — Find categories matching the search text
       * ---------------------------------------------------------------
       *
       * Example:
       * "electronics" -> Electronics category IDs
       */
      const {
        data: matchingCategories,
        error: categorySearchError,
      } = await supabase
        .from("categories")
        .select("id,name")
        .ilike("name", `%${query}%`)
        .limit(100);

      if (categorySearchError) {
        console.error(
          "Search category error:",
          categorySearchError.message
        );
      }

      const categoryIds =
        matchingCategories?.map((category) => String(category.id)) || [];

      /*
       * ---------------------------------------------------------------
       * STEP 2 — Search PRODUCTS directly in Supabase
       * ---------------------------------------------------------------
       *
       * Search is performed across multiple product columns.
       */
      const productFilters = [
        `name.ilike.%${query}%`,
        `brand.ilike.%${query}%`,
        `slug.ilike.%${query}%`,
        `short_description.ilike.%${query}%`,
        `description.ilike.%${query}%`,
      ];

      /*
       * If a category matches, also include its category_id.
       */
      if (categoryIds.length > 0) {
        categoryIds.forEach((categoryId) => {
          productFilters.push(
            `category_id.eq.${categoryId}`
          );
        });
      }

      const {
        data,
        error,
      } = await supabase
        .from("products")
        .select(
          "id,category_id,name,slug,short_description,description,price,original_price,stock,image_url,brand,rating,reviews_count,is_featured,is_flash_sale,is_active,created_at"
        )
        .eq("is_active", true)
        .or(productFilters.join(","))
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) {
        console.error(
          "Product search error:",
          error.message
        );

        if (!cancelled) {
          setSearchResults([]);
        }

        return;
      }

      if (!cancelled) {
        setSearchResults(
          ((data || []) as Product[])
        );
      }
    } catch (error) {
      console.error(
        "Database search failed:",
        error
      );

      if (!cancelled) {
        setSearchResults([]);
      }
    } finally {
      if (!cancelled) {
        setSearchLoading(false);
      }
    }
  }, 250);

  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
}, [search, supabase]);

  /* ------------------------------------------------------------------------ */
  /* PRODUCT GROUPS                                                           */
  /* ------------------------------------------------------------------------ */

  const featuredProducts = useMemo(() => {
    const source = products.filter(
      (product) => product.is_active !== false
    );

    const selected: Product[] = [];
    const used = new Set<string>();

    // Best Deals for You:
    // exactly one best product from EVERY category returned by Supabase.
    // Priority: discount -> rating -> reviews -> price.
    categories.forEach((category) => {
      const categoryProducts = source
        .filter(
          (product) =>
            String(product.category_id) === String(category.id)
        )
        .sort((a, b) => {
          const discountDiff =
            getDiscount(b.price, b.original_price) -
            getDiscount(a.price, a.original_price);

          if (discountDiff !== 0) return discountDiff;

          const ratingDiff =
            Number(b.rating || 0) - Number(a.rating || 0);

          if (ratingDiff !== 0) return ratingDiff;

          const reviewsDiff =
            Number(b.reviews_count || 0) -
            Number(a.reviews_count || 0);

          if (reviewsDiff !== 0) return reviewsDiff;

          return Number(a.price || 0) - Number(b.price || 0);
        });

      const product = categoryProducts[0];

      if (product && !used.has(String(product.id))) {
        selected.push(product);
        used.add(String(product.id));
      }
    });

    // If a product has a category_id that is not present in the categories
    // table, still show one best deal for that orphan category.
    const unmatchedCategoryIds = Array.from(
      new Set(
        source
          .map((product) => String(product.category_id || ""))
          .filter(Boolean)
          .filter(
            (categoryId) =>
              !categories.some(
                (category) => String(category.id) === categoryId
              )
          )
      )
    );

    unmatchedCategoryIds.forEach((categoryId) => {
      const product = source
        .filter(
          (item) =>
            String(item.category_id) === categoryId &&
            !used.has(String(item.id))
        )
        .sort((a, b) => {
          const discountDiff =
            getDiscount(b.price, b.original_price) -
            getDiscount(a.price, a.original_price);

          if (discountDiff !== 0) return discountDiff;
          return Number(b.rating || 0) - Number(a.rating || 0);
        })[0];

      if (product) {
        selected.push(product);
        used.add(String(product.id));
      }
    });

    return selected;
  }, [products, categories]);

  const flashProducts = useMemo(() => {
    /*
     * Flash Deals intentionally uses different categories so the dashboard
     * does not become a row of only one type of product.
     * Supabase remains the single source for product data.
     */
    const source = products
      .filter((product) => product.is_active !== false)
      .filter((product) => Number(product.stock ?? 0) > 0);

    const categoryName = (product: Product) =>
      categories.find(
        (category) =>
          String(category.id) === String(product.category_id)
      )?.name?.toLowerCase() || "";

    const categoryAliases: Array<{
      key: string;
      match: string[];
    }> = [
      { key: "Fashion", match: ["fashion", "clothing", "apparel"] },
      { key: "Beauty", match: ["beauty", "beauty & personal care", "personal care", "cosmetics"] },
      { key: "Electronics", match: ["electronics", "electronic", "mobile", "gaming", "computer"] },
      { key: "Home & Kitchen", match: ["home & kitchen", "home and kitchen", "home", "kitchen", "home & living"] },
      { key: "Footwear", match: ["footwear", "shoes", "shoe"] },
      { key: "Watch", match: ["watch", "watches", "wearables"] },
    ];

    const score = (product: Product) => {
      const discount = getDiscount(product.price, product.original_price);
      const rating = Number(product.rating || 0);
      const reviews = Number(product.reviews_count || 0);
      const flashBonus = product.is_flash_sale ? 1000 : 0;
      return flashBonus + discount * 10 + rating * 3 + Math.min(reviews, 500) / 100;
    };

    const selected: Product[] = [];
    const used = new Set<string>();

    categoryAliases.forEach(({ match }) => {
      const product = source
        .filter((item) => {
          const name = categoryName(item);
          return match.some((value) => name.includes(value));
        })
        .sort((a, b) => score(b) - score(a))[0];

      if (product && !used.has(String(product.id))) {
        selected.push(product);
        used.add(String(product.id));
      }
    });

    // Fill remaining slots with the strongest real flash/discount products.
    source
      .filter((product) => !used.has(String(product.id)))
      .sort((a, b) => score(b) - score(a))
      .forEach((product) => {
        if (selected.length < 6) {
          selected.push(product);
          used.add(String(product.id));
        }
      });

    return selected.slice(0, 6);
  }, [products, categories]);

  const topDeals = useMemo(() => {
    return [...products]
      .sort(
        (a, b) =>
          getDiscount(b.price, b.original_price) -
          getDiscount(a.price, a.original_price)
      )
      .slice(0, 3);
  }, [products]);

  const trendingProducts = useMemo(() => {
    return [...products]
      .sort(
        (a, b) =>
          Number(b.rating || 0) - Number(a.rating || 0)
      )
      .slice(0, 5);
  }, [products]);

  const newArrivals = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const first = new Date(
          a.created_at || 0
        ).getTime();

        const second = new Date(
          b.created_at || 0
        ).getTime();

        return second - first;
      })
      .slice(0, 5);
  }, [products]);

  /* ------------------------------------------------------------------------ */
  /* CART                                                                     */
  /* ------------------------------------------------------------------------ */

  const cartCount = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  /* ------------------------------------------------------------------------ */
  /* HELPERS                                                                  */
  /* ------------------------------------------------------------------------ */

  function showToast(message: string) {
    setToast(message);
  }

  async function toggleWishlist(id: string | number) {
    const normalizedId = String(id);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      showToast("Please login to use Wishlist");
      return;
    }

    const exists = wishlist.some(
      (value) => String(value) === normalizedId
    );

    const previous = wishlist;
    const next = exists
      ? wishlist.filter((value) => String(value) !== normalizedId)
      : [...wishlist, id];

    setWishlist(next);

    if (exists) {
      const { error } = await supabase
        .from(WISHLIST_TABLE)
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", normalizedId);

      if (error) {
        console.error("Wishlist delete failed:", error);
        setWishlist(previous);
        showToast(`Couldn't update Wishlist: ${error.message}`);
        return;
      }

      window.dispatchEvent(new Event("wishlist-updated"));
      showToast("Removed from Wishlist");
      return;
    }

    const { data: existingRow, error: findError } = await supabase
      .from(WISHLIST_TABLE)
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", normalizedId)
      .maybeSingle();

    if (findError) {
      console.error("Wishlist lookup failed:", findError);
      setWishlist(previous);
      showToast(`Couldn't save Wishlist: ${findError.message}`);
      return;
    }

    if (!existingRow) {
      const { error } = await supabase.from(WISHLIST_TABLE).insert({
        user_id: user.id,
        product_id: normalizedId,
      });

      if (error) {
        console.error("Wishlist insert failed:", error);
        setWishlist(previous);
        showToast(`Couldn't save Wishlist: ${error.message}`);
        return;
      }
    }

    window.dispatchEvent(new Event("wishlist-updated"));
    showToast("Added to Wishlist");
  }

  async function addToCart(product: Product) {
    const productId = String(product.id);
    const availableStock = Number(product.stock || 0);

    if (availableStock <= 0) {
      showToast("This product is currently out of stock.");
      return;
    }
    const previous = cart;
    const existing = cart.find(
      (item) => String(item.id) === productId
    );
    const maxStock = Math.max(availableStock, 1);
    const nextQuantity = Math.min(
      Number(existing?.quantity || 0) + 1,
      maxStock
    );

    const next: CartItem[] = existing
      ? cart.map((item) =>
          String(item.id) === productId
            ? { ...item, quantity: nextQuantity }
            : item
        )
      : [
          ...cart,
          {
            id: product.id,
            name: product.name,
            price: Number(product.price || 0),
            image_url: product.image_url,
            quantity: 1,
          },
        ];

    // Instant UI update + local mirror.
    setCart(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      showToast("Added to Cart");
      return;
    }

    // First find the row. This is more reliable than upsert when a
    // Supabase project has an older/changed constraint definition.
    const { data: existingRow, error: findError } = await supabase
      .from(CART_TABLE)
      .select("id,quantity")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (findError) {
      console.error("Cart lookup failed:", findError);
      setCart(previous);
      localStorage.setItem(CART_KEY, JSON.stringify(previous));
      showToast(`Couldn't save Add Cart: ${findError.message}`);
      return;
    }

    const payload = {
      user_id: user.id,
      product_id: productId,
      quantity: existingRow
        ? Math.min(Number(existingRow.quantity || 0) + 1, maxStock)
        : 1,
      updated_at: new Date().toISOString(),
    };

    let saveError = null;

    if (existingRow?.id) {
      const result = await supabase
        .from(CART_TABLE)
        .update({
          quantity: payload.quantity,
          updated_at: payload.updated_at,
        })
        .eq("id", existingRow.id)
        .eq("user_id", user.id);
      saveError = result.error;
    } else {
      const result = await supabase
        .from(CART_TABLE)
        .insert(payload);
      saveError = result.error;
    }

    if (saveError) {
      console.error("Cart save failed:", saveError);
      setCart(previous);
      localStorage.setItem(CART_KEY, JSON.stringify(previous));
      showToast(`Couldn't save Add Cart: ${saveError.message}`);
      return;
    }

    // Keep the UI quantity identical to the database quantity.
    const savedQuantity = payload.quantity;
    setCart((current) => {
      const existsInState = current.some(
        (item) => String(item.id) === productId
      );

      if (!existsInState) {
        return [
          ...current,
          {
            id: product.id,
            name: product.name,
            price: Number(product.price || 0),
            image_url: product.image_url || null,
            quantity: savedQuantity,
          },
        ];
      }

      return current.map((item) =>
        String(item.id) === productId
          ? { ...item, quantity: savedQuantity }
          : item
      );
    });
    localStorage.setItem(
      CART_KEY,
      JSON.stringify(
        next.map((item) =>
          String(item.id) === productId
            ? { ...item, quantity: savedQuantity }
            : item
        )
      )
    );

    window.dispatchEvent(new Event("cart-updated"));
    showToast(existingRow ? "Cart quantity updated" : "Added to Cart");
  }

  function openProduct(product: Product) {
    router.push(
      `/dashboard/products/${product.id}`
    );
  }

  function openCategory(category: Category) {
    router.push(
      `/dashboard/categories/${slugify(category.name)}`
    );
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();

    if (!search.trim()) return;

    setSearchOpen(false);

    router.push(
      `/dashboard/products?search=${encodeURIComponent(
        search.trim()
      )}`
    );
  }

  function scrollCategories(
    direction: "left" | "right"
  ) {
    categoryRailRef.current?.scrollBy({
      left:
        direction === "left" ? -450 : 450,
      behavior: "smooth",
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  }

  function formatCountdown(value: number) {
    return String(value).padStart(2, "0");
  }

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="store-shell">
      {/* TOP OFFER BAR */}
      <div className="top-strip">
        <div className="container strip-inner">
          <div className="strip-left">
            <span>
              <Truck size={14} />
              Free Shipping above ₹499
            </span>

            <i />

            <span>
              <RotateCcw size={14} />
              Easy Returns
            </span>

            <i />

            <span>
              <ShieldCheck size={14} />
              Secure Shopping
            </span>
          </div>

          <div className="strip-center">
            <Sparkles size={12} />
            PrimeCart Premium Shopping Experience
          </div>

          <div className="strip-right">
            <span>
              Get 10% OFF on your first order
            </span>

            <i />

            <span>
              Use code: <b>WELCOME10</b>
            </span>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="main-header">
        <div className="container header-main">
          <Link
            href="/dashboard"
            className="logo-wrap"
            aria-label="PrimeCart home"
          >
            <span className="brand-logo-box">
              <img
                src="/logo.png"
                alt="PrimeCart logo"
                className="prime-logo"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
              <span className="brand-logo-fallback">
                <ShoppingBag size={25} />
              </span>
            </span>

            <span className="brand-copy">
              <span className="brand-name">PrimeCart</span>
              <span className="brand-tagline">Shop Smart · Live Better</span>
            </span>
          </Link>

          {/* SEARCH */}
          <form
            className={`search-box ${
              searchOpen ? "search-active" : ""
            }`}
            onSubmit={submitSearch}
          >
            <Search size={19} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onFocus={() =>
                setSearchOpen(true)
              }
              placeholder="Search products, brands and more..."
              aria-label="Search products"
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => {
                  setSearch("");
                  setSearchOpen(false);
                }}
              >
                <X size={14} />
              </button>
            )}

            <button
              type="submit"
              className="search-submit"
            >
              Search
            </button>

            {searchOpen && search.trim() && (
              <div className="search-dropdown">
                <div className="search-dropdown-title">
                  <span>
                    <Search size={13} />
                    Suggestions
                  </span>

                  <small>
                    {searchResults.length} results
                  </small>
                </div>

{searchLoading ? (
  <div className="no-suggestions">
    <Search size={20} />
    <span>
      Searching PrimeCart products...
    </span>
  </div>
) : searchResults.length ? (
  searchResults.map((product) => (
    <button
      key={String(product.id)}
      type="button"
      onClick={() => {
        setSearchOpen(false);
        openProduct(product);
      }}
    >
      <span className="suggestion-image">
        {product.image_url ? (
          <SafeProductImage
            src={product.image_url}
            alt=""
            className="suggestion-product-image"
          />
        ) : (
          <ShoppingBag size={18} />
        )}
      </span>

      <span className="suggestion-copy">
        <strong>
          {product.name}
        </strong>

        <small>
          {product.brand ||
            categoryMap.get(
              String(product.category_id)
            ) ||
            "PrimeCart"}
        </small>
      </span>

      <b>
        {formatPrice(product.price)}
      </b>
    </button>
  ))
) : (
  <div className="no-suggestions">
    <Search size={20} />
    <span>
      No products found for "{search}"
    </span>
  </div>
)}

                {searchResults.length > 0 && (
                  <button
                    type="button"
                    className="view-search-results"
                    onClick={() => {
                      setSearchOpen(false);
                      router.push(
                        `/dashboard/products?search=${encodeURIComponent(
                          search.trim()
                        )}`
                      );
                    }}
                  >
                    View all results
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            )}
          </form>

          {/* HEADER ACTIONS */}
          <div className="header-actions">
            {userLoggedIn ? (
              <div className="account-area">
                <button
                  className="header-action account-action"
                  onClick={() =>
                    setProfileOpen(
                      (value) => !value
                    )
                  }
                >
                  <span className="account-icon">
                    <UserRound size={21} />
                  </span>

                  <span>
                    <small>Hello</small>
                    <strong>
                      {userInfo.name
                        .split(" ")[0]
                        .slice(0, 12)}
                    </strong>
                  </span>

                  <ChevronDown size={13} />
                </button>

                {profileOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-top">
                      <div className="profile-avatar">
                        <UserRound size={20} />
                      </div>

                      <div>
                        <strong>
                          {userInfo.name}
                        </strong>

                        <small>
                          {userInfo.email}
                        </small>
                      </div>
                    </div>

                    <Link href="/dashboard/profile">
                      <User size={16} />
                      My Profile
                    </Link>

                    <Link href="/dashboard/orders">
                      <Package size={16} />
                      My Orders
                    </Link>

                    <Link href="/dashboard/settings">
                      <Settings size={16} />
                      Settings
                    </Link>

                    <div className="dropdown-divider" />

                    <button onClick={logout}>
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="header-action login-action"
              >
                <UserRound size={21} />
                <span>
                  <small>Welcome</small>
                  <strong>Login / Register</strong>
                </span>
              </Link>
            )}

            <Link
              href="/dashboard/wishlist"
              className="header-action icon-action"
            >
              <span className="icon-with-badge">
                <Heart size={23} />
                {wishlist.length > 0 && (
                  <b>{wishlist.length}</b>
                )}
              </span>

              <span>Wishlist</span>
            </Link>

            <Link
              href="/dashboard/cart"
              className="header-action icon-action"
            >
              <span className="icon-with-badge">
                <ShoppingCart size={24} />

                {cartCount > 0 && (
                  <b>
                    {cartCount > 99
                      ? "99+"
                      : cartCount}
                  </b>
                )}
              </span>

              <span>Cart</span>
            </Link>
          </div>

          {/* ============================================================
    MOBILE HEADER — MENU + LOGO + CART
    Desktop header वर याचा कोणताही effect नाही.
============================================================ */}

<button
  className="mobile-menu-button"
  onClick={() => setMobileMenuOpen(true)}
  aria-label="Open menu"
>
  <Menu size={23} />
</button>

<Link
  href="/dashboard/cart"
  className="mobile-cart-button"
  aria-label="Shopping cart"
>
  <ShoppingCart size={22} />

  {cartCount > 0 && (
    <b>
      {cartCount > 99 ? "99+" : cartCount}
    </b>
  )}
</Link>
        </div>
      </header>

      {/* DESKTOP NAV */}
      <nav className="nav-bar">
        <div className="container nav-inner">
          <button
            className="all-category-btn"
            onClick={() =>
              router.push(
                "/dashboard/categories"
              )
            }
          >
            <Menu size={18} />
            All Categories
          </button>

          <Link href="/dashboard">
            Home
          </Link>

          <Link href="/dashboard/products?deal=flash">
            Deals
          </Link>

          <Link href="/dashboard/products?sort=bestseller">
            Best Sellers
          </Link>

          <Link href="/dashboard/products?sort=newest">
            New Arrivals
          </Link>

          <Link href="/dashboard/prime-points">
            PrimePoints
          </Link>

          <Link
            href="/dashboard/prime-match"
            className="nav-new"
          >
            PrimeMatch
            <em>New</em>
          </Link>

          <Link
            href="/dashboard/setup-builder"
            className="nav-new"
          >
            Build My Setup
            <em>New</em>
          </Link>

          <button
            className="more-nav"
            onClick={() =>
              router.push(
                "/dashboard/categories"
              )
            }
          >
            More
            <ChevronDown size={14} />
          </button>

          <div className="nav-spacer" />

          <button
            className="theme-switch"
            onClick={() =>
              setTheme(
                theme === "light"
                  ? "dark"
                  : "light"
              )
            }
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon size={14} />
            ) : (
              <Sun size={14} />
            )}

            <span>
              {theme === "light" ? "Light" : "Dark"}
            </span>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        >
          <div
            className="mobile-menu-card"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="mobile-menu-head">
              <div>
                <strong>PrimeCart</strong>
                <small>
                  Shop Smart · Live Better
                </small>
              </div>

              <button
                onClick={() =>
                  setMobileMenuOpen(false)
                }
              >
                <X />
              </button>
            </div>

            <Link
              href="/dashboard"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            >
              <Home size={17} />
              Home
            </Link>

            <Link
              href="/dashboard/categories"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            >
              <Layers3 size={17} />
              All Categories
            </Link>

            <Link
              href="/dashboard/products?deal=flash"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            >
              <Zap size={17} />
              Deals
            </Link>

            <Link
              href="/dashboard/products?sort=bestseller"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            >
              <Crown size={17} />
              Best Sellers
            </Link>

            <Link
              href="/dashboard/products?sort=newest"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            >
              <Sparkles size={17} />
              New Arrivals
            </Link>

            <Link
              href="/dashboard/prime-points"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            >
              <Gift size={17} />
              PrimePoints
            </Link>

            <Link
              href="/dashboard/prime-match"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            >
              <Target size={17} />
              PrimeMatch
            </Link>

            <Link
              href="/dashboard/setup-builder"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            >
              <Monitor size={17} />
              Build My Setup
            </Link>

            <div className="mobile-menu-divider" />

            <button
              className="mobile-theme"
              onClick={() =>
                setTheme(
                  theme === "light"
                    ? "dark"
                    : "light"
                )
              }
            >
              {theme === "light" ? (
                <Moon size={17} />
              ) : (
                <Sun size={17} />
              )}

              {theme === "light"
                ? "Switch to Dark Mode"
                : "Switch to Light Mode"}
            </button>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div
        className="container page-content"
        onClick={() => {
          if (searchOpen) {
            setSearchOpen(false);
          }

          if (profileOpen) {
            setProfileOpen(false);
          }
        }}
      >
        {/* ERROR */}
        {errorMessage && (
          <div className="error-box">
            <div>
              <ShieldCheck size={18} />
              <span>{errorMessage}</span>
            </div>

            <button
              onClick={() =>
                window.location.reload()
              }
            >
              Retry
            </button>
          </div>
        )}

        {/* HERO — FULL WIDTH CLICKABLE BANNER */}
        <section className="hero-layout">
          <div className="hero-carousel">
            <div
              className="hero-image-frame"
              style={{ aspectRatio: heroAspectRatio }}
            >
              {HERO_BANNERS.map(
                (banner, index) => (
                  <img
                    key={banner}
                    src={banner}
                    alt={`PrimeCart promotional banner ${
                      index + 1
                    }`}
                    className={`hero-banner ${
                      index === heroIndex
                        ? "active"
                        : ""
                    }`}
                    role="button"
                    tabIndex={index === heroIndex ? 0 : -1}
                    onLoad={(event) => {
                      const image = event.currentTarget;
                      if (image.naturalWidth && image.naturalHeight) {
                        setHeroAspectRatio(
                          image.naturalWidth / image.naturalHeight
                        );
                      }
                    }}
                    onClick={() => router.push(HERO_LINKS[index])}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(HERO_LINKS[index]);
                      }
                    }}
                  />
                )
              )}

              <div className="hero-shine" />

              <button
                type="button"
                className="hero-arrow hero-left"
                onClick={() =>
                  setHeroIndex(
                    (heroIndex -
                      1 +
                      HERO_BANNERS.length) %
                      HERO_BANNERS.length
                  )
                }
                aria-label="Previous banner"
              >
                <ChevronLeft size={23} />
              </button>

              <button
                type="button"
                className="hero-arrow hero-right"
                onClick={() =>
                  setHeroIndex(
                    (heroIndex + 1) %
                      HERO_BANNERS.length
                  )
                }
                aria-label="Next banner"
              >
                <ChevronRight size={23} />
              </button>

              <div className="hero-counter">
                <span>
                  {String(heroIndex + 1).padStart(
                    2,
                    "0"
                  )}
                </span>
                /
                {String(HERO_BANNERS.length).padStart(
                  2,
                  "0"
                )}
              </div>

              <div className="hero-dots">
                {HERO_BANNERS.map(
                  (_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={
                        index === heroIndex
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setHeroIndex(index)
                      }
                      aria-label={`Show banner ${
                        index + 1
                      }`}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="category-section">
          <div className="section-mini-head">
            <div>
              <span>Explore</span>
              <strong>Shop by Category</strong>
            </div>

            <Link href="/dashboard/categories">
              View All
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="category-rail-wrap">
            <button
              type="button"
              className="rail-control"
              onClick={() =>
                scrollCategories("left")
              }
              aria-label="Previous categories"
            >
              <ChevronLeft />
            </button>

            <div
              className="category-rail"
              ref={categoryRailRef}
            >
              {categoryCards.map((category) => {
                const Icon = getCategoryIcon(
                  category.name
                );

                return (
                  <button
                    type="button"
                    className="category-item"
                    key={String(category.id)}
                    onClick={() =>
                      openCategory(category)
                    }
                  >
                    <span className="category-icon">
                      <Icon size={24} />
                    </span>

                    <span>
                      {category.name}
                    </span>

                    <small>
                      Explore
                      <ArrowRight size={9} />
                    </small>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="rail-control"
              onClick={() =>
                scrollCategories("right")
              }
              aria-label="Next categories"
            >
              <ChevronRight />
            </button>
          </div>
        </section>

        {/* SMART SHOPPING */}
        <section className="smart-section">
          <div className="section-head">
            <div className="section-title">
              <span>
                <Sparkles size={20} />
              </span>
              Smart Shopping
            </div>

            <span className="section-caption">
              Tools made for your shopping journey
            </span>
          </div>

          <div className="smart-grid">
            <SmartCard
              icon={<Target />}
              eyebrow="PERSONALIZED"
              title="PrimeMatch"
              text="Tell us what you need and we'll help you discover the right products."
              href="/dashboard/prime-match"
              badge="New"
            />

            <SmartCard
              icon={<Wallet />}
              eyebrow="PLAN YOUR SPEND"
              title="Budget Builder"
              text="Set your budget and build a smart shopping list without overspending."
              href="/dashboard/budget-builder"
              badge="Smart"
            />

            <SmartCard
              icon={<Monitor />}
              eyebrow="BUILD YOUR SPACE"
              title="Build My Setup"
              text="Create gaming, college, work, fitness or home setups with ease."
              href="/dashboard/setup-builder"
              badge="New"
            />

            <SmartCard
              icon={<Gift />}
              eyebrow="REWARDS"
              title="PrimePoints"
              text="Earn points while you shop and unlock exciting rewards."
              href="/dashboard/prime-points"
              badge="Rewards"
            />
          </div>
        </section>

        {/* BEST DEALS */}
        <SectionHeader
          icon={<Sparkles size={20} />}
          title="Best Deals for You"
          subtitle="Handpicked offers based on what's trending"
          href="/dashboard/products?deal=best"
        />

        <section className="products-grid five-columns">
          {featuredProducts.map((product) => (
            <ProductCard
              key={String(product.id)}
              product={product}
              category={
                categoryMap.get(
                  String(product.category_id)
                ) || "Featured"
              }
              wished={wishlist.some(
                (value) =>
                  String(value) ===
                  String(product.id)
              )}
              onWishlist={() =>
                toggleWishlist(product.id)
              }
              onCart={() =>
                addToCart(product)
              }
              onOpen={() =>
                openProduct(product)
              }
            />
          ))}
        </section>

        {/* FLASH DEAL STRIP */}
        {flashProducts.length > 0 && (
          <section className="flash-section">
            <div className="flash-header">
              <div>
                <div className="flash-title">
                  <Zap
                    size={21}
                    fill="currentColor"
                  />
                  Flash Deals
                </div>

                <p>
                  Limited-time prices. Once they're
                  gone, they're gone.
                </p>
              </div>

              <div className="flash-timer">
                <span>ENDS IN</span>

                <b>
                  {formatCountdown(
                    countdown.hours
                  )}
                </b>

                <i>:</i>

                <b>
                  {formatCountdown(
                    countdown.minutes
                  )}
                </b>

                <i>:</i>

                <b>
                  {formatCountdown(
                    countdown.seconds
                  )}
                </b>
              </div>

              <Link href="/dashboard/products?deal=flash">
                View All Deals
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="flash-products">
              {flashProducts.map((product, index) => (
                  <button
                    key={String(product.id)}
                    type="button"
                    className="flash-product"
                    onClick={() =>
                      openProduct(product)
                    }
                  >
                    <div className="flash-product-image">
                      <span className="flash-number">0{index + 1}</span>
                      {product.image_url ? (
                        <SafeProductImage
                          src={product.image_url}
                          alt={product.name}
                          className="flash-product-img"
                        />
                      ) : (
                        <ShoppingBag size={30} />
                      )}
                    </div>

                    <div className="flash-product-copy">
                      <small className="flash-category-label">
                        {categoryMap.get(String(product.category_id)) || "Deal"}
                      </small>

                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        {formatPrice(
                          product.price
                        )}
                      </span>

                      {getDiscount(
                        product.price,
                        product.original_price
                      ) > 0 && (
                        <em>
                          {getDiscount(
                            product.price,
                            product.original_price
                          )}
                          % OFF
                        </em>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          </section>
        )}

        {/* PROMO CARDS */}
        <section className="promo-grid">
          <PromoCard
            className="promo-gold"
            icon={<Zap size={21} />}
            eyebrow="LIMITED TIME"
            title="Up to 70% OFF"
            text="Discover today's most exciting deals."
            href="/dashboard/products?deal=flash"
            button="Shop Deals"
            product={flashProducts[0]}
          />

          <PromoCard
            className="promo-cream"
            icon={<Home size={21} />}
            eyebrow="HOME ESSENTIALS"
            title="Make Home Better"
            text="Beautiful essentials for your everyday life."
            href="/dashboard/categories/home-and-kitchen"
            button="Explore Home"
            product={flashProducts[1]}
          />

          <PromoCard
            className="promo-fashion"
            icon={<Shirt size={21} />}
            eyebrow="NEW COLLECTION"
            title="Style Your Way"
            text="Fresh looks, everyday comfort and more."
            href="/dashboard/categories/fashion"
            button="Shop Fashion"
            product={flashProducts[2]}
          />
        </section>

        {/* TRENDING */}
        <SectionHeader
          icon={<TrendingUp size={20} />}
          title="Trending Now"
          subtitle="Products shoppers are loving right now"
          href="/dashboard/products?sort=trending"
        />

        <section className="products-grid five-columns trending-grid">
          {trendingProducts.map((product) => (
            <ProductCard
              key={String(product.id)}
              product={product}
              category={
                categoryMap.get(
                  String(product.category_id)
                ) || "Trending"
              }
              wished={wishlist.some(
                (value) =>
                  String(value) ===
                  String(product.id)
              )}
              onWishlist={() =>
                toggleWishlist(product.id)
              }
              onCart={() =>
                addToCart(product)
              }
              onOpen={() =>
                openProduct(product)
              }
            />
          ))}
        </section>

        {/* NEW ARRIVALS */}
        {newArrivals.length > 0 && (
          <>
            <SectionHeader
              icon={<Sparkles size={20} />}
              title="Fresh Arrivals"
              subtitle="Recently added to PrimeCart"
              href="/dashboard/products?sort=newest"
            />

            <section className="products-grid five-columns">
              {newArrivals.map((product) => (
                <ProductCard
                  key={String(product.id)}
                  product={product}
                  category={
                    categoryMap.get(
                      String(product.category_id)
                    ) || "New Arrival"
                  }
                  wished={wishlist.some(
                    (value) =>
                      String(value) ===
                      String(product.id)
                  )}
                  onWishlist={() =>
                    toggleWishlist(product.id)
                  }
                  onCart={() =>
                    addToCart(product)
                  }
                  onOpen={() =>
                    openProduct(product)
                  }
                />
              ))}
            </section>
          </>
        )}

        {/* TRUST */}
        <section className="trust-section">
          <div className="trust-heading">
            <span>WHY PRIME CART?</span>
            <strong>
              Shopping designed around you
            </strong>
          </div>

          <div className="trust-strip">
            <TrustItem
              icon={<Truck />}
              title="Free Shipping"
              text="On orders above ₹499"
            />

            <TrustItem
              icon={<RotateCcw />}
              title="Easy Returns"
              text="7-day hassle-free returns"
            />

            <TrustItem
              icon={<ShieldCheck />}
              title="Secure Payments"
              text="100% secure checkout"
            />

            <TrustItem
              icon={<Headphones />}
              title="Customer Support"
              text="We're here to help"
            />
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="bottom-cta">
          <div className="bottom-cta-glow" />

          <div className="bottom-cta-content">
            <span>
              <Crown size={14} />
              PRIME CART
            </span>

            <h2>
              Your smarter way to shop.
            </h2>

            <p>
              Discover products, compare deals and
              build your perfect shopping experience.
            </p>

            <div className="bottom-cta-actions">
              <Link href="/dashboard/products">
                Explore Products
                <ArrowRight size={15} />
              </Link>

              <Link
                href="/dashboard/prime-match"
                className="secondary"
              >
                Try PrimeMatch
                <Target size={15} />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <Link href="/dashboard" className="mobile-bottom-item active">
          <Home size={19} />
          <span>Home</span>
        </Link>

        <Link href="/dashboard/categories" className="mobile-bottom-item">
          <Layers3 size={19} />
          <span>Categories</span>
        </Link>

        <Link href="/dashboard/wishlist" className="mobile-bottom-item mobile-bottom-wishlist">
          <span className="mobile-bottom-icon-wrap">
            <Heart size={20} />
            {wishlist.length > 0 && <b>{wishlist.length > 99 ? "99+" : wishlist.length}</b>}
          </span>
          <span>Wishlist</span>
        </Link>

        <Link href="/dashboard/cart" className="mobile-bottom-item mobile-bottom-cart">
          <span className="mobile-bottom-icon-wrap">
            <ShoppingCart size={20} />
            {cartCount > 0 && <b>{cartCount > 99 ? "99+" : cartCount}</b>}
          </span>
          <span>Cart</span>
        </Link>

        {userLoggedIn ? (
          <Link href="/dashboard/profile" className="mobile-bottom-item">
            <UserRound size={19} />
            <span>Account</span>
          </Link>
        ) : (
          <Link href="/auth/login" className="mobile-bottom-item">
            <UserRound size={19} />
            <span>Login</span>
          </Link>
        )}
      </nav>

      {/* TOAST */}
      {toast && (
        <div className="toast">
          <span>
            <CheckCircle2 size={17} />
          </span>

          {toast}
        </div>
      )}

      {/* BACK TO TOP */}
      <button
        className="back-top"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
        aria-label="Back to top"
      >
        <ChevronUp size={18} />
      </button>


    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* SERVICE                                                                    */
/* -------------------------------------------------------------------------- */

function Service({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="service-row">
      <span className="service-icon">
        {icon}
      </span>

      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SECTION HEADER                                                             */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  icon,
  title,
  subtitle,
  href,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  href: string;
}) {
  return (
    <div className="section-head">
      <div>
        <div className="section-title">
          <span>{icon}</span>
          {title}
        </div>

        {subtitle && (
          <span className="section-caption">
            {subtitle}
          </span>
        )}
      </div>

      <Link href={href}>
        View All
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SMART CARD                                                                 */
/* -------------------------------------------------------------------------- */

function SmartCard({
  icon,
  eyebrow,
  title,
  text,
  href,
  badge,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  badge: string;
}) {
  return (
    <Link
      href={href}
      className="smart-card"
    >
      <span className="smart-badge">
        {badge}
      </span>

      <div className="smart-card-icon">
        {icon}
      </div>

      <span className="smart-card-eyebrow">
        {eyebrow}
      </span>

      <h3>{title}</h3>

      <p>{text}</p>

      <span className="smart-card-link">
        Explore
        <ArrowRight size={11} />
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* PROMO CARD                                                                 */
/* -------------------------------------------------------------------------- */

function PromoCard({
  className,
  icon,
  eyebrow,
  title,
  text,
  href,
  button,
  product,
}: {
  className: string;
  icon: ReactNode;
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  button: string;
  product?: Product;
}) {
  return (
    <div className={`promo-card ${className}`}>
      <div>
        <div className="promo-icon">
          {icon}
        </div>

        <span className="promo-eyebrow">
          {eyebrow}
        </span>

        <h3>{title}</h3>

        <p>{text}</p>

        <Link href={href}>
          {button}
          <ArrowRight size={11} />
        </Link>
      </div>

      {product?.image_url && (
        <SafeProductImage
          src={product.image_url}
          alt=""
          className="promo-product-image"
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TRUST ITEM                                                                 */
/* -------------------------------------------------------------------------- */

function TrustItem({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="trust-item">
      <span>{icon}</span>

      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </div>
  );
}
