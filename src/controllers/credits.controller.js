const Credit = require("../models/Credit");
const Client = require("../models/Client");

function scopeFilter(user) {
  if (user.role === "admin") return {};
  return { collectorId: user._id };
}

async function createCredit(req, res) {
  try {
    const { clientId, originDate, dueDate, principalAmount, totalToPay } =
      req.body || {};

    if (
      !clientId ||
      !originDate ||
      !dueDate ||
      !principalAmount ||
      !totalToPay
    ) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const client = await Client.findById(clientId).lean();
    if (!client) {
      return res.status(404).json({ message: "Cliente no existe" });
    }

    if (
      req.user.role !== "admin" &&
      String(client.collectorId) !== String(req.user._id)
    ) {
      return res
        .status(403)
        .json({ message: "No puedes crear créditos para este cliente" });
    }

    const collectorId =
      req.user.role === "admin"
        ? req.body.collectorId || client.collectorId
        : req.user._id;

    const credit = await Credit.create({
      clientId,
      collectorId,
      originDate: new Date(originDate),
      dueDate: new Date(dueDate),
      principalAmount: Number(principalAmount),
      totalToPay: Number(totalToPay),
      status: "pending",
      paidAt: null,
    });

    return res.status(201).json(credit);
  } catch (error) {
    console.error("createCredit error:", error);
    return res.status(500).json({ message: "Error interno al crear crédito" });
  }
}

async function listCredits(req, res) {
  try {
    const filter = scopeFilter(req.user);
    const { status, q } = req.query;

    if (status && status !== "all") {
      filter.status = status;
    }

    const items = await Credit.find(filter)
      .populate("clientId", "name documentId phone address")
      .populate("collectorId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    let filtered = items;

    if (q) {
      const text = String(q).toLowerCase().trim();
      filtered = items.filter((item) => {
        const clientName = item.clientId?.name?.toLowerCase() || "";
        const documentId = item.clientId?.documentId?.toLowerCase() || "";
        return clientName.includes(text) || documentId.includes(text);
      });
    }

    return res.json({ items: filtered });
  } catch (error) {
    console.error("listCredits error:", error);
    return res
      .status(500)
      .json({ message: "Error interno al listar créditos" });
  }
}

async function markCreditAsPaid(req, res) {
  try {
    const { id } = req.params;

    const credit = await Credit.findOne({
      _id: id,
      ...scopeFilter(req.user),
    });

    if (!credit) {
      return res.status(404).json({ message: "Crédito no encontrado" });
    }

    if (credit.status === "paid") {
      return res.status(400).json({ message: "Este crédito ya está pagado" });
    }

    credit.status = "paid";
    credit.paidAt = new Date();

    await credit.save();

    return res.json({
      message: "Crédito marcado como pagado correctamente",
      credit,
    });
  } catch (error) {
    console.error("markCreditAsPaid error:", error);
    return res
      .status(500)
      .json({ message: "Error interno al actualizar crédito" });
  }
}

module.exports = {
  createCredit,
  listCredits,
  markCreditAsPaid,
};
