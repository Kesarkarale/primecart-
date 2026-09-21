"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Package,
  Pencil,
  Save,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  User,
  X,
  Zap,
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string | null;
}

interface Order {
  id: string;
  status: string | null;
  total_amount: number | null;
  created_at: string;
}

interface WishlistItem {
  id: string;
}

export default function ProfilePage() {
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .eq("id", user.id)
      .maybeSingle();

    const finalProfile: Profile = {
      id: user.id,
      full_name:
        profileData?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "PrimeCart Member",
      email: profileData?.email || user.email || "",
      created_at: profileData?.created_at || user.created_at || null,
    };

    setProfile(finalProfile);
    setFullName(finalProfile.full_name || "");

    await Promise.all([loadOrders(user.id), loadWishlist(user.id)]);

    setLoading(false);
  }

  async function loadOrders(userId: string) {
    const { data } = await supabase
      .from("orders")
      .select("id, status, total_amount, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    setOrders(data || []);
  }

  async function loadWishlist(userId: string) {
    const { data } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", userId);

    const items = (data || []) as WishlistItem[];
    setWishlistCount(items.length);
  }

  async function saveProfile() {
    if (!profile) return;

    const cleanName = fullName.trim();

    if (!cleanName) {
      setMessage("Please enter your full name.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: cleanName,
      })
      .eq("id", profile.id);

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setProfile({
      ...profile,
      full_name: cleanName,
    });

    setFullName(cleanName);
    setEditing(false);
    setSaving(false);
    setMessage("Profile updated successfully.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  function cancelEdit() {
    setFullName(profile?.full_name || "");
    setEditing(false);
    setMessage("");
  }

  function formatDate(date: string | null) {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  }

  function formatOrderDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getInitials(name: string | null) {
    if (!name) return "PC";

    return name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function getStatusStyle(status: string | null) {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "cancelled":
      case "canceled":
        return "bg-red-50 text-red-700 border-red-200";

      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "processing":
      case "confirmed":
        return "bg-amber-50 text-amber-700 border-amber-200";

      default:
        return "bg-[#f7f2e8] text-[#806735] border-[#eadfc9]";
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-[#eadfc9] shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-[#b9975b]" />
          </div>

          <div className="text-center">
            <p className="font-semibold text-[#17130d]">
              Loading your profile
            </p>
            <p className="mt-1 text-xs text-[#8a7d6b]">
              Please wait a moment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials = getInitials(profile.full_name);

  const deliveredOrders = orders.filter(
    (order) => order.status?.toLowerCase() === "delivered"
  ).length;

  const totalSpent = orders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#17130d]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#eadfc9] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1450px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#6f6252] transition hover:border-[#b9975b] hover:text-[#977538]"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b9975b]">
                  PrimeCart
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-[#d4c29e] sm:block" />
                <span className="hidden text-xs text-[#8d8170] sm:block">
                  Account
                </span>
              </div>

              <h1 className="text-lg font-bold leading-tight">
                My Profile
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/settings"
              className="flex h-10 items-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-3 text-sm font-semibold text-[#5d5141] transition hover:border-[#b9975b] hover:text-[#977538] sm:px-4"
            >
              <Settings size={16} />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1450px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* PROFILE HERO */}
        <section className="relative overflow-hidden rounded-[28px] border border-[#eadfc9] bg-white shadow-[0_15px_50px_rgba(75,55,20,0.06)]">
          {/* decorative background */}
          <div className="absolute inset-x-0 top-0 h-[155px] bg-gradient-to-r from-[#f0e4cf] via-[#fbf8f0] to-[#eadcc1]" />

          <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border-[40px] border-white/30" />

          <div className="relative px-5 pb-7 pt-20 sm:px-8 sm:pb-8 lg:px-10">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                {/* AVATAR */}
                <div className="relative w-fit">
                  <div className="flex h-28 w-28 items-center justify-center rounded-[30px] border-[5px] border-white bg-gradient-to-br from-[#d8c28e] via-[#b9975b] to-[#86682e] text-3xl font-bold text-white shadow-[0_12px_30px_rgba(100,75,30,0.22)] sm:h-32 sm:w-32 sm:text-4xl">
                    {initials}
                  </div>

                  <button
                    type="button"
                    className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[#17130d] text-white shadow-lg transition hover:bg-[#b9975b]"
                    title="Change profile photo"
                  >
                    <Pencil size={15} />
                  </button>
                </div>

                {/* USER INFO */}
                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {profile.full_name || "PrimeCart Member"}
                    </h2>

                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f4ead6] text-[#a17d3b]">
                      <ShieldCheck size={15} />
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-[#766a59]">
                    {profile.email}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full border border-[#e7d9bd] bg-[#fbf7ed] px-3 py-1.5 text-xs font-bold text-[#8a6b36]">
                      <Sparkles size={13} />
                      PrimeCart Member
                    </span>

                    <span className="flex items-center gap-1.5 rounded-full border border-[#e9e3d8] bg-white px-3 py-1.5 text-xs font-medium text-[#7d7161]">
                      <CalendarDays size={13} />
                      Since {formatDate(profile.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* EDIT BUTTON */}
              {!editing ? (
                <button
                  onClick={() => {
                    setEditing(true);
                    setMessage("");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17130d] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#b9975b]"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={cancelEdit}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-4 py-3 text-sm font-bold text-[#5c5143] transition hover:border-[#b9975b]"
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#b9975b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#977538] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
              message.includes("successfully")
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.includes("successfully") && (
              <CheckCircle2 size={18} />
            )}
            {message}
          </div>
        )}

        {/* STAT CARDS */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <StatCard
            icon={<ShoppingBag size={19} />}
            label="Total Orders"
            value={orders.length.toString()}
            sub="All purchases"
          />

          <StatCard
            icon={<CheckCircle2 size={19} />}
            label="Delivered"
            value={deliveredOrders.toString()}
            sub="Completed orders"
          />

          <StatCard
            icon={<Heart size={19} />}
            label="Wishlist"
            value={wishlistCount.toString()}
            sub="Saved products"
          />

          <StatCard
            icon={<Star size={19} />}
            label="Total Spent"
            value={`₹${totalSpent.toLocaleString("en-IN")}`}
            sub="Order value"
          />
        </section>

        {/* CONTENT */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* PERSONAL INFORMATION */}
            <section className="rounded-[26px] border border-[#eadfc9] bg-white p-5 shadow-[0_10px_35px_rgba(75,55,20,0.04)] sm:p-7">
              <SectionHeading
                eyebrow="ACCOUNT INFORMATION"
                title="Personal details"
                description="Your basic information associated with your PrimeCart account."
              />

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#827563]">
                    Full Name
                  </label>

                  {editing ? (
                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b9975b]"
                      />

                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="h-13 w-full rounded-xl border border-[#dfd2bc] bg-[#fffdf9] pl-11 pr-4 text-sm font-medium outline-none transition placeholder:text-[#a49a8a] focus:border-[#b9975b] focus:ring-4 focus:ring-[#b9975b]/10"
                      />
                    </div>
                  ) : (
                    <InfoBox
                      icon={<User size={18} />}
                      value={profile.full_name || "Not added"}
                    />
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#827563]">
                    Email Address
                  </label>

                  <InfoBox
                    icon={<Mail size={18} />}
                    value={profile.email || "Not available"}
                    secondary="Verified account email"
                  />
                </div>

                {/* Member */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#827563]">
                    Member Since
                  </label>

                  <InfoBox
                    icon={<CalendarDays size={18} />}
                    value={formatDate(profile.created_at)}
                  />
                </div>

                {/* Account */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#827563]">
                    Account Status
                  </label>

                  <div className="flex min-h-[58px] items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                        <ShieldCheck size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-emerald-800">
                          Active
                        </p>
                        <p className="text-[11px] text-emerald-700/70">
                          Account in good standing
                        </p>
                      </div>
                    </div>

                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </section>

            {/* RECENT ORDERS */}
            <section className="rounded-[26px] border border-[#eadfc9] bg-white p-5 shadow-[0_10px_35px_rgba(75,55,20,0.04)] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <SectionHeading
                  eyebrow="SHOPPING ACTIVITY"
                  title="Recent orders"
                  description="Keep track of your latest purchases."
                />

                <Link
                  href="/dashboard/orders"
                  className="hidden items-center gap-1 text-sm font-bold text-[#977538] transition hover:text-[#6e5426] sm:flex"
                >
                  View all
                  <ArrowRight size={15} />
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="mt-7 rounded-2xl border border-dashed border-[#dfd2bc] bg-[#fcfaf6] px-5 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2e9d9] text-[#b9975b]">
                    <Package size={24} />
                  </div>

                  <h4 className="mt-4 font-bold">
                    No orders yet
                  </h4>

                  <p className="mx-auto mt-1 max-w-sm text-sm text-[#847866]">
                    Once you place your first order, your recent purchases
                    will appear here.
                  </p>

                  <Link
                    href="/dashboard/products"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#17130d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#b9975b]"
                  >
                    Start Shopping
                    <ArrowRight size={15} />
                  </Link>
                </div>
              ) : (
                <div className="mt-6 overflow-hidden rounded-2xl border border-[#eee5d7]">
                  {orders.slice(0, 5).map((order, index) => (
                    <div
                      key={order.id}
                      className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between ${
                        index !== Math.min(orders.length, 5) - 1
                          ? "border-b border-[#eee5d7]"
                          : ""
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f6efe2] text-[#9b783b]">
                          <Package size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </p>

                          <p className="mt-0.5 text-xs text-[#8a7d6b]">
                            {formatOrderDate(order.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-5 sm:justify-end">
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-bold">
                            ₹
                            {Number(
                              order.total_amount || 0
                            ).toLocaleString("en-IN")}
                          </p>

                          <span
                            className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusStyle(
                              order.status
                            )}`}
                          >
                            {order.status || "Pending"}
                          </span>
                        </div>

                        <ChevronRight
                          size={17}
                          className="text-[#b5aa99]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link
                href="/dashboard/orders"
                className="mt-4 flex items-center justify-center gap-1 text-sm font-bold text-[#977538] sm:hidden"
              >
                View all orders
                <ArrowRight size={15} />
              </Link>
            </section>
          </div>

          {/* RIGHT */}
          <aside className="space-y-6">
            {/* QUICK ACTIONS */}
            <section className="rounded-[26px] border border-[#eadfc9] bg-white p-5 shadow-[0_10px_35px_rgba(75,55,20,0.04)] sm:p-6">
              <SectionHeading
                eyebrow="QUICK ACCESS"
                title="Your shortcuts"
                description="Jump directly to your shopping tools."
              />

              <div className="mt-6 space-y-2.5">
                <QuickAction
                  href="/dashboard/orders"
                  icon={<ShoppingBag size={18} />}
                  title="My Orders"
                  description="Track your purchases"
                />

                <QuickAction
                  href="/dashboard/wishlist"
                  icon={<Heart size={18} />}
                  title="Wishlist"
                  description={`${wishlistCount} saved ${
                    wishlistCount === 1 ? "item" : "items"
                  }`}
                />

                <QuickAction
                  href="/dashboard/prime-match"
                  icon={<Sparkles size={18} />}
                  title="PrimeMatch"
                  description="Find products made for you"
                />

                <QuickAction
                  href="/dashboard/settings"
                  icon={<Settings size={18} />}
                  title="Settings"
                  description="Manage your preferences"
                />
              </div>
            </section>

            {/* SECURITY */}
            <section className="rounded-[26px] border border-[#eadfc9] bg-white p-5 shadow-[0_10px_35px_rgba(75,55,20,0.04)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3ead8] text-[#98743a]">
                  <Shield size={20} />
                </div>

                <div>
                  <p className="text-sm font-bold">
                    Account security
                  </p>
                  <p className="text-xs text-[#887b69]">
                    Your account is protected
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <div>
                    <p className="text-sm font-bold text-emerald-800">
                      Secure account
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700/80">
                      Your account authentication is managed securely
                      through Supabase.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/settings"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#eadfc9] px-4 py-3 text-sm font-bold text-[#5f5343] transition hover:border-[#b9975b] hover:text-[#977538]"
              >
                Security settings
                <ArrowRight size={15} />
              </Link>
            </section>

            {/* PRIME MATCH PROMO */}
            <section className="relative overflow-hidden rounded-[26px] bg-[#17130d] p-6 text-white shadow-[0_15px_40px_rgba(20,16,10,0.12)]">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full border-[35px] border-[#b9975b]/10" />

              <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-[#b9975b]/10 blur-3xl" />

              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#b9975b]">
                  <Zap size={20} />
                </div>

                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d8bc83]">
                  PrimeMatch
                </p>

                <h3 className="mt-2 text-xl font-bold leading-tight">
                  Discover products
                  <br />
                  matched to you.
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/55">
                  Tell us what you need, your budget and preferences. We’ll
                  help you discover relevant products.
                </p>

                <Link
                  href="/dashboard/prime-match"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#17130d] transition hover:bg-[#f3ead7]"
                >
                  Try PrimeMatch
                  <ArrowRight size={15} />
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------
   COMPONENTS
------------------------------------------------------- */

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="group rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-[0_8px_25px_rgba(75,55,20,0.035)] transition hover:-translate-y-0.5 hover:border-[#d8c29a] hover:shadow-[0_12px_30px_rgba(75,55,20,0.07)] sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5ecdc] text-[#9a773b]">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.13em] text-[#8a7e6d]">
        {label}
      </p>

      <p className="mt-1 truncate text-xl font-bold sm:text-2xl">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-[#968a78]">
        {sub}
      </p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b9975b]">
        {eyebrow}
      </p>

      <h3 className="mt-1 text-xl font-bold tracking-tight">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-6 text-[#817564]">
        {description}
      </p>
    </div>
  );
}

function InfoBox({
  icon,
  value,
  secondary,
}: {
  icon: React.ReactNode;
  value: string;
  secondary?: string;
}) {
  return (
    <div className="flex min-h-[58px] items-center gap-3 rounded-xl border border-[#eadfc9] bg-[#fcfaf6] px-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3ead9] text-[#9a773b]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#29231b]">
          {value}
        </p>

        {secondary && (
          <p className="mt-0.5 text-[11px] text-[#8e8170]">
            {secondary}
          </p>
        )}
      </div>
    </div>
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
      className="group flex items-center gap-3 rounded-2xl border border-transparent bg-[#faf8f3] p-3.5 transition hover:border-[#eadfc9] hover:bg-white"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f2e8d6] text-[#977538] transition group-hover:bg-[#17130d] group-hover:text-white">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#29231b]">
          {title}
        </p>

        <p className="mt-0.5 truncate text-xs text-[#887b6a]">
          {description}
        </p>
      </div>

      <ChevronRight
        size={17}
        className="shrink-0 text-[#b7aa96] transition group-hover:translate-x-0.5 group-hover:text-[#977538]"
      />
    </Link>
  );
}
