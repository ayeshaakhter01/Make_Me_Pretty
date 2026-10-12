import { jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import StaggerReveal from "@/components/ui/StaggerReveal.js";
import { useSettings } from "@/context/SettingsContext.js";
import { useTitle } from "@/lib/useTitle.js";
function BrandMedia({ b }) {
  if (!b.logo)
    return /* @__PURE__ */ jsx("span", { className: "break-words px-2 text-center font-serif text-[19px] leading-tight text-ink", children: b.brand });
  return b.mediaType === "video" ? /* @__PURE__ */ jsx("video", { src: b.logo, muted: true, loop: true, autoPlay: true, playsInline: true, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("img", { src: b.logo, alt: b.brand, className: "h-full w-full object-contain" });
}
function BrandsPage() {
  useTitle("Brands");
  const { footer, loaded } = useSettings();
  const brands = footer.brandLogos || [];
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1200px] px-5 py-14", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-9 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-rose", children: "Names you can trust" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-2 font-serif text-[clamp(30px,4.5vw,42px)] font-normal", children: "Brands we carry" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-[14px] text-ink-soft", children: "Tap a brand to see everything we stock from them." })
    ] }),
    brands.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-center text-[15px] text-ink-soft", children: loaded ? "No brands yet." : "Loading\u2026" }) : /* @__PURE__ */ jsx(
      StaggerReveal,
      {
        stagger: 70,
        threshold: 0.05,
        className: "grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4",
        children: brands.map((b) => /* @__PURE__ */ jsxs(
          Link,
          {
            href: `/shop?brand=${encodeURIComponent(b.brand)}`,
            className: "group flex flex-col items-center rounded-3xl border border-line bg-cream p-5 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-rose/40 hover:shadow-soft",
            children: [
              /* @__PURE__ */ jsx("div", { className: "card-shine mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-4", children: /* @__PURE__ */ jsx(BrandMedia, { b }) }),
              b.logo && /* @__PURE__ */ jsx("div", { className: "truncate font-serif text-[15px] text-ink group-hover:text-rose", children: b.brand }),
              b.description && /* @__PURE__ */ jsx("div", { className: "mt-0.5 line-clamp-1 text-[11.5px] text-ink-soft", children: b.description }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-rose opacity-0 transition-opacity duration-300 group-hover:opacity-100", children: "Shop \u2192" })
            ]
          },
          b.id
        ))
      }
    )
  ] });
}
export {
  BrandsPage as default
};
