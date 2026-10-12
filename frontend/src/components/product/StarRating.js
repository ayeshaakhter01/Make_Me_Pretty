import { jsx, jsxs } from "react/jsx-runtime";
import { roundRating } from "@/lib/format.js";
import { cx } from "@/lib/utils.js";
function StarRating({ value = 0, className }) {
  const full = roundRating(value);
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: cx("tracking-[2px] text-[13px] leading-none", className),
      "aria-label": `${value} out of 5 stars`,
      children: [
        /* @__PURE__ */ jsx("span", { className: "text-gold", children: "\u2605".repeat(full) }),
        /* @__PURE__ */ jsx("span", { className: "text-line", children: "\u2605".repeat(5 - full) })
      ]
    }
  );
}
export {
  StarRating as default
};
