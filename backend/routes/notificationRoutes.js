import express from "express";
import { getUserNotifications, markNotificationRead } from "../controllers/notificationController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getUserNotifications);
router.patch("/:id/read", authenticateToken, markNotificationRead);

export default router;
