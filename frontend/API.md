# API contract the frontend expects

All paths are under the API base (`API_URL` in `config.js`). JSON unless noted. Auth is an
httpOnly session cookie; the frontend always sends `credentials: "include"`.
Uploaded media paths (e.g. `/api/uploads/products/x.png`) are returned relative and
resolved against the API base by the frontend.

## Public (storefront)
| Method | Path | Response |
|---|---|---|
| GET | `/api/products` | `{ products: [...] }` |
| GET | `/api/combos` | `{ combos: [...] }` (members expanded, `originalTotal`, `inStock`) |
| GET | `/api/settings` | `{ settings: { freeDeliveryThreshold, branding, contentPages, footer, … } }` |
| GET | `/api/coupons` | `{ coupons: [...] }` active, announcement first |
| GET | `/api/footer` | `{ brandLogos, paymentLogos, social, help, policy }` |
| GET | `/api/blogs` | `{ blogs: [...] }` |
| GET | `/api/reviews` | `{ reviews: [...] }` approved only |
| POST | `/api/reviews` | multipart `name, text, media?` |
| GET | `/api/orders/:id` | `{ order }` (404 `{error}` if unknown) |
| POST | `/api/orders` | `{ customer, items:[{id,qty}], method, couponCode }` → `{ order, requiresRedirect, redirectUrl }` |
| POST | `/api/coupons/validate` | coupon check at checkout |
| GET | `/api/payments/callback?orderId=&status=success\|failed` | browser redirect; backend marks paid, then redirects to the frontend (see below) |

### New read-only routes (the old Next app read the database directly in these pages)
| Method | Path | Response |
|---|---|---|
| GET | `/api/hero-slides` | `{ slides: [{id,media,mediaType,title,subtitle,isOffer,href}] }` active only |
| GET | `/api/page-banners?page=Skincare` | `{ banners: [...] }` active for that page |
| GET | `/api/inline-media?page=Skincare` | `{ media: [...] }` active for that page |
| GET | `/api/about` | `{ people: [...] }` active only |

## Auth & account (cookie session)
`POST /api/auth/login|register|logout`, `GET /api/auth/me` → `{ user|null }`,
`GET|PUT /api/cart`, `GET|PUT /api/wishlist`,
`GET|POST /api/account/addresses`, `PATCH|DELETE /api/account/addresses/:id`,
`PUT /api/account/profile`, `GET /api/orders` (own order history).

## Admin (role = admin, enforce server-side)
`/api/admin/` + `products` (+`/:id`, `/:id/media`), `orders` (+`/:id`, `/:id/invoice[?download=1]` PDF),
`coupons` (+`/:id`, `/:id/image`), `settings`, `branding`, `footer`, `behaviour`,
`hero-slides`, `page-banners`, `inline-media`, `brand-logos`, `payment-logos`, `about`,
`content-pages` (+`/:slug`), `blogs`, `combos`, `reviews` — each with the usual
GET list / POST create / PATCH or PUT update / DELETE on `/:id`.
Request/response shapes are unchanged from the original Next.js route handlers in `app/api/**`.

## Hash URLs: links the backend must build
The site uses hash routing (works on any static host), so frontend links need a `/#`:

- payment callback redirect → `${FRONTEND_URL}/#/track?id=ORDER&placed=1` (or `&failed=1`)
- simulated-gateway `redirectUrl` from `POST /api/orders` → `${FRONTEND_URL}/#/pay/ORDER`

Use a `FRONTEND_URL` env var in the backend instead of `NEXT_PUBLIC_BASE_URL`.

## What changed from the Next.js version
- Next routing / `next/link` / `next/navigation` → React Router (hash URLs; a `Link` wrapper keeps `href`).
- Server components that read the database now fetch from the API.
- `middleware.js` admin gate → client-side `AdminGuard` (the backend must still enforce admin on `/api/admin/*`).
- `next/font` → self-hosted fonts in `css/fonts/`. Page titles via `useTitle`.
- Removed: `app/api`, `lib/server`, `.data`, bcryptjs, jose, pdfkit, sharp, next.
