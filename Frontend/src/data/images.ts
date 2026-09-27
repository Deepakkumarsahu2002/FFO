/**
 * Centralised image configuration.
 * Every image the catalogue uses is resolved through this map, so swapping to
 * Cloudinary later only means replacing the values here (or pointing `resolveImage`
 * at a CDN base URL).
 */
import heroBouquet from "@/assets/hero-bouquet.jpg";
import catFlowers from "@/assets/cat-flowers.jpg";
import catCakes from "@/assets/cat-cakes.jpg";
import catPlants from "@/assets/cat-plants.jpg";
import catGifts from "@/assets/cat-gifts.jpg";
import catPersonalized from "@/assets/cat-personalized.jpg";
import catCombo from "@/assets/cat-combo.jpg";
import promoBanner from "@/assets/promo-banner.jpg";

export const IMAGES = {
  "hero-bouquet": heroBouquet,
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
