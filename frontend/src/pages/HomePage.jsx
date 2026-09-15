import React from "react";
import ServiceIntent from "../components/ServiceIntent.jsx";
import { SERVICES } from "../services/mockData.js";
import { getTranslation } from "../services/i18n.js";
import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  HeartHandshake,
  Car,
  Sprout,
  ShieldCheck,
  ClipboardCheck,
  UserRound,
  CheckCircle2,
} from "lucide-react";

export default function HomePage({
  onSubmitIntent,
  onSelectCategory,
  currentLang = "en",
}) {
  const iconMap = {
    Wrench,
    Zap,
    Hammer,
    Paintbrush,
    Sparkles,
    HeartHandshake,
    Car,
    Sprout,
  };

  const t = (key) => getTranslation(currentLang, key);

  return (
    <div className="home-page-view">
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <span className="eyebrow">
              <ShieldCheck size={15} /> Cooperative service network
            </span>
            <h1>Trusted help for the work that keeps home moving.</h1>
            <p>
              Tell us what needs fixing in your own words. We connect you with a
              verified local worker through your cooperative network.
            </p>
            <div className="hero-trust-list">
              <span>
                <CheckCircle2 size={16} /> Verified workers
              </span>
              <span>
                <CheckCircle2 size={16} /> Fair opportunity
              </span>
              <span>
                <CheckCircle2 size={16} /> Local response
              </span>
            </div>
          </div>
          <div className="home-request-panel">
            <div className="request-panel-heading">
              <div>
                <span className="panel-kicker">Start a request</span>
                <h2>What can we help with?</h2>
              </div>
              <span className="panel-step">1 of 3</span>
            </div>
            <ServiceIntent
              onSubmitIntent={onSubmitIntent}
              currentLang={currentLang}
            />
          </div>
        </div>
      </section>

      <section className="workflow-strip" aria-label="How a request works">
        <div className="workflow-step">
          <span className="workflow-icon">
            <ClipboardCheck size={18} />
          </span>
          <span>
            <strong>Describe</strong>
            <small>Use everyday language</small>
          </span>
        </div>
        <span className="workflow-rule" />
        <div className="workflow-step">
          <span className="workflow-icon">
            <UserRound size={18} />
          </span>
          <span>
            <strong>Get matched</strong>
            <small>Based on fit and fairness</small>
          </span>
        </div>
        <span className="workflow-rule" />
        <div className="workflow-step">
          <span className="workflow-icon">
            <CheckCircle2 size={18} />
          </span>
          <span>
            <strong>Track progress</strong>
            <small>From request to completion</small>
          </span>
        </div>
      </section>

      <section className="home-services section-container">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">Services near you</span>
            <h2>Choose a starting point</h2>
          </div>
          <p>Or describe any service above and we will identify it for you.</p>
        </div>
        <div className="service-category-grid">
          {SERVICES.map((cat) => {
            const IconComp = iconMap[cat.icon] || Wrench;
            const localizedCatKey =
              cat.id === "driving"
                ? "catDriver"
                : `cat${cat.name.split(" ")[0]}`;
            return (
              <button
                key={cat.id}
                className="service-category"
                onClick={() => onSelectCategory(cat)}
              >
                <span className="service-icon">
                  <IconComp size={20} />
                </span>
                <span className="service-category-copy">
                  <strong>{t(localizedCatKey) || cat.name}</strong>
                  <small>{cat.desc}</small>
                </span>
                <span className="service-arrow" aria-hidden="true">
                  &#8594;
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
