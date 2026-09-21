"use client";

import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronRight,
  Clock3,
  Crown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Truck,
  User,
  WalletCards,
  X,
  Zap,
  Layers3,
  Eye,
  CircleDollarSign,
  ShoppingCart,
  BadgePercent,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

type DashboardStats = {
  orders: number;
  wishlist: number;
  spent: number;
  points: number;
};

const GOLD = "#b9975b";

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

function getImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;

  const value = imageUrl.trim();

  if (!value) return null;

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

function getDiscount(price: number, original: number | null) {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase())
    .join("");
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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
    icon: Layers3,
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
    tag: "AI MATCH",
  },
  {
    title: "Budget Builder",
    description: "Plan your shopping within budget.",
    href: "/dashboard/budget-builder",
    icon: WalletCards,
    tag: "SMART",
  },
  {
    title: "Setup Builder",
    description: "Build your complete setup easily.",
    href: "/dashboard/setup-builder",
    icon: Sparkles,
    tag: "CURATED",
  },
  {
    title: "PrimePoints",
    description: "Track and use your shopping rewards.",
    href: "/dashboard/prime-points",
    icon: Crown,
    tag: "REWARDS",
  },
];

export default function DashboardPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    orders: 0,
    wishlist: 0,
    spent: 0,
    points: 0,
  });

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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

        if (profileResult.data) {
          setProfile(profileResult.data);
        } else {
          setProfile({
            full_name: user.user_metadata?.full_name ?? "PrimeCart User",
            email: user.email ?? "",
          });
        }

        const productRows = (productsResult.data ?? []) as Product[];
        const categoryRows = (categoriesResult.data ?? []) as Category[];
        const orderRows = (ordersResult.data ?? []) as Order[];

        setProducts(productRows);
        setCategories(categoryRows);
        setOrders(orderRows);

        const totalSpent = orderRows.reduce(
          (sum, order) => sum + Number(order.total_amount || 0),
          0,
        );

        setStats({
          orders: orderRows.length,
          wishlist: wishlistResult.data?.length ?? 0,
          spent: totalSpent,
          points: Math.floor(totalSpent / 10),
        });
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const featuredProducts = useMemo(() => {
    const featured = products.filter((product) => product.is_featured);

    return featured.length > 0 ? featured.slice(0, 6) : products.slice(0, 6);
  }, [products]);

  const flashProducts = useMemo(() => {
    const flash = products.filter((product) => product.is_flash_sale);

    return flash.length > 0 ? flash.slice(0, 4) : products.slice(0, 4);
  }, [products]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];

    const value = search.toLowerCase();

    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(value) ||
          product.brand?.toLowerCase().includes(value),
      )
      .slice(0, 6);
  }, [products, search]);

  const userName =
    profile?.full_name?.trim() ||
    profile?.email?.split("@")[0] ||
    "PrimeCart User";

  const firstName = userName.split(" ")[0];

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.replace("/auth/login");
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#17130d]">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebar(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-[270px]
          border-r border-[#eadfc9] bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${mobileSidebar ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-[82px] items-center justify-between border-b border-[#eadfc9] px-6">
            <Link href="/dashboard" className="group flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#17130d] text-white shadow-lg transition-transform group-hover:scale-105">
                <ShoppingBag size={21} />
              </div>

              <div>
                <div className="text-[20px] font-black tracking-tight">
                  Prime<span className="text-[#b9975b]">Cart</span>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#9b8d77]">
                  Shop Smarter
                </div>
              </div>
            </Link>

            <button
              onClick={() => setMobileSidebar(false)}
              className="rounded-xl p-2 text-[#766c5e] hover:bg-[#f5f0e6] lg:hidden"
            >
              <X size={19} />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#a49682]">
              Main Menu
            </p>

            <nav className="space-y-1.5">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon;
                const active = index === 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebar(false)}
                    className={`
                      group relative flex items-center gap-3 rounded-2xl
                      px-4 py-3.5 text-sm font-bold transition-all
                      ${
                        active
                          ? "bg-[#17130d] text-white shadow-lg shadow-black/10"
                          : "text-[#62594d] hover:bg-[#f7f2e8] hover:text-[#17130d]"
                      }
                    `}
                  >
                    {active && (
                      <motion.span
                        layoutId="activeNav"
                        className="absolute left-0 h-7 w-1 rounded-r-full bg-[#b9975b]"
                      />
                    )}

                    <Icon size={18} />

                    <span>{item.label}</span>

                    {item.label === "Wishlist" && stats.wishlist > 0 && (
                      <span
                        className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
                          active
                            ? "bg-[#b9975b] text-white"
                            : "bg-[#f1e8d7] text-[#977538]"
                        }`}
                      >
                        {stats.wishlist}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="my-7 h-px bg-[#eee6d8]" />

            <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#a49682]">
              Smart Shopping
            </p>

            <nav className="space-y-1.5">
              {smartTools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => setMobileSidebar(false)}
                    className="group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all hover:bg-[#f7f2e8]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfc9] bg-[#fffdf9] text-[#977538] transition-all group-hover:border-[#b9975b] group-hover:bg-[#b9975b] group-hover:text-white">
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold">{tool.title}</p>
                      <p className="truncate text-[10px] text-[#968a78]">
                        {tool.tag}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar bottom */}
          <div className="border-t border-[#eadfc9] p-4">
            <Link
              href="/dashboard/settings"
              className="mb-2 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-[#62594d] hover:bg-[#f7f2e8]"
            >
              <Settings size={18} />
              Settings
            </Link>

            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-[#9b5b50] hover:bg-[#fff1ef]"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:pl-[270px]">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-[#eadfc9]/80 bg-[#faf8f3]/90 backdrop-blur-xl">
          <div className="flex h-[76px] items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setMobileSidebar(true)}
              className="rounded-xl border border-[#eadfc9] bg-white p-2.5 lg:hidden"
            >
              <Menu size={19} />
            </button>

            {/* Search */}
            <div className="relative max-w-xl flex-1">
              <div className="flex h-11 items-center gap-3 rounded-2xl border border-[#eadfc9] bg-white px-4 shadow-sm transition-all focus-within:border-[#b9975b] focus-within:ring-4 focus-within:ring-[#b9975b]/10">
                <Search size={18} className="text-[#a19480]" />

                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search products, brands..."
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-[#a79a88]"
                />

                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setSearchOpen(false);
                    }}
                    className="text-[#958875]"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {searchOpen && search && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute left-0 right-0 top-[52px] overflow-hidden rounded-2xl border border-[#eadfc9] bg-white p-2 shadow-2xl"
                  >
                    {searchResults.length > 0 ? (
                      searchResults.map((product) => {
                        const image = getImageUrl(product.image_url);

                        return (
                          <Link
                            key={product.id}
                            href={`/dashboard/products/${product.id}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-[#faf7f0]"
                          >
                            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-[#f7f2e8]">
                              {image && (
                                <Image
                                  src={image}
                                  alt={product.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold">
                                {product.name}
                              </p>
                              <p className="text-xs text-[#9a8e7c]">
                                {product.brand || "PrimeCart"}
                              </p>
                            </div>

                            <span className="text-sm font-black">
                              {formatPrice(Number(product.price))}
                            </span>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Search className="mx-auto mb-2 text-[#b5a994]" />
                        <p className="text-sm font-bold">No products found</p>
                        <p className="mt-1 text-xs text-[#9a8e7c]">
                          Try another product or brand.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* Notification */}
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen((value) => !value)}
                  className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eadfc9] bg-white text-[#655b4e] transition hover:border-[#b9975b] hover:text-[#977538]"
                >
                  <Bell size={18} />

                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#b9975b]" />
                </button>

                <AnimatePresence>
                  {notificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-14 w-[300px] rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-2xl"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-black">Notifications</h3>
                        <span className="rounded-full bg-[#f4ead8] px-2 py-1 text-[10px] font-black text-[#977538]">
                          NEW
                        </span>
                      </div>

                      <div className="rounded-xl bg-[#faf7f0] p-3">
                        <p className="text-sm font-bold">
                          Welcome to PrimeCart
                        </p>
                        <p className="mt-1 text-xs text-[#8e8271]">
                          Explore personalised shopping tools and exclusive
                          deals.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-2xl border border-[#eadfc9] bg-white p-1.5 pr-3 transition hover:border-[#b9975b]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#17130d] text-xs font-black text-white">
                    {getInitials(userName)}
                  </div>

                  <div className="hidden text-left sm:block">
                    <p className="max-w-[110px] truncate text-xs font-black">
                      {userName}
                    </p>
                    <p className="text-[10px] text-[#978b79]">Prime Member</p>
                  </div>

                  <ChevronDown size={15} className="text-[#918574]" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      className="absolute right-0 top-14 w-56 rounded-2xl border border-[#eadfc9] bg-white p-2 shadow-2xl"
                    >
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold hover:bg-[#faf7f0]"
                      >
                        <User size={17} />
                        My Profile
                      </Link>

                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold hover:bg-[#faf7f0]"
                      >
                        <Settings size={17} />
                        Settings
                      </Link>

                      <div className="my-1 h-px bg-[#eee6d8]" />

                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#9b5b50] hover:bg-[#fff1ef]"
                      >
                        <LogOut size={17} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative overflow-hidden rounded-[30px] bg-[#17130d] p-6 text-white shadow-xl sm:p-8 lg:p-10"
          >
            <div className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-[#b9975b]/20 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#b9975b]/10 blur-3xl" />

            <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_300px]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#d7bd8b]">
                  <Sparkles size={13} />
                  Your Personal Shopping Space
                </div>

                <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  Good to see you,{" "}
                  <span className="text-[#d3b77e]">{firstName}.</span>
                  <br />
                  Ready to shop smarter?
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
                  Discover products picked around your budget, preferences and
                  shopping goals — all in one place.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/products"
                    className="group inline-flex items-center gap-2 rounded-xl bg-[#b9975b] px-5 py-3 text-sm font-black text-white transition hover:bg-[#c9aa70]"
                  >
                    Explore Products
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>

                  <Link
                    href="/dashboard/prime-match"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    <Target size={16} />
                    Try PrimeMatch
                  </Link>
                </div>
              </div>

              {/* Hero visual */}
              <div className="relative hidden h-[220px] lg:block">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute right-4 top-4 w-[230px] rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b9975b]">
                      <Crown size={19} />
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-widest text-[#d3b77e]">
                      PrimePoints
                    </span>
                  </div>

                  <p className="text-xs text-white/50">Current balance</p>

                  <p className="mt-1 text-3xl font-black">
                    {stats.points.toLocaleString("en-IN")}
                  </p>

                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((stats.points % 1000) / 10, 100)}%`,
                      }}
                      transition={{ duration: 1.2, delay: 0.4 }}
                      className="h-full rounded-full bg-[#b9975b]"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* Stats */}
          <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                label: "Total Orders",
                value: stats.orders.toLocaleString("en-IN"),
                icon: Package,
                sub: "All time orders",
              },
              {
                label: "Wishlist",
                value: stats.wishlist.toLocaleString("en-IN"),
                icon: Heart,
                sub: "Saved products",
              },
              {
                label: "Total Spent",
                value: formatPrice(stats.spent),
                icon: CircleDollarSign,
                sub: "Shopping total",
              },
              {
                label: "PrimePoints",
                value: stats.points.toLocaleString("en-IN"),
                icon: Crown,
                sub: "Reward balance",
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.08,
                  }}
                  whileHover={{ y: -4 }}
                  className="group rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-sm transition-shadow hover:shadow-lg sm:p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f1e5] text-[#977538] transition-colors group-hover:bg-[#b9975b] group-hover:text-white">
                      <Icon size={18} />
                    </div>

                    <TrendingUp
                      size={15}
                      className="text-[#b9975b] opacity-60"
                    />
                  </div>

                  <p className="mt-5 text-xs font-bold text-[#948775]">
                    {item.label}
                  </p>

                  <p className="mt-1 truncate text-xl font-black tracking-tight sm:text-2xl">
                    {loading ? "—" : item.value}
                  </p>

                  <p className="mt-1 text-[10px] font-medium text-[#aa9d8b]">
                    {item.sub}
                  </p>
                </motion.div>
              );
            })}
          </section>

          {/* Smart tools */}
          <section className="mt-9">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b08e52]">
                  Intelligent Shopping
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">
                  Shop smarter
                </h2>
              </div>

              <span className="hidden text-xs font-medium text-[#948775] sm:block">
                Tools designed for better decisions
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {smartTools.map((tool, index) => {
                const Icon = tool.icon;

                return (
                  <motion.div
                    key={tool.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.07,
                    }}
                    whileHover={{ y: -5 }}
                  >
                    <Link
                      href={tool.href}
                      className="group relative block h-full overflow-hidden rounded-2xl border border-[#eadfc9] bg-white p-5 shadow-sm transition-shadow hover:shadow-xl"
                    >
                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#b9975b]/5 transition-transform duration-500 group-hover:scale-150" />

                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6f0e4] text-[#977538] transition-all group-hover:bg-[#b9975b] group-hover:text-white">
                            <Icon size={20} />
                          </div>

                          <span className="rounded-full bg-[#faf4e8] px-2 py-1 text-[8px] font-black tracking-widest text-[#977538]">
                            {tool.tag}
                          </span>
                        </div>

                        <h3 className="mt-5 text-base font-black">
                          {tool.title}
                        </h3>

                        <p className="mt-1 min-h-[38px] text-xs leading-5 text-[#8e8272]">
                          {tool.description}
                        </p>

                        <div className="mt-5 flex items-center gap-1 text-xs font-black text-[#977538]">
                          Explore
                          <ArrowRight
                            size={14}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Categories */}
          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b08e52]">
                  Browse
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">
                  Shop by category
                </h2>
              </div>

              <Link
                href="/dashboard/categories"
                className="group flex items-center gap-1 text-xs font-black text-[#977538]"
              >
                View all
                <ChevronRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
              {categories.slice(0, 10).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: index * 0.04,
                    duration: 0.35,
                  }}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    href={`/dashboard/categories/${category.slug}`}
                    className="group flex h-full flex-col items-center justify-center rounded-2xl border border-[#eadfc9] bg-white px-2 py-5 text-center shadow-sm transition-all hover:border-[#b9975b] hover:shadow-lg"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faf5eb] text-2xl transition-transform duration-300 group-hover:scale-110">
                      {categoryIcons[category.slug] || "🛍️"}
                    </div>

                    <span className="mt-3 line-clamp-2 text-[11px] font-black">
                      {category.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Featured */}
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b08e52]">
                  Curated for you
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">
                  Featured products
                </h2>
              </div>

              <Link
                href="/dashboard/products"
                className="group flex items-center gap-1 text-xs font-black text-[#977538]"
              >
                View all products
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>

            {featuredProducts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {featuredProducts.map((product, index) => {
                  const image = getImageUrl(product.image_url);
                  const discount = getDiscount(
                    Number(product.price),
                    product.original_price
                      ? Number(product.original_price)
                      : null,
                  );

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.05,
                      }}
                      whileHover={{ y: -5 }}
                      className="group overflow-hidden rounded-2xl border border-[#eadfc9] bg-white shadow-sm hover:shadow-xl"
                    >
                      <Link href={`/dashboard/products/${product.id}`}>
                        <div className="relative aspect-square overflow-hidden bg-[#f7f3eb]">
                          {image ? (
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              sizes="(max-width: 640px) 50vw, 200px"
                              className="object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[#b4a68f]">
                              <ShoppingBag size={35} />
                            </div>
                          )}

                          {discount > 0 && (
                            <span className="absolute left-3 top-3 rounded-full bg-[#17130d] px-2 py-1 text-[9px] font-black text-white">
                              -{discount}%
                            </span>
                          )}

                          <button
                            onClick={(e) => e.preventDefault()}
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#756958] opacity-0 shadow-sm backdrop-blur transition-all group-hover:opacity-100 hover:text-red-500"
                          >
                            <Heart size={15} />
                          </button>
                        </div>

                        <div className="p-4">
                          <p className="truncate text-[10px] font-bold uppercase tracking-wide text-[#a08f77]">
                            {product.brand || "PrimeCart"}
                          </p>

                          <h3 className="mt-1 line-clamp-2 min-h-[38px] text-sm font-black leading-5">
                            {product.name}
                          </h3>

                          <div className="mt-2 flex items-center gap-1">
                            <Star
                              size={12}
                              fill={GOLD}
                              className="text-[#b9975b]"
                            />
                            <span className="text-[11px] font-bold">
                              {Number(product.rating || 0).toFixed(1)}
                            </span>
                            <span className="text-[10px] text-[#a29482]">
                              ({product.reviews_count || 0})
                            </span>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-base font-black">
                              {formatPrice(Number(product.price))}
                            </span>

                            {product.original_price &&
                              Number(product.original_price) >
                                Number(product.price) && (
                                <span className="text-[10px] font-medium text-[#a49888] line-through">
                                  {formatPrice(
                                    Number(product.original_price),
                                  )}
                                </span>
                              )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <EmptyState text="No featured products available yet." />
            )}
          </section>

          {/* Flash deals */}
          <section className="mt-10 overflow-hidden rounded-[28px] bg-[#17130d] p-5 text-white sm:p-7">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="inline-flex items-center gap-2 text-[#d3b77e]">
                  <Zap size={16} fill="currentColor" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Limited Time
                  </span>
                </div>

                <h2 className="mt-1 text-2xl font-black">Flash deals</h2>
                <p className="mt-1 text-xs text-white/50">
                  Grab selected deals before they disappear.
                </p>
              </div>

              <Link
                href="/dashboard/products"
                className="flex items-center gap-1 text-xs font-black text-[#d3b77e]"
              >
                Explore deals
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {flashProducts.map((product, index) => {
                const image = getImageUrl(product.image_url);
                const discount = getDiscount(
                  Number(product.price),
                  product.original_price
                    ? Number(product.original_price)
                    : null,
                );

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="group flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:bg-white/[0.08]"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                        {image && (
                          <Image
                            src={image}
                            alt={product.name}
                            fill
                            sizes="80px"
                            className="object-cover transition duration-500 group-hover:scale-110"
                          />
                        )}
                      </div>

                      <div className="min-w-0 py-1">
                        <div className="flex items-center gap-1">
                          <BadgePercent
                            size={11}
                            className="text-[#d3b77e]"
                          />
                          <span className="text-[9px] font-black text-[#d3b77e]">
                            {discount > 0 ? `${discount}% OFF` : "DEAL"}
                          </span>
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs font-bold leading-4">
                          {product.name}
                        </p>

                        <p className="mt-2 text-sm font-black">
                          {formatPrice(Number(product.price))}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Bottom grid */}
          <section className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
            {/* Orders */}
            <div className="rounded-2xl border border-[#eadfc9] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b08e52]">
                    Activity
                  </p>
                  <h2 className="mt-1 text-xl font-black">
                    Recent orders
                  </h2>
                </div>

                <Link
                  href="/dashboard/orders"
                  className="text-xs font-black text-[#977538]"
                >
                  View all
                </Link>
              </div>

              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="flex items-center gap-3 rounded-xl border border-[#f0e9dc] p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f1e5] text-[#977538]">
                        {order.status?.toLowerCase() === "delivered" ? (
                          <ShieldCheck size={18} />
                        ) : (
                          <Truck size={18} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-[#978b79]">
                            {formatDate(order.created_at)}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-[#c7bba8]" />
                          <span className="text-[10px] font-bold capitalize text-[#977538]">
                            {order.status || "Processing"}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm font-black">
                        {formatPrice(Number(order.total_amount || 0))}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState text="Your recent orders will appear here." />
              )}
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-[#eadfc9] bg-white p-5 shadow-sm sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b08e52]">
                Shortcuts
              </p>

              <h2 className="mt-1 text-xl font-black">Quick actions</h2>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  {
                    title: "Browse Products",
                    href: "/dashboard/products",
                    icon: ShoppingCart,
                  },
                  {
                    title: "My Wishlist",
                    href: "/dashboard/wishlist",
                    icon: Heart,
                  },
                  {
                    title: "My Orders",
                    href: "/dashboard/orders",
                    icon: Package,
                  },
                  {
                    title: "My Profile",
                    href: "/dashboard/profile",
                    icon: User,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group rounded-2xl border border-[#eee6d8] p-4 transition-all hover:border-[#b9975b] hover:bg-[#fffdf9]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7f1e5] text-[#977538] transition group-hover:bg-[#b9975b] group-hover:text-white">
                        <Icon size={17} />
                      </div>

                      <p className="mt-3 text-xs font-black">
                        {item.title}
                      </p>

                      <ArrowRight
                        size={13}
                        className="mt-2 text-[#a79782] transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl bg-[#17130d] p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b9975b]">
                    <Sparkles size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-black">
                      Personalised shopping
                    </p>
                    <p className="text-[10px] text-white/50">
                      Powered by PrimeCart tools
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard/prime-match"
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-black text-[#17130d] transition hover:bg-[#f3eadb]"
                >
                  Find my match
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </section>

          {/* Footer banner */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 overflow-hidden rounded-[28px] border border-[#eadfc9] bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#17130d] text-[#d3b77e]">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <h3 className="text-lg font-black">
                    A smarter way to shop
                  </h3>
                  <p className="mt-1 max-w-xl text-xs leading-5 text-[#918575]">
                    Discover products, compare options, manage your wishlist
                    and make better shopping decisions with PrimeCart.
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17130d] px-5 py-3 text-xs font-black text-white transition hover:bg-[#2b251c]"
              >
                Start Shopping
                <ArrowRight size={15} />
              </Link>
            </div>
          </motion.section>

          <footer className="py-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#aaa08f]">
              © {new Date().getFullYear()} PrimeCart · Shop Smarter
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-[170px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#ded3c0] bg-[#fdfbf7] px-5 text-center">
      <ShoppingBag size={28} className="text-[#b5a68f]" />
      <p className="mt-3 text-sm font-bold text-[#6f6558]">{text}</p>
    </div>
  );
}
