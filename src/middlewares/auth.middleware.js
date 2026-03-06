const User = require("../models/User");
const { verifyToken } = require("../utils/token");

async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "No autenticado (falta token)" });
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.sub).lean();
    if (!user) return res.status(401).json({ message: "Usuario no existe" });
    if (!user.isActive) return res.status(403).json({ message: "Usuario deshabilitado" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

module.exports = { authRequired };