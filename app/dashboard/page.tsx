"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Heart,
  Home,
  Laptop,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Tag,
  Truck,
  UserRound,
  Watch,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Package,
  Shirt,
  Footprints,
  Baby,
  Dumbbell,
  Car,
  BookOpen,
  Palette,
  Gamepad2,
  Monitor,
  X,
  LogOut,
  Settings,
  User,
  Zap,
} from "lucide-react";

type Product = {
  id: string | number;
  category_id: string | number | null;
  name: string;
  slug?: string | null;
  short_description?: string | null;
  description?: string | null;
  price: number | null;
  original_price: number | null;
  stock: number | null;
  image_url: string | null;
  brand?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  is_featured?: boolean | null;
  is_flash_sale?: boolean | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

type Category = {
  id: string | number;
  name: string;
};

type CartItem = {
  id: string | number;
  name: string;
  price: number;
  image_url?: string | null;
  quantity: number;
};

type UserInfo = {
  name: string;
  email: string;
};

const CART_KEY = "primecart-cart";
const WISHLIST_KEY = "primecart-wishlist";
const THEME_KEY = "primecart-theme";

const HERO_BANNERS = [
  "/banner/hero-banner.png",
  "/banner/hero-banner-2.png",
  "/banner/hero-banner-3.png",
  "/banner/hero-banner-4.png",
  "/banner/hero-banner-5.png",
  "/banner/hero-banner-6.png",
  "/banner/hero-banner-7.png",
  "/banner/hero-banner-8.png",
];

const CATEGORY_ORDER = [
  "Mobile",
  "Electronics",
  "Home & Kitchen",
  "Fashion",
  "Footwear",
  "Beauty",
  "Beauty & Personal Care",
  "Toy & Baby",
  "Toys & Baby",
  "Sports & Fitness",
  "Appliance",
  "Appliances",
  "Automotive",
  "Eyewear",
  "Books",
  "Gaming",
  "Watch",
  "Bag",
];

function getImageUrl(value?: string | null) {
  if (!value?.trim()) return "";
  const v = value.trim();
  if (/^https?:\/\//i.test(v) || v.startsWith("/")) return v;
  return `/${v}`;
}

function formatPrice(value: number | null | undefined) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getDiscount(price: number | null | undefined, original: number | null | undefined) {
  if (!price || !original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getCategoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("mobile")) return Smartphone;
  if (n.includes("electronic")) return Laptop;
  if (n.includes("home") || n.includes("kitchen")) return Home;
  if (n.includes("fashion")) return Shirt;
  if (n.includes("foot")) return Footprints;
  if (n.includes("beauty")) return Sparkles;
  if (n.includes("toy") || n.includes("baby")) return Baby;
  if (n.includes("sport")) return Dumbbell;
  if (n.includes("appliance")) return Monitor;
  if (n.includes("auto")) return Car;
  if (n.includes("eye")) return Eye;
  if (n.includes("book")) return BookOpen;
  if (n.includes("gaming")) return Gamepad2;
  if (n.includes("watch")) return Watch;
  if (n.includes("bag")) return ShoppingBag;
  return Package;
}

function ProductCard({
  product,
  category,
  wished,
  onWishlist,
  onCart,
  onOpen,
}: {
  product: Product;
  category: string;
  wished: boolean;
  onWishlist: () => void;
  onCart: () => void;
  onOpen: () => void;
}) {
  const discount = getDiscount(product.price, product.original_price);

  return (
    <article className="product-card">
      <button className="wish-btn" aria-label="Wishlist" onClick={onWishlist}>
        <Heart size={17} fill={wished ? "currentColor" : "none"} />
      </button>

      {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
      {product.is_featured && <span className="mini-badge">Bestseller</span>}

      <button className="product-image-wrap" onClick={onOpen} aria-label={`Open ${product.name}`}>
        {product.image_url ? (
          <img
            src={getImageUrl(product.image_url)}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.fallback) {
                target.dataset.fallback = "1";
                target.src = "/product-placeholder.png";
              }
            }}
          />
        ) : (
          <ShoppingBag size={48} strokeWidth={1.2} />
        )}
      </button>

      <div className="product-copy">
        <div className="product-category">{category}</div>
        <button className="product-name" onClick={onOpen}>{product.name}</button>

        <div className="rating-row">
          <span className="rating-pill">
            {Number(product.rating || 0).toFixed(1)} <Star size={11} fill="currentColor" />
          </span>
          <span className="review-count">({Number(product.reviews_count || 0).toLocaleString("en-IN")})</span>
        </div>

        <div className="price-row">
          <strong>{formatPrice(product.price)}</strong>
          {product.original_price && product.original_price > Number(product.price || 0) && (
            <del>{formatPrice(product.original_price)}</del>
          )}
        </div>

        <button className="add-cart-btn" onClick={onCart}>
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const categoryRailRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Array<string | number>>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [toast, setToast] = useState("");
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setErrorMessage("");

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (user) {
          setUserLoggedIn(true);
          const meta = user.user_metadata || {};
          setUserInfo({
            name: meta.full_name || meta.name || user.email?.split("@")[0] || "PrimeCart User",
            email: user.email || "",
          });
        }

        const [{ data: productData, error: productError }, { data: categoryData, error: categoryError }] = await Promise.all([
          supabase
            .from("products")
            .select(
              "id,category_id,name,slug,short_description,description,price,original_price,stock,image_url,brand,rating,reviews_count,is_featured,is_flash_sale,is_active,created_at"
            )
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(100),
          supabase.from("categories").select("id,name").order("name", { ascending: true }),
        ]);

        if (productError) throw productError;
        if (categoryError) console.warn(categoryError.message);

        if (!mounted) return;
        setProducts(productData || []);
        setCategories(categoryData || []);
      } catch (error) {
        console.error(error);
        if (mounted) setErrorMessage("Unable to load products right now. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();

    try {
      const savedCart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      const savedWishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (Array.isArray(savedCart)) setCart(savedCart);
      if (Array.isArray(savedWishlist)) setWishlist(savedWishlist);
      if (savedTheme === "dark") setTheme("dark");
    } catch {}

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % HERO_BANNERS.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category) => map.set(String(category.id), category.name));
    return map;
  }, [categories]);

  const visibleCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const ai = CATEGORY_ORDER.findIndex((x) => x.toLowerCase() === a.name.toLowerCase());
      const bi = CATEGORY_ORDER.findIndex((x) => x.toLowerCase() === b.name.toLowerCase());
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [categories]);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((product) => {
        const category = categoryMap.get(String(product.category_id)) || "";
        return `${product.name} ${product.brand || ""} ${category}`.toLowerCase().includes(q);
      })
      .slice(0, 6);
  }, [search, products, categoryMap]);

  const featuredProducts = useMemo(() => {
    const featured = products.filter((product) => product.is_featured);
    return (featured.length ? featured : products).slice(0, 5);
  }, [products]);

  const flashProducts = useMemo(() => {
    const flash = products.filter((product) => product.is_flash_sale);
    const discounted = products.filter((product) => getDiscount(product.price, product.original_price) >= 10);
    return (flash.length ? flash : discounted.length ? discounted : products).slice(0, 5);
  }, [products]);

  const topDeals = useMemo(() => {
    return [...products]
      .sort((a, b) => getDiscount(b.price, b.original_price) - getDiscount(a.price, a.original_price))
      .slice(0, 3);
  }, [products]);

  const categoryCards = visibleCategories.slice(0, 10);

  const cartCount = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  function showToast(message: string) {
    setToast(message);
  }

  function toggleWishlist(id: string | number) {
    setWishlist((current) => {
      const exists = current.some((value) => String(value) === String(id));
      const next = exists
        ? current.filter((value) => String(value) !== String(id))
        : [...current, id];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      showToast(exists ? "Removed from Wishlist" : "Added to Wishlist");
      return next;
    });
  }

  function addToCart(product: Product) {
    setCart((current) => {
      const exists = current.find((item) => String(item.id) === String(product.id));
      const next = exists
        ? current.map((item) =>
            String(item.id) === String(product.id)
              ? { ...item, quantity: Math.min(item.quantity + 1, Number(product.stock || 999)) }
              : item
          )
        : [
            ...current,
            {
              id: product.id,
              name: product.name,
              price: Number(product.price || 0),
              image_url: product.image_url,
              quantity: 1,
            },
          ];
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
    showToast("Added to Cart");
  }

  function openProduct(product: Product) {
    router.push(`/dashboard/products/${product.id}`);
  }

  function openCategory(category: Category) {
    router.push(`/dashboard/categories/${slugify(category.name)}`);
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    if (!search.trim()) return;
    router.push(`/dashboard/products?search=${encodeURIComponent(search.trim())}`);
  }

  function scrollCategories(direction: "left" | "right") {
    categoryRailRef.current?.scrollBy({
      left: direction === "left" ? -450 : 450,
      behavior: "smooth",
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  }

  if (loading) return <LoadingScreen />;

  return (
    <main className="store-shell">
      <div className="top-strip">
        <div className="container strip-inner">
          <div className="strip-left">
            <span><Truck size={15} /> Free Shipping above ₹499</span>
            <i />
            <span><RotateCcw size={15} /> Easy Returns</span>
            <i />
            <span><ShieldCheck size={15} /> Secure Shopping</span>
          </div>
          <div className="strip-right">
            <span>Get 10% OFF on your first order</span>
            <i />
            <span>Use code: <b>WELCOME10</b></span>
          </div>
        </div>
      </div>

      <header className="main-header">
        <div className="container header-main">
          <Link href="/dashboard" className="logo-wrap" aria-label="PrimeCart home">
            <img src="/logo.png" alt="PrimeCart" className="brand-logo" />
          </Link>

          <form className="search-box" onSubmit={submitSearch}>
            <Search size={19} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search for products, brands and more..."
              aria-label="Search products"
            />
            <button type="submit">Search</button>

            {searchOpen && search.trim() && (
              <div className="search-dropdown">
                {searchResults.length ? (
                  searchResults.map((product) => (
                    <button
                      key={String(product.id)}
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        openProduct(product);
                      }}
                    >
                      <span className="suggestion-image">
                        {product.image_url ? <img src={getImageUrl(product.image_url)} alt="" /> : <ShoppingBag size={18} />}
                      </span>
                      <span>
                        <strong>{product.name}</strong>
                        <small>{formatPrice(product.price)}</small>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="no-suggestions">No products found</div>
                )}
              </div>
            )}
          </form>

          <div className="header-actions">
            {userLoggedIn ? (
              <div className="account-area">
                <button className="header-action" onClick={() => setProfileOpen((value) => !value)}>
                  <UserRound size={22} />
                  <span>Account</span>
                </button>
                {profileOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-top">
                      <div className="profile-avatar"><UserRound size={20} /></div>
                      <div>
                        <strong>{userInfo.name}</strong>
                        <small>{userInfo.email}</small>
                      </div>
                    </div>
                    <Link href="/dashboard/profile"><User size={16} /> My Profile</Link>
                    <Link href="/dashboard/orders"><Package size={16} /> My Orders</Link>
                    <Link href="/dashboard/settings"><Settings size={16} /> Settings</Link>
                    <button onClick={logout}><LogOut size={16} /> Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="header-action">
                <UserRound size={22} />
                <span>Login / Register</span>
              </Link>
            )}

            <Link href="/dashboard/wishlist" className="header-action wishlist-action">
              <span className="icon-with-badge">
                <Heart size={23} />
                {wishlist.length > 0 && <b>{wishlist.length}</b>}
              </span>
              <span>Wishlist</span>
            </Link>

            <Link href="/dashboard/cart" className="header-action cart-action">
              <span className="icon-with-badge">
                <ShoppingCart size={24} />
                {cartCount > 0 && <b>{cartCount > 99 ? "99+" : cartCount}</b>}
              </span>
              <span>Cart</span>
            </Link>
          </div>

          <button className="mobile-menu-button" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            <Menu size={25} />
          </button>
        </div>
      </header>

      <nav className="nav-bar">
        <div className="container nav-inner">
          <button className="all-category-btn" onClick={() => router.push("/dashboard/categories")}>
            <Menu size={19} /> All Categories
          </button>
          <Link href="/dashboard">Home</Link>
          <Link href="/dashboard/products?deal=flash">Deals</Link>
          <Link href="/dashboard/products?sort=bestseller">Best Sellers</Link>
          <Link href="/dashboard/products?sort=newest">New Arrivals</Link>
          <Link href="/dashboard/prime-match" className="nav-new">PrimeMatch <em>New</em></Link>
          <Link href="/dashboard/setup-builder" className="nav-new">Build My Setup <em>New</em></Link>
          <button className="more-nav" onClick={() => router.push("/dashboard/categories")}>More <ChevronDown size={15} /></button>
          <div className="nav-spacer" />
          <button className="theme-switch" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Toggle theme">
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
            <span>{theme === "light" ? "☼" : "☾"}</span>
          </button>
        </div>
      </nav>

      <div className="mobile-nav-panel">
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-menu-card" onClick={(event) => event.stopPropagation()}>
              <div className="mobile-menu-head">
                <strong>PrimeCart</strong>
                <button onClick={() => setMobileMenuOpen(false)}><X /></button>
              </div>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link href="/dashboard/products?deal=flash" onClick={() => setMobileMenuOpen(false)}>Deals</Link>
              <Link href="/dashboard/products?sort=bestseller" onClick={() => setMobileMenuOpen(false)}>Best Sellers</Link>
              <Link href="/dashboard/products?sort=newest" onClick={() => setMobileMenuOpen(false)}>New Arrivals</Link>
              <Link href="/dashboard/prime-match" onClick={() => setMobileMenuOpen(false)}>PrimeMatch</Link>
              <Link href="/dashboard/setup-builder" onClick={() => setMobileMenuOpen(false)}>Build My Setup</Link>
              <Link href="/dashboard/categories" onClick={() => setMobileMenuOpen(false)}>All Categories</Link>
            </div>
          </div>
        )}
      </div>

      <div className="container page-content" onClick={() => setSearchOpen(false)}>
        {errorMessage && (
          <div className="error-box">
            <span>{errorMessage}</span>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        <section className="hero-layout">
          <div className="hero-carousel">
            <div className="hero-image-frame">
              {HERO_BANNERS.map((banner, index) => (
                <img
                  key={banner}
                  src={banner}
                  alt={`PrimeCart promotional banner ${index + 1}`}
                  className={`hero-banner ${index === heroIndex ? "active" : ""}`}
                />
              ))}

              <button className="hero-arrow hero-left" onClick={() => setHeroIndex((heroIndex - 1 + HERO_BANNERS.length) % HERO_BANNERS.length)} aria-label="Previous banner">
                <ChevronLeft size={24} />
              </button>
              <button className="hero-arrow hero-right" onClick={() => setHeroIndex((heroIndex + 1) % HERO_BANNERS.length)} aria-label="Next banner">
                <ChevronRight size={24} />
              </button>

              <div className="hero-dots">
                {HERO_BANNERS.map((_, index) => (
                  <button
                    key={index}
                    className={index === heroIndex ? "active" : ""}
                    onClick={() => setHeroIndex(index)}
                    aria-label={`Show banner ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <aside className="right-rail">
            <div className="welcome-card">
              <div className="welcome-user">
                <div className="welcome-avatar"><UserRound size={27} /></div>
                <div>
                  <strong>{userLoggedIn ? `Hello, ${userInfo.name.split(" ")[0]}!` : "Hello!"}</strong>
                  <span>{userLoggedIn ? "Welcome back to PrimeCart" : "Welcome to PrimeCart"}</span>
                </div>
              </div>
              <div className="service-list">
                <Service icon={<Truck />} title="Free Shipping" text="Above ₹499" />
                <Service icon={<RotateCcw />} title="Easy Returns" text="Within 7 Days" />
                <Service icon={<ShieldCheck />} title="Secure Shopping" text="100% Safe & Secure" />
                <Service icon={<Headphones />} title="24/7 Customer Support" text="We're here to help" />
              </div>
            </div>

            <div className="top-deals-card">
              <div className="rail-heading">
                <strong>Top Deals</strong>
                <Link href="/dashboard/products?deal=top">View All <ArrowRight size={13} /></Link>
              </div>
              {topDeals.map((product) => (
                <button className="mini-deal" key={String(product.id)} onClick={() => openProduct(product)}>
                  <div className="mini-deal-image">
                    {product.image_url ? <img src={getImageUrl(product.image_url)} alt="" /> : <ShoppingBag size={25} />}
                  </div>
                  <div className="mini-deal-copy">
                    <strong>{product.name}</strong>
                    <span>{product.short_description || "Everyday favourite"}</span>
                    <div><del>{formatPrice(product.original_price)}</del><b>{formatPrice(product.price)}</b><em>{getDiscount(product.price, product.original_price)}% OFF</em></div>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </section>

        <section className="category-section">
          <div className="category-rail-wrap">
            <button className="rail-control" onClick={() => scrollCategories("left")} aria-label="Previous categories"><ChevronLeft /></button>
            <div className="category-rail" ref={categoryRailRef}>
              {categoryCards.map((category) => {
                const Icon = getCategoryIcon(category.name);
                return (
                  <button className="category-item" key={String(category.id)} onClick={() => openCategory(category)}>
                    <span className="category-icon"><Icon size={25} /></span>
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
            <button className="rail-control" onClick={() => scrollCategories("right")} aria-label="Next categories"><ChevronRight /></button>
          </div>
        </section>

        <SectionHeader icon={<Sparkles size={20} />} title="Best Deals for You" href="/dashboard/products?deal=best" />
        <section className="products-grid five-columns">
          {featuredProducts.map((product) => (
            <ProductCard
              key={String(product.id)}
              product={product}
              category={categoryMap.get(String(product.category_id)) || "Featured"}
              wished={wishlist.some((value) => String(value) === String(product.id))}
              onWishlist={() => toggleWishlist(product.id)}
              onCart={() => addToCart(product)}
              onOpen={() => openProduct(product)}
            />
          ))}
        </section>

        {flashProducts.length > 0 && (
          <section className="deal-banner-row">
            <div className="deal-banner flash-banner">
              <div>
                <span><Zap size={18} fill="currentColor" /> Flash Deals</span>
                <strong>Up to 70% OFF</strong>
                <Link href="/dashboard/products?deal=flash">Shop Now <ArrowRight size={14} /></Link>
              </div>
              {flashProducts[0]?.image_url && <img src={getImageUrl(flashProducts[0].image_url)} alt="Flash deal" />}
            </div>
            <div className="deal-banner home-banner">
              <div>
                <strong>Home Essentials</strong>
                <span>For a Better Tomorrow</span>
                <Link href="/dashboard/categories/home-and-living">Explore Now <ArrowRight size={14} /></Link>
              </div>
              {flashProducts[1]?.image_url && <img src={getImageUrl(flashProducts[1].image_url)} alt="Home essentials" />}
            </div>
            <div className="deal-banner fashion-banner">
              <div>
                <strong>Fashion Collection</strong>
                <span>Trendy Styles, Every Day</span>
                <Link href="/dashboard/categories/fashion">Shop Now <ArrowRight size={14} /></Link>
              </div>
              {flashProducts[2]?.image_url && <img src={getImageUrl(flashProducts[2].image_url)} alt="Fashion collection" />}
            </div>
          </section>
        )}

        <SectionHeader icon={<FlameIcon />} title="Trending Now" href="/dashboard/products?sort=trending" />
        <section className="products-grid five-columns trending-grid">
          {products
            .slice()
            .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
            .slice(0, 5)
            .map((product) => (
              <ProductCard
                key={String(product.id)}
                product={product}
                category={categoryMap.get(String(product.category_id)) || "Trending"}
                wished={wishlist.some((value) => String(value) === String(product.id))}
                onWishlist={() => toggleWishlist(product.id)}
                onCart={() => addToCart(product)}
                onOpen={() => openProduct(product)}
              />
            ))}
        </section>

        <section className="trust-strip">
          <TrustItem icon={<Truck />} title="Free Shipping" text="On orders above ₹499" />
          <TrustItem icon={<RotateCcw />} title="Easy Returns" text="7-day hassle-free returns" />
          <TrustItem icon={<ShieldCheck />} title="Secure Payments" text="100% secure checkout" />
          <TrustItem icon={<Headphones />} title="Customer Support" text="We're here to help" />
        </section>
      </div>

      {toast && <div className="toast"><span>✓</span>{toast}</div>}

      <style jsx global>{`
        :root {
          --gold: #b88924;
          --gold-2: #d6a947;
          --gold-soft: #fbf3df;
          --gold-pale: #fff9ed;
          --ink: #171717;
          --muted: #747474;
          --line: #ece9e2;
          --paper: #ffffff;
          --page: #fdfdfc;
          --green: #3b8b55;
          --shadow: 0 5px 20px rgba(49, 37, 13, .06);
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: var(--page); color: var(--ink); font-family: Arial, Helvetica, sans-serif; }
        button, input { font: inherit; }
        button, a { -webkit-tap-highlight-color: transparent; }
        button { cursor: pointer; }
        a { color: inherit; text-decoration: none; }

        html.dark body { background: #17140f; color: #f8f1df; }
        html.dark .main-header,
        html.dark .nav-bar,
        html.dark .product-card,
        html.dark .welcome-card,
        html.dark .top-deals-card,
        html.dark .trust-strip { background: #211d16; border-color: #3c3425; }
        html.dark .search-box,
        html.dark .profile-dropdown,
        html.dark .search-dropdown,
        html.dark .mobile-menu-card { background: #211d16; border-color: #493d29; color: #fff; }
        html.dark .product-name, html.dark .rail-heading strong, html.dark .category-item { color: #fff; }
        html.dark .product-category, html.dark .review-count, html.dark .strip-right, html.dark .mini-deal-copy span, html.dark .service-list small { color: #cfc6b5; }

        .store-shell { min-height: 100vh; }
        .container { width: min(1410px, calc(100% - 48px)); margin: 0 auto; }

        .top-strip { background: #b98925; color: #fff; font-size: 12px; }
        .strip-inner { height: 34px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
        .strip-left, .strip-right { display: flex; align-items: center; gap: 16px; }
        .strip-left span { display: inline-flex; align-items: center; gap: 7px; }
        .strip-inner i { width: 1px; height: 14px; background: rgba(255,255,255,.55); }
        .strip-right b { font-weight: 800; }

        .main-header { background: #fff; border-bottom: 1px solid #f0eee9; }
        .header-main { min-height: 84px; display: flex; align-items: center; gap: 34px; }
        .logo-wrap { display: flex; align-items: center; min-width: 250px; height: 58px; }
        .brand-logo { display: block; width: 184px; height: auto; max-height: 58px; object-fit: contain; object-position: left center; }

        .search-box { height: 43px; border: 1px solid #e6e4df; border-radius: 7px; display: flex; align-items: center; flex: 1; max-width: 730px; position: relative; background: #fff; box-shadow: 0 2px 7px rgba(0,0,0,.025); }
        .search-box > svg { margin-left: 15px; color: #9c9c9c; flex: none; }
        .search-box input { flex: 1; height: 100%; border: 0; outline: 0; padding: 0 12px; background: transparent; min-width: 0; color: var(--ink); font-size: 13px; }
        .search-box button { height: 35px; margin-right: 4px; padding: 0 25px; border: 0; border-radius: 5px; background: var(--gold); color: #fff; font-size: 12px; font-weight: 700; }
        .search-dropdown { position: absolute; top: 48px; left: 0; right: 0; z-index: 80; background: #fff; border: 1px solid #ebe7dd; border-radius: 10px; box-shadow: 0 14px 35px rgba(0,0,0,.12); overflow: hidden; }
        .search-dropdown button { width: 100%; height: auto; margin: 0; padding: 10px 13px; border: 0; background: transparent; color: #222; display: flex; gap: 12px; text-align: left; align-items: center; }
        .search-dropdown button:hover { background: #fff9ee; }
        .suggestion-image { width: 45px; height: 45px; border-radius: 7px; background: #faf8f3; display: grid; place-items: center; flex: none; }
        .suggestion-image img { width: 100%; height: 100%; object-fit: contain; }
        .search-dropdown strong, .search-dropdown small { display: block; }
        .search-dropdown strong { font-size: 13px; }
        .search-dropdown small { color: var(--gold); margin-top: 4px; }
        .no-suggestions { padding: 18px; color: #888; font-size: 13px; }

        .header-actions { display: flex; align-items: center; gap: 24px; margin-left: auto; white-space: nowrap; }
        .header-action { border: 0; background: transparent; display: inline-flex; align-items: center; gap: 8px; color: #171717; font-size: 12px; padding: 8px 0; }
        .header-action svg { stroke-width: 1.7; }
        .icon-with-badge { position: relative; display: inline-flex; }
        .icon-with-badge b { position: absolute; top: -10px; right: -10px; min-width: 17px; height: 17px; padding: 0 4px; border-radius: 20px; background: #d6ad58; color: #fff; border: 2px solid #fff; font-size: 9px; display: grid; place-items: center; }
        .account-area { position: relative; }
        .profile-dropdown { position: absolute; z-index: 100; right: -10px; top: 44px; width: 240px; background: #fff; border: 1px solid #ece7db; border-radius: 11px; box-shadow: 0 15px 40px rgba(0,0,0,.12); padding: 9px; }
        .profile-top { display: flex; gap: 10px; padding: 10px; border-bottom: 1px solid #eeeae1; margin-bottom: 5px; }
        .profile-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--gold-soft); color: var(--gold); display: grid; place-items: center; }
        .profile-top strong, .profile-top small { display: block; }
        .profile-top strong { font-size: 13px; }
        .profile-top small { font-size: 10px; color: #8b8b8b; margin-top: 3px; max-width: 160px; overflow: hidden; text-overflow: ellipsis; }
        .profile-dropdown a, .profile-dropdown button { width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px; border: 0; background: transparent; border-radius: 7px; font-size: 12px; text-align: left; }
        .profile-dropdown a:hover, .profile-dropdown button:hover { background: #fff8e8; color: var(--gold); }

        .mobile-menu-button { display: none; border: 0; background: transparent; color: #222; }

        .nav-bar { background: #fff; border-bottom: 1px solid #ededeb; }
        .nav-inner { height: 52px; display: flex; align-items: center; gap: 34px; }
        .nav-inner > a, .more-nav { font-size: 12px; border: 0; background: transparent; color: #252525; white-space: nowrap; }
        .nav-inner > a:hover, .more-nav:hover { color: var(--gold); }
        .all-category-btn { border: 0; background: transparent; display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 12px; margin-right: 20px; }
        .nav-new { position: relative; }
        .nav-new em { position: absolute; top: -17px; right: -16px; background: var(--gold); color: #fff; font-style: normal; border-radius: 5px; font-size: 8px; padding: 3px 5px; }
        .more-nav { display: inline-flex; align-items: center; gap: 4px; }
        .nav-spacer { flex: 1; }
        .theme-switch { width: 49px; height: 26px; border: 1px solid #ded7c9; background: #fff; border-radius: 20px; display: flex; align-items: center; justify-content: space-around; color: var(--gold); }
        .theme-switch span { font-size: 15px; }

        .page-content { padding: 12px 0 50px; }
        .error-box { margin-bottom: 12px; padding: 12px 15px; background: #fff4e8; border: 1px solid #efd8bd; border-radius: 8px; display: flex; justify-content: space-between; font-size: 13px; }
        .error-box button { border: 0; background: var(--gold); color: #fff; border-radius: 5px; padding: 6px 12px; }

        .hero-layout { display: grid; grid-template-columns: minmax(0, 1fr) 292px; gap: 22px; align-items: stretch; }
        .hero-carousel { min-width: 0; }
        .hero-image-frame { position: relative; width: 100%; height: 272px; border-radius: 9px; overflow: hidden; background: #f5eee0; box-shadow: 0 3px 10px rgba(0,0,0,.04); }
        .hero-banner { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; object-position: center; opacity: 0; transition: opacity .55s ease; pointer-events: none; }
        .hero-banner.active { opacity: 1; pointer-events: auto; }
        .hero-arrow { position: absolute; z-index: 4; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border: 0; border-radius: 50%; background: rgba(255,255,255,.86); color: #9b711b; display: grid; place-items: center; box-shadow: 0 4px 13px rgba(0,0,0,.08); }
        .hero-left { left: 17px; }
        .hero-right { right: 17px; }
        .hero-dots { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 7px; z-index: 5; }
        .hero-dots button { width: 8px; height: 8px; padding: 0; border: 1px solid #c89b40; border-radius: 50%; background: rgba(255,255,255,.7); }
        .hero-dots button.active { width: 22px; border-radius: 10px; background: var(--gold); }

        .right-rail { display: flex; flex-direction: column; gap: 13px; }
        .welcome-card, .top-deals-card { background: #fff; border: 1px solid #efede8; border-radius: 9px; box-shadow: var(--shadow); }
        .welcome-card { padding: 14px 15px 11px; }
        .welcome-user { display: flex; align-items: center; gap: 11px; margin-bottom: 10px; }
        .welcome-avatar { width: 43px; height: 43px; border-radius: 50%; background: #fff8e8; color: var(--gold); display: grid; place-items: center; }
        .welcome-user strong, .welcome-user span { display: block; }
        .welcome-user strong { font-size: 14px; }
        .welcome-user span { font-size: 10px; color: #7b7b7b; margin-top: 3px; }
        .login-gold-btn { height: 35px; background: var(--gold); color: #fff; display: grid; place-items: center; border-radius: 7px; font-size: 12px; font-weight: 700; margin-bottom: 12px; }
        .service-list { display: grid; gap: 1px; }
        .service-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; }
        .service-icon { width: 36px; height: 36px; border-radius: 50%; background: #fff9ec; color: var(--gold); display: grid; place-items: center; flex: none; }
        .service-row strong, .service-row small { display: block; }
        .service-row strong { font-size: 11px; }
        .service-row small { color: #777; font-size: 10px; margin-top: 3px; }

        .top-deals-card { padding: 14px 14px 8px; }
        .rail-heading { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .rail-heading strong { font-size: 14px; }
        .rail-heading a { display: inline-flex; align-items: center; gap: 4px; color: #8b6418; font-size: 10px; }
        .mini-deal { width: 100%; display: flex; align-items: center; gap: 9px; padding: 9px 0; border: 0; border-top: 1px solid #f0ede7; background: transparent; text-align: left; }
        .mini-deal-image { width: 66px; height: 66px; background: #faf9f6; border-radius: 6px; display: grid; place-items: center; flex: none; }
        .mini-deal-image img { width: 100%; height: 100%; object-fit: contain; }
        .mini-deal-copy { min-width: 0; }
        .mini-deal-copy strong, .mini-deal-copy span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .mini-deal-copy strong { font-size: 10px; }
        .mini-deal-copy span { color: #777; font-size: 9px; margin-top: 3px; }
        .mini-deal-copy > div { margin-top: 7px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .mini-deal-copy del { color: #a1a1a1; font-size: 8px; }
        .mini-deal-copy b { font-size: 10px; }
        .mini-deal-copy em { font-style: normal; color: #4f965f; background: #eef8ef; border-radius: 10px; padding: 3px 6px; font-size: 8px; }

        .category-section { margin: 22px 0 26px; }
        .category-rail-wrap { display: flex; align-items: center; gap: 6px; }
        .category-rail { display: flex; align-items: flex-start; justify-content: space-between; gap: 9px; overflow-x: auto; scrollbar-width: none; flex: 1; }
        .category-rail::-webkit-scrollbar { display: none; }
        .category-item { min-width: 102px; flex: 1; border: 0; background: transparent; display: flex; flex-direction: column; align-items: center; gap: 9px; color: #222; font-size: 10px; text-align: center; }
        .category-icon { width: 58px; height: 58px; border-radius: 50%; background: #fff9ed; color: var(--gold); display: grid; place-items: center; box-shadow: 0 1px 0 #f2e7d0; }
        .category-item:hover .category-icon { background: #f9edcf; transform: translateY(-2px); }
        .category-icon, .category-item { transition: .2s ease; }
        .rail-control { width: 28px; height: 28px; border: 1px solid #ece5d7; background: #fff; color: #8d671e; border-radius: 50%; display: grid; place-items: center; flex: none; }

        .section-head { display: flex; align-items: center; justify-content: space-between; margin: 4px 0 13px; }
        .section-title { display: flex; align-items: center; gap: 9px; font-size: 18px; font-weight: 800; }
        .section-title > span { color: var(--gold); }
        .section-head > a { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; }
        .section-head > a:hover { color: var(--gold); }

        .products-grid { display: grid; gap: 17px; }
        .five-columns { grid-template-columns: repeat(5, minmax(0, 1fr)); }
        .product-card { position: relative; background: #fff; border: 1px solid #eceae5; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.025); transition: transform .2s ease, box-shadow .2s ease; }
        .product-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(45,35,17,.09); }
        .wish-btn { position: absolute; z-index: 5; right: 10px; top: 9px; border: 0; background: transparent; color: #888; padding: 4px; }
        .wish-btn:hover { color: #c58e22; }
        .discount-badge { position: absolute; z-index: 4; top: 10px; left: 10px; color: #4d9659; background: #eff8ef; border-radius: 4px; font-size: 8px; padding: 4px 6px; font-weight: 700; }
        .mini-badge { position: absolute; z-index: 4; top: 10px; left: 10px; transform: translateY(24px); color: #735400; background: #ffe063; border-radius: 4px; font-size: 8px; padding: 4px 6px; font-weight: 700; }
        .product-image-wrap { width: 100%; height: 173px; border: 0; background: #fff; padding: 16px 20px 7px; display: grid; place-items: center; }
        .product-image { width: 100%; height: 100%; object-fit: contain; transition: transform .25s ease; }
        .product-card:hover .product-image { transform: scale(1.035); }
        .product-copy { padding: 3px 11px 12px; }
        .product-category { color: #777; font-size: 9px; min-height: 12px; }
        .product-name { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; border: 0; background: transparent; color: #252525; font-size: 11px; font-weight: 500; line-height: 1.4; padding: 0; text-align: left; width: 100%; min-height: 31px; margin-top: 2px; }
        .rating-row { display: flex; align-items: center; gap: 5px; margin: 7px 0; }
        .rating-pill { background: #f1f8f1; color: #3c7c48; border-radius: 4px; padding: 3px 5px; font-size: 9px; display: inline-flex; align-items: center; gap: 2px; }
        .review-count { color: #8a8a8a; font-size: 8px; }
        .price-row { display: flex; align-items: baseline; gap: 7px; margin-bottom: 9px; }
        .price-row strong { font-size: 14px; }
        .price-row del { font-size: 9px; color: #999; }
        .add-cart-btn { width: 100%; height: 28px; border: 0; border-radius: 5px; background: linear-gradient(180deg, #d1a442, #b78720); color: #fff; font-size: 10px; font-weight: 700; }
        .add-cart-btn:hover { filter: brightness(.97); }

        .deal-banner-row { display: grid; grid-template-columns: 1.05fr 1fr 1fr; gap: 17px; margin: 28px 0 33px; }
        .deal-banner { min-height: 125px; border-radius: 9px; overflow: hidden; position: relative; display: flex; align-items: center; padding: 18px 22px; }
        .deal-banner > div { position: relative; z-index: 2; max-width: 60%; }
        .deal-banner strong, .deal-banner span { display: block; }
        .deal-banner strong { font-size: 18px; }
        .deal-banner span { font-size: 11px; margin-bottom: 5px; }
        .deal-banner a { display: inline-flex; align-items: center; gap: 5px; margin-top: 13px; background: #fff; color: #222; border-radius: 15px; padding: 6px 11px; font-size: 9px; font-weight: 700; }
        .deal-banner img { position: absolute; right: 8px; bottom: 2px; width: 43%; height: 96%; object-fit: contain; z-index: 1; }
        .flash-banner { background: linear-gradient(110deg, #b57c0c, #d3a23f); color: #fff; }
        .flash-banner span { display: flex; align-items: center; gap: 5px; }
        .home-banner { background: linear-gradient(110deg, #fbf1dd, #f0e2c5); }
        .fashion-banner { background: linear-gradient(110deg, #f5eee2, #ead9bb); }

        .trending-grid { margin-bottom: 32px; }
        .trust-strip { background: #fff; border: 1px solid #eeeae2; border-radius: 9px; display: grid; grid-template-columns: repeat(4, 1fr); padding: 10px 5px; margin-top: 35px; }
        .trust-item { display: flex; justify-content: center; align-items: center; gap: 10px; padding: 10px; border-right: 1px solid #eeeae2; }
        .trust-item:last-child { border-right: 0; }
        .trust-item > span { width: 38px; height: 38px; display: grid; place-items: center; color: var(--gold); background: #fff8e8; border-radius: 50%; }
        .trust-item strong, .trust-item small { display: block; }
        .trust-item strong { font-size: 11px; }
        .trust-item small { color: #777; font-size: 9px; margin-top: 3px; }

        .toast { position: fixed; z-index: 200; right: 25px; bottom: 25px; background: #222; color: #fff; border-radius: 8px; padding: 11px 15px; box-shadow: 0 10px 35px rgba(0,0,0,.22); font-size: 12px; display: flex; align-items: center; gap: 8px; }
        .toast span { color: #d7ae51; font-weight: 800; }

        .mobile-menu-overlay { position: fixed; inset: 0; z-index: 150; background: rgba(0,0,0,.3); }
        .mobile-menu-card { width: min(310px, 85vw); height: 100%; background: #fff; padding: 22px; box-shadow: 10px 0 35px rgba(0,0,0,.16); display: flex; flex-direction: column; gap: 4px; }
        .mobile-menu-head { display: flex; justify-content: space-between; align-items: center; color: var(--gold); font-size: 20px; padding-bottom: 18px; border-bottom: 1px solid #eee; margin-bottom: 10px; }
        .mobile-menu-head button { border: 0; background: transparent; }
        .mobile-menu-card a { padding: 13px 5px; border-bottom: 1px solid #f0ede6; font-size: 13px; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-screen { min-height: 100vh; background: #fffdf8; display: grid; place-items: center; }
        .loading-inner { text-align: center; }
        .loading-logo { width: 58px; height: 58px; border: 2px solid var(--gold); color: var(--gold); border-radius: 14px; display: grid; place-items: center; margin: 0 auto 14px; animation: pulse 1.4s ease-in-out infinite; }
        .loading-inner strong { color: var(--gold); font-size: 22px; }
        .loading-inner span { display: block; color: #999; font-size: 11px; margin-top: 5px; }
        .loading-bar { width: 190px; height: 3px; background: #f0e7d5; margin: 18px auto 0; overflow: hidden; border-radius: 5px; }
        .loading-bar:after { content: ""; display: block; width: 45%; height: 100%; background: var(--gold); animation: loading 1.1s ease-in-out infinite; }
        @keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(320%); } }
        @keyframes pulse { 50% { transform: scale(1.05); } }

        @media (max-width: 1200px) {
          .container { width: min(1160px, calc(100% - 32px)); }
          .header-main { gap: 20px; }
          .logo-wrap { min-width: 205px; }
          .header-actions { gap: 15px; }
          .nav-inner { gap: 22px; }
          .hero-layout { grid-template-columns: minmax(0, 1fr) 265px; }
          .five-columns { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .five-columns .product-card:nth-child(5) { display: none; }
          .category-item { min-width: 88px; }
        }

        @media (max-width: 950px) {
          .strip-right { display: none; }
          .header-main { min-height: 72px; }
          .logo-wrap { min-width: auto; }
          .search-box { max-width: none; }
          .header-actions { display: none; }
          .mobile-menu-button { display: block; }
          .nav-bar { display: none; }
          .hero-layout { grid-template-columns: 1fr; }
          .right-rail { display: grid; grid-template-columns: 1fr 1fr; }
          .welcome-card { grid-row: span 2; }
          .top-deals-card { grid-column: 2; }
          .five-columns { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .five-columns .product-card:nth-child(4), .five-columns .product-card:nth-child(5) { display: none; }
          .deal-banner-row { grid-template-columns: 1fr 1fr; }
          .deal-banner:last-child { display: none; }
        }

        @media (max-width: 680px) {
          .container { width: calc(100% - 20px); }
          .top-strip { font-size: 10px; }
          .strip-inner { height: 31px; }
          .strip-left { gap: 9px; overflow: hidden; white-space: nowrap; }
          .strip-left span:nth-of-type(3), .strip-left i:nth-of-type(2) { display: none; }
          .header-main { flex-wrap: wrap; gap: 8px; padding: 10px 0; }
          .logo-wrap { flex: 1; min-width: 0; height: 42px; }
          .brand-logo { width: 155px; max-height: 42px; }
          .search-box { order: 3; flex-basis: 100%; height: 40px; }
          .search-box button { padding: 0 17px; }
          .page-content { padding-top: 10px; }
          .hero-image-frame { height: 235px; border-radius: 7px; }
          .hero-arrow { width: 32px; height: 32px; }
          .hero-left { left: 8px; }
          .hero-right { right: 8px; }
          .right-rail { grid-template-columns: 1fr; }
          .welcome-card { grid-row: auto; }
          .top-deals-card { grid-column: auto; }
          .category-section { margin: 18px 0 22px; }
          .category-item { min-width: 80px; font-size: 9px; }
          .category-icon { width: 50px; height: 50px; }
          .rail-control { display: none; }
          .section-title { font-size: 16px; }
          .five-columns { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
          .five-columns .product-card:nth-child(n) { display: block; }
          .product-image-wrap { height: 155px; padding: 14px; }
          .product-copy { padding-left: 9px; padding-right: 9px; }
          .product-name { font-size: 10px; }
          .price-row strong { font-size: 13px; }
          .deal-banner-row { grid-template-columns: 1fr; gap: 10px; }
          .deal-banner { min-height: 115px; }
          .deal-banner:last-child { display: flex; }
          .trust-strip { grid-template-columns: 1fr 1fr; }
          .trust-item:nth-child(2) { border-right: 0; }
          .trust-item:nth-child(-n+2) { border-bottom: 1px solid #eeeae2; }
          .toast { left: 15px; right: 15px; bottom: 15px; justify-content: center; }
        }

        @media (max-width: 430px) {
          .hero-image-frame { height: 205px; }
          .product-image-wrap { height: 140px; }
          .product-category { font-size: 8px; }
          .section-head > a { font-size: 9px; }
          .deal-banner > div { max-width: 68%; }
          .deal-banner strong { font-size: 16px; }
          .deal-banner img { width: 38%; }
        }
      `}</style>
    </main>
  );
}

function Service({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="service-row">
      <span className="service-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
    </div>
  );
}

function SectionHeader({ icon, title, href }: { icon: React.ReactNode; title: string; href: string }) {
  return (
    <div className="section-head">
      <div className="section-title"><span>{icon}</span>{title}</div>
      <Link href={href}>View All <ArrowRight size={14} /></Link>
    </div>
  );
}

function TrustItem({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="trust-item">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </div>
  );
}

function FlameIcon() {
  return <span style={{ display: "inline-flex", fontSize: 20 }}>♛</span>;
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-inner">
        <div className="loading-logo"><ShoppingBag size={28} /></div>
        <strong>PrimeCart</strong>
        <span>Preparing your shopping experience...</span>
        <div className="loading-bar" />
      </div>
    </div>
  );
}
