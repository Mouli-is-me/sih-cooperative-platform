import React, { useState, useEffect } from "react";
import RequestTimeline from "../components/RequestTimeline.jsx";
import { Clock, CheckCircle2, Bookmark, Plus } from "lucide-react";
import { getTranslation } from "../services/i18n.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function CustomerDashboardPage({
  requests = [],
  onAdvanceStep,
  onNewRequest,
  onViewWorker,
  currentLang = "en"
}) {
  const [activeTab, setActiveTab] = useState("active");
  const { user } = useAuth();
  const t = (key) => getTranslation(currentLang, key);

  // In a real application, these would be fetched from the backend.
  // For the updated production app without mock data, we start with empty arrays.
  const completedServices = [];
  const savedWorkers = [];

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const displayName = user?.fullName || user?.name || "Customer";

  return (
    <div className="customer-dashboard-page">
      <div className="dashboard-container">
        {/* Dashboard Header */}
        <div className="dash-header">
          <div className="user-profile-summary">
            <div className="user-avatar-circle">{getInitials(displayName)}</div>
            <div className="user-meta">
              <h2>{displayName}</h2>
              <span className="user-loc">K.K. Nagar, Madurai • {t("customerDashTitle")}</span>
            </div>
          </div>

          <button className="btn-new-request" onClick={onNewRequest}>
            <Plus size={16} /> {t("findRightWorkerBtn")}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="dash-tabs-bar">
          <button 
            className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            <Clock size={15} /> {t("activeRequestsTab")} ({requests.length})
          </button>

          <button 
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <CheckCircle2 size={15} /> {t("serviceHistoryTab")} ({completedServices.length})
          </button>

          <button 
            className={`tab-btn ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            <Bookmark size={15} /> {t("savedWorkersTab")} ({savedWorkers.length})
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="tab-panel-body">
          {activeTab === "active" && (
            <div className="active-requests-stack">
              {requests.length === 0 ? (
                <div className="empty-state-box" style={{ background: "#FFFFFF", padding: "40px", borderRadius: "16px", textAlign: "center", border: "1px solid #E2E1DC" }}>
                  <Clock size={36} className="empty-icon" style={{ color: "#4F46E5", margin: "0 auto 12px" }} />
                  <h3>{t("noActiveRequests")}</h3>
                  <p style={{ color: "#64748B", marginBottom: "20px" }}>Describe your service need to connect with certified cooperative workers nearby.</p>
                  <button className="btn-primary-sm" onClick={onNewRequest}>
                    {t("findRightWorkerBtn")}
                  </button>
                </div>
              ) : (
                requests.map((req) => (
                  <RequestTimeline
                    key={req.id || req._id}
                    request={req}
                    onAdvanceStep={() => onAdvanceStep(req.id || req._id)}
                    currentLang={currentLang}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="history-table-card" style={{ background: "#FFFFFF", padding: "28px", borderRadius: "16px", border: "1px solid #E2E1DC" }}>
              <h3>{t("serviceHistoryTab")}</h3>
              <div className="history-list" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {completedServices.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
                    <p>No completed services yet.</p>
                  </div>
                ) : (
                  completedServices.map((item) => (
                    <div key={item.id} className="history-row" style={{ display: "flex", justifyContent: "space-between", padding: "14px", background: "#F8F7F4", borderRadius: "12px", alignItems: "center" }}>
                      <div className="hist-meta-col">
                        <span className="hist-service" style={{ fontSize: "11px", fontWeight: 800, color: "#4F46E5" }}>{item.service.toUpperCase()}</span>
                        <h4 className="hist-task" style={{ fontSize: "16px", color: "#172033" }}>{item.task}</h4>
                        <span className="hist-date" style={{ fontSize: "12px", color: "#64748B" }}>{item.date}</span>
                      </div>

                      <div className="hist-worker-col">
                        <span className="hist-label" style={{ fontSize: "11px", color: "#94A3B8", display: "block" }}>Worker</span>
                        <span className="hist-worker-name" style={{ fontSize: "14px", fontWeight: 700 }}>{item.worker}</span>
                      </div>

                      <div className="hist-price-col" style={{ textAlign: "right" }}>
                        <span className="hist-cost" style={{ fontSize: "16px", fontWeight: 800, color: "#16A34A" }}>{item.cost}</span>
                        <span className="hist-rating" style={{ display: "block", fontSize: "12px", color: "#EAB308" }}>★★★★★ (5.0)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "saved" && (
            <div className="saved-workers-grid">
              {savedWorkers.length === 0 ? (
                 <div className="history-table-card" style={{ background: "#FFFFFF", padding: "28px", borderRadius: "16px", border: "1px solid #E2E1DC", width: "100%", textAlign: "center" }}>
                   <p style={{ color: "#64748B" }}>You haven't saved any workers yet.</p>
                 </div>
              ) : (
                savedWorkers.map(worker => (
                  <div key={worker.id} className="saved-worker-card" style={{ background: "#FFFFFF", padding: "24px", borderRadius: "16px", border: "1px solid #E2E1DC" }}>
                    <div className="saved-card-header" style={{ display: "flex", gap: "14px", marginBottom: "12px" }}>
                      <div className="saved-avatar-wrap" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#EEF2FF", color: "#4F46E5", display: "grid", placeItems: "center", fontWeight: 800 }}>
                        {getInitials(worker.name)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: "18px", color: "#172033" }}>{worker.name}</h4>
                        <span className="saved-spec" style={{ fontSize: "12px", color: "#64748B" }}>{worker.title}</span>
                      </div>
                    </div>
                    <p className="saved-coop" style={{ fontSize: "13px", color: "#4F46E5", marginBottom: "16px", fontWeight: 600 }}>{worker.cooperative}</p>
                    <div className="saved-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="saved-status" style={{ fontSize: "12px", background: worker.isAvailable ? "#ECFDF5" : "#FEF2F2", color: worker.isAvailable ? "#047857" : "#991B1B", padding: "4px 10px", borderRadius: "12px", fontWeight: 700 }}>
                        {worker.availability || (worker.isAvailable ? t("availableNow") : "Busy")}
                      </span>
                      <button className="btn-secondary-sm" onClick={() => onViewWorker(worker.id)}>
                        {t("viewPassportBtn")}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
