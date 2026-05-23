CREATE TABLE IF NOT EXISTS public.competitions (
    competition_id integer NOT NULL,
    competition_name text NOT NULL,
    association_id integer NOT NULL,
    association_name text NOT NULL,
    season text NOT NULL,
    club_names text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (competition_id, season)
);

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON public.competitions FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow insert/update for service role"
ON public.competitions FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);

CREATE POLICY "Allow update for service role"
ON public.competitions FOR UPDATE
TO anon, authenticated, service_role
USING (true);

CREATE INDEX IF NOT EXISTS idx_competitions_season
ON public.competitions(season);

CREATE INDEX IF NOT EXISTS idx_competitions_club_names
ON public.competitions USING GIN (club_names);
