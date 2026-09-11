import React from "react";
import { ArrowRight, RefreshCw, FileText, Cpu, UserCheck, Star, ShieldCheck, BarChart2 } from "lucide-react";
import { getTranslation } from "../services/i18n.js";

export default function ClosedLoopDiagram({ currentLang }) {
  const t = (key) => getTranslation(currentLang, key);

  const steps = [
    { title: t("step1TitleLoop"), icon: FileText, desc: t("step1DescLoop") },
    { title: t("step2TitleLoop"), icon: Cpu, desc: t("step2DescLoop") },
    { title: t("step3TitleLoop"), icon: UserCheck, desc: t("step3DescLoop") },
    { title: t("step4TitleLoop"), icon: Star, desc: t("step4DescLoop") },
    { title: t("step5TitleLoop"), icon: ShieldCheck, desc: t("step5DescLoop") },
    { title: t("step6TitleLoop"), icon: BarChart2, desc: t("step6DescLoop") },
  ];

  return (
    <div className="closed-loop-container">
      <div className="loop-header">
        <div className="loop-eyebrow">
          <RefreshCw size={14} className="spin-slow" />
          <span>{t("selfReinforcingSystem")}</span>
        </div>
        <h3 className="loop-title">{t("closedLoopTitle")}</h3>
        <p className="loop-sub">{t("closedLoopSub")}</p>
      </div>

      <div className="loop-flow-grid">
        {steps.map((s, idx) => {
          const IconComp = s.icon;
          return (
            <React.Fragment key={idx}>
              <div className="loop-node-card">
                <div className="node-icon-box">
                  <IconComp size={20} />
                </div>
                <span className="node-step-num">STEP 0{idx + 1}</span>
                <h4 className="node-title">{s.title}</h4>
                <p className="node-desc">{s.desc}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="loop-arrow-col">
                  <ArrowRight size={18} className="loop-arrow" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

