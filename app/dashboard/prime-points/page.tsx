"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Gift,
  HelpCircle,
  History,
  Info,
  Package,
  Percent,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  TicketPercent,
  Trophy,
  WalletCards,
  Zap,
} from "lucide-react";

type Activity = {
  id: number;
  title: string;
  description: string;
  points: number;
  date: string;
  icon: typeof ShoppingBag;
  positive: boolean;
};

const activities: Activity[] = [
  {
    id: 1,
    title: "Welcome Bonus",
    description:
      "Welcome to PrimeCart PrimePoints",
    points: 250,
    date: "Today",
    icon: Gift,
    positive: true,
  },
  {
    id: 2,
    title: "Profile Completed",
    description:
      "Completed your PrimeCart profile",
    points: 100,
    date: "Today",
    icon: BadgeCheck,
    positive: true,
  },
  {
    id: 3,
    title: "Product Review",
    description:
      "Earn points by sharing your experience",
    points: 75,
    date: "2 days ago",
    icon: Star,
    positive: true,
  },
  {
    id: 4,
    title: "Order Reward",
    description:
      "Reward from your recent purchase",
    points: 180,
    date: "5 days ago",
    icon: ShoppingBag,
    positive: true,
  },
];

const earnOptions = [
  {
    title: "Shop on PrimeCart",
    description:
      "Earn points on eligible purchases.",
    points: "1–5 pts",
    icon: ShoppingBag,
  },
  {
    title: "Write a Review",
    description:
      "Share your experience after a purchase.",
    points: "+75 pts",
    icon: Star,
  },
  {
    title: "Complete Your Profile",
    description:
      "Keep your profile information complete.",
    points: "+100 pts",
    icon: BadgeCheck,
  },
  {
    title: "Special Campaigns",
    description:
      "Earn bonus points during selected events.",
    points: "Bonus",
    icon: Zap,
  },
];

const benefits = [
  {
    title: "Exclusive Rewards",
    description:
      "Unlock special offers using your PrimePoints.",
    icon: Gift,
  },
  {
    title: "Member Savings",
    description:
      "Get access to selected PrimeCart offers.",
    icon: Percent,
  },
  {
    title: "Early Access",
    description:
      "Discover selected deals before everyone else.",
    icon: Tag,
  },
  {
    title: "Bonus Events",
    description:
      "Participate in seasonal points campaigns.",
    icon: Sparkles,
  },
];

const tiers = [
  {
    name: "Starter",
    min: 0,
    max: 999,
    description: "Your PrimeCart journey begins here.",
  },
  {
    name: "Silver",
    min: 1000,
    max: 2499,
    description:
      "More rewards and better opportunities.",
  },
  {
    name: "Gold",
    min: 2500,
    max: 4999,
    description:
      "Premium rewards for active shoppers.",
  },
  {
    name: "Platinum",
    min: 5000,
    max: 999999,
    description:
      "The highest PrimePoints experience.",
  },
];

function formatPoints(value: number) {
  return new Intl.NumberFormat("en-IN").format(
    value
  );
}

