"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
  
  UserPlus,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

 async function handleRegister(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();

  if (loading || googleLoading) return;

  setError("");
  setSuccess("");

  const name = fullName.trim();
  const cleanEmail = email.trim().toLowerCase();

  // -----------------------------
  // NAME
  // -----------------------------

  if (!name) {
    setError("Please enter your full name.");
    return;
  }

  // -----------------------------
  // EMAIL
  // -----------------------------

  if (!cleanEmail) {
    setError("Please enter your email address.");
    return;
  }

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

  if (!emailRegex.test(cleanEmail)) {
    setError("Please enter a valid email address.");
    return;
  }

  // -----------------------------
  // PASSWORD
  // -----------------------------

  if (password.length < 6) {
    setError(
      "Password must contain at least 6 characters."
    );
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  // -----------------------------
  // TERMS
  // -----------------------------

  if (!agree) {
    setError(
      "Please accept the Terms & Conditions and Privacy Policy."
    );
    return;
  }

  try {
    setLoading(true);

    const { data, error: signUpError } =
      await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

    // -----------------------------
    // SUPABASE ERROR
    // -----------------------------

    if (signUpError) {
      console.error(
        "Supabase signup error:",
        signUpError
      );

      const message =
        signUpError.message.toLowerCase();

      if (
        message.includes("already registered") ||
        message.includes("already exists") ||
        message.includes("user already")
      ) {
        setError(
          "An account with this email already exists. Please login instead."
        );
      } else if (
        message.includes("invalid email")
      ) {
        setError(
          "Supabase rejected this email address. Please check the email and try again."
        );
      } else {
        setError(signUpError.message);
      }

      return;
    }

    console.log("Signup successful:", data);

    // -----------------------------
    // ACCOUNT CREATED
    // -----------------------------

    setSuccess(
      "Account created successfully. Redirecting to login..."
    );

    // Clear form
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAgree(false);

    // Always go to Login after registration
    setTimeout(() => {
      window.location.replace("/auth/login");
    }, 800);
  } catch (err) {
    console.error(
      "Registration error:",
      err
    );

    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError(
        "Unable to create your account. Please try again."
      );
    }
  } finally {
    setLoading(false);
  }
}

  // =========================================================
  // GOOGLE SIGNUP
  // =========================================================

  async function handleGoogleSignup() {
    if (loading || googleLoading) return;

    setError("");
    setSuccess("");

    try {
      setGoogleLoading(true);

      const redirectTo =
        `${window.location.origin}/auth/callback?next=/dashboard`;

      const { error: googleError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
            queryParams: {
              prompt: "select_account",
            },
          },
        });

      if (googleError) {
        console.error("Google signup error:", googleError);
        setError(googleError.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error("Google authentication error:", err);

      setError("Unable to continue with Google.");
      setGoogleLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] px-3 py-3 sm:px-5 sm:py-5 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] w-full max-w-[1370px] overflow-hidden rounded-[22px] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)] lg:grid-cols-2">

        {/* LEFT BANNER */}
        <div className="relative hidden overflow-hidden bg-[#f4efe7] lg:block">
          <img
            src="/login-banner.png"
            alt="PrimeCart"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* REGISTER */}
        <div className="flex w-full items-center justify-center bg-white px-5 py-9 sm:px-9 sm:py-10 md:px-12 lg:px-12 xl:px-16 xl:py-12">
          <div className="w-full max-w-[430px]">

            {/* LOGO */}
            <Link
              href="/"
              className="mb-8 flex w-fit items-center gap-3 hover:opacity-85"
            >
              <img
                src="/logo.png"
                alt="PrimeCart Logo"
                width={58}
                height={58}
                className="h-[52px] w-[52px] object-contain sm:h-[56px] sm:w-[56px]"
              />

              <span className="text-[28px] font-bold tracking-[-0.8px] text-[#111] sm:text-[30px]">
                PrimeCart
              </span>
            </Link>

            {/* HEADING */}
            <div className="mb-6">
              <h1 className="font-serif text-[27px] font-bold leading-[1.2] text-[#111] sm:text-[30px]">
                Create your account
              </h1>

              <p className="mt-2 font-serif text-[13px] leading-[1.6] text-[#777] sm:text-[14px]">
                Create your PrimeCart account and start shopping
                today.
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 font-serif text-[12px] leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div
                role="status"
                className="mb-5 rounded-[10px] border border-green-200 bg-green-50 px-4 py-3 font-serif text-[12px] leading-5 text-green-700"
              >
                {success}
              </div>
            )}

            <form
              onSubmit={handleRegister}
              className="space-y-4"
              noValidate
            >

              {/* FULL NAME */}
              <Field label="Full Name">
                <div className="relative">
                  <User
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#777]"
                  />

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    disabled={loading || googleLoading}
                    className="auth-input pl-[48px]"
                  />
                </div>
              </Field>

              {/* EMAIL */}
              <Field label="Email Address">
                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#777]"
                  />

                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    inputMode="email"
                    disabled={loading || googleLoading}
                    className="auth-input pl-[48px]"
                  />
                </div>
              </Field>

              

              {/* PASSWORD */}
              <Field label="Password">
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#777]"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    disabled={loading || googleLoading}
                    className="auth-input pl-[48px] pr-[48px]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    disabled={loading || googleLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777]"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </Field>

              {/* CONFIRM PASSWORD */}
              <Field label="Confirm Password">
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#777]"
                  />

                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    disabled={loading || googleLoading}
                    className="auth-input pl-[48px] pr-[48px]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm((value) => !value)
                    }
                    disabled={loading || googleLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777]"
                  >
                    {showConfirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </Field>

              {/* TERMS */}
              <label className="flex cursor-pointer items-start gap-2 pt-1 font-serif text-[11px] leading-5 text-[#666] sm:text-[12px]">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  disabled={loading || googleLoading}
                  className="mt-[2px] h-[16px] w-[16px] accent-[#c99516]"
                />

                <span>
                  I agree to the{" "}
                  <span className="font-semibold text-[#c28b12]">
                    Terms & Conditions
                  </span>{" "}
                  and{" "}
                  <span className="font-semibold text-[#c28b12]">
                    Privacy Policy
                  </span>
                </span>
              </label>

              {/* CREATE ACCOUNT */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="mt-2 flex h-[54px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#d99d08] font-serif text-[14px] font-bold text-white shadow-[0_7px_18px_rgba(217,157,8,0.20)] hover:bg-[#c88f05] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[56px]"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* DIVIDER */}
            <div className="my-6 flex items-center gap-4 sm:my-7">
              <div className="h-px flex-1 bg-[#e5e5e5]" />
              <span className="font-serif text-[11px] text-[#888]">
                OR
              </span>
              <div className="h-px flex-1 bg-[#e5e5e5]" />
            </div>

            {/* GOOGLE */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading || googleLoading}
              className="flex h-[54px] w-full items-center justify-center gap-3 rounded-[10px] border border-[#d9d9d9] bg-white font-serif text-[13px] font-bold text-[#333] hover:bg-[#fafafa] disabled:opacity-60 sm:h-[56px]"
            >
              {googleLoading ? (
                <Loader2 size={19} className="animate-spin" />
              ) : (
                <GoogleIcon />
              )}

              {googleLoading
                ? "Connecting..."
                : "Sign up with Google"}
            </button>

            {/* LOGIN */}
            <p className="mt-6 text-center font-serif text-[12px] text-[#777] sm:mt-7 sm:text-[13px]">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-bold text-[#c18b13] hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .auth-input {
          height: 54px;
          width: 100%;
          border-radius: 10px;
          border: 1px solid #d9d9d9;
          background: #ffffff;
          padding-right: 16px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 14px;
          color: #222222;
          outline: none;
          transition: all 0.2s ease;
        }

        .auth-input::placeholder {
          color: #999999;
        }

        .auth-input:focus {
          border-color: #c99516;
          box-shadow: 0 0 0 3px rgba(201, 149, 22, 0.1);
        }

        .auth-input:disabled {
          background: #fafafa;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block font-serif text-[12px] font-bold text-[#222] sm:text-[13px]">
        {label}
      </label>

      {children}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.78-.07-1.53-.2-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.39Z"
      />
      <path
        fill="#34A853"
        d="M12 21.5c2.63 0 4.84-.87 6.45-2.34l-3.14-2.43c-.87.58-1.98.93-3.31.93-2.55 0-4.71-1.72-5.49-4.03H3.27v2.51A9.74 9.74 0 0 0 12 21.5Z"
      />
      <path
        fill="#FBBC05"
        d="M6.51 13.63A5.85 5.85 0 0 1 6.2 12c0-.57.11-1.12.31-1.63V7.86H3.27A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.02 4.14l3.24 2.51 3.24-2.51Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.34c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.43 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.73 5.36l3.24 2.51 3.24 2.51 3.24 2.51C7.29 8.06 9.45 6.34 12 6.34Z"
      />
    </svg>
  );
}
