const Cart = require("../models/cart.model");
const Product = require("../models/products.model");
const { calcTotals } = require("../utils/calcTotals");

async function buildCartResponse(userId: string) {
  const cart = await Cart.findOne({ user: userId }).lean();
  const storedItems = Array.isArray(cart?.items) ? cart.items : [];

  if (storedItems.length === 0) {
    return { items: [], subtotal: 0, noOfItems: 0 };
  }

  const productIds = storedItems.map((item: any) => Number(item.productId));
  const products = await Product.find({ id: { $in: productIds } }).lean();
  const productMap = new Map(
    products.map((product: any) => [Number(product.id), product])
  );

  const items = storedItems
    .map((item: any) => {
      const product: any = productMap.get(Number(item.productId));

      if (!product) return null;

      return {
        ...product,
        amount: Number(item.amount),
        lineTotal: Number((Number(product.price) * Number(item.amount)).toFixed(2)),
      };
    })
    .filter(Boolean);

  return {
    items,
    ...calcTotals(items),
  };
}

async function getCart(req: any, res: any) {
  try {
    const cart = await buildCartResponse(req.user._id);
    return res.json(cart);
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to load your cart",
      code: "CART_FETCH_FAILED",
    });
  }
}

async function replaceCart(req: any, res: any) {
  try {
    const rawItems = req.body?.items;

    if (!Array.isArray(rawItems)) {
      return res.status(400).json({
        message: "Cart items must be an array",
        code: "VALIDATION_ERROR",
      });
    }

    const merged = new Map<number, number>();

    for (const item of rawItems) {
      const productId = Number(item?.productId ?? item?.id);
      const amount = Number(item?.amount);

      if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
          message: "Every cart item needs a valid product id",
          code: "VALIDATION_ERROR",
        });
      }

      if (!Number.isFinite(amount) || amount < 1) {
        return res.status(400).json({
          message: "Every cart item needs a valid quantity",
          code: "VALIDATION_ERROR",
        });
      }

      const nextAmount = Math.min(
        99,
        Math.max(1, Math.trunc(amount) + (merged.get(productId) || 0))
      );
      merged.set(productId, nextAmount);
    }

    const items = Array.from(merged.entries()).map(([productId, amount]) => ({
      productId,
      amount,
    }));

    if (items.length > 0) {
      const ids = items.map((item) => item.productId);
      const found = await Product.find({ id: { $in: ids } }).select("id").lean();
      const foundIds = new Set(found.map((product: any) => Number(product.id)));
      const unknownIds = ids.filter((id) => !foundIds.has(id));

      if (unknownIds.length > 0) {
        return res.status(400).json({
          message: "Some products in your cart are no longer available",
          code: "UNKNOWN_PRODUCTS",
          productIds: unknownIds,
        });
      }
    }

    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const cart = await buildCartResponse(req.user._id);
    return res.json(cart);
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to save your cart",
      code: "CART_UPDATE_FAILED",
    });
  }
}

async function clearCart(req: any, res: any) {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ items: [], subtotal: 0, noOfItems: 0 });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to clear your cart",
      code: "CART_CLEAR_FAILED",
    });
  }
}

module.exports = {
  buildCartResponse,
  getCart,
  replaceCart,
  clearCart,
};
