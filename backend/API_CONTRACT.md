# API Contract: Coupons, Banners, Reviews, Reports

Status: **Implemented baseline**. This contract records current API decisions. Confirm business rules with the project team before production use.

A contract is a short written agreement: "this endpoint takes this, returns that."
It lets teammates build their parts at the same time without guessing each other's field names.

## 1. Conventions (already used by the blog module)

Success: `{ "success": true, "message"?: "...", "count"?: 2, "data": ... }`
Failure: `{ "success": false, "message": "...", "errors"?: ["..."] }`

| Status | Meaning |
|---|---|
| 200 / 201 | OK / created |
| 400 | Bad input (validation) |
| 404 | Not found |
| 409 | Duplicate (for example a coupon code that already exists) |

Admin routes require a valid JWT and the `admin` role in every environment.

## 2. Coupons (built)

| Method + path | Who | What |
|---|---|---|
| `GET /api/coupons` | public | Coupons usable right now (active, not expired, not used up) |
| `POST /api/coupons/validate` | public (checkout) | Check a code and get the discount |
| `GET /api/coupons/admin/all` | admin | All coupons, with usage numbers |
| `POST /api/coupons` | admin | Create |
| `PATCH /api/coupons/:id` | admin | Edit (also used to switch on/off with `{ "active": false }`) |
| `DELETE /api/coupons/:id` | admin | Delete |

Coupon fields: `code` (saved UPPERCASE, unique), `type` (`percent` | `fixed` | `shipping`), `value`,
`active`, `note`, `minOrderAmount`, `expiresAt` (date or null), `usageLimit` (number or null = unlimited),
`usedCount` (server only, cannot be sent).

`value`: percent = 1 to 100, fixed = taka amount, shipping = always 0.

**Checkout request** `POST /api/coupons/validate`
```json
{ "code": "GLOW20", "subtotal": 2000, "deliveryCharge": 60 }
```
**Success (200)**
```json
{ "success": true, "data": {
  "coupon": { "code": "GLOW20", "type": "percent", "value": 20, "note": "..." },
  "itemDiscount": 400, "deliveryDiscount": 0, "totalDiscount": 400 } }
```
**Not usable (400)**: `{ "success": false, "message": "This coupon has expired" }`

Discount rules: percent is rounded to a whole taka; a discount is never more than the subtotal;
a `shipping` coupon removes the delivery charge only.

### For Fayeza (checkout / orders)
1. Call `validateCouponForOrder({ code, subtotal, deliveryCharge })` from `modules/coupons/services/couponService.js`
   (or the endpoint above). Use the returned discount numbers. Do not trust totals from React.
2. After the order is saved successfully, call `redeemCoupon(code)` once. It adds 1 to `usedCount`
   in one atomic step and returns `null` if the coupon can no longer be used.
3. Save the coupon code and the discount amount on the order.

## 3. Banners (built)

| Method + path | Who | What |
|---|---|---|
| `GET /api/banners` | public | Homepage slides that are switched on |
| `GET /api/banners/admin/all` | admin | All slides |
| `POST /api/banners` | admin | Create |
| `PATCH /api/banners/:id` | admin | Edit / show / hide |
| `DELETE /api/banners/:id` | admin | Delete |

Banner fields: `title`, `subtitle`, `type` (`image` | `video`), `src` (**required**), `href` (default `/shop`),
`active` (default true), `order` (default 0, smaller shows first).

`src` is an HTTPS URL or uploaded app path such as `/uploads/<generated-name>.jpg`. Base64 images are rejected. The admin uploads image files to the backend; page headers use `placement: "pageHeader"` and a `pagePath`.

## 4. Reviews

Implemented endpoints:

| Method + path | Who | What |
|---|---|---|
| `GET /api/products/:productId/reviews` | public | Approved reviews + `{ average, count, distribution }` |
| `POST /api/products/:productId/reviews` | customer | Submit (starts as `pending`) |
| `GET /api/admin/reviews` | admin | All reviews, filter by status |
| `PATCH /api/admin/reviews/:id` | admin | `{ "status": "approved" | "rejected" | "pending" }` |
| `DELETE /api/admin/reviews/:id` | admin | Delete |

Review fields: `customer`, `customerName`, `product`, `rating` (1 to 5, whole number), `title` (optional),
`text` (10 to 1000 characters), `image` (optional URL/path), `status` (`pending` | `approved` | `rejected`).
One review per customer per product.

Status values are lowercase here. The React admin currently shows `Pending` / `Approved` / `Rejected`,
so it will map them when connected.

**Needs from others**
- Akhi: the `User` model name and the logged-in user (so `customer` and `customerName` come from the token, not from the request body).
- Fahmida: the `Product` model name, and a place to show `average` and `count` on product pages.
- Fayeza: a way to check "this customer has a **delivered** order that contains this product" (purchase-eligible reviews).

## 5. Reports

Implemented admin endpoints: `GET /api/admin/reports/sales` and `GET /api/admin/reports/products`.

