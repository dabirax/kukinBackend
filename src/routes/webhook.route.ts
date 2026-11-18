const express = require("express");
const webhookController = require("../controllers/webhook.controller");

const router = express.Router();

router.post(
  "/",
  express.raw({ type: "*/*", limit: "1mb" }),
  webhookController.handleWebhook
);

module.exports = router;
