-- Permitir que o anon key (frontend) possa inserir e atualizar jogos
-- Necessário porque o useGames hook faz upsert para cache partilhado

CREATE POLICY "Allow public insert" ON games_2025_2026 FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON games_2025_2026 FOR UPDATE USING (true) WITH CHECK (true);

-- Políticas para épocas passadas também
CREATE POLICY "Allow public insert" ON games_2024_2025 FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON games_2024_2025 FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public insert" ON games_2023_2024 FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON games_2023_2024 FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public insert" ON games_2022_2023 FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON games_2022_2023 FOR UPDATE USING (true) WITH CHECK (true);
