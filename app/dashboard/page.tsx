"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Bell,
  ChevronRight,
  CircleUserRound,
  Gift,
  Heart,
  Home,
  Layers3,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Target,
  TicketPercent,
  Trophy,
  Truck,
  User,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const categories = [
  {
    name: "Mobile",
    icon: "📱",
    count: "120+ Products",
  },
  {
    name: "Home & Living",
    icon: "🏠",
    count: "180+ Products",
  },
  {
    name: "Appliance",
    icon: "⚡",
    count: "95+ Products",
  },
  {
    name: "Footwear",
    icon: "👟",
    count: "150+ Products",
  },
  {
    name: "Watch",
    icon: "⌚",
    count: "80+ Products",
  },
  {
    name: "Bag",
    icon: "👜",
    count: "110+ Products",
  },
  {
    name: "Toy & Baby",
    icon: "🧸",
    count: "90+ Products",
  },
  {
    name: "Automotive",
    icon: "🚗",
    count: "75+ Products",
  },
  {
    name: "Fashion",
    icon: "👕",
    count: "200+ Products",
  },
  {
    name: "Gaming",
    icon: "🎮",
    count: "100+ Products",
  },
];

const featuredProducts = [
  {
    id: 1,
    name: "Smartphone X Pro",
    category: "Mobile",
    price: "₹49,999",
    oldPrice: "₹59,999",
    rating: "4.8",
    reviews: "324",
    image: "/products/smartphone-x-pro.png",
    badge: "Featured",
  },
  {
    id: 2,
    name: "Smart Watch Pro",
    category: "Watch",
    price: "₹5,999",
    oldPrice: "₹7,499",
    rating: "4.7",
    reviews: "182",
    image: "/products/smart-watch-pro.png",
    badge: "Popular",
  },
  {
    id: 3,
    name: "Wireless Headphones",
    category: "Mobile",
    price: "₹2,999",
    oldPrice: "₹4,499",
    rating: "4.6",
    reviews: "241",
    image: "/products/wireless-headphones.png",
    badge: "Deal",
  },
  {
    id: 4,
    name: "Running Sports Shoes",
    category: "Footwear",
    price: "₹2,499",
    oldPrice: "₹3,999",
    rating: "4.8",
    reviews: "198",
    image: "/products/sports-running-shoes.png",
    badge: "Trending",
  },
];

