import { jsx } from "react/jsx-runtime";
import { Children, useEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils.js";
function StaggerReveal({
  children,
  className,
  stagger = 120,
  // ms between each card
  threshold = 0.25
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return /* @__PURE__ */ jsx("div", { ref, className, children: Children.map(children, (child, i) => /* @__PURE__ */ jsx(
    "div",
    {
      style: shown ? { animationDelay: `${i * stagger}ms` } : void 0,
      className: cx("opacity-0", shown && "card-rise"),
      children: child
    }
  )) });
}
export {
  StaggerReveal as default
};
