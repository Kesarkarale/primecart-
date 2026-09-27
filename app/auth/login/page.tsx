"use client";

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
  Sparkles,
  Truck,
  RotateCcw,
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

      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      {/* =====================================================
          TOP BAR
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

          <div className="header-right">
            <span className="header-question">
              New to PrimeCart?
            </span>

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
        <div className="login-container">
          {/* =================================================
              TOP TRUST STRIP
          ================================================= */}

          <div className="trust-strip">
            <div className="trust-item">
              <div className="trust-icon">
                <ShieldCheck size={16} />
              </div>

              <div>
                <strong>Secure account</strong>
                <span>Your data is protected</span>
              </div>
            </div>

            <div className="trust-divider" />

            <div className="trust-item">
              <div className="trust-icon">
                <Truck size={16} />
              </div>

              <div>
                <strong>Easy shopping</strong>
                <span>Everything in one place</span>
              </div>
            </div>

            <div className="trust-divider" />

            <div className="trust-item">
              <div className="trust-icon">
                <RotateCcw size={16} />
              </div>

              <div>
                <strong>Easy returns</strong>
                <span>Shop with confidence</span>
              </div>
            </div>
          </div>

          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <div className="login-card">
            {/* CARD HEADER */}

            <div className="login-heading">
              <div className="heading-icon">
                <LockKeyhole size={20} />
              </div>

              <div>
                <div className="heading-label">
                  PRIME<span>CART</span> ACCOUNT
                </div>

                <h1>Welcome back</h1>

                <p>
                  Sign in to continue shopping with PrimeCart.
                </p>
              </div>
            </div>

            {/* MESSAGE */}

            {error && (
              <div
                className="message message-error"
                role="alert"
              >
                <div className="message-symbol">
                  <AlertCircle size={17} />
                </div>

                <div className="message-content">
                  <strong>Unable to sign in</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div
                className="message message-success"
                role="status"
              >
                <div className="message-symbol">
                  <CheckCircle2 size={17} />
                </div>

                <div className="message-content">
                  <strong>Welcome back</strong>
                  <span>{success}</span>
                </div>
              </div>
            )}

            {/* =================================================
                FORM
            ================================================== */}

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
                  className={`input-box ${
                    email ? "has-value" : ""
                  }`}
                >
                  <div className="input-leading">
                    <Mail size={18} />
                  </div>

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
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
                <div className="field-top">
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

                <div
                  className={`input-box ${
                    password ? "has-value" : ""
                  }`}
                >
                  <div className="input-leading">
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

                <span className="checkbox">
                  <span>✓</span>
                </span>

                <span className="remember-text">
                  Remember me
                </span>
              </label>

              {/* LOGIN BUTTON */}

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
                    <span>Sign in</span>

                    <span className="login-button-arrow">
                      <ArrowRight size={18} />
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* =================================================
                REGISTER
            ================================================== */}

            <div className="register-section">
              <div className="register-divider">
                <span>New to PrimeCart?</span>
              </div>

              <Link
                href="/auth/register"
                className="register-button"
              >
                <span>Create your account</span>

                <ArrowRight size={16} />
              </Link>
            </div>

            {/* =================================================
                SECURITY NOTE
            ================================================== */}

            <div className="security-box">
              <div className="security-check">
                <ShieldCheck size={17} />
              </div>

              <div>
                <strong>Secure sign in</strong>

                <span>
                  Your account information is kept
                  protected.
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              BOTTOM NOTE
          ================================================== */}

          <div className="bottom-note">
            <div className="bottom-brand">
              <Sparkles size={13} />
              <span>
                A smarter way to shop
              </span>
            </div>

            <span className="copyright">
              © 2026 PrimeCart
            </span>
          </div>
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

        a {
          -webkit-tap-highlight-color: transparent;
        }

        /* =====================================================
           PAGE
        ====================================================== */

        .login-page {
          min-height: 100vh;
          min-height: 100dvh;
          position: relative;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 50% -10%,
              rgba(212, 175, 55, 0.11),
              transparent 35%
            ),
            linear-gradient(
              180deg,
              #fffefa 0%,
              #faf8f3 52%,
              #f7f3ea 100%
            );
          color: #191816;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .background-glow {
          position: fixed;
          pointer-events: none;
          border-radius: 999px;
          filter: blur(90px);
          z-index: 0;
        }

        .glow-one {
          width: 300px;
          height: 300px;
          top: -180px;
          right: -80px;
          background: rgba(
            212,
            175,
            55,
            0.12
          );
        }

        .glow-two {
          width: 280px;
          height: 280px;
          bottom: -180px;
          left: -100px;
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
          border-bottom: 1px solid #eee8dc;
          background: rgba(
            255,
            255,
            255,
            0.86
          );
          backdrop-filter: blur(18px);
        }

        .header-inner {
          width: min(
            1240px,
            calc(100% - 48px)
          );
          min-height: 78px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        /* =====================================================
           BRAND
        ====================================================== */

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #1c1a16;
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
              #c59629
            );
          color: white;
          box-shadow:
            0 8px 20px
              rgba(166, 126, 34, 0.2);
        }

        .brand-mark span {
          font-size: 19px;
          line-height: 1;
          font-weight: 900;
          font-family: Georgia, serif;
        }

        .brand-name {
          font-size: 24px;
          line-height: 1;
          font-weight: 850;
          letter-spacing: -1px;
        }

        .brand-name span {
          color: #c69624;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .header-question {
          color: #827b70;
          font-size: 12px;
        }

        .header-register {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 36px;
          padding: 0 14px;
          border-radius: 9px;
          border: 1px solid #dfd3bb;
          background: #fff;
          color: #80621d;
          font-size: 12px;
          font-weight: 750;
          text-decoration: none;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .header-register:hover {
          background: #fffaf0;
          border-color: #cfae5d;
          transform: translateY(-1px);
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
          min-height: calc(100vh - 78px);
          min-height: calc(100dvh - 78px);
          display: flex;
          justify-content: center;
          padding: 42px 20px 34px;
        }

        .login-container {
          width: min(560px, 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* =====================================================
           TRUST STRIP
        ====================================================== */

        .trust-strip {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr;
          align-items: center;
          gap: 15px;
          margin-bottom: 18px;
          padding: 13px 17px;
          border: 1px solid #ebe4d7;
          border-radius: 14px;
          background: rgba(
            255,
            255,
            255,
            0.76
          );
          box-shadow:
            0 5px 20px
              rgba(62, 48, 22, 0.035);
          animation: fadeDown 0.55s ease both;
        }

        .trust-item {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .trust-icon {
          width: 31px;
          height: 31px;
          flex: 0 0 31px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #fff7e5;
          color: #b48622;
        }

        .trust-item strong,
        .trust-item span {
          display: block;
        }

        .trust-item strong {
          color: #403b33;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .trust-item span {
          margin-top: 2px;
          color: #9a9388;
          font-size: 9px;
          white-space: nowrap;
        }

        .trust-divider {
          width: 1px;
          height: 28px;
          background: #e9e1d2;
        }

        /* =====================================================
           LOGIN CARD
        ====================================================== */

        .login-card {
          width: 100%;
          padding: 36px 38px 32px;
          border: 1px solid #e5ddcf;
          border-radius: 24px;
          background: rgba(
            255,
            255,
            255,
            0.97
          );
          box-shadow:
            0 28px 70px
              rgba(54, 43, 23, 0.09),
            0 5px 18px
              rgba(54, 43, 23, 0.035);
          animation: cardEnter 0.65s
            0.08s ease both;
        }

        .login-card::before {
          content: "";
          display: block;
          width: 58px;
          height: 3px;
          margin: -36px auto 28px;
          border-radius: 99px;
          background:
            linear-gradient(
              90deg,
              #b8872d,
              #e2c56f
            );
        }

        /* =====================================================
           HEADING
        ====================================================== */

        .login-heading {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 28px;
        }

        .heading-icon {
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #fff8e8;
          border: 1px solid #f0dfb8;
          color: #ae8121;
        }

        .heading-label {
          margin-bottom: 6px;
          color: #a37a20;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 1.5px;
        }

        .heading-label span {
          color: #c89b38;
        }

        .login-heading h1 {
          margin: 0;
          color: #24211c;
          font-size: 28px;
          line-height: 1.15;
          font-weight: 850;
          letter-spacing: -0.8px;
        }

        .login-heading p {
          margin: 6px 0 0;
          color: #8b8479;
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
          margin-bottom: 19px;
          padding: 11px 12px;
          border-radius: 12px;
          animation: messageEnter 0.25s ease both;
        }

        .message-error {
          border: 1px solid #efd2d0;
          background: #fff7f6;
          color: #a5413c;
        }

        .message-success {
          border: 1px solid #d3e8d8;
          background: #f5fbf6;
          color: #317344;
        }

        .message-symbol {
          width: 28px;
          height: 28px;
          flex: 0 0 28px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.75);
        }

        .message-content {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .message-content strong {
          font-size: 11px;
          font-weight: 800;
        }

        .message-content span {
          font-size: 10px;
          line-height: 1.45;
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

        .field label {
          color: #454037;
          font-size: 11px;
          font-weight: 780;
        }

        .field-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .forgot-link {
          color: #a1781f;
          font-size: 10px;
          font-weight: 750;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .forgot-link:hover {
          color: #765714;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .forgot-link:focus-visible {
          outline: 2px solid
            rgba(198, 150, 36, 0.35);
          outline-offset: 3px;
          border-radius: 3px;
        }

        /* =====================================================
           INPUT
        ====================================================== */

        .input-box {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          height: 51px;
          border: 1px solid #ddd6ca;
          border-radius: 12px;
          background: #fff;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease,
            background 0.2s ease;
        }

        .input-box:hover {
          border-color: #cec4b3;
          background: #fffefa;
        }

        .input-box:focus-within {
          border-color: #c59a3b;
          background: #fff;
          box-shadow:
            0 0 0 3px
              rgba(197, 154, 59, 0.11),
            0 6px 18px
              rgba(72, 54, 23, 0.045);
          transform: translateY(-1px);
        }

        .input-leading {
          width: 46px;
          height: 100%;
          flex: 0 0 46px;
          display: grid;
          place-items: center;
          color: #a69d90;
          transition: color 0.2s ease;
        }

        .input-box:focus-within
          .input-leading {
          color: #b28320;
        }

        .input-box input {
          min-width: 0;
          flex: 1;
          height: 100%;
          border: 0;
          outline: 0;
          padding: 0 12px 0 0;
          color: #28251f;
          background: transparent;
          font-size: 12px;
        }

        .input-box input::placeholder {
          color: #aaa398;
        }

        .input-box input:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .password-toggle {
          width: 45px;
          height: 45px;
          margin-right: 3px;
          flex: 0 0 45px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #8f887d;
          cursor: pointer;
          transition:
            color 0.2s ease,
            background 0.2s ease;
        }

        .password-toggle:hover {
          color: #9d741d;
          background: #fff7e5;
        }

        .password-toggle:focus-visible {
          outline: 2px solid
            rgba(194, 149, 44, 0.4);
          outline-offset: -2px;
        }

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        /* =====================================================
           REMEMBER
        ====================================================== */

        .remember-row {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .remember-row input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .checkbox {
          width: 17px;
          height: 17px;
          display: grid;
          place-items: center;
          border: 1px solid #d1c8b8;
          border-radius: 5px;
          background: #fff;
          color: white;
          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .checkbox span {
          opacity: 0;
          transform: scale(0.6);
          font-size: 10px;
          font-weight: 900;
          transition:
            opacity 0.16s ease,
            transform 0.16s ease;
        }

        .remember-row input:checked
          + .checkbox {
          border-color: #c39736;
          background: #c39736;
          box-shadow:
            0 3px 9px
              rgba(180, 135, 35, 0.18);
        }

        .remember-row input:checked
          + .checkbox span {
          opacity: 1;
          transform: scale(1);
        }

        .remember-row input:focus-visible
          + .checkbox {
          outline: 3px solid
            rgba(195, 151, 54, 0.2);
          outline-offset: 2px;
        }

        .remember-text {
          color: #777065;
          font-size: 10px;
          font-weight: 600;
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
          gap: 10px;
          overflow: hidden;
          border: 1px solid #b8872d;
          border-radius: 12px;
          background:
            linear-gradient(
              135deg,
              #c99d40,
              #b8872d
            );
          color: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: 820;
          box-shadow:
            0 9px 22px
              rgba(166, 122, 29, 0.2);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            filter 0.2s ease;
        }

        .login-button::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              110deg,
              transparent 25%,
              rgba(255, 255, 255, 0.2) 50%,
              transparent 75%
            );
          transform: translateX(-120%);
          transition: transform 0.65s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 13px 28px
              rgba(166, 122, 29, 0.25);
          filter: saturate(1.04);
        }

        .login-button:hover:not(:disabled)::before {
          transform: translateX(120%);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:focus-visible {
          outline: 3px solid
            rgba(195, 151, 54, 0.24);
          outline-offset: 3px;
        }

        .login-button:disabled {
          cursor: not-allowed;
          opacity: 0.75;
          box-shadow: none;
        }

        .login-button > span {
          position: relative;
          z-index: 1;
        }

        .login-button-arrow {
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: rgba(
            255,
            255,
            255,
            0.16
          );
        }

        .spinner {
          animation: spin 0.9s linear infinite;
        }

        /* =====================================================
           REGISTER
        ====================================================== */

        .register-section {
          margin-top: 24px;
        }

        .register-divider {
          position: relative;
          display: flex;
          justify-content: center;
          margin-bottom: 14px;
        }

        .register-divider::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #eee8dc;
        }

        .register-divider span {
          position: relative;
          padding: 0 11px;
          background: white;
          color: #aaa398;
          font-size: 9px;
          font-weight: 600;
        }

        .register-button {
          min-height: 47px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #e1d8c9;
          border-radius: 11px;
          background: #fff;
          color: #514b42;
          text-decoration: none;
          font-size: 11px;
          font-weight: 750;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .register-button:hover {
          border-color: #cfae5d;
          background: #fffaf0;
          color: #8b671b;
          transform: translateY(-1px);
        }

        .register-button:focus-visible {
          outline: 3px solid
            rgba(198, 150, 36, 0.18);
          outline-offset: 3px;
        }

        /* =====================================================
           SECURITY
        ====================================================== */

        .security-box {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 18px;
          padding: 11px 12px;
          border: 1px solid #eee7da;
          border-radius: 11px;
          background: #fcfaf6;
        }

        .security-check {
          width: 29px;
          height: 29px;
          flex: 0 0 29px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #f3e7c8;
          color: #9a711b;
        }

        .security-box strong,
        .security-box span {
          display: block;
        }

        .security-box strong {
          margin-bottom: 2px;
          color: #555046;
          font-size: 10px;
          font-weight: 800;
        }

        .security-box span {
          color: #989187;
          font-size: 9px;
          line-height: 1.4;
        }

        /* =====================================================
           BOTTOM
        ====================================================== */

        .bottom-note {
          width: 100%;
          margin-top: 17px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #aaa398;
          font-size: 9px;
          animation: fadeUp 0.55s 0.25s ease both;
        }

        .bottom-brand {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #a58a4c;
          font-weight: 650;
        }

        .copyright {
          color: #aaa398;
        }

        /* =====================================================
           ANIMATIONS
        ====================================================== */

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

        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes messageEnter {
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

        @media (max-width: 760px) {
          .header-inner {
            width: min(
              100% - 32px,
              560px
            );
            min-height: 70px;
          }

          .login-main {
            min-height: calc(100vh - 70px);
            min-height: calc(100dvh - 70px);
            padding: 25px 16px 25px;
          }

          .trust-strip {
            grid-template-columns:
              1fr 1fr 1fr;
            gap: 8px;
            padding: 10px;
          }

          .trust-divider {
            display: none;
          }

          .trust-item {
            justify-content: center;
          }

          .trust-item strong,
          .trust-item span {
            text-align: left;
          }

          .login-card {
            padding: 32px 30px 28px;
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

          .header-question {
            display: none;
          }

          .header-register {
            min-height: 34px;
            padding: 0 11px;
            font-size: 10px;
          }

          .login-main {
            min-height: calc(100vh - 64px);
            min-height: calc(100dvh - 64px);
            padding: 15px 10px 20px;
          }

          .trust-strip {
            margin-bottom: 11px;
            padding: 9px 6px;
            border-radius: 12px;
            gap: 4px;
          }

          .trust-item {
            gap: 6px;
          }

          .trust-icon {
            width: 27px;
            height: 27px;
            flex-basis: 27px;
            border-radius: 8px;
          }

          .trust-item strong {
            font-size: 8px;
          }

          .trust-item span {
            margin-top: 1px;
            font-size: 7px;
          }

          .login-card {
            padding: 28px 18px 23px;
            border-radius: 19px;
          }

          .login-card::before {
            margin-top: -28px;
            margin-bottom: 23px;
          }

          .login-heading {
            gap: 11px;
            margin-bottom: 23px;
          }

          .heading-icon {
            width: 38px;
            height: 38px;
            flex-basis: 38px;
            border-radius: 11px;
          }

          .heading-label {
            font-size: 8px;
            letter-spacing: 1.2px;
          }

          .login-heading h1 {
            font-size: 24px;
            letter-spacing: -0.6px;
          }

          .login-heading p {
            margin-top: 5px;
            font-size: 10px;
          }

          .message {
            margin-bottom: 15px;
            padding: 9px;
          }

          .message-symbol {
            width: 26px;
            height: 26px;
            flex-basis: 26px;
          }

          .message-content strong {
            font-size: 10px;
          }

          .message-content span {
            font-size: 9px;
          }

          .login-form {
            gap: 16px;
          }

          .field {
            gap: 7px;
          }

          .field label {
            font-size: 10px;
          }

          .forgot-link {
            font-size: 9px;
          }

          .input-box {
            height: 49px;
            border-radius: 11px;
          }

          .input-leading {
            width: 43px;
            flex-basis: 43px;
          }

          .input-box input {
            font-size: 11px;
          }

          .password-toggle {
            width: 43px;
            flex-basis: 43px;
          }

          .remember-text {
            font-size: 9px;
          }

          .login-button {
            min-height: 50px;
            border-radius: 11px;
            font-size: 11px;
          }

          .register-section {
            margin-top: 20px;
          }

          .register-button {
            min-height: 44px;
            font-size: 10px;
          }

          .security-box {
            margin-top: 14px;
            padding: 9px 10px;
          }

          .security-check {
            width: 27px;
            height: 27px;
            flex-basis: 27px;
          }

          .security-box strong {
            font-size: 9px;
          }

          .security-box span {
            font-size: 8px;
          }

          .bottom-note {
            margin-top: 12px;
            padding: 0 3px;
            font-size: 8px;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ====================================================== */

        @media (max-width: 380px) {
          .header-register {
            padding: 0 9px;
          }

          .trust-strip {
            padding: 8px 4px;
          }

          .trust-icon {
            width: 24px;
            height: 24px;
            flex-basis: 24px;
          }

          .trust-item strong {
            font-size: 7px;
          }

          .trust-item span {
            display: none;
          }

          .login-card {
            padding: 25px 15px 20px;
          }

          .login-heading h1 {
            font-size: 22px;
          }

          .login-heading p {
            max-width: 210px;
          }

          .input-box {
            height: 47px;
          }

          .login-button {
            min-height: 48px;
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
