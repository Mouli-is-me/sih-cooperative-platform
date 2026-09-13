import React from "react";
import CooperativePulse from "../components/CooperativePulse.jsx";
import WorkerHardwareCard from "../components/WorkerHardwareCard.jsx";

export default function CooperativeDashboardPage({ currentLang }) {
  return (
    <div className="cooperative-dashboard-page">
      <div className="coop-container">
        <CooperativePulse currentLang={currentLang} />

        <WorkerHardwareCard deviceCode="DEV-001" />
      </div>
    </div>
  );
}
