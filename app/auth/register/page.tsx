"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Check,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

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

  const passwordChecks = {
    length: password.length >= 6,
    letter: /[A-Za-z]/.test(password),
    number: /\d/.test(password),
  };

  const passwordScore = Object.values(passwordChecks).filter(Boolean)
    .length;

  const passwordStrength =
    passwordScore === 0
      ? ""
      : passwordScore === 1
        ? "Weak"
        : passwordScore === 2
          ? "Good"
          : "Strong";

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
      {/* Decorative background */}
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <div className="grid-pattern" />

      <div className="register-wrapper">
        {/* =====================================================
            LEFT SHOWCASE
        ====================================================== */}

        <section className="register-showcase">
          <Link href="/" className="logo-link">
            <div className="logo-box">
              <Image
                src="/logo.png"
                alt="PrimeCart"
                width={145}
                height={45}
                priority
              />
            </div>
          </Link>

          <div className="showcase-content">
            <div className="eyebrow">
              <Sparkles size={14} />
              <span>WELCOME TO PRIMECART</span>
            </div>

            <h1>
              Your shopping.
              <br />
              <span>One smart account.</span>
            </h1>

            <p>
              Create your PrimeCart account and unlock a
              smoother, smarter and more personalized
              shopping experience.
            </p>

            <div className="benefits">
              <div className="benefit">
                <div className="benefit-icon">
                  <Check size={17} />
                </div>

                <div>
                  <strong>Personalized experience</strong>
                  <span>
                    Keep your shopping experience organized
                    and tailored to you.
                  </span>
                </div>
              </div>

              <div className="benefit">
                <div className="benefit-icon">
                  <Check size={17} />
                </div>

                <div>
                  <strong>Exclusive shopping deals</strong>
                  <span>
                    Discover offers and products selected
                    for PrimeCart shoppers.
                  </span>
                </div>
              </div>

              <div className="benefit">
                <div className="benefit-icon">
                  <Check size={17} />
                </div>

                <div>
                  <strong>Secure account</strong>
                  <span>
                    Your account and authentication are
                    protected through Supabase Auth.
                  </span>
                </div>
              </div>
            </div>

            <div className="trust-row">
              <div className="trust-icon">
                <ShieldCheck size={19} />
              </div>

              <div>
                <strong>Secure & private</strong>
                <span>Your information stays protected.</span>
              </div>
            </div>
          </div>

          <div className="showcase-footer">
            <span>© 2026 PrimeCart</span>

            <span className="footer-dot" />

            <span>Smart shopping platform</span>
          </div>
        </section>

        {/* =====================================================
            REGISTER CARD
        ====================================================== */}

        <section className="register-section">
          <div className="register-card">
            {/* Mobile logo */}
            <div className="mobile-brand">
              <Link href="/" className="logo-link">
                <Image
                  src="/logo.png"
                  alt="PrimeCart"
                  width={150}
                  height={46}
                  priority
                />
              </Link>
            </div>

            {/* Header */}
            <div className="card-header">
              <div className="header-icon">
                <User size={22} />
              </div>

              <div>
                <div className="small-label">
                  GET STARTED
                </div>

                <h2>Create your account</h2>

                <p>
                  Join PrimeCart and start shopping smarter.
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="message error-message">
                <div className="message-icon">
                  <AlertCircle size={17} />
                </div>

                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="message success-message">
                <div className="message-icon">
                  <CheckCircle2 size={17} />
                </div>

                <div>
                  <strong>Account created</strong>
                  <span>{success}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleRegister}
              className="register-form"
            >
              {/* Name */}
              <div className="field">
                <label htmlFor="fullName">
                  Full name
                </label>

                <div className="input-wrapper">
                  <User
                    className="input-icon"
                    size={18}
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

                  {fullName.trim().length >= 2 && (
                    <Check
                      className="valid-icon"
                      size={17}
                    />
                  )}
                </div>
              </div>

              {/* Email */}
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
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    autoComplete="email"
                    disabled={loading}
                    required
                  />

                  {email.includes("@") && (
                    <Check
                      className="valid-icon"
                      size={17}
                    />
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="field">
                <div className="label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  {passwordStrength && (
                    <span
                      className={`strength ${passwordStrength
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {passwordStrength}
                    </span>
                  )}
                </div>

                <div className="input-wrapper">
                  <LockKeyhole
                    className="input-icon"
                    size={18}
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

                {password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1, 2, 3].map((bar) => (
                        <span
                          key={bar}
                          className={
                            bar <= passwordScore
                              ? "active"
                              : ""
                          }
                        />
                      ))}
                    </div>

                    <div className="password-rules">
                      <span
                        className={
                          passwordChecks.length
                            ? "valid"
                            : ""
                        }
                      >
                        <Check size={11} />
                        6+ characters
                      </span>

                      <span
                        className={
                          passwordChecks.letter
                            ? "valid"
                            : ""
                        }
                      >
                        <Check size={11} />
                        One letter
                      </span>

                      <span
                        className={
                          passwordChecks.number
                            ? "valid"
                            : ""
                        }
                      >
                        <Check size={11} />
                        One number
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="field">
                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <div className="input-wrapper">
                  <LockKeyhole
                    className="input-icon"
                    size={18}
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
                      setConfirmPassword(
                        e.target.value
                      )
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

                {confirmPassword && (
                  <div
                    className={`match-status ${
                      password === confirmPassword
                        ? "matched"
                        : "not-matched"
                    }`}
                  >
                    {password === confirmPassword ? (
                      <>
                        <Check size={13} />
                        Passwords match
                      </>
                    ) : (
                      "Passwords do not match"
                    )}
                  </div>
                )}
              </div>

              {/* Terms */}
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

              {/* Submit */}
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

            {/* Divider */}
            <div className="divider">
              <span>Already a member?</span>
            </div>

            {/* Login */}
            <div className="account-link">
              <span>Already have an account?</span>

              <Link href="/auth/login">
                Sign in
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Security */}
            <div className="security-note">
              <LockKeyhole size={13} />

              <span>
                Secure authentication powered by
                PrimeCart & Supabase
              </span>
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #faf8f3;
        }

        button,
        input {
          font: inherit;
        }

        .register-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 75% 10%,
              rgba(214, 167, 54, 0.08),
              transparent 30%
            ),
            #faf8f3;
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

        /* =====================================================
           BACKGROUND
        ====================================================== */

        .ambient {
          position: fixed;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(90px);
          z-index: 0;
          animation: floatAmbient 9s ease-in-out infinite;
        }

        .ambient-one {
          width: 340px;
          height: 340px;
          top: -180px;
          right: -80px;
          background: rgba(214, 167, 54, 0.18);
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
          width: 170px;
          height: 170px;
          top: 38%;
          left: 44%;
          background: rgba(220, 183, 92, 0.07);
          animation-delay: -6s;
        }

        @keyframes floatAmbient {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(0, 20px, 0);
          }
        }

        .grid-pattern {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.18;
          background-image:
            linear-gradient(
              rgba(180, 150, 90, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(180, 150, 90, 0.05) 1px,
              transparent 1px
            );
          background-size: 55px 55px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 75%
          );
        }

        /* =====================================================
           MAIN LAYOUT
        ====================================================== */

        .register-wrapper {
          position: relative;
          z-index: 1;
          width: min(1180px, calc(100% - 40px));
          min-height: 100vh;
          margin: auto;
          padding: 35px 0;
          display: grid;
          grid-template-columns: 1fr 0.86fr;
          gap: 75px;
          align-items: center;
        }

        /* =====================================================
           LOGO
        ====================================================== */

        .logo-link {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          text-decoration: none;
        }

        .logo-box {
          display: flex;
          align-items: center;
          min-height: 46px;
        }

        .logo-box img {
          width: auto;
          height: 44px;
          object-fit: contain;
        }

        /* =====================================================
           LEFT SHOWCASE
        ====================================================== */

        .register-showcase {
          min-height: 690px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px 10px;
          animation: showcaseIn 0.8s ease both;
        }

        @keyframes showcaseIn {
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
          max-width: 590px;
        }

        .eyebrow {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 13px;
          border: 1px solid rgba(198, 150, 36, 0.2);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.7);
          color: #89691d;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.8px;
          box-shadow: 0 8px 25px rgba(90, 70, 20, 0.04);
          margin-bottom: 23px;
        }

        .eyebrow svg {
          color: #c69624;
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
          font-size: 16px;
          line-height: 1.75;
        }

        .benefits {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .benefit {
          display: flex;
          align-items: center;
          gap: 14px;
          animation: benefitIn 0.7s ease both;
        }

        .benefit:nth-child(2) {
          animation-delay: 0.1s;
        }

        .benefit:nth-child(3) {
          animation-delay: 0.2s;
        }

        @keyframes benefitIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .benefit-icon {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: linear-gradient(
            145deg,
            #f7e9c3,
            #ead49d
          );
          color: #8b691b;
          box-shadow:
            inset 0 1px rgba(255, 255, 255, 0.7),
            0 8px 18px rgba(170, 130, 40, 0.08);
        }

        .benefit strong {
          display: block;
          margin-bottom: 3px;
          color: #29261f;
          font-size: 14px;
        }

        .benefit span {
          display: block;
          color: #898277;
          font-size: 12.5px;
          line-height: 1.5;
        }

        .trust-row {
          display: flex;
          align-items: center;
          gap: 11px;
          width: fit-content;
          margin-top: 35px;
          padding: 11px 14px;
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(218, 207, 184, 0.7);
        }

        .trust-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #f4e7c4;
          color: #98731e;
        }

        .trust-row strong {
          display: block;
          color: #4b463c;
          font-size: 12px;
        }

        .trust-row span {
          display: block;
          margin-top: 2px;
          color: #969085;
          font-size: 10px;
        }

        .showcase-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #999286;
          font-size: 11px;
        }

        .footer-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #c7bda9;
        }

        /* =====================================================
           REGISTER CARD
        ====================================================== */

        .register-section {
          display: flex;
          justify-content: center;
          animation: cardIn 0.85s cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(28px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .register-card {
          width: min(480px, 100%);
          padding: 39px 42px;
          position: relative;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid #e9e2d5;
          border-radius: 29px;
          box-shadow:
            0 35px 90px rgba(57, 46, 21, 0.09),
            0 10px 30px rgba(57, 46, 21, 0.045);
          backdrop-filter: blur(18px);
        }

        .register-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 8%;
          right: 8%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            #d7ad4d,
            transparent
          );
          opacity: 0.8;
        }

        .mobile-brand {
          display: none;
        }

        /* HEADER */

        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 25px;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: linear-gradient(
            145deg,
            #f8efd9,
            #f2dfae
          );
          color: #9a741d;
          box-shadow:
            inset 0 1px rgba(255, 255, 255, 0.8),
            0 8px 20px rgba(150, 110, 20, 0.08);
        }

        .small-label {
          margin-bottom: 4px;
          color: #b18a31;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 1.2px;
        }

        .card-header h2 {
          margin: 0;
          color: #1d1b17;
          font-size: 28px;
          line-height: 1.15;
          letter-spacing: -1px;
        }

        .card-header p {
          margin: 7px 0 0;
          color: #817b70;
          font-size: 13px;
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
          margin-bottom: 18px;
          border-radius: 13px;
          font-size: 12px;
          line-height: 1.5;
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
          color: #9a3d3d;
          background: #fff4f4;
          border: 1px solid #f1d5d5;
        }

        .success-message {
          color: #4b754a;
          background: #f2f9f0;
          border: 1px solid #d6e9d2;
        }

        .success-message strong {
          display: block;
          margin-bottom: 2px;
          font-size: 12px;
        }

        .success-message span {
          display: block;
        }

        /* =====================================================
           FORM
        ====================================================== */

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field label,
        .label-row label {
          color: #353129;
          font-size: 12.5px;
          font-weight: 750;
        }

        .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
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
          z-index: 1;
        }

        .input-wrapper input {
          width: 100%;
          height: 52px;
          padding: 0 46px;
          border: 1px solid #e3ddd2;
          border-radius: 13px;
          outline: none;
          background: #fff;
          color: #28251f;
          font-size: 13px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .input-wrapper input::placeholder {
          color: #b2aca2;
        }

        .input-wrapper input:hover:not(:disabled) {
          border-color: #d8cdbb;
        }

        .input-wrapper input:focus {
          border-color: #d0a039;
          box-shadow:
            0 0 0 4px rgba(208, 160, 57, 0.09),
            0 4px 12px rgba(80, 60, 20, 0.03);
        }

        .input-wrapper input:focus ~ .input-icon {
          color: #b88a22;
        }

        .input-wrapper input:disabled {
          background: #faf9f6;
          cursor: not-allowed;
        }

        .valid-icon {
          position: absolute;
          right: 15px;
          color: #60935e;
          pointer-events: none;
          animation: checkPop 0.2s ease both;
        }

        @keyframes checkPop {
          from {
            opacity: 0;
            transform: scale(0.7);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .password-toggle {
          position: absolute;
          right: 11px;
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 8px;
          padding: 0;
          background: transparent;
          color: #999286;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .password-toggle:hover:not(:disabled) {
          background: #f8f2e5;
          color: #9d761e;
        }

        /* =====================================================
           PASSWORD STRENGTH
        ====================================================== */

        .strength {
          font-size: 10px;
          font-weight: 800;
        }

        .strength.weak {
          color: #b65b5b;
        }

        .strength.good {
          color: #ad7c21;
        }

        .strength.strong {
          color: #588754;
        }

        .password-strength {
          margin-top: 2px;
        }

        .strength-bars {
          display: flex;
          gap: 4px;
          margin-bottom: 7px;
        }

        .strength-bars span {
          height: 3px;
          flex: 1;
          border-radius: 999px;
          background: #e9e4da;
          transition: 0.25s ease;
        }

        .strength-bars span.active {
          background: #c69624;
        }

        .password-rules {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 12px;
        }

        .password-rules span {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: #aaa398;
          font-size: 9.5px;
          transition: 0.2s ease;
        }

        .password-rules span.valid {
          color: #63875e;
        }

        .match-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
        }

        .match-status.matched {
          color: #60885c;
        }

        .match-status.not-matched {
          color: #a35a5a;
        }

        /* =====================================================
           TERMS
        ====================================================== */

        .terms {
          margin: -1px 0 0;
          color: #938c81;
          font-size: 10.5px;
          line-height: 1.6;
        }

        .terms a {
          color: #9e771e;
          font-weight: 750;
          text-decoration: none;
        }

        .terms a:hover {
          text-decoration: underline;
        }

        /* =====================================================
           BUTTON
        ====================================================== */

        .primary-button {
          width: 100%;
          height: 54px;
          position: relative;
          overflow: hidden;
          border: 0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          background: linear-gradient(
            135deg,
            #d3a238,
            #bd8c20
          );
          color: #fff;
          font-size: 13.5px;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 13px 28px rgba(198, 150, 36, 0.22);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            filter 0.2s ease;
        }

        .button-shine {
          position: absolute;
          top: 0;
          left: -80%;
          width: 45%;
          height: 100%;
          transform: skewX(-20deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.6s ease;
        }

        .primary-button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.03);
          box-shadow:
            0 17px 34px rgba(198, 150, 36, 0.28);
        }

        .primary-button:hover:not(:disabled)
          .button-shine {
          left: 130%;
        }

        .primary-button:active:not(:disabled) {
          transform: translateY(0);
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

        /* =====================================================
           BOTTOM
        ====================================================== */

        .divider {
          display: flex;
          align-items: center;
          gap: 13px;
          margin: 23px 0 17px;
          color: #b2aca2;
          font-size: 10px;
        }

        .divider::before,
        .divider::after {
          content: "";
          height: 1px;
          flex: 1;
          background: #eee9e0;
        }

        .account-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #817b70;
          font-size: 12.5px;
        }

        .account-link a {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: #9d761e;
          font-weight: 800;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .account-link a:hover {
          color: #795a13;
          gap: 6px;
        }

        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid #eee9e0;
          color: #aaa398;
          font-size: 9.5px;
        }

        /* =====================================================
           TABLET
        ====================================================== */

        @media (max-width: 950px) {
          .register-wrapper {
            width: min(650px, calc(100% - 32px));
            grid-template-columns: 1fr;
            gap: 0;
            padding: 25px 0;
          }

          .register-showcase {
            display: none;
          }

          .register-section {
            min-height: calc(100vh - 50px);
            align-items: center;
          }

          .register-card {
            width: 100%;
          }

          .mobile-brand {
            display: flex;
            justify-content: center;
            margin-bottom: 27px;
          }
        }

        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 520px) {
          .register-wrapper {
            width: calc(100% - 20px);
            padding: 10px 0;
          }

          .register-section {
            min-height: calc(100vh - 20px);
          }

          .register-card {
            padding: 27px 19px;
            border-radius: 23px;
          }

          .mobile-brand {
            margin-bottom: 23px;
          }

          .mobile-brand img {
            width: 135px;
            height: auto;
          }

          .card-header {
            gap: 12px;
          }

          .header-icon {
            width: 43px;
            height: 43px;
            border-radius: 13px;
          }

          .card-header h2 {
            font-size: 24px;
          }

          .card-header p {
            font-size: 12px;
          }

          .register-form {
            gap: 15px;
          }

          .input-wrapper input {
            height: 50px;
            font-size: 13px;
          }

          .primary-button {
            height: 52px;
          }

          .password-rules {
            gap: 6px 9px;
          }

          .terms {
            font-size: 10px;
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
