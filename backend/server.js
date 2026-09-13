import hardwareRoutes from "./routes/hardwareRoutes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";
import workerRoutes from "./routes/workerRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import cooperativeRoutes from "./routes/cooperativeRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false, // Avoid breaking frontend dev assets in development
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // max 300 requests per IP per 15 minutes
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests, please try again later.",
    },
  },
});
app.use("/api/", apiLimiter);

// CORS configuration supporting Vercel preview/production domains & local dev
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/+$/, "");
      const isVercelDomain = cleanOrigin.endsWith(".vercel.app");
      const isAllowed = allowedOrigins.some(
        (o) => o && cleanOrigin === o.replace(/\/+$/, ""),
      );

      if (
        isAllowed ||
        isVercelDomain ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Origin is not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

app.use(express.json({ limit: "2mb" }));

// Health Check & Root Endpoints

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
      auth: "POST /api/auth/login, POST /api/auth/register",
      workers: "GET /api/workers, PATCH /api/workers/:id/status",
      jobs: "GET /api/jobs, POST /api/jobs, POST /api/jobs/:id/apply",
      requests:
        "POST /api/service-requests, PATCH /api/service-requests/:id/status",
      notifications: "GET /api/notifications",
      payments: "GET /api/payments, POST /api/payments",
      attendance: "GET /api/attendance, POST /api/attendance/check-in",
      auditLogs: "GET /api/audit-logs",
      analytics: "GET /api/cooperative/analytics",
      hardware:
        "GET /api/hardware/dashboard/:deviceCode, PATCH /api/hardware/dashboard/:deviceCode/command",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "CO-OP OS API Server",
    mode: "Node.js REST (PostgreSQL Connected)",
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mounting
app.use("/api/auth", authRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/hardware", hardwareRoutes);
app.use("/api/service-requests", requestRoutes);
app.use("/api/cooperative", cooperativeRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/audit-logs", auditRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "API route not found" },
  });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error("[API Error Handled]:", err.stack || err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: {
      code: status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
      message: status === 500 ? "Internal server error" : err.message,
    },
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
