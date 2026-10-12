import { jsx } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext.js";
function AdminGuard({ children }) {
  const { isAdmin, hydrated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (hydrated && !isAdmin) navigate("/admin/login", { replace: true });
  }, [hydrated, isAdmin, navigate]);
  if (!hydrated || !isAdmin) {
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-ivory", children: /* @__PURE__ */ jsx("div", { className: "text-sm text-ink-soft", children: "Checking access\u2026" }) });
  }
  return children;
}
export {
  AdminGuard as default
};
