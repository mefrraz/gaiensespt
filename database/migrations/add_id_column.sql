-- Adicionar coluna id (internalID da FPB) para ligação às fichas de jogo
ALTER TABLE games_2025_2026 ADD COLUMN IF NOT EXISTS id TEXT;
