# Próximos Passos & Contexto

## 1. O que ficou feito nesta sessão?
- [x] **Estatísticas (/stats):** Página com gráficos de vitórias e recordes.
- [x] **Mapas:** Integração do Google Maps na página de jogo com botão de direções.
- [x] **Calendário (.ics):** API para subscrever calendário no telemóvel.
- [x] **Histórico:** Script `scraper/seed_history.py` e workflow do GitHub para carregar épocas passadas (23/24, 24/25).
- [x] **Código Refatorizado:** Scraper dividido em `main.py` e `fpb_parser.py` para reutilização.

## 2. Ações Pendentes (Para o Utilizador)

### Passo A: Prepara a Base de Dados (Supabase)
Corre este SQL no editor do Supabase para adicionar a coluna `epoca`:

```sql
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS epoca TEXT DEFAULT '2025/2026';
UPDATE partidas SET epoca = '2025/2026' WHERE epoca IS NULL;
CREATE INDEX IF NOT EXISTS idx_partidas_epoca ON partidas(epoca);
```

### Passo B: Carregar Histórico
Como já fizeste o push do código, agora podes carregar os dados antigos sem sujar o teu computador:
1. Vai ao GitHub do projeto -> Tab **Actions**.
2. Clica em **Seed History Data** (na esquerda).
3. Clica **Run workflow**.
4. Espera 2 minutos e a página de Estatísticas vai ficar cheia de dados!

---

## 3. Para a Próxima Conversa: Gerador de Imagens

**Objetivo:** Criar ferramenta para gerar posts de Instagram automáticos.

**Setup já definido:**
- **Local:** `tools/image-generator/` (mesmo repo)
- **Linguagem:** Python
- **Funcionalidades:** 
    - Ler jogos da semana do Supabase.
    - Gerar imagens "GameDay", "Agenda" e "Resultados".
    - Estilo: Fundo escuro, texto repetido, logos FPB, sem blurs complexos.

**Comando para começar:**
"Lê o ficheiro `NEXT_STEPS.md` e começa o Gerador de Imagens."
