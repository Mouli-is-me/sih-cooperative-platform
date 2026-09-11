import express from "express";
import {
  getAssessmentConfig,
  submitAssessment,
  getPendingAssessments,
  verifyAssessment
} from "../controllers/assessmentController.js";

const router = express.Router();

router.get("/config/:category", getAssessmentConfig);
router.get("/pending", getPendingAssessments);
router.post("/submit", submitAssessment);
router.patch("/:id/verify", verifyAssessment);

export default router;
