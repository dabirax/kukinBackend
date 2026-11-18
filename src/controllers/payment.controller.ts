const crypto = require("crypto");
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const { buildCartResponse } = require("../controllers/cart.controller");
const { getDeliveryFee } = require("../config/delivery");
const {
  initializeTransaction,
  verifyTransaction,
  nairaToKobo,
} = require("../utils/paystack");

function buildQuote(cart: any) {
  const items = Array.isArray(cart?.items) ? cart.items : [];
  const deliveryFee = items.length > 0 ? getDeliveryFee() : 0;
  const subtotal = Number(cart?.subtotal) || 0;
  const total = Number((subtotal + deliveryFee).toFixed(2));

  return {
    items,
    noOfItems: Number(cart?.noOfItems) || 0,
    subtotal,
    deliveryFee,
    total,
    totalKobo: nairaToKobo(total),
    currency: "NGN",
  };
}

function generateReference() {
  return `KUK-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function serializeOrder(order: any) {
  if (!order) return null;

  return {
    id: String(order._id),
    reference: order.reference,
    status: order.status,
    items: Array.isArray(order.items) ? order.items : [],
    subtotal: Number(order.subtotal) || 0,
    deliveryFee: Number(order.deliveryFee) || 0,
    total: Number(order.total) || 0,
    currency: order.currency || "NGN",
    channel: order.channel || "",
    paidAt: order.paidAt || null,
    createdAt: order.createdAt || null,
  };
}

function paymentIsValid(transaction: any, order: any) {
  return (
    String(transaction?.status) === "success" &&
    String(transaction?.reference) === String(order.reference) &&
    Number(transaction?.amount) === Number(order.totalKobo) &&
    String(transaction?.currency || order.currency) === String(order.currency)
  );
}

async function fulfilOrder(order: any, transaction: any) {
  if (String(order.status) === "paid") return false;

  if (!paymentIsValid(transaction, order)) return false;

  const paid = await Order.findOneAndUpdate(
    { _id: order._id, status: { $ne: "paid" } },
    {
      $set: {
        status: "paid",
        paidAt: new Date(),
        channel: String(transaction?.channel || ""),
        transactionId: String(transaction?.id || ""),
      },
    },
    { new: true }
  );

  if (!paid) return false;

  await Cart.findOneAndUpdate(
    { user: order.user },
    { $set: { items: [] } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return true;
}

async function getQuote(req: any, res: any) {
  try {
    const cart = await buildCartResponse(req.user._id);
    return res.json(buildQuote(cart));
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to calculate your order total",
      code: "QUOTE_FAILED",
    });
  }
}

async function initializePayment(req: any, res: any) {
  try {
    const cart = await buildCartResponse(req.user._id);
    const quote = buildQuote(cart);

    if (quote.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty.",
        code: "EMPTY_CART",
      });
    }

    const email = String(req.user.email || "").trim();

    if (!email) {
      return res.status(400).json({
        message: "A verified email address is required for checkout.",
        code: "CUSTOMER_EMAIL_REQUIRED",
      });
    }

    const reference = generateReference();
    const order = await Order.create({
      user: req.user._id,
      items: quote.items.map((item: any) => ({
        productId: Number(item.id),
        name: String(item.name),
        price: Number(item.price),
        amount: Number(item.amount),
        lineTotal: Number(item.lineTotal),
        img: String(item.img || ""),
      })),
      subtotal: quote.subtotal,
      deliveryFee: quote.deliveryFee,
      total: quote.total,
      totalKobo: quote.totalKobo,
      currency: quote.currency,
      reference,
    });

    try {
      const transaction = await initializeTransaction({
        email,
        amount: quote.totalKobo,
        currency: quote.currency,
        reference,
        callback_url: `${String(process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "")}/payment/callback`,
        metadata: {
          orderId: String(order._id),
          subtotal: quote.subtotal,
          deliveryFee: quote.deliveryFee,
        },
      });

      order.accessCode = String(transaction?.access_code || "");
      order.authorizationUrl = String(transaction?.authorization_url || "");
      await order.save();

      return res.json({
        authorizationUrl: order.authorizationUrl,
        accessCode: order.accessCode,
        reference,
        orderId: String(order._id),
        amount: quote.total,
        currency: quote.currency,
      });
    } catch (error: any) {
      order.status = "failed";
      await order.save().catch(() => {});
      throw error;
    }
  } catch (error: any) {
    const statusCode =
      error?.statusCode && error.statusCode < 500 ? error.statusCode : 502;

    return res.status(statusCode).json({
      message: error?.message || "Unable to start checkout.",
      code: error?.code || "PAYMENT_INIT_FAILED",
    });
  }
}

async function verifyPayment(req: any, res: any) {
  try {
    const reference = String(req.params.reference || "");
    const order = await Order.findOne({
      user: req.user._id,
      reference,
    }).lean();

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
        code: "ORDER_NOT_FOUND",
      });
    }

    if (String(order.status) === "paid") {
      return res.json(serializeOrder(order));
    }

    const transaction = await verifyTransaction(reference);

    if (String(transaction?.status) !== "success") {
      await Order.updateOne(
        { _id: order._id, status: "pending" },
        { $set: { status: "failed" } }
      );

      return res.status(409).json({
        message: "This payment was not completed.",
        code: "PAYMENT_NOT_SUCCESSFUL",
        order: serializeOrder(order),
      });
    }

    if (!paymentIsValid(transaction, order)) {
      return res.status(409).json({
        message: "The payment details did not match this order.",
        code: "PAYMENT_MISMATCH",
      });
    }

    await fulfilOrder(order, transaction);

    const updated = await Order.findOne({
      user: req.user._id,
      reference,
    }).lean();

    return res.json(serializeOrder(updated));
  } catch (error: any) {
    const statusCode =
      error?.statusCode && error.statusCode < 500 ? error.statusCode : 502;

    return res.status(statusCode).json({
      message: error?.message || "Unable to confirm your payment.",
      code: error?.code || "PAYMENT_VERIFY_FAILED",
    });
  }
}

module.exports = {
  getQuote,
  initializePayment,
  verifyPayment,
  fulfilOrder,
  paymentIsValid,
  serializeOrder,
};
