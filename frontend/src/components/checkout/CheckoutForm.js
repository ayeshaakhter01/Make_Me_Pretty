import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext.js";
import { useAuth } from "@/context/AuthContext.js";
import { useSettings } from "@/context/SettingsContext.js";
import { validBdPhone } from "@/lib/utils.js";
import DistrictThanaFields from "@/components/checkout/DistrictThanaFields.js";
import SavedAddressPicker from "@/components/checkout/SavedAddressPicker.js";
import PaymentOptions from "@/components/checkout/PaymentOptions.js";
import OrderSummary from "@/components/checkout/OrderSummary.js";
import CouponField from "@/components/checkout/CouponField.js";
import Button from "@/components/ui/Button.js";
function CheckoutForm() {
  const navigate = useNavigate();
  const { cart, subtotal, clearCart } = useCart();
  const { user, isAuthed } = useAuth();
  const { freeDeliveryThreshold } = useSettings();
  const [f, setF] = useState({
    name: user?.name || "",
    phone: "",
    email: user?.email || "",
    district: "Dhaka",
    thana: "",
    address: "",
    pay: "bkash"
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState(null);
  const [selectedId, setSelectedId] = useState("new");
  useEffect(() => {
    if (!isAuthed) {
      setSavedAddresses([]);
      setSelectedId("new");
      return;
    }
    let active = true;
    apiFetch("/api/account/addresses", { cache: "no-store" }).then((r) => r.json()).then((d) => {
      if (!active) return;
      const list = d.addresses || [];
      setSavedAddresses(list);
      if (list.length) {
        const def = list.find((a) => a.isDefault) || list[0];
        setSelectedId(def.id);
      } else {
        setSelectedId("new");
      }
    }).catch(() => active && setSavedAddresses([]));
    return () => {
      active = false;
    };
  }, [isAuthed]);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponErr, setCouponErr] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const set = (key, value) => setF((prev) => ({ ...prev, [key]: value }));
  const onField = (e) => set(e.target.name, e.target.value);
  const usingManual = selectedId === "new";
  const selectedAddr = !usingManual && savedAddresses ? savedAddresses.find((a) => a.id === selectedId) : null;
  const shipDistrict = usingManual ? f.district : selectedAddr?.district || "Dhaka";
  const discount = coupon?.type === "percent" ? Math.round(subtotal * coupon.value / 100) : 0;
  const freeShip = coupon?.type === "shipping";
  const qualifiesFree = freeShip || subtotal - discount >= freeDeliveryThreshold;
  const shipping = qualifiesFree ? 0 : shipDistrict === "Dhaka" ? 60 : 120;
  const applyCoupon = async () => {
    setCouponErr("");
    setCouponBusy(true);
    try {
      const res = await apiFetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setCoupon(null);
        setCouponErr(data.error || "Invalid coupon.");
      } else {
        setCoupon(data.coupon);
      }
    } catch {
      setCouponErr("Couldn\u2019t check that coupon. Try again.");
    } finally {
      setCouponBusy(false);
    }
  };
  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput("");
    setCouponErr("");
  };
  const buildCustomer = () => {
    if (usingManual) {
      return {
        name: f.name,
        phone: f.phone,
        email: f.email,
        district: f.district,
        thana: f.thana,
        address: f.address,
        division: "",
        street: f.address,
        landmark: "",
        country: "Bangladesh",
        label: ""
      };
    }
    const a = selectedAddr;
    return {
      name: a.fullName,
      phone: a.phone,
      email: f.email || user?.email || "",
      district: a.district,
      thana: a.area,
      address: [a.street, a.landmark].filter(Boolean).join(" \xB7 "),
      division: a.division,
      street: a.street,
      landmark: a.landmark,
      country: a.country,
      label: a.label
    };
  };
  const submit = async (e) => {
    e.preventDefault();
    if (usingManual) {
      if (!f.name || !f.phone || !f.thana || !f.address) {
        setErr("Please fill in your name, phone, thana, and full address to continue.");
        return;
      }
      if (!validBdPhone(f.phone)) {
        setErr("Enter a valid 11-digit Bangladeshi mobile number (starts with 01).");
        return;
      }
    } else if (!selectedAddr) {
      setErr("Please choose a delivery address.");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const res = await apiFetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: buildCustomer(),
          items: cart.map((i) => ({ id: i.id, qty: i.qty })),
          method: f.pay,
          couponCode: coupon?.code || null
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "We couldn\u2019t place your order. Please try again.");
        setBusy(false);
        return;
      }
      clearCart();
      if (data.requiresRedirect && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        navigate(`/track?id=${data.order.id}&placed=1`);
      }
    } catch {
      setErr("Network error. Please check your connection and try again.");
      setBusy(false);
    }
  };
  const hasSaved = savedAddresses && savedAddresses.length > 0;
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "grid gap-8 md:grid-cols-[1.5fr_1fr]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-5", children: [
      /* @__PURE__ */ jsxs("section", { className: "rounded-card border border-line bg-cream p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-4 font-serif text-xl", children: "1 \xB7 Contact & Delivery" }),
        hasSaved && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "Deliver to" }),
          /* @__PURE__ */ jsx(
            SavedAddressPicker,
            {
              addresses: savedAddresses,
              selectedId,
              onSelect: setSelectedId
            }
          )
        ] }),
        (usingManual || !hasSaved) && /* @__PURE__ */ jsxs("div", { className: "grid gap-3.5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "field-label", children: "Full name" }),
            /* @__PURE__ */ jsx("input", { name: "name", value: f.name, onChange: onField, placeholder: "Ayesha Rahman" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Mobile number" }),
              /* @__PURE__ */ jsx("input", { name: "phone", value: f.phone, onChange: onField, placeholder: "01XXXXXXXXX", inputMode: "numeric" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Email (optional)" }),
              /* @__PURE__ */ jsx("input", { name: "email", value: f.email, onChange: onField, placeholder: "you@email.com" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(DistrictThanaFields, { values: f, onChange: set }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "field-label", children: "Full address" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                name: "address",
                rows: 2,
                value: f.address,
                onChange: onField,
                placeholder: "House, road, area\u2026"
              }
            )
          ] }),
          isAuthed && hasSaved && /* @__PURE__ */ jsxs("p", { className: "text-xs text-ink-soft", children: [
            "Tip: save addresses in your",
            " ",
            /* @__PURE__ */ jsx("a", { href: "#/account?tab=addresses", className: "text-rose hover:underline", children: "profile" }),
            " ",
            "to check out faster next time."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-card border border-line bg-cream p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-4 font-serif text-xl", children: "2 \xB7 Payment" }),
        /* @__PURE__ */ jsx(PaymentOptions, { selected: f.pay, onSelect: (id) => set("pay", id) }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-ink-soft", children: "Demo store: payment is simulated \u2014 no real charge. In production this redirects to the gateway\u2019s secure hosted checkout." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(
      OrderSummary,
      {
        cart,
        shipping,
        district: shipDistrict,
        discount,
        couponSlot: /* @__PURE__ */ jsx(
          CouponField,
          {
            value: couponInput,
            onChange: setCouponInput,
            onApply: applyCoupon,
            onRemove: removeCoupon,
            applied: coupon,
            error: couponErr,
            busy: couponBusy
          }
        ),
        children: [
          err && /* @__PURE__ */ jsx("div", { className: "mt-3 rounded-xl bg-lowstock-bg px-3.5 py-2.5 text-[13px] text-lowstock-text", children: err }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: busy, className: "mt-4 w-full", children: busy ? "Processing payment\u2026" : "Place Order" })
        ]
      }
    ) })
  ] });
}
export {
  CheckoutForm as default
};
