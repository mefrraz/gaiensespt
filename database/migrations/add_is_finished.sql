ALTER TABLE public.classificacoes
ADD COLUMN IF NOT EXISTS is_finished boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_classificacoes_is_finished
ON public.classificacoes(is_finished);
