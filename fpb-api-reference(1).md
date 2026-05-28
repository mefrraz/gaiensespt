# FPB API — Referência Completa para IA (v2 — verificada com dados reais)

> Todas as fontes de dados verificadas directamente contra as páginas da FPB em Maio 2026.
> **Regra fundamental:** toda a informação está nas páginas HTML de `fpb.pt`. Os dados são server-side rendered (não precisas de AJAX). Faz scraping do HTML directamente.

---

## 1. Arquitectura

| Domínio | Função |
|---|---|
| `https://www.fpb.pt` | Site WordPress. Os dados de classificação, estatísticas, resultados, calendário e ficha de jogo estão **no HTML** da página. |
| `https://sav2.fpb.pt` | Backend de assets: logos de clubes, fotos de atletas, logos de competições. |

CORS aberto — podes chamar directamente do browser/client sem proxy.

---

## 2. Competições — IDs confirmados (época 2025/2026)

| ID | Nome | Género | Tier |
|---|---|---|---|
| `10902` | Liga Betclic Masculina | Masculino | 1 — Liga de topo |
| `10906` | Liga Betclic Feminina | Feminino | 1 — Liga de topo |
| `10903` | Proliga | Masculino | 2 |
| `10904` | 1ª Divisão Masculina | Masculino | 3 |
| `10905` | 2ª Divisão Masculina | Masculino | 4 |
| `10907` | 1ª Divisão Feminina | Feminino | 2 |
| `10908` | 2ª Divisão Feminina | Feminino | 3 |
| `10917` | Taça Hugo dos Santos | Masculino | Taça |
| `10920` | Supertaça Feminina | Feminino | Supertaça |
| `10909` | Liga BCR | Misto | Formação |

---

## 3. Páginas e o que contêm no HTML

| Página | URL | Dados no HTML? |
|---|---|---|
| Calendário | `fpb.pt/calendario/{provaId}` | ✅ Sim — jogos futuros com data, hora, pavilhão |
| Resultados | `fpb.pt/resultados/{provaId}` | ✅ Sim — jogos passados com placard |
| Classificação | `fpb.pt/classificacao/{provaId}` | ✅ Sim — tabela completa |
| Estatísticas | `fpb.pt/estatistica/{provaId}` | ✅ Sim — top 5 + tabela completa atletas |
| Ficha de jogo | `fpb.pt/ficha-de-jogo?internalID={jogoId}` | ✅ Sim — box score completo por jogador |
| Equipas | `fpb.pt/equipas/{provaId}` | ❌ Apenas spinner — só via AJAX |

---

## 4. Calendário

**URL:** `https://www.fpb.pt/calendario/{provaId}`

### Estrutura de cada jogo (confirmada)

```
Data:        "29 MAR 2026"
Hora:        "15H00"
Casa:        nome + logo URL
Fora:        nome + logo URL
Pavilhão:    "Pavilhão Dragão Arena ,Porto"
Categoria:   "Sénior Masculino | Liga Betclic Masculina"
internalID:  número (ex: 390159) — usado para a ficha de jogo
Link:        fpb.pt/ficha-de-jogo?internalID={internalID}
TV:          logo fpbtv.png presente se houver transmissão
```

### Exemplos de jogos futuros (Jornada 22 — 29 Mar 2026)

| Data | Hora | Casa | Fora | Pavilhão |
|---|---|---|---|---|
| 29 MAR 2026 | 15H00 | FC Porto | Queluz O NOSSO PREGO | Pavilhão Dragão Arena, Porto |
| 4 ABR 2026 | 15H00 | Galitos BARREIRO ACEDE | SL Benfica | Pav. Municipal Prof Luís de Carvalho |
| 4 ABR 2026 | 16H00 | Ovarense GAVEX | FC Porto | Arena de Ovar |
| 4 ABR 2026 | 17H00 | Esgueira Aveiro OLI | Imortal LUZiGÁS | Pav. Clube do Povo de Esgueira |
| 4 ABR 2026 | 18H30 | SC Vasco da Gama | Sporting CP | Centro Desportos de Matosinhos |

---

## 5. Resultados

**URL:** `https://www.fpb.pt/resultados/{provaId}`

### Estrutura de cada resultado (confirmada)

