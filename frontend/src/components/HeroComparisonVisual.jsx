import React from "react";
import { ShieldCheck, Scale, Award, Clock, MapPin, CheckCircle2 } from "lucide-react";

export default function HeroComparisonVisual() {
  return (
    <div className="hero-visual-card">
      <div className="visual-card-header">
        <div className="visual-brand">
          <ShieldCheck size={16} />
          <span>FAIRMATCH™ LIVE ENGINE</span>
        </div>
        <span className="live-pulse-chip">● ACTIVE SCORING</span>
      </div>

      <div className="visual-match-preview">
        <div className="visual-worker-row">
          <img 
            src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300" 
            alt="Kumar M." 
            className="v-avatar" 
          />
          <div className="v-info">
            <h4 className="v-name">Kumar M.</h4>
            <span className="v-title">Plumbing Specialist • Madurai Federation</span>
            <div className="v-pills">
              <span><MapPin size={12} /> 1.7 km</span>
              <span style={{ color: "#4ADE80", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Clock size={12} /> Available Now
              </span>
            </div>
          </div>
          <div className="v-score-box">
            <span className="v-score-num">91</span>
            <span className="v-score-lbl">FairMatch</span>
          </div>
        </div>

        <div className="v-factor-bars">
          <div className="v-factor">
            <div className="v-f-meta">
              <span>Skill Fit</span>
              <span>96%</span>
            </div>
            <div className="v-bar"><div className="v-fill" style={{ width: "96%", background: "#818CF8" }} /></div>
          </div>

          <div className="v-factor">
            <div className="v-f-meta">
              <span>Reliability & On-Time</span>
              <span>94%</span>
            </div>
            <div className="v-bar"><div className="v-fill" style={{ width: "94%", background: "#818CF8" }} /></div>
          </div>

          <div className="v-factor">
            <div className="v-f-meta">
              <span>Opportunity Equity (2 jobs/7d)</span>
              <span>92%</span>
            </div>
            <div className="v-bar"><div className="v-fill fill-amber" style={{ width: "92%", background: "#F97316" }} /></div>
          </div>
        </div>

        <div className="v-verif-footer">
          <CheckCircle2 size={14} style={{ color: "#4ADE80" }} />
          <span>Verified under Labour Cooperative Governance Rules</span>
        </div>
      </div>
    </div>
  );
}
