import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Outlet, useLocation } from "react-router-dom";
import OffersBar from "@/components/layout/OffersBar.js";
import Navbar from "@/components/layout/Navbar.js";
import Footer from "@/components/layout/Footer.js";
import CartDrawer from "@/components/cart/CartDrawer.js";
import CartReminder from "@/components/cart/CartReminder.js";
import WelcomePromo from "@/components/promo/WelcomePromo.js";
import LiquidBackground from "@/components/hero/LiquidBackground.js";
import { SettingsProvider, useSettings } from "@/context/SettingsContext.js";
import StoreTemplate from "@/pages/store/StoreTemplate.js";
function Chrome() {
  const { pathname } = useLocation();
  const { coupons, branding, footer } = useSettings();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none fixed inset-0 -z-10", "aria-hidden": true, children: /* @__PURE__ */ jsx(LiquidBackground, {}) }),
    /* @__PURE__ */ jsx(OffersBar, { coupons }),
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx("main", { className: "min-h-[60vh]", children: /* @__PURE__ */ jsx(StoreTemplate, { children: /* @__PURE__ */ jsx(Outlet, {}) }, pathname) }),
    /* @__PURE__ */ jsx(Footer, { branding, footer }),
    /* @__PURE__ */ jsx(CartDrawer, {}),
    /* @__PURE__ */ jsx(CartReminder, {}),
    /* @__PURE__ */ jsx(WelcomePromo, { coupons })
  ] });
}
function StoreLayout() {
  return /* @__PURE__ */ jsx(SettingsProvider, { children: /* @__PURE__ */ jsx(Chrome, {}) });
}
export {
  StoreLayout as default
};
