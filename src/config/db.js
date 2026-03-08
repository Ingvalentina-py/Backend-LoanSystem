const mongoose = require("mongoose");

let cached = global._mongooseCached;

if (!cached) {
  cached = global._mongooseCached = {
    conn: null,
    promise: null,
  };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI no está definido");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        family: 4,
      })
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB conectado correctamente");
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("❌ Error conectando a MongoDB:", error);
    throw error;
  }
}

module.exports = { connectDB };
