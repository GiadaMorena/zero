"use client";
import { useEffect, useRef, useState } from "react";
export function SaveFeedback({ hidden = false }: { hidden?: boolean }) {
  const [notice, setNotice] = useState<{ title: string; sequence: number } | null>(null);
  const sequence = useRef(0);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const listener = (event: Event) => {
      const title = (event as CustomEvent<{ title?: string }>).detail?.title;
      if (!title) return;
      clearTimeout(timer);
      setNotice({ title, sequence: ++sequence.current });
      timer = setTimeout(() => setNotice(null), 3000);
    };
    window.addEventListener("zero-saved", listener);
    return () => { window.removeEventListener("zero-saved", listener); clearTimeout(timer); };
  }, []);
  return !notice || hidden ? null : <div key={notice.sequence} role="status" aria-live="polite" className="zero-save-feedback fixed left-1/2 bottom-[calc(env(safe-area-inset-bottom,0px)+7rem)] z-[60] flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 rounded-full bg-[#0B0B0B] py-3 pl-3 pr-5 text-white shadow-lg pointer-events-none">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDC909]"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-[#0B0B0B]" fill="none"><path className="zero-save-check" d="m5 12 4 4 10-10" pathLength="1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
    <span className="text-xs font-bold">{notice.title}</span>
  </div>;
}
