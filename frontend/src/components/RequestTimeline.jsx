import React from "react";
import { CheckCircle2, Clock, Play } from "lucide-react";
import { getTranslation } from "../services/i18n.js";

export default function RequestTimeline({ request, onAdvanceStep, currentLang = "en" }) {
  if (!request) return null;
  const t = (key) => getTranslation(currentLang, key);

  const timelineSteps = [
    { key: "CREATED", title: t("statusCreated"), desc: "Service intent logged in CREATED state" },
    { key: "MATCHED", title: t("statusMatched"), desc: "Workers scored & ranked by FairMatch™" },
    { key: "WORKER_ACCEPTED", title: t("statusAccepted"), desc: "Worker accepted assignment" },
    { key: "EN_ROUTE", title: t("statusEnRoute"), desc: "Worker traveling to location" },
    { key: "JOB_STARTED", title: t("statusStarted"), desc: "Service work actively in progress" },
    { key: "COMPLETED", title: t("statusCompleted"), desc: "Job completed & passport updated" }
  ];

  const statusUpper = (request.status || "CREATED").toUpperCase();

  let currentStepIdx = 0;
  if (statusUpper === "CREATED") currentStepIdx = 0;
  else if (statusUpper === "MATCHED") currentStepIdx = 1;
  else if (statusUpper === "WORKER_ACCEPTED" || statusUpper === "ACCEPTED") currentStepIdx = 2;
  else if (statusUpper === "EN_ROUTE") currentStepIdx = 3;
  else if (statusUpper === "JOB_STARTED" || statusUpper === "STARTED") currentStepIdx = 4;
  else if (statusUpper === "COMPLETED") currentStepIdx = 5;

  return (
    <div className="request-timeline-card">
      <div className="req-card-header">
        <div className="req-title-wrap">
          <span className="req-category-pill">{(request.serviceCategory || "SERVICE").toUpperCase()} REQUEST</span>
          <h3 className="req-task-title">{request.taskDetail}</h3>
        </div>

        <div className="req-meta-badges">
          <span className="req-status-pill">Status: {timelineSteps[currentStepIdx]?.title || statusUpper}</span>
          <span className="req-urgency-pill">{request.urgency || "Standard"} Urgency</span>
        </div>
      </div>

      {/* Assigned Worker Summary */}
      {request.worker && (
        <div className="assigned-worker-banner">
          <img src={request.worker.avatar} alt={request.worker.name} className="assigned-avatar" />
          <div className="assigned-info">
            <span className="assigned-label">ASSIGNED COOPERATIVE WORKER</span>
            <h4 className="assigned-name">{request.worker.name}</h4>
            <span className="assigned-coop">{request.worker.cooperative}</span>
          </div>
          <div className="assigned-eta-box">
            <Clock size={14} />
            <span>ETA: 20 min</span>
          </div>
        </div>
      )}

      {/* Step Progress Timeline */}
      <div className="timeline-steps-track">
        {timelineSteps.map((step, idx) => {
          const isDone = idx <= currentStepIdx;
          const isCurrent = idx === currentStepIdx;

          return (
            <div key={step.key} className={`timeline-step-item ${isDone ? "step-done" : ""} ${isCurrent ? "step-current" : ""}`}>
              <div className="step-node-col">
                <div className="step-circle-icon">
                  {isDone ? <CheckCircle2 size={16} /> : <span>{idx + 1}</span>}
                </div>
                {idx < timelineSteps.length - 1 && <div className="step-line" />}
              </div>

              <div className="step-content-col">
                <h4 className="step-title">{step.title}</h4>
                <p className="step-desc">{step.desc}</p>
                {isCurrent && <span className="current-indicator" style={{ fontSize: "11px", fontWeight: 800, color: "#4F46E5" }}>ACTIVE PHASE</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Demo Controls to Advance Legitimate Lifecycle Step */}
      <div className="timeline-demo-controls">
        <span className="demo-ctl-label">Demo Controls (State Transition):</span>
        <button 
          className="btn-advance-step"
          onClick={onAdvanceStep}
          disabled={currentStepIdx >= timelineSteps.length - 1}
        >
          <Play size={13} /> Advance to Next Lifecycle State →
        </button>
      </div>
    </div>
  );
}
