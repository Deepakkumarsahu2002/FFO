import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/data/catalog";
import { ProductCard } from "./ProductCard";

export function ProductRail({
  title,
  subtitle,
  products,
  viewAllTo,
  viewAllParams,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllTo?: string;
  viewAllParams?: { slug: string };
}) {
  if (products.length === 0) return null;
  return (
    <section className="container-x py-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            params={viewAllParams as never}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
      <div className="hide-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            className="w-[calc(75vw-1rem)] shrink-0 snap-start sm:w-56 lg:w-[calc((100%-4rem)/5)]"
          />
        ))}
      </div>
    </section>
  );
}
