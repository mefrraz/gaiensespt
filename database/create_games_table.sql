-- Create a unified 'games' table
CREATE TABLE IF NOT EXISTS public.games (
    slug text PRIMARY KEY,
    data text, -- ISO date string from scraper
    hora text,
    equipa_casa text,
    equipa_fora text,
    resultado_casa integer,
    resultado_fora integer,
    escalao text,
    competicao text,
    local text,
    logotipo_casa text,
    logotipo_fora text,
    status text,
    epoca text, -- Essential for filtering by season (e.g., '2024/2025')
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.games FOR SELECT USING (true);

-- Migration: Insert data from existing tables if they exist
-- 2023/2024
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'partidas_2023_2024') THEN
        INSERT INTO public.games (slug, data, hora, equipa_casa, equipa_fora, resultado_casa, resultado_fora, escalao, competicao, local, logotipo_casa, logotipo_fora, status, epoca)
        SELECT slug, data, hora, equipa_casa, equipa_fora, resultado_casa, resultado_fora, escalao, competicao, local, logotipo_casa, logotipo_fora, status, '2023/2024'
        FROM public.partidas_2023_2024
        ON CONFLICT (slug) DO NOTHING;
    END IF;
END $$;

-- 2024/2025
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'partidas_2024_2025') THEN
        INSERT INTO public.games (slug, data, hora, equipa_casa, equipa_fora, resultado_casa, resultado_fora, escalao, competicao, local, logotipo_casa, logotipo_fora, status, epoca)
        SELECT slug, data, hora, equipa_casa, equipa_fora, resultado_casa, resultado_fora, escalao, competicao, local, logotipo_casa, logotipo_fora, status, '2024/2025'
        FROM public.partidas_2024_2025
        ON CONFLICT (slug) DO NOTHING;
    END IF;
END $$;

-- 2025/2026
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'partidas_2025_2026') THEN
        INSERT INTO public.games (slug, data, hora, equipa_casa, equipa_fora, resultado_casa, resultado_fora, escalao, competicao, local, logotipo_casa, logotipo_fora, status, epoca)
        SELECT slug, data, hora, equipa_casa, equipa_fora, resultado_casa, resultado_fora, escalao, competicao, local, logotipo_casa, logotipo_fora, status, '2025/2026'
        FROM public.partidas_2025_2026
        ON CONFLICT (slug) DO NOTHING;
    END IF;
END $$;
