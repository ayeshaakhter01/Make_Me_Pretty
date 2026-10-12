import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.js";
import { useBranding } from "@/lib/useBranding.js";
import { cx } from "@/lib/utils.js";
const NAV = [
  { id: "Orders", icon: "\u{1F9FE}" },
  { id: "Inventory", icon: "\u{1F4E6}" },
  { id: "Behaviour", icon: "\u{1F463}" },
  { id: "Analytics", icon: "\u{1F4C8}" },
  { id: "Coupons", icon: "\u{1F39F}" },
  { id: "Banners", icon: "\u{1F3F7}" },
  { id: "Reviews", icon: "\u2B50" },
  { id: "Blog", icon: "\u270D" }
];
function AdminSidebar({ active, onChange }) {
  const { signOut } = useAuth();
  const branding = useBranding();
  const navigate = useNavigate();
  const logout = () => {
    signOut();
    navigate("/admin/login", { replace: true });
  };
  return /* @__PURE__ */ jsx("aside", { className: "lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-60 lg:flex-shrink-0", children: /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col rounded-card border border-line bg-cream p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6 px-2 pt-2", children: [
      branding.logo ? /* @__PURE__ */ jsx("img", { src: branding.logo, alt: branding.name, className: "h-9 w-auto max-w-[170px] object-contain" }) : /* @__PURE__ */ jsx("div", { className: "font-serif text-lg leading-tight tracking-wide2", children: branding.name }),
      /* @__PURE__ */ jsx("div", { className: "mt-1 text-[10px] uppercase tracking-[0.18em] text-ink-soft", children: "Admin" })
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "flex gap-2 overflow-x-auto lg:flex-1 lg:flex-col lg:overflow-visible", children: NAV.map((n) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => onChange(n.id),
        className: cx(
          "flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition-colors",
          active === n.id ? "bg-ink text-ivory" : "text-ink-soft hover:bg-pink-soft hover:text-ink"
        ),
        children: [
          /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: n.icon }),
          n.id
        ]
      },
      n.id
    )) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: logout,
        className: "mt-4 hidden rounded-xl px-4 py-2.5 text-left text-sm text-rose transition-colors hover:bg-pink-soft lg:block",
        children: "Sign out"
      }
    )
  ] }) });
}
export {
  AdminSidebar as default
};
