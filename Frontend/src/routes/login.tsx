import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAccount } from "@/store/account";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Flowers Forever" },
      { name: "description", content: "Sign in to track orders, save addresses and reorder gifts." },
      { property: "og:title", content: "Login — Flowers Forever" },
      { property: "og:description", content: "Sign in to your Flowers Forever account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useAccount((s) => s.login);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  return (
    <div className="container-x grid place-items-center py-16">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-card">
        <h1 className="font-display text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to track orders and save your addresses. Accounts are stored on this device for
          now — secure login arrives with the backend.
        </p>
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name || !/^\S+@\S+\.\S+$/.test(form.email) || form.phone.length !== 10) {
              toast.error("Enter your name, a valid email and a 10-digit phone number");
              return;
            }
            login(form);
            toast.success(`Signed in as ${form.name}`);
            navigate({ to: "/account" });
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
          <Field label="Email">
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
          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-primary text-sm font-bold uppercase tracking-wide text-primary-foreground"
          >
            Continue
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
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
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-semibold">{label}</span>
      {children}
    </label>
  );
}
