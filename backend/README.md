# Make Me Pretty backend

The backend is an ESM Express API organized by feature under `modules/`. Each feature keeps its routes, controllers, and services together. Shared Mongoose models, middleware, validators, and utilities live in their shared folders. Controllers handle HTTP input and response codes; services contain application and database logic.

## Local setup

1. Install Node.js and MongoDB (local MongoDB or MongoDB Atlas).
2. Copy `.env.example` to `.env` and set `MONGODB_URI`, a long random `JWT_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Set `CLIENT_ORIGINS` to the frontend origin(s). Keep `.env` private.
3. From this folder run `npm install`, then `npm run admin:create`. Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env` first; the admin password must be at least 12 characters.
   To reset an existing admin's password, set `ADMIN_EMAIL` to that account's email and `ADMIN_PASSWORD` to the new password, then run `npm run admin:reset-password`.
4. Run `npm run seed:promotions` to insert the sample promotions, then `npm run dev`.
   Run `npm run seed:catalog-samples` to publish 22 source-linked official-brand coursework listings. The script hides the named fictional products and applies clearly labeled sample BDT prices and stock so the storefront is populated. Replace illustrative artwork with product photos you have permission to use and verify local pricing, stock, pack sizes, and ingredients before accepting real sales.
5. In `frontend`, copy `.env.example` to `.env` and set `VITE_API_URL=http://localhost:5000/api`; run `npm install` and `npm run dev`.
6. Follow [postman/README.md](postman/README.md) to import the collection and test customer, admin, and delivery routes.

The app will not start successfully until MongoDB is reachable. This project has not been connected to your private MongoDB instance from this workspace.

## Catalog and operations

Create products in the admin inventory screen using product details and images verified from the actual manufacturer or supplier. The included catalog is demo fallback content; it must not be presented as verified product information. Category and brand lists are derived from active product records.

Image uploads are stored under `backend/uploads` on the server. Back up that folder and use persistent storage if deploying to a host with ephemeral disks. Admin APIs require a valid JWT and the `admin` role. Delivery endpoints require a `deliveryPartner` role.

Orders currently support Cash on Delivery. The server calculates prices, delivery fees, coupon discounts, stock changes, and order snapshots. Card/bKash checkout needs a merchant account, provider credentials, callback URLs, and a verified payment flow before it can be enabled. The skin advisor uses catalog rules unless `OPENAI_API_KEY` is configured; keep provider keys on the backend only.

## API map

- `/api/auth`, `/api/users`: registration, login, profile, and addresses
- `/api/products`, `/api/categories`, `/api/brands`: catalog; `/api/products/:id/reviews`: reviews
- `/api/cart`, `/api/wishlist`, `/api/orders`: customer shopping and orders
- `/api/admin/*`: protected catalog, users, promotions, reviews, and reports
- `/api/banners`, `/api/blogs`, `/api/coupons`: public reads and protected admin writes
- `/api/uploads/images`: authenticated image upload
- `/api/delivery`, `/api/skin-advisor`, `/api/health`: delivery, advisor, and health check

The Postman collection provides a starter request flow; see `postman/README.md` for role setup, expected responses, and product ID setup.
