const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  try {
    if (isConnected) {
      return;
    }

    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error(
        "MONGODB_URI no está definido en las variables de entorno",
      );
    }

    await mongoose.connect(uri);

    isConnected = true;
    console.log("✅ MongoDB conectado correctamente");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    throw error;
  }
}

module.exports = { connectDB };
