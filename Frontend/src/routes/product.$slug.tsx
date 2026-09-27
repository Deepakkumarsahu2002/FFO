import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Star,
  Heart,
  Truck,
  ShieldCheck,
  MapPin,
  Check,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { inr, discountPct } from "@/lib/format";
import { checkDeliveryPincode, type PincodeDeliveryResult } from "@/lib/delivery";
import { useProductBySlug, useProducts } from "@/store/catalog";
import { useShop, productById } from "@/store/shop";
import { ProductRail } from "@/components/site/ProductRail";
import { StoreProductImage } from "@/components/site/StoreProductImage";

const ADDONS = [
  { id: "card", label: "Greeting card", price: 99 },
  { id: "wrap", label: "Premium gift wrap", price: 149 },
  { id: "teddy", label: "Add a teddy (6 inch)", price: 399 },
  { id: "chocolates", label: "Add chocolates box", price: 299 },
];

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => ({
    slug: params.slug,
    name: null,
    shortDescription: "",
  }),
  head: ({ loaderData }) => {
    if (!loaderData || !loaderData.name) {
      return {
        meta: [
          { title: "Product unavailable — Flowers Forever" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.name} — Flowers Forever`;
    const description = `Order ${loaderData.name} online with same-day delivery. ${loaderData.shortDescription}. Hand-crafted and quality-checked by Flowers Forever.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-x grid place-items-center gap-3 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">This gift is no longer available</h1>
      <Link
        to="/products"
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Browse all products
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container-x py-24 text-center" role="alert">
      {error.message}
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useLoaderData();
  const product = useProductBySlug(slug);
  const allProducts = useProducts();
  const navigate = useNavigate();

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [pin, setPin] = useState(useShop.getState().pincode);
  const [pinResult, setPinResult] = useState<PincodeDeliveryResult | null>(null);
  const [checkingPin, setCheckingPin] = useState(false);
  const [message, setMessage] = useState("");
  const [addons, setAddons] = useState<string[]>([]);

  const addItem = useShop((s) => s.addItem);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const wishlisted = useShop((s) => (product ? s.wishlist.includes(product.id) : false));
  const viewProduct = useShop((s) => s.viewProduct);
  const recentlyViewed = useShop((s) => s.recentlyViewed);
  const setCartOpen = useShop((s) => s.setCartOpen);
  const setLocation = useShop((s) => s.setLocation);

  useEffect(() => {
    if (!product) return;
    viewProduct(product.id);
    setActiveImage(0);
    setQty(1);
  }, [product?.id, viewProduct]);

  if (!product) {
    return (
      <div className="container-x grid place-items-center gap-3 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">This gift is no longer available</h1>
        <Link
          to="/products"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Browse all products
        </Link>
      </div>
    );
  }

  const off = discountPct(product.price, product.mrp);
  const addonTotal = ADDONS.filter((a) => addons.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const lineTotal = (product.price + addonTotal) * qty;
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const related = allProducts.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, 10);
  const viewed = recentlyViewed
    .map(productById)
    .filter((p): p is NonNullable<typeof p> => Boolean(p) && p!.id !== product.id)
    .slice(0, 10);

  async function checkPin() {
    setCheckingPin(true);
    try {
      const result = await checkDeliveryPincode(pin);
      setPinResult(result);
      if (result.available) setLocation(result.city, pin);
    } catch (error) {
      setPinResult({
        available: false,
        pincode: pin,
        city: "",
        sameDay: false,
        nextDay: false,
        estimate: error instanceof Error ? error.message : "Could not check this PIN code.",
      });
    } finally {
      setCheckingPin(false);
    }
  }

  function handleAdd(buyNow = false) {
    if (!product || outOfStock) return;
    addItem(product, qty, {
      message: message || undefined,
      addons: addons.length ? addons : undefined,
    });
    if (buyNow) navigate({ to: "/checkout" });
    else {
      toast.success("Added to cart", { description: product.name });
      setCartOpen(true);
    }
  }

  return (
    <div className="pb-24 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            sku: product.sku,
            description: product.description,
            brand: { "@type": "Brand", name: "Flowers Forever" },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.reviews,
            },
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "INR",
              availability: outOfStock
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            },
          }),
        }}
      />

      <div className="container-x py-5">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link to="/category/$slug" params={{ slug: product.category }} className="hover:text-primary">
            {product.category}
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div className="flex gap-3">
            <div className="hidden w-20 shrink-0 flex-col gap-2 sm:flex">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "overflow-hidden rounded-lg border-2",
                    activeImage === i ? "border-primary" : "border-transparent",
                  )}
                >
                  <StoreProductImage
                    src={img}
                    productId={product.id}
                    category={product.category}
                    alt={`${product.name} view ${i + 1}`}
                    className="aspect-square object-cover"
                  />
                </button>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="group overflow-hidden rounded-2xl border bg-cream">
                <StoreProductImage
                  src={product.images[activeImage]}
                  productId={product.id}
                  category={product.category}
                  alt={product.name}
                  width={912}
                  height={912}
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="mt-2 flex gap-2 sm:hidden">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "size-16 overflow-hidden rounded-lg border-2",
                      activeImage === i ? "border-primary" : "border-transparent",
                    )}
                  >
                    <StoreProductImage
                      src={img}
                      productId={product.id}
                      category={product.category}
                      alt=""
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Buy box */}
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 rounded bg-leaf/12 px-2 py-0.5 font-semibold text-leaf">
                {product.rating.toFixed(1)} <Star className="size-3.5 fill-current" />
              </span>
              <span className="text-muted-foreground">
                {product.reviews.toLocaleString("en-IN")} reviews
              </span>
              <span className="text-muted-foreground">SKU: {product.sku}</span>
            </div>

            <div className="mt-4 flex flex-wrap items-baseline gap-2">
              <span className="font-display text-3xl font-bold">{inr(product.price)}</span>
              {off > 0 && (
                <>
                  <span className="text-muted-foreground line-through">{inr(product.mrp)}</span>
                  <span className="rounded bg-sale/10 px-2 py-0.5 text-sm font-semibold text-sale">
                    {off}% OFF
                  </span>
                </>
              )}
              <span className="w-full text-xs text-muted-foreground">Inclusive of all taxes</span>
            </div>

            {lowStock && (
              <p className="mt-3 rounded-lg bg-sale/10 px-3 py-2 text-sm font-medium text-sale">
                Hurry — only {product.stock} left in stock
              </p>
            )}
            {outOfStock && (
              <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm font-medium">
                Currently out of stock in your city
              </p>
            )}

            {/* Pincode */}
            <div className="mt-5 rounded-xl border p-4">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <MapPin className="size-4 text-primary" /> Check delivery availability
              </p>
              <div className="flex gap-2">
                <input
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setPinResult(null);
                  }}
                  inputMode="numeric"
                  placeholder="Enter pincode"
                  aria-label="Delivery pincode"
                  className="h-10 flex-1 rounded-lg border px-3 text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => void checkPin()}
                  disabled={pin.length !== 6 || checkingPin}
                  className="h-10 rounded-lg border border-primary px-4 text-sm font-semibold text-primary disabled:opacity-40"
                >
                  {checkingPin ? "Checking…" : "Check"}
                </button>
              </div>
              {pinResult && (
                <ul className="mt-3 space-y-1 text-sm">
                  <li className={`flex items-center gap-1.5 ${pinResult.available ? "text-leaf" : "text-destructive"}`}>
                    {pinResult.available && <Check className="size-4" />}
                    {pinResult.available ? `Deliverable in ${pinResult.city}` : pinResult.estimate}
                  </li>
                  {pinResult.available && (
                    <>
                      <li className="flex items-center gap-1.5 text-muted-foreground">
                        <Truck className="size-4" /> {pinResult.estimate}
                      </li>
                      <li className="flex items-center gap-1.5 text-leaf">
                        <Check className="size-4" /> Free delivery on orders above ₹1,499
                      </li>
                    </>
                  )}
                </ul>
              )}
            </div>

            {/* Message */}
            <label className="mt-4 block text-sm">
              <span className="mb-1.5 block font-semibold">Add a message (optional)</span>
              <textarea
                value={message}
                maxLength={200}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Happy birthday, Meera! Wishing you a year full of joy."
                className="w-full rounded-lg border p-3 text-sm outline-none focus:border-primary"
              />
              <span className="text-xs text-muted-foreground">{message.length}/200 characters</span>
            </label>

            {/* Add-ons */}
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold">Make it extra special</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {ADDONS.map((a) => (
                  <label
                    key={a.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-3 text-sm",
                      addons.includes(a.id) && "border-primary bg-primary/5",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addons.includes(a.id)}
                        onChange={() =>
                          setAddons((prev) =>
                            prev.includes(a.id) ? prev.filter((i) => i !== a.id) : [...prev, a.id],
                          )
                        }
                        className="size-4 accent-[oklch(0.37_0.128_12)]"
                      />
                      {a.label}
                    </span>
                    <span className="font-semibold">+{inr(a.price)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Qty + actions */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-lg border">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="grid size-11 place-items-center"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty(Math.min(product.stock || 1, qty + 1))}
                  className="grid size-11 place-items-center"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  toggleWishlist(product.id);
                  toast(wishlisted ? "Removed from wishlist" : "Saved to wishlist");
                }}
                className="grid size-11 place-items-center rounded-lg border transition-transform active:scale-90"
                aria-label="Add to wishlist"
              >
                <Heart className={cn("size-5", wishlisted && "fill-primary text-primary")} />
              </button>
              <span className="ml-auto text-sm text-muted-foreground">
                Total: <strong className="text-foreground">{inr(lineTotal)}</strong>
              </span>
            </div>

            <div className="mt-3 hidden gap-3 lg:flex">
              <button
                type="button"
                disabled={outOfStock}
                onClick={() => handleAdd(false)}
                className="h-12 flex-1 rounded-xl border-2 border-primary text-sm font-bold uppercase tracking-wide text-primary hover:bg-primary/5 disabled:opacity-40"
              >
                Add to Cart
              </button>
              <button
                type="button"
                disabled={outOfStock}
                onClick={() => handleAdd(true)}
                className="h-12 flex-1 rounded-xl bg-primary text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-wine-deep disabled:opacity-40"
              >
                Buy Now
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
              <p className="rounded-lg border p-3">
                <Truck className="mx-auto mb-1 size-4 text-primary" />
                {pin.startsWith("560") ? "Same/next day in Bengaluru" : "Delivery across India"}
              </p>
              <p className="rounded-lg border p-3">
                <ShieldCheck className="mx-auto mb-1 size-4 text-primary" /> Secure payment
              </p>
              <p className="rounded-lg border p-3">
                <Check className="mx-auto mb-1 size-4 text-primary" /> Quality assured
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-10 max-w-3xl">
          <Accordion type="multiple" defaultValue={["desc"]}>
            <AccordionItem value="desc">
              <AccordionTrigger>Product description</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="contains">
              <AccordionTrigger>What's included</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {product.contains.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care">
              <AccordionTrigger>Care instructions</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">{product.care}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="delivery">
              <AccordionTrigger>Delivery information</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  We deliver to valid PIN codes across India. Bengaluru PIN codes beginning 560
                  may qualify for same-day or next-day delivery, depending on order time and slot
                  availability. Delivery is free on orders
                  above ₹1,499.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cancel">
              <AccordionTrigger>Cancellation policy</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  Cancel free of charge up to 24 hours before the delivery slot. Personalised and
                  perishable items cannot be cancelled once production has started.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq">
              <AccordionTrigger>FAQs</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Can I change the delivery date later?</strong>
                    <br />
                    Yes, up to 24 hours before the slot from My Orders.
                  </p>
                  <p>
                    <strong className="text-foreground">Will the flowers look like the photo?</strong>
                    <br />
                    Yes. Where a specific bloom is unavailable we substitute a flower of equal or
                    greater value and keep the colour palette identical.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Reviews */}
          <section className="mt-10">
            <h2 className="section-title mb-4">Customer reviews</h2>
            <div className="flex flex-wrap items-center gap-8 rounded-xl border p-5">
              <div className="text-center">
                <p className="font-display text-4xl font-bold">{product.rating.toFixed(1)}</p>
                <div className="mt-1 flex justify-center gap-0.5 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn("size-4", i < Math.round(product.rating) && "fill-current")}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {product.reviews.toLocaleString("en-IN")} ratings
                </p>
              </div>
              <div className="min-w-48 flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const pct = [68, 21, 6, 3, 2][5 - star];
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-3">{star}</span>
                      <Star className="size-3 fill-gold text-gold" />
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Only customers with a delivered order for this product can post a review.
            </p>
          </section>
        </div>
      </div>

      <ProductRail title="You may also like" products={related} />
      {viewed.length > 0 && <ProductRail title="Recently viewed" products={viewed} />}

      {/* Sticky mobile purchase bar */}
      <div className="fixed inset-x-0 bottom-14 z-30 flex gap-2 border-t bg-background p-3 shadow-bar lg:hidden">
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => handleAdd(false)}
          className="h-12 flex-1 rounded-xl border-2 border-primary text-sm font-bold text-primary disabled:opacity-40"
        >
          Add to Cart
        </button>
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => handleAdd(true)}
          className="h-12 flex-1 rounded-xl bg-primary text-sm font-bold text-primary-foreground disabled:opacity-40"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
