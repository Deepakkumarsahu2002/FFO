import { createFileRoute, Link } from "@tanstack/react-router";
import { Flower2, Truck, Leaf, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Flowers Forever — Our Story" },
      {
        name: "description",
        content:
          "Flowers Forever is an Indian gifting studio delivering hand-crafted gifts to valid PIN codes across India, with faster options in Bengaluru.",
      },
      { property: "og:title", content: "About Flowers Forever — Our Story" },
      {
        property: "og:description",
        content: "Hand-crafted gifts delivered across India, with same-day or next-day options in Bengaluru.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  { icon: Flower2, title: "Florist-crafted", body: "Every bouquet is arranged by hand on the day it ships." },
  { icon: Truck, title: "Fast Bengaluru delivery", body: "Same-day or next-day options, depending on order time and available slots." },
  { icon: Leaf, title: "Responsibly sourced", body: "Farm-direct blooms and recyclable packaging wherever possible." },
  { icon: HeartHandshake, title: "Care guaranteed", body: "Not delighted? We replace or refund the order." },
];

function AboutPage() {
  return (
    <div className="container-x py-10">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Make every moment bloom</h1>
        <p className="mt-4 text-muted-foreground">
          Flowers Forever began with one simple belief — that the small gestures matter most. A
          bouquet at the door on a hard morning. A midnight cake for a birthday nobody remembered.
          A plant that keeps growing long after the occasion has passed.
        </p>
        <p className="mt-3 text-muted-foreground">
          Today our studios in Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Pune, Kolkata,
          Bhubaneswar, Cuttack and Berhampur craft thousands of gifts every week. Flowers are
          sourced farm-direct, cakes are baked the morning of delivery, and every order is quality
          checked before it leaves our hands.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border bg-card p-5">
            <Icon className="size-6 text-primary" />
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 rounded-2xl bg-cream p-8 text-center sm:grid-cols-3">
        {[
          ["All India", "PIN code delivery"],
          ["50k+", "gifts delivered"],
          ["4.7★", "average rating"],
        ].map(([n, l]) => (
          <div key={l}>
            <p className="font-display text-3xl font-bold text-primary">{n}</p>
            <p className="text-sm text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/products"
          className="inline-block rounded-xl bg-primary px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground"
        >
          Explore our gifts
        </Link>
      </div>
    </div>
  );
}
