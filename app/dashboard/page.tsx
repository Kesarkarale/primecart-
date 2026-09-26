"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
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
  beauty: "💄",
  books: "📚",
  electronics: "🎧",
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
    description: "Track your shopping rewards.",
    badge: "REWARDS",
    icon: Crown,
  },
];

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

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100
  );
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
      <div className={`image-fallback ${className}`}>
        <ShoppingBag size={30} />
      </div>
    );
  }

  return (
    <div className={`product-image ${className}`}>
      <Image
        src={candidates[index]}
        alt={product.name}
        fill
        sizes="(max-width: 640px) 80vw, (max-width: 1100px) 40vw, 250px"
        className="product-image-inner"
        onError={() => setIndex((current) => current + 1)}
      />
    </div>
  );
}

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

  const [activeCategory, setActiveCategory] =
    useState("all");

  const [dealMessage, setDealMessage] = useState(
    "Your mystery deal is waiting."
  );

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
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("categories")
            .select("id,name,slug")
            .order("name", {
              ascending: true,
            }),

          supabase
            .from("orders")
            .select(
              "id,status,total_amount,created_at"
            )
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("wishlist")
            .select("id")
            .eq("user_id", user.id),
        ]);

        if (!mounted) return;

        const metadataName =
          typeof user.user_metadata?.full_name ===
          "string"
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
            typeof user.user_metadata?.avatar_url ===
            "string"
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

        if (
          !productsResult.error &&
          productsResult.data
        ) {
          setProducts(
            productsResult.data as Product[]
          );
        }

        if (
          !categoriesResult.error &&
          categoriesResult.data
        ) {
          setCategories(
            categoriesResult.data as Category[]
          );
        }

        if (
          !ordersResult.error &&
          ordersResult.data
        ) {
          setOrders(ordersResult.data as Order[]);
        }

        if (
          !wishlistResult.error &&
          wishlistResult.data
        ) {
          setWishlistCount(
            wishlistResult.data.length
          );
        }
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );
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

  const featuredProducts = useMemo(() => {
    const featured = products.filter(
      (product) => product.is_featured
    );

    return (
      featured.length ? featured : products
    ).slice(0, 8);
  }, [products]);

  const flashProducts = useMemo(() => {
    const flash = products.filter(
      (product) => product.is_flash_sale
    );

    return (
      flash.length ? flash : products
    ).slice(0, 6);
  }, [products]);

  const latestProducts = useMemo(
    () => products.slice(0, 8),
    [products]
  );

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") {
      return products.slice(0, 8);
    }

    return products
      .filter(
        (product) =>
          product.category_id === activeCategory
      )
      .slice(0, 8);
  }, [products, activeCategory]);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [];

    return products
      .filter((product) => {
        const name =
          product.name?.toLowerCase() || "";

        const brand =
          product.brand?.toLowerCase() || "";

        const description =
          product.short_description?.toLowerCase() ||
          "";

        return (
          name.includes(query) ||
          brand.includes(query) ||
          description.includes(query)
        );
      })
      .slice(0, 7);
  }, [products, search]);

  const totalSpent = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          sum + Number(order.total_amount || 0),
        0
      ),
    [orders]
  );

  const primePoints = Math.floor(totalSpent / 10);

  const userName =
    profile?.full_name ||
    profile?.email?.split("@")[0] ||
    "PrimeCart User";

  const firstName = userName.split(" ")[0];

  const pointsProgress = Math.min(
    100,
    ((primePoints % 1000) / 1000) * 100
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.replace("/auth/login");
  }

  function openProduct(product: Product) {
    try {
      const current = JSON.parse(
        localStorage.getItem(
          "primecart_recently_viewed"
        ) || "[]"
      );

      const updated = [
        {
          id: product.id,
          viewedAt: Date.now(),
        },
        ...current.filter(
          (item: { id: string }) =>
            item.id !== product.id
        ),
      ].slice(0, 10);

      localStorage.setItem(
        "primecart_recently_viewed",
        JSON.stringify(updated)
      );
    } catch {
      // ignore localStorage errors
    }
  }

  function revealMysteryDeal() {
    const deals = [
      "You unlocked a surprise PrimeCart deal!",
      "A special discount is waiting for you.",
      "Your personalized deal has been revealed!",
      "PrimeCart found something special for you.",
    ];

    setDealMessage(
      deals[Math.floor(Math.random() * deals.length)]
    );
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-logo">
          <div className="loader-mark">P</div>
          <div>
            <strong>PrimeCart</strong>
            <span>Smart shopping</span>
          </div>
        </div>

        <div className="spinner" />

        <p>Preparing your shopping experience...</p>

        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 18px;
            background: #fffdf8;
            color: #3e3428;
          }

          .loader-logo {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .loader-mark {
            width: 48px;
            height: 48px;
            border-radius: 15px;
            display: grid;
            place-items: center;
            color: white;
            font-size: 21px;
            font-weight: 900;
            background: linear-gradient(
              135deg,
              #d8b76d,
              #a87929
            );
          }

          .loader-logo strong {
            display: block;
            font-size: 20px;
          }

          .loader-logo span {
            font-size: 11px;
            color: #9a8d7b;
          }

          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #eadfcf;
            border-top-color: #b8872d;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          .loading-screen p {
            color: #9a8d7b;
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

  return (
    <div className="primecart-dashboard">
      {mobileMenu && (
        <button
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
          aria-label="Close menu"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`sidebar ${
          mobileMenu ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <Link
            href="/dashboard"
            className="brand"
            onClick={() => setMobileMenu(false)}
          >
            <div className="brand-mark">
              P
            </div>

            <div>
              <strong>PrimeCart</strong>
              <span>Smart shopping</span>
            </div>
          </Link>

          <button
            className="close-sidebar"
            onClick={() => setMobileMenu(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-scroll">
          <span className="sidebar-title">
            SHOP
          </span>

          <nav className="sidebar-nav">
            {sidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${
                    item.href === "/dashboard"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setMobileMenu(false)
                  }
                >
                  <span className="sidebar-link-icon">
                    <Icon size={18} />
                  </span>

                  <span>{item.label}</span>

                  {item.label === "Wishlist" &&
                    wishlistCount > 0 && (
                      <b>
                        {wishlistCount}
                      </b>
                    )}
                </Link>
              );
            })}
          </nav>

          <span className="sidebar-title smart-title">
            PRIME TOOLS
          </span>

          <div className="smart-sidebar">
            {smartTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="smart-sidebar-link"
                  onClick={() =>
                    setMobileMenu(false)
                  }
                >
                  <span className="smart-icon">
                    <Icon size={16} />
                  </span>

                  <span>
                    <strong>{tool.label}</strong>
                    <small>{tool.badge}</small>
                  </span>

                  <ChevronRight size={14} />
                </Link>
              );
            })}
          </div>

          <div className="safe-box">
            <ShieldCheck size={20} />

            <strong>Safe shopping</strong>

            <p>
              Secure checkout, protected payments
              and easy returns.
            </p>
          </div>
        </div>

        <div className="sidebar-bottom">
          <Link
            href="/dashboard/settings"
            className="bottom-link"
          >
            <Settings size={18} />
            Settings
          </Link>

          <button
            className="bottom-link"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <main className="main">
        {/* HEADER */}

        <header className="top-header">
          <div className="header-left">
            <button
              className="mobile-menu"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={21} />
            </button>

            <Link
              href="/dashboard"
              className="mobile-brand"
            >
              <span>P</span>
              PrimeCart
            </Link>

            <div className="search-box">
              <Search size={18} />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onFocus={() =>
                  setSearchFocused(true)
                }
                placeholder="Search for products, brands and more"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                >
                  <X size={15} />
                </button>
              )}

              {searchFocused &&
                search.trim() && (
                  <div className="search-dropdown">
                    <div className="search-dropdown-head">
                      <strong>
                        Search results
                      </strong>

                      <span>
                        {searchResults.length} found
                      </span>
                    </div>

                    {searchResults.length ? (
                      searchResults.map(
                        (product) => (
                          <Link
                            key={product.id}
                            href={`/dashboard/products/${product.id}`}
                            className="search-item"
                            onClick={() => {
                              openProduct(
                                product
                              );
                              setSearchFocused(
                                false
                              );
                            }}
                          >
                            <div className="search-image">
                              <ProductImage
                                product={product}
                              />
                            </div>

                            <div>
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

                            <ChevronRight
                              size={16}
                            />
                          </Link>
                        )
                      )
                    ) : (
                      <div className="no-results">
                        <Search size={25} />
                        <strong>
                          No products found
                        </strong>
                        <span>
                          Try another product or
                          brand.
                        </span>
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <Link
                        href="/dashboard/products"
                        className="search-all"
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

          <div className="header-actions">
            <button
              className="header-button"
              onClick={() =>
                setNotificationOpen(
                  !notificationOpen
                )
              }
            >
              <Bell size={19} />
              <i />
            </button>

            <Link
              href="/dashboard/wishlist"
              className="header-button desktop-only"
            >
              <Heart size={19} />

              {wishlistCount > 0 && (
                <b>
                  {wishlistCount > 9
                    ? "9+"
                    : wishlistCount}
                </b>
              )}
            </Link>

            <Link
              href="/dashboard/orders"
              className="header-button desktop-only"
            >
              <ShoppingBag size={19} />
            </Link>

            <Link
              href="/dashboard/products"
              className="header-button cart-button"
            >
              <ShoppingCart size={19} />
            </Link>

            <div className="profile-wrapper">
              <button
                className="profile-button"
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
                    className="avatar-img"
                  />
                ) : (
                  <span className="avatar">
                    {getInitials(userName)}
                  </span>
                )}

                <span className="profile-name">
                  <strong>{firstName}</strong>
                  <small>
                    Prime member
                  </small>
                </span>

                <ChevronDown size={14} />
              </button>

              {profileOpen && (
                <div className="profile-menu">
                  <div className="profile-menu-head">
                    <div className="avatar large">
                      {getInitials(userName)}
                    </div>

                    <div>
                      <strong>
                        {userName}
                      </strong>
                      <span>
                        {profile?.email}
                      </span>
                    </div>
                  </div>

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

          {notificationOpen && (
            <div className="notification-menu">
              <div className="notification-head">
                <strong>
                  Notifications
                </strong>
                <span>2 new</span>
              </div>

              <div className="notification">
                <div className="notification-icon">
                  <Zap size={15} />
                </div>

                <div>
                  <strong>
                    Flash deals are live
                  </strong>
                  <span>
                    Discover limited-time offers.
                  </span>
                </div>
              </div>

              <div className="notification">
                <div className="notification-icon">
                  <Crown size={15} />
                </div>

                <div>
                  <strong>
                    PrimePoints updated
                  </strong>
                  <span>
                    Your shopping rewards are ready.
                  </span>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* SHOPPING BENEFITS BAR */}

        <div className="benefits-bar">
          <div>
            <Truck size={17} />
            <span>
              Free delivery on eligible orders
            </span>
          </div>

          <div>
            <ShieldCheck size={17} />
            <span>
              Secure payments
            </span>
          </div>

          <div>
            <Package size={17} />
            <span>
              Easy returns
            </span>
          </div>

          <div>
            <Crown size={17} />
            <span>
              Earn PrimePoints
            </span>
          </div>
        </div>

        <div className="content">
          {/* AMAZON / MEESHO STYLE HERO */}

          <section className="hero">
            <div className="hero-copy">
              <span className="hero-badge">
                <Sparkles size={14} />
                SMART SHOPPING EXPERIENCE
              </span>

              <h1>
                Shop smarter.
                <br />
                <span>Live better.</span>
              </h1>

              <p>
                Discover products, exclusive deals
                and personalized recommendations
                designed around your needs.
              </p>

              <div className="hero-buttons">
                <Link
                  href="/dashboard/products"
                  className="primary-button"
                >
                  Shop Now
                  <ArrowRight size={17} />
                </Link>

                <Link
                  href="/dashboard/prime-match"
                  className="secondary-button"
                >
                  <Target size={16} />
                  Find My Match
                </Link>
              </div>

              <div className="hero-trust">
                <span>
                  <CheckMark />
                  Verified products
                </span>

                <span>
                  <CheckMark />
                  Secure checkout
                </span>

                <span>
                  <CheckMark />
                  Easy returns
                </span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-circle circle-one" />
              <div className="hero-circle circle-two" />

              <div className="hero-product-card">
                <div className="hero-product-icon">
                  🛍️
                </div>

                <div>
                  <span>
                    PRIMECART PICKS
                  </span>

                  <strong>
                    Curated just for you
                  </strong>
                </div>

                <ArrowRight size={18} />
              </div>

              <div className="floating-card deal-floating">
                <Flame size={18} />
                <div>
                  <strong>
                    Flash Deals
                  </strong>
                  <span>
                    Up to 60% OFF
                  </span>
                </div>
              </div>

              <div className="floating-card points-floating">
                <Crown size={18} />
                <div>
                  <strong>
                    {primePoints}
                  </strong>
                  <span>
                    PrimePoints
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* CATEGORY STRIP */}

          <section className="section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  EXPLORE
                </span>
                <h2>Shop by category</h2>
              </div>

              <Link
                href="/dashboard/categories"
                className="view-all"
              >
                View all
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="category-scroll">
              <button
                className={`category ${
                  activeCategory === "all"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setActiveCategory("all")
                }
              >
                <span>✨</span>
                <strong>All</strong>
                <small>
                  {products.length} items
                </small>
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category ${
                    activeCategory === category.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveCategory(
                      category.id
                    )
                  }
                >
                  <span>
                    {categoryIcons[
                      category.slug
                    ] || "🛍️"}
                  </span>

                  <strong>
                    {category.name}
                  </strong>

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

          {/* DEAL BANNERS */}

          <section className="deal-banner-grid">
            <Link
              href="/dashboard/products"
              className="deal-banner gold-banner"
            >
              <div>
                <span>
                  LIMITED TIME OFFER
                </span>

                <h2>
                  Big savings.
                  <br />
                  Better shopping.
                </h2>

                <p>
                  Explore today's handpicked
                  offers.
                </p>

                <strong>
                  Shop deals
                  <ArrowRight size={15} />
                </strong>
              </div>

              <div className="deal-art">
                🛍️
              </div>
            </Link>

            <Link
              href="/dashboard/prime-match"
              className="deal-banner cream-banner"
            >
              <div>
                <span>
                  PERSONALIZED SHOPPING
                </span>

                <h2>
                  Let PrimeMatch
                  <br />
                  choose for you.
                </h2>

                <p>
                  Match products to your needs
                  and budget.
                </p>

                <strong>
                  Try PrimeMatch
                  <ArrowRight size={15} />
                </strong>
              </div>

              <div className="deal-art">
                ✨
              </div>
            </Link>
          </section>

          {/* QUICK STATS */}

          <section className="stats">
            <Link
              href="/dashboard/orders"
              className="stat"
            >
              <div className="stat-icon gold">
                <ShoppingBag size={20} />
              </div>

              <div>
                <span>Total Orders</span>
                <strong>
                  {orders.length}
                </strong>
                <small>
                  Shopping history
                </small>
              </div>

              <ChevronRight size={17} />
            </Link>

            <Link
              href="/dashboard/wishlist"
              className="stat"
            >
              <div className="stat-icon rose">
                <Heart size={20} />
              </div>

              <div>
                <span>Wishlist</span>
                <strong>
                  {wishlistCount}
                </strong>
                <small>
                  Saved products
                </small>
              </div>

              <ChevronRight size={17} />
            </Link>

            <div className="stat">
              <div className="stat-icon green">
                <CircleDollarSign size={20} />
              </div>

              <div>
                <span>Total Spent</span>
                <strong>
                  {formatPrice(totalSpent)}
                </strong>
                <small>
                  Across all orders
                </small>
              </div>
            </div>

            <Link
              href="/dashboard/prime-points"
              className="stat"
            >
              <div className="stat-icon purple">
                <Crown size={20} />
              </div>

              <div>
                <span>PrimePoints</span>
                <strong>
                  {primePoints}
                </strong>
                <small>
                  Rewards earned
                </small>
              </div>

              <ChevronRight size={17} />
            </Link>
          </section>

          {/* FLASH DEALS */}

          <section className="section">
            <div className="section-heading">
              <div>
                <span className="eyebrow danger">
                  <Flame size={13} />
                  LIMITED TIME
                </span>

                <h2>Flash Deals</h2>

                <p>
                  Grab selected deals before
                  they disappear.
                </p>
              </div>

              <Link
                href="/dashboard/products"
                className="view-all"
              >
                View deals
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="product-grid flash-grid">
              {flashProducts.map((product) => {
                const discount =
                  discountPercentage(
                    product.price,
                    product.original_price
                  );

                return (
                  <Link
                    key={product.id}
                    href={`/dashboard/products/${product.id}`}
                    className="product-card"
                    onClick={() =>
                      openProduct(product)
                    }
                  >
                    <div className="product-image-wrap">
                      <ProductImage
                        product={product}
                      />

                      {discount > 0 && (
                        <span className="discount">
                          -{discount}%
                        </span>
                      )}

                      <span className="flash-tag">
                        <Flame size={12} />
                        FLASH
                      </span>

                      <button
                        className="heart-button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          window.location.href =
                            "/dashboard/wishlist";
                        }}
                      >
                        <Heart size={16} />
                      </button>
                    </div>

                    <div className="product-body">
                      <span className="brand">
                        {product.brand ||
                          "PrimeCart"}
                      </span>

                      <h3>{product.name}</h3>

                      <div className="rating">
                        <Star
                          size={13}
                          fill="currentColor"
                        />

                        <span>
                          {Number(
                            product.rating || 0
                          ).toFixed(1)}
                        </span>

                        <small>
                          (
                          {product.reviews_count ||
                            0}
                          )
                        </small>
                      </div>

                      <div className="price">
                        <strong>
                          {formatPrice(
                            product.price
                          )}
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

                      <span className="buy-row">
                        View product
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* PRIME PICKS */}

          <section className="section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  CURATED FOR YOU
                </span>

                <h2>PrimeCart Picks</h2>

                <p>
                  Popular products selected from
                  our catalogue.
                </p>
              </div>

              <Link
                href="/dashboard/products"
                className="view-all"
              >
                View all products
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="product-grid">
              {featuredProducts.map((product) => {
                const discount =
                  discountPercentage(
                    product.price,
                    product.original_price
                  );

                return (
                  <Link
                    key={product.id}
                    href={`/dashboard/products/${product.id}`}
                    className="product-card"
                    onClick={() =>
                      openProduct(product)
                    }
                  >
                    <div className="product-image-wrap">
                      <ProductImage
                        product={product}
                      />

                      {discount > 0 && (
                        <span className="discount">
                          {discount}% OFF
                        </span>
                      )}

                      <button
                        className="heart-button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          window.location.href =
                            "/dashboard/wishlist";
                        }}
                      >
                        <Heart size={16} />
                      </button>
                    </div>

                    <div className="product-body">
                      <span className="brand">
                        {product.brand ||
                          "PrimeCart"}
                      </span>

                      <h3>{product.name}</h3>

                      <p>
                        {product.short_description ||
                          product.description ||
                          "Premium product selected for you."}
                      </p>

                      <div className="rating">
                        <Star
                          size={13}
                          fill="currentColor"
                        />

                        <span>
                          {Number(
                            product.rating || 0
                          ).toFixed(1)}
                        </span>

                        <small>
                          (
                          {product.reviews_count ||
                            0}
                          )
                        </small>
                      </div>

                      <div className="price">
                        <strong>
                          {formatPrice(
                            product.price
                          )}
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

                      <span className="buy-row">
                        View product
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* CATEGORY PRODUCTS */}

          {activeCategory !== "all" && (
            <section className="section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    CATEGORY
                  </span>

                  <h2>
                    {categories.find(
                      (category) =>
                        category.id ===
                        activeCategory
                    )?.name ||
                      "Products"}
                  </h2>
                </div>

                <Link
                  href={`/dashboard/categories/${
                    categories.find(
                      (category) =>
                        category.id ===
                        activeCategory
                    )?.slug || ""
                  }`}
                  className="view-all"
                >
                  Open category
                  <ArrowRight size={15} />
                </Link>
              </div>

              {filteredProducts.length ? (
                <div className="mini-grid">
                  {filteredProducts
                    .slice(0, 4)
                    .map((product) => (
                      <Link
                        key={product.id}
                        href={`/dashboard/products/${product.id}`}
                        className="mini-card"
                      >
                        <div>
                          <ProductImage
                            product={product}
                          />
                        </div>

                        <span>
                          {product.brand ||
                            "PrimeCart"}
                        </span>

                        <strong>
                          {product.name}
                        </strong>

                        <b>
                          {formatPrice(
                            product.price
                          )}
                        </b>
                      </Link>
                    ))}
                </div>
              ) : (
                <div className="empty">
                  <Package size={28} />
                  <strong>
                    No products available
                  </strong>
                </div>
              )}
            </section>
          )}

          {/* SMART TOOLS */}

          <section className="section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  SMART SHOPPING
                </span>

                <h2>
                  Shop smarter with PrimeCart
                </h2>

                <p>
                  Tools designed around the way
                  you shop.
                </p>
              </div>

              <Sparkles size={24} />
            </div>

            <div className="tools-grid">
              {smartTools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="tool-card"
                  >
                    <div className="tool-top">
                      <span>
                        {tool.badge}
                      </span>

                      <ArrowRight size={15} />
                    </div>

                    <div className="tool-icon">
                      <Icon size={22} />
                    </div>

                    <h3>{tool.label}</h3>

                    <p>
                      {tool.description}
                    </p>

                    <strong>
                      Explore tool
                      <ChevronRight
                        size={14}
                      />
                    </strong>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* PRIME MATCH + BUDGET */}

          <section className="large-feature-grid">
            <Link
              href="/dashboard/prime-match"
              className="large-feature prime-match"
            >
              <span>
                AI-POWERED SHOPPING
              </span>

              <div className="large-icon">
                <Target size={22} />
              </div>

              <h2>
                Find your
                <br />
                perfect match.
              </h2>

              <p>
                Tell PrimeMatch your needs,
                budget and priorities.
              </p>

              <strong>
                Start PrimeMatch
                <ArrowRight size={16} />
              </strong>

              <div className="orbit">
                <div />
                <div />
                <div />
                <span>
                  <Sparkles size={22} />
                </span>
              </div>
            </Link>

            <Link
              href="/dashboard/budget-builder"
              className="large-feature budget"
            >
              <span>
                PLAN YOUR SPEND
              </span>

              <div className="large-icon">
                <WalletCards size={22} />
              </div>

              <h2>
                Build a smarter
                <br />
                shopping budget.
              </h2>

              <p>
                Set a limit and plan exactly
                where your money should go.
              </p>

              <div className="budget-line">
                <span />
              </div>

              <div className="budget-values">
                <span>₹0</span>
                <strong>₹25K</strong>
              </div>

              <strong>
                Open Budget Builder
                <ArrowRight size={16} />
              </strong>
            </Link>
          </section>

          {/* SMALL FEATURES */}

          <section className="small-feature-grid">
            <Link
              href="/dashboard/setup-builder"
              className="small-feature setup"
            >
              <Sparkles size={20} />

              <span>
                CURATED SETUPS
              </span>

              <h3>
                Build My Setup
              </h3>

              <p>
                Gaming, college, work, fitness
                and more.
              </p>

              <strong>
                Explore
                <ArrowRight size={15} />
              </strong>
            </Link>

            <Link
              href="/dashboard/prime-points"
              className="small-feature points"
            >
              <Crown size={20} />

              <span>REWARDS</span>

              <h3>PrimePoints</h3>

              <p>
                You currently have{" "}
                <b>{primePoints}</b> points.
              </p>

              <div className="points-bar">
                <span
                  style={{
                    width: `${pointsProgress}%`,
                  }}
                />
              </div>

              <strong>
                View rewards
                <ArrowRight size={15} />
              </strong>
            </Link>

            <div className="small-feature mystery">
              <TicketPercent size={20} />

              <span>
                JUST FOR YOU
              </span>

              <h3>
                Mystery Deal
              </h3>

              <p>{dealMessage}</p>

              <button
                onClick={revealMysteryDeal}
              >
                Reveal deal
                <Sparkles size={14} />
              </button>
            </div>
          </section>

          {/* RECENT ORDERS */}

          <section className="bottom-grid">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">
                    ACTIVITY
                  </span>

                  <h2>
                    Recent orders
                  </h2>
                </div>

                <Link
                  href="/dashboard/orders"
                  className="view-all"
                >
                  View all
                  <ArrowRight size={14} />
                </Link>
              </div>

              {orders.length ? (
                <div className="orders">
                  {orders
                    .slice(0, 5)
                    .map((order) => (
                      <Link
                        key={order.id}
                        href="/dashboard/orders"
                        className="order"
                      >
                        <div className="order-icon">
                          <Package size={17} />
                        </div>

                        <div>
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

                        <span className="status">
                          {formatOrderStatus(
                            order.status
                          )}
                        </span>

                        <b>
                          {formatPrice(
                            order.total_amount
                          )}
                        </b>

                        <ChevronRight
                          size={15}
                        />
                      </Link>
                    ))}
                </div>
              ) : (
                <div className="empty-orders">
                  <ShoppingBag size={26} />

                  <strong>
                    No orders yet
                  </strong>

                  <span>
                    Your orders will appear
                    here.
                  </span>

                  <Link href="/dashboard/products">
                    Start shopping
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>

            {/* INSIGHTS */}

            <div className="panel insights">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">
                    YOUR SHOPPING
                  </span>

                  <h2>
                    Quick insights
                  </h2>
                </div>

                <Sparkles size={19} />
              </div>

              <div className="insight-list">
                <div>
                  <ShoppingBag size={17} />
                  <span>
                    Orders placed
                  </span>
                  <strong>
                    {orders.length}
                  </strong>
                </div>

                <div>
                  <Heart size={17} />
                  <span>
                    Saved products
                  </span>
                  <strong>
                    {wishlistCount}
                  </strong>
                </div>

                <div>
                  <Crown size={17} />
                  <span>
                    Reward points
                  </span>
                  <strong>
                    {primePoints}
                  </strong>
                </div>

                <div>
                  <Package size={17} />
                  <span>
                    Products available
                  </span>
                  <strong>
                    {products.length}
                  </strong>
                </div>
              </div>

              <Link
                href="/dashboard/prime-match"
                className="insight-button"
              >
                Personalize shopping
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #fffdf9;
          color: #302920;
        }

        a {
          text-decoration: none;
          color: inherit;
        }

        button,
        input {
          font: inherit;
        }

        button {
          border: 0;
          cursor: pointer;
        }

        .primecart-dashboard {
          min-height: 100vh;
          display: flex;
          background: #fffdf9;
        }

        /* SIDEBAR */

        .sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          width: 250px;
          z-index: 100;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-right: 1px solid #eee6d9;
        }

        .sidebar-brand {
          height: 78px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f0e9df;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .brand-mark {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: white;
          font-size: 20px;
          font-weight: 900;
          background: linear-gradient(
            135deg,
            #d6b367,
            #a67528
          );
          box-shadow: 0 9px 24px
            rgba(174, 130, 48, 0.2);
        }

        .brand strong {
          display: block;
          font-size: 17px;
          letter-spacing: -0.3px;
        }

        .brand span {
          display: block;
          margin-top: 2px;
          color: #a19584;
          font-size: 10px;
        }

        .sidebar-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 25px 14px;
        }

        .sidebar-title {
          display: block;
          padding: 0 10px 10px;
          color: #aaa090;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.3px;
        }

        .sidebar-nav {
          display: grid;
          gap: 5px;
        }

        .sidebar-link {
          min-height: 45px;
          padding: 0 11px;
          display: flex;
          align-items: center;
          gap: 11px;
          border-radius: 12px;
          color: #665b4d;
          font-size: 13px;
          font-weight: 650;
          transition: 0.2s;
        }

        .sidebar-link:hover,
        .sidebar-link.active {
          color: #8d6724;
          background: #fbf3e4;
        }

        .sidebar-link-icon {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #faf7f1;
        }

        .sidebar-link.active
          .sidebar-link-icon {
          color: #a87929;
          background: #f5e7c9;
        }

        .sidebar-link b {
          margin-left: auto;
          min-width: 20px;
          height: 20px;
          display: grid;
          place-items: center;
          border-radius: 20px;
          color: white;
          background: #bc8c35;
          font-size: 10px;
        }

        .smart-title {
          margin-top: 28px;
        }

        .smart-sidebar {
          display: grid;
          gap: 7px;
        }

        .smart-sidebar-link {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 9px;
          border: 1px solid #f1eadf;
          border-radius: 12px;
          background: #fffdfa;
          transition: 0.2s;
        }

        .smart-sidebar-link:hover {
          border-color: #dec18b;
          transform: translateY(-1px);
        }

        .smart-icon {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          flex: 0 0 30px;
          color: #a87a2d;
          border-radius: 9px;
          background: #f9f0df;
        }

        .smart-sidebar-link > span:nth-child(2) {
          min-width: 0;
          flex: 1;
        }

        .smart-sidebar-link strong {
          display: block;
          font-size: 11px;
        }

        .smart-sidebar-link small {
          display: block;
          margin-top: 2px;
          color: #a99b88;
          font-size: 8px;
          letter-spacing: 0.6px;
        }

        .safe-box {
          margin-top: 24px;
          padding: 15px;
          border-radius: 15px;
          color: #6b604f;
          background: #fbf8f1;
        }

        .safe-box svg {
          color: #b1853c;
        }

        .safe-box strong {
          display: block;
          margin-top: 9px;
          font-size: 12px;
        }

        .safe-box p {
          margin: 5px 0 0;
          color: #9c907f;
          font-size: 10px;
          line-height: 1.55;
        }

        .sidebar-bottom {
          padding: 13px 14px;
          border-top: 1px solid #eee7dd;
        }

        .bottom-link {
          width: 100%;
          padding: 11px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #756a5c;
          background: transparent;
          border-radius: 10px;
          font-size: 12px;
        }

        .bottom-link:hover {
          background: #faf7f1;
          color: #9b7129;
        }

        .close-sidebar {
          display: none;
          background: transparent;
          color: #655a4d;
        }

        /* MAIN */

        .main {
          width: calc(100% - 250px);
          margin-left: 250px;
          min-width: 0;
        }

        .top-header {
          position: sticky;
          top: 0;
          z-index: 50;
          min-height: 72px;
          padding: 12px 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: rgba(
            255,
            253,
            249,
            0.95
          );
          border-bottom: 1px solid #eee7dc;
          backdrop-filter: blur(18px);
        }

        .header-left {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .search-box {
          position: relative;
          width: min(650px, 100%);
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 15px;
          height: 45px;
          border: 1px solid #e8dfd1;
          border-radius: 12px;
          background: white;
          color: #9c907f;
          box-shadow: 0 4px 16px
            rgba(89, 69, 39, 0.03);
        }

        .search-box:focus-within {
          border-color: #d4b06b;
          box-shadow: 0 0 0 3px
            rgba(196, 153, 65, 0.1);
        }

        .search-box input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          color: #382f27;
          background: transparent;
          font-size: 12px;
        }

        .search-box input::placeholder {
          color: #aaa092;
        }

        .search-box button {
          display: grid;
          place-items: center;
          color: #887c6c;
          background: transparent;
        }

        .search-dropdown {
          position: absolute;
          top: calc(100% + 9px);
          left: 0;
          right: 0;
          overflow: hidden;
          border: 1px solid #eee5d7;
          border-radius: 15px;
          background: white;
          box-shadow: 0 20px 45px
            rgba(67, 51, 29, 0.13);
        }

        .search-dropdown-head {
          padding: 13px 15px;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #f1ebe2;
        }

        .search-dropdown-head strong {
          font-size: 12px;
        }

        .search-dropdown-head span {
          color: #9d907f;
          font-size: 10px;
        }

        .search-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 13px;
          border-bottom: 1px solid #f4eee6;
        }

        .search-item:hover {
          background: #fcfaf6;
        }

        .search-image {
          position: relative;
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          overflow: hidden;
          border-radius: 8px;
          background: #faf8f3;
        }

        .search-item > div:nth-child(2) {
          min-width: 0;
          flex: 1;
        }

        .search-item strong,
        .search-item span,
        .search-item b {
          display: block;
        }

        .search-item strong {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 11px;
        }

        .search-item span {
          margin-top: 2px;
          color: #9d9180;
          font-size: 9px;
        }

        .search-item b {
          margin-top: 4px;
          color: #9b7129;
          font-size: 11px;
        }

        .search-all {
          padding: 12px 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: #a07428;
          font-size: 11px;
          font-weight: 700;
          background: #fffaf0;
        }

        .no-results {
          padding: 28px;
          display: grid;
          justify-items: center;
          gap: 7px;
          color: #a69a89;
        }

        .no-results strong {
          color: #5d5244;
          font-size: 12px;
        }

        .no-results span {
          font-size: 10px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-button {
          position: relative;
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border: 1px solid #ece3d7;
          border-radius: 11px;
          color: #675c4e;
          background: white;
        }

        .header-button:hover {
          color: #a87929;
          border-color: #dbc18d;
        }

        .header-button i {
          position: absolute;
          top: 8px;
          right: 9px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c18b2d;
        }

        .header-button b {
          position: absolute;
          top: -5px;
          right: -5px;
          min-width: 17px;
          height: 17px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: white;
          background: #b8872d;
          font-size: 8px;
        }

        .profile-wrapper {
          position: relative;
        }

        .profile-button {
          height: 42px;
          padding: 3px 8px 3px 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #ece3d7;
          border-radius: 12px;
          background: white;
          color: #453b30;
        }

        .avatar,
        .avatar-img {
          width: 34px;
          height: 34px;
          border-radius: 10px;
        }

        .avatar {
          display: grid;
          place-items: center;
          color: #7e5b20;
          background: #f2e4c7;
          font-size: 11px;
          font-weight: 800;
        }

        .avatar-img {
          object-fit: cover;
        }

        .profile-name strong,
        .profile-name small {
          display: block;
          text-align: left;
        }

        .profile-name strong {
          font-size: 11px;
        }

        .profile-name small {
          margin-top: 2px;
          color: #9c907f;
          font-size: 8px;
        }

        .profile-menu,
        .notification-menu {
          position: absolute;
          z-index: 200;
          top: calc(100% + 9px);
          right: 0;
          width: 260px;
          padding: 8px;
          border: 1px solid #eee4d7;
          border-radius: 15px;
          background: white;
          box-shadow: 0 20px 45px
            rgba(63, 48, 27, 0.14);
        }

        .profile-menu-head {
          padding: 10px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .avatar.large {
          width: 38px;
          height: 38px;
        }

        .profile-menu-head strong,
        .profile-menu-head span {
          display: block;
        }

        .profile-menu-head strong {
          font-size: 11px;
        }

        .profile-menu-head span {
          margin-top: 3px;
          max-width: 165px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #9c907f;
          font-size: 9px;
        }

        .profile-menu a,
        .profile-menu button {
          width: 100%;
          padding: 10px;
          display: flex;
          align-items: center;
          gap: 9px;
          color: #675c4f;
          border-radius: 9px;
          background: transparent;
          font-size: 11px;
        }

        .profile-menu a:hover,
        .profile-menu button:hover {
          background: #faf6ee;
          color: #9b7028;
        }

        .notification-menu {
          right: 200px;
          padding: 13px;
        }

        .notification-head {
          display: flex;
          justify-content: space-between;
          padding-bottom: 9px;
          border-bottom: 1px solid #eee8df;
        }

        .notification-head strong {
          font-size: 12px;
        }

        .notification-head span {
          color: #ae7d2a;
          font-size: 9px;
        }

        .notification {
          padding: 11px 3px;
          display: flex;
          gap: 9px;
        }

        .notification-icon {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          flex: 0 0 29px;
          color: #a8792a;
          border-radius: 9px;
          background: #f7edd9;
        }

        .notification strong,
        .notification span {
          display: block;
        }

        .notification strong {
          font-size: 10px;
        }

        .notification span {
          margin-top: 3px;
          color: #9c907f;
          font-size: 9px;
        }

        .mobile-menu,
        .mobile-brand {
          display: none;
        }

        /* CONTENT */

        .benefits-bar {
          min-height: 43px;
          padding: 0 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid #eee7dc;
          background: white;
        }

        .benefits-bar div {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #7f7363;
          font-size: 9px;
        }

        .benefits-bar svg {
          color: #b8872d;
        }

        .content {
          max-width: 1600px;
          margin: auto;
          padding: 28px 30px 60px;
        }

        /* HERO */

        .hero {
          position: relative;
          min-height: 380px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          border-radius: 24px;
          background:
            radial-gradient(
              circle at 85% 40%,
              rgba(255,255,255,.8),
              transparent 25%
            ),
            linear-gradient(
              120deg,
              #f3e1bd,
              #fbf3e3 58%,
              #f6ead5
            );
          border: 1px solid #ead8b9;
          box-shadow: 0 18px 45px
            rgba(115, 82, 31, 0.08);
        }

        .hero-copy {
          position: relative;
          z-index: 2;
          padding: 55px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border: 1px solid #dfc18b;
          border-radius: 100px;
          color: #98702a;
          background: rgba(255,255,255,.55);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .hero h1 {
          margin: 20px 0 12px;
          color: #3b3024;
          font-size: clamp(38px, 4vw, 60px);
          line-height: .98;
          letter-spacing: -2.5px;
        }

        .hero h1 span {
          color: #ae7d29;
        }

        .hero-copy p {
          max-width: 510px;
          margin: 0;
          color: #766957;
          font-size: 14px;
          line-height: 1.7;
        }

        .hero-buttons {
          margin-top: 25px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .primary-button,
        .secondary-button {
          min-height: 44px;
          padding: 0 17px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 11px;
          font-size: 11px;
          font-weight: 750;
        }

        .primary-button {
          color: white;
          background: #a97828;
          box-shadow: 0 10px 25px
            rgba(155, 111, 37, 0.2);
        }

        .secondary-button {
          color: #705328;
          border: 1px solid #d9bd89;
          background: rgba(255,255,255,.65);
        }

        .hero-trust {
          margin-top: 22px;
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }

        .hero-trust span {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #8d806e;
          font-size: 9px;
        }

        .hero-visual {
          position: relative;
          min-height: 350px;
        }

        .hero-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid
            rgba(172, 126, 42, 0.2);
        }

        .circle-one {
          width: 390px;
          height: 390px;
          right: 15px;
          top: -10px;
        }

        .circle-two {
          width: 270px;
          height: 270px;
          right: 75px;
          top: 50px;
        }

        .hero-product-card {
          position: absolute;
          z-index: 2;
          right: 60px;
          top: 115px;
          width: 275px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 13px;
          border: 1px solid rgba(211,182,125,.65);
          border-radius: 20px;
          background: rgba(255,255,255,.8);
          box-shadow: 0 25px 55px
            rgba(101, 72, 30, .14);
          backdrop-filter: blur(12px);
        }

        .hero-product-icon {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: #f6e8ca;
          font-size: 25px;
        }

        .hero-product-card div:nth-child(2) {
          flex: 1;
        }

        .hero-product-card span,
        .hero-product-card strong {
          display: block;
        }

        .hero-product-card span {
          color: #a17a35;
          font-size: 8px;
          letter-spacing: .8px;
          font-weight: 800;
        }

        .hero-product-card strong {
          margin-top: 5px;
          color: #4a3b2b;
          font-size: 12px;
        }

        .floating-card {
          position: absolute;
          z-index: 3;
          padding: 11px 13px;
          display: flex;
          align-items: center;
          gap: 9px;
          border-radius: 13px;
          background: white;
          box-shadow: 0 15px 30px
            rgba(87, 64, 30, .13);
        }

        .floating-card svg {
          color: #b17e27;
        }

        .floating-card strong,
        .floating-card span {
          display: block;
        }

        .floating-card strong {
          font-size: 10px;
        }

        .floating-card span {
          margin-top: 2px;
          color: #a09483;
          font-size: 8px;
        }

        .deal-floating {
          left: 20px;
          bottom: 65px;
        }

        .points-floating {
          right: 10px;
          bottom: 40px;
        }

        /* SECTIONS */

        .section {
          margin-top: 43px;
        }

        .section-heading {
          margin-bottom: 17px;
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #a67a2c;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 1.2px;
        }

        .eyebrow.danger {
          color: #c16c45;
        }

        .section-heading h2 {
          margin: 5px 0 0;
          color: #3d3329;
          font-size: 23px;
          letter-spacing: -.7px;
        }

        .section-heading p {
          margin: 5px 0 0;
          color: #9a8d7b;
          font-size: 11px;
        }

        .view-all {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #a27329;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        /* CATEGORIES */

        .category-scroll {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(100px, 1fr)
          );
          gap: 9px;
        }

        .category {
          min-height: 105px;
          padding: 13px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid #eee5d8;
          border-radius: 15px;
          color: #5e5346;
          background: white;
          transition: .2s;
        }

        .category:hover,
        .category.selected {
          border-color: #d5b16c;
          background: #fffaf0;
          transform: translateY(-2px);
        }

        .category span {
          font-size: 25px;
        }

        .category strong {
          margin-top: 7px;
          font-size: 10px;
        }

        .category small {
          margin-top: 3px;
          color: #a39786;
          font-size: 8px;
        }

        /* DEAL BANNERS */

        .deal-banner-grid {
          margin-top: 28px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .deal-banner {
          min-height: 190px;
          position: relative;
          overflow: hidden;
          padding: 27px 30px;
          border-radius: 20px;
          border: 1px solid #eadfce;
        }

        .gold-banner {
          background:
            radial-gradient(
              circle at 90% 50%,
              rgba(255,255,255,.5),
              transparent 25%
            ),
            linear-gradient(
              120deg,
              #ead1a2,
              #f8ead1
            );
        }

        .cream-banner {
          background:
            radial-gradient(
              circle at 90% 50%,
              rgba(217,187,130,.3),
              transparent 30%
            ),
            #f8f4eb;
        }

        .deal-banner span {
          color: #a17329;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 1px;
        }

        .deal-banner h2 {
          margin: 9px 0 5px;
          color: #3e3225;
          font-size: 23px;
          line-height: 1.05;
          letter-spacing: -.7px;
        }

        .deal-banner p {
          margin: 0;
          color: #7f715e;
          font-size: 10px;
        }

        .deal-banner strong {
          margin-top: 14px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #9d7128;
          font-size: 10px;
        }

        .deal-art {
          position: absolute;
          right: 45px;
          top: 50%;
          transform: translateY(-50%);
          width: 105px;
          height: 105px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255,255,255,.5);
          font-size: 48px;
          box-shadow: 0 12px 30px
            rgba(101, 74, 32, .08);
        }

        /* STATS */

        .stats {
          margin-top: 28px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 11px;
        }

        .stat {
          min-width: 0;
          padding: 17px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #eee6da;
          border-radius: 15px;
          background: white;
        }

        .stat:hover {
          border-color: #ddc38f;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          flex: 0 0 40px;
          border-radius: 12px;
        }

        .stat-icon.gold {
          color: #a57729;
          background: #f7ead0;
        }

        .stat-icon.rose {
          color: #a85c66;
          background: #f8e9ea;
        }

        .stat-icon.green {
          color: #578465;
          background: #e9f4ec;
        }

        .stat-icon.purple {
          color: #7966a0;
          background: #eeeafa;
        }

        .stat > div:nth-child(2) {
          min-width: 0;
          flex: 1;
        }

        .stat span,
        .stat strong,
        .stat small {
          display: block;
        }

        .stat span {
          color: #9b907f;
          font-size: 9px;
        }

        .stat strong {
          margin-top: 3px;
          color: #43382d;
          font-size: 18px;
        }

        .stat small {
          margin-top: 3px;
          color: #afa394;
          font-size: 8px;
        }

        /* PRODUCTS */

        .product-grid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 14px;
        }

        .product-card {
          overflow: hidden;
          border: 1px solid #eee6da;
          border-radius: 16px;
          background: white;
          transition: .25s;
        }

        .product-card:hover {
          transform: translateY(-4px);
          border-color: #dec18b;
          box-shadow: 0 15px 35px
            rgba(92, 69, 34, .09);
        }

        .product-image-wrap {
          position: relative;
          height: 230px;
          background: #faf8f3;
        }

        .product-image {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .product-image-inner {
          object-fit: contain;
          padding: 17px;
        }

        .image-fallback {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          color: #c1b6a6;
          background: #faf8f3;
        }

        .discount,
        .flash-tag {
          position: absolute;
          top: 10px;
          padding: 5px 7px;
          border-radius: 6px;
          font-size: 8px;
          font-weight: 800;
        }

        .discount {
          left: 10px;
          color: white;
          background: #b77b27;
        }

        .flash-tag {
          right: 10px;
          display: flex;
          align-items: center;
          gap: 3px;
          color: #a95031;
          background: #fff0e9;
        }

        .heart-button {
          position: absolute;
          right: 10px;
          bottom: 10px;
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border: 1px solid #e8dfd2;
          border-radius: 50%;
          color: #776b5c;
          background: white;
          z-index: 3;
        }

        .heart-button:hover {
          color: #b15c65;
        }

        .product-body {
          padding: 14px;
        }

        .brand {
          display: block;
          color: #a28f76;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .5px;
          text-transform: uppercase;
        }

        .product-body h3 {
          margin: 6px 0 0;
          overflow: hidden;
          color: #3d342b;
          font-size: 12px;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .product-body p {
          margin: 6px 0 0;
          height: 28px;
          overflow: hidden;
          color: #958979;
          font-size: 9px;
          line-height: 1.45;
        }

        .rating {
          margin-top: 9px;
          display: flex;
          align-items: center;
          gap: 4px;
          color: #b98228;
          font-size: 9px;
        }

        .rating small {
          color: #a69a89;
        }

        .price {
          margin-top: 10px;
          display: flex;
          align-items: baseline;
          gap: 7px;
        }

        .price strong {
          color: #342c25;
          font-size: 15px;
        }

        .price del {
          color: #aaa092;
          font-size: 9px;
        }

        .buy-row {
          margin-top: 11px;
          padding-top: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid #f2ece4;
          color: #a37429;
          font-size: 9px;
          font-weight: 750;
        }

        /* TOOLS */

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .tool-card {
          padding: 17px;
          border: 1px solid #eee6da;
          border-radius: 16px;
          background: white;
          transition: .2s;
        }

        .tool-card:hover {
          transform: translateY(-3px);
          border-color: #dec28d;
          box-shadow: 0 13px 30px
            rgba(85, 64, 31, .07);
        }

        .tool-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #a87b2e;
        }

        .tool-top span {
          padding: 4px 6px;
          border-radius: 5px;
          background: #faf1df;
          font-size: 7px;
          font-weight: 850;
        }

        .tool-icon {
          width: 43px;
          height: 43px;
          margin-top: 17px;
          display: grid;
          place-items: center;
          color: #a7792c;
          border-radius: 12px;
          background: #f8efdf;
        }

        .tool-card h3 {
          margin: 12px 0 5px;
          font-size: 14px;
        }

        .tool-card p {
          min-height: 30px;
          margin: 0;
          color: #968a79;
          font-size: 9px;
          line-height: 1.55;
        }

        .tool-card > strong {
          margin-top: 13px;
          display: flex;
          align-items: center;
          gap: 4px;
          color: #a2742a;
          font-size: 9px;
        }

        /* LARGE FEATURES */

        .large-feature-grid {
          margin-top: 42px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .large-feature {
          min-height: 315px;
          position: relative;
          overflow: hidden;
          padding: 31px;
          border-radius: 21px;
        }

        .large-feature > span {
          color: rgba(255,255,255,.65);
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 1px;
        }

        .large-feature.prime-match {
          color: white;
          background:
            radial-gradient(
              circle at 80% 20%,
              rgba(255,255,255,.18),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #6e5738,
              #9e7b45
            );
        }

        .large-feature.budget {
          color: #4a3d2d;
          background:
            radial-gradient(
              circle at 90% 20%,
              rgba(211,173,99,.3),
              transparent 30%
            ),
            #f4ead8;
        }

        .budget > span {
          color: #a77b32;
        }

        .large-icon {
          width: 45px;
          height: 45px;
          margin-top: 20px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: rgba(255,255,255,.14);
        }

        .budget .large-icon {
          color: #a7792c;
          background: #ead7b5;
        }

        .large-feature h2 {
          margin: 14px 0 8px;
          font-size: 29px;
          line-height: 1.03;
          letter-spacing: -1px;
        }

        .large-feature p {
          max-width: 350px;
          color: rgba(255,255,255,.7);
          font-size: 10px;
          line-height: 1.6;
        }

        .budget p {
          color: #877965;
        }

        .large-feature > strong {
          position: absolute;
          left: 31px;
          bottom: 27px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
        }

        .budget-line {
          position: absolute;
          left: 31px;
          right: 31px;
          bottom: 72px;
          height: 6px;
          overflow: hidden;
          border-radius: 20px;
          background: #dfd0b5;
        }

        .budget-line span {
          display: block;
          width: 64%;
          height: 100%;
          border-radius: inherit;
          background: #b48738;
        }

        .budget-values {
          position: absolute;
          left: 31px;
          right: 31px;
          bottom: 83px;
          display: flex;
          justify-content: space-between;
          color: #9a896f;
          font-size: 8px;
        }

        .orbit {
          position: absolute;
          right: 45px;
          top: 65px;
          width: 170px;
          height: 170px;
          border: 1px solid rgba(255,255,255,.25);
          border-radius: 50%;
        }

        .orbit > div {
          position: absolute;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #f1d596;
        }

        .orbit > div:nth-child(1) {
          left: 15px;
          top: 30px;
        }

        .orbit > div:nth-child(2) {
          right: 10px;
          top: 75px;
        }

        .orbit > div:nth-child(3) {
          left: 55px;
          bottom: 5px;
        }

        .orbit span {
          position: absolute;
          inset: 55px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255,255,255,.12);
        }

        /* SMALL FEATURES */

        .small-feature-grid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .small-feature {
          min-height: 190px;
          padding: 21px;
          border-radius: 18px;
          border: 1px solid #eee6da;
          background: white;
        }

        .small-feature > svg {
          color: #b07f2b;
        }

        .small-feature > span {
          display: block;
          margin-top: 13px;
          color: #a17a38;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: .8px;
        }

        .small-feature h3 {
          margin: 7px 0 5px;
          font-size: 17px;
        }

        .small-feature p {
          margin: 0;
          color: #9a8e7c;
          font-size: 9px;
          line-height: 1.55;
        }

        .small-feature > strong {
          margin-top: 18px;
          display: flex;
          align-items: center;
          gap: 5px;
          color: #a3752a;
          font-size: 9px;
        }

        .points-bar {
          height: 5px;
          margin-top: 14px;
          overflow: hidden;
          border-radius: 10px;
          background: #eee7db;
        }

        .points-bar span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: #b88a3b;
        }

        .mystery button {
          margin-top: 16px;
          padding: 8px 11px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 8px;
          color: #9d7129;
          background: #fbf3e4;
          font-size: 9px;
          font-weight: 750;
        }

        /* MINI */

        .mini-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .mini-card {
          padding: 10px;
          border: 1px solid #eee6da;
          border-radius: 14px;
          background: white;
        }

        .mini-card > div {
          height: 150px;
          overflow: hidden;
          border-radius: 10px;
          background: #faf8f3;
        }

        .mini-card > span,
        .mini-card > strong,
        .mini-card > b {
          display: block;
        }

        .mini-card > span {
          margin-top: 9px;
          color: #a09280;
          font-size: 8px;
        }

        .mini-card > strong {
          margin-top: 4px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 11px;
        }

        .mini-card > b {
          margin-top: 7px;
          color: #9d7129;
          font-size: 11px;
        }

        .empty {
          min-height: 160px;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 8px;
          color: #a39887;
          border: 1px dashed #ddd2c1;
          border-radius: 15px;
        }

        .empty strong {
          color: #665b4d;
          font-size: 12px;
        }

        /* BOTTOM */

        .bottom-grid {
          margin-top: 43px;
          display: grid;
          grid-template-columns: 1.5fr .8fr;
          gap: 14px;
        }

        .panel {
          min-width: 0;
          padding: 21px;
          border: 1px solid #eee6da;
          border-radius: 18px;
          background: white;
        }

        .panel-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 14px;
        }

        .panel-heading h2 {
          margin: 4px 0 0;
          font-size: 17px;
        }

        .orders {
          display: grid;
        }

        .order {
          min-height: 60px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-top: 1px solid #f2ede6;
        }

        .order-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          flex: 0 0 34px;
          color: #a8792b;
          border-radius: 9px;
          background: #f8efdf;
        }

        .order > div:nth-child(2) {
          flex: 1;
        }

        .order strong,
        .order span {
          display: block;
        }

        .order strong {
          font-size: 10px;
        }

        .order > div:nth-child(2) span {
          margin-top: 3px;
          color: #a19685;
          font-size: 8px;
        }

        .status {
          padding: 5px 7px;
          border-radius: 6px;
          color: #7a6b56;
          background: #f5f0e8;
          font-size: 8px;
          white-space: nowrap;
        }

        .order > b {
          color: #453a2f;
          font-size: 10px;
          white-space: nowrap;
        }

        .empty-orders {
          min-height: 170px;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 7px;
          color: #a39888;
        }

        .empty-orders strong {
          color: #625749;
          font-size: 12px;
        }

        .empty-orders span {
          font-size: 9px;
        }

        .empty-orders a {
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
          color: #a3752a;
          font-size: 9px;
          font-weight: 750;
        }

        .insight-list {
          display: grid;
          gap: 4px;
        }

        .insight-list > div {
          min-height: 47px;
          padding: 7px;
          display: flex;
          align-items: center;
          gap: 9px;
          border-radius: 10px;
          background: #fcfaf6;
        }

        .insight-list svg {
          color: #ae7e2c;
        }

        .insight-list span {
          flex: 1;
          color: #8e8271;
          font-size: 9px;
        }

        .insight-list strong {
          font-size: 12px;
        }

        .insight-button {
          margin-top: 13px;
          min-height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-radius: 9px;
          color: #966b27;
          background: #fbf3e4;
          font-size: 9px;
          font-weight: 750;
        }

        /* RESPONSIVE */

        @media (max-width: 1200px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .tools-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .mini-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 900px) {
          .sidebar {
            transform: translateX(-100%);
            transition: .25s;
            box-shadow: 10px 0 35px
              rgba(0,0,0,.1);
          }

          .sidebar.sidebar-open {
            transform: translateX(0);
          }

          .close-sidebar {
            display: block;
          }

          .main {
            width: 100%;
            margin-left: 0;
          }

          .mobile-menu {
            width: 40px;
            height: 40px;
            display: grid;
            place-items: center;
            border: 1px solid #e9e0d4;
            border-radius: 10px;
            background: white;
            color: #675c4e;
          }

          .mobile-brand {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #493b2c;
            font-size: 13px;
            font-weight: 800;
          }

          .mobile-brand span {
            width: 27px;
            height: 27px;
            display: grid;
            place-items: center;
            border-radius: 8px;
            color: white;
            background: #b5822b;
          }

          .search-box {
            max-width: none;
          }

          .profile-name,
          .desktop-only {
            display: none;
          }

          .hero {
            grid-template-columns: 1fr;
          }

          .hero-visual {
            display: none;
          }

          .hero-copy {
            padding: 42px;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }

          .benefits-bar {
            overflow-x: auto;
            justify-content: flex-start;
          }

          .benefits-bar div {
            white-space: nowrap;
          }
        }

        @media (max-width: 700px) {
          .top-header {
            padding: 10px 14px;
          }

          .header-left {
            gap: 8px;
          }

          .mobile-brand {
            display: none;
          }

          .header-actions {
            gap: 5px;
          }

          .header-button {
            width: 36px;
            height: 36px;
          }

          .profile-button {
            width: 38px;
            padding: 2px;
          }

          .profile-button > svg {
            display: none;
          }

          .content {
            padding: 18px 14px 45px;
          }

          .benefits-bar {
            padding: 0 14px;
          }

          .hero {
            min-height: 400px;
            border-radius: 18px;
          }

          .hero-copy {
            padding: 31px 24px;
          }

          .hero h1 {
            font-size: 42px;
            letter-spacing: -1.8px;
          }

          .hero-copy p {
            font-size: 12px;
          }

          .hero-trust {
            display: grid;
            gap: 8px;
          }

          .deal-banner-grid,
          .large-feature-grid {
            grid-template-columns: 1fr;
          }

          .deal-banner {
            min-height: 175px;
            padding: 23px;
          }

          .deal-art {
            right: 20px;
            width: 80px;
            height: 80px;
            font-size: 34px;
          }

          .stats {
            grid-template-columns: 1fr 1fr;
          }

          .stat {
            padding: 12px;
          }

          .stat-icon {
            width: 34px;
            height: 34px;
            flex-basis: 34px;
          }

          .stat strong {
            font-size: 15px;
          }

          .product-grid {
            grid-template-columns: 1fr 1fr;
            gap: 9px;
          }

          .product-image-wrap {
            height: 175px;
          }

          .product-body {
            padding: 10px;
          }

          .product-body h3 {
            font-size: 10px;
          }

          .product-body p {
            display: none;
          }

          .price strong {
            font-size: 13px;
          }

          .tools-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .tool-card {
            padding: 13px;
          }

          .small-feature-grid {
            grid-template-columns: 1fr;
          }

          .small-feature {
            min-height: 155px;
          }

          .orbit {
            opacity: .5;
            right: -35px;
          }

          .large-feature {
            min-height: 290px;
          }

          .bottom-grid {
            margin-top: 30px;
          }

          .order {
            gap: 7px;
          }

          .order .status,
          .order > b {
            display: none;
          }

          .notification-menu {
            right: 10px;
            width: calc(100vw - 28px);
          }

          .profile-menu {
            right: -5px;
          }
        }

        @media (max-width: 420px) {
          .search-box {
            height: 39px;
            padding: 0 10px;
          }

          .header-button {
            width: 34px;
            height: 34px;
          }

          .hero h1 {
            font-size: 36px;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .category-scroll {
            display: flex;
            overflow-x: auto;
            padding-bottom: 5px;
          }

          .category {
            min-width: 95px;
            flex: 0 0 95px;
          }

          .product-grid {
            grid-template-columns: 1fr 1fr;
          }

          .product-image-wrap {
            height: 150px;
          }

          .tools-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function CheckMark() {
  return (
    <span
      style={{
        width: 15,
        height: 15,
        display: "inline-grid",
        placeItems: "center",
        borderRadius: "50%",
        color: "#8b672c",
        background: "#e9d6ad",
        fontSize: 9,
        fontWeight: 900,
      }}
    >
      ✓
    </span>
  );
}
