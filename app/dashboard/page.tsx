"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bell,
  ChevronRight,
  Heart,
  LayoutGrid,
  Menu,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  User,
  X,
  Zap,
  Clock3,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  slug?: string | null;
  short_description?: string | null;
  description?: string | null;
  price: number;
  original_price?: number | null;
  stock?: number | null;
  image_url?: string | null;
  brand?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  is_featured?: boolean | null;
  is_flash_sale?: boolean | null;
  is_active?: boolean | null;
  category_id?: string | null;
  categories?: {
    name?: string | null;
  } | {
    name?: string | null;
  }[] | null;
};

type Category = {
  id: string;
  name: string;
  slug?: string | null;
};

const categoryIcons: Record<string, string> = {
  electronics: "⚡",
  mobile: "📱",
  appliances: "🏠",
  fashion: "👕",
  footwear: "👟",
  watch: "⌚",
  bag: "👜",
  "toy-baby": "🧸",
  automotive: "🚗",
  "home-living": "🏡",
  "home & living": "🏡",
  beauty: "✨",
  sports: "⚽",
  books: "📚",
};

const categoryColors = [
  "from-amber-50 to-yellow-100",
  "from-blue-50 to-sky-100",
  "from-rose-50 to-pink-100",
  "from-emerald-50 to-green-100",
  "from-violet-50 to-purple-100",
  "from-orange-50 to-amber-100",
  "from-cyan-50 to-teal-100",
  "from-slate-50 to-gray-100",
];

