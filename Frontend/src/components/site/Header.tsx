import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  MapPin,
  Menu,
  X,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CATEGORIES, CITIES, OCCASIONS } from "@/data/catalog";
import { liveProducts } from "@/store/catalog";
import { useShop } from "@/store/shop";
import { inr } from "@/lib/format";
import { CartDrawer } from "./CartDrawer";
const BRAND_LOGO = "/ff-logo.png";

type NavItem = {
  label: string;
  slug: string;
  to: string;
  params?: { slug: string };
  search?: Record<string, string | number>;
};

const NAV: NavItem[] = CATEGORIES.map((c) => ({
  label: c.name,
  slug: c.slug,
  to: "/category/$slug",
  params: { slug: c.slug },
}));

const PRICE_BANDS: { label: string; search: Record<string, number> }[] = [
  { label: "Under ₹500", search: { max: 500 } },
  { label: "₹500 - ₹1000", search: { min: 500, max: 1000 } },
  { label: "₹1000 - ₹2000", search: { min: 1000, max: 2000 } },
  { label: "Above ₹2000", search: { min: 2000 } },
];


export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const city = useShop((s) => s.city);
  const wishlistCount = useShop((s) => s.wishlist.length);
  const cartCount = useShop((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const setCartOpen = useShop((s) => s.setCartOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="bg-wine-deep text-[11px] text-primary-foreground sm:text-xs">
        <div className="container-x flex h-9 items-center justify-center gap-4 text-center">
          <span>Same Day Delivery</span>
          <span className="opacity-40">|</span>
          <span className="hidden sm:inline">7 Days Customer Support</span>
          <span className="hidden opacity-40 sm:inline">|</span>
          <span>Secure Payments</span>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-background/95 backdrop-blur transition-shadow",
          scrolled && "shadow-card",
        )}
      >
        <div className="container-x flex h-16 items-center gap-3">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg lg:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" />
          </button>

          <Link to="/" className="flex shrink-0 items-center">
            <img src={BRAND_LOGO} alt="Flowers Forever logo" className="h-12 w-auto object-contain sm:h-14" />
          </Link>

          <button
            type="button"
            onClick={() => setLocationOpen(true)}
            className="ml-2 hidden items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:border-primary/40 lg:inline-flex"
          >
            <MapPin className="size-4 text-primary" />
            <span className="max-w-28 truncate">{city}</span>
          </button>

          <div className="ml-auto hidden max-w-xl flex-1 lg:block">
            <SearchBox />
          </div>

          <div className="ml-auto flex items-center gap-0.5 lg:ml-2">
            <Link
              to="/account"
              className="hidden size-10 place-items-center rounded-lg hover:bg-muted sm:grid"
              aria-label="Account"
            >
              <User className="size-5" />
            </Link>
            <Link
              to="/wishlist"
              className="relative hidden size-10 place-items-center rounded-lg hover:bg-muted sm:grid"
              aria-label="Wishlist"
            >
              <Heart className="size-5" />
              {wishlistCount > 0 && <Badge>{wishlistCount}</Badge>}
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative grid size-10 place-items-center rounded-lg hover:bg-muted"
              aria-label="Cart"
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 && <Badge>{cartCount}</Badge>}
            </button>
          </div>
        </div>

        <div className="container-x pb-3 lg:hidden">
          <SearchBox compact />
        </div>

        <nav className="hidden border-t lg:block">
          <div className="container-x flex items-center justify-center gap-1">
            {NAV.map((item) => {
              const cat = CATEGORIES.find((c) => c.slug === item.slug);
              return (
                <div key={item.label} className="group static">
                  <Link
                    to={item.to}
                    params={item.params as never}
                    search={(item.search ?? {}) as never}
                    className="inline-flex h-11 items-center px-3 text-sm font-medium transition-colors hover:text-primary"
                    activeProps={{ className: "text-primary" }}
                  >

                    {item.label}
                  </Link>
                  <div className="invisible absolute left-0 right-0 top-full z-40 border-t bg-card opacity-0 shadow-lift transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
                    <MegaMenu categorySlug={cat?.slug} />
                  </div>
                </div>
              );
            })}
          </div>
        </nav>
      </header>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
      <LocationDialog open={locationOpen} onOpenChange={setLocationOpen} />
      <CartDrawer />
    </>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
      {children}
    </span>
  );
}

