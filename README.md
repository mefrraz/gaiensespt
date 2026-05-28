<p align="center">
  <img src="web/public/logo.svg" alt="Dribly" width="100" height="100" />
</p>

<h1 align="center">Dribly<span style="color:#7C3AED">.</span></h1>

<p align="center">
  <b>Basquetebol português no teu bolso</b>
  <br />
  App web (PWA) gratuita e open-source para acompanhar todos os clubes de basquetebol registados na Federação Portuguesa de Basquetebol (FPB)
</p>

<p align="center">
  <a href="https://dribly.vercel.app">
    <img src="https://img.shields.io/badge/dribly.vercel.app-7C3AED?style=for-the-badge&logo=vercel&logoColor=white" alt="Website" />
  </a>
  <a href="https://github.com/mefrraz/dribly">
    <img src="https://img.shields.io/github/license/mefrraz/dribly?style=for-the-badge&color=7C3AED" alt="License" />
  </a>
  <a href="https://github.com/mefrraz/dribly/stargazers">
    <img src="https://img.shields.io/github/stars/mefrraz/dribly?style=for-the-badge&color=7C3AED" alt="Stars" />
  </a>
  <br />
  <a href="https://github.com/mefrraz/dribly/commits/main">
    <img src="https://img.shields.io/github/last-commit/mefrraz/dribly?style=flat-square&color=7C3AED" alt="Last Commit" />
  </a>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS 3" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite" alt="Vite 5" />
  <img src="https://img.shields.io/badge/Supabase-FF9500?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vercel-000?style=flat-square&logo=vercel" alt="Vercel" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa" alt="PWA" />
</p>

---

## 🎯 Objetivo

O Dribly nasceu da frustração de não existir uma plataforma única, rápida e mobile-first para acompanhar o basquetebol português.

| Problema | Solução Dribly |
|---|---|
| Site da FPB pesado e sem otimização mobile | App PWA leve e responsiva |
| Swish pago e focado numa competição | **100% gratuito**, multi-competição |
| TugaBasket desktop-only | **Mobile-first**, instalável como app |

---

## ✨ Funcionalidades

| Funcionalidade | Estado | Detalhes |
|---|---|---|
| 🔍 **Pesquisa de clubes** | ✅ Completo | 281 clubes com cores, logos, pesquisa fuzzy |
| 📅 **Jogos e agenda** | ✅ Completo | Calendário, resultados, fichas de jogo detalhadas |
| 🏆 **Classificações** | ✅ Completo | Tabelas Fase Regular com J, V, D, PM, PS, DIF, PTS |
| 📊 **Estatísticas individuais** | ✅ Ligas topo | 22 campos — PTS, REB, AST, VAL, %L2, %L3, %LL |
| 👤 **Contas e login** | ✅ Completo | Email/password via Supabase Auth |
| ⭐ **Favoritos** | ✅ Completo | Favoritar clube + segui-lo automaticamente |
| ❤️ **Seguir clubes/liga** | ✅ Completo | Página dedicada "Seguidos" |
| 🗺️ **Mapas e localização** | ✅ Completo | Pavilhões no mapa |
| 🌓 **Modo claro/escuro** | ✅ Completo | Com transição suave |
| 📱 **PWA instalável** | ✅ Completo | Instala como app nativa |
| 🔌 **Offline parcial** | ✅ Completo | Service Worker + cache inteligente |
| 🎨 **Tema dinâmico** | ✅ Completo | Cada clube com accent color própria |
| 🎯 **Tour onboarding** | ✅ v3.3 | Tour guiado ao criar conta |
| 💡 **Sugestões pós-registo** | ✅ v3.3 | Favoritar e seguir clubes/ligas na 1ª vez |

---

## 📊 Comparação

<table>
  <thead>
    <tr>
      <th>Funcionalidade</th>
      <th align="center">Dribly</th>
      <th align="center">FPB</th>
      <th align="center">Swish</th>
      <th align="center">TugaBasket</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Mobile-first</td>
      <td align="center">✅</td>
      <td align="center">✅</td>
      <td align="center">✅</td>
      <td align="center">❌</td>
    </tr>
    <tr>
      <td>PWA instalável</td>
      <td align="center">✅</td>
      <td align="center">❌</td>
      <td align="center">✅</td>
      <td align="center">❌</td>
    </tr>
    <tr>
      <td>Open Source</td>
      <td align="center">✅</td>
      <td align="center">❌</td>
      <td align="center">❌</td>
      <td align="center">❌</td>
    </tr>
    <tr>
      <td>Gratuito</td>
      <td align="center">✅</td>
      <td align="center">✅</td>
      <td align="center">❌</td>
      <td align="center">✅</td>
    </tr>
    <tr>
      <td>Multi-clube</td>
      <td align="center">✅</td>
      <td align="center">✅</td>
      <td align="center">⚠️</td>
      <td align="center">❌</td>
    </tr>
    <tr>
      <td>Multi-escalão</td>
      <td align="center">✅</td>
      <td align="center">✅</td>
      <td align="center">⚠️</td>
      <td align="center">❌</td>
    </tr>
    <tr>
      <td>Offline parcial</td>
      <td align="center">✅</td>
      <td align="center">❌</td>
      <td align="center">❌</td>
      <td align="center">❌</td>
    </tr>
    <tr>
      <td>Ficha de jogo detalhada</td>
      <td align="center">✅</td>
      <td align="center">✅</td>
      <td align="center">✅</td>
      <td align="center">❌</td>
    </tr>
    <tr>
      <td>Estatísticas individuais</td>
      <td align="center">✅</td>
      <td align="center">✅</td>
      <td align="center">✅</td>
      <td align="center">❌</td>
    </tr>
    <tr>
      <td>Contas / Seguir clubes</td>
      <td align="center">✅</td>
      <td align="center">❌</td>
      <td align="center">✅</td>
      <td align="center">❌</td>
    </tr>
  </tbody>
