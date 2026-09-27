import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, CreditCard, Lock, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useShop, computeTotals } from "@/store/shop";
import { useAccount, type Address } from "@/store/account";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

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

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, coupon, clearCart } = useShop();
  const { addresses, addAddress, placeOrder, user } = useAccount();
  const totals = computeTotals(items, coupon);

  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string | null>(addresses[0]?.id ?? null);
  const [form, setForm] = useState({ ...EMPTY_ADDRESS, name: user?.name ?? "", phone: user?.phone ?? "" });
  const [payment, setPayment] = useState("upi");
  const [placing, setPlacing] = useState(false);

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

  const codFee = payment === "cod" ? 49 : 0;
  const grandTotal = totals.total + codFee;

  function saveAddress() {
    if (!form.name || form.phone.length !== 10 || !form.line1 || form.pincode.length !== 6) {
      toast.error("Fill name, 10-digit phone, address and 6-digit pincode");
      return;
    }
    const a = addAddress(form);
    setSelected(a.id);
    setForm({ ...EMPTY_ADDRESS });
    toast.success("Address saved");
  }

  function confirm() {
    const address: Address | undefined = addresses.find((a) => a.id === selected);
    if (!address) {
      toast.error("Choose a delivery address");
      setStep(1);
      return;
    }
    setPlacing(true);
    setTimeout(() => {
      const order = placeOrder({
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
          messageSummary: items
            .map((i) => i.message || i.variant)
            .filter(Boolean)
            .join(" | ") || "No custom message",
        },
      });
      clearCart();
      setPlacing(false);
      toast.success("Order placed!");
      navigate({ to: "/orders", search: { placed: order.id } });
    }, 900);
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
                          onChange={() => setSelected(a.id)}
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
                <p className="text-sm font-semibold sm:col-span-2">Add a new address</p>
                <Input label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v.replace(/\D/g, "").slice(0, 10) })}
                />
                <Input label="Address line 1" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} />
                <Input label="Landmark (optional)" value={form.line2} onChange={(v) => setForm({ ...form, line2: v })} />
                <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
                <Input
                  label="Pincode"
                  value={form.pincode}
                  onChange={(v) => setForm({ ...form, pincode: v.replace(/\D/g, "").slice(0, 6) })}
                />
                <Input label="Label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} />
                <button
                  type="button"
                  onClick={saveAddress}
                  className="h-11 rounded-lg border border-primary text-sm font-semibold text-primary sm:col-span-2"
                >
                  Save address
                </button>
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
                <button type="button" onClick={() => setStep(1)} className="h-12 flex-1 rounded-xl border text-sm font-semibold">
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
                <img src={i.image} alt="" className="size-12 rounded-md object-cover" />
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
