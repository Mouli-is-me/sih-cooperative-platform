import React, { useState } from "react";
import { Scale, ShieldCheck, ArrowRight, TrendingUp, Info } from "lucide-react";
import { getFairMatches, getTraditionalMatches } from "../services/matching.js";
import { getTranslation } from "../services/i18n.js";

export default function TraditionalVsFairMatch({ intent, currentLang }) {
  const t = (key) => getTranslation(currentLang, key);
  const [fairMatchOn, setFairMatchOn] = useState(true);

  const fairMatches = getFairMatches(intent);
  const traditionalMatches = getTraditionalMatches(intent);

  const currentList = fairMatchOn ? fairMatches : traditionalMatches;
  const topWorker = currentList[0];

  return (
    <div className="traditional-vs-fairmatch-card">
      <div className="tvf-header">
        <div className="tvf-title-area">
          <div className="tvf-eyebrow">
            <Scale size={14} /> {t("matchingDemoEyebrow")}
          </div>
          <h3>{t("traditionalVsFairMatchTitle")}</h3>
          <p>{t("matchingDemoDesc")}</p>
        </div>

        {/* Interactive FairMatch Toggle */}
        <div className="fairmatch-toggle-wrap">
          <button 
            className={`toggle-mode-btn ${fairMatchOn ? "active-on" : ""}`}
            onClick={() => setFairMatchOn(true)}
          >
            <ShieldCheck size={15} />
            <span>{t("fairMatchOn")}</span>
          </button>

          <button 
            className={`toggle-mode-btn ${!fairMatchOn ? "active-off" : ""}`}
            onClick={() => setFairMatchOn(false)}
          >
            <span>{t("fairMatchOff")}</span>
          </button>
        </div>
      </div>

      {/* Outcome Rationale Banner */}
      <div className={`tvf-outcome-banner ${fairMatchOn ? "banner-fairmatch" : "banner-traditional"}`}>
        <div className="outcome-meta">
          <span className="outcome-label">{t("recommendedDispatchCandidate")}</span>
          <h4 className="outcome-worker-name">{topWorker.name} ({topWorker.rating}★)</h4>
          <span className="outcome-spec">{topWorker.title}</span>
        </div>

        <div className="outcome-reason">
          {fairMatchOn ? (
            <span>
              ✓ <strong>{t("fairMatchSelectedDesc")} (Score: {topWorker.fairMatchScore})</strong> — Excellent skill fit (96%) with lower recent opportunity share (2 jobs in last 7 days). Preserves income equity across roster.
            </span>
          ) : (
            <span>
              ⚠️ <strong>{t("traditionalSelectedDesc")} (4.9★)</strong> — Ravi is selected repeatedly because he has the highest rating, despite having 89% busy workload and 9 jobs in the last 7 days.
            </span>
          )}
        </div>
      </div>

      {/* Workload Distribution Visual Bar Comparison */}
      <div className="tvf-bars-container">
        <h4 className="bars-title">
          {fairMatchOn ? t("fairMatchBalancedTitle") : t("traditionalInequitableTitle")}
        </h4>

        <div className="distribution-bars-list">
          {fairMatches.map((worker) => {
            let shareWidth = "30%";
            if (fairMatchOn) {
              if (worker.id === "w-kumar") shareWidth = "38%";
              if (worker.id === "w-ravi") shareWidth = "34%";
              if (worker.id === "w-arjun") shareWidth = "28%";
            } else {
              // Traditional concentration
              if (worker.id === "w-ravi") shareWidth = "68%"; // Ravi monopolizes
              if (worker.id === "w-kumar") shareWidth = "20%";
              if (worker.id === "w-arjun") shareWidth = "12%";
            }

            return (
              <div key={worker.id} className="tvf-bar-row">
                <div className="tvf-worker-info">
                  <span className="w-name">{worker.name}</span>
                  <span className="w-rating">{worker.rating}★</span>
                </div>

                <div className="tvf-track">
                  <div 
                    className={`tvf-fill ${fairMatchOn ? "fill-green" : "fill-amber"}`}
                    style={{ width: shareWidth }}
                  />
                </div>

                <span className="tvf-share-val">{shareWidth} {t("shareLabel")}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="tvf-disclaimer">
        <Info size={12} />
        <span>{t("philosophyDisclaimer")}</span>
      </div>
    </div>
  );
}

