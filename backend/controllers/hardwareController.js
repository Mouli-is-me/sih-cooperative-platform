import { supabase, isSupabaseConfigured } from "../config/supabase.js";

const DEVICE_CODE = "DEV-001";
const DEVICE_KEY = "SIH-DEV001-2026";

const ONLINE_WINDOW_MS = 15000;

// =====================================================
// DEVICE AUTHENTICATION
// =====================================================

export const authenticateDevice = async (req, res, next) => {
  const deviceCode = req.headers["x-device-code"];
  const deviceKey = req.headers["x-device-key"];

  if (deviceCode !== DEVICE_CODE || deviceKey !== DEVICE_KEY) {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_DEVICE",
        message: "Invalid device credentials",
      },
    });
  }

  next();
};

// =====================================================
// ESP32 POLLS THIS ENDPOINT
// =====================================================

export const getDeviceState = async (req, res) => {
  try {
    const { deviceCode } = req.params;

    const { data, error } = await supabase
      .from("hardware_devices")
      .select(
        `
        *,
        workers (
          id,
          name
        )
      `,
      )
      .eq("device_code", deviceCode)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: {
          code: "DEVICE_NOT_FOUND",
          message: "Device not found",
        },
      });
    }

    await supabase
      .from("hardware_devices")
      .update({
        is_online: true,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("device_code", deviceCode);

    return res.json({
      success: true,

      device: {
        deviceCode: data.device_code,
        deviceName: data.device_name,
        workerId: data.worker_id,
        workerName: data.workers?.name || "Unknown",
      },

      command: {
        state: data.desired_state,
        jobId: data.pending_job_id,
      },

      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Hardware state error:", err);

    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Unable to get device state",
      },
    });
  }
};

// =====================================================
// ESP32 REPORTS ITS CURRENT STATE
// =====================================================

export const deviceHeartbeat = async (req, res) => {
  try {
    const { deviceCode } = req.params;

    const { state = "AVAILABLE" } = req.body;

    const validStates = [
      "AVAILABLE",
      "JOB_REQUESTED",
      "JOB_ACCEPTED",
      "OFFLINE",
    ];

    if (!validStates.includes(state)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATE",
          message: "Invalid device state",
        },
      });
    }

    const { data, error } = await supabase
      .from("hardware_devices")
      .update({
        reported_state: state,
        is_online: true,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("device_code", deviceCode)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Hardware heartbeat error:", err);

    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Heartbeat failed",
      },
    });
  }
};

// =====================================================
// WEBSITE → HARDWARE
// SEND JOB REQUEST / ACCEPT / AVAILABLE
// =====================================================

export const setDeviceCommand = async (req, res) => {
  try {
    const { deviceCode } = req.params;

    const { state, jobId = null } = req.body;

    const validStates = ["AVAILABLE", "JOB_REQUESTED", "JOB_ACCEPTED"];

    if (!validStates.includes(state)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATE",
          message: "Invalid hardware command",
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

    if (error || !data) {
      throw error || new Error("Device not found");
    }

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Hardware command error:", err);

    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Unable to control device",
      },
    });
  }
};

// =====================================================
// WEBSITE DASHBOARD
// =====================================================

export const getDeviceForDashboard = async (req, res) => {
  try {
    const { deviceCode } = req.params;

    const { data, error } = await supabase
      .from("hardware_devices")
      .select(
        `
        *,
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

    if (error || !data) {
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
      Date.now() - new Date(data.last_seen_at).getTime() < ONLINE_WINDOW_MS;

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
    console.error("Hardware dashboard error:", err);

    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Unable to load hardware device",
      },
    });
  }
};
