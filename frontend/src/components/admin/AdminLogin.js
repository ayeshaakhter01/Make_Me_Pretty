import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Link from "@/components/ui/Link.js";
import { useAuth } from "@/context/AuthContext.js";
import { useBranding } from "@/lib/useBranding.js";
import Button from "@/components/ui/Button.js";
function AdminLogin() {
  const { adminSignIn, isAdmin, hydrated } = useAuth();
  const branding = useBranding();
  const navigate = useNavigate();
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (hydrated && isAdmin) navigate("/admin", { replace: true });
  }, [hydrated, isAdmin, navigate]);
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const res = await adminSignIn(f.email.trim(), f.password);
    setBusy(false);
    if (res.ok) navigate("/admin", { replace: true });
    else setErr(res.error);
  };
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-ivory px-5", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6 text-center", children: [
      branding.logo ? /* @__PURE__ */ jsx("img", { src: branding.logo, alt: branding.name, className: "mx-auto h-11 w-auto max-w-[200px] object-contain" }) : /* @__PURE__ */ jsx("div", { className: "font-serif text-2xl tracking-wide2", children: branding.name }),
      /* @__PURE__ */ jsx("div", { className: "mt-1 text-[11px] uppercase tracking-[0.2em] text-ink-soft", children: "Store Administration" })
    ] }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        onSubmit: submit,
        className: "rounded-card border border-line bg-cream p-6 shadow-soft",
        children: [
          /* @__PURE__ */ jsx("h1", { className: "mb-5 font-serif text-xl", children: "Admin sign in" }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Admin email" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "email",
                  value: f.email,
                  onChange: (e) => setF({ ...f, email: e.target.value }),
                  placeholder: "admin@makemepretty.com"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Password" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "password",
                  value: f.password,
                  onChange: (e) => setF({ ...f, password: e.target.value }),
                  placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                }
              )
            ] }),
            err && /* @__PURE__ */ jsx("div", { className: "text-sm text-lowstock-text", children: err }),
            /* @__PURE__ */ jsx(Button, { type: "submit", disabled: busy, className: "mt-1 w-full", children: busy ? "Signing in\u2026" : "Sign in to dashboard" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-4 rounded-xl bg-pink-soft px-3.5 py-2.5 text-[12px] text-ink-soft", children: [
            "Demo credentials \u2014 ",
            /* @__PURE__ */ jsx("b", { children: "admin@makemepretty.com" }),
            " / ",
            /* @__PURE__ */ jsx("b", { children: "admin123" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      Link,
      {
        href: "/",
        className: "mt-5 block text-center text-[13px] text-ink-soft underline",
        children: "\u2190 Back to store"
      }
    )
  ] }) });
}
export {
  AdminLogin as default
};
