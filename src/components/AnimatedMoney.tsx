"use client";
import { useEffect, useRef, useState } from "react";
const money = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
export function AnimatedMoney({ value }: { value: number }) {
  const target = Number.isFinite(value) ? value : 0;
  const [shown, setShown] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const from = current.current;
    let frame = 0;
    let start: number | undefined;
    const finish = () => { cancelAnimationFrame(frame); current.current = target; setShown(target); };
    if (preference.matches || from === target) { finish(); return; }
    const tick = (now: number) => {
      start ??= now;
      const progress = Math.min(1, (now - start) / 420);
      current.current = from + (target - from) * (1 - Math.pow(1 - progress, 3));
      setShown(current.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    const onPreference = () => { if (preference.matches) finish(); };
    preference.addEventListener("change", onPreference);
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); preference.removeEventListener("change", onPreference); };
  }, [target]);
  return <span style={{ fontVariantNumeric: "tabular-nums" }}><span aria-hidden="true">{money.format(shown)}</span><span className="sr-only">{money.format(target)}</span></span>;
}
