import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowRight, Gift, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { resolveImage } from "@/data/images";
import { useAccount } from "@/store/account";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Flowers Forever" },
      { name: "description", content: "Log in to track orders, save addresses and reorder gifts." },
      { property: "og:title", content: "Log in — Flowers Forever" },
      { property: "og:description", content: "Log in to your Flowers Forever account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const loginWithEmailAndPassword = useAccount((s) => s.loginWithEmailAndPassword);
  const [form, setForm] = useState({ email: "", password: "" });

  return (
    <div className="container-x py-10 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-6 overflow-hidden rounded-[30px] border border-primary/10 bg-gradient-to-br from-[#fffaf5] via-white to-[#f5efe7] p-4 shadow-card md:grid-cols-[1.12fr_0.88fr]">
        <div className="relative overflow-hidden rounded-[26px]">
          <img
            src={resolveImage("hero-bouquet")}
            alt="Fresh flower arrangement"
            className="h-full min-h-[350px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
              <Sparkles className="size-3.5" /> Freshly arranged
            </span>
            <h2 className="mt-4 max-w-md font-display text-2xl font-bold leading-tight sm:text-3xl">
              Thoughtful gifting made beautifully simple.
            </h2>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/80">
              {[
                { icon: Gift, label: "Same-day gifting" },
                { icon: ShieldCheck, label: "Secure checkout" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <Icon className="size-4" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-[#f1e1d7] bg-white/90 p-5 shadow-[0_18px_55px_rgba(74,41,18,0.08)] backdrop-blur-sm sm:p-7">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-3.5" />
            </span>
            Flowers Forever
          </Link>

          <h1 className="mt-5 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in to track orders, save addresses and revisit your favorite gifts.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(form.email) || !form.password) {
                toast.error("Enter a valid email and password");
                return;
              }

              try {
                const isValid = await loginWithEmailAndPassword(form.email, form.password);
                if (!isValid) {
                  toast.error("Incorrect email or password");
                  return;
                }
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to log in. Please try again.");
                return;
              }

              toast.success("Logged in successfully");
              navigate({ to: "/account" });
            }}
          >
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-base"
                placeholder="ananya@example.com"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-base"
                placeholder="Enter your password"
              />
            </Field>

            <div className="flex items-center justify-between gap-2 text-xs">
              <Link to="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
                Create account
              </Link>
              <Link to="/forgot-password" className="font-semibold text-primary underline-offset-4 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold uppercase tracking-wide text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Log in
              <ArrowRight className="size-4" />
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link to="/terms" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
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
