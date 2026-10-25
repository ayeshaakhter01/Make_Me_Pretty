import test from "node:test";
import assert from "node:assert/strict";
import errorMiddleware from "./errorMiddleware.js";

test("error logging excludes sensitive error messages", () => {
  const originalError = console.error;
  let logged;
  console.error = (...args) => { logged = args; };
  const response = { status() { return this; }, json() { return this; } };
  try {
    errorMiddleware(Object.assign(new Error("store_passwd=secret card_no=4111111111111111"), { statusCode: 502 }), {}, response, () => {});
  } finally {
    console.error = originalError;
  }
  assert.equal(JSON.stringify(logged).includes("secret"), false);
  assert.equal(JSON.stringify(logged).includes("4111111111111111"), false);
});
