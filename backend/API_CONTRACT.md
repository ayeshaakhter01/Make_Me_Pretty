# API Contract: Coupons, Banners, Reviews, Reports

Owner: Ayesha. Status: **DRAFT**. Please read and reply before building anything that depends on it.

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

Admin routes are currently open in development only (`NODE_ENV !== "production"`), the same as the blog routes.
They will get Akhi's auth + admin role middleware once it is ready.

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
1. Call `validateCouponForOrder({ code, subtotal, deliveryCharge })` from `services/couponService.js`
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

`src` is a URL or a path (`/media/hero/offers.png` or `https://...`). Base64 images are rejected.
**Team decision needed:** the React admin currently turns uploaded pictures into base64 text.
We need one image-storage approach (for example a hosted URL) before connecting that screen.

## 4. Reviews (model + validators built; routes come next)

Proposed endpoints (not built yet):

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

## 5. Reports (calculation logic built; endpoints come after Orders exist)

Proposed endpoints: `GET /api/admin/reports/sales` and `GET /api/admin/reports/products`.

Response shape (already produced by `buildSalesReport` in `utils/reportCalculator.js`):
```json
{ "summary": { "totalOrders": 4, "cancelledOrders": 1, "activeOrders": 3,
               "receivedRevenue": 5800, "pendingPaymentAmount": 1350 },
  "statusBreakdown": { "delivered": 2, "confirmed": 1, "cancelled": 1 },
  "salesByDate": [ { "date": "2026-10-20", "orders": 1, "revenue": 2700 } ],
  "bestSellingProducts": [ { "product": "p1", "name": "...", "unitsSold": 3, "revenue": 3750 } ],
  "paymentMethods": [ { "method": "cod", "orders": 2, "totalAmount": 4450, "receivedAmount": 3100 } ] }
```

Sales rules (from the guide): cancelled orders are excluded; **unpaid COD is not received revenue**;
days are counted in Bangladesh time (Asia/Dhaka).

### Order fields the reports need (PLEASE CONFIRM with Fayeza)
```
status:        "pending" | "confirmed" | "shipped" | "outForDelivery" | "delivered" | "cancelled"
paymentMethod: "cod" | "bkash" | ...
paymentStatus: "unpaid" | "paid" | ...
total:         Number (taka, calculated by the backend)
createdAt:     Date
items:         [{ product, name, quantity, price }]   // name and price saved at purchase time
```
If the Order model uses different names or values, only the constants and field reads at the top of
`utils/reportCalculator.js` need to change.

## 6. Questions to settle as a team
1. Order status and payment status values (section 5).
2. Image storage for banners and review photos (section 3).
3. Does the free-delivery rule stay at "free at ৳3000, ৳60 inside Chattogram, ৳120 outside" (as in the React checkout now)?
   Fayeza owns this calculation; coupons only receive the `deliveryCharge`.
