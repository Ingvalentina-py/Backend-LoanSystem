const bcrypt = require("bcrypt");
const User = require("../models/User");
const Office = require("../models/Office");
const { signToken } = require("../utils/token");

async function login(req, res) {
  try {
    const { officeId, email, password } = req.body || {};

    if (!officeId || !email || !password) {
      return res.status(400).json({
        message: "officeId, email y password son requeridos",
      });
    }

    const office = await Office.findOne({
      _id: officeId,
      isActive: true,
    }).lean();
    if (!office) {
      return res.status(404).json({
        message: "Oficina no encontrada",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
      officeId,
    });

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

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken({
      sub: user._id.toString(),
      role: user.role,
      officeId: user.officeId.toString(),
    });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        officeId: user.officeId,
        officeName: office.name,
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
    const { officeName, officeCode, name, email, phone, password } =
      req.body || {};

    if (!officeName || !name || !email || !password) {
      return res.status(400).json({
        message: "officeName, name, email y password son requeridos",
      });
    }

    const code = String(officeCode || officeName)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const existingOffice = await Office.findOne({ code });
    if (existingOffice) {
      return res.status(409).json({
        message: "Ya existe una oficina con ese código",
      });
    }

    const office = await Office.create({
      name: String(officeName).trim(),
      code,
      isActive: true,
    });

    const normalizedEmail = String(email).toLowerCase().trim();

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : "",
      passwordHash,
      role: "admin",
      isActive: true,
      officeId: office._id,
    });

    return res.status(201).json({
      message: "Oficina y administrador creados correctamente",
      office: {
        id: office._id,
        name: office.name,
        code: office.code,
      },
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
      message: "Error interno al crear oficina y administrador",
    });
  }
}

module.exports = { login, registerAdmin };
