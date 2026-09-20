"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  ChevronRight,
  Gift,
  Layers3,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Truck,
  Zap,
} from "lucide-react";

const categories = [
  { name: "Mobile", icon: "📱" },
  { name: "Home & Living", icon: "🏠" },
  { name: "Appliance", icon: "⚡" },
  { name: "Footwear", icon: "👟" },
  { name: "Watch", icon: "⌚" },
  { name: "Bag", icon: "👜" },
  { name: "Toy & Baby", icon: "🧸" },
  { name: "Automotive", icon: "🚗" },
  { name: "Fashion", icon: "👕" },
  { name: "Gaming", icon: "🎮" },
];

const features = [
  {
    icon: Brain,
    title: "PrimeMatch",
    text: "Tell us your needs, budget and priorities. PrimeCart helps you discover products that match you.",
    tag: "Smart Shopping",
  },
  {
    icon: Target,
    title: "Budget Builder",
    text: "Set your budget and shopping goal. Build a useful cart without going over your limit.",
    tag: "Budget Friendly",
  },
  {
    icon: Layers3,
    title: "Build My Setup",
    text: "Create complete setups for college, gaming, work, home, fitness and more.",
    tag: "Complete Kits",
  },
  {
    icon: Trophy,
    title: "PrimePoints",
    text: "Shop, explore and complete challenges to collect points and unlock rewards.",
    tag: "Rewards",
  },
  {
    icon: Gift,
    title: "Mystery Deal",
    text: "Reveal surprise deals selected especially for PrimeCart shoppers.",
    tag: "Surprise",
  },
  {
    icon: Zap,
    title: "Flash Deals",
    text: "Discover limited-time offers before they disappear.",
    tag: "Limited Time",
  },
];

const steps = [
  {
    number: "01",
    title: "Tell us what you need",
    text: "Choose your goal, category or shopping situation.",
  },
  {
    number: "02",
    title: "Set your budget",
    text: "Tell PrimeCart how much you want to spend.",
  },
  {
    number: "03",
    title: "Shop smarter",
    text: "Get relevant products instead of endless scrolling.",
  },
];

