
"use client";

// -------------------- CATEGORY PAGE STYLES --------------------
// सर्व visual styles categories.css मधून येतात.
import "./categories.css";

// -------------------- IMPORTS --------------------

// Next.js navigation आणि client-side navigation.
import Link from "next/link";
import { useRouter } from "next/navigation";

// React hooks.
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

// Animations.
import { motion, type Variants } from "framer-motion";

// Icons.
import {
  ArrowRight,
  BarChart3,
  Baby,
  Car,
  CheckCircle2,
  Eye,
  Footprints,
  Gamepad2,
  Heart,
  Home,
  Layers3,
  Menu,
  Package,
  Search,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  WashingMachine,
  Watch,
  X,
  Zap,
} from "lucide-react";

// Existing Supabase client — project connection कायम.
import { createClient } from "@/lib/supabase/client";

// -------------------- TYPES --------------------

// Category च्या नावापासून image, slug आणि keywords पर्यंतची माहिती.
type Category = {
  name: string;
  slug: string;
  description: string;
  icon: React.ElementType;
  image: string;
  keywords: string[];
};

// Supabase products table मधून वापरली जाणारी fields.
type Product = {
  id: string;
  category_id: string | null;
  name: string;
  image_url: string | null;
  price: number | null;
  original_price?: number | null;
  rating: number | null;
  stock?: number | null;
  is_flash_sale: boolean | null;
  category_slug?: string;
};

// एका category चे सर्व calculated statistics.
type CategoryStats = {
  products: Product[];
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  flashDeals: number;
  averageRating: number;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  discountPercentage: number;
};

// -------------------- CATEGORY MASTER DATA --------------------
// महत्त्वाचे: प्रत्येक slug हा database मधील categories.slug शी
// match झाला पाहिजे. Slug वेगळा असल्यास count चुकीचा दिसू शकतो.

const categories: Category[] = [
  {
    name: "Home & Living",
    slug: "home-living",
    description:
      "Furniture, decor, kitchen essentials and everyday products for a better home.",
    icon: Home,
    image: "/home.png",
    keywords: ["home", "living", "furniture", "decor", "kitchen"],
  },
  {
    name: "Mobiles",
    slug: "mobiles",
    description:
      "Smartphones, accessories and mobile essentials for everyday connectivity.",
    icon: Smartphone,
    image: "/mobiles.png",
    keywords: ["mobile", "phone", "smartphone", "electronics"],
  },
  {
    name: "Appliances",
    slug: "appliances",
    description:
      "Smart appliances designed to make everyday tasks easier and faster.",
    icon: WashingMachine,
    image: "/appliances.png",
    keywords: ["appliance", "air fryer", "kitchen", "electric"],
  },
  {
    name: "Footwear",
    slug: "footwear",
    description:
      "Sneakers, running shoes, sandals and footwear for every occasion.",
    icon: Footprints,
    image: "/footware.png",
    keywords: ["footwear", "shoes", "sneakers", "running"],
  },
  {
    name: "Watch",
    slug: "watch",
    description:
      "Classic watches and smart timepieces designed for every style.",
    icon: Watch,
    image: "/watch.png",
    keywords: ["watch", "smartwatch", "time", "accessories"],
  },
  {
    name: "Bag",
    slug: "bag",
    description:
      "Backpacks, handbags, travel bags and everyday carry essentials.",
    icon: ShoppingBag,
    image: "/bag.png",
    keywords: ["bag", "backpack", "travel", "handbag"],
  },
  {
    name: "Toy & Baby",
    slug: "toy-baby",
    description:
      "Toys, baby products and thoughtful essentials for little ones.",
    icon: Baby,
    image: "/toy.png",
    keywords: ["toy", "baby", "kids", "children"],
  },
  {
    name: "Automotive",
    slug: "automotive",
    description:
      "Useful car and bike accessories for safer and smarter journeys.",
    icon: Car,
    image: "/automative.png",
    keywords: ["car", "bike", "automotive", "vehicle"],
  },
  {
    name: "Fashion",
    slug: "fashion",
    description:
      "Clothing and lifestyle essentials designed around your style.",
    icon: Shirt,
    image: "/fashion.png",
    keywords: ["fashion", "clothing", "shirt", "jacket"],
  },
  {
    name: "Gaming",
    slug: "gaming",
    description:
      "Gaming accessories, gear and entertainment essentials.",
    icon: Gamepad2,
    image: "/gaming.png",
    keywords: ["gaming", "game", "console", "accessories"],
  },
  {
    name: "Sports & Outdoor",
    slug: "sports-outdoor",
    description:
      "Sports equipment, fitness gear, outdoor adventure and active lifestyle essentials.",
    icon: Footprints,
    image: "/sports-outdoor.png",
    keywords: [
      "sports",
      "outdoor",
      "fitness",
      "gym",
      "cricket",
      "football",
      "badminton",
      "cycling",
      "camping",
      "exercise",
    ],
  },
  {
    name: "Eyewear",
    slug: "eyewear",
    description:
      "Sunglasses, eyeglasses and stylish eyewear for everyday comfort and protection.",
    icon: Eye,
    image: "/eyeware.png",
    keywords: [
      "eyewear",
      "glasses",
      "sunglasses",
      "spectacles",
      "frames",
      "optical",
    ],
  },
  {
    name: "Books",
    slug: "books",
    description:
      "Bestsellers, educational books, fiction, non-fiction and books for every reader.",
    icon: Layers3,
    image: "/books.png",
    keywords: [
      "books",
      "book",
      "fiction",
      "non-fiction",
      "education",
      "novels",
      "reading",
    ],
  },
  {
    name: "Beauty",
    slug: "beauty",
    description:
      "Skincare, makeup, haircare, fragrances and everyday beauty essentials.",
    icon: Sparkles,
    image: "/beauty.png",
    keywords: [
      "beauty",
      "skincare",
      "makeup",
      "cosmetics",
      "haircare",
      "fragrance",
      "personal care",
    ],
  },
  {
    name: "Electronics",
    slug: "electronics",
    description:
      "Smart electronics, audio devices, accessories and everyday tech essentials.",
    icon: Smartphone,
    image: "/electronics.png",
    keywords: [
      "electronics",
      "electronic",
      "gadgets",
      "audio",
      "speaker",
      "headphones",
      "tech",
      "accessories",
    ],
  },
];

