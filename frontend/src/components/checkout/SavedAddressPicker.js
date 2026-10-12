import { jsx, jsxs } from "react/jsx-runtime";
import { cx } from "@/lib/utils.js";
function SavedAddressPicker({ addresses, selectedId, onSelect }) {
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-3", children: [
    addresses.map((a) => {
      const active = selectedId === a.id;
      const parts = [a.street, a.area, a.district, a.division].filter(Boolean);
      return /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => onSelect(a.id),
          className: cx(
            "flex items-start gap-3 rounded-xl border-[1.5px] p-3.5 text-left transition-colors",
            active ? "border-rose bg-pink-soft" : "border-line hover:border-rose"
          ),
          children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: cx(
                  "mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-[1.5px]",
                  active ? "border-rose" : "border-line"
                ),
                children: active && /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-rose" })
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-ink", children: a.fullName }),
                /* @__PURE__ */ jsx("span", { className: "rounded-full bg-cream px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-rose", children: a.label }),
                a.isDefault && /* @__PURE__ */ jsx("span", { className: "text-[10.5px] uppercase tracking-wide text-ink-soft", children: "Default" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "block text-[13px] text-ink-soft", children: a.phone }),
              /* @__PURE__ */ jsx("span", { className: "block text-[13px] text-ink-soft", children: parts.join(", ") })
            ] })
          ]
        },
        a.id
      );
    }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => onSelect("new"),
        className: cx(
          "flex items-center gap-3 rounded-xl border-[1.5px] border-dashed p-3.5 text-left text-sm transition-colors",
          selectedId === "new" ? "border-rose bg-pink-soft text-rose" : "border-line text-ink hover:border-rose"
        ),
        children: [
          /* @__PURE__ */ jsx("span", { className: "text-lg leading-none", children: "+" }),
          " Use a different address"
        ]
      }
    )
  ] });
}
export {
  SavedAddressPicker as default
};
