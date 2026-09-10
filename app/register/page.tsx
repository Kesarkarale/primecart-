"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Moon,
  Sun,
  User,
  Mail,
  Chrome,
  Lock,
  UserPlus,

  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const supabase = createClient();

  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            name: cleanName,
          },
        },
      });

      if (signUpError) {
        if (
          signUpError.message.toLowerCase().includes("already registered") ||
          signUpError.message.toLowerCase().includes("already exists")
        ) {
          setError(
            "An account with this email already exists. Please login instead."
          );
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (data.user) {
        if (data.session) {
          setSuccess("Account created successfully! Redirecting...");

          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 800);
        } else {
          setSuccess(
            "Account created! Please check your email to verify your account."
          );
        }
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setError("");
      setGoogleLoading(true);

      const { error: googleError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        });

      if (googleError) {
        setError(googleError.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Google signup failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-[#181512] text-white"
          : "bg-[#faf9f6] text-[#29251f]"
      }`}
    >
      {/* Navbar */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
          darkMode
            ? "border-[#3c342a] bg-[#181512]/95"
            : "border-[#eee8dc] bg-white/95"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="PrimeCart"
              className="h-10 w-auto object-contain sm:h-11"
            />
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/"
              className={`hidden items-center gap-2 text-sm font-medium transition sm:flex ${
                darkMode
                  ? "text-gray-300 hover:text-[#d5a94b]"
                  : "text-gray-600 hover:text-[#b88925]"
              }`}
            >
              <ArrowLeft size={17} />
              Back to Home
            </Link>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle theme"
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                darkMode
                  ? "border-[#514533] bg-[#28221c] text-[#e1b85a] hover:bg-[#332b22]"
                  : "border-[#e8dfcf] bg-[#fffaf0] text-[#9b701d] hover:bg-[#f9f0df]"
              }`}
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[28px] border shadow-[0_20px_70px_rgba(91,65,24,0.10)] lg:grid-cols-2">
          {/* Left image section */}
          <div className="relative hidden min-h-[720px] overflow-hidden lg:block">
            <img
              src="/login-banner.png"
              alt="PrimeCart Shopping"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
                <CheckCircle2 size={16} />
                Trusted shopping experience
              </div>

              <h2 className="max-w-md text-4xl font-bold leading-tight">
                Start your journey with PrimeCart.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
                Create your account and discover quality products, exclusive
                deals and a smooth shopping experience.
              </p>
            </div>
          </div>

          {/* Register card */}
          <div
            className={`flex min-h-[720px] items-center justify-center px-6 py-10 sm:px-10 lg:px-12 ${
              darkMode ? "bg-[#211d18]" : "bg-white"
            }`}
          >
            <div className="w-full max-w-md">
              {/* Heading */}
              <div className="mb-8">
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
                    darkMode
                      ? "bg-[#392e1e] text-[#dfb34e]"
                      : "bg-[#fbf1dc] text-[#ad7d20]"
                  }`}
                >
                  <UserPlus size={26} />
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Create account
                </h1>

                <p
                  className={`mt-2 text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Join PrimeCart and start shopping today.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
                    darkMode
                      ? "border-red-900/60 bg-red-950/30 text-red-300"
                      : "border-red-200 bg-red-50 text-red-600"
                  }`}
                >
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div
                  className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
                    darkMode
                      ? "border-green-900/60 bg-green-950/30 text-green-300"
                      : "border-green-200 bg-green-50 text-green-700"
                  }`}
                >
                  {success}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name */}
                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                        darkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className={`h-12 w-full rounded-xl border pl-11 pr-4 text-sm outline-none transition ${
                        darkMode
                          ? "border-[#463d31] bg-[#181512] text-white placeholder:text-gray-600 focus:border-[#d5a94b]"
                          : "border-[#e5dfd4] bg-[#fffdfa] text-[#29251f] placeholder:text-gray-400 focus:border-[#c99a37]"
                      }`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                        darkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={`h-12 w-full rounded-xl border pl-11 pr-4 text-sm outline-none transition ${
                        darkMode
                          ? "border-[#463d31] bg-[#181512] text-white placeholder:text-gray-600 focus:border-[#d5a94b]"
                          : "border-[#e5dfd4] bg-[#fffdfa] text-[#29251f] placeholder:text-gray-400 focus:border-[#c99a37]"
                      }`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                        darkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      className={`h-12 w-full rounded-xl border pl-11 pr-12 text-sm outline-none transition ${
                        darkMode
                          ? "border-[#463d31] bg-[#181512] text-white placeholder:text-gray-600 focus:border-[#d5a94b]"
                          : "border-[#e5dfd4] bg-[#fffdfa] text-[#29251f] placeholder:text-gray-400 focus:border-[#c99a37]"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                        darkMode
                          ? "text-gray-500 hover:text-[#d5a94b]"
                          : "text-gray-400 hover:text-[#ad7d20]"
                      }`}
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                        darkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      className={`h-12 w-full rounded-xl border pl-11 pr-12 text-sm outline-none transition ${
                        darkMode
                          ? "border-[#463d31] bg-[#181512] text-white placeholder:text-gray-600 focus:border-[#d5a94b]"
                          : "border-[#e5dfd4] bg-[#fffdfa] text-[#29251f] placeholder:text-gray-400 focus:border-[#c99a37]"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                        darkMode
                          ? "text-gray-500 hover:text-[#d5a94b]"
                          : "text-gray-400 hover:text-[#ad7d20]"
                      }`}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Create account */}
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c49635] text-sm font-semibold text-white shadow-lg shadow-[#c49635]/20 transition hover:bg-[#ae8128] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Create Account
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div
                  className={`h-px flex-1 ${
                    darkMode ? "bg-[#3c342a]" : "bg-[#ece7de]"
                  }`}
                />
                <span
                  className={`text-xs ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  OR
                </span>
                <div
                  className={`h-px flex-1 ${
                    darkMode ? "bg-[#3c342a]" : "bg-[#ece7de]"
                  }`}
                />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={loading || googleLoading}
                className={`flex h-12 w-full items-center justify-center gap-3 rounded-xl border text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  darkMode
                    ? "border-[#463d31] bg-[#181512] text-gray-200 hover:bg-[#28221c]"
                    : "border-[#e4dfd6] bg-white text-gray-700 hover:bg-[#faf8f3]"
                }`}
              >
                {googleLoading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#c49635]" />
                ) : (
                  <Chrome size={18} />
                )}

                {googleLoading
                  ? "Connecting..."
                  : "Continue with Google"}
              </button>

              {/* Login */}
              <p
                className={`mt-7 text-center text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Already have an account?{" "}
                <Link
                  href="/login"
                  className={`font-semibold transition ${
                    darkMode
                      ? "text-[#d5a94b] hover:text-[#e7c875]"
                      : "text-[#ad7d20] hover:text-[#8f681b]"
                  }`}
                >
                  Login
                </Link>
              </p>

              {/* Security */}
              <div
                className={`mt-7 flex items-center justify-center gap-2 text-xs ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                <ShieldCheck size={15} />
                Your information is securely protected
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
