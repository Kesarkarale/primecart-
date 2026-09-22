"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------------------------------------------
     REMEMBERED EMAIL
  --------------------------------------------- */

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(
        "primecart_remembered_email"
      );

      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  /* ---------------------------------------------
     LOGIN
  --------------------------------------------- */

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
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

      if (rememberMe) {
        try {
          localStorage.setItem(
            "primecart_remembered_email",
            cleanEmail
          );
        } catch {
          // Ignore storage errors
        }
      } else {
        try {
          localStorage.removeItem(
            "primecart_remembered_email"
          );
        } catch {
          // Ignore storage errors
        }
      }

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (loginError) {
        const message = loginError.message.toLowerCase();

        if (
          message.includes("email not confirmed") ||
          message.includes("email not verified") ||
          message.includes("confirm")
        ) {
          setError(
            "Please verify your email before logging in."
          );
        } else if (
          message.includes("invalid login credentials")
        ) {
          setError("Invalid email or password.");
        } else {
          setError(loginError.message);
        }

        setLoading(false);
        return;
      }

      if (!data.session) {
        setError(
          "Unable to create a login session. Please try again."
        );

        setLoading(false);
        return;
      }

      setSuccess("Login successful! Taking you to PrimeCart...");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 850);
    } catch (err) {
      console.error("Login error:", err);

      setError(
        "Something went wrong while logging in. Please try again."
      );

      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      {/* BACKGROUND DECORATION */}

      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <div className="grid-pattern" />

      <div className="login-wrapper">
        {/* =====================================================
            LEFT SHOWCASE
        ====================================================== */}

        <section className="login-showcase">
          {/* BRAND */}

          <Link href="/" className="brand">
            <div className="brand-logo">
              <Image
                src="/logo.png"
                alt="PrimeCart"
                width={46}
                height={46}
                priority
              />
            </div>

            <div className="brand-name">
              Prime<span>Cart</span>
            </div>
          </Link>

          {/* MAIN SHOWCASE */}

          <div className="showcase-main">
            <div className="eyebrow">
              <span className="eyebrow-icon">
                <Sparkles size={13} />
              </span>

              <span>Welcome to smarter shopping</span>
            </div>

            <h1>
              Everything you need.
              <br />

              <span>All in one place.</span>
            </h1>

            <p className="showcase-description">
              Discover trending products, exclusive deals and
              everyday essentials — carefully brought together
              for a simpler shopping experience.
            </p>

            {/* FEATURE CARDS */}

            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <Zap size={18} />
                </div>

                <div>
                  <strong>Smart deals</strong>
                  <span>
                    Discover great value without endless searching.
                  </span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <Truck size={18} />
                </div>

                <div>
                  <strong>Easy shopping</strong>
                  <span>
                    Browse products and manage everything effortlessly.
                  </span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <strong>Secure experience</strong>
                  <span>
                    Your account and shopping journey stay protected.
                  </span>
                </div>
              </div>
            </div>

            {/* MINI STATS */}

            <div className="mini-stats">
              <div className="stat">
                <strong>10K+</strong>
                <span>Products</span>
              </div>

              <div className="stat-line" />

              <div className="stat">
                <strong>7 Days</strong>
                <span>Easy Returns</span>
              </div>

              <div className="stat-line" />

              <div className="stat">
                <strong>24/7</strong>
                <span>Shopping</span>
              </div>
            </div>
          </div>

          {/* FOOTER */}

          <div className="showcase-footer">
            <span>© 2026 PrimeCart</span>

            <div className="footer-links">
              <span>Secure</span>
              <span className="footer-dot">•</span>
              <span>Simple</span>
              <span className="footer-dot">•</span>
              <span>Smart</span>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT LOGIN
        ====================================================== */}

        <section className="login-section">
          <div className="login-card">
            {/* MOBILE BRAND */}

            <div className="mobile-brand">
              <Link href="/" className="brand">
                <div className="brand-logo">
                  <Image
                    src="/logo.png"
                    alt="PrimeCart"
                    width={42}
                    height={42}
                  />
                </div>

                <div className="brand-name">
                  Prime<span>Cart</span>
                </div>
              </Link>
            </div>

            {/* CARD TOP DECORATION */}

            <div className="card-top-glow" />

            {/* HEADER */}

            <div className="card-header">
              <div className="welcome-icon">
                <LockKeyhole size={21} />
              </div>

              <div className="header-copy">
                <span className="small-heading">
                  YOUR ACCOUNT
                </span>

                <h2>Welcome back</h2>

                <p>
                  Sign in to continue your PrimeCart journey.
                </p>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div
                className="message error-message"
                role="alert"
              >
                <div className="message-icon">
                  <AlertCircle size={17} />
                </div>

                <span>{error}</span>
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div
                className="message success-message"
                role="status"
              >
                <div className="message-icon">
                  <CheckCircle2 size={17} />
                </div>

                <span>{success}</span>
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleLogin}
              className="login-form"
            >
              {/* EMAIL */}

              <div className="field">
                <label htmlFor="email">
                  Email address
                </label>

                <div
                  className={`input-wrapper ${
                    email ? "has-value" : ""
                  }`}
                >
                  <div className="input-icon-box">
                    <Mail size={18} />
                  </div>

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="field">
                <div className="password-header">
                  <label htmlFor="password">
                    Password
                  </label>

                  <Link href="/auth/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <div
                  className={`input-wrapper ${
                    password ? "has-value" : ""
                  }`}
                >
                  <div className="input-icon-box">
                    <LockKeyhole size={18} />
                  </div>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    disabled={loading}
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

              <label className="remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                  disabled={loading}
                />

                <span className="custom-checkbox">
                  <span>✓</span>
                </span>

                <span>Remember me</span>
              </label>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                <span className="button-shine" />

                {loading ? (
                  <>
                    <Loader2
                      size={19}
                      className="spin"
                    />

                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to PrimeCart</span>

                    <span className="button-arrow">
                      <ArrowRight size={18} />
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* DIVIDER */}

            <div className="divider">
              <span>New to PrimeCart?</span>
            </div>

            {/* REGISTER */}

            <Link
              href="/auth/register"
              className="create-account"
            >
              <span>Create your account</span>

              <span className="create-arrow">
                <ArrowRight size={16} />
              </span>
            </Link>

            {/* TRUST */}

            <div className="security-note">
              <div className="security-icon">
                <ShieldCheck size={15} />
              </div>

              <div>
                <strong>Secure sign in</strong>

                <span>
                  Your account information is protected.
                </span>
              </div>
            </div>

            {/* SMALL BENEFITS */}

            <div className="login-benefits">
              <div>
                <CheckCircle2 size={13} />
                <span>Easy returns</span>
              </div>

              <div>
                <CheckCircle2 size={13} />
                <span>Secure checkout</span>
              </div>

              <div>
                <CheckCircle2 size={13} />
                <span>Smart deals</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          min-height: 100%;
        }

        body {
          background: #faf8f3;
        }

        button,
        input {
          font: inherit;
        }

        /* =====================================================
           PAGE
        ====================================================== */

        .login-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 80% 15%,
              rgba(215, 170, 63, 0.1),
              transparent 28%
            ),
            radial-gradient(
              circle at 10% 85%,
              rgba(215, 170, 63, 0.07),
              transparent 28%
            ),
            #faf8f3;
          color: #211f1a;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* =====================================================
           AMBIENT EFFECTS
        ====================================================== */

        .ambient {
          position: fixed;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
        }

        .ambient-one {
          top: -190px;
          right: -100px;
          background: rgba(207, 161, 48, 0.2);
          animation: ambientFloat 9s ease-in-out infinite;
        }

        .ambient-two {
          bottom: -220px;
          left: -130px;
          background: rgba(218, 178, 82, 0.13);
          animation: ambientFloat 11s ease-in-out infinite reverse;
        }

        .ambient-three {
          top: 40%;
          left: 42%;
          width: 240px;
          height: 240px;
          background: rgba(255, 225, 153, 0.08);
          animation: ambientFloat 13s ease-in-out infinite;
        }

        @keyframes ambientFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(20px, -20px, 0);
          }
        }

        .grid-pattern {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.25;
          background-image:
            linear-gradient(
              rgba(198, 150, 36, 0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(198, 150, 36, 0.025) 1px,
              transparent 1px
            );
          background-size: 48px 48px;
          mask-image: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.8),
            transparent 90%
          );
        }

        /* =====================================================
           WRAPPER
        ====================================================== */

        .login-wrapper {
          position: relative;
          z-index: 1;
          width: min(1240px, calc(100% - 56px));
          min-height: 100vh;
          margin: 0 auto;
          padding: 38px 0;
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(420px, 0.92fr);
          gap: 70px;
          align-items: center;
        }

        /* =====================================================
           BRAND
        ====================================================== */

        .brand {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #211f1a;
          text-decoration: none;
          animation: fadeDown 0.7s ease both;
        }

        .brand-logo {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #fff;
          border: 1px solid #eadfca;
          box-shadow:
            0 12px 30px rgba(83, 60, 20, 0.1);
          overflow: hidden;
        }

        .brand-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .brand-name {
          font-size: 25px;
          line-height: 1;
          font-weight: 850;
          letter-spacing: -1px;
        }

        .brand-name span {
          color: #c69624;
        }

        /* =====================================================
           LEFT SHOWCASE
        ====================================================== */

        .login-showcase {
          min-height: 690px;
          padding: 26px 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .showcase-main {
          max-width: 650px;
          animation: fadeUp 0.8s 0.1s ease both;
        }

        .eyebrow {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 13px;
          margin-bottom: 25px;
          border: 1px solid rgba(198, 150, 36, 0.2);
          background: rgba(255, 255, 255, 0.7);
          border-radius: 999px;
          color: #85651b;
          font-size: 12px;
          font-weight: 750;
          box-shadow: 0 8px 25px rgba(80, 60, 20, 0.04);
        }

        .eyebrow-icon {
          width: 23px;
          height: 23px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f7e9c6;
          color: #a4791d;
        }

        .showcase-main h1 {
          margin: 0;
          font-size: clamp(48px, 5.2vw, 76px);
          line-height: 0.98;
          letter-spacing: -4.5px;
          font-weight: 900;
          color: #211f1a;
        }

        .showcase-main h1 span {
          display: inline-block;
          color: #c69624;
          background: linear-gradient(
            100deg,
            #b88618,
            #d6aa45,
            #b88618
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: goldFlow 5s linear infinite;
        }

        @keyframes goldFlow {
          to {
            background-position: 200% center;
          }
        }

        .showcase-description {
          max-width: 570px;
          margin: 27px 0 34px;
          color: #777166;
          font-size: 16px;
          line-height: 1.8;
        }

        /* =====================================================
           FEATURES
        ====================================================== */

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 14px;
          width: min(550px, 100%);
          padding: 12px 14px;
          border-radius: 16px;
          transition:
            transform 0.25s ease,
            background 0.25s ease;
        }

        .feature-item:hover {
          transform: translateX(5px);
          background: rgba(255, 255, 255, 0.55);
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #f5e6bd;
          color: #946d17;
        }

        .feature-item strong {
          display: block;
          margin-bottom: 3px;
          color: #29261f;
          font-size: 13px;
          font-weight: 800;
        }

        .feature-item span {
          display: block;
          color: #8b8479;
          font-size: 12px;
          line-height: 1.5;
        }

        /* =====================================================
           STATS
        ====================================================== */

        .mini-stats {
          display: flex;
          align-items: center;
          gap: 22px;
          margin-top: 34px;
          padding-top: 25px;
          border-top: 1px solid rgba(195, 181, 153, 0.35);
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .stat strong {
          color: #29261f;
          font-size: 16px;
          font-weight: 850;
        }

        .stat span {
          color: #999185;
          font-size: 11px;
        }

        .stat-line {
          width: 1px;
          height: 28px;
          background: #dfd8ca;
        }

        /* =====================================================
           FOOTER
        ====================================================== */

        .showcase-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 650px;
          color: #aaa398;
          font-size: 11px;
          animation: fadeUp 0.8s 0.25s ease both;
        }

        .footer-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-dot {
          color: #d3b26a;
        }

        /* =====================================================
           LOGIN SECTION
        ====================================================== */

        .login-section {
          display: flex;
          justify-content: center;
          animation: cardEnter 0.8s 0.15s ease both;
        }

        .login-card {
          position: relative;
          width: min(475px, 100%);
          padding: 42px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.93);
          border: 1px solid rgba(225, 216, 198, 0.9);
          border-radius: 30px;
          box-shadow:
            0 35px 90px rgba(57, 45, 22, 0.1),
            0 8px 25px rgba(57, 45, 22, 0.045);
          backdrop-filter: blur(18px);
        }

        .login-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 12%;
          right: 12%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(198, 150, 36, 0.7),
            transparent
          );
        }

        .card-top-glow {
          position: absolute;
          top: -120px;
          right: -100px;
          width: 230px;
          height: 230px;
          border-radius: 50%;
          background: rgba(215, 170, 63, 0.09);
          filter: blur(40px);
          pointer-events: none;
        }

        .mobile-brand {
          display: none;
        }

        /* =====================================================
           HEADER
        ====================================================== */

        .card-header {
          position: relative;
          display: flex;
          gap: 15px;
          margin-bottom: 27px;
        }

        .welcome-icon {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: linear-gradient(
            145deg,
            #f9efd6,
            #f3dfad
          );
          color: #96701b;
          box-shadow:
            inset 0 0 0 1px rgba(198, 150, 36, 0.13);
        }

        .small-heading {
          display: block;
          margin-bottom: 5px;
          color: #aa8a4a;
          font-size: 9px;
          letter-spacing: 1.5px;
          font-weight: 850;
        }

        .card-header h2 {
          margin: 0;
          color: #211f1a;
          font-size: 30px;
          line-height: 1.1;
          letter-spacing: -1.2px;
          font-weight: 850;
        }

        .card-header p {
          margin: 7px 0 0;
          color: #888176;
          font-size: 12px;
          line-height: 1.6;
        }

        /* =====================================================
           MESSAGES
        ====================================================== */

        .message {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 13px;
          margin-bottom: 18px;
          border-radius: 13px;
          font-size: 12px;
          line-height: 1.5;
          animation: messageIn 0.35s ease both;
        }

        .message-icon {
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          margin-top: 1px;
        }

        .error-message {
          color: #9a4444;
          background: #fff3f2;
          border: 1px solid #f2d4d1;
        }

        .success-message {
          color: #4e754c;
          background: #f1f8ef;
          border: 1px solid #d5e8d1;
        }

        @keyframes messageIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =====================================================
           FORM
        ====================================================== */

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 19px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label,
        .password-header label {
          color: #363229;
          font-size: 12px;
          font-weight: 800;
        }

        .password-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .password-header a {
          color: #a2771d;
          font-size: 11px;
          font-weight: 800;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .password-header a:hover {
          color: #79590f;
        }

        /* =====================================================
           INPUTS
        ====================================================== */

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper::after {
          content: "";
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 0;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            #b9891d,
            #e1bd66
          );
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.25s ease;
          pointer-events: none;
        }

        .input-wrapper:focus-within::after {
          transform: scaleX(1);
        }

        .input-icon-box {
          position: absolute;
          left: 15px;
          z-index: 2;
          display: grid;
          place-items: center;
          color: #aaa298;
          pointer-events: none;
          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .input-wrapper:focus-within .input-icon-box {
          color: #b2831b;
          transform: scale(1.04);
        }

        .input-wrapper input {
          width: 100%;
          height: 53px;
          padding: 0 45px;
          border: 1px solid #e4ded3;
          border-radius: 14px;
          outline: none;
          background: #fff;
          color: #29261f;
          font-size: 13px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .input-wrapper input:hover:not(:disabled) {
          border-color: #d7ccb7;
        }

        .input-wrapper input:focus {
          border-color: #d0a039;
          background: #fffefa;
          box-shadow:
            0 0 0 4px rgba(208, 160, 57, 0.09),
            0 8px 20px rgba(74, 57, 24, 0.04);
        }

        .input-wrapper input::placeholder {
          color: #b5afa5;
        }

        .input-wrapper input:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          z-index: 3;
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #9b9489;
          cursor: pointer;
          transition:
            color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }

        .password-toggle:hover {
          color: #a2781c;
          background: #f8f1e3;
          transform: scale(1.04);
        }

        /* =====================================================
           REMEMBER
        ====================================================== */

        .remember {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #797268;
          font-size: 12px;
          cursor: pointer;
          user-select: none;
        }

        .remember input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .custom-checkbox {
          width: 18px;
          height: 18px;
          display: grid;
          place-items: center;
          border: 1px solid #d7d0c3;
          border-radius: 5px;
          background: #fff;
          transition: all 0.2s ease;
        }

        .custom-checkbox span {
          opacity: 0;
          transform: scale(0.5);
          color: #fff;
          font-size: 11px;
          font-weight: 900;
          transition: all 0.2s ease;
        }

        .remember input:checked + .custom-checkbox {
          border-color: #c69624;
          background: #c69624;
          box-shadow:
            0 4px 10px rgba(198, 150, 36, 0.2);
        }

        .remember
          input:checked
          + .custom-checkbox
          span {
          opacity: 1;
          transform: scale(1);
        }

        /* =====================================================
           PRIMARY BUTTON
        ====================================================== */

        .primary-button {
          position: relative;
          width: 100%;
          height: 55px;
          overflow: hidden;
          border: 0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(
            135deg,
            #c69624,
            #b68318
          );
          color: #fff;
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
          box-shadow:
            0 14px 28px rgba(198, 150, 36, 0.2);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            filter 0.2s ease;
        }

        .primary-button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.03);
          box-shadow:
            0 18px 34px rgba(198, 150, 36, 0.27);
        }

        .primary-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .primary-button:disabled {
          opacity: 0.72;
          cursor: not-allowed;
        }

        .button-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 55%;
          height: 100%;
          transform: skewX(-20deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.18),
            transparent
          );
          animation: buttonShine 4s ease-in-out infinite;
        }

        @keyframes buttonShine {
          0%,
          55% {
            left: -100%;
          }

          75%,
          100% {
            left: 150%;
          }
        }

        .button-arrow {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.14);
          transition: transform 0.2s ease;
        }

        .primary-button:hover .button-arrow {
          transform: translateX(3px);
        }

        .spin {
          animation: spin 0.85s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =====================================================
           BOTTOM
        ====================================================== */

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0 14px;
          color: #aaa399;
          font-size: 10px;
        }

        .divider::before,
        .divider::after {
          content: "";
          height: 1px;
          flex: 1;
          background: #eee9e0;
        }

        .create-account {
          width: 100%;
          height: 47px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px 0 17px;
          border: 1px solid #e9e2d5;
          border-radius: 12px;
          background: #fff;
          color: #4c463c;
          font-size: 12px;
          font-weight: 750;
          text-decoration: none;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }

        .create-account:hover {
          border-color: #d7b765;
          background: #fffdf8;
          transform: translateY(-1px);
        }

        .create-arrow {
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #f7ecd1;
          color: #9a7118;
          transition: transform 0.2s ease;
        }

        .create-account:hover .create-arrow {
          transform: translateX(3px);
        }

        /* =====================================================
           SECURITY
        ====================================================== */

        .security-note {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1px solid #eee9e0;
        }

        .security-icon {
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #f2f7ef;
          color: #62805e;
        }

        .security-note strong {
          display: block;
          margin-bottom: 2px;
          color: #5f594f;
          font-size: 10px;
          font-weight: 800;
        }

        .security-note span {
          display: block;
          color: #a09a90;
          font-size: 10px;
        }

        .login-benefits {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 17px;
        }

        .login-benefits div {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #9a9388;
          font-size: 9px;
        }

        .login-benefits svg {
          color: #9c7928;
        }

        /* =====================================================
           ANIMATIONS
        ====================================================== */

        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(25px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* =====================================================
           TABLET
        ====================================================== */

        @media (max-width: 1020px) {
          .login-wrapper {
            width: min(680px, calc(100% - 34px));
            grid-template-columns: 1fr;
            gap: 0;
            padding: 28px 0;
          }

          .login-showcase {
            display: none;
          }

          .login-section {
            min-height: calc(100vh - 56px);
            align-items: center;
          }

          .login-card {
            width: min(500px, 100%);
          }

          .mobile-brand {
            display: flex;
            justify-content: center;
            margin-bottom: 30px;
          }

          .mobile-brand .brand {
            animation: none;
          }
        }

        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 560px) {
          .login-wrapper {
            width: calc(100% - 20px);
            padding: 10px 0;
          }

          .login-section {
            min-height: calc(100vh - 20px);
          }

          .login-card {
            padding: 28px 20px 23px;
            border-radius: 23px;
          }

          .mobile-brand {
            margin-bottom: 24px;
          }

          .brand-logo {
            width: 41px;
            height: 41px;
            border-radius: 12px;
          }

          .brand-name {
            font-size: 22px;
          }

          .card-header {
            gap: 12px;
            margin-bottom: 24px;
          }

          .welcome-icon {
            width: 44px;
            height: 44px;
            flex-basis: 44px;
            border-radius: 13px;
          }

          .card-header h2 {
            font-size: 27px;
          }

          .card-header p {
            font-size: 11px;
          }

          .small-heading {
            font-size: 8px;
          }

          .input-wrapper input {
            height: 51px;
          }

          .primary-button {
            height: 53px;
          }

          .login-benefits {
            gap: 5px;
          }

          .login-benefits div {
            font-size: 8px;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ====================================================== */

        @media (max-width: 380px) {
          .login-card {
            padding: 24px 16px 20px;
          }

          .card-header h2 {
            font-size: 25px;
          }

          .login-benefits {
            flex-direction: column;
            align-items: flex-start;
          }

          .login-form {
            gap: 17px;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ====================================================== */

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
