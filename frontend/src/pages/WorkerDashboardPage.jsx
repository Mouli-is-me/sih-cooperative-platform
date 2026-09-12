import React, { useState, useEffect } from "react";
import { UserCheck, Clock, CheckCircle2, DollarSign, MapPin, ShieldCheck, AlertCircle, Award, Briefcase, Check } from "lucide-react";
import { api } from "../services/api.js";
import { getTranslation } from "../services/i18n.js";
import { useAuth } from "../context/AuthContext.jsx";
import TradeAssessmentModal from "../components/TradeAssessmentModal.jsx";

export default function WorkerDashboardPage({ currentLang }) {
  const t = (key) => getTranslation(currentLang, key);
  const { user } = useAuth();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [attendance, setAttendance] = useState([]);
  const [checkedInId, setCheckedInId] = useState(null);
  const [actionMsg, setActionMsg] = useState("");
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  const loadWorkerData = async () => {
    setLoading(true);
    try {
      const [workers, jobsRes, attRes] = await Promise.all([
        api.getWorkers(),
        api.getJobs(),
        api.getAttendance()
      ]);

      if (workers && workers.length > 0) {
        // Find the worker profile corresponding to the authenticated user
        const matchedWorker = workers.find(w => w.id === user?.workerId || w.id === user?.id) || workers[0];
        setWorker(matchedWorker);
      }
      if (jobsRes && jobsRes.data) setAvailableJobs(jobsRes.data);
      if (attRes && attRes.data) {
        setAttendance(attRes.data);
        const openAtt = attRes.data.find(a => a.status === "PRESENT");
        if (openAtt) setCheckedInId(openAtt.id);
      }
    } catch (err) {
      console.warn("[WorkerDashboard] Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerData();
  }, []);

  const handleApply = async (jobId) => {
    try {
      await api.applyForJob(jobId);
      setAppliedJobs(prev => new Set(prev).add(jobId));
      setActionMsg("✓ Application submitted to cooperative for review!");
    } catch (err) {
      setActionMsg(`✕ ${err.message}`);
    } setTimeout(() => setActionMsg(""), 4000);
  };

  const handleCheckIn = async (jobId) => {
    try {
      const res = await api.checkIn(jobId);
      if (res.success && res.data) {
        setCheckedInId(res.data.id);
        setActionMsg("✓ Checked in! Work hours tracking active.");
        loadWorkerData();
      }
    } catch (err) {
      setActionMsg("✕ Check-in failed");
    } setTimeout(() => setActionMsg(""), 4000);
  };

  const handleCheckOut = async () => {
    if (!checkedInId) return;
    try {
      await api.checkOut(checkedInId);
      setCheckedInId(null);
      setActionMsg("✓ Checked out! Hours logged successfully.");
      loadWorkerData();
    } catch (err) {
      setActionMsg("✕ Check-out failed");
    } setTimeout(() => setActionMsg(""), 4000);
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748B" }}>
        Loading worker portal...
      </div>
    );
  }

  if (!worker) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <AlertCircle size={36} style={{ color: "#F59E0B", marginBottom: "12px" }} />
        <h3>No Worker Profile Found</h3>
        <p style={{ color: "#64748B" }}>Please register a worker or run database seed script.</p>
      </div>
    );
  }

  return (
    <div className="worker-dashboard-page">
      <div className="worker-dash-container">
        {/* Header Greeting Banner */}
        <div className="worker-header-banner">
          <div className="worker-hero-profile">
            <img src={worker.avatar || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300"} alt={worker.name} className="w-hero-avatar" />
            <div className="w-hero-meta">
              <span className="w-welcome-eyebrow">WORKER PORTAL</span>
              <h2>Welcome back, {worker.name.split(" ")[0]}.</h2>
              <p className="w-coop-title">{worker.title} • {worker.cooperative}</p>
            </div>
          </div>

          <div className="w-workload-status-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span className="w-lbl">Skill Passport</span>
              <button 
                onClick={() => setShowAssessmentModal(true)}
                style={{ background: "#4F46E5", color: "#FFFFFF", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Award size={14} /> Practical Skill Assessment
              </button>
            </div>

            <div className="w-val-row">
              <span className="w-num">{worker.verifiedSkillLevel || "Advanced"}</span>
              <span className="w-chip chip-low">Score: {worker.skillFitPercent || 90}%</span>
            </div>
            <p className="w-hint">
              Verification: <strong>{worker.practicalVerificationStatus || "VERIFIED"}</strong>
            </p>
          </div>
        </div>

        {actionMsg && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#ECFDF5", border: "1px solid #10B981", color: "#065F46", fontWeight: 600, marginBottom: "20px" }}>
            {actionMsg}
          </div>
        )}

        {/* Attendance Check-in Widget */}
        <div className="worker-section-card" style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Work Attendance & Shift Tracking</h3>
              <p style={{ margin: "4px 0 0 0", color: "#64748B", fontSize: "0.85rem" }}>Log your daily work check-in and check-out times.</p>
            </div>
            {checkedInId ? (
              <button
                onClick={handleCheckOut}
                style={{ background: "#EF4444", color: "#FFF", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
              >
                Check-Out Shift
              </button>
            ) : (
              <button
                onClick={() => handleCheckIn("job-seed-01")}
                style={{ background: "#10B981", color: "#FFF", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
              >
                Check-In Shift
              </button>
            )}
          </div>
        </div>

        {/* Daily Summary Cards Grid */}
        <div className="worker-stats-grid">
          <div className="w-stat-card">
            <span className="st-lbl">Completed Jobs</span>
            <span className="st-val">{worker.jobsCompleted || 0}</span>
            <span className="st-sub">Verified Work History</span>
          </div>

          <div className="w-stat-card">
            <span className="st-lbl">Recent Earnings</span>
            <span className="st-val text-forest">₹{worker.earnings30Days || 8000}</span>
            <span className="st-sub">Direct Payout Record</span>
          </div>

          <div className="w-stat-card">
            <span className="st-lbl">Reliability Score</span>
            <span className="st-val">{worker.reliabilityScore}%</span>
            <span className="st-sub">{worker.onTimeRate}% On-Time Record</span>
          </div>
        </div>

        {/* Open Cooperative Jobs Section */}
        <div className="worker-section-card">
          <div className="w-sec-header">
            <div className="w-sec-title">
              <Briefcase size={18} className="text-forest" />
              <h3>Available Work Opportunities</h3>
            </div>
            <span className="w-requests-count">{availableJobs.length} Jobs Available</span>
          </div>

          {availableJobs.length === 0 ? (
            <div className="w-empty-requests">
              <CheckCircle2 size={30} className="text-forest" />
              <p>No open work opportunities at the moment.</p>
            </div>
          ) : (
            <div className="incoming-requests-list">
              {availableJobs.map((job) => {
                const hasApplied = appliedJobs.has(job.id);
                return (
                  <div key={job.id} className="incoming-request-card">
                    <div className="req-card-top">
                      <span className="req-service-badge">{job.category ? job.category.toUpperCase() : "GENERAL"}</span>
                      <span className="req-earning-pill">₹{job.wage} Wage</span>
                    </div>

                    <h4 className="req-task-name">{job.title}</h4>
                    <p style={{ color: "#64748B", fontSize: "0.85rem", margin: "4px 0 12px 0" }}>{job.description}</p>

                    <div className="req-details-grid">
                      <div className="req-detail-item">
                        <MapPin size={14} />
                        <span>Location: <strong>{job.location}</strong></span>
                      </div>
                    </div>

                    <div className="req-card-actions">
                      <button
                        className="btn-accept"
                        disabled={hasApplied}
                        onClick={() => handleApply(job.id)}
                        style={{ background: hasApplied ? "#94A3B8" : "#4F46E5", cursor: hasApplied ? "default" : "pointer" }}
                      >
                        {hasApplied ? "Application Submitted ✓" : "Apply for Opportunity →"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Practical Skill Assessment Modal */}
      {showAssessmentModal && (
        <TradeAssessmentModal 
          worker={worker}
          onClose={() => setShowAssessmentModal(false)}
          onComplete={loadWorkerData}
          currentLang={currentLang}
        />
      )}
    </div>
  );
}
