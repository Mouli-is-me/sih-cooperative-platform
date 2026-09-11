import React, { useState, useEffect } from "react";
import { Award, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft, X, AlertCircle, HelpCircle, Wrench, FileText, Activity } from "lucide-react";
import { api } from "../services/api.js";
import { getTranslation } from "../services/i18n.js";

export default function TradeAssessmentModal({ worker, onClose, onComplete, currentLang = "en" }) {
  const t = (key) => getTranslation(currentLang, key);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      setLoading(true);
      const cat = worker?.category || "plumbing";
      const data = await api.getAssessmentConfig(cat);
      if (isMounted && data) {
        setConfig(data);
      }
      if (isMounted) setLoading(false);
    };

    fetchConfig();
    return () => { isMounted = false; };
  }, [worker]);

  if (!worker) return null;

  const questions = config?.questions || [];
  const currentQ = questions[currentStep];

  const handleSelectOption = (qId, optionIdx) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [qId]: optionIdx
    });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const answersPayload = questions.map((q) => ({
      questionId: q.id,
      selectedIndex: selectedAnswers[q.id] ?? -1
    }));

    try {
      const res = await api.submitAssessment({
        workerId: worker.id || worker.coopId || `worker-${Date.now()}`,
        category: worker.category || "plumbing",
        answers: answersPayload
      });

      setResult(res);
      if (onComplete && res?.success) {
        onComplete(res);
      }
    } catch (err) {
      setResult({
        success: false,
        message: err.message || "Failed to score assessment"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "SAFETY": return "#DC2626";
      case "PRACTICAL": return "#4F46E5";
      case "DIAGNOSIS": return "#D97706";
      case "TOOLS": return "#059669";
      case "PROCEDURE": return "#2563EB";
      default: return "#4B5563";
    }
  };

  return (
    <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
      <div className="assessment-modal-card" style={{ background: "#FFFFFF", width: "100%", maxWidth: "680px", borderRadius: "16px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)", overflow: "hidden", border: "1px solid #E2E8F0" }}>
        
        {/* Modal Header */}
        <div style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)", color: "#FFFFFF", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", color: "#818CF8", fontWeight: 700 }}>
              <Award size={16} /> PRACTICAL TRADE COMPETENCY ASSESSMENT
            </div>
            <h3 style={{ margin: "4px 0 0 0", fontSize: "1.25rem", color: "#FFFFFF" }}>
              {config?.title || "Trade Competency Assessment"}
            </h3>
            <span style={{ fontSize: "0.85rem", color: "#C7D2FE" }}>Worker: {worker.name} • {(worker.category || "Plumbing").toUpperCase()}</span>
          </div>

          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#FFFFFF", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Activity className="spin-slow" size={32} style={{ color: "#4F46E5" }} />
              <p style={{ marginTop: "12px", color: "#64748B" }}>Loading trade assessment module...</p>
            </div>
          ) : result ? (
            /* Result Screen */
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: result.overallScore >= 70 ? "#DCFCE7" : "#FEE2E2", color: result.overallScore >= 70 ? "#16A34A" : "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
                <Award size={36} />
              </div>

              <span style={{ background: result.overallScore >= 70 ? "#EEF2FF" : "#FEF2F2", color: result.overallScore >= 70 ? "#3730A3" : "#991B1B", padding: "4px 14px", borderRadius: "12px", fontWeight: 700, fontSize: "0.85rem" }}>
                ASSESSMENT STATUS: {result.status}
              </span>

              <h2 style={{ fontSize: "2rem", margin: "12px 0 4px 0", color: "#0F172A" }}>
                {result.overallScore}% Overall Score
              </h2>

              <p style={{ fontSize: "1rem", color: "#475569", margin: "0 0 20px 0" }}>
                Assigned Skill Level: <strong>{result.skillLevel}</strong>
              </p>

              <div style={{ background: "#F8FAFC", padding: "16px", borderRadius: "12px", textAlign: "left", fontSize: "0.9rem", color: "#334155", border: "1px solid #E2E8F0", marginBottom: "20px" }}>
                <p style={{ margin: 0, lineHeight: 1.5 }}>
                  <ShieldCheck size={16} style={{ verticalAlign: "text-bottom", color: "#4F46E5", marginRight: "6px" }} />
                  {result.message}
                </p>
              </div>

              <button 
                onClick={onClose}
                style={{ background: "#4F46E5", color: "#FFFFFF", border: "none", padding: "12px 28px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            /* Question Carousel */
            <div>
              {/* Progress Tracker */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#64748B", marginBottom: "6px", fontWeight: 600 }}>
                  <span>Question {currentStep + 1} of {questions.length}</span>
                  <span style={{ background: getTypeBadgeColor(currentQ?.type), color: "#FFFFFF", padding: "2px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700 }}>
                    {currentQ?.type}
                  </span>
                </div>
                <div style={{ height: "6px", width: "100%", background: "#E2E8F0", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${((currentStep + 1) / questions.length) * 100}%`, background: "#4F46E5", transition: "width 0.3s ease" }} />
                </div>
              </div>

              {/* Question Box */}
              {currentQ && (
                <div>
                  <h4 style={{ fontSize: "1.05rem", color: "#0F172A", marginBottom: "16px", lineHeight: "1.5" }}>
                    {currentQ.text}
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                    {currentQ.options.map((opt, idx) => {
                      const isSelected = selectedAnswers[currentQ.id] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(currentQ.id, idx)}
                          style={{
                            textAlign: "left",
                            padding: "14px 16px",
                            borderRadius: "10px",
                            border: isSelected ? "2px solid #4F46E5" : "1px solid #CBD5E1",
                            background: isSelected ? "#EEF2FF" : "#FFFFFF",
                            color: isSelected ? "#3730A3" : "#334155",
                            fontWeight: isSelected ? 600 : 400,
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <span style={{ display: "inline-block", width: "24px", fontWeight: 700, color: isSelected ? "#4F46E5" : "#64748B" }}>
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  style={{ opacity: currentStep === 0 ? 0.5 : 1, background: "#F1F5F9", color: "#475569", border: "none", padding: "10px 18px", borderRadius: "8px", cursor: currentStep === 0 ? "not-allowed" : "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <ArrowLeft size={16} /> Previous
                </button>

                {currentStep < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={selectedAnswers[currentQ?.id] === undefined}
                    style={{ opacity: selectedAnswers[currentQ?.id] === undefined ? 0.5 : 1, background: "#4F46E5", color: "#FFFFFF", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    Next Question <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || selectedAnswers[currentQ?.id] === undefined}
                    style={{ background: "#059669", color: "#FFFFFF", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    {submitting ? "Scoring Assessment..." : "Submit & Calculate Score ✓"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
