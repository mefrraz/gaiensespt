# FPB.pt — Referência Completa de API (Engenharia Reversa)

> **Origem:** Análise de tráfego HAR + código-fonte JavaScript do tema WordPress `fpbasquetebol` (versão 6.9).  
> **Base URL:** `https://www.fpb.pt`  
> **Servidor de media:** `https://sav2.fpb.pt`  
> **AJAX endpoint único:** `https://www.fpb.pt/wp-admin/admin-ajax.php`  
> **Autenticação:** Nenhuma. Todos os endpoints são públicos e sem token.  
> **Plataforma:** WordPress com tema custom `fpbasquetebol`. Toda a lógica de dados passa por `admin-ajax.php` com diferentes `action` values.

---

## Índice

1. [Arquitectura Geral](#1-arquitectura-geral)
2. [Endpoint Central — admin-ajax.php](#2-endpoint-central--admin-ajaxphp)
3. [Action: get_more_days — Calendário e Resultados](#3-action-get_more_days--calendário-e-resultados)
4. [Action: get_competicoes — Lista de Competições](#4-action-get_competicoes--lista-de-competições)
5. [Action: get_phase — Fases de uma Competição](#5-action-get_phase--fases-de-uma-competição)
6. [Action: build_live_games — Jogos em Curso](#6-action-build_live_games--jogos-em-curso)
7. [Action: get_game_live_details — Score em Tempo Real](#7-action-get_game_live_details--score-em-tempo-real)
8. [Action: get_game_layer — Boxscore Completo do Jogo](#8-action-get_game_layer--boxscore-completo-do-jogo)
9. [Páginas HTML com Dados Estruturados](#9-páginas-html-com-dados-estruturados)
10. [IDs de Competições Conhecidos](#10-ids-de-competições-conhecidos)
11. [IDs de Clubes Conhecidos e Padrões de URL](#11-ids-de-clubes-conhecidos-e-padrões-de-url)
12. [Servidor de Media sav2.fpb.pt](#12-servidor-de-media-sav2fpbpt)
13. [Sistema de Filtros — Valores Válidos](#13-sistema-de-filtros--valores-válidos)
14. [Estruturas de Dados das Respostas](#14-estruturas-de-dados-das-respostas)
15. [Estratégias de Scraping Recomendadas](#15-estratégias-de-scraping-recomendadas)
16. [Exemplos de Pedidos curl Prontos a Usar](#16-exemplos-de-pedidos-curl-prontos-a-usar)

---

## 1. Arquitectura Geral

```
┌─────────────────────────────────────────────────────────┐
│                      fpb.pt (WordPress)                 │
│                                                         │
│  Páginas HTML server-side:                              │
│    /calendario/clube_<ID>/   → calendário de clube      │
│    /calendario/              → calendário geral         │
│    /ficha-de-jogo            → ficha/stats de jogo      │
│    /classificacao/           → tabela classificação     │
│    /estatisticas/            → estatísticas da época    │
│                                                         │
│  AJAX endpoint (todos os dados dinâmicos):              │
│    /wp-admin/admin-ajax.php                             │
│    Actions: get_more_days, get_competicoes,             │
│             get_phase, build_live_games,                │
│             get_game_live_details, get_game_layer       │
└─────────────────────────────────────────────────────────┘
                          │
                          │ media / imagens
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    sav2.fpb.pt                          │
│  Servidor de backend de dados e media                   │
│  /uploads/clubes/logotipo/   → logos actuais            │
│  /old_uploads/CLU/           → logos históricos         │
│  /uploads/clubes/capa/       → capas dos clubes         │
└─────────────────────────────────────────────────────────┘
```

**Notas críticas de arquitectura:**
- O WordPress atribui a variável JavaScript global `my_ajax_object.ajax_url` com o valor `https://www.fpb.pt/wp-admin/admin-ajax.php`. Este é o único endpoint AJAX.
- As respostas das actions são maioritariamente **HTML renderizado** (não JSON puro). Quando há JSON, é um envelope simples com o HTML dentro.
- Os dados de jogos são **server-side rendered** no PHP — não há GraphQL nem REST API própria da FPB.
- O site tem WordPress versão 6.9 (inferido dos query strings `?ver=6.9`).
- **Não existe paginação** no sentido tradicional. O sistema usa `period` (janela de datas) com infinite scroll. Ao fazer scroll, o JS carrega mais 30 dias via `get_more_days`.

---

## 2. Endpoint Central — admin-ajax.php

```
URL:    https://www.fpb.pt/wp-admin/admin-ajax.php
Método: GET ou POST (varia por action — ver cada secção)
Auth:   Nenhuma
CORS:   Não verificado (usar a partir de servidor, não de browser de outro domínio)
```

Todos os pedidos incluem obrigatoriamente o parâmetro `action`. Os restantes parâmetros são filtros opcionais ou obrigatórios dependendo da action.

---

## 3. Action: get_more_days — Calendário e Resultados

**O endpoint mais importante.** Devolve jogos (passados e futuros) filtrados por época, escalão, género, competição, fase, clube e período de datas.

### Método
```
GET https://www.fpb.pt/wp-admin/admin-ajax.php
```

### Parâmetros

| Parâmetro    | Tipo    | Obrigatório | Descrição |
|--------------|---------|-------------|-----------|
| `action`     | string  | ✅ Sim       | Valor fixo: `get_more_days` |
| `epoca`      | string  | ✅ Sim       | Época desportiva. Formato: `YYYY/YYYY`. Ex: `2025/2026`. Disponível desde `2003/2004`. |
| `escalao`    | string  | ✅ Sim       | Escalão etário. Ver lista em [Secção 13](#13-sistema-de-filtros--valores-válidos). |
| `genero`     | string  | ✅ Sim       | `masculino` ou `feminino` |
| `competicao` | array   | ⚠️ Recomendado | ID(s) de competição. Pode ser um valor único ou array: `competicao[]=10903`. Se omitido, pode devolver todas ou nenhuma dependendo dos outros filtros. |
| `fase`       | string  | ❌ Opcional  | ID da fase/ronda dentro da competição. Obtido via `get_phase`. |
| `clube`      | integer | ❌ Opcional  | ID numérico do clube. **Se omitido, devolve jogos de todos os clubes da competição.** Este é o parâmetro chave para obter dados de um clube específico. |
| `associacao` | integer | ❌ Opcional  | ID da associação regional. `0` = nacional, outros valores = distritais. |
| `period`     | object  | ❌ Opcional  | Janela temporal. Ver estrutura abaixo. Se omitido, usa `RECENTES` (últimos 28 dias + próximos 28). |
| `wasLoadMore`| boolean | ❌ Opcional  | `true` quando é um pedido de infinite scroll (carregar mais). Usado internamente pelo JS. |

### Estrutura do parâmetro `period`

O `period` é um objecto serializado. Em GET, enviar como:

```
period[time_option]=RECENTES
```
```
period[time_option]=fromInit&period[from_date]=2025/01/01&period[to_date]=2025/06/30
```
```
period[time_option]=loadmore&period[from_date]=2025/03/01&period[to_date]=2025/03/31
```

| `time_option` | Comportamento |
|---------------|---------------|
| `RECENTES`    | Modo padrão: devolve jogos recentes (últimos ~28 dias) e próximos (~28 dias) |
| `fromInit`    | Janela de datas específica. Requer `from_date` e `to_date` no formato `YYYY/MM/DD` |
| `loadmore`    | Para infinite scroll. Requer `from_date` e `to_date`. O JS avança +30 dias a cada pedido. |

### Resposta

```json
{
  "result": "<string HTML com os blocos de jogos>",
  "hasmore": true
}
```

- `result`: HTML renderizado com os jogos agrupados por dia. Estrutura HTML detalhada na [Secção 14](#14-estruturas-de-dados-das-respostas).
- `hasmore`: `true` se existem mais jogos para carregar (mais datas disponíveis), `false` se é o fim.

### Exemplos de uso

**Todos os jogos da Proliga masculina 2025/2026 (TODOS os clubes, sem filtro de clube):**
```
GET /wp-admin/admin-ajax.php?action=get_more_days&epoca=2025/2026&escalao=Sénior&genero=masculino&competicao[]=10903&period[time_option]=fromInit&period[from_date]=2025/09/01&period[to_date]=2026/06/30
```

**Calendário completo do FC Porto (clube=120):**
```
GET /wp-admin/admin-ajax.php?action=get_more_days&epoca=2025/2026&escalao=Sénior&genero=masculino&clube=120&period[time_option]=fromInit&period[from_date]=2025/09/01&period[to_date]=2026/06/30
```

**Últimos resultados recentes (modo padrão):**
```
GET /wp-admin/admin-ajax.php?action=get_more_days&epoca=2025/2026&escalao=Sénior&genero=masculino&competicao[]=10903&period[time_option]=RECENTES
```

**Dados históricos de 2010/2011:**
```
GET /wp-admin/admin-ajax.php?action=get_more_days&epoca=2010/2011&escalao=Sénior&genero=masculino&competicao[]=<ID_EPOCA>&period[time_option]=fromInit&period[from_date]=2010/09/01&period[to_date]=2011/06/30
```

---

## 4. Action: get_competicoes — Lista de Competições

Devolve as competições disponíveis para uma dada combinação de época + escalão + género. Usar para descobrir os IDs de competição válidos para cada configuração.

### Método
```
POST https://www.fpb.pt/wp-admin/admin-ajax.php
Content-Type: application/x-www-form-urlencoded
```

### Parâmetros

| Parâmetro    | Tipo    | Obrigatório | Descrição |
|--------------|---------|-------------|-----------|
| `action`     | string  | ✅           | `get_competicoes` |
| `epoca`      | string  | ✅           | Ex: `2025/2026` |
| `escalao`    | string  | ✅           | Ex: `Sénior` |
| `genero`     | string  | ✅           | `masculino` ou `feminino` |
| `radio`      | boolean | ❌           | `true` para formato radio button (usado na UI do site) |
| `associacao` | integer | ❌           | ID de associação regional. `0` = todas (nacional). |
| `both`       | boolean | ❌           | `true` quando estamos na página de um clube (inclui competições nacionais e regionais) |

### Resposta

HTML com elementos `<li>` para cada competição:

```html
<li class="competicao option" data-id="10903" data-sigla="PROLIGA">
  <input type="radio" name="comp-option" data-id="10903" data-sigla="PROLIGA" value="PROLIGA" />
  <span>Proliga</span>
</li>
```

Os atributos relevantes por `<li>`:
- `data-id`: ID numérico da competição (usar em `competicao[]`)
- `data-sigla`: Sigla/código da competição
- `<span>` text: Nome completo legível

---

## 5. Action: get_phase — Fases de uma Competição

Devolve as fases/rondas disponíveis de uma competição (fase regular, playoffs, etc.).

### Método
```
POST https://www.fpb.pt/wp-admin/admin-ajax.php
Content-Type: application/x-www-form-urlencoded
```

### Parâmetros

| Parâmetro    | Tipo    | Obrigatório | Descrição |
|--------------|---------|-------------|-----------|
| `action`     | string  | ✅           | `get_phase` |
| `competicao` | array   | ✅           | ID(s) de competição. Ex: `competicao[]=10903` |

### Resposta

HTML com `<li>` para cada fase:

```html
<li value="<phase_id>">Fase Regular</li>
<li value="<phase_id>">Playoffs</li>
```

O atributo `value` de cada `<li>` é o ID da fase a usar no parâmetro `fase` de `get_more_days`.

---

## 6. Action: build_live_games — Jogos em Curso

Devolve os jogos actualmente em curso em toda a plataforma FPB. Usar para detectar quando há jogos ao vivo.

### Método
```
POST https://www.fpb.pt/wp-admin/admin-ajax.php
Content-Type: application/x-www-form-urlencoded
```

### Parâmetros

| Parâmetro | Tipo    | Obrigatório | Descrição |
|-----------|---------|-------------|-----------|
| `action`  | string  | ✅           | `build_live_games` |
| `id`      | integer | ❌           | ID de jogo específico. Se omitido, devolve todos os jogos ao vivo. |

### Resposta

HTML com cards de jogos ao vivo. Se não houver jogos ao vivo, a resposta é uma string vazia ou sem o elemento `.single-game`.

O JS do site verifica: `if (response.indexOf('single-game') < 0)` — se verdadeiro, não há jogos ao vivo.

Cada card tem atributos:
- `matchid`: ID do jogo (usar em `get_game_live_details` e `get_game_layer`)
- `matchtime`: Timestamp Unix do início do jogo
- CSS class `live` se em curso, `terminado` se terminado

### Polling Recomendado

Para "tempo real", fazer polling a esta action de 60 em 60 segundos durante janelas de jogo. Quando há jogos com class `live`, activar `get_game_live_details` de 30 em 30 segundos.

---

## 7. Action: get_game_live_details — Score em Tempo Real

Devolve o marcador e estado actual de um jogo específico em JSON puro. **Este é o único endpoint que devolve JSON sem HTML.**

### Método
```
POST https://www.fpb.pt/wp-admin/admin-ajax.php
Content-Type: application/x-www-form-urlencoded
```

### Parâmetros

| Parâmetro   | Tipo    | Obrigatório | Descrição |
|-------------|---------|-------------|-----------|
| `action`    | string  | ✅           | `get_game_live_details` |
| `matchId`   | integer | ✅           | ID numérico do jogo (`internalID`) |
| `matchTime` | integer | ✅           | Timestamp Unix do início do jogo |

### Resposta — JSON

```json
{
  "live": {
    "status": "LIVE",
    "clock": "03:42",
    "period": {
      "current": 3
    },
    "scores": [
      {
        "score": 67
      },
      {
        "score": 54
      }
    ]
  }
}
```

### Campos da resposta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `live.status` | string | `"LIVE"` (em curso) ou `"COMPLETE"` (terminado) |
| `live.clock` | string | Tempo restante no período. Formato `"MM:SS"` |
| `live.period.current` | integer | Período actual (1-4, ou 5+ para prolongamentos) |
| `live.scores[0].score` | integer | Pontuação da equipa da casa (team 1) |
| `live.scores[1].score` | integer | Pontuação da equipa visitante (team 2) |

**Nota:** Quando `status === "COMPLETE"`, o jogo terminou. Parar o polling e actualizar o resultado final na base de dados.

---

## 8. Action: get_game_layer — Boxscore Completo do Jogo

Devolve o boxscore completo de um jogo (estatísticas por jogador de ambas as equipas). Funciona tanto para jogos ao vivo como para jogos terminados.

### Método
```
POST https://www.fpb.pt/wp-admin/admin-ajax.php
Content-Type: application/x-www-form-urlencoded
```

### Parâmetros

| Parâmetro | Tipo    | Obrigatório | Descrição |
|-----------|---------|-------------|-----------|
| `action`  | string  | ✅           | `get_game_layer` |
| `matchId` | integer | ✅           | `internalID` do jogo |
| `logoT1`  | string  | ❌           | URL do logo da equipa 1 (apenas para renderização) |
| `logoT2`  | string  | ❌           | URL do logo da equipa 2 (apenas para renderização) |

### Resposta — JSON com HTML

```json
{
  "header": "<string HTML com cabeçalho do jogo>",
  "boxScore": "<string HTML com tabela de estatísticas>"
}
```

- `header`: HTML com nomes das equipas, resultado final por período, árbitros, pavilhão, data.
- `boxScore`: HTML com duas tabelas (uma por equipa) com estatísticas individuais de cada jogador: minutos jogados, pontos, assistências, ressaltos, faltas, perdas de bola, etc.

**Nota de parsing:** O `boxScore` contém elementos `<table>` com `<thead>` e `<tbody>`. Os headers das colunas são as siglas das estatísticas (MIN, PTS, 2PA, 2PM, 3PA, 3PM, LLA, LLM, RO, RD, RT, AS, BP, FC, FR).

---

## 9. Páginas HTML com Dados Estruturados

Além do AJAX, certas páginas HTML contêm dados relevantes para scraping directo.

### 9.1 Ficha de Jogo

```
GET https://www.fpb.pt/ficha-de-jogo?internalID=<ID>
```

A página mais rica em dados. Contém para cada jogo:
- Equipas participantes (nome, logo, ID)
- Resultado final e resultado por período (Q1, Q2, Q3, Q4 + prolongamentos)
- Data, hora e local do jogo
- Nome do pavilhão e cidade
- Competição e fase
- Árbitros
- Boxscore completo por jogador de ambas as equipas
- Líder de pontos, ressaltos e assistências

**Padrão de IDs:** Os `internalID` são inteiros sequenciais e incrementais. Exemplo observado: 409733, 410621, 410625, 410628, 410629, 410868, 410870, 410871, 411048, 411051, 411055, 411058, 411059, 411063, 411138, 411140, 411144, 411147, 411150, 411153, 411361, 411365, 411368, 411369, 411373, 412709.

**Implicação:** É possível iterar IDs sequencialmente para descobrir fichas de jogo sem passar pelo calendário.

### 9.2 Calendário de Clube

```
GET https://www.fpb.pt/calendario/clube_<ID>/?clube=<ID>&epoca=YYYY/YYYY
```

Contém:
- Header do clube (nome, logo, capa)
- Lista de jogos da época filtrada pelo clube
- Filtros de época, escalão, género, competição
- Data de cada jogo, adversário, local, resultado se já realizado

### 9.3 Calendário Geral (sem clube)

```
GET https://www.fpb.pt/calendario/?competicao=<ID>&epoca=YYYY/YYYY&escalao=Sénior&genero=masculino
```

### 9.4 Classificação

```
GET https://www.fpb.pt/classificacao/?competicao=<ID>&epoca=YYYY/YYYY
```

### 9.5 Estatísticas

```
GET https://www.fpb.pt/estatisticas/?competicao=<ID>&epoca=YYYY/YYYY
```

---

## 10. IDs de Competições Conhecidos

IDs descobertos directamente do HTML da página de calendário (atributos `data-id` no filtro de competições):

| ID    | Nome Completo                | Sigla       | Género    | Nível    |
|-------|------------------------------|-------------|-----------|----------|
| 10903 | Proliga                      | PROLIGA     | Masculino | Nacional |
| 10904 | 1ª Divisão Masculina         | 1ªDIV-M     | Masculino | Nacional |
| 10905 | 2ª Divisão Masculina         | 2ªDIV-M     | Masculino | Nacional |
| 10907 | 1ª Divisão Feminina          | 1ªDIV-F     | Feminino  | Nacional |
| 10908 | 2ª Divisão Feminina          | 2ªDIV-F     | Feminino  | Nacional |
| 10909 | Liga BCR                     | BCR         | Masculino | Regional |
| 10917 | Taça Hugo dos Santos         | TACA-HDS    | Masculino | Nacional |
| 10920 | Supertaça Feminina           | SUPERTACA-F | Feminino  | Nacional |

**Para competições de formação e distritais:** Chamar `get_competicoes` com os escalões Sub 14, Sub 16, Sub 18, Sub 19, Sub 20 para obter os IDs correspondentes. Variam por época.

**Para épocas anteriores:** Os IDs de competição mudam a cada época. Usar `get_competicoes` com a época desejada para obter os IDs correctos.

---

## 11. IDs de Clubes Conhecidos e Padrões de URL

### Clubes confirmados pelo HAR

| ID  | Nome                        | URL Calendário |
|-----|-----------------------------|----------------|
| 119 | FC Gaia                     | `/calendario/clube_119/` |
| 120 | FC Porto                    | `/calendario/clube_120/` |
| 983 | FC Porto Basquetebol SAD    | `/calendario/clube_983/` |

### Outros clubes visíveis nos logos do HAR (ID inferido do nome do ficheiro)

| ID    | Nome (inferido do ficheiro de logo)        |
|-------|--------------------------------------------|
| 18    | (clube histórico, logo em old_uploads)     |
| 28    | (clube histórico, logo em old_uploads)     |
| 31    | (clube com logo `CLU_31551675353180.jpg`)  |
| 69    | (clube com logo `CLU_691693656807.png`)    |
| 118   | (clube com logo `CLU_1181738506693.png`)   |
| 160   | (clube com logo `CLU_1601704477075.png`)   |
| 172   | (clube com logo `CLU_1721693497331.png`)   |
| 174   | (clube com logo `CLU_1741733586027.png`)   |
| 176   | (clube com logo `CLU_1761675707996.png`)   |
| 179   | (clube com logo `CLU_1791674726384.png`)   |
| 181   | (clube com logo `CLU_181.png`)             |
| 188   | (clube histórico, logo em old_uploads)     |
| 714   | (clube com logo `CLU_7141746203247.png`)   |
| 2405  | (clube com logo `CLU_24051677937068.png`)  |
| 3208  | (clube histórico, logo em old_uploads)     |

### Como descobrir o ID de qualquer clube

1. Pesquisar o clube em `https://www.fpb.pt` e navegar até à sua página
2. O URL será `/calendario/clube_<ID>/` — o número é o ID
3. Alternativamente, inspecionar o HTML de qualquer página de calendário e procurar referências `clube_<ID>` no filtro de clubs (se presente)

---

## 12. Servidor de Media sav2.fpb.pt

O servidor `sav2.fpb.pt` aloja todos os assets de imagem dos clubes. Sem autenticação.

### Logos actuais (formato recente)

```
https://sav2.fpb.pt/uploads/clubes/logotipo/CLU_<ID><timestamp>.<ext>
```

Exemplos reais observados:
```
https://sav2.fpb.pt/uploads/clubes/logotipo/CLU_1181738506693.png
https://sav2.fpb.pt/uploads/clubes/logotipo/CLU_691693656807.png
https://sav2.fpb.pt/uploads/clubes/logotipo/CLU_1741733586027.png
```

O `<timestamp>` é um Unix timestamp de quando o logo foi actualizado. Não é previsível — é preciso obter o URL a partir do HTML da página do clube.

### Logos históricos (formato antigo)

```
https://sav2.fpb.pt/old_uploads/CLU/CLU_<ID>_LOGO.png
```

Exemplos:
```
https://sav2.fpb.pt/old_uploads/CLU/CLU_18_LOGO.png
https://sav2.fpb.pt/old_uploads/CLU/CLU_188_LOGO.png
https://sav2.fpb.pt/old_uploads/CLU/CLU_3208_LOGO.png
```

Este formato é previsível (sem timestamp) e funciona para clubes históricos.

### Capas dos clubes

```
https://sav2.fpb.pt/uploads/clubes/capa/CLU_capa<ID>.jpg
```

Exemplo:
```
https://sav2.fpb.pt/uploads/clubes/capa/CLU_capa119.jpg
```

Este formato é 100% previsível a partir do ID do clube.

### Logos de clubes por nome (formato alternativo)

Alguns clubes têm logos com nome completo em vez de ID:
```
https://sav2.fpb.pt/uploads/clubes/logotipo/Futebol_Clube_de_Gaia1636713029.png
https://sav2.fpb.pt/uploads/clubes/logotipo/Nucleo_Desporto_Amador_Pombal1633455812.png
```

---

## 13. Sistema de Filtros — Valores Válidos

### Época (`epoca`)

Formato: `YYYY/YYYY` onde o segundo ano = primeiro + 1.

Épocas disponíveis (inferidas da análise):
```
2003/2004, 2004/2005, 2005/2006, 2006/2007, 2007/2008,
2008/2009, 2009/2010, 2010/2011, 2011/2012, 2012/2013,
2013/2014, 2014/2015, 2015/2016, 2016/2017, 2017/2018,
2018/2019, 2019/2020, 2020/2021, 2021/2022, 2022/2023,
2023/2024, 2024/2025, 2025/2026
```

### Escalão (`escalao`)

Valores confirmados (exactos, case-sensitive):
```
Sénior
Sub 20
Sub 19
Sub 18
Sub 16
Sub 14
Masters
BCR
```

### Género (`genero`)

```
masculino
feminino
```

### Associação (`associacao`)

```
0    = Nacional (FPB central)
50   = Nível de clube específico
```
Associações regionais (distritais) têm IDs próprios. Obter via `get_competicoes` com `associacao` omitido.

---

## 14. Estruturas de Dados das Respostas

### 14.1 HTML de get_more_days — Estrutura do bloco de jogo

O campo `result` da resposta JSON contém HTML com esta estrutura para cada dia:

```html
<div class="day-wrapper">
  <div class="day-header">
    <span>Sábado, 15 Março 2025</span>
  </div>
  
  <a href="/ficha-de-jogo?internalID=411048" class="jogo loadingOnclick">
    <div class="game-wrapper">
      <!-- Estado do jogo -->
      <div class="state terminado">Terminado</div>
      <!-- ou -->
      <div class="state live" matchid="411048" matchtime="1741989600">A decorrer</div>
      <!-- ou -->
      <div class="state agendado">15:00</div>
      
      <!-- Equipa da casa -->
      <div class="team home">
        <img src="https://sav2.fpb.pt/uploads/clubes/logotipo/..." />
        <span class="name">FC Gaia</span>
        <span class="score">78</span>
      </div>
      
      <!-- Separador -->
      <div class="vs">vs</div>
      
      <!-- Equipa visitante -->
      <div class="team away">
        <img src="https://sav2.fpb.pt/uploads/clubes/logotipo/..." />
        <span class="name">FC Porto</span>
        <span class="score">65</span>
      </div>
      
      <!-- Metadados -->
      <div class="meta">
        <span class="competition">Proliga</span>
        <span class="pavilion">Pavilhão Municipal de Gaia</span>
      </div>
    </div>
  </a>
</div>
```

**Estados possíveis do jogo:**
- `terminado`: Jogo realizado. Scores visíveis nos elementos `.score`.
- `live`: Jogo em curso. Tem atributos `matchid` e `matchtime` para usar com `get_game_live_details`.
- `agendado`: Jogo futuro. Hora prevista em vez de score.

### 14.2 JSON de get_game_live_details

```json
{
  "live": {
    "status": "LIVE | COMPLETE",
    "clock": "MM:SS",
    "period": {
      "current": 1
    },
    "scores": [
      { "score": 45 },
      { "score": 38 }
    ]
  }
}
```

### 14.3 JSON de get_game_layer

```json
{
  "header": "<HTML>",
  "boxScore": "<HTML com tabelas de estatísticas>"
}
```

Colunas típicas do boxScore:
- `#` — Número de camisola
- `Nome` — Nome do jogador
- `MIN` — Minutos jogados
- `PTS` — Pontos totais
- `2PM/2PA` — Tentativas/acertos de 2 pontos
- `3PM/3PA` — Tentativas/acertos de 3 pontos
- `LLM/LLA` — Lances Livres Marcados/Tentados
- `RO` — Ressaltos ofensivos
- `RD` — Ressaltos defensivos
- `RT` — Ressaltos totais
- `AS` — Assistências
- `BP` — Bolas perdidas
- `FC` — Faltas cometidas
- `FR` — Faltas recebidas

---

## 15. Estratégias de Scraping Recomendadas

### Estratégia A — Scraping de liga inteira (recomendada para todos os jogos)

Não iterar por clubes. Iterar por competições:

```python
competicoes = [10903, 10904, 10905, 10907, 10908, 10909]
for comp_id in competicoes:
    params = {
        "action": "get_more_days",
        "epoca": "2025/2026",
        "escalao": "Sénior",
        "genero": "masculino",  # ou feminino
        "competicao[]": comp_id,
        "period[time_option]": "fromInit",
        "period[from_date]": "2025/09/01",
        "period[to_date]": "2026/07/31"
    }
    response = requests.get(AJAX_URL, params=params)
    data = response.json()
    html = data["result"]
    # Parsear HTML para extrair jogos
```

### Estratégia B — Descoberta de IDs de jogos via iteração

Os `internalID` são sequenciais. A época 2025/2026 usa IDs na gama 409000–413000 (aproximadamente). Para descobrir todos os jogos de uma época sem usar o calendário:

```python
for game_id in range(409000, 415000):
    url = f"https://www.fpb.pt/ficha-de-jogo?internalID={game_id}"
    response = requests.get(url)
    if response.status_code == 200 and "ficha-de-jogo" in response.text:
        # Jogo existe — parsear e guardar
        pass
    # Rate limiting: aguardar 1-2 segundos entre pedidos
```

### Estratégia C — Monitorização de jogos ao vivo

```python
import schedule
import time

def check_live_games():
    # 1. Verificar se há jogos ao vivo
    response = requests.post(AJAX_URL, data={"action": "build_live_games"})
    if "single-game" not in response.text:
        return  # Sem jogos ao vivo
    
    # 2. Extrair matchIds do HTML
    live_game_ids = parse_live_game_ids(response.text)
    
    # 3. Para cada jogo ao vivo, obter score detalhado
    for match_id, match_time in live_game_ids:
        detail = requests.post(AJAX_URL, data={
            "action": "get_game_live_details",
            "matchId": match_id,
            "matchTime": match_time
        })
        score_data = detail.json()
        update_database(match_id, score_data)

# Durante janelas de jogo: polling a cada 60 segundos
schedule.every(60).seconds.do(check_live_games)
```

### Rate Limiting e Boas Práticas

- Aguardar **1-2 segundos** entre pedidos ao `admin-ajax.php`
- Para scraping em batch (histórico), usar **2-3 segundos** entre pedidos
- Não fazer mais de **30 pedidos por minuto** para não sobrecarregar o servidor
- Usar `User-Agent` realista: `Mozilla/5.0 (compatible; BasketballDataBot/1.0)`
- Respeitar o servidor: não fazer scraping de histórico completo em paralelo

---

## 16. Exemplos de Pedidos curl Prontos a Usar

### Obter todos os jogos da Proliga 2025/2026

```bash
curl -G "https://www.fpb.pt/wp-admin/admin-ajax.php" \
  --data-urlencode "action=get_more_days" \
  --data-urlencode "epoca=2025/2026" \
  --data-urlencode "escalao=Sénior" \
  --data-urlencode "genero=masculino" \
  --data-urlencode "competicao[]=10903" \
  --data-urlencode "period[time_option]=fromInit" \
  --data-urlencode "period[from_date]=2025/09/01" \
  --data-urlencode "period[to_date]=2026/07/31"
```

### Obter competições disponíveis para Sénior Masculino 2025/2026

```bash
curl -X POST "https://www.fpb.pt/wp-admin/admin-ajax.php" \
  -d "action=get_competicoes&epoca=2025/2026&escalao=Sénior&genero=masculino&radio=true&associacao=0"
```

### Verificar jogos ao vivo agora

```bash
curl -X POST "https://www.fpb.pt/wp-admin/admin-ajax.php" \
  -d "action=build_live_games"
```

### Obter score em tempo real de um jogo

```bash
curl -X POST "https://www.fpb.pt/wp-admin/admin-ajax.php" \
  -d "action=get_game_live_details&matchId=411048&matchTime=1741989600"
```

### Obter boxscore completo de um jogo

```bash
curl -X POST "https://www.fpb.pt/wp-admin/admin-ajax.php" \
  -d "action=get_game_layer&matchId=411048"
```

### Obter ficha de jogo HTML completa

```bash
curl "https://www.fpb.pt/ficha-de-jogo?internalID=411048"
```

### Obter calendário de um clube específico (FC Porto = 120)

```bash
curl -G "https://www.fpb.pt/wp-admin/admin-ajax.php" \
  --data-urlencode "action=get_more_days" \
  --data-urlencode "epoca=2025/2026" \
  --data-urlencode "escalao=Sénior" \
  --data-urlencode "genero=masculino" \
  --data-urlencode "clube=120" \
  --data-urlencode "period[time_option]=fromInit" \
  --data-urlencode "period[from_date]=2025/09/01" \
  --data-urlencode "period[to_date]=2026/07/31"
```

### Logo de um clube (capa — previsível a partir do ID)

```bash
curl -O "https://sav2.fpb.pt/uploads/clubes/capa/CLU_capa120.jpg"
```

---

## Notas Finais

1. **Sem autenticação** — todos os endpoints são públicos. Não há tokens, API keys, nem cookies necessários.

2. **As respostas são HTML, não JSON** — excepto `get_game_live_details` (JSON puro) e os envelopes de `get_more_days` e `get_game_layer` (JSON com HTML dentro). Usar um parser HTML (BeautifulSoup, Cheerio, etc.) para extrair dados estruturados.

3. **Os IDs de competição mudam por época** — os IDs da tabela em [Secção 10](#10-ids-de-competições-conhecidos) são para 2025/2026. Para outras épocas, usar `get_competicoes`.

4. **Dados históricos disponíveis desde 2003/2004** — o sistema tem mais de 20 anos de dados acessíveis. Os `internalID` mais antigos são significativamente menores.

5. **O site é WordPress** — o endpoint `https://www.fpb.pt/wp-json/wp/v2/` também existe (WordPress REST API nativa) e pode conter dados de posts/páginas do site, mas não dados desportivos estruturados.

6. **sav2.fpb.pt é o backend real** — todos os dados de imagem estão aqui. Pode conter outros endpoints não descobertos nesta análise.
