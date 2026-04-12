-- ============================================================
-- Site Survey / Pre-Arrival Checklist
-- Captures all pre-install data: access, electrical, photos, etc.
-- ============================================================

-- 1. Main survey table
CREATE TABLE IF NOT EXISTS site_surveys (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),

  -- Link to CRM (optional)
  deal_id       UUID REFERENCES deals(id) ON DELETE SET NULL,
  account_id    UUID REFERENCES accounts(id) ON DELETE SET NULL,

  -- Service info
  service_type  TEXT NOT NULL,  -- maintenance | repair | installation | removal | relocation | inspection
  equipment_type TEXT,          -- vertical_baler | horizontal_baler | auto_tie | two_ram | compactor | other
  work_description TEXT,

  -- Requestor (person filling out the form)
  requestor_name    TEXT NOT NULL,
  requestor_email   TEXT,
  requestor_phone   TEXT NOT NULL,
  requestor_company TEXT,

  -- On-site contact (may differ from requestor)
  onsite_contact_name   TEXT,
  onsite_contact_phone  TEXT,
  onsite_contact_role   TEXT,

  -- Site address
  site_address      TEXT NOT NULL,
  site_city         TEXT,
  site_state        TEXT,
  site_zip          TEXT,

  -- Site access
  gate_or_security  BOOLEAN DEFAULT false,
  gate_details      TEXT,           -- guardshack, gate code, check-in process
  dock_access       BOOLEAN DEFAULT true,
  dock_details      TEXT,           -- which dock, ground level, etc.
  floor_level       TEXT,           -- ground, 2nd floor, basement, mezzanine
  elevator_available BOOLEAN DEFAULT false,

  -- Choke points / clearance
  choke_width_inches    NUMERIC,    -- narrowest doorway/passage width
  choke_height_inches   NUMERIC,    -- narrowest doorway/passage height
  ceiling_height_feet   NUMERIC,    -- overhead clearance at install location
  path_description      TEXT,       -- description of path from dock to equipment location

  -- Electrical
  electrical_voltage    TEXT,       -- 208V, 240V, 480V, unknown
  electrical_phase      TEXT,       -- single, three, unknown
  electrical_amperage   TEXT,       -- 30A, 60A, 100A, unknown
  disconnect_in_place   BOOLEAN DEFAULT false,
  electrical_distance_ft NUMERIC,  -- distance from panel to equipment location
  electrical_notes      TEXT,

  -- Available equipment on site
  forklift_available    BOOLEAN DEFAULT false,
  forklift_capacity_lbs NUMERIC,
  other_equipment       TEXT,       -- pallet jack, crane, etc.

  -- Scheduling
  preferred_date        DATE,
  preferred_time_window TEXT,       -- morning, afternoon, anytime

  -- Special instructions
  special_instructions  TEXT,
  hazardous_materials   BOOLEAN DEFAULT false,
  hazmat_details        TEXT,

  -- Photos stored as array of Supabase Storage paths
  photos_equipment     TEXT[] DEFAULT '{}',   -- current equipment or install location
  photos_access        TEXT[] DEFAULT '{}',   -- access points, choke points, dock
  photos_electrical    TEXT[] DEFAULT '{}',   -- panel, disconnect, wiring
  photos_facility      TEXT[] DEFAULT '{}',   -- overhead view, general facility

  -- Acknowledgment
  accuracy_acknowledged BOOLEAN DEFAULT false,  -- "I understand inaccurate data may cause delays/charges"
  submitted_at         TIMESTAMPTZ,

  -- Status tracking
  status TEXT DEFAULT 'submitted'  -- submitted | reviewed | scheduled | completed
);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_site_surveys_status ON site_surveys(status);
CREATE INDEX IF NOT EXISTS idx_site_surveys_created ON site_surveys(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_surveys_deal ON site_surveys(deal_id);
CREATE INDEX IF NOT EXISTS idx_site_surveys_account ON site_surveys(account_id);

-- RLS: allow anonymous inserts (form submission), admin reads via service role
ALTER TABLE site_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON site_surveys
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated reads" ON site_surveys
  FOR SELECT USING (true);

-- 2. Storage bucket for survey photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-survey-photos',
  'site-survey-photos',
  true,
  10485760,  -- 10MB max per file
  ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to the bucket (form users)
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'site-survey-photos');

-- Allow public reads (so admin can view photos)
CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-survey-photos');
