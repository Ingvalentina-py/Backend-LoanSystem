const { sendMessage, answerCallbackQuery } = require("./telegram.service");

const {
  getSession,
  upsertSession,
  clearSession,
} = require("./telegram-session.service");

const {
  linkTelegramAccount,
  findTelegramAccountByTelegramUserId,
} = require("./telegram-link.service");

const { buildMainMenu } = require("./telegram-menu.service");

const {
  listCollectorsForTelegram,
  createCollectorForTelegram,
} = require("./telegram-collectors.service");

function looksLikeLinkCode(text) {
  return /^[A-Z0-9]{6,10}$/.test(text);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

async function handleTelegramUpdate(update) {
  if (update.message?.text) {
    return handleTextMessage(update.message);
  }

  if (update.callback_query) {
    return handleCallbackQuery(update.callback_query);
  }

  return { ok: true, ignored: true };
}

async function handleTextMessage(message) {
  const chatId = String(message.chat.id);
  const telegramUserId = String(message.from.id);
  const text = (message.text || "").trim();

  const telegramAccount =
    await findTelegramAccountByTelegramUserId(telegramUserId);

  if (!telegramAccount) {
    if (looksLikeLinkCode(text.toUpperCase())) {
      const result = await linkTelegramAccount({
        code: text,
        telegramUserId,
        telegramChatId: chatId,
        telegramUsername: message.from.username || null,
        firstName: message.from.first_name || null,
        lastName: message.from.last_name || null,
      });

      if (!result.ok) {
        await sendMessage(chatId, result.message);
        return { ok: false, action: "link_failed" };
      }

      await sendMessage(
        chatId,
        "✅ Cuenta vinculada correctamente.\n\nAhora puedes usar /menu para ver tus opciones.",
      );

      return { ok: true, action: "linked_success" };
    }

    await sendMessage(
      chatId,
      "👋 Hola. Para usar el bot primero debes vincular tu cuenta.\n\nEntra al sistema web y genera tu código de vinculación.\n\nLuego escríbelo aquí.",
    );

    return { ok: true, action: "ask_for_link_code" };
  }

  const user = telegramAccount.userId;

  if (text === "/start") {
    await sendMessage(
      chatId,
      `👋 Bienvenido nuevamente${user?.name ? `, ${user.name}` : ""}.\n\nTu cuenta ya está vinculada.\n\nUsa /menu para ver tus opciones.`,
    );
    return { ok: true, action: "start" };
  }

  if (text === "/menu") {
    const menu = buildMainMenu(user);
    await sendMessage(chatId, menu.text, {
      reply_markup: menu.reply_markup,
    });
    return { ok: true, action: "menu" };
  }

  if (text === "/cancelar") {
    await clearSession(telegramUserId, chatId);
    await sendMessage(chatId, "Se canceló el flujo actual.");
    return { ok: true, action: "cancel" };
  }

  const session = await getSession(telegramUserId, chatId);

  if (session?.currentFlow === "collectors:create") {
    return handleCreateCollectorFlow({
      chatId,
      telegramUserId,
      user,
      text,
      session,
    });
  }

  await sendMessage(
    chatId,
    `Recibí tu mensaje: "${text}".\n\nPor ahora usa /menu para navegar por las opciones.`,
  );

  return { ok: true, action: "echo" };
}

async function handleCreateCollectorFlow({
  chatId,
  telegramUserId,
  user,
  text,
  session,
}) {
  const state = session.state || {};

  if (session.currentStep === "name") {
    if (text.length < 3) {
      await sendMessage(chatId, "El nombre debe tener al menos 3 caracteres.");
      return { ok: false, action: "collector_name_invalid" };
    }

    await upsertSession({
      telegramUserId,
      telegramChatId: chatId,
      currentFlow: "collectors:create",
      currentStep: "email",
      state: {
        ...state,
        name: text,
      },
    });

    await sendMessage(chatId, "Ahora escribe el email del cobrador:");
    return { ok: true, action: "collector_ask_email" };
  }

  if (session.currentStep === "email") {
    if (!isValidEmail(text)) {
      await sendMessage(chatId, "El email no es válido. Inténtalo de nuevo:");
      return { ok: false, action: "collector_email_invalid" };
    }

    await upsertSession({
      telegramUserId,
      telegramChatId: chatId,
      currentFlow: "collectors:create",
      currentStep: "phone",
      state: {
        ...state,
        email: text.toLowerCase(),
      },
    });

    await sendMessage(chatId, "Ahora escribe el teléfono del cobrador:");
    return { ok: true, action: "collector_ask_phone" };
  }

  if (session.currentStep === "phone") {
    await upsertSession({
      telegramUserId,
      telegramChatId: chatId,
      currentFlow: "collectors:create",
      currentStep: "password",
      state: {
        ...state,
        phone: text,
      },
    });

    await sendMessage(
      chatId,
      "Ahora escribe una contraseña temporal para el cobrador:",
    );
    return { ok: true, action: "collector_ask_password" };
  }

  if (session.currentStep === "password") {
    if (text.length < 6) {
      await sendMessage(
        chatId,
        "La contraseña debe tener al menos 6 caracteres. Inténtalo de nuevo:",
      );
      return { ok: false, action: "collector_password_invalid" };
    }

    const newState = {
      ...state,
      password: text,
    };

    await upsertSession({
      telegramUserId,
      telegramChatId: chatId,
      currentFlow: "collectors:create",
      currentStep: "confirm",
      state: newState,
    });

    await sendMessage(
      chatId,
      [
        "Confirma los datos del cobrador:",
        "",
        `Nombre: ${newState.name}`,
        `Email: ${newState.email}`,
        `Teléfono: ${newState.phone || "No registrado"}`,
        "",
        "Escribe CONFIRMAR para crearlo o /cancelar para salir.",
      ].join("\n"),
    );

    return { ok: true, action: "collector_ask_confirm" };
  }

  if (session.currentStep === "confirm") {
    if (text.toUpperCase() !== "CONFIRMAR") {
      await sendMessage(
        chatId,
        "Para crear el cobrador escribe CONFIRMAR. Si deseas cancelar, escribe /cancelar.",
      );
      return { ok: false, action: "collector_confirm_invalid" };
    }

    const result = await createCollectorForTelegram(user, state);

    await clearSession(telegramUserId, chatId);
    await sendMessage(chatId, result.message);

    return {
      ok: result.ok,
      action: "collector_created",
    };
  }

  await clearSession(telegramUserId, chatId);
  await sendMessage(
    chatId,
    "El flujo estaba en un estado inválido. Por favor vuelve a intentarlo desde /menu.",
  );

  return { ok: false, action: "collector_flow_invalid" };
}

async function handleCallbackQuery(callbackQuery) {
  const chatId = String(callbackQuery.message.chat.id);
  const telegramUserId = String(callbackQuery.from.id);
  const data = callbackQuery.data || "";

  const telegramAccount =
    await findTelegramAccountByTelegramUserId(telegramUserId);

  if (!telegramAccount) {
    await sendMessage(
      chatId,
      "Primero debes vincular tu cuenta. Envía tu código de vinculación.",
    );
    return { ok: false, action: "callback_not_linked" };
  }

  const user = telegramAccount.userId;

  if (data === "menu:main") {
    const menu = buildMainMenu(user);
    await sendMessage(chatId, menu.text, {
      reply_markup: menu.reply_markup,
    });
    return { ok: true, action: "menu_callback" };
  }

  if (data === "collectors:create") {
    await answerCallbackQuery(callbackQuery.id, "Iniciando creación...");

    if (user.role !== "admin") {
      await sendMessage(chatId, "No tienes permisos para crear cobradores.");
      return { ok: false, action: "collector_create_forbidden" };
    }

    await upsertSession({
      telegramUserId,
      telegramChatId: chatId,
      currentFlow: "collectors:create",
      currentStep: "name",
      state: {},
    });

    await sendMessage(
      chatId,
      "Vamos a crear un cobrador.\n\nEscribe el nombre completo del cobrador:",
    );

    return { ok: true, action: "collectors_create_start" };
  }

  if (data === "collectors:list") {
    await answerCallbackQuery(callbackQuery.id, "Consultando cobradores...");

    const result = await listCollectorsForTelegram(user);

    await sendMessage(chatId, result.message);

    return {
      ok: result.ok,
      action: "collectors_list",
    };
  }

  if (data === "clients:search") {
    await sendMessage(
      chatId,
      "Aquí buscaremos clientes por nombre, documento o teléfono.\n\nEste será uno de los próximos flujos.",
    );
    return { ok: true, action: "clients_search_placeholder" };
  }

  if (data === "payments:create") {
    await sendMessage(
      chatId,
      "Aquí iniciaremos el flujo para registrar un pago.\n\nLo conectaremos después con créditos/clientes.",
    );
    return { ok: true, action: "payments_create_placeholder" };
  }

  await sendMessage(
    chatId,
    `Opción recibida: ${data}\n\nEsta opción todavía no está implementada.`,
  );

  return { ok: true, action: "callback_unknown" };
}

module.exports = {
  handleTelegramUpdate,
};
