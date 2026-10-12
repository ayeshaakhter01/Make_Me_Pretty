const API_BASE = (window.MMP_CONFIG?.API_URL || "").replace(/\/+$/, "");
const apiUrl = (path) => `${API_BASE}${path}`;
const UPLOAD_PREFIX = "/api/uploads/";
const assetUrl = (src) => API_BASE && typeof src === "string" && src.startsWith(UPLOAD_PREFIX) ? API_BASE + src : src;
function absolutize(value) {
  if (!API_BASE) return value;
  if (typeof value === "string") return assetUrl(value);
  if (Array.isArray(value)) return value.map(absolutize);
  if (value && typeof value === "object") {
    const out = {};
    for (const k of Object.keys(value)) out[k] = absolutize(value[k]);
    return out;
  }
  return value;
}
async function apiFetch(path, options = {}) {
  if (window.MMP_CONFIG?.DEMO) {
    const { demoFetch } = await import("@/lib/demo-api.js");
    return demoFetch(path, options);
  }
  const opts = { credentials: "include", ...options };
  if (API_BASE && typeof opts.body === "string") {
    opts.body = opts.body.split(API_BASE + UPLOAD_PREFIX).join(UPLOAD_PREFIX);
  }
  const res = await fetch(apiUrl(path), opts);
  if (API_BASE) {
    const json = res.json.bind(res);
    res.json = async () => absolutize(await json());
  }
  return res;
}
var api_default = apiFetch;
export {
  API_BASE,
  apiFetch,
  apiUrl,
  assetUrl,
  api_default as default
};
