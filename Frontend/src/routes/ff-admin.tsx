import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Ticket,
  Settings,
  LogOut,
  Lock,
  Plus,
  Trash2,
  Search,
  IndianRupee,
  AlertTriangle,
  Users,
  TrendingUp,
  Wallet,
  PackageCheck,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { inr } from "@/lib/format";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CATEGORIES, type CategorySlug, type Product } from "@/data/catalog";
import { hydrateCatalogFromBackend, useCatalog, slugify, type Coupon } from "@/store/catalog";
import { useAccount, type Order } from "@/store/account";
import { adminApiRequest, useAdmin } from "@/store/admin";
import { StoreProductImage } from "@/components/site/StoreProductImage";

export const Route = createFileRoute("/ff-admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — FFO Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Tab = "dashboard" | "customers" | "products" | "orders" | "coupons" | "settings";

const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "customers", label: "Customers", icon: Users },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "settings", label: "Settings", icon: Settings },
];

function AdminPage() {
  const authed = useAdmin((s) => s.authed);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        await useAdmin.persist.rehydrate();
        const token = useAdmin.getState().token;
        if (token) await adminApiRequest<{ valid: boolean }>("/session");
        else useAdmin.getState().signOut();
      } catch {
        useAdmin.getState().signOut();
      } finally {
        if (active) setSessionReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authed) return;
    let active = true;
    void adminApiRequest<{ items: Order[] }>("/orders")
      .then(({ items }) => {
        if (active) useAccount.setState({ orders: items });
      })
      .catch((error) => {
        if (active) toast.error(error instanceof Error ? error.message : "Could not load admin orders");
      });
    return () => {
      active = false;
    };
  }, [authed]);

  if (!sessionReady) {
    return <div className="container-x py-16 text-center text-sm text-muted-foreground">Checking admin session…</div>;
  }

  if (!authed) return <AdminLogin />;

  return (
    <div className="container-x py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">FFO Studio Admin</h1>
          <p className="text-sm text-muted-foreground">
            Manage inventory, orders, promos and décor store settings.
          </p>
        </div>
        <button
          onClick={() => useAdmin.getState().signOut()}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2 border-b pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition",
              tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "dashboard" && <Dashboard />}
        {tab === "customers" && <CustomersAdmin />}
        {tab === "products" && <ProductsAdmin />}
        {tab === "orders" && <OrdersAdmin />}
        {tab === "coupons" && <CouponsAdmin />}
        {tab === "settings" && <SettingsAdmin />}
      </div>
    </div>
  );
}

/* ---------------------------------- login --------------------------------- */

function AdminLogin() {
  const [code, setCode] = useState("");
  const signIn = useAdmin((s) => s.signIn);

  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-16">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await signIn(code);
            toast.success("Welcome back");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to sign in");
          }
        }}
        className="w-full max-w-sm rounded-2xl border bg-card p-7 shadow-soft"
      >
        <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
          <Lock className="size-5" />
        </span>
        <h1 className="mt-4 font-display text-xl font-bold">Studio access only</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the admin passcode to manage the storefront.
        </p>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Passcode"
          className="input-base mt-5"
          autoFocus
        />
        <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
          Unlock console
        </button>
      </form>
    </div>
  );
}

/* -------------------------------- dashboard ------------------------------- */

