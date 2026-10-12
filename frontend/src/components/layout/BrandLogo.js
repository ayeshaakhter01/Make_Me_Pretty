import { jsx } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import { useSettings } from "@/context/SettingsContext.js";
import { cx } from "@/lib/utils.js";

// ====== এখানে লোগোর ফাইল আর সাইজ বদলাবে ======
const LOGO_FALLBACK = "images/logo1.png";
// h-8 = ছোট, h-10, h-12, h-14, h-16, h-20 = বড়
const LOGO_HEIGHT = { sm: "h-[50px]", md: "h-[50px]", lg: "h-[50px]" };
// ==============================================

function BrandLogo({ href = "/", size = "md", className }) {
  const { branding } = useSettings();
  return /* @__PURE__ */ jsx(Link, { href, "aria-label": branding.name, className: cx("flex items-center", className), children: /* @__PURE__ */ jsx(
    "img",
    {
      src: branding.logo || LOGO_FALLBACK,
      alt: branding.name,
      className: cx(LOGO_HEIGHT[size] || LOGO_HEIGHT.md, "w-auto max-w-none shrink-0 object-contain")
    }
  ) });
}
export {
  BrandLogo as default
};