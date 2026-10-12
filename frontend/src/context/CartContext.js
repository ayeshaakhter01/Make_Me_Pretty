import { jsx } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useToast } from "@/context/ToastContext.js";
import { useAuth } from "@/context/AuthContext.js";
const CartContext = createContext(null);
const CART_KEY = "mmp_cart";
const WISH_KEY = "mmp_wishlist";
function CartProvider({ children }) {
  const { showToast } = useToast();
  const { user, hydrated: authHydrated } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [returningCartCount, setReturningCartCount] = useState(0);
  const modeRef = useRef("guest");
  const syncedUserRef = useRef(null);
  const cartTimer = useRef(null);
  const wishTimer = useRef(null);
  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      const w = JSON.parse(localStorage.getItem(WISH_KEY) || "[]");
      if (Array.isArray(c)) setCart(c);
      if (Array.isArray(w)) setWishlist(w);
    } catch {
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!authHydrated || !hydrated) return;
    if (user && syncedUserRef.current !== user.id) {
      syncedUserRef.current = user.id;
      modeRef.current = "user";
      (async () => {
        try {
          const [cRes, wRes] = await Promise.all([
            apiFetch("/api/cart", { cache: "no-store" }),
            apiFetch("/api/wishlist", { cache: "no-store" })
          ]);
          const serverCart = (await cRes.json()).items || [];
          const serverWish = (await wRes.json()).productIds || [];
          setReturningCartCount(serverCart.length);
          setCart((guest) => mergeCarts(serverCart, guest));
          setWishlist((guest) => [.../* @__PURE__ */ new Set([...serverWish, ...guest])]);
          localStorage.removeItem(CART_KEY);
          localStorage.removeItem(WISH_KEY);
        } catch {
          modeRef.current = "user";
        }
      })();
    }
    if (!user && modeRef.current === "user") {
      modeRef.current = "guest";
      syncedUserRef.current = null;
      setReturningCartCount(0);
      setCart([]);
      setWishlist([]);
    }
  }, [user, authHydrated, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    if (modeRef.current === "guest") {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } else {
      clearTimeout(cartTimer.current);
      cartTimer.current = setTimeout(() => {
        apiFetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cart })
        }).catch(() => {
        });
      }, 500);
    }
  }, [cart, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    if (modeRef.current === "guest") {
      localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
    } else {
      clearTimeout(wishTimer.current);
      wishTimer.current = setTimeout(() => {
        apiFetch("/api/wishlist", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds: wishlist })
        }).catch(() => {
        });
      }, 500);
    }
  }, [wishlist, hydrated]);
  const addToCart = useCallback(
    (product, qty = 1) => {
      setCart((c) => {
        const existing = c.find((i) => i.id === product.id);
        if (existing) {
          return c.map(
            (i) => i.id === product.id ? { ...i, qty: i.qty + qty } : i
          );
        }
        const { id, name, price, shape, c1, c2 } = product;
        return [...c, { id, name, price, shape, c1, c2, qty }];
      });
      showToast(`\u2713 ${product.name} added to your bag`);
    },
    [showToast]
  );
  const setQty = useCallback((id, qty) => {
    setCart(
      (c) => qty <= 0 ? c.filter((i) => i.id !== id) : c.map((i) => i.id === id ? { ...i, qty } : i)
    );
  }, []);
  const removeFromCart = useCallback((id) => {
    setCart((c) => c.filter((i) => i.id !== id));
  }, []);
  const clearCart = useCallback(() => setCart([]), []);
  const toggleWishlist = useCallback(
    (id) => {
      setWishlist((w) => {
        const has = w.includes(id);
        showToast(has ? "Removed from wishlist" : "\u2665 Saved to wishlist");
        return has ? w.filter((x) => x !== id) : [...w, id];
      });
    },
    [showToast]
  );
  const isWished = useCallback((id) => wishlist.includes(id), [wishlist]);
  const { count, subtotal } = useMemo(
    () => cart.reduce(
      (acc, i) => {
        acc.count += i.qty;
        acc.subtotal += i.price * i.qty;
        return acc;
      },
      { count: 0, subtotal: 0 }
    ),
    [cart]
  );
  const value = {
    cart,
    wishlist,
    hydrated,
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isWished,
    count,
    subtotal,
    returningCartCount
  };
  return /* @__PURE__ */ jsx(CartContext.Provider, { value, children });
}
function mergeCarts(server, guest) {
  const map = /* @__PURE__ */ new Map();
  for (const i of server) map.set(i.id, { ...i });
  for (const i of guest) {
    const ex = map.get(i.id);
    if (ex) ex.qty += i.qty;
    else map.set(i.id, { ...i });
  }
  return [...map.values()];
}
const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
export {
  CartProvider,
  useCart
};
