import express from "express";

import {
  authenticateDevice,
  getDeviceState,
  deviceHeartbeat,
  setDeviceCommand,
  getDeviceForDashboard,
} from "../controllers/hardwareController.js";

import {
  authenticateToken,
  requireRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// =====================================================
// ESP32
// =====================================================

router.get("/device/:deviceCode/state", authenticateDevice, getDeviceState);

router.post(
  "/device/:deviceCode/heartbeat",
  authenticateDevice,
  deviceHeartbeat,
);

// =====================================================
// WEBSITE / ADMIN
// =====================================================

router.get(
  "/dashboard/:deviceCode",
  authenticateToken,
  requireRole("cooperative_admin", "platform_admin"),
  getDeviceForDashboard,
);

router.patch(
  "/dashboard/:deviceCode/command",
  authenticateToken,
  requireRole("cooperative_admin", "platform_admin"),
  setDeviceCommand,
);

export default router;
