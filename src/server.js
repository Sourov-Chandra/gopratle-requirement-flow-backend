import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB, closeDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    console.log("[Server] Connecting to MongoDB...");
    try {
      await connectDB();
    } catch (dbErr) {
      console.warn(
        `[Server] MongoDB connection attempt failed (${dbErr.message}). Server will start, but database operations will return 503 until connected.`
      );
    }

    const server = app.listen(PORT, () => {
      console.log(`[Server] EventTalentBridge API is running on http://localhost:${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
      console.log(`[Server] Requirements API: http://localhost:${PORT}/api/requirements`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        console.log("[Server] HTTP listener closed.");
        await closeDB();
        process.exit(0);
      });

      // Force exit after 10s if hanging
      setTimeout(() => {
        console.error("[Server] Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("[Server] Critical startup error:", err);
    process.exit(1);
  }
}

bootstrap();
