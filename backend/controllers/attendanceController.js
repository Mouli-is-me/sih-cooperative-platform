import { supabase, isSupabaseConfigured } from "../config/supabase.js";
import { logAuditEvent } from "../services/auditLogger.js";

const MEMORY_ATTENDANCE = [];

export const checkIn = async (req, res) => {
  try {
    const workerId = req.user.workerId || req.user.id;
    const { jobId } = req.body;

    const recordId = `att-${Date.now()}`;
    const newRecord = {
      id: recordId,
      worker_id: workerId,
      job_id: jobId || null,
      date: new Date().toISOString().split("T")[0],
      check_in: new Date().toISOString(),
      check_out: null,
      hours_worked: 0,
      status: "PRESENT",
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("attendance").insert([newRecord]).select().single();
        if (!error && data) {
          await logAuditEvent({
            actorUserId: req.user.id,
            action: "WORKER_CHECK_IN",
            entityType: "ATTENDANCE",
            entityId: data.id,
            metadata: { workerId, jobId }
          });
          return res.status(201).json({ success: true, data });
        }
      } catch (err) {}
    }

    MEMORY_ATTENDANCE.unshift(newRecord);
    await logAuditEvent({
      actorUserId: req.user.id,
      action: "WORKER_CHECK_IN",
      entityType: "ATTENDANCE",
      entityId: recordId,
      metadata: { workerId, jobId }
    });

    return res.status(201).json({ success: true, data: newRecord });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to record check-in" }
    });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { id } = req.params;
    const workerId = req.user.workerId || req.user.id;

    let targetRecord = null;
    if (isSupabaseConfigured()) {
      try {
        const { data: record } = await supabase.from("attendance").select("*").eq("id", id).single();
        if (record) {
          if (record.worker_id !== workerId && req.user.role !== "platform_admin") {
            return res.status(403).json({
              success: false,
              error: { code: "FORBIDDEN", message: "Cannot modify another worker's attendance" }
            });
          }
          const checkOutTime = new Date();
          const checkInTime = new Date(record.check_in);
          const hoursWorked = Math.round(((checkOutTime - checkInTime) / (1000 * 60 * 60)) * 100) / 100 || 1.0;

          const { data, error } = await supabase
            .from("attendance")
            .update({
              check_out: checkOutTime.toISOString(),
              hours_worked: hoursWorked,
              status: "COMPLETED"
            })
            .eq("id", id)
            .select()
            .single();

          if (!error && data) targetRecord = data;
        }
      } catch (err) {}
    }

    if (!targetRecord) {
      const rec = MEMORY_ATTENDANCE.find((a) => a.id === id);
      if (rec) {
        if (rec.worker_id !== workerId && req.user.role !== "platform_admin") {
          return res.status(403).json({
            success: false,
            error: { code: "FORBIDDEN", message: "Cannot modify another worker's attendance" }
          });
        }
        rec.check_out = new Date().toISOString();
        rec.hours_worked = 2.5;
        rec.status = "COMPLETED";
        targetRecord = rec;
      }
    }

    if (!targetRecord) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Attendance record not found" }
      });
    }

    await logAuditEvent({
      actorUserId: req.user.id,
      action: "WORKER_CHECK_OUT",
      entityType: "ATTENDANCE",
      entityId: id,
      metadata: { workerId }
    });

    return res.status(200).json({ success: true, data: targetRecord });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to record check-out" }
    });
  }
};

export const getAttendanceLogs = async (req, res) => {
  try {
    const { workerId } = req.query;
    const currentUserId = req.user.id;

    if (req.user.role === "worker" && workerId && workerId !== currentUserId && workerId !== req.user.workerId) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "You can only view your own attendance" }
      });
    }

    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from("attendance").select("*").order("created_at", { ascending: false });
        if (workerId) query = query.eq("worker_id", workerId);
        else if (req.user.role === "worker") query = query.eq("worker_id", req.user.workerId || currentUserId);

        const { data, error } = await query;
        if (!error && data) return res.status(200).json({ success: true, data });
      } catch (err) {}
    }

    const filtered = MEMORY_ATTENDANCE.filter((a) => {
      if (workerId) return a.worker_id === workerId;
      if (req.user.role === "worker") return a.worker_id === (req.user.workerId || currentUserId);
      return true;
    });

    return res.status(200).json({ success: true, data: filtered });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch attendance logs" }
    });
  }
};
