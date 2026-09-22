"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
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
          setError("Please verify your email before logging in.");
        } else if (message.includes("invalid login credentials")) {
          setError("Invalid email or password.");
        } else {
          setError(loginError.message);
        }

        return;
      }

      if (!data.session) {
        setError(
          "Unable to create a login session. Please try again."
        );
        return;
      }

      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 700);
    } catch (err) {
      console.error("Login error:", err);

      setError(
        "Something went wrong while logging in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      {/* Decorative background */}
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <div className="floating-shape shape-one" />
      <div className="floating-shape shape-two" />
      <div className="floating-shape shape-three" />

      <div className="login-container">
        {/* =====================================================
            LEFT SHOWCASE
        ====================================================== */}

        <section className="showcase">
          <Link href="/" className="brand">
            <div className="brand-logo">
              <ShoppingBag size={21} strokeWidth={2.4} />
            </div>

            <span className="brand-name">
              Prime<span>Cart</span>
            </span>
          </Link>

          <div className="showcase-main">
            <div className="premium-badge">
              <span className="badge-icon">
                <Sparkles size={13} />
              </span>

              <span>Smart shopping starts here</span>

              <span className="live-dot" />
            </div>

            <h1>
              Shop smarter.
              <br />
              <span>Live better.</span>
            </h1>

            <p className="showcase-description">
              Discover products you'll love, explore smarter deals,
              and enjoy a seamless shopping experience designed
              around you.
            </p>

            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <Zap size={18} />
                </div>

                <div>
                  <strong>Smart shopping</strong>
                  <span>
                    Discover products that fit your lifestyle.
                  </span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <ShoppingBag size={18} />
                </div>

                <div>
                  <strong>Curated products</strong>
                  <span>
                    Quality products across your favorite categories.
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
                    Your account and shopping experience stay protected.
                  </span>
                </div>
              </div>
            </div>

            <div className="mini-stats">
              <div>
                <strong>10K+</strong>
                <span>Products</span>
              </div>

              <div className="stat-divider" />

              <div>
                <strong>50+</strong>
                <span>Categories</span>
              </div>

              <div className="stat-divider" />

              <div>
                <strong>24/7</strong>
                <span>Support</span>
              </div>
            </div>
          </div>

          <div className="showcase-footer">
            <span>© 2026 PrimeCart</span>

            <span className="footer-status">
              <span className="status-dot" />
              Shopping platform
            </span>
          </div>
        </section>

        {/* =====================================================
            RIGHT LOGIN
        ====================================================== */}

        <section className="login-area">
          <div className="login-card">
            {/* Mobile brand */}
            <div className="mobile-brand">
              <Link href="/" className="brand">
                <div className="brand-logo">
                  <ShoppingBag size={20} />
                </div>

                <span className="brand-name">
                  Prime<span>Cart</span>
                </span>
              </Link>
            </div>

            {/* Card top */}
            <div className="card-top">
              <div className="login-icon-wrapper">
                <div className="login-icon">
                  <LockKeyhole size={22} />
                </div>

                <span className="icon-glow" />
              </div>

              <div>
                <div className="welcome-label">
                  <span>WELCOME BACK</span>
                  <Sparkles size={12} />
                </div>

                <h2>Sign in to PrimeCart</h2>

                <p>
                  Access your account and continue your shopping
                  journey.
                </p>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="message error-message">
                <div className="message-icon">
                  <AlertCircle size={17} />
                </div>

                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="message success-message">
                <div className="message-icon">
                  <CheckCircle2 size={17} />
                </div>

                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="login-form">
              {/* Email */}
              <div className="field">
                <label htmlFor="email">Email address</label>

                <div className="input-wrapper">
                  <div className="input-leading">
                    <Mail size={18} />
                  </div>

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={loading}
                    required
                  />

                  {email && (
                    <div className="input-check">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="field">
                <div className="password-label-row">
                  <label htmlFor="password">Password</label>

                  <Link href="/auth/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <div className="input-wrapper">
                  <div className="input-leading">
                    <LockKeyhole size={18} />
                  </div>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Remember */}
              <label className="remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                  disabled={loading}
                />

                <span className="checkbox">
                  {rememberMe && <CheckCircle2 size={12} />}
                </span>

                <span>Remember me</span>
              </label>

              {/* Login button */}
              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                <span className="button-shine" />

                {loading ? (
                  <>
                    <Loader2 size={19} className="spin" />
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to PrimeCart</span>
                    <ArrowRight size={19} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider">
              <span>New to PrimeCart?</span>
            </div>

            {/* Register */}
            <Link href="/auth/register" className="create-account">
              <span>Create your account</span>

              <ArrowRight size={17} />
            </Link>

            {/* Security */}
            <div className="security-card">
              <div className="security-icon">
                <ShieldCheck size={15} />
              </div>

              <div>
                <strong>Secure sign in</strong>
                <span>
                  Your account information is protected with secure
                  authentication.
                </span>
              </div>
            </div>

            <div className="legal-text">
              By continuing, you agree to PrimeCart&apos;s{" "}
              <span>Terms</span> and <span>Privacy Policy</span>.
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
              circle at 8% 15%,
              rgba(211, 169, 66, 0.1),
              transparent 28%
            ),
            radial-gradient(
              circle at 90% 85%,
              rgba(211, 169, 66, 0.08),
              transparent 28%
            ),
            #faf8f3;
          color: #1c1a16;
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
           AMBIENT
        ====================================================== */

        .ambient {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(90px);
          animation: ambientFloat 8s ease-in-out infinite;
        }

        .ambient-one {
          width: 360px;
          height: 360px;
          top: -190px;
          right: -100px;
          background: rgba(214, 167, 54, 0.16);
        }

        .ambient-two {
          width: 300px;
          height: 300px;
          bottom: -180px;
          left: -100px;
          background: rgba(214, 167, 54, 0.12);
          animation-delay: -3s;
        }

        .ambient-three {
          width: 180px;
          height: 180px;
          top: 45%;
          left: 45%;
          background: rgba(244, 207, 115, 0.07);
          animation-delay: -5s;
        }

        @keyframes ambientFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(0, -18px, 0) scale(1.05);
          }
        }

        .floating-shape {
          position: fixed;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d4a638;
          opacity: 0.25;
          pointer-events: none;
          animation: particleFloat 7s ease-in-out infinite;
        }

        .shape-one {
          top: 18%;
          left: 7%;
        }

        .shape-two {
          top: 72%;
          left: 48%;
          width: 5px;
          height: 5px;
          animation-delay: -2s;
        }

        .shape-three {
          top: 30%;
          right: 8%;
          width: 6px;
          height: 6px;
          animation-delay: -4s;
        }

        @keyframes particleFloat {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.2;
          }

          50% {
            transform: translateY(-25px);
            opacity: 0.5;
          }
        }

        /* =====================================================
           CONTAINER
        ====================================================== */

        .login-container {
          position: relative;
          z-index: 2;
          width: min(1220px, calc(100% - 48px));
          min-height: 100vh;
          margin: auto;
          padding: 30px 0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(430px, 500px);
          gap: 80px;
          align-items: center;
        }

        /* =====================================================
           BRAND
        ====================================================== */

        .brand {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 11px;
          text-decoration: none;
          color: #1b1915;
          transition: transform 0.25s ease;
        }

        .brand:hover {
          transform: translateY(-2px);
        }

        .brand-logo {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: #fff;
          background: linear-gradient(
            145deg,
            #e3bd65,
            #c49325
          );
          box-shadow:
            0 10px 25px rgba(194, 145, 34, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        .brand-name {
          font-size: 24px;
          font-weight: 850;
          letter-spacing: -0.8px;
        }

        .brand-name span {
          color: #c39326;
        }

        /* =====================================================
           SHOWCASE
        ====================================================== */

        .showcase {
          min-height: 700px;
          padding: 22px 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          animation: showcaseIn 0.8s ease both;
        }

        @keyframes showcaseIn {
          from {
            opacity: 0;
            transform: translateX(-24px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .showcase-main {
          max-width: 610px;
        }

        .premium-badge {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 13px 8px 8px;
          border: 1px solid rgba(198, 150, 36, 0.2);
          background: rgba(255, 255, 255, 0.72);
          border-radius: 999px;
          color: #765914;
          font-size: 12px;
          font-weight: 750;
          box-shadow: 0 8px 25px rgba(87, 66, 24, 0.04);
        }

        .badge-icon {
          width: 25px;
          height: 25px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f3e3b9;
          color: #a2781e;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          margin-left: 2px;
          border-radius: 50%;
          background: #72a05f;
          box-shadow: 0 0 0 4px rgba(114, 160, 95, 0.1);
        }

        .showcase h1 {
          margin: 26px 0 0;
          font-size: clamp(52px, 6vw, 78px);
          line-height: 0.96;
          letter-spacing: -5px;
          font-weight: 900;
          color: #171511;
        }

        .showcase h1 span {
          color: #c39428;
        }

        .showcase-description {
          max-width: 535px;
          margin: 28px 0 36px;
          color: #716b61;
          font-size: 16px;
          line-height: 1.75;
        }

        /* =====================================================
           FEATURES
        ====================================================== */

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .feature-item {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 5px 10px 5px 5px;
          border-radius: 15px;
          transition: 0.25s ease;
        }

        .feature-item:hover {
          background: rgba(255, 255, 255, 0.65);
          transform: translateX(4px);
        }

        .feature-icon {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: #96701d;
          background: #f2e3ba;
        }

        .feature-item strong {
          display: block;
          margin-bottom: 2px;
          color: #29261f;
          font-size: 13px;
          font-weight: 800;
        }

        .feature-item span {
          display: block;
          color: #8b8478;
          font-size: 12px;
        }

        /* =====================================================
           STATS
        ====================================================== */

        .mini-stats {
          display: flex;
          align-items: center;
          gap: 23px;
          margin-top: 38px;
        }

        .mini-stats strong {
          display: block;
          color: #28241d;
          font-size: 19px;
          letter-spacing: -0.5px;
        }

        .mini-stats span {
          display: block;
          margin-top: 2px;
          color: #999184;
          font-size: 11px;
        }

        .stat-divider {
          width: 1px;
          height: 28px;
          background: #e2ddd3;
        }

        .showcase-footer {
          max-width: 610px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #aaa398;
          font-size: 11px;
        }

        .footer-status {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #78a264;
        }

        /* =====================================================
           LOGIN AREA
        ====================================================== */

        .login-area {
          display: flex;
          justify-content: center;
          animation: cardIn 0.8s 0.1s ease both;
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(25px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .login-card {
          width: 100%;
          padding: 40px;
          border: 1px solid rgba(224, 217, 203, 0.95);
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.91);
          box-shadow:
            0 30px 80px rgba(63, 51, 25, 0.1),
            0 8px 25px rgba(63, 51, 25, 0.045);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .mobile-brand {
          display: none;
        }

        /* =====================================================
           CARD HEADER
        ====================================================== */

        .card-top {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 28px;
        }

        .login-icon-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .login-icon {
          position: relative;
          z-index: 1;
          width: 50px;
          height: 50px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          color: #9a731e;
          background: linear-gradient(
            145deg,
            #fbf1d7,
            #f1dfb1
          );
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            0 8px 18px rgba(176, 132, 35, 0.1);
        }

        .icon-glow {
          position: absolute;
          width: 35px;
          height: 35px;
          top: 8px;
          left: 8px;
          border-radius: 50%;
          background: rgba(218, 172, 62, 0.35);
          filter: blur(15px);
          animation: iconPulse 2.5s ease-in-out infinite;
        }

        @keyframes iconPulse {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(0.8);
          }

          50% {
            opacity: 0.8;
            transform: scale(1.15);
          }
        }

        .welcome-label {
          display: flex;
          align-items: center;
          gap: 5px;
          margin: 1px 0 5px;
          color: #b08a32;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .card-top h2 {
          margin: 0;
          color: #201e19;
          font-size: 27px;
          line-height: 1.15;
          letter-spacing: -1px;
        }

        .card-top p {
          margin: 7px 0 0;
          color: #858075;
          font-size: 12px;
          line-height: 1.55;
        }

        /* =====================================================
           MESSAGES
        ====================================================== */

        .message {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 13px;
          margin-bottom: 17px;
          border-radius: 13px;
          font-size: 12px;
          line-height: 1.45;
          animation: messageIn 0.3s ease both;
        }

        @keyframes messageIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-icon {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .error-message {
          color: #963e3e;
          border: 1px solid #f0cece;
          background: #fff4f4;
        }

        .success-message {
          color: #487548;
          border: 1px solid #d5e8d0;
          background: #f2faf0;
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
        .password-label-row label {
          color: #36322b;
          font-size: 12px;
          font-weight: 800;
        }

        .password-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .password-label-row a {
          color: #a1771e;
          font-size: 11px;
          font-weight: 800;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .password-label-row a:hover {
          color: #805d14;
          text-decoration: underline;
        }

        /* =====================================================
           INPUT
        ====================================================== */

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-leading {
          position: absolute;
          left: 15px;
          z-index: 2;
          display: grid;
          place-items: center;
          color: #a9a196;
          pointer-events: none;
          transition: 0.2s ease;
        }

        .input-wrapper input {
          width: 100%;
          height: 53px;
          padding: 0 43px 0 45px;
          border: 1px solid #e3ded4;
          outline: none;
          border-radius: 14px;
          background: #fff;
          color: #29261f;
          font-size: 13px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .input-wrapper input::placeholder {
          color: #b5aea4;
        }

        .input-wrapper input:hover:not(:disabled) {
          border-color: #d6cec0;
        }

        .input-wrapper input:focus {
          border-color: #d0a13c;
          box-shadow:
            0 0 0 4px rgba(208, 161, 60, 0.1),
            0 7px 18px rgba(87, 67, 25, 0.04);
        }

        .input-wrapper:focus-within .input-leading {
          color: #b28320;
        }

        .input-check {
          position: absolute;
          right: 14px;
          display: grid;
          place-items: center;
          color: #78a25e;
          animation: checkIn 0.2s ease both;
        }

        @keyframes checkIn {
          from {
            opacity: 0;
            transform: scale(0.6);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .password-toggle {
          position: absolute;
          right: 11px;
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #9b948a;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .password-toggle:hover {
          background: #f7f2e8;
          color: #a1771e;
        }

        /* =====================================================
           REMEMBER
        ====================================================== */

        .remember {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #777067;
          font-size: 12px;
          cursor: pointer;
          user-select: none;
        }

        .remember input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .checkbox {
          width: 18px;
          height: 18px;
          display: grid;
          place-items: center;
          border: 1px solid #d5cfc4;
          border-radius: 6px;
          background: #fff;
          color: #fff;
          transition: 0.2s ease;
        }

        .remember:hover .checkbox {
          border-color: #c59a35;
        }

        .remember input:checked + .checkbox {
          border-color: #c49529;
          background: #c49529;
          box-shadow: 0 4px 10px rgba(196, 149, 41, 0.2);
        }

        /* =====================================================
           BUTTON
        ====================================================== */

        .login-button {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 2px;
          border: 0;
          border-radius: 14px;
          color: #fff;
          background: linear-gradient(
            135deg,
            #d3a43c,
            #bd8e23
          );
          box-shadow:
            0 14px 28px rgba(181, 136, 31, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            filter 0.2s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.03);
          box-shadow:
            0 18px 35px rgba(181, 136, 31, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          cursor: not-allowed;
          opacity: 0.75;
        }

        .button-shine {
          position: absolute;
          top: 0;
          left: -80%;
          width: 45%;
          height: 100%;
          transform: skewX(-20deg);
          background: rgba(255, 255, 255, 0.18);
          animation: shine 4s ease-in-out infinite;
        }

        @keyframes shine {
          0%,
          65% {
            left: -80%;
          }

          85%,
          100% {
            left: 130%;
          }
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
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 25px 0 17px;
          color: #aaa298;
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
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 15px;
          border: 1px solid #e6dfd3;
          border-radius: 13px;
          color: #6f675c;
          background: #fff;
          text-decoration: none;
          font-size: 12px;
          font-weight: 750;
          transition: 0.25s ease;
        }

        .create-account svg {
          color: #b08322;
          transition: transform 0.25s ease;
        }

        .create-account:hover {
          border-color: #d4b56d;
          background: #fffdf8;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(79, 61, 25, 0.06);
        }

        .create-account:hover svg {
          transform: translateX(4px);
        }

        /* =====================================================
           SECURITY
        ====================================================== */

        .security-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 19px;
          padding: 12px;
          border: 1px solid #eee8dd;
          border-radius: 12px;
          background: #fcfaf6;
        }

        .security-icon {
          width: 27px;
          height: 27px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 8px;
          color: #77975e;
          background: #edf5e9;
        }

        .security-card strong {
          display: block;
          margin-bottom: 2px;
          color: #555046;
          font-size: 10px;
          font-weight: 850;
        }

        .security-card span {
          display: block;
          color: #999187;
          font-size: 9px;
          line-height: 1.45;
        }

        .legal-text {
          margin-top: 15px;
          text-align: center;
          color: #aaa298;
          font-size: 9px;
          line-height: 1.5;
        }

        .legal-text span {
          color: #96701e;
        }

        /* =====================================================
           TABLET
        ====================================================== */

        @media (max-width: 1050px) {
          .login-container {
            grid-template-columns: minmax(0, 0.9fr) minmax(400px, 470px);
            gap: 45px;
          }

          .showcase h1 {
            font-size: 58px;
          }
        }

        /* =====================================================
           MOBILE / TABLET
        ====================================================== */

        @media (max-width: 850px) {
          .login-container {
            width: min(570px, calc(100% - 32px));
            min-height: auto;
            padding: 25px 0;
            display: block;
          }

          .showcase {
            display: none;
          }

          .login-area {
            min-height: calc(100vh - 50px);
            display: flex;
            align-items: center;
          }

          .login-card {
            padding: 35px;
          }

          .mobile-brand {
            display: flex;
            justify-content: center;
            margin-bottom: 29px;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ====================================================== */

        @media (max-width: 520px) {
          .login-page {
            background:
              radial-gradient(
                circle at 50% 0%,
                rgba(214, 167, 54, 0.12),
                transparent 35%
              ),
              #faf8f3;
          }

          .login-container {
            width: calc(100% - 20px);
            padding: 10px 0;
          }

          .login-area {
            min-height: calc(100vh - 20px);
          }

          .login-card {
            padding: 25px 18px;
            border-radius: 23px;
          }

          .mobile-brand {
            margin-bottom: 25px;
          }

          .brand-logo {
            width: 40px;
            height: 40px;
            border-radius: 12px;
          }

          .brand-name {
            font-size: 22px;
          }

          .card-top {
            gap: 12px;
            margin-bottom: 24px;
          }

          .login-icon {
            width: 45px;
            height: 45px;
            border-radius: 14px;
          }

          .card-top h2 {
            font-size: 23px;
          }

          .card-top p {
            font-size: 11px;
          }

          .welcome-label {
            font-size: 8px;
          }

          .login-form {
            gap: 17px;
          }

          .input-wrapper input {
            height: 51px;
          }

          .login-button {
            height: 52px;
          }

          .security-card {
            padding: 10px;
          }
        }

        /* =====================================================
           VERY SMALL
        ====================================================== */

        @media (max-width: 360px) {
          .login-container {
            width: calc(100% - 14px);
          }

          .login-card {
            padding: 22px 15px;
          }

          .card-top h2 {
            font-size: 21px;
          }

          .card-top p {
            font-size: 10px;
          }

          .login-button {
            font-size: 12px;
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
          }
        }
      `}</style>
    </main>
  );
}
