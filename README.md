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

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Estilos | Tailwind CSS 3 |
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

## ⚙️ Como funciona (Arquitetura Técnica)

O Dribly é uma **SPA (Single Page Application)** sem backend próprio. Toda a lógica vive no browser ou em Edge Functions serverless na Vercel.

### Visão geral

```
Browser (React SPA)
    │
    ├── Supabase SDK ──────────► Supabase (Auth + DB + cache)
    │
    ├── /api/* (Edge Functions) ──► FPB / TugaBasket (scraping)
    │
    └── Service Worker ──────────► Cache local (PWA offline)
```

### Fontes de dados

O Dribly **não tem API própria** — os dados são obtidos em tempo real dos sites oficiais:

- **FPB (Federação Portuguesa de Basquetebol)** — scraping HTML das páginas públicas (`www.fpb.pt`) para calendários, resultados, fichas de jogo e lista de clubes. As competições usam o endpoint WordPress AJAX interno (`/wp-admin/admin-ajax.php`) com um `action` específico para obter classificações da fase regular.
- **TugaBasket** — scraping HTML para dados complementares (estatísticas individuais, histórico).
- **Logos e cores** — mapeamento manual de 281 clubes, servidos como assets estáticos.

Todo o scraping é feito do lado do servidor (Vercel Edge Functions), nunca no browser — o cliente pede dados já tratados, não HTML bruto.

### Proxy serverless (Edge Functions)

As rotas `/api/fpb` e `/api/tugabasket` são Edge Functions na Vercel (Node.js runtime nas regiões europeias). Funcionam como **proxy + parser**: recebem um pedido do browser, fazem fetch ao site externo, extraem os dados com `DOMParser` (HTML) ou `RegExp` (WordPress AJAX), e devolvem JSON limpo ao React.

```
Browser ──GET /api/fpb?clube=169&page=calendario──► Edge Function
                                                       │
                                                    fetch()
                                                       │
                                                       ▼
                                                  www.fpb.pt (HTML)
                                                       │
                                                   DOMParser
                                                       │
                                                       ▼
                                                  JSON { games: [...] }
                                                       │
                                                       ▼
                                                  Browser ←── JSON
```

### Cache em três camadas

| Camada | Onde | TTL | O que guarda |
|---|---|---|---|
| **localStorage** | Browser | ~15 min | Jogos e classificações (evita pedidos repetidos) |
| **Supabase (PostgreSQL)** | Cloud | Médio prazo | Clubes (dados base), resultados upsert após refresh |
| **Browser cache HTTP** | Browser | Longo prazo | Logos, assets estáticos, SW bundle |

Estratégia: servir sempre do localStorage se < 15 min. Se expirou, faz refresh à fonte (Edge Function) e actualiza Supabase em background.

### Autenticação e dados de utilizador

Geridos exclusivamente pelo **Supabase Auth** (email/password) + **Supabase DB** (tabelas de favoritos e seguidos). Não há sessão própria, tokens JWT, ou backend de auth — o Supabase SDK no browser trata de tudo:

```
Browser → supabase.auth.signInWithPassword(email, password)
         → Supabase Auth (JWT gerido pelo SDK)
         → supabase.from("follows").select("*") (dados do utilizador)
```

### PWA e offline parcial

O `vite-plugin-pwa` (Workbox) gera um **Service Worker** que faz cache de navegação e assets. Em modo offline:
- Páginas já visitadas funcionam (cache-first)
- Dados frescos (jogos, classificações) mostram a última versão em cache
- Logos e assets estáticos servem sempre do cache

### Porquê esta arquitectura?

- **Zero backend para manter** — sem servidor, sem Docker, sem filas
- **Dados sempre frescos** — cada pedido vai à fonte oficial (com cache curto para não abusar)
- **Custo deploy ≈ 0** — Vercel free tier + Supabase free tier
- **Escala automaticamente** — Edge Functions sobem sob demanda

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

GNU AGPLv3 — código aberto, copyleft para serviços web. Garante que quem modificar e hospedar o Dribly publique as alterações. Vê o ficheiro [LICENSE](LICENSE).

---

<p align="center">
  <a href="https://dribly.vercel.app">Abrir Dribly →</a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://github.com/mefrraz/dribly">Código Fonte →</a>
</p>
