# Flowers Forever

Flowers Forever is a premium Indian gifting marketplace built as a monorepo with a frontend storefront and a backend API layer.

## Project structure

- Frontend/ — React + Vite storefront for the customer experience
- Backend/ — Node.js + Express + TypeScript API scaffold for products, auth, orders, and account flows
- README.md — project overview and setup guide
- roadmap.md — delivery plan and current progress

## Current state

### Frontend
The storefront in Frontend is built and includes:
- home page and category browsing
- product detail pages
- shopping cart and wishlist logic
- account and address management
- checkout flow and order simulation
- admin-like product and order views

### Backend
A backend foundation has been created in Backend with:
- Express server
- TypeScript setup
- mock catalog and order data
- initial REST API routes for products, coupons, search, auth, addresses, and orders
- environment configuration for local development

## Tech stack

### Frontend
- React
- Vite
- TypeScript
- TanStack Router
- Tailwind CSS
- Zustand
- React Query
- React Hook Form
- Zod

### Backend
- Node.js
- Express
- TypeScript
- REST API architecture

## API surface

The backend currently supports:

- GET /api/health
- GET /api/categories
- GET /api/products
- GET /api/products/:slug
- GET /api/search
- GET /api/coupons
- GET /api/pincode/:code
- POST /api/auth/register
- POST /api/auth/login
- GET /api/account/:userId
- POST /api/account/:userId/addresses
- DELETE /api/account/:userId/addresses/:addressId
- GET /api/orders/:userId
- POST /api/orders
- PATCH /api/orders/:id/status
- GET /api/admin/overview

This API contract is aligned with the current customer flows already implemented in the frontend.

## Local setup

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

### Backend
```bash
cd Backend
npm install
npm run dev
```

## Next priorities

1. Connect the frontend stores to real backend fetch calls instead of local simulation
2. Replace mock data with a real database layer
3. Add JWT auth, password hashing, and secure session handling
4. Add payment integration and order webhooks
5. Prepare deployment configuration for frontend and backend hosting

## Product direction

Flowers Forever is designed to feel like a premium Indian gifting marketplace with a polished shopping experience, trust-building UX, rich product discovery, and a strong delivery flow for occasions like birthdays, anniversaries, weddings, gifting, and home styling.

Personalized Gifts

/search

Search Results

/product/:slug

Product Details

/cart

Shopping Cart

/checkout

Checkout

/order-success

Order Success

/orders

My Orders

/orders/:id

Order Details

/wishlist

Wishlist

/account

Account

/login

Login

/register

Register

/forgot-password

Forgot Password

/about

About Us

/contact

Contact

/faq

FAQ

/privacy

Privacy Policy

/terms

Terms & Conditions

/refund

Refund Policy

ADMIN PANEL

/admin

/admin/login

/admin/dashboard

/admin/products

/admin/products/create

/admin/products/:id/edit

/admin/categories

/admin/orders

/admin/orders/:id

/admin/customers

/admin/coupons

/admin/banners

/admin/reviews

/admin/inventory

/admin/delivery-slots

/admin/settings

==================================================

4. HEADER

==================================================

Create a sophisticated multi-level e-commerce header.

Desktop:

Top promotional strip:

"Same Day Delivery | 7 Days Customer Support | Secure Payments"

Main header:

- Bloomora logo

- Location selector

- Search bar

- Account

- Wishlist

- Cart

Navigation menu:

- Flowers

- Cakes

- Plants

- Gifts

- Combos

- Personalized

- Birthday

- Anniversary

- Occasions

- Offers

Add dropdown mega menus.

Mega menu should contain:

- Category

- Subcategories

- Popular products

- Occasions

- Price ranges

Mobile:

- Hamburger menu

- Logo

- Search

- Cart

- Sticky bottom navigation

Bottom mobile navigation:

Home

Categories

Search

Wishlist

Account

Header should become sticky after scrolling.

==================================================

5. HOME PAGE

==================================================

Create a premium conversion-focused homepage.

Section order:

1. Hero banner

Large premium promotional banner.

Example original copy:

"Beautiful Gifts.

Beautifully Delivered."

CTA:

"Shop Now"

Secondary CTA:

"Explore Collections"

2. Quick category icons

Flowers

Cakes

Plants

Gift Hampers

Personalized

Combos

3. Trending collections

Large cards:

- Best Sellers

- Birthday

- Anniversary

- Romantic

- Congratulations

- Thank You

4. Product carousel

"Best Sellers"

5. Promotional banner

"Make Today Special"

