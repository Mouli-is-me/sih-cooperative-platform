import express from "express";
import {
  createServiceRequest,
  calculateMatchesForIntent,
  updateRequestStatus,
} from "../controllers/requestController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  validateRequest,
  createServiceRequestSchema,
  updateRequestStatusSchema,
} from "../middleware/validators.js";

const router = express.Router();

// Protected: creating a request requires authentication
router.post(
  "/",
  authenticateToken,
  validateRequest(createServiceRequestSchema),
  createServiceRequest,
);
// Public: match scoring is a read-only computation
router.post("/matches", calculateMatchesForIntent);
// Protected: status transitions require authentication
router.patch(
  "/:id/status",
  authenticateToken,
  validateRequest(updateRequestStatusSchema),
  updateRequestStatus,
);

export default router;
