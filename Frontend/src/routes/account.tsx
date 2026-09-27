import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { User, MapPin, Package, Heart, LogOut, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "@/store/account";
import { useShop } from "@/store/shop";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Flowers Forever" },
      { name: "description", content: "Manage your profile, addresses, orders and wishlist." },
      { property: "og:title", content: "My Account — Flowers Forever" },
      { property: "og:description", content: "Manage your Flowers Forever profile and orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

const EMPTY = {
  label: "Home",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

function AccountPage() {
  const navigate = useNavigate();
  const { user, logout, addresses, addAddress, removeAddress, orders } = useAccount();
  const wishlistCount = useShop((s) => s.wishlist.length);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);

  if (!user) {
    return (
      <div className="container-x grid place-items-center gap-3 py-24 text-center">
        <User className="size-10 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold">You're not signed in</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Sign in to track your orders, save delivery addresses and reorder favourites.
        </p>
        <Link
          to="/login"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">My Account</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_1fr]">
        <aside className="h-fit space-y-4 rounded-xl border bg-card p-5">
          <div>
            <p className="font-display text-lg font-bold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">+91 {user.phone}</p>
          </div>
          <div className="grid gap-2 text-sm">
            <Link to="/orders" className="flex items-center gap-2 rounded-lg border p-3">
              <Package className="size-4 text-primary" /> My orders
              <span className="ml-auto font-semibold">{orders.length}</span>
            </Link>
            <Link to="/wishlist" className="flex items-center gap-2 rounded-lg border p-3">
              <Heart className="size-4 text-primary" /> Wishlist
              <span className="ml-auto font-semibold">{wishlistCount}</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                toast("Signed out");
                navigate({ to: "/" });
              }}
              className="flex items-center gap-2 rounded-lg border p-3 text-left text-destructive"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <MapPin className="size-4 text-primary" /> Saved addresses
              </h2>
              <button
                type="button"
                onClick={() => setShowForm((v) => !v)}
                className="inline-flex items-center gap-1 rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary"
              >
                <Plus className="size-3.5" /> Add new
              </button>
            </div>

            {showForm && (
              <form
                className="mb-4 grid gap-3 rounded-lg bg-cream p-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!form.name || form.phone.length !== 10 || !form.line1 || form.pincode.length !== 6) {
                    toast.error("Fill name, 10-digit phone, address and 6-digit pincode");
                    return;
                  }
                  addAddress(form);
                  setForm(EMPTY);
                  setShowForm(false);
                  toast.success("Address saved");
                }}
              >
                <Input label="Label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} />
                <Input label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v.replace(/\D/g, "").slice(0, 10) })}
                />
                <Input
                  label="Pincode"
                  value={form.pincode}
                  onChange={(v) => setForm({ ...form, pincode: v.replace(/\D/g, "").slice(0, 6) })}
                />
                <Input label="Address line 1" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} />
                <Input label="Landmark (optional)" value={form.line2} onChange={(v) => setForm({ ...form, line2: v })} />
                <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
                <button
                  type="submit"
                  className="h-11 rounded-lg bg-primary text-sm font-semibold text-primary-foreground sm:col-span-2"
                >
                  Save address
                </button>
              </form>
            )}

            {addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No addresses saved yet.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {addresses.map((a) => (
                  <li key={a.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-semibold">
                      {a.label} · {a.name}
                    </p>
                    <p className="text-muted-foreground">
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}, {a.city} {a.state} — {a.pincode}
                    </p>
                    <p className="text-muted-foreground">+91 {a.phone}</p>
                    <button
                      type="button"
                      onClick={() => removeAddress(a.id)}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-destructive"
                    >
                      <Trash2 className="size-3.5" /> Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Package className="size-4 text-primary" /> Recent orders
            </h2>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">You haven't placed an order yet.</p>
            ) : (
              <ul className="space-y-2">
                {orders.slice(0, 3).map((o) => (
                  <li key={o.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <span>
                      <strong>#{o.id}</strong> · {o.items.length} item(s) · {o.status}
                    </span>
                    <span className="font-semibold">{inr(o.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input-base" />
    </label>
  );
}
