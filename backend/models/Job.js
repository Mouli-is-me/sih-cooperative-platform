import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true },
    customerName: { type: String, required: true },
    serviceCategory: { type: String, required: true },
    status: {
      type: String,
      enum: ["ASSIGNED", "EN_ROUTE", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "ASSIGNED"
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    earningsAmount: { type: Number, default: 550 },
    customerRating: { type: Number },
    customerReview: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
