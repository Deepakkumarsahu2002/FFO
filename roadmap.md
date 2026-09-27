# Flowers Forever — build roadmap

## Phase 1 — Frontend storefront (complete)
- [x] Premium storefront design system and product-first brand direction
- [x] Product catalogue, category pages, product detail pages, cart, and wishlist
- [x] Search, delivery pin validation, coupons, and order summary logic
- [x] Account, login, and saved-address flows
- [x] Checkout flow with simulated order placement
- [x] Static pages: about, contact, FAQ, privacy, terms, refund
- [x] SEO metadata and route-level UX polish

## Phase 2 — Frontend state and local simulation (complete)
- [x] Zustand-based cart and wishlist persistence
- [x] Local account state with registration, login, saved addresses, and orders
- [x] Admin-like dashboard structure and mock business data
- [x] Catalog and business rules for pricing, stock, delivery thresholds, and coupons

## Phase 3 — Backend foundation (in progress)
- [x] Create Backend folder and TypeScript project structure
- [x] Add Express server and environment configuration
- [x] Define API contract for catalog, search, auth, account, orders, and admin overview
- [x] Seed mock data aligned with current frontend shopping behavior
- [ ] Replace mock data with MongoDB models and persistence
- [ ] Add real JWT auth and secure password hashing
- [ ] Connect frontend to backend APIs and remove local-only simulation

## Phase 4 — Production backend and data layer (pending)
- [ ] MongoDB + Mongoose models for users, products, addresses, orders, coupons, and inventory
- [ ] Service/controller/route structure for clean backend architecture
- [ ] Product CRUD, auth, order state management, and admin APIs
- [ ] Razorpay integration and order verification flow
- [ ] Email and notification flows for order and password reset
- [ ] Deployment config and environment hardening

## Phase 5 — Release readiness (pending)
- [ ] End-to-end testing for checkout and account journeys
- [ ] Performance and accessibility passes
- [ ] Production deployment setup for frontend and backend
- [ ] Error monitoring and operational logging
