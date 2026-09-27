import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Truck,
  ShieldCheck,
  RefreshCcw,
  Headphones,
  Leaf,
  Star,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CATEGORIES } from "@/data/catalog";
import { useProducts } from "@/store/catalog";
import { IMAGES } from "@/data/images";
import { ProductRail } from "@/components/site/ProductRail";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flowers Forever — Send Flowers, Cakes, Plants & Gifts in India" },
      {
        name: "description",
        content:
          "Delivery to valid PIN codes across India, with same-day or next-day options in Bengaluru.",
      },
      { property: "og:title", content: "Flowers Forever — Make Every Moment Bloom" },
      {
        property: "og:description",
        content:
          "Hand-crafted bouquets, DIY kits and home décor delivered across India.",
      },
    ],
  }),
  component: Home,
});

const COLLECTIONS = [
  { label: "Best Sellers", sub: "Most-loved craft essentials", image: "cat-flowers" as const, category: "pipe-cleaner-supplies" },
  { label: "Ready Bouquets", sub: "Fresh arrangements for gifting", image: "cat-cakes" as const, category: "ready-bouquets" },
  { label: "DIY Flower Kits", sub: "Make your own bouquet kits", image: "cat-combo" as const, category: "diy-flower-kits" },
  { label: "Home Styling", sub: "Decor accents for modern spaces", image: "hero-bouquet" as const, category: "home-decor" },
  { label: "Floral Styling", sub: "For workshops and event setup", image: "cat-gifts" as const, category: "pipe-cleaner-supplies" },
  { label: "Gift Wrapping", sub: "Ribbons, wraps and finishing tools", image: "cat-personalized" as const, category: "pipe-cleaner-supplies" },
];

const HERO_SLIDES = [
  {
    key: "hero-bouquet" as const,
    eyebrow: "Signature floral picks",
    title: "Fresh arrangements for everyday celebrations",
  },
  {
    key: "cat-combo" as const,
    eyebrow: "Best value bundles",
    title: "Thoughtful gift combos made for quick gifting",
  },
  {
    key: "cat-plants" as const,
    eyebrow: "Home styling favorites",
    title: "Decor accents and greenery that elevate the space",
  },
];

const WHY = [
  { icon: Leaf, title: "Fresh & Quality Assured", text: "Sourced daily from partner farms." },
  { icon: Truck, title: "Fast Bengaluru Delivery", text: "Same-day or next-day options, based on order time and available slots." },
  { icon: ShieldCheck, title: "Secure Payments", text: "UPI, cards and net banking." },
  { icon: RefreshCcw, title: "Easy Returns", text: "Replacement for damaged gifts." },
  { icon: Headphones, title: "Customer Support", text: "7 days a week, real humans." },
];

const REVIEWS = [
  {
    name: "Ananya S.",
    city: "Bangalore",
    text: "Ordered a midnight rose bouquet for my husband's birthday. It arrived at 12:02 AM, perfectly fresh. Made the whole night.",
  },
  {
    name: "Rohit M.",
    city: "Pune",
    text: "The chocolate truffle cake was genuinely bakery quality, not the usual delivery compromise. Packaging was beautiful too.",
  },
  {
    name: "Priyanka D.",
    city: "Bhubaneswar",
    text: "I send plants to my parents every festival. Always healthy, always on time, and support actually answers the phone.",
  },
  {
    name: "Karan V.",
    city: "Delhi",
    text: "Corporate hampers for 40 clients handled without a single mix-up. Invoices and tracking were spot on.",
  },
];

const INSTAGRAM_REELS = [
  { title: "Grand Wedding Reception", image: "hero-bouquet" as const },
  { title: "Wide Range Buffet", image: "cat-combo" as const },
  { title: "Magnificent Catering Setup", image: "cat-cakes" as const },
  { title: "Client Review & Feedback", image: "cat-gifts" as const },
  { title: "Birthday Celebration", image: "cat-plants" as const },
  { title: "Wedding Review & Feedback", image: "promo-banner" as const },
];

