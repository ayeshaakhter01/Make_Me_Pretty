# Make Me Pretty — Frontend

React 19 + Tailwind CSS storefront and admin UI. **Frontend only, no tooling:** there is no
Node, npm, Vite, Express or build step. Every file in this folder is served exactly as it is.
It talks to a separate backend over HTTP — see [`API.md`](./API.md).

## Run (no backend needed)

`config.js` ships with `DEMO: true`: a fake API runs inside the browser with sample products,
so the whole site works with nothing but this folder. Serve it with any static file server
(ES modules need `http://`, not `file://`):

```bash
# in this folder, pick one:
python -m http.server 3000          # Python
npx serve .                         # Node, if you have it
# VS Code: "Live Server" extension → Open with Live Server
```

Then open http://localhost:3000

Demo details: admin panel at `http://localhost:3000/#/admin` (admin@makemepretty.com /
admin123), coupon code `GLOW20`, customers can register. Carts, accounts, orders and admin
product edits are saved in the browser's localStorage (reset with `localStorage.clear()`).
Not simulated: image/video uploads, PDF invoices, and editing banners/blogs/combos/coupons.

## Connect a real backend later

In `config.js` set `DEMO: false` and `API_URL` to your backend:

```js
window.MMP_CONFIG = { DEMO: false, API_URL: "http://localhost:4000" };   // "" = same origin
```

For a different origin the backend must send CORS headers with credentials
(`Access-Control-Allow-Origin: <this site>`, `Access-Control-Allow-Credentials: true`),
and the session cookie must be `SameSite=None; Secure` in production (or serve both from one
domain and proxy `/api/*`). See `API.md` for every endpoint.

URLs look like `/#/shop` (hash routing), so no server rewrite rules are needed.

## Folder layout

```
index.html            entry: import map, Tailwind, fonts
config.js             DEMO mode on/off + API base URL  ← edit this
tailwind-config.js    brand theme for the Tailwind CDN script
css/tailwind.css      pre-generated Tailwind + site CSS (works offline)
css/fonts.css, fonts/ self-hosted Fraunces + Jost
vendor/               React, React DOM, React Router, Swiper (local ES-module bundles)
src/
  main.js, App.js     entry + routes
  pages/              store/ admin/ Pay NotFound
  components/         UI
  context/            Auth, Cart, Settings, Toast
  lib/                api.js (only place that knows the API), demo-api.js (fake backend), hooks, catalog helpers
  data/               static UI data (categories, footer pages, districts…)
```

`src/` is plain ES modules (JSX already compiled to `jsx(...)` calls) so the browser runs it
directly. Edit these `.js` files in place.

## Tailwind

`css/tailwind.css` is pre-generated from the classes used in `src/`, so the site renders with
no network. `index.html` also loads the **Tailwind Play CDN** plus the theme in
`tailwind-config.js` and the site CSS source (the `<style type="text/tailwindcss">` block),
so any *new* Tailwind class you add in `src/` works immediately when online. Remove the two
CDN `<script>` tags if you want to rely only on the pre-generated file.

The Tailwind CDN is meant for development; for production, regenerate `css/tailwind.css`
once with the Tailwind CLI and drop the CDN scripts.
