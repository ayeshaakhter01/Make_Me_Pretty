import { jsx, jsxs } from "react/jsx-runtime";
import { DISTRICTS } from "@/lib/utils.js";
function DistrictThanaFields({ values, onChange }) {
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "field-label", children: "District" }),
      /* @__PURE__ */ jsx(
        "select",
        {
          value: values.district,
          onChange: (e) => onChange("district", e.target.value),
          children: DISTRICTS.map((d) => /* @__PURE__ */ jsx("option", { children: d }, d))
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "field-label", children: "Thana / Upazila" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: values.thana,
          onChange: (e) => onChange("thana", e.target.value),
          placeholder: "e.g. Dhanmondi"
        }
      )
    ] })
  ] });
}
export {
  DistrictThanaFields as default
};
