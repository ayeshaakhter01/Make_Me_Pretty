import { jsx, jsxs } from "react/jsx-runtime";
import { cx } from "@/lib/utils.js";
const TONES = {
  gold: "bg-gold-soft text-[#8A6A2F]",
  pink: "bg-pink text-rose-deep",
  low: "bg-lowstock-bg text-lowstock-text",
  neutral: "bg-ivory-2 text-ink-soft",
  paid: "bg-gold-soft text-[#8A6A2F]"
};
function Badge({ tone = "neutral", className, children }) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: cx(
        "inline-block rounded-full px-3 py-[5px] text-[10.5px] font-semibold uppercase tracking-[0.14em]",
        TONES[tone],
        className
      ),
      children
    }
  );
}
function ProductBadge({ badge, stock, lowStockThreshold = 5 }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
    badge && /* @__PURE__ */ jsx(Badge, { tone: badge === "New" ? "pink" : "gold", children: badge }),
    stock <= lowStockThreshold && /* @__PURE__ */ jsx(Badge, { tone: "low", children: "Low stock" })
  ] });
}
export {
  ProductBadge,
  Badge as default
};
