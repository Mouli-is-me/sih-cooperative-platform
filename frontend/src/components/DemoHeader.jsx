import React from "react";
import { Info, Play, CheckCircle2, User, Building, UserCheck } from "lucide-react";

export default function DemoHeader({ activeView, setActiveView, onSelectPreset }) {
  const presets = [
    { label: "Plumbing: Kitchen tap leak today", query: "My kitchen tap is leaking and I need someone today" },
    { label: "Electrical: Ceiling fan sparking", query: "Ceiling fan speed regulator is sparking and not working" },
    { label: "Carpentry: Wooden door hinge stuck", query: "Main entrance wooden door hinge broken and sticking" },
    { label: "Caregiving: Senior assistance today", query: "Need urgent elderly care support for elderly parent" }
  ];

  return (
    <div className="demo-header-banner">
      <div className="demo-header-inner">
        <div className="demo-badge-wrap">
          <span className="demo-pill">
            <Info size={13} /> SIH DEMO MODE
          </span>
          <span className="demo-subtext">
            Deterministic FairMatch™ Engine active. Select a scenario preset or switch views:
          </span>
        </div>

        <div className="demo-controls">
          {/* Quick Preset Buttons */}
          <div className="preset-buttons">
            <span className="preset-label">Test Intent Presets:</span>
            {presets.map((preset, idx) => (
              <button 
                key={idx} 
                className="preset-chip"
                onClick={() => onSelectPreset(preset.query)}
              >
                <Play size={10} className="play-icon" />
                {preset.label}
              </button>
            ))}
          </div>

          {/* Direct Role Switcher */}
          <div className="role-switcher">
            <button 
              className={`role-btn ${activeView === "home" || activeView === "matches" ? "active" : ""}`}
              onClick={() => setActiveView("home")}
              title="Customer Search Flow"
            >
              <User size={13} /> Customer Intent
            </button>
            <button 
              className={`role-btn ${activeView === "customer" ? "active" : ""}`}
              onClick={() => setActiveView("customer")}
              title="Customer Dashboard & Request Tracking"
            >
              <CheckCircle2 size={13} /> Customer Portal
            </button>
            <button 
              className={`role-btn ${activeView === "worker-dashboard" ? "active" : ""}`}
              onClick={() => setActiveView("worker-dashboard")}
              title="Worker Dashboard"
            >
              <UserCheck size={13} /> Worker Portal
            </button>
            <button 
              className={`role-btn ${activeView === "cooperative" ? "active" : ""}`}
              onClick={() => setActiveView("cooperative")}
              title="Cooperative Federation Pulse"
            >
              <Building size={13} /> Coop Federation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
