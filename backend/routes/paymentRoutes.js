import express from "express";
import { getPayments, createPayment } from "../controllers/paymentController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getPayments);
router.post("/", authenticateToken, requireRole("cooperative_admin", "platform_admin"), createPayment);

export default router;
