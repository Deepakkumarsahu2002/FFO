import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, CheckCircle2, CreditCard, Home, LoaderCircle, Lock, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useShop, computeTotals } from "@/store/shop";
import { useAccount, type Address, type Order, type OrderTotalsSnapshot } from "@/store/account";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StoreProductImage } from "@/components/site/StoreProductImage";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout — Flowers Forever" },
      { name: "description", content: "Confirm delivery details and pay securely with Razorpay." },
      { property: "og:title", content: "Secure Checkout — Flowers Forever" },
      { property: "og:description", content: "Confirm delivery details and pay securely." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

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

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => void navigate({ to: "/" }), 10_000);
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
      <section className="w-full max-w-xl rounded-xl border bg-card p-6 text-center sm:p-9" aria-live="polite">
        <CheckCircle2 className="mx-auto size-14 text-leaf" />
        <p className="mt-5 text-xs font-bold uppercase text-leaf">Order confirmed by Flowers Forever</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Payment successful</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your payment is verified and your order is confirmed.</p>
        <div className="mt-6 rounded-lg bg-muted/50 p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Your unique order number</p>
          <p className="mt-1 font-display text-2xl font-bold text-primary">#{order.id}</p>
        </div>
        <dl className="mt-5 grid gap-3 text-left text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">Order total</dt><dd className="font-semibold">{inr(order.total)}</dd></div>
          <div><dt className="text-muted-foreground">Payment method</dt><dd className="font-semibold">Razorpay</dd></div>
          <div className="sm:col-span-2"><dt className="text-muted-foreground">Payment status</dt><dd className="font-semibold text-leaf">Paid and verified</dd></div>
        </dl>
        <div className="mt-5 border-t pt-4 text-left">
          <h2 className="text-sm font-semibold">Order details</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {order.items.map((item) => <li key={`${item.productId}-${item.name}`} className="flex justify-between gap-4"><span>{item.name}</span><span className="shrink-0 text-muted-foreground">Qty {item.qty}</span></li>)}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Delivering to {order.address.name}: {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.state} {order.address.pincode}</p>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">Returning home in <span className="font-semibold text-foreground">{secondsLeft}</span> seconds.</p>
        <button type="button" onClick={() => void navigate({ to: "/" })} className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"><Home className="size-4" /> Continue to home</button>
      </section>
    </div>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, coupon, clearCart } = useShop();
  const { addresses, addAddress, loadAddresses, createRazorpayOrder, verifyRazorpayPayment, user } = useAccount();
  const totals = computeTotals(items, coupon);
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const cartSignature = items.map((item) => `${item.productId}:${item.qty}`).join("|");
  const checkoutIdentity = useRef({ signature: "", id: "" });
  if (checkoutIdentity.current.signature !== `${cartSignature}:${selected ?? ""}`) {
    checkoutIdentity.current = { signature: `${cartSignature}:${selected ?? ""}`, id: crypto.randomUUID() };
  }
  const [form, setForm] = useState({ ...EMPTY_ADDRESS, name: user?.name ?? "", phone: user?.phone ?? "" });
  const [placing, setPlacing] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(Boolean(user?.id));
  const [authChecked, setAuthChecked] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [paymentStage, setPaymentStage] = useState<"starting" | "verifying">("starting");
  const [serverTotals, setServerTotals] = useState<OrderTotalsSnapshot | null>(null);

  useEffect(() => {
    const account = useAccount.getState();
    if (!account.user?.id || !account.token) {
      void navigate({ to: "/account" });
      return;
    }
    setAuthChecked(true);
  }, [navigate]);

  useEffect(() => {
    if (!user?.id) {
      setLoadingAddresses(false);
      return;
    }
    setLoadingAddresses(true);
    void loadAddresses(user.id)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load saved addresses"))
      .finally(() => setLoadingAddresses(false));
  }, [loadAddresses, user?.id]);

  useEffect(() => {
    const address = addresses.find((saved) => saved.id === selected) ?? addresses[0];
    if (!address) return;
    setSelected(address.id);
    setForm(addressToForm(address));
  }, [addresses]);

  if (confirmedOrder) return <OrderConfirmation order={confirmedOrder} />;

  if (placing) {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center py-10">
        <section className="max-w-md text-center" aria-live="polite" aria-busy="true">
          <LoaderCircle className="mx-auto size-12 animate-spin text-primary" />
          <h1 className="mt-5 font-display text-2xl font-bold">{paymentStage === "starting" ? "Opening secure payment" : "Verifying your payment"}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{paymentStage === "starting" ? "Your order total is being checked and prepared securely with Razorpay." : "Please wait while Razorpay and our backend confirm your payment and order."}</p>
        </section>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x grid place-items-center gap-3 py-24 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold">Nothing to check out</h1>
        <Link to="/products" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Start shopping</Link>
      </div>
    );
  }

  if (!authChecked) return <div className="container-x py-16 text-center text-sm text-muted-foreground">Checking your account…</div>;

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
    const address = addresses.find((candidate) => candidate.id === selected);
    if (!address) {
      toast.error("Choose a delivery address");
      setStep(1);
      return;
    }

    setPlacing(true);
    setPaymentStage("starting");
    try {
      const gatewayOrder = await createRazorpayOrder({
        checkoutId: checkoutIdentity.current.id,
        items: items.map(({ productId, qty, variant, message, addons }) => ({ productId, qty, variant, message, addons })),
        address,
      });
      setServerTotals(gatewayOrder.totals);

      const { openRazorpayCheckout } = await import("@/lib/razorpay-checkout");
      const payment = await openRazorpayCheckout({
        key: gatewayOrder.keyId,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency,
        name: "Flowers Forever",
        description: `Order #${gatewayOrder.orderId}`,
        order_id: gatewayOrder.razorpayOrderId,
        prefill: { name: user?.name ?? address.name, email: user?.email ?? "", contact: address.phone },
        theme: { color: "#7c2d12" },
        modal: { confirm_close: true, escape: true, ondismiss: () => undefined },
      });

      if (payment.razorpay_order_id !== gatewayOrder.razorpayOrderId) {
        throw new Error("The payment response did not match this checkout. Check My Orders before retrying.");
      }

      setPaymentStage("verifying");
      const order = await verifyRazorpayPayment({
        orderId: gatewayOrder.orderId,
        razorpayOrderId: payment.razorpay_order_id,
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpaySignature: payment.razorpay_signature,
      });
      clearCart();
      setConfirmedOrder(order);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Razorpay checkout failed. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="container-x py-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Secure Checkout</h1>
      <ol className="mt-4 flex gap-2 text-xs font-semibold">
        {["Address", "Payment"].map((label, index) => (
          <li key={label} className={cn("flex flex-1 items-center gap-2 rounded-lg border p-2.5", step === index + 1 && "border-primary bg-primary/5 text-primary")}>
            <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{step > index + 1 ? <Check className="size-3" /> : index + 1}</span>
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
                  {addresses.map((address) => (
                    <li key={address.id}>
                      <label className={cn("block cursor-pointer rounded-lg border p-3 text-sm", selected === address.id && "border-primary bg-primary/5")}>
                        <input type="radio" name="address" className="sr-only" checked={selected === address.id} onChange={() => { setSelected(address.id); setForm(addressToForm(address)); }} />
                        <p className="font-semibold">{address.label} · {address.name}</p>
                        <p className="text-muted-foreground">{address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city} {address.state} — {address.pincode}</p>
                        <p className="text-muted-foreground">+91 {address.phone}</p>
                      </label>
                    </li>
                  ))}
                </ul>
              )}

              <div className="grid gap-3 rounded-lg bg-cream p-4 sm:grid-cols-2">
                <p className="text-sm font-semibold sm:col-span-2">{selected ? "Selected delivery address" : "Add a new address"}</p>
                <Input readOnly={Boolean(selected)} label="Full name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
                <Input label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value.replace(/\D/g, "").slice(0, 10) })} readOnly={Boolean(selected)} />
                <Input readOnly={Boolean(selected)} label="Address line 1" value={form.line1} onChange={(value) => setForm({ ...form, line1: value })} />
                <Input readOnly={Boolean(selected)} label="Landmark (optional)" value={form.line2} onChange={(value) => setForm({ ...form, line2: value })} />
                <Input readOnly={Boolean(selected)} label="City" value={form.city} onChange={(value) => setForm({ ...form, city: value })} />
                <Input readOnly={Boolean(selected)} label="State" value={form.state} onChange={(value) => setForm({ ...form, state: value })} />
                <Input label="Pincode" value={form.pincode} onChange={(value) => setForm({ ...form, pincode: value.replace(/\D/g, "").slice(0, 6) })} readOnly={Boolean(selected)} />
                <Input readOnly={Boolean(selected)} label="Label" value={form.label} onChange={(value) => setForm({ ...form, label: value })} />
                {selected ? (
                  <button type="button" onClick={() => { setSelected(null); setForm({ ...EMPTY_ADDRESS, name: user?.name ?? "", phone: user?.phone ?? "" }); }} className="h-11 rounded-lg border border-primary text-sm font-semibold text-primary sm:col-span-2">Add a new address</button>
                ) : (
                  <button type="button" disabled={savingAddress} onClick={() => void saveAddress()} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-primary text-sm font-semibold text-primary disabled:cursor-wait disabled:opacity-60 sm:col-span-2">
                    {savingAddress && <LoaderCircle className="size-4 animate-spin" />}{savingAddress ? "Saving address…" : "Save address"}
                  </button>
                )}
              </div>
              <button
                type="button"
                disabled={loadingAddresses || !selected || !addresses.some((address) => address.id === selected)}
                onClick={() => {
                  if (!selected || !addresses.some((address) => address.id === selected)) {
                    toast.error("Save or select a delivery address before continuing.");
                    return;
                  }
                  setStep(2);
                }}
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold uppercase text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingAddresses ? <><LoaderCircle className="size-4 animate-spin" /> Loading saved addresses…</> : selected ? "Continue to payment" : "Save or select an address to continue"}
              </button>
            </section>
          )}

          {step === 2 && (
            <section className="rounded-xl border bg-card p-5">
              <h2 className="mb-3 flex items-center gap-2 font-semibold"><CreditCard className="size-4 text-primary" /> Payment method</h2>
              <div className="flex items-center gap-3 rounded-lg border border-primary bg-primary/5 p-4 text-sm">
                <span className="grid size-5 place-items-center rounded-full border-2 border-primary"><span className="size-2.5 rounded-full bg-primary" /></span>
                <span className="flex-1 font-semibold">Razorpay</span>
                <span className="text-xs text-muted-foreground">UPI · Cards · Netbanking</span>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="size-3.5" /> Secure payment powered by Razorpay. Card details are handled by Razorpay and never stored by Flowers Forever.</p>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="h-12 flex-1 rounded-xl border text-sm font-semibold">Back</button>
                <button type="button" disabled={placing} onClick={() => void confirm()} className="h-12 flex-1 rounded-xl bg-primary text-sm font-bold uppercase text-primary-foreground disabled:opacity-60">{placing ? "Opening secure payment…" : `Pay ${inr(serverTotals?.total ?? totals.total)}`}</button>
              </div>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-xl border bg-card p-4 lg:sticky lg:top-32">
          <h2 className="mb-3 font-semibold">Order summary</h2>
          <ul className="mb-3 space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-2">
                <StoreProductImage src={item.image} productId={item.productId} alt="" className="size-12 rounded-md object-cover" />
                <span className="flex-1"><span className="line-clamp-1">{item.name}</span><span className="text-xs text-muted-foreground">Qty {item.qty}</span></span>
                <span className="font-semibold">{inr(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1.5 border-t pt-3 text-sm">
            <Row label="Subtotal" value={inr(serverTotals?.subtotal ?? totals.subtotal)} />
            {(serverTotals?.discount ?? totals.discount) > 0 && <Row label="Discount" value={`− ${inr(serverTotals?.discount ?? totals.discount)}`} />}
            <Row label="Delivery" value={(serverTotals?.delivery ?? totals.delivery) === 0 ? "FREE" : inr(serverTotals?.delivery ?? totals.delivery)} />
            <Row label="GST (5%)" value={inr(serverTotals?.tax ?? totals.tax)} />
            <div className="border-t pt-2"><Row label="Total" value={inr(serverTotals?.total ?? totals.total)} bold /></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return <div className="flex justify-between"><dt className={bold ? "font-bold" : "text-muted-foreground"}>{label}</dt><dd className={bold ? "font-bold" : "font-semibold"}>{value}</dd></div>;
}

function Input({ label, value, onChange, readOnly = false }: { label: string; value: string; onChange: (value: string) => void; readOnly?: boolean }) {
  return <label className="block text-sm"><span className="mb-1 block font-medium">{label}</span><input value={value} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} className={cn("input-base", readOnly && "bg-muted/50 text-muted-foreground")} /></label>;
}
