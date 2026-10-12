import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Suspense, useState } from "react";
import Link from "@/components/ui/Link.js";
import { useAuth } from "@/context/AuthContext.js";
import AuthForm from "@/components/account/AuthForm.js";
import OrderHistory from "@/components/account/OrderHistory.js";
import ProfilePanel from "@/components/account/ProfilePanel.js";
import AddressBook from "@/components/account/AddressBook.js";
import { cx } from "@/lib/utils.js";
const TABS = [
  { key: "profile", label: "My Profile" },
  { key: "addresses", label: "My Addresses" },
  { key: "orders", label: "Order History" }
];
const LINKS = [
  // Wishlist is already reachable from the navbar, so it's intentionally not
  // repeated here.
  { href: "/track", label: "Track an Order" }
];
function AccountContent() {
  const { user, isAuthed, signOut, hydrated } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initial = TABS.some((t) => t.key === params.get("tab")) ? params.get("tab") : "profile";
  const [tab, setTab] = useState(initial);
  if (!hydrated) {
    return /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-md px-5 py-16", children: /* @__PURE__ */ jsx("div", { className: "mx-auto h-8 w-40 skel rounded-lg" }) });
  }
  if (!isAuthed) {
    return /* @__PURE__ */ jsx("div", { className: "px-5 py-14", children: /* @__PURE__ */ jsx(AuthForm, {}) });
  }
  const onSignOut = async () => {
    await signOut();
    navigate("/");
  };
  const NavButton = ({ t }) => /* @__PURE__ */ jsx(
    "button",
    {
      onClick: () => setTab(t.key),
      className: cx(
        "w-full rounded-xl px-4 py-2.5 text-left text-sm transition-colors",
        tab === t.key ? "bg-pink-soft font-medium text-rose" : "text-ink hover:bg-ivory-2"
      ),
      children: t.label
    }
  );
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1080px] px-5 py-10 sm:py-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "animate-fadeup mb-8 flex flex-wrap items-center gap-4", children: [
      /* @__PURE__ */ jsx("span", { className: "flex h-16 w-16 items-center justify-center rounded-full bg-pink text-2xl font-semibold uppercase text-rose-deep", children: user.name?.[0] || "A" }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("h1", { className: "truncate font-serif text-[28px] font-normal leading-tight", children: user.name }),
        /* @__PURE__ */ jsx("p", { className: "truncate text-[13px] text-ink-soft", children: user.email })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setTab("profile"),
          className: "ml-auto rounded-full border-[1.5px] border-line px-4 py-2 text-[13px] transition-colors hover:border-rose hover:text-rose",
          children: "Edit Profile"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-8 md:grid-cols-[220px_1fr]", children: [
      /* @__PURE__ */ jsx("aside", { className: "h-max rounded-card border border-line bg-cream p-2.5 md:sticky md:top-24", children: /* @__PURE__ */ jsxs("nav", { className: "flex flex-col gap-0.5", children: [
        TABS.map((t) => /* @__PURE__ */ jsx(NavButton, { t }, t.key)),
        LINKS.map((l) => /* @__PURE__ */ jsx(
          Link,
          {
            href: l.href,
            className: "w-full rounded-xl px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-ivory-2",
            children: l.label
          },
          l.href
        )),
        /* @__PURE__ */ jsx("div", { className: "my-1 border-t border-line" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onSignOut,
            className: "w-full rounded-xl px-4 py-2.5 text-left text-sm text-rose transition-colors hover:bg-pink-soft",
            children: "Sign Out"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("section", { className: "min-w-0", children: [
        tab === "profile" && /* @__PURE__ */ jsx(ProfilePanel, {}),
        tab === "addresses" && /* @__PURE__ */ jsx(AddressBook, {}),
        tab === "orders" && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "font-serif text-2xl", children: "Order History" }),
            /* @__PURE__ */ jsx("p", { className: "text-[13px] text-ink-soft", children: "Every order you\u2019ve placed." })
          ] }),
          /* @__PURE__ */ jsx(OrderHistory, {})
        ] })
      ] })
    ] })
  ] });
}
function AccountPage() {
  return /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(AccountContent, {}) });
}
export {
  AccountPage as default
};
