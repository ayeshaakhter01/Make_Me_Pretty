import { jsx, jsxs } from "react/jsx-runtime";
import { cx } from "@/lib/utils.js";
function Skeleton({ className }) {
  return /* @__PURE__ */ jsx("div", { className: cx("skel rounded-xl", className) });
}
function ProductCardSkeleton() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Skeleton, { className: "aspect-square w-full rounded-3xl" }),
    /* @__PURE__ */ jsx(Skeleton, { className: "mt-4 h-3 w-1/3 rounded-lg" }),
    /* @__PURE__ */ jsx(Skeleton, { className: "mt-2 h-4 w-3/4 rounded-lg" }),
    /* @__PURE__ */ jsx(Skeleton, { className: "mt-2 h-4 w-2/5 rounded-lg" })
  ] });
}
export {
  ProductCardSkeleton,
  Skeleton as default
};
