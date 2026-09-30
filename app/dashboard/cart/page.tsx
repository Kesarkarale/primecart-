"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  CreditCard,
  Gift,
  Heart,
  Lock,
  Minus,
  PackageCheck,
  Plus,
  RefreshCcw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  brand: string | null;
  stock: number;
  rating: number | null;
  reviews_count: number | null;
  category_id: string | null;
  is_active: boolean;
};

type CartItem = Product & {
  quantity: number;
  cart_item_id: string;
};

type SavedItem = CartItem;

type NoticeType = "success" | "error" | "info";

type Notice = {
  type: NoticeType;
  message: string;
};

type CartRow = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string | null;
};

const CART_KEY = "primecart-cart";
const SAVED_KEY = "primecart-saved";
const CHECKOUT_CART_KEY = "primecart-checkout-cart";
const CHECKOUT_SUMMARY_KEY = "primecart-checkout-summary";
const WISHLIST_KEY = "primecart-wishlist";

const FREE_SHIPPING_LIMIT = 999;
const STANDARD_SHIPPING = 79;

const COUPONS = {
  PRIME10: {
    type: "percent" as const,
    value: 10,
    maxDiscount: 500,
    minimum: 0,
    label: "10% OFF up to ₹500",
  },
  WELCOME: {
    type: "flat" as const,
    value: 150,
    minimum: 999,
    label: "₹150 OFF above ₹999",
  },
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Number(value) || 0));
}

function getImageCandidates(value?: string | null) {
  if (!value?.trim()) return ["/placeholder-product.png"];

  const raw = value.trim();

  if (/^(https?:\/\/|data:)/i.test(raw)) {
    return [raw, "/placeholder-product.png"];
  }

  const clean = raw
    .replace(/^public[\\/]/i, "")
    .replace(/^\/+/, "");

  const encoded = clean
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return Array.from(
    new Set([
      `/${clean}`,
      `/${encoded}`,
      `/products/${clean}`,
      `/product-images/${clean}`,
      `/images/products/${clean}`,
      `/images/${clean}`,
      `/assets/products/${clean}`,
      `/assets/images/${clean}`,
      "/placeholder-product.png",
    ]),
  );
}

function ProductImage({
  src,
  alt,
  className = "h-full w-full object-contain",
  sizes,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const candidates = getImageCandidates(src);
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [src]);

  const current = candidates[index] ?? "/placeholder-product.png";

  return (
    <img
      src={current}
      alt={alt}
      sizes={sizes}
      className={className}
      loading="lazy"
      onError={() => {
        if (index < candidates.length - 1) {
          setIndex((value) => value + 1);
        }
      }}
    />
  );
}

function readStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Cache failures must never break the cart.
  }
}

function normalizeSavedItem(item: Partial<CartItem>): CartItem | null {
  if (!item.id || !item.name) return null;

  return {
    id: String(item.id),
    name: String(item.name),
    price: Number(item.price) || 0,
    original_price:
      item.original_price === null || item.original_price === undefined
        ? null
        : Number(item.original_price) || 0,
    image_url: item.image_url ?? null,
    brand: item.brand ?? null,
    stock:
      item.stock === null || item.stock === undefined
        ? 99
        : Math.max(0, Number(item.stock) || 0),
    rating:
      item.rating === null || item.rating === undefined
        ? null
        : Number(item.rating),
    reviews_count:
      item.reviews_count === null || item.reviews_count === undefined
        ? null
        : Number(item.reviews_count),
    category_id: item.category_id ?? null,
    is_active: item.is_active ?? true,
    quantity: Math.max(1, Number(item.quantity) || 1),
    cart_item_id: String(item.cart_item_id ?? `saved-${item.id}`),
  };
}

