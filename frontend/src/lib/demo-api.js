/* =============================================================================
   DEMO BACKEND — runs entirely in the browser (no server needed).

   Enabled by `DEMO: true` in /config.js. apiFetch() hands every /api/* request
   to demoFetch(), which answers like the real backend would, using seed data
   and localStorage for anything the visitor changes (account, cart, orders,
   admin product edits). Reset everything with  localStorage.clear().

   Demo logins:   admin@makemepretty.com / admin123   (admin panel at #/admin)
                  or just register a new customer account.
   Demo coupon:   GLOW20  (20% off)
   Not simulated: image/video uploads, banner/blog/combo/coupon editing in admin.
============================================================================= */

import { PRODUCTS } from "@/data/products.js";
import { SEED_ORDERS } from "@/data/orders.js";
import { DEFAULT_BRANDS } from "@/data/brands.js";
import { REVIEWS } from "@/data/reviews.js";
import { HELP_PAGES, POLICY_PAGES } from "@/data/footer.js";

const KEY = "mmp_demo_db_v1";
const SESSION = "mmp_demo_session";
const FREE_DELIVERY = 2000;

const COUPON = { id: "k1", kind: "coupon", code: "GLOW20", title: "Glow 20", text: "20% off your order with code GLOW20", type: "percent", value: 20, featured: true, image: "", active: true };
const ANNOUNCEMENT = { id: "a1", kind: "announcement", code: "", title: "", text: "FREE DELIVERY ON ORDERS OVER ৳2,000 · NATIONWIDE", type: "shipping", value: 0, image: "", featured: false, active: true };

const COMBOS = [
  { id: "c1", name: "Daily Glow Ritual", description: "Cleanse, treat and moisturise — the essentials in one set.", price: 2800, productIds: ["1", "3", "2"] },
  { id: "c2", name: "Night Repair Duo", description: "Wake up to plush, rested skin.", price: 2400, productIds: ["5", "6"] },
];

const BLOGS = [
  { id: "bl1", title: "Building a humid-weather skincare routine", excerpt: "Lightweight layers that keep skin balanced through monsoon.", body: "Start with a gentle gel cleanser, add a niacinamide serum, and seal with a light moisturiser. Finish every morning with SPF.", media: "", mediaType: "image" },
  { id: "bl2", title: "Why your barrier matters", excerpt: "Ceramides, squalane and the case for doing less.", body: "A healthy barrier keeps moisture in and irritants out. Use fewer, kinder products and give your skin time to adapt.", media: "", mediaType: "image" },
];

const POLICY_BODY = {
  "refund-return": "Unopened products can be returned within 7 days of delivery for a full refund.",
  privacy: "We only collect the details needed to deliver your order and never sell your data.",
  delivery: "Delivery takes 1–2 days inside Dhaka and 2–4 days nationwide.",
  terms: "By placing an order you agree to our terms of sale. (Demo text.)",
  contact: "Reach us at hello@makemepretty.example · 01XXXXXXXXX (demo).",
};

/* ------------------------------------------------------------ persistence */
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    products: PRODUCTS.map((p) => ({ ...p })),
    users: [{ id: "u-admin", name: "Admin", email: "admin@makemepretty.com", password: "admin123", phone: "", role: "admin" }],
    orders: SEED_ORDERS.map((o) => ({ ...o, userId: null })),
    carts: {}, wishlists: {}, addresses: {}, seq: 1100,
  };
}
let db = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
const err = (error, status = 400) => json({ error }, status);
const uid = () => "id" + Math.random().toString(36).slice(2, 10);
const sessionUser = () => db.users.find((u) => u.id === localStorage.getItem(SESSION)) || null;
const pub = (u) => u && { id: u.id, name: u.name, email: u.email, phone: u.phone || "", role: u.role };
const todayLabel = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

const expandCombo = (c) => {
  const members = c.productIds.map((id) => db.products.find((p) => String(p.id) === String(id))).filter(Boolean)
    .map((p) => ({ id: p.id, name: p.name, price: p.price, shape: p.shape, c1: p.c1, c2: p.c2, stock: p.stock, media: p.media || [] }));
  return { id: c.id, name: c.name, description: c.description, price: c.price, products: members,
    originalTotal: members.reduce((s, p) => s + p.price, 0), inStock: members.every((p) => p.stock > 0) };
};

const emptyAdmin = { slides: [], banners: [], media: [], people: [], logos: [], blogs: [], combos: [], coupons: [], reviews: [], pages: [], social: {}, settings: {}, branding: {} };