6. Product carousel

"Fresh Flowers"

7. Occasion section

Birthday

Anniversary

Love

Congratulations

Thank You

Get Well Soon

8. Cakes section

9. Plants section

10. Gift hampers

11. Personalized gifts

12. Combo gifts

13. Premium collection

14. Why Bloomora?

Use icons:

Fresh & Quality Assured

Same Day Delivery

Secure Payments

Easy Returns

Customer Support

15. Customer reviews

16. Instagram/social-style gallery

17. Newsletter

18. Footer

==================================================

6. PRODUCT LISTING PAGE

==================================================

Create a sophisticated PLP.

Desktop layout:

Left sidebar filters.

Filters:

- Category

- Occasion

- Price

- Rating

- Delivery

- Color

- Flower type

- Availability

- Discount

Main area:

Breadcrumb

Title:

"Flowers"

Product count

Sort dropdown:

- Popularity

- Price Low to High

- Price High to Low

- Rating

- Newest

- Discount

Grid:

4 columns desktop

3 tablet

2 mobile

Product card:

- Image

- Wishlist heart

- Discount badge

- Product name

- Rating

- Review count

- Current price

- Original price

- Discount percentage

- Delivery information

- Quick Add button

Hover:

- Image transition

- Second image

- Quick View

Infinite scroll or pagination.

==================================================

7. PRODUCT DETAILS

==================================================

Create a premium product detail page.

Left:

Image gallery

- Main image

- Thumbnail gallery

- Zoom

- Multiple product images

Right:

Product name

Rating

Reviews

SKU

Price

MRP

Discount

Delivery location:

"Enter pincode"

Show:

✓ Available

✓ Same Day Delivery

✓ Free Delivery

Delivery date selector.

Delivery time slots:

Morning

Afternoon

Evening

Midnight

Personalized message:

"Add a message"

Gift options:

Add greeting card

Add wrapping

Add teddy

Add chocolates

Quantity selector.

Buttons:

ADD TO CART

BUY NOW

Wishlist.

Below:

Product description

Ingredients/materials

Care instructions

Delivery information

Cancellation policy

Reviews

FAQs

Related products.

Recently viewed products.

==================================================

8. LOCATION + DELIVERY

==================================================

Create location selector modal.

Allow:

- Detect location

- Enter city

- Enter pincode

Support Indian cities.

Examples:

Mumbai

Delhi

Bangalore

Hyderabad

Chennai

Pune

Kolkata

Bhubaneswar

Cuttack

Berhampur

Delivery availability should depend on selected pincode.

Create delivery-slot data model.

==================================================

9. SEARCH

==================================================

Build advanced search.

Search suggestions while typing.

Show:

Popular searches

Recent searches

Products

Categories

Search page:

"Search results for..."

Filters

Sorting

Product grid

Handle:

- No results

- Typo tolerance

- Empty search

- Loading state

==================================================

10. CART

==================================================

Cart drawer + full cart page.

Cart item:

Image

Name

Variant

Price

Quantity

Remove

Wishlist

Show:

Subtotal

Discount

Delivery charge

Tax

Total

Coupon field.

Recommended products:

"You may also like"

Free delivery progress bar:

"Add ₹350 more for FREE DELIVERY"

==================================================

11. CHECKOUT

==================================================

Create a multi-step production-quality checkout.

Step 1:

Address

Fields:

Full name

Mobile

Email

Address

Apartment

Landmark

City

State

Pincode

Save address.

Step 2:

Delivery

Date

Time slot

Step 3:

Gift message

Step 4:

Payment

Payment methods:

Razorpay

UPI

Credit/Debit Card

Net Banking

Wallets

Cash on Delivery where applicable

Order summary.

Coupon.

Tax.

Delivery fee.

Final amount.

Place Order.

==================================================

12. AUTHENTICATION

==================================================

Implement:

Register

Login

Logout

Forgot password

Reset password

Email verification

Profile:

Name

Email

Mobile

Profile photo

Saved addresses.

Order history.

Wishlist.

Security:

JWT

Refresh token

Password hashing

Protected routes

Role-based authorization

Roles:

customer

admin

staff

==================================================

13. ORDERS

==================================================

Create complete order lifecycle.

Statuses:

Pending

Confirmed

Preparing

Out for Delivery

Delivered

Cancelled

Refund Initiated

Refunded

Order tracking UI:

Order Confirmed

Preparing

Out for Delivery

Delivered

Show timestamps.

Customer can:

View order

Cancel where eligible

Request refund

Download invoice

