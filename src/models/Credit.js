const mongoose = require("mongoose");

const CreditSchema = new mongoose.Schema(
  {
    originDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },

    principalAmount: { type: Number, required: true, min: 1 },
    totalToPay: { type: Number, required: true, min: 1 },

    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    paidAt: { type: Date, default: null },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    collectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    officeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Credit", CreditSchema);
