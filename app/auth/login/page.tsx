"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  LayoutGrid,
  Loader2,
  LockKeyhole,
  Mail,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
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

  /* =========================================================
     REMEMBERED EMAIL
  ========================================================= */

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

  /* =========================================================
     LOGIN
  ========================================================= */

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

      setSuccess(
        "Login successful! Taking you to PrimeCart..."
      );

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
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="login-header">
        <div className="header-inner">
          <Link href="/" className="brand">
            <div className="brand-mark">
              <span>P</span>
            </div>

            <div className="brand-name">
              Prime<span>Cart</span>
            </div>
          </Link>

          <div className="header-actions">
            <span>New to PrimeCart?</span>

            <Link
              href="/auth/register"
              className="header-register"
            >
              Create account
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <section className="login-main">
        <div className="login-layout">
          {/* =================================================
              LEFT SIDE
          ================================================== */}

          <section className="login-intro">
            <div className="intro-content">
              {/* EYEBROW */}

              <div className="intro-eyebrow">
                <span className="eyebrow-icon">
                  <Sparkles size={13} />
                </span>

                <span>SMARTER SHOPPING</span>
              </div>

              {/* HEADING */}

              <h1>
                Shop smarter.
                <br />
                <span>Choose better.</span>
              </h1>

              <p className="intro-description">
                Discover products, compare choices and
                find better deals — all from one simple
                shopping experience.
              </p>

              {/* FEATURE GRID */}

              <div className="feature-grid">
                {/* PRIMEMATCH */}

                <div className="feature-card featured">
                  <div className="feature-card-top">
                    <div className="feature-icon">
                      <Target size={18} />
                    </div>

                    <span className="feature-arrow">
                      <ArrowRight size={14} />
                    </span>
                  </div>

                  <div className="feature-title">
                    PrimeMatch
                  </div>

                  <p>
                    Find products based on your needs,
                    priorities and budget.
                  </p>

                  <div className="feature-badge">
                    <Sparkles size={11} />
                    Smart shopping
                  </div>
                </div>

                {/* BUDGET */}

                <div className="feature-card">
                  <div className="feature-card-top">
                    <div className="feature-icon">
                      <WalletCards size={18} />
                    </div>

                    <span className="feature-arrow">
                      <ArrowRight size={14} />
                    </span>
                  </div>

                  <div className="feature-title">
                    Budget Builder
                  </div>

                  <p>
                    Plan your shopping around a budget
                    that works for you.
                  </p>

                  <div className="feature-badge neutral">
                    <BadgeCheck size={11} />
                    Plan better
                  </div>
                </div>

                {/* SETUP */}

                <div className="feature-card">
                  <div className="feature-card-top">
                    <div className="feature-icon">
                      <LayoutGrid size={18} />
                    </div>

                    <span className="feature-arrow">
                      <ArrowRight size={14} />
                    </span>
                  </div>

                  <div className="feature-title">
                    Build My Setup
                  </div>

                  <p>
                    Create complete setups for work,
                    college, gaming and more.
                  </p>

                  <div className="feature-badge neutral">
                    <Zap size={11} />
                    Build smarter
                  </div>
                </div>
              </div>

              {/* TRUST POINTS */}

              <div className="trust-points">
                <div className="trust-point">
                  <CheckCircle2 size={15} />
                  <span>Smart Deals</span>
                </div>

                <div className="trust-point">
                  <RotateCcw size={15} />
                  <span>Easy Returns</span>
                </div>

                <div className="trust-point">
                  <ShieldCheck size={15} />
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>

            {/* LEFT FOOTER */}

            <div className="intro-footer">
              <div className="footer-line" />

              <div className="footer-content">
                <span>Smart shopping, simplified.</span>

                <span>© 2026 PrimeCart</span>
              </div>
            </div>
          </section>

          {/* =================================================
              RIGHT SIDE LOGIN
          ================================================== */}

          <section className="login-section">
            <div className="login-card">
              {/* CARD TOP */}

              <div className="card-accent" />

              <div className="card-header">
                <div className="login-icon">
                  <LockKeyhole size={20} />
                </div>

                <div>
                  <div className="account-label">
                    PRIME<span>CART</span> ACCOUNT
                  </div>

                  <h2>Welcome back</h2>

                  <p>
                    Sign in to continue your shopping journey.
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

                  <div className="message-text">
                    <strong>Sign in failed</strong>
                    <span>{error}</span>
                  </div>
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

                  <div className="message-text">
                    <strong>Welcome back</strong>
                    <span>{success}</span>
                  </div>
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

                  <div className="input-wrap">
                    <div className="input-icon">
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
                  <div className="field-header">
                    <label htmlFor="password">
                      Password
                    </label>

                    <Link
                      href="/auth/forgot-password"
                      className="forgot-link"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="input-wrap">
                    <div className="input-icon">
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
                        setShowPassword(
                          (value) => !value
                        )
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

                <label className="remember-row">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked
                      )
                    }
                    disabled={loading}
                  />

                  <span className="custom-checkbox">
                    <span>✓</span>
                  </span>

                  <span>Remember me</span>
                </label>

                {/* BUTTON */}

                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={19}
                        className="spinner"
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

              {/* REGISTER */}

              <div className="register-area">
                <div className="divider">
                  <span>New to PrimeCart?</span>
                </div>

                <Link
                  href="/auth/register"
                  className="create-account"
                >
                  <span>Create your account</span>

                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* SECURITY */}

              <div className="security-note">
                <div className="security-icon">
                  <ShieldCheck size={16} />
                </div>

                <div>
                  <strong>Secure sign in</strong>

                  <span>
                    Your account information is protected.
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* =====================================================
          STYLES
      ====================================================== */}

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
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 8% 18%,
              rgba(212, 175, 55, 0.075),
              transparent 27%
            ),
            radial-gradient(
              circle at 92% 80%,
              rgba(212, 175, 55, 0.065),
              transparent 25%
            ),
            linear-gradient(
              180deg,
              #fffefa 0%,
              #faf8f3 100%
            );
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

        .ambient {
          position: fixed;
          pointer-events: none;
          border-radius: 999px;
          filter: blur(90px);
          z-index: 0;
        }

        .ambient-one {
          width: 300px;
          height: 300px;
          top: -170px;
          left: -100px;
          background: rgba(
            212,
            175,
            55,
            0.09
          );
        }

        .ambient-two {
          width: 350px;
          height: 350px;
          right: -180px;
          bottom: -170px;
          background: rgba(
            199,
            154,
            59,
            0.08
          );
        }

        /* =====================================================
           HEADER
        ====================================================== */

        .login-header {
          position: relative;
          z-index: 5;
          width: 100%;
          border-bottom: 1px solid #ece6da;
          background: rgba(
            255,
            255,
            255,
            0.88
          );
          backdrop-filter: blur(18px);
        }

        .header-inner {
          width: min(
            1320px,
            calc(100% - 56px)
          );
          min-height: 76px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* =====================================================
           BRAND
        ====================================================== */

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #211f1a;
          text-decoration: none;
        }

        .brand-mark {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background:
            linear-gradient(
              145deg,
              #e3c56e,
              #b8861f
            );
          color: white;
          box-shadow:
            0 8px 20px
              rgba(170, 127, 30, 0.18);
        }

        .brand-mark span {
          font-family: Georgia, serif;
          font-size: 19px;
          font-weight: 900;
        }

        .brand-name {
          font-size: 24px;
          font-weight: 850;
          letter-spacing: -1px;
        }

        .brand-name span {
          color: #c5962b;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #8b8479;
          font-size: 11px;
        }

        .header-register {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 36px;
          padding: 0 14px;
          border: 1px solid #dfd5c4;
          border-radius: 9px;
          background: white;
          color: #7e5e19;
          text-decoration: none;
          font-size: 11px;
          font-weight: 750;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .header-register:hover {
          transform: translateY(-1px);
          border-color: #c9a44d;
          background: #fffaf0;
        }

        .header-register:focus-visible {
          outline: 3px solid
            rgba(198, 150, 36, 0.2);
          outline-offset: 3px;
        }

        /* =====================================================
           MAIN
        ====================================================== */

        .login-main {
          position: relative;
          z-index: 1;
          min-height: calc(100vh - 76px);
          min-height: calc(100dvh - 76px);
          padding: 46px 28px 38px;
        }

        .login-layout {
          width: min(
            1260px,
            100%
          );
          min-height: calc(100vh - 160px);
          min-height: calc(100dvh - 160px);
          margin: 0 auto;
          display: grid;
          grid-template-columns:
            minmax(0, 1.08fr)
            minmax(420px, 0.92fr);
          gap: 76px;
          align-items: center;
        }

        /* =====================================================
           LEFT INTRO
        ====================================================== */

        .login-intro {
          min-height: 620px;
          padding: 28px 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          animation: introEnter 0.7s ease both;
        }

        .intro-content {
          max-width: 660px;
        }

        .intro-eyebrow {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 22px;
          padding: 7px 11px;
          border: 1px solid #eadcbf;
          border-radius: 999px;
          background: rgba(
            255,
            255,
            255,
            0.78
          );
          color: #93701e;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1.2px;
        }

        .eyebrow-icon {
          width: 23px;
          height: 23px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #fff4d8;
          color: #b38520;
        }

        .intro-content h1 {
          margin: 0;
          color: #211f1a;
          font-size: clamp(
            48px,
            5.2vw,
            72px
          );
          line-height: 0.98;
          letter-spacing: -4px;
          font-weight: 900;
        }

        .intro-content h1 span {
          color: #bd8e25;
          background:
            linear-gradient(
              100deg,
              #ad7c16,
              #d5ad51,
              #b9851c
            );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .intro-description {
          max-width: 535px;
          margin: 23px 0 29px;
          color: #7e776c;
          font-size: 14px;
          line-height: 1.75;
        }

        /* =====================================================
           FEATURE GRID
        ====================================================== */

        .feature-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 11px;
        }

        .feature-card {
          min-height: 176px;
          padding: 15px;
          border: 1px solid #e8e1d5;
          border-radius: 17px;
          background: rgba(
            255,
            255,
            255,
            0.7
          );
          box-shadow:
            0 7px 24px
              rgba(63, 49, 23, 0.035);
          transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          border-color: #d9c18a;
          background: white;
          box-shadow:
            0 14px 30px
              rgba(63, 49, 23, 0.075);
        }

        .feature-card.featured {
          border-color: #dfc98f;
          background:
            linear-gradient(
              145deg,
              #fffdf7,
              #fff8e7
            );
        }

        .feature-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .feature-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #f7e9c8;
          color: #9f741b;
        }

        .feature-arrow {
          color: #b2a99a;
          transition:
            transform 0.2s ease,
            color 0.2s ease;
        }

        .feature-card:hover .feature-arrow {
          transform: translateX(3px);
          color: #a3781e;
        }

        .feature-title {
          color: #37332b;
          font-size: 12px;
          font-weight: 850;
        }

        .feature-card p {
          min-height: 49px;
          margin: 6px 0 12px;
          color: #8a8276;
          font-size: 9px;
          line-height: 1.55;
        }

        .feature-badge {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 7px;
          border-radius: 7px;
          background: #f4e4b8;
          color: #866117;
          font-size: 8px;
          font-weight: 750;
        }

        .feature-badge.neutral {
          background: #f4f1eb;
          color: #8b8377;
        }

        /* =====================================================
           TRUST POINTS
        ====================================================== */

        .trust-points {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-top: 27px;
        }

        .trust-point {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #777064;
          font-size: 10px;
          font-weight: 650;
        }

        .trust-point svg {
          color: #bd8e28;
        }

        /* =====================================================
           INTRO FOOTER
        ====================================================== */

        .intro-footer {
          max-width: 650px;
          margin-top: 35px;
        }

        .footer-line {
          width: 100%;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              #ded5c5,
              transparent
            );
        }

        .footer-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
          color: #aaa195;
          font-size: 9px;
        }

        /* =====================================================
           RIGHT LOGIN
        ====================================================== */

        .login-section {
          display: flex;
          justify-content: center;
          animation: cardEnter 0.7s 0.08s ease both;
        }

        .login-card {
          position: relative;
          width: min(470px, 100%);
          padding: 37px 38px 31px;
          border: 1px solid #e3dccf;
          border-radius: 25px;
          background: rgba(
            255,
            255,
            255,
            0.96
          );
          box-shadow:
            0 30px 75px
              rgba(55, 43, 22, 0.095),
            0 6px 20px
              rgba(55, 43, 22, 0.035);
          backdrop-filter: blur(16px);
        }

        .card-accent {
          position: absolute;
          top: 0;
          left: 14%;
          right: 14%;
          height: 3px;
          border-radius: 0 0 999px 999px;
          background:
            linear-gradient(
              90deg,
              transparent,
              #c69a3c,
              #dfc16e,
              #c69a3c,
              transparent
            );
        }

        /* =====================================================
           CARD HEADER
        ====================================================== */

        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          margin-bottom: 27px;
        }

        .login-icon {
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          display: grid;
          place-items: center;
          border: 1px solid #edddba;
          border-radius: 13px;
          background: #fff8e8;
          color: #a97c20;
        }

        .account-label {
          margin-bottom: 5px;
          color: #a47a20;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 1.5px;
        }

        .account-label span {
          color: #c39737;
        }

        .card-header h2 {
          margin: 0;
          color: #27241e;
          font-size: 27px;
          line-height: 1.15;
          letter-spacing: -0.8px;
          font-weight: 850;
        }

        .card-header p {
          margin: 6px 0 0;
          color: #8c857a;
          font-size: 10px;
          line-height: 1.5;
        }

        /* =====================================================
           MESSAGES
        ====================================================== */

        .message {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 18px;
          padding: 10px 11px;
          border-radius: 11px;
          animation: messageIn 0.25s ease both;
        }

        .error-message {
          border: 1px solid #efd1cf;
          background: #fff7f6;
          color: #a3443f;
        }

        .success-message {
          border: 1px solid #d3e7d7;
          background: #f5fbf6;
          color: #347246;
        }

        .message-icon {
          width: 28px;
          height: 28px;
          flex: 0 0 28px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: rgba(
            255,
            255,
            255,
            0.8
          );
        }

        .message-text {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .message-text strong {
          font-size: 10px;
          font-weight: 800;
        }

        .message-text span {
          font-size: 9px;
          line-height: 1.45;
        }

        /* =====================================================
           FORM
        ====================================================== */

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .field label {
          color: #484238;
          font-size: 10px;
          font-weight: 800;
        }

        .forgot-link {
          color: #a2771d;
          font-size: 9px;
          font-weight: 750;
          text-decoration: none;
        }

        .forgot-link:hover {
          color: #765711;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .forgot-link:focus-visible {
          outline: 2px solid
            rgba(190, 143, 37, 0.3);
          outline-offset: 3px;
          border-radius: 3px;
        }

        /* =====================================================
           INPUTS
        ====================================================== */

        .input-wrap {
          position: relative;
          width: 100%;
          height: 51px;
          display: flex;
          align-items: center;
          border: 1px solid #ddd6ca;
          border-radius: 12px;
          background: white;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .input-wrap:hover {
          border-color: #cec4b4;
        }

        .input-wrap:focus-within {
          border-color: #c39737;
          box-shadow:
            0 0 0 3px
              rgba(195, 151, 55, 0.11),
            0 7px 20px
              rgba(70, 53, 22, 0.045);
          transform: translateY(-1px);
        }

        .input-icon {
          width: 45px;
          height: 100%;
          flex: 0 0 45px;
          display: grid;
          place-items: center;
          color: #a59c8e;
          transition: color 0.2s ease;
        }

        .input-wrap:focus-within
          .input-icon {
          color: #a77b1e;
        }

        .input-wrap input {
          min-width: 0;
          flex: 1;
          height: 100%;
          padding: 0 11px 0 0;
          border: 0;
          outline: 0;
          color: #2a271f;
          background: transparent;
          font-size: 11px;
        }

        .input-wrap input::placeholder {
          color: #aaa297;
        }

        .input-wrap input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* =====================================================
           PASSWORD
        ====================================================== */

        .password-toggle {
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          margin-right: 3px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #8f877b;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .password-toggle:hover {
          background: #fff7e5;
          color: #9d731b;
        }

        .password-toggle:focus-visible {
          outline: 2px solid
            rgba(194, 148, 43, 0.35);
          outline-offset: -2px;
        }

        .password-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* =====================================================
           REMEMBER
        ====================================================== */

        .remember-row {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #797268;
          font-size: 9px;
          font-weight: 650;
          cursor: pointer;
          user-select: none;
        }

        .remember-row input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .custom-checkbox {
          width: 17px;
          height: 17px;
          display: grid;
          place-items: center;
          border: 1px solid #d0c7b8;
          border-radius: 5px;
          background: white;
          color: white;
          transition:
            background 0.18s ease,
            border-color 0.18s ease;
        }

        .custom-checkbox span {
          opacity: 0;
          transform: scale(0.6);
          font-size: 10px;
          font-weight: 900;
          transition:
            opacity 0.15s ease,
            transform 0.15s ease;
        }

        .remember-row input:checked
          + .custom-checkbox {
          border-color: #bd9030;
          background: #bd9030;
        }

        .remember-row input:checked
          + .custom-checkbox span {
          opacity: 1;
          transform: scale(1);
        }

        .remember-row input:focus-visible
          + .custom-checkbox {
          outline: 3px solid
            rgba(194, 148, 43, 0.2);
          outline-offset: 2px;
        }

        /* =====================================================
           LOGIN BUTTON
        ====================================================== */

        .login-button {
          position: relative;
          width: 100%;
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          overflow: hidden;
          border: 1px solid #b78529;
          border-radius: 12px;
          background:
            linear-gradient(
              135deg,
              #cca247,
              #b98629
            );
          color: white;
          cursor: pointer;
          font-size: 11px;
          font-weight: 850;
          box-shadow:
            0 10px 23px
              rgba(166, 122, 28, 0.2);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            filter 0.2s ease;
        }

        .login-button::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: -120%;
          width: 65%;
          transform: skewX(-20deg);
          background: rgba(
            255,
            255,
            255,
            0.18
          );
          transition: left 0.6s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 14px 28px
              rgba(166, 122, 28, 0.25);
          filter: saturate(1.04);
        }

        .login-button:hover:not(:disabled)::before {
          left: 130%;
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:focus-visible {
          outline: 3px solid
            rgba(195, 151, 54, 0.22);
          outline-offset: 3px;
        }

        .login-button:disabled {
          opacity: 0.72;
          cursor: not-allowed;
          box-shadow: none;
        }

        .button-arrow {
          position: relative;
          z-index: 1;
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: rgba(
            255,
            255,
            255,
            0.17
          );
        }

        .login-button > span:first-child {
          position: relative;
          z-index: 1;
        }

        .spinner {
          animation: spin 0.9s linear infinite;
        }

        /* =====================================================
           REGISTER
        ====================================================== */

        .register-area {
          margin-top: 23px;
        }

        .divider {
          position: relative;
          display: flex;
          justify-content: center;
          margin-bottom: 13px;
        }

        .divider::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #eee8dc;
        }

        .divider span {
          position: relative;
          padding: 0 10px;
          background: white;
          color: #aaa196;
          font-size: 8px;
        }

        .create-account {
          min-height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px solid #e0d8ca;
          border-radius: 11px;
          background: white;
          color: #534c41;
          text-decoration: none;
          font-size: 10px;
          font-weight: 780;
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;
        }

        .create-account:hover {
          transform: translateY(-1px);
          border-color: #cdae60;
          background: #fffaf0;
          color: #8a6519;
        }

        .create-account:focus-visible {
          outline: 3px solid
            rgba(195, 151, 54, 0.2);
          outline-offset: 3px;
        }

        /* =====================================================
           SECURITY
        ====================================================== */

        .security-note {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 16px;
          padding: 10px 11px;
          border: 1px solid #eee7da;
          border-radius: 10px;
          background: #fcfaf6;
        }

        .security-icon {
          width: 28px;
          height: 28px;
          flex: 0 0 28px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #f3e7c9;
          color: #98701a;
        }

        .security-note strong,
        .security-note span {
          display: block;
        }

        .security-note strong {
          margin-bottom: 2px;
          color: #595248;
          font-size: 9px;
          font-weight: 800;
        }

        .security-note span {
          color: #989085;
          font-size: 8px;
          line-height: 1.4;
        }

        /* =====================================================
           ANIMATIONS
        ====================================================== */

        @keyframes introEnter {
          from {
            opacity: 0;
            transform: translateX(-12px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform:
              translateY(14px)
              scale(0.985);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        @keyframes messageIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =====================================================
           TABLET
        ====================================================== */

        @media (max-width: 1050px) {
          .header-inner {
            width: min(
              100% - 40px,
              900px
            );
          }

          .login-main {
            padding: 35px 20px;
          }

          .login-layout {
            grid-template-columns:
              minmax(0, 1fr)
              minmax(370px, 430px);
            gap: 42px;
          }

          .login-intro {
            min-height: 590px;
          }

          .intro-content h1 {
            font-size: clamp(
              42px,
              5vw,
              58px
            );
            letter-spacing: -3px;
          }

          .feature-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .feature-card:last-child {
            grid-column: span 2;
            min-height: 135px;
          }
        }

        /* =====================================================
           TABLET / MOBILE
        ====================================================== */

        @media (max-width: 820px) {
          .login-main {
            padding: 25px 16px 30px;
          }

          .login-layout {
            width: min(560px, 100%);
            min-height: auto;
            grid-template-columns: 1fr;
            gap: 25px;
          }

          .login-intro {
            min-height: auto;
            padding: 5px 0;
          }

          .intro-content {
            max-width: none;
          }

          .intro-content h1 {
            font-size: 48px;
          }

          .intro-description {
            max-width: 540px;
          }

          .feature-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .feature-card:last-child {
            grid-column: auto;
            min-height: 176px;
          }

          .intro-footer {
            display: none;
          }

          .login-section {
            width: 100%;
          }

          .login-card {
            width: min(500px, 100%);
          }
        }

        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 560px) {
          .header-inner {
            width: calc(100% - 24px);
            min-height: 64px;
          }

          .brand-mark {
            width: 35px;
            height: 35px;
            border-radius: 10px;
          }

          .brand-mark span {
            font-size: 17px;
          }

          .brand-name {
            font-size: 21px;
          }

          .header-actions > span {
            display: none;
          }

          .header-register {
            min-height: 34px;
            padding: 0 10px;
            font-size: 9px;
          }

          .login-main {
            min-height: calc(100dvh - 64px);
            padding: 20px 10px 24px;
          }

          .login-layout {
            gap: 18px;
          }

          /* LEFT COMPACT */

          .login-intro {
            padding: 0 3px;
          }

          .intro-eyebrow {
            margin-bottom: 13px;
            padding: 6px 9px;
            font-size: 8px;
            letter-spacing: 1px;
          }

          .eyebrow-icon {
            width: 20px;
            height: 20px;
          }

          .intro-content h1 {
            font-size: 38px;
            line-height: 1;
            letter-spacing: -2.5px;
          }

          .intro-description {
            margin: 12px 0 16px;
            font-size: 10px;
            line-height: 1.6;
          }

          .feature-grid {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding: 2px 2px 6px;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .feature-grid::-webkit-scrollbar {
            display: none;
          }

          .feature-card {
            width: 145px;
            min-width: 145px;
            min-height: 118px;
            padding: 11px;
            border-radius: 13px;
          }

          .feature-card:last-child {
            min-height: 118px;
          }

          .feature-card-top {
            margin-bottom: 9px;
          }

          .feature-icon {
            width: 29px;
            height: 29px;
            border-radius: 8px;
          }

          .feature-arrow {
            font-size: 11px;
          }

          .feature-title {
            font-size: 10px;
          }

          .feature-card p {
            min-height: 38px;
            margin: 4px 0 8px;
            font-size: 7.5px;
            line-height: 1.45;
          }

          .feature-badge {
            padding: 4px 5px;
            font-size: 6.5px;
          }

          .trust-points {
            gap: 11px;
            margin-top: 13px;
            flex-wrap: wrap;
          }

          .trust-point {
            gap: 4px;
            font-size: 7.5px;
          }

          .trust-point svg {
            width: 12px;
            height: 12px;
          }

          /* LOGIN */

          .login-card {
            padding: 28px 18px 23px;
            border-radius: 19px;
          }

          .card-accent {
            left: 20%;
            right: 20%;
          }

          .card-header {
            gap: 10px;
            margin-bottom: 22px;
          }

          .login-icon {
            width: 37px;
            height: 37px;
            flex-basis: 37px;
            border-radius: 11px;
          }

          .account-label {
            font-size: 7px;
            letter-spacing: 1.2px;
          }

          .card-header h2 {
            font-size: 23px;
          }

          .card-header p {
            max-width: 245px;
            font-size: 9px;
          }

          .message {
            margin-bottom: 14px;
            padding: 9px;
          }

          .login-form {
            gap: 15px;
          }

          .field {
            gap: 6px;
          }

          .field label {
            font-size: 9px;
          }

          .forgot-link {
            font-size: 8px;
          }

          .input-wrap {
            height: 48px;
            border-radius: 10px;
          }

          .input-icon {
            width: 42px;
            flex-basis: 42px;
          }

          .input-wrap input {
            font-size: 10px;
          }

          .password-toggle {
            width: 42px;
            flex-basis: 42px;
          }

          .remember-row {
            font-size: 8px;
          }

          .custom-checkbox {
            width: 16px;
            height: 16px;
          }

          .login-button {
            min-height: 49px;
            border-radius: 10px;
            font-size: 10px;
          }

          .register-area {
            margin-top: 19px;
          }

          .create-account {
            min-height: 43px;
            font-size: 9px;
          }

          .security-note {
            margin-top: 13px;
            padding: 9px;
          }

          .security-note strong {
            font-size: 8px;
          }

          .security-note span {
            font-size: 7px;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ====================================================== */

        @media (max-width: 380px) {
          .intro-content h1 {
            font-size: 34px;
          }

          .feature-card {
            width: 135px;
            min-width: 135px;
          }

          .login-card {
            padding: 25px 15px 20px;
          }

          .card-header h2 {
            font-size: 21px;
          }

          .header-register {
            padding: 0 8px;
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
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}