const recentOrders = [
  {
    id: "#PC-10248",
    product: "Wireless Headphones",
    date: "18 Sep 2026",
    amount: "₹2,999",
    status: "Delivered",
  },
  {
    id: "#PC-10231",
    product: "Smart Watch Pro",
    date: "14 Sep 2026",
    amount: "₹5,999",
    status: "Shipped",
  },
  {
    id: "#PC-10198",
    product: "Running Sports Shoes",
    date: "10 Sep 2026",
    amount: "₹2,499",
    status: "Delivered",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("Kesar");

  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login");
        return;
      }

      const name =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Kesar";

      setUserName(name);
    }

    loadUser();
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      const supabase = createClient();

      await supabase.auth.signOut();

      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  }

  return (
    <main className="dashboard-page">
      {/* =====================================
          MOBILE OVERLAY
      ====================================== */}

      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`dashboard-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-top">
          <Link href="/" className="dashboard-logo">
            <div className="logo-icon">
              <ShoppingBag size={20} />
            </div>

            <span>
              Prime<span>Cart</span>
            </span>
          </Link>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-label">
          MAIN MENU
        </div>

        <nav className="sidebar-nav">
          <Link
            href="/dashboard"
            className="sidebar-link active"
            onClick={() => setSidebarOpen(false)}
          >
            <Home size={19} />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/dashboard/products"
            className="sidebar-link"
            onClick={() => setSidebarOpen(false)}
          >
            <Package size={19} />
            <span>Products</span>
          </Link>

          <Link
            href="/dashboard/categories"
            className="sidebar-link"
            onClick={() => setSidebarOpen(false)}
          >
            <Layers3 size={19} />
            <span>Categories</span>
          </Link>

          <Link
            href="/dashboard/orders"
            className="sidebar-link"
            onClick={() => setSidebarOpen(false)}
          >
            <ShoppingBag size={19} />
            <span>My Orders</span>
          </Link>

          <Link
            href="/dashboard/wishlist"
            className="sidebar-link"
            onClick={() => setSidebarOpen(false)}
          >
            <Heart size={19} />
            <span>Wishlist</span>
          </Link>
        </nav>

        <div className="sidebar-label secondary-label">
          SMART SHOPPING
        </div>

        <nav className="sidebar-nav">
          <Link
            href="/dashboard/prime-match"
            className="sidebar-link"
          >
            <Target size={19} />
            <span>PrimeMatch</span>
            <span className="new-badge">NEW</span>
          </Link>

          <Link
            href="/dashboard/budget-builder"
            className="sidebar-link"
          >
            <WalletCards size={19} />
            <span>Budget Builder</span>
          </Link>

          <Link
            href="/dashboard/setup-builder"
            className="sidebar-link"
          >
            <Layers3 size={19} />
            <span>Build My Setup</span>
          </Link>

          <Link
            href="/dashboard/prime-points"
            className="sidebar-link"
          >
            <Trophy size={19} />
            <span>PrimePoints</span>
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <Link
            href="/dashboard/settings"
            className="sidebar-link"
          >
            <Settings size={19} />
            <span>Settings</span>
          </Link>

          <button
            className="sidebar-link logout-link"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={19} />
            <span>
              {loggingOut ? "Signing out..." : "Sign out"}
            </span>
          </button>
        </div>
      </aside>

      {/* =====================================
          MAIN
      ====================================== */}

      <section className="dashboard-main">
        {/* HEADER */}

        <header className="dashboard-header">
          <div className="header-left">
            <button
              className="menu-button"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={21} />
            </button>

            <div className="page-heading">
              <span>Overview</span>
              <h1>Dashboard</h1>
            </div>
          </div>

          <div className="header-actions">
            {/* SEARCH */}

            <div className="dashboard-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            {/* NOTIFICATION */}

            <button
              className="header-icon-button"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="notification-dot" />
            </button>

            {/* PROFILE */}

            <Link
              href="/dashboard/profile"
              className="profile-button"
            >
              <div className="profile-avatar">
                <CircleUserRound size={21} />
              </div>

              <div className="profile-info">
                <strong>{userName}</strong>
                <span>Customer</span>
              </div>

              <ChevronRight size={16} />
            </Link>
          </div>
        </header>

        <div className="dashboard-content">
          {/* =====================================
              WELCOME
          ====================================== */}

          <section className="welcome-section">
            <div>
              <p className="welcome-small">
                Good to see you again 👋
              </p>

              <h2>
                Welcome back,{" "}
                <span>{userName}</span>
              </h2>

              <p className="welcome-description">
                Discover smarter products, better deals and
                personalized recommendations.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="browse-button"
            >
              Browse products
              <ArrowRight size={18} />
            </Link>
          </section>

          {/* =====================================
              STATS
          ====================================== */}

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon gold">
                <ShoppingBag size={21} />
              </div>

              <div>
                <span>Total Orders</span>
                <strong>12</strong>
                <small>
                  <b>+3</b> this month
                </small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <Heart size={21} />
              </div>

              <div>
                <span>Wishlist</span>
                <strong>8</strong>
                <small>
                  <b>2</b> new items
                </small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <Trophy size={21} />
              </div>

              <div>
                <span>PrimePoints</span>
                <strong>2,480</strong>
                <small>
                  <b>+320</b> earned
                </small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <TicketPercent size={21} />
              </div>

              <div>
                <span>Saved</span>
                <strong>₹3,840</strong>
                <small>
                  through PrimeCart
                </small>
              </div>
            </div>
          </section>

          {/* =====================================
              SMART SHOPPING
          ====================================== */}

          <section className="section">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">
                  SHOP SMARTER
                </span>

                <h3>
                  What are you shopping for?
                </h3>
              </div>

              <Sparkles
                size={23}
                className="section-sparkle"
              />
            </div>

            <div className="smart-grid">
              {/* PRIMEMATCH */}

              <Link
                href="/dashboard/prime-match"
                className="smart-card prime-match"
              >
                <div className="smart-card-icon">
                  <Target size={24} />
                </div>

                <span className="smart-label">
                  SMART MATCH
                </span>

                <h4>PrimeMatch</h4>

                <p>
                  Tell us what you need and we&apos;ll help
                  you find the right products.
                </p>

                <div className="smart-link">
                  Find my match
                  <ArrowRight size={16} />
                </div>
              </Link>

              {/* BUDGET */}

              <Link
                href="/dashboard/budget-builder"
                className="smart-card budget-builder"
              >
                <div className="smart-card-icon">
                  <WalletCards size={24} />
                </div>

                <span className="smart-label">
                  PLAN YOUR BUDGET
                </span>

                <h4>Budget Builder</h4>

                <p>
                  Set your budget and build a smart shopping
                  plan around it.
                </p>

                <div className="smart-link">
                  Build my budget
                  <ArrowRight size={16} />
                </div>
              </Link>

              {/* SETUP */}

              <Link
                href="/dashboard/setup-builder"
                className="smart-card setup-builder"
              >
                <div className="smart-card-icon">
                  <Layers3 size={24} />
                </div>

                <span className="smart-label">
                  COMPLETE THE SET
                </span>

                <h4>Build My Setup</h4>

                <p>
                  Create complete kits for gaming, college,
                  work, travel and more.
                </p>

                <div className="smart-link">
                  Build a setup
                  <ArrowRight size={16} />
                </div>
              </Link>
            </div>
          </section>

          {/* =====================================
              CATEGORIES
          ====================================== */}

          <section className="section">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">
                  EXPLORE
                </span>

                <h3>Shop by category</h3>
              </div>

              <Link
                href="/dashboard/categories"
                className="view-link"
              >
                View all
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="categories-grid">
              {categories.map((category) => (
                <Link
                  href={`/dashboard/categories/${encodeURIComponent(
                    category.name
                  )}`}
                  className="category-card"
                  key={category.name}
                >
                  <div className="category-icon">
                    {category.icon}
                  </div>

                  <div className="category-info">
                    <strong>{category.name}</strong>
                    <span>{category.count}</span>
                  </div>

                  <ChevronRight
                    size={16}
                    className="category-arrow"
                  />
                </Link>
              ))}
            </div>
          </section>

          {/* =====================================
              FEATURED PRODUCTS
          ====================================== */}

          <section className="section">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">
                  CURATED FOR YOU
                </span>

                <h3>Featured products</h3>
              </div>

              <Link
                href="/dashboard/products"
                className="view-link"
              >
                View all products
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="products-grid">
              {featuredProducts.map((product) => (
                <Link
                  href={`/dashboard/products/${product.id}`}
                  className="product-card"
                  key={product.id}
                >
                  <div className="product-image">
                    <span className="product-badge">
                      {product.badge}
                    </span>

                    <button
                      className="wishlist-button"
                      onClick={(e) =>
                        e.preventDefault()
                      }
                      aria-label="Add to wishlist"
                    >
                      <Heart size={17} />
                    </button>

                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  </div>

                  <div className="product-content">
                    <span className="product-category">
                      {product.category}
                    </span>

                    <h4>{product.name}</h4>

                    <div className="rating">
                      <Star
                        size={14}
                        fill="currentColor"
                      />

                      <strong>{product.rating}</strong>

                      <span>
                        ({product.reviews})
                      </span>
                    </div>

                    <div className="product-price">
                      <strong>{product.price}</strong>
                      <del>{product.oldPrice}</del>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* =====================================
              PRIMEPOINTS BANNER
          ====================================== */}

          <section className="points-banner">
            <div className="points-left">
              <div className="points-icon">
                <Trophy size={27} />
              </div>

              <div>
                <span>PRIMECART REWARDS</span>
                <h3>
                  You&apos;re only 520 points away from
                  your next reward.
                </h3>
                <p>
                  Keep shopping and earn more PrimePoints.
                </p>
              </div>
            </div>

            <div className="points-right">
              <div className="points-number">
                2,480
                <span> / 3,000</span>
              </div>

              <div className="progress">
                <div className="progress-value" />
              </div>

              <Link href="/dashboard/prime-points">
                View rewards
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* =====================================
              RECENT ORDERS
          ====================================== */}

          <section className="section orders-section">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">
                  ACTIVITY
                </span>

                <h3>Recent orders</h3>
              </div>

              <Link
                href="/dashboard/orders"
                className="view-link"
              >
                View all orders
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="orders-table">
              <div className="orders-header">
                <span>Order</span>
                <span>Product</span>
                <span>Date</span>
                <span>Amount</span>
                <span>Status</span>
              </div>

              {recentOrders.map((order) => (
                <div
                  className="order-row"
                  key={order.id}
                >
                  <strong>{order.id}</strong>

                  <div className="order-product">
                    <div className="order-product-icon">
                      <Package size={17} />
                    </div>

                    <span>{order.product}</span>
                  </div>

                  <span className="order-date">
                    {order.date}
                  </span>

                  <strong>{order.amount}</strong>

                  <span
                    className={`order-status ${
                      order.status === "Delivered"
                        ? "delivered"
                        : "shipped"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* =====================================
              QUICK ACTIONS
          ====================================== */}

          <section className="quick-actions">
            <Link href="/dashboard/products">
              <Package size={19} />
              <span>Browse Products</span>
              <ArrowRight size={16} />
            </Link>

            <Link href="/dashboard/orders">
              <Truck size={19} />
              <span>Track Orders</span>
              <ArrowRight size={16} />
            </Link>

            <Link href="/dashboard/prime-points">
              <Gift size={19} />
              <span>Redeem Rewards</span>
              <ArrowRight size={16} />
            </Link>

            <Link href="/dashboard/profile">
              <User size={19} />
              <span>My Profile</span>
              <ArrowRight size={16} />
            </Link>
          </section>
        </div>
      </section>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #faf8f3;
        }

        .dashboard-page {
          min-height: 100vh;
          display: flex;
          background: #faf8f3;
          color: #211f1a;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* =====================================
           SIDEBAR
        ====================================== */

        .dashboard-sidebar {
          width: 250px;
          min-width: 250px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 25px 16px;
          background: #ffffff;
          border-right: 1px solid #ebe5d9;
          z-index: 50;
        }

        .sidebar-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;
          margin-bottom: 35px;
        }

        .dashboard-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #191714;
          text-decoration: none;
          font-size: 22px;
          font-weight: 850;
          letter-spacing: -0.7px;
        }

        .dashboard-logo > span > span {
          color: #c69624;
        }

        .logo-icon {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #d4a233;
          color: white;
        }

        .mobile-close {
          display: none;
          border: 0;
          background: transparent;
          color: #777168;
          cursor: pointer;
        }

        .sidebar-label {
          padding: 0 12px;
          margin-bottom: 9px;
          color: #aaa398;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.3px;
        }

        .secondary-label {
          margin-top: 25px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-link {
          min-height: 44px;
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 12px;
          border: 0;
          border-radius: 12px;
          background: transparent;
          color: #777168;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .sidebar-link:hover {
          background: #faf6eb;
          color: #a2771d;
        }

        .sidebar-link.active {
          background: #f7edd4;
          color: #9a721b;
          font-weight: 750;
        }

        .new-badge {
          margin-left: auto;
          padding: 3px 6px;
          border-radius: 5px;
          background: #e9d18f;
          color: #73520d;
          font-size: 8px;
          font-weight: 900;
        }

        .sidebar-bottom {
          margin-top: auto;
          padding-top: 15px;
          border-top: 1px solid #eee9e0;
        }

        .logout-link {
          width: 100%;
          margin-top: 4px;
        }

        /* =====================================
           MAIN
        ====================================== */

        .dashboard-main {
          flex: 1;
          min-width: 0;
        }

        .dashboard-header {
          height: 76px;
          position: sticky;
          top: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 34px;
          background: rgba(250, 248, 243, 0.92);
          border-bottom: 1px solid #ebe5d9;
          backdrop-filter: blur(18px);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .menu-button {
          display: none;
          width: 39px;
          height: 39px;
          border: 1px solid #e7e0d4;
          border-radius: 10px;
          background: #fff;
          color: #514d45;
          cursor: pointer;
        }

        .page-heading span {
          display: block;
          margin-bottom: 2px;
          color: #aaa398;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .page-heading h1 {
          margin: 0;
          color: #25221c;
          font-size: 19px;
          letter-spacing: -0.4px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dashboard-search {
          width: 235px;
          height: 40px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          border: 1px solid #e6dfd3;
          border-radius: 11px;
          background: #fff;
          color: #aaa398;
        }

        .dashboard-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #302c25;
          font-size: 12px;
        }

        .dashboard-search input::placeholder {
          color: #aaa398;
        }

        .header-icon-button {
          width: 40px;
          height: 40px;
          position: relative;
          display: grid;
          place-items: center;
          border: 1px solid #e6dfd3;
          border-radius: 11px;
          background: #fff;
          color: #625d54;
          cursor: pointer;
        }

        .notification-dot {
          width: 6px;
          height: 6px;
          position: absolute;
          top: 9px;
          right: 9px;
          border-radius: 50%;
          background: #c69624;
          border: 1px solid white;
        }

        .profile-button {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #28251f;
          text-decoration: none;
        }

        .profile-avatar {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #f0dfb4;
          color: #906a17;
        }

        .profile-info strong,
        .profile-info span {
          display: block;
        }

        .profile-info strong {
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 12px;
        }

        .profile-info span {
          margin-top: 2px;
          color: #aaa398;
          font-size: 10px;
        }

        /* =====================================
           CONTENT
        ====================================== */

        .dashboard-content {
          width: min(1420px, calc(100% - 68px));
          margin: 0 auto;
          padding: 30px 0 50px;
        }

        .welcome-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 0 27px;
        }

        .welcome-small {
          margin: 0 0 7px;
          color: #a2771d;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .welcome-section h2 {
          margin: 0;
          color: #211f1a;
          font-size: clamp(25px, 3vw, 35px);
          letter-spacing: -1.3px;
        }

        .welcome-section h2 span {
          color: #c69624;
        }

        .welcome-description {
          margin: 9px 0 0;
          color: #898278;
          font-size: 13px;
        }

        .browse-button {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 17px;
          border-radius: 11px;
          background: #c69624;
          color: white;
          text-decoration: none;
          font-size: 12px;
          font-weight: 750;
          box-shadow:
            0 8px 20px rgba(198, 150, 36, 0.16);
        }

        /* =====================================
           STATS
        ====================================== */

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .stat-card {
          min-height: 105px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
          background: #fff;
          border: 1px solid #ebe5d9;
          border-radius: 17px;
        }

        .stat-icon {
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 13px;
        }

        .stat-icon.gold {
          background: #f7edd4;
          color: #a1771d;
        }

        .stat-icon.purple {
          background: #eee7fa;
          color: #7955a7;
        }

        .stat-icon.green {
          background: #e8f4e8;
          color: #528456;
        }

        .stat-icon.orange {
          background: #fff0df;
          color: #bc7731;
        }

        .stat-card span {
          display: block;
          color: #918a80;
          font-size: 10px;
          font-weight: 650;
        }

        .stat-card strong {
          display: block;
          margin: 4px 0 3px;
          color: #25221d;
          font-size: 21px;
        }

        .stat-card small {
          color: #aaa398;
          font-size: 9px;
        }

        .stat-card small b {
          color: #57925c;
        }

        /* =====================================
           SECTION
        ====================================== */

        .section {
          margin-top: 37px;
        }

        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 17px;
        }

        .section-eyebrow {
          display: block;
          margin-bottom: 5px;
          color: #b08a2d;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 1.4px;
        }

        .section-header h3 {
          margin: 0;
          color: #28251f;
          font-size: 20px;
          letter-spacing: -0.5px;
        }

        .section-sparkle {
          color: #c69624;
        }

        .view-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #a2771d;
          text-decoration: none;
          font-size: 11px;
          font-weight: 750;
        }

        .view-link:hover {
          color: #79570d;
        }

        /* =====================================
           SMART CARDS
        ====================================== */

        .smart-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .smart-card {
          min-height: 205px;
          position: relative;
          overflow: hidden;
          padding: 22px;
          border-radius: 19px;
          color: #29251d;
          text-decoration: none;
          border: 1px solid #e9e0cd;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .smart-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 15px 35px rgba(54, 43, 20, 0.08);
        }

        .prime-match {
          background: linear-gradient(
            135deg,
            #fff8e8,
            #f8edcf
          );
        }

        .budget-builder {
          background: linear-gradient(
            135deg,
            #f6f1fb,
            #ebe2f6
          );
        }

        .setup-builder {
          background: linear-gradient(
            135deg,
            #eef7f2,
            #dfeee4
          );
        }

        .smart-card-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          margin-bottom: 13px;
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.72);
          color: #a2771d;
        }

        .budget-builder .smart-card-icon {
          color: #7755a2;
        }

        .setup-builder .smart-card-icon {
          color: #4e8058;
        }

        .smart-label {
          display: block;
          color: #a38d61;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 1.1px;
        }

        .smart-card h4 {
          margin: 5px 0 6px;
          font-size: 18px;
          letter-spacing: -0.4px;
        }

        .smart-card p {
          max-width: 280px;
          margin: 0;
          color: #777064;
          font-size: 11px;
          line-height: 1.6;
        }

        .smart-link {
          position: absolute;
          left: 22px;
          bottom: 19px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #9a721b;
          font-size: 11px;
          font-weight: 800;
        }

        .budget-builder .smart-link {
          color: #7957a1;
        }

        .setup-builder .smart-link {
          color: #4f7d58;
        }

        /* =====================================
           CATEGORIES
        ====================================== */

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 11px;
        }

        .category-card {
          min-height: 82px;
          display: flex;
          align-items: center;
          gap: 11px;
          position: relative;
          padding: 12px;
          background: white;
          border: 1px solid #ebe5d9;
          border-radius: 14px;
          color: #29261f;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .category-card:hover {
          border-color: #dbc484;
          transform: translateY(-2px);
          box-shadow:
            0 8px 22px rgba(57, 47, 25, 0.06);
        }

        .category-icon {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #faf5e9;
          font-size: 20px;
        }

        .category-info {
          min-width: 0;
        }

        .category-info strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 11px;
        }

        .category-info span {
          display: block;
          margin-top: 4px;
          color: #aaa398;
          font-size: 9px;
        }

        .category-arrow {
          margin-left: auto;
          flex-shrink: 0;
          color: #c2baad;
        }

        /* =====================================
           PRODUCTS
        ====================================== */

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .product-card {
          overflow: hidden;
          background: #fff;
          border: 1px solid #ebe5d9;
          border-radius: 17px;
          color: #29261f;
          text-decoration: none;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 15px 35px rgba(57, 47, 25, 0.08);
        }

        .product-image {
          height: 190px;
          position: relative;
          display: grid;
          place-items: center;
          padding: 25px;
          background: #f8f6f1;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.25s ease;
        }

        .product-card:hover .product-image img {
          transform: scale(1.05);
        }

        .product-badge {
          position: absolute;
          top: 11px;
          left: 11px;
          z-index: 2;
          padding: 5px 8px;
          border-radius: 6px;
          background: #c69624;
          color: white;
          font-size: 8px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .wishlist-button {
          width: 31px;
          height: 31px;
          position: absolute;
          z-index: 3;
          top: 10px;
          right: 10px;
          display: grid;
          place-items: center;
          border: 1px solid #e6dfd3;
          border-radius: 50%;
          background: white;
          color: #888176;
          cursor: pointer;
        }

        .wishlist-button:hover {
          color: #b64c55;
        }

        .product-content {
          padding: 14px;
        }

        .product-category {
          color: #b08a2d;
          font-size: 9px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .product-content h4 {
          min-height: 37px;
          margin: 5px 0 7px;
          color: #29261f;
          font-size: 13px;
          line-height: 1.4;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #d29d26;
          font-size: 10px;
        }

        .rating span {
          color: #aaa398;
        }

        .product-price {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 9px;
        }

        .product-price strong {
          color: #25221c;
          font-size: 15px;
        }

        .product-price del {
          color: #aaa398;
          font-size: 10px;
        }

        /* =====================================
           POINTS
        ====================================== */

        .points-banner {
          min-height: 150px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          margin-top: 37px;
          padding: 25px 28px;
          border-radius: 19px;
          background:
            radial-gradient(
              circle at 80% 20%,
              rgba(255, 255, 255, 0.3),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #d7ad4c,
              #b98a20
            );
          color: white;
          box-shadow:
            0 15px 35px rgba(154, 111, 22, 0.15);
        }

        .points-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .points-icon {
          width: 55px;
          height: 55px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.18);
        }

        .points-left span {
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 1.2px;
          opacity: 0.82;
        }

        .points-left h3 {
          max-width: 520px;
          margin: 6px 0 4px;
          font-size: 17px;
        }

        .points-left p {
          margin: 0;
          font-size: 10px;
          opacity: 0.8;
        }

        .points-right {
          width: 245px;
          flex-shrink: 0;
        }

        .points-number {
          margin-bottom: 8px;
          font-size: 15px;
          font-weight: 850;
        }

        .points-number span {
          opacity: 0.6;
          font-size: 11px;
        }

        .progress {
          height: 6px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.25);
        }

        .progress-value {
          width: 82.6%;
          height: 100%;
          border-radius: inherit;
          background: white;
        }

        .points-right a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 11px;
          color: white;
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
        }

        /* =====================================
           ORDERS
        ====================================== */

        .orders-table {
          overflow: hidden;
          background: white;
          border: 1px solid #ebe5d9;
          border-radius: 16px;
        }

        .orders-header,
        .order-row {
          display: grid;
          grid-template-columns:
            1fr
            1.8fr
            1.2fr
            0.8fr
            0.9fr;
          align-items: center;
          column-gap: 15px;
          padding: 15px 18px;
        }

        .orders-header {
          background: #faf8f3;
          color: #aaa398;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .order-row {
          min-height: 66px;
          border-top: 1px solid #f0ebe2;
          color: #575249;
          font-size: 11px;
        }

        .order-row > strong {
          color: #37332b;
        }

        .order-product {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
        }

        .order-product span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .order-product-icon {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 9px;
          background: #f7edd4;
          color: #9d751e;
        }

        .order-date {
          color: #918a80;
        }

        .order-status {
          width: fit-content;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 8px;
          font-weight: 800;
        }

        .order-status.delivered {
          background: #e8f4e8;
          color: #4f8455;
        }

        .order-status.shipped {
          background: #edf1fa;
          color: #5c6f9e;
        }

        /* =====================================
           QUICK ACTIONS
        ====================================== */

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 11px;
          margin-top: 28px;
        }

        .quick-actions a {
          min-height: 55px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 15px;
          background: white;
          border: 1px solid #ebe5d9;
          border-radius: 12px;
          color: #625c52;
          text-decoration: none;
          font-size: 10px;
          font-weight: 700;
          transition: 0.2s ease;
        }

        .quick-actions a svg:first-child {
          color: #b18a2c;
        }

        .quick-actions a svg:last-child {
          margin-left: auto;
          color: #bcb4a8;
        }

        .quick-actions a:hover {
          border-color: #dbc484;
          color: #9a721b;
        }

        /* =====================================
           OVERLAY
        ====================================== */

        .sidebar-overlay {
          display: none;
        }

        /* =====================================
           RESPONSIVE
        ====================================== */

        @media (max-width: 1200px) {
          .dashboard-sidebar {
            width: 225px;
            min-width: 225px;
          }

          .dashboard-content {
            width: min(100% - 44px, 1200px);
          }

          .categories-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 950px) {
          .dashboard-sidebar {
            position: fixed;
            left: -270px;
            top: 0;
            bottom: 0;
            width: 250px;
            min-width: 250px;
            transition: left 0.25s ease;
            box-shadow:
              15px 0 40px rgba(31, 25, 14, 0.08);
          }

          .dashboard-sidebar.sidebar-open {
            left: 0;
          }

          .mobile-close {
            display: block;
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 40;
            border: 0;
            background: rgba(31, 25, 14, 0.25);
            backdrop-filter: blur(2px);
          }

          .menu-button {
            display: grid;
            place-items: center;
          }

          .dashboard-header {
            padding: 0 22px;
          }

          .dashboard-search {
            width: 190px;
          }

          .smart-grid {
            grid-template-columns: 1fr;
          }

          .smart-card {
            min-height: 180px;
          }

          .categories-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .quick-actions {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .dashboard-header {
            height: auto;
            min-height: 70px;
            padding: 12px 16px;
          }

          .header-actions {
            gap: 7px;
          }

          .dashboard-search {
            display: none;
          }

          .profile-info,
          .profile-button > svg {
            display: none;
          }

          .dashboard-content {
            width: calc(100% - 28px);
            padding-top: 23px;
          }

          .welcome-section {
            align-items: flex-start;
            flex-direction: column;
            gap: 17px;
          }

          .browse-button {
            width: 100%;
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .stat-card {
            min-height: 92px;
            padding: 13px;
            gap: 10px;
          }

          .stat-icon {
            width: 38px;
            height: 38px;
          }

          .stat-card strong {
            font-size: 18px;
          }

          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .product-image {
            height: 150px;
            padding: 18px;
          }

          .product-content {
            padding: 11px;
          }

          .points-banner {
            flex-direction: column;
            align-items: flex-start;
            padding: 20px;
          }

          .points-right {
            width: 100%;
          }

          .orders-table {
            overflow-x: auto;
          }

          .orders-header,
          .order-row {
            min-width: 700px;
          }
        }

        @media (max-width: 430px) {
          .page-heading {
            display: none;
          }

          .profile-avatar {
            width: 36px;
            height: 36px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .categories-grid {
            grid-template-columns: 1fr 1fr;
          }

          .category-card {
            min-height: 75px;
          }

          .category-icon {
            width: 36px;
            height: 36px;
            font-size: 17px;
          }

          .products-grid {
            grid-template-columns: 1fr 1fr;
          }

          .product-image {
            height: 135px;
          }

          .product-content h4 {
            font-size: 12px;
          }

          .product-price strong {
            font-size: 13px;
          }

          .quick-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
