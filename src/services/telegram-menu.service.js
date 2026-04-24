function getUserRole(user) {
  return String(user?.role || user?.rol || user?.type || "").toLowerCase();
}

function buildMainMenu(user) {
  const role = getUserRole(user);

  if (role === "superadmin" || role === "super_admin") {
    return {
      text: "📋 Menú Super Administrador",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🏢 Ver oficinas", callback_data: "offices:list" }],
          [{ text: "👤 Crear administrador", callback_data: "admins:create" }],
          [{ text: "📊 Resumen general", callback_data: "dashboard:global" }],
        ],
      },
    };
  }

  if (role === "admin" || role === "administrator") {
    return {
      text: "📋 Menú Administrador",
      reply_markup: {
        inline_keyboard: [
          [{ text: "➕ Crear cobrador", callback_data: "collectors:create" }],
          [{ text: "👥 Ver cobradores", callback_data: "collectors:list" }],
          [{ text: "🔎 Buscar cliente", callback_data: "clients:search" }],
          [{ text: "📊 Resumen oficina", callback_data: "dashboard:office" }],
        ],
      },
    };
  }

  if (role === "collector" || role === "cobrador") {
    return {
      text: "📋 Menú Cobrador",
      reply_markup: {
        inline_keyboard: [
          [{ text: "👥 Mis clientes", callback_data: "collector:clients" }],
          [{ text: "💵 Registrar pago", callback_data: "payments:create" }],
          [{ text: "📝 Registrar visita", callback_data: "visits:create" }],
          [{ text: "📊 Mi resumen", callback_data: "collector:summary" }],
        ],
      },
    };
  }

  return {
    text: "📋 Menú principal\n\nNo pude identificar tu rol correctamente. Revisa tu usuario en el sistema.",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔄 Reintentar", callback_data: "menu:main" }],
      ],
    },
  };
}

module.exports = {
  buildMainMenu,
  getUserRole,
};