function Dashboard() {
  const products = useCatalog((s) => s.products);
  const orders = useAccount((s) => s.orders);

  const revenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.total, 0);
  const lowStock = products.filter((p) => p.stock <= 5);
  const activeCustomers = new Set(
    orders.map((o) => o.customer?.phone || o.address.phone).filter(Boolean),
  ).size;
  const avgOrderValue = orders.length ? revenue / orders.length : 0;

  const revenueTrend = useMemo(() => {
    const last7 = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));

      const label = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const dayOrders = orders.filter((o) => {
        const when = new Date(o.placedAt);
        return when.toDateString() === date.toDateString() && o.status !== "Cancelled";
      });

      return {
        day: label,
        revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
        orders: dayOrders.length,
      };
    });

    return last7;
  }, [orders]);

  const categoryMix = useMemo(() => {
    const counts = products.reduce<Record<string, number>>((acc, product) => {
      acc[product.category] = (acc[product.category] ?? 0) + 1;
      return acc;
    }, {});

    return CATEGORIES.map((category) => ({
      name: category.name,
      value: counts[category.slug] ?? 0,
    })).filter((item) => item.value > 0);
  }, [products]);

  const pieColors = ["#7c2d12", "#c2410c", "#f59e0b", "#d97706", "#a16207", "#fb7185"];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Products" value={String(products.length)} icon={PackageCheck} accent="from-[#fdf2f8] via-white to-[#fff7ed]" />
        <Stat label="Orders" value={String(orders.length)} icon={ShoppingBag} accent="from-[#f0fdf4] via-white to-[#ecfeff]" />
        <Stat label="Revenue" value={inr(revenue)} icon={Wallet} accent="from-[#fff7ed] via-white to-[#fdf2f8]" />
        <Stat label="Active customers" value={String(activeCustomers)} icon={Users} accent="from-[#eef2ff] via-white to-[#f5f3ff]" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <section className="rounded-3xl border bg-gradient-to-br from-white via-[#fffaf5] to-[#fff8ee] p-5 shadow-[0_18px_45px_rgba(120,66,18,0.06)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Performance</p>
              <h2 className="font-display text-xl font-bold">Revenue trend</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#fff1e6] px-2.5 py-1 text-xs font-semibold text-[#9a4d12]">
              <TrendingUp className="size-3.5" /> Avg order {inr(avgOrderValue)}
            </div>
          </div>

          <ChartContainer
            config={{
              revenue: { label: "Revenue", color: "#7c2d12" },
              orders: { label: "Orders", color: "#f59e0b" },
            }}
            className="h-[260px] w-full"
          >
            <AreaChart data={revenueTrend} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c2d12" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7c2d12" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1e7df" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="revenue" stroke="#7c2d12" fill="url(#revenueFill)" strokeWidth={3} />
            </AreaChart>
          </ChartContainer>
        </section>

        <section className="rounded-3xl border bg-card p-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Catalog mix</p>
              <h2 className="font-display text-xl font-bold">Categories</h2>
            </div>
          </div>

          <ChartContainer
            config={{
              value: { label: "Products", color: "#7c2d12" },
            }}
            className="h-[240px] w-full"
          >
            <PieChart>
              <Pie data={categoryMix} dataKey="value" nameKey="name" innerRadius={44} outerRadius={78} paddingAngle={3}>
                {categoryMix.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>

          <div className="mt-2 space-y-2">
            {categoryMix.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">Recent orders</h2>
              <p className="text-sm text-muted-foreground">Latest customer activity</p>
            </div>
            <span className="rounded-full border bg-muted/60 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {orders.length} total
            </span>
          </div>

          {orders.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No orders placed yet.</p>
          ) : (
            <ul className="space-y-2">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/20 px-3 py-2.5">
                  {o.items[0] && (
                    <StoreProductImage
                      src={o.items[0].image}
                      productId={o.items[0].productId}
                      alt={o.items[0].name}
                      className="size-12 shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">#{o.id} · {o.items[0]?.name}</p>
                    <p className="text-xs text-muted-foreground">{o.address.name} · {new Date(o.placedAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{inr(o.total)}</span>
                    <StatusPill status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">Inventory health</h2>
              <p className="text-sm text-muted-foreground">Stock monitoring</p>
            </div>
          </div>

          <div className="space-y-3">
            {lowStock.length > 0 ? (
              lowStock.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-2xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                  <span className="font-medium">{p.name}</span>
                  <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-semibold">{p.stock} left</span>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
                All products are well stocked.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof PackageCheck;
  accent: string;
}) {
  return (
    <div className={cn("rounded-3xl border bg-gradient-to-br p-5 shadow-[0_16px_32px_rgba(15,23,42,0.04)]", accent)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="grid size-10 place-items-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-black/5">
          <Icon className="size-4 text-[#7c2d12]" />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Order["status"] }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "Delivered" && "bg-green-100 text-green-800",
        status === "Cancelled" && "bg-red-100 text-red-700",
        status !== "Delivered" && status !== "Cancelled" && "bg-muted text-foreground",
      )}
    >
      {status}
    </span>
  );
}

/* -------------------------------- customers ------------------------------- */

interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  pincode: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

function CustomersAdmin() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void adminApiRequest<{ items: AdminCustomer[] }>("/customers")
      .then((result) => {
        if (active) setCustomers(result.items);
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load customers");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);

  if (loading) {
    return <p className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">Loading customer records…</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <button className="mt-3 rounded-lg border px-4 py-2 text-sm font-semibold" onClick={() => setReload((value) => value + 1)}>
          Retry
        </button>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <p className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
        No registered customers or order contacts yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <table className="w-full min-w-[800px] text-sm">
        <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="p-3">Customer</th>
            <th className="p-3">Contact</th>
            <th className="p-3">City</th>
            <th className="p-3">Orders</th>
            <th className="p-3">Total spent</th>
            <th className="p-3">Last order</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="p-3">
                <p className="font-medium">{customer.name}</p>
                <p className="text-xs text-muted-foreground">{customer.pincode}</p>
              </td>
              <td className="p-3">
                <p>{customer.email || "—"}</p>
                <p className="text-xs text-muted-foreground">+91 {customer.phone}</p>
              </td>
              <td className="p-3">{customer.city}</td>
              <td className="p-3">{customer.orderCount}</td>
              <td className="p-3">{inr(customer.totalSpent)}</td>
              <td className="p-3">
                {customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleString("en-IN") : "No orders yet"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* --------------------------------- products ------------------------------- */

const emptyDraft = (): Product => ({
  id: `PRD-${Date.now().toString().slice(-6)}`,
  slug: "",
  name: "",
  category: "flowers",
  subcategory: "",
  shortDescription: "",
  description: "",
  price: 0,
  mrp: 0,
  rating: 4.5,
  reviews: 0,
  stock: 10,
  sku: `FF-NEW-${Date.now().toString().slice(-4)}`,
  images: [],
  tags: [],
  color: "Multicolour",
  sameDay: true,
  isBestSeller: false,
  isFeatured: false,
  isPremium: false,
  care: "",
  contains: [],
});

function ProductsAdmin() {
  const products = useCatalog((s) => s.products);
  const { addProduct, updateProduct, deleteProduct } = useCatalog.getState();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | CategorySlug>("all");
  const [draft, setDraft] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (!term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)),
    );
  }, [products, q, cat]);

  async function save(p: Product) {
    if (!p.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (p.images.length === 0) {
      toast.error("Upload at least one product photo");
      return;
    }
    const finished: Product = {
      ...p,
      slug: p.slug || slugify(p.name),
      shortDescription: p.shortDescription || `${p.subcategory || p.category} · FFO Studio`,
    };
    setSaving(true);
    try {
      const exists = products.some((x) => x.id === finished.id);
      const result = await adminApiRequest<{ product: Product }>(
        exists ? `/products/${encodeURIComponent(finished.id)}` : "/products",
        {
          method: exists ? "PUT" : "POST",
          body: JSON.stringify(finished),
        },
      );
      if (exists) updateProduct(finished.id, result.product);
      else addProduct(result.product);
      toast.success(exists ? "Product updated" : "Product added");
      setDraft(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or SKU"
            className="input-base pl-9"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value as "all" | CategorySlug)}
          className="input-base w-44"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setDraft(emptyDraft())}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" /> New product
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {list.map((p) => (
              <tr key={p.id}>
                <td className="p-3">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.sku}</p>
                </td>
                <td className="p-3 capitalize">{p.category}</td>
                <td className="p-3">
                  <input
                    type="number"
                    value={p.price}
                    onChange={(e) => updateProduct(p.id, { price: Number(e.target.value) })}
                    onBlur={() => {
                      void adminApiRequest(`/products/${encodeURIComponent(p.id)}`, {
                        method: "PATCH",
                        body: JSON.stringify({ price: p.price }),
                      }).catch((error) => {
                        toast.error(error instanceof Error ? error.message : "Could not save price");
                        void hydrateCatalogFromBackend();
                      });
                    }}
                    className="input-base h-9 w-24 py-1"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    value={p.stock}
                    onChange={(e) => updateProduct(p.id, { stock: Number(e.target.value) })}
                    onBlur={() => {
                      void adminApiRequest(`/products/${encodeURIComponent(p.id)}`, {
                        method: "PATCH",
                        body: JSON.stringify({ stock: p.stock }),
                      }).catch((error) => {
                        toast.error(error instanceof Error ? error.message : "Could not save stock");
                        void hydrateCatalogFromBackend();
                      });
                    }}
                    className="input-base h-9 w-20 py-1"
                  />
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDraft(p)}
                      className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await adminApiRequest(`/products/${encodeURIComponent(p.id)}`, { method: "DELETE" });
                          deleteProduct(p.id);
                          toast.success("Product removed");
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Could not remove product");
                        }
                      }}
                      className="rounded-lg border border-destructive/40 px-2 py-1.5 text-destructive"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No products match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {draft && (
        <ProductEditor
          value={draft}
          onChange={setDraft}
          onClose={() => setDraft(null)}
          onSave={() => void save(draft)}
          saving={saving}
        />
      )}
    </div>
  );
}

function ProductEditor({
  value,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  value: Product;
  onChange: (p: Product) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const set = (patch: Partial<Product>) => onChange({ ...value, ...patch });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-6">
      <h2 className="font-display text-lg font-bold">
        {value.name ? `Edit — ${value.name}` : "New product"}
      </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input value={value.name} onChange={(e) => set({ name: e.target.value })} className="input-base" />
          </Field>
          <Field label="Category">
            <select
              value={value.category}
              onChange={(e) => set({ category: e.target.value as CategorySlug })}
              className="input-base"
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Subcategory">
            <input
              value={value.subcategory}
              onChange={(e) => set({ subcategory: e.target.value })}
              className="input-base"
            />
          </Field>
          <Field label="Colour">
            <input value={value.color} onChange={(e) => set({ color: e.target.value })} className="input-base" />
          </Field>
          <Field label="Price (₹)">
            <input
              type="number"
              value={value.price}
              onChange={(e) => set({ price: Number(e.target.value) })}
              className="input-base"
            />
          </Field>
          <Field label="MRP (₹)">
            <input
              type="number"
              value={value.mrp}
              onChange={(e) => set({ mrp: Number(e.target.value) })}
              className="input-base"
            />
          </Field>
          <Field label="Stock">
            <input
              type="number"
              value={value.stock}
              onChange={(e) => set({ stock: Number(e.target.value) })}
              className="input-base"
            />
          </Field>
        </div>

        <Field label="Product photos (first photo is the main one)" className="mt-4">
          <ImagesEditor
            images={value.images}
            category={value.category}
            onChange={(images) => set({ images })}
          />
        </Field>

        <Field label="Description" className="mt-4">
          <textarea
            value={value.description}
            onChange={(e) => set({ description: e.target.value })}
            rows={4}
            className="input-base"
          />
        </Field>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Toggle label="Same-day" checked={value.sameDay} onChange={(v) => set({ sameDay: v })} />
          <Toggle label="Bestseller" checked={value.isBestSeller} onChange={(v) => set({ isBestSeller: v })} />
          <Toggle label="Featured" checked={value.isFeatured} onChange={(v) => set({ isFeatured: v })} />
          <Toggle label="Premium" checked={value.isPremium} onChange={(v) => set({ isPremium: v })} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save product"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block text-sm", className)}>
      <span className="mb-1 block font-medium">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/* --------------------------------- orders --------------------------------- */

const STATUSES: Order["status"][] = [
  "Placed",
  "Preparing",
  "Out for delivery",
  "Delivered",
  "Cancelled",
];

function OrdersAdmin() {
  const orders = useAccount((s) => s.orders);
  const setOrderStatus = useAccount((s) => s.setOrderStatus);

  if (orders.length === 0)
    return (
      <p className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
        No orders yet. Orders placed in the store appear here.
      </p>
    );

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">#{o.id}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(o.placedAt).toLocaleString("en-IN")} · {o.payment}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center font-semibold">
                <IndianRupee className="size-4" />
                {o.total.toLocaleString("en-IN")}
              </span>
              <select
                value={o.status}
                onChange={async (e) => {
                  const status = e.target.value as Order["status"];
                  try {
                    const result = await adminApiRequest<{ order: Order }>(
                      `/orders/${encodeURIComponent(o.id)}/status`,
                      { method: "PATCH", body: JSON.stringify({ status }) },
                    );
                    setOrderStatus(o.id, result.order.status);
                    toast.success(`Order #${o.id} → ${result.order.status}`);
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Could not update order status");
                  }
                }}
                className="input-base h-9 w-44 py-1"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Customer details
              </p>
              <p className="font-medium">{o.customer?.name ?? o.address.name}</p>
              <p className="text-sm text-muted-foreground">{o.customer?.email || "No email"}</p>
              <p className="text-sm text-muted-foreground">+91 {o.customer?.phone ?? o.address.phone}</p>
            </div>

            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Shipping
              </p>
              <p className="text-sm text-muted-foreground">
                {o.shipping?.address?.line1 ?? o.address.line1}, {o.shipping?.address?.city ?? o.address.city}
              </p>
              <p className="text-sm text-muted-foreground">
                {o.shipping?.address?.pincode ?? o.address.pincode} · {o.shipping?.method ?? o.slot}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Payment & totals
              </p>
              <p className="text-sm">{o.payment}</p>
              <p className="text-sm text-muted-foreground">
                Total: {inr(o.totals?.total ?? o.total)}
              </p>
              <p className="text-xs text-muted-foreground">
                {o.metadata?.source ? `Source: ${o.metadata.source}` : "Source: unknown"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border bg-muted/20 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Order items
            </p>
            <ul className="space-y-2 text-sm">
              {o.items.map((i) => (
                <li key={`${o.id}-${i.productId}`} className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-none last:pb-0">
                  <span className="flex min-w-0 items-center gap-2">
                    <StoreProductImage
                      src={i.image}
                      productId={i.productId}
                      alt={i.name}
                      className="size-12 shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate">{i.name} × {i.qty}</span>
                      {i.variant && <span className="text-muted-foreground">{i.variant}</span>}
                    </span>
                  </span>
                  <span className="font-medium">{inr(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            {(o.items.some((i) => i.message) || o.items.some((i) => i.addons?.length)) && (
              <div className="mt-3 rounded-lg bg-background/60 p-2 text-xs text-muted-foreground">
                {o.items
                  .filter((i) => i.message || i.addons?.length)
                  .map((i) => (
                    <div key={`${o.id}-meta-${i.productId}`}>
                      {i.message && <p>Message: {i.message}</p>}
                      {i.addons?.length ? <p>Add-ons: {i.addons.join(", ")}</p> : null}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------- coupons -------------------------------- */

function CouponsAdmin() {
  const coupons = useCatalog((s) => s.coupons);
  const { upsertCoupon, deleteCoupon } = useCatalog.getState();
  const [draft, setDraft] = useState<Coupon>({
    code: "",
    type: "percent",
    value: 10,
    minOrder: 499,
    label: "",
    active: true,
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {coupons.map((c) => (
          <div key={c.code} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
            <div>
              <p className="font-semibold">{c.code}</p>
              <p className="text-xs text-muted-foreground">
                {c.label} · min order {inr(c.minOrder)}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={c.active}
                  onChange={(e) => upsertCoupon({ ...c, active: e.target.checked })}
                />
                Active
              </label>
              <button
                onClick={() => deleteCoupon(c.code)}
                className="rounded-lg border border-destructive/40 px-2 py-1.5 text-destructive"
                aria-label={`Delete ${c.code}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && (
          <p className="rounded-2xl border bg-card p-6 text-center text-muted-foreground">
            No coupons yet.
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.code.trim()) {
            toast.error("Coupon code is required");
            return;
          }
          upsertCoupon({
            ...draft,
            code: draft.code.trim().toUpperCase(),
            label: draft.label || `${draft.value}${draft.type === "percent" ? "%" : "₹"} off`,
          });
          toast.success("Coupon saved");
          setDraft({ code: "", type: "percent", value: 10, minOrder: 499, label: "", active: true });
        }}
        className="h-fit rounded-2xl border bg-card p-5"
      >
        <h2 className="font-display text-lg font-bold">Add / update coupon</h2>
        <div className="mt-3 space-y-3">
          <Field label="Code">
            <input
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value })}
              className="input-base"
            />
          </Field>
          <Field label="Type">
            <select
              value={draft.type}
              onChange={(e) => setDraft({ ...draft, type: e.target.value as Coupon["type"] })}
              className="input-base"
            >
              <option value="percent">Percent off</option>
              <option value="fixed">Flat amount off</option>
              <option value="shipping">Free delivery</option>
            </select>
          </Field>
          <Field label="Value">
            <input
              type="number"
              value={draft.value}
              onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })}
              className="input-base"
            />
          </Field>
          <Field label="Minimum order (₹)">
            <input
              type="number"
              value={draft.minOrder}
              onChange={(e) => setDraft({ ...draft, minOrder: Number(e.target.value) })}
              className="input-base"
            />
          </Field>
          <Field label="Label">
            <input
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              className="input-base"
            />
          </Field>
        </div>
        <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
          Save coupon
        </button>
      </form>
    </div>
  );
}

/* -------------------------------- settings -------------------------------- */

function SettingsAdmin() {
  const settings = useCatalog((s) => s.settings);
  const updateSettings = useCatalog((s) => s.updateSettings);
  const resetCatalog = useCatalog((s) => s.resetCatalog);

  return (
    <div className="max-w-2xl space-y-4 rounded-2xl border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Store name">
          <input
            value={settings.storeName}
            onChange={(e) => updateSettings({ storeName: e.target.value })}
            className="input-base"
          />
        </Field>
        <Field label="Support phone">
          <input
            value={settings.supportPhone}
            onChange={(e) => updateSettings({ supportPhone: e.target.value })}
            className="input-base"
          />
        </Field>
        <Field label="Support email">
          <input
            value={settings.supportEmail}
            onChange={(e) => updateSettings({ supportEmail: e.target.value })}
            className="input-base"
          />
        </Field>
        <Field label="Delivery fee (₹)">
          <input
            type="number"
            value={settings.deliveryFee}
            onChange={(e) => updateSettings({ deliveryFee: Number(e.target.value) })}
            className="input-base"
          />
        </Field>
        <Field label="Free delivery above (₹)">
          <input
            type="number"
            value={settings.freeDeliveryThreshold}
            onChange={(e) => updateSettings({ freeDeliveryThreshold: Number(e.target.value) })}
            className="input-base"
          />
        </Field>
      </div>

      <Field label="Promotional strip text">
        <input
          value={settings.promoStrip}
          onChange={(e) => updateSettings({ promoStrip: e.target.value })}
          className="input-base"
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={settings.ordersOpen}
          onChange={(e) => updateSettings({ ordersOpen: e.target.checked })}
        />
        Accepting orders
      </label>

      <button
        onClick={() => {
          resetCatalog();
          toast.success("Catalogue reset to defaults");
        }}
        className="rounded-lg border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive"
      >
        Reset catalogue & settings
      </button>
    </div>
  );
}

function compressImage(file: File, max = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image"));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function ImagesEditor({
  images,
  category,
  onChange,
}: {
  images: string[];
  category: string;
  onChange: (images: string[]) => void;
}) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const list = images.filter((i) => i && i !== "/placeholder.svg");

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const remainingSlots = 8 - list.length;
    if (remainingSlots <= 0) {
      toast.error("A product can have up to 8 photos");
      return;
    }

    setBusy(true);
    const added: string[] = [];
    const failures: string[] = [];
    const selectedFiles = Array.from(files);
    if (selectedFiles.length > remainingSlots) {
      toast.error(`Only ${remainingSlots} more photo${remainingSlots === 1 ? "" : "s"} can be added`);
    }

    try {
      for (const f of selectedFiles.slice(0, remainingSlots)) {
        if (!f.type.startsWith("image/")) {
          failures.push(`${f.name}: not an image file`);
          continue;
        }
        if (f.size > 10 * 1024 * 1024) {
          failures.push(`${f.name}: larger than 10 MB`);
          continue;
        }

        try {
        const image = await compressImage(f);
        const result = await adminApiRequest<{ url: string }>("/images", {
          method: "POST",
          body: JSON.stringify({ image }),
        });
        added.push(result.url);
        } catch (error) {
          failures.push(`${f.name}: ${error instanceof Error ? error.message : "upload failed"}`);
        }
      }
      if (added.length) {
        onChange([...list, ...added].slice(0, 8));
        toast.success(`${added.length} photo${added.length > 1 ? "s" : ""} added`);
      }
      if (failures.length) {
        toast.error(failures[0] ?? "Some images could not be uploaded");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not process selected images");
    } finally {
      setBusy(false);
    }
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {list.map((src, i) => (
          <div key={i} className="relative overflow-hidden rounded-lg border border-border bg-muted">
            <StoreProductImage
              src={src}
              category={category}
              alt={`Photo ${i + 1}`}
              className="aspect-square w-full object-cover"
            />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                Main
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-background/90 p-1 text-xs">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded px-1.5 disabled:opacity-30" aria-label="Move left">←</button>
              <button type="button" onClick={() => onChange(list.filter((_, k) => k !== i))} className="rounded px-1.5 text-destructive" aria-label="Remove photo">Remove</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="rounded px-1.5 disabled:opacity-30" aria-label="Move right">→</button>
            </div>
          </div>
        ))}
        {list.length < 8 && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center text-xs text-muted-foreground transition hover:border-primary hover:text-primary">
            <span className="text-2xl">+</span>
            {busy ? "Uploading to Cloudinary…" : "Upload photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                void onFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an image link" className="input-base flex-1" />
        <button
          type="button"
          className="rounded-md border border-border px-3 text-sm"
          onClick={() => {
            if (!url.trim()) return;
            onChange([...list, url.trim()].slice(0, 8));
            setUrl("");
          }}
        >
          Add
        </button>
      </div>
      <p className="text-xs text-muted-foreground">Up to 8 photos. Photos are resized automatically.</p>
    </div>
  );
}
