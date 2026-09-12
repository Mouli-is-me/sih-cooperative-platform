import express from "express";
import {
  getWorkers,
  getWorkerById,
  updateWorkerStatus,
} from "../controllers/workerController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: list workers (needed for FairMatch display)
router.get("/", getWorkers);
// Public: view single worker profile
router.get("/:id", getWorkerById);
// Protected: only authenticated users can update worker status
router.patch("/:id/status", authenticateToken, updateWorkerStatus);

export default router;
