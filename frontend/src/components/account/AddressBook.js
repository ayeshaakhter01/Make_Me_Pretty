import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useEffect, useState } from "react";
import AddressForm from "@/components/account/AddressForm.js";
import Button from "@/components/ui/Button.js";
import EmptyState from "@/components/ui/EmptyState.js";
import { cx } from "@/lib/utils.js";
function AddressLines({ a }) {
  const parts = [a.street, a.area, a.district, a.division, a.country].filter(Boolean);
  return /* @__PURE__ */ jsxs("div", { className: "text-[13px] leading-relaxed text-ink-soft", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-ink", children: [
      a.fullName,
      " \xB7 ",
      a.phone
    ] }),
    /* @__PURE__ */ jsx("div", { children: parts.join(", ") }),
    a.landmark && /* @__PURE__ */ jsxs("div", { children: [
      "Landmark: ",
      a.landmark
    ] })
  ] });
}
function AddressBook() {
  const [addresses, setAddresses] = useState(null);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const loadAddresses = async () => {
    try {
      const r = await apiFetch("/api/account/addresses", { cache: "no-store" });
      const d = await r.json();
      setAddresses(d.addresses || []);
    } catch {
      setAddresses([]);
    }
  };
  useEffect(() => {
    loadAddresses();
  }, []);
  const save = async (data) => {
    const isEdit = editing && editing !== "new";
    const url = isEdit ? `/api/account/addresses/${editing}` : "/api/account/addresses";
    const res = await apiFetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const d = await res.json();
    if (!res.ok) return { ok: false, error: d.error };
    setAddresses(d.addresses || []);
    setEditing(null);
    return { ok: true };
  };
  const remove = async (id) => {
    if (!confirm("Delete this address?")) return;
    setBusyId(id);
    setError("");
    try {
      const res = await apiFetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) setError(d.error || "Couldn\u2019t delete that address.");
      else setAddresses(d.addresses || []);
    } finally {
      setBusyId(null);
    }
  };
  const makeDefault = async (id) => {
    setBusyId(id);
    setError("");
    try {
      const res = await apiFetch(`/api/account/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true })
      });
      const d = await res.json();
      if (!res.ok) setError(d.error || "Couldn\u2019t update the default address.");
      else setAddresses(d.addresses || []);
    } finally {
      setBusyId(null);
    }
  };
  if (addresses === null) {
    return /* @__PURE__ */ jsx("div", { className: "h-40 skel rounded-card" });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "font-serif text-2xl", children: "My Addresses" }),
        /* @__PURE__ */ jsx("p", { className: "text-[13px] text-ink-soft", children: "Saved locations for faster checkout. Your default is pre-selected when you order." })
      ] }),
      editing !== "new" && /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => {
        setError("");
        setEditing("new");
      }, children: "+ Add New Address" })
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-lowstock-bg px-3.5 py-2.5 text-[13px] text-lowstock-text", children: error }),
    editing === "new" && /* @__PURE__ */ jsx(AddressForm, { onSave: save, onCancel: () => setEditing(null) }),
    addresses.length === 0 && editing !== "new" ? /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: "\u{1F4CD}",
        title: "No saved addresses yet",
        message: "Add your delivery locations so checkout is one tap away.",
        children: /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => setEditing("new"), children: "Add your first address" })
      }
    ) : /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: addresses.map(
      (a) => editing === a.id ? /* @__PURE__ */ jsx("div", { className: "sm:col-span-2", children: /* @__PURE__ */ jsx(
        AddressForm,
        {
          address: a,
          onSave: save,
          onCancel: () => setEditing(null)
        }
      ) }, a.id) : /* @__PURE__ */ jsxs(
        "div",
        {
          className: cx(
            "flex flex-col rounded-card border bg-cream p-5 transition-colors",
            a.isDefault ? "border-rose" : "border-line"
          ),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-2.5 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "rounded-full bg-pink-soft px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose", children: a.label }),
              a.isDefault && /* @__PURE__ */ jsx("span", { className: "rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-medium text-ivory", children: "Default" })
            ] }),
            /* @__PURE__ */ jsx(AddressLines, { a }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-[13px]", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => {
                    setError("");
                    setEditing(a.id);
                  },
                  className: "text-ink transition-colors hover:text-rose",
                  children: "Edit"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => remove(a.id),
                  disabled: busyId === a.id,
                  className: "text-ink-soft transition-colors hover:text-rose disabled:opacity-50",
                  children: "Delete"
                }
              ),
              !a.isDefault && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => makeDefault(a.id),
                  disabled: busyId === a.id,
                  className: "ml-auto text-rose transition-colors hover:underline disabled:opacity-50",
                  children: "Set as default"
                }
              )
            ] })
          ]
        },
        a.id
      )
    ) })
  ] });
}
export {
  AddressBook as default
};
