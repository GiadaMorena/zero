# Conferma dei pagamenti degli abbonamenti

“Sì, pagato” registra una spesa con il nome dell’abbonamento, categoria Abbonamenti, importo e data del rinnovo, sulla carta associata. Conferma, movimento e saldo vengono salvati nella stessa transazione PostgreSQL. Lo stesso rinnovo non viene addebitato due volte quando si ripete la conferma o si perde la risposta del server.

La migrazione è `src/lib/migrations/20261028_subscription_payments.sql`. Crea il registro riservato `subscription_payments` e la funzione autenticata `record_subscription_payment`. Le conferme continuano a essere disponibili ai promemoria nel campo utente `zero_subscription_tracking_v1`; gli altri metadati vengono preservati.

I rinnovi già confermati dal vecchio sistema non vengono trasformati in spese automaticamente. Premere di nuovo “Sì, pagato” registra o verifica il movimento del rinnovo corrente. Non vengono registrati addebiti soltanto perché è arrivato il giorno della scadenza.

Quando trova un movimento con lo stesso importo, carta e nome dell’abbonamento entro tre giorni dalla scadenza, ZERO chiede se collegarlo. Il collegamento non modifica né il movimento né il saldo. L’utente può scegliere esplicitamente di registrare una spesa diversa.

“No, non pagato” non elimina spese già registrate: bisogna prima eliminare la spesa collegata dai Movimenti. Dopo un’eliminazione, un tentativo ripetuto di “Sì” non ricrea la spesa silenziosamente; per correggere serve prima confermare “No” e poi nuovamente “Sì”. Una carta mancante o eliminata richiede una nuova associazione prima di registrare il pagamento.

Verifiche: `check-subscription-payment.cjs`, `check-subscription-payment-context.cjs`, `check-subscription-confirmation.cjs`, `check-subscription-reminders.cjs`. `check-subscription-payment-sql.cjs` esegue la migrazione e i casi di atomicità, idempotenza, proprietà e duplicati con PostgreSQL tramite il runtime facoltativo PGlite.
