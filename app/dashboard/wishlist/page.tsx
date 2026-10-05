"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  HeartOff,
  Home,
  LayoutGrid,
  Package,
  Search,
  ShoppingCart,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  image_url: string | null;
  brand: string | null;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_flash_sale: boolean;
};

type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product: Product | null;
};

type Message = {
  type: "success" | "error";
  text: string;
};

export default function WishlistPage() {
  const [supabase] = useState(() => createClient());

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const [message, setMessage] = useState<Message | null>(null);

  /* =========================================================
     WISHLIST SEARCH + MOBILE NAV STATE
  ========================================================= */
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  /*
   * -------------------------------------------------------
   * IMAGE URL
   * -------------------------------------------------------
   */

  const getImageCandidates = useCallback(
    (imageUrl: string | null) => {
      if (!imageUrl?.trim()) {
        return ["/product-placeholder.png"];
      }

      const raw = imageUrl.trim();

      // External image
      if (
        raw.startsWith("http://") ||
        raw.startsWith("https://") ||
        raw.startsWith("data:")
      ) {
        return [raw, "/product-placeholder.png"];
      }

      /*
       * Supabase DB normally stores:
       * smartphone-x-pro.png
       *
       * So primary path becomes:
       * /products/smartphone-x-pro.png
       */

      const clean = raw
        .replace(/^public[\\/]/i, "")
        .replace(/^\/+/, "");

      const filename =
        clean.split("/").pop() || clean;

      return Array.from(
        new Set([
          `/products/${filename}`,
          `/${clean}`,
          `/products/${clean}`,
          `/product-images/${filename}`,
          `/images/products/${filename}`,
          `/images/${filename}`,
          `/assets/products/${filename}`,
          `/assets/images/${filename}`,
          "/product-placeholder.png",
        ])
      );
    },
    []
  );

  /*
   * -------------------------------------------------------
   * SAFE PRODUCT IMAGE
   * -------------------------------------------------------
   */

  function ProductImage({
    src,
    alt,
  }: {
    src: string | null;
    alt: string;
  }) {
    const candidates = getImageCandidates(src);

    const [imageIndex, setImageIndex] = useState(0);

    const currentImage =
      candidates[imageIndex] ||
      "/product-placeholder.png";

    return (
      <img
        src={currentImage}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105"
        onError={() => {
          if (imageIndex < candidates.length - 1) {
            setImageIndex((previous) => previous + 1);
          }
        }}
      />
    );
  }

  /*
   * -------------------------------------------------------
   * FORMAT PRICE
   * -------------------------------------------------------
   */

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);
  }, []);

  /*
   * -------------------------------------------------------
   * DISCOUNT
   * -------------------------------------------------------
   */

  const getDiscount = useCallback(
    (
      price: number,
      originalPrice: number | null
    ) => {
      const currentPrice = Number(price) || 0;
      const mrp = Number(originalPrice) || 0;

      if (!mrp || mrp <= currentPrice) {
        return 0;
      }

      return Math.round(
        ((mrp - currentPrice) / mrp) * 100
      );
    },
    []
  );

  /*
   * -------------------------------------------------------
   * LOAD CURRENT USER WISHLIST
   * -------------------------------------------------------
   *
   * IMPORTANT:
   * There is NO localStorage fallback here.
   *
   * Therefore:
   *
   * Account A -> only Account A wishlist
   * Account B -> only Account B wishlist
   *
   * New account -> empty wishlist
   */

  const loadWishlist = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setMessage(null);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error(
            "Wishlist auth error:",
            authError
          );

          setItems([]);

          setMessage({
            type: "error",
            text: "Unable to verify your account.",
          });

          return;
        }

        /*
         * No logged-in user
         */
        if (!user) {
          setItems([]);

          window.location.href = "/auth/login";
          return;
        }

        /*
         * VERY IMPORTANT:
         * Filter by current logged-in user.
         */
        const { data, error } = await supabase
          .from("wishlist_items")
          .select(`
            id,
            user_id,
            product_id,
            created_at,
            product:products (
              id,
              name,
              slug,
              short_description,
              price,
              original_price,
              stock,
              image_url,
              brand,
              rating,
              reviews_count,
              is_featured,
              is_flash_sale
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          console.error(
            "Wishlist load error:",
            error
          );

          setItems([]);

          setMessage({
            type: "error",
            text: "Unable to load your wishlist.",
          });

          return;
        }

        const formatted: WishlistItem[] = (
          (data || []) as any[]
        )
          .filter(
            (item) =>
              String(item.user_id) ===
              String(user.id)
          )
          .map((item) => ({
            id: String(item.id),
            user_id: String(item.user_id),
            product_id: String(item.product_id),
            created_at: item.created_at,
            product: Array.isArray(item.product)
              ? item.product[0] || null
              : item.product || null,
          }));

        setItems(formatted);
      } catch (error) {
        console.error(
          "Wishlist load error:",
          error
        );

        setItems([]);

        setMessage({
          type: "error",
          text: "Something went wrong while loading wishlist.",
        });
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [supabase]
  );

  /*
   * -------------------------------------------------------
   * INITIAL LOAD + AUTH LISTENER
   * -------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) return;

      await loadWishlist(true);
    };

    initialize();

    /*
     * Dashboard / other pages can trigger this
     */
    const handleWishlistUpdated = () => {
      loadWishlist(false);
    };

    window.addEventListener(
      "wishlist-updated",
      handleWishlistUpdated
    );

    /*
     * If account changes / logout / login,
     * reload correct user's wishlist.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event) => {
        if (
          event === "SIGNED_IN" ||
          event === "SIGNED_OUT" ||
          event === "USER_UPDATED"
        ) {
          loadWishlist(true);
        }
      }
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        "wishlist-updated",
        handleWishlistUpdated
      );

      subscription.unsubscribe();
    };
  }, [loadWishlist, supabase]);

  /*
   * -------------------------------------------------------
   * REMOVE FROM WISHLIST
   * -------------------------------------------------------
   */

  async function removeFromWishlist(
    wishlistId: string,
    productName: string
  ) {
    try {
      setRemovingId(wishlistId);
      setMessage(null);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.href = "/auth/login";
        return;
      }

      /*
       * BOTH id AND user_id are checked.
       *
       * So one user cannot delete another user's
       * wishlist item.
       */
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", wishlistId)
        .eq("user_id", user.id);

      if (error) {
        console.error(
          "Wishlist delete error:",
          error
        );

        setMessage({
          type: "error",
          text: "Failed to remove product from wishlist.",
        });

        return;
      }

      /*
       * Remove immediately from UI
       */
      setItems((current) =>
        current.filter(
          (item) => item.id !== wishlistId
        )
      );

      /*
       * Sync dashboard / other components
       */
      window.dispatchEvent(
        new CustomEvent("wishlist-updated")
      );

      setMessage({
        type: "success",
        text: `${productName} removed from wishlist.`,
      });
    } catch (error) {
      console.error(
        "Remove wishlist error:",
        error
      );

      setMessage({
        type: "error",
        text: "Something went wrong.",
      });
    } finally {
      setRemovingId(null);
    }
  }

  /*
   * -------------------------------------------------------
   * ADD PRODUCT TO CART
   * -------------------------------------------------------
   */

  async function addProductToCart(
    product: Product
  ) {
    if (Number(product.stock) <= 0) {
      setMessage({
        type: "error",
        text: "This product is currently out of stock.",
      });

      return;
    }

    try {
      setAddingId(product.id);
      setMessage(null);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.href = "/auth/login";
        return;
      }

      const maxQuantity = Math.max(
        1,
        Math.min(
          Number(product.stock) || 1,
          10
        )
      );

      /*
       * Check current user's cart only
       */
      const {
        data: existingItem,
        error: existingError,
      } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      /*
       * Already in cart
       */
      if (existingItem) {
        const currentQuantity = Number(
          existingItem.quantity || 0
        );

        const newQuantity = Math.min(
          maxQuantity,
          currentQuantity + 1
        );

        const { error: updateError } =
          await supabase
            .from("cart_items")
            .update({
              quantity: newQuantity,
              updated_at:
                new Date().toISOString(),
            })
            .eq("id", existingItem.id)
            .eq("user_id", user.id);

        if (updateError) {
          throw updateError;
        }

        setMessage({
          type: "success",
          text:
            newQuantity === currentQuantity
              ? `${product.name} is already at the maximum quantity.`
              : `${product.name} quantity updated in cart.`,
        });
      } else {
        /*
         * New cart item
         */
        const { error: insertError } =
          await supabase
            .from("cart_items")
            .insert({
              user_id: user.id,
              product_id: product.id,
              quantity: 1,
            });

        if (insertError) {
          throw insertError;
        }

        setMessage({
          type: "success",
          text: `${product.name} added to cart.`,
        });
      }

      /*
       * Sync dashboard/cart badge
       */
      window.dispatchEvent(
        new CustomEvent("cart-updated")
      );
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      setMessage({
        type: "error",
        text: "Unable to add product to cart.",
      });
    } finally {
      setTimeout(() => {
        setAddingId(null);
      }, 400);
    }
  }

  /*
   * -------------------------------------------------------
   * CART COUNT FOR MOBILE NAV
   * -------------------------------------------------------
   */
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const raw = localStorage.getItem("primecart-cart");
        const cart = raw ? JSON.parse(raw) : [];
        const count = Array.isArray(cart)
          ? cart.reduce(
              (total: number, item: any) =>
                total + Math.max(1, Number(item?.quantity || 1)),
              0
            )
          : 0;
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, []);

  /*
   * -------------------------------------------------------
   * VALID ITEMS + WORKING SEARCH
   * -------------------------------------------------------
   */
  const validItems = useMemo(() => {
    return items.filter(
      (item) => item.product !== null
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return validItems;

    return validItems.filter((item) => {
      const product = item.product;
      if (!product) return false;

      return [
        product.name,
        product.slug,
        product.brand,
        product.short_description,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        );
    });
  }, [validItems, searchQuery]);

  /*
   * -------------------------------------------------------
   * TOTAL WISHLIST VALUE
   * -------------------------------------------------------
   */

  const totalValue = useMemo(() => {
    return validItems.reduce(
      (total, item) => {
        return (
          total +
          Number(item.product?.price || 0)
        );
      },
      0
    );
  }, [validItems]);

  /*
   * -------------------------------------------------------
   * UI
   * -------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#171717]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-[#eadfca] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfca] bg-white text-[#8b6b25] transition hover:bg-[#fffaf0]"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <h1 className="text-lg font-bold sm:text-xl">
                My Wishlist
              </h1>

              <p className="hidden text-xs text-gray-500 sm:block">
                Products you've saved for later
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/products"
            className="hidden items-center gap-2 rounded-xl bg-[#c9a24d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b8913f] sm:flex"
          >
            <ShoppingCart size={17} />
            Continue Shopping
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-6 sm:pb-6 lg:px-8">
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <section className="mb-6 overflow-hidden rounded-2xl border border-[#eadfca] bg-white shadow-sm">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff5f5] text-[#c95b5b]">
                  <Heart
                    size={28}
                    fill="currentColor"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#9b762b]">
                    PrimeCart Wishlist
                  </p>

                  <h2 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">
                    Saved Products
                  </h2>

                  <p className="mt-1 max-w-xl text-sm text-gray-500">
                    Keep your favourite products here
                    and shop them whenever you're ready.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-[120px] rounded-xl border border-[#eadfca] bg-[#fffdf8] px-4 py-3 sm:px-5">
                  <p className="text-xs text-gray-500">
                    Saved Items
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {validItems.length}
                  </p>
                </div>

                <div className="min-w-[140px] rounded-xl border border-[#eadfca] bg-[#fffdf8] px-4 py-3 sm:px-5">
                  <p className="text-xs text-gray-500">
                    Wishlist Value
                  </p>

                  <p className="mt-1 text-xl font-bold text-[#9b762b]">
                    {formatPrice(totalValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-1 bg-gradient-to-r from-transparent via-[#c9a24d] to-transparent opacity-60" />
        </section>

        {/* =====================================================
            WISHLIST SEARCH
        ===================================================== */}
        {!loading && validItems.length > 0 && (
          <section className="mb-6">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9b762b]"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search your wishlist by product, brand..."
                className="h-12 w-full rounded-2xl border border-[#eadfca] bg-white pl-11 pr-11 text-sm text-gray-900 outline-none shadow-sm transition focus:border-[#c9a24d] focus:ring-2 focus:ring-[#c9a24d]/20"
                aria-label="Search wishlist"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-[#9b762b]"
                >
                  Clear
                </button>
              )}
            </div>
            {searchQuery.trim() && (
              <p className="mt-2 px-1 text-xs text-gray-500">
                Showing {filteredItems.length} of {validItems.length} saved products
              </p>
            )}
          </section>
        )}

        {/* =====================================================
            SEARCH EMPTY STATE
        ===================================================== */}
        {!loading &&
          validItems.length > 0 &&
          searchQuery.trim() &&
          filteredItems.length === 0 && (
            <div className="mb-8 rounded-2xl border border-[#eadfca] bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fffaf0] text-[#c9a24d]">
                <Search size={28} />
              </div>
              <h3 className="mt-5 text-xl font-bold">
                No wishlist products found
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Try another product name or brand.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-5 rounded-xl bg-[#c9a24d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#b8913f]"
              >
                Clear Search
              </button>
            </div>
          )}

        {/* =====================================================
            MESSAGE
        ===================================================== */}

        {message && (
          <div
            className={`mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <Check size={17} />
            ) : (
              <HeartOff size={17} />
            )}

            <span className="flex-1">
              {message.text}
            </span>

            <button
              type="button"
              onClick={() => setMessage(null)}
              className="text-xs font-semibold underline"
            >
              Close
            </button>
          </div>
        )}

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-[#eadfca] bg-white"
              >
                <div className="h-64 bg-[#eeeae1]" />

                <div className="space-y-3 p-4">
                  <div className="h-3 w-20 rounded bg-[#eeeae1]" />
                  <div className="h-5 w-full rounded bg-[#eeeae1]" />
                  <div className="h-4 w-2/3 rounded bg-[#eeeae1]" />
                  <div className="h-5 w-1/3 rounded bg-[#eeeae1]" />
                  <div className="h-10 w-full rounded bg-[#eeeae1]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {!loading && validItems.length === 0 && (
          <div className="rounded-2xl border border-[#eadfca] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#fff5f5] text-[#c95b5b]">
              <HeartOff size={34} />
            </div>

            <h3 className="mt-6 text-2xl font-bold">
              Your wishlist is empty
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You haven't saved any products yet.
              Explore PrimeCart and add products you
              love to your wishlist.
            </p>

            <Link
              href="/dashboard/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#c9a24d] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b8913f] hover:shadow-md"
            >
              Explore Products
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        {!loading && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => {
              const product = item.product!;

              const discount = getDiscount(
                Number(product.price),
                product.original_price
                  ? Number(product.original_price)
                  : null
              );

              const outOfStock =
                Number(product.stock) <= 0;

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-[#eadfca] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* =================================================
                      PRODUCT IMAGE
                  ================================================= */}

                  <div className="relative h-64 overflow-hidden bg-[#faf9f6] sm:h-72">
                    <ProductImage
                      src={product.image_url}
                      alt={product.name}
                    />

                    {/* Discount */}
                    {discount > 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-[#c9a24d] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                        {discount}% OFF
                      </span>
                    )}

                    {/* Flash Sale */}
                    {product.is_flash_sale && (
                      <span className="absolute bottom-3 left-3 rounded-full bg-[#171717] px-2.5 py-1 text-xs font-semibold text-white">
                        Flash Deal
                      </span>
                    )}

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() =>
                        removeFromWishlist(
                          item.id,
                          product.name
                        )
                      }
                      disabled={
                        removingId === item.id
                      }
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfca] bg-white/95 text-[#b74c4c] shadow-sm backdrop-blur transition hover:bg-[#fff4f4] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      {removingId === item.id ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#b74c4c] border-t-transparent" />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>

                  {/* =================================================
                      CONTENT
                  ================================================= */}

                  <div className="p-4">
                    {/* Brand */}
                    {product.brand && (
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#a17c31]">
                        {product.brand}
                      </p>
                    )}

                    {/* Product name */}
                    <Link
                      href={`/dashboard/products/${product.id}`}
                    >
                      <h3 className="mt-1 line-clamp-2 min-h-[48px] text-base font-bold text-gray-900 transition group-hover:text-[#a17c31]">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Description */}
                    {product.short_description && (
                      <p className="mt-1 line-clamp-2 min-h-[40px] text-xs leading-5 text-gray-500">
                        {product.short_description}
                      </p>
                    )}

                    {/* Rating */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-md bg-[#fff8e8] px-2 py-1 text-xs font-semibold text-[#9b762b]">
                        <Star
                          size={13}
                          fill="currentColor"
                        />

                        {Number(
                          product.rating || 0
                        ).toFixed(1)}
                      </div>

                      <span className="text-xs text-gray-400">
                        (
                        {Number(
                          product.reviews_count || 0
                        )}
                        {" "}
                        reviews)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(
                          Number(product.price)
                        )}
                      </span>

                      {product.original_price &&
                        Number(
                          product.original_price
                        ) >
                          Number(
                            product.price
                          ) && (
                          <span className="mb-0.5 text-sm text-gray-400 line-through">
                            {formatPrice(
                              Number(
                                product.original_price
                              )
                            )}
                          </span>
                        )}
                    </div>

                    {/* Stock */}
                    <p
                      className={`mt-2 text-xs font-medium ${
                        outOfStock
                          ? "text-red-600"
                          : Number(
                              product.stock
                            ) <= 5
                            ? "text-orange-600"
                            : "text-emerald-600"
                      }`}
                    >
                      {outOfStock
                        ? "Out of stock"
                        : Number(
                              product.stock
                            ) <= 5
                          ? `Only ${product.stock} left`
                          : "In stock"}
                    </p>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        disabled={
                          outOfStock ||
                          addingId === product.id
                        }
                        onClick={() =>
                          addProductToCart(
                            product
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#c9a24d] px-3 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b8913f] hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {addingId ===
                        product.id ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <ShoppingCart
                              size={16}
                            />

                            {outOfStock
                              ? "Out of Stock"
                              : "Add to Cart"}
                          </>
                        )}
                      </button>

                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e5dccb] text-gray-600 transition hover:border-[#c9a24d] hover:bg-[#fffaf0] hover:text-[#9b762b]"
                        aria-label="View product"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* =====================================================
            BOTTOM CTA
        ===================================================== */}

        {!loading && validItems.length > 0 && (
          <div className="mt-8 rounded-2xl border border-[#eadfca] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <div>
                <h3 className="text-lg font-bold">
                  Looking for something else?
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Discover more products from PrimeCart.
                </p>
              </div>

              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-2 rounded-xl border border-[#c9a24d] px-5 py-3 text-sm font-semibold text-[#9b762b] transition hover:bg-[#fffaf0]"
              >
                Browse Products
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================
          MOBILE BOTTOM NAV — SAME PRIME CART STYLE
          Mobile only; desktop navigation remains untouched.
      ========================================================= */}
      <nav
        className="fixed bottom-3 left-3 right-3 z-[100] rounded-2xl border border-[#eadfca] bg-white/95 p-2 shadow-[0_10px_35px_rgba(0,0,0,0.12)] backdrop-blur-xl md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="grid grid-cols-5 items-center">
          <Link
            href="/dashboard"
            className="group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl text-gray-500 transition hover:text-[#9b762b]"
          >
            <Home size={21} strokeWidth={2} />
            <span className="text-[10px] font-semibold">Home</span>
          </Link>

          <Link
            href="/dashboard/categories"
            className="group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl text-gray-500 transition hover:text-[#9b762b]"
          >
            <LayoutGrid size={21} strokeWidth={2} />
            <span className="text-[10px] font-semibold">Categories</span>
          </Link>

          <Link
            href="/dashboard/wishlist"
            aria-current="page"
            className="relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl bg-[#fffaf0] text-[#9b762b]"
          >
            <span className="absolute left-1/2 top-0 h-1 w-8 -translate-x-1/2 rounded-b-full bg-[#c9a24d]" />
            <Heart size={21} fill="currentColor" strokeWidth={2} />
            <span className="text-[10px] font-bold">Wishlist</span>
            {validItems.length > 0 && (
              <span className="absolute right-[calc(50%-22px)] top-1 flex h-4 min-w-4 translate-x-1/2 items-center justify-center rounded-full bg-[#c9a24d] px-1 text-[9px] font-bold text-white">
                {validItems.length > 99 ? "99+" : validItems.length}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/cart"
            className="relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl text-gray-500 transition hover:text-[#9b762b]"
          >
            <ShoppingCart size={21} strokeWidth={2} />
            <span className="text-[10px] font-semibold">Cart</span>
            {cartCount > 0 && (
              <span className="absolute right-[calc(50%-22px)] top-1 flex h-4 min-w-4 translate-x-1/2 items-center justify-center rounded-full bg-[#c9a24d] px-1 text-[9px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/profile"
            className="group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl text-gray-500 transition hover:text-[#9b762b]"
          >
            <UserRound size={21} strokeWidth={2} />
            <span className="text-[10px] font-semibold">Account</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
