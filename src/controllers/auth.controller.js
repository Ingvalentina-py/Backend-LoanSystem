const bcrypt = require("bcrypt");
const User = require("../models/User");
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

    if (!user.passwordHash) {
      return res.status(500).json({
        message: "Usuario mal configurado",
      });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken({
      sub: user._id.toString(),
      role: user.role,
    });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({
      message: "Error interno al iniciar sesión",
    });
  }
}

async function registerAdmin(req, res) {
  try {
    const { name, email, phone, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email y password son requeridos",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({
        message: "Ya existe un usuario con este correo",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : "",
      passwordHash,
      role: "admin",
      isActive: true,
    });

    return res.status(201).json({
      message: "Administrador creado correctamente",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("registerAdmin error:", error);
    return res.status(500).json({
      message: "Error interno al crear administrador",
    });
  }
}

module.exports = { login, registerAdmin };
