import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type Section } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Flowers Forever" },
      {
        name: "description",
        content:
          "The terms that apply when you order flowers, cakes, plants and gifts from Flowers Forever.",
      },
      { property: "og:title", content: "Terms & Conditions — Flowers Forever" },
      { property: "og:description", content: "Terms that apply to orders placed with us." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => (
    <LegalPage title="Terms & Conditions" updated="Last updated 1 February 2026" sections={SECTIONS} />
  ),
});

const SECTIONS: Section[] = [
  {
    heading: "Accepting these terms",
    body: "By placing an order on Flowers Forever you agree to these terms. If you do not agree, please do not use the service.",
  },
  {
    heading: "Orders and pricing",
    body: "All prices are in Indian Rupees and inclusive of applicable taxes unless stated otherwise. We may correct pricing errors and cancel affected orders with a full refund.",
  },
  {
    heading: "Product substitution",
    body: "Flowers are seasonal. Where a specific bloom, container or accessory is unavailable we substitute an item of equal or greater value, keeping the colour palette and overall look consistent.",
  },
  {
    heading: "Delivery",
    body: "Delivery times are estimates. We are not liable for delays caused by incorrect addresses, unavailable recipients, weather, strikes or other events beyond our control. Two delivery attempts are made where possible.",
  },
  {
    heading: "Acceptable use",
    body: "Gift messages must not contain unlawful, abusive or threatening content. We may refuse or cancel any order that breaches this.",
  },
  {
    heading: "Liability",
    body: "Our total liability for any order is limited to the amount paid for that order.",
  },
  {
    heading: "Governing law",
    body: "These terms are governed by the laws of India, with exclusive jurisdiction in the courts of Mumbai, Maharashtra.",
  },
];
