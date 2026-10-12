const PAYMENTS = [
  { id: "bkash", name: "bKash", note: "Pay with your bKash wallet", icon: "b", color: "#E2136E" },
  { id: "nagad", name: "Nagad", note: "Pay with your Nagad wallet", icon: "N", color: "#F6921E" },
  { id: "card", name: "Card / Net Banking", note: "Visa, Mastercard via SSLCommerz", icon: "\u{1F4B3}", color: "#5B6E8C" },
  { id: "cod", name: "Cash on Delivery", note: "Pay when your order arrives", icon: "\u09F3", color: "#8A6A2F" }
];
const getPaymentName = (id) => PAYMENTS.find((p) => p.id === id)?.name || id;
export {
  PAYMENTS,
  getPaymentName
};
