import { jsx, jsxs } from "react/jsx-runtime";
function CouponField({
  value,
  onChange,
  onApply,
  onRemove,
  applied,
  error,
  busy
}) {
  if (applied) {
    return /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center justify-between rounded-xl bg-pink-soft px-3.5 py-2.5", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-[13px]", children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold tracking-wide", children: applied.code }),
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-ink-soft", children: applied.type === "shipping" ? "\xB7 free delivery" : `\xB7 ${applied.value}% off` })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onRemove,
          className: "text-xs text-rose underline",
          children: "Remove"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          value,
          onChange: (e) => onChange(e.target.value),
          placeholder: "Coupon code",
          "aria-label": "Coupon code",
          className: "!py-2.5 !text-[13px] uppercase",
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onApply();
            }
          }
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onApply,
          disabled: busy || !value.trim(),
          className: "whitespace-nowrap rounded-2xl border-[1.5px] border-ink px-4 text-[13px] font-medium transition-colors hover:bg-ink hover:text-ivory disabled:opacity-50",
          children: busy ? "\u2026" : "Apply"
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-[12px] text-lowstock-text", children: error })
  ] });
}
export {
  CouponField as default
};
