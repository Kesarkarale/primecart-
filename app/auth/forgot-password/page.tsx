"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(
        "Password reset instructions have been sent to your email."
      );

      setEmail("");
    } catch (err) {
      console.error("Forgot password error:", err);

      setError(
        "Something went wrong. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="forgot-page">
      {/* BACKGROUND DECORATION */}

      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <div className="grid-overlay" />

      {/* FLOATING DECORATIONS */}

      <motion.div
        className="floating-shape shape-one"
        animate={{
          y: [0, -14, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="floating-shape shape-two"
        animate={{
          y: [0, 16, 0],
          rotate: [0, -6, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="page-container">
        {/* BRAND */}

        <motion.div
          className="top-brand"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
        >
          <Link href="/" className="brand">
            <motion.div
              className="brand-icon"
              whileHover={{
                scale: 1.05,
                rotate: -3,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
              }}
            >
              <ShoppingBag size={21} strokeWidth={2.2} />
            </motion.div>

            <span className="brand-name">
              Prime<span>Cart</span>
            </span>
          </Link>
        </motion.div>

        {/* MAIN */}

        <div className="content-area">
          {/* LEFT INFORMATION */}

          <motion.section
            className="info-section"
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
          >
            <div className="eyebrow">
              <span className="eyebrow-icon">
                <Sparkles size={14} />
              </span>

              Account recovery
            </div>

            <h1>
              Get back to
              <br />
              <span>your account.</span>
            </h1>

            <p className="info-description">
              Forgot your password? No worries. Enter the email
              address connected to your PrimeCart account and
              we&apos;ll send you a secure link to create a new
              password.
            </p>

            {/* BENEFITS */}

            <div className="security-list">
              <motion.div
                className="security-item"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="security-icon">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <strong>Secure recovery</strong>
                  <span>
                    Your password is never shared or exposed.
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="security-item"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <div className="security-icon">
                  <Mail size={19} />
                </div>

                <div>
                  <strong>Email verification</strong>
                  <span>
                    We&apos;ll send a secure reset link to your
                    inbox.
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="security-item"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <div className="security-icon">
                  <LockKeyhole size={19} />
                </div>

                <div>
                  <strong>Protected account</strong>
                  <span>
                    Create a new password and continue shopping.
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* CARD */}

          <motion.section
            className="form-section"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: "easeOut",
            }}
          >
            <motion.div
              className="forgot-card"
              whileHover={{
                y: -3,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              {/* CARD ICON */}

              <motion.div
                className="recovery-icon"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.25,
                  duration: 0.45,
                  type: "spring",
                }}
              >
                <LockKeyhole
                  size={24}
                  strokeWidth={2}
                />

                <span className="icon-pulse" />
              </motion.div>

              {/* HEADER */}

              <div className="card-header">
                <h2>Forgot password?</h2>

                <p>
                  Enter your email and we&apos;ll send you a
                  password reset link.
                </p>
              </div>

              {/* ERROR */}

              {error && (
                <motion.div
                  className="message error-message"
                  initial={{
                    opacity: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                >
                  <AlertCircle size={18} />

                  <span>{error}</span>
                </motion.div>
              )}

              {/* SUCCESS */}

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

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="forgot-form"
              >
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                        setSuccess("");
                      }}
                      autoComplete="email"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="reset-button"
                  disabled={loading}
                  whileHover={
                    !loading
                      ? {
                          y: -2,
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
                        size={19}
                        className="spin"
                      />

                      Sending reset link...
                    </>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight size={19} />
                    </>
                  )}
                </motion.button>
              </form>

              {/* BACK TO LOGIN */}

              <div className="back-login">
                <Link href="/auth/login">
                  <ArrowLeft size={16} />

                  Back to login
                </Link>
              </div>

              {/* SECURITY */}

              <div className="card-security">
                <ShieldCheck size={15} />

                <span>
                  Your account security is our priority.
                </span>
              </div>
            </motion.div>
          </motion.section>
        </div>

        {/* FOOTER */}

        <motion.footer
          className="page-footer"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.8,
          }}
        >
          <span>© 2026 PrimeCart</span>

          <div className="footer-links">
            <span>Secure</span>
            <span className="footer-dot">•</span>
            <span>Private</span>
            <span className="footer-dot">•</span>
            <span>Simple</span>
          </div>
        </motion.footer>
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

        .forgot-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 15% 20%,
              rgba(214, 167, 54, 0.08),
              transparent 28%
            ),
            radial-gradient(
              circle at 90% 80%,
              rgba(214, 167, 54, 0.07),
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

        /* BACKGROUND */

        .ambient {
          position: fixed;
          border-radius: 999px;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }

        .ambient-one {
          width: 360px;
          height: 360px;
          top: -190px;
          right: -100px;
          background: rgba(214, 167, 54, 0.18);
        }

        .ambient-two {
          width: 320px;
          height: 320px;
          bottom: -180px;
          left: -100px;
          background: rgba(214, 167, 54, 0.13);
        }

        .ambient-three {
          width: 220px;
          height: 220px;
          top: 42%;
          left: 38%;
          background: rgba(214, 167, 54, 0.045);
        }

        .grid-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.25;
          background-image:
            linear-gradient(
              rgba(125, 105, 67, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(125, 105, 67, 0.035) 1px,
              transparent 1px
            );
          background-size: 48px 48px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 85%
          );
        }

        .floating-shape {
          position: fixed;
          border: 1px solid rgba(198, 150, 36, 0.12);
          pointer-events: none;
          z-index: 0;
        }

        .shape-one {
          width: 110px;
          height: 110px;
          right: 10%;
          top: 19%;
          border-radius: 28px;
          transform: rotate(20deg);
        }

        .shape-two {
          width: 70px;
          height: 70px;
          left: 7%;
          bottom: 18%;
          border-radius: 50%;
        }

        /* CONTAINER */

        .page-container {
          position: relative;
          z-index: 1;
          width: min(1160px, calc(100% - 48px));
          min-height: 100vh;
          margin: auto;
          padding: 34px 0 24px;
          display: flex;
          flex-direction: column;
        }

        /* BRAND */

        .top-brand {
          flex-shrink: 0;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          color: #171512;
          text-decoration: none;
        }

        .brand-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: linear-gradient(
            145deg,
            #d9ac42,
            #bd8c1e
          );
          color: white;
          box-shadow:
            0 12px 28px rgba(198, 150, 36, 0.22);
        }

        .brand-name {
          font-size: 24px;
          font-weight: 850;
          letter-spacing: -0.8px;
        }

        .brand-name span {
          color: #c69624;
        }

        /* CONTENT */

        .content-area {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 0.82fr;
          gap: 100px;
          align-items: center;
          padding: 55px 0;
        }

        /* INFO */

        .info-section {
          max-width: 570px;
        }

        .eyebrow {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 13px;
          border: 1px solid rgba(198, 150, 36, 0.2);
          background: rgba(255, 255, 255, 0.72);
          border-radius: 999px;
          color: #806116;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 23px;
          box-shadow:
            0 8px 25px rgba(84, 66, 25, 0.04);
        }

        .eyebrow-icon {
          width: 22px;
          height: 22px;
          display: grid;
          place-items: center;
          border-radius: 7px;
          background: #f5e7c3;
          color: #a77c1e;
        }

        .info-section h1 {
          margin: 0;
          font-size: clamp(48px, 5vw, 70px);
          line-height: 0.99;
          letter-spacing: -4px;
          font-weight: 850;
        }

        .info-section h1 span {
          color: #c69624;
        }

        .info-description {
          max-width: 510px;
          margin: 27px 0 38px;
          color: #777167;
          font-size: 16px;
          line-height: 1.8;
        }

        /* SECURITY LIST */

        .security-list {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .security-item {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .security-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: #94701c;
          background: #f4e8c9;
        }

        .security-item strong {
          display: block;
          margin-bottom: 3px;
          color: #29251e;
          font-size: 13px;
          font-weight: 800;
        }

        .security-item span {
          display: block;
          color: #918a80;
          font-size: 12px;
        }

        /* FORM */

        .form-section {
          display: flex;
          justify-content: center;
        }

        .forgot-card {
          width: min(450px, 100%);
          padding: 40px;
          border: 1px solid #e9e2d6;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow:
            0 30px 80px rgba(58, 46, 20, 0.09),
            0 7px 25px rgba(58, 46, 20, 0.045);
          backdrop-filter: blur(14px);
        }

        /* ICON */

        .recovery-icon {
          position: relative;
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          margin-bottom: 22px;
          border-radius: 17px;
          background: linear-gradient(
            145deg,
            #f8eed7,
            #f1dfb4
          );
          color: #9b741e;
        }

        .icon-pulse {
          position: absolute;
          inset: -5px;
          border: 1px solid rgba(198, 150, 36, 0.18);
          border-radius: 20px;
          animation: pulse-ring 2.2s ease-out infinite;
        }

        @keyframes pulse-ring {
          0% {
            opacity: 0.7;
            transform: scale(0.94);
          }

          70% {
            opacity: 0;
            transform: scale(1.08);
          }

          100% {
            opacity: 0;
            transform: scale(1.08);
          }
        }

        /* HEADER */

        .card-header {
          margin-bottom: 27px;
        }

        .card-header h2 {
          margin: 0;
          color: #1d1a15;
          font-size: 30px;
          line-height: 1.1;
          letter-spacing: -1.2px;
          font-weight: 850;
        }

        .card-header p {
          margin: 10px 0 0;
          color: #837c71;
          font-size: 13px;
          line-height: 1.65;
        }

        /* MESSAGE */

        .message {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          margin-bottom: 18px;
          border-radius: 13px;
          font-size: 12px;
          line-height: 1.5;
        }

        .error-message {
          color: #963f3f;
          background: #fff1f1;
          border: 1px solid #f0d0d0;
        }

        .success-message {
          color: #477547;
          background: #f0f8ed;
          border: 1px solid #d4e8cf;
        }

        /* FORM */

        .forgot-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          color: #39342c;
          font-size: 12px;
          font-weight: 800;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 15px;
          color: #aaa298;
          pointer-events: none;
          transition: color 0.2s ease;
        }

        .input-wrapper input {
          width: 100%;
          height: 53px;
          padding: 0 15px 0 46px;
          border: 1px solid #e3ddd2;
          border-radius: 14px;
          outline: none;
          background: #fff;
          color: #27231d;
          font-size: 14px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .input-wrapper input::placeholder {
          color: #b3ada4;
        }

        .input-wrapper input:hover {
          border-color: #d8cdb8;
        }

        .input-wrapper input:focus {
          border-color: #d0a039;
          box-shadow:
            0 0 0 4px rgba(208, 160, 57, 0.1);
        }

        .input-wrapper:focus-within .input-icon {
          color: #b28420;
        }

        .input-wrapper input:disabled {
          background: #faf9f6;
          cursor: not-allowed;
        }

        /* BUTTON */

        .reset-button {
          width: 100%;
          min-height: 54px;
          border: 0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          background: linear-gradient(
            135deg,
            #d3a43a,
            #bd8c20
          );
          color: #fff;
          font-size: 13px;
          font-weight: 850;
          letter-spacing: 0.05px;
          cursor: pointer;
          box-shadow:
            0 13px 27px rgba(198, 150, 36, 0.2);
          transition:
            box-shadow 0.25s ease,
            opacity 0.25s ease;
        }

        .reset-button:hover:not(:disabled) {
          box-shadow:
            0 17px 34px rgba(198, 150, 36, 0.28);
        }

        .reset-button:disabled {
          opacity: 0.68;
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

        /* BACK LOGIN */

        .back-login {
          display: flex;
          justify-content: center;
          margin-top: 24px;
        }

        .back-login a {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #7d766c;
          font-size: 12px;
          font-weight: 750;
          text-decoration: none;
          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .back-login a:hover {
          color: #a2771d;
          transform: translateX(-2px);
        }

        /* SECURITY NOTE */

        .card-security {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #eee9e0;
          color: #aaa398;
          font-size: 10px;
        }

        .card-security svg {
          color: #b49a61;
        }

        /* FOOTER */

        .page-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #a39c91;
          font-size: 11px;
        }

        .footer-links {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .footer-dot {
          color: #c5bcae;
        }

        /* TABLET */

        @media (max-width: 950px) {
          .content-area {
            grid-template-columns: 1fr;
            gap: 45px;
            padding: 55px 0;
          }

          .info-section {
            max-width: 650px;
            margin: auto;
            text-align: center;
          }

          .eyebrow {
            margin-left: auto;
            margin-right: auto;
          }

          .info-description {
            margin-left: auto;
            margin-right: auto;
          }

          .security-list {
            max-width: 500px;
            margin: auto;
            text-align: left;
          }

          .form-section {
            width: 100%;
          }

          .forgot-card {
            width: min(500px, 100%);
          }
        }

        /* MOBILE */

        @media (max-width: 600px) {
          .page-container {
            width: calc(100% - 24px);
            padding-top: 20px;
            padding-bottom: 18px;
          }

          .brand-name {
            font-size: 22px;
          }

          .brand-icon {
            width: 40px;
            height: 40px;
          }

          .content-area {
            gap: 32px;
            padding: 42px 0 35px;
          }

          .info-section h1 {
            font-size: 43px;
            letter-spacing: -2.7px;
          }

          .info-description {
            margin-top: 20px;
            margin-bottom: 28px;
            font-size: 14px;
            line-height: 1.7;
          }

          .security-list {
            gap: 14px;
          }

          .security-icon {
            width: 37px;
            height: 37px;
          }

          .security-item span {
            font-size: 11px;
          }

          .forgot-card {
            padding: 28px 20px;
            border-radius: 23px;
          }

          .recovery-icon {
            width: 51px;
            height: 51px;
            border-radius: 15px;
          }

          .card-header h2 {
            font-size: 27px;
          }

          .input-wrapper input {
            height: 51px;
          }

          .reset-button {
            min-height: 52px;
          }

          .page-footer {
            justify-content: center;
          }

          .page-footer > span {
            display: none;
          }

          .shape-one,
          .shape-two {
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
          }
        }
      `}</style>
    </main>
  );
}
