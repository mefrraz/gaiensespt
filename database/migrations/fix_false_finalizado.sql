-- Fix: Jogos que foram incorretamente marcados como FINALIZADO pelo scraper
-- devido ao fallback .victory_font que marcava jogos sem resultados como terminados

-- 1. Reset status to AGENDADO for games erroneously marked FINALIZADO without scores
UPDATE games_2025_2026
SET status = 'AGENDADO',
    updated_at = NOW()
WHERE status = 'FINALIZADO'
  AND resultado_casa IS NULL
  AND resultado_fora IS NULL;

-- 2. Recover empty hora from FPB calendar for 2026-05-23
UPDATE games_2025_2026 SET hora = '16:30', updated_at = NOW() WHERE slug = '2026-05-23-fc-gaia-a-esgueira-oli';
UPDATE games_2025_2026 SET hora = '18:30', updated_at = NOW() WHERE slug = '2026-05-23-fc-gaia-a-oliveirense';
UPDATE games_2025_2026 SET hora = '21:30', updated_at = NOW() WHERE slug = '2026-05-23-fc-gaia-acr-vale-cambra';
