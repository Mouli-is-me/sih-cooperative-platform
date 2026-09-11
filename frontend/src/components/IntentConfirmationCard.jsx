import React, { useState } from "react";
import { CheckCircle2, Edit3, Sparkles, MapPin, Clock } from "lucide-react";
import {
  TAXONOMY,
  getLocalizedCategoryName,
  getLocalizedTaskName,
} from "../services/intentEngine/taxonomy.js";

export default function IntentConfirmationCard({
  intent,
  currentLang = "en",
  onConfirmIntent,
  onUpdateIntent,
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (!intent) return null;

  const categoryKey = (intent.categoryKey || "plumbing").toLowerCase();
  const catUpper = categoryKey.toUpperCase();
  const activeTaskKey = intent.task || "TAP_REPAIR";

  const localizedCatName = getLocalizedCategoryName(categoryKey, currentLang);
  const localizedTaskName = getLocalizedTaskName(
    categoryKey,
    activeTaskKey,
    currentLang,
  );

  const localizedHeader =
    currentLang === "ta"
      ? "CO-OP OS புரிந்துகொண்டது:"
      : currentLang === "hi"
        ? "CO-OP OS ने समझा:"
        : "CO-OP OS UNDERSTANDS:";

  const localizedYouSaid =
    currentLang === "ta"
      ? "நீங்கள் கூறியது:"
      : currentLang === "hi"
        ? "आपने कहा:"
        : "YOU SAID:";

  const localizedConfirmBtn =
    currentLang === "ta"
      ? "சரி, பணியாளரைக் கண்டறிக →"
      : currentLang === "hi"
        ? "सही है, वर्कर खोजें →"
        : "Looks right → Find a worker";

  const availableCategories = Object.keys(TAXONOMY).map((key) => ({
    id: key.toLowerCase(),
    name: getLocalizedCategoryName(key.toLowerCase(), currentLang),
  }));

  const activeCategoryTaxonomy = TAXONOMY[catUpper] || TAXONOMY.PLUMBING;
  const availableTasks = Object.keys(activeCategoryTaxonomy.tasks).map(
    (tKey) => ({
      id: tKey,
      name: getLocalizedTaskName(categoryKey, tKey, currentLang),
    }),
  );

  const handleCategoryChange = (newCatKey) => {
    const catUpperNew = newCatKey.toUpperCase();
    const newTax = TAXONOMY[catUpperNew] || TAXONOMY.PLUMBING;
    const defaultTaskKey = Object.keys(newTax.tasks)[0];

    onUpdateIntent({
      ...intent,
      categoryKey: newCatKey.toLowerCase(),
      serviceCategory: newCatKey.toUpperCase(),
      task: defaultTaskKey,
      taskDetail: getLocalizedTaskName(
        newCatKey.toLowerCase(),
        defaultTaskKey,
        currentLang,
      ),
    });
  };

  const handleTaskChange = (newTaskKey) => {
    onUpdateIntent({
      ...intent,
      task: newTaskKey,
      taskDetail: getLocalizedTaskName(categoryKey, newTaskKey, currentLang),
    });
  };

  return (
    <div className="intent-confirmation-card">
      <div className="confirmation-header">
        <div className="conf-title-group">
          <Sparkles size={16} className="text-green" />
          <span className="conf-eyebrow">NATURAL INTENT INTERPRETATION</span>
        </div>

        <span className="lang-detected-badge">
          Detected: {intent.detectedLabel || "English"}
        </span>
      </div>

      {/* YOU SAID Row */}
      <div className="you-said-box">
        <span className="box-lbl">{localizedYouSaid}</span>
        <p className="original-speech-quote">
          "{intent.originalText || intent.rawText}"
        </p>
      </div>

      {/* CO-OP OS UNDERSTANDS Card */}
      <div className="system-understands-box">
        <div className="understands-top">
          <span className="understands-title">{localizedHeader}</span>
          <button
            className="btn-edit-intent"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 size={13} /> {isEditing ? "Done Editing" : "Edit Intent"}
          </button>
        </div>

        <div className="intent-summary-grid">
          <div className="summary-pill main-service">
            <span className="pill-lbl">SERVICE CATEGORY</span>
            <strong className="pill-val">{localizedCatName}</strong>
          </div>

          <div className="summary-pill main-task">
            <span className="pill-lbl">SPECIFIC TASK</span>
            <strong className="pill-val">{localizedTaskName}</strong>
          </div>

          <div className="summary-pill">
            <span className="pill-lbl">LOCATION</span>
            <span className="pill-val-sm">
              <MapPin size={12} /> {intent.location || "Kitchen"}
            </span>
          </div>

          <div className="summary-pill">
            <span className="pill-lbl">TIMING</span>
            <span className="pill-val-sm">
              <Clock size={12} /> {intent.preferredTime || "Today"}
            </span>
          </div>
        </div>

        {/* User Intent Override Panel when Editing */}
        {isEditing && (
          <div className="intent-edit-panel">
            <span className="edit-panel-title">Correct Extracted Intent:</span>
            <div className="edit-controls-row">
              <div className="edit-field">
                <label>Category:</label>
                <select
                  value={categoryKey}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="intent-select"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-field">
                <label>Task:</label>
                <select
                  value={activeTaskKey}
                  onChange={(e) => handleTaskChange(e.target.value)}
                  className="intent-select"
                >
                  {availableTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Action Bar */}
      <div className="confirmation-actions">
        <span className="confidence-indicator">
          Confidence:{" "}
          <strong>{Math.round((intent.confidence || 0.85) * 100)}%</strong>
        </span>

        <button className="btn-confirm-intent" onClick={onConfirmIntent}>
          <CheckCircle2 size={16} />
          <span>{localizedConfirmBtn}</span>
        </button>
      </div>
    </div>
  );
}
