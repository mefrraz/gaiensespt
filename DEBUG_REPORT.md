# Relatório de Debug: Histórico em Falta

## 🚨 O Problema
O script de seeding (`seed_history.py`) correu com sucesso no GitHub Actions e os logs indicaram a inserção de dados para as épocas **2023/2024** e **2024/2025** (aprox. 133 registos cada).
Contudo, o utilizador reporta que no Supabase existem apenas **~132 registos no total** e as épocas antigas parecem estar em falta.

## 🔍 Contexto Técnico
- **Script:** `scraper/seed_history.py` usa `fpb_parser.py`.
- **Mecanismo:** UPSERT baseado na coluna `slug` (Unique).
- **Slug:** Formato `YYYY-MM-DD-equipa1-equipa2`.
- **Resultados Esperados:** ~266 registos totais.
- **Resultados Reais:** ~132 registos (apenas uma época?).

## 🧪 Hipóteses para Investigação
1. **Sobrescrita (Updates em vez de Inserts):**
   - Se os jogos de 24/25 já existiam na base de dados (do scraper diário), o seed apenas os atualizou. Isso explica a contagem não subir para 24/25, mas não explica a ausência de 23/24.
2. **Erro na Geração do Slug:**
   - Será que o parser está a assumir o ano incorreto para 23/24 (ex: usando o ano atual) e a gerar slugs que colidem com os jogos recentes?
3. **Filtros ou RLS no Supabase:**
   - O utilizador pode estar a ver uma "View" filtrada ou o RLS pode estar a esconder dados (improvável, pois RLS está public).
   - O SQL `ALTER TABLE` pode não ter propagado corretamente (embora o parser envie o campo `epoca`).

## 🛠️ Próximos Passos (Para o Próximo Agente)
O teu objetivo é resolver este mistério. Podes pedir ao utilizador para executar comandos.

1.  **Diagnóstico SQL:**
    Pede ao utilizador para correr isto no SQL Editor do Supabase para ver a distribuição real:
    ```sql
    SELECT epoca, count(*) FROM partidas GROUP BY epoca;
    SELECT * FROM partidas WHERE epoca = '2023/2024' LIMIT 5;
    ```

2.  **Verificar Parser:**
    Analisa `scraper/fpb_parser.py`. Verifica como a data é processada. Se o site da FPB em 23/24 não tiver o ano explícito ou tiver um formato diferente, o `datetime.date` pode estar a falhar.

3.  **Debug Script:**
    Se necessário, cria um script python pequeno que imprime os slugs gerados para 23/24 sem escrever na BD, para verificar se são únicos.

## 📂 Ficheiros Relevantes
- `scraper/seed_history.py`
- `scraper/fpb_parser.py`
- `.github/workflows/seed_history.yml`