function Home() {
  const [email, setEmail] = useState("");
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const products = useProducts();

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => setActiveSlide(api.selectedScrollSnap());
    api.on("select", handleSelect);
    api.on("reInit", handleSelect);

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <div className="container-x grid items-center gap-8 py-10 lg:grid-cols-2 lg:py-16">
          <div className="order-2 lg:order-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" /> India-wide PIN delivery · Fast Bengaluru options
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Beautiful Gifts.
              <br />
              <span className="text-primary">Beautifully Delivered.</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              Hand-tied bouquets, freshly baked cakes, living plants and thoughtfully curated
              hampers — crafted by local florists and delivered to their door.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex h-12 items-center rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:-translate-y-0.5"
              >
                Shop Now
              </Link>
              <Link
                to="/category/$slug"
                params={{ slug: "flowers" }}
                className="inline-flex h-12 items-center rounded-xl border border-primary/30 px-7 text-sm font-semibold text-primary hover:bg-primary/5"
              >
                Explore Collections
              </Link>
            </div>
            <dl className="mt-8 flex gap-8">
              {[
                ["2 Lakh+", "Happy gifters"],
                ["All India", "Valid PIN codes"],
                ["4.7★", "Average rating"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-xl font-bold">{v}</dt>
                  <dd className="text-xs text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="order-1 lg:order-2">
            <Carousel
              opts={{ loop: true }}
              setApi={setApi}
              className="relative rounded-[28px] border border-primary/10 bg-white/60 p-2 shadow-[0_30px_80px_rgba(50,30,18,0.12)] ring-1 ring-white/70 backdrop-blur-sm"
            >
              <CarouselContent className="-ml-0">
                {HERO_SLIDES.map((slide) => (
                  <CarouselItem key={slide.key} className="pl-0">
                    <div className="relative overflow-hidden rounded-[22px] shadow-lift">
                      <img
                        src={IMAGES[slide.key]}
                        alt={slide.title}
                        width={1920}
                        height={1088}
                        className="aspect-[16/11] w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                        <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
                          {slide.eyebrow}
                        </span>
                        <h2 className="mt-3 max-w-sm font-display text-2xl font-bold leading-tight sm:text-3xl">
                          {slide.title}
                        </h2>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center">
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-2.5 py-1.5 backdrop-blur-md">
                  {HERO_SLIDES.map((slide, index) => (
                    <button
                      key={slide.key}
                      type="button"
                      aria-label={`View slide ${index + 1}`}
                      onClick={() => {
                        setActiveSlide(index);
                        api?.scrollTo(index);
                      }}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        activeSlide === index ? "w-8 bg-white shadow-sm" : "w-2.5 bg-white/60 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* Quick categories */}
      <section className="container-x py-8">
        <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group flex w-24 shrink-0 flex-col items-center gap-2 sm:w-auto"
            >
              <span className="overflow-hidden rounded-full border-2 border-transparent p-1 transition-colors group-hover:border-primary">
                <img
                  src={IMAGES[c.image]}
                  alt={c.name}
                  loading="lazy"
                  className="size-20 rounded-full object-cover sm:size-24"
                />
              </span>
              <span className="text-center text-xs font-semibold sm:text-sm">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending collections */}
      <section className="container-x py-8">
        <h2 className="section-title mb-4">Trending Collections</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.label}
              to="/products"
              search={{ category: c.category } as never}
              className="group relative overflow-hidden rounded-xl shadow-card"
            >
              <img
                src={IMAGES[c.image]}
                alt={c.label}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-wine-deep/85 via-wine-deep/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-primary-foreground">
                <h3 className="font-display text-lg font-bold">{c.label}</h3>
                <p className="text-xs opacity-85">{c.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ProductRail
        title="Best Sellers"
        subtitle="What India is gifting this week"
        products={products.filter((p) => p.isBestSeller || p.rating >= 4.7).slice(0, 12)}
        viewAllTo="/products"
      />

      {/* Promo banner */}
      <section className="container-x py-8">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={IMAGES["promo-banner"]}
            alt="Celebration table with flowers, cake and gifts"
            loading="lazy"
            width={1600}
            height={640}
            className="h-56 w-full object-cover sm:h-72"
          />
          <div className="absolute inset-0 flex items-center bg-gradient-to-r from-wine-deep/80 to-transparent">
            <div className="max-w-md p-6 text-primary-foreground sm:p-10">
              <h2 className="font-display text-2xl font-bold sm:text-4xl">Make Today Special</h2>
              <p className="mt-2 text-sm opacity-90">
                Up to 25% off on handpicked combos. Flowers, cake and a card — sorted in one order.
              </p>
              <Link
                to="/category/$slug"
                params={{ slug: "combo" }}
                className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary-foreground px-6 text-sm font-semibold text-wine-deep"
              >
                Shop Combos
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ProductRail
        title="Pipe Cleaner Supplies"
        subtitle="Craft essentials for handmade floral designs"
        products={products.filter((p) => p.category === "pipe-cleaner-supplies").slice(0, 10)}
        viewAllTo="/category/$slug"
        viewAllParams={{ slug: "pipe-cleaner-supplies" }}
      />

      <ProductRail
        title="Ready Bouquets"
        products={products.filter((p) => p.category === "ready-bouquets").slice(0, 10)}
        viewAllTo="/category/$slug"
        viewAllParams={{ slug: "ready-bouquets" }}
      />
      <ProductRail
        title="DIY Flower Kits"
        products={products.filter((p) => p.category === "diy-flower-kits").slice(0, 10)}
        viewAllTo="/category/$slug"
        viewAllParams={{ slug: "diy-flower-kits" }}
      />
      <ProductRail
        title="Home Decor"
        products={products.filter((p) => p.category === "home-decor").slice(0, 10)}
        viewAllTo="/category/$slug"
        viewAllParams={{ slug: "home-decor" }}
      />
      <ProductRail
        title="The Premium Collection"
        subtitle="Signature arrangements for the moments that matter most"
        products={products.filter((p) => p.isPremium).slice(0, 10)}
        viewAllTo="/products"
      />

      {/* Why us */}
      <section className="bg-cream py-12">
        <div className="container-x">
          <h2 className="section-title mb-6 text-center">Why Flowers Forever?</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {WHY.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-xl bg-card p-5 text-center shadow-card">
                <Icon className="mx-auto size-7 text-primary" />
                <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container-x py-12">
        <h2 className="section-title mb-6">What Our Customers Say</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-3 text-sm text-foreground/85">{r.text}</blockquote>
              <figcaption className="mt-4 text-xs font-semibold">
                {r.name} · <span className="font-normal text-muted-foreground">{r.city}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="container-x pb-12">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Follow us</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Latest from Instagram
            </h2>
          </div>

          <a
            href="https://www.instagram.com/flowers._forever._/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 self-start rounded-2xl border border-primary/20 bg-white px-4 py-2 shadow-[0_10px_30px_rgba(121,50,22,0.08)] transition hover:-translate-y-0.5"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              IG
            </span>
            <span className="text-base font-semibold text-foreground">@flowers._forever._</span>
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {INSTAGRAM_REELS.map((item, index) => (
            <a
              key={item.title}
              href="https://www.instagram.com/flowers._forever._/"
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden rounded-[18px] border border-black/5 bg-card shadow-[0_18px_36px_rgba(15,23,42,0.06)] transition-transform duration-300 hover:-translate-y-1"
              aria-label={`Visit Instagram reel: ${item.title}`}
            >
              <div className="absolute left-2.5 top-2.5 z-10 rounded-full bg-[#ff6a3d] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white">
                {index === 0 ? "Reel" : "Reel"}
              </div>
              <img
                src={IMAGES[item.image]}
                alt={item.title}
                loading="lazy"
                className="aspect-[2/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
                <p className="text-[11px] font-medium leading-tight text-white/95 sm:text-xs">{item.title}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="container-x pb-4">
        <div className="rounded-2xl bg-wine-deep px-6 py-10 text-center text-primary-foreground">
          <h2 className="font-display text-2xl font-bold">Fresh supplies for creative gifting</h2>
          <p className="mx-auto mt-2 max-w-md text-sm opacity-80">
            New bundles, styling essentials and décor picks for handmade gifting and event work.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(email)) {
                toast.error("Please enter a valid email address");
                return;
              }
              setEmail("");
              toast.success("You're subscribed. Welcome to Flowers Forever!");
            }}
            className="mx-auto mt-6 flex max-w-md gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              aria-label="Email address"
              className="h-12 flex-1 rounded-xl bg-primary-foreground px-4 text-sm text-foreground outline-none"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-semibold"
            >
              Subscribe <ArrowRight className="size-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
