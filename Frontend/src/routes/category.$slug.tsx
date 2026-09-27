import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { CATEGORIES, type CategorySlug } from "@/data/catalog";
import { useCategoryProducts } from "@/store/catalog";
import { ProductListing } from "@/components/site/ProductListing";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = CATEGORIES.find((c) => c.slug === params.slug);
    if (!category) throw notFound();
    return { slug: category.slug, name: category.name, tagline: category.tagline };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Category unavailable — Flowers Forever" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} Online — Same Day Delivery | Flowers Forever`;
    const description = `${loaderData.tagline}. Shop ${loaderData.name.toLowerCase()} with same-day delivery across India from Flowers Forever.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-x grid place-items-center gap-3 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">We couldn't find that category</h1>
      <Link to="/products" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
        Browse all products
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container-x py-24 text-center" role="alert">
      {error.message}
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug, name, tagline } = Route.useLoaderData();
  const products = useCategoryProducts(slug as CategorySlug);
  return (
    <ProductListing
      allProducts={products}
      title={name}
      description={tagline}
      breadcrumb={[{ label: name }]}
      lockCategory
    />
  );
}
