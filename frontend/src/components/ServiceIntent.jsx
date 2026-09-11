import React, { useState } from "react";
import {
  ArrowRight,
  Sparkles,
  AlertCircle,
  Building2,
  User,
  Info,
  HelpCircle,
} from "lucide-react";
import { getTranslation } from "../services/i18n.js";
import VoiceInputButton from "./VoiceInputButton.jsx";
import IntentConfirmationCard from "./IntentConfirmationCard.jsx";
import { parseServiceIntent } from "../services/intentParser.js";

export default function ServiceIntent({
  onSubmitIntent,
  initialText = "",
  currentLang = "en",
}) {
  const [inputText, setInputText] = useState(initialText);
  const [customerType, setCustomerType] = useState("Household"); // Household | Institution
  const [errorMsg, setErrorMsg] = useState("");
  const [activeIntent, setActiveIntent] = useState(null);

  const t = (key) => getTranslation(currentLang, key);

  const samplePrompts = [
    {
      text: "Bro my kitchen tap has been leaking since morning, can someone come today?",
      label: "English Casual",
    },
    {
      text: "Anna kitchen tap morning la irundhu leak aaguthu, innike plumber venum.",
      label: "Tanglish",
    },
    {
      text: "Bhai kitchen ka tap leak ho raha hai, aaj plumber chahiye.",
      label: "Hinglish",
    },
    {
      text: "அண்ணா, காலையில இருந்து கிச்சன் டேப் கசிகிறது, இன்னைக்கு யாராவது வர முடியுமா?",
      label: "Tamil",
    },
    {
      text: "भाई सुबह से किचन का नल लीक हो रहा है, आज कोई आ सकता है क्या?",
      label: "Hindi",
    },
  ];

  const quickCategories = [
    {
      key: "plumbing",
      name:
        currentLang === "ta"
          ? "குழாய் வேலை"
          : currentLang === "hi"
            ? "प्लंबिंग"
            : "Plumbing",
    },
    {
      key: "electrical",
      name:
        currentLang === "ta"
          ? "மின்சார வேலை"
          : currentLang === "hi"
            ? "इलेक्ट्रिकल"
            : "Electrical",
    },
    {
      key: "carpentry",
      name:
        currentLang === "ta"
          ? "தச்சர் வேலை"
          : currentLang === "hi"
            ? "बढ़ईगीरी"
            : "Carpentry",
    },
    {
      key: "painting",
      name:
        currentLang === "ta"
          ? "பெயிண்டிங்"
          : currentLang === "hi"
            ? "पेंटिंग"
            : "Painting",
    },
    {
      key: "cleaning",
      name:
        currentLang === "ta"
          ? "சுத்தம் செய்தல்"
          : currentLang === "hi"
            ? "सफाई"
            : "Cleaning",
    },
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
    setInputText(transcript);
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
    setInputText(promptText);
    setErrorMsg("");
    const parsed = parseServiceIntent(promptText);
    parsed.customerType = customerType;
    setActiveIntent(parsed);
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
    <div className="service-intent-box">
      <div className="intent-header">
        <div className="intent-top-meta">
          <div className="intent-eyebrow">
            <Sparkles size={14} className="sparkle-icon" />
            <span>{t("intentEyebrow")}</span>
          </div>

          {/* Household vs Institution Request Type Switcher */}
          <div className="type-toggle-group">
            <button
              type="button"
              className={`type-btn ${customerType === "Household" ? "active" : ""}`}
              onClick={() => setCustomerType("Household")}
            >
              <User size={13} /> {t("household")}
            </button>
            <button
              type="button"
              className={`type-btn ${customerType === "Institution" ? "active" : ""}`}
              onClick={() => setCustomerType("Institution")}
            >
              <Building2 size={13} /> {t("institution")}
            </button>
          </div>
        </div>

        <h3 className="intent-title">{t("intentTitle")}</h3>
        <p className="intent-sub">{t("intentSub")}</p>

        {customerType === "Institution" && (
          <div className="institution-notice-box">
            <Info size={14} />
            <span>{t("institutionNotice")}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="intent-form">
        <div className="textarea-wrapper">
          <textarea
            className="intent-input"
            rows={3}
            placeholder={t("inputPlaceholder")}
            value={inputText}
            onChange={(e) => handleTextChange(e.target.value)}
          />

          <div className="input-action-bar">
            <VoiceInputButton
              currentLang={currentLang}
              onSpeechTranscribed={handleSpeechTranscribed}
            />

            <button type="submit" className="intent-submit-btn">
              <span>{t("findRightWorkerBtn")}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="intent-error">
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>

      {/* Low Confidence / Ambiguous Clarification Prompt */}
      {activeIntent && activeIntent.confidence < 0.75 && (
        <div
          className="low-confidence-clarification-box"
          style={{
            background: "#FFF7ED",
            border: "1px solid #FFEDD5",
            padding: "14px 18px",
            borderRadius: "12px",
            margin: "16px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
              color: "#C2410C",
            }}
          >
            <HelpCircle size={16} />
            <strong style={{ fontSize: "0.9rem" }}>
              What type of service do you need help with?
            </strong>
          </div>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#64748B",
              margin: "0 0 10px 0",
            }}
          >
            Select a service category to clarify your request:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {quickCategories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                className="preset-chip"
                onClick={() => handleClarificationChoice(cat.key)}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #F97316",
                  color: "#C2410C",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "12.5px",
                }}
              >
                + {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Explainable Intent Confirmation Card */}
      {activeIntent && activeIntent.confidence >= 0.7 && (
        <IntentConfirmationCard
          intent={activeIntent}
          currentLang={currentLang}
          onConfirmIntent={() =>
            onSubmitIntent(inputText, customerType, activeIntent)
          }
          onUpdateIntent={(updated) => setActiveIntent(updated)}
        />
      )}

      {/* Preset Prompts Chips */}
      <div className="intent-chips">
        <span className="chips-label">{t("tryExamples")}</span>
        <div className="chips-grid">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="intent-chip-btn"
              onClick={() => handleChipClick(p.text)}
            >
              <span className="chip-text">"{p.text}"</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
