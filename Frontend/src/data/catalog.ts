import { resolveImage, type ImageKey } from "./images";

export type CategorySlug =
  | "pipe-cleaner-supplies"
  | "ready-bouquets"
  | "diy-flower-kits"
  | "home-decor";

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  image: ImageKey;
  subcategories: string[];
}

export const CATEGORIES: Category[] = [
  {
    slug: "pipe-cleaner-supplies",
    name: "Pipe Cleaner Supplies",
    tagline: "Premium craft essentials for floral creations",
    image: "cat-flowers",
    subcategories: [
      "8mm Premium Quality Pipe Cleaners",
      "Floral Sticks",
      "Floral Tapes",
      "Wrapping Sheets",
      "Pollens",
      "Ribbons",
    ],
  },
  {
    slug: "ready-bouquets",
    name: "Ready Bouquets",
    tagline: "Finished floral arrangements for every occasion",
    image: "cat-cakes",
    subcategories: [
      "Small Bouquets",
      "Medium Bouquets",
      "Jumbo Bouquets",
    ],
  },
  {
    slug: "diy-flower-kits",
    name: "DIY Flower Kits",
    tagline: "Everything needed to make your own bouquet",
    image: "cat-plants",
    subcategories: [
      "Pipe Cleaner Bouquets",
      "Ribbon Bouquets",
    ],
  },
  {
    slug: "home-decor",
    name: "Home Decor",
    tagline: "Decor accents for gifting and styling",
    image: "cat-gifts",
    subcategories: [
      "Pots",
      "Lamps",
      "Handbags",
    ],
  },
];

export const OCCASIONS = [
  "DIY Craft",
  "Gift Wrapping",
  "Home Styling",
  "Housewarming",
  "Corporate Gifting",
  "Wedding Decor",
  "Workshop Supply",
  "School Project",
  "Party Decor",
  "Floral Styling",
  "Candlelight Setup",
  "Table Decor",
  "Handmade Gift",
  "Craft Starter",
  "Decor Upgrade",
] as const;

export const CITIES = [
  { name: "Mumbai", pincodes: ["400001", "400050", "400072"] },
  { name: "Delhi", pincodes: ["110001", "110024", "110085"] },
  { name: "Bangalore", pincodes: ["560001", "560034", "560066"] },
  { name: "Hyderabad", pincodes: ["500001", "500032", "500081"] },
  { name: "Chennai", pincodes: ["600001", "600028", "600096"] },
  { name: "Pune", pincodes: ["411001", "411014", "411045"] },
  { name: "Kolkata", pincodes: ["700001", "700019", "700091"] },
  { name: "Bhubaneswar", pincodes: ["751001", "751024", "751030"] },
  { name: "Cuttack", pincodes: ["753001", "753008"] },
  { name: "Berhampur", pincodes: ["760001", "760010"] },
];

export const DELIVERY_SLOTS = [
  { id: "morning", label: "Morning", window: "9 AM - 1 PM", fee: 0 },
  { id: "afternoon", label: "Afternoon", window: "1 PM - 5 PM", fee: 0 },
  { id: "evening", label: "Evening", window: "5 PM - 9 PM", fee: 99 },
  { id: "midnight", label: "Midnight", window: "11 PM - 11:59 PM", fee: 249 },
];

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  subcategory: string;
  shortDescription: string;
  description: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  stock: number;
  sku: string;
  images: string[];
  occasions: string[];
  tags: string[];
  color: string;
  flowerType?: string;
  sameDay: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  care: string;
  contains: string[];
}

interface Seed {
  name: string;
  category: CategorySlug;
  subcategory: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  color: string;
  flowerType?: string;
  occasions: string[];
  tags?: string[];
  premium?: boolean;
  stock?: number;
}

