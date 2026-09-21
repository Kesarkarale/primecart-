"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  GitCompare,
  Heart,
  ImageOff,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number | string | null;
  original_price: number | string | null;
  stock: number | null;
  image_url: string | null;
  brand: string | null;
  rating: number | string | null;
  reviews_count: number | null;
  is_featured: boolean | null;
  is_flash_sale: boolean | null;
  is_active: boolean | null;
};

type CartItem = Product & {
  quantity: number;
};

const CART_KEY = "primecart-cart";
const WISHLIST_KEY = "primecart-wishlist";
const RECENT_KEY = "primecart-recently-viewed";

function formatPrice(value: number | string | null) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function getImageUrl(value: string | null) {
  if (!value) return null;

  const image = value.trim();

  if (!image) return null;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/")
  ) {
    return image;
  }

  return `/${image}`;
}

function getDiscount(price: number, original: number) {
  if (!original || original <= price) return 0;

  return Math.round(((original - price) / original) * 100);
}

function getCategoryName(
  product: Product,
  categories: Category[]
) {
  return (
    categories.find(
      (category) => category.id === product.category_id
    )?.name ?? "Products"
  );
}

export default function ProductsPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [sort, setSort] = useState("featured");

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);

  const [ratingFilter, setRatingFilter] = useState(0);
  const [discountFilter, setDiscountFilter] = useState(0);
  const [stockOnly, setStockOnly] = useState(false);

  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    []
  );

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const [cartCount, setCartCount] = useState(0);

  const [mobileFilters, setMobileFilters] = useState(false);

  const [quickView, setQuickView] =
    useState<Product | null>(null);

  const [toast, setToast] = useState("");

  const [addingProductId, setAddingProductId] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | LOAD PRODUCTS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const [productResult, categoryResult] =
          await Promise.all([
            supabase
              .from("products")
              .select(
                `
                id,
                category_id,
                name,
                slug,
                short_description,
                description,
                price,
                original_price,
                stock,
                image_url,
                brand,
                rating,
                reviews_count,
                is_featured,
                is_flash_sale,
                is_active
              `
              )
              .eq("is_active", true)
              .order("created_at", {
                ascending: false,
              }),

            supabase
              .from("categories")
              .select("id,name,slug")
              .order("name"),
          ]);

        if (productResult.error) {
          throw productResult.error;
        }

        if (categoryResult.error) {
          throw categoryResult.error;
        }

        setProducts(productResult.data ?? []);
        setCategories(categoryResult.data ?? []);

        loadLocalData();
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOCAL DATA
  |--------------------------------------------------------------------------
  */

  function loadLocalData() {
    try {
      const wishlist = localStorage.getItem(WISHLIST_KEY);

      if (wishlist) {
        const parsed = JSON.parse(wishlist);

        if (Array.isArray(parsed)) {
          setWishlistIds(parsed);
        }
      }

      const recent = localStorage.getItem(RECENT_KEY);

      if (recent) {
        const parsed = JSON.parse(recent);

        if (Array.isArray(parsed)) {
          setRecentIds(parsed);
        }
      }

      updateCartCount();
    } catch {
      // Ignore invalid localStorage.
    }
  }

  function updateCartCount() {
    try {
      const stored = localStorage.getItem(CART_KEY);

      if (!stored) {
        setCartCount(0);
        return;
      }

      const cart = JSON.parse(stored);

      if (!Array.isArray(cart)) {
        setCartCount(0);
        return;
      }

      const count = cart.reduce(
        (total: number, item: CartItem) =>
          total + Number(item.quantity ?? 1),
        0
      );

      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | TOAST
  |--------------------------------------------------------------------------
  */

  function showToast(message: string) {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2500);
  }

  /*
  |--------------------------------------------------------------------------
  | CART
  |--------------------------------------------------------------------------
  */

  function addToCart(product: Product) {
    const stock = Number(product.stock ?? 0);

    if (stock <= 0) {
      showToast("This product is out of stock.");
      return;
    }

    setAddingProductId(product.id);

    try {
      const stored = localStorage.getItem(CART_KEY);

      let cart: CartItem[] = [];

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          cart = parsed;
        }
      }

      const index = cart.findIndex(
        (item) => item.id === product.id
      );

      if (index >= 0) {
        cart[index] = {
          ...cart[index],
          quantity: Math.min(
            cart[index].quantity + 1,
            stock
          ),
        };
      } else {
        cart.push({
          ...product,
          quantity: 1,
        });
      }

      localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
      );

      updateCartCount();

      showToast(`${product.name} added to cart.`);
    } catch {
      showToast("Unable to add product.");
    }

    window.setTimeout(() => {
      setAddingProductId(null);
    }, 500);
  }

  /*
  |--------------------------------------------------------------------------
  | WISHLIST
  |--------------------------------------------------------------------------
  */

  async function toggleWishlist(productId: string) {
    const exists = wishlistIds.includes(productId);

    const next = exists
      ? wishlistIds.filter((id) => id !== productId)
      : [...wishlistIds, productId];

    setWishlistIds(next);

    localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(next)
    );

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast(
          exists
            ? "Removed from wishlist."
            : "Added to wishlist."
        );
        return;
      }

      if (exists) {
        await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
      } else {
        await supabase.from("wishlist").insert({
          user_id: user.id,
          product_id: productId,
        });
      }

      showToast(
        exists
          ? "Removed from wishlist."
          : "Added to wishlist."
      );
    } catch {
      showToast(
        exists
          ? "Removed from wishlist."
          : "Added to wishlist."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RECENTLY VIEWED
  |--------------------------------------------------------------------------
  */

  function saveRecentlyViewed(productId: string) {
    const next = [
      productId,
      ...recentIds.filter((id) => id !== productId),
    ].slice(0, 8);

    setRecentIds(next);

    localStorage.setItem(
      RECENT_KEY,
      JSON.stringify(next)
    );
  }

  /*
  |--------------------------------------------------------------------------
  | COMPARE
  |--------------------------------------------------------------------------
  */

  function toggleCompare(productId: string) {
    if (compareIds.includes(productId)) {
      setCompareIds(
        compareIds.filter((id) => id !== productId)
      );

      showToast("Removed from comparison.");
      return;
    }

    if (compareIds.length >= 3) {
      showToast("You can compare up to 3 products.");
      return;
    }

    setCompareIds([...compareIds, productId]);
    showToast("Added to comparison.");
  }

  /*
  |--------------------------------------------------------------------------
  | BRANDS
  |--------------------------------------------------------------------------
  */

  const brands = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((product) => product.brand)
          .filter(
            (brand): brand is string =>
              Boolean(brand)
          )
      )
    ).sort();
  }, [products]);

  /*
  |--------------------------------------------------------------------------
  | FILTERED PRODUCTS
  |--------------------------------------------------------------------------
  */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((product) => {
        return (
          product.name.toLowerCase().includes(query) ||
          product.brand
            ?.toLowerCase()
            .includes(query) ||
          product.short_description
            ?.toLowerCase()
            .includes(query) ||
          product.description
            ?.toLowerCase()
            .includes(query)
        );
      });
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        (product) =>
          product.category_id === selectedCategory
      );
    }

    result = result.filter((product) => {
      const price = Number(product.price ?? 0);

      return price >= minPrice && price <= maxPrice;
    });

    if (ratingFilter > 0) {
      result = result.filter(
        (product) =>
          Number(product.rating ?? 0) >= ratingFilter
      );
    }

    if (discountFilter > 0) {
      result = result.filter((product) => {
        const discount = getDiscount(
          Number(product.price ?? 0),
          Number(product.original_price ?? 0)
        );

        return discount >= discountFilter;
      });
    }

    if (stockOnly) {
      result = result.filter(
        (product) => Number(product.stock ?? 0) > 0
      );
    }

    if (selectedBrands.length > 0) {
      result = result.filter(
        (product) =>
          product.brand &&
          selectedBrands.includes(product.brand)
      );
    }

    switch (sort) {
      case "price-low":
        result.sort(
          (a, b) =>
            Number(a.price ?? 0) -
            Number(b.price ?? 0)
        );
        break;

      case "price-high":
        result.sort(
          (a, b) =>
            Number(b.price ?? 0) -
            Number(a.price ?? 0)
        );
        break;

      case "rating":
        result.sort(
          (a, b) =>
            Number(b.rating ?? 0) -
            Number(a.rating ?? 0)
        );
        break;

      case "discount":
        result.sort(
          (a, b) =>
            getDiscount(
              Number(b.price ?? 0),
              Number(b.original_price ?? 0)
            ) -
            getDiscount(
              Number(a.price ?? 0),
              Number(a.original_price ?? 0)
            )
        );
        break;

      default:
        result.sort(
          (a, b) =>
            Number(Boolean(b.is_featured)) -
            Number(Boolean(a.is_featured))
        );
    }

    return result;
  }, [
    products,
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

  /*
  |--------------------------------------------------------------------------
  | FLASH PRODUCTS
  |--------------------------------------------------------------------------
  */

  const flashProducts = useMemo(
    () =>
      products
        .filter(
          (product) =>
            product.is_flash_sale &&
            Number(product.stock ?? 0) > 0
        )
        .slice(0, 4),
    [products]
  );

  /*
  |--------------------------------------------------------------------------
  | RECENT PRODUCTS
  |--------------------------------------------------------------------------
  */

  const recentProducts = useMemo(() => {
    return recentIds
      .map((id) =>
        products.find((product) => product.id === id)
      )
      .filter(
        (product): product is Product =>
          Boolean(product)
      )
      .slice(0, 4);
  }, [recentIds, products]);

  /*
  |--------------------------------------------------------------------------
  | RECOMMENDED
  |--------------------------------------------------------------------------
  */

  const recommendedProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          product.is_featured &&
          !recentIds.includes(product.id)
      )
      .slice(0, 4);
  }, [products, recentIds]);

  /*
  |--------------------------------------------------------------------------
  | CLEAR FILTERS
  |--------------------------------------------------------------------------
  */

  function clearFilters() {
    setSearch("");
    setSelectedCategory("all");
    setMinPrice(0);
    setMaxPrice(100000);
    setRatingFilter(0);
    setDiscountFilter(0);
    setStockOnly(false);
    setSelectedBrands([]);
  }

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (minPrice > 0 ? 1 : 0) +
    (maxPrice < 100000 ? 1 : 0) +
    (ratingFilter > 0 ? 1 : 0) +
    (discountFilter > 0 ? 1 : 0) +
    (stockOnly ? 1 : 0) +
    selectedBrands.length;

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#17130d]">
      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[100] w-[calc(100%-30px)] max-w-md -translate-x-1/2">
          <div className="animate-[toastIn_.3s_ease-out] rounded-2xl border border-[#eadfc9] bg-white p-3 shadow-[0_20px_70px_rgba(40,30,10,.18)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b9975b] text-white">
                <Check size={18} />
              </div>

              <p className="flex-1 text-sm font-bold">
                {toast}
              </p>

              <button
                onClick={() => setToast("")}
                className="text-gray-400"
              >
                <X size={17} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-[#eadfc9] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-4 px-5 sm:px-8 lg:px-10">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b9975b] font-black text-white shadow-lg">
              P
            </div>

            <div className="hidden sm:block">
              <div className="text-xl font-black">
                Prime
                <span className="text-[#b08a00]">
                  Cart
                </span>
              </div>

              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#968d80]">
                Shop Smarter
              </p>
            </div>
          </Link>

          <div className="mx-auto hidden max-w-2xl flex-1 md:block">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9185]"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search products, brands and more..."
                className="h-11 w-full rounded-xl border border-[#eadfc9] bg-[#faf8f3] pl-11 pr-10 text-sm outline-none transition focus:border-[#b9975b] focus:bg-white"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard/wishlist"
              className="hidden h-11 w-11 items-center justify-center rounded-xl border border-[#eadfc9] bg-white text-[#625b50] hover:text-red-500 sm:flex"
            >
              <Heart size={18} />
            </Link>

            <Link
              href="/dashboard/orders"
              className="hidden rounded-xl border border-[#eadfc9] px-4 py-2.5 text-sm font-bold lg:block"
            >
              My Orders
            </Link>

            <Link
              href="/dashboard/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#eadfc9]"
            >
              <ShoppingCart size={18} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b9975b] px-1 text-[9px] font-black text-white">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard"
              className="flex h-11 items-center gap-2 rounded-xl bg-[#17130d] px-4 text-sm font-bold text-white hover:bg-[#b9975b]"
            >
              <ArrowLeft size={15} />

              <span className="hidden sm:inline">
                Dashboard
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
        {/* BREADCRUMB */}

        <div className="mb-6 flex items-center gap-2 text-sm text-[#8d8477]">
          <Link href="/dashboard">
            Dashboard
          </Link>

          <span>/</span>

          <span className="font-bold text-[#17130d]">
            Products
          </span>
        </div>

        {/* HERO */}

        <section className="relative mb-8 overflow-hidden rounded-[30px] border border-[#eadfc9] bg-white shadow-[0_15px_50px_rgba(60,45,20,.05)]">
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#b9975b]/10 blur-3xl" />

          <div className="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#eadfc9] bg-[#fffaf0] px-4 py-2 text-[11px] font-black uppercase tracking-[.16em] text-[#967400]">
                <Sparkles size={14} />
                PrimeCart Collection
              </div>

              <h1 className="max-w-3xl text-4xl font-black tracking-[-.04em] sm:text-5xl lg:text-6xl">
                Find what you{" "}
                <span className="text-[#b08a00]">
                  love.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756b5c] sm:text-base">
                Explore premium products, exclusive
                deals and everyday essentials curated
                for smarter shopping.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="rounded-xl bg-[#17130d] px-4 py-3 text-xs font-bold text-white">
                  {products.length} Products
                </div>

                <div className="rounded-xl border border-[#eadfc9] bg-[#faf8f3] px-4 py-3 text-xs font-bold">
                  {categories.length} Categories
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#eadfc9] bg-[#faf8f3] p-5">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#9a9184]">
                  Flash Deals
                </p>

                <p className="mt-1 text-3xl font-black">
                  {flashProducts.length}
                </p>
              </div>

              <div className="rounded-2xl border border-[#eadfc9] bg-[#faf8f3] p-5">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#9a9184]">
                  Brands
                </p>

                <p className="mt-1 text-3xl font-black">
                  {brands.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MOBILE SEARCH */}

        <div className="mb-5 md:hidden">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9185]"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search products..."
              className="h-12 w-full rounded-xl border border-[#eadfc9] bg-white pl-11 pr-10 text-sm outline-none"
            />
          </div>
        </div>

        {/* FLASH DEALS */}

        {!loading &&
          flashProducts.length > 0 &&
          !search && (
            <section className="mb-9">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-[#967400]">
                    <Zap
                      size={15}
                      fill="currentColor"
                    />
                    Limited Time
                  </div>

                  <h2 className="mt-1 text-2xl font-black">
                    Flash Deals
                  </h2>
                </div>

                <span className="hidden text-xs text-[#8d8477] sm:block">
                  Limited stock available
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {flashProducts.map((product, index) => (
                  <MiniCard
                    key={product.id}
                    product={product}
                    index={index}
                    onAdd={() => addToCart(product)}
                  />
                ))}
              </div>
            </section>
          )}

        {/* MOBILE FILTER BUTTON */}

        <div className="mb-4 flex items-center justify-between md:hidden">
          <button
            onClick={() => setMobileFilters(true)}
            className="flex items-center gap-2 rounded-xl bg-[#17130d] px-4 py-3 text-sm font-bold text-white"
          >
            <SlidersHorizontal size={16} />
            Filters

            {activeFilterCount > 0 && (
              <span className="rounded-full bg-[#b9975b] px-2 py-0.5 text-[10px]">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value)
              }
              className="h-11 appearance-none rounded-xl border border-[#eadfc9] bg-white pl-4 pr-9 text-sm font-bold"
            >
              <option value="featured">
                Featured
              </option>

              <option value="rating">
                Top Rated
              </option>

              <option value="discount">
                Biggest Discount
              </option>

              <option value="price-low">
                Price Low
              </option>

              <option value="price-high">
                Price High
              </option>
            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            />
          </div>
        </div>

        {/* MAIN SHOP AREA */}

        <div className="grid gap-7 lg:grid-cols-[260px_1fr]">
          {/* DESKTOP FILTER */}

          <aside className="hidden lg:block">
            <FilterPanel
              categories={categories}
              brands={brands}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              ratingFilter={ratingFilter}
              setRatingFilter={setRatingFilter}
              discountFilter={discountFilter}
              setDiscountFilter={setDiscountFilter}
              stockOnly={stockOnly}
              setStockOnly={setStockOnly}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              activeFilterCount={activeFilterCount}
              clearFilters={clearFilters}
              sort={sort}
              setSort={setSort}
            />
          </aside>

          {/* PRODUCTS */}

          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8d8477]">
                  Showing{" "}
                  <span className="font-black text-[#17130d]">
                    {filteredProducts.length}
                  </span>{" "}
                  products
                </p>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs font-bold text-[#927000]"
                  >
                    Clear filters
                    <X size={13} />
                  </button>
                )}

                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) =>
                      setSort(e.target.value)
                    }
                    className="h-11 appearance-none rounded-xl border border-[#eadfc9] bg-white pl-4 pr-10 text-sm font-bold outline-none"
                  >
                    <option value="featured">
                      Recommended
                    </option>

                    <option value="rating">
                      Top Rated
                    </option>

                    <option value="discount">
                      Biggest Discount
                    </option>

                    <option value="price-low">
                      Price: Low to High
                    </option>

                    <option value="price-high">
                      Price: High to Low
                    </option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>
              </div>
            </div>

            {loading && (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 9 }).map(
                  (_, index) => (
                    <Skeleton key={index} />
                  )
                )}
              </div>
            )}

            {!loading && error && (
              <div className="rounded-[28px] border border-red-100 bg-white px-6 py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <X size={28} />
                </div>

                <h2 className="mt-5 text-2xl font-black">
                  Unable to load products
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  {error}
                </p>

                <button
                  onClick={() =>
                    window.location.reload()
                  }
                  className="mt-6 rounded-xl bg-[#17130d] px-6 py-3 text-sm font-bold text-white"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading &&
              !error &&
              filteredProducts.length === 0 && (
                <div className="rounded-[28px] border border-[#eadfc9] bg-white px-6 py-20 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff8e5] text-[#a17b00]">
                    <Search size={28} />
                  </div>

                  <h2 className="mt-5 text-2xl font-black">
                    No products found
                  </h2>

                  <p className="mt-2 text-sm text-[#756b5c]">
                    Try changing your search or filters.
                  </p>

                  <button
                    onClick={clearFilters}
                    className="mt-6 rounded-xl bg-[#17130d] px-6 py-3 text-sm font-bold text-white"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

            {!loading &&
              !error &&
              filteredProducts.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map(
                    (product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        categoryName={getCategoryName(
                          product,
                          categories
                        )}
                        index={index}
                        isWishlisted={wishlistIds.includes(
                          product.id
                        )}
                        isCompared={compareIds.includes(
                          product.id
                        )}
                        isAdding={
                          addingProductId === product.id
                        }
                        onWishlist={() =>
                          toggleWishlist(product.id)
                        }
                        onCompare={() =>
                          toggleCompare(product.id)
                        }
                        onQuickView={() => {
                          setQuickView(product);
                          saveRecentlyViewed(
                            product.id
                          );
                        }}
                        onAdd={() =>
                          addToCart(product)
                        }
                      />
                    )
                  )}
                </div>
              )}
          </section>
        </div>

        {/* COMPARE BAR */}

        {compareIds.length > 0 && (
          <CompareBar
            products={products}
            compareIds={compareIds}
            categories={categories}
            onRemove={(id) =>
              setCompareIds(
                compareIds.filter(
                  (item) => item !== id
                )
              )
            }
            onClear={() => setCompareIds([])}
          />
        )}

        {/* RECOMMENDED */}

        {!loading &&
          recommendedProducts.length > 0 && (
            <ProductRow
              title="Recommended For You"
              subtitle="Products you may love"
              products={recommendedProducts}
              categories={categories}
              wishlistIds={wishlistIds}
              onWishlist={toggleWishlist}
              onAdd={addToCart}
              onQuickView={(product) =>
                setQuickView(product)
              }
            />
          )}

        {/* RECENTLY VIEWED */}

        {!loading &&
          recentProducts.length > 0 && (
            <ProductRow
              title="Recently Viewed"
              subtitle="Pick up where you left off"
              products={recentProducts}
              categories={categories}
              wishlistIds={wishlistIds}
              onWishlist={toggleWishlist}
              onAdd={addToCart}
              onQuickView={(product) =>
                setQuickView(product)
              }
            />
          )}

        {/* TRUST */}

        <section className="mt-14 rounded-[28px] border border-[#eadfc9] bg-white p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <Trust
              icon={<Package size={19} />}
              title="Quality Products"
              text="Carefully selected products"
            />

            <Trust
              icon={<ShoppingBag size={19} />}
              title="Easy Shopping"
              text="Simple and secure experience"
            />

            <Trust
              icon={<Check size={19} />}
              title="Trusted Experience"
              text="Built for smarter shopping"
            />
          </div>
        </section>
      </div>

      {/* MOBILE FILTER DRAWER */}

      {mobileFilters && (
        <div className="fixed inset-0 z-[90] md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFilters(false)}
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">
                  Filters
                </h2>

                <p className="text-xs text-gray-500">
                  Refine your products
                </p>
              </div>

              <button
                onClick={() =>
                  setMobileFilters(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6f2e9]"
              >
                <X size={18} />
              </button>
            </div>

            <FilterPanel
              categories={categories}
              brands={brands}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              ratingFilter={ratingFilter}
              setRatingFilter={setRatingFilter}
              discountFilter={discountFilter}
              setDiscountFilter={setDiscountFilter}
              stockOnly={stockOnly}
              setStockOnly={setStockOnly}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              activeFilterCount={activeFilterCount}
              clearFilters={clearFilters}
              sort={sort}
              setSort={setSort}
            />

            <button
              onClick={() =>
                setMobileFilters(false)
              }
              className="mt-5 w-full rounded-xl bg-[#17130d] py-3.5 text-sm font-black text-white"
            >
              Show Products
            </button>
          </div>
        </div>
      )}

      {/* QUICK VIEW */}

      {quickView && (
        <QuickView
          product={quickView}
          categoryName={getCategoryName(
            quickView,
            categories
          )}
          isWishlisted={wishlistIds.includes(
            quickView.id
          )}
          onClose={() => setQuickView(null)}
          onWishlist={() =>
            toggleWishlist(quickView.id)
          }
          onAdd={() => addToCart(quickView)}
          onOpen={() => {
            saveRecentlyViewed(quickView.id);
            window.location.href = `/dashboard/products/${quickView.id}`;
          }}
        />
      )}

      <style jsx>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translate(-50%, 15px) scale(.97);
          }

          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -500px 0;
          }

          100% {
            background-position: 500px 0;
          }
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            #f0ece3 25%,
            #faf8f3 50%,
            #f0ece3 75%
          );

          background-size: 500px 100%;
          animation: shimmer 1.4s infinite linear;
        }
      `}</style>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| FILTER PANEL
|--------------------------------------------------------------------------
*/

function FilterPanel({
  categories,
  brands,
  selectedCategory,
  setSelectedCategory,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  ratingFilter,
  setRatingFilter,
  discountFilter,
  setDiscountFilter,
  stockOnly,
  setStockOnly,
  selectedBrands,
  setSelectedBrands,
  activeFilterCount,
  clearFilters,
  sort,
  setSort,
}: {
  categories: Category[];
  brands: string[];
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  minPrice: number;
  maxPrice: number;
  setMinPrice: (value: number) => void;
  setMaxPrice: (value: number) => void;
  ratingFilter: number;
  setRatingFilter: (value: number) => void;
  discountFilter: number;
  setDiscountFilter: (value: number) => void;
  stockOnly: boolean;
  setStockOnly: (value: boolean) => void;
  selectedBrands: string[];
  setSelectedBrands: (value: string[]) => void;
  activeFilterCount: number;
  clearFilters: () => void;
  sort: string;
  setSort: (value: string) => void;
}) {
  function toggleBrand(brand: string) {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(
        selectedBrands.filter(
          (item) => item !== brand
        )
      );
    } else {
      setSelectedBrands([
        ...selectedBrands,
        brand,
      ]);
    }
  }

  return (
    <div className="rounded-[24px] border border-[#eadfc9] bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-black">
            Filters
          </h3>

          {activeFilterCount > 0 && (
            <p className="mt-0.5 text-[11px] text-[#a17b00]">
              {activeFilterCount} active
            </p>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs font-bold text-[#a17b00]"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* CATEGORY */}

        <FilterSection title="Category">
          <div className="space-y-1.5">
            <FilterButton
              active={selectedCategory === "all"}
              onClick={() =>
                setSelectedCategory("all")
              }
            >
              All Products
            </FilterButton>

            {categories.map((category) => (
              <FilterButton
                key={category.id}
                active={
                  selectedCategory === category.id
                }
                onClick={() =>
                  setSelectedCategory(category.id)
                }
              >
                {category.name}
              </FilterButton>
            ))}
          </div>
        </FilterSection>

        {/* PRICE */}

        <FilterSection title="Price">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={(e) =>
                setMinPrice(
                  Math.max(
                    0,
                    Number(e.target.value)
                  )
                )
              }
              placeholder="Min"
              className="h-10 rounded-lg border border-[#eadfc9] px-3 text-xs outline-none focus:border-[#b9975b]"
            />

            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(
                  Math.max(
                    0,
                    Number(e.target.value)
                  )
                )
              }
              placeholder="Max"
              className="h-10 rounded-lg border border-[#eadfc9] px-3 text-xs outline-none focus:border-[#b9975b]"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {[500, 1000, 2500, 5000].map(
              (price) => (
                <button
                  key={price}
                  onClick={() =>
                    setMaxPrice(price)
                  }
                  className="rounded-lg bg-[#faf8f3] px-2.5 py-1.5 text-[10px] font-bold hover:bg-[#fff3cd]"
                >
                  Under ₹{price.toLocaleString("en-IN")}
                </button>
              )
            )}
          </div>
        </FilterSection>

        {/* RATING */}

        <FilterSection title="Customer Rating">
          {[4, 3, 2].map((rating) => (
            <button
              key={rating}
              onClick={() =>
                setRatingFilter(
                  ratingFilter === rating
                    ? 0
                    : rating
                )
              }
              className={`mb-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs ${
                ratingFilter === rating
                  ? "bg-[#fff5d4] text-[#8c6c00]"
                  : "hover:bg-[#faf8f3]"
              }`}
            >
              <Star
                size={13}
                fill="currentColor"
                className="text-[#b9975b]"
              />

              <span className="font-bold">
                {rating}+ & above
              </span>
            </button>
          ))}
        </FilterSection>

        {/* DISCOUNT */}

        <FilterSection title="Discount">
          {[10, 20, 30, 50].map((discount) => (
            <button
              key={discount}
              onClick={() =>
                setDiscountFilter(
                  discountFilter === discount
                    ? 0
                    : discount
                )
              }
              className={`mb-2 flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs ${
                discountFilter === discount
                  ? "bg-[#fff5d4] text-[#8c6c00]"
                  : "hover:bg-[#faf8f3]"
              }`}
            >
              <span className="font-bold">
                {discount}% or more
              </span>

              <span>›</span>
            </button>
          ))}
        </FilterSection>

        {/* BRANDS */}

        {brands.length > 0 && (
          <FilterSection title="Brand">
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {brands.map((brand) => (
                <label
                  key={brand}
                  className="flex cursor-pointer items-center gap-2 text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(
                      brand
                    )}
                    onChange={() =>
                      toggleBrand(brand)
                    }
                    className="h-4 w-4 accent-[#b9975b]"
                  />

                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* AVAILABILITY */}

        <FilterSection title="Availability">
          <label className="flex cursor-pointer items-center justify-between rounded-lg bg-[#faf8f3] px-3 py-3">
            <span className="text-xs font-bold">
              In Stock Only
            </span>

            <input
              type="checkbox"
              checked={stockOnly}
              onChange={(e) =>
                setStockOnly(e.target.checked)
              }
              className="h-4 w-4 accent-[#b9975b]"
            />
          </label>
        </FilterSection>

        {/* SORT */}

        <FilterSection title="Sort By">
          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
            className="h-10 w-full rounded-lg border border-[#eadfc9] bg-white px-3 text-xs font-bold outline-none"
          >
            <option value="featured">
              Recommended
            </option>

            <option value="rating">
              Top Rated
            </option>

            <option value="discount">
              Biggest Discount
            </option>

            <option value="price-low">
              Price Low to High
            </option>

            <option value="price-high">
              Price High to Low
            </option>
          </select>
        </FilterSection>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| FILTER HELPERS
|--------------------------------------------------------------------------
*/

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#eee7da] pb-5 last:border-0 last:pb-0">
      <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-[#625b50]">
        {title}
      </h4>

      {children}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-bold transition ${
        active
          ? "bg-[#fff5d4] text-[#8c6c00]"
          : "text-[#625b50] hover:bg-[#faf8f3]"
      }`}
    >
      {children}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| PRODUCT CARD