// -------------------- ANIMATION CONFIGURATION --------------------
// Framer Motion animation reusable variants.

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045 },
  },
};

// -------------------- HELPER FUNCTIONS --------------------

// Product image path normalize करतो.
// Database मध्ये filename किंवा /filename दोन्ही चालतात.
function getImage(src?: string | null) {
  if (!src?.trim()) return "/logo.png";

  const value = src.trim();

  if (
    value.startsWith("/") ||
    /^https?:\/\//i.test(value)
  ) {
    return value;
  }

  return `/${value}`;
}

// Indian Rupee format.
function money(value: number | null | undefined) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

// Null, undefined किंवा invalid number सुरक्षितपणे 0 करतो.
function safeNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

// localStorage मधून array safely read करतो.
function readStoredArray(key: string): string[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(key) || "[]",
    );

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is string => typeof item === "string",
    );
  } catch {
    return [];
  }
}

// -------------------- MAIN PAGE --------------------

export default function CategoriesPage() {
  // Existing Supabase connection.
  const supabase = useMemo(() => createClient(), []);

  // Next.js programmatic navigation.
  const router = useRouter();

  // Database मधून load झालेली active products list.
  const [products, setProducts] = useState<Product[]>([]);

  // Loading state.
  const [loading, setLoading] = useState(true);

  // Search, filter आणि sorting states.
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("recommended");

  // Mobile filter drawer visibility.
  const [showMobileFilters, setShowMobileFilters] =
    useState(false);

  // Eye/Quick Preview modal साठी selected category.
  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  // Recently viewed categories.
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  // Wishlisted category slugs.
  const [wishlistCategories, setWishlistCategories] =
    useState<string[]>([]);

  // -------------------- LOAD LOCAL PREFERENCES --------------------
  // Recent categories आणि category wishlist localStorage मध्ये असतात.
  useEffect(() => {
    setRecentSlugs(
      readStoredArray("primecart_recent_categories"),
    );

    setWishlistCategories(
      readStoredArray("primecart_category_wishlist"),
    );
  }, []);

  // -------------------- LOAD PRODUCTS FROM SUPABASE --------------------
  // FIX: Supabase मधील response limit मुळे products कमी मिळू नयेत
  // म्हणून range() वापरून batches मध्ये records आणतो.
  //
  // येथे is_active = true मुद्दाम कायम आहे.
  // त्यामुळे inactive products category count मध्ये येणार नाहीत.
  //
  // categories!inner(slug) मुळे संबंधित category चा slug मिळतो.
  // --------------------

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);

      try {
        const pageSize = 1000;
        let from = 0;
        const allRows: any[] = [];

        while (true) {
          const { data, error } = await supabase
            .from("products")
            .select(`
              id,
              category_id,
              name,
              image_url,
              price,
              original_price,
              rating,
              stock,
              is_flash_sale,
              categories!inner (
                slug
              )
            `)
            .eq("is_active", true)
            .order("id", { ascending: true })
            .range(from, from + pageSize - 1);

          if (error) {
            throw error;
          }

          const batch = data ?? [];

          allRows.push(...batch);

          // शेवटचा batch मिळाल्यावर loop थांबतो.
          if (batch.length < pageSize) {
            break;
          }

          from += pageSize;
        }

        // Duplicate IDs आल्यास एकच record ठेवतो.
        const uniqueRows = Array.from(
          new Map(
            allRows.map((item) => [String(item.id), item]),
          ).values(),
        );

        // Supabase response आपल्या Product type मध्ये convert करतो.
        const mappedProducts: Product[] = uniqueRows.map(
          (item: any) => ({
            id: String(item.id),
            category_id:
              item.category_id == null
                ? null
                : String(item.category_id),
            name: item.name,
            image_url: item.image_url,
            price: item.price,
            original_price: item.original_price,
            rating: item.rating,
            stock: item.stock,
            is_flash_sale: item.is_flash_sale,
            category_slug: Array.isArray(item.categories)
              ? item.categories[0]?.slug
              : item.categories?.slug,
          }),
        );

        if (active) {
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error(
          "PrimeCart categories product loading error:",
          error,
        );

        if (active) {
          setProducts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [supabase]);

  // -------------------- CATEGORY-WISE STATISTICS --------------------
  // इथे category slug नुसार products group केले जातात.
  //
  // total          = active products count
  // inStock        = stock 5 पेक्षा जास्त असलेले products
  // lowStock       = stock 1 ते 5 असलेले products
  // outOfStock     = stock 0 किंवा कमी असलेले products
  // flashDeals     = flash sale products
  // averageRating  = average product rating
  // minPrice/maxPrice = category price range
  // --------------------

  const stats = useMemo(() => {
    const output: Record<string, CategoryStats> = {};

    categories.forEach((category) => {
      const list = products.filter(
        (product) =>
          product.category_slug?.trim().toLowerCase() ===
          category.slug.trim().toLowerCase(),
      );

      const inStock = list.filter(
        (product) => safeNumber(product.stock) > 5,
      ).length;

      const lowStock = list.filter((product) => {
        const stock = safeNumber(product.stock);
        return stock > 0 && stock <= 5;
      }).length;

      const outOfStock = list.filter(
        (product) => safeNumber(product.stock) <= 0,
      ).length;

      const flashDeals = list.filter(
        (product) => product.is_flash_sale === true,
      ).length;

      const ratings = list
        .map((product) => safeNumber(product.rating))
        .filter((rating) => rating > 0);

      const prices = list
        .map((product) => safeNumber(product.price))
        .filter((price) => price > 0);

      const discounts = list
        .map((product) => {
          const price = safeNumber(product.price);
          const original = safeNumber(product.original_price);

          if (price <= 0 || original <= price) return 0;

          return ((original - price) / original) * 100;
        })
        .filter((discount) => discount > 0);

      output[category.slug] = {
        // Preview साठी पहिली पाच products.
        products: list.slice(0, 5),

        // पूर्ण list ची count.
        total: list.length,

        inStock,
        lowStock,
        outOfStock,
        flashDeals,

        averageRating: ratings.length
          ? ratings.reduce((a, b) => a + b, 0) /
            ratings.length
          : 0,

        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,

        averagePrice: prices.length
          ? prices.reduce((a, b) => a + b, 0) / prices.length
          : 0,

        discountPercentage: discounts.length
          ? discounts.reduce((a, b) => a + b, 0) /
            discounts.length
          : 0,
      };
    });

    return output;
  }, [products]);

  // -------------------- OVERALL STATISTICS --------------------

  const totalProducts = products.length;

  const totalDeals = products.filter(
    (product) => product.is_flash_sale === true,
  ).length;

  const overallRatings = products
    .map((product) => safeNumber(product.rating))
    .filter((rating) => rating > 0);

  const overallRating = overallRatings.length
    ? overallRatings.reduce((a, b) => a + b, 0) /
      overallRatings.length
    : 0;

  // -------------------- CATEGORY SEARCH, FILTER AND SORT --------------------
  // Search category name, description आणि keywords वर काम करतो.
  // Filters: All, Deals, Top Rated, In Stock.
  // Sorting: product count, rating, deals, price.
  // --------------------

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = categories.filter((category) => {
      if (!query) return true;

      return [
        category.name,
        category.description,
        ...category.keywords,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    if (filter === "Deals") {
      result = result.filter(
        (category) => stats[category.slug]?.flashDeals > 0,
      );
    }

    if (filter === "Top Rated") {
      result = result.filter(
        (category) => stats[category.slug]?.averageRating >= 4,
      );
    }

    if (filter === "In Stock") {
      result = result.filter(
        (category) => stats[category.slug]?.inStock > 0,
      );
    }

    // Recommended sorting मध्ये category order कायम ठेवतो.
    if (sort === "products") {
      result.sort(
        (a, b) =>
          (stats[b.slug]?.total ?? 0) -
          (stats[a.slug]?.total ?? 0),
      );
    }

    if (sort === "rating") {
      result.sort(
        (a, b) =>
          (stats[b.slug]?.averageRating ?? 0) -
          (stats[a.slug]?.averageRating ?? 0),
      );
    }

    if (sort === "deals") {
      result.sort(
        (a, b) =>
          (stats[b.slug]?.flashDeals ?? 0) -
          (stats[a.slug]?.flashDeals ?? 0),
      );
    }

    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          (stats[a.slug]?.minPrice ?? 0) -
          (stats[b.slug]?.minPrice ?? 0),
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) =>
          (stats[b.slug]?.maxPrice ?? 0) -
          (stats[a.slug]?.maxPrice ?? 0),
      );
    }

    return result;
  }, [search, filter, sort, stats]);

  // -------------------- TRENDING CATEGORIES --------------------
  // सर्वाधिक products असलेल्या चार categories.
  const trending = useMemo(
    () =>
      [...categories]
        .sort(
          (a, b) =>
            (stats[b.slug]?.total ?? 0) -
            (stats[a.slug]?.total ?? 0),
        )
        .slice(0, 4),
    [stats],
  );

  // -------------------- RECENTLY VIEWED --------------------
  const recentlyViewed = useMemo(
    () =>
      recentSlugs
        .map((slug) =>
          categories.find((category) => category.slug === slug),
        )
        .filter(Boolean) as Category[],
    [recentSlugs],
  );

  // -------------------- RECOMMENDED CATEGORIES --------------------
  // Recently viewed categories वगळून बाकी categories मधून picks.
  const recommended = useMemo(
    () =>
      [...categories]
        .filter(
          (category) => !recentSlugs.includes(category.slug),
        )
        .sort((a, b) => {
          const score = (slug: string) =>
            (stats[slug]?.averageRating ?? 0) * 2 +
            (stats[slug]?.flashDeals ?? 0) +
            (stats[slug]?.total ?? 0) / 10;

          return score(b.slug) - score(a.slug);
        })
        .slice(0, 4),
    [recentSlugs, stats],
  );

  // -------------------- OPEN CATEGORY --------------------
  // Recent categories update करतो.
  // Full card आणि preview actions मध्ये ही function वापरता येते.
  const openCategory = useCallback(
    (category: Category) => {
      setRecentSlugs((previous) => {
        const updated = [
          category.slug,
          ...previous.filter((slug) => slug !== category.slug),
        ].slice(0, 5);

        try {
          localStorage.setItem(
            "primecart_recent_categories",
            JSON.stringify(updated),
          );
        } catch {
          // Browser storage unavailable असल्यास page चालू राहतो.
        }

        return updated;
      });
    },
    [],
  );

  // -------------------- CATEGORY WISHLIST --------------------
  // Category wishlist browser localStorage मध्ये save होते.
  const toggleCategoryWishlist = useCallback((slug: string) => {
    setWishlistCategories((previous) => {
      const updated = previous.includes(slug)
        ? previous.filter((item) => item !== slug)
        : [...previous, slug];

      try {
        localStorage.setItem(
          "primecart_category_wishlist",
          JSON.stringify(updated),
        );
      } catch {
        // Browser storage unavailable असल्यास ignore.
      }

      return updated;
    });
  }, []);

  // -------------------- NAVIGATE TO CATEGORY --------------------
  // Correct dynamic route: /dashboard/categories/[slug]
  const navigateToCategory = useCallback(
    (category: Category) => {
      openCategory(category);
      setSelectedCategory(null);

      router.push(`/dashboard/categories/${category.slug}`);
    },
    [openCategory, router],
  );

  // ============================================================
  // PAGE UI START
  // ============================================================

  return (
    <main className="pcStyle1">

      {/* -------------------- TOP PROMISE STRIP -------------------- */}
      <div className="pcStyle2">
        <div className="pcStyle3">
          <span className="pcStyle4">
            <CheckCircle2 size={13} />
            Secure Shopping
          </span>
          <span className="pcStyle5">•</span>
          <span className="pcStyle4">
            <Zap size={13} />
            Exclusive Deals
          </span>
          <span className="pcStyle5">•</span>
          <span className="pcStyle4">
            <Package size={13} />
            Easy Returns
          </span>
        </div>
      </div>

      {/* -------------------- STICKY HEADER -------------------- */}
      <header className="pcStyle6">
        <div className="pcStyle7">

          {/* Logo and dashboard navigation. */}
          <Link href="/dashboard" className="pcStyle8">
            <div className="pcStyle9">
              <img
                src="/logo.png"
                alt="PrimeCart"
                className="pcStyle10"
              />
            </div>
            <div>
              <div className="pcStyle11">
                Prime<span className="pcStyle12">Cart</span>
              </div>
              <div className="pcStyle13">
                Shop Smarter
              </div>
            </div>
          </Link>

          {/* Desktop navigation. */}
          <nav className="pcStyle14">
            <Link
              href="/dashboard"
              className="pcStyle15"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/products"
              className="pcStyle15"
            >
              Products
            </Link>
            <Link
              href="/dashboard/categories"
              className="pcStyle16"
            >
              Categories
            </Link>
          </nav>

          {/* Shop products and mobile filter button. */}
          <div className="pcStyle17">
            <Link
              href="/dashboard/products"
              className="pcStyle18"
            >
              Shop Products
              <ArrowRight size={15} />
            </Link>

            <button
              type="button"
              aria-label="Open category filters"
              onClick={() => setShowMobileFilters(true)}
              className="pcStyle19"
            >
              <Menu size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* -------------------- PAGE CONTENT CONTAINER -------------------- */}
      <div className="pcStyle20">

        {/* -------------------- BREADCRUMB -------------------- */}
        <div className="pcStyle21">
          <Link href="/dashboard" className="pcStyle22">
            Dashboard
          </Link>
          <span>›</span>
          <span className="pcStyle23">Categories</span>
        </div>

        {/* -------------------- HERO SECTION -------------------- */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="pcStyle24"
        >
          <div className="pcStyle25" />

          <div className="pcStyle26">
            <div>
              <div className="pcStyle27">
                <Sparkles size={13} />
                Smart Shopping
              </div>

              <h1 className="pcStyle28">
                Find what you need,
                <span className="pcStyle12"> faster.</span>
              </h1>

              <p className="pcStyle29">
                Explore PrimeCart categories, discover trending products,
                compare deals and find the right products for your needs.
              </p>

              <div className="pcStyle30">
                <Link
                  href="/dashboard/primematch"
                  className="pcStyle31"
                >
                  <Sparkles size={16} />
                  Try PrimeMatch
                </Link>
                <Link
                  href="/dashboard/products"
                  className="pcStyle32"
                >
                  Browse Products
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Overall statistics from loaded products. */}
            <div className="pcStyle33">
              <HeroStat
                icon={<Layers3 size={18} />}
                value={String(categories.length)}
                label="Categories"
              />
              <HeroStat
                icon={<ShoppingBag size={18} />}
                value={loading ? "…" : String(totalProducts)}
                label="Active Products"
              />
              <HeroStat
                icon={<Zap size={18} />}
                value={loading ? "…" : String(totalDeals)}
                label="Live Deals"
              />
              <HeroStat
                icon={<Star size={18} />}
                value={overallRating ? overallRating.toFixed(1) : "—"}
                label="Avg Rating"
              />
            </div>
          </div>
        </motion.section>

        {/* -------------------- SHOP BY INTENT -------------------- */}
        <section className="pcStyle34">
          <SectionHeading
            eyebrow="Shop by intent"
            title="What are you shopping for?"
            description="Start with a goal instead of searching through everything."
          />
          <div className="pcStyle35">
            <IntentCard
              icon={<Gamepad2 size={22} />}
              title="Build a Gaming Setup"
              text="Gaming gear, accessories and essentials."
              href="/dashboard/setup-builder?type=gaming"
            />
            <IntentCard
              icon={<Home size={22} />}
              title="Setup My Home"
              text="Useful products for a smarter home."
              href="/dashboard/setup-builder?type=home"
            />
            <IntentCard
              icon={<Smartphone size={22} />}
              title="Upgrade My Tech"
              text="Mobile, electronics and everyday tech."
              href="/dashboard/categories/mobiles"
            />
            <IntentCard
              icon={<ShoppingBag size={22} />}
              title="Shop Within Budget"
              text="Create a smart shopping plan."
              href="/dashboard/budget-builder"
            />
          </div>
        </section>

        {/* -------------------- TRENDING CATEGORIES -------------------- */}
        <section className="pcStyle36">
          <SectionHeading
            eyebrow="Trending"
            title="Popular categories"
            description="Explore categories with the most active products."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="pcStyle37"
          >
            {trending.map((category) => {
              const stat = stats[category.slug];

              return (
                <motion.div
                  key={category.slug}
                  variants={cardVariants}
                >
                  <Link
                    href={`/dashboard/categories/${category.slug}`}
                    onClick={() => openCategory(category)}
                    className="pcStyle38"
                  >
                    <div className="pcStyle39">
                      <div className="pcStyle40">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="pcStyle41"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/logo.png";
                          }}
                        />
                        {stat?.flashDeals > 0 && (
                          <span className="pcStyle42">
                            ⚡ Deals
                          </span>
                        )}
                      </div>

                      <div className="pcStyle43">
                        <div className="pcStyle44">
                          <h3 className="pcStyle45">
                            {category.name}
                          </h3>
                          <ArrowRight size={14} />
                        </div>

                        <div className="pcStyle46">
                          {stat?.total ?? 0} active products
                        </div>

                        {stat?.averageRating > 0 && (
                          <div className="pcStyle47">
                            <Star size={11} className="pcStyle48" />
                            {stat.averageRating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* -------------------- SEARCH, FILTER AND SORT -------------------- */}
        <section className="pcStyle36">
          <div className="pcStyle49">
            <div className="pcStyle50">
              {/* Category search input. */}
              <div className="pcStyle51">
                <Search
                  size={18}
                  className="pcStyle52"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search categories or shopping needs..."
                  className="pcStyle53"
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                    className="pcStyle54"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Desktop filter buttons. */}
              <div className="pcStyle55">
                {["All", "Deals", "Top Rated", "In Stock"].map((item) => (
                  <FilterButton
                    key={item}
                    active={filter === item}
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </FilterButton>
                ))}
              </div>

              {/* Category sorting dropdown. */}
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="pcStyle56"
              >
                <option value="recommended">Recommended</option>
                <option value="products">Most Products</option>
                <option value="rating">Highest Rated</option>
                <option value="deals">Most Deals</option>
                <option value="price-low">Lowest Starting Price</option>
                <option value="price-high">Highest Price</option>
              </select>
            </div>
          </div>
        </section>

        {/* -------------------- RECENTLY VIEWED CATEGORIES -------------------- */}
        {recentlyViewed.length > 0 && (
          <section className="pcStyle36">
            <SectionHeading
              eyebrow="Continue exploring"
              title="Recently viewed"
              description="Pick up where you left off."
            />
            <div className="pcStyle57">
              {recentlyViewed.map((category) => (
                <MiniCategory
                  key={category.slug}
                  category={category}
                  stats={stats[category.slug]}
                  onOpen={() => navigateToCategory(category)}
                />
              ))}
            </div>
          </section>
        )}

        {/* -------------------- ALL CATEGORY CARDS -------------------- */}
        <section className="pcStyle36">
          <div className="pcStyle58">
            <div className="pcStyle59">
              All Categories
            </div>
            <h2 className="pcStyle60">
              Explore everything
            </h2>
            <p className="pcStyle61">
              {filteredCategories.length} categories available
            </p>
          </div>

          {/* While products load, show skeleton cards. */}
          {loading ? (
            <LoadingGrid />
          ) : filteredCategories.length === 0 ? (
            <EmptyState
              onClear={() => {
                setSearch("");
                setFilter("All");
              }}
            />
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="pcStyle62"
            >
              {filteredCategories.map((category) => (
                <motion.div
                  key={category.slug}
                  variants={cardVariants}
                  className="pcStyle63"
                >
                  <CategoryCard
                    category={category}
                    stats={stats[category.slug]}
                    isWishlisted={wishlistCategories.includes(category.slug)}
                    onWishlist={() => toggleCategoryWishlist(category.slug)}
                    onPreview={() => {
                      openCategory(category);
                      setSelectedCategory(category);
                    }}
                    onExplore={() => navigateToCategory(category)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* -------------------- RECOMMENDED CATEGORIES -------------------- */}
        <section className="pcStyle64">
          <div className="pcStyle65">
            <div className="pcStyle66">
              <div>
                <div className="pcStyle67">
                  <Sparkles size={14} />
                  PrimeCart Picks
                </div>
                <h2 className="pcStyle68">
                  Categories worth exploring
                </h2>
                <p className="pcStyle69">
                  A mix of ratings, products and active deals.
                </p>
              </div>
              <Link
                href="/dashboard/primematch"
                className="pcStyle70"
              >
                Personalize with PrimeMatch
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="pcStyle71">
              {recommended.map((category) => (
                <MiniCategory
                  key={category.slug}
                  category={category}
                  stats={stats[category.slug]}
                  onOpen={() => navigateToCategory(category)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* -------------------- SMART TOOLS -------------------- */}
        <section className="pcStyle72">
          <ToolCard
            icon={<Sparkles size={22} />}
            eyebrow="PrimeMatch"
            title="Tell us what you need."
            description="Get product suggestions based on your needs, priorities and budget."
            href="/dashboard/primematch"
            primary
          />
          <ToolCard
            icon={<BarChart3 size={22} />}
            eyebrow="Budget Builder"
            title="Plan your shopping."
            description="Create a product combination around the amount you want to spend."
            href="/dashboard/budget-builder"
          />
          <ToolCard
            icon={<Gamepad2 size={22} />}
            eyebrow="Setup Builder"
            title="Build your setup."
            description="Create gaming, college, work, fitness or home setups."
            href="/dashboard/setup-builder"
          />
        </section>

        {/* -------------------- FINAL SHOPPING CTA -------------------- */}
        <section className="pcStyle73">
          <div className="pcStyle74">
            <ShoppingBag size={25} />
          </div>
          <h2 className="pcStyle75">
            Ready to start shopping?
          </h2>
          <p className="pcStyle76">
            Explore the complete PrimeCart collection and discover products
            across every category.
          </p>
          <Link
            href="/dashboard/products"
            className="pcStyle77"
          >
            View All Products
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>

      {/* -------------------- MOBILE FILTER DRAWER -------------------- */}
      {showMobileFilters && (
        <div className="pcStyle78">
          <button
            type="button"
            aria-label="Close category filters"
            className="pcStyle79"
            onClick={() => setShowMobileFilters(false)}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="pcStyle80"
          >
            <div className="pcStyle81">
              <div>
                <h3 className="pcStyle82">Filter Categories</h3>
                <p className="pcStyle83">
                  Choose what you want to explore.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="pcStyle84"
              >
                <X size={17} />
              </button>
            </div>

            <div className="pcStyle85">
              {["All", "Deals", "Top Rated", "In Stock"].map((item) => (
                <FilterButton
                  key={item}
                  active={filter === item}
                  onClick={() => {
                    setFilter(item);
                    setShowMobileFilters(false);
                  }}
                >
                  {item}
                </FilterButton>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* -------------------- QUICK PREVIEW MODAL -------------------- */}
      {selectedCategory && (
        <QuickPreview
          category={selectedCategory}
          stats={stats[selectedCategory.slug]}
          onClose={() => setSelectedCategory(null)}
          onWishlist={() =>
            toggleCategoryWishlist(selectedCategory.slug)
          }
          wishlisted={wishlistCategories.includes(selectedCategory.slug)}
          onExplore={() => navigateToCategory(selectedCategory)}
        />
      )}
    </main>
  );
}

// ============================================================
// REUSABLE COMPONENTS
// प्रत्येक component वर त्याचा purpose comment दिलेला आहे.
// ============================================================

// -------------------- HERO STAT CARD --------------------
// Hero मध्ये total categories, products, deals आणि rating दाखवतो.

function HeroStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="pcStyle86">
      <div className="pcStyle87">
        {icon}
      </div>
      <div className="pcStyle88">{value}</div>
      <div className="pcStyle89">
        {label}
      </div>
    </div>
  );
}

// -------------------- SECTION HEADING --------------------
// प्रत्येक major section साठी समान heading layout.

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="pcStyle90">
      <div className="pcStyle59">
        {eyebrow}
      </div>
      <h2 className="pcStyle91">
        {title}
      </h2>
      <p className="pcStyle61">{description}</p>
    </div>
  );
}

// -------------------- SHOPPING INTENT CARD --------------------
// Setup Builder, home setup आणि budget builder साठी shortcut card.

function IntentCard({
  icon,
  title,
  text,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link href={href} className="pcStyle38">
      <div className="pcStyle92">
        <div className="pcStyle93">
          <div className="pcStyle94">
            {icon}
          </div>
          <ArrowRight size={16} className="pcStyle95" />
        </div>
        <h3 className="pcStyle96">{title}</h3>
        <p className="pcStyle97">{text}</p>
      </div>
    </Link>
  );
}

// -------------------- FILTER BUTTON --------------------
// Desktop आणि mobile दोन्हीकडे वापरला जाणारा filter button.

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
        active
          ? "bg-[#fff0c8] text-[#8d681d] ring-1 ring-[#c79a3b]/25"
          : "text-[#786e5e] hover:bg-[#fff8e9]"
      }`}
    >
      {children}
    </button>
  );
}

// -------------------- FULL CATEGORY CARD --------------------
// मुख्य fix:
// Card च्या कोणत्याही रिकाम्या भागावर किंवा माहितीवर क्लिक केल्यास
// category उघडते.
//
// Wishlist आणि Preview buttons मात्र स्वतंत्र काम करतात.
// त्यामुळे त्या buttons वर click केल्यावर category navigation होत नाही.
// --------------------

function CategoryCard({
  category,
  stats,
  isWishlisted,
  onWishlist,
  onPreview,
  onExplore,
}: {
  category: Category;
  stats: CategoryStats;
  isWishlisted: boolean;
  onWishlist: () => void;
  onPreview: () => void;
  onExplore: () => void;
}) {
  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Explore ${category.name}`}
      onClick={onExplore}
      onKeyDown={(event) => {
        // Keyboard focus असताना card Enter/Space ने उघडतो.
        // Inner buttons वर keyboard वापरल्यास त्यांची action चालते.
        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          onExplore();
        }
      }}
      className="pcStyle98"
    >
      {/* CATEGORY IMAGE */}
      <div className="pcStyle99">
        <img
          src={category.image}
          alt={category.name}
          className="pcStyle100"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/logo.png";
          }}
        />

        {/* Category name badge. */}
        <div className="pcStyle101">
          {category.name}
        </div>

        {/* Wishlist is independent from card navigation. */}
        <button
          type="button"
          aria-label={
            isWishlisted
              ? `Remove ${category.name} from wishlist`
              : `Add ${category.name} to wishlist`
          }
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onWishlist();
          }}
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition ${
            isWishlisted
              ? "border-[#c79a3b]/30 bg-[#fff0c8] text-[#a47720]"
              : "border-white/80 bg-white/90 text-[#9c907b] hover:text-[#a47720]"
          }`}
        >
          <Heart
            size={15}
            className={isWishlisted ? "fill-current" : ""}
          />
        </button>

        {/* Live flash deal count. */}
        {stats.flashDeals > 0 && (
          <div className="pcStyle102">
            <Zap size={11} />
            {stats.flashDeals} Live Deals
          </div>
        )}
      </div>

      {/* CATEGORY DESCRIPTION AND STATISTICS */}
      <div className="pcStyle103">
        <h3 className="pcStyle11">
          {category.name}
        </h3>

        <p className="pcStyle104">
          {category.description}
        </p>

        {/* Minimum and maximum product prices. */}
        <div className="pcStyle105">
          <div className="pcStyle106">
            Price range
          </div>
          <div className="pcStyle107">
            {stats.minPrice
              ? `${money(stats.minPrice)} – ${money(stats.maxPrice)}`
              : "Explore products"}
          </div>
        </div>

        {/* Category product count, stock and rating. */}
        <div className="pcStyle108">
          <SmallStat value={stats.total} label="Products" />
          <SmallStat value={stats.inStock} label="In Stock" />
          <SmallStat
            value={
              stats.averageRating
                ? stats.averageRating.toFixed(1)
                : "—"
            }
            label="Rating"
            star
          />
        </div>

        {/* Stock availability and average discount. */}
        <div className="pcStyle109">
          <div className="pcStyle110">
            {stats.lowStock > 0 ? (
              <>
                <span className="pcStyle111" />
                <span className="pcStyle112">
                  Limited stock available
                </span>
              </>
            ) : stats.inStock > 0 ? (
              <>
                <span className="pcStyle113" />
                <span className="pcStyle114">
                  Products available
                </span>
              </>
            ) : (
              <>
                <span className="pcStyle115" />
                <span className="pcStyle116">
                  Check availability
                </span>
              </>
            )}
          </div>

          {stats.discountPercentage > 0 && (
            <span className="pcStyle117">
              ~{Math.round(stats.discountPercentage)}% avg deal
            </span>
          )}
        </div>

        {/* Small product image previews. */}
        {stats.products.length > 0 && (
          <div className="pcStyle118">
            {stats.products.slice(0, 3).map((product) => (
              <div
                key={product.id}
                className="pcStyle119"
              >
                <img
                  src={getImage(product.image_url)}
                  alt={product.name}
                  className="pcStyle120"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/logo.png";
                  }}
                />
              </div>
            ))}
            {stats.products.length > 3 && (
              <span className="pcStyle121">
                +{stats.products.length - 3}
              </span>
            )}
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="pcStyle122">

          {/* Explore button uses the same category route as the card. */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onExplore();
            }}
            className="pcStyle123"
          >
            Explore
            <ArrowRight size={15} />
          </button>

          {/* Preview button opens modal without navigating away. */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPreview();
            }}
            className="pcStyle124"
            title="Quick preview"
            aria-label={`Preview ${category.name}`}
          >
            <Eye size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

// -------------------- SMALL STAT --------------------
// Category card मधील individual statistic.

function SmallStat({
  value,
  label,
  star,
}: {
  value: number | string;
  label: string;
  star?: boolean;
}) {
  return (
    <div className="pcStyle125">
      <div className="pcStyle126">
        {star && (
          <Star size={11} className="pcStyle48" />
        )}
        {value}
      </div>
      <div className="pcStyle127">
        {label}
      </div>
    </div>
  );
}

// -------------------- MINI CATEGORY --------------------
// Recently viewed आणि recommended sections मधील compact card.
// Card click केल्यावर category route उघडतो.

function MiniCategory({
  category,
  stats,
  onOpen,
}: {
  category: Category;
  stats: CategoryStats;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="pcStyle128"
    >
      <div className="pcStyle8">
        <div className="pcStyle129">
          <img
            src={category.image}
            alt={category.name}
            className="pcStyle130"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/logo.png";
            }}
          />
        </div>

        <div className="pcStyle131">
          <h3 className="pcStyle45">
            {category.name}
          </h3>
          <div className="pcStyle132">
            <span>{stats.total} products</span>
            {stats.averageRating > 0 && (
              <>
                <span>•</span>
                <Star size={11} className="pcStyle48" />
                <span>{stats.averageRating.toFixed(1)}</span>
              </>
            )}
          </div>
          {stats.flashDeals > 0 && (
            <div className="pcStyle133">
              {stats.flashDeals} active deals
            </div>
          )}
        </div>

        <ArrowRight
          size={15}
          className="pcStyle134"
        />
      </div>
    </button>
  );
}

// -------------------- SMART TOOL CARD --------------------
// PrimeMatch, Budget Builder आणि Setup Builder shortcuts.

function ToolCard({
  icon,
  eyebrow,
  title,
  description,
  href,
  primary,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  primary?: boolean;
}) {
  return (
    <div
      className={`rounded-[26px] border p-6 ${
        primary
          ? "border-[#eadfc9] bg-gradient-to-br from-[#fffaf0] to-[#f8efd9]"
          : "border-[#eadfc9] bg-white"
      }`}
    >
      <div className="pcStyle135">
        {icon}
      </div>
      <div className="pcStyle136">
        {eyebrow}
      </div>
      <h3 className="pcStyle137">{title}</h3>
      <p className="pcStyle138">
        {description}
      </p>
      <Link
        href={href}
        className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${
          primary
            ? "bg-gradient-to-r from-[#c79a3b] to-[#b8872d] text-white"
            : "border border-[#d9c79e] bg-[#fff8e7] text-[#866521]"
        }`}
      >
        Explore
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

// -------------------- LOADING SKELETON --------------------
// Supabase query चालू असताना blank page न दाखवता placeholders दाखवतो.

function LoadingGrid() {
  return (
    <div className="pcStyle62">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="pcStyle139"
        >
          <div className="pcStyle140" />
          <div className="pcStyle141">
            <div className="pcStyle142" />
            <div className="pcStyle143" />
            <div className="pcStyle144" />
            <div className="pcStyle145" />
            <div className="pcStyle146" />
          </div>
        </div>
      ))}
    </div>
  );
}

