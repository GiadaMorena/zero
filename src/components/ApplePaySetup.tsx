"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

export function ApplePaySetup() {
  const { cards } = useApp();
  const [cardId, setCardId] = useState("");
  const [status, setStatus] = useState("");
  const template = `https://zero-henna-one.vercel.app/#zero-pay?currency=EUR&cardId=${encodeURIComponent(cardId)}&amount=[IMPORTO]&merchant=[ESERCENTE_CODIFICATO]&date=[DATA]&ref=[ID_PAGAMENTO]`;
  const selectedCard = cards.find(card => card.id === cardId);
  const preview = () => {
    if (!selectedCard) return;
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    const params = new URLSearchParams({currency:"EUR",cardId:selectedCard.id,amount:"1.00",merchant:"Pagamento di prova",date,ref:crypto.randomUUID(),preview:"1"});
    window.location.hash = `zero-pay?${params.toString()}`;
  };
  return <details className="rounded-[24px] border border-black/10 bg-white p-5 text-[#121212]">
    <summary className="cursor-pointer text-sm font-bold">Apple Pay → apertura automatica</summary>
    <div className="mt-4 space-y-5 text-sm leading-relaxed select-text">
      <p>Dopo il pagamento al POS, l’automazione dell’iPhone apre ZERO con importo, esercente e carta già compilati. Scegli la categoria e conferma il salvataggio.</p>
      <p className="rounded-xl bg-[#FFF8D5] p-3">Da completare e verificare in Comandi Rapidi sul tuo iPhone. ZERO non può attivare l’automazione al posto tuo.</p>
      <label className="block font-bold">Carta usata con Apple Pay<select value={cardId} onChange={event => {setCardId(event.target.value);setStatus("");}} className="mt-2 w-full rounded-xl border border-black/15 bg-white p-3"><option value="">Scegli la stessa carta di Wallet</option>{cards.map(card => <option key={card.id} value={card.id}>{card.bankName} · {card.number}</option>)}</select></label>
      {!cards.length && <p>Aggiungi prima la carta in ZERO.</p>}
      <section className="rounded-2xl bg-[#F7F7F5] p-4" aria-label="Prova del modulo Apple Pay">
        <h3 className="font-bold">1. Prova il modulo ZERO</h3>
        <p className="mt-1 text-xs text-[#666]">Apre una spesa dimostrativa da 1 € con la carta scelta. Il salvataggio è bloccato: non modifica movimenti o saldo. Questa prova verifica il modulo, non il rilevamento del pagamento.</p>
        <button type="button" disabled={!selectedCard} onClick={preview} className="mt-3 rounded-full bg-[#FDC909] px-5 py-3 text-xs font-bold disabled:opacity-40">Prova senza salvare</button>
      </section>
      <section aria-label="Configurazione apertura automatica">
        <h3 className="mb-3 font-bold">2. Completa l’automazione esistente</h3>
        <ol className="list-decimal space-y-3 pl-5">
          <li>Apri <strong>Comandi Rapidi → Automazione</strong> e seleziona quella della tua carta. Attiva l’automazione e scegli <strong>Esegui immediatamente</strong>, se compare. Lascia qualsiasi esercente e categoria per includere tutti i pagamenti della carta.</li>
          <li>Per l’apertura diretta, rimuovi l’eventuale azione <strong>Mostra avviso</strong> “Vuoi registrare questa spesa?”. La conferma finale resterà nel modulo ZERO.</li>
          <li>Recupera <strong>Importo</strong> ed <strong>Esercente</strong> dall’input Transazione. Usa l’importo numerico senza € e passa l’esercente all’azione <strong>Codifica URL</strong>.</li>
          <li>Aggiungi <strong>Data attuale</strong> una sola volta. Usa due azioni <strong>Formatta data → Personalizzato</strong> sulla stessa data: <strong>yyyy-MM-dd</strong> per DATA e <strong>yyyyMMddHHmmssSSS</strong> per ID_PAGAMENTO. Il secondo formato identifica il pagamento fino ai millisecondi: non serve cercare “Genera UUID”. Un UUID già configurato continua a funzionare.</li>
          <li>Nel blocco <strong>Testo</strong> usa il collegamento qui sotto, sostituendo i quattro segnaposto con le relative <strong>variabili di Comandi Rapidi</strong>.</li>
          <li>L’ultima azione deve aprire il collegamento: <strong>Apri URL</strong> usando il risultato del blocco Testo. Non usare “Ottieni contenuti dell’URL”.</li>
        </ol>
      </section>
      {selectedCard && <><label className="block text-xs font-bold">Collegamento per i pagamenti reali<textarea readOnly aria-label="Modello collegamento Comandi Rapidi" value={template} className="mt-2 h-36 w-full break-all rounded-xl border border-black/15 bg-[#F7F7F5] p-3 font-mono text-xs font-normal" /></label><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(template);setStatus("Modello copiato. Mantieni le variabili già configurate: le parole tra parentesi quadre non devono restare nel collegamento finale.");}catch{setStatus("Seleziona e copia il collegamento dal riquadro.");}}} className="rounded-full border border-black/15 px-5 py-3 text-xs font-bold">Copia modello</button></>}
      {status && <p role="status" className="text-xs">{status}</p>}
      <section className="border-t border-black/10 pt-4">
        <h3 className="font-bold">3. Verifica sul telefono</h3>
        <p className="mt-1 text-xs text-[#666]">Apri ZERO e completa l’accesso nello stesso browser scelto dall’azione. Safari, Chrome e l’icona Home possono avere sessioni separate. Il PIN resta richiesto secondo le impostazioni di sicurezza.</p>
        <p className="mt-2 text-xs text-[#666]">Con la versione web il link può aprirsi nel browser: l’apertura dell’icona Home non è garantita. Al prossimo pagamento reale con l’iPhone al POS, controlla che si apra il modulo con importo e carta corretti. Il semplice avvio manuale dell’automazione può non avere i dati della transazione.</p>
      </section>
      <a href="https://support.apple.com/it-it/guide/shortcuts/apd65c67538a/ios" target="_blank" rel="noreferrer" className="inline-block text-xs font-bold underline">Guida Apple alle automazioni delle transazioni</a>
    </div>
  </details>;
}
