"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  CircleUserRound,
  Eye,
  Globe2,
  KeyRound,
  Lock,
  LogOut,
  Monitor,
  Moon,
  Palette,
  RefreshCw,
  Save,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Sun,
  Trash2,
  User,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Appearance = "light" | "dark" | "system";

type NotificationSettings = {
  orders: boolean;
  promotions: boolean;
  priceDrops: boolean;
  wishlist: boolean;
  primePoints: boolean;
  email: boolean;
  browser: boolean;
};

type ShoppingSettings = {
  recommendations: boolean;
  personalizedDeals: boolean;
  recentlyViewed: boolean;
  lowStock: boolean;
  similarProducts: boolean;
};

type PrivacySettings = {
  personalization: boolean;
  activityHistory: boolean;
  analytics: boolean;
};

type SecuritySettings = {
  twoFactor: boolean;
  loginAlerts: boolean;
};

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  appearance: Appearance;
  notifications: NotificationSettings;
  shopping_preferences: ShoppingSettings;
  privacy_preferences: PrivacySettings;
  security_preferences: SecuritySettings;
};

type Tab =
  | "overview"
  | "profile"
  | "security"
  | "appearance"
  | "notifications"
  | "shopping"
  | "privacy";

const defaultNotifications: NotificationSettings = {
  orders: true,
  promotions: true,
  priceDrops: true,
  wishlist: true,
  primePoints: true,
  email: true,
  browser: true,
};

const defaultShopping: ShoppingSettings = {
  recommendations: true,
  personalizedDeals: true,
  recentlyViewed: true,
  lowStock: true,
  similarProducts: true,
};

const defaultPrivacy: PrivacySettings = {
  personalization: true,
  activityHistory: true,
  analytics: true,
};

const defaultSecurity: SecuritySettings = {
  twoFactor: false,
  loginAlerts: true,
};

const tabs: {
  id: Tab;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "overview", label: "Overview", icon: Settings },
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "privacy", label: "Privacy", icon: Lock },
];

