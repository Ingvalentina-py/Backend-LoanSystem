const { logIncomingMessage } = require("../services/telegram.service");

const { handleTelegramUpdate } = require("../services/telegram-router.service");

const { createLinkCode } = require("../services/telegram-link.service");

function extractUpdateMetadata(update) {
  if (update.message) {
    return {
      telegramUserId: update.message.from?.id
        ? String(update.message.from.id)
        : null,
      telegramChatId: update.message.chat?.id
        ? String(update.message.chat.id)
        : null,
      text: update.message.text || null,
      messageType: update.message.text ? "text" : "message",
    };
  }

  if (update.callback_query) {
    return {
      telegramUserId: update.callback_query.from?.id
        ? String(update.callback_query.from.id)
        : null,
      telegramChatId: update.callback_query.message?.chat?.id
        ? String(update.callback_query.message.chat.id)
        : null,
      text: update.callback_query.data || null,
      messageType: "callback_query",
    };
  }

  return {
    telegramUserId: null,
    telegramChatId: null,
    text: null,
    messageType: "unknown",
  };
}

async function telegramWebhook(req, res) {
  try {
    const secretHeader = req.headers["x-telegram-bot-api-secret-token"];
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET || null;

    if (expectedSecret && secretHeader !== expectedSecret) {
      return res.status(401).json({ message: "Webhook no autorizado" });
    }

    const update = req.body || {};
    const metadata = extractUpdateMetadata(update);

    await logIncomingMessage({
      telegramUserId: metadata.telegramUserId,
      telegramChatId: metadata.telegramChatId,
      text: metadata.text,
      payload: update,
      messageType: metadata.messageType,
    });

    await handleTelegramUpdate(update);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("telegram webhook error:", error);
    return res.status(500).json({
      message: "Error procesando webhook de Telegram",
    });
  }
}

async function telegramHealth(req, res) {
  return res.json({
    ok: true,
    module: "telegram",
    hasBotToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    hasWebhookSecret: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET),
  });
}

async function generateTelegramLinkCode(req, res) {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    const linkCode = await createLinkCode(userId, 15);

    return res.status(201).json({
      ok: true,
      code: linkCode.code,
      expiresAt: linkCode.expiresAt,
      message: "Código de vinculación generado correctamente.",
    });
  } catch (error) {
    console.error("generateTelegramLinkCode error:", error);
    return res.status(500).json({
      message: "Error generando código de vinculación",
    });
  }
}

module.exports = {
  telegramWebhook,
  telegramHealth,
  generateTelegramLinkCode,
};
