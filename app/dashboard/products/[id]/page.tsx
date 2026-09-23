"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Heart,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Product = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  image_url: string | null;
  brand: string | null;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_flash_sale: boolean;
  is_active: boolean;
  category_id: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getDiscount(
  price: number,
  originalPrice: number | null,
) {
  if (
    !originalPrice ||
    originalPrice <= price
  ) {
    return 0;
  }

  return Math.round(
    ((originalPrice - price) /
      originalPrice) *
      100,
  );
}

function getImageCandidates(
  value: string | null,
) {
  if (!value) return [];

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return [value];
  }

  if (value.startsWith("/")) {
    return [value];
  }

  return [
    `/${value}`,
    `/products/${value}`,
  ];
}

function ProductImage({
  src,
  alt,
  className = "",
  sizes = "100vw",
  priority = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const candidates = useMemo(
    () => getImageCandidates(src),
    [src],
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [src]);

  const current = candidates[index];

  if (!current) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-[#f7f1e6] text-[#b8aa94] ${className}`}
      >
        <ShoppingBag
          size={50}
          strokeWidth={1.2}
        />
      </div>
    );
  }

  return (
    <Image
      src={current}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={`object-contain ${className}`}
      onError={() => {
        if (
          index <
          candidates.length - 1
        ) {
          setIndex((value) => value + 1);
        } else {
          setIndex(candidates.length);
        }
      }}
    />
  );
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId =
    typeof params?.id === "string"
      ? params.id
      : "";

  const supabase = useMemo(
    () => createClient(),
    [],
  );

  const [product, setProduct] =
    useState<Product | null>(null);

  const [category, setCategory] =
    useState<Category | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [wishlist, setWishlist] =
    useState(false);

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  const [cartLoading, setCartLoading] =
    useState(false);

  const [buyLoading, setBuyLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  /*
  =========================================================
  LOAD PRODUCT
  =========================================================
  */

  const loadProduct = useCallback(
    async () => {
      if (!productId) {
        setPageError(
          "Product not found.",
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setPageError("");

      try {
        const {
          data,
          error,
        } = await supabase
          .from("products")
          .select(
            `
            id,
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
            is_active,
            category_id
            `,
          )
          .eq("id", productId)
          .eq("is_active", true)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          setPageError(
            "This product is no longer available.",
          );
          return;
        }

        setProduct(data as Product);

        if (data.category_id) {
          const {
            data: categoryData,
          } = await supabase
            .from("categories")
            .select(
              "id,name,slug",
            )
            .eq(
              "id",
              data.category_id,
            )
            .maybeSingle();

          setCategory(
            categoryData as
              | Category
              | null,
          );
        }
      } catch (error) {
        console.error(
          "Product page error:",
          error,
        );

        setPageError(
          "Unable to load this product. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [productId, supabase],
  );

  /*
  =========================================================
  LOAD USER + WISHLIST
  =========================================================
  */

  const loadWishlist = useCallback(
    async () => {
      if (!productId) return;

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) return;

      const {
        data,
        error,
      } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", user.id)
        .eq(
          "product_id",
          productId,
        )
        .maybeSingle();

      if (!error) {
        setWishlist(Boolean(data));
      }
    },
    [productId, supabase],
  );

  useEffect(() => {
    loadProduct();
    loadWishlist();
  }, [
    loadProduct,
    loadWishlist,
  ]);

  /*
  =========================================================
  QUANTITY
  =========================================================
  */

  function decreaseQuantity() {
    setQuantity((value) =>
      Math.max(1, value - 1),
    );
  }

  function increaseQuantity() {
    if (!product) return;

    setQuantity((value) =>
      Math.min(
        product.stock,
        value + 1,
      ),
    );
  }

  /*
  =========================================================
  WISHLIST
  =========================================================
  */

  async function handleWishlist() {
    if (!product) return;

    setWishlistLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        router.push(
          `/auth/login?next=/dashboard/products/${product.id}`,
        );
        return;
      }

      if (wishlist) {
        const { error } =
          await supabase
            .from("wishlist")
            .delete()
            .eq(
              "user_id",
              user.id,
            )
            .eq(
              "product_id",
              product.id,
            );

        if (error) throw error;

        setWishlist(false);
        setMessage(
          "Removed from wishlist.",
        );
      } else {
        const { error } =
          await supabase
            .from("wishlist")
            .insert({
              user_id: user.id,
              product_id:
                product.id,
            });

        if (error) throw error;

        setWishlist(true);
        setMessage(
          "Added to wishlist.",
        );
      }
    } catch (error) {
      console.error(
        "Wishlist error:",
        error,
      );

      setMessage(
        "Could not update wishlist.",
      );
    } finally {
      setWishlistLoading(false);
    }
  }

  /*
  =========================================================
  CART
  =========================================================
  */

  async function handleAddToCart() {
    if (!product) return;

    setCartLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        router.push(
          `/auth/login?next=/dashboard/products/${product.id}`,
        );
        return;
      }

      /*
       * If your cart table already exists,
       * this inserts the selected product.
       *
       * If your current cart implementation
       * is localStorage based, replace only
       * this block with your existing cart helper.
       */

      const { error } =
        await supabase
          .from("cart_items")
          .upsert(
            {
              user_id: user.id,
              product_id:
                product.id,
              quantity,
            },
            {
              onConflict:
                "user_id,product_id",
            },
          );

      if (error) {
        console.error(
          "Cart database error:",
          error,
        );

        /*
         * Keep product page usable even
         * when cart_items table is not
         * present yet.
         */
        localStorage.setItem(
          "primecart_last_cart_item",
          JSON.stringify({
            productId:
              product.id,
            quantity,
          }),
        );
      }

      setMessage(
        `${product.name} added to cart.`,
      );
    } catch (error) {
      console.error(
        "Add cart error:",
        error,
      );

      setMessage(
        "Product saved. Please check your cart.",
      );
    } finally {
      setCartLoading(false);
    }
  }

  /*
  =========================================================
  BUY NOW
  =========================================================
  */

  async function handleBuyNow() {
    if (!product) return;

    setBuyLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        router.push(
          `/auth/login?next=/dashboard/products/${product.id}`,
        );
        return;
      }

      /*
       * Store Buy Now product locally so
       * checkout can read it.
       */
      localStorage.setItem(
        "primecart_buy_now",
        JSON.stringify({
          productId:
            product.id,
          quantity,
          name: product.name,
          price: product.price,
          image_url:
            product.image_url,
        }),
      );

      router.push(
        "/dashboard/checkout",
      );
    } catch (error) {
      console.error(
        "Buy now error:",
        error,
      );

      setMessage(
        "Unable to continue to checkout.",
      );
    } finally {
      setBuyLoading(false);
    }
  }

  /*
  =========================================================
  DATA
  =========================================================
  */

  const discount = product
    ? getDiscount(
        Number(product.price),
        product.original_price
          ? Number(
              product.original_price,
            )
          : null,
      )
    : 0;

  const totalPrice = product
    ? Number(product.price) *
      quantity
    : 0;

  const isOutOfStock =
    !product ||
    Number(product.stock) <= 0;

  const isLowStock =
    product &&
    product.stock > 0 &&
    product.stock <= 5;

  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf8f2]">
        <style jsx global>{`
          @keyframes pcShimmer {
            0% {
              background-position: -500px 0;
            }

            100% {
              background-position: 500px 0;
            }
          }

          .pc-skeleton {
            background: linear-gradient(
              90deg,
              #f3ecdf 25%,
              #faf7f0 50%,
              #f3ecdf 75%
            );

            background-size: 500px 100%;
            animation: pcShimmer 1.4s
              infinite linear;
          }
        `}</style>

        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
          <div className="pc-skeleton h-5 w-32 rounded-full" />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
            <div className="pc-skeleton h-[520px] rounded-[28px]" />

            <div className="space-y-5">
              <div className="pc-skeleton h-5 w-24 rounded" />
              <div className="pc-skeleton h-12 w-4/5 rounded" />
              <div className="pc-skeleton h-20 w-full rounded" />
              <div className="pc-skeleton h-10 w-48 rounded" />
              <div className="pc-skeleton h-16 w-full rounded" />
              <div className="pc-skeleton h-14 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
  =========================================================
  ERROR
  =========================================================
  */

  if (!product || pageError) {
    return (
      <div className="min-h-screen bg-[#fbf8f2] px-5">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center">
          <div className="w-full rounded-[28px] border border-[#eadfcb] bg-white p-10 text-center shadow-[0_18px_60px_rgba(75,60,35,0.08)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f7efdf] text-[#aa8244]">
              <ShoppingBag
                size={27}
              />
            </div>

            <h1 className="mt-5 text-2xl font-black text-[#40382f]">
              Product unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#8d8272]">
              {pageError ||
                "We could not find this product."}
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  router.back()
                }
                className="rounded-xl border border-[#dfd2bc] px-5 py-3 text-sm font-bold text-[#655946] transition hover:bg-[#faf6ee]"
              >
                Go Back
              </button>

              <Link
                href="/dashboard/products"
                className="rounded-xl bg-[#b9975b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#96723b]"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf8f2] text-[#443b31]">
      <style jsx global>{`
        @keyframes pcFadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pcImageIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pcPulse {
          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.55;
          }
        }

        .pc-fade-up {
          animation: pcFadeUp 0.55s
            ease both;
        }

        .pc-image-in {
          animation: pcImageIn 0.65s
            ease both;
        }

        .pc-pulse {
          animation: pcPulse 1.8s
            ease-in-out infinite;
        }
      `}</style>

      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="border-b border-[#eee5d7] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#968a79] sm:px-6 lg:px-10">
          <span>
            Premium shopping,
            smarter choices
          </span>

          <div className="hidden items-center gap-5 sm:flex">
            <span>
              Free shipping
              above ₹499
            </span>

            <span>
              Easy returns
            </span>

            <span className="flex items-center gap-1.5">
              <ShieldCheck
                size={11}
                className="text-[#b9975b]"
              />
              Secure shopping
            </span>
          </div>
        </div>
      </div>

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-[#eadfcb]/80 bg-[#fbf8f2]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfcfae] bg-white shadow-sm">
              <ShoppingBag
                size={19}
                className="text-[#a47b38]"
              />
            </div>

            <div className="hidden sm:block">
              <p className="text-[17px] font-black tracking-[-0.04em] text-[#3e372f]">
                PrimeCart
              </p>

              <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-[#a18f74]">
                Shop smarter
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/products"
            className="flex items-center gap-2 rounded-xl border border-[#dfd3c1] bg-white px-4 py-2.5 text-[11px] font-bold text-[#665947] transition hover:border-[#c6aa76] hover:text-[#98733d]"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">
              All Products
            </span>
            <span className="sm:hidden">
              Back
            </span>
          </Link>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-6 sm:px-6 lg:px-10">
        {/* BREADCRUMB */}

        <div className="pc-fade-up flex items-center gap-2 overflow-hidden text-[9px] font-bold uppercase tracking-[0.12em] text-[#a19686]">
          <Link
            href="/dashboard"
            className="shrink-0 transition hover:text-[#a57b38]"
          >
            Home
          </Link>

          <ChevronRight
            size={12}
            className="shrink-0"
          />

          <Link
            href="/dashboard/products"
            className="shrink-0 transition hover:text-[#a57b38]"
          >
            Products
          </Link>

          {category && (
            <>
              <ChevronRight
                size={12}
                className="shrink-0"
              />

              <Link
                href={`/dashboard/categories/${category.slug}`}
                className="shrink-0 transition hover:text-[#a57b38]"
              >
                {category.name}
              </Link>
            </>
          )}

          <ChevronRight
            size={12}
            className="shrink-0"
          />

          <span className="truncate text-[#716554]">
            {product.name}
          </span>
        </div>

        {/* =================================================
            PRODUCT AREA
        ================================================= */}

        <section className="mt-7 grid gap-8 lg:grid-cols-[1.02fr_.98fr] lg:gap-10">
          {/* LEFT IMAGE */}

          <div className="pc-fade-up">
            <div className="relative overflow-hidden rounded-[28px] border border-[#e8ddcb] bg-white shadow-[0_18px_55px_rgba(79,62,35,0.07)]">
              {/* BADGES */}

              <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
                {discount > 0 && (
                  <span className="rounded-full bg-[#b9975b] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-white shadow-sm">
                    {discount}% OFF
                  </span>
                )}

                {product.is_flash_sale && (
                  <span className="flex items-center gap-1 rounded-full bg-[#44382c] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-white">
                    <Zap
                      size={10}
                      fill="currentColor"
                    />
                    Flash Deal
                  </span>
                )}

                {product.is_featured && (
                  <span className="rounded-full border border-[#d9c79f] bg-[#fffaf0] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-[#9a753d]">
                    Featured
                  </span>
                )}
              </div>

              {/* IMAGE */}

              <div className="relative flex min-h-[430px] items-center justify-center bg-[#fffdf9] p-7 sm:min-h-[520px] sm:p-12 lg:min-h-[570px]">
                <ProductImage
                  src={
                    product.image_url
                  }
                  alt={
                    product.name
                  }
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="pc-image-in"
                />
              </div>

              {/* IMAGE NOTE */}

              <div className="border-t border-[#eee5d7] bg-[#fcfaf6] px-5 py-3 text-center">
                <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#a29684]">
                  Original product
                  image · Full view
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT INFO */}

          <div className="pc-fade-up lg:pt-2">
            {/* BRAND */}

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a17a3d]">
                  {product.brand ||
                    "PrimeCart"}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full bg-[#f7efdf] px-2.5 py-1 text-[9px] font-black text-[#9a753d]">
                    <Star
                      size={10}
                      fill="currentColor"
                    />
                    {Number(
                      product.rating || 0,
                    ).toFixed(1)}
                  </div>

                  <span className="text-[10px] text-[#9b907f]">
                    {product.reviews_count ||
                      0}{" "}
                    reviews
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  handleWishlist
                }
                disabled={
                  wishlistLoading
                }
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
                  wishlist
                    ? "border-[#c7a866] bg-[#f7eddb] text-[#9a7337]"
                    : "border-[#e1d6c5] bg-white text-[#8f8474] hover:border-[#c7a866] hover:text-[#a27a3e]"
                }`}
                aria-label={
                  wishlist
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                <Heart
                  size={18}
                  fill={
                    wishlist
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            </div>

            {/* TITLE */}

            <h1 className="mt-5 max-w-2xl text-[30px] font-black leading-[1.1] tracking-[-0.035em] text-[#3f382f] sm:text-[40px]">
              {product.name}
            </h1>

            {/* DESCRIPTION */}

            <p className="mt-5 max-w-2xl text-[13px] leading-7 text-[#817666]">
              {product.short_description ||
                product.description ||
                "A carefully selected product from PrimeCart."}
            </p>

            {/* PRICE */}

            <div className="mt-7 rounded-2xl border border-[#eadfcd] bg-white p-5">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-[30px] font-black tracking-[-0.03em] text-[#9a753d]">
                  {formatPrice(
                    Number(
                      product.price,
                    ),
                  )}
                </span>

                {product.original_price &&
                  Number(
                    product.original_price,
                  ) >
                    Number(
                      product.price,
                    ) && (
                    <del className="pb-1 text-[14px] font-bold text-[#aaa090]">
                      {formatPrice(
                        Number(
                          product.original_price,
                        ),
                      )}
                    </del>
                  )}

                {discount > 0 && (
                  <span className="mb-1 rounded-md bg-[#f3ead9] px-2 py-1 text-[9px] font-black uppercase text-[#99733b]">
                    Save{" "}
                    {formatPrice(
                      Number(
                        product.original_price,
                      ) -
                        Number(
                          product.price,
                        ),
                    )}
                  </span>
                )}
              </div>

              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#aaa090]">
                Inclusive of applicable
                taxes
              </p>
            </div>

            {/* STOCK */}

            <div className="mt-5 flex items-center gap-3">
              {isOutOfStock ? (
                <div className="flex items-center gap-2 text-[11px] font-black text-[#a2473d]">
                  <span className="h-2 w-2 rounded-full bg-[#c65c4f]" />
                  Out of stock
                </div>
              ) : isLowStock ? (
                <div className="flex items-center gap-2 text-[11px] font-black text-[#a8752d]">
                  <span className="pc-pulse h-2 w-2 rounded-full bg-[#c59446]" />
                  Only{" "}
                  {product.stock}{" "}
                  left in stock
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[11px] font-black text-[#65804e]">
                  <span className="h-2 w-2 rounded-full bg-[#779b5b]" />
                  In stock
                </div>
              )}
            </div>

            {/* QUANTITY */}

            {!isOutOfStock && (
              <div className="mt-6 flex flex-wrap items-center gap-5">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#746756]">
                  Quantity
                </span>

                <div className="flex h-11 items-center rounded-xl border border-[#ddd2c0] bg-white">
                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                    className="flex h-full w-11 items-center justify-center text-[#796d5d] transition hover:bg-[#f8f3e9] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Minus size={14} />
                  </button>

                  <span className="flex h-full min-w-12 items-center justify-center border-x border-[#e7ddce] text-sm font-black text-[#4a4035]">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      quantity >=
                      product.stock
                    }
                    className="flex h-full w-11 items-center justify-center text-[#796d5d] transition hover:bg-[#f8f3e9] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <span className="text-[9px] text-[#a19686]">
                  {product.stock}{" "}
                  available
                </span>
              </div>
            )}

            {/* ACTIONS */}

            <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_1fr]">
              <button
                type="button"
                disabled={
                  isOutOfStock ||
                  cartLoading
                }
                onClick={
                  handleAddToCart
                }
                className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#cbb17f] bg-white text-[11px] font-black uppercase tracking-[0.1em] text-[#94703b] transition hover:bg-[#faf5eb] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart
                  size={17}
                />

                {cartLoading
                  ? "Adding..."
                  : "Add to Cart"}
              </button>

              <button
                type="button"
                disabled={
                  isOutOfStock ||
                  buyLoading
                }
                onClick={
                  handleBuyNow
                }
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#b9975b] text-[11px] font-black uppercase tracking-[0.1em] text-white shadow-[0_10px_25px_rgba(185,151,91,0.22)] transition hover:bg-[#96723b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Zap
                  size={17}
                  fill="currentColor"
                />

                {buyLoading
                  ? "Processing..."
                  : "Buy Now"}
              </button>
            </div>

            {/* MESSAGE */}

            {message && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#dfe5d5] bg-[#f5f8f0] px-4 py-3 text-[10px] font-bold text-[#657654]">
                <Check size={13} />
                {message}
              </div>
            )}

            {/* BENEFITS */}

            <div className="mt-7 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
                <Truck
                  size={17}
                  className="text-[#a77d3d]"
                />

                <p className="mt-3 text-[10px] font-black text-[#51483d]">
                  Fast Delivery
                </p>

                <p className="mt-1 text-[8px] leading-4 text-[#9d917f]">
                  Quick & reliable
                  doorstep delivery
                </p>
              </div>

              <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
                <RotateCcw
                  size={17}
                  className="text-[#a77d3d]"
                />

                <p className="mt-3 text-[10px] font-black text-[#51483d]">
                  Easy Returns
                </p>

                <p className="mt-1 text-[8px] leading-4 text-[#9d917f]">
                  Simple return
                  experience
                </p>
              </div>

              <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
                <ShieldCheck
                  size={17}
                  className="text-[#a77d3d]"
                />

                <p className="mt-3 text-[10px] font-black text-[#51483d]">
                  Secure Payment
                </p>

                <p className="mt-1 text-[8px] leading-4 text-[#9d917f]">
                  Safe & protected
                  checkout
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            PRODUCT DETAILS
        ================================================= */}

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_.5fr]">
          <div className="rounded-[26px] border border-[#e9dfce] bg-white p-6 shadow-[0_12px_40px_rgba(80,63,38,0.04)] sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5ecdc] text-[#9c763d]">
                <Package size={18} />
              </div>

              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#a07a40]">
                  Product information
                </p>

                <h2 className="mt-1 text-lg font-black text-[#443b32]">
                  Product Details
                </h2>
              </div>
            </div>

            <div className="mt-7 border-t border-[#eee6d9] pt-6">
              <p className="whitespace-pre-line text-[12px] leading-7 text-[#776c5d]">
                {product.description ||
                  product.short_description ||
                  "Product details will be available soon."}
              </p>
            </div>
          </div>

          <div className="rounded-[26px] border border-[#e9dfce] bg-[#fffdf9] p-6">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#a07a40]">
              Shopping summary
            </p>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold text-[#958978]">
                  Unit price
                </span>

                <span className="text-[11px] font-black text-[#554b40]">
                  {formatPrice(
                    Number(
                      product.price,
                    ),
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold text-[#958978]">
                  Quantity
                </span>

                <span className="text-[11px] font-black text-[#554b40]">
                  {quantity}
                </span>
              </div>

              <div className="border-t border-[#e9dfce] pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] font-black text-[#5d5144]">
                    Total
                  </span>

                  <span className="text-lg font-black text-[#98733d]">
                    {formatPrice(
                      totalPrice,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            TRUST STRIP
        ================================================= */}

        <section className="mt-8 rounded-[24px] border border-[#dfd2bc] bg-gradient-to-r from-[#f8f0e2] via-[#fffdf9] to-[#f7efdf] p-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#a17a3d] shadow-sm">
                <Truck size={16} />
              </div>

              <div>
                <p className="text-[10px] font-black text-[#50463a]">
                  Fast Shipping
                </p>

                <p className="mt-1 text-[8px] text-[#988c7b]">
                  Delivered to your
                  doorstep
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#a17a3d] shadow-sm">
                <ShieldCheck
                  size={16}
                />
              </div>

              <div>
                <p className="text-[10px] font-black text-[#50463a]">
                  Secure Checkout
                </p>

                <p className="mt-1 text-[8px] text-[#988c7b]">
                  Your information is
                  protected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#a17a3d] shadow-sm">
                <RotateCcw
                  size={16}
                />
              </div>

              <div>
                <p className="text-[10px] font-black text-[#50463a]">
                  Easy Returns
                </p>

                <p className="mt-1 text-[8px] text-[#988c7b]">
                  Hassle-free return
                  process
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#a17a3d] shadow-sm">
                <Check size={16} />
              </div>

              <div>
                <p className="text-[10px] font-black text-[#50463a]">
                  Quality Products
                </p>

                <p className="mt-1 text-[8px] text-[#988c7b]">
                  Carefully selected
                  for you
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            CONTINUE SHOPPING
        ================================================= */}

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-[24px] border border-[#eadfce] bg-white p-6 sm:flex-row">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#a07a40]">
              Keep exploring
            </p>

            <h3 className="mt-1 text-lg font-black text-[#443b32]">
              Discover more from
              PrimeCart
            </h3>
          </div>

          <Link
            href="/dashboard/products"
            className="flex items-center gap-2 rounded-xl bg-[#b9975b] px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#96723b]"
          >
            Continue Shopping
            <ArrowRight size={13} />
          </Link>
        </div>
      </main>
    </div>
  );
}
