import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing");
}

let isConnected = false;

export default async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  const conn = await mongoose.connect(MONGODB_URI, {
    dbName: "customerdrift",
  });

  isConnected = conn.connections[0].readyState === 1;

  console.log("Connected to DB:", conn.connection.db?.databaseName);

  return conn;
}