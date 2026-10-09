"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  X,
  Camera,
  CheckCircle2,
  Loader2,
  ImagePlus,
  AlertCircle,
  RotateCcw,
  Scan,
  ChevronDown,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { parseTransactionAmount } from "@/lib/quickTransaction";

type ScanStep =
  | "idle"       // mostra viewfinder (con camera o placeholder)
  | "acquiring"  // shutter flash
  | "confirm"    // dati estratti modificabili
  | "saving"     // breve spinner salvataggio
  | "success";   // feedback ✓

interface ReceiptScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "Cibo",
  "Trasporti",
  "Shopping",
  "Casa",
  "Salute",
  "Svago",
  "Tecnologia",
  "Altro",
];

const todayIT = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
};

/* ─────────────────────────────────────────────────────────── */

export function ReceiptScanModal({ isOpen, onClose }: ReceiptScanModalProps) {
  const { addTransaction, activeCard } = useApp();

  const [step, setStep]               = useState<ScanStep>("idle");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError]   = useState<"denied" | "unavailable" | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const savingRef = useRef(false);
  const openRef = useRef(isOpen);
  const cameraRequest = useRef(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  openRef.current = isOpen;

  // Receipt fields entered by the user
  const [title,    setTitle]    = useState("");
  const [amount,   setAmount]   = useState("");
  const [category, setCategory] = useState("Cibo");
  const [date,     setDate]     = useState(todayIT());

  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── cleanup stream on unmount / close ─────────────────── */
  const stopStream = useCallback(() => {
    cameraRequest.current++;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => () => {
    cameraRequest.current++;
    streamRef.current?.getTracks().forEach(track => track.stop());
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopStream();
      resetFlow();
    }
  }, [isOpen, stopStream]);

  const resetFlow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setError("");
    setStep("idle");
    setCameraError(null);
    setCapturedImage(null);
    setTitle("");
    setAmount("");
    setCategory("Cibo");
    setDate(todayIT());
  };

  const handleClose = () => {
    if (savingRef.current) return;
    openRef.current = false;
    stopStream();
    resetFlow();
    onClose();
  };

  /* ── Start camera ──────────────────────────────────────── */
  const startCamera = useCallback(async () => {
    if (!openRef.current || streamRef.current) return;
    const request = ++cameraRequest.current;
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (!openRef.current || request !== cameraRequest.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      if (!openRef.current || request !== cameraRequest.current) return;
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setCameraActive(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("denied");
      } else {
        setCameraError("unavailable");
      }
    }
  }, []);

  /* ── Capture frame from camera ─────────────────────────── */
  const captureFromCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopStream();
    setError("");
    setStep("confirm");
  };

  /* ── Load from file input ───────────────────────────────── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 15 * 1024 * 1024) {
      setError("Scegli un’immagine di dimensioni inferiori a 15 MB."); return;
    }
    const request = ++cameraRequest.current;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (!openRef.current || request !== cameraRequest.current) return;
      setCapturedImage(ev.target?.result as string);
      stopStream();
      setError("");
      setStep("confirm");
    };
    reader.onerror = () => { if (openRef.current) setError("Non riesco ad aprire questa immagine. Prova un’altra foto."); };
    reader.readAsDataURL(file);
  };

  /* ── Save transaction ───────────────────────────────────── */
  const handleSave = async () => {
    if (savingRef.current) return;
    const num = parseTransactionAmount(amount);
    const receiptDate = new Date(`${date}T12:00:00`);
    if (!title.trim() || num === null || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(receiptDate.getTime()) || `${receiptDate.getFullYear()}-${String(receiptDate.getMonth()+1).padStart(2,"0")}-${String(receiptDate.getDate()).padStart(2,"0")}` !== date) {
      setError("Inserisci l’esercente, una data valida e un importo maggiore di zero con al massimo due decimali."); return;
    }
    savingRef.current = true;
    setError("");
    setStep("saving");
    try {
      const result = await addTransaction({
        title: title.trim(),
        category,
        amount: num,
        type: "expense",
        date: date || todayIT(),
        cardId: activeCard?.id || "",
        note: capturedImage ? "Inserito manualmente da foto scontrino" : "Inserito manualmente",
      });
      if (result.error) { setError(result.error); setStep("confirm"); return; }
      setStep("success");
      closeTimer.current = setTimeout(() => {
        handleClose();
      }, 2200);
    } catch { setError("Salvataggio non riuscito. I dati inseriti sono ancora qui."); setStep("confirm"); }
    finally { savingRef.current = false; }
  };

  if (!isOpen) return null;

  const money = (v: string) => {
    const n = parseFloat(v.replace(",", ".")) || 0;
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
  };

  /* ═══════════════════════════════════════════════════════ */
  return (
    <div role="dialog" aria-modal="true" aria-label="Foto scontrino" data-app-update-block className="fixed inset-0 z-50 flex flex-col bg-[#0B0B0B]"
         style={{ paddingTop: "env(safe-area-inset-top, 44px)", paddingBottom: "env(safe-area-inset-bottom, 20px)" }}>

      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── TOP BAR ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-2 pb-3 shrink-0">
        <button
          onClick={handleClose}
          aria-label="Chiudi scontrino"
          disabled={step === "saving"}
          className="h-9 w-9 rounded-full bg-[#F7F7F5] flex items-center justify-center hover:bg-[#A7A7A7] transition-colors"
        >
          <X className="h-4 w-4 text-[#0B0B0B]" />
        </button>
        <h2 className="text-sm font-black text-white tracking-tight">
          {step === "confirm" ? "Controlla la spesa" :
           step === "success" ? "Spesa salvata" :
           "Foto scontrino"}
        </h2>
        <div className="w-9" />
      </div>

      {/* ── INFO BANNER: FUNZIONALITÀ IN SVILUPPO ──────────────── */}
      <div className="mx-5 mb-3 bg-[#FDC909]/15 border border-[#FDC909]/40 rounded-2xl p-3 flex items-start gap-2.5 shrink-0">
        <AlertCircle className="h-4 w-4 text-[#FDC909] shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-black text-[#FDC909] leading-tight">
            Compila i dati dalla foto
          </p>
          <p className="text-[11px] text-[#A7A7A7] font-medium mt-0.5 leading-snug">
            La lettura automatica non è ancora disponibile. La foto resta su questo dispositivo: inserisci esercente, importo e data prima di salvare.
          </p>
        </div>
      </div>
      {error && <p role="alert" className="mx-5 mb-3 text-xs text-red-300">{error}</p>}

      {/* ══ STEP: IDLE / CAMERA VIEWFINDER ════════════════════ */}
      {(step === "idle" || step === "acquiring") && (
        <div className="flex-1 min-h-0 flex flex-col gap-4 px-5 overflow-hidden">

          {/* Viewfinder */}
          <div className="relative flex-1 rounded-[28px] overflow-hidden bg-[#0B0B0B] border border-[#A7A7A7]">

            {/* Live camera feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${cameraActive ? "opacity-100" : "opacity-0"}`}
            />

            {/* Placeholder when camera not yet active */}
            {!cameraActive && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
                <Scan className="h-10 w-10 text-[#FDC909] animate-pulse" />
                <p className="text-xs text-[#A7A7A7] font-medium leading-snug">
                  Scatta una foto o carica uno scontrino dalla galleria.
                </p>
              </div>
            )}

            {/* Camera error: denied */}
            {cameraError === "denied" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
                <AlertCircle className="h-10 w-10 text-[#FDC909]" />
                <p className="text-sm font-black text-white">Fotocamera non disponibile</p>
                <p className="text-xs text-[#A7A7A7] font-medium leading-snug">
                  Non è stato possibile accedere alla fotocamera. Puoi caricare uno scontrino dalla galleria.
                </p>
              </div>
            )}

            {/* Camera error: unavailable */}
            {cameraError === "unavailable" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
                <AlertCircle className="h-10 w-10 text-[#FDC909]" />
                <p className="text-sm font-black text-white">Fotocamera non supportata</p>
                <p className="text-xs text-[#A7A7A7] font-medium leading-snug">
                  Questo browser non supporta la fotocamera. Carica un'immagine dalla galleria.
                </p>
              </div>
            )}

            {/* Target frame overlay (shown when camera active) */}
            {cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[75%] h-[55%] relative">
                  {/* Corners */}
                  {[["top-0 left-0","border-t-2 border-l-2 rounded-tl-xl"],
                    ["top-0 right-0","border-t-2 border-r-2 rounded-tr-xl"],
                    ["bottom-0 left-0","border-b-2 border-l-2 rounded-bl-xl"],
                    ["bottom-0 right-0","border-b-2 border-r-2 rounded-br-xl"]].map(([pos, cls], i) => (
                    <div key={i} className={`absolute ${pos} h-8 w-8 border-[#FDC909] ${cls}`} />
                  ))}
                  {/* Scan line */}
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-[#FDC909] animate-pulse" />
                </div>
                <p className="absolute bottom-6 left-0 right-0 text-center text-[11px] text-white font-medium">
                  Inquadra lo scontrino nel riquadro
                </p>
              </div>
            )}

            {/* Acquiring flash */}
            {step === "acquiring" && (
              <div className="absolute inset-0 bg-white animate-ping" style={{ animationDuration: "0.3s", animationIterationCount: 1 }} />
            )}

            {/* Captured image preview */}
            {capturedImage && step === "acquiring" && (
              <img src={capturedImage} alt="scontrino" className="absolute inset-0 w-full h-full object-cover" />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 shrink-0 pb-2">
            {/* Main action: capture or start */}
            {cameraActive ? (
              <button
                onClick={captureFromCamera}
                className="w-full py-4 rounded-full bg-[#FDC909] text-[#0B0B0B] font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Camera className="h-5 w-5 stroke-[2.5]" />
                <span>Scatta foto</span>
              </button>
            ) : !cameraError ? (
              <button
                onClick={startCamera}
                className="w-full py-4 rounded-full bg-[#FDC909] text-[#0B0B0B] font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Camera className="h-5 w-5 stroke-[2.5]" />
                <span>Apri fotocamera</span>
              </button>
            ) : null}

            {/* Gallery fallback */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 rounded-full bg-[#F7F7F5] text-[#0B0B0B] font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <ImagePlus className="h-4.5 w-4.5 stroke-[2.5]" />
              <span>Carica dalla galleria</span>
            </button>
            <button type="button" onClick={() => { stopStream(); setError(""); setStep("confirm"); }} className="py-2 text-xs font-bold text-white underline underline-offset-4">Compila senza foto</button>
          </div>
        </div>
      )}

      {/* ══ STEP: CONFIRM ═════════════════════════════════════ */}
      {step === "confirm" && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Success banner */}
          <div className="mx-5 mb-4 shrink-0">
            <div className="flex items-center gap-2 bg-[#FDC909] text-[#0B0B0B] p-3 rounded-2xl text-xs font-bold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{capturedImage ? "Foto pronta — inserisci i dati e salva" : "Inserisci i dati della spesa"}</span>
            </div>
          </div>

          {/* Captured image thumbnail */}
          {capturedImage && (
            <div className="mx-5 mb-3 shrink-0">
              <div className="h-20 rounded-2xl overflow-hidden border border-[#A7A7A7]">
                <img src={capturedImage} alt="scontrino" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Editable fields */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-2 no-scrollbar">
            <div className="bg-[#F7F7F5] rounded-[24px] p-4 flex flex-col gap-4">

              {/* Esercente */}
              <div>
                <label htmlFor="receipt-title" className="block text-[10px] font-extrabold text-[#A7A7A7] uppercase tracking-widest mb-1.5">
                  Esercente
                </label>
                <input
                  id="receipt-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm font-black text-[#0B0B0B] bg-white border border-[#A7A7A7] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FDC909]"
                />
              </div>

              {/* Importo + Categoria */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="receipt-amount" className="block text-[10px] font-extrabold text-[#A7A7A7] uppercase tracking-widest mb-1.5">
                    Importo (€)
                  </label>
                  <input
                    id="receipt-amount"
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputMode="decimal"
                    className="w-full text-sm font-black text-[#0B0B0B] bg-white border border-[#A7A7A7] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FDC909]"
                  />
                </div>
                <div>
                  <label htmlFor="receipt-category" className="block text-[10px] font-extrabold text-[#A7A7A7] uppercase tracking-widest mb-1.5">
                    Categoria
                  </label>
                  <div className="relative">
                    <select
                      id="receipt-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none text-xs font-bold text-[#0B0B0B] bg-white border border-[#A7A7A7] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FDC909] pr-7"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A7A7A7] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Data */}
              <div>
                <label htmlFor="receipt-date" className="block text-[10px] font-extrabold text-[#A7A7A7] uppercase tracking-widest mb-1.5">
                  Data
                </label>
                <input
                  id="receipt-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onInput={(e) => setDate(e.currentTarget.value)}
                  className="w-full text-xs font-bold text-[#0B0B0B] bg-white border border-[#A7A7A7] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FDC909]"
                />
              </div>

              {/* Carta */}
              <div className="flex items-center justify-between bg-white border border-[#A7A7A7] rounded-xl px-3 py-2.5">
                <span className="text-[10px] font-extrabold text-[#A7A7A7] uppercase tracking-widest">Carta</span>
                <span className="text-xs font-bold text-[#0B0B0B]">
                  {activeCard ? `${activeCard.bankName} ${activeCard.number}` : "Nessuna carta"}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-5 pt-3 pb-2 flex flex-col gap-2.5 shrink-0">
            <button
              onClick={handleSave}
              className="w-full py-4 rounded-full bg-[#FDC909] text-[#0B0B0B] font-black text-sm active:scale-95 transition-all"
            >
              Salva spesa
            </button>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => { stopStream(); resetFlow(); }}
                className="py-3 rounded-full bg-[#F7F7F5] text-[#0B0B0B] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all border border-[#A7A7A7]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Cambia foto
              </button>
              <button
                onClick={handleClose}
                className="py-3 rounded-full bg-[#F7F7F5] text-[#A7A7A7] font-bold text-xs active:scale-95 transition-all border border-[#A7A7A7]"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ STEP: SAVING ══════════════════════════════════════ */}
      {step === "saving" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
          <div className="h-16 w-16 rounded-full bg-[#FDC909] flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-[#0B0B0B] animate-spin" />
          </div>
          <p className="text-sm font-extrabold text-white">Salvataggio in corso…</p>
        </div>
      )}

      {/* ══ STEP: SUCCESS ═════════════════════════════════════ */}
      {step === "success" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-8">
          <div className="h-20 w-20 rounded-full bg-[#FDC909] flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-[#0B0B0B] stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Spesa aggiunta</h3>
            <p className="text-sm text-[#FDC909] font-bold mt-1">
              {money(amount)} · {title}
            </p>
            <p className="text-xs text-[#A7A7A7] font-medium mt-2">
              La transazione è visibile in tutti i movimenti.
            </p>
          </div>
          {/* Auto-close progress bar */}
          <div className="w-40 h-1 rounded-full bg-[#A7A7A7] overflow-hidden mt-2">
            <div
              className="h-full bg-[#FDC909] rounded-full"
              style={{ animation: "grow-bar 2.2s linear forwards" }}
            />
          </div>
          <style>{`
            @keyframes grow-bar {
              from { width: 0% }
              to   { width: 100% }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

