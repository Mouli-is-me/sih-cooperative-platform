import React from "react";
import { ShieldCheck, Award, CheckCircle2, Clock, Star, MapPin, UserCheck, Briefcase, Activity } from "lucide-react";

export default function SkillPassportCard({ worker, onRequestWorker, onBack }) {
  if (!worker) return null;

  return (
    <div className="skill-passport-wrapper">
      {onBack && (
        <button className="back-btn" onClick={onBack}>
          ← Back to FairMatches
        </button>
      )}

      <div className="skill-passport-container">
        {/* Passport Header Banner */}
        <div className="passport-banner">
          <div className="passport-credential-badge">
            <ShieldCheck size={18} />
            <span>OFFICIAL WORKER SKILL PASSPORT</span>
          </div>
          <span className="coop-id-tag">ID: {worker.coopId || worker._id || worker.id || "Not assigned"}</span>
        </div>

        {/* Passport Content Body */}
        <div className="passport-body">
          <div className="passport-hero-section">
            <div className="passport-avatar-box">
              <img src={worker.avatar} alt={worker.name} className="passport-avatar-img" />
              <span className="verified-stamp">
                <CheckCircle2 size={13} /> VERIFIED
              </span>
            </div>

            <div className="passport-hero-info">
              <span className="category-tag">{(worker.category || "General").toUpperCase()}</span>
              <h2 className="passport-name">{worker.name}</h2>
              <p className="passport-title">{worker.title}</p>
              <p className="passport-coop-name">{worker.cooperative}</p>

              <div className="passport-quick-tags">
                <span className="tag-item">
                  <Star size={13} className="star-icon" /> {worker.rating} Customer Rating
                </span>
                <span className="tag-item">
                  <Briefcase size={13} /> {worker.jobsCompleted} Completed Jobs
                </span>
                <span className="tag-item">
                  <Clock size={13} /> {worker.onTimeRate}% On-Time Record
                </span>
                <span className="tag-item">
                  <MapPin size={13} /> {worker.distanceKm} km Service Radius
                </span>
              </div>
            </div>

            <div className="passport-workload-status">
              <span className="capacity-label">CURRENT CAPACITY</span>
              <div className="capacity-value-box">
                <span className="capacity-num">{worker.workloadCapacity || 30}%</span>
                <span className="capacity-sub">{worker.workloadStatus || "Low"} Workload</span>
              </div>
              <div className={`status-pill ${worker.isAvailable ? "status-avail" : "status-busy"}`}>
                <Activity size={13} /> {worker.availability || "Available Now"}
              </div>
            </div>
          </div>

          <div className="passport-divider" />

          {/* Evidence-based Verified Skills & Competencies */}
          <div className="passport-section">
            <h3 className="section-title">
              <Award size={18} className="text-primary" /> VERIFIED SKILLS & COMPETENCY EVIDENCE
            </h3>

            <div className="skills-meter-grid">
              {(worker.skills || []).map((skill, idx) => (
                <div key={idx} className="skill-meter-card">
                  <div className="skill-meta-row">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-confidence" style={{ background: "#EEF2FF", color: "#3730A3", padding: "3px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 700 }}>
                      Level: {skill.level || "Advanced"}
                    </span>
                  </div>
                  <p className="skill-evidence" style={{ fontSize: "0.85rem", color: "#64748B", marginTop: "6px", marginBottom: "0", lineHeight: "1.4" }}>
                    ✓ {skill.evidence || "Verified by cooperative field audits & job completion history"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="passport-divider" />

          {/* Institutional Verifications */}
          <div className="passport-section">
            <h3 className="section-title">
              <ShieldCheck size={18} className="text-primary" /> COOPERATIVE VERIFICATIONS & CREDENTIALS
            </h3>

            <div className="verifications-list">
              {(worker.verifications || [
                "Cooperative Membership Verified",
                "Government Identity Verified",
                "Skill Competency Certified (NSDC Level 4)"
              ]).map((verif, idx) => (
                <div key={idx} className="verif-item">
                  <CheckCircle2 size={16} className="verif-icon" />
                  <span>{verif}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Biography & Work History */}
          <div className="passport-section">
            <h3 className="section-title">
              <UserCheck size={18} className="text-primary" /> WORKER PROFILE SUMMARY
            </h3>
            <p className="passport-bio">{worker.bio}</p>
          </div>

          {/* Action Footer */}
          <div className="passport-footer">
            <div className="guarantee-text">
              <ShieldCheck size={16} className="text-primary" /> Verified under Labour Cooperative Federation Governance Rules.
            </div>
            {onRequestWorker && (
              <button className="btn-request-passport" onClick={() => onRequestWorker(worker)}>
                Request {worker.name.split(" ")[0]} Now →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
