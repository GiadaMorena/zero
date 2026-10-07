"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import Logo from "@/assets/logo.png";
import styles from "./WelcomeScreen.module.css";

type Demo = "Spese" | "Abbonamenti" | "Obiettivi";
interface WelcomeScreenProps { onLogin?: () => void; onRegister?: () => void; onStart?: () => void; }

function WalletArtwork({ open }: { open: boolean }) {
  const id = useId().replace(/:/g, "");
  return <svg viewBox="0 0 360 350" className={styles.walletSvg} aria-hidden="true">
    <defs>
      <linearGradient id={`${id}leather`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffe95c"/><stop offset=".5" stopColor="#fbd321"/><stop offset="1" stopColor="#e4b30a"/></linearGradient>
      <linearGradient id={`${id}edge`}><stop stopColor="#bd8d00"/><stop offset="1" stopColor="#f9d329"/></linearGradient>
      <filter id={`${id}grain`}><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".16"/></feComponentTransfer><feComposite operator="in" in2="SourceAlpha"/><feBlend in="SourceGraphic" mode="soft-light"/></filter>
      <filter id={`${id}shadow`} x="-40%" y="-30%" width="180%" height="180%"><feDropShadow dx="0" dy="12" stdDeviation="8" floodColor="#58410b" floodOpacity=".17"/></filter>
    </defs>
    <ellipse cx="187" cy="319" rx="119" ry="13" fill="#4d3b13" opacity=".09"/>
    <g filter={`url(#${id}shadow)`}>
      <path d="M60 127 Q59 106 86 102 L286 125 Q309 127 309 151 L309 282 Q306 304 283 299 L68 265 Z" fill={`url(#${id}edge)`}/>
      <path d="M68 126 Q67 111 86 111 L284 134 Q300 135 300 153 L300 281 Q298 294 283 290 L74 258 Z" fill="#b58d10"/>
      <g className={`${styles.receiptDark} ${open ? styles.receiptRaised : ""}`}>
        <path d="M207 35 Q212 28 216 36 L223 44 L230 39 L238 49 L245 44 L253 54 L260 49 L268 59 L275 54 L283 64 L290 60 L298 70 L279 189 L184 174 Z" fill="#282923" filter={`url(#${id}grain)`}/>
        <path d="M224 83 L273 97 M218 105 L253 115 M213 127 L241 135" stroke="#eeeadd" strokeWidth="7" strokeLinecap="round"/>
      </g>
      <g className={`${styles.receiptLight} ${open ? styles.receiptRaised : ""}`}>
        <path d="M82 77 L90 71 L99 76 L105 67 L114 72 L121 63 L131 68 L138 60 L148 64 L156 56 L166 60 L174 53 L202 193 L108 203 Z" fill="#f1eddf" filter={`url(#${id}grain)`}/>
        <path d="M112 108 L158 98 M119 130 L169 119 M126 152 L152 146" stroke="#34352d" strokeWidth="7" strokeLinecap="round"/>
      </g>
      <g className={`${styles.walletBack} ${open ? styles.backOpen : ""}`}>
        <path d="M205 149 L278 137 Q300 133 300 157 L300 280 Q299 296 284 290 L219 275 Z" fill={`url(#${id}leather)`} filter={`url(#${id}grain)`}/>
        <path d="M216 157 L278 147 Q289 146 290 160 L290 276 Q291 283 282 280" fill="none" stroke="#a78515" strokeWidth="1.5" strokeDasharray="4 5"/>
      </g>
      <g className={`${styles.walletFront} ${open ? styles.frontOpen : ""}`}>
        <path d="M61 123 Q70 130 91 133 L244 159 Q269 163 268 189 L268 306 Q268 328 247 325 L80 292 Q59 289 59 267 Z" fill={`url(#${id}leather)`} stroke="#edc126" strokeWidth="2" filter={`url(#${id}grain)`}/>
        <path d="M69 139 L239 169 Q257 172 257 192 L257 303 Q258 316 244 313 L82 282 Q69 280 69 266 Z" fill="none" stroke="#a7881c" strokeWidth="1.5" strokeDasharray="5 5"/>
        <path d="M72 143 L239 173 M81 280 L240 311" fill="none" stroke="#fff0a2" strokeWidth="1" strokeDasharray="5 5" opacity=".8"/>
      </g>
      <g className={`${styles.clasp} ${open ? styles.claspOpen : ""}`}>
        <path d="M311 207 L255 221 Q231 227 230 246 Q229 267 249 267 L310 253 Z" fill={`url(#${id}leather)`} stroke="#c9a10c" filter={`url(#${id}grain)`}/>
        <ellipse cx="250" cy="245" rx="12" ry="13" fill="#292b25" stroke="#121510" strokeWidth="2"/><ellipse cx="248" cy="242" rx="7" ry="8" fill="#44463b" opacity=".5"/>
      </g>
    </g>
  </svg>;
}

export function WelcomeScreen({ onLogin, onRegister, onStart }: WelcomeScreenProps) {
  const exploreId = useId();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [demo, setDemo] = useState<Demo | null>(null);
  const [closing, setClosing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walletButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const slider = useRef<HTMLDivElement>(null);
  const sliderHandle = useRef<HTMLButtonElement>(null);
  const [entering, setEntering] = useState(false);
  const gesture = useRef({ active: false, start: 0, progress: 0 });
  const setProgress = (value: number) => {
    gesture.current.progress = Math.max(0, Math.min(1, value));
    walletButton.current?.style.setProperty("--pull", String(Math.max(0, (gesture.current.progress - .45) / .55)));
    slider.current?.style.setProperty("--slide", String(gesture.current.progress));
  };
  const finishGesture = (cancelled = false) => {
    if (!gesture.current.active) return;
    gesture.current.active = false;
    walletButton.current?.removeAttribute("data-dragging");
    slider.current?.removeAttribute("data-dragging");
    const completed = !cancelled && gesture.current.progress >= .9;
    if (completed) enter(); else setProgress(0);
  };
  const enter = () => {
    if (entering) return;
    if (timer.current) clearTimeout(timer.current);
    setEntering(true);
    setProgress(1);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => (onLogin ?? onStart)?.(), reduce ? 0 : 550);
  };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { if (demo) closeButton.current?.focus(); }, [demo]);
  const close = () => {
    if (closing) return;
    setClosing(true); setOpen(false);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => { setDemo(null); setClosing(false); walletButton.current?.focus(); }, reduce ? 0 : 420);
  };
  return <main className={styles.screen}>
    <div className={styles.layout}>
      <header className={styles.header}><div className={styles.brand}><Image src={Logo} alt="" width={25} height={34}/><span>ZERO</span></div></header>
      <section className={styles.hero} aria-labelledby={titleId}>
        <div className={`${styles.art} ${open ? styles.expanded : ""}`}>
          <button ref={walletButton} className={styles.walletButton} type="button" aria-label="Esplora il portafoglio ZERO" aria-expanded={open} aria-controls={open && !demo ? exploreId : undefined} disabled={closing || entering} onClick={() => { if (open) close(); else setOpen(true); }}><WalletArtwork open={open}/></button>
          {open && !demo && <div id={exploreId} className={styles.choices} aria-label="Esplora le funzionalità">{(["Spese", "Abbonamenti", "Obiettivi"] as Demo[]).map(label => <button key={label} type="button" onClick={() => setDemo(label)}>{label}</button>)}<button className={styles.closeChoices} onClick={close} aria-label="Chiudi il portafoglio">×</button></div>}
          {demo && <section className={`${styles.preview} ${closing ? styles.previewClosing : ""}`} role="region" aria-label={`Anteprima ${demo}`} onKeyDown={e => {if(e.key === "Escape") close();}}>
            <button ref={closeButton} className={styles.close} onClick={close} disabled={closing} aria-label="Chiudi anteprima">×</button>
            <p className={styles.sample}>Dati di esempio</p>
            <h2>{demo}</h2>
            {demo === "Spese" && <div className={styles.demoReceipt}><span>Caffè</span><strong>3,50 €</strong><div className={styles.receiptLines}/></div>}
            {demo === "Abbonamenti" && <div className={styles.demoSubscription}><strong>Spotify · 10,99 €/mese</strong><p>Prossima scadenza: 15 ottobre</p></div>}
            {demo === "Obiettivi" && <div className={styles.demoGoal}><strong>Fondo emergenze</strong><p>100 € su 500 €</p><div role="progressbar" aria-label="Fondo emergenze" aria-valuemin={0} aria-valuemax={500} aria-valuenow={100} className={styles.progress}><span/></div><small>20%</small></div>}
          </section>}
        </div>
        <div className={styles.copy}><h1 id={titleId}>Meno caos.<br/>Più controllo.</h1><p className={styles.description}>Dai un posto a ogni spesa.</p></div>
      </section>
      <footer className={styles.actions}>
        <div ref={slider} className={styles.slideTrack} aria-busy={entering}>
          <span className={styles.slideLabel}>{entering ? "Il tuo portafoglio si apre" : "Scorri per accedere"}</span>
          <button ref={sliderHandle} type="button" className={styles.slideHandle} aria-label="Scorri verso destra per accedere, oppure premi Invio" disabled={entering}
            onPointerDown={e => { if (entering || !e.isPrimary || e.button !== 0) return; setOpen(false); setDemo(null); gesture.current = {active:true,start:e.clientX,progress:0}; e.currentTarget.setPointerCapture(e.pointerId); slider.current?.setAttribute("data-dragging", "true"); walletButton.current?.setAttribute("data-dragging", "true"); }}
            onPointerMove={e => { if (!gesture.current.active) return; const travel = (slider.current?.clientWidth ?? 300) - e.currentTarget.offsetWidth - 16; setProgress((e.clientX - gesture.current.start) / Math.max(1, travel)); if (gesture.current.progress >= .98) finishGesture(); }}
            onPointerUp={e => { finishGesture(); if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }}
            onPointerCancel={() => finishGesture(true)} onLostPointerCapture={() => finishGesture(true)}
            onClick={e => { if (e.detail === 0) enter(); }} onKeyDown={e => { if (e.key === "ArrowRight") { e.preventDefault(); enter(); } }}>→</button>
        </div>
        <p>Non hai ancora un account? <button type="button" className={styles.login} disabled={entering} onClick={onRegister ?? onStart}>Crea un account</button></p>
      </footer>
    </div>
  </main>;
}
export default WelcomeScreen;



