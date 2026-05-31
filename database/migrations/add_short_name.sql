-- Add short_name column to clubs table
-- Stores the abbreviated/display name (e.g. "FC Gaia" for "Futebol Clube de Gaia")

ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS short_name text;

COMMENT ON COLUMN public.clubs.short_name IS 'Abbreviated display name (e.g. FC Gaia, FC Porto, SL Benfica)';
