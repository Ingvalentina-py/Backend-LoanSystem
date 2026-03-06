const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
    },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },

    role: { type: String, enum: ["admin", "collector"], required: true },
    isActive: { type: Boolean, default: true },

    // opcional: para auditoría
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
