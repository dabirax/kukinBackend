const Order = require("../models/order.model");
const { serializeOrder } = require("./payment.controller");

async function listOrders(req: any, res: any) {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      orders: orders.map((order: any) => serializeOrder(order)),
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to load your orders",
      code: "ORDERS_FETCH_FAILED",
    });
  }
}

async function getOrderByReference(req: any, res: any) {
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

    return res.json(serializeOrder(order));
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to load that order",
      code: "ORDER_FETCH_FAILED",
    });
  }
}

module.exports = { listOrders, getOrderByReference };
