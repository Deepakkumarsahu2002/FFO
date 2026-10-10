/**
 * Centralised image configuration.
 * Every image the catalogue uses is resolved through this map, so swapping to
 * Cloudinary later only means replacing the values here (or pointing `resolveImage`
 * at a CDN base URL).
 */
import heroBanner1 from "@/assets/hero-banner-1.png";
import heroBanner2 from "@/assets/hero-banner-2.png";
import heroBanner3 from "@/assets/hero-banner-3.png";
import categoryPipeCleaner from "@/assets/pastel-pipe-cleaner-flatlay.png";
import categoryBouquets from "@/assets/dreamy-pastel-bouquets.png";
import categoryDiyKits from "@/assets/diy-flower-kit-display.png";
import categoryHomeDecor from "@/assets/cozy-chenille-flower-display.png";
import catFlowers from "@/assets/cat-flowers.jpg";
import catCakes from "@/assets/cat-cakes.jpg";
import catPlants from "@/assets/cat-plants.jpg";
import catGifts from "@/assets/cat-gifts.jpg";
import catPersonalized from "@/assets/cat-personalized.jpg";
import catCombo from "@/assets/cat-combo.jpg";
import promoBanner from "@/assets/promo-banner.jpg";

export const IMAGES = {
  "hero-bouquet": heroBanner1,
  "hero-banner-1": heroBanner1,
  "hero-banner-2": heroBanner2,
  "hero-banner-3": heroBanner3,
  "category-pipe-cleaner-supplies": categoryPipeCleaner,
  "category-ready-bouquets": categoryBouquets,
  "category-diy-flower-kits": categoryDiyKits,
  "category-home-decor": categoryHomeDecor,
  "cat-flowers": catFlowers,
  "cat-cakes": catCakes,
  "cat-plants": catPlants,
  "cat-gifts": catGifts,
  "cat-personalized": catPersonalized,
  "cat-combo": catCombo,
  "promo-banner": promoBanner,
} as const;

export type ImageKey = keyof typeof IMAGES;

/** CDN base, e.g. https://res.cloudinary.com/<cloud>/image/upload. Empty = bundled assets. */
const CDN_BASE = "";

export function resolveImage(key: ImageKey): string {
  if (CDN_BASE) return `${CDN_BASE}/flowers-forever/${key}.jpg`;
  return IMAGES[key];
}

export function productImageFallback(category: string): string {
  switch (category) {
    case "pipe-cleaner-supplies":
      return IMAGES["category-pipe-cleaner-supplies"];
    case "ready-bouquets":
      return IMAGES["category-ready-bouquets"];
    case "diy-flower-kits":
      return IMAGES["category-diy-flower-kits"];
    case "home-decor":
      return IMAGES["category-home-decor"];
    default:
      return IMAGES["cat-gifts"];
  }
}

export function productImageSource(category: string, image?: string): string {
  if (!image || image === "/placeholder.svg" || image.includes("...")) {
    return productImageFallback(category);
  }

  return image;
}
