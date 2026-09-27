// app/auth/login/page.tsx

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
      {/* BACKGROUND */}
      <div className="bg-orb orb-one" />
      <div className="bg-orb orb-two" />
      <div className="bg-grid" />

      <div className="login-shell">
        {/* =====================================================
            LEFT BRAND / EXPERIENCE PANEL
        ===================================================== */}

        <section className="experience-panel">
          <div className="experience-inner">
            {/* BRAND */}

            <Link href="/" className="brand">
              <div className="brand-mark">
                <Image
                  src="/logo.png"
                  alt="PrimeCart"
                  width={46}
                  height={46}
                  priority
                />
              </div>

              <div className="brand-text">
                Prime<span>Cart</span>
              </div>
            </Link>

            {/* MAIN */}

            <div className="experience-content">
              <div className="premium-badge">
                <span className="badge-dot" />
                <Sparkles size={13} />
                <span>Smarter shopping starts here</span>
              </div>

              <h1>
                Shop smarter.
                <br />
                <span>Live better.</span>
              </h1>

              <p className="experience-description">
                Your everyday shopping destination for
                carefully selected products, exciting deals
                and a simpler way to discover what you need.
              </p>

              {/* FEATURE CARDS */}

              <div className="feature-cards">
                <div className="feature-card">
                  <div className="feature-icon">
                    <Zap size={17} />
                  </div>

                  <div>
                    <h3>Smart discovery</h3>
                    <p>
                      Find products that match your needs.
                    </p>
                  </div>

                  <div className="feature-arrow">
                    <ArrowRight size={14} />
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <Truck size={17} />
                  </div>

                  <div>
                    <h3>Easy shopping</h3>
                    <p>
                      A smooth experience from browse to buy.
                    </p>
                  </div>

                  <div className="feature-arrow">
                    <ArrowRight size={14} />
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <ShieldCheck size={17} />
                  </div>

                  <div>
                    <h3>Secure account</h3>
                    <p>
                      Your shopping experience stays protected.
                    </p>
                  </div>

                  <div className="feature-arrow">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>

              {/* TRUST STATS */}

              <div className="trust-row">
                <div className="trust-item">
                  <strong>10K+</strong>
                  <span>Products</span>
                </div>

                <div className="trust-separator" />

                <div className="trust-item">
                  <strong>24/7</strong>
                  <span>Shopping</span>
                </div>

                <div className="trust-separator" />

                <div className="trust-item">
                  <strong>Easy</strong>
                  <span>Returns</span>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="experience-footer">
              <span>© 2026 PrimeCart</span>

              <div>
                <span>Secure</span>
                <i>•</i>
                <span>Simple</span>
                <i>•</i>
                <span>Smart</span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            LOGIN PANEL
        ===================================================== */}

        <section className="login-area">
          <div className="login-card">
            {/* TOP GOLD LINE */}
            <div className="gold-line" />

            {/* MOBILE BRAND */}

            <div className="mobile-brand">
              <Link href="/" className="brand">
                <div className="brand-mark">
                  <Image
                    src="/logo.png"
                    alt="PrimeCart"
                    width={42}
                    height={42}
                  />
                </div>

                <div className="brand-text">
                  Prime<span>Cart</span>
                </div>
              </Link>
            </div>

            {/* LOGIN HEADER */}

            <div className="login-header">
              <div className="login-icon">
                <LockKeyhole size={20} />
              </div>

              <div>
                <span className="overline">
                  PRIME CART ACCOUNT
                </span>

                <h2>Welcome back</h2>

                <p>
                  Sign in to continue to your account.
                </p>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="alert alert-error" role="alert">
                <div className="alert-icon">
                  <AlertCircle size={16} />
                </div>

                <span>{error}</span>
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div
                className="alert alert-success"
                role="status"
              >
                <div className="alert-icon">
                  <CheckCircle2 size={16} />
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

              <div className="form-field">
                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-container">
                  <div className="input-leading">
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

              <div className="form-field">
                <div className="password-label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  <Link href="/auth/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <div className="input-container">
                  <div className="input-leading">
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

                  <button
                    type="button"
                    className="eye-button"
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
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
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
                    setRememberMe(e.target.checked)
                  }
                  disabled={loading}
                />

                <span className="fake-checkbox">
                  <span>✓</span>
                </span>

                <span>Remember me</span>
              </label>

              {/* LOGIN */}

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
                        className="loading-icon"
                      />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in to PrimeCart</span>
                      <span className="button-icon">
                        <ArrowRight size={17} />
                      </span>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* REGISTER */}

            <div className="register-section">
              <div className="register-divider">
                <span>Don't have an account?</span>
              </div>

              <Link
                href="/auth/register"
                className="register-button"
              >
                <span>Create your PrimeCart account</span>

                <span className="register-arrow">
                  <ArrowRight size={15} />
                </span>
              </Link>
            </div>

            {/* SECURITY */}

            <div className="security-box">
              <div className="security-symbol">
                <ShieldCheck size={16} />
              </div>

              <div>
                <strong>Secure & protected</strong>
                <span>
                  Your account information is handled
                  securely.
                </span>
              </div>

              <div className="verified-badge">
                <CheckCircle2 size={13} />
                Verified
              </div>
            </div>

            {/* BENEFITS */}

            <div className="bottom-benefits">
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
          overflow: hidden;
          color: #24211b;
          background:
            radial-gradient(
              circle at 80% 5%,
              rgba(212, 175, 55, 0.11),
              transparent 24%
            ),
            radial-gradient(
              circle at 5% 95%,
              rgba(212, 175, 55, 0.07),
              transparent 27%
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

        .bg-orb {
          position: fixed;
          z-index: 0;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(90px);
        }

        .orb-one {
          top: -190px;
          right: -120px;
          width: 390px;
          height: 390px;
          background: rgba(212, 175, 55, 0.11);
        }

        .orb-two {
          bottom: -220px;
          left: -160px;
          width: 430px;
          height: 430px;
          background: rgba(207, 165, 58, 0.08);
        }

        .bg-grid {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.3;
          background-image:
            linear-gradient(
              rgba(170, 135, 53, 0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(170, 135, 53, 0.025) 1px,
              transparent 1px
            );
          background-size: 44px 44px;
        }

        /* =====================================================
           SHELL
        ===================================================== */

        .login-shell {
          position: relative;
          z-index: 2;
          width: min(1260px, calc(100% - 64px));
          min-height: 100vh;
          min-height: 100dvh;
          margin: 0 auto;
          padding: 30px 0;
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(410px, 480px);
          gap: 75px;
          align-items: center;
        }

        /* =====================================================
           BRAND
        ===================================================== */

        .brand {
          display: inline-flex;
          width: fit-content;
          align-items: center;
          gap: 11px;
          color: #24211b;
          text-decoration: none;
        }

        .brand-mark {
          width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 1px solid #e7decc;
          border-radius: 13px;
          background: #ffffff;
          box-shadow:
            0 8px 25px rgba(63, 47, 17, 0.07);
        }

        .brand-mark img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .brand-text {
          font-size: 24px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .brand-text span {
          color: #c69624;
        }

        /* =====================================================
           EXPERIENCE PANEL
        ===================================================== */

        .experience-panel {
          min-height: 650px;
          display: flex;
          align-items: center;
        }

        .experience-inner {
          width: 100%;
          min-height: 610px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .experience-content {
          max-width: 640px;
        }

        .premium-badge {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 23px;
          padding: 7px 12px 7px 9px;
          border: 1px solid #eadfc8;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.72);
          color: #947126;
          font-size: 10px;
          font-weight: 800;
          box-shadow:
            0 8px 25px rgba(61, 45, 18, 0.035);
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c69624;
          box-shadow:
            0 0 0 4px rgba(198, 150, 36, 0.09);
        }

        .experience-content h1 {
          margin: 0;
          color: #24211b;
          font-size: clamp(48px, 5vw, 72px);
          line-height: 0.98;
          letter-spacing: -4.5px;
          font-weight: 900;
        }

        .experience-content h1 span {
          color: #c69624;
        }

        .experience-description {
          max-width: 555px;
          margin: 25px 0 29px;
          color: #7e776c;
          font-size: 14px;
          line-height: 1.8;
        }

        /* =====================================================
           FEATURE CARDS
        ===================================================== */

        .feature-cards {
          display: grid;
          gap: 9px;
          width: min(580px, 100%);
        }

        .feature-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 60px;
          padding: 10px 12px;
          border: 1px solid rgba(229, 221, 207, 0.7);
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.58);
          transition:
            transform 0.22s ease,
            border-color 0.22s ease,
            background 0.22s ease,
            box-shadow 0.22s ease;
        }

        .feature-card:hover {
          transform: translateX(5px);
          border-color: #e0c986;
          background: rgba(255, 255, 255, 0.9);
          box-shadow:
            0 10px 25px rgba(71, 52, 16, 0.05);
        }

        .feature-icon {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #f8edd2;
          color: #9a741e;
        }

        .feature-card h3 {
          margin: 0 0 2px;
          color: #373229;
          font-size: 11px;
          font-weight: 850;
        }

        .feature-card p {
          margin: 0;
          color: #928b80;
          font-size: 10px;
        }

        .feature-arrow {
          margin-left: auto;
          color: #c3b18d;
          transition: transform 0.22s ease;
        }

        .feature-card:hover .feature-arrow {
          transform: translateX(3px);
          color: #aa8228;
        }

        /* =====================================================
           TRUST
        ===================================================== */

        .trust-row {
          width: min(510px, 100%);
          display: flex;
          align-items: center;
          gap: 22px;
          margin-top: 28px;
          padding-top: 22px;
          border-top: 1px solid #e7dfd1;
        }

        .trust-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .trust-item strong {
          color: #343027;
          font-size: 14px;
          font-weight: 900;
        }

        .trust-item span {
          color: #9b9489;
          font-size: 9px;
        }

        .trust-separator {
          width: 1px;
          height: 27px;
          background: #ded6c7;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .experience-footer {
          width: min(640px, 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #aaa298;
          font-size: 9px;
        }

        .experience-footer div {
          display: flex;
          gap: 7px;
        }

        .experience-footer i {
          color: #cfab5d;
          font-style: normal;
        }

        /* =====================================================
           LOGIN AREA
        ===================================================== */

        .login-area {
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
          background: rgba(255, 255, 255, 0.96);
          box-shadow:
            0 35px 80px rgba(57, 44, 19, 0.09),
            0 8px 25px rgba(57, 44, 19, 0.035);
          backdrop-filter: blur(20px);
        }

        .login-card::after {
          content: "";
          position: absolute;
          right: -100px;
          top: -110px;
          width: 230px;
          height: 230px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.06);
          filter: blur(35px);
          pointer-events: none;
        }

        .gold-line {
          position: absolute;
          top: 0;
          left: 14%;
          right: 14%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            #d4af37,
            #b98a21,
            transparent
          );
        }

        .mobile-brand {
          display: none;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .login-header {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 13px;
          margin-bottom: 25px;
        }

        .login-icon {
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          display: grid;
          place-items: center;
          border: 1px solid #eadcbf;
          border-radius: 14px;
          background: linear-gradient(
            145deg,
            #fff9ea,
            #f5e6bf
          );
          color: #96701b;
        }

        .overline {
          display: block;
          margin-bottom: 4px;
          color: #b28a35;
          font-size: 7px;
          letter-spacing: 1.7px;
          font-weight: 900;
        }

        .login-header h2 {
          margin: 0;
          color: #25221c;
          font-size: 29px;
          line-height: 1.05;
          letter-spacing: -1.2px;
          font-weight: 900;
        }

        .login-header p {
          margin: 6px 0 0;
          color: #8c857b;
          font-size: 10px;
          line-height: 1.5;
        }

        /* =====================================================
           ALERT
        ===================================================== */

        .alert {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-bottom: 15px;
          padding: 11px 12px;
          border-radius: 11px;
          font-size: 10px;
          line-height: 1.5;
        }

        .alert-icon {
          flex: 0 0 auto;
          margin-top: 1px;
        }

        .alert-error {
          border: 1px solid #efd5d2;
          background: #fff5f4;
          color: #9b4945;
        }

        .alert-success {
          border: 1px solid #d6e8d1;
          background: #f4faf1;
          color: #557650;
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

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .form-field label {
          color: #39342b;
          font-size: 10px;
          font-weight: 850;
        }

        .password-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .password-label-row a {
          color: #a67b20;
          font-size: 9px;
          font-weight: 800;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .password-label-row a:hover {
          color: #76560f;
        }

        /* =====================================================
           INPUT
        ===================================================== */

        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-container::after {
          content: "";
          position: absolute;
          left: 13px;
          right: 13px;
          bottom: 0;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            #b9891c,
            #e1be68
          );
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.25s ease;
          pointer-events: none;
        }

        .input-container:focus-within::after {
          transform: scaleX(1);
        }

        .input-leading {
          position: absolute;
          left: 14px;
          z-index: 2;
          display: grid;
          place-items: center;
          color: #aaa297;
          pointer-events: none;
          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .input-container:focus-within .input-leading {
          color: #b2821a;
          transform: scale(1.05);
        }

        .input-container input {
          width: 100%;
          height: 51px;
          padding: 0 44px;
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

        .input-container input:hover:not(:disabled) {
          border-color: #d5c9b6;
        }

        .input-container input:focus {
          border-color: #d0a03c;
          background: #fffefa;
          box-shadow:
            0 0 0 4px rgba(208, 160, 60, 0.07);
        }

        .input-container input::placeholder {
          color: #b8b1a7;
        }

        .input-container input:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .eye-button {
          position: absolute;
          right: 8px;
          z-index: 3;
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #9d968c;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .eye-button:hover {
          background: #f7f0e2;
          color: #9a731d;
        }

        /* =====================================================
           REMEMBER
        ===================================================== */

        .remember-row {
          position: relative;
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

        .fake-checkbox {
          width: 17px;
          height: 17px;
          display: grid;
          place-items: center;
          border: 1px solid #d6cfc2;
          border-radius: 5px;
          background: #fff;
        }

        .fake-checkbox span {
          opacity: 0;
          color: #fff;
          font-size: 10px;
          font-weight: 900;
          transform: scale(0.5);
          transition: 0.18s ease;
        }

        .remember-row
          input:checked
          + .fake-checkbox {
          border-color: #c69624;
          background: #c69624;
          box-shadow:
            0 4px 10px rgba(198, 150, 36, 0.2);
        }

        .remember-row
          input:checked
          + .fake-checkbox
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
            0 12px 25px rgba(190, 140, 31, 0.22);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            filter 0.2s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.035);
          box-shadow:
            0 16px 30px rgba(190, 140, 31, 0.28);
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

        .button-icon {
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.14);
        }

        .loading-icon {
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

        .register-section {
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
          height: 44px;
          width: 100%;
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
            border-color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }

        .register-button:hover {
          transform: translateY(-1px);
          border-color: #d9bb70;
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

        .security-box {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 17px;
          padding: 12px;
          border: 1px solid #e5eadf;
          border-radius: 11px;
          background: #fbfdf9;
        }

        .security-symbol {
          width: 29px;
          height: 29px;
          flex: 0 0 29px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #eef6e9;
          color: #5d8055;
        }

        .security-box strong {
          display: block;
          margin-bottom: 2px;
          color: #5c6658;
          font-size: 8px;
          font-weight: 850;
        }

        .security-box span {
          display: block;
          color: #9a9d96;
          font-size: 8px;
        }

        .verified-badge {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: #65825e;
          font-size: 7px;
          font-weight: 800;
          white-space: nowrap;
        }

        /* =====================================================
           BOTTOM BENEFITS
        ===================================================== */

        .bottom-benefits {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 5px;
          margin-top: 13px;
        }

        .bottom-benefits span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #9b9489;
          font-size: 7px;
          white-space: nowrap;
        }

        .bottom-benefits svg {
          color: #a17a21;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1050px) {
          .login-shell {
            width: min(700px, calc(100% - 32px));
            grid-template-columns: 1fr;
            gap: 0;
            padding: 25px 0;
          }

          .experience-panel {
            display: none;
          }

          .login-area {
            min-height: calc(100dvh - 50px);
            align-items: center;
          }

          .login-card {
            width: min(500px, 100%);
          }

          .mobile-brand {
            display: flex;
            justify-content: center;
            margin-bottom: 24px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 560px) {
          .login-page {
            overflow-y: auto;
          }

          .login-shell {
            width: calc(100% - 14px);
            min-height: 100dvh;
            padding: 7px 0;
          }

          .login-area {
            min-height: calc(100dvh - 14px);
          }

          .login-card {
            padding: 25px 17px 18px;
            border-radius: 21px;
          }

          .mobile-brand {
            margin-bottom: 20px;
          }

          .brand-mark {
            width: 39px;
            height: 39px;
            border-radius: 11px;
          }

          .brand-text {
            font-size: 21px;
          }

          .login-header {
            gap: 10px;
            margin-bottom: 21px;
          }

          .login-icon {
            width: 42px;
            height: 42px;
            flex-basis: 42px;
            border-radius: 12px;
          }

          .login-header h2 {
            font-size: 25px;
          }

          .login-header p {
            font-size: 9px;
          }

          .login-form {
            gap: 15px;
          }

          .input-container input {
            height: 49px;
          }

          .login-button {
            height: 50px;
          }

          .security-box {
            padding: 10px;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 380px) {
          .login-shell {
            width: calc(100% - 10px);
          }

          .login-card {
            padding: 22px 14px 16px;
            border-radius: 19px;
          }

          .mobile-brand {
            margin-bottom: 17px;
          }

          .login-header h2 {
            font-size: 23px;
          }

          .login-header p {
            font-size: 8px;
          }

          .input-container input {
            height: 47px;
          }

          .login-button {
            height: 48px;
          }

          .bottom-benefits {
            gap: 3px;
          }

          .bottom-benefits span {
            font-size: 6.5px;
          }

          .verified-badge {
            display: none;
          }
        }

        /* =====================================================
           ACCESSIBILITY
        ===================================================== */

        .brand:focus-visible,
        .password-label-row a:focus-visible,
        .register-button:focus-visible,
        .eye-button:focus-visible,
        .login-button:focus-visible,
        input:focus-visible {
          outline: 2px solid #c69624;
          outline-offset: 3px;
        }

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
