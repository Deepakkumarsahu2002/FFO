import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Heart,
  LoaderCircle,
  LogOut,
  MapPin,
  Package,
  Plus,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { resolveImage } from "@/data/images";
import { inr } from "@/lib/format";
import { useAccount } from "@/store/account";
import { useShop } from "@/store/shop";
import { StoreProductImage } from "@/components/site/StoreProductImage";
import { OrderActionsMenu } from "@/components/site/OrderActionsMenu";
import { GoogleSignInButton } from "@/components/site/GoogleSignInButton";

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
  const {
    user,
    logout,
    addresses,
    addAddress,
    removeAddress,
    loadAddresses,
    orders,
    loadOrders,
    cancelOrder,
  } = useAccount();
  const wishlistCount = useShop((s) => s.wishlist.length);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingAddresses(true);
    setLoadingOrders(true);
    void loadAddresses(user.id)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Could not load saved addresses");
      })
      .finally(() => setLoadingAddresses(false));
    void loadOrders(user.id)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Could not load your orders");
      })
      .finally(() => setLoadingOrders(false));
  }, [loadAddresses, loadOrders, user?.id]);

  if (!user) {
    return (
      <div className="container-x py-10 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-6 overflow-hidden rounded-[30px] border border-primary/10 bg-gradient-to-br from-[#fffaf5] via-white to-[#f4efe7] p-4 shadow-card md:grid-cols-[1.12fr_0.88fr]">
          <div className="order-2 relative overflow-hidden rounded-[26px] md:order-1">
            <img
              src={resolveImage("promo-banner")}
              alt="Flowers Forever gift arrangement"
              className="h-full min-h-[340px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                <Sparkles className="size-3.5" /> Sweet surprise
              </span>
              <h2 className="mt-4 max-w-md font-display text-2xl font-bold leading-tight sm:text-3xl">
                Make every occasion memorable with Flowers Forever.
              </h2>
            </div>
          </div>

          <div className="order-1 rounded-[26px] border border-[#f1e1d7] bg-white/90 p-5 shadow-[0_18px_55px_rgba(74,41,18,0.08)] backdrop-blur-sm sm:p-7 md:order-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"
            >
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-3.5" />
              </span>
              Flowers Forever
            </Link>

            <h1 className="mt-5 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Your journey with starts here
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              First-time shoppers create an account and returning customers log in to track orders,
              save addresses and revisit favorite gifts.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Create account
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-5 py-3 text-sm font-semibold text-primary"
              >
                Log in
              </Link>
            </div>

            <GoogleSignInButton />

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Delivery coverage", value: "All India PIN codes" },
                { label: "Secure gifting", value: "Easy checkout" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-primary/10 bg-cream p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 font-display text-lg font-bold text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-6 sm:py-8">
      <div className="overflow-hidden rounded-[30px] border border-primary/10 bg-gradient-to-r from-[#fffaf5] via-white to-[#f1eae1] p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Customer dashboard
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Welcome back, {user.name}
            </h1>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Orders", value: String(orders.length), icon: Package },
              { label: "Saved", value: String(addresses.length), icon: MapPin },
              { label: "Wishlist", value: String(wishlistCount), icon: Heart },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-primary/10 bg-white/80 p-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {label}
                  </p>
                  <Icon className="size-4 text-primary" />
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_1fr]">
        <aside className="h-fit overflow-hidden rounded-[26px] border border-primary/10 bg-card shadow-card">
          <div className="bg-gradient-to-r from-primary to-[#d68a70] p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-display text-xl font-bold">{user.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/80">Member</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-5">
            <div className="rounded-xl bg-cream p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Email</p>
              <p className="mt-1">{user.email}</p>
            </div>
            <div className="rounded-xl bg-cream p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Mobile</p>
              <p className="mt-1">+91 {user.phone}</p>
            </div>

            <div className="grid gap-2 text-sm">
              <Link
                to="/orders"
                className="flex items-center gap-2 rounded-xl border p-3 transition-colors hover:bg-muted/50"
              >
                <Package className="size-4 text-primary" /> My orders
                <span className="ml-auto font-semibold">{loadingOrders ? "…" : orders.length}</span>
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center gap-2 rounded-xl border p-3 transition-colors hover:bg-muted/50"
              >
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
                className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-left text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-[26px] border border-primary/10 bg-card p-5 shadow-card">
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
                className="mb-4 grid gap-3 rounded-2xl bg-cream p-4 sm:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (savingAddress) return;
                  if (
                    !form.name ||
                    form.phone.length !== 10 ||
                    !form.line1 ||
                    form.pincode.length !== 6
                  ) {
                    toast.error("Fill name, 10-digit phone, address and 6-digit pincode");
                    return;
                  }
                  setSavingAddress(true);
                  try {
                    await addAddress(form);
                    setForm(EMPTY);
                    setShowForm(false);
                    toast.success("Address saved");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Could not save address");
                  } finally {
                    setSavingAddress(false);
                  }
                }}
              >
                <Input
                  label="Label"
                  value={form.label}
                  onChange={(v) => setForm({ ...form, label: v })}
                />
                <Input
                  label="Full name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                />
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
                <Input
                  label="Address line 1"
                  value={form.line1}
                  onChange={(v) => setForm({ ...form, line1: v })}
                />
                <Input
                  label="Landmark (optional)"
                  value={form.line2}
                  onChange={(v) => setForm({ ...form, line2: v })}
                />
                <Input
                  label="City"
                  value={form.city}
                  onChange={(v) => setForm({ ...form, city: v })}
                />
                <Input
                  label="State"
                  value={form.state}
                  onChange={(v) => setForm({ ...form, state: v })}
                />
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground disabled:cursor-wait disabled:opacity-70 sm:col-span-2"
                >
                  {savingAddress && <LoaderCircle className="size-4 animate-spin" />}
                  {savingAddress ? "Saving address…" : "Save address"}
                </button>
              </form>
            )}

            {loadingAddresses ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" /> Loading saved addresses…
              </p>
            ) : addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No addresses saved yet.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {addresses.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-2xl border border-primary/10 bg-cream p-3 text-sm"
                  >
                    <p className="font-semibold text-foreground">
                      {a.label} · {a.name}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}, {a.city} {a.state} — {a.pincode}
                    </p>
                    <p className="mt-1 text-muted-foreground">+91 {a.phone}</p>
                    <button
                      type="button"
                      disabled={deletingAddress === a.id}
                      onClick={async () => {
                        setDeletingAddress(a.id);
                        try {
                          await removeAddress(a.id);
                          toast.success("Address removed");
                        } catch (error) {
                          toast.error(
                            error instanceof Error ? error.message : "Could not remove address",
                          );
                        } finally {
                          setDeletingAddress(null);
                        }
                      }}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-destructive disabled:opacity-60"
                    >
                      {deletingAddress === a.id ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                      {deletingAddress === a.id ? "Removing…" : "Remove"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-[26px] border border-primary/10 bg-card p-5 shadow-card">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Package className="size-4 text-primary" /> Recent orders
            </h2>
            {loadingOrders ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" /> Loading your orders…
              </p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">You haven't placed an order yet.</p>
            ) : (
              <ul className="space-y-2">
                {orders.slice(0, 3).map((o) => (
                  <li
                    key={o.id}
                    className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/10 bg-cream p-3 text-sm"
                  >
                    {o.items[0] && (
                      <StoreProductImage
                        src={o.items[0].image}
                        productId={o.items[0].productId}
                        alt={o.items[0].name}
                        className="size-14 shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <strong>#{o.id}</strong>
                      <span className="block truncate text-xs text-muted-foreground">
                        {o.items[0]?.name} · {o.items.length} item(s) · {o.status}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold text-foreground">{inr(o.total)}</span>
                    <OrderActionsMenu order={o} onCancel={cancelOrder} />
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
      <span className="mb-1 block font-medium text-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input-base" />
    </label>
  );
}
