"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  Box,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  CreditCard,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Sun,
  Tag,
  TrendingUp,
  Truck,
  User,
  Users,
  X,
  ArrowUpRight,
  Star,
  MoreHorizontal,
  Clock3,
  CheckCircle2,
  XCircle,
  Headphones,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: string;
  product: string;
  category: string;
  amount: string;
  status: "Delivered" | "Processing" | "Cancelled";
  date: string;
};

const orders: Order[] = [
  {
    id: "#PC-10482",
    product: "Samsung Smartphone Pro Max",
    category: "Electronics",
    amount: "₹54,999",
    status: "Delivered",
    date: "Sep 08, 2026",
  },
  {
    id: "#PC-10479",
    product: "Sony WH Headphones",
    category: "Electronics",
    amount: "₹12,499",
    status: "Processing",
    date: "Sep 07, 2026",
  },
  {
    id: "#PC-10473",
    product: "Levis Premium Denim Jacket",
    category: "Fashion",
    amount: "₹3,499",
    status: "Delivered",
    date: "Sep 05, 2026",
  },
  {
    id: "#PC-10468",
    product: "GlowCare Vitamin C Serum",
    category: "Beauty",
    amount: "₹899",
    status: "Processing",
    date: "Sep 03, 2026",
  },
];

const products = [
  {
    name: "Samsung Smartphone Pro Max",
    category: "Electronics",
    price: "₹54,999",
    rating: "4.8",
    sold: "248 sold",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Sony WH Headphones",
    category: "Electronics",
    price: "₹12,499",
    rating: "4.7",
    sold: "184 sold",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Levis Denim Jacket",
    category: "Fashion",
    price: "₹3,499",
    rating: "4.6",
    sold: "156 sold",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80",
  },
];

const categories = [
  {
    name: "Electronics",
    count: "1,248 products",
    icon: "💻",
  },
  {
    name: "Fashion",
    count: "892 products",
    icon: "👕",
  },
  {
    name: "Beauty",
    count: "624 products",
    icon: "✨",
  },
  {
    name: "Home & Kitchen",
    count: "736 products",
    icon: "🏠",
  },
];

