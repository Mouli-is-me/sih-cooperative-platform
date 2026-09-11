import React, { useState } from "react";
import {
  Info,
  Play,
  CheckCircle2,
  User,
  Building,
  UserCheck,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Server,
} from "lucide-react";
import { isLiveBackendAvailable } from "../services/api.js";

export default function DemoControls({
  activeView,
  onNavigate,
  onSelectPreset,
  currentLang,
  onChangeLang,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    {
      label: "Plumbing (EN): Kitchen tap leak",
      query: "My kitchen tap is leaking and I need someone today",
    },
    {
      label: "Plumbing (TA): குழாய் கசிகிறது",
      query: "என் சமையலறை குழாய் கசிகிறது",
    },
    {
      label: "Plumbing (HI): नल लीक हो रहा है",
      query: "मेरे रसोई घर का नल लीक हो रहा है आज कोई आ सकता है क्या",
    },
    {
      label: "Electrical (EN): Ceiling fan sparking",
      query: "Ceiling fan speed regulator is sparking and not working",
    },
    {
      label: "Carpentry (EN): Door hinge stuck",
      query: "Main entrance wooden door hinge broken and sticking",
    },
    {
      label: "Caregiving (EN): Senior assistance",
      query: "Need urgent elderly care support for elderly parent",
    },
  ];

  return (
    <div className="demo-controls-toolbar">
      <div className="toolbar-bar-header">
        <div className="tb-badge-group">
          <span className="tb-demo-pill">
            <Info size={12} /> SIH DEMO CONTROLS
          </span>

          <span
            className={`tb-mode-chip ${isLiveBackendAvailable ? "chip-live" : "chip-demo"}`}
          >
            <Server size={11} />
            {isLiveBackendAvailable
              ? "LIVE API MODE (Node.js)"
              : "DEMO MODE (Local State)"}
          </span>
        </div>

        <div className="tb-right-group">
          <button className="tb-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
            <SlidersHorizontal size={13} />
            <span>Demo Mode</span>
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="toolbar-body-content">
          {/* Quick Preset Buttons */}
          <div className="preset-buttons">
            <span className="preset-label">Test Scenario Presets:</span>
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

          {/* Role Direct Jump Switcher */}
          <div className="role-switcher">
            <button
              className={`role-btn ${activeView === "/" || activeView === "/find" ? "active" : ""}`}
              onClick={() => onNavigate("/")}
            >
              <User size={13} /> Customer Intent
            </button>
            <button
              className={`role-btn ${activeView === "/customer" ? "active" : ""}`}
              onClick={() => onNavigate("/customer")}
            >
              <CheckCircle2 size={13} /> Customer Portal
            </button>
            <button
              className={`role-btn ${activeView === "/worker" ? "active" : ""}`}
              onClick={() => onNavigate("/worker")}
            >
              <UserCheck size={13} /> Worker Portal
            </button>
            <button
              className={`role-btn ${activeView === "/cooperative" ? "active" : ""}`}
              onClick={() => onNavigate("/cooperative")}
            >
              <Building size={13} /> Coop Federation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
