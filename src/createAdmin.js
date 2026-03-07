require("dotenv").config();
const bcrypt = require("bcrypt");

const { connectDB } = require("./config/db");
const User = require("./models/User");

async function run() {
  try {
    await connectDB();

    const email = "admin@demo.com";

    const exists = await User.findOne({ email });
    if (exists) {
      console.log("⚠️ El admin ya existe:", email);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash("Admin123*", 10);

    const admin = await User.create({
      name: "Administrador",
      email,
      phone: "3000000000",
      passwordHash,
      role: "admin",
      isActive: true,
    });

    console.log("✅ Admin creado correctamente");
    console.log("Email:", admin.email);
    console.log("Password: Admin123*");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creando admin:", error);
    process.exit(1);
  }
}

run();
