import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./shop";
import { useCatalog } from "./catalog";

const API_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = useAccount.getState().token;
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  const text = await res.text();
  const payload = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(payload?.message ?? "Request failed");
  }

  return payload as T;
}

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
  id?: string;
  name: string;
  email: string;
  phone: string;
  picture?: string;
}

interface AccountState {
  user: User | null;
  token: string | null;
  addresses: Address[];
  orders: Order[];
  register: (
    input: Omit<User, "email"> & { email: string; password: string },
  ) => Promise<User | null>;
  loginWithEmailAndPassword: (email: string, password: string) => Promise<boolean>;
  loginWithGoogleCredential: (credential: string) => Promise<User>;
  logout: () => void;
  loadAddresses: (userId: string) => Promise<Address[]>;
  loadOrders: (userId: string) => Promise<Order[]>;
  addAddress: (a: Omit<Address, "id">) => Promise<Address>;
  removeAddress: (id: string) => Promise<void>;
  placeOrder: (o: Omit<Order, "id" | "placedAt" | "status">) => Promise<Order>;
  cancelOrder: (id: string) => Promise<Order>;
  setOrderStatus: (id: string, status: Order["status"]) => void;
}

export const useAccount = create<AccountState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      addresses: [],
      orders: [],

      register: async ({ name, email, phone, password }) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (
          !name ||
          !/^\S+@\S+\.\S+$/.test(normalizedEmail) ||
          phone.length !== 10 ||
          password.length < 6
        ) {
          return null;
        }

        const data = await apiRequest<{
          token: string;
          user: { id: string; name: string; email: string; phone: string };
        }>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email: normalizedEmail, phone, password }),
        });

        const user = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
        };
        set((state) => ({
          user,
          token: data.token,
          orders: [],
          addresses: [],
        }));
        return user;
      },
      loginWithEmailAndPassword: async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();

        const data = await apiRequest<{
          token: string;
          user: { id: string; name: string; email: string; phone: string };
        }>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: normalizedEmail, password }),
        });

        const user = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
        };
        set({ user, token: data.token, orders: [], addresses: [] });
        return true;
      },
      loginWithGoogleCredential: async (credential) => {
        const data = await apiRequest<{
          token: string;
          user: { id: string; name: string; email: string; phone: string; picture?: string };
        }>("/api/auth/google", {
          method: "POST",
          body: JSON.stringify({ credential }),
        });

        const user: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          picture: data.user.picture,
        };
        set({ user, token: data.token, orders: [], addresses: [] });
        return user;
      },
      logout: () => set({ user: null, token: null, addresses: [], orders: [] }),

      loadAddresses: async (userId) => {
        const data = await apiRequest<{ addresses: Address[] }>(`/api/account/${userId}`);
        const addresses = data.addresses ?? [];
        set({ addresses });
        return addresses;
      },

      loadOrders: async (userId) => {
        if (!get().token) {
          set({ user: null, addresses: [], orders: [] });
          throw new Error("Your saved login has expired. Please log in again.");
        }

        try {
          const data = await apiRequest<{ items: Order[] }>(
            `/api/orders/${encodeURIComponent(userId)}`,
          );
          const orders = (data.items ?? [])
            .map((order) => ({
              ...order,
              customer: order.customer ?? {
                name: order.address.name,
                email: get().user?.email ?? "",
                phone: order.address.phone,
                city: order.address.city,
                pincode: order.address.pincode,
              },
              deliveryDate: order.deliveryDate ?? "As soon as possible",
              slot: order.slot ?? "Standard delivery",
            }))
            .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
          set({ orders });
          return orders;
        } catch (error) {
          if (error instanceof Error && error.message.includes("Session expired")) {
            set({ user: null, token: null, addresses: [], orders: [] });
          }
          throw error;
        }
      },

      addAddress: async (a) => {
        const userId = get().user?.id;
        if (!userId) {
          throw new Error("Log in to save an address to your account.");
        }

        const data = await apiRequest<{ address: Address }>(`/api/account/${userId}/addresses`, {
          method: "POST",
          body: JSON.stringify(a),
        });
        set((s) => ({ addresses: [data.address, ...s.addresses] }));
        return data.address;
      },

      removeAddress: async (id) => {
        const userId = get().user?.id;
        if (!userId) {
          throw new Error("Log in to remove a saved address.");
        }

        await apiRequest(`/api/account/${userId}/addresses/${id}`, { method: "DELETE" });
        set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) }));
      },

      placeOrder: async (o) => {
        const payload = {
          userId: get().user?.id ?? "guest-user",
          items: o.items.map((item) => ({
            productId: item.productId,
            slug: item.slug,
            name: item.name,
            image: item.image,
            price: item.price,
            mrp: item.mrp,
            qty: item.qty,
          })),
          address: o.address,
          payment: o.payment,
          totals: o.totals ?? {
            subtotal: 0,
            discount: 0,
            delivery: 0,
            tax: 0,
            total: o.total,
          },
        };

        const data = await apiRequest<{
          order: Order;
          stockUpdates?: Array<{ id: string; stock: number }>;
        }>("/api/orders", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        for (const stockUpdate of data.stockUpdates ?? []) {
          useCatalog.getState().updateProduct(stockUpdate.id, { stock: stockUpdate.stock });
        }
        set((s) => ({ orders: [data.order, ...s.orders] }));
        return data.order;
      },

      cancelOrder: async (id) => {
        const data = await apiRequest<{ order: Order }>(
          `/api/orders/${encodeURIComponent(id)}/cancel`,
          {
            method: "PATCH",
          },
        );
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, ...data.order } : order,
          ),
        }));
        return data.order;
      },

      setOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
    }),
    {
      name: "ff-account",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        addresses: state.addresses,
        orders: [],
      }),
    },
  ),
);

export function orderById(id: string) {
  return useAccount.getState().orders.find((o) => o.id === id);
}
