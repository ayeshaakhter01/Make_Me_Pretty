import { jsx } from "react/jsx-runtime";
import { Link as RouterLink } from "react-router-dom";
function Link({ href = "#", children, ...props }) {
  const external = /^(https?:|mailto:|tel:|\/\/)/i.test(href) || href.startsWith("#");
  if (external) {
    return /* @__PURE__ */ jsx("a", { href, ...props, children });
  }
  return /* @__PURE__ */ jsx(RouterLink, { to: href, ...props, children });
}
export {
  Link as default
};