export default function DashboardPage() {
  const supabase = createClient();

  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("PrimeCart User");
  const [userEmail, setUserEmail] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("primecart-theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
    }

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const metadata = user.user_metadata || {};

        setUserName(
          metadata.full_name ||
            metadata.name ||
            user.email?.split("@")[0] ||
            "PrimeCart User"
        );

        setUserEmail(user.email || "");
      }
    };

    loadUser();
  }, [supabase]);

  const toggleTheme = () => {
    const nextMode = !darkMode;

    setDarkMode(nextMode);
    localStorage.setItem(
      "primecart-theme",
      nextMode ? "dark" : "light"
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const initials = userName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-[#11100e] text-white"
          : "bg-[#f8f6f1] text-[#29251f]"
      }`}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } ${
          darkMode
            ? "border-[#302a23] bg-[#171512]"
            : "border-[#e9e3d8] bg-white"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b px-6">
          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="PrimeCart"
              className="h-11 w-auto object-contain"
            />
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* User mini profile */}
        <div className="mx-4 mt-5 rounded-2xl border p-3 ${
          darkMode
            ? 'border-[#393128] bg-[#211d18]'
            : 'border-[#eee8dc] bg-[#faf8f3]'
        }">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c49635] text-sm font-bold text-white">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {userName}
              </p>
              <p
                className={`truncate text-xs ${
                  darkMode ? "text-gray-500" : "text-gray-500"
                }`}
              >
                {userEmail || "Welcome back"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-7 flex-1 px-4">
          <p
            className={`mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] ${
              darkMode ? "text-gray-600" : "text-gray-400"
            }`}
          >
            Main Menu
          </p>

          <div className="space-y-1.5">
            <NavItem
              href="/dashboard"
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
              active
              darkMode={darkMode}
            />

            <NavItem
              href="/products"
              icon={<ShoppingBag size={18} />}
              label="Products"
              darkMode={darkMode}
            />

            <NavItem
              href="/categories"
              icon={<Tag size={18} />}
              label="Categories"
              darkMode={darkMode}
            />

            <NavItem
              href="/orders"
              icon={<Package size={18} />}
              label="My Orders"
              darkMode={darkMode}
              badge="4"
            />

            <NavItem
              href="/wishlist"
              icon={<Heart size={18} />}
              label="Wishlist"
              darkMode={darkMode}
            />

            <NavItem
              href="/cart"
              icon={<ShoppingCart size={18} />}
              label="Shopping Cart"
              darkMode={darkMode}
              badge="2"
            />
          </div>

          <p
            className={`mb-3 mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.18em] ${
              darkMode ? "text-gray-600" : "text-gray-400"
            }`}
          >
            Account
          </p>

          <div className="space-y-1.5">
            <NavItem
              href="/profile"
              icon={<User size={18} />}
              label="My Profile"
              darkMode={darkMode}
            />

            <NavItem
              href="/settings"
              icon={<Settings size={18} />}
              label="Settings"
              darkMode={darkMode}
            />

            <NavItem
              href="/help"
              icon={<Headphones size={18} />}
              label="Help & Support"
              darkMode={darkMode}
            />
          </div>
        </nav>

        {/* Bottom offer */}
        <div className="p-4">
          <div
            className={`overflow-hidden rounded-2xl p-4 ${
              darkMode
                ? "border border-[#493d2b] bg-[#292219]"
                : "bg-[#fbf1dc]"
            }`}
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#c49635] text-white">
              <Sparkles size={17} />
            </div>

            <p className="text-sm font-bold">
              PrimeCart Premium
            </p>

            <p
              className={`mt-1 text-xs leading-5 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Get exclusive deals and faster delivery.
            </p>

            <button className="mt-3 text-xs font-bold text-[#b27f1d]">
              Explore benefits →
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-[270px]">
        {/* Topbar */}
        <header
          className={`sticky top-0 z-30 border-b backdrop-blur-xl ${
            darkMode
              ? "border-[#302a23] bg-[#11100e]/90"
              : "border-[#e9e3d8] bg-[#f8f6f1]/90"
          }`}
        >
          <div className="flex h-20 items-center gap-4 px-5 sm:px-7 lg:px-9">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border p-2.5 lg:hidden"
            >
              <Menu size={20} />
            </button>

            {/* Search */}
            <div className="relative hidden max-w-md flex-1 sm:block">
              <Search
                size={18}
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, orders..."
                className={`h-11 w-full rounded-xl border pl-11 pr-4 text-sm outline-none transition ${
                  darkMode
                    ? "border-[#393128] bg-[#1a1815] text-white placeholder:text-gray-600 focus:border-[#c49635]"
                    : "border-[#e6e0d5] bg-white text-[#29251f] placeholder:text-gray-400 focus:border-[#c49635]"
                }`}
              />
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                  darkMode
                    ? "border-[#40362a] bg-[#211d18] text-[#dfb34e] hover:bg-[#2b251d]"
                    : "border-[#e8dfcf] bg-white text-[#9b701d] hover:bg-[#fffaf0]"
                }`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                type="button"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl border ${
                  darkMode
                    ? "border-[#40362a] bg-[#211d18]"
                    : "border-[#e8dfcf] bg-white"
                }`}
              >
                <Bell size={18} />

                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#c49635]" />
              </button>

              <div
                className={`hidden h-9 w-px sm:block ${
                  darkMode ? "bg-[#393128]" : "bg-[#e5dfd4]"
                }`}
              />

              <Link
                href="/profile"
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c49635] text-xs font-bold text-white">
                  {initials}
                </div>

                <div className="hidden text-left md:block">
                  <p className="max-w-[130px] truncate text-sm font-semibold">
                    {userName}
                  </p>

                  <p
                    className={`text-[11px] ${
                      darkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    Customer
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className="hidden md:block"
                />
              </Link>
            </div>
          </div>

          {/* Mobile search */}
          <div className="px-5 pb-4 sm:hidden">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className={`h-11 w-full rounded-xl border pl-11 pr-4 text-sm outline-none ${
                  darkMode
                    ? "border-[#393128] bg-[#1a1815]"
                    : "border-[#e6e0d5] bg-white"
                }`}
              />
            </div>
          </div>
        </header>

        {/* Dashboard body */}
        <div className="px-5 py-7 sm:px-7 lg:px-9">
          {/* Welcome */}
          <section className="mb-7">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div
                  className={`mb-2 flex items-center gap-2 text-sm ${
                    darkMode ? "text-[#d5a94b]" : "text-[#b17d1d]"
                  }`}
                >
                  <Sparkles size={15} />
                  Welcome back
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Hello, {userName.split(" ")[0]} 👋
                </h1>

                <p
                  className={`mt-2 text-sm ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  Here&apos;s what&apos;s happening with your PrimeCart
                  account today.
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/products"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#c49635] px-5 text-sm font-semibold text-white shadow-lg shadow-[#c49635]/20 transition hover:bg-[#ae8128]"
                >
                  <ShoppingBag size={17} />
                  Shop Now
                </Link>

                <Link
                  href="/orders"
                  className={`hidden h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold sm:flex ${
                    darkMode
                      ? "border-[#40362a] bg-[#211d18] hover:bg-[#2b251d]"
                      : "border-[#e6e0d5] bg-white hover:bg-[#faf8f3]"
                  }`}
                >
                  View Orders
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard
              icon={<ShoppingBag size={20} />}
              label="Total Orders"
              value="24"
              change="+12.5%"
              description="vs last month"
              darkMode={darkMode}
            />

            <StatCard
              icon={<CreditCard size={20} />}
              label="Total Spent"
              value="₹86,420"
              change="+8.2%"
              description="vs last month"
              darkMode={darkMode}
            />

            <StatCard
              icon={<Heart size={20} />}
              label="Wishlist"
              value="18"
              change="+4"
              description="items saved"
              darkMode={darkMode}
            />

            <StatCard
              icon={<Package size={20} />}
              label="In Delivery"
              value="3"
              change="Active"
              description="orders on the way"
              darkMode={darkMode}
            />
          </section>

          {/* Main grid */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
            {/* Sales overview */}
            <div
              className={`rounded-3xl border p-5 sm:p-6 ${
                darkMode
                  ? "border-[#302a23] bg-[#171512]"
                  : "border-[#e9e3d8] bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Shopping overview
                  </p>

                  <div className="mt-1 flex items-end gap-3">
                    <h2 className="text-2xl font-bold">
                      ₹86,420
                    </h2>

                    <span className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                      <TrendingUp size={13} />
                      8.2%
                    </span>
                  </div>
                </div>

                <select
                  className={`rounded-xl border px-3 py-2 text-xs outline-none ${
                    darkMode
                      ? "border-[#393128] bg-[#211d18] text-gray-300"
                      : "border-[#e6e0d5] bg-[#faf8f3] text-gray-600"
                  }`}
                  defaultValue="6"
                >
                  <option value="6">Last 6 months</option>
                  <option value="12">Last 12 months</option>
                  <option value="1">This month</option>
                </select>
              </div>

              {/* Chart */}
              <div className="mt-8 h-[250px]">
                <div className="relative h-full">
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[100, 75, 50, 25, 0].map((item) => (
                      <div
                        key={item}
                        className={`border-t ${
                          darkMode
                            ? "border-[#29251f]"
                            : "border-[#f0ece4]"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 top-2 flex items-end justify-between gap-3 px-2">
                    {[
                      { month: "Apr", value: 48 },
                      { month: "May", value: 62 },
                      { month: "Jun", value: 55 },
                      { month: "Jul", value: 74 },
                      { month: "Aug", value: 68 },
                      { month: "Sep", value: 88 },
                    ].map((item) => (
                      <div
                        key={item.month}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                      >
                        <div className="relative flex h-full w-full items-end justify-center">
                          <div
                            className="w-full max-w-[42px] rounded-t-lg bg-[#c49635] transition-all duration-500 hover:bg-[#b1842b]"
                            style={{
                              height: `${item.value}%`,
                            }}
                          />
                        </div>

                        <span
                          className={`text-[11px] ${
                            darkMode
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          {item.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div
              className={`rounded-3xl border p-5 sm:p-6 ${
                darkMode
                  ? "border-[#302a23] bg-[#171512]"
                  : "border-[#e9e3d8] bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">
                    Quick actions
                  </p>

                  <p
                    className={`mt-1 text-xs ${
                      darkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    Manage your shopping easily
                  </p>
                </div>

                <Sparkles
                  size={19}
                  className="text-[#c49635]"
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <QuickAction
                  href="/products"
                  icon={<ShoppingBag size={19} />}
                  title="Shop"
                  text="Explore products"
                  darkMode={darkMode}
                />

                <QuickAction
                  href="/orders"
                  icon={<Package size={19} />}
                  title="Orders"
                  text="Track purchases"
                  darkMode={darkMode}
                />

                <QuickAction
                  href="/wishlist"
                  icon={<Heart size={19} />}
                  title="Wishlist"
                  text="Saved items"
                  darkMode={darkMode}
                />

                <QuickAction
                  href="/profile"
                  icon={<CircleUserRound size={19} />}
                  title="Profile"
                  text="Account details"
                  darkMode={darkMode}
                />
              </div>

              {/* Delivery banner */}
              <div
                className={`mt-4 rounded-2xl p-4 ${
                  darkMode
                    ? "bg-[#241f18]"
                    : "bg-[#fbf1dc]"
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c49635] text-white">
                    <Truck size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      3 orders on the way
                    </p>

                    <p
                      className={`mt-1 text-xs leading-5 ${
                        darkMode
                          ? "text-gray-500"
                          : "text-gray-600"
                      }`}
                    >
                      Your purchases are being delivered safely.
                    </p>

                    <Link
                      href="/orders"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#ad7d20]"
                    >
                      Track orders
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent orders + categories */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
            {/* Orders */}
            <div
              className={`rounded-3xl border ${
                darkMode
                  ? "border-[#302a23] bg-[#171512]"
                  : "border-[#e9e3d8] bg-white"
              }`}
            >
              <div className="flex items-center justify-between border-b px-5 py-5 sm:px-6">
                <div>
                  <h2 className="font-bold">
                    Recent orders
                  </h2>

                  <p
                    className={`mt-1 text-xs ${
                      darkMode
                        ? "text-gray-500"
                        : "text-gray-500"
                    }`}
                  >
                    Your latest purchases
                  </p>
                </div>

                <Link
                  href="/orders"
                  className="text-xs font-bold text-[#ad7d20]"
                >
                  View all
                </Link>
              </div>

              <div className="divide-y">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`flex items-center gap-4 px-5 py-4 sm:px-6 ${
                      darkMode
                        ? "divide-[#302a23]"
                        : "divide-[#eee8dc]"
                    }`}
                  >
                    <div
                      className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:flex ${
                        darkMode
                          ? "bg-[#241f18]"
                          : "bg-[#fbf1dc]"
                      }`}
                    >
                      <Package
                        size={18}
                        className="text-[#b88925]"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {order.product}
                      </p>

                      <div
                        className={`mt-1 flex flex-wrap items-center gap-2 text-[11px] ${
                          darkMode
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        <span>{order.id}</span>
                        <span>•</span>
                        <span>{order.date}</span>
                      </div>
                    </div>

                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-bold">
                        {order.amount}
                      </p>

                      <p
                        className={`mt-1 text-[11px] ${
                          darkMode
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        {order.category}
                      </p>
                    </div>

                    <StatusBadge
                      status={order.status}
                      darkMode={darkMode}
                    />

                    <button
                      type="button"
                      className={`hidden rounded-lg p-2 sm:block ${
                        darkMode
                          ? "hover:bg-[#241f18]"
                          : "hover:bg-[#faf8f3]"
                      }`}
                    >
                      <MoreHorizontal size={17} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div
              className={`rounded-3xl border p-5 sm:p-6 ${
                darkMode
                  ? "border-[#302a23] bg-[#171512]"
                  : "border-[#e9e3d8] bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">
                    Shop by category
                  </h2>

                  <p
                    className={`mt-1 text-xs ${
                      darkMode
                        ? "text-gray-500"
                        : "text-gray-500"
                    }`}
                  >
                    Find what you need faster
                  </p>
                </div>

                <Link
                  href="/categories"
                  className="text-xs font-bold text-[#ad7d20]"
                >
                  View all
                </Link>
              </div>

              <div className="mt-5 space-y-2.5">
                {categories.map((category) => (
                  <Link
                    href={`/categories/${category.name
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                    key={category.name}
                    className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                      darkMode
                        ? "border-[#302a23] hover:border-[#59492f] hover:bg-[#211d18]"
                        : "border-[#eee8dc] hover:border-[#dfc68e] hover:bg-[#fffaf0]"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
                        darkMode
                          ? "bg-[#241f18]"
                          : "bg-[#fbf1dc]"
                      }`}
                    >
                      {category.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {category.name}
                      </p>

                      <p
                        className={`mt-0.5 text-[11px] ${
                          darkMode
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        {category.count}
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className={
                        darkMode
                          ? "text-gray-600"
                          : "text-gray-400"
                      }
                    />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Popular products */}
          <section
            className={`mt-6 rounded-3xl border ${
              darkMode
                ? "border-[#302a23] bg-[#171512]"
                : "border-[#e9e3d8] bg-white"
            }`}
          >
            <div className="flex items-center justify-between border-b px-5 py-5 sm:px-6">
              <div>
                <h2 className="font-bold">
                  Popular products
                </h2>

                <p
                  className={`mt-1 text-xs ${
                    darkMode
                      ? "text-gray-500"
                      : "text-gray-500"
                  }`}
                >
                  Trending products customers love
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#ad7d20]"
              >
                Browse all
                <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
              {products.map((product) => (
                <Link
                  href="/products"
                  key={product.name}
                  className={`group overflow-hidden rounded-2xl border ${
                    darkMode
                      ? "border-[#302a23] hover:border-[#59492f]"
                      : "border-[#eee8dc] hover:border-[#dfc68e]"
                  }`}
                >
                  <div
                    className={`relative h-48 overflow-hidden ${
                      darkMode
                        ? "bg-[#211d18]"
                        : "bg-[#faf8f3]"
                    }`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <button
                      type="button"
                      onClick={(e) => e.preventDefault()}
                      className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md ${
                        darkMode
                          ? "bg-black/50 text-white"
                          : "bg-white/85 text-gray-600"
                      }`}
                    >
                      <Heart size={16} />
                    </button>
                  </div>

                  <div className="p-4">
                    <p
                      className={`text-[11px] font-medium ${
                        darkMode
                          ? "text-[#c49635]"
                          : "text-[#ad7d20]"
                      }`}
                    >
                      {product.category}
                    </p>

                    <h3 className="mt-1 line-clamp-1 text-sm font-semibold">
                      {product.name}
                    </h3>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="font-bold">
                        {product.price}
                      </p>

                      <div className="flex items-center gap-1 text-xs">
                        <Star
                          size={13}
                          fill="currentColor"
                          className="text-[#c49635]"
                        />
                        {product.rating}
                      </div>
                    </div>

                    <p
                      className={`mt-2 text-[11px] ${
                        darkMode
                          ? "text-gray-600"
                          : "text-gray-400"
                      }`}
                    >
                      {product.sold}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Bottom trust section */}
          <section
            className={`mt-6 grid gap-4 sm:grid-cols-3`}
          >
            <TrustCard
              icon={<Truck size={20} />}
              title="Fast delivery"
              text="Quick and reliable delivery"
              darkMode={darkMode}
            />

            <TrustCard
              icon={<ShieldCheck size={20} />}
              title="Secure shopping"
              text="Your information stays protected"
              darkMode={darkMode}
            />

            <TrustCard
              icon={<Headphones size={20} />}
              title="24/7 support"
              text="We're here whenever you need us"
              darkMode={darkMode}
            />
          </section>

          {/* Footer */}
          <footer className="pb-4 pt-10">
            <div
              className={`flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row ${
                darkMode
                  ? "border-[#302a23] text-gray-600"
                  : "border-[#e9e3d8] text-gray-400"
              }`}
            >
              <p>
                © 2026 PrimeCart. All rights reserved.
              </p>

              <div className="flex gap-5">
                <Link
                  href="/privacy"
                  className="hover:text-[#b88925]"
                >
                  Privacy
                </Link>

                <Link
                  href="/terms"
                  className="hover:text-[#b88925]"
                >
                  Terms
                </Link>

                <Link
                  href="/help"
                  className="hover:text-[#b88925]"
                >
                  Help
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}

/* ---------------- Components ---------------- */

function NavItem({
  href,
  icon,
  label,
  active = false,
  badge,
  darkMode,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  darkMode: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
        active
          ? "bg-[#c49635] text-white shadow-md shadow-[#c49635]/15"
          : darkMode
          ? "text-gray-400 hover:bg-[#211d18] hover:text-white"
          : "text-gray-600 hover:bg-[#faf8f3] hover:text-[#29251f]"
      }`}
    >
      <span
        className={
          active
            ? "text-white"
            : darkMode
            ? "text-gray-500 group-hover:text-[#d5a94b]"
            : "text-gray-400 group-hover:text-[#b88925]"
        }
      >
        {icon}
      </span>

      <span className="flex-1">{label}</span>

      {badge && (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            active
              ? "bg-white/20 text-white"
              : darkMode
              ? "bg-[#2b251d] text-gray-500"
              : "bg-[#f4eee2] text-gray-500"
          }`}
        >
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
  change,
  description,
  darkMode,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  description: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 ${
        darkMode
          ? "border-[#302a23] bg-[#171512]"
          : "border-[#e9e3d8] bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            darkMode
              ? "bg-[#292219] text-[#d5a94b]"
              : "bg-[#fbf1dc] text-[#ad7d20]"
          }`}
        >
          {icon}
        </div>

        <span
          className={`text-[11px] font-semibold ${
            change === "Active"
              ? "text-[#ad7d20]"
              : "text-green-600"
          }`}
        >
          {change}
        </span>
      </div>

      <p
        className={`mt-5 text-xs font-medium ${
          darkMode ? "text-gray-500" : "text-gray-500"
        }`}
      >
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight">
        {value}
      </p>

      <p
        className={`mt-1 text-[11px] ${
          darkMode ? "text-gray-600" : "text-gray-400"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  text,
  darkMode,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  darkMode: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border p-4 transition ${
        darkMode
          ? "border-[#302a23] hover:border-[#59492f] hover:bg-[#211d18]"
          : "border-[#eee8dc] hover:border-[#dfc68e] hover:bg-[#fffaf0]"
      }`}
    >
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${
          darkMode
            ? "bg-[#292219] text-[#d5a94b]"
            : "bg-[#fbf1dc] text-[#ad7d20]"
        }`}
      >
        {icon}
      </div>

      <p className="text-sm font-semibold">{title}</p>

      <p
        className={`mt-1 text-[10px] ${
          darkMode ? "text-gray-600" : "text-gray-400"
        }`}
      >
        {text}
      </p>
    </Link>
  );
}

function StatusBadge({
  status,
  darkMode,
}: {
  status: Order["status"];
  darkMode: boolean;
}) {
  if (status === "Delivered") {
    return (
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
          darkMode
            ? "bg-green-950/30 text-green-400"
            : "bg-green-50 text-green-600"
        }`}
      >
        <CheckCircle2 size={11} />
        Delivered
      </span>
    );
  }

  if (status === "Cancelled") {
    return (
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
          darkMode
            ? "bg-red-950/30 text-red-400"
            : "bg-red-50 text-red-600"
        }`}
      >
        <XCircle size={11} />
        Cancelled
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        darkMode
          ? "bg-[#292219] text-[#d5a94b]"
          : "bg-[#fbf1dc] text-[#ad7d20]"
      }`}
    >
      <Clock3 size={11} />
      Processing
    </span>
  );
}

function TrustCard({
  icon,
  title,
  text,
  darkMode,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-4 ${
        darkMode
          ? "border-[#302a23] bg-[#171512]"
          : "border-[#e9e3d8] bg-white"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          darkMode
            ? "bg-[#292219] text-[#d5a94b]"
            : "bg-[#fbf1dc] text-[#ad7d20]"
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold">{title}</p>

        <p
          className={`mt-0.5 text-[11px] ${
            darkMode ? "text-gray-600" : "text-gray-400"
          }`}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
