import express from "express";
import {
  createServiceRequest,
  calculateMatchesForIntent,
  updateRequestStatus
} from "../controllers/requestController.js";

const router = express.Router();

router.post("/", createServiceRequest);
router.post("/matches", calculateMatchesForIntent);
router.patch("/:id/status", updateRequestStatus);

export default router;
