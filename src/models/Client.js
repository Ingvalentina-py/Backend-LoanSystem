const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    documentId: { type: String, trim: true, required: true }, // cedula
    address: { type: String, trim: true },
    phone: { type: String, trim: true },

    collectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // estado del cliente (opcional)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Evita duplicar cédulas para el mismo cobrador (si quieres global, quita collectorId del index)
ClientSchema.index({ documentId: 1, collectorId: 1 }, { unique: true });

module.exports = mongoose.model("Client", ClientSchema);
