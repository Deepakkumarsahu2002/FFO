import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import {
  PRODUCTS as SEED_PRODUCTS,
  COUPONS as SEED_COUPONS,
  type Product,
  type CategorySlug,
} from "@/data/catalog";

export interface Coupon {
  code: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  minOrder: number;
  label: string;
  active: boolean;
}

export interface StoreSettings {
  storeName: string;
  supportPhone: string;
  supportEmail: string;
  promoStrip: string;
  freeDeliveryThreshold: number;
  deliveryFee: number;
  ordersOpen: boolean;
}

interface CatalogState {
  products: Product[];
  coupons: Coupon[];
  settings: StoreSettings;
  addProduct: (p: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  upsertCoupon: (c: Coupon) => void;
  deleteCoupon: (code: string) => void;
  updateSettings: (patch: Partial<StoreSettings>) => void;
  resetCatalog: () => void;
}

const defaultSettings: StoreSettings = {
  storeName: "FFO Studio",
  supportPhone: "+91 98000 12345",
  supportEmail: "care@ffostudio.in",
  promoStrip: "Craft essentials, décor and gifting picks across 20+ cities · Free delivery above ₹1499",
  freeDeliveryThreshold: 1499,
  deliveryFee: 99,
  ordersOpen: true,
};

const defaultCoupons: Coupon[] = SEED_COUPONS.map((c) => ({ ...c, active: true }));

export const useCatalog = create<CatalogState>()(
  persist(
    (set) => ({
      products: SEED_PRODUCTS,
      coupons: defaultCoupons,
      settings: defaultSettings,

      addProduct: (p) => set((s) => ({ products: [p, ...s.products] })),

      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      upsertCoupon: (c) =>
        set((s) => ({
          coupons: s.coupons.some((x) => x.code === c.code)
            ? s.coupons.map((x) => (x.code === c.code ? c : x))
            : [c, ...s.coupons],
        })),

      deleteCoupon: (code) =>
        set((s) => ({ coupons: s.coupons.filter((c) => c.code !== code) })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      resetCatalog: () =>
        set({ products: SEED_PRODUCTS, coupons: defaultCoupons, settings: defaultSettings }),
    }),
    { name: "ff-catalog", version: 1 },
  ),
);

/** Non-reactive read of the live catalog (safe in plain functions). */
export function liveProducts() {
  return useCatalog.getState().products;
}

export function liveCoupons() {
  return useCatalog.getState().coupons.filter((c) => c.active);
}

export function liveProduct(idOrSlug: string) {
  return liveProducts().find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

/** Reactive hooks used by storefront pages. */
export function useProducts() {
  return useCatalog((s) => s.products);
}

export function useFilteredProducts(fn: (p: Product) => boolean) {
  return useCatalog(useShallow((s) => s.products.filter(fn)));
}

export function useProductBySlug(slug: string) {
  return useCatalog((s) => s.products.find((p) => p.slug === slug));
}

export function useCategoryProducts(slug: CategorySlug) {
  return useCatalog(useShallow((s) => s.products.filter((p) => p.category === slug)));
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
