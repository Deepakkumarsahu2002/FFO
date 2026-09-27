import { createFileRoute } from "@tanstack/react-router";
import { hydrateCatalogFromBackend, useCatalog } from "@/store/catalog";
import { ProductListing } from "@/components/site/ProductListing";

export interface ProductSearch {
  category?: string;
  sub?: string;
  min?: number;
  max?: number;
  sort?: string;
  rating?: number;
}

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
    sub: typeof search.sub === "string" ? search.sub : undefined,
    min: search.min != null ? Number(search.min) : undefined,
    max: search.max != null ? Number(search.max) : undefined,
    sort: typeof search.sort === "string" ? search.sort : undefined,
    rating: search.rating != null ? Number(search.rating) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "All Gifts, Flowers, Cakes & Plants — Flowers Forever" },
      {
        name: "description",
        content:
          "Browse the full Flowers Forever range of craft supplies, bouquets, DIY kits and home décor, filtered by category, subcategory and price.",
      },
      { property: "og:title", content: "Shop All Gifts — Flowers Forever" },
      {
        property: "og:description",
        content: "Bouquets, cakes, plants, hampers and personalised gifts delivered across India.",
      },
    ],
  }),
  component: AllProducts,
});

function AllProducts() {
  const search = Route.useSearch();
  const products = useCatalog((state) => state.products);
  const isLoaded = useCatalog((state) => state.isLoaded);
  const loadError = useCatalog((state) => state.loadError);
  return (
    <ProductListing
      allProducts={products}
      title="All Products"
      description="Handpicked gifting, across every category"
      breadcrumb={[{ label: "All Products" }]}
      initial={search}
      isLoading={!isLoaded && !loadError}
      loadError={loadError}
      onRetry={() => void hydrateCatalogFromBackend()}
    />
  );
}
