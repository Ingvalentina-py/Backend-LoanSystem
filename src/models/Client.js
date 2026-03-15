const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    documentId: { type: String, trim: true, required: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },

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

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

ClientSchema.index({ documentId: 1, officeId: 1 }, { unique: true });

module.exports = mongoose.model("Client", ClientSchema);
