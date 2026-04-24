const crypto = require("crypto");
const TelegramLinkCode = require("../models/TelegramLinkCode");
const TelegramAccount = require("../models/TelegramAccount");

function generateReadableCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < length; i += 1) {
    const index = crypto.randomInt(0, chars.length);
    code += chars[index];
  }

  return code;
}

async function createLinkCode(userId, expiresInMinutes = 15) {
  await TelegramLinkCode.deleteMany({
    userId,
    isUsed: false,
  });

  const code = generateReadableCode(8);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  const linkCode = await TelegramLinkCode.create({
    userId,
    code,
    expiresAt,
  });

  return linkCode;
}

async function validateLinkCode(code) {
  const normalizedCode = String(code || "")
    .trim()
    .toUpperCase();

  const linkCode = await TelegramLinkCode.findOne({
    code: normalizedCode,
  });

  if (!linkCode) {
    return {
      ok: false,
      reason: "invalid_code",
      message: "El código de vinculación no existe.",
    };
  }

  if (linkCode.isUsed) {
    return {
      ok: false,
      reason: "used_code",
      message: "Este código ya fue utilizado.",
    };
  }

  if (linkCode.expiresAt < new Date()) {
    return {
      ok: false,
      reason: "expired_code",
      message: "Este código ya expiró.",
    };
  }

  return {
    ok: true,
    linkCode,
  };
}

async function linkTelegramAccount({
  code,
  telegramUserId,
  telegramChatId,
  telegramUsername = null,
  firstName = null,
  lastName = null,
}) {
  const validation = await validateLinkCode(code);

  if (!validation.ok) {
    return validation;
  }

  const { linkCode } = validation;

  const existingTelegramAccount = await TelegramAccount.findOne({
    telegramUserId: String(telegramUserId),
  });

  if (existingTelegramAccount) {
    return {
      ok: false,
      reason: "telegram_already_linked",
      message: "Esta cuenta de Telegram ya está vinculada a un usuario.",
    };
  }

  const existingUserLinked = await TelegramAccount.findOne({
    userId: linkCode.userId,
    isActive: true,
  });

  if (existingUserLinked) {
    return {
      ok: false,
      reason: "user_already_linked",
      message: "Este usuario ya tiene una cuenta de Telegram vinculada.",
    };
  }

  const telegramAccount = await TelegramAccount.create({
    userId: linkCode.userId,
    telegramUserId: String(telegramUserId),
    telegramChatId: String(telegramChatId),
    telegramUsername,
    firstName,
    lastName,
    linkedAt: new Date(),
    isActive: true,
  });

  linkCode.isUsed = true;
  linkCode.usedAt = new Date();
  await linkCode.save();

  return {
    ok: true,
    telegramAccount,
    userId: linkCode.userId,
    message: "Cuenta de Telegram vinculada correctamente.",
  };
}

async function findTelegramAccountByTelegramUserId(telegramUserId) {
  return TelegramAccount.findOne({
    telegramUserId: String(telegramUserId),
    isActive: true,
  }).populate("userId");
}

module.exports = {
  createLinkCode,
  validateLinkCode,
  linkTelegramAccount,
  findTelegramAccountByTelegramUserId,
};
