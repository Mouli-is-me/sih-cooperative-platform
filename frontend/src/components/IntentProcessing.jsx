import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
} from "lucide-react";

export default function IntentProcessing({
  parsedIntent,
  onCompleteProcessing,
  isReady = true,
  error = "",
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    "Identifying service category...",
    "Analyzing task requirements & duration...",
    "Evaluating urgency & schedule constraints...",
    "Querying verified cooperative workers...",
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStepIndex(1), 100);
    const timer2 = setTimeout(() => setCurrentStepIndex(2), 200);
    const timer3 = setTimeout(() => setCurrentStepIndex(3), 300);
    const timer4 = setTimeout(() => setCurrentStepIndex(4), 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const isDone = currentStepIndex >= 4;

  return (
    <div className="intent-processing-card">
      <div className="processing-header">
        <div className="processing-pill">
          <Sparkles size={14} />
          <span>REAL-TIME INTENT PROCESSING</span>
        </div>
        <h2>Analyzing Service Request</h2>
        <p className="processing-query">
          "
          {parsedIntent.originalText ||
            parsedIntent.rawText ||
            "Your service request"}
          "
        </p>
      </div>

      {/* Progress Steps List */}
      <div className="processing-steps">
        {steps.map((stepText, idx) => {
          const stepDone = currentStepIndex > idx;
          const isCurrent = currentStepIndex === idx;

          return (
            <div
              key={stepText}
              className={`step-row ${
                stepDone ? "completed" : isCurrent ? "active" : ""
              }`}
            >
              <div className="step-icon-col">
                {stepDone ? (
                  <CheckCircle2 size={18} className="text-forest" />
                ) : (
                  <span className="step-dot" />
                )}
              </div>
              <span className="step-text">{stepText}</span>
            </div>
          );
        })}
      </div>

      {error && <div className="auth-error">{error}</div>}

      {/* Extracted Entity Summary Box */}
      {isDone && (
        <div className="extracted-entity-box">
          <div className="entity-box-title">
            <ShieldCheck size={16} /> Extracted Parameters
          </div>

          <div className="entity-pills-row">
            <div className="entity-pill">
              <span className="ep-lbl">Category:</span>
              <strong>
                {parsedIntent.serviceCategory
                  ? parsedIntent.serviceCategory.toUpperCase()
                  : "PLUMBING"}
              </strong>
            </div>

            <div className="entity-pill">
              <span className="ep-lbl">Task:</span>
              <strong>
                {parsedIntent.taskDetail || "General Maintenance"}
              </strong>
            </div>

            <div className="entity-pill">
              <span className="ep-lbl">Urgency:</span>
              <strong>{parsedIntent.urgency || "Standard"}</strong>
            </div>

            <div className="entity-pill">
              <span className="ep-lbl">Est. Duration:</span>
              <Clock size={13} />
              <strong>{parsedIntent.estimatedDuration || "45 min"}</strong>
            </div>

            <div className="entity-pill">
              <span className="ep-lbl">Location:</span>
              <MapPin size={13} />
              <strong>{parsedIntent.location || "Madurai Central"}</strong>
            </div>
          </div>

          <button className="btn-view-matches" onClick={onCompleteProcessing}>
            View Available Workers <ArrowRight size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
