require("dotenv").config();
const bcrypt = require("bcrypt");
const { connectDB } = require("./config/db");
const User = require("./models/User");

async function run() {
  try {
    await connectDB();

    const email = "superadmin@demo.com";

    const exists = await User.findOne({ email });
    if (exists) {
      console.log("⚠️ El super admin ya existe:", email);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash("SuperAdmin123*", 10);

    const user = await User.create({
      name: "Super Administrador",
      email,
      phone: "3000000000",
      passwordHash,
      role: "superadmin",
      isActive: true,
      officeId: null,
    });

    console.log("✅ Super admin creado correctamente");
    console.log("Email:", user.email);
    console.log("Password: SuperAdmin123*");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creando super admin:", error);
    process.exit(1);
  }
}

run();
