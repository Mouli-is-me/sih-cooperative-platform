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

// =====================================================
// SIH DEMO MODE
// =====================================================
// Temporary demo endpoints.
// These are intentionally separate from the secured
// admin endpoints so Demo Mode can showcase the physical
// ESP32 without requiring a real admin JWT.
//
// REMOVE THESE BEFORE PRODUCTION.
// =====================================================

// -----------------------------------------------------
// Demo: get physical device status
// -----------------------------------------------------

router.get("/test/:deviceCode/status", async (req, res) => {
  try {
    const { deviceCode } = req.params;

    const { data, error } = await supabase
      .from("hardware_devices")
      .select(
        `
          id,
          device_code,
          device_name,
          worker_id,
          desired_state,
          reported_state,
          pending_job_id,
          is_online,
          last_seen_at,
          workers (
            id,
            name,
            title,
            category
          )
        `,
      )
      .eq("device_code", deviceCode)
      .single();

    if (error) {
      console.error("[DEMO HARDWARE STATUS]", error);

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

    const isOnline =
      data.last_seen_at &&
      Date.now() - new Date(data.last_seen_at).getTime() < 15000;

    return res.json({
      success: true,

      device: {
        id: data.id,
        deviceCode: data.device_code,
        deviceName: data.device_name,

        worker: data.workers,

        desiredState: data.desired_state,

        reportedState: data.reported_state,

        pendingJobId: data.pending_job_id,

        isOnline,

        lastSeenAt: data.last_seen_at,
      },
    });
  } catch (err) {
    console.error("[DEMO HARDWARE STATUS]", err);

    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Unable to load hardware status",
      },
    });
  }
});

// -----------------------------------------------------
// Demo: send command to physical device
// -----------------------------------------------------

router.patch("/test/:deviceCode/command", async (req, res) => {
  try {
    const { deviceCode } = req.params;

    const { state, jobId = null } = req.body;

    const validStates = ["AVAILABLE", "JOB_REQUESTED", "JOB_ACCEPTED"];

    if (!validStates.includes(state)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATE",
          message: "Invalid hardware state",
        },
      });
    }

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
      console.error("[DEMO HARDWARE COMMAND]", error);

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

    console.log(`[DEMO HARDWARE] ${deviceCode} -> ${state}`);

    return res.json({
      success: true,

      message: `Device ${deviceCode} command set to ${state}`,

      data,
    });
  } catch (err) {
    console.error("[DEMO HARDWARE COMMAND]", err);

    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Unable to control hardware",
      },
    });
  }
});

export default router;
