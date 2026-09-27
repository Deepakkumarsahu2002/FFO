import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./shop";

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CustomerDetails {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  city?: string;
  pincode?: string;
}

export interface OrderTotalsSnapshot {
  subtotal: number;
  discount: number;
  delivery: number;
  tax: number;
  total: number;
}

export interface OrderMeta {
  source?: "web" | "admin";
  notes?: string;
  messageSummary?: string;
  itemCount?: number;
}

export interface Order {
  id: string;
  placedAt: string;
  items: CartItem[];
  total: number;
  status: "Placed" | "Preparing" | "Out for delivery" | "Delivered" | "Cancelled";
  address: Address;
  deliveryDate: string;
  slot: string;
  payment: string;
  customer: CustomerDetails;
  shipping?: {
    address: Address;
    city: string;
    pincode: string;
    method?: string;
  };
  totals?: OrderTotalsSnapshot;
  metadata?: OrderMeta;
}

export interface User {
  name: string;
  email: string;
  phone: string;
}

interface AccountState {
  user: User | null;
  addresses: Address[];
  orders: Order[];
  login: (user: User) => void;
  logout: () => void;
  addAddress: (a: Omit<Address, "id">) => Address;
  removeAddress: (id: string) => void;
  placeOrder: (o: Omit<Order, "id" | "placedAt" | "status">) => Order;
  cancelOrder: (id: string) => void;
  setOrderStatus: (id: string, status: Order["status"]) => void;
}

export const useAccount = create<AccountState>()(
  persist(
    (set, get) => ({
      user: null,
      addresses: [],
      orders: [],

      login: (user) => set({ user }),
      logout: () => set({ user: null }),

      addAddress: (a) => {
        const address = { ...a, id: `addr_${Date.now()}` };
        set((s) => ({ addresses: [address, ...s.addresses] }));
        return address;
      },

      removeAddress: (id) =>
        set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) })),

      placeOrder: (o) => {
        const order: Order = {
          ...o,
          id: `FF${Date.now().toString().slice(-8)}`,
          placedAt: new Date().toISOString(),
          status: "Placed",
        };
        set((s) => ({ orders: [order, ...s.orders] }));
        return order;
      },

      cancelOrder: (id) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status: "Cancelled" } : o)),
        })),

      setOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
    }),
    { name: "ff-account" },
  ),
);

export function orderById(id: string) {
  return useAccount.getState().orders.find((o) => o.id === id);
}
