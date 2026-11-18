"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const paymentController = require("../controllers/payment.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const router = express.Router();
router.use(requireAuth);
router.get("/quote", paymentController.getQuote);
router.post("/initialize", paymentController.initializePayment);
router.get("/verify/:reference", paymentController.verifyPayment);
module.exports = router;
//# sourceMappingURL=payment.route.js.map