export default function CartPage() {
  const supabase = useMemo(() => createClient(), []);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removedId, setRemovedId] = useState<string | null>(null);
  const [validatingCart, setValidatingCart] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const showNotice = useCallback(
    (message: string, type: NoticeType = "success") => {
      setNotice({ message, type });
    },
    [],
  );

  const redirectToLogin = useCallback(() => {
    window.location.href = "/auth/login?redirect=/dashboard/cart";
  }, []);

  /*
   * DB is the only source of truth for the active cart.
   * localStorage is updated only as a compatibility/cache snapshot.
   */
  const loadCartFromDatabase = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        redirectToLogin();
        return;
      }

      const { data: rows, error: cartError } = await supabase
        .from("cart_items")
        .select("id,user_id,product_id,quantity,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cartError) throw cartError;

      const cartRows = (rows ?? []) as CartRow[];

      if (!cartRows.length) {
        setCart([]);
        writeStorage(CART_KEY, []);
        return;
      }

      const productIds = Array.from(
        new Set(cartRows.map((row) => row.product_id)),
      );

      // Load the products referenced by cart_items.
      // cart_items remains the source of truth; products are only used to
      // hydrate the cart UI with current product information.
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select(
          "id,name,price,original_price,image_url,brand,stock,rating,reviews_count,category_id,is_active",
        )
        .in("id", productIds);

      if (productsError) {
        console.error("Cart products query error:", productsError);
        showNotice(
          `Cart items are saved in the database, but product details could not be loaded. ${productsError.message}`,
          "error",
        );
        return;
      }

      // Never delete cart rows just because the product query returned no row.
      // The cart DB record is valuable and should remain until we know the
      // product is genuinely inactive/out of stock.
      const loadedProductIds = new Set((products ?? []).map((p) => p.id));
      const missingProductIds = productIds.filter((id) => !loadedProductIds.has(id));

      if (missingProductIds.length) {
        console.warn(
          "Cart product IDs exist in cart_items but were not returned from products:",
          missingProductIds,
        );

        // Do NOT remove these rows from cart_items. If the products table has
        // an RLS/visibility issue, the user's cart data must remain intact.
        showNotice(
          "Some cart products could not be loaded. Your database cart is safe; check products table access/RLS.",
          "info",
        );
      }

      const productMap = new Map<string, Product>(
        (products ?? []).map((product) => [
          product.id,
          {
            ...product,
            price: Number(product.price) || 0,
            original_price:
              product.original_price === null
                ? null
                : Number(product.original_price) || 0,
            stock: Math.max(0, Number(product.stock) || 0),
            rating:
              product.rating === null ? null : Number(product.rating),
            reviews_count:
              product.reviews_count === null
                ? null
                : Number(product.reviews_count),
            is_active: product.is_active !== false,
          } as Product,
        ]),
      );

      const nextCart: CartItem[] = [];
      const rowsToUpdate: Array<{ id: string; quantity: number }> = [];

for (const row of cartRows) {
  const product = productMap.get(row.product_id);

  // Keep cart_items permanently stored.
  // Do not delete cart rows because a product is unavailable/out of stock.
  if (!product) {
    continue;
  }

  if (product.is_active === false || product.stock <= 0) {
    continue;
  }

  const requested = Math.max(1, Number(row.quantity) || 1);
  const quantity = Math.min(requested, product.stock);

  if (quantity !== requested) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", row.id)
      .eq("user_id", user.id);

    if (error) throw error;

    changed = true;
    messages.push(
      `${product.name} quantity was adjusted to available stock.`,
    );
  }

  nextCart.push({
    ...product,
    quantity,
    cart_item_id: row.id,
  });
}

      if (rowsToDelete.length) {
        await supabase.from("cart_items").delete().in("id", rowsToDelete);
      }

      if (rowsToUpdate.length) {
        await Promise.all(
          rowsToUpdate.map(({ id, quantity }) =>
            supabase
              .from("cart_items")
              .update({ quantity })
              .eq("id", id)
              .eq("user_id", user.id),
          ),
        );
      }

      setCart(nextCart);
      writeStorage(CART_KEY, nextCart);
    } catch (error) {
      console.error("Load cart error:", error);
      showNotice(
        "Could not load your cart. Please refresh and try again.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [redirectToLogin, showNotice, supabase]);

  const refreshCart = useCallback(async () => {
    await loadCartFromDatabase();
  }, [loadCartFromDatabase]);

  useEffect(() => {
    const saved = readStorage<Partial<SavedItem>>(SAVED_KEY)
      .map(normalizeSavedItem)
      .filter((item): item is SavedItem => item !== null);

    const storedWishlist = readStorage<unknown>(WISHLIST_KEY).filter(
      (value): value is string => typeof value === "string",
    );

    setSavedItems(saved);
    setWishlist(storedWishlist);
    void loadCartFromDatabase();
  }, [loadCartFromDatabase]);

  useEffect(() => {
    if (!loading) writeStorage(SAVED_KEY, savedItems);
  }, [loading, savedItems]);

  useEffect(() => {
    if (!loading) writeStorage(WISHLIST_KEY, wishlist);
  }, [loading, wishlist]);

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  /*
   * Keep Cart synchronized with Product Detail / other cart actions.
   */
  useEffect(() => {
    const handleCartUpdated = () => {
      void refreshCart();
    };

    window.addEventListener("cart-updated", handleCartUpdated);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, [refreshCart]);

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
    [cart],
  );

  const originalTotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const original =
          item.original_price && item.original_price > item.price
            ? item.original_price
            : item.price;

        return sum + original * item.quantity;
      }, 0),
    [cart],
  );

  const productSavings = Math.max(originalTotal - subtotal, 0);

  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= FREE_SHIPPING_LIMIT
        ? 0
        : STANDARD_SHIPPING;

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;

    const selected =
      COUPONS[appliedCoupon as keyof typeof COUPONS];

    if (!selected || subtotal < selected.minimum) return 0;

    if (selected.type === "percent") {
      return Math.min(
        Math.round((subtotal * selected.value) / 100),
        selected.maxDiscount,
      );
    }

    return Math.min(selected.value, subtotal);
  }, [appliedCoupon, subtotal]);

  const grandTotal = Math.max(
    subtotal + shipping - couponDiscount,
    0,
  );

  const totalSavings = productSavings + couponDiscount;

  const freeShippingRemaining = Math.max(
    FREE_SHIPPING_LIMIT - subtotal,
    0,
  );

  const shippingProgress = Math.min(
    Math.round((subtotal / FREE_SHIPPING_LIMIT) * 100),
    100,
  );

  function persistCart(nextCart: CartItem[]) {
    setCart(nextCart);
    writeStorage(CART_KEY, nextCart);
  }


  async function updateQuantity(
    productId: string,
    direction: "increase" | "decrease",
  ) {
    const current = cart.find((item) => item.id === productId);
    if (!current || updatingId === productId) return;

    const stock = Math.max(Number(current.stock) || 0, 0);

    if (direction === "increase" && current.quantity >= stock) {
      showNotice(
        `Only ${stock} unit${stock === 1 ? "" : "s"} available.`,
        "info",
      );
      return;
    }

    const nextQuantity =
      direction === "increase"
        ? Math.min(current.quantity + 1, stock)
        : current.quantity - 1;

    setUpdatingId(productId);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        redirectToLogin();
        return;
      }

      if (nextQuantity <= 0) {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", current.cart_item_id)
          .eq("user_id", user.id);

        if (error) throw error;

        persistCart(cart.filter((item) => item.id !== productId));
        showNotice("Product removed from cart.", "info");
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: nextQuantity })
        .eq("id", current.cart_item_id)
        .eq("user_id", user.id);

      if (error) throw error;

      persistCart(
        cart.map((item) =>
          item.id === productId
            ? { ...item, quantity: nextQuantity }
            : item,
        ),
      );
    } catch (error) {
      console.error("Quantity update error:", error);
      showNotice("Could not update cart quantity.", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(productId: string) {
    const removed = cart.find((item) => item.id === productId);
    if (!removed) return;

    setRemovedId(productId);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        redirectToLogin();
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", removed.cart_item_id)
        .eq("user_id", user.id);

      if (error) throw error;

      persistCart(cart.filter((item) => item.id !== productId));
      showNotice(`${removed.name} removed from your cart.`, "info");
    } catch (error) {
      console.error("Remove cart item error:", error);
      showNotice("Could not remove this product.", "error");
    } finally {
      window.setTimeout(() => setRemovedId(null), 180);
    }
  }

  async function saveForLater(item: CartItem) {
    const alreadySaved = savedItems.some((saved) => saved.id === item.id);

    if (!alreadySaved) {
      setSavedItems((previous) => [
        ...previous,
        { ...item, quantity: 1 },
      ]);
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        redirectToLogin();
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", item.cart_item_id)
        .eq("user_id", user.id);

      if (error) throw error;

      persistCart(cart.filter((product) => product.id !== item.id));
      showNotice("Product saved for later.");
    } catch (error) {
      console.error("Save for later error:", error);

      if (!alreadySaved) {
        setSavedItems((previous) =>
          previous.filter((saved) => saved.id !== item.id),
        );
      }

      showNotice("Could not save this product.", "error");
    }
  }

  async function moveToCart(item: SavedItem) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        redirectToLogin();
        return;
      }

      const { data: latestProduct, error: productError } = await supabase
        .from("products")
        .select(
          "id,name,price,original_price,image_url,brand,stock,rating,reviews_count,category_id,is_active",
        )
        .eq("id", item.id)
        .maybeSingle();

      if (productError) throw productError;

      if (!latestProduct || latestProduct.is_active === false) {
        showNotice("This product is no longer available.", "error");
        return;
      }

      const latestStock = Math.max(Number(latestProduct.stock) || 0, 0);

      if (latestStock <= 0) {
        showNotice("This product is currently out of stock.", "error");
        return;
      }

      const existing = cart.find((product) => product.id === item.id);

      if (existing) {
        const quantity = Math.min(
          existing.quantity + Math.max(1, item.quantity),
          latestStock,
        );

        const { error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("id", existing.cart_item_id)
          .eq("user_id", user.id);

        if (error) throw error;

        persistCart(
          cart.map((product) =>
            product.id === item.id
              ? {
                  ...product,
                  ...latestProduct,
                  price: Number(latestProduct.price) || 0,
                  original_price:
                    latestProduct.original_price === null
                      ? null
                      : Number(latestProduct.original_price) || 0,
                  stock: latestStock,
                  quantity,
                }
              : product,
          ),
        );
      } else {
        const quantity = Math.min(
          Math.max(1, item.quantity),
          latestStock,
        );

        const { data: inserted, error } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: item.id,
            quantity,
          })
          .select("id,quantity")
          .single();

        if (error) throw error;

        const product: Product = {
          ...latestProduct,
          price: Number(latestProduct.price) || 0,
          original_price:
            latestProduct.original_price === null
              ? null
              : Number(latestProduct.original_price) || 0,
          stock: latestStock,
          rating:
            latestProduct.rating === null
              ? null
              : Number(latestProduct.rating),
          reviews_count:
            latestProduct.reviews_count === null
              ? null
              : Number(latestProduct.reviews_count),
        };

        persistCart([
          ...cart,
          {
            ...product,
            quantity,
            cart_item_id: inserted.id,
          },
        ]);
      }


      setSavedItems((previous) =>
        previous.filter((saved) => saved.id !== item.id),
      );

      showNotice("Product moved back to your cart.");
    } catch (error) {
      console.error("Move to cart error:", error);
      showNotice("Could not move this product to cart.", "error");
    }
  }

  function removeSavedItem(id: string) {
    setSavedItems((previous) =>
      previous.filter((item) => item.id !== id),
    );
    showNotice("Saved product removed.", "info");
  }

  function toggleWishlist(id: string) {
    const exists = wishlist.includes(id);

    setWishlist((previous) =>
      exists
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );

    showNotice(
      exists
        ? "Removed from wishlist."
        : "Added to wishlist.",
    );
  }

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();

    if (!code) {
      showNotice("Enter a coupon code first.", "error");
      return;
    }

    const selected = COUPONS[code as keyof typeof COUPONS];

    if (!selected) {
      showNotice("This coupon code is not valid.", "error");
      return;
    }

    if (subtotal < selected.minimum) {
      showNotice(
        `Add ${formatPrice(selected.minimum - subtotal)} more to use ${code}.`,
        "info",
      );
      return;
    }

    setAppliedCoupon(code);
    setCouponOpen(false);
    showNotice(`${code} applied successfully.`);
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCoupon("");
    showNotice("Coupon removed.", "info");
  }

  /*
   * Fresh validation immediately before checkout.
   * This prevents stale price/stock information from being used.
   */
  async function validateCartBeforeCheckout() {
    setValidatingCart(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        redirectToLogin();
        return false;
      }

      const { data: rows, error: cartError } = await supabase
        .from("cart_items")
        .select("id,user_id,product_id,quantity,created_at")
        .eq("user_id", user.id);

      if (cartError) throw cartError;

      const cartRows = (rows ?? []) as CartRow[];

      if (!cartRows.length) {
        setCart([]);
        writeStorage(CART_KEY, []);
        showNotice("Your cart is empty.", "error");
        return false;
      }

      const productIds = Array.from(
        new Set(cartRows.map((row) => row.product_id)),
      );

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select(
          "id,name,price,original_price,image_url,brand,stock,rating,reviews_count,category_id,is_active",
        )
        .in("id", productIds);

      if (productsError) throw productsError;

      const productMap = new Map(
        (products ?? []).map((product) => [
          product.id,
          {
            ...product,
            price: Number(product.price) || 0,
            original_price:
              product.original_price === null
                ? null
                : Number(product.original_price) || 0,
            stock: Math.max(0, Number(product.stock) || 0),
          } as Product,
        ]),
      );

      const nextCart: CartItem[] = [];
      let changed = false;
      const messages: string[] = [];

      for (const row of cartRows) {
        const product = productMap.get(row.product_id);


        const requested = Math.max(1, Number(row.quantity) || 1);
        const quantity = Math.min(requested, product.stock);

        if (quantity !== requested) {
          const { error } = await supabase
            .from("cart_items")
            .update({ quantity })
            .eq("id", row.id)
            .eq("user_id", user.id);

          if (error) throw error;

          changed = true;
          messages.push(
            `${product.name} quantity was adjusted to available stock.`,
          );
        }

        nextCart.push({
          ...product,
          quantity,
          cart_item_id: row.id,
        });
      }

      setCart(nextCart);
      writeStorage(CART_KEY, nextCart);

      if (changed) {
        showNotice(
          messages[0] ??
            "Cart was updated with the latest stock information.",
          "info",
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Cart validation error:", error);
      showNotice(
        "Could not verify your cart. Please try again.",
        "error",
      );
      return false;
    } finally {
      setValidatingCart(false);
    }
  }

  async function proceedToCheckout() {
    const valid = await validateCartBeforeCheckout();
    if (!valid) return;

    /*
     * Checkout page should read cart_items itself.
     * These snapshots are retained only for backward compatibility.
     */
    writeStorage(
      CHECKOUT_CART_KEY,
      cart.map(({ cart_item_id, ...item }) => item),
    );

    writeStorage(CHECKOUT_SUMMARY_KEY, [
      {
        itemCount,
        subtotal,
        shipping,
        couponDiscount,
        appliedCoupon,
        totalSavings,
        grandTotal,
      },
    ]);

    window.location.href = "/dashboard/checkout";
  }

  function continueShopping() {
    window.location.href = "/dashboard/products";
  }

  if (loading) return <CartLoading />;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#faf8f3] text-[#17130d] dark:bg-[#0c0b09] dark:text-white">
      {notice && (
        <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm">
          <div className="flex items-start gap-3 rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-2xl dark:border-[#3a3224] dark:bg-[#171512]">
            <div
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                notice.type === "success"
                  ? "bg-emerald-50 text-emerald-600"
                  : notice.type === "error"
                    ? "bg-red-50 text-red-600"
                    : "bg-[#f8f1df] text-[#a17a35]",
              ].join(" ")}
            >
              {notice.type === "success" ? (
                <Check className="h-4 w-4" />
              ) : notice.type === "error" ? (
                <X className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>

            <p className="flex-1 pt-1 text-sm font-medium">
              {notice.message}
            </p>

            <button
              type="button"
              onClick={() => setNotice(null)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-[#eadfc9] bg-white/95 backdrop-blur-xl dark:border-[#2a261f] dark:bg-[#0c0b09]/95">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-2.5"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#faf8f3] dark:bg-[#191712]">
              <img
                src="/logo.png"
                alt="PrimeCart"
                className="h-full w-full object-contain p-1"
              />
            </div>

            <div className="min-w-0">
              <div className="text-[18px] font-black tracking-tight sm:text-lg">
                Prime<span className="text-[#b9975b]">Cart</span>
              </div>
              <div className="hidden text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 min-[390px]:block">
                Premium Shopping
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/dashboard/products"
              className="text-sm font-semibold text-gray-600 hover:text-[#a17a35] dark:text-gray-300"
            >
              Continue Shopping
            </Link>

            <Link
              href="/dashboard/orders"
              className="text-sm font-semibold text-gray-600 hover:text-[#a17a35] dark:text-gray-300"
            >
              My Orders
            </Link>

            <div className="flex items-center gap-2 rounded-full border border-[#eadfc9] bg-[#faf8f3] px-3 py-2 dark:border-[#332d23] dark:bg-[#171512]">
              <Lock className="h-3.5 w-3.5 text-[#a17a35]" />
              <span className="text-xs font-bold">Secure Checkout</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#f8f1df] px-3 py-2 text-[#8f6b31] dark:bg-[#201c15]">
            <ShoppingCart className="h-4 w-4" />
            <span className="text-xs font-black">{itemCount}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 pb-32 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-12">
        <nav className="mb-4 flex items-center gap-2 px-1 text-xs text-gray-500 sm:mb-5">
          <Link href="/dashboard" className="hover:text-[#a17a35]">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#17130d] dark:text-white">
            Cart
          </span>
        </nav>

        <section className="mb-5 overflow-hidden rounded-[24px] border border-[#eadfc9] bg-white shadow-[0_15px_45px_rgba(72,52,18,0.06)] dark:border-[#2f2a22] dark:bg-[#12110e] sm:mb-7 sm:rounded-[28px]">
          <div className="relative p-5 sm:p-8">
            <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[#b9975b]/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#eadfc9] bg-[#faf8f3] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#9a7539] dark:border-[#332d23] dark:bg-[#191712]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Smart Cart
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-4xl">
                  Shopping Cart
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                  Review your products, unlock offers, and checkout securely.
                </p>
              </div>

              <button
                type="button"
                onClick={continueShopping}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d9c7a4] bg-white px-5 py-3 text-sm font-bold text-[#8f6b31] hover:bg-[#faf8f3] dark:border-[#4a3d28] dark:bg-[#171512] md:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </button>
            </div>
          </div>

          {cart.length > 0 && (
            <div className="border-t border-[#eee6d8] bg-[#fcfaf6] px-5 py-4 dark:border-[#29251f] dark:bg-[#15130f] sm:px-8">
              {shippingProgress >= 100 ? (
                <div className="flex items-center gap-3 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                    <Truck className="h-4 w-4" />
                  </div>
                  <span>FREE shipping unlocked!</span>
                  <Check className="ml-auto h-5 w-5" />
                </div>
              ) : (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">
                      Add{" "}
                      <span className="font-black text-[#9a7539]">
                        {formatPrice(freeShippingRemaining)}
                      </span>{" "}
                      more for FREE delivery
                    </span>
                    <Truck className="h-4 w-4 text-[#a17a35]" />
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#eadfc9] dark:bg-[#30291e]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#8f6b31] via-[#b9975b] to-[#d6b875] transition-all duration-500"
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {cart.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="min-w-0 space-y-5">
                <section className="rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-sm dark:border-[#2f2a22] dark:bg-[#12110e] sm:p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-black">Your Items</h2>
                      <p className="mt-1 text-xs text-gray-500">
                        {itemCount} item{itemCount === 1 ? "" : "s"} selected
                      </p>
                    </div>

                    <span className="rounded-full bg-[#f8f1df] px-3 py-1.5 text-xs font-black text-[#8f6b31] dark:bg-[#211c14] dark:text-[#d6b875]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </section>

                <div className="space-y-4">
                  {cart.map((item) => {
                    const original =
                      item.original_price && item.original_price > item.price
                        ? item.original_price
                        : item.price;

                    const discount =
                      original > item.price
                        ? Math.round(
                            ((original - item.price) / original) * 100,
                          )
                        : 0;

                    const stock = Math.max(Number(item.stock) || 0, 0);

                    return (
                      <article
                        key={item.id}
                        className={[
                          "group rounded-2xl border border-[#eadfc9] bg-white p-3.5 shadow-sm transition-all hover:shadow-lg dark:border-[#2f2a22] dark:bg-[#12110e] sm:p-4",
                          removedId === item.id
                            ? "scale-[0.98] opacity-0"
                            : "",
                        ].join(" ")}
                      >
                        <div className="flex gap-3.5 sm:gap-4">
                          <Link
                            href={`/dashboard/products/${item.id}`}
                            className="relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-xl border border-[#eee6d8] bg-[#faf8f3] dark:border-[#2b261f] dark:bg-[#191712] sm:h-36 sm:w-36"
                          >
                            <ProductImage
                              src={item.image_url}
                              alt={item.name}
                              sizes="(max-width: 640px) 104px, 144px"
                              className="h-full w-full object-contain p-2.5 transition duration-500 group-hover:scale-105 sm:p-3"
                            />
                            {discount > 0 && (
                              <span className="absolute left-1.5 top-1.5 rounded-md bg-[#8f6b31] px-1.5 py-1 text-[8px] font-black text-white sm:left-2 sm:top-2 sm:px-2 sm:text-[10px]">
                                {discount}% OFF
                              </span>
                            )}
                          </Link>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                {item.brand && (
                                  <p className="mb-0.5 truncate text-[9px] font-black uppercase tracking-[0.12em] text-[#a17a35] sm:text-[10px] sm:tracking-[0.15em]">
                                    {item.brand}
                                  </p>
                                )}

                                <Link
                                  href={`/dashboard/products/${item.id}`}
                                  className="line-clamp-2 text-sm font-black leading-5 hover:text-[#a17a35] sm:text-base sm:leading-6"
                                >
                                  {item.name}
                                </Link>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 sm:p-2"
                                aria-label={`Remove ${item.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
                              {item.rating !== null && (
                                <span className="rounded-md bg-[#fff8e9] px-1.5 py-1 text-[9px] font-bold text-[#8f6b31] dark:bg-[#211c14] sm:px-2 sm:text-[10px]">
                                  ★ {item.rating.toFixed(1)}
                                  {item.reviews_count
                                    ? ` (${item.reviews_count})`
                                    : ""}
                                </span>
                              )}

                              {stock > 0 && stock <= 5 && (
                                <span className="rounded-md bg-orange-50 px-1.5 py-1 text-[9px] font-bold text-orange-700 dark:bg-orange-950/30 dark:text-orange-300">
                                  Only {stock} left
                                </span>
                              )}

                              {stock > 5 && (
                                <span className="rounded-md bg-emerald-50 px-1.5 py-1 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                                  In Stock
                                </span>
                              )}
                            </div>

                            <div className="mt-3 flex flex-wrap items-end justify-between gap-3 sm:mt-4">
                              <div>
                                <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-gray-400 sm:text-[10px]">
                                  Quantity
                                </p>

                                <div className="inline-flex h-9 items-center overflow-hidden rounded-xl border border-[#dfd3bd] bg-white dark:border-[#40372a] dark:bg-[#171512] sm:h-10">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuantity(item.id, "decrease")
                                    }
                                    disabled={updatingId === item.id}
                                    className="flex h-full w-9 items-center justify-center text-gray-500 hover:bg-[#faf8f3] hover:text-[#8f6b31] disabled:opacity-50 sm:w-10"
                                  >
                                    <Minus className="h-3.5 w-3.5" />
                                  </button>

                                  <span className="flex min-w-9 items-center justify-center border-x border-[#dfd3bd] text-xs font-black dark:border-[#40372a] sm:min-w-10 sm:text-sm">
                                    {updatingId === item.id ? (
                                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#b9975b]/30 border-t-[#8f6b31]" />
                                    ) : (
                                      item.quantity
                                    )}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuantity(item.id, "increase")
                                    }
                                    disabled={
                                      updatingId === item.id ||
                                      item.quantity >= stock
                                    }
                                    className="flex h-full w-9 items-center justify-center text-gray-500 hover:bg-[#faf8f3] hover:text-[#8f6b31] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-[#211e18] sm:w-10"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                                  {original > item.price && (
                                    <span className="text-[10px] text-gray-400 line-through sm:text-xs">
                                      {formatPrice(original * item.quantity)}
                                    </span>
                                  )}

                                  <span className="text-lg font-black sm:text-xl">
                                    {formatPrice(item.price * item.quantity)}
                                  </span>
                                </div>

                                <p className="mt-0.5 text-[10px] text-gray-500 sm:mt-1 sm:text-[11px]">
                                  {formatPrice(item.price)} each
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#f0e9dd] pt-2.5 dark:border-[#29251f] sm:mt-4 sm:gap-3 sm:pt-3">
                              <button
                                type="button"
                                onClick={() => saveForLater(item)}
                                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-[#8f6b31] sm:text-xs"
                              >
                                <Heart className="h-3.5 w-3.5" />
                                Save for later
                              </button>

                              <span className="hidden h-3 w-px bg-[#dfd3bd] dark:bg-[#40372a] sm:block" />

                              <Link
                                href={`/dashboard/products/${item.id}`}
                                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-[#8f6b31] sm:text-xs"
                              >
                                View product
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <section className="hidden gap-3 sm:grid sm:grid-cols-3">
                  <Benefit
                    icon={<Truck className="h-5 w-5" />}
                    title="Fast Delivery"
                    text="Reliable delivery to your doorstep."
                  />
                  <Benefit
                    icon={<ShieldCheck className="h-5 w-5" />}
                    title="Secure Shopping"
                    text="Protected checkout experience."
                  />
                  <Benefit
                    icon={<RefreshCcw className="h-5 w-5" />}
                    title="Easy Returns"
                    text="Simple returns on eligible products."
                  />
                </section>

                {savedItems.length > 0 && (
                  <section className="rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-sm dark:border-[#2f2a22] dark:bg-[#12110e] sm:p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-black">Saved for Later</h2>
                        <p className="mt-1 text-xs text-gray-500">
                          Keep products here for later.
                        </p>
                      </div>
                      <Heart className="h-5 w-5 text-[#b9975b]" />
                    </div>

                    <div className="space-y-3">
                      {savedItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-xl border border-[#eee6d8] p-3 dark:border-[#2c271f]"
                        >
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#faf8f3] dark:bg-[#191712]">
                            <ProductImage
                              src={item.image_url}
                              alt={item.name}
                              sizes="64px"
                              className="h-full w-full object-contain p-1.5"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/dashboard/products/${item.id}`}
                              className="line-clamp-1 text-sm font-bold hover:text-[#a17a35]"
                            >
                              {item.name}
                            </Link>
                            <p className="mt-1 text-sm font-black text-[#8f6b31]">
                              {formatPrice(item.price)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => void moveToCart(item)}
                            className="hidden rounded-lg bg-[#f8f1df] px-3 py-2 text-xs font-black text-[#8f6b31] sm:block"
                          >
                            Move to Cart
                          </button>

                          <button
                            type="button"
                            onClick={() => removeSavedItem(item.id)}
                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            aria-label="Remove saved item"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className="lg:sticky lg:top-24 lg:self-start">
                <section className="overflow-hidden rounded-2xl border border-[#d9c7a4] bg-white shadow-[0_18px_50px_rgba(72,52,18,0.08)] dark:border-[#443823] dark:bg-[#12110e]">
                  <div className="border-b border-[#eee6d8] bg-gradient-to-r from-[#fffdf8] to-[#faf5e9] p-5 dark:border-[#2b261f] dark:from-[#171510] dark:to-[#14120f]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-black">Order Summary</h2>
                        <p className="mt-1 text-xs text-gray-500">
                          {itemCount} item{itemCount === 1 ? "" : "s"} in cart
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8f1df] text-[#9a7539] dark:bg-[#211c14]">
                        <CreditCard className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="mb-5 overflow-hidden rounded-xl border border-[#eadfc9] dark:border-[#332d23]">
                      <button
                        type="button"
                        onClick={() => setCouponOpen((value) => !value)}
                        className="flex w-full items-center justify-between gap-3 p-3.5 text-left hover:bg-[#fcfaf6] dark:hover:bg-[#181611]"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8f1df] text-[#9a7539] dark:bg-[#211c14]">
                            <Tag className="h-4 w-4" />
                          </span>

                          <span>
                            <span className="block text-xs font-black">
                              Apply Coupon
                            </span>
                            <span className="block text-[10px] text-gray-500">
                              Save more on your order
                            </span>
                          </span>
                        </span>

                        {couponOpen ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </button>

                      {couponOpen && (
                        <div className="border-t border-[#eee6d8] p-3.5 dark:border-[#332d23]">
                          {appliedCoupon ? (
                            <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/20">
                              <div>
                                <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                                  {appliedCoupon} applied
                                </p>
                                <p className="mt-0.5 text-[10px] text-emerald-600">
                                  Saving {formatPrice(couponDiscount)}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={removeCoupon}
                                className="text-[10px] font-black text-red-600"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex gap-2">
                                <input
                                  value={coupon}
                                  onChange={(event) =>
                                    setCoupon(
                                      event.target.value.toUpperCase(),
                                    )
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      applyCoupon();
                                    }
                                  }}
                                  placeholder="Enter coupon"
                                  className="min-w-0 flex-1 rounded-lg border border-[#dfd3bd] bg-white px-3 py-2.5 text-xs font-semibold outline-none focus:border-[#b9975b] dark:border-[#40372a] dark:bg-[#171512]"
                                />
                                <button
                                  type="button"
                                  onClick={applyCoupon}
                                  className="rounded-lg bg-[#8f6b31] px-4 py-2 text-xs font-black text-white"
                                >
                                  Apply
                                </button>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setCoupon("PRIME10")}
                                  className="rounded-md border border-[#eadfc9] px-2 py-1 text-[10px] font-bold text-[#8f6b31]"
                                >
                                  PRIME10
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCoupon("WELCOME")}
                                  className="rounded-md border border-[#eadfc9] px-2 py-1 text-[10px] font-bold text-[#8f6b31]"
                                >
                                  WELCOME
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 text-sm">
                      <PriceRow
                        label="Subtotal"
                        value={formatPrice(subtotal)}
                      />

                      {productSavings > 0 && (
                        <PriceRow
                          label="Product savings"
                          value={`-${formatPrice(productSavings)}`}
                          green
                        />
                      )}

                      <PriceRow
                        label="Delivery"
                        value={shipping === 0 ? "FREE" : formatPrice(shipping)}
                        green={shipping === 0}
                      />

                      {couponDiscount > 0 && (
                        <PriceRow
                          label="Coupon discount"
                          value={`-${formatPrice(couponDiscount)}`}
                          green
                        />
                      )}
                    </div>

                    <div className="my-5 border-t border-dashed border-[#dfd3bd] dark:border-[#40372a]" />

                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500">
                          Total Amount
                        </p>
                        <p className="mt-1 text-[10px] text-gray-400">
                          Inclusive of applicable taxes
                        </p>
                      </div>

                      <p className="text-2xl font-black text-[#8f6b31] dark:text-[#d6b875]">
                        {formatPrice(grandTotal)}
                      </p>
                    </div>

                    {totalSavings > 0 && (
                      <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                        <Gift className="h-4 w-4" />
                        You save {formatPrice(totalSavings)}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => void proceedToCheckout()}
                      disabled={validatingCart}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8f6b31] via-[#b9975b] to-[#8f6b31] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#8f6b31]/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {validatingCart ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Checking Cart...
                        </>
                      ) : (
                        <>
                          Proceed to Checkout
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-semibold text-gray-400">
                      <Lock className="h-3 w-3" />
                      Secure encrypted checkout
                    </div>
                  </div>
                </section>
              </aside>
            </div>

            <section className="mt-6 hidden lg:block">
              <div className="grid grid-cols-4 gap-4">
                <DesktopTrustCard
                  icon={<Truck className="h-5 w-5" />}
                  title="Fast Delivery"
                  text="Reliable delivery right to your doorstep."
                  label="3–7 Business Days"
                />
                <DesktopTrustCard
                  icon={<ShieldCheck className="h-5 w-5" />}
                  title="Secure Shopping"
                  text="Your checkout and payment details stay protected."
                  label="100% Secure Checkout"
                />
                <DesktopTrustCard
                  icon={<RefreshCcw className="h-5 w-5" />}
                  title="Easy Returns"
                  text="Hassle-free returns on eligible products."
                  label="Simple & Easy"
                />
                <DesktopTrustCard
                  icon={<PackageCheck className="h-5 w-5" />}
                  title="Quality Checked"
                  text="Products from trusted sellers and brands."
                  label="PrimeCart Promise"
                />
              </div>
            </section>

            <section className="mt-4 hidden items-center justify-between rounded-2xl border border-[#eadfc9] bg-white px-5 py-4 shadow-sm dark:border-[#2f2a22] dark:bg-[#12110e] lg:flex">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8f1df] text-[#9a7539] dark:bg-[#211c14]">
                  <WalletCards className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black">Safe & Flexible Payments</p>
                  <p className="mt-0.5 text-[10px] text-gray-500">
                    Multiple payment options available at checkout.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {["UPI", "VISA", "RuPay", "COD"].map((method) => (
                  <div
                    key={method}
                    className="flex h-9 min-w-[68px] items-center justify-center rounded-lg border border-[#eee6d8] bg-[#fcfaf6] px-3 text-[9px] font-black text-gray-500 dark:border-[#2d2820] dark:bg-[#181611]"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-4 hidden rounded-2xl border border-[#eadfc9] bg-gradient-to-br from-[#fffdf8] to-[#f8f1df] p-5 dark:border-[#332d23] dark:from-[#171510] dark:to-[#211c14] lg:block">
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#9a7539] shadow-sm dark:bg-[#171512]">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black">Estimated Delivery</p>
                    <p className="mt-1 text-sm font-bold text-[#8f6b31] dark:text-[#d6b875]">
                      3–7 business days
                    </p>
                  </div>
                </div>

                <p className="max-w-xl text-right text-[11px] leading-5 text-gray-500">
                  Final delivery date will be confirmed at checkout. Track your
                  order anytime from your PrimeCart account.
                </p>
              </div>
            </section>
          </>
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#d9c7a4] bg-white/95 p-3 shadow-[0_-10px_35px_rgba(72,52,18,0.12)] backdrop-blur-xl dark:border-[#3b3123] dark:bg-[#0f0e0c]/95 lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Total
              </p>
              <p className="truncate text-lg font-black text-[#8f6b31] dark:text-[#d6b875]">
                {formatPrice(grandTotal)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void proceedToCheckout()}
              disabled={validatingCart}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#8f6b31] px-4 text-sm font-black text-white disabled:opacity-60"
            >
              {validatingCart ? "Checking..." : "Checkout"}
              {!validatingCart && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function PriceRow({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className={green ? "font-bold text-emerald-600" : "font-bold"}>
        {value}
      </span>
    </div>
  );
}

function Benefit({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#eadfc9] bg-white p-4 shadow-sm dark:border-[#2f2a22] dark:bg-[#12110e]">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8f1df] text-[#9a7539] dark:bg-[#211c14]">
        {icon}
      </div>
      <h3 className="text-xs font-black">{title}</h3>
      <p className="mt-1 text-[10px] leading-4 text-gray-500 dark:text-gray-400">
        {text}
      </p>
    </div>
  );
}

function DesktopTrustCard({
  icon,
  title,
  text,
  label,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-[#eadfc9] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-[#2f2a22] dark:bg-[#12110e]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f8f1df] text-[#9a7539] dark:bg-[#211c14]">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-black">{title}</h3>
          <p className="mt-1 text-[11px] leading-5 text-gray-500 dark:text-gray-400">
            {text}
          </p>
          <p className="mt-2 text-[10px] font-black text-[#8f6b31] dark:text-[#d6b875]">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <section className="relative overflow-hidden rounded-[26px] border border-[#eadfc9] bg-white px-5 py-14 text-center shadow-[0_18px_55px_rgba(72,52,18,0.06)] dark:border-[#2f2a22] dark:bg-[#12110e] sm:rounded-[30px] sm:px-10 sm:py-24">
      <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-[#b9975b]/10 blur-3xl" />

      <div className="relative mx-auto max-w-md">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#fff9ea] to-[#f3e8cf] text-[#a17a35] dark:from-[#211c14] dark:to-[#19150f]">
          <ShoppingCart className="h-10 w-10" />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f8f1df] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#8f6b31] dark:bg-[#211c14] dark:text-[#d6b875]">
          <Zap className="h-3.5 w-3.5" />
          Ready to shop?
        </div>

        <h2 className="mt-4 text-2xl font-black sm:text-3xl">
          Your cart is waiting
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
          Discover products you&apos;ll love and start building your cart.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8f6b31] to-[#b9975b] px-6 py-3.5 text-sm font-black text-white shadow-lg"
          >
            Explore Products
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/dashboard/categories"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9c7a4] bg-white px-6 py-3.5 text-sm font-black text-[#8f6b31] dark:border-[#443823] dark:bg-[#171512] dark:text-[#d6b875]"
          >
            Browse Categories
          </Link>
        </div>
      </div>
    </section>
  );
}

function CartLoading() {
  return (
    <main className="min-h-screen bg-[#faf8f3] dark:bg-[#0c0b09]">
      <div className="border-b border-[#eadfc9] bg-white dark:border-[#2f2a22] dark:bg-[#12110e]">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-[#eee6d8] dark:bg-[#252118]" />
            <div className="h-7 w-28 animate-pulse rounded-lg bg-[#eee6d8] dark:bg-[#252118]" />
          </div>
          <div className="h-9 w-20 animate-pulse rounded-full bg-[#eee6d8] dark:bg-[#252118]" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 h-44 animate-pulse rounded-[28px] bg-white dark:bg-[#12110e]" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-2xl bg-white dark:bg-[#12110e]" />
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-52 animate-pulse rounded-2xl bg-white dark:bg-[#12110e]"
              />
            ))}
          </div>

          <div className="h-[520px] animate-pulse rounded-2xl bg-white dark:bg-[#12110e]" />
        </div>
      </div>
    </main>
  );
}
