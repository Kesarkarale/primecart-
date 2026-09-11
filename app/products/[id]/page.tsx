"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  Menu,
  Minus,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  User,
  X,
  Zap,
  RotateCcw,
  Clock3,
  Share2,
} from "lucide-react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number;
  stock: number;
  delivery: string;
  description: string;
  images: string[];
  highlights: string[];
  specifications: [string, string][];
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  stock: number;
};

/* =========================================================
   PRODUCTS
========================================================= */

const products: Product[] = [
  {
    id: "1",
    name: "Samsung Galaxy Smartphone Pro Max",
    brand: "Samsung",
    category: "Electronics",
    rating: 4.8,
    reviews: 1248,
    price: 54999,
    originalPrice: 64999,
    stock: 12,
    delivery: "3 - 5 Days",
    description:
      "Experience powerful performance, stunning photography and an immersive display with the Samsung Galaxy Smartphone Pro Max. Designed for everyday productivity, entertainment and gaming with premium hardware and modern design.",
    images: [
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1200&q=90",
    ],
    highlights: [
      "Premium AMOLED display with vivid colours",
      "Powerful processor for smooth multitasking",
      "Advanced camera system",
      "All-day battery with fast charging",
      "Premium glass and metal design",
      "Large internal storage",
    ],
    specifications: [
      ["Brand", "Samsung"],
      ["Model", "Galaxy Smartphone Pro Max"],
      ["Display", "6.7 inch AMOLED"],
      ["RAM", "12 GB"],
      ["Storage", "256 GB"],
      ["Rear Camera", "200 MP + Ultra Wide"],
      ["Front Camera", "50 MP"],
      ["Battery", "5000 mAh"],
      ["Operating System", "Android"],
      ["Warranty", "1 Year Manufacturer Warranty"],
    ],
  },

  {
    id: "2",
    name: "Sony Wireless Noise Cancelling Headphones",
    brand: "Sony",
    category: "Electronics",
    rating: 4.7,
    reviews: 986,
    price: 24999,
    originalPrice: 29999,
    stock: 18,
    delivery: "2 - 4 Days",
    description:
      "Enjoy immersive sound with powerful bass, advanced noise cancellation and long-lasting battery life. Perfect for travel, work, music and entertainment.",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=90",
    ],
    highlights: [
      "Advanced active noise cancellation",
      "Premium wireless audio",
      "Up to 30 hours battery life",
      "Fast charging support",
      "Comfortable over-ear design",
      "Built-in microphone",
    ],
    specifications: [
      ["Brand", "Sony"],
      ["Type", "Wireless Headphones"],
      ["Connectivity", "Bluetooth"],
      ["Battery", "Up to 30 Hours"],
      ["Noise Cancellation", "Active ANC"],
      ["Microphone", "Built-in"],
      ["Charging", "USB Type-C"],
      ["Warranty", "1 Year"],
    ],
  },

  {
    id: "3",
    name: "Levis Premium Denim Jacket",
    brand: "Levis",
    category: "Fashion",
    rating: 4.6,
    reviews: 742,
    price: 2999,
    originalPrice: 4499,
    stock: 25,
    delivery: "3 - 6 Days",
    description:
      "A premium denim jacket designed for everyday styling. Comfortable fabric, timeless design and a versatile fit make it perfect for casual outfits.",
    images: [
      "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=1200&q=90",
    ],
    highlights: [
      "Premium denim fabric",
      "Classic jacket design",
      "Comfortable regular fit",
      "Durable stitching",
      "Suitable for everyday wear",
      "Easy to style",
    ],
    specifications: [
      ["Brand", "Levis"],
      ["Material", "Premium Denim"],
      ["Fit", "Regular Fit"],
      ["Pattern", "Solid"],
      ["Sleeves", "Full Sleeves"],
      ["Closure", "Button"],
      ["Wash Care", "Machine Wash"],
      ["Occasion", "Casual"],
    ],
  },

  {
    id: "4",
    name: "GlowCare Vitamin C Face Serum",
    brand: "GlowCare",
    category: "Beauty",
    rating: 4.5,
    reviews: 531,
    price: 799,
    originalPrice: 1199,
    stock: 40,
    delivery: "2 - 5 Days",
    description:
      "GlowCare Vitamin C Face Serum is designed for a fresh and radiant-looking complexion. Its lightweight formula is easy to apply and suitable for everyday skincare routines.",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1200&q=90",
    ],
    highlights: [
      "Vitamin C enriched formula",
      "Lightweight texture",
      "Suitable for daily skincare",
      "Helps improve skin radiance",
      "Easy-to-use pump bottle",
      "Suitable for all skin types",
    ],
    specifications: [
      ["Brand", "GlowCare"],
      ["Product Type", "Face Serum"],
      ["Volume", "30 ml"],
      ["Key Ingredient", "Vitamin C"],
      ["Skin Type", "All Skin Types"],
      ["Texture", "Lightweight"],
      ["Usage", "Daily"],
      ["Shelf Life", "24 Months"],
    ],
  },

  {
    id: "5",
    name: "Premium Smart Watch Series 9",
    brand: "PrimeTech",
    category: "Electronics",
    rating: 4.6,
    reviews: 628,
    price: 3999,
    originalPrice: 5999,
    stock: 20,
    delivery: "2 - 4 Days",
    description:
      "A stylish smart watch with a bright display, fitness tracking, notifications and a modern premium design.",
    images: [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&w=1200&q=90",
    ],
    highlights: [
      "Bright HD display",
      "Fitness and activity tracking",
      "Multiple sports modes",
      "Smart notifications",
      "Long battery life",
      "Premium lightweight design",
    ],
    specifications: [
      ["Brand", "PrimeTech"],
      ["Display", "1.9 inch HD"],
      ["Connectivity", "Bluetooth"],
      ["Battery", "Up to 7 Days"],
      ["Water Resistance", "IP68"],
      ["Sports Modes", "100+"],
      ["Strap", "Silicone"],
      ["Warranty", "1 Year"],
    ],
  },

  {
    id: "6",
    name: "Premium Ceramic Home Dinner Set",
    brand: "HomeCraft",
    category: "Home & Kitchen",
    rating: 4.7,
    reviews: 389,
    price: 2199,
    originalPrice: 3299,
    stock: 15,
    delivery: "4 - 7 Days",
    description:
      "Elegant ceramic dinner set designed for modern homes. Durable finish and stylish appearance make it suitable for everyday dining and special occasions.",
    images: [
      "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1578775887804-699de7086ff9?auto=format&fit=crop&w=1200&q=90",
    ],
    highlights: [
      "Premium ceramic material",
      "Elegant modern design",
      "Easy to clean",
      "Durable finish",
      "Suitable for everyday dining",
      "Gift-ready design",
    ],
    specifications: [
      ["Brand", "HomeCraft"],
      ["Material", "Ceramic"],
      ["Pieces", "18 Pieces"],
      ["Microwave Safe", "Yes"],
      ["Dishwasher Safe", "Yes"],
      ["Colour", "White"],
      ["Usage", "Dining"],
      ["Warranty", "6 Months"],
    ],
  },

  {
    id: "7",
    name: "Premium Running Sports Shoes",
    brand: "Nike",
    category: "Sports",
    rating: 4.7,
    reviews: 875,
    price: 4499,
    originalPrice: 6999,
    stock: 30,
    delivery: "3 - 5 Days",
    description:
      "Lightweight running shoes designed for comfort, support and everyday active use. Built with breathable materials and cushioned sole technology.",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=90",
    ],
    highlights: [
      "Lightweight construction",
      "Breathable upper material",
      "Cushioned sole",
      "Excellent everyday comfort",
      "Flexible outsole",
      "Suitable for running and walking",
    ],
    specifications: [
      ["Brand", "Nike"],
      ["Type", "Running Shoes"],
      ["Upper", "Mesh"],
      ["Sole", "Rubber"],
      ["Closure", "Lace-Up"],
      ["Use", "Running / Walking"],
      ["Fit", "Regular"],
      ["Warranty", "6 Months"],
    ],
  },

  {
    id: "8",
    name: "Premium Classic Leather Watch",
    brand: "Fossil",
    category: "Fashion",
    rating: 4.6,
    reviews: 412,
    price: 6999,
    originalPrice: 8999,
    stock: 14,
    delivery: "3 - 5 Days",
    description:
      "A classic leather watch combining elegant styling with a timeless design. Perfect for formal occasions, office wear and everyday outfits.",
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=90",
    ],
    highlights: [
      "Premium leather strap",
      "Classic analogue dial",
      "Scratch-resistant glass",
      "Elegant formal styling",
      "Comfortable fit",
      "Long-lasting design",
    ],
    specifications: [
      ["Brand", "Fossil"],
      ["Movement", "Quartz"],
      ["Display", "Analogue"],
      ["Strap", "Leather"],
      ["Dial Shape", "Round"],
      ["Water Resistance", "5 ATM"],
      ["Glass", "Mineral"],
      ["Warranty", "2 Years"],
    ],
  },

  {
    id: "9",
    name: "Apple Style Wireless Earbuds Pro",
    brand: "PrimeAudio",
    category: "Electronics",
    rating: 4.5,
    reviews: 764,
    price: 2999,
    originalPrice: 4999,
    stock: 35,
    delivery: "2 - 4 Days",
    description:
      "Premium true wireless earbuds with a compact charging case, immersive audio and comfortable everyday fit.",
    images: [
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1629367494173-c78a56567877?auto=format&fit=crop&w=1200&q=90",
    ],
    highlights: [
      "True wireless stereo sound",
      "Clear calling microphone",
      "Compact charging case",
      "Touch controls",
      "Comfortable in-ear fit",
      "Long-lasting battery",
    ],
    specifications: [
      ["Brand", "PrimeAudio"],
      ["Type", "True Wireless Earbuds"],
      ["Connectivity", "Bluetooth 5.3"],
      ["Battery", "Up to 24 Hours"],
      ["Charging", "USB Type-C"],
      ["Microphone", "Dual Mic"],
      ["Controls", "Touch"],
      ["Warranty", "1 Year"],
    ],
  },

  {
    id: "10",
    name: "Minimal Premium Women's Handbag",
    brand: "UrbanStyle",
    category: "Fashion",
    rating: 4.6,
    reviews: 328,
    price: 2499,
    originalPrice: 3999,
    stock: 22,
    delivery: "3 - 6 Days",
    description:
      "A stylish everyday handbag with a clean minimal design, spacious interior and premium finish.",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1585488433538-6b9b9c1e0f4d?auto=format&fit=crop&w=1200&q=90",
    ],
    highlights: [
      "Premium finish",
      "Spacious main compartment",
      "Multiple storage pockets",
      "Comfortable handles",
      "Elegant minimal design",
      "Suitable for daily use",
    ],
    specifications: [
      ["Brand", "UrbanStyle"],
      ["Material", "Premium Synthetic Leather"],
      ["Type", "Handbag"],
      ["Closure", "Zip"],
      ["Compartments", "3"],
      ["Strap", "Adjustable"],
      ["Occasion", "Casual / Office"],
      ["Warranty", "6 Months"],
    ],
  },

  {
    id: "11",
    name: "Modern Home Table Lamp",
    brand: "HomeGlow",
    category: "Home & Kitchen",
    rating: 4.4,
    reviews: 256,
    price: 1499,
    originalPrice: 2499,
    stock: 28,
    delivery: "3 - 5 Days",
    description:
      "Modern decorative table lamp designed to add a warm and elegant touch to bedrooms, study areas and living spaces.",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=1200&q=90",
    ],
    highlights: [
      "Modern decorative design",
      "Warm ambient lighting",
      "Compact table-friendly size",
      "Easy to operate",
      "Suitable for bedroom and study",
      "Premium finish",
    ],
    specifications: [
      ["Brand", "HomeGlow"],
      ["Type", "Table Lamp"],
      ["Material", "Metal + Fabric"],
      ["Light Type", "LED"],
      ["Light Colour", "Warm White"],
      ["Power", "10W"],
      ["Switch", "On/Off"],
      ["Warranty", "1 Year"],
    ],
  },

  {
    id: "12",
    name: "Premium Fitness Training Bag",
    brand: "FitPro",
    category: "Sports",
    rating: 4.5,
    reviews: 441,
    price: 1899,
    originalPrice: 2999,
    stock: 32,
    delivery: "3 - 5 Days",
    description:
      "A durable and spacious training bag designed for gym sessions, travel and everyday active lifestyles.",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1580082816697-2f4a8a7b7a8f?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1553744373-4c9f3e2c8b7b?auto=format&fit=crop&w=1200&q=90",
    ],
    highlights: [
      "Large storage capacity",
      "Durable construction",
      "Separate shoe compartment",
      "Comfortable shoulder strap",
      "Water-resistant outer material",
      "Suitable for gym and travel",
    ],
    specifications: [
      ["Brand", "FitPro"],
      ["Type", "Training / Gym Bag"],
      ["Material", "Polyester"],
      ["Capacity", "35 Litres"],
      ["Compartments", "5"],
      ["Shoulder Strap", "Adjustable"],
      ["Water Resistance", "Yes"],
      ["Warranty", "1 Year"],
    ],
  },
];

