-- Add 'epoca' column to 'partidas' table
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS epoca TEXT DEFAULT '2025/2026';

-- Update existing rows to current season
UPDATE partidas SET epoca = '2025/2026' WHERE epoca IS NULL;

-- Create an index on epoca for filtering
CREATE INDEX IF NOT EXISTS idx_partidas_epoca ON partidas(epoca);
