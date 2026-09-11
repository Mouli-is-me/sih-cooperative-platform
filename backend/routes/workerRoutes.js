import express from "express";
import {
  getWorkers,
  getWorkerById,
  updateWorkerStatus,
  registerWorker,
} from "../controllers/workerController.js";

const router = express.Router();

router.get("/", getWorkers);
router.post("/register", registerWorker);
router.get("/:id", getWorkerById);
router.patch("/:id/status", updateWorkerStatus);

export default router;
