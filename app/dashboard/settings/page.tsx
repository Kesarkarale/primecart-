"use client";

import {
  Bell,
  Check,
  ChevronRight,
  Eye,
  Globe,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Moon,
  Palette,
  Save,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sun,
  User,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Tab =
  | "profile"
  | "account"
  | "appearance"
  | "notifications"
  | "privacy"
  | "shopping";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
  });

  const [appearance, setAppearance] = useState("light");

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    priceDrops: true,
    wishlistAlerts: true,
    primePoints: true,
    email: true,
  });

  const [shopping, setShopping] = useState({
    personalized: true,
    recommendations: true,
    recentlyViewed: true,
    lowStock: true,
  });

  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    try {
      const savedName = localStorage.getItem("primecart-profile-name");
      const savedAppearance = localStorage.getItem(
        "primecart-appearance"
      );

      if (savedName) {
        setProfile((prev) => ({
          ...prev,
          fullName: savedName,
        }));
      }

      if (savedAppearance) {
        setAppearance(savedAppearance);
      }
    } catch {}
  }, []);

  const saveSettings = () => {
    try {
      localStorage.setItem(
        "primecart-profile-name",
        profile.fullName
      );

      localStorage.setItem(
        "primecart-appearance",
        appearance
      );
    } catch {}

    setSavedMessage("Your settings have been saved successfully.");

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  };

  const tabs = [
    {
      id: "profile" as Tab,
      label: "Profile",
      description: "Personal information",
      icon: UserRound,
    },
    {
      id: "account" as Tab,
      label: "Account",
      description: "Account preferences",
      icon: Settings,
    },
    {
      id: "appearance" as Tab,
      label: "Appearance",
      description: "Theme & display",
      icon: Palette,
    },
    {
      id: "notifications" as Tab,
      label: "Notifications",
      description: "Alerts & updates",
      icon: Bell,
    },
    {
      id: "privacy" as Tab,
      label: "Privacy & Security",
      description: "Security controls",
      icon: ShieldCheck,
    },
    {
      id: "shopping" as Tab,
      label: "Shopping",
      description: "Shopping preferences",
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#faf9f6]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f8d477] via-[#e9b949] to-[#c9901e] shadow-lg shadow-amber-200/50">
                <Settings className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="text-lg font-black tracking-tight">
                  PrimeCart
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
                  Settings
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-white hover:text-stone-900"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/products"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-white hover:text-stone-900"
            >
              Shop
            </Link>

            <Link
              href="/dashboard/orders"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-white hover:text-stone-900"
            >
              Orders
            </Link>

            <div className="ml-2 flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 shadow-sm">
              <Settings className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* BREADCRUMB */}
        <div className="mb-6 flex items-center gap-2 text-sm text-stone-500">
          <Link
            href="/dashboard"
            className="transition hover:text-stone-900"
          >
            Dashboard
          </Link>

          <ChevronRight className="h-4 w-4" />

          <span className="font-semibold text-stone-900">
            Settings
          </span>
        </div>

        {/* PAGE INTRO */}
        <section className="relative overflow-hidden rounded-[30px] border border-amber-200/70 bg-gradient-to-br from-[#fffdf8] via-[#fff8e8] to-[#f7e2a7] shadow-[0_25px_70px_-40px_rgba(180,130,20,0.45)]">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-amber-300/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:p-10">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-700">
                <Settings className="h-4 w-4" />
                Account Center
              </div>

              <h1 className="text-4xl font-black tracking-tight text-stone-950 sm:text-5xl">
                Settings
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                Manage your PrimeCart profile, preferences,
                notifications and account security from one place.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 px-5 py-4 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-black">
                  Account Protected
                </p>

                <p className="mt-1 text-xs text-stone-500">
                  Your preferences are private
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MOBILE TABS */}
        <div className="mt-6 overflow-x-auto lg:hidden">
          <div className="flex min-w-max gap-2 pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                    active
                      ? "bg-stone-950 text-white shadow-lg"
                      : "border border-stone-200 bg-white text-stone-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[290px_1fr]">
          {/* SIDEBAR */}
          <aside className="hidden h-fit rounded-[28px] border border-stone-200 bg-white p-3 shadow-sm lg:block">
            <div className="px-4 py-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">
                Settings
              </p>

              <p className="mt-1 text-sm text-stone-500">
                Manage your account
              </p>
            </div>

            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                      active
                        ? "bg-gradient-to-r from-amber-50 to-white text-stone-950 shadow-sm ring-1 ring-amber-200"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        active
                          ? "bg-amber-100 text-amber-700"
                          : "bg-stone-100 text-stone-500 group-hover:bg-stone-200"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">
                        {tab.label}
                      </p>

                      <p className="mt-0.5 truncate text-[11px] text-stone-400">
                        {tab.description}
                      </p>
                    </div>

                    {active && (
                      <ChevronRight className="h-4 w-4 text-amber-600" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 border-t border-stone-100 pt-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-2xl p-3 text-sm font-bold text-stone-500 transition hover:bg-stone-50 hover:text-stone-900"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100">
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </div>

                Back to Dashboard
              </Link>
            </div>
          </aside>

          {/* CONTENT */}
          <div className="min-w-0">
            {/* PROFILE */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <SettingsCard
                  eyebrow="PROFILE"
                  title="Personal information"
                  description="Update the information associated with your PrimeCart account."
                >
                  <div className="flex flex-col gap-6 border-b border-stone-100 pb-7 sm:flex-row sm:items-center">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] bg-gradient-to-br from-amber-100 via-yellow-50 to-white text-3xl font-black text-amber-700 shadow-inner">
                      {profile.fullName
                        ? profile.fullName
                            .charAt(0)
                            .toUpperCase()
                        : "P"}
                    </div>

                    <div>
                      <h3 className="text-xl font-black">
                        {profile.fullName || "PrimeCart User"}
                      </h3>

                      <p className="mt-1 text-sm text-stone-500">
                        Your PrimeCart customer profile
                      </p>

                      <button className="mt-4 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 transition hover:bg-stone-50">
                        Change profile picture
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-5 pt-7 md:grid-cols-2">
                    <InputField
                      label="Full Name"
                      icon={User}
                      value={profile.fullName}
                      onChange={(value) =>
                        setProfile((prev) => ({
                          ...prev,
                          fullName: value,
                        }))
                      }
                      placeholder="Enter your full name"
                    />

                    <InputField
                      label="Email Address"
                      icon={Mail}
                      value={profile.email}
                      onChange={(value) =>
                        setProfile((prev) => ({
                          ...prev,
                          email: value,
                        }))
                      }
                      placeholder="you@example.com"
                      disabled
                    />
                  </div>
                </SettingsCard>

                <InfoBanner
                  icon={Mail}
                  title="Email verification"
                  text="Your email address is used for account access, order updates and important security notifications."
                />
              </div>
            )}

            {/* ACCOUNT */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <SettingsCard
                  eyebrow="ACCOUNT"
                  title="Account preferences"
                  description="Manage your general account settings."
                >
                  <SettingRow
                    icon={Globe}
                    title="Language"
                    description="Choose the language used across PrimeCart."
                    right={
                      <select className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-400">
                        <option>English</option>
                        <option>Marathi</option>
                        <option>Hindi</option>
                      </select>
                    }
                  />

                  <SettingRow
                    icon={WalletCards}
                    title="Currency"
                    description="Display prices using your preferred currency."
                    right={
                      <select className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-400">
                        <option>INR ₹</option>
                        <option>USD $</option>
                        <option>EUR €</option>
                      </select>
                    }
                  />

                  <SettingRow
                    icon={ShoppingBag}
                    title="Order history"
                    description="View and manage all your PrimeCart orders."
                    right={
                      <Link
                        href="/dashboard/orders"
                        className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-bold transition hover:bg-stone-50"
                      >
                        View Orders
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    }
                  />
                </SettingsCard>

                <SettingsCard
                  eyebrow="PASSWORD"
                  title="Password & login"
                  description="Keep your account credentials secure."
                >
                  <SettingRow
                    icon={KeyRound}
                    title="Change password"
                    description="Update your account password regularly."
                    right={
                      <button className="rounded-xl bg-stone-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-stone-800">
                        Change Password
                      </button>
                    }
                  />

                  <SettingRow
                    icon={Smartphone}
                    title="Login sessions"
                    description="Review devices where your account is signed in."
                    right={
                      <button className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-bold transition hover:bg-stone-50">
                        Manage
                      </button>
                    }
                  />
                </SettingsCard>
              </div>
            )}

            {/* APPEARANCE */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <SettingsCard
                  eyebrow="APPEARANCE"
                  title="Theme & display"
                  description="Choose how PrimeCart looks on your device."
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <ThemeCard
                      active={appearance === "light"}
                      title="Light"
                      description="Clean and bright"
                      icon={Sun}
                      onClick={() => setAppearance("light")}
                      preview="light"
                    />

                    <ThemeCard
                      active={appearance === "dark"}
                      title="Dark"
                      description="Easy on the eyes"
                      icon={Moon}
                      onClick={() => setAppearance("dark")}
                      preview="dark"
                    />

                    <ThemeCard
                      active={appearance === "system"}
                      title="System"
                      description="Follow device settings"
                      icon={Smartphone}
                      onClick={() => setAppearance("system")}
                      preview="system"
                    />
                  </div>
                </SettingsCard>

                <SettingsCard
                  eyebrow="DISPLAY"
                  title="Interface preferences"
                  description="Control how information is displayed."
                >
                  <ToggleRow
                    icon={Eye}
                    title="Compact product cards"
                    description="Show more products in less space."
                    checked={false}
                    onChange={() => {}}
                  />

                  <ToggleRow
                    icon={Palette}
                    title="Reduce animations"
                    description="Use fewer motion effects throughout the interface."
                    checked={false}
                    onChange={() => {}}
                  />
                </SettingsCard>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <SettingsCard
                  eyebrow="NOTIFICATIONS"
                  title="Stay updated"
                  description="Choose which PrimeCart notifications you want to receive."
                >
                  <ToggleRow
                    icon={ShoppingBag}
                    title="Order updates"
                    description="Shipping, delivery and order status notifications."
                    checked={notifications.orderUpdates}
                    onChange={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        orderUpdates: !prev.orderUpdates,
                      }))
                    }
                  />

                  <ToggleRow
                    icon={Bell}
                    title="Promotions & deals"
                    description="Get notified about offers, sales and special promotions."
                    checked={notifications.promotions}
                    onChange={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        promotions: !prev.promotions,
                      }))
                    }
                  />

                  <ToggleRow
                    icon={WalletCards}
                    title="Price drop alerts"
                    description="Know when products you're interested in get cheaper."
                    checked={notifications.priceDrops}
                    onChange={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        priceDrops: !prev.priceDrops,
                      }))
                    }
                  />

                  <ToggleRow
                    icon={ShoppingBag}
                    title="Wishlist alerts"
                    description="Receive updates about wishlist products."
                    checked={notifications.wishlistAlerts}
                    onChange={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        wishlistAlerts: !prev.wishlistAlerts,
                      }))
                    }
                  />

                  <ToggleRow
                    icon={SparkleIcon}
                    title="PrimePoints updates"
                    description="Get updates about points, tiers and rewards."
                    checked={notifications.primePoints}
                    onChange={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        primePoints: !prev.primePoints,
                      }))
                    }
                  />

                  <ToggleRow
                    icon={Mail}
                    title="Email notifications"
                    description="Receive important PrimeCart updates by email."
                    checked={notifications.email}
                    onChange={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        email: !prev.email,
                      }))
                    }
                  />
                </SettingsCard>
              </div>
            )}

            {/* PRIVACY */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <SettingsCard
                  eyebrow="SECURITY"
                  title="Privacy & security"
                  description="Control your account security and privacy preferences."
                >
                  <SecurityRow
                    icon={Lock}
                    title="Password protection"
                    status="Protected"
                    description="Your account is protected with a secure password."
                  />

                  <SecurityRow
                    icon={Mail}
                    title="Email security"
                    status="Verified"
                    description="Your email is used to secure your PrimeCart account."
                  />

                  <SecurityRow
                    icon={ShieldCheck}
                    title="Account privacy"
                    status="Active"
                    description="Your personal account information is kept private."
                  />
                </SettingsCard>

                <SettingsCard
                  eyebrow="SESSIONS"
                  title="Active sessions"
                  description="Devices that may currently have access to your account."
                >
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-[#faf9f6] p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Smartphone className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-black">
                          Current Browser
                        </p>

                        <p className="mt-1 text-xs text-stone-500">
                          Active session
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase text-emerald-700">
                      Current
                    </span>
                  </div>
                </SettingsCard>

                <div className="rounded-[26px] border border-red-200 bg-red-50/50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <LogOut className="h-5 w-5" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-black text-red-900">
                        Sign out of all devices
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-red-700/70">
                        Sign out your PrimeCart account from all
                        active sessions.
                      </p>

                      <button className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-50">
                        Sign Out Everywhere
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SHOPPING */}
            {activeTab === "shopping" && (
              <div className="space-y-6">
                <SettingsCard
                  eyebrow="SHOPPING"
                  title="Shopping preferences"
                  description="Personalize your PrimeCart shopping experience."
                >
                  <ToggleRow
                    icon={SparkleIcon}
                    title="Personalized shopping"
                    description="Use your activity to personalize your experience."
                    checked={shopping.personalized}
                    onChange={() =>
                      setShopping((prev) => ({
                        ...prev,
                        personalized: !prev.personalized,
                      }))
                    }
                  />

                  <ToggleRow
                    icon={ShoppingBag}
                    title="Product recommendations"
                    description="Show recommendations based on your shopping activity."
                    checked={shopping.recommendations}
                    onChange={() =>
                      setShopping((prev) => ({
                        ...prev,
                        recommendations: !prev.recommendations,
                      }))
                    }
                  />

                  <ToggleRow
                    icon={Eye}
                    title="Recently viewed products"
                    description="Keep track of products you've recently explored."
                    checked={shopping.recentlyViewed}
                    onChange={() =>
                      setShopping((prev) => ({
                        ...prev,
                        recentlyViewed: !prev.recentlyViewed,
                      }))
                    }
                  />

                  <ToggleRow
                    icon={Bell}
                    title="Low stock alerts"
                    description="Notify me when wishlist products have limited stock."
                    checked={shopping.lowStock}
                    onChange={() =>
                      setShopping((prev) => ({
                        ...prev,
                        lowStock: !prev.lowStock,
                      }))
                    }
                  />
                </SettingsCard>

                <InfoBanner
                  icon={ShoppingBag}
                  title="Personalized experience"
                  text="Your preferences help PrimeCart show more relevant products, deals and recommendations."
                />
              </div>
            )}

            {/* SAVE BAR */}
            <div className="sticky bottom-4 mt-6 rounded-[22px] border border-stone-200 bg-white/95 p-3 shadow-xl backdrop-blur-xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 px-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Save className="h-4 w-4" />
                  </div>

                  <p className="text-xs font-semibold text-stone-500">
                    Changes are saved locally for this session.
                  </p>
                </div>

                <button
                  onClick={saveSettings}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-5 py-3 text-sm font-black text-white transition hover:bg-stone-800"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>

              {savedMessage && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                  <Check className="h-4 w-4" />
                  {savedMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function SettingsCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-100 p-6 sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-stone-500">
          {description}
        </p>
      </div>

      <div className="p-6 sm:p-7">{children}</div>
    </section>
  );
}

function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-wider text-stone-500">
        {label}
      </label>

      <div
        className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition ${
          disabled
            ? "border-stone-200 bg-stone-50"
            : "border-stone-200 bg-white focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-100"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0 text-stone-400" />

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-stone-400 disabled:cursor-not-allowed disabled:text-stone-500"
        />
      </div>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  right,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  right: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-100 py-5 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-black">{title}</p>

          <p className="mt-1 max-w-xl text-xs leading-5 text-stone-500">
            {description}
          </p>
        </div>
      </div>

      <div className="sm:shrink-0">{right}</div>
    </div>
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
    <div className="flex items-center justify-between gap-4 border-b border-stone-100 py-5 first:pt-0 last:border-0 last:pb-0">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-black">{title}</p>

          <p className="mt-1 text-xs leading-5 text-stone-500">
            {description}
          </p>
        </div>
      </div>

      <button
        onClick={onChange}
        aria-label={title}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-amber-500" : "bg-stone-200"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function ThemeCard({
  active,
  title,
  description,
  icon: Icon,
  onClick,
  preview,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  preview: "light" | "dark" | "system";
}) {
  return (
    <button
      onClick={onClick}
      className={`group rounded-[24px] border p-4 text-left transition ${
        active
          ? "border-amber-300 bg-amber-50/50 shadow-sm ring-2 ring-amber-100"
          : "border-stone-200 bg-white hover:border-stone-300"
      }`}
    >
      <div
        className={`h-28 overflow-hidden rounded-2xl border ${
          preview === "dark"
            ? "border-stone-700 bg-stone-900"
            : "border-stone-200 bg-[#faf9f6]"
        }`}
      >
        {preview === "system" ? (
          <div className="grid h-full grid-cols-2">
            <div className="bg-[#faf9f6] p-3">
              <div className="h-2 w-10 rounded bg-stone-300" />
              <div className="mt-3 h-10 rounded-xl bg-white" />
            </div>

            <div className="bg-stone-900 p-3">
              <div className="h-2 w-10 rounded bg-stone-600" />
              <div className="mt-3 h-10 rounded-xl bg-stone-800" />
            </div>
          </div>
        ) : (
          <div className="p-3">
            <div
              className={`h-2 w-12 rounded ${
                preview === "dark"
                  ? "bg-stone-600"
                  : "bg-stone-300"
              }`}
            />

            <div
              className={`mt-3 h-12 rounded-xl ${
                preview === "dark"
                  ? "bg-stone-800"
                  : "bg-white shadow-sm"
              }`}
            />

            <div className="mt-3 flex gap-2">
              <div className="h-2 w-8 rounded bg-amber-400" />
              <div
                className={`h-2 w-12 rounded ${
                  preview === "dark"
                    ? "bg-stone-700"
                    : "bg-stone-200"
                }`}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Icon
              className={`h-4 w-4 ${
                active ? "text-amber-600" : "text-stone-500"
              }`}
            />

            <p className="text-sm font-black">{title}</p>
          </div>

          <p className="mt-1 text-xs text-stone-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
            active
              ? "border-amber-500 bg-amber-500 text-white"
              : "border-stone-300"
          }`}
        >
          {active && <Check className="h-3 w-3" />}
        </div>
      </div>
    </button>
  );
}

function SecurityRow({
  icon: Icon,
  title,
  status,
  description,
}: {
  icon: React.ElementType;
  title: string;
  status: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-stone-100 py-5 first:pt-0 last:border-0 last:pb-0">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-black">{title}</p>

          <p className="mt-1 text-xs leading-5 text-stone-500">
            {description}
          </p>
        </div>
      </div>

      <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
        {status}
      </span>
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
    <div className="rounded-[24px] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-black">{title}</h3>

          <p className="mt-1 text-xs leading-5 text-stone-500">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function SparkleIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.5 5.5L5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5L12 3Z" />
      <path d="m19 16-.7 2.3L16 19l2.3.7L19 22l.7-2.3L22 19l-2.3-.7L19 16Z" />
    </svg>
  );
}
