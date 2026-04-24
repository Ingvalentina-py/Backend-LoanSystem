const mongoose = require("mongoose");

const TelegramAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    telegramUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    telegramChatId: {
      type: String,
      required: true,
      index: true,
    },

    telegramUsername: {
      type: String,
      default: null,
      trim: true,
    },

    firstName: {
      type: String,
      default: null,
      trim: true,
    },

    lastName: {
      type: String,
      default: null,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    linkedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TelegramAccount", TelegramAccountSchema);
