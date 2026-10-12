import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import ShopClient from "@/components/shop/ShopClient.js";
import PageBanner from "@/components/banners/PageBanner.js";
import TrustMarquee from "@/components/home/TrustMarquee.js";
import { ProductCardSkeleton } from "@/components/ui/Skeleton.js";
import { useApi, useProducts } from "@/lib/hooks.js";
import { useTitle } from "@/lib/useTitle.js";

const CATEGORY = "Hair Care";

function Fallback() {
  return /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-[1200px] px-5 py-12", children: /* @__PURE__ */ jsx("div", { className: "mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsx(ProductCardSkeleton, {}, i)) }) });
}
function HairCarePage() {
  useTitle(CATEGORY);
  const { data: products, loading } = useProducts();
  const q = `?page=${encodeURIComponent(CATEGORY)}`;
  const { data: banners } = useApi(`/api/page-banners${q}`, (d) => d.banners || [], []);
  const { data: strips } = useApi(`/api/inline-media${q}`, (d) => d.media || [], []);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageBanner, { banners }),
    /* @__PURE__ */ jsx(TrustMarquee, {}),
    loading ? /* @__PURE__ */ jsx(Fallback, {}) : /* @__PURE__ */ jsx(ShopClient, { products, inlineStrips: strips, forcedCategory: CATEGORY })
  ] });
}
export {
  HairCarePage as default
};