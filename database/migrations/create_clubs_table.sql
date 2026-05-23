CREATE TABLE IF NOT EXISTS public.clubs (
    id integer PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    search_name text NOT NULL,
    logo_url text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.clubs FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert/update for service role" ON public.clubs FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);
CREATE POLICY "Allow update for service role" ON public.clubs FOR UPDATE TO anon, authenticated, service_role USING (true);

CREATE INDEX IF NOT EXISTS idx_clubs_search ON public.clubs (search_name);
CREATE INDEX IF NOT EXISTS idx_clubs_slug ON public.clubs (slug);
