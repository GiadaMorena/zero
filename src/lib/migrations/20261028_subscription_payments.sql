-- A confirmed renewal, its expense and the card debit commit together.
BEGIN;
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  cycle_date date NOT NULL,
  paid boolean NOT NULL,
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, subscription_id, cycle_date)
);
CREATE UNIQUE INDEX IF NOT EXISTS subscription_payments_transaction_idx ON public.subscription_payments(user_id, transaction_id) WHERE transaction_id IS NOT NULL;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS subscription_payments_select ON public.subscription_payments;
CREATE POLICY subscription_payments_select ON public.subscription_payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
REVOKE ALL ON public.subscription_payments FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.subscription_payments TO authenticated;
GRANT ALL ON public.subscription_payments TO service_role;

CREATE OR REPLACE FUNCTION public.zero_subscription_movement_day(p_date text, p_created timestamptz)
RETURNS date LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
BEGIN
  IF p_date ~ '^\d{4}-\d{2}-\d{2}($|[Tt])' THEN
    BEGIN RETURN left(p_date,10)::date; EXCEPTION WHEN datetime_field_overflow OR invalid_datetime_format THEN NULL; END;
  END IF;
  RETURN (p_created AT TIME ZONE 'Europe/Rome')::date - CASE WHEN lower(p_date) ~ '^ieri([,[:space:]]|$)' THEN 1 ELSE 0 END;
