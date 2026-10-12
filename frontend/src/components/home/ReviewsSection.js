import { jsx, jsxs } from "react/jsx-runtime";
import { REVIEWS } from "@/data/reviews.js";
import StarRating from "@/components/product/StarRating.js";
import Reveal from "@/components/ui/Reveal.js";
function ReviewsSection() {
  return /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-[1200px] px-5 py-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-9 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-rose", children: "Loved across 64 districts" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-2 font-serif text-[34px] font-normal", children: "What our customers say" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-5 md:grid-cols-2 lg:grid-cols-3", children: REVIEWS.map((r, i) => /* @__PURE__ */ jsx(Reveal, { delay: i % 3 * 90, children: /* @__PURE__ */ jsxs("figure", { className: "flex h-full flex-col rounded-card border border-line bg-cream p-6", children: [
      /* @__PURE__ */ jsx(StarRating, { value: r.rating }),
      /* @__PURE__ */ jsxs("blockquote", { className: "my-3.5 flex-1 text-[14.5px] leading-relaxed", children: [
        "\u201C",
        r.text,
        "\u201D"
      ] }),
      /* @__PURE__ */ jsxs("figcaption", { className: "text-[13px] text-ink-soft", children: [
        /* @__PURE__ */ jsx("span", { className: "font-medium text-ink", children: r.name }),
        " \xB7 ",
        r.location,
        /* @__PURE__ */ jsxs("span", { className: "mt-1 block text-gold", children: [
          "\u2713 Verified purchase \u2014 ",
          r.product
        ] })
      ] })
    ] }) }, r.id)) })
  ] });
}
export {
  ReviewsSection as default
};
