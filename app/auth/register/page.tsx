"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShoppingBag,
  User,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (cleanName.length < 2) {
      setError(
        "Full name must contain at least 2 characters."
      );
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please create a password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
            },
          },
        });

      if (signupError) {
        const message =
          signupError.message.toLowerCase();

        if (
          message.includes("already registered") ||
          message.includes("already been registered") ||
          message.includes("user already exists")
        ) {
          setError(
            "An account with this email already exists. Please sign in."
          );
        } else if (message.includes("password")) {
          setError(signupError.message);
        } else if (message.includes("email")) {
          setError(signupError.message);
        } else {
          setError(signupError.message);
        }

        return;
      }

      if (!data.user) {
        setError(
          "Account could not be created. Please try again."
        );
        return;
      }

      /*
       * Supabase may either:
       * 1. Return a user without a session when email
       *    confirmation is enabled.
       * 2. Return a session when confirmation is disabled.
       *
       * In both cases we send the user to login.
       */

      setSuccess(
        "Account created successfully! Please verify your email before logging in."
      );

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.replace("/auth/login");
      }, 2500);
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        "Something went wrong while creating your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <div className="register-wrapper">
        {/* LEFT */}

        <section className="register-showcase">
          <Link href="/" className="brand">
            <div className="brand-icon">
              <ShoppingBag size={21} />
            </div>

            <span>
              Prime<span>Cart</span>
            </span>
          </Link>

          <div className="showcase-content">
            <div className="mini-badge">
              <span className="badge-dot" />
              Your smarter shopping journey
            </div>

            <h1>
              One account.
              <br />
              <span>Endless possibilities.</span>
            </h1>

            <p>
              Create your PrimeCart account and discover
              smarter ways to shop, save and earn rewards.
            </p>

            <div className="benefits">
              <div className="benefit">
                <div className="benefit-icon">✓</div>

                <div>
                  <strong>
                    Personalized recommendations
                  </strong>

                  <span>
                    Discover products that fit your needs.
                  </span>
                </div>
              </div>

              <div className="benefit">
                <div className="benefit-icon">✓</div>

                <div>
                  <strong>Exclusive deals</strong>

                  <span>
                    Find smart offers and special deals.
                  </span>
                </div>
              </div>

              <div className="benefit">
                <div className="benefit-icon">✓</div>

                <div>
                  <strong>Earn PrimePoints</strong>

                  <span>
                    Get rewarded for your shopping activity.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="showcase-footer">
            <span>© 2026 PrimeCart</span>
            <span>Smart shopping platform</span>
          </div>
        </section>

        {/* RIGHT */}

        <section className="register-section">
          <div className="register-card">
            {/* MOBILE BRAND */}

            <div className="mobile-brand">
              <Link href="/" className="brand">
                <div className="brand-icon">
                  <ShoppingBag size={20} />
                </div>

                <span>
                  Prime<span>Cart</span>
                </span>
              </Link>
            </div>

            {/* HEADER */}

            <div className="card-header">
              <div className="welcome-icon">
                <User size={22} />
              </div>

              <h2>Create your account</h2>

              <p>
                Join PrimeCart and start shopping smarter.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div className="message error-message">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="message success-message">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleRegister}
              className="register-form"
            >
              {/* FULL NAME */}

              <div className="field">
                <label htmlFor="fullName">
                  Full name
                </label>

                <div className="input-wrapper">
                  <User
                    className="input-icon"
                    size={19}
                  />

                  <input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    autoComplete="name"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

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
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="field">
                <label htmlFor="password">
                  Password
                </label>

                <div className="input-wrapper">
                  <LockKeyhole
                    className="input-icon"
                    size={19}
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="new-password"
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
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                <span className="field-hint">
                  Use at least 6 characters.
                </span>
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="field">
                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <div className="input-wrapper">
                  <LockKeyhole
                    className="input-icon"
                    size={19}
                  />

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    autoComplete="new-password"
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* TERMS */}

              <p className="terms">
                By creating an account, you agree to
                PrimeCart&apos;s{" "}
                <Link href="/terms">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy">
                  Privacy Policy
                </Link>
                .
              </p>

              {/* BUTTON */}

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={20}
                      className="spin"
                    />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={19} />
                  </>
                )}
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="account-link">
              Already have an account?{" "}
              <Link href="/auth/login">
                Sign in
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

        .register-page {
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

        .background-glow {
          position: fixed;
          width: 350px;
          height: 350px;
          border-radius: 999px;
          filter: blur(90px);
          pointer-events: none;
          opacity: 0.4;
        }

        .glow-one {
          top: -170px;
          right: -80px;
          background: rgba(214, 167, 54, 0.2);
        }

        .glow-two {
          bottom: -170px;
          left: -100px;
          background: rgba(214, 167, 54, 0.13);
        }

        .register-wrapper {
          position: relative;
          z-index: 1;
          width: min(1180px, calc(100% - 40px));
          min-height: 100vh;
          margin: auto;
          padding: 32px 0;
          display: grid;
          grid-template-columns: 1fr 0.9fr;
          gap: 70px;
          align-items: center;
        }

        /* BRAND */

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

        /* LEFT */

        .register-showcase {
          min-height: 680px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px 10px;
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
          background: rgba(255, 255, 255, 0.7);
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
          box-shadow:
            0 0 0 5px rgba(210, 161, 50, 0.12);
        }

        .showcase-content h1 {
          margin: 0;
          font-size: clamp(46px, 5vw, 70px);
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

        .showcase-footer {
          display: flex;
          justify-content: space-between;
          max-width: 570px;
          color: #999286;
          font-size: 12px;
        }

        /* CARD */

        .register-section {
          display: flex;
          justify-content: center;
        }

        .register-card {
          width: min(470px, 100%);
          padding: 40px 42px;
          background: rgba(255, 255, 255, 0.96);
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
          margin-bottom: 25px;
        }

        .welcome-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          margin-bottom: 18px;
          border-radius: 15px;
          background: #f7edd4;
          color: #9b741e;
        }

        .card-header h2 {
          margin: 0;
          font-size: 30px;
          letter-spacing: -1px;
          color: #1d1b17;
        }

        .card-header p {
          margin: 9px 0 0;
          color: #817b70;
          font-size: 14px;
          line-height: 1.6;
        }

        /* MESSAGES */

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

        /* FORM */

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          color: #353129;
          font-size: 13px;
          font-weight: 700;
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
          height: 51px;
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

        .field-hint {
          color: #aaa398;
          font-size: 11px;
        }

        .terms {
          margin: 1px 0 0;
          color: #938c81;
          font-size: 11px;
          line-height: 1.6;
        }

        .terms a {
          color: #a2771d;
          font-weight: 700;
          text-decoration: none;
        }

        .terms a:hover {
          text-decoration: underline;
        }

        /* BUTTON */

        .primary-button {
          width: 100%;
          height: 53px;
          border: 0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 2px;
          background: #c69624;
          color: white;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 12px 24px rgba(198, 150, 36, 0.2);
          transition: 0.2s ease;
        }

        .primary-button:hover:not(:disabled) {
          transform: translateY(-1px);
          background: #b8881e;
          box-shadow:
            0 15px 30px rgba(198, 150, 36, 0.25);
        }

        .primary-button:disabled {
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

        /* BOTTOM */

        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 22px 0 19px;
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

        .account-link {
          text-align: center;
          color: #817b70;
          font-size: 13px;
        }

        .account-link a {
          color: #a2771d;
          font-weight: 800;
          text-decoration: none;
        }

        .account-link a:hover {
          text-decoration: underline;
        }

        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 24px;
          padding-top: 19px;
          border-top: 1px solid #eee9e0;
          color: #aaa398;
          font-size: 11px;
        }

        /* TABLET */

        @media (max-width: 900px) {
          .register-wrapper {
            width: min(650px, calc(100% - 32px));
            grid-template-columns: 1fr;
            gap: 0;
            padding: 24px 0;
          }

          .register-showcase {
            display: none;
          }

          .register-section {
            min-height: calc(100vh - 48px);
            align-items: center;
          }

          .register-card {
            width: 100%;
          }

          .mobile-brand {
            display: flex;
            justify-content: center;
            margin-bottom: 28px;
          }
        }

        /* MOBILE */

        @media (max-width: 520px) {
          .register-wrapper {
            width: calc(100% - 24px);
            padding: 12px 0;
          }

          .register-section {
            min-height: calc(100vh - 24px);
          }

          .register-card {
            padding: 27px 20px;
            border-radius: 22px;
          }

          .mobile-brand {
            margin-bottom: 24px;
          }

          .card-header h2 {
            font-size: 26px;
          }

          .card-header p {
            font-size: 13px;
          }

          .welcome-icon {
            width: 44px;
            height: 44px;
            margin-bottom: 15px;
          }

          .input-wrapper input {
            height: 50px;
          }

          .primary-button {
            height: 52px;
          }

          .terms {
            font-size: 10.5px;
          }
        }
      `}</style>
    </main>
  );
}
