import { jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import { useAuth } from "@/context/AuthContext.js";
const UserIcon = () => /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-pink-soft text-rose-deep ring-1 ring-inset ring-rose/25 transition-all hover:bg-pink hover:ring-rose/50", children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", className: "h-[18px] w-[18px]", fill: "none", stroke: "currentColor", strokeWidth: "1.7", children: [
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "8", r: "3.4" }),
  /* @__PURE__ */ jsx("path", { d: "M5 19.5c0-3.6 3.2-5.5 7-5.5s7 1.9 7 5.5", strokeLinecap: "round" })
] }) });
function AccountMenu() {
  const { user, isAuthed, hydrated } = useAuth();
  if (!hydrated) {
    return /* @__PURE__ */ jsx("div", { className: "h-9 w-9", "aria-hidden": true });
  }
  if (!isAuthed) {
    return /* @__PURE__ */ jsxs(Link, { href: "/account", "aria-label": "Sign in", title: "Sign in", children: [
      /* @__PURE__ */ jsx("span", { className: "hidden border-b-[1.5px] border-transparent pb-0.5 text-sm text-ink transition-colors hover:border-rose md:inline", children: "Sign In" }),
      /* @__PURE__ */ jsx("span", { className: "md:hidden", children: /* @__PURE__ */ jsx(UserIcon, {}) })
    ] });
  }
  return /* @__PURE__ */ jsx(Link, { href: "/account", "aria-label": "Your profile", title: user.name, children: /* @__PURE__ */ jsx(UserIcon, {}) });
}
export {
  AccountMenu as default
};
