import { Link } from "@tanstack/react-router";
import { Heart, Star, Truck, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { inr, discountPct } from "@/lib/format";
import type { Product } from "@/data/";
import { useShop } from "@/store/shop";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const wishlisted = useShop((s) => s.wishlist.includes(product.id));
  const addItem = useShop((s) => s.addItem);
  const off = discountPct(product.price, product.mrp);
  const outOfStock = product.stock <= 0;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        className,
      )}
    >
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden bg-cream"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          width={912}
          height={912}
          className="h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
        />
        <img
          src={product.images[1]}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        {off > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-sale px-2 py-1 text-[11px] font-semibold text-primary-foreground">
            {off}% OFF
          </span>
        )}
        {product.isPremium && (
          <span className="absolute left-2 bottom-2 rounded-md bg-wine-deep/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
            Premium
          </span>
        )}
      </Link>

      <button
        type="button"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
        onClick={() => {
          toggleWishlist(product.id);
          toast(wishlisted ? "Removed from wishlist" : "Saved to wishlist");
        }}
        className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-card/90 shadow-card backdrop-blur transition-transform active:scale-90"
      >
        <Heart
          className={cn(
            "size-4 transition-all",
            wishlisted ? "scale-110 fill-primary text-primary" : "text-muted-foreground",
          )}
        />
      </button>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-0.5 rounded bg-leaf/12 px-1.5 py-0.5 font-semibold text-leaf">
            {product.rating.toFixed(1)}
            <Star className="size-3 fill-current" />
          </span>
          <span>({product.reviews.toLocaleString("en-IN")})</span>
        </div>

        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="text-base font-bold">{inr(product.price)}</span>
          {off > 0 && (
            <>
              <span className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</span>
              <span className="text-xs font-semibold text-leaf">{off}% off</span>
            </>
          )}
        </div>

        <p className="mt-auto flex items-center gap-1 pt-1 text-[11px] text-muted-foreground">
          <Truck className="size-3.5" />
          {product.sameDay ? "Same day delivery" : "Earliest tomorrow"}
        </p>

        <button
          type="button"
          disabled={outOfStock}
          onClick={() => {
            addItem(product);
            toast.success("Added to cart", { description: product.name });
          }}
          className="mt-2 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-primary/25 bg-primary/5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" />
          {outOfStock ? "Out of stock" : "Quick Add"}
        </button>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
