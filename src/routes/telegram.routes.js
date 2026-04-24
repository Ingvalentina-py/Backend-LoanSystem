const express = require("express");
const {
  telegramWebhook,
  telegramHealth,
  generateTelegramLinkCode,
} = require("../controllers/telegram.controller");

const { authRequired } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/health", telegramHealth);
router.post("/webhook", telegramWebhook);
router.post("/link-code", authRequired, generateTelegramLinkCode);

module.exports = router;
