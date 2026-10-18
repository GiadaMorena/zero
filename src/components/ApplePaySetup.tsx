"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

export function ApplePaySetup() {
  const { cards } = useApp();
  const [cardId, setCardId] = useState("");
  const [status, setStatus] = useState("");
  const template = `https://zero-henna-one.vercel.app/#zero-pay?currency=EUR&cardId=${encodeURIComponent(cardId)}&amount=[IMPORTO]&merchant=[ESERCENTE_CODIFICATO]&date=[DATA]&ref=[UUID]`;
  return <details className="rounded-[24px] border border-black/10 bg-white p-5 text-[#121212]">
    <summary className="cursor-pointer text-sm font-bold">Apple Pay → registra una spesa</summary>
    <div className="mt-4 space-y-4 text-sm leading-relaxed select-text">
      <p>Dopo un pagamento con Apple Pay, Comandi Rapidi può chiederti se vuoi registrarlo su ZERO. Confermi, accedi e scegli la categoria. Nessuna spesa viene salvata automaticamente.</p>
      <p className="rounded-xl bg-[#FFF8D5] p-3">Da configurare una volta sul tuo iPhone. Funziona per i pagamenti in euro con le carte selezionate in Wallet, non con la carta fisica.</p>
      <label className="block font-bold">Carta da associare in ZERO<select value={cardId} onChange={event => { setCardId(event.target.value); setStatus(""); }} className="mt-2 w-full rounded-xl border border-black/15 bg-white p-3"><option value="">Scegli la carta</option>{cards.map(card => <option key={card.id} value={card.id}>{card.bankName} · {card.number}</option>)}</select></label>
      {!cards.length && <p>Aggiungi prima una carta in ZERO.</p>}
      <ol className="list-decimal space-y-3 pl-5">
        <li>Apri <strong>Comandi Rapidi → Automazione → + → Transazione</strong>. Scegli la stessa carta di Wallet e l’esecuzione immediata.</li>
        <li>Recupera <strong>Importo</strong> ed <strong>Esercente</strong> dall’input dell’automazione. Usa l’importo numerico senza simbolo € e senza separatore delle migliaia. Codifica solo il nome dell’esercente con l’azione <strong>Codifica URL</strong>.</li>
        <li>Aggiungi la data corrente, formattata <strong>yyyy-MM-dd</strong>, e l’azione <strong>Genera UUID</strong>: un identificativo diverso per ogni pagamento.</li>
        <li>Aggiungi <strong>Mostra avviso</strong> con “Vuoi registrare questa spesa su ZERO?” e il pulsante Annulla. Potrebbe essere necessario sbloccare il telefono per confermare.</li>
        <li>Aggiungi un’azione <strong>Testo</strong> con il collegamento qui sotto. Sostituisci ogni segnaposto tra parentesi quadre con la relativa variabile dei passaggi precedenti. Infine aggiungi <strong>Apri URL</strong> usando questo testo.</li>
      </ol>
      {cardId && <><textarea readOnly aria-label="Modello collegamento Comandi Rapidi" value={template} className="h-32 w-full break-all rounded-xl border border-black/15 bg-[#F7F7F5] p-3 font-mono text-xs" /><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(template); setStatus("Modello copiato. Sostituisci i segnaposto con le variabili in Comandi Rapidi."); } catch { setStatus("Seleziona e copia il testo del collegamento."); } }} className="rounded-full bg-[#FDC909] px-5 py-3 font-bold">Copia modello</button></>}
      {status && <p role="status">{status}</p>}
      <p>Per un’altra carta crea un’automazione con il suo collegamento. Il link può aprirsi in Safari: resta necessario il normale accesso a ZERO e il PIN. Se annulli, la spesa non viene aggiunta.</p>
      <a href="https://support.apple.com/it-it/guide/shortcuts/apd65c67538a/ios" target="_blank" rel="noreferrer" className="inline-block font-bold underline">Guida Apple alle automazioni delle transazioni</a>
    </div>
  </details>;
}
