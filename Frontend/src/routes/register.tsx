import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Gift, ShieldCheck, Sparkles, CheckCircle2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "@/store/account";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Flowers Forever" },
      { name: "description", content: "Create your Flowers Forever customer account." },
      { property: "og:title", content: "Create account — Flowers Forever" },
      { property: "og:description", content: "Register to shop, track orders and save addresses." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const register = useAccount((s) => s.register);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="container-x py-10 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-6 overflow-hidden rounded-[30px] border border-primary/10 bg-gradient-to-br from-[#fffaf5] via-white to-[#f4efe7] p-4 shadow-card md:grid-cols-[1.02fr_0.98fr]">
        <div className="order-2 relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#f4e2d4] via-[#fff8f3] to-[#efe3d8] p-6 sm:p-8 md:order-1">
          <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-10 left-10 size-40 rounded-full bg-[#f4c6a6]/30 blur-3xl" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary backdrop-blur-sm">
              <Sparkles className="size-3.5" /> New customers
            </span>

            <h2 className="mt-6 max-w-md font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              Create a profile designed for gifting.
            </h2>

            <div className="mt-6 space-y-3">
              {[
                { icon: Gift, label: "Same-day delivery for thoughtful moments" },
                { icon: ShieldCheck, label: "Secure account access and saved addresses" },
                { icon: CheckCircle2, label: "Track orders and revisit favorites anytime" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-white/70 p-3 shadow-sm backdrop-blur-sm"
                >
                  <span className="mt-0.5 inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <p className="text-sm text-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-8 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-primary/10 bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Delivery
              </p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">All India</p>
            </div>
            <div className="rounded-2xl border border-primary/10 bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Loved by
              </p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">2 Lakh+</p>
            </div>
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
            Create account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            First-time shoppers can register to save addresses, track orders and revisit favorite
            gifts.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();

              if (!form.name || !/^\S+@\S+\.\S+$/.test(form.email)) {
                toast.error("Enter your name and a valid email address");
                return;
              }

              if (form.phone.length !== 10) {
                toast.error("Enter a valid 10-digit mobile number");
                return;
              }

              if (form.password.length < 6) {
                toast.error("Choose a password with at least 6 characters");
                return;
              }

              if (form.password !== form.confirmPassword) {
                toast.error("Passwords do not match");
                return;
              }

              if (submitting) return;
              setSubmitting(true);
              try {
                const user = await register({
                  name: form.name,
                  email: form.email,
                  phone: form.phone,
                  password: form.password,
                });
                if (!user) {
                  toast.error("Please check your registration details and try again.");
                  return;
                }
                toast.success(`Welcome, ${user.name}!`);
                navigate({ to: "/account" });
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Unable to create account. Please try again.",
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <Field label="Full name">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-base"
                placeholder="Ananya Sharma"
              />
            </Field>
            <Field label="Email address">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-base"
                placeholder="ananya@example.com"
              />
            </Field>
            <Field label="Mobile number">
              <input
                inputMode="numeric"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                }
                className="input-base"
                placeholder="9800012345"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-base"
                placeholder="Minimum 6 characters"
              />
            </Field>
            <Field label="Confirm password">
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="input-base"
                placeholder="Re-enter password"
              />
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold uppercase tracking-wide text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" /> Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}
