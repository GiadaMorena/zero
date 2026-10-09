import { receiptFields } from "./receiptFields";
import { receiptContrast } from "./receiptImage";
import { receiptDateFromWords } from "./receiptDate";

export async function readReceipt(
  image: string,
  signal: AbortSignal,
  progress: (percent: number) => void,
) {
  const abortError = () => new DOMException("Lettura annullata", "AbortError");
  let worker: import("tesseract.js").Worker | undefined;
  let cancelled = false;
  let rejectCancel: (reason: unknown) => void = () => {};
  const cancellation = new Promise<never>((_, reject) => {
    rejectCancel = reject;
  });
  const cancel = () => {
    cancelled = true;
    rejectCancel(abortError());
    void worker?.terminate();
  };
  signal.addEventListener("abort", cancel, { once: true });
  const timeout = setTimeout(cancel, 90000);
  const work = async () => {
    if (signal.aborted) throw abortError();
    const { createWorker } = await import("tesseract.js");
    if (cancelled || signal.aborted) throw abortError();
    // Every engine/model asset is served by ZERO. No receipt image is uploaded.
    worker = await createWorker("ita", 1, {
      workerPath: "/ocr/v6/worker.min.js",
      corePath: "/ocr/v6",
      langPath: "/ocr/v6",
      gzip: false,
      workerBlobURL: false,
      cachePath: "zero-ita-best-v1",
      logger: (message) => {
        if (!cancelled)
          progress(
            message.status === "recognizing text"
              ? Math.round(20 + message.progress * 70)
              : Math.round(message.progress * 18),
          );
      },
    });
    if (cancelled || signal.aborted) {
      await worker.terminate();
      throw abortError();
    }
    const source = new Image();
    source.src = image;
    await source.decode();
    if (cancelled || signal.aborted) throw abortError();
    const scale = Math.min(
      1,
      1500 / source.width,
      Math.sqrt(3200000 / (source.width * source.height)),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(source.width * scale));
    canvas.height = Math.max(1, Math.round(source.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Immagine non disponibile");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    receiptContrast(pixels.data, canvas.width, canvas.height);
    context.putImageData(pixels, 0, 0);
    await worker.setParameters({
      tessedit_pageseg_mode: "11" as import("tesseract.js").PSM,
      user_defined_dpi: "300",
    });
    const { data } = await worker.recognize(
      canvas,
      {},
      { text: true, blocks: true },
    );
    if (cancelled || signal.aborted) throw abortError();
    const fields = receiptFields(data.confidence >= 45 ? data.text : "");
    let text = data.text;
    if (!fields.date && data.blocks) {
      const lines = data.blocks.flatMap((block) =>
        block.paragraphs.flatMap((paragraph) => paragraph.lines),
      );
      fields.date = receiptDateFromWords(lines.flatMap((line) => line.words));
      const dateLines = lines
        .filter((line) => /\b(?:19|20)\d{2}\b/.test(line.text))
        .slice(0, 2);
      for (const line of dateLines) {
        if (fields.date) break;
        if (cancelled || signal.aborted) throw abortError();
        const box =
          line.words.find((word) => /\b(?:19|20)\d{2}\b/.test(word.text))
            ?.bbox || line.bbox;
        const height = Math.max(16, box.y1 - box.y0),
          top = Math.max(0, Math.floor(box.y0 - height * 0.3)),
          bottom = Math.min(canvas.height, Math.ceil(box.y1 + height * 0.3));
        const wordWidth = box.x1 - box.x0,
          left = Math.max(0, Math.floor(box.x0 - wordWidth)),
          right = Math.min(canvas.width, Math.ceil(box.x1 + wordWidth * 0.2));
        const band = document.createElement("canvas");
        band.width = right - left;
        band.height = bottom - top;
        const bandContext = band.getContext("2d");
        if (!bandContext) continue;
        bandContext.fillStyle = "#fff";
        bandContext.fillRect(0, 0, band.width, band.height);
        bandContext.drawImage(
          canvas,
          left,
          top,
          right - left,
          bottom - top,
          0,
          0,
          band.width,
          band.height,
        );
        await worker.setParameters({
          tessedit_pageseg_mode: "7" as import("tesseract.js").PSM,
          tessedit_char_whitelist: "0123456789/.-: ",
        });
        const refined = await worker.recognize(band, { rotateAuto: true });
        text += "\n" + refined.data.text;
        const parsed = receiptFields(refined.data.text);
        if (
          refined.data.confidence >= 45 &&
          parsed.date &&
          line.text.includes(parsed.date.slice(0, 4))
        ) {
          fields.date = parsed.date;
          break;
        }
      }
    }
    progress(100);
    return { fields, text, confidence: data.confidence };
  };
  try {
    return await Promise.race([work(), cancellation]);
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", cancel);
    if (worker && !cancelled) await worker.terminate();
  }
}
