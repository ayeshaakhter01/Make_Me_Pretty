import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import ShopClient from "@/components/shop/ShopClient.js";
import PageBanner from "@/components/banners/PageBanner.js";
import TrustMarquee from "@/components/home/TrustMarquee.js";
import { ProductCardSkeleton } from "@/components/ui/Skeleton.js";
import { useApi, useProducts } from "@/lib/hooks.js";
import { useTitle } from "@/lib/useTitle.js";
function ShopFallback() {
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1200px] px-5 py-12", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto h-10 w-56 skel rounded-lg" }),
    /* @__PURE__ */ jsx("div", { className: "mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsx(ProductCardSkeleton, {}, i)) })
  ] });
}
function HairCarePage() {
  useTitle("Hair Care");
  const { data: products, loading } = useProducts();
  const pageName = "Hair Care";
  const q = pageName ? `?page=${encodeURIComponent(pageName)}` : null;
  const { data: banners } = useApi(q && `/api/page-banners${q}`, (d) => d.banners || [], []);
  const { data: strips } = useApi(q && `/api/inline-media${q}`, (d) => d.media || [], []);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageBanner, { banners }),
    pageName && /* @__PURE__ */ jsx(TrustMarquee, {}),
    loading ? /* @__PURE__ */ jsx(ShopFallback, {}) : /* @__PURE__ */ jsx(ShopClient, { products, inlineStrips: strips, fixedCategory: "Hair Care" })
  ] });
}
export {
  HairCarePage as default
};