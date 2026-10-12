import { jsx } from "react/jsx-runtime";
import AdminGuard from "@/components/admin/AdminGuard.js";
import AdminDashboard from "@/components/admin/AdminDashboard.js";
function AdminPage() {
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsx(AdminDashboard, {}) });
}
export {
  AdminPage as default
};
