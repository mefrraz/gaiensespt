# Dribly — Basquetebol português no teu bolso

App web (PWA) multiplataforma para acompanhar todos os clubes de basquetebol registados na Federação Portuguesa de Basquetebol (FPB).

**Site:** https://dribly.vercel.app *(após renomear projeto na Vercel)*

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS |
| Base de dados | Supabase (PostgreSQL) + localStorage |
| Deploy | Vercel (static + Edge Functions) |
| API externa | [FPB](https://www.fpb.pt) + [TugaBasket](https://resultados.tugabasket.com) |
| PWA | vite-plugin-pwa (service worker + cache) |

## Funcionalidades

- **Pesquisa de clubes** — 281 clubes FPB com cores e logótipos
- **Jogos e agenda** — próximos jogos, resultados, fichas de jogo
- **Classificações** — todas as competições por associação
- **Multi-clube** — segue vários clubes ao mesmo tempo
- **PWA** — instala como app no telemóvel
- **Modo escuro** — tema claro/escuro
- **Offline parcial** — cache inteligente com dados recentes

## Setup Local

\\\ash
git clone https://github.com/mefrraz/dribly.git
cd dribly/web
npm install
# Criar .env com:
# VITE_SUPABASE_URL=https://[project].supabase.co
# VITE_SUPABASE_ANON_KEY=[anon public key]
npm run dev
\\\

Variáveis de ambiente (ver Supabase Dashboard → Settings → API):

\\\
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[anon public key]
\\\

## Estrutura

\\\
web/
  src/
    lib/
      fpbApi.ts        — scraper HTML da FPB
      tugabasketApi.ts — scraper TugaBasket
      associationLogos.ts — logótipos das associações
      ClubContext.tsx   — contexto global de clubes
      supabase.ts      — cliente Supabase
    hooks/
      useGames.ts      — jogos com cache 15min + localStorage
      useStandings.ts  — classificações com cache
    components/
      BottomNav.tsx    — navegação inferior mobile
      SearchModal.tsx  — modal de pesquisa
      GameCard.tsx     — card de jogo
    pages/
      Landing.tsx      — página inicial
      SearchPage.tsx   — pesquisa dedicada
      club/            — páginas de clube (home, games, teams)
      Game.tsx         — ficha de jogo
      Standings.tsx    — classificações
      AssociationCompetitions.tsx — competições por associação
      About.tsx        — sobre o projeto
  api/
    fpb.ts            — Vercel Edge Function (proxy FPB)
    tugabasket.ts     — Vercel Edge Function (proxy TugaBasket)
\\\

## Fluxo de Dados (Jogos)

\\\
Browser → Vercel Edge Function (/api/fpb)
         → fetches https://www.fpb.pt (HTML)
         → parser no browser → Match[]
         → upsert Supabase (cache partilhado)
         → mostra na UI
\\\

- **1ª visita:** Busca da FPB via Edge Function → parser → mostra + guarda em Supabase
- **< 15 min:** Lê de Supabase
- **> 15 min:** Mostra dados da localStorage + atualiza em background

## Deploy

Git push → Vercel auto-deploy.

\\\ash
git push origin main
\\\

## Scrapers

\\\
scrapers/
  discover-competitions.py — scraper Python de competições TugaBasket
\\\

## Licença

MIT
