import sys

content = r"""# Dribly — Basquetebol português no teu bolso

App web (PWA) gratuita e open-source para acompanhar todos os clubes de basquetebol registados na Federação Portuguesa de Basquetebol (FPB).

**Site:** https://dribly.vercel.app

---

## Objetivo

O Dribly nasceu da frustração de não existir uma plataforma única, rápida e mobile-first para acompanhar o basquetebol português. O site da FPB é funcional mas pesado e sem otimização mobile. O Swish é pago e focado apenas numa competição. O TugaBasket é desktop-only.

O Dribly resolve isto:

- **Gratuito** — sem subscrições, sem anúncios
- **Mobile-first** — feito para o telemóvel, com PWA instalável
- **Multi-clube** — segue todos os clubes, não apenas um
- **Multi-escalão** — seniores, sub18, sub16, sub14, tudo num só sítio
- **Dados oficiais** — tudo vem diretamente da FPB
- **Open Source** — qualquer pessoa pode contribuir, auditar ou fazer fork

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS |
| Base de dados | Supabase (PostgreSQL) |
| Cache local | localStorage + Service Worker |
| Deploy | Vercel (static + Edge Functions) |
| API externa | FPB + TugaBasket |
| PWA | vite-plugin-pwa |

## Porquê o Dribly?

| Funcionalidade | Dribly | FPB | Swish | TugaBasket | FPB TV |
|---|---|---|---|---|---|
| Mobile-first | sim | sim | sim | nao | sim |
| PWA instalavel | sim | nao | sim | nao | nao |
| Open Source | sim | nao | nao | nao | nao |
| Gratuito | sim | sim | nao | sim | sim |
| Multi-clube | sim | sim | limitado | nao | nao |
| Multi-escalao | sim | sim | limitado | nao | nao |
| Offline parcial | sim | nao | nao | nao | nao |
| Mapas | sim | nao | nao | nao | nao |
| Modo claro/escuro | sim | nao | sim | nao | nao |

## Funcionalidades

- **Pesquisa de clubes** — 281 clubes FPB com cores e logotipos
- **Jogos e agenda** — proximos jogos, resultados, fichas de jogo
- **Classificacoes** — todas as competicoes por associacao
- **Multi-clube** — segue varios clubes ao mesmo tempo
- **PWA** — instala como app no telemovel
- **Modo escuro** — tema claro/escuro
- **Offline parcial** — cache inteligente com dados recentes
- **Tema dinamico** — cada clube tem a sua cor (accent color)

## Setup Local

```
git clone https://github.com/mefrraz/dribly.git
cd dribly/web
npm install
npm run dev
```

Variaveis de ambiente (ver Supabase Dashboard > Settings > API):

```
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[anon public key]
```

## Estrutura do Projeto

```
web/
  src/
    lib/
      fpbApi.ts            parser HTML da FPB (DOMParser)
      tugabasketApi.ts     parser TugaBasket (classificacoes)
      ClubContext.tsx       estado global de clubes (React Context)
      associationLogos.ts  mapeamento logos das associacoes
      supabase.ts          cliente Supabase
    hooks/
      useGames.ts          jogos com cache 15 min + localStorage
      useStandings.ts      classificacoes com cache
    components/
      BottomNav.tsx        navegacao inferior mobile
      SearchModal.tsx      pesquisa de clubes e competicoes
      GameCard.tsx         cartao de jogo reutilizavel
    pages/
      Landing.tsx          pagina inicial com carrosseis
      SearchPage.tsx       pagina de pesquisa dedicada
      club/                paginas por clube
      Game.tsx             ficha de jogo individual
      Standings.tsx        classificacoes por associacao
      AssociationCompetitions.tsx  competicao de cada associacao
      About.tsx            sobre o projeto
  api/
    fpb.ts                 Edge Function (proxy FPB)
    tugabasket.ts          Edge Function (proxy TugaBasket)
scrapers/
  discover-competitions.py scraper de competicoes (Python)
```

## Fluxo de Dados (Tecnico)

### Jogos

```
Browser >> /api/fpb?page=calendario&clube=169&epoca=2025/2026
             >> Vercel Edge Function
             >> https://www.fpb.pt/calendario/clube_169/
             >> HTML da FPB
             >> Browser: DOMParser >> Match[]
             >> setState React (UI imediata)
             >> upsert Supabase (cache partilhado)
```

A FPB nao tem API publica. O Dribly faz scraping do HTML das paginas de calendario e resultados usando um parser no browser (DOMParser). A Vercel Edge Function serve de proxy para evitar CORS e adicionar cache (s-maxage=120). Os jogos sao mostrados imediatamente assim que o parser acaba, sem esperar pelo upsert no Supabase.

### Classificacoes

```
Browser >> /api/tugabasket?path=getCompetitionDetails&competitionId=10906
             >> Vercel Edge Function
             >> https://resultados.tugabasket.com/...
             >> HTML >> parseAccordionStandings() >> Standing[]
             >> upsert Supabase (cache 15 min)
```

### Cores dos Clubes

Cada clube tem uma cor primaria (primary_color) extraida dos cards oficiais da FPB. A cor e aplicada dinamicamente via CSS var(--club-color), alterando o tema da pagina do clube. Clubes sem cor definida (#000000) recebem o roxo padrao #7C3AED.

### Cache Strategy

| Recurso | Primeira visita | < 15 min | > 15 min |
|---|---|---|---|
| Clubes | Supabase | Supabase | Supabase |
| Jogos | FPB API + parser | Supabase | localStorage + refresh FPB |
| Classificacoes | TugaBasket | Supabase | TugaBasket + refresh |

## Deploy

```
git push origin main
```

A Vercel faz auto-deploy automaticamente.

## Scrapers

```
cd scrapers
python discover-competitions.py
```

## Licenca

MIT
"""

with open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\README.md', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Written {len(content)} chars')
