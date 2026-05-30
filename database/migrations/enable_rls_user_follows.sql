-- Clerk Auth + RLS para user_follows
-- ===================================
-- Executar DEPOIS de configurar Clerk JWT template + Supabase Clerk connection

-- 1. Reativar RLS
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- 2. Política de leitura: cada user vê apenas os seus próprios follows
--    auth.uid()::text = user_id  →  compatível com Clerk IDs (user_2abc123)
CREATE POLICY "Users read own follows" ON user_follows
    FOR SELECT USING (auth.uid()::text = user_id);

-- 3. Política de inserção: cada user só pode inserir follows com o seu user_id
CREATE POLICY "Users insert own follows" ON user_follows
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 4. Política de remoção: cada user só pode remover os seus próprios follows
CREATE POLICY "Users delete own follows" ON user_follows
    FOR DELETE USING (auth.uid()::text = user_id);
