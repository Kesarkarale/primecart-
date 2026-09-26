"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, ShoppingBag, Grid2X2, ClipboardList, Heart, Sparkles,
  Wallet, UserRound, Settings, Search, Bell, Menu, X, ChevronRight,
  Star, Zap, ArrowRight, ShoppingCart, Package, Truck, ShieldCheck,
  Headphones, LogOut, Home, Smartphone, Footprints, BriefcaseBusiness,
  Baby, Car, Shirt, Monitor, TrendingUp, RefreshCw, Gamepad2, Eye,
  BookOpen, Palette, Laptop, Flame, Clock3, CheckCircle2, Plus, Minus,
  ArrowUpRight, SlidersHorizontal, ChevronLeft, Tag, Award
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

type Category = { id: string | number; name: string };
type UserInfo = { name: string; email: string };

type CartItem = { id: string | number; name: string; price: number; image_url?: string | null; quantity: number };

const CART_KEY = "primecart-cart";
const WISHLIST_KEY = "primecart-wishlist";
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

function imageUrl(value?: string | null) {
  if (!value?.trim()) return "";
  const v = value.trim();
  if (/^https?:\/\//i.test(v) || v.startsWith("/")) return v;
  return `/${v}`;
}

function price(value: number | null | undefined) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function discount(priceValue: number | null | undefined, original: number | null | undefined) {
  if (!priceValue || !original || original <= priceValue) return 0;
  return Math.round(((original - priceValue) / original) * 100);
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function categoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("mobile")) return <Smartphone size={19} />;
  if (n.includes("foot")) return <Footprints size={19} />;
  if (n.includes("fashion")) return <Shirt size={19} />;
  if (n.includes("baby") || n.includes("toy")) return <Baby size={19} />;
  if (n.includes("auto")) return <Car size={19} />;
  if (n.includes("gaming")) return <Gamepad2 size={19} />;
  if (n.includes("home")) return <Home size={19} />;
  if (n.includes("watch")) return <Clock3 size={19} />;
  if (n.includes("bag")) return <BriefcaseBusiness size={19} />;
  if (n.includes("appliance")) return <Monitor size={19} />;
  if (n.includes("eye")) return <Eye size={19} />;
  if (n.includes("book")) return <BookOpen size={19} />;
  if (n.includes("beauty")) return <Palette size={19} />;
  if (n.includes("electronic")) return <Laptop size={19} />;
  return <ShoppingBag size={19} />;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: "PrimeCart User", email: "" });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);
  const [wishlist, setWishlist] = useState<Array<string | number>>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [toast, setToast] = useState("");
  const [categoryScroll, setCategoryScroll] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErrorMessage("");
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;
        if (!user) { router.replace("/auth/login"); return; }
        const meta = user.user_metadata || {};
        setUserInfo({
          name: meta.full_name || meta.name || user.email?.split("@")[0] || "PrimeCart User",
          email: user.email || "",
        });

        const [{ data: p, error: pe }, { data: c, error: ce }] = await Promise.all([
          supabase.from("products").select("id,category_id,name,slug,short_description,description,price,original_price,stock,image_url,brand,rating,reviews_count,is_featured,is_flash_sale,is_active,created_at").eq("is_active", true).order("created_at", { ascending: false }).limit(80),
          supabase.from("categories").select("id,name").order("name", { ascending: true }),
        ]);
        if (!mounted) return;
        if (pe) setErrorMessage(pe.message);
        if (ce) console.error(ce);
        setProducts(p || []);
        setCategories(c || []);
      } catch (e) {
        console.error(e);
        if (mounted) setErrorMessage("Something went wrong while loading your dashboard.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    try {
      const savedWishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
      const savedCart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (Array.isArray(savedWishlist)) setWishlist(savedWishlist);
      if (Array.isArray(savedCart)) setCart(savedCart);
    } catch {}
    return () => { mounted = false; };
  }, [router, supabase]);

  useEffect(() => {
    const timer = window.setInterval(() => setHeroIndex((v) => (v + 1) % HERO_BANNERS.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(String(c.id), c.name));
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const cat = categoryMap.get(String(p.category_id)) || "";
      const text = `${p.name} ${p.brand || ""} ${cat}`.toLowerCase();
      return (!q || text.includes(q)) && (selectedCategory === null || String(p.category_id) === String(selectedCategory));
    });
  }, [products, categoryMap, search, selectedCategory]);

  const featuredProducts = useMemo(() => {
    const list = filteredProducts.filter((p) => p.is_featured);
    return (list.length ? list : filteredProducts).slice(0, 8);
  }, [filteredProducts]);

  const flashProducts = useMemo(() => {
    const list = filteredProducts.filter((p) => p.is_flash_sale);
    const source = list.length ? list : filteredProducts.filter((p) => discount(p.price, p.original_price) >= 10);
    return source.slice(0, 6);
  }, [filteredProducts]);

  const trendingProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => (Number(b.rating || 0) - Number(a.rating || 0)) || (Number(b.reviews_count || 0) - Number(a.reviews_count || 0))).slice(0, 8);
  }, [filteredProducts]);

  const stats = useMemo(() => ({
    products: products.length,
    categories: categories.length,
    deals: products.filter((p) => p.is_flash_sale || discount(p.price, p.original_price) >= 10).length,
    featured: products.filter((p) => p.is_featured).length,
  }), [products, categories]);

  function toggleWishlist(id: string | number) {
    setWishlist((old) => {
      const next = old.includes(id) ? old.filter((x) => x !== id) : [...old, id];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      setToast(old.includes(id) ? "Removed from wishlist" : "Added to wishlist");
      return next;
    });
  }

  function addToCart(product: Product) {
    setCart((old) => {
      const existing = old.find((x) => String(x.id) === String(product.id));
      const next = existing
        ? old.map((x) => String(x.id) === String(product.id) ? { ...x, quantity: x.quantity + 1 } : x)
        : [...old, { id: product.id, name: product.name, price: Number(product.price || 0), image_url: product.image_url, quantity: 1 }];
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
    setToast("Added to cart");
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  }

  function openProduct(p: Product) { router.push(`/dashboard/products/${p.id}`); }
  function openCategory(c: Category) { router.push(`/dashboard/categories/${slugify(c.name)}`); }

  if (loading) return <LoadingScreen />;

  return (
    <div className="page">
      {sidebarOpen && <button className="overlay" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand-row">
          <Link href="/dashboard" className="brand">
            <span className="brand-logo">P</span>
            <span><b>PrimeCart</b><small>SMART SHOPPING</small></span>
          </Link>
          <button className="close-mobile" onClick={() => setSidebarOpen(false)}><X size={19}/></button>
        </div>

        <div className="side-label">SHOP</div>
        <nav className="nav">
          <Link className="nav-active" href="/dashboard"><LayoutDashboard size={18}/>Dashboard</Link>
          <Link href="/dashboard/products"><ShoppingBag size={18}/>Products</Link>
          <Link href="/dashboard/categories"><Grid2X2 size={18}/>Categories</Link>
          <Link href="/dashboard/orders"><ClipboardList size={18}/>My Orders</Link>
          <Link href="/dashboard/wishlist"><Heart size={18}/>Wishlist</Link>
        </nav>

        <div className="side-label smart-label">SMART TOOLS</div>
        <nav className="nav">
          <Link href="/dashboard/prime-match"><Sparkles size={18}/>PrimeMatch</Link>
          <Link href="/dashboard/budget-builder"><Wallet size={18}/>Budget Builder</Link>
          <Link href="/dashboard/setup-builder"><Monitor size={18}/>Build My Setup</Link>
        </nav>

        <div className="side-bottom">
          <Link href="/dashboard/settings"><Settings size={18}/>Settings</Link>
          <button className="signout" onClick={logout}><LogOut size={18}/>Sign out</button>
          <div className="help"><span><Headphones size={17}/></span><div><b>Need help?</b><small>We're here for you.</small></div></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="top-left">
            <button className="mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={21}/></button>
            <div><b>PrimeCart</b><span>Smart shopping, made personal.</span></div>
          </div>
          <div className="top-right">
            <div className="search-box">
              <Search size={17}/>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products, brands & categories..." />
              {search && <button onClick={() => setSearch("")}><X size={14}/></button>}
            </div>
            <Link className="top-icon" href="/dashboard/wishlist"><Heart size={18}/>{wishlist.length > 0 && <i>{wishlist.length}</i>}</Link>
            <Link className="top-icon cart" href="/dashboard/cart"><ShoppingCart size={18}/>{cart.length > 0 && <i>{cart.reduce((a, x) => a + x.quantity, 0)}</i>}</Link>
            <button className="top-icon"><Bell size={18}/><em/></button>
            <div className="profile-wrap">
              <button className="profile" onClick={() => setProfileOpen((v) => !v)}>
                <span className="avatar">{userInfo.name.charAt(0).toUpperCase()}</span>
                <span className="profile-text"><b>{userInfo.name}</b><small>Prime Member</small></span>
                <ChevronRight size={14} className={profileOpen ? "rotate" : ""}/>
              </button>
              {profileOpen && <div className="profile-menu">
                <div className="menu-user"><span className="avatar big">{userInfo.name.charAt(0).toUpperCase()}</span><div><b>{userInfo.name}</b><small>{userInfo.email}</small></div></div>
                <hr/>
                <Link href="/dashboard/profile"><UserRound size={16}/>Profile</Link>
                <Link href="/dashboard/orders"><ClipboardList size={16}/>Orders</Link>
                <Link href="/dashboard/settings"><Settings size={16}/>Settings</Link>
                <hr/>
                <button onClick={logout}><LogOut size={16}/>Sign out</button>
              </div>}
            </div>
          </div>
        </header>

        <div className="body">
          {errorMessage && <div className="error"><div><b>Some products could not be loaded</b><span>{errorMessage}</span></div><button onClick={() => location.reload()}><RefreshCw size={15}/>Retry</button></div>}

          <div className="category-rail">
            <button className="rail-arrow" onClick={() => setCategoryScroll(Math.max(0, categoryScroll - 1))}><ChevronLeft size={17}/></button>
            <div className="rail-scroll">
              <button className={!selectedCategory ? "rail-item active" : "rail-item"} onClick={() => setSelectedCategory(null)}><ShoppingBag size={17}/><span>All</span></button>
              {categories.map((c) => <button key={String(c.id)} className={String(selectedCategory) === String(c.id) ? "rail-item active" : "rail-item"} onClick={() => setSelectedCategory(c.id)}>{categoryIcon(c.name)}<span>{c.name}</span></button>)}
            </div>
            <Link className="rail-all" href="/dashboard/categories">View all <ArrowRight size={14}/></Link>
          </div>

          <section className="hero-market">
            <button className="hero-arrow left" onClick={() => setHeroIndex((heroIndex - 1 + HERO_BANNERS.length) % HERO_BANNERS.length)}><ChevronLeft size={22}/></button>
            <Link href="/dashboard/products" className="hero-link">
              <img src={HERO_BANNERS[heroIndex]} alt="PrimeCart offer banner" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </Link>
            <button className="hero-arrow right" onClick={() => setHeroIndex((heroIndex + 1) % HERO_BANNERS.length)}><ChevronRight size={22}/></button>
            <div className="hero-dots">{HERO_BANNERS.map((_, i) => <button key={i} className={i === heroIndex ? "dot active" : "dot"} onClick={() => setHeroIndex(i)} />)}</div>
          </section>

          <section className="quick-actions">
            <Link href="/dashboard/products?type=flash" className="quick-card"><span className="quick-icon flame"><Flame size={21}/></span><div><b>Flash Deals</b><small>Limited-time offers</small></div><ArrowUpRight size={16}/></Link>
            <Link href="/dashboard/prime-match" className="quick-card"><span className="quick-icon"><Sparkles size={21}/></span><div><b>PrimeMatch</b><small>Find your perfect pick</small></div><ArrowUpRight size={16}/></Link>
            <Link href="/dashboard/budget-builder" className="quick-card"><span className="quick-icon"><Wallet size={21}/></span><div><b>Budget Builder</b><small>Shop within budget</small></div><ArrowUpRight size={16}/></Link>
            <Link href="/dashboard/setup-builder" className="quick-card"><span className="quick-icon"><Monitor size={21}/></span><div><b>Build My Setup</b><small>Create your setup</small></div><ArrowUpRight size={16}/></Link>
          </section>

          <section className="section-head"><div><span>EXPLORE PRIME CART</span><h1>Shop smarter, every day.</h1><p>Discover deals, trending products and picks curated around your needs.</p></div><div className="mini-stats"><span><b>{stats.products}+</b> Products</span><span><b>{stats.categories}</b> Categories</span><span><b>{stats.deals}+</b> Deals</span></div></section>

          {flashProducts.length > 0 && <section className="deal-section">
            <div className="deal-head"><div className="deal-title"><span className="deal-badge"><Zap size={14} fill="currentColor"/> DEALS</span><h2>Flash Deals</h2><p>Prices you'll want to grab before they disappear.</p></div><Link href="/dashboard/products?type=flash">View all deals <ArrowRight size={15}/></Link></div>
            <div className="deal-grid">{flashProducts.map((p) => <ProductCard key={String(p.id)} product={p} categoryMap={categoryMap} liked={wishlist.includes(p.id)} onLike={toggleWishlist} onCart={addToCart} onOpen={openProduct} compact/>)}</div>
          </section>}

          <section className="section">
            <div className="section-title"><div><span>SHOP BY CATEGORY</span><h2>What are you looking for?</h2></div><Link href="/dashboard/categories">View all <ChevronRight size={15}/></Link></div>
            <div className="category-cards">{categories.slice(0, 12).map((c) => <button key={String(c.id)} onClick={() => openCategory(c)}><span className="cat-circle">{categoryIcon(c.name)}</span><b>{c.name}</b><small>Explore</small></button>)}</div>
          </section>

          <section className="section">
            <div className="section-title"><div><span>PRIMECART PICKS</span><h2>Featured for you</h2><p>Popular products selected from our collection.</p></div><Link href="/dashboard/products">View all <ChevronRight size={15}/></Link></div>
            {featuredProducts.length ? <div className="product-grid">{featuredProducts.map((p) => <ProductCard key={String(p.id)} product={p} categoryMap={categoryMap} liked={wishlist.includes(p.id)} onLike={toggleWishlist} onCart={addToCart} onOpen={openProduct}/>)}</div> : <EmptyProducts onClear={() => {setSearch("");setSelectedCategory(null)}}/>}
          </section>

          {trendingProducts.length > 0 && <section className="section"><div className="section-title"><div><span>TRENDING NOW</span><h2>Customers are loving these</h2><p>Highly rated products with strong customer interest.</p></div><Link href="/dashboard/products">Explore <ChevronRight size={15}/></Link></div><div className="product-grid">{trendingProducts.map((p) => <ProductCard key={String(p.id)} product={p} categoryMap={categoryMap} liked={wishlist.includes(p.id)} onLike={toggleWishlist} onCart={addToCart} onOpen={openProduct}/>)}</div></section>}

          <section className="smart-banner"><div className="smart-copy"><span>PERSONALIZED SHOPPING</span><h2>Not sure what to buy?</h2><p>Tell PrimeMatch your needs, budget and priorities. We'll help you discover products that fit.</p><Link href="/dashboard/prime-match">Try PrimeMatch <ArrowRight size={16}/></Link></div><div className="smart-orbit"><Sparkles size={42}/><div><b>PrimeMatch</b><span>Smart recommendations</span></div></div></section>

          <section className="benefits"><div><span><Truck size={19}/></span><b>Fast Delivery</b><small>Reliable doorstep delivery</small></div><div><span><ShieldCheck size={19}/></span><b>Secure Shopping</b><small>Protected checkout experience</small></div><div><span><RefreshCw size={19}/></span><b>Easy Returns</b><small>Simple return process</small></div><div><span><Headphones size={19}/></span><b>Customer Support</b><small>We're here when you need us</small></div></section>

          <footer><div><b>PrimeCart</b><span>Smart shopping, made personal.</span></div><span>© {new Date().getFullYear()} PrimeCart</span></footer>
        </div>
      </main>

      {toast && <div className="toast"><CheckCircle2 size={17}/><span>{toast}</span></div>}

      <style jsx global>{CSS}</style>
    </div>
  );
}

function LoadingScreen() {
  return <div className="loading"><div className="loading-mark">P</div><b>PrimeCart</b><span>Preparing your shopping experience...</span><div className="loading-line"><i/></div><style jsx>{`.loading{min-height:100vh;background:#fffdf8;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#27231c}.loading-mark{width:54px;height:54px;border-radius:16px;background:linear-gradient(135deg,#d8b15a,#ae7b22);color:#fff;display:grid;place-items:center;font-size:23px;font-weight:900;box-shadow:0 15px 35px rgba(174,123,34,.22);animation:float 2s ease-in-out infinite}.loading b{margin-top:14px;font-size:22px}.loading span{margin-top:5px;color:#999184;font-size:11px}.loading-line{margin-top:20px;width:190px;height:4px;border-radius:99px;background:#eee7d8;overflow:hidden}.loading-line i{display:block;width:45%;height:100%;background:#c79a3b;border-radius:inherit;animation:load 1.2s infinite}@keyframes load{from{transform:translateX(-140%)}to{transform:translateX(500%)}}@keyframes float{50%{transform:translateY(-5px)}}`}</style></div>;
}

function EmptyProducts({ onClear }: { onClear: () => void }) {
  return <div className="empty"><Package size={30}/><b>No products found</b><span>Try another search or category.</span><button onClick={onClear}>Clear filters</button></div>;
}

function ProductCard({ product, categoryMap, liked, onLike, onCart, onOpen, compact = false }: { product: Product; categoryMap: Map<string,string>; liked: boolean; onLike: (id:string|number)=>void; onCart:(p:Product)=>void; onOpen:(p:Product)=>void; compact?: boolean }) {
  const d = discount(product.price, product.original_price);
  return <article className={`card ${compact ? "compact" : ""}`}>
    <button className="image-click" onClick={() => onOpen(product)} aria-label={`Open ${product.name}`}>
      {d > 0 && <span className="discount">{d}% OFF</span>}
      {product.is_flash_sale && <span className="flash-tag"><Zap size={11} fill="currentColor"/> FLASH</span>}
      <button className={`heart ${liked ? "liked" : ""}`} onClick={(e) => {e.stopPropagation();onLike(product.id)}} aria-label="Wishlist"><Heart size={17} fill={liked ? "currentColor":"none"}/></button>
      {product.image_url ? <img src={imageUrl(product.image_url)} alt={product.name} onError={(e) => {e.currentTarget.style.display="none"; e.currentTarget.parentElement?.querySelector(".fallback")?.classList.add("show")}}/> : null}
      <div className="fallback"><Package size={28}/><span>No image</span></div>
      <span className="view-chip">View details <ArrowUpRight size={13}/></span>
    </button>
    <div className="card-info">
      <small>{categoryMap.get(String(product.category_id)) || "Product"}</small>
      <h3 title={product.name}>{product.name}</h3>
      {product.brand && <p>{product.brand}</p>}
      <div className="rating"><span><Star size={12} fill="currentColor"/>{Number(product.rating || 0).toFixed(1)}</span><em>({product.reviews_count || 0})</em></div>
      <div className="card-bottom"><div><b>{price(product.price)}</b>{product.original_price && product.original_price > Number(product.price || 0) && <del>{price(product.original_price)}</del>}</div><button className="add" onClick={() => onCart(product)}><Plus size={15}/><span>Add</span></button></div>
    </div>
  </article>;
}

const CSS = `
*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fffdf8}body{color:#28241d;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{text-decoration:none;color:inherit}button,input{font:inherit}button{cursor:pointer}.page{min-height:100vh;background:#fffdf8}.sidebar{position:fixed;inset:0 auto 0 0;width:250px;background:#fff;border-right:1px solid #eee7da;padding:21px 15px;display:flex;flex-direction:column;z-index:100}.brand-row{display:flex;align-items:center;justify-content:space-between;padding:0 8px 30px}.brand{display:flex;align-items:center;gap:10px}.brand-logo{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#d7af58,#ae7b22);color:#fff;font-size:19px;font-weight:900;box-shadow:0 8px 20px rgba(174,123,34,.2)}.brand>span:last-child{display:flex;flex-direction:column}.brand b{font-size:17px;letter-spacing:-.4px}.brand small{margin-top:4px;color:#b1853b;font-size:7px;font-weight:900;letter-spacing:1.5px}.close-mobile{display:none;border:0;background:#f8f3e9;width:35px;height:35px;border-radius:10px}.side-label{padding:0 11px 8px;color:#aaa195;font-size:8px;font-weight:900;letter-spacing:1.5px}.smart-label{margin-top:24px}.nav{display:flex;flex-direction:column;gap:3px}.nav a,.side-bottom>a,.signout{min-height:43px;padding:0 12px;border-radius:11px;display:flex;align-items:center;gap:11px;color:#777066;font-size:12px;font-weight:650;transition:.2s}.nav a:hover,.side-bottom>a:hover,.signout:hover{background:#fbf7ee;color:#a87826;transform:translateX(2px)}.nav a.nav-active{color:#a67524;background:linear-gradient(90deg,#fbf3e2,#fffaf2);font-weight:800}.side-bottom{margin-top:auto}.signout{width:100%;border:0;background:transparent;color:#8f6666;text-align:left}.help{margin-top:15px;padding:11px;border:1px solid #eee6d7;background:#fbf8f1;border-radius:13px;display:flex;align-items:center;gap:9px}.help>span{width:32px;height:32px;border-radius:9px;background:#f7edda;color:#ad7c27;display:grid;place-items:center}.help div{display:flex;flex-direction:column;min-width:0}.help b{font-size:10px}.help small{margin-top:2px;color:#a19a8e;font-size:8px}.main{margin-left:250px;min-height:100vh}.topbar{position:sticky;top:0;z-index:60;height:72px;padding:0 30px;display:flex;align-items:center;justify-content:space-between;background:rgba(255,253,248,.94);backdrop-filter:blur(16px);border-bottom:1px solid #eee7da}.top-left{display:flex;align-items:center;gap:10px}.top-left>div{display:flex;flex-direction:column}.top-left b{font-size:15px}.top-left span{margin-top:3px;color:#a0998d;font-size:9px}.mobile-menu{display:none;border:1px solid #eee6d9;background:#fff;width:38px;height:38px;border-radius:10px}.top-right{display:flex;align-items:center;gap:8px}.search-box{width:330px;height:40px;background:#fff;border:1px solid #ebe4d7;border-radius:11px;display:flex;align-items:center;gap:8px;padding:0 11px;color:#a29a8d}.search-box:focus-within{border-color:#d5b675;box-shadow:0 0 0 3px rgba(199,154,59,.08)}.search-box input{border:0;outline:0;background:transparent;min-width:0;flex:1;font-size:11px;color:#29251f}.search-box input::placeholder{color:#aaa399}.search-box button{border:0;background:#f5f0e7;color:#7e776c;width:22px;height:22px;border-radius:7px;display:grid;place-items:center}.top-icon{position:relative;width:40px;height:40px;border:1px solid #ebe4d7;border-radius:11px;background:#fff;display:grid;place-items:center;color:#6e675d}.top-icon:hover{color:#a87826;border-color:#dbc18d}.top-icon i{position:absolute;right:-4px;top:-5px;min-width:16px;height:16px;padding:0 4px;border-radius:99px;background:#b78328;color:#fff;border:2px solid #fffdf8;font-style:normal;font-size:7px;font-weight:900;display:grid;place-items:center}.top-icon em{position:absolute;right:8px;top:7px;width:6px;height:6px;border-radius:50%;background:#c38c2c}.profile-wrap{position:relative}.profile{height:40px;border:1px solid #ebe4d7;background:#fff;border-radius:11px;padding:3px 8px 3px 4px;display:flex;align-items:center;gap:7px}.avatar{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#d8b35f,#b57e25);color:#fff;display:grid;place-items:center;font-size:11px;font-weight:900}.profile-text{display:flex;flex-direction:column;text-align:left;min-width:72px}.profile-text b{font-size:10px;max-width:115px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.profile-text small{margin-top:2px;color:#aa9f8e;font-size:7px}.rotate{transform:rotate(90deg)}.profile-menu{position:absolute;right:0;top:48px;width:235px;padding:8px;background:#fff;border:1px solid #eee6d8;border-radius:14px;box-shadow:0 18px 45px rgba(56,45,28,.14);animation:menuIn .18s ease both}.menu-user{padding:9px;display:flex;align-items:center;gap:9px}.menu-user>div{display:flex;flex-direction:column;min-width:0}.menu-user b{font-size:11px}.menu-user small{margin-top:3px;color:#9d9589;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:8px}.avatar.big{width:38px;height:38px}.profile-menu hr{border:0;border-top:1px solid #f0e9df;margin:6px 0}.profile-menu a,.profile-menu button{width:100%;height:37px;border:0;background:transparent;border-radius:8px;display:flex;align-items:center;gap:9px;padding:0 10px;color:#6d665b;font-size:10px;font-weight:650;text-align:left}.profile-menu a:hover,.profile-menu button:hover{background:#fbf7ef;color:#a87826}.body{max-width:1540px;margin:auto;padding:17px 30px 45px}.error{margin-bottom:14px;border:1px solid #f0d6d6;background:#fff7f7;border-radius:12px;padding:11px 13px;display:flex;align-items:center;justify-content:space-between}.error div{display:flex;flex-direction:column}.error b{color:#9b4f4f;font-size:10px}.error span{margin-top:3px;color:#a97878;font-size:8px}.error button{border:0;background:#fff;color:#995050;padding:7px 9px;border-radius:8px;font-size:9px;font-weight:800;display:flex;gap:5px;align-items:center}.category-rail{height:64px;background:#fff;border:1px solid #eee7da;border-radius:15px;display:flex;align-items:center;gap:6px;padding:6px;box-shadow:0 5px 18px rgba(61,48,28,.03);overflow:hidden}.rail-scroll{display:flex;align-items:center;gap:4px;overflow-x:auto;scroll-behavior:smooth;flex:1;scrollbar-width:none}.rail-scroll::-webkit-scrollbar{display:none}.rail-item{height:50px;min-width:92px;padding:0 11px;border:0;border-radius:10px;background:transparent;color:#746d62;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:8px;font-weight:750;white-space:nowrap}.rail-item:hover{background:#fbf6eb;color:#a87826}.rail-item.active{background:#fbf1dc;color:#a67623}.rail-arrow{width:30px;height:34px;flex:0 0 30px;border:1px solid #eee6d8;background:#fffaf1;border-radius:8px;color:#9b722b;display:grid;place-items:center}.rail-all{height:34px;padding:0 11px;border-radius:9px;background:#faf4e7;color:#a37425;font-size:9px;font-weight:800;display:flex;align-items:center;gap:4px;white-space:nowrap}.hero-market{position:relative;margin-top:16px;height:min(31vw,350px);min-height:220px;overflow:hidden;border-radius:19px;background:#f5eee1;border:1px solid #eadfc9;box-shadow:0 12px 35px rgba(67,51,26,.06)}.hero-link,.hero-link img{width:100%;height:100%;display:block}.hero-link img{object-fit:cover;object-position:center}.hero-arrow{position:absolute;z-index:3;top:50%;transform:translateY(-50%);width:38px;height:38px;border:1px solid rgba(255,255,255,.7);background:rgba(255,255,255,.82);color:#765a29;border-radius:50%;display:grid;place-items:center;box-shadow:0 7px 18px rgba(52,39,21,.1)}.hero-arrow.left{left:13px}.hero-arrow.right{right:13px}.hero-dots{position:absolute;bottom:13px;left:0;right:0;display:flex;justify-content:center;gap:5px}.dot{width:7px;height:7px;border:0;border-radius:99px;padding:0;background:rgba(255,255,255,.6);transition:.2s}.dot.active{width:20px;background:#bd8b30}.quick-actions{margin-top:14px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.quick-card{min-height:74px;border:1px solid #eee7da;background:#fff;border-radius:13px;padding:11px;display:flex;align-items:center;gap:10px;transition:.22s}.quick-card:hover{transform:translateY(-3px);border-color:#dfc99e;box-shadow:0 12px 25px rgba(62,48,27,.07)}.quick-icon{width:38px;height:38px;border-radius:11px;background:#fbf2df;color:#a97827;display:grid;place-items:center;flex:0 0 38px}.quick-icon.flame{background:#fff0d9;color:#c17e22}.quick-card div{display:flex;flex-direction:column;flex:1;min-width:0}.quick-card b{font-size:10px}.quick-card small{margin-top:3px;color:#a09a90;font-size:8px}.quick-card>svg{color:#b6ac9d}.section-head{margin:30px 0 20px;display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.section-head>div:first-child>span,.section-title>div>span{color:#b18438;font-size:7px;font-weight:900;letter-spacing:1.4px}.section-head h1{margin:5px 0 4px;font-size:27px;letter-spacing:-1px}.section-head p{margin:0;color:#9b9387;font-size:10px}.mini-stats{display:flex;gap:6px}.mini-stats span{padding:9px 11px;background:#fff;border:1px solid #eee7da;border-radius:10px;color:#9b9387;font-size:8px}.mini-stats b{color:#a77825;margin-right:3px}.deal-section{padding:20px;border:1px solid #eadcc0;border-radius:18px;background:linear-gradient(135deg,#fff7e6,#fffdf8);margin-top:18px}.deal-head{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:14px}.deal-title h2{margin:5px 0 3px;font-size:20px}.deal-title p{margin:0;color:#9c9385;font-size:9px}.deal-badge{display:inline-flex;align-items:center;gap:5px;color:#b07c24;font-size:8px;font-weight:900;letter-spacing:1px}.deal-head>a,.section-title>a{display:flex;align-items:center;gap:4px;color:#a57625;font-size:9px;font-weight:850}.deal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.section{margin-top:40px}.section-title{display:flex;align-items:flex-end;justify-content:space-between;gap:15px;margin-bottom:15px}.section-title h2{margin:5px 0 4px;font-size:20px;letter-spacing:-.5px}.section-title p{margin:0;color:#9b9388;font-size:9px}.category-cards{display:grid;grid-template-columns:repeat(6,1fr);gap:9px}.category-cards button{min-height:112px;border:1px solid #eee7da;background:#fff;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;color:#6e675d;transition:.22s}.category-cards button:hover{transform:translateY(-3px);border-color:#dfc99e;background:#fffaf2;box-shadow:0 10px 23px rgba(60,48,27,.06)}.cat-circle{width:39px;height:39px;border-radius:12px;background:#fbf3e3;color:#a97928;display:grid;place-items:center}.category-cards b{font-size:9px}.category-cards small{color:#aaa195;font-size:7px}.product-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:13px}.card{overflow:hidden;background:#fff;border:1px solid #eee7da;border-radius:15px;transition:.25s}.card:hover{transform:translateY(-5px);border-color:#dfc89b;box-shadow:0 17px 35px rgba(57,44,25,.09)}.image-click{position:relative;width:100%;height:218px;padding:0;border:0;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden}.image-click>img{width:100%;height:100%;object-fit:contain;display:block}.card.compact .image-click{height:145px}.discount{position:absolute;z-index:3;left:9px;top:9px;background:#b9852a;color:#fff;border-radius:6px;padding:5px 6px;font-size:7px;font-weight:900}.flash-tag{position:absolute;z-index:3;left:9px;bottom:9px;background:#fff2db;color:#a97420;border:1px solid #efd7ac;border-radius:6px;padding:4px 6px;font-size:7px;font-weight:900;display:flex;align-items:center;gap:3px}.heart{position:absolute;z-index:4;right:9px;top:9px;width:31px;height:31px;border:1px solid #eee7da;background:rgba(255,255,255,.94);color:#8f877b;border-radius:9px;display:grid;place-items:center}.heart.liked{color:#b37926;background:#fff8eb;border-color:#e0c38b}.view-chip{position:absolute;left:50%;bottom:10px;transform:translate(-50%,8px);opacity:0;padding:6px 9px;border-radius:8px;background:rgba(255,255,255,.95);color:#9f7227;font-size:7px;font-weight:850;box-shadow:0 6px 16px rgba(55,43,25,.1);transition:.2s;white-space:nowrap;display:flex;align-items:center;gap:3px}.image-click:hover .view-chip{opacity:1;transform:translate(-50%,0)}.fallback{display:none;position:absolute;inset:0;align-items:center;justify-content:center;flex-direction:column;gap:5px;color:#aaa195;background:#faf8f4;font-size:8px}.fallback.show{display:flex}.card-info{padding:11px 12px 12px}.card-info>small{color:#b1843a;text-transform:uppercase;font-size:7px;font-weight:900;letter-spacing:.7px}.card-info h3{margin:5px 0 2px;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#302c25}.card-info>p{margin:0;color:#aaa196;font-size:8px}.rating{display:flex;align-items:center;gap:5px;margin-top:7px}.rating span{display:flex;align-items:center;gap:2px;color:#a87927;font-size:8px;font-weight:850}.rating em{color:#b2aaa0;font-size:7px;font-style:normal}.card-bottom{margin-top:10px;display:flex;align-items:center;justify-content:space-between;gap:5px}.card-bottom>div{display:flex;align-items:baseline;gap:6px}.card-bottom b{font-size:13px}.card-bottom del{color:#aaa197;font-size:7px}.add{height:29px;padding:0 8px;border:1px solid #e2cd9f;border-radius:8px;background:#fff9ee;color:#a77725;display:flex;align-items:center;gap:3px;font-size:8px;font-weight:850}.add:hover{background:#b8872d;color:#fff;border-color:#b8872d}.smart-banner{margin-top:40px;min-height:210px;border-radius:19px;border:1px solid #e6d5b0;background:radial-gradient(circle at 85% 35%,rgba(212,172,91,.24),transparent 30%),linear-gradient(120deg,#fff7e7,#fbf3e3);padding:28px 32px;display:flex;align-items:center;justify-content:space-between;overflow:hidden}.smart-copy>span{color:#b0802e;font-size:7px;font-weight:900;letter-spacing:1.4px}.smart-copy h2{margin:7px 0 5px;font-size:23px}.smart-copy p{max-width:560px;margin:0;color:#8f877b;font-size:10px;line-height:1.7}.smart-copy a{margin-top:17px;width:max-content;padding:9px 12px;border-radius:9px;background:#b8872d;color:#fff;display:flex;align-items:center;gap:6px;font-size:9px;font-weight:850}.smart-orbit{width:190px;height:150px;border-radius:50%;border:1px dashed #d5b879;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#a87827;background:rgba(255,255,255,.48);box-shadow:0 0 0 18px rgba(201,160,77,.04),0 0 0 36px rgba(201,160,77,.025);flex:0 0 auto}.smart-orbit div{margin-top:8px;display:flex;flex-direction:column;text-align:center}.smart-orbit b{font-size:11px}.smart-orbit span{margin-top:3px;color:#9c9386;font-size:7px}.benefits{margin-top:22px;padding:15px;background:#fff;border:1px solid #eee7da;border-radius:15px;display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.benefits>div{display:flex;align-items:center;gap:9px;padding:8px}.benefits span{width:36px;height:36px;border-radius:10px;background:#fbf3e3;color:#a87928;display:grid;place-items:center}.benefits div div{display:flex;flex-direction:column}.benefits b{font-size:9px}.benefits small{margin-top:3px;color:#a19a8f;font-size:7px}footer{margin-top:35px;padding-top:18px;border-top:1px solid #eee7da;display:flex;justify-content:space-between;color:#aaa196;font-size:8px}footer div{display:flex;gap:8px;align-items:center}footer b{color:#a87927}.empty{min-height:220px;border:1px dashed #ddd3c2;border-radius:15px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#a39a8c}.empty b{margin-top:10px;color:#4d473e;font-size:12px}.empty span{margin-top:4px;font-size:9px}.empty button{margin-top:12px;border:0;border-radius:8px;padding:8px 11px;background:#b8872d;color:#fff;font-size:8px;font-weight:850}.toast{position:fixed;z-index:300;right:24px;bottom:24px;padding:11px 14px;border-radius:11px;background:#30291f;color:#fff;display:flex;align-items:center;gap:8px;box-shadow:0 15px 35px rgba(39,31,20,.2);font-size:10px;animation:toast .25s ease both}.toast svg{color:#dfb75e}@keyframes toast{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@keyframes menuIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}.overlay{display:none}
@media(max-width:1200px){.search-box{width:250px}.product-grid{grid-template-columns:repeat(3,1fr)}.category-cards{grid-template-columns:repeat(4,1fr)}.quick-actions{grid-template-columns:repeat(2,1fr)}.deal-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:900px){.sidebar{width:235px;transform:translateX(-105%);transition:.25s;box-shadow:15px 0 35px rgba(40,31,18,.1)}.sidebar.open{transform:translateX(0)}.close-mobile{display:block}.main{margin-left:0}.mobile-menu{display:grid;place-items:center}.overlay{display:block;position:fixed;inset:0;z-index:90;border:0;background:rgba(28,23,16,.25);backdrop-filter:blur(2px)}.topbar{padding:0 17px}.body{padding:15px 17px 40px}.profile-text{display:none}.profile{padding-right:4px}.hero-market{height:34vw;min-height:190px}.mini-stats{display:none}.section-head{margin-top:25px}.category-cards{grid-template-columns:repeat(4,1fr)}}
@media(max-width:650px){.top-left span{display:none}.top-right{gap:5px}.search-box{width:40px;padding:0;justify-content:center}.search-box input,.search-box button{display:none}.top-icon{width:37px;height:37px}.profile{width:37px;height:37px;padding:2px;justify-content:center}.profile>svg{display:none}.hero-market{height:48vw;min-height:170px;border-radius:14px}.hero-arrow{width:31px;height:31px}.category-rail{height:60px}.rail-item{min-width:75px;height:48px}.rail-all{display:none}.section-head{display:block}.section-head h1{font-size:23px}.quick-actions{grid-template-columns:1fr 1fr}.quick-card{min-height:68px;padding:9px}.quick-card small{display:none}.quick-icon{width:34px;height:34px;flex-basis:34px}.deal-section{padding:15px}.deal-grid{grid-template-columns:1fr}.section-title{align-items:flex-start}.section-title h2{font-size:18px}.section-title p{line-height:1.5}.category-cards{grid-template-columns:repeat(3,1fr)}.category-cards button{min-height:96px}.product-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.image-click{height:165px}.card.compact .image-click{height:130px}.card-info{padding:9px}.card-info h3{font-size:10px}.card-bottom b{font-size:11px}.add{padding:0 7px}.add span{display:none}.smart-banner{padding:22px;min-height:200px}.smart-orbit{display:none}.benefits{grid-template-columns:1fr 1fr}.benefits>div{padding:6px}.benefits small{display:none}footer{flex-direction:column;gap:7px}.toast{right:12px;bottom:12px}.profile-menu{right:-4px}.error{align-items:flex-start;gap:10px}}
@media(max-width:400px){.category-cards{grid-template-columns:repeat(2,1fr)}.quick-card>svg{display:none}.benefits{grid-template-columns:1fr}.product-grid{gap:7px}.image-click{height:150px}.card-bottom>div{min-width:0}.card-bottom del{display:none}}
`;
