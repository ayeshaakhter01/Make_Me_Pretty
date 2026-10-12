import { jsx } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import { useSettings } from "@/context/SettingsContext.js";
import { cx } from "@/lib/utils.js";
function BrandLogo({ href = "/", size = "md", className }) {
  const { branding } = useSettings();
  const h = size === "lg" ? "h-12" : size === "sm" ? "h-8" : "h-10";
  return /* @__PURE__ */ jsx(Link, { href, "aria-label": branding.name, className: cx("flex items-center", className), children: branding.logo ? /* @__PURE__ */ jsx(
    "img",
    {
      src: branding.logo,
      alt: branding.name,
      className: cx(h, "w-auto max-w-[190px] object-contain")
    }
  ) : /* @__PURE__ */ jsx(
    "span",
    {
      className: cx(
        "font-serif font-medium tracking-brand text-ink",
        size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl"
      ),
      children: branding.name
    }
  ) });
}
export {
  BrandLogo as default
};
