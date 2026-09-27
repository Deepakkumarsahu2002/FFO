import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type Section } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Flowers Forever" },
      {
        name: "description",
        content:
          "How Flowers Forever collects, uses and protects your personal data, delivery details and payment information.",
      },
      { property: "og:title", content: "Privacy Policy — Flowers Forever" },
      { property: "og:description", content: "How we collect, use and protect your data." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => (
    <LegalPage
      title="Privacy Policy"
      updated="Last updated 1 February 2026"
      sections={SECTIONS}
    />
  ),
});

const SECTIONS: Section[] = [
  {
    heading: "Information we collect",
    body: "We collect your name, email, phone number, delivery and billing addresses, recipient details, order history and the message you choose to include with a gift. Payment card details are handled by our payment partners and are never stored on our servers.",
  },
  {
    heading: "How we use your information",
    body: "Your data is used to process and deliver orders, share delivery updates, provide customer support, prevent fraud and — where you have opted in — send offers and occasion reminders.",
  },
  {
    heading: "Sharing with partners",
    body: "We share the minimum necessary details with delivery partners, local florists and bakers, payment gateways and SMS or email providers. We never sell your personal data.",
  },
  {
    heading: "Cookies",
    body: "We use cookies and local storage to keep your cart, wishlist and selected city available between visits, and to measure how the site is used so we can improve it.",
  },
  {
    heading: "Data retention and security",
    body: "Order records are retained for as long as required by Indian tax law. Data is transmitted over encrypted connections and access is restricted to staff who need it.",
  },
  {
    heading: "Your rights",
    body: "You can request access to, correction of or deletion of your personal data at any time by writing to care@flowersforever.in. We respond within 30 days.",
  },
];
