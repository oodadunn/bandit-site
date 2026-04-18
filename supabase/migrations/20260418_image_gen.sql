-- ============================================================
-- Image Generation Pipeline
-- Gemini 2.5 Flash Image for Bandit blog/post hero images.
-- Budget caps + kill switch + generation log.
-- ============================================================

-- 1. Config (singleton row — simple on/off + budget caps)
CREATE TABLE IF NOT EXISTS image_gen_config (
  id              SMALLINT PRIMARY KEY DEFAULT 1,
  enabled         BOOLEAN NOT NULL DEFAULT true,
  daily_cap       INT NOT NULL DEFAULT 30,
  monthly_cap     INT NOT NULL DEFAULT 500,
  model           TEXT NOT NULL DEFAULT 'gemini-2.5-flash-image-preview',
  mascot_ref_path TEXT NOT NULL DEFAULT 'reference/bandit-mascot-1k.png',
  baler_ref_path  TEXT NOT NULL DEFAULT 'reference/bandit-baler-1k.png',
  updated_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);

INSERT INTO image_gen_config (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 2. Generation log — one row per Gemini call (success or fail)
CREATE TABLE IF NOT EXISTS image_gen_log (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  post_id     UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
  post_slug   TEXT,
  prompt      TEXT NOT NULL,
  model       TEXT NOT NULL,
  status      TEXT NOT NULL,          -- 'success' | 'failed' | 'blocked'
  error       TEXT,
  image_url   TEXT,
  cost_cents  NUMERIC(8,2) DEFAULT 4, -- ~$0.04/image at gemini-2.5-flash-image
  trigger     TEXT NOT NULL,          -- 'manual' | 'auto_publish' | 'backfill' | 'bootstrap'
  duration_ms INT
);

CREATE INDEX IF NOT EXISTS idx_image_gen_log_created ON image_gen_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_gen_log_post ON image_gen_log(post_id);
CREATE INDEX IF NOT EXISTS idx_image_gen_log_status ON image_gen_log(status);

-- 3. Helper: count generations in a time window (used by budget guard)
CREATE OR REPLACE FUNCTION image_gen_count_since(since TIMESTAMPTZ)
RETURNS INT LANGUAGE sql STABLE AS $$
  SELECT COUNT(*)::INT
  FROM image_gen_log
  WHERE status = 'success' AND created_at >= since;
$$;

-- 4. RLS — only service role reads/writes these tables (admin API uses service role)
ALTER TABLE image_gen_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_gen_log ENABLE ROW LEVEL SECURITY;
-- No policies created => only service_role bypass works. Anon key cannot read or write.

-- 5. Storage buckets — blog-images (public) and reference (public, small)
--    Supabase storage buckets are created via the Storage API or dashboard,
--    but we can ensure they exist via storage.buckets insert.
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('reference', 'reference', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read policy on both buckets
DROP POLICY IF EXISTS "Public read blog-images" ON storage.objects;
CREATE POLICY "Public read blog-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Public read reference" ON storage.objects;
CREATE POLICY "Public read reference" ON storage.objects
  FOR SELECT USING (bucket_id = 'reference');
-- Writes to both buckets require service_role (no insert policy for anon).