```
Data:       "14 MAR 2026"
Casa:       nome + logo URL
Placard casa: número (ex: 106)
Placard fora: número (ex: 68)
Fora:       nome + logo URL
Pavilhão:   "Pavilhão Fidelidade ,Lisboa"
internalID: número — link para ficha de jogo
TV:         logo fpbtv.png se houve transmissão
```

### Últimos resultados confirmados (Jornada 21 — 14/16 Mar 2026)

| Data | Casa | Res | Fora |
|---|---|---|---|
| 16 MAR 2026 | Sporting CP | **78 – 73** | Galitos BARREIRO ACEDE |
| 14 MAR 2026 | Imortal LUZiGÁS | 100 – **107** | Ovarense GAVEX |
| 14 MAR 2026 | SL Benfica | **106 – 68** | Queluz O NOSSO PREGO |
| 14 MAR 2026 | UD Oliveirense | **87 – 77** | SC Braga |
| 14 MAR 2026 | Vitória SC | 69 – **114** | FC Porto |
| 14 MAR 2026 | SC Vasco da Gama | **98 – 84** | Esgueira Aveiro OLI |

---

## 6. Classificação

**URL:** `https://www.fpb.pt/classificacao/{provaId}`

**Filtro de Fase** disponível na página: `[ - | Fase Regular ]`

### Campos por equipa (confirmados)

| Campo | Descrição |
|---|---|
| Pos | Posição |
| Logo | URL directo `sav2.fpb.pt/...` |
| Nome | Nome completo |
| Abreviatura | Sigla 3 letras |
| equipaId | `equipa_XXXXX` — link: `fpb.pt/equipa/equipa_{equipaId}` |
| J | Jogos |
| V | Vitórias |
| D | Derrotas |
| FC | Faltas cometidas (= 0 na fase regular) |
| PM | Pontos marcados totais |
| PS | Pontos sofridos totais |
| DIF | Diferença (PM − PS) |
| PTS | Pontos classificação |

### Tabela completa — Fase Regular 2025/2026 (após 21 jogos)

| Pos | Equipa | Abrev | equipaId | J | V | D | PM | PS | DIF | PTS |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | SL Benfica | SLB | equipa_57682 | 21 | 19 | 2 | 2055 | 1598 | +457 | 40 |
| 2 | Sporting Clube Portugal | SCP | equipa_57681 | 21 | 17 | 4 | 1859 | 1628 | +231 | 38 |
| 3 | Futebol Clube do Porto | FCP | equipa_57802 | 21 | 15 | 6 | 1879 | 1726 | +153 | 36 |
| 4 | Ovarense GAVEX | OVA | equipa_57798 | 21 | 14 | 7 | 1730 | 1653 | +77 | 35 |
| 5 | UD Oliveirense | UDO | equipa_57806 | 21 | 12 | 9 | 1804 | 1743 | +61 | 33 |
| 6 | Imortal LUZiGÁS | IBC | equipa_57804 | 21 | 8 | 13 | 1798 | 1800 | -2 | 29 |
| 7 | Esgueira Aveiro OLI | ESG | equipa_57801 | 21 | 8 | 13 | 1787 | 1908 | -121 | 29 |
| 8 | Sporting Clube de Braga | SCB | equipa_57805 | 21 | 8 | 13 | 1681 | 1752 | -71 | 29 |
| 9 | Vitória Sport Clube | VSC | equipa_57807 | 21 | 7 | 14 | 1747 | 1910 | -163 | 28 |
| 10 | Queluz O NOSSO PREGO | CAQ | equipa_57799 | 21 | 7 | 14 | 1746 | 1849 | -103 | 28 |
| 11 | SC Vasco da Gama | VGA | equipa_57800 | 21 | 6 | 15 | 1759 | 2049 | -290 | 27 |
| 12 | Galitos BARREIRO ACEDE | GFC | equipa_57803 | 21 | 5 | 16 | 1724 | 1953 | -229 | 26 |

---

## 7. Estatísticas

**URL:** `https://www.fpb.pt/estatistica/{provaId}`

### Filtros disponíveis (confirmados)

