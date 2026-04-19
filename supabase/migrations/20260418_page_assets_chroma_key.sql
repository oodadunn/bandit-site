-- Tracked copy of the live migration applied 2026-04-18 via MCP.
-- Adds chroma_key column per asset so we can pick the right background color
-- for chroma-key alpha processing. Bandit assets use green (residual green
-- reads as brand rim light); equipment/wire use white because their subjects
-- have legitimate green accents that can't conflict with the key.

ALTER TABLE page_assets ADD COLUMN IF NOT EXISTS chroma_key TEXT NOT NULL DEFAULT 'white';

UPDATE page_assets SET chroma_key = 'green'
  WHERE slug IN ('services', 'service-area', 'partners', 'materials');
UPDATE page_assets SET chroma_key = 'white'
  WHERE slug IN ('equipment', 'wire');

-- Prompt text updates (see live DB for canonical text). Bandit slots now
-- request plain black vest (no green patch) so the chroma-key green can be
-- stripped cleanly. Equipment + wire prompts explicitly call for a flat
-- white photography seamless to beat Gemini's checkerboard habit.
