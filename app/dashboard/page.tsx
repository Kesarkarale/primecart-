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

import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  Gamepad2,
  Monitor,
  X,
  LogOut,
  Settings,
  User,
  Zap,
  TrendingUp,
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

        <button
          className="add-cart-btn"
          onClick={onCart}
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCart size={15} />
          <span className="add-cart-label">Add to Cart</span>
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
          /* Load all active products in pages; a single 500-row limit can
             leave categories and products missing from the dashboard. */
          (async () => {
            const pageSize = 1000;
            let from = 0;
            const allProducts: Product[] = [];

            while (true) {
              const { data, error } = await supabase
                .from("products")
                .select(
                  "id,category_id,name,slug,short_description,description,price,original_price,stock,image_url,brand,rating,reviews_count,is_featured,is_flash_sale,is_active,created_at"
                )
                .eq("is_active", true)
                .order("created_at", { ascending: false })
                .range(from, from + pageSize - 1);

              if (error) return { data: null, error };

              const page = (data || []) as Product[];
              allProducts.push(...page);
              if (page.length < pageSize) break;
              from += pageSize;
            }

            return { data: allProducts, error: null };
          })(),
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
  /* SEARCH — LIVE SUPABASE PRODUCT SEARCH                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const query = search.trim();

    if (!query) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setSearchLoading(true);

      try {
        const safeQuery = query.replace(/[%_,]/g, " ").trim();

        const { data, error } = await supabase
          .from("products")
          .select(
            "id,category_id,name,slug,short_description,description,price,original_price,stock,image_url,brand,rating,reviews_count,is_featured,is_flash_sale,is_active,created_at"
          )
          .eq("is_active", true)
          .or(
            `name.ilike.%${safeQuery}%,slug.ilike.%${safeQuery}%,brand.ilike.%${safeQuery}%,short_description.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
          )
          .order("created_at", { ascending: false })
          .limit(7);

        if (cancelled) return;

        if (error) {
          console.error("Dashboard search failed:", error);
          setSearchResults([]);
          return;
        }

        setSearchResults((data || []) as Product[]);
      } catch (error) {
        if (!cancelled) {
          console.error("Dashboard search error:", error);
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 300);

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

    /*
     * Guests can browse the complete store, but adding to Cart requires
     * authentication. Check the Supabase session before changing the cart.
     */
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      showToast("Please login to add products to Cart.");
      router.push("/auth/login");
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

          {/* MOBILE CART — icon only beside PrimeCart logo */}
          <Link
            href="/dashboard/cart"
            className="mobile-header-cart"
            aria-label="Shopping Cart"
          >
            <span className="mobile-header-cart-icon">
              <ShoppingCart size={21} />
              {cartCount > 0 && (
                <b>{cartCount > 99 ? "99+" : cartCount}</b>
              )}
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
                    <Search size={18} />
                    <span>Searching products...</span>
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
                              String(
                                product.category_id
                              )
                            ) ||
                            "PrimeCart"}
                        </small>
                      </span>

                      <b>
                        {formatPrice(
                          product.price
                        )}
                      </b>
                    </button>
                  ))
                ) : (
                  <div className="no-suggestions">
                    <Search size={20} />
                    <span>
                      No products found for "
                      {search}"
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

          <button
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenuOpen(true)
            }
            aria-label="Open menu"
          >
            <Menu size={25} />
          </button>
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

          <Link
            href="/dashboard/prime-match"
            className="nav-new"
          >
            PrimeMatch
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
              href="/dashboard/prime-match"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            >
              <Target size={17} />
              PrimeMatch
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
              style={{ aspectRatio: "auto" }}
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

      {/* GLOBAL CSS */}
      <style jsx global>{`
        :root {
          --gold: #b88924;
          --gold-dark: #956d16;
          --gold-2: #d7ad57;
          --gold-light: #fbf3df;
          --gold-pale: #fffaf0;

          --ink: #181715;
          --muted: #77736b;

          --line: #ece8df;
          --paper: #ffffff;
          --page: #fcfcfa;

          --green: #438a52;
          --green-soft: #eef8ef;

          --shadow: 0 8px 28px rgba(56, 43, 17, 0.055);
          --shadow-hover: 0 18px 42px
            rgba(56, 43, 17, 0.11);

          --radius: 12px;
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: var(--page);
          color: var(--ink);
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        button,
        input {
          font: inherit;
        }

        button,
        a {
          -webkit-tap-highlight-color: transparent;
        }

        button {
          cursor: pointer;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        ::selection {
          background: #ead09a;
          color: #241d0d;
        }

        html.dark body {
          background: #15130f;
          color: #f8f1df;
        }

        html.dark .main-header,
        html.dark .nav-bar,
        html.dark .product-card,
        html.dark .welcome-card,
        html.dark .top-deals-card,
        html.dark .trust-strip,
        html.dark .smart-section,
        html.dark .flash-section,
        html.dark .section-mini-head {
          background: #201c15;
          border-color: #3b3326;
        }

        html.dark .search-box,
        html.dark .profile-dropdown,
        html.dark .search-dropdown,
        html.dark .mobile-menu-card {
          background: #211d16;
          border-color: #493d29;
          color: #fff;
        }

        html.dark .search-box input {
          color: #fff;
        }

        html.dark .product-name,
        html.dark .rail-heading strong,
        html.dark .category-item,
        html.dark .section-title,
        html.dark .section-mini-head strong,
        html.dark .smart-card h3,
        html.dark .product-copy,
        html.dark .trust-heading strong {
          color: #fff;
        }

        html.dark .product-category,
        html.dark .review-count,
        html.dark .mini-deal-copy span,
        html.dark .service-row small,
        html.dark .section-caption,
        html.dark .category-item small {
          color: #c9c1b2;
        }

        html.dark .product-image-wrap,
        html.dark .mini-deal-image,
        html.dark .suggestion-image {
          background: #29231a;
        }

        html.dark .category-icon,
        html.dark .service-icon,
        html.dark .welcome-avatar {
          background: #332a1b;
        }

        html.dark .section-head > a {
          color: #dfba6b;
        }

        html.dark .deal-banner a {
          background: #29231b;
          color: #fff;
        }

        html.dark .bottom-cta {
          border-color: #4c3c20;
        }

        /* -------------------------------------------------------------- */
        /* BASE                                                            */
        /* -------------------------------------------------------------- */

        .store-shell {
          min-height: 100vh;
          overflow-x: hidden;
        }

        .container {
          width: min(
            1410px,
            calc(100% - 48px)
          );
          margin: 0 auto;
        }

        /* -------------------------------------------------------------- */
        /* TOP STRIP                                                       */
        /* -------------------------------------------------------------- */

        .top-strip {
          background:
            linear-gradient(
              90deg,
              #a97617,
              #c59635,
              #ad7c1e
            );
          color: #fff;
          font-size: 11px;
          position: relative;
          overflow: hidden;
        }

        .top-strip::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            110deg,
            transparent 20%,
            rgba(255, 255, 255, 0.14) 50%,
            transparent 80%
          );
          transform: translateX(-100%);
          animation: stripShine 8s linear infinite;
        }

        .strip-inner {
          min-height: 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          position: relative;
          z-index: 2;
        }

        .strip-left,
        .strip-right,
        .strip-center {
          display: flex;
          align-items: center;
          gap: 13px;
          white-space: nowrap;
        }

        .strip-left span,
        .strip-center,
        .strip-right span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .strip-center {
          opacity: 0.9;
          font-size: 10px;
          letter-spacing: 0.2px;
        }

        .strip-inner i {
          width: 1px;
          height: 13px;
          background: rgba(255, 255, 255, 0.42);
        }

        .strip-right b {
          font-weight: 800;
          letter-spacing: 0.4px;
        }

        /* -------------------------------------------------------------- */
        /* HEADER                                                          */
        /* -------------------------------------------------------------- */

        .main-header {
          background: #fff;
          border-bottom: 1px solid #efede8;
          position: relative;
          z-index: 50;
        }

        .header-main {
          min-height: 82px;
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .logo-wrap {
          display: flex;
          align-items: center;
          min-width: 225px;
        }

        .prime-logo {
          width: 110px;
          max-width: 100%;
          height: 38px;
          object-fit: contain;
          display: block;
        }

        .logo-fallback {
          display: none;
          align-items: center;
          gap: 10px;
        }

        .logo-mark {
          width: 43px;
          height: 43px;
          border: 2px solid var(--gold);
          border-radius: 10px 10px 13px 13px;
          color: var(--gold);
          display: grid;
          place-items: center;
          position: relative;
        }

        .logo-mark:before {
          content: "";
          position: absolute;
          width: 17px;
          height: 9px;
          border: 2px solid var(--gold);
          border-bottom: 0;
          border-radius: 12px 12px 0 0;
          top: -8px;
          left: 11px;
        }

        .logo-text {
          color: var(--gold);
          font-size: 28px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .logo-tagline {
          color: #8c8c8c;
          font-size: 10px;
          margin-top: 4px;
        }

        /* -------------------------------------------------------------- */
        /* SEARCH                                                          */
        /* -------------------------------------------------------------- */

        .search-box {
          height: 45px;
          border: 1px solid #e3e0d8;
          border-radius: 9px;
          display: flex;
          align-items: center;
          flex: 1;
          max-width: 750px;
          position: relative;
          background: #fff;
          box-shadow: 0 3px 12px
            rgba(0, 0, 0, 0.025);
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .search-box.search-active {
          border-color: #d1aa5a;
          box-shadow:
            0 0 0 3px rgba(184, 137, 36, 0.08),
            0 8px 25px rgba(46, 35, 13, 0.08);
        }

        .search-box > svg {
          margin-left: 15px;
          color: #999;
          flex: none;
        }

        .search-box input {
          flex: 1;
          height: 100%;
          border: 0;
          outline: 0;
          padding: 0 10px;
          background: transparent;
          min-width: 0;
          color: var(--ink);
          font-size: 13px;
        }

        .search-submit {
          height: 37px;
          margin-right: 4px;
          padding: 0 24px;
          border: 0;
          border-radius: 7px;
          background: linear-gradient(
            135deg,
            #c99a37,
            #ad7c19
          );
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .search-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px
            rgba(165, 117, 27, 0.2);
        }

        .clear-search {
          border: 0;
          background: transparent;
          color: #999;
          display: grid;
          place-items: center;
          padding: 5px;
        }

        .search-dropdown {
          position: absolute;
          top: 52px;
          left: 0;
          right: 0;
          z-index: 80;
          background: #fff;
          border: 1px solid #ebe7dd;
          border-radius: 12px;
          box-shadow: 0 18px 45px
            rgba(0, 0, 0, 0.13);
          overflow: hidden;
          animation: dropdownIn 0.18s ease both;
        }

        .search-dropdown-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          border-bottom: 1px solid #f0ece4;
          font-size: 10px;
          color: #777;
        }

        .search-dropdown-title span {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #5f574a;
          font-weight: 700;
        }

        .search-dropdown-title small {
          color: #a1844b;
        }

        .search-dropdown > button:not(
            .view-search-results
          ) {
          width: 100%;
          margin: 0;
          padding: 10px 13px;
          border: 0;
          background: transparent;
          color: #222;
          display: flex;
          gap: 12px;
          text-align: left;
          align-items: center;
          transition: background 0.15s ease;
        }

        .search-dropdown
          > button:not(
            .view-search-results
          ):hover {
          background: #fff9ee;
        }

        .suggestion-image {
          width: 46px;
          height: 46px;
          border-radius: 8px;
          background: #faf8f3;
          display: grid;
          place-items: center;
          flex: none;
          overflow: hidden;
        }

        .suggestion-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .suggestion-copy {
          flex: 1;
          min-width: 0;
        }

        .suggestion-copy strong,
        .suggestion-copy small {
          display: block;
        }

        .suggestion-copy strong {
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .suggestion-copy small {
          color: #999;
          font-size: 9px;
          margin-top: 4px;
        }

        .search-dropdown
          > button:not(
            .view-search-results
          )
          > b {
          color: var(--gold-dark);
          font-size: 11px;
        }

        .no-suggestions {
          padding: 22px;
          color: #888;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .view-search-results {
          width: 100%;
          border: 0;
          border-top: 1px solid #f0ece4;
          background: #fffaf0;
          color: #8e6719;
          padding: 11px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 700;
        }

        /* -------------------------------------------------------------- */
        /* HEADER ACTIONS                                                  */
        /* -------------------------------------------------------------- */

        .header-actions {
          display: flex;
          align-items: center;
          gap: 21px;
          margin-left: auto;
          white-space: nowrap;
        }

        .header-action {
          border: 0;
          background: transparent;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #222;
          font-size: 11px;
          padding: 6px 0;
        }

        .header-action svg {
          stroke-width: 1.65;
        }

        .account-action {
          gap: 8px;
        }

        .account-action > span:not(
            .account-icon
          ) {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .account-action small {
          font-size: 8px;
          color: #999;
        }

        .account-action strong {
          font-size: 10px;
          font-weight: 700;
        }

        .account-icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: var(--gold);
          background: var(--gold-pale);
          border: 1px solid #f2e5c7;
        }

        .icon-action {
          flex-direction: column;
          gap: 3px;
          font-size: 9px;
        }

        .icon-with-badge {
          position: relative;
          display: inline-flex;
        }

        .icon-with-badge b {
          position: absolute;
          top: -8px;
          right: -9px;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          border-radius: 20px;
          background: #d2a446;
          color: #fff;
          border: 2px solid #fff;
          font-size: 8px;
          display: grid;
          place-items: center;
        }

        .account-area {
          position: relative;
        }

        .profile-dropdown {
          position: absolute;
          z-index: 100;
          right: -8px;
          top: 48px;
          width: 245px;
          background: #fff;
          border: 1px solid #ece7db;
          border-radius: 12px;
          box-shadow: 0 18px 45px
            rgba(0, 0, 0, 0.13);
          padding: 8px;
          animation: dropdownIn 0.18s ease both;
        }

        .profile-top {
          display: flex;
          gap: 10px;
          padding: 11px;
          border-bottom: 1px solid #eeeae1;
          margin-bottom: 5px;
        }

        .profile-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--gold-soft);
          color: var(--gold);
          display: grid;
          place-items: center;
          flex: none;
        }

        .profile-top strong,
        .profile-top small {
          display: block;
        }

        .profile-top strong {
          font-size: 12px;
        }

        .profile-top small {
          font-size: 9px;
          color: #8b8b8b;
          margin-top: 4px;
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-dropdown a,
        .profile-dropdown button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: 0;
          background: transparent;
          border-radius: 7px;
          font-size: 11px;
          text-align: left;
        }

        .profile-dropdown a:hover,
        .profile-dropdown button:hover {
          background: #fff8e8;
          color: var(--gold);
        }

        .dropdown-divider {
          height: 1px;
          background: #eeeae2;
          margin: 5px 0;
        }

        .mobile-menu-button {
          display: none;
          border: 0;
          background: transparent;
          color: #222;
        }

        /* -------------------------------------------------------------- */
        /* NAV                                                             */
        /* -------------------------------------------------------------- */

        .nav-bar {
          background: #fff;
          border-bottom: 1px solid #eceae5;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .nav-inner {
          height: 51px;
          display: flex;
          align-items: center;
          gap: 29px;
        }

        .nav-inner > a,
        .more-nav {
          font-size: 11px;
          border: 0;
          background: transparent;
          color: #252525;
          white-space: nowrap;
          transition: color 0.2s ease;
        }

        .nav-inner > a:hover,
        .more-nav:hover {
          color: var(--gold);
        }

        .all-category-btn {
          border: 0;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 9px;
          font-weight: 700;
          font-size: 11px;
          margin-right: 10px;
        }

        .nav-new {
          position: relative;
        }

        .nav-new em {
          position: absolute;
          top: -17px;
          right: -15px;
          background: var(--gold);
          color: #fff;
          font-style: normal;
          border-radius: 5px;
          font-size: 7px;
          padding: 3px 5px;
          box-shadow: 0 3px 8px
            rgba(184, 137, 36, 0.18);
        }

        .more-nav {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .nav-spacer {
          flex: 1;
        }

        .theme-switch {
          min-width: 75px;
          height: 27px;
          border: 1px solid #ded7c9;
          background: #fff;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          color: var(--gold);
          font-size: 9px;
        }

        /* -------------------------------------------------------------- */
        /* PAGE                                                            */
        /* -------------------------------------------------------------- */

        .page-content {
          padding: 14px 0 60px;
        }

        .error-box {
          margin-bottom: 14px;
          padding: 11px 14px;
          background: #fff4e8;
          border: 1px solid #efd8bd;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        }

        .error-box > div {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .error-box button {
          border: 0;
          background: var(--gold);
          color: #fff;
          border-radius: 6px;
          padding: 7px 13px;
          font-size: 10px;
          font-weight: 700;
        }

        /* -------------------------------------------------------------- */
        /* HERO                                                            */
        /* -------------------------------------------------------------- */

        .hero-layout {
          display: block;
          width: 100%;
          margin-bottom: 18px;
        }

        .hero-carousel {
          min-width: 0;
        }

        .hero-image-frame {
          position: relative;
          width: 100%;
          aspect-ratio: auto;
          min-height: 0;
          max-height: none;
          border-radius: 16px;
          overflow: hidden;
          background: #f5eee0;
          box-shadow:
            0 8px 25px
              rgba(56, 43, 17, 0.08),
            0 0 0 1px
              rgba(184, 137, 36, 0.08);
        }

        .hero-banner {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          opacity: 0;
          transform: scale(1.015);
          transition:
            opacity 0.7s ease,
            transform 5.4s ease;
          pointer-events: none;
        }

        .hero-banner.active {
          opacity: 1;
          transform: scale(1);
          pointer-events: auto;
        }

        .hero-shine {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            115deg,
            transparent 30%,
            rgba(255, 255, 255, 0.13) 48%,
            transparent 65%
          );
          transform: translateX(-110%);
          animation: heroShine 7s ease-in-out
            infinite;
          z-index: 3;
        }

        .hero-arrow {
          position: absolute;
          z-index: 5;
          top: 50%;
          transform: translateY(-50%);
          width: 39px;
          height: 39px;
          border: 1px solid
            rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.88);
          color: #9b711b;
          display: grid;
          place-items: center;
          box-shadow: 0 5px 15px
            rgba(0, 0, 0, 0.1);
          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }

        .hero-arrow:hover {
          transform: translateY(-50%) scale(1.08);
          background: #fff;
        }

        .hero-left {
          left: 16px;
        }

        .hero-right {
          right: 16px;
        }

        .hero-counter {
          position: absolute;
          right: 17px;
          bottom: 15px;
          z-index: 5;
          color: #fff;
          background: rgba(25, 20, 12, 0.4);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          padding: 6px 9px;
          font-size: 9px;
          letter-spacing: 1px;
        }

        .hero-counter span {
          font-weight: 800;
        }

        .hero-dots {
          position: absolute;
          bottom: 17px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          z-index: 5;
        }

        .hero-dots button {
          width: 7px;
          height: 7px;
          padding: 0;
          border: 1px solid #d1a54e;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.75);
          transition: all 0.25s ease;
        }

        .hero-dots button.active {
          width: 22px;
          border-radius: 10px;
          background: var(--gold);
        }

        /* -------------------------------------------------------------- */
        /* CATEGORY                                                         */
        /* -------------------------------------------------------------- */

        .category-section {
          margin: 23px 0 29px;
        }

        .section-mini-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 13px;
        }

        .section-mini-head > div > span {
          display: block;
          color: var(--gold);
          text-transform: uppercase;
          letter-spacing: 1.3px;
          font-size: 7px;
          font-weight: 800;
          margin-bottom: 3px;
        }

        .section-mini-head strong {
          font-size: 17px;
        }

        .section-mini-head > a {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #8c681e;
          font-size: 9px;
          font-weight: 700;
        }

        .category-rail-wrap {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .category-rail {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          flex: 1;
          padding: 4px 2px 7px;
        }

        .category-rail::-webkit-scrollbar {
          display: none;
        }

        .category-item {
          min-width: 100px;
          flex: 1;
          border: 0;
          background: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          color: #222;
          font-size: 9px;
          text-align: center;
          transition:
            transform 0.22s ease;
        }

        .category-icon {
          width: 61px;
          height: 61px;
          border-radius: 50%;
          background:
            linear-gradient(
              145deg,
              #fffdf8,
              #fff5dd
            );
          color: var(--gold);
          display: grid;
          place-items: center;
          box-shadow:
            0 5px 15px
              rgba(100, 74, 23, 0.07),
            inset 0 0 0 1px
              rgba(193, 150, 67, 0.1);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .category-item small {
          color: #a18b61;
          font-size: 7px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          opacity: 0;
          transform: translateY(-3px);
          transition:
            opacity 0.2s ease,
            transform 0.2s ease;
        }

        .category-item:hover {
          transform: translateY(-3px);
        }

        .category-item:hover .category-icon {
          background: #f9edcf;
          transform: scale(1.04);
          box-shadow:
            0 9px 20px
              rgba(150, 106, 24, 0.13),
            inset 0 0 0 1px
              rgba(193, 150, 67, 0.16);
        }

        .category-item:hover small {
          opacity: 1;
          transform: translateY(0);
        }

        .rail-control {
          width: 30px;
          height: 30px;
          border: 1px solid #e7dfcf;
          background: #fff;
          color: #8d671e;
          border-radius: 50%;
          display: grid;
          place-items: center;
          flex: none;
          box-shadow: 0 3px 10px
            rgba(50, 40, 20, 0.04);
        }

        .rail-control:hover {
          background: #fff9ed;
        }

        /* -------------------------------------------------------------- */
        /* SECTION HEADER                                                   */
        /* -------------------------------------------------------------- */

        .section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin: 8px 0 13px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 800;
        }

        .section-title > span {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: var(--gold-light);
          color: var(--gold);
        }

        .section-caption {
          color: #999;
          font-size: 9px;
          margin-left: 9px;
          padding-bottom: 2px;
        }

        .section-head > div {
          display: flex;
          align-items: center;
        }

        .section-head > a {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          color: #7f601d;
          font-weight: 700;
        }

        .section-head > a:hover {
          color: var(--gold);
        }

        /* -------------------------------------------------------------- */
        /* SMART SHOPPING                                                  */
        /* -------------------------------------------------------------- */

        .smart-section {
          margin: 4px 0 30px;
          padding: 16px;
          background: #fff;
          border: 1px solid #eeeae2;
          border-radius: 12px;
          box-shadow: var(--shadow);
        }

        .smart-grid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 11px;
        }

        .smart-card {
          position: relative;
          min-height: 137px;
          border: 1px solid #eee6d6;
          border-radius: 10px;
          padding: 14px;
          background:
            linear-gradient(
              145deg,
              #fffdf9,
              #fff8e9
            );
          overflow: hidden;
          text-align: left;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .smart-card::after {
          content: "";
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          right: -45px;
          bottom: -48px;
          background: rgba(
            214,
            169,
            71,
            0.08
          );
        }

        .smart-card:hover {
          transform: translateY(-4px);
          border-color: #e2c88e;
          box-shadow: 0 13px 28px
            rgba(71, 53, 20, 0.09);
        }

        .smart-card-icon {
          width: 35px;
          height: 35px;
          border-radius: 9px;
          background: #fff;
          color: var(--gold);
          display: grid;
          place-items: center;
          box-shadow: 0 4px 12px
            rgba(70, 50, 15, 0.06);
          margin-bottom: 9px;
        }

        .smart-card-icon svg {
          width: 17px;
          height: 17px;
        }

        .smart-card-eyebrow {
          color: #a07828;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.9px;
        }

        .smart-card h3 {
          margin: 3px 0 5px;
          font-size: 14px;
        }

        .smart-card p {
          margin: 0;
          color: #777;
          font-size: 8px;
          line-height: 1.55;
          max-width: 220px;
        }

        .smart-card-link {
          position: absolute;
          right: 12px;
          bottom: 11px;
          color: var(--gold);
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 8px;
          font-weight: 800;
          z-index: 2;
        }

        .smart-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          color: #92702b;
          background: #f7ebcd;
          padding: 4px 6px;
          border-radius: 5px;
          font-size: 7px;
          font-weight: 800;
        }

        /* -------------------------------------------------------------- */
        /* PRODUCTS                                                         */
        /* -------------------------------------------------------------- */

        .products-grid {
          display: grid;
          gap: 15px;
        }

        .five-columns {
          grid-template-columns: repeat(
            5,
            minmax(0, 1fr)
          );
        }

        .product-card {
          position: relative;
          background: #fff;
          border: 1px solid #eceae5;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 3px 10px
            rgba(0, 0, 0, 0.025);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-hover);
          border-color: #e8d6ab;
        }

        .product-card-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          background: radial-gradient(
            circle at 50% 15%,
            rgba(224, 188, 111, 0.08),
            transparent 35%
          );
          transition: opacity 0.25s ease;
        }

        .product-card:hover
          .product-card-glow {
          opacity: 1;
        }

        .wish-btn {
          position: absolute;
          z-index: 5;
          right: 9px;
          top: 9px;
          border: 0;
          background: rgba(255, 255, 255, 0.88);
          color: #888;
          width: 29px;
          height: 29px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          padding: 0;
          box-shadow: 0 4px 10px
            rgba(0, 0, 0, 0.06);
          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .wish-btn:hover {
          color: #c58e22;
          transform: scale(1.08);
        }

        .wish-btn.wished {
          color: #b98724;
          background: #fff8e8;
        }

        .product-badges {
          position: absolute;
          z-index: 4;
          top: 9px;
          left: 9px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }

        .discount-badge,
        .mini-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          border-radius: 5px;
          font-size: 7px;
          padding: 4px 6px;
          font-weight: 800;
        }

        .discount-badge {
          color: #42864e;
          background: #eef8ef;
        }

        .mini-badge {
          color: #735400;
          background: #ffe58b;
        }

        .product-image-wrap {
          width: 100%;
          height: 178px;
          border: 0;
          background: #fff;
          padding: 16px 20px 6px;
          display: grid;
          place-items: center;
          position: relative;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition:
            transform 0.3s
              cubic-bezier(
                0.2,
                0.8,
                0.2,
                1
              );
        }

        .product-card:hover
          .product-image {
          transform: scale(1.045);
        }

        .image-view {
          position: absolute;
          left: 50%;
          bottom: 9px;
          transform: translate(
            -50%,
            8px
          );
          opacity: 0;
          background: rgba(25, 22, 16, 0.78);
          color: #fff;
          padding: 5px 8px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 7px;
          transition:
            opacity 0.2s ease,
            transform 0.2s ease;
        }

        .product-card:hover
          .image-view {
          opacity: 1;
          transform: translate(
            -50%,
            0
          );
        }

        .product-copy {
          padding: 4px 11px 12px;
          position: relative;
          z-index: 2;
        }

        .product-category {
          color: #777;
          font-size: 8px;
          min-height: 11px;
        }

        .product-name {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          border: 0;
          background: transparent;
          color: #252525;
          font-size: 10px;
          font-weight: 600;
          line-height: 1.4;
          padding: 0;
          text-align: left;
          width: 100%;
          min-height: 29px;
          margin-top: 2px;
        }

        .product-name:hover {
          color: var(--gold);
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 5px;
          margin: 6px 0;
        }

        .rating-pill {
          background: #f1f8f1;
          color: #3c7c48;
          border-radius: 4px;
          padding: 3px 5px;
          font-size: 8px;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }

        .review-count {
          color: #8a8a8a;
          font-size: 7px;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 7px;
          margin-bottom: 4px;
        }

        .price-row strong {
          font-size: 14px;
        }

        .price-row del {
          font-size: 8px;
          color: #999;
        }

        .stock-warning {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #b2761f;
          font-size: 7px;
          margin-bottom: 5px;
        }

        .stock-warning span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #d49c39;
        }

        .add-cart-btn {
          width: 100%;
          height: 29px;
          border: 0;
          border-radius: 6px;
          background: linear-gradient(
            180deg,
            #d1a442,
            #b78720
          );
          color: #fff;
          font-size: 9px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .add-cart-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 15px
            rgba(171, 123, 29, 0.19);
        }

        /* -------------------------------------------------------------- */
        /* FLASH SECTION                                                    */
        /* -------------------------------------------------------------- */

        .flash-section {
          margin: 28px 0 31px;
          border-radius: 13px;
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              #a9700e,
              #d0a040
            );
          color: #fff;
          box-shadow: 0 10px 30px
            rgba(163, 115, 19, 0.13);
        }

        .flash-header {
          padding: 15px 18px;
          display: flex;
          align-items: center;
          gap: 20px;
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.16);
        }

        .flash-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 17px;
          font-weight: 800;
        }

        .flash-header p {
          margin: 3px 0 0;
          font-size: 8px;
          opacity: 0.82;
        }

        .flash-timer {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .flash-timer span {
          font-size: 7px;
          opacity: 0.75;
          margin-right: 4px;
        }

        .flash-timer b {
          min-width: 27px;
          padding: 5px 4px;
          border-radius: 5px;
          text-align: center;
          background: rgba(255, 255, 255, 0.15);
          font-size: 10px;
        }

        .flash-timer i {
          font-style: normal;
          font-weight: 800;
        }

        .flash-header > a {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #fff;
          color: #976d16;
          border-radius: 6px;
          padding: 7px 10px;
          font-size: 8px;
          font-weight: 800;
        }

        .flash-products {
          display: grid;
          grid-template-columns: repeat(
            4,
            1fr
          );
          padding: 12px;
          gap: 9px;
        }

        .flash-product {
          border: 1px solid
            rgba(255, 255, 255, 0.18);
          border-radius: 8px;
          background: rgba(
            255,
            255,
            255,
            0.1
          );
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px;
          text-align: left;
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .flash-product:hover {
          background: rgba(
            255,
            255,
            255,
            0.17
          );
          transform: translateY(-2px);
        }

        .flash-product-image {
          width: 60px;
          height: 60px;
          background: rgba(
            255,
            255,
            255,
            0.94
          );
          border-radius: 6px;
          display: grid;
          place-items: center;
          flex: none;
          overflow: hidden;
        }

        .flash-product-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .flash-product > div:last-child {
          min-width: 0;
        }

        .flash-product strong {
          display: block;
          font-size: 9px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .flash-product span {
          display: block;
          font-size: 11px;
          font-weight: 800;
          margin-top: 5px;
        }

        .flash-product em {
          display: inline-block;
          margin-top: 4px;
          background: rgba(
            255,
            255,
            255,
            0.17
          );
          padding: 3px 5px;
          border-radius: 4px;
          font-style: normal;
          font-size: 6px;
        }

        /* -------------------------------------------------------------- */
        /* PROMO                                                            */
        /* -------------------------------------------------------------- */

        .promo-grid {
          display: grid;
          grid-template-columns:
            1.05fr 1fr 1fr;
          gap: 15px;
          margin: 28px 0 34px;
        }

        .promo-card {
          min-height: 135px;
          border-radius: 11px;
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: center;
          padding: 18px 21px;
          border: 1px solid transparent;
        }

        .promo-card > div {
          position: relative;
          z-index: 3;
          max-width: 63%;
        }

        .promo-icon {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: rgba(
            255,
            255,
            255,
            0.65
          );
          margin-bottom: 7px;
        }

        .promo-eyebrow {
          display: block;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 3px;
        }

        .promo-card h3 {
          margin: 0;
          font-size: 18px;
        }

        .promo-card p {
          margin: 4px 0 9px;
          font-size: 8px;
          color: #756a57;
          line-height: 1.4;
        }

        .promo-card a {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #fff;
          color: #3c3427;
          padding: 6px 9px;
          border-radius: 15px;
          font-size: 8px;
          font-weight: 800;
        }

        .promo-card > img {
          position: absolute;
          right: 7px;
          bottom: 0;
          width: 42%;
          height: 96%;
          object-fit: contain;
          z-index: 2;
          transition: transform 0.3s ease;
        }

        .promo-card:hover > img {
          transform: scale(1.05)
            translateX(-3px);
        }

        .promo-gold {
          background:
            linear-gradient(
              120deg,
              #b57b0b,
              #d3a23f
            );
          color: #fff;
        }

        .promo-gold p {
          color: rgba(
            255,
            255,
            255,
            0.78
          );
        }

        .promo-cream {
          background: linear-gradient(
            120deg,
            #fbf2df,
            #f0e1c2
          );
          border-color: #ead9b8;
        }

        .promo-fashion {
          background: linear-gradient(
            120deg,
            #f4ecdf,
            #ead7b7
          );
          border-color: #e5d5ba;
        }

        /* -------------------------------------------------------------- */
        /* TRUST                                                            */
        /* -------------------------------------------------------------- */

        .trust-section {
          margin-top: 38px;
        }

        .trust-heading {
          text-align: center;
          margin-bottom: 15px;
        }

        .trust-heading span {
          display: block;
          color: var(--gold);
          letter-spacing: 1.7px;
          font-size: 7px;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .trust-heading strong {
          font-size: 18px;
        }

        .trust-strip {
          background: #fff;
          border: 1px solid #eeeae2;
          border-radius: 11px;
          display: grid;
          grid-template-columns: repeat(
            4,
            1fr
          );
          padding: 9px 5px;
          box-shadow: var(--shadow);
        }

        .trust-item {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 9px;
          padding: 11px;
          border-right: 1px solid
            #eeeae2;
        }

        .trust-item:last-child {
          border-right: 0;
        }

        .trust-item > span {
          width: 37px;
          height: 37px;
          display: grid;
          place-items: center;
          color: var(--gold);
          background: #fff8e8;
          border-radius: 50%;
          flex: none;
        }

        .trust-item > span svg {
          width: 16px;
        }

        .trust-item strong,
        .trust-item small {
          display: block;
        }

        .trust-item strong {
          font-size: 10px;
        }

        .trust-item small {
          color: #777;
          font-size: 8px;
          margin-top: 3px;
        }

        /* -------------------------------------------------------------- */
        /* BOTTOM CTA                                                       */
        /* -------------------------------------------------------------- */

        .bottom-cta {
          position: relative;
          margin-top: 30px;
          border-radius: 14px;
          min-height: 205px;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 85% 25%,
              rgba(255, 255, 255, 0.16),
              transparent 22%
            ),
            linear-gradient(
              115deg,
              #a87518,
              #d0a148,
              #b27c18
            );
          color: #fff;
          display: flex;
          align-items: center;
          padding: 28px 38px;
          box-shadow: 0 13px 35px
            rgba(164, 116, 18, 0.16);
        }

        .bottom-cta::before,
        .bottom-cta::after {
          content: "";
          position: absolute;
          border: 1px solid
            rgba(255, 255, 255, 0.12);
          border-radius: 50%;
        }

        .bottom-cta::before {
          width: 270px;
          height: 270px;
          right: -90px;
          top: -125px;
        }

        .bottom-cta::after {
          width: 180px;
          height: 180px;
          right: 40px;
          bottom: -115px;
        }

        .bottom-cta-glow {
          position: absolute;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          right: 180px;
          top: -210px;
          background: rgba(
            255,
            255,
            255,
            0.06
          );
          filter: blur(4px);
        }

        .bottom-cta-content {
          position: relative;
          z-index: 2;
          max-width: 620px;
        }

        .bottom-cta-content > span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 7px;
          letter-spacing: 1.5px;
          font-weight: 800;
          opacity: 0.85;
        }

        .bottom-cta h2 {
          margin: 7px 0 5px;
          font-size: 27px;
          letter-spacing: -0.5px;
        }

        .bottom-cta p {
          margin: 0;
          max-width: 450px;
          font-size: 10px;
          line-height: 1.6;
          opacity: 0.82;
        }

        .bottom-cta-actions {
          display: flex;
          gap: 8px;
          margin-top: 17px;
        }

        .bottom-cta-actions a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          color: #916817;
          border-radius: 7px;
          padding: 9px 13px;
          font-size: 9px;
          font-weight: 800;
        }

        .bottom-cta-actions a.secondary {
          background: rgba(
            255,
            255,
            255,
            0.12
          );
          color: #fff;
          border: 1px solid
            rgba(255, 255, 255, 0.25);
        }

        /* -------------------------------------------------------------- */
        /* TOAST                                                            */
        /* -------------------------------------------------------------- */

        .toast {
          position: fixed;
          z-index: 200;
          right: 24px;
          bottom: 24px;
          background: #211d16;
          color: #fff;
          border-radius: 9px;
          padding: 11px 15px;
          box-shadow: 0 12px 35px
            rgba(0, 0, 0, 0.23);
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: toastIn 0.3s
            cubic-bezier(
              0.2,
              0.8,
              0.2,
              1
            );
        }

        .toast > span {
          color: #d7ae51;
          display: flex;
        }

        /* -------------------------------------------------------------- */
        /* MOBILE MENU                                                      */
        /* -------------------------------------------------------------- */

        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          z-index: 150;
          background: rgba(
            0,
            0,
            0,
            0.34
          );
          backdrop-filter: blur(2px);
        }

        .mobile-menu-card {
          width: min(
            320px,
            88vw
          );
          height: 100%;
          background: #fff;
          padding: 20px;
          box-shadow: 10px 0 35px
            rgba(0, 0, 0, 0.16);
          display: flex;
          flex-direction: column;
          gap: 3px;
          animation: menuIn 0.25s
            cubic-bezier(
              0.2,
              0.8,
              0.2,
              1
            );
        }

        .mobile-menu-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--gold);
          padding-bottom: 17px;
          border-bottom: 1px solid #eee;
          margin-bottom: 7px;
        }

        .mobile-menu-head strong,
        .mobile-menu-head small {
          display: block;
        }

        .mobile-menu-head strong {
          font-size: 20px;
        }

        .mobile-menu-head small {
          color: #999;
          font-size: 8px;
          margin-top: 3px;
        }

        .mobile-menu-head button {
          border: 0;
          background: transparent;
        }

        .mobile-menu-card a,
        .mobile-theme {
          padding: 12px 5px;
          border: 0;
          border-bottom: 1px solid #f0ede6;
          background: transparent;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
        }

        .mobile-menu-card a:hover,
        .mobile-theme:hover {
          color: var(--gold);
        }

        .mobile-menu-divider {
          height: 1px;
          background: #eee8dd;
          margin: 9px 0;
        }

        /* -------------------------------------------------------------- */
        /* BACK TOP                                                         */
        /* -------------------------------------------------------------- */

        .back-top {
          position: fixed;
          right: 20px;
          bottom: 20px;
          width: 35px;
          height: 35px;
          border: 1px solid #e4d6b7;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          color: var(--gold);
          display: grid;
          place-items: center;
          z-index: 70;
          box-shadow: 0 7px 20px
            rgba(50, 38, 13, 0.08);
          backdrop-filter: blur(8px);
        }

        /* -------------------------------------------------------------- */
        /* ANIMATIONS                                                       */
        /* -------------------------------------------------------------- */

        .premium-reveal {
          animation: cardReveal 0.55s
            cubic-bezier(
              0.2,
              0.8,
              0.2,
              1
            )
            both;
        }

        .premium-reveal:nth-child(2) {
          animation-delay: 0.04s;
        }

        .premium-reveal:nth-child(3) {
          animation-delay: 0.08s;
        }

        .premium-reveal:nth-child(4) {
          animation-delay: 0.12s;
        }

        .premium-reveal:nth-child(5) {
          animation-delay: 0.16s;
        }

        @keyframes cardReveal {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(12px)
              scale(0.96);
          }

          to {
            opacity: 1;
            transform: translateY(0)
              scale(1);
          }
        }

        @keyframes menuIn {
          from {
            transform: translateX(-100%);
          }

          to {
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes stripShine {
          0% {
            transform: translateX(-120%);
          }

          25%,
          100% {
            transform: translateX(120%);
          }
        }

        @keyframes heroShine {
          0%,
          55% {
            transform: translateX(-110%);
          }

          75%,
          100% {
            transform: translateX(110%);
          }
        }

        /* -------------------------------------------------------------- */
        /* 1200                                                            */
        /* -------------------------------------------------------------- */

        @media (max-width: 1200px) {
          .container {
            width: min(
              1160px,
              calc(100% - 32px)
            );
          }

          .header-main {
            gap: 20px;
          }

          .logo-wrap {
            min-width: 185px;
          }

          .prime-logo {
            width: 155px;
          }

          .header-actions {
            gap: 14px;
          }

          .nav-inner {
            gap: 21px;
          }

          .hero-layout {
            grid-template-columns:
              minmax(0, 1fr)
              270px;
          }

          .five-columns {
            grid-template-columns: repeat(
              4,
              minmax(0, 1fr)
            );
          }

          .five-columns
            .product-card:nth-child(5) {
            display: none;
          }

          .smart-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .category-item {
            min-width: 86px;
          }
        }

        /* -------------------------------------------------------------- */
        /* 980                                                             */
        /* -------------------------------------------------------------- */

        @media (max-width: 980px) {
          .strip-center {
            display: none;
          }

          .strip-right {
            display: none;
          }

          .header-main {
            min-height: 72px;
          }

          .logo-wrap {
            min-width: auto;
          }

          .prime-logo {
            width: 145px;
          }

          .header-actions {
            gap: 10px;
          }

          .header-action.icon-action {
            display: none;
          }

          .mobile-menu-button {
            display: block;
          }

          .nav-bar {
            display: none;
          }

          .hero-layout {
            display: block;
          }

          .five-columns {
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            );
          }

          .five-columns
            .product-card:nth-child(4),
          .five-columns
            .product-card:nth-child(5) {
            display: none;
          }

          .promo-grid {
            grid-template-columns: 1fr 1fr;
          }

          .promo-card:last-child {
            display: none;
          }

          .flash-products {
            grid-template-columns: repeat(
              2,
              1fr
            );
          }
        }

        /* -------------------------------------------------------------- */
        /* 680                                                             */
        /* -------------------------------------------------------------- */

        @media (max-width: 680px) {
          .container {
            width: calc(100% - 20px);
          }

          .top-strip {
            font-size: 9px;
          }

          .strip-inner {
            min-height: 30px;
          }

          .strip-left {
            gap: 8px;
            overflow: hidden;
            white-space: nowrap;
          }

          .strip-left span:nth-of-type(3),
          .strip-left i:nth-of-type(2) {
            display: none;
          }

          .header-main {
            flex-wrap: wrap;
            gap: 8px;
            padding: 9px 0;
          }

          .logo-wrap {
            flex: 1;
          }

          .prime-logo {
            width: 132px;
          }

          .header-actions {
            display: none;
          }

          .search-box {
            order: 3;
            flex-basis: 100%;
            max-width: none;
            height: 40px;
          }

          .search-submit {
            padding: 0 16px;
          }

          .page-content {
            padding-top: 10px;
          }

          .hero-image-frame {
            aspect-ratio: 1.35 / 1;
            min-height: 235px;
            border-radius: 8px;
          }

          .hero-arrow {
            width: 32px;
            height: 32px;
          }

          .hero-left {
            left: 8px;
          }

          .hero-right {
            right: 8px;
          }

          .hero-counter {
            display: none;
          }

          .right-rail {
            grid-template-columns: 1fr;
          }

          .welcome-card,
          .smart-deal-card,
          .top-deals-card {
            grid-column: auto;
            grid-row: auto;
          }

          .category-section {
            margin: 18px 0 23px;
          }

          .section-mini-head strong {
            font-size: 15px;
          }

          .category-item {
            min-width: 79px;
            font-size: 8px;
          }

          .category-icon {
            width: 51px;
            height: 51px;
          }

          .category-item small {
            display: none;
          }

          .rail-control {
            display: none;
          }

          .section-head {
            align-items: flex-end;
          }

          .section-title {
            font-size: 15px;
          }

          .section-title > span {
            width: 28px;
            height: 28px;
          }

          .section-caption {
            display: none;
          }

          .five-columns {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
            gap: 10px;
          }

          .five-columns
            .product-card:nth-child(n) {
            display: block;
          }

          .product-image-wrap {
            height: 155px;
            padding: 14px;
          }

          .product-copy {
            padding-left: 9px;
            padding-right: 9px;
          }

          .product-name {
            font-size: 9px;
          }

          .price-row strong {
            font-size: 13px;
          }

          .smart-section {
            padding: 12px;
          }

          .smart-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .smart-card {
            min-height: 145px;
            padding: 11px;
          }

          .smart-card p {
            font-size: 7px;
          }

          .flash-header {
            flex-wrap: wrap;
            gap: 10px;
          }

          .flash-timer {
            margin-left: 0;
          }

          .flash-header > a {
            margin-left: auto;
          }

          .flash-products {
            grid-template-columns: 1fr;
          }

          .promo-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .promo-card {
            min-height: 120px;
          }

          .promo-card:last-child {
            display: flex;
          }

          .trust-strip {
            grid-template-columns: 1fr 1fr;
          }

          .trust-item:nth-child(2) {
            border-right: 0;
          }

          .trust-item:nth-child(-n + 2) {
            border-bottom: 1px solid #eeeae2;
          }

          .bottom-cta {
            padding: 24px;
            min-height: 190px;
          }

          .bottom-cta h2 {
            font-size: 22px;
          }

          .bottom-cta-actions {
            flex-wrap: wrap;
          }

          .toast {
            left: 15px;
            right: 15px;
            bottom: 15px;
            justify-content: center;
          }

          .back-top {
            display: none;
          }
        }

        /* -------------------------------------------------------------- */
        /* 430                                                             */
        /* -------------------------------------------------------------- */

        @media (max-width: 430px) {
          .hero-image-frame {
            aspect-ratio: 1.05 / 1;
          }

          .product-image-wrap {
            height: 142px;
          }

          .product-category {
            font-size: 7px;
          }

          .product-name {
            min-height: 28px;
          }

          .section-head > a {
            font-size: 8px;
          }

          .smart-grid {
            grid-template-columns: 1fr;
          }

          .smart-card {
            min-height: 125px;
          }

          .flash-title {
            font-size: 15px;
          }

          .flash-header > a {
            padding: 6px 8px;
          }

          .promo-card > div {
            max-width: 67%;
          }

          .promo-card h3 {
            font-size: 16px;
          }

          .promo-card > img {
            width: 38%;
          }

          .trust-item {
            padding: 9px 6px;
          }

          .trust-item > span {
            width: 32px;
            height: 32px;
          }

          .trust-item strong {
            font-size: 8px;
          }

          .trust-item small {
            font-size: 7px;
          }
        }


        /* -------------------------------------------------------------- */
        /* PRIME UPGRADE — POLISH + RESPONSIVE                            */
        /* -------------------------------------------------------------- */

        .page-content {
          padding-top: 14px;
          padding-bottom: 34px;
        }

        .hero-image-frame {
          border-radius: 16px;
          min-height: 0;
          max-height: none;
          aspect-ratio: 2.85 / 1;
          box-shadow: 0 12px 34px rgba(69, 49, 10, 0.10), 0 0 0 1px rgba(184, 137, 36, 0.10);
        }

        .hero-banner {
          object-fit: contain !important;
          background: #f8f3e9;
          cursor: pointer;
        }

        .hero-banner.active:focus-visible {
          outline: 3px solid rgba(199, 154, 59, 0.8);
          outline-offset: -3px;
        }

        .category-section, .smart-section, .promo-grid, .trust-section {
          margin-top: 22px;
        }

        .category-section, .smart-section, .trust-section {
          border: 1px solid var(--line);
          background: var(--card);
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(45, 36, 20, 0.035);
        }

        .category-section { padding: 15px 16px 14px; }
        .smart-section { padding: 18px; }
        .trust-section { padding: 18px; }

        .category-item {
          border: 1px solid #eee5d2;
          background: linear-gradient(180deg, #fff, #fcfaf5);
          border-radius: 13px;
          min-height: 102px;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
        }

        .category-item:hover {
          transform: translateY(-3px);
          border-color: #d9bc79;
          box-shadow: 0 10px 22px rgba(95, 69, 20, .08);
        }

        .smart-grid { gap: 12px; }
        .smart-card {
          border-radius: 15px;
          min-height: 190px;
          transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
        }
        .smart-card:hover { transform: translateY(-4px); box-shadow: 0 15px 30px rgba(91, 66, 18, .10); border-color: #d7b86d; }

        .product-card {
          border-radius: 14px;
          box-shadow: 0 6px 18px rgba(25, 22, 16, .045);
        }
        .product-image-wrap { height: 190px; background: linear-gradient(180deg, #fff, #fdfaf4); }
        .product-image { object-fit: contain; }
        .suggestion-product-image { width: 100%; height: 100%; object-fit: contain; }

        .flash-section {
          margin: 28px 0;
          border-radius: 18px;
          background: linear-gradient(135deg, #8f620d 0%, #c7922f 48%, #e1bc68 100%);
          box-shadow: 0 15px 34px rgba(139, 96, 13, .16);
        }
        .flash-header { padding: 17px 19px; }
        .flash-products { padding: 14px; gap: 12px; }
        .flash-product {
          min-height: 178px;
          border-radius: 13px;
          background: rgba(255,255,255,.97);
          color: #28231a;
          border: 1px solid rgba(255,255,255,.55);
          padding: 12px;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .flash-product:hover { transform: translateY(-4px); box-shadow: 0 12px 25px rgba(52, 37, 8, .15); }
        .flash-product-image { background: #fffaf0; border-radius: 10px; }
        .flash-product-img { width: 100%; height: 100%; object-fit: contain; }

        .promo-card {
          min-height: 205px;
          border-radius: 16px;
          box-shadow: 0 9px 24px rgba(43, 35, 21, .055);
          overflow: hidden;
        }
        .promo-product-image { max-width: 45%; max-height: 88%; object-fit: contain; }

        .section-head { margin-top: 27px; }

        .trust-strip { border-radius: 13px; }

        @media (max-width: 980px) {
          .hero-image-frame { aspect-ratio: 2.25 / 1; }
        }

        @media (max-width: 680px) {
          .container { width: calc(100% - 20px); }
          .page-content { padding-top: 10px; }
          .hero-image-frame { aspect-ratio: 1.72 / 1; border-radius: 11px; }
          .hero-arrow { width: 32px; height: 32px; }
          .hero-left { left: 8px; }
          .hero-right { right: 8px; }
          .category-section, .smart-section, .trust-section { border-radius: 12px; padding: 12px; }
          .product-image-wrap { height: 155px; padding: 12px; }
          .flash-header { flex-wrap: wrap; gap: 10px; }
          .flash-timer { margin-left: 0; }
          .flash-header > a { margin-left: auto; }
          .flash-products { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .flash-product { min-height: 160px; }
          .promo-card { min-height: 175px; }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }


        /* ============================================================ */
        /* PRIME CART V2 — PREMIUM WHITE + GOLD / MOBILE FIRST         */
        /* ============================================================ */

        :root {
          --gold: #b8872d;
          --gold-dark: #8f651b;
          --gold-2: #d7ad57;
          --gold-light: #fbf3df;
          --gold-pale: #fffaf0;
          --page: #fbfaf7;
          --paper: #ffffff;
          --ink: #181715;
          --muted: #746f66;
          --line: #e9e4da;
          --premium-shadow: 0 10px 30px rgba(83, 62, 21, .07);
          --premium-shadow-hover: 0 18px 42px rgba(83, 62, 21, .13);
        }

        body {
          overflow-x: hidden;
          background: var(--page);
        }

        .store-shell {
          min-height: 100vh;
          background:
            radial-gradient(circle at 50% -8%, rgba(215,173,87,.10), transparent 30%),
            var(--page);
        }

        .container {
          width: min(1440px, calc(100% - 40px));
          margin-inline: auto;
        }

        .top-strip {
          background: #181715 !important;
          color: #fffdf8;
          border-bottom: 1px solid rgba(215,173,87,.22);
        }

        .strip-inner {
          min-height: 34px;
        }

        .main-header {
          background: rgba(255,255,255,.96) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--line) !important;
          box-shadow: 0 4px 18px rgba(50,40,20,.035);
          position: sticky;
          top: 0;
          z-index: 80;
        }

        .header-main {
          min-height: 78px;
          gap: 20px;
        }

        .logo-wrap {
          flex-shrink: 0;
        }

        .prime-logo {
          max-width: 158px;
          max-height: 52px;
          object-fit: contain;
        }

        .logo-fallback {
          align-items: center;
        }

        .logo-mark {
          background: linear-gradient(145deg, #d7ad57, #a87520) !important;
          box-shadow: 0 8px 20px rgba(184,135,45,.24);
        }

        .logo-text {
          color: #8f651b !important;
        }

        .search-box {
          min-height: 46px;
          border: 1px solid #ded7ca !important;
          background: #fff !important;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.8);
          transition: .22s ease;
        }

        .search-box:focus-within,
        .search-box.search-active {
          border-color: var(--gold) !important;
          box-shadow: 0 0 0 4px rgba(184,135,45,.10), 0 8px 25px rgba(75,55,18,.08);
        }

        .search-submit {
          background: linear-gradient(135deg, #b8872d, #d3aa55) !important;
          color: #fff !important;
          border-radius: 9px !important;
          font-weight: 800;
        }

        .header-action {
          transition: transform .2s ease, color .2s ease, background .2s ease;
        }

        .header-action:hover {
          color: var(--gold-dark);
          transform: translateY(-1px);
        }

        .account-icon,
        .profile-avatar {
          background: var(--gold-light) !important;
          color: var(--gold-dark) !important;
          border: 1px solid #ead8ad;
        }

        .nav-bar {
          background: #fff !important;
          border-bottom: 1px solid var(--line) !important;
          position: sticky;
          top: 78px;
          z-index: 70;
        }

        .all-category-btn {
          background: #181715 !important;
          color: #fff !important;
          border-color: #181715 !important;
        }

        .nav-inner > a:hover,
        .nav-new:hover {
          color: var(--gold-dark) !important;
        }

        .page-content {
          padding-top: 18px !important;
        }

        .hero-carousel,
        .hero-image-frame {
          border-radius: 18px !important;
          overflow: hidden;
          box-shadow: 0 12px 35px rgba(56,43,17,.09);
        }

        .hero-image-frame {
          background: #fff;
          border: 1px solid rgba(184,135,45,.14);
        }

        .hero-banner {
          transition: opacity .65s ease, transform .8s ease !important;
        }

        .hero-arrow {
          background: rgba(255,255,255,.94) !important;
          color: #5e481e !important;
          border: 1px solid rgba(184,135,45,.25) !important;
          box-shadow: 0 7px 18px rgba(30,25,15,.10);
          backdrop-filter: blur(8px);
        }

        .hero-arrow:hover {
          background: #fff !important;
          color: var(--gold-dark) !important;
          transform: scale(1.06);
        }

        .hero-dots button.active {
          background: var(--gold) !important;
          width: 24px !important;
        }

        .category-section,
        .smart-section,
        .trust-section,
        .section-mini-head {
          background: rgba(255,255,255,.92) !important;
          border: 1px solid var(--line) !important;
          box-shadow: var(--premium-shadow);
        }

        .category-item {
          transition: transform .2s ease;
        }

        .category-item:hover {
          transform: translateY(-4px);
        }

        .category-icon {
          background: linear-gradient(145deg,#fffdf8,#fbf1dc) !important;
          border: 1px solid #ead9b4 !important;
          box-shadow: 0 8px 20px rgba(102,75,25,.07);
          color: var(--gold-dark) !important;
        }

        .smart-grid {
          gap: 14px;
        }

        .smart-card {
          background: linear-gradient(145deg,#fff,#fffaf0) !important;
          border: 1px solid #eadfca !important;
          box-shadow: var(--premium-shadow);
          overflow: hidden;
          position: relative;
        }

        .smart-card::after {
          content: "";
          position: absolute;
          width: 120px;
          height: 120px;
          right: -45px;
          bottom: -55px;
          border-radius: 50%;
          background: rgba(215,173,87,.13);
          pointer-events: none;
        }

        .smart-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--premium-shadow-hover);
          border-color: #d7b86d !important;
        }

        .smart-card-icon {
          background: #fff !important;
          color: var(--gold-dark) !important;
          border: 1px solid #ead9b4 !important;
        }

        .product-card {
          background: #fff !important;
          border: 1px solid var(--line) !important;
          box-shadow: var(--premium-shadow) !important;
          transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
          position: relative;
          overflow: hidden;
        }

        .product-card:hover {
          transform: translateY(-5px);
          border-color: #ddc48e !important;
          box-shadow: var(--premium-shadow-hover) !important;
        }

        .product-card-glow {
          position: absolute;
          inset: 0 0 auto 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #d7ad57, transparent);
          opacity: 0;
          transition: opacity .2s ease;
          pointer-events: none;
        }

        .product-card:hover .product-card-glow {
          opacity: 1;
        }

        .product-image-wrap {
          background: linear-gradient(180deg,#fff,#fcf8ef) !important;
        }

        .product-image {
          transition: transform .3s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.035);
        }

        .wish-btn {
          background: rgba(255,255,255,.96) !important;
          border: 1px solid #e8dfd0 !important;
          color: #6f695e !important;
          box-shadow: 0 5px 14px rgba(50,40,20,.07);
          z-index: 5;
        }

        .wish-btn:hover,
        .wish-btn.wished {
          color: #a97620 !important;
          border-color: #dec58e !important;
          background: #fffaf0 !important;
        }

        .discount-badge,
        .mini-badge {
          background: #fff8e8 !important;
          color: #956d16 !important;
          border: 1px solid #ecd9ad;
        }

        .rating-pill {
          background: #fff8e9 !important;
          color: #856019 !important;
        }

        .add-cart-btn {
          background: #181715 !important;
          color: #fff !important;
          border: 1px solid #181715 !important;
          transition: .2s ease;
        }

        .add-cart-btn:hover {
          background: linear-gradient(135deg,#b8872d,#d4ab56) !important;
          border-color: #b8872d !important;
          transform: translateY(-1px);
        }

        .flash-section {
          background: linear-gradient(135deg,#76500f 0%,#b8872d 48%,#d8af59 100%) !important;
          border: 1px solid rgba(255,255,255,.2);
          box-shadow: 0 16px 38px rgba(125,88,20,.18);
        }

        .flash-product {
          border: 1px solid rgba(184,135,45,.18) !important;
        }

        .promo-card {
          border: 1px solid var(--line) !important;
          box-shadow: var(--premium-shadow) !important;
        }

        .trust-item > span {
          background: var(--gold-light) !important;
          color: var(--gold-dark) !important;
          border: 1px solid #ead9b4;
        }

        .bottom-cta {
          border: 1px solid #d8bc79;
          box-shadow: 0 18px 45px rgba(112,79,20,.13);
        }

        .toast {
          background: #181715 !important;
          border: 1px solid #d7ad57 !important;
          box-shadow: 0 14px 35px rgba(20,17,10,.20);
        }

        .toast > span {
          color: #d7ad57 !important;
        }

        .mobile-bottom-nav {
          display: none;
        }

        /* TABLET */
        @media (max-width: 980px) {
          .container {
            width: min(100% - 28px, 900px);
          }

          .main-header {
            position: sticky;
            top: 0;
          }

          .nav-bar {
            display: none !important;
          }

          .hero-image-frame {
            border-radius: 14px !important;
          }

          .five-columns {
            gap: 12px !important;
          }
        }

        /* MOBILE */
        @media (max-width: 680px) {
          body {
            padding-bottom: 72px;
          }

          .container {
            width: calc(100% - 20px);
          }

          .top-strip {
            min-height: 29px;
          }

          .strip-inner {
            min-height: 29px;
          }

          .strip-left {
            width: 100%;
            justify-content: center;
          }

          .strip-left span {
            font-size: 9px !important;
          }

          .strip-left span:nth-of-type(2),
          .strip-left span:nth-of-type(3),
          .strip-left i {
            display: none !important;
          }

          .main-header {
            position: sticky;
            top: 0;
            z-index: 100;
          }

          .header-main {
            min-height: auto !important;
            padding: 9px 0 10px !important;
            gap: 8px !important;
          }

          .logo-wrap {
            min-width: 0;
          }

          .prime-logo {
            width: 126px !important;
            max-width: 126px;
          }

          .logo-fallback {
            transform: scale(.88);
            transform-origin: left center;
          }

          .mobile-menu-button {
            width: 40px !important;
            height: 40px !important;
            border-radius: 11px !important;
            background: #fffaf0 !important;
            color: #8f651b !important;
            border: 1px solid #ead9b4 !important;
          }

          .search-box {
            order: 4;
            flex-basis: 100%;
            width: 100%;
            min-height: 42px !important;
            height: 42px !important;
            border-radius: 12px !important;
          }

          .search-box input {
            font-size: 12px !important;
          }

          .search-submit {
            display: none !important;
          }

          .header-actions {
            display: flex !important;
            margin-left: auto;
          }

          .header-actions .account-area,
          .header-actions .login-action,
          .header-actions .icon-action span:not(.icon-with-badge) {
            display: none !important;
          }

          .header-actions .icon-action {
            display: flex !important;
            padding: 5px !important;
          }

          .header-actions .icon-action .icon-with-badge {
            display: inline-flex !important;
          }

          .header-actions .icon-action:nth-child(2) {
            display: none !important;
          }

          .page-content {
            padding-top: 10px !important;
            padding-bottom: 18px !important;
          }

          .hero-image-frame {
            aspect-ratio: 1.48 / 1 !important;
            min-height: 0 !important;
            border-radius: 13px !important;
          }

          .hero-arrow {
            width: 31px !important;
            height: 31px !important;
          }

          .hero-counter {
            display: none !important;
          }

          .hero-dots {
            bottom: 9px !important;
          }

          .hero-dots button {
            width: 6px !important;
            height: 6px !important;
          }

          .hero-dots button.active {
            width: 19px !important;
          }

          .category-section,
          .smart-section,
          .trust-section {
            border-radius: 14px !important;
            padding: 12px !important;
          }

          .category-rail {
            gap: 8px !important;
            overflow-x: auto !important;
            scrollbar-width: none;
            padding-bottom: 3px;
          }

          .category-rail::-webkit-scrollbar {
            display: none;
          }

          .category-item {
            min-width: 72px !important;
            flex: 0 0 72px;
          }

          .category-icon {
            width: 49px !important;
            height: 49px !important;
          }

          .category-item small {
            display: none !important;
          }

          .rail-control {
            display: none !important;
          }

          .section-head {
            margin-top: 20px !important;
            margin-bottom: 10px !important;
          }

          .section-title {
            font-size: 15px !important;
          }

          .section-title > span {
            width: 28px !important;
            height: 28px !important;
          }

          .section-caption {
            display: none !important;
          }

          .five-columns {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 9px !important;
          }

          .product-card {
            border-radius: 12px !important;
          }

          .product-image-wrap {
            height: 150px !important;
            padding: 10px !important;
          }

          .product-copy {
            padding: 8px 9px 10px !important;
          }

          .product-category {
            font-size: 7px !important;
          }

          .product-name {
            font-size: 10px !important;
            line-height: 1.35 !important;
            min-height: 28px !important;
          }

          .rating-row {
            margin-top: 5px !important;
          }

          .price-row strong {
            font-size: 13px !important;
          }

          .price-row del {
            font-size: 8px !important;
          }

          .add-cart-btn {
            min-height: 31px !important;
            font-size: 9px !important;
            margin-top: 7px !important;
          }

          .wish-btn {
            width: 29px !important;
            height: 29px !important;
            top: 7px !important;
            right: 7px !important;
          }

          .product-badges {
            left: 7px !important;
            top: 7px !important;
          }

          .discount-badge,
          .mini-badge {
            font-size: 7px !important;
            padding: 3px 5px !important;
          }

          .smart-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }

          .smart-card {
            min-height: 150px !important;
            padding: 12px !important;
            border-radius: 12px !important;
          }

          .smart-card h3 {
            font-size: 13px !important;
          }

          .smart-card p {
            font-size: 8px !important;
            line-height: 1.35 !important;
          }

          .smart-card-icon {
            width: 35px !important;
            height: 35px !important;
          }

          .flash-section {
            border-radius: 14px !important;
            margin: 22px 0 !important;
          }

          .flash-products {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
            padding: 9px !important;
          }

          .flash-product {
            min-height: 150px !important;
            border-radius: 11px !important;
            padding: 8px !important;
          }

          .flash-product-image {
            height: 85px !important;
          }

          .promo-grid {
            grid-template-columns: 1fr !important;
            gap: 9px !important;
          }

          .promo-card {
            min-height: 145px !important;
            border-radius: 13px !important;
          }

          .trust-strip {
            grid-template-columns: repeat(2, minmax(0,1fr)) !important;
          }

          .trust-item {
            min-width: 0 !important;
          }

          .bottom-cta {
            border-radius: 15px !important;
            min-height: 200px !important;
            padding: 22px !important;
          }

          .bottom-cta h2 {
            font-size: 22px !important;
          }

          .bottom-cta-actions {
            gap: 8px !important;
          }

          .bottom-cta-actions a {
            flex: 1;
            justify-content: center;
          }

          .mobile-bottom-nav {
            position: fixed;
            left: 8px;
            right: 8px;
            bottom: 8px;
            height: 60px;
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            align-items: center;
            padding: 5px;
            background: rgba(255,255,255,.97);
            border: 1px solid #e6dcc9;
            border-radius: 17px;
            box-shadow: 0 14px 35px rgba(34,27,14,.16);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            z-index: 200;
          }

          .mobile-bottom-item {
            min-width: 0;
            height: 50px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            color: #77736b;
            font-size: 8px;
            font-weight: 700;
            position: relative;
          }

          .mobile-bottom-item.active {
            color: #9a701d;
          }

          .mobile-bottom-item.active::before {
            content: "";
            position: absolute;
            top: 1px;
            width: 24px;
            height: 3px;
            border-radius: 99px;
            background: #b8872d;
          }

          .mobile-bottom-icon-wrap {
            position: relative;
            display: inline-flex;
          }

          .mobile-bottom-icon-wrap b {
            position: absolute;
            top: -7px;
            right: -9px;
            min-width: 15px;
            height: 15px;
            padding: 0 3px;
            display: grid;
            place-items: center;
            border-radius: 99px;
            background: #b8872d;
            color: white;
            font-size: 7px;
            border: 2px solid white;
          }

          .back-top {
            display: none !important;
          }
        }

        @media (max-width: 390px) {
          .container {
            width: calc(100% - 16px);
          }

          .prime-logo {
            width: 112px !important;
          }

          .header-actions {
            gap: 1px !important;
          }

          .hero-image-frame {
            aspect-ratio: 1.34 / 1 !important;
          }

          .product-image-wrap {
            height: 136px !important;
          }

          .smart-card {
            min-height: 140px !important;
            padding: 10px !important;
          }

          .smart-card h3 {
            font-size: 12px !important;
          }

          .flash-products {
            grid-template-columns: 1fr !important;
          }
        }

        html.dark .store-shell {
          background: #15130f;
        }

        html.dark .main-header,
        html.dark .nav-bar {
          background: rgba(31,27,20,.97) !important;
          border-color: #3c3325 !important;
        }

        html.dark .search-box {
          background: #211d16 !important;
          border-color: #4b402d !important;
        }

        html.dark .search-box input {
          color: #fff;
        }

        html.dark .product-card,
        html.dark .category-section,
        html.dark .smart-section,
        html.dark .trust-section,
        html.dark .section-mini-head {
          background: #201c15 !important;
          border-color: #3b3326 !important;
        }

        html.dark .product-image-wrap {
          background: linear-gradient(180deg,#272117,#211d16) !important;
        }

        html.dark .mobile-bottom-nav {
          background: rgba(31,27,20,.97);
          border-color: #4b402d;
        }

        html.dark .mobile-bottom-item {
          color: #b9b1a3;
        }

        html.dark .mobile-bottom-item.active {
          color: #d7ad57;
        }

        /* PRIME CART V3 — PREMIUM E-COMMERCE POLISH */
        .store-shell{background:radial-gradient(circle at 8% 0%,rgba(215,173,87,.09),transparent 26%),radial-gradient(circle at 94% 18%,rgba(184,135,45,.06),transparent 22%),#fcfcfa}
        .container{width:min(1440px,calc(100% - 48px))}
        .top-strip{background:#191713!important;color:#f7edda!important;min-height:34px}
        .strip-inner{min-height:34px}.strip-center{color:#e8c97e}.strip-left span,.strip-right span,.strip-center{font-size:10px;font-weight:650}
        .main-header{box-shadow:0 8px 30px rgba(33,25,13,.055)!important;border-bottom:1px solid rgba(184,137,45,.14)!important;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
        .header-main{min-height:82px}.logo-wrap{transition:transform .2s ease}.logo-wrap:hover{transform:translateY(-1px)}
        .prime-logo{object-fit:contain;object-position:left center;filter:drop-shadow(0 4px 10px rgba(184,137,45,.10))}
        .search-box{min-height:46px!important;border:1px solid #ded7ca!important;background:#fff!important;box-shadow:0 5px 18px rgba(42,34,20,.045);transition:border-color .2s,box-shadow .2s,transform .2s}
        .search-box:focus-within{border-color:rgba(184,137,45,.72)!important;box-shadow:0 0 0 4px rgba(184,137,45,.09),0 9px 25px rgba(42,34,20,.07);transform:translateY(-1px)}
        .search-submit{background:linear-gradient(135deg,#c79a3b,#a9781e)!important;box-shadow:0 5px 14px rgba(184,137,45,.20)}.search-submit:hover{filter:brightness(1.04);transform:translateY(-1px)}
        .nav-bar{border-top:1px solid rgba(184,137,45,.08)!important;border-bottom:1px solid #ebe6dc!important;box-shadow:0 4px 18px rgba(35,28,16,.035)!important}
        .nav-link{position:relative;transition:color .18s,background .18s,transform .18s}.nav-link:hover{transform:translateY(-1px)}
        .nav-link.active:after{content:"";position:absolute;left:14px;right:14px;bottom:3px;height:2px;border-radius:99px;background:#b88924}
        .hero-layout{gap:18px!important;margin-top:20px!important}.hero-carousel{border:1px solid rgba(184,137,45,.18)!important;border-radius:22px!important;overflow:hidden;box-shadow:0 18px 45px rgba(43,33,16,.11)!important;background:#fff}
        .hero-image-frame{background:linear-gradient(135deg,#fffdf8,#f6efe0)!important}.hero-image-frame img{transition:transform .8s cubic-bezier(.2,.7,.2,1),filter .35s}.hero-carousel:hover .hero-image-frame img{transform:scale(1.012)}
        .hero-shine{opacity:.35!important;pointer-events:none}.hero-arrow{width:38px!important;height:38px!important;border:1px solid rgba(255,255,255,.72)!important;box-shadow:0 8px 22px rgba(0,0,0,.14)!important;backdrop-filter:blur(10px)}
        .hero-dots button{transition:width .22s,transform .22s}.hero-dots button.active{width:24px!important;border-radius:99px!important}
        .category-section,.smart-section,.trust-section{border:1px solid rgba(218,211,198,.72)!important;box-shadow:0 10px 30px rgba(38,30,17,.035)!important}.category-section{background:rgba(255,255,255,.86)!important;border-radius:20px!important}
        .category-item{border:1px solid transparent;transition:transform .2s,border-color .2s,box-shadow .2s,background .2s}.category-item:hover{transform:translateY(-5px);border-color:rgba(184,137,45,.22);background:#fff;box-shadow:0 12px 25px rgba(44,34,17,.08)}.category-icon{box-shadow:0 6px 16px rgba(184,137,45,.10)}
        .smart-section{border-radius:20px!important;background:linear-gradient(180deg,#fff,#fffdf8)!important}.smart-card{position:relative;overflow:hidden;border:1px solid #ebe2d1!important;box-shadow:0 8px 22px rgba(43,33,18,.045)!important;transition:transform .22s,box-shadow .22s,border-color .22s!important}
        .smart-card:after{content:"";position:absolute;width:130px;height:130px;right:-55px;bottom:-70px;border-radius:50%;background:rgba(215,173,87,.10);pointer-events:none}.smart-card:hover{transform:translateY(-6px)!important;border-color:rgba(184,137,45,.38)!important;box-shadow:0 18px 32px rgba(43,33,18,.10)!important}
        .section-head{align-items:end;margin-bottom:16px!important}.section-title{font-size:clamp(19px,2vw,24px)!important;letter-spacing:-.025em}.section-caption{margin-top:4px;color:#888276}.section-head>a{border:1px solid #e6dccb;border-radius:999px;padding:8px 12px;background:#fff;transition:all .18s}.section-head>a:hover{color:#8d6416;border-color:#c9a45a;transform:translateX(2px)}
        .products-grid{gap:14px!important}.product-card{border:1px solid #ebe5d9!important;border-radius:18px!important;background:#fff!important;box-shadow:0 7px 22px rgba(41,32,17,.045)!important;overflow:hidden;transition:transform .24s,box-shadow .24s,border-color .24s!important}.product-card:hover{transform:translateY(-7px)!important;border-color:rgba(184,137,45,.32)!important;box-shadow:0 20px 35px rgba(41,32,17,.10)!important}
        .product-card-glow{opacity:0;transition:opacity .25s;background:radial-gradient(circle at 50% 0%,rgba(215,173,87,.14),transparent 65%)!important}.product-card:hover .product-card-glow{opacity:1}
        .wish-btn{z-index:4;width:34px!important;height:34px!important;background:rgba(255,255,255,.94)!important;border:1px solid #e8dfd0!important;box-shadow:0 7px 16px rgba(40,30,15,.08)!important;transition:transform .18s,color .18s,border-color .18s}.wish-btn:hover{transform:scale(1.07);color:#b88924;border-color:#d7b56c!important}.wish-btn.wished{color:#a87416!important;background:#fff7e8!important}
        .discount-badge{box-shadow:0 4px 10px rgba(67,138,82,.12)}.product-image-wrap{background:linear-gradient(180deg,#fffdf9,#f8f5ee)!important;border-bottom:1px solid #f0ece3}.product-image{transition:transform .35s cubic-bezier(.2,.7,.2,1)}.product-card:hover .product-image{transform:scale(1.055)}.image-view{background:rgba(25,22,17,.86)!important;border-radius:999px!important;backdrop-filter:blur(8px)}
        .product-copy{padding:13px!important}.product-category{color:#a47b2c!important;font-weight:750!important;letter-spacing:.07em!important}.product-name{line-height:1.35!important;min-height:38px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.rating-pill{box-shadow:0 3px 8px rgba(67,138,82,.12)}.price-row strong{font-size:19px!important;letter-spacing:-.02em}
        .add-cart-btn{min-height:38px;border-radius:11px!important;background:linear-gradient(135deg,#bd8c2e,#a87419)!important;box-shadow:0 7px 16px rgba(184,137,45,.16);transition:transform .18s,box-shadow .18s,filter .18s}.add-cart-btn:hover{transform:translateY(-2px);box-shadow:0 11px 20px rgba(184,137,45,.24);filter:brightness(1.04)}
        .flash-section{border:1px solid rgba(184,137,45,.22)!important;border-radius:22px!important;box-shadow:0 14px 35px rgba(43,33,17,.08)!important;overflow:hidden}.flash-header{background:linear-gradient(135deg,#17140f,#2b2418)!important}.flash-title strong{letter-spacing:-.02em}.flash-timer span{border:1px solid rgba(255,255,255,.12);box-shadow:inset 0 0 0 1px rgba(255,255,255,.03)}
        .flash-product{border:1px solid #e8dfcf!important;border-radius:16px!important;box-shadow:0 8px 20px rgba(38,28,13,.045);transition:transform .2s,box-shadow .2s}.flash-product:hover{transform:translateY(-5px);box-shadow:0 16px 28px rgba(38,28,13,.10)}
        .promo-card{border:1px solid rgba(218,207,186,.82)!important;border-radius:20px!important;box-shadow:0 10px 28px rgba(38,29,15,.055)!important;transition:transform .22s,box-shadow .22s;overflow:hidden}.promo-card:hover{transform:translateY(-5px);box-shadow:0 18px 34px rgba(38,29,15,.10)!important}.promo-card h3{letter-spacing:-.025em}.promo-product-image{transition:transform .35s}.promo-card:hover .promo-product-image{transform:scale(1.05) rotate(1deg)}
        .trust-section{border-radius:20px!important;background:#fff!important}.trust-item{transition:transform .18s}.trust-item:hover{transform:translateY(-2px)}.trust-item>span{box-shadow:0 7px 18px rgba(184,137,45,.12)}
        .bottom-cta{border:1px solid rgba(184,137,45,.28)!important;box-shadow:0 20px 45px rgba(41,31,15,.10)!important;border-radius:24px!important;overflow:hidden}.bottom-cta-content h2{letter-spacing:-.035em}.bottom-cta-actions a{box-shadow:0 8px 20px rgba(184,137,45,.18)}
        .toast{border:1px solid rgba(184,137,45,.24)!important;box-shadow:0 15px 35px rgba(30,23,12,.16)!important;backdrop-filter:blur(15px)}
        @media(max-width:1100px){.container{width:min(100% - 30px,1100px)}.strip-center,.strip-right{display:none!important}.header-main{gap:14px}.nav-inner{overflow-x:auto;scrollbar-width:none}.nav-inner::-webkit-scrollbar{display:none}}
        @media(max-width:680px){.store-shell{padding-bottom:78px}.container{width:calc(100% - 20px)}.top-strip{display:none!important}.main-header{position:sticky!important;top:0;z-index:180}.header-main{min-height:64px;padding:9px 0 8px!important;flex-wrap:wrap}.logo-wrap{flex:0 0 auto}.search-box{order:3;width:100%!important;min-height:42px!important}.hero-layout{margin-top:12px!important}.hero-carousel{border-radius:16px!important}.hero-arrow{width:32px!important;height:32px!important}.category-section,.smart-section,.trust-section,.flash-section,.bottom-cta{border-radius:16px!important}.section-head{margin-bottom:11px!important}.section-title{font-size:18px!important}.section-head>a{padding:6px 9px;font-size:10px}.products-grid.five-columns{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}.product-card{border-radius:14px!important}.product-copy{padding:10px!important}.product-image-wrap{min-height:142px}.product-name{font-size:12px!important;min-height:34px}.price-row strong{font-size:16px!important}.add-cart-btn{min-height:35px;font-size:10px!important}.flash-products{gap:9px!important}.promo-grid{gap:10px!important}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}
        html.dark .store-shell{background:radial-gradient(circle at 8% 0%,rgba(215,173,87,.08),transparent 26%),#15130f}html.dark .search-box,html.dark .section-head>a,html.dark .product-card,html.dark .promo-card,html.dark .category-section,html.dark .smart-section,html.dark .trust-section{box-shadow:0 10px 28px rgba(0,0,0,.18)!important}html.dark .product-image-wrap{border-color:#3b3327}html.dark .section-head>a{background:#211d17;border-color:#4b402d}html.dark .wish-btn{background:rgba(33,29,23,.94)!important;border-color:#51442f!important}


        /* ================================================================ */
        /* PRIME CART — FINAL PROFESSIONAL BRAND + HEADER + UI POLISH      */
        /* ================================================================ */
        .logo-wrap{
          min-width:248px!important;
          height:58px!important;
          display:flex!important;
          align-items:center!important;
          gap:12px!important;
          flex-shrink:0!important;
          padding:4px 2px!important;
          border-radius:16px!important;
          transition:transform .2s ease,opacity .2s ease!important;
        }
        .logo-wrap:hover{transform:translateY(-1px);opacity:.96}
        .brand-logo-box{
          width:52px;height:52px;min-width:52px;
          display:grid;place-items:center;
          border:1px solid rgba(199,154,59,.34);
          border-radius:15px;
          background:linear-gradient(145deg,#fff,#fbf3df);
          box-shadow:0 7px 20px rgba(92,68,24,.12),inset 0 0 0 4px rgba(255,255,255,.7);
          overflow:hidden;
        }
        .brand-logo-box .prime-logo{
          width:43px!important;height:43px!important;
          max-width:43px!important;
          object-fit:contain!important;
        }
        .brand-logo-fallback{
          width:100%;height:100%;display:grid;place-items:center;
          color:#b8872d;
        }
        .brand-copy{
          min-width:0;display:flex;flex-direction:column;
          justify-content:center;line-height:1;
        }
        .brand-name{
          display:block;color:#b8872d;
          font-size:25px;font-weight:900;
          letter-spacing:-1px;
          line-height:1.05;
          white-space:nowrap;
        }
        .brand-tagline{
          display:block;margin-top:6px;
          color:#8b8478;font-size:8px;
          font-weight:700;letter-spacing:1.35px;
          text-transform:uppercase;
          white-space:nowrap;
        }
        .main-header{
          background:rgba(255,255,255,.96)!important;
          backdrop-filter:blur(18px)!important;
          -webkit-backdrop-filter:blur(18px)!important;
          border-bottom:1px solid rgba(184,135,45,.16)!important;
          box-shadow:0 8px 26px rgba(50,38,17,.055)!important;
          position:relative;z-index:100!important;
        }
        .header-main{
          min-height:76px!important;
          gap:22px!important;
          align-items:center!important;
        }
        .search-box{
          height:48px!important;
          min-height:48px!important;
          border:1px solid #e5dfd2!important;
          border-radius:15px!important;
          background:#fff!important;
          box-shadow:0 5px 18px rgba(45,34,14,.055)!important;
          transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease!important;
        }
        .search-box:focus-within,.search-box.search-active{
          border-color:#c79a3b!important;
          box-shadow:0 0 0 4px rgba(199,154,59,.10),0 9px 25px rgba(45,34,14,.08)!important;
        }
        .search-submit{
          min-width:88px!important;height:38px!important;
          margin-right:4px!important;border-radius:11px!important;
          background:linear-gradient(135deg,#c79a3b,#ad7920)!important;
          box-shadow:0 6px 14px rgba(184,135,45,.22)!important;
          font-weight:800!important;
        }
        .header-actions{gap:13px!important}
        .header-action{
          min-height:42px!important;padding:5px 9px!important;
          border-radius:12px!important;
          transition:background .2s ease,color .2s ease,transform .2s ease!important;
        }
        .header-action:hover{
          background:#fbf5e8!important;color:#b8872d!important;
          transform:translateY(-1px);
        }
        .account-icon,.icon-with-badge{
          display:grid!important;place-items:center!important;
          position:relative!important;
        }
        .account-icon{
          width:37px;height:37px;border-radius:12px;
          background:#fbf4e4;color:#b8872d;
        }
        .icon-action{gap:6px!important;font-weight:750!important}
        .icon-action .icon-with-badge{width:31px;height:31px}
        .icon-with-badge b{
          position:absolute!important;top:-5px!important;right:-7px!important;
          min-width:16px!important;height:16px!important;padding:0 4px!important;
          display:grid!important;place-items:center!important;border-radius:99px!important;
          background:#b8872d!important;color:#fff!important;font-size:8px!important;
          border:2px solid #fff!important;
        }
        .nav-bar{
          background:rgba(255,255,255,.98)!important;
          border-bottom:1px solid #eee8dc!important;
          box-shadow:0 3px 12px rgba(50,38,17,.035)!important;
        }
        .nav-inner{height:50px!important;gap:25px!important}
        .nav-inner>a,.more-nav{font-weight:650!important}
        .all-category-btn{
          height:34px!important;padding:0 14px!important;border-radius:10px!important;
          background:#191713!important;color:#fff!important;
          box-shadow:0 5px 13px rgba(25,23,19,.14)!important;
        }
        .all-category-btn svg{color:#d7ad57}
        .nav-new em{
          background:#fbf0d8!important;color:#a56f16!important;
          border:1px solid #ecd39d!important;border-radius:99px!important;
        }
        .section-head>a{
          border:1px solid rgba(184,135,45,.22)!important;
          background:#fffaf0!important;color:#a56f16!important;
          border-radius:10px!important;
        }
        .category-section,.smart-section,.flash-section,.trust-section,.product-card,.promo-card{
          border-color:rgba(184,135,45,.14)!important;
        }
        .product-card{
          box-shadow:0 8px 24px rgba(52,39,16,.055)!important;
          transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease!important;
        }
        .product-card:hover{
          transform:translateY(-5px)!important;
          box-shadow:0 18px 36px rgba(52,39,16,.12)!important;
          border-color:rgba(184,135,45,.32)!important;
        }
        .product-image-wrap{background:linear-gradient(180deg,#fffdf8,#f8f4eb)!important}
        .add-cart-btn{
          border-radius:10px!important;
          background:linear-gradient(135deg,#c79a3b,#ad7920)!important;
          box-shadow:0 6px 14px rgba(184,135,45,.18)!important;
        }
        .wish-btn{border-radius:10px!important}
        .smart-card,.promo-card,.trust-item{transition:transform .2s ease,box-shadow .2s ease!important}
        .smart-card:hover,.promo-card:hover{transform:translateY(-3px)!important}

        @media(max-width:1200px){
          .logo-wrap{min-width:225px!important}
          .brand-name{font-size:23px}
          .header-main{gap:15px!important}
        }
        @media(max-width:980px){
          .logo-wrap{min-width:210px!important}
          .brand-logo-box{width:46px;height:46px;min-width:46px;border-radius:13px}
          .brand-logo-box .prime-logo{width:38px!important;height:38px!important}
          .brand-name{font-size:21px}
          .brand-tagline{font-size:7px;letter-spacing:1px}
          .header-main{min-height:68px!important}
        }
        @media(max-width:680px){
          .main-header{position:sticky!important;top:0!important}
          .header-main{
            min-height:0!important;padding:8px 0 9px!important;
            display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;
            gap:8px 9px!important;
          }
          .logo-wrap{
            min-width:0!important;height:46px!important;gap:9px!important;
          }
          .brand-logo-box{width:42px;height:42px;min-width:42px;border-radius:12px}
          .brand-logo-box .prime-logo{width:35px!important;height:35px!important}
          .brand-name{font-size:19px;letter-spacing:-.6px}
          .brand-tagline{font-size:6.5px;margin-top:5px;letter-spacing:.9px}
          .mobile-menu-button{
            display:grid!important;place-items:center!important;
            width:42px!important;height:42px!important;
            border:1px solid #e8dfce!important;border-radius:12px!important;
            background:#fffaf0!important;color:#a97925!important;
          }
          .search-box{
            order:initial!important;grid-column:1/-1!important;
            width:100%!important;max-width:none!important;height:43px!important;min-height:43px!important;
            border-radius:13px!important;
          }
          .search-submit{min-width:68px!important;height:35px!important;font-size:10px!important}
          .header-actions{display:none!important}
          .nav-bar{display:none!important}
        }
        @media(max-width:390px){
          .brand-name{font-size:18px}
          .brand-tagline{font-size:6px}
          .brand-logo-box{width:40px;height:40px;min-width:40px}
          .mobile-menu-button{width:40px!important;height:40px!important}
        }
        html.dark .main-header{
          background:rgba(31,27,20,.97)!important;
          border-color:#3c3325!important;
          box-shadow:0 8px 25px rgba(0,0,0,.2)!important;
        }
        html.dark .brand-logo-box{
          background:linear-gradient(145deg,#29231a,#211d16)!important;
          border-color:#51432b!important;
        }
        html.dark .brand-name{color:#d7ad57!important}
        html.dark .brand-tagline{color:#aaa08e!important}
        html.dark .header-action:hover{background:#2b251c!important;color:#d7ad57!important}
        html.dark .mobile-menu-button{background:#29231b!important;border-color:#4b402d!important;color:#d7ad57!important}
        html.dark .nav-bar{background:#1f1b14!important;border-color:#3c3325!important}


/* ========================================================================== */
/* PRIME CART V5 — FULL STOREFRONT EXPERIENCE                                 */
/* ========================================================================== */
:root{
  --pc-gold:#b88932;
  --pc-gold-deep:#956d1f;
  --pc-gold-light:#f4e5bd;
  --pc-ink:#211d16;
  --pc-muted:#756d60;
  --pc-line:#ebe5d9;
  --pc-paper:#fffdf9;
  --pc-card:#ffffff;
  --pc-soft:#faf7ef;
  --pc-shadow:0 12px 34px rgba(54,42,21,.07);
  --pc-shadow-hover:0 20px 48px rgba(54,42,21,.13);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:#f7f5ef!important;color:var(--pc-ink)}
.store-shell{min-height:100vh;background:linear-gradient(180deg,#fbfaf7 0%,#f6f4ee 100%)!important;overflow-x:hidden}
.container{width:min(1480px,calc(100% - 64px))!important}

/* TOP BAR */
.top-strip{background:#252016!important;color:#f8f0df!important;border-bottom:1px solid rgba(255,255,255,.07);font-size:11px;letter-spacing:.01em}
.strip-inner{min-height:36px!important}
.strip-left span,.strip-center,.strip-right span{display:inline-flex;align-items:center;gap:7px}
.strip-left i,.strip-right i{opacity:.25}
.strip-right b{color:#f1cf82}

/* MAIN HEADER */
.main-header{background:rgba(255,255,255,.96)!important;border-bottom:1px solid var(--pc-line)!important;box-shadow:0 5px 24px rgba(42,33,18,.045)!important;backdrop-filter:blur(18px);position:sticky!important;top:0;z-index:160}
.header-main{min-height:82px!important;gap:24px!important;display:flex;align-items:center}
.logo-wrap{display:flex!important;align-items:center!important;gap:11px!important;min-width:238px!important;flex-shrink:0;text-decoration:none!important}
.brand-logo-box{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;overflow:hidden;background:linear-gradient(145deg,#fffaf0,#f3e3bc);border:1px solid #ead7aa;box-shadow:0 7px 18px rgba(184,137,45,.14);flex-shrink:0}
.prime-logo{width:42px!important;height:42px!important;object-fit:contain!important;display:block}
.brand-logo-fallback{display:grid;place-items:center;color:var(--pc-gold)}
.brand-copy{display:flex;flex-direction:column;min-width:0;line-height:1}
.brand-name{font-size:22px!important;font-weight:900!important;letter-spacing:-.055em!important;color:#201b13!important;line-height:1.05!important}
.brand-tagline{font-size:9px!important;font-weight:700!important;letter-spacing:.105em!important;text-transform:uppercase!important;color:#9a8864!important;margin-top:7px!important;white-space:nowrap}
.search-box{height:48px!important;flex:1;max-width:720px!important;border:1px solid #ded7c9!important;background:#faf9f6!important;border-radius:15px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.9)!important;padding-left:15px!important;transition:.22s ease!important}
.search-box:focus-within,.search-box.search-active{border-color:#cba45e!important;box-shadow:0 0 0 4px rgba(200,159,81,.11)!important;background:#fff!important}
.search-box input{font-size:13px!important;color:#302a20!important}
.search-box>svg{color:#9b8b6c!important}
.search-submit{height:38px!important;border-radius:11px!important;padding:0 18px!important;background:linear-gradient(135deg,#c79a3b,#a97924)!important;box-shadow:0 7px 16px rgba(169,121,36,.18)!important;font-size:11px!important;font-weight:800!important;letter-spacing:.01em}
.search-submit:hover{transform:translateY(-1px);box-shadow:0 10px 22px rgba(169,121,36,.25)!important}
.header-actions{gap:7px!important;margin-left:auto}
.header-action{border:1px solid transparent!important;border-radius:13px!important;transition:.2s ease!important}
.header-action:hover{background:#fbf6ea!important;border-color:#eadbbd!important;color:var(--pc-gold-deep)!important;transform:translateY(-1px)}
.header-action .action-label{font-size:10px!important;font-weight:800!important}
.mobile-menu-button{border:1px solid #e4d8c0!important;background:#fffaf0!important;color:#8b671f!important;border-radius:12px!important}

/* NAV */
.nav-bar{background:#fff!important;border-bottom:1px solid #eee8dd!important;box-shadow:0 3px 14px rgba(40,30,15,.025)!important}
.nav-inner{min-height:45px!important;gap:27px!important}
.nav-inner>a{font-size:11px!important;font-weight:750!important;color:#51493c!important;position:relative;padding:14px 0!important}
.nav-inner>a:hover{color:var(--pc-gold-deep)!important}
.nav-inner>a:first-child{color:var(--pc-gold-deep)!important}

/* CONTENT */
.page-content{padding-top:22px!important}

/* HERO */
.hero-layout{gap:16px!important;margin-bottom:22px!important}
.hero-carousel{background:#fff!important;border:1px solid var(--pc-line)!important;border-radius:22px!important;box-shadow:var(--pc-shadow)!important;overflow:hidden!important}
.hero-image-frame{background:#f4f1e9!important;border-radius:20px!important;overflow:hidden!important}
.hero-banner{object-fit:contain!important;background:#f5f2eb!important;transition:transform .5s ease!important}
.hero-carousel:hover .hero-banner{transform:scale(1.012)}
.hero-arrow{width:38px!important;height:38px!important;border:1px solid rgba(255,255,255,.7)!important;background:rgba(255,255,255,.9)!important;color:#5d4a28!important;box-shadow:0 7px 20px rgba(0,0,0,.1)!important;backdrop-filter:blur(10px)}
.hero-arrow:hover{background:#fff!important;color:var(--pc-gold-deep)!important;transform:scale(1.04)}
.hero-dots span{width:7px!important;height:7px!important;border-radius:99px!important;background:#d8d0c0!important}
.hero-dots span.active{width:22px!important;background:var(--pc-gold)!important}
.right-rail{gap:12px!important}
.welcome-card,.smart-deal-card,.top-deals-card{border:1px solid var(--pc-line)!important;border-radius:18px!important;box-shadow:var(--pc-shadow)!important;background:#fff!important}

/* CATEGORY */
.category-section{background:#fff!important;border:1px solid var(--pc-line)!important;border-radius:20px!important;box-shadow:var(--pc-shadow)!important;padding:18px 20px!important;margin:0 0 24px!important}
.section-mini-head{margin-bottom:14px!important}
.section-mini-head strong{font-size:17px!important;letter-spacing:-.025em!important;color:#282219!important}
.category-rail{gap:12px!important}
.category-item{min-width:92px!important;padding:7px 5px 9px!important;border-radius:15px!important;transition:.22s ease!important;color:#403a30!important}
.category-item:hover{background:#fcf6e9!important;color:var(--pc-gold-deep)!important;transform:translateY(-3px)}
.category-icon{width:58px!important;height:58px!important;border:1px solid #eee3cb!important;background:linear-gradient(145deg,#fffdf8,#f7f0df)!important;box-shadow:0 6px 16px rgba(86,64,28,.07)!important;color:#a77a27!important}
.category-item small{font-size:9px!important;color:#9a9285!important}
.rail-control{border:1px solid #e6ddcd!important;background:#fff!important;color:#8a6828!important;box-shadow:0 5px 13px rgba(56,43,23,.06)!important}

/* SECTION HEADERS */
.section-head{margin:0 0 14px!important}
.section-title{font-size:21px!important;font-weight:900!important;letter-spacing:-.04em!important;color:#282219!important}
.section-title>span{width:34px!important;height:34px!important;border-radius:11px!important;background:#f8eed8!important;border:1px solid #ead8ae!important;color:#a47628!important}
.section-caption{font-size:11px!important;color:#948b7d!important;margin-top:5px!important}
.section-head>a{border:1px solid #e5d9c2!important;background:#fff!important;border-radius:10px!important;padding:8px 11px!important;color:#8b681f!important;font-size:10px!important;font-weight:800!important;transition:.2s ease!important}
.section-head>a:hover{background:#fbf4e5!important;border-color:#d9bd7d!important;transform:translateX(2px)}

/* PRODUCT GRID */
.products-grid.five-columns{grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:15px!important}
.product-card{position:relative!important;background:#fff!important;border:1px solid #e9e3d9!important;border-radius:18px!important;overflow:hidden!important;box-shadow:0 7px 24px rgba(48,37,18,.055)!important;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease!important}
.product-card:hover{transform:translateY(-6px)!important;box-shadow:var(--pc-shadow-hover)!important;border-color:#dfc995!important}
.product-card-glow{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% -10%,rgba(216,180,100,.11),transparent 35%);opacity:0;transition:.25s ease;z-index:0}
.product-card:hover .product-card-glow{opacity:1}
.wish-btn{width:34px!important;height:34px!important;right:10px!important;top:10px!important;background:rgba(255,255,255,.94)!important;border:1px solid #eadfce!important;box-shadow:0 5px 15px rgba(45,35,18,.08)!important;z-index:4!important;color:#756b5b!important}
.wish-btn:hover,.wish-btn.wished{color:#b7862e!important;border-color:#d9bd7d!important;background:#fffaf0!important}
.product-badges{left:10px!important;top:10px!important;z-index:3!important;gap:5px!important}
.discount-badge{border-radius:7px!important;background:#2d261a!important;color:#f9e8bc!important;font-size:8px!important;font-weight:900!important;padding:5px 7px!important}
.mini-badge{border-radius:7px!important;background:#f8edda!important;color:#8a641f!important;border:1px solid #e8d5ad!important;font-size:8px!important;font-weight:800!important;padding:5px 7px!important}
.product-image-wrap{height:228px!important;background:linear-gradient(180deg,#fcfbf8,#f7f4ed)!important;border-bottom:1px solid #eee7db!important;padding:22px!important;position:relative!important}
.product-image{width:100%!important;height:100%!important;object-fit:contain!important;transition:transform .3s ease!important}
.product-card:hover .product-image{transform:scale(1.045)}
.image-view{opacity:0!important;transform:translateY(5px);transition:.22s ease!important;position:absolute!important;bottom:10px!important;left:50%!important;transform:translate(-50%,5px)!important;background:rgba(35,29,20,.88)!important;color:#fff!important;border-radius:99px!important;padding:6px 10px!important;font-size:8px!important;font-weight:800!important;white-space:nowrap!important}
.product-card:hover .image-view{opacity:1!important;transform:translate(-50%,0)!important}
.product-copy{padding:14px!important}
.product-category{font-size:9px!important;font-weight:800!important;letter-spacing:.05em!important;text-transform:uppercase!important;color:#a28f6b!important;margin-bottom:5px!important}
.product-name{font-size:13px!important;line-height:1.35!important;font-weight:750!important;color:#30291f!important;min-height:36px!important}
.product-name:hover{color:#a27425!important}
.rating-row{margin-top:8px!important}
.rating-pill{background:#3e6d45!important;color:#fff!important;border-radius:5px!important;padding:4px 6px!important;font-size:9px!important;font-weight:800!important}
.review-count{font-size:9px!important;color:#9b9387!important}
.price-row{margin-top:9px!important;gap:7px!important}
.price-row strong{font-size:18px!important;letter-spacing:-.03em!important;color:#201b14!important}
.price-row del{font-size:10px!important;color:#aaa297!important}
.stock-warning{font-size:8px!important;color:#b36c2c!important;margin-top:6px!important}
.stock-warning span{width:5px!important;height:5px!important;background:#d88332!important}
.add-cart-btn{height:36px!important;border-radius:10px!important;margin-top:11px!important;background:linear-gradient(135deg,#c79a3b,#aa7927)!important;box-shadow:0 7px 15px rgba(170,121,39,.16)!important;font-size:10px!important;font-weight:850!important;transition:.2s ease!important}
.add-cart-btn:hover{filter:brightness(1.03);transform:translateY(-1px);box-shadow:0 10px 20px rgba(170,121,39,.23)!important}

/* SMART FEATURES */
.smart-section{background:linear-gradient(135deg,#fffdf8,#faf5e8)!important;border:1px solid #e8ddc7!important;border-radius:22px!important;box-shadow:var(--pc-shadow)!important;padding:22px!important;margin-top:25px!important}
.smart-grid{gap:13px!important}
.smart-card{min-height:210px!important;border:1px solid #e9dec7!important;border-radius:17px!important;background:rgba(255,255,255,.82)!important;padding:18px!important;box-shadow:0 7px 20px rgba(65,48,20,.045)!important;transition:.25s ease!important}
.smart-card:hover{transform:translateY(-4px)!important;border-color:#d9bc79!important;box-shadow:0 16px 32px rgba(65,48,20,.09)!important}
.smart-card-icon{width:43px!important;height:43px!important;border-radius:13px!important;background:#f7ead0!important;border:1px solid #ead6a9!important;color:#9d7125!important}
.smart-badge{border-radius:99px!important;background:#2c2519!important;color:#f7e7bd!important;font-size:8px!important;padding:4px 7px!important}
.smart-card-eyebrow{font-size:8px!important;letter-spacing:.08em!important;color:#a18b65!important}
.smart-card h3{font-size:17px!important;letter-spacing:-.025em!important;color:#282219!important;margin-top:6px!important}
.smart-card p{font-size:10px!important;line-height:1.55!important;color:#81786b!important}
.smart-card-link{font-size:9px!important;color:#9b6e22!important;font-weight:850!important}

/* FLASH DEALS */
.flash-section{background:#fff!important;border:1px solid var(--pc-line)!important;border-radius:22px!important;box-shadow:var(--pc-shadow)!important;padding:20px!important;margin-top:25px!important}
.flash-header{border-bottom:1px solid #eee7dc!important;padding-bottom:15px!important;margin-bottom:15px!important}
.flash-title{font-size:20px!important;font-weight:900!important;letter-spacing:-.035em!important}
.flash-timer{background:#292217!important;border-radius:10px!important;padding:6px 9px!important;color:#f5dfad!important}
.flash-products{gap:13px!important}
.flash-product{border:1px solid #eae3d7!important;background:#fff!important;border-radius:15px!important;box-shadow:0 6px 20px rgba(52,39,18,.045)!important;transition:.22s ease!important}
.flash-product:hover{transform:translateY(-4px)!important;box-shadow:0 15px 30px rgba(52,39,18,.1)!important}
.flash-section{position:relative!important;isolation:isolate!important;animation:pcSectionIn .65s ease both!important}
.flash-section:before{content:"";position:absolute;inset:0 auto auto 0;width:180px;height:180px;background:radial-gradient(circle,rgba(215,177,94,.13),transparent 70%);pointer-events:none;z-index:-1}
.flash-products{grid-template-columns:repeat(6,minmax(0,1fr))!important;overflow:visible!important}
.flash-product{position:relative!important;min-height:92px!important;overflow:hidden!important;animation:pcFlashIn .55s cubic-bezier(.2,.8,.2,1) both!important}
.flash-product:nth-child(1){animation-delay:.04s!important}.flash-product:nth-child(2){animation-delay:.09s!important}.flash-product:nth-child(3){animation-delay:.14s!important}.flash-product:nth-child(4){animation-delay:.19s!important}.flash-product:nth-child(5){animation-delay:.24s!important}.flash-product:nth-child(6){animation-delay:.29s!important}
.flash-product-image{position:relative!important;flex:0 0 58px!important;width:58px!important;height:58px!important;background:#faf8f3!important;border-radius:11px!important;border:1px solid #eee5d7!important;overflow:hidden!important}
.flash-product-img{width:100%!important;height:100%!important;object-fit:contain!important;padding:5px!important;transition:transform .35s ease!important}
.flash-product:hover .flash-product-img{transform:scale(1.08)!important}
.flash-product-copy{min-width:0!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:2px!important}
.flash-product-copy strong{display:block!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;font-size:11px!important;color:#2f281e!important}
.flash-product-copy span{font-size:12px!important;font-weight:900!important;color:#a97820!important}
.flash-category-label{font-size:7px!important;text-transform:uppercase!important;letter-spacing:.09em!important;font-weight:900!important;color:#9b7a43!important}
.flash-number{position:absolute!important;left:4px!important;top:4px!important;z-index:2!important;width:18px!important;height:18px!important;border-radius:6px!important;display:grid!important;place-items:center!important;background:#c79a3b!important;color:#fff!important;font-size:7px!important;font-weight:900!important;box-shadow:0 4px 9px rgba(137,96,26,.18)!important}
@keyframes pcFlashIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes pcSectionIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

/* PROMO CARDS */
.promo-grid{gap:15px!important;margin-top:25px!important}
.promo-card{min-height:230px!important;border:1px solid #e6dcc9!important;border-radius:20px!important;box-shadow:var(--pc-shadow)!important;overflow:hidden!important;transition:.25s ease!important}
.promo-card:hover{transform:translateY(-4px)!important;box-shadow:var(--pc-shadow-hover)!important}
.promo-card h3{font-size:22px!important;letter-spacing:-.04em!important}
.promo-card p{font-size:10px!important;line-height:1.55!important;color:#82786b!important;max-width:270px}
.promo-card>a{border-radius:10px!important;background:#282219!important;color:#fff!important;padding:9px 12px!important;font-size:9px!important;font-weight:800!important}
.promo-icon{width:42px!important;height:42px!important;border-radius:12px!important;background:#f8edd8!important;color:#9d7125!important}
.promo-product-image{max-width:42%!important;object-fit:contain!important}

/* TRUST */
.trust-section{background:#fff!important;border:1px solid var(--pc-line)!important;border-radius:20px!important;box-shadow:var(--pc-shadow)!important;padding:20px!important;margin-top:25px!important}
.trust-heading strong{font-size:20px!important;letter-spacing:-.035em!important}
.trust-strip{border:0!important;background:#faf8f3!important;border-radius:15px!important;padding:6px!important;gap:4px!important}
.trust-item{padding:15px!important;border-radius:12px!important;transition:.2s ease!important}
.trust-item:hover{background:#fff!important;box-shadow:0 6px 17px rgba(52,39,18,.06)!important}
.trust-item>span{width:42px!important;height:42px!important;border-radius:12px!important;background:#f7ecd5!important;color:#9d7125!important}
.trust-item strong{font-size:11px!important;color:#31291e!important}
.trust-item small{font-size:9px!important;color:#948b80!important}

/* CTA */
.bottom-cta{margin-top:25px!important;border-radius:23px!important;border:1px solid #d9bf83!important;background:linear-gradient(135deg,#30291e,#1f1a13)!important;box-shadow:0 20px 50px rgba(44,33,17,.14)!important;overflow:hidden!important}
.bottom-cta-content{padding:40px!important}
.bottom-cta-content h2{font-size:34px!important;letter-spacing:-.05em!important;color:#fff8e8!important}
.bottom-cta-content p{color:#c7bdab!important}
.bottom-cta-actions a{border-radius:11px!important;background:#d0a14b!important;color:#211b12!important;font-weight:850!important;box-shadow:0 9px 22px rgba(0,0,0,.14)!important}
.bottom-cta-actions a.secondary{background:rgba(255,255,255,.08)!important;color:#f8edd7!important;border-color:rgba(255,255,255,.18)!important}

/* SEARCH DROPDOWN */
.search-dropdown{border:1px solid #e3d9c7!important;border-radius:15px!important;box-shadow:0 20px 45px rgba(44,34,18,.14)!important;background:#fff!important;overflow:hidden!important}
.search-dropdown-title{background:#fbf8f1!important;border-bottom:1px solid #eee6d9!important}
.search-dropdown button:hover{background:#fcf7ed!important}
.suggestion-image{border:1px solid #eee5d7!important;background:#faf8f2!important;border-radius:9px!important}

/* MOBILE BOTTOM NAV */
.mobile-bottom-nav{background:rgba(255,255,255,.97)!important;border:1px solid #e5dccd!important;box-shadow:0 -8px 30px rgba(41,31,15,.1)!important;backdrop-filter:blur(18px)!important}
.mobile-bottom-item{font-size:8px!important;font-weight:750!important;color:#8e8578!important}
.mobile-bottom-item.active{color:#a27526!important}
.mobile-bottom-icon-wrap b{background:#b8872d!important}

/* MOBILE */
@media(max-width:1200px){
  .container{width:min(100% - 38px,1120px)!important}
  .products-grid.five-columns{grid-template-columns:repeat(4,minmax(0,1fr))!important}
  .five-columns .product-card:nth-child(5){display:none}
  .product-image-wrap{height:210px!important}
}
@media(max-width:900px){
  .container{width:calc(100% - 28px)!important}
  .header-main{min-height:74px!important;gap:12px!important}
  .logo-wrap{min-width:205px!important}
  .brand-logo-box{width:43px;height:43px;border-radius:13px}
  .prime-logo{width:38px!important;height:38px!important}
  .brand-name{font-size:19px!important}
  .brand-tagline{font-size:8px!important}
  .search-box{max-width:none!important}
  .products-grid.five-columns{grid-template-columns:repeat(3,minmax(0,1fr))!important}
  .five-columns .product-card:nth-child(n+4){display:none}
  .product-image-wrap{height:190px!important}
}
@media(max-width:680px){
  body{background:#f8f6f1!important}
  .container{width:calc(100% - 18px)!important}
  .top-strip{display:none!important}
  .main-header{position:sticky!important;top:0!important;padding:0!important}
  .header-main{min-height:auto!important;padding:9px 0 10px!important;gap:9px!important;display:grid!important;grid-template-columns:minmax(0,1fr) auto!important}
  .logo-wrap{min-width:0!important;gap:8px!important}
  .brand-logo-box{width:39px;height:39px;border-radius:11px}
  .prime-logo{width:35px!important;height:35px!important}
  .brand-name{font-size:18px!important;letter-spacing:-.045em!important}
  .brand-tagline{font-size:7px!important;margin-top:5px!important;letter-spacing:.08em!important}
  .header-actions{display:flex!important;gap:4px!important}
  .header-action{width:36px!important;height:36px!important;padding:0!important;display:grid!important;place-items:center!important}
  .header-action .action-label{display:none!important}
  .mobile-menu-button{width:36px!important;height:36px!important;display:grid!important;place-items:center!important}
  .search-box{grid-column:1/-1!important;order:initial!important;width:100%!important;height:43px!important;border-radius:12px!important}
  .search-submit{height:34px!important;padding:0 12px!important;font-size:9px!important}
  .search-box input{font-size:11px!important}
  .nav-bar{display:none!important}
  .page-content{padding-top:10px!important}
  .hero-layout{margin-bottom:14px!important}
  .hero-carousel{border-radius:15px!important}
  .hero-image-frame{height:clamp(180px,48vw,260px)!important;min-height:0!important;aspect-ratio:auto!important;border-radius:14px!important}
  .hero-banner{object-fit:contain!important}
  .hero-arrow{width:30px!important;height:30px!important}
  .right-rail{margin-top:10px!important}
  .category-section{padding:14px 11px!important;border-radius:16px!important;margin-bottom:16px!important}
  .section-mini-head strong{font-size:15px!important}
  .category-rail{gap:6px!important;overflow-x:auto!important;scrollbar-width:none!important;padding-bottom:2px!important}
  .category-rail::-webkit-scrollbar{display:none}
  .category-item{min-width:76px!important}
  .category-icon{width:49px!important;height:49px!important}
  .section-head{margin-bottom:10px!important}
  .section-title{font-size:17px!important}
  .section-title>span{width:30px!important;height:30px!important}
  .section-caption{display:none!important}
  .section-head>a{font-size:9px!important;padding:6px 8px!important}
  .products-grid.five-columns{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}
  .five-columns .product-card:nth-child(n){display:block!important}
  .product-card{border-radius:14px!important}
  .product-image-wrap{height:158px!important;padding:13px!important}
  .wish-btn{width:30px!important;height:30px!important;right:7px!important;top:7px!important}
  .product-badges{left:7px!important;top:7px!important}
  .discount-badge,.mini-badge{font-size:7px!important;padding:4px 5px!important}
  .product-copy{padding:10px!important}
  .product-category{font-size:7px!important;margin-bottom:4px!important}
  .product-name{font-size:11px!important;line-height:1.35!important;min-height:30px!important}
  .rating-row{margin-top:6px!important}
  .rating-pill{font-size:8px!important;padding:3px 5px!important}
  .review-count{font-size:7px!important}
  .price-row{margin-top:7px!important}
  .price-row strong{font-size:15px!important}
  .price-row del{font-size:8px!important}
  .add-cart-btn{height:34px!important;margin-top:9px!important;font-size:9px!important}
  .stock-warning{display:none!important}
  .smart-section,.flash-section,.trust-section{border-radius:16px!important;padding:13px!important;margin-top:16px!important}
  .smart-grid{grid-template-columns:1fr 1fr!important;gap:8px!important}
  .smart-card{min-height:145px!important;padding:11px!important;border-radius:13px!important}
  .smart-card-icon{width:36px!important;height:36px!important;border-radius:10px!important}
  .smart-card h3{font-size:12px!important}
  .smart-card p{font-size:8px!important;line-height:1.4!important}
  .smart-card-link{font-size:8px!important}
  .smart-badge{font-size:6px!important}
  .flash-products{display:flex!important;overflow-x:auto!important;grid-template-columns:none!important;gap:9px!important;scrollbar-width:none!important;padding-bottom:3px!important}
  .flash-products::-webkit-scrollbar{display:none}
  .flash-product{flex:0 0 72%!important;max-width:72%!important}
  .promo-grid{display:flex!important;overflow-x:auto!important;gap:9px!important;scrollbar-width:none!important;margin-top:16px!important}
  .promo-grid::-webkit-scrollbar{display:none}
  .promo-card{flex:0 0 86%!important;min-height:185px!important;border-radius:15px!important}
  .promo-card h3{font-size:18px!important}
  .trust-strip{display:grid!important;grid-template-columns:1fr 1fr!important;gap:4px!important;padding:4px!important}
  .trust-item{padding:10px!important}
  .trust-item>span{width:34px!important;height:34px!important}
  .trust-item strong{font-size:9px!important}
  .trust-item small{font-size:7px!important}
  .bottom-cta{margin-top:16px!important;border-radius:16px!important}
  .bottom-cta-content{padding:25px 18px!important}
  .bottom-cta-content h2{font-size:25px!important}
  .bottom-cta-content p{font-size:10px!important}
  .bottom-cta-actions{flex-wrap:wrap!important;gap:7px!important}
  .bottom-cta-actions a{font-size:9px!important;padding:9px 11px!important}
  .mobile-bottom-nav{height:66px!important}
  .mobile-bottom-item{padding-top:7px!important}
}
@media(max-width:390px){
  .container{width:calc(100% - 14px)!important}
  .brand-name{font-size:17px!important}
  .brand-tagline{font-size:6px!important}
  .header-action,.mobile-menu-button{width:33px!important;height:33px!important}
  .product-image-wrap{height:145px!important}
  .product-copy{padding:9px!important}
  .product-name{font-size:10px!important}
  .price-row strong{font-size:14px!important}
}

/* DARK MODE */
html.dark body{background:#14120e!important;color:#f8f0df!important}
html.dark .store-shell{background:radial-gradient(circle at 8% 0%,rgba(215,173,87,.08),transparent 25%),#14120e!important}
html.dark .main-header,html.dark .nav-bar{background:rgba(29,25,19,.97)!important;border-color:#3d3325!important}
html.dark .brand-logo-box{background:#292217!important;border-color:#51432b!important}
html.dark .brand-name{color:#f5e9cf!important}
html.dark .brand-tagline{color:#b6a689!important}
html.dark .search-box{background:#211d17!important;border-color:#4b402d!important;color:#fff!important}
html.dark .search-box input{color:#fff!important}
html.dark .category-section,html.dark .product-card,html.dark .smart-section,html.dark .smart-card,html.dark .flash-section,html.dark .flash-product,html.dark .promo-card,html.dark .trust-section{background:#201c16!important;border-color:#3d3427!important}
html.dark .section-title,html.dark .section-mini-head strong,html.dark .product-name,html.dark .price-row strong,html.dark .trust-item strong{color:#f8f0df!important}
html.dark .section-caption,html.dark .product-category,html.dark .review-count,html.dark .trust-item small{color:#b9af9e!important}
html.dark .product-image-wrap{background:linear-gradient(180deg,#29231b,#211d17)!important;border-color:#3d3427!important}
html.dark .section-head>a,html.dark .rail-control{background:#292319!important;border-color:#4b402d!important;color:#d7ad57!important}
html.dark .category-icon,html.dark .smart-card-icon,html.dark .promo-icon,html.dark .trust-item>span{background:#32291b!important;border-color:#51432b!important;color:#d7ad57!important}
html.dark .trust-strip{background:#191611!important}
html.dark .mobile-bottom-nav{background:rgba(29,25,19,.97)!important;border-color:#4b402d!important}
html.dark .mobile-bottom-item{color:#aaa08f!important}
html.dark .mobile-bottom-item.active{color:#d7ad57!important}
html.dark .search-dropdown{background:#211d17!important;border-color:#4b402d!important;color:#fff!important}
html.dark .search-dropdown-title{background:#292319!important;border-color:#4b402d!important}
html.dark .search-dropdown button:hover{background:#292319!important}
html.dark .suggestion-image{background:#292319!important;border-color:#4b402d!important}

@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;transition-duration:.01ms!important;animation-iteration-count:1!important}}


        /* PRIME CART V6 — PREMIUM STOREFRONT POLISH */
        .hero-layout {
          margin: 4px 0 26px;
        }

        .hero-carousel {
          width: 100%;
        }

        .hero-image-frame {
          width: 100%;
          min-height: 0 !important;
          max-height: none !important;
          height: auto;
          border-radius: 18px;
          background: #fffaf0;
          border: 1px solid rgba(188, 145, 52, 0.14);
          box-shadow:
            0 14px 38px rgba(75, 55, 18, 0.09),
            0 2px 8px rgba(75, 55, 18, 0.04);
        }

        .hero-banner {
          width: 100%;
          height: 100%;
          object-fit: cover !important;
          object-position: center center !important;
          transform: scale(1.001);
        }

        .hero-banner.active {
          transform: scale(1);
        }

        .hero-arrow {
          width: 42px;
          height: 42px;
          border-color: rgba(184, 137, 45, 0.2);
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 8px 22px rgba(48, 37, 16, 0.12);
        }

        .hero-arrow:hover {
          background: #fffdf8;
          box-shadow: 0 10px 26px rgba(48, 37, 16, 0.16);
        }

        .hero-left { left: 18px; }
        .hero-right { right: 18px; }

        .hero-dots {
          bottom: 15px;
          padding: 6px 9px;
          border-radius: 999px;
          background: rgba(255,255,255,.74);
          backdrop-filter: blur(10px);
          box-shadow: 0 5px 18px rgba(30,24,13,.08);
        }

        .hero-counter {
          bottom: 14px;
          right: 15px;
          border: 1px solid rgba(255,255,255,.28);
          box-shadow: 0 5px 18px rgba(20,16,8,.10);
        }

        .category-section {
          margin: 26px 0 34px;
        }

        .category-rail {
          gap: 10px;
          padding: 6px 3px 10px;
        }

        .category-item {
          min-width: 104px;
          padding: 7px 3px 3px;
          border-radius: 14px;
        }

        .category-item:hover {
          background: linear-gradient(180deg, #fffdf8, #fff9ee);
        }

        .category-icon {
          width: 68px;
          height: 68px;
          border: 1px solid rgba(193,150,67,.10);
        }

        .smart-section,
        .flash-section,
        .promo-section,
        .trust-section,
        .cta-section {
          border-color: rgba(196,155,76,.14) !important;
          box-shadow: 0 12px 34px rgba(62,47,19,.055) !important;
        }

        .smart-section {
          padding: 20px;
          border-radius: 16px;
        }

        .smart-grid {
          gap: 14px;
        }

        .smart-card {
          min-height: 148px;
          border-radius: 14px;
          padding: 16px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.75);
        }

        .smart-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 30px rgba(71,53,20,.10);
        }

        .section-head {
          margin-top: 12px;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 19px;
          letter-spacing: -.2px;
        }

        .section-title > span {
          width: 34px;
          height: 34px;
          border-radius: 10px;
        }

        .product-grid {
          gap: 14px;
        }

        .product-card {
          border-radius: 15px !important;
          border-color: #eee7da !important;
          box-shadow: 0 6px 20px rgba(48,38,19,.045) !important;
        }

        .product-card:hover {
          transform: translateY(-4px);
          border-color: #e2c88e !important;
          box-shadow: 0 16px 34px rgba(73,55,20,.10) !important;
        }

        .product-image-wrap {
          background: linear-gradient(145deg,#fffdf9,#faf6ec) !important;
        }

        .flash-section {
          border-radius: 16px !important;
          padding: 20px !important;
        }

        .promo-card {
          border-radius: 15px !important;
          box-shadow: 0 8px 24px rgba(60,45,17,.07) !important;
        }

        .trust-grid {
          gap: 12px !important;
        }

        .trust-item {
          border-radius: 14px !important;
          border-color: #eee6d7 !important;
          background: linear-gradient(145deg,#fff,#fffaf1) !important;
        }

        @media (max-width: 900px) {
          .hero-layout { margin-top: 2px; margin-bottom: 21px; }
          .hero-image-frame { border-radius: 14px; }
          .hero-arrow { width: 36px; height: 36px; }
          .hero-left { left: 10px; }
          .hero-right { right: 10px; }
          .category-section { margin-top: 20px; }
        }

        @media (max-width: 680px) {
          .hero-layout { margin-bottom: 18px; }
          .hero-image-frame { border-radius: 11px; }
          .hero-arrow { width: 32px; height: 32px; }
          .hero-arrow svg { width: 17px; height: 17px; }
          .hero-left { left: 7px; }
          .hero-right { right: 7px; }
          .hero-counter { right: 8px; bottom: 9px; padding: 5px 7px; font-size: 8px; }
          .hero-dots { bottom: 9px; padding: 4px 7px; gap: 4px; }
          .hero-dots button { width: 5px; height: 5px; }
          .hero-dots button.active { width: 16px; }
          .smart-section { padding: 13px; border-radius: 13px; }
          .smart-grid { gap: 8px; }
          .smart-card { min-height: 122px; padding: 11px; border-radius: 11px; }
          .smart-card h3 { font-size: 12px; }
          .smart-card p { font-size: 7px; }
          .category-icon { width: 58px; height: 58px; }
          .category-item { min-width: 82px; }
        }

        @media (max-width: 390px) {
          .hero-image-frame { border-radius: 9px; }
          .hero-arrow { width: 29px; height: 29px; }
          .hero-left { left: 5px; }
          .hero-right { right: 5px; }
          .smart-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }



        /* PRIME CART V7 — MOBILE HERO + PROMO REFINEMENT */
        .hero-image-frame {
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          overflow: hidden !important;
          background: #fff !important;
        }

        .hero-banner {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          object-position: center center !important;
          background: #fff !important;
        }

        /* Keep the banner completely visible on phones. The inline
           aspect-ratio supplied by the loaded image controls the frame. */
        @media (max-width: 680px) {
          .hero-layout {
            width: 100% !important;
            margin: 8px 0 18px !important;
          }

          .hero-carousel {
            width: 100% !important;
            border-radius: 13px !important;
            background: #fff !important;
          }

          .hero-image-frame {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            aspect-ratio: auto !important;
            border-radius: 13px !important;
            background: #fff !important;
          }

          .hero-banner {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
            object-position: center !important;
            background: #fff !important;
          }

          .hero-arrow {
            width: 31px !important;
            height: 31px !important;
          }

          .hero-left { left: 7px !important; }
          .hero-right { right: 7px !important; }

          .hero-dots {
            bottom: 7px !important;
            padding: 4px 7px !important;
          }

          .hero-counter {
            bottom: 7px !important;
            right: 7px !important;
          }
        }

        @media (max-width: 390px) {
          .hero-layout { margin-top: 5px !important; }
          .hero-carousel,
          .hero-image-frame { border-radius: 10px !important; }
          .hero-arrow { width: 28px !important; height: 28px !important; }
          .hero-left { left: 5px !important; }
          .hero-right { right: 5px !important; }
        }

        /* Soft premium promo palette — remove the overly-bright gold card. */
        .promo-grid .promo-gold {
          background: linear-gradient(120deg, #fbf2df, #f0e1c2) !important;
          color: #3f3526 !important;
          border-color: #ead9b8 !important;
        }

        .promo-grid .promo-gold p {
          color: #756a57 !important;
        }

        .promo-grid .promo-gold .promo-icon {
          background: rgba(255,255,255,.66) !important;
          color: #8f681f !important;
        }

        .promo-grid .promo-cream,
        .promo-grid .promo-fashion {
          box-shadow: 0 8px 24px rgba(60,45,17,.055) !important;
        }

        @media (max-width: 680px) {
          .promo-grid {
            grid-template-columns: repeat(3, minmax(250px, 1fr)) !important;
            overflow-x: auto !important;
            padding: 2px 2px 8px !important;
            scrollbar-width: none !important;
          }
          .promo-grid::-webkit-scrollbar { display: none; }
          .promo-card {
            min-height: 145px !important;
          }
        }



        /* FINAL MOBILE POLISH — keeps the existing PrimeCart UI intact */
        @media (max-width: 680px) {
          .page-content {
            padding-bottom: 10px !important;
          }

          .products-grid.five-columns {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 9px !important;
          }

          .product-card {
            min-width: 0 !important;
            border-radius: 14px !important;
            overflow: hidden !important;
          }

          .product-image-wrap {
            height: 154px !important;
            min-height: 154px !important;
          }

          .product-image {
            max-width: 88% !important;
            max-height: 88% !important;
            object-fit: contain !important;
          }

          .product-copy {
            padding: 10px !important;
          }

          .product-name {
            font-size: 11px !important;
            line-height: 1.35 !important;
            min-height: 30px !important;
          }

          .price-row strong {
            font-size: 15px !important;
          }

          .add-cart-btn {
            width: 100% !important;
            min-height: 35px !important;
            font-size: 9px !important;
          }

          .wish-btn {
            width: 31px !important;
            height: 31px !important;
            z-index: 5 !important;
          }

          .hero-carousel,
          .hero-image-frame {
            width: 100% !important;
          }

          .category-rail {
            padding-bottom: 4px !important;
            scrollbar-width: none !important;
          }

          .category-rail::-webkit-scrollbar {
            display: none !important;
          }

          .smart-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .flash-products,
          .promo-grid {
            -webkit-overflow-scrolling: touch !important;
          }

          .mobile-bottom-nav {
            padding-bottom: env(safe-area-inset-bottom) !important;
            height: calc(66px + env(safe-area-inset-bottom)) !important;
          }
        }

        @media (max-width: 390px) {
          .products-grid.five-columns {
            gap: 7px !important;
          }

          .product-image-wrap {
            height: 145px !important;
            min-height: 145px !important;
          }

          .product-copy {
            padding: 9px !important;
          }

          .product-name {
            font-size: 10px !important;
          }

          .price-row strong {
            font-size: 14px !important;
          }

          .add-cart-btn {
            min-height: 33px !important;
            font-size: 8.5px !important;
          }
        }

        /* ================================================================
           FINAL MOBILE POLISH - PrimeCart
           ================================================================ */
        @media (max-width: 680px) {
          html, body { overflow-x: hidden !important; }
          body { padding-bottom: 76px !important; }
          .store-shell { width: 100% !important; overflow-x: hidden !important; }
          .container { width: calc(100% - 20px) !important; max-width: none !important; }

          .main-header { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
          .header-main { width: 100% !important; grid-template-columns: minmax(0,1fr) auto !important; }
          .brand-copy { min-width: 0 !important; }
          .brand-name { white-space: nowrap !important; }
          .header-actions { min-width: 0 !important; }
          .header-actions .icon-action { width: 38px !important; height: 38px !important; }
          .mobile-menu-button { width: 38px !important; height: 38px !important; }

          .search-box { position: relative !important; z-index: 30 !important; }
          .search-dropdown { left: 0 !important; right: 0 !important; width: 100% !important; max-height: 62vh !important; overflow-y: auto !important; }

          .page-content { width: 100% !important; overflow: hidden !important; }
          .hero-layout { display: block !important; width: 100% !important; }
          .hero-carousel { width: 100% !important; overflow: hidden !important; }
          .hero-image-frame { width: 100% !important; height: clamp(175px, 50vw, 245px) !important; }
          .hero-banner { width: 100% !important; height: 100% !important; object-fit: cover !important; }
          .right-rail { width: 100% !important; }

          .category-section, .smart-section, .flash-section, .trust-section {
            width: 100% !important;
            overflow: hidden !important;
          }
          .category-rail { display: flex !important; overflow-x: auto !important; overscroll-behavior-x: contain; }
          .category-item { flex: 0 0 76px !important; }

          .section-head { gap: 8px !important; align-items: center !important; }
          .section-head > div { min-width: 0 !important; }
          .section-title { white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
          .section-head > a { flex: 0 0 auto !important; white-space: nowrap !important; }

          .products-grid.five-columns {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            width: 100% !important;
            gap: 10px !important;
          }
          .products-grid.five-columns .product-card { display: flex !important; min-width: 0 !important; width: 100% !important; }
          .product-image-wrap { width: 100% !important; height: 155px !important; }
          .product-image { max-width: 100% !important; max-height: 100% !important; object-fit: contain !important; }
          .product-copy { min-width: 0 !important; }
          .product-name { display: -webkit-box !important; -webkit-box-orient: vertical !important; -webkit-line-clamp: 2 !important; overflow: hidden !important; }
          .price-row { min-width: 0 !important; flex-wrap: wrap !important; }
          .add-cart-btn { width: 100% !important; min-width: 0 !important; }

          .smart-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
          .promo-grid { grid-template-columns: 1fr !important; }
          .trust-strip { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .trust-item { min-width: 0 !important; }

          .mobile-menu-overlay { z-index: 1000 !important; }
          .mobile-menu-panel { width: min(88vw, 360px) !important; max-width: 360px !important; }

          .toast { left: 10px !important; right: 10px !important; bottom: 84px !important; width: auto !important; max-width: none !important; text-align: center !important; }
          .bottom-nav, .mobile-bottom-nav { z-index: 900 !important; }
        }

        @media (max-width: 390px) {
          .container { width: calc(100% - 14px) !important; }
          .brand-logo-box { width: 36px !important; height: 36px !important; }
          .prime-logo { width: 32px !important; height: 32px !important; }
          .brand-name { font-size: 16px !important; }
          .brand-tagline { font-size: 6px !important; }
          .header-actions .icon-action, .mobile-menu-button { width: 35px !important; height: 35px !important; }
          .product-image-wrap { height: 140px !important; }
          .product-copy { padding: 8px !important; }
          .product-name { font-size: 10.5px !important; }
          .price-row strong { font-size: 14px !important; }
          .add-cart-btn { height: 33px !important; font-size: 8.5px !important; }
        }

        @media(max-width:1200px){.flash-products{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
        @media(max-width:900px){.flash-products{grid-template-columns:repeat(2,minmax(0,1fr))!important}.flash-product{min-height:88px!important}}
        @media(max-width:680px){.flash-section{padding:14px!important}.flash-header{display:grid!important;grid-template-columns:1fr auto!important;gap:10px!important}.flash-header> a{grid-column:1/-1!important;justify-content:center!important}.flash-header p{font-size:8px!important;line-height:1.45!important}.flash-title{font-size:18px!important}.flash-products{display:flex!important;overflow-x:auto!important;scroll-snap-type:x mandatory!important;padding:2px 1px 8px!important;gap:9px!important;scrollbar-width:none!important}.flash-products::-webkit-scrollbar{display:none!important}.flash-product{min-width:220px!important;width:220px!important;flex:0 0 220px!important;scroll-snap-align:start!important}.flash-product-copy strong{font-size:11px!important}.flash-product-copy span{font-size:13px!important}}

        /* FINAL REQUESTED MOBILE HEADER + CART POLISH */
        @media (max-width: 680px) {
          .header-main {
            display: flex !important;
            align-items: center !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }

          .logo-wrap {
            flex: 1 1 auto !important;
            min-width: 0 !important;
          }

          .mobile-header-cart {
            display: inline-flex !important;
            flex: 0 0 40px !important;
            width: 40px !important;
            height: 40px !important;
            align-items: center !important;
            justify-content: center !important;
            border: 1px solid #e4d8c0 !important;
            border-radius: 12px !important;
            background: #fffaf0 !important;
            color: #8b671f !important;
            text-decoration: none !important;
          }

          .mobile-header-cart-icon {
            position: relative !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          .mobile-header-cart-icon b {
            position: absolute !important;
            top: -9px !important;
            right: -10px !important;
            min-width: 16px !important;
            height: 16px !important;
            padding: 0 4px !important;
            border-radius: 999px !important;
            display: grid !important;
            place-items: center !important;
            background: #b8872d !important;
            color: #fff !important;
            border: 2px solid #fffaf0 !important;
            font-size: 8px !important;
            line-height: 1 !important;
          }

          .header-actions,
          .mobile-menu-button,
          .mobile-menu-overlay {
            display: none !important;
          }

          .search-box {
            order: 10 !important;
            flex: 0 0 100% !important;
            width: 100% !important;
          }

          .add-cart-btn {
            width: 38px !important;
            min-width: 38px !important;
            max-width: 38px !important;
            height: 35px !important;
            min-height: 35px !important;
            padding: 0 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 0 !important;
            font-size: 0 !important;
          }

          .add-cart-btn .add-cart-label {
            display: none !important;
          }

          .add-cart-btn svg {
            width: 16px !important;
            height: 16px !important;
            flex: 0 0 auto !important;
          }

          .mobile-bottom-nav {
            display: flex !important;
            position: fixed !important;
            left: 10px !important;
            right: 10px !important;
            bottom: 8px !important;
            z-index: 1200 !important;
          }
        }

        @media (min-width: 681px) {
          .mobile-header-cart {
            display: none !important;
          }
        }

        /* ================================================================
           FINAL HERO FIX — SHOW THE COMPLETE BANNER
           ================================================================ */
        .hero-carousel {
          width: 100% !important;
          overflow: hidden !important;
        }

        .hero-image-frame {
          width: 100% !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          aspect-ratio: auto !important;
          position: relative !important;
          overflow: hidden !important;
          background: #fff !important;
        }

        /* Inactive banners stay stacked. The active banner remains in normal
           flow, so its natural aspect ratio determines the container height.
           This prevents cropping/stretching on both desktop and mobile. */
        .hero-banner {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          object-position: center center !important;
          background: #fff !important;
        }

        .hero-banner.active {
          position: relative !important;
          inset: auto !important;
          display: block !important;
          width: 100% !important;
          height: auto !important;
          max-width: 100% !important;
          object-fit: contain !important;
          object-position: center center !important;
          aspect-ratio: auto !important;
        }

        @media (max-width: 680px) {
          /* Header = logo + cart + menu, search on the next full row. */
          .header-main {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) 40px 40px !important;
            align-items: center !important;
            width: 100% !important;
            gap: 7px !important;
            padding: 8px 0 9px !important;
          }

          .logo-wrap {
            min-width: 0 !important;
            width: 100% !important;
          }

          .mobile-header-cart {
            grid-column: 2 !important;
            grid-row: 1 !important;
            display: inline-flex !important;
            width: 40px !important;
            height: 40px !important;
            margin: 0 !important;
          }

          .mobile-menu-button {
            grid-column: 3 !important;
            grid-row: 1 !important;
            display: grid !important;
            place-items: center !important;
            width: 40px !important;
            height: 40px !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 1px solid #e4d8c0 !important;
            border-radius: 12px !important;
            background: #fffaf0 !important;
            color: #8b671f !important;
            cursor: pointer !important;
          }

          .header-actions {
            display: none !important;
          }

          .search-box {
            grid-column: 1 / -1 !important;
            grid-row: 2 !important;
            order: unset !important;
            width: 100% !important;
            min-width: 0 !important;
            margin-top: 1px !important;
          }

          .mobile-menu-overlay {
            display: block !important;
            position: fixed !important;
            inset: 0 !important;
            z-index: 1500 !important;
          }

          /* Hero remains fully inside its card on phones. */
          .hero-layout {
            width: 100% !important;
            margin-top: 10px !important;
          }

          .hero-carousel {
            width: 100% !important;
            border-radius: 15px !important;
          }

          .hero-image-frame {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            aspect-ratio: auto !important;
            border-radius: 14px !important;
          }

          .hero-banner {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
            object-position: center center !important;
          }

          .hero-banner.active {
            width: 100% !important;
            height: auto !important;
            display: block !important;
            object-fit: contain !important;
          }

          /* Bottom navigation never overflows horizontally. */
          .mobile-bottom-nav {
            display: grid !important;
            grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
            position: fixed !important;
            left: 8px !important;
            right: 8px !important;
            bottom: 8px !important;
            width: auto !important;
            max-width: none !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 6px 5px !important;
            gap: 2px !important;
            overflow: hidden !important;
            border-radius: 20px !important;
            z-index: 1200 !important;
          }

          .mobile-bottom-item {
            min-width: 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 3px !important;
          }

          .mobile-bottom-item span:last-child {
            max-width: 100% !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
          }
        }

        @media (max-width: 390px) {
          .hero-image-frame {
            aspect-ratio: auto !important;
          }

          .mobile-bottom-nav {
            left: 6px !important;
            right: 6px !important;
            bottom: 6px !important;
          }
        }

        /* ================================================================
           FINAL MOBILE HERO SPACE FIX
           Prevent the old fixed mobile aspect-ratio rules from leaving a
           large blank white area below the actual banner.
           ================================================================ */
        @media (max-width: 680px) {
          .hero-carousel {
            height: auto !important;
            min-height: 0 !important;
          }

          .hero-image-frame {
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            aspect-ratio: auto !important;
          }

          .hero-banner.active {
            position: relative !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            aspect-ratio: auto !important;
            object-fit: contain !important;
          }
        }

        @media (max-width: 390px) {
          .hero-image-frame {
            height: auto !important;
            aspect-ratio: auto !important;
          }
        }

        /* ================================================================
           FINAL WHITE + GOLD THEME POLISH
           Flash Deals + All Categories button
           ================================================================ */
        .all-category-btn {
          background: linear-gradient(135deg, #c79a3b, #a8751f) !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,.22) !important;
          box-shadow: 0 6px 15px rgba(184,135,45,.20) !important;
        }
        .all-category-btn:hover {
          background: linear-gradient(135deg, #d2aa57, #b8872d) !important;
          transform: translateY(-1px);
        }
        .all-category-btn svg {
          color: #fff8e8 !important;
        }

        .flash-section {
          background: linear-gradient(135deg, #fffdf8 0%, #fff8e9 55%, #f8edcf 100%) !important;
          border: 1px solid rgba(184,135,45,.24) !important;
          box-shadow: 0 14px 34px rgba(112,79,20,.10) !important;
        }
        .flash-header {
          background: linear-gradient(135deg, #fff 0%, #fffaf0 100%) !important;
          border-bottom: 1px solid rgba(184,135,45,.16) !important;
        }
        .flash-title {
          color: #8b641d !important;
        }
        .flash-title svg {
          color: #b8872d !important;
        }
        .flash-header p {
          color: #8d8577 !important;
        }
        .flash-timer span {
          color: #9a711f !important;
          border-color: rgba(184,135,45,.22) !important;
          background: #fff8e8 !important;
        }
        .flash-timer b {
          color: #7b5715 !important;
          background: #fff !important;
          border: 1px solid rgba(184,135,45,.20) !important;
          box-shadow: 0 4px 10px rgba(112,79,20,.08) !important;
        }
        .flash-timer i {
          color: #b8872d !important;
        }
        .flash-header > a {
          color: #9a6d19 !important;
          background: #fffaf0 !important;
          border: 1px solid rgba(184,135,45,.24) !important;
          border-radius: 999px !important;
        }

        @media (max-width: 680px) {
          .all-category-btn {
            background: linear-gradient(135deg, #c79a3b, #a8751f) !important;
          }

          .flash-section {
            margin: 16px 0 !important;
            border-radius: 13px !important;
          }
          .flash-header {
            padding: 11px 12px !important;
            gap: 8px !important;
          }
          .flash-title {
            font-size: 15px !important;
            line-height: 1.1 !important;
          }
          .flash-title svg {
            width: 16px !important;
            height: 16px !important;
          }
          .flash-header p {
            font-size: 9px !important;
            margin-top: 3px !important;
            line-height: 1.25 !important;
          }
          .flash-timer {
            transform: scale(.84) !important;
            transform-origin: right center !important;
            margin-left: auto !important;
          }
          .flash-timer span {
            font-size: 7px !important;
            padding: 3px 5px !important;
          }
          .flash-timer b {
            min-width: 23px !important;
            height: 23px !important;
            font-size: 10px !important;
            border-radius: 6px !important;
          }
          .flash-timer i {
            font-size: 10px !important;
          }
          .flash-header > a {
            font-size: 9px !important;
            padding: 5px 8px !important;
          }
          .flash-products {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 7px !important;
            padding: 8px !important;
          }
          .flash-product {
            min-height: 132px !important;
            padding: 7px !important;
            border-radius: 10px !important;
          }
          .flash-product-image {
            height: 70px !important;
            min-height: 70px !important;
            border-radius: 8px !important;
          }
          .flash-product strong {
            font-size: 11px !important;
          }
          .flash-product span,
          .flash-product em {
            font-size: 8px !important;
          }
        }
        /* ================================================================
           FINAL DASHBOARD FIXES
           Change these variables to update the main dashboard colours.
           ================================================================ */
        :root {
          --dashboard-accent: #b8872d;
          --dashboard-accent-dark: #8b641d;
          --dashboard-accent-soft: #fff6df;
          --dashboard-page: #fcfaf5;
          --dashboard-card: #ffffff;
          --dashboard-text: #282219;
          --dashboard-border: #e8dfce;
        }

        /* Central colour controls. These rules come last so older CSS
           cannot unexpectedly overwrite the selected colours. */
        .store-shell {
          background: var(--dashboard-page) !important;
          color: var(--dashboard-text) !important;
        }
        .top-strip {
          background: var(--dashboard-accent-dark) !important;
        }
        .main-header, .nav-bar {
          background: var(--dashboard-card) !important;
          border-color: var(--dashboard-border) !important;
        }
        .brand-name, .brand-logo-fallback {
          color: var(--dashboard-accent) !important;
        }
        .mobile-menu-button {
          color: var(--dashboard-accent-dark) !important;
          border-color: var(--dashboard-border) !important;
          background: var(--dashboard-accent-soft) !important;
        }
        .section-title, .section-mini-head strong, .product-name,
        .price-row strong {
          color: var(--dashboard-text) !important;
        }
        .section-title > span, .category-icon, .smart-card-icon {
          color: var(--dashboard-accent-dark) !important;
          border-color: var(--dashboard-border) !important;
          background: var(--dashboard-accent-soft) !important;
        }
        .section-head > a, .search-submit, .add-cart-btn, .all-category-btn {
          background: var(--dashboard-accent) !important;
          border-color: var(--dashboard-accent) !important;
          color: #ffffff !important;
        }
        .product-card, .category-section, .smart-section, .trust-section {
          border-color: var(--dashboard-border) !important;
        }
        .product-card { background: var(--dashboard-card) !important; }
        .product-category, .product-name:hover {
          color: var(--dashboard-accent-dark) !important;
        }
        .wish-btn.wished {
          color: var(--dashboard-accent-dark) !important;
          background: var(--dashboard-accent-soft) !important;
          border-color: var(--dashboard-border) !important;
        }

        /* Mobile products: keep every product card visible in two columns.
           Older responsive rules hid cards after the third/fourth product. */
        @media (max-width: 680px) {
          .products-grid.five-columns {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            align-items: stretch !important;
            width: 100% !important;
            min-width: 0 !important;
            gap: 10px !important;
            overflow: visible !important;
          }
          .products-grid.five-columns > .product-card,
          .products-grid.five-columns > .product-card:nth-child(n) {
            display: flex !important;
            flex-direction: column !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: relative !important;
            width: 100% !important;
            min-width: 0 !important;
            height: auto !important;
            margin: 0 !important;
            transform: none !important;
          }
          .products-grid.five-columns .product-image-wrap {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex: 0 0 auto !important;
            width: 100% !important;
            height: clamp(132px, 39vw, 175px) !important;
            min-height: clamp(132px, 39vw, 175px) !important;
            padding: 10px !important;
            overflow: hidden !important;
          }
          .products-grid.five-columns .product-image {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            object-fit: contain !important;
          }
          .products-grid.five-columns .product-copy {
            display: flex !important;
            flex: 1 1 auto !important;
            flex-direction: column !important;
            min-width: 0 !important;
            padding: 9px !important;
          }
          .products-grid.five-columns .product-name {
            width: 100% !important;
            min-width: 0 !important;
            min-height: 2.7em !important;
            font-size: 11px !important;
            line-height: 1.35 !important;
            overflow-wrap: anywhere !important;
          }
          .products-grid.five-columns .price-row {
            display: flex !important;
            flex-wrap: wrap !important;
            align-items: baseline !important;
            gap: 4px 6px !important;
            min-width: 0 !important;
          }
          .products-grid.five-columns .price-row strong {
            font-size: 14px !important;
          }
          .products-grid.five-columns .add-cart-btn {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 5px !important;
            width: 100% !important;
            min-width: 0 !important;
            min-height: 34px !important;
            margin-top: auto !important;
            padding: 7px 4px !important;
            font-size: 10px !important;
          }
          .products-grid.five-columns .add-cart-label {
            display: inline !important;
            font-size: 10px !important;
          }
          .products-grid.five-columns .wish-btn {
            display: grid !important;
            visibility: visible !important;
            z-index: 6 !important;
          }
          .products-grid.five-columns .product-badges {
            max-width: calc(100% - 48px) !important;
          }
          .page-content {
            overflow-x: clip !important;
            overflow-y: visible !important;
          }
        }
        @media (max-width: 390px) {
          .products-grid.five-columns { gap: 7px !important; }
          .products-grid.five-columns .product-image-wrap {
            height: 132px !important;
            min-height: 132px !important;
          }
          .products-grid.five-columns .product-copy { padding: 8px !important; }
          .products-grid.five-columns .product-name { font-size: 10px !important; }
          .products-grid.five-columns .price-row strong { font-size: 13px !important; }
        }

        /* Tablet: use a responsive grid without hiding extra product cards. */
        @media (min-width: 681px) and (max-width: 900px) {
          .products-grid.five-columns {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
          .products-grid.five-columns > .product-card,
          .products-grid.five-columns > .product-card:nth-child(n) {
            display: flex !important;
            flex-direction: column !important;
          }
        }

        /* Mobile refinements requested: full Add to Cart label and hide the trust benefits strip. */
        @media (max-width: 680px) {
          .products-grid .add-cart-btn,
          .products-grid.five-columns .add-cart-btn {
            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;
            height: auto !important;
            min-height: 36px !important;
            padding: 8px 5px !important;
            gap: 6px !important;
            font-size: 11px !important;
            line-height: 1.2 !important;
            white-space: nowrap !important;
          }
          .products-grid .add-cart-btn .add-cart-label,
          .products-grid.five-columns .add-cart-btn .add-cart-label {
            display: inline !important;
            font-size: 11px !important;
            visibility: visible !important;
          }
          .products-grid .add-cart-btn svg,
          .products-grid.five-columns .add-cart-btn svg {
            display: none !important;
          }
          .trust-section {
            display: none !important;
          }
        }

        /* Keep the existing dark-mode toggle working. */
        html.dark .store-shell {
          background: #15130f !important;
          color: #f8f0df !important;
        }
        html.dark .product-card, html.dark .category-section,
        html.dark .smart-section, html.dark .trust-section {
          background: #201c16 !important;
          border-color: #3d3427 !important;
        }
        html.dark .section-title, html.dark .section-mini-head strong,
        html.dark .product-name, html.dark .price-row strong {
          color: #f8f0df !important;
        }

        
 `}
      
</style>
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