```
Fase:    [ - | Fase Regular ]
Jornada: [ - | 1..22 ]
Equipa:  [ - | Esgueira Aveiro OLI | FC Porto | Galitos BARREIRO ACEDE |
           Imortal LUZiGÁS | Ovarense GAVEX | Queluz O NOSSO PREGO |
           SC Vasco da Gama | SL Benfica | Sporting Clube Portugal |
           Sporting Clube de Braga | UD Oliveirense | Vitória Sport Clube ]
Ranking: [ Jogos | Minutos | Pontos | 2C | 2T | %L2 | 3C | 3T | %L3 |
           LLC | LLT | %LL | RO | RD | RT | AS | RB | PB | DL | FC | FS | MVP ]
```

### Tabs disponíveis: TOP 5 / ATLETA / EQUIPA

### Colunas da tabela ATLETA (22 campos confirmados)

| Coluna | Descrição |
|---|---|
| J | Jogos |
| MIN | Minutos (total e média) |
| PM | Pontos marcados (total e média) |
| 2C / 2T / %L2 | Lançamentos 2pts convertidos / tentados / % |
| 3C / 3T / %L3 | Lançamentos 3pts convertidos / tentados / % |
| LLC / LLT / %LL | Lances livres convertidos / tentados / % |
| RO / RD / RT | Ressaltos ofensivos / defensivos / totais |
| AS | Assistências |
| RB | Roubos de bola |
| PB | Perdas de bola |
| DL | Desarmes de lançamento (blocos) |
| FC | Faltas cometidas |
| FS | Faltas sofridas |
| MVP | **Valorização** (índice de eficiência — campo mais importante) |

### Top rankings confirmados (Fase Regular 2025/2026)

**Valorização (MVP):** Brayden Carter (GFC) 23.9 · Jackson Stormo (OVA) 22.5 · Akoi Yuot (VGA) 21.0 · Brandon Johns (SCP) 20.5 · Malik Porter (ESG) 20.2

**Pontos/jogo:** Delvin Barnstable (ESG) 21.1 · Brayden Carter (GFC) 20.9 · James Boeheim III (UDO) 19.3 · Akoi Yuot (VGA) 18.8 · Quentin Eyobo (GFC) 18.4

**Ressaltos/jogo:** Jackson Stormo (OVA) 9.8 · Brayden Carter (GFC) 8.1 · Malik Porter (ESG) 7.9 · Ricardo Monteiro (SCB) 7.6 · Brandon Johns (SCP) 7.5

**Assistências/jogo:** Michael Bradley (CAQ) 8.7 · Hugo Ferreira (ESG) 6.9 · Miguel Maria (FCP) 6.1 · Eugene Crandall IV (SLB) 6.0 · Carlos Cardoso (SCB) 5.8

**%L2 (mín. jogos):** Makram Romdhane (SLB) 76% · James Boeheim III (UDO) 71% · Brandon Johns (SCP) 70%

**%L3:** Gustavo Teixeira (OVA) 54% · Vladyslav Voytso (FCP) 52% · Brayden Carter (GFC) 51%

**%LL:** De Shaun Wade (CAQ) 95% · Michael Bradley (CAQ) 93% · Rúben Nobre (VGA) 90%

**Roubos/jogo:** Tanner Omlid (FCP) 2.6 · Eugene Crandall IV (SLB) 2.5 · Malique Jacobs (VSC) 2.1

**Desarmes/jogo:** Malik Porter (ESG) 1.5 · Jesse Bingham II (SCB) 1.2 · Malique Jacobs (VSC) 1.1

---

## 8. Ficha de Jogo ⭐ (descoberta nova — não estava no documento anterior)

**URL:** `https://www.fpb.pt/ficha-de-jogo?internalID={internalID}`

O `internalID` de cada jogo vem dos links nas páginas de Calendário e Resultados.

### Dados disponíveis no HTML (confirmados com jogo 390144: Sporting CP 78–73 Galitos, 16 Mar 2026)

**Cabeçalho do jogo:**
```
Fase:        "Fase Regular 16"  (fase + número de jornada)
Data:        "16 MAR 2026"
Casa:        nome, abreviatura, logo
Fora:        nome, abreviatura, logo
Resultado:   78 – 73
Parciais:    Q1 21-18 | Q2 24-16 | Q3 16-23 | Q4 17-16
Pavilhão:    "Pavilhão João Rocha" — link: fpb.pt/recinto/{recintoId}
Espectadores: 234
```

