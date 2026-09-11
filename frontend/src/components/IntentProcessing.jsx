import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
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
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    "Identifying service category...",
    "Analyzing specific task & estimated duration...",
    "Evaluating urgency & schedule constraints...",
    "Scanning certified cooperative workers & workload balance...",
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStepIndex(1), 600);
    const timer2 = setTimeout(() => setCurrentStepIndex(2), 1200);
    const timer3 = setTimeout(() => setCurrentStepIndex(3), 1800);
    const timer4 = setTimeout(() => setCurrentStepIndex(4), 2400);

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
          <Sparkles size={14} className="spin-icon" />
          <span>UNDERSTANDING YOUR REQUEST</span>
        </div>
        <h2>Parsing Service Intent</h2>
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
        {steps.map((label, idx) => {
          const stepCompleted = currentStepIndex > idx;
          const stepInProgress = currentStepIndex === idx;

          return (
            <div
              key={idx}
              className={`step-row ${stepCompleted ? "completed" : ""} ${stepInProgress ? "in-progress" : ""}`}
            >
              <div className="step-icon-wrap">
                {stepCompleted ? (
                  <CheckCircle2 size={18} className="check-icon" />
                ) : stepInProgress ? (
                  <Loader2 size={18} className="spinner-icon" />
                ) : (
                  <div className="step-dot" />
                )}
              </div>
              <span className="step-label">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Parsed Result Display */}
      {isDone && isReady && (
        <div className="parsed-summary-box">
          <div className="summary-badge">
            <ShieldCheck size={16} /> SERVICE INTENT DETECTED
          </div>

          <div className="summary-grid">
            <div className="summary-item">
              <span className="item-label">SERVICE CATEGORY</span>
              <span className="item-value val-highlight">
                {parsedIntent.serviceCategory}
              </span>
            </div>

            <div className="summary-item">
              <span className="item-label">TASK IDENTIFIED</span>
              <span className="item-value">{parsedIntent.taskDetail}</span>
            </div>

            <div className="summary-item">
              <span className="item-label">URGENCY LEVEL</span>
              <span className="item-value val-urgency">
                <Clock size={13} /> {parsedIntent.urgencyBadge}
              </span>
            </div>

            <div className="summary-item">
              <span className="item-label">ESTIMATED DURATION</span>
              <span className="item-value">
                {parsedIntent.estimatedDuration}
              </span>
            </div>
          </div>

          <button className="btn-see-matches" onClick={onCompleteProcessing}>
            <span>See FairMatches™</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {isDone && !isReady && (
        <div className="processing-wait-state" role="status" aria-live="polite">
          <Loader2 size={17} className="spinner-icon" />
          <span>Securing local matches and preparing your request...</span>
        </div>
      )}
    </div>
  );
}
