import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  CreditCard,
  Home,
  LoaderCircle,
  Lock,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { useShop, computeTotals } from "@/store/shop";
import { useAccount, type Address, type Order } from "@/store/account";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StoreProductImage } from "@/components/site/StoreProductImage";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout — Flowers Forever" },
      { name: "description", content: "Confirm delivery details and place your gift order." },
      { property: "og:title", content: "Secure Checkout — Flowers Forever" },
      { property: "og:description", content: "Confirm delivery details and place your order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const PAYMENTS = [
  { id: "upi", label: "UPI (GPay, PhonePe, Paytm)" },
  { id: "card", label: "Credit / Debit card" },
  { id: "netbanking", label: "Net banking" },
  { id: "cod", label: "Cash on delivery (+₹49)" },
];

const EMPTY_ADDRESS = {
  label: "Home",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

function addressToForm(address: Address) {
  return {
    label: address.label,
    name: address.name,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city,
    state: address.state,
    pincode: address.pincode,
  };
}

function OrderConfirmation({ order }: { order: Order }) {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(10);
  const cashOnDelivery = order.payment.toLowerCase().includes("cash on delivery");

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      void navigate({ to: "/" });
    }, 10_000);
    const countdownTimer = window.setInterval(() => {
      setSecondsLeft((seconds) => Math.max(seconds - 1, 0));
    }, 1_000);

    return () => {
      window.clearTimeout(redirectTimer);
      window.clearInterval(countdownTimer);
    };
  }, [navigate]);

  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-10">
      <section
        className="w-full max-w-xl rounded-xl border bg-card p-6 text-center sm:p-9"
        aria-live="polite"
      >
        <CheckCircle2 className="mx-auto size-14 text-leaf" />
        <p className="mt-5 text-xs font-bold uppercase text-leaf">
          Order confirmed by Flowers Forever
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Your order is successful</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We received your order details and saved your order.
        </p>

        <div className="mt-6 rounded-lg bg-muted/50 p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Your unique order number
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-primary">#{order.id}</p>
        </div>

        <dl className="mt-5 grid gap-3 text-left text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Order total</dt>
            <dd className="font-semibold">{inr(order.total)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Payment method</dt>
            <dd className="font-semibold">{order.payment}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Payment status</dt>
            <dd className="font-semibold">
              {cashOnDelivery
                ? "Due on delivery"
                : "Online payment is not processed by this checkout yet"}
            </dd>
          </div>
        </dl>

        <div className="mt-5 border-t pt-4 text-left">
          <h2 className="text-sm font-semibold">Order details</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-4">
                <span>{item.name}</span>
                <span className="shrink-0 text-muted-foreground">Qty {item.qty}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Delivering to {order.address.name}: {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city},{" "}
            {order.address.state} {order.address.pincode}
          </p>
        </div>

        {!cashOnDelivery && (
          <p className="mt-4 text-left text-xs leading-relaxed text-muted-foreground">
            Your order is saved, but this checkout does not yet connect to a payment provider to
            collect or verify online payments.
          </p>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          Returning to the home page in{" "}
          <span className="font-semibold text-foreground">{secondsLeft}</span> seconds.
        </p>
        <button
          type="button"
          onClick={() => void navigate({ to: "/" })}
          className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          <Home className="size-4" /> Continue to home
        </button>
      </section>
    </div>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, coupon, clearCart } = useShop();
  const { addresses, addAddress, loadAddresses, placeOrder, user } = useAccount();
  const totals = computeTotals(items, coupon);

  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({
    ...EMPTY_ADDRESS,
    name: user?.name ?? "",
    phone: user?.phone ?? "",
  });
  const [payment, setPayment] = useState("upi");
  const [placing, setPlacing] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const account = useAccount.getState();
    if (!account.user?.id || !account.token) {
      navigate({ to: "/account" });
      return;
    }
    setAuthChecked(true);
  }, [navigate]);

  useEffect(() => {
    if (!user?.id) return;
    void loadAddresses(user.id).catch((error) => {
      toast.error(error instanceof Error ? error.message : "Could not load saved addresses");
    });
  }, [loadAddresses, user?.id]);

  useEffect(() => {
    const address = addresses.find((saved) => saved.id === selected) ?? addresses[0];
    if (!address) return;
    setSelected(address.id);
    setForm({
      label: address.label,
      name: address.name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
  }, [addresses]);

  if (confirmedOrder) {
    return <OrderConfirmation order={confirmedOrder} />;
  }

  if (placing) {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center py-10">
        <section className="max-w-md text-center" aria-live="polite" aria-busy="true">
          <LoaderCircle className="mx-auto size-12 animate-spin text-primary" />
          <h1 className="mt-5 font-display text-2xl font-bold">Confirming your order</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Please wait while we save your order with the backend and verify its order number. This
            can take a few seconds.
          </p>
        </section>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x grid place-items-center gap-3 py-24 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold">Nothing to check out</h1>
        <Link
          to="/products"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  if (!authChecked) {
    return (
      <div className="container-x py-16 text-center text-sm text-muted-foreground">
        Checking your account…
      </div>
    );
  }

  const codFee = payment === "cod" ? 49 : 0;
  const grandTotal = totals.total + codFee;

  async function saveAddress() {
    if (savingAddress) return;
    if (!form.name || form.phone.length !== 10 || !form.line1 || form.pincode.length !== 6) {
      toast.error("Fill name, 10-digit phone, address and 6-digit pincode");
      return;
    }
    setSavingAddress(true);
    try {
      const address = await addAddress(form);
      setSelected(address.id);
      setForm(addressToForm(address));
      toast.success("Address saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save address");
    } finally {
      setSavingAddress(false);
    }
  }

  async function confirm() {
    const address: Address | undefined = addresses.find((a) => a.id === selected);
    if (!address) {
      toast.error("Choose a delivery address");
      setStep(1);
      return;
    }
    setPlacing(true);

    try {
      const order = await placeOrder({
        items,
        total: grandTotal,
        address,
        deliveryDate: "As soon as possible",
        slot: "Standard delivery",
        payment: PAYMENTS.find((p) => p.id === payment)!.label,
        customer: {
          name: user?.name ?? address.name,
          email: user?.email ?? "",
          phone: address.phone,
          city: address.city,
          pincode: address.pincode,
        },
        shipping: {
          address,
          city: address.city,
          pincode: address.pincode,
          method: "Standard delivery",
        },
        totals: {
          subtotal: totals.subtotal,
          discount: totals.discount,
          delivery: totals.delivery,
          tax: totals.tax,
          total: grandTotal,
        },
        metadata: {
          source: "web",
          itemCount: items.length,
          messageSummary:
            items
              .map((i) => i.message || i.variant)
              .filter(Boolean)
              .join(" | ") || "No custom message",
        },
      });
      if (!order.id) {
        throw new Error(
          "The backend did not return an order number. Please contact support before retrying.",
        );
      }

      clearCart();
      setConfirmedOrder(order);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="container-x py-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Secure Checkout</h1>
      <ol className="mt-4 flex gap-2 text-xs font-semibold">
        {["Address", "Payment"].map((label, i) => (
          <li
            key={label}
            className={cn(
              "flex flex-1 items-center gap-2 rounded-lg border p-2.5",
              step === i + 1 && "border-primary bg-primary/5 text-primary",
            )}
          >
            <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {step > i + 1 ? <Check className="size-3" /> : i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          {step === 1 && (
            <section className="rounded-xl border bg-card p-5">
              <h2 className="mb-3 font-semibold">Delivery address</h2>
              {addresses.length > 0 && (
                <ul className="mb-4 grid gap-3 sm:grid-cols-2">
                  {addresses.map((a) => (
                    <li key={a.id}>
                      <label
                        className={cn(
                          "block cursor-pointer rounded-lg border p-3 text-sm",
                          selected === a.id && "border-primary bg-primary/5",
                        )}
                      >
                        <input
                          type="radio"
                          name="address"
                          className="sr-only"
                          checked={selected === a.id}
                          onChange={() => {
                            setSelected(a.id);
                            setForm(addressToForm(a));
                          }}
                        />
                        <p className="font-semibold">
                          {a.label} · {a.name}
                        </p>
                        <p className="text-muted-foreground">
                          {a.line1}
                          {a.line2 ? `, ${a.line2}` : ""}, {a.city} {a.state} — {a.pincode}
                        </p>
                        <p className="text-muted-foreground">+91 {a.phone}</p>
                      </label>
                    </li>
                  ))}
                </ul>
              )}

              <div className="grid gap-3 rounded-lg bg-cream p-4 sm:grid-cols-2">
                <p className="text-sm font-semibold sm:col-span-2">
                  {selected ? "Selected delivery address" : "Add a new address"}
                </p>
                <Input
                  readOnly={Boolean(selected)}
                  label="Full name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                />
                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v.replace(/\D/g, "").slice(0, 10) })}
                  readOnly={Boolean(selected)}
                />
                <Input
                  readOnly={Boolean(selected)}
                  label="Address line 1"
                  value={form.line1}
                  onChange={(v) => setForm({ ...form, line1: v })}
                />
                <Input
                  readOnly={Boolean(selected)}
                  label="Landmark (optional)"
                  value={form.line2}
                  onChange={(v) => setForm({ ...form, line2: v })}
                />
                <Input
                  readOnly={Boolean(selected)}
                  label="City"
                  value={form.city}
                  onChange={(v) => setForm({ ...form, city: v })}
                />
                <Input
                  readOnly={Boolean(selected)}
                  label="State"
                  value={form.state}
                  onChange={(v) => setForm({ ...form, state: v })}
                />
                <Input
                  label="Pincode"
                  value={form.pincode}
                  onChange={(v) => setForm({ ...form, pincode: v.replace(/\D/g, "").slice(0, 6) })}
                  readOnly={Boolean(selected)}
                />
                <Input
                  readOnly={Boolean(selected)}
                  label="Label"
                  value={form.label}
                  onChange={(v) => setForm({ ...form, label: v })}
                />
                {selected ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(null);
                      setForm({
                        ...EMPTY_ADDRESS,
                        name: user?.name ?? "",
                        phone: user?.phone ?? "",
                      });
                    }}
                    className="h-11 rounded-lg border border-primary text-sm font-semibold text-primary sm:col-span-2"
                  >
                    Add a new address
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={savingAddress}
                    onClick={() => void saveAddress()}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-primary text-sm font-semibold text-primary disabled:cursor-wait disabled:opacity-60 sm:col-span-2"
                  >
                    {savingAddress && <LoaderCircle className="size-4 animate-spin" />}
                    {savingAddress ? "Saving address…" : "Save address"}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => (selected ? setStep(2) : toast.error("Choose or add an address"))}
                className="mt-4 h-12 w-full rounded-xl bg-primary text-sm font-bold uppercase text-primary-foreground"
              >
                Continue to payment
              </button>
            </section>
          )}

          {step === 2 && (
            <section className="rounded-xl border bg-card p-5">
              <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <CreditCard className="size-4 text-primary" /> Payment method
              </h2>
              <ul className="grid gap-2">
                {PAYMENTS.map((p) => (
                  <li key={p.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm",
                        payment === p.id && "border-primary bg-primary/5",
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={payment === p.id}
                        onChange={() => setPayment(p.id)}
                        className="size-4 accent-[oklch(0.37_0.128_12)]"
                      />
                      {p.label}
                    </label>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3.5" /> Payments are simulated in this preview. No money is
                charged and no card details are stored.
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-12 flex-1 rounded-xl border text-sm font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={placing}
                  onClick={confirm}
                  className="h-12 flex-1 rounded-xl bg-primary text-sm font-bold uppercase text-primary-foreground disabled:opacity-60"
                >
                  {placing ? "Placing order…" : `Pay ${inr(grandTotal)}`}
                </button>
              </div>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-xl border bg-card p-4 lg:sticky lg:top-32">
          <h2 className="mb-3 font-semibold">Order summary</h2>
          <ul className="mb-3 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex gap-2">
                <StoreProductImage
                  src={i.image}
                  productId={i.productId}
                  alt=""
                  className="size-12 rounded-md object-cover"
                />
                <span className="flex-1">
                  <span className="line-clamp-1">{i.name}</span>
                  <span className="text-xs text-muted-foreground">Qty {i.qty}</span>
                </span>
                <span className="font-semibold">{inr(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1.5 border-t pt-3 text-sm">
            <Row label="Subtotal" value={inr(totals.subtotal)} />
            {totals.discount > 0 && <Row label="Discount" value={`− ${inr(totals.discount)}`} />}
            <Row label="Delivery" value={totals.delivery === 0 ? "FREE" : inr(totals.delivery)} />
            {codFee > 0 && <Row label="COD fee" value={inr(codFee)} />}
            <Row label="GST (5%)" value={inr(totals.tax)} />
            <div className="border-t pt-2">
              <Row label="Total" value={inr(grandTotal)} bold />
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={bold ? "font-bold" : "text-muted-foreground"}>{label}</dt>
      <dd className={bold ? "font-bold" : "font-semibold"}>{value}</dd>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className={cn("input-base", readOnly && "bg-muted/50 text-muted-foreground")}
      />
    </label>
  );
}
