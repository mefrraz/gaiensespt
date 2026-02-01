-- Create the table for matches (partidas)
CREATE TABLE IF NOT EXISTS partidas (
    slug TEXT PRIMARY KEY,
    data DATE NOT NULL,
    hora TIME,
    equipa_casa TEXT NOT NULL,
    equipa_fora TEXT NOT NULL,
    resultado_casa INTEGER,
    resultado_fora INTEGER,
    escalao TEXT,
    competicao TEXT,
    local TEXT,
    logotipo_casa TEXT,
    logotipo_fora TEXT,
    status TEXT CHECK (status IN ('AGENDADO', 'A DECORRER', 'FINALIZADO')) DEFAULT 'AGENDADO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE partidas ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Public read access"
ON partidas FOR SELECT
USING (true);

-- Policy: Allow write access only to service role (backend)
-- Note: In Supabase, the service role bypasses RLS, but it's good practice to have explicit policies or just leave it closed to anon/authenticated users for writing.
-- We will NOT create a policy for INSERT/UPDATE for 'anon' or 'authenticated' roles, effectively restricting it to the service role.

-- Create an index on data for faster sorting/filtering
CREATE INDEX idx_partidas_data ON partidas(data);

-- Create an index on escalao for filtering
CREATE INDEX idx_partidas_escalao ON partidas(escalao);
