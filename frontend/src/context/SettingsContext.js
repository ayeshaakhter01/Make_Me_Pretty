import { jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/hooks.js";
import { HELP_PAGES, POLICY_PAGES } from "@/data/footer.js";
const CACHE_KEY = "mmp_settings_v1";
const linksFor = (list) => list.map((p) => ({ slug: p.slug, label: p.label }));
const DEFAULTS = {
  freeDeliveryThreshold: 2e3,
  branding: {
    logo: "",
    name: "Make Me Pretty",
    tagline: "we wanna make you pretty",
    story: ""
  },
  coupons: [],
  footer: {
    paymentLogos: [],
    brandLogos: [],
    social: {},
    help: linksFor(HELP_PAGES),
    policy: linksFor(POLICY_PAGES)
  },
  loaded: false
};
const SettingsContext = createContext(DEFAULTS);
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw), loaded: false } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}
function build(settings = {}, coupons = [], footer = {}) {
  return {
    freeDeliveryThreshold: Number(settings.freeDeliveryThreshold) || 2e3,
    branding: {
      logo: settings.branding?.logo || "",
      name: settings.branding?.name || DEFAULTS.branding.name,
      tagline: settings.branding?.tagline || DEFAULTS.branding.tagline,
      story: settings.branding?.story || ""
    },
    coupons,
    footer: {
      paymentLogos: footer.paymentLogos || [],
      brandLogos: footer.brandLogos || [],
      social: footer.social || settings.footer?.social || {},
      help: footer.help?.length ? footer.help : DEFAULTS.footer.help,
      policy: footer.policy?.length ? footer.policy : DEFAULTS.footer.policy
    },
    loaded: true
  };
}
function SettingsProvider({ children }) {
  const [value, setValue] = useState(readCache);
  useEffect(() => {
    let on = true;
    const load = () => Promise.all([
      fetchJson("/api/settings"),
      fetchJson("/api/coupons"),
      fetchJson("/api/footer")
    ]).then(([s, c, f]) => {
      if (!on) return;
      const next = build(s.settings, c.coupons || [], f);
      setValue(next);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      } catch {
      }
    }).catch(() => {
    });
    load();
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      on = false;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  const memo = useMemo(() => value, [value]);
  return /* @__PURE__ */ jsx(SettingsContext.Provider, { value: memo, children });
}
const useSettings = () => useContext(SettingsContext);
export {
  SettingsProvider,
  useSettings
};
