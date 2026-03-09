const Client = require("../models/Client");

function getCollectorFilter(user) {
  if (user.role === "admin") return {};
  return { collectorId: user._id };
}

async function createClient(req, res) {
  try {
    const { name, documentId, address, phone } = req.body || {};

    if (!name || !documentId) {
      return res
        .status(400)
        .json({ message: "name y documentId son requeridos" });
    }

    const collectorId =
      req.user.role === "admin" ? req.body.collectorId : req.user._id;

    if (!collectorId) {
      return res.status(400).json({ message: "collectorId es requerido" });
    }

    const client = await Client.create({
      name,
      documentId: String(documentId).trim(),
      address,
      phone,
      collectorId,
    });

    return res.status(201).json(client);
  } catch (error) {
    console.error("createClient error:", error);
    return res.status(500).json({ message: "Error interno al crear cliente" });
  }
}

async function listClients(req, res) {
  try {
    const filter = getCollectorFilter(req.user);
    const { q } = req.query;

    if (q) {
      const text = String(q).trim();
      filter.$or = [
        { documentId: { $regex: text, $options: "i" } },
        { name: { $regex: text, $options: "i" } },
      ];
    }

    const items = await Client.find(filter).sort({ createdAt: -1 }).lean();

    return res.json({ items });
  } catch (error) {
    console.error("listClients error:", error);
    return res
      .status(500)
      .json({ message: "Error interno al listar clientes" });
  }
}

module.exports = { createClient, listClients };
