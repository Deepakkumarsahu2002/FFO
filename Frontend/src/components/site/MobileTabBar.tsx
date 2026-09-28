import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, Search, Heart, User } from "lucide-react";

const TABS = [
  { label: "Home", to: "/", icon: Home },
  { label: "Categories", to: "/products", icon: LayoutGrid },
  { label: "Search", to: "/search", icon: Search },
  { label: "Wishlist", to: "/wishlist", icon: Heart },
  { label: "Account", to: "/account", icon: User },
];

export function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 shadow-bar backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {TABS.map(({ label, to, icon: Icon }) => (
          <li key={label}>
            <Link
              to={to}
              className="group flex min-h-14 flex-col items-center justify-center gap-0.5 py-2 text-[10px] text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-md"
              activeProps={{ className: "text-primary font-semibold" }}
              activeOptions={{ exact: to === "/" }}
            >
              <Icon className="size-5 transition-transform group-hover:-translate-y-0.5 group-active:scale-95" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
