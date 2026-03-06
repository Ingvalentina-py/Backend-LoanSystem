const Client = require("../models/Client");

function getCollectorFilter(user) {
  if (user.role === "admin") return {};
  return { collectorId: user._id };
}

async function createClient(req, res) {
  const { name, documentId, address, phone } = req.body || {};
  if (!name || !documentId) {
    return res.status(400).json({ message: "name y documentId son requeridos" });
  }

  const collectorId = req.user.role === "admin"
    ? req.body.collectorId // admin puede asignar
    : req.user._id;

  if (!collectorId) return res.status(400).json({ message: "collectorId es requerido" });

  const client = await Client.create({
    name,
    documentId: String(documentId).trim(),
    address,
    phone,
    collectorId
  });

  res.status(201).json(client);
}

async function listClients(req, res) {
  const { q } = req.query; // buscar por cedula o nombre
  const filter = getCollectorFilter(req.user);

  if (q) {
    const s = String(q).trim();
    filter.$or = [
      { documentId: s },
      { name: { $regex: s, $options: "i" } }
    ];
  }

  const items = await Client.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  res.json({ items });
}

module.exports = { createClient, listClients };