/* ------------------------------------------------------------------ router */
export async function demoFetch(path, opts = {}) {
  await new Promise((r) => setTimeout(r, 120)); // feel like a network
  const method = (opts.method || "GET").toUpperCase();
  const url = new URL(path, "http://demo.local");
  const p = url.pathname.replace(/\/+$/, "");
  const body = typeof opts.body === "string" ? JSON.parse(opts.body || "{}") : {};
  const me = sessionUser();
  const seg = p.split("/").filter(Boolean); // ["api", ...]
  const is = (m, route) => method === m && p === route;

  /* ---------------- public catalog / content ---------------- */
  if (is("GET", "/api/products")) return json({ products: db.products });
  if (is("GET", "/api/combos")) return json({ combos: COMBOS.map(expandCombo).filter((c) => c.products.length) });
  if (is("GET", "/api/settings"))
    return json({ settings: { freeDeliveryThreshold: FREE_DELIVERY,
      branding: { name: "Make Me Pretty", tagline: "we wanna make you pretty", logo: "", story: "" },
      contentPages: Object.fromEntries(Object.entries(POLICY_BODY).map(([k, v]) => [k, { body: v }])),
      footer: { social: {} } } });
  if (is("GET", "/api/coupons")) return json({ coupons: [ANNOUNCEMENT, COUPON] });
  if (is("POST", "/api/coupons/validate")) {
    const code = String(body.code || "").trim().toUpperCase();
    return code === COUPON.code ? json({ coupon: { code: COUPON.code, type: COUPON.type, value: COUPON.value, title: COUPON.title } }) : err("That coupon code isn’t valid.", 404);
  }
  if (is("GET", "/api/footer"))
    return json({ brandLogos: DEFAULT_BRANDS.map((b, i) => ({ id: "br" + i, brand: b.brand, description: b.description, logo: "", mediaType: "image" })),
      paymentLogos: [], social: {}, help: HELP_PAGES.map(({ slug, label }) => ({ slug, label })), policy: POLICY_PAGES.map(({ slug, label }) => ({ slug, label })) });
  if (is("GET", "/api/hero-slides")) return json({ slides: [] });
  if (is("GET", "/api/page-banners")) return json({ banners: [] });
  if (is("GET", "/api/inline-media")) return json({ media: [] });
  if (is("GET", "/api/about")) return json({ people: [] });
  if (is("GET", "/api/blogs")) return json({ blogs: BLOGS });
  if (is("GET", "/api/reviews")) return json({ reviews: REVIEWS.map((r) => ({ id: r.id, name: r.name, text: r.text, rating: r.rating, location: r.location, product: r.product, media: "", mediaType: "image" })) });
  if (is("POST", "/api/reviews")) return json({ ok: true, id: uid() });

  /* ---------------- auth ---------------- */
  if (is("GET", "/api/auth/me")) return json({ user: pub(me) });
  if (is("POST", "/api/auth/login")) {
    const u = db.users.find((x) => x.email.toLowerCase() === String(body.email || "").toLowerCase() && x.password === body.password);
    if (!u) return err("Incorrect email or password.", 401);
    localStorage.setItem(SESSION, u.id);
    return json({ user: pub(u) });
  }
  if (is("POST", "/api/auth/register")) {
    const email = String(body.email || "").trim().toLowerCase();
    if (!email || !body.password || !body.name) return err("Please fill in all fields.");
    if (db.users.some((x) => x.email.toLowerCase() === email)) return err("An account with this email already exists.", 409);
    const u = { id: uid(), name: body.name, email, password: body.password, phone: body.phone || "", role: "customer" };
    db.users.push(u); save();
    localStorage.setItem(SESSION, u.id);
    return json({ user: pub(u) });
  }
  if (is("POST", "/api/auth/logout")) { localStorage.removeItem(SESSION); return json({ ok: true }); }

  /* ---------------- customer: cart, wishlist, account ---------------- */
  if (p === "/api/cart" || p === "/api/wishlist") {
    if (!me) return err("Sign in required.", 401);
    const store = p === "/api/cart" ? db.carts : db.wishlists;
    const field = p === "/api/cart" ? "items" : "productIds";
    if (method === "PUT") { store[me.id] = body[field] || []; save(); return json({ ok: true }); }
    return json({ [field]: store[me.id] || [] });
  }
  if (p === "/api/account/profile" && method === "PUT") {
    if (!me) return err("Sign in required.", 401);
    Object.assign(me, { name: body.name ?? me.name, phone: body.phone ?? me.phone }); save();
    return json({ user: pub(me) });
  }
  if (p === "/api/account/addresses" || seg[0] === "api" && seg[1] === "account" && seg[2] === "addresses") {
    if (!me) return err("Sign in required.", 401);
    const list = (db.addresses[me.id] ||= []);
    const id = seg[3];
    if (!id && method === "GET") return json({ addresses: list });
    if (!id && method === "POST") { const a = { ...body, id: uid() }; if (body.isDefault || !list.length) list.forEach((x) => (x.isDefault = false)), (a.isDefault = true); list.push(a); save(); return json({ addresses: list }); }
    const i = list.findIndex((a) => a.id === id);
    if (i < 0) return err("Address not found.", 404);
    if (method === "DELETE") { list.splice(i, 1); save(); return json({ addresses: list }); }
    if (method === "PATCH") { if (body.isDefault) list.forEach((x) => (x.isDefault = false)); Object.assign(list[i], body); save(); return json({ addresses: list }); }
  }

  /* ---------------- orders ---------------- */
  if (is("POST", "/api/orders")) {
    const items = (body.items || []).map((it) => {
      const pr = db.products.find((x) => String(x.id) === String(it.id));
      return pr && { id: pr.id, name: pr.name, qty: Math.max(1, Number(it.qty) || 1), price: pr.price };
    }).filter(Boolean);
    if (!items.length) return err("Your bag is empty.");
    const c = body.customer || {};
    if (!c.name || !c.phone) return err("Please add your name and phone number.");
    const subtotal = items.reduce((s, l) => s + l.price * l.qty, 0);
    const coupon = String(body.couponCode || "").toUpperCase() === COUPON.code ? COUPON : null;
    const discount = coupon ? Math.round((subtotal * coupon.value) / 100) : 0;
    const delivery = subtotal - discount >= FREE_DELIVERY ? 0 : String(c.district).toLowerCase() === "dhaka" ? 70 : 120;
    const method = { bkash: "bKash", nagad: "Nagad", card: "Card", cod: "COD" }[body.method] || "COD";
    db.seq += 1;
    const order = { id: "MMP-" + db.seq, name: c.name, phone: c.phone, email: c.email || "", address: [c.address, c.thana, c.district].filter(Boolean).join(", "),
      total: subtotal - discount + delivery, subtotal, discount, delivery, method, pay: method === "COD" ? "Pending" : "Paid", status: 0,
      items: items.reduce((s, l) => s + l.qty, 0), lines: items, date: todayLabel(), userId: me?.id || null };
    db.orders.unshift(order);
    items.forEach((l) => { const pr = db.products.find((x) => String(x.id) === String(l.id)); if (pr) pr.stock = Math.max(0, pr.stock - l.qty); });
    if (me) db.carts[me.id] = [];
    save();
    return json({ order: { id: order.id }, requiresRedirect: false });
  }
  if (is("GET", "/api/orders")) {
    if (!me) return err("Sign in required.", 401);
    return json({ orders: db.orders.filter((o) => o.userId === me.id) });
  }
  if (seg[1] === "orders" && seg[2] && seg.length === 3 && method === "GET") {
    const o = db.orders.find((x) => x.id.toLowerCase() === decodeURIComponent(seg[2]).toLowerCase());
    return o ? json({ order: o }) : err("Order not found.", 404);
  }

  /* ---------------- admin ---------------- */
  if (seg[1] === "admin") {
    if (!me || me.role !== "admin") return err("Forbidden", 403);
    if (seg[2] === "products") {
      const id = seg[3];
      if (!id && method === "GET") return json({ products: db.products });
      if (!id && method === "POST") {
        const np = { rating: 0, reviews: 0, badge: null, shape: "jar", c1: "#F6DEE3", c2: "#DBA8B1", skin: "All skin types", desc: "", ing: [], media: [], ...body, id: String(Date.now()) };
        db.products.push(np); save(); return json({ product: np });
      }
      const i = db.products.findIndex((x) => String(x.id) === String(id));
      if (i < 0) return err("Product not found.", 404);
      if (seg[4] === "media") return json({ product: db.products[i] });
      if (method === "DELETE") { db.products.splice(i, 1); save(); return json({ ok: true }); }
      if (method === "PATCH") { Object.assign(db.products[i], body); save(); return json({ product: db.products[i] }); }
    }
    if (seg[2] === "orders") {
      if (!seg[3] && method === "GET") return json({ orders: db.orders });
      const o = db.orders.find((x) => x.id === seg[3]);
      if (!o) return err("Order not found.", 404);
      if (seg[4] === "invoice") return new Response("Invoices need the real backend.", { status: 501 });
      if (method === "PATCH") { if (body.status !== undefined) o.status = Number(body.status); if (body.pay) o.pay = body.pay; save(); return json({ order: o }); }
    }
    if (is("GET", "/api/admin/behaviour")) return json({ mostWishlisted: [], mostInCart: [], abandoned: [], customers: [] });
    if (is("GET", "/api/admin/settings")) return json({ settings: { freeDeliveryThreshold: FREE_DELIVERY, announcement: ANNOUNCEMENT.text } });
    return method === "GET" ? json(emptyAdmin) : json({ ok: true, demo: true });
  }

  if (p === "/api/payments/callback") return json({ ok: true });
  return err("Not available in demo mode: " + method + " " + p, 404);
}
