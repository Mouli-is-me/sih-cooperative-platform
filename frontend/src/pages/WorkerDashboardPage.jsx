import React, { useState, useEffect } from "react";
import { UserCheck, Clock, CheckCircle2, DollarSign, MapPin, ShieldCheck, AlertCircle, Play, Sparkles, Award } from "lucide-react";
import { api, isLiveBackendAvailable } from "../services/api.js";
import { getTranslation } from "../services/i18n.js";
import TradeAssessmentModal from "../components/TradeAssessmentModal.jsx";

export default function WorkerDashboardPage({ currentLang }) {
  const t = (key) => getTranslation(currentLang, key);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchWorkerData = async () => {
      setLoading(true);
      const workers = await api.getWorkers();
      if (isMounted) {
        if (workers && workers.length > 0) {
          setWorker(workers[0]);
        }
        setLoading(false);
      }
    };

    fetchWorkerData();
    return () => { isMounted = false; };
  }, []);

  const handleAccept = (reqId) => {
    const job = incomingRequests.find((r) => r.id === reqId);
    if (job) {
      setAcceptedJobs([...acceptedJobs, job]);
      setIncomingRequests(incomingRequests.filter((r) => r.id !== reqId));
    }
  };

  const handleDecline = (reqId) => {
    setIncomingRequests(incomingRequests.filter((r) => r.id !== reqId));
  };

  const handleAssessmentComplete = async () => {
    const workers = await api.getWorkers();
    if (workers && workers.length > 0) {
      setWorker(workers[0]);
    }
  };

  if (loading) {
    return (
      <div className="worker-dashboard-page" style={{ padding: "60px 20px", textAlign: "center" }}>
        <p style={{ color: "#64748B" }}>Loading worker profile from database...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="worker-dashboard-page" style={{ padding: "60px 20px", textAlign: "center" }}>
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
              <span className="w-welcome-eyebrow">{t("workerPortalEyebrow")}</span>
              <h2>{t("goodMorning")} {worker.name.split(" ")[0]}.</h2>
              <p className="w-coop-title">{worker.title} • {worker.cooperative}</p>
            </div>
          </div>

          <div className="w-workload-status-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span className="w-lbl">{t("workloadCapacityLabel")}</span>
              <button 
                onClick={() => setShowAssessmentModal(true)}
                style={{ background: "#4F46E5", color: "#FFFFFF", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Award size={14} /> Practical Skill Assessment
              </button>
            </div>

            <div className="w-val-row">
              <span className="w-num">{worker.workloadCapacity}%</span>
              <span className="w-chip chip-low">{t("lowWorkloadBalanced")}</span>
            </div>
            <p className="w-hint">
              Verification: <strong>{worker.practicalVerificationStatus || "UNVERIFIED"}</strong> • Score: {worker.assessmentScore ? `${worker.assessmentScore}%` : "Not assessed"}
            </p>
          </div>
        </div>

        {/* Daily Summary Cards Grid */}
        <div className="worker-stats-grid">
          <div className="w-stat-card">
            <span className="st-lbl">{t("todaysSchedule")}</span>
            <span className="st-val">{worker.jobsCompleted7Days || 0} {t("jobsLabel")}</span>
            <span className="st-sub">Completed Recently</span>
          </div>

          <div className="w-stat-card">
            <span className="st-lbl">{t("estimatedEarnings")}</span>
            <span className="st-val text-forest">₹{worker.earnings7Days || 0}</span>
            <span className="st-sub">{t("directPayout")}</span>
          </div>

          <div className="w-stat-card">
            <span className="st-lbl">{t("reliabilityScore")}</span>
            <span className="st-val">{worker.reliabilityScore}%</span>
            <span className="st-sub">{worker.onTimeRate}% {t("onTimeRecordLabel")}</span>
          </div>
        </div>

        {/* Incoming Service Requests */}
        <div className="worker-section-card">
          <div className="w-sec-header">
            <div className="w-sec-title">
              <Clock size={18} className="text-forest" />
              <h3>{t("incomingDispatches")}</h3>
            </div>
            <span className="w-requests-count">{incomingRequests.length} {t("pendingDispatchCount")}</span>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="w-empty-requests">
              <CheckCircle2 size={30} className="text-forest" />
              <p>{t("emptyRequests")}</p>
            </div>
          ) : (
            <div className="incoming-requests-list">
              {incomingRequests.map((req) => (
                <div key={req.id} className="incoming-request-card">
                  <div className="req-card-top">
                    <span className="req-service-badge">{req.service.toUpperCase()}</span>
                    <span className="req-earning-pill">₹{req.earning} Est. Earning</span>
                  </div>

                  <h4 className="req-task-name">{req.task}</h4>

                  <div className="req-details-grid">
                    <div className="req-detail-item">
                      <UserCheck size={14} />
                      <span>{t("customerLabel")}: <strong>{req.customer}</strong></span>
                    </div>

                    <div className="req-detail-item">
                      <MapPin size={14} />
                      <span>{t("locationLabel")}: {req.location}</span>
                    </div>

                    <div className="req-detail-item">
                      <Clock size={14} />
                      <span>{t("durationLabel")}: {req.duration} ({req.urgency})</span>
                    </div>

                    <div className="req-detail-item text-forest">
                      <Sparkles size={14} />
                      <span>{t("relevanceLabel")}: {req.fairMatchScore} ({req.relevance})</span>
                    </div>
                  </div>

                  <div className="req-card-actions">
                    <button className="btn-decline" onClick={() => handleDecline(req.id)}>
                      {t("declineDispatch")}
                    </button>

                    <button className="btn-accept" onClick={() => handleAccept(req.id)}>
                      {t("acceptDispatch")} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accepted Active Jobs */}
        {acceptedJobs.length > 0 && (
          <div className="worker-section-card">
            <div className="w-sec-header">
              <div className="w-sec-title">
                <CheckCircle2 size={18} className="text-forest" />
                <h3>{t("acceptedActiveJobs")}</h3>
              </div>
            </div>

            <div className="accepted-jobs-list">
              {acceptedJobs.map((job) => (
                <div key={job.id} className="accepted-job-row">
                  <div>
                    <h4>{job.task}</h4>
                    <p className="job-sub">{job.customer} • {job.location}</p>
                  </div>
                  <span className="job-status-active">{t("enRouteActive")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Practical Trade Assessment Modal */}
      {showAssessmentModal && (
        <TradeAssessmentModal 
          worker={worker}
          onClose={() => setShowAssessmentModal(false)}
          onComplete={handleAssessmentComplete}
          currentLang={currentLang}
        />
      )}
    </div>
  );
}


