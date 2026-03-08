const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const clientsRoutes = require("./routes/clients.routes");
const creditsRoutes = require("./routes/credits.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Backend funcionando correctamente",
  });
});

app.get("/health", async (req, res) => {
  try {
    await connectDB();
    res.json({ ok: true, db: "connected" });
  } catch (error) {
    console.error("health db error:", error);
    res.status(500).json({ ok: false, db: "disconnected" });
  }
});

// Middleware global: asegura conexión antes de rutas API
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("DB middleware error:", error);
    res.status(500).json({
      message: "Error de conexión con la base de datos",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/credits", creditsRoutes);
app.use("/api/dashboard", dashboardRoutes);

module.exports = app;
