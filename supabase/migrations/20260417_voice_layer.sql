-- ============================================================
-- Voice Layer: ElevenLabs Conversational AI
-- Tables: calls, call_turns, voice_tool_log
-- agents already has elevenlabs_agent_id, elevenlabs_voice_id, phone_extension
-- (applied to project cerozvtggvwixeyqcgkz on 2026-04-17)
-- ============================================================

-- 1. Calls table — keyed on ElevenLabs conversation_id
CREATE TABLE IF NOT EXISTS calls (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  conversation_id TEXT UNIQUE NOT NULL,
  call_sid        TEXT,
  external_provider TEXT DEFAULT 'elevenlabs',
  from_number     TEXT,
  to_number       TEXT,
  direction       TEXT DEFAULT 'inbound',
  caller_name     TEXT,
  elevenlabs_agent_id TEXT,
  current_agent   TEXT,
  agents_handled  TEXT[] DEFAULT ARRAY[]::TEXT[],
  start_time      TIMESTAMPTZ DEFAULT now(),
  end_time        TIMESTAMPTZ,
  duration_seconds INTEGER,
  status          TEXT DEFAULT 'in_progress',
  outcome         TEXT,
  account_id      UUID REFERENCES accounts(id) ON DELETE SET NULL,
  contact_id      UUID REFERENCES contacts(id) ON DELETE SET NULL,
  lead_id         UUID,
  deal_id         UUID REFERENCES deals(id) ON DELETE SET NULL,
  recording_url   TEXT,
  transcript_summary TEXT,
  escalated       BOOLEAN DEFAULT false,
  escalation_reason TEXT,
  escalation_urgency TEXT,
  escalated_at    TIMESTAMPTZ,
  followup_sms_sent BOOLEAN DEFAULT false,
  followup_email_sent BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_calls_conv ON calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_calls_sid  ON calls(call_sid);
CREATE INDEX IF NOT EXISTS idx_calls_created ON calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_from ON calls(from_number);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_account ON calls(account_id);

-- 2. Call turns — every caller/agent utterance + tool invocation
CREATE TABLE IF NOT EXISTS call_turns (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id       UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  turn_index    INTEGER NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  role          TEXT NOT NULL,            -- user | agent | tool | system
  agent_name    TEXT,                     -- agents.id when role=agent
  elevenlabs_agent_id TEXT,
  text          TEXT,
  tool_name     TEXT,
  tool_input    JSONB,
  tool_output   JSONB
);

CREATE INDEX IF NOT EXISTS idx_call_turns_call ON call_turns(call_id, turn_index);

-- 3. Voice tool invocation audit log — independent of call rows
CREATE TABLE IF NOT EXISTS voice_tool_log (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now(),
  conversation_id TEXT,
  elevenlabs_agent_id TEXT,
  from_number   TEXT,
  tool_name     TEXT NOT NULL,
  request       JSONB,
  response      JSONB,
  status_code   INTEGER,
  latency_ms    INTEGER,
  error         TEXT
);

CREATE INDEX IF NOT EXISTS idx_voice_tool_log_conv ON voice_tool_log(conversation_id);
CREATE INDEX IF NOT EXISTS idx_voice_tool_log_created ON voice_tool_log(created_at DESC);

-- 4. Extend agents (only the new columns — the rest already exist)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS voice_provider  TEXT DEFAULT 'elevenlabs';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS greeting_text   TEXT;

-- Seed greetings (used as reference when writing EL agent first-message)
UPDATE agents SET greeting_text = 'Thanks for calling Bandit Recycling, this is Jade. How can I help?' WHERE id = 'jade' AND greeting_text IS NULL;
UPDATE agents SET greeting_text = 'Hi, this is Savannah with Bandit sales. What can I help you set up today?' WHERE id = 'savannah' AND greeting_text IS NULL;
UPDATE agents SET greeting_text = 'Rex here, dispatch. What''s going on?' WHERE id = 'rex' AND greeting_text IS NULL;
UPDATE agents SET greeting_text = 'Diesel, vendor line. Go ahead.' WHERE id = 'diesel' AND greeting_text IS NULL;
UPDATE agents SET greeting_text = 'This is Nova with Bandit billing. How can I help?' WHERE id = 'nova' AND greeting_text IS NULL;
UPDATE agents SET greeting_text = 'Hey, Scout from marketing. What''s up?' WHERE id = 'scout' AND greeting_text IS NULL;
UPDATE agents SET greeting_text = 'Atlas. Go.' WHERE id = 'atlas' AND greeting_text IS NULL;

-- 5. RLS — service role only
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_tool_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "calls_service_all" ON calls;
CREATE POLICY "calls_service_all" ON calls FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "call_turns_service_all" ON call_turns;
CREATE POLICY "call_turns_service_all" ON call_turns FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "voice_tool_log_service_all" ON voice_tool_log;
CREATE POLICY "voice_tool_log_service_all" ON voice_tool_log FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 6. updated_at trigger on calls
CREATE OR REPLACE FUNCTION touch_calls_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calls_updated ON calls;
CREATE TRIGGER trg_calls_updated BEFORE UPDATE ON calls
  FOR EACH ROW EXECUTE FUNCTION touch_calls_updated_at();
