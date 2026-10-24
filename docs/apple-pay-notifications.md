# Apple Pay → notifica → bozza in ZERO

Questa integrazione usa un’automazione personale Transazione di Comandi Rapidi. Non legge Wallet dal sito e non salva automaticamente movimenti.

## Attivazione

1. Configurare in Vercel Production `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Il servizio notifiche esistente richiede anche `CRON_SECRET`. I valori privati non devono essere prefissati `NEXT_PUBLIC_`, inseriti nel repository o copiati in chat. Il VAPID pubblico e privato devono essere una coppia valida. La chiave Supabase deve essere una vera chiave server del progetto, non una chiave pubblicabile.
2. Pubblicare e controllare `/api/push`: deve restituire `configured: true`. Questo stato non dimostra ancora la consegna sul telefono.
3. Aprire ZERO dall’icona Home su iPhone e abilitare «Avvisi sul telefono». Registrazione e consenso sono separati per ogni dispositivo e per il browser.
4. In Profilo → «Apple Pay → notifica in ZERO», selezionare la carta corretta, aggiornare il controllo e creare il collegamento. Il codice viene mostrato solo alla creazione; copiarlo direttamente in Comandi Rapidi. È revocabile, scade dopo 90 giorni e un nuovo codice sostituisce il precedente. Ogni account ha un collegamento alla volta.
5. Configurare l’automazione della stessa carta con «Esegui immediatamente». Dopo aver estratto importo, esercente e data, usare «Ottieni contenuti dell’URL», POST a `https://zero-henna-one.vercel.app/api/wallet/payment`, intestazioni `Authorization: Bearer <codice>` e `Content-Type: application/json`. Il corpo JSON contiene `amount`, `merchant` originale, `date` (`yyyy-MM-dd`), `ref` (`yyyyMMddHHmmssSSS`, dalla stessa Data attuale) e `currency: EUR`. Importo numerico, senza € né separatori delle migliaia. Non usare l’esercente codificato per un URL.
6. La prova «Invia notifica di prova» crea solo una bozza dimostrativa non salvabile. Verificare sul telefono ricezione e apertura dentro la web app. La prova dell’interfaccia non dimostra che il trigger Wallet funzioni. La verifica finale avviene al prossimo pagamento abituale, senza effettuare acquisti appositamente.

## Flusso e garanzie

- Il codice di Comandi Rapidi autorizza solo invio di bozze per la carta e il dispositivo scelti. Non è un token Supabase, non permette lettura di movimenti e viene memorizzato dal server soltanto come digest SHA-256.
- Creazione/revoca collegamento, lettura bozze e conferma di consumo richiedono la sessione autentica dell’account. La proprietà della carta e la registrazione del dispositivo sono ricontrollate prima dell’invio. La disconnessione/disattivazione delle notifiche rende inutilizzabile un endpoint non più registrato.
- Le bozze sono oggetti nel bucket Supabase privato `zero-notification-service`, con percorsi distinti per utente. Sono recuperabili per 24 ore. I dettagli vengono rimossi quando la bozza è chiusa/salvata o quando la manutenzione incontra una bozza scaduta; i riferimenti minimi anti-duplicato restano fino a sette giorni e vengono eliminati durante la manutenzione successiva.
- Un riferimento deterministico e una creazione atomica impediscono che due richieste concorrenti per lo stesso pagamento generino due notifiche. Il limite è cinque nuove richieste al minuto per account. Il riferimento viene conservato anche dopo il consumo.
- Il messaggio push non contiene importo, esercente, carta o codice personale: soltanto un identificativo opaco. Il service worker apre un percorso ZERO prestabilito; non esegue URL ricevuti nel payload.
- Il recupero autenticato parte anche dopo apertura a freddo/ritorno nell’app: non dipende dal mantenimento del frammento URL da parte di iOS. Le bozze restano legate all’account.
- `notificationAccepted: true` significa che il fornitore push ha accettato la richiesta; ricezione e apertura effettive devono essere verificate sul dispositivo. In caso di errore dopo la ricezione della bozza, questa resta recuperabile aprendo ZERO. Una ripetizione non invia ulteriori notifiche per quel riferimento.
- Solo l’utente sceglie la categoria e conferma «Salva». PIN e login seguono le impostazioni esistenti. Nessuna migrazione o modifica a saldi/carte/movimenti è eseguita dal servizio.

## Verifica locale

Eseguire gli script `check-wallet-payment.cjs`, `check-wallet-receiver.cjs`, `check-wallet-preview.cjs`, `check-wallet-push.cjs`, `check-wallet-push-receiver.cjs` e `check-wallet-setup.cjs` dalla directory del progetto, poi `npm run build`. I test usano storage e push in memoria senza contattare account reali.
