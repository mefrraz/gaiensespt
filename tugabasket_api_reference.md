# resultados.tugabasket.com — Referência Completa de API (Engenharia Reversa)

> **Origem:** Análise directa de HTTP via web fetch e inspecção de HTML.
> **Base URL:** `https://resultados.tugabasket.com`
> **Servidor de media:** `https://sav2.fpb.pt` (partilhado com fpb.pt)
> **Autenticação:** Nenhuma. Todos os endpoints são públicos, sem token, sem cookie.
> **Tipo de resposta:** HTML server-side rendered. Não há AJAX nem JSON próprio.
> **Identidade:** Portal oficial de resultados da Federação Portuguesa de Basquetebol (FPB). Domínio gerido pela FPB, com branding próprio mas dados partilhados com fpb.pt.

---

## Índice

1. [Arquitectura Geral](#1-arquitectura-geral)
2. [Mudar de Clube — A Coisa Mais Importante](#2-mudar-de-clube--a-coisa-mais-importante)
3. [Endpoint: / — Homepage com Associações](#3-endpoint---homepage-com-associações)
4. [Endpoint: /competitions — Lista de Competições](#4-endpoint-competitions--lista-de-competições)
5. [Endpoint: /getCompetitionDetails — Resultados e Calendário](#5-endpoint-getcompetitiondetails--resultados-e-calendário)
6. [Endpoint: /stats/players — Estatísticas Individuais](#6-endpoint-statsplayers--estatísticas-individuais)
7. [Endpoint: /stats/teams — Estatísticas por Equipa](#7-endpoint-statsteams--estatísticas-por-equipa)
8. [Integração FIBA LiveStats — Genius Sports](#8-integração-fiba-livestats--genius-sports)
9. [IDs de Associações — Todas as 22 Confirmadas](#9-ids-de-associações--todas-as-22-confirmadas)
10. [IDs de Épocas (seasonId)](#10-ids-de-épocas-seasonid)
11. [IDs de Competições — Lista Completa 2025/2026](#11-ids-de-competições--lista-completa-20252026)
12. [Estrutura HTML das Respostas](#12-estrutura-html-das-respostas)
13. [Como Filtrar por Clube](#13-como-filtrar-por-clube)
14. [Estratégias de Scraping Recomendadas](#14-estratégias-de-scraping-recomendadas)
15. [Exemplos de pedidos curl Prontos a Usar](#15-exemplos-de-pedidos-curl-prontos-a-usar)
16. [Comparação com fpb.pt](#16-comparação-com-fpbpt)

---

## 1. Arquitectura Geral

```
┌─────────────────────────────────────────────────────────────────┐
│              resultados.tugabasket.com                          │
│                                                                 │
│  /                    → homepage (lista de associações)         │
│  /competitions        → competições de uma associação/época     │
│  /getCompetitionDetails → resultados e calendário               │
│  /stats/players       → estatísticas individuais por jogador    │
│  /stats/teams         → estatísticas por equipa                 │
│                                                                 │
│  Todos os parâmetros passam por query string (?key=value)       │
│  Todas as respostas são HTML estático — sem AJAX, sem JSON      │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ media (logos, imagens)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     sav2.fpb.pt                                 │
│  /uploads/federacao/logotipo/   → logo FPB                      │
│  /uploads/provas/logotipos/     → logos de competições          │
│  /uploads/clubes/logotipo/      → logos de clubes               │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ live stats (por jogo)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│   fibalivestats.dcd.shared.geniussports.com/u/FPDB/<game_id>   │
│   Viewer público do Genius Sports — boxscore e play-by-play     │
└─────────────────────────────────────────────────────────────────┘
```

**Notas críticas:**
- O tugabasket é **completamente server-side rendered**. Não há chamadas AJAX após o carregamento da página. Toda a informação está no HTML da resposta HTTP inicial.
- Os `competitionId` são **exactamente os mesmos** que os do fpb.pt — ambos partilham a mesma base de dados backend (`sav2.fpb.pt`).
- As datas dos jogos estão em formato **ISO 8601** (`YYYY-MM-DD`), ao contrário do fpb.pt que usa texto em português. Isto torna o tugabasket muito mais fácil de parsear.
- Não há paginação. Cada endpoint devolve **todos os dados** num único pedido.
- O site tem Google AdSense (`ca-pub-7115418700999492`) mas não bloqueia scrapers.

---

## 2. Mudar de Clube — A Coisa Mais Importante

> **Esta secção é o equivalente ao `clube=119` do fpb.pt.**

No tugabasket **não existe um parâmetro de clube** nas URLs. Os dados são organizados por **competição**, não por clube. Para ver os jogos de um clube específico, há dois caminhos:

### Caminho A — Directo (recomendado para um único clube)

Vai a `/getCompetitionDetails?competitionId=<ID>` e filtra as linhas da tabela pelo nome do clube. O FC Gaia aparece como `FC GAIA - FOKUS` nos dados actuais.

```
# Para ver todos os jogos do FC Gaia na 1ª Divisão Masculina:
GET /getCompetitionDetails?competitionId=10904
→ Parsear o HTML e filtrar linhas onde "Visitado" OU "Visitante" == "FC GAIA - FOKUS"
```

**Exemplo de linha encontrada:**
```
| 2461 | 2026-03-14 | Galitos Pizzarte | 65:57 | FC GAIA - FOKUS | 2ª Fase - Grupo Promoção Norte |
| 2464 | 2026-03-21 | FC GAIA - FOKUS  | 81:85 | Club 5Basket Gondomar | 2ª Fase - Grupo Promoção Norte |
```

### Caminho B — Via stats (com filtro nativo de equipa)

O endpoint `/stats/players` tem um filtro nativo de equipa no HTML. A query string para filtrar:

```
GET /stats/players?competitionId=10904
```

A página inclui um dropdown com todas as equipas da competição. Para filtrar programaticamente, parsear o HTML e seleccionar apenas as linhas onde a coluna `EQUIPA` == nome do clube.

### Como descobrir o nome exacto do clube nos dados

Os nomes dos clubes no tugabasket **podem diferir dos nomes oficiais**. Para descobrir o nome exacto:
1. Aceder a `/getCompetitionDetails?competitionId=<ID_DA_COMPETICAO_DO_CLUBE>`
2. Pesquisar no HTML pelo nome aproximado do clube
3. Usar o nome exacto encontrado como filtro

**Nomes conhecidos confirmados pelos dados:**
- FC Gaia → `FC GAIA - FOKUS`
- FC Porto → verificar em `/getCompetitionDetails?competitionId=10902` (Liga Betclic)
- SL Benfica → verificar na Liga Betclic

---

## 3. Endpoint: / — Homepage com Associações

```
GET https://resultados.tugabasket.com/
```

Devolve a homepage com a lista de todas as associações disponíveis e links directos para as suas competições.

### Resposta — estrutura do HTML

```html
<a href="/competitions?associationId=50&seasonId=64">
  <img src="https://resultados.tugabasket.com/assets/images/logos/fpb.jpg" title="FPB" />
</a>
<a href="/competitions?associationId=1&seasonId=64">
  <img src="https://resultados.tugabasket.com/assets/images/logos/ablisboa.jpg" title="AB Lisboa" />
</a>
<!-- ... todas as 22 associações ... -->
```

Os `seasonId` no HTML correspondem sempre à **época actual**. Para épocas anteriores, mudar o `seasonId` manualmente (ver [Secção 10](#10-ids-de-épocas-seasonid)).

---

## 4. Endpoint: /competitions — Lista de Competições

```
GET https://resultados.tugabasket.com/competitions?associationId=<id>&seasonId=<id>
```

Devolve todas as competições disponíveis para uma associação numa dada época, agrupadas por género e tipo.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `associationId` | integer | ✅ | ID da associação. Ver [Secção 9](#9-ids-de-associações--todas-as-22-confirmadas). `50` = FPB Nacional. |
| `seasonId` | integer | ✅ | ID numérico da época. Ver [Secção 10](#10-ids-de-épocas-seasonid). `64` = 2025/2026. |

### Resposta — estrutura do HTML

```html
<!-- Logo e nome da associação -->
<img src="https://sav2.fpb.pt/uploads/federacao/logotipo/..." />

<!-- Competições agrupadas por secção -->
<h4>Competições Femininas</h4>
<ul>
  <li>
    <a href="/getCompetitionDetails?competitionId=10906">
      Liga Betclic Feminina Sénior
    </a>
  </li>
  <!-- ... mais competições ... -->
</ul>

<h4>Competições Masculinas</h4>
<ul>
  <li>
    <a href="/getCompetitionDetails?competitionId=10902">
      Liga Betclic Masculina Sénior
    </a>
  </li>
</ul>

<h4>Competições BCR</h4>
<ul>
  <li><a href="/getCompetitionDetails?competitionId=10909">Liga BCR BCR</a></li>
</ul>
```

**Dados extraíveis de cada `<a>`:**
- `href`: contém o `competitionId` — é o dado mais importante
- texto: nome completo da competição + escalão

---

## 5. Endpoint: /getCompetitionDetails — Resultados e Calendário

**O endpoint mais importante.** Devolve todos os jogos de uma competição — passados (com resultado) e futuros (sem resultado) — numa única tabela HTML.

```
GET https://resultados.tugabasket.com/getCompetitionDetails?competitionId=<id>
```

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `competitionId` | integer | ✅ | ID da competição. Ver [Secção 11](#11-ids-de-competições--lista-completa-20252026). |

### Resposta — cabeçalho da página

```html
<!-- Logo da competição -->
<img src="https://sav2.fpb.pt/uploads/provas/logotipos/logo109041756223053.png" />

<!-- Nome da competição -->
<a href="/getCompetitionDetails?competitionId=10904">
  Campeonato Nacional da 1ª Divisão Masculina
</a>

<!-- Associação e época -->
<a href="/competitions?associationId=50&seasonId=64">
  Federação Portuguesa de Basquetebol
</a>
2025/2026

<!-- Jogo agendado (se existir) -->
Mai 23 @ 18:30
<h4>Galitos Pizzarte</h4>
<h4>Futebol Clube Barreirense</h4>
4ª Fase - Final Nacional

<!-- Link para estatísticas -->
<a href="/stats/players?competitionId=10904">Estatistica</a>
```

### Resposta — tabela de resultados

```html
<table>
  <thead>
    <tr>
      <th>Jogo</th>   <!-- número sequencial do jogo na competição -->
      <th>Data</th>   <!-- formato YYYY-MM-DD -->
      <th>Visitado</th> <!-- equipa da casa -->
      <th>Res</th>    <!-- resultado OU link FIBA LiveStats -->
      <th>Visitante</th> <!-- equipa visitante -->
      <th>Fase</th>   <!-- nome da fase/ronda -->
      <th></th>       <!-- link completo para FIBA LiveStats -->
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>5602</td>
      <td>2026-05-17</td>
      <td>Futebol Clube Barreirense</td>
      <td>
        <a href="https://fibalivestats.dcd.shared.geniussports.com/u/FPDB/2848810">
          72:70
        </a>
      </td>
      <td>Galitos Pizzarte</td>
      <td>4ª Fase - Final Nacional</td>
      <td>
        <a href="https://fibalivestats.dcd.shared.geniussports.com/u/FPDB/2848810">
          https://fibalivestats.dcd.shared.geniussports.com/u/FPDB/2848810
        </a>
      </td>
    </tr>
    <!-- Jogo futuro (sem resultado): -->
    <tr>
      <td>5603</td>
      <td>2026-05-24</td>
      <td>Galitos Pizzarte</td>
      <td></td>  <!-- resultado vazio = jogo ainda não realizado -->
      <td>Futebol Clube Barreirense</td>
      <td>4ª Fase - Final Nacional</td>
      <td></td>
    </tr>
  </tbody>
</table>
```

### Campos da tabela de resultados

| Coluna HTML | Nome | Tipo | Descrição |
|-------------|------|------|-----------|
| `Jogo` | game_number | integer | Número sequencial do jogo nesta competição. Único dentro da competição mas não globalmente. |
| `Data` | date | string `YYYY-MM-DD` | Data do jogo em formato ISO. Muito mais fácil de parsear que o fpb.pt. |
| `Visitado` | home_team | string | Nome da equipa da casa. |
| `Res` | result | string `NN:NN` ou vazio | Resultado final. **Vazio = jogo futuro ou não realizado.** Quando tem resultado, é um `<a>` clicável que linka para o FIBA LiveStats. |
| `Visitante` | away_team | string | Nome da equipa visitante. |
| `Fase` | phase | string | Nome da fase da competição (ex: `1ª Fase - Norte`, `2ª Fase - Grupo Promoção Norte`, `4ª Fase - Final Nacional`). |
| coluna 7 | livestats_url | string URL | Link completo para o FIBA LiveStats deste jogo. Contém o `game_id` da Genius Sports. Vazio para jogos futuros. |

### Como detectar jogo ao vivo

A tabela **não indica explicitamente** jogos ao vivo. Para detectar:
1. Verificar se `Data` == data de hoje
2. Verificar se `Res` está vazio (jogo ainda não tem resultado)
3. Se ambos forem verdade, o jogo pode estar ao vivo → aceder ao URL FIBA LiveStats para confirmar

---

## 6. Endpoint: /stats/players — Estatísticas Individuais

Devolve estatísticas médias por jogo de todos os jogadores de uma competição, para a época completa ou por fase.

```
GET https://resultados.tugabasket.com/stats/players?competitionId=<id>
```

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `competitionId` | integer | ✅ | ID da competição. |

### Filtros disponíveis no HTML (não em query string)

A página inclui dropdowns de filtro que no site são usados via JavaScript mas os dados completos **já estão todos no HTML**. Os filtros são apenas visuais no browser. Para scraping, obtém-se toda a tabela e filtra-se programaticamente.

Filtros disponíveis (inferidos dos dropdowns na página):
- **Por fase:** `Todas Fases`, `1ª Fase - Norte`, `2ª Fase - Grupo Promoção Norte`, etc.
- **Por equipa:** `Todas Equipas`, `FC GAIA - FOKUS`, `Galitos Pizzarte`, etc.
- **Média vs Total:** `Média` (por jogo) ou `Total` (acumulado na época)
- **Elegibilidade:** `Global` ou `Só Sub 23`

### Resposta — tabela de estatísticas

```html
<table>
  <thead>
    <tr>
      <th>JOGADOR</th>
      <th>EQUIPA</th>
      <th>JG</th>   <!-- jogos disputados -->
      <th>J5</th>   <!-- jogos nos últimos 5 -->
      <th>MIN</th>  <!-- minutos por jogo -->
      <th>PTS</th>  <!-- pontos por jogo -->
      <th>L2C</th>  <!-- lançamentos de 2 convertidos -->
      <th>L2T</th>  <!-- lançamentos de 2 tentados -->
      <th>L2%</th>  <!-- percentagem de 2 pontos -->
      <th>L3C</th>  <!-- lançamentos de 3 convertidos -->
      <th>L3T</th>  <!-- lançamentos de 3 tentados -->
      <th>L3%</th>  <!-- percentagem de 3 pontos -->
      <th>LLC</th>  <!-- lances livres convertidos -->
      <th>LLT</th>  <!-- lances livres tentados -->
      <th>LL%</th>  <!-- percentagem de lances livres -->
      <th>RD</th>   <!-- ressaltos defensivos -->
      <th>RO</th>   <!-- ressaltos ofensivos -->
      <th>TR</th>   <!-- ressaltos totais -->
      <th>AS</th>   <!-- assistências -->
      <th>RB</th>   <!-- roubos de bola -->
      <th>TO</th>   <!-- turnovers (perdas de bola) -->
      <th>DL</th>   <!-- desarmes de lançamento (blocos) -->
      <th>FC</th>   <!-- faltas cometidas -->
      <th>FS</th>   <!-- faltas sofridas -->
      <th>+/-</th>  <!-- plus/minus -->
      <th>VAL</th>  <!-- índice de eficiência (valoração) -->
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Bradley Cimperman</td>
      <td>Galitos Pizzarte</td>
      <td>27</td>
      <td>26</td>
      <td>31.2</td>
      <td>21.5</td>
      <td>5.0</td>
      <td>8.5</td>
      <td>59.4</td>
      <td>2.2</td>
      <td>6.2</td>
      <td>35.9</td>
      <td>4.7</td>
      <td>6.1</td>
      <td>77.1</td>
      <td>5.4</td>
      <td>2.1</td>
      <td>7.5</td>
      <td>2.0</td>
      <td>1.7</td>
      <td>2.4</td>
      <td>0.3</td>
      <td>2.0</td>
      <td>4.6</td>
      <td>12.4</td>
      <td>24.2</td>
    </tr>
    <!-- ... todos os jogadores ... -->
  </tbody>
</table>
```

### Glossário das colunas de estatísticas

| Sigla | Nome completo | Descrição |
|-------|--------------|-----------|
| JG | Jogos | Total de jogos disputados na época/fase |
| J5 | Últimos 5 | Jogos disputados nos últimos 5 jogos da equipa |
| MIN | Minutos | Média de minutos por jogo |
| PTS | Pontos | Média de pontos por jogo |
| L2C | Lançamentos 2pt Convertidos | Média de cestos de 2 pontos marcados |
| L2T | Lançamentos 2pt Tentados | Média de tentativas de 2 pontos |
| L2% | Percentagem 2pt | Eficiência em lançamentos de 2 pontos |
| L3C | Lançamentos 3pt Convertidos | Média de cestos de 3 pontos marcados |
| L3T | Lançamentos 3pt Tentados | Média de tentativas de 3 pontos |
| L3% | Percentagem 3pt | Eficiência em lançamentos de 3 pontos |
| LLC | Lances Livres Convertidos | Média de lances livres marcados |
| LLT | Lances Livres Tentados | Média de lances livres tentados |
| LL% | Percentagem LL | Eficiência em lances livres |
| RD | Ressaltos Defensivos | Média de ressaltos no campo defensivo |
| RO | Ressaltos Ofensivos | Média de ressaltos no campo ofensivo |
| TR | Ressaltos Totais | RD + RO |
| AS | Assistências | Média de passes que resultam em cesto |
| RB | Roubos de Bola | Média de intercepções/desarmes de passe |
| TO | Turnovers | Média de perdas de bola |
| DL | Blocos | Média de desarmes de lançamento |
| FC | Faltas Cometidas | Média de faltas pessoais feitas |
| FS | Faltas Sofridas | Média de faltas pessoais recebidas |
| +/- | Plus/Minus | Diferença de pontos quando o jogador está em campo |
| VAL | Valoração/Eficiência | Índice composto de eficiência (fórmula FIBA) |

**Fórmula da VAL (valoração):**
```
VAL = PTS + TR + AS + RB + DL + FS - (L2T-L2C) - (L3T-L3C) - (LLT-LLC) - TO - FC
```

---

## 7. Endpoint: /stats/teams — Estatísticas por Equipa

```
GET https://resultados.tugabasket.com/stats/teams?competitionId=<id>
```

Mesmos parâmetros que `/stats/players`. Devolve estatísticas médias por equipa em vez de por jogador. As colunas são as mesmas mas representam médias colectivas.

O link para este endpoint aparece na página de estatísticas de jogadores:
```html
<a href="/stats/teams?competitionId=10904">Estatistica Equipa</a>
```

---

## 8. Integração FIBA LiveStats — Genius Sports

**Esta é a descoberta mais importante do tugabasket.** Cada jogo com resultado tem um link directo para o viewer público do FIBA LiveStats, powered by Genius Sports.

### URL padrão

```
https://fibalivestats.dcd.shared.geniussports.com/u/FPDB/<game_id>
```

- `FPDB` é o código da Federação Portuguesa de Basquetebol no sistema Genius Sports
- `<game_id>` é um inteiro sequencial atribuído pela Genius Sports a cada jogo

### Exemplos reais confirmados

```
https://fibalivestats.dcd.shared.geniussports.com/u/FPDB/2848810  → FC Barreirense 72:70 Galitos
https://fibalivestats.dcd.shared.geniussports.com/u/FPDB/2843988  → Galitos 80:67 SC Beira-Mar
https://fibalivestats.dcd.shared.geniussports.com/u/FPDB/2760901  → FC GAIA 82:78 Guifões SC
https://fibalivestats.dcd.shared.geniussports.com/u/FPDB/2761071  → FC Barreirense 87:51 BAC
```

### O que está disponível no viewer FIBA LiveStats

O viewer público (`fibalivestats.dcd.shared.geniussports.com`) contém, **sem autenticação**:
- Resultado final e resultado por período (Q1, Q2, Q3, Q4 + prolongamentos)
- Boxscore completo de ambas as equipas (todos os jogadores, todas as estatísticas)
- Play-by-play completo (cada acção do jogo em ordem cronológica)
- Coordenadas de lançamento no campo (shot chart)
- Roster de ambas as equipas com números de camisola
- Árbitros

### Game IDs e padrões

Os `game_id` são sequenciais. Exemplos da época 2025/2026:
- Jogos de Dezembro 2025: ~2760000–2761000
- Jogos de Janeiro 2026: ~2760800–2761300
- Jogos de Março 2026: ~2811000–2812100
- Jogos de Maio 2026: ~2840000–2848000

Os IDs incrementam cronologicamente mas **não são contíguos** — há saltos entre jogos de competições diferentes.

### Como extrair o game_id do HTML do tugabasket

```python
import re
html = response.text  # HTML de /getCompetitionDetails

# Extrair todos os game_ids
game_ids = re.findall(
    r'fibalivestats\.dcd\.shared\.geniussports\.com/u/FPDB/(\d+)',
    html
)
# game_ids = ['2848810', '2843988', '2845618', ...]
```

---

## 9. IDs de Associações — Todas as 22 Confirmadas

Todos os `associationId` foram confirmados directamente da homepage do tugabasket.

| ID | Nome | Logo URL |
|----|------|----------|
| 50 | FPB — Federação Portuguesa de Basquetebol | `/assets/images/logos/fpb.jpg` |
| 1 | AB Lisboa — Associação de Basquetebol de Lisboa | `/assets/images/logos/ablisboa.jpg` |
| 2 | AB Setúbal | `/assets/images/logos/absetubal.jpg` |
| 3 | AB Aveiro | `/assets/images/logos/abaveiro.jpg` |
| 4 | AB Porto | `/assets/images/logos/abporto.jpg` |
| 5 | AB Braga | `/assets/images/logos/abbraga.jpg` |
| 6 | AB Madeira | `/assets/images/logos/abmadeira.jpg` |
| 7 | AB Santarém | `/assets/images/logos/absantarem_novo.jpg` |
| 8 | AB Coimbra | `/assets/images/logos/abcoimbra.jpg` |
| 9 | AB Algarve | `/assets/images/logos/abalgarve.jpg` |
| 10 | AB Viseu | `/assets/images/logos/abviseu.jpg` |
| 11 | AB Leiria | `/assets/images/logos/ableiria.jpg` |
| 12 | AB Alentejo | `/assets/images/logos/abalentejo.jpg` |
| 13 | AB Ilha Terceira | `/assets/images/logos/abit.jpg` |
| 14 | AB Castelo Branco | `/assets/images/logos/abcastelobranco.jpg` |
| 15 | AB Bragança | `/assets/images/logos/abbraganca.jpg` |
| 16 | AB São Miguel | `/assets/images/logos/absaomiguel.jpg` |
| 17 | AB Viana do Castelo | `/assets/images/logos/abviana.jpg` |
| 18 | AB Vila Real | `/assets/images/logos/abvilareal.jpg` |
| 19 | AB Faial e Pico | `/assets/images/logos/abifp.jpg` |
| 20 | AB Guarda | `/assets/images/logos/abguarda.jpg` |
| 22 | AB Santa Maria | `/assets/images/logos/absantamaria.jpg` |
| 24 | AB Açores | `/assets/images/logos/abacores.jpg` |

**Nota:** Os IDs 21 e 23 não aparecem na homepage — provavelmente associações extintas ou fundidas.

**Para cobertura nacional completa:** Fazer 22 pedidos, um por cada `associationId`, e agregam-se todas as competições do país.

---

## 10. IDs de Épocas (seasonId)

O `seasonId` é um inteiro sequencial. A época mais recente (2025/2026) tem `seasonId=64`.

### Mapeamento confirmado

| seasonId | Época |
|----------|-------|
| 64 | 2025/2026 ✅ confirmado |
| 63 | 2024/2025 (inferido) |
| 62 | 2023/2024 (inferido) |
| 61 | 2022/2023 (inferido) |
| 60 | 2021/2022 (inferido) |
| ... | ... |
| ~43 | 2003/2004 (inferido — 21 épocas atrás) |

O site tem épocas disponíveis desde 2003/2004 (confirmado pelo dropdown na homepage que lista todas as épocas). Os `seasonId` para épocas antigas podem ser calculados como `64 - (2025 - ano_da_época)`.

**Para descobrir o seasonId exacto de uma época:** Aceder à homepage, o dropdown de épocas tem os links com os `seasonId` correctos.

### Época actual vs. época anterior

```
# Época actual:
/competitions?associationId=50&seasonId=64

# Época anterior:
/competitions?associationId=50&seasonId=63
```

---

## 11. IDs de Competições — Lista Completa 2025/2026

Todos os IDs foram confirmados directamente do HTML de `/competitions?associationId=50&seasonId=64`.

### Competições Masculinas (FPB Nacional)

| competitionId | Nome Completo | Escalão |
|---------------|---------------|---------|
| 10902 | Liga Betclic Masculina | Sénior |
| 10903 | Campeonato da Proliga | Sénior |
| 10904 | Campeonato Nacional da 1ª Divisão Masculina | Sénior |
| 10905 | Campeonato Nacional da 2ª Divisão Masculina | Sénior |
| 10910 | Liga Masters DHIKA Masculina | Masters/Veteranos |
| 10912 | Taça de Portugal Masculina Skoiy | Sénior |
| 10917 | Taça Hugo dos Santos | Sénior |
| 10919 | Supertaça Mário Saldanha | Sénior |
| 10922 | Supertaça Masters DHIKA Masculina | Masters/Veteranos |
| 10955 | FIBA World Cup 2027 Qualifiers | Sénior (Selecção Nacional) |
| 10957 | Basketball Champions League | Sénior (Europeu) |
| 10958 | FIBA Europe Cup | Sénior (Europeu) |
| 10974 | Jogos Preparação Masculino | Sénior |
| 11078 | Centro Nacional Treino Ponte de Sor | Sénior |
| 11160 | Campeonato Nacional Sub18 Masculinos | Sub 18 |
| 11162 | Taça Nacional Sub18 Masculinos | Sub 18 |
| 11164 | Campeonato Nacional Sub16 Masculinos | Sub 16 |
| 11166 | Taça Nacional Sub16 Masculinos | Sub 16 |
| 11168 | Campeonato Nacional Sub14 Masculinos | Sub 14 |
| 11170 | Taça Nacional Sub14 Masculinos | Sub 14 |
| 11172 | Taça Nacional Seniores Masculinos | Sénior |
| 11174 | XVIII Festa do Basquetebol Juvenil U16 | Sub 16 |
| 11176 | XVIII Festa do Basquetebol Juvenil U14 | Sub 14 |

### Competições Femininas (FPB Nacional)

| competitionId | Nome Completo | Escalão |
|---------------|---------------|---------|
| 10906 | Liga Betclic Feminina | Sénior |
| 10907 | Campeonato Nacional da 1ª Divisão Feminina | Sénior |
| 10908 | Campeonato Nacional da 2ª Divisão Feminina | Sénior |
| 10911 | Liga Masters DHIKA Feminina | Masters/Veteranos |
| 10913 | Taça de Portugal Feminina Skoiy | Sénior |
| 10918 | Taça Federação Marsh | Sénior |
| 10920 | Supertaça Feminina | Sénior |
| 10923 | Supertaça Masters DHIKA Feminina | Masters/Veteranos |
| 10956 | FIBA Womens Eurobasket 2027 Qualifiers | Sénior (Selecção Nacional) |
| 10959 | EuroCup Women | Sénior (Europeu) |
| 10975 | Jogos Preparação Feminino | Sénior |
| 11079 | Centro Nacional Treino CAR Jamor | Sénior |
| 11159 | Campeonato Nacional Sub18 Femininos | Sub 18 |
| 11161 | Taça Nacional Sub18 Femininos | Sub 18 |
| 11163 | Campeonato Nacional Sub16 Femininos | Sub 16 |
| 11165 | Taça Nacional Sub16 Femininos | Sub 16 |
| 11167 | Campeonato Nacional Sub14 Femininos | Sub 14 |
| 11169 | Taça Nacional Sub14 Femininos | Sub 14 |
| 11171 | Taça Nacional Seniores Femininos | Sénior |
| 11173 | XVIII Festa do Basquetebol Juvenil U16W | Sub 16 |
| 11175 | XVIII Festa do Basquetebol Juvenil U14W | Sub 14 |

### Competições BCR (FPB Nacional)

| competitionId | Nome Completo | Escalão |
|---------------|---------------|---------|
| 10909 | Liga BCR | BCR |
| 10914 | Taça de Portugal BCR | BCR |
| 10921 | Supertaça BCR | BCR |
| 10976 | Jogos Preparação BCR | BCR |
| 11383 | Taça Nacional BCR | BCR |

**Para competições distritais (associações regionais):** Usar `/competitions?associationId=<1-24>&seasonId=64` para obter os IDs das competições de cada associação. Os IDs distritais são diferentes dos nacionais e variam por associação e época.

---

## 12. Estrutura HTML das Respostas

### 12.1 Como parsear a tabela de resultados

A tabela em `/getCompetitionDetails` é uma `<table>` HTML padrão. Exemplo de parsing em Python:

```python
from bs4 import BeautifulSoup
import requests
import re

response = requests.get(
    "https://resultados.tugabasket.com/getCompetitionDetails",
    params={"competitionId": 10904}
)

soup = BeautifulSoup(response.text, "html.parser")
table = soup.find("table")
rows = table.find("tbody").find_all("tr")

games = []
for row in rows:
    cols = row.find_all("td")
    if len(cols) < 6:
        continue
    
    result_cell = cols[3]
    result_link = result_cell.find("a")
    
    game = {
        "game_number": cols[0].text.strip(),
        "date": cols[1].text.strip(),           # formato YYYY-MM-DD
        "home_team": cols[2].text.strip(),
        "result": result_cell.text.strip(),      # "72:70" ou "" se futuro
        "away_team": cols[4].text.strip(),
        "phase": cols[5].text.strip(),
        "livestats_url": result_link["href"] if result_link else None,
        "genius_game_id": None
    }
    
    # Extrair game_id do URL FIBA LiveStats
    if game["livestats_url"]:
        match = re.search(r"/FPDB/(\d+)", game["livestats_url"])
        if match:
            game["genius_game_id"] = match.group(1)
    
    games.append(game)
```

### 12.2 Como parsear as estatísticas de jogadores

```python
stats_response = requests.get(
    "https://resultados.tugabasket.com/stats/players",
    params={"competitionId": 10904}
)

soup = BeautifulSoup(stats_response.text, "html.parser")
table = soup.find("table")
headers = [th.text.strip() for th in table.find("thead").find_all("th")]
rows = table.find("tbody").find_all("tr")

players = []
for row in rows:
    cols = row.find_all("td")
    if len(cols) < 2:
        continue
    players.append({
        headers[i]: cols[i].text.strip()
        for i in range(min(len(headers), len(cols)))
    })
```

### 12.3 Como descobrir a época actual automaticamente

```python
# A homepage tem o seasonId actual nos links das associações
homepage = requests.get("https://resultados.tugabasket.com/")
soup = BeautifulSoup(homepage.text, "html.parser")

# Encontrar o primeiro link de associação
first_link = soup.find("a", href=re.compile(r"seasonId=\d+"))
season_id = re.search(r"seasonId=(\d+)", first_link["href"]).group(1)
# season_id = "64" para 2025/2026
```

---

## 13. Como Filtrar por Clube

Não existe parâmetro de clube nas URLs. O tugabasket é organizado por competição. Para uma app focada num clube específico (ex: FC Gaia), há três abordagens:

### Abordagem 1 — Filtro de nome após fetch (mais simples)

```python
CLUB_NAME = "FC GAIA - FOKUS"  # ← mudar apenas esta linha para outro clube

all_games = fetch_competition(10904)  # busca todos os jogos

club_games = [
    game for game in all_games
    if game["home_team"] == CLUB_NAME or game["away_team"] == CLUB_NAME
]
```

**Para mudar de clube:** alterar apenas `CLUB_NAME`. Para descobrir o nome exacto, fazer um fetch da competição e pesquisar no HTML pelo nome aproximado.

### Abordagem 2 — Descoberta automática de competições do clube

```python
def find_club_competitions(club_name, season_id=64):
    """Descobre automaticamente em que competições um clube participa."""
    
    club_competitions = []
    
    # Pedir lista de competições da FPB nacional
    resp = requests.get(
        "https://resultados.tugabasket.com/competitions",
        params={"associationId": 50, "seasonId": season_id}
    )
    soup = BeautifulSoup(resp.text, "html.parser")
    
    # Extrair todos os competitionIds
    comp_links = soup.find_all("a", href=re.compile(r"competitionId=\d+"))
    comp_ids = [re.search(r"competitionId=(\d+)", a["href"]).group(1) for a in comp_links]
    
    # Para cada competição, verificar se o clube participa
    for comp_id in comp_ids:
        resp = requests.get(
            "https://resultados.tugabasket.com/getCompetitionDetails",
            params={"competitionId": comp_id}
        )
        if club_name.lower() in resp.text.lower():
            comp_name = extract_competition_name(resp.text)
            club_competitions.append({
                "competition_id": comp_id,
                "competition_name": comp_name
            })
        time.sleep(1)  # respeitar o servidor
    
    return club_competitions
```

### Abordagem 3 — Via stats/players com filtro de equipa

A página de estatísticas lista todas as equipas no dropdown. Pode-se parsear esse dropdown para obter o nome exacto do clube e depois filtrar a tabela completa.

---

## 14. Estratégias de Scraping Recomendadas

### Estratégia A — App de um único clube (ex: GaienSes PT)

```python
# Configuração — mudar apenas CLUB_NAME e COMPETITION_IDS para outro clube
CLUB_NAME = "FC GAIA - FOKUS"
COMPETITION_IDS = [10904]  # 1ª Divisão Masculina — descobrir via find_club_competitions()

def update_club_data():
    all_data = {}
    
    for comp_id in COMPETITION_IDS:
        # 1. Buscar todos os jogos da competição
        games = fetch_competition_games(comp_id)
        
        # 2. Filtrar apenas os jogos do clube
        club_games = [g for g in games if CLUB_NAME in (g["home_team"], g["away_team"])]
        
        # 3. Para cada jogo com resultado, buscar boxscore completo via FIBA LiveStats
        for game in club_games:
            if game["genius_game_id"]:
                game["boxscore"] = fetch_fiba_livestats(game["genius_game_id"])
        
        # 4. Buscar estatísticas dos jogadores do clube
        all_players = fetch_player_stats(comp_id)
        club_players = [p for p in all_players if p["EQUIPA"] == CLUB_NAME]
        
        all_data[comp_id] = {
            "games": club_games,
            "players": club_players
        }
    
    return all_data
```

### Estratégia B — App de basquetebol português completo

```python
ASSOCIATION_IDS = [50, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24]
SEASON_ID = 64

def scrape_all_portugal():
    all_competitions = []
    
    for assoc_id in ASSOCIATION_IDS:
        competitions = fetch_competitions(assoc_id, SEASON_ID)
        all_competitions.extend(competitions)
        time.sleep(2)
    
    # Remover duplicados (competições nacionais aparecem em múltiplas associações)
    unique_comps = {c["competition_id"]: c for c in all_competitions}.values()
    
    all_games = []
    for comp in unique_comps:
        games = fetch_competition_games(comp["competition_id"])
        all_games.extend(games)
        time.sleep(1)
    
    return all_games
```

### Rate Limiting e Boas Práticas

- Aguardar **1 segundo** entre pedidos normais
- Aguardar **2 segundos** entre pedidos em batch (scraping histórico)
- O tugabasket não tem protecção de rate limit conhecida mas é bom cidadão da web
- Usar `User-Agent` realista: `Mozilla/5.0 (compatible; BasketballBot/1.0)`
- Para actualizações regulares: scrape da competição principal de **30 em 30 minutos** é mais que suficiente
- Não fazer scraping paralelo agressivo — requests sequenciais são suficientes

---

## 15. Exemplos de pedidos curl Prontos a Usar

### Homepage — lista de todas as associações

```bash
curl "https://resultados.tugabasket.com/"
```

### Competições da FPB nacional (época 2025/2026)

```bash
curl "https://resultados.tugabasket.com/competitions?associationId=50&seasonId=64"
```

### Competições da AB Porto (épocas distritais)

```bash
curl "https://resultados.tugabasket.com/competitions?associationId=4&seasonId=64"
```

### Todos os jogos da 1ª Divisão Masculina (inclui FC Gaia)

```bash
curl "https://resultados.tugabasket.com/getCompetitionDetails?competitionId=10904"
```

### Todos os jogos da Liga Betclic (topo do basquetebol português)

```bash
curl "https://resultados.tugabasket.com/getCompetitionDetails?competitionId=10902"
```

### Estatísticas individuais da 1ª Divisão Masculina (todos os jogadores)

```bash
curl "https://resultados.tugabasket.com/stats/players?competitionId=10904"
```

### Estatísticas por equipa da 1ª Divisão Masculina

```bash
curl "https://resultados.tugabasket.com/stats/teams?competitionId=10904"
```

### Boxscore de um jogo específico via FIBA LiveStats

```bash
# game_id extraído da coluna livestats_url do /getCompetitionDetails
curl "https://fibalivestats.dcd.shared.geniussports.com/u/FPDB/2848810"
```

### Época anterior (2024/2025)

```bash
curl "https://resultados.tugabasket.com/competitions?associationId=50&seasonId=63"
```

---

## 16. Comparação com fpb.pt

| Característica | tugabasket.com | fpb.pt |
|----------------|----------------|--------|
| Tipo de resposta | HTML estático | HTML dinâmico via AJAX |
| Formato de data | ISO `YYYY-MM-DD` ✅ | Texto PT `"Sáb, 15 Mar 2025"` |
| CORS | Não aplicável (server-side) | Pode bloquear requests de browser |
| Paginação | Não — tudo numa página | Sim — infinite scroll com `hasmore` |
| Live score | Não directo | Sim, via `get_game_live_details` |
| Estatísticas jogadores | ✅ Nativas por competição | ❌ Não disponível directamente |
| Filtro por clube | Filtro no cliente (nome) | Parâmetro nativo `?clube=119` |
| Cobertura | Nacional + 22 regionais | Nacional + algumas regionais |
| Associações regionais | ✅ Todas as 22 | ⚠️ Parcial, via `associacao` |
| FIBA LiveStats | ✅ Link por jogo | ❌ Não referenciado |
| Dados históricos | Desde ~2003/2004 | Desde 2003/2004 |
| Facilidade de parse | Alta — tabela HTML limpa | Média — HTML complexo |

**Recomendação:** Usar o tugabasket como fonte **principal** (dados mais limpos, estatísticas nativas, datas ISO) e o fpb.pt como **complementar** para live scores via `get_game_live_details` e fichas de jogo detalhadas via `/ficha-de-jogo?internalID=<id>`.
