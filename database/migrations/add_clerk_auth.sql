-- Clerk Auth Migration
-- ====================
-- Executar na Supabase SQL Editor (1ª parte — preparação)
-- Depois de configurar Clerk + Supabase JWT, executar enable_rls_user_follows.sql

-- 1. Drop FK constraint para auth.users (Clerk gere users)
ALTER TABLE user_follows DROP CONSTRAINT IF EXISTS user_follows_user_id_fkey;

-- 2. Apagar RLS policies antigas (se existirem)
DROP POLICY IF EXISTS "Users read own follows" ON user_follows;
DROP POLICY IF EXISTS "Users insert own follows" ON user_follows;
DROP POLICY IF EXISTS "Users delete own follows" ON user_follows;

-- 3. Manter RLS desligado temporariamente — vamos reativar depois
--    de configurar Clerk JWT + Supabase JWT provider
ALTER TABLE user_follows DISABLE ROW LEVEL SECURITY;

-- 4. Apagar dados de teste antigos (UUIDs do Supabase Auth)
DELETE FROM user_follows;

-- 5. Mudar tipo UUID → TEXT (Clerk IDs: user_2abc123)
ALTER TABLE user_follows ALTER COLUMN user_id TYPE TEXT;

-- 6. Index para performance
CREATE INDEX IF NOT EXISTS idx_user_follows_user_id ON user_follows(user_id);

-- ⚠️ PRÓXIMO PASSO (após configurar dashboard):
-- Executar enable_rls_user_follows.sql para reativar RLS com Clerk
SELECT 'Base pronta. Falta configurar Clerk JWT + Supabase JWT provider + enable_rls_user_follows.sql' AS status;
