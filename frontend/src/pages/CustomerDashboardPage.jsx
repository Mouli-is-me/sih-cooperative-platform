import React, { useState } from "react";
import RequestTimeline from "../components/RequestTimeline.jsx";
import { Clock, CheckCircle2, Bookmark, Plus, ArrowRight, ShieldCheck, User } from "lucide-react";
import { getTranslation } from "../services/i18n.js";

export default function CustomerDashboardPage({
  requests = [],
  onAdvanceStep,
  onNewRequest,
  onViewWorker,
  currentLang = "en"
}) {
  const [activeTab, setActiveTab] = useState("active");
  const t = (key) => getTranslation(currentLang, key);

  const completedServices = [
    {
      id: "hist-99",
      service: "Electrical",
      task: "Ceiling fan regulator replacement",
      worker: "Selvi R.",
      date: "Aug 24, 2026",
      cost: "₹450",
      rating: 5
    },
    {
      id: "hist-98",
      service: "Carpentry",
      task: "Cabinet door hinge fix",
      worker: "Murugan P.",
      date: "Jul 12, 2026",
      cost: "₹600",
      rating: 5
    }
  ];

  return (
    <div className="customer-dashboard-page">
      <div className="dashboard-container">
        {/* Dashboard Header */}
        <div className="dash-header">
          <div className="user-profile-summary">
            <div className="user-avatar-circle">AS</div>
            <div className="user-meta">
              <h2>Anand Sundaram</h2>
              <span className="user-loc">K.K. Nagar, Madurai • {t("customerDashTitle")}</span>
            </div>
          </div>

          <button className="btn-new-request" onClick={onNewRequest}>
            <Plus size={16} /> + {t("findRightWorkerBtn")}
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
            <Bookmark size={15} /> {t("savedWorkersTab")}
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="tab-panel-body">
          {activeTab === "active" && (
            <div className="active-requests-stack">
              {requests.length === 0 ? (
                <div className="empty-state-box" style={{ background: "#FFFFFF", padding: "40px", borderRadius: "16px", textAlignment: "center", border: "1px solid #E2E1DC" }}>
                  <Clock size={36} className="empty-icon" style={{ color: "#4F46E5", marginBottom: "12px" }} />
                  <h3>{t("noActiveRequests")}</h3>
                  <p style={{ color: "#64748B", marginBottom: "20px" }}>Describe your service need to connect with certified cooperative workers nearby.</p>
                  <button className="btn-primary-sm" onClick={onNewRequest}>
                    + {t("findRightWorkerBtn")}
                  </button>
                </div>
              ) : (
                requests.map((req) => (
                  <RequestTimeline
                    key={req.id}
                    request={req}
                    onAdvanceStep={() => onAdvanceStep(req.id)}
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
                {completedServices.map((item) => (
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
                ))}
              </div>
            </div>
          )}

          {activeTab === "saved" && (
            <div className="saved-workers-grid">
              <div className="saved-worker-card" style={{ background: "#FFFFFF", padding: "24px", borderRadius: "16px", border: "1px solid #E2E1DC" }}>
                <div className="saved-card-header" style={{ display: "flex", gap: "14px", marginBottom: "12px" }}>
                  <div className="saved-avatar-wrap" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#EEF2FF", color: "#4F46E5", display: "grid", placeItems: "center", fontWeight: 800 }}>KM</div>
                  <div>
                    <h4 style={{ fontSize: "18px", color: "#172033" }}>Kumar M.</h4>
                    <span className="saved-spec" style={{ fontSize: "12px", color: "#64748B" }}>Plumbing Specialist</span>
                  </div>
                </div>
                <p className="saved-coop" style={{ fontSize: "13px", color: "#4F46E5", marginBottom: "16px", fontWeight: 600 }}>Madurai District Labour Co-op Federation</p>
                <div className="saved-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="saved-status" style={{ fontSize: "12px", background: "#ECFDF5", color: "#047857", padding: "4px 10px", borderRadius: "12px", fontWeight: 700 }}>{t("availableNow")}</span>
                  <button className="btn-secondary-sm" onClick={() => onViewWorker("w-kumar")}>
                    {t("viewPassportBtn")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
