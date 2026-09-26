"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GitCompare,
  Heart,
  Home,
  ImageOff,
  LayoutDashboard,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  User,
  X,
  Zap,
  WalletCards,
  Wrench,
  Trophy,
  Target,
  Grid3X3,
  List,
  RefreshCw,
  Eye,
  Plus,
  Minus,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

/* =========================================================
   TYPES
========================================================= */

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug?: string | null;
  short_description?: string | null;
  description?: string | null;
  price: number;
  original_price?: number | null;
  stock?: number | null;
  image_url?: string | null;
  brand?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  is_featured?: boolean | null;
  is_flash_sale?: boolean | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

type CartItem = {
  id: string;
  product_id?: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
  stock?: number | null;
};

/* =========================================================
   CONSTANTS
========================================================= */

const CART_KEY = "primecart-cart";
const WISHLIST_KEY = "primecart-wishlist";
const RECENT_KEY = "primecart-recently-viewed";
const SIDEBAR_KEY = "primecart-sidebar-collapsed";

const HERO_BANNERS = [
  "/banner/hero-banner.png",
  "/banner/hero-banner-2.png",
  "/banner/hero-banner-3.png",
  "/banner/hero-banner-4.png",
  "/banner/hero-banner-5.png",
  "/banner/hero-banner-6.png",
  "/banner/hero-banner-7.png",
  "/banner/hero-banner-8.png",
] as const;

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const sidebarMainItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: ShoppingBag,
  },
  {
    label: "Categories",
    href: "/dashboard/categories",
    icon: Grid3X3,
  },
  {
    label: "My Orders",
    href: "/dashboard/orders",
    icon: Package,
  },
  {
    label: "Wishlist",
    href: "/dashboard/wishlist",
    icon: Heart,
  },
];

