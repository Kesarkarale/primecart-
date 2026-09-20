"use client";

import {
  ArrowRight,
  Award,
  BadgeCheck,
  BarChart3,
  CalendarCheck,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Gift,
  HelpCircle,
  Info,
  Lock,
  Medal,
  Package,
  Percent,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Ticket,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = {
  name: string;
  min: number;
  max: number | null;
  color: string;
  icon: React.ReactNode;
  benefits: string[];
};

const tiers: Tier[] = [
  {
    name: "Starter",
    min: 0,
    max: 999,
    color: "bg-stone-100 text-stone-700",
    icon: <Medal className="h-5 w-5" />,
    benefits: [
      "Earn 1 point per ₹100",
      "Member-only offers",
      "Birthday bonus",
    ],
  },
  {
    name: "Silver",
    min: 1000,
    max: 2999,
    color: "bg-slate-100 text-slate-700",
    icon: <Award className="h-5 w-5" />,
    benefits: [
      "Earn 1.25× points",
      "Early access to deals",
      "Free priority support",
    ],
  },
  {
    name: "Gold",
    min: 3000,
    max: 5999,
    color: "bg-amber-100 text-amber-700",
    icon: <Trophy className="h-5 w-5" />,
    benefits: [
      "Earn 1.5× points",
      "Exclusive Gold deals",
      "Priority delivery offers",
    ],
  },
  {
    name: "Platinum",
    min: 6000,
    max: null,
    color: "bg-yellow-100 text-yellow-800",
    icon: <Sparkles className="h-5 w-5" />,
    benefits: [
      "Earn 2× points",
      "Premium member offers",
      "VIP customer support",
    ],
  },
];

const activities = [
  {
    title: "Welcome bonus",
    description: "PrimeCart membership bonus",
    points: 500,
    date: "Today",
    type: "bonus",
    icon: Gift,
  },
  {
    title: "Product purchase",
    description: "Order #PC-10482",
    points: 240,
    date: "Yesterday",
    type: "purchase",
    icon: ShoppingBag,
  },
  {
    title: "Product review",
    description: "Reviewed Wireless Headphones",
    points: 100,
    date: "12 Sep",
    type: "review",
    icon: Star,
  },
  {
    title: "Daily login",
    description: "7-day activity streak",
    points: 50,
    date: "10 Sep",
    type: "login",
    icon: CalendarCheck,
  },
  {
    title: "Reward redeemed",
    description: "₹100 PrimeCart reward",
    points: -1000,
    date: "08 Sep",
    type: "redeem",
    icon: Ticket,
  },
];

const earningMethods = [
  {
    icon: ShoppingBag,
    title: "Shop on PrimeCart",
    description: "Earn points on eligible purchases.",
    points: "+1 / ₹100",
    accent: "from-amber-50 to-white",
  },
  {
    icon: Star,
    title: "Review your orders",
    description: "Share your experience with the community.",
    points: "+100",
    accent: "from-yellow-50 to-white",
  },
  {
    icon: Users,
    title: "Refer a friend",
    description: "Invite friends and earn bonus points.",
    points: "+250",
    accent: "from-orange-50 to-white",
  },
  {
    icon: CalendarCheck,
    title: "Daily activity",
    description: "Keep your PrimeCart activity streak alive.",
    points: "+50",
    accent: "from-stone-50 to-white",
  },
];

const rewards = [
  {
    title: "₹50 Shopping Reward",
    points: 500,
    description: "Use on eligible PrimeCart purchases.",
    icon: Wallet,
  },
  {
    title: "₹100 Shopping Reward",
    points: 1000,
    description: "Instant discount on your next eligible order.",
    icon: CircleDollarSign,
  },
  {
    title: "₹250 Shopping Reward",
    points: 2500,
    description: "A bigger reward for your bigger shopping.",
    icon: Gift,
  },
];

export default function PrimePointsPage() {
  const [points, setPoints] = useState(1840);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<{
    title: string;
    points: number;
    description: string;
    icon: React.ElementType;
  } | null>(null);
  const [message, setMessage] = useState("");

  const currentTier = useMemo(() => {
    return (
      [...tiers].reverse().find((tier) => points >= tier.min) || tiers[0]
    );
  }, [points]);

  const currentTierIndex = tiers.findIndex(
    (tier) => tier.name === currentTier.name
  );

  const nextTier = tiers[currentTierIndex + 1] || null;

  const tierProgress = useMemo(() => {
    if (!nextTier) return 100;

    const range = nextTier.min - currentTier.min;
    const progress = points - currentTier.min;

    return Math.min(100, Math.max(0, (progress / range) * 100));
  }, [points, currentTier, nextTier]);

  const pointsToNextTier = nextTier
    ? Math.max(0, nextTier.min - points)
    : 0;

  const rewardValue = Math.floor(points / 100) * 10;

  const redeemReward = () => {
    if (!selectedReward) return;

    if (points < selectedReward.points) {
      setMessage(
        `You need ${selectedReward.points - points} more PrimePoints for this reward.`
      );
      return;
    }

    setPoints((current) => current - selectedReward.points);
    setMessage(`${selectedReward.title} redeemed successfully!`);
    setRedeemOpen(false);
  };

  const openReward = (reward: (typeof rewards)[number]) => {
    setSelectedReward(reward);
    setMessage("");
    setRedeemOpen(true);
  };

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
                <Sparkles className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="text-lg font-black tracking-tight">
                  PrimeCart
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
                  PrimePoints
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

            <div className="ml-2 flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 shadow-sm">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-black">
                {points.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-stone-500">
                points
              </span>
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
            PrimePoints
          </span>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[32px] border border-amber-200/70 bg-gradient-to-br from-[#fffdf8] via-[#fff8e8] to-[#f7e2a7] shadow-[0_25px_70px_-35px_rgba(180,130,20,0.45)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-yellow-200/20 blur-3xl" />

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.35fr_0.65fr] lg:p-12">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-xs font-bold text-amber-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                PRIME CART LOYALTY PROGRAM
              </div>

              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
                Shop more.
                <span className="block bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 bg-clip-text text-transparent">
                  Earn more.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
                PrimePoints rewards you for shopping, reviewing products,
                staying active and being part of the PrimeCart community.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    document
                      .getElementById("rewards")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-stone-300 transition hover:-translate-y-0.5 hover:bg-stone-800"
                >
                  Redeem Rewards
                  <ArrowRight className="h-4 w-4" />
                </button>

                <Link
                  href="/dashboard/products"
                  className="inline-flex items-center gap-2 rounded-2xl border border-amber-300 bg-white px-6 py-3.5 text-sm font-bold text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400"
                >
                  Start Shopping
                  <ShoppingBag className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-stone-500">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Secure rewards
                </span>

                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Instant points
                </span>

                <span className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-orange-500" />
                  Exclusive perks
                </span>
              </div>
            </div>

            {/* POINTS CARD */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-[390px] rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_25px_70px_-30px_rgba(120,80,0,0.4)] backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                      Available Balance
                    </p>

                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-5xl font-black tracking-tight text-stone-950">
                        {points.toLocaleString()}
                      </span>
                      <span className="mb-1 text-sm font-bold text-amber-600">
                        PP
                      </span>
                    </div>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700">
                    <Sparkles className="h-7 w-7" />
                  </div>
                </div>

                <div className="my-6 h-px bg-stone-100" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-stone-400">
                      Current Tier
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-lg font-black">
                        {currentTier.name}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${currentTier.color}`}
                      >
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    {currentTier.icon}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs font-semibold">
                    <span className="text-stone-500">
                      {currentTier.name}
                    </span>

                    <span className="text-stone-700">
                      {nextTier
                        ? `${pointsToNextTier.toLocaleString()} PP to ${nextTier.name}`
                        : "Maximum tier reached"}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 transition-all duration-700"
                      style={{ width: `${tierProgress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#faf9f6] px-4 py-3">
                  <span className="text-sm font-semibold text-stone-500">
                    Approx. reward value
                  </span>
                  <span className="text-lg font-black text-amber-700">
                    ₹{rewardValue}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK STATS */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Sparkles}
            title="Available Points"
            value={points.toLocaleString()}
            subtitle="Ready to redeem"
          />

          <StatCard
            icon={TrendingUp}
            title="Current Tier"
            value={currentTier.name}
            subtitle={
              nextTier
                ? `${pointsToNextTier} PP to next tier`
                : "Top tier unlocked"
            }
          />

          <StatCard
            icon={CircleDollarSign}
            title="Reward Value"
            value={`₹${rewardValue}`}
            subtitle="Estimated redemption value"
          />

          <StatCard
            icon={BarChart3}
            title="Tier Progress"
            value={`${Math.round(tierProgress)}%`}
            subtitle="Progress to next level"
          />
        </section>

        {/* TIER JOURNEY */}
        <section className="mt-10">
          <SectionHeading
            eyebrow="LOYALTY JOURNEY"
            title="Unlock more as you shop"
            description="Your PrimePoints tier grows with your activity on PrimeCart."
          />

          <div className="mt-6 overflow-hidden rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="grid gap-5 lg:grid-cols-4">
              {tiers.map((tier, index) => {
                const unlocked = points >= tier.min;
                const active = tier.name === currentTier.name;

                return (
                  <div key={tier.name} className="relative">
                    {index < tiers.length - 1 && (
                      <div className="absolute left-[58px] top-[27px] hidden h-px w-[calc(100%-15px)] bg-stone-200 lg:block" />
                    )}

                    <div
                      className={`relative rounded-2xl border p-5 transition ${
                        active
                          ? "border-amber-300 bg-gradient-to-br from-amber-50 to-white shadow-lg shadow-amber-100"
                          : unlocked
                          ? "border-stone-200 bg-stone-50/60"
                          : "border-stone-200 bg-white opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                            active
                              ? "bg-amber-200 text-amber-700"
                              : unlocked
                              ? "bg-stone-200 text-stone-700"
                              : "bg-stone-100 text-stone-400"
                          }`}
                        >
                          {unlocked ? tier.icon : <Lock className="h-5 w-5" />}
                        </div>

                        {active && (
                          <span className="rounded-full bg-stone-950 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                            You are here
                          </span>
                        )}
                      </div>

                      <h3 className="mt-5 text-xl font-black">
                        {tier.name}
                      </h3>

                      <p className="mt-1 text-xs font-semibold text-stone-400">
                        {tier.max
                          ? `${tier.min.toLocaleString()} – ${tier.max.toLocaleString()} PP`
                          : `${tier.min.toLocaleString()}+ PP`}
                      </p>

                      <div className="mt-5 space-y-2">
                        {tier.benefits.map((benefit) => (
                          <div
                            key={benefit}
                            className="flex items-start gap-2 text-xs text-stone-600"
                          >
                            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* EARN POINTS */}
        <section className="mt-10">
          <SectionHeading
            eyebrow="EARN PRIMEPOINTS"
            title="More ways to grow your balance"
            description="Turn everyday PrimeCart activity into valuable rewards."
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {earningMethods.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className={`group rounded-[24px] border border-stone-200 bg-gradient-to-br ${item.accent} p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-amber-700 shadow-sm">
                      {item.points}
                    </span>
                  </div>

                  <h3 className="mt-5 font-black text-stone-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    {item.description}
                  </p>

                  <div className="mt-5 flex items-center gap-1 text-xs font-bold text-stone-400 transition group-hover:text-amber-600">
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* REWARDS */}
        <section id="rewards" className="mt-10 scroll-mt-28">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="REDEEM"
              title="Turn points into rewards"
              description="Choose a reward and use it on eligible PrimeCart purchases."
            />

            <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-bold text-amber-800">
                {points.toLocaleString()} PP available
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {rewards.map((reward) => {
              const Icon = reward.icon;
              const canRedeem = points >= reward.points;

              return (
                <div
                  key={reward.title}
                  className="group relative overflow-hidden rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-100/60 blur-2xl" />

                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-50 text-amber-700">
                        <Icon className="h-6 w-6" />
                      </div>

                      <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-black text-stone-600">
                        {reward.points.toLocaleString()} PP
                      </span>
                    </div>

                    <h3 className="mt-6 text-xl font-black">
                      {reward.title}
                    </h3>

                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-stone-500">
                      {reward.description}
                    </p>

                    <div className="mt-6">
                      <button
                        onClick={() => openReward(reward)}
                        disabled={!canRedeem}
                        className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-black transition ${
                          canRedeem
                            ? "bg-stone-950 text-white hover:bg-stone-800"
                            : "cursor-not-allowed bg-stone-100 text-stone-400"
                        }`}
                      >
                        {canRedeem ? (
                          <>
                            Redeem Reward
                            <ArrowRight className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            Need {(reward.points - points).toLocaleString()} more
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ACTIVITY + BENEFITS */}
        <section className="mt-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          {/* ACTIVITY */}
          <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">
                  ACTIVITY
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Recent PrimePoints
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  Keep track of how your balance changes.
                </p>
              </div>

              <button className="hidden items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-600 transition hover:bg-stone-50 sm:flex">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>

            <div className="mt-7 divide-y divide-stone-100">
              {activities.map((activity) => {
                const Icon = activity.icon;
                const positive = activity.points > 0;

                return (
                  <div
                    key={`${activity.title}-${activity.date}`}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        positive
                          ? "bg-amber-50 text-amber-600"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-stone-900">
                        {activity.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-stone-500">
                        {activity.description}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-black ${
                          positive
                            ? "text-emerald-600"
                            : "text-stone-600"
                        }`}
                      >
                        {positive ? "+" : ""}
                        {activity.points.toLocaleString()} PP
                      </p>

                      <p className="mt-1 text-[11px] text-stone-400">
                        {activity.date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BENEFITS */}
          <div className="rounded-[28px] border border-amber-200 bg-gradient-to-br from-[#fffaf0] to-white p-6 shadow-sm sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">
              YOUR BENEFITS
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {currentTier.name} Member
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-500">
              Your current tier unlocks these PrimeCart advantages.
            </p>

            <div className="mt-6 space-y-3">
              {currentTier.benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white px-4 py-3.5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <BadgeCheck className="h-4 w-4" />
                  </div>

                  <span className="text-sm font-semibold text-stone-700">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {nextTier && (
              <div className="mt-6 rounded-2xl bg-stone-950 p-5 text-white">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-stone-950">
                    <TrendingUp className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-black">
                      Next up: {nextTier.name}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-stone-300">
                      Earn {pointsToNextTier.toLocaleString()} more
                      PrimePoints to unlock your next tier.
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${tierProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SMART INSIGHT */}
        <section className="mt-10">
          <div className="overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div className="bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 p-7 text-white sm:p-9">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-stone-950">
                  <Sparkles className="h-6 w-6" />
                </div>

                <h2 className="mt-6 text-3xl font-black">
                  Your PrimePoints strategy
                </h2>

                <p className="mt-4 text-sm leading-7 text-stone-300">
                  Small actions can build your balance quickly. Shop,
                  review products and maintain your activity streak to
                  unlock more value.
                </p>

                <Link
                  href="/dashboard/products"
                  className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3.5 text-sm font-black text-stone-950 transition hover:bg-amber-300"
                >
                  Explore Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-9">
                <InsightCard
                  icon={Zap}
                  title="Keep your streak"
                  text="Daily activity can help you collect extra PrimePoints."
                />

                <InsightCard
                  icon={Star}
                  title="Review purchases"
                  text="Share useful feedback and earn review bonuses."
                />

                <InsightCard
                  icon={ShoppingBag}
                  title="Shop smarter"
                  text="Use rewards on future eligible purchases."
                />

                <InsightCard
                  icon={Trophy}
                  title="Reach the next tier"
                  text={
                    nextTier
                      ? `${pointsToNextTier.toLocaleString()} points remaining to ${nextTier.name}.`
                      : "You have reached the highest tier."
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-10">
          <SectionHeading
            eyebrow="HOW IT WORKS"
            title="Simple. Transparent. Rewarding."
            description="PrimePoints is designed to make your everyday PrimeCart journey more valuable."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <StepCard
              number="01"
              icon={ShoppingBag}
              title="Shop"
              text="Complete eligible purchases and collect PrimePoints."
            />

            <StepCard
              number="02"
              icon={TrendingUp}
              title="Grow"
              text="Build your balance and progress through loyalty tiers."
            />

            <StepCard
              number="03"
              icon={Gift}
              title="Redeem"
              text="Exchange your points for PrimeCart shopping rewards."
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-10 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <HelpCircle className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">
                GOOD TO KNOW
              </p>

              <h2 className="mt-1 text-2xl font-black">
                PrimePoints essentials
              </h2>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <Faq
              question="What are PrimePoints?"
              answer="PrimePoints are loyalty points that can be earned through eligible PrimeCart activities and redeemed for rewards."
            />

            <Faq
              question="How do I reach a higher tier?"
              answer="Continue earning PrimePoints. Your tier automatically increases when your balance reaches the required threshold."
            />

            <Faq
              question="Can I redeem points immediately?"
              answer="You can redeem a reward whenever your available balance meets the reward's required point value."
            />

            <Faq
              question="Can I use rewards on every product?"
              answer="Reward eligibility can vary by promotion, product and order conditions."
            />
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mt-10 overflow-hidden rounded-[30px] border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-yellow-50">
          <div className="flex flex-col gap-6 p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-600">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">
                  PrimeCart Rewards
                </span>
              </div>

              <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                Ready to earn your next reward?
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                Use PrimeCart, collect points and turn your shopping
                activity into something more valuable.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-stone-950 px-6 py-3.5 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-stone-800"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* REDEEM MODAL */}
      {redeemOpen && selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">
                  REDEEM REWARD
                </p>

                <h3 className="mt-1 text-xl font-black">
                  Confirm redemption
                </h3>
              </div>

              <button
                onClick={() => setRedeemOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-500 transition hover:bg-stone-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                    <selectedReward.icon className="h-6 w-6" />
                  </div>

                  <div>
                    <h4 className="font-black">
                      {selectedReward.title}
                    </h4>

                    <p className="mt-1 text-xs text-stone-500">
                      {selectedReward.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-xl bg-white px-4 py-3">
                  <span className="text-sm font-semibold text-stone-500">
                    Cost
                  </span>

                  <span className="font-black text-amber-700">
                    {selectedReward.points.toLocaleString()} PP
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-stone-200 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    Current
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {points.toLocaleString()} PP
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    After redeem
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {Math.max(
                      0,
                      points - selectedReward.points
                    ).toLocaleString()}{" "}
                    PP
                  </p>
                </div>
              </div>

              {message && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  {message}
                </div>
              )}

              <button
                onClick={redeemReward}
                disabled={points < selectedReward.points}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black transition ${
                  points >= selectedReward.points
                    ? "bg-stone-950 text-white hover:bg-stone-800"
                    : "cursor-not-allowed bg-stone-100 text-stone-400"
                }`}
              >
                {points >= selectedReward.points ? (
                  <>
                    Confirm Redemption
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Not Enough Points
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="group rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black text-stone-950">
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
      <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
        {description}
      </p>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-[#faf9f6] p-5 transition hover:border-amber-200 hover:bg-amber-50/40">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-sm font-black">{title}</h3>

      <p className="mt-2 text-xs leading-5 text-stone-500">
        {text}
      </p>
    </div>
  );
}

function StepCard({
  number,
  icon: Icon,
  title,
  text,
}: {
  number: string;
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="relative rounded-[24px] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Icon className="h-5 w-5" />
        </div>

        <span className="text-4xl font-black text-stone-100">
          {number}
        </span>
      </div>

      <h3 className="mt-6 text-lg font-black">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-stone-500">
        {text}
      </p>
    </div>
  );
}

function Faq({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-[#faf9f6] p-5">
      <div className="flex gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

        <div>
          <h3 className="text-sm font-black">{question}</h3>

          <p className="mt-2 text-xs leading-5 text-stone-500">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
