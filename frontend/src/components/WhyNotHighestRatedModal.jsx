import React, { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldCheck,
  Scale,
} from "lucide-react";
import { whyNotHighestRated } from "../services/matching.js";
import { getTranslation } from "../services/i18n.js";

export default function WhyNotHighestRatedModal({
  topFairMatchWorker,
  highestRatedWorker,
  pool,
  currentLang,
}) {
  const t = (key) => getTranslation(currentLang, key);
  const [isOpen, setIsOpen] = useState(false);

  const explanation = whyNotHighestRated(topFairMatchWorker, pool);
  if (!explanation) return null;

  return (
    <div className="why-not-highest-card">
      <button
        className="why-not-toggle-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="header-left">
          <HelpCircle size={18} className="help-icon" />
          <span className="header-title">
            {t("whyNotTitle")} ({explanation.highestRatedName}{" "}
            {explanation.highestRatedScore})
          </span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="why-not-content-body">
          <div className="worker-compare-strip">
            <div className="compare-box box-selected">
              <span className="box-tag">{t("recommendedBadge")}</span>
              <h4 className="box-name">{explanation.selectedName}</h4>
              <span className="box-score">
                {t("fairMatchScoreLabel")}: {explanation.selectedScore}
              </span>
              <span className="box-detail">
                Low recent opportunity concentration • 96% Skill Fit
              </span>
            </div>

            <div className="compare-box box-deprioritized">
              <span className="box-tag tag-amber">
                {t("highestRatedPassedOver")}
              </span>
              <h4 className="box-name">{explanation.highestRatedName}</h4>
              <span className="box-score">
                Rating: {explanation.highestRatedScore}
              </span>
              <span className="box-detail">
                89% Busy Workload • 9 jobs in last 7 days
              </span>
            </div>
          </div>

          <div className="reasons-bullet-list">
            <span className="list-heading">{t("explainabilityRationale")}</span>
            <ul>
              {explanation.reasons.map((reason, idx) => (
                <li key={idx}>
                  <Scale size={14} className="bullet-icon" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
