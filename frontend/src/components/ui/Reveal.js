import { jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils.js";
function Reveal({ children, delay = 0, className, as: Tag = "div" }) {
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return /* @__PURE__ */ jsx(
    Tag,
    {
      ref,
      style: { transitionDelay: `${delay}ms` },
      className: cx(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
        className
      ),
      children
    }
  );
}
export {
  Reveal as default
};
