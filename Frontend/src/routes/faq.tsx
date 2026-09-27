import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQs — Delivery, Orders & Returns | Flowers Forever" },
      {
        name: "description",
        content:
          "Answers about India-wide PIN delivery, Bengaluru delivery times, orders, substitutions and refunds at Flowers Forever.",
      },
      { property: "og:title", content: "Frequently Asked Questions — Flowers Forever" },
      { property: "og:description", content: "Delivery, orders, refunds and customisation answers." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: FaqPage,
});

const FAQS = [
  ["Where do you deliver?", "We accept valid six-digit PIN codes across India. Check your PIN code on a product page for delivery availability and an estimate."],
  ["Can I get same-day delivery?", "Bengaluru PIN codes beginning 560 may have same-day or next-day options, depending on order time and available delivery slots. Other Indian PIN codes receive an estimated 2–5 day delivery window."],
  ["Can I change my delivery date?", "Yes, up to 24 hours before the selected slot from My Orders. Personalised and perishable items are an exception once production starts."],
  ["Will my bouquet look exactly like the photo?", "Very close. If a specific bloom is unavailable we substitute a flower of equal or higher value and keep the colour palette and size identical."],
  ["Can I add a personal message?", "Every order includes a free handwritten message card. You can add the text on the product page before adding to cart."],
  ["Are eggless cakes available?", "Yes. Most cakes have an eggless option, and all cakes are baked the morning of delivery."],
  ["What if nobody is home?", "Our delivery partner calls the recipient and then the sender. We re-attempt once the same day where possible."],
  ["How do refunds work?", "Approved refunds are returned to the original payment method within 5 to 7 business days."],
];

function FaqPage() {
  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Frequently asked questions</h1>
      <p className="mt-2 text-muted-foreground">Everything about delivery, orders and refunds.</p>
      <Accordion type="single" collapsible className="mt-8 max-w-3xl">
        {FAQS.map(([q, a]) => (
          <AccordionItem key={q} value={q}>
            <AccordionTrigger className="text-left">{q}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
