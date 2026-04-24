const mongoose = require("mongoose");

const TelegramMessageLogSchema = new mongoose.Schema(
  {
    telegramUserId: {
      type: String,
      default: null,
      index: true,
    },

    telegramChatId: {
      type: String,
      default: null,
      index: true,
    },

    direction: {
      type: String,
      enum: ["in", "out"],
      required: true,
    },

    messageType: {
      type: String,
      default: "text",
      trim: true,
    },

    text: {
      type: String,
      default: null,
    },

    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    relatedFlow: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TelegramMessageLog", TelegramMessageLogSchema);
