import React, { useState, useEffect } from "react";
import { Users, FileText, CheckCircle2, Scale, TrendingUp, AlertTriangle, ShieldCheck, BarChart3, PlusCircle, Check, X, Award, FileCheck } from "lucide-react";
import { COOPERATIVE_PULSE_METRICS } from "../services/mockData.js";
import { api, isLiveBackendAvailable } from "../services/api.js";
import { getTranslation } from "../services/i18n.js";

const MOCK_PENDING_ASSESSMENTS = [
  {
    _id: "assess-seed-01",
    workerName: "Ramesh Kumar",
    workerId: "w1",
    tradeCategory: "Plumbing",
    scores: { knowledge: 90, tools: 85, procedure: 88, diagnosis: 85, safety: 95, practical: 90 },
    overallScore: 89,
    calculatedLevel: "Advanced",
    status: "SUPERVISOR_REVIEW",
    createdAt: new Date().toISOString()
  },
  {
    _id: "assess-seed-02",
    workerName: "Senthil Nathan",
    workerId: "w2",
    tradeCategory: "Electrical",
    scores: { knowledge: 80, tools: 80, procedure: 75, diagnosis: 85, safety: 90, practical: 80 },
    overallScore: 81,
    calculatedLevel: "Intermediate",
    status: "SUPERVISOR_REVIEW",
    createdAt: new Date().toISOString()
  },
  {
    _id: "assess-seed-03",
    workerName: "Anita Devi",
    workerId: "w6",
    tradeCategory: "Caregiving",
    scores: { knowledge: 95, tools: 90, procedure: 95, diagnosis: 90, safety: 100, practical: 95 },
    overallScore: 94,
    calculatedLevel: "Advanced",
    status: "SUPERVISOR_REVIEW",
    createdAt: new Date().toISOString()
  }
];

