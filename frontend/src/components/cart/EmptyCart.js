import { jsx } from "react/jsx-runtime";
import Button from "@/components/ui/Button.js";
import EmptyState from "@/components/ui/EmptyState.js";
function EmptyCart({ onBrowse }) {
  return /* @__PURE__ */ jsx(
    EmptyState,
    {
      icon: "\u{1F6CD}",
      title: "Your bag is feeling light",
      message: "Add something your skin will thank you for.",
      children: /* @__PURE__ */ jsx(Button, { href: "/shop", size: "sm", onClick: onBrowse, children: "Browse products" })
    }
  );
}
export {
  EmptyCart as default
};
