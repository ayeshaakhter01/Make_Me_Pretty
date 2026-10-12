import { jsx, jsxs } from "react/jsx-runtime";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Link from "@/components/ui/Link.js";
import { useCart } from "@/context/CartContext.js";
import { useAuth } from "@/context/AuthContext.js";
const SEEN_KEY = "mmp_cart_reminder_seen";
function CartReminder() {
  const { returningCartCount, count, openDrawer } = useCart();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (!user || returningCartCount <= 0) return;
    if (pathname === "/cart" || pathname === "/checkout") return;
    if (sessionStorage.getItem(SEEN_KEY) === user.id) return;
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, [user, returningCartCount, pathname]);
  const dismiss = () => {
    if (user) sessionStorage.setItem(SEEN_KEY, user.id);
    setLeaving(true);
    setTimeout(() => setShow(false), 300);
  };
  if (!show) return null;
  const items = count || returningCartCount;
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "dialog",
      "aria-label": "Cart reminder",
      className: `fixed bottom-5 left-1/2 z-[150] w-[min(400px,92vw)] -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 ${leaving ? "opacity-0 translate-y-2" : "animate-fadeup"} transition-all duration-300`,
      children: /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-3xl border border-line bg-cream shadow-menu", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 p-5", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-pink text-2xl", children: "\u{1F6CD}" }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose", children: "Still thinking it over?" }),
          /* @__PURE__ */ jsxs("h3", { className: "font-serif text-lg leading-snug", children: [
            "You left ",
            items,
            " ",
            items === 1 ? "item" : "items",
            " in your bag"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[13px] leading-relaxed text-ink-soft", children: [
            "Your picks are waiting, ",
            user?.name?.split(" ")[0] || "there",
            " \u2014 pick up right where you left off."
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                href: "/cart",
                onClick: dismiss,
                className: "rounded-full bg-rose px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep",
                children: "View my bag"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  dismiss();
                  openDrawer();
                },
                className: "rounded-full px-3 py-2.5 text-[13px] text-ink-soft transition-colors hover:text-rose",
                children: "Quick peek"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: dismiss,
            "aria-label": "Dismiss reminder",
            className: "-mr-1 -mt-1 text-xl text-ink-soft transition-colors hover:text-ink",
            children: "\xD7"
          }
        )
      ] }) })
    }
  );
}
export {
  CartReminder as default
};
