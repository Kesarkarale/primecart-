"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Crown,
  Flame,
  Gift,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Percent,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Target,
  TicketPercent,
  Truck,
  User,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Product = {
  id: string;
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
  category_id: string | null;
  created_at?: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Order = {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
};

type Profile = {
  full_name: string | null;
  email: string | null;
  avatar_url?: string | null;
};

type RecentProduct = {
  id: string;
  viewedAt: number;
};

type CartItem = {
  id: string;
  quantity: number;
};

/* =========================================================
   CONSTANTS
========================================================= */

const categoryIcons: Record<string, string> = {
  "home-living": "🏠",
  mobile: "📱",
  appliance: "⚡",
  footwear: "👟",
  watch: "⌚",
  bag: "👜",
  "toy-baby": "🧸",
  automotive: "🚗",
  fashion: "👕",
  gaming: "🎮",
  books: "📚",
  beauty: "💄",
  electronics: "💻",
};

const sidebarItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: ShoppingBag,
  },
  {
    label: "Categories",
    href: "/dashboard/categories",
    icon: Package,
  },
  {
    label: "My Orders",
    href: "/dashboard/orders",
    icon: Truck,
  },
  {
    label: "Wishlist",
    href: "/dashboard/wishlist",
    icon: Heart,
  },
];

const smartTools = [
  {
    label: "PrimeMatch",
    href: "/dashboard/prime-match",
    description: "Find products matched to your needs.",
    badge: "SMART MATCH",
    icon: Target,
  },
  {
    label: "Budget Builder",
    href: "/dashboard/budget-builder",
    description: "Plan your shopping without overspending.",
    badge: "BUDGET",
    icon: WalletCards,
  },
  {
    label: "Setup Builder",
    href: "/dashboard/setup-builder",
    description: "Build a complete setup with curated products.",
    badge: "CURATED",
    icon: Sparkles,
  },
  {
    label: "PrimePoints",
    href: "/dashboard/prime-points",
    description: "Earn rewards from your shopping activity.",
    badge: "REWARDS",
    icon: Crown,
  },
];

const heroSlides = [
  {
    eyebrow: "PRIMECART EXCLUSIVE",
    title: "Smart shopping starts here.",
    description:
      "Discover products picked around your needs, budget and lifestyle.",
    button: "Shop Now",
    href: "/dashboard/products",
    tag: "UP TO 60% OFF",
    icon: Sparkles,
  },
  {
    eyebrow: "FLASH SALE",
    title: "Big deals. Limited time.",
    description:
      "Grab selected products at special prices before the timer ends.",
    button: "Explore Deals",
    href: "/dashboard/products",
    tag: "LIMITED TIME",
    icon: Flame,
  },
  {
    eyebrow: "SMART SHOPPING",
    title: "Let PrimeMatch find it for you.",
    description:
      "Tell us what you need and get product suggestions that fit.",
    button: "Try PrimeMatch",
    href: "/dashboard/prime-match",
    tag: "SMART MATCH",
    icon: Target,
  },
];

