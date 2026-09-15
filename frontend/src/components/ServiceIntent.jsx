import React, { useState } from "react";
import VoiceInputButton from "./VoiceInputButton.jsx";
import { parseServiceIntent } from "../services/intentParser.js";
import { getTranslation } from "../services/i18n.js";
import IntentConfirmationCard from "./IntentConfirmationCard.jsx";
import {
  ArrowRight,
  User,
  Building2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function ServiceIntent({ onSubmitIntent, currentLang = "en" }) {
  const [inputText, setInputText] = useState("");
  const [customerType, setCustomerType] = useState("Household");
  const [activeIntent, setActiveIntent] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const t = (key) => getTranslation(currentLang, key);

  const samplePrompts = [
    { text: "Bathroom water correct ah veliya pogala sir" },
    { text: "Tap close pannalum water stop aagala" },
    { text: "One room la current illa" },
    { text: "Roof la water leakage aaguthu" },
  ];

  const quickCategories = [
    { key: "drainage", name: "Drainage" },
    { key: "plumbing", name: "Plumbing" },
    { key: "electrical", name: "Electrical" },
    { key: "construction", name: "Construction" },
  ];

  const handleTextChange = (val) => {
    setInputText(val);
    if (errorMsg) setErrorMsg("");
    if (val.trim().length > 3) {
      const parsed = parseServiceIntent(val);
      parsed.customerType = customerType;
      setActiveIntent(parsed);
    } else {
      setActiveIntent(null);
    }
  };

  const handleSpeechTranscribed = (transcript) => {
    handleTextChange(transcript);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) {
      setErrorMsg("Please describe your service problem.");
      return;
    }
    setErrorMsg("");
    onSubmitIntent(inputText, customerType);
  };

  const handleChipClick = (promptText) => {
    handleTextChange(promptText);
  };

  const handleClarificationChoice = (catKey) => {
    const refinedText = `${inputText} (${catKey} service)`;
    setInputText(refinedText);
    const parsed = parseServiceIntent(refinedText);
    parsed.categoryKey = catKey;
    parsed.serviceCategory = catKey.toUpperCase();
    parsed.customerType = customerType;
    parsed.confidence = 0.88;
    setActiveIntent(parsed);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-ink)', margin: 0 }}>What service do you need?</h3>
        <div style={{ display: 'flex', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-sm)', padding: '4px' }}>
          <button
            type="button"
            onClick={() => setCustomerType("Household")}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.875rem', fontWeight: '500', borderRadius: '4px', backgroundColor: customerType === "Household" ? 'var(--color-bg-surface)' : 'transparent', color: customerType === "Household" ? 'var(--color-ink)' : 'var(--color-text-muted)', boxShadow: customerType === "Household" ? 'var(--shadow-sm)' : 'none', border: 'none', cursor: 'pointer' }}
          >
            <User size={14} /> Household
          </button>
          <button
            type="button"
            onClick={() => setCustomerType("Institution")}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.875rem', fontWeight: '500', borderRadius: '4px', backgroundColor: customerType === "Institution" ? 'var(--color-bg-surface)' : 'transparent', color: customerType === "Institution" ? 'var(--color-ink)' : 'var(--color-text-muted)', boxShadow: customerType === "Institution" ? 'var(--shadow-sm)' : 'none', border: 'none', cursor: 'pointer' }}
          >
            <Building2 size={14} /> Commercial
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <textarea
          rows={3}
          placeholder="Describe the problem in your own words. Tamil, English, or Tanglish are supported."
          value={inputText}
          onChange={(e) => handleTextChange(e.target.value)}
          style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '1rem', color: 'var(--color-ink)', backgroundColor: 'var(--color-bg-base)', resize: 'none', transition: 'border-color var(--transition-fast)', outline: 'none', marginBottom: '16px' }}
          onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginRight: '8px', alignSelf: 'center' }}>Examples:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(p.text)}
                style={{ fontSize: '0.875rem', padding: '4px 10px', backgroundColor: 'var(--color-bg-muted)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--color-ink-soft)', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                onMouseOver={(e) => {e.currentTarget.style.backgroundColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-ink)'}}
                onMouseOut={(e) => {e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'; e.currentTarget.style.color = 'var(--color-ink-soft)'}}
              >
                "{p.text}"
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <VoiceInputButton
              currentLang={currentLang}
              onSpeechTranscribed={handleSpeechTranscribed}
            />

            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '600', cursor: 'pointer', transition: 'var(--transition-fast)' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
            >
              Request Service <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-error)', fontSize: '0.875rem', marginTop: '12px' }}>
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>

      {/* Clarification Prompt for unknown inputs */}
      {activeIntent && (activeIntent.confidence < 0.5 || activeIntent.categoryKey === 'UNKNOWN') && (
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--color-warning-light)', border: '1px solid #fcd34d', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#b45309" }}>
            <HelpCircle size={16} />
            <strong style={{ fontSize: "0.95rem" }}>What type of service do you need?</strong>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#b45309", marginBottom: "12px" }}>
            We couldn't accurately determine the service needed. Please select a category to clarify:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {quickCategories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleClarificationChoice(cat.key)}
                style={{ background: "#ffffff", border: "1px solid #f59e0b", color: "#d97706", padding: "6px 14px", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: 500, fontSize: "0.875rem" }}
              >
                + {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recognized Intent Confirmed */}
      {activeIntent && activeIntent.confidence >= 0.5 && activeIntent.categoryKey !== 'UNKNOWN' && (
        <div style={{ marginTop: '24px' }}>
          <IntentConfirmationCard
            intent={activeIntent}
            currentLang={currentLang}
            onConfirmIntent={() => onSubmitIntent(inputText, customerType, activeIntent)}
            onUpdateIntent={(updated) => setActiveIntent(updated)}
          />
        </div>
      )}
    </div>
  );
}
