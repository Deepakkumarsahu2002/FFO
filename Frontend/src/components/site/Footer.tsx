import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MessageCircle, Mail, Phone, ShieldCheck } from "lucide-react";
import { CATEGORIES } from "@/data/catalog";

const BRAND_LOGO = "/ff-logo.png";

const SOCIAL_LINKS = [
  {
    icon: Instagram,
    href: "https://www.instagram.com/flowers._forever._/",
    label: "Instagram",
  },
  {
    icon: Facebook,
    href: "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.instagram.com%2Fflowers._forever._%2F",
    label: "Facebook",
  },
  {
    icon: MessageCircle,
    href: "https://wa.me/919800012345?text=Hi%20Flowers%20Forever%2C%20I%20want%20to%20know%20more%20about%20your%20products.",
    label: "WhatsApp",
  },
];

const HELP = [
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "FAQ", to: "/faq" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Refund Policy", to: "/refund" },
];

const ACCOUNT = [
  { label: "My Account", to: "/account" },
  { label: "My Orders", to: "/orders" },
  { label: "Wishlist", to: "/wishlist" },
  { label: "Cart", to: "/cart" },
  { label: "Create account", to: "/register" },
  { label: "Log in", to: "/login" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-wine-deep text-primary-foreground">
      <div className="container-x grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-[#f5f1eb]/90 p-3 shadow-[0_10px_30px_rgba(255,255,255,0.08)] backdrop-blur-sm">
            <img src={BRAND_LOGO} alt="Flowers Forever logo" className="h-12 w-auto object-contain" />
          </div>
          <p className="mt-3 max-w-sm text-sm text-primary-foreground/70">
            Make Every Moment Bloom. Hand-crafted bouquets, DIY kits and home décor delivered to
            valid PIN codes across India, with faster options in Bengaluru.
          </p>
          <div className="mt-5 flex gap-2">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid size-9 place-items-center rounded-full border border-primary-foreground/25 transition hover:border-white/60 hover:bg-white/5"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
          <div className="mt-5 space-y-1.5 text-sm text-primary-foreground/70">
            <p className="flex items-center gap-2">
              <Phone className="size-4" /> +91 98000 12345
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4" /> care@flowersforever.in
            </p>
          </div>
        </div>

        <FooterCol title="Shop">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="footer-link">
              {c.name}
            </Link>
          ))}
          <Link to="/products" className="footer-link">
            All Products
          </Link>
        </FooterCol>

        <FooterCol title="Help">
          {HELP.map((l) => (
            <Link key={l.to} to={l.to} className="footer-link">
              {l.label}
            </Link>
          ))}
        </FooterCol>

        <FooterCol title="Account">
          {ACCOUNT.map((l) => (
            <Link key={l.to} to={l.to} className="footer-link">
              {l.label}
            </Link>
          ))}
        </FooterCol>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-primary-foreground/70 sm:flex-row">
          <p>© {new Date().getFullYear()} Flowers Forever. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="size-4" /> 100% secure payments · UPI · Cards · Net Banking
            <Link
              to="/ff-admin"
              aria-label="Staff console"
              title="Staff console"
              className="ml-2 select-none text-primary-foreground/25 transition hover:text-primary-foreground"
            >
              ·
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">{title}</h3>
      <div className="flex flex-col gap-2 text-sm text-primary-foreground/70 [&_a:hover]:text-primary-foreground">
        {children}
      </div>
    </div>
  );
}
