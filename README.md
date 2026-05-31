<p align="center">
  <img src="web/public/logo.svg" alt="Dribly" width="120" height="120" />
</p>

<h1 align="center">Dribly<span style="color:#7C3AED">.</span></h1>

<p align="center">
  <b>Basquetebol português no teu bolso</b>
  <br />
  App web (PWA) gratuita e open-source para acompanhar todos os clubes de basquetebol registados na Federação Portuguesa de Basquetebol (FPB)
</p>

<p align="center">
  <a href="https://dribly.pt">
    <img src="https://img.shields.io/badge/dribly.pt-7C3AED?style=for-the-badge&logo=vercel&logoColor=white" alt="Website" />
  </a>
  <a href="https://github.com/mefrraz/dribly">
    <img src="https://img.shields.io/badge/AGPLv3-7C3AED?style=for-the-badge&label=license" alt="AGPLv3" />
  </a>
  <a href="https://github.com/mefrraz/dribly/stargazers">
    <img src="https://img.shields.io/github/stars/mefrraz/dribly?style=for-the-badge&color=7C3AED" alt="Stars" />
  </a>
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
| 🔐 **Contas (Clerk)** | ✅ v4 | Email/password + Google OAuth, username único |
| ⭐ **Favoritos** | ✅ Completo | Favoritar clube + segui-lo automaticamente |
| ❤️ **Seguir clubes/liga** | ✅ Completo | Página dedicada "Seguidos" com RLS |
| 🗺️ **Mapas e localização** | ✅ Completo | Pavilhões no mapa |
| 🌓 **Modo claro/escuro** | ✅ Completo | Com transição suave |
| 📱 **PWA instalável** | ✅ Completo | Instala como app nativa |
| 🔌 **Offline parcial** | ✅ Completo | Service Worker + cache inteligente |
| 🎨 **Tema dinâmico** | ✅ Completo | Cada clube com accent color própria |
| 🎯 **Tour onboarding** | ✅ v3.3 | Tour guiado ao criar conta |
| 💡 **Sugestões pós-registo** | ✅ v3.3 | Favoritar e seguir clubes/ligas na 1ª vez |
| 🔑 **Google OAuth** | ✅ v4 | Login com conta Google (1 clique) |
| 🌍 **Domínio próprio** | ✅ v4 | [dribly.pt](https://dribly.pt) |

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
    <tr>
      <td>Login Google</td>
      <td align="center">✅</td>
      <td align="center">❌</td>
      <td align="center">❌</td>
      <td align="center">❌</td>
    </tr>
  </tbody>
</table>

---

## 🛠️ Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Estilos | Tailwind CSS 3 |
| Auth | Clerk (email/password + Google OAuth) |
| Base de dados | Supabase (PostgreSQL) |
| Deploy | Vercel (Edge Functions) |
| Cache local | localStorage + Service Worker |
| API externa | FPB + TugaBasket (HTML scraping + WordPress AJAX) |
| PWA | vite-plugin-pwa (Workbox) |

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
│   │   ├── AuthContext.tsx          # Autenticação Clerk (hooks)
│   │   └── supabase.ts             # Cliente Supabase (DB + RLS via Clerk JWT)
│   ├── hooks/
│   │   ├── useGames.ts              # Jogos com cache
│   │   ├── useStandings.ts          # Classificações com cache
│   │   └── useFollows.ts            # Seguir clubes/liga (DB + RLS)
│   ├── components/
│   │   ├── AuthModal.tsx            # Login / Criar conta (Clerk hooks)
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
    ├── logo.svg                    # Logo Dribly
    └── logo.png                    # Logo PWA
```

---

## ⚙️ Arquitetura Técnica

O Dribly é uma **SPA (Single Page Application)** sem backend próprio. Toda a lógica vive no browser ou em Edge Functions serverless na Vercel.

### Visão geral

```
Browser (React SPA)
    │
    ├── Clerk SDK ────────────► Clerk (Auth + sessões + Google OAuth)
    │
    ├── Supabase SDK ─────────► Supabase (DB + RLS via Clerk JWT)
    │
    ├── /api/* (Edge Funcs) ──► FPB / TugaBasket (scraping)
    │
    └── Service Worker ───────► Cache local (PWA offline)
```

### Autenticação (Clerk)

A partir da v4, o Dribly usa **Clerk** para gestão de contas:

- **Email/password** — registo clássico com username único validado pelo Clerk
- **Google OAuth** — login com 1 clique via conta Google
- **JWT bridge** — o token Clerk é injetado no Supabase via `accessToken` callback, permitindo RLS (`auth.uid() = user_id`) nas tabelas de seguidores

### Fontes de dados

- **FPB (www.fpb.pt)** — scraping HTML + WordPress AJAX (`/wp-admin/admin-ajax.php`)
- **TugaBasket** — scraping HTML para estatísticas individuais e histórico
- **Logos e cores** — mapeamento manual de 281 clubes

### Cache em três camadas

| Camada | Onde | TTL | O que guarda |
|---|---|---|---|
| **localStorage** | Browser | ~15 min | Jogos e classificações |
| **Supabase (PostgreSQL)** | Cloud | Médio prazo | Clubes, resultados, seguidores |
| **Service Worker** | Browser | Longo prazo | Logos, assets estáticos, PWA offline |

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
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...  # clerk.com → API Keys
```

---

## 📦 Deploy

```bash
git push origin main
```

A Vercel faz auto-deploy. Domínio: **[dribly.pt](https://dribly.pt)**.

---

## 🧪 Scrapers

```bash
cd scrapers
python discover-competitions.py
```

---

## 📜 Licença

GNU AGPLv3 — código aberto, copyleft para serviços web. [LICENSE](LICENSE)

---

<p align="center">
  <a href="https://dribly.pt">Abrir Dribly →</a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://github.com/mefrraz/dribly">Código Fonte →</a>
</p>
