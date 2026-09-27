import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const API_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

interface AdminState {
  authed: boolean;
  token: string | null;
  signIn: (code: string) => Promise<void>;
  signOut: () => void;
}

export async function adminApiRequest<T>(
  path: string,
  init: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const accessToken = token === undefined ? useAdmin.getState().token : token;
  const response = await fetch(`${API_BASE}/api/admin${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message ?? "Admin request failed");
  }

  return payload as T;
}

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      authed: false,
      token: null,
      signIn: async (code) => {
        const data = await adminApiRequest<{ token: string }>(
          "/session",
          { method: "POST", body: JSON.stringify({ passcode: code }) },
          null,
        );
        set({ authed: true, token: data.token });
      },
      signOut: () => set({ authed: false, token: null }),
    }),
    {
      name: "ff-admin-session",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
    },
  ),
);
