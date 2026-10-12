import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { bdt } from "@/lib/format.js";
import TrackingTimeline from "@/components/track/TrackingTimeline.js";
import Button from "@/components/ui/Button.js";
function TrackClient() {
  const [params] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [queryId, setQueryId] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const justPlaced = params.get("placed") === "1";
  const failed = params.get("failed") === "1";
  const fetchOrder = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/orders/${encodeURIComponent(id.trim())}`, {
        cache: "no-store"
      });
      const data = await res.json();
      setOrder(res.ok ? data.order : null);
      setNotFound(!res.ok);
    } catch {
      setOrder(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const id = params.get("id");
    if (id) fetchOrder(id);
  }, [params, fetchOrder]);
  const lookup = (e) => {
    e.preventDefault();
    fetchOrder(queryId);
  };
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[680px] px-5 py-12", children: [
    failed && /* @__PURE__ */ jsx("div", { className: "mb-6 rounded-2xl bg-lowstock-bg px-4 py-3 text-center text-sm text-lowstock-text", children: "Payment was cancelled or failed. Your order is saved as unpaid \u2014 you can retry from your account or contact support." }),
    order && justPlaced && /* @__PURE__ */ jsxs("div", { className: "mb-9 animate-pop text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto mb-4 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-pink text-3xl text-rose-deep", children: "\u2713" }),
      /* @__PURE__ */ jsx("h1", { className: "font-serif text-[34px] font-normal", children: "Order confirmed!" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-ink-soft", children: [
        "Thank you, ",
        order.name?.split(" ")[0],
        ". A confirmation SMS is on its way",
        order.phone ? ` to ${order.phone}` : "",
        "."
      ] })
    ] }),
    !order && /* @__PURE__ */ jsxs("div", { className: "mb-8 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-serif text-[34px] font-normal", children: "Track your order" }),
      /* @__PURE__ */ jsx("p", { className: "mb-5 mt-2 text-ink-soft", children: "Enter your order ID from the confirmation SMS." }),
      /* @__PURE__ */ jsxs("form", { onSubmit: lookup, className: "mx-auto flex max-w-md gap-2.5", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            value: queryId,
            onChange: (e) => setQueryId(e.target.value),
            placeholder: "e.g. AR-1042",
            "aria-label": "Order ID"
          }
        ),
        /* @__PURE__ */ jsx(Button, { type: "submit", size: "sm", disabled: loading, className: "whitespace-nowrap", children: loading ? "Finding\u2026" : "Track" })
      ] }),
      notFound && /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-lowstock-text", children: "No order found with that ID. Try AR-1042 or place a new order." })
    ] }),
    order && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-line bg-cream p-7", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-wrap justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.12em] text-ink-soft", children: "Order ID" }),
          /* @__PURE__ */ jsx("div", { className: "font-serif text-2xl", children: order.id })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.12em] text-ink-soft", children: "Total" }),
          /* @__PURE__ */ jsx("div", { className: "font-serif text-2xl", children: bdt(order.total) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(TrackingTimeline, { status: order.status, method: order.method }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex gap-3", children: [
        /* @__PURE__ */ jsx(Button, { href: "/shop", variant: "ghost", size: "sm", children: "Continue shopping" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => {
              setOrder(null);
              setQueryId("");
              setNotFound(false);
            },
            children: "Track another"
          }
        )
      ] })
    ] })
  ] });
}
export {
  TrackClient as default
};
