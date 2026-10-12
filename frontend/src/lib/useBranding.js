import { apiFetch } from "@/lib/api.js";
import { useEffect, useState } from "react";
const FALLBACK = {
  logo: "",
  name: "Make Me Pretty",
  tagline: "we wanna make you pretty",
  story: ""
};
function useBranding() {
  const [branding, setBranding] = useState(FALLBACK);
  useEffect(() => {
    let on = true;
    apiFetch("/api/settings", { cache: "no-store" }).then((r) => r.json()).then((d) => {
      if (on && d.settings?.branding)
        setBranding({ ...FALLBACK, ...d.settings.branding });
    }).catch(() => {
    });
    return () => {
      on = false;
    };
  }, []);
  return branding;
}
export {
  useBranding
};
