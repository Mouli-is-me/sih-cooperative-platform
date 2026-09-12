import express from "express";
import { getCooperativeAnalytics } from "../controllers/cooperativeController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected: only cooperative admins and platform admins can view analytics
router.get("/analytics", authenticateToken, requireRole("cooperative_admin", "platform_admin"), getCooperativeAnalytics);

export default router;
