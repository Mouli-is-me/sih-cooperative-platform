import React, { useEffect, useState } from "react";
import {
  Radio,
  ShieldAlert,
  Volume2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  User,
  Cpu,
} from "lucide-react";

import { api } from "../services/api.js";

export default function WorkerHardwareCard({ deviceCode = "DEV-001" }) {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commandLoading, setCommandLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDevice = async () => {
    try {
      setError("");

      const result = await api.getHardwareDevice(deviceCode);

      if (result?.device) {
        setDevice(result.device);
      }
    } catch (err) {
      setError(err.message || "Unable to load device");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevice();

    const interval = setInterval(loadDevice, 5000);

    return () => clearInterval(interval);
  }, [deviceCode]);

  const sendCommand = async (state) => {
    try {
      setCommandLoading(true);
      setMessage("");
      setError("");

      const result = await api.setHardwareCommand(deviceCode, state);

      if (result?.device) {
        setDevice((current) => ({
          ...current,
          desiredState: result.device.desiredState,
          lastCommandAt: result.device.commandTime,
        }));
      }

      setMessage(
        state === "ALERT"
          ? "Safety alert sent to worker device."
          : state === "BUZZER_TEST"
            ? "Buzzer test command sent."
            : "Device returned to normal.",
      );

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Unable to send command");
    } finally {
      setCommandLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "24px",
          background: "#fff",
          borderRadius: "16px",
          marginTop: "24px",
        }}
      >
        <RefreshCw size={18} />
        <span style={{ marginLeft: "8px" }}>Loading worker hardware...</span>
      </div>
    );
  }

  if (error && !device) {
    return (
      <div
        style={{
          padding: "24px",
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          borderRadius: "16px",
          marginTop: "24px",
          color: "#991B1B",
        }}
      >
        <strong>Hardware unavailable</strong>
        <p>{error}</p>

        <button
          onClick={loadDevice}
          style={{
            padding: "8px 14px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!device) return null;

  const isOnline = device.isOnline;
  const isAlert = device.desiredState === "ALERT";

  return (
    <section
      style={{
        marginTop: "24px",
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: "18px",
        padding: "24px",
        boxShadow: "0 8px 30px rgba(15, 23, 42, 0.06)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          marginBottom: "22px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#64748B",
              letterSpacing: "0.08em",
            }}
          >
            <Cpu size={15} />
            PHYSICAL WORKER DEVICE
          </div>

          <h3
            style={{
              margin: "7px 0 4px",
              fontSize: "20px",
            }}
          >
            {device.deviceName}
          </h3>

          <p
            style={{
              margin: 0,
              color: "#64748B",
              fontSize: "14px",
            }}
          >
            Device ID: <strong>{device.deviceCode}</strong>
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "7px 12px",
            borderRadius: "999px",
            background: isOnline ? "#ECFDF5" : "#FEF2F2",
            color: isOnline ? "#047857" : "#B91C1C",
            fontWeight: 700,
            fontSize: "13px",
          }}
        >
          {isOnline ? <CheckCircle2 size={15} /> : <XCircle size={15} />}

          {isOnline ? "Hardware Online" : "Hardware Offline"}
        </div>
      </div>

      {/* Worker Assignment */}
      <div
        style={{
          padding: "16px",
          borderRadius: "12px",
          background: "#F8FAFC",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "#E0E7FF",
            display: "grid",
            placeItems: "center",
          }}
        >
          <User size={21} color="#4338CA" />
        </div>

        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: "16px",
            }}
          >
            {device.worker?.name || "Unknown Worker"}
          </div>

          <div
            style={{
              color: "#64748B",
              fontSize: "13px",
              marginTop: "3px",
            }}
          >
            {device.worker?.title} • Worker ID: {device.worker?.workerCode}
          </div>
        </div>
      </div>

      {/* Current state */}
      <div
        style={{
          padding: "18px",
          borderRadius: "12px",
          background: isAlert ? "#FEF2F2" : "#F0FDF4",
          border: `1px solid ${isAlert ? "#FECACA" : "#BBF7D0"}`,
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 800,
            color: "#64748B",
            marginBottom: "6px",
          }}
        >
          DEVICE COMMAND
        </div>

        <div
          style={{
            fontSize: "22px",
            fontWeight: 900,
            color: isAlert ? "#B91C1C" : "#166534",
          }}
        >
          {device.desiredState === "ALERT"
            ? "SAFETY ALERT"
            : device.desiredState === "BUZZER_TEST"
              ? "BUZZER TEST"
              : "NORMAL / WORKING"}
        </div>

        <div
          style={{
            marginTop: "6px",
            fontSize: "13px",
            color: "#64748B",
          }}
        >
          Hardware reported: <strong>{device.reportedState}</strong>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "10px",
        }}
      >
        <button
          onClick={() => sendCommand("ALERT")}
          disabled={commandLoading}
          style={{
            border: "none",
            borderRadius: "10px",
            padding: "13px 16px",
            background: "#DC2626",
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ShieldAlert size={17} />
          Send Safety Alert
        </button>

        <button
          onClick={() => sendCommand("BUZZER_TEST")}
          disabled={commandLoading}
          style={{
            border: "1px solid #CBD5E1",
            borderRadius: "10px",
            padding: "13px 16px",
            background: "#fff",
            color: "#334155",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Volume2 size={17} />
          Test Buzzer
        </button>

        <button
          onClick={() => sendCommand("NORMAL")}
          disabled={commandLoading}
          style={{
            border: "1px solid #BBF7D0",
            borderRadius: "10px",
            padding: "13px 16px",
            background: "#F0FDF4",
            color: "#166534",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={17} />
          Clear / Normal
        </button>
      </div>

      {message && (
        <div
          style={{
            marginTop: "16px",
            padding: "11px 14px",
            borderRadius: "9px",
            background: "#EFF6FF",
            color: "#1D4ED8",
            fontWeight: 700,
            fontSize: "14px",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: "16px",
            padding: "11px 14px",
            borderRadius: "9px",
            background: "#FEF2F2",
            color: "#B91C1C",
            fontWeight: 700,
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}
    </section>
  );
}
