import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, CheckCircle2, Truck, Clock, LoaderCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "@/store/account";
import { useShop } from "@/store/shop";
import { inr } from "@/lib/format";
import { productById } from "@/store/shop";
import { StoreProductImage } from "@/components/site/StoreProductImage";
import { OrderActionsMenu } from "@/components/site/OrderActionsMenu";

export const Route = createFileRoute("/orders")({
  validateSearch: (search: Record<string, unknown>): { placed?: string; track?: string } => ({
    placed: typeof search.placed === "string" ? search.placed : undefined,
    track: typeof search.track === "string" ? search.track : undefined,
  }),

  head: () => ({
    meta: [
      { title: "My Orders — Flowers Forever" },
      { name: "description", content: "Track your Flowers Forever gift orders." },
      { property: "og:title", content: "My Orders — Flowers Forever" },
      { property: "og:description", content: "Track and manage your gift orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersPage,
});

const STATUS_ICON = {
  Placed: Clock,
  Preparing: Package,
  "Out for delivery": Truck,
  Delivered: CheckCircle2,
  Cancelled: XCircle,
} as const;

function OrdersPage() {
  const { placed, track } = Route.useSearch();
  const { orders, loadOrders, cancelOrder, user } = useAccount();
  const addItem = useShop((s) => s.addItem);
  const [loading, setLoading] = useState(Boolean(user?.id));

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void loadOrders(user.id)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Could not load your orders");
      })
      .finally(() => setLoading(false));
  }, [loadOrders, user?.id]);

  useEffect(() => {
    if (!track || !orders.some((order) => order.id === track)) return;
    document
      .getElementById(`order-${track}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [orders, track]);

  return (
    <div className="container-x py-6">
      {placed && (
        <div className="mb-6 rounded-xl border border-leaf/40 bg-leaf/10 p-5">
          <p className="flex items-center gap-2 font-display text-lg font-bold text-leaf">
            <CheckCircle2 className="size-5" /> Order #{placed} confirmed
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            We've started preparing your gift. You'll get delivery updates by SMS and email.
          </p>
        </div>
      )}

      <h1 className="font-display text-2xl font-bold sm:text-3xl">My Orders</h1>

      {loading ? (
        <p className="mt-8 flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" /> Loading your orders…
        </p>
      ) : orders.length === 0 ? (
        <div className="mt-8 grid place-items-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <Package className="size-10 text-muted-foreground" />
          <p className="font-semibold">No orders yet</p>
          <Link
            to="/products"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Browse gifts
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o) => {
            const Icon = STATUS_ICON[o.status];
            return (
              <li
                key={o.id}
                id={`order-${o.id}`}
                className={`rounded-xl border bg-card p-4 ${track === o.id ? "border-primary ring-2 ring-primary/20" : ""}`}
              >
                <div className="flex flex-wrap items-center gap-3 border-b pb-3">
                  <span className="font-semibold">#{o.id}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      o.status === "Cancelled"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-leaf/10 text-leaf"
                    }`}
                  >
                    <Icon className="size-3.5" /> {o.status}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Placed {new Date(o.placedAt).toLocaleDateString("en-IN")}
                  </span>
                  <span className="ml-auto font-bold">{inr(o.total)}</span>
                  <OrderActionsMenu order={o} onCancel={cancelOrder} />
                </div>

                <ul className="mt-3 space-y-2">
                  {o.items.map((i) => (
                    <li key={i.productId} className="flex items-center gap-3 text-sm">
                      <StoreProductImage
                        src={i.image}
                        productId={i.productId}
                        alt=""
                        className="size-14 rounded-lg object-cover"
                      />
                      <span className="flex-1">
                        <Link
                          to="/product/$slug"
                          params={{ slug: i.slug }}
                          className="font-medium hover:text-primary"
                        >
                          {i.name}
                        </Link>
                        <span className="block text-xs text-muted-foreground">Qty {i.qty}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const p = productById(i.productId);
                          if (p) {
                            addItem(p, i.qty);
                            toast.success("Added to cart again");
                          }
                        }}
                        className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                      >
                        Buy again
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap items-center gap-3 border-t pt-3 text-xs text-muted-foreground">
                  <span>
                    Delivery: {o.deliveryDate} · {o.slot}
                  </span>
                  <span>
                    To {o.address.name}, {o.address.city} {o.address.pincode}
                  </span>
                  <span>Paid via {o.payment}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
