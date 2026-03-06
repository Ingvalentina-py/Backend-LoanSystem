require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");

async function main() {
  await connectDB();
  const port = process.env.PORT || 3000;
  app.listen(port, () =>
    console.log(`✅ API corriendo en http://localhost:${port}`),
  );
}

main().catch((err) => {
  console.error("❌ Error al iniciar:", err);
  process.exit(1);
});