**Game Leaders (por categoria):**
```
Pontos:      Malik Morgan (SCP) 13 pts  |  Brayden Carter (GFC) 21 pts
Ressaltos:   Francisco Amarante (SCP) 9  |  Brayden Carter (GFC) 10
Assistências: Francisco Amarante (SCP) 5  |  Walyn Napper (GFC) 3
Roubos:      Miguel Correia (SCP) 3      |  Brayden Carter (GFC) 4
Desarmes:    Brandon Johns (SCP) 0       |  Teotonio Dó (GFC) 2
```

**Box Score completo por jogador** (para cada equipa):

Colunas por jogador: `nº | nome | MIN | PTS | L2 | L2% | L3 | L3% | LL | LL% | RO | RD | TR | AS | RB | TO | DL | FC | FS | +/- | VAL`

Exemplo (Brayden Carter, Galitos, jogo 390144):
```
nº: 8 | MIN: 36:37 | PTS: 21 | L2: 9/13 (69%) | L3: 1/2 (50%) | LL: 0/0
RO: 5 | RD: 5 | TR: 10 | AS: 1 | RB: 4 | TO: 3 | DL: 0 | FC: 2 | FS: 0 | +/-: 0 | VAL: 29.5
```

Exemplo (Francisco Amarante, Sporting CP, jogo 390144):
```
nº: 6 | MIN: 32:48 | PTS: 10 | L2: 2/2 (100%) | L3: 1/6 (17%) | LL: 3/6 (50%)
RO: 3 | RD: 6 | TR: 9 | AS: 5 | RB: 1 | TO: 3 | DL: 0 | FC: 1 | FS: 3 | +/-: 0 | VAL: 16.5
```

**Totais de equipa** (confirmados):
```
Sporting CP:  78 pts | L2: 17/32 (53%) | L3: 9/35 (26%) | LL: 17/24 (71%)
              RT: 47 | AS: 14 | RB: 11 | TO: 18 | DL: 0 | FC: 15 | VAL total: 90.5

Galitos:      73 pts | L2: 23/47 (49%) | L3: 6/25 (24%) | LL: 9/13 (69%)
              RT: 39 | AS: 13 | RB: 11 | TO: 13 | DL: 3 | FC: 21 | VAL total: 79.5
```

**Team Stats comparativas:**
```
2 Pontos %:        53% – 49%
3 Pontos %:        26% – 24%
Lances Livres %:   71% – 69%
Assistências:      14 – 13
Ressaltos:         47 – 39
Turnovers:         18 – 13
Roubos:            11 – 11
Desarmes:          0 – 3
```

**Key Stats avançados:**
```
Pontos de turnover:         7 – 20
Pontos em contra-ataque:   14 – 14
Pontos 2os lançamentos:    14 – 6
Pontos no pintado:         34 – 40
Pontos do banco:           42 – 29
```

**Evolução do marcador:** dados por quarto (Q1, Q2, Q3, Q4)

**Estatísticas de jogo adicionais:**
```
Maior vantagem:     14 – 5
Maior sequência:    10 – 11
Alternâncias liderança: 5
Empates: 5
Tempo na liderança: 27:27 – 09:22
```

**Top Performers (MVP do jogo):**
```
Francisco Amarante (SCP): VAL 17 | PTS 10 | REB 9 | AS 5 | RB 1 | DL 0
Brayden Carter (GFC):     VAL 30 | PTS 21 | REB 10 | AS 1 | RB 4 | DL 0
```

**Juízes (confirmados):**
```
Comissário, Observador Vídeo, Árbitro Principal, Árbitro Auxiliar 1 e 2,
Marcador, Marcador Auxiliar, Cronometrista, Operador 24"
Cada um com nome e número de licença, link: fpb.pt/juizes/{licencaId}
```

**Elencos completos de ambas as equipas:**
Número de camisola + nome + link `fpb.pt/atletas/{atletaId}` + foto `sav2.fpb.pt/uploads/utilizadores/{userId}_{timestamp}.{ext}`

**Nota sobre fotos de atletas:** nas fichas de jogo a foto vem de `sav2.fpb.pt/uploads/utilizadores/` (não `/atletas/foto/`). Exemplo: `sav2.fpb.pt/uploads/utilizadores/270813_1761145317.jpg` (Brayden Carter).

---

## 9. Assets — logos e fotos (padrões confirmados)

### Logos de competições

