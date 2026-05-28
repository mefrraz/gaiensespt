# FPB — Classificação: Como Funciona e Como Parsear

> Documento focado exclusivamente na página de classificação da FPB.
> URL: `https://www.fpb.pt/classificacao/{provaId}`
> Testado com provaId `10902` (Liga Betclic Masculina 2025/2026).

---

## O que acontece na página

A página tem **duas partes**:

1. **Tabela da Fase Regular** — renderizada server-side, presente no HTML inicial quando fazes o fetch. ✅ Consegues parsear.
2. **Conteúdo adicional de playoffs/outras fases** — carregado via AJAX depois (indicado pelo `ball_spin.gif` no final do HTML). ❌ Não está no HTML inicial.

Ou seja: **o fetch simples da página dá-te sempre a Fase Regular**. Para playoffs precisas de AJAX (ver secção 5).

---

## Estrutura HTML exacta da tabela

O HTML **não usa uma `<table>` normal**. Cada linha da classificação é uma sequência de elementos `<h5>` dentro de `<div>`s. O padrão real extraído do HTML é:

```html
<!-- Cabeçalho -->
<h5>J</h5>
<h5>V</h5>
<h5>D</h5>
<h5>FC</h5>
<h5>PM</h5>
<h5>PS</h5>
<h5>DIF</h5>
<h5>PTS</h5>

<!-- Linha de equipa (repete para cada equipa) -->
<h5><strong>1</strong></h5>                          ← posição
<img src="https://sav2.fpb.pt/old_uploads/CLU/CLU_127_LOGO.png" alt="Logo Equipa 1">
<a href="/equipa/equipa_57682">
  <h5>SL Benfica</h5>
  <h5>SLB</h5>
</a>
<h5>21</h5>   ← J
<h5>19</h5>   ← V
<h5>2</h5>    ← D
<h5>0</h5>    ← FC
<h5>2055</h5> ← PM
<h5>1598</h5> ← PS
<h5>457</h5>  ← DIF
<h5><strong>40</strong></h5>  ← PTS
```

**Nota:** a posição e os PTS estão dentro de `<strong>`. Os restantes campos são `<h5>` simples. O logo é um `<img>` entre a posição e o link da equipa.

---

## Como parsear (JavaScript/fetch)

```js
const res = await fetch('https://www.fpb.pt/classificacao/10902');
const html = await res.text();

// Usar um parser de HTML (ex: DOMParser no browser, ou cheerio/node-html-parser no Node)
const doc = new DOMParser().parseFromString(html, 'text/html');

// A tabela está dentro de uma secção com h5s
// Cada bloco de equipa começa num h5 > strong (a posição)
// Seguido de: img, a[href*="/equipa/"], 8× h5 com stats
```

### Estratégia de parsing recomendada

Os dados estão todos como texto `h5` em sequência. A forma mais fiável é:

1. Encontrar todos os `<img>` com `alt` que começa com `"Logo Equipa"` — cada um desses é uma linha de equipa.
2. Para cada imagem, o container pai tem todos os `h5` da linha.

```js
// Browser (com DOMParser)
async function getClassificacao(provaId) {
  const res = await fetch(`https://www.fpb.pt/classificacao/${provaId}`);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Todos os imgs de logo de equipa
  const logos = [...doc.querySelectorAll('img[alt^="Logo Equipa"]')];

  return logos.map(img => {
    // O link da equipa é o próximo <a> após o img
    const link = img.nextElementSibling;
    const equipaId = link?.href?.match(/equipa_(\d+)/)?.[1];
    const nome = link?.querySelector('h5:first-child')?.textContent?.trim();
    const abrev = link?.querySelector('h5:last-child')?.textContent?.trim();

    // Os h5 de stats vêm a seguir ao link
    // Percorre os siblings depois do link
    const stats = [];
    let el = link?.nextElementSibling;
    while (el && stats.length < 8) {
      if (el.tagName === 'H5') stats.push(el.textContent.trim());
      el = el.nextElementSibling;
    }
    const [J, V, D, FC, PM, PS, DIF, PTS] = stats;

    return {
      logoUrl: img.src,
      equipaId: `equipa_${equipaId}`,
      nome,
      abrev,
      J: +J, V: +V, D: +D, FC: +FC,
      PM: +PM, PS: +PS, DIF: +DIF, PTS: +PTS
    };
  });
}
```

### Alternativa mais robusta (por posição no DOM)

```js
// Todos os h5 strong são posições (1, 2, 3...)
// Conta os siblings até ao próximo h5 strong para delimitar cada linha
const allH5 = [...doc.querySelectorAll('h5')];

