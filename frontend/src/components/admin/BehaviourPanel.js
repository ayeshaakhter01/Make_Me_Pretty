import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useCallback, useEffect, useState } from "react";
import { bdt } from "@/lib/format.js";
import { cx } from "@/lib/utils.js";
function timeAgo(iso) {
  if (!iso) return "\u2014";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 6e4);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
function RankBar({ label, sub, value, max, unit }) {
  const pct = max > 0 ? Math.max(6, value / max * 100) : 0;
  return /* @__PURE__ */ jsxs("div", { className: "py-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-baseline justify-between gap-3 text-sm", children: [
      /* @__PURE__ */ jsx("span", { className: "truncate", children: label }),
      /* @__PURE__ */ jsxs("span", { className: "whitespace-nowrap text-ink-soft", children: [
        value,
        " ",
        unit
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-ivory-2", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "h-full rounded-full bg-gradient-to-r from-pink to-rose",
        style: { width: `${pct}%` }
      }
    ) }),
    sub && /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-[11px] text-ink-soft", children: sub })
  ] });
}
function SummaryBox({ active, onClick, label, value, accent, hint }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      className: cx(
        "rounded-card border-[1.5px] p-5 text-left transition-all",
        active ? "border-rose bg-pink-soft shadow-soft" : "border-line bg-cream hover:border-rose/50"
      ),
      children: [
        /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.1em] text-ink-soft", children: label }),
        /* @__PURE__ */ jsx("div", { className: "mt-1.5 font-serif text-[28px]", style: { color: accent }, children: value }),
        /* @__PURE__ */ jsx("div", { className: cx("mt-1 text-[12px]", active ? "text-rose" : "text-ink-soft"), children: hint })
      ]
    }
  );
}
function BehaviourPanel() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);
  const [view, setView] = useState("customers");
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [openCustomer, setOpenCustomer] = useState(null);
  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await apiFetch("/api/admin/behaviour", { cache: "no-store" });
      const d = await res.json();
      setData(d);
      setUpdatedAt(/* @__PURE__ */ new Date());
      setErr(false);
    } catch {
      setErr(true);
    } finally {
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    load();
    const t = setInterval(load, 15e3);
    return () => clearInterval(t);
  }, [load]);
  if (err && !data)
    return /* @__PURE__ */ jsx("div", { className: "rounded-card border border-line bg-cream p-6 text-sm text-ink-soft", children: "Couldn\u2019t load behaviour data." });
  if (!data) return /* @__PURE__ */ jsx("div", { className: "h-40 skel rounded-card" });
  const { summary, mostWishlisted, mostCarted, abandoned, customers } = data;
  const maxWish = mostWishlisted[0]?.count || 0;
  const maxCart = mostCarted[0]?.qty || 0;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[12.5px] text-ink-soft", children: updatedAt ? `Updated ${updatedAt.toLocaleTimeString()} \xB7 auto-refreshes every 15s` : "Loading\u2026" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: load,
          disabled: refreshing,
          className: "rounded-full border-[1.5px] border-line px-4 py-1.5 text-[13px] transition-colors hover:border-rose hover:text-rose disabled:opacity-60",
          children: refreshing ? "Refreshing\u2026" : "\u21BB Refresh"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsx(
        SummaryBox,
        {
          active: view === "customers",
          onClick: () => setView("customers"),
          label: "Signed-up customers",
          value: summary.customers,
          accent: "var(--ink)",
          hint: "View per-customer activity \u2192"
        }
      ),
      /* @__PURE__ */ jsx(
        SummaryBox,
        {
          active: view === "carts",
          onClick: () => setView("carts"),
          label: "Abandoned carts",
          value: summary.abandonedCarts,
          accent: "#B3543D",
          hint: "Carts + most added to cart \u2192"
        }
      ),
      /* @__PURE__ */ jsx(
        SummaryBox,
        {
          active: view === "wishlist",
          onClick: () => setView("wishlist"),
          label: "Total wishlist saves",
          value: summary.wishlistedItems,
          accent: "var(--gold)",
          hint: "Most wishlisted products \u2192"
        }
      )
    ] }),
    view === "customers" && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-line bg-cream p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "mb-1 font-serif text-lg", children: "Per-customer activity" }),
      /* @__PURE__ */ jsx("p", { className: "mb-4 text-[13px] text-ink-soft", children: "Orders placed, total spent, cart & wishlist, plus contact details and saved delivery addresses." }),
      customers.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-soft", children: "No customers have signed up yet." }) : /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-2xl border border-line", children: customers.map((c, i) => {
        const open = openCustomer === c.id;
        return /* @__PURE__ */ jsxs("div", { className: i > 0 ? "border-t border-line" : "", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setOpenCustomer(open ? null : c.id),
              className: cx(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                open ? "bg-pink-soft" : "bg-ivory hover:bg-pink-soft/50"
              ),
              children: [
                /* @__PURE__ */ jsx("span", { className: cx("text-rose transition-transform", open && "rotate-90"), children: "\u25B8" }),
                /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pink text-[13px] font-semibold uppercase text-rose-deep", children: c.name?.[0] || "?" }),
                /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "block truncate font-medium", children: c.name }),
                  /* @__PURE__ */ jsxs("span", { className: "block truncate text-[11px] text-ink-soft", children: [
                    "ID ",
                    c.id.slice(0, 8),
                    " \xB7 ",
                    c.email
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "whitespace-nowrap text-right text-[13px]", children: [
                  /* @__PURE__ */ jsxs("span", { className: "block font-semibold", children: [
                    c.orders.count,
                    " order",
                    c.orders.count === 1 ? "" : "s"
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "block text-[11px] text-ink-soft", children: bdt(c.orders.totalSpent) })
                ] })
              ]
            }
          ),
          open && /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5 bg-ivory px-4 pb-4 pt-1 text-[13px]", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-[11px] uppercase tracking-wide text-ink-soft", children: [
              "Customer ID: ",
              /* @__PURE__ */ jsx("span", { className: "font-mono normal-case", children: c.id })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-ink-soft", children: "\u{1F4E6} Ordered: " }),
              c.orders.products.length ? c.orders.products.map((p) => `${p.name} \xD7${p.qty}`).join(", ") : "nothing yet",
              c.orders.count > 0 && /* @__PURE__ */ jsxs("span", { className: "text-ink-soft", children: [
                " ",
                "\xB7 ",
                bdt(c.orders.totalSpent),
                " across ",
                c.orders.count,
                " order",
                c.orders.count === 1 ? "" : "s"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-ink-soft", children: "\u{1F6CD} Cart: " }),
              c.cart.items.length ? `${c.cart.items.map((it) => `${it.name} \xD7${it.qty}`).join(", ")} (${bdt(c.cart.total)})` : "empty"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-ink-soft", children: "\u2661 Wishlist: " }),
              c.wishlist.length ? c.wishlist.join(", ") : "empty"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 border-t border-line pt-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-ink-soft", children: "\u{1F4DE} Phone: " }),
                c.phone || "\u2014"
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-ink-soft", children: "\u{1F4E7} Email: " }),
                c.email
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-1.5 text-[11px] uppercase tracking-wide text-ink-soft", children: "\u{1F4CD} Saved addresses" }),
              c.addresses?.length ? /* @__PURE__ */ jsx("ul", { className: "mt-1 grid gap-1.5 sm:grid-cols-2", children: c.addresses.map((a, idx) => /* @__PURE__ */ jsxs(
                "li",
                {
                  className: cx(
                    "rounded-xl border bg-cream px-3 py-2",
                    a.isDefault ? "border-rose" : "border-line"
                  ),
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsx("span", { className: "rounded-full bg-pink-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose", children: a.label }),
                      a.isDefault && /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide text-ink-soft", children: "Default" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-1 text-ink", children: [
                      a.fullName,
                      " \xB7 ",
                      a.phone
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "text-ink-soft", children: a.line }),
                    a.landmark && /* @__PURE__ */ jsxs("div", { className: "text-ink-soft", children: [
                      "Landmark: ",
                      a.landmark
                    ] })
                  ]
                },
                idx
              )) }) : /* @__PURE__ */ jsx("div", { className: "text-ink-soft", children: "No saved addresses." })
            ] })
          ] })
        ] }, c.id);
      }) })
    ] }),
    view === "carts" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-line bg-cream p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-3 font-serif text-lg", children: "Most added to cart" }),
        mostCarted.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-soft", children: "No cart activity yet." }) : mostCarted.map((p) => /* @__PURE__ */ jsx(
          RankBar,
          {
            label: p.name,
            sub: `${p.carts} ${p.carts === 1 ? "cart" : "carts"}`,
            value: p.qty,
            max: maxCart,
            unit: p.qty === 1 ? "unit" : "units"
          },
          p.id
        ))
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-line bg-cream p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-1 font-serif text-lg", children: "Abandoned carts" }),
        /* @__PURE__ */ jsx("p", { className: "mb-4 text-[13px] text-ink-soft", children: "Customers with items sitting in their cart and no completed order." }),
        abandoned.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-soft", children: "No abandoned carts \u2014 nice." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[560px] border-collapse text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "text-left text-[11px] uppercase tracking-[0.08em] text-ink-soft", children: ["Customer", "Items", "Cart value", "Last active"].map((h) => /* @__PURE__ */ jsx("th", { className: "border-b border-line px-3 py-2.5 font-semibold", children: h }, h)) }) }),
          /* @__PURE__ */ jsx("tbody", { children: abandoned.map((a) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsxs("td", { className: "border-b border-line px-3 py-2.5", children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: a.name }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-ink-soft", children: a.email })
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "border-b border-line px-3 py-2.5", children: [
              a.units,
              " (",
              a.distinct,
              " product",
              a.distinct === 1 ? "" : "s",
              ")"
            ] }),
            /* @__PURE__ */ jsx("td", { className: "border-b border-line px-3 py-2.5 font-semibold", children: bdt(a.total) }),
            /* @__PURE__ */ jsx("td", { className: "border-b border-line px-3 py-2.5 text-ink-soft", children: timeAgo(a.updatedAt) })
          ] }, a.userId)) })
        ] }) })
      ] })
    ] }),
    view === "wishlist" && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-line bg-cream p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "mb-3 font-serif text-lg", children: "Most wishlisted products" }),
      mostWishlisted.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-soft", children: "No wishlist activity yet." }) : mostWishlisted.map((p) => /* @__PURE__ */ jsx(
        RankBar,
        {
          label: p.name,
          sub: p.type,
          value: p.count,
          max: maxWish,
          unit: p.count === 1 ? "save" : "saves"
        },
        p.id
      ))
    ] })
  ] });
}
export {
  BehaviourPanel as default
};
