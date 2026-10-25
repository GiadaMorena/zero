# Prova di Comandi Rapidi senza un pagamento

`POST /api/wallet/check` verifica lo stesso codice personale, la carta e il dispositivo push del collegamento Apple Pay. È una prova esplicita: crea soltanto una bozza da 1 € con `preview: true`, che il modulo ZERO non permette di salvare.

## Sul telefono

1. Nell’automazione esistente sostituire temporaneamente l’indirizzo dell’azione URL con `https://zero-henna-one.vercel.app/api/wallet/check`.
2. Conservare metodo POST, intestazioni e corpo JSON. I dati della transazione non servono per questa prova: il server ignora i valori ricevuti e costruisce sempre la bozza dimostrativa sulla carta già associata.
3. Avviare con ▶. Una risposta con `ok: true`, `preview: true` e `notificationAccepted: true` indica che il server ha accettato la prova e il fornitore push ha accettato la notifica. L’arrivo e l’apertura nella web app devono essere verificati sul telefono.
4. Dopo la prova ripristinare **`https://zero-henna-one.vercel.app/api/wallet/payment`** per i pagamenti reali. Lasciando `/check`, ogni invio continuerebbe a creare soltanto una prova non salvabile.

La prova non dimostra che il trigger Wallet abbia ricevuto una transazione reale. Un errore nativo «La connessione è stata persa» non dimostra neppure che il codice personale sia errato: la connessione può interrompersi prima di una risposta del server. Il test restituisce i normali errori JSON di autorizzazione/configurazione e produce soltanto log generici di esito, senza codice, dati della carta o dettagli finanziari.

## Data e riferimento

Per i pagamenti reali, catturare una sola **Data attuale** e collegarla direttamente a entrambe le azioni Formatta data:

- `yyyy-MM-dd` → DataPagamento.
- `yyyyMMddHHmmssSSS` → IDPagamento.

Il secondo Formatta data non deve usare DataPagamento: una stringa contenente soltanto il giorno ha già perso l’orario, quindi può produrre lo stesso riferimento per tutti i pagamenti della giornata.

## Verifica

`node scripts/check-wallet-shortcut.cjs` usa il medesimo storage in memoria dei test dell’integrazione. Controlla autorizzazione, proprietà della carta, dispositivo, revoca, valori ricevuti ignorati, prova non salvabile, errore push recuperabile, dimensione del corpo e limite di cinque richieste al minuto. `check-wallet-preview.cjs` verifica separatamente il blocco del salvataggio nel modulo reale.
