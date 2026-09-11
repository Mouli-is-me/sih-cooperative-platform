import mongoose from "mongoose";

const skillAssessmentSchema = new mongoose.Schema(
  {
    workerId: { type: String, required: true },
    workerName: { type: String },
    category: { type: String, required: true },
    assessmentVersion: { type: String, default: "2.0" },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    knowledgeScore: { type: Number, default: 0 },
    toolScore: { type: Number, default: 0 },
    procedureScore: { type: Number, default: 0 },
    diagnosisScore: { type: Number, default: 0 },
    safetyScore: { type: Number, default: 0 },
    practicalScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    skillLevel: {
      type: String,
      enum: ["Not Qualified", "Basic", "Intermediate", "Advanced", "Master"],
      default: "Basic"
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "PASSED", "FAILED", "SUPERVISOR_REVIEW", "VERIFIED"],
      default: "PENDING"
    },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
    supervisorNotes: { type: String },
    evidence: [{ type: String }],
    answers: [
      {
        questionId: { type: String },
        questionType: { type: String },
        selectedIndex: { type: Number },
        isCorrect: { type: Boolean }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("SkillAssessment", skillAssessmentSchema);
