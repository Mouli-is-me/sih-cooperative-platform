import React, { useState } from "react";
import { Star, ShieldCheck, MapPin, Clock, CheckCircle2, ArrowRight, Award, User, ChevronDown, ChevronUp, Info } from "lucide-react";
import { explainMatch } from "../services/matching.js";
import { getTranslation } from "../services/i18n.js";

export default function WorkerMatchCard({ worker, intent, isBestMatch, onRequestWorker, onViewProfile, currentLang = "en" }) {
  // Progressive Disclosure: Default open for #1 match, collapsed for others
  const [showDetails, setShowDetails] = useState(isBestMatch);
  const matchReasons = explainMatch(worker, intent);
  const t = (key) => getTranslation(currentLang, key);

  let workloadClass = "wl-low";
  if (worker.workloadCapacity > 75) workloadClass = "wl-high";
  else if (worker.workloadCapacity > 40) workloadClass = "wl-medium";

  return (
    <div className={`worker-match-card ${isBestMatch ? "best-match-highlight" : ""}`}>
      {isBestMatch && (
        <div className="best-match-ribbon">
          <Award size={13} />
          <span>{t("recommendedBadge")}</span>
        </div>
      )}

      {/* Primary Card View (Always Visible) */}
      <div className="card-top-header">
        <div className="worker-avatar-box">
          <img src={worker.avatar} alt={worker.name} className="worker-avatar-img" />
          <span className="verify-badge" title={t("verifiedBadge")}>
            <ShieldCheck size={14} />
          </span>
        </div>

        <div className="worker-main-info">
          <div className="worker-name-row">
            <h3 className="worker-name">{worker.name}</h3>
            <span className="coop-badge-pill">{worker.badge}</span>
          </div>

          <p className="worker-spec-title">{worker.title.toUpperCase()}</p>

          <div className="worker-metrics-row">
            <span className="rating-pill">
              <Star size={13} className="star-icon" />
              <strong>{worker.rating}</strong>
              <span className="jobs-count">({worker.jobsCompleted} jobs)</span>
            </span>

            <span className="distance-pill">
              <MapPin size={13} />
              {worker.distanceKm} km away
            </span>

            <span className={`avail-pill ${worker.isAvailable ? "avail-true" : "avail-false"}`}>
              <Clock size={13} />
              {worker.isAvailable ? t("availableNow") : t("busyNow")}
            </span>
          </div>
        </div>

        {/* FairMatch Score Badge */}
        <div className="fairmatch-score-badge-wrap">
          <span className="score-label">{t("fairMatchScoreLabel")}</span>
          <div className="score-circle">
            <span className="score-val">{worker.fairMatchScore}</span>
          </div>
        </div>
      </div>

      {/* Progressive Disclosure Toggle Button */}
      <button 
        type="button"
        className="btn-toggle-details"
        onClick={() => setShowDetails(!showDetails)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "none",
          border: "none",
          color: "#4F46E5",
          fontWeight: "700",
          fontSize: "13px",
          padding: "4px 0",
          margin: "8px 0 16px 0",
          cursor: "pointer"
        }}
      >
        <Info size={14} />
        <span>{showDetails ? "Hide Match Details" : t("whyThisWorker")}</span>
        {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Secondary Detailed Information (Progressive Disclosure Panel) */}
      {showDetails && (
        <>
          {/* Metrics Grid */}
          <div className="card-metrics-grid">
            <div className="metric-box">
              <span className="metric-lbl">{t("skillFitLabel")}</span>
              <span className="metric-val text-primary">{worker.skillFitPercent}%</span>
            </div>

            <div className="metric-box">
              <span className="metric-lbl">{t("reliabilityLabel")}</span>
              <span className="metric-val">{worker.reliabilityScore}%</span>
            </div>

            <div className="metric-box">
              <span className="metric-lbl">{t("workloadLabel")}</span>
              <span className={`metric-val workload-tag ${workloadClass}`}>
                {worker.workloadStatus.toUpperCase()} ({worker.workloadCapacity}%)
              </span>
            </div>

            <div className="metric-box">
              <span className="metric-lbl">{t("experienceLabel")}</span>
              <span className="metric-val">{worker.experienceYears}+ yrs</span>
            </div>
          </div>

          {/* WHY THIS MATCH Rationale Box */}
          <div className="why-match-box">
            <h4 className="why-title">{t("whyThisMatch")}</h4>
            <ul className="why-reasons-list">
              {matchReasons.map((reason, idx) => (
                <li key={idx} className="reason-item">
                  <CheckCircle2 size={15} className="reason-check" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="card-actions-row">
        <button className="btn-secondary-card" onClick={() => onViewProfile(worker)}>
          <User size={15} />
          <span>{t("viewPassportBtn")}</span>
        </button>

        <button 
          className="btn-primary-card" 
          onClick={() => onRequestWorker(worker)}
          disabled={!worker.isAvailable && intent?.urgency === "High"}
        >
          <span>{t("requestWorkerBtn")} ({worker.name.split(" ")[0]})</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
