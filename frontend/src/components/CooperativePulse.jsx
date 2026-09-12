import React, { useState, useEffect } from "react";
import { Users, FileText, CheckCircle2, Scale, TrendingUp, AlertTriangle, ShieldCheck, BarChart3, PlusCircle, Check, X, Award, Briefcase, Plus, Search } from "lucide-react";
import { api } from "../services/api.js";
import { getTranslation } from "../services/i18n.js";

export default function CooperativePulse({ currentLang }) {
  const t = (key) => getTranslation(currentLang, key);
  const [pulseData, setPulseData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics"); // "analytics" | "jobs" | "verification"

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    title: "",
    category: "plumbing",
    location: "Madurai Central",
    wage: "1500",
    description: "",
    requiredSkills: "Leak repair, Pipe fitting"
  });

  // Assessments state
  const [pendingAssessments, setPendingAssessments] = useState([]);
  const [verifyingId, setVerifyingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [supervisorNotes, setSupervisorNotes] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [pulse, jobsRes, assessments] = await Promise.all([
        api.getCooperativePulse(),
        api.getJobs(),
        api.getPendingAssessments()
      ]);
      if (pulse) setPulseData(pulse);
      if (jobsRes && jobsRes.data) setJobs(jobsRes.data);
      if (assessments) setPendingAssessments(assessments);
    } catch (e) {
      console.warn("[CooperativePulse] Error loading data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createJob({
        ...newJobForm,
        wage: Number(newJobForm.wage),
        requiredSkills: newJobForm.requiredSkills.split(",").map(s => s.trim())
      });
      setActionMessage("✓ Work opportunity posted successfully!");
      setShowCreateJob(false);
      setNewJobForm({
        title: "",
        category: "plumbing",
        location: "Madurai Central",
        wage: "1500",
        description: "",
        requiredSkills: "Leak repair, Pipe fitting"
      });
      loadData();
    } catch (err) {
      setActionMessage(`✕ ${err.message}`);
    } setTimeout(() => setActionMessage(""), 4000);
  };

  const handleVerifyAssessment = async (assessmentId, approved) => {
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
    opportunityBalanceIndex = 84,
    demandTrends = [],
    workforceGaps = [],
    workloadDistribution = []
  } = pulseData;

  const pendingCount = pendingAssessments.filter(a => a.status === "SUPERVISOR_REVIEW" || a.status === "PENDING").length;

  return (
    <div className="cooperative-pulse-view">
      {/* Top Section Navigation Tabs */}
      <div className="coop-nav-tabs" style={{ display: "flex", gap: "12px", marginBottom: "24px", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
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
            cursor: "pointer"
          }}
        >
          <BarChart3 size={16} /> Analytics & Equity Pulse
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "jobs" ? "#4F46E5" : "#F1F5F9",
            color: activeTab === "jobs" ? "#FFFFFF" : "#475569",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          <Briefcase size={16} /> Work Opportunities ({jobs.length})
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
            position: "relative"
          }}
        >
          <ShieldCheck size={16} /> Supervisor Verifications
          {pendingCount > 0 && (
            <span style={{
              background: "#EF4444",
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

      {/* TAB 1: ANALYTICS */}
      {activeTab === "analytics" && (
        <>
          <div className="pulse-hero-header">
            <div className="pulse-title-area">
              <div className="pulse-eyebrow">
                <ShieldCheck size={16} /> CO-OP FEDERATION OPERATIONS
              </div>
              <h2>Cooperative Roster & Demand Pulse</h2>
              <p>Operational equity index, regional capacity gaps, and workload distribution metrics.</p>
            </div>

            <div className="pulse-index-card">
              <span className="index-label">Opportunity Equity Index</span>
              <div className="index-score-row">
                <span className="index-score">{opportunityBalanceIndex}</span>
                <span className="index-total">/100</span>
              </div>
              <span className="index-status">Optimal Fair Distribution</span>
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
                <span className="pm-label">Active Verified Workers</span>
              </div>
            </div>

            <div className="pulse-metric-card">
              <div className="pm-icon-wrap icon-blue">
                <FileText size={20} />
              </div>
              <div className="pm-meta">
                <span className="pm-val">{openRequests}</span>
                <span className="pm-label">Open Service Requests</span>
              </div>
            </div>

            <div className="pulse-metric-card">
              <div className="pm-icon-wrap icon-sage">
                <CheckCircle2 size={20} />
              </div>
              <div className="pm-meta">
                <span className="pm-val">{completedJobs}</span>
                <span className="pm-label">Completed Jobs</span>
              </div>
            </div>

            <div className="pulse-metric-card">
              <div className="pm-icon-wrap icon-amber">
                <Scale size={20} />
              </div>
              <div className="pm-meta">
                <span className="pm-val">{opportunityBalanceIndex}%</span>
                <span className="pm-label">Fair Allocation Rate</span>
              </div>
            </div>
          </div>

          {/* Regional Gaps & Recommendations */}
          <div className="pulse-card gaps-section">
            <div className="card-heading">
              <AlertTriangle size={18} className="heading-icon text-amber" />
              <h3>Workforce Recruitment Gaps</h3>
            </div>

            <div className="gaps-grid">
              {workforceGaps.map((gap, idx) => (
                <div key={idx} className="gap-card">
                  <div className="gap-card-header">
                    <span className="gap-urgency-badge">{gap.urgency}</span>
                    <span className="gap-region">{gap.region}</span>
                  </div>

                  <h4 className="gap-title">{gap.category} Capacity</h4>

                  <div className="gap-recommendation">
                    <PlusCircle size={16} className="text-indigo" />
                    <span>
                      <strong>+{gap.recommendedRecruits} Recruits Recommended</strong>
                    </span>
                  </div>

                  <p className="gap-reason">{gap.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* TAB 2: WORK OPPORTUNITIES (JOBS & CREATION) */}
      {activeTab === "jobs" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Active Work Opportunities</h3>
              <p style={{ color: "#64748B", fontSize: "0.85rem", margin: 0 }}>Create and manage job postings for cooperative workers.</p>
            </div>
            <button
              onClick={() => setShowCreateJob(!showCreateJob)}
              style={{ background: "#4F46E5", color: "#FFFFFF", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={16} /> {showCreateJob ? "Cancel" : "Post Work Opportunity"}
            </button>
          </div>

          {showCreateJob && (
            <form onSubmit={handleCreateJob} style={{ background: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E2E8F0", marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 16px 0", fontWeight: 700 }}>New Work Opportunity Details</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.85rem", fontWeight: 600 }}>
                  Job Title *
                  <input
                    required
                    value={newJobForm.title}
                    onChange={e => setNewJobForm({ ...newJobForm, title: e.target.value })}
                    placeholder="e.g. Pipeline Installation & Overhaul"
                    style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1" }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.85rem", fontWeight: 600 }}>
                  Category *
                  <select
                    value={newJobForm.category}
                    onChange={e => setNewJobForm({ ...newJobForm, category: e.target.value })}
                    style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1" }}
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="painting">Painting</option>
                    <option value="cleaning">Cleaning</option>
                  </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.85rem", fontWeight: 600 }}>
                  Location *
                  <input
                    required
                    value={newJobForm.location}
                    onChange={e => setNewJobForm({ ...newJobForm, location: e.target.value })}
                    placeholder="e.g. K.K. Nagar, Madurai"
                    style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1" }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.85rem", fontWeight: 600 }}>
                  Wage Amount (₹) *
                  <input
                    type="number"
                    required
                    value={newJobForm.wage}
                    onChange={e => setNewJobForm({ ...newJobForm, wage: e.target.value })}
                    placeholder="1500"
                    style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1" }}
                  />
                </label>
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.85rem", fontWeight: 600, marginBottom: "16px" }}>
                Description *
                <textarea
                  required
                  rows={3}
                  value={newJobForm.description}
                  onChange={e => setNewJobForm({ ...newJobForm, description: e.target.value })}
                  placeholder="Describe scope of work, technical requirements, and completion timeframe..."
                  style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1" }}
                />
              </label>

              <button type="submit" style={{ background: "#10B981", color: "#FFFFFF", border: "none", padding: "10px 20px", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}>
                Save & Post Opportunity
              </button>
            </form>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {jobs.map(job => (
              <div key={job.id} style={{ background: "#FFFFFF", padding: "20px", borderRadius: "10px", border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>{job.title}</h4>
                    <span style={{ background: "#EEF2FF", color: "#4F46E5", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                      {job.category}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: "#64748B", fontSize: "0.85rem" }}>{job.description || job.location}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#16A34A", display: "block" }}>₹{job.wage}</span>
                  <span style={{ background: "#ECFDF5", color: "#047857", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 700 }}>{job.status || "OPEN"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUPERVISOR VERIFICATIONS */}
      {activeTab === "verification" && (
        <div className="supervisor-verification-section">
          <div className="pulse-card">
            <h3 style={{ margin: "0 0 16px 0" }}>Practical Skill Verification Center</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {pendingAssessments.map(assess => {
                const id = assess._id || assess.id;
                return (
                  <div key={id} style={{ border: "1px solid #E2E8F0", padding: "16px", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong>{assess.workerName || "Worker Candidate"} ({assess.tradeCategory})</strong>
                      <span style={{ fontWeight: 700, color: "#4F46E5" }}>Score: {assess.overallScore || assess.score}%</span>
                    </div>
                    {assess.status === "SUPERVISOR_REVIEW" || assess.status === "PENDING" ? (
                      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <button onClick={() => handleVerifyAssessment(id, true)} style={{ background: "#10B981", color: "#FFF", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>
                          Approve Skill Passport
                        </button>
                        <button onClick={() => handleVerifyAssessment(id, false)} style={{ background: "#EF4444", color: "#FFF", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>
                          Request Retake
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: "#16A34A", fontWeight: 600, fontSize: "0.85rem" }}>Status: {assess.status}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
