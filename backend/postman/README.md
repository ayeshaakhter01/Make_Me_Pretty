# Postman walkthrough (no code or test folder required)

Postman is a desktop app for sending HTTP requests to the running backend and inspecting the responses. The collection in this folder is a starter set of requests; it is separate from automated code tests. Do not put real passwords, database URIs, or API keys into a shared collection or commit them.

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

1. Install/open Postman and choose **Import** → **File**, then select `Make-Me-Pretty.postman_collection.json`.
2. Open the imported collection and run **Health**. Expected: HTTP `200`, JSON with `"success": true`. If this fails, check that the backend terminal is still running and that MongoDB connected.
3. Run **Register customer** once, then **Login customer**. The login request saves a bearer token into the collection variable `token`. Re-running registration with the same email returns `409`; that is expected, so just run Login. No Postman environment is required.
4. Run **Current user** and **List products**. Expected: HTTP `200`. A connected but empty database can correctly return an empty product list.
5. For admin checks, first call `POST http://localhost:5000/api/auth/login` with the admin email/password. Copy `data.token` from the response, then set the collection variable `token` to that value before running **Admin banners**. A customer token should receive `403` on admin endpoints.
6. To create a delivery partner through Postman, keep the admin token in `token`, then send `POST http://localhost:5000/api/admin/users` with `Content-Type: application/json` and this body:

```json
{
  "name": "Delivery Demo",
  "email": "delivery@example.com",
  "password": "ChangeThisPassword123!",
  "role": "deliveryPartner",
  "phone": "01700000000"
}
```

Use `Authorization: Bearer {{token}}`. Then log in as the delivery user at `/api/auth/login`, copy its `data.token` into `token`, and call `GET http://localhost:5000/api/delivery/assignments`. An empty assignments array is normal before an order is assigned to this account.

The `token` variable holds one role at a time. Log in as the role you want to test, replace the variable with that login response's token, and run that role's protected requests. Never share a token; it grants account access until it expires.

## 4. Prepare and test a real order

Copy a product's MongoDB ID from the API response into `productId`. Log in as a customer and set `token` to that customer's token. Then run **Add item to cart**, **Create COD order**, **Own orders**, and **Track order**. The create request saves the short `orderNumber`; tracking also uses the `orderPhone` collection variable, which must match the phone in the order. Creating an order writes to the database and reduces stock, so use a suitable test product. Online payment is not enabled; use `cod`.

## Frontend and CORS

The frontend is already configured to call the backend API (`VITE_API_URL`, defaulting to `http://localhost:5000/api`). Express enables CORS for the origins in `CLIENT_ORIGINS` (with localhost frontend defaults). CORS is the browser's permission check for calls across the frontend/backend ports. Postman is a separate API client and does not use browser CORS; use it to demonstrate endpoint requests and responses before or after opening the site.

## What the database stores

MongoDB creates collections when the app first writes those document types. This project has collections for users, products, orders, carts, wishlists, banners, blogs, coupons, and reviews. There are no separate brand/category collections: brand and category values are currently stored on each product and the API derives their lists. `npm run seed:catalog-samples` inserts source-linked official-brand coursework listings with illustrative local price/stock; `npm run seed:promotions` inserts sample promotion records.

For real products, enter verified brand, product name, size, price, stock, manufacturer-provided ingredients and usage, category, and a product photo you have permission to use in Admin → Inventory. The current demo products are not verified product data. Do not guess ingredient lists or product claims.
