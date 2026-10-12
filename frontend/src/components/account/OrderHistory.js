import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useEffect, useState } from "react";
import Link from "@/components/ui/Link.js";
import { ORDER_STATUSES } from "@/lib/utils.js";
import { bdt } from "@/lib/format.js";
import Badge from "@/components/ui/Badge.js";
import EmptyState from "@/components/ui/EmptyState.js";
import Button from "@/components/ui/Button.js";
function OrderHistory() {
  const [orders, setOrders] = useState(null);
  useEffect(() => {
    let active = true;
    apiFetch("/api/orders", { cache: "no-store" }).then((r) => r.json()).then((d) => active && setOrders(d.orders || [])).catch(() => active && setOrders([]));
    return () => {
      active = false;
    };
  }, []);
  if (orders === null) {
    return /* @__PURE__ */ jsx("div", { className: "h-24 skel rounded-card" });
  }
  if (orders.length === 0) {
    return /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: "\u{1F4E6}",
        title: "No orders yet",
        message: "When you place an order, it\u2019ll appear here so you can track it anytime.",
        children: /* @__PURE__ */ jsx(Button, { href: "/shop", size: "sm", children: "Start shopping" })
      }
    );
  }
  return /* @__PURE__ */ jsx("div", { className: "space-y-4", children: orders.map((o) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-cream p-5",
      children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-serif text-lg", children: o.id }),
          /* @__PURE__ */ jsxs("div", { className: "text-[13px] text-ink-soft", children: [
            o.date,
            " \xB7 ",
            o.items,
            " item",
            o.items === 1 ? "" : "s",
            " \xB7 ",
            o.method
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("div", { className: "font-semibold", children: bdt(o.total) }),
            /* @__PURE__ */ jsx(Badge, { tone: o.pay === "Paid" ? "paid" : "pink", children: o.pay })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-wide text-ink-soft", children: "Status" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm", children: ORDER_STATUSES[o.status] })
          ] }),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: `/track?id=${o.id}`,
              className: "rounded-full border-[1.5px] border-line px-4 py-2 text-[13px] transition-colors hover:border-rose hover:text-rose",
              children: "Track"
            }
          )
        ] })
      ]
    },
    o.id
  )) });
}
export {
  OrderHistory as default
};
