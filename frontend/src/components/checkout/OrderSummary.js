import { jsx, jsxs } from "react/jsx-runtime";
import { bdt } from "@/lib/format.js";
function OrderSummary({
  cart,
  shipping,
  district,
  discount = 0,
  couponSlot,
  children
}) {
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = Math.max(0, sub - discount) + shipping;
  return /* @__PURE__ */ jsxs("div", { className: "sticky top-28 rounded-card border border-line bg-cream p-6", children: [
    /* @__PURE__ */ jsx("h3", { className: "mb-4 font-serif text-xl", children: "Order Summary" }),
    /* @__PURE__ */ jsx("div", { className: "max-h-64 overflow-y-auto", children: cart.map((i) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex justify-between py-1.5 text-sm text-ink-soft",
        children: [
          /* @__PURE__ */ jsxs("span", { className: "pr-2", children: [
            i.name,
            " \xD7 ",
            i.qty
          ] }),
          /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap text-ink", children: bdt(i.price * i.qty) })
        ]
      },
      i.id
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-3 flex justify-between border-t border-line pt-3 text-sm text-ink-soft", children: [
      /* @__PURE__ */ jsx("span", { children: "Subtotal" }),
      /* @__PURE__ */ jsx("span", { className: "text-ink", children: bdt(sub) })
    ] }),
    couponSlot,
    discount > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-2 flex justify-between text-sm text-rose", children: [
      /* @__PURE__ */ jsx("span", { children: "Discount" }),
      /* @__PURE__ */ jsxs("span", { children: [
        "\u2212",
        bdt(discount)
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-2 flex justify-between text-sm text-ink-soft", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "Delivery (",
        district === "Dhaka" ? "inside Dhaka" : "outside Dhaka",
        ")"
      ] }),
      /* @__PURE__ */ jsx("span", { children: shipping === 0 ? "Free \u2713" : bdt(shipping) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-3 flex justify-between border-t border-line pt-3 text-lg font-semibold", children: [
      /* @__PURE__ */ jsx("span", { children: "Total" }),
      /* @__PURE__ */ jsx("span", { children: bdt(total) })
    ] }),
    children,
    /* @__PURE__ */ jsx("div", { className: "mt-3 text-center text-xs text-ink-soft", children: "\u{1F512} Secured checkout \xB7 SSL encrypted" })
  ] });
}
export {
  OrderSummary as default
};
