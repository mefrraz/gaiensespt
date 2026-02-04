# Prompt: Melhorar Categorização das Classificações Históricas

## 🎯 Objetivo
Re-fazer o *scrape* das tabelas de classificação das épocas passadas (2022-2025) para que apareçam separadas por **Escalão/Equipa** (ex: "Sub 18", "Séniores") em vez de usarem o título genérico da competição.

## 📄 Contexto
Atualmente, o script `scrapers/scrape_history.js` extrai o nome da competição do site. O utilizador forneceu o **Mapeamento Oficial** para usarmos nomes limpos.

## 🛠 O que é preciso fazer (Instruções para a IA)

1.  **Modificar `scrapers/scrape_history.js`**:
    *   Substituir o array de strings por objetos com `{ id, url, name }`.
    *   Usar a propriedade `name` para inserir na base de dados (coluna `competicao`).

2.  **Mapeamento de Links (CONFIRMADO)**

    ```javascript
    const SEASONS_CONFIG = {
        "2024_2025": [
            // XII Campeonato Nacional da 1ª Divisão Masculina
            { id: "10392", name: "Séniores", url: "https://resultados.tugabasket.com/standings?competitionId=10392" },
            // Campeonato Distrital 1ª Divisão Sub14 masculinos (Nota: IDs podem estar trocados no original, verificar ordem!)
            { id: "10487", name: "Sub 14", url: "https://resultados.tugabasket.com/standings?competitionId=10487" },
            // Sub 18
            { id: "10478", name: "Sub 18", url: "https://resultados.tugabasket.com/standings?competitionId=10478" },
            // Sub 16
            { id: "10476", name: "Sub 16", url: "https://resultados.tugabasket.com/standings?competitionId=10476" }
        ],
        "2023_2024": [
            // Sub 18
            { id: "9970", name: "Sub 18", url: "https://resultados.tugabasket.com/standings?competitionId=9970" },
            // Sub 16
            { id: "9972", name: "Sub 16", url: "https://resultados.tugabasket.com/standings?competitionId=9972" },
            // Sub 14
            { id: "9974", name: "Sub 14", url: "https://resultados.tugabasket.com/standings?competitionId=9974" },
            // XI Campeonato Nacional (Séniores)
            { id: "9863", name: "Séniores", url: "https://resultados.tugabasket.com/standings?competitionId=9863" }
        ],
        "2022_2023": [
            // X Campeonato Nacional (Séniores)
            { id: "9319", name: "Séniores", url: "https://resultados.tugabasket.com/standings?competitionId=9319" },
            // Sub 14
            { id: "9415", name: "Sub 14", url: "https://resultados.tugabasket.com/standings?competitionId=9415" },
            // Sub 16
            { id: "9416", name: "Sub 16", url: "https://resultados.tugabasket.com/standings?competitionId=9416" },
            // Sub 18
            { id: "9417", name: "Sub 18", url: "https://resultados.tugabasket.com/standings?competitionId=9417" }
        ]
    };
    ```
    *(Nota: A ordem dos IDs na mensagem do user para 2024/2025 pareceu ligeiramente diferente da ordem padrão, verifica sempre se o ID corresponde ao nome no array acima. Eu tentei alinhar pelo ID).*

## ⚠️ Dicas Técnicas e "Gotchas" (Lições Aprendidas)
Para quem for implementar isto, cuidado com:

1.  **Endpoint Correto**: Não uses `/getCompetitionDetails` para scraping de classificação histórica. Esse endpoint mostra apenas RESULTADOS de jogos por omissão. Tens de transformar o link para `/standings?competitionId=XXXX` (como já está no mapa acima).
2.  **Dropdown de Fases**: As classificações estão escondidas num `<select id="phaseId">`. O scraper atual **já sabe lidar com isto** (itera todas as opções). Não mudes essa lógica de iteração.
3.  **Parsers de HTML**: As tabelas não estão dentro de cartões (`.card`) típicos. O scraper atual procura `table.standings`. Mantém isso.
4.  **Colunas em Falta**: A tabela `classificacoes_YYYY_YYYY` na BD **NÃO TEM** colunas para `GM` (Golos Marcados) nem `GS` (Golos Sofridos). Tenta inserir apenas: `competicao, grupo, equipa, posicao, jogos, vitorias, derrotas, pontos`. Se tentares inserir GM/GS, vai dar erro de SQL.
5.  **Limpeza**: Lembra-te de fazer `TRUNCATE` às tabelas antes de inserir, senão ficas com "Séniores" e "XII Campeonato..." duplicados.

## 🚀 Comando para Executar
```bash
# Depois de editar o scrape_history.js
node scrapers/scrape_history.js
```
