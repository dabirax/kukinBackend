const { verifyWebhookSignature, verifyTransaction } = require("../utils/paystack");
const Order = require("../models/order.model");
const { fulfilOrder } = require("./payment.controller");

async function processChargeSuccess(data: any) {
  const reference = String(data?.reference || "");

  if (!reference) return;

  const order = await Order.findOne({ reference });

  if (!order || String(order.status) === "paid") return;

  if (
    String(data?.status) !== "success" ||
    Number(data?.amount) !== Number(order.totalKobo) ||
    String(data?.currency || order.currency) !== String(order.currency)
  ) {
    console.warn("Webhook payment details did not match order:", reference);
    return;
  }

  const transaction = await verifyTransaction(reference);
  await fulfilOrder(order, transaction);
}

async function handleWebhook(req: any, res: any) {
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from("");

  let signatureValid = false;

  try {
    signatureValid = verifyWebhookSignature(
      rawBody,
      req.headers["x-paystack-signature"]
    );
  } catch (error: any) {
    return res.status(503).json({
      message: error?.message || "Paystack is not configured.",
      code: error?.code || "PAYSTACK_NOT_CONFIGURED",
    });
  }

  if (!signatureValid) {
    return res.status(401).json({
      message: "Invalid webhook signature",
      code: "INVALID_SIGNATURE",
    });
  }

  let event: any;

  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({
      message: "Invalid webhook payload",
      code: "INVALID_WEBHOOK_PAYLOAD",
    });
  }

  res.status(200).json({ received: true });

  if (String(event?.event) !== "charge.success") return;

  processChargeSuccess(event?.data).catch((error: any) => {
    console.error("Webhook fulfilment failed:", error?.message || error);
  });
}

module.exports = { handleWebhook, processChargeSuccess };