Response shape (already produced by `buildSalesReport` in `utils/reportCalculator.js`):
```json
{ "summary": { "totalOrders": 4, "cancelledOrders": 1, "activeOrders": 3,
               "receivedRevenue": 5800, "receivedOrderCount": 2,
               "averageReceivedOrderValue": 2900, "pendingPaymentAmount": 1350 },
  "statusBreakdown": { "delivered": 2, "confirmed": 1, "cancelled": 1 },
  "salesByDate": [ { "date": "2026-10-20", "orders": 1, "revenue": 2700 } ],
  "salesByMonth": [ { "month": "2026-10", "orders": 4, "revenue": 9800 } ],
  "bestSellingProducts": [ { "product": "p1", "name": "...", "unitsSold": 3, "revenue": 3750 } ],
  "paymentMethods": [ { "method": "cod", "orders": 2, "totalAmount": 4450, "receivedAmount": 3100 } ],
  "receivedOrders": [ { "id": "...", "orderNumber": "...", "date": "2026-10-20", "month": "2026-10",
                       "customer": "...", "items": "...", "total": 2700,
                       "paymentMethod": "sslcommerz" } ] }
```

Sales rules (from the guide): cancelled orders are excluded; **unpaid COD is not received revenue**;
days are counted in Bangladesh time (Asia/Dhaka).

### Order fields used by reports
```
status:        "pending" | "confirmed" | "shipped" | "outForDelivery" | "delivered" | "cancelled"
paymentMethod: "cod" | "bkash" | ...
paymentStatus: "pending" | "unpaid" (legacy) | "paid" | "failed" | "cancelled" | "refunded"
total:         Number (taka, calculated by the backend)
createdAt:     Date
items:         [{ product, name, quantity, price }]   // name and price saved at purchase time
```
If the Order model uses different names or values, only the constants and field reads at the top of
`utils/reportCalculator.js` need to change.

Payment records live in the `payments` collection and reference an Order. Each record represents one
attempt; `(order, attemptNumber)`, `(order, idempotencyKey)`, internal transaction reference, and
optional gateway transaction ID are unique. Records store method, BDT amount, gateway, status, and
limited provider verification metadata. Never store card
numbers, CVVs, PINs, passwords, or wallet credentials. `status` on Order remains fulfillment state;
it is separate from `paymentStatus`.

### COD order API

`POST /api/orders` requires a customer JWT and an `Idempotency-Key` header (16–100 URL-safe
characters). Reuse the same key for retries of the same checkout; the server returns the original
order for a matching request and responds `409` if that key is reused with different checkout data.
The key is unique per customer. The body contains product IDs and quantities, delivery address,
`paymentMethod: "cod"`, and an optional coupon code. Do not send a total or discount: product prices,
stock availability, delivery charge, coupon validity/discount, and final amount are verified or
calculated by the backend.

Success is `201` with `{ "success": true, "data": <order> }`. A COD Order has one associated
Payment starting `pending`. An SSLCommerz Order remains `pending` until an attempt is initiated.
Order fulfillment can move through
`pending → confirmed → shipped → outForDelivery → delivered`; that progression never marks COD paid.
An unpaid COD order cancelled by an authorized admin becomes payment `cancelled`. A paid order cannot
be cancelled through the fulfillment endpoint.

`POST /api/delivery/assignments/:id/collect-cod` requires a delivery-partner JWT and the order must
be assigned to that partner, have method `cod`, and be `outForDelivery` or `delivered`. It is the
only current collection endpoint. It moves both Order `paymentStatus` and its Payment record from
`pending` (legacy Order `unpaid` is also supported) to `paid`. Repeating a successful confirmation
returns the already-paid order. Unassigned partners, other roles, and early collection attempts
are rejected.

### SSLCommerz sandbox API

`GET /api/payments/config` reports whether sandbox checkout is configured without returning secrets.
`POST /api/payments/sslcommerz/initiate` requires a customer JWT and `{ "orderId": "..." }`, plus an
`Idempotency-Key` header. It verifies order ownership and reads the payable amount from MongoDB.
Success is `201` with `{ "success": true, "data": { "paymentId", "transactionId", "redirectUrl" } }`;
the browser navigates to the SSLCommerz hosted page. A browser return is not payment confirmation.

SSLCommerz posts to `/api/payments/sslcommerz/success`, `/fail`, `/cancel`, and `/ipn`. The backend
queries SSLCommerz sandbox validation/transaction APIs and compares transaction ID, amount, and BDT
currency before changing a Payment. Only a validated, non-risk payment moves Payment and Order
payment status to `paid`; pending or risk-held results stay pending. Verified failure/cancel results
update the attempt and order payment state. Browser callbacks redirect to
`/payment-result?orderId=...`, where the signed-in customer can view the Order status.

## 6. Baseline assumptions to confirm
1. Order and payment status values are those in section 5. SSLCommerz integration is sandbox-only;
   this does not establish production credentials or live payment readiness.
2. Image uploads use local `backend/uploads` storage in development. Production should use persistent or hosted storage.
3. Delivery is free at ৳3000, ৳60 inside Chattogram, and ৳120 elsewhere. Confirm this business rule with the team.
