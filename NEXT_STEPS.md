# Próximos Passos & Contexto

## 1. O que ficou feito nesta sessão?
- [x] **Estatísticas (/stats):** Página com gráficos de vitórias e recordes.
- [x] **Mapas:** Integração do Google Maps na página de jogo com botão de direções.
- [x] **Calendário (.ics):** API para subscrever calendário no telemóvel.
- [x] **Histórico:** Script `scraper/seed_history.py` e workflow do GitHub para carregar épocas passadas (23/24, 24/25).
- [x] **Código Refatorizado:** Scraper dividido em `main.py` e `fpb_parser.py` para reutilização.

## 2. Ações Pendentes (Para o Utilizador)

### Passo A: Prepara a Base de Dados (Supabase)
- [x] Corre este SQL no editor do Supabase para adicionar a coluna `epoca`.
- [x] Carregar Histórico (Feito via GitHub Actions).

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