```
https://sav2.fpb.pt/uploads/provas/logotipos/logo{provaId}{timestamp}.png
```
Único confirmado (Liga Betclic Masculina):
```
https://sav2.fpb.pt/uploads/provas/logotipos/logo109021756223004.png
```
Para obter o URL: faz fetch de `fpb.pt/competicao/{provaId}` e extrai `src` de `img[alt="Logo da Competição"]`.

### Logos de clubes — formato antigo

```
https://sav2.fpb.pt/old_uploads/CLU/CLU_{clubeId}_LOGO.png
```

| Clube | clubeId | URL confirmado |
|---|---|---|
| SL Benfica | 127 | `CLU_127_LOGO.png` ✅ |
| Sporting CP | 169 | `CLU_169_LOGO.png` ✅ |
| FC Porto | 120 | `CLU_120_LOGO.png` ✅ |
| UD Oliveirense | 28 | `CLU_28_LOGO.png` ✅ |
| Esgueira Aveiro | 18 | `CLU_18_LOGO.png` ✅ |
| Vitória SC | 2300 | `CLU_2300_LOGO.png` ✅ |

### Logos de clubes — formato novo (timestamp)

```
https://sav2.fpb.pt/uploads/clubes/logotipo/CLU_{timestamp}.png
```

| Clube | URL confirmado |
|---|---|
| Ovarense GAVEX | `CLU_121663058006.png` ✅ |
| Imortal LUZiGÁS | `CLU_29321738335536.png` ✅ |
| SC Braga | `CLU_24041710324824.png` ✅ |
| Queluz | `CLU_1901763134433.png` ✅ |
| SC Vasco da Gama | `CLU_1761675707996.png` ✅ |
| Galitos Barreiro | `CLU_1821741023871.png` ✅ |

**Estratégia:** o URL do logo está sempre presente directamente na classificação e nos resultados — lê-o de lá, nunca o infiras.

### Fotos de atletas (dois padrões)

```
# Usado na ficha de jogo (mais fiável — tem foto de perfil)
https://sav2.fpb.pt/uploads/utilizadores/{userId}_{timestamp}.{jpg|png}

# Padrão alternativo por atletaId
https://sav2.fpb.pt/uploads/atletas/foto/{atletaId}.jpg
```

---

## 10. Identificadores

| ID | Formato | Permanência | Exemplo |
|---|---|---|---|
| `provaId` | Inteiro | Por época | `10902` |
| `internalID` | Inteiro | Por jogo | `390144` = SCP vs GFC 16 Mar 2026 |
| `equipaId` | `equipa_XXXXX` | Por época (muda) | `equipa_57682` = Benfica 2025/26 |
| `clubeId` | Inteiro | **Permanente** | `127` = SL Benfica sempre |
| `atletaId` | Inteiro | **Permanente** | `314926` = Brayden Carter |
| `recintoId` | Inteiro | Permanente | `10284` = Pavilhão João Rocha |

---

## 11. Resumo de abordagem por tipo de dados

| Dados | URL | Dados no HTML? |
|---|---|---|
| Calendário jogos futuros | `fpb.pt/calendario/{provaId}` | ✅ |
| Resultados | `fpb.pt/resultados/{provaId}` | ✅ |
| Classificação | `fpb.pt/classificacao/{provaId}` | ✅ |
| Estatísticas individuais | `fpb.pt/estatistica/{provaId}` | ✅ |
| Box score de jogo | `fpb.pt/ficha-de-jogo?internalID={id}` | ✅ |
| Equipas da competição | `fpb.pt/equipas/{provaId}` | ❌ só AJAX |
| Logo de competição | Extrair do HTML de `fpb.pt/competicao/{provaId}` | ✅ |
| Logo de clube | Vem incluído na classificação e resultados | ✅ |

---

## 12. Disponibilidade por competição

| Funcionalidade | Liga Betclic Masc/Fem | Proliga / 1ª Div | 2ª Div / Taças |
|---|---|---|---|
| Calendário | ✅ | ✅ | ✅ |
| Resultados | ✅ | ✅ | ✅ |
| Classificação | ✅ | ✅ | ⚠️ |
| Ficha de jogo (box score) | ✅ Completo | ✅ | ⚠️ Parcial |
| Estatísticas individuais | ✅ 22 campos | ⚠️ | ❌ |
| Top 5 por categoria | ✅ | ⚠️ | ❌ |
