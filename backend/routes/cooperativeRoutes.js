import express from "express";
import { getCooperativeAnalytics } from "../controllers/cooperativeController.js";

const router = express.Router();

router.get("/analytics", getCooperativeAnalytics);

export default router;
