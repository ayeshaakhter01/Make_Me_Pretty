import { jsx, jsxs } from "react/jsx-runtime";
import { ORDER_STATUSES } from "@/lib/utils.js";
import Badge from "@/components/ui/Badge.js";
import { cx } from "@/lib/utils.js";
const NOTES = (method) => [
  `We\u2019ve received your order and payment via ${method}.`,
  "Your order is packed and ready.",
  "Handed to courier (Pathao) \u2014 on the move.",
  "Your rider is nearby. Keep your phone close!",
  "Delivered. Enjoy your ritual \u273F"
];
function TrackingTimeline({ status = 0, method = "bKash" }) {
  const notes = NOTES(method);
  return /* @__PURE__ */ jsx("div", { children: ORDER_STATUSES.map((label, i) => {
    const done = i <= status;
    const current = i === status;
    return /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: cx(
              "h-3.5 w-3.5 flex-shrink-0 rounded-full border-[2.5px] bg-white",
              done ? "border-rose bg-rose" : "border-line"
            )
          }
        ),
        i < ORDER_STATUSES.length - 1 && /* @__PURE__ */ jsx(
          "span",
          {
            className: cx(
              "min-h-[34px] w-[2.5px] flex-1",
              i < status ? "bg-rose" : "bg-line"
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "pb-5", children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: cx(
              "text-[15px]",
              current ? "font-semibold text-ink" : done ? "text-ink" : "text-ink-soft"
            ),
            children: [
              label,
              current && /* @__PURE__ */ jsx(Badge, { tone: "pink", className: "ml-2", children: "Current" })
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-[12.5px] text-ink-soft", children: notes[i] })
      ] })
    ] }, label);
  }) });
}
export {
  TrackingTimeline as default
};
