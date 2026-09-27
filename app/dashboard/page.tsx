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
const WISHLIST_KEY = "primecart-wishlist";
const THEME_KEY = "primecart-theme";

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

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [wishlist, setWishlist] = useState<Array<string | number>>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [heroIndex, setHeroIndex] = useState(0);

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
  /* LOAD DASHBOARD                                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setErrorMessage("");

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

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
        }

        const [
          { data: productData, error: productError },
          { data: categoryData, error: categoryError },
        ] = await Promise.all([
          supabase
            .from("products")
            .select(
              "id,category_id,name,slug,short_description,description,price,original_price,stock,image_url,brand,rating,reviews_count,is_featured,is_flash_sale,is_active,created_at"
            )
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(100),

          supabase
            .from("categories")
            .select("id,name")
            .order("name", { ascending: true }),
        ]);

        if (productError) throw productError;

        if (categoryError) {
          console.warn(categoryError.message);
        }

        if (!mounted) return;

        setProducts(productData || []);
        setCategories(categoryData || []);
      } catch (error) {
        console.error(error);

        if (mounted) {
          setErrorMessage(
            "Unable to load products right now. Please try again."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    try {
      const savedCart = JSON.parse(
        localStorage.getItem(CART_KEY) || "[]"
      );

      const savedWishlist = JSON.parse(
        localStorage.getItem(WISHLIST_KEY) || "[]"
      );

      const savedTheme = localStorage.getItem(THEME_KEY);

      if (Array.isArray(savedCart)) {
        setCart(savedCart);
      }

      if (Array.isArray(savedWishlist)) {
        setWishlist(savedWishlist);
      }

      if (savedTheme === "dark") {
        setTheme("dark");
      }
    } catch {
      // Ignore invalid local storage.
    }

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

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return [];

    return products
      .filter((product) => {
        const category =
          categoryMap.get(String(product.category_id)) || "";

        return `${product.name} ${product.brand || ""} ${category}`
          .toLowerCase()
          .includes(q);
      })
      .slice(0, 7);
  }, [search, products, categoryMap]);

  /* ------------------------------------------------------------------------ */
  /* PRODUCT GROUPS                                                           */
  /* ------------------------------------------------------------------------ */

  const featuredProducts = useMemo(() => {
    const featured = products.filter(
      (product) => product.is_featured
    );

    return (featured.length ? featured : products).slice(0, 5);
  }, [products]);

  const flashProducts = useMemo(() => {
    const flash = products.filter(
      (product) => product.is_flash_sale
    );

    const discounted = products.filter(
      (product) =>
        getDiscount(product.price, product.original_price) >= 10
    );

    return (
      flash.length
        ? flash
        : discounted.length
          ? discounted
          : products
    ).slice(0, 5);
  }, [products]);

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

  function toggleWishlist(id: string | number) {
    setWishlist((current) => {
      const exists = current.some(
        (value) => String(value) === String(id)
      );

      const next = exists
        ? current.filter(
            (value) => String(value) !== String(id)
          )
        : [...current, id];

      localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(next)
      );

      showToast(
        exists
          ? "Removed from Wishlist"
          : "Added to Wishlist"
      );

      return next;
    });
  }

  function addToCart(product: Product) {
    setCart((current) => {
      const exists = current.find(
        (item) =>
          String(item.id) === String(product.id)
      );

      const maxStock = Number(product.stock || 999);

      const next = exists
        ? current.map((item) =>
            String(item.id) === String(product.id)
              ? {
                  ...item,
                  quantity: Math.min(
                    item.quantity + 1,
                    maxStock
                  ),
                }
              : item
          )
        : [
            ...current,
            {
              id: product.id,
              name: product.name,
              price: Number(product.price || 0),
              image_url: product.image_url,
              quantity: 1,
            },
          ];

      localStorage.setItem(
        CART_KEY,
        JSON.stringify(next)
      );

      return next;
    });

    showToast("Added to Cart");
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
  /* LOADING                                                                  */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return <LoadingScreen />;
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
            <img
              src="/logo.png"
              alt="PrimeCart"
              className="prime-logo"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />

            <div className="logo-fallback">
              <div className="logo-mark">
                <ShoppingBag size={25} />
              </div>

              <div>
                <div className="logo-text">
                  PrimeCart
                </div>

                <div className="logo-tagline">
                  Shop Smart · Live Better
                </div>
              </div>
            </div>
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

                {searchResults.length ? (
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
            <div className="hero-image-frame">
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
              {flashProducts
                .slice(0, 4)
                .map((product) => (
                  <button
                    key={String(product.id)}
                    type="button"
                    className="flash-product"
                    onClick={() =>
                      openProduct(product)
                    }
                  >
                    <div className="flash-product-image">
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

                    <div>
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
          aspect-ratio: 2.72 / 1;
          min-height: 245px;
          max-height: 430px;
          border-radius: 12px;
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
          object-fit: contain;
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
        /* LOADING                                                          */
        /* -------------------------------------------------------------- */

        .loading-screen {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 50% 35%,
              #fffaf0,
              #fffdf9 42%,
              #f8f6f1
            );
          display: grid;
          place-items: center;
        }

        .loading-inner {
          text-align: center;
        }

        .loading-logo {
          width: 61px;
          height: 61px;
          border: 2px solid var(--gold);
          color: var(--gold);
          border-radius: 15px;
          display: grid;
          place-items: center;
          margin: 0 auto 14px;
          animation: pulse 1.4s
            ease-in-out infinite;
          box-shadow: 0 8px 30px
            rgba(184, 137, 36, 0.12);
        }

        .loading-inner strong {
          color: var(--gold);
          font-size: 22px;
        }

        .loading-inner span {
          display: block;
          color: #999;
          font-size: 10px;
          margin-top: 5px;
        }

        .loading-bar {
          width: 190px;
          height: 3px;
          background: #f0e7d5;
          margin: 18px auto 0;
          overflow: hidden;
          border-radius: 5px;
        }

        .loading-bar:after {
          content: "";
          display: block;
          width: 45%;
          height: 100%;
          background: var(--gold);
          animation: loading 1.1s
            ease-in-out infinite;
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

        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }

          100% {
            transform: translateX(320%);
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


        /* ==============================================================
           PRIME CART V2 — PREMIUM WHITE + GOLD / MOBILE FIRST
           ==============================================================
        :root {
          --pc-gold: #b8872d;
          --pc-gold-dark: #8e6419;
          --pc-gold-soft: #fbf3df;
          --pc-gold-pale: #fffaf0;
          --pc-ink: #171613;
          --pc-muted: #706c64;
          --pc-line: #e9e4d9;
          --pc-white: #ffffff;
          --pc-page: #fcfbf8;
          --pc-shadow: 0 10px 30px rgba(39, 31, 16, .07);
        }

        html { scroll-behavior: smooth; }
        body { background: var(--pc-page); }

        .store-shell {
          min-height: 100vh;
          background:
            radial-gradient(circle at 8% 12%, rgba(216,177,89,.08), transparent 23%),
            radial-gradient(circle at 92% 34%, rgba(216,177,89,.06), transparent 20%),
            var(--pc-page);
        }

        .main-header {
          background: rgba(255,255,255,.96) !important;
          border-bottom: 1px solid var(--pc-line) !important;
          box-shadow: 0 4px 18px rgba(42,34,19,.045) !important;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .header-main { min-height: 76px !important; }

        .logo-wrap { transition: transform .2s ease; }
        .logo-wrap:hover { transform: translateY(-1px); }

        .search-box {
          border: 1px solid #ddd6c8 !important;
          background: #fff !important;
          box-shadow: 0 4px 16px rgba(52,42,23,.045) !important;
          transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
        }
        .search-box:focus-within,
        .search-box.search-active {
          border-color: rgba(184,135,45,.72) !important;
          box-shadow: 0 0 0 4px rgba(184,135,45,.10), 0 8px 22px rgba(52,42,23,.07) !important;
        }
        .search-submit {
          background: linear-gradient(135deg, #b8872d, #d5aa55) !important;
          color: #fff !important;
          font-weight: 800;
          border-radius: 10px;
          margin-right: 4px;
          box-shadow: 0 5px 12px rgba(184,135,45,.18);
        }
        .search-submit:hover { background: linear-gradient(135deg,#956b1b,#c3943e) !important; }

        .header-action { transition: transform .18s ease, color .18s ease, background .18s ease; }
        .header-action:hover { color: var(--pc-gold-dark) !important; transform: translateY(-1px); }
        .account-action:hover { background: var(--pc-gold-pale) !important; }
        .icon-with-badge b { background: var(--pc-gold) !important; box-shadow: 0 2px 7px rgba(184,135,45,.25); }

        .nav-bar {
          background: #fff !important;
          border-bottom: 1px solid var(--pc-line) !important;
          box-shadow: 0 3px 12px rgba(35,29,18,.025);
        }
        .nav-inner > a { transition: color .18s ease, transform .18s ease; }
        .nav-inner > a:hover { color: var(--pc-gold-dark) !important; transform: translateY(-1px); }
        .all-category-btn {
          background: linear-gradient(135deg,#b8872d,#d7ad57) !important;
          border: 0 !important;
          color: #fff !important;
          box-shadow: 0 6px 14px rgba(184,135,45,.16);
        }
        .nav-new em { background: var(--pc-gold-soft) !important; color: var(--pc-gold-dark) !important; border: 1px solid #ead8ad; }

        .page-content { padding-top: 18px !important; }

        .hero-image-frame {
          border: 1px solid #e5dfd3 !important;
          box-shadow: 0 12px 34px rgba(49,39,19,.09) !important;
          background: #fff !important;
          overflow: hidden;
        }
        .hero-banner { transition: opacity .55s ease, transform .8s ease !important; }
        .hero-image-frame:hover .hero-banner.active { transform: scale(1.008); }
        .hero-shine { pointer-events:none; opacity:.22 !important; }
        .hero-arrow {
          background: rgba(255,255,255,.92) !important;
          color: var(--pc-gold-dark) !important;
          border: 1px solid rgba(184,135,45,.24) !important;
          box-shadow: 0 6px 16px rgba(32,25,12,.12) !important;
          backdrop-filter: blur(8px);
        }
        .hero-arrow:hover { background:#fff !important; transform: translateY(-50%) scale(1.06); }
        .hero-dots button.active { background: var(--pc-gold) !important; box-shadow: 0 0 0 3px rgba(184,135,45,.13); }
        .hero-counter { background: rgba(255,255,255,.88) !important; color: var(--pc-gold-dark) !important; border: 1px solid rgba(184,135,45,.2); }

        .category-section,
        .smart-section,
        .trust-section {
          background: rgba(255,255,255,.88) !important;
          border: 1px solid var(--pc-line) !important;
          box-shadow: 0 8px 24px rgba(39,31,16,.035);
        }
        .category-item { transition: transform .2s ease; }
        .category-item:hover { transform: translateY(-4px); }
        .category-icon {
          background: linear-gradient(145deg,#fff,#fff8e9) !important;
          border: 1px solid #eadfc7 !important;
          box-shadow: 0 6px 15px rgba(53,40,17,.055);
          color: var(--pc-gold-dark) !important;
        }
        .category-item:hover .category-icon { border-color:#d4b36c !important; box-shadow:0 10px 22px rgba(184,135,45,.12); }
        .rail-control { background:#fff !important; border:1px solid #e5dece !important; color:var(--pc-gold-dark) !important; }

        .section-head { margin-top: 32px !important; }
        .section-title { color: var(--pc-ink) !important; font-weight: 900 !important; }
        .section-title > span { background: var(--pc-gold-soft) !important; color: var(--pc-gold-dark) !important; border:1px solid #ead8ae; }
        .section-head > a { color: var(--pc-gold-dark) !important; font-weight:800; }
        .section-head > a:hover { color:#6f4b0f !important; }

        .smart-card {
          background: linear-gradient(145deg,#fff,#fffaf0) !important;
          border: 1px solid #e7deca !important;
          box-shadow: 0 8px 24px rgba(48,38,18,.045) !important;
          position: relative;
          overflow: hidden;
        }
        .smart-card::after {
          content:"";
          position:absolute;
          width:120px;height:120px;
          right:-50px;bottom:-60px;
          border-radius:50%;
          background:rgba(184,135,45,.08);
          pointer-events:none;
        }
        .smart-card:hover { border-color:#d5b36d !important; box-shadow:0 16px 34px rgba(65,49,17,.10) !important; }
        .smart-card-icon { color:var(--pc-gold-dark) !important; background:#fff !important; border:1px solid #eadfc9 !important; }
        .smart-badge { background:var(--pc-gold-soft) !important; color:var(--pc-gold-dark) !important; border:1px solid #ead8ad; }
        .smart-card-link { color:var(--pc-gold-dark) !important; font-weight:800; }

        .product-card {
          background:#fff !important;
          border:1px solid #e9e4da !important;
          box-shadow:0 7px 20px rgba(38,30,17,.045) !important;
          overflow:hidden;
          transition:transform .22s ease, box-shadow .22s ease, border-color .22s ease !important;
          position:relative;
        }
        .product-card:hover {
          transform:translateY(-5px);
          border-color:#d6bb7e !important;
          box-shadow:0 17px 34px rgba(53,40,16,.105) !important;
        }
        .product-card-glow { position:absolute; inset:0 0 auto 0; height:2px; background:linear-gradient(90deg,transparent,#d7ad57,transparent); opacity:0; transition:opacity .2s ease; }
        .product-card:hover .product-card-glow { opacity:1; }
        .product-image-wrap { background:linear-gradient(180deg,#fff,#fdf9f0) !important; }
        .product-image { transition:transform .25s ease !important; }
        .product-card:hover .product-image { transform:scale(1.035); }
        .wish-btn { background:rgba(255,255,255,.95) !important; border:1px solid #e5dfd3 !important; color:#7d776c !important; box-shadow:0 4px 10px rgba(35,27,13,.07); }
        .wish-btn:hover,.wish-btn.wished { color:#b8872d !important; border-color:#d9bf83 !important; background:#fffaf0 !important; }
        .discount-badge { background:#fff3d7 !important; color:#8b631b !important; border:1px solid #ecd7a5; }
        .mini-badge { background:#f7f3ea !important; color:#6d675d !important; border:1px solid #e7e0d4; }
        .rating-pill { background:#f8f1df !important; color:#8b631b !important; }
        .price-row strong { color:#201d18 !important; }
        .stock-warning { color:#a4671c !important; }
        .stock-warning span { background:#c68b28 !important; }
        .add-cart-btn {
          background:linear-gradient(135deg,#b8872d,#d4a950) !important;
          color:#fff !important;
          border:0 !important;
          box-shadow:0 6px 13px rgba(184,135,45,.16);
        }
        .add-cart-btn:hover { background:linear-gradient(135deg,#956b1b,#bd903c) !important; transform:translateY(-1px); }
        .image-view { background:rgba(255,255,255,.94) !important; color:#6f521d !important; border:1px solid #ead9b3; }

        .flash-section {
          background:linear-gradient(135deg,#8b610f 0%,#b8872d 46%,#d9b15e 100%) !important;
          box-shadow:0 18px 40px rgba(125,83,12,.16) !important;
          border:1px solid rgba(255,255,255,.22);
        }
        .flash-product { box-shadow:0 7px 18px rgba(47,34,10,.10); }
        .flash-product:hover { transform:translateY(-5px); }
        .flash-timer span { background:rgba(255,255,255,.96) !important; color:#8a6116 !important; }

        .promo-card {
          border:1px solid #e5ddcd !important;
          box-shadow:0 9px 26px rgba(45,35,17,.055) !important;
        }
        .promo-card:hover { transform:translateY(-3px); box-shadow:0 16px 32px rgba(45,35,17,.09) !important; }

        .trust-item > span { background:var(--pc-gold-soft) !important; color:var(--pc-gold-dark) !important; border:1px solid #ead8ae; }

        .bottom-cta {
          background:linear-gradient(135deg,#fff,#fff8e8) !important;
          border:1px solid #e8dcc1 !important;
          box-shadow:0 12px 32px rgba(47,36,15,.06);
        }
        .bottom-cta h2 { color:#211e18 !important; }

        .primary-btn,
        .gold-btn,
        .cta-btn {
          background:linear-gradient(135deg,#b8872d,#d7ad57) !important;
          color:#fff !important;
          box-shadow:0 7px 16px rgba(184,135,45,.16);
        }

        .toast {
          background:#fff !important;
          color:#29251d !important;
          border:1px solid #dfd4bc !important;
          box-shadow:0 14px 35px rgba(32,25,12,.14) !important;
        }

        .back-top { background:#fff !important; color:var(--pc-gold-dark) !important; border:1px solid #e4dac6 !important; box-shadow:0 8px 18px rgba(32,25,12,.09); }

        .mobile-bottom-nav { display:none; }

        /* --------------------------- TABLET --------------------------- */
        @media (max-width: 980px) {
          .header-main { padding:10px 0 !important; }
          .page-content { padding-top:12px !important; }
          .hero-image-frame { border-radius:14px !important; }
          .five-columns { gap:12px !important; }
          .product-card { border-radius:13px !important; }
        }

        /* --------------------------- MOBILE -------------------------- */
        @media (max-width: 680px) {
          body { padding-bottom:72px; }
          .container { width:calc(100% - 18px) !important; }
          .top-strip { border-bottom:1px solid #e8deca; }
          .strip-inner { min-height:30px !important; }
          .strip-left { width:100%; justify-content:center; gap:8px !important; }
          .strip-left span { font-size:9px !important; }
          .strip-left span:nth-of-type(3), .strip-left i:nth-of-type(2) { display:none !important; }

          .main-header { position:sticky !important; top:0; z-index:1000; }
          .header-main { min-height:auto !important; padding:8px 0 9px !important; gap:8px !important; }
          .logo-wrap { min-width:0 !important; }
          .prime-logo { width:128px !important; max-width:100%; }
          .logo-fallback { transform:scale(.9); transform-origin:left center; }
          .header-actions { display:none !important; }
          .mobile-menu-button {
            display:flex !important;
            width:40px !important;
            height:40px !important;
            align-items:center;
            justify-content:center;
            border:1px solid #e4dac6 !important;
            background:#fffaf0 !important;
            color:#8d641c !important;
            border-radius:11px !important;
          }
          .search-box {
            order:3;
            flex-basis:100% !important;
            max-width:none !important;
            height:43px !important;
            border-radius:12px !important;
          }
          .search-submit { padding:0 14px !important; font-size:11px !important; }
          .search-dropdown { max-height:62vh; overflow:auto; border-radius:14px !important; }

          .page-content { padding-top:9px !important; padding-bottom:25px !important; }
          .hero-image-frame {
            aspect-ratio:1.62 / 1 !important;
            min-height:0 !important;
            border-radius:12px !important;
          }
          .hero-arrow { width:31px !important; height:31px !important; }
          .hero-counter { display:none !important; }
          .hero-dots { bottom:9px !important; }
          .hero-dots button { width:6px !important; height:6px !important; }
          .hero-dots button.active { width:19px !important; border-radius:8px !important; }

          .category-section, .smart-section, .trust-section { border-radius:13px !important; padding:11px !important; }
          .category-section { margin:16px 0 20px !important; }
          .category-rail { gap:9px !important; overflow-x:auto !important; scrollbar-width:none; padding-bottom:3px !important; }
          .category-rail::-webkit-scrollbar { display:none; }
          .category-item { min-width:72px !important; }
          .category-icon { width:48px !important; height:48px !important; }
          .category-item span:not(.category-icon) { font-size:9px !important; line-height:1.2 !important; }
          .category-item small { display:none !important; }
          .rail-control { display:none !important; }

          .section-head { margin-top:22px !important; margin-bottom:10px !important; }
          .section-title { font-size:15px !important; }
          .section-title > span { width:29px !important; height:29px !important; }
          .section-caption { display:none !important; }
          .section-head > a { font-size:10px !important; }

          .five-columns {
            grid-template-columns:repeat(2,minmax(0,1fr)) !important;
            gap:9px !important;
          }
          .five-columns .product-card:nth-child(n) { display:block !important; }
          .product-card { border-radius:12px !important; }
          .product-image-wrap { height:150px !important; padding:11px !important; }
          .product-copy { padding:9px !important; }
          .product-category { font-size:7px !important; margin-bottom:4px !important; }
          .product-name { font-size:10px !important; line-height:1.35 !important; min-height:28px !important; }
          .rating-row { margin-top:5px !important; }
          .rating-pill { font-size:8px !important; padding:3px 5px !important; }
          .review-count { font-size:8px !important; }
          .price-row { gap:5px !important; flex-wrap:wrap; }
          .price-row strong { font-size:13px !important; }
          .price-row del { font-size:8px !important; }
          .add-cart-btn { min-height:32px !important; font-size:9px !important; border-radius:8px !important; }
          .wish-btn { width:29px !important; height:29px !important; top:7px !important; right:7px !important; }
          .wish-btn svg { width:15px !important; }
          .product-badges { top:8px !important; left:7px !important; right:35px !important; }
          .discount-badge, .mini-badge { font-size:7px !important; padding:3px 5px !important; }
          .image-view { display:none !important; }

          .smart-grid { grid-template-columns:1fr 1fr !important; gap:8px !important; }
          .smart-card { min-height:145px !important; padding:11px !important; border-radius:12px !important; }
          .smart-card h3 { font-size:13px !important; }
          .smart-card p { font-size:8px !important; line-height:1.4 !important; }
          .smart-card-icon { width:36px !important; height:36px !important; }
          .smart-card-link { font-size:9px !important; }
          .smart-badge { font-size:7px !important; }

          .flash-section { border-radius:14px !important; margin:23px 0 !important; }
          .flash-header { padding:13px !important; }
          .flash-products { grid-template-columns:repeat(2,minmax(0,1fr)) !important; padding:9px !important; gap:8px !important; }
          .flash-product { min-height:0 !important; padding:9px !important; border-radius:10px !important; }
          .flash-product:nth-child(n+5) { display:none; }
          .flash-product-image { height:95px !important; }
          .flash-title { font-size:15px !important; }
          .flash-timer { margin-left:0 !important; }
          .flash-timer span { min-width:28px !important; font-size:10px !important; }

          .promo-grid { grid-template-columns:1fr !important; gap:9px !important; }
          .promo-card { min-height:128px !important; border-radius:13px !important; }
          .promo-card h3 { font-size:17px !important; }
          .promo-card p { font-size:9px !important; }

          .trust-strip { grid-template-columns:1fr 1fr !important; border-radius:12px !important; }
          .trust-item { padding:10px 7px !important; }
          .trust-item strong { font-size:9px !important; }
          .trust-item small { font-size:7px !important; }
          .trust-item > span { width:32px !important; height:32px !important; }

          .bottom-cta { padding:21px !important; border-radius:14px !important; }
          .bottom-cta h2 { font-size:21px !important; }
          .bottom-cta p { font-size:10px !important; }
          .bottom-cta-actions { gap:7px !important; }

          .mobile-bottom-nav {
            display:grid !important;
            position:fixed;
            left:8px;
            right:8px;
            bottom:8px;
            z-index:1200;
            grid-template-columns:repeat(5,1fr);
            min-height:59px;
            padding:5px;
            background:rgba(255,255,255,.96);
            border:1px solid #e4dac7;
            border-radius:17px;
            box-shadow:0 12px 35px rgba(37,29,13,.16);
            backdrop-filter:blur(14px);
            -webkit-backdrop-filter:blur(14px);
          }
          .mobile-bottom-nav a {
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            gap:3px;
            min-width:0;
            border-radius:12px;
            color:#777168;
            font-size:8px;
            font-weight:800;
            text-decoration:none;
            position:relative;
          }
          .mobile-bottom-nav a:hover,
          .mobile-bottom-nav a:focus { color:#8e6419; background:#fff8e8; }
          .mobile-bottom-nav .mobile-nav-icon { position:relative; line-height:0; }
          .mobile-bottom-nav b {
            position:absolute;
            top:-7px;
            right:-9px;
            min-width:15px;
            height:15px;
            padding:0 3px;
            border-radius:10px;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#b8872d;
            color:#fff;
            font-size:7px;
            border:2px solid #fff;
          }
        }

        @media (max-width: 390px) {
          .container { width:calc(100% - 14px) !important; }
          .prime-logo { width:120px !important; }
          .hero-image-frame { aspect-ratio:1.42 / 1 !important; }
          .product-image-wrap { height:138px !important; }
          .product-copy { padding:8px !important; }
          .product-name { font-size:9px !important; }
          .price-row strong { font-size:12px !important; }
          .smart-grid { grid-template-columns:1fr !important; }
          .smart-card { min-height:125px !important; }
        }

        /* DARK MODE: keep the optional dark theme readable without affecting light mode */
        html.dark .store-shell { background:#15130f; }
        html.dark .main-header,
        html.dark .nav-bar,
        html.dark .search-box,
        html.dark .product-card,
        html.dark .category-section,
        html.dark .smart-section,
        html.dark .trust-section,
        html.dark .mobile-bottom-nav { background:#1b1915 !important; border-color:#39342b !important; }
        html.dark .search-box input,
        html.dark .product-name,
        html.dark .section-title,
        html.dark .bottom-cta h2 { color:#f8f3e8 !important; }
        html.dark .product-image-wrap { background:#211e18 !important; }
        html.dark .smart-card { background:#211e18 !important; }
        html.dark .mobile-bottom-nav a { color:#bdb5a6; }

      `}</style>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <Link href="/dashboard">
          <span className="mobile-nav-icon"><Home size={19} /></span>
          Home
        </Link>
        <Link href="/dashboard/categories">
          <span className="mobile-nav-icon"><Layers3 size={19} /></span>
          Categories
        </Link>
        <Link href="/dashboard/wishlist">
          <span className="mobile-nav-icon"><Heart size={19} />{wishlist.length > 0 && <b>{wishlist.length > 99 ? "99+" : wishlist.length}</b>}</span>
          Wishlist
        </Link>
        <Link href="/dashboard/cart">
          <span className="mobile-nav-icon"><ShoppingCart size={19} />{cartCount > 0 && <b>{cartCount > 99 ? "99+" : cartCount}</b>}</span>
          Cart
        </Link>
        <Link href={userLoggedIn ? "/dashboard/profile" : "/auth/login"}>
          <span className="mobile-nav-icon"><UserRound size={19} /></span>
          Account
        </Link>
      </nav>
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

/* -------------------------------------------------------------------------- */
/* LOADING                                                                    */
/* -------------------------------------------------------------------------- */

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-inner">
        <div className="loading-logo">
          <ShoppingBag size={28} />
        </div>

        <strong>PrimeCart</strong>

        <span>
          Preparing your shopping experience...
        </span>

        <div className="loading-bar" />
      </div>
    </div>
  );
}
dashboard/page
