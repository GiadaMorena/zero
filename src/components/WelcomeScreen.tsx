"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Logo from "@/assets/logo.png";
import styles from "./WelcomeScreen.module.css";

interface WelcomeScreenProps {
  onLogin?: () => void;
  onRegister?: () => void;
  onStart?: () => void;
}

export function WelcomeScreen({ onLogin, onRegister, onStart }: WelcomeScreenProps) {
  return (
    <main className={styles.screen}>
      <div className={styles.layout}>
        <header className={styles.brand}>
          <Image src={Logo} alt="" width={24} height={36} className={styles.mark} />
          <span>ZERO</span>
        </header>

        <section className={styles.intro} aria-labelledby="welcome-title">
          <p className={styles.eyebrow}>IL TUO SPAZIO, PER I TUOI SOLDI.</p>
          <h1 id="welcome-title">Le tue finanze.<br />Un po’ più<br /><span className={styles.highlight}>semplici.</span></h1>
          <p className={styles.description}>Spese, abbonamenti e obiettivi.<br />Tutto insieme, con chiarezza.</p>
          <div className={styles.features} aria-label="Carte, spese e obiettivi">
            <span>Carte</span><span>Spese</span><span>Obiettivi</span>
          </div>
        </section>

        <div className={styles.actions}>
          <button type="button" onClick={onLogin ?? onStart} className={styles.primary}>
            <span>Accedi</span><ArrowRight aria-hidden="true" size={21} />
          </button>
          <button type="button" onClick={onRegister ?? onStart} className={styles.secondary}>
            Crea un account
          </button>
          <p className={styles.footer}>Un passo alla volta, con ZERO.</p>
        </div>
      </div>
    </main>
  );
}

export default WelcomeScreen;
