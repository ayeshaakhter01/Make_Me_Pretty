import { jsx, jsxs } from "react/jsx-runtime";
import { bdt } from "@/lib/format.js";
import { cx } from "@/lib/utils.js";
function PriceTag({ price, old, className, size = "md" }) {
  const priceSize = size === "lg" ? "text-2xl" : "text-base";
  const oldSize = size === "lg" ? "text-base" : "text-[13px]";
  return /* @__PURE__ */ jsxs("div", { className: cx("font-semibold", priceSize, className), children: [
    bdt(price),
    old && /* @__PURE__ */ jsx(
      "span",
      {
        className: cx(
          "ml-2 font-normal text-ink-soft line-through",
          oldSize
        ),
        children: bdt(old)
      }
    )
  ] });
}
export {
  PriceTag as default
};
