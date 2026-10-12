import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import Link from "@/components/ui/Link.js";
import { CATEGORIES } from "@/data/categories.js";
import BrandLogo from "@/components/layout/BrandLogo.js";
import MegaMenu from "@/components/layout/MegaMenu.js";
import SearchBar from "@/components/layout/SearchBar.js";
import CartIcon from "@/components/layout/CartIcon.js";
import WishlistIcon from "@/components/layout/WishlistIcon.js";
import AccountMenu from "@/components/layout/AccountMenu.js";
import MobileNav from "@/components/layout/MobileNav.js";
import { cx, categoryHref } from "@/lib/utils.js";

// ====== Navbar-এর উচ্চতা এখানে বদলাবে (phone | desktop) ======
const NAVBAR_HEIGHT = "h-16";
// ============================================================

function Navbar() {
  const [activeCat, setActiveCat] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const openCat = (name) => {
    clearTimeout(closeTimer.current);
    setActiveCat(name);
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveCat(null), 200);
  };
  const closeNow = () => {
    clearTimeout(closeTimer.current);
    setActiveCat(null);
  };
  const active = CATEGORIES.find((c) => c.name === activeCat);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "header",
      {
        className: cx(
          "sticky top-0 z-[90] border-b border-line bg-ivory/90 backdrop-blur-md transition-shadow duration-300",
          scrolled && "shadow-[0_14px_36px_-18px_rgba(59,48,44,0.3)]"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: cx("relative flex w-full items-center gap-4 px-3 lg:px-5", NAVBAR_HEIGHT), children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setMobileOpen(true),
                  "aria-label": "Open menu",
                  className: "flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full border-[1.5px] border-rose/40 text-rose transition-colors hover:border-rose hover:bg-pink-soft md:hidden",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "h-[1.5px] w-4 bg-current" }),
                    /* @__PURE__ */ jsx("span", { className: "h-[1.5px] w-4 bg-current" }),
                    /* @__PURE__ */ jsx("span", { className: "h-[1.5px] w-4 bg-current" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsx(BrandLogo, {}) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 -translate-x-1/2 md:hidden", children: /* @__PURE__ */ jsx(BrandLogo, { size: "sm" }) }),
            /* @__PURE__ */ jsxs(
              "nav",
              {
                className: "hidden items-center gap-4 whitespace-nowrap md:flex lg:ml-4 lg:gap-5",
                onMouseLeave: scheduleClose,
                children: [
                  CATEGORIES.map((cat) => /* @__PURE__ */ jsx("div", { className: "static", children: /* @__PURE__ */ jsx(
                    Link,
                    {
                      href: categoryHref(cat.name),
                      onMouseEnter: () => openCat(cat.name),
                      onFocus: () => openCat(cat.name),
                      className: cx(
                        "border-b-[1.5px] py-1 text-sm tracking-[0.03em] transition-colors",
                        activeCat === cat.name ? "border-rose text-ink" : "border-transparent text-ink hover:border-rose"
                      ),
                      children: cat.name
                    }
                  ) }, cat.name)),
                  /* @__PURE__ */ jsx(
                    Link,
                    {
                      href: "/combo",
                      onMouseEnter: closeNow,
                      className: "border-b-[1.5px] border-transparent py-1 text-sm tracking-[0.03em] text-ink transition-colors hover:border-rose",
                      children: "Combo"
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    Link,
                    {
                      href: "/offers",
                      onMouseEnter: closeNow,
                      className: "flex items-center gap-1.5 rounded-full bg-gold-soft px-4 py-1.5 text-sm font-semibold text-[#8A6A2F] transition-colors hover:bg-gold hover:text-white",
                      children: [
                        "Offers ",
                        /* @__PURE__ */ jsx("span", { className: "text-[11px]", children: "\u2726" })
                      ]
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-1 items-center justify-end gap-3 sm:gap-5", children: [
              /* @__PURE__ */ jsx("div", { className: "hidden flex-1 xl:block xl:max-w-[800px]", children: /* @__PURE__ */ jsx(SearchBar, { compact: true }) }),
              /* @__PURE__ */ jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsx(WishlistIcon, {}) }),
              /* @__PURE__ */ jsx(CartIcon, {}),
              /* @__PURE__ */ jsx(AccountMenu, {})
            ] }),
            active && /* @__PURE__ */ jsx(
              "div",
              {
                className: "absolute inset-x-0 top-full hidden md:block",
                onMouseEnter: () => openCat(active.name),
                onMouseLeave: scheduleClose,
                children: /* @__PURE__ */ jsx(MegaMenu, { category: active, onNavigate: closeNow })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "border-t border-line px-5 py-2.5 xl:hidden", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-[1200px]", children: /* @__PURE__ */ jsx(SearchBar, { compact: true }) }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx(MobileNav, { open: mobileOpen, onClose: () => setMobileOpen(false) })
  ] });
}
export {
  Navbar as default
};