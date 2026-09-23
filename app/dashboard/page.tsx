"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Crown,
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
    icon: BarChart3,
  },
  {
    label: "My Orders",
    href: "/dashboard/orders",
    icon: Package,
  },
  {
    label: "Wishlist",
    href: "/dashboard/wishlist",
    icon: Heart,
  },
];

const smartTools = [
  {
    title: "PrimeMatch",
    description:
      "Find products matched to your needs, priorities and budget.",
    href: "/dashboard/prime-match",
    icon: Target,
    label: "SMART MATCH",
  },
  {
    title: "Budget Builder",
    description:
      "Plan your shopping and build a practical budget.",
    href: "/dashboard/budget-builder",
    icon: WalletCards,
    label: "BUDGET",
  },
  {
    title: "Setup Builder",
    description:
      "Create a complete setup for gaming, college, work and more.",
    href: "/dashboard/setup-builder",
    icon: Sparkles,
    label: "CURATED",
  },
  {
    title: "PrimePoints",
    description:
      "Track your rewards and discover more ways to earn.",
    href: "/dashboard/prime-points",
    icon: Crown,
    label: "REWARDS",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getImageUrl(image?: string | null) {
  if (!image) return "";

  const value = image.trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  ) {
    return value;
  }

  return `/${value}`;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function discountPercentage(
  price: number,
  originalPrice: number | null,
) {
  if (!originalPrice || originalPrice <= price) {
    return 0;
  }

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100,
  );
}

function getInitials(name: string) {
  const parts = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2);

  const initials = parts
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "PC";
}

