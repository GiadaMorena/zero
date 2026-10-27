-- Internal bookkeeping transfers. This does not initiate a bank payment.
-- Safe to apply repeatedly; existing transfer records are preserved.
BEGIN;

CREATE TABLE IF NOT EXISTS public.card_transfers (
  id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_card_id uuid REFERENCES public.cards(id) ON DELETE SET NULL,
  to_card_id uuid REFERENCES public.cards(id) ON DELETE SET NULL,
  from_card_ref uuid NOT NULL,
  to_card_ref uuid NOT NULL,
  from_label text NOT NULL,
  to_label text NOT NULL,
  amount numeric(14,2) NOT NULL CHECK (amount > 0 AND amount <= 999999999.99),
  date date NOT NULL CHECK (date BETWEEN DATE '1900-01-01' AND DATE '9999-12-31'),
  note text CHECK (note IS NULL OR length(note) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id),
  CHECK (from_card_ref <> to_card_ref),
  CHECK (from_card_id IS NULL OR to_card_id IS NULL OR from_card_id <> to_card_id)
);

CREATE INDEX IF NOT EXISTS card_transfers_user_created_idx ON public.card_transfers (user_id, created_at DESC);
ALTER TABLE public.card_transfers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS card_transfers_select ON public.card_transfers;
CREATE POLICY card_transfers_select ON public.card_transfers FOR SELECT TO authenticated USING (auth.uid() = user_id);
REVOKE ALL ON public.card_transfers FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.card_transfers TO authenticated;
GRANT ALL ON public.card_transfers TO service_role;

CREATE OR REPLACE FUNCTION public.record_card_transfer(
  p_request_id uuid, p_from_card_id uuid, p_to_card_id uuid,
  p_amount numeric, p_date date, p_note text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_transfer public.card_transfers%ROWTYPE;
  v_from public.cards%ROWTYPE;
  v_to public.cards%ROWTYPE;
  v_card public.cards%ROWTYPE;
  v_note text := nullif(btrim(p_note), '');
  v_balances jsonb;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'ZERO_TRANSFER_AUTH_REQUIRED'; END IF;
  IF p_request_id IS NULL OR p_from_card_id IS NULL OR p_to_card_id IS NULL
    OR p_from_card_id = p_to_card_id OR p_amount IS NULL
    OR NOT (p_amount >= 0.01 AND p_amount <= 999999999.99)
    OR p_amount <> round(p_amount, 2) OR p_date IS NULL
    OR p_date NOT BETWEEN DATE '1900-01-01' AND DATE '9999-12-31'
    OR length(v_note) > 500 THEN
    RAISE EXCEPTION 'ZERO_TRANSFER_INVALID';
  END IF;

  -- Serializes the same logical request across retries and concurrent devices.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user_id::text || ':' || p_request_id::text, 0));
  SELECT * INTO v_transfer FROM public.card_transfers WHERE user_id = v_user_id AND id = p_request_id;
  IF FOUND THEN
    -- Card deletion sets the FK to NULL; stable snapshots and request values remain.
    IF v_transfer.from_card_ref <> p_from_card_id OR v_transfer.to_card_ref <> p_to_card_id
      OR v_transfer.amount <> p_amount OR v_transfer.date <> p_date OR v_transfer.note IS DISTINCT FROM v_note THEN
      RAISE EXCEPTION 'ZERO_TRANSFER_REQUEST_CONFLICT';
    END IF;
    SELECT coalesce(jsonb_agg(jsonb_build_object('id', id, 'balance', balance) ORDER BY id), '[]'::jsonb)
      INTO v_balances FROM public.cards WHERE user_id = v_user_id AND id IN (v_transfer.from_card_id, v_transfer.to_card_id);
    RETURN jsonb_build_object('transfer', to_jsonb(v_transfer), 'balances', v_balances);
  END IF;

  -- Stable lock order prevents opposite transfers from deadlocking.
  FOR v_card IN SELECT * FROM public.cards
    WHERE user_id = v_user_id AND id IN (p_from_card_id, p_to_card_id) ORDER BY id FOR UPDATE
  LOOP
    IF v_card.id = p_from_card_id THEN v_from := v_card; ELSE v_to := v_card; END IF;
  END LOOP;
  IF v_from.id IS NULL OR v_to.id IS NULL THEN RAISE EXCEPTION 'ZERO_TRANSFER_CARD_UNAVAILABLE'; END IF;
  -- PostgreSQL NUMERIC can hold NaN/Infinity. Reject corrupt stored balances
  -- before either card is changed, rather than returning an unusable success.
  IF v_from.balance::text IN ('NaN', 'Infinity', '-Infinity')
    OR v_to.balance::text IN ('NaN', 'Infinity', '-Infinity')
    OR v_from.balance < 0 OR v_to.balance < 0 THEN
    RAISE EXCEPTION 'ZERO_TRANSFER_INVALID';
  END IF;
  IF v_from.balance < p_amount THEN RAISE EXCEPTION 'ZERO_TRANSFER_INSUFFICIENT_FUNDS'; END IF;

  UPDATE public.cards SET balance = balance - p_amount WHERE id = v_from.id AND user_id = v_user_id;
  UPDATE public.cards SET balance = balance + p_amount WHERE id = v_to.id AND user_id = v_user_id;

  INSERT INTO public.card_transfers (id, user_id, from_card_id, to_card_id, from_card_ref, to_card_ref, from_label, to_label, amount, date, note)
    VALUES (p_request_id, v_user_id, v_from.id, v_to.id, v_from.id, v_to.id,
      concat_ws(' · ', coalesce(nullif(v_from.bank_name, ''), nullif(v_from.name, ''), 'Carta'),
        CASE WHEN regexp_replace(v_from.number, '\D', '', 'g') <> '' THEN '•••• ' || right(regexp_replace(v_from.number, '\D', '', 'g'), 4) END),
      concat_ws(' · ', coalesce(nullif(v_to.bank_name, ''), nullif(v_to.name, ''), 'Carta'),
        CASE WHEN regexp_replace(v_to.number, '\D', '', 'g') <> '' THEN '•••• ' || right(regexp_replace(v_to.number, '\D', '', 'g'), 4) END),
      p_amount, p_date, v_note) RETURNING * INTO v_transfer;

  SELECT jsonb_agg(jsonb_build_object('id', id, 'balance', balance) ORDER BY id)
    INTO v_balances FROM public.cards WHERE user_id = v_user_id AND id IN (v_from.id, v_to.id);
  RETURN jsonb_build_object('transfer', to_jsonb(v_transfer), 'balances', v_balances);
END;
$$;

REVOKE ALL ON FUNCTION public.record_card_transfer(uuid, uuid, uuid, numeric, date, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_card_transfer(uuid, uuid, uuid, numeric, date, text) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
