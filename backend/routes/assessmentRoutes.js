import express from "express";
import {
  getAssessmentConfig,
  submitAssessment,
  getPendingAssessments,
  verifyAssessment
} from "../controllers/assessmentController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: assessment config is read-only reference data
router.get("/config/:category", getAssessmentConfig);
// Protected: submitting requires authentication
router.post("/submit", authenticateToken, submitAssessment);
// Protected: viewing pending assessments requires admin role
router.get("/pending", authenticateToken, requireRole("cooperative_admin", "platform_admin"), getPendingAssessments);
// Protected: verifying requires admin role
router.patch("/:id/verify", authenticateToken, requireRole("cooperative_admin", "platform_admin"), verifyAssessment);

export default router;
