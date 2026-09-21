"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Mail,
  ShieldCheck,
  CalendarDays,
  ShoppingBag,
  Heart,
  Settings,
  Edit3,
  Save,
  X,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Camera,
} from "lucide-react";
import Link from "next/link";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at?: string;
}

export default function ProfilePage() {
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
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

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .eq("id", user.id)
      .maybeSingle();

    const profileData: Profile = {
      id: user.id,
      full_name:
        data?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "PrimeCart User",
      email: data?.email || user.email || "",
      created_at: data?.created_at || user.created_at,
    };

    setProfile(profileData);
    setFullName(profileData.full_name || "");
    setLoading(false);
  }

  async function saveProfile() {
    if (!profile) return;

    if (!fullName.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
      })
      .eq("id", profile.id);

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setProfile({
      ...profile,
      full_name: fullName.trim(),
    });

    setEditing(false);
    setMessage("Profile updated successfully.");
    setSaving(false);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  function cancelEditing() {
    setFullName(profile?.full_name || "");
    setEditing(false);
    setMessage("");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#b9975b]" />
          <p className="text-sm text-[#7c705f]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials =
    profile.full_name
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PC";

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#17130d]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#eadfc9] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#5f5445] transition hover:border-[#b9975b] hover:text-[#977538]"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#b9975b]">
                PrimeCart
              </p>
              <h1 className="text-lg font-bold">My Profile</h1>
            </div>
          </div>

          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-4 py-2.5 text-sm font-semibold text-[#514839] transition hover:border-[#b9975b] hover:text-[#977538]"
          >
            <Settings size={16} />
            <span className="hidden sm:inline">Settings</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-[#eadfc9] bg-white shadow-[0_15px_50px_rgba(90,70,30,0.07)]">
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-[#f3ead7] via-[#fbf7ee] to-[#eee1c8]" />

          <div className="relative px-5 pb-7 pt-16 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end">
                {/* Avatar */}
                <div className="relative">
                  <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-[#cdb47d] to-[#977538] text-3xl font-bold text-white shadow-xl">
                    {initials}
                  </div>

                  <button
                    type="button"
                    className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-[#17130d] text-white transition hover:bg-[#b9975b]"
                    title="Change profile picture"
                  >
                    <Camera size={15} />
                  </button>
                </div>

                <div className="pb-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h2 className="text-2xl font-bold sm:text-3xl">
                      {profile.full_name || "PrimeCart User"}
                    </h2>

                    <ShieldCheck
                      size={20}
                      className="text-[#b9975b]"
                    />
                  </div>

                  <p className="text-sm text-[#756958]">
                    {profile.email}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f7f0e3] px-3 py-1 text-xs font-semibold text-[#8b6d36]">
                      PrimeCart Member
                    </span>

                    <span className="flex items-center gap-1 text-xs text-[#8a7c6a]">
                      <CalendarDays size={13} />
                      Member since {memberSince}
                    </span>
                  </div>
                </div>
              </div>

              {!editing ? (
                <button
                  onClick={() => {
                    setEditing(true);
                    setMessage("");
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#17130d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b9975b]"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={cancelEditing}
                    className="flex items-center gap-2 rounded-xl border border-[#eadfc9] bg-white px-4 py-3 text-sm font-semibold text-[#5d5141] hover:border-[#b9975b]"
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-[#b9975b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#977538] disabled:cursor-not-allowed disabled:opacity-60"
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

        {/* Success/Error */}
        {message && (
          <div
            className={`mt-5 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
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

        <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_330px]">
          {/* Main Profile */}
          <section className="rounded-3xl border border-[#eadfc9] bg-white p-5 shadow-[0_12px_40px_rgba(90,70,30,0.05)] sm:p-7">
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b9975b]">
                Personal Information
              </p>
              <h3 className="mt-1 text-xl font-bold">
                Account details
              </h3>
              <p className="mt-1 text-sm text-[#7c705f]">
                Manage the information connected to your PrimeCart account.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4c4337]">
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
                      className="w-full rounded-xl border border-[#dfd2bc] bg-[#fffdf9] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#b9975b] focus:ring-4 focus:ring-[#b9975b]/10"
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[52px] items-center gap-3 rounded-xl border border-[#eadfc9] bg-[#faf8f3] px-4">
                    <User size={18} className="text-[#b9975b]" />
                    <span className="text-sm font-medium">
                      {profile.full_name || "Not added"}
                    </span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4c4337]">
                  Email Address
                </label>

                <div className="flex min-h-[52px] items-center gap-3 rounded-xl border border-[#eadfc9] bg-[#faf8f3] px-4">
                  <Mail size={18} className="text-[#b9975b]" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {profile.email}
                    </p>
                    <p className="text-[11px] text-[#8c806f]">
                      Email cannot be changed here
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="mt-7 border-t border-[#eee5d7] pt-7">
              <h4 className="mb-4 text-sm font-bold">
                Account Status
              </h4>

              <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-emerald-800">
                      Account Active
                    </p>
                    <p className="text-xs text-emerald-700/80">
                      Your PrimeCart account is active and ready to shop.
                    </p>
                  </div>
                </div>

                <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 sm:block">
                  ACTIVE
                </span>
              </div>
            </div>
          </section>

          {/* Right Side */}
          <aside className="space-y-5">
            {/* Quick Links */}
            <section className="rounded-3xl border border-[#eadfc9] bg-white p-5 shadow-[0_12px_40px_rgba(90,70,30,0.05)]">
              <h3 className="mb-4 text-base font-bold">
                Quick Access
              </h3>

              <div className="space-y-2">
                <Link
                  href="/dashboard/orders"
                  className="group flex items-center justify-between rounded-2xl border border-transparent bg-[#faf8f3] p-3.5 transition hover:border-[#eadfc9] hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1e6d0] text-[#977538]">
                      <ShoppingBag size={17} />
                    </div>
                    <span className="text-sm font-semibold">
                      My Orders
                    </span>
                  </div>

                  <span className="text-[#b9975b]">→</span>
                </Link>

                <Link
                  href="/dashboard/wishlist"
                  className="group flex items-center justify-between rounded-2xl border border-transparent bg-[#faf8f3] p-3.5 transition hover:border-[#eadfc9] hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1e6d0] text-[#977538]">
                      <Heart size={17} />
                    </div>
                    <span className="text-sm font-semibold">
                      Wishlist
                    </span>
                  </div>

                  <span className="text-[#b9975b]">→</span>
                </Link>

                <Link
                  href="/dashboard/settings"
                  className="group flex items-center justify-between rounded-2xl border border-transparent bg-[#faf8f3] p-3.5 transition hover:border-[#eadfc9] hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1e6d0] text-[#977538]">
                      <Settings size={17} />
                    </div>
                    <span className="text-sm font-semibold">
                      Account Settings
                    </span>
                  </div>

                  <span className="text-[#b9975b]">→</span>
                </Link>
              </div>
            </section>

            {/* PrimeCart Card */}
            <section className="relative overflow-hidden rounded-3xl bg-[#17130d] p-6 text-white">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#b9975b]/20 blur-2xl" />

              <div className="relative">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#b9975b]">
                  <User size={21} />
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8bc83]">
                  PrimeCart
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  Your shopping,
                  <br />
                  your way.
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/60">
                  Discover products matched to your preferences and shop
                  smarter every time.
                </p>

                <Link
                  href="/dashboard/prime-match"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#17130d] transition hover:bg-[#f3ead7]"
                >
                  Explore PrimeMatch
                  <span>→</span>
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
