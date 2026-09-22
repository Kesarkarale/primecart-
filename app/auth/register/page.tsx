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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const passwordLength = password.length >= 6;
  const passwordUppercase = /[A-Z]/.test(password);
  const passwordNumber = /\d/.test(password);
  const passwordSpecial = /[^A-Za-z0-9]/.test(password);

  const passwordScore = [
    passwordLength,
    passwordUppercase,
    passwordNumber,
    passwordSpecial,
  ].filter(Boolean).length;

  const passwordLabel =
    passwordScore <= 1
      ? "Weak password"
      : passwordScore === 2
        ? "Fair password"
        : passwordScore === 3
          ? "Good password"
          : "Strong password";

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

  return (
    <main className="register-page">
      <div className="page-grid" />

      <div className="register-shell">
        {/* LEFT SHOWCASE */}

        <motion.section
          className="showcase"
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* BRAND */}

          <motion.div
            className="brand-area"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <Link href="/" className="brand">
              <div className="logo-box">
                <Image
                  src="/logo.png"
                  alt="PrimeCart"
                  width={44}
                  height={44}
                  priority
                />
              </div>

              <div className="brand-name">
                Prime<span>Cart</span>
              </div>
            </Link>
          </motion.div>

          {/* SHOWCASE CONTENT */}

          <div className="showcase-content">
            <motion.div
              className="eyebrow"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <Sparkles size={14} />
              <span>THE SMARTER WAY TO SHOP</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              Your shopping.
              <br />
              <span>Your way.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
            >
              Create your PrimeCart account and unlock a
              simpler, smarter and more personalized shopping
              experience.
            </motion.p>

            {/* FEATURE CARDS */}

            <div className="feature-list">
              {[
                {
                  title: "Personalized experience",
                  text: "Discover products that match your style and needs.",
                  icon: "01",
                },
                {
                  title: "Exclusive savings",
                  text: "Find better deals and smarter ways to save.",
                  icon: "02",
                },
                {
                  title: "PrimePoints rewards",
                  text: "Shop more and unlock exciting rewards.",
                  icon: "03",
                },
              ].map((item, index) => (
                <motion.div
                  className="feature"
                  key={item.icon}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.55 + index * 0.1,
                    duration: 0.5,
                  }}
                  whileHover={{ x: 5 }}
                >
                  <div className="feature-number">
                    {item.icon}
                  </div>

                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* SHOWCASE FOOTER */}

          <div className="showcase-bottom">
            <div className="trusted">
              <ShieldCheck size={15} />
              <span>Secure & protected account</span>
            </div>

            <span className="copyright">
              © 2026 PrimeCart
            </span>
          </div>
        </motion.section>

        {/* RIGHT REGISTER */}

        <motion.section
          className="register-area"
          initial={{ opacity: 0, x: 35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="register-card">
            {/* MOBILE BRAND */}

            <motion.div
              className="mobile-brand"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href="/" className="brand">
                <div className="logo-box">
                  <Image
                    src="/logo.png"
                    alt="PrimeCart"
                    width={40}
                    height={40}
                  />
                </div>

                <div className="brand-name">
                  Prime<span>Cart</span>
                </div>
              </Link>
            </motion.div>

            {/* HEADER */}

            <motion.div
              className="form-header"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="header-icon">
                <User size={21} />
              </div>

              <div>
                <div className="header-label">
                  PRIME CART ACCOUNT
                </div>

                <h2>Create your account</h2>

                <p>
                  Join PrimeCart and start shopping smarter.
                </p>
              </div>
            </motion.div>

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
                    height: 0,
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
                    height: 0,
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

              <motion.div
                className="field"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label htmlFor="fullName">
                  Full name
                </label>

                <div className="input-wrapper">
                  <User
                    size={18}
                    className="input-icon"
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
                      size={17}
                      className="valid-icon"
                    />
                  )}
                </div>
              </motion.div>

              {/* EMAIL */}

              <motion.div
                className="field"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">
                  <Mail
                    size={18}
                    className="input-icon"
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
                      size={17}
                      className="valid-icon"
                    />
                  )}
                </div>
              </motion.div>

              {/* PASSWORD */}

              <motion.div
                className="field"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <div className="label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  {password.length > 0 && (
                    <span
                      className={`password-status strength-${passwordScore}`}
                    >
                      {passwordLabel}
                    </span>
                  )}
                </div>

                <div className="input-wrapper">
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

                {/* PASSWORD STRENGTH */}

                {password.length > 0 && (
                  <motion.div
                    className="strength-area"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="strength-bars">
                      {[1, 2, 3, 4].map((bar) => (
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
                          passwordLength ? "passed" : ""
                        }
                      >
                        6+ characters
                      </span>

                      <span
                        className={
                          passwordUppercase
                            ? "passed"
                            : ""
                        }
                      >
                        Uppercase
                      </span>

                      <span
                        className={
                          passwordNumber ? "passed" : ""
                        }
                      >
                        Number
                      </span>

                      <span
                        className={
                          passwordSpecial ? "passed" : ""
                        }
                      >
                        Symbol
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* CONFIRM PASSWORD */}

              <motion.div
                className="field"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <div className="input-wrapper">
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

                  {confirmPassword.length > 0 &&
                    password === confirmPassword && (
                      <Check
                        size={17}
                        className="valid-icon"
                      />
                    )}
                </div>

                {confirmPassword.length > 0 && (
                  <span
                    className={`match-text ${
                      password === confirmPassword
                        ? "matched"
                        : "not-matched"
                    }`}
                  >
                    {password === confirmPassword
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </span>
                )}
              </motion.div>

              {/* TERMS */}

              <motion.p
                className="terms"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
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
              </motion.p>

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
                    : {}
                }
                whileTap={
                  !loading
                    ? {
                        scale: 0.985,
                      }
                    : {}
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
              <span>ALREADY A MEMBER?</span>
            </div>

            {/* LOGIN */}

            <div className="account-link">
              <span>Already have an account?</span>

              <Link href="/auth/login">
                Sign in
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* SECURITY */}

            <div className="security-note">
              <ShieldCheck size={15} />

              <span>
                Your information is protected with secure
                authentication.
              </span>
            </div>
          </div>
        </motion.section>
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
          background:
            linear-gradient(
              135deg,
              #fffdf9 0%,
              #faf8f3 48%,
              #f7f1e5 100%
            );
          color: #1d1b17;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          overflow-x: hidden;
        }

        /* BACKGROUND GRID */

        .page-grid {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.38;
          background-image:
            linear-gradient(
              rgba(198, 150, 36, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(198, 150, 36, 0.035) 1px,
              transparent 1px
            );
          background-size: 42px 42px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 90%
          );
        }

        /* LAYOUT */

        .register-shell {
          position: relative;
          z-index: 1;
          width: min(1240px, calc(100% - 64px));
          min-height: 100vh;
          margin: 0 auto;
          padding: 42px 0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(
              420px,
              500px
            );
          gap: 80px;
          align-items: center;
        }

        /* SHOWCASE */

        .showcase {
          min-height: 680px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 15px 0;
        }

        /* BRAND */

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          width: fit-content;
          text-decoration: none;
          color: #171612;
        }

        .logo-box {
          width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 13px;
          background: #fff;
          border: 1px solid #eadfc9;
          box-shadow:
            0 8px 25px rgba(73, 56, 20, 0.08);
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .logo-box img {
          object-fit: contain;
        }

        .brand:hover .logo-box {
          transform: translateY(-2px) rotate(-2deg);
          box-shadow:
            0 12px 30px rgba(73, 56, 20, 0.13);
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

        /* CONTENT */

        .showcase-content {
          max-width: 650px;
        }

        .eyebrow {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid #eadfc8;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.7);
          color: #96701c;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1.4px;
          margin-bottom: 25px;
          box-shadow:
            0 5px 20px rgba(78, 60, 23, 0.04);
        }

        .showcase h1 {
          margin: 0;
          font-size: clamp(52px, 6vw, 82px);
          line-height: 0.96;
          letter-spacing: -5px;
          font-weight: 900;
          color: #171612;
        }

        .showcase h1 span {
          color: #c69624;
        }

        .showcase-content > p {
          max-width: 570px;
          margin: 27px 0 42px;
          color: #777166;
          font-size: 16px;
          line-height: 1.8;
        }

        /* FEATURES */

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 13px;
          max-width: 570px;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px 14px;
          border: 1px solid transparent;
          border-radius: 15px;
          transition:
            background 0.25s ease,
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .feature:hover {
          background: rgba(255, 255, 255, 0.72);
          border-color: #eee4d2;
          box-shadow:
            0 8px 30px rgba(73, 56, 20, 0.05);
        }

        .feature-number {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #f5ead0;
          color: #97721f;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.5px;
        }

        .feature strong {
          display: block;
          margin-bottom: 3px;
          color: #29261f;
          font-size: 13px;
          font-weight: 800;
        }

        .feature span {
          display: block;
          color: #928b7f;
          font-size: 12px;
          line-height: 1.5;
        }

        /* BOTTOM */

        .showcase-bottom {
          max-width: 650px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #aaa296;
          font-size: 11px;
        }

        .trusted {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .trusted svg {
          color: #b38a2c;
        }

        /* REGISTER AREA */

        .register-area {
          display: flex;
          justify-content: center;
        }

        /* CARD */

        .register-card {
          width: 100%;
          padding: 38px 40px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid #e9e1d3;
          border-radius: 25px;
          box-shadow:
            0 35px 90px rgba(56, 45, 24, 0.1),
            0 8px 25px rgba(56, 45, 24, 0.045);
          backdrop-filter: blur(18px);
        }

        .mobile-brand {
          display: none;
        }

        /* HEADER */

        .form-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 27px;
        }

        .header-icon {
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #f7edd6;
          color: #9a741f;
        }

        .header-label {
          margin-bottom: 5px;
          color: #b18a31;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.4px;
        }

        .form-header h2 {
          margin: 0;
          color: #1d1b17;
          font-size: 28px;
          line-height: 1.15;
          letter-spacing: -1px;
        }

        .form-header p {
          margin: 7px 0 0;
          color: #888176;
          font-size: 12px;
          line-height: 1.5;
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
          overflow: hidden;
        }

        .error-message {
          color: #9a4141;
          background: #fff3f3;
          border: 1px solid #f2d4d4;
        }

        .success-message {
          color: #477249;
          background: #f1f9ef;
          border: 1px solid #d6e9d1;
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
          color: #3b372f;
          font-size: 11px;
          font-weight: 800;
        }

        .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* INPUT */

        .input-wrapper {
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

        .input-wrapper:focus-within .input-icon {
          color: #bd8d20;
        }

        .input-wrapper input {
          width: 100%;
          height: 49px;
          padding: 0 43px;
          border: 1px solid #e3ddd2;
          border-radius: 12px;
          outline: none;
          background: #fff;
          color: #28251f;
          font-size: 13px;
          transition:
            border-color 0.22s ease,
            box-shadow 0.22s ease,
            transform 0.22s ease;
        }

        .input-wrapper input::placeholder {
          color: #b4aea4;
        }

        .input-wrapper input:hover:not(:disabled) {
          border-color: #d5c8ad;
        }

        .input-wrapper input:focus {
          border-color: #cba03d;
          box-shadow:
            0 0 0 3px rgba(203, 160, 61, 0.1);
        }

        .input-wrapper input:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .valid-icon {
          position: absolute;
          right: 14px;
          color: #5f9160;
          pointer-events: none;
        }

        .password-toggle {
          position: absolute;
          right: 10px;
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #999186;
          cursor: pointer;
          transition:
            color 0.2s ease,
            background 0.2s ease;
        }

        .password-toggle:hover {
          background: #f7f2e9;
          color: #9f771f;
        }

        /* PASSWORD STRENGTH */

        .password-status {
          font-size: 10px;
          font-weight: 800;
        }

        .strength-1 {
          color: #bd5656;
        }

        .strength-2 {
          color: #b78627;
        }

        .strength-3,
        .strength-4 {
          color: #56805a;
        }

        .strength-area {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .strength-bars {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
        }

        .strength-bars span {
          height: 3px;
          border-radius: 99px;
          background: #e8e2d8;
          transition: background 0.25s ease;
        }

        .strength-bars span.active {
          background: #c69624;
        }

        .password-rules {
          display: flex;
          flex-wrap: wrap;
          gap: 5px 12px;
        }

        .password-rules span {
          color: #aaa398;
          font-size: 9px;
        }

        .password-rules span::before {
          content: "○";
          margin-right: 4px;
        }

        .password-rules span.passed {
          color: #5d855e;
        }

        .password-rules span.passed::before {
          content: "✓";
        }

        .match-text {
          font-size: 10px;
          font-weight: 700;
        }

        .matched {
          color: #5c885f;
        }

        .not-matched {
          color: #b65a5a;
        }

        /* TERMS */

        .terms {
          margin: 0;
          color: #999187;
          font-size: 10px;
          line-height: 1.6;
        }

        .terms a {
          color: #9f771f;
          font-weight: 800;
          text-decoration: none;
        }

        .terms a:hover {
          text-decoration: underline;
        }

        /* BUTTON */

        .primary-button {
          position: relative;
          width: 100%;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 0;
          border-radius: 13px;
          background: linear-gradient(
            135deg,
            #d2a536,
            #b98419
          );
          color: #fff;
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
          box-shadow:
            0 12px 25px rgba(181, 135, 29, 0.2);
          transition:
            box-shadow 0.25s ease,
            filter 0.25s ease;
          overflow: hidden;
        }

        .primary-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -120%;
          width: 70%;
          height: 100%;
          transform: skewX(-20deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.24),
            transparent
          );
          transition: left 0.6s ease;
        }

        .primary-button:hover:not(:disabled)::before {
          left: 140%;
        }

        .primary-button:hover:not(:disabled) {
          box-shadow:
            0 16px 32px rgba(181, 135, 29, 0.28);
          filter: brightness(1.03);
        }

        .primary-button:disabled {
          opacity: 0.7;
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

        /* DIVIDER */

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 21px 0 17px;
          color: #c0b9ad;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #eee9e1;
        }

        /* ACCOUNT */

        .account-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          color: #817a70;
          font-size: 12px;
        }

        .account-link a {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #9d741b;
          font-weight: 850;
          text-decoration: none;
          transition:
            gap 0.2s ease,
            color 0.2s ease;
        }

        .account-link a:hover {
          gap: 7px;
          color: #795a12;
        }

        /* SECURITY */

        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #eee9e1;
          color: #aaa398;
          font-size: 9px;
        }

        .security-note svg {
          color: #a7853d;
        }

        /* TABLET */

        @media (max-width: 1050px) {
          .register-shell {
            width: min(850px, calc(100% - 40px));
            grid-template-columns: 1fr;
            gap: 30px;
            padding: 35px 0;
          }

          .showcase {
            display: none;
          }

          .register-area {
            min-height: calc(100vh - 70px);
            align-items: center;
          }

          .register-card {
            width: min(500px, 100%);
          }

          .mobile-brand {
            display: flex;
            justify-content: center;
            margin-bottom: 27px;
          }
        }

        /* MOBILE */

        @media (max-width: 560px) {
          .register-shell {
            width: calc(100% - 22px);
            padding: 12px 0;
          }

          .register-area {
            min-height: calc(100vh - 24px);
          }

          .register-card {
            padding: 27px 20px;
            border-radius: 20px;
          }

          .mobile-brand {
            margin-bottom: 23px;
          }

          .brand-name {
            font-size: 22px;
          }

          .logo-box {
            width: 41px;
            height: 41px;
          }

          .form-header {
            gap: 11px;
            margin-bottom: 23px;
          }

          .header-icon {
            width: 42px;
            height: 42px;
          }

          .form-header h2 {
            font-size: 24px;
          }

          .form-header p {
            font-size: 11px;
          }

          .register-form {
            gap: 14px;
          }

          .input-wrapper input {
            height: 49px;
          }

          .primary-button {
            height: 51px;
          }

          .account-link {
            flex-direction: column;
            gap: 5px;
          }
        }

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
