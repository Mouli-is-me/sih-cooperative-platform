import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Shield,
  Users,
  Sparkles,
  Building2,
  UserCheck,
  Globe,
  Menu,
  X,
  Server,
} from "lucide-react";
import { getTranslation } from "../services/i18n.js";

export default function Navbar({ currentLang, onChangeLang }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = (key) => getTranslation(currentLang, key);

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand">
          <div className="logo-badge">
            <Shield className="logo-icon" size={22} />
          </div>
          <div className="logo-text">
            <span className="brand-title">CO-OP OS</span>
            <span className="brand-subtitle">{t("brandSubtitle")}</span>
          </div>
        </Link>

        {/* Primary Navigation Links */}
        <nav className={`navbar-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <Link
            to="/"
            className={`nav-item ${currentPath === "/" || currentPath === "/find" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Sparkles size={15} />
            <span>{t("findWorkerNav")}</span>
          </Link>

          <Link
            to="/customer"
            className={`nav-item ${currentPath === "/customer" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Users size={15} />
            <span>{t("customerPortalNav")}</span>
          </Link>

          <Link
            to="/worker"
            className={`nav-item ${currentPath === "/worker" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <UserCheck size={15} />
            <span>{t("workerPortalNav")}</span>
          </Link>

          <Link
            to="/cooperative"
            className={`nav-item ${currentPath === "/cooperative" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Building2 size={15} />
            <span>{t("coopPulseNav")}</span>
          </Link>

          <Link
            to="/backend"
            className={`nav-item ${currentPath === "/backend" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Server size={15} />
            <span>Backend Ops</span>
          </Link>
        </nav>

        {/* Action Buttons & 3-Language Selector */}
        <div className="navbar-actions">
          <div className="nav-lang-picker">
            <Globe size={14} />
            <button
              className={`lang-sub-btn ${currentLang === "en" ? "active" : ""}`}
              onClick={() => onChangeLang("en")}
            >
              EN
            </button>
            <button
              className={`lang-sub-btn ${currentLang === "ta" ? "active" : ""}`}
              onClick={() => onChangeLang("ta")}
            >
              தமிழ்
            </button>
            <button
              className={`lang-sub-btn ${currentLang === "hi" ? "active" : ""}`}
              onClick={() => onChangeLang("hi")}
            >
              हिन्दी
            </button>
          </div>

          <Link to="/login" className="btn-primary-sm">
            Sign in
          </Link>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
