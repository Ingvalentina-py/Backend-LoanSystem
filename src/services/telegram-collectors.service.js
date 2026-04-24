const bcrypt = require("bcrypt");
const User = require("../models/User");

function formatCollectorStatus(isActive) {
  return isActive ? "Activo" : "Inactivo";
}

function formatCollectorList(collectors) {
  if (!collectors.length) {
    return "No hay cobradores registrados en tu oficina.";
  }

  const lines = collectors.map((collector, index) => {
    return [
      `${index + 1}. ${collector.name}`,
      `   Email: ${collector.email}`,
      `   Teléfono: ${collector.phone || "No registrado"}`,
      `   Estado: ${formatCollectorStatus(collector.isActive)}`,
    ].join("\n");
  });

  return `👥 Cobradores de tu oficina:\n\n${lines.join("\n\n")}`;
}

async function listCollectorsForTelegram(user) {
  if (!user) {
    return { ok: false, message: "No se pudo identificar el usuario." };
  }

  if (user.role !== "admin") {
    return { ok: false, message: "No tienes permisos para ver cobradores." };
  }

  if (!user.officeId) {
    return { ok: false, message: "Tu usuario no tiene una oficina asignada." };
  }

  const collectors = await User.find({
    role: "collector",
    officeId: user.officeId,
  })
    .select("_id name email phone isActive createdAt")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return {
    ok: true,
    message: formatCollectorList(collectors),
    collectors,
  };
}

async function createCollectorForTelegram(user, data) {
  if (!user) {
    return { ok: false, message: "No se pudo identificar el usuario." };
  }

  if (user.role !== "admin") {
    return { ok: false, message: "No tienes permisos para crear cobradores." };
  }

  if (!user.officeId) {
    return { ok: false, message: "Tu usuario no tiene una oficina asignada." };
  }

  const name = String(data.name || "").trim();
  const email = String(data.email || "")
    .toLowerCase()
    .trim();
  const phone = String(data.phone || "").trim();
  const password = String(data.password || "").trim();

  if (!name || !email || !password) {
    return {
      ok: false,
      message: "Nombre, email y contraseña son requeridos.",
    };
  }

  const exists = await User.findOne({
    email,
    officeId: user.officeId,
  });

  if (exists) {
    return {
      ok: false,
      message: "Ese email ya existe en esta oficina.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const collector = await User.create({
    name,
    email,
    phone,
    passwordHash,
    role: "collector",
    isActive: true,
    officeId: user.officeId,
  });

  return {
    ok: true,
    collector,
    message: [
      "✅ Cobrador creado correctamente.",
      "",
      `Nombre: ${collector.name}`,
      `Email: ${collector.email}`,
      `Teléfono: ${collector.phone || "No registrado"}`,
      "Estado: Activo",
    ].join("\n"),
  };
}

module.exports = {
  listCollectorsForTelegram,
  createCollectorForTelegram,
};