|--------------------------------------------------------------------------
*/

function ProductCard({
  product,
  categoryName,
  index,
  isWishlisted,
  isCompared,
  isAdding,
  onWishlist,
  onCompare,
  onQuickView,
  onAdd,
}: {
  product: Product;
  categoryName: string;
  index: number;
  isWishlisted: boolean;
  isCompared: boolean;
  isAdding: boolean;
  onWishlist: () => void;
  onCompare: () => void;
  onQuickView: () => void;
  onAdd: () => void;
}) {
  const [imageError, setImageError] =
    useState(false);

  const image = getImageUrl(product.image_url);

  const price = Number(product.price ?? 0);
  const original = Number(
    product.original_price ?? 0
  );

  const stock = Number(product.stock ?? 0);

  const rating = Number(product.rating ?? 0);

  const reviews = Number(
    product.reviews_count ?? 0
  );

  const discount = getDiscount(
    price,
    original
  );

  return (
    <article
      className="group overflow-hidden rounded-[25px] border border-[#eadfc9] bg-white shadow-[0_7px_28px_rgba(60,45,20,.035)] transition duration-500 hover:-translate-y-2 hover:border-[#d7c08b] hover:shadow-[0_25px_60px_rgba(60,45,20,.13)]"
      style={{
        animation: `cardIn .5s ease-out ${Math.min(
          index * 45,
          450
        )}ms both`,
      }}
    >
      {/* IMAGE */}

      <div className="relative aspect-square overflow-hidden bg-[#f5f2eb]">
        {image && !imageError ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width:640px) 100vw,(max-width:1280px) 33vw,25vw"
            className="object-cover transition duration-700 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <ImageOff size={32} />

            <span className="mt-2 text-xs">
              Image unavailable
            </span>
          </div>
        )}

        {/* TOP BADGES */}

        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {product.is_flash_sale && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#17130d] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white">
              <Zap
                size={10}
                fill="currentColor"
              />
              Flash Sale
            </span>
          )}

          {product.is_featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#b9975b] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white">
              <Sparkles size={10} />
              Featured
            </span>
          )}
        </div>

        {discount > 0 && (
          <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black text-[#8c6c00] shadow">
            {discount}% OFF
          </span>
        )}

        {/* WISHLIST */}

        <button
          onClick={onWishlist}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur transition hover:scale-110 ${
            isWishlisted
              ? "border-red-100 bg-red-50 text-red-500"
              : "border-white/80 bg-white/90 text-[#625b50] hover:text-red-500"
          }`}
        >
          <Heart
            size={18}
            fill={
              isWishlisted
                ? "currentColor"
                : "none"
            }
          />
        </button>

        {/* HOVER ACTIONS */}

        <div className="absolute bottom-4 left-4 right-4 hidden gap-2 translate-y-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:flex">
          <button
            onClick={onQuickView}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-white/95 text-xs font-black shadow-lg backdrop-blur"
          >
            Quick View
          </button>

          <button
            onClick={onAdd}
            disabled={stock <= 0 || isAdding}
            className="flex h-10 w-11 items-center justify-center rounded-xl bg-[#17130d] text-white shadow-lg hover:bg-[#b9975b]"
          >
            {isAdding ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <ShoppingCart size={16} />
            )}
          </button>
        </div>
      </div>

      {/* CONTENT */}

      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate rounded-full bg-[#faf6e8] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#967400]">
            {categoryName}
          </span>

          {product.brand && (
            <span className="truncate text-[9px] font-black uppercase tracking-wider text-gray-400">
              {product.brand}
            </span>
          )}
        </div>

        <Link
          href={`/dashboard/products/${product.id}`}
          className="line-clamp-2 text-[17px] font-black leading-6 hover:text-[#a17b00]"
        >
          {product.name}
        </Link>

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#756b5c]">
          {product.short_description ||
            "Premium quality product from PrimeCart."}
        </p>

        {/* RATING */}

        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#fff5d4] px-2 py-1 text-xs font-black text-[#846400]">
            <Star
              size={11}
              fill="currentColor"
            />

            {rating.toFixed(1)}
          </span>

          <span className="text-[11px] text-gray-400">
            {reviews} reviews
          </span>
        </div>

        {/* PRICE */}

        <div className="mt-4 flex items-end gap-2">
          <span className="text-xl font-black">
            {formatPrice(price)}
          </span>

          {original > price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(original)}
            </span>
          )}
        </div>

        {discount > 0 && (
          <p className="mt-1 text-[10px] font-bold text-[#a17b00]">
            Save {formatPrice(original - price)}
          </p>
        )}

        {/* STOCK */}

        <div className="mt-3 flex items-center justify-between">
          <span
            className={`text-[11px] font-bold ${
              stock <= 0
                ? "text-red-500"
                : stock <= 5
                  ? "text-orange-600"
                  : "text-emerald-600"
            }`}
          >
            {stock <= 0
              ? "Out of stock"
              : stock <= 5
                ? `Only ${stock} left`
                : "In stock"}
          </span>

          <button
            onClick={onCompare}
            className={`flex items-center gap-1 text-[10px] font-bold ${
              isCompared
                ? "text-[#a17b00]"
                : "text-gray-400 hover:text-[#a17b00]"
            }`}
          >
            <GitCompare size={13} />
            {isCompared
              ? "Compared"
              : "Compare"}
          </button>
        </div>

        {/* ACTIONS */}

        <div className="mt-4 grid grid-cols-[1fr_45px] gap-2">
          <Link
            href={`/dashboard/products/${product.id}`}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#eadfc9] text-xs font-black transition hover:border-[#b9975b] hover:bg-[#fffaf0]"
          >
            View Product
            <ArrowRight size={14} />
          </Link>

          <button
            onClick={onAdd}
            disabled={stock <= 0 || isAdding}
            className={`flex h-11 items-center justify-center rounded-xl ${
              stock <= 0
                ? "bg-[#eeeae2] text-gray-400"
                : "bg-[#17130d] text-white hover:bg-[#b9975b]"
            }`}
          >
            {isAdding ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <ShoppingBag size={17} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| MINI CARD
|--------------------------------------------------------------------------
*/

function MiniCard({
  product,
  index,
  onAdd,
}: {
  product: Product;
  index: number;
  onAdd: () => void;
}) {
  const [imageError, setImageError] =
    useState(false);

  const image = getImageUrl(product.image_url);

  const price = Number(product.price ?? 0);

  const original = Number(
    product.original_price ?? 0
  );

  const discount = getDiscount(
    price,
    original
  );

  return (
    <div
      className="group rounded-2xl border border-[#eadfc9] bg-white p-3 transition hover:-translate-y-1 hover:shadow-xl"
      style={{
        animation: `cardIn .5s ease-out ${index * 70}ms both`,
      }}
    >
      <div className="flex gap-4">
        <Link
          href={`/dashboard/products/${product.id}`}
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f5f2eb]"
        >
          {image && !imageError ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="96px"
              className="object-cover transition duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageOff size={20} />
            </div>
          )}

          {discount > 0 && (
            <span className="absolute left-1.5 top-1.5 rounded-md bg-[#17130d] px-1.5 py-1 text-[8px] font-black text-white">
              -{discount}%
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/dashboard/products/${product.id}`}
            className="line-clamp-2 text-sm font-black"
          >
            {product.name}
          </Link>

          <div className="mt-2 flex items-center gap-1 text-xs">
            <Star
              size={12}
              fill="currentColor"
              className="text-[#b9975b]"
            />

            {Number(product.rating ?? 0).toFixed(1)}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-black">
              {formatPrice(price)}
            </span>

            {original > price && (
              <span className="text-[10px] text-gray-400 line-through">
                {formatPrice(original)}
              </span>
            )}
          </div>

          <button
            onClick={onAdd}
            className="mt-2 text-[10px] font-black text-[#927000]"
          >
            + Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PRODUCT ROW
