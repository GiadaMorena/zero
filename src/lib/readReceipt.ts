import { receiptFields } from "./receiptFields";

export async function readReceipt(image: string, signal: AbortSignal, progress: (percent: number) => void) {
  const abortError = () => new DOMException("Lettura annullata", "AbortError");
  let worker: import("tesseract.js").Worker | undefined;
  let cancelled = false;
  let rejectCancel: (reason: unknown) => void = () => {};
  const cancellation = new Promise<never>((_, reject) => { rejectCancel = reject; });
  const cancel = () => { cancelled = true; rejectCancel(abortError()); void worker?.terminate(); };
  signal.addEventListener("abort", cancel, { once: true });
  const timeout = setTimeout(cancel, 90000);
  const work = async () => {
    if (signal.aborted) throw abortError();
    const { createWorker } = await import("tesseract.js");
    if (cancelled || signal.aborted) throw abortError();
    // Every engine/model asset is served by ZERO. No receipt image is uploaded.
    worker = await createWorker("ita", 1, {
      workerPath: "/ocr/v7/worker.min.js", corePath: "/ocr/v7", langPath: "/ocr/v7",
      gzip: false, workerBlobURL: false, cachePath: "zero-ita-fast-v1",
      logger: message => { if (!cancelled) progress(message.status === "recognizing text" ? Math.round(20 + message.progress * 80) : Math.round(message.progress * 18)); },
    });
    if (cancelled || signal.aborted) { await worker.terminate(); throw abortError(); }
    const source = new Image(); source.src = image; await source.decode();
    if (cancelled || signal.aborted) throw abortError();
    const scale = Math.min(1, 2200 / Math.max(source.width, source.height), Math.sqrt(4000000 / (source.width * source.height)));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1,Math.round(source.width * scale)); canvas.height = Math.max(1,Math.round(source.height * scale));
    const context = canvas.getContext("2d"); if (!context) throw new Error("Immagine non disponibile");
    context.fillStyle = "#fff"; context.fillRect(0,0,canvas.width,canvas.height); context.drawImage(source,0,0,canvas.width,canvas.height);
    const { data } = await worker.recognize(canvas);
    if (cancelled || signal.aborted) throw abortError();
    const fields = receiptFields(data.confidence >= 45 ? data.text : "");
    return { fields, text: data.text, confidence: data.confidence };
  };
  try { return await Promise.race([work(), cancellation]); }
  finally { clearTimeout(timeout); signal.removeEventListener("abort",cancel); if (worker && !cancelled) await worker.terminate(); }
}
