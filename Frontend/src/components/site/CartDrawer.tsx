import { Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useShop, computeTotals } from "@/store/shop";
import { useAccount } from "@/store/account";
import { inr } from "@/lib/format";
import { StoreProductImage } from "./StoreProductImage";

export function CartDrawer() {
  const navigate = useNavigate();
  const open = useShop((s) => s.cartOpen);
  const setOpen = useShop((s) => s.setCartOpen);
  const items = useShop((s) => s.items);
  const setQty = useShop((s) => s.setQty);
  const removeItem = useShop((s) => s.removeItem);
  const coupon = useShop((s) => s.coupon);
  const totals = computeTotals(items, coupon);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b p-4">
          <SheetTitle>Your cart ({items.length})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" />
            <p className="font-semibold">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Add a bouquet, cake or hamper to get started.
            </p>
            <Link
              to="/products"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            {totals.freeDeliveryGap > 0 && (
              <div className="border-b bg-cream px-4 py-3">
                <p className="text-xs font-medium">
                  Add {inr(totals.freeDeliveryGap)} more for FREE delivery
                </p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-leaf transition-all"
                    style={{
                      width: `${Math.min((totals.subtotal / (totals.subtotal + totals.freeDeliveryGap)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 rounded-xl border p-2">
                  <StoreProductImage
                    src={item.image}
                    productId={item.productId}
                    alt={item.name}
                    className="size-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
                    <p className="mt-0.5 text-sm font-semibold">{inr(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-lg border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQty(item.productId, item.qty - 1)}
                          className="grid size-8 place-items-center"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm">{item.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQty(item.productId, item.qty + 1)}
                          className="grid size-8 place-items-center"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:text-destructive"
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{inr(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-semibold">
                  {totals.delivery === 0 ? "FREE" : inr(totals.delivery)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{inr(totals.total)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/cart"
                  onClick={() => setOpen(false)}
                  className="grid h-11 place-items-center rounded-lg border text-sm font-semibold"
                >
                  View cart
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    const account = useAccount.getState();
                    navigate({ to: account.user?.id && account.token ? "/checkout" : "/account" });
                  }}
                  className="grid h-11 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
                >
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