const smartTools = [
  {
    label: "PrimeMatch",
    href: "/dashboard/prime-match",
    icon: Target,
  },
  {
    label: "Budget Builder",
    href: "/dashboard/budget-builder",
    icon: WalletCards,
  },
  {
    label: "Setup Builder",
    href: "/dashboard/setup-builder",
    icon: Wrench,
  },
  {
    label: "PrimePoints",
    href: "/dashboard/prime-points",
    icon: Trophy,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(value: number | null | undefined) {
  return INR.format(Number(value || 0));
}

function getImageUrl(image?: string | null) {
  if (!image) return "";

  const value = image.trim();

  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (value.startsWith("/products/")) {
    return value;
  }

  if (value.startsWith("products/")) {
    return `/${value}`;
  }

  if (value.startsWith("/public/products/")) {
    return value.replace("/public", "");
  }

  if (value.startsWith("public/products/")) {
    return `/${value.replace("public/", "")}`;
  }

  if (value.startsWith("/")) {
    return value;
  }

  return `/products/${value}`;
}

function getDiscount(product: Product) {
  const original = Number(product.original_price || 0);
  const price = Number(product.price || 0);

  if (!original || !price || original <= price) return 0;

  return Math.round(((original - price) / original) * 100);
}

function getCategoryName(
  categoryId: string | null | undefined,
  categories: Category[]
) {
  if (!categoryId) return "General";

  return (
    categories.find((category) => category.id === categoryId)?.name ||
    "General"
  );
}

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/* =========================================================
   PRODUCT IMAGE
   IMPORTANT:
   object-contain = image full visible / no crop
========================================================= */

function ProductImage({
  src,
  alt,
  className = "",
  imageClassName = "",
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  const imageUrl = getImageUrl(src);

  if (!imageUrl || failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-[#f7f2e9] ${className}`}
      >
        <div className="flex flex-col items-center gap-2 text-[#b9aa91]">
          <ImageOff size={28} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">No image</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#faf7f0] ${className}`}
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 300px"
        className={`object-contain p-5 transition-transform duration-500 ${imageClassName}`}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
}) {
  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-[80] bg-[#2d2418]/35 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-[90] flex h-screen flex-col
          border-r border-[#eadfcd] bg-[#fffdf9]
          shadow-[8px_0_35px_rgba(80,55,20,0.05)]
          transition-all duration-300 ease-out
          lg:translate-x-0
          ${collapsed ? "lg:w-[82px]" : "lg:w-[260px]"}
          ${mobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full"}
        `}
      >
        {/* LOGO */}
        <div
          className={`flex h-[76px] items-center border-b border-[#eee5d7] ${
            collapsed ? "justify-center px-3" : "justify-between px-5"
          }`}
        >
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="group flex min-w-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#d8b66a] to-[#a97d32] text-lg font-black text-white shadow-[0_8px_20px_rgba(185,151,91,0.25)]">
              P
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-[17px] font-extrabold tracking-[-0.02em] text-[#3b3022]">
                  PrimeCart
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b19769]">
                  Smart Shopping
                </p>
              </div>
            )}
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-[#8e806c] transition hover:bg-[#f6f0e5] hover:text-[#5c4b36] lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* NAV */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <SidebarSection
            title="SHOP"
            collapsed={collapsed}
            items={sidebarMainItems}
            onNavigate={() => setMobileOpen(false)}
          />

          <div className="my-5 h-px bg-[#eee6d9]" />

          <SidebarSection
            title="SMART TOOLS"
            collapsed={collapsed}
            items={smartTools}
            onNavigate={() => setMobileOpen(false)}
          />

          <div className="my-5 h-px bg-[#eee6d9]" />

          <SidebarItem
            item={{
              label: "Profile",
              href: "/dashboard/profile",
              icon: User,
            }}
            collapsed={collapsed}
            onNavigate={() => setMobileOpen(false)}
          />

          <SidebarItem
            item={{
              label: "Settings",
              href: "/dashboard/settings",
              icon: Settings,
            }}
            collapsed={collapsed}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>

        {/* BOTTOM */}
        <div className="border-t border-[#eee5d7] p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden w-full items-center rounded-xl border border-[#eee4d4] bg-[#fcfaf6] p-3 text-[#796b58] transition hover:border-[#d8c49d] hover:bg-[#f8f0e2] lg:flex ${
              collapsed ? "justify-center" : "justify-between"
            }`}
            title={collapsed ? "Expand sidebar" : "Minimize sidebar"}
          >
            {!collapsed && (
              <span className="text-xs font-bold">Minimize sidebar</span>
            )}

            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarSection({
  title,
  collapsed,
  items,
  onNavigate,
}: {
  title: string;
  collapsed: boolean;
  items: typeof sidebarMainItems;
  onNavigate: () => void;
}) {
  return (
    <div>
      {!collapsed && (
        <p className="mb-2 px-3 text-[9px] font-extrabold tracking-[0.2em] text-[#b6a58b]">
          {title}
        </p>
      )}

      <div className="space-y-1">
        {items.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

function SidebarItem({
  item,
  collapsed,
  onNavigate,
}: {
  item: {
    label: string;
    href: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  };
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const active = item.href === "/dashboard/products";

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={`
        group relative flex items-center gap-3 rounded-xl px-3 py-3
        transition-all duration-200
        ${collapsed ? "justify-center" : ""}
        ${
          active
            ? "bg-[#f7edda] text-[#9b702e] shadow-[inset_3px_0_0_#b9975b]"
            : "text-[#776b5b] hover:bg-[#faf5eb] hover:text-[#4d402f]"
        }
      `}
    >
      <Icon
        size={18}
        strokeWidth={active ? 2.4 : 1.9}
        className="shrink-0"
      />

      {!collapsed && (
        <span className="truncate text-[13px] font-semibold">{item.label}</span>
      )}

      {active && !collapsed && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#b9975b]" />
      )}

      {collapsed && (
        <span className="pointer-events-none absolute left-[72px] z-50 hidden whitespace-nowrap rounded-lg bg-[#342a1d] px-3 py-2 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover:block group-hover:opacity-100">
          {item.label}
        </span>
      )}
    </Link>
  );
}

/* =========================================================
   FILTER PANEL
========================================================= */

function FilterPanel({
  categories,
  selectedCategory,
  setSelectedCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  ratingFilter,
  setRatingFilter,
  discountFilter,
  setDiscountFilter,
  stockOnly,
  setStockOnly,
  brands,
  selectedBrands,
  setSelectedBrands,
  sort,
  setSort,
  clearFilters,
}: {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
  ratingFilter: string;
  setRatingFilter: (value: string) => void;
  discountFilter: string;
  setDiscountFilter: (value: string) => void;
  stockOnly: boolean;
  setStockOnly: (value: boolean) => void;
  brands: string[];
  selectedBrands: string[];
  setSelectedBrands: (value: string[]) => void;
  sort: string;
  setSort: (value: string) => void;
  clearFilters: () => void;
}) {
  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter((item) => item !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  return (
    <div className="space-y-6">
      {/* CATEGORY */}
      <FilterBlock title="Category">
        <div className="space-y-1.5">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition ${
              selectedCategory === "all"
                ? "bg-[#f7edda] text-[#9b702e]"
                : "text-[#746957] hover:bg-[#faf6ef]"
            }`}
          >
            <span>All Categories</span>
            {selectedCategory === "all" && <Check size={15} />}
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition ${
                selectedCategory === category.id
                  ? "bg-[#f7edda] text-[#9b702e]"
                  : "text-[#746957] hover:bg-[#faf6ef]"
              }`}
            >
              <span className="truncate">{category.name}</span>
              {selectedCategory === category.id && <Check size={15} />}
            </button>
          ))}
        </div>
      </FilterBlock>

      {/* PRICE */}
      <FilterBlock title="Price Range">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold text-[#a0927e]">
              MIN
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="₹0"
              className="w-full rounded-lg border border-[#e7dece] bg-[#fffdf9] px-3 py-2.5 text-xs outline-none transition focus:border-[#b9975b] focus:ring-2 focus:ring-[#b9975b]/10"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold text-[#a0927e]">
              MAX
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="₹1L"
              className="w-full rounded-lg border border-[#e7dece] bg-[#fffdf9] px-3 py-2.5 text-xs outline-none transition focus:border-[#b9975b] focus:ring-2 focus:ring-[#b9975b]/10"
            />
          </div>
        </div>
      </FilterBlock>

      {/* RATING */}
      <FilterBlock title="Customer Rating">
        {[4, 3, 2].map((rating) => (
          <button
            key={rating}
            onClick={() =>
              setRatingFilter(ratingFilter === String(rating) ? "0" : String(rating))
            }
            className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs transition ${
              ratingFilter === String(rating)
                ? "bg-[#f7edda] text-[#8e672c]"
                : "text-[#776b5b] hover:bg-[#faf6ef]"
            }`}
          >
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={12}
                  fill={index < rating ? "currentColor" : "none"}
                />
              ))}
            </div>
            <span>& up</span>
          </button>
        ))}
      </FilterBlock>

      {/* DISCOUNT */}
      <FilterBlock title="Discount">
        {[
          ["10", "10% & above"],
          ["20", "20% & above"],
          ["30", "30% & above"],
          ["50", "50% & above"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() =>
              setDiscountFilter(
                discountFilter === value ? "0" : value
              )
            }
            className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
              discountFilter === value
                ? "bg-[#f7edda] text-[#8e672c]"
                : "text-[#776b5b] hover:bg-[#faf6ef]"
            }`}
          >
            <span>{label}</span>
            {discountFilter === value && <Check size={14} />}
          </button>
        ))}
      </FilterBlock>

      {/* BRANDS */}
      {brands.length > 0 && (
        <FilterBlock title="Brands">
          <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-[#faf6ef]"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="h-3.5 w-3.5 accent-[#b9975b]"
                />
                <span className="truncate text-xs font-medium text-[#746957]">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </FilterBlock>
      )}

      {/* STOCK */}
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#eee5d7] bg-[#fcfaf6] p-3">
        <div>
          <p className="text-xs font-bold text-[#554938]">In Stock Only</p>
          <p className="mt-0.5 text-[10px] text-[#a09381]">
            Hide unavailable items
          </p>
        </div>

        <button
          type="button"
          onClick={() => setStockOnly(!stockOnly)}
          className={`relative h-6 w-11 rounded-full transition ${
            stockOnly ? "bg-[#b9975b]" : "bg-[#d9d0c1]"
          }`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
              stockOnly ? "left-6" : "left-1"
            }`}
          />
        </button>
      </label>

      {/* SORT */}
      <FilterBlock title="Sort By">
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full appearance-none rounded-lg border border-[#e7dece] bg-[#fffdf9] px-3 py-2.5 pr-8 text-xs font-semibold text-[#675947] outline-none focus:border-[#b9975b]"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="rating">Top Rated</option>
            <option value="discount">Best Discount</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9d8e78]"
          />
        </div>
      </FilterBlock>

      <button
        onClick={clearFilters}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e7dbc8] bg-white px-4 py-3 text-xs font-bold text-[#806a48] transition hover:border-[#c9ad78] hover:bg-[#fbf5e9]"
      >
        <RefreshCw size={14} />
        Reset Filters
      </button>
    </div>
  );
}

function FilterBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#665845]">
        {title}
      </p>
      {children}
    </div>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  categories,
  wishlistIds,
  compareIds,
  toggleWishlist,
  toggleCompare,
  addToCart,
  openQuickView,
  addingProductId,
  showToast,
}: {
  product: Product;
  categories: Category[];
  wishlistIds: string[];
  compareIds: string[];
  toggleWishlist: (product: Product) => void;
  toggleCompare: (product: Product) => void;
  addToCart: (product: Product) => void;
  openQuickView: (product: Product) => void;
  addingProductId: string | null;
  showToast: (message: string) => void;
}) {
  const discount = getDiscount(product);
  const isWishlisted = wishlistIds.includes(product.id);
  const isCompared = compareIds.includes(product.id);
  const outOfStock = Number(product.stock || 0) <= 0;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[#ece3d4] bg-white shadow-[0_8px_28px_rgba(73,52,23,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#dfcda9] hover:shadow-[0_18px_45px_rgba(73,52,23,0.10)]">
      {/* IMAGE */}
      <div className="relative aspect-square overflow-hidden bg-[#faf7f0]">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          imageClassName="group-hover:scale-[1.025]"
          priority={false}
        />

        {/* soft overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#3c2d1b]/5 via-transparent to-white/10" />

        {/* BADGES */}
        <div className="absolute left-3 top-3 flex max-w-[70%] flex-wrap gap-1.5">
          {product.is_flash_sale && (
            <span className="flex items-center gap-1 rounded-full bg-[#3d3021] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-sm">
              <Zap size={10} fill="currentColor" />
              Flash
            </span>
          )}

          {discount > 0 && (
            <span className="rounded-full bg-[#f2dfbb] px-2.5 py-1 text-[9px] font-extrabold text-[#8d672d]">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* WISHLIST */}
        <button
          onClick={() => toggleWishlist(product)}
          aria-label="Wishlist"
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all ${
            isWishlisted
              ? "border-[#e1c993] bg-[#fff8e9] text-[#b78631]"
              : "border-white/80 bg-white/90 text-[#887966] hover:border-[#ddc89f] hover:text-[#aa7c32]"
          }`}
        >
          <Heart
            size={16}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>

        {/* HOVER ACTIONS */}
        <div className="absolute inset-x-3 bottom-3 hidden gap-2 opacity-0 transition-all duration-300 group-hover:flex group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={() => openQuickView(product)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/80 bg-white/95 py-2.5 text-[10px] font-extrabold text-[#5b4b38] shadow-lg backdrop-blur-md transition hover:bg-white"
          >
            <Eye size={13} />
            Quick View
          </button>

          <button
            onClick={() => addToCart(product)}
            disabled={outOfStock || addingProductId === product.id}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#b9975b] py-2.5 text-[10px] font-extrabold text-white shadow-lg transition hover:bg-[#a98549] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart size={13} />
            {addingProductId === product.id ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#a18d6e]">
            {getCategoryName(product.category_id, categories)}
          </span>

          {product.brand && (
            <span className="max-w-[45%] truncate text-[10px] font-bold text-[#988b79]">
              {product.brand}
            </span>
          )}
        </div>

        <Link
          href={`/dashboard/products/${product.id}`}
          className="block"
        >
          <h3 className="line-clamp-2 min-h-[38px] text-[14px] font-extrabold leading-5 text-[#403528] transition hover:text-[#a77b32]">
            {product.name}
          </h3>
        </Link>

        {product.short_description && (
          <p className="mt-1 line-clamp-2 min-h-[32px] text-[10px] leading-4 text-[#a09483]">
            {product.short_description}
          </p>
        )}

        {/* RATING */}
        <div className="mt-3 flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-md bg-[#f6ecda] px-1.5 py-1 text-[10px] font-extrabold text-[#8f682e]">
            <Star size={10} fill="currentColor" />
            {Number(product.rating || 0).toFixed(1)}
          </span>

          <span className="text-[10px] text-[#a79b89]">
            ({Number(product.reviews_count || 0).toLocaleString("en-IN")})
          </span>
        </div>

        {/* PRICE */}
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-[17px] font-black tracking-[-0.02em] text-[#3d3123]">
              {formatPrice(product.price)}
            </p>

            {product.original_price &&
              Number(product.original_price) > Number(product.price) && (
                <p className="text-[10px] font-medium text-[#aaa092] line-through">
                  {formatPrice(product.original_price)}
                </p>
              )}
          </div>

          <span
            className={`text-[9px] font-bold ${
              outOfStock
                ? "text-red-500"
                : Number(product.stock || 0) < 5
                ? "text-orange-500"
                : "text-[#7d9a69]"
            }`}
          >
            {outOfStock
              ? "Out of stock"
              : Number(product.stock || 0) < 5
              ? `Only ${product.stock} left`
              : "In stock"}
          </span>
        </div>

        {/* BOTTOM */}
        <div className="mt-4 flex items-center gap-2 border-t border-[#f0e8da] pt-3">
          <button
            onClick={() => toggleCompare(product)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${
              isCompared
                ? "border-[#cdb47f] bg-[#f8efde] text-[#a77b32]"
                : "border-[#e8dfd2] text-[#968a78] hover:border-[#cfb988] hover:text-[#a77b32]"
            }`}
            title="Compare"
          >
            <GitCompare size={14} />
          </button>

          <button
            onClick={() => openQuickView(product)}
            className="flex-1 rounded-lg border border-[#e7ded0] bg-[#fffdf9] py-2 text-[10px] font-extrabold text-[#655644] transition hover:border-[#d2bb8c] hover:bg-[#faf4e9]"
          >
            View Details
          </button>

          <button
            onClick={() => addToCart(product)}
            disabled={outOfStock || addingProductId === product.id}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#b9975b] text-white transition hover:bg-[#a77f42] disabled:cursor-not-allowed disabled:opacity-50"
            title="Add to cart"
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   MINI CARD
========================================================= */

function MiniCard({
  product,
  categories,
  onClick,
}: {
  product: Product;
  categories: Category[];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-[#eee5d8] bg-white p-2.5 text-left transition hover:-translate-y-0.5 hover:border-[#ddcba7] hover:shadow-[0_10px_25px_rgba(72,51,23,0.07)]"
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#faf7f0]">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          imageClassName="p-2 group-hover:scale-[1.03]"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[9px] font-extrabold uppercase tracking-wide text-[#ad9770]">
          {getCategoryName(product.category_id, categories)}
        </p>

        <p className="mt-1 line-clamp-2 text-[12px] font-bold leading-4 text-[#4c4030]">
          {product.name}
        </p>

        <p className="mt-1.5 text-[13px] font-black text-[#9c722e]">
          {formatPrice(product.price)}
        </p>
      </div>

      <ArrowRight
        size={15}
        className="shrink-0 text-[#b6a58b] transition group-hover:translate-x-1 group-hover:text-[#9f7532]"
      />
    </button>
  );
}

/* =========================================================
   QUICK VIEW
========================================================= */

function QuickView({
  product,
  categories,
  onClose,
  addToCart,
  toggleWishlist,
  wishlistIds,
}: {
  product: Product;
  categories: Category[];
  onClose: () => void;
  addToCart: (product: Product) => void;
  toggleWishlist: (product: Product) => void;
  wishlistIds: string[];
}) {
  const [quantity, setQuantity] = useState(1);
  const discount = getDiscount(product);
  const stock = Number(product.stock || 0);
  const outOfStock = stock <= 0;

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const wishlisted = wishlistIds.includes(product.id);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#2d2418]/50 p-3 backdrop-blur-md sm:p-6">
      <div className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-[#fffdf9] shadow-[0_35px_100px_rgba(30,20,8,0.25)] lg:flex-row">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#e6ddcf] bg-white/95 text-[#756956] shadow-sm transition hover:bg-[#f8f1e5]"
        >
          <X size={18} />
        </button>

        {/* IMAGE */}
        <div className="relative min-h-[330px] flex-1 bg-[#f8f4ec] lg:min-h-[600px]">
          <ProductImage
            src={product.image_url}
            alt={product.name}
            imageClassName="p-8 sm:p-12 lg:p-16"
            priority
          />

          {discount > 0 && (
            <span className="absolute left-5 top-5 rounded-full bg-[#f0dfbe] px-3 py-1.5 text-[10px] font-extrabold text-[#8c672e]">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* DETAILS */}
        <div className="flex w-full flex-col overflow-y-auto p-6 sm:p-8 lg:w-[46%] lg:p-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-md bg-[#f7edda] px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#9c722f]">
              {getCategoryName(product.category_id, categories)}
            </span>

            {product.brand && (
              <span className="text-[10px] font-bold text-[#9e917e]">
                {product.brand}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-black leading-tight tracking-[-0.025em] text-[#3c3022] sm:text-3xl">
            {product.name}
          </h2>

          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-lg bg-[#f5ead8] px-2 py-1.5 text-xs font-extrabold text-[#8d682f]">
              <Star size={12} fill="currentColor" />
              {Number(product.rating || 0).toFixed(1)}
            </span>

            <span className="text-xs text-[#a29888]">
              {Number(product.reviews_count || 0).toLocaleString("en-IN")} reviews
            </span>
          </div>

          <div className="mt-6 border-y border-[#eee5d7] py-5">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-[#9b702e]">
                {formatPrice(product.price)}
              </span>

              {product.original_price &&
                Number(product.original_price) > Number(product.price) && (
                  <span className="pb-1 text-sm text-[#aaa093] line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
            </div>

            {discount > 0 && (
              <p className="mt-1 text-xs font-bold text-[#799261]">
                You save{" "}
                {formatPrice(
                  Number(product.original_price || 0) -
                    Number(product.price || 0)
                )}
              </p>
            )}
          </div>

          {product.short_description && (
            <p className="mt-6 text-sm leading-6 text-[#776b5b]">
              {product.short_description}
            </p>
          )}

          {product.description && (
            <div className="mt-5">
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#9f907a]">
                Product Details
              </p>
              <p className="line-clamp-5 text-xs leading-5 text-[#8c8172]">
                {product.description}
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between rounded-xl border border-[#ebe1d1] bg-[#fcfaf6] p-3">
            <span className="text-xs font-bold text-[#665846]">
              Availability
            </span>

            <span
              className={`text-xs font-extrabold ${
                outOfStock
                  ? "text-red-500"
                  : stock < 5
                  ? "text-orange-500"
                  : "text-[#77905f]"
              }`}
            >
              {outOfStock
                ? "Out of stock"
                : stock < 5
                ? `Only ${stock} left`
                : `${stock} units available`}
            </span>
          </div>

          {/* QUANTITY */}
          <div className="mt-5">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9e907d]">
              Quantity
            </p>

            <div className="flex w-fit items-center rounded-xl border border-[#e4d9c8] bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center text-[#796a56] transition hover:bg-[#faf5ec]"
              >
                <Minus size={14} />
              </button>

              <span className="w-10 text-center text-sm font-extrabold text-[#4b3e2d]">
                {quantity}
              </span>

              <button
                onClick={() =>
                  setQuantity(Math.min(stock || 1, quantity + 1))
                }
                disabled={quantity >= stock}
                className="flex h-10 w-10 items-center justify-center text-[#796a56] transition hover:bg-[#faf5ec] disabled:opacity-30"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-auto flex flex-col gap-2 pt-7 sm:flex-row">
            <button
              onClick={() => toggleWishlist(product)}
              className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-extrabold transition sm:w-12 sm:px-0 ${
                wishlisted
                  ? "border-[#dfc38d] bg-[#fbf1df] text-[#a5782e]"
                  : "border-[#e3d9c9] bg-white text-[#776a58] hover:bg-[#faf5ed]"
              }`}
              title="Wishlist"
            >
              <Heart
                size={17}
                fill={wishlisted ? "currentColor" : "none"}
              />
              <span className="sm:hidden">
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </span>
            </button>

            <button
              disabled={outOfStock}
              onClick={() => {
                for (let i = 0; i < quantity; i++) {
                  addToCart(product);
                }
                onClose();
              }}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#b9975b] px-5 text-xs font-extrabold text-white shadow-[0_10px_25px_rgba(185,151,91,0.22)] transition hover:bg-[#a77f42] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart size={16} />
              Add to Cart
            </button>

            <Link
              href={`/dashboard/products/${product.id}`}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#d9c5a1] bg-[#fffaf1] px-5 text-xs font-extrabold text-[#8d672d] transition hover:bg-[#f8efdf]"
            >
              View Full Details
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMPARE BAR
========================================================= */

function CompareBar({
  products,
  onRemove,
  onClear,
}: {
  products: Product[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  if (!products.length) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[70] w-[calc(100%-24px)] max-w-3xl -translate-x-1/2 rounded-2xl border border-[#dfcfb0] bg-[#fffdf9]/95 p-3 shadow-[0_20px_55px_rgba(51,36,16,0.16)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="hidden shrink-0 sm:block">
          <p className="text-xs font-extrabold text-[#4e402e]">
            Compare Products
          </p>
          <p className="text-[9px] text-[#a09482]">
            Up to 3 products
          </p>
        </div>

        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="relative flex min-w-[145px] items-center gap-2 rounded-xl border border-[#eee4d4] bg-white p-2"
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#faf7f0]">
                <ProductImage
                  src={product.image_url}
                  alt={product.name}
                  imageClassName="p-1"
                />
              </div>

              <p className="line-clamp-2 flex-1 text-[10px] font-bold text-[#5b4c39]">
                {product.name}
              </p>

              <button
                onClick={() => onRemove(product.id)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#4a3a27] text-white"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClear}
          className="shrink-0 rounded-lg px-2 py-2 text-[10px] font-bold text-[#927446] hover:bg-[#faf2e5]"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   TRUST STRIP
========================================================= */

function TrustStrip() {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#ebe2d4] bg-white sm:grid-cols-4">
      {[
        {
          title: "Secure Payments",
          text: "100% protected",
        },
        {
          title: "Easy Returns",
          text: "Hassle-free returns",
        },
        {
          title: "Fast Delivery",
          text: "Reliable shipping",
        },
        {
          title: "Prime Support",
          text: "We're here to help",
        },
      ].map((item, index) => (
        <div
          key={item.title}
          className={`flex items-center gap-3 p-4 ${
            index > 1 ? "border-t sm:border-t-0" : ""
          } ${
            index % 2 === 1 ? "border-l" : ""
          } border-[#eee5d8]`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f7edda] text-[#a87d37]">
            <Check size={15} />
          </div>

          <div>
            <p className="text-[10px] font-extrabold text-[#574937]">
              {item.title}
            </p>
            <p className="mt-0.5 text-[9px] text-[#a29684]">
              {item.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#eee6da] bg-white">
      <div className="aspect-square animate-pulse bg-[#f1eadf]" />
      <div className="space-y-3 p-4">
        <div className="h-2.5 w-20 animate-pulse rounded bg-[#eee6da]" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-[#eee6da]" />
        <div className="h-3 w-full animate-pulse rounded bg-[#f1eadf]" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-[#eee6da]" />
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function ProductsPage() {
  const supabase = useMemo(() => createClient(), []);

  /* SIDEBAR */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* DATA */
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* FILTERS */
  const [search, setSearch] = useState("");
  const [heroSlide, setHeroSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ratingFilter, setRatingFilter] = useState("0");
  const [discountFilter, setDiscountFilter] = useState("0");
  const [stockOnly, setStockOnly] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  /* USER FEATURES */
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);

  /* UI */
  const [mobileFilters, setMobileFilters] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [toast, setToast] = useState("");
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  /* =======================================================
     SIDEBAR PERSISTENCE
  ======================================================= */

  
  /* HERO CAROUSEL */
  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % HERO_BANNERS.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_KEY);

      if (saved !== null) {
        setSidebarCollapsed(saved === "true");
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, String(sidebarCollapsed));
    } catch {
      // ignore
    }
  }, [sidebarCollapsed]);

  /* =======================================================
     TOAST
  ======================================================= */

  const showToast = useCallback((message: string) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2600);
  }, []);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),

        supabase
          .from("categories")
          .select("id,name,slug")
          .order("name", { ascending: true }),
      ]);

      if (productsResult.error) {
        throw productsResult.error;
      }

      if (categoriesResult.error) {
        throw categoriesResult.error;
      }

      setProducts((productsResult.data || []) as Product[]);
      setCategories((categoriesResult.data || []) as Category[]);
    } catch (err) {
      console.error("Products loading error:", err);
      setError("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /* =======================================================
     LOAD LOCAL STORAGE
  ======================================================= */

  useEffect(() => {
    try {
      const savedWishlist = safeParse<string[]>(
        localStorage.getItem(WISHLIST_KEY),
        []
      );

      const savedRecent = safeParse<string[]>(
        localStorage.getItem(RECENT_KEY),
        []
      );

      const savedCart = safeParse<CartItem[]>(
        localStorage.getItem(CART_KEY),
        []
      );

      setWishlistIds(savedWishlist);
      setRecentIds(savedRecent);
      setCartCount(
        savedCart.reduce(
          (total, item) => total + Number(item.quantity || 0),
          0
        )
      );
    } catch {
      // ignore
    }
  }, []);

  /* =======================================================
     BRANDS
  ======================================================= */

  const brands = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((product) => product.brand?.trim())
          .filter(Boolean) as string[]
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [products]);

  /* =======================================================
     FILTERED PRODUCTS
  ======================================================= */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((product) => {
        const category = getCategoryName(
          product.category_id,
          categories
        ).toLowerCase();

        return (
          product.name.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query) ||
          product.short_description?.toLowerCase().includes(query) ||
          category.includes(query)
        );
      });
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        (product) => product.category_id === selectedCategory
      );
    }

    if (minPrice) {
      result = result.filter(
        (product) => Number(product.price) >= Number(minPrice)
      );
    }

    if (maxPrice) {
      result = result.filter(
        (product) => Number(product.price) <= Number(maxPrice)
      );
    }

    if (ratingFilter !== "0") {
      result = result.filter(
        (product) =>
          Number(product.rating || 0) >= Number(ratingFilter)
      );
    }

    if (discountFilter !== "0") {
      result = result.filter(
        (product) =>
          getDiscount(product) >= Number(discountFilter)
      );
    }

    if (stockOnly) {
      result = result.filter(
        (product) => Number(product.stock || 0) > 0
      );
    }

    if (selectedBrands.length) {
      result = result.filter((product) =>
        product.brand
          ? selectedBrands.includes(product.brand)
          : false
      );
    }

    switch (sort) {
      case "newest":
        result.sort((a, b) =>
          String(b.created_at || "").localeCompare(
            String(a.created_at || "")
          )
        );
        break;

      case "rating":
        result.sort(
          (a, b) =>
            Number(b.rating || 0) - Number(a.rating || 0)
        );
        break;

      case "discount":
        result.sort(
          (a, b) => getDiscount(b) - getDiscount(a)
        );
        break;

      case "price-low":
        result.sort(
          (a, b) =>
            Number(a.price || 0) - Number(b.price || 0)
        );
        break;

      case "price-high":
        result.sort(
          (a, b) =>
            Number(b.price || 0) - Number(a.price || 0)
        );
        break;

      default:
        result.sort((a, b) => {
          if (Boolean(b.is_featured) !== Boolean(a.is_featured)) {
            return b.is_featured ? 1 : -1;
          }

          return (
            Number(b.rating || 0) -
            Number(a.rating || 0)
          );
        });
    }

    return result;
  }, [
    products,
    categories,
    search,
    selectedCategory,
    minPrice,
    maxPrice,
    ratingFilter,
    discountFilter,
    stockOnly,
    selectedBrands,
    sort,
  ]);

  /* =======================================================
     FLASH / RECENT / RECOMMENDED
  ======================================================= */

  const flashProducts = useMemo(() => {
    const flash = products.filter((product) => product.is_flash_sale);

    return (flash.length ? flash : products)
      .sort((a, b) => getDiscount(b) - getDiscount(a))
      .slice(0, 4);
  }, [products]);

  const recentProducts = useMemo(() => {
    return recentIds
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean)
      .slice(0, 4) as Product[];
  }, [recentIds, products]);

  const recommendedProducts = useMemo(() => {
    return products
      .filter((product) => !recentIds.includes(product.id))
      .sort((a, b) => {
        const scoreA =
          Number(a.rating || 0) * 10 +
          getDiscount(a) +
          (a.is_featured ? 10 : 0);

        const scoreB =
          Number(b.rating || 0) * 10 +
          getDiscount(b) +
          (b.is_featured ? 10 : 0);

        return scoreB - scoreA;
      })
      .slice(0, 4);
  }, [products, recentIds]);

  const compareProducts = useMemo(() => {
    return compareIds
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean) as Product[];
  }, [compareIds, products]);

  /* =======================================================
     FILTER COUNT
  ======================================================= */

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (selectedCategory !== "all") count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (ratingFilter !== "0") count++;
    if (discountFilter !== "0") count++;
    if (stockOnly) count++;
    count += selectedBrands.length;

    return count;
  }, [
    selectedCategory,
    minPrice,
    maxPrice,
    ratingFilter,
    discountFilter,
    stockOnly,
    selectedBrands,
  ]);

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setRatingFilter("0");
    setDiscountFilter("0");
    setStockOnly(false);
    setSelectedBrands([]);
    setSort("featured");
  }, []);

  /* =======================================================
     WISHLIST
  ======================================================= */

  const toggleWishlist = useCallback(
    async (product: Product) => {
      const exists = wishlistIds.includes(product.id);

      const next = exists
        ? wishlistIds.filter((id) => id !== product.id)
        : [...wishlistIds, product.id];

      setWishlistIds(next);

      try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }

      if (exists) {
        showToast("Removed from wishlist");

        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            await supabase
              .from("wishlist")
              .delete()
              .eq("user_id", user.id)
              .eq("product_id", product.id);
          }
        } catch {
          // local wishlist still works
        }
      } else {
        showToast("Added to wishlist");

        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const { error } = await supabase
              .from("wishlist")
              .insert({
                user_id: user.id,
                product_id: product.id,
              });

            if (error && !error.message.toLowerCase().includes("duplicate")) {
              console.warn("Wishlist insert:", error.message);
            }
          }
        } catch {
          // local wishlist still works
        }
      }
    },
    [wishlistIds, showToast, supabase]
  );

  /* =======================================================
     CART
  ======================================================= */

  const addToCart = useCallback(
    (product: Product) => {
      if (Number(product.stock || 0) <= 0) {
        showToast("This product is currently out of stock");
        return;
      }

      setAddingProductId(product.id);

      window.setTimeout(() => {
        try {
          const existing = safeParse<CartItem[]>(
            localStorage.getItem(CART_KEY),
            []
          );

          const index = existing.findIndex(
            (item) =>
              item.product_id === product.id ||
              item.id === product.id
          );

          if (index >= 0) {
            const current = existing[index];

            existing[index] = {
              ...current,
              quantity: Math.min(
                Number(product.stock || 999),
                Number(current.quantity || 0) + 1
              ),
            };
          } else {
            existing.push({
              id: product.id,
              product_id: product.id,
              name: product.name,
              price: Number(product.price || 0),
              quantity: 1,
              image_url: product.image_url,
              stock: product.stock,
            });
          }

          localStorage.setItem(
            CART_KEY,
            JSON.stringify(existing)
          );

          setCartCount(
            existing.reduce(
              (total, item) =>
                total + Number(item.quantity || 0),
              0
            )
          );

          showToast("Added to cart");
        } catch {
          showToast("Unable to add product");
        } finally {
          setAddingProductId(null);
        }
      }, 180);
    },
    [showToast]
  );

  /* =======================================================
     RECENTLY VIEWED
  ======================================================= */

  const addRecentlyViewed = useCallback((product: Product) => {
    try {
      const current = safeParse<string[]>(
        localStorage.getItem(RECENT_KEY),
        []
      );

      const next = [
        product.id,
        ...current.filter((id) => id !== product.id),
      ].slice(0, 8);

      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      setRecentIds(next);
    } catch {
      // ignore
    }
  }, []);

  /* =======================================================
     QUICK VIEW
  ======================================================= */

  const openQuickView = useCallback(
    (product: Product) => {
      addRecentlyViewed(product);
      setQuickView(product);
    },
    [addRecentlyViewed]
  );

  /* =======================================================
     COMPARE
  ======================================================= */

  const toggleCompare = useCallback(
    (product: Product) => {
      if (compareIds.includes(product.id)) {
        setCompareIds(
          compareIds.filter((id) => id !== product.id)
        );
        showToast("Removed from comparison");
        return;
      }

      if (compareIds.length >= 3) {
        showToast("You can compare up to 3 products");
        return;
      }

      setCompareIds([...compareIds, product.id]);
      showToast("Added to comparison");
    },
    [compareIds, showToast]
  );

  /* =======================================================
     HEADER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#44382a]">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div
        className={`min-h-screen transition-[padding] duration-300 ${
          sidebarCollapsed ? "lg:pl-[82px]" : "lg:pl-[260px]"
        }`}
      >
        {/* HEADER */}
        <header className="sticky top-0 z-50 border-b border-[#ebe3d7] bg-[#fffdf9]/95 backdrop-blur-xl">
          <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            {/* MOBILE MENU */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e9dfd1] bg-white text-[#675947] lg:hidden"
            >
              <Menu size={19} />
            </button>

            {/* DESKTOP COLLAPSE */}
            <button
              onClick={() =>
                setSidebarCollapsed(!sidebarCollapsed)
              }
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e9dfd1] bg-white text-[#756754] transition hover:border-[#d7c198] hover:bg-[#faf4e8] lg:flex"
              title={
                sidebarCollapsed
                  ? "Expand sidebar"
                  : "Minimize sidebar"
              }
            >
              {sidebarCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>

            {/* MOBILE LOGO */}
            <Link
              href="/dashboard"
              className="flex shrink-0 items-center gap-2 lg:hidden"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#d7b566] to-[#a97b32] text-sm font-black text-white">
                P
              </div>

              <span className="hidden text-sm font-black text-[#403426] sm:block">
                PrimeCart
              </span>
            </Link>

            {/* SEARCH */}
            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a29683]"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="h-10 w-full rounded-xl border border-[#e9e0d2] bg-[#fffdf9] pl-10 pr-10 text-xs font-medium text-[#4b3d2d] outline-none transition placeholder:text-[#aaa092] focus:border-[#cdb47f] focus:ring-4 focus:ring-[#b9975b]/10"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09584] hover:text-[#665845]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* HEADER ACTIONS */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Link
                href="/dashboard/wishlist"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e9e0d2] bg-white text-[#756754] transition hover:border-[#d7c198] hover:bg-[#faf4e8]"
                title="Wishlist"
              >
                <Heart size={17} />

                {wishlistIds.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b9975b] px-1 text-[8px] font-black text-white">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              <Link
                href="/dashboard/orders"
                className="hidden h-10 items-center gap-2 rounded-xl border border-[#e9e0d2] bg-white px-3 text-xs font-bold text-[#6d604e] transition hover:border-[#d7c198] hover:bg-[#faf4e8] sm:flex"
              >
                <Package size={16} />
                Orders
              </Link>

              <Link
                href="/dashboard/cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#b9975b] text-white shadow-[0_7px_20px_rgba(185,151,91,0.18)] transition hover:bg-[#a77f42]"
                title="Cart"
              >
                <ShoppingCart size={17} />

                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3f3224] px-1 text-[8px] font-black text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="px-4 pb-16 pt-5 sm:px-6 lg:px-8">
          {/* BREADCRUMB */}
          <div className="mb-5 flex items-center gap-2 text-[10px] font-bold text-[#a19584]">
            <Link
              href="/dashboard"
              className="transition hover:text-[#9e7330]"
            >
              Dashboard
            </Link>

            <ChevronRight size={12} />

            <span className="text-[#756754]">Products</span>
          </div>

          {/* HERO BANNER CAROUSEL */}
          <section className="relative overflow-hidden rounded-3xl border border-[#e8dcc8] bg-[#fffaf1] shadow-[0_12px_40px_rgba(76,54,23,0.07)]">
            <div className="relative aspect-[16/5] min-h-[190px] w-full sm:min-h-[240px] lg:min-h-[360px]">
              {HERO_BANNERS.map((banner, index) => (
                <button
                  key={banner}
                  type="button"
                  onClick={() => setHeroSlide(index)}
                  aria-label={`Show banner ${index + 1}`}
                  className={`absolute inset-0 h-full w-full transition-all duration-700 ${
                    heroSlide === index
                      ? "pointer-events-auto translate-x-0 opacity-100"
                      : "pointer-events-none translate-x-2 opacity-0"
                  }`}
                >
                  <Image
                    src={banner}
                    alt={`PrimeCart promotional banner ${index + 1}`}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                    className="object-cover object-center"
                  />
                </button>
              ))}

              {/* PREVIOUS */}
              <button
                type="button"
                onClick={() =>
                  setHeroSlide(
                    (heroSlide - 1 + HERO_BANNERS.length) %
                      HERO_BANNERS.length
                  )
                }
                aria-label="Previous banner"
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#89642d] shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white sm:left-5 sm:h-11 sm:w-11"
              >
                <ChevronLeft size={20} />
              </button>

              {/* NEXT */}
              <button
                type="button"
                onClick={() =>
                  setHeroSlide((heroSlide + 1) % HERO_BANNERS.length)
                }
                aria-label="Next banner"
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#89642d] shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white sm:right-5 sm:h-11 sm:w-11"
              >
                <ChevronRight size={20} />
              </button>

              {/* DOTS */}
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/60 bg-white/75 px-2.5 py-1.5 shadow-md backdrop-blur-md sm:bottom-4">
                {HERO_BANNERS.map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    type="button"
                    onClick={() => setHeroSlide(index)}
                    aria-label={`Go to banner ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      heroSlide === index
                        ? "w-5 bg-[#b88935]"
                        : "w-1.5 bg-[#cdbb9b] hover:bg-[#a9864d]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* MOBILE SEARCH */}
          <div className="mt-4 lg:hidden">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a29683]"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="h-11 w-full rounded-xl border border-[#e7ded0] bg-white pl-10 pr-4 text-xs outline-none focus:border-[#b9975b]"
              />
            </div>
          </div>

          {/* FLASH DEALS */}
          {flashProducts.length > 0 && (
            <section id="flash-deals" className="mt-7">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4e3c3] text-[#9c702e]">
                      <Zap size={15} fill="currentColor" />
                    </span>

                    <div>
                      <h2 className="text-lg font-black text-[#443729]">
                        Flash Deals
                      </h2>
                      <p className="text-[10px] text-[#9c8e7c]">
                        Limited-time offers picked for you
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDiscountFilter("10");
                    document
                      .getElementById("all-products")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }}
                  className="hidden items-center gap-1 text-[10px] font-extrabold text-[#9c712f] sm:flex"
                >
                  See all deals
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {flashProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => openQuickView(product)}
                    className="group relative overflow-hidden rounded-2xl border border-[#eadfce] bg-white text-left transition hover:-translate-y-1 hover:border-[#d8c29a] hover:shadow-[0_15px_35px_rgba(72,51,23,0.08)]"
                  >
                    <div className="relative aspect-[1.15] overflow-hidden bg-[#faf7f0]">
                      <ProductImage
                        src={product.image_url}
                        alt={product.name}
                        imageClassName="p-4 group-hover:scale-[1.025]"
                      />

                      <span className="absolute left-2.5 top-2.5 rounded-full bg-[#3e3021] px-2 py-1 text-[8px] font-black text-white">
                        {getDiscount(product)}% OFF
                      </span>
                    </div>

                    <div className="p-3">
                      <p className="line-clamp-1 text-[11px] font-bold text-[#4f4232]">
                        {product.name}
                      </p>

                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-sm font-black text-[#a07532]">
                          {formatPrice(product.price)}
                        </span>

                        {product.original_price && (
                          <span className="text-[9px] text-[#aaa092] line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* TOOLBAR */}
          <section
            id="all-products"
            className="mt-8 scroll-mt-24"
          >
            <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-[-0.02em] text-[#443729]">
                  All Products
                </h2>

                <p className="mt-1 text-[11px] text-[#9a8e7d]">
                  {loading
                    ? "Loading products..."
                    : `${filteredProducts.length} products available`}
                  {activeFilterCount > 0 &&
                    ` • ${activeFilterCount} filter${
                      activeFilterCount > 1 ? "s" : ""
                    } active`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* SORT MOBILE/TABLET */}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="h-10 appearance-none rounded-xl border border-[#e6ddcf] bg-white px-3 pr-8 text-[10px] font-bold text-[#6e604e] outline-none"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="rating">Top Rated</option>
                    <option value="discount">Best Discount</option>
                    <option value="price-low">Price Low → High</option>
                    <option value="price-high">Price High → Low</option>
                  </select>

                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9d8e78]"
                  />
                </div>

                <button
                  onClick={() => setMobileFilters(true)}
                  className="relative flex h-10 items-center gap-2 rounded-xl border border-[#e6ddcf] bg-white px-3 text-[10px] font-extrabold text-[#6e604e] lg:hidden"
                >
                  <SlidersHorizontal size={14} />
                  Filters

                  {activeFilterCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b9975b] px-1 text-[8px] text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <div className="flex h-10 items-center rounded-xl border border-[#e6ddcf] bg-white p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      viewMode === "grid"
                        ? "bg-[#f6ecd9] text-[#9b702e]"
                        : "text-[#9a8f80]"
                    }`}
                  >
                    <Grid3X3 size={14} />
                  </button>

                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      viewMode === "list"
                        ? "bg-[#f6ecd9] text-[#9b702e]"
                        : "text-[#9a8f80]"
                    }`}
                  >
                    <List size={15} />
                  </button>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="hidden h-10 items-center gap-1.5 rounded-xl border border-[#e5d8c4] bg-[#fffaf2] px-3 text-[10px] font-extrabold text-[#95703a] sm:flex"
                  >
                    <X size={13} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* DESKTOP SHOP AREA */}
            <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
              {/* FILTER SIDEBAR */}
              <aside className="hidden rounded-2xl border border-[#ebe3d7] bg-white p-4 lg:block">
                <div className="mb-5 flex items-center justify-between border-b border-[#eee5d8] pb-4">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal
                      size={16}
                      className="text-[#9d7536]"
                    />
                    <span className="text-sm font-black text-[#4b3d2d]">
                      Filters
                    </span>
                  </div>

                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-[#f5ead8] px-2 py-1 text-[9px] font-black text-[#96702f]">
                      {activeFilterCount}
                    </span>
                  )}
                </div>

                <FilterPanel
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  minPrice={minPrice}
                  setMinPrice={setMinPrice}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  ratingFilter={ratingFilter}
                  setRatingFilter={setRatingFilter}
                  discountFilter={discountFilter}
                  setDiscountFilter={setDiscountFilter}
                  stockOnly={stockOnly}
                  setStockOnly={setStockOnly}
                  brands={brands}
                  selectedBrands={selectedBrands}
                  setSelectedBrands={setSelectedBrands}
                  sort={sort}
                  setSort={setSort}
                  clearFilters={clearFilters}
                />
              </aside>

              {/* PRODUCTS */}
              <div className="min-w-0">
                {/* ACTIVE CHIPS */}
                {(search ||
                  selectedCategory !== "all" ||
                  minPrice ||
                  maxPrice ||
                  ratingFilter !== "0" ||
                  discountFilter !== "0" ||
                  stockOnly ||
                  selectedBrands.length > 0) && (
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="flex items-center gap-1.5 rounded-full border border-[#dfceb0] bg-[#fff9ed] px-3 py-1.5 text-[9px] font-bold text-[#8f6a31]"
                      >
                        Search: {search}
                        <X size={11} />
                      </button>
                    )}

                    {selectedCategory !== "all" && (
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className="flex items-center gap-1.5 rounded-full border border-[#dfceb0] bg-[#fff9ed] px-3 py-1.5 text-[9px] font-bold text-[#8f6a31]"
                      >
                        {getCategoryName(
                          selectedCategory,
                          categories
                        )}
                        <X size={11} />
                      </button>
                    )}

                    {ratingFilter !== "0" && (
                      <button
                        onClick={() => setRatingFilter("0")}
                        className="flex items-center gap-1.5 rounded-full border border-[#dfceb0] bg-[#fff9ed] px-3 py-1.5 text-[9px] font-bold text-[#8f6a31]"
                      >
                        {ratingFilter}★+
                        <X size={11} />
                      </button>
                    )}

                    {discountFilter !== "0" && (
                      <button
                        onClick={() => setDiscountFilter("0")}
                        className="flex items-center gap-1.5 rounded-full border border-[#dfceb0] bg-[#fff9ed] px-3 py-1.5 text-[9px] font-bold text-[#8f6a31]"
                      >
                        {discountFilter}%+ OFF
                        <X size={11} />
                      </button>
                    )}

                    {stockOnly && (
                      <button
                        onClick={() => setStockOnly(false)}
                        className="flex items-center gap-1.5 rounded-full border border-[#dfceb0] bg-[#fff9ed] px-3 py-1.5 text-[9px] font-bold text-[#8f6a31]"
                      >
                        In Stock
                        <X size={11} />
                      </button>
                    )}

                    {selectedBrands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() =>
                          setSelectedBrands(
                            selectedBrands.filter(
                              (item) => item !== brand
                            )
                          )
                        }
                        className="flex items-center gap-1.5 rounded-full border border-[#dfceb0] bg-[#fff9ed] px-3 py-1.5 text-[9px] font-bold text-[#8f6a31]"
                      >
                        {brand}
                        <X size={11} />
                      </button>
                    ))}
                  </div>
                )}

                {loading ? (
                  <div
                    className={`grid gap-4 ${
                      viewMode === "grid"
                        ? "grid-cols-2 xl:grid-cols-3"
                        : "grid-cols-1"
                    }`}
                  >
                    {Array.from({ length: 9 }).map((_, index) => (
                      <SkeletonCard key={index} />
                    ))}
                  </div>
                ) : error ? (
                  <div className="rounded-2xl border border-red-100 bg-white p-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-400">
                      <RefreshCw size={22} />
                    </div>

                    <h3 className="mt-4 text-sm font-black text-[#514333]">
                      Something went wrong
                    </h3>

                    <p className="mt-1 text-xs text-[#9c9180]">
                      {error}
                    </p>

                    <button
                      onClick={loadProducts}
                      className="mt-5 rounded-xl bg-[#b9975b] px-5 py-2.5 text-xs font-extrabold text-white"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="rounded-2xl border border-[#ebe2d4] bg-white p-12 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f7efe1] text-[#b0915b]">
                      <Search size={24} />
                    </div>

                    <h3 className="mt-5 text-lg font-black text-[#4b3d2d]">
                      No products found
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#9d9180]">
                      We couldn't find products matching your current
                      search and filters. Try changing the filters or
                      searching for something else.
                    </p>

                    <button
                      onClick={clearFilters}
                      className="mt-5 rounded-xl bg-[#b9975b] px-5 py-2.5 text-xs font-extrabold text-white"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        categories={categories}
                        wishlistIds={wishlistIds}
                        compareIds={compareIds}
                        toggleWishlist={toggleWishlist}
                        toggleCompare={toggleCompare}
                        addToCart={addToCart}
                        openQuickView={openQuickView}
                        addingProductId={addingProductId}
                        showToast={showToast}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((product) => {
                      const discount = getDiscount(product);
                      const wishlisted = wishlistIds.includes(
                        product.id
                      );

                      return (
                        <article
                          key={product.id}
                          className="group flex flex-col gap-4 rounded-2xl border border-[#ebe2d4] bg-white p-3 transition hover:border-[#dac49a] hover:shadow-[0_14px_35px_rgba(74,52,21,0.07)] sm:flex-row sm:p-4"
                        >
                          <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-xl bg-[#faf7f0] sm:h-48 sm:w-48">
                            <ProductImage
                              src={product.image_url}
                              alt={product.name}
                              imageClassName="p-5 group-hover:scale-[1.025]"
                            />

                            {discount > 0 && (
                              <span className="absolute left-3 top-3 rounded-full bg-[#f1dfbd] px-2 py-1 text-[8px] font-black text-[#8d672d]">
                                {discount}% OFF
                              </span>
                            )}
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col p-1 sm:p-2">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#a38e6c]">
                                  {getCategoryName(
                                    product.category_id,
                                    categories
                                  )}
                                </p>

                                <Link
                                  href={`/dashboard/products/${product.id}`}
                                  className="mt-1 block"
                                >
                                  <h3 className="text-lg font-black text-[#403426] transition hover:text-[#a17431]">
                                    {product.name}
                                  </h3>
                                </Link>

                                {product.brand && (
                                  <p className="mt-1 text-[10px] font-bold text-[#a09686]">
                                    {product.brand}
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={() =>
                                  toggleWishlist(product)
                                }
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                                  wishlisted
                                    ? "border-[#dec58f] bg-[#faf1df] text-[#a87b31]"
                                    : "border-[#e7ded1] text-[#958978]"
                                }`}
                              >
                                <Heart
                                  size={16}
                                  fill={
                                    wishlisted
                                      ? "currentColor"
                                      : "none"
                                  }
                                />
                              </button>
                            </div>

                            {product.short_description && (
                              <p className="mt-3 max-w-2xl text-xs leading-5 text-[#8f8372]">
                                {product.short_description}
                              </p>
                            )}

                            <div className="mt-3 flex items-center gap-2">
                              <span className="flex items-center gap-1 rounded-md bg-[#f5ead8] px-2 py-1 text-[10px] font-bold text-[#8e682f]">
                                <Star size={10} fill="currentColor" />
                                {Number(product.rating || 0).toFixed(1)}
                              </span>

                              <span className="text-[10px] text-[#a19686]">
                                {Number(
                                  product.reviews_count || 0
                                ).toLocaleString("en-IN")}{" "}
                                reviews
                              </span>
                            </div>

                            <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-5">
                              <div>
                                <p className="text-xl font-black text-[#9b702e]">
                                  {formatPrice(product.price)}
                                </p>

                                {product.original_price &&
                                  Number(product.original_price) >
                                    Number(product.price) && (
                                    <p className="text-[10px] text-[#aaa092] line-through">
                                      {formatPrice(
                                        product.original_price
                                      )}
                                    </p>
                                  )}
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    openQuickView(product)
                                  }
                                  className="rounded-xl border border-[#e4dace] px-4 py-2.5 text-[10px] font-extrabold text-[#695a47] transition hover:bg-[#faf5ec]"
                                >
                                  Quick View
                                </button>

                                <button
                                  onClick={() =>
                                    addToCart(product)
                                  }
                                  disabled={
                                    Number(product.stock || 0) <=
                                      0 ||
                                    addingProductId === product.id
                                  }
                                  className="flex items-center gap-2 rounded-xl bg-[#b9975b] px-4 py-2.5 text-[10px] font-extrabold text-white transition hover:bg-[#a77f42] disabled:opacity-50"
                                >
                                  <ShoppingCart size={13} />
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* RECOMMENDED */}
          {!loading && recommendedProducts.length > 0 && (
            <section className="mt-10">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4e7d0] text-[#a47834]">
                      <Sparkles size={15} />
                    </span>

                    <div>
                      <h2 className="text-lg font-black text-[#443729]">
                        Recommended For You
                      </h2>
                      <p className="text-[10px] text-[#9b8e7c]">
                        Popular picks worth exploring
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {recommendedProducts.map((product) => (
                  <MiniCard
                    key={product.id}
                    product={product}
                    categories={categories}
                    onClick={() => openQuickView(product)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* RECENTLY VIEWED */}
          {recentProducts.length > 0 && (
            <section className="mt-10">
              <div className="mb-4">
                <h2 className="text-lg font-black text-[#443729]">
                  Recently Viewed
                </h2>
                <p className="text-[10px] text-[#9b8e7c]">
                  Pick up where you left off
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {recentProducts.map((product) => (
                  <MiniCard
                    key={product.id}
                    product={product}
                    categories={categories}
                    onClick={() => openQuickView(product)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* TRUST */}
          <section className="mt-10">
            <TrustStrip />
          </section>
        </main>
      </div>

      {/* =====================================================
          MOBILE FILTER DRAWER
      ===================================================== */}

      {mobileFilters && (
        <div className="fixed inset-0 z-[110] bg-[#2d2418]/45 backdrop-blur-sm lg:hidden">
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-[#fffdf9] shadow-2xl">
            <div className="flex h-[72px] items-center justify-between border-b border-[#eee5d7] px-5">
              <div>
                <h3 className="text-base font-black text-[#4b3d2d]">
                  Filters
                </h3>
                <p className="text-[9px] text-[#a0927f]">
                  Refine your results
                </p>
              </div>

              <button
                onClick={() => setMobileFilters(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8dfd1] text-[#776957]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <FilterPanel
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                ratingFilter={ratingFilter}
                setRatingFilter={setRatingFilter}
                discountFilter={discountFilter}
                setDiscountFilter={setDiscountFilter}
                stockOnly={stockOnly}
                setStockOnly={setStockOnly}
                brands={brands}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                sort={sort}
                setSort={setSort}
                clearFilters={clearFilters}
              />
            </div>

            <div className="border-t border-[#eee5d7] p-4">
              <button
                onClick={() => setMobileFilters(false)}
                className="w-full rounded-xl bg-[#b9975b] py-3 text-xs font-extrabold text-white"
              >
                Show {filteredProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          QUICK VIEW
      ===================================================== */}

      {quickView && (
        <QuickView
          product={quickView}
          categories={categories}
          onClose={() => setQuickView(null)}
          addToCart={addToCart}
          toggleWishlist={toggleWishlist}
          wishlistIds={wishlistIds}
        />
      )}

      {/* =====================================================
          COMPARE BAR
      ===================================================== */}

      <CompareBar
        products={compareProducts}
        onRemove={(id) =>
          setCompareIds(
            compareIds.filter((productId) => productId !== id)
          )
        }
        onClear={() => setCompareIds([])}
      />

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[150] max-w-[calc(100%-40px)]">
          <div className="flex items-center gap-3 rounded-xl border border-[#dbc79f] bg-[#3e3123] px-4 py-3 text-xs font-bold text-white shadow-[0_15px_40px_rgba(45,32,15,0.2)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#b9975b]">
              <Check size={13} />
            </span>

            {toast}
          </div>
        </div>
      )}

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

      <style jsx global>{`
        @keyframes primecartFadeUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes primecartShimmer {
          0% {
            background-position: -500px 0;
          }
          100% {
            background-position: 500px 0;
          }
        }

        html {
          scroll-behavior: smooth;
        }

        ::selection {
          background: #e5d2a9;
          color: #4a3823;
        }

        .group {
          animation: primecartFadeUp 0.35s ease both;
        }

        button,
        a,
        input,
        select {
          -webkit-tap-highlight-color: transparent;
        }

        ::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }

        ::-webkit-scrollbar-track {
          background: #f8f4ec;
        }

        ::-webkit-scrollbar-thumb {
          background: #d7c7a8;
          border-radius: 999px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #b9975b;
        }
      `}</style>
    </div>
  );
}