function MegaMenu({ categorySlug }: { categorySlug?: string }) {
  const category = CATEGORIES.find((c) => c.slug === categorySlug) ?? CATEGORIES[0];
  const popular = liveProducts().filter((p) => p.category === category.slug).slice(0, 3);

  return (
    <div className="container-x grid grid-cols-12 gap-8 py-6">
      <div className="col-span-3">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {category.name}
        </h3>
        <ul className="space-y-1.5">
          {category.subcategories.map((sub) => (
            <li key={sub}>
              <Link
                to="/products"
                search={{ category: category.slug, sub }}
                className="text-sm text-foreground/80 hover:text-primary"
              >
                {sub}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-3">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Occasions
        </h3>
        <ul className="grid grid-cols-2 gap-1.5">
          {OCCASIONS.slice(0, 10).map((o) => (
            <li key={o}>
              <Link
                to="/products"
                search={{ occasion: o }}
                className="text-sm text-foreground/80 hover:text-primary"
              >
                {o}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-2">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Shop by price
        </h3>
        <ul className="space-y-1.5">
          {PRICE_BANDS.map((b) => (
            <li key={b.label}>
              <Link
                to="/products"
                search={b.search as never}
                className="text-sm text-foreground/80 hover:text-primary"
              >
                {b.label}
              </Link>

            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-4">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Popular right now
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {popular.map((p) => (
            <Link
              key={p.id}
              to="/product/$slug"
              params={{ slug: p.slug }}
              className="group/item block"
            >
              <img
                src={p.images[0]}
                alt={p.name}
                loading="lazy"
                className="aspect-square w-full rounded-lg object-cover"
              />
              <p className="mt-1.5 line-clamp-2 text-xs font-medium group-hover/item:text-primary">
                {p.name}
              </p>
              <p className="text-xs font-semibold">{inr(p.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchBox({ compact }: { compact?: boolean }) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);
  const recent = useShop((s) => s.recentSearches);
  const addSearch = useShop((s) => s.addSearch);

  const suggestions = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    return liveProducts().filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [term]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(value: string) {
    const q = value.trim();
    if (!q) return;
    addSearch(q);
    setOpen(false);
    navigate({ to: "/search", search: { q } });
  }

  return (
    <div ref={boxRef} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(term);
        }}
        className="flex items-center gap-2 rounded-xl border bg-card px-3 focus-within:border-primary/50"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={compact ? "Search craft kits, décor, bouquets" : "Search for pipe cleaners, bouquets, décor & kits…"}
          aria-label="Search products"
          className={cn("w-full bg-transparent outline-none", compact ? "h-10 text-sm" : "h-11 text-sm")}
        />
        {term && (
          <button type="button" onClick={() => setTerm("")} aria-label="Clear search">
            <X className="size-4 text-muted-foreground" />
          </button>
        )}
      </form>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-96 overflow-auto rounded-xl border bg-popover p-2 shadow-lift">
          {suggestions.length > 0 ? (
            suggestions.map((p) => (
              <button
                key={p.id}
                type="button"
                onMouseDown={() => {
                  setOpen(false);
                  navigate({ to: "/product/$slug", params: { slug: p.slug } });
                }}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted"
              >
                <img src={p.images[0]} alt="" className="size-10 rounded object-cover" />
                <span className="flex-1 text-sm">{p.name}</span>
                <span className="text-sm font-semibold">{inr(p.price)}</span>
              </button>
            ))
          ) : (
            <div className="p-2">
              {recent.length > 0 && (
                <>
                  <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Clock className="size-3" /> Recent searches
                  </p>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {recent.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onMouseDown={() => submit(r)}
                        className="rounded-full border px-3 py-1 text-xs hover:border-primary/40"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Popular searches
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Pipe cleaner set",
                  "Bouquet kit",
                  "Floral stick craft kit",
                  "Table lamp",
                  "Ribbon mix pack",
                  "Ceramic bloom pot",
                  "Gift wrap bundle",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => submit(s)}
                    className="rounded-full border px-3 py-1 text-xs hover:border-primary/40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MobileMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 overflow-y-auto p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="font-display">Flowers Forever</SheetTitle>
        </SheetHeader>
        <nav className="p-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
            >
              {c.name}
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
          <div className="my-2 border-t" />
          {[
            { label: "All Products", to: "/products" },
            { label: "My Orders", to: "/orders" },
            { label: "Wishlist", to: "/wishlist" },
            { label: "Account", to: "/account" },
            { label: "About Us", to: "/about" },
            { label: "Contact", to: "/contact" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => onOpenChange(false)}
              className="block rounded-lg px-3 py-3 text-sm hover:bg-muted"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function LocationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { city, pincode, setLocation } = useShop();
  const [pin, setPin] = useState(pincode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Where should we deliver?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit pincode"
              inputMode="numeric"
              className="h-11 flex-1 rounded-lg border px-3 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => {
                const match = CITIES.find((c) => c.pincodes.includes(pin));
                setLocation(match?.name ?? city, pin);
                onOpenChange(false);
              }}
              disabled={pin.length !== 6}
              className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Apply
            </button>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Popular cities
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CITIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setLocation(c.name, c.pincodes[0]);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm hover:border-primary/50",
                    c.name === city && "border-primary bg-primary/5 font-semibold text-primary",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
