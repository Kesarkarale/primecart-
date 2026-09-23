"use client";

import { createClient } from "@/lib/supabase/client";
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
description: "Find products matched to your needs.",
href: "/dashboard/prime-match",
icon: Target,
label: "SMART MATCH",
},
{
title: "Budget Builder",
description: "Plan your shopping without overspending.",
href: "/dashboard/budget-builder",
icon: WalletCards,
label: "BUDGET",
},
{
title: "Setup Builder",
description: "Create a complete setup from scratch.",
href: "/dashboard/setup-builder",
icon: Sparkles,
label: "CURATED",
},
{
title: "PrimePoints",
description: "Track your rewards and shopping points.",
href: "/dashboard/prime-points",
icon: Crown,
label: "REWARDS",
},
];

function getImageUrl(value: string | null) {
if (!value) return null;

const image = value.trim();

if (!image) return null;

if (
image.startsWith("http://") ||
image.startsWith("https://") ||
image.startsWith("/")
) {
return image;
}

return `/${image}`;
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
originalPrice: number | null,
) {
if (!originalPrice || originalPrice <= price) return 0;

return Math.round(
((originalPrice - price) / originalPrice) * 100,
);
}

function getInitials(name: string) {
const parts = name
.split(" ")
.filter(Boolean)
.slice(0, 2);

return (
parts.map((part) => part[0]?.toUpperCase()).join("") || "P"
);
}

function formatDate(value: string) {
return new Date(value).toLocaleDateString("en-IN", {
day: "2-digit",
month: "short",
year: "numeric",
});
}

function ImageFallback({
src,
alt,
className = "",
}: {
src: string | null;
alt: string;
className?: string;
}) {
const [failed, setFailed] = useState(false);

if (!src || failed) {
return (
<div className={`pc-image-fallback ${className}`}> <ShoppingBag size={28} /> <span>Image unavailable</span> </div>
);
}

return (
<img
src={src}
alt={alt}
className={className}
onError={() => setFailed(true)}
/>
);
}

