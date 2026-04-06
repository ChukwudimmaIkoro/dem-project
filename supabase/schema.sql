-- ============================================================
-- Dem App — Supabase Schema
-- Paste this entire file into: Supabase → SQL Editor → New query → Run
-- ============================================================

-- ── User profiles (extends auth.users) ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_profiles (
  id                      UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name                    TEXT NOT NULL DEFAULT '',
  goals                   TEXT[] DEFAULT '{}',
  selected_foods          TEXT[] DEFAULT '{}',
  selected_exercises      TEXT[] DEFAULT '{}',
  selected_mentality      TEXT[] DEFAULT '{}',
  no_food_preference      BOOLEAN DEFAULT FALSE,
  no_exercise_preference  BOOLEAN DEFAULT FALSE,
  no_mentality_preference BOOLEAN DEFAULT FALSE,
  historical_streak       INTEGER DEFAULT 0,
  dummy_currency          INTEGER DEFAULT 0,
  tutorials_seen          TEXT[] DEFAULT '{}',
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── Plans (stored as JSONB for flexibility) ───────────────────────────────────

CREATE TABLE IF NOT EXISTS user_plans (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_data  JSONB NOT NULL,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_plans_user_id_idx ON user_plans (user_id);
CREATE INDEX IF NOT EXISTS user_plans_active_idx  ON user_plans (user_id, is_active);

ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own plans"
  ON user_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON user_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON user_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- ── AI cache ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_cache (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id     UUID REFERENCES user_plans(id) ON DELETE CASCADE,
  cache_key   TEXT NOT NULL,
  cache_value JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, cache_key)
);

CREATE INDEX IF NOT EXISTS ai_cache_user_key_idx ON ai_cache (user_id, cache_key);

ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own cache"
  ON ai_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cache"
  ON ai_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cache"
  ON ai_cache FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cache"
  ON ai_cache FOR DELETE
  USING (auth.uid() = user_id);

-- ── Auto-create profile row on sign-up ────────────────────────────────────────
-- This trigger fires when a new user signs up so user_profiles always has a row.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
