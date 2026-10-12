import { jsx } from "react/jsx-runtime";
import ComboClient from "@/components/combo/ComboClient.js";
import { useTitle } from "@/lib/useTitle.js";
function ComboPage() {
  useTitle("Combos");
  return /* @__PURE__ */ jsx(ComboClient, {});
}
export {
  ComboPage as default
};
