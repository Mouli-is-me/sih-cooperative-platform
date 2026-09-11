import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    customerType: {
      type: String,
      enum: ["Household", "Institution"],
      default: "Household",
    },
    serviceCategory: { type: String, required: true },
    taskDetail: { type: String, required: true },
    urgency: { type: String, default: "Standard" },
    estimatedDuration: { type: String, default: "45 min" },
    location: { type: String, required: true },
    customerName: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "CREATED",
        "MATCHED",
        "WORKER_ACCEPTED",
        "EN_ROUTE",
        "JOB_STARTED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "CREATED",
    },
    assignedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
    transitionTimestamps: { type: Map, of: Date, default: {} },
    rawText: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("ServiceRequest", serviceRequestSchema);
