import { jsx, jsxs } from "react/jsx-runtime";
import { ProductCardSkeleton } from "@/components/ui/Skeleton.js";
function StoreLoading() {
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1200px] px-5 py-12", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto h-9 w-56 skel rounded-lg" }),
    /* @__PURE__ */ jsx("div", { className: "mx-auto mt-3 h-4 w-72 skel rounded-lg" }),
    /* @__PURE__ */ jsx("div", { className: "mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsx(ProductCardSkeleton, {}, i)) })
  ] });
}
export {
  StoreLoading as default
};
