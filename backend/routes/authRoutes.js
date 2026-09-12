import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { validateRequest, registerSchema, loginSchema } from "../middleware/validators.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/me", authenticateToken, getMe);

export default router;
