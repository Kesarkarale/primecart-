"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
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

  /* =========================================================
     EXISTING REMEMBER-ME LOGIC
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
     EXISTING LOGIN LOGIC — KEPT INTACT
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
          DECORATIVE BACKGROUND
      ===================================================== */}

      <div className="background-grid" />
      <div className="ambient ambient-top" />
      <div className="ambient ambient-bottom" />

      <div className="login-container">
        {/* ===================================================
            LEFT PREMIUM SHOWCASE
        =================================================== */}

        <section className="showcase">
          <div className="showcase-inner">
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

            {/* HERO COPY */}

            <div className="showcase-copy">
              <div className="showcase-badge">
                <Sparkles size={13} />
                <span>THE SMARTER WAY TO SHOP</span>
              </div>

              <h1>
                Everything you need.
                <br />
                <span>All in one place.</span>
              </h1>

              <p>
                Discover products you love, find smarter
                deals and enjoy a shopping experience designed
                around you.
              </p>
            </div>

            {/* =================================================
                PREMIUM PRODUCT VISUAL
            ================================================= */}

            <div className="product-stage">
              {/* Decorative circles */}

              <div className="stage-glow" />
              <div className="stage-ring ring-one" />
              <div className="stage-ring ring-two" />

              {/* Main product card */}

              <div className="product-main-card">
                <div className="product-image-wrap">
                  <Image
                    src="/hero-product.png"
                    alt="PrimeCart featured products"
                    fill
                    sizes="(max-width: 1050px) 70vw, 420px"
                    className="product-image"
                    priority
                  />
                </div>

                <div className="product-info">
                  <div>
                    <span>PRIMECART PICKS</span>
                    <strong>Curated for you</strong>
                  </div>

                  <div className="product-rating">
                    <Star
                      size={11}
                      fill="currentColor"
                    />
                    <span>4.8</span>
                  </div>
                </div>
              </div>

              {/* Floating mini card */}

              <div className="floating-card floating-deal">
                <div className="floating-icon">
                  <Zap size={15} />
                </div>

                <div>
                  <span>SMART DEAL</span>
                  <strong>Great value</strong>
                </div>
              </div>

              {/* Floating secure card */}

              <div className="floating-card floating-secure">
                <div className="floating-icon secure">
                  <ShieldCheck size={15} />
                </div>

                <div>
                  <span>SHOP SECURE</span>
                  <strong>Protected</strong>
                </div>
              </div>
            </div>

            {/* TRUST FEATURES */}

            <div className="showcase-features">
              <div className="showcase-feature">
                <div className="feature-icon">
                  <Zap size={16} />
                </div>

                <div>
                  <strong>Smart deals</strong>
                  <span>Value that makes sense</span>
                </div>
              </div>

              <div className="feature-divider" />

              <div className="showcase-feature">
                <div className="feature-icon">
                  <Truck size={16} />
                </div>

                <div>
                  <strong>Easy shopping</strong>
                  <span>Simple from start to finish</span>
                </div>
              </div>

              <div className="feature-divider" />

              <div className="showcase-feature">
                <div className="feature-icon">
                  <ShieldCheck size={16} />
                </div>

                <div>
                  <strong>Secure experience</strong>
                  <span>Shopping with confidence</span>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="showcase-footer">
              <span>© 2026 PrimeCart</span>

              <div className="footer-links">
                <span>Secure</span>
                <i>•</i>
                <span>Simple</span>
                <i>•</i>
                <span>Smart</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            RIGHT LOGIN
        =================================================== */}

        <section className="login-section">
          <div className="login-card">
            <div className="card-top-line" />

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

            {/* LOGIN HEADING */}

            <div className="login-heading">
              <div className="login-heading-icon">
                <LockKeyhole size={20} />
              </div>

              <div>
                <span className="heading-label">
                  PRIME CART ACCOUNT
                </span>

                <h2>Welcome back</h2>

                <p>
                  Sign in to continue your shopping journey.
                </p>
              </div>
            </div>

            {/* =================================================
                EXISTING ERROR — POLISHED UI
            ================================================= */}

            {error && (
              <div
                className="status-message error"
                role="alert"
              >
                <div className="status-icon">
                  <AlertCircle size={17} />
                </div>

                <div className="status-content">
                  <strong>Unable to sign in</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* =================================================
                EXISTING SUCCESS — POLISHED UI
            ================================================= */}

            {success && (
              <div
                className="status-message success"
                role="status"
              >
                <div className="status-icon">
                  <CheckCircle2 size={17} />
                </div>

                <div className="status-content">
                  <strong>Welcome back!</strong>
                  <span>{success}</span>
                </div>
              </div>
            )}

            {/* =================================================
                LOGIN FORM
            ================================================= */}

            <form
              onSubmit={handleLogin}
              className="login-form"
            >
              {/* EMAIL */}

              <div className="form-group">
                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-box">
                  <div className="input-icon">
                    <Mail size={17} />
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

              <div className="form-group">
                <div className="password-header">
                  <label htmlFor="password">
                    Password
                  </label>

                  <Link href="/auth/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <div className="input-box password-box">
                  <div className="input-icon">
                    <LockKeyhole size={17} />
                  </div>

                  <input
                    id="password"
                    type={
                      showPassword ? "text" : "password"
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

                  {/* Refined touch-friendly eye button */}

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

              {/* REMEMBER ME */}

              <label className="remember-row">
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
                className="login-button"
                disabled={loading}
              >
                <span className="button-content">
                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="loading-spinner"
                      />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in to PrimeCart</span>

                      <span className="button-arrow">
                        <ArrowRight size={17} />
                      </span>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* REGISTER */}

            <div className="register-area">
              <div className="register-divider">
                <span>New to PrimeCart?</span>
              </div>

              <Link
                href="/auth/register"
                className="register-button"
              >
                <span>Create your account</span>

                <span className="register-arrow">
                  <ArrowRight size={15} />
                </span>
              </Link>
            </div>

            {/* SECURITY */}

            <div className="security-panel">
              <div className="security-icon">
                <ShieldCheck size={16} />
              </div>

              <div className="security-copy">
                <strong>Secure sign in</strong>
                <span>
                  Your account information is protected.
                </span>
              </div>

              <div className="secure-status">
                <span />
                Secure
              </div>
            </div>

            {/* BOTTOM BENEFITS */}

            <div className="login-benefits">
              <span>
                <CheckCircle2 size={12} />
                Easy returns
              </span>

              <span>
                <CheckCircle2 size={12} />
                Secure checkout
              </span>

              <span>
                <CheckCircle2 size={12} />
                Smart deals
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          PREMIUM UI / CSS ONLY
      ===================================================== */}

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
        ===================================================== */

        .login-page {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          overflow-x: hidden;
          color: #24211b;
          background:
            radial-gradient(
              circle at 82% 8%,
              rgba(212, 175, 55, 0.12),
              transparent 24%
            ),
            radial-gradient(
              circle at 8% 90%,
              rgba(212, 175, 55, 0.07),
              transparent 26%
            ),
            #faf8f3;
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
           BACKGROUND
        ===================================================== */

        .background-grid {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.4;
          background-image:
            linear-gradient(
              rgba(184, 142, 44, 0.026) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(184, 142, 44, 0.026) 1px,
              transparent 1px
            );
          background-size: 46px 46px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 92%
          );
        }

        .ambient {
          position: fixed;
          z-index: 0;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(100px);
        }

        .ambient-top {
          width: 370px;
          height: 370px;
          top: -220px;
          right: -100px;
          background: rgba(212, 175, 55, 0.12);
        }

        .ambient-bottom {
          width: 400px;
          height: 400px;
          bottom: -250px;
          left: -180px;
          background: rgba(212, 175, 55, 0.07);
        }

        /* =====================================================
           MAIN LAYOUT
        ===================================================== */

        .login-container {
          position: relative;
          z-index: 1;
          width: min(1280px, calc(100% - 64px));
          min-height: 100vh;
          min-height: 100dvh;
          margin: 0 auto;
          padding: 32px 0;
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(410px, 475px);
          gap: 68px;
          align-items: center;
        }

        /* =====================================================
           BRAND
        ===================================================== */

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          width: fit-content;
          color: #24211b;
          text-decoration: none;
        }

        .brand-logo {
          width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 1px solid #e6decd;
          border-radius: 13px;
          background: #ffffff;
          box-shadow:
            0 8px 24px rgba(67, 50, 17, 0.07);
        }

        .brand-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .brand-name {
          font-size: 24px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .brand-name span {
          color: #c69624;
        }

        /* =====================================================
           SHOWCASE
        ===================================================== */

        .showcase {
          min-height: 650px;
          display: flex;
          align-items: center;
        }

        .showcase-inner {
          width: 100%;
          min-height: 610px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .showcase-copy {
          max-width: 620px;
          margin-top: 22px;
        }

        .showcase-badge {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 12px 7px 10px;
          margin-bottom: 19px;
          border: 1px solid #e8ddc6;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.72);
          color: #957326;
          font-size: 8px;
          letter-spacing: 1.25px;
          font-weight: 900;
        }

        .showcase-copy h1 {
          margin: 0;
          color: #24211b;
          font-size: clamp(46px, 5vw, 70px);
          line-height: 0.98;
          letter-spacing: -4px;
          font-weight: 900;
        }

        .showcase-copy h1 span {
          color: #c69624;
        }

        .showcase-copy p {
          max-width: 540px;
          margin: 22px 0 0;
          color: #7f786e;
          font-size: 13px;
          line-height: 1.8;
        }

        /* =====================================================
           PRODUCT STAGE
        ===================================================== */

        .product-stage {
          position: relative;
          width: min(620px, 100%);
          height: 255px;
          margin-top: 10px;
        }

        .stage-glow {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 320px;
          height: 180px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: rgba(213, 174, 74, 0.1);
          filter: blur(55px);
        }

        .stage-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          border: 1px solid rgba(198, 150, 36, 0.11);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .ring-one {
          width: 410px;
          height: 220px;
        }

        .ring-two {
          width: 300px;
          height: 160px;
        }

        .product-main-card {
          position: absolute;
          left: 50%;
          top: 50%;
          width: min(430px, 70%);
          height: 225px;
          transform: translate(-50%, -50%);
          overflow: hidden;
          border: 1px solid #e7ddca;
          border-radius: 24px;
          background:
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.98),
              rgba(255, 252, 245, 0.96)
            );
          box-shadow:
            0 25px 55px rgba(64, 47, 16, 0.1),
            0 4px 15px rgba(64, 47, 16, 0.04);
          animation: productFloat 5s ease-in-out infinite;
        }

        .product-image-wrap {
          position: absolute;
          inset: 0;
        }

        .product-image {
          object-fit: contain;
          object-position: center;
          padding: 7px 22px 40px;
          transform: scale(1.02);
        }

        .product-info {
          position: absolute;
          left: 15px;
          right: 15px;
          bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 11px;
          border: 1px solid rgba(226, 215, 192, 0.8);
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(12px);
        }

        .product-info div:first-child {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .product-info span {
          color: #a78a50;
          font-size: 6px;
          letter-spacing: 1px;
          font-weight: 900;
        }

        .product-info strong {
          color: #4a4439;
          font-size: 9px;
          font-weight: 850;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          color: #a47b1f;
          font-size: 8px;
          font-weight: 800;
        }

        .floating-card {
          position: absolute;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 11px;
          border: 1px solid #e7ddca;
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow:
            0 15px 35px rgba(64, 47, 16, 0.09);
          backdrop-filter: blur(12px);
        }

        .floating-deal {
          left: 2%;
          top: 16%;
          animation: floatingOne 4.5s ease-in-out infinite;
        }

        .floating-secure {
          right: 2%;
          bottom: 13%;
          animation: floatingTwo 5s ease-in-out infinite;
        }

        .floating-icon {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #f8ecd0;
          color: #a0781e;
        }

        .floating-icon.secure {
          background: #eef6e9;
          color: #5f7f58;
        }

        .floating-card div:last-child {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .floating-card span {
          color: #a18d66;
          font-size: 6px;
          letter-spacing: 0.8px;
          font-weight: 900;
        }

        .floating-card strong {
          color: #484238;
          font-size: 8px;
          font-weight: 850;
        }

        @keyframes productFloat {
          0%,
          100% {
            transform: translate(-50%, -50%);
          }

          50% {
            transform: translate(-50%, calc(-50% - 5px));
          }
        }

        @keyframes floatingOne {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes floatingTwo {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(6px);
          }
        }

        /* =====================================================
           SHOWCASE FEATURES
        ===================================================== */

        .showcase-features {
          width: min(600px, 100%);
          display: flex;
          align-items: center;
          gap: 17px;
          padding-top: 16px;
          border-top: 1px solid #e7dfd2;
        }

        .showcase-feature {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .feature-icon {
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #f8edd3;
          color: #99741f;
        }

        .showcase-feature div:last-child {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .showcase-feature strong {
          color: #464037;
          font-size: 8px;
          font-weight: 850;
        }

        .showcase-feature span {
          color: #a09a90;
          font-size: 7px;
          white-space: nowrap;
        }

        .feature-divider {
          width: 1px;
          height: 28px;
          background: #ddd5c7;
        }

        .showcase-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: min(600px, 100%);
          color: #aaa298;
          font-size: 8px;
        }

        .footer-links {
          display: flex;
          gap: 7px;
        }

        .footer-links i {
          color: #cfaa58;
          font-style: normal;
        }

        /* =====================================================
           LOGIN SECTION
        ===================================================== */

        .login-section {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .login-card {
          position: relative;
          width: 100%;
          padding: 38px;
          overflow: hidden;
          border: 1px solid #e5ddcf;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.97);
          box-shadow:
            0 35px 80px rgba(59, 45, 17, 0.09),
            0 7px 22px rgba(59, 45, 17, 0.035);
          backdrop-filter: blur(18px);
          animation: cardEntrance 0.65s cubic-bezier(
              0.22,
              1,
              0.36,
              1
            )
            both;
        }

        .login-card::after {
          content: "";
          position: absolute;
          width: 230px;
          height: 230px;
          right: -130px;
          top: -130px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.055);
          filter: blur(35px);
          pointer-events: none;
        }

        .card-top-line {
          position: absolute;
          left: 13%;
          right: 13%;
          top: 0;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            transparent,
            #d4af37,
            #b8861c,
            transparent
          );
        }

        @keyframes cardEntrance {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .mobile-brand {
          display: none;
        }

        /* =====================================================
           LOGIN HEADING
        ===================================================== */

        .login-heading {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 13px;
          margin-bottom: 24px;
        }

        .login-heading-icon {
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          display: grid;
          place-items: center;
          border: 1px solid #eadfc7;
          border-radius: 14px;
          background: linear-gradient(
            145deg,
            #fffaf0,
            #f4e7c4
          );
          color: #96701a;
        }

        .heading-label {
          display: block;
          margin-bottom: 4px;
          color: #b18a39;
          font-size: 7px;
          letter-spacing: 1.65px;
          font-weight: 900;
        }

        .login-heading h2 {
          margin: 0;
          color: #25221c;
          font-size: 29px;
          line-height: 1.05;
          letter-spacing: -1.3px;
          font-weight: 900;
        }

        .login-heading p {
          margin: 6px 0 0;
          color: #8b8479;
          font-size: 10px;
          line-height: 1.5;
        }

        /* =====================================================
           ERROR / SUCCESS
        ===================================================== */

        .status-message {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-bottom: 15px;
          padding: 11px 12px;
          border-radius: 11px;
          animation: statusIn 0.25s ease both;
        }

        .status-icon {
          width: 26px;
          height: 26px;
          flex: 0 0 26px;
          display: grid;
          place-items: center;
          border-radius: 8px;
        }

        .status-content {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .status-content strong {
          font-size: 9px;
          font-weight: 850;
        }

        .status-content span {
          font-size: 9px;
          line-height: 1.45;
        }

        .status-message.error {
          border: 1px solid #efd6d2;
          background: #fff5f4;
          color: #994943;
        }

        .status-message.error .status-icon {
          background: #fbe3e0;
        }

        .status-message.success {
          border: 1px solid #d5e8d0;
          background: #f4faf1;
          color: #567651;
        }

        .status-message.success .status-icon {
          background: #e2f1dc;
        }

        @keyframes statusIn {
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
        ===================================================== */

        .login-form {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .form-group label {
          color: #39342c;
          font-size: 10px;
          font-weight: 850;
        }

        .password-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .password-header a {
          color: #a2771e;
          font-size: 9px;
          font-weight: 800;
          text-decoration: none;
        }

        .password-header a:hover {
          color: #76570f;
        }

        /* =====================================================
           INPUT
        ===================================================== */

        .input-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-box::after {
          content: "";
          position: absolute;
          left: 13px;
          right: 13px;
          bottom: 0;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            #b8861b,
            #e0bd68
          );
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.25s ease;
          pointer-events: none;
        }

        .input-box:focus-within::after {
          transform: scaleX(1);
        }

        .input-icon {
          position: absolute;
          left: 14px;
          z-index: 2;
          display: grid;
          place-items: center;
          color: #aaa298;
          pointer-events: none;
          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .input-box:focus-within .input-icon {
          color: #b3831c;
          transform: scale(1.05);
        }

        .input-box input {
          width: 100%;
          height: 51px;
          padding: 0 45px;
          border: 1px solid #e3ddd3;
          border-radius: 12px;
          outline: none;
          background: #fff;
          color: #2d2922;
          font-size: 11px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .input-box input:hover:not(:disabled) {
          border-color: #d5c9b7;
        }

        .input-box input:focus {
          border-color: #d0a03c;
          background: #fffefa;
          box-shadow:
            0 0 0 4px rgba(208, 160, 60, 0.075),
            0 7px 18px rgba(74, 57, 24, 0.025);
        }

        .input-box input::placeholder {
          color: #b6afa5;
        }

        .input-box input:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* =====================================================
           PASSWORD TOGGLE
        ===================================================== */

        .password-toggle {
          position: absolute;
          right: 7px;
          z-index: 3;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #969087;
          cursor: pointer;
          transition:
            color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }

        .password-toggle:hover {
          color: #9a711b;
          background: #f8f1e3;
        }

        .password-toggle:active {
          transform: scale(0.94);
        }

        /* =====================================================
           REMEMBER
        ===================================================== */

        .remember-row {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          color: #817a70;
          font-size: 10px;
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
          border: 1px solid #d5cec2;
          border-radius: 5px;
          background: #fff;
        }

        .custom-checkbox span {
          opacity: 0;
          color: #fff;
          font-size: 10px;
          font-weight: 900;
          transform: scale(0.5);
          transition: 0.18s ease;
        }

        .remember-row
          input:checked
          + .custom-checkbox {
          border-color: #c69624;
          background: #c69624;
          box-shadow:
            0 4px 10px rgba(198, 150, 36, 0.2);
        }

        .remember-row
          input:checked
          + .custom-checkbox
          span {
          opacity: 1;
          transform: scale(1);
        }

        /* =====================================================
           LOGIN BUTTON
        ===================================================== */

        .login-button {
          position: relative;
          width: 100%;
          height: 52px;
          overflow: hidden;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            #c99a2d,
            #b58018
          );
          color: #fff;
          cursor: pointer;
          box-shadow:
            0 13px 27px rgba(190, 140, 31, 0.21);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            filter 0.2s ease;
        }

        .login-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -90%;
          width: 55%;
          height: 100%;
          transform: skewX(-20deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.18),
            transparent
          );
          transition: left 0.7s ease;
        }

        .login-button:hover:not(:disabled)::before {
          left: 140%;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.035);
          box-shadow:
            0 17px 32px rgba(190, 140, 31, 0.28);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.72;
          cursor: not-allowed;
        }

        .button-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          font-size: 11px;
          font-weight: 850;
        }

        .button-arrow {
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.14);
          transition: transform 0.2s ease;
        }

        .login-button:hover .button-arrow {
          transform: translateX(3px);
        }

        .loading-spinner {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =====================================================
           REGISTER
        ===================================================== */

        .register-area {
          position: relative;
          z-index: 2;
          margin-top: 20px;
        }

        .register-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 11px;
          color: #aaa399;
          font-size: 8px;
        }

        .register-divider::before,
        .register-divider::after {
          content: "";
          height: 1px;
          flex: 1;
          background: #eee8df;
        }

        .register-button {
          width: 100%;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px 0 15px;
          border: 1px solid #e6dfd4;
          border-radius: 11px;
          background: #fff;
          color: #514b41;
          font-size: 10px;
          font-weight: 800;
          text-decoration: none;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .register-button:hover {
          transform: translateY(-1px);
          border-color: #d8ba6e;
          background: #fffdf8;
        }

        .register-arrow {
          width: 25px;
          height: 25px;
          display: grid;
          place-items: center;
          border-radius: 7px;
          background: #f7ecd1;
          color: #99721b;
        }

        /* =====================================================
           SECURITY
        ===================================================== */

        .security-panel {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 16px;
          padding: 11px;
          border: 1px solid #e3eadd;
          border-radius: 11px;
          background: #fbfdf9;
        }

        .security-icon {
          width: 29px;
          height: 29px;
          flex: 0 0 29px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #edf5e9;
          color: #5f8058;
        }

        .security-copy {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .security-copy strong {
          color: #596354;
          font-size: 8px;
          font-weight: 850;
        }

        .security-copy span {
          color: #989d94;
          font-size: 8px;
        }

        .secure-status {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #64825d;
          font-size: 7px;
          font-weight: 850;
        }

        .secure-status span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #72a467;
          box-shadow:
            0 0 0 3px rgba(114, 164, 103, 0.1);
        }

        /* =====================================================
           BENEFITS
        ===================================================== */

        .login-benefits {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 5px;
          margin-top: 13px;
        }

        .login-benefits span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #9b9489;
          font-size: 7px;
          white-space: nowrap;
        }

        .login-benefits svg {
          color: #a17a21;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1080px) {
          .login-container {
            width: min(700px, calc(100% - 34px));
            grid-template-columns: 1fr;
            gap: 0;
            padding: 26px 0;
          }

          .showcase {
            display: none;
          }

          .login-section {
            min-height: calc(100dvh - 52px);
            align-items: center;
          }

          .login-card {
            width: min(500px, 100%);
          }

          .mobile-brand {
            display: flex;
            justify-content: center;
            margin-bottom: 23px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 560px) {
          .login-page {
            overflow-y: auto;
          }

          .login-container {
            width: calc(100% - 14px);
            min-height: 100dvh;
            padding: 7px 0;
          }

          .login-section {
            min-height: calc(100dvh - 14px);
          }

          .login-card {
            padding: 25px 17px 18px;
            border-radius: 21px;
          }

          .mobile-brand {
            margin-bottom: 19px;
          }

          .brand-logo {
            width: 39px;
            height: 39px;
            border-radius: 11px;
          }

          .brand-name {
            font-size: 21px;
          }

          .login-heading {
            gap: 10px;
            margin-bottom: 21px;
          }

          .login-heading-icon {
            width: 42px;
            height: 42px;
            flex-basis: 42px;
            border-radius: 12px;
          }

          .login-heading h2 {
            font-size: 25px;
          }

          .login-heading p {
            font-size: 9px;
          }

          .login-form {
            gap: 15px;
          }

          .input-box input {
            height: 49px;
          }

          .password-toggle {
            width: 40px;
            height: 40px;
          }

          .login-button {
            height: 50px;
          }

          .security-panel {
            padding: 10px;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 380px) {
          .login-container {
            width: calc(100% - 10px);
          }

          .login-card {
            padding: 22px 14px 16px;
            border-radius: 19px;
          }

          .mobile-brand {
            margin-bottom: 17px;
          }

          .login-heading h2 {
            font-size: 23px;
          }

          .login-heading p {
            font-size: 8px;
          }

          .input-box input {
            height: 47px;
          }

          .login-button {
            height: 48px;
          }

          .login-benefits span {
            font-size: 6.5px;
          }

          .secure-status {
            display: none;
          }
        }

        /* =====================================================
           ACCESSIBILITY
        ===================================================== */

        a:focus-visible,
        button:focus-visible,
        input:focus-visible,
        label:focus-visible {
          outline: 2px solid #c69624;
          outline-offset: 3px;
        }

        .password-toggle:focus-visible {
          outline: 2px solid #c69624;
          outline-offset: 2px;
          background: #f8f1e3;
          color: #966e16;
        }

        .remember-row:has(input:focus-visible)
          .custom-checkbox {
          outline: 2px solid #c69624;
          outline-offset: 2px;
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

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