const coupons = [
  {
    code: "PRIME100",
    title: "₹100 OFF",
    description: "On orders above ₹1,499",
  },
  {
    code: "WELCOME10",
    title: "10% OFF",
    description: "On selected products",
  },
  {
    code: "SAVE250",
    title: "₹250 OFF",
    description: "On orders above ₹2,999",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getImageCandidates(value: string | null) {
  if (!value) return [];

  const image = value.trim();

  if (!image) return [];

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return [image];
  }

  if (image.startsWith("/")) {
    return [image];
  }

  return [`/${image}`, `/products/${image}`];
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function discountPercentage(
  price: number,
  originalPrice: number | null
) {
  if (!originalPrice || originalPrice <= price) return 0;

  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function getInitials(name: string) {
  const clean = name.trim();

  if (!clean) return "PC";

  const parts = clean.split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatOrderStatus(status: string) {
  if (!status) return "Processing";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

/* =========================================================
   PRODUCT IMAGE
========================================================= */

function ProductImage({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const candidates = getImageCandidates(product.image_url);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [product.image_url]);

  if (!candidates.length || index >= candidates.length) {
    return (
      <div className={`product-image-fallback ${className}`}>
        <ShoppingBag size={34} strokeWidth={1.4} />
        <span>No image</span>
      </div>
    );
  }

  return (
    <div className={`product-image-wrapper ${className}`}>
      <Image
        src={candidates[index]}
        alt={product.name}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1100px) 30vw, 240px"
        className="product-image-full"
        onError={() => setIndex((current) => current + 1)}
      />
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);

  const [mobileMenu, setMobileMenu] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [wishlistCount, setWishlistCount] = useState(0);

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState("all");

  const [heroIndex, setHeroIndex] = useState(0);

  const [recentlyViewed, setRecentlyViewed] = useState<
    RecentProduct[]
  >([]);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [toast, setToast] = useState("");

  const [dealMessage, setDealMessage] = useState(
    "Your mystery deal is waiting."
  );

  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 32,
    seconds: 18,
  });

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.replace("/auth/login");
          return;
        }

        const [
          profileResult,
          productsResult,
          categoriesResult,
          ordersResult,
          wishlistResult,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name,email,avatar_url")
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("products")
            .select(
              `
                id,
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
                is_active,
                category_id,
                created_at
              `
            )
            .eq("is_active", true)
            .order("created_at", { ascending: false }),

          supabase
            .from("categories")
            .select("id,name,slug")
            .order("name", { ascending: true }),

          supabase
            .from("orders")
            .select("id,status,total_amount,created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),

          supabase
            .from("wishlist")
            .select("id")
            .eq("user_id", user.id),
        ]);

        if (!mounted) return;

        const metadataName =
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : "";

        const fallbackProfile: Profile = {
          full_name:
            metadataName ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "PrimeCart User",
          email: user.email || null,
          avatar_url:
            typeof user.user_metadata?.avatar_url === "string"
              ? user.user_metadata.avatar_url
              : null,
        };

        setProfile(
          profileResult.data
            ? {
                ...fallbackProfile,
                ...profileResult.data,
              }
            : fallbackProfile
        );

        if (!productsResult.error && productsResult.data) {
          setProducts(productsResult.data as Product[]);
        }

        if (!categoriesResult.error && categoriesResult.data) {
          setCategories(categoriesResult.data as Category[]);
        }

        if (!ordersResult.error && ordersResult.data) {
          setOrders(ordersResult.data as Order[]);
        }

        if (!wishlistResult.error && wishlistResult.data) {
          setWishlistCount(wishlistResult.data.length);
        }
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  /* =======================================================
     LOCAL STORAGE
  ======================================================= */

  useEffect(() => {
    try {
      const storedRecent = localStorage.getItem(
        "primecart_recently_viewed"
      );

      if (storedRecent) {
        const parsed = JSON.parse(storedRecent);

        if (Array.isArray(parsed)) {
          setRecentlyViewed(parsed);
        }
      }

      const storedCart = localStorage.getItem("primecart_cart");

      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch {
      setRecentlyViewed([]);
      setCart([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "primecart_cart",
        JSON.stringify(cart)
      );
    } catch {
      // Ignore storage errors.
    }
  }, [cart]);

  /* =======================================================
     HERO AUTO SLIDE
  ======================================================= */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) =>
        current === heroSlides.length - 1 ? 0 : current + 1
      );
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  /* =======================================================
     FLASH COUNTDOWN
  ======================================================= */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
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
              hours = 4;
            }
          }
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  /* =======================================================
     TOAST
  ======================================================= */

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast("");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [toast]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const featuredProducts = useMemo(() => {
    const featured = products.filter(
      (product) => product.is_featured
    );

    return (featured.length ? featured : products).slice(0, 8);
  }, [products]);

  const flashProducts = useMemo(() => {
    const flash = products.filter(
      (product) => product.is_flash_sale
    );

    return (flash.length ? flash : products).slice(0, 6);
  }, [products]);

  const latestProducts = useMemo(() => {
    return products.slice(0, 8);
  }, [products]);

  const filteredCategoryProducts = useMemo(() => {
    if (activeCategory === "all") {
      return products.slice(0, 8);
    }

    return products
      .filter(
        (product) => product.category_id === activeCategory
      )
      .slice(0, 8);
  }, [products, activeCategory]);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [];

    return products
      .filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const brand = product.brand?.toLowerCase() || "";
        const description =
          product.short_description?.toLowerCase() || "";

        return (
          name.includes(query) ||
          brand.includes(query) ||
          description.includes(query)
        );
      })
      .slice(0, 7);
  }, [products, search]);

  const totalSpent = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    );
  }, [orders]);

  const primePoints = Math.floor(totalSpent / 10);

  const userName =
    profile?.full_name ||
    profile?.email?.split("@")[0] ||
    "PrimeCart User";

  const firstName = userName.split(" ")[0];

  const recentProducts = useMemo(() => {
    return recentlyViewed
      .map((item) =>
        products.find((product) => product.id === item.id)
      )
      .filter(Boolean) as Product[];
  }, [recentlyViewed, products]);

  const visibleRecentProducts =
    recentProducts.length > 0
      ? recentProducts.slice(0, 4)
      : latestProducts.slice(0, 4);

  const pointsProgress = Math.min(
    100,
    ((primePoints % 1000) / 1000) * 100
  );

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const cartProducts = useMemo(() => {
    return cart
      .map((item) => {
        const product = products.find(
          (product) => product.id === item.id
        );

        if (!product) return null;

        return {
          product,
          quantity: item.quantity,
        };
      })
      .filter(Boolean) as {
      product: Product;
      quantity: number;
    }[];
  }, [cart, products]);

  const cartSubtotal = cartProducts.reduce(
    (sum, item) =>
      sum + item.product.price * item.quantity,
    0
  );

  const cartSavings = cartProducts.reduce(
    (sum, item) => {
      const original =
        item.product.original_price || item.product.price;

      return (
        sum +
        Math.max(
          0,
          original - item.product.price
        ) *
          item.quantity
      );
    },
    0
  );

  /* =======================================================
     ACTIONS
  ======================================================= */

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.replace("/auth/login");
  }

  function showToast(message: string) {
    setToast(message);
  }

  function openProduct(product: Product) {
    try {
      const current: RecentProduct[] = JSON.parse(
        localStorage.getItem(
          "primecart_recently_viewed"
        ) || "[]"
      );

      const updated: RecentProduct[] = [
        {
          id: product.id,
          viewedAt: Date.now(),
        },
        ...current.filter(
          (item) => item.id !== product.id
        ),
      ].slice(0, 10);

      localStorage.setItem(
        "primecart_recently_viewed",
        JSON.stringify(updated)
      );

      setRecentlyViewed(updated);
    } catch {
      // Ignore storage errors.
    }
  }

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  Math.max(product.stock, 1)
                ),
              }
            : item
        );
      }

      return [
        ...current,
        {
          id: product.id,
          quantity: 1,
        },
      ];
    });

    showToast(`${product.name} added to cart`);
  }

  function updateCartQuantity(
    productId: string,
    quantity: number
  ) {
    if (quantity <= 0) {
      setCart((current) =>
        current.filter(
          (item) => item.id !== productId
        )
      );

      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  }

  function removeFromCart(productId: string) {
    setCart((current) =>
      current.filter(
        (item) => item.id !== productId
      )
    );

    showToast("Item removed from cart");
  }

  function revealMysteryDeal() {
    const deals = [
      "You unlocked a surprise PrimeCart deal!",
      "A special discount is waiting for you.",
      "Your personalized deal has been revealed!",
      "PrimeCart found something special for you.",
    ];

    const random =
      deals[Math.floor(Math.random() * deals.length)];

    setDealMessage(random);
    showToast("Mystery deal unlocked");
  }

  function nextHero() {
    setHeroIndex((current) =>
      current === heroSlides.length - 1
        ? 0
        : current + 1
    );
  }

  function previousHero() {
    setHeroIndex((current) =>
      current === 0
        ? heroSlides.length - 1
        : current - 1
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-brand">
          <div className="loading-mark">P</div>

          <div>
            <strong>PrimeCart</strong>
            <span>Smart shopping</span>
          </div>
        </div>

        <div className="loading-spinner" />

        <p>Preparing your shopping dashboard...</p>

        <style jsx>{`
          .dashboard-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 18px;
            background: #fffdf9;
            color: #44392d;
          }

          .loading-brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .loading-mark {
            width: 48px;
            height: 48px;
            display: grid;
            place-items: center;
            border-radius: 15px;
            background: linear-gradient(
              135deg,
              #d8b86a,
              #a77b2f
            );
            color: #fff;
            font-weight: 900;
            font-size: 21px;
            box-shadow: 0 12px 35px rgba(184, 135, 45, 0.25);
          }

          .loading-brand strong {
            display: block;
            font-size: 21px;
          }

          .loading-brand span {
            color: #9d907e;
            font-size: 12px;
          }

          .loading-spinner {
            width: 34px;
            height: 34px;
            border: 3px solid #eadfcb;
            border-top-color: #b8872d;
            border-radius: 50%;
            animation: pcspin 0.8s linear infinite;
          }

          .dashboard-loading p {
            color: #978b7b;
            font-size: 13px;
          }

          @keyframes pcspin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  const hero = heroSlides[heroIndex];
  const HeroIcon = hero.icon;

  return (
    <div className="prime-dashboard">
      {/* ===================================================
          TOAST
      =================================================== */}

      {toast && (
        <div className="pc-toast">
          <span className="toast-check">
            <Check size={15} />
          </span>
          <span>{toast}</span>
        </div>
      )}

      {/* ===================================================
          CART DRAWER
      =================================================== */}

      {cartOpen && (
        <>
          <button
            className="drawer-overlay"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          />

          <aside className="cart-drawer">
            <div className="cart-drawer-head">
              <div>
                <span>YOUR SHOPPING BAG</span>
                <h2>Cart ({cartCount})</h2>
              </div>

              <button
                className="close-round"
                onClick={() => setCartOpen(false)}
              >
                <X size={19} />
              </button>
            </div>

            {cartProducts.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">
                  <ShoppingCart size={38} />
                </div>

                <h3>Your cart is empty</h3>

                <p>
                  Add products you love and they will
                  appear here.
                </p>

                <Link
                  href="/dashboard/products"
                  onClick={() => setCartOpen(false)}
                  className="gold-button"
                >
                  Start Shopping
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartProducts.map(
                    ({ product, quantity }) => (
                      <div
                        className="cart-item"
                        key={product.id}
                      >
                        <div className="cart-item-image">
                          <ProductImage product={product} />
                        </div>

                        <div className="cart-item-info">
                          <span>
                            {product.brand ||
                              "PrimeCart"}
                          </span>

                          <strong>{product.name}</strong>

                          <b>
                            {formatPrice(product.price)}
                          </b>

                          <div className="cart-item-actions">
                            <div className="quantity-control">
                              <button
                                onClick={() =>
                                  updateCartQuantity(
                                    product.id,
                                    quantity - 1
                                  )
                                }
                              >
                                −
                              </button>

                              <span>{quantity}</span>

                              <button
                                onClick={() =>
                                  updateCartQuantity(
                                    product.id,
                                    quantity + 1
                                  )
                                }
                              >
                                +
                              </button>
                            </div>

                            <button
                              className="remove-cart"
                              onClick={() =>
                                removeFromCart(
                                  product.id
                                )
                              }
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="cart-summary">
                  <div className="summary-line">
                    <span>Subtotal</span>
                    <strong>
                      {formatPrice(cartSubtotal)}
                    </strong>
                  </div>

                  <div className="summary-line savings">
                    <span>You save</span>
                    <strong>
                      {formatPrice(cartSavings)}
                    </strong>
                  </div>

                  <div className="summary-line delivery">
                    <span>Delivery</span>
                    <strong>
                      {cartSubtotal >= 499
                        ? "FREE"
                        : "Calculated at checkout"}
                    </strong>
                  </div>

                  <div className="summary-total">
                    <span>Total</span>
                    <strong>
                      {formatPrice(cartSubtotal)}
                    </strong>
                  </div>

                  <button
                    className="checkout-button"
                    onClick={() =>
                      showToast(
                        "Checkout page will open from the cart."
                      )
                    }
                  >
                    Proceed to Checkout
                    <ArrowRight size={17} />
                  </button>

                  <p className="secure-note">
                    <ShieldCheck size={14} />
                    Secure checkout • Easy returns
                  </p>
                </div>
              </>
            )}
          </aside>
        </>
      )}

      {/* ===================================================
          MOBILE MENU
      =================================================== */}

      {mobileMenu && (
        <button
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
          aria-label="Close menu"
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`dashboard-sidebar ${
          mobileMenu ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <Link
            href="/dashboard"
            className="brand-link"
            onClick={() => setMobileMenu(false)}
          >
            <div className="brand-mark">
              <span>P</span>
            </div>

            <div className="brand-copy">
              <strong>PrimeCart</strong>
              <span>Smart shopping</span>
            </div>
          </Link>

          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-scroll">
          <div className="sidebar-label">
            MAIN MENU
          </div>

          <nav className="sidebar-nav">
            {sidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${
                    item.href === "/dashboard"
                      ? "sidebar-link-active"
                      : ""
                  }`}
                  onClick={() =>
                    setMobileMenu(false)
                  }
                >
                  <span className="sidebar-icon">
                    <Icon size={18} />
                  </span>

                  <span>{item.label}</span>

                  {item.label === "Wishlist" &&
                    wishlistCount > 0 && (
                      <span className="sidebar-count">
                        {wishlistCount}
                      </span>
                    )}
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-label smart-label">
            SMART TOOLS
          </div>

          <div className="smart-sidebar">
            {smartTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <Link
                  href={tool.href}
                  key={tool.href}
                  className="smart-sidebar-item"
                  onClick={() =>
                    setMobileMenu(false)
                  }
                >
                  <span className="smart-sidebar-icon">
                    <Icon size={16} />
                  </span>

                  <span className="smart-sidebar-content">
                    <strong>{tool.label}</strong>
                    <small>{tool.badge}</small>
                  </span>

                  <ChevronRight size={15} />
                </Link>
              );
            })}
          </div>

          <div className="sidebar-help">
            <div className="sidebar-help-icon">
              <ShieldCheck size={20} />
            </div>

            <strong>Safe shopping</strong>

            <p>
              Secure checkout, protected payments and
              easy returns.
            </p>

            <Link href="/dashboard/orders">
              Learn more
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="sidebar-bottom">
          <Link
            href="/dashboard/settings"
            className="sidebar-bottom-link"
          >
            <Settings size={18} />
            Settings
          </Link>

          <button
            className="sidebar-bottom-link logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="dashboard-main">
        {/* =================================================
            UTILITY BAR
        ================================================= */}

        <div className="utility-bar">
          <div>
            <Truck size={14} />
            Free delivery on orders above ₹499
          </div>

          <div className="utility-right">
            <span>
              <BadgeCheck size={14} />
              Genuine products
            </span>

            <span>
              <ShieldCheck size={14} />
              Secure payments
            </span>

            <span>
              Easy returns
            </span>
          </div>
        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="dashboard-header">
          <div className="header-left">
            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={21} />
            </button>

            <Link
              href="/dashboard"
              className="mobile-brand"
            >
              <span>P</span>
              <strong>PrimeCart</strong>
            </Link>

            <div className="header-search-wrap">
              <div className="search-category">
                All
                <ChevronDown size={13} />
              </div>

              <Search
                size={18}
                className="header-search-icon"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onFocus={() =>
                  setSearchFocused(true)
                }
                onBlur={() => {
                  window.setTimeout(
                    () => setSearchFocused(false),
                    180
                  );
                }}
                placeholder="Search products, brands & categories"
                className="header-search"
              />

              {search && (
                <button
                  className="search-clear"
                  onMouseDown={(event) =>
                    event.preventDefault()
                  }
                  onClick={() => setSearch("")}
                >
                  <X size={15} />
                </button>
              )}

              <button className="search-submit">
                <Search size={18} />
              </button>

              {searchFocused && search.trim() && (
                <div className="search-results">
                  <div className="search-results-head">
                    <span>Search results</span>
                    <small>
                      {searchResults.length} found
                    </small>
                  </div>

                  {searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/dashboard/products/${product.id}`}
                        className="search-result-item"
                        onClick={() =>
                          openProduct(product)
                        }
                      >
                        <div className="search-result-image">
                          <ProductImage
                            product={product}
                          />
                        </div>

                        <div className="search-result-info">
                          <strong>
                            {product.name}
                          </strong>

                          <span>
                            {product.brand ||
                              "PrimeCart"}
                          </span>

                          <b>
                            {formatPrice(
                              product.price
                            )}
                          </b>
                        </div>

                        <ChevronRight size={16} />
                      </Link>
                    ))
                  ) : (
                    <div className="search-empty">
                      <Search size={27} />
                      <strong>
                        No products found
                      </strong>
                      <span>
                        Try another product or brand.
                      </span>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <Link
                      href="/dashboard/products"
                      className="search-view-all"
                    >
                      View all products
                      <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="header-right">
            <button
              className="header-icon-button"
              onClick={() =>
                setNotificationOpen(
                  !notificationOpen
                )
              }
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="notification-dot" />
            </button>

            <Link
              href="/dashboard/wishlist"
              className="header-icon-button desktop-action"
            >
              <Heart size={19} />

              {wishlistCount > 0 && (
                <span className="header-count">
                  {wishlistCount > 9
                    ? "9+"
                    : wishlistCount}
                </span>
              )}
            </Link>

            <button
              className="header-icon-button cart-header-button"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart size={20} />

              {cartCount > 0 && (
                <span className="header-count cart-count">
                  {cartCount > 9
                    ? "9+"
                    : cartCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="notification-panel">
                <div className="notification-head">
                  <strong>Notifications</strong>
                  <span>3 new</span>
                </div>

                <div className="notification-item">
                  <span className="notification-icon">
                    <Truck size={16} />
                  </span>

                  <div>
                    <strong>
                      Easy returns available
                    </strong>
                    <p>
                      Shop confidently with PrimeCart.
                    </p>
                  </div>
                </div>

                <div className="notification-item">
                  <span className="notification-icon">
                    <Flame size={16} />
                  </span>

                  <div>
                    <strong>
                      Flash Deals are live
                    </strong>
                    <p>
                      Limited-time offers are waiting.
                    </p>
                  </div>
                </div>

                <div className="notification-item">
                  <span className="notification-icon">
                    <Crown size={16} />
                  </span>

                  <div>
                    <strong>
                      PrimePoints update
                    </strong>
                    <p>
                      Keep shopping to unlock rewards.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="header-profile-wrap">
              <button
                className="header-profile"
                onClick={() =>
                  setProfileOpen(!profileOpen)
                }
              >
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={userName}
                    width={38}
                    height={38}
                    className="avatar-image"
                  />
                ) : (
                  <div className="avatar">
                    {getInitials(userName)}
                  </div>
                )}

                <span className="header-profile-copy">
                  <strong>{firstName}</strong>
                  <small>Prime member</small>
                </span>

                <ChevronDown size={15} />
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-head">
                    <div className="avatar large">
                      {getInitials(userName)}
                    </div>

                    <div>
                      <strong>{userName}</strong>
                      <span>
                        {profile?.email}
                      </span>
                    </div>
                  </div>

                  <div className="profile-divider" />

                  <Link href="/profile">
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

                  <button
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* =================================================
            PAGE
        ================================================= */}

        <div className="dashboard-content">
          {/* =================================================
              HERO
          ================================================= */}

          <section className="hero-section">
            <div className="hero-main">
              <div className="hero-content">
                <span className="hero-eyebrow">
                  <HeroIcon size={14} />
                  {hero.eyebrow}
                </span>

                <h1>{hero.title}</h1>

                <p>{hero.description}</p>

                <div className="hero-actions">
                  <Link
                    href={hero.href}
                    className="hero-button"
                  >
                    {hero.button}
                    <ArrowRight size={17} />
                  </Link>

                  <button
                    className="hero-secondary"
                    onClick={() =>
                      setHeroIndex(
                        (heroIndex + 1) %
                          heroSlides.length
                      )
                    }
                  >
                    Discover more
                  </button>
                </div>

                <div className="hero-tag">
                  <Zap size={14} />
                  {hero.tag}
                </div>
              </div>

              <div className="hero-visual">
                <div className="hero-glow hero-glow-one" />
                <div className="hero-glow hero-glow-two" />

                <div className="hero-shopping-card">
                  <div className="mini-card-top">
                    <span>
                      <Sparkles size={13} />
                      Smart Pick
                    </span>

                    <span className="mini-live">
                      LIVE
                    </span>
                  </div>

                  <div className="hero-shopping-icon">
                    <ShoppingBag size={52} />
                  </div>

                  <strong>
                    Curated for you
                  </strong>

                  <span>
                    Products that fit your needs
                  </span>

                  <div className="mini-score">
                    <span>Match</span>
                    <b>94%</b>
                  </div>
                </div>

                <div className="floating-offer offer-one">
                  <Flame size={15} />
                  <span>
                    <strong>Flash Sale</strong>
                    Up to 60% off
                  </span>
                </div>

                <div className="floating-offer offer-two">
                  <ShieldCheck size={15} />
                  Secure shopping
                </div>
              </div>

              <button
                className="hero-arrow hero-arrow-left"
                onClick={previousHero}
              >
                <ChevronLeft size={20} />
              </button>

              <button
                className="hero-arrow hero-arrow-right"
                onClick={nextHero}
              >
                <ChevronRight size={20} />
              </button>

              <div className="hero-dots">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    className={
                      index === heroIndex
                        ? "hero-dot active"
                        : "hero-dot"
                    }
                    onClick={() =>
                      setHeroIndex(index)
                    }
                    aria-label={`Slide ${
                      index + 1
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* =================================================
              QUICK BENEFITS
          ================================================= */}

          <section className="benefits-strip">
            <div className="benefit">
              <span>
                <Truck size={20} />
              </span>
              <div>
                <strong>Free Delivery</strong>
                <small>
                  On orders above ₹499
                </small>
              </div>
            </div>

            <div className="benefit-divider" />

            <div className="benefit">
              <span>
                <ShieldCheck size={20} />
              </span>
              <div>
                <strong>Secure Payments</strong>
                <small>
                  Safe & protected checkout
                </small>
              </div>
            </div>

            <div className="benefit-divider" />

            <div className="benefit">
              <span>
                <RefreshIcon />
              </span>
              <div>
                <strong>Easy Returns</strong>
                <small>
                  Hassle-free shopping
                </small>
              </div>
            </div>

            <div className="benefit-divider" />

            <div className="benefit">
              <span>
                <BadgeCheck size={20} />
              </span>
              <div>
                <strong>Trusted Products</strong>
                <small>
                  Quality-first shopping
                </small>
              </div>
            </div>
          </section>

          {/* =================================================
              WELCOME + POINTS
          ================================================= */}

          <section className="welcome-grid">
            <div className="welcome-card">
              <div>
                <span className="section-kicker">
                  WELCOME BACK
                </span>

                <h2>
                  Hey {firstName}, ready to shop
                  smarter?
                </h2>

                <p>
                  Explore personalized products,
                  exclusive deals and smart shopping
                  tools built for you.
                </p>
              </div>

              <div className="welcome-actions">
                <Link
                  href="/dashboard/products"
                  className="gold-button"
                >
                  Start Shopping
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/dashboard/prime-match"
                  className="light-button"
                >
                  Try PrimeMatch
                  <Target size={16} />
                </Link>
              </div>
            </div>

            <div className="points-card">
              <div className="points-top">
                <div className="points-icon">
                  <Crown size={20} />
                </div>

                <span>PRIMEPOINTS</span>

                <Link href="/dashboard/prime-points">
                  <ArrowRight size={16} />
                </Link>
              </div>

              <strong className="points-number">
                {primePoints.toLocaleString("en-IN")}
              </strong>

              <p>
                Keep shopping to unlock your next
                reward.
              </p>

              <div className="points-progress">
                <span
                  style={{
                    width: `${pointsProgress}%`,
                  }}
                />
              </div>

              <div className="points-footer">
                <span>
                  {1000 - (primePoints % 1000)} points
                  to next reward
                </span>

                <b>1000</b>
              </div>
            </div>
          </section>

          {/* =================================================
              STATS
          ================================================= */}

          <section className="stats-grid">
            <Link
              href="/dashboard/orders"
              className="stat-card"
            >
              <div className="stat-icon gold-icon">
                <ShoppingBag size={20} />
              </div>

              <div className="stat-content">
                <span>Total Orders</span>
                <strong>{orders.length}</strong>
                <small>
                  {orders.length
                    ? "Your shopping history"
                    : "Start your first order"}
                </small>
              </div>

              <ChevronRight size={17} />
            </Link>

            <Link
              href="/dashboard/wishlist"
              className="stat-card"
            >
              <div className="stat-icon rose-icon">
                <Heart size={20} />
              </div>

              <div className="stat-content">
                <span>Wishlist</span>
                <strong>{wishlistCount}</strong>
                <small>
                  {wishlistCount
                    ? "Items saved for later"
                    : "Save products you love"}
                </small>
              </div>

              <ChevronRight size={17} />
            </Link>

            <div className="stat-card">
              <div className="stat-icon green-icon">
                <CircleDollarSign size={20} />
              </div>

              <div className="stat-content">
                <span>Total Spent</span>
                <strong>
                  {formatPrice(totalSpent)}
                </strong>
                <small>Across all orders</small>
              </div>
            </div>

            <Link
              href="/dashboard/prime-points"
              className="stat-card"
            >
              <div className="stat-icon purple-icon">
                <Crown size={20} />
              </div>

              <div className="stat-content">
                <span>PrimePoints</span>
                <strong>{primePoints}</strong>
                <small>Rewards earned</small>
              </div>

              <ChevronRight size={17} />
            </Link>
          </section>

          {/* =================================================
              SHOP BY CATEGORY
          ================================================= */}

          <section className="section">
            <div className="section-heading compact">
              <div>
                <span className="section-kicker">
                  EXPLORE
                </span>

                <h2>Shop by category</h2>

                <p>
                  Find what you need faster.
                </p>
              </div>

              <Link
                href="/dashboard/categories"
                className="view-all-link"
              >
                View all
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="category-strip">
              <button
                className={`category-card ${
                  activeCategory === "all"
                    ? "category-card-active"
                    : ""
                }`}
                onClick={() =>
                  setActiveCategory("all")
                }
              >
                <span className="category-emoji">
                  ✨
                </span>

                <strong>All</strong>
                <small>
                  {products.length} items
                </small>
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-card ${
                    activeCategory === category.id
                      ? "category-card-active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveCategory(category.id)
                  }
                >
                  <span className="category-emoji">
                    {categoryIcons[category.slug] ||
                      "🛍️"}
                  </span>

                  <strong>{category.name}</strong>

                  <small>
                    {
                      products.filter(
                        (product) =>
                          product.category_id ===
                          category.id
                      ).length
                    }{" "}
                    items
                  </small>
                </button>
              ))}
            </div>
          </section>

          {/* =================================================
              DEAL OF THE DAY
          ================================================= */}

          <section className="deal-banner">
            <div className="deal-left">
              <span className="deal-kicker">
                <Flame size={14} />
                DEAL OF THE DAY
              </span>

              <h2>
                More savings. More reasons to shop.
              </h2>

              <p>
                Explore today's selected products with
                special PrimeCart pricing.
              </p>

              <Link
                href="/dashboard/products"
                className="deal-button"
              >
                Shop Today's Deals
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="deal-timer-wrap">
              <span>ENDS IN</span>

              <div className="deal-timer">
                <div>
                  <strong>
                    {String(
                      timeLeft.hours
                    ).padStart(2, "0")}
                  </strong>
                  <small>Hours</small>
                </div>

                <b>:</b>

                <div>
                  <strong>
                    {String(
                      timeLeft.minutes
                    ).padStart(2, "0")}
                  </strong>
                  <small>Minutes</small>
                </div>

                <b>:</b>

                <div>
                  <strong>
                    {String(
                      timeLeft.seconds
                    ).padStart(2, "0")}
                  </strong>
                  <small>Seconds</small>
                </div>
              </div>

              <span className="deal-timer-note">
                Limited stock available
              </span>
            </div>
          </section>

          {/* =================================================
              FLASH DEALS
          ================================================= */}

          <section className="section">
            <div className="section-heading compact">
              <div>
                <div className="title-with-live">
                  <span className="section-kicker red">
                    LIMITED TIME
                  </span>

                  <span className="live-badge">
                    <span />
                    LIVE
                  </span>
                </div>

                <h2>Flash Deals</h2>

                <p>
                  Grab selected products before they
                  disappear.
                </p>
              </div>

              <Link
                href="/dashboard/products"
                className="view-all-link"
              >
                View deals
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="product-grid flash-product-grid">
              {flashProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpen={openProduct}
                  onAdd={addToCart}
                  showFlash
                />
              ))}
            </div>
          </section>

          {/* =================================================
              SMART TOOLS
          ================================================= */}

          <section className="section">
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  SMART SHOPPING
                </span>

                <h2>
                  Shop smarter with PrimeCart
                </h2>

                <p>
                  Powerful tools designed around the
                  way you shop.
                </p>
              </div>

              <Sparkles
                size={24}
                className="heading-sparkle"
              />
            </div>

            <div className="smart-tools-grid">
              {smartTools.map((tool, index) => {
                const Icon = tool.icon;

                return (
                  <Link
                    href={tool.href}
                    key={tool.href}
                    className="smart-tool-card"
                    style={{
                      animationDelay: `${index * 70}ms`,
                    }}
                  >
                    <div className="smart-tool-top">
                      <span className="smart-tool-badge">
                        {tool.badge}
                      </span>

                      <span className="smart-tool-arrow">
                        <ArrowRight size={15} />
                      </span>
                    </div>

                    <div className="smart-tool-icon">
                      <Icon size={23} />
                    </div>

                    <h3>{tool.label}</h3>

                    <p>{tool.description}</p>

                    <span className="smart-tool-link">
                      Explore tool
                      <ChevronRight size={14} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* =================================================
              CATEGORY PRODUCTS
          ================================================= */}

          <section className="section">
            <div className="section-heading compact">
              <div>
                <span className="section-kicker">
                  {activeCategory === "all"
                    ? "TRENDING NOW"
                    : "CATEGORY PICKS"}
                </span>

                <h2>
                  {activeCategory === "all"
                    ? "Popular products"
                    : categories.find(
                        (category) =>
                          category.id ===
                          activeCategory
                      )?.name ||
                      "Category products"}
                </h2>
              </div>

              <Link
                href="/dashboard/products"
                className="view-all-link"
              >
                View all products
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="product-grid">
              {filteredCategoryProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpen={openProduct}
                    onAdd={addToCart}
                  />
                )
              )}
            </div>
          </section>

          {/* =================================================
              PERSONALIZED
          ================================================= */}

          <section className="personalized-section">
            <div className="personalized-copy">
              <span className="section-kicker">
                FOR YOU
              </span>

              <h2>
                Picks that match your shopping style.
              </h2>

              <p>
                Discover products selected from your
                recent activity and PrimeCart's featured
                collection.
              </p>

              <Link
                href="/dashboard/prime-match"
                className="gold-button"
              >
                Find My Match
                <Target size={16} />
              </Link>
            </div>

            <div className="personalized-mini-grid">
              {featuredProducts
                .slice(0, 4)
                .map((product) => (
                  <Link
                    key={product.id}
                    href={`/dashboard/products/${product.id}`}
                    className="mini-product"
                    onClick={() =>
                      openProduct(product)
                    }
                  >
                    <div className="mini-product-image">
                      <ProductImage
                        product={product}
                      />
                    </div>

                    <div>
                      <span>
                        {product.brand ||
                          "PrimeCart"}
                      </span>

                      <strong>
                        {product.name}
                      </strong>

                      <b>
                        {formatPrice(product.price)}
                      </b>
                    </div>
                  </Link>
                ))}
            </div>
          </section>

          {/* =================================================
              BUDGET + SETUP + MYSTERY
          ================================================= */}

          <section className="feature-grid">
            <Link
              href="/dashboard/budget-builder"
              className="feature-panel budget-panel"
            >
              <div className="feature-panel-content">
                <span className="feature-label">
                  BUDGET BUILDER
                </span>

                <h2>
                  Build your basket without
                  overspending.
                </h2>

                <p>
                  Set a shopping budget and discover
                  products that fit inside it.
                </p>

                <span className="feature-link">
                  Build my budget
                  <ArrowRight size={15} />
                </span>
              </div>

              <div className="budget-visual">
                <WalletCards size={54} />
                <span>₹10,000</span>
                <small>Your smart budget</small>
              </div>
            </Link>

            <Link
              href="/dashboard/setup-builder"
              className="feature-panel setup-panel"
            >
              <div className="feature-panel-content">
                <span className="feature-label">
                  BUILD MY SETUP
                </span>

                <h2>
                  Everything you need in one setup.
                </h2>

                <p>
                  Gaming, college, work, fitness,
                  creator and home setups.
                </p>

                <span className="feature-link">
                  Build a setup
                  <ArrowRight size={15} />
                </span>
              </div>

              <div className="setup-visual">
                <div>💻</div>
                <div>🎧</div>
                <div>⌨️</div>
                <div>🖱️</div>
              </div>
            </Link>
          </section>

          {/* =================================================
              MYSTERY DEAL
          ================================================= */}

          <section className="mystery-section">
            <div className="mystery-icon">
              <Gift size={32} />
            </div>

            <div className="mystery-copy">
              <span>MYSTERY DEAL</span>

              <h2>
                {dealMessage}
              </h2>

              <p>
                Reveal your surprise PrimeCart offer.
              </p>
            </div>

            <button
              className="mystery-button"
              onClick={revealMysteryDeal}
            >
              Reveal Deal
              <Sparkles size={16} />
            </button>
          </section>

          {/* =================================================
              COUPONS
          ================================================= */}

          <section className="section">
            <div className="section-heading compact">
              <div>
                <span className="section-kicker">
                  SAVE MORE
                </span>

                <h2>Coupons & offers</h2>

                <p>
                  Use these offers on eligible orders.
                </p>
              </div>

              <span className="coupon-note">
                <TicketPercent size={15} />
                Limited availability
              </span>
            </div>

            <div className="coupon-grid">
              {coupons.map((coupon) => (
                <div
                  className="coupon-card"
                  key={coupon.code}
                >
                  <div className="coupon-icon">
                    <Percent size={20} />
                  </div>

                  <div className="coupon-copy">
                    <span>
                      {coupon.code}
                    </span>

                    <strong>
                      {coupon.title}
                    </strong>

                    <p>
                      {coupon.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard
                        ?.writeText(coupon.code);

                      showToast(
                        `${coupon.code} copied`
                      );
                    }}
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* =================================================
              RECENTLY VIEWED
          ================================================= */}

          <section className="section">
            <div className="section-heading compact">
              <div>
                <span className="section-kicker">
                  YOUR ACTIVITY
                </span>

                <h2>Recently viewed</h2>
              </div>

              <Link
                href="/dashboard/products"
                className="view-all-link"
              >
                Continue shopping
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="recent-grid">
              {visibleRecentProducts.map(
                (product) => (
                  <Link
                    key={product.id}
                    href={`/dashboard/products/${product.id}`}
                    className="recent-card"
                    onClick={() =>
                      openProduct(product)
                    }
                  >
                    <div className="recent-image">
                      <ProductImage
                        product={product}
                      />
                    </div>

                    <div className="recent-info">
                      <span>
                        {product.brand ||
                          "PrimeCart"}
                      </span>

                      <strong>
                        {product.name}
                      </strong>

                      <div>
                        <b>
                          {formatPrice(
                            product.price
                          )}
                        </b>

                        {product.original_price &&
                          product.original_price >
                            product.price && (
                            <del>
                              {formatPrice(
                                product.original_price
                              )}
                            </del>
                          )}
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          </section>

          {/* =================================================
              RECENT ORDERS
          ================================================= */}

          <section className="bottom-grid">
            <div className="orders-card">
              <div className="section-heading compact">
                <div>
                  <span className="section-kicker">
                    SHOPPING HISTORY
                  </span>

                  <h2>Recent orders</h2>
                </div>

                <Link
                  href="/dashboard/orders"
                  className="view-all-link"
                >
                  View all
                  <ArrowRight size={15} />
                </Link>
              </div>

              {orders.length > 0 ? (
                <div className="orders-list">
                  {orders
                    .slice(0, 5)
                    .map((order) => (
                      <Link
                        href="/dashboard/orders"
                        key={order.id}
                        className="order-row"
                      >
                        <div className="order-icon">
                          <Package size={17} />
                        </div>

                        <div className="order-main">
                          <strong>
                            Order #
                            {order.id
                              .slice(0, 8)
                              .toUpperCase()}
                          </strong>

                          <span>
                            {formatDate(
                              order.created_at
                            )}
                          </span>
                        </div>

                        <div className="order-price">
                          {formatPrice(
                            order.total_amount
                          )}
                        </div>

                        <span className="order-status">
                          {formatOrderStatus(
                            order.status
                          )}
                        </span>

                        <ChevronRight
                          size={16}
                        />
                      </Link>
                    ))}
                </div>
              ) : (
                <div className="empty-orders">
                  <Package size={34} />
                  <strong>
                    No orders yet
                  </strong>
                  <p>
                    Your orders will appear here after
                    checkout.
                  </p>

                  <Link
                    href="/dashboard/products"
                    className="light-button"
                  >
                    Explore Products
                    <ArrowRight size={15} />
                  </Link>
                </div>
              )}
            </div>

            <div className="insights-card">
              <div className="insights-head">
                <div>
                  <span className="section-kicker">
                    QUICK INSIGHTS
                  </span>

                  <h2>Your shopping snapshot</h2>
                </div>

                <BarIcon />
              </div>

              <div className="insight-item">
                <span className="insight-icon gold">
                  <ShoppingBag size={17} />
                </span>

                <div>
                  <strong>
                    {orders.length} orders
                  </strong>

                  <p>
                    Total shopping activity
                  </p>
                </div>
              </div>

              <div className="insight-item">
                <span className="insight-icon green">
                  <CircleDollarSign size={17} />
                </span>

                <div>
                  <strong>
                    {formatPrice(totalSpent)}
                  </strong>

                  <p>
                    Total amount spent
                  </p>
                </div>
              </div>

              <div className="insight-item">
                <span className="insight-icon purple">
                  <Crown size={17} />
                </span>

                <div>
                  <strong>
                    {primePoints} points
                  </strong>

                  <p>
                    Rewards accumulated
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/prime-points"
                className="insights-link"
              >
                Explore rewards
                <ArrowRight size={15} />
              </Link>
            </div>
          </section>

          {/* =================================================
              TRUST STRIP
          ================================================= */}

          <section className="trust-section">
            <div>
              <ShieldCheck size={22} />
              <strong>
                Shop with confidence
              </strong>
              <span>
                Secure payments and trusted products
              </span>
            </div>

            <div>
              <Truck size={22} />
              <strong>
                Reliable delivery
              </strong>
              <span>
                Track your order from dispatch to door
              </span>
            </div>

            <div>
              <Heart size={22} />
              <strong>
                Made for your needs
              </strong>
              <span>
                Smart tools to make shopping easier
              </span>
            </div>
          </section>

          {/* =================================================
              FOOTER
          ================================================= */}

          <footer className="dashboard-footer">
            <div>
              <strong>PrimeCart</strong>
              <span>
                Smart shopping, made simple.
              </span>
            </div>

            <div className="footer-links">
              <Link href="/dashboard/products">
                Products
              </Link>

              <Link href="/dashboard/categories">
                Categories
              </Link>

              <Link href="/dashboard/orders">
                Orders
              </Link>

              <Link href="/dashboard/wishlist">
                Wishlist
              </Link>

              <Link href="/dashboard/settings">
                Settings
              </Link>
            </div>

            <span className="footer-copy">
              © {new Date().getFullYear()} PrimeCart
            </span>
          </footer>
        </div>
      </main>

      {/* ===================================================
          MOBILE BOTTOM NAV
      =================================================== */}

      <nav className="mobile-bottom-nav">
        <Link href="/dashboard">
          <Home size={19} />
          <span>Home</span>
        </Link>

        <Link href="/dashboard/products">
          <Search size={19} />
          <span>Search</span>
        </Link>

        <button
          onClick={() => setCartOpen(true)}
          className="mobile-cart-button"
        >
          <span>
            <ShoppingCart size={20} />

            {cartCount > 0 && (
              <b>{cartCount}</b>
            )}
          </span>

          <small>Cart</small>
        </button>

        <Link href="/dashboard/wishlist">
          <Heart size={19} />
          <span>Wishlist</span>
        </Link>

        <Link href="/profile">
          <User size={19} />
          <span>Profile</span>
        </Link>
      </nav>

      {/* ===================================================
          STYLES
      =================================================== */}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          background: #fffdf9;
        }

        body {
          margin: 0;
          background: #fffdf9;
          color: #342c23;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        button,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .prime-dashboard {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 85% 0%,
              rgba(199, 154, 59, 0.06),
              transparent 24%
            ),
            #fffdf9;
        }

        /* ================================================
           SIDEBAR
        ================================================= */

        .dashboard-sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          width: 255px;
          z-index: 70;
          display: flex;
          flex-direction: column;
          background: rgba(255, 253, 249, 0.97);
          border-right: 1px solid #eee5d8;
          backdrop-filter: blur(20px);
        }

        .sidebar-brand {
          min-height: 84px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f0e9de;
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .brand-mark {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: #fff;
          font-weight: 900;
          background:
            linear-gradient(
              135deg,
              #d8ba73,
              #ad7e2e
            );
          box-shadow:
            0 10px 28px rgba(168, 124, 45, 0.2);
        }

        .brand-copy strong {
          display: block;
          font-size: 16px;
          letter-spacing: -0.3px;
        }

        .brand-copy span {
          display: block;
          margin-top: 2px;
          color: #a09586;
          font-size: 10px;
          font-weight: 600;
        }

        .sidebar-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 24px 14px;
        }

        .sidebar-label {
          padding: 0 10px 9px;
          color: #a59a8b;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.3px;
        }

        .smart-label {
          margin-top: 27px;
        }

        .sidebar-nav {
          display: grid;
          gap: 4px;
        }

        .sidebar-link {
          min-height: 45px;
          padding: 0 11px;
          display: flex;
          align-items: center;
          gap: 11px;
          border-radius: 12px;
          color: #766b5e;
          font-size: 13px;
          font-weight: 650;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .sidebar-link:hover {
          color: #8c6427;
          background: #faf4e8;
          transform: translateX(2px);
        }

        .sidebar-link-active {
          color: #91691f;
          background:
            linear-gradient(
              135deg,
              #fbf3df,
              #f8eed9
            );
          box-shadow:
            inset 3px 0 0 #bd8c38;
        }

        .sidebar-icon {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.75);
        }

        .sidebar-count {
          margin-left: auto;
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: #b8872d;
          color: #fff;
          font-size: 10px;
        }

        .smart-sidebar {
          display: grid;
          gap: 5px;
        }

        .smart-sidebar-item {
          min-height: 53px;
          padding: 7px 9px;
          display: flex;
          align-items: center;
          gap: 9px;
          border: 1px solid transparent;
          border-radius: 12px;
          transition: 0.2s ease;
        }

        .smart-sidebar-item:hover {
          border-color: #eadbc1;
          background: #fffaf1;
        }

        .smart-sidebar-icon {
          width: 30px;
          height: 30px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #f8f0df;
          color: #a97c31;
        }

        .smart-sidebar-content {
          min-width: 0;
          flex: 1;
        }

        .smart-sidebar-content strong {
          display: block;
          color: #51473c;
          font-size: 11px;
        }

        .smart-sidebar-content small {
          display: block;
          margin-top: 2px;
          color: #ae9b7e;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.6px;
        }

        .smart-sidebar-item > svg {
          color: #b3a594;
        }

        .sidebar-help {
          margin: 24px 3px 0;
          padding: 17px;
          border: 1px solid #ebdfcd;
          border-radius: 16px;
          background:
            linear-gradient(
              145deg,
              #fffaf0,
              #fffdf9
            );
        }

        .sidebar-help-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #f7ecd7;
          color: #a87a2e;
        }

        .sidebar-help strong {
          display: block;
          margin-top: 11px;
          font-size: 12px;
        }

        .sidebar-help p {
          margin: 6px 0 10px;
          color: #9b8f80;
          font-size: 10px;
          line-height: 1.6;
        }

        .sidebar-help a {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #9a702c;
          font-size: 10px;
          font-weight: 800;
        }

        .sidebar-bottom {
          padding: 13px;
          border-top: 1px solid #f0e9de;
        }

        .sidebar-bottom-link {
          width: 100%;
          min-height: 42px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 10px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: #786d61;
          font-size: 12px;
          text-align: left;
        }

        .sidebar-bottom-link:hover {
          background: #faf4e8;
          color: #8d6527;
        }

        .logout-button {
          margin-top: 3px;
        }

        .mobile-close {
          display: none;
          border: 0;
          background: transparent;
          color: #766a5e;
        }

        /* ================================================
           MAIN
        ================================================= */

        .dashboard-main {
          min-height: 100vh;
          margin-left: 255px;
        }

        .utility-bar {
          min-height: 31px;
          padding: 0 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #382f25;
          color: #fffaf1;
          font-size: 9px;
          letter-spacing: 0.1px;
        }

        .utility-bar > div,
        .utility-right,
        .utility-right span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .utility-right {
          gap: 19px;
          color: #e8ddcb;
        }

        .dashboard-header {
          position: sticky;
          top: 0;
          z-index: 50;
          min-height: 73px;
          padding: 12px 30px;
          display: flex;
          align-items: center;
          gap: 20px;
          background: rgba(255, 253, 249, 0.94);
          border-bottom: 1px solid #eee6da;
          backdrop-filter: blur(18px);
        }

        .header-left {
          min-width: 0;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .mobile-menu-button,
        .mobile-brand {
          display: none;
        }

        .header-search-wrap {
          position: relative;
          width: min(760px, 100%);
          height: 46px;
          display: flex;
          align-items: center;
          border: 1px solid #dfd4c4;
          border-radius: 13px;
          background: #fff;
          overflow: visible;
          box-shadow:
            0 4px 18px rgba(67, 52, 29, 0.035);
        }

        .search-category {
          height: 100%;
          padding: 0 13px;
          display: flex;
          align-items: center;
          gap: 4px;
          color: #766a5b;
          border-right: 1px solid #eee6da;
          font-size: 11px;
          font-weight: 700;
        }

        .header-search-icon {
          margin-left: 13px;
          flex: 0 0 auto;
          color: #a59887;
        }

        .header-search {
          min-width: 0;
          flex: 1;
          height: 100%;
          padding: 0 10px;
          border: 0;
          outline: 0;
          color: #40372e;
          background: transparent;
          font-size: 12px;
        }

        .header-search::placeholder {
          color: #afa394;
        }

        .search-clear {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 8px;
          background: #f6f0e7;
          color: #8e8171;
        }

        .search-submit {
          width: 45px;
          height: 100%;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 0 12px 12px 0;
          background: #b8872d;
          color: #fff;
        }

        .search-results {
          position: absolute;
          top: calc(100% + 9px);
          left: 0;
          right: 0;
          z-index: 100;
          padding: 8px;
          overflow: hidden;
          border: 1px solid #e8ddcd;
          border-radius: 16px;
          background: #fff;
          box-shadow:
            0 24px 70px rgba(53, 40, 20, 0.14);
        }

        .search-results-head {
          padding: 10px 11px;
          display: flex;
          justify-content: space-between;
          color: #6e6356;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.7px;
        }

        .search-results-head small {
          color: #b39c78;
        }

        .search-result-item {
          min-height: 62px;
          padding: 7px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 11px;
        }

        .search-result-item:hover {
          background: #fcf7ef;
        }

        .search-result-image {
          width: 47px;
          height: 47px;
          flex: 0 0 auto;
          position: relative;
          overflow: hidden;
          border-radius: 9px;
          background: #f8f5ef;
        }

        .search-result-info {
          min-width: 0;
          flex: 1;
        }

        .search-result-info strong,
        .search-result-info span,
        .search-result-info b {
          display: block;
        }

        .search-result-info strong {
          overflow: hidden;
          color: #42392f;
          font-size: 11px;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .search-result-info span {
          margin-top: 2px;
          color: #a29788;
          font-size: 9px;
        }

        .search-result-info b {
          margin-top: 3px;
          color: #9c7027;
          font-size: 10px;
        }

        .search-empty {
          padding: 28px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          color: #aa9d8b;
          text-align: center;
        }

        .search-empty strong {
          color: #64584b;
          font-size: 12px;
        }

        .search-empty span {
          font-size: 10px;
        }

        .search-view-all {
          min-height: 39px;
          margin-top: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-top: 1px solid #f0e9de;
          color: #9b702b;
          font-size: 11px;
          font-weight: 800;
        }

        .header-right {
          position: relative;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .header-icon-button {
          position: relative;
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border: 1px solid #e7ded0;
          border-radius: 11px;
          background: #fff;
          color: #6f6458;
        }

        .header-icon-button:hover {
          color: #9a702a;
          border-color: #d9c6a8;
          background: #fffaf2;
        }

        .notification-dot {
          position: absolute;
          top: 9px;
          right: 9px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #d85b45;
          border: 1px solid #fff;
        }

        .header-count {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          display: grid;
          place-items: center;
          border-radius: 99px;
          background: #b8872d;
          color: #fff;
          font-size: 8px;
          font-weight: 900;
          border: 2px solid #fffdf9;
        }

        .cart-count {
          background: #8f5f19;
        }

        .header-profile-wrap {
          position: relative;
        }

        .header-profile {
          height: 43px;
          padding: 3px 7px 3px 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #e6ddd0;
          border-radius: 12px;
          background: #fff;
        }

        .avatar {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #f1dfb8;
          color: #866025;
          font-size: 11px;
          font-weight: 900;
        }

        .avatar-image {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          object-fit: cover;
        }

        .header-profile-copy {
          text-align: left;
        }

        .header-profile-copy strong {
          display: block;
          color: #51473d;
          font-size: 11px;
        }

        .header-profile-copy small {
          display: block;
          margin-top: 1px;
          color: #a59a8b;
          font-size: 8px;
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 9px);
          right: 0;
          width: 235px;
          padding: 9px;
          border: 1px solid #e7ddcf;
          border-radius: 15px;
          background: #fff;
          box-shadow:
            0 24px 60px rgba(53, 39, 21, 0.13);
        }

        .profile-dropdown-head {
          padding: 9px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .avatar.large {
          width: 40px;
          height: 40px;
        }

        .profile-dropdown-head strong,
        .profile-dropdown-head span {
          display: block;
        }

        .profile-dropdown-head strong {
          font-size: 11px;
        }

        .profile-dropdown-head span {
          margin-top: 3px;
          color: #9f9384;
          font-size: 9px;
          word-break: break-all;
        }

        .profile-divider {
          height: 1px;
          margin: 4px 0;
          background: #f0e9df;
        }

        .profile-dropdown a,
        .profile-dropdown button {
          width: 100%;
          min-height: 39px;
          padding: 0 9px;
          display: flex;
          align-items: center;
          gap: 9px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #665b4e;
          font-size: 11px;
          text-align: left;
        }

        .profile-dropdown a:hover,
        .profile-dropdown button:hover {
          background: #fbf5ea;
          color: #946a27;
        }

        .notification-panel {
          position: absolute;
          top: 49px;
          right: 55px;
          z-index: 90;
          width: 285px;
          padding: 10px;
          border: 1px solid #e8dfd1;
          border-radius: 15px;
          background: #fff;
          box-shadow:
            0 24px 60px rgba(53, 39, 21, 0.14);
        }

        .notification-head {
          padding: 9px;
          display: flex;
          justify-content: space-between;
        }

        .notification-head strong {
          font-size: 12px;
        }

        .notification-head span {
          color: #a4762c;
          font-size: 9px;
          font-weight: 800;
        }

        .notification-item {
          padding: 9px;
          display: flex;
          gap: 9px;
          border-radius: 10px;
        }

        .notification-item:hover {
          background: #fcf7ef;
        }

        .notification-icon {
          width: 30px;
          height: 30px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #f8f0e1;
          color: #a4752b;
        }

        .notification-item strong {
          display: block;
          font-size: 10px;
        }

        .notification-item p {
          margin: 3px 0 0;
          color: #a19789;
          font-size: 9px;
          line-height: 1.4;
        }

        /* ================================================
           CONTENT
        ================================================= */

        .dashboard-content {
          width: min(1480px, 100%);
          margin: 0 auto;
          padding: 24px 30px 60px;
        }

        .hero-section {
          margin-bottom: 17px;
        }

        .hero-main {
          position: relative;
          min-height: 355px;
          overflow: hidden;
          border-radius: 25px;
          background:
            radial-gradient(
              circle at 85% 45%,
              rgba(255, 255, 255, 0.55),
              transparent 20%
            ),
            linear-gradient(
              135deg,
              #f5ead1,
              #f7f1e6 48%,
              #eee0c4
            );
          border: 1px solid #e9dbc1;
          box-shadow:
            0 18px 55px rgba(103, 74, 27, 0.07);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          width: 58%;
          padding: 58px 0 54px 58px;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #9b6d22;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.1px;
        }

        .hero-content h1 {
          max-width: 600px;
          margin: 13px 0 12px;
          color: #3b3024;
          font-size: clamp(34px, 4vw, 55px);
          line-height: 1.02;
          letter-spacing: -2.1px;
        }

        .hero-content p {
          max-width: 540px;
          margin: 0;
          color: #7b6e5e;
          font-size: 14px;
          line-height: 1.7;
        }

        .hero-actions {
          margin-top: 25px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .hero-button,
        .hero-secondary,
        .gold-button,
        .light-button {
          min-height: 42px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 11px;
          font-size: 11px;
          font-weight: 800;
          transition: 0.2s ease;
        }

        .hero-button,
        .gold-button {
          border: 1px solid #b8872d;
          background: #b8872d;
          color: #fff;
          box-shadow:
            0 8px 20px rgba(168, 119, 35, 0.18);
        }

        .hero-button:hover,
        .gold-button:hover {
          transform: translateY(-2px);
          background: #a87827;
        }

        .hero-secondary,
        .light-button {
          border: 1px solid #ddcfba;
          background: rgba(255, 255, 255, 0.65);
          color: #776a5a;
        }

        .hero-secondary:hover,
        .light-button:hover {
          border-color: #cbaa71;
          color: #956c29;
          background: #fff;
        }

        .hero-tag {
          margin-top: 21px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #8d6a35;
          font-size: 9px;
          font-weight: 850;
        }

        .hero-visual {
          position: absolute;
          inset: 0 0 0 58%;
        }

        .hero-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(1px);
        }

        .hero-glow-one {
          width: 280px;
          height: 280px;
          top: 32px;
          left: 12%;
          background: rgba(205, 163, 76, 0.19);
        }

        .hero-glow-two {
          width: 180px;
          height: 180px;
          bottom: -55px;
          right: 6%;
          background: rgba(255, 255, 255, 0.75);
        }

        .hero-shopping-card {
          position: absolute;
          z-index: 3;
          width: 225px;
          padding: 18px;
          top: 50%;
          left: 50%;
          transform:
            translate(-50%, -50%)
            rotate(-3deg);
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.84);
          box-shadow:
            0 25px 55px rgba(77, 57, 27, 0.16);
          backdrop-filter: blur(16px);
        }

        .mini-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #9d762f;
          font-size: 9px;
          font-weight: 850;
        }

        .mini-card-top span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .mini-live {
          padding: 4px 6px;
          border-radius: 999px;
          background: #f8e7df;
          color: #ba634d;
          font-size: 7px;
        }

        .hero-shopping-icon {
          width: 95px;
          height: 95px;
          margin: 22px auto 14px;
          display: grid;
          place-items: center;
          border-radius: 25px;
          background:
            linear-gradient(
              145deg,
              #f7ecd2,
              #fff
            );
          color: #ae7e2e;
        }

        .hero-shopping-card > strong,
        .hero-shopping-card > span {
          display: block;
          text-align: center;
        }

        .hero-shopping-card > strong {
          color: #493d30;
          font-size: 14px;
        }

        .hero-shopping-card > span {
          margin-top: 4px;
          color: #a39888;
          font-size: 9px;
        }

        .mini-score {
          margin-top: 16px;
          padding-top: 10px;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #eee5d6;
          color: #9d9384;
          font-size: 9px;
        }

        .mini-score b {
          color: #9b702c;
          font-size: 12px;
        }

        .floating-offer {
          position: absolute;
          z-index: 4;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 11px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.82);
          box-shadow:
            0 12px 30px rgba(76, 56, 25, 0.1);
          backdrop-filter: blur(12px);
          color: #9d712b;
          font-size: 9px;
        }

        .floating-offer span {
          display: flex;
          flex-direction: column;
          color: #9b907f;
        }

        .floating-offer strong {
          color: #594b3d;
          font-size: 9px;
        }

        .offer-one {
          top: 19%;
          right: 7%;
        }

        .offer-two {
          bottom: 16%;
          left: 8%;
        }

        .hero-arrow {
          position: absolute;
          z-index: 5;
          top: 50%;
          width: 35px;
          height: 35px;
          display: grid;
          place-items: center;
          border: 1px solid #dfd1ba;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.78);
          color: #80653c;
          transform: translateY(-50%);
        }

        .hero-arrow:hover {
          background: #fff;
          border-color: #c7a66b;
        }

        .hero-arrow-left {
          left: 18px;
        }

        .hero-arrow-right {
          right: 18px;
        }

        .hero-dots {
          position: absolute;
          z-index: 6;
          left: 58px;
          bottom: 23px;
          display: flex;
          gap: 6px;
        }

        .hero-dot {
          width: 6px;
          height: 6px;
          padding: 0;
          border: 0;
          border-radius: 99px;
          background: #d0c2ab;
        }

        .hero-dot.active {
          width: 22px;
          background: #a97a2d;
        }

        /* ================================================
           BENEFITS
        ================================================= */

        .benefits-strip {
          min-height: 83px;
          padding: 14px 19px;
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
          align-items: center;
          border: 1px solid #eee5d8;
          border-radius: 17px;
          background: #fff;
        }

        .benefit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .benefit > span {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #faf3e4;
          color: #aa7a2c;
        }

        .benefit strong,
        .benefit small {
          display: block;
        }

        .benefit strong {
          color: #53483c;
          font-size: 10px;
        }

        .benefit small {
          margin-top: 3px;
          color: #a69a8b;
          font-size: 8px;
        }

        .benefit-divider {
          width: 1px;
          height: 30px;
          background: #eee6da;
        }

        /* ================================================
           WELCOME
        ================================================= */

        .welcome-grid {
          margin-top: 24px;
          display: grid;
          grid-template-columns: 1.7fr 0.8fr;
          gap: 14px;
        }

        .welcome-card {
          min-height: 205px;
          padding: 29px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid #eadfce;
          border-radius: 20px;
          background:
            radial-gradient(
              circle at 95% 10%,
              rgba(199, 154, 59, 0.12),
              transparent 25%
            ),
            #fff;
        }

        .section-kicker {
          color: #ad7d2e;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .section-kicker.red {
          color: #c2674e;
        }

        .welcome-card h2 {
          max-width: 650px;
          margin: 8px 0 7px;
          color: #41372d;
          font-size: 24px;
          letter-spacing: -0.7px;
        }

        .welcome-card p {
          max-width: 620px;
          margin: 0;
          color: #968a7b;
          font-size: 11px;
          line-height: 1.7;
        }

        .welcome-actions {
          display: flex;
          gap: 8px;
          margin-top: 19px;
        }

        .points-card {
          padding: 25px;
          border-radius: 20px;
          color: #fff;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(255, 255, 255, 0.25),
              transparent 35%
            ),
            linear-gradient(
              145deg,
              #6c532c,
              #9d712a
            );
          box-shadow:
            0 15px 35px rgba(124, 89, 33, 0.13);
        }

        .points-top {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .points-top > span {
          flex: 1;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .points-icon {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.16);
        }

        .points-top a {
          display: grid;
          place-items: center;
        }

        .points-number {
          display: block;
          margin-top: 18px;
          font-size: 31px;
          letter-spacing: -1px;
        }

        .points-card p {
          margin: 3px 0 16px;
          color: #eadfcb;
          font-size: 9px;
        }

        .points-progress {
          height: 6px;
          overflow: hidden;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.17);
        }

        .points-progress span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: #fff;
        }

        .points-footer {
          margin-top: 8px;
          display: flex;
          justify-content: space-between;
          color: #e8ddc8;
          font-size: 8px;
        }

        /* ================================================
           STATS
        ================================================= */

        .stats-grid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .stat-card {
          min-height: 104px;
          padding: 17px;
          display: flex;
          align-items: center;
          gap: 11px;
          border: 1px solid #eee6db;
          border-radius: 15px;
          background: #fff;
          transition: 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          border-color: #dec9a8;
          box-shadow:
            0 13px 32px rgba(65, 48, 23, 0.06);
        }

        .stat-icon {
          width: 39px;
          height: 39px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 11px;
        }

        .gold-icon {
          color: #a7782b;
          background: #f9efd9;
        }

        .rose-icon {
          color: #ad6b70;
          background: #f9e9eb;
        }

        .green-icon {
          color: #668f69;
          background: #eaf4e9;
        }

        .purple-icon {
          color: #826c9b;
          background: #f0ebf7;
        }

        .stat-content {
          min-width: 0;
          flex: 1;
        }

        .stat-content span,
        .stat-content strong,
        .stat-content small {
          display: block;
        }

        .stat-content span {
          color: #9d9182;
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .stat-content strong {
          margin-top: 3px;
          overflow: hidden;
          color: #463b31;
          font-size: 18px;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .stat-content small {
          margin-top: 3px;
          color: #aaa092;
          font-size: 8px;
        }

        .stat-card > svg {
          color: #c2b4a2;
        }

        /* ================================================
           SECTION
        ================================================= */

        .section {
          margin-top: 39px;
        }

        .section-heading {
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .section-heading.compact {
          align-items: center;
        }

        .section-heading h2 {
          margin: 6px 0 3px;
          color: #41372d;
          font-size: 21px;
          letter-spacing: -0.5px;
        }

        .section-heading p {
          margin: 0;
          color: #9a8f81;
          font-size: 10px;
        }

        .heading-sparkle {
          color: #c39a51;
        }

        .view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #9b702b;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .view-all-link:hover {
          color: #754f15;
        }

        /* ================================================
           CATEGORY
        ================================================= */

        .category-strip {
          display: flex;
          gap: 9px;
          overflow-x: auto;
          padding-bottom: 5px;
          scrollbar-width: none;
        }

        .category-strip::-webkit-scrollbar {
          display: none;
        }

        .category-card {
          min-width: 112px;
          min-height: 112px;
          flex: 0 0 112px;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid #eee5d8;
          border-radius: 15px;
          background: #fff;
          color: #62584c;
          transition: 0.2s ease;
        }

        .category-card:hover,
        .category-card-active {
          border-color: #d1ae70;
          background: #fff9ed;
          color: #936a27;
          transform: translateY(-2px);
        }

        .category-emoji {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #faf3e4;
          font-size: 20px;
        }

        .category-card strong {
          margin-top: 8px;
          font-size: 10px;
        }

        .category-card small {
          margin-top: 3px;
          color: #aaa092;
          font-size: 7px;
        }

        /* ================================================
           DEAL
        ================================================= */

        .deal-banner {
          margin-top: 35px;
          min-height: 170px;
          padding: 27px 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          overflow: hidden;
          border: 1px solid #e8d8ba;
          border-radius: 20px;
          background:
            radial-gradient(
              circle at 100% 50%,
              rgba(210, 166, 78, 0.18),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #fffaf0,
              #f9edcf
            );
        }

        .deal-kicker {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #bc6549;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .deal-left h2 {
          margin: 7px 0 5px;
          color: #483a2b;
          font-size: 23px;
        }

        .deal-left p {
          margin: 0;
          color: #948675;
          font-size: 10px;
        }

        .deal-button {
          margin-top: 15px;
          min-height: 37px;
          padding: 0 13px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border-radius: 10px;
          background: #9c7029;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
        }

        .deal-timer-wrap {
          min-width: 250px;
          text-align: center;
        }

        .deal-timer-wrap > span {
          color: #9c8a70;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .deal-timer {
          margin-top: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .deal-timer div {
          width: 55px;
          padding: 8px 4px;
          border-radius: 10px;
          background: #fff;
          box-shadow:
            0 8px 18px rgba(107, 77, 28, 0.07);
        }

        .deal-timer strong,
        .deal-timer small {
          display: block;
        }

        .deal-timer strong {
          color: #5b452a;
          font-size: 20px;
        }

        .deal-timer small {
          margin-top: 2px;
          color: #a89a88;
          font-size: 7px;
        }

        .deal-timer b {
          color: #a8782e;
        }

        .deal-timer-note {
          display: block;
          margin-top: 9px;
          color: #b06d56 !important;
          font-size: 8px !important;
        }

        /* ================================================
           PRODUCT GRID
        ================================================= */

        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 13px;
        }

        .product-card {
          position: relative;
          min-width: 0;
          overflow: hidden;
          border: 1px solid #eee6da;
          border-radius: 16px;
          background: #fff;
          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease,
            border-color 0.22s ease;
        }

        .product-card:hover {
          transform: translateY(-4px);
          border-color: #dfcba9;
          box-shadow:
            0 18px 40px rgba(67, 48, 22, 0.09);
        }

        .product-card-image {
          position: relative;
          height: 230px;
          overflow: hidden;
          background: #f9f7f2;
        }

        .product-image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .product-image-full {
          object-fit: contain;
          padding: 12px;
        }

        .product-image-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #c2b7a8;
          background: #f8f5ef;
        }

        .product-image-fallback span {
          font-size: 9px;
        }

        .product-badge-row {
          position: absolute;
          z-index: 2;
          top: 10px;
          left: 10px;
          right: 10px;
          display: flex;
          justify-content: space-between;
        }

        .discount-badge,
        .flash-label {
          min-height: 22px;
          padding: 0 7px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border-radius: 7px;
          font-size: 8px;
          font-weight: 900;
        }

        .discount-badge {
          background: #e9f3e5;
          color: #4e8250;
        }

        .flash-label {
          background: #fbe8df;
          color: #b55e48;
        }

        .product-heart {
          position: absolute;
          z-index: 3;
          top: 10px;
          right: 10px;
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border: 1px solid #eadfd0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          color: #86796a;
        }

        .product-heart:hover {
          color: #b96770;
          border-color: #e2c2c7;
        }

        .quick-add {
          position: absolute;
          z-index: 4;
          left: 10px;
          right: 10px;
          bottom: 10px;
          min-height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid #b8872d;
          border-radius: 9px;
          background: rgba(184, 135, 45, 0.96);
          color: #fff;
          font-size: 9px;
          font-weight: 850;
          opacity: 0;
          transform: translateY(8px);
          transition: 0.2s ease;
        }

        .product-card:hover .quick-add {
          opacity: 1;
          transform: translateY(0);
        }

        .product-card-body {
          padding: 13px;
        }

        .product-brand {
          color: #aa9b89;
          font-size: 8px;
          font-weight: 700;
        }

        .product-card-body h3 {
          height: 34px;
          margin: 5px 0 5px;
          overflow: hidden;
          color: #453a30;
          font-size: 11px;
          line-height: 1.45;
          font-weight: 750;
        }

        .product-card-description {
          height: 25px;
          overflow: hidden;
          color: #a39a8c;
          font-size: 8px;
          line-height: 1.5;
        }

        .rating-row {
          margin-top: 9px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 8px;
        }

        .rating-pill {
          padding: 3px 5px;
          display: inline-flex;
          align-items: center;
          gap: 2px;
          border-radius: 5px;
          background: #eaf3e7;
          color: #4d7b4f;
          font-weight: 850;
        }

        .rating-pill svg {
          fill: currentColor;
        }

        .reviews-count {
          color: #aaa092;
        }

        .product-price-row {
          margin-top: 9px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .product-price-row strong {
          color: #4b3b28;
          font-size: 14px;
        }

        .product-price-row del {
          color: #aaa092;
          font-size: 9px;
        }

        .product-price-row em {
          color: #5e8a5d;
          font-size: 8px;
          font-style: normal;
          font-weight: 800;
        }

        /* ================================================
           SMART TOOLS
        ================================================= */

        .smart-tools-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .smart-tool-card {
          min-height: 215px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          border: 1px solid #eee4d7;
          border-radius: 17px;
          background: #fff;
          transition: 0.23s ease;
          animation: cardup 0.5s both;
        }

        @keyframes cardup {
          from {
            opacity: 0;
            transform: translateY(9px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .smart-tool-card:hover {
          transform: translateY(-4px);
          border-color: #d8bf95;
          box-shadow:
            0 17px 38px rgba(64, 46, 19, 0.08);
        }

        .smart-tool-top {
          display: flex;
          justify-content: space-between;
        }

        .smart-tool-badge {
          color: #b1843e;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.8px;
        }

        .smart-tool-arrow {
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #faf3e5;
          color: #a2742d;
        }

        .smart-tool-icon {
          width: 45px;
          height: 45px;
          margin-top: 18px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #fbf2de;
          color: #a7772e;
        }

        .smart-tool-card h3 {
          margin: 12px 0 4px;
          color: #4b4034;
          font-size: 14px;
        }

        .smart-tool-card p {
          max-width: 230px;
          margin: 0;
          color: #9c9182;
          font-size: 9px;
          line-height: 1.6;
        }

        .smart-tool-link {
          margin-top: auto;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #9a702d;
          font-size: 9px;
          font-weight: 800;
        }

        /* ================================================
           PERSONALIZED
        ================================================= */

        .personalized-section {
          margin-top: 39px;
          padding: 27px;
          display: grid;
          grid-template-columns: 0.75fr 1.25fr;
          gap: 23px;
          border: 1px solid #e9ddca;
          border-radius: 20px;
          background:
            radial-gradient(
              circle at 0% 100%,
              rgba(201, 161, 84, 0.11),
              transparent 32%
            ),
            #fff;
        }

        .personalized-copy h2 {
          max-width: 420px;
          margin: 7px 0 7px;
          color: #463a2f;
          font-size: 24px;
          line-height: 1.15;
        }

        .personalized-copy p {
          max-width: 410px;
          margin: 0;
          color: #988d7f;
          font-size: 10px;
          line-height: 1.7;
        }

        .personalized-copy .gold-button {
          margin-top: 17px;
        }

        .personalized-mini-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 9px;
        }

        .mini-product {
          padding: 9px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #eee6db;
          border-radius: 13px;
          background: #fffdfa;
          transition: 0.2s ease;
        }

        .mini-product:hover {
          border-color: #dcc59d;
          transform: translateY(-2px);
        }

        .mini-product-image {
          position: relative;
          width: 66px;
          height: 66px;
          flex: 0 0 auto;
          overflow: hidden;
          border-radius: 10px;
          background: #f8f5ef;
        }

        .mini-product span,
        .mini-product strong,
        .mini-product b {
          display: block;
        }

        .mini-product span {
          color: #a99d8d;
          font-size: 7px;
        }

        .mini-product strong {
          max-width: 160px;
          margin-top: 3px;
          overflow: hidden;
          color: #51453a;
          font-size: 9px;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .mini-product b {
          margin-top: 5px;
          color: #9a702c;
          font-size: 10px;
        }

        /* ================================================
           FEATURES
        ================================================= */

        .feature-grid {
          margin-top: 39px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
        }

        .feature-panel {
          position: relative;
          min-height: 255px;
          overflow: hidden;
          padding: 27px;
          border-radius: 20px;
          border: 1px solid #e6d8c2;
          transition: 0.2s ease;
        }

        .feature-panel:hover {
          transform: translateY(-3px);
          box-shadow:
            0 18px 38px rgba(70, 50, 22, 0.08);
        }

        .budget-panel {
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(198, 154, 61, 0.19),
              transparent 35%
            ),
            #f8f0df;
        }

        .setup-panel {
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(159, 139, 193, 0.14),
              transparent 35%
            ),
            #f5f1e9;
        }

        .feature-panel-content {
          position: relative;
          z-index: 2;
          max-width: 58%;
        }

        .feature-label {
          color: #a57830;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .feature-panel h2 {
          margin: 8px 0 7px;
          color: #493b2c;
          font-size: 23px;
          line-height: 1.12;
        }

        .feature-panel p {
          margin: 0;
          color: #918474;
          font-size: 10px;
          line-height: 1.65;
        }

        .feature-link {
          margin-top: 17px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #986d29;
          font-size: 9px;
          font-weight: 900;
        }

        .budget-visual {
          position: absolute;
          right: 30px;
          bottom: 28px;
          width: 145px;
          height: 145px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px dashed #caaa70;
          color: #aa7a2c;
          background: rgba(255, 255, 255, 0.5);
        }

        .budget-visual span {
          margin-top: 6px;
          color: #554432;
          font-size: 20px;
          font-weight: 900;
        }

        .budget-visual small {
          margin-top: 2px;
          color: #9d907e;
          font-size: 7px;
        }

        .setup-visual {
          position: absolute;
          right: 30px;
          bottom: 30px;
          width: 155px;
          height: 155px;
        }

        .setup-visual div {
          position: absolute;
          width: 61px;
          height: 61px;
          display: grid;
          place-items: center;
          border: 1px solid #e2d6c6;
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.76);
          box-shadow:
            0 9px 20px rgba(63, 48, 28, 0.07);
          font-size: 25px;
        }

        .setup-visual div:nth-child(1) {
          top: 0;
          left: 45px;
        }

        .setup-visual div:nth-child(2) {
          top: 47px;
          left: 0;
        }

        .setup-visual div:nth-child(3) {
          top: 47px;
          right: 0;
        }

        .setup-visual div:nth-child(4) {
          bottom: 0;
          left: 45px;
        }

        /* ================================================
           MYSTERY
        ================================================= */

        .mystery-section {
          margin-top: 14px;
          padding: 19px 24px;
          display: flex;
          align-items: center;
          gap: 15px;
          border: 1px solid #e8d9bd;
          border-radius: 18px;
          background: #fff9ed;
        }

        .mystery-icon {
          width: 51px;
          height: 51px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 15px;
          color: #a8772c;
          background: #f4e6c9;
        }

        .mystery-copy {
          flex: 1;
        }

        .mystery-copy > span {
          color: #a8792e;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .mystery-copy h2 {
          margin: 4px 0 2px;
          color: #4a3b2b;
          font-size: 15px;
        }

        .mystery-copy p {
          margin: 0;
          color: #9a8d7c;
          font-size: 9px;
        }

        .mystery-button {
          min-height: 39px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid #c0923d;
          border-radius: 10px;
          background: #fff;
          color: #9b702c;
          font-size: 9px;
          font-weight: 900;
        }

        .mystery-button:hover {
          background: #b8872d;
          color: #fff;
        }

        /* ================================================
           COUPONS
        ================================================= */

        .coupon-note {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #aa7d37;
          font-size: 9px;
          font-weight: 800;
        }

        .coupon-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 11px;
        }

        .coupon-card {
          min-height: 104px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px dashed #d9c19a;
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              #fff,
              #fffaf1
            );
        }

        .coupon-icon {
          width: 40px;
          height: 40px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 11px;
          color: #a5752b;
          background: #f8eedb;
        }

        .coupon-copy {
          min-width: 0;
          flex: 1;
        }

        .coupon-copy > span {
          display: block;
          color: #ad966f;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.8px;
        }

        .coupon-copy strong {
          display: block;
          margin-top: 3px;
          color: #4f4234;
          font-size: 13px;
        }

        .coupon-copy p {
          margin: 2px 0 0;
          color: #a29889;
          font-size: 8px;
        }

        .coupon-card button {
          min-height: 29px;
          padding: 0 9px;
          border: 1px solid #dfcda9;
          border-radius: 8px;
          background: #fff;
          color: #9a702c;
          font-size: 8px;
          font-weight: 900;
        }

        .coupon-card button:hover {
          background: #b8872d;
          border-color: #b8872d;
          color: #fff;
        }

        /* ================================================
           RECENT
        ================================================= */

        .recent-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 11px;
        }

        .recent-card {
          overflow: hidden;
          border: 1px solid #eee6db;
          border-radius: 14px;
          background: #fff;
          transition: 0.2s ease;
        }

        .recent-card:hover {
          transform: translateY(-3px);
          border-color: #dcc7a3;
        }

        .recent-image {
          height: 165px;
          position: relative;
          background: #f8f6f1;
        }

        .recent-info {
          padding: 11px;
        }

        .recent-info > span,
        .recent-info > strong {
          display: block;
        }

        .recent-info > span {
          color: #aaa091;
          font-size: 7px;
        }

        .recent-info > strong {
          height: 29px;
          margin-top: 4px;
          overflow: hidden;
          color: #4b4035;
          font-size: 10px;
          line-height: 1.45;
        }

        .recent-info > div {
          margin-top: 7px;
          display: flex;
          gap: 5px;
          align-items: center;
        }

        .recent-info b {
          color: #9b702c;
          font-size: 11px;
        }

        .recent-info del {
          color: #aaa092;
          font-size: 8px;
        }

        /* ================================================
           ORDERS
        ================================================= */

        .bottom-grid {
          margin-top: 39px;
          display: grid;
          grid-template-columns: 1.45fr 0.75fr;
          gap: 13px;
        }

        .orders-card,
        .insights-card {
          padding: 21px;
          border: 1px solid #eee5d8;
          border-radius: 18px;
          background: #fff;
        }

        .orders-list {
          border-top: 1px solid #f1ebe3;
        }

        .order-row {
          min-height: 62px;
          padding: 7px 2px;
          display: grid;
          grid-template-columns: 38px minmax(120px, 1fr) auto auto 18px;
          align-items: center;
          gap: 9px;
          border-bottom: 1px solid #f1ebe3;
        }

        .order-row:hover {
          background: #fffcf6;
        }

        .order-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: #a7782d;
          background: #faf1df;
        }

        .order-main strong,
        .order-main span {
          display: block;
        }

        .order-main strong {
          color: #554a3e;
          font-size: 10px;
        }

        .order-main span {
          margin-top: 3px;
          color: #aaa092;
          font-size: 8px;
        }

        .order-price {
          color: #5a4831;
          font-size: 10px;
          font-weight: 850;
        }

        .order-status {
          padding: 5px 7px;
          border-radius: 6px;
          background: #eef6ea;
          color: #5b895a;
          font-size: 7px;
          font-weight: 850;
        }

        .order-row > svg {
          color: #b6aa9b;
        }

        .empty-orders {
          min-height: 230px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #c0b4a4;
        }

        .empty-orders strong {
          margin-top: 8px;
          color: #5b5044;
          font-size: 12px;
        }

        .empty-orders p {
          margin: 4px 0 13px;
          color: #a4998a;
          font-size: 9px;
        }

        .insights-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .insights-head h2 {
          margin: 5px 0 0;
          color: #473b30;
          font-size: 16px;
        }

        .insights-head > svg {
          color: #c19a55;
        }

        .insight-item {
          margin-top: 17px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .insight-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
        }

        .insight-icon.gold {
          color: #a6762c;
          background: #faf0dd;
        }

        .insight-icon.green {
          color: #5d8c61;
          background: #edf5e9;
        }

        .insight-icon.purple {
          color: #82699c;
          background: #f0ebf7;
        }

        .insight-item strong,
        .insight-item p {
          display: block;
        }

        .insight-item strong {
          color: #4d4236;
          font-size: 10px;
        }

        .insight-item p {
          margin: 2px 0 0;
          color: #a49a8c;
          font-size: 8px;
        }

        .insights-link {
          margin-top: 19px;
          min-height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid #e2d2b5;
          border-radius: 9px;
          color: #996f2b;
          font-size: 9px;
          font-weight: 850;
        }

        .insights-link:hover {
          background: #fbf4e5;
        }

        /* ================================================
           TRUST
        ================================================= */

        .trust-section {
          margin-top: 28px;
          padding: 19px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          border: 1px solid #eee5d8;
          border-radius: 16px;
          background: #fff;
        }

        .trust-section > div {
          padding: 5px 13px;
          display: grid;
          grid-template-columns: 30px 1fr;
          column-gap: 9px;
        }

        .trust-section > div > svg {
          grid-row: span 2;
          align-self: center;
          color: #b18339;
        }

        .trust-section strong {
          color: #51463b;
          font-size: 10px;
        }

        .trust-section span {
          margin-top: 3px;
          color: #a59a8b;
          font-size: 8px;
        }

        /* ================================================
           FOOTER
        ================================================= */

        .dashboard-footer {
          margin-top: 25px;
          padding: 21px 2px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border-top: 1px solid #eee5d8;
        }

        .dashboard-footer > div:first-child strong,
        .dashboard-footer > div:first-child span {
          display: block;
        }

        .dashboard-footer > div:first-child strong {
          color: #594a38;
          font-size: 13px;
        }

        .dashboard-footer > div:first-child span {
          margin-top: 3px;
          color: #aaa092;
          font-size: 8px;
        }

        .footer-links {
          display: flex;
          gap: 16px;
        }

        .footer-links a,
        .footer-copy {
          color: #a09687;
          font-size: 8px;
        }

        .footer-links a:hover {
          color: #956b27;
        }

        /* ================================================
           CART
        ================================================= */

        .drawer-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          border: 0;
          background: rgba(38, 28, 17, 0.32);
          backdrop-filter: blur(2px);
        }

        .cart-drawer {
          position: fixed;
          z-index: 110;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(420px, 94vw);
          display: flex;
          flex-direction: column;
          background: #fffdf9;
          box-shadow:
            -20px 0 70px rgba(46, 33, 16, 0.16);
          animation: drawerin 0.25s ease both;
        }

        @keyframes drawerin {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .cart-drawer-head {
          min-height: 82px;
          padding: 17px 19px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #eee5d8;
        }

        .cart-drawer-head > div > span {
          color: #aa7b2f;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .cart-drawer-head h2 {
          margin: 4px 0 0;
          color: #493d31;
          font-size: 20px;
        }

        .close-round {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 1px solid #e6ddd0;
          border-radius: 50%;
          background: #fff;
          color: #786c5e;
        }

        .cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 10px 17px;
        }

        .cart-item {
          padding: 12px 0;
          display: flex;
          gap: 10px;
          border-bottom: 1px solid #f0e9df;
        }

        .cart-item-image {
          width: 82px;
          height: 82px;
          flex: 0 0 auto;
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          background: #f8f5ef;
        }

        .cart-item-info {
          min-width: 0;
          flex: 1;
        }

        .cart-item-info > span,
        .cart-item-info > strong,
        .cart-item-info > b {
          display: block;
        }

        .cart-item-info > span {
          color: #aa9d8d;
          font-size: 7px;
        }

        .cart-item-info > strong {
          margin-top: 4px;
          color: #51453a;
          font-size: 10px;
          line-height: 1.4;
        }

        .cart-item-info > b {
          margin-top: 5px;
          color: #9b702d;
          font-size: 11px;
        }

        .cart-item-actions {
          margin-top: 9px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .quantity-control {
          height: 28px;
          display: flex;
          align-items: center;
          border: 1px solid #e4dacd;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        }

        .quantity-control button {
          width: 28px;
          height: 28px;
          border: 0;
          background: #fff;
          color: #8c7e6e;
        }

        .quantity-control span {
          min-width: 28px;
          text-align: center;
          color: #594d40;
          font-size: 9px;
          font-weight: 800;
        }

        .remove-cart {
          border: 0;
          background: transparent;
          color: #ad7d7a;
          font-size: 8px;
        }

        .cart-summary {
          padding: 17px;
          border-top: 1px solid #eee5d8;
          background: #fff;
        }

        .summary-line,
        .summary-total {
          display: flex;
          justify-content: space-between;
        }

        .summary-line {
          margin-bottom: 9px;
          color: #8f8476;
          font-size: 9px;
        }

        .summary-line strong {
          color: #5b4d3e;
        }

        .summary-line.savings strong {
          color: #5d8c5c;
        }

        .summary-line.delivery strong {
          color: #9b702c;
        }

        .summary-total {
          margin-top: 13px;
          padding-top: 13px;
          border-top: 1px solid #eee6da;
          color: #463a2f;
          font-size: 12px;
          font-weight: 850;
        }

        .summary-total strong {
          font-size: 16px;
        }

        .checkout-button {
          width: 100%;
          min-height: 45px;
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 0;
          border-radius: 11px;
          background: #b8872d;
          color: #fff;
          font-size: 10px;
          font-weight: 900;
        }

        .checkout-button:hover {
          background: #9e7027;
        }

        .secure-note {
          margin: 9px 0 0;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
          color: #aaa092;
          font-size: 8px;
        }

        .empty-cart {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px;
          text-align: center;
        }

        .empty-cart-icon {
          width: 80px;
          height: 80px;
          display: grid;
          place-items: center;
          border-radius: 24px;
          background: #faf1df;
          color: #b18339;
        }

        .empty-cart h3 {
          margin: 17px 0 5px;
          color: #504438;
          font-size: 15px;
        }

        .empty-cart p {
          max-width: 260px;
          margin: 0 0 17px;
          color: #a19789;
          font-size: 10px;
          line-height: 1.6;
        }

        /* ================================================
           TOAST
        ================================================= */

        .pc-toast {
          position: fixed;
          z-index: 200;
          right: 24px;
          bottom: 24px;
          min-height: 44px;
          padding: 7px 13px 7px 7px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #dfd1ba;
          border-radius: 12px;
          background: #fff;
          box-shadow:
            0 16px 40px rgba(54, 39, 19, 0.13);
          color: #5c5042;
          font-size: 10px;
          font-weight: 750;
          animation: toastin 0.25s ease both;
        }

        @keyframes toastin {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .toast-check {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #eaf4e6;
          color: #5d8b5c;
        }

        /* ================================================
           MOBILE
        ================================================= */

        .mobile-bottom-nav {
          display: none;
        }

        @media (max-width: 1200px) {
          .dashboard-sidebar {
            width: 225px;
          }

          .dashboard-main {
            margin-left: 225px;
          }

          .dashboard-content {
            padding-left: 20px;
            padding-right: 20px;
          }

          .product-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .smart-tools-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .benefits-strip {
            grid-template-columns: repeat(2, 1fr);
            gap: 13px;
          }

          .benefit-divider {
            display: none;
          }

          .personalized-section {
            grid-template-columns: 1fr;
          }

          .recent-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 900px) {
          .dashboard-sidebar {
            width: 255px;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            box-shadow:
              20px 0 60px rgba(47, 34, 17, 0.12);
          }

          .dashboard-sidebar.sidebar-open {
            transform: translateX(0);
          }

          .dashboard-main {
            margin-left: 0;
          }

          .mobile-overlay {
            position: fixed;
            inset: 0;
            z-index: 60;
            border: 0;
            background: rgba(38, 28, 17, 0.28);
          }

          .mobile-close {
            display: grid;
            place-items: center;
          }

          .mobile-menu-button {
            width: 40px;
            height: 40px;
            display: grid;
            place-items: center;
            flex: 0 0 auto;
            border: 1px solid #e5dccf;
            border-radius: 10px;
            background: #fff;
            color: #6d6255;
          }

          .mobile-brand {
            display: flex;
            align-items: center;
            gap: 7px;
            color: #574a3c;
            font-size: 12px;
            font-weight: 900;
          }

          .mobile-brand span {
            width: 29px;
            height: 29px;
            display: grid;
            place-items: center;
            border-radius: 9px;
            background: #b8872d;
            color: #fff;
            font-size: 12px;
          }

          .dashboard-header {
            padding: 10px 16px;
          }

          .header-search-wrap {
            flex: 1;
          }

          .header-profile-copy {
            display: none;
          }

          .utility-right {
            display: none;
          }

          .hero-content {
            width: 65%;
            padding-left: 38px;
          }

          .hero-visual {
            left: 58%;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .utility-bar {
            justify-content: center;
            padding: 0 10px;
            font-size: 8px;
          }

          .utility-bar > div {
            justify-content: center;
          }

          .dashboard-header {
            gap: 8px;
          }

          .desktop-action {
            display: none;
          }

          .header-right {
            gap: 5px;
          }

          .header-icon-button {
            width: 37px;
            height: 37px;
          }

          .header-profile {
            width: 37px;
            height: 37px;
            padding: 2px;
            justify-content: center;
            border-radius: 10px;
          }

          .header-profile-copy,
          .header-profile > svg {
            display: none;
          }

          .avatar,
          .avatar-image {
            width: 31px;
            height: 31px;
          }

          .search-category {
            display: none;
          }

          .header-search-icon {
            margin-left: 11px;
          }

          .search-submit {
            width: 39px;
          }

          .dashboard-content {
            padding: 14px 12px 85px;
          }

          .hero-main {
            min-height: 475px;
            border-radius: 20px;
          }

          .hero-content {
            width: 100%;
            padding: 31px 23px 0;
          }

          .hero-content h1 {
            max-width: 450px;
            font-size: 34px;
            letter-spacing: -1.3px;
          }

          .hero-content p {
            max-width: 400px;
            font-size: 11px;
          }

          .hero-visual {
            inset: auto 0 0;
            height: 230px;
          }

          .hero-shopping-card {
            width: 175px;
            padding: 12px;
          }

          .hero-shopping-icon {
            width: 70px;
            height: 70px;
            margin: 12px auto;
          }

          .hero-shopping-icon svg {
            width: 38px;
          }

          .hero-shopping-card > strong {
            font-size: 11px;
          }

          .offer-one {
            top: 11%;
            right: 4%;
          }

          .offer-two {
            bottom: 9%;
            left: 4%;
          }

          .hero-dots {
            left: 23px;
            bottom: 18px;
          }

          .hero-arrow {
            top: auto;
            bottom: 15px;
            transform: none;
          }

          .hero-arrow-left {
            left: auto;
            right: 60px;
          }

          .hero-arrow-right {
            right: 18px;
          }

          .benefits-strip {
            grid-template-columns: 1fr 1fr;
            padding: 12px;
          }

          .benefit {
            justify-content: flex-start;
          }

          .benefit > span {
            width: 32px;
            height: 32px;
          }

          .welcome-grid {
            grid-template-columns: 1fr;
          }

          .welcome-card {
            min-height: auto;
            padding: 21px;
          }

          .welcome-card h2 {
            font-size: 20px;
          }

          .points-card {
            padding: 21px;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .stat-card {
            min-height: 91px;
            padding: 11px;
          }

          .stat-icon {
            width: 33px;
            height: 33px;
          }

          .stat-content strong {
            font-size: 15px;
          }

          .section {
            margin-top: 31px;
          }

          .section-heading h2 {
            font-size: 18px;
          }

          .section-heading p {
            font-size: 9px;
          }

          .product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .product-card-image {
            height: 180px;
          }

          .quick-add {
            opacity: 1;
            transform: none;
          }

          .product-card-body {
            padding: 10px;
          }

          .product-card-body h3 {
            font-size: 9px;
          }

          .product-card-description {
            font-size: 7px;
          }

          .product-price-row strong {
            font-size: 12px;
          }

          .smart-tools-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .smart-tool-card {
            min-height: 185px;
            padding: 13px;
          }

          .smart-tool-card h3 {
            font-size: 12px;
          }

          .smart-tool-card p {
            font-size: 8px;
          }

          .deal-banner {
            padding: 22px;
            flex-direction: column;
            align-items: flex-start;
          }

          .deal-timer-wrap {
            width: 100%;
            min-width: 0;
            text-align: left;
          }

          .deal-timer {
            justify-content: flex-start;
          }

          .personalized-section {
            padding: 19px;
          }

          .personalized-copy h2 {
            font-size: 20px;
          }

          .personalized-mini-grid {
            grid-template-columns: 1fr;
          }

          .feature-grid {
            grid-template-columns: 1fr;
          }

          .feature-panel {
            min-height: 245px;
          }

          .feature-panel-content {
            max-width: 62%;
          }

          .feature-panel h2 {
            font-size: 20px;
          }

          .coupon-grid {
            grid-template-columns: 1fr;
          }

          .recent-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .recent-image {
            height: 150px;
          }

          .trust-section {
            grid-template-columns: 1fr;
          }

          .dashboard-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .footer-links {
            flex-wrap: wrap;
            gap: 10px;
          }

          .mobile-bottom-nav {
            position: fixed;
            z-index: 80;
            left: 10px;
            right: 10px;
            bottom: 9px;
            height: 62px;
            padding: 6px 4px;
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            border: 1px solid #e7ddcf;
            border-radius: 17px;
            background: rgba(255, 253, 249, 0.96);
            box-shadow:
              0 15px 40px rgba(44, 32, 18, 0.13);
            backdrop-filter: blur(18px);
          }

          .mobile-bottom-nav a,
          .mobile-bottom-nav button {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
            border: 0;
            background: transparent;
            color: #968a7b;
            font-size: 7px;
            font-weight: 700;
          }

          .mobile-bottom-nav a:hover,
          .mobile-bottom-nav button:hover {
            color: #9a702b;
          }

          .mobile-cart-button span {
            position: relative;
          }

          .mobile-cart-button b {
            position: absolute;
            top: -7px;
            right: -9px;
            min-width: 15px;
            height: 15px;
            display: grid;
            place-items: center;
            border-radius: 50%;
            background: #b8872d;
            color: #fff;
            font-size: 7px;
          }

          .search-results {
            position: fixed;
            top: 108px;
            left: 10px;
            right: 10px;
            width: auto;
          }

          .pc-toast {
            right: 14px;
            bottom: 83px;
          }

          .mystery-section {
            align-items: flex-start;
          }

          .mystery-button {
            align-self: center;
          }
        }

        @media (max-width: 430px) {
          .mobile-brand strong {
            display: none;
          }

          .header-right .header-icon-button:first-child {
            display: none;
          }

          .header-search-wrap {
            height: 42px;
          }

          .hero-main {
            min-height: 450px;
          }

          .hero-content h1 {
            font-size: 30px;
          }

          .hero-actions {
            flex-wrap: wrap;
          }

          .hero-button,
          .hero-secondary {
            min-height: 38px;
            padding: 0 12px;
          }

          .category-card {
            min-width: 88px;
            flex-basis: 88px;
            min-height: 98px;
          }

          .category-emoji {
            width: 35px;
            height: 35px;
            font-size: 16px;
          }

          .flash-product-grid .product-card:nth-child(n + 5) {
            display: none;
          }

          .product-card-image {
            height: 155px;
          }

          .recent-image {
            height: 135px;
          }

          .feature-panel-content {
            max-width: 66%;
          }

          .budget-visual {
            right: -20px;
            opacity: 0.7;
          }

          .setup-visual {
            right: -15px;
            opacity: 0.65;
          }

          .mystery-section {
            padding: 15px;
            flex-wrap: wrap;
          }

          .mystery-copy {
            min-width: calc(100% - 67px);
          }

          .mystery-button {
            width: 100%;
          }

          .order-row {
            grid-template-columns: 33px minmax(80px, 1fr) auto 16px;
          }

          .order-status {
            display: none;
          }

          .trust-section {
            padding: 12px;
          }

          .trust-section > div {
            padding: 5px;
          }
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
      `}</style>
    </div>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  onOpen,
  onAdd,
  showFlash = false,
}: {
  product: Product;
  onOpen: (product: Product) => void;
  onAdd: (product: Product) => void;
  showFlash?: boolean;
}) {
  const discount = discountPercentage(
    product.price,
    product.original_price
  );

  return (
    <article className="product-card">
      <Link
        href={`/dashboard/products/${product.id}`}
        onClick={() => onOpen(product)}
      >
        <div className="product-card-image">
          <ProductImage product={product} />

          <div className="product-badge-row">
            {discount > 0 ? (
              <span className="discount-badge">
                -{discount}%
              </span>
            ) : (
              <span />
            )}

            {showFlash && (
              <span className="flash-label">
                <Flame size={11} />
                FLASH
              </span>
            )}
          </div>

          <button
            className="product-heart"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              window.location.href =
                "/dashboard/wishlist";
            }}
            aria-label="Wishlist"
          >
            <Heart size={16} />
          </button>

          <button
            className="quick-add"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onAdd(product);
            }}
          >
            <ShoppingCart size={14} />
            Quick Add
          </button>
        </div>
      </Link>

      <div className="product-card-body">
        <span className="product-brand">
          {product.brand || "PrimeCart Exclusive"}
        </span>

        <Link
          href={`/dashboard/products/${product.id}`}
          onClick={() => onOpen(product)}
        >
          <h3>{product.name}</h3>
        </Link>

        <p className="product-card-description">
          {product.short_description ||
            "Quality product selected by PrimeCart."}
        </p>

        <div className="rating-row">
          <span className="rating-pill">
            <Star size={9} />
            {Number(product.rating || 0).toFixed(1)}
          </span>

          <span className="reviews-count">
            ({product.reviews_count || 0})
          </span>
        </div>

        <div className="product-price-row">
          <strong>
            {formatPrice(product.price)}
          </strong>

          {product.original_price &&
            product.original_price >
              product.price && (
              <>
                <del>
                  {formatPrice(
                    product.original_price
                  )}
                </del>

                {discount > 0 && (
                  <em>
                    {discount}% off
                  </em>
                )}
              </>
            )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   SMALL ICON HELPERS
========================================================= */

function RefreshIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function BarIcon() {
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19V3" />
    </svg>
  );
}