export default function PrimePointsPage() {
  /*
   * Demo/local state.
   * This page intentionally does not require a new
   * database table. Later this can be connected to
   * a real PrimePoints table without changing the UI.
   */
  const [points, setPoints] = useState(1840);

  const [redeemOpen, setRedeemOpen] =
    useState(false);

  const [redeemMessage, setRedeemMessage] =
    useState("");

  const currentTier = useMemo(() => {
    return (
      tiers.find(
        (tier) =>
          points >= tier.min &&
          points <= tier.max
      ) || tiers[0]
    );
  }, [points]);

  const currentTierIndex = tiers.findIndex(
    (tier) =>
      tier.name === currentTier.name
  );

  const nextTier =
    tiers[currentTierIndex + 1];

  const pointsToNext =
    nextTier
      ? Math.max(
          0,
          nextTier.min - points
        )
      : 0;

  const tierProgress = nextTier
    ? Math.min(
        100,
        Math.max(
          0,
          ((points -
            currentTier.min) /
            (nextTier.min -
              currentTier.min)) *
            100
        )
      )
    : 100;

  const availableRewardValue =
    Math.floor(points / 100) * 10;

  function redeemReward() {
    if (points < 500) {
      setRedeemMessage(
        "You need at least 500 PrimePoints to redeem a reward."
      );
      return;
    }

    setPoints(
      (current) =>
        current - 500
    );

    setRedeemMessage(
      "₹50 PrimeCart reward unlocked successfully."
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#181818]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#e8dfd0] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7dfd0] text-gray-500 transition hover:border-[#c9a24d] hover:text-[#a17b2f]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a24d] text-white shadow-sm">
                <Sparkles size={18} />
              </div>

              <div>
                <h1 className="text-sm font-black sm:text-base">
                  PrimePoints
                </h1>

                <p className="hidden text-[10px] font-medium text-gray-400 sm:block">
                  Rewards that grow with you
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/products"
            className="flex h-10 items-center gap-2 rounded-xl bg-[#fff4d7] px-4 text-[10px] font-black text-[#956f27] transition hover:bg-[#ffedc0]"
          >
            <ShoppingBag size={14} />
            <span className="hidden sm:inline">
              Start Shopping
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[32px] border border-[#dfc98e] bg-white">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#f0dba5]/30 blur-3xl" />

          <div className="relative grid items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-16 lg:py-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e8dcc3] bg-[#fffaf0] px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
                <Sparkles size={12} />
                PrimeCart Rewards
              </div>

              <h2 className="mt-6 max-w-2xl text-[42px] font-black leading-[1.02] tracking-[-0.045em] sm:text-5xl lg:text-[62px]">
                Your shopping
                <span className="block text-[#b58a32]">
                  just got rewarding.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
                Earn PrimePoints while you shop, review
                products and participate in special PrimeCart
                activities. Turn your points into rewards.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setRedeemOpen(true)
                  }
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#c9a24d] px-6 text-xs font-black text-white shadow-lg shadow-[#c9a24d]/15"
                >
                  <Gift size={15} />
                  Redeem Points
                </button>

                <Link
                  href="/dashboard/products"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#e2d9ca] bg-white px-6 text-xs font-black text-gray-600"
                >
                  Earn More
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* POINT CARD */}
            <div className="mx-auto w-full max-w-[410px]">
              <div className="relative overflow-hidden rounded-[30px] bg-[#171717] p-6 text-white shadow-[0_25px_70px_rgba(0,0,0,0.12)] sm:p-8">
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#c9a24d]/20 blur-2xl" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d7b96e]">
                        Available Balance
                      </p>

                      <p className="mt-3 text-4xl font-black sm:text-5xl">
                        {formatPoints(points)}
                      </p>

                      <p className="mt-1 text-[10px] text-white/45">
                        PrimePoints
                      </p>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c9a24d] text-white">
                      <Trophy size={24} />
                    </div>
                  </div>

                  <div className="mt-8 h-px bg-white/10" />

                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-white/40">
                        Current Tier
                      </p>

                      <p className="mt-1 text-lg font-black text-[#e2c77f]">
                        {currentTier.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-wider text-white/40">
                        Reward Value
                      </p>

                      <p className="mt-1 text-lg font-black">
                        ₹{availableRewardValue}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TIER PROGRESS */}
        <section className="mt-6 rounded-[28px] border border-[#e8dfd0] bg-white p-5 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                Your Progress
              </p>

              <h3 className="mt-2 text-2xl font-black">
                {currentTier.name} Member
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {nextTier
                  ? `${formatPoints(
                      pointsToNext
                    )} more points to reach ${nextTier.name}.`
                  : "You've reached the highest PrimePoints tier."}
              </p>
            </div>

            <div className="rounded-2xl bg-[#fff8e9] px-5 py-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                Balance
              </span>

              <p className="mt-1 text-xl font-black text-[#956f27]">
                {formatPoints(points)} pts
              </p>
            </div>
          </div>

          <div className="mt-7">
            <div className="relative h-3 overflow-hidden rounded-full bg-[#eee7da]">
              <div
                className="h-full rounded-full bg-[#c9a24d] transition-all duration-500"
                style={{
                  width: `${tierProgress}%`,
                }}
              />
            </div>

            <div className="mt-3 flex justify-between text-[9px] font-bold text-gray-400">
              <span>
                {currentTier.min.toLocaleString(
                  "en-IN"
                )} pts
              </span>

              <span>
                {nextTier
                  ? `${nextTier.min.toLocaleString(
                      "en-IN"
                    )} pts`
                  : "Maximum Tier"}
              </span>
            </div>
          </div>

          {/* TIER STEPS */}
          <div className="mt-8 grid gap-2 sm:grid-cols-4">
            {tiers.map(
              (tier, index) => {
                const active =
                  index <=
                  currentTierIndex;

                const current =
                  tier.name ===
                  currentTier.name;

                return (
                  <div
                    key={tier.name}
                    className={`relative rounded-2xl border p-4 ${
                      current
                        ? "border-[#c9a24d] bg-[#fffaf0]"
                        : active
                        ? "border-[#e5dccd] bg-[#faf9f6]"
                        : "border-[#eee8dd] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                          active
                            ? "bg-[#c9a24d] text-white"
                            : "bg-[#f1ede5] text-gray-400"
                        }`}
                      >
                        {active ? (
                          <CheckIcon />
                        ) : (
                          <LockIcon />
                        )}
                      </span>

                      {current && (
                        <span className="rounded-full bg-[#fff0c8] px-2 py-1 text-[8px] font-black text-[#956f27]">
                          CURRENT
                        </span>
                      )}
                    </div>

                    <p className="mt-4 text-sm font-black">
                      {tier.name}
                    </p>

                    <p className="mt-1 text-[9px] leading-4 text-gray-400">
                      {tier.description}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* EARN POINTS */}
        <section className="mt-10">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                Grow Your Balance
              </p>

              <h3 className="mt-2 text-2xl font-black">
                Earn PrimePoints
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Simple ways to build your rewards balance.
              </p>
            </div>

            <span className="flex w-fit items-center gap-2 rounded-full bg-[#fff4d7] px-3 py-2 text-[9px] font-black text-[#956f27]">
              <Zap size={11} />
              More points · More rewards
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {earnOptions.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={
                      item.title
                    }
                    className="group rounded-[24px] border border-[#e8dfd0] bg-white p-5 transition hover:-translate-y-1 hover:border-[#d4b76a] hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff5dc] text-[#b58a32]">
                        <Icon size={19} />
                      </span>

                      <span className="rounded-full bg-[#f5f1e9] px-2.5 py-1 text-[9px] font-black text-[#956f27]">
                        {item.points}
                      </span>
                    </div>

                    <h4 className="mt-5 text-sm font-black">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-[10px] leading-5 text-gray-400">
                      {item.description}
                    </p>

                    <Link
                      href="/dashboard/products"
                      className="mt-5 inline-flex items-center gap-1 text-[9px] font-black text-[#a17b2f]"
                    >
                      Get started
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* BENEFITS */}
        <section className="mt-10 rounded-[30px] border border-[#dfc98e] bg-[#fff8e9] p-6 sm:p-8 lg:p-10">
          <div className="max-w-2xl">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
              PrimeCart Advantage
            </p>

            <h3 className="mt-2 text-2xl font-black sm:text-3xl">
              More than just points.
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              PrimePoints are designed to make your PrimeCart
              experience more rewarding over time.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={
                      item.title
                    }
                    className="rounded-[22px] border border-[#eadfc9] bg-white p-5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff5dc] text-[#b58a32]">
                      <Icon size={18} />
                    </div>

                    <h4 className="mt-4 text-sm font-black">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-[10px] leading-5 text-gray-400">
                      {item.description}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* ACTIVITY + REDEEM */}
        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* ACTIVITY */}
          <div className="rounded-[28px] border border-[#e8dfd0] bg-white p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
                  Activity
                </p>

                <h3 className="mt-2 text-xl font-black">
                  Recent PrimePoints
                </h3>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff5dc] text-[#b58a32]">
                <History size={17} />
              </span>
            </div>

            <div className="mt-6 divide-y divide-[#eee8dd]">
              {activities.map(
                (activity) => {
                  const Icon =
                    activity.icon;

                  return (
                    <div
                      key={
                        activity.id
                      }
                      className="flex items-center gap-4 py-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#faf6ed] text-[#b58a32]">
                        <Icon size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black">
                          {activity.title}
                        </p>

                        <p className="mt-1 truncate text-[9px] text-gray-400">
                          {
                            activity.description
                          }
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black text-emerald-600">
                          +
                          {
                            activity.points
                          }
                        </p>

                        <p className="mt-1 text-[9px] text-gray-400">
                          {activity.date}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <button
              type="button"
              className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#e5dccd] text-[10px] font-black text-gray-500"
            >
              View Full History
              <ArrowRight size={12} />
            </button>
          </div>

          {/* REDEEM */}
          <div className="rounded-[28px] border border-[#dfc98e] bg-[#fff8e9] p-6 sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c9a24d] text-white">
              <Gift size={20} />
            </div>

            <p className="mt-5 text-[9px] font-black uppercase tracking-[0.2em] text-[#a17b2f]">
              Redeem Rewards
            </p>

            <h3 className="mt-2 text-2xl font-black">
              Turn points into value.
            </h3>

            <p className="mt-3 text-xs leading-6 text-gray-500">
              Use your PrimePoints to unlock eligible
              PrimeCart rewards.
            </p>

            <div className="mt-6 rounded-2xl border border-[#eadfc9] bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Your balance
                </span>

                <span className="text-lg font-black text-[#956f27]">
                  {formatPoints(points)}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[9px] text-gray-400">
                  Minimum redemption
                </span>

                <span className="text-[10px] font-black">
                  500 pts
                </span>
              </div>
            </div>

            {redeemMessage && (
              <div className="mt-4 rounded-xl border border-[#e7dcc6] bg-white px-4 py-3 text-[10px] font-bold text-gray-600">
                {redeemMessage}
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setRedeemOpen(true)
              }
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c9a24d] text-xs font-black text-white"
            >
              <TicketPercent size={15} />
              Explore Rewards
            </button>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-10 rounded-[30px] border border-[#e8dfd0] bg-white p-6 sm:p-8 lg:p-10">
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b58a32]">
              Simple & Rewarding
            </p>

            <h3 className="mt-2 text-2xl font-black">
              How PrimePoints works
            </h3>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Shop & Engage",
                description:
                  "Shop products, review purchases and participate in PrimeCart activities.",
                icon: ShoppingBag,
              },
              {
                number: "02",
                title: "Earn Points",
                description:
                  "Eligible actions add PrimePoints to your rewards balance.",
                icon: Sparkles,
              },
              {
                number: "03",
                title: "Unlock Rewards",
                description:
                  "Use eligible PrimePoints rewards as your balance grows.",
                icon: Gift,
              },
            ].map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={
                      item.number
                    }
                    className="relative rounded-[24px] border border-[#e9e1d4] bg-[#fffdf9] p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black text-[#ead9ac]">
                        {item.number}
                      </span>

                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff3d3] text-[#b58a32]">
                        <Icon size={19} />
                      </span>
                    </div>

                    <h4 className="mt-6 text-base font-black">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-[10px] leading-5 text-gray-400">
                      {item.description}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[28px] border border-[#e8dfd0] bg-white p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff5dc] text-[#b58a32]">
              <HelpCircle size={21} />
            </div>

            <h3 className="mt-5 text-xl font-black">
              Need help?
            </h3>

            <p className="mt-2 text-xs leading-6 text-gray-500">
              PrimePoints are designed to be simple. Eligible
              activities and reward availability may vary.
            </p>

            <Link
              href="/dashboard/settings"
              className="mt-5 inline-flex items-center gap-2 text-[10px] font-black text-[#a17b2f]"
            >
              Open Settings
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="rounded-[28px] border border-[#e8dfd0] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <Info
                size={18}
                className="text-[#b58a32]"
              />

              <h3 className="text-base font-black">
                PrimePoints information
              </h3>
            </div>

            <div className="mt-5 space-y-3">
              {[
                "Points may be earned only on eligible PrimeCart activities.",
                "Reward availability can vary by offer or campaign.",
                "Points and rewards are subject to PrimeCart terms.",
                "PrimePoints do not represent cash balance.",
              ].map(
                (text) => (
                  <div
                    key={text}
                    className="flex gap-3 rounded-xl bg-[#faf8f3] p-3"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a24d]" />

                    <p className="text-[10px] leading-5 text-gray-500">
                      {text}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* FOOTER CTA */}
        <section className="mt-10 overflow-hidden rounded-[30px] border border-[#dfc98e] bg-[#fff6df]">
          <div className="flex flex-col items-center justify-between gap-5 px-6 py-10 text-center md:flex-row md:px-10 md:text-left">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#956f27]">
                Keep earning
              </p>

              <h3 className="mt-2 text-2xl font-black">
                Your next reward is closer than you think.
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Continue shopping and exploring PrimeCart.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#c9a24d] px-6 text-xs font-black text-white"
            >
              Explore Products
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        <div className="h-12" />
      </main>

      {/* REDEEM MODAL */}
      {redeemOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
          onClick={() =>
            setRedeemOpen(false)
          }
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[28px] border border-[#dfc98e] bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="bg-[#fff7e3] p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c9a24d] text-white">
                  <Gift size={20} />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setRedeemOpen(false)
                  }
                  className="text-xs font-black text-gray-400"
                >
                  Close
                </button>
              </div>

              <h3 className="mt-5 text-2xl font-black">
                Redeem PrimePoints
              </h3>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Convert eligible PrimePoints into PrimeCart
                rewards.
              </p>
            </div>

            <div className="p-6">
              <div className="rounded-2xl border border-[#e8dfd0] bg-[#fffdf9] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Available
                  </span>

                  <span className="text-xl font-black text-[#956f27]">
                    {formatPoints(points)} pts
                  </span>
                </div>

                <div className="mt-5 h-px bg-[#eee8dd]" />

                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black">
                      ₹50 Reward
                    </p>

                    <p className="mt-1 text-[9px] text-gray-400">
                      500 PrimePoints
                    </p>
                  </div>

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff5dc] text-[#b58a32]">
                    <WalletCards size={17} />
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  redeemReward();

                  if (
                    points >=
                    500
                  ) {
                    setRedeemOpen(
                      false
                    );
                  }
                }}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c9a24d] text-xs font-black text-white"
              >
                <TicketPercent size={15} />
                Redeem 500 Points
              </button>

              <p className="mt-4 text-center text-[9px] leading-5 text-gray-400">
                Rewards are subject to eligibility and
                PrimeCart terms.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
