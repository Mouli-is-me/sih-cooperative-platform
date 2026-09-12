import express from "express";
import { checkIn, checkOut, getAttendanceLogs } from "../controllers/attendanceController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getAttendanceLogs);
router.post("/check-in", authenticateToken, requireRole("worker", "cooperative_member"), checkIn);
router.patch("/:id/check-out", authenticateToken, requireRole("worker", "cooperative_member"), checkOut);

export default router;
