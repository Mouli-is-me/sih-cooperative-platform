import React, { useState } from "react";
import WorkerMatchCard from "../components/WorkerMatchCard.jsx";
import FairMatchExplanation from "../components/FairMatchExplanation.jsx";
import OpportunityBalance from "../components/OpportunityBalance.jsx";
import TraditionalVsFairMatch from "../components/TraditionalVsFairMatch.jsx";
import WhyNotHighestRatedModal from "../components/WhyNotHighestRatedModal.jsx";
import {
  ArrowLeft,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getTranslation } from "../services/i18n.js";

export default function FairMatchResultsPage({
  intent,
  matches,
  onBack,
  onRequestWorker,
  onViewProfile,
  currentLang = "en",
}) {
  const [showExplanation, setShowExplanation] = useState(false); // Progressive disclosure: default collapsed for clean UI
  const t = (key) => getTranslation(currentLang, key);

  if (!intent || !matches || matches.length === 0) return null;

  const topFairMatchWorker = matches[0];
  const highestRatedWorker = [...matches].sort(
    (a, b) => b.rating - a.rating,
  )[0];

  return (
    <div className="results-page-view">
      <div className="results-container">
        {/* Navigation back */}
        <button className="back-link-btn" onClick={onBack}>
          <ArrowLeft size={16} /> ←{" "}
          {t("inputPlaceholder") ? "Edit Service Request" : "Back"}
        </button>

        {/* Results Header */}
        <div className="results-header-banner">
          <div className="results-title-col">
            <div className="intent-badge-row">
              <span className="intent-service-chip">
                {intent.serviceCategory.toUpperCase()}
              </span>
              <span className="intent-urgency-chip">{intent.urgencyBadge}</span>
              <span className="intent-type-chip">
                {intent.customerType || "Household"}
              </span>
            </div>

            <h1 className="results-main-title">
              {t("resultsTitle")} ({matches.length})
            </h1>
            <p className="results-query-desc">
              Task: <strong>{intent.taskDetail}</strong> • {t("resultsSub")}
            </p>
          </div>

          <button
            className="toggle-explanation-btn"
            onClick={() => setShowExplanation(!showExplanation)}
          >
            <SlidersHorizontal size={15} />
            <span>
              {showExplanation
                ? "Hide Algorithm Weights"
                : "View FairMatch Weights"}
            </span>
          </button>
        </div>

        {/* Progressive Disclosure: Collapsible FairMatch Weights Explanation */}
        {showExplanation && (
          <div className="results-explanation-section">
            <FairMatchExplanation currentLang={currentLang} />
          </div>
        )}

        {/* Worker Candidates List (Primary Focus) */}
        <div className="matched-workers-section">
          <div className="workers-list-header">
            <h3>{t("resultsTitle").toUpperCase()}</h3>
            <span className="sorted-label">
              Sorted by FairMatch™ Suitability Index
            </span>
          </div>

          <div className="matched-cards-stack">
            {matches.map((worker, idx) => (
              <WorkerMatchCard
                key={worker.id}
                worker={worker}
                intent={intent}
                isBestMatch={idx === 0}
                onRequestWorker={onRequestWorker}
                onViewProfile={onViewProfile}
                currentLang={currentLang}
              />
            ))}
          </div>
        </div>

        {/* Secondary Progressive Information Panels */}
        <div className="results-section-mb" style={{ marginTop: "40px" }}>
          <TraditionalVsFairMatch intent={intent} currentLang={currentLang} />
        </div>

        <div className="results-section-mb">
          <WhyNotHighestRatedModal
            topFairMatchWorker={topFairMatchWorker}
            highestRatedWorker={highestRatedWorker}
            pool={matches}
            currentLang={currentLang}
          />
        </div>

        <div className="results-op-balance-section">
          <OpportunityBalance matches={matches} currentLang={currentLang} />
        </div>
      </div>
    </div>
  );
}
