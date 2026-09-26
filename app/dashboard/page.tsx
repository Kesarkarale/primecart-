"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
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
   MAIN DASHBOARD
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

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState("all");

  const [recentlyViewed, setRecentlyViewed] = useState<RecentProduct[]>(
    []
  );

  const [dealMessage, setDealMessage] = useState(
    "Your mystery deal is waiting."
  );

  const [heroSlide, setHeroSlide] = useState(0);
  const heroBanners = [
    "/hero-banner.png",
    "/hero-banner-2.png",
    "/hero-banner-3.png",
    "/hero-banner-4.png",
    "/hero-banner-5.png",
    "/hero-banner-6.png",
    "/hero-banner-7.png",
    "/hero-banner-8.png",
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % heroBanners.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const previousHero = () => {
    setHeroSlide((current) =>
      current === 0 ? heroBanners.length - 1 : current - 1
    );
  };

  const nextHero = () => {
    setHeroSlide((current) => (current + 1) % heroBanners.length);
  };

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
              WELCOME HERO
          =============================================== */}

          <section
            className="welcome-hero hero-banner-carousel"
            aria-label="PrimeCart featured banners"
          >
            <div className="hero-banner-track">
              {heroBanners.map((banner, index) => (
                <div
                  key={banner}
                  className={`hero-banner-slide ${
                    index === heroSlide ? "active" : ""
                  }`}
                  aria-hidden={index !== heroSlide}
                >
                  <Image
                    src={banner}
                    alt={`PrimeCart banner ${index + 1}`}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 700px) 100vw, 1680px"
                    className="hero-banner-image"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              className="hero-banner-arrow hero-banner-prev"
              onClick={previousHero}
              aria-label="Previous banner"
            >
              <ChevronRight size={20} />
            </button>

            <button
              type="button"
              className="hero-banner-arrow hero-banner-next"
              onClick={nextHero}
              aria-label="Next banner"
            >
              <ChevronRight size={20} />
            </button>

            <div className="hero-banner-dots" aria-label="Banner navigation">
              {heroBanners.map((banner, index) => (
                <button
                  key={`${banner}-dot`}
                  type="button"
                  className={`hero-banner-dot ${
                    index === heroSlide ? "active" : ""
                  }`}
                  onClick={() => setHeroSlide(index)}
                  aria-label={`Go to banner ${index + 1}`}
                  aria-current={index === heroSlide ? "true" : undefined}
                />
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
           HERO
        ================================================= */

        .welcome-hero {
          position: relative;
          min-height: 285px;
          height: 285px;
          overflow: hidden;
          border: 1px solid rgba(190, 153, 83, 0.22);
          border-radius: 27px;
          background: #f5ead5;
          box-shadow:
            0 22px 50px rgba(130, 94, 35, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.55);
          animation: heroIn 0.55s ease both;
        }

        .hero-banner-track,
        .hero-banner-slide {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .hero-banner-slide {
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.65s ease, visibility 0.65s ease;
        }

        .hero-banner-slide.active {
          opacity: 1;
          visibility: visible;
          z-index: 1;
        }

        .hero-banner-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        .hero-banner-arrow {
          position: absolute;
          top: 50%;
          z-index: 5;
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.62);
          border-radius: 50%;
          background: rgba(57, 43, 25, 0.32);
          color: #fff;
          backdrop-filter: blur(8px);
          transform: translateY(-50%);
          transition: 0.2s ease;
          cursor: pointer;
        }

        .hero-banner-arrow:hover {
          background: rgba(57, 43, 25, 0.58);
          transform: translateY(-50%) scale(1.05);
        }

        .hero-banner-prev {
          left: 16px;
          transform: translateY(-50%) rotate(180deg);
        }

        .hero-banner-prev:hover {
          transform: translateY(-50%) rotate(180deg) scale(1.05);
        }

        .hero-banner-next {
          right: 16px;
        }

        .hero-banner-dots {
          position: absolute;
          left: 50%;
          bottom: 14px;
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          border: 1px solid rgba(255, 255, 255, 0.45);
          border-radius: 999px;
          background: rgba(45, 34, 21, 0.2);
          backdrop-filter: blur(8px);
          transform: translateX(-50%);
        }

        .hero-banner-dot {
          width: 6px;
          height: 6px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.58);
          cursor: pointer;
          transition: 0.25s ease;
        }

        .hero-banner-dot.active {
          width: 20px;
          border-radius: 999px;
          background: #fff;
        }

        /* =================================================
           STATS
        ================================================= */

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 13px;
          margin-top: 18px;
        }

        .stat-card {
          min-width: 0;
          min-height: 105px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 1px solid var(--pc-border-light);
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.84);
          box-shadow: 0 7px 22px rgba(84, 62, 30, 0.04);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          border-color: var(--pc-border);
          box-shadow: var(--pc-shadow);
        }

        .stat-icon {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
        }

        .gold-icon {
          color: #9b732f;
          background: #f8ecd8;
        }

        .rose-icon {
          color: #b25e69;
          background: #fae9eb;
        }

        .green-icon {
          color: #4c8560;
          background: #e8f3eb;
        }

        .purple-icon {
          color: #7a65a5;
          background: #eeeafb;
        }

        .stat-content {
          min-width: 0;
          flex: 1;
        }

        .stat-content span {
          display: block;
          color: var(--pc-muted);
          font-size: 9px;
          font-weight: 650;
        }

        .stat-content strong {
          display: block;
          margin-top: 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--pc-brown);
          font-size: 18px;
          letter-spacing: -0.4px;
        }

        .stat-content small {
          display: block;
          margin-top: 3px;
          color: #b0a494;
          font-size: 8px;
        }

        .stat-card > svg {
          color: #c1b5a4;
        }

        /* =================================================
           SECTION
        ================================================= */

        .section {
          margin-top: 42px;
        }

        .section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 17px;
        }

        .section-heading.compact {
          align-items: center;
        }

        .section-kicker {
          display: block;
          color: var(--pc-gold-dark);
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 1.5px;
        }

        .section-kicker.red {
          color: #bd5a52;
        }

        .section-heading h2 {
          margin: 5px 0 0;
          color: var(--pc-brown);
          font-size: 20px;
          letter-spacing: -0.65px;
        }

        .section-heading p {
          margin: 5px 0 0;
          color: var(--pc-muted);
          font-size: 10px;
        }

        .heading-sparkle {
          color: var(--pc-gold-light);
        }

        .view-all-link,
        .panel-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--pc-gold-dark);
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .view-all-link:hover,
        .panel-link:hover {
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* =================================================
           SMART TOOLS
        ================================================= */

        .smart-tools-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 13px;
        }

        .smart-tool-card {
          position: relative;
          min-height: 220px;
          overflow: hidden;
          padding: 18px;
          border: 1px solid var(--pc-border-light);
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 7px 24px rgba(82, 61, 29, 0.04);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
          animation: revealUp 0.55s ease both;
        }

        .smart-tool-card::before {
          content: "";
          position: absolute;
          right: -55px;
          bottom: -65px;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: rgba(213, 182, 117, 0.08);
          transition: 0.3s ease;
        }

        .smart-tool-card:hover {
          transform: translateY(-5px);
          border-color: var(--pc-border);
          box-shadow: var(--pc-shadow-hover);
        }

        .smart-tool-card:hover::before {
          transform: scale(1.3);
        }

        .smart-tool-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .smart-tool-badge {
          color: #a27a39;
          font-size: 7px;
          font-weight: 850;
          letter-spacing: 1.1px;
        }

        .smart-tool-arrow {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #faf7f0;
          color: #9d8760;
          transition: 0.2s ease;
        }

        .smart-tool-card:hover .smart-tool-arrow {
          background: var(--pc-gold);
          color: #fff;
          transform: rotate(-5deg);
        }

        .smart-tool-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          margin-top: 23px;
          border-radius: 13px;
          background: linear-gradient(
            145deg,
            #fbf3e2,
            #f2e2c1
          );
          color: var(--pc-gold-dark);
        }

        .smart-tool-card h3 {
          margin: 15px 0 6px;
          font-size: 15px;
          letter-spacing: -0.3px;
        }

        .smart-tool-card p {
          max-width: 200px;
          min-height: 34px;
          margin: 0;
          color: var(--pc-muted);
          font-size: 10px;
          line-height: 1.55;
        }

        .smart-tool-link {
          position: absolute;
          left: 18px;
          bottom: 17px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: var(--pc-gold-dark);
          font-size: 9px;
          font-weight: 750;
        }

        /* =================================================
           CATEGORIES
        ================================================= */

        .category-strip {
          display: grid;
          grid-template-columns: repeat(11, minmax(72px, 1fr));
          gap: 8px;
        }

        .category-card {
          min-width: 0;
          min-height: 105px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 5px;
          border: 1px solid var(--pc-border-light);
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.8);
          color: var(--pc-brown);
          cursor: pointer;
          transition: 0.2s ease;
        }

        .category-card:hover {
          transform: translateY(-3px);
          border-color: var(--pc-border);
          box-shadow: 0 10px 24px rgba(82, 61, 29, 0.07);
        }

        .category-card-active {
          border-color: #d9bf8e;
          background: linear-gradient(
            145deg,
            #fffaf1,
            #f8edda
          );
          box-shadow: 0 10px 25px rgba(129, 94, 35, 0.08);
        }

        .category-emoji {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #faf7f1;
          font-size: 19px;
        }

        .category-card strong {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 9px;
        }

        .category-card small {
          color: var(--pc-muted);
          font-size: 7px;
        }

        /* =================================================
           FLASH DEALS
        ================================================= */

        .title-with-live {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 6px;
          border-radius: 999px;
          background: #fbe9e7;
          color: #b6534b;
          font-size: 6px;
          font-weight: 850;
          letter-spacing: 0.7px;
        }

        .live-badge span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #cf4d45;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .flash-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 13px;
        }

        .flash-card {
          overflow: hidden;
          border: 1px solid var(--pc-border-light);
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 6px 20px rgba(82, 61, 29, 0.04);
          transition: 0.22s ease;
        }

        .flash-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--pc-shadow-hover);
        }

        .flash-image {
          position: relative;
          height: 190px;
          overflow: hidden;
          background: #faf8f3;
        }

        .flash-info {
          padding: 13px;
        }

        .flash-info h3 {
          margin: 4px 0 7px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 12px;
        }

        .product-brand {
          display: block;
          color: var(--pc-gold-dark);
          font-size: 8px;
          font-weight: 750;
          letter-spacing: 0.2px;
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #c58f35;
          font-size: 9px;
        }

        .rating-row small {
          color: #aaa092;
          font-size: 8px;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 7px;
          margin-top: 9px;
        }

        .price-row strong {
          color: var(--pc-brown);
          font-size: 14px;
        }

        .price-row del {
          color: #aaa092;
          font-size: 9px;
        }

        .discount-badge,
        .flash-label {
          position: absolute;
          z-index: 3;
          top: 10px;
          padding: 5px 7px;
          border-radius: 7px;
          font-size: 7px;
          font-weight: 850;
        }

        .discount-badge {
          left: 10px;
          background: #fff;
          color: #ae534b;
        }

        .flash-label {
          right: 10px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: #8e4f44;
          color: #fff;
        }

        /* =================================================
           PRODUCT CARDS
        ================================================= */

        .product-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 13px;
        }

        .product-card {
          overflow: hidden;
          border: 1px solid var(--pc-border-light);
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 6px 20px rgba(82, 61, 29, 0.035);
          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease,
            border-color 0.22s ease;
        }

        .product-card:hover {
          transform: translateY(-5px);
          border-color: var(--pc-border);
          box-shadow: var(--pc-shadow-hover);
        }

        .product-card-image {
          position: relative;
          height: 205px;
          overflow: hidden;
          background: #faf8f3;
        }

        /*
          IMPORTANT:
          object-contain keeps the WHOLE ORIGINAL IMAGE visible.
          It does NOT crop top/bottom/left/right.
        */

        .product-image-wrapper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #faf8f3;
        }

        .product-image-full {
          object-fit: contain !important;
          object-position: center center !important;
          padding: 10px;
        }

        .product-image-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: #b9ad9c;
          background: #faf8f3;
        }

        .product-image-fallback span {
          font-size: 8px;
        }

        .product-discount {
          position: absolute;
          z-index: 4;
          top: 10px;
          left: 10px;
          padding: 5px 7px;
          border-radius: 7px;
          background: #fff;
          color: #a9514a;
          font-size: 7px;
          font-weight: 850;
          box-shadow: 0 4px 10px rgba(64, 45, 20, 0.06);
        }

        .product-heart {
          position: absolute;
          z-index: 4;
          top: 9px;
          right: 9px;
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.92);
          color: #8f8170;
          cursor: pointer;
          opacity: 0;
          transform: translateY(-3px);
          transition: 0.2s ease;
        }

        .product-card:hover .product-heart {
          opacity: 1;
          transform: translateY(0);
        }

        .product-heart:hover {
          color: #b95e6b;
          background: #fff4f5;
        }

        .low-stock,
        .out-stock {
          position: absolute;
          z-index: 4;
          left: 9px;
          bottom: 9px;
          padding: 5px 7px;
          border-radius: 6px;
          font-size: 7px;
          font-weight: 750;
        }

        .low-stock {
          background: #fff5df;
          color: #a5762d;
        }

        .out-stock {
          background: #f8e7e7;
          color: #ad5858;
        }

        .product-card-body {
          padding: 13px;
        }

        .product-card-body h3 {
          margin: 4px 0 5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 12px;
        }

        .product-card-body p {
          height: 28px;
          margin: 0 0 7px;
          overflow: hidden;
          color: var(--pc-muted);
          font-size: 8px;
          line-height: 1.5;
        }

        .product-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 10px;
        }

        .product-price strong {
          display: block;
          color: var(--pc-brown);
          font-size: 13px;
        }

        .product-price del {
          display: block;
          margin-top: 2px;
          color: #aaa092;
          font-size: 8px;
        }

        .product-arrow {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: var(--pc-surface-soft);
          color: var(--pc-gold-dark);
          transition: 0.2s ease;
        }

        .product-card:hover .product-arrow {
          background: var(--pc-gold);
          color: #fff;
        }

        /* =================================================
           CATEGORY PRODUCTS
        ================================================= */

        .mini-product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .mini-product-card {
          min-height: 105px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border: 1px solid var(--pc-border-light);
          border-radius: 15px;
          background: #fff;
          transition: 0.2s ease;
        }

        .mini-product-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--pc-shadow);
        }

        .mini-product-image {
          position: relative;
          width: 82px;
          height: 82px;
          flex: 0 0 82px;
          overflow: hidden;
          border-radius: 11px;
          background: #faf8f3;
        }

        .mini-product-card > div:last-child {
          min-width: 0;
        }

        .mini-product-card span {
          display: block;
          color: var(--pc-gold-dark);
          font-size: 8px;
        }

        .mini-product-card strong {
          display: block;
          margin: 4px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 10px;
        }

        .mini-product-card b {
          color: var(--pc-brown);
          font-size: 10px;
        }

        .empty-category {
          min-height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border: 1px dashed var(--pc-border);
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.55);
          color: var(--pc-muted);
        }

        .empty-category strong {
          color: var(--pc-brown);
          font-size: 12px;
        }

        .empty-category span {
          font-size: 9px;
        }

        /* =================================================
           FEATURE PANELS
        ================================================= */

        .feature-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 13px;
          margin-top: 42px;
        }

        .feature-panel {
          position: relative;
          min-height: 305px;
          overflow: hidden;
          padding: 30px;
          border-radius: 22px;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .feature-panel:hover {
          transform: translateY(-4px);
          box-shadow: var(--pc-shadow-hover);
        }

        .prime-match-panel {
          color: #fff;
          background:
            radial-gradient(
              circle at 85% 30%,
              rgba(255, 255, 255, 0.2),
              transparent 23%
            ),
            linear-gradient(
              130deg,
              #51432f,
              #8c713e
            );
        }

        .budget-panel {
          color: var(--pc-brown);
          background:
            radial-gradient(
              circle at 85% 15%,
              rgba(255, 255, 255, 0.6),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #f7ead1,
              #e9d0a1
            );
          border: 1px solid #e0c796;
        }

        .feature-panel-glow {
          position: absolute;
          width: 260px;
          height: 260px;
          right: -100px;
          bottom: -130px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
        }

        .feature-panel-content {
          position: relative;
          z-index: 3;
          max-width: 470px;
        }

        .feature-kicker {
          color: rgba(255, 255, 255, 0.62);
          font-size: 7px;
          font-weight: 850;
          letter-spacing: 1.5px;
        }

        .budget-panel .feature-kicker {
          color: #977338;
        }

        .feature-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          margin-top: 18px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.12);
          color: #f3d99e;
        }

        .budget-panel .feature-icon {
          background: rgba(255, 255, 255, 0.5);
          color: #936d30;
        }

        .feature-panel h2 {
          margin: 15px 0 8px;
          font-size: 28px;
          line-height: 1.06;
          letter-spacing: -1px;
        }

        .feature-panel p {
          max-width: 400px;
          margin: 0;
          color: rgba(255, 255, 255, 0.68);
          font-size: 10px;
          line-height: 1.7;
        }

        .budget-panel p {
          color: #806a49;
        }

        .feature-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 20px;
          color: #fff;
          font-size: 10px;
          font-weight: 750;
        }

        .budget-panel .feature-cta {
          color: #73562c;
        }

        .match-orbit {
          position: absolute;
          z-index: 1;
          right: 45px;
          top: 50%;
          width: 220px;
          height: 220px;
          transform: translateY(-50%);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 50%;
        }

        .match-orbit::before,
        .match-orbit::after {
          content: "";
          position: absolute;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .match-orbit::before {
          inset: 30px;
        }

        .match-orbit::after {
          inset: 64px;
        }

        .orbit-dot {
          position: absolute;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #e5c37d;
          box-shadow: 0 0 0 5px rgba(229, 195, 125, 0.1);
        }

        .orbit-dot.one {
          top: 19px;
          left: 95px;
        }

        .orbit-dot.two {
          right: 12px;
          top: 102px;
        }

        .orbit-dot.three {
          bottom: 23px;
          left: 57px;
        }

        .orbit-center {
          position: absolute;
          inset: 75px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          color: #f0d291;
          box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.05);
        }

        .budget-panel-top {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .budget-panel-top .feature-icon {
          margin: 0;
        }

        .budget-visual {
          max-width: 330px;
          margin-top: 25px;
        }

        .budget-line {
          height: 7px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(118, 87, 37, 0.13);
        }

        .budget-line span {
          display: block;
          width: 72%;
          height: 100%;
          border-radius: inherit;
          background: #99712f;
        }

        .budget-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 7px;
          color: #94794e;
          font-size: 8px;
        }

        /* =================================================
           TRIPLE
        ================================================= */

        .triple-feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 13px;
          margin-top: 13px;
        }

        .small-feature-card {
          position: relative;
          min-height: 220px;
          padding: 20px;
          overflow: hidden;
          border: 1px solid var(--pc-border-light);
          border-radius: 19px;
          background: #fff;
          transition: 0.22s ease;
        }

        .small-feature-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--pc-shadow-hover);
        }

        .setup-card {
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(202, 168, 98, 0.13),
              transparent 38%
            ),
            #fff;
        }

        .points-card {
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(170, 138, 206, 0.12),
              transparent 40%
            ),
            #fff;
        }

        .mystery-card {
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(217, 180, 93, 0.17),
              transparent 40%
            ),
            #fff;
        }

        .small-feature-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: var(--pc-gold-pale);
          color: var(--pc-gold-dark);
        }

        .small-feature-label {
          display: block;
          margin-top: 17px;
          color: var(--pc-gold-dark);
          font-size: 7px;
          font-weight: 850;
          letter-spacing: 1.3px;
        }

        .small-feature-card h3 {
          margin: 6px 0;
          font-size: 17px;
          letter-spacing: -0.45px;
        }

        .small-feature-card p {
          max-width: 260px;
          margin: 0;
          color: var(--pc-muted);
          font-size: 9px;
          line-height: 1.65;
        }

        .small-feature-arrow {
          position: absolute;
          left: 20px;
          bottom: 19px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--pc-gold-dark);
          font-size: 9px;
          font-weight: 750;
        }

        .points-mini-bar {
          max-width: 240px;
          height: 5px;
          margin-top: 15px;
          overflow: hidden;
          border-radius: 999px;
          background: #eee8f6;
        }

        .points-mini-bar span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: #8a72b0;
        }

        .mystery-button {
          position: absolute;
          left: 20px;
          bottom: 17px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 31px;
          padding: 0 10px;
          border-radius: 9px;
          background: #f5ead5;
          color: #8c682f;
          font-size: 9px;
          font-weight: 750;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .mystery-button:hover {
          background: #e8d4ad;
          transform: translateY(-1px);
        }

        /* =================================================
           RECENT
        ================================================= */

        .recent-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .recent-card {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px;
          border: 1px solid var(--pc-border-light);
          border-radius: 14px;
          background: #fff;
          transition: 0.2s ease;
        }

        .recent-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--pc-shadow);
        }

        .recent-image {
          position: relative;
          width: 66px;
          height: 66px;
          flex: 0 0 66px;
          overflow: hidden;
          border-radius: 10px;
          background: #faf8f3;
        }

        .recent-info {
          min-width: 0;
          flex: 1;
        }

        .recent-info span {
          display: block;
          color: var(--pc-gold-dark);
          font-size: 7px;
        }

        .recent-info strong {
          display: block;
          margin: 4px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 10px;
        }

        .recent-info b {
          color: var(--pc-brown);
          font-size: 10px;
        }

        .recent-card > svg {
          color: #c0b5a5;
        }

        /* =================================================
           BOTTOM
        ================================================= */

        .bottom-grid {
          display: grid;
          grid-template-columns: 1.35fr 0.65fr;
          gap: 13px;
          margin-top: 42px;
        }

        .dashboard-panel {
          min-width: 0;
          padding: 20px;
          border: 1px solid var(--pc-border-light);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 7px 24px rgba(82, 61, 29, 0.035);
        }

        .panel-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 13px;
        }

        .panel-heading h2 {
          margin: 5px 0 0;
          font-size: 17px;
        }

        .panel-heading > svg {
          color: var(--pc-gold);
        }

        .orders-list {
          display: grid;
        }

        .order-row {
          min-height: 61px;
          display: grid;
          grid-template-columns: 35px minmax(120px, 1fr) auto auto 16px;
          align-items: center;
          gap: 10px;
          border-top: 1px solid var(--pc-border-light);
        }

        .order-icon {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: var(--pc-surface-soft);
          color: var(--pc-gold-dark);
        }

        .order-info strong {
          display: block;
          font-size: 10px;
        }

        .order-info span {
          display: block;
          margin-top: 3px;
          color: var(--pc-muted);
          font-size: 8px;
        }

        .order-status {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #6e665c;
          font-size: 8px;
          white-space: nowrap;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #d2a44f;
        }

        .status-dot.delivered,
        .status-dot.completed {
          background: #61a873;
        }

        .status-dot.cancelled,
        .status-dot.canceled {
          background: #c96767;
        }

        .order-price {
          color: var(--pc-brown);
          font-size: 10px;
          white-space: nowrap;
        }

        .order-row > svg {
          color: #c0b5a5;
        }

        .empty-panel {
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          color: var(--pc-muted);
          text-align: center;
        }

        .empty-panel-icon {
          width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          margin-bottom: 3px;
          border-radius: 13px;
          background: var(--pc-gold-pale);
          color: var(--pc-gold-dark);
        }

        .empty-panel strong {
          color: var(--pc-brown);
          font-size: 12px;
        }

        .empty-panel span {
          font-size: 9px;
        }

        .empty-panel a {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 7px;
          color: var(--pc-gold-dark);
          font-size: 9px;
          font-weight: 750;
        }

        .insight-list {
          display: grid;
          gap: 8px;
        }

        .insight-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: 11px;
          background: #fcfaf6;
        }

        .insight-icon {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: var(--pc-gold-pale);
          color: var(--pc-gold-dark);
        }

        .insight-row div:last-child {
          flex: 1;
        }

        .insight-row span {
          display: block;
          color: var(--pc-muted);
          font-size: 8px;
        }

        .insight-row strong {
          display: block;
          margin-top: 2px;
          font-size: 12px;
        }

        .insight-cta {
          min-height: 38px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 12px;
          padding: 0 11px;
          border-radius: 10px;
          background: var(--pc-gold-pale);
          color: var(--pc-gold-dark);
          font-size: 9px;
          font-weight: 750;
        }

        /* =================================================
           BENEFITS
        ================================================= */

        .benefits-strip {
          min-height: 100px;
          display: grid;
          grid-template-columns: repeat(7, auto);
          align-items: center;
          justify-content: space-between;
          gap: 17px;
          margin-top: 42px;
          padding: 18px 22px;
          border: 1px solid var(--pc-border-light);
          border-radius: 18px;
          background: #fff;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .benefit-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          flex: 0 0 34px;
          border-radius: 10px;
          background: var(--pc-gold-pale);
          color: var(--pc-gold-dark);
        }

        .benefit-item strong {
          display: block;
          font-size: 9px;
        }

        .benefit-item span {
          display: block;
          margin-top: 3px;
          color: var(--pc-muted);
          font-size: 7px;
        }

        .benefit-divider {
          width: 1px;
          height: 35px;
          background: var(--pc-border-light);
        }

        /* =================================================
           FOOTER
        ================================================= */

        .dashboard-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 35px;
          padding-top: 22px;
          border-top: 1px solid var(--pc-border-light);
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-logo {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: var(--pc-gold);
          color: white;
          font-size: 12px;
          font-weight: 850;
        }

        .footer-brand strong {
          display: block;
          font-size: 10px;
        }

        .footer-brand span {
          display: block;
          margin-top: 2px;
          color: var(--pc-muted);
          font-size: 7px;
        }

        .footer-links {
          display: flex;
          gap: 16px;
        }

        .footer-links a {
          color: var(--pc-muted);
          font-size: 8px;
        }

        .footer-links a:hover {
          color: var(--pc-gold-dark);
        }

        .footer-copy {
          color: #b0a494;
          font-size: 8px;
        }

        /* =================================================
           MOBILE OVERLAY
        ================================================= */

        .mobile-overlay {
          display: none;
        }

        /* =================================================
           ANIMATIONS
        ================================================= */

        @keyframes heroIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes revealUp {
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

        @keyframes floating {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes rotateSlow {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes rotateSlowReverse {
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }

          50% {
            opacity: 0.5;
            transform: scale(1.3);
          }
        }

        /* =================================================
           RESPONSIVE 1280
        ================================================= */

        @media (max-width: 1400px) {
          .product-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .category-strip {
            grid-template-columns: repeat(6, 1fr);
          }

          .hero-decoration {
            right: 31%;
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

          .welcome-hero {
            min-height: 285px;
            height: 285px;
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

          .welcome-hero {
            min-height: 220px;
            height: 220px;
            border-radius: 21px;
          }

          .hero-banner-image {
            object-position: center center;
          }

          .hero-banner-arrow {
            width: 33px;
            height: 33px;
          }

          .hero-banner-prev {
            left: 10px;
          }

          .hero-banner-next {
            right: 10px;
          }

          .hero-banner-dots {
            bottom: 10px;
            gap: 5px;
            padding: 5px 7px;
          }

          .hero-banner-dot {
            width: 5px;
            height: 5px;
          }

          .hero-banner-dot.active {
            width: 16px;
          }

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

          .welcome-hero {
            min-height: 220px;
            height: 220px;
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
