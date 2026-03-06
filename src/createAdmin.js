require("dotenv").config();
const bcrypt = require("bcrypt");
const { connectDB } = require("./config/db");
const User = require("./models/User");

async function run() {
  await connectDB();

  const email = "admin@demo.com";
  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Admin ya existe:", email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash("Admin123*", 10);

  const admin = await User.create({
    name: "Administrador",
    email,
    passwordHash,
    role: "admin",
    isActive: true,
  });

  console.log("✅ Admin creado:", admin.email, "password: Admin123*");
  process.exit(0);
}

run().catch(console.error);
