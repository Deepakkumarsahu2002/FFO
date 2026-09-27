# Flowers Forever Backend

This backend is the API layer for the Flowers Forever storefront. It intentionally mirrors the shopping flow already modeled in the frontend: catalog browsing, product detail, cart totals, location validation, account management, and order placement.

## API plan

### Public storefront
- `GET /api/health` — health check
- `GET /api/categories` — category listing with tagline and subcategories
- `GET /api/products` — list products with optional filters (`category`, `search`, `featured`)
- `GET /api/products/:slug` — fetch one product by slug
- `GET /api/search?q=...` — quick product search
- `GET /api/coupons` — available coupon codes
- `GET /api/pincode/:code` — check if a delivery pincode is supported

### Account and auth
- `POST /api/auth/register` — register a shopper
- `POST /api/auth/login` — login with email + password
- `GET /api/account/:userId` — fetch profile, addresses, and recent orders
- `POST /api/account/:userId/addresses` — add a shipping address
- `DELETE /api/account/:userId/addresses/:addressId` — remove a shipping address

### Orders and checkout
- `POST /api/orders` — place an order from checkout
- `GET /api/orders/:userId` — fetch orders for a customer
- `PATCH /api/orders/:id/status` — update order status (admin use)

### Admin / internal
- `GET /api/admin/overview` — dashboard summary (sales, orders, etc.)

## Why these APIs

These routes align directly with the frontend state defined in:
- `Frontend/src/store/catalog.ts`
- `Frontend/src/store/shop.ts`
- `Frontend/src/store/account.ts`

The app currently has local state for catalog, cart, wishlist, address data, and orders. The backend should eventually replace that local persistence with real database-backed APIs so the frontend can load the same state from the server.

## Local development

```bash
cd Backend
npm install
npm run dev
```

Then hit:
- http://localhost:4000/api/health

## Frontend integration target

The frontend will eventually replace local Zustand persistence with server-driven fetches such as:
- `fetch('/api/products')`
- `fetch('/api/products/${slug}')`
- `fetch('/api/orders/${userId}')`
- `fetch('/api/auth/login', { method: 'POST', ... })`
