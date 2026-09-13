import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/\d/, "Password must include a number"),
  role: z.enum(["worker", "customer"]).optional().default("customer"),
  category: z.string().optional(),
  experienceYears: z.number().or(z.string().regex(/^\d+$/)).optional(),
  cooperative: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createJobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  category: z.string().min(2, "Category is required"),
  location: z.string().min(2, "Location is required"),
  wage: z.number().or(z.string().regex(/^\d+(\.\d+)?$/)),
  cooperativeId: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const createServiceRequestSchema = z.object({
  serviceCategory: z.string().min(2, "Service category is required"),
  taskDetail: z.string().min(3, "Task detail is required"),
  location: z.string().min(2, "Location is required"),
  customerName: z.string().optional(),
  customerType: z
    .enum(["Household", "Institution"])
    .optional()
    .default("Household"),
  urgency: z.preprocess(
    (value) => {
      if (value === "STANDARD") return "Standard";
      if (value === "HIGH") return "Urgent";
      return value;
    },
    z.enum(["Standard", "Urgent", "Emergency"]).optional().default("Standard"),
  ),
  rawText: z.string().optional(),
});

export const updateRequestStatusSchema = z.object({
  status: z.enum([
    "CREATED",
    "MATCHED",
    "WORKER_ACCEPTED",
    "EN_ROUTE",
    "JOB_STARTED",
    "COMPLETED",
  ]),
  currentStatus: z
    .enum([
      "CREATED",
      "MATCHED",
      "WORKER_ACCEPTED",
      "EN_ROUTE",
      "JOB_STARTED",
      "COMPLETED",
    ])
    .optional(),
  assignedWorkerId: z.string().optional(),
});

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const issues = (err.issues || err.errors || [])
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Validation failed: ${issues}`,
          },
        });
      }
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid request format" },
      });
    }
  };
};
