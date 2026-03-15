const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },

    role: { type: String, enum: ["admin", "collector"], required: true },
    isActive: { type: Boolean, default: true },

    officeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
    },

    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1, officeId: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);
