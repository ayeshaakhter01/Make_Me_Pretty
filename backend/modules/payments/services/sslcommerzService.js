import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import Order from "../../../models/Order.js";
import Payment from "../../../models/Payment.js";
import User from "../../../models/User.js";
import AppError from "../../../utils/AppError.js";

const SANDBOX_BASE_URL = "https://sandbox.sslcommerz.com";
const SESSION_API_URL = `${SANDBOX_BASE_URL}/gwprocess/v4/api.php`;
const VALIDATION_API_URL = `${SANDBOX_BASE_URL}/validator/api/validationserverAPI.php`;
const TRANSACTION_QUERY_URL = `${SANDBOX_BASE_URL}/validator/api/merchantTransIDvalidationAPI.php`;

function parseBaseUrl(value, name, allowLocalHttp = false) {
  let url;
  try { url = new URL(value); } catch { throw new AppError(`${name} must be a valid URL.`, 503); }
  const local = allowLocalHttp && ["localhost", "127.0.0.1"].includes(url.hostname);
  if (!(["https:", "http:"].includes(url.protocol)) || (!local && url.protocol !== "https:") || url.username || url.password) {
    throw new AppError(`${name} must use HTTPS, except for localhost development.`, 503);
  }
  return url.toString().replace(/\/$/, "");
}

function getConfig() {
  const storeId = process.env.SSLCOMMERZ_STORE_ID?.trim();
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD?.trim();
  const apiPublicUrl = process.env.API_PUBLIC_URL?.trim();
  const clientUrl = process.env.CLIENT_URL?.trim();
  if (!storeId || !storePassword || !apiPublicUrl || !clientUrl) {
    throw new AppError("SSLCommerz sandbox is not configured. Set the backend merchant credentials and public callback URLs.", 503);
  }
  if (storeId.length > 30 || storePassword.length > 30) throw new AppError("SSLCommerz sandbox credentials have invalid lengths.", 503);
  const apiBase = parseBaseUrl(apiPublicUrl, "API_PUBLIC_URL");
  const clientBase = parseBaseUrl(clientUrl, "CLIENT_URL", true);
  const callback = (name) => {
    const value = new URL(`/api/payments/sslcommerz/${name}`, `${apiBase}/`).toString();
    if (value.length > 255) throw new AppError("SSLCommerz callback URLs must be 255 characters or fewer.", 503);
    return value;
  };
  return {
    storeId,
    storePassword,
    apiBase,
    clientBase,
    successUrl: callback("success"),
    failUrl: callback("fail"),
    cancelUrl: callback("cancel"),
    ipnUrl: callback("ipn"),
  };
}

export function isSslCommerzConfigured() {
  try { getConfig(); return true; } catch { return false; }
}

export function paymentResultUrl(orderId, result) {
  const { clientBase } = getConfig();
  const url = new URL("/payment-result", `${clientBase}/`);
  if (orderId) url.searchParams.set("orderId", String(orderId));
  url.searchParams.set("result", result);
  return url.toString();
}

const makeGatewayTransactionId = () => `MMP${randomUUID().replaceAll("-", "").slice(0, 27)}`;

async function postSession(fields) {
  let response;
  try {
    response = await fetch(SESSION_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(fields),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error("gateway response error");
    return await response.json();
  } catch {
    throw new AppError("SSLCommerz sandbox could not initialize this payment. The order remains unpaid; retry the same request.", 502);
  }
}

function hostedCheckoutUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "sandbox.sslcommerz.com") throw new Error("invalid host");
    return url.toString();
  } catch {
    throw new AppError("SSLCommerz returned an invalid hosted checkout URL. The order remains unpaid.", 502);
  }
}

function formatAmount(amount) {
  return Number(amount).toFixed(2);
}

