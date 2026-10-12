import { jsx, jsxs } from "react/jsx-runtime";
import { PAYMENTS } from "@/data/payments.js";
import { cx } from "@/lib/utils.js";
function PaymentOptions({ selected, onSelect }) {
  return /* @__PURE__ */ jsx("div", { className: "grid gap-2.5", children: PAYMENTS.map((p) => {
    const on = selected === p.id;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => onSelect(p.id),
        className: cx(
          "flex items-center gap-3.5 rounded-2xl border-[1.5px] px-4 py-4 text-left transition-all",
          on ? "border-rose bg-pink-soft shadow-[0_4px_14px_rgba(183,110,121,.12)]" : "border-line bg-cream hover:border-rose/50"
        ),
        children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-[17px] font-bold",
              style: { color: p.color },
              children: p.icon
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("span", { className: "block text-[14.5px] font-semibold", children: p.name }),
            /* @__PURE__ */ jsx("span", { className: "block text-[12.5px] text-ink-soft", children: p.note })
          ] }),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: cx(
                "h-[18px] w-[18px] rounded-full",
                on ? "border-[5.5px] border-rose" : "border-2 border-line"
              )
            }
          )
        ]
      },
      p.id
    );
  }) });
}
export {
  PaymentOptions as default
};