// -------------------- EMPTY SEARCH STATE --------------------
// Search/filter नुसार category मिळाली नाही तर हा component दिसतो.

function EmptyState({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <div className="pcStyle147">
      <div className="pcStyle148">
        <Search size={26} />
      </div>
      <h3 className="pcStyle149">No categories found</h3>
      <p className="pcStyle150">
        Try another search or remove the active filters to see more categories.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="pcStyle151"
      >
        Clear Filters
      </button>
    </div>
  );
}

// -------------------- QUICK PREVIEW MODAL --------------------
// Eye button किंवा card मधील Preview action वर हा modal उघडतो.
// Products ची summary, stock, rating आणि price range दाखवतो.

function QuickPreview({
  category,
  stats,
  onClose,
  onWishlist,
  wishlisted,
  onExplore,
}: {
  category: Category;
  stats: CategoryStats;
  onClose: () => void;
  onWishlist: () => void;
  wishlisted: boolean;
  onExplore: () => void;
}) {
  const Icon = category.icon;

  return (
    <div className="pcStyle152">
      {/* Backdrop click closes modal. */}
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="pcStyle153"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${category.name} preview`}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="pcStyle154"
      >
        {/* Modal close button. */}
        <div className="pcStyle155">
          <button
            type="button"
            aria-label="Close preview"
            onClick={onClose}
            className="pcStyle156"
          >
            <X size={18} />
          </button>
        </div>

        <div className="pcStyle157">

          {/* Large category image. */}
          <div className="pcStyle158">
            <div className="pcStyle159">
              <Icon size={13} />
              {category.name}
            </div>
            <img
              src={category.image}
              alt={category.name}
              className="pcStyle160"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/logo.png";
              }}
            />
          </div>

          {/* Category information and product previews. */}
          <div>
            <div className="pcStyle161">
              <div>
                <div className="pcStyle162">
                  Quick Preview
                </div>
                <h2 className="pcStyle163">
                  {category.name}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Toggle category wishlist"
                onClick={onWishlist}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  wishlisted
                    ? "border-[#c79a3b]/30 bg-[#fff0c8] text-[#a47720]"
                    : "border-[#eadfc9] bg-white text-[#9c907b]"
                }`}
              >
                <Heart
                  size={17}
                  className={wishlisted ? "fill-current" : ""}
                />
              </button>
            </div>

            <p className="pcStyle164">
              {category.description}
            </p>

            {/* Four category statistics. */}
            <div className="pcStyle165">
              <PreviewStat value={stats.total} label="Products" />
              <PreviewStat value={stats.inStock} label="In Stock" />
              <PreviewStat
                value={
                  stats.averageRating
                    ? stats.averageRating.toFixed(1)
                    : "—"
                }
                label="Rating"
              />
              <PreviewStat value={stats.flashDeals} label="Deals" />
            </div>

            {/* Price range. */}
            <div className="pcStyle166">
              <div className="pcStyle167">
                Price Range
              </div>
              <div className="pcStyle168">
                {stats.minPrice
                  ? `${money(stats.minPrice)} – ${money(stats.maxPrice)}`
                  : "Browse products"}
              </div>
            </div>

            {/* Product preview list — maximum four products. */}
            <div className="pcStyle169">
              <div className="pcStyle170">
                <h3 className="pcStyle171">Popular products</h3>
                <span className="pcStyle172">
                  {Math.min(stats.products.length, 4)} previewed
                </span>
              </div>

              <div className="pcStyle173">
                {stats.products.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    className="pcStyle174"
                  >
                    <div className="pcStyle175">
                      <img
                        src={getImage(product.image_url)}
                        alt={product.name}
                        className="pcStyle120"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "/logo.png";
                        }}
                      />
                    </div>

                    <div className="pcStyle176">
                      <div className="pcStyle177">
                        {product.name}
                      </div>
                      <div className="pcStyle178">
                        {product.rating ? (
                          <span className="pcStyle179">
                            <Star size={10} className="pcStyle48" />
                            {product.rating}
                          </span>
                        ) : null}
                        <span>•</span>
                        <span>
                          {safeNumber(product.stock) > 0
                            ? "In stock"
                            : "Out of stock"}
                        </span>
                      </div>
                    </div>

                    <div className="pcStyle180">
                      {money(product.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opens the full category products page. */}
            <button
              type="button"
              onClick={onExplore}
              className="pcStyle181"
            >
              Explore {category.name}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// -------------------- QUICK PREVIEW STAT --------------------
// Preview modal मधील compact statistics card.

function PreviewStat({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="pcStyle182">
      <div className="pcStyle82">{value}</div>
      <div className="pcStyle183">
        {label}
      </div>
    </div>
  );
}
