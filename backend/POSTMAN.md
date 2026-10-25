# Postman API testing walkthrough

Postman is the API test workflow for orders, payments, coupons, and reports in this project. Import the existing collection and run its requests against a running backend. Do not put real passwords, database URIs, or API keys into a shared collection or commit them.

## 1. Start the backend and frontend

1. In `backend/.env`, set `MONGODB_URI`, a long private `JWT_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` (at least 12 characters).
2. In a terminal opened at `backend`, run `npm run admin:create` once, then `npm run dev`. Leave this terminal running. If it reports missing environment values or a MongoDB connection error, fix that first.
3. In another terminal, start the frontend with `npm run dev --prefix frontend` and open the URL it prints, usually `http://localhost:5173`.

## 2. Sign in on the website

- **Customer:** open `/account`, choose Sign Up, create an account, then use the same email and password to sign in. Customers can also register directly in Postman with `POST http://localhost:5000/api/auth/register`.
- **Admin:** open `/admin`, choose the Admin tab, and enter `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your private `.env`.
- **Delivery partner:** first sign in as admin. In Admin → Users, create a user with the **Delivery Partner** role and a password. Then open `/admin`, choose Delivery Partner, and use that user's email/password. A customer account cannot sign in to staff panels.

If you registered before adding `JWT_SECRET`, the account may have been saved even though the request returned an error. After restarting with `JWT_SECRET`, try logging in with those same credentials before registering again. If login says the password is wrong, create a new account with a different email or have the admin create the staff account again with a known password.

An existing admin account does not get its password from `.env` automatically. The env values are only used when creating/resetting an admin. To reset a friend's existing admin account, set `ADMIN_EMAIL` to the friend's exact database email and `ADMIN_PASSWORD` to a new password in `.env`, then run `npm run admin:reset-password` from `backend`. This only resets an account whose database role is `admin`.

## 3. Use Postman

1. The editable Postman folder fragments are separate files under `backend/collection/Ayesha - Orders Payments Coupons Reports/`: `0 Setup.json`, `1 Orders (COD).json`, `2 Payments (SSLCommerz).json`, `3 Coupons.json`, `4 Reports.json`, `5 Share Your Experience.json`, and `6 Contact.json`. The environment example is kept separately under `backend/collection/Environment/`.
2. Postman displays a collection containing folders, but imports/exports that collection as one JSON document. To package the five source files into the friend-style Postman collection, run from the project root:

```bash
node backend/collection/build-postman-collection.mjs
```

This creates the importable file `backend/Ayesha - Orders Payments Coupons Reports.postman_collection.json`. Import that generated collection file and `backend/collection/Environment/Make-Me-Pretty.postman_environment.example.json` into Postman. The four old standalone collection exports are preserved in `backend/archived-postman-exports/` and should not be imported for this layout.
3. The imported Environment is named **Local**. Duplicate it in Postman for private credentials, select the duplicate as the active Environment, and fill in customer, admin, and delivery partner credentials. Keep the committed `.example.json` blank apart from `baseUrl`. If you export your real Environment into `backend/collection/Environment/` as `Make-Me-Pretty.postman_environment.json`, Git ignores it.
4. Start with **0 Setup**. Run **Health**, **Register customer** once if needed, **Login customer**, and **List products**. Registration for an existing email returns `409`; log in instead. Product listing selects an in-stock product into the active Environment's `productId`; if it does not, set a valid ID manually.
5. For staff tests, first create a delivery partner through the existing Admin → Users UI if needed. In **0 Setup**, run **Login admin** and **Login delivery partner**. Login scripts put `customerToken`, `adminToken`, and `deliveryPartnerToken` in the active Environment. Ensure **Local** (or your private duplicate) stays selected. Then run any numbered module folder. Never share a real Environment export or token; tokens grant account access until they expire.

## 4. Order and payment request sequence

Run **1 Orders (COD)** with valid customer, admin, and delivery-partner logins from **0 Setup**. It creates a COD order, checks idempotent replay and invalid inputs, tests that fulfillment alone does not make COD paid, verifies an unassigned delivery partner is rejected, and confirms COD collection only for the assigned partner. It creates a separate unpaid COD order for cancellation; the existing admin order-status route cancels it and restores reserved stock.

To test cross-customer access, set `otherCustomerOrderId` to an order owned by a different customer, then run **Customer cannot read another customer order** with the first customer's token. The request should return `404`.

For SSLCommerz, run **2 Payments (SSLCommerz)**. Run the config, SSL order creation, initiation, and initiation-replay requests. When sandbox is enabled, copy/open the returned `redirectUrl` in a browser and complete the hosted sandbox checkout. Then run the browser success callback or IPN request and **Check SSL order payment status after callback**. Payment state is determined by the server-side SSLCommerz verification and authenticated order read, not by the browser redirect. An invalid validation-reference request is available before payment as an optional live sandbox negative check.

Failure and cancellation callbacks are manual: use transaction IDs for attempts that SSLCommerz actually failed or cancelled. They verify the callback result and then read the associated order to assert its server-side payment status. Do not use callback request fields as proof of a payment result.

Order creation reserves stock. The main COD/SSL orders remain in the database; use a product with enough stock. The dedicated COD cancellation scenario restores its stock. The setup and configuration for provider callbacks are documented in [backend/README.md](../README.md); callbacks require valid sandbox credentials and a publicly reachable HTTPS API URL.

## 5. Coupons and reports

Run **3 Coupons** after customer and admin login in **0 Setup**. It creates a unique temporary coupon, checks percent/fixed/shipping discounts and invalid cases, then deletes the coupon in the final cleanup request. If you stop the run early, run **Delete test coupon (cleanup)** manually using the saved `couponTestId`.

Run **4 Reports** after admin login in **0 Setup**. It checks access control and response sections, and verifies the monthly and daily received-revenue totals agree with the backend summary. Reports are read-only; their totals reflect the orders currently in MongoDB, excluding demo records.

Run **5 Share Your Experience** after customer and admin login in **0 Setup**. Select an active `productId` with which the customer has not already reviewed. It submits a pending product review, checks invalid/duplicate review handling and admin permissions, rejects and deletes the test review at the end. If that customer already reviewed the selected product, the create request correctly returns `409`; choose a different product to exercise a new review.

Run **6 Contact** after customer and admin login in **0 Setup**. It submits one real message into MongoDB, verifies invalid/honeypot handling and admin-only inbox access, then marks the saved test message resolved. Contact test messages remain in the admin inbox with `resolved` status. The public Contact form is rate-limited; if it returns `429`, wait for the 10-minute window to expire before retrying.

## 6. What Postman cannot simulate

- A provider-side amount/currency mismatch cannot be safely generated through the public API. The backend validates the response returned directly by SSLCommerz. Sending forged amount/currency values in a callback body does not create a mismatched SSLCommerz validation response. Such a case needs a controlled provider fixture or deliberate database test setup, outside this Postman-only API collection.
- Postman sequential replay checks idempotency but does not reliably produce a true simultaneous-request race.
- Database index deployment, persisted document inspection, and injected database-write failure/rollback require database or infrastructure inspection.
- The collection does not mock SSLCommerz and does not claim a real payment succeeded unless a sandbox checkout was completed and the backend verified it.

## 7. Frontend and CORS

The frontend is already configured to call the backend API (`VITE_API_URL`, defaulting to `http://localhost:5000/api`). Express enables CORS for the origins in `CLIENT_ORIGINS` (with localhost frontend defaults). CORS is the browser's permission check for calls across the frontend/backend ports. Postman is a separate API client and does not use browser CORS; use it to demonstrate endpoint requests and responses before or after opening the site.

## 8. What the database stores

MongoDB creates collections when the app first writes those document types. This project has collections for users, products, orders, carts, wishlists, banners, blogs, coupons, and reviews. There are no separate brand/category collections: brand and category values are currently stored on each product and the API derives their lists. `npm run seed:catalog-samples` inserts source-linked official-brand coursework listings with illustrative local price/stock; `npm run seed:promotions` inserts sample promotion records.

For real products, enter verified brand, product name, size, price, stock, manufacturer-provided ingredients and usage, category, and a product photo you have permission to use in Admin → Inventory. The current demo products are not verified product data. Do not guess ingredient lists or product claims.