export default function HomePage() {
  return (
    <main className="landing-page">

      {/* ================= NAVBAR ================= */}

      <header className="navbar">
        <div className="container nav-inner">

          <Link href="/" className="logo">
            <span className="logo-icon">
              <Sparkles size={20} />
            </span>

            <span className="logo-text">
              Prime<span>Cart</span>
            </span>
          </Link>

          <nav className="nav-links">
            <a href="#features">Why PrimeCart</a>
            <a href="#categories">Categories</a>
            <a href="#how">How It Works</a>
          </nav>

          <div className="nav-actions">
            <Link href="/auth/login" className="login-btn">
              Login
            </Link>

            <Link href="/auth/register" className="start-btn">
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </header>

      {/* ================= HERO ================= */}

      <section className="hero">

        <div className="container hero-grid">

          <div className="hero-content">

            <div className="hero-badge">
              <Sparkles size={14} />
              A smarter way to shop
            </div>

            <h1>
              Don&apos;t just shop.
              <br />
              <span>Shop smarter.</span>
            </h1>

            <p>
              PrimeCart helps you discover the right products based on your
              needs, budget and lifestyle — so you spend less time searching
              and more time choosing.
            </p>

            <div className="hero-buttons">

              <Link href="/auth/register" className="primary-btn">
                Start Shopping
                <ArrowRight size={18} />
              </Link>

              <a href="#features" className="secondary-btn">
                Explore PrimeCart
                <ChevronRight size={17} />
              </a>

            </div>

            <div className="trust-items">

              <div>
                <ShieldCheck size={18} />
                Secure Shopping
              </div>

              <div>
                <Truck size={18} />
                Easy Delivery
              </div>

              <div>
                <BadgeCheck size={18} />
                Smart Choices
              </div>

            </div>

          </div>

          {/* HERO MOCKUP */}

          <div className="hero-visual">

            <div className="glow glow-1" />
            <div className="glow glow-2" />

            <div className="match-card">

              <div className="match-header">

                <div>
                  <span>PRIMEMATCH</span>
                  <h3>Your perfect match</h3>
                </div>

                <div className="match-score">
                  92%
                </div>

              </div>

              <div className="product-preview">

                <div className="product-image">
                  📱
                </div>

                <div className="product-info">

                  <small>Mobile</small>

                  <h4>
                    Smartphone Pro Max
                  </h4>

                  <div className="rating">
                    ★ 4.8
                    <span>• 1.2k reviews</span>
                  </div>

                  <strong>
                    ₹24,999
                  </strong>

                </div>

                <button className="add-button">
                  +
                </button>

              </div>

              <div className="match-tags">
                <span>✓ Within your budget</span>
                <span>✓ Highly rated</span>
                <span>✓ Matches your needs</span>
              </div>

            </div>

            <div className="floating budget-card">

              <div className="floating-icon">
                💰
              </div>

              <div>
                <small>Your budget</small>
                <strong>₹30,000</strong>
              </div>

            </div>

            <div className="floating points-card">

              <div className="floating-icon">
                ⭐
              </div>

              <div>
                <small>PrimePoints</small>
                <strong>+120 earned</strong>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= STATS ================= */}

      <section className="stats">

        <div className="container stats-grid">

          <div>
            <strong>Smart</strong>
            <span>Product Discovery</span>
          </div>

          <div>
            <strong>10+</strong>
            <span>Shopping Categories</span>
          </div>

          <div>
            <strong>6</strong>
            <span>Smart Shopping Tools</span>
          </div>

          <div>
            <strong>1</strong>
            <span>Simple Experience</span>
          </div>

        </div>

      </section>

      {/* ================= FEATURES ================= */}

      <section id="features" className="features">

        <div className="container">

          <div className="section-title">

            <span>WHY PRIMECART</span>

            <h2>
              Shopping should feel
              <br />
              <strong>personal.</strong>
            </h2>

            <p>
              PrimeCart is built around how you shop — not just what you want
              to buy.
            </p>

          </div>

          <div className="feature-grid">

            {features.map((feature) => {

              const Icon = feature.icon;

              return (
                <div className="feature-card" key={feature.title}>

                  <div className="feature-top">

                    <div className="feature-icon">
                      <Icon size={22} />
                    </div>

                    <span>
                      {feature.tag}
                    </span>

                  </div>

                  <h3>
                    {feature.title}
                  </h3>

                  <p>
                    {feature.text}
                  </p>

                  <div className="feature-link">
                    Explore
                    <ArrowRight size={15} />
                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </section>

      {/* ================= CATEGORIES ================= */}

      <section id="categories" className="categories">

        <div className="container">

          <div className="category-heading">

            <div>

              <span>
                EXPLORE
              </span>

              <h2>
                Find your
                <br />
                <strong>category.</strong>
              </h2>

            </div>

            <Link
              href="/auth/register"
              className="view-all"
            >
              View all
              <ArrowRight size={16} />
            </Link>

          </div>

          <div className="category-grid">

            {categories.map((category) => (

              <Link
                href="/auth/register"
                className="category-card"
                key={category.name}
              >

                <div className="category-icon">
                  {category.icon}
                </div>

                <div>

                  <strong>
                    {category.name}
                  </strong>

                  <span>
                    Explore
                    <ArrowRight size={13} />
                  </span>

                </div>

              </Link>

            ))}

          </div>

        </div>

      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section id="how" className="how">

        <div className="container how-grid">

          <div className="how-intro">

            <span>
              HOW IT WORKS
            </span>

            <h2>
              Less scrolling.
              <br />
              <strong>Better choices.</strong>
            </h2>

            <p>
              PrimeCart turns your shopping goal into a simple,
              personalized journey.
            </p>

            <Link
              href="/auth/register"
              className="primary-btn"
            >
              Try PrimeCart
              <ArrowRight size={17} />
            </Link>

          </div>

          <div className="steps">

            {steps.map((step) => (

              <div className="step" key={step.number}>

                <div className="step-number">
                  {step.number}
                </div>

                <div>

                  <h3>
                    {step.title}
                  </h3>

                  <p>
                    {step.text}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ================= DIFFERENCE ================= */}

      <section className="difference">

        <div className="container">

          <div className="difference-card">

            <div className="difference-content">

              <span>
                THE PRIMECART DIFFERENCE
              </span>

              <h2>
                Stop searching for
                <br />
                <strong>hours.</strong>
              </h2>

              <p>
                Whether you need a new phone, a gaming setup, college
                essentials or something for your home — PrimeCart helps
                you narrow down the choices.
              </p>

              <div className="difference-list">

                <div>
                  <b>01</b>
                  Personalized discovery
                </div>

                <div>
                  <b>02</b>
                  Budget-aware recommendations
                </div>

                <div>
                  <b>03</b>
                  Situation-based shopping
                </div>

              </div>

              <Link
                href="/auth/register"
                className="primary-btn"
              >
                Create Your Account
                <ArrowRight size={17} />
              </Link>

            </div>

            <div className="difference-visual">

              <div className="smart-circle">
                <Brain size={55} />
              </div>

              <div className="mini-card mini-one">
                <small>Need</small>
                <strong>Gaming Setup</strong>
              </div>

              <div className="mini-card mini-two">
                <small>Budget</small>
                <strong>₹50,000</strong>
              </div>

              <div className="mini-card mini-three">
                <small>Match</small>
                <strong>96%</strong>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= CTA ================= */}

      <section className="cta">

        <div className="container">

          <div className="cta-card">

            <div className="circle circle-one" />
            <div className="circle circle-two" />

            <div className="cta-content">

              <span>
                READY?
              </span>

              <h2>
                Your smarter
                <br />
                shopping journey starts here.
              </h2>

              <p>
                Create your PrimeCart account and discover a different
                way to shop.
              </p>

              <Link
                href="/auth/register"
                className="cta-btn"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <div className="container">

          <div className="footer-top">

            <div className="footer-brand">

              <Link href="/" className="logo">

                <span className="logo-icon">
                  <Sparkles size={19} />
                </span>

                <span className="logo-text">
                  Prime<span>Cart</span>
                </span>

              </Link>

              <p>
                Shop smarter. Discover better.
                <br />
                Built for the way you shop.
              </p>

            </div>

            <div className="footer-columns">

              <div>
                <h4>Explore</h4>
                <a href="#features">Features</a>
                <a href="#categories">Categories</a>
                <a href="#how">How it works</a>
              </div>

              <div>
                <h4>Account</h4>
                <Link href="/auth/login">
                  Login
                </Link>
                <Link href="/auth/register">
                  Register
                </Link>
              </div>

              <div>
                <h4>PrimeCart</h4>
                <span>PrimeMatch</span>
                <span>Budget Builder</span>
                <span>PrimePoints</span>
              </div>

            </div>

          </div>

          <div className="footer-bottom">

            <span>
              © 2026 PrimeCart. All rights reserved.
            </span>

            <span>
              Made for smarter shoppers.
            </span>

          </div>

        </div>

      </footer>

      {/* ================= CSS ================= */}

      <style jsx global>{`

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #fcfaf6;
          color: #17140e;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
        }

        a {
          text-decoration: none;
          color: inherit;
        }

        .container {
          width: min(1180px, calc(100% - 40px));
          margin: auto;
        }

        /* NAVBAR */

        .navbar {
          height: 76px;
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(252,250,246,.94);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid #eee5d6;
        }

        .nav-inner {
          height: 100%;
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 900;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #17140e;
          color: #dfb85d;
        }

        .logo-text {
          font-size: 21px;
          letter-spacing: -.8px;
        }

        .logo-text span {
          color: #b8872d;
        }

        .nav-links {
          display: flex;
          gap: 34px;
          margin-left: auto;
        }

        .nav-links a {
          color: #686157;
          font-size: 13px;
          font-weight: 650;
        }

        .nav-links a:hover {
          color: #17140e;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .login-btn {
          padding: 11px 14px;
          font-size: 13px;
          font-weight: 750;
        }

        .start-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 11px 16px;
          border-radius: 12px;
          background: #17140e;
          color: #fff;
          font-size: 13px;
          font-weight: 750;
        }

        /* HERO */

        .hero {
          padding: 90px 0 100px;
          overflow: hidden;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 70px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 13px;
          border-radius: 999px;
          background: #f8efdc;
          color: #87641f;
          border: 1px solid #ead9b5;
          font-size: 10px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: .7px;
        }

        .hero-content h1 {
          font-size: clamp(52px,6vw,76px);
          line-height: .98;
          letter-spacing: -4px;
          margin: 23px 0;
        }

        .hero-content h1 span {
          color: #bc8d2e;
        }

        .hero-content > p {
          max-width: 590px;
          color: #6e675c;
          font-size: 16px;
          line-height: 1.75;
        }

        .hero-buttons {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 30px;
          flex-wrap: wrap;
        }

        .primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          border-radius: 13px;
          background: #17140e;
          color: white;
          font-size: 13px;
          font-weight: 800;
          transition: .2s;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
        }

        .secondary-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 14px;
          font-size: 13px;
          font-weight: 750;
        }

        .trust-items {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 35px;
          color: #7b7468;
          font-size: 11px;
          font-weight: 650;
        }

        .trust-items div {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .trust-items svg {
          color: #b98b30;
        }

        /* HERO VISUAL */

        .hero-visual {
          min-height: 520px;
          position: relative;
          display: grid;
          place-items: center;
        }

        .glow {
          position: absolute;
          border-radius: 50%;
        }

        .glow-1 {
          width: 370px;
          height: 370px;
          background: #efdfb8;
          opacity: .55;
        }

        .glow-2 {
          width: 220px;
          height: 220px;
          right: 10px;
          bottom: 30px;
          background: #e9d09c;
          opacity: .35;
        }

        .match-card {
          width: min(430px,100%);
          padding: 24px;
          position: relative;
          z-index: 2;
          background: white;
          border: 1px solid #eadfcb;
          border-radius: 27px;
          box-shadow: 0 30px 80px rgba(67,49,18,.13);
        }

        .match-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .match-header span {
          color: #a77924;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .match-header h3 {
          font-size: 20px;
          margin: 5px 0 0;
        }

        .match-score {
          width: 53px;
          height: 53px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          background: #f5ead2;
          color: #87631d;
          font-size: 14px;
          font-weight: 900;
        }

        .product-preview {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 22px;
          padding: 15px;
          background: #f8f5ef;
          border-radius: 18px;
        }

        .product-image {
          width: 82px;
          height: 82px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: #eee3cf;
          font-size: 38px;
        }

        .product-info {
          flex: 1;
        }

        .product-info small {
          color: #a77924;
          font-size: 9px;
          text-transform: uppercase;
          font-weight: 850;
        }

        .product-info h4 {
          margin: 5px 0;
          font-size: 14px;
        }

        .rating {
          color: #a77924;
          font-size: 10px;
          font-weight: 800;
          margin-bottom: 7px;
        }

        .rating span {
          color: #8a8379;
          font-weight: 500;
        }

        .product-info strong {
          font-size: 17px;
        }

        .add-button {
          width: 35px;
          height: 35px;
          border: 0;
          border-radius: 11px;
          background: #17140e;
          color: white;
          font-size: 22px;
        }

        .match-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 16px;
        }

        .match-tags span {
          padding: 7px 9px;
          border-radius: 8px;
          background: #f8f3e8;
          color: #766d5f;
          font-size: 9px;
          font-weight: 700;
        }

        .floating {
          position: absolute;
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px;
          background: white;
          border: 1px solid #e8dfd0;
          border-radius: 15px;
          box-shadow: 0 15px 35px rgba(60,44,19,.12);
        }

        .budget-card {
          top: 35px;
          left: -5px;
        }

        .points-card {
          right: -5px;
          bottom: 45px;
        }

        .floating-icon {
          width: 35px;
          height: 35px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #f5ead2;
        }

        .floating small {
          display: block;
          color: #8b8377;
          font-size: 9px;
        }

        .floating strong {
          display: block;
          font-size: 12px;
          margin-top: 3px;
        }

        /* STATS */

        .stats {
          border-top: 1px solid #eee5d6;
          border-bottom: 1px solid #eee5d6;
          background: white;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
        }

        .stats-grid > div {
          padding: 25px 20px;
          border-right: 1px solid #eee5d6;
        }

        .stats-grid > div:last-child {
          border-right: 0;
        }

        .stats-grid strong {
          display: block;
          font-size: 25px;
        }

        .stats-grid span {
          display: block;
          margin-top: 5px;
          color: #837b70;
          font-size: 11px;
        }

        /* FEATURES */

        .features {
          padding: 115px 0;
        }

        .section-title {
          text-align: center;
          margin-bottom: 55px;
        }

        .section-title > span,
        .category-heading > div > span,
        .how-intro > span,
        .difference-content > span,
        .cta-content > span {
          color: #a37826;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.7px;
        }

        .section-title h2,
        .category-heading h2,
        .how-intro h2,
        .difference-content h2 {
          font-size: clamp(40px,5vw,58px);
          line-height: 1.04;
          letter-spacing: -2.5px;
          margin: 14px 0;
        }

        .section-title h2 strong,
        .category-heading h2 strong,
        .how-intro h2 strong,
        .difference-content h2 strong {
          color: #bd8e2f;
        }

        .section-title p {
          max-width: 550px;
          margin: auto;
          color: #777064;
          line-height: 1.7;
          font-size: 14px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 18px;
        }

        .feature-card {
          padding: 25px;
          background: white;
          border: 1px solid #e9e1d2;
          border-radius: 21px;
          transition: .25s;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 45px rgba(65,48,18,.08);
          border-color: #dcc79a;
        }

        .feature-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #f6efdf;
          color: #936b21;
        }

        .feature-top span {
          padding: 7px 9px;
          border-radius: 8px;
          background: #f7f5f0;
          color: #8c8376;
          font-size: 9px;
          font-weight: 800;
        }

        .feature-card h3 {
          font-size: 19px;
          margin: 25px 0 9px;
        }

        .feature-card p {
          min-height: 62px;
          margin: 0;
          color: #777064;
          font-size: 12px;
          line-height: 1.7;
        }

        .feature-link {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 20px;
          color: #9a7126;
          font-size: 11px;
          font-weight: 800;
        }

        /* CATEGORIES */

        .categories {
          padding: 95px 0;
          background: #f5f0e7;
        }

        .category-heading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          margin-bottom: 40px;
        }

        .view-all {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 800;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(5,1fr);
          gap: 12px;
        }

        .category-card {
          min-height: 145px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: white;
          border: 1px solid #e9e1d2;
          border-radius: 19px;
          transition: .2s;
        }

        .category-card:hover {
          transform: translateY(-4px);
          border-color: #d7bc7e;
        }

        .category-icon {
          font-size: 33px;
        }

        .category-card strong {
          display: block;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .category-card span {
          display: flex;
          align-items: center;
          gap: 3px;
          color: #918879;
          font-size: 9px;
        }

        /* HOW */

        .how {
          padding: 115px 0;
        }

        .how-grid {
          display: grid;
          grid-template-columns: .8fr 1.2fr;
          gap: 90px;
          align-items: center;
        }

        .how-intro p {
          max-width: 390px;
          color: #777064;
          font-size: 14px;
          line-height: 1.75;
          margin-bottom: 28px;
        }

        .steps {
          border-left: 1px solid #dfd5c3;
        }

        .step {
          display: flex;
          gap: 25px;
          padding: 22px 0 22px 30px;
        }

        .step-number {
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #f5ead2;
          color: #956c20;
          font-size: 10px;
          font-weight: 900;
        }

        .step h3 {
          margin: 1px 0 7px;
          font-size: 17px;
        }

        .step p {
          margin: 0;
          color: #81796e;
          font-size: 12px;
          line-height: 1.6;
        }

        /* DIFFERENCE */

        .difference {
          padding-bottom: 110px;
        }

        .difference-card {
          display: grid;
          grid-template-columns: 1fr .9fr;
          min-height: 530px;
          overflow: hidden;
          border-radius: 30px;
          background: #17140e;
          color: white;
        }

        .difference-content {
          padding: 70px;
        }

        .difference-content p {
          max-width: 520px;
          color: #c5beb2;
          font-size: 13px;
          line-height: 1.75;
        }

        .difference-list {
          display: grid;
          gap: 10px;
          margin: 27px 0;
        }

        .difference-list div {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
        }

        .difference-list b {
          color: #d5af59;
          font-size: 9px;
        }

        .difference-visual {
          position: relative;
          display: grid;
          place-items: center;
          background: radial-gradient(circle,#51401f,#2d2619 40%,#17140e 70%);
        }

        .smart-circle {
          width: 170px;
          height: 170px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #d6b05c;
          background: #302816;
          border: 1px solid #65532d;
          box-shadow:
            0 0 0 20px rgba(203,166,82,.04),
            0 0 0 45px rgba(203,166,82,.025);
        }

        .mini-card {
          position: absolute;
          min-width: 130px;
          padding: 13px 16px;
          border-radius: 14px;
          background: rgba(255,255,255,.09);
          border: 1px solid rgba(255,255,255,.14);
          backdrop-filter: blur(10px);
        }

        .mini-card small {
          display: block;
          color: #b9b1a5;
          font-size: 8px;
          margin-bottom: 5px;
        }

        .mini-card strong {
          font-size: 12px;
        }

        .mini-one {
          top: 85px;
          left: 30px;
        }

        .mini-two {
          top: 50%;
          right: 25px;
        }

        .mini-three {
          bottom: 75px;
          left: 50px;
        }

        /* CTA */

        .cta {
          padding-bottom: 100px;
        }

        .cta-card {
          position: relative;
          overflow: hidden;
          padding: 75px 25px;
          border-radius: 30px;
          background: #f0dfb9;
          text-align: center;
        }

        .cta-content {
          position: relative;
          z-index: 2;
        }

        .cta-content h2 {
          font-size: clamp(40px,5vw,60px);
          line-height: 1.02;
          letter-spacing: -2.5px;
          margin: 15px 0;
        }

        .cta-content p {
          color: #71664f;
          font-size: 14px;
          margin-bottom: 28px;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 21px;
          border-radius: 13px;
          background: #17140e;
          color: white;
          font-size: 13px;
          font-weight: 800;
        }

        .circle {
          position: absolute;
          border: 1px solid rgba(102,75,24,.13);
          border-radius: 50%;
        }

        .circle-one {
          width: 350px;
          height: 350px;
          left: -100px;
          top: -160px;
        }

        .circle-two {
          width: 450px;
          height: 450px;
          right: -170px;
          bottom: -250px;
        }

        /* FOOTER */

        .footer {
          padding: 65px 0 25px;
          background: #17140e;
          color: white;
        }

        .footer-top {
          display: flex;
          justify-content: space-between;
          gap: 60px;
          padding-bottom: 55px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }

        .footer-brand p {
          color: #9c968c;
          font-size: 11px;
          line-height: 1.7;
        }

        .footer-columns {
          display: flex;
          gap: 75px;
        }

        .footer-columns div {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 120px;
        }

        .footer-columns h4 {
          margin: 0 0 6px;
          color: #d4ae5b;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .footer-columns a,
        .footer-columns span {
          color: #9c968c;
          font-size: 11px;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          padding-top: 22px;
          color: #746f67;
          font-size: 9px;
        }

        /* MOBILE */

        @media (max-width: 1000px) {

          .hero-grid {
            grid-template-columns: 1fr;
          }

          .hero-content {
            text-align: center;
          }

          .hero-content > p {
            margin: auto;
          }

          .hero-buttons,
          .trust-items {
            justify-content: center;
          }

          .hero-visual {
            width: 100%;
            max-width: 600px;
            margin: auto;
          }

          .feature-grid {
            grid-template-columns: repeat(2,1fr);
          }

          .category-grid {
            grid-template-columns: repeat(4,1fr);
          }

        }

        @media (max-width: 760px) {

          .container {
            width: calc(100% - 26px);
          }

          .navbar {
            height: 68px;
          }

          .nav-links {
            display: none;
          }

          .nav-inner {
            justify-content: space-between;
          }

          .login-btn {
            display: none;
          }

          .start-btn {
            padding: 10px 12px;
          }

          .hero {
            padding: 55px 0 65px;
          }

          .hero-content h1 {
            font-size: 48px;
            letter-spacing: -2.8px;
          }

          .hero-content > p {
            font-size: 14px;
          }

          .hero-visual {
            min-height: 420px;
          }

          .match-card {
            padding: 18px;
          }

          .budget-card {
            left: 0;
            top: 10px;
          }

          .points-card {
            right: 0;
            bottom: 10px;
          }

          .stats-grid {
            grid-template-columns: repeat(2,1fr);
          }

          .stats-grid > div:nth-child(2) {
            border-right: 0;
          }

          .feature-grid {
            grid-template-columns: 1fr;
          }

          .category-grid {
            grid-template-columns: repeat(2,1fr);
          }

          .category-heading {
            align-items: flex-start;
          }

          .how-grid {
            grid-template-columns: 1fr;
            gap: 50px;
          }

          .difference-card {
            grid-template-columns: 1fr;
          }

          .difference-content {
            padding: 40px 25px;
          }

          .difference-visual {
            min-height: 370px;
          }

          .footer-top {
            flex-direction: column;
          }

          .footer-columns {
            gap: 30px;
            flex-wrap: wrap;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 7px;
          }

        }

        @media (max-width: 430px) {

          .logo-text {
            font-size: 18px;
          }

          .hero-content h1 {
            font-size: 42px;
          }

          .hero-visual {
            min-height: 390px;
          }

          .product-image {
            width: 65px;
            height: 65px;
          }

          .product-preview {
            gap: 9px;
            padding: 10px;
          }

          .match-tags span {
            font-size: 8px;
          }

          .floating {
            transform: scale(.88);
          }

          .section-title h2,
          .category-heading h2,
          .how-intro h2,
          .difference-content h2 {
            font-size: 39px;
          }

          .category-card {
            min-height: 125px;
            padding: 15px;
          }

        }

      `}</style>

    </main>
  );
}
