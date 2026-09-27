import { createFileRoute, Link } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { liveProducts } from "@/store/catalog";
import { ProductListing } from "@/components/site/ProductListing";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  head: () => ({
    meta: [
      { title: "Search — Flowers Forever" },
      {
        name: "description",
        content: "Search floral craft supplies, boutique bouquets, DIY kits and home décor on Flowers Forever.",
      },
      { property: "og:title", content: "Search — Flowers Forever" },
      { property: "og:description", content: "Find the perfect craft, décor or bouquet across our full range." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

/** Simple typo tolerance: allow a one-character edit distance on the query. */
function fuzzyMatch(q: string) {
  const term = q.trim().toLowerCase();
  if (term.length < 4) return [];
  return liveProducts().filter((p) => {
    const haystack = `${p.name} ${p.subcategory} ${p.category}`.toLowerCase();
    return haystack.split(/\s+/).some((word) => editDistance(word, term) <= 1);
  });
}

function editDistance(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return 99;
  let edits = 0;
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    edits++;
    if (edits > 1) return 99;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j);
}

function searchLive(q: string) {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  return liveProducts().filter((p) =>
    [p.name, p.category, p.subcategory, p.color, ...(p.occasions ?? [])]
      .join(" ")
      .toLowerCase()
      .includes(term),
  );
}

function SearchPage() {
  const { q } = Route.useSearch();
  const exact = searchLive(q);
  const results = exact.length > 0 ? exact : fuzzyMatch(q);
  const corrected = exact.length === 0 && results.length > 0;

  if (!q.trim()) {
    return (
      <div className="container-x grid place-items-center gap-3 py-24 text-center">
        <SearchX className="size-10 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold">What are you looking for?</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Try "pipe cleaner set", "bouquet kit", "table lamp" or "gift wrap bundle".
        </p>
        <Link
          to="/products"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Browse all products
        </Link>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="container-x grid place-items-center gap-3 py-24 text-center">
        <SearchX className="size-10 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold">No results for "{q}"</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Check the spelling, or browse a category — we have craft supplies, ready bouquets,
          DIY kits and home décor for gifting and styling.
        </p>
        <Link
          to="/products"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Browse all products
        </Link>
      </div>
    );
  }

  return (
    <ProductListing
      allProducts={results}
      title={`Search results for "${q}"`}
      description={corrected ? "Showing closest matches" : undefined}
      breadcrumb={[{ label: "Search" }]}
    />
  );
}
