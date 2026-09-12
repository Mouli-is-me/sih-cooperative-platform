import { getAuditLogs } from "../services/auditLogger.js";

export const fetchAuditLogs = async (req, res) => {
  try {
    const logs = await getAuditLogs();
    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch audit logs" },
    });
  }
};
