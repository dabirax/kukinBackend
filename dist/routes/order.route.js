"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const orderController = require("../controllers/order.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const router = express.Router();
router.use(requireAuth);
router.get("/", orderController.listOrders);
router.get("/:reference", orderController.getOrderByReference);
module.exports = router;
//# sourceMappingURL=order.route.js.map