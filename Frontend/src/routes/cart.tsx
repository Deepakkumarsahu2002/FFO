import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, Heart, Tag } from "lucide-react";
import { toast } from "sonner";
import { useShop, computeTotals } from "@/store/shop";
import { useAccount } from "@/store/account";
import { inr } from "@/lib/format";
import { useCatalog, useProducts } from "@/store/catalog";
import { ProductRail } from "@/components/site/ProductRail";
import { StoreProductImage } from "@/components/site/StoreProductImage";
import { useShallow } from "zustand/react/shallow";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Flowers Forever" },
      { name: "description", content: "Review your gifts before checkout." },
      { property: "og:title", content: "Your Cart — Flowers Forever" },
      { property: "og:description", content: "Review your gifts before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const allProducts = useProducts();
  const coupons = useCatalog(useShallow((s) => s.coupons.filter((c) => c.active)));
  const { items, setQty, removeItem, coupon, applyCoupon, clearCoupon, toggleWishlist } = useShop();
  const totals = computeTotals(items, coupon);
  const [code, setCode] = useState("");

  if (items.length === 0) {
    return (
      <div className="container-x grid place-items-center gap-3 py-24 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Every celebration starts somewhere. Pick a bouquet, cake or hamper to begin.
        </p>
        <Link
          to="/products"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Shopping Cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">{items.length} item(s) ready to gift</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          {totals.freeDeliveryGap > 0 && (
            <div className="rounded-xl bg-cream p-4">
              <p className="text-sm font-medium">
                Add {inr(totals.freeDeliveryGap)} more for FREE DELIVERY
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-leaf transition-all"
                  style={{
                    width: `${Math.min(
                      (totals.subtotal / (totals.subtotal + totals.freeDeliveryGap)) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 rounded-xl border bg-card p-3">
              <Link to="/product/$slug" params={{ slug: item.slug }} className="shrink-0">
                <StoreProductImage
                  src={item.image}
                  productId={item.productId}
                  alt={item.name}
                  className="size-28 rounded-lg object-cover"
                />
              </Link>
              <div className="flex-1">
                <Link
                  to="/product/$slug"
                  params={{ slug: item.slug }}
                  className="font-semibold hover:text-primary"
                >
                  {item.name}
                </Link>
                {item.variant && (
                  <p className="mt-0.5 text-xs text-muted-foreground">Delivery: {item.variant}</p>
                )}
                {item.message && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    Message: "{item.message}"
                  </p>
                )}
                <p className="mt-1 font-bold">
                  {inr(item.price)}{" "}
                  {item.mrp > item.price && (
                    <span className="text-xs font-normal text-muted-foreground line-through">
                      {inr(item.mrp)}
                    </span>
                  )}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="flex items-center rounded-lg border">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQty(item.productId, item.qty - 1)}
                      className="grid size-9 place-items-center"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold">{item.qty}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQty(item.productId, item.qty + 1)}
                      className="grid size-9 place-items-center"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      toggleWishlist(item.productId);
                      removeItem(item.productId);
                      toast("Moved to wishlist");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium"
                  >
                    <Heart className="size-3.5" /> Move to wishlist
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="h-fit space-y-4 lg:sticky lg:top-32">
          <div className="rounded-xl border bg-card p-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Tag className="size-4 text-primary" /> Apply coupon
            </p>
            {coupon ? (
              <div className="flex items-center justify-between rounded-lg bg-leaf/10 px-3 py-2 text-sm">
                <span className="font-semibold text-leaf">{coupon} applied</span>
                <button type="button" onClick={clearCoupon} className="text-xs underline">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  aria-label="Coupon code"
                  className="h-10 flex-1 rounded-lg border px-3 text-sm uppercase outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    const res = applyCoupon(code);
                    res.ok ? toast.success(res.message) : toast.error(res.message);
                    if (res.ok) setCode("");
                  }}
                  className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
                >
                  Apply
                </button>
              </div>
            )}
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {coupons.map((c) => (
                <li key={c.code}>
                  <strong className="text-foreground">{c.code}</strong> — {c.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <h2 className="mb-3 font-semibold">Order summary</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Subtotal" value={inr(totals.subtotal)} />
              {totals.discount > 0 && (
                <Row label="Coupon discount" value={`− ${inr(totals.discount)}`} accent />
              )}
              <Row
                label="Delivery"
                value={totals.delivery === 0 ? "FREE" : inr(totals.delivery)}
                accent={totals.delivery === 0}
              />
              <Row label="GST (5%)" value={inr(totals.tax)} />
              <div className="border-t pt-2">
                <Row label="Total payable" value={inr(totals.total)} bold />
              </div>
            </dl>
            <button
              type="button"
              onClick={() => {
                const account = useAccount.getState();
                navigate({ to: account.user?.id && account.token ? "/checkout" : "/account" });
              }}
              className="mt-4 grid h-12 place-items-center rounded-xl bg-primary text-sm font-bold uppercase tracking-wide text-primary-foreground"
            >
              Proceed to checkout
            </button>
          </div>
        </aside>
      </div>

      <ProductRail
        title="You may also like"
        products={allProducts.filter((p) => !items.some((i) => i.productId === p.id)).slice(0, 10)}
      />
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <dt className={bold ? "font-bold" : "text-muted-foreground"}>{label}</dt>
      <dd className={`${bold ? "font-bold" : "font-semibold"} ${accent ? "text-leaf" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
