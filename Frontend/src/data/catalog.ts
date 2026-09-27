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
    tagline: "Finished floral arrangements for celebrations",
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

export const COUPONS: Array<{
  code: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  minOrder: number;
  label: string;
}> = [];

export const FREE_DELIVERY_THRESHOLD = 1499;
export const DELIVERY_FEE = 99;
export const TAX_RATE = 0.05;
