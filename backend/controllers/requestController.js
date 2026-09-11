import ServiceRequest from "../models/ServiceRequest.js";
import Worker from "../models/Worker.js";
import mongoose from "mongoose";
import { rankWorkersFairMatch } from "../services/fairMatchEngine.js";
import { transitionRequest, STAGES } from "../services/lifecycle.js";
import {
  createServiceRequestInSupabase,
  updateServiceRequestStatusInSupabase,
  getWorkersFromSupabase,
  isSupabaseConfigured
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
      customerName: customerName || "Anand Sundaram",
      status: STAGES.CREATED,
      rawText: req.body.rawText || "",
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
      try {
        const newReq = new ServiceRequest(payload);
        saved = await newReq.save();
      } catch (dbErr) {
        // Database offline fallback
        saved = {
          id: `req-${Date.now()}`,
          ...payload,
          createdAt: new Date(),
        };
      }
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
      try {
        workers = await Worker.find();
      } catch (err) {
        // Fallback
      }
    }

    if (!workers || workers.length === 0) {
      workers = MOCK_WORKERS;
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
    const sbResult = await updateServiceRequestStatusInSupabase(id, status);
    if (sbResult) return res.status(200).json(sbResult);
  }

  try {
    let requestDoc = null;
    try {
      requestDoc = await ServiceRequest.findById(id);
    } catch (err) {
      // Fallback mock handling
    }

    const fallbackRequest = FALLBACK_REQUESTS.get(id);
    const currentReq = requestDoc
      ? requestDoc.toObject()
      : fallbackRequest || {
          id,
          status: req.body.currentStatus || STAGES.CREATED,
        };

    const transitionResult = transitionRequest(currentReq, status);

    if (!transitionResult.success) {
      return res.status(400).json({ error: transitionResult.error });
    }

    if (requestDoc) {
      requestDoc.status = status;
      requestDoc.transitionTimestamps = currentReq.transitionTimestamps;
      if (
        assignedWorkerId &&
        mongoose.Types.ObjectId.isValid(assignedWorkerId)
      ) {
        requestDoc.assignedWorkerId = assignedWorkerId;
      }
      await requestDoc.save();
      return res.status(200).json(requestDoc);
    }

    currentReq.id = id;
    if (assignedWorkerId) currentReq.assignedWorkerId = assignedWorkerId;
    FALLBACK_REQUESTS.set(id, currentReq);
    return res.status(200).json(transitionResult.request);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error updating request status", details: err.message });
  }
};

