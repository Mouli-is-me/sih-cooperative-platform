import React from "react";
import { Shield, Heart } from "lucide-react";

export default function Footer({ setActiveView }) {
  return (
    <footer className="footer-container">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <div className="footer-logo">
            <div className="logo-badge">
              <Shield size={18} />
            </div>
            <span className="brand-title">CO-OP OS</span>
          </div>
          <p className="footer-tagline">
            Technology should not replace the cooperative worker. Technology
            should make the cooperative worker more visible, accessible, and
            fairly utilized.
          </p>
          <span className="copyright-line">
            © 2026 CO-OP OS — Labour Cooperative Network.
          </span>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-col-title">Platform Views</h4>
          <button onClick={() => setActiveView("home")}>Find a Worker</button>
          <button onClick={() => setActiveView("home")}>How It Works</button>
          <button onClick={() => setActiveView("customer")}>
            Customer Request Portal
          </button>
          <button onClick={() => setActiveView("worker")}>
            Worker Skill Portal
          </button>
          <button onClick={() => setActiveView("cooperative")}>
            Cooperative Pulse Analytics
          </button>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-col-title">Core Innovations</h4>
          <span>FairMatch™ Intelligent Matching</span>
          <span>Opportunity Balance Index</span>
          <span>Digital Skill Passport</span>
          <span>Regional Workforce Gap Analysis</span>
        </div>
      </div>
    </footer>
  );
}
