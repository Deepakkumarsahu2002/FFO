import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { SlidersHorizontal, ChevronRight, X, PackageOpen } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CATEGORIES, type Product } from "@/data/catalog";
import { discountPct } from "@/lib/format";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

export interface ListingFilters {
  category?: string;
  sub?: string;
  min?: number;
  max?: number;
  sort?: string;
  rating?: number;
}

const SORTS = [
  { id: "popularity", label: "Popularity" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Rating" },
  { id: "newest", label: "Newest" },
  { id: "discount", label: "Discount" },
];

const PRICE_BANDS = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1000", min: 500, max: 1000 },
  { label: "₹1000 - ₹2000", min: 1000, max: 2000 },
  { label: "₹2000 & above", min: 2000, max: 100000 },
];

export function ProductListing({
  allProducts,
  title,
  description,
  breadcrumb,
  initial,
  lockedCategory,
  isLoading = false,
  loadError,
  onRetry,
}: {
  allProducts: Product[];
  title: string;
  description?: string;
  breadcrumb: { label: string; to?: string; params?: { slug: string } }[];
  initial?: ListingFilters;
  lockedCategory?: Product["category"];
  isLoading?: boolean;
  loadError?: string | null;
  onRetry?: () => void;
}) {
  const [categories, setCategories] = useState<string[]>(
    initial?.category ? [initial.category] : [],
  );
  const [subcategories, setSubcategories] = useState<string[]>(initial?.sub ? [initial.sub] : []);
  const [band, setBand] = useState<number | null>(() => {
    if (initial?.min == null && initial?.max == null) return null;
    return PRICE_BANDS.findIndex(
      (b) => (initial.min ?? 0) >= b.min && (initial.max ?? 100000) <= b.max,
    );
  });
  const [minRating, setMinRating] = useState<number | null>(initial?.rating ?? null);
  const [sameDayOnly, setSameDayOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState(initial?.sort ?? "popularity");
  const [page, setPage] = useState(1);
  const perPage = 16;
  const subcategoryOptions = useMemo(
    () => {
      const visibleCategories = lockedCategory
        ? CATEGORIES.filter((category) => category.slug === lockedCategory)
        : categories.length
          ? CATEGORIES.filter((category) => categories.includes(category.slug))
          : CATEGORIES;
      return visibleCategories.flatMap((category) => category.subcategories);
    },
    [categories, lockedCategory],
  );

  const filtered = useMemo(() => {
    let list = allProducts.filter((p) => {
      if (lockedCategory && p.category !== lockedCategory) return false;
      if (!lockedCategory && categories.length && !categories.includes(p.category)) return false;
      if (subcategories.length && !subcategories.includes(p.subcategory)) return false;
      if (band != null && band >= 0) {
        const b = PRICE_BANDS[band];
        if (p.price < b.min || p.price > b.max) return false;
      }
      if (minRating && p.rating < minRating) return false;
      if (sameDayOnly && !p.sameDay) return false;
      if (inStockOnly && p.stock <= 0) return false;
      return true;
    });

    list = [...list];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sort === "newest") list.reverse();
    if (sort === "discount")
      list.sort((a, b) => discountPct(b.price, b.mrp) - discountPct(a.price, a.mrp));
    if (sort === "popularity") list.sort((a, b) => b.reviews - a.reviews);
    return list;
  }, [
    allProducts,
    categories,
    subcategories,
    band,
    minRating,
    sameDayOnly,
    inStockOnly,
    sort,
    lockedCategory,
  ]);

  const visible = filtered.slice(0, page * perPage);

  const activeCount =
    categories.length +
    subcategories.length +
    (band != null && band >= 0 ? 1 : 0) +
    (minRating ? 1 : 0) +
    (sameDayOnly ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  function clearAll() {
    setCategories([]);
    setSubcategories([]);
    setBand(null);
    setMinRating(null);
    setSameDayOnly(false);
    setInStockOnly(false);
  }

  const filterPanel = (
    <div className="space-y-6">
      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
        >
          <X className="size-3" /> Clear all filters ({activeCount})
        </button>
      )}

      {!lockedCategory && (
        <FilterGroup title="Category">
          {CATEGORIES.map((c) => (
            <Check
              key={c.slug}
              label={c.name}
              checked={categories.includes(c.slug)}
              onChange={() => {
                toggle(setCategories, c.slug);
                setSubcategories([]);
              }}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Subcategory">
        {subcategoryOptions.map((subcategory) => (
          <Check
            key={subcategory}
            label={subcategory}
            checked={subcategories.includes(subcategory)}
            onChange={() => toggle(setSubcategories, subcategory)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Price">
        {PRICE_BANDS.map((b, i) => (
          <Check
            key={b.label}
            label={b.label}
            checked={band === i}
            onChange={() => setBand(band === i ? null : i)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Customer rating">
        {[4.5, 4, 3.5].map((r) => (
          <Check
            key={r}
            label={`${r}★ & above`}
            checked={minRating === r}
            onChange={() => setMinRating(minRating === r ? null : r)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Delivery">
        <Check
          label="Same day delivery"
          checked={sameDayOnly}
          onChange={() => setSameDayOnly(!sameDayOnly)}
        />
      </FilterGroup>

      <FilterGroup title="Availability">
        <Check
          label="In stock only"
          checked={inStockOnly}
          onChange={() => setInStockOnly(!inStockOnly)}
        />
      </FilterGroup>
    </div>
  );

  return (
    <div className="container-x py-6">
      <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        {breadcrumb.map((b) => (
          <span key={b.label} className="flex items-center gap-1">
            <ChevronRight className="size-3" />
            {b.to ? (
              <Link to={b.to} params={b.params as never} className="hover:text-primary">
                {b.label}
              </Link>
            ) : (
              <span className="text-foreground">{b.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {description ? `${description} · ` : ""}
            {isLoading ? "Loading products…" : loadError ? "Products unavailable" : `${filtered.length} products`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium lg:hidden"
              >
                <SlidersHorizontal className="size-4" /> Filters
                {activeCount > 0 && (
                  <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                    {activeCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="p-4">{filterPanel}</div>
            </SheetContent>
          </Sheet>

          <label className="sr-only" htmlFor="sort">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-lg border bg-card px-3 text-sm outline-none focus:border-primary"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                Sort: {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto rounded-xl border bg-card p-4 scrollbar-none">
            {filterPanel}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {isLoading && visible.length === 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => <ProductCardSkeleton key={index} />)}
            </div>
          ) : loadError && visible.length === 0 ? (
            <div className="grid place-items-center gap-3 rounded-xl border border-dashed py-20 text-center">
              <PackageOpen className="size-10 text-muted-foreground" />
              <p className="font-semibold">Products could not be loaded</p>
              <p className="max-w-sm text-sm text-muted-foreground">{loadError}</p>
              {onRetry && (
                <button type="button" onClick={onRetry} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                  Retry
                </button>
              )}
            </div>
          ) : visible.length === 0 ? (
            <div className="grid place-items-center gap-3 rounded-xl border border-dashed py-20 text-center">
              <PackageOpen className="size-10 text-muted-foreground" />
              <p className="font-semibold">No products match these filters</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try removing a filter or two — or browse our best sellers instead.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                {visible.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {visible.length < filtered.length && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-xl border border-primary/30 px-8 py-3 text-sm font-semibold text-primary hover:bg-primary/5"
                  >
                    Load more ({filtered.length - visible.length} left)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) {
  setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-white to-primary/2 p-3 shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
      <h3 className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors hover:bg-primary/5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 accent-[oklch(0.37_0.128_12)]"
      />
      <span className={cn("truncate", checked && "font-semibold text-primary")}>{label}</span>
    </label>
  );
}
