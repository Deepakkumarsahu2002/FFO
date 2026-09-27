import { create } from "zustand";
import { liveCoupons, liveProducts } from "./catalog";
import { persist } from "zustand/middleware";
import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  TAX_RATE,
  type Product,
} from "@/data/catalog";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  mrp: number;
  qty: number;
  variant?: string;
  message?: string;
  addons?: string[];
}

interface ShopState {
  items: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  recentSearches: string[];
  city: string;
  pincode: string;
  coupon: string | null;
  cartOpen: boolean;
  addItem: (p: Product, qty?: number, extra?: Partial<CartItem>) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  viewProduct: (productId: string) => void;
  addSearch: (term: string) => void;
  setLocation: (city: string, pincode: string) => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  clearCoupon: () => void;
  setCartOpen: (open: boolean) => void;
}

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      recentlyViewed: [],
      recentSearches: [],
      city: "Mumbai",
      pincode: "400001",
      coupon: null,
      cartOpen: false,

      addItem: (p, qty = 1, extra = {}) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === p.id);
          const wishlist = state.wishlist.filter((id) => id !== p.id);
          if (existing) {
            return {
              wishlist,
              items: state.items.map((i) =>
                i.productId === p.id
                  ? { ...i, qty: Math.min(i.qty + qty, p.stock), ...extra }
                  : i,
              ),
            };
          }
          return {
            wishlist,
            items: [
              ...state.items,
              {
                productId: p.id,
                slug: p.slug,
                name: p.name,
                image: p.images[0],
                price: p.price,
                mrp: p.mrp,
                qty,
                ...extra,
              },
            ],
          };
        }),

      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),

      setQty: (productId, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.productId === productId ? { ...i, qty } : i))
            .filter((i) => i.qty > 0),
        })),

      clearCart: () => set({ items: [], coupon: null }),

      toggleWishlist: (productId) =>
        set((s) => ({
          wishlist: s.wishlist.includes(productId)
            ? s.wishlist.filter((id) => id !== productId)
            : [productId, ...s.wishlist],
        })),

      isWishlisted: (productId) => get().wishlist.includes(productId),

      viewProduct: (productId) =>
        set((s) => ({
          recentlyViewed: [productId, ...s.recentlyViewed.filter((id) => id !== productId)].slice(
            0,
            10,
          ),
        })),

      addSearch: (term) =>
        set((s) => ({
          recentSearches: [term, ...s.recentSearches.filter((t) => t !== term)].slice(0, 6),
        })),

      setLocation: (city, pincode) => set({ city, pincode }),

      applyCoupon: (code) => {
        const found = liveCoupons().find((c) => c.code === code.trim().toUpperCase());
        const subtotal = cartSubtotal(get().items);
        if (!found) return { ok: false, message: "This coupon code isn't valid." };
        if (subtotal < found.minOrder)
          return {
            ok: false,
            message: `Add items worth ₹${found.minOrder - subtotal} more to use ${found.code}.`,
          };
        set({ coupon: found.code });
        return { ok: true, message: `${found.code} applied — ${found.label}.` };
      },

      clearCoupon: () => set({ coupon: null }),
      setCartOpen: (cartOpen) => set({ cartOpen }),
    }),
    { name: "ff-shop", partialize: (s) => ({
        items: s.items,
        wishlist: s.wishlist,
        recentlyViewed: s.recentlyViewed,
        recentSearches: s.recentSearches,
        city: s.city,
        pincode: s.pincode,
        coupon: s.coupon,
      }) },
  ),
);

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  delivery: number;
  tax: number;
  total: number;
  freeDeliveryGap: number;
}

export function computeTotals(items: CartItem[], couponCode: string | null): CartTotals {
  const subtotal = cartSubtotal(items);
  const coupon = liveCoupons().find((c) => c.code === couponCode);
  let discount = 0;
  let delivery = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;

  if (coupon && subtotal >= coupon.minOrder) {
    if (coupon.type === "percent") discount = Math.round((subtotal * coupon.value) / 100);
    if (coupon.type === "fixed") discount = coupon.value;
    if (coupon.type === "shipping") delivery = 0;
  }

  const taxable = Math.max(subtotal - discount, 0);
  const tax = Math.round(taxable * TAX_RATE);
  return {
    subtotal,
    discount,
    delivery,
    tax,
    total: taxable + delivery + tax,
    freeDeliveryGap: Math.max(FREE_DELIVERY_THRESHOLD - subtotal, 0),
  };
}

export function productById(id: string) {
  return liveProducts().find((p) => p.id === id);
}

export function useCartCount() {
  return useShop((s) => s.items.reduce((n, i) => n + i.qty, 0));
}
