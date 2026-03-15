const Office = require("../models/Office");

function slugifyOfficeCode(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function listPublicOffices(req, res) {
  try {
    const items = await Office.find({ isActive: true })
      .select("_id name code")
      .sort({ name: 1 })
      .lean();

    return res.json({ items });
  } catch (error) {
    console.error("listPublicOffices error:", error);
    return res
      .status(500)
      .json({ message: "Error interno al listar oficinas" });
  }
}

async function createOffice(req, res) {
  try {
    const { name, code } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: "name es requerido" });
    }

    const finalCode = code ? slugifyOfficeCode(code) : slugifyOfficeCode(name);

    const exists = await Office.findOne({ code: finalCode });
    if (exists) {
      return res
        .status(409)
        .json({ message: "Ya existe una oficina con ese código" });
    }

    const office = await Office.create({
      name: String(name).trim(),
      code: finalCode,
      isActive: true,
    });

    return res.status(201).json({
      id: office._id,
      name: office.name,
      code: office.code,
    });
  } catch (error) {
    console.error("createOffice error:", error);
    return res.status(500).json({ message: "Error interno al crear oficina" });
  }
}

module.exports = {
  listPublicOffices,
  createOffice,
};
