// .model/db.js
import mongoose from "mongoose";

const USER_DB = process.env.USER_DB || "root";
const PASS = process.env.PASS || "example";
const DB_HOST = process.env.DB_HOST || "mongo"; // Por defecto, el host del contenedor Mongo
const DB_NAME = process.env.DB_NAME || "myProject";

const url = `mongodb://${USER_DB}:${PASS}@${DB_HOST}:27017/${DB_NAME}?authSource=admin`;

export default async function connectDB() {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ Database connected: ${url}`);
  } catch (err) {
    console.error(`❌ Error connecting to database: ${err.message}`);
    process.exit(1); // Finaliza el proceso si falla la conexión
  }

  const dbConnection = mongoose.connection;

  // Listeners para errores y eventos adicionales
  dbConnection.on("error", (err) => {
    console.error(`❌ Database connection error: ${err}`);
  });

  dbConnection.on("disconnected", () => {
    console.warn("⚠️ Database connection lost. Trying to reconnect...");
  });

  return dbConnection;
}
