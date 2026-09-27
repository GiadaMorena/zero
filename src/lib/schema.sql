-- ================================================
-- ZERO App — Schema SQL completo
-- Esegui questo script nel Supabase SQL Editor
-- Dashboard → SQL Editor → New query → Paste → Run
-- ================================================

-- ── Tabella profili utenti ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  avatar_text TEXT NOT NULL DEFAULT '',
  currency    TEXT NOT NULL DEFAULT 'EUR (€)',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  theme       TEXT NOT NULL DEFAULT 'light',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (auth.uid() = id);

-- ── Tabella carte ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  bank_name   TEXT NOT NULL DEFAULT '',
  number      TEXT NOT NULL DEFAULT '',
  expiry      TEXT NOT NULL DEFAULT '00/00',
  type        TEXT NOT NULL DEFAULT 'generic',
  balance     NUMERIC NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cards_all" ON cards FOR ALL USING (auth.uid() = user_id);

-- ── Tabella transazioni ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT '',
  amount      NUMERIC NOT NULL,
  date        TEXT NOT NULL,
  card_id     TEXT,
  type        TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_all" ON transactions FOR ALL USING (auth.uid() = user_id);

-- ── Tabella abbonamenti ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  cost        NUMERIC NOT NULL,
  frequency   TEXT NOT NULL DEFAULT 'mese',
  date        TEXT NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT true,
  category    TEXT NOT NULL DEFAULT '',
  color       TEXT NOT NULL DEFAULT '#FDC909',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_all" ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- ── Tabella obiettivi ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  current     NUMERIC NOT NULL DEFAULT 0,
  target      NUMERIC NOT NULL,
  percent     NUMERIC NOT NULL DEFAULT 0,
  completed   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_all" ON goals FOR ALL USING (auth.uid() = user_id);

-- ── Trigger: crea profilo automaticamente alla registrazione ───
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_text)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'name', ''), 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
