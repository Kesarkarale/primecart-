"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
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
      setError("Full name must contain at least 2 characters.");
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
      setError("Password must be at least 6 characters long.");
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
        const message = signupError.message.toLowerCase();

        if (
          message.includes("already registered") ||
          message.includes("already been registered") ||
          message.includes("user already exists")
        ) {
          setError(
            "An account with this email already exists. Please sign in."
          );
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

      setSuccess(
        "Account created successfully! Please verify your email before logging in."
      );

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2600);
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
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="register-container">
        {/* LEFT SIDE */}

        <section className="showcase">
          <Link href="/" className="brand">
            <div className="brand-mark">
              <ShoppingBag size={20} strokeWidth={2.4} />
            </div>

            <span className="brand-name">
              Prime<span>Cart</span>
            </span>
          </Link>

          <div className="showcase-content">
            <div className="eyebrow">
              <span />
              THE SMARTER WAY TO SHOP
            </div>

            <h1>
              Your shopping
              <br />
              <strong>starts here.</strong>
            </h1>

            <p>
              Create your PrimeCart account and enjoy a
              simpler, smarter and more personalized shopping
              experience.
            </p>

            <div className="feature-list">
              <div className="feature">
                <div className="feature-number">01</div>

                <div>
                  <h3>Discover better products</h3>
                  <p>
                    Explore products selected to make
                    shopping easier.
                  </p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-number">02</div>

                <div>
                  <h3>Save more every time</h3>
                  <p>
                    Find useful deals and better value in one
                    place.
                  </p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-number">03</div>

                <div>
                  <h3>One account, everything ready</h3>
                  <p>
                    Keep your orders, wishlist and shopping
                    journey together.
                  </p>
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

        <section className="form-area">
          <div className="register-card">
            {/* MOBILE BRAND */}

            <div className="mobile-brand">
              <Link href="/" className="brand">
                <div className="brand-mark">
                  <ShoppingBag
                    size={19}
                    strokeWidth={2.4}
                  />
                </div>

                <span className="brand-name">
                  Prime<span>Cart</span>
                </span>
              </Link>
            </div>

            {/* HEADER */}

            <div className="form-header">
              <span className="form-label">
                CREATE ACCOUNT
              </span>

              <h2>Welcome to PrimeCart</h2>

              <p>
                Create your account to start your smarter
                shopping journey.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div className="message error-message">
                <AlertCircle size={17} />

                <span>{error}</span>
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="message success-message">
                <CheckCircle2 size={17} />

                <span>{success}</span>
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleRegister}
              className="register-form"
            >
              {/* NAME */}

              <div className="field">
                <label htmlFor="fullName">Full name</label>

                <div className="input-box">
                  <User size={18} className="input-icon" />

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

                <div className="input-box">
                  <Mail size={18} className="input-icon" />

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
                <label htmlFor="password">Password</label>

                <div className="input-box">
                  <LockKeyhole
                    size={18}
                    className="input-icon"
                  />

                  <input
                    id="password"
                    type={
                      showPassword ? "text" : "password"
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
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <span className="hint">
                  Minimum 6 characters
                </span>
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="field">
                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <div className="input-box">
                  <LockKeyhole
                    size={18}
                    className="input-icon"
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
                    className="eye-button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
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

              {/* SUBMIT */}

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={19}
                      className="spin"
                    />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* LOGIN */}

            <div className="login-link">
              <span>Already have an account?</span>

              <Link href="/auth/login">
                Sign in
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* SECURITY */}

            <div className="security">
              <LockKeyhole size={13} />

              <span>
                Your information is securely protected.
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
        }

        body {
          background: #faf8f3;
        }

        .register-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              #faf8f3 0%,
              #fffdf9 52%,
              #f8f3e8 100%
            );
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

        /* AMBIENT */

        .ambient {
          position: fixed;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.45;
          animation: ambientFloat 9s ease-in-out infinite;
        }

        .ambient-one {
          width: 330px;
          height: 330px;
          top: -190px;
          right: -100px;
          background: rgba(211, 166, 61, 0.17);
        }

        .ambient-two {
          width: 300px;
          height: 300px;
          bottom: -180px;
          left: -120px;
          background: rgba(211, 166, 61, 0.1);
          animation-delay: -4s;
        }

        @keyframes ambientFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(0, 18px, 0);
          }
        }

        /* LAYOUT */

        .register-container {
          position: relative;
          z-index: 1;
          width: min(1180px, calc(100% - 48px));
          min-height: 100vh;
          margin: auto;
          padding: 35px 0;
          display: grid;
          grid-template-columns: 1fr 0.86fr;
          gap: 80px;
          align-items: center;
        }

        /* BRAND */

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          width: fit-content;
        }

        .brand-mark {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            #dcb24f,
            #c69624
          );
          color: #fff;
          box-shadow:
            0 10px 25px rgba(198, 150, 36, 0.2);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .brand:hover .brand-mark {
          transform: translateY(-2px) rotate(-3deg);
          box-shadow:
            0 14px 30px rgba(198, 150, 36, 0.28);
        }

        .brand-name {
          color: #171612;
          font-size: 24px;
          font-weight: 850;
          letter-spacing: -0.8px;
        }

        .brand-name span {
          color: #c69624;
        }

        /* LEFT */

        .showcase {
          min-height: 670px;
          padding: 22px 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          animation: revealLeft 0.75s ease both;
        }

        @keyframes revealLeft {
          from {
            opacity: 0;
            transform: translateX(-25px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .showcase-content {
          max-width: 580px;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 24px;
          color: #92701d;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 1.5px;
        }

        .eyebrow span {
          width: 24px;
          height: 1px;
          background: #c69624;
        }

        .showcase h1 {
          margin: 0;
          color: #1a1814;
          font-size: clamp(48px, 5.2vw, 72px);
          line-height: 0.99;
          letter-spacing: -4.5px;
          font-weight: 850;
        }

        .showcase h1 strong {
          color: #c69624;
          font-weight: 850;
        }

        .showcase-content > p {
          max-width: 510px;
          margin: 27px 0 38px;
          color: #777168;
          font-size: 16px;
          line-height: 1.75;
        }

        /* FEATURES */

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 21px;
        }

        .feature {
          display: grid;
          grid-template-columns: 42px 1fr;
          gap: 14px;
          align-items: start;
        }

        .feature-number {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border: 1px solid #e5d6ad;
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.65);
          color: #a67c20;
          font-size: 10px;
          font-weight: 850;
          transition:
            transform 0.25s ease,
            background 0.25s ease;
        }

        .feature:hover .feature-number {
          transform: translateX(4px);
          background: #f8efd9;
        }

        .feature h3 {
          margin: 1px 0 4px;
          color: #28251f;
          font-size: 14px;
          font-weight: 800;
        }

        .feature p {
          margin: 0;
          color: #928b80;
          font-size: 12px;
          line-height: 1.55;
        }

        .showcase-bottom {
          max-width: 580px;
          display: flex;
          justify-content: space-between;
          color: #a19a8e;
          font-size: 11px;
        }

        /* FORM AREA */

        .form-area {
          display: flex;
          justify-content: center;
          animation: revealRight 0.75s 0.08s ease both;
        }

        @keyframes revealRight {
          from {
            opacity: 0;
            transform: translateX(25px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .register-card {
          width: min(465px, 100%);
          padding: 39px 40px 31px;
          border: 1px solid rgba(224, 216, 201, 0.9);
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow:
            0 30px 80px rgba(55, 45, 26, 0.09),
            0 5px 20px rgba(55, 45, 26, 0.035);
          backdrop-filter: blur(14px);
        }

        .mobile-brand {
          display: none;
        }

        /* HEADER */

        .form-header {
          margin-bottom: 25px;
        }

        .form-label {
          display: block;
          margin-bottom: 9px;
          color: #b08320;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1.5px;
        }

        .form-header h2 {
          margin: 0;
          color: #211f1a;
          font-size: 29px;
          line-height: 1.15;
          letter-spacing: -1.1px;
        }

        .form-header p {
          max-width: 360px;
          margin: 9px 0 0;
          color: #888176;
          font-size: 13px;
          line-height: 1.6;
        }

        /* MESSAGES */

        .message {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 11px 13px;
          margin-bottom: 17px;
          border-radius: 11px;
          font-size: 12px;
          line-height: 1.5;
          animation: messageIn 0.3s ease both;
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

        .error-message {
          color: #974343;
          background: #fff5f5;
          border: 1px solid #efd7d7;
        }

        .success-message {
          color: #4c754c;
          background: #f3f9f0;
          border: 1px solid #d8ead2;
        }

        /* FORM */

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field label {
          color: #39352e;
          font-size: 12px;
          font-weight: 750;
        }

        .input-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: #aaa296;
          pointer-events: none;
          transition: color 0.2s ease;
        }

        .input-box input {
          width: 100%;
          height: 50px;
          padding: 0 45px;
          border: 1px solid #e4dfd5;
          border-radius: 12px;
          outline: none;
          background: #fff;
          color: #29261f;
          font-size: 13px;
          transition:
            border-color 0.22s ease,
            box-shadow 0.22s ease,
            transform 0.22s ease;
        }

        .input-box input::placeholder {
          color: #b5afa5;
        }

        .input-box:focus-within .input-icon {
          color: #b18321;
        }

        .input-box:focus-within input {
          border-color: #d2a43d;
          box-shadow:
            0 0 0 4px rgba(210, 164, 61, 0.09);
          transform: translateY(-1px);
        }

        .eye-button {
          position: absolute;
          right: 11px;
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #999187;
          cursor: pointer;
          transition:
            color 0.2s ease,
            background 0.2s ease;
        }

        .eye-button:hover {
          color: #9d751d;
          background: #faf4e6;
        }

        .hint {
          color: #aaa398;
          font-size: 10px;
        }

        /* TERMS */

        .terms {
          margin: -1px 0 0;
          color: #999187;
          font-size: 10.5px;
          line-height: 1.65;
        }

        .terms a {
          color: #9e751c;
          font-weight: 750;
          text-decoration: none;
        }

        .terms a:hover {
          text-decoration: underline;
        }

        /* BUTTON */

        .submit-button {
          width: 100%;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 2px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            #d5aa43,
            #c18f20
          );
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 11px 25px rgba(193, 143, 32, 0.2);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            filter 0.2s ease;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.03);
          box-shadow:
            0 15px 30px rgba(193, 143, 32, 0.27);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.68;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* LOGIN */

        .login-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin-top: 21px;
          color: #888176;
          font-size: 12px;
        }

        .login-link a {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #a1771c;
          font-weight: 800;
          text-decoration: none;
          transition: gap 0.2s ease;
        }

        .login-link a:hover {
          gap: 7px;
        }

        /* SECURITY */

        .security {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 21px;
          padding-top: 18px;
          border-top: 1px solid #eee9e0;
          color: #aaa399;
          font-size: 10px;
        }

        /* TABLET */

        @media (max-width: 900px) {
          .register-container {
            width: min(650px, calc(100% - 32px));
            grid-template-columns: 1fr;
            gap: 0;
            padding: 25px 0;
          }

          .showcase {
            display: none;
          }

          .form-area {
            min-height: calc(100vh - 50px);
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
          .register-container {
            width: calc(100% - 22px);
            padding: 11px 0;
          }

          .form-area {
            min-height: calc(100vh - 22px);
          }

          .register-card {
            padding: 27px 19px 23px;
            border-radius: 21px;
          }

          .mobile-brand {
            margin-bottom: 23px;
          }

          .brand-name {
            font-size: 22px;
          }

          .brand-mark {
            width: 39px;
            height: 39px;
            border-radius: 11px;
          }

          .form-header h2 {
            font-size: 25px;
          }

          .form-header p {
            font-size: 12px;
          }

          .input-box input {
            height: 49px;
          }

          .submit-button {
            height: 51px;
          }

          .login-link {
            font-size: 11.5px;
          }
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
