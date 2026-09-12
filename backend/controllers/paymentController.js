import { supabase, isSupabaseConfigured } from "../config/supabase.js";
import { logAuditEvent } from "../services/auditLogger.js";

const MEMORY_PAYMENTS = [];

export const getPayments = async (req, res) => {
  try {
    const { workerId } = req.query;
    const currentUserId = req.user.id;

    // Object ownership check
    if (req.user.role === "worker" && workerId && workerId !== currentUserId && workerId !== req.user.workerId) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "You can only view your own payment records" }
      });
    }

    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from("payments").select("*").order("created_at", { ascending: false });
        if (workerId) query = query.eq("worker_id", workerId);
        else if (req.user.role === "worker") query = query.eq("worker_id", req.user.workerId || currentUserId);

        const { data, error } = await query;
        if (!error && data) return res.status(200).json({ success: true, data });
      } catch (err) {}
    }

    const filtered = MEMORY_PAYMENTS.filter((p) => {
      if (workerId) return p.worker_id === workerId;
      if (req.user.role === "worker") return p.worker_id === (req.user.workerId || currentUserId);
      return true;
    });

    return res.status(200).json({ success: true, data: filtered });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch payment records" }
    });
  }
};

export const createPayment = async (req, res) => {
  try {
    const { workerId, cooperativeId, jobId, amount } = req.body;

    if (!workerId || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Valid workerId and positive amount required" }
      });
    }

    const payId = `pay-${Date.now()}`;
    const transactionRef = `TXN-COOP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment = {
      id: payId,
      worker_id: workerId,
      cooperative_id: cooperativeId || "coop-mdu-01",
      job_id: jobId || null,
      amount: Number(amount),
      payment_status: "COMPLETED",
      payment_date: new Date().toISOString(),
      transaction_reference: transactionRef,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("payments").insert([newPayment]).select().single();
        if (!error && data) {
          await logAuditEvent({
            actorUserId: req.user.id,
            action: "PAYMENT_RECORD_CREATE",
            entityType: "PAYMENT",
            entityId: data.id,
            metadata: { workerId, amount, transactionRef }
          });
          return res.status(201).json({ success: true, data });
        }
      } catch (err) {}
    }

    MEMORY_PAYMENTS.unshift(newPayment);
    await logAuditEvent({
      actorUserId: req.user.id,
      action: "PAYMENT_RECORD_CREATE",
      entityType: "PAYMENT",
      entityId: payId,
      metadata: { workerId, amount, transactionRef }
    });

    return res.status(201).json({ success: true, data: newPayment });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to record payment" }
    });
  }
};
