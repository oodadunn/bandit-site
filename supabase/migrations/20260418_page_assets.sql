-- Tracked copy of the live migration applied 2026-04-18 via MCP.
-- Creates page_assets table + headers storage bucket and seeds 6 header slots.
-- Kept here so future devs can rebuild the DB from migrations alone.

CREATE TABLE IF NOT EXISTS page_assets (
  slug         TEXT PRIMARY KEY,
  asset_type   TEXT NOT NULL DEFAULT 'header',
  display_name TEXT NOT NULL,
  prompt       TEXT NOT NULL,
  url          TEXT,
  updated_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE page_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read page_assets" ON page_assets;
CREATE POLICY "Public read page_assets" ON page_assets FOR SELECT USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('headers', 'headers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read headers" ON storage.objects;
CREATE POLICY "Public read headers" ON storage.objects
  FOR SELECT USING (bucket_id = 'headers');

-- Seed prompts — see live DB for canonical prompt text.
INSERT INTO page_assets (slug, asset_type, display_name, prompt) VALUES
('services',     'header', 'Services',             'SEE LIVE DB — Bandit thumbs-up, transparent PNG'),
('equipment',    'header', 'Equipment',            'SEE LIVE DB — vertical baler, transparent PNG'),
('wire',         'header', 'Bale Wire',            'SEE LIVE DB — coil of wire, transparent PNG'),
('service-area', 'header', 'Service Area',         'SEE LIVE DB — Bandit with US map, transparent PNG'),
('partners',     'header', 'Partners',             'SEE LIVE DB — Bandit handshake, transparent PNG'),
('materials',    'header', 'Resources / Materials','SEE LIVE DB — Bandit with clipboard, transparent PNG')
ON CONFLICT (slug) DO NOTHING;
