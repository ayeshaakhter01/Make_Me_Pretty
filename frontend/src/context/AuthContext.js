import { jsx } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const res = await apiFetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setHydrated(true);
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const signIn = useCallback(async (email, password) => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };
    setUser(data.user);
    return { ok: true, user: data.user };
  }, []);
  const signUp = useCallback(async (name, email, password, phone) => {
    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone })
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };
    setUser(data.user);
    return { ok: true, user: data.user };
  }, []);
  const adminSignIn = useCallback(
    async (email, password) => {
      const res = await signIn(email, password);
      if (!res.ok) return res;
      if (res.user.role !== "admin") {
        await apiFetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        return { ok: false, error: "This account does not have admin access." };
      }
      return res;
    },
    [signIn]
  );
  const signOut = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);
  const value = {
    user,
    hydrated,
    isAuthed: !!user,
    isAdmin: user?.role === "admin",
    signIn,
    signUp,
    adminSignIn,
    signOut,
    refresh
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value, children });
}
const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
export {
  AuthProvider,
  useAuth
};
