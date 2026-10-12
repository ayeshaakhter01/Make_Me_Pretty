import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import ProductPlaceholder from "@/components/ui/ProductPlaceholder.js";
import { cx } from "@/lib/utils.js";
function ProductGallery({ product: p }) {
  const media = p.media || [];
  return media.length > 0 ? /* @__PURE__ */ jsx(MediaGallery, { p, media }) : /* @__PURE__ */ jsx(TintGallery, { p });
}
function MediaGallery({ p, media }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("center");
  const boxRef = useRef(null);
  const current = media[Math.min(active, media.length - 1)];
  const onMove = (e) => {
    const el = boxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setOrigin(`${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`);
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: boxRef,
        onClick: () => current.type === "image" && setZoom((z) => !z),
        onMouseMove: onMove,
        onMouseLeave: () => setZoom(false),
        className: "relative aspect-square overflow-hidden rounded-3xl border border-line bg-ivory-2",
        style: { cursor: current.type === "image" ? zoom ? "zoom-out" : "zoom-in" : "default" },
        children: [
          current.type === "video" ? /* @__PURE__ */ jsx(
            "video",
            {
              src: current.src,
              autoPlay: true,
              muted: true,
              loop: true,
              playsInline: true,
              controls: true,
              className: "h-full w-full object-cover"
            },
            current.id
          ) : /* @__PURE__ */ jsx(
            "img",
            {
              src: current.src,
              alt: p.name,
              className: "h-full w-full object-cover transition-transform duration-500 ease-out",
              style: { transform: zoom ? "scale(1.9)" : "scale(1)", transformOrigin: origin }
            },
            current.id
          ),
          current.type === "image" && /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute bottom-4 right-4 rounded-full bg-white/75 px-3 py-1 text-[10.5px] uppercase tracking-[0.1em] text-ink-soft backdrop-blur", children: zoom ? "Click to reset" : "Click to zoom" })
        ]
      }
    ),
    media.length > 1 && /* @__PURE__ */ jsx("div", { className: "mt-3.5 flex flex-wrap justify-center gap-2.5", children: media.map((m, i) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => {
          setActive(i);
          setZoom(false);
        },
        "aria-label": `View ${i + 1}`,
        className: cx(
          "relative h-16 w-16 overflow-hidden rounded-2xl transition-all",
          active === i ? "border-2 border-rose shadow-soft" : "border-[1.5px] border-line opacity-80 hover:opacity-100"
        ),
        children: m.type === "video" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("video", { src: m.src, muted: true, className: "h-full w-full object-cover" }),
          /* @__PURE__ */ jsx("span", { className: "absolute inset-0 flex items-center justify-center bg-ink/25 text-white", children: "\u25B6" })
        ] }) : /* @__PURE__ */ jsx("img", { src: m.src, alt: "", className: "h-full w-full object-cover" })
      },
      m.id
    )) })
  ] });
}
function TintGallery({ p }) {
  const tints = [
    [p.c1, p.c2],
    [p.c2, p.c1],
    ["#F6EFE7", p.c2]
  ];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("center");
  const boxRef = useRef(null);
  const onMove = (e) => {
    const el = boxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setOrigin(`${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`);
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: boxRef,
        onClick: () => setZoom(!zoom),
        onMouseMove: onMove,
        onMouseLeave: () => setZoom(false),
        className: "relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-line",
        style: {
          background: `linear-gradient(165deg, ${tints[active][0]}, #fff 140%)`,
          cursor: zoom ? "zoom-out" : "zoom-in"
        },
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "transition-transform duration-500 ease-out",
              style: { transform: zoom ? "scale(1.8)" : "scale(1)", transformOrigin: origin },
              children: /* @__PURE__ */ jsx(ProductPlaceholder, { shape: p.shape, c1: tints[active][0], c2: tints[active][1], size: 1.7 })
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute bottom-4 right-4 text-[11px] uppercase tracking-[0.1em] text-ink-soft", children: zoom ? "Click to reset" : "Hover / click to zoom" })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "mt-3.5 flex justify-center gap-2.5", children: tints.map((t, i) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => {
          setActive(i);
          setZoom(false);
        },
        "aria-label": `View ${i + 1}`,
        className: cx(
          "flex h-16 w-16 items-center justify-center rounded-2xl transition-all",
          active === i ? "border-2 border-rose" : "border-[1.5px] border-line"
        ),
        style: { background: `linear-gradient(150deg, ${t[0]}, #fff)` },
        children: /* @__PURE__ */ jsx(ProductPlaceholder, { shape: p.shape, c1: t[0], c2: t[1], size: 0.3 })
      },
      i
    )) })
  ] });
}
export {
  ProductGallery as default
};