// Encontra o índice do cabeçalho (contém "J", "V", "D"...)
const headerIdx = allH5.findIndex(h => h.textContent.trim() === 'J');

// A partir daí, cada linha tem: pos(strong), [img], [link], J, V, D, FC, PM, PS, DIF, PTS(strong)
// Mas como os imgs e links não são h5, conta apenas os h5 por linha = 9 (pos + 7 stats + pts)
```

---

## Dados confirmados — tabela completa (após 21 jogos, Fase Regular)

| Pos | Logo | Nome | Abrev | equipaId | J | V | D | FC | PM | PS | DIF | PTS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `CLU_127_LOGO.png` | SL Benfica | SLB | equipa_57682 | 21 | 19 | 2 | 0 | 2055 | 1598 | 457 | 40 |
| 2 | `CLU_169_LOGO.png` | Sporting Clube Portugal | SCP | equipa_57681 | 21 | 17 | 4 | 0 | 1859 | 1628 | 231 | 38 |
| 3 | `CLU_120_LOGO.png` | Futebol Clube do Porto | FCP | equipa_57802 | 21 | 15 | 6 | 0 | 1879 | 1726 | 153 | 36 |
| 4 | `CLU_121663058006.png` | Ovarense GAVEX | OVA | equipa_57798 | 21 | 14 | 7 | 0 | 1730 | 1653 | 77 | 35 |
| 5 | `CLU_28_LOGO.png` | UD Oliveirense | UDO | equipa_57806 | 21 | 12 | 9 | 0 | 1804 | 1743 | 61 | 33 |
| 6 | `CLU_29321738335536.png` | Imortal LUZiGÁS | IBC | equipa_57804 | 21 | 8 | 13 | 0 | 1798 | 1800 | -2 | 29 |
| 7 | `CLU_18_LOGO.png` | Esgueira Aveiro OLI | ESG | equipa_57801 | 21 | 8 | 13 | 0 | 1787 | 1908 | -121 | 29 |
| 8 | `CLU_24041710324824.png` | Sporting Clube de Braga | SCB | equipa_57805 | 21 | 8 | 13 | 0 | 1681 | 1752 | -71 | 29 |
| 9 | `CLU_2300_LOGO.png` | Vitória Sport Clube | VSC | equipa_57807 | 21 | 7 | 14 | 0 | 1747 | 1910 | -163 | 28 |
| 10 | `CLU_1901763134433.png` | Queluz O NOSSO PREGO | CAQ | equipa_57799 | 21 | 7 | 14 | 0 | 1746 | 1849 | -103 | 28 |
| 11 | `CLU_1761675707996.png` | SC Vasco da Gama | VGA | equipa_57800 | 21 | 6 | 15 | 0 | 1759 | 2049 | -290 | 27 |
| 12 | `CLU_1821741023871.png` | Galitos BARREIRO ACEDE | GFC | equipa_57803 | 21 | 5 | 16 | 0 | 1724 | 1953 | -229 | 26 |

---

## URLs completos dos logos (confirmados)

```
SL Benfica:              https://sav2.fpb.pt/old_uploads/CLU/CLU_127_LOGO.png
Sporting CP:             https://sav2.fpb.pt/old_uploads/CLU/CLU_169_LOGO.png
FC Porto:                https://sav2.fpb.pt/old_uploads/CLU/CLU_120_LOGO.png
Ovarense GAVEX:          https://sav2.fpb.pt/uploads/clubes/logotipo/CLU_121663058006.png
UD Oliveirense:          https://sav2.fpb.pt/old_uploads/CLU/CLU_28_LOGO.png
Imortal LUZiGÁS:        https://sav2.fpb.pt/uploads/clubes/logotipo/CLU_29321738335536.png
Esgueira Aveiro OLI:     https://sav2.fpb.pt/old_uploads/CLU/CLU_18_LOGO.png
Sporting Clube de Braga: https://sav2.fpb.pt/uploads/clubes/logotipo/CLU_24041710324824.png
Vitória Sport Clube:     https://sav2.fpb.pt/old_uploads/CLU/CLU_2300_LOGO.png
Queluz O NOSSO PREGO:    https://sav2.fpb.pt/uploads/clubes/logotipo/CLU_1901763134433.png
SC Vasco da Gama:        https://sav2.fpb.pt/uploads/clubes/logotipo/CLU_1761675707996.png
Galitos BARREIRO ACEDE:  https://sav2.fpb.pt/uploads/clubes/logotipo/CLU_1821741023871.png
```

---

## Filtro de Fase — como funciona

No HTML há um bloco de filtros:

```html
<!-- Dropdown de Fase -->
<select> <!-- ou lista de opções -->
  <option>-</option>
  <option>Fase Regular</option>
  <!-- Em ligas com playoffs apareceria também: Playoffs, Quartos, Meias-finais, Final -->
