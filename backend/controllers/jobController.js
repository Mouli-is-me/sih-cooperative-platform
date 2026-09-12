import { supabase, isSupabaseConfigured } from "../config/supabase.js";
import { logAuditEvent } from "../services/auditLogger.js";

const MEMORY_JOBS = new Map();
const MEMORY_APPLICATIONS = new Map();
const MEMORY_NOTIFICATIONS = [];

export const getJobs = async (req, res) => {
  try {
    const { category, location, limit = 20, offset = 0 } = req.query;

    if (isSupabaseConfigured()) {
      let query = supabase.from("jobs").select("*, cooperatives(name, location)", { count: "exact" });
      if (category) query = query.eq("category", category);
      if (location) query = query.ilike("location", `%${location}%`);
      
      query = query.order("created_at", { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);
      
      const { data, error, count } = await query;
      if (!error && data) {
        return res.status(200).json({
          success: true,
          data: data,
          pagination: { total: count || data.length, limit: Number(limit), offset: Number(offset) }
        });
      }
    }

    const allJobs = Array.from(MEMORY_JOBS.values());
    const filtered = allJobs.filter(j => {
      if (category && j.category !== category) return false;
      if (location && !j.location.toLowerCase().includes(location.toLowerCase())) return false;
      return true;
    });

    return res.status(200).json({
      success: true,
      data: filtered.slice(Number(offset), Number(offset) + Number(limit)),
      pagination: { total: filtered.length, limit: Number(limit), offset: Number(offset) }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch jobs", details: err.message }
    });
  }
};

export const createJob = async (req, res) => {
  try {
    const { title, description, category, location, wage, requiredSkills = [], startDate, endDate, cooperativeId } = req.body;

    const jobId = `job-${Date.now()}`;
    const newJob = {
      id: jobId,
      cooperative_id: cooperativeId || "coop-mdu-01",
      created_by: req.user.id,
      title,
      description,
      category,
      required_skills: requiredSkills,
      location,
      wage: Number(wage),
      start_date: startDate || new Date().toISOString(),
      end_date: endDate || null,
      status: "OPEN",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("jobs").insert([newJob]).select().single();
        if (!error && data) {
          await logAuditEvent({
            actorUserId: req.user.id,
            action: "JOB_CREATE",
            entityType: "JOB",
            entityId: data.id,
            metadata: { title, wage, category }
          });
          return res.status(201).json({ success: true, data });
        }
      } catch (err) {}
    }

    MEMORY_JOBS.set(jobId, newJob);
    await logAuditEvent({
      actorUserId: req.user.id,
      action: "JOB_CREATE",
      entityType: "JOB",
      entityId: jobId,
      metadata: { title, wage, category }
    });

    return res.status(201).json({ success: true, data: newJob });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to create job", details: err.message }
    });
  }
};

export const applyForJob = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const workerId = req.user.workerId || req.user.id;

    // Check if duplicate application
    if (isSupabaseConfigured()) {
      try {
        const { data: existing } = await supabase
          .from("applications")
          .select("*")
          .eq("job_id", jobId)
          .eq("worker_id", workerId)
          .single();

        if (existing) {
          return res.status(409).json({
            success: false,
            error: { code: "DUPLICATE_APPLICATION", message: "You have already applied for this job opportunity" }
          });
        }
      } catch (err) {}
    }

    const existingMemoryApp = Array.from(MEMORY_APPLICATIONS.values()).find(
      (a) => a.job_id === jobId && a.worker_id === workerId
    );
    if (existingMemoryApp) {
      return res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_APPLICATION", message: "You have already applied for this job opportunity" }
      });
    }

    const appId = `app-${Date.now()}`;
    const application = {
      id: appId,
      job_id: jobId,
      worker_id: workerId,
      status: "PENDING",
      applied_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("applications").insert([application]).select().single();
        if (!error && data) {
          await createNotificationHelper(req.user.id, "Job Application Received", `Your application for job #${jobId} has been submitted for review.`, "APPLICATION");
          await logAuditEvent({
            actorUserId: req.user.id,
            action: "APPLICATION_SUBMIT",
            entityType: "APPLICATION",
            entityId: data.id,
            metadata: { jobId, workerId }
          });
          return res.status(201).json({ success: true, data });
        }
      } catch (err) {}
    }

    MEMORY_APPLICATIONS.set(appId, application);
    await createNotificationHelper(req.user.id, "Job Application Received", `Your application for job #${jobId} has been submitted for review.`, "APPLICATION");
    await logAuditEvent({
      actorUserId: req.user.id,
      action: "APPLICATION_SUBMIT",
      entityType: "APPLICATION",
      entityId: appId,
      metadata: { jobId, workerId }
    });

    return res.status(201).json({ success: true, data: application });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to submit job application", details: err.message }
    });
  }
};

export const reviewApplication = async (req, res) => {
  try {
    const { id: appId } = req.params;
    const { status, notes } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_STATUS", message: "Status must be APPROVED or REJECTED" }
      });
    }

    let targetApp = null;
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("applications")
          .update({
            status,
            notes,
            reviewed_at: new Date().toISOString(),
            reviewed_by: req.user.id
          })
          .eq("id", appId)
          .select()
          .single();

        if (!error && data) targetApp = data;
      } catch (err) {}
    }

    if (!targetApp && MEMORY_APPLICATIONS.has(appId)) {
      targetApp = MEMORY_APPLICATIONS.get(appId);
      targetApp.status = status;
      targetApp.notes = notes;
      targetApp.reviewed_at = new Date().toISOString();
      targetApp.reviewed_by = req.user.id;
    }

    if (!targetApp) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Application not found" }
      });
    }

    // Send notification to applicant
    await createNotificationHelper(
      targetApp.worker_id,
      `Job Application ${status}`,
      `Your job application #${appId} has been ${status.toLowerCase()} by the cooperative administration.`,
      status === "APPROVED" ? "SUCCESS" : "ALERT"
    );

    await logAuditEvent({
      actorUserId: req.user.id,
      action: `APPLICATION_${status}`,
      entityType: "APPLICATION",
      entityId: appId,
      metadata: { status, reviewedBy: req.user.id }
    });

    return res.status(200).json({ success: true, data: targetApp });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to review application", details: err.message }
    });
  }
};

// Helper notification function
export const createNotificationHelper = async (userId, title, message, type = "INFO") => {
  const notif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    user_id: userId,
    title,
    message,
    type,
    read_status: false,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from("notifications").insert([notif]);
    } catch (e) {}
  }
  MEMORY_NOTIFICATIONS.unshift(notif);
  return notif;
};
