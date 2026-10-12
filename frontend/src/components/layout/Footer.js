import { jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import SocialIcons from "@/components/layout/SocialIcons.js";
import StaggerReveal from "@/components/ui/StaggerReveal.js";
const PAYMENT_FALLBACK = ["bKash", "Nagad", "Visa", "Mastercard", "COD"];
function ColTitle({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "mb-3.5 text-[11px] uppercase tracking-wide2 text-[#C9BDB6]", children });
}
function Footer({ branding = {}, footer = {} }) {
  const name = branding.name || "Make Me Pretty";
  const { paymentLogos = [], social = {}, help = [], policy = [] } = footer;
  return /* @__PURE__ */ jsx("footer", { className: "mt-6 bg-ink text-ivory", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1200px] px-5 py-10", children: [
    /* @__PURE__ */ jsxs(
      StaggerReveal,
      {
        stagger: 90,
        threshold: 0.1,
        className: "grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4",
        children: [
          /* @__PURE__ */ jsxs("div", { children: [
            branding.logo ? /* @__PURE__ */ jsx(
              "img",
              {
                src: branding.logo,
                alt: name,
                className: "mb-2 h-10 w-auto max-w-[190px] object-contain brightness-0 invert"
              }
            ) : /* @__PURE__ */ jsx("div", { className: "mb-2 font-serif text-2xl tracking-brand", children: name }),
            /* @__PURE__ */ jsx("p", { className: "mb-6 font-serif italic text-pink", children: branding.tagline || "we wanna make you pretty" }),
            /* @__PURE__ */ jsx(ColTitle, { children: "Payments accepted" }),
            paymentLogos.length > 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-2", children: paymentLogos.map((p) => /* @__PURE__ */ jsx(
              "span",
              {
                title: p.name,
                className: "inline-flex items-center rounded-md bg-white p-1.5",
                children: /* @__PURE__ */ jsx("img", { src: p.logo, alt: p.name, className: "h-6 w-auto object-contain" })
              },
              p.id
            )) }) : /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: PAYMENT_FALLBACK.map((p) => /* @__PURE__ */ jsx("span", { className: "rounded-lg border border-[#5A4F49] px-3 py-1.5 text-xs", children: p }, p)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(ColTitle, { children: "Help" }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: help.map((l) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
              Link,
              {
                href: `/p/${l.slug}`,
                className: "link-underline text-[13.5px] text-ivory/90 hover:text-pink",
                children: l.label
              }
            ) }, l.slug)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(ColTitle, { children: "Customer Policy" }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: policy.map((l) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
              Link,
              {
                href: `/p/${l.slug}`,
                className: "link-underline text-[13.5px] text-ivory/90 hover:text-pink",
                children: l.label
              }
            ) }, l.slug)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(ColTitle, { children: "Social media" }),
            /* @__PURE__ */ jsx(SocialIcons, { social })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "mt-10 border-t border-[#5A4F49] pt-6 text-center text-[12.5px] text-[#C9BDB6]", children: [
      "\xA9 2026 ",
      name,
      ". All rights reserved."
    ] })
  ] }) });
}
export {
  Footer as default
};
