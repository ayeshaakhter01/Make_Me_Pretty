import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { bdt } from "@/lib/format.js";
function AnalyticsPanel({ orders = [] }) {
  const { days, weekTotal, maxTotal } = useMemo(() => {
    const buckets = [];
    const now = /* @__PURE__ */ new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      buckets.push({
        time: d.getTime(),
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        total: 0
      });
    }
    for (const o of orders) {
      if (o.pay !== "Paid" || !o.createdAt) continue;
      const c = new Date(o.createdAt);
      c.setHours(0, 0, 0, 0);
      const b = buckets.find((x) => x.time === c.getTime());
      if (b) b.total += o.total || 0;
    }
    const weekTotal2 = buckets.reduce((s, b) => s + b.total, 0);
    const maxTotal2 = Math.max(1, ...buckets.map((b) => b.total));
    return { days: buckets, weekTotal: weekTotal2, maxTotal: maxTotal2 };
  }, [orders]);
  const bestSellers = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const o of orders)
      for (const l of o.lines || [])
        map.set(l.name, (map.get(l.name) || 0) + l.qty);
    return [...map.entries()].map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 6);
  }, [orders]);
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-line bg-cream p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-5 flex items-baseline justify-between", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-serif text-lg", children: "Weekly revenue" }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-ink-soft", children: [
          bdt(weekTotal),
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-[11px]", children: "paid \xB7 last 7 days" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex h-40 items-end gap-2.5", children: days.map((d, i) => /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col items-center", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-full rounded-t-lg transition-all duration-700",
            style: {
              height: `${d.total / maxTotal * 100}%`,
              minHeight: d.total > 0 ? 6 : 2,
              background: i === days.length - 1 ? "var(--rose)" : "var(--pink)"
            },
            title: `${d.label}: ${bdt(d.total)}`
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "mt-1.5 text-[11px] text-ink-soft", children: d.label })
      ] }, i)) }),
      weekTotal === 0 && /* @__PURE__ */ jsx("p", { className: "mt-3 text-[12.5px] text-ink-soft", children: "No paid revenue in the last 7 days yet \u2014 paid orders will appear here." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-line bg-cream p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "mb-4 font-serif text-lg", children: "Best sellers" }),
      bestSellers.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-soft", children: "No sales yet \u2014 products will rank here as orders come in." }) : bestSellers.map((p, i) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex justify-between border-b border-line py-2.5 text-sm last:border-0",
          children: [
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsxs("span", { className: "mr-2.5 font-serif text-gold", children: [
                "0",
                i + 1
              ] }),
              p.name
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-ink-soft", children: [
              p.qty,
              " sold"
            ] })
          ]
        },
        p.name
      ))
    ] })
  ] });
}
export {
  AnalyticsPanel as default
};