</table>

---

## 🛠️ Stack

| Camada | Tecnologia | Badge |
|---|---|---|
| Frontend | React 18 + TypeScript | ![React](https://img.shields.io/badge/-React_18-61DAFB?style=flat&logo=react) |
| Build | Vite 5 | ![Vite](https://img.shields.io/badge/-Vite_5-646CFF?style=flat&logo=vite) |
| Estilos | Tailwind CSS 3 | ![Tailwind](https://img.shields.io/badge/-Tailwind_CSS_3-06B6D4?style=flat&logo=tailwindcss) |
| Base de dados | Supabase (PostgreSQL) | ![Supabase](https://img.shields.io/badge/-Supabase-FF9500?style=flat&logo=supabase) |
| Deploy | Vercel (Edge Functions) | ![Vercel](https://img.shields.io/badge/-Vercel-000?style=flat&logo=vercel) |
| Cache local | localStorage + Service Worker | ![PWA](https://img.shields.io/badge/-PWA-5A0FC8?style=flat&logo=pwa) |
| API externa | FPB + TugaBasket | ![Scraping](https://img.shields.io/badge/-HTML_Scraping-FF6B6B?style=flat) |
| PWA | vite-plugin-pwa | ![Workbox](https://img.shields.io/badge/-Workbox-FF6C2A?style=flat&logo=workbox) |

---

## 🏗️ Estrutura

```
web/
├── src/
│   ├── lib/
│   │   ├── fpbApi.ts               # Parser HTML FPB (clubes)
│   │   ├── fpbCompetitionsApi.ts    # Parser HTML + WordPress AJAX (competições)
│   │   ├── tugabasketApi.ts         # Parser TugaBasket
│   │   ├── ClubContext.tsx          # Estado global clubes
│   │   ├── AuthContext.tsx          # Autenticação Supabase
│   │   └── supabase.ts             # Cliente Supabase
│   ├── hooks/
│   │   ├── useGames.ts              # Jogos com cache
│   │   ├── useStandings.ts          # Classificações com cache
│   │   └── useFollows.ts            # Seguir clubes/liga (DB)
│   ├── components/
│   │   ├── AuthModal.tsx            # Login / Criar conta
│   │   ├── OnboardingTour.tsx       # Tour guiado pós-registo
│   │   ├── PostOnboardingSuggestions.tsx  # Sugestões iniciais
│   │   ├── GameCard.tsx             # Cartão de jogo reutilizável
│   │   └── SegmentControl.tsx       # Navegação por tabs
│   └── pages/
│       ├── Landing.tsx              # Página inicial
│       ├── CompetitionDetail.tsx    # Detalhe competição (classif/jogos/stats)
│       ├── club/ClubHome.tsx        # Página do clube
│       ├── club/ClubGames.tsx       # Jogos do clube
│       ├── Game.tsx                 # Ficha de jogo detalhada
│       ├── Following.tsx           # Seguidos (clubes + ligas)
│       └── ProfilePage.tsx         # Perfil do utilizador
├── api/
│   ├── fpb.ts                      # Edge Function (proxy FPB + WordPress AJAX)
│   └── tugabasket.ts               # Edge Function (proxy TugaBasket)
└── public/
    ├── logo.svg / logo.png         # Assets PWA
```

---

## 🔄 Fluxo de Dados

### Jogos (Clube)

```
Browser → /api/fpb?page=[calendario|resultados]&clube=169&epoca=2025/2026
         → Vercel Edge Function
         → www.fpb.pt → HTML
         → DOMParser → Match[]
         → React (imediato) + Supabase upsert (cache)
```

### Classificação (Competição)

```
Browser → /api/fpb?wp_action=get_more_fase_regular&competicao=10902&fase=30969
         → Vercel Edge Function
         → www.fpb.pt/wp-admin/admin-ajax.php
         → JSON { result: { body: "..." } }
         → RegExp parser → FPBStandingTeam[]
```

### Ficha de Jogo

```
Browser → /game/{internalID}
         → Game.tsx → fetchGameDetail(internalID)
         → /api/fpb?internalID=390144
         → www.fpb.pt/ficha-de-jogo?internalID=390144
         → DOMParser → FPBGameDetail (box score, parciais, leaders)
```

---

## ⚡ Cache Strategy

| Recurso | < 15 min | > 15 min |
|---|---|---|
| Clubes | Supabase | Supabase |
| Jogos | localStorage | refresh FPB + upsert |
| Classificações | localStorage | refresh WordPress AJAX |
| Logos | browser cache (longo prazo) | — |

---

## 🚀 Setup Local

```bash
git clone https://github.com/mefrraz/dribly.git
cd dribly/web
npm install
npm run dev
```

Variáveis de ambiente (`web/.env`):

```env
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[anon public key]
```

---

## 📦 Deploy

```bash
git push origin main
```

A Vercel faz auto-deploy automaticamente.

---

## 🧪 Scrapers

```bash
cd scrapers
python discover-competitions.py
```

---

## 📜 Licença

MIT — aberto para contribuições, forks e uso livre.

---

<p align="center">
  <a href="https://dribly.vercel.app">
    <img src="https://img.shields.io/badge/Abrir_Dribly-7C3AED?style=for-the-badge&logo=vercel&logoColor=white" alt="Abrir Dribly" />
  </a>
  <a href="https://github.com/mefrraz/dribly">
    <img src="https://img.shields.io/badge/Código_Fonte-000?style=for-the-badge&logo=github" alt="Código Fonte" />
  </a>
</p>
