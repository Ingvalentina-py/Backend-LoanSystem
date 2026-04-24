const TelegramMessageLog = require("../models/TelegramMessageLog");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || null;
const TELEGRAM_API_BASE = TELEGRAM_BOT_TOKEN
  ? `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`
  : null;

function hasTelegramConfig() {
  return Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_API_BASE);
}

async function logOutgoingMessage({
  telegramUserId = null,
  telegramChatId = null,
  text = null,
  payload = {},
  relatedFlow = null,
}) {
  try {
    await TelegramMessageLog.create({
      telegramUserId,
      telegramChatId,
      direction: "out",
      messageType: "text",
      text,
      payload,
      relatedFlow,
    });
  } catch (error) {
    console.error("telegram log outgoing error:", error.message);
  }
}

async function logIncomingMessage({
  telegramUserId = null,
  telegramChatId = null,
  text = null,
  payload = {},
  relatedFlow = null,
  messageType = "text",
}) {
  try {
    await TelegramMessageLog.create({
      telegramUserId,
      telegramChatId,
      direction: "in",
      messageType,
      text,
      payload,
      relatedFlow,
    });
  } catch (error) {
    console.error("telegram log incoming error:", error.message);
  }
}

async function sendMessage(chatId, text, extra = {}) {
  if (!hasTelegramConfig()) {
    throw new Error("Falta TELEGRAM_BOT_TOKEN en variables de entorno");
  }

  const payload = {
    chat_id: chatId,
    text,
    ...extra,
  };

  const response = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(`Telegram sendMessage error: ${JSON.stringify(data)}`);
  }

  await logOutgoingMessage({
    telegramChatId: String(chatId),
    text,
    payload,
  });

  return data;
}

async function answerCallbackQuery(callbackQueryId, text = null) {
  if (!hasTelegramConfig()) {
    throw new Error("Falta TELEGRAM_BOT_TOKEN en variables de entorno");
  }

  const payload = {
    callback_query_id: callbackQueryId,
  };

  if (text) {
    payload.text = text;
  }

  const response = await fetch(`${TELEGRAM_API_BASE}/answerCallbackQuery`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(
      `Telegram answerCallbackQuery error: ${JSON.stringify(data)}`,
    );
  }

  return data;
}

module.exports = {
  hasTelegramConfig,
  sendMessage,
  logIncomingMessage,
  logOutgoingMessage,
  answerCallbackQuery,
};