</select>
```

**O fetch sem parâmetros devolve sempre a Fase Regular** (a primeira fase). Para outras fases a página usa POST ou query param via AJAX — a tabela de playoffs **não está no HTML inicial**, só carrega via JavaScript depois.

Se precisares de playoffs: tens de interceptar o pedido XHR que o browser faz ao clicar no filtro (DevTools → Network → XHR/Fetch enquanto seleccionas "Playoffs").

---

## Problemas comuns e soluções

### Problema: "não consigo parsear a tabela"

**Causa:** a estrutura não é `<table><tr><td>` — são `<h5>` soltos sem container de linha explícito.

**Solução:** usa os `<img alt="Logo Equipa N">` como âncoras. Cada imagem marca o início de uma linha de equipa. Os dados dessa linha estão nos siblings imediatos.

### Problema: "o DIF aparece como string '457' mas quero número"

**Causa:** DIF pode ser negativo (ex: `-2`, `-121`). Parseia sempre como `parseInt()` ou `Number()`, que tratam o sinal correctamente.

### Problema: "só aparecem os primeiros resultados"

**Causa:** se estás a fazer scraping server-side (Node/backend), o HTML que recebes **é o mesmo que eu recebi** — a tabela completa das 12 equipas está lá toda. Não há paginação na Fase Regular.

### Problema: "quero os dados de playoffs mas não aparecem"

**Causa:** os playoffs carregam via AJAX após o HTML inicial. O `ball_spin.gif` no fim da tabela é o indicador.

**Solução actual conhecida:** não há endpoint público documentado. Opções:
1. Usar Puppeteer/browser headless para carregar a página completa e depois parsear.
2. Interceptar a chamada XHR no DevTools e replicá-la.

---

## Campos de cada equipa — definições

| Campo | Tipo | Descrição |
|---|---|---|
| `logoUrl` | string URL | URL directo da imagem. Dois formatos: `old_uploads/CLU/CLU_{id}_LOGO.png` (clubes históricos) ou `uploads/clubes/logotipo/CLU_{timestamp}.png` (clubes novos). Lê sempre do HTML — não infiras. |
| `equipaId` | string `equipa_XXXXX` | ID da inscrição nesta época. Muda cada época. Link: `fpb.pt/equipa/{equipaId}` |
| `nome` | string | Nome completo (ex: `"SL Benfica"`, `"Queluz O NOSSO PREGO"`) |
| `abrev` | string 3 letras | Sigla (ex: `SLB`, `CAQ`, `GFC`) |
| `J` | int | Jogos realizados |
| `V` | int | Vitórias |
| `D` | int | Derrotas (`J = V + D` sempre) |
| `FC` | int | Faltas cometidas — na Fase Regular é sempre `0` neste endpoint |
| `PM` | int | Pontos marcados totais na época |
| `PS` | int | Pontos sofridos totais na época |
| `DIF` | int | `PM - PS` (pode ser negativo) |
| `PTS` | int | Pontos na classificação. Fórmula: `V * 2 + D * 1 + J` (base) — na prática `PTS = J + V` |