function getCategoryName(product: Product) {
  if (!product.categories) return "General";

  if (Array.isArray(product.categories)) {
    return product.categories[0]?.name || "General";
  }

  return product.categories.name || "General";
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getDiscount(product: Product) {
  if (
    product.original_price &&
    product.original_price > product.price
  ) {
    return Math.round(
      ((product.original_price - product.price) /
        product.original_price) *
        100
    );
  }

  return 0;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");

  const [userName, setUserName] = useState("Shopper");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const supabase = createClient();

        const [
          { data: productData },
          { data: categoryData },
          { data: userData },
        ] = await Promise.all([
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
                categories (
                  name
                )
              `
            )
            .eq("is_active", true)
            .order("created_at", { ascending: false }),

          supabase
            .from("categories")
            .select("id, name, slug")
            .order("name", { ascending: true }),

          supabase.auth.getUser(),
        ]);

        if (productData) {
          setProducts(productData as Product[]);
        }

        if (categoryData) {
          setCategories(categoryData as Category[]);
        }

        const name =
          userData.user?.user_metadata?.full_name ||
          userData.user?.user_metadata?.name ||
          userData.user?.email?.split("@")[0];

        if (name) {
          setUserName(name);
        }
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const featuredProducts = useMemo(() => {
    let list = products.filter((product) => product.is_featured);

    if (!list.length) {
      list = products.slice(0, 8);
    }

    if (activeCategory !== "All") {
      list = list.filter(
        (product) =>
          getCategoryName(product).toLowerCase() ===
          activeCategory.toLowerCase()
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      list = list.filter((product) =>
        `${product.name} ${product.brand || ""} ${getCategoryName(
          product
        )}`
          .toLowerCase()
          .includes(query)
      );
    }

    return list.slice(0, 8);
  }, [products, activeCategory, search]);

  const flashProducts = useMemo(() => {
    return products
      .filter((product) => product.is_flash_sale)
      .slice(0, 4);
  }, [products]);

  const toggleWishlist = (id: string) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  return (
    <main className="dashboard-page">
      {/* ================= HEADER ================= */}

      <header className="dashboard-header">
        <div className="header-inner">
          <Link href="/dashboard" className="brand">
            <div className="brand-icon">
              <ShoppingBag size={21} />
            </div>

            <span className="brand-text">
              Prime<span>Cart</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}

          <nav className="desktop-nav">
            <Link
              href="/dashboard"
              className="nav-link active"
            >
              Home
            </Link>

            <Link
              href="/dashboard/products"
              className="nav-link"
            >
              Products
            </Link>

            <Link
              href="/dashboard/category"
              className="nav-link"
            >
              Categories
            </Link>
          </nav>

          {/* SEARCH */}

          <div className="header-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* ACTIONS */}

          <div className="header-actions">
            <button
              className="icon-button"
              aria-label="Wishlist"
              onClick={() => {
                window.location.href =
                  "/dashboard/wishlist";
              }}
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="icon-badge">
                  {wishlist.length}
                </span>
              )}
            </button>

            <Link
              href="/dashboard/cart"
              className="icon-button"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
            </Link>

            <button
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="notification-dot" />
            </button>

            <Link
              href="/dashboard/profile"
              className="profile-button"
            >
              <div className="profile-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div className="profile-info">
                <strong>{userName}</strong>
                <span>My account</span>
              </div>
            </Link>

            <button
              className="mobile-menu-button"
              onClick={() =>
                setMobileMenu((value) => !value)
              }
              aria-label="Menu"
            >
              {mobileMenu ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}

        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              className="mobile-menu"
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
            >
              <Link
                href="/dashboard"
                onClick={() => setMobileMenu(false)}
              >
                Home
              </Link>

              <Link
                href="/dashboard/products"
                onClick={() => setMobileMenu(false)}
              >
                Products
              </Link>

              <Link
                href="/dashboard/category"
                onClick={() => setMobileMenu(false)}
              >
                Categories
              </Link>

              <Link
                href="/dashboard/profile"
                onClick={() => setMobileMenu(false)}
              >
                Profile
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="dashboard-container">
        {/* ================= WELCOME ================= */}

        <motion.section
          className="welcome-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div>
            <div className="eyebrow">
              <Sparkles size={14} />
              Welcome to PrimeCart
            </div>

            <h1>
              Hello,{" "}
              <span>{userName.split(" ")[0]}</span> 👋
            </h1>

            <p>
              Discover products you’ll love, explore smart
              deals and enjoy a better way to shop.
            </p>

            <div className="welcome-actions">
              <Link
                href="/dashboard/products"
                className="primary-cta"
              >
                Explore products
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/dashboard/category"
                className="secondary-cta"
              >
                Browse categories
              </Link>
            </div>
          </div>

          <div className="welcome-visual">
            <div className="visual-card card-one">
              <ShoppingBag size={18} />
              <span>Smart shopping</span>
            </div>

            <div className="visual-card card-two">
              <Tag size={18} />
              <span>Better deals</span>
            </div>

            <div className="visual-main">
              <div className="visual-icon">
                <Sparkles size={30} />
              </div>

              <strong>Shop smarter</strong>
              <span>Every day, every category.</span>
            </div>
          </div>
        </motion.section>

        {/* ================= QUICK STATS ================= */}

        <motion.section
          className="stats-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="stat-card"
            variants={itemVariants}
          >
            <div className="stat-icon gold">
              <Package size={20} />
            </div>

            <div>
              <span>Products</span>
              <strong>{products.length}+</strong>
            </div>

            <TrendingUp size={18} className="stat-arrow" />
          </motion.div>

          <motion.div
            className="stat-card"
            variants={itemVariants}
          >
            <div className="stat-icon blue">
              <LayoutGrid size={20} />
            </div>

            <div>
              <span>Categories</span>
              <strong>{categories.length}</strong>
            </div>

            <ChevronRight size={18} className="stat-arrow" />
          </motion.div>

          <motion.div
            className="stat-card"
            variants={itemVariants}
          >
            <div className="stat-icon green">
              <Truck size={20} />
            </div>

            <div>
              <span>Delivery</span>
              <strong>Fast</strong>
            </div>

            <ChevronRight size={18} className="stat-arrow" />
          </motion.div>

          <motion.div
            className="stat-card"
            variants={itemVariants}
          >
            <div className="stat-icon purple">
              <ShieldCheck size={20} />
            </div>

            <div>
              <span>Shopping</span>
              <strong>Secure</strong>
            </div>

            <ChevronRight size={18} className="stat-arrow" />
          </motion.div>
        </motion.section>

        {/* ================= CATEGORIES ================= */}

        <section className="content-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                Explore
              </span>

              <h2>Shop by category</h2>

              <p>
                Find exactly what you’re looking for.
              </p>
            </div>

            <Link
              href="/dashboard/category"
              className="view-link"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          <motion.div
            className="category-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            <motion.button
              className={`category-card ${
                activeCategory === "All" ? "selected" : ""
              }`}
              variants={itemVariants}
              onClick={() => setActiveCategory("All")}
            >
              <div className="category-icon all">
                <LayoutGrid size={25} />
              </div>

              <strong>All Products</strong>
              <span>{products.length} products</span>
            </motion.button>

            {categories.slice(0, 7).map((category, index) => {
              const key =
                category.slug?.toLowerCase() ||
                category.name.toLowerCase();

              return (
                <motion.button
                  key={category.id}
                  className={`category-card ${
                    activeCategory.toLowerCase() ===
                    category.name.toLowerCase()
                      ? "selected"
                      : ""
                  }`}
                  variants={itemVariants}
                  onClick={() =>
                    setActiveCategory(category.name)
                  }
                >
                  <div
                    className={`category-icon bg-${index % categoryColors.length}`}
                  >
                    {categoryIcons[key] || "🛍️"}
                  </div>

                  <strong>{category.name}</strong>

                  <span>
                    Explore collection
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </section>

        {/* ================= FLASH SALE ================= */}

        {flashProducts.length > 0 && (
          <motion.section
            className="flash-section"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flash-header">
              <div>
                <div className="flash-title">
                  <Zap size={20} fill="currentColor" />
                  Flash deals
                </div>

                <h2>Grab it before it’s gone</h2>

                <p>
                  Limited-time offers on selected products.
                </p>
              </div>

              <div className="sale-timer">
                <Clock3 size={17} />
                <div>
                  <small>Limited time</small>
                  <strong>Today only</strong>
                </div>
              </div>
            </div>

            <div className="flash-products">
              {flashProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  wishlist={wishlist}
                  onWishlist={toggleWishlist}
                  flash
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* ================= FEATURED ================= */}

        <section className="content-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                Curated for you
              </span>

              <h2>
                {activeCategory === "All"
                  ? "Featured products"
                  : activeCategory}
              </h2>

              <p>
                Popular picks selected from our collection.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="view-link"
            >
              View all products
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="product-grid">
              {[1, 2, 3, 4].map((item) => (
                <ProductSkeleton key={item} />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <motion.div
              className="product-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.08,
              }}
            >
              {featuredProducts.map(
                (product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    wishlist={wishlist}
                    onWishlist={toggleWishlist}
                  />
                )
              )}
            </motion.div>
          ) : (
            <div className="empty-state">
              <ShoppingBag size={32} />

              <h3>No products found</h3>

              <p>
                Try another category or search for something
                else.
              </p>

              <button
                onClick={() => {
                  setActiveCategory("All");
                  setSearch("");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* ================= BENEFITS ================= */}

        <motion.section
          className="benefits-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div className="benefit-box">
            <div className="benefit-round">
              <Truck size={21} />
            </div>

            <div>
              <strong>Fast delivery</strong>
              <span>
                Quick and reliable delivery on your orders.
              </span>
            </div>
          </div>

          <div className="benefit-box">
            <div className="benefit-round">
              <ShieldCheck size={21} />
            </div>

            <div>
              <strong>Secure shopping</strong>
              <span>
                Your account and shopping experience stay
                protected.
              </span>
            </div>
          </div>

          <div className="benefit-box">
            <div className="benefit-round">
              <RotateCcw size={21} />
            </div>

            <div>
              <strong>Easy returns</strong>
              <span>
                Simple return experience when you need it.
              </span>
            </div>
          </div>

          <div className="benefit-box">
            <div className="benefit-round">
              <Tag size={21} />
            </div>

            <div>
              <strong>Smart deals</strong>
              <span>
                Discover offers that give you better value.
              </span>
            </div>
          </div>
        </motion.section>
      </div>

      {/* ================= STYLES ================= */}

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
          background:
            linear-gradient(
              180deg,
              #fffdf9 0%,
              #faf8f3 38%,
              #ffffff 100%
            );
          color: #201e1a;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* ================= HEADER ================= */

        .dashboard-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.92);
          border-bottom: 1px solid #eee9df;
          backdrop-filter: blur(18px);
        }

        .header-inner {
          width: min(1380px, calc(100% - 40px));
          height: 76px;
          margin: auto;
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #191713;
          flex-shrink: 0;
        }

        .brand-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: #fff;
          background: linear-gradient(
            145deg,
            #e1b34b,
            #b98218
          );
          box-shadow:
            0 8px 22px rgba(185, 130, 24, 0.18);
        }

        .brand-text {
          font-size: 23px;
          font-weight: 850;
          letter-spacing: -0.8px;
        }

        .brand-text span {
          color: #c18d24;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .nav-link {
          padding: 9px 13px;
          border-radius: 9px;
          color: #777166;
          text-decoration: none;
          font-size: 13px;
          font-weight: 650;
          transition: 0.2s ease;
        }

        .nav-link:hover,
        .nav-link.active {
          color: #9b7019;
          background: #fbf5e7;
        }

        .header-search {
          height: 43px;
          min-width: 180px;
          flex: 1;
          max-width: 390px;
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 13px;
          border: 1px solid #e8e2d7;
          border-radius: 12px;
          background: #faf9f6;
          color: #9b9489;
          transition: 0.2s ease;
        }

        .header-search:focus-within {
          background: #fff;
          border-color: #d4aa50;
          box-shadow:
            0 0 0 4px rgba(207, 163, 57, 0.08);
        }

        .header-search input {
          min-width: 0;
          flex: 1;
          border: 0;
          outline: 0;
          background: transparent;
          color: #27231d;
          font-size: 13px;
        }

        .header-search input::placeholder {
          color: #aaa399;
        }

        .header-search button {
          border: 0;
          background: transparent;
          color: #9d958a;
          cursor: pointer;
          display: grid;
          place-items: center;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icon-button {
          width: 40px;
          height: 40px;
          position: relative;
          display: grid;
          place-items: center;
          border: 1px solid transparent;
          border-radius: 11px;
          background: transparent;
          color: #6f6a61;
          cursor: pointer;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .icon-button:hover {
          color: #a1761d;
          background: #faf5e9;
          border-color: #eee3ca;
          transform: translateY(-1px);
        }

        .icon-badge {
          position: absolute;
          top: 1px;
          right: 1px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          display: grid;
          place-items: center;
          border-radius: 99px;
          background: #c69624;
          color: #fff;
          font-size: 9px;
          font-weight: 800;
        }

        .notification-button {
          position: relative;
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c69624;
          border: 1.5px solid white;
        }

        .profile-button {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-left: 4px;
          padding: 5px 9px 5px 5px;
          border: 1px solid #ece6dc;
          border-radius: 12px;
          background: #fff;
          text-decoration: none;
          color: #28241e;
          transition: 0.2s ease;
        }

        .profile-button:hover {
          border-color: #dbc58e;
          box-shadow:
            0 7px 20px rgba(70, 52, 20, 0.07);
        }

        .profile-avatar {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #f3e4bd;
          color: #8a651a;
          font-size: 12px;
          font-weight: 850;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .profile-info strong {
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 11px;
        }

        .profile-info span {
          color: #9a9388;
          font-size: 9px;
        }

        .mobile-menu-button {
          display: none;
          width: 40px;
          height: 40px;
          border: 1px solid #e8e2d7;
          border-radius: 11px;
          background: #fff;
          color: #5e584e;
        }

        .mobile-menu {
          overflow: hidden;
          border-top: 1px solid #eee9df;
          padding: 10px 20px 15px;
        }

        .mobile-menu a {
          display: block;
          padding: 12px 4px;
          color: #625c53;
          font-size: 14px;
          font-weight: 650;
          text-decoration: none;
        }

        /* ================= CONTAINER ================= */

        .dashboard-container {
          width: min(1380px, calc(100% - 40px));
          margin: auto;
          padding: 32px 0 55px;
        }

        /* ================= WELCOME ================= */

        .welcome-section {
          min-height: 315px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          padding: 46px 48px;
          overflow: hidden;
          position: relative;
          border: 1px solid #eee5d4;
          border-radius: 25px;
          background:
            linear-gradient(
              120deg,
              #fffdf8 0%,
              #fffaf0 55%,
              #f9f3e5 100%
            );
          box-shadow:
            0 16px 45px rgba(72, 53, 17, 0.06);
        }

        .welcome-section::after {
          content: "";
          position: absolute;
          width: 260px;
          height: 260px;
          right: -100px;
          bottom: -130px;
          border: 1px solid rgba(190, 143, 40, 0.12);
          border-radius: 50%;
        }

        .eyebrow {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 14px;
          color: #9a721d;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.7px;
          text-transform: uppercase;
        }

        .welcome-section h1 {
          margin: 0;
          font-size: clamp(36px, 4vw, 55px);
          line-height: 1.02;
          letter-spacing: -2.8px;
          font-weight: 850;
          color: #211e18;
        }

        .welcome-section h1 span {
          color: #bd8b25;
        }

        .welcome-section p {
          max-width: 590px;
          margin: 17px 0 24px;
          color: #756f65;
          font-size: 14px;
          line-height: 1.7;
        }

        .welcome-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .primary-cta,
        .secondary-cta {
          height: 43px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 17px;
          border-radius: 11px;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          transition: 0.22s ease;
        }

        .primary-cta {
          color: white;
          background: #c69624;
          box-shadow:
            0 9px 20px rgba(198, 150, 36, 0.2);
        }

        .primary-cta:hover {
          background: #b68419;
          transform: translateY(-2px);
          box-shadow:
            0 12px 25px rgba(198, 150, 36, 0.27);
        }

        .secondary-cta {
          color: #655d50;
          border: 1px solid #e4dac6;
          background: rgba(255, 255, 255, 0.7);
        }

        .secondary-cta:hover {
          border-color: #d4b56d;
          color: #9a711c;
          transform: translateY(-2px);
        }

        .welcome-visual {
          width: 330px;
          height: 220px;
          flex-shrink: 0;
          position: relative;
        }

        .visual-main {
          position: absolute;
          inset: 25px 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid #eadcbf;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.75);
          box-shadow:
            0 15px 35px rgba(79, 57, 17, 0.08);
        }

        .visual-icon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          margin-bottom: 12px;
          border-radius: 17px;
          color: #9a701b;
          background: #f7e9c6;
        }

        .visual-main strong {
          color: #302a20;
          font-size: 16px;
        }

        .visual-main span {
          margin-top: 4px;
          color: #989084;
          font-size: 11px;
        }

        .visual-card {
          position: absolute;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 11px;
          border: 1px solid #eadfca;
          border-radius: 11px;
          background: white;
          color: #625a4e;
          font-size: 10px;
          font-weight: 750;
          box-shadow:
            0 8px 25px rgba(67, 48, 13, 0.08);
        }

        .visual-card svg {
          color: #b98922;
        }

        .card-one {
          top: 0;
          left: 0;
          animation: floatingOne 4s ease-in-out infinite;
        }

        .card-two {
          right: 0;
          bottom: 3px;
          animation: floatingTwo 4.5s ease-in-out infinite;
        }

        @keyframes floatingOne {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes floatingTwo {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(6px);
          }
        }

        /* ================= STATS ================= */

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 13px;
          margin: 18px 0 44px;
        }

        .stat-card {
          min-height: 82px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border: 1px solid #ece7df;
          border-radius: 15px;
          background: #fff;
          transition: 0.22s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          border-color: #e1d3b6;
          box-shadow:
            0 12px 28px rgba(60, 46, 20, 0.06);
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 11px;
        }

        .stat-icon.gold {
          color: #9b701a;
          background: #f8edcf;
        }

        .stat-icon.blue {
          color: #477394;
          background: #e9f3f9;
        }

        .stat-icon.green {
          color: #4c815f;
          background: #eaf5ed;
        }

        .stat-icon.purple {
          color: #725d98;
          background: #f1ecf9;
        }

        .stat-card div:nth-child(2) {
          min-width: 0;
        }

        .stat-card span {
          display: block;
          margin-bottom: 3px;
          color: #989187;
          font-size: 10px;
        }

        .stat-card strong {
          display: block;
          color: #332f28;
          font-size: 15px;
        }

        .stat-arrow {
          margin-left: auto;
          color: #c2bcb2;
        }

        /* ================= SECTIONS ================= */

        .content-section {
          margin-bottom: 48px;
        }

        .section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .section-kicker {
          display: block;
          margin-bottom: 5px;
          color: #b18429;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .section-heading h2 {
          margin: 0;
          color: #24211c;
          font-size: 25px;
          letter-spacing: -1px;
        }

        .section-heading p {
          margin: 5px 0 0;
          color: #928b80;
          font-size: 12px;
        }

        .view-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #9d741f;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
        }

        .view-link:hover {
          color: #76530e;
        }

        /* ================= CATEGORIES ================= */

        .category-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 10px;
        }

        .category-card {
          min-width: 0;
          padding: 14px 8px;
          border: 1px solid #ece7de;
          border-radius: 15px;
          background: #fff;
          cursor: pointer;
          text-align: center;
          transition: 0.22s ease;
        }

        .category-card:hover,
        .category-card.selected {
          transform: translateY(-3px);
          border-color: #d9bf80;
          box-shadow:
            0 11px 25px rgba(70, 50, 15, 0.07);
        }

        .category-card.selected {
          background: #fffaf0;
        }

        .category-icon {
          width: 50px;
          height: 50px;
          display: grid;
          place-items: center;
          margin: 0 auto 10px;
          border-radius: 15px;
          font-size: 23px;
        }

        .category-icon.all {
          color: #9a711d;
          background: #f8edd3;
        }

        .bg-0 {
          background: #fff6df;
        }

        .bg-1 {
          background: #edf7ff;
        }

        .bg-2 {
          background: #fff0f3;
        }

        .bg-3 {
          background: #edf8f0;
        }

        .bg-4 {
          background: #f5effd;
        }

        .bg-5 {
          background: #fff3e8;
        }

        .bg-6 {
          background: #edfafa;
        }

        .bg-7 {
          background: #f1f2f4;
        }

        .category-card strong {
          display: block;
          overflow: hidden;
          color: #39342c;
          font-size: 11px;
          font-weight: 800;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .category-card span {
          display: block;
          margin-top: 4px;
          overflow: hidden;
          color: #a09a90;
          font-size: 9px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ================= FLASH ================= */

        .flash-section {
          margin-bottom: 48px;
          padding: 27px;
          border: 1px solid #eadfc7;
          border-radius: 21px;
          background:
            linear-gradient(
              120deg,
              #fffaf0,
              #fffdf8
            );
        }

        .flash-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 21px;
        }

        .flash-title {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 4px;
          color: #b67e12;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.7px;
          text-transform: uppercase;
        }

        .flash-header h2 {
          margin: 0;
          font-size: 23px;
          letter-spacing: -0.8px;
        }

        .flash-header p {
          margin: 5px 0 0;
          color: #928a7d;
          font-size: 11px;
        }

        .sale-timer {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 13px;
          border: 1px solid #eadfc7;
          border-radius: 11px;
          background: #fff;
          color: #9e741c;
        }

        .sale-timer small {
          display: block;
          color: #a49b8e;
          font-size: 8px;
        }

        .sale-timer strong {
          display: block;
          margin-top: 2px;
          color: #4c4438;
          font-size: 11px;
        }

        .flash-products {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 13px;
        }

        /* ================= PRODUCTS ================= */

        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 17px;
        }

        .product-card {
          position: relative;
          min-width: 0;
          overflow: hidden;
          border: 1px solid #ece7df;
          border-radius: 17px;
          background: #fff;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .product-card:hover {
          transform: translateY(-6px);
          border-color: #e0d3b7;
          box-shadow:
            0 17px 38px rgba(63, 47, 19, 0.09);
        }

        .product-image-wrap {
          height: 225px;
          position: relative;
          overflow: hidden;
          background: #f8f7f4;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 17px;
          transition: transform 0.45s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.055);
        }

        .product-image-fallback {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          color: #c0b9ae;
        }

        .discount-badge {
          position: absolute;
          top: 11px;
          left: 11px;
          padding: 5px 7px;
          border-radius: 7px;
          color: #9a6710;
          background: #fff2cc;
          font-size: 9px;
          font-weight: 900;
        }

        .flash-badge {
          position: absolute;
          left: 11px;
          bottom: 11px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 7px;
          border-radius: 7px;
          color: #fff;
          background: #bd8a21;
          font-size: 8px;
          font-weight: 900;
        }

        .wishlist-button {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 1px solid #e9e4da;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.94);
          color: #817b72;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .wishlist-button:hover,
        .wishlist-button.liked {
          color: #c08b21;
          border-color: #dec78f;
          background: #fffaf0;
        }

        .product-info {
          padding: 15px;
        }

        .product-category {
          display: block;
          margin-bottom: 5px;
          color: #b18839;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }

        .product-name {
          display: block;
          min-height: 35px;
          color: #2e2a24;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.35;
          text-decoration: none;
        }

        .product-name:hover {
          color: #a27419;
        }

        .product-description {
          min-height: 31px;
          margin: 6px 0 10px;
          overflow: hidden;
          color: #969087;
          font-size: 10px;
          line-height: 1.55;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 11px;
        }

        .stars {
          display: flex;
          align-items: center;
          gap: 1px;
          color: #d29b27;
        }

        .rating-number {
          color: #70695f;
          font-size: 10px;
          font-weight: 750;
        }

        .review-count {
          color: #aaa39a;
          font-size: 9px;
        }

        .price-row {
          display: flex;
          align-items: flex-end;
          gap: 7px;
        }

        .current-price {
          color: #28241e;
          font-size: 17px;
          font-weight: 900;
        }

        .original-price {
          color: #aaa39b;
          font-size: 10px;
          text-decoration: line-through;
        }

        /* ================= SKELETON ================= */

        .skeleton-card {
          overflow: hidden;
          border: 1px solid #eeeae3;
          border-radius: 17px;
          background: #fff;
        }

        .skeleton-image,
        .skeleton-line {
          background:
            linear-gradient(
              90deg,
              #f1efeb 25%,
              #f8f7f4 50%,
              #f1efeb 75%
            );
          background-size: 200% 100%;
          animation: skeleton 1.3s infinite;
        }

        .skeleton-image {
          height: 225px;
        }

        .skeleton-content {
          padding: 15px;
        }

        .skeleton-line {
          height: 10px;
          margin-bottom: 10px;
          border-radius: 6px;
        }

        .skeleton-line.short {
          width: 55%;
        }

        @keyframes skeleton {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        /* ================= EMPTY ================= */

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          border: 1px dashed #ddd5c7;
          border-radius: 17px;
          background: #fff;
          color: #aaa297;
        }

        .empty-state h3 {
          margin: 13px 0 5px;
          color: #48423a;
          font-size: 16px;
        }

        .empty-state p {
          margin: 0 0 17px;
          font-size: 11px;
        }

        .empty-state button {
          height: 38px;
          padding: 0 14px;
          border: 0;
          border-radius: 9px;
          color: #fff;
          background: #c69624;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
        }

        /* ================= BENEFITS ================= */

        .benefits-section {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid #ece7df;
          border-radius: 17px;
          background: #fff;
          overflow: hidden;
        }

        .benefit-box {
          min-height: 100px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 17px;
          border-right: 1px solid #eeeae3;
        }

        .benefit-box:last-child {
          border-right: 0;
        }

        .benefit-round {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 11px;
          color: #9d741f;
          background: #faf2dc;
        }

        .benefit-box strong {
          display: block;
          color: #39342d;
          font-size: 11px;
        }

        .benefit-box span {
          display: block;
          margin-top: 4px;
          color: #999187;
          font-size: 9px;
          line-height: 1.45;
        }

        /* ================= TABLET ================= */

        @media (max-width: 1100px) {
          .header-inner {
            gap: 13px;
          }

          .desktop-nav {
            display: none;
          }

          .category-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .product-grid,
          .flash-products {
            grid-template-columns: repeat(3, 1fr);
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .benefits-section {
            grid-template-columns: repeat(2, 1fr);
          }

          .benefit-box:nth-child(2) {
            border-right: 0;
          }

          .benefit-box:nth-child(-n + 2) {
            border-bottom: 1px solid #eeeae3;
          }
        }

        /* ================= MOBILE ================= */

        @media (max-width: 760px) {
          .header-inner {
            width: calc(100% - 24px);
            height: 68px;
          }

          .brand-text {
            font-size: 20px;
          }

          .brand-icon {
            width: 38px;
            height: 38px;
          }

          .header-search {
            display: none;
          }

          .profile-button {
            display: none;
          }

          .notification-button {
            display: none;
          }

          .mobile-menu-button {
            display: grid;
            place-items: center;
          }

          .dashboard-container {
            width: calc(100% - 24px);
            padding-top: 18px;
          }

          .welcome-section {
            min-height: auto;
            padding: 28px 23px;
          }

          .welcome-visual {
            display: none;
          }

          .welcome-section h1 {
            font-size: 38px;
            letter-spacing: -2px;
          }

          .welcome-section p {
            font-size: 13px;
          }

          .welcome-actions {
            flex-wrap: wrap;
          }

          .stats-grid {
            gap: 8px;
            margin-bottom: 35px;
          }

          .stat-card {
            min-height: 72px;
            padding: 10px;
          }

          .stat-icon {
            width: 35px;
            height: 35px;
          }

          .section-heading {
            align-items: flex-start;
          }

          .section-heading h2 {
            font-size: 21px;
          }

          .section-heading p {
            font-size: 10px;
          }

          .category-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 7px;
          }

          .category-card {
            padding: 10px 4px;
          }

          .category-icon {
            width: 42px;
            height: 42px;
            margin-bottom: 7px;
            font-size: 18px;
          }

          .category-card strong {
            font-size: 9px;
          }

          .category-card span {
            display: none;
          }

          .product-grid,
          .flash-products {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .product-image-wrap {
            height: 175px;
          }

          .product-info {
            padding: 11px;
          }

          .product-name {
            font-size: 11px;
          }

          .product-description {
            font-size: 9px;
          }

          .current-price {
            font-size: 14px;
          }

          .original-price {
            font-size: 9px;
          }

          .flash-section {
            padding: 18px;
          }

          .flash-header {
            align-items: flex-start;
          }

          .sale-timer {
            display: none;
          }

          .benefits-section {
            grid-template-columns: 1fr;
          }

          .benefit-box,
          .benefit-box:nth-child(2) {
            border-right: 0;
            border-bottom: 1px solid #eeeae3;
          }

          .benefit-box:last-child {
            border-bottom: 0;
          }
        }

        @media (max-width: 430px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat-card span {
            font-size: 9px;
          }

          .stat-card strong {
            font-size: 13px;
          }

          .category-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .category-icon {
            width: 37px;
            height: 37px;
            border-radius: 11px;
          }

          .product-image-wrap {
            height: 155px;
          }

          .wishlist-button {
            width: 30px;
            height: 30px;
          }

          .discount-badge {
            font-size: 8px;
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  index,
  wishlist,
  onWishlist,
  flash = false,
}: {
  product: Product;
  index: number;
  wishlist: string[];
  onWishlist: (id: string) => void;
  flash?: boolean;
}) {
  const discount = getDiscount(product);
  const category = getCategoryName(product);

  const image =
    product.image_url && product.image_url.trim()
      ? product.image_url
      : null;

  const liked = wishlist.includes(product.id);

  return (
    <motion.article
      className="product-card"
      variants={itemVariants}
      whileHover={{
        y: -5,
      }}
      transition={{
        duration: 0.22,
      }}
    >
      <div className="product-image-wrap">
        <Link
          href={`/dashboard/products/${product.id}`}
          aria-label={product.name}
        >
          {image ? (
            <Image
              src={image}
              alt={product.name}
              width={500}
              height={500}
              className="product-image"
              unoptimized
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="product-image-fallback">
              <ShoppingBag size={35} />
            </div>
          )}
        </Link>

        {discount > 0 && (
          <span className="discount-badge">
            {discount}% OFF
          </span>
        )}

        {flash && (
          <span className="flash-badge">
            <Zap size={10} fill="currentColor" />
            FLASH DEAL
          </span>
        )}

        <motion.button
          type="button"
          className={`wishlist-button ${
            liked ? "liked" : ""
          }`}
          onClick={() => onWishlist(product.id)}
          whileTap={{
            scale: 0.82,
          }}
          aria-label={
            liked
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          <Heart
            size={17}
            fill={liked ? "currentColor" : "none"}
          />
        </motion.button>
      </div>

      <div className="product-info">
        <span className="product-category">
          {category}
        </span>

        <Link
          href={`/dashboard/products/${product.id}`}
          className="product-name"
        >
          {product.name}
        </Link>

        <p className="product-description">
          {product.short_description ||
            product.description ||
            "Discover this product on PrimeCart."}
        </p>

        <div className="rating-row">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={11}
                fill={
                  star <=
                  Math.round(product.rating || 0)
                    ? "currentColor"
                    : "none"
                }
              />
            ))}
          </div>

          <span className="rating-number">
            {(product.rating || 0).toFixed(1)}
          </span>

          <span className="review-count">
            ({product.reviews_count || 0})
          </span>
        </div>

        <div className="price-row">
          <strong className="current-price">
            {formatPrice(Number(product.price || 0))}
          </strong>

          {product.original_price &&
            product.original_price > product.price && (
              <span className="original-price">
                {formatPrice(
                  Number(product.original_price)
                )}
              </span>
            )}
        </div>
      </div>
    </motion.article>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image" />

      <div className="skeleton-content">
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
      </div>
    </div>
  );
}
