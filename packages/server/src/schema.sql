CREATE TABLE IF NOT EXISTS bots (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT,
  name       TEXT NOT NULL,
  code       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_bot_id  INTEGER REFERENCES bots(id),
  black_bot_id  INTEGER REFERENCES bots(id),
  phase         TEXT NOT NULL DEFAULT 'waiting',
  winner        TEXT,
  final_state   JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  finished_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS games_white_bot_idx ON games(white_bot_id);
CREATE INDEX IF NOT EXISTS games_black_bot_idx ON games(black_bot_id);
CREATE INDEX IF NOT EXISTS games_phase_idx ON games(phase);
