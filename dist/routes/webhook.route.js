"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const webhookController = require("../controllers/webhook.controller");
const router = express.Router();
router.post("/", express.raw({ type: "*/*", limit: "1mb" }), webhookController.handleWebhook);
module.exports = router;
//# sourceMappingURL=webhook.route.js.map