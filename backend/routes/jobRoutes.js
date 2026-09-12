import express from "express";
import { getJobs, createJob, applyForJob, reviewApplication } from "../controllers/jobController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";
import { validateRequest, createJobSchema } from "../middleware/validators.js";

const router = express.Router();

router.get("/", getJobs);
router.post("/", authenticateToken, requireRole("cooperative_admin", "platform_admin"), validateRequest(createJobSchema), createJob);
router.post("/:id/apply", authenticateToken, requireRole("worker", "cooperative_member"), applyForJob);
router.patch("/applications/:id/status", authenticateToken, requireRole("cooperative_admin", "platform_admin"), reviewApplication);

export default router;
