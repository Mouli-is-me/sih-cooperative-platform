import express from "express";
import { supabase } from "../config/supabase.js";

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
// ESP32 DEVICE
// =====================================================

// ESP32 polls this endpoint for commands
router.get("/device/:deviceCode/state", authenticateDevice, getDeviceState);

// ESP32 reports its current state
router.post(
  "/device/:deviceCode/heartbeat",
  authenticateDevice,
  deviceHeartbeat,
);

// =====================================================
// WEBSITE / ADMIN
// =====================================================

// Get device information for admin dashboard
router.get(
  "/dashboard/:deviceCode",
  authenticateToken,
  requireRole("cooperative_admin", "platform_admin"),
  getDeviceForDashboard,
);

// Send command to ESP32 from the website
router.patch(
  "/dashboard/:deviceCode/command",
  authenticateToken,
  requireRole("cooperative_admin", "platform_admin"),
  setDeviceCommand,
);

// =====================================================
// TEMPORARY SIH HARDWARE TEST
// =====================================================
// WARNING:
// This endpoint has NO authentication.
// Use only for testing the ESP32 during development.
// Remove it before final deployment.

router.patch("/test/:deviceCode/command", async (req, res) => {
  try {
    const { deviceCode } = req.params;
    const { state, jobId = null } = req.body;

    const validStates = ["AVAILABLE", "JOB_REQUESTED", "JOB_ACCEPTED"];

    // Validate state
    if (!validStates.includes(state)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATE",
          message: "Invalid hardware state",
        },
      });
    }

    // Find and update device
    const { data, error } = await supabase
      .from("hardware_devices")
      .update({
        desired_state: state,
        pending_job_id: jobId,
        updated_at: new Date().toISOString(),
      })
      .eq("device_code", deviceCode)
      .select()
      .single();

    if (error) {
      console.error("Hardware test command error:", error);

      return res.status(500).json({
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: error.message,
        },
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: {
          code: "DEVICE_NOT_FOUND",
          message: "Device not found",
        },
      });
    }

    console.log(`[HARDWARE TEST] ${deviceCode} -> ${state}`);

    return res.json({
      success: true,
      message: `Device ${deviceCode} command set to ${state}`,
      data,
    });
  } catch (err) {
    console.error("Hardware test command error:", err);

    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Unable to control test device",
      },
    });
  }
});

export default router;
