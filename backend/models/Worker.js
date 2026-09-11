import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ["Basic", "Intermediate", "Advanced", "Master"], default: "Intermediate" },
  confidence: { type: Number, default: 90 },
  evidence: { type: String }
});

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    badge: { type: String, default: "Verified Cooperative Worker" },
    cooperative: { type: String, required: true },
    coopId: { type: String, required: true },
    avatar: { type: String },
    rating: { type: Number, default: 4.5 },
    jobsCompleted: { type: Number, default: 0 },
    onTimeRate: { type: Number, default: 95 },
    reliabilityScore: { type: Number, default: 95 },
    distanceKm: { type: Number },
    latitude: { type: Number, default: 9.9252 },
    longitude: { type: Number, default: 78.1198 },
    workloadCapacity: { type: Number, default: 30 }, // percentage occupied
    workloadStatus: { type: String, default: "Low" },
    availability: { type: String, default: "Available Now" },
    isAvailable: { type: Boolean, default: true },
    status: { type: String, enum: ["AVAILABLE", "BUSY", "UNAVAILABLE"], default: "AVAILABLE" },
    skillFitPercent: { type: Number, default: 90 },
    verifiedSkillLevel: { type: String, default: "Advanced" },
    experienceYears: { type: Number, default: 5 },
    jobsCompleted7Days: { type: Number, default: 2 },
    jobsCompleted30Days: { type: Number, default: 10 },
    earnings7Days: { type: Number, default: 1500 },
    earnings30Days: { type: Number, default: 8000 },
    cohortOpportunityShare: { type: String, default: "15%" },
    opportunityEquityScore: { type: Number, default: 90 },
    practicalVerificationStatus: {
      type: String,
      enum: ["UNVERIFIED", "PENDING_REVIEW", "VERIFIED"],
      default: "UNVERIFIED"
    },
    assessmentScore: { type: Number },
    assessmentId: { type: String },
    latestAssessmentDate: { type: Date },
    skills: [skillSchema],
    verifications: [{ type: String }],
    bio: { type: String },
    fairMatchReasons: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model("Worker", workerSchema);

