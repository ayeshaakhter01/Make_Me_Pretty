import { jsx, jsxs } from "react/jsx-runtime";
import { cx } from "@/lib/utils.js";
function Brush() {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      viewBox: "0 0 460 34",
      className: "mx-auto mt-3 h-7 w-[min(460px,78%)]",
      fill: "none",
      "aria-hidden": true,
      children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "brush", x1: "0", y1: "0", x2: "1", y2: "0", children: [
          /* @__PURE__ */ jsx("stop", { stopColor: "#e01a7f" }),
          /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#ff5fa2" })
        ] }) }),
        /* @__PURE__ */ jsx("path", { d: "M10 20 C 120 6, 250 26, 360 15 S 440 12, 452 19", stroke: "url(#brush)", strokeWidth: "8", strokeLinecap: "round" }),
        /* @__PURE__ */ jsx("path", { d: "M28 27 C 150 20, 300 30, 430 22", stroke: "url(#brush)", strokeWidth: "3.5", strokeLinecap: "round", opacity: "0.55" })
      ]
    }
  );
}
function PhotoFrame({ p }) {
  return /* @__PURE__ */ jsx("div", { className: "about-photo-float", children: /* @__PURE__ */ jsx("div", { className: "about-photo-frame", children: /* @__PURE__ */ jsx("div", { className: "about-photo-inner aspect-[4/3] w-full", children: p.mediaType === "video" ? /* @__PURE__ */ jsx("video", { src: p.media, muted: true, loop: true, autoPlay: true, playsInline: true, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("img", { src: p.media, alt: p.name, className: "h-full w-full object-cover" }) }) }) });
}
function AboutUs({ people = [], brandName = "Make Me Pretty", title }) {
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1000px] overflow-x-clip px-5 py-14 sm:py-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "about-in text-center", style: { animationDelay: "0.1s" }, children: [
      /* @__PURE__ */ jsx("h1", { className: "font-serif text-[clamp(28px,5.5vw,48px)] font-normal", children: title || `The People Behind ${brandName}` }),
      /* @__PURE__ */ jsx(Brush, {})
    ] }),
    people.length === 0 ? /* @__PURE__ */ jsx("p", { className: "mt-12 text-center text-[15px] text-ink-soft", children: "Our story is coming soon." }) : /* @__PURE__ */ jsx("div", { className: "mt-14 space-y-16 sm:space-y-24", children: people.map((p, i) => {
      const reversed = i % 2 === 1;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: cx(
            "flex flex-col items-center gap-8 md:gap-12",
            reversed ? "md:flex-row-reverse" : "md:flex-row"
          ),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "about-in md:w-1/2", style: { animationDelay: `${0.3 + i * 0.45}s` }, children: [
              /* @__PURE__ */ jsx("h2", { className: "font-serif text-2xl sm:text-3xl", children: p.name }),
              /* @__PURE__ */ jsx("div", { className: "mt-2 h-0.5 w-12 rounded-full bg-rose/60" }),
              p.text && /* @__PURE__ */ jsx("p", { className: "mt-4 text-[15px] leading-relaxed text-ink-soft", children: p.text })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "about-in w-full max-w-[360px] md:w-1/2", style: { animationDelay: `${0.5 + i * 0.45}s` }, children: /* @__PURE__ */ jsx(PhotoFrame, { p }) })
          ]
        },
        p.id
      );
    }) })
  ] });
}
export {
  AboutUs as default
};
