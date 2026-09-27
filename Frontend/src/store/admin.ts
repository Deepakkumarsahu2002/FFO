import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Demo passcode for the hidden admin console (device-local, no backend yet). */
export const ADMIN_PASSCODE = "ffo@2026";

interface AdminState {
  authed: boolean;
  signIn: (code: string) => boolean;
  signOut: () => void;
}

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      authed: false,
      signIn: (code) => {
        const ok = code.trim() === ADMIN_PASSCODE;
        if (ok) set({ authed: true });
        return ok;
      },
      signOut: () => set({ authed: false }),
    }),
    { name: "ff-admin" },
  ),
);