|--------------------------------------------------------------------------
*/

function ProductRow({
  title,
  subtitle,
  products,
  categories,
  wishlistIds,
  onWishlist,
  onAdd,
  onQuickView,
}: {
  title: string;
  subtitle: string;
  products: Product[];
  categories: Category[];
  wishlistIds: string[];
  onWishlist: (id: string) => void;
  onAdd: (product: Product) => void;
  onQuickView: (product: Product) => void;
}) {
  return (
    <section className="mt-14">
      <div className="mb-5">
        <h2 className="text-2xl font-black">
          {title}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {subtitle}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            categoryName={getCategoryName(
              product,
              categories
            )}
            index={index}
            isWishlisted={wishlistIds.includes(
              product.id
            )}
            isCompared={false}
            isAdding={false}
            onWishlist={() =>
              onWishlist(product.id)
            }
            onCompare={() => {}}
            onQuickView={() =>
              onQuickView(product)
            }
            onAdd={() => onAdd(product)}
          />
        ))}
      </div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| QUICK VIEW
|--------------------------------------------------------------------------
*/

function QuickView({
  product,
  categoryName,
  isWishlisted,
  onClose,
  onWishlist,
  onAdd,
  onOpen,
}: {
  product: Product;
  categoryName: string;
  isWishlisted: boolean;
  onClose: () => void;
  onWishlist: () => void;
  onAdd: () => void;
  onOpen: () => void;
}) {
  const [imageError, setImageError] =
    useState(false);

  const image = getImageUrl(product.image_url);

  const price = Number(product.price ?? 0);

  const original = Number(
    product.original_price ?? 0
  );

  const stock = Number(product.stock ?? 0);

  const rating = Number(product.rating ?? 0);

  const discount = getDiscount(
    price,
    original
  );

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg"
        >
          <X size={18} />
        </button>

        <div className="grid md:grid-cols-2">
          {/* IMAGE */}

          <div className="relative min-h-[360px] bg-[#f5f2eb] md:min-h-[550px]">
            {image && !imageError ? (
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="50vw"
                className="object-cover"
                onError={() =>
                  setImageError(true)
                }
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <ImageOff size={40} />
              </div>
            )}

            {discount > 0 && (
              <span className="absolute left-5 top-5 rounded-full bg-[#17130d] px-4 py-2 text-xs font-black text-white">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* DETAILS */}

          <div className="flex flex-col p-7 sm:p-9">
            <span className="w-fit rounded-full bg-[#fff5d4] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#8c6c00]">
              {categoryName}
            </span>

            <h2 className="mt-4 text-3xl font-black tracking-tight">
              {product.name}
            </h2>

            {product.brand && (
              <p className="mt-2 text-xs font-black uppercase tracking-wider text-gray-400">
                {product.brand}
              </p>
            )}

            <div className="mt-5 flex items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#fff5d4] px-3 py-2 text-sm font-black text-[#846400]">
                <Star
                  size={14}
                  fill="currentColor"
                />
                {rating.toFixed(1)}
              </span>

              <span className="text-xs text-gray-500">
                {product.reviews_count ?? 0} reviews
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-[#756b5c]">
              {product.description ||
                product.short_description ||
                "Premium product available at PrimeCart."}
            </p>

            <div className="mt-7 flex items-end gap-3">
              <span className="text-3xl font-black">
                {formatPrice(price)}
              </span>

              {original > price && (
                <span className="pb-1 text-sm text-gray-400 line-through">
                  {formatPrice(original)}
                </span>
              )}
            </div>

            <div className="mt-3">
              {stock > 0 ? (
                <span className="text-sm font-bold text-emerald-600">
                  ● In stock
                  {stock <= 5
                    ? ` • Only ${stock} left`
                    : ""}
                </span>
              ) : (
                <span className="text-sm font-bold text-red-500">
                  ● Out of stock
                </span>
              )}
            </div>

            <div className="mt-auto pt-8">
              <div className="grid gap-3 sm:grid-cols-[1fr_52px]">
                <button
                  onClick={onAdd}
                  disabled={stock <= 0}
                  className={`flex h-13 items-center justify-center gap-2 rounded-xl font-black ${
                    stock <= 0
                      ? "bg-gray-200 text-gray-400"
                      : "bg-[#17130d] text-white hover:bg-[#b9975b]"
                  }`}
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>

                <button
                  onClick={onWishlist}
                  className={`flex h-13 items-center justify-center rounded-xl border ${
                    isWishlisted
                      ? "border-red-100 bg-red-50 text-red-500"
                      : "border-[#eadfc9]"
                  }`}
                >
                  <Heart
                    size={19}
                    fill={
                      isWishlisted
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
              </div>

              <button
                onClick={onOpen}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#eadfc9] text-sm font-black hover:bg-[#fffaf0]"
              >
                View Full Product Details
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| COMPARE BAR
|--------------------------------------------------------------------------
*/

function CompareBar({
  products,
  compareIds,
  categories,
  onRemove,
  onClear,
}: {
  products: Product[];
  compareIds: string[];
  categories: Category[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const selected = compareIds
    .map((id) =>
      products.find(
        (product) => product.id === id
      )
    )
    .filter(
      (product): product is Product =>
        Boolean(product)
    );

  return (
    <div className="sticky bottom-4 z-40 mt-8 rounded-2xl border border-[#d9c69a] bg-white p-4 shadow-[0_20px_60px_rgba(40,30,10,.16)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <GitCompare
            size={18}
            className="text-[#a17b00]"
          />

          <span className="text-sm font-black">
            Compare Products
          </span>
        </div>

        <div className="flex flex-1 gap-2 overflow-x-auto">
          {selected.map((product) => (
            <div
              key={product.id}
              className="flex min-w-[180px] items-center gap-2 rounded-xl bg-[#faf8f3] p-2"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white">
                {getImageUrl(
                  product.image_url
                ) && (
                  <Image
                    src={
                      getImageUrl(
                        product.image_url
                      )!
                    }
                    alt={product.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-black">
                  {product.name}
                </p>

                <p className="text-[10px] text-gray-500">
                  {formatPrice(product.price)}
                </p>
              </div>

              <button
                onClick={() =>
                  onRemove(product.id)
                }
                className="text-gray-400 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClear}
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100"
          >
            Clear
          </button>

          <Link
            href={
              selected.length > 0
                ? `/dashboard/products/${selected[0].id}`
                : "#"
            }
            className="rounded-xl bg-[#17130d] px-5 py-2.5 text-xs font-black text-white hover:bg-[#b9975b]"
          >
            Compare
          </Link>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| TRUST
|--------------------------------------------------------------------------
*/

function Trust({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff7df] text-[#a47e14]">
        {icon}
      </div>

      <div>
        <p className="text-sm font-black">
          {title}
        </p>

        <p className="text-xs text-gray-500">
          {text}
        </p>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SKELETON
|--------------------------------------------------------------------------
*/

function Skeleton() {
  return (
    <div className="overflow-hidden rounded-[25px] border border-[#eadfc9] bg-white">
      <div className="skeleton aspect-square" />

      <div className="space-y-4 p-5">
        <div className="skeleton h-5 w-24 rounded-full" />

        <div className="skeleton h-5 w-4/5 rounded-lg" />

        <div className="skeleton h-4 w-3/5 rounded-lg" />

        <div className="skeleton h-6 w-20 rounded-lg" />

        <div className="skeleton h-7 w-32 rounded-lg" />

        <div className="skeleton h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}
