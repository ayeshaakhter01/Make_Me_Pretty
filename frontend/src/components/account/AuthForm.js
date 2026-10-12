import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext.js";
import Button from "@/components/ui/Button.js";
function AuthForm() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const on = (e) => setF((p) => ({ ...p, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    if (!f.email || !f.password || mode === "signup" && !f.name) {
      setErr("Please fill in all fields.");
      return;
    }
    setErr("");
    setBusy(true);
    const res = mode === "signup" ? await signUp(f.name, f.email, f.password) : await signIn(f.email, f.password);
    setBusy(false);
    if (!res.ok) {
      setErr(res.error || "Something went wrong. Please try again.");
      return;
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-md", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-serif text-[34px] font-normal", children: mode === "signin" ? "Welcome back" : "Create your account" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-ink-soft", children: mode === "signin" ? "Sign in to track orders and check out faster." : "Join Make Me Pretty \u2014 we wanna make you pretty." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mb-6 flex rounded-full border border-line bg-cream p-1", children: [
      ["signin", "Sign In"],
      ["signup", "Sign Up"]
    ].map(([val, label]) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => {
          setMode(val);
          setErr("");
        },
        className: `flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${mode === val ? "bg-ink text-ivory" : "text-ink-soft"}`,
        children: label
      },
      val
    )) }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        onSubmit: submit,
        className: "rounded-card border border-line bg-cream p-6",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
            mode === "signup" && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Full name" }),
              /* @__PURE__ */ jsx("input", { name: "name", value: f.name, onChange: on, placeholder: "Ayesha Rahman" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Email" }),
              /* @__PURE__ */ jsx("input", { name: "email", type: "email", value: f.email, onChange: on, placeholder: "you@email.com" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Password" }),
              /* @__PURE__ */ jsx("input", { name: "password", type: "password", value: f.password, onChange: on, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })
            ] }),
            err && /* @__PURE__ */ jsx("div", { className: "text-sm text-lowstock-text", children: err }),
            /* @__PURE__ */ jsx(Button, { type: "submit", disabled: busy, className: "mt-1 w-full", children: busy ? "Please wait\u2026" : mode === "signin" ? "Sign In" : "Create Account" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-center text-xs text-ink-soft", children: "Your password is securely hashed (bcrypt) and your session is kept in a signed, httpOnly cookie." })
        ]
      }
    )
  ] });
}
export {
  AuthForm as default
};