==================================================

14. WISHLIST

==================================================

Wishlist page.

Add/remove products.

Move to cart.

Persistent wishlist for authenticated users.

==================================================

15. REVIEWS

==================================================

Customers can review delivered products.

Rating:

1-5 stars

Text review.

Optional image upload.

Admin moderation.

Average rating.

Rating distribution.

==================================================

16. COUPONS

==================================================

Create coupon system.

Coupon types:

Percentage

Fixed amount

Free delivery

Conditions:

Minimum order value

Expiry

Usage limit

Per-user limit

Applicable categories

Applicable products

==================================================

17. ADMIN DASHBOARD

==================================================

Build a complete professional admin panel.

Dashboard cards:

Total Sales

Orders

Customers

Products

Revenue

Pending Orders

Charts:

Revenue over time

Orders over time

Top products

Category sales

Recent orders table.

==================================================

18. PRODUCT MANAGEMENT

==================================================

Admin can:

Create product

Edit product

Delete product

Publish/unpublish

Upload images

Set price

Set MRP

Set discount

Set stock

Set category

Set tags

Set delivery availability

Set variants

Product fields:

name

slug

description

shortDescription

price

mrp

discount

category

subcategory

images

thumbnail

stock

sku

tags

occasions

rating

reviews

deliveryCities

deliveryTypes

isFeatured

isBestSeller

isActive

==================================================

19. INVENTORY

==================================================

Inventory dashboard.

Show:

SKU

Product

Stock

Low stock

Out of stock

Low stock warning.

Prevent checkout when unavailable.

==================================================

20. BANNERS / CMS

==================================================

Admin should be able to manage:

Hero banners

Promotional banners

Homepage sections

Featured collections

Categories

Do not hardcode homepage content where possible.

==================================================

21. DATABASE MODELS

==================================================

Create MongoDB models:

User

Product

Category

Subcategory

Order

OrderItem

Cart

Wishlist

Address

Review

Coupon

Banner

DeliverySlot

Payment

Inventory

Notification

Create appropriate indexes.

Use relationships/references correctly.

==================================================

22. API ARCHITECTURE

==================================================

Create REST APIs.

Examples:

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

POST /api/auth/refresh

GET /api/products

GET /api/products/:slug

POST /api/products

PUT /api/products/:id

DELETE /api/products/:id

GET /api/categories

GET /api/cart

POST /api/cart

PUT /api/cart/:itemId

DELETE /api/cart/:itemId

GET /api/wishlist

POST /api/wishlist

DELETE /api/wishlist/:productId

POST /api/orders

GET /api/orders

GET /api/orders/:id

PATCH /api/orders/:id/status

POST /api/payments/create-order

POST /api/payments/verify

GET /api/reviews

POST /api/reviews

POST /api/coupons/validate

Admin APIs must require admin authorization.

==================================================

23. ERROR HANDLING

==================================================

Production-quality error handling.

Handle:

404

401

403

422

429

500

Create reusable API error response format.

Frontend:

Toast notifications

Error boundaries

Loading skeletons

Retry mechanisms

Empty states

==================================================

24. PERFORMANCE

==================================================

Optimize for production.

Implement:

Lazy loading

Code splitting

Image optimization

Responsive images

Caching

Debounced search

Pagination

API caching

Skeleton loading

Optimistic UI where appropriate

Target:

Lighthouse Performance > 90

Accessibility > 90

SEO > 90

Avoid unnecessary re-renders.

==================================================

25. SEO

==================================================

Every product/category page should have:

Unique title

Meta description

Canonical URL

Open Graph metadata

Twitter metadata

Create:

robots.txt

sitemap.xml

Product structured data.

Breadcrumb structured data.

Organization structured data.

==================================================

26. RESPONSIVE DESIGN

==================================================

The website must work perfectly on:

Desktop

Laptop

Tablet

Mobile

Breakpoints should be carefully designed.

Do NOT simply shrink desktop UI.

Create dedicated mobile layouts where appropriate.

Mobile product page should have:

Sticky Add to Cart / Buy Now bar.

==================================================

27. UI QUALITY

==================================================

The design should feel like a real commercial Indian e-commerce website.

Use:

- Subtle shadows

- Rounded cards

- Premium spacing

- Smooth transitions

- Hover states

- Skeleton loaders

- Toast notifications

- Bottom sheets on mobile

- Modals

- Drawers

- Sticky elements

- Micro-interactions

Do NOT overuse animations.

Use clean modern ecommerce UX.

==================================================

28. IMAGES