function makeSessionFields({ config, order, payment, customer }) {
  const address = order.address || {};
  const productNames = order.items.map((item) => item.name).join(", ").slice(0, 255) || "Make Me Pretty order";
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const customerName = (customer.name || address.recipientName || "Customer").slice(0, 50);
  const email = (customer.email || "").slice(0, 50);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError("A valid account email is required for SSLCommerz checkout.", 400);
  const clean = (value, max = 50) => String(value || "").slice(0, max) || "N/A";
  return {
    store_id: config.storeId,
    store_passwd: config.storePassword,
    total_amount: formatAmount(order.total),
    currency: "BDT",
    tran_id: payment.gatewayTransactionId,
    success_url: config.successUrl,
    fail_url: config.failUrl,
    cancel_url: config.cancelUrl,
    ipn_url: config.ipnUrl,
    cus_name: customerName,
    cus_email: email,
    cus_add1: clean(address.addressLine),
    cus_city: clean(address.city),
    cus_state: clean(address.city),
    cus_postcode: "0000",
    cus_country: "Bangladesh",
    cus_phone: clean(address.phone, 20),
    shipping_method: "YES",
    num_of_item: String(itemCount),
    ship_name: clean(address.recipientName),
    ship_add1: clean(address.addressLine),
    ship_area: clean(address.area),
    ship_city: clean(address.city),
    ship_sub_city: clean(address.area),
    ship_postcode: "0000",
    ship_country: "Bangladesh",
    product_name: productNames,
    product_category: "beauty",
    product_profile: "physical-goods",
    value_a: String(order._id),
    value_b: String(payment._id),
  };
}

function safeAttempt(payment) {
  return { paymentId: payment._id, transactionId: payment.gatewayTransactionId, redirectUrl: payment.gatewayPageUrl };
}

