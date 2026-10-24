"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";

const PAYMENT_URL = "https://zero-henna-one.vercel.app/api/wallet/payment";
type LinkedWallet = { cardId: string; expires: string };

async function accountHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw Error("Accedi di nuovo a ZERO per continuare.");
  return { authorization: `Bearer ${session.access_token}`, "content-type": "application/json" };
}

async function responseBody(response: Response): Promise<Record<string, unknown>> {
  const result: unknown = await response.json().catch(() => null);
  const body = result && typeof result === "object" && !Array.isArray(result)
    ? result as Record<string, unknown> : {};
  if (!response.ok) throw Error(typeof body.error === "string" ? body.error : "Operazione non riuscita. Riprova.");
  return body;
}

async function updatePushWorker(registration: ServiceWorkerRegistration) {
  await registration.update();
  const worker = registration.installing || registration.waiting;
  if (!worker || worker.state === "activated") return;
  await new Promise<void>((resolve, reject) => {
    const finish = (error?: Error) => {
      window.clearTimeout(timer);
      worker.removeEventListener("statechange", check);
      if (error) reject(error); else resolve();
    };
    const check = () => {
      if (worker.state === "activated") finish();
      else if (worker.state === "redundant") finish(Error("Aggiornamento delle notifiche non riuscito. Riprova."));
    };
    const timer = window.setTimeout(() => finish(Error("Aggiornamento delle notifiche in corso. Riprova tra pochi secondi.")), 10000);
    worker.addEventListener("statechange", check);
    check();
  });
}

