# gaiensespt — FC Gaia Basquetebol

App web (PWA) para acompanhar jogos, resultados e classificação do **FC Gaia — Basquetebol**.

**Site:** https://gaiensespt.vercel.app

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS |
| Base de dados | Supabase (PostgreSQL) |
| Estado partilhado | GameDataContext + localStorage cache |
| Deploy | Vercel (static + Edge Functions) |
| API externa | [fpb.pt](https://www.fpb.pt) (scraping WordPress) |
| PWA | vite-plugin-pwa (service worker + cache 15min) |

## Fluxo de Dados

```
Browser → Vercel Edge Function (/api/fpb)
         → fetches https://www.fpb.pt (calendário + resultados)
         → HTML da FPB
         → parser DOMParser no browser → Match[]
         → upsert Supabase (cache partilhado entre users)
```

- **Primeira visita:** Browser busca da FPB via Edge Function → parser → mostra + guarda em Supabase
- **Visitas seguintes (≤15min):** Lê de Supabase (rápido) ou do localStorage cache (instantâneo)
- **Visitas seguintes (>15min):** Mostra dados do localStorage + atualiza em background da FPB

## Setup Local

```bash
git clone https://github.com/mefrraz/gaiensespt.git
cd gaiensespt/web
npm install
# Criar ficheiro .env com:
# VITE_SUPABASE_URL=https://[project].supabase.co
# VITE_SUPABASE_ANON_KEY=[anon public key]
npm run dev
```

Variáveis de ambiente necessárias (ver Supabase dashboard → Settings → API):

```
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[anon public key]
```

## Estrutura

```
web/
  src/
    lib/
      fpbApi.ts           — cliente FPB (fetch + parser HTML)
      supabase.ts         — cliente Supabase
      GameDataContext.tsx  — contexto React para dados partilhados
    hooks/
      useGames.ts          — hook SWR com cache 15min + localStorage
      useTimeAgo.ts        — hook "há X minutos"
    components/
      Skeleton.tsx     — loading skeletons
      EmptyState.tsx   — estado vazio com ícone
      types.ts         — tipos Match, Standing
    pages/
      Dashboard.tsx    — home (próximo jogo, resultados, próximos)
      Games.tsx        — agenda + resultados (segment: AGENDA/RESULTADOS)
      Game.tsx         — ficha de jogo individual
      Standings.tsx    — tabela classificativa
      About.tsx        — sobre o projeto
      Install.tsx      — instruções PWA
  api/
    fpb.ts             — Vercel Edge Function (proxy para fpb.pt)
database/
  schema.sql           — schema principal
  migrate_seasons.sql  — tabelas por época
  migrations/          — migrations incrementais
```

## Deploy

Git push → Vercel auto-deploy.

```bash
git push origin main
```

Para deploy manual no dashboard da Vercel:
1. Ir a https://vercel.com/mefrraz/gaiensespt
2. Deployments → último commit → Redeploy

## API FPB

A app consome a API pública da Federação Portuguesa de Basquetebol.
Referência completa: [`fpb_api_reference.md`](./fpb_api_reference.md)

Endpoints usados via Edge Function (proxy):
- `/api/fpb?page=calendario&clube=119&epoca=2025/2026` — agenda completa
- `/api/fpb?page=resultados&clube=119&epoca=2025/2026` — resultados

## Rollback

```bash
git tag              # ver versões disponíveis
git checkout v0.1.0  # voltar ao estado antes das alterações visuais
```

Para reverter o deploy na Vercel:
- Deployments → ⋮ (três pontos) → Promote to Production da tag desejada
