import { jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import HeroCarousel from "@/components/hero/HeroCarousel.js";
import { useSettings } from "@/context/SettingsContext.js";
function HeroSection({ slides = [] }) {
  const { branding } = useSettings();
  return (
    /* Immersive hero. The section hugs the carousel rather than forcing a
       min-height: a fixed min-height centres a shorter card and leaves a big
       empty band above it whenever the window is small/short. Hugging keeps the
       gap under the navbar constant at every size; the card's own responsive
       height (see HeroCarousel) is what sets the hero's scale. The fluid
       backdrop comes from the site-wide layer in the store layout. */
    /* @__PURE__ */ jsx("section", { className: "relative flex w-full items-center overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "relative w-full", children: slides.length > 0 ? /* @__PURE__ */ jsx(HeroCarousel, { slides }) : (
      /* Branded fallback panel */
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center py-16 text-center sm:py-24", children: [
        /* @__PURE__ */ jsx("p", { className: "animate-fadeup text-[11px] font-semibold uppercase tracking-[0.3em] text-rose", children: branding.name }),
        /* @__PURE__ */ jsx("h1", { className: "mt-4 max-w-3xl animate-fadeup font-serif text-[clamp(40px,7vw,76px)] font-normal leading-[1.04] [animation-delay:120ms]", children: branding.tagline || "we wanna make you pretty" }),
        /* @__PURE__ */ jsx("p", { className: "mt-5 max-w-md animate-fadeup text-[15.5px] leading-relaxed text-ink-soft [animation-delay:240ms]", children: "Gentle, climate-conscious beauty for the skin you live in \u2014 humid summers, city dust, and all." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex animate-fadeup gap-3.5 [animation-delay:360ms]", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/shop",
              className: "rounded-full bg-rose px-8 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-rose-deep hover:shadow-rose",
              children: "Shop the Collection"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/shop?offers=1",
              className: "rounded-full border-[1.5px] border-ink px-8 py-3.5 text-sm transition-colors hover:bg-ink hover:text-ivory",
              children: "Current Offers"
            }
          )
        ] })
      ] })
    ) }) })
  );
}
export {
  HeroSection as default
};
