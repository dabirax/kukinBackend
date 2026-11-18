"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const PAYSTACK_BASE_URL = "https://api.paystack.co";
function getSecretKey() {
    return String(process.env.PAYSTACK_SECRET_KEY || "").trim();
}
function requireSecretKey() {
    const secretKey = getSecretKey();
    if (!secretKey) {
        const error = new Error("Paystack is not configured.");
        error.statusCode = 503;
        error.code = "PAYSTACK_NOT_CONFIGURED";
        throw error;
    }
    return secretKey;
}
function nairaToKobo(amount) {
    return Math.round(Number(amount) * 100);
}
async function paystackRequest(path, options = {}) {
    const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
        method: options.method || "GET",
        headers: {
            Authorization: `Bearer ${requireSecretKey()}`,
            "Content-Type": "application/json",
        },
        body: options.body ? JSON.stringify(options.body) : null,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.status === false) {
        const error = new Error(payload?.message || "Paystack request failed.");
        error.statusCode = response.status || 502;
        error.code = "PAYSTACK_REQUEST_FAILED";
        error.payload = payload;
        throw error;
    }
    return payload.data;
}
function initializeTransaction(payload) {
    return paystackRequest("/transaction/initialize", {
        method: "POST",
        body: payload,
    });
}
function verifyTransaction(reference) {
    return paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
}
function verifyWebhookSignature(rawBody, signatureHeader) {
    const signature = String(signatureHeader || "");
    if (!/^[a-f0-9]{128}$/i.test(signature))
        return false;
    const expected = crypto
        .createHmac("sha512", requireSecretKey())
        .update(rawBody)
        .digest("hex");
    const providedBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    return (providedBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(providedBuffer, expectedBuffer));
}
module.exports = {
    initializeTransaction,
    verifyTransaction,
    verifyWebhookSignature,
    nairaToKobo,
};
//# sourceMappingURL=paystack.js.map