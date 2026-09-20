"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/dashboard";

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

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (loginError) {
        const message = loginError.message.toLowerCase();

        if (
          message.includes("email not confirmed") ||
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

        return;
      }

      setSuccess("Login successful! Redirecting...");

      // Small delay so user can see success message
      setTimeout(() => {
        window.location.replace(next);
      }, 500);
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-background">
        <div className="glow glow-one" />
        <div className="glow glow-two" />
      </div>

      <div className="login-wrapper">
        {/* LEFT SIDE */}
        <section className="login-showcase">
          <Link href="/" className="brand">
            <div className="brand-icon">
              <ShoppingBag size={21} strokeWidth={2.4} />
            </div>

            <span>
              Prime<span>Cart</span>
            </span>
          </Link>

          <div className="showcase-content">
            <div className="mini-badge">
              <span className="badge-dot" />
              Smart shopping starts here
            </div>

            <h1>
              Shop smarter.
              <br />
              <span>Live better.</span>
            </h1>

            <p>
              Discover products that actually match your
              needs, budget and lifestyle with PrimeCart.
            </p>

            <div className="benefits">
              <div className="benefit">
                <div className="benefit-icon">
                  ✓
                </div>
                <div>
                  <strong>Personalized shopping</strong>
                  <span>
                    Find products based on what you need.
                  </span>
                </div>
              </div>

              <div className="benefit">
                <div className="benefit-icon">
                  ✓
                </div>
                <div>
                  <strong>Smart deals</strong>
                  <span>
                    Get better value without endless searching.
                  </span>
                </div>
              </div>

              <div className="benefit">
                <div className="benefit-icon">
                  ✓
                </div>
                <div>
                  <strong>PrimePoints rewards</strong>
                  <span>
                    Earn rewards while you shop.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="showcase-bottom">
            <span>© 2026 PrimeCart</span>
            <span>Smart shopping platform</span>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="login-card-section">
          <div className="login-card">
            <div className="mobile-brand">
              <Link href="/" className="brand">
                <div className="brand-icon">
                  <ShoppingBag
                    size={20}
                    strokeWidth={2.4}
                  />
                </div>

                <span>
                  Prime<span>Cart</span>
                </span>
              </Link>
            </div>

            <div className="card-header">
              <div className="welcome-icon">
                <LockKeyhole size={22} />
              </div>

              <h2>Welcome back</h2>

              <p>
                Sign in to continue your PrimeCart journey.
              </p>
            </div>

            {error && (
              <div className="message error-message">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="message success-message">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

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
                    size={19}
                  />

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="field">
                <div className="password-label">
                  <label htmlFor="password">
                    Password
                  </label>

                  <Link href="/auth/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <div className="input-wrapper">
                  <LockKeyhole
                    className="input-icon"
                    size={19}
                  />

                  <input
                    id="password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* REMEMBER ME */}
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

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={20}
                      className="spin"
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={19} />
                  </>
                )}
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="signup-text">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register">
                Create account
              </Link>
            </div>

            <div className="security-note">
              <LockKeyhole size={14} />
              <span>
                Your account information is securely
                protected.
              </span>
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #faf8f3;
        }

        .login-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #faf8f3;
          color: #171717;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .login-background {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .glow {
          position: absolute;
          border-radius: 999px;
          filter: blur(80px);
          opacity: 0.42;
        }

        .glow-one {
          width: 380px;
          height: 380px;
          top: -170px;
          right: -100px;
          background: rgba(214, 167, 54, 0.17);
        }

        .glow-two {
          width: 320px;
          height: 320px;
          bottom: -160px;
          left: -120px;
          background: rgba(214, 167, 54, 0.12);
        }

        .login-wrapper {
          position: relative;
          z-index: 1;
          width: min(1180px, calc(100% - 40px));
          min-height: 100vh;
          margin: 0 auto;
          padding: 32px 0;
          display: grid;
          grid-template-columns: 1fr 0.9fr;
          align-items: center;
          gap: 70px;
        }

        /* LEFT */

        .login-showcase {
          min-height: 680px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px 10px;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          width: fit-content;
          color: #171717;
          text-decoration: none;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.7px;
        }

        .brand > span > span {
          color: #c69624;
        }

        .brand-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #d8a735;
          color: white;
          box-shadow:
            0 10px 25px rgba(198, 150, 36, 0.22);
        }

        .showcase-content {
          max-width: 570px;
        }

        .mini-badge {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 14px;
          border: 1px solid rgba(198, 150, 36, 0.22);
          background: rgba(255, 255, 255, 0.65);
          border-radius: 999px;
          color: #7b5c15;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #d2a132;
          box-shadow: 0 0 0 5px rgba(210, 161, 50, 0.12);
        }

        .showcase-content h1 {
          margin: 0;
          font-size: clamp(48px, 5.2vw, 72px);
          line-height: 0.99;
          letter-spacing: -4px;
          font-weight: 850;
        }

        .showcase-content h1 span {
          color: #c69624;
        }

        .showcase-content > p {
          max-width: 510px;
          margin: 27px 0 38px;
          color: #6e6a61;
          font-size: 17px;
          line-height: 1.75;
        }

        .benefits {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .benefit {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .benefit-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #f0dfb4;
          color: #866316;
          font-size: 16px;
          font-weight: 900;
        }

        .benefit strong {
          display: block;
          margin-bottom: 3px;
          font-size: 14px;
          color: #26231d;
        }

        .benefit span {
          display: block;
          color: #888276;
          font-size: 13px;
        }

        .showcase-bottom {
          display: flex;
          justify-content: space-between;
          max-width: 570px;
          color: #999286;
          font-size: 12px;
        }

        /* CARD */

        .login-card-section {
          display: flex;
          justify-content: center;
        }

        .login-card {
          width: min(470px, 100%);
          padding: 42px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid #ebe5d8;
          border-radius: 28px;
          box-shadow:
            0 25px 70px rgba(51, 42, 22, 0.09),
            0 5px 18px rgba(51, 42, 22, 0.04);
        }

        .mobile-brand {
          display: none;
        }

        .card-header {
          margin-bottom: 28px;
        }

        .welcome-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          margin-bottom: 20px;
          border-radius: 15px;
          background: #f7edd4;
          color: #9b741e;
        }

        .card-header h2 {
          margin: 0;
          font-size: 31px;
          letter-spacing: -1px;
          color: #1d1b17;
        }

        .card-header p {
          margin: 9px 0 0;
          color: #817b70;
          font-size: 14px;
          line-height: 1.6;
        }

        .message {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          margin-bottom: 18px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.5;
        }

        .error-message {
          color: #9a3d3d;
          background: #fff1f1;
          border: 1px solid #f4d1d1;
        }

        .success-message {
          color: #487548;
          background: #f0f8ee;
          border: 1px solid #d6ead1;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label,
        .password-label label {
          color: #353129;
          font-size: 13px;
          font-weight: 700;
        }

        .password-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .password-label a {
          color: #a87c1b;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
        }

        .password-label a:hover {
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
        }

        .input-wrapper input {
          width: 100%;
          height: 52px;
          padding: 0 46px;
          border: 1px solid #e4dfd5;
          border-radius: 13px;
          outline: none;
          background: #fff;
          color: #28251f;
          font-size: 14px;
          transition: 0.2s ease;
        }

        .input-wrapper input::placeholder {
          color: #b2aca2;
        }

        .input-wrapper input:focus {
          border-color: #d0a039;
          box-shadow:
            0 0 0 4px rgba(208, 160, 57, 0.1);
        }

        .password-toggle {
          position: absolute;
          right: 13px;
          border: 0;
          padding: 5px;
          background: transparent;
          color: #999286;
          cursor: pointer;
          display: grid;
          place-items: center;
        }

        .password-toggle:hover {
          color: #a87c1b;
        }

        .form-options {
          margin-top: -3px;
        }

        .remember {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #777168;
          font-size: 13px;
          cursor: pointer;
          user-select: none;
        }

        .remember input {
          display: none;
        }

        .custom-checkbox {
          width: 17px;
          height: 17px;
          display: grid;
          place-items: center;
          border: 1px solid #d8d1c4;
          border-radius: 5px;
          background: #fff;
          color: #fff;
          font-size: 11px;
          font-weight: 900;
        }

        .remember input:checked + .custom-checkbox {
          border-color: #c69624;
          background: #c69624;
        }

        .login-button {
          width: 100%;
          height: 54px;
          border: 0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #c69624;
          color: white;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 12px 24px rgba(198, 150, 36, 0.2);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          background: #b8881e;
          box-shadow:
            0 15px 30px rgba(198, 150, 36, 0.25);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 25px 0 21px;
          color: #b2aca2;
          font-size: 12px;
        }

        .divider::before,
        .divider::after {
          content: "";
          height: 1px;
          flex: 1;
          background: #eee9e0;
        }

        .signup-text {
          text-align: center;
          color: #817b70;
          font-size: 13px;
        }

        .signup-text a {
          color: #a2771d;
          font-weight: 800;
          text-decoration: none;
        }

        .signup-text a:hover {
          text-decoration: underline;
        }

        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 26px;
          padding-top: 20px;
          border-top: 1px solid #eee9e0;
          color: #aaa398;
          font-size: 11px;
        }

        /* TABLET */

        @media (max-width: 900px) {
          .login-wrapper {
            width: min(650px, calc(100% - 32px));
            grid-template-columns: 1fr;
            gap: 0;
            padding: 24px 0;
          }

          .login-showcase {
            display: none;
          }

          .login-card-section {
            min-height: calc(100vh - 48px);
            align-items: center;
          }

          .login-card {
            width: 100%;
          }

          .mobile-brand {
            display: flex;
            justify-content: center;
            margin-bottom: 30px;
          }
        }

        /* MOBILE */

        @media (max-width: 520px) {
          .login-wrapper {
            width: calc(100% - 24px);
            padding: 12px 0;
          }

          .login-card-section {
            min-height: calc(100vh - 24px);
          }

          .login-card {
            padding: 28px 20px;
            border-radius: 22px;
          }

          .mobile-brand {
            margin-bottom: 25px;
          }

          .card-header h2 {
            font-size: 27px;
          }

          .card-header p {
            font-size: 13px;
          }

          .welcome-icon {
            width: 44px;
            height: 44px;
            margin-bottom: 16px;
          }

          .input-wrapper input {
            height: 50px;
          }

          .login-button {
            height: 52px;
          }
        }
      `}</style>
    </main>
  );
}
