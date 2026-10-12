import { jsx, jsxs } from "react/jsx-runtime";
function ProductPlaceholder({
  shape = "pump",
  c1 = "#F6DEE3",
  c2 = "#DBA8B1",
  size = 1,
  className
}) {
  const gid = `pp-${c1}-${c2}`.replace(/[^a-zA-Z0-9-]/g, "");
  const fill = `url(#${gid})`;
  const shapes = {
    pump: /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx("rect", { x: "62", y: "18", width: "16", height: "14", rx: "3", fill: c2 }),
      /* @__PURE__ */ jsx("path", { d: "M70 18 h26 a4 4 0 0 1 4 4 v4 h-8", fill: "none", stroke: c2, strokeWidth: "7", strokeLinecap: "round" }),
      /* @__PURE__ */ jsx("rect", { x: "58", y: "32", width: "24", height: "16", rx: "4", fill: c2 }),
      /* @__PURE__ */ jsx("rect", { x: "42", y: "48", width: "56", height: "106", rx: "16", fill }),
      /* @__PURE__ */ jsx("rect", { x: "52", y: "86", width: "36", height: "34", rx: "4", fill: "rgba(255,255,255,.75)" })
    ] }),
    jar: /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx("rect", { x: "34", y: "52", width: "72", height: "26", rx: "10", fill: c2 }),
      /* @__PURE__ */ jsx("rect", { x: "30", y: "76", width: "80", height: "76", rx: "20", fill }),
      /* @__PURE__ */ jsx("rect", { x: "48", y: "98", width: "44", height: "30", rx: "4", fill: "rgba(255,255,255,.75)" })
    ] }),
    dropper: /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx("circle", { cx: "70", cy: "20", r: "9", fill: c2 }),
      /* @__PURE__ */ jsx("rect", { x: "63", y: "26", width: "14", height: "22", rx: "4", fill: c2 }),
      /* @__PURE__ */ jsx("path", { d: "M70 48 L70 74", stroke: c2, strokeWidth: "5" }),
      /* @__PURE__ */ jsx("rect", { x: "46", y: "66", width: "48", height: "88", rx: "14", fill }),
      /* @__PURE__ */ jsx("rect", { x: "55", y: "94", width: "30", height: "30", rx: "4", fill: "rgba(255,255,255,.75)" })
    ] }),
    tube: /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx("rect", { x: "56", y: "22", width: "28", height: "14", rx: "5", fill: c2 }),
      /* @__PURE__ */ jsx("path", { d: "M50 40 h40 l6 100 a12 12 0 0 1 -12 12 h-28 a12 12 0 0 1 -12 -12 z", fill }),
      /* @__PURE__ */ jsx("rect", { x: "54", y: "80", width: "32", height: "32", rx: "4", fill: "rgba(255,255,255,.75)" })
    ] }),
    mist: /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx("path", { d: "M60 20 h20 v14 h-20 z", fill: c2 }),
      /* @__PURE__ */ jsx("rect", { x: "54", y: "32", width: "32", height: "14", rx: "5", fill: c2 }),
      /* @__PURE__ */ jsx("rect", { x: "46", y: "46", width: "48", height: "108", rx: "14", fill }),
      /* @__PURE__ */ jsx("rect", { x: "55", y: "84", width: "30", height: "34", rx: "4", fill: "rgba(255,255,255,.75)" })
    ] })
  };
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      viewBox: "0 0 140 170",
      style: { width: 140 * size, height: 170 * size },
      className,
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: gid, x1: "0", y1: "0", x2: "1", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: c1 }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: c2 })
        ] }) }),
        shapes[shape] || shapes.pump
      ]
    }
  );
}
export {
  ProductPlaceholder as default
};