/* =========================================================
   REVIEWS
========================================================= */

const reviews = [
  {
    name: "Rahul Patil",
    rating: 5,
    date: "2 days ago",
    verified: true,
    text: "Excellent product. Quality is amazing and the delivery was very fast. Packaging was also really good.",
  },
  {
    name: "Sneha Sharma",
    rating: 5,
    date: "1 week ago",
    verified: true,
    text: "Very premium product. Performance is smooth and the product looks exactly like the pictures.",
  },
  {
    name: "Amit Joshi",
    rating: 4,
    date: "2 weeks ago",
    verified: true,
    text: "Good product for the price. Build quality feels premium and delivery was on time.",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN").format(price);
}

function getDiscount(price: number, originalPrice: number) {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/* =========================================================
   PAGE
========================================================= */

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const productId = String(params.id || "");

  const product = useMemo(
    () => products.find((item) => item.id === productId),
    [productId]
  );

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [userName, setUserName] = useState("Account");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showReviews, setShowReviews] = useState(true);
  const [search, setSearch] = useState("");
  const [addedMessage, setAddedMessage] = useState("");

  const isDark = theme === "dark";

  const discount = product
    ? getDiscount(product.price, product.originalPrice)
    : 0;

  /* =========================================================
     LOAD USER / THEME / CART
  ========================================================= */

  useEffect(() => {
    const savedTheme = localStorage.getItem("primecart-theme");

    if (savedTheme === "dark") {
      setTheme("dark");
    }

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0];

        if (name) {
          setUserName(name);
        }
      }
    };

    loadUser();
    loadCartCount();

    const handleCartUpdate = () => {
      loadCartCount();
    };

    window.addEventListener(
      "primecart-cart-updated",
      handleCartUpdate
    );

    return () => {
      window.removeEventListener(
        "primecart-cart-updated",
        handleCartUpdate
      );
    };
  }, [supabase]);

  useEffect(() => {
    localStorage.setItem("primecart-theme", theme);
  }, [theme]);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setDeliveryMessage("");
    setAddedMessage("");
  }, [productId]);

  /* =========================================================
     CART COUNT
  ========================================================= */

  const loadCartCount = () => {
    try {
      const cart: CartItem[] = JSON.parse(
        localStorage.getItem("primecart-cart") || "[]"
      );

      const count = cart.reduce(
        (total, item) => total + (item.quantity || 1),
        0
      );

      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const addToCart = () => {
    if (!product) return;

    try {
      const oldCart: CartItem[] = JSON.parse(
        localStorage.getItem("primecart-cart") || "[]"
      );

      const existingIndex = oldCart.findIndex(
        (item) => item.id === product.id
      );

      if (existingIndex >= 0) {
        oldCart[existingIndex].quantity = Math.min(
          product.stock,
          oldCart[existingIndex].quantity + quantity
        );
      } else {
        oldCart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images[0],
          quantity,
          stock: product.stock,
        });
      }

      localStorage.setItem(
        "primecart-cart",
        JSON.stringify(oldCart)
      );

      loadCartCount();

      window.dispatchEvent(
        new Event("primecart-cart-updated")
      );

      setAddedMessage("Added to cart");

      setTimeout(() => {
        setAddedMessage("");
      }, 2500);
    } catch {
      alert("Unable to add product to cart.");
    }
  };

  /* =========================================================
     BUY NOW
  ========================================================= */

  const buyNow = () => {
    if (!product) return;

    try {
      const oldCart: CartItem[] = JSON.parse(
        localStorage.getItem("primecart-cart") || "[]"
      );

      const existingIndex = oldCart.findIndex(
        (item) => item.id === product.id
      );

      if (existingIndex >= 0) {
        oldCart[existingIndex].quantity = Math.min(
          product.stock,
          quantity
        );
      } else {
        oldCart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images[0],
          quantity,
          stock: product.stock,
        });
      }

      localStorage.setItem(
        "primecart-cart",
        JSON.stringify(oldCart)
      );

      window.dispatchEvent(
        new Event("primecart-cart-updated")
      );

      router.push("/cart");
    } catch {
      alert("Unable to continue.");
    }
  };

  /* =========================================================
     DELIVERY
  ========================================================= */

  const checkDelivery = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryMessage(
        "Please enter a valid 6-digit pincode."
      );
      return;
    }

    if (!product) return;

    setDeliveryMessage(
      `Delivery available to ${pincode}. Estimated delivery in ${product.delivery}.`
    );
  };

  /* =========================================================
     THEME
  ========================================================= */

  const toggleTheme = () => {
    setTheme((current) =>
      current === "light" ? "dark" : "light"
    );
  };

  /* =========================================================
     SHARE
  ========================================================= */

  const shareProduct = async () => {
    if (!product) return;

    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on PrimeCart`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Product link copied!");
      }
    } catch {
      // User cancelled share.
    }
  };

  /* =========================================================
     PRODUCT NOT FOUND
  ========================================================= */

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8f3] px-6">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#b88a2a]/10 text-3xl">
            🛍️
          </div>

          <h1 className="text-3xl font-black text-[#171614]">
            Product Not Found
          </h1>

          <p className="mt-3 text-sm text-black/50">
            The product you are looking for is unavailable.
          </p>

          <Link
            href="/products"
            className="mt-7 inline-flex rounded-xl bg-[#b88a2a] px-6 py-3 text-sm font-bold text-white"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <main
      className={
        isDark
          ? "min-h-screen bg-[#11100e] text-[#f7f3eb]"
          : "min-h-screen bg-[#faf8f3] text-[#171614]"
      }
    >
      {/* TOP ANNOUNCEMENT */}

      <div className="bg-[#171614] px-4 py-2.5 text-center text-xs font-medium text-white">
        Free shipping on orders above ₹999
        <span className="mx-2 opacity-40">•</span>
        Easy returns within 7 days
        <span className="mx-2 opacity-40">•</span>
        Secure payments
      </div>

      {/* NAVBAR */}

      <nav
        className={
          isDark
            ? "sticky top-0 z-50 border-b border-white/10 bg-[#11100e]/95 backdrop-blur-xl"
            : "sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur-xl"
        }
      >
        <div className="mx-auto flex h-[76px] max-w-7xl items-center gap-3 px-4 lg:gap-5 lg:px-8">
          {/* MOBILE MENU */}

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="rounded-xl p-2 lg:hidden"
            aria-label="Menu"
          >
            {mobileMenu ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

          {/* LOGO */}

          <Link href="/dashboard" className="shrink-0">
            <div className="text-[24px] font-black tracking-tight">
              Prime
              <span className="text-[#b88a2a]">Cart</span>
            </div>
          </Link>

          {/* LOCATION */}

          <div className="hidden items-center gap-2 xl:flex">
            <MapPin
              size={18}
              className="text-[#b88a2a]"
            />

            <div>
              <p className="text-[9px] uppercase tracking-wider opacity-45">
                Deliver to
              </p>

              <p className="text-xs font-bold">
                India
              </p>
            </div>
          </div>

          {/* SEARCH */}

          <div className="hidden flex-1 md:block">
            <div
              className={
                isDark
                  ? "flex h-11 items-center overflow-hidden rounded-xl border border-white/10 bg-white/5"
                  : "flex h-11 items-center overflow-hidden rounded-xl border border-black/10 bg-[#f7f5ef]"
              }
            >
              <Search
                size={18}
                className="ml-4 opacity-40"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    router.push(
                      `/products?search=${encodeURIComponent(
                        search
                      )}`
                    );
                  }
                }}
                placeholder="Search products, brands and more"
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
              />

              <button
                onClick={() =>
                  router.push(
                    `/products?search=${encodeURIComponent(
                      search
                    )}`
                  )
                }
                className="mr-1 rounded-lg bg-[#b88a2a] px-5 py-2 text-sm font-bold text-white"
              >
                Search
              </button>
            </div>
          </div>

          {/* ACCOUNT */}

          <Link
            href="/profile"
            className="hidden items-center gap-2 rounded-xl px-2 py-2 md:flex"
          >
            <User size={20} />

            <div className="hidden xl:block">
              <p className="text-[9px] opacity-45">
                Hello,
              </p>

              <p className="max-w-[100px] truncate text-sm font-bold">
                {userName}
              </p>
            </div>
          </Link>

          {/* ORDERS */}

          <Link
            href="/orders"
            className="hidden items-center gap-2 rounded-xl px-2 py-2 lg:flex"
          >
            <Package size={20} />

            <span className="text-sm font-bold">
              Orders
            </span>
          </Link>

          {/* WISHLIST */}

          <button
            onClick={() => setWishlist(!wishlist)}
            className="relative rounded-xl p-2"
            aria-label="Wishlist"
          >
            <Heart
              size={22}
              fill={
                wishlist ? "currentColor" : "none"
              }
              className={
                wishlist ? "text-[#b88a2a]" : ""
              }
            />
          </button>

          {/* CART */}

          <Link
            href="/cart"
            className="relative rounded-xl p-2"
          >
            <ShoppingCart size={23} />

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b88a2a] px-1 text-[10px] font-black text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* THEME */}

          <button
            onClick={toggleTheme}
            className={
              isDark
                ? "rounded-xl border border-white/10 px-3 py-2 text-xs"
                : "rounded-xl border border-black/10 px-3 py-2 text-xs"
            }
            aria-label="Toggle theme"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>

        {/* MOBILE MENU */}

        {mobileMenu && (
          <div
            className={
              isDark
                ? "border-t border-white/10 bg-[#11100e] px-5 py-5"
                : "border-t border-black/5 bg-white px-5 py-5"
            }
          >
            <div
              className={
                isDark
                  ? "mb-5 flex overflow-hidden rounded-xl border border-white/10 bg-white/5"
                  : "mb-5 flex overflow-hidden rounded-xl border border-black/10 bg-[#f7f5ef]"
              }
            >
              <Search
                size={18}
                className="ml-3 mt-3 opacity-40"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    router.push(
                      `/products?search=${encodeURIComponent(
                        search
                      )}`
                    );
                    setMobileMenu(false);
                  }
                }}
                placeholder="Search products..."
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
              />
            </div>

            <div className="grid gap-4 text-sm font-semibold">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenu(false)}
              >
                Home
              </Link>

              <Link
                href="/products"
                onClick={() => setMobileMenu(false)}
              >
                Products
              </Link>

              <Link
                href="/orders"
                onClick={() => setMobileMenu(false)}
              >
                Orders
              </Link>

              <Link
                href="/wishlist"
                onClick={() => setMobileMenu(false)}
              >
                Wishlist
              </Link>

              <Link
                href="/profile"
                onClick={() => setMobileMenu(false)}
              >
                My Account
              </Link>

              <Link
                href="/cart"
                onClick={() => setMobileMenu(false)}
              >
                Cart
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* CATEGORY NAV */}

      <div
        className={
          isDark
            ? "border-b border-white/10 bg-[#171614]"
            : "border-b border-black/5 bg-white"
        }
      >
        <div className="mx-auto flex max-w-7xl gap-7 overflow-x-auto px-4 py-3 text-sm font-medium lg:px-8">
          {[
            "Electronics",
            "Fashion",
            "Beauty",
            "Home & Kitchen",
            "Sports",
            "Books",
            "Deals",
            "New Arrivals",
          ].map((category) => (
            <Link
              key={category}
              href={`/products?category=${encodeURIComponent(
                category
              )}`}
              className="whitespace-nowrap transition hover:text-[#b88a2a]"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>

      {/* MAIN */}

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-9">
        {/* BREADCRUMB */}

        <div className="mb-7 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs">
          <Link
            href="/dashboard"
            className="opacity-50 hover:text-[#b88a2a] hover:opacity-100"
          >
            Home
          </Link>

          <ChevronRight
            size={13}
            className="opacity-30"
          />

          <Link
            href="/products"
            className="opacity-50 hover:text-[#b88a2a] hover:opacity-100"
          >
            Products
          </Link>

          <ChevronRight
            size={13}
            className="opacity-30"
          />

          <Link
            href={`/products?category=${encodeURIComponent(
              product.category
            )}`}
            className="opacity-50 hover:text-[#b88a2a] hover:opacity-100"
          >
            {product.category}
          </Link>

          <ChevronRight
            size={13}
            className="opacity-30"
          />

          <span className="max-w-[250px] truncate font-medium opacity-80">
            {product.name}
          </span>
        </div>

        {/* PRODUCT AREA */}

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* IMAGE AREA */}

          <div>
            <div
              className={
                isDark
                  ? "relative flex min-h-[440px] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-white"
                  : "relative flex min-h-[440px] items-center justify-center overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm"
              }
            >
              {/* SALE BADGE */}

              {discount > 0 && (
                <div className="absolute left-5 top-5 z-10 rounded-full bg-[#b88a2a] px-4 py-2 text-xs font-black text-white">
                  {discount}% OFF
                </div>
              )}

              {/* SHARE */}

              <button
                onClick={shareProduct}
                className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:scale-105"
                aria-label="Share"
              >
                <Share2
                  size={19}
                  className="text-black"
                />
              </button>

              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-[390px] w-full object-contain p-8 transition duration-500 hover:scale-105 sm:h-[460px]"
              />

              {/* PREVIOUS */}

              <button
                onClick={() =>
                  setSelectedImage(
                    selectedImage === 0
                      ? product.images.length - 1
                      : selectedImage - 1
                  )
                }
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-105"
                aria-label="Previous image"
              >
                <ArrowLeft
                  size={18}
                  className="text-black"
                />
              </button>

              {/* NEXT */}

              <button
                onClick={() =>
                  setSelectedImage(
                    selectedImage ===
                      product.images.length - 1
                      ? 0
                      : selectedImage + 1
                  )
                }
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-105"
                aria-label="Next image"
              >
                <ArrowRight
                  size={18}
                  className="text-black"
                />
              </button>
            </div>

            {/* THUMBNAILS */}

            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map(
                (image, index) => (
                  <button
                    key={image}
                    onClick={() =>
                      setSelectedImage(index)
                    }
                    className={
                      selectedImage === index
                        ? "overflow-hidden rounded-2xl border-2 border-[#b88a2a] bg-white shadow-sm"
                        : "overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:border-[#b88a2a]/50"
                    }
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${
                        index + 1
                      }`}
                      className="h-20 w-full object-contain p-2 sm:h-24"
                    />
                  </button>
                )
              )}
            </div>

            {/* IMAGE BENEFITS */}

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                {
                  icon: Truck,
                  text: "Free Delivery",
                },
                {
                  icon: ShieldCheck,
                  text: "Secure Payment",
                },
                {
                  icon: RotateCcw,
                  text: "Easy Returns",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.text}
                    className={
                      isDark
                        ? "rounded-2xl border border-white/10 p-3 text-center"
                        : "rounded-2xl border border-black/5 bg-white p-3 text-center"
                    }
                  >
                    <Icon
                      size={20}
                      className="mx-auto mb-2 text-[#b88a2a]"
                    />

                    <p className="text-[10px] font-bold sm:text-xs">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DETAILS */}

          <div>
            {/* BRAND */}

            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#b88a2a]">
              {product.brand}
            </p>

            {/* NAME */}

            <h1 className="mt-3 text-3xl font-black leading-[1.12] tracking-tight sm:text-4xl lg:text-[42px]">
              {product.name}
            </h1>

            {/* RATING */}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-[#b88a2a] px-3 py-1.5 text-sm font-black text-white">
                {product.rating}

                <Star
                  size={14}
                  fill="currentColor"
                />
              </div>

              <span className="text-sm font-semibold opacity-70">
                {product.reviews.toLocaleString(
                  "en-IN"
                )}{" "}
                Ratings & Reviews
              </span>

              <span className="text-xs opacity-40">
                •
              </span>

              <span className="text-xs font-semibold text-green-600">
                In Stock
              </span>
            </div>

            <div className="my-6 h-px bg-current opacity-10" />

            {/* PRICE */}

            <div>
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-4xl font-black tracking-tight">
                  ₹{formatPrice(product.price)}
                </span>

                <span className="mb-1 text-lg text-gray-400 line-through">
                  ₹
                  {formatPrice(
                    product.originalPrice
                  )}
                </span>

                <span className="mb-1 rounded-md bg-green-50 px-2 py-1 text-sm font-black text-green-600">
                  {discount}% OFF
                </span>
              </div>

              <p className="mt-2 text-xs opacity-50">
                Inclusive of all taxes
              </p>
            </div>

            {/* OFFERS */}

            <div
              className={
                isDark
                  ? "mt-6 rounded-2xl border border-[#b88a2a]/30 bg-[#b88a2a]/10 p-5"
                  : "mt-6 rounded-2xl border border-[#b88a2a]/20 bg-[#fff8e9] p-5"
              }
            >
              <div className="mb-4 flex items-center gap-2">
                <Zap
                  size={18}
                  className="text-[#b88a2a]"
                />

                <h3 className="font-black">
                  Special Offers
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  "Extra ₹1,000 off on selected bank cards",
                  "Free delivery on this product",
                  "7 days easy replacement available",
                ].map((offer) => (
                  <div
                    key={offer}
                    className="flex gap-3"
                  >
                    <Check
                      className="mt-0.5 shrink-0 text-green-600"
                      size={17}
                    />

                    <span className="opacity-80">
                      {offer}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* DELIVERY */}

            <div className="mt-7">
              <div className="mb-3 flex items-center gap-2">
                <Truck
                  size={19}
                  className="text-[#b88a2a]"
                />

                <span className="font-black">
                  Delivery
                </span>

                <span className="text-xs opacity-50">
                  Check availability
                </span>
              </div>

              <div
                className={
                  isDark
                    ? "flex max-w-md overflow-hidden rounded-xl border border-white/10 bg-white/5"
                    : "flex max-w-md overflow-hidden rounded-xl border border-black/10 bg-white"
                }
              >
                <MapPin
                  className="ml-3 mt-3 shrink-0 text-gray-400"
                  size={18}
                />

                <input
                  value={pincode}
                  onChange={(e) =>
                    setPincode(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="Enter pincode"
                  maxLength={6}
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                />

                <button
                  onClick={checkDelivery}
                  className="px-5 text-sm font-black text-[#b88a2a]"
                >
                  Check
                </button>
              </div>

              {deliveryMessage && (
                <p
                  className={`mt-2 text-xs font-semibold ${
                    deliveryMessage.includes(
                      "available"
                    )
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {deliveryMessage}
                </p>
              )}
            </div>

            {/* QUANTITY */}

            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-black">
                  Quantity
                </p>

                <p className="text-xs opacity-50">
                  {product.stock} units available
                </p>
              </div>

              <div
                className={
                  isDark
                    ? "flex w-fit items-center overflow-hidden rounded-xl border border-white/10 bg-white/5"
                    : "flex w-fit items-center overflow-hidden rounded-xl border border-black/10 bg-white"
                }
              >
                <button
                  onClick={() =>
                    setQuantity((value) =>
                      Math.max(1, value - 1)
                    )
                  }
                  className="flex h-12 w-12 items-center justify-center hover:bg-black/5"
                  aria-label="Decrease quantity"
                >
                  <Minus size={17} />
                </button>

                <span className="flex h-12 w-14 items-center justify-center border-x border-black/10 text-sm font-black">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity((value) =>
                      Math.min(
                        product.stock,
                        value + 1
                      )
                    )
                  }
                  className="flex h-12 w-12 items-center justify-center hover:bg-black/5"
                  aria-label="Increase quantity"
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>

            {/* ACTION BUTTONS */}

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                onClick={addToCart}
                className="flex h-14 items-center justify-center gap-3 rounded-2xl border-2 border-[#b88a2a] font-black text-[#b88a2a] transition hover:bg-[#b88a2a] hover:text-white"
              >
                <ShoppingCart size={20} />

                {addedMessage
                  ? addedMessage
                  : "Add to Cart"}
              </button>

              <button
                onClick={buyNow}
                className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#b88a2a] font-black text-white shadow-lg shadow-[#b88a2a]/20 transition hover:brightness-95"
              >
                <Zap size={20} />
                Buy Now
              </button>
            </div>

            {/* WISHLIST */}

            <button
              onClick={() => setWishlist(!wishlist)}
              className={
                wishlist
                  ? "mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#b88a2a] bg-[#b88a2a]/10 text-sm font-bold text-[#b88a2a]"
                  : "mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-black/10 text-sm font-bold transition hover:border-[#b88a2a] hover:text-[#b88a2a]"
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

              {wishlist
                ? "Added to Wishlist"
                : "Add to Wishlist"}
            </button>

            {/* STOCK INFO */}

            <div className="mt-5 flex items-center gap-2 text-xs">
              <div className="h-2 w-2 rounded-full bg-green-500" />

              <span className="font-semibold text-green-600">
                In stock and ready to ship
              </span>
            </div>

            {/* QUICK INFO */}

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div
                className={
                  isDark
                    ? "rounded-2xl border border-white/10 p-4"
                    : "rounded-2xl border border-black/5 bg-white p-4"
                }
              >
                <Clock3
                  size={21}
                  className="mb-3 text-[#b88a2a]"
                />

                <p className="text-xs font-black">
                  Fast Delivery
                </p>

                <p className="mt-1 text-[11px] opacity-50">
                  {product.delivery}
                </p>
              </div>

              <div
                className={
                  isDark
                    ? "rounded-2xl border border-white/10 p-4"
                    : "rounded-2xl border border-black/5 bg-white p-4"
                }
              >
                <ShieldCheck
                  size={21}
                  className="mb-3 text-[#b88a2a]"
                />

                <p className="text-xs font-black">
                  Secure Payment
                </p>

                <p className="mt-1 text-[11px] opacity-50">
                  100% secure checkout
                </p>
              </div>

              <div
                className={
                  isDark
                    ? "rounded-2xl border border-white/10 p-4"
                    : "rounded-2xl border border-black/5 bg-white p-4"
                }
              >
                <RotateCcw
                  size={21}
                  className="mb-3 text-[#b88a2a]"
                />

                <p className="text-xs font-black">
                  Easy Returns
                </p>

                <p className="mt-1 text-[11px] opacity-50">
                  7 days replacement
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* HIGHLIGHTS */}

        <section
          className={
            isDark
              ? "mt-12 overflow-hidden rounded-3xl border border-white/10 bg-[#181715]"
              : "mt-12 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm"
          }
        >
          <div className="border-b border-current/10 px-6 py-5 lg:px-8">
            <h2 className="text-2xl font-black">
              Product Highlights
            </h2>

            <p className="mt-1 text-xs opacity-50">
              Everything you need to know about this
              product
            </p>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3 lg:p-8">
            {product.highlights.map(
              (highlight) => (
                <div
                  key={highlight}
                  className="flex gap-3"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#b88a2a]/10">
                    <Check
                      size={15}
                      className="text-[#b88a2a]"
                    />
                  </div>

                  <p className="text-sm leading-6 opacity-75">
                    {highlight}
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        {/* SPECIFICATIONS + DESCRIPTION */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section
            className={
              isDark
                ? "overflow-hidden rounded-3xl border border-white/10 bg-[#181715]"
                : "overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm"
            }
          >
            <div className="border-b border-current/10 px-6 py-5">
              <h2 className="text-2xl font-black">
                Specifications
              </h2>
            </div>

            <div>
              {product.specifications.map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-2 border-b border-current/5 px-6 py-4 text-sm last:border-0"
                  >
                    <span className="opacity-45">
                      {key}
                    </span>

                    <span className="font-semibold">
                      {value}
                    </span>
                  </div>
                )
              )}
            </div>
          </section>

          <section
            className={
              isDark
                ? "rounded-3xl border border-white/10 bg-[#181715] p-6"
                : "rounded-3xl border border-black/5 bg-white p-6 shadow-sm"
            }
          >
            <h2 className="text-2xl font-black">
              Product Description
            </h2>

            <p className="mt-5 text-sm leading-7 opacity-70">
              {product.description}
            </p>

            <div className="mt-7 rounded-2xl bg-[#b88a2a]/10 p-5">
              <div className="flex gap-3">
                <ShieldCheck
                  className="shrink-0 text-[#b88a2a]"
                  size={23}
                />

                <div>
                  <h3 className="font-black">
                    Genuine Product Guarantee
                  </h3>

                  <p className="mt-1 text-xs leading-5 opacity-60">
                    PrimeCart products are sourced from
                    verified sellers and brands to provide
                    a safe and reliable shopping experience.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* REVIEWS */}

        <section
          className={
            isDark
              ? "mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#181715]"
              : "mt-6 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm"
          }
        >
          <button
            onClick={() =>
              setShowReviews(!showReviews)
            }
            className="flex w-full items-center justify-between px-6 py-5 text-left lg:px-8"
          >
            <div>
              <h2 className="text-2xl font-black">
                Customer Reviews
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="font-black">
                  {product.rating}/5
                </span>

                <div className="flex">
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <Star
                        key={star}
                        size={15}
                        fill="currentColor"
                        className="text-[#b88a2a]"
                      />
                    )
                  )}
                </div>

                <span className="text-xs opacity-50">
                  {product.reviews.toLocaleString(
                    "en-IN"
                  )}{" "}
                  reviews
                </span>
              </div>
            </div>

            <ChevronDown
              size={22}
              className={`transition ${
                showReviews
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {showReviews && (
            <div className="border-t border-current/10">
              {reviews.map((review) => (
                <div
                  key={review.name}
                  className="border-b border-current/5 p-6 last:border-0 lg:px-8"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black">
                        {review.name}
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({
                            length: review.rating,
                          }).map(
                            (_, index) => (
                              <Star
                                key={index}
                                size={14}
                                fill="currentColor"
                                className="text-[#b88a2a]"
                              />
                            )
                          )}
                        </div>

                        {review.verified && (
                          <span className="text-[10px] font-bold text-green-600">
                            ✓ Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs opacity-40">
                      {review.date}
                    </span>
                  </div>

                  <p className="mt-4 max-w-3xl text-sm leading-7 opacity-70">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* BACK TO PRODUCTS */}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-5 py-3 text-sm font-bold transition hover:border-[#b88a2a] hover:text-[#b88a2a]"
          >
            <ArrowLeft size={16} />
            Back to Products
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[#b88a2a] px-5 py-3 text-sm font-bold text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* FOOTER */}

      <footer
        className={
          isDark
            ? "mt-16 border-t border-white/10 bg-[#0c0c0b]"
            : "mt-16 border-t border-black/5 bg-[#171614] text-white"
        }
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4 lg:px-8">
          <div>
            <div className="text-2xl font-black">
              Prime
              <span className="text-[#b88a2a]">
                Cart
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-white/50">
              Your trusted destination for quality
              products, great prices and a smooth
              shopping experience.
            </p>
          </div>

          <div>
            <h3 className="font-bold">
              Shop
            </h3>

            <div className="mt-4 grid gap-3 text-sm text-white/50">
              <Link href="/products">
                All Products
              </Link>

              <Link href="/products">
                Deals
              </Link>

              <Link href="/products">
                New Arrivals
              </Link>

              <Link href="/wishlist">
                Wishlist
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold">
              Customer Care
            </h3>

            <div className="mt-4 grid gap-3 text-sm text-white/50">
              <span>Help Center</span>
              <span>Shipping & Delivery</span>
              <span>Returns</span>
              <span>Contact Us</span>
            </div>
          </div>

          <div>
            <h3 className="font-bold">
              Why PrimeCart?
            </h3>

            <div className="mt-4 grid gap-3 text-sm text-white/50">
              <span>✓ Secure Payments</span>
              <span>✓ Genuine Products</span>
              <span>✓ Easy Returns</span>
              <span>✓ Fast Delivery</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-white/40">
          © 2026 PrimeCart. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
