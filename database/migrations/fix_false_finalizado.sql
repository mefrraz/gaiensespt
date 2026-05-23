-- Fix: Jogos que foram incorretamente marcados como FINALIZADO pelo scraper
-- devido ao fallback .victory_font que marcava jogos sem resultados como terminados
UPDATE games_2025_2026
SET status = 'AGENDADO',
    updated_at = NOW()
WHERE status = 'FINALIZADO'
  AND resultado_casa IS NULL
  AND resultado_fora IS NULL;
