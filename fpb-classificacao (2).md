# FPB — Classificação: Endpoint Real e Como Usar

> Baseado na análise do console do browser ao abrir `fpb.pt/classificacao/10902`.
> O log `classificacao.js:302` expôs os parâmetros exactos da chamada à API.

---

## A verdade sobre como funciona

**A classificação NÃO está no HTML inicial.** É carregada via JavaScript depois da página carregar, através de uma chamada ao `sav2.fpb.pt`. O HTML só tem o esqueleto da página.

O ficheiro `classificacao.js` da FPB faz a chamada com estes parâmetros (confirmados no console):

```
competicao: [10902]
fase: "30969"
resultado: Array []   ← array vazio = bug ou endpoint a descobrir
```

---

## O endpoint real (a confirmar)

Com base nos parâmetros expostos, o endpoint que o JS chama é provavelmente um destes:

```
GET https://sav2.fpb.pt/api/classificacao?competicao=10902&fase=30969
GET https://sav2.fpb.pt/api/classificacao/10902/30969
POST https://sav2.fpb.pt/api/classificacao  { competicao: 10902, fase: 30969 }
```

**Para confirmar o URL exacto:** DevTools → F12 → separador **Network** → filtra por **XHR** ou **Fetch** → recarrega a página → procura um pedido para `sav2.fpb.pt` com "classificacao" no nome. Clica nele e vê o URL completo em "Headers".

---

## O parâmetro `fase` — o que é

`fase` **não é um nome** ("Fase Regular") — é um **ID numérico interno** do sav2.

Para a Liga Betclic Masculina 2025/2026:
- Fase Regular = `30969`

Cada época e cada competição tem IDs de fase diferentes. O HTML da página contém estes IDs nas opções do dropdown de filtro:

```html
<!-- No HTML de fpb.pt/classificacao/10902 -->
<ul>
  <li>Fase Regular</li>   <!-- data-value ou value = 30969 -->
</ul>
```

**Para obter o ID de fase:** faz fetch do HTML de `fpb.pt/classificacao/{provaId}`, procura o elemento do filtro de Fase e extrai o valor/ID associado a cada opção. O texto "Fase Regular" corresponde ao ID `30969` para esta competição.

---

## Por que o resultado foi `Array []` (vazio)

Há duas causas prováveis:

**1. CORS / autenticação no sav2** — o `sav2.fpb.pt` pode exigir que o pedido venha do próprio domínio `fpb.pt` (via `Referer` ou `Origin` header). Se chamares directamente da tua app, pode devolver vazio ou erro.

**Solução:** adiciona os headers:
```js
fetch(url, {
  headers: {
    'Referer': 'https://www.fpb.pt/',
    'Origin': 'https://www.fpb.pt'
  }
})
```

**2. O endpoint usa POST** — se for POST e estiveres a fazer GET, devolve array vazio em vez de erro.

---

## Como descobrir o endpoint exacto (passo a passo)

1. Abre `https://www.fpb.pt/classificacao/10902` no browser
2. F12 → separador **Network**
3. Filtra por **XHR** (ou **Fetch**)
4. Recarrega a página (Ctrl+R)
5. Aguarda o carregamento da tabela
6. Procura um pedido para `sav2.fpb.pt` — clica nele
7. Em **Headers** vê: método (GET/POST), URL completo, headers enviados
8. Em **Request** (se POST) vê o body enviado
9. Em **Response** vê o JSON devolvido

Reporta aqui o que encontrares — URL completo + método + body se POST + exemplo da resposta JSON.

---

## O que já sabemos com certeza

| Facto | Fonte |
|---|---|
| A chamada usa `competicao=10902` e `fase=30969` | Console log `classificacao.js:302` |
| `fase=30969` é o ID interno da Fase Regular desta liga | Console log |
| O resultado veio `Array []` (vazio) | Console log |
| Os logos das equipas foram carregados com sucesso (HTTP 200) | Network log |
| O ficheiro JS responsável é `classificacao.js`, linha 302 | Console log |

---

## Dados reais da tabela (obtidos via HTML server-side em sessão anterior)

Mesmo que a chamada AJAX esteja a falhar, estes dados estão no HTML inicial da página e são válidos:

| Pos | Nome | Abrev | equipaId | J | V | D | PM | PS | DIF | PTS |
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

**Fonte alternativa funcional:** estes dados estão no HTML de `fpb.pt/classificacao/10902` parseado directamente. Se a chamada AJAX continua a falhar, usa esta abordagem como fallback — faz fetch da página HTML e parseia os `<h5>` (ver estrutura na secção seguinte).

---

## Estrutura HTML como fallback

Se o endpoint AJAX não funcionar, os dados estão no HTML. Cada equipa segue este padrão:

```html
<h5><strong>{posição}</strong></h5>
<img src="https://sav2.fpb.pt/.../CLU_XXX_LOGO.png" alt="Logo Equipa N">
<a href="/equipa/equipa_{equipaId}">
  <h5>{nome}</h5>
  <h5>{abreviatura}</h5>
</a>
<h5>{J}</h5>
<h5>{V}</h5>
<h5>{D}</h5>
<h5>{FC}</h5>
<h5>{PM}</h5>
<h5>{PS}</h5>
<h5>{DIF}</h5>
<h5><strong>{PTS}</strong></h5>
```

Âncora de parsing: `img[alt^="Logo Equipa"]` — cada imagem com este alt marca o início de uma linha.
