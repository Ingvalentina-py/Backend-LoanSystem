const bcrypt = require("bcrypt");
const User = require("../models/User");
const { signToken } = require("../utils/token");

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "email y password son requeridos" });
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) return res.status(401).json({ message: "Credenciales inválidas" });
  if (!user.isActive) return res.status(403).json({ message: "Usuario deshabilitado" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({ sub: user._id.toString(), role: user.role });

  return res.json({
    token,
    user: { id: user._id, name: user.name, role: user.role, email: user.email }
  });
}

module.exports = { login };