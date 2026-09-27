"use client";

import React from "react";
import "./ZeroHome.css";

interface WelcomeScreenProps {
  onLogin?: () => void;
  onRegister?: () => void;
  onStart?: () => void;
}

export function WelcomeScreen({ onLogin, onRegister, onStart }: WelcomeScreenProps) {
  const handleLoginClick = () => {
    if (onLogin) onLogin();
    else if (onStart) onStart();
  };

  const handleRegisterClick = () => {
    if (onRegister) onRegister();
    else if (onStart) onStart();
  };

  return (
    <main className="zero-home">
      <div className="zero-statusbar" aria-hidden="true">
        <span>9:41</span>
        <div className="zero-status-icons">
          <span className="signal">▮▮▮</span>
          <span className="wifi">⌁</span>
          <span className="battery"><i /></span>
        </div>
      </div>

      <svg className="zero-line-art" viewBox="0 0 828 1792" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M290 390
             C335 255 505 115 720 125
             C805 130 805 210 770 270
             C725 345 610 430 500 505
             L375 590
             C430 530 490 475 555 430
             C630 378 690 315 735 245
             C765 198 760 160 720 150"
        />
        <path
          d="M275 1080
             C220 1165 180 1260 205 1385
             C230 1505 355 1570 505 1570
             C625 1570 730 1515 805 1440"
        />
      </svg>

      <section className="zero-copy">
        <div className="zero-logo" aria-label="ZERO">
          <span className="z">Z</span>
          <span className="e">E</span>
          <span className="r">R</span>
          <span className="o">O</span>
        </div>

        <p className="zero-tagline">
          ZERO ANSIA<br />
          DA FINE MESE.
        </p>
      </section>

      <div className="zero-card-stack" aria-hidden="true">
        <div className="zero-card zero-card-white" />
        <div className="zero-card zero-card-yellow" />
        <div className="zero-card zero-card-black">
          <div className="card-logo">ZERO</div>
          <div className="card-chip">
            <span />
            <span />
            <span />
          </div>
          <div className="card-number"><b>••••</b><b>••••</b><b>3377</b></div>
          <div className="card-expiry">09/29</div>
          <div className="card-mark">Z</div>
        </div>
      </div>

      <div className="zero-actions">
        <button
          onClick={handleLoginClick}
          className="zero-button zero-primary"
          type="button"
        >
          <span>Accedi</span><span className="arrow">→</span>
        </button>
        <button
          onClick={handleRegisterClick}
          className="zero-button zero-secondary"
          type="button"
        >
          <span>Registrati</span><span className="arrow">→</span>
        </button>
      </div>

      <div className="zero-home-indicator" aria-hidden="true" />
    </main>
  );
}

export default WelcomeScreen;
