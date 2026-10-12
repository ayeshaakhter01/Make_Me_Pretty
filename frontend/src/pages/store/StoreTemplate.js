import { jsx } from "react/jsx-runtime";
import { useState } from "react";
function StoreTemplate({ children }) {
  const [entered, setEntered] = useState(false);
  return /* @__PURE__ */ jsx(
    "div",
    {
      onAnimationEnd: (e) => {
        if (e.target === e.currentTarget) setEntered(true);
      },
      className: entered ? void 0 : "animate-fadeup [animation-duration:500ms] motion-reduce:animate-none",
      children
    }
  );
}
export {
  StoreTemplate as default
};
