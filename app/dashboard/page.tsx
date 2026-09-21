"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Bell,
  ChevronRight,
  Clock3,
  Crown,
  Heart,
  Layers3,
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
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

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

const categoryImages: Record<string, string> = {
  mobile: "/smartphone-x-pro.png",
  "home-living": "/cookware-set.png",
  appliance: "/air-fryer.png",
  footwear: "/sports-running-shoes.png",
  watch: "/classic-watch.png",
  bag: "/bag.png",
  "toy-baby": "/toy-baby.png",
  automotive: "/automotive.png",
  fashion: "/casual-tshirt.png",
  gaming: "/gaming-mouse.png",
};

function getImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;

  const value = imageUrl.trim();

  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/")) {
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

function getDiscount(price: number, originalPrice: number | null) {
  if (!originalPrice || originalPrice <= price) return 0;

  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "PC";

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

function getStatusClasses(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("deliver") ||
    normalized.includes("complete") ||
    normalized.includes("success")
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  if (
    normalized.includes("cancel") ||
    normalized.includes("fail")
  ) {
    return "bg-red-50 text-red-700 border-red-100";
  }

  return "bg-amber-50 text-amber-700 border-amber-100";
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!currentUser) {
          router.replace("/auth/login");
          return;
        }

        if (!mounted) return;

        setUser(currentUser);

        const [
          profileResponse,
          productsResponse,
          categoriesResponse,
          ordersResponse,
          wishlistResponse,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
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
              `
            )
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(100),

          supabase
            .from("categories")
            .select("id, name, slug")
            .order("name"),

          supabase
            .from("orders")
            .select("id, status, total_amount, created_at")
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false })
            .limit(5),

          supabase
            .from("wishlist")
            .select("id", { count: "exact", head: true })
            .eq("user_id", currentUser.id),
        ]);

        if (profileResponse.error) {
          console.warn(profileResponse.error.message);
        }

        if (productsResponse.error) {
          throw new Error(productsResponse.error.message);
        }

        if (categoriesResponse.error) {
          console.warn(categoriesResponse.error.message);
        }

        if (ordersResponse.error) {
          console.warn(ordersResponse.error.message);
        }

        if (wishlistResponse.error) {
          console.warn(wishlistResponse.error.message);
        }

        if (!mounted) return;

        setProfile(profileResponse.data);
        setProducts((productsResponse.data || []) as Product[]);
        setCategories((categoriesResponse.data || []) as Category[]);
        setOrders((ordersResponse.data || []) as Order[]);
        setWishlistCount(wishlistResponse.count || 0);
      } catch (err: any) {
        console.error(err);

        if (mounted) {
          setError(
            err?.message ||
              "Something went wrong while loading your dashboard."
          );
        }
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
  }, [router]);

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "there";

  const firstName = getFirstName(displayName);

  const featuredProducts = useMemo(() => {
    return products
      .filter((product) => product.is_featured)
      .slice(0, 4);
  }, [products]);

  const fallbackProducts = useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  const dashboardProducts =
    featuredProducts.length > 0 ? featuredProducts : fallbackProducts;

  const flashSaleProducts = useMemo(() => {
    return products
      .filter((product) => product.is_flash_sale)
      .slice(0, 4);
  }, [products]);

  const totalSpent = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    );
  }, [orders]);

  const searchResults = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return [];

    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(value) ||
          product.brand?.toLowerCase().includes(value)
      )
      .slice(0, 5);
  }, [search, products]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f3] text-[#17130d]">
        <div className="flex min-h-screen">
          <aside className="hidden w-[260px] border-r border-[#eadfc9] bg-white lg:block">
            <div className="h-full animate-pulse p-6">
              <div className="mb-10 h-10 w-36 rounded-xl bg-[#f3ecde]" />

              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-11 rounded-xl bg-[#f7f2e9]"
                  />
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1 p-5 sm:p-8">
            <div className="mx-auto max-w-[1500px] animate-pulse">
              <div className="mb-8 h-16 rounded-2xl bg-white" />
              <div className="mb-8 h-[300px] rounded-[28px] bg-white" />

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 rounded-2xl bg-white"
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#17130d]">
      {/* Mobile Overlay */}
      {mobileMenu && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="flex min-h-screen">
        {/* ================= SIDEBAR ================= */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[270px] transform border-r border-[#eadfc9] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
            mobileMenu ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-[78px] items-center justify-between border-b border-[#f0e8da] px-6">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenu(false)}
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b9975b] text-white shadow-[0_8px_24px_rgba(185,151,91,0.25)]">
                  <ShoppingBag size={20} strokeWidth={2.4} />
                </div>

                <div>
                  <p className="text-lg font-black tracking-tight">
                    PrimeCart
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a0834e]">
                    Shop Smarter
                  </p>
                </div>
              </Link>

              <button
                onClick={() => setMobileMenu(false)}
                className="rounded-lg p-2 text-[#776b5b] hover:bg-[#f7f2e9] lg:hidden"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#a69a88]">
                Workspace
              </p>

              <nav className="space-y-1.5">
                <SidebarLink
                  href="/dashboard"
                  icon={<LayoutDashboard size={18} />}
                  label="Dashboard"
                  active
                  onClick={() => setMobileMenu(false)}
                />

                <SidebarLink
                  href="/dashboard/products"
                  icon={<Package size={18} />}
                  label="Products"
                  onClick={() => setMobileMenu(false)}
                />

                <SidebarLink
                  href="/dashboard/categories"
                  icon={<LayersIcon />}
                  label="Categories"
                  onClick={() => setMobileMenu(false)}
                />

                <SidebarLink
                  href="/dashboard/orders"
                  icon={<ShoppingBag size={18} />}
                  label="My Orders"
                  onClick={() => setMobileMenu(false)}
                />

                <SidebarLink
                  href="/dashboard/wishlist"
                  icon={<Heart size={18} />}
                  label="Wishlist"
                  badge={wishlistCount > 0 ? wishlistCount : undefined}
                  onClick={() => setMobileMenu(false)}
                />
              </nav>

              <p className="mb-3 mt-8 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#a69a88]">
                Smart Shopping
              </p>

              <nav className="space-y-1.5">
                <SidebarLink
                  href="/dashboard/prime-match"
                  icon={<Sparkles size={18} />}
                  label="PrimeMatch"
                  onClick={() => setMobileMenu(false)}
                />

                <SidebarLink
                  href="/dashboard/budget-builder"
                  icon={<WalletCards size={18} />}
                  label="Budget Builder"
                  onClick={() => setMobileMenu(false)}
                />

                <SidebarLink
                  href="/dashboard/setup-builder"
                  icon={<Target size={18} />}
                  label="Build My Setup"
                  onClick={() => setMobileMenu(false)}
                />

                <SidebarLink
                  href="/dashboard/prime-points"
                  icon={<Crown size={18} />}
                  label="PrimePoints"
                  onClick={() => setMobileMenu(false)}
                />
              </nav>

              <p className="mb-3 mt-8 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#a69a88]">
                Account
              </p>

              <nav className="space-y-1.5">
                <SidebarLink
                  href="/dashboard/profile"
                  icon={<User size={18} />}
                  label="Profile"
                  onClick={() => setMobileMenu(false)}
                />

                <SidebarLink
                  href="/dashboard/settings"
                  icon={<Settings size={18} />}
                  label="Settings"
                  onClick={() => setMobileMenu(false)}
                />
              </nav>
            </div>

            {/* Sidebar Bottom */}
            <div className="border-t border-[#f0e8da] p-4">
              <div className="rounded-2xl bg-[#faf7f0] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#b9975b] text-sm font-black text-white">
                    {getInitials(displayName)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">
                      {displayName}
                    </p>

                    <p className="truncate text-xs text-[#8d8272]">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="rounded-lg p-2 text-[#8d8272] transition hover:bg-white hover:text-red-600"
                  >
                    <LogOut size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ================= MAIN ================= */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-[1550px] px-4 pb-12 sm:px-6 lg:px-8">
            {/* Top Header */}
            <header className="sticky top-0 z-30 -mx-4 mb-6 border-b border-[#eadfc9]/80 bg-[#faf8f3]/95 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenu(true)}
                  className="rounded-xl border border-[#eadfc9] bg-white p-2.5 text-[#554b3e] lg:hidden"
                >
                  <Menu size={20} />
                </button>

                {/* Search */}
                <div className="relative min-w-0 flex-1 max-w-2xl">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a79b89]"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search products, brands and categories..."
                    className="h-11 w-full rounded-xl border border-[#eadfc9] bg-white pl-11 pr-4 text-sm font-medium outline-none transition placeholder:text-[#aaa092] focus:border-[#c5a15f] focus:ring-4 focus:ring-[#b9975b]/10"
                  />

                  {search.trim() && (
                    <div className="absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-2xl border border-[#eadfc9] bg-white p-2 shadow-[0_18px_60px_rgba(40,30,15,0.12)]">
                      {searchResults.length > 0 ? (
                        searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/dashboard/products/${product.id}`}
                            onClick={() => setSearch("")}
                            className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-[#faf7f0]"
                          >
                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#f5f0e7]">
                              {getImageUrl(product.image_url) ? (
                                <Image
                                  src={getImageUrl(product.image_url)!}
                                  alt={product.name}
                                  fill
                                  sizes="44px"
                                  className="object-contain p-1"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[#a0834e]">
                                  <Package size={17} />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold">
                                {product.name}
                              </p>
                              <p className="text-xs text-[#918574]">
                                {formatPrice(Number(product.price))}
                              </p>
                            </div>

                            <ChevronRight
                              size={16}
                              className="text-[#b9975b]"
                            />
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <Search
                            size={22}
                            className="mx-auto mb-2 text-[#c3b59e]"
                          />
                          <p className="text-sm font-bold">
                            No products found
                          </p>
                          <p className="mt-1 text-xs text-[#958a79]">
                            Try another product or brand.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Link
                  href="/dashboard/wishlist"
                  className="relative hidden h-11 w-11 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#6d6253] transition hover:border-[#c9a24d] hover:text-[#a27e3c] sm:flex"
                >
                  <Heart size={19} />

                  {wishlistCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b9975b] px-1 text-[9px] font-black text-white">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>

                <button className="relative hidden h-11 w-11 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#6d6253] transition hover:border-[#c9a24d] hover:text-[#a27e3c] sm:flex">
                  <Bell size={19} />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#b9975b]" />
                </button>

                <Link
                  href="/dashboard/profile"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#b9975b] text-sm font-black text-white shadow-[0_6px_18px_rgba(185,151,91,0.22)]"
                >
                  {getInitials(displayName)}
                </Link>
              </div>
            </header>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {/* ================= HERO ================= */}
            <section className="relative overflow-hidden rounded-[30px] border border-[#dfcfb1] bg-gradient-to-br from-[#fffdf8] via-[#faf4e7] to-[#f2e7d0] p-6 shadow-[0_18px_60px_rgba(80,60,25,0.07)] sm:p-8 lg:p-10">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#d9bd82]/20 blur-3xl" />
              <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-white/60 blur-3xl" />

              <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_390px]">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#dfcfb1] bg-white/70 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-[#92713b]">
                    <Sparkles size={13} />
                    Smart shopping dashboard
                  </div>

                  <h1 className="max-w-3xl text-3xl font-black tracking-[-0.04em] text-[#20190f] sm:text-4xl lg:text-5xl">
                    Welcome back,{" "}
                    <span className="text-[#b18b49]">{firstName}.</span>
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756957] sm:text-base">
                    Your smarter shopping journey starts here. Discover
                    products, compare choices, build your setup and get
                    recommendations tailored to you.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href="/dashboard/products"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#b9975b] px-5 text-sm font-black text-white shadow-[0_10px_25px_rgba(185,151,91,0.25)] transition hover:-translate-y-0.5 hover:bg-[#a8864e]"
                    >
                      Explore Products
                      <ArrowRight size={16} />
                    </Link>

                    <Link
                      href="/dashboard/prime-match"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d9c7a7] bg-white/80 px-5 text-sm font-black text-[#665238] transition hover:bg-white"
                    >
                      <Sparkles size={16} />
                      Try PrimeMatch
                    </Link>
                  </div>

                  <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-[#817563]">
                    <span className="inline-flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        ✓
                      </span>
                      Verified products
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        ✓
                      </span>
                      Secure checkout
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        ✓
                      </span>
                      Easy returns
                    </span>
                  </div>
                </div>

                {/* Hero Smart Card */}
                <div className="relative">
                  <div className="rounded-[26px] border border-white/80 bg-white/85 p-5 shadow-[0_25px_70px_rgba(73,53,20,0.12)] backdrop-blur-xl">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a0834e]">
                          Smart recommendation
                        </p>
                        <p className="mt-1 text-sm font-black">
                          Picked for your shopping style
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7efdf] text-[#a17d40]">
                        <BrainIcon />
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#faf7f0] p-4">
                      <div className="flex gap-4">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white">
                          {getImageUrl(
                            dashboardProducts[0]?.image_url ||
                              "/smartphone-x-pro.png"
                          ) ? (
                            <Image
                              src={
                                getImageUrl(
                                  dashboardProducts[0]?.image_url ||
                                    "/smartphone-x-pro.png"
                                )!
                              }
                              alt={
                                dashboardProducts[0]?.name ||
                                "Recommended product"
                              }
                              fill
                              sizes="96px"
                              className="object-contain p-2"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 inline-flex rounded-full bg-[#e8f6ec] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[#2d7b48]">
                            Smart pick
                          </div>

                          <h3 className="line-clamp-2 text-sm font-black">
                            {dashboardProducts[0]?.name ||
                              "Discover your next favourite"}
                          </h3>

                          <div className="mt-2 flex items-center gap-1">
                            <Star
                              size={13}
                              className="fill-[#b9975b] text-[#b9975b]"
                            />
                            <span className="text-xs font-black">
                              {Number(
                                dashboardProducts[0]?.rating || 4.8
                              ).toFixed(1)}
                            </span>
                          </div>

                          <div className="mt-2 text-lg font-black text-[#a17d40]">
                            {formatPrice(
                              Number(
                                dashboardProducts[0]?.price || 24999
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/dashboard/prime-match"
                      className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#17130d] text-sm font-black text-white transition hover:bg-[#2b2419]"
                    >
                      Find My Match
                      <ArrowRight size={15} />
                    </Link>
                  </div>

                  <div className="absolute -right-2 -top-5 hidden rounded-xl border border-[#eadfc9] bg-white px-4 py-3 shadow-lg sm:block">
                    <p className="text-[9px] font-black uppercase tracking-wider text-[#9c8866]">
                      PrimePoints
                    </p>
                    <p className="mt-0.5 text-sm font-black">
                      Earn on every order
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= STATS ================= */}
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<ShoppingBag size={19} />}
                label="Total Orders"
                value={orders.length}
                caption="Your recent purchases"
              />

              <StatCard
                icon={<Heart size={19} />}
                label="Wishlist"
                value={wishlistCount}
                caption="Products saved"
              />

              <StatCard
                icon={<WalletCards size={19} />}
                label="Total Spent"
                value={formatPrice(totalSpent)}
                caption="Across loaded orders"
              />

              <StatCard
                icon={<Crown size={19} />}
                label="PrimePoints"
                value="0"
                caption="Keep shopping to earn"
                href="/dashboard/prime-points"
              />
            </section>

            {/* ================= SMART TOOLS ================= */}
            <section className="mt-10">
              <SectionHeader
                eyebrow="PrimeCart Intelligence"
                title="Shop smarter, not harder."
                description="Tools designed to make choosing the right product easier."
              />

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SmartTool
                  href="/dashboard/prime-match"
                  icon={<Sparkles size={21} />}
                  title="PrimeMatch"
                  description="Find products that fit your needs and preferences."
                />

                <SmartTool
                  href="/dashboard/budget-builder"
                  icon={<WalletCards size={21} />}
                  title="Budget Builder"
                  description="Set your budget and discover the best options."
                />

                <SmartTool
                  href="/dashboard/setup-builder"
                  icon={<Target size={21} />}
                  title="Build My Setup"
                  description="Create a complete setup from compatible products."
                />

                <SmartTool
                  href="/dashboard/prime-points"
                  icon={<Crown size={21} />}
                  title="PrimePoints"
                  description="Track rewards and make every purchase count."
                />
              </div>
            </section>

            {/* ================= CATEGORIES ================= */}
            <section className="mt-10">
              <SectionHeader
                eyebrow="Explore"
                title="Shop by category"
                description="Jump directly into the products you are looking for."
                action={
                  <Link
                    href="/dashboard/categories"
                    className="hidden items-center gap-1 text-sm font-black text-[#a27e3c] sm:flex"
                  >
                    View all
                    <ArrowRight size={15} />
                  </Link>
                }
              />

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {categories.slice(0, 10).map((category) => (
                  <Link
                    key={category.id}
                    href={`/dashboard/categories/${category.slug}`}
                    className="group overflow-hidden rounded-2xl border border-[#eadfc9] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#c9a24d] hover:shadow-[0_16px_35px_rgba(70,50,20,0.08)]"
                  >
                    <div className="relative h-28 overflow-hidden bg-[#f7f2e9]">
                      {categoryImages[category.slug] &&
                      getImageUrl(categoryImages[category.slug]) ? (
                        <Image
                          src={getImageUrl(categoryImages[category.slug])!}
                          alt={category.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 20vw"
                          className="object-contain p-5 transition duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">
                          {categoryIcons[category.slug] || "🛍️"}
                        </div>
                      )}

                      <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#a17d40] opacity-0 shadow-sm transition group-hover:opacity-100">
                        <ChevronRight size={14} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3.5">
                      <span className="truncate text-sm font-black">
                        {category.name}
                      </span>
                      <ArrowRight
                        size={14}
                        className="shrink-0 text-[#b9975b] transition group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* ================= FEATURED PRODUCTS ================= */}
            <section className="mt-10">
              <SectionHeader
                eyebrow="Curated for you"
                title="Featured products"
                description="Popular picks from the PrimeCart catalog."
                action={
                  <Link
                    href="/dashboard/products"
                    className="hidden items-center gap-1 text-sm font-black text-[#a27e3c] sm:flex"
                  >
                    View all products
                    <ArrowRight size={15} />
                  </Link>
                }
              />

              {dashboardProducts.length > 0 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {dashboardProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Package size={28} />}
                  title="No products available"
                  description="Products will appear here once they are added to your catalog."
                  href="/dashboard/products"
                  action="Browse Products"
                />
              )}
            </section>

            {/* ================= FLASH DEALS ================= */}
            {flashSaleProducts.length > 0 && (
              <section className="mt-10 overflow-hidden rounded-[28px] border border-[#e5d4b4] bg-[#201a12] p-5 text-white sm:p-7">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#e2c98e]">
                      <Zap size={13} />
                      Limited-time deals
                    </div>

                    <h2 className="mt-3 text-2xl font-black tracking-tight">
                      Flash deals worth checking.
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
                      Grab selected products before the deal disappears.
                    </p>
                  </div>

                  <Link
                    href="/dashboard/products?flash=true"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-5 text-sm font-black text-white transition hover:bg-[#b58d3f]"
                  >
                    Explore deals
                    <ArrowRight size={16} />
                  </Link>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {flashSaleProducts.map((product) => {
                    const discount = getDiscount(
                      Number(product.price),
                      product.original_price
                        ? Number(product.original_price)
                        : null
                    );

                    return (
                      <Link
                        key={product.id}
                        href={`/dashboard/products/${product.id}`}
                        className="group flex gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 transition hover:border-[#c9a24d]/50 hover:bg-white/[0.09]"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                          {getImageUrl(product.image_url) ? (
                            <Image
                              src={getImageUrl(product.image_url)!}
                              alt={product.name}
                              fill
                              sizes="80px"
                              className="object-contain p-2 transition group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[#b9975b]">
                              <Package size={20} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 py-1">
                          <p className="truncate text-sm font-black">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-white/50">
                            {product.brand || "PrimeCart"}
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm font-black text-[#e3c987]">
                              {formatPrice(Number(product.price))}
                            </span>

                            {discount > 0 && (
                              <span className="text-[10px] font-black text-emerald-300">
                                {discount}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ================= ORDERS + QUICK ACTIONS ================= */}
            <section className="mt-10 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
              {/* Recent Orders */}
              <div className="rounded-[26px] border border-[#eadfc9] bg-white p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a0834e]">
                      Activity
                    </p>
                    <h2 className="mt-1 text-xl font-black">
                      Recent orders
                    </h2>
                  </div>

                  <Link
                    href="/dashboard/orders"
                    className="inline-flex items-center gap-1 text-xs font-black text-[#a17d40]"
                  >
                    View all
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="mt-5">
                  {orders.length > 0 ? (
                    <div className="divide-y divide-[#f0e8da]">
                      {orders.map((order) => (
                        <Link
                          href="/dashboard/orders"
                          key={order.id}
                          className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#faf5e9] text-[#a17d40]">
                            <Package size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black">
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </p>

                            <div className="mt-1 flex items-center gap-2 text-xs text-[#948877]">
                              <Clock3 size={12} />
                              {formatDate(order.created_at)}
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-black">
                              {formatPrice(Number(order.total_amount))}
                            </p>

                            <span
                              className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[9px] font-black uppercase ${getStatusClasses(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-[#faf7f0] px-5 py-10 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#b9975b] shadow-sm">
                        <ShoppingBag size={22} />
                      </div>

                      <h3 className="mt-4 text-sm font-black">
                        No orders yet
                      </h3>

                      <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#928675]">
                        Start shopping and your recent orders will appear
                        here.
                      </p>

                      <Link
                        href="/dashboard/products"
                        className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#b9975b] px-4 text-xs font-black text-white"
                      >
                        Start Shopping
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-[26px] border border-[#eadfc9] bg-white p-5 sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a0834e]">
                  Shortcuts
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Quick actions
                </h2>

                <div className="mt-5 space-y-2.5">
                  <QuickAction
                    href="/dashboard/products"
                    icon={<ShoppingBag size={18} />}
                    title="Browse Products"
                    description="Explore the full catalog"
                  />

                  <QuickAction
                    href="/dashboard/wishlist"
                    icon={<Heart size={18} />}
                    title="Open Wishlist"
                    description={`${wishlistCount} saved ${
                      wishlistCount === 1 ? "item" : "items"
                    }`}
                  />

                  <QuickAction
                    href="/dashboard/orders"
                    icon={<Truck size={18} />}
                    title="Track Orders"
                    description="Check your purchase history"
                  />

                  <QuickAction
                    href="/dashboard/profile"
                    icon={<User size={18} />}
                    title="My Profile"
                    description="Manage your account"
                  />

                  <QuickAction
                    href="/dashboard/settings"
                    icon={<Settings size={18} />}
                    title="Settings"
                    description="Preferences & security"
                  />
                </div>
              </div>
            </section>

            {/* ================= VALUE BANNER ================= */}
            <section className="mt-10 overflow-hidden rounded-[28px] border border-[#eadfc9] bg-white">
              <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
                <div className="p-6 sm:p-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#faf4e7] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#a17d40]">
                    <Crown size={13} />
                    PrimeCart difference
                  </div>

                  <h2 className="mt-4 max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">
                    A shopping experience designed around better decisions.
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7f7464]">
                    Instead of endlessly scrolling through products, PrimeCart
                    gives you smarter ways to discover, compare and choose.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <MiniBenefit
                      icon={<BrainIcon />}
                      title="Smarter picks"
                      text="Personalized discovery"
                    />

                    <MiniBenefit
                      icon={<TrendingUp size={17} />}
                      title="Better value"
                      text="Budget-focused choices"
                    />

                    <MiniBenefit
                      icon={<ShieldIcon />}
                      title="More confidence"
                      text="Clear product details"
                    />
                  </div>
                </div>

                <div className="relative hidden overflow-hidden bg-[#211b12] lg:block">
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#c9a24d]/20 blur-3xl" />
                  <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#c9a24d]/10 blur-3xl" />

                  <div className="relative flex h-full min-h-[280px] items-center justify-center p-10">
                    <div className="w-full max-w-[280px] rounded-[24px] border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#d9bd82]">
                            PrimeCart
                          </p>
                          <p className="mt-1 text-lg font-black text-white">
                            Shop smarter.
                          </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a24d] text-white">
                          <Sparkles size={18} />
                        </div>
                      </div>

                      <div className="mt-6 space-y-2">
                        <div className="h-2 rounded-full bg-white/10" />
                        <div className="h-2 w-4/5 rounded-full bg-white/10" />
                        <div className="h-2 w-3/5 rounded-full bg-[#c9a24d]/60" />
                      </div>

                      <div className="mt-6 flex items-center justify-between rounded-xl bg-white/5 px-3 py-3">
                        <span className="text-xs font-bold text-white/50">
                          Smart score
                        </span>

                        <span className="text-sm font-black text-[#e2c98e]">
                          Personalised
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="mt-10 flex flex-col justify-between gap-3 border-t border-[#eadfc9] pt-6 text-xs text-[#918575] sm:flex-row">
              <p>
                © {new Date().getFullYear()} PrimeCart. Shop smarter.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dashboard/products"
                  className="transition hover:text-[#a17d40]"
                >
                  Products
                </Link>

                <Link
                  href="/dashboard/orders"
                  className="transition hover:text-[#a17d40]"
                >
                  Orders
                </Link>

                <Link
                  href="/dashboard/profile"
                  className="transition hover:text-[#a17d40]"
                >
                  Profile
                </Link>

                <Link
                  href="/dashboard/settings"
                  className="transition hover:text-[#a17d40]"
                >
                  Settings
                </Link>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function SidebarLink({
  href,
  icon,
  label,
  active = false,
  badge,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
        active
          ? "bg-[#f7f0e1] text-[#9a7539]"
          : "text-[#766b5d] hover:bg-[#faf7f0] hover:text-[#9a7539]"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
          active
            ? "bg-[#b9975b] text-white shadow-sm"
            : "bg-transparent text-[#8c8171] group-hover:text-[#a17d40]"
        }`}
      >
        {icon}
      </span>

      <span className="flex-1">{label}</span>

      {badge !== undefined && (
        <span className="flex min-w-5 items-center justify-center rounded-full bg-[#b9975b] px-1.5 py-0.5 text-[9px] font-black text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

function StatCard({
  icon,
  label,
  value,
  caption,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  caption: string;
  href?: string;
}) {
  const content = (
    <div className="group rounded-2xl border border-[#eadfc9] bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#d7bb82] hover:shadow-[0_14px_35px_rgba(70,50,20,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#faf4e7] text-[#a17d40]">
          {icon}
        </div>

        {href && (
          <ArrowRight
            size={16}
            className="text-[#b7aa98] transition group-hover:translate-x-1 group-hover:text-[#a17d40]"
          />
        )}
      </div>

      <p className="mt-5 text-xs font-bold text-[#938777]">
        {label}
      </p>

      <p className="mt-1 truncate text-xl font-black tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-[11px] font-medium text-[#aaa092]">
        {caption}
      </p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a0834e]">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-black tracking-tight">
          {title}
        </h2>

        <p className="mt-1 text-sm text-[#918575]">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

function SmartTool({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[#eadfc9] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#c9a24d] hover:shadow-[0_16px_35px_rgba(70,50,20,0.07)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#faf4e7] text-[#a17d40] transition group-hover:bg-[#b9975b] group-hover:text-white">
          {icon}
        </div>

        <ArrowRight
          size={17}
          className="text-[#b7aa98] transition group-hover:translate-x-1 group-hover:text-[#a17d40]"
        />
      </div>

      <h3 className="mt-5 text-base font-black">{title}</h3>

      <p className="mt-2 text-xs leading-5 text-[#918575]">
        {description}
      </p>
    </Link>
  );
}

function ProductCard({
  product,
}: {
  product: Product;
}) {
  const discount = getDiscount(
    Number(product.price),
    product.original_price
      ? Number(product.original_price)
      : null
  );

  return (
    <Link
      href={`/dashboard/products/${product.id}`}
      className="group overflow-hidden rounded-[22px] border border-[#eadfc9] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#c9a24d] hover:shadow-[0_18px_45px_rgba(70,50,20,0.08)]"
    >
      <div className="relative h-56 overflow-hidden bg-[#f8f4ec]">
        {getImageUrl(product.image_url) ? (
          <Image
            src={getImageUrl(product.image_url)!}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-contain p-6 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#b8aa95]">
            <Package size={32} />
          </div>
        )}

        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-[#b9975b] px-2.5 py-1 text-[9px] font-black text-white">
            {discount}% OFF
          </span>
        )}

        {product.is_flash_sale && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#201a12] px-2.5 py-1 text-[9px] font-black text-white">
            <Zap size={10} />
            Flash
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-[#a0834e]">
          {product.brand || "PrimeCart"}
        </p>

        <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-black leading-5">
          {product.name}
        </h3>

        <div className="mt-3 flex items-center gap-1">
          <Star
            size={13}
            className="fill-[#b9975b] text-[#b9975b]"
          />

          <span className="text-xs font-black">
            {Number(product.rating || 0).toFixed(1)}
          </span>

          <span className="text-[10px] text-[#9d9181]">
            ({product.reviews_count || 0})
          </span>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-lg font-black">
            {formatPrice(Number(product.price))}
          </span>

          {product.original_price &&
            Number(product.original_price) >
              Number(product.price) && (
              <span className="pb-0.5 text-xs font-medium text-[#a59a8a] line-through">
                {formatPrice(Number(product.original_price))}
              </span>
            )}
        </div>
      </div>
    </Link>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-[#eadfc9] hover:bg-[#faf7f0]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#faf4e7] text-[#a17d40]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-black">{title}</p>
        <p className="mt-0.5 truncate text-[11px] text-[#958978]">
          {description}
        </p>
      </div>

      <ChevronRight
        size={16}
        className="text-[#b6a997] transition group-hover:translate-x-1 group-hover:text-[#a17d40]"
      />
    </Link>
  );
}

function MiniBenefit({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#faf4e7] text-[#a17d40]">
        {icon}
      </div>

      <div>
        <p className="text-xs font-black">{title}</p>
        <p className="mt-0.5 text-[10px] text-[#958978]">
          {text}
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  href,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-[#ddceb3] bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#faf4e7] text-[#a17d40]">
        {icon}
      </div>

      <h3 className="mt-4 text-base font-black">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#918575]">
        {description}
      </p>

      <Link
        href={href}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#b9975b] px-4 text-xs font-black text-white"
      >
        {action}
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function LayersIcon() {
  return <Layers3 size={18} />;
}

function BrainIcon() {
  return <BarChart3 size={17} />;
}

function ShieldIcon() {
  return <ShieldCheckIcon />;
}

function ShieldCheckIcon() {
  return <ShieldCheck size={17} />;
}
