-- Table for competition metadata, including logo references
CREATE TABLE IF NOT EXISTS competitions_meta (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    abrev TEXT NOT NULL,
    gradient_from TEXT NOT NULL,
    gradient_to TEXT NOT NULL,
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE competitions_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access competitions_meta"
ON competitions_meta FOR SELECT
USING (true);

-- Seed data for known competitions
INSERT INTO competitions_meta (id, name, abrev, gradient_from, gradient_to) VALUES
    (10902, 'Liga Betclic Masculina', 'LBM', 'from-blue-600', 'to-blue-800'),
    (10906, 'Liga Betclic Feminina', 'LBF', 'from-pink-500', 'to-rose-600'),
    (10903, 'Proliga', 'PR', 'from-emerald-500', 'to-emerald-700'),
    (10907, '1ª Divisão Feminina', '1DF', 'from-violet-500', 'to-purple-700'),
    (10904, '1ª Divisão Masculina', '1DM', 'from-amber-500', 'to-orange-700'),
    (10917, 'Taça Hugo dos Santos', 'THS', 'from-yellow-500', 'to-yellow-700'),
    (10920, 'Supertaça Feminina', 'SF', 'from-cyan-500', 'to-cyan-700'),
    (10905, '2ª Divisão Masculina', '2DM', 'from-red-500', 'to-red-700'),
    (10908, '2ª Divisão Feminina', '2DF', 'from-teal-500', 'to-teal-700'),
    (10909, 'Liga BCR', 'BCR', 'from-indigo-500', 'to-indigo-700')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    abrev = EXCLUDED.abrev,
    gradient_from = EXCLUDED.gradient_from,
    gradient_to = EXCLUDED.gradient_to;