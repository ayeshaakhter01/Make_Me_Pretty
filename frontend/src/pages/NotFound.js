import { jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import { useTitle } from "@/lib/useTitle.js";
import ProductPlaceholder from "@/components/ui/ProductPlaceholder.js";
function NotFound() {
  useTitle("Page not found");
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center bg-ivory px-5 text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "animate-floaty", children: /* @__PURE__ */ jsx(ProductPlaceholder, { shape: "dropper", c1: "#F6DEE3", c2: "#DBA8B1", size: 1.1 }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-2 font-serif text-[64px] leading-none text-rose", children: "404" }),
    /* @__PURE__ */ jsx("h1", { className: "mt-3 font-serif text-[28px] font-normal", children: "This page slipped away" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-sm text-ink-soft", children: "The page you\u2019re looking for doesn\u2019t exist or has moved. Let\u2019s get your ritual back on track." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-7 flex flex-wrap justify-center gap-3", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: "/",
          className: "rounded-full bg-rose px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-rose-deep",
          children: "Back to home"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: "/shop",
          className: "rounded-full border-[1.5px] border-ink px-7 py-3.5 text-sm transition-colors hover:bg-ink hover:text-ivory",
          children: "Shop the collection"
        }
      )
    ] })
  ] });
}
export {
  NotFound as default
};