export default function SettingsPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const [appearance, setAppearance] =
    useState<Appearance>("light");

  const [notifications, setNotifications] =
    useState<NotificationSettings>(defaultNotifications);

  const [shopping, setShopping] =
    useState<ShoppingSettings>(defaultShopping);

  const [privacy, setPrivacy] =
    useState<PrivacySettings>(defaultPrivacy);

  const [security, setSecurity] =
    useState<SecuritySettings>(defaultSecurity);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [deleteModal, setDeleteModal] = useState(false);

  const profileCompletion = useMemo(() => {
    let completed = 0;

    if (fullName.trim()) completed++;
    if (email.trim()) completed++;
    if (phone.trim()) completed++;
    if (city.trim()) completed++;

    return Math.round((completed / 4) * 100);
  }, [fullName, email, phone, city]);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/auth/login";
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (data) {
        const profile = data as Profile;

        setFullName(profile.full_name ?? "");
        setPhone(profile.phone ?? "");
        setCity(profile.city ?? "");

        setAppearance(
          profile.appearance ?? "light"
        );

        setNotifications({
          ...defaultNotifications,
          ...(profile.notifications ?? {}),
        });

        setShopping({
          ...defaultShopping,
          ...(profile.shopping_preferences ?? {}),
        });

        setPrivacy({
          ...defaultPrivacy,
          ...(profile.privacy_preferences ?? {}),
        });

        setSecurity({
          ...defaultSecurity,
          ...(profile.security_preferences ?? {}),
        });
      } else {
        await supabase.from("profiles").insert({
          id: user.id,
          full_name:
            user.user_metadata?.full_name ?? "",
        });

        setFullName(
          user.user_metadata?.full_name ?? ""
        );
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load your account settings.");
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    if (!userId) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            full_name: fullName.trim(),
            phone: phone.trim(),
            city: city.trim(),
            appearance,
            notifications,
            shopping_preferences: shopping,
            privacy_preferences: privacy,
            security_preferences: security,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        );

      if (updateError) {
        throw updateError;
      }

      setMessage("Your settings have been saved successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3500);
    } catch (err) {
      console.error(err);
      setError("Could not save your settings.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setPasswordLoading(true);

      const { error: passwordError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (passwordError) {
        throw passwordError;
      }

      setNewPassword("");
      setConfirmPassword("");

      setMessage("Password updated successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3500);
    } catch (err) {
      console.error(err);
      setError("Unable to update password.");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  function updateNotification(
    key: keyof NotificationSettings
  ) {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function updateShopping(
    key: keyof ShoppingSettings
  ) {
    setShopping((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function updatePrivacy(
    key: keyof PrivacySettings
  ) {
    setPrivacy((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function updateSecurity(
    key: keyof SecuritySettings
  ) {
    setSecurity((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f3]">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-[#b9975b]/10">
              <Settings className="h-6 w-6 text-[#a68145]" />
            </div>

            <p className="text-sm font-medium text-neutral-500">
              Loading your account...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] text-neutral-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#eadfc9] bg-[#faf8f3]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfc9] bg-white transition hover:border-[#b9975b]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a68145]">
                PrimeCart
              </p>

              <h1 className="text-lg font-bold">
                Account Center
              </h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/dashboard"
              className="rounded-xl border border-[#eadfc9] bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-[#b9975b]"
            >
              Dashboard
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl bg-[#17130d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[30px] border border-[#eadfc9] bg-white p-6 shadow-[0_20px_60px_rgba(92,68,24,0.07)] sm:p-8 lg:p-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#b9975b]/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e8d7b5] bg-[#fffaf0] px-3 py-1.5 text-xs font-bold text-[#977538]">
                <Sparkles className="h-3.5 w-3.5" />
                Personal Account Center
              </div>

              <h2 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Your account,
                <span className="text-[#b08a4d]">
                  {" "}
                  your control.
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                Manage your profile, security, shopping
                preferences, notifications and privacy from
                one place.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-[#eadfc9] bg-[#faf8f3] px-4 py-3">
                  <p className="text-xs text-neutral-500">
                    Signed in as
                  </p>

                  <p className="mt-1 max-w-[280px] truncate text-sm font-bold">
                    {email}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#eadfc9] bg-[#faf8f3] px-4 py-3">
                  <p className="text-xs text-neutral-500">
                    Profile completion
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {profileCompletion}%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex h-28 w-28 items-center justify-center rounded-[28px] border border-[#eadfc9] bg-[#fffaf0]">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#b9975b] text-3xl font-black text-white">
                {fullName
                  ? fullName.charAt(0).toUpperCase()
                  : email
                    ? email.charAt(0).toUpperCase()
                    : "P"}
              </div>
            </div>
          </div>
        </section>

        {/* MOBILE TABS */}
        <div className="mt-6 overflow-x-auto pb-1 lg:hidden">
          <div className="flex min-w-max gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-[#17130d] text-white"
                      : "border border-[#eadfc9] bg-white text-neutral-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-[24px] border border-[#eadfc9] bg-white p-3 shadow-sm">
              <p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
                Settings
              </p>

              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                        active
                          ? "bg-[#fff7e8] text-[#8d6a35]"
                          : "text-neutral-600 hover:bg-[#faf8f3]"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </span>

                      {active && (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="my-4 h-px bg-[#eee5d5]" />

              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </aside>

          {/* CONTENT */}
          <section className="min-w-0">
            {message && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-4 w-4" />
                </div>
                {message}
              </div>
            )}

            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100">
                  <X className="h-4 w-4" />
                </div>
                {error}
              </div>
            )}

            {activeTab === "overview" && (
              <OverviewTab
                fullName={fullName}
                email={email}
                profileCompletion={profileCompletion}
                appearance={appearance}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "profile" && (
              <ProfileTab
                fullName={fullName}
                setFullName={setFullName}
                email={email}
                phone={phone}
                setPhone={setPhone}
                city={city}
                setCity={setCity}
              />
            )}

            {activeTab === "security" && (
              <SecurityTab
                security={security}
                updateSecurity={updateSecurity}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                changePassword={changePassword}
                passwordLoading={passwordLoading}
              />
            )}

            {activeTab === "appearance" && (
              <AppearanceTab
                appearance={appearance}
                setAppearance={setAppearance}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationsTab
                settings={notifications}
                update={updateNotification}
              />
            )}

            {activeTab === "shopping" && (
              <ShoppingTab
                settings={shopping}
                update={updateShopping}
              />
            )}

            {activeTab === "privacy" && (
              <PrivacyTab
                settings={privacy}
                update={updatePrivacy}
                onDelete={() => setDeleteModal(true)}
              />
            )}

            {activeTab !== "overview" &&
              activeTab !== "security" &&
              activeTab !== "privacy" && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={saveChanges}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-[#17130d] px-5 py-3 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}

            {activeTab === "security" && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[#17130d] px-5 py-3 text-sm font-bold text-white transition hover:bg-black disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Security Settings"}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-[#eadfc9] bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>

            <h3 className="mt-5 text-xl font-black">
              Delete account?
            </h3>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Account deletion requires secure server-side
              handling. This button is intentionally not
              connected to a destructive action yet.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                className="flex-1 rounded-xl border border-[#eadfc9] px-4 py-3 text-sm font-bold"
              >
                Cancel
              </button>

              <button
                onClick={() => setDeleteModal(false)}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function OverviewTab({
  fullName,
  email,
  profileCompletion,
  appearance,
  setActiveTab,
}: {
  fullName: string;
  email: string;
  profileCompletion: number;
  appearance: Appearance;
  setActiveTab: (tab: Tab) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Account overview"
        title={`Welcome back${fullName ? `, ${fullName.split(" ")[0]}` : ""}.`}
        description="A quick view of your PrimeCart account and preferences."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickCard
          icon={CircleUserRound}
          title="Profile"
          value={`${profileCompletion}% complete`}
          text="Keep your details updated."
          onClick={() => setActiveTab("profile")}
        />

        <QuickCard
          icon={Shield}
          title="Security"
          value="Protected"
          text="Manage password and login security."
          onClick={() => setActiveTab("security")}
        />

        <QuickCard
          icon={Palette}
          title="Appearance"
          value={
            appearance.charAt(0).toUpperCase() +
            appearance.slice(1)
          }
          text="Choose how PrimeCart looks."
          onClick={() => setActiveTab("appearance")}
        />

        <QuickCard
          icon={Bell}
          title="Notifications"
          value="Personalized"
          text="Control what reaches you."
          onClick={() => setActiveTab("notifications")}
        />
      </div>

      <Panel>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a68145]">
              Profile health
            </p>

            <h3 className="mt-2 text-xl font-black">
              Complete your account
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Adding your basic details helps PrimeCart
              personalize your shopping experience.
            </p>
          </div>

          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[8px] border-[#f2e9d8]">
            <svg
              className="absolute inset-0 h-full w-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#b9975b"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${profileCompletion * 2.64} 264`}
              />
            </svg>

            <span className="text-xl font-black">
              {profileCompletion}%
            </span>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff7e8] text-[#a68145]">
              <User className="h-5 w-5" />
            </div>

            <div>
              <h3 className="font-black">Account details</h3>
              <p className="text-sm text-neutral-500">
                Your current account information.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <InfoRow
              label="Name"
              value={fullName || "Not added"}
            />

            <InfoRow
              label="Email"
              value={email || "Not available"}
            />
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff7e8] text-[#a68145]">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <h3 className="font-black">
                Smart shopping
              </h3>
              <p className="text-sm text-neutral-500">
                Personalize your PrimeCart experience.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => setActiveTab("shopping")}
              className="flex w-full items-center justify-between rounded-xl border border-[#eadfc9] p-4 text-left transition hover:bg-[#faf8f3]"
            >
              <span className="text-sm font-semibold">
                Shopping preferences
              </span>

              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setActiveTab("privacy")}
              className="flex w-full items-center justify-between rounded-xl border border-[#eadfc9] p-4 text-left transition hover:bg-[#faf8f3]"
            >
              <span className="text-sm font-semibold">
                Privacy controls
              </span>

              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function ProfileTab({
  fullName,
  setFullName,
  email,
  phone,
  setPhone,
  city,
  setCity,
}: {
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  phone: string;
  setPhone: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Personal information"
        title="Your profile"
        description="Update the information associated with your PrimeCart account."
      />

      <Panel>
        <div className="flex items-center gap-4 border-b border-[#eee5d5] pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#b9975b] text-2xl font-black text-white">
            {fullName
              ? fullName.charAt(0).toUpperCase()
              : "P"}
          </div>

          <div>
            <h3 className="text-lg font-black">
              {fullName || "PrimeCart User"}
            </h3>

            <p className="text-sm text-neutral-500">
              {email}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Input
            label="Full name"
            value={fullName}
            onChange={setFullName}
            placeholder="Enter your full name"
          />

          <Input
            label="Email address"
            value={email}
            disabled
            placeholder="Your email"
          />

          <Input
            label="Phone number"
            value={phone}
            onChange={setPhone}
            placeholder="Enter phone number"
          />

          <Input
            label="City"
            value={city}
            onChange={setCity}
            placeholder="Enter your city"
          />
        </div>
      </Panel>

      <InfoBanner
        icon={Globe2}
        title="Why we ask for this"
        text="Your profile information helps us provide a more relevant shopping experience and better account communication."
      />
    </div>
  );
}

/* =========================================================
   SECURITY
========================================================= */

function SecurityTab({
  security,
  updateSecurity,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  changePassword,
  passwordLoading,
}: {
  security: SecuritySettings;
  updateSecurity: (key: keyof SecuritySettings) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  changePassword: () => void;
  passwordLoading: boolean;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Account protection"
        title="Security"
        description="Keep your account protected and manage your sign-in preferences."
      />

      <Panel>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <h3 className="font-black">
                Security status
              </h3>

              <p className="text-sm text-neutral-500">
                Your account is protected by Supabase
                authentication.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            Protected
          </span>
        </div>
      </Panel>

      <Panel>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff7e8] text-[#a68145]">
            <KeyRound className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-black">
              Change password
            </h3>

            <p className="text-sm text-neutral-500">
              Update your Supabase authentication password.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Minimum 6 characters"
          />

          <Input
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repeat your password"
          />
        </div>

        <button
          onClick={changePassword}
          disabled={passwordLoading}
          className="mt-5 flex items-center gap-2 rounded-xl bg-[#17130d] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {passwordLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" />
              Update Password
            </>
          )}
        </button>
      </Panel>

      <Panel>
        <h3 className="font-black">
          Login protection
        </h3>

        <div className="mt-5 divide-y divide-[#eee5d5]">
          <ToggleRow
            icon={Shield}
            title="Two-factor authentication"
            description="Add an additional verification step to your account."
            checked={security.twoFactor}
            onChange={() => updateSecurity("twoFactor")}
          />

          <ToggleRow
            icon={Bell}
            title="Login alerts"
            description="Receive alerts about important login activity."
            checked={security.loginAlerts}
            onChange={() => updateSecurity("loginAlerts")}
          />
        </div>
      </Panel>
    </div>
  );
}

/* =========================================================
   APPEARANCE
========================================================= */

function AppearanceTab({
  appearance,
  setAppearance,
}: {
  appearance: Appearance;
  setAppearance: (value: Appearance) => void;
}) {
  const options: {
    id: Appearance;
    title: string;
    text: string;
    icon: React.ElementType;
  }[] = [
    {
      id: "light",
      title: "Light",
      text: "Clean and bright PrimeCart experience.",
      icon: Sun,
    },
    {
      id: "dark",
      title: "Dark",
      text: "A darker experience for low-light environments.",
      icon: Moon,
    },
    {
      id: "system",
      title: "System",
      text: "Follow your device appearance setting.",
      icon: Monitor,
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Display"
        title="Appearance"
        description="Choose how PrimeCart should appear on your device."
      />

      <Panel>
        <div className="grid gap-4 md:grid-cols-3">
          {options.map((option) => {
            const Icon = option.icon;
            const active = appearance === option.id;

            return (
              <button
                key={option.id}
                onClick={() => setAppearance(option.id)}
                className={`rounded-2xl border p-5 text-left transition ${
                  active
                    ? "border-[#b9975b] bg-[#fffaf0] shadow-sm"
                    : "border-[#eadfc9] bg-white hover:bg-[#faf8f3]"
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    active
                      ? "bg-[#b9975b] text-white"
                      : "bg-[#faf8f3]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-5 font-black">
                  {option.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  {option.text}
                </p>

                {active && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#977538]">
                    <Check className="h-4 w-4" />
                    Selected
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Panel>

      <InfoBanner
        icon={Eye}
        title="Appearance preference"
        text="Your selected appearance is saved to your PrimeCart account so it can be restored when you sign in again."
      />
    </div>
  );
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

function NotificationsTab({
  settings,
  update,
}: {
  settings: NotificationSettings;
  update: (key: keyof NotificationSettings) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Stay informed"
        title="Notifications"
        description="Choose the updates and alerts you want to receive."
      />

      <Panel>
        <div className="divide-y divide-[#eee5d5]">
          <ToggleRow
            icon={ShoppingBag}
            title="Order updates"
            description="Shipping, delivery and order status updates."
            checked={settings.orders}
            onChange={() => update("orders")}
          />

          <ToggleRow
            icon={Sparkles}
            title="Promotions"
            description="Special offers, campaigns and exclusive deals."
            checked={settings.promotions}
            onChange={() => update("promotions")}
          />

          <ToggleRow
            icon={RefreshCw}
            title="Price drops"
            description="Know when products you're interested in become cheaper."
            checked={settings.priceDrops}
            onChange={() => update("priceDrops")}
          />

          <ToggleRow
            icon={Eye}
            title="Wishlist updates"
            description="Updates about products saved to your wishlist."
            checked={settings.wishlist}
            onChange={() => update("wishlist")}
          />

          <ToggleRow
            icon={Sparkles}
            title="PrimePoints"
            description="Rewards, points and redemption updates."
            checked={settings.primePoints}
            onChange={() => update("primePoints")}
          />
        </div>
      </Panel>

      <Panel>
        <h3 className="font-black">
          Delivery channels
        </h3>

        <div className="mt-4 divide-y divide-[#eee5d5]">
          <ToggleRow
            icon={Globe2}
            title="Email notifications"
            description="Send selected updates to your account email."
            checked={settings.email}
            onChange={() => update("email")}
          />

          <ToggleRow
            icon={Monitor}
            title="Browser notifications"
            description="Show supported notifications in your browser."
            checked={settings.browser}
            onChange={() => update("browser")}
          />
        </div>
      </Panel>
    </div>
  );
}

/* =========================================================
   SHOPPING
========================================================= */

function ShoppingTab({
  settings,
  update,
}: {
  settings: ShoppingSettings;
  update: (key: keyof ShoppingSettings) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Personalized shopping"
        title="Shopping preferences"
        description="Control how PrimeCart personalizes recommendations and shopping discovery."
      />

      <Panel>
        <div className="divide-y divide-[#eee5d5]">
          <ToggleRow
            icon={Sparkles}
            title="Smart recommendations"
            description="Show products based on your shopping activity."
            checked={settings.recommendations}
            onChange={() => update("recommendations")}
          />

          <ToggleRow
            icon={Sparkles}
            title="Personalized deals"
            description="Highlight offers that may be relevant to you."
            checked={settings.personalizedDeals}
            onChange={() => update("personalizedDeals")}
          />

          <ToggleRow
            icon={RefreshCw}
            title="Recently viewed"
            description="Remember products you recently opened."
            checked={settings.recentlyViewed}
            onChange={() => update("recentlyViewed")}
          />

          <ToggleRow
            icon={ShoppingBag}
            title="Low stock alerts"
            description="Show alerts for products with limited availability."
            checked={settings.lowStock}
            onChange={() => update("lowStock")}
          />

          <ToggleRow
            icon={Sparkles}
            title="Similar products"
            description="Display alternatives similar to products you browse."
            checked={settings.similarProducts}
            onChange={() => update("similarProducts")}
          />
        </div>
      </Panel>
    </div>
  );
}

/* =========================================================
   PRIVACY
========================================================= */

function PrivacyTab({
  settings,
  update,
  onDelete,
}: {
  settings: PrivacySettings;
  update: (key: keyof PrivacySettings) => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Your data"
        title="Privacy"
        description="Manage how your account activity is used to improve your PrimeCart experience."
      />

      <Panel>
        <div className="divide-y divide-[#eee5d5]">
          <ToggleRow
            icon={Sparkles}
            title="Personalization"
            description="Use your shopping preferences to personalize discovery."
            checked={settings.personalization}
            onChange={() => update("personalization")}
          />

          <ToggleRow
            icon={RefreshCw}
            title="Activity history"
            description="Keep relevant account activity for your shopping experience."
            checked={settings.activityHistory}
            onChange={() => update("activityHistory")}
          />

          <ToggleRow
            icon={Globe2}
            title="Analytics"
            description="Allow anonymous usage analytics to help improve PrimeCart."
            checked={settings.analytics}
            onChange={() => update("analytics")}
          />
        </div>
      </Panel>

      <Panel>
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff7e8] text-[#a68145]">
            <Lock className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-black">
              Your account data
            </h3>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Your profile settings are stored in your
              Supabase account and protected with row-level
              security policies.
            </p>
          </div>
        </div>
      </Panel>

      <div className="rounded-[24px] border border-red-200 bg-red-50 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-red-600">
            <Trash2 className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h3 className="font-black text-red-800">
              Danger zone
            </h3>

            <p className="mt-2 text-sm leading-6 text-red-700/70">
              Account deletion is a destructive action and
              should be handled securely on the server.
            </p>

            <button
              onClick={onDelete}
              className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SHARED COMPONENTS
========================================================= */

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
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a68145]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
        {description}
      </p>
    </div>
  );
}

function Panel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-[#eadfc9] bg-white p-5 shadow-sm sm:p-6">
      {children}
    </div>
  );
}

function QuickCard({
  icon: Icon,
  title,
  value,
  text,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-[22px] border border-[#eadfc9] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff7e8] text-[#a68145]">
          <Icon className="h-5 w-5" />
        </div>

        <ChevronRight className="h-4 w-4 text-neutral-300 transition group-hover:text-[#a68145]" />
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        {title}
      </p>

      <p className="mt-1 text-lg font-black">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-neutral-500">
        {text}
      </p>
    </button>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-[#faf8f3] px-4 py-3">
      <span className="text-sm text-neutral-500">
        {label}
      </span>

      <span className="max-w-[65%] truncate text-right text-sm font-bold">
        {value}
      </span>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange?.(e.target.value)
        }
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
          disabled
            ? "cursor-not-allowed border-[#eee5d5] bg-[#faf8f3] text-neutral-400"
            : "border-[#eadfc9] bg-white focus:border-[#b9975b] focus:ring-4 focus:ring-[#b9975b]/10"
        }`}
      />
    </label>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-5">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#faf8f3] text-[#a68145]">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-bold">
            {title}
          </h4>

          <p className="mt-1 max-w-xl text-xs leading-5 text-neutral-500">
            {description}
          </p>
        </div>
      </div>

      <button
        onClick={onChange}
        aria-label={title}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked
            ? "bg-[#b9975b]"
            : "bg-neutral-200"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function InfoBanner({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#eadfc9] bg-[#fffaf0] p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#a68145]">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3 className="font-black">{title}</h3>

          <p className="mt-1 text-sm leading-6 text-neutral-600">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
