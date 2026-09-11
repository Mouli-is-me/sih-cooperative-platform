import React from "react";
import SkillPassportCard from "../components/SkillPassportCard.jsx";

export default function WorkerProfilePage({ worker, onRequestWorker, onBack }) {
  return (
    <div className="worker-profile-page">
      <div className="profile-container">
        <SkillPassportCard 
          worker={worker} 
          onRequestWorker={onRequestWorker}
          onBack={onBack}
        />
      </div>
    </div>
  );
}
