import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch, apiUrl } from "@/lib/api.js";
import { useMemo, useState } from "react";
import { ORDER_STATUSES } from "@/lib/utils.js";
import { bdt } from "@/lib/format.js";
import Badge from "@/components/ui/Badge.js";
import { cx } from "@/lib/utils.js";
function OrdersTable({ orders, setOrders }) {
  const [stage, setStage] = useState("all");
  const changeStatus = (id, status) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    apiFetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    }).catch(() => {
    });
  };
  const advance = (o) => {
    if (o.status < ORDER_STATUSES.length - 1) changeStatus(o.id, o.status + 1);
  };
  const counts = useMemo(() => {
    const c = ORDER_STATUSES.map(() => 0);
    for (const o of orders) c[o.status] = (c[o.status] || 0) + 1;
    return c;
  }, [orders]);
  const visible = stage === "all" ? orders : orders.filter((o) => o.status === stage);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsx(
        StageTab,
        {
          active: stage === "all",
          onClick: () => setStage("all"),
          label: "All orders",
          count: orders.length
        }
      ),
      ORDER_STATUSES.map((s, i) => /* @__PURE__ */ jsx(
        StageTab,
        {
          active: stage === i,
          onClick: () => setStage(i),
          label: s,
          count: counts[i]
        },
        s
      ))
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-card border border-line bg-cream", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[820px] border-collapse text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "text-left text-[11px] uppercase tracking-[0.08em] text-ink-soft", children: ["Order", "Customer", "Items", "Total", "Payment", "Stage", "Advance", "Invoice"].map(
        (h) => /* @__PURE__ */ jsx("th", { className: "border-b border-line px-4 py-3.5 font-semibold", children: h }, h)
      ) }) }),
      /* @__PURE__ */ jsx("tbody", { children: visible.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "px-4 py-10 text-center text-ink-soft", children: "No orders in this stage." }) }) : visible.map((o) => {
        const isLast = o.status >= ORDER_STATUSES.length - 1;
        return /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsxs("td", { className: "border-b border-line px-4 py-3", children: [
            /* @__PURE__ */ jsx("div", { className: "font-semibold", children: o.id }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-ink-soft", children: o.date })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "border-b border-line px-4 py-3", children: o.name }),
          /* @__PURE__ */ jsx("td", { className: "border-b border-line px-4 py-3 text-ink-soft", children: o.items }),
          /* @__PURE__ */ jsx("td", { className: "border-b border-line px-4 py-3", children: bdt(o.total) }),
          /* @__PURE__ */ jsxs("td", { className: "border-b border-line px-4 py-3", children: [
            /* @__PURE__ */ jsx(Badge, { tone: o.pay === "Paid" ? "paid" : "pink", children: o.pay }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-ink-soft", children: o.method })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "border-b border-line px-4 py-3", children: /* @__PURE__ */ jsx(
            "select",
            {
              value: o.status,
              onChange: (e) => changeStatus(o.id, Number(e.target.value)),
              className: "!w-auto !py-2 text-[13px]",
              children: ORDER_STATUSES.map((s, i) => /* @__PURE__ */ jsx("option", { value: i, children: s }, s))
            }
          ) }),
          /* @__PURE__ */ jsx("td", { className: "border-b border-line px-4 py-3", children: isLast ? /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap text-xs text-gold", children: "\u2713 Delivered" }) : /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => advance(o),
              className: "whitespace-nowrap rounded-full bg-rose px-3.5 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-rose-deep",
              children: [
                "\u2192 ",
                ORDER_STATUSES[o.status + 1]
              ]
            }
          ) }),
          /* @__PURE__ */ jsx("td", { className: "border-b border-line px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 whitespace-nowrap", children: [
            /* @__PURE__ */ jsx(
              "a",
              {
                href: apiUrl(`/api/admin/orders/${o.id}/invoice`),
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-xs text-ink-soft underline hover:text-rose",
                children: "View \u2197"
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: apiUrl(`/api/admin/orders/${o.id}/invoice?download=1`),
                className: "text-xs text-ink-soft underline hover:text-rose",
                children: "PDF \u2193"
              }
            )
          ] }) })
        ] }, o.id);
      }) })
    ] }) })
  ] });
}
function StageTab({ active, onClick, label, count }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      className: cx(
        "flex items-center gap-2 rounded-full border-[1.5px] px-4 py-2 text-[13px] transition-all",
        active ? "border-ink bg-ink text-ivory" : "border-line bg-cream text-ink-soft hover:border-rose hover:text-rose"
      ),
      children: [
        label,
        /* @__PURE__ */ jsx(
          "span",
          {
            className: cx(
              "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
              active ? "bg-ivory/25 text-ivory" : "bg-pink text-rose-deep"
            ),
            children: count
          }
        )
      ]
    }
  );
}
export {
  OrdersTable as default
};
