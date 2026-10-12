import { jsx, jsxs } from "react/jsx-runtime";
import { useParams } from "react-router-dom";
import { apiUrl } from "@/lib/api.js";
import { useApi } from "@/lib/hooks.js";
import { bdt } from "@/lib/format.js";
import { useTitle } from "@/lib/useTitle.js";
import NotFound from "@/pages/NotFound.js";
function PayPage() {
  const { id } = useParams();
  useTitle("Secure Payment");
  const { data: order, loading, error } = useApi(
    `/api/orders/${encodeURIComponent(id)}`,
    (d) => d.order || null,
    null
  );
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-ivory-2 px-5", children: /* @__PURE__ */ jsx("div", { className: "h-72 w-full max-w-sm skel rounded-3xl" }) });
  }
  if (error || !order) return /* @__PURE__ */ jsx(NotFound, {});
  const approve = apiUrl(`/api/payments/callback?orderId=${order.id}&status=success`);
  const cancel = apiUrl(`/api/payments/callback?orderId=${order.id}&status=failed`);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-ivory-2 px-5", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm overflow-hidden rounded-3xl border border-line bg-cream shadow-menu", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-ink px-6 py-4 text-center text-ivory", children: [
      /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.2em] text-ivory/70", children: "Secure Payment \xB7 Demo Gateway" }),
      /* @__PURE__ */ jsx("div", { className: "mt-1 font-serif text-lg", children: order.method })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-pink-soft p-4 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.14em] text-ink-soft", children: "Amount payable" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 font-serif text-3xl text-rose-deep", children: bdt(order.total) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-ink-soft", children: [
          "Order ",
          order.id
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-4 text-center text-[12.5px] leading-relaxed text-ink-soft", children: [
        "This is a simulated gateway (no real charge). With the backend in live payment mode, customers are redirected to ",
        order.method,
        "\u2019s real hosted checkout instead."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-5 grid gap-2.5", children: [
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: approve,
            className: "rounded-full bg-rose py-3.5 text-center text-sm font-medium text-white transition-colors hover:bg-rose-deep",
            children: [
              "Approve & Pay ",
              bdt(order.total)
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: cancel,
            className: "rounded-full border-[1.5px] border-line py-3 text-center text-[13px] text-ink-soft transition-colors hover:border-lowstock-text hover:text-lowstock-text",
            children: "Cancel payment"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 text-center text-[11px] text-ink-soft", children: [
        "\u{1F512} ",
        order.pay === "Paid" ? "Already paid" : "Awaiting confirmation"
      ] })
    ] })
  ] }) });
}
export {
  PayPage as default
};
