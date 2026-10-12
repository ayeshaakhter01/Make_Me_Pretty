import { jsx } from "react/jsx-runtime";
import TrackClient from "@/components/track/TrackClient.js";
import { useTitle } from "@/lib/useTitle.js";
function TrackPage() {
  useTitle("Track Order");
  return /* @__PURE__ */ jsx(TrackClient, {});
}
export {
  TrackPage as default
};
