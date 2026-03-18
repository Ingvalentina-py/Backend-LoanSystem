const bcrypt = require("bcrypt");
const User = require("../models/User");
const Office = require("../models/Office");
const { signToken } = require("../utils/token");

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: "email y password son requeridos",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Usuario deshabilitado",
      });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    let officeName = null;

    if (user.officeId) {
      const office = await Office.findById(user.officeId).lean();
      officeName = office?.name || null;
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken({
      sub: user._id.toString(),
      role: user.role,
      officeId: user.officeId ? user.officeId.toString() : null,
    });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        officeId: user.officeId || null,
        officeName,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({
      message: "Error interno al iniciar sesión",
    });
  }
}

module.exports = { login };
