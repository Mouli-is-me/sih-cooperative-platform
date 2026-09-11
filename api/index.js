import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import workerRoutes from "../backend/routes/workerRoutes.js";
import requestRoutes from "../backend/routes/requestRoutes.js";
import cooperativeRoutes from "../backend/routes/cooperativeRoutes.js";
import assessmentRoutes from "../backend/routes/assessmentRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "CO-OP OS Vercel API Server",
    mode: "Vercel Serverless Function"
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    service: "CO-OP OS API",
    status: "OK",
    endpoints: {
      health: "GET /api/health",
      workers: "GET /api/workers",
      worker: "GET /api/workers/:id",
      workerStatus: "PATCH /api/workers/:id/status",
      matches: "POST /api/service-requests/matches",
      requests: "POST /api/service-requests",
      requestStatus: "PATCH /api/service-requests/:id/status",
      analytics: "GET /api/cooperative/analytics",
      assessments: "GET /api/assessments/config/:category"
    }
  });
});

app.use("/api/workers", workerRoutes);
app.use("/api/service-requests", requestRoutes);
app.use("/api/cooperative", cooperativeRoutes);
app.use("/api/assessments", assessmentRoutes);

export default app;
