import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Link from "@/components/ui/Link.js";
import { CATEGORIES } from "@/data/categories.js";
import BrandLogo from "@/components/layout/BrandLogo.js";
import { useAuth } from "@/context/AuthContext.js";
import { cx } from "@/lib/utils.js";
function MobileNav({ open, onClose }) {
  const [expanded, setExpanded] = useState(null);
  const { isAuthed, user, signOut } = useAuth();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        onClick: onClose,
        className: cx(
          "fixed inset-0 z-[120] bg-ink/35 transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: cx(
          "fixed inset-y-0 left-0 z-[130] flex w-[min(340px,88vw)] flex-col bg-ivory shadow-drawer transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-line px-5 py-4", children: [
            /* @__PURE__ */ jsx(BrandLogo, { size: "sm" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                "aria-label": "Close menu",
                className: "text-2xl text-ink-soft",
                children: "\xD7"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("nav", { className: "flex-1 overflow-y-auto px-2 py-3", children: [
            CATEGORIES.map((cat) => {
              const isOpen = expanded === cat.name;
              return /* @__PURE__ */ jsxs("div", { className: "border-b border-line/60", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setExpanded(isOpen ? null : cat.name),
                    className: "flex w-full items-center justify-between px-3 py-3.5 text-left font-serif text-lg",
                    children: [
                      cat.name,
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: cx(
                            "text-rose transition-transform",
                            isOpen && "rotate-45"
                          ),
                          children: "+"
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: cx(
                      "overflow-hidden transition-all duration-300",
                      isOpen ? "max-h-96" : "max-h-0"
                    ),
                    children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-1 px-3 pb-3", children: cat.types.map((t) => /* @__PURE__ */ jsx(
                      Link,
                      {
                        href: `/shop?category=${encodeURIComponent(
                          cat.name
                        )}&type=${encodeURIComponent(t)}`,
                        onClick: onClose,
                        className: "rounded-lg px-2 py-2 text-sm text-ink-soft transition-colors hover:bg-pink-soft hover:text-ink",
                        children: t
                      },
                      t
                    )) })
                  }
                )
              ] }, cat.name);
            }),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: "/combo",
                onClick: onClose,
                className: "flex items-center gap-2 px-3 py-3.5 font-serif text-lg",
                children: [
                  "Combo ",
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-rose", children: "\u273F" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: "/shop?offers=1",
                onClick: onClose,
                className: "mt-1 flex items-center gap-2 px-3 py-3.5 font-serif text-lg text-rose",
                children: [
                  "Offers ",
                  /* @__PURE__ */ jsx("span", { className: "text-xs", children: "\u2726" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: "/wishlist",
                onClick: onClose,
                className: "flex items-center gap-2 px-3 py-3.5 font-serif text-lg",
                children: [
                  "Wishlist ",
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-rose", children: "\u2661" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: "/track",
                onClick: onClose,
                className: "flex items-center gap-2 px-3 py-3.5 font-serif text-lg",
                children: [
                  "Track Order ",
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-rose", children: "\u{1F69A}" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "border-t border-line px-5 py-4", children: isAuthed ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: "/account",
                onClick: onClose,
                className: "flex items-center gap-3 rounded-xl bg-ivory-2 px-3 py-2.5 transition-colors hover:bg-pink-soft",
                children: [
                  /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-pink text-sm font-semibold uppercase text-rose-deep", children: user.name?.[0] || "A" }),
                  /* @__PURE__ */ jsxs("span", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-medium", children: user.name }),
                    /* @__PURE__ */ jsx("span", { className: "block text-xs text-ink-soft", children: "View my profile" })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "ml-auto text-ink-soft", children: "\u203A" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  signOut();
                  onClose();
                },
                className: "text-sm text-rose",
                children: "Sign Out"
              }
            )
          ] }) : /* @__PURE__ */ jsx(
            Link,
            {
              href: "/account",
              onClick: onClose,
              className: "block rounded-full bg-rose px-5 py-3 text-center text-sm font-medium text-white",
              children: "Sign In / Create Account"
            }
          ) })
        ]
      }
    )
  ] });
}
export {
  MobileNav as default
};
