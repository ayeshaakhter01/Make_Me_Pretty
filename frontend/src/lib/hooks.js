import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api.js";
const TTL = 8e3;
const cache = /* @__PURE__ */ new Map();
function peek(path) {
  const hit = cache.get(path);
  return hit && hit.done && Date.now() - hit.at < TTL ? hit.value : void 0;
}
function fetchJson(path, { fresh = false } = {}) {
  const hit = cache.get(path);
  if (!fresh && hit && Date.now() - hit.at < TTL) return hit.promise;
  const promise = apiFetch(path, { cache: "no-store" }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || "Request failed"), { status: res.status });
    return data;
  }).catch((err) => {
    cache.delete(path);
    throw err;
  });
  const entry = { at: Date.now(), promise, done: false, value: void 0 };
  cache.set(path, entry);
  promise.then((value) => {
    entry.value = value;
    entry.done = true;
  }).catch(() => {
  });
  return promise;
}
function useApi(path, select = (d) => d, fallback = null) {
  const [state, setState] = useState(() => {
    const hit = path ? peek(path) : void 0;
    return hit !== void 0 ? { data: select(hit), loading: false, error: null } : { data: fallback, loading: !!path, error: null };
  });
  useEffect(() => {
    if (!path) {
      setState({ data: fallback, loading: false, error: null });
      return;
    }
    let on = true;
    const hit = peek(path);
    if (hit !== void 0) setState({ data: select(hit), loading: false, error: null });
    else setState((s) => ({ ...s, loading: true }));
    fetchJson(path).then((d) => on && setState({ data: select(d), loading: false, error: null })).catch((error) => on && setState({ data: fallback, loading: false, error }));
    return () => {
      on = false;
    };
  }, [path]);
  return state;
}
const useProducts = () => useApi("/api/products", (d) => d.products || [], []);
const useCombos = () => useApi("/api/combos", (d) => d.combos || [], []);
export {
  fetchJson,
  peek,
  useApi,
  useCombos,
  useProducts
};
