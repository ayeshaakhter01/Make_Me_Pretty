import { jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import { cx } from "@/lib/utils.js";
function CouponCard({ coupon, onNavigate, compact = false, className }) {
  const isCoupon = coupon.kind === "coupon";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cx(
        "overflow-hidden rounded-2xl border border-line bg-cream text-ink",
        className
      ),
      children: [
        coupon.image ? /* @__PURE__ */ jsx(
          "img",
          {
            src: coupon.image,
            alt: coupon.title,
            className: cx("w-full object-cover", compact ? "h-28" : "h-36")
          }
        ) : /* @__PURE__ */ jsx(
          "div",
          {
            className: cx(
              "flex items-center justify-center bg-gradient-to-br from-pink to-ivory-2",
              compact ? "h-20" : "h-24"
            ),
            children: /* @__PURE__ */ jsx("span", { className: "text-3xl text-rose", children: "\u273F" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "p-4 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "font-serif text-lg leading-snug", children: coupon.title }),
          coupon.text && /* @__PURE__ */ jsx("p", { className: "mx-auto mt-1 max-w-xs text-[13px] leading-relaxed text-ink-soft", children: coupon.text }),
          isCoupon && coupon.code ? /* @__PURE__ */ jsxs("div", { className: "mt-3 inline-flex items-center gap-2 rounded-full border border-dashed border-rose bg-pink-soft px-4 py-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[11px] text-ink-soft", children: "Use code" }),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-sm font-semibold tracking-wide text-rose-deep", children: coupon.code })
          ] }) : coupon.type === "shipping" ? /* @__PURE__ */ jsx("div", { className: "mt-3 inline-block rounded-full bg-pink-soft px-4 py-1.5 text-[12.5px] font-medium text-rose-deep", children: "\u2713 Free delivery" }) : null,
          /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(
            Link,
            {
              href: "/shop",
              onClick: onNavigate,
              className: "inline-block rounded-full bg-rose px-6 py-2 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep",
              children: "Shop now"
            }
          ) })
        ] })
      ]
    }
  );
}
export {
  CouponCard as default
};
