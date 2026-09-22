"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
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
  Truck,
  Gift,
  RotateCcw,
} from "lucide-react";
import { motion, Variants } from "framer-motion";

import { createClient } from "@/lib/supabase/client";

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const pageContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.45,
      staggerChildren: 0.08,
    },
  },
};

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -35,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const cardAnimation: Variants = {
  hidden: {
    opacity: 0,
    y: 35,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const itemAnimation: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =========================================================
   LOGIN PAGE
========================================================= */

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [shake, setShake] = useState(false);

  /* =======================================================
     LOAD SAVED EMAIL
  ======================================================= */

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

  /* =======================================================
     CLEAR MESSAGE
  ======================================================= */

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  /* =======================================================
     TRIGGER ERROR SHAKE
  ======================================================= */

  function showError(message: string) {
    setError(message);
    setSuccess("");
    setShake(false);

    requestAnimationFrame(() => {
      setShake(true);
    });
  }

  /* =======================================================
     LOGIN
  ======================================================= */

  async function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    clearMessages();

    const cleanEmail = email.trim().toLowerCase();

    /* Email validation */

    if (!cleanEmail) {
      showError("Please enter your email address.");
      return;
    }

    if (!cleanEmail.includes("@")) {
      showError("Please enter a valid email address.");
      return;
    }

    /* Password validation */

    if (!password) {
      showError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      showError(
        "Password must contain at least 6 characters."
      );
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
        const message =
          loginError.message.toLowerCase();

        if (
          message.includes("email not confirmed") ||
          message.includes("email not verified") ||
          message.includes("confirm")
        ) {
          showError(
            "Please verify your email before logging in."
          );
        } else if (
          message.includes("invalid login credentials")
        ) {
          showError("Invalid email or password.");
        } else {
          showError(loginError.message);
        }

        return;
      }

      if (!data.session) {
        showError(
          "Unable to create a login session. Please try again."
        );
        return;
      }

      /* Remember email */

      try {
        if (rememberMe) {
          localStorage.setItem(
            "primecart_remembered_email",
            cleanEmail
          );
        } else {
          localStorage.removeItem(
            "primecart_remembered_email"
          );
        }
      } catch {
        // Ignore localStorage errors
      }

      setSuccess(
        "Login successful! Taking you to your dashboard..."
      );

      /*
       * Small delay so user can see success animation.
       */

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 900);
    } catch (err) {
      console.error("Login error:", err);

      showError(
        "Something went wrong while logging in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      {/* ===================================================
          BACKGROUND
      =================================================== */}

      <div className="background-grid" />

      <motion.div
        className="background-orb orb-one"
        animate={{
          x: [0, 25, 0],
          y: [0, -20, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="background-orb orb-two"
        animate={{
          x: [0, -25, 0],
          y: [0, 20, 0],
          scale: [1, 1.06, 1],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="gold-line line-one" />
      <div className="gold-line line-two" />

      {/* ===================================================
          MAIN WRAPPER
      =================================================== */}

      <motion.div
        className="login-wrapper"
        variants={pageContainer}
        initial="hidden"
        animate="visible"
      >
        {/* =================================================
            LEFT SHOWCASE
        ================================================= */}

        <motion.section
          className="login-showcase"
          variants={fadeLeft}
        >
          {/* BRAND */}

          <motion.div
            className="showcase-brand"
            variants={itemAnimation}
          >
            <Link href="/" className="brand">
              <div className="brand-logo">
                <Image
                  src="/logo.png"
                  alt="PrimeCart"
                  width={52}
                  height={52}
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
              className="mini-badge"
              variants={itemAnimation}
            >
              <span className="badge-icon">
                <Sparkles size={14} />
              </span>

              <span>Smart shopping starts here</span>

              <span className="live-dot" />
            </motion.div>

            <motion.h1 variants={itemAnimation}>
              Shop smarter.
              <br />
              <span>Live better.</span>
            </motion.h1>

            <motion.p variants={itemAnimation}>
              Discover products you love, enjoy better
              deals, and experience a smarter way to shop
              with PrimeCart.
            </motion.p>

            {/* BENEFITS */}

            <motion.div
              className="benefits"
              variants={pageContainer}
            >
              <motion.div
                className="benefit"
                variants={itemAnimation}
                whileHover={{
                  x: 5,
                }}
              >
                <div className="benefit-icon">
                  <Truck size={18} />
                </div>

                <div className="benefit-content">
                  <strong>Fast & easy delivery</strong>
                  <span>
                    Get your favourite products delivered
                    to your doorstep.
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="benefit"
                variants={itemAnimation}
                whileHover={{
                  x: 5,
                }}
              >
                <div className="benefit-icon">
                  <Gift size={18} />
                </div>

                <div className="benefit-content">
                  <strong>Smart deals & rewards</strong>
                  <span>
                    Discover great offers and earn
                    PrimePoints while shopping.
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="benefit"
                variants={itemAnimation}
                whileHover={{
                  x: 5,
                }}
              >
                <div className="benefit-icon">
                  <RotateCcw size={18} />
                </div>

                <div className="benefit-content">
                  <strong>Easy returns</strong>
                  <span>
                    Shop confidently with a simple return
                    experience.
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* SHOWCASE FOOTER */}

          <motion.div
            className="showcase-footer"
            variants={itemAnimation}
          >
            <span>© 2026 PrimeCart</span>

            <span className="footer-separator">
              •
            </span>

            <span>Smart shopping platform</span>

            <span className="footer-separator">
              •
            </span>

            <span>Secure & trusted</span>
          </motion.div>
        </motion.section>

        {/* =================================================
            RIGHT LOGIN SECTION
        ================================================= */}

        <motion.section
          className="login-section"
          variants={cardAnimation}
        >
          <motion.div
            className="login-card"
            animate={
              shake
                ? {
                    x: [0, -7, 7, -5, 5, 0],
                  }
                : {
                    x: 0,
                  }
            }
            transition={{
              duration: 0.4,
            }}
          >
            {/* CARD TOP DECORATION */}

            <div className="card-top-glow" />

            {/* MOBILE BRAND */}

            <motion.div
              className="mobile-brand"
              variants={itemAnimation}
            >
              <Link href="/" className="brand">
                <div className="brand-logo">
                  <Image
                    src="/logo.png"
                    alt="PrimeCart"
                    width={48}
                    height={48}
                    priority
                  />
                </div>

                <div className="brand-name">
                  Prime<span>Cart</span>
                </div>
              </Link>
            </motion.div>

            {/* HEADER */}

            <motion.div
              className="card-header"
              variants={itemAnimation}
            >
              <motion.div
                className="welcome-icon"
                whileHover={{
                  rotate: -5,
                  scale: 1.05,
                }}
              >
                <LockKeyhole size={22} />
              </motion.div>

              <div className="welcome-label">
                <span>WELCOME BACK</span>
              </div>

              <h2>Sign in to PrimeCart</h2>

              <p>
                Continue your shopping journey and access
                your personalized dashboard.
              </p>
            </motion.div>

            {/* MESSAGE */}

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
                }}
              >
                <div className="message-icon">
                  <AlertCircle size={17} />
                </div>

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
                <motion.div
                  className="message-icon"
                  initial={{
                    scale: 0,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 18,
                  }}
                >
                  <CheckCircle2 size={17} />
                </motion.div>

                <span>{success}</span>
              </motion.div>
            )}

            {/* FORM */}

            <motion.form
              onSubmit={handleLogin}
              className="login-form"
              variants={pageContainer}
              initial="hidden"
              animate="visible"
            >
              {/* EMAIL */}

              <motion.div
                className="field"
                variants={itemAnimation}
              >
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

                  {email.length > 0 &&
                    email.includes("@") && (
                      <motion.div
                        className="valid-icon"
                        initial={{
                          opacity: 0,
                          scale: 0.5,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                      >
                        <Check size={15} />
                      </motion.div>
                    )}
                </div>
              </motion.div>

              {/* PASSWORD */}

              <motion.div
                className="field"
                variants={itemAnimation}
              >
                <div className="password-header">
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

                  <motion.button
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
                    whileHover={{
                      scale: 1.08,
                    }}
                    whileTap={{
                      scale: 0.92,
                    }}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {/* REMEMBER */}

              <motion.label
                className="remember"
                variants={itemAnimation}
              >
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

                <motion.span
                  className="custom-checkbox"
                  animate={{
                    scale: rememberMe ? 1 : 0.96,
                  }}
                >
                  {rememberMe && (
                    <motion.span
                      initial={{
                        opacity: 0,
                        scale: 0.4,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                    >
                      <Check size={12} />
                    </motion.span>
                  )}
                </motion.span>

                <span>Remember me</span>
              </motion.label>

              {/* SIGN IN BUTTON */}

              <motion.button
                type="submit"
                className="primary-button"
                disabled={loading}
                variants={itemAnimation}
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
                <span className="button-shine" />

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

                    <motion.span
                      className="button-arrow"
                      whileHover={{
                        x: 4,
                      }}
                    >
                      <ArrowRight size={18} />
                    </motion.span>
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* DIVIDER */}

            <motion.div
              className="divider"
              variants={itemAnimation}
              initial="hidden"
              animate="visible"
            >
              <span>New to PrimeCart?</span>
            </motion.div>

            {/* CREATE ACCOUNT */}

            <motion.div
              className="account-link"
              variants={itemAnimation}
              initial="hidden"
              animate="visible"
            >
              <span>Don't have an account?</span>

              <Link href="/auth/register">
                Create account
                <ArrowRight size={14} />
              </Link>
            </motion.div>

            {/* SECURITY */}

            <motion.div
              className="security-note"
              variants={itemAnimation}
              initial="hidden"
              animate="visible"
            >
              <div className="security-icon">
                <ShieldCheck size={15} />
              </div>

              <div>
                <strong>Secure sign in</strong>

                <span>
                  Your account information is encrypted
                  and protected.
                </span>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>
      </motion.div>

      {/* ===================================================
          GLOBAL STYLES
      =================================================== */}

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

        /* =================================================
           PAGE
        ================================================= */

        .login-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 78% 18%,
              rgba(214, 167, 54, 0.08),
              transparent 28%
            ),
            radial-gradient(
              circle at 8% 90%,
              rgba(214, 167, 54, 0.055),
              transparent 30%
            ),
            #faf8f3;
          color: #191713;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* =================================================
           BACKGROUND
        ================================================= */

        .background-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.35;
          background-image:
            linear-gradient(
              rgba(190, 150, 55, 0.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(190, 150, 55, 0.045) 1px,
              transparent 1px
            );
          background-size: 55px 55px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 85%
          );
        }

        .background-orb {
          position: absolute;
          width: 390px;
          height: 390px;
          border-radius: 999px;
          filter: blur(90px);
          pointer-events: none;
          opacity: 0.34;
        }

        .orb-one {
          top: -210px;
          right: -90px;
          background: rgba(218, 173, 64, 0.22);
        }

        .orb-two {
          bottom: -230px;
          left: -110px;
          background: rgba(216, 169, 55, 0.15);
        }

        .gold-line {
          position: absolute;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(198, 150, 36, 0.2),
            transparent
          );
          pointer-events: none;
        }

        .line-one {
          top: 18%;
          left: 0;
          right: 0;
        }

        .line-two {
          bottom: 15%;
          left: 0;
          right: 0;
        }

        /* =================================================
           WRAPPER
        ================================================= */

        .login-wrapper {
          position: relative;
          z-index: 2;
          width: min(1240px, calc(100% - 56px));
          min-height: 100vh;
          margin: auto;
          padding: 34px 0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(
              390px,
              0.82fr
            );
          gap: 85px;
          align-items: center;
        }

        /* =================================================
           BRAND
        ================================================= */

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #171512;
          text-decoration: none;
        }

        .brand-logo {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 14px;
          background: #ffffff;
          border: 1px solid #eadfca;
          box-shadow:
            0 10px 30px rgba(82, 61, 19, 0.1);
        }

        .brand-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 5px;
        }

        .brand-name {
          font-size: 25px;
          line-height: 1;
          font-weight: 850;
          letter-spacing: -1px;
        }

        .brand-name span {
          color: #c69624;
        }

        /* =================================================
           SHOWCASE
        ================================================= */

        .login-showcase {
          min-height: 680px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px 5px;
        }

        .showcase-content {
          max-width: 600px;
        }

        .mini-badge {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 9px 13px;
          border-radius: 999px;
          border: 1px solid rgba(
            198,
            150,
            36,
            0.2
          );
          background: rgba(255, 255, 255, 0.68);
          box-shadow:
            0 8px 25px rgba(81, 62, 24, 0.04);
          color: #795b16;
          font-size: 12px;
          font-weight: 750;
          backdrop-filter: blur(12px);
        }

        .badge-icon {
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f4e6c2;
          color: #a47718;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c69624;
          box-shadow:
            0 0 0 4px rgba(198, 150, 36, 0.1);
        }

        .showcase-content h1 {
          margin: 26px 0 0;
          font-size: clamp(
            48px,
            5.6vw,
            76px
          );
          line-height: 0.96;
          letter-spacing: -5px;
          font-weight: 900;
          color: #191713;
        }

        .showcase-content h1 span {
          color: #c69624;
        }

        .showcase-content > p {
          max-width: 550px;
          margin: 28px 0 38px;
          color: #746e63;
          font-size: 16px;
          line-height: 1.75;
        }

        /* =================================================
           BENEFITS
        ================================================= */

        .benefits {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .benefit {
          display: flex;
          align-items: center;
          gap: 14px;
          width: fit-content;
          padding: 5px 12px 5px 5px;
          border-radius: 16px;
          transition:
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .benefit:hover {
          background: rgba(255, 255, 255, 0.65);
          box-shadow:
            0 10px 30px rgba(70, 53, 21, 0.05);
        }

        .benefit-icon {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: linear-gradient(
            145deg,
            #f8edcf,
            #f0ddb0
          );
          color: #966d15;
          border: 1px solid #ead6a6;
        }

        .benefit-content strong {
          display: block;
          margin-bottom: 3px;
          color: #28241d;
          font-size: 13px;
          font-weight: 800;
        }

        .benefit-content span {
          display: block;
          color: #898276;
          font-size: 12px;
          line-height: 1.5;
        }

        .showcase-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #9c958a;
          font-size: 11px;
        }

        .footer-separator {
          color: #d2c5a7;
        }

        /* =================================================
           LOGIN SECTION
        ================================================= */

        .login-section {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* =================================================
           CARD
        ================================================= */

        .login-card {
          position: relative;
          width: min(475px, 100%);
          padding: 42px;
          overflow: hidden;
          border-radius: 30px;
          border: 1px solid rgba(
            221,
            211,
            191,
            0.95
          );
          background: rgba(
            255,
            255,
            255,
            0.94
          );
          box-shadow:
            0 35px 90px rgba(64, 48, 20, 0.1),
            0 8px 25px rgba(64, 48, 20, 0.04);
          backdrop-filter: blur(20px);
        }

        .login-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 8%;
          right: 8%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(198, 150, 36, 0.6),
            transparent
          );
        }

        .card-top-glow {
          position: absolute;
          width: 170px;
          height: 170px;
          right: -100px;
          top: -100px;
          border-radius: 50%;
          background: rgba(214, 167, 54, 0.13);
          filter: blur(30px);
          pointer-events: none;
        }

        .mobile-brand {
          display: none;
        }

        /* =================================================
           HEADER
        ================================================= */

        .card-header {
          position: relative;
          z-index: 1;
          margin-bottom: 27px;
        }

        .welcome-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          margin-bottom: 16px;
          border-radius: 15px;
          background: linear-gradient(
            145deg,
            #f9efd8,
            #f1dfb6
          );
          color: #9b731b;
          border: 1px solid #ead8ad;
          box-shadow:
            0 8px 20px rgba(
              174,
              127,
              29,
              0.08
            );
        }

        .welcome-label {
          margin-bottom: 7px;
        }

        .welcome-label span {
          color: #a27a24;
          font-size: 10px;
          letter-spacing: 1.5px;
          font-weight: 850;
        }

        .card-header h2 {
          margin: 0;
          color: #1d1a15;
          font-size: 30px;
          line-height: 1.15;
          letter-spacing: -1.2px;
          font-weight: 850;
        }

        .card-header p {
          max-width: 380px;
          margin: 9px 0 0;
          color: #827b70;
          font-size: 13px;
          line-height: 1.65;
        }

        /* =================================================
           MESSAGES
        ================================================= */

        .message {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 13px;
          margin-bottom: 18px;
          border-radius: 13px;
          font-size: 12px;
          line-height: 1.5;
        }

        .message-icon {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 9px;
        }

        .error-message {
          color: #963e3e;
          background: #fff4f4;
          border: 1px solid #f2d5d5;
        }

        .error-message .message-icon {
          background: #ffe2e2;
        }

        .success-message {
          color: #487449;
          background: #f2f9ef;
          border: 1px solid #d5ead0;
        }

        .success-message .message-icon {
          background: #dfefd9;
        }

        /* =================================================
           FORM
        ================================================= */

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
          color: #38342d;
          font-size: 12px;
          font-weight: 800;
        }

        .password-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-link {
          color: #a2771d;
          font-size: 11px;
          font-weight: 800;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .forgot-link:hover {
          color: #76530c;
          text-decoration: underline;
        }

        /* =================================================
           INPUT
        ================================================= */

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 15px;
          z-index: 2;
          color: #a8a094;
          pointer-events: none;
          transition: color 0.2s ease;
        }

        .input-wrapper:focus-within
          .input-icon {
          color: #b28220;
        }

        .input-wrapper input {
          width: 100%;
          height: 53px;
          padding: 0 45px;
          border: 1px solid #e4dfd5;
          border-radius: 14px;
          outline: none;
          background: #ffffff;
          color: #29251f;
          font-size: 13px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .input-wrapper input:hover {
          border-color: #d9d0c1;
        }

        .input-wrapper input:focus {
          border-color: #cda03c;
          background: #fffefa;
          box-shadow:
            0 0 0 4px rgba(
              205,
              160,
              60,
              0.1
            );
        }

        .input-wrapper input::placeholder {
          color: #b5afa5;
        }

        .input-wrapper input:disabled {
          cursor: not-allowed;
          opacity: 0.65;
          background: #f8f7f4;
        }

        .valid-icon {
          position: absolute;
          right: 15px;
          width: 22px;
          height: 22px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #e8f4e4;
          color: #4c8048;
        }

        /* =================================================
           PASSWORD
        ================================================= */

        .password-toggle {
          position: absolute;
          right: 10px;
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #969086;
          cursor: pointer;
          transition:
            color 0.2s ease,
            background 0.2s ease;
        }

        .password-toggle:hover {
          color: #9f741c;
          background: #f9f3e5;
        }

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        /* =================================================
           REMEMBER
        ================================================= */

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
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .custom-checkbox {
          width: 18px;
          height: 18px;
          display: grid;
          place-items: center;
          border: 1px solid #d7d0c4;
          border-radius: 6px;
          background: #ffffff;
          color: #ffffff;
          transition:
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .remember input:checked
          + .custom-checkbox {
          border-color: #c69624;
          background: #c69624;
          box-shadow:
            0 4px 10px rgba(
              198,
              150,
              36,
              0.18
            );
        }

        /* =================================================
           BUTTON
        ================================================= */

        .primary-button {
          position: relative;
          width: 100%;
          height: 55px;
          overflow: hidden;
          border: 1px solid #b98619;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          background: linear-gradient(
            135deg,
            #d7aa42,
            #bd8c21
          );
          color: #ffffff;
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
          box-shadow:
            0 13px 25px rgba(
              177,
              130,
              28,
              0.2
            );
          transition:
            box-shadow 0.25s ease,
            filter 0.25s ease;
        }

        .primary-button:hover:not(:disabled) {
          box-shadow:
            0 17px 32px rgba(
              177,
              130,
              28,
              0.28
            );
          filter: brightness(1.03);
        }

        .primary-button:disabled {
          cursor: not-allowed;
          opacity: 0.72;
        }

        .button-shine {
          position: absolute;
          top: 0;
          bottom: 0;
          left: -80%;
          width: 45%;
          transform: skewX(-20deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.7s ease;
        }

        .primary-button:hover
          .button-shine {
          left: 135%;
        }

        .button-arrow {
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: rgba(
            255,
            255,
            255,
            0.15
          );
        }

        /* =================================================
           SPINNER
        ================================================= */

        .spin {
          animation: spin 0.85s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =================================================
           DIVIDER
        ================================================= */

        .divider {
          display: flex;
          align-items: center;
          gap: 13px;
          margin: 24px 0 17px;
          color: #aaa398;
          font-size: 10px;
          font-weight: 650;
          white-space: nowrap;
        }

        .divider::before,
        .divider::after {
          content: "";
          height: 1px;
          flex: 1;
          background: #eee9e0;
        }

        /* =================================================
           ACCOUNT LINK
        ================================================= */

        .account-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          color: #827b70;
          font-size: 12px;
        }

        .account-link a {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #9d741d;
          font-weight: 850;
          text-decoration: none;
          transition:
            color 0.2s ease,
            gap 0.2s ease;
        }

        .account-link a:hover {
          color: #74510b;
          gap: 7px;
        }

        /* =================================================
           SECURITY
        ================================================= */

        .security-note {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 23px;
          padding-top: 18px;
          border-top: 1px solid #eee9e0;
        }

        .security-icon {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #f3f7ef;
          color: #618259;
        }

        .security-note strong {
          display: block;
          margin-bottom: 2px;
          color: #686257;
          font-size: 10px;
          font-weight: 800;
        }

        .security-note span {
          display: block;
          color: #a29b91;
          font-size: 9px;
          line-height: 1.4;
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 1000px) {
          .login-wrapper {
            width: min(
              650px,
              calc(100% - 36px)
            );
            grid-template-columns: 1fr;
            gap: 0;
            padding: 25px 0;
          }

          .login-showcase {
            display: none;
          }

          .login-section {
            min-height: calc(100vh - 50px);
          }

          .login-card {
            width: min(480px, 100%);
          }

          .mobile-brand {
            display: flex;
            justify-content: center;
            margin-bottom: 28px;
          }

          .mobile-brand .brand-logo {
            width: 45px;
            height: 45px;
          }

          .mobile-brand .brand-name {
            font-size: 23px;
          }
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 560px) {
          .login-wrapper {
            width: calc(100% - 22px);
            padding: 12px 0;
          }

          .login-section {
            min-height: calc(100vh - 24px);
          }

          .login-card {
            padding: 27px 19px;
            border-radius: 23px;
          }

          .mobile-brand {
            margin-bottom: 24px;
          }

          .card-header {
            margin-bottom: 23px;
          }

          .welcome-icon {
            width: 44px;
            height: 44px;
            margin-bottom: 14px;
          }

          .card-header h2 {
            font-size: 26px;
            letter-spacing: -0.9px;
          }

          .card-header p {
            font-size: 12px;
          }

          .login-form {
            gap: 17px;
          }

          .input-wrapper input {
            height: 51px;
          }

          .primary-button {
            height: 53px;
          }

          .security-note {
            margin-top: 20px;
          }

          .account-link {
            font-size: 11px;
          }
        }

        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 380px) {
          .login-card {
            padding: 24px 16px;
          }

          .card-header h2 {
            font-size: 24px;
          }

          .card-header p {
            font-size: 11px;
          }

          .input-wrapper input {
            font-size: 12px;
          }

          .primary-button {
            font-size: 12px;
          }
        }

        /* =================================================
           REDUCED MOTION
        ================================================= */

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
