import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCart } from "@/context/CartContext.js";
import { useSettings } from "@/context/SettingsContext.js";
import { bdt } from "@/lib/format.js";
function CartSummary() {
  const { subtotal } = useCart();
  const { freeDeliveryThreshold: threshold } = useSettings();
  const remaining = Math.max(threshold - subtotal, 0);
  const pct = Math.min(subtotal / threshold * 100, 100);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-1.5 flex justify-between text-sm text-ink-soft", children: [
      /* @__PURE__ */ jsx("span", { children: "Subtotal" }),
      /* @__PURE__ */ jsx("span", { className: "font-semibold text-ink", children: bdt(subtotal) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line/60", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "h-full rounded-full bg-gradient-to-r from-pink to-rose transition-all duration-500",
        style: { width: `${pct}%` }
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "text-[12.5px] text-ink-soft", children: remaining === 0 ? /* @__PURE__ */ jsx("span", { className: "text-gold", children: "\u2713 You\u2019ve unlocked free delivery" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      "Add ",
      bdt(remaining),
      " more for free delivery"
    ] }) })
  ] });
}
export {
  CartSummary as default
};
