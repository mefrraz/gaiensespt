# FPB API — Referência Completa para IA

> Este documento descreve a API pública da Federação Portuguesa de Basquetebol (FPB) usada nesta aplicação. O backend é `https://sav2.fpb.pt`. O frontend da FPB está em `https://www.fpb.pt`. Usa este documento como fonte de verdade para todos os pedidos de dados de basquetebol.

---

## Índice

1. [Arquitetura geral](#1-arquitetura-geral)
2. [Competições — lista e IDs](#2-competições--lista-e-ids)
3. [Endpoints por competição (prova)](#3-endpoints-por-competição-prova)
4. [Endpoints por clube](#4-endpoints-por-clube)
5. [Endpoints de atletas](#5-endpoints-de-atletas)
6. [Assets — logos e imagens](#6-assets--logos-e-imagens)
7. [Estrutura de dados — exemplos de resposta](#7-estrutura-de-dados--exemplos-de-resposta)
8. [Notas de implementação](#8-notas-de-implementação)

---

## 1. Arquitetura geral

A FPB tem dois domínios relevantes:

| Domínio | Função |
|---|---|
| `https://www.fpb.pt` | Site público WordPress. As páginas de competições, clubes, atletas e calendários são renderizadas aqui. |
| `https://sav2.fpb.pt` | Backend de dados. Serve a API REST consumida pelo site FPB e por esta aplicação. Também serve os assets (logos, imagens). |

Todos os pedidos à API são `GET` sem autenticação. Não há chave de API pública conhecida — os endpoints são abertos.

O padrão base da API é:

```
https://sav2.fpb.pt/api/{recurso}/{parâmetro}
```

---

## 2. Competições — lista e IDs

Cada competição tem um **ID numérico único** (provaId). Abaixo estão todas as competições activas da época 2025/2026 presentes em `https://www.fpb.pt/competicoes/`.

### Competições principais (sénior)

| ID | Nome | Género | Tier |
|---|---|---|---|
| `10902` | Liga Betclic Masculina | Masculino | 1 — Liga de topo |
| `10906` | Liga Betclic Feminina | Feminino | 1 — Liga de topo |
| `10903` | Proliga | Masculino | 2 — Segunda divisão nacional |
| `10904` | 1ª Divisão Masculina | Masculino | 3 |
| `10905` | 2ª Divisão Masculina | Masculino | 4 |
| `10907` | 1ª Divisão Feminina | Feminino | 2 |
| `10908` | 2ª Divisão Feminina | Feminino | 3 |
| `10917` | Taça Hugo dos Santos | Masculino | Taça nacional |
| `10920` | Supertaça Feminina | Feminino | Supertaça |
| `10909` | Liga BCR | Misto | Formação (Sub-18/20) |

### Ligas "populares" para apresentar em destaque na app

As ligas que devem aparecer em destaque (para pesquisa, seguir, página de ligas) são, por ordem de relevância:

1. Liga Betclic Masculina (`10902`)
2. Liga Betclic Feminina (`10906`)
3. Proliga (`10903`)
4. 1ª Divisão Feminina (`10907`)
5. 1ª Divisão Masculina (`10904`)

---

## 3. Endpoints por competição (prova)

Substitui `{provaId}` pelo ID numérico da competição (ex: `10902`).

### 3.1 Página da competição (informação geral)

```
GET https://www.fpb.pt/competicao/{provaId}
```

Esta é a página HTML pública. Não é uma API JSON, mas serve para confirmar que a prova existe e obter o nome e logo. O logo está disponível via asset directo (ver secção 6).

### 3.2 Calendário de jogos

```
GET https://sav2.fpb.pt/api/agenda/prova/{provaId}
```

Devolve os jogos agendados da competição: data, hora, equipas, pavilhão. Inclui jogos futuros e passados (sem resultado).

**Já tens** o equivalente para clubes em `/api/agenda/clube/{clubeId}` — a estrutura de resposta é semelhante.

### 3.3 Resultados

```
GET https://sav2.fpb.pt/api/resultados/prova/{provaId}
```

Devolve os jogos já disputados com resultados (pontuação final de cada equipa). Estrutura idêntica ao endpoint de resultados de clube que já tens.

### 3.4 Classificação

```
GET https://sav2.fpb.pt/api/classificacao/{provaId}
```

Devolve a tabela classificativa com as seguintes colunas por equipa:

| Campo | Significado |
|---|---|
| `posicao` | Posição na tabela |
| `equipa` | Nome da equipa |
| `j` | Jogos realizados |
| `v` | Vitórias |
| `d` | Derrotas |
| `fc` | Faltas cometidas (em algumas ligas) |
| `pm` | Pontos marcados |
| `ps` | Pontos sofridos |
| `dif` | Diferença de pontos |
| `pts` | Pontos na classificação |

Algumas competições têm múltiplas fases (Fase Regular, Playoff, etc.). Nesse caso a resposta inclui um campo `fase` ou a API aceita um parâmetro `?fase=` para filtrar. As ligas de topo (Liga Betclic Masc/Fem) têm Fase Regular + Playoffs.

### 3.5 Equipas inscritas

```
GET https://sav2.fpb.pt/api/equipas/prova/{provaId}
```

Lista de equipas participantes na competição: id do clube, nome, logo, associação regional.

### 3.6 Estatísticas de jogadores (ligas de topo)

```
GET https://sav2.fpb.pt/api/estatisticas/prova/{provaId}
```

Disponível principalmente nas Ligas Betclic (IDs `10902` e `10906`). Devolve estatísticas individuais por jogador, incluindo:

| Campo | Significado |
|---|---|
| `pts` | Pontos por jogo |
| `reb` | Ressaltos por jogo |
| `ast` | Assistências por jogo |
| `blk` | Blocos por jogo |
| `stl` | Roubos de bola por jogo |
| `val` | Valorização (índice de eficiência) |
| `min` | Minutos por jogo |
| `j` | Jogos disputados |

A **valorização** (`val`) é o índice de eficiência principal usado na FPB. Fórmula aproximada: `(pts + reb + ast + blk + stl) - (falhas + perdas + faltas)`.

Filtros disponíveis (parâmetros query):

```
?tipo=pts        # ordenar por pontos
?tipo=reb        # ordenar por ressaltos
?tipo=ast        # ordenar por assistências
?tipo=val        # ordenar por valorização (padrão)
?equipa={equipaId}  # filtrar por equipa
```

### 3.7 Rankings MVP / líderes estatísticos (ligas de topo)

```
GET https://sav2.fpb.pt/api/mvp/prova/{provaId}
```

Devolve os top jogadores em cada categoria (PTS, REB, AST, VAL). Usado para exibir o destaque "MVP" e líderes na página da liga.

### 3.8 Notícias da competição

```
GET https://www.fpb.pt/noticias/{provaId}
```

Página HTML com as notícias associadas à competição. Para dados estruturados de notícias usa o WordPress REST API do site FPB:

```
GET https://www.fpb.pt/wp-json/wp/v2/posts?categories={categoriaId}
```

---

## 4. Endpoints por clube

Substitui `{clubeId}` pelo ID numérico do clube.

### 4.1 Agenda do clube (já implementado)

```
GET https://sav2.fpb.pt/api/agenda/clube/{clubeId}
```

### 4.2 Resultados do clube (já implementado)

```
GET https://sav2.fpb.pt/api/resultados/clube/{clubeId}
```

### 4.3 Informação do clube

```
GET https://www.fpb.pt/equipa/equipa_{equipaId}
```

Nota: `equipaId` e `clubeId` podem diferir — `equipaId` é específico da inscrição numa competição numa época; `clubeId` é o identificador permanente do clube. Nos logos usa-se sempre `clubeId`.

### 4.4 Elenco / plantel

```
GET https://sav2.fpb.pt/api/plantel/equipa/{equipaId}
```

Lista de atletas inscritos para a época: nome, número de camisola, posição, nacionalidade, foto.

---

## 5. Endpoints de atletas

### 5.1 Perfil de atleta

```
GET https://www.fpb.pt/atletas/{atletaId}/
```

Página HTML do perfil público. Para dados estruturados:

```
GET https://sav2.fpb.pt/api/atleta/{atletaId}
```

Devolve: nome, data de nascimento, nacionalidade, clube actual, foto, histórico de clubes.

### 5.2 Estatísticas do atleta

```
GET https://sav2.fpb.pt/api/estatisticas/atleta/{atletaId}
```

Estatísticas por época e por competição.

---

## 6. Assets — logos e imagens

### Logos de competições (provas)

```
https://sav2.fpb.pt/uploads/provas/logotipos/logo{provaId}{timestamp}.png
```

Exemplo para a Liga Betclic Masculina (provaId `10902`):
```
https://sav2.fpb.pt/uploads/provas/logotipos/logo109021756223004.png
```

O `timestamp` varia — para obter o URL correcto, faz scrape da página `https://www.fpb.pt/competicao/{provaId}` e extrai o atributo `src` da imagem com a classe `Logo da Competição`. Em alternativa, tenta o padrão e faz fallback para o logo genérico da FPB.

### Logos de clubes — formato antigo (maioria dos clubes históricos)

```
https://sav2.fpb.pt/old_uploads/CLU/CLU_{clubeId}_LOGO.png
```

Exemplo (SL Benfica, clubeId `127`):
```
https://sav2.fpb.pt/old_uploads/CLU/CLU_127_LOGO.png
```

### Logos de clubes — formato novo (clubes mais recentes)

```
https://sav2.fpb.pt/uploads/clubes/logotipo/CLU_{timestamp}.png
```

Exemplo:
```
https://sav2.fpb.pt/uploads/clubes/logotipo/CLU_121663058006.png
```

O timestamp está disponível na resposta JSON dos endpoints de equipas/classificação. Estratégia recomendada: tenta primeiro o formato antigo; se der 404, usa o URL do formato novo vindo da API.

### Fotos de atletas

```
https://sav2.fpb.pt/uploads/atletas/foto/{atletaId}.jpg
```

---

## 7. Estrutura de dados — exemplos de resposta

### Exemplo: item de classificação

```json
{
  "posicao": 1,
  "equipa_id": "equipa_57682",
  "clube_id": 127,
  "nome": "SL Benfica",
  "abreviatura": "SLB",
  "logo": "https://sav2.fpb.pt/old_uploads/CLU/CLU_127_LOGO.png",
  "j": 21,
  "v": 19,
  "d": 2,
  "fc": 0,
  "pm": 2055,
  "ps": 1598,
  "dif": 457,
  "pts": 40
}
```

### Exemplo: jogo (agenda/resultado)

```json
{
  "jogo_id": "...",
  "prova_id": 10902,
  "jornada": 14,
  "data": "2026-02-15",
  "hora": "15:00",
  "equipa_casa_id": "equipa_57681",
  "equipa_casa_nome": "Sporting Clube Portugal",
  "equipa_fora_id": "equipa_57802",
  "equipa_fora_nome": "Futebol Clube do Porto",
  "resultado_casa": 85,
  "resultado_fora": 78,
  "pavilhao": "Pavilhão João Rocha",
  "estado": "terminado"
}
```

O campo `estado` pode ser `"agendado"`, `"em curso"` ou `"terminado"`.

### Exemplo: estatística de jogador

```json
{
  "atleta_id": 308193,
  "nome": "Delvin Barnstable",
  "clube_nome": "Esgueira Aveiro OLI",
  "j": 15,
  "pts": 21.1,
  "reb": 4.2,
  "ast": 3.8,
  "blk": 0.3,
  "stl": 1.1,
  "val": 24.7,
  "min": 32.4
}
```

---

## 8. Notas de implementação

### Disponibilidade de dados por tipo de liga

| Feature | Liga Betclic Masc/Fem | Proliga / 1ª Div | 2ª Div / Taças |
|---|---|---|---|
| Calendário | ✅ | ✅ | ✅ |
| Resultados | ✅ | ✅ | ✅ |
| Classificação | ✅ | ✅ | ✅ |
| Equipas | ✅ | ✅ | ✅ |
| Estatísticas individuais | ✅ | ⚠️ Parcial | ❌ |
| Rankings MVP | ✅ | ❌ | ❌ |
| Múltiplas fases (playoffs) | ✅ | ⚠️ Depende | ❌ |

### Identificadores importantes

- **provaId** — ID da competição. Estável entre épocas para a mesma competição (ex: `10902` é sempre a Liga Betclic Masculina, mas o conteúdo muda com a época).
- **equipaId** — ID da inscrição de uma equipa numa prova numa época. Formato: `equipa_XXXXX`. Muda cada época.
- **clubeId** — ID permanente do clube. Formato: número inteiro. Usado para logos e perfil do clube. Não muda entre épocas.
- **atletaId** — ID permanente do atleta. Número inteiro.

### CORS e acesso

Os endpoints `sav2.fpb.pt` são chamados directamente pelo browser no site FPB, portanto permitem CORS de origens externas. Não é necessário proxy no servidor para chamadas do lado do cliente.

### Paginação

A maioria dos endpoints não tem paginação — devolve todos os registos de uma vez. Para classificações e calendários completos isto é geralmente adequado (12 equipas numa liga = 12 registos; ~150 jogos numa época). Para estatísticas, a resposta pode ser maior mas ainda manejável.

### Épocas anteriores

A FPB mantém histórico de épocas anteriores. Para aceder a dados de épocas passadas, o provaId muda por época. A página `https://www.fpb.pt/competicoes/` tem um filtro de época que lista os IDs históricos. Nesta app foca-te na época corrente (2025/2026).

### Campos de valorização

A FPB usa o termo **valorização** (abreviado `val`) para o índice de eficiência — equivalente ao `PIR` (Performance Index Rating) da EuroLiga ou ao `PER` da NBA, mas calculado de forma diferente. É o campo mais importante para ordenação de estatísticas na app.

---

## Resumo rápido — endpoints mais usados nesta app

| O que queres | Endpoint |
|---|---|
| Calendário de uma liga | `GET sav2.fpb.pt/api/agenda/prova/{provaId}` |
| Resultados de uma liga | `GET sav2.fpb.pt/api/resultados/prova/{provaId}` |
| Classificação de uma liga | `GET sav2.fpb.pt/api/classificacao/{provaId}` |
| Equipas de uma liga | `GET sav2.fpb.pt/api/equipas/prova/{provaId}` |
| Estatísticas (ligas topo) | `GET sav2.fpb.pt/api/estatisticas/prova/{provaId}` |
| Agenda do clube (já tens) | `GET sav2.fpb.pt/api/agenda/clube/{clubeId}` |
| Resultados do clube (já tens) | `GET sav2.fpb.pt/api/resultados/clube/{clubeId}` |
| Logo de competição | `sav2.fpb.pt/uploads/provas/logotipos/logo{provaId}*.png` |
| Logo de clube | `sav2.fpb.pt/old_uploads/CLU/CLU_{clubeId}_LOGO.png` |