export default function CooperativePulse({ currentLang }) {
  const t = (key) => getTranslation(currentLang, key);
  const [pulseData, setPulseData] = useState(COOPERATIVE_PULSE_METRICS);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("analytics"); // "analytics" | "verification"
  const [pendingAssessments, setPendingAssessments] = useState([]);
  const [verifyingId, setVerifyingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [supervisorNotes, setSupervisorNotes] = useState({});

  const loadPendingAssessments = async () => {
    try {
      const items = await api.getPendingAssessments();
      if (items && items.length > 0) {
        setPendingAssessments(items);
      } else {
        setPendingAssessments(MOCK_PENDING_ASSESSMENTS);
      }
    } catch (err) {
      setPendingAssessments(MOCK_PENDING_ASSESSMENTS);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchPulse = async () => {
      setLoading(true);
      const data = await api.getCooperativePulse();
      if (isMounted && data) {
        setPulseData(data);
      }
      if (isMounted) setLoading(false);
    };

    fetchPulse();
    loadPendingAssessments();
    return () => { isMounted = false; };
  }, []);

  const handleVerify = async (assessmentId, approved) => {
    setVerifyingId(assessmentId);
    setActionMessage("");
    const notes = supervisorNotes[assessmentId] || (approved ? "Approved by Cooperative Supervisor Audit" : "Requires Practical Retake");
    try {
      await api.verifyAssessment(assessmentId, { approved, supervisorNotes: notes });
      setActionMessage(approved ? "✓ Assessment Approved & Skill Passport Granted!" : "✕ Assessment Status Updated: Retake Requested");
      setPendingAssessments(prev => prev.map(item => {
        if ((item._id || item.id) === assessmentId) {
          return { ...item, status: approved ? "VERIFIED" : "REJECTED", supervisorNotes: notes };
        }
        return item;
      }));
    } catch (err) {
      setActionMessage("Failed to submit verification update");
    } finally {
      setVerifyingId(null);
      setTimeout(() => setActionMessage(""), 4000);
    }
  };

  const {
    activeWorkers = 147,
    openRequests = 326,
    completedJobs = 281,
    jobsCompletedMonth = 281,
    opportunityBalanceIndex = 84,
    demandTrends = [],
    workforceGaps = [],
    workloadDistribution = [],
    opportunityDistribution = []
  } = pulseData;

  const distributionList = workloadDistribution.length > 0
    ? workloadDistribution
    : opportunityDistribution.length > 0
    ? opportunityDistribution
    : COOPERATIVE_PULSE_METRICS.workloadDistribution;

  const trendsList = demandTrends.length > 0 ? demandTrends : COOPERATIVE_PULSE_METRICS.demandTrends;
  const gapsList = workforceGaps.length > 0 ? workforceGaps : COOPERATIVE_PULSE_METRICS.workforceGaps;

  const pendingCount = pendingAssessments.filter(a => a.status === "SUPERVISOR_REVIEW").length;

  return (
    <div className="cooperative-pulse-view">
      {/* Top Section Navigation Tabs */}
      <div className="coop-nav-tabs" style={{ display: "flex", gap: "12px", marginBottom: "20px", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("analytics")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "analytics" ? "#4F46E5" : "#F1F5F9",
            color: activeTab === "analytics" ? "#FFFFFF" : "#475569",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <BarChart3 size={16} /> Cooperative Analytics & Pulse
        </button>

        <button
          onClick={() => setActiveTab("verification")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "verification" ? "#4F46E5" : "#F1F5F9",
            color: activeTab === "verification" ? "#FFFFFF" : "#475569",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            position: "relative"
          }}
        >
          <ShieldCheck size={16} /> Supervisor Verification Center
          {pendingCount > 0 && (
            <span style={{
              background: activeTab === "verification" ? "#EF4444" : "#DC2626",
              color: "#FFFFFF",
              fontSize: "0.75rem",
              padding: "2px 8px",
              borderRadius: "10px",
              marginLeft: "4px"
            }}>
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {actionMessage && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#ECFDF5", border: "1px solid #10B981", color: "#065F46", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle2 size={18} /> {actionMessage}
        </div>
      )}

      {activeTab === "analytics" ? (
        <>
          <div className="pulse-hero-header">
            <div className="pulse-title-area">
              <div className="pulse-eyebrow">
                <ShieldCheck size={16} /> {t("coopAnalyticsEyebrow")}
                <span className="demo-data-badge" style={{ marginLeft: "12px", fontSize: "0.75rem", background: "rgba(255,255,255,0.15)", color: "#818CF8", padding: "3px 10px", borderRadius: "12px", fontWeight: 700 }}>
                  {isLiveBackendAvailable ? t("liveApiBadge") : t("demoDataBadge")}
                </span>
              </div>
              <h2>{t("coopOverviewTitle")}</h2>
              <p>{t("coopPulseDesc")}</p>
            </div>

            <div className="pulse-index-card">
              <span className="index-label">{t("opportunityIndexLabel")}</span>
              <div className="index-score-row">
                <span className="index-score">{opportunityBalanceIndex}</span>
                <span className="index-total">/100</span>
              </div>
              <span className="index-status">{t("optimalDistribution")}</span>
            </div>
          </div>

          {/* Primary Metrics Grid */}
          <div className="pulse-metrics-grid">
            <div className="pulse-metric-card">
              <div className="pm-icon-wrap icon-green">
                <Users size={20} />
              </div>
              <div className="pm-meta">
                <span className="pm-val">{activeWorkers}</span>
                <span className="pm-label">{t("activeVerifiedWorkers")}</span>
              </div>
            </div>

            <div className="pulse-metric-card">
              <div className="pm-icon-wrap icon-blue">
                <FileText size={20} />
              </div>
              <div className="pm-meta">
                <span className="pm-val">{openRequests}</span>
                <span className="pm-label">{t("monthlyRequests")}</span>
              </div>
            </div>

            <div className="pulse-metric-card">
              <div className="pm-icon-wrap icon-sage">
                <CheckCircle2 size={20} />
              </div>
              <div className="pm-meta">
                <span className="pm-val">{completedJobs || jobsCompletedMonth}</span>
                <span className="pm-label">{t("jobsCompleted")}</span>
              </div>
            </div>

            <div className="pulse-metric-card">
              <div className="pm-icon-wrap icon-amber">
                <Scale size={20} />
              </div>
              <div className="pm-meta">
                <span className="pm-val">{opportunityBalanceIndex}%</span>
                <span className="pm-label">{t("fairDistributionRate")}</span>
              </div>
            </div>
          </div>

          {/* Two-Column Analytics Layout */}
          <div className="pulse-analytics-layout">
            {/* Demand Trends Section */}
            <div className="pulse-card">
              <div className="card-heading">
                <TrendingUp size={18} className="heading-icon text-indigo" />
                <h3>{t("demandTrendsTitle")}</h3>
              </div>

              <div className="trends-list">
                {trendsList.map((trend, idx) => (
                  <div key={idx} className="trend-row">
                    <div className="trend-cat-info">
                      <span className="cat-name">{trend.category}</span>
                      <span className="cat-level">{trend.level}</span>
                    </div>
                    <div className="trend-bar-track">
                      <div 
                        className="trend-bar-fill"
                        style={{ width: `${60 + idx * 8}%`, backgroundColor: trend.color && trend.color !== "#2E8B57" ? trend.color : "#4F46E5" }}
                      />
                    </div>
                    <span className="trend-growth-badge">{trend.growth}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunity Distribution Section */}
            <div className="pulse-card">
              <div className="card-heading">
                <BarChart3 size={18} className="heading-icon text-indigo" />
                <h3>{t("workforceOpportunityDistribution")}</h3>
              </div>

              <div className="distribution-list">
                {distributionList.map((dist, idx) => (
                  <div key={idx} className="dist-row">
                    <div className="dist-meta">
                      <span className="dist-cohort">{dist.cohort}</span>
                      <span className="dist-share">{dist.share || dist.top10PctShare}</span>
                    </div>
                      <span className="dist-status-chip">{dist.status}</span>
                  </div>
                ))}
              </div>

              <div className="dist-explanation-box">
                <Scale size={15} />
                <span>{t("fairMatchAllocationExplanation")}</span>
              </div>
            </div>
          </div>

          {/* Workforce Gaps & Recruitment Recommendations */}
          <div className="pulse-card gaps-section">
            <div className="card-heading">
              <AlertTriangle size={18} className="heading-icon text-amber" />
              <h3>{t("workforceGapsTitle")}</h3>
            </div>

            <div className="gaps-grid">
              {gapsList.map((gap, idx) => (
                <div key={idx} className="gap-card">
                  <div className="gap-card-header">
                    <span className="gap-urgency-badge">{gap.urgency}</span>
                    <span className="gap-region">{gap.region}</span>
                  </div>

                  <h4 className="gap-title">{gap.category} {t("capacityNeeded")}</h4>

                  <div className="gap-recommendation">
                    <PlusCircle size={16} className="text-indigo" />
                    <span>
                      <strong>+{gap.recommendedRecruits} {t("recruitmentRecommended")}</strong>
                    </span>
                  </div>

                  <p className="gap-reason">{gap.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* SUPERVISOR VERIFICATION CENTER TAB */
        <div className="supervisor-verification-section">
          <div className="pulse-card" style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1F5F9", paddingBottom: "16px", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                  <ShieldCheck className="text-indigo" size={22} /> Supervisor Skill Verification Center
                </h3>
                <p style={{ color: "#64748B", fontSize: "0.9rem", marginTop: "4px", margin: 0 }}>
                  Review 6-category practical skill assessments submitted by trade workers. Validate safety and procedure scores to grant certified Skill Passports.
                </p>
              </div>
              <span style={{ background: "#EEF2FF", color: "#4F46E5", fontWeight: 700, padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem" }}>
                {pendingCount} Pending Audits
              </span>
            </div>

            {pendingAssessments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748B" }}>
                <CheckCircle2 size={40} style={{ color: "#10B981", margin: "0 auto 12px" }} />
                <h4>All Practical Assessments Verified!</h4>
                <p>There are currently no pending worker skill submissions awaiting supervisor review.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {pendingAssessments.map((assess) => {
                  const id = assess._id || assess.id;
                  const scores = assess.scores || {};
                  const isPending = assess.status === "SUPERVISOR_REVIEW";
                  return (
                    <div key={id} style={{ border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>{assess.workerName || "Worker"}</h4>
                            <span style={{ background: "#E0E7FF", color: "#3730A3", fontSize: "0.75rem", fontWeight: 700, padding: "2px 10px", borderRadius: "12px", textTransform: "uppercase" }}>
                              {assess.tradeCategory || "Trade"}
                            </span>
                          </div>
                          <span style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "4px", display: "block" }}>
                            Submitted: {new Date(assess.createdAt || Date.now()).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", fontWeight: 600, display: "block" }}>Weighted Score</span>
                            <span style={{ fontSize: "1.3rem", fontWeight: 800, color: assess.overallScore >= 80 ? "#10B981" : "#F59E0B" }}>
                              {assess.overallScore}%
                            </span>
                          </div>
                          <span style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            background: assess.status === "VERIFIED" ? "#DCFCE7" : assess.status === "REJECTED" ? "#FEE2E2" : "#FEF3C7",
                            color: assess.status === "VERIFIED" ? "#15803D" : assess.status === "REJECTED" ? "#B91C1C" : "#B45309"
                          }}>
                            {assess.status === "VERIFIED" ? "✓ VERIFIED" : assess.status === "REJECTED" ? "✕ RETAKE" : `LEVEL: ${(assess.calculatedLevel || "Basic").toUpperCase()}`}
                          </span>
                        </div>
                      </div>

                      {/* 6-Category Sub-Scores Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", background: "#F8FAFC", padding: "14px", borderRadius: "8px", marginBottom: "16px" }}>
                        <div>
                          <span style={{ fontSize: "0.75rem", color: "#64748B", display: "block" }}>Knowledge (20%)</span>
                          <strong style={{ color: "#1E293B", fontSize: "0.95rem" }}>{scores.knowledge ?? 0}%</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.75rem", color: "#64748B", display: "block" }}>Tools (15%)</span>
                          <strong style={{ color: "#1E293B", fontSize: "0.95rem" }}>{scores.tools ?? 0}%</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.75rem", color: "#64748B", display: "block" }}>Procedure (20%)</span>
                          <strong style={{ color: "#1E293B", fontSize: "0.95rem" }}>{scores.procedure ?? 0}%</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.75rem", color: "#64748B", display: "block" }}>Diagnosis (20%)</span>
                          <strong style={{ color: "#1E293B", fontSize: "0.95rem" }}>{scores.diagnosis ?? 0}%</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.75rem", color: "#64748B", display: "block" }}>Safety (15%)</span>
                          <strong style={{ color: scores.safety >= 80 ? "#10B981" : "#EF4444", fontSize: "0.95rem" }}>{scores.safety ?? 0}%</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.75rem", color: "#64748B", display: "block" }}>Practical (10%)</span>
                          <strong style={{ color: "#1E293B", fontSize: "0.95rem" }}>{scores.practical ?? 0}%</strong>
                        </div>
                      </div>

                      {/* Verification Controls */}
                      {isPending ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <input
                            type="text"
                            placeholder="Optional supervisor notes / field inspection observations..."
                            value={supervisorNotes[id] || ""}
                            onChange={(e) => setSupervisorNotes({ ...supervisorNotes, [id]: e.target.value })}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                          />
                          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button
                              disabled={verifyingId === id}
                              onClick={() => handleVerify(id, false)}
                              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "6px", border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#991B1B", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                            >
                              <X size={15} /> Request Retake
                            </button>
                            <button
                              disabled={verifyingId === id}
                              onClick={() => handleVerify(id, true)}
                              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "6px", border: "none", background: "#10B981", color: "#FFFFFF", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                            >
                              <Check size={15} /> Approve & Grant Verified Passport
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: "0.85rem", color: "#475569", fontStyle: "italic", background: "#F1F5F9", padding: "8px 12px", borderRadius: "6px" }}>
                          Supervisor Notes: {assess.supervisorNotes || "Audit complete."}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


