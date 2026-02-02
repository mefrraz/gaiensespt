-- Create tables for each season based on the existing 'partidas' schema
-- Note: Adjust types if your actual schema differs slightly. 
-- Assuming standard text/integer types for the fields used in the scraper.

-- 2023/2024 Season
CREATE TABLE public.partidas_2023_2024 (
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
    epoca text, -- Keeping this for consistency, though the table name implies it
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2024/2025 Season
CREATE TABLE public.partidas_2024_2025 (
    slug text PRIMARY KEY,
    data text,
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
    epoca text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2025/2026 Season (Current)
CREATE TABLE public.partidas_2025_2026 (
    slug text PRIMARY KEY,
    data text,
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
    epoca text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS (Row Level Security) if needed - assumed public read is fine for now
ALTER TABLE public.partidas_2023_2024 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.partidas_2023_2024 FOR SELECT USING (true);

ALTER TABLE public.partidas_2024_2025 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.partidas_2024_2025 FOR SELECT USING (true);

ALTER TABLE public.partidas_2025_2026 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.partidas_2025_2026 FOR SELECT USING (true);
