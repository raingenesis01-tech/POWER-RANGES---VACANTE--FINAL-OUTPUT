
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const BLYNK_SERVER = (
  process.env.BLYNK_SERVER || "https://blynk.cloud"
).replace(/\/$/, "");

const BLYNK_AUTH_TOKEN = process.env.BLYNK_AUTH_TOKEN;
const DEMO_MODE = process.env.DEMO_MODE === "true";

const HEARTBEAT_TIMEOUT = 15000;

app.use(express.json());

// Serve the dashboard from the parent folder's public directory
app.use(express.static(path.join(__dirname, "..", "public")));

let demoMotion = false;

// Remember the latest hardware heartbeat
let lastHeartbeatValue = null;
let lastHeartbeatChangeAt = 0;

// Read a Blynk virtual pin
async function readBlynkPin(vpin) {
  if (!BLYNK_AUTH_TOKEN) {
    throw new Error("Blynk Auth Token is missing.");
  }

  const url =
    `${BLYNK_SERVER}/external/api/get` +
    `?token=${encodeURIComponent(BLYNK_AUTH_TOKEN)}` +
    `&${encodeURIComponent(vpin)}`;

  const response = await fetch(url);
  const value = (await response.text()).trim();

  // Show Blynk's actual error message
  if (!response.ok) {
    throw new Error(
        `Blynk pin ${vpin} returned HTTP ${response.status}: ${value}`
      );
  }

  if (value !== "0" && value !== "1") {
    throw new Error(
      `Unexpected Blynk value on ${vpin}: ${value}`
    );
  }

  return value === "1";
}

// Dashboard status endpoint
app.get("/api/status", async (req, res) => {
  try {
    if (DEMO_MODE) {
      return res.json({
        ok: true,
        motion: demoMotion,
        occupied: demoMotion,
        hardwareConnected: false,
        source: "demo",
        checkedAt: new Date().toISOString()
      });
    }

    const motion = await readBlynkPin("V0");
    const heartbeat = await readBlynkPin("V1");

    const now = Date.now();

    if (lastHeartbeatValue === null) {
      lastHeartbeatValue = heartbeat;
    } else if (heartbeat !== lastHeartbeatValue) {
      lastHeartbeatValue = heartbeat;
      lastHeartbeatChangeAt = now;
    }

    const hardwareConnected =
      lastHeartbeatChangeAt > 0 &&
      now - lastHeartbeatChangeAt <= HEARTBEAT_TIMEOUT;

    res.json({
      ok: true,
      motion: hardwareConnected && motion,
      occupied: hardwareConnected && motion,
      hardwareConnected,
      source: "blynk",
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Status error:", error.message);

    res.status(503).json({
      ok: false,
      hardwareConnected: false,
      error: error.message,
      source: "unavailable",
      checkedAt: new Date().toISOString()
    });
  }
});

// Demo controls
app.post("/api/demo/motion", (req, res) => {
  if (!DEMO_MODE) {
    return res.status(403).json({
      ok: false,
      error: "Demo mode is disabled."
    });
  }

  if (typeof req.body.motion !== "boolean") {
    return res.status(400).json({
      ok: false,
      error: "Motion must be true or false."
    });
  }

  demoMotion = req.body.motion;

  res.json({
    ok: true,
    motion: demoMotion,
    occupied: demoMotion,
    source: "demo",
    checkedAt: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `VACANTE server running at http://localhost:${PORT}`
  );

  console.log(
    `Data source: ${DEMO_MODE ? "DEMO" : "BLYNK"}`
  );
});
