import { jsx, jsxs } from "react/jsx-runtime";
function BagIcon({ className = "h-[18px] w-[18px]", animating = false }) {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.7",
      className,
      "aria-hidden": true,
      children: /* @__PURE__ */ jsxs("g", { className: animating ? "bag-body" : void 0, style: { transformOrigin: "12px 14px" }, children: [
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M5.5 8.5h13l-1.05 10.1a2 2 0 0 1-2 1.9H8.55a2 2 0 0 1-2-1.9L5.5 8.5z",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ jsx("path", { d: "M9 8.2V6.8a3 3 0 0 1 6 0v1.4", strokeLinecap: "round" }),
        animating && /* @__PURE__ */ jsx("circle", { className: "bag-dot", cx: "12", cy: "14.5", r: "1.9", fill: "currentColor", stroke: "none" })
      ] })
    }
  );
}
export {
  BagIcon as default
};
