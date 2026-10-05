"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  LogIn,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // EMAIL + PASSWORD LOGIN
  // =========================================================

  const handleLogin = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading || googleLoading) return;

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

    try {
      setLoading(true);

      const {
        data,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (loginError) {
        console.error(
          "Supabase login error:",
          loginError
        );

        const message =
          loginError.message.toLowerCase();

        if (
          message.includes(
            "invalid login credentials"
          )
        ) {
          setError(
            "Invalid email or password."
          );
        } else if (
          message.includes(
            "email not confirmed"
          )
        ) {
          setError(
            "Please verify your email before logging in."
          );
        } else {
          setError(loginError.message);
        }

        return;
      }

      if (!data.session || !data.user) {
        setError(
          "Login session could not be created. Please try again."
        );
        return;
      }

      console.log(
        "Login successful:",
        data.user.email
      );

      setSuccess(
        "Login successful. Redirecting..."
      );

      // Small delay so success message is visible
      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 500);
    } catch (err) {
      console.error("Login error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GOOGLE LOGIN
  // =========================================================

  const handleGoogleLogin = async () => {
    if (loading || googleLoading) return;

    setError("");
    setSuccess("");

    try {
      setGoogleLoading(true);

      const redirectTo =
        `${window.location.origin}/auth/callback?next=/dashboard`;

      const {
        data,
        error: googleError,
      } =
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
        console.error(
          "Google login error:",
          googleError
        );

        setError(googleError.message);
        setGoogleLoading(false);
        return;
      }

      console.log(
        "Google OAuth started:",
        data
      );
    } catch (err) {
      console.error(
        "Google authentication error:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to continue with Google."
        );
      }

      setGoogleLoading(false);
    }
  };

  // =========================================================
  // PAGE UI
  // =========================================================

  return (
    <main
      className="
        min-h-screen
        bg-[#f8f6f1]
        px-3
        py-3
        sm:px-5
        sm:py-5
        lg:p-6
      "
    >
      {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}

      <div
        className="
          mx-auto
          grid
          w-full
          max-w-[1370px]
          overflow-hidden
          rounded-[22px]
          bg-white
          shadow-[0_8px_40px_rgba(0,0,0,0.08)]

          lg:min-h-[720px]
          lg:grid-cols-[1fr_1fr]
        "
      >
        {/* =====================================================
            DESKTOP BANNER
        ====================================================== */}

        <div
          className="
            relative
            hidden
            overflow-hidden
            bg-[#f4efe7]
            lg:block
          "
        >
          <img
            src="/login-banner.png"
            alt="PrimeCart"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
            "
          />
        </div>

        {/* =====================================================
            LOGIN SECTION
        ====================================================== */}

        <div
          className="
            flex
            w-full
            items-center
            justify-center
            bg-white

            px-5
            py-10

            sm:px-9
            sm:py-12

            md:px-12

            lg:px-12
            xl:px-16
            xl:py-14
          "
        >
          <div
            className="
              w-full
              max-w-[430px]
            "
          >
            {/* =================================================
                LOGO
            ================================================= */}

            <Link
              href="/"
              aria-label="PrimeCart Home"
              className="
                mb-8
                flex
                w-fit
                items-center
                gap-3
                transition-opacity
                duration-200
                hover:opacity-85

                sm:mb-9
                lg:mb-10
              "
            >
              <img
                src="/logo.png"
                alt="PrimeCart Logo"
                width={58}
                height={58}
                className="
                  h-[52px]
                  w-[52px]
                  object-contain

                  sm:h-[56px]
                  sm:w-[56px]
                "
              />

              <span
                className="
                  font-serif
                  text-[28px]
                  font-bold
                  tracking-[-0.8px]
                  text-[#111111]

                  sm:text-[30px]
                "
              >
                PrimeCart
              </span>
            </Link>

            {/* =================================================
                HEADING
            ================================================= */}

            <div
              className="
                mb-7
                sm:mb-8
              "
            >
              <h1
                className="
                  font-serif
                  text-[29px]
                  font-bold
                  leading-[1.2]
                  tracking-[-0.6px]
                  text-[#111111]

                  sm:text-[31px]
                  lg:text-[30px]
                "
              >
                Login to your account
              </h1>

              <p
                className="
                  mt-2
                  max-w-[390px]
                  font-serif
                  text-[14px]
                  leading-[1.6]
                  text-[#777777]

                  sm:text-[15px]
                "
              >
                Enter your email and password to
                access your account
              </p>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                role="alert"
                className="
                  mb-5
                  rounded-[10px]
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-[12px]
                  leading-5
                  text-red-700
                "
              >
                {error}
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (
              <div
                role="status"
                className="
                  mb-5
                  rounded-[10px]
                  border
                  border-green-200
                  bg-green-50
                  px-4
                  py-3
                  text-[12px]
                  leading-5
                  text-green-700
                "
              >
                {success}
              </div>
            )}

            {/* =================================================
                LOGIN FORM
            ================================================= */}

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >
              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="
                    mb-2
                    block
                    font-serif
                    text-[14px]
                    font-bold
                    text-[#222222]

                    sm:text-[15px]
                  "
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    strokeWidth={1.8}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#777777]
                    "
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={
                      loading ||
                      googleLoading
                    }
                    required
                    className="
                      h-[58px]
                      w-full
                      rounded-[11px]
                      border
                      border-[#d9d9d9]
                      bg-white
                      pl-[49px]
                      pr-4
                      font-serif
                      text-[14px]
                      text-[#222222]
                      outline-none
                      transition-all

                      placeholder:text-[#999999]

                      focus:border-[#d19a18]
                      focus:ring-[3px]
                      focus:ring-[#d19a18]/10

                      disabled:cursor-not-allowed
                      disabled:bg-[#fafafa]

                      sm:h-[60px]
                      sm:text-[15px]
                    "
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <div
                  className="
                    mb-2
                    flex
                    items-center
                    justify-between
                  "
                >
                  <label
                    htmlFor="password"
                    className="
                      font-serif
                      text-[14px]
                      font-bold
                      text-[#222222]

                      sm:text-[15px]
                    "
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="
                      font-serif
                      text-[12px]
                      font-bold
                      text-[#c18b13]
                      transition
                      hover:text-[#a8750b]
                      hover:underline

                      sm:text-[13px]
                    "
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    strokeWidth={1.8}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#777777]
                    "
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={
                      loading ||
                      googleLoading
                    }
                    required
                    className="
                      h-[58px]
                      w-full
                      rounded-[11px]
                      border
                      border-[#d9d9d9]
                      bg-white
                      pl-[49px]
                      pr-[52px]
                      font-serif
                      text-[14px]
                      text-[#222222]
                      outline-none
                      transition-all

                      placeholder:text-[#999999]

                      focus:border-[#d19a18]
                      focus:ring-[3px]
                      focus:ring-[#d19a18]/10

                      disabled:cursor-not-allowed
                      disabled:bg-[#fafafa]

                      sm:h-[60px]
                      sm:text-[15px]
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    disabled={
                      loading ||
                      googleLoading
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-[#777777]
                      transition
                      hover:text-[#222222]
                    "
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

              <label
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-2
                  font-serif
                  text-[13px]
                  text-[#555555]

                  sm:text-[14px]
                "
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                  disabled={
                    loading ||
                    googleLoading
                  }
                  className="
                    h-[17px]
                    w-[17px]
                    cursor-pointer
                    accent-[#c99516]
                  "
                />

                <span>Remember Me</span>
              </label>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={
                  loading ||
                  googleLoading
                }
                className="
                  flex
                  h-[58px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-[11px]
                  bg-[#d99d08]
                  font-serif
                  text-[15px]
                  font-bold
                  text-white
                  shadow-[0_7px_18px_rgba(217,157,8,0.20)]
                  transition-all
                  hover:bg-[#c88f05]
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  sm:h-[60px]
                  sm:text-[16px]
                "
              >
                {loading ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn size={19} />
                    Login
                  </>
                )}
              </button>
            </form>

            {/* =================================================
                OR
            ================================================= */}

            <div
              className="
                my-7
                flex
                items-center
                gap-4

                sm:my-8
              "
            >
              <div className="h-px flex-1 bg-[#e5e5e5]" />

              <span
                className="
                  font-serif
                  text-[12px]
                  font-medium
                  text-[#888888]

                  sm:text-[13px]
                "
              >
                OR
              </span>

              <div className="h-px flex-1 bg-[#e5e5e5]" />
            </div>

            {/* =================================================
                GOOGLE LOGIN
            ================================================= */}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={
                loading ||
                googleLoading
              }
              className="
                flex
                h-[58px]
                w-full
                items-center
                justify-center
                gap-3
                rounded-[11px]
                border
                border-[#d9d9d9]
                bg-white
                font-serif
                text-[14px]
                font-bold
                text-[#333333]
                transition-all
                hover:bg-[#fafafa]
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60

                sm:h-[60px]
                sm:text-[15px]
              "
            >
              {googleLoading ? (
                <Loader2
                  size={20}
                  className="animate-spin"
                />
              ) : (
                <GoogleIcon />
              )}

              {googleLoading
                ? "Connecting..."
                : "Continue with Google"}
            </button>

            {/* =================================================
                REGISTER LINK
            ================================================= */}

            <p
              className="
                mt-7
                pb-1
                text-center
                font-serif
                text-[13px]
                text-[#777777]

                sm:text-[14px]
              "
            >
              Don't have an account?{" "}

              <Link
                href="/register"
                className="
                  font-bold
                  text-[#c18b13]
                  transition
                  hover:underline
                "
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =============================================================
   GOOGLE ICON
============================================================= */

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
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
        d="M6.51 13.63A5.85 5.85 0 0 1 6.2 12c0-.57.11-1.12.31-1.63V7.86H3.27A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.02 4.14l3.24-2.51Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.34c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.43 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.73 5.36l3.24 2.51 3.24 2.51 3.24 2.51C7.29 8.06 9.45 6.34 12 6.34Z"
      />
    </svg>
  );
}
