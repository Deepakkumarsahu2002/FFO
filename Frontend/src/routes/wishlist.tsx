import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useShop, productById } from "@/store/shop";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist — Flowers Forever" },
      { name: "description", content: "Gifts you've saved for later." },
      { property: "og:title", content: "My Wishlist — Flowers Forever" },
      { property: "og:description", content: "Gifts you've saved for later." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const wishlist = useShop((s) => s.wishlist);
  const products = wishlist.map(productById).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="container-x py-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">My Wishlist</h1>
      <p className="mt-1 text-sm text-muted-foreground">{products.length} saved item(s)</p>

      {products.length === 0 ? (
        <div className="mt-8 grid place-items-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <Heart className="size-10 text-muted-foreground" />
          <p className="font-semibold">Nothing saved yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Tap the heart on any product to keep it here for later.
          </p>
          <Link
            to="/products"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Browse gifts
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