const seeds: Seed[] = [
  { name: "Premium 8mm Pipe Cleaner Set", category: "pipe-cleaner-supplies", subcategory: "8mm Premium Quality Pipe Cleaners", price: 399, mrp: 549, rating: 4.7, reviews: 312, color: "Assorted", occasions: ["DIY Craft", "Craft Starter"], tags: ["bestseller"], stock: 42 },
  { name: "Floral Stick Craft Kit", category: "pipe-cleaner-supplies", subcategory: "Floral Sticks", price: 299, mrp: 420, rating: 4.5, reviews: 198, color: "White", occasions: ["DIY Craft", "Workshop Supply"], stock: 35 },
  { name: "Floral Tape Bundle", category: "pipe-cleaner-supplies", subcategory: "Floral Tapes", price: 249, mrp: 349, rating: 4.4, reviews: 164, color: "Green", occasions: ["DIY Craft", "Workshop Supply"], stock: 48 },
  { name: "Wrapping Sheet Combo", category: "pipe-cleaner-supplies", subcategory: "Wrapping Sheets", price: 279, mrp: 399, rating: 4.6, reviews: 210, color: "Pastel", occasions: ["Gift Wrapping", "Party Decor"], stock: 40 },
  { name: "Artisan Pollen Pack", category: "pipe-cleaner-supplies", subcategory: "Pollens", price: 189, mrp: 250, rating: 4.3, reviews: 116, color: "Yellow", occasions: ["DIY Craft", "Floral Styling"], stock: 52 },
  { name: "Ribbon Mix Pack", category: "pipe-cleaner-supplies", subcategory: "Ribbons", price: 229, mrp: 320, rating: 4.6, reviews: 149, color: "Multi", occasions: ["Gift Wrapping", "Party Decor"], stock: 44 },

  { name: "Mini Bloom Bouquet", category: "ready-bouquets", subcategory: "Small Bouquets", price: 599, mrp: 799, rating: 4.6, reviews: 364, color: "Pink", occasions: ["Gift Wrapping", "Handmade Gift"], tags: ["bestseller"], stock: 26 },
  { name: "Graceful Studio Bouquet", category: "ready-bouquets", subcategory: "Medium Bouquets", price: 999, mrp: 1299, rating: 4.7, reviews: 427, color: "Peach", occasions: ["Home Styling", "Decor Upgrade"], stock: 21 },
  { name: "Jumbo Celebration Bouquet", category: "ready-bouquets", subcategory: "Jumbo Bouquets", price: 1499, mrp: 1899, rating: 4.8, reviews: 281, color: "Assorted", occasions: ["Wedding Decor", "Table Decor"], premium: true, stock: 17 },

  { name: "Pipe Cleaner Bouquet Kit", category: "diy-flower-kits", subcategory: "Pipe Cleaner Bouquets", price: 799, mrp: 999, rating: 4.7, reviews: 230, color: "Assorted", occasions: ["DIY Craft", "Craft Starter"], tags: ["bestseller"], stock: 24 },
  { name: "Ribbon Bouquet DIY Kit", category: "diy-flower-kits", subcategory: "Ribbon Bouquets", price: 699, mrp: 899, rating: 4.6, reviews: 186, color: "Soft Pink", occasions: ["DIY Craft", "Handmade Gift"], stock: 29 },

  { name: "Ceramic Bloom Pot Set", category: "home-decor", subcategory: "Pots", price: 899, mrp: 1199, rating: 4.5, reviews: 212, color: "Cream", occasions: ["Home Styling", "Decor Upgrade"], stock: 22 },
  { name: "Luma Table Lamp", category: "home-decor", subcategory: "Lamps", price: 1299, mrp: 1699, rating: 4.7, reviews: 194, color: "Warm White", occasions: ["Home Styling", "Corporate Gifting"], premium: true, stock: 15 },
  { name: "Bloom Handbag Accent", category: "home-decor", subcategory: "Handbags", price: 1199, mrp: 1499, rating: 4.4, reviews: 138, color: "Blush", occasions: ["Gift Wrapping", "Handmade Gift"], stock: 19 },
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const secondaryImage: Record<CategorySlug, ImageKey> = {
  "pipe-cleaner-supplies": "hero-bouquet",
  "ready-bouquets": "cat-combo",
  "diy-flower-kits": "cat-gifts",
  "home-decor": "cat-cakes",
};

const careCopy: Record<CategorySlug, string> = {
  "pipe-cleaner-supplies":
    "Store in a cool, dry place away from direct sunlight. Keep ribbons and tapes sealed for best flexibility and color retention.",
  "ready-bouquets":
    "Keep in a cool spot, refresh the water daily, and remove any leaves below the waterline to help the arrangement last longer.",
  "diy-flower-kits":
    "Use the included guide for shaping and arranging. Store unused materials in a dry box to maintain quality.",
  "home-decor":
    "Dust gently with a soft cloth and avoid placing décor pieces in direct sunlight or damp areas.",
};

export const PRODUCTS: Product[] = seeds.map((s, i) => {
  const cat = CATEGORIES.find((c) => c.slug === s.category)!;
  return {
    id: `PRD-${String(i + 1).padStart(4, "0")}`,
    slug: slugify(s.name),
    name: s.name,
    category: s.category,
    subcategory: s.subcategory,
    shortDescription: `${s.subcategory} · ${cat.tagline}`,
    description: `${s.name} is hand-crafted by our local florists and gift curators, then quality-checked before it leaves the studio. Presented in signature Flowers Forever packaging with a complimentary message card, it is made to arrive looking exactly as photographed.`,
    price: s.price,
    mrp: s.mrp,
    rating: s.rating,
    reviews: s.reviews,
    stock: s.stock ?? (i % 11 === 0 ? 3 : 20 + (i % 30)),
    sku: `FF-${s.category.slice(0, 3).toUpperCase()}-${String(i + 101)}`,
    images: [resolveImage(cat.image), resolveImage(secondaryImage[s.category])],
    occasions: s.occasions,
    tags: s.tags ?? [],
    color: s.color,
    flowerType: s.flowerType,
    sameDay: i % 7 !== 0,
    isBestSeller: (s.tags ?? []).includes("bestseller"),
    isFeatured: s.rating >= 4.6,
    isPremium: Boolean(s.premium),
    care: careCopy[s.category],
    contains:
      s.category === "combo"
        ? ["Signature bouquet", "Celebration cake", "Greeting card"]
        : [`1 x ${s.name}`, "Flowers Forever gift packaging", "Complimentary message card"],
  };
});

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function byCategory(slug: CategorySlug) {
  return PRODUCTS.filter((p) => p.category === slug);
}

export function bestSellers() {
  return PRODUCTS.filter((p) => p.isBestSeller || p.rating >= 4.7).slice(0, 12);
}

export function searchProducts(q: string) {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  return PRODUCTS.filter((p) =>
    [p.name, p.category, p.subcategory, p.color, ...(p.occasions ?? [])]
      .join(" ")
      .toLowerCase()
      .includes(term),
  );
}

export const COUPONS = [
  { code: "BLOOM10", type: "percent" as const, value: 10, minOrder: 799, label: "10% off above ₹799" },
  { code: "FLAT150", type: "fixed" as const, value: 150, minOrder: 1200, label: "₹150 off above ₹1200" },
  { code: "FREESHIP", type: "shipping" as const, value: 0, minOrder: 499, label: "Free delivery above ₹499" },
];

export const FREE_DELIVERY_THRESHOLD = 1499;
export const DELIVERY_FEE = 99;
export const TAX_RATE = 0.05;
