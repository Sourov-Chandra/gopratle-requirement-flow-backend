import { checkDBHealth } from "../config/db.js";

export async function getHealth(req, res) {
  const isDBConnected = await checkDBHealth();

  if (!isDBConnected) {
    return res.status(503).json({
      success: false,
      message: "Database dependency unavailable",
      data: {
        status: "degraded",
        database: "disconnected",
      },
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      status: "ok",
      database: "connected",
      service: "EventTalentBridge API",
      timestamp: new Date().toISOString(),
    },
  });
}