==================================================

Do not use FNP images.

Use legally usable placeholder/demo images from appropriate image sources or generate original placeholder assets.

Create a centralized image configuration so images can easily be replaced with Cloudinary URLs later.

Every product should have multiple images.

Use realistic Indian gifting products:

Roses

Lilies

Orchids

Sunflowers

Mixed bouquets

Birthday cakes

Chocolate cakes

Plants

Gift hampers

Teddy bears

Chocolates

Personalized mugs

Photo frames

Greeting cards

Corporate gifts

Combo gifts

Create at least 50 realistic products in seed data.

==================================================

29. SEED DATA

==================================================

Create seed script.

Include:

50+ products

10+ categories

20+ occasions

Multiple price ranges

Multiple cities

Delivery slots

Coupons

Sample users

Sample orders

Prices should be realistic INR values.

==================================================

30. SECURITY

==================================================

Implement:

Input validation

Rate limiting

Helmet

CORS

Secure cookies where appropriate

Password hashing

JWT security

Role-based access

MongoDB injection protection

XSS protection

Request validation

File upload validation

Never expose secrets.

==================================================

31. ENVIRONMENT

==================================================

Create:

.env.example

Variables:

MONGODB_URI=

JWT_SECRET=

JWT_REFRESH_SECRET=

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

EMAIL_HOST=

EMAIL_USER=

EMAIL_PASSWORD=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

==================================================

32. PROJECT STRUCTURE

==================================================

Use a clean scalable architecture.

Frontend:

src/

  components/

  pages/

  layouts/

  hooks/

  services/

  store/

  utils/

  data/

  assets/

Backend:

server/

  controllers/

  models/

  routes/

  middleware/

  services/

  utils/

  config/

Separate frontend and backend cleanly.

==================================================

33. IMPORTANT UX DETAILS

==================================================

Add:

Wishlist heart animation.

Cart count badge.

Sticky header.

Sticky mobile purchase bar.

Recently viewed products.

Recommended products.

Recently searched terms.

Location persistence.

Address persistence.

Cart persistence.

Login persistence.

Coupon validation.

Delivery date validation.

Out-of-stock handling.

Network error handling.

Skeleton loaders.

Proper empty states.

Confirmation modals for destructive actions.

==================================================

34. ADMIN UX

==================================================

Admin sidebar:

Dashboard

Orders

Products

Categories

Customers

Inventory

Coupons

Banners

Reviews

Delivery Slots

Settings

Use tables with:

Search

Filters

Pagination

Bulk actions

Export CSV

==================================================

35. TESTING

==================================================

Create basic tests for:

Authentication

Product API

Cart

Orders

Coupon validation

Payment verification

Also create frontend tests for important components.

==================================================

36. DOCUMENTATION

==================================================

Create:

README.md

Include:

Project overview

Architecture

Tech stack

Installation

Environment variables

Database setup

Seed command

Development commands

Production build

Deployment

Razorpay setup

Cloudinary setup

Email setup

Admin setup

Also include:

API documentation.

==================================================

37. DO NOT STOP AT UI

==================================================

This is extremely important.

Do NOT generate only static frontend screens.

Implement:

Frontend

Backend

Database

Authentication

API

Admin panel

Cart

Wishlist

Orders

Payments architecture

Reviews

Coupons

Inventory

Delivery slots

SEO

Security

Error handling

Seed data

All major flows must actually work.

Where third-party credentials are unavailable, implement the complete integration architecture using environment variables and provide a clear fallback/mock development mode.

==================================================

38. FINAL QUALITY REQUIREMENT

==================================================

Before considering the project complete:

- Check every route.

- Check navigation.

- Check mobile responsiveness.

- Check cart flow.

- Check authentication flow.

- Check protected routes.

- Check admin authorization.

- Check API errors.

- Check empty states.

- Check loading states.

- Check checkout validation.

- Check product filtering.

- Check search.

- Check wishlist.

- Check order creation.

- Check order status.

- Check database models.

- Check environment configuration.

- Remove console errors.

- Remove broken links.

- Remove placeholder TODOs wherever possible.

The final result should look and behave like a real premium Indian flower and gifting e-commerce business, not a student template.

Prioritize:

1. Production-quality UX

2. Visual polish

3. Functional e-commerce flows

4. Scalable architecture

5. Security

6. Performance

7. Mobile experience

8. SEO

9. Maintainability

Start by creating the complete project architecture and then implement the application systematically.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/737642f4-a820-4208-93dd-c3667a34bc68).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
