require("dotenv").config();
const { connectDB } = require("./config/db");
const User = require("./models/User");

async function run() {
  try {
    await connectDB();

    const collection = User.collection;

    const indexes = await collection.indexes();
    console.log("Índices actuales:", indexes);

    const compoundIndex = indexes.find(
      (idx) => idx.key && idx.key.email === 1 && idx.key.officeId === 1,
    );

    if (compoundIndex) {
      await collection.dropIndex(compoundIndex.name);
      console.log("✅ Índice compuesto email + officeId eliminado");
    }

    try {
      await collection.createIndex({ email: 1 }, { unique: true });
      console.log("✅ Índice único global por email creado");
    } catch (error) {
      console.log("ℹ️ El índice global por email ya existe o no fue necesario");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error migrando índice:", error);
    process.exit(1);
  }
}

run();
