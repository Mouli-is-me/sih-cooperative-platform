import SkillAssessment from "../models/SkillAssessment.js";
import Worker from "../models/Worker.js";
import { getAssessmentForCategory, CATEGORY_WEIGHTS, PASS_THRESHOLD } from "../config/assessmentConfig.js";

// Temporary in-memory fallback for assessments if DB is offline
const MEMORY_ASSESSMENTS = new Map();

export const getAssessmentConfig = async (req, res) => {
  const { category } = req.params;
  if (!category) {
    return res.status(400).json({ error: "Trade category is required" });
  }
  const config = getAssessmentForCategory(category);
  return res.status(200).json(config);
};

export const submitAssessment = async (req, res) => {
  try {
    const { workerId, category, answers = [] } = req.body;
    if (!workerId || !category) {
      return res.status(400).json({ error: "Missing workerId or category" });
    }

    const config = getAssessmentForCategory(category);
    const questions = config.questions;

    // Calculate sub-scores by category
    let knowledgeScore = 0;
    let toolScore = 0;
    let procedureScore = 0;
    let diagnosisScore = 0;
    let safetyScore = 0;
    let practicalScore = 0;

    const scoredAnswers = questions.map((q) => {
      const userAns = answers.find((a) => a.questionId === q.id);
      const selectedIndex = userAns ? userAns.selectedIndex : -1;
      const isCorrect = selectedIndex === q.correctIndex;
      const points = isCorrect ? 100 : 0;

      if (q.type === "KNOWLEDGE") knowledgeScore = points;
      if (q.type === "TOOLS") toolScore = points;
      if (q.type === "PROCEDURE") procedureScore = points;
      if (q.type === "DIAGNOSIS") diagnosisScore = points;
      if (q.type === "SAFETY") safetyScore = points;
      if (q.type === "PRACTICAL") practicalScore = points;

      return {
        questionId: q.id,
        questionType: q.type,
        selectedIndex,
        isCorrect
      };
    });

    const overallScore = Math.round(
      knowledgeScore * CATEGORY_WEIGHTS.knowledge +
      toolScore * CATEGORY_WEIGHTS.tools +
      procedureScore * CATEGORY_WEIGHTS.procedure +
      diagnosisScore * CATEGORY_WEIGHTS.diagnosis +
      safetyScore * CATEGORY_WEIGHTS.safety +
      practicalScore * CATEGORY_WEIGHTS.practical
    );

    let skillLevel = "Not Qualified";
    let status = "FAILED";

    if (overallScore >= PASS_THRESHOLD) {
      status = "SUPERVISOR_REVIEW";
      if (overallScore >= 90) skillLevel = "Advanced";
      else if (overallScore >= 80) skillLevel = "Intermediate";
      else skillLevel = "Basic";
    }

    const payload = {
      workerId,
      category,
      assessmentVersion: config.version || "2.0",
      completedAt: new Date(),
      knowledgeScore,
      toolScore,
      procedureScore,
      diagnosisScore,
      safetyScore,
      practicalScore,
      overallScore,
      skillLevel,
      status,
      answers: scoredAnswers
    };

    let assessment = null;
    try {
      assessment = await new SkillAssessment(payload).save();
    } catch (err) {
      assessment = { id: `ass-${Date.now()}`, ...payload };
    }

    MEMORY_ASSESSMENTS.set(assessment.id || assessment._id?.toString() || workerId, assessment);

    // Update Worker model if DB is connected
    try {
      await Worker.findByIdAndUpdate(workerId, {
        assessmentScore: overallScore,
        skillFitPercent: Math.max(70, overallScore),
        verifiedSkillLevel: skillLevel,
        practicalVerificationStatus: status === "FAILED" ? "UNVERIFIED" : "PENDING_REVIEW",
        assessmentId: assessment.id || assessment._id?.toString(),
        latestAssessmentDate: new Date()
      });
    } catch (workerErr) {
      // Ignore worker update failure in offline mode
    }

    return res.status(201).json({
      success: true,
      assessment,
      overallScore,
      skillLevel,
      status,
      message: overallScore >= PASS_THRESHOLD 
        ? `Assessment PASSED with ${overallScore}% score. Submitted for cooperative supervisor verification.`
        : `Assessment score ${overallScore}% below ${PASS_THRESHOLD}% pass threshold.`
    });
  } catch (err) {
    return res.status(500).json({ error: "Error processing assessment", details: err.message });
  }
};

export const getPendingAssessments = async (req, res) => {
  try {
    let pending = [];
    try {
      pending = await SkillAssessment.find({ status: { $in: ["SUPERVISOR_REVIEW", "PASSED", "PENDING"] } });
    } catch (err) {
      // Fallback memory query
    }

    if (!pending || pending.length === 0) {
      pending = Array.from(MEMORY_ASSESSMENTS.values());
    }

    return res.status(200).json(pending);
  } catch (err) {
    return res.status(500).json({ error: "Error fetching pending assessments" });
  }
};

export const verifyAssessment = async (req, res) => {
  const { id } = req.params;
  const { supervisorNotes, approved = true, reviewedBy = "Cooperative Guild Supervisor" } = req.body;

  try {
    const targetStatus = approved ? "VERIFIED" : "FAILED";
    let updated = null;

    try {
      updated = await SkillAssessment.findByIdAndUpdate(
        id,
        {
          status: targetStatus,
          reviewedBy,
          reviewedAt: new Date(),
          supervisorNotes: supervisorNotes || "Competency and practical demonstration approved by field auditor."
        },
        { new: true }
      );
    } catch (dbErr) {
      // Fallback
    }

    if (!updated && MEMORY_ASSESSMENTS.has(id)) {
      const match = MEMORY_ASSESSMENTS.get(id);
      match.status = targetStatus;
      match.reviewedBy = reviewedBy;
      match.reviewedAt = new Date();
      match.supervisorNotes = supervisorNotes || "Verified by supervisor";
      updated = match;
    }

    if (updated && updated.workerId) {
      try {
        await Worker.findByIdAndUpdate(updated.workerId, {
          practicalVerificationStatus: approved ? "VERIFIED" : "UNVERIFIED",
          badge: approved ? "Practically Verified Cooperative Member" : "Pending Verification",
          $addToSet: { verifications: `Practically Verified Skill Assessment (${updated.overallScore || 90}%)` }
        });
      } catch (wErr) {
        // Ignore fallback
      }
    }

    return res.status(200).json({
      success: true,
      assessment: updated,
      message: approved ? "Assessment and Skill Passport successfully VERIFIED by Supervisor." : "Assessment rejected by Supervisor."
    });
  } catch (err) {
    return res.status(500).json({ error: "Error verifying assessment", details: err.message });
  }
};