END;
$$;
REVOKE ALL ON FUNCTION public.zero_subscription_movement_day(text,timestamptz) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.record_subscription_payment(
  p_subscription_id uuid, p_cycle_date date, p_paid boolean,
  p_existing_transaction_id uuid DEFAULT NULL, p_allow_new boolean DEFAULT false
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_today date := (now() AT TIME ZONE 'Europe/Rome')::date;
  v_meta jsonb; v_tracking jsonb; v_entries jsonb; v_entry jsonb; v_payments jsonb;
  v_sub public.subscriptions%ROWTYPE; v_card public.cards%ROWTYPE;
  v_payment public.subscription_payments%ROWTYPE; v_tx public.transactions%ROWTYPE;
  v_card_id uuid; v_parts text[]; v_day integer; v_month integer; v_anchor date; v_recent date;
  v_started date; v_candidates jsonb; v_balance jsonb := NULL; v_name text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'ZERO_SUB_AUTH_REQUIRED'; END IF;
  IF p_subscription_id IS NULL OR p_cycle_date IS NULL OR p_paid IS NULL THEN RAISE EXCEPTION 'ZERO_SUB_INVALID'; END IF;
  SELECT coalesce(raw_user_meta_data,'{}'::jsonb) INTO v_meta FROM auth.users WHERE id=v_uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ZERO_SUB_AUTH_REQUIRED'; END IF;
  SELECT * INTO v_sub FROM public.subscriptions WHERE id=p_subscription_id AND user_id=v_uid FOR UPDATE;
  IF NOT FOUND OR NOT v_sub.active THEN RAISE EXCEPTION 'ZERO_SUB_UNAVAILABLE'; END IF;
  v_tracking := CASE WHEN jsonb_typeof(v_meta->'zero_subscription_tracking_v1')='object' THEN v_meta->'zero_subscription_tracking_v1' ELSE '{}'::jsonb END;
  v_entries := CASE WHEN jsonb_typeof(v_tracking->'subscriptions')='object' THEN v_tracking->'subscriptions' ELSE '{}'::jsonb END;
  v_entry := CASE WHEN jsonb_typeof(v_entries->(p_subscription_id::text))='object' THEN v_entries->(p_subscription_id::text) ELSE '{}'::jsonb END;
  v_payments := CASE WHEN jsonb_typeof(v_entry->'payments')='object' THEN v_entry->'payments' ELSE '{}'::jsonb END;
  v_started := v_today;
  IF (v_tracking->>'startedOn') ~ '^\d{4}-\d{2}-\d{2}$' THEN
    BEGIN v_started := (v_tracking->>'startedOn')::date; EXCEPTION WHEN datetime_field_overflow OR invalid_datetime_format THEN v_started := v_today; END;
  END IF;
  v_parts := regexp_match(lower(btrim(v_sub.date)), '^(\d{1,2})\s+([a-z]+)(?:\s+\d{4})?$');
  IF v_parts IS NOT NULL THEN
    v_day := v_parts[1]::integer;
    v_month := array_position(ARRAY['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'],v_parts[2]);
  ELSE
    v_parts := regexp_match(btrim(v_sub.date), '^(\d{1,2})/(\d{1,2})(?:/\d{4})?$');
    IF v_parts IS NOT NULL THEN v_day := v_parts[1]::integer; v_month := v_parts[2]::integer;
    ELSE
      v_parts := regexp_match(btrim(v_sub.date), '^\d{4}-(\d{2})-(\d{2})$');
      IF v_parts IS NOT NULL THEN v_day := v_parts[2]::integer; v_month := v_parts[1]::integer; END IF;
    END IF;
  END IF;
  IF v_day IS NULL OR v_day NOT BETWEEN 1 AND 31 OR v_month IS NULL OR v_month NOT BETWEEN 1 AND 12 OR v_sub.frequency NOT IN ('mese','anno') THEN RAISE EXCEPTION 'ZERO_SUB_CYCLE_CHANGED'; END IF;
  v_anchor := CASE WHEN v_sub.frequency='mese' THEN date_trunc('month',v_today)::date ELSE make_date(extract(year FROM v_today)::integer,v_month,1) END;
  v_recent := v_anchor + least(v_day,extract(day FROM v_anchor + interval '1 month - 1 day')::integer)-1;
  IF v_recent > v_today THEN
    v_anchor := (v_anchor - CASE WHEN v_sub.frequency='mese' THEN interval '1 month' ELSE interval '1 year' END)::date;
    v_recent := v_anchor + least(v_day,extract(day FROM v_anchor + interval '1 month - 1 day')::integer)-1;
  END IF;
  IF p_cycle_date <> v_recent OR p_cycle_date < v_started OR p_cycle_date < (v_sub.created_at AT TIME ZONE 'Europe/Rome')::date THEN RAISE EXCEPTION 'ZERO_SUB_CYCLE_CHANGED'; END IF;
  SELECT * INTO v_payment FROM public.subscription_payments WHERE user_id=v_uid AND subscription_id=p_subscription_id AND cycle_date=p_cycle_date FOR UPDATE;
  IF v_payment.transaction_id IS NOT NULL THEN
    SELECT * INTO v_tx FROM public.transactions WHERE id=v_payment.transaction_id AND user_id=v_uid FOR UPDATE;
    IF NOT p_paid THEN RAISE EXCEPTION 'ZERO_SUB_LINKED_PAYMENT'; END IF;
    IF v_tx.id IS NULL THEN RAISE EXCEPTION 'ZERO_SUB_DELETED_PAYMENT'; END IF;
    IF v_tx.card_id ~ '^[0-9a-fA-F-]{36}$' THEN
      SELECT * INTO v_card FROM public.cards WHERE id=v_tx.card_id::uuid AND user_id=v_uid FOR UPDATE;
      IF FOUND THEN v_balance := jsonb_build_object('id',v_card.id,'balance',v_card.balance); END IF;
    END IF;
  ELSIF p_paid THEN
    IF v_payment.paid THEN RAISE EXCEPTION 'ZERO_SUB_DELETED_PAYMENT'; END IF;
    IF v_sub.cost::text IN ('NaN','Infinity','-Infinity') OR v_sub.cost < 0.01 OR v_sub.cost > 999999999.99 OR v_sub.cost <> round(v_sub.cost,2) THEN RAISE EXCEPTION 'ZERO_SUB_INVALID_COST'; END IF;
    IF coalesce(v_entry->>'cardId','') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN RAISE EXCEPTION 'ZERO_SUB_MISSING_CARD'; END IF;
    v_card_id := (v_entry->>'cardId')::uuid;
    SELECT * INTO v_card FROM public.cards WHERE id=v_card_id AND user_id=v_uid FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'ZERO_SUB_MISSING_CARD'; END IF;
    IF v_card.balance::text IN ('NaN','Infinity','-Infinity') OR v_card.balance < 0 THEN RAISE EXCEPTION 'ZERO_SUB_INVALID_BALANCE'; END IF;
    v_name := regexp_replace(lower(v_sub.name),'[^[:alnum:]]','','g');
    IF v_name='' THEN RAISE EXCEPTION 'ZERO_SUB_INVALID'; END IF;
    IF p_existing_transaction_id IS NOT NULL THEN
      SELECT * INTO v_tx FROM public.transactions WHERE id=p_existing_transaction_id AND user_id=v_uid FOR UPDATE;
      IF NOT FOUND OR v_tx.type <> 'expense' OR v_tx.amount <> -v_sub.cost OR v_tx.card_id IS DISTINCT FROM v_card_id::text
        OR public.zero_subscription_movement_day(v_tx.date,v_tx.created_at) NOT BETWEEN p_cycle_date-3 AND p_cycle_date+3
        OR EXISTS (SELECT 1 FROM public.subscription_payments WHERE user_id=v_uid AND transaction_id=v_tx.id) THEN RAISE EXCEPTION 'ZERO_SUB_EXISTING_INVALID'; END IF;
    ELSE
      SELECT coalesce(jsonb_agg(to_jsonb(candidate) ORDER BY candidate.created_at DESC),'[]'::jsonb) INTO v_candidates FROM (
        SELECT t.* FROM public.transactions t WHERE t.user_id=v_uid AND t.type='expense' AND t.amount=-v_sub.cost AND t.card_id=v_card_id::text
          AND position(v_name IN regexp_replace(lower(t.title),'[^[:alnum:]]','','g'))>0
          AND public.zero_subscription_movement_day(t.date,t.created_at) BETWEEN p_cycle_date-3 AND p_cycle_date+3
          AND NOT EXISTS (SELECT 1 FROM public.subscription_payments p WHERE p.user_id=v_uid AND p.transaction_id=t.id)
        ORDER BY t.created_at DESC LIMIT 10
      ) candidate;
      IF jsonb_array_length(v_candidates)>0 AND NOT coalesce(p_allow_new,false) THEN RETURN jsonb_build_object('needsChoice',true,'candidates',v_candidates); END IF;
      INSERT INTO public.transactions(user_id,title,category,amount,date,card_id,type,note)
        VALUES(v_uid,v_sub.name,'Abbonamenti',-v_sub.cost,p_cycle_date::text,v_card_id::text,'expense','[zero-subscription:'||p_subscription_id::text||':'||p_cycle_date::text||']') RETURNING * INTO v_tx;
      UPDATE public.cards SET balance=greatest(0,balance-v_sub.cost) WHERE id=v_card_id AND user_id=v_uid RETURNING * INTO v_card;
    END IF;
    v_balance := jsonb_build_object('id',v_card.id,'balance',v_card.balance);
  END IF;
  INSERT INTO public.subscription_payments(user_id,subscription_id,cycle_date,paid,transaction_id)
    VALUES(v_uid,p_subscription_id,p_cycle_date,p_paid,v_tx.id)
    ON CONFLICT(user_id,subscription_id,cycle_date) DO UPDATE SET paid=EXCLUDED.paid, transaction_id=EXCLUDED.transaction_id;
  v_entry := jsonb_set(v_entry,'{payments}',v_payments || jsonb_build_object(p_cycle_date::text,p_paid),true);
  v_entries := v_entries || jsonb_build_object(p_subscription_id::text,v_entry);
  v_tracking := v_tracking || jsonb_build_object('startedOn',v_started::text,'subscriptions',v_entries);
  UPDATE auth.users SET raw_user_meta_data=jsonb_set(v_meta,'{zero_subscription_tracking_v1}',v_tracking,true) WHERE id=v_uid;
  RETURN jsonb_build_object('tracking',v_tracking,'transaction',CASE WHEN v_tx.id IS NULL THEN NULL ELSE to_jsonb(v_tx) END,'balance',v_balance);
END;
$$;
REVOKE ALL ON FUNCTION public.record_subscription_payment(uuid,date,boolean,uuid,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.record_subscription_payment(uuid,date,boolean,uuid,boolean) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
