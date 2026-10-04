"use client";

import Image from "next/image";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Logo from "@/assets/logo.png";
import styles from "./WelcomeScreen.module.css";

interface WelcomeScreenProps {
  onLogin?: () => void;
  onRegister?: () => void;
  onStart?: () => void;
}

export function WelcomeScreen({ onLogin, onRegister, onStart }: WelcomeScreenProps) {
  const [progress, setProgress] = useState(0);
  const [opening, setOpening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openingRef = useRef(false);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const enter = () => {
    if (openingRef.current) return;
    openingRef.current = true;
    setProgress(100);
    setOpening(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => { (onLogin ?? onStart)?.(); }, reducedMotion ? 0 : 600);
  };
  const finishSlide = () => { if (progress >= 90) enter(); else setProgress(0); };

  return (
    <main className={`${styles.screen} ${opening ? styles.opening : ""}`}>
      <div className={styles.layout}>
        <header className={styles.header}>
          <div className={styles.brand}><Image src={Logo} alt="" width={20} height={30} /><span>ZERO</span></div>
          <span className={styles.edition}>FINANZE, SENZA CAOS.</span>
        </header>

        <section className={styles.hero} aria-labelledby="welcome-title">
          <div className={styles.art} aria-hidden="true">
            <div className={styles.disc}><div className={styles.core}><Image src={Logo} alt="" width={58} height={88} /></div></div>
            <div className={styles.satellite}><Sparkles size={18} /></div>
            <span className={styles.artLabel}>MENO CAOS. PIÙ SPAZIO.</span>
          </div>
          <p className={styles.eyebrow}>IL TUO NUOVO PUNTO DI PARTENZA</p>
          <h1 id="welcome-title">Fai spazio.<br /><span>Vivi a ZERO.</span></h1>
          <p className={styles.description}>Le tue finanze, finalmente dalla tua parte.</p>
        </section>

        <div className={styles.actions}>
          <div className={styles.slider} style={{ "--progress": progress / 100 } as CSSProperties}>
            <span className={styles.slideLabel} aria-hidden="true">{opening ? "Si parte." : "Scorri per iniziare"}</span>
            <span className={styles.handle} aria-hidden="true">{opening ? <Sparkles size={21} /> : <ArrowRight size={23} />}</span>
            <input type="range" min="0" max="100" value={progress} disabled={opening} aria-label="Scorri per aprire l’accesso a ZERO" onChange={(event) => { const value = Number(event.target.value); setProgress(value); if (value >= 98) enter(); }} onPointerUp={finishSlide} onPointerCancel={() => setProgress(0)} onKeyUp={finishSlide} className={styles.range} />
          </div>
          <div className={styles.links}><button type="button" disabled={opening} onClick={enter}>Accedi <ArrowRight size={14} aria-hidden="true" /></button><span /><button type="button" disabled={opening} onClick={onRegister ?? onStart}>Crea un account</button></div>
          <p className={styles.footer}><LockKeyhole size={12} aria-hidden="true" />Il tuo spazio personale.</p>
          <span className={styles.srOnly} role="status">{opening ? "Apertura della schermata di accesso" : ""}</span>
        </div>
      </div>
    </main>
  );
}

export default WelcomeScreen;

