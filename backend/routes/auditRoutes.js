import express from "express";
import { fetchAuditLogs } from "../controllers/auditController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, requireRole("platform_admin", "cooperative_admin"), fetchAuditLogs);

export default router;
