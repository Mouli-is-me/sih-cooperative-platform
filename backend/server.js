import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import workerRoutes from "./routes/workerRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import cooperativeRoutes from "./routes/cooperativeRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    service: "CO-OP OS API Server",
    status: "OK",
    health: "/api/health",
    api: "/api",
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
    },
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "CO-OP OS API Server",
    mode: "Node.js REST",
  });
});

// API Routes Mounting
app.use("/api/workers", workerRoutes);
app.use("/api/service-requests", requestRoutes);
app.use("/api/cooperative", cooperativeRoutes);
app.use("/api/assessments", assessmentRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "API route not found" });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: status === 500 ? "Internal server error" : err.message,
  });
});

// Database Connection & Server Start
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `[CO-OP OS Server] Express server running on http://localhost:${PORT}`,
    );
  });
});
