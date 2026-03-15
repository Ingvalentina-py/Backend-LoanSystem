const mongoose = require("mongoose");

const OfficeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Office", OfficeSchema);
