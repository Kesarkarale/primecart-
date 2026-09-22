"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password]
  );

  const passwordScore = Object.values(passwordChecks).filter(
    Boolean
  ).length;

  const passwordStrength =
    password.length === 0
      ? ""
      : passwordScore <= 1
        ? "Weak"
        : passwordScore <= 2
          ? "Medium"
          : passwordScore === 3
            ? "Good"
            : "Strong";

  const passwordStrengthClass =
    passwordStrength.toLowerCase();

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const passwordsDoNotMatch =
    confirmPassword.length > 0 &&
    password !== confirmPassword;

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
      }, 2800);
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        "Something went wrong while creating your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const benefits = [
    {
      icon: "✦",
      title: "Personalized shopping",
      text: "Discover products that fit your style and needs.",
    },
    {
      icon: "◇",
      title: "Exclusive deals",
      text: "Find smart offers and better value every day.",
    },
    {
      icon: "✓",
      title: "PrimePoints rewards",
      text: "Earn rewards while enjoying your shopping journey.",
    },
  ];

  return (
    <main className="register-page">
      {/* Background */}

      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <div className="grid-overlay" />

      <div className="floating-shape shape-one" />
      <div className="floating-shape shape-two" />

      <div className="register-wrapper">
        {/* ================= LEFT ================= */}

        <motion.section
          className="register-showcase"
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
        >
          {/* BRAND */}

          <motion.div
            className="brand-area"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Link href="/" className="brand">
              <div className="logo-wrap">
                <Image
                  src="/logo.png"
                  alt="PrimeCart"
                  width={48}
                  height={48}
                  priority
                  className="logo"
                />
              </div>

              <span className="brand-name">
                Prime<span>Cart</span>
              </span>
            </Link>
          </motion.div>

          <div className="showcase-content">
            <motion.div
              className="mini-badge"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles size={14} />
              <span>Your smarter shopping journey</span>
              <span className="live-dot" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              One account.
              <br />
              <span>Endless possibilities.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Create your PrimeCart account and unlock a
              smarter, simpler and more personalized way
              to shop.
            </motion.p>

            <div className="benefits">
              {benefits.map((benefit, index) => (
                <motion.div
                  className="benefit"
                  key={benefit.title}
                  initial={{
                    opacity: 0,
                    x: -20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.5 + index * 0.1,
                  }}
                  whileHover={{
                    x: 5,
                  }}
                >
                  <div className="benefit-icon">
                    {benefit.icon}
                  </div>

                  <div className="benefit-copy">
                    <strong>{benefit.title}</strong>
                    <span>{benefit.text}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="trust-row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
            >
              <div className="trust-icon">
                <ShieldCheck size={18} />
              </div>

              <div>
                <strong>Secure account protection</strong>
                <span>
                  Your personal information stays protected.
                </span>
              </div>
            </motion.div>
          </div>

          <div className="showcase-footer">
            <span>© 2026 PrimeCart</span>

            <div className="footer-links">
              <span>Smart shopping</span>
              <span>•</span>
              <span>Secure experience</span>
            </div>
          </div>
        </motion.section>

        {/* ================= RIGHT ================= */}

        <section className="register-section">
          <motion.div
            className="register-card"
            initial={{
              opacity: 0,
              y: 35,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.65,
              ease: "easeOut",
            }}
          >
            {/* MOBILE BRAND */}

            <div className="mobile-brand">
              <Link href="/" className="brand">
                <div className="logo-wrap">
                  <Image
                    src="/logo.png"
                    alt="PrimeCart"
                    width={44}
                    height={44}
                    priority
                    className="logo"
                  />
                </div>

                <span className="brand-name">
                  Prime<span>Cart</span>
                </span>
              </Link>
            </div>

            {/* HEADER */}

            <div className="card-header">
              <motion.div
                className="welcome-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.35,
                  type: "spring",
                  stiffness: 180,
                }}
              >
                <User size={21} />
              </motion.div>

              <h2>Create your account</h2>

              <p>
                Join PrimeCart and start shopping smarter.
              </p>
            </div>

            {/* MESSAGES */}

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  className="message error-message"
                  initial={{
                    opacity: 0,
                    y: -8,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    height: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                  }}
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  className="message success-message"
                  initial={{
                    opacity: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FORM */}

            <form
              onSubmit={handleRegister}
              className="register-form"
            >
              {/* NAME */}

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

              {/* PASSWORD */}

              <div className="field">
                <div className="label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  {passwordStrength && (
                    <span
                      className={`strength-label ${passwordStrengthClass}`}
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
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a strong password"
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

                {/* STRENGTH */}

                {password.length > 0 && (
                  <motion.div
                    className="password-strength"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="strength-bars">
                      {[1, 2, 3, 4].map((bar) => (
                        <span
                          key={bar}
                          className={
                            bar <= passwordScore
                              ? `active ${passwordStrengthClass}`
                              : ""
                          }
                        />
                      ))}
                    </div>

                    <span className="strength-text">
                      Password strength
                    </span>
                  </motion.div>
                )}

                {/* REQUIREMENTS */}

                {password.length > 0 && (
                  <motion.div
                    className="requirements"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                  >
                    <Requirement
                      active={passwordChecks.length}
                      text="At least 6 characters"
                    />

                    <Requirement
                      active={passwordChecks.uppercase}
                      text="One uppercase letter"
                    />

                    <Requirement
                      active={passwordChecks.number}
                      text="One number"
                    />

                    <Requirement
                      active={passwordChecks.special}
                      text="One special character"
                    />
                  </motion.div>
                )}
              </div>

              {/* CONFIRM */}

              <div className="field">
                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <div
                  className={`input-wrapper ${
                    passwordsMatch
                      ? "match-input"
                      : passwordsDoNotMatch
                        ? "error-input"
                        : ""
                  }`}
                >
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

                {passwordsMatch && (
                  <motion.span
                    className="match-message"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Check size={13} />
                    Passwords match
                  </motion.span>
                )}

                {passwordsDoNotMatch && (
                  <motion.span
                    className="not-match-message"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <X size={13} />
                    Passwords do not match
                  </motion.span>
                )}
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

              <motion.button
                type="submit"
                className="primary-button"
                disabled={loading}
                whileHover={
                  !loading
                    ? {
                        y: -2,
                        scale: 1.005,
                      }
                    : undefined
                }
                whileTap={
                  !loading
                    ? {
                        scale: 0.985,
                      }
                    : undefined
                }
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
              </motion.button>
            </form>

            {/* DIVIDER */}

            <div className="divider">
              <span>Already shopping with us?</span>
            </div>

            {/* LOGIN */}

            <div className="account-link">
              Already have an account?{" "}
              <Link href="/auth/login">
                Sign in
              </Link>
            </div>

            {/* SECURITY */}

            <div className="security-note">
              <div className="security-icon">
                <LockKeyhole size={13} />
              </div>

              <span>
                Secure authentication powered by
                PrimeCart
              </span>
            </div>
          </motion.div>
        </section>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          min-height: 100%;
        }

        body {
          background: #faf8f3;
        }

        button,
        input {
          font: inherit;
        }

        /* ================= PAGE ================= */

        .register-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 80% 15%,
              rgba(218, 177, 75, 0.1),
              transparent 27%
            ),
            radial-gradient(
              circle at 10% 85%,
              rgba(218, 177, 75, 0.08),
              transparent 28%
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

        /* ================= BACKGROUND ================= */

        .ambient {
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }

        .ambient-one {
          top: -210px;
          right: -100px;
          background: rgba(210, 164, 54, 0.18);
        }

        .ambient-two {
          bottom: -220px;
          left: -120px;
          background: rgba(210, 164, 54, 0.13);
        }

        .ambient-three {
          top: 40%;
          left: 42%;
          width: 200px;
          height: 200px;
          background: rgba(255, 221, 130, 0.08);
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.28;
          background-image:
            linear-gradient(
              rgba(180, 145, 70, 0.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(180, 145, 70, 0.045) 1px,
              transparent 1px
            );
          background-size: 55px 55px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 85%
          );
        }

        .floating-shape {
          position: absolute;
          border: 1px solid rgba(198, 150, 36, 0.11);
          border-radius: 50%;
          pointer-events: none;
          animation: floatShape 8s ease-in-out infinite;
        }

        .shape-one {
          width: 130px;
          height: 130px;
          top: 13%;
          left: 42%;
        }

        .shape-two {
          width: 85px;
          height: 85px;
          right: 7%;
          bottom: 10%;
          animation-delay: -3s;
        }

        @keyframes floatShape {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(0, -15px, 0);
          }
        }

        /* ================= WRAPPER ================= */

        .register-wrapper {
          position: relative;
          z-index: 2;
          width: min(1200px, calc(100% - 48px));
          min-height: 100vh;
          margin: auto;
          padding: 34px 0;
          display: grid;
          grid-template-columns: 1fr 0.82fr;
          gap: 72px;
          align-items: center;
        }

        /* ================= BRAND ================= */

        .brand-area {
          display: flex;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          color: #171717;
          text-decoration: none;
        }

        .logo-wrap {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 14px;
          background: #fff;
          border: 1px solid #eee4d0;
          box-shadow:
            0 9px 25px rgba(67, 51, 18, 0.09);
        }

        .logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .brand-name {
          font-size: 25px;
          font-weight: 850;
          letter-spacing: -0.9px;
        }

        .brand-name span {
          color: #c69624;
        }

        /* ================= LEFT ================= */

        .register-showcase {
          min-height: 700px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 25px 10px;
        }

        .showcase-content {
          max-width: 610px;
        }

        .mini-badge {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 13px;
          margin-bottom: 25px;
          border: 1px solid rgba(198, 150, 36, 0.22);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.72);
          color: #765815;
          font-size: 12px;
          font-weight: 750;
          box-shadow:
            0 8px 25px rgba(68, 52, 20, 0.04);
          backdrop-filter: blur(10px);
        }

        .mini-badge svg {
          color: #c69624;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #5f9a56;
          box-shadow:
            0 0 0 4px rgba(95, 154, 86, 0.1);
          animation: pulseDot 2s infinite;
        }

        @keyframes pulseDot {
          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.45;
          }
        }

        .showcase-content h1 {
          margin: 0;
          font-size: clamp(48px, 5.2vw, 76px);
          line-height: 0.98;
          letter-spacing: -4.5px;
          font-weight: 850;
        }

        .showcase-content h1 span {
          color: #c69624;
        }

        .showcase-content > p {
          max-width: 545px;
          margin: 28px 0 37px;
          color: #6f6a61;
          font-size: 16px;
          line-height: 1.75;
        }

        .benefits {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .benefit {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 13px 10px 8px;
          border-radius: 17px;
          transition:
            background 0.25s ease,
            box-shadow 0.25s ease;
        }

        .benefit:hover {
          background: rgba(255, 255, 255, 0.7);
          box-shadow:
            0 10px 30px rgba(57, 44, 18, 0.05);
        }

        .benefit-icon {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #f3e5bd;
          color: #886719;
          font-size: 15px;
          font-weight: 900;
          box-shadow:
            inset 0 0 0 1px rgba(198, 150, 36, 0.08);
        }

        .benefit-copy strong {
          display: block;
          margin-bottom: 3px;
          color: #27241e;
          font-size: 13px;
          font-weight: 800;
        }

        .benefit-copy span {
          color: #888176;
          font-size: 12px;
        }

        .trust-row {
          display: flex;
          align-items: center;
          gap: 11px;
          width: fit-content;
          margin-top: 32px;
          padding: 11px 14px;
          border: 1px solid #eee6d7;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.56);
        }

        .trust-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #edf6eb;
          color: #5b8556;
        }

        .trust-row strong {
          display: block;
          color: #3b3933;
          font-size: 12px;
        }

        .trust-row span {
          display: block;
          margin-top: 2px;
          color: #9b958a;
          font-size: 10px;
        }

        .showcase-footer {
          display: flex;
          justify-content: space-between;
          max-width: 590px;
          color: #a29b90;
          font-size: 11px;
        }

        .footer-links {
          display: flex;
          gap: 8px;
        }

        /* ================= CARD ================= */

        .register-section {
          display: flex;
          justify-content: center;
        }

        .register-card {
          width: min(475px, 100%);
          padding: 40px 42px;
          border: 1px solid rgba(226, 218, 201, 0.9);
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.93);
          box-shadow:
            0 35px 90px rgba(54, 42, 19, 0.1),
            0 8px 25px rgba(54, 42, 19, 0.045);
          backdrop-filter: blur(18px);
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
          margin-bottom: 17px;
          border-radius: 15px;
          background:
            linear-gradient(
              135deg,
              #f8edcf,
              #f2dfae
            );
          color: #99721d;
          box-shadow:
            0 9px 22px rgba(198, 150, 36, 0.1);
        }

        .card-header h2 {
          margin: 0;
          color: #1d1b17;
          font-size: 30px;
          line-height: 1.1;
          letter-spacing: -1.1px;
          font-weight: 850;
        }

        .card-header p {
          margin: 9px 0 0;
          color: #817a70;
          font-size: 13px;
          line-height: 1.6;
        }

        /* ================= MESSAGE ================= */

        .message {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 12px 13px;
          margin-bottom: 17px;
          border-radius: 13px;
          font-size: 12px;
          line-height: 1.5;
        }

        .message svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .error-message {
          color: #9a3d3d;
          background: #fff2f2;
          border: 1px solid #f3d2d2;
        }

        .success-message {
          color: #4b7848;
          background: #f0f8ee;
          border: 1px solid #d4e9d0;
        }

        /* ================= FORM ================= */

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
          color: #37332c;
          font-size: 12px;
          font-weight: 800;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 15px;
          color: #aaa398;
          pointer-events: none;
          z-index: 1;
        }

        .input-wrapper input {
          width: 100%;
          height: 51px;
          padding: 0 45px;
          border: 1px solid #e3ddd2;
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

        .input-wrapper input:hover:not(:disabled) {
          border-color: #d8cdb8;
        }

        .input-wrapper input:focus {
          border-color: #cda03b;
          background: #fffefa;
          box-shadow:
            0 0 0 4px rgba(205, 160, 59, 0.1);
        }

        .input-wrapper input::placeholder {
          color: #b2aca2;
        }

        .input-wrapper input:disabled {
          background: #f8f6f1;
          cursor: not-allowed;
        }

        .valid-icon {
          position: absolute;
          right: 14px;
          color: #5c9857;
        }

        .password-toggle {
          position: absolute;
          right: 11px;
          z-index: 2;
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          padding: 0;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #9b958b;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .password-toggle:hover {
          background: #f7f2e8;
          color: #9d751e;
        }

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        /* ================= STRENGTH ================= */

        .strength-label {
          font-size: 10px;
          font-weight: 800;
        }

        .strength-label.weak {
          color: #bd5757;
        }

        .strength-label.medium {
          color: #a47a24;
        }

        .strength-label.good {
          color: #718c3e;
        }

        .strength-label.strong {
          color: #4e8750;
        }

        .password-strength {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 2px;
        }

        .strength-bars {
          flex: 1;
          display: flex;
          gap: 4px;
        }

        .strength-bars span {
          height: 4px;
          flex: 1;
          border-radius: 999px;
          background: #e8e3d9;
          transition:
            background 0.25s ease,
            transform 0.25s ease;
        }

        .strength-bars span.active {
          transform: scaleY(1.15);
        }

        .strength-bars span.active.weak {
          background: #c86464;
        }

        .strength-bars span.active.medium {
          background: #c49a42;
        }

        .strength-bars span.active.good {
          background: #8b9e4b;
        }

        .strength-bars span.active.strong {
          background: #5d9758;
        }

        .strength-text {
          color: #9c958a;
          font-size: 9px;
          white-space: nowrap;
        }

        /* ================= REQUIREMENTS ================= */

        .requirements {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 8px;
          margin-top: 3px;
        }

        .requirement {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #a29b90;
          font-size: 9.5px;
        }

        .requirement.active {
          color: #568053;
        }

        .requirement-icon {
          width: 15px;
          height: 15px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f0ede7;
        }

        .requirement.active .requirement-icon {
          background: #e7f3e4;
        }

        /* ================= PASSWORD MATCH ================= */

        .match-input input {
          border-color: #8eb58a;
        }

        .error-input input {
          border-color: #d68b8b;
        }

        .match-message,
        .not-match-message {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
        }

        .match-message {
          color: #568053;
        }

        .not-match-message {
          color: #b95757;
        }

        /* ================= TERMS ================= */

        .terms {
          margin: -1px 0 0;
          color: #958e83;
          font-size: 10px;
          line-height: 1.65;
        }

        .terms a {
          color: #9e771f;
          font-weight: 750;
          text-decoration: none;
        }

        .terms a:hover {
          text-decoration: underline;
        }

        /* ================= BUTTON ================= */

        .primary-button {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 54px;
          margin-top: 1px;
          border: 0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          background:
            linear-gradient(
              135deg,
              #d2a13a,
              #b98720
            );
          color: white;
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
          box-shadow:
            0 14px 28px rgba(184, 135, 32, 0.22);
          transition:
            box-shadow 0.25s ease,
            opacity 0.25s ease;
        }

        .primary-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -120%;
          width: 80%;
          height: 100%;
          background: linear-gradient(
            100deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transform: skewX(-20deg);
          transition: left 0.65s ease;
        }

        .primary-button:hover:not(:disabled)::before {
          left: 140%;
        }

        .primary-button:hover:not(:disabled) {
          box-shadow:
            0 17px 34px rgba(184, 135, 32, 0.28);
        }

        .primary-button:disabled {
          opacity: 0.68;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 0.85s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ================= BOTTOM ================= */

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 23px 0 17px;
          color: #b1aa9f;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          white-space: nowrap;
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
          font-size: 12px;
        }

        .account-link a {
          color: #9f771f;
          font-weight: 850;
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
          margin-top: 23px;
          padding-top: 18px;
          border-top: 1px solid #eee9e0;
          color: #aaa398;
          font-size: 9.5px;
        }

        .security-icon {
          width: 22px;
          height: 22px;
          display: grid;
          place-items: center;
          border-radius: 7px;
          background: #f6f2e9;
          color: #9c792d;
        }

        /* ================= TABLET ================= */

        @media (max-width: 980px) {
          .register-wrapper {
            width: min(680px, calc(100% - 32px));
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

        /* ================= MOBILE ================= */

        @media (max-width: 540px) {
          .register-page {
            background:
              radial-gradient(
                circle at 80% 5%,
                rgba(218, 177, 75, 0.12),
                transparent 30%
              ),
              #faf8f3;
          }

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

          .brand-name {
            font-size: 23px;
          }

          .logo-wrap {
            width: 43px;
            height: 43px;
          }

          .card-header h2 {
            font-size: 26px;
          }

          .card-header p {
            font-size: 12px;
          }

          .welcome-icon {
            width: 44px;
            height: 44px;
          }

          .register-form {
            gap: 15px;
          }

          .input-wrapper input {
            height: 50px;
          }

          .primary-button {
            height: 52px;
          }

          .requirements {
            grid-template-columns: 1fr;
          }

          .terms {
            font-size: 9.5px;
          }

          .security-note {
            font-size: 9px;
          }
        }

        @media (max-width: 360px) {
          .register-wrapper {
            width: calc(100% - 14px);
          }

          .register-card {
            padding: 23px 15px;
          }

          .card-header h2 {
            font-size: 24px;
          }
        }

        /* ================= REDUCED MOTION ================= */

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

/* ================= PASSWORD REQUIREMENT ================= */

function Requirement({
  active,
  text,
}: {
  active: boolean;
  text: string;
}) {
  return (
    <div
      className={`requirement ${
        active ? "active" : ""
      }`}
    >
      <span className="requirement-icon">
        {active ? (
          <Check size={9} strokeWidth={3} />
        ) : (
          <span
            style={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "#aaa398",
            }}
          />
        )}
      </span>

      <span>{text}</span>
    </div>
  );
}
