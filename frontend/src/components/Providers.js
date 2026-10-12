import { jsx } from "react/jsx-runtime";
import { ToastProvider } from "@/context/ToastContext.js";
import { AuthProvider } from "@/context/AuthContext.js";
import { CartProvider } from "@/context/CartContext.js";
function Providers({ children }) {
  return /* @__PURE__ */ jsx(ToastProvider, { children: /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(CartProvider, { children }) }) });
}
export {
  Providers as default
};
