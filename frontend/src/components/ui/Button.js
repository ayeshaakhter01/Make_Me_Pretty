import { jsx } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import { cx } from "@/lib/utils.js";
const VARIANTS = {
  rose: "bg-rose text-white hover:bg-rose-deep hover:-translate-y-0.5 hover:shadow-rose",
  ghost: "bg-transparent text-ink border-[1.5px] border-ink hover:bg-ink hover:text-ivory",
  pink: "bg-pink text-rose-deep hover:bg-pink/80",
  dark: "bg-ink text-ivory hover:bg-ink/90 hover:-translate-y-0.5"
};
const SIZES = {
  sm: "px-5 py-2.5 text-[13px]",
  md: "px-7 py-3.5 text-sm",
  lg: "px-8 py-4 text-[15px]"
};
function Button({
  variant = "rose",
  size = "md",
  href,
  className,
  children,
  ...props
}) {
  const classes = cx(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[0.04em] transition-all duration-300 ease-out active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none",
    VARIANTS[variant],
    SIZES[size],
    className
  );
  if (href) {
    return /* @__PURE__ */ jsx(Link, { href, className: classes, ...props, children });
  }
  return /* @__PURE__ */ jsx("button", { className: classes, ...props, children });
}
export {
  Button as default
};