function formatDate(value: string) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  const [mobileMenu, setMobileMenu] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(
    null,
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const supabase = useMemo(() => createClient(), []);

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
                category_id
              `,
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
              "id,status,total_amount,created_at",
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

        if (profileResult.data) {
          setProfile(profileResult.data as Profile);
        } else {
          setProfile({
            full_name:
              user.user_metadata?.full_name ??
              user.email?.split("@")[0] ??
              "PrimeCart User",
            email: user.email ?? "",
          });
        }

        if (productsResult.data) {
          setProducts(
            productsResult.data as Product[],
          );
        }

        if (categoriesResult.data) {
          setCategories(
            categoriesResult.data as Category[],
          );
        }

        if (ordersResult.data) {
          setOrders(
            ordersResult.data as Order[],
          );
        }

        if (wishlistResult.data) {
          setWishlistCount(
            wishlistResult.data.length,
          );
        }
      } catch (error) {
        console.error(
          "PrimeCart dashboard error:",
          error,
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

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const featuredProducts = useMemo(() => {
    const featured = products.filter(
      (product) => product.is_featured,
    );

    return featured.length
      ? featured.slice(0, 6)
      : products.slice(0, 6);
  }, [products]);

  const flashProducts = useMemo(() => {
    const flash = products.filter(
      (product) => product.is_flash_sale,
    );

    return flash.length
      ? flash.slice(0, 4)
      : products.slice(0, 4);
  }, [products]);

  const searchResults = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return [];

    return products
      .filter((product) => {
        const name =
          product.name?.toLowerCase() ?? "";

        const brand =
          product.brand?.toLowerCase() ?? "";

        return (
          name.includes(value) ||
          brand.includes(value)
        );
      })
      .slice(0, 6);
  }, [products, search]);

  const totalSpent = useMemo(() => {
    return orders.reduce(
      (total, order) =>
        total + Number(order.total_amount || 0),
      0,
    );
  }, [orders]);

  const primePoints = Math.floor(totalSpent / 10);

  const userName =
    profile?.full_name?.trim() ||
    profile?.email?.split("@")[0] ||
    "PrimeCart User";

  const firstName = userName.split(" ")[0];

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } finally {
      window.location.replace("/auth/login");
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="prime-dashboard">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #fbf8f2;
        }

        button,
        input {
          font: inherit;
        }

        .prime-dashboard {
          --pc-bg: #fbf8f2;
          --pc-white: #ffffff;
          --pc-cream: #fffdf8;
          --pc-soft: #f8f3e9;
          --pc-gold: #b9975b;
          --pc-gold-dark: #997438;
          --pc-gold-light: #d9bd84;
          --pc-gold-pale: #f5ead4;
          --pc-text: #4a4034;
          --pc-text-soft: #786c5b;
          --pc-muted: #9c907f;
          --pc-border: #eadfcb;
          --pc-border-light: #f1e9dc;
          --pc-shadow:
            0 10px 30px rgba(113, 91, 53, 0.07);
          --pc-shadow-hover:
            0 18px 42px rgba(113, 91, 53, 0.13);

          min-height: 100vh;
          color: var(--pc-text);

          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(216, 189, 134, 0.12),
              transparent 25%
            ),
            var(--pc-bg);
        }

        /* =================================================
           SIDEBAR
        ================================================= */

        .pc-sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 80;

          width: 260px;

          display: flex;
          flex-direction: column;

          background:
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.97),
              rgba(255, 253, 248, 0.96)
            );

          border-right: 1px solid var(--pc-border);

          backdrop-filter: blur(20px);

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .pc-logo-area {
          height: 78px;
          padding: 0 21px;

          display: flex;
          align-items: center;

          border-bottom: 1px solid var(--pc-border-light);
        }

        .pc-logo {
          display: flex;
          align-items: center;
          gap: 11px;

          color: var(--pc-text);
          text-decoration: none;
        }

        .pc-logo-mark {
          width: 42px;
          height: 42px;

          display: grid;
          place-items: center;

          border-radius: 13px;

          color: white;

          background:
            linear-gradient(
              145deg,
              #ceb174,
              #a47d40
            );

          box-shadow:
            0 8px 20px
              rgba(185, 151, 91, 0.23);
        }

        .pc-logo-name {
          font-size: 19px;
          font-weight: 950;
          letter-spacing: -0.7px;
        }

        .pc-logo-name span {
          color: var(--pc-gold);
        }

        .pc-logo-subtitle {
          display: block;
          margin-top: 1px;

          color: var(--pc-muted);

          font-size: 8px;
          font-weight: 850;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .pc-nav {
          flex: 1;
          overflow-y: auto;
          padding: 24px 13px;
        }

        .pc-nav-label {
          margin: 0 10px 10px;

          color: #aa9d89;

          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .pc-nav-link {
          position: relative;

          min-height: 46px;
          margin-bottom: 4px;
          padding: 0 13px;

          display: flex;
          align-items: center;
          gap: 12px;

          border: 0;
          border-radius: 14px;

          background: transparent;

          color: var(--pc-text-soft);
          text-decoration: none;

          font-size: 12px;
          font-weight: 800;

          cursor: pointer;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .pc-nav-link:hover {
          color: var(--pc-text);
          background: #faf6ed;
          transform: translateX(2px);
        }

        .pc-nav-link.active {
          color: #8d6a34;

          background:
            linear-gradient(
              100deg,
              #f7eddb,
              #fbf7ef
            );

          box-shadow:
            inset 0 0 0 1px #ead9b7;
        }

        .pc-nav-link.active::before {
          content: "";

          position: absolute;
          left: 0;

          width: 3px;
          height: 23px;

          border-radius:
            0 5px 5px 0;

          background: var(--pc-gold);
        }

        .pc-nav-badge {
          min-width: 21px;
          height: 21px;

          margin-left: auto;

          display: grid;
          place-items: center;

          border-radius: 999px;

          background: var(--pc-gold-pale);
          color: var(--pc-gold-dark);

          font-size: 9px;
          font-weight: 950;
        }

        .pc-sidebar-bottom {
          padding: 13px;

          border-top:
            1px solid var(--pc-border-light);
        }

        /* =================================================
           MAIN
        ================================================= */

        .pc-main {
          min-height: 100vh;
          margin-left: 260px;
        }

        /* =================================================
           HEADER
        ================================================= */

        .pc-header {
          position: sticky;
          top: 0;
          z-index: 50;

          height: 76px;
          padding: 0 30px;

          display: flex;
          align-items: center;
          gap: 18px;

          background:
            rgba(251, 248, 242, 0.86);

          border-bottom:
            1px solid rgba(234, 223, 203, 0.8);

          backdrop-filter: blur(18px);
        }

        .pc-mobile-menu {
          width: 41px;
          height: 41px;

          display: none;
          place-items: center;

          border:
            1px solid var(--pc-border);

          border-radius: 13px;

          background: white;
          color: var(--pc-text);

          cursor: pointer;
        }

        .pc-search-wrap {
          position: relative;
          width: min(520px, 55vw);
        }

        .pc-search {
          height: 43px;

          display: flex;
          align-items: center;
          gap: 10px;

          padding: 0 14px;

          border:
            1px solid var(--pc-border);

          border-radius: 14px;

          background: rgba(255, 255, 255, 0.9);

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .pc-search:focus-within {
          border-color: #d4b879;

          box-shadow:
            0 0 0 4px
              rgba(185, 151, 91, 0.09);
        }

        .pc-search input {
          width: 100%;

          border: 0;
          outline: 0;

          background: transparent;

          color: var(--pc-text);

          font-size: 12px;
          font-weight: 600;
        }

        .pc-search input::placeholder {
          color: #aaa092;
        }

        .pc-search-results {
          position: absolute;
          top: 51px;
          left: 0;
          right: 0;

          padding: 7px;

          border:
            1px solid var(--pc-border);

          border-radius: 17px;

          background: white;

          box-shadow:
            0 22px 55px
              rgba(73, 57, 34, 0.13);

          animation:
            pcDrop 0.18s ease both;
        }

        .pc-search-result {
          display: flex;
          align-items: center;
          gap: 10px;

          padding: 8px;

          border-radius: 12px;

          color: var(--pc-text);
          text-decoration: none;

          transition: background 0.15s ease;
        }

        .pc-search-result:hover {
          background: #faf6ed;
        }

        .pc-header-actions {
          margin-left: auto;

          display: flex;
          align-items: center;
          gap: 9px;
        }

        .pc-icon-button {
          position: relative;

          width: 41px;
          height: 41px;

          display: grid;
          place-items: center;

          border:
            1px solid var(--pc-border);

          border-radius: 13px;

          background: white;
          color: var(--pc-text-soft);

          cursor: pointer;

          transition: all 0.2s ease;
        }

        .pc-icon-button:hover {
          color: #957039;
          border-color: #d2b77e;
          transform: translateY(-1px);
          box-shadow:
            0 7px 18px
              rgba(113, 91, 53, 0.08);
        }

        .pc-notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;

          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #c3984e;

          box-shadow:
            0 0 0 3px white;
        }

        .pc-profile {
          position: relative;
        }

        .pc-profile-button {
          display: flex;
          align-items: center;
          gap: 9px;

          padding: 4px 9px 4px 4px;

          border:
            1px solid var(--pc-border);

          border-radius: 14px;

          background: white;

          color: var(--pc-text);

          cursor: pointer;
        }

        .pc-avatar {
          width: 34px;
          height: 34px;

          display: grid;
          place-items: center;

          border-radius: 11px;

          color: white;

          background:
            linear-gradient(
              145deg,
              #d4b97f,
              #a68147
            );

          font-size: 10px;
          font-weight: 950;
        }

        .pc-dropdown {
          position: absolute;
          right: 0;
          top: 49px;

          width: 290px;

          padding: 8px;

          border:
            1px solid var(--pc-border);

          border-radius: 17px;

          background: white;

          box-shadow:
            0 22px 55px
              rgba(73, 57, 34, 0.13);

          animation:
            pcDrop 0.18s ease both;
        }

        @keyframes pcDrop {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =================================================
           CONTENT
        ================================================= */

        .pc-content {
          width: min(
            1440px,
            calc(100% - 52px)
          );

          margin: auto;
          padding: 30px 0 55px;
        }

        /* =================================================
           WELCOME
        ================================================= */

        .pc-welcome {
          position: relative;
          overflow: hidden;

          min-height: 285px;

          padding: 36px;

          border:
            1px solid #eadbbd;

          border-radius: 28px;

          background:
            radial-gradient(
              circle at 91% 18%,
              rgba(202, 169, 105, 0.22),
              transparent 29%
            ),
            linear-gradient(
              120deg,
              #fffdf8 0%,
              #f9f0df 58%,
              #f5e8cf 100%
            );

          box-shadow: var(--pc-shadow);

          animation:
            pcFadeUp 0.55s ease both;
        }

        .pc-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          padding: 6px 10px;

          border:
            1px solid #e5d3ae;

          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.58);

          color: #98783f;

          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .pc-welcome h1 {
          max-width: 700px;

          margin: 15px 0 0;

          color: #493d2e;

          font-size:
            clamp(29px, 4vw, 47px);

          line-height: 1.05;

          letter-spacing: -1.8px;

          font-weight: 950;
        }

        .pc-welcome h1 span {
          color: #b18b4c;
        }

        .pc-welcome-text {
          max-width: 620px;

          margin-top: 14px;

          color: #887965;

          font-size: 13px;
          line-height: 1.8;
        }

        .pc-welcome-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;

          margin-top: 24px;
        }

        .pc-primary-button {
          min-height: 43px;

          padding: 0 17px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          border: 0;
          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #c9a966,
              #a98246
            );

          color: white;
          text-decoration: none;

          font-size: 11px;
          font-weight: 900;

          box-shadow:
            0 9px 22px
              rgba(159, 120, 55, 0.18);

          cursor: pointer;

          transition: all 0.2s ease;
        }

        .pc-primary-button:hover {
          transform: translateY(-2px);

          box-shadow:
            0 13px 28px
              rgba(159, 120, 55, 0.23);
        }

        .pc-secondary-button {
          min-height: 43px;

          padding: 0 17px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          border:
            1px solid #dfcfaf;

          border-radius: 13px;

          background:
            rgba(255, 255, 255, 0.6);

          color: #80673f;

          text-decoration: none;

          font-size: 11px;
          font-weight: 900;

          transition: all 0.2s ease;
        }

        .pc-secondary-button:hover {
          background: white;
          transform: translateY(-2px);
        }

        /* =================================================
           POINTS
        ================================================= */

        .pc-points-card {
          position: absolute;

          top: 34px;
          right: 35px;

          width: 240px;

          padding: 19px;

          border:
            1px solid
              rgba(255, 255, 255, 0.75);

          border-radius: 21px;

          background:
            rgba(255, 255, 255, 0.65);

          box-shadow:
            0 20px 40px
              rgba(123, 91, 43, 0.09);

          backdrop-filter: blur(14px);

          animation:
            pcFloat 4.5s ease-in-out infinite;
        }

        @keyframes pcFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-6px);
          }
        }

        .pc-points-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pc-points-icon {
          width: 39px;
          height: 39px;

          display: grid;
          place-items: center;

          border-radius: 12px;

          background: #f1e2c2;
          color: #a37e3e;
        }

        .pc-points-label {
          color: #a08760;

          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .pc-points-number {
          margin-top: 13px;

          color: #4a3c29;

          font-size: 28px;
          line-height: 1;
          font-weight: 950;
        }

        .pc-progress {
          height: 5px;

          margin-top: 14px;

          overflow: hidden;

          border-radius: 999px;

          background: #eadfcf;
        }

        .pc-progress span {
          display: block;

          width: 64%;
          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #c9a966,
              #a17a3f
            );

          animation:
            pcProgress 1s ease both;
        }

        @keyframes pcProgress {
          from {
            width: 0;
          }

          to {
            width: 64%;
          }
        }

        /* =================================================
           SECTION
        ================================================= */

        .pc-section {
          margin-top: 38px;
        }

        .pc-section-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;

          margin-bottom: 17px;
        }

        .pc-section-kicker {
          margin: 0;

          color: #b08b4c;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 0.18em;

          text-transform: uppercase;
        }

        .pc-section-heading h2 {
          margin: 4px 0 0;

          color: #4c4133;

          font-size: 23px;
          line-height: 1.15;

          font-weight: 950;

          letter-spacing: -0.7px;
        }

        .pc-view-all {
          display: inline-flex;
          align-items: center;
          gap: 4px;

          color: #9a763d;

          text-decoration: none;

          font-size: 10px;
          font-weight: 900;
        }

        .pc-view-all:hover {
          color: #7f5f2d;
        }

        /* =================================================
           STATS
        ================================================= */

        .pc-stats {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 13px;

          margin-top: 16px;
        }

        .pc-stat {
          position: relative;
          overflow: hidden;

          padding: 18px;

          border:
            1px solid var(--pc-border);

          border-radius: 18px;

          background: white;

          box-shadow: var(--pc-shadow);

          transition: all 0.25s ease;
        }

        .pc-stat:hover {
          transform: translateY(-4px);

          border-color: #dcc79f;

          box-shadow: var(--pc-shadow-hover);
        }

        .pc-stat::after {
          content: "";

          position: absolute;

          right: -35px;
          bottom: -45px;

          width: 90px;
          height: 90px;

          border-radius: 50%;

          background:
            rgba(185, 151, 91, 0.06);
        }

        .pc-stat-icon {
          width: 39px;
          height: 39px;

          display: grid;
          place-items: center;

          border-radius: 12px;

          background: #f7f0e2;
          color: #a27c3f;
        }

        .pc-stat-label {
          margin: 14px 0 0;

          color: #998d7b;

          font-size: 9px;
          font-weight: 800;
        }

        .pc-stat-value {
          margin: 3px 0 0;

          color: #4a4034;

          font-size: 22px;
          font-weight: 950;

          letter-spacing: -0.6px;
        }

        .pc-stat-sub {
          margin: 3px 0 0;

          color: #aaa091;

          font-size: 8px;
          font-weight: 650;
        }

        /* =================================================
           SMART TOOLS
        ================================================= */

        .pc-smart-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 13px;
        }

        .pc-smart-card {
          position: relative;
          overflow: hidden;

          min-height: 190px;

          padding: 19px;

          border:
            1px solid var(--pc-border);

          border-radius: 20px;

          background: white;

          color: var(--pc-text);

          text-decoration: none;

          box-shadow: var(--pc-shadow);

          transition: all 0.25s ease;
        }

        .pc-smart-card:hover {
          transform: translateY(-5px);

          border-color: #d9c39a;

          box-shadow:
            var(--pc-shadow-hover);
        }

        .pc-smart-card::before {
          content: "";

          position: absolute;

          top: -70px;
          right: -70px;

          width: 160px;
          height: 160px;

          border-radius: 50%;

          background:
            rgba(185, 151, 91, 0.06);

          transition:
            transform 0.45s ease;
        }

        .pc-smart-card:hover::before {
          transform: scale(1.35);
        }

        .pc-smart-top {
          position: relative;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pc-smart-icon {
          width: 43px;
          height: 43px;

          display: grid;
          place-items: center;

          border-radius: 13px;

          background: #f7f0e2;
          color: #a17b40;

          transition: all 0.25s ease;
        }

        .pc-smart-card:hover
          .pc-smart-icon {
          background: #b9975b;
          color: white;

          transform:
            rotate(-3deg)
            scale(1.04);
        }

        .pc-smart-tag {
          padding: 5px 7px;

          border-radius: 999px;

          background: #fbf5e8;
          color: #a17b40;

          font-size: 7px;
          font-weight: 950;

          letter-spacing: 0.12em;
        }

        .pc-smart-card h3 {
          position: relative;

          margin: 18px 0 0;

          font-size: 15px;
          font-weight: 950;
        }

        .pc-smart-card p {
          position: relative;

          min-height: 40px;

          margin: 6px 0 0;

          color: #978b7b;

          font-size: 10px;
          line-height: 1.7;
        }

        .pc-smart-link {
          position: relative;

          margin-top: 14px;

          display: flex;
          align-items: center;
          gap: 5px;

          color: #a17b40;

          font-size: 9px;
          font-weight: 900;
        }

        /* =================================================
           CATEGORY
        ================================================= */

        .pc-category-grid {
          display: grid;

          grid-template-columns:
            repeat(10, 1fr);

          gap: 9px;
        }

        .pc-category {
          min-height: 108px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          padding: 10px 5px;

          border:
            1px solid var(--pc-border);

          border-radius: 17px;

          background: white;

          color: var(--pc-text);

          text-decoration: none;
          text-align: center;

          box-shadow:
            0 5px 18px
              rgba(113, 91, 53, 0.035);

          transition: all 0.22s ease;
        }

        .pc-category:hover {
          transform: translateY(-4px);

          border-color: #d8bf91;

          background: #fffdf8;

          box-shadow: var(--pc-shadow);
        }

        .pc-category-icon {
          width: 45px;
          height: 45px;

          display: grid;
          place-items: center;

          border-radius: 14px;

          background: #faf4e8;

          font-size: 20px;

          transition:
            transform 0.25s ease;
        }

        .pc-category:hover
          .pc-category-icon {
          transform: scale(1.1);
        }

        .pc-category-name {
          margin-top: 9px;

          font-size: 9px;
          line-height: 1.3;
          font-weight: 900;
        }

        /* =================================================
           PRODUCTS
        ================================================= */

        .pc-product-grid {
          display: grid;

          grid-template-columns:
            repeat(6, 1fr);

          gap: 13px;
        }

        .pc-product {
          overflow: hidden;

          border:
            1px solid var(--pc-border);

          border-radius: 19px;

          background: white;

          color: var(--pc-text);

          text-decoration: none;

          box-shadow: var(--pc-shadow);

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .pc-product:hover {
          transform: translateY(-5px);

          border-color: #d8c095;

          box-shadow:
            var(--pc-shadow-hover);
        }

        /*
          IMPORTANT:
          contain = complete original image visible.
          No crop.
          No stretch.
        */

        .pc-product-image {
          position: relative;

          width: 100%;
          height: 205px;

          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #f8f4eb;
        }

        .pc-product-image img {
          object-fit: contain !important;
          object-position: center !important;

          padding: 14px;

          transition:
            transform 0.45s
              cubic-bezier(
                0.22,
                1,
                0.36,
                1
              );
        }

        .pc-product:hover
          .pc-product-image img {
          transform: scale(1.045);
        }

        .pc-discount {
          position: absolute;

          left: 10px;
          top: 10px;

          padding: 5px 7px;

          border-radius: 999px;

          background: white;
          color: #9c753b;

          font-size: 8px;
          font-weight: 950;

          box-shadow:
            0 4px 12px
              rgba(74, 57, 31, 0.08);
        }

        .pc-product-heart {
          position: absolute;

          top: 10px;
          right: 10px;

          width: 32px;
          height: 32px;

          display: grid;
          place-items: center;

          border:
            1px solid
              rgba(234, 223, 203, 0.9);

          border-radius: 50%;

          background:
            rgba(255, 255, 255, 0.92);

          color: #827667;

          cursor: pointer;

          opacity: 0;

          transition: all 0.2s ease;
        }

        .pc-product:hover
          .pc-product-heart {
          opacity: 1;
        }

        .pc-product-heart:hover {
          color: #b66e65;
          transform: scale(1.08);
        }

        .pc-product-content {
          padding: 13px;
        }

        .pc-product-brand {
          margin: 0;

          color: #a39177;

          font-size: 7px;
          font-weight: 900;

          letter-spacing: 0.11em;

          text-transform: uppercase;
        }

        .pc-product-title {
          display: -webkit-box;

          overflow: hidden;

          min-height: 34px;

          margin: 5px 0 0;

          color: #4b4033;

          font-size: 11px;
          line-height: 1.5;

          font-weight: 900;

          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .pc-rating {
          display: flex;
          align-items: center;
          gap: 3px;

          margin-top: 8px;

          color: #806f58;

          font-size: 8px;
          font-weight: 800;
        }

        .pc-rating svg {
          color: #bd9958;
          fill: #bd9958;
        }

        .pc-product-price {
          display: flex;
          align-items: center;
          gap: 6px;

          margin-top: 8px;
        }

        .pc-product-price strong {
          color: #463a2c;

          font-size: 13px;
          font-weight: 950;
        }

        .pc-product-price del {
          color: #aaa092;

          font-size: 8px;
          font-weight: 650;
        }

        /* =================================================
           FLASH DEALS
        ================================================= */

        .pc-deals {
          overflow: hidden;

          padding: 25px;

          border:
            1px solid #eadbbd;

          border-radius: 25px;

          background:
            radial-gradient(
              circle at 95% 0%,
              rgba(214, 185, 127, 0.18),
              transparent 30%
            ),
            linear-gradient(
              120deg,
              #f9f0df,
              #fffdf8
            );

          box-shadow: var(--pc-shadow);
        }

        .pc-deal-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 10px;

          margin-top: 18px;
        }

        .pc-deal {
          display: flex;
          align-items: center;
          gap: 10px;

          padding: 9px;

          border:
            1px solid #e9dec9;

          border-radius: 15px;

          background:
            rgba(255, 255, 255, 0.72);

          color: var(--pc-text);

          text-decoration: none;

          transition: all 0.22s ease;
        }

        .pc-deal:hover {
          transform: translateY(-3px);

          background: white;

          box-shadow:
            0 10px 25px
              rgba(113, 91, 53, 0.08);
        }

        .pc-deal-image {
          position: relative;

          width: 70px;
          height: 70px;

          flex-shrink: 0;

          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background: #f4eee2;
        }

        .pc-deal-image img {
          object-fit: contain !important;
          object-position: center !important;

          padding: 6px;

          transition:
            transform 0.35s ease;
        }

        .pc-deal:hover
          .pc-deal-image img {
          transform: scale(1.06);
        }

        .pc-deal-label {
          display: flex;
          align-items: center;
          gap: 4px;

          color: #a27b3e;

          font-size: 7px;
          font-weight: 950;
        }

        .pc-deal-title {
          display: -webkit-box;

          overflow: hidden;

          margin: 4px 0 0;

          font-size: 9px;
          line-height: 1.4;

          font-weight: 900;

          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .pc-deal-price {
          margin: 5px 0 0;

          font-size: 10px;
          font-weight: 950;
        }

        /* =================================================
           BOTTOM
        ================================================= */

        .pc-bottom-grid {
          display: grid;

          grid-template-columns:
            1.25fr 0.75fr;

          gap: 14px;
        }

        .pc-panel {
          padding: 21px;

          border:
            1px solid var(--pc-border);

          border-radius: 20px;

          background: white;

          box-shadow: var(--pc-shadow);
        }

        .pc-orders {
          overflow: hidden;
          margin-top: 14px;
        }

        .pc-order {
          display: flex;
          align-items: center;
          gap: 11px;

          padding: 11px 0;

          border-bottom:
            1px solid var(--pc-border-light);
        }

        .pc-order:last-child {
          border-bottom: 0;
        }

        .pc-order-icon {
          width: 37px;
          height: 37px;

          flex-shrink: 0;

          display: grid;
          place-items: center;

          border-radius: 11px;

          background: #f8f1e3;
          color: #a27c3e;
        }

        .pc-order-info {
          min-width: 0;
          flex: 1;
        }

        .pc-order-title {
          overflow: hidden;

          margin: 0;

          color: #514637;

          font-size: 10px;
          font-weight: 900;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pc-order-meta {
          display: flex;
          align-items: center;
          gap: 6px;

          margin-top: 3px;

          color: #a19584;

          font-size: 7px;
        }

        .pc-order-status {
          color: #a17b40;
          font-weight: 900;
          text-transform: capitalize;
        }

        .pc-order-price {
          color: #4b3e2e;

          font-size: 10px;
          font-weight: 950;
        }

        /* =================================================
           QUICK ACTIONS
        ================================================= */

        .pc-quick-grid {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 9px;

          margin-top: 16px;
        }

        .pc-quick {
          padding: 13px;

          border:
            1px solid var(--pc-border-light);

          border-radius: 15px;

          color: var(--pc-text);

          text-decoration: none;

          transition: all 0.22s ease;
        }

        .pc-quick:hover {
          border-color: #d9c49a;
          background: #fffdf8;

          transform: translateY(-2px);
        }

        .pc-quick-icon {
          width: 32px;
          height: 32px;

          display: grid;
          place-items: center;

          border-radius: 10px;

          background: #f7f0e2;
          color: #a27c3e;
        }

        .pc-quick p {
          margin: 9px 0 0;

          font-size: 9px;
          font-weight: 900;
        }

        .pc-quick svg:last-child {
          margin-top: 7px;
          color: #b1a18b;
        }

        /* =================================================
           MINI BANNER
        ================================================= */

        .pc-mini-banner {
          margin-top: 12px;

          padding: 15px;

          border:
            1px solid #eadabd;

          border-radius: 16px;

          background:
            linear-gradient(
              135deg,
              #f7edda,
              #fffaf0
            );
        }

        .pc-mini-banner-top {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .pc-mini-icon {
          width: 34px;
          height: 34px;

          display: grid;
          place-items: center;

          border-radius: 10px;

          background: #d6ba7e;
          color: white;
        }

        .pc-mini-banner h4 {
          margin: 0;

          color: #57472f;

          font-size: 10px;
          font-weight: 950;
        }

        .pc-mini-banner p {
          margin: 2px 0 0;

          color: #9b8b73;

          font-size: 7px;
        }

        .pc-mini-button {
          min-height: 31px;

          margin-top: 11px;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;

          border-radius: 10px;

          background: white;
          color: #8f6c36;

          text-decoration: none;

          font-size: 8px;
          font-weight: 950;
        }

        /* =================================================
           FINAL BANNER
        ================================================= */

        .pc-footer-banner {
          margin-top: 14px;
          padding: 22px;

          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;

          border:
            1px solid var(--pc-border);

          border-radius: 21px;

          background: white;

          box-shadow: var(--pc-shadow);
        }

        .pc-footer-info {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .pc-footer-icon {
          width: 43px;
          height: 43px;

          flex-shrink: 0;

          display: grid;
          place-items: center;

          border-radius: 13px;

          background: #f6eedf;
          color: #a17a3e;
        }

        .pc-footer-info h3 {
          margin: 0;

          color: #514435;

          font-size: 13px;
          font-weight: 950;
        }

        .pc-footer-info p {
          max-width: 620px;

          margin: 4px 0 0;

          color: #9b907f;

          font-size: 8px;
          line-height: 1.6;
        }

        /* =================================================
           ANIMATION
        ================================================= */

        .pc-reveal {
          animation:
            pcFadeUp 0.55s
              cubic-bezier(
                0.22,
                1,
                0.36,
                1
              )
            both;
        }

        @keyframes pcFadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =================================================
           MOBILE OVERLAY
        ================================================= */

        .pc-mobile-overlay {
          display: none;
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 1250px) {
          .pc-category-grid {
            grid-template-columns:
              repeat(5, 1fr);
          }

          .pc-product-grid {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .pc-smart-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        /* =================================================
           1000
        ================================================= */

        @media (max-width: 1000px) {
          .pc-sidebar {
            transform:
              translateX(-100%);
          }

          .pc-sidebar.mobile-open {
            transform:
              translateX(0);
            box-shadow:
              15px 0 40px
                rgba(64, 48, 27, 0.13);
          }

          .pc-main {
            margin-left: 0;
          }

          .pc-mobile-menu {
            display: grid;
          }

          .pc-mobile-overlay {
            position: fixed;
            inset: 0;
            z-index: 70;

            display: block;

            background:
              rgba(72, 57, 37, 0.2);

            backdrop-filter:
              blur(3px);
          }

          .pc-points-card {
            display: none;
          }

          .pc-bottom-grid {
            grid-template-columns: 1fr;
          }

          .pc-deal-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .pc-search-wrap {
            width: min(
              500px,
              60vw
            );
          }
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 700px) {
          .pc-header {
            height: 67px;
            padding: 0 14px;
            gap: 9px;
          }

          .pc-search-wrap {
            display: none;
          }

          .pc-content {
            width:
              calc(100% - 28px);

            padding-top: 20px;
          }

          .pc-welcome {
            min-height: auto;

            padding: 23px;

            border-radius: 23px;
          }

          .pc-welcome h1 {
            font-size: 29px;
            letter-spacing: -1px;
          }

          .pc-welcome-text {
            font-size: 11px;
          }

          .pc-welcome-buttons {
            flex-direction: column;
          }

          .pc-primary-button,
          .pc-secondary-button {
            width: 100%;
          }

          .pc-stats {
            grid-template-columns:
              repeat(2, 1fr);

            gap: 9px;
          }

          .pc-stat {
            padding: 13px;
          }

          .pc-stat-value {
            font-size: 18px;
          }

          .pc-smart-grid {
            grid-template-columns: 1fr;
          }

          .pc-category-grid {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .pc-product-grid {
            grid-template-columns:
              repeat(2, 1fr);

            gap: 9px;
          }

          .pc-product-image {
            height: 155px;
          }

          .pc-product-content {
            padding: 10px;
          }

          .pc-product-title {
            font-size: 10px;
          }

          .pc-product-heart {
            opacity: 1;
          }

          .pc-deals {
            padding: 17px;
            border-radius: 21px;
          }

          .pc-deal-grid {
            grid-template-columns: 1fr;
          }

          .pc-footer-banner {
            align-items: flex-start;
            flex-direction: column;
          }

          .pc-footer-banner
            .pc-primary-button {
            width: 100%;
          }

          .pc-profile-info,
          .pc-profile-button
            > svg {
            display: none;
          }
        }

        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 430px) {
          .pc-category-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .pc-product-image {
            height: 145px;
          }

          .pc-product-price strong {
            font-size: 12px;
          }

          .pc-section-heading h2 {
            font-size: 19px;
          }

          .pc-section {
            margin-top: 30px;
          }

          .pc-footer-info {
            align-items: flex-start;
          }

          .pc-footer-icon {
            display: none;
          }
        }

        /* =================================================
           REDUCED MOTION
        ================================================= */

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;

            animation-duration:
              0.01ms !important;

            animation-iteration-count:
              1 !important;

            transition-duration:
              0.01ms !important;
          }
        }
      `}</style>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileMenu && (
        <div
          className="pc-mobile-overlay"
          onClick={() =>
            setMobileMenu(false)
          }
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`pc-sidebar ${
          mobileMenu
            ? "mobile-open"
            : ""
        }`}
      >
        <div className="pc-logo-area">
          <Link
            href="/dashboard"
            className="pc-logo"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <div className="pc-logo-mark">
              <ShoppingBag size={20} />
            </div>

            <div>
              <div className="pc-logo-name">
                Prime<span>Cart</span>
              </div>

              <span className="pc-logo-subtitle">
                Shop Smarter
              </span>
            </div>
          </Link>

          <button
            className="ml-auto rounded-lg p-2 lg:hidden"
            onClick={() =>
              setMobileMenu(false)
            }
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="pc-nav">
          <p className="pc-nav-label">
            Main Menu
          </p>

          {sidebarItems.map(
            (item, index) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setMobileMenu(false)
                  }
                  className={`pc-nav-link ${
                    index === 0
                      ? "active"
                      : ""
                  }`}
                >
                  <Icon size={17} />

                  <span>
                    {item.label}
                  </span>

                  {item.label ===
                    "Wishlist" &&
                    wishlistCount > 0 && (
                      <span className="pc-nav-badge">
                        {wishlistCount}
                      </span>
                    )}
                </Link>
              );
            },
          )}

          <div
            className="my-6 h-px"
            style={{
              background:
                "#f0e8da",
            }}
          />

          <p className="pc-nav-label">
            Smart Shopping
          </p>

          {smartTools.map((tool) => {
            const Icon = tool.icon;

            return (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() =>
                  setMobileMenu(false)
                }
                className="pc-nav-link"
              >
                <Icon size={17} />

                <span>
                  {tool.title}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="pc-sidebar-bottom">
          <Link
            href="/dashboard/settings"
            className="pc-nav-link"
          >
            <Settings size={17} />
            <span>Settings</span>
          </Link>

          <button
            onClick={handleLogout}
            className="pc-nav-link w-full text-left"
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="pc-main">
        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="pc-header">
          <button
            className="pc-mobile-menu"
            onClick={() =>
              setMobileMenu(true)
            }
            aria-label="Open menu"
          >
            <Menu size={19} />
          </button>

          {/* SEARCH */}

          <div className="pc-search-wrap">
            <div className="pc-search">
              <Search
                size={16}
                color="#a09482"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                onFocus={() =>
                  setSearchFocused(true)
                }
                placeholder="Search products, brands..."
              />

              {search && (
                <button
                  onClick={() =>
                    setSearch("")
                  }
                  className="border-0 bg-transparent text-[#a09482]"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {searchFocused &&
              search.trim() && (
                <div className="pc-search-results">
                  {searchResults.length >
                  0 ? (
                    searchResults.map(
                      (product) => {
                        const image =
                          getImageUrl(
                            product.image_url,
                          );

                        return (
                          <Link
                            key={
                              product.id
                            }
                            href={`/dashboard/products/${product.id}`}
                            className="pc-search-result"
                            onClick={() =>
                              setSearchFocused(
                                false,
                              )
                            }
                          >
                            <div
                              className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[#f6f0e5]"
                            >
                              {image && (
                                <Image
                                  src={image}
                                  alt={
                                    product.name
                                  }
                                  fill
                                  sizes="40px"
                                  className="object-contain p-1"
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[10px] font-black">
                                {
                                  product.name
                                }
                              </p>

                              <p className="mt-1 text-[8px] text-[#9d917e]">
                                {product.brand ||
                                  "PrimeCart"}
                              </p>
                            </div>

                            <span className="text-[9px] font-black text-[#9a763d]">
                              {formatPrice(
                                Number(
                                  product.price,
                                ),
                              )}
                            </span>
                          </Link>
                        );
                      },
                    )
                  ) : (
                    <div className="p-7 text-center">
                      <Search
                        size={23}
                        className="mx-auto text-[#c2b5a0]"
                      />

                      <p className="mt-2 text-[10px] font-black">
                        No products found
                      </p>

                      <p className="mt-1 text-[8px] text-[#9d917e]">
                        Try another product or
                        brand.
                      </p>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* HEADER ACTIONS */}

          <div className="pc-header-actions">
            {/* Notification */}

            <div className="relative">
              <button
                className="pc-icon-button"
                onClick={() =>
                  setNotificationOpen(
                    (value) => !value,
                  )
                }
                aria-label="Notifications"
              >
                <Bell size={17} />

                <span className="pc-notification-dot" />
              </button>

              {notificationOpen && (
                <div className="pc-dropdown">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-[11px] font-black">
                      Notifications
                    </span>

                    <span className="rounded-full bg-[#f6ecd9] px-2 py-1 text-[7px] font-black text-[#99763c]">
                      NEW
                    </span>
                  </div>

                  <div className="rounded-xl bg-[#faf6ed] p-3">
                    <p className="text-[10px] font-black">
                      Welcome to PrimeCart
                    </p>

                    <p className="mt-1 text-[8px] leading-5 text-[#9a8e7c]">
                      Explore personalised
                      shopping and discover
                      products made for you.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}

            <div className="pc-profile">
              <button
                className="pc-profile-button"
                onClick={() =>
                  setProfileOpen(
                    (value) => !value,
                  )
                }
              >
                <div className="pc-avatar">
                  {getInitials(
                    userName,
                  )}
                </div>

                <div className="pc-profile-info text-left">
                  <p className="max-w-[110px] truncate text-[9px] font-black">
                    {userName}
                  </p>

                  <p className="mt-0.5 text-[7px] text-[#9e9280]">
                    Prime Member
                  </p>
                </div>

                <ChevronDown
                  size={14}
                  className="text-[#9d907e]"
                />
              </button>

              {profileOpen && (
                <div className="pc-dropdown w-[210px]">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-[9px] font-black hover:bg-[#faf6ed]"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                  >
                    <User size={15} />
                    My Profile
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-[9px] font-black hover:bg-[#faf6ed]"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                  >
                    <Settings size={15} />
                    Settings
                  </Link>

                  <div className="my-1 h-px bg-[#f0e8da]" />

                  <button
                    onClick={
                      handleLogout
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[9px] font-black text-[#a0645c] hover:bg-[#fff3f1]"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <main className="pc-content">
          {/* =================================================
              WELCOME
          ================================================= */}

          <section className="pc-welcome">
            <div className="pc-eyebrow">
              <Sparkles size={12} />

              Personal Shopping Dashboard
            </div>

            <h1>
              Good to see you,{" "}
              <span>
                {firstName}.
              </span>

              <br />

              Let&apos;s shop smarter.
            </h1>

            <p className="pc-welcome-text">
              Discover products, explore
              personalised tools, track your
              orders and make every shopping
              decision easier.
            </p>

            <div className="pc-welcome-buttons">
              <Link
                href="/dashboard/products"
                className="pc-primary-button"
              >
                Explore Products
                <ArrowRight size={14} />
              </Link>

              <Link
                href="/dashboard/prime-match"
                className="pc-secondary-button"
              >
                <Target size={14} />
                Try PrimeMatch
              </Link>
            </div>

            {/* POINTS */}

            <div className="pc-points-card">
              <div className="pc-points-top">
                <div className="pc-points-icon">
                  <Crown size={18} />
                </div>

                <span className="pc-points-label">
                  PrimePoints
                </span>
              </div>

              <div className="pc-points-number">
                {loading
                  ? "—"
                  : primePoints.toLocaleString(
                      "en-IN",
                    )}
              </div>

              <div className="pc-progress">
                <span />
              </div>

              <p className="mt-2 text-[7px] font-bold text-[#9a8c75]">
                Keep shopping to unlock more
                rewards
              </p>
            </div>
          </section>

          {/* =================================================
              STATS
          ================================================= */}

          <section className="pc-stats">
            {[
              {
                title: "Total Orders",
                value:
                  orders.length,
                text: "All shopping orders",
                icon: Package,
              },
              {
                title: "Wishlist",
                value:
                  wishlistCount,
                text: "Saved products",
                icon: Heart,
              },
              {
                title: "Total Spent",
                value:
                  formatPrice(
                    totalSpent,
                  ),
                text: "Shopping total",
                icon: CircleDollarSign,
              },
              {
                title: "PrimePoints",
                value:
                  primePoints,
                text: "Reward balance",
                icon: Crown,
              },
            ].map(
              (stat, index) => {
                const Icon =
                  stat.icon;

                return (
                  <div
                    key={
                      stat.title
                    }
                    className="pc-stat pc-reveal"
                    style={{
                      animationDelay:
                        `${index * 70}ms`,
                    }}
                  >
                    <div className="pc-stat-icon">
                      <Icon size={18} />
                    </div>

                    <p className="pc-stat-label">
                      {stat.title}
                    </p>

                    <p className="pc-stat-value">
                      {loading
                        ? "—"
                        : stat.value}
                    </p>

                    <p className="pc-stat-sub">
                      {stat.text}
                    </p>
                  </div>
                );
              },
            )}
          </section>

          {/* =================================================
              SMART TOOLS
          ================================================= */}

          <section className="pc-section">
            <div className="pc-section-heading">
              <div>
                <p className="pc-section-kicker">
                  Intelligent Shopping
                </p>

                <h2>
                  Shop smarter
                </h2>
              </div>

              <span className="hidden text-[8px] font-bold text-[#a09483] sm:block">
                Tools designed for better
                decisions
              </span>
            </div>

            <div className="pc-smart-grid">
              {smartTools.map(
                (tool, index) => {
                  const Icon =
                    tool.icon;

                  return (
                    <Link
                      key={
                        tool.href
                      }
                      href={
                        tool.href
                      }
                      className="pc-smart-card pc-reveal"
                      style={{
                        animationDelay:
                          `${index * 70}ms`,
                      }}
                    >
                      <div className="pc-smart-top">
                        <div className="pc-smart-icon">
                          <Icon size={19} />
                        </div>

                        <span className="pc-smart-tag">
                          {tool.label}
                        </span>
                      </div>

                      <h3>
                        {tool.title}
                      </h3>

                      <p>
                        {
                          tool.description
                        }
                      </p>

                      <span className="pc-smart-link">
                        Explore
                        <ArrowRight
                          size={12}
                        />
                      </span>
                    </Link>
                  );
                },
              )}
            </div>
          </section>

          {/* =================================================
              CATEGORIES
          ================================================= */}

          <section className="pc-section">
            <div className="pc-section-heading">
              <div>
                <p className="pc-section-kicker">
                  Browse Collection
                </p>

                <h2>
                  Shop by category
                </h2>
              </div>

              <Link
                href="/dashboard/categories"
                className="pc-view-all"
              >
                View all
                <ChevronRight
                  size={13}
                />
              </Link>
            </div>

            {categories.length >
            0 ? (
              <div className="pc-category-grid">
                {categories
                  .slice(0, 10)
                  .map(
                    (
                      category,
                    ) => (
                      <Link
                        key={
                          category.id
                        }
                        href={`/dashboard/categories/${category.slug}`}
                        className="pc-category"
                      >
                        <div className="pc-category-icon">
                          {categoryIcons[
                            category
                              .slug
                          ] ||
                            "🛍️"}
                        </div>

                        <span className="pc-category-name">
                          {
                            category.name
                          }
                        </span>
                      </Link>
                    ),
                  )}
              </div>
            ) : (
              <div className="pc-panel py-10 text-center">
                <ShoppingBag
                  size={28}
                  className="mx-auto text-[#c3b49d]"
                />

                <p className="mt-3 text-[10px] font-black">
                  No categories available
                </p>
              </div>
            )}
          </section>

          {/* =================================================
              FEATURED PRODUCTS
          ================================================= */}

          <section className="pc-section">
            <div className="pc-section-heading">
              <div>
                <p className="pc-section-kicker">
                  Curated Collection
                </p>

                <h2>
                  Featured products
                </h2>
              </div>

              <Link
                href="/dashboard/products"
                className="pc-view-all"
              >
                View all products
                <ArrowRight
                  size={13}
                />
              </Link>
            </div>

            {featuredProducts.length >
            0 ? (
              <div className="pc-product-grid">
                {featuredProducts.map(
                  (
                    product,
                    index,
                  ) => {
                    const image =
                      getImageUrl(
                        product.image_url,
                      );

                    const discount =
                      discountPercentage(
                        Number(
                          product.price,
                        ),
                        product.original_price
                          ? Number(
                              product.original_price,
                            )
                          : null,
                      );

                    return (
                      <Link
                        key={
                          product.id
                        }
                        href={`/dashboard/products/${product.id}`}
                        className="pc-product pc-reveal"
                        style={{
                          animationDelay:
                            `${index * 55}ms`,
                        }}
                      >
                        {/* IMAGE */}

                        <div className="pc-product-image">
                          {image ? (
                            <Image
                              src={
                                image
                              }
                              alt={
                                product.name
                              }
                              fill
                              sizes="
                                (max-width: 430px) 50vw,
                                (max-width: 700px) 50vw,
                                (max-width: 1250px) 33vw,
                                16vw
                              "
                              className="object-contain"
                              priority={
                                index <
                                2
                              }
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#b7aa96]">
                              <ShoppingBag
                                size={
                                  30
                                }
                              />
                            </div>
                          )}

                          {discount >
                            0 && (
                            <span className="pc-discount">
                              -
                              {
                                discount
                              }
                              %
                            </span>
                          )}

                          <button
                            className="pc-product-heart"
                            onClick={(
                              event,
                            ) =>
                              event.preventDefault()
                            }
                            aria-label="Wishlist"
                          >
                            <Heart
                              size={
                                14
                              }
                            />
                          </button>
                        </div>

                        {/* CONTENT */}

                        <div className="pc-product-content">
                          <p className="pc-product-brand">
                            {product.brand ||
                              "PrimeCart"}
                          </p>

                          <h3 className="pc-product-title">
                            {
                              product.name
                            }
                          </h3>

                          <div className="pc-rating">
                            <Star
                              size={
                                10
                              }
                            />

                            {Number(
                              product.rating ||
                                0,
                            ).toFixed(
                              1,
                            )}

                            <span className="text-[#a69a89]">
                              (
                              {
                                product.reviews_count ||
                                0
                              }
                              )
                            </span>
                          </div>

                          <div className="pc-product-price">
                            <strong>
                              {formatPrice(
                                Number(
                                  product.price,
                                ),
                              )}
                            </strong>

                            {product.original_price &&
                              Number(
                                product.original_price,
                              ) >
                                Number(
                                  product.price,
                                ) && (
                                <del>
                                  {formatPrice(
                                    Number(
                                      product.original_price,
                                    ),
                                  )}
                                </del>
                              )}
                          </div>
                        </div>
                      </Link>
                    );
                  },
                )}
              </div>
            ) : (
              <div className="pc-panel py-12 text-center">
                <ShoppingBag
                  size={28}
                  className="mx-auto text-[#c3b49d]"
                />

                <p className="mt-3 text-[10px] font-black">
                  No products available yet.
                </p>

                <p className="mt-1 text-[8px] text-[#a29786]">
                  Add products from your
                  Supabase database.
                </p>
              </div>
            )}
          </section>

          {/* =================================================
              FLASH DEALS
          ================================================= */}

          <section className="pc-section">
            <div className="pc-deals">
              <div className="pc-section-heading mb-0">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap
                      size={13}
                      className="text-[#b18a49]"
                      fill="currentColor"
                    />

                    <p className="pc-section-kicker">
                      Limited Time
                    </p>
                  </div>

                  <h2>
                    Flash deals
                  </h2>
                </div>

                <Link
                  href="/dashboard/products"
                  className="pc-view-all"
                >
                  Explore deals
                  <ArrowRight
                    size={13}
                  />
                </Link>
              </div>

              {flashProducts.length >
              0 ? (
                <div className="pc-deal-grid">
                  {flashProducts.map(
                    (product) => {
                      const image =
                        getImageUrl(
                          product.image_url,
                        );

                      const discount =
                        discountPercentage(
                          Number(
                            product.price,
                          ),
                          product.original_price
                            ? Number(
                                product.original_price,
                              )
                            : null,
                        );

                      return (
                        <Link
                          key={
                            product.id
                          }
                          href={`/dashboard/products/${product.id}`}
                          className="pc-deal"
                        >
                          <div className="pc-deal-image">
                            {image ? (
                              <Image
                                src={
                                  image
                                }
                                alt={
                                  product.name
                                }
                                fill
                                sizes="70px"
                                className="object-contain"
                              />
                            ) : (
                              <ShoppingBag
                                size={
                                  22
                                }
                                className="text-[#b7aa96]"
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="pc-deal-label">
                              <Zap
                                size={
                                  9
                                }
                              />

                              {discount >
                              0
                                ? `${discount}% OFF`
                                : "DEAL"}
                            </div>

                            <p className="pc-deal-title">
                              {
                                product.name
                              }
                            </p>

                            <p className="pc-deal-price">
                              {formatPrice(
                                Number(
                                  product.price,
                                ),
                              )}
                            </p>
                          </div>
                        </Link>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Zap
                    size={26}
                    className="mx-auto text-[#c3b49d]"
                  />

                  <p className="mt-2 text-[10px] font-black">
                    No deals available
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              ORDERS + QUICK ACTIONS
          ================================================= */}

          <section className="pc-section pc-bottom-grid">
            {/* ORDERS */}

            <div className="pc-panel">
              <div className="pc-section-heading mb-0">
                <div>
                  <p className="pc-section-kicker">
                    Activity
                  </p>

                  <h2>
                    Recent orders
                  </h2>
                </div>

                <Link
                  href="/dashboard/orders"
                  className="pc-view-all"
                >
                  View all
                </Link>
              </div>

              <div className="pc-orders">
                {orders.length >
                0 ? (
                  orders
                    .slice(0, 5)
                    .map(
                      (order) => (
                        <div
                          key={
                            order.id
                          }
                          className="pc-order"
                        >
                          <div className="pc-order-icon">
                            {order.status
                              ?.toLowerCase()
                              .includes(
                                "deliver",
                              ) ? (
                              <ShieldCheck
                                size={
                                  16
                                }
                              />
                            ) : (
                              <Truck
                                size={
                                  16
                                }
                              />
                            )}
                          </div>

                          <div className="pc-order-info">
                            <p className="pc-order-title">
                              Order #
                              {order.id.slice(
                                0,
                                8,
                              )}
                            </p>

                            <div className="pc-order-meta">
                              <span>
                                {formatDate(
                                  order.created_at,
                                )}
                              </span>

                              <span>
                                •
                              </span>

                              <span className="pc-order-status">
                                {order.status ||
                                  "Processing"}
                              </span>
                            </div>
                          </div>

                          <span className="pc-order-price">
                            {formatPrice(
                              Number(
                                order.total_amount ||
                                  0,
                              ),
                            )}
                          </span>
                        </div>
                      ),
                    )
                ) : (
                  <div className="py-12 text-center">
                    <Package
                      size={25}
                      className="mx-auto text-[#c3b49d]"
                    />

                    <p className="mt-3 text-[10px] font-black">
                      No orders yet
                    </p>

                    <p className="mt-1 text-[8px] text-[#a29786]">
                      Your orders will
                      appear here.
                    </p>

                    <Link
                      href="/dashboard/products"
                      className="pc-primary-button mx-auto mt-4"
                    >
                      Start Shopping
                      <ArrowRight
                        size={12}
                      />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* QUICK ACTIONS */}

            <div className="pc-panel">
              <div>
                <p className="pc-section-kicker">
                  Shortcuts
                </p>

                <h2 className="mt-1 text-[20px] font-black text-[#4c4133]">
                  Quick actions
                </h2>
              </div>

              <div className="pc-quick-grid">
                {[
                  {
                    title:
                      "Browse Products",
                    href:
                      "/dashboard/products",
                    icon:
                      ShoppingCart,
                  },
                  {
                    title:
                      "My Wishlist",
                    href:
                      "/dashboard/wishlist",
                    icon: Heart,
                  },
                  {
                    title:
                      "My Orders",
                    href:
                      "/dashboard/orders",
                    icon:
                      Package,
                  },
                  {
                    title:
                      "My Profile",
                    href:
                      "/dashboard/profile",
                    icon: User,
                  },
                ].map(
                  (action) => {
                    const Icon =
                      action.icon;

                    return (
                      <Link
                        key={
                          action.href
                        }
                        href={
                          action.href
                        }
                        className="pc-quick"
                      >
                        <div className="pc-quick-icon">
                          <Icon
                            size={
                              15
                            }
                          />
                        </div>

                        <p>
                          {
                            action.title
                          }
                        </p>

                        <ArrowRight
                          size={
                            11
                          }
                        />
                      </Link>
                    );
                  },
                )}
              </div>

              <div className="pc-mini-banner">
                <div className="pc-mini-banner-top">
                  <div className="pc-mini-icon">
                    <Sparkles
                      size={
                        15
                      }
                    />
                  </div>

                  <div>
                    <h4>
                      Personalised
                      shopping
                    </h4>

                    <p>
                      Powered by PrimeCart
                      smart tools
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard/prime-match"
                  className="pc-mini-button"
                >
                  Find My Match
                  <ArrowRight
                    size={10}
                  />
                </Link>
              </div>
            </div>
          </section>

          {/* =================================================
              FINAL BANNER
          ================================================= */}

          <section className="pc-footer-banner">
            <div className="pc-footer-info">
              <div className="pc-footer-icon">
                <ShieldCheck
                  size={20}
                />
              </div>

              <div>
                <h3>
                  A smarter way to shop
                </h3>

                <p>
                  Discover products, compare
                  options, manage your wishlist
                  and make better shopping
                  decisions with PrimeCart.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/products"
              className="pc-primary-button"
            >
              Start Shopping
              <ArrowRight
                size={13}
              />
            </Link>
          </section>

          {/* =================================================
              FOOTER
          ================================================= */}

          <footer className="py-8 text-center">
            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#aaa090]">
              ©{" "}
              {new Date().getFullYear()}{" "}
              PrimeCart · Shop Smarter
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
