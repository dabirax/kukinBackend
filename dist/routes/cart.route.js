"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cartController = require("../controllers/cart.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const router = express.Router();
router.use(requireAuth);
router.get("/", cartController.getCart);
router.put("/", cartController.replaceCart);
router.delete("/", cartController.clearCart);
module.exports = router;
//# sourceMappingURL=cart.route.js.map