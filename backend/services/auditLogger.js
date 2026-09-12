import { supabase, isSupabaseConfigured } from "../config/supabase.js";

const MEMORY_AUDIT_LOGS = [];

export const logAuditEvent = async ({
  actorUserId = null,
  action,
  entityType,
  entityId = null,
  metadata = {},
  ipAddress = null,
}) => {
  // Sanitize metadata to remove any potential passwords, tokens, or secrets
  const sanitizedMetadata = { ...metadata };
  delete sanitizedMetadata.password;
  delete sanitizedMetadata.passwordHash;
  delete sanitizedMetadata.token;
  delete sanitizedMetadata.accessToken;
  delete sanitizedMetadata.refreshToken;

  const logEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    actor_user_id: actorUserId,
    action,
    entity_type: entityType,
    entity_id: entityId ? String(entityId) : null,
    metadata: sanitizedMetadata,
    ip_address: ipAddress,
    created_at: new Date().toISOString(),
  };

  console.log(`[Audit Log] ${action} | Entity: ${entityType} (${entityId || "N/A"}) | Actor: ${actorUserId || "SYSTEM"}`);

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("audit_logs").insert([logEntry]);
      if (error) {
        console.warn("[Audit Log Warning] Supabase log failed:", error.message);
      }
    } catch (err) {
      console.warn("[Audit Log Exception]:", err.message);
    }
  }

  MEMORY_AUDIT_LOGS.unshift(logEntry);
  if (MEMORY_AUDIT_LOGS.length > 500) MEMORY_AUDIT_LOGS.pop();

  return logEntry;
};

export const getAuditLogs = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!error && data) return data;
    } catch (err) {}
  }
  return MEMORY_AUDIT_LOGS;
};
