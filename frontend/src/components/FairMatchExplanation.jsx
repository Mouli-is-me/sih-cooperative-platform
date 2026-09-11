import React from "react";
import { Info, ShieldAlert } from "lucide-react";
import { WEIGHTS } from "../services/matching.js";

export default function FairMatchExplanation() {
  const priorities = [
    { label: "Skill Fit & Task Fit", weight: "40%", barWidth: "40%", desc: "Direct proficiency match for requested job" },
    { label: "Availability", weight: "20%", barWidth: "20%", desc: "Ready for immediate or requested schedule" },
    { label: "Reliability & Quality", weight: "15%", barWidth: "15%", desc: "Verified on-time rate & coop background" },
    { label: "Proximity / Distance", weight: "10%", barWidth: "10%", desc: "Proximity to customer service location" },
    { label: "Workload Balance", weight: "15%", barWidth: "15%", desc: "Opportunity distribution fairness factor" },
  ];

  return (
    <div className="fairmatch-explanation-panel">
      <div className="explanation-header">
        <div className="fairmatch-title-wrap">
          <span className="fairmatch-brand">FAIRMATCH™</span>
          <span className="fairmatch-tag">MATCHING PRIORITIES</span>
        </div>
        <p className="explanation-subtitle">
          Unlike private commercial aggregators that over-concentrate requests on top-rated individuals, FairMatch balances technical suitability with community workload distribution.
        </p>
      </div>

      {/* Priority Bar Grid */}
      <div className="priorities-grid">
        {priorities.map((item, idx) => (
          <div key={idx} className="priority-row">
            <div className="priority-info">
              <span className="priority-name">{item.label}</span>
              <span className="priority-weight">{item.weight}</span>
            </div>
            <div className="priority-bar-bg">
              <div className="priority-bar-fill" style={{ width: item.barWidth }} />
            </div>
            <span className="priority-desc">{item.desc}</span>
          </div>
        ))}
      </div>

      <div className="demo-disclaimer-note">
        <Info size={13} />
        <span>PROTOTYPE SCORING MODEL — Transparent multi-factor weighting algorithm designed for labour cooperative federations.</span>
      </div>
    </div>
  );
}
