import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Shield,
  Users,
  Search,
  Building2,
  UserCheck,
  Menu,
  X,
  Server,
  LogOut,
  LogIn,
} from "lucide-react";
import { getTranslation } from "../services/i18n.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar({ currentLang, onChangeLang }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const t = (key) => getTranslation(currentLang, key);

  const NavItem = ({ to, icon: Icon, children }) => {
    const isActive =
      currentPath === to || (to === "/" && currentPath === "/find");
    return (
      <Link
        to={to}
        onClick={() => setMobileMenuOpen(false)}
        className={`nav-item ${isActive ? "active" : ""}`}
      >
        <Icon size={16} />
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="Co-op OS home">
          <span className="logo-badge">
            <Shield size={20} strokeWidth={2.4} />
          </span>
          <span className="brand-copy">
            <span className="brand-title">CO-OP OS</span>
            <span className="brand-subtitle">
              Local services, fairly matched
            </span>
          </span>
        </Link>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav
          className={`navbar-links ${mobileMenuOpen ? "mobile-nav-open" : ""}`}
          aria-label="Primary navigation"
        >
          <NavItem to="/" icon={Search}>
            {t("findWorkerNav")}
          </NavItem>

          {isAuthenticated &&
            (user?.role === "customer" || user?.role === "platform_admin") && (
              <NavItem to="/customer" icon={Users}>
                {t("customerPortalNav")}
              </NavItem>
            )}

          {isAuthenticated &&
            (user?.role === "worker" ||
              user?.role === "cooperative_member" ||
              user?.role === "platform_admin") && (
              <NavItem to="/worker" icon={UserCheck}>
                {t("workerPortalNav")}
              </NavItem>
            )}

          {isAuthenticated &&
            (user?.role === "cooperative_admin" ||
              user?.role === "platform_admin") && (
              <NavItem to="/cooperative" icon={Building2}>
                {t("coopPulseNav")}
              </NavItem>
            )}

          {isAuthenticated && user?.role === "platform_admin" && (
            <NavItem to="/backend" icon={Server}>
              Backend Ops
            </NavItem>
          )}
        </nav>

        <div className="navbar-actions">
          <div className="nav-lang-picker" aria-label="Language">
            {["en", "ta", "hi"].map((lang) => (
              <button
                key={lang}
                onClick={() => onChangeLang(lang)}
                className={`lang-sub-btn ${currentLang === lang ? "active" : ""}`}
                aria-pressed={currentLang === lang}
              >
                {lang}
              </button>
            ))}
          </div>

          {isAuthenticated ? (
            <button
              className="btn-secondary-sm nav-auth-btn"
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
            >
              <LogOut size={16} /> <span>Sign out</span>
            </button>
          ) : (
            <Link
              to="/signin"
              className="btn-primary-sm nav-auth-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              <LogIn size={16} /> <span>Sign in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
