# Planeamento do Ecossistema Digital: FC Gaia (Basquetebol)

## 1. Visão Geral e Objetivo Final
O objetivo é a criação de um **ecossistema digital autónomo** para o FC Gaia (Basquetebol). O sistema deve funcionar sem intervenção humana, realizando a extração, armazenamento e exibição de dados de forma totalmente automatizada.

* **Produto Final:** Um website público (Agenda + Resultados) atualizado quase em tempo real durante os períodos de competição.

---

## 2. Cronograma de Atualização (GitHub Actions)
O sistema utilizará **GitHub Actions** para garantir que os resultados são capturados assim que os jogos terminam. A configuração deve ser feita via expressões Cron no ficheiro `.yml`.

### Janelas Temporais:
* **Dias de Semana (Seg-Sex):** 15:00 e 21:00.
* **Fins de Semana e Feriados:** 11:00, 13:00, 15:00, 17:00, 18:30, 20:00 e 21:30.

> **Nota:** A IA deve configurar múltiplas expressões Cron para cobrir estas janelas de forma eficiente.

---

## 3. Análise Detalhada do Funcionamento (Web Scraping FPB)

### A. Lógica de Agrupamento Temporal
O site da FPB agrupa os jogos por blocos de data utilizando a classe `div.day-wrapper`. 

1.  O scraper deve primeiro ler o `h3.date`.
2.  Dentro de cada bloco, deve iterar por todos os `a.game-wrapper-a`.
3.  **Deteção de Mudança:** Se um jogo for alterado de data, o scraper deve atualizar o registo com base na hierarquia do `day-wrapper`.

### B. Diferenciação de Conteúdo
O sistema deve distinguir entre jogos futuros e passados:

| Tipo de Página | Foco Principal | Campo Crítico | Lógica Específica |
| :--- | :--- | :--- | :--- |
| **Agenda** | Jogos Futuros | `.hour h3` | Tratar "A definir" como string válida. |
| **Resultados** | Jogos Passados | `.results_wrapper` | Identificar vencedor via classe CSS `.victory_font`. |

---

## 4. Arquitetura da Base de Dados (Supabase)

Os dados serão persistidos na tabela `partidas` com a seguinte lógica de integridade:

* **`slug` (PK):** Chave única gerada pelo padrão `DATA-EQUIPACASA-EQUIPAFORA` (ex: `2026-01-31-fcgaia-scbraga`). 
    * *Objetivo:* Impedir duplicados durante as múltiplas execuções diárias do scraper.
* **`status`:** Enum para controlo de estado do jogo:
    * `AGENDADO`
    * `A DECORRER`
    * `FINALIZADO`