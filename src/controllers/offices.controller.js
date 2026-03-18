const bcrypt = require("bcrypt");
const Office = require("../models/Office");
const User = require("../models/User");
const Client = require("../models/Client");
const Credit = require("../models/Credit");

function slugifyOfficeCode(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function listOffices(req, res) {
  try {
    const offices = await Office.find().sort({ createdAt: -1 }).lean();

    const items = await Promise.all(
      offices.map(async (office) => {
        const [adminCount, collectorCount, clientCount, creditCount] =
          await Promise.all([
            User.countDocuments({
              officeId: office._id,
              role: "admin",
              isActive: true,
            }),
            User.countDocuments({
              officeId: office._id,
              role: "collector",
              isActive: true,
            }),
            Client.countDocuments({ officeId: office._id }),
            Credit.countDocuments({ officeId: office._id }),
          ]);

        return {
          _id: office._id,
          name: office.name,
          code: office.code,
          isActive: office.isActive,
          adminCount,
          collectorCount,
          clientCount,
          creditCount,
          createdAt: office.createdAt,
        };
      }),
    );

    return res.json({ items });
  } catch (error) {
    console.error("listOffices error:", error);
    return res
      .status(500)
      .json({ message: "Error interno al listar oficinas" });
  }
}

async function createOfficeWithAdmin(req, res) {
  try {
    const {
      officeName,
      officeCode,
      adminName,
      adminEmail,
      adminPhone,
      adminPassword,
    } = req.body || {};

    if (!officeName || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({
        message:
          "officeName, adminName, adminEmail y adminPassword son requeridos",
      });
    }

    const finalCode = slugifyOfficeCode(officeCode || officeName);

    const officeExists = await Office.findOne({ code: finalCode });
    if (officeExists) {
      return res.status(409).json({
        message: "Ya existe una oficina con ese código",
      });
    }

    const normalizedEmail = String(adminEmail).toLowerCase().trim();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(409).json({
        message: "Ya existe un usuario con ese correo",
      });
    }

    const office = await Office.create({
      name: String(officeName).trim(),
      code: finalCode,
      isActive: true,
    });

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const admin = await User.create({
      name: String(adminName).trim(),
      email: normalizedEmail,
      phone: adminPhone ? String(adminPhone).trim() : "",
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
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("createOfficeWithAdmin error:", error);
    return res.status(500).json({ message: "Error interno al crear oficina" });
  }
}

module.exports = {
  listOffices,
  createOfficeWithAdmin,
};
