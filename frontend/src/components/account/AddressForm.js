import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Button from "@/components/ui/Button.js";
import { cx, validBdPhone } from "@/lib/utils.js";
import {
  COUNTRIES,
  DIVISION_NAMES,
  districtsFor,
  ADDRESS_LABELS
} from "@/data/geo.js";
function AddressForm({ address, onSave, onCancel }) {
  const [f, setF] = useState({
    label: address?.label || "Home",
    fullName: address?.fullName || "",
    phone: address?.phone || "",
    country: address?.country || "Bangladesh",
    division: address?.division || "",
    district: address?.district || "",
    area: address?.area || "",
    street: address?.street || "",
    landmark: address?.landmark || "",
    isDefault: address?.isDefault || false
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((prev) => {
    const next = { ...prev, [k]: v };
    if (k === "division") next.district = "";
    return next;
  });
  const onField = (e) => set(e.target.name, e.target.value);
  const submit = async (e) => {
    e.preventDefault();
    if (!f.fullName.trim()) return setErr("Full name is required.");
    if (!validBdPhone(f.phone.trim()))
      return setErr("Enter a valid 11-digit Bangladeshi mobile number (starts with 01).");
    if (!f.division) return setErr("Please select a division.");
    if (!f.district) return setErr("Please select a district.");
    if (!f.area.trim()) return setErr("Area / Thana is required.");
    if (!f.street.trim()) return setErr("Street address is required.");
    setErr("");
    setBusy(true);
    const res = await onSave(f);
    setBusy(false);
    if (res && !res.ok) setErr(res.error || "Couldn\u2019t save that address.");
  };
  const districts = districtsFor(f.division);
  return /* @__PURE__ */ jsxs(
    "form",
    {
      onSubmit: submit,
      className: "rounded-card border border-line bg-cream p-5 sm:p-6",
      children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-4 font-serif text-lg", children: address ? "Edit address" : "Add a new address" }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "Label" }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: ADDRESS_LABELS.map((l) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => set("label", l),
              className: cx(
                "rounded-full border-[1.5px] px-4 py-1.5 text-[13px] transition-all",
                f.label === l ? "border-rose bg-pink-soft text-rose" : "border-line text-ink-soft hover:border-rose"
              ),
              children: l
            },
            l
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Full name" }),
              /* @__PURE__ */ jsx("input", { name: "fullName", value: f.fullName, onChange: onField, placeholder: "Ayesha Rahman" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Phone" }),
              /* @__PURE__ */ jsx("input", { name: "phone", value: f.phone, onChange: onField, placeholder: "01XXXXXXXXX", inputMode: "numeric" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Country" }),
              /* @__PURE__ */ jsx("select", { name: "country", value: f.country, onChange: onField, children: COUNTRIES.map((c) => /* @__PURE__ */ jsx("option", { children: c }, c)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Division" }),
              /* @__PURE__ */ jsxs("select", { name: "division", value: f.division, onChange: onField, children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select\u2026" }),
                DIVISION_NAMES.map((d) => /* @__PURE__ */ jsx("option", { children: d }, d))
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "District" }),
              /* @__PURE__ */ jsxs("select", { name: "district", value: f.district, onChange: onField, disabled: !f.division, children: [
                /* @__PURE__ */ jsx("option", { value: "", children: f.division ? "Select\u2026" : "Pick division first" }),
                districts.map((d) => /* @__PURE__ */ jsx("option", { children: d }, d))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Area / Thana" }),
              /* @__PURE__ */ jsx("input", { name: "area", value: f.area, onChange: onField, placeholder: "e.g. Dhanmondi" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Landmark (optional)" }),
              /* @__PURE__ */ jsx("input", { name: "landmark", value: f.landmark, onChange: onField, placeholder: "Near\u2026 " })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "field-label", children: "Street address" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                name: "street",
                rows: 2,
                value: f.street,
                onChange: onField,
                placeholder: "House / flat, road, block\u2026"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-center gap-2.5 text-sm", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: f.isDefault,
                onChange: (e) => set("isDefault", e.target.checked),
                className: "!h-4 !w-4 !rounded !border-line accent-rose"
              }
            ),
            "Set as default address"
          ] })
        ] }),
        err && /* @__PURE__ */ jsx("div", { className: "mt-3 rounded-xl bg-lowstock-bg px-3.5 py-2.5 text-[13px] text-lowstock-text", children: err }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 flex gap-3", children: [
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: busy, size: "sm", children: busy ? "Saving\u2026" : address ? "Save changes" : "Add address" }),
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: onCancel, children: "Cancel" })
        ] })
      ]
    }
  );
}
export {
  AddressForm as default
};
