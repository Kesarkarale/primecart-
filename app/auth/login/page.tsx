"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Zap,
  Gift,
  Star,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

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
      {/* =========================
          BACKGROUND
      ========================== */}

      <div className="background-grid" />

      <motion.div
        className="orb orb-one"
        animate={{
          x: [0, 30, 0],
          y: [0, -25, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="orb orb-two"
        animate={{
          x: [0, -25, 0],
          y: [0, 30, 0],
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="floating-star star-one"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Sparkles size={20} />
      </motion.div>

      <motion.div
        className="floating-star star-two"
        animate={{
          y: [0, 12, 0],
          rotate: [0, -12, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Sparkles size={16} />
      </motion.div>

      <div className="login-wrapper">
        {/* =========================
            LEFT SHOWCASE
        ========================== */}

        <motion.section
          className="login-showcase"
          initial={{ opacity: 0, x: -45 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* BRAND */}

          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <Link href="/" className="brand">
              <motion.div
                className="brand-icon"
                whileHover={{
                  scale: 1.08,
                  rotate: -5,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                }}
              >
                <ShoppingBag size={21} />
              </motion.div>

              <span>
                Prime<span>Cart</span>
              </span>
            </Link>
          </motion.div>

          <div className="showcase-content">
            {/* BADGE */}

            <motion.div
              className="mini-badge"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              <span className="badge-dot" />
              <span>Smart shopping starts here</span>
              <Sparkles size={14} />
            </motion.div>

            {/* HEADING */}

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              Shop smarter.
              <br />
              <span>Live better.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
            >
              Discover products that match your needs, budget
              and lifestyle — all in one beautiful shopping
              experience.
            </motion.p>

            {/* FEATURE CARDS */}

            <div className="benefits">
              {[
                {
                  icon: <Zap size={18} />,
                  title: "Smart shopping",
                  text: "Discover products faster and easier.",
                },
                {
                  icon: <Gift size={18} />,
                  title: "Exclusive deals",
                  text: "Unlock better value and special offers.",
                },
                {
                  icon: <Star size={18} />,
                  title: "PrimePoints rewards",
                  text: "Earn rewards while you shop.",
                },
              ].map((item, index) => (
                <motion.div
                  className="benefit"
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.55 + index * 0.1,
                    duration: 0.5,
                  }}
                  whileHover={{
                    x: 7,
                    transition: { duration: 0.2 },
                  }}
                >
                  <div className="benefit-icon">
                    {item.icon}
                  </div>

                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </div>

                  <ArrowUpRight
                    className="benefit-arrow"
                    size={16}
                  />
                </motion.div>
              ))}
            </div>

            {/* TRUST */}

            <motion.div
              className="trust-row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="avatars">
                <span>A</span>
                <span>R</span>
                <span>S</span>
                <span>+</span>
              </div>

              <div>
                <div className="stars">
                  ★ ★ ★ ★ ★
                </div>
                <p>Loved by smart shoppers</p>
              </div>
            </motion.div>
          </div>

          {/* FOOTER */}

          <div className="showcase-footer">
            <span>© 2026 PrimeCart</span>
            <span>Secure • Simple • Smart</span>
          </div>
        </motion.section>

        {/* =========================
            RIGHT LOGIN
        ========================== */}

        <motion.section
          className="login-section"
          initial={{ opacity: 0, x: 45, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.div
            className="login-card"
            whileHover={{
              y: -3,
              transition: { duration: 0.25 },
            }}
          >
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

            <motion.div
              className="card-header"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="welcome-icon"
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <LockKeyhole size={22} />
              </motion.div>

              <div className="eyebrow">
                <span />
                SECURE ACCESS
              </div>

              <h2>Welcome back</h2>

              <p>
                Sign in to continue your PrimeCart journey.
              </p>
            </motion.div>

            {/* MESSAGES */}

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  className="message error-message"
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
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
                    height: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
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
              onSubmit={handleLogin}
              className="login-form"
            >
              {/* EMAIL */}

              <motion.div
                className="field"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
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
              </motion.div>

              {/* PASSWORD */}

              <motion.div
                className="field"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 }}
              >
                <div className="password-header">
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
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
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
                    <AnimatePresence mode="wait">
                      {showPassword ? (
                        <motion.span
                          key="hide"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                        >
                          <EyeOff size={19} />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="show"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                        >
                          <Eye size={19} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </motion.div>

              {/* REMEMBER */}

              <motion.label
                className="remember"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                  disabled={loading}
                />

                <span className="custom-checkbox">
                  {rememberMe ? "✓" : ""}
                </span>

                <span>Remember me</span>
              </motion.label>

              {/* BUTTON */}

              <motion.button
                type="submit"
                className="primary-button"
                disabled={loading}
                whileHover={
                  !loading
                    ? {
                        y: -2,
                        scale: 1.01,
                      }
                    : {}
                }
                whileTap={
                  !loading
                    ? {
                        scale: 0.98,
                      }
                    : {}
                }
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
              </motion.button>
            </form>

            {/* DIVIDER */}

            <div className="divider">
              <span>OR</span>
            </div>

            {/* REGISTER */}

            <div className="account-link">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register">
                Create account
              </Link>
            </div>

            {/* SECURITY */}

            <div className="security-note">
              <ShieldCheck size={15} />

              <span>
                Your account information is encrypted and
                securely protected.
              </span>
            </div>
          </motion.div>
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

        /* =========================
           PAGE
        ========================== */

        .login-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 75% 15%,
              rgba(218, 174, 72, 0.08),
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

        /* =========================
           BACKGROUND
        ========================== */

        .background-grid {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.3;
          background-image:
            linear-gradient(
              rgba(190, 150, 55, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(190, 150, 55, 0.035) 1px,
              transparent 1px
            );
          background-size: 42px 42px;
        }

        .orb {
          position: fixed;
          width: 330px;
          height: 330px;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
        }

        .orb-one {
          top: -170px;
          right: -100px;
          background: rgba(213, 166, 55, 0.17);
        }

        .orb-two {
          bottom: -190px;
          left: -120px;
          background: rgba(213, 166, 55, 0.11);
        }

        .floating-star {
          position: fixed;
          display: grid;
          place-items: center;
          color: #c69727;
          opacity: 0.5;
          pointer-events: none;
        }

        .star-one {
          top: 18%;
          right: 5%;
        }

        .star-two {
          bottom: 17%;
          left: 5%;
        }

        /* =========================
           WRAPPER
        ========================== */

        .login-wrapper {
          position: relative;
          z-index: 2;
          width: min(1200px, calc(100% - 48px));
          min-height: 100vh;
          margin: auto;
          padding: 34px 0;
          display: grid;
          grid-template-columns: 1fr 0.88fr;
          gap: 75px;
          align-items: center;
        }

        /* =========================
           BRAND
        ========================== */

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          color: #171717;
          text-decoration: none;
          font-size: 25px;
          font-weight: 850;
          letter-spacing: -0.8px;
        }

        .brand > span > span {
          color: #c69624;
        }

        .brand-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: linear-gradient(
            145deg,
            #e0b84d,
            #c69624
          );
          color: white;
          box-shadow:
            0 12px 28px rgba(198, 150, 36, 0.25);
        }

        /* =========================
           LEFT
        ========================== */

        .login-showcase {
          min-height: 690px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px 10px;
        }

        .showcase-content {
          max-width: 580px;
        }

        .mini-badge {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 14px;
          border: 1px solid rgba(198, 150, 36, 0.22);
          background: rgba(255, 255, 255, 0.76);
          backdrop-filter: blur(12px);
          border-radius: 999px;
          color: #806117;
          font-size: 12px;
          font-weight: 750;
          margin-bottom: 25px;
        }

        .badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #d2a132;
          box-shadow:
            0 0 0 5px rgba(210, 161, 50, 0.11);
        }

        .showcase-content h1 {
          margin: 0;
          font-size: clamp(50px, 5.2vw, 75px);
          line-height: 0.98;
          letter-spacing: -4.5px;
          font-weight: 900;
        }

        .showcase-content h1 span {
          background: linear-gradient(
            100deg,
            #bd8b19,
            #d9aa3c
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .showcase-content > p {
          max-width: 520px;
          margin: 28px 0 32px;
          color: #706b62;
          font-size: 16px;
          line-height: 1.75;
        }

        /* =========================
           BENEFITS
        ========================== */

        .benefits {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .benefit {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          max-width: 530px;
          padding: 12px 14px;
          border: 1px solid transparent;
          border-radius: 16px;
          transition:
            background 0.25s ease,
            border-color 0.25s ease;
        }

        .benefit:hover {
          background: rgba(255, 255, 255, 0.68);
          border-color: #ece5d7;
        }

        .benefit-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #f2e4bd;
          color: #866316;
        }

        .benefit strong {
          display: block;
          margin-bottom: 3px;
          color: #27231c;
          font-size: 14px;
        }

        .benefit span {
          display: block;
          color: #898277;
          font-size: 12px;
        }

        .benefit-arrow {
          margin-left: auto;
          color: #c4a35f;
          opacity: 0;
          transition: 0.2s ease;
        }

        .benefit:hover .benefit-arrow {
          opacity: 1;
        }

        /* =========================
           TRUST
        ========================== */

        .trust-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 30px;
        }

        .avatars {
          display: flex;
        }

        .avatars span {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          margin-right: -7px;
          border: 2px solid #faf8f3;
          border-radius: 50%;
          background: #e8d6a7;
          color: #6d5319;
          font-size: 10px;
          font-weight: 800;
        }

        .stars {
          color: #c89727;
          font-size: 11px;
          letter-spacing: 1px;
        }

        .trust-row p {
          margin: 2px 0 0;
          color: #8b857b;
          font-size: 11px;
        }

        .showcase-footer {
          display: flex;
          justify-content: space-between;
          max-width: 570px;
          color: #999286;
          font-size: 11px;
        }

        /* =========================
           LOGIN SECTION
        ========================== */

        .login-section {
          display: flex;
          justify-content: center;
        }

        .login-card {
          position: relative;
          width: min(470px, 100%);
          padding: 43px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(18px);
          border: 1px solid #ebe4d6;
          border-radius: 30px;
          box-shadow:
            0 35px 90px rgba(60, 48, 20, 0.1),
            0 8px 25px rgba(60, 48, 20, 0.045);
        }

        .login-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            #d3a63c,
            transparent
          );
        }

        .mobile-brand {
          display: none;
        }

        /* =========================
           HEADER
        ========================== */

        .card-header {
          margin-bottom: 28px;
        }

        .welcome-icon {
          width: 50px;
          height: 50px;
          display: grid;
          place-items: center;
          margin-bottom: 17px;
          border-radius: 16px;
          background: #f7ecd1;
          color: #9c741d;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 7px;
          color: #b08a32;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 1.5px;
        }

        .eyebrow span {
          width: 20px;
          height: 2px;
          background: #d1a239;
          border-radius: 999px;
        }

        .card-header h2 {
          margin: 0;
          color: #1d1a15;
          font-size: 32px;
          letter-spacing: -1.2px;
          font-weight: 850;
        }

        .card-header p {
          margin: 9px 0 0;
          color: #817b70;
          font-size: 13px;
          line-height: 1.6;
        }

        /* =========================
           MESSAGES
        ========================== */

        .message {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          margin-bottom: 17px;
          border-radius: 13px;
          font-size: 12px;
          line-height: 1.5;
          overflow: hidden;
        }

        .error-message {
          color: #973d3d;
          background: #fff2f2;
          border: 1px solid #f2d4d4;
        }

        .success-message {
          color: #477349;
          background: #f0f8ed;
          border: 1px solid #d5e8d1;
        }

        /* =========================
           FORM
        ========================== */

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
        .password-header label {
          color: #353129;
          font-size: 12px;
          font-weight: 750;
        }

        .password-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .password-header a {
          color: #a2771d;
          font-size: 11px;
          font-weight: 750;
          text-decoration: none;
        }

        .password-header a:hover {
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
          transition: color 0.2s ease;
        }

        .input-wrapper:focus-within .input-icon {
          color: #b48725;
        }

        .input-wrapper input {
          width: 100%;
          height: 53px;
          padding: 0 46px;
          border: 1px solid #e4dfd5;
          border-radius: 14px;
          outline: none;
          background: #fff;
          color: #28251f;
          font-size: 13px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .input-wrapper input:hover {
          border-color: #d8cdb8;
        }

        .input-wrapper input:focus {
          border-color: #d0a039;
          box-shadow:
            0 0 0 4px rgba(208, 160, 57, 0.1);
          transform: translateY(-1px);
        }

        .input-wrapper input::placeholder {
          color: #b2aca2;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          border: 0;
          padding: 6px;
          display: grid;
          place-items: center;
          background: transparent;
          color: #999286;
          cursor: pointer;
        }

        .password-toggle:hover {
          color: #a87c1b;
        }

        /* =========================
           REMEMBER
        ========================== */

        .remember {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          width: fit-content;
          color: #777168;
          font-size: 12px;
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
          background: white;
          color: white;
          font-size: 10px;
          font-weight: 900;
          transition: 0.2s ease;
        }

        .remember:hover .custom-checkbox {
          border-color: #c69624;
        }

        .remember input:checked + .custom-checkbox {
          border-color: #c69624;
          background: #c69624;
          transform: scale(1.05);
        }

        /* =========================
           BUTTON
        ========================== */

        .primary-button {
          position: relative;
          width: 100%;
          height: 54px;
          border: 0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          overflow: hidden;
          background: linear-gradient(
            135deg,
            #d7aa3d,
            #bf8e20
          );
          color: white;
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
          box-shadow:
            0 13px 28px rgba(198, 150, 36, 0.22);
          transition:
            box-shadow 0.25s ease,
            opacity 0.2s ease;
        }

        .primary-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.28),
            transparent
          );
          transform: skewX(-20deg);
          transition: left 0.6s ease;
        }

        .primary-button:hover::before {
          left: 150%;
        }

        .primary-button:hover:not(:disabled) {
          box-shadow:
            0 17px 34px rgba(198, 150, 36, 0.29);
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

        /* =========================
           BOTTOM
        ========================== */

        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 25px 0 20px;
          color: #b2aca2;
          font-size: 9px;
          font-weight: 750;
          letter-spacing: 1px;
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
          margin-top: 25px;
          padding-top: 18px;
          border-top: 1px solid #eee9e0;
          color: #aaa398;
          font-size: 10px;
          line-height: 1.4;
          text-align: center;
        }

        /* =========================
           TABLET
        ========================== */

        @media (max-width: 950px) {
          .login-wrapper {
            width: min(650px, calc(100% - 32px));
            grid-template-columns: 1fr;
            gap: 0;
            padding: 25px 0;
          }

          .login-showcase {
            display: none;
          }

          .login-section {
            min-height: calc(100vh - 50px);
            align-items: center;
          }

          .login-card {
            width: 100%;
          }

          .mobile-brand {
            display: flex;
            justify-content: center;
            margin-bottom: 28px;
          }

          .star-one {
            right: 8%;
          }

          .star-two {
            left: 8%;
          }
        }

        /* =========================
           MOBILE
        ========================== */

        @media (max-width: 520px) {
          .login-wrapper {
            width: calc(100% - 20px);
            padding: 10px 0;
          }

          .login-section {
            min-height: calc(100vh - 20px);
          }

          .login-card {
            padding: 29px 20px;
            border-radius: 23px;
          }

          .mobile-brand {
            margin-bottom: 24px;
          }

          .brand {
            font-size: 22px;
          }

          .brand-icon {
            width: 39px;
            height: 39px;
          }

          .card-header h2 {
            font-size: 27px;
          }

          .card-header p {
            font-size: 12px;
          }

          .welcome-icon {
            width: 45px;
            height: 45px;
            margin-bottom: 15px;
          }

          .input-wrapper input {
            height: 51px;
          }

          .primary-button {
            height: 52px;
          }

          .security-note {
            font-size: 9px;
          }

          .orb {
            width: 230px;
            height: 230px;
            filter: blur(70px);
          }

          .floating-star {
            display: none;
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
