require("dotenv").config();
const { connectDB } = require("./config/db");
const Office = require("./models/Office");
const User = require("./models/User");
const Client = require("./models/Client");
const Credit = require("./models/Credit");

async function run() {
  try {
    await connectDB();

    let office = await Office.findOne({ code: "oficina-principal" });

    if (!office) {
      office = await Office.create({
        name: "Oficina Principal",
        code: "oficina-principal",
        isActive: true,
      });
    }

    await User.updateMany(
      { officeId: { $exists: false } },
      { $set: { officeId: office._id } },
    );

    await Client.updateMany(
      { officeId: { $exists: false } },
      { $set: { officeId: office._id } },
    );

    await Credit.updateMany(
      { officeId: { $exists: false } },
      { $set: { officeId: office._id } },
    );

    console.log("✅ Migración completada");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en migración:", error);
    process.exit(1);
  }
}

run();
