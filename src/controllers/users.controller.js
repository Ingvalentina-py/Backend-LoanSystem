const bcrypt = require("bcrypt");
const User = require("../models/User");

async function createCollector(req, res) {
  const { name, email, phone, password } = req.body || {};
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "name, email, password son requeridos" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  const exists = await User.findOne({
    email: normalizedEmail,
    officeId: req.officeId,
  });

  if (exists)
    return res.status(409).json({ message: "Email ya existe en esta oficina" });

  const passwordHash = await bcrypt.hash(password, 10);

  const collector = await User.create({
    name,
    email: normalizedEmail,
    phone,
    passwordHash,
    role: "collector",
    isActive: true,
    officeId: req.officeId,
  });

  res.status(201).json({
    id: collector._id,
    name: collector.name,
    email: collector.email,
    phone: collector.phone,
    role: collector.role,
    isActive: collector.isActive,
  });
}

async function listCollectors(req, res) {
  const items = await User.find({
    role: "collector",
    officeId: req.officeId,
  })
    .select("_id name email phone isActive createdAt")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ items });
}

async function setCollectorActive(req, res) {
  const { id } = req.params;
  const { isActive } = req.body || {};
  if (typeof isActive !== "boolean") {
    return res.status(400).json({ message: "isActive debe ser boolean" });
  }

  const updated = await User.findOneAndUpdate(
    { _id: id, role: "collector", officeId: req.officeId },
    { isActive },
    { new: true },
  ).select("_id name email isActive");

  if (!updated)
    return res.status(404).json({ message: "Cobrador no encontrado" });
  res.json(updated);
}

module.exports = { createCollector, listCollectors, setCollectorActive };
