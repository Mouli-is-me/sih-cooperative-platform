import React from "react";
import ServiceIntent from "../components/ServiceIntent.jsx";
import TraditionalVsFairMatch from "../components/TraditionalVsFairMatch.jsx";
import { SERVICES } from "../services/mockData.js";
import { getTranslation } from "../services/i18n.js";
import {
  ShieldCheck,
  Scale,
  Award,
  ArrowRight,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  HeartHandshake,
  Car,
  Sprout,
  Users,
  CheckCircle2,
  Building2,
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
      {/* SECTION 1 — HERO & INTENT ENTRY */}
      <section className="hero-section">
        <div className="hero-split-container">
          <div className="hero-left-col">
            <div className="hero-eyebrow">
              <ShieldCheck size={15} />
              <span>{t("heroEyebrow")}</span>
            </div>

            <h1 className="hero-title">
              {t("heroTitleLine1")}
              <br />
              <span className="text-primary">{t("heroTitleLine2")}</span>
              <br />
              {t("heroTitleLine3")}
            </h1>

            <p className="hero-subtitle">{t("heroSub")}</p>

            {/* Primary Action — Service Intent Box */}
            <ServiceIntent
              onSubmitIntent={onSubmitIntent}
              currentLang={currentLang}
            />
          </div>

          <div
            className="hero-trust-line"
            aria-label="CO-OP OS trust indicators"
          >
            <span>
              <ShieldCheck size={15} /> Verified cooperative workers
            </span>
            <span>
              <Scale size={15} /> Fair opportunity matching
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2 — QUICK SERVICE CATEGORIES */}
      <section className="services-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">{t("exploreTrades")}</span>
            <h2>{t("exploreTrades")}</h2>
            <p>
              Choose a common service or describe what you need in your own
              words.
            </p>
          </div>

          <div className="services-grid">
            {SERVICES.map((cat) => {
              const IconComp = iconMap[cat.icon] || Wrench;
              const localizedCatKey =
                cat.id === "driving"
                  ? "catDriver"
                  : `cat${cat.name.split(" ")[0]}`;
              const localizedName = t(localizedCatKey) || cat.name;

              return (
                <button
                  key={cat.id}
                  className="service-card-btn"
                  onClick={() => onSelectCategory(cat)}
                >
                  <div className="service-card-icon">
                    <IconComp size={24} />
                  </div>
                  <h4 className="service-card-title">{localizedName}</h4>
                  <p className="service-card-desc">{cat.desc}</p>
                  <span className="service-card-link">
                    {t("findRightWorkerBtn")} <ArrowRight size={14} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3 — HOW CO-OP OS WORKS */}
      <section className="philosophy-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">SIMPLE DISPATCH PROCESS</span>
            <h2>{t("howItWorksTitle")}</h2>
            <p>
              Direct digital connection between households and certified
              cooperative trade professionals.
            </p>
          </div>

          <div className="philosophy-cards-grid">
            <div className="philosophy-card">
              <div className="card-icon-box">
                <Sparkles size={24} />
              </div>
              <h3>{t("step1Title")}</h3>
              <p>{t("step1Desc")}</p>
            </div>

            <div className="philosophy-card">
              <div className="card-icon-box">
                <Scale size={24} />
              </div>
              <h3>{t("step2Title")}</h3>
              <p>{t("step2Desc")}</p>
            </div>

            <div className="philosophy-card">
              <div className="card-icon-box">
                <Award size={24} />
              </div>
              <h3>{t("step3Title")}</h3>
              <p>{t("step3Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — WHY FAIRMATCH */}
      <section className="closed-loop-section">
        <div className="section-container">
          <TraditionalVsFairMatch
            intent={{
              serviceCategory: "PLUMBING",
              urgencyBadge: "Immediate",
              taskDetail: "Tap repair",
            }}
            currentLang={currentLang}
          />
        </div>
      </section>

      {/* SECTION 5 — TRUST & COOPERATIVE IMPACT METRICS */}
      <section className="philosophy-section" style={{ background: "#FFFFFF" }}>
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">COMMUNITY IMPACT</span>
            <h2>Cooperative Federation Network</h2>
            <p>
              Empowering workers while delivering reliable skilled services
              across the region.
            </p>
          </div>

          <div className="pulse-metrics-grid">
            <div className="pulse-metric-card">
              <div className="pm-icon-wrap icon-green">
                <Users size={20} />
              </div>
              <div className="pm-meta">
                <span className="pm-val">147</span>
                <span className="pm-label">Active Verified Workers</span>
              </div>
            </div>

            <div className="pulse-metric-card">
              <div className="pm-icon-wrap icon-blue">
                <Wrench size={20} />
              </div>
              <div className="pm-meta">
                <span className="pm-val">8</span>
                <span className="pm-label">Skilled Service Trades</span>
              </div>
            </div>

            <div className="pulse-metric-card">
              <div className="pm-icon-wrap icon-sage">
                <CheckCircle2 size={20} />
              </div>
              <div className="pm-meta">
                <span className="pm-val">281</span>
                <span className="pm-label">Completed Jobs This Month</span>
              </div>
            </div>

            <div className="pulse-metric-card">
              <div className="pm-icon-wrap icon-amber">
                <Building2 size={20} />
              </div>
              <div className="pm-meta">
                <span className="pm-val">12</span>
                <span className="pm-label">Labour Cooperative Societies</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — FINAL SINGLE CTA */}
      <section className="cta-banner-section">
        <div className="cta-banner-container">
          <h2>Ready to connect with certified cooperative specialists?</h2>
          <p>
            Describe your issue today and experience fair cooperative service
            dispatch.
          </p>
          <button
            className="btn-hero-cta"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {t("findRightWorkerBtn")} ↑
          </button>
        </div>
      </section>
    </div>
  );
}
