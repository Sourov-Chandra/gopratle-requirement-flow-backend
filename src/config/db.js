import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/eventtalentbridge_assignment";
const dbName = process.env.MONGODB_DB_NAME || "eventtalentbridge_assignment";

let client = null;
let db = null;

export async function connectDB() {
  if (db) return db;

  try {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    db = client.db(dbName);
    console.log(`[Database] Connected successfully to MongoDB (${dbName})`);

    // Initialize recommended indexes
    await initIndexes(db);

    return db;
  } catch (error) {
    console.error("[Database] Connection failed:", error.message);
    throw error;
  }
}

export function getDB() {
  if (!db) {
    throw new Error("Database not connected. Call connectDB first.");
  }
  return db;
}

export function getRequirementsCollection() {
  return getDB().collection("requirements");
}

export async function checkDBHealth() {
  try {
    if (!client || !db) return false;
    await db.command({ ping: 1 });
    return true;
  } catch (err) {
    return false;
  }
}

export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("[Database] MongoDB connection closed.");
  }
}

async function initIndexes(database) {
  try {
    const col = database.collection("requirements");
    await col.createIndex({ createdAt: -1 });
    await col.createIndex({ category: 1, createdAt: -1 });
    await col.createIndex({ eventType: 1, createdAt: -1 });
    console.log("[Database] Indexes verified on requirements collection.");
  } catch (err) {
    console.warn("[Database] Index setup warning:", err.message);
  }
}
