import express from "express";
import Payment from "../../../models/Payment.js";
import Order from "../../../models/Order.js";
import { isSslCommerzConfigured, initiateSslCommerzPayment, paymentResultUrl, processSslCommerzCallback } from "../services/sslcommerzService.js";

export function config(req, res) {
  res.json({ success: true, data: { sslCommerzEnabled: isSslCommerzConfigured(), environment: "sandbox" } });
}

export async function initiate(req, res, next) {
  try {
    const data = await initiateSslCommerzPayment(req.user._id, req.body?.orderId, req.get("Idempotency-Key"));
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
}

function resultForPaymentStatus(status) {
  if (status === "paid") return "success";
  if (status === "failed") return "failure";
  if (status === "cancelled") return "cancelled";
  return "pending";
}

async function callbackOrderState(transactionId) {
  if (typeof transactionId !== "string" || !transactionId) return null;
  const payment = await Payment.findOne({ gateway: "sslcommerz", gatewayTransactionId: transactionId }).select("order").lean();
  if (!payment?.order) return null;
  const order = await Order.findById(payment.order).select("paymentStatus").lean();
  return { orderId: payment.order, result: resultForPaymentStatus(order?.paymentStatus) };
}

function safeCallbackError(error) {
  return {
    name: typeof error?.name === "string" ? error.name : "Error",
    code: typeof error?.code === "number" || typeof error?.code === "string" ? error.code : undefined,
    statusCode: Number.isInteger(error?.statusCode) ? error.statusCode : 500,
  };
}

function returnFromGateway() {
  return async (req, res, next) => {
    try {
      const result = await processSslCommerzCallback(req.body);
      const outcome = resultForPaymentStatus(result.status);
      return res.redirect(303, paymentResultUrl(result.orderId, outcome));
    } catch (error) {
      // The IPN may already have verified and saved this payment. On a browser
      // callback retry, route the customer using the persisted order status
      // instead of assuming failure or trusting the callback form fields.
      try {
        const state = await callbackOrderState(req.body?.tran_id);
        return res.redirect(303, paymentResultUrl(state?.orderId || null, state?.result || "pending"));
      } catch (lookupError) {
        // If status lookup is temporarily unavailable, send the browser back
        // to a neutral result page. The page will not claim payment succeeded.
        console.error("SSLCommerz callback status lookup failed", safeCallbackError(lookupError));
        try { return res.redirect(303, paymentResultUrl(null, "pending")); }
        catch (redirectError) { return next(redirectError || error); }
      }
    }
  };
}

export const success = returnFromGateway();
export const failure = returnFromGateway();
export const cancellation = returnFromGateway();

export async function ipn(req, res, next) {
  try {
    await processSslCommerzCallback(req.body);
    res.status(200).send("OK");
  } catch (error) { next(error); }
}

export const parseGatewayForm = express.urlencoded({ extended: false, limit: "20kb" });