export function ApplePaySetup() {
  const { cards } = useApp();
  const [cardId, setCardId] = useState("");
  const [status, setStatus] = useState("");
  const [readiness, setReadiness] = useState("Controllo disponibilità…");
  const [configured, setConfigured] = useState(false);
  const [endpoint, setEndpoint] = useState("");
  const [linked, setLinked] = useState<LinkedWallet | null>(null);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkVersion, setCheckVersion] = useState(0);
  const selectedCard = cards.find(card => card.id === cardId);
  const linkedCard = cards.find(card => card.id === linked?.cardId);
  const directTemplate = `https://zero-henna-one.vercel.app/#zero-pay?currency=EUR&cardId=${encodeURIComponent(cardId)}&amount=[IMPORTO]&merchant=[ESERCENTE_CODIFICATO]&date=[DATA]&ref=[ID_PAGAMENTO]`;

  useEffect(() => {
    let live = true;
    setChecking(true);
    setEndpoint("");
    void (async () => {
      try {
        const headers = await accountHeaders();
        const setup = await responseBody(await fetch("/api/wallet/setup", { cache: "no-store", headers }));
        if (!live) return;
        const ready = setup.configured === true;
        setConfigured(ready);
        const value = setup.linked;
        setLinked(value && typeof value === "object"
          && typeof (value as LinkedWallet).cardId === "string"
          && typeof (value as LinkedWallet).expires === "string"
          ? { cardId: (value as LinkedWallet).cardId, expires: (value as LinkedWallet).expires } : null);
        if (!ready) {
          setReadiness("Invio delle notifiche Apple Pay in attesa di configurazione sul server.");
          return;
        }
        if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
          setReadiness("Su iPhone apri ZERO dall’icona sulla schermata Home, poi attiva gli avvisi sul telefono.");
          return;
        }
        const registration = await navigator.serviceWorker.getRegistration("/");
        if (registration) await updatePushWorker(registration);
        const subscription = await registration?.pushManager.getSubscription();
        const push = await responseBody(await fetch("/api/push", { cache: "no-store", headers }));
        if (!live) return;
        const registered = subscription && Array.isArray(push.endpoints) && push.endpoints.includes(subscription.endpoint);
        if (!registered || Notification.permission !== "granted") {
          setReadiness("Attiva prima «Avvisi sul telefono» su questo dispositivo, poi premi «Controlla di nuovo» qui sotto.");
          return;
        }
        setEndpoint(subscription.endpoint);
        setReadiness("Questo dispositivo è pronto per la prova. L’automazione di Comandi Rapidi va ancora configurata e verificata.");
      } catch (error) {
        if (live) {
          setConfigured(false);
          setReadiness(error instanceof Error ? error.message : "Non riesco a verificare il collegamento. Riprova.");
        }
      } finally {
        if (live) setChecking(false);
      }
    })();
    return () => { live = false; };
  }, [checkVersion]);

  const copy = async (value: string, message: string) => {
    try { await navigator.clipboard.writeText(value); setStatus(message); }
    catch { setStatus("Seleziona e copia il testo dal riquadro."); }
  };

  const createLink = async () => {
    if (busy || !selectedCard || !endpoint || !configured) return;
    setBusy(true);
    setStatus("");
    setToken("");
    try {
      const headers = await accountHeaders();
      const body = await responseBody(await fetch("/api/wallet/setup", {
        method: "POST", headers, body: JSON.stringify({ cardId, endpoint }),
      }));
      if (typeof body.token !== "string" || !body.token || typeof body.expires !== "string") {
        throw Error("Il collegamento non è stato creato. Riprova.");
      }
      setToken(body.token);
      setLinked({ cardId, expires: body.expires });
      setStatus("Collegamento creato. Copia il codice qui sotto in Comandi Rapidi prima di ricaricare o lasciare questa schermata.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Creazione non riuscita. Riprova.");
    } finally { setBusy(false); }
  };

  const revokeLink = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await responseBody(await fetch("/api/wallet/setup", { method: "DELETE", headers: await accountHeaders() }));
      setToken("");
      setLinked(null);
      setStatus("Collegamento disattivato. La vecchia automazione non potrà più inviare pagamenti a ZERO.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Disattivazione non riuscita. Riprova.");
    } finally { setBusy(false); }
  };

  const sendTest = async () => {
    if (busy || !selectedCard || !endpoint || !configured) return;
    setBusy(true);
    setStatus("");
    try {
      const registration = await navigator.serviceWorker.getRegistration("/");
      if (!registration) throw Error("Attiva prima gli avvisi sul telefono e controlla di nuovo il collegamento.");
      await updatePushWorker(registration);
      const subscription = await registration.pushManager.getSubscription();
      if (subscription?.endpoint !== endpoint) throw Error("Il dispositivo è cambiato. Premi «Controlla di nuovo» prima della prova.");
      const body = await responseBody(await fetch("/api/wallet/test", {
        method: "POST", headers: await accountHeaders(), body: JSON.stringify({ endpoint, cardId }),
      }));
      if (body.notificationAccepted !== true) throw Error("La prova non è stata accettata. Riprova.");
      setStatus("Invio della notifica di prova accettato. Quando arriva, toccala: deve aprire ZERO con una spesa dimostrativa da 1 €. Il salvataggio è bloccato. L’arrivo sul telefono va verificato da te.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invio della prova non riuscito. Riprova.");
    } finally { setBusy(false); }
  };

  const preview = () => {
    if (!selectedCard) return;
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const params = new URLSearchParams({ currency: "EUR", cardId, amount: "1.00", merchant: "Pagamento di prova", date, ref: crypto.randomUUID(), preview: "1" });
    window.location.hash = `zero-pay?${params.toString()}`;
  };

  const buttonClass = "rounded-full bg-[#FDC909] px-5 py-3 text-xs font-bold disabled:opacity-40";
  const secondaryClass = "rounded-full border border-black/15 px-5 py-3 text-xs font-bold disabled:opacity-40";
  const fieldClass = "mt-2 w-full rounded-xl border border-black/15 bg-[#F7F7F5] p-3 font-mono text-xs font-normal";

  return <details className="rounded-[24px] border border-black/10 bg-white p-5 text-[#121212]">
    <summary className="cursor-pointer text-sm font-bold">Apple Pay → notifica in ZERO</summary>
    <div className="mt-4 space-y-5 text-sm leading-relaxed select-text">
      <p>Dopo un pagamento con l’iPhone, l’automazione invia i dati a ZERO. Tocchi la notifica e apri la spesa precompilata nella web app: scegli la categoria e confermi il salvataggio.</p>
      <p className="rounded-xl bg-[#FFF8D5] p-3">L’apertura richiede un tocco sulla notifica. Nessuna spesa viene salvata automaticamente. Il PIN segue le impostazioni di sicurezza di ZERO.</p>

      <section className="rounded-2xl bg-[#F7F7F5] p-4" aria-label="Disponibilità Apple Pay sul dispositivo">
        <h3 className="font-bold">1. Prepara questo dispositivo</h3>
        <p role="status" className="mt-2 text-xs text-[#666]">{readiness}</p>
        <button type="button" disabled={checking || busy} onClick={() => setCheckVersion(value => value + 1)} className={`${secondaryClass} mt-3`}>{checking ? "Controllo…" : "Controlla di nuovo"}</button>
      </section>

      <label className="block font-bold">Carta usata con Apple Pay
        <select value={cardId} disabled={busy} onChange={event => { setCardId(event.target.value); setStatus(""); setToken(""); }} className="mt-2 w-full rounded-xl border border-black/15 bg-white p-3">
          <option value="">Scegli la stessa carta di Wallet</option>
          {cards.map(card => <option key={card.id} value={card.id}>{card.bankName} · {card.number}</option>)}
        </select>
      </label>
      {!cards.length && <p>Aggiungi prima la carta in ZERO.</p>}

      <section aria-label="Collegamento personale Apple Pay">
        <h3 className="font-bold">2. Collega l’automazione</h3>
        <p className="mt-1 text-xs text-[#666]">Il codice personale collega l’automazione alla carta scelta e a questo dispositivo. Conservalo in Comandi Rapidi e non condividerlo.</p>
        {linked && <p className="mt-2 text-xs">Collegamento presente per {linkedCard ? `${linkedCard.bankName} · ${linkedCard.number}` : "una carta dell’account"}. Crearne uno nuovo sostituisce il precedente.</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={busy || checking || !configured || !endpoint || !selectedCard} onClick={() => void createLink()} className={buttonClass}>{busy ? "Attendi…" : linked ? "Crea nuovo collegamento" : "Crea collegamento"}</button>
          {linked && <button type="button" disabled={busy} onClick={() => void revokeLink()} className={secondaryClass}>Disattiva collegamento</button>}
        </div>
        {token && <div className="mt-4 space-y-3">
          <label className="block text-xs font-bold">Valore dell’intestazione Authorization
            <textarea readOnly aria-label="Codice personale automazione Apple Pay" value={`Bearer ${token}`} rows={3} className={`${fieldClass} break-all`} />
          </label>
          <button type="button" onClick={() => void copy(`Bearer ${token}`, "Intestazione copiata. Incollala nel campo Authorization dell’automazione.")} className={secondaryClass}>Copia codice con Bearer</button>
        </div>}
      </section>

      <section aria-label="Configurazione Comandi Rapidi per la notifica">
        <h3 className="mb-3 font-bold">3. Aggiorna Comandi Rapidi</h3>
        <ol className="list-decimal space-y-3 pl-5">
          <li>Apri l’automazione della carta in <strong>Comandi Rapidi → Automazione</strong>. Scegli <strong>Esegui immediatamente</strong>, se compare, e lascia qualsiasi esercente e categoria.</li>
          <li>Mantieni <strong>ImportoPagamento</strong> dall’Importo della Transazione, numerico senza € né separatori delle migliaia. Usa l’<strong>Esercente originale</strong>: il nuovo invio JSON non richiede la codifica URL. Sono supportati pagamenti in euro.</li>
          <li>Usa <strong>Data attuale</strong> una sola volta e due <strong>Formatta data → Personalizzato</strong> sulla stessa data: <code>yyyy-MM-dd</code> per <strong>DataPagamento</strong> e <code>yyyyMMddHHmmssSSS</code> per <strong>IDPagamento</strong>.</li>
          <li>Rimuovi <strong>Mostra avviso</strong> e l’azione che apriva Chrome. Sostituisci il vecchio collegamento con l’indirizzo qui sotto.</li>
          <li>Aggiungi <strong>Ottieni contenuti dell’URL</strong>. Apri le opzioni: metodo <strong>POST</strong>, intestazione <strong>Authorization</strong> con il codice personale completo di <strong>Bearer</strong> e intestazione <strong>Content-Type</strong> con <code>application/json</code>.</li>
          <li>Nel corpo della richiesta scegli <strong>JSON</strong> e aggiungi i cinque campi della tabella. Inserisci le variabili reali di Comandi Rapidi nei primi quattro campi.</li>
        </ol>
        <label className="mt-4 block text-xs font-bold">Indirizzo per l’invio a ZERO
          <textarea readOnly aria-label="Indirizzo invio pagamento Apple Pay" value={PAYMENT_URL} rows={2} className={`${fieldClass} break-all`} />
        </label>
        <button type="button" onClick={() => void copy(PAYMENT_URL, "Indirizzo copiato. Incollalo nell’azione URL dell’automazione.")} className={`${secondaryClass} mt-2`}>Copia indirizzo</button>
        <table className="mt-4 w-full text-left text-xs">
          <caption className="mb-2 text-left font-bold">Corpo JSON della richiesta</caption>
          <thead><tr className="border-b border-black/10"><th scope="col" className="py-2 pr-3">Campo</th><th scope="col" className="py-2">Valore</th></tr></thead>
          <tbody>
            <tr className="border-b border-black/5"><th scope="row" className="py-2 pr-3 font-mono font-normal">amount</th><td>Variabile ImportoPagamento</td></tr>
            <tr className="border-b border-black/5"><th scope="row" className="py-2 pr-3 font-mono font-normal">merchant</th><td>Variabile Esercente originale</td></tr>
            <tr className="border-b border-black/5"><th scope="row" className="py-2 pr-3 font-mono font-normal">date</th><td>Variabile DataPagamento</td></tr>
            <tr className="border-b border-black/5"><th scope="row" className="py-2 pr-3 font-mono font-normal">ref</th><td>Variabile IDPagamento</td></tr>
            <tr><th scope="row" className="py-2 pr-3 font-mono font-normal">currency</th><td>Testo EUR</td></tr>
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl bg-[#F7F7F5] p-4" aria-label="Prova della notifica Apple Pay">
        <h3 className="font-bold">4. Prova prima della prossima spesa</h3>
        <p className="mt-1 text-xs text-[#666]">Invia una notifica a questo dispositivo. Toccandola deve aprirsi una spesa dimostrativa da 1 € con la carta scelta. Il salvataggio è bloccato: movimenti e saldo restano invariati.</p>
        <button type="button" disabled={busy || checking || !configured || !endpoint || !selectedCard} onClick={() => void sendTest()} className={`${buttonClass} mt-3`}>Invia notifica di prova</button>
        <button type="button" disabled={busy || !selectedCard} onClick={preview} className={`${secondaryClass} mt-2 block`}>Prova solo il modulo qui</button>
        <p className="mt-3 text-xs text-[#666]">La prova del modulo e quella della notifica non verificano il rilevamento di Apple Pay. Il pulsante ▶ di Comandi Rapidi può non avere importo ed esercente: controlla il flusso al prossimo pagamento abituale con l’iPhone.</p>
      </section>

      {status && <p role="status" className="rounded-xl border border-black/10 p-3 text-xs">{status}</p>}

      <details className="border-t border-black/10 pt-4">
        <summary className="cursor-pointer text-xs font-bold">Alternativa: apertura nel browser</summary>
        <p className="mt-3 text-xs text-[#666]">Puoi mantenere il vecchio invio tramite collegamento: apre ZERO nel browser scelto da Comandi Rapidi. In questa alternativa l’esercente va codificato con Codifica URL e l’ultima azione è Apri URL. Il browser e l’icona Home possono avere accessi separati.</p>
        {selectedCard && <label className="mt-3 block text-xs font-bold">Modello per il browser
          <textarea readOnly aria-label="Modello collegamento diretto Apple Pay" value={directTemplate} rows={5} className={`${fieldClass} break-all`} />
        </label>}
      </details>
      <a href="https://support.apple.com/it-it/guide/shortcuts/apd65c67538a/ios" target="_blank" rel="noreferrer" className="inline-block text-xs font-bold underline">Guida Apple alle automazioni delle transazioni</a>
    </div>
  </details>;
}
