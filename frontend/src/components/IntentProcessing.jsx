import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  ArrowRight,
  ClipboardList,
  Clock,
  MapPin,
  Check,
  AlertCircle
} from "lucide-react";

export default function IntentProcessing({
  parsedIntent,
  onCompleteProcessing,
  isReady = true,
  error = "",
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    "Identifying service requirement...",
    "Estimating task duration...",
    "Finding available professionals...",
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStepIndex(1), 600);
    const timer2 = setTimeout(() => setCurrentStepIndex(2), 1200);
    const timer3 = setTimeout(() => setCurrentStepIndex(3), 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const isDone = currentStepIndex >= 3;

  return (
    <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow-sm)', maxWidth: '600px', margin: '0 auto' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-ink)', marginBottom: '8px' }}>Processing Request</h2>
        <p style={{ fontSize: '1rem', color: 'var(--color-ink-soft)', fontStyle: 'italic' }}>
          "{parsedIntent.originalText || parsedIntent.rawText || "Your service request"}"
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {steps.map((stepText, idx) => {
          const stepDone = currentStepIndex > idx;
          const isCurrent = currentStepIndex === idx;

          return (
            <div key={stepText} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: stepDone ? 'var(--color-success)' : isCurrent ? 'var(--color-ink)' : 'var(--color-text-subtle)', transition: 'var(--transition-normal)' }}>
              {stepDone ? (
                <CheckCircle2 size={20} />
              ) : isCurrent ? (
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
              ) : (
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--color-border)' }} />
              )}
              <span style={{ fontSize: '0.95rem', fontWeight: stepDone || isCurrent ? '500' : '400' }}>{stepText}</span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {isDone && (
        <div style={{ backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)', padding: '24px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: '600', marginBottom: '16px' }}>
            <Check size={18} /> <span>Service Identified</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600', marginBottom: '4px' }}>Category</span>
              <strong style={{ color: 'var(--color-ink)', fontSize: '1rem' }}>{parsedIntent.serviceCategory ? parsedIntent.serviceCategory.toUpperCase() : "General"}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600', marginBottom: '4px' }}>Task</span>
              <strong style={{ color: 'var(--color-ink)', fontSize: '1rem' }}>{parsedIntent.taskDetail || "General Maintenance"}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600', marginBottom: '4px' }}>Urgency</span>
              <strong style={{ color: 'var(--color-ink)', fontSize: '0.95rem' }}>{parsedIntent.urgency || "Standard"}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600', marginBottom: '4px' }}>Est. Time</span>
              <strong style={{ color: 'var(--color-ink)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> {parsedIntent.estimatedDuration || "45 min"}</strong>
            </div>
          </div>

          <button 
            onClick={onCompleteProcessing}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', transition: 'var(--transition-fast)' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
          >
            Match with a Professional <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
