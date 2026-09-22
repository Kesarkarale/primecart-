"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Loader2,
  ShoppingBag,
  UserRound,
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

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("primecart_saved_email");

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

    if (!cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem("primecart_saved_email", cleanEmail);
      } else {
        localStorage.removeItem("primecart_saved_email");
      }
    } catch {
      // Ignore localStorage errors
    }

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
          setError(
            "Please verify your email before logging in. Check your inbox for the verification email."
          );
        } else if (
          message.includes("invalid login credentials")
        ) {
          setError("Invalid email or password.");
        } else if (message.includes("too many requests")) {
          setError(
            "Too many login attempts. Please wait a moment and try again."
          );
        } else if (message.includes("network")) {
          setError(
            "Network error. Please check your internet connection and try again."
          );
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

      setSuccess("Login successful! Taking you to your dashboard...");

      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 650);
    } catch (err) {
      console.error("Login error:", err);

      setError(
        "Something went wrong while logging in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    setEmail("");
    setPassword("");
    setError("");
    setSuccess("");
  }

  return (
    <main className="login-page">
      {/* Background decoration */}
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grid-overlay" />

      <div className="page-shell">
        {/* TOP NAV */}
        <header className="top-nav">
          <Link href="/" className="logo-link">
            <div className="logo-box">
              <Image
                src="/logo.png"
                alt="PrimeCart"
                width={42}
                height={42}
                priority
                className="logo-image"
              />
            </div>

            <span className="logo-text">
              Prime<span>Cart</span>
            </span>
          </Link>

          <Link href="/" className="back-home">
            <ArrowLeft size={16} />
            <span>Back to home</span>
          </Link>
        </header>

        {/* MAIN */}
        <div className="login-layout">
          {/* LEFT SHOWCASE */}
          <section className="showcase">
            <div className="showcase-inner">
              <div className="eyebrow">
                <span className="eyebrow-icon">
                  <Sparkles size={14} />
                </span>

                <span>Welcome to smarter shopping</span>
              </div>

              <h1>
                Your shopping.
                <br />
                <span>Made simpler.</span>
              </h1>

              <p className="showcase-description">
                Sign in to discover products, manage your orders,
                save your favourites and enjoy a smoother PrimeCart
                experience.
              </p>

              {/* FEATURE CARDS */}
              <div className="feature-list">
                <div className="feature-card">
                  <div className="feature-icon">
                    <ShoppingBag size={19} />
                  </div>

                  <div>
                    <strong>Everything in one place</strong>
                    <span>
                      Browse products and categories without the hassle.
                    </span>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <strong>Secure shopping experience</strong>
                    <span>
                      Your account and shopping information stay protected.
                    </span>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <UserRound size={19} />
                  </div>

                  <div>
                    <strong>Your personalised account</strong>
                    <span>
                      Keep track of orders, wishlist and shopping activity.
                    </span>
                  </div>
                </div>
              </div>

              {/* TRUST STRIP */}
              <div className="trust-strip">
                <div className="trust-item">
                  <ShieldCheck size={17} />
                  <span>Secure account</span>
                </div>

                <div className="trust-divider" />

                <div className="trust-item">
                  <LockKeyhole size={17} />
                  <span>Protected login</span>
                </div>

                <div className="trust-divider" />

                <div className="trust-item">
                  <CheckCircle2 size={17} />
                  <span>Easy shopping</span>
                </div>
              </div>
            </div>

            <div className="showcase-footer">
              <span>© 2026 PrimeCart</span>
              <span>Smart shopping platform</span>
            </div>
          </section>

          {/* LOGIN SIDE */}
          <section className="login-area">
            <div className="login-card">
              {/* MOBILE LOGO */}
              <div className="mobile-logo">
                <Link href="/" className="logo-link">
                  <div className="logo-box">
                    <Image
                      src="/logo.png"
                      alt="PrimeCart"
                      width={40}
                      height={40}
                      priority
                      className="logo-image"
                    />
                  </div>

                  <span className="logo-text">
                    Prime<span>Cart</span>
                  </span>
                </Link>
              </div>

              {/* CARD HEADER */}
              <div className="card-header">
                <div className="login-icon">
                  <LockKeyhole size={22} />
                </div>

                <div className="header-copy">
                  <span className="small-label">
                    MEMBER LOGIN
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

                  <div className="message-content">
                    <strong>Login unsuccessful</strong>
                    <span>{error}</span>
                  </div>

                  <button
                    type="button"
                    className="message-close"
                    onClick={() => setError("")}
                    aria-label="Close error"
                  >
                    ×
                  </button>
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

                  <div className="message-content">
                    <strong>Welcome back!</strong>
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

                  <div className="input-wrapper">
                    <Mail
                      className="input-icon"
                      size={18}
                    />

                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
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

                  <div className="input-wrapper">
                    <LockKeyhole
                      className="input-icon"
                      size={18}
                    />

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
                        if (error) setError("");
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

                {/* OPTIONS */}
                <div className="form-options">
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
                      {rememberMe && "✓"}
                    </span>

                    <span>Remember me</span>
                  </label>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  <span className="button-content">
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
                        <ArrowRight size={19} />
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* RESET */}
              {!loading &&
                (email || password) && (
                  <button
                    type="button"
                    className="clear-button"
                    onClick={clearForm}
                  >
                    <RotateCcw size={13} />
                    Clear form
                  </button>
                )}

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
                <ArrowRight size={17} />
              </Link>

              {/* SECURITY */}
              <div className="security-box">
                <div className="security-icon">
                  <ShieldCheck size={16} />
                </div>

                <div>
                  <strong>Secure & private</strong>
                  <span>
                    Your login details are protected with secure
                    authentication.
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
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

        a {
          -webkit-tap-highlight-color: transparent;
        }

        /* ================================
           PAGE
        ================================= */

        .login-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 10% 15%,
              rgba(220, 177, 72, 0.08),
              transparent 28%
            ),
            radial-gradient(
              circle at 92% 85%,
              rgba(220, 177, 72, 0.07),
              transparent 28%
            ),
            #faf8f3;
          color: #1b1915;
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
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }

        .ambient-one {
          top: -250px;
          right: -160px;
          background: rgba(205, 157, 42, 0.14);
        }

        .ambient-two {
          bottom: -270px;
          left: -180px;
          background: rgba(205, 157, 42, 0.1);
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.25;
          pointer-events: none;
          background-image:
            linear-gradient(
              rgba(40, 35, 25, 0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(40, 35, 25, 0.025) 1px,
              transparent 1px
            );
          background-size: 48px 48px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 80%
          );
        }

        .page-shell {
          position: relative;
          z-index: 2;
          width: min(1240px, calc(100% - 48px));
          min-height: 100vh;
          margin: 0 auto;
          padding: 24px 0;
        }

        /* ================================
           NAV
        ================================= */

        .top-nav {
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #191713;
          text-decoration: none;
        }

        .logo-box {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
          border: 1px solid #e8dfce;
          box-shadow:
            0 8px 20px rgba(54, 44, 23, 0.08);
        }

        .logo-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .logo-text {
          font-size: 23px;
          font-weight: 850;
          letter-spacing: -0.8px;
        }

        .logo-text span {
          color: #c69624;
        }

        .back-home {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 13px;
          color: #746e63;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          border-radius: 10px;
          transition: 0.2s ease;
        }

        .back-home:hover {
          color: #9b741e;
          background: rgba(255, 255, 255, 0.7);
        }

        /* ================================
           LAYOUT
        ================================= */

        .login-layout {
          min-height: calc(100vh - 110px);
          display: grid;
          grid-template-columns: minmax(0, 1fr) 500px;
          gap: 90px;
          align-items: center;
        }

        /* ================================
           SHOWCASE
        ================================= */

        .showcase {
          min-height: 650px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px 0 28px;
        }

        .showcase-inner {
          max-width: 600px;
        }

        .eyebrow {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 13px;
          margin-bottom: 25px;
          border: 1px solid rgba(198, 150, 36, 0.2);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.72);
          color: #84651c;
          font-size: 12px;
          font-weight: 800;
        }

        .eyebrow-icon {
          width: 22px;
          height: 22px;
          display: grid;
          place-items: center;
          border-radius: 7px;
          background: #f3e4bd;
          color: #a77b19;
        }

        .showcase h1 {
          margin: 0;
          font-size: clamp(50px, 5.6vw, 78px);
          line-height: 0.98;
          letter-spacing: -5px;
          font-weight: 900;
        }

        .showcase h1 span {
          color: #c69624;
        }

        .showcase-description {
          max-width: 550px;
          margin: 28px 0 34px;
          color: #777167;
          font-size: 16px;
          line-height: 1.8;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 11px;
          max-width: 550px;
        }

        .feature-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 13px 14px;
          border: 1px solid rgba(227, 219, 204, 0.8);
          background: rgba(255, 255, 255, 0.54);
          border-radius: 15px;
          transition: 0.2s ease;
        }

        .feature-card:hover {
          transform: translateX(3px);
          border-color: #ddca9e;
          background: rgba(255, 255, 255, 0.8);
        }

        .feature-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #f5e8c8;
          color: #9a711b;
        }

        .feature-card strong {
          display: block;
          margin-bottom: 2px;
          color: #302c24;
          font-size: 13px;
          font-weight: 800;
        }

        .feature-card span {
          color: #8d877d;
          font-size: 12px;
          line-height: 1.4;
        }

        .trust-strip {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 34px;
          color: #8a8479;
          font-size: 11px;
          font-weight: 700;
        }

        .trust-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .trust-item svg {
          color: #b58a27;
        }

        .trust-divider {
          width: 1px;
          height: 15px;
          background: #ded7cb;
        }

        .showcase-footer {
          display: flex;
          justify-content: space-between;
          max-width: 600px;
          color: #a19b91;
          font-size: 11px;
        }

        /* ================================
           LOGIN CARD
        ================================= */

        .login-area {
          display: flex;
          justify-content: center;
        }

        .login-card {
          width: 100%;
          padding: 40px;
          border: 1px solid #e9e1d4;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow:
            0 35px 90px rgba(52, 43, 23, 0.1),
            0 8px 25px rgba(52, 43, 23, 0.045);
        }

        .mobile-logo {
          display: none;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 28px;
        }

        .login-icon {
          width: 49px;
          height: 49px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: #f5e8c8;
          color: #9c741d;
        }

        .small-label {
          display: block;
          margin-bottom: 5px;
          color: #ad8a3c;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .card-header h2 {
          margin: 0;
          color: #211e18;
          font-size: 30px;
          line-height: 1.1;
          letter-spacing: -1.2px;
        }

        .card-header p {
          margin: 7px 0 0;
          color: #817a6f;
          font-size: 13px;
          line-height: 1.55;
        }

        /* ================================
           MESSAGES
        ================================= */

        .message {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          margin-bottom: 18px;
          border-radius: 13px;
          font-size: 12px;
        }

        .message-icon {
          width: 29px;
          height: 29px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 9px;
        }

        .message-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          line-height: 1.45;
        }

        .message-content strong {
          font-size: 12px;
        }

        .message-content span {
          font-size: 11px;
        }

        .error-message {
          color: #8d3d3d;
          background: #fff4f3;
          border: 1px solid #f0d7d4;
        }

        .error-message .message-icon {
          background: #f8dfdc;
        }

        .success-message {
          color: #3f7243;
          background: #f2f9ef;
          border: 1px solid #d7ead3;
        }

        .success-message .message-icon {
          background: #dfefdb;
        }

        .message-close {
          border: 0;
          padding: 2px 4px;
          background: transparent;
          color: inherit;
          font-size: 17px;
          line-height: 1;
          cursor: pointer;
          opacity: 0.65;
        }

        /* ================================
           FORM
        ================================= */

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
          color: #38342c;
          font-size: 12px;
          font-weight: 800;
        }

        .field-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .forgot-link {
          color: #a2771d;
          font-size: 11px;
          font-weight: 800;
          text-decoration: none;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 15px;
          color: #aaa296;
          pointer-events: none;
          transition: 0.2s ease;
        }

        .input-wrapper input {
          width: 100%;
          height: 52px;
          padding: 0 45px;
          border: 1px solid #e4ded4;
          border-radius: 13px;
          outline: none;
          background: #fff;
          color: #28251f;
          font-size: 13px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .input-wrapper input:hover {
          border-color: #d8cdbb;
        }

        .input-wrapper input:focus {
          border-color: #d0a039;
          background: #fffdfa;
          box-shadow:
            0 0 0 4px rgba(208, 160, 57, 0.1);
        }

        .input-wrapper:focus-within .input-icon {
          color: #b0821f;
        }

        .input-wrapper input::placeholder {
          color: #b6afa5;
        }

        .input-wrapper input:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .password-toggle {
          position: absolute;
          right: 11px;
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #999187;
          cursor: pointer;
        }

        .password-toggle:hover {
          color: #a4791e;
          background: #f8f2e6;
        }

        .password-toggle:disabled {
          cursor: not-allowed;
        }

        /* ================================
           REMEMBER
        ================================= */

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: -2px;
        }

        .remember {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #777067;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          user-select: none;
        }

        .remember input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .custom-checkbox {
          width: 17px;
          height: 17px;
          display: grid;
          place-items: center;
          border: 1px solid #d7d0c4;
          border-radius: 5px;
          background: #fff;
          color: #fff;
          font-size: 10px;
          font-weight: 900;
          transition: 0.18s ease;
        }

        .remember input:checked + .custom-checkbox {
          border-color: #c69624;
          background: #c69624;
        }

        /* ================================
           BUTTON
        ================================= */

        .login-button {
          position: relative;
          width: 100%;
          height: 54px;
          margin-top: 2px;
          overflow: hidden;
          border: 0;
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              #d2a53b 0%,
              #c18e20 100%
            );
          color: white;
          cursor: pointer;
          box-shadow:
            0 13px 26px rgba(181, 133, 31, 0.2);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            filter 0.2s ease;
        }

        .login-button::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            100deg,
            transparent 20%,
            rgba(255, 255, 255, 0.17),
            transparent 80%
          );
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .login-button:hover:not(:disabled)::before {
          transform: translateX(100%);
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.03);
          box-shadow:
            0 17px 32px rgba(181, 133, 31, 0.27);
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
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          font-size: 13px;
          font-weight: 850;
        }

        .spin {
          animation: spin 0.85s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ================================
           CLEAR
        ================================= */

        .clear-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          width: 100%;
          margin-top: 12px;
          border: 0;
          background: transparent;
          color: #a19a8e;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .clear-button:hover {
          color: #a07820;
        }

        /* ================================
           ACCOUNT
        ================================= */

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 25px 0 15px;
          color: #aaa298;
          font-size: 10px;
          font-weight: 600;
        }

        .divider::before,
        .divider::after {
          content: "";
          height: 1px;
          flex: 1;
          background: #eee9e1;
        }

        .create-account {
          width: 100%;
          min-height: 47px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #e4d9c5;
          border-radius: 12px;
          background: #fffdf9;
          color: #80601c;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .create-account:hover {
          border-color: #d6bd86;
          background: #fbf6ea;
          color: #9a721e;
        }

        /* ================================
           SECURITY
        ================================= */

        .security-box {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 22px;
          padding: 12px;
          border: 1px solid #eee9e0;
          border-radius: 12px;
          background: #fcfbf8;
        }

        .security-icon {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #f1e5c8;
          color: #99721f;
        }

        .security-box strong {
          display: block;
          margin-bottom: 2px;
          color: #514b40;
          font-size: 10px;
          font-weight: 850;
        }

        .security-box span {
          display: block;
          color: #999186;
          font-size: 9px;
          line-height: 1.4;
        }

        /* ================================
           TABLET
        ================================= */

        @media (max-width: 1050px) {
          .page-shell {
            width: min(920px, calc(100% - 36px));
          }

          .login-layout {
            grid-template-columns: minmax(0, 1fr) 430px;
            gap: 45px;
          }

          .showcase h1 {
            font-size: clamp(45px, 6vw, 65px);
          }
        }

        /* ================================
           MOBILE/TABLET
        ================================= */

        @media (max-width: 850px) {
          .page-shell {
            width: min(600px, calc(100% - 28px));
            padding: 15px 0 25px;
          }

          .top-nav {
            height: 55px;
          }

          .back-home span {
            display: none;
          }

          .back-home {
            width: 36px;
            height: 36px;
            justify-content: center;
            padding: 0;
            border: 1px solid #e9e1d4;
            background: rgba(255, 255, 255, 0.7);
          }

          .login-layout {
            min-height: calc(100vh - 70px);
            grid-template-columns: 1fr;
            gap: 0;
          }

          .showcase {
            display: none;
          }

          .login-area {
            width: 100%;
            min-height: calc(100vh - 70px);
            align-items: center;
          }

          .login-card {
            padding: 34px;
          }

          .mobile-logo {
            display: flex;
            justify-content: center;
            margin-bottom: 27px;
          }
        }

        /* ================================
           SMALL MOBILE
        ================================= */

        @media (max-width: 520px) {
          .page-shell {
            width: calc(100% - 20px);
            padding-top: 10px;
          }

          .logo-box {
            width: 38px;
            height: 38px;
            border-radius: 11px;
          }

          .logo-text {
            font-size: 20px;
          }

          .top-nav {
            height: 50px;
          }

          .login-layout,
          .login-area {
            min-height: calc(100vh - 60px);
          }

          .login-card {
            padding: 27px 19px;
            border-radius: 22px;
          }

          .mobile-logo {
            margin-bottom: 24px;
          }

          .card-header {
            gap: 12px;
            margin-bottom: 23px;
          }

          .login-icon {
            width: 44px;
            height: 44px;
            border-radius: 13px;
          }

          .card-header h2 {
            font-size: 27px;
          }

          .card-header p {
            font-size: 12px;
          }

          .input-wrapper input {
            height: 50px;
          }

          .login-button {
            height: 52px;
          }

          .security-box {
            margin-top: 19px;
          }
        }

        /* ================================
           VERY SMALL DEVICES
        ================================= */

        @media (max-width: 360px) {
          .login-card {
            padding: 24px 15px;
          }

          .card-header h2 {
            font-size: 24px;
          }

          .field-top {
            align-items: flex-start;
            gap: 8px;
          }

          .forgot-link {
            white-space: nowrap;
          }
        }

        /* ================================
           REDUCED MOTION
        ================================= */

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
