import React, { useEffect, useState } from "react";
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
  Cpu,
  Wifi,
  Send,
  RotateCcw,
  Radio,
  Smartphone,
} from "lucide-react";

import { api, isLiveBackendAvailable } from "../services/api.js";

export default function DemoControls({
  activeView,
  onNavigate,
  onSelectPreset,
  currentLang,
  onChangeLang,
}) {
  const [isOpen, setIsOpen] = useState(false);

  // =====================================================
  // HARDWARE DEMO STATE
  // =====================================================

  const [hardware, setHardware] = useState(null);
  const [hardwareLoading, setHardwareLoading] = useState(false);
  const [hardwareAction, setHardwareAction] = useState("");
  const [hardwareMessage, setHardwareMessage] = useState("");
  const [hardwareError, setHardwareError] = useState("");

  const DEVICE_CODE = "DEV-001";

  // =====================================================
  // DEMO PRESETS
  // =====================================================

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

  // =====================================================
  // LOAD HARDWARE
  // =====================================================

  const loadHardware = async () => {
    try {
      setHardwareLoading(true);
      setHardwareError("");

      const response = await fetch(
        "https://sih-cooperative-platform.onrender.com/api/hardware/device/DEV-001/state",
        {
          method: "GET",
          headers: {
            "X-Device-Code": "DEV-001",
            "X-Device-Key": "SIH-DEV001-2026",
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Hardware status failed: ${response.status}`);
      }

      const result = await response.json();

      if (result?.device) {
        setHardware(result.device);
      }
    } catch (error) {
      console.error("[Demo Hardware]", error);

      setHardwareError(error.message || "Hardware status unavailable");
    } finally {
      setHardwareLoading(false);
    }
  };

  // =====================================================
  // POLL HARDWARE STATUS
  // =====================================================

  useEffect(() => {
    if (!isOpen) return;

    loadHardware();

    const interval = setInterval(loadHardware, 3000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // =====================================================
  // SEND HARDWARE COMMAND
  // =====================================================

  const sendHardwareCommand = async (state) => {
    try {
      setHardwareAction(state);
      setHardwareMessage("");
      setHardwareError("");

      await api.setHardwareCommand(DEVICE_CODE, state, null);

      const labels = {
        JOB_REQUESTED: "Job request sent to Kumar's physical device.",
        JOB_ACCEPTED: "Device marked as accepted.",
        AVAILABLE: "Device returned to available state.",
      };

      setHardwareMessage(labels[state]);

      await loadHardware();

      setTimeout(() => {
        setHardwareMessage("");
      }, 4000);
    } catch (error) {
      console.error("[Demo Hardware Command]", error);

      setHardwareError(error.message || "Unable to control hardware");
    } finally {
      setHardwareAction("");
    }
  };

  // =====================================================
  // HARDWARE STATUS HELPERS
  // =====================================================

  const hardwareOnline = hardware?.isOnline === true;

  const desiredState = hardware?.desiredState || "UNKNOWN";

  const reportedState = hardware?.reportedState || "UNKNOWN";

  const stateLabel = {
    AVAILABLE: "AVAILABLE",
    JOB_REQUESTED: "JOB REQUESTED",
    JOB_ACCEPTED: "JOB ACCEPTED",
    OFFLINE: "OFFLINE",
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="demo-controls-toolbar">
      {/* =================================================
          TOOLBAR HEADER
      ================================================= */}

      <div className="toolbar-bar-header">
        <div className="tb-badge-group">
          <span className="tb-demo-pill">
            <Info size={12} />
            SIH DEMO CONTROLS
          </span>

          <span
            className={`tb-mode-chip ${
              isLiveBackendAvailable ? "chip-live" : "chip-demo"
            }`}
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

      {/* =================================================
          TOOLBAR BODY
      ================================================= */}

      {isOpen && (
        <div className="toolbar-body-content">
          {/* =================================================
              QUICK PRESETS
          ================================================= */}

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

          {/* =================================================
              ROLE SWITCHER
          ================================================= */}

          <div className="role-switcher">
            <button
              className={`role-btn ${
                activeView === "/" || activeView === "/find" ? "active" : ""
              }`}
              onClick={() => onNavigate("/")}
            >
              <User size={13} />
              Customer Intent
            </button>

            <button
              className={`role-btn ${
                activeView === "/customer" ? "active" : ""
              }`}
              onClick={() => onNavigate("/customer")}
            >
              <CheckCircle2 size={13} />
              Customer Portal
            </button>

            <button
              className={`role-btn ${activeView === "/worker" ? "active" : ""}`}
              onClick={() => onNavigate("/worker")}
            >
              <UserCheck size={13} />
              Worker Portal
            </button>

            <button
              className={`role-btn ${
                activeView === "/cooperative" ? "active" : ""
              }`}
              onClick={() => onNavigate("/cooperative")}
            >
              <Building size={13} />
              Coop Federation
            </button>
          </div>

          {/* =================================================
              PHYSICAL HARDWARE DEMO
          ================================================= */}

          <div
            style={{
              marginTop: "18px",
              padding: "18px",
              borderRadius: "16px",
              border: "1px solid #CBD5E1",
              background: "linear-gradient(135deg, #F8FAFC, #EEF2FF)",
            }}
          >
            {/* HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px",
                marginBottom: "15px",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    fontSize: "11px",
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    color: "#475569",
                  }}
                >
                  <Cpu size={14} />
                  PHYSICAL WORKER DEVICE
                </div>

                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 900,
                    marginTop: "5px",
                    color: "#0F172A",
                  }}
                >
                  Live ESP32 Demo
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    marginTop: "3px",
                  }}
                >
                  Kumar M. • DEV-001
                </div>
              </div>

              {/* ONLINE BADGE */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  background: hardwareOnline ? "#DCFCE7" : "#FEE2E2",
                  color: hardwareOnline ? "#166534" : "#991B1B",
                  fontSize: "11px",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                <Wifi size={12} />

                {hardwareOnline ? "ONLINE" : "OFFLINE"}
              </div>
            </div>

            {/* LIVE FLOW */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  padding: "11px",
                  borderRadius: "10px",
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: "#64748B",
                    fontWeight: 800,
                  }}
                >
                  SERVER COMMAND
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "13px",
                    fontWeight: 900,
                    color:
                      desiredState === "JOB_REQUESTED"
                        ? "#B91C1C"
                        : desiredState === "JOB_ACCEPTED"
                          ? "#166534"
                          : "#334155",
                  }}
                >
                  {stateLabel[desiredState] || desiredState}
                </div>
              </div>

              <div
                style={{
                  padding: "11px",
                  borderRadius: "10px",
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: "#64748B",
                    fontWeight: 800,
                  }}
                >
                  DEVICE REPORT
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "13px",
                    fontWeight: 900,
                    color:
                      reportedState === "JOB_REQUESTED"
                        ? "#B91C1C"
                        : reportedState === "JOB_ACCEPTED"
                          ? "#166534"
                          : "#334155",
                  }}
                >
                  {stateLabel[reportedState] || reportedState}
                </div>
              </div>
            </div>

            {/* DEMO INSTRUCTION */}

            <div
              style={{
                padding: "11px 12px",
                borderRadius: "10px",
                background: "#EEF2FF",
                border: "1px solid #C7D2FE",
                marginBottom: "12px",
                fontSize: "12px",
                color: "#3730A3",
                lineHeight: 1.5,
              }}
            >
              <strong>Live hardware demonstration:</strong>
              <br />
              Send a job → ESP32 shows the request → press{" "}
              <strong>B1 + B2</strong>
              on the physical device → worker acceptance is reported back.
            </div>

            {/* COMMAND BUTTONS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
              }}
            >
              {/* JOB REQUEST */}

              <button
                onClick={() => sendHardwareCommand("JOB_REQUESTED")}
                disabled={!!hardwareAction}
                style={{
                  border: "none",
                  borderRadius: "10px",
                  padding: "11px 8px",
                  background: "#DC2626",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  opacity: hardwareAction ? 0.6 : 1,
                }}
              >
                <Send size={13} />

                {hardwareAction === "JOB_REQUESTED" ? "Sending..." : "Send Job"}
              </button>

              {/* ACCEPT */}

              <button
                onClick={() => sendHardwareCommand("JOB_ACCEPTED")}
                disabled={!!hardwareAction}
                style={{
                  border: "1px solid #86EFAC",
                  borderRadius: "10px",
                  padding: "11px 8px",
                  background: "#F0FDF4",
                  color: "#166534",
                  fontWeight: 800,
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  opacity: hardwareAction ? 0.6 : 1,
                }}
              >
                <CheckCircle2 size={13} />
                Server Accept
              </button>

              {/* CLEAR */}

              <button
                onClick={() => sendHardwareCommand("AVAILABLE")}
                disabled={!!hardwareAction}
                style={{
                  border: "1px solid #CBD5E1",
                  borderRadius: "10px",
                  padding: "11px 8px",
                  background: "#fff",
                  color: "#334155",
                  fontWeight: 800,
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  opacity: hardwareAction ? 0.6 : 1,
                }}
              >
                <RotateCcw size={13} />
                Reset
              </button>
            </div>

            {/* SUCCESS */}

            {hardwareMessage && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "9px 11px",
                  borderRadius: "8px",
                  background: "#DCFCE7",
                  color: "#166534",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                ✓ {hardwareMessage}
              </div>
            )}

            {/* ERROR */}

            {hardwareError && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "9px 11px",
                  borderRadius: "8px",
                  background: "#FEE2E2",
                  color: "#991B1B",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                {hardwareError}
              </div>
            )}

            {/* DEMO FLOW */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                marginTop: "14px",
                fontSize: "10px",
                color: "#64748B",
                fontWeight: 700,
                flexWrap: "wrap",
              }}
            >
              <span>WEBSITE</span>

              <span>→</span>

              <span>RENDER API</span>

              <span>→</span>

              <span>ESP32</span>

              <span>→</span>

              <span>B1+B2</span>

              <span>→</span>

              <span>ACCEPTED</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
