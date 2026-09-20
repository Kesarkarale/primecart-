"use client";

import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock3,
  Eye,
  Globe2,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Monitor,
  Moon,
  Palette,
  Pencil,
  Phone,
  Save,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Smartphone,
  Sun,
  Trash2,
  User,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Tab =
  | "overview"
  | "profile"
  | "security"
  | "appearance"
  | "notifications"
  | "shopping"
  | "privacy";

type ToggleProps = {
  checked: boolean;
  onChange: () => void;
};

const navigation: {
  id: Tab;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Account center",
    icon: Settings,
  },
  {
    id: "profile",
    label: "My Profile",
    description: "Personal information",
    icon: UserRound,
  },
  {
    id: "security",
    label: "Security",
    description: "Password & access",
    icon: ShieldCheck,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme & display",
    icon: Palette,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alerts & updates",
    icon: Bell,
  },
  {
    id: "shopping",
    label: "Shopping",
    description: "Personalization",
    icon: ShoppingBag,
  },
  {
    id: "privacy",
    label: "Privacy",
    description: "Data controls",
    icon: Lock,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [profileOpen, setProfileOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [profile, setProfile] = useState({
    fullName: "PrimeCart User",
    email: "",
    phone: "",
    city: "",
  });

  const [appearance, setAppearance] = useState<
    "light" | "dark" | "system"
  >("light");

  const [notifications, setNotifications] = useState({
    orders: true,
    promotions: true,
    priceDrops: true,
    wishlist: true,
    primePoints: true,
    email: true,
    browser: false,
  });

  const [shopping, setShopping] = useState({
    recommendations: true,
    personalizedDeals: true,
    recentlyViewed: true,
    lowStock: true,
    similarProducts: true,
  });

  const [privacy, setPrivacy] = useState({
    personalization: true,
    activityHistory: true,
    analytics: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
  });

  useEffect(() => {
    try {
      const savedName = localStorage.getItem(
        "primecart-profile-name"
      );

      const savedAppearance = localStorage.getItem(
        "primecart-appearance"
      );

      if (savedName) {
        setProfile((prev) => ({
          ...prev,
          fullName: savedName,
        }));
      }

      if (
        savedAppearance === "light" ||
        savedAppearance === "dark" ||
        savedAppearance === "system"
      ) {
        setAppearance(savedAppearance);
      }
    } catch {}
  }, []);

  const initials = useMemo(() => {
    const words = profile.fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) return "P";

    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }, [profile.fullName]);

  const completion = useMemo(() => {
    const fields = [
      profile.fullName,
      profile.email,
      profile.phone,
      profile.city,
    ];

    return Math.round(
      (fields.filter((field) => field.trim()).length /
        fields.length) *
        100
    );
  }, [profile]);

  const saveChanges = () => {
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

    setSaveMessage("Changes saved successfully.");

    window.setTimeout(() => {
      setSaveMessage("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-stone-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#f8f7f4]/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-[76px] max-w-[1550px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-gradient-to-br from-[#f7d477] via-[#e8b43e] to-[#c98e19] shadow-lg shadow-amber-200/50 transition group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-lg font-black tracking-tight">
                PrimeCart
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-stone-400">
                Account Center
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <HeaderLink href="/dashboard">
              Dashboard
            </HeaderLink>

            <HeaderLink href="/dashboard/products">
              Shop
            </HeaderLink>

            <HeaderLink href="/dashboard/orders">
              Orders
            </HeaderLink>

            <div className="ml-3 h-8 w-px bg-stone-200" />

            <div className="relative ml-2">
              <button
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-2.5 py-2 shadow-sm transition hover:border-amber-200"
              >
                <Avatar initials={initials} size="small" />

                <span className="max-w-[120px] truncate text-xs font-bold">
                  {profile.fullName}
                </span>

                <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-14 w-60 overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl">
                  <button
                    onClick={() => {
                      setActiveTab("profile");
                      setProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-semibold hover:bg-stone-50"
                  >
                    <User className="h-4 w-4 text-stone-500" />
                    My Profile
                  </button>

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 rounded-xl p-3 text-sm font-semibold hover:bg-stone-50"
                  >
                    <ArrowRight className="h-4 w-4 text-stone-500" />
                    Back to Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white">
              <Settings className="h-4 w-4 text-stone-600" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1550px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* BREADCRUMB */}
        <div className="mb-5 flex items-center gap-2 text-xs text-stone-400">
          <Link
            href="/dashboard"
            className="font-semibold transition hover:text-stone-800"
          >
            Dashboard
          </Link>

          <ChevronRight className="h-3.5 w-3.5" />

          <span className="font-bold text-stone-700">
            Settings
          </span>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[32px] border border-amber-200/70 bg-gradient-to-br from-[#fffdf8] via-[#fff9ed] to-[#f4dda2] shadow-[0_30px_80px_-45px_rgba(173,123,24,0.5)]">
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-white/50 blur-3xl" />

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure Account Center
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
                Your account,
                <span className="block bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 bg-clip-text text-transparent">
                  your control.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                Personalize your PrimeCart experience, manage security
                and control the way your shopping journey works.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab("profile")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-stone-800"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </button>

                <button
                  onClick={() => setActiveTab("security")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-amber-300 bg-white px-5 py-3.5 text-sm font-black text-stone-800 transition hover:-translate-y-0.5 hover:bg-amber-50"
                >
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  Security Center
                </button>
              </div>
            </div>

            {/* COMPLETION */}
            <div className="flex items-center lg:min-w-[320px]">
              <div className="w-full rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-xl backdrop-blur">
                <div className="flex items-center gap-4">
                  <Avatar initials={initials} />

                  <div className="min-w-0">
                    <p className="truncate text-xl font-black">
                      {profile.fullName}
                    </p>

                    <p className="mt-1 truncate text-xs text-stone-500">
                      {profile.email || "PrimeCart member"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      Profile completion
                    </p>

                    <p className="mt-1 text-3xl font-black">
                      {completion}%
                    </p>
                  </div>

                  <CircleCheck
                    className={`h-8 w-8 ${
                      completion === 100
                        ? "text-emerald-500"
                        : "text-amber-500"
                    }`}
                  />
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-700"
                    style={{ width: `${completion}%` }}
                  />
                </div>

                <p className="mt-3 text-xs leading-5 text-stone-500">
                  {completion === 100
                    ? "Your profile is completely set up."
                    : "Complete your profile to get a more personalized experience."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MOBILE NAV */}
        <div className="mt-5 overflow-x-auto lg:hidden">
          <div className="flex min-w-max gap-2 pb-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-black transition ${
                    active
                      ? "bg-stone-950 text-white shadow-lg"
                      : "border border-stone-200 bg-white text-stone-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[285px_1fr]">
          {/* SIDEBAR */}
          <aside className="hidden h-fit rounded-[28px] border border-stone-200 bg-white p-3 shadow-sm lg:block">
            <div className="px-4 pb-4 pt-3">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-400">
                Manage
              </p>

              <p className="mt-1 text-sm font-semibold text-stone-500">
                Account preferences
              </p>
            </div>

            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`group relative flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                      active
                        ? "bg-gradient-to-r from-amber-50 to-white shadow-sm ring-1 ring-amber-200"
                        : "hover:bg-stone-50"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-3 h-10 w-1 rounded-r-full bg-amber-500" />
                    )}

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
                      <p
                        className={`truncate text-sm ${
                          active
                            ? "font-black text-stone-950"
                            : "font-bold text-stone-700"
                        }`}
                      >
                        {item.label}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-stone-400">
                        {item.description}
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
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </div>

                Back to Dashboard
              </Link>
            </div>
          </aside>

          {/* CONTENT */}
          <div className="min-w-0">
            {activeTab === "overview" && (
              <Overview
                profile={profile}
                completion={completion}
                security={security}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "profile" && (
              <ProfileSection
                profile={profile}
                setProfile={setProfile}
              />
            )}

            {activeTab === "security" && (
              <SecuritySection
                security={security}
                setSecurity={setSecurity}
              />
            )}

            {activeTab === "appearance" && (
              <AppearanceSection
                appearance={appearance}
                setAppearance={setAppearance}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationsSection
                notifications={notifications}
                setNotifications={setNotifications}
              />
            )}

            {activeTab === "shopping" && (
              <ShoppingSection
                shopping={shopping}
                setShopping={setShopping}
              />
            )}

            {activeTab === "privacy" && (
              <PrivacySection
                privacy={privacy}
                setPrivacy={setPrivacy}
              />
            )}

            {/* SAVE BAR */}
            <div className="sticky bottom-4 z-30 mt-6 rounded-[22px] border border-stone-200 bg-white/95 p-3 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 px-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Save className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-black">
                      Settings Center
                    </p>

                    <p className="text-[10px] text-stone-400">
                      Save your latest preferences
                    </p>
                  </div>
                </div>

                <button
                  onClick={saveChanges}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-5 py-3 text-xs font-black text-white transition hover:bg-stone-800"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>

              {saveMessage && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                  <Check className="h-4 w-4" />
                  {saveMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function Overview({
  profile,
  completion,
  security,
  setActiveTab,
}: {
  profile: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
  };
  completion: number;
  security: {
    twoFactor: boolean;
    loginAlerts: boolean;
  };
  setActiveTab: (tab: Tab) => void;
}) {
  return (
    <div className="space-y-6">
      {/* QUICK CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickCard
          icon={UserRound}
          title="Profile"
          value={`${completion}%`}
          subtitle="Profile complete"
          onClick={() => setActiveTab("profile")}
        />

        <QuickCard
          icon={ShieldCheck}
          title="Security"
          value={security.twoFactor ? "Strong" : "Good"}
          subtitle="Security status"
          onClick={() => setActiveTab("security")}
        />

        <QuickCard
          icon={Bell}
          title="Notifications"
          value="Active"
          subtitle="Preferences enabled"
          onClick={() => setActiveTab("notifications")}
        />

        <QuickCard
          icon={ShoppingBag}
          title="Shopping"
          value="Personal"
          subtitle="Experience mode"
          onClick={() => setActiveTab("shopping")}
        />
      </div>

      {/* PROFILE + SECURITY */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel
          eyebrow="ACCOUNT"
          title="Profile overview"
          description="Your current PrimeCart account information."
          action={
            <button
              onClick={() => setActiveTab("profile")}
              className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold hover:bg-stone-50"
            >
              Edit
              <Pencil className="h-3 w-3" />
            </button>
          }
        >
          <div className="flex items-center gap-4 border-b border-stone-100 pb-6">
            <Avatar
              initials={
                profile.fullName
                  ? profile.fullName
                      .split(" ")
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join("")
                      .toUpperCase()
                  : "P"
              }
            />

            <div>
              <p className="text-xl font-black">
                {profile.fullName}
              </p>

              <p className="mt-1 text-xs text-stone-500">
                PrimeCart customer
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoItem
              icon={Mail}
              label="Email"
              value={profile.email || "Not added yet"}
            />

            <InfoItem
              icon={Phone}
              label="Phone"
              value={profile.phone || "Not added yet"}
            />

            <InfoItem
              icon={MapPin}
              label="Location"
              value={profile.city || "Not added yet"}
            />

            <InfoItem
              icon={Globe2}
              label="Language"
              value="English"
            />
          </div>
        </Panel>

        <Panel
          eyebrow="SECURITY"
          title="Security health"
          description="Keep your account protected."
          action={
            <button
              onClick={() => setActiveTab("security")}
              className="text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              Manage
            </button>
          }
        >
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-black text-emerald-900">
                  Account protected
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  No immediate security action required.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <StatusRow
              icon={KeyRound}
              title="Password"
              status="Protected"
            />

            <StatusRow
              icon={Mail}
              title="Email security"
              status="Active"
            />

            <StatusRow
              icon={Shield}
              title="Two-factor authentication"
              status={security.twoFactor ? "Enabled" : "Optional"}
            />

            <StatusRow
              icon={Bell}
              title="Login alerts"
              status={security.loginAlerts ? "Enabled" : "Off"}
            />
          </div>
        </Panel>
      </div>

      {/* PERSONALIZATION */}
      <Panel
        eyebrow="PERSONALIZATION"
        title="Make PrimeCart yours"
        description="Quickly customize the experience you want."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <ActionCard
            icon={Palette}
            title="Appearance"
            description="Choose light, dark or system theme."
            onClick={() => setActiveTab("appearance")}
          />

          <ActionCard
            icon={Bell}
            title="Notifications"
            description="Control your shopping alerts."
            onClick={() => setActiveTab("notifications")}
          />

          <ActionCard
            icon={ShoppingBag}
            title="Shopping preferences"
            description="Personalize product recommendations."
            onClick={() => setActiveTab("shopping")}
          />
        </div>
      </Panel>

      {/* SECURITY TIP */}
      <InfoBanner
        icon={ShieldCheck}
        title="Security tip"
        text="Never share your password or verification codes with anyone. PrimeCart will never ask for your password through chat, phone or email."
      />
    </div>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function ProfileSection({
  profile,
  setProfile,
}: {
  profile: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
  };
  setProfile: React.Dispatch<
    React.SetStateAction<{
      fullName: string;
      email: string;
      phone: string;
      city: string;
    }>
  >;
}) {
  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "P";

  return (
    <div className="space-y-6">
      <Panel
        eyebrow="PROFILE"
        title="Personal information"
        description="Keep your account information up to date."
      >
        <div className="flex flex-col gap-6 border-b border-stone-100 pb-7 sm:flex-row sm:items-center">
          <Avatar initials={initials} />

          <div className="flex-1">
            <p className="text-xl font-black">
              {profile.fullName}
            </p>

            <p className="mt-1 text-sm text-stone-500">
              PrimeCart customer profile
            </p>

            <button className="mt-4 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold hover:bg-stone-50">
              Change profile picture
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <Input
            label="Full name"
            icon={User}
            value={profile.fullName}
            onChange={(value) =>
              setProfile((prev) => ({
                ...prev,
                fullName: value,
              }))
            }
            placeholder="Your full name"
          />

          <Input
            label="Email address"
            icon={Mail}
            value={profile.email}
            onChange={(value) =>
              setProfile((prev) => ({
                ...prev,
                email: value,
              }))
            }
            placeholder="you@example.com"
          />

          <Input
            label="Phone number"
            icon={Phone}
            value={profile.phone}
            onChange={(value) =>
              setProfile((prev) => ({
                ...prev,
                phone: value,
              }))
            }
            placeholder="+91 XXXXX XXXXX"
          />

          <Input
            label="City"
            icon={MapPin}
            value={profile.city}
            onChange={(value) =>
              setProfile((prev) => ({
                ...prev,
                city: value,
              }))
            }
            placeholder="Your city"
          />
        </div>
      </Panel>

      <Panel
        eyebrow="ACCOUNT IDENTITY"
        title="Account information"
        description="Basic information associated with your PrimeCart account."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem
            icon={UserRound}
            label="Account type"
            value="Customer"
          />

          <InfoItem
            icon={ShieldCheck}
            label="Account status"
            value="Active"
            positive
          />

          <InfoItem
            icon={Globe2}
            label="Preferred language"
            value="English"
          />

          <InfoItem
            icon={WalletCards}
            label="Currency"
            value="INR ₹"
          />
        </div>
      </Panel>
    </div>
  );
}

/* =========================================================
   SECURITY
========================================================= */

function SecuritySection({
  security,
  setSecurity,
}: {
  security: {
    twoFactor: boolean;
    loginAlerts: boolean;
  };
  setSecurity: React.Dispatch<
    React.SetStateAction<{
      twoFactor: boolean;
      loginAlerts: boolean;
    }>
  >;
}) {
  return (
    <div className="space-y-6">
      <Panel
        eyebrow="SECURITY CENTER"
        title="Protect your account"
        description="Review your security settings and account access."
      >
        <div className="rounded-[24px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <div className="flex-1">
              <p className="text-lg font-black text-emerald-950">
                Good security status
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-800/70">
                Your account has the basic security protections
                enabled.
              </p>
            </div>

            <span className="w-fit rounded-full bg-emerald-100 px-4 py-2 text-xs font-black uppercase text-emerald-700">
              Protected
            </span>
          </div>
        </div>

        <div className="mt-6">
          <ToggleRow
            icon={Shield}
            title="Two-factor authentication"
            description="Add an additional verification step when signing in."
            checked={security.twoFactor}
            onChange={() =>
              setSecurity((prev) => ({
                ...prev,
                twoFactor: !prev.twoFactor,
              }))
            }
          />

          <ToggleRow
            icon={Bell}
            title="New login alerts"
            description="Receive an alert when a new device signs into your account."
            checked={security.loginAlerts}
            onChange={() =>
              setSecurity((prev) => ({
                ...prev,
                loginAlerts: !prev.loginAlerts,
              }))
            }
          />
        </div>
      </Panel>

      <Panel
        eyebrow="PASSWORD"
        title="Password & authentication"
        description="Manage the credentials used to access your account."
      >
        <SettingButtonRow
          icon={KeyRound}
          title="Change password"
          description="Update your current account password."
          action="Change"
        />

        <SettingButtonRow
          icon={Mail}
          title="Email verification"
          description="Your email is used for secure account communication."
          action="Verified"
          success
        />
      </Panel>

      <Panel
        eyebrow="LOGIN ACTIVITY"
        title="Recent access"
        description="Review recent devices associated with your account."
      >
        <div className="space-y-3">
          <DeviceRow
            icon={Monitor}
            title="Current browser"
            device="Windows • Chrome"
            time="Active now"
            current
          />

          <DeviceRow
            icon={Smartphone}
            title="Mobile device"
            device="Android"
            time="Recently active"
          />

          <DeviceRow
            icon={Laptop}
            title="Laptop"
            device="Windows"
            time="2 days ago"
          />
        </div>
      </Panel>

      <DangerZone />
    </div>
  );
}

/* =========================================================
   APPEARANCE
========================================================= */

function AppearanceSection({
  appearance,
  setAppearance,
}: {
  appearance: "light" | "dark" | "system";
  setAppearance: (
    value: "light" | "dark" | "system"
  ) => void;
}) {
  return (
    <div className="space-y-6">
      <Panel
        eyebrow="APPEARANCE"
        title="Choose your experience"
        description="Customize how PrimeCart looks across your account."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <ThemeCard
            active={appearance === "light"}
            title="Light"
            description="Clean & bright"
            icon={Sun}
            type="light"
            onClick={() => setAppearance("light")}
          />

          <ThemeCard
            active={appearance === "dark"}
            title="Dark"
            description="Low-light friendly"
            icon={Moon}
            type="dark"
            onClick={() => setAppearance("dark")}
          />

          <ThemeCard
            active={appearance === "system"}
            title="System"
            description="Follow your device"
            icon={Smartphone}
            type="system"
            onClick={() => setAppearance("system")}
          />
        </div>
      </Panel>

      <Panel
        eyebrow="DISPLAY"
        title="Interface preferences"
        description="Fine-tune the way PrimeCart feels."
      >
        <ToggleRow
          icon={Eye}
          title="Compact product layout"
          description="Display more products on the screen."
          checked={false}
          onChange={() => {}}
        />

        <ToggleRow
          icon={Sparkles}
          title="Enhanced animations"
          description="Use subtle motion effects throughout the interface."
          checked={true}
          onChange={() => {}}
        />
      </Panel>

      <InfoBanner
        icon={Palette}
        title="PrimeCart visual style"
        text="Your PrimeCart interface uses a warm white and gold visual system designed to keep shopping clean, premium and easy to navigate."
      />
    </div>
  );
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

function NotificationsSection({
  notifications,
  setNotifications,
}: {
  notifications: {
    orders: boolean;
    promotions: boolean;
    priceDrops: boolean;
    wishlist: boolean;
    primePoints: boolean;
    email: boolean;
    browser: boolean;
  };
  setNotifications: React.Dispatch<
    React.SetStateAction<typeof notifications>
  >;
}) {
  return (
    <div className="space-y-6">
      <Panel
        eyebrow="NOTIFICATIONS"
        title="Stay in the loop"
        description="Choose the updates that matter to you."
      >
        <ToggleRow
          icon={ShoppingBag}
          title="Order updates"
          description="Shipping, delivery and order status updates."
          checked={notifications.orders}
          onChange={() =>
            setNotifications((prev) => ({
              ...prev,
              orders: !prev.orders,
            }))
          }
        />

        <ToggleRow
          icon={Bell}
          title="Promotions & deals"
          description="Exclusive offers, sales and PrimeCart promotions."
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
          description="Get notified when products you're interested in become cheaper."
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
          title="Wishlist updates"
          description="Stock and availability alerts for saved products."
          checked={notifications.wishlist}
          onChange={() =>
            setNotifications((prev) => ({
              ...prev,
              wishlist: !prev.wishlist,
            }))
          }
        />

        <ToggleRow
          icon={Sparkles}
          title="PrimePoints updates"
          description="Tier progress, rewards and points activity."
          checked={notifications.primePoints}
          onChange={() =>
            setNotifications((prev) => ({
              ...prev,
              primePoints: !prev.primePoints,
            }))
          }
        />
      </Panel>

      <Panel
        eyebrow="DELIVERY CHANNELS"
        title="Where should we notify you?"
        description="Choose your preferred notification channels."
      >
        <ToggleRow
          icon={Mail}
          title="Email notifications"
          description="Receive important updates in your inbox."
          checked={notifications.email}
          onChange={() =>
            setNotifications((prev) => ({
              ...prev,
              email: !prev.email,
            }))
          }
        />

        <ToggleRow
          icon={Bell}
          title="Browser notifications"
          description="Show supported PrimeCart alerts in your browser."
          checked={notifications.browser}
          onChange={() =>
            setNotifications((prev) => ({
              ...prev,
              browser: !prev.browser,
            }))
          }
        />
      </Panel>
    </div>
  );
}

/* =========================================================
   SHOPPING
========================================================= */

function ShoppingSection({
  shopping,
  setShopping,
}: {
  shopping: {
    recommendations: boolean;
    personalizedDeals: boolean;
    recentlyViewed: boolean;
    lowStock: boolean;
    similarProducts: boolean;
  };
  setShopping: React.Dispatch<
    React.SetStateAction<typeof shopping>
  >;
}) {
  return (
    <div className="space-y-6">
      <Panel
        eyebrow="SHOPPING EXPERIENCE"
        title="Personalize your shopping"
        description="Control how PrimeCart uses your preferences to improve recommendations."
      >
        <ToggleRow
          icon={Sparkles}
          title="Smart recommendations"
          description="Show products based on your interests and shopping activity."
          checked={shopping.recommendations}
          onChange={() =>
            setShopping((prev) => ({
              ...prev,
              recommendations: !prev.recommendations,
            }))
          }
        />

        <ToggleRow
          icon={WalletCards}
          title="Personalized deals"
          description="Show offers that are more relevant to your interests."
          checked={shopping.personalizedDeals}
          onChange={() =>
            setShopping((prev) => ({
              ...prev,
              personalizedDeals: !prev.personalizedDeals,
            }))
          }
        />

        <ToggleRow
          icon={Eye}
          title="Recently viewed"
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
          description="Notify you when saved products have limited stock."
          checked={shopping.lowStock}
          onChange={() =>
            setShopping((prev) => ({
              ...prev,
              lowStock: !prev.lowStock,
            }))
          }
        />

        <ToggleRow
          icon={ShoppingBag}
          title="Similar product suggestions"
          description="Show alternatives and similar products while shopping."
          checked={shopping.similarProducts}
          onChange={() =>
            setShopping((prev) => ({
              ...prev,
              similarProducts: !prev.similarProducts,
            }))
          }
        />
      </Panel>

      <div className="rounded-[28px] border border-amber-200 bg-gradient-to-br from-[#fffaf0] to-white p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Sparkles className="h-5 w-5" />
          </div>

          <div>
            <p className="text-lg font-black">
              Smarter shopping, your way
            </p>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              These settings help PrimeCart understand which parts
              of the shopping experience you want to personalize.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PRIVACY
========================================================= */

function PrivacySection({
  privacy,
  setPrivacy,
}: {
  privacy: {
    personalization: boolean;
    activityHistory: boolean;
    analytics: boolean;
  };
  setPrivacy: React.Dispatch<
    React.SetStateAction<typeof privacy>
  >;
}) {
  return (
    <div className="space-y-6">
      <Panel
        eyebrow="PRIVACY"
        title="Your data, your choices"
        description="Manage the information used to personalize your PrimeCart experience."
      >
        <ToggleRow
          icon={Sparkles}
          title="Personalized experience"
          description="Allow PrimeCart to use your activity for personalization."
          checked={privacy.personalization}
          onChange={() =>
            setPrivacy((prev) => ({
              ...prev,
              personalization: !prev.personalization,
            }))
          }
        />

        <ToggleRow
          icon={Clock3}
          title="Activity history"
          description="Remember products and pages you've recently viewed."
          checked={privacy.activityHistory}
          onChange={() =>
            setPrivacy((prev) => ({
              ...prev,
              activityHistory: !prev.activityHistory,
            }))
          }
        />

        <ToggleRow
          icon={Settings}
          title="Anonymous analytics"
          description="Help improve PrimeCart through anonymous usage information."
          checked={privacy.analytics}
          onChange={() =>
            setPrivacy((prev) => ({
              ...prev,
              analytics: !prev.analytics,
            }))
          }
        />
      </Panel>

      <Panel
        eyebrow="ACCOUNT DATA"
        title="Manage your information"
        description="Review or manage information associated with your account."
      >
        <SettingButtonRow
          icon={Eye}
          title="View account information"
          description="Review the information currently associated with your account."
          action="View"
        />

        <SettingButtonRow
          icon={LogOut}
          title="Sign out of all devices"
          description="End active sessions on other devices."
          action="Sign out"
        />
      </Panel>

      <DangerZone />
    </div>
  );
}

/* =========================================================
   SHARED UI
========================================================= */

function Panel({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-stone-100 p-6 sm:flex-row sm:items-start sm:p-7">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-600">
            {eyebrow}
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">
            {title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
            {description}
          </p>
        </div>

        {action}
      </div>

      <div className="p-6 sm:p-7">{children}</div>
    </section>
  );
}

function QuickCard({
  icon: Icon,
  title,
  value,
  subtitle,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-[24px] border border-stone-200 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-stone-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black">
            {value}
          </p>

          <p className="mt-1 text-xs text-stone-500">
            {subtitle}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-100">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </button>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  positive,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-[#faf9f6] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-stone-500 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            {label}
          </p>

          <p
            className={`mt-1 truncate text-sm font-black ${
              positive ? "text-emerald-600" : "text-stone-800"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusRow({
  icon: Icon,
  title,
  status,
}: {
  icon: React.ElementType;
  title: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-stone-100 bg-[#faf9f6] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-stone-500 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>

        <span className="text-sm font-bold text-stone-700">
          {title}
        </span>
      </div>

      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase text-emerald-700">
        {status}
      </span>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-[22px] border border-stone-200 bg-[#faf9f6] p-5 text-left transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>

        <ArrowRight className="h-4 w-4 text-stone-300 transition group-hover:translate-x-1 group-hover:text-amber-600" />
      </div>

      <h3 className="mt-5 text-sm font-black">{title}</h3>

      <p className="mt-2 text-xs leading-5 text-stone-500">
        {description}
      </p>
    </button>
  );
}

function Input({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-stone-500">
        {label}
      </span>

      <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3.5 transition focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-100">
        <Icon className="h-4 w-4 shrink-0 text-stone-400" />

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-stone-400"
        />
      </div>
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
} & ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-stone-100 py-5 first:pt-0 last:border-0 last:pb-0">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-black text-stone-900">
            {title}
          </p>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-stone-500">
            {description}
          </p>
        </div>
      </div>

      <button
        onClick={onChange}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-amber-500" : "bg-stone-200"
        }`}
        aria-label={title}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SettingButtonRow({
  icon: Icon,
  title,
  description,
  action,
  success,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  success?: boolean;
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

      <button
        className={`w-fit rounded-xl px-4 py-2.5 text-xs font-black ${
          success
            ? "bg-emerald-50 text-emerald-700"
            : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
        }`}
      >
        {success && <Check className="mr-1 inline h-3.5 w-3.5" />}
        {action}
      </button>
    </div>
  );
}

function DeviceRow({
  icon: Icon,
  title,
  device,
  time,
  current,
}: {
  icon: React.ElementType;
  title: string;
  device: string;
  time: string;
  current?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-[#faf9f6] p-4">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-stone-600 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-black">{title}</p>

          <p className="mt-1 truncate text-xs text-stone-500">
            {device} • {time}
          </p>
        </div>
      </div>

      {current ? (
        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase text-emerald-700">
          Current
        </span>
      ) : (
        <button className="hidden text-xs font-bold text-stone-400 hover:text-stone-800 sm:block">
          Review
        </button>
      )}
    </div>
  );
}

function ThemeCard({
  active,
  title,
  description,
  icon: Icon,
  type,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: React.ElementType;
  type: "light" | "dark" | "system";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[24px] border p-4 text-left transition ${
        active
          ? "border-amber-300 bg-amber-50/50 ring-2 ring-amber-100"
          : "border-stone-200 bg-white hover:border-stone-300"
      }`}
    >
      <div
        className={`h-32 overflow-hidden rounded-2xl border ${
          type === "dark"
            ? "border-stone-700 bg-stone-950"
            : "border-stone-200 bg-[#faf9f6]"
        }`}
      >
        {type === "system" ? (
          <div className="grid h-full grid-cols-2">
            <div className="bg-[#faf9f6] p-3">
              <div className="h-2 w-12 rounded bg-stone-300" />
              <div className="mt-3 h-12 rounded-xl bg-white shadow-sm" />
            </div>

            <div className="bg-stone-900 p-3">
              <div className="h-2 w-12 rounded bg-stone-700" />
              <div className="mt-3 h-12 rounded-xl bg-stone-800" />
            </div>
          </div>
        ) : (
          <div className="p-3">
            <div
              className={`h-2 w-12 rounded ${
                type === "dark"
                  ? "bg-stone-700"
                  : "bg-stone-300"
              }`}
            />

            <div
              className={`mt-3 h-14 rounded-xl ${
                type === "dark"
                  ? "bg-stone-800"
                  : "bg-white shadow-sm"
              }`}
            />

            <div className="mt-3 flex gap-2">
              <div className="h-2 w-8 rounded bg-amber-400" />

              <div
                className={`h-2 w-12 rounded ${
                  type === "dark"
                    ? "bg-stone-700"
                    : "bg-stone-200"
                }`}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
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
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
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
    <div className="rounded-[26px] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-black">{title}</h3>

          <p className="mt-1 text-xs leading-6 text-stone-500">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function DangerZone() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="overflow-hidden rounded-[28px] border border-red-200 bg-white shadow-sm">
        <div className="border-b border-red-100 bg-red-50/60 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                DANGER ZONE
              </p>

              <h2 className="mt-1 text-xl font-black text-red-950">
                Account actions
              </h2>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black">
                Delete account
              </p>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-stone-500">
                Permanently remove your PrimeCart account and
                associated account data.
              </p>
            </div>

            <button
              onClick={() => setOpen(true)}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-black text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-stone-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-black">
                    Delete account?
                  </h3>

                  <p className="mt-1 text-xs text-stone-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-6 rounded-2xl bg-red-50 p-4 text-xs leading-5 text-red-700">
              Account deletion is intentionally not connected in
              this UI-only version. Connect this action to your
              Supabase account deletion flow when you're ready.
            </p>

            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-2xl bg-stone-950 py-3.5 text-sm font-black text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Avatar({
  initials,
  size = "large",
}: {
  initials: string;
  size?: "small" | "large";
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br from-amber-100 via-yellow-50 to-white font-black text-amber-700 shadow-inner ${
        size === "large"
          ? "h-20 w-20 text-2xl"
          : "h-8 w-8 rounded-xl text-xs"
      }`}
    >
      {initials}
    </div>
  );
}

function HeaderLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl px-4 py-2.5 text-xs font-bold text-stone-500 transition hover:bg-white hover:text-stone-900"
    >
      {children}
    </Link>
  );
}
