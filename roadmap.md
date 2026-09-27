# Flowers Forever — build roadmap

## Phase 1 — Storefront (complete)
- [x] Brand design system (burgundy/cream/blush) + fonts
- [x] Centralised image config + 50+ product seed catalogue
- [x] Zustand store: cart, wishlist, location, recently viewed (persisted)
- [x] Header (promo strip, mega menu, search, sticky) + mobile bottom nav
- [x] Footer
- [x] Home page (hero, categories, collections, carousels, why-us, reviews, newsletter)
- [x] PLP: /products, /category/$slug with filters + sort
- [x] PDP: /product/$slug with gallery, pincode, slots, gift options, sticky mobile bar
- [x] Search page (typo tolerance) + header suggestions
- [x] Cart page + drawer, coupons, free-delivery bar
- [x] SEO head metadata per route

## Phase 2 — Accounts, checkout, orders (complete, local/simulated)
- [x] Login (device-local profile until backend auth lands)
- [x] Account: profile, saved addresses, recent orders
- [x] Multi-step checkout (address, delivery date/slot, payment — simulated)
- [x] Orders list with status, cancel, buy-again
- [x] Wishlist page
- [x] Static pages: about, contact, FAQ, privacy, terms, refund

## Phase 3 — Admin panel (complete)
- Hidden /ff-admin console: dashboard, products CRUD, orders, coupons, settings
- [ ] Dashboard, products, categories, orders, customers, coupons, banners,
      reviews, inventory, delivery slots, settings

## Phase 4 — Backend source files (Express + MongoDB, delivered as code) (pending)
- [ ] server/ structure: models, controllers, routes, middleware, services
- [ ] Auth (JWT + refresh), products, cart, orders, payments (Razorpay), coupons
- [ ] Seed script, .env.example, README + API docs, basic tests
