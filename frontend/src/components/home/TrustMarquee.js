import { jsx, jsxs } from "react/jsx-runtime";
import { useSettings } from "@/context/SettingsContext.js";
const TRUST = [
  "Dermatologist Tested",
  "Cruelty Free",
  "Made for Humid Climates",
  "Fragrance Conscious",
  "bKash \xB7 Nagad \xB7 COD"
];
function TrustMarquee() {
  const { footer } = useSettings();
  const brands = (footer.brandLogos || []).map((b) => b.brand);
  const items = [...TRUST, ...brands];
  return /* @__PURE__ */ jsx("div", { className: "marquee-wrap overflow-hidden border-y border-line bg-pink-soft py-5", children: /* @__PURE__ */ jsx("div", { className: "flex w-max animate-marquee gap-12 whitespace-nowrap", children: [0, 1].map((dup) => /* @__PURE__ */ jsx(
    "div",
    {
      className: "flex gap-12 text-[12.5px] uppercase tracking-wide2 text-rose-deep",
      "aria-hidden": dup === 1,
      children: items.map((item, i) => /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-12", children: [
        item,
        /* @__PURE__ */ jsx("span", { className: "text-rose", children: "\u273F" })
      ] }, `${item}-${i}`))
    },
    dup
  )) }) });
}
export {
  TrustMarquee as default
};