export async function initiateSslCommerzPayment(customerId, orderId, rawIdempotencyKey) {
  const config = getConfig();
  const idempotencyKey = typeof rawIdempotencyKey === "string" ? rawIdempotencyKey.trim() : "";
  if (!/^[A-Za-z0-9._-]{16,100}$/.test(idempotencyKey)) throw new AppError("A valid Idempotency-Key header is required.", 400);

  const order = await Order.findOne({ _id: orderId, customer: customerId });
  if (!order) throw new AppError("Order not found.", 404);
  if (order.paymentMethod !== "sslcommerz") throw new AppError("This order was not placed with SSLCommerz.", 409);
  if (["cancelled", "delivered"].includes(order.status) || ["paid", "refunded"].includes(order.paymentStatus)) throw new AppError("This order is not available for payment.", 409);
  if (!Number.isFinite(order.total) || order.total < 10 || order.total > 500000) throw new AppError("SSLCommerz sandbox payments must be between ৳10 and ৳500,000.", 400);

  const customer = await User.findById(customerId).select("name email").lean();
  if (!customer) throw new AppError("Customer account was not found.", 404);
  // Validate required gateway customer fields before allocating an attempt.
  if (!customer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw new AppError("A valid account email is required for SSLCommerz checkout.", 400);

  const lockToken = randomUUID();
  const lockUntil = new Date(Date.now() + 60000);
  let payment = await Payment.findOne({ order: order._id, idempotencyKey }).select("+gatewayPageUrl +idempotencyKey +gatewayInitializationToken +gatewayInitializationUntil");
  if (payment?.gatewayPageUrl) return safeAttempt(payment);
  if (payment && payment.status !== "pending") throw new AppError("This payment attempt is already complete. Use a new idempotency key to retry.", 409);

  if (payment) {
    const claimed = await Payment.findOneAndUpdate(
      {
        _id: payment._id,
        status: "pending",
        gatewayPageUrl: "",
        $or: [{ gatewayInitializationUntil: null }, { gatewayInitializationUntil: { $lte: new Date() } }],
      },
      { $set: { gatewayInitializationToken: lockToken, gatewayInitializationUntil: lockUntil } },
      { new: true, runValidators: true },
    ).select("+gatewayPageUrl +idempotencyKey +gatewayInitializationToken +gatewayInitializationUntil");
    if (!claimed) {
      const latest = await Payment.findById(payment._id).select("+gatewayPageUrl");
      if (latest?.gatewayPageUrl) return safeAttempt(latest);
      throw new AppError("This payment attempt is already being initialized. Retry shortly with the same key.", 409);
    }
    payment = claimed;
  } else {
    const activeAttempt = await Payment.findOne({ order: order._id, status: "pending" }).select("+gatewayPageUrl");
    if (activeAttempt) {
      if (activeAttempt.gatewayPageUrl) return safeAttempt(activeAttempt);
      throw new AppError("A payment attempt is already being initialized. Retry with its original idempotency key.", 409);
    }
    const attemptNumber = await Payment.countDocuments({ order: order._id }) + 1;
    try {
      payment = await Payment.create({
        order: order._id,
        attemptNumber,
        customer: customerId,
        paymentMethod: "sslcommerz",
        amount: order.total,
        currency: "BDT",
        status: "pending",
        gateway: "sslcommerz",
        gatewayTransactionId: makeGatewayTransactionId(),
        idempotencyKey,
        gatewayInitializationToken: lockToken,
        gatewayInitializationUntil: lockUntil,
      });
      payment = await Payment.findById(payment._id).select("+gatewayPageUrl +idempotencyKey +gatewayInitializationToken +gatewayInitializationUntil");
    } catch (error) {
      if (error?.code !== 11000) throw error;
      const activeAttempt = await Payment.findOne({ order: order._id, status: "pending" }).select("+gatewayPageUrl");
      if (activeAttempt?.gatewayPageUrl) return safeAttempt(activeAttempt);
      throw new AppError("A payment attempt is already being initialized. Retry shortly with the same key.", 409);
    }
  }

  const reset = await Order.updateOne({ _id: order._id, customer: customerId, status: { $nin: ["cancelled", "delivered"] }, paymentStatus: { $in: ["pending", "failed", "cancelled"] } }, { $set: { paymentStatus: "pending" } });
  if (!reset.matchedCount) {
    await Payment.updateOne(
      { _id: payment._id, status: "pending", gatewayInitializationToken: lockToken },
      { $set: { status: "cancelled", gatewayInitializationToken: "", gatewayInitializationUntil: null } },
    );
    throw new AppError("The order payment status changed. Refresh the order and retry.", 409);
  }

  const response = await postSession(makeSessionFields({ config, order, payment, customer }));
  if (!response?.GatewayPageURL) throw new AppError("SSLCommerz sandbox rejected payment initialization. The order remains unpaid; retry the same request.", 502);
  const redirectUrl = hostedCheckoutUrl(response.GatewayPageURL);
  const readyPayment = await Payment.findOneAndUpdate(
    { _id: payment._id, status: "pending", gatewayInitializationToken: lockToken },
    { $set: { gatewayPageUrl: redirectUrl, gatewayInitializationToken: "", gatewayInitializationUntil: null } },
    { new: true, runValidators: true },
  ).select("+gatewayPageUrl");
  if (!readyPayment) throw new AppError("The order or payment changed while checkout was being initialized. Start a new payment attempt if the order is still payable.", 409);
  return safeAttempt(readyPayment);
}

async function requestGatewayStatus({ config, validationId, transactionId }) {
  const url = new URL(validationId ? VALIDATION_API_URL : TRANSACTION_QUERY_URL);
  const params = new URLSearchParams({ store_id: config.storeId, store_passwd: config.storePassword, format: "json" });
  if (validationId) params.set("val_id", validationId);
  else params.set("tran_id", transactionId);
  url.search = params.toString();
  let data;
  try {
    const response = await fetch(url, { method: "GET", signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error("gateway response error");
    data = await response.json();
  } catch {
    throw new AppError("SSLCommerz sandbox could not verify the payment yet.", 502);
  }
  if (data.APIConnect && data.APIConnect !== "DONE") throw new AppError("SSLCommerz could not authenticate the verification request.", 502);
  if (!Array.isArray(data.element)) return data;
  const matching = data.element.filter((item) => item.tran_id === transactionId);
  if (!matching.length) throw new AppError("SSLCommerz did not return this transaction.", 409);
  // SSLCommerz can return multiple channel attempts for one merchant tran_id.
  // A verified success takes precedence; otherwise do not replace a pending
  // attempt with an unrelated earlier failure in the result list.
  return matching.find((item) => ["VALID", "VALIDATED"].includes(String(item.status || "").toUpperCase()))
    || matching.find((item) => String(item.status || "").toUpperCase() === "PENDING")
    || matching.at(-1);
}

function normalizeGatewayStatus(value) {
  const status = String(value || "").toUpperCase();
  if (["VALID", "VALIDATED"].includes(status)) return "paid";
  if (["CANCELLED", "CANCEL"].includes(status)) return "cancelled";
  if (["FAILED", "EXPIRED", "UNATTEMPTED"].includes(status)) return "failed";
  if (status === "PENDING") return "pending";
  return "unknown";
}

function sameBdtAmount(value, expected) {
  const actualAmount = Number(value);
  const expectedAmount = Number(expected);
  return Number.isFinite(actualAmount) && Number.isFinite(expectedAmount)
    && Math.round(actualAmount * 100) === Math.round(expectedAmount * 100);
}

export async function processSslCommerzCallback(payload = {}) {
  const transactionId = typeof payload.tran_id === "string" ? payload.tran_id.trim() : "";
  const validationId = typeof payload.val_id === "string" ? payload.val_id.trim() : "";
  if (!transactionId || transactionId.length > 30) throw new AppError("SSLCommerz transaction reference is missing or invalid.", 400);
  const payment = await Payment.findOne({ gateway: "sslcommerz", gatewayTransactionId: transactionId });
  if (!payment) throw new AppError("SSLCommerz transaction was not found.", 404);

  const config = getConfig();
  const result = await requestGatewayStatus({ config, validationId, transactionId });
  if (result.status === "INVALID_TRANSACTION") throw new AppError("SSLCommerz rejected this validation reference.", 409);
  if (result.tran_id !== transactionId) throw new AppError("SSLCommerz transaction reference did not match.", 409);
  if (validationId && result.val_id !== validationId) throw new AppError("SSLCommerz validation reference did not match.", 409);
  const order = await Order.findById(payment.order);
  if (!order) throw new AppError("The order for this SSLCommerz payment was not found.", 404);
  if (payment.paymentMethod !== "sslcommerz" || payment.gateway !== "sslcommerz" || payment.currency !== "BDT"
    || order.paymentMethod !== "sslcommerz" || String(order.customer) !== String(payment.customer)
    || !sameBdtAmount(order.total, payment.amount)) {
    throw new AppError("The payment attempt does not match its order.", 409);
  }
  // value_a/value_b are documented merchant metadata echoed by SSLCommerz.
  // They bind this transaction to the expected order and payment attempt.
  if (result.value_a !== String(order._id) || result.value_b !== String(payment._id)) {
    throw new AppError("SSLCommerz order or payment reference did not match.", 409);
  }
  const amount = Number(result.amount);
  const currency = String(result.currency_type || "").toUpperCase();
  const settlementCurrency = String(result.currency || "").toUpperCase();
  const currencyAmount = result.currency_amount === undefined ? amount : Number(result.currency_amount);
  if (!Number.isFinite(amount) || !Number.isFinite(currencyAmount)
    || !sameBdtAmount(amount, payment.amount)
    || !sameBdtAmount(currencyAmount, payment.amount)
    || currency !== payment.currency || settlementCurrency !== payment.currency) {
    throw new AppError("SSLCommerz amount or currency did not match this payment.", 409);
  }

  const status = normalizeGatewayStatus(result.status);
  if (status === "unknown") throw new AppError("SSLCommerz returned an unrecognized transaction status.", 502);
  const verifiedAt = new Date();
  const riskLevel = result.risk_level === undefined ? "" : String(result.risk_level);
  if (status === "paid" && !["0", "1"].includes(riskLevel)) throw new AppError("SSLCommerz did not return a valid transaction risk result.", 502);
  if (status === "paid" && !result.val_id) throw new AppError("SSLCommerz did not return a validation ID for this successful transaction.", 502);
  const verificationDetails = {
    verified: true,
    verifiedAt,
    validationId: String(result.val_id || validationId || "").slice(0, 120),
    bankTransactionId: String(result.bank_tran_id || "").slice(0, 120),
    responseCode: String(result.status || "").slice(0, 40),
    riskLevel: ["0", "1"].includes(riskLevel) ? riskLevel : "",
  };

  if (status === "paid" && riskLevel === "1") {
    await Payment.updateOne({ _id: payment._id, status: "pending" }, { $set: { verificationDetails } });
    return { orderId: payment.order, status: order.paymentStatus, riskReviewRequired: true };
  }

  const apply = async (session) => {
    const options = session ? { session } : {};
    const currentPayment = await Payment.findById(payment._id, null, options);
    const currentOrder = await Order.findById(payment.order, null, options);
    if (!currentPayment || !currentOrder) throw new AppError("The verified payment record is no longer available.", 409);
    if (currentPayment.gateway !== "sslcommerz" || currentPayment.paymentMethod !== "sslcommerz"
      || currentPayment.gatewayTransactionId !== transactionId || currentPayment.currency !== "BDT"
      || currentOrder.paymentMethod !== "sslcommerz"
      || String(currentPayment.order) !== String(currentOrder._id)
      || String(currentPayment.customer) !== String(currentOrder.customer)
      || !sameBdtAmount(currentPayment.amount, currentOrder.total)
      || !sameBdtAmount(amount, currentPayment.amount)
      || !sameBdtAmount(currencyAmount, currentPayment.amount)) {
      throw new AppError("The payment attempt changed during verification.", 409);
    }

    // Do not let a late pending/failure callback downgrade an already paid attempt.
    const allowedStatuses = status === "paid" ? { $nin: ["paid", "refunded"] } : "pending";
    const updated = await Payment.findOneAndUpdate(
      { _id: currentPayment._id, status: allowedStatuses },
      { $set: { status, verificationDetails } },
      { new: true, runValidators: true, ...options },
    );
    const finalPayment = updated || await Payment.findById(currentPayment._id, null, options);

    if (finalPayment.status === "paid") {
      await Order.updateOne(
        { _id: currentOrder._id, paymentStatus: { $ne: "refunded" } },
        { $set: { paymentStatus: "paid" } },
        options,
      );
      return { orderId: currentOrder._id, status: "paid", riskReviewRequired: false };
    }

    if (["failed", "cancelled"].includes(finalPayment.status)) {
      const pendingAttempts = await Payment.countDocuments({ order: currentOrder._id, status: "pending" }, options);
      if (!pendingAttempts) {
        await Order.updateOne(
          { _id: currentOrder._id, paymentStatus: { $nin: ["paid", "refunded"] } },
          { $set: { paymentStatus: finalPayment.status } },
          options,
        );
      }
    }
    const latestOrder = await Order.findById(currentOrder._id, null, options);
    return { orderId: currentOrder._id, status: latestOrder.paymentStatus, riskReviewRequired: false };
  };

  let session;
  try {
    session = await mongoose.startSession();
    let resultState;
    await session.withTransaction(async () => { resultState = await apply(session); });
    return resultState;
  } catch (error) {
    const unsupported = error?.code === 20 || error?.codeName === "IllegalOperation"
      || /transaction numbers are only allowed|does not support transactions/i.test(error?.message || "");
    if (!unsupported) throw error;
    // MongoDB standalone deployments do not support multi-document transactions.
    // Each write remains conditional/atomic; IPN retries repair a partial failure.
    return apply(null);
  } finally {
    await session?.endSession();
  }
}
