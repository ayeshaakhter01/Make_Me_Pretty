import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import StoreLayout from "@/pages/store/StoreLayout.js";
import StoreLoading from "@/pages/store/StoreLoading.js";
import Home from "@/pages/store/Home.js";
import Shop from "@/pages/store/Shop.js";
import SkinCare from "@/pages/store/SkinCare.js";
import BodyCare from "@/pages/store/BodyCare.js";
import HairCare from "@/pages/store/HairCare.js";
import Makeup from "@/pages/store/Makeup.js";
import Offers from "@/pages/store/Offers.js";
import Brands from "@/pages/store/Brands.js";
import Product from "@/pages/store/Product.js";
import ContentPage from "@/pages/store/ContentPage.js";
import Combos from "@/pages/store/Combos.js";
import ComboDetail from "@/pages/store/ComboDetail.js";
import Track from "@/pages/store/Track.js";
import Account from "@/pages/store/Account.js";
import Cart from "@/pages/store/Cart.js";
import Checkout from "@/pages/store/Checkout.js";
import Wishlist from "@/pages/store/Wishlist.js";
import NotFound from "@/pages/NotFound.js";
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout.js"));
const AdminPage = lazy(() => import("@/pages/admin/AdminPage.js"));
const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage.js"));
const Pay = lazy(() => import("@/pages/Pay.js"));
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
function App() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(ScrollToTop, {}),
    /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(StoreLoading, {}), children: /* @__PURE__ */ jsxs(Routes, { children: [
      /* @__PURE__ */ jsxs(Route, { element: /* @__PURE__ */ jsx(StoreLayout, {}), children: [
        /* @__PURE__ */ jsx(Route, { index: true, element: /* @__PURE__ */ jsx(Home, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "shop", element: /* @__PURE__ */ jsx(Shop, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "skincare", element: /* @__PURE__ */ jsx(SkinCare, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "bodycare", element: /* @__PURE__ */ jsx(BodyCare, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "haircare", element: /* @__PURE__ */ jsx(HairCare, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "makeup", element: /* @__PURE__ */ jsx(Makeup, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "offers", element: /* @__PURE__ */ jsx(Offers, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "brands", element: /* @__PURE__ */ jsx(Brands, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "product/:id", element: /* @__PURE__ */ jsx(Product, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "p/:slug", element: /* @__PURE__ */ jsx(ContentPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "combo", element: /* @__PURE__ */ jsx(Combos, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "combo/:id", element: /* @__PURE__ */ jsx(ComboDetail, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "cart", element: /* @__PURE__ */ jsx(Cart, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "checkout", element: /* @__PURE__ */ jsx(Checkout, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "account", element: /* @__PURE__ */ jsx(Account, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "track", element: /* @__PURE__ */ jsx(Track, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "wishlist", element: /* @__PURE__ */ jsx(Wishlist, {}) })
      ] }),
      /* @__PURE__ */ jsxs(Route, { path: "admin", element: /* @__PURE__ */ jsx(AdminLayout, {}), children: [
        /* @__PURE__ */ jsx(Route, { index: true, element: /* @__PURE__ */ jsx(AdminPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "login", element: /* @__PURE__ */ jsx(AdminLoginPage, {}) })
      ] }),
      /* @__PURE__ */ jsx(Route, { path: "pay/:id", element: /* @__PURE__ */ jsx(Pay, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "*", element: /* @__PURE__ */ jsx(NotFound, {}) })
    ] }) })
  ] });
}
export {
  App as default
};
