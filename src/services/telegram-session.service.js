const TelegramSession = require("../models/TelegramSession");

async function getSession(telegramUserId, telegramChatId) {
  return TelegramSession.findOne({
    telegramUserId: String(telegramUserId),
    telegramChatId: String(telegramChatId),
  });
}

async function upsertSession({
  telegramUserId,
  telegramChatId,
  currentFlow = null,
  currentStep = null,
  state = {},
  expiresAt = null,
}) {
  return TelegramSession.findOneAndUpdate(
    {
      telegramUserId: String(telegramUserId),
      telegramChatId: String(telegramChatId),
    },
    {
      $set: {
        currentFlow,
        currentStep,
        state,
        expiresAt,
      },
    },
    {
      new: true,
      upsert: true,
    },
  );
}

async function clearSession(telegramUserId, telegramChatId) {
  return TelegramSession.findOneAndDelete({
    telegramUserId: String(telegramUserId),
    telegramChatId: String(telegramChatId),
  });
}

module.exports = {
  getSession,
  upsertSession,
  clearSession,
};
