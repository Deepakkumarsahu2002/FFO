import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type Section } from "@/components/site/LegalPage";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Cancellation & Refund Policy — Flowers Forever" },
      {
        name: "description",
        content:
          "Cancellation windows, replacement rules and refund timelines for Flowers Forever orders.",
      },
      { property: "og:title", content: "Cancellation & Refund Policy — Flowers Forever" },
      { property: "og:description", content: "Cancellation windows and refund timelines." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => (
    <LegalPage
      title="Cancellation & Refund Policy"
      updated="Last updated 1 February 2026"
      sections={SECTIONS}
    />
  ),
});

const SECTIONS: Section[] = [
  {
    heading: "Cancelling an order",
    body: "Orders can be cancelled free of charge up to 24 hours before the selected delivery slot from My Orders. Cancellations inside 24 hours may attract a charge covering materials already used.",
  },
  {
    heading: "Items that cannot be cancelled",
    body: "Personalised products, custom-printed items and photo cakes cannot be cancelled once production has started, as they cannot be resold.",
  },
  {
    heading: "Damaged or incorrect deliveries",
    body: "Tell us within 24 hours of delivery and share a photograph. We arrange a free replacement or a full refund, whichever you prefer.",
  },
  {
    heading: "Failed deliveries",
    body: "If we cannot deliver because the address was incorrect or the recipient was unreachable after two attempts, the order is treated as delivered and is not refundable.",
  },
  {
    heading: "Refund timelines",
    body: "Approved refunds are returned to the original payment method within 5 to 7 business days. Cash-on-delivery refunds are sent by bank transfer within 7 business days of sharing your account details.",
  },
];
