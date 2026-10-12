import { jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
function AdminLayout() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-ivory", children: /* @__PURE__ */ jsx(Outlet, {}) });
}
export {
  AdminLayout as default
};
