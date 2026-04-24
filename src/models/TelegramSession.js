const mongoose = require("mongoose");

const TelegramSessionSchema = new mongoose.Schema(
  {
    telegramUserId: {
      type: String,
      required: true,
      index: true,
    },

    telegramChatId: {
      type: String,
      required: true,
      index: true,
    },

    currentFlow: {
      type: String,
      default: null,
      trim: true,
    },

    currentStep: {
      type: String,
      default: null,
      trim: true,
    },

    state: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TelegramSession", TelegramSessionSchema);
