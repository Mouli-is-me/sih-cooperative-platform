import React from "react";
import CooperativePulse from "../components/CooperativePulse.jsx";

export default function CooperativeDashboardPage({ currentLang }) {
  return (
    <div className="cooperative-dashboard-page">
      <div className="coop-container">
        <CooperativePulse currentLang={currentLang} />
      </div>
    </div>
  );
}

