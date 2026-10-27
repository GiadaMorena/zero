# Trasferimenti tra carte

ZERO registra i giroconti tra due carte dello stesso account. Non avvia pagamenti bancari. I trasferimenti hanno uno storico separato da `transactions`, quindi non cambiano spese, entrate, budget e analisi.

## Attivazione del database

Eseguire una volta in Supabase SQL Editor il file `src/lib/migrations/20261027_card_transfers.sql`. Lo script è ripetibile e conserva gli eventuali trasferimenti già registrati. Richiede le tabelle `auth.users` e `public.cards` già utilizzate da ZERO.

La tabella `card_transfers` permette soltanto la lettura dei propri dati da parte degli utenti autenticati. La funzione `record_card_transfer` verifica il proprietario di entrambe le carte, blocca le righe in ordine stabile e aggiorna i due saldi e lo storico in una sola transazione. Non inserisce righe in `transactions`.

Ogni invio usa un UUID conservato durante i tentativi successivi. Una richiesta ripetuta con gli stessi dati restituisce lo stesso trasferimento e i saldi correnti, senza ripetere addebito e accredito. La stessa richiesta con dati diversi viene rifiutata. I nomi delle carte e le ultime quattro cifre restano nello storico anche dopo la rimozione di una carta.

Il client aggiorna i saldi soltanto dopo la conferma del server. Un trasferimento non può essere registrato senza autenticazione; non esiste un ripiego con scritture separate o una sola metà del movimento.

## Verifiche

- `node scripts/check-card-transfers.cjs`: validazione, risposta RPC e tentativi successivi.
- `node scripts/check-transfer-form.cjs`: modulo, carte, tastiera e salvataggio.
- `node scripts/check-transfer-context.cjs`: saldi, storico separato, totali e isolamento tra account.
- `node scripts/check-card-transfer-sql.cjs <repository> <percorso-pacchetto-pglite>`: esecuzione SQL con PostgreSQL tramite PGlite, rollback, RLS e idempotenza. PGlite è un runtime facoltativo per i test, non una dipendenza dell’app.

Le vecchie operazioni registrate come spese o entrate non vengono convertite automaticamente: il nuovo comportamento riguarda i trasferimenti registrati con questa funzione.
