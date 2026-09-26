"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Crown,
  Flame,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
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
    description: "Create a complete setup from scratch.",
    badge: "CURATED",
    icon: Sparkles,
  },
  {
    label: "PrimePoints",
    href: "/dashboard/prime-points",
    description: "Track your rewards and shopping points.",
    badge: "REWARDS",
    icon: Crown,
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
  }).format(value || 0);
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

function formatDate(value: string) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatOrderStatus(status: string) {
  if (!status) return "Processing";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/* =========================================================
   PRODUCT IMAGE
   IMPORTANT:
   object-contain => COMPLETE IMAGE VISIBLE
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
        <ShoppingBag size={38} strokeWidth={1.4} />
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
        priority={false}
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 260px"
        className="product-image-full"
        onError={() => {
          setIndex((current) => current + 1);
        }}
      />
    </div>
  );
}

/* =========================================================
   HERO SLIDER
========================================================= */

type HeroSlide = {
  id: string;
  image: string;
  alt: string;
};

const heroSlides: HeroSlide[] = [
  { id: "hero-1", image: "/hero-banner.png", alt: "PrimeCart hero banner" },
  { id: "hero-2", image: "/hero-banner-2.png", alt: "PrimeCart hero banner 2" },
  { id: "hero-3", image: "/hero-banner-3.png", alt: "PrimeCart hero banner 3" },
  { id: "hero-4", image: "/hero-banner-4.png", alt: "PrimeCart hero banner 4" },
  { id: "hero-5", image: "/hero-banner-5.png", alt: "PrimeCart hero banner 5" },
  { id: "hero-6", image: "/hero-banner-6.png", alt: "PrimeCart hero banner 6" },
  { id: "hero-7", image: "/hero-banner-7.png", alt: "PrimeCart hero banner 7" },
  { id: "hero-8", image: "/hero-banner-8.png", alt: "PrimeCart hero banner 8" },
];

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);

  const [mobileMenu, setMobileMenu] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [wishlistCount, setWishlistCount] = useState(0);

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState("all");

  const [recentlyViewed, setRecentlyViewed] = useState<RecentProduct[]>(
    []
  );

  const [dealMessage, setDealMessage] = useState(
    "Your mystery deal is waiting."
  );

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
     RECENTLY VIEWED
  ======================================================= */

  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        "primecart_recently_viewed"
      );

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setRecentlyViewed(parsed);
        }
      }
    } catch {
      setRecentlyViewed([]);
    }
  }, []);

  /* =======================================================
     HERO SLIDER AUTO PLAY
  ======================================================= */

  useEffect(() => {
    if (heroPaused) return;
    const timer = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [heroPaused]);

  function goToHeroSlide(index: number) {
    setHeroSlide((index + heroSlides.length) % heroSlides.length);
  }

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const featuredProducts = useMemo(() => {
    const featured = products.filter(
      (product) => product.is_featured
    );

    return (featured.length ? featured : products).slice(0, 6);
  }, [products]);

  const flashProducts = useMemo(() => {
    const flash = products.filter(
      (product) => product.is_flash_sale
    );

    return (flash.length ? flash : products).slice(0, 4);
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
      .slice(0, 6);
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
      .map((item) => products.find((product) => product.id === item.id))
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

  /* =======================================================
     ACTIONS
  ======================================================= */

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.replace("/auth/login");
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
        ...current.filter((item) => item.id !== product.id),
      ].slice(0, 10);

      localStorage.setItem(
        "primecart_recently_viewed",
        JSON.stringify(updated)
      );
    } catch {
      // ignore local storage errors
    }
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
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-logo">
          <div className="loading-logo-mark">P</div>
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
            background:
              radial-gradient(
                circle at top left,
                rgba(199, 154, 59, 0.1),
                transparent 35%
              ),
              #fbf8f2;
            color: #4a4034;
          }

          .loading-logo {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .loading-logo-mark {
            width: 44px;
            height: 44px;
            border-radius: 14px;
            display: grid;
            place-items: center;
            background: linear-gradient(
              135deg,
              #d7b66a,
              #9c7430
            );
            color: white;
            font-size: 20px;
            font-weight: 800;
            box-shadow: 0 10px 30px rgba(155, 113, 46, 0.2);
          }

          .loading-logo strong {
            display: block;
            font-size: 19px;
          }

          .loading-logo span {
            display: block;
            color: #9b907f;
            font-size: 11px;
            margin-top: 2px;
          }

          .loading-spinner {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 3px solid #eadfcb;
            border-top-color: #b9975b;
            animation: spin 0.8s linear infinite;
          }

          .dashboard-loading p {
            color: #9b907f;
            font-size: 13px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="prime-dashboard">
      {/* ===================================================
          MOBILE OVERLAY
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
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-scroll">
          <div className="sidebar-label">MAIN MENU</div>

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
                  onClick={() => setMobileMenu(false)}
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
                  onClick={() => setMobileMenu(false)}
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
              Secure checkout, protected payments and easy
              returns.
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
            HEADER
        ================================================= */}

        <header className="dashboard-header">
          <div className="header-left">
            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenu(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div className="header-search-wrap">
              <Search
                size={18}
                className="header-search-icon"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onFocus={() => setSearchFocused(true)}
                placeholder="Search products, brands & categories..."
                className="header-search"
              />

              {search && (
                <button
                  className="search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}

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
                        onClick={() => {
                          openProduct(product);
                          setSearchFocused(false);
                        }}
                      >
                        <div className="search-result-image">
                          <ProductImage product={product} />
                        </div>

                        <div className="search-result-info">
                          <strong>{product.name}</strong>

                          <span>
                            {product.brand || "PrimeCart"}
                          </span>

                          <b>
                            {formatPrice(product.price)}
                          </b>
                        </div>

                        <ChevronRight size={16} />
                      </Link>
                    ))
                  ) : (
                    <div className="search-empty">
                      <Search size={25} />
                      <strong>No products found</strong>
                      <span>
                        Try another product or brand name.
                      </span>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <Link
                      href="/dashboard/products"
                      className="search-view-all"
                      onClick={() =>
                        setSearchFocused(false)
                      }
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
                setNotificationOpen(!notificationOpen)
              }
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="notification-dot" />
            </button>

            <Link
              href="/dashboard/wishlist"
              className="header-icon-button desktop-action"
              aria-label="Wishlist"
            >
              <Heart size={19} />
              {wishlistCount > 0 && (
                <span className="header-count">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/orders"
              className="header-icon-button desktop-action"
              aria-label="Orders"
            >
              <ShoppingBag size={19} />
            </Link>

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
                      <span>{profile?.email}</span>
                    </div>
                  </div>

                  <div className="profile-divider" />

                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User size={16} />
                    My Profile
                  </Link>

                  <Link
                    href="/dashboard/orders"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Package size={16} />
                    My Orders
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={16} />
                    Settings
                  </Link>

                  <button onClick={handleLogout}>
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {notificationOpen && (
            <div className="notification-dropdown">
              <div className="notification-head">
                <strong>Notifications</strong>
                <span>2 new</span>
              </div>

              <div className="notification-item">
                <div className="notification-icon gold">
                  <Zap size={15} />
                </div>

                <div>
                  <strong>Flash deals are live</strong>
                  <span>
                    Discover limited-time offers.
                  </span>
                </div>
              </div>

              <div className="notification-item">
                <div className="notification-icon green">
                  <CheckCircle2 size={15} />
                </div>

                <div>
                  <strong>PrimePoints updated</strong>
                  <span>
                    Your shopping rewards are ready.
                  </span>
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="dashboard-content">
          {/* ===============================================
              PRIME CART HERO SLIDER
          =============================================== */}

          <section
            className="welcome-hero hero-image-carousel"
            aria-label="PrimeCart featured banners"
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
            onFocus={() => setHeroPaused(true)}
            onBlur={() => setHeroPaused(false)}
          >
            {heroSlides.map((slide, index) => {
              const active = index === heroSlide;
              return (
                <div key={slide.id} className={`hero-slide hero-image-slide ${active ? "hero-slide-active" : ""}`} aria-hidden={!active}>
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 700px) 100vw, (max-width: 1200px) 92vw, 1200px"
                    className="hero-banner-image"
                  />
                </div>
              );
            })}

            <button type="button" className="hero-nav hero-nav-prev" onClick={() => goToHeroSlide(heroSlide - 1)} aria-label="Previous banner">
              <ArrowLeft size={17} />
            </button>
            <button type="button" className="hero-nav hero-nav-next" onClick={() => goToHeroSlide(heroSlide + 1)} aria-label="Next banner">
              <ArrowRight size={17} />
            </button>

            <div className="hero-dots" aria-label="Hero slides">
              {heroSlides.map((slide, index) => (
                <button type="button" key={slide.id} className={`hero-dot ${index === heroSlide ? "hero-dot-active" : ""}`} onClick={() => goToHeroSlide(index)} aria-label={`Go to banner ${index + 1}`} aria-current={index === heroSlide ? "true" : undefined} />
              ))}
            </div>
          </section>

          {/* ===============================================
              QUICK STATS
          =============================================== */}

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
                <strong>{formatPrice(totalSpent)}</strong>
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

          {/* ===============================================
              SMART TOOLS
          =============================================== */}

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
                  Tools designed to make your shopping
                  easier.
                </p>
              </div>

              <Sparkles
                className="heading-sparkle"
                size={23}
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
                      <Icon size={22} />
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

          {/* ===============================================
              CATEGORIES
          =============================================== */}

          <section className="section">
            <div className="section-heading compact">
              <div>
                <span className="section-kicker">
                  EXPLORE
                </span>

                <h2>Shop by category</h2>
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
                onClick={() => setActiveCategory("all")}
              >
                <span className="category-emoji">
                  ✨
                </span>

                <strong>All</strong>

                <small>{products.length} items</small>
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
                    {categoryIcons[category.slug] || "🛍️"}
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

          {/* ===============================================
              FLASH DEALS
          =============================================== */}

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
                  Grab selected deals before they disappear.
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

            <div className="flash-grid">
              {flashProducts.map((product) => {
                const discount = discountPercentage(
                  product.price,
                  product.original_price
                );

                return (
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    key={product.id}
                    className="flash-card"
                    onClick={() => openProduct(product)}
                  >
                    <div className="flash-image">
                      <ProductImage product={product} />

                      {discount > 0 && (
                        <span className="discount-badge">
                          -{discount}%
                        </span>
                      )}

                      <span className="flash-label">
                        <Flame size={12} />
                        FLASH
                      </span>
                    </div>

                    <div className="flash-info">
                      <span className="product-brand">
                        {product.brand ||
                          "PrimeCart Exclusive"}
                      </span>

                      <h3>{product.name}</h3>

                      <div className="rating-row">
                        <Star
                          size={13}
                          fill="currentColor"
                        />

                        <span>
                          {Number(product.rating || 0).toFixed(
                            1
                          )}
                        </span>

                        <small>
                          ({product.reviews_count || 0})
                        </small>
                      </div>

                      <div className="price-row">
                        <strong>
                          {formatPrice(product.price)}
                        </strong>

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
                );
              })}
            </div>
          </section>

          {/* ===============================================
              PRIME CART PICKS
          =============================================== */}

          <section className="section">
            <div className="section-heading compact">
              <div>
                <span className="section-kicker">
                  CURATED FOR YOU
                </span>

                <h2>PrimeCart Picks</h2>

                <p>
                  Popular products selected from our
                  catalogue.
                </p>
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
              {featuredProducts.map((product) => {
                const discount = discountPercentage(
                  product.price,
                  product.original_price
                );

                return (
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    key={product.id}
                    className="product-card"
                    onClick={() => openProduct(product)}
                  >
                    <div className="product-card-image">
                      <ProductImage product={product} />

                      {discount > 0 && (
                        <span className="product-discount">
                          {discount}% OFF
                        </span>
                      )}

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
                        <Heart size={17} />
                      </button>

                      {product.stock <= 5 &&
                        product.stock > 0 && (
                          <span className="low-stock">
                            Only {product.stock} left
                          </span>
                        )}

                      {product.stock <= 0 && (
                        <span className="out-stock">
                          Out of stock
                        </span>
                      )}
                    </div>

                    <div className="product-card-body">
                      <span className="product-brand">
                        {product.brand || "PrimeCart"}
                      </span>

                      <h3>{product.name}</h3>

                      <p>
                        {product.short_description ||
                          product.description ||
                          "Premium product selected for you."}
                      </p>

                      <div className="rating-row">
                        <Star
                          size={13}
                          fill="currentColor"
                        />

                        <span>
                          {Number(product.rating || 0).toFixed(
                            1
                          )}
                        </span>

                        <small>
                          ({product.reviews_count || 0})
                        </small>
                      </div>

                      <div className="product-bottom">
                        <div className="product-price">
                          <strong>
                            {formatPrice(product.price)}
                          </strong>

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

                        <span className="product-arrow">
                          <ArrowRight size={15} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ===============================================
              CATEGORY PRODUCT FILTER
          =============================================== */}

          {activeCategory !== "all" && (
            <section className="section category-products-section">
              <div className="section-heading compact">
                <div>
                  <span className="section-kicker">
                    CATEGORY
                  </span>

                  <h2>
                    {categories.find(
                      (category) =>
                        category.id === activeCategory
                    )?.name || "Products"}
                  </h2>

                  <p>
                    Products available in this category.
                  </p>
                </div>

                <Link
                  href={`/dashboard/categories/${categories.find(
                    (category) =>
                      category.id === activeCategory
                  )?.slug || ""}`}
                  className="view-all-link"
                >
                  Open category
                  <ArrowRight size={15} />
                </Link>
              </div>

              {filteredCategoryProducts.length > 0 ? (
                <div className="mini-product-grid">
                  {filteredCategoryProducts
                    .slice(0, 4)
                    .map((product) => (
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        key={product.id}
                        className="mini-product-card"
                        onClick={() => openProduct(product)}
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

                          <strong>{product.name}</strong>

                          <b>
                            {formatPrice(product.price)}
                          </b>
                        </div>
                      </Link>
                    ))}
                </div>
              ) : (
                <div className="empty-category">
                  <Package size={28} />
                  <strong>No products in this category</strong>
                  <span>
                    Try another category.
                  </span>
                </div>
              )}
            </section>
          )}

          {/* ===============================================
              FEATURE GRID
          =============================================== */}

          <section className="feature-grid">
            {/* PRIME MATCH */}
            <Link
              href="/dashboard/prime-match"
              className="feature-panel prime-match-panel"
            >
              <div className="feature-panel-glow" />

              <div className="feature-panel-content">
                <span className="feature-kicker">
                  AI-POWERED SHOPPING
                </span>

                <div className="feature-icon">
                  <Target size={21} />
                </div>

                <h2>
                  Find your
                  <br />
                  perfect match.
                </h2>

                <p>
                  Tell PrimeMatch what you need, your
                  budget and priorities. We&apos;ll help
                  narrow your choices.
                </p>

                <span className="feature-cta">
                  Start PrimeMatch
                  <ArrowRight size={16} />
                </span>
              </div>

              <div className="match-orbit">
                <div className="orbit-dot one" />
                <div className="orbit-dot two" />
                <div className="orbit-dot three" />

                <div className="orbit-center">
                  <Sparkles size={23} />
                </div>
              </div>
            </Link>

            {/* BUDGET */}
            <Link
              href="/dashboard/budget-builder"
              className="feature-panel budget-panel"
            >
              <div className="budget-panel-top">
                <div className="feature-icon">
                  <WalletCards size={21} />
                </div>

                <span className="feature-kicker">
                  PLAN YOUR SPEND
                </span>
              </div>

              <h2>
                Build a smarter
                <br />
                shopping budget.
              </h2>

              <p>
                Set a limit and plan exactly where your
                money should go.
              </p>

              <div className="budget-visual">
                <div className="budget-line">
                  <span />
                </div>

                <div className="budget-labels">
                  <span>₹0</span>
                  <strong>₹25K</strong>
                </div>
              </div>

              <span className="feature-cta">
                Open Budget Builder
                <ArrowRight size={16} />
              </span>
            </Link>
          </section>

          {/* ===============================================
              SETUP + POINTS + MYSTERY
          =============================================== */}

          <section className="triple-feature-grid">
            <Link
              href="/dashboard/setup-builder"
              className="small-feature-card setup-card"
            >
              <div className="small-feature-icon">
                <Sparkles size={19} />
              </div>

              <span className="small-feature-label">
                CURATED SETUPS
              </span>

              <h3>Build My Setup</h3>

              <p>
                Gaming, college, work, fitness and more.
              </p>

              <span className="small-feature-arrow">
                Explore
                <ArrowRight size={15} />
              </span>
            </Link>

            <Link
              href="/dashboard/prime-points"
              className="small-feature-card points-card"
            >
              <div className="small-feature-icon">
                <Crown size={19} />
              </div>

              <span className="small-feature-label">
                REWARDS
              </span>

              <h3>PrimePoints</h3>

              <p>
                You currently have{" "}
                <strong>{primePoints}</strong> points.
              </p>

              <div className="points-mini-bar">
                <span
                  style={{
                    width: `${pointsProgress}%`,
                  }}
                />
              </div>

              <span className="small-feature-arrow">
                View rewards
                <ArrowRight size={15} />
              </span>
            </Link>

            <div className="small-feature-card mystery-card">
              <div className="small-feature-icon">
                <TicketPercent size={19} />
              </div>

              <span className="small-feature-label">
                JUST FOR YOU
              </span>

              <h3>Mystery Deal</h3>

              <p>{dealMessage}</p>

              <button
                className="mystery-button"
                onClick={revealMysteryDeal}
              >
                Reveal deal
                <Sparkles size={14} />
              </button>
            </div>
          </section>

          {/* ===============================================
              RECENTLY VIEWED
          =============================================== */}

          <section className="section">
            <div className="section-heading compact">
              <div>
                <span className="section-kicker">
                  YOUR ACTIVITY
                </span>

                <h2>Recently viewed</h2>

                <p>
                  Continue exploring products you checked
                  recently.
                </p>
              </div>

              <Link
                href="/dashboard/products"
                className="view-all-link"
              >
                Explore more
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="recent-grid">
              {visibleRecentProducts.map((product) => (
                <Link
                  href={`/dashboard/products/${product.id}`}
                  key={product.id}
                  className="recent-card"
                  onClick={() => openProduct(product)}
                >
                  <div className="recent-image">
                    <ProductImage product={product} />
                  </div>

                  <div className="recent-info">
                    <span>
                      {product.brand || "PrimeCart"}
                    </span>

                    <strong>{product.name}</strong>

                    <b>{formatPrice(product.price)}</b>
                  </div>

                  <ChevronRight size={16} />
                </Link>
              ))}
            </div>
          </section>

          {/* ===============================================
              BOTTOM AREA
          =============================================== */}

          <section className="bottom-grid">
            {/* ORDERS */}
            <div className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">
                    ACTIVITY
                  </span>

                  <h2>Recent orders</h2>
                </div>

                <Link
                  href="/dashboard/orders"
                  className="panel-link"
                >
                  View all
                  <ArrowRight size={14} />
                </Link>
              </div>

              {orders.length > 0 ? (
                <div className="orders-list">
                  {orders.slice(0, 5).map((order) => (
                    <Link
                      href="/dashboard/orders"
                      className="order-row"
                      key={order.id}
                    >
                      <div className="order-icon">
                        <Package size={17} />
                      </div>

                      <div className="order-info">
                        <strong>
                          Order #
                          {order.id.slice(0, 8).toUpperCase()}
                        </strong>

                        <span>
                          {formatDate(order.created_at)}
                        </span>
                      </div>

                      <div className="order-status">
                        <span
                          className={`status-dot ${order.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        />

                        {formatOrderStatus(order.status)}
                      </div>

                      <strong className="order-price">
                        {formatPrice(order.total_amount)}
                      </strong>

                      <ChevronRight size={15} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-panel">
                  <div className="empty-panel-icon">
                    <ShoppingBag size={24} />
                  </div>

                  <strong>No orders yet</strong>

                  <span>
                    Your recent orders will appear here.
                  </span>

                  <Link href="/dashboard/products">
                    Start shopping
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>

            {/* SHOPPING INSIGHTS */}
            <div className="dashboard-panel insights-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">
                    YOUR SHOPPING
                  </span>

                  <h2>Quick insights</h2>
                </div>

                <BarChart3 size={19} />
              </div>

              <div className="insight-list">
                <div className="insight-row">
                  <div className="insight-icon">
                    <ShoppingBag size={17} />
                  </div>

                  <div>
                    <span>Orders placed</span>
                    <strong>{orders.length}</strong>
                  </div>
                </div>

                <div className="insight-row">
                  <div className="insight-icon">
                    <Heart size={17} />
                  </div>

                  <div>
                    <span>Saved products</span>
                    <strong>{wishlistCount}</strong>
                  </div>
                </div>

                <div className="insight-row">
                  <div className="insight-icon">
                    <Crown size={17} />
                  </div>

                  <div>
                    <span>Reward points</span>
                    <strong>{primePoints}</strong>
                  </div>
                </div>

                <div className="insight-row">
                  <div className="insight-icon">
                    <Clock3 size={17} />
                  </div>

                  <div>
                    <span>Products available</span>
                    <strong>{products.length}</strong>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/prime-match"
                className="insight-cta"
              >
                Personalize your shopping
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>

          {/* ===============================================
              BENEFITS
          =============================================== */}

          <section className="benefits-strip">
            <div className="benefit-item">
              <div className="benefit-icon">
                <Truck size={19} />
              </div>

              <div>
                <strong>Fast delivery</strong>
                <span>
                  Reliable delivery on eligible orders
                </span>
              </div>
            </div>

            <div className="benefit-divider" />

            <div className="benefit-item">
              <div className="benefit-icon">
                <ShieldCheck size={19} />
              </div>

              <div>
                <strong>Secure payments</strong>
                <span>
                  Your payment information stays protected
                </span>
              </div>
            </div>

            <div className="benefit-divider" />

            <div className="benefit-item">
              <div className="benefit-icon">
                <TicketPercent size={19} />
              </div>

              <div>
                <strong>Exclusive deals</strong>
                <span>
                  Discover member-only shopping benefits
                </span>
              </div>
            </div>

            <div className="benefit-divider" />

            <div className="benefit-item">
              <div className="benefit-icon">
                <CircleDollarSign size={19} />
              </div>

              <div>
                <strong>Easy returns</strong>
                <span>
                  Shop confidently with simple returns
                </span>
              </div>
            </div>
          </section>

          {/* ===============================================
              FOOTER
          =============================================== */}

          <footer className="dashboard-footer">
            <div className="footer-brand">
              <div className="footer-logo">P</div>

              <div>
                <strong>PrimeCart</strong>
                <span>
                  Smart shopping, made personal.
                </span>
              </div>
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
          STYLES
      =================================================== */}

      <style jsx global>{`
        :root {
          --pc-bg: #fbf8f2;
          --pc-surface: #ffffff;
          --pc-surface-soft: #f8f3e9;
          --pc-gold: #b9975b;
          --pc-gold-dark: #96723b;
          --pc-gold-light: #dcc596;
          --pc-gold-pale: #f5ead6;
          --pc-brown: #4a4034;
          --pc-brown-light: #796e5d;
          --pc-muted: #9b907f;
          --pc-border: #eadfcb;
          --pc-border-light: #f0e8da;
          --pc-shadow: 0 14px 40px rgba(91, 69, 36, 0.08);
          --pc-shadow-hover: 0 20px 55px rgba(91, 69, 36, 0.13);
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: var(--pc-bg);
          color: var(--pc-brown);
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button,
        input {
          font: inherit;
        }

        button {
          border: 0;
        }

        .prime-dashboard {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 5% 0%,
              rgba(210, 174, 99, 0.1),
              transparent 25%
            ),
            radial-gradient(
              circle at 95% 15%,
              rgba(210, 174, 99, 0.08),
              transparent 23%
            ),
            var(--pc-bg);
        }

        /* =================================================
           SIDEBAR
        ================================================= */

        .dashboard-sidebar {
          position: fixed;
          z-index: 80;
          left: 0;
          top: 0;
          bottom: 0;
          width: 260px;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.92);
          border-right: 1px solid var(--pc-border-light);
          backdrop-filter: blur(22px);
        }

        .sidebar-brand {
          height: 78px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--pc-border-light);
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .brand-mark {
          width: 40px;
          height: 40px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          background:
            linear-gradient(
              145deg,
              #e2c47f,
              #aa7e34
            );
          color: #fff;
          box-shadow:
            0 9px 20px rgba(168, 124, 48, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.35);
        }

        .brand-mark span {
          font-size: 19px;
          font-weight: 900;
        }

        .brand-copy strong {
          display: block;
          font-size: 17px;
          letter-spacing: -0.4px;
        }

        .brand-copy span {
          display: block;
          margin-top: 1px;
          color: var(--pc-muted);
          font-size: 9px;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .mobile-close {
          display: none;
          background: transparent;
          color: var(--pc-brown);
          cursor: pointer;
        }

        .sidebar-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 22px 13px;
        }

        .sidebar-label {
          padding: 0 12px 9px;
          color: #a69a88;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .smart-label {
          margin-top: 27px;
        }

        .sidebar-nav {
          display: grid;
          gap: 5px;
        }

        .sidebar-link {
          position: relative;
          min-height: 45px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0 12px;
          border-radius: 13px;
          color: var(--pc-brown-light);
          font-size: 13px;
          font-weight: 650;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .sidebar-link:hover {
          background: var(--pc-surface-soft);
          color: var(--pc-gold-dark);
          transform: translateX(2px);
        }

        .sidebar-link-active {
          color: var(--pc-gold-dark);
          background:
            linear-gradient(
              90deg,
              rgba(201, 163, 92, 0.16),
              rgba(201, 163, 92, 0.04)
            );
          box-shadow:
            inset 3px 0 0 var(--pc-gold);
        }

        .sidebar-icon {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 9px;
        }

        .sidebar-link-active .sidebar-icon {
          background: #fff;
          box-shadow: 0 4px 12px rgba(110, 78, 28, 0.08);
        }

        .sidebar-count {
          margin-left: auto;
          min-width: 22px;
          height: 22px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: var(--pc-gold-pale);
          color: var(--pc-gold-dark);
          font-size: 10px;
          font-weight: 800;
        }

        .smart-sidebar {
          display: grid;
          gap: 6px;
        }

        .smart-sidebar-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 9px;
          border: 1px solid transparent;
          border-radius: 12px;
          transition: 0.2s ease;
        }

        .smart-sidebar-item:hover {
          background: #fffaf1;
          border-color: var(--pc-border);
          transform: translateY(-1px);
        }

        .smart-sidebar-icon {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: var(--pc-gold-dark);
          background: var(--pc-gold-pale);
        }

        .smart-sidebar-content {
          min-width: 0;
          flex: 1;
        }

        .smart-sidebar-content strong {
          display: block;
          font-size: 11px;
        }

        .smart-sidebar-content small {
          display: block;
          margin-top: 2px;
          color: var(--pc-muted);
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.9px;
        }

        .smart-sidebar-item > svg {
          color: #b5aa99;
        }

        .sidebar-help {
          margin: 20px 3px 0;
          padding: 15px;
          border-radius: 16px;
          background:
            linear-gradient(
              145deg,
              #fffaf1,
              #f8f0df
            );
          border: 1px solid var(--pc-border);
        }

        .sidebar-help-icon {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          margin-bottom: 10px;
          border-radius: 10px;
          background: #fff;
          color: var(--pc-gold-dark);
        }

        .sidebar-help strong {
          display: block;
          font-size: 12px;
        }

        .sidebar-help p {
          margin: 5px 0 10px;
          color: var(--pc-brown-light);
          font-size: 10px;
          line-height: 1.55;
        }

        .sidebar-help a {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--pc-gold-dark);
          font-size: 10px;
          font-weight: 750;
        }

        .sidebar-bottom {
          padding: 12px;
          border-top: 1px solid var(--pc-border-light);
        }

        .sidebar-bottom-link {
          width: 100%;
          min-height: 40px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 11px;
          border-radius: 10px;
          background: transparent;
          color: var(--pc-brown-light);
          font-size: 12px;
          cursor: pointer;
          text-align: left;
        }

        .sidebar-bottom-link:hover {
          background: var(--pc-surface-soft);
          color: var(--pc-gold-dark);
        }

        .logout-button {
          margin-top: 3px;
        }

        /* =================================================
           MAIN
        ================================================= */

        .dashboard-main {
          min-height: 100vh;
          margin-left: 260px;
        }

        /* =================================================
           HEADER
        ================================================= */

        .dashboard-header {
          position: sticky;
          z-index: 50;
          top: 0;
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 12px 34px;
          background: rgba(251, 248, 242, 0.84);
          border-bottom: 1px solid rgba(234, 223, 203, 0.7);
          backdrop-filter: blur(20px);
        }

        .header-left {
          min-width: 0;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .mobile-menu-button {
          display: none;
          width: 40px;
          height: 40px;
          place-items: center;
          border-radius: 11px;
          background: #fff;
          border: 1px solid var(--pc-border);
          color: var(--pc-brown);
          cursor: pointer;
        }

        .header-search-wrap {
          position: relative;
          width: min(100%, 530px);
        }

        .header-search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #a99d8c;
          pointer-events: none;
        }

        .header-search {
          width: 100%;
          height: 45px;
          padding: 0 42px;
          border: 1px solid var(--pc-border);
          border-radius: 14px;
          outline: none;
          background: rgba(255, 255, 255, 0.85);
          color: var(--pc-brown);
          font-size: 12px;
          transition: 0.2s ease;
        }

        .header-search::placeholder {
          color: #b3a999;
        }

        .header-search:focus {
          border-color: var(--pc-gold-light);
          box-shadow:
            0 0 0 4px rgba(185, 151, 91, 0.08),
            0 8px 25px rgba(100, 75, 37, 0.05);
          background: #fff;
        }

        .search-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          width: 24px;
          height: 24px;
          transform: translateY(-50%);
          display: grid;
          place-items: center;
          border-radius: 7px;
          background: var(--pc-surface-soft);
          color: var(--pc-muted);
          cursor: pointer;
        }

        .search-results {
          position: absolute;
          z-index: 100;
          top: calc(100% + 9px);
          left: 0;
          right: 0;
          overflow: hidden;
          border: 1px solid var(--pc-border);
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 25px 60px rgba(63, 48, 25, 0.15);
          animation: dropdownIn 0.18s ease both;
        }

        .search-results-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 15px;
          border-bottom: 1px solid var(--pc-border-light);
        }

        .search-results-head span {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        .search-results-head small {
          color: var(--pc-muted);
          font-size: 10px;
        }

        .search-result-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 13px;
          border-bottom: 1px solid #f4eee4;
          transition: 0.15s ease;
        }

        .search-result-item:hover {
          background: #fffbf5;
        }

        .search-result-image {
          position: relative;
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          overflow: hidden;
          border-radius: 10px;
          background: #faf7f1;
        }

        .search-result-info {
          min-width: 0;
          flex: 1;
        }

        .search-result-info strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 11px;
        }

        .search-result-info span {
          display: block;
          margin-top: 2px;
          color: var(--pc-muted);
          font-size: 9px;
        }

        .search-result-info b {
          display: block;
          margin-top: 3px;
          color: var(--pc-gold-dark);
          font-size: 10px;
        }

        .search-result-item > svg {
          color: #b8aa97;
        }

        .search-view-all {
          min-height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: var(--pc-gold-dark);
          font-size: 11px;
          font-weight: 750;
        }

        .search-empty {
          min-height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          color: #b0a494;
        }

        .search-empty strong {
          color: var(--pc-brown);
          font-size: 12px;
        }

        .search-empty span {
          font-size: 10px;
        }

        .header-right {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-icon-button {
          position: relative;
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          border: 1px solid var(--pc-border);
          background: rgba(255, 255, 255, 0.8);
          color: var(--pc-brown-light);
          cursor: pointer;
          transition: 0.2s ease;
        }

        .header-icon-button:hover {
          border-color: var(--pc-gold-light);
          color: var(--pc-gold-dark);
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(90, 67, 34, 0.07);
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #d94b4b;
          box-shadow: 0 0 0 3px #fff;
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
          border-radius: 999px;
          background: var(--pc-gold-dark);
          color: white;
          font-size: 8px;
          font-weight: 800;
          border: 2px solid var(--pc-bg);
        }

        .header-profile-wrap {
          position: relative;
        }

        .header-profile {
          min-height: 42px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 2px 4px 2px 2px;
          background: transparent;
          color: var(--pc-brown);
          cursor: pointer;
        }

        .avatar,
        .avatar-image {
          width: 37px;
          height: 37px;
          border-radius: 11px;
        }

        .avatar {
          display: grid;
          place-items: center;
          background:
            linear-gradient(
              145deg,
              #dfc282,
              #a47b37
            );
          color: white;
          font-size: 11px;
          font-weight: 850;
          box-shadow: 0 5px 15px rgba(153, 111, 44, 0.17);
        }

        .avatar.large {
          width: 42px;
          height: 42px;
        }

        .avatar-image {
          object-fit: cover;
        }

        .header-profile-copy {
          min-width: 72px;
          text-align: left;
        }

        .header-profile-copy strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 11px;
        }

        .header-profile-copy small {
          display: block;
          margin-top: 2px;
          color: var(--pc-muted);
          font-size: 9px;
        }

        .profile-dropdown,
        .notification-dropdown {
          position: absolute;
          z-index: 110;
          top: calc(100% + 10px);
          right: 0;
          width: 230px;
          padding: 8px;
          border: 1px solid var(--pc-border);
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 25px 60px rgba(63, 48, 25, 0.15);
          animation: dropdownIn 0.18s ease both;
        }

        .profile-dropdown-head {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 8px;
        }

        .profile-dropdown-head strong {
          display: block;
          font-size: 11px;
        }

        .profile-dropdown-head span {
          display: block;
          max-width: 145px;
          margin-top: 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--pc-muted);
          font-size: 9px;
        }

        .profile-divider {
          height: 1px;
          margin: 5px 0;
          background: var(--pc-border-light);
        }

        .profile-dropdown a,
        .profile-dropdown button {
          width: 100%;
          min-height: 38px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 9px;
          border-radius: 9px;
          background: transparent;
          color: var(--pc-brown-light);
          font-size: 11px;
          text-align: left;
          cursor: pointer;
        }

        .profile-dropdown a:hover,
        .profile-dropdown button:hover {
          background: var(--pc-surface-soft);
          color: var(--pc-gold-dark);
        }

        .notification-dropdown {
          right: 78px;
          width: 275px;
        }

        .notification-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 9px 11px;
          border-bottom: 1px solid var(--pc-border-light);
        }

        .notification-head strong {
          font-size: 12px;
        }

        .notification-head span {
          padding: 4px 7px;
          border-radius: 999px;
          background: var(--pc-gold-pale);
          color: var(--pc-gold-dark);
          font-size: 8px;
          font-weight: 800;
        }

        .notification-item {
          display: flex;
          gap: 9px;
          padding: 11px 8px;
        }

        .notification-icon {
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          display: grid;
          place-items: center;
          border-radius: 9px;
        }

        .notification-icon.gold {
          color: #9a742f;
          background: #f8ecd7;
        }

        .notification-icon.green {
          color: #4e8660;
          background: #eaf5ec;
        }

        .notification-item strong {
          display: block;
          font-size: 10px;
        }

        .notification-item span {
          display: block;
          margin-top: 3px;
          color: var(--pc-muted);
          font-size: 9px;
        }

        /* =================================================
           CONTENT
        ================================================= */

        .dashboard-content {
          max-width: 1680px;
          margin: 0 auto;
          padding: 28px 34px 45px;
        }

        /* =================================================
           HERO CAROUSEL
        ================================================= */

        .welcome-hero { position:relative; min-height:315px; height:315px; overflow:hidden; border:1px solid rgba(190,153,83,.22); border-radius:27px; background:#f5efe3; box-shadow:0 22px 50px rgba(130,94,35,.1),inset 0 1px 0 rgba(255,255,255,.55); animation:heroIn .55s ease both; isolation:isolate; }
        .hero-slide { position:absolute; inset:0; width:100%; height:100%; opacity:0; visibility:hidden; transform:translateX(18px) scale(1.01); transition:opacity .5s ease,transform .65s ease,visibility .5s ease; }
        .hero-slide-active { opacity:1; visibility:visible; transform:translateX(0) scale(1); z-index:1; }
        .hero-banner-image { position:absolute !important; inset:0; width:100% !important; height:100% !important; object-fit:cover; object-position:center; user-select:none; -webkit-user-drag:none; }
        .hero-image-carousel::after { content:""; position:absolute; inset:0; z-index:2; pointer-events:none; background:linear-gradient(to top,rgba(28,21,11,.16),transparent 28%); }
        .hero-nav { position:absolute; z-index:6; top:50%; width:38px; height:38px; display:grid; place-items:center; transform:translateY(-50%); border:1px solid rgba(255,255,255,.65); border-radius:50%; background:rgba(255,255,255,.78); color:#5d451e; backdrop-filter:blur(8px); box-shadow:0 8px 22px rgba(64,44,14,.14); transition:.2s ease; cursor:pointer; }
        .hero-nav:hover { background:#fff; transform:translateY(-50%) scale(1.06); }
        .hero-nav-prev { left:16px; } .hero-nav-next { right:16px; }
        .hero-dots { position:absolute; left:50%; bottom:14px; z-index:7; display:flex; align-items:center; gap:6px; padding:6px 9px; border:1px solid rgba(255,255,255,.55); border-radius:999px; background:rgba(255,255,255,.62); box-shadow:0 7px 18px rgba(64,44,14,.12); backdrop-filter:blur(8px); transform:translateX(-50%); }
        .hero-dot { width:7px; height:7px; padding:0; border:0; border-radius:50%; background:rgba(102,78,38,.34); cursor:pointer; transition:width .25s ease,background .25s ease; }
        .hero-dot-active { width:22px; border-radius:999px; background:#b8872d; }

        @media (max-width: 1400px) {
          .welcome-hero { min-height:315px; height:315px; }
          .hero-nav-prev { left:14px; }
          .hero-nav-next { right:14px; }

          .product-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .category-strip {
            grid-template-columns: repeat(6, 1fr);
          }

        }

        @media (max-width: 1180px) {
          .dashboard-sidebar {
            width: 225px;
          }

          .dashboard-main {
            margin-left: 225px;
          }

          .dashboard-content {
            padding: 24px;
          }

          .smart-tools-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .flash-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .feature-grid {
            grid-template-columns: 1fr;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }

          .recent-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .benefits-strip {
            grid-template-columns: repeat(2, 1fr);
          }

          .benefit-divider {
            display: none;
          }
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 980px) {
          .dashboard-sidebar {
            transform: translateX(-100%);
            transition: transform 0.28s ease;
            box-shadow: 20px 0 50px rgba(50, 37, 20, 0.15);
          }

          .dashboard-sidebar.sidebar-open {
            transform: translateX(0);
          }

          .dashboard-main {
            margin-left: 0;
          }

          .mobile-menu-button {
            display: grid;
          }

          .mobile-close {
            display: grid;
            place-items: center;
          }

          .mobile-overlay {
            position: fixed;
            z-index: 70;
            inset: 0;
            display: block;
            background: rgba(45, 34, 21, 0.28);
            backdrop-filter: blur(2px);
          }

          .dashboard-header {
            padding: 11px 20px;
          }

          .desktop-action {
            display: none;
          }



          .product-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .mini-product-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 700px) {
          .dashboard-header {
            min-height: 68px;
            padding: 10px 14px;
            gap: 8px;
          }

          .header-left {
            gap: 8px;
          }

          .mobile-menu-button {
            width: 38px;
            height: 38px;
            flex: 0 0 38px;
          }

          .header-search-wrap {
            width: 100%;
          }

          .header-search {
            height: 40px;
            padding-left: 38px;
            padding-right: 34px;
            font-size: 10px;
          }

          .header-search-icon {
            left: 12px;
            width: 16px;
          }

          .header-right {
            gap: 5px;
          }

          .header-icon-button {
            width: 37px;
            height: 37px;
          }

          .header-profile {
            padding-right: 0;
          }

          .header-profile-copy,
          .header-profile > svg {
            display: none;
          }

          .notification-dropdown {
            right: 55px;
            width: min(275px, calc(100vw - 30px));
          }

          .dashboard-content {
            padding: 15px 13px 30px;
          }





          .hero-nav-prev { left:9px; }
          .hero-nav-next { right:9px; }
          .hero-dots { left:21px; bottom:14px; }

          .welcome-hero { min-height:220px; height:220px; border-radius:21px; }
          .hero-banner-image { object-position:center center; }
          .hero-nav { width:32px; height:32px; }
          .hero-nav-prev { left:8px; }
          .hero-nav-next { right:8px; }
          .hero-dots { bottom:9px; gap:5px; padding:5px 8px; }
          .hero-dot { width:6px; height:6px; }
          .hero-dot-active { width:18px; }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-top: 10px;
          }

          .stat-card {
            min-height: 91px;
            padding: 11px;
            gap: 8px;
          }

          .stat-icon {
            width: 34px;
            height: 34px;
            flex-basis: 34px;
          }

          .stat-content strong {
            font-size: 14px;
          }

          .stat-content small {
            font-size: 7px;
          }

          .section {
            margin-top: 31px;
          }

          .section-heading {
            align-items: flex-start;
            margin-bottom: 12px;
          }

          .section-heading h2 {
            font-size: 17px;
          }

          .section-heading p {
            font-size: 9px;
          }

          .smart-tools-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .smart-tool-card {
            min-height: 195px;
            padding: 13px;
          }

          .smart-tool-icon {
            margin-top: 17px;
            width: 37px;
            height: 37px;
          }

          .smart-tool-card h3 {
            font-size: 13px;
          }

          .smart-tool-card p {
            font-size: 8px;
          }

          .smart-tool-link {
            left: 13px;
            bottom: 13px;
          }

          .category-strip {
            display: flex;
            overflow-x: auto;
            gap: 7px;
            padding-bottom: 5px;
            scrollbar-width: none;
          }

          .category-strip::-webkit-scrollbar {
            display: none;
          }

          .category-card {
            min-width: 83px;
            min-height: 92px;
            flex: 0 0 83px;
          }

          .category-emoji {
            width: 34px;
            height: 34px;
            font-size: 16px;
          }

          .flash-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .flash-image {
            height: 145px;
          }

          .flash-info {
            padding: 10px;
          }

          .flash-info h3 {
            font-size: 10px;
          }

          .price-row strong {
            font-size: 11px;
          }

          .product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .product-card-image {
            height: 165px;
          }

          .product-image-full {
            padding: 8px;
          }

          .product-card-body {
            padding: 10px;
          }

          .product-card-body h3 {
            font-size: 10px;
          }

          .product-card-body p {
            font-size: 7px;
          }

          .product-heart {
            opacity: 1;
            transform: none;
            width: 28px;
            height: 28px;
          }

          .feature-grid {
            margin-top: 31px;
          }

          .feature-panel {
            min-height: 300px;
            padding: 22px;
            border-radius: 19px;
          }

          .feature-panel h2 {
            font-size: 24px;
          }

          .feature-panel p {
            max-width: 65%;
          }

          .match-orbit {
            right: -80px;
            opacity: 0.55;
          }

          .triple-feature-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .small-feature-card {
            min-height: 190px;
          }

          .recent-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .mini-product-grid {
            grid-template-columns: 1fr;
          }

          .order-row {
            grid-template-columns: 34px minmax(80px, 1fr) auto 16px;
          }

          .order-status {
            display: none;
          }

          .bottom-grid {
            margin-top: 31px;
          }

          .benefits-strip {
            grid-template-columns: 1fr;
            gap: 13px;
            padding: 16px;
          }

          .benefit-divider {
            display: none;
          }

          .dashboard-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .footer-links {
            flex-wrap: wrap;
          }

          .footer-copy {
            order: 3;
          }

          .search-results {
            position: fixed;
            top: 62px;
            left: 12px;
            right: 12px;
            width: auto;
          }
        }

        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 430px) {
          .header-right .header-icon-button {
            display: none;
          }

          .header-right .header-profile {
            display: flex;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .stat-card {
            min-width: 0;
          }

          .stat-content strong {
            max-width: 90px;
          }

          .smart-tool-card {
            min-height: 185px;
          }

          .product-card-image {
            height: 150px;
          }

          .flash-image {
            height: 135px;
          }

        }

        /* =================================================
           REDUCED MOTION
        ================================================= */

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
