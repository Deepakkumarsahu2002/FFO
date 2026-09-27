import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { resolveImage } from "@/data/images";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — Flowers Forever" },
      { name: "description", content: "Reset your Flowers Forever customer password." },
      { property: "og:title", content: "Forgot password — Flowers Forever" },
      { property: "og:description", content: "Request a password reset for your Flowers Forever account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="container-x py-10 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-6 overflow-hidden rounded-[30px] border border-primary/10 bg-gradient-to-br from-[#fffaf5] via-white to-[#f3efe6] p-4 shadow-card md:grid-cols-[1.12fr_0.88fr]">
        <div className="relative overflow-hidden rounded-[26px]">
          <img
            src={resolveImage("cat-personalized")}
            alt="Gift hamper and floral arrangement"
            className="h-full min-h-[320px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
              <Sparkles className="size-3.5" /> Need help?
            </span>
            <h2 className="mt-4 max-w-md font-display text-2xl font-bold leading-tight sm:text-3xl">
              We’ll help you get back to your favorite flowers.
            </h2>
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
            Forgot password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the email connected to your account and we’ll send a reset link when the email
            provider is connected.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(email)) {
                toast.error("Enter a valid email address");
                return;
              }

              setSubmitted(true);
              toast.success("Reset link request received");
            }}
          >
            <Field label="Email address">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                placeholder="you@example.com"
                autoFocus
              />
            </Field>

            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold uppercase tracking-wide text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              {submitted ? "Reset link sent" : "Send reset link"}
              <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Back to login
            </Link>
            <span className="text-muted-foreground">Brevo-ready flow</span>
          </div>
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
