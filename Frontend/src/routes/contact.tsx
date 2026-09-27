import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Flowers Forever — We're Here to Help" },
      {
        name: "description",
        content:
          "Reach the Flowers Forever team for order help, bulk gifting and corporate enquiries. Support available 9 AM to 9 PM, all days.",
      },
      { property: "og:title", content: "Contact Flowers Forever" },
      { property: "og:description", content: "Order help, bulk gifting and corporate enquiries." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", orderId: "", message: "" });

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Talk to us</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Our gifting team is available 9 AM to 9 PM, every day of the week. Most queries are
        answered within two hours.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <form
          className="grid gap-4 rounded-xl border bg-card p-6 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name || !/^\S+@\S+\.\S+$/.test(form.email) || form.message.length < 10) {
              toast.error("Add your name, a valid email and a message of at least 10 characters");
              return;
            }
            toast.success("Thanks! We'll reply to " + form.email + " shortly.");
            setForm({ name: "", email: "", orderId: "", message: "" });
          }}
        >
          <label className="text-sm">
            <span className="mb-1 block font-medium">Your name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-base" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Email</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-base" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Order ID (optional)</span>
            <input value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} className="input-base" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">How can we help?</span>
            <textarea
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-lg border p-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            className="h-12 rounded-xl bg-primary text-sm font-bold uppercase tracking-wide text-primary-foreground sm:col-span-2"
          >
            Send message
          </button>
        </form>

        <aside className="h-fit space-y-4 rounded-xl border bg-card p-6 text-sm">
          <p className="flex items-start gap-3">
            <Phone className="mt-0.5 size-4 text-primary" /> +91 98000 12345
          </p>
          <p className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 text-primary" /> care@flowersforever.in
          </p>
          <p className="flex items-start gap-3">
            <MessageSquare className="mt-0.5 size-4 text-primary" /> WhatsApp support, 9 AM – 9 PM
          </p>
          <p className="flex items-start gap-3 text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            Flowers Forever Studio, 2nd Floor, Saki Vihar Road, Powai, Mumbai 400072
          </p>
        </aside>
      </div>
    </div>
  );
}