export default function DashboardPage() {
const supabase = createClient();

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

useEffect(() => {
let mounted = true;

```
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

    if (profileResult.error) {
      console.error(
        "Profile error:",
        profileResult.error,
      );
    }

    if (productsResult.error) {
      console.error(
        "Products error:",
        productsResult.error,
      );
    }

    if (categoriesResult.error) {
      console.error(
        "Categories error:",
        categoriesResult.error,
      );
    }

    if (ordersResult.error) {
      console.error(
        "Orders error:",
        ordersResult.error,
      );
    }

    setProfile(
      profileResult.data ?? {
        full_name:
          user.user_metadata?.full_name ??
          user.email?.split("@")[0] ??
          "PrimeCart User",
        email: user.email ?? "",
      },
    );

    setProducts(
      (productsResult.data ?? []) as Product[],
    );

    setCategories(
      (categoriesResult.data ?? []) as Category[],
    );

    setOrders(
      (ordersResult.data ?? []) as Order[],
    );

    setWishlistCount(
      wishlistResult.data?.length ?? 0,
    );
  } catch (error) {
    console.error(
      "Dashboard loading error:",
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
  .filter(
    (product) =>
      product.name
        .toLowerCase()
        .includes(value) ||
      product.brand
        ?.toLowerCase()
        .includes(value),
  )
  .slice(0, 6);
 

}, [products, search]);

const totalSpent = useMemo(
() =>
orders.reduce(
(total, order) =>
total +
Number(order.total_amount || 0),
0,
),
[orders],
);

const primePoints = Math.floor(
totalSpent / 10,
);

const userName =
profile?.full_name?.trim() ||
profile?.email?.split("@")[0] ||
"PrimeCart User";

const firstName =
userName.split(" ")[0] || "there";

async function handleLogout() {
await supabase.auth.signOut();
window.location.replace("/auth/login");
}

return ( <div className="prime-dashboard"> <style jsx global>{`
* {
box-sizing: border-box;
}
 
    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      background: #faf8f3;
    }

    :root {
      --pc-bg: #faf8f3;
      --pc-white: #ffffff;
      --pc-soft: #f8f3e9;
      --pc-soft-2: #f3ead9;
      --pc-gold: #b88d45;
      --pc-gold-2: #d4b36f;
      --pc-gold-3: #ead9b5;
      --pc-text: #40362b;
      --pc-text-2: #706454;
      --pc-muted: #9e9382;
      --pc-border: #e8decc;
      --pc-border-2: #f0e8da;
      --pc-shadow:
        0 10px 35px rgba(78, 59, 31, 0.07);
      --pc-shadow-hover:
        0 18px 48px rgba(78, 59, 31, 0.13);
    }

    .prime-dashboard {
      min-height: 100vh;
      background:
        radial-gradient(
          circle at 85% 0%,
          rgba(214, 178, 107, 0.13),
          transparent 24%
        ),
        radial-gradient(
          circle at 10% 45%,
          rgba(221, 195, 145, 0.08),
          transparent 22%
        ),
        var(--pc-bg);
      color: var(--pc-text);
    }

    /* =========================
       SIDEBAR
    ========================= */

    .pc-sidebar {
      position: fixed;
      inset: 0 auto 0 0;
      z-index: 70;
      width: 258px;
      display: flex;
      flex-direction: column;
      background: rgba(255, 255, 255, 0.94);
      border-right: 1px solid var(--pc-border);
      backdrop-filter: blur(20px);
      transition:
        transform 0.35s cubic-bezier(.22,1,.36,1);
    }

    .pc-logo-area {
      height: 78px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid var(--pc-border-2);
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
      border-radius: 14px;
      color: white;
      background:
        linear-gradient(
          145deg,
          #d8bd82,
          #a77b38
        );
      box-shadow:
        0 9px 22px
        rgba(176, 134, 63, 0.24);
      animation: logoPulse 3s ease-in-out infinite;
    }

    @keyframes logoPulse {
      0%,
      100% {
        transform: translateY(0);
      }

      50% {
        transform: translateY(-2px);
      }
    }

    .pc-logo-name {
      font-size: 19px;
      line-height: 1;
      font-weight: 950;
      letter-spacing: -0.7px;
    }

    .pc-logo-name span {
      color: var(--pc-gold);
    }

    .pc-logo-subtitle {
      display: block;
      margin-top: 4px;
      color: var(--pc-muted);
      font-size: 7px;
      font-weight: 900;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .pc-nav {
      flex: 1;
      overflow-y: auto;
      padding: 22px 12px;
    }

    .pc-nav-label {
      margin: 0 10px 10px;
      color: #aaa092;
      font-size: 8px;
      font-weight: 950;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .pc-nav-link {
      position: relative;
      width: 100%;
      min-height: 45px;
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 0 13px;
      margin-bottom: 4px;
      border: 0;
      border-radius: 13px;
      background: transparent;
      color: var(--pc-text-2);
      text-decoration: none;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      transition:
        transform 0.2s ease,
        background 0.2s ease,
        color 0.2s ease;
    }

    .pc-nav-link:hover {
      color: var(--pc-text);
      background: #faf6ed;
      transform: translateX(3px);
    }

    .pc-nav-link.active {
      color: #8b6832;
      background:
        linear-gradient(
          100deg,
          #f5ead3,
          #fcf8ef
        );
      box-shadow:
        inset 0 0 0 1px #ead8b5;
    }

    .pc-nav-link.active::before {
      content: "";
      position: absolute;
      left: 0;
      width: 3px;
      height: 21px;
      border-radius: 0 5px 5px 0;
      background: var(--pc-gold);
    }

    .pc-nav-badge {
      min-width: 20px;
      height: 20px;
      margin-left: auto;
      padding: 0 6px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      background: #f2e5c9;
      color: #8d6a34;
      font-size: 8px;
      font-weight: 950;
    }

    .pc-sidebar-bottom {
      padding: 12px;
      border-top: 1px solid var(--pc-border-2);
    }

    /* =========================
       MAIN / HEADER
    ========================= */

    .pc-main {
      min-height: 100vh;
      margin-left: 258px;
    }

    .pc-header {
      position: sticky;
      top: 0;
      z-index: 50;
      height: 74px;
      padding: 0 28px;
      display: flex;
      align-items: center;
      gap: 16px;
      background:
        rgba(250, 248, 243, 0.84);
      border-bottom: 1px solid
        rgba(232, 222, 204, 0.85);
      backdrop-filter: blur(18px);
    }

    .pc-search-wrap {
      position: relative;
      width: min(510px, 55vw);
    }

    .pc-search {
      height: 44px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 14px;
      border: 1px solid var(--pc-border);
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.9);
      transition:
        border 0.2s ease,
        box-shadow 0.2s ease;
    }

    .pc-search:focus-within {
      border-color: #d1b276;
      box-shadow:
        0 0 0 4px
        rgba(184, 141, 69, 0.09);
    }

    .pc-search input {
      width: 100%;
      border: 0;
      outline: 0;
      background: transparent;
      color: var(--pc-text);
      font-size: 12px;
      font-weight: 650;
    }

    .pc-search input::placeholder {
      color: #aaa092;
    }

    .pc-search-results {
      position: absolute;
      top: 52px;
      left: 0;
      right: 0;
      padding: 7px;
      border: 1px solid var(--pc-border);
      border-radius: 17px;
      background: white;
      box-shadow:
        0 25px 65px
        rgba(68, 51, 28, 0.14);
      animation: searchDrop 0.22s
        cubic-bezier(.22,1,.36,1);
    }

    @keyframes searchDrop {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.98);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .pc-search-result {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      border-radius: 11px;
      color: var(--pc-text);
      text-decoration: none;
      transition: background 0.18s ease;
    }

    .pc-search-result:hover {
      background: #faf6ed;
    }

    .pc-search-result-image {
      position: relative;
      width: 42px;
      height: 42px;
      flex-shrink: 0;
      overflow: hidden;
      border-radius: 10px;
      background: #f6f0e5;
    }

    .pc-search-result-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
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
      border: 1px solid var(--pc-border);
      border-radius: 13px;
      background: white;
      color: var(--pc-text-2);
      cursor: pointer;
      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        border 0.2s ease;
    }

    .pc-icon-button:hover {
      transform: translateY(-2px);
      border-color: #d4ba82;
      box-shadow: var(--pc-shadow);
    }

    .pc-notification-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #bf8f3f;
      box-shadow: 0 0 0 3px white;
      animation: notificationPulse 2s infinite;
    }

    @keyframes notificationPulse {
      0%,
      100% {
        box-shadow: 0 0 0 3px white;
      }

      50% {
        box-shadow:
          0 0 0 6px
          rgba(191, 143, 63, 0.12);
      }
    }

    .pc-dropdown {
      position: absolute;
      right: 0;
      top: 50px;
      width: 285px;
      padding: 8px;
      border: 1px solid var(--pc-border);
      border-radius: 17px;
      background: white;
      box-shadow:
        0 25px 60px
        rgba(67, 50, 27, 0.14);
      animation: dropdownIn 0.2s
        cubic-bezier(.22,1,.36,1);
    }

    @keyframes dropdownIn {
      from {
        opacity: 0;
        transform: translateY(-7px) scale(0.97);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .pc-profile {
      position: relative;
    }

    .pc-profile-button {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 4px 9px 4px 4px;
      border: 1px solid var(--pc-border);
      border-radius: 14px;
      background: white;
      color: var(--pc-text);
      cursor: pointer;
    }

    .pc-avatar {
      width: 35px;
      height: 35px;
      display: grid;
      place-items: center;
      border-radius: 11px;
      background:
        linear-gradient(
          145deg,
          #d7bc83,
          #a77c3e
        );
      color: white;
      font-size: 10px;
      font-weight: 950;
    }

    /* =========================
       CONTENT
    ========================= */

    .pc-content {
      width: min(
        1420px,
        calc(100% - 54px)
      );
      margin: auto;
      padding: 30px 0 50px;
    }

    .pc-welcome {
      position: relative;
      overflow: hidden;
      min-height: 292px;
      padding: 36px;
      border: 1px solid #e7d6b3;
      border-radius: 28px;
      background:
        radial-gradient(
          circle at 88% 18%,
          rgba(202, 167, 100, 0.25),
          transparent 29%
        ),
        linear-gradient(
          125deg,
          #fffdf9,
          #f9f0df 55%,
          #f3e6cc
        );
      box-shadow: var(--pc-shadow);
      animation: heroIn 0.7s
        cubic-bezier(.22,1,.36,1);
    }

    @keyframes heroIn {
      from {
        opacity: 0;
        transform: translateY(15px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .pc-welcome::after {
      content: "";
      position: absolute;
      right: -100px;
      bottom: -110px;
      width: 300px;
      height: 300px;
      border: 1px solid
        rgba(180, 140, 72, 0.15);
      border-radius: 50%;
      box-shadow:
        0 0 0 28px
        rgba(180, 140, 72, 0.035),
        0 0 0 58px
        rgba(180, 140, 72, 0.025);
      pointer-events: none;
    }

    .pc-eyebrow {
      position: relative;
      z-index: 2;
      width: fit-content;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 7px 11px;
      border: 1px solid #e5d2aa;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.58);
      color: #97733a;
      font-size: 8px;
      font-weight: 950;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      animation: fadeUp 0.6s 0.1s both;
    }

    .pc-welcome h1 {
      position: relative;
      z-index: 2;
      max-width: 700px;
      margin: 17px 0 0;
      color: #44382a;
      font-size: clamp(
        30px,
        4vw,
        48px
      );
      line-height: 1.04;
      letter-spacing: -2px;
      font-weight: 950;
      animation: fadeUp 0.65s 0.16s both;
    }

    .pc-welcome h1 span {
      color: #b48642;
    }

    .pc-welcome-text {
      position: relative;
      z-index: 2;
      max-width: 650px;
      margin: 15px 0 0;
      color: #857664;
      font-size: 13px;
      line-height: 1.75;
      animation: fadeUp 0.65s 0.22s both;
    }

    .pc-welcome-buttons {
      position: relative;
      z-index: 2;
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
      margin-top: 24px;
      animation: fadeUp 0.65s 0.28s both;
    }

    @keyframes fadeUp {
      from {
        opacity: 0;
        transform: translateY(12px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .pc-primary-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 43px;
      padding: 0 17px;
      border: 0;
      border-radius: 13px;
      background:
        linear-gradient(
          135deg,
          #c8a45f,
          #a67b3b
        );
      color: white;
      text-decoration: none;
      font-size: 11px;
      font-weight: 950;
      box-shadow:
        0 10px 24px
        rgba(160, 120, 55, 0.19);
      transition:
        transform 0.22s ease,
        box-shadow 0.22s ease;
    }

    .pc-primary-button:hover {
      transform: translateY(-3px);
      box-shadow:
        0 15px 30px
        rgba(160, 120, 55, 0.25);
    }

    .pc-secondary-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 43px;
      padding: 0 17px;
      border: 1px solid #dfceae;
      border-radius: 13px;
      background: rgba(255, 255, 255, 0.66);
      color: #80643a;
      text-decoration: none;
      font-size: 11px;
      font-weight: 950;
      transition:
        transform 0.22s ease,
        background 0.22s ease;
    }

    .pc-secondary-button:hover {
      background: white;
      transform: translateY(-3px);
    }

    .pc-points-card {
      position: absolute;
      z-index: 3;
      top: 34px;
      right: 34px;
      width: 235px;
      padding: 19px;
      border: 1px solid
        rgba(255, 255, 255, 0.82);
      border-radius: 21px;
      background:
        rgba(255, 255, 255, 0.62);
      box-shadow:
        0 22px 45px
        rgba(110, 80, 35, 0.09);
      backdrop-filter: blur(15px);
      animation:
        cardFloat 4s ease-in-out
        infinite,
        fadeIn 0.7s 0.3s both;
    }

    @keyframes cardFloat {
      0%,
      100% {
        transform: translateY(0);
      }

      50% {
        transform: translateY(-7px);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }

      to {
        opacity: 1;
      }
    }

    .pc-points-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .pc-points-icon {
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: #f1e2c2;
      color: #a27a38;
    }

    .pc-points-label {
      color: #9b7d51;
      font-size: 8px;
      font-weight: 950;
      letter-spacing: 0.13em;
      text-transform: uppercase;
    }

    .pc-points-number {
      margin-top: 13px;
      color: #463725;
      font-size: 28px;
      font-weight: 950;
    }

    .pc-progress {
      height: 5px;
      margin-top: 14px;
      overflow: hidden;
      border-radius: 999px;
      background: #e8ddca;
    }

    .pc-progress span {
      display: block;
      width: 64%;
      height: 100%;
      border-radius: inherit;
      background:
        linear-gradient(
          90deg,
          #c9a45f,
          #9e743b
        );
      animation: progressIn 1.1s
        cubic-bezier(.22,1,.36,1);
    }

    @keyframes progressIn {
      from {
        width: 0;
      }

      to {
        width: 64%;
      }
    }

    /* =========================
       STATS
    ========================= */

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
      border: 1px solid var(--pc-border);
      border-radius: 18px;
      background: white;
      box-shadow: var(--pc-shadow);
      animation: statIn 0.55s
        cubic-bezier(.22,1,.36,1)
        both;
      transition:
        transform 0.25s ease,
        box-shadow 0.25s ease,
        border 0.25s ease;
    }

    .pc-stat:nth-child(1) {
      animation-delay: 0.12s;
    }

    .pc-stat:nth-child(2) {
      animation-delay: 0.19s;
    }

    .pc-stat:nth-child(3) {
      animation-delay: 0.26s;
    }

    .pc-stat:nth-child(4) {
      animation-delay: 0.33s;
    }

    @keyframes statIn {
      from {
        opacity: 0;
        transform: translateY(14px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .pc-stat:hover {
      transform: translateY(-5px);
      border-color: #dbc597;
      box-shadow: var(--pc-shadow-hover);
    }

    .pc-stat::after {
      content: "";
      position: absolute;
      right: -32px;
      bottom: -42px;
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
      transition:
        transform 0.25s ease,
        background 0.25s ease;
    }

    .pc-stat:hover .pc-stat-icon {
      transform: scale(1.08)
        rotate(-3deg);
      background: #b9975b;
      color: white;
    }

    .pc-stat-label {
      margin: 14px 0 0;
      color: #998d7b;
      font-size: 9px;
      font-weight: 850;
    }

    .pc-stat-value {
      margin: 4px 0 0;
      color: #4a4034;
      font-size: 22px;
      font-weight: 950;
      letter-spacing: -0.5px;
    }

    .pc-stat-sub {
      margin: 3px 0 0;
      color: #aaa091;
      font-size: 8px;
      font-weight: 650;
    }

    /* =========================
       SECTIONS
    ========================= */

    .pc-section {
      margin-top: 38px;
    }

    .pc-section-heading {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 15px;
      margin-bottom: 17px;
    }

    .pc-section-kicker {
      margin: 0;
      color: #b18a4b;
      font-size: 8px;
      font-weight: 950;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .pc-section-heading h2 {
      margin: 5px 0 0;
      color: #493e31;
      font-size: 23px;
      line-height: 1.15;
      font-weight: 950;
      letter-spacing: -0.7px;
    }

    .pc-view-all {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #987139;
      text-decoration: none;
      font-size: 9px;
      font-weight: 950;
      white-space: nowrap;
      transition:
        transform 0.2s ease,
        color 0.2s ease;
    }

    .pc-view-all:hover {
      color: #765623;
      transform: translateX(3px);
    }

    /* =========================
       SMART TOOLS
    ========================= */

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
      border: 1px solid var(--pc-border);
      border-radius: 20px;
      background: white;
      color: var(--pc-text);
      text-decoration: none;
      box-shadow: var(--pc-shadow);
      animation: cardReveal 0.6s
        cubic-bezier(.22,1,.36,1)
        both;
      transition:
        transform 0.25s ease,
        border 0.25s ease,
        box-shadow 0.25s ease;
    }

    .pc-smart-card:nth-child(1) {
      animation-delay: 0.1s;
    }

    .pc-smart-card:nth-child(2) {
      animation-delay: 0.17s;
    }

    .pc-smart-card:nth-child(3) {
      animation-delay: 0.24s;
    }

    .pc-smart-card:nth-child(4) {
      animation-delay: 0.31s;
    }

    @keyframes cardReveal {
      from {
        opacity: 0;
        transform: translateY(14px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .pc-smart-card::before {
      content: "";
      position: absolute;
      right: -58px;
      top: -58px;
      width: 135px;
      height: 135px;
      border-radius: 50%;
      background:
        rgba(185, 151, 91, 0.07);
      transition:
        transform 0.45s ease;
    }

    .pc-smart-card:hover {
      transform: translateY(-6px);
      border-color: #d8c092;
      box-shadow: var(--pc-shadow-hover);
    }

    .pc-smart-card:hover::before {
      transform: scale(1.5);
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
      transition:
        transform 0.25s ease,
        background 0.25s ease;
    }

    .pc-smart-card:hover
      .pc-smart-icon {
      transform: scale(1.08)
        rotate(-4deg);
      background: #b9975b;
      color: white;
    }

    .pc-smart-tag {
      padding: 5px 7px;
      border-radius: 999px;
      background: #fbf5e8;
      color: #a17b40;
      font-size: 7px;
      font-weight: 950;
      letter-spacing: 0.11em;
    }

    .pc-smart-card h3 {
      position: relative;
      margin: 18px 0 0;
      font-size: 14px;
      font-weight: 950;
    }

    .pc-smart-card p {
      position: relative;
      min-height: 36px;
      margin: 6px 0 0;
      color: #978b7b;
      font-size: 10px;
      line-height: 1.7;
    }

    .pc-smart-link {
      position: relative;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 14px;
      color: #a17b40;
      font-size: 9px;
      font-weight: 950;
    }

    /* =========================
       CATEGORIES
    ========================= */

    .pc-category-grid {
      display: grid;
      grid-template-columns:
        repeat(10, 1fr);
      gap: 9px;
    }

    .pc-category {
      min-height: 106px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px 5px;
      border: 1px solid var(--pc-border);
      border-radius: 17px;
      background: white;
      color: var(--pc-text);
      text-decoration: none;
      text-align: center;
      box-shadow:
        0 5px 18px
        rgba(113, 91, 53, 0.035);
      animation: categoryIn 0.5s
        cubic-bezier(.22,1,.36,1)
        both;
      transition:
        transform 0.22s ease,
        border 0.22s ease,
        box-shadow 0.22s ease;
    }

    .pc-category:nth-child(1) {
      animation-delay: 0.05s;
    }

    .pc-category:nth-child(2) {
      animation-delay: 0.09s;
    }

    .pc-category:nth-child(3) {
      animation-delay: 0.13s;
    }

    .pc-category:nth-child(4) {
      animation-delay: 0.17s;
    }

    .pc-category:nth-child(5) {
      animation-delay: 0.21s;
    }

    .pc-category:nth-child(6) {
      animation-delay: 0.25s;
    }

    .pc-category:nth-child(7) {
      animation-delay: 0.29s;
    }

    .pc-category:nth-child(8) {
      animation-delay: 0.33s;
    }

    .pc-category:nth-child(9) {
      animation-delay: 0.37s;
    }

    .pc-category:nth-child(10) {
      animation-delay: 0.41s;
    }

    @keyframes categoryIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .pc-category:hover {
      transform: translateY(-5px);
      border-color: #d8bf91;
      box-shadow: var(--pc-shadow);
    }

    .pc-category-icon {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      background: #faf4e8;
      font-size: 20px;
      transition:
        transform 0.25s ease,
        background 0.25s ease;
    }

    .pc-category:hover
      .pc-category-icon {
      transform: scale(1.12)
        rotate(-3deg);
      background: #f4e7cb;
    }

    .pc-category-name {
      margin-top: 9px;
      font-size: 9px;
      line-height: 1.3;
      font-weight: 900;
    }

    /* =========================
       PRODUCTS
    ========================= */

    .pc-product-grid {
      display: grid;
      grid-template-columns:
        repeat(6, 1fr);
      gap: 13px;
    }

    .pc-product {
      overflow: hidden;
      border: 1px solid var(--pc-border);
      border-radius: 19px;
      background: white;
      color: inherit;
      text-decoration: none;
      box-shadow: var(--pc-shadow);
      animation: productIn 0.55s
        cubic-bezier(.22,1,.36,1)
        both;
      transition:
        transform 0.25s ease,
        border 0.25s ease,
        box-shadow 0.25s ease;
    }

    .pc-product:nth-child(1) {
      animation-delay: 0.05s;
    }

    .pc-product:nth-child(2) {
      animation-delay: 0.1s;
    }

    .pc-product:nth-child(3) {
      animation-delay: 0.15s;
    }

    .pc-product:nth-child(4) {
      animation-delay: 0.2s;
    }

    .pc-product:nth-child(5) {
      animation-delay: 0.25s;
    }

    .pc-product:nth-child(6) {
      animation-delay: 0.3s;
    }

    @keyframes productIn {
      from {
        opacity: 0;
        transform: translateY(14px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .pc-product:hover {
      transform: translateY(-6px);
      border-color: #d8c095;
      box-shadow: var(--pc-shadow-hover);
    }

    .pc-product-image {
      position: relative;
      height: 185px;
      overflow: hidden;
      background: #f8f4eb;
    }

    .pc-product-image > img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition:
        transform 0.55s
        cubic-bezier(.22,1,.36,1);
    }

    .pc-product:hover
      .pc-product-image > img {
      transform: scale(1.07);
    }

    .pc-image-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 7px;
      color: #b6a991;
      font-size: 8px;
      font-weight: 800;
      text-align: center;
    }

    .pc-discount {
      position: absolute;
      z-index: 2;
      top: 10px;
      left: 10px;
      padding: 5px 7px;
      border-radius: 999px;
      background: white;
      color: #977039;
      font-size: 8px;
      font-weight: 950;
      box-shadow:
        0 4px 12px
        rgba(74, 57, 31, 0.08);
    }

    .pc-product-heart {
      position: absolute;
      z-index: 3;
      top: 10px;
      right: 10px;
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      border: 1px solid
        rgba(232, 222, 204, 0.8);
      border-radius: 50%;
      background:
        rgba(255, 255, 255, 0.9);
      color: #827667;
      cursor: pointer;
      opacity: 0;
      transform: translateY(-4px);
      transition:
        opacity 0.2s ease,
        transform 0.2s ease,
        color 0.2s ease;
    }

    .pc-product:hover
      .pc-product-heart {
      opacity: 1;
      transform: translateY(0);
    }

    .pc-product-heart:hover {
      color: #b56e64;
      transform: scale(1.08);
    }

    .pc-product-content {
      padding: 13px;
    }

    .pc-product-brand {
      margin: 0;
      color: #a39177;
      font-size: 7px;
      font-weight: 950;
      letter-spacing: 0.11em;
      text-transform: uppercase;
    }

    .pc-product-title {
      display: -webkit-box;
      min-height: 34px;
      margin: 5px 0 0;
      overflow: hidden;
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
    }

    /* =========================
       FLASH DEALS
    ========================= */

    .pc-deals {
      overflow: hidden;
      padding: 25px;
      border: 1px solid #eadbbd;
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
      border: 1px solid #e9dec9;
      border-radius: 15px;
      background:
        rgba(255, 255, 255, 0.7);
      color: var(--pc-text);
      text-decoration: none;
      transition:
        transform 0.22s ease,
        box-shadow 0.22s ease;
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
      width: 68px;
      height: 68px;
      flex-shrink: 0;
      overflow: hidden;
      border-radius: 11px;
      background: #f4eee2;
    }

    .pc-deal-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition:
        transform 0.35s ease;
    }

    .pc-deal:hover
      .pc-deal-image img {
      transform: scale(1.08);
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

    /* =========================
       BOTTOM
    ========================= */

    .pc-bottom-grid {
      display: grid;
      grid-template-columns:
        1.25fr 0.75fr;
      gap: 14px;
    }

    .pc-panel {
      padding: 21px;
      border: 1px solid var(--pc-border);
      border-radius: 20px;
      background: white;
      box-shadow: var(--pc-shadow);
    }

    .pc-orders {
      margin-top: 14px;
    }

    .pc-order {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 11px 0;
      border-bottom: 1px solid
        var(--pc-border-2);
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
      margin: 0;
      overflow: hidden;
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

    .pc-quick-grid {
      display: grid;
      grid-template-columns:
        repeat(2, 1fr);
      gap: 9px;
      margin-top: 16px;
    }

    .pc-quick {
      padding: 13px;
      border: 1px solid
        var(--pc-border-2);
      border-radius: 15px;
      color: var(--pc-text);
      text-decoration: none;
      transition:
        transform 0.2s ease,
        border 0.2s ease,
        background 0.2s ease;
    }

    .pc-quick:hover {
      transform: translateY(-2px);
      border-color: #d9c49a;
      background: #fffdf8;
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

    .pc-mini-banner {
      margin-top: 12px;
      padding: 15px;
      border-radius: 16px;
      background:
        linear-gradient(
          135deg,
          #f7edda,
          #fffaf0
        );
      border: 1px solid #eadabd;
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
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      min-height: 31px;
      margin-top: 11px;
      border-radius: 10px;
      background: white;
      color: #8f6c36;
      text-decoration: none;
      font-size: 8px;
      font-weight: 950;
      transition: transform 0.2s ease;
    }

    .pc-mini-button:hover {
      transform: translateY(-2px);
    }

    /* =========================
       FOOTER BANNER
    ========================= */

    .pc-footer-banner {
      margin-top: 14px;
      padding: 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      border: 1px solid var(--pc-border);
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
      display: grid;
      place-items: center;
      flex-shrink: 0;
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
      max-width: 600px;
      margin: 4px 0 0;
      color: #9b907f;
      font-size: 8px;
      line-height: 1.6;
    }

    /* =========================
       MOBILE
    ========================= */

    .pc-mobile-overlay {
      display: none;
    }

    .pc-mobile-menu {
      display: none;
    }

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

    @media (max-width: 1000px) {
      .pc-sidebar {
        transform: translateX(-100%);
        box-shadow:
          20px 0 50px
          rgba(55, 41, 23, 0.12);
      }

      .pc-sidebar.mobile-open {
        transform: translateX(0);
      }

      .pc-main {
        margin-left: 0;
      }

      .pc-mobile-menu {
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
        border: 1px solid var(--pc-border);
        border-radius: 12px;
        background: white;
        color: var(--pc-text);
        cursor: pointer;
      }

      .pc-mobile-overlay {
        position: fixed;
        inset: 0;
        z-index: 60;
        display: block;
        background:
          rgba(57, 44, 27, 0.24);
        backdrop-filter: blur(3px);
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
    }

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
        width: calc(100% - 28px);
        padding-top: 20px;
      }

      .pc-welcome {
        min-height: auto;
        padding: 24px;
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
        height: 145px;
      }

      .pc-product-content {
        padding: 10px;
      }

      .pc-product-title {
        font-size: 10px;
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
      .pc-profile-button > svg {
        display: none;
      }
    }

    @media (max-width: 430px) {
      .pc-category-grid {
        grid-template-columns:
          repeat(2, 1fr);
      }

      .pc-product-image {
        height: 135px;
      }

      .pc-product-price strong {
        font-size: 12px;
      }

      .pc-section-heading h2 {
        font-size: 19px;
      }

      .pc-footer-info {
        align-items: flex-start;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        scroll-behavior: auto !important;
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `}</style>

  {/* MOBILE OVERLAY */}

  {mobileMenu && (
    <div
      className="pc-mobile-overlay"
      onClick={() =>
        setMobileMenu(false)
      }
    />
  )}

  {/* SIDEBAR */}

  <aside
    className={`pc-sidebar ${
      mobileMenu ? "mobile-open" : ""
    }`}
  >
    <div className="pc-logo-area">
      <Link
        href="/dashboard"
        className="pc-logo"
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
        type="button"
        className="ml-auto lg:hidden"
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

      {sidebarItems.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() =>
              setMobileMenu(false)
            }
            className={`pc-nav-link ${
              item.href === "/dashboard"
                ? "active"
                : ""
            }`}
          >
            <Icon size={17} />

            <span>{item.label}</span>

            {item.label === "Wishlist" &&
              wishlistCount > 0 && (
                <span className="pc-nav-badge">
                  {wishlistCount}
                </span>
              )}
          </Link>
        );
      })}

      <div
        style={{
          height: 1,
          margin: "22px 10px",
          background: "#f0e8da",
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
            <span>{tool.title}</span>
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
        type="button"
        onClick={handleLogout}
        className="pc-nav-link"
      >
        <LogOut size={17} />
        <span>Sign Out</span>
      </button>
    </div>
  </aside>

  {/* MAIN */}

  <div className="pc-main">
    {/* HEADER */}

    <header className="pc-header">
      <button
        type="button"
        className="pc-mobile-menu"
        onClick={() =>
          setMobileMenu(true)
        }
        aria-label="Open menu"
      >
        <Menu size={19} />
      </button>

      <div className="pc-search-wrap">
        <div className="pc-search">
          <Search
            size={16}
            color="#a09482"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            onFocus={() =>
              setSearchFocused(true)
            }
            placeholder="Search products, brands..."
            aria-label="Search products"
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSearchFocused(false);
              }}
              className="border-0 bg-transparent text-[#a09482]"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {searchFocused && search && (
          <div className="pc-search-results">
            {searchResults.length > 0 ? (
              searchResults.map(
                (product) => (
                  <Link
                    key={product.id}
                    href={`/dashboard/products/${product.id}`}
                    className="pc-search-result"
                    onClick={() => {
                      setSearchFocused(false);
                      setSearch("");
                    }}
                  >
                    <div className="pc-search-result-image">
                      <ImageFallback
                        src={getImageUrl(
                          product.image_url,
                        )}
                        alt={product.name}
                      />
                    </div>

                    <div
                      style={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          overflow: "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                          fontSize: 10,
                          fontWeight: 900,
                        }}
                      >
                        {product.name}
                      </p>

                      <p
                        style={{
                          margin:
                            "4px 0 0",
                          color: "#9d917e",
                          fontSize: 8,
                        }}
                      >
                        {product.brand ||
                          "PrimeCart"}
                      </p>
                    </div>

                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 950,
                        color: "#9a763d",
                      }}
                    >
                      {formatPrice(
                        Number(
                          product.price,
                        ),
                      )}
                    </span>
                  </Link>
                ),
              )
            ) : (
              <div
                style={{
                  padding: 28,
                  textAlign: "center",
                }}
              >
                <Search
                  size={23}
                  style={{
                    margin: "0 auto",
                    color: "#c2b5a0",
                  }}
                />

                <p
                  style={{
                    margin:
                      "9px 0 0",
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                >
                  No products found
                </p>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color: "#9d917e",
                    fontSize: 8,
                  }}
                >
                  Try another product
                  or brand.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pc-header-actions">
        {/* NOTIFICATIONS */}

        <div
          className="relative"
          style={{
            position: "relative",
          }}
        >
          <button
            type="button"
            className="pc-icon-button"
            onClick={() => {
              setNotificationOpen(
                (value) => !value,
              );
              setProfileOpen(false);
            }}
            aria-label="Notifications"
          >
            <Bell size={17} />
            <span className="pc-notification-dot" />
          </button>

          {notificationOpen && (
            <div className="pc-dropdown">
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  padding:
                    "8px 10px",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 950,
                  }}
                >
                  Notifications
                </span>

                <span
                  style={{
                    padding:
                      "4px 7px",
                    borderRadius:
                      999,
                    background:
                      "#f6ecd9",
                    color:
                      "#99763c",
                    fontSize: 7,
                    fontWeight: 950,
                  }}
                >
                  NEW
                </span>
              </div>

              <div
                style={{
                  padding: 13,
                  borderRadius: 12,
                  background:
                    "#faf6ed",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    fontWeight: 950,
                  }}
                >
                  Welcome to PrimeCart
                </p>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color:
                      "#9a8e7c",
                    fontSize: 8,
                    lineHeight: 1.8,
                  }}
                >
                  Explore smart
                  shopping tools
                  and discover
                  products made
                  for you.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* PROFILE */}

        <div className="pc-profile">
          <button
            type="button"
            className="pc-profile-button"
            onClick={() => {
              setProfileOpen(
                (value) => !value,
              );
              setNotificationOpen(false);
            }}
          >
            <div className="pc-avatar">
              {getInitials(
                userName,
              )}
            </div>

            <div className="pc-profile-info text-left">
              <p
                style={{
                  maxWidth: 110,
                  margin: 0,
                  overflow:
                    "hidden",
                  textOverflow:
                    "ellipsis",
                  whiteSpace:
                    "nowrap",
                  fontSize: 9,
                  fontWeight: 950,
                }}
              >
                {userName}
              </p>

              <p
                style={{
                  margin:
                    "3px 0 0",
                  color: "#9e9280",
                  fontSize: 7,
                }}
              >
                Prime Member
              </p>
            </div>

            <ChevronDown
              size={14}
              color="#9d907e"
            />
          </button>

          {profileOpen && (
            <div
              className="pc-dropdown"
              style={{
                width: 215,
              }}
            >
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-[9px] font-black hover:bg-[#faf6ed]"
              >
                <User size={15} />
                My Profile
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-[9px] font-black hover:bg-[#faf6ed]"
              >
                <Settings size={15} />
                Settings
              </Link>

              <div
                style={{
                  height: 1,
                  margin:
                    "4px 0",
                  background:
                    "#f0e8da",
                }}
              />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[9px] font-black text-[#a0645c] hover:bg-[#fff3f1]"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    <main className="pc-content">
      {/* HERO */}

      <section className="pc-welcome">
        <div className="pc-eyebrow">
          <Sparkles size={12} />
          Personal Shopping Dashboard
        </div>

        <h1>
          Good to see you,{" "}
          <span>{firstName}.</span>
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
            href="/dashboard/categories"
            className="pc-secondary-button"
          >
            <ShoppingBag size={14} />
            Browse Categories
          </Link>

          <Link
            href="/dashboard/prime-match"
            className="pc-secondary-button"
          >
            <Target size={14} />
            Try PrimeMatch
          </Link>
        </div>

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

          <p
            style={{
              margin:
                "8px 0 0",
              color: "#9a8c75",
              fontSize: 7,
              fontWeight: 700,
            }}
          >
            Keep shopping to unlock
            more rewards
          </p>
        </div>
      </section>

      {/* STATS */}

      <section className="pc-stats">
        {[
          {
            title: "Total Orders",
            value: orders.length,
            text: "All shopping orders",
            icon: Package,
          },
          {
            title: "Wishlist",
            value: wishlistCount,
            text: "Saved products",
            icon: Heart,
          },
          {
            title: "Total Spent",
            value:
              formatPrice(totalSpent),
            text: "Shopping total",
            icon: CircleDollarSign,
          },
          {
            title: "PrimePoints",
            value: primePoints,
            text: "Reward balance",
            icon: Crown,
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="pc-stat"
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
        })}
      </section>

      {/* SMART TOOLS */}

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

          <span
            style={{
              color: "#a09483",
              fontSize: 8,
              fontWeight: 700,
            }}
          >
            Tools designed for better
            decisions
          </span>
        </div>

        <div className="pc-smart-grid">
          {smartTools.map(
            (tool) => {
              const Icon =
                tool.icon;

              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="pc-smart-card"
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
                    {tool.description}
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

      {/* CATEGORIES */}

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
            View all categories
            <ChevronRight
              size={13}
            />
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="pc-category-grid">
            {categories
              .slice(0, 10)
              .map(
                (category) => (
                  <Link
                    key={
                      category.id
                    }
                    href={`/dashboard/categories/${category.slug}`}
                    className="pc-category"
                  >
                    <div className="pc-category-icon">
                      {categoryIcons[
                        category.slug
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
          <div className="pc-panel">
            <p
              style={{
                margin: 0,
                textAlign:
                  "center",
                color:
                  "#9d917e",
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              No categories
              available yet.
            </p>
          </div>
        )}
      </section>

      {/* FEATURED PRODUCTS */}

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
                    className="pc-product"
                  >
                    <div className="pc-product-image">
                      <ImageFallback
                        src={
                          image
                        }
                        alt={
                          product.name
                        }
                        className=""
                      />

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
                        type="button"
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

                        <span
                          style={{
                            color:
                              "#a69a89",
                          }}
                        >
                          (
                          {product.reviews_count ||
                            0}
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
          <div className="pc-panel">
            <div
              style={{
                display: "grid",
                placeItems:
                  "center",
                minHeight: 150,
                textAlign:
                  "center",
              }}
            >
              <ShoppingBag
                size={28}
                color="#c3b49d"
              />

              <p
                style={{
                  margin:
                    "12px 0 0",
                  fontSize: 10,
                  fontWeight: 950,
                }}
              >
                No products
                available yet.
              </p>

              <Link
                href="/dashboard/products"
                className="pc-view-all"
                style={{
                  marginTop: 8,
                }}
              >
                Browse products
                <ArrowRight
                  size={12}
                />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* FLASH DEALS */}

      <section className="pc-section">
        <div className="pc-deals">
          <div className="pc-section-heading">
            <div>
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: 6,
                }}
              >
                <Zap
                  size={13}
                  color="#b18a49"
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
                      <ImageFallback
                        src={
                          image
                        }
                        alt={
                          product.name
                        }
                      />
                    </div>

                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
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
        </div>
      </section>

      {/* ORDERS + QUICK ACTIONS */}

      <section className="pc-section pc-bottom-grid">
        <div className="pc-panel">
          <div className="pc-section-heading">
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
              <ArrowRight
                size={12}
              />
            </Link>
          </div>

          <div className="pc-orders">
            {orders.length > 0 ? (
              orders
                .slice(0, 5)
                .map((order) => (
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
                ))
            ) : (
              <div
                style={{
                  padding:
                    "45px 10px",
                  textAlign:
                    "center",
                }}
              >
                <Package
                  size={25}
                  style={{
                    margin:
                      "0 auto",
                    color:
                      "#c3b49d",
                  }}
                />

                <p
                  style={{
                    margin:
                      "11px 0 0",
                    fontSize: 10,
                    fontWeight: 950,
                  }}
                >
                  No orders yet
                </p>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color:
                      "#a29786",
                    fontSize: 8,
                  }}
                >
                  Your orders
                  will appear
                  here.
                </p>

                <Link
                  href="/dashboard/products"
                  className="pc-primary-button"
                  style={{
                    marginTop: 14,
                  }}
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

        <div className="pc-panel">
          <div>
            <p className="pc-section-kicker">
              Shortcuts
            </p>

            <h2
              style={{
                margin:
                  "5px 0 0",
                color:
                  "#4c4133",
                fontSize: 20,
                fontWeight: 950,
              }}
            >
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
                  "Browse Categories",
                href:
                  "/dashboard/categories",
                icon:
                  ShoppingBag,
              },
              {
                title:
                  "My Wishlist",
                href:
                  "/dashboard/wishlist",
                icon:
                  Heart,
              },
              {
                title:
                  "My Profile",
                href:
                  "/dashboard/profile",
                icon:
                  User,
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
                      color="#b1a18b"
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
                  size={15}
                />
              </div>

              <div>
                <h4>
                  Personalised
                  shopping
                </h4>

                <p>
                  Powered by
                  PrimeCart
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

      {/* FINAL CTA */}

      <section className="pc-footer-banner">
        <div className="pc-footer-info">
          <div className="pc-footer-icon">
            <ShieldCheck
              size={20}
            />
          </div>

          <div>
            <h3>
              A smarter way to
              shop
            </h3>

            <p>
              Discover products,
              compare options,
              manage your wishlist
              and make better
              shopping decisions
              with PrimeCart.
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

      <footer
        style={{
          padding:
            "30px 0 10px",
          textAlign:
            "center",
        }}
      >
        <p
          style={{
            margin: 0,
            color:
              "#aaa090",
            fontSize: 8,
            fontWeight: 800,
            letterSpacing:
              "0.18em",
            textTransform:
              "uppercase",
          }}
        >
          ©{" "}
          {new Date().getFullYear()}{" "}
          PrimeCart · Shop
          Smarter
        </p>
      </footer>
    </main>
  </div>
</div>
);
}
