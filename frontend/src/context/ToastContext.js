import { jsx, jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useRef, useState } from "react";
const ToastContext = createContext(null);
function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const showToast = useCallback((message) => {
    setToast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2400);
  }, []);
  return /* @__PURE__ */ jsxs(ToastContext.Provider, { value: { showToast }, children: [
    children,
    toast && /* @__PURE__ */ jsx(
      "div",
      {
        role: "status",
        "aria-live": "polite",
        className: "fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 animate-pop rounded-full bg-ink px-6 py-3 text-sm text-ivory shadow-[0_12px_30px_rgba(0,0,0,.2)]",
        children: toast
      }
    )
  ] });
}
const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
export {
  ToastProvider,
  useToast
};
