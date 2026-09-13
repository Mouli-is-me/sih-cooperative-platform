import { rankWorkersFairMatch } from "../services/fairMatchEngine.js";
import { transitionRequest, STAGES } from "../services/lifecycle.js";
import {
  createServiceRequestInSupabase,
  updateServiceRequestStatusInSupabase,
  getWorkersFromSupabase,
  isSupabaseConfigured,
} from "../config/supabase.js";

import { SEED_WORKERS } from "../seed/seedWorkers.js";

const FALLBACK_REQUESTS = new Map();

const normalizeRequestId = (request) => request.id || request._id?.toString();

export const createServiceRequest = async (req, res) => {
  try {
    const {
      customerType,
      serviceCategory,
      taskDetail,
      location,
      customerName,
      urgency,
    } = req.body;

    if (!serviceCategory || !taskDetail || !location) {
      return res.status(400).json({
        error: "Missing required fields: serviceCategory, taskDetail, location",
      });
    }

    const payload = {
      customerType: customerType || "Household",
      serviceCategory,
      taskDetail,
      urgency: urgency || "Standard",
      location,
      customerName: req.user.fullName || customerName || "Customer",
      customer_id: req.user.id,
      status: STAGES.CREATED,
      raw_text: req.body.rawText || "",
    };

    if (customerType && !["Household", "Institution"].includes(customerType)) {
      return res
        .status(400)
        .json({ error: "customerType must be Household or Institution" });
    }

    let saved = null;
    if (isSupabaseConfigured()) {
      saved = await createServiceRequestInSupabase(payload);
    }

    if (!saved) {
      // Database offline fallback
      saved = {
        id: `req-${Date.now()}`,
        ...payload,
        createdAt: new Date(),
      };
    }

    if (!saved && process.env.NODE_ENV === "production") {
      return res.status(503).json({
        success: false,
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "Service is temporarily unavailable. Please try again.",
        },
      });
    }

    FALLBACK_REQUESTS.set(normalizeRequestId(saved), saved);

    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error creating service request",
      details: err.message,
    });
  }
};

export const calculateMatchesForIntent = async (req, res) => {
  try {
    const intent = req.body || {};
    let workers = [];

    if (isSupabaseConfigured()) {
      workers = await getWorkersFromSupabase();
    }

    if (!workers || workers.length === 0) {
      workers = SEED_WORKERS;
    }

    const matches = rankWorkersFairMatch(intent, workers).map((entry) => ({
      ...entry,
      worker: {
        ...entry.worker,
        id: entry.worker.id || entry.worker._id?.toString(),
      },
    }));
    return res.status(200).json(matches);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error scoring matches", details: err.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status, assignedWorkerId } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Target status is required" });
  }

  if (isSupabaseConfigured()) {
    const sbResult = await updateServiceRequestStatusInSupabase(
      id,
      status,
      req.user.id,
      req.user.role === "platform_admin",
      assignedWorkerId,
    );
    if (sbResult?.transitionError) {
      return res.status(400).json({ error: sbResult.transitionError });
    }
    if (sbResult) return res.status(200).json(sbResult);
    if (process.env.NODE_ENV === "production") {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Service request not found" },
      });
    }
  }

  try {
    const fallbackRequest = FALLBACK_REQUESTS.get(id);
    const currentReq = fallbackRequest || {
      id,
      status: req.body.currentStatus || STAGES.CREATED,
    };

    const transitionResult = transitionRequest(currentReq, status);

    if (!transitionResult.success) {
      return res.status(400).json({ error: transitionResult.error });
    }

    currentReq.id = id;
    currentReq.status = status;
    if (assignedWorkerId) currentReq.assignedWorkerId = assignedWorkerId;
    FALLBACK_REQUESTS.set(id, currentReq);
    return res.status(200).json(transitionResult.request);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error updating request status", details: err.message });
  }
};
