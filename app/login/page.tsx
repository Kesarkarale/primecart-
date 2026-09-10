"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  Loader2,
  Sparkles,
  Moon,
  Sun,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [isDark, setIsDark] = useState(false);

  /* ========================================================
     LOAD THEME
  ======================================================== */

  useEffect(() => {
    const savedTheme = localStorage.getItem("primecart-theme");

    setIsDark(savedTheme === "dark");
  }, []);

  /* ========================================================
     THEME TOGGLE
  ======================================================== */

  const toggleTheme = () => {
    setIsDark((current) => {
      const next = !current;

      localStorage.setItem(
        "primecart-theme",
        next ? "dark" : "light"
      );

      return next;
    });
  };

  /* ========================================================
     LOGIN
  ======================================================== */

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        const message = loginError.message.toLowerCase();

        if (
          message.includes("invalid login credentials")
        ) {
          throw new Error(
            "Invalid email or password. Please check your details and try again."
          );
        }

        if (message.includes("email not confirmed")) {
          throw new Error(
            "Please verify your email address before logging in."
          );
        }

        throw new Error(loginError.message);
      }

      if (!data.session) {
        throw new Error(
          "Login could not be completed. Please try again."
        );
      }

      setSuccess("Login successful! Redirecting...");

      /*
       * Small delay so user can see success message.
       */

      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ========================================================
     GOOGLE LOGIN
  ======================================================== */

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setGoogleLoading(true);

    try {
      const supabase = createClient();

      const { error: googleError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        });

      if (googleError) {
        throw new Error(googleError.message);
      }
    } catch (err) {
      setGoogleLoading(false);

      setError(
        err instanceof Error
          ? err.message
          : "Google login failed. Please try again."
      );
    }
  };

  /* ========================================================
     THEME CLASSES
  ======================================================== */

  const pageBackground = isDark
    ? "bg-[#171512]"
    : "bg-[#faf9f6]";

  const panelBackground = isDark
    ? "bg-[#211f1a]"
    : "bg-white";

  const inputBackground = isDark
    ? "bg-[#29261f]"
    : "bg-[#faf9f6]";

  const inputBorder = isDark
    ? "border-[#484132]"
    : "border-[#ded9ce]";

  const headingColor = isDark
    ? "text-[#faf7ef]"
    : "text-[#191919]";

  const mutedColor = isDark
    ? "text-[#aaa498]"
    : "text-[#77736a]";

  const goldColor = "text-[#c9a227]";

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${pageBackground}`}
    >
      {/* =====================================================
          TOP NAV
      ===================================================== */}

      <header
        className={`h-[74px] border-b ${
          isDark
            ? "bg-[#1c1a16] border-[#3b362c]"
            : "bg-white border-[#ebe6dc]"
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-5 sm:px-8 flex items-center justify-between">
          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11">
              <Image
                src="/logo.png"
                alt="PrimeCart"
                fill
                priority
                className="object-contain"
              />
            </div>

            <div>
              <h1
                className={`text-xl sm:text-2xl font-bold ${headingColor}`}
              >
                Prime
                <span className={goldColor}>Cart</span>
              </h1>

              <p
                className={`hidden sm:block text-[8px] uppercase tracking-[0.2em] ${mutedColor}`}
              >
                Premium Shopping
              </p>
            </div>
          </Link>

          {/* RIGHT */}

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className={`hidden sm:block text-sm font-medium hover:text-[#c9a227] transition ${mutedColor}`}
            >
              Back to Home
            </Link>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                isDark
                  ? "bg-[#302c23] text-[#dfbd46] hover:bg-[#39342a]"
                  : "bg-[#f7f3e8] text-[#9c7815] hover:bg-[#eee5d2]"
              }`}
            >
              {isDark ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <section className="min-h-[calc(100vh-74px)] flex items-center py-8 sm:py-12">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6">
          <div
            className={`grid lg:grid-cols-2 overflow-hidden rounded-[30px] border shadow-xl ${
              isDark
                ? "border-[#403a2d] bg-[#211f1a]"
                : "border-[#e7e2d7] bg-white"
            }`}
          >
            {/* =================================================
                LEFT IMAGE
            ================================================= */}

            <div className="hidden lg:block relative min-h-[700px] overflow-hidden">
              <Image
                src="/login-banner.png"
                alt="PrimeCart Shopping"
                fill
                priority
                className="object-cover"
              />

              {/* OVERLAY */}

              <div
                className={`absolute inset-0 ${
                  isDark
                    ? "bg-[#201d17]/35"
                    : "bg-[#6e5a2a]/10"
                }`}
              />

              {/* GOLD GRADIENT */}

              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* IMAGE CONTENT */}

              <div className="absolute left-9 right-9 bottom-9 text-white">
                <div className="w-12 h-12 rounded-2xl bg-[#d4af37] flex items-center justify-center mb-5">
                  <ShoppingBag size={23} />
                </div>

                <h2 className="text-4xl font-serif font-bold leading-tight">
                  Your premium
                  <br />
                  shopping journey
                  <br />
                  starts here.
                </h2>

                <p className="mt-4 text-sm text-white/80 max-w-md leading-relaxed">
                  Discover quality products, exclusive deals and
                  effortless shopping with PrimeCart.
                </p>

                <div className="flex items-center gap-5 mt-6">
                  <div>
                    <p className="text-2xl font-bold">
                      10K+
                    </p>

                    <p className="text-xs text-white/70">
                      Customers
                    </p>
                  </div>

                  <div className="w-px h-8 bg-white/30" />

                  <div>
                    <p className="text-2xl font-bold">
                      5K+
                    </p>

                    <p className="text-xs text-white/70">
                      Products
                    </p>
                  </div>

                  <div className="w-px h-8 bg-white/30" />

                  <div>
                    <p className="text-2xl font-bold">
                      4.8★
                    </p>

                    <p className="text-xs text-white/70">
                      Rating
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                LOGIN PANEL
            ================================================= */}

            <div className="flex items-center">
              <div className="w-full px-6 sm:px-10 lg:px-14 py-10 sm:py-14">
                {/* HEADER */}

                <div className="max-w-md mx-auto">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isDark
                        ? "bg-[#352f21] text-[#d8b53e]"
                        : "bg-[#faf5e7] text-[#a27d13]"
                    }`}
                  >
                    <Sparkles size={21} />
                  </div>

                  <p
                    className={`mt-6 text-xs uppercase tracking-[0.2em] font-bold ${goldColor}`}
                  >
                    Welcome back
                  </p>

                  <h2
                    className={`mt-2 text-4xl sm:text-5xl font-serif font-bold ${headingColor}`}
                  >
                    Sign in
                  </h2>

                  <p
                    className={`mt-3 text-sm leading-relaxed ${mutedColor}`}
                  >
                    Sign in to continue your PrimeCart shopping
                    experience.
                  </p>

                  {/* =================================================
                      ERROR
                  ================================================= */}

                  {error && (
                    <div className="mt-6 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {/* =================================================
                      SUCCESS
                  ================================================= */}

                  {success && (
                    <div
                      className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
                        isDark
                          ? "border-green-800 bg-green-950/30 text-green-300"
                          : "border-green-200 bg-green-50 text-green-700"
                      }`}
                    >
                      {success}
                    </div>
                  )}

                  {/* =================================================
                      FORM
                  ================================================= */}

                  <form
                    onSubmit={handleLogin}
                    className="mt-7 space-y-5"
                  >
                    {/* EMAIL */}

                    <div>
                      <label
                        htmlFor="email"
                        className={`block text-sm font-semibold mb-2 ${headingColor}`}
                      >
                        Email Address
                      </label>

                      <div className="relative">
                        <Mail
                          size={18}
                          className={`absolute left-4 top-1/2 -translate-y-1/2 ${mutedColor}`}
                        />

                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) =>
                            setEmail(e.target.value)
                          }
                          placeholder="Enter your email"
                          autoComplete="email"
                          disabled={loading}
                          className={`w-full h-13 pl-11 pr-4 rounded-2xl border outline-none text-sm transition ${inputBackground} ${inputBorder} ${headingColor} focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/10`}
                        />
                      </div>
                    </div>

                    {/* PASSWORD */}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label
                          htmlFor="password"
                          className={`text-sm font-semibold ${headingColor}`}
                        >
                          Password
                        </label>

                        <Link
                          href="/forgot-password"
                          className={`text-xs font-semibold ${goldColor} hover:underline`}
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <div className="relative">
                        <LockKeyhole
                          size={18}
                          className={`absolute left-4 top-1/2 -translate-y-1/2 ${mutedColor}`}
                        />

                        <input
                          id="password"
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          value={password}
                          onChange={(e) =>
                            setPassword(e.target.value)
                          }
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          disabled={loading}
                          className={`w-full h-13 pl-11 pr-12 rounded-2xl border outline-none text-sm transition ${inputBackground} ${inputBorder} ${headingColor} focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/10`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                          className={`absolute right-4 top-1/2 -translate-y-1/2 ${mutedColor} hover:text-[#c9a227]`}
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* REMEMBER */}

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) =>
                            setRememberMe(e.target.checked)
                          }
                          className="w-4 h-4 accent-[#c9a227]"
                        />

                        <span
                          className={`text-xs ${mutedColor}`}
                        >
                          Remember me
                        </span>
                      </label>

                      <div
                        className={`flex items-center gap-1 text-[11px] ${mutedColor}`}
                      >
                        <ShieldCheck size={13} />
                        Secure login
                      </div>
                    </div>

                    {/* LOGIN BUTTON */}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-13 rounded-2xl bg-[#c9a227] hover:bg-[#b58e1c] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      {loading ? (
                        <>
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </form>

                  {/* =================================================
                      DIVIDER
                  ================================================= */}

                  <div className="flex items-center gap-4 my-7">
                    <div
                      className={`h-px flex-1 ${
                        isDark
                          ? "bg-[#403a2e]"
                          : "bg-[#e8e3d9]"
                      }`}
                    />

                    <span
                      className={`text-xs ${mutedColor}`}
                    >
                      OR
                    </span>

                    <div
                      className={`h-px flex-1 ${
                        isDark
                          ? "bg-[#403a2e]"
                          : "bg-[#e8e3d9]"
                      }`}
                    />
                  </div>

                  {/* =================================================
                      GOOGLE
                  ================================================= */}

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                    className={`w-full h-13 rounded-2xl border flex items-center justify-center gap-3 font-medium text-sm transition ${
                      isDark
                        ? "border-[#4a4437] hover:bg-[#2b281f]"
                        : "border-[#ddd8cd] hover:bg-[#faf8f2]"
                    } ${headingColor}`}
                  >
                    {googleLoading ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-sm">
                        G
                      </span>
                    )}

                    {googleLoading
                      ? "Connecting..."
                      : "Continue with Google"}
                  </button>

                  {/* =================================================
                      REGISTER
                  ================================================= */}

                  <p
                    className={`text-center text-sm mt-7 ${mutedColor}`}
                  >
                    Don't have an account?{" "}
                    <Link
                      href="/register"
                      className={`font-bold ${goldColor} hover:underline`}
                    >
                      Create account
                    </Link>
                  </p>

                  {/* MOBILE HOME */}

                  <Link
                    href="/"
                    className={`sm:hidden block text-center text-xs mt-6 ${mutedColor} hover:text-[#c9a227]`}
                  >
                    ← Back to PrimeCart
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* SECURITY NOTE */}

          <div className="text-center mt-5">
            <p
              className={`text-[11px] ${mutedColor}`}
            >
              Your account information is protected with secure
              authentication.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
