import { SEED_WORKERS } from "../seed/seedWorkers.js";
import {
  getWorkersFromSupabase,
  getWorkerByIdFromSupabase,
  updateWorkerStatusInSupabase,
  isSupabaseConfigured,
} from "../config/supabase.js";

// Normalize worker objects for frontend API consistency
const formatWorker = (w) => {
  const id = w.id || w._id?.toString() || w.coopId;
  return {
    ...w,
    id,
    _id: id,
    jobsCompleted: w.jobsCompleted ?? w.jobs_completed ?? 0,
    onTimeRate: w.onTimeRate ?? w.on_time_rate ?? 95,
    reliabilityScore: w.reliabilityScore ?? w.reliability_score ?? 95,
    workloadCapacity: w.workloadCapacity ?? w.workload_capacity ?? 30,
    isAvailable: w.isAvailable ?? w.is_available ?? true,
    skillFitPercent: w.skillFitPercent ?? w.skill_fit_percent ?? 90,
    verifiedSkillLevel:
      w.verifiedSkillLevel ?? w.verified_skill_level ?? "Advanced",
    practicalVerificationStatus: w.practicalVerificationStatus ?? "UNVERIFIED",
  };
};

export const registerWorker = async (req, res) => {
  const {
    name,
    phone,
    email,
    password,
    category,
    experienceYears,
    cooperative,
    skillTestScore,
    verified,
  } = req.body;
  if (
    !name ||
    !phone ||
    !email ||
    !password ||
    !category ||
    experienceYears === undefined
  ) {
    return res
      .status(400)
      .json({ error: "Missing required worker profile fields" });
  }
  if (!/^\d{10}$/.test(String(phone).replace(/\D/g, ""))) {
    return res
      .status(400)
      .json({ error: "Phone number must contain 10 digits" });
  }

  const generatedId = `worker-${Date.now()}`;
  const workerPayload = {
    id: generatedId,
    name,
    title: `${category[0].toUpperCase()}${category.slice(1)} Specialist`,
    category: category.toLowerCase(),
    cooperative: cooperative || "Independent Cooperative Applicant",
    coopId: `MDU-LAB-${Math.floor(1000 + Math.random() * 9000)}`,
    rating: 0,
    jobsCompleted: 0,
    experienceYears: Number(experienceYears),
    skillFitPercent: Number(skillTestScore) || 0,
    verifiedSkillLevel:
      Number(skillTestScore) >= 80 ? "Advanced" : "Pending Assessment",
    badge: verified ? "Phone Verified Applicant" : "Pending Verification",
    isAvailable: false,
    status: "UNAVAILABLE",
    availability: "Pending onboarding review",
    practicalVerificationStatus: "UNVERIFIED",
    skills: [],
    verifications: verified
      ? ["Phone Verification Complete", "Skill Assessment Complete"]
      : [],
    createdAt: new Date(),
  };

  // We rely on Supabase for the primary DB, so registerWorker should be integrated with auth.
  // This route handles fallback generation for now.
  return res.status(201).json(formatWorker(workerPayload));
};

export const getWorkers = async (req, res) => {
  if (isSupabaseConfigured()) {
    const supabaseWorkers = await getWorkersFromSupabase();
    if (supabaseWorkers && supabaseWorkers.length > 0) {
      return res.status(200).json(supabaseWorkers.map(formatWorker));
    }
  }

  return res.status(200).json(SEED_WORKERS.map(formatWorker));
};

export const getWorkerById = async (req, res) => {
  const { id } = req.params;

  if (isSupabaseConfigured()) {
    const supabaseWorker = await getWorkerByIdFromSupabase(id);
    if (supabaseWorker)
      return res.status(200).json(formatWorker(supabaseWorker));
  }

  const match = SEED_WORKERS.find(
    (w) => w.coopId === id || w.name.toLowerCase().includes(id.toLowerCase()) || w.id === id,
  );
  if (!match)
    return res.status(404).json({ error: "Worker not found in database" });
  return res.status(200).json(formatWorker(match));
};

/**
 * Worker Status Update API
 * Endpoint: PATCH /api/workers/:id/status
 * Payload: { status: "AVAILABLE" | "BUSY" | "UNAVAILABLE" }
 */
export const updateWorkerStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const VALID_STATUSES = ["AVAILABLE", "BUSY", "UNAVAILABLE"];
  if (!status || !VALID_STATUSES.includes(status.toUpperCase())) {
    return res.status(400).json({
      error: `Invalid status: '${status}'. Status must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  const normalizedStatus = status.toUpperCase();
  const isAvailable = normalizedStatus === "AVAILABLE";
  const availabilityText = isAvailable
    ? "Available Now"
    : normalizedStatus === "BUSY"
      ? "Busy on assignment"
      : "Unavailable";

  if (isSupabaseConfigured()) {
    const sbResult = await updateWorkerStatusInSupabase(
      id,
      normalizedStatus,
      isAvailable,
      availabilityText,
      req.user.id,
      req.user.role === "platform_admin",
    );
    if (sbResult) return res.status(200).json(formatWorker(sbResult));
  }

  const match = SEED_WORKERS.find(
    (w) => w.coopId === id || w.name.toLowerCase().includes(id.toLowerCase()) || w.id === id,
  );
  if (!match) return res.status(404).json({ error: "Worker not found" });
  
  match.status = normalizedStatus;
  match.isAvailable = isAvailable;
  match.availability = availabilityText;

  return res.status(200).json(formatWorker(match));
};
