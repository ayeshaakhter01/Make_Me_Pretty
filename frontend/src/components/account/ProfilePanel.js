import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext.js";
import Button from "@/components/ui/Button.js";
function ProfilePanel() {
  const { user, refresh } = useAuth();
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || ""
  });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const startEdit = () => {
    setF({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" });
    setErr("");
    setOk(false);
    setEditing(true);
  };
  const onField = (e) => setF((p) => ({ ...p, [e.target.name]: e.target.value }));
  const save = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await apiFetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f)
      });
      const d = await res.json();
      if (!res.ok) {
        setErr(d.error || "Couldn\u2019t update your profile.");
      } else {
        await refresh();
        setEditing(false);
        setOk(true);
      }
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const Row = ({ label, value }) => /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "field-label", children: label }),
    /* @__PURE__ */ jsx("div", { className: "text-[15px] text-ink", children: value || /* @__PURE__ */ jsx("span", { className: "text-ink-soft", children: "\u2014" }) })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "font-serif text-2xl", children: "My Profile" }),
        /* @__PURE__ */ jsx("p", { className: "text-[13px] text-ink-soft", children: "Your personal information." })
      ] }),
      !editing && /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: startEdit, children: "Edit Profile" })
    ] }),
    ok && !editing && /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-pink-soft px-3.5 py-2.5 text-[13px] font-medium text-rose", children: "Profile updated." }),
    editing ? /* @__PURE__ */ jsxs("form", { onSubmit: save, className: "rounded-card border border-line bg-cream p-5 sm:p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-3.5 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "Full name" }),
          /* @__PURE__ */ jsx("input", { name: "name", value: f.name, onChange: onField, placeholder: "Your name" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "Phone" }),
          /* @__PURE__ */ jsx("input", { name: "phone", value: f.phone, onChange: onField, placeholder: "01XXXXXXXXX", inputMode: "numeric" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "Email" }),
          /* @__PURE__ */ jsx("input", { name: "email", value: f.email, onChange: onField, placeholder: "you@email.com" })
        ] })
      ] }),
      err && /* @__PURE__ */ jsx("div", { className: "mt-3 rounded-xl bg-lowstock-bg px-3.5 py-2.5 text-[13px] text-lowstock-text", children: err }),
      /* @__PURE__ */ jsxs("div", { className: "mt-5 flex gap-3", children: [
        /* @__PURE__ */ jsx(Button, { type: "submit", size: "sm", disabled: busy, children: busy ? "Saving\u2026" : "Save changes" }),
        /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: "ghost", onClick: () => setEditing(false), children: "Cancel" })
      ] })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "grid gap-5 rounded-card border border-line bg-cream p-5 sm:grid-cols-2 sm:p-6", children: [
      /* @__PURE__ */ jsx(Row, { label: "Full name", value: user?.name }),
      /* @__PURE__ */ jsx(Row, { label: "Phone", value: user?.phone }),
      /* @__PURE__ */ jsx(Row, { label: "Email", value: user?.email })
    ] })
  ] });
}
export {
  ProfilePanel as default
};
