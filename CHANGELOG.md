# Changelog

> **Dribly** — Basquetebol português no teu bolso. PWA gratuita e open-source para acompanhar todos os clubes de basquetebol registados na Federação Portuguesa de Basquetebol (FPB).

---

## [v5.8] — 2026-05-31

### Feat
- **Logos de competições nas classificações:** na página de classificações de cada competição, o logo oficial (da `competitions_meta`) é agora exibido ao lado do nome — se não houver logo, mostra o gradiente com a abreviatura
- **Logos de competições na search:** os resultados de competições na barra de pesquisa e na página de pesquisa agora mostram o logo oficial da competição em vez do logo genérico da associação

---

## [v5.7] — 2026-05-31

### Fix
- **Nome da competição:** a página de detalhe de competição (`/competicao/:id`) agora procura o nome da competição na tabela `competitions` do Supabase — deixou de mostrar "Competição #10910" para ligas como a CN2, passando a mostrar o nome real

### Feat
- **Botão "Página da Competição":** na página de classificações (`/standings/:assoc/:comp`) foi adicionado um botão que redireciona para a página completa da competição com todos os separadores (equipas, resultados, agenda, estatísticas)

---

## [v5.6] — 2026-05-31

### Fix
- **Logos das equipas nas competições:** adicionada terceira estratégia de parsing no `fetchTeams()` que extrai logos diretamente da estrutura HTML `.equipa` + `img.logo` + `.equipa-name` da página da FPB — os logotipos passam a vir diretamente da FPB em vez de depender do fallback do Supabase

---

## [v5.5] — 2026-05-31

### Feat
- **Estatísticas de jogo para clubes:** ao abrir a ficha de jogo de qualquer clube, o Dribly tenta agora obter as estatísticas da FPB (top performers, duelo, box scores) — se existirem, são exibidas automaticamente; se não, a ficha mantém-se apenas com os dados básicos

### Fix
- A ficha de jogo para jogos de clubes faz agora uma chamada não-bloqueante ao `fetchGameDetail` com o ID FPB do jogo, extraindo as mesmas estatísticas que já eram mostradas nas competições

---

## [v5.4] — 2026-05-31

### Feat
- **Escalão nos cards de jogos:** "Últimos Resultados" e "Próximos Jogos" na página do clube mostram agora o escalão (ex: "Sénior Masculino") antes dos nomes das equipas

---

## [v5.3] — 2026-05-31

### Fix
- **Indicador neutro em resultados recentes:** removido o bolinha verde/vermelho e o bold condicional nos cards de "Últimos Resultados" da página de cada clube — o ícone é agora neutro (cinza) em vez de indicar vitória/derrota/empate

### Chore
- Removida função `isClubWin` e `matchName` não utilizadas após a remoção do indicador

---

## [v5.2] — 2026-05-31

### Feat
- **short_name na BD:** nova coluna `short_name` na tabela `clubs` com o nome curto/meio-termo (ex: "FC Gaia", "FC Porto", "SL Benfica") populado a partir dos dados de scraping
- **Nomes de exibição curtos:** todos os locais que mostram o nome do clube usam agora `displayName()` — exibe o short_name se disponível, caso contrário o nome completo

### Fix
- **Navbar no iPhone:** adicionado `pt-safe` (safe-area-inset-top) à navbar superior para não ficar atrás do relógio/bateria nos iPhones com notch; adicionadas utilities CSS `pt-safe` / `pb-safe` no index.css
- **Pesquisa com abreviaturas:** pesquisar "FC", "GD", "SC", "AD" etc. agora encontra clubes cujo nome completo contém "Futebol Clube", "Grupo Desportivo", etc. — a pesquisa gera acrónimos a partir do nome e pesquisa contra nome + short_name + search_name + acrónimo combinados

---

## [v5.1] — 2026-05-31

### Docs
- Corrigidas versões das funcionalidades com base no histórico real de tags git
- README usa versionamento semântico (v1.0, v2.0, v3.0, v5.0) para cada funcionalidade

### Chore
- Bump README para v5.1

---

## [v5.0] — 2026-05-31

### Feat
- Novo logo PWA Dribly (PNG atualizado)
- README atualizado com funcionalidades v4.9 e limpeza geral

### Chore
- Tag v5.0 — domínio próprio dribly.pt, Clerk auth completa

---

## [v4.9] — 2026-05-31

### Feat
- **Perfil completo:** alterar password, ver sessões ativas, apagar conta
- Fluxo de recuperação de password em 3 passos (código email + nova password) com eye toggle
- Link "Esqueceu-se da password?" movido para após o botão de submit, antes do switch de modo

### Fix
- Tour onboarding só aparece no registo (sign-up), não ao fazer login
- `email_code` removido (fluxo broken)
- Estado `forgotStep` corrige TypeScript type narrowing
- Passo "código + nova password" adicionado no fluxo forgot password

---

## [v4.8] — 2026-05-31

### Feat
- Fluxo forgot password via Clerk email reset

### Fix
- Memoização de `normalizedUser` e `signOut` em `useAuth` para prevenir infinite re-renders

---

## [v4.7] — 2026-05-31

### Fix
- Botão Google OAuth removido (SameSite cookie issue com domínio customizado)
- Handler de OAuth removido

---

## [v4.6] — 2026-05-31

### Fix
- `clerk-captcha` movido para dentro do formulário AuthModal para renderizar CAPTCHA corretamente
- `clerk-captcha` adicionado ao HTML, timeout wrapper em signUp/signIn, mensagem de timeout
- CAPTCHA div adicionada ao DOM para bot protection na conclusão do sign-up

### Clerk redirects
- Permitidos redirects Clerk com parâmetros `__clerk`
- Bloqueados apenas redirects "limpos" para prevenir loop infinito
- URLs signIn/signUp/afterSign definidos para `/` com full origin para evitar redirect hosted
- Interceção de redirect para `accounts.dribly.pt` via routerPush/routerReplace

---

## [v4.5] — 2026-05-31

### Fix
- URLs signIn/signUp/afterSign definidos para `/` para prevenir redirect para página hosted Clerk
- `handleRedirectCallback` com `transfer:true` para callback OAuth
- URL relativo (`/`) para Clerk anexar callback params

---

## [v4.4] — 2026-05-31

### Fix
- Parâmetro `redirectUrl` restaurado (obrigatório), `handleRedirectCallback` removido
- `redirectUrl` removido — Clerk trata callback OAuth internamente
- URLs OAuth simplificados

---

## [v4.3] — 2026-05-31

### Chore
- Novo logo Dribly
- README atualizado para dribly.pt, Clerk auth, detalhes v4

---

## [v4.2] — 2026-05-30

### Fix
- AuthModal personalizado com Clerk hooks — card Dribly, botão Google, sem componentes Clerk

---

## [v4.1] — 2026-05-30

### Fix
- Clerk inserido dentro do card Dribly, header + footer limpos, sem elementos flutuantes
- Clerk renderiza o próprio card nativamente — sem conflitos de estilo

---

## [v4] — 2026-05-30

### Migration
- **Migração de auth: Supabase → Clerk v4**
- Clerk JWT integration para Supabase RLS
- `auth.uid()` convertido para `text` nas RLS policies
- Ficheiros SQL de migração designorados do `.gitignore`

### Chore
- `.reasonix/` adicionado ao `.gitignore`
- `package-lock.json` da raiz ignorado

### Fix
- AuthModal styling limpo — mais largo, menos padding, dark mode reativo, card Clerk transparente

---

## [v3.5.12] — 2026-05-30

### Feat
- Cache de 15min carrega todos os dados uma vez

---

## [v3.5.11] — 2026-05-30

### Fix
- Legenda da tabela só mostra colunas visíveis no mobile

---

## [v3.5.10] — 2026-05-30

### Fix
- Race condition ao mudar de tab durante loading

---

## [v3.5.9] — 2026-05-30

### Feat
- Logos da agenda/resultados extraídos do HTML FPB

---

## [v3.5.8] — 2026-05-30

### Fix
- Logos na tabela de classificação extraídos do HTML FPB

---

## [v3.5.7] — 2026-05-30

### Feat
- Jogos na classificação com logos FPB + scores elegantes

---

## [v3.5.6] — 2026-05-30

### Feat
- Logos + semi-abreviaturas na classificação (games e table)

---

## [v3.5.5] — 2026-05-30

### Fix
- Jogos futuros não aparecem como finalizados + sem emoji

---

## [v3.5.4] — 2026-05-30

### Feat
- Leagues mostra todas as competições Masc/Fem com pesquisa

---

## [v3.5.3] — 2026-05-30

### Feat
- Todas as competições FPB com logos reais

---

## [v3.5.2] — 2026-05-30

### Feat
- Tabela `competitions_meta` + logos via Supabase

---

## [v3.5.1] — 2026-05-30

### Feat
- Logos de competição com abreviatura + gradiente

---

## [v3.5.0] — 2026-05-30

### Fix
- Jogos a decorrer fora da agenda

---

## [v3.4.30] — 2026-05-30

### Feat
- Semi-abreviaturas — FC Porto, SC Braga, etc.

---

## [v3.4.29] — 2026-05-30

### Fix
- Duelo: fotos maiores com zoom, sem decorações

---

## [v3.4.28] — 2026-05-30

### Fix
- Duelo: fotos menores, `object-contain`, design VS elegante

---

## [v3.4.27] — 2026-05-30

### Feat
- Duelo com TOP Performers FPB — 2 melhores jogadores, todas as stats

---

## [v3.4.26] — 2026-05-30

### Fix
- Fotos e textos responsivos `sm:` — maiores no PC

---

## [v3.4.25] — 2026-05-30

### Feat
- Duelo + Top Performers separados, estilo leve

---

## [v3.4.24] — 2026-05-30

### Fix
- Top performers usa `detailLeaders` (fotos reais do HTML FPB)

---

## [v3.4.23] — 2026-05-30

### Feat
- Top performers estilo FPB — fotos + barra percentual

---

## [v3.4.22] — 2026-05-30

### Feat
- Fotos dos jogadores no top performers + box score

---

## [v3.4.21] — 2026-05-30

### Refactor
- Centrado, top performers head-to-head, sem sidebars

---

## [v3.4.20] — 2026-05-30

### Refactor
- Sidebars + gráficos de comparação + top performers (sem tabela)

---

## [v3.4.19] — 2026-05-30

### Feat
- Box score + team stats + logos w-20 + game leaders com tabs

---

## [v3.4.18] — 2026-05-30

### Fix
- Nome completo removido abaixo da abreviatura
- Hora no badge com icon Clock

---

## [v3.4.17] — 2026-05-30

### Feat
- Abreviatura nos team blocks + game leaders com tabs

---

## [v3.4.16] — 2026-05-30

### Feat
- Scores reais + quarters + espectadores + game leaders na ficha de jogo

---

## [v3.4.15] — 2026-05-30

### Fix
- Hora aparece no badge (junto da classificação) em vez do cartão data

---

## [v3.4.14] — 2026-05-30

### Fix
- `scrapeGameDetail` reescrito com CSS selectors reais do FPB (jogos futuros OK)

---

## [v3.4.13] — 2026-05-30

### Feat
- Competição, hora, logos extraídos do HTML FPB na ficha de jogo

---

## [v3.4.12] — 2026-05-30

### Feat
- Nome da competição na ficha de jogo (extraído do title FPB)

---

## [v3.4.11] — 2026-05-30

### Fix
- Pavilhão extraído após abreviatura da equipa (ex: SCP Pavilhão Dragão Arena)

---

## [v3.4.10] — 2026-05-30

### Fix
- Word-level logo matching só para palavras únicas (evita logos duplicados)

---

## [v3.4.9] — 2026-05-29

### Fix
- Pavilhão extraído do final + fallback data quando sem Q1

---

## [v3.4.8] — 2026-05-29

### Fix
- Secção do jogo isolada via âncora Q1 — evita texto do nav menu

---

## [v3.4.7] — 2026-05-29

### Fix
- Style/script removidos do scraping + logos na ficha de jogo

---

## [v3.4.6] — 2026-05-29

### Fix
- `scrapeGameDetail` reescrito com regex — extrai scores reais do FPB

---

## [v3.4.5] — 2026-05-29

### Fix
- Badge "FINALIZADO" em jogos neutros (sem clube), nunca "EMPATE"

---

## [v3.4.4] — 2026-05-29

### Style
- Leader card simplificado — fundo igual, badge `#1` em roxo

---

## [v3.4.3] — 2026-05-29

### Style
- Leader card refinado + stat leaders com foto jogador, sem emojis

---

## [v3.4.2] — 2026-05-29

### Feat
- Leader logo + stat leaders cards + jogos/resultados lado a lado

---

## [v3.4.1] — 2026-05-29

### Feat
- Tab "Vista Geral" como landing page da competição

---

## [v3.4.0] — 2026-05-29

### Fix
- DOM parsing via âncora `h5` + `onError` fallback para logos FPB quebrados

---

## [v3.3.46] — 2026-05-29

### Feat
- Fotos de plantel + logos extraídos do `get_equipas` FPB, novo card design

---

## [v3.3.45] — 2026-05-29

### Fix
- Word-level logo matching — exact token only, `+searchNames`

---

## [v3.3.44] — 2026-05-29

### Fix
- Logo matching melhorado — `search_name` + word-level fallback

---

## [v3.3.43] — 2026-05-29

### License
- Licença AGPLv3 adicionada

---

## [v3.3.42] — 2026-05-29

### Style
- Logos maiores (`w-20`) nos cards de equipas

---

## [v3.3.41] — 2026-05-29

### Feat
- Logos nos cards de equipas via match com clubes do Supabase

---

## [v3.3.40] — 2026-05-29

### Fix
- Fallback `fetchTeams` via classificação quando AJAX `get_equipas` falha (fix para todas as competições)

---

## [v3.3.39] — 2026-05-29

### Fix
- Equipas HTML parser via `wp_action` AJAX

---

## [v3.3.38] — 2026-05-29

### Fix
- Código comentado removido (quebrava build)

---

## [v3.3.37] — 2026-05-29

### Feat
- Equipas via WordPress AJAX `get_equipas`

---

## [v3.3.36] — 2026-05-29

### Fix
- Texto "A carregar..." junto ao spinner

---

## [v3.3.34] — 2026-05-29

### Fix
- `fetchPriority` camelCase — corrige build Vercel

---

## [v3.3.33] — 2026-05-29

### Fix
- Fotos com `fetchpriority="high"` em vez de lazy loading

---

## [v3.3.32] — 2026-05-28

### Fix
- Grid responsivo — 2/4/5 colunas

---

## [v3.3.31] — 2026-05-28

### Fix
- Grid 5 colunas para os 5 atletas

---

## [v3.3.30] — 2026-05-28

### Fix
- `topN` removido — apenas top5 fixo + grid 2col

---

## [v3.3.25] — 2026-05-28

### Fix
- Abas sem gradiente — cor única roxa

### Feat
- Nome competição real + tab bar gradiente com icons + fotos w-24

---

## [v3.3.23] — 2026-05-28

### Feat
- Cards maiores (`w-20`) para fotos de jogadores

---

## [v3.3.22] — 2026-05-28

### Fix
- `photoUrl` duplicado — `data-src` já tem URL completo

---

## [v3.3.21] — 2026-05-28

### Feat
- Parser categorias estatísticas com valores reais

---

## [v3.3.20] — 2026-05-28

### Fix
- Scraper: `player-name` divs + `data-src` lazy photos

---

## [v3.3.19] — 2026-05-28

### Fix
- Cache-busting `_t` param no `fetchHtml`

---

## [v3.3.18] — 2026-05-28

### Fix
- `scrapePlayerStats` do HTML real + foto utilizadores pattern

---

## [v3.3.17] — 2026-05-28

### Feat
- Grid leaderboard com foto, clube, top 5/10/20

---

## [v3.3.16] — 2026-05-28

### Feat
- Leaderboard de estatísticas com seleção de categoria

---

## [v3.3.15] — 2026-05-28

### Feat
- Tabs Jogos/Estatísticas/Classificação no CompetitionDetail

---

## [v3.3.14] — 2026-05-28

### Feat
- Seleção de época no CompetitionDetail

---

## [v3.3.13] — 2026-05-28

### Feat
- Página CompetitionDetail com dados do scraper dashboard

---

## [v3.3.12] — 2026-05-28

### Feat
- `useCompetitionGames` — jogos filtrados por competição com cache

---

## [v3.3.11] — 2026-05-28

### Feat
- Scraper dashboard (estatísticas individuais) — primeiro parser funcional

---

## [v3.3.10] — 2026-05-28

### Feat
- Rotas de competição: `/competition/:slug/:tab`

---

## [v3.3.9] — 2026-05-28

### Feat
- Auto-redirect para clube quando só há um jogo

---

## [v3.3.8] — 2026-05-28

### Feat
- Tabs Vista Geral + Jogos em ClubHome

### Fix
- Jogos de hóquei em patins filtrados (apenas basquetebol)

---

## [v3.3.7] — 2026-05-28

### Feat
- Navegação por clube em vez de competição

---

## [v3.3.6] — 2026-05-28

### Feat
- Página club/ClubHome com menu e detalhes

---

## [v3.3.5] — 2026-05-28

### Feat
- `useAssociationGames` — jogos filtrados por associação

---

## [v3.3.4] — 2026-05-28

### Feat
- Rotas `/associacao/:slug` + página AssociationGames com filtro

---

## [v3.3.3] — 2026-05-28

### Fix
- Render condicional — só mostra dados quando existem

---

## [v3.3.2] — 2026-05-28

### Feat
- Página AssociationCompetitions com tabela de classificação

---

## [v3.3.1] — 2026-05-28

### Feat
- Tabela de classificação com cache, ligas por género

---

## [v3.3.0] — 2026-05-28

### Feat
- Classificações via WordPress AJAX (FPB) com cache 15min

---

## [v3.2.7] — 2026-05-28

### Feat
- Jogos de outras equipas filtrados — apenas jogos do clube selecionado

---

## [v3.2.6] — 2026-05-28

### Feat
- `useClubCompetitions` — extrai competições onde o clube joga

---

## [v3.2.5] — 2026-05-28

### Feat
- Página Leagues — lista de competições disponíveis

---

## [v3.2.4] — 2026-05-28

### Feat
- Landing page com Hero e navegação por associação

---

## [v3.2.3] — 2026-05-28

### Feat
- Rotas base — Landing, Clubs, Club, Leagues, Competition, Game

---

## [v3.2.2] — 2026-05-28

### Fix
- Tipo/classe do scraper FPB — remover debug logs

---

## [v3.2.1] — 2026-05-28

### Feat
- File garbage collector no scraper FPB

---

## [v3.2.0] — 2026-05-28

### Feat
- Scraper FPB com Python — extrai jogos para JSON

---

## [v3.1.6] — 2026-05-25

### Fix
- ClubHome — simplificar paleta, timeAgo, `md:flex-row`

---

## [v3.1.5] — 2026-05-25

### Feat
- ClubHome — paleta de cores do clube em vez de roxo

---

## [v3.1.4] — 2026-05-25

### Fix
- Card max-w-xl centrado no ClubHome mobile

---

## [v3.1.3] — 2026-05-25

### Feat
- Página ClubHome com últimos 5 H2H + próximos

---

## [v3.1.2] — 2026-05-25

### Feat
- Rota `/clube/:slug` — página dinâmica por clube

---

## [v3.1.1] — 2026-05-25

### Fix
- ClubContext — slugs corrigidos (vowel normalization + fallback)

---

## [v3.1.0] — 2026-05-25

### Feat
- ClubContext — 281 clubes com cores, logos, search

---

## [v3.0.9–v3.0.2] — 2026-05-25

- Cache local, limite de jogos do clube, badge "FINALIZADO" fix
- Jogos futuros filtrados (não entram nos últimos)

---

## [v3.0.1] — 2026-05-25

### Fix
- Filtro de clube em vez de competição (jogos de várias equipas visíveis)

---

## [v3.0.0] — 2026-05-25

### Feat
- Service Worker + cache inteligente (PWA offline parcial)

---

## [v2.9.4] — 2026-05-25

### Fix
- Removidos separadores "---" nas páginas de detalhe

---

## [v2.9.3] — 2026-05-25

### Fix
- Game page voltou a mostrar últimos 5 H2H em vez de todos os jogos

---

## [v2.9.2] — 2026-05-25

### Refactor
- Games page refeita para mostrar todos os jogos do clube

---

## [v2.9.1] — 2026-05-24

### Fix
- `BottomNav` — background branco consistente

---

## [v2.9.0] — 2026-05-24

### Feat
- Cores dinâmicas por clube (dados FPB, 293 clubes)

---

## [v2.8.1] — 2026-05-24

### Fix
- Game page — alinhamento nome/logo da equipa

---

## [v2.8.0] — 2026-05-24

### Feat
- Pesquisa de competições, limite 3+3, página `/search` dedicada

---

## [v2.7.2] — 2026-05-24

### Fix
- Search dropdown cortado pela secção de stats

---

## [v2.7.1] — 2026-05-24

### Fix
- Search dropdown cortado — `overflow-hidden` do hero removido

---

## [v2.7.0] — 2026-05-24

### Feat
- Nomes de equipa clicáveis na game page
- Pesquisa de competições accent-insensitive

---

## [v2.6.6] — 2026-05-24

### Fix
- "Cache" renomeado para "Base de Dados"
- Cor amber → purple

---

## [v2.6.5] — 2026-05-24

### Feat
- Open source row na comparison table
- Secção visual "Base de Dados"
- Blur mais largo

---

## [v2.6.4] — 2026-05-24

### Feat
- Tabela de comparação expandida
- Secção "Base de Dados" movida
- Carousel fade mais largo

---

## [v2.6.3] — 2026-05-24

### Fix
- Tabela de comparação ajustada (user feedback)

---

## [v2.6.2] — 2026-05-24

### Fix
- Cores yellow/amber corrigidas
- TugaBasket escondido em mobile

---

## [v2.6.1] — 2026-05-24

### Feat
- Carousel de jogos mais largo + tabela de comparação grande

---

## [v2.6.0] — 2026-05-24

### Feat
- Jogos mais estreitos, feature cards únicos, secção de comparação FPB

---

## [v2.5.9] — 2026-05-24

### Feat
- Landing full-width, data cards maiores

---

## [v2.5.8] — 2026-05-24

### Feat
- Logos de associação do TugaBasket, data type cards

---

## [v2.5.7] — 2026-05-24

### Feat
- Cards de associação quadrados, sem texto, coloridos, secção data info

---

## [v2.5.6] — 2026-05-24

### Feat
- Carousel de associações, game cards mais largos, fade gradient duplo

---

## [v2.5.5] — 2026-05-24

### Feat
- Landing melhorada — gradient fade carousel, setas de navegação, accents, gap fix

---

## [v2.5.4] — 2026-05-24

### Feat
- Landing page enriquecida com clubes em destaque, links rápidos, hero com gradiente

---

## [v2.5.3] — 2026-05-24

### Feat
- Landing page redesenhada, logos Betclic limpos

---

## [v2.5.2] — 2026-05-24

### Fix
- Logo maior, navegação mobile reestruturada

---

## [v2.5.1] — 2026-05-24

### Feat
- Tema roxo estático, normalização de pesquisa, logos de clube, limpeza geral

---

## [v2.5.0] — 2026-05-24

### Feat
- **Rebranding para roxo (#7C3AED)**
- Novo `dribly.svg` com lockup

---

## [v2.4.1] — 2026-05-24

### Feat
- Barra de pesquisa na landing
- Mensagem "A atualizar dados..." durante loading

---

## [v2.4.0] — 2026-05-23

### Feat
- Navbar reorganizada, página "Equipas" removida, GameCard carousel, polish visual

---

## [v2.3.1] — 2026-05-23

### Feat
- Team cards redesenhados, carousel horizontal de jogos, card plantel

---

## [v2.3.0] — 2026-05-23

### Feat
- Cores dinâmicas por clube, separação de equipas, pesquisa na landing removida

---

## [v2.2.0] — 2026-05-23

### Feat
- Navbar redesenhada, landing simplificada, logótipo circular
- `useGames` filtrado por nome do clube (corrige dados errados)
- `vercel.json` atualizado (removida regra que conflitava com edge function)

---

## [v2.1.0] — 2026-05-23

### Feat
- Navbar redesenhada, landing full-width, novo logótipo

---

## [v2.0.0] — 2026-05-23

### 🎉 Dribly — Plataforma multi-clube de basquetebol português

**Migração de GaiensesPT (app mono-clube) para Dribly (multi-clube).**
- Landing page, ClubContext, rotas `/clube/:slug`, rebranding amber
- Carrossel na landing, redirect `/games`, `/game/:slug`, legacy archive
- Rebranding violeta + ClubHome/Games, light mode default, full-screen landing
- Build error fix: `gaia-black`/`gaia-yellow` → `dribly-dark`/`violet-600`
- Layout antigo + seletor de clube modal + "Meu Clube/Jogos" na navegação

---

## [v0.30.0] — 2026-05-23

### Revert
- GaiensesPT restaurado a partir de v0.29.1 (reversão do multi-clube)

---

## [v1.3.0] — 2026-05-23

Layout antigo + seletor de clube modal + navegação Meu Clube/Jogos.

---

## [v1.2.1] — 2026-05-23

### Fix
- Build error — `gaia-black`/`gaia-yellow` substituídos por `dribly-dark`/`violet-600`

---

## [v1.2.0] — 2026-05-23

### Feat
- Rebranding violeta
- ClubHome/Games com mesmo design do GaiensesPT antigo
- Light mode como padrão
- Landing full-screen

---

## [v1.1.0] — 2026-05-23

### Feat
- Carrossel na landing page
- Redirect `/games`, `/game/:slug`
- Legacy archive

---

## [v1.0.0] — 2026-05-23

### 🎉 Dribly multi-clube
- Landing page
- ClubContext
- Rotas `/clube/:slug`
- Rebranding amber

---

## [v0.29.1] — 2026-05-23

### Fix
- Banner "Instalar" mostra para Android/iOS mesmo sem `beforeinstallprompt` (fallback 3s)

---

## [v0.29.0] — 2026-05-23

### Feat
- Banner instalar melhorado (iOS sheet + Android prompt)
- Share com emoji e feedback

---

## [v0.28.1] — 2026-05-23

### Fix
- Scroll to top on route change
- `/classificacoes` renomeado para `/standings`

---

## [v0.28.0] — 2026-05-23

### Feat
- Destaque da página ativa no header (Início/Classificações/Jogos)

---

## [v0.27.1] — 2026-05-23

### Fix
- Links `/standings` → `/classificacoes` corrigidos (BottomNav, Layout, Dashboard)

---

## [v0.27.0] — 2026-05-23

### Feat
- Rotas separadas para cada associação e competição
- Hook simplificado, sem selector de época

---

## [v0.26.0] — 2026-05-23

### Feat
- Seletor/legenda removidos da home
- Perfil associação com logo + stats no ecrã 2

---

## [v0.25.0] — 2026-05-23

### Feat
- Fix logos (URLs diretas)
- Design refinado com tabs, gradientes, sombras
- Seasons

---

## [v0.24.0] — 2026-05-23

### Feat
- Redesign completo das classificações — 3 ecrãs com logos, competições por género, grupos fechados

---

## [v0.23.0] — 2026-05-23

### Feat
- Classificações hub-style — browser de competições, sem filtro de clube, design mobile-first

---

## [v0.22.0] — 2026-05-23

### Feat
- Auto-discovery de competições via scraper semanal + tabela `competitions` no Supabase

---

## [v0.21.0] — 2026-05-23

### Feat
- Classificações via TugaBasket (client-side + cache Supabase 15min)
- Fix grupos terminados

---

## [v0.20.0] — 2026-05-23

### Fix
- Scraper: jogos futuros marcados como "FINALIZADO" corrigido
- Badges de empate adicionados

---

## [v0.19.0] — 2026-05-23

### Feat
- Dashboard centrado restaurado
- "Registo Época" mantido (sem últimos 5)
- README, `.env.example`, `.gitignore` atualizados

---

## [v0.18.1] — 2026-05-23

### Fix
- Ordem de hooks — `seasonRecord`/`lastFive` com `useMemo` antes do early return

---

## [v0.18.0] — 2026-05-23

### Feat
- Dashboard com `useMemo`, layout sidebar no PC, home button, season record
- Build config Vercel corrigido

---

## [v0.17.0] — 2026-05-23

### Feat
- About/Install consistentes
- Cache localStorage no `useGames`
- Dashboard sem flash de loading

---

## [v0.16.0] — 2026-05-23

### Feat
- Swipe removido, rotas restauradas, GameDataContext mantido no Outlet

---

## [v0.15.1] — 2026-05-23

### Fix
- GameDataContext partilhado, transição carrossel fix, Dashboard/Games consomem contexto

---

## [v0.15.0] — 2026-05-23

### Feat
- Carrossel com 3 páginas lado a lado, swipe fluido com pre-load

---

## [v0.14.5] — 2026-05-22

### Feat
- Conteúdo segue o dedo durante swipe, snap back se < 50px

---

## [v0.14.4] — 2026-05-22

### Fix
- Título "Agenda/Resultados" removido em mobile
- Animação swipe pages

---

## [v0.14.3] — 2026-05-22

### Fix
- Footer escondido no mobile (`hidden md:block`)

---

## [v0.14.2] — 2026-05-22

### Fix
- Encoding "VITÓRIA", hora sem `font-mono`, swipe pages mobile, footer `pb-24`

---

## [v0.14.1] — 2026-05-21

### Feat
- Auto-refresh silencioso via `visibilitychange` em `useGames` e Game

---

## [v0.14.0] — 2026-05-21

### Feat
- PWA cache 15min, footer `pb-20` + GitHub, About atualizado

---

## [v0.13.2] — 2026-05-21

### Feat
- Resultado maior no PC (`sm:text-5xl`), compacto no telemóvel

---

## [v0.13.1] — 2026-05-21

### Fix
- Header visível em mobile, cards compactos, VS em círculo como Dashboard

---

## [v0.13.0] — 2026-05-21

### Feat
- Score highlighting, `tracking-tighter`, hover border, card height fix

---

## [v0.12.8] — 2026-05-21

### Fix
- Data removida do hero card, hora de volta ao card Data

---

## [v0.12.7] — 2026-05-21

### Fix
- Link FPB movido para o hero card (junto da data), não no card Data

---

## [v0.12.6] — 2026-05-21

### Fix
- "Ver detalhes" removido do Dashboard, link FPB dentro do card Data

---

## [v0.12.5] — 2026-05-21

### Fix
- Game.tsx restaurada para v0.8.2 + link FPB + "Próximos Confrontos"

---

## [v0.12.4] — 2026-05-21

### Fix
- Game.tsx e GameCard com mesmo estilo (v0.11.1 — `w-8` logos inline, score na linha, bottom bar)

---

## [v0.12.3] — 2026-05-21

### Fix
- Hero da ficha de jogo (Game.tsx) igual ao GameCard + link FPB + localização inline

---

## [v0.12.2] — 2026-05-21

### Fix
- Resultados mostram AMBOS os scores (78:65) + badge removido

---

## [v0.12.1] — 2026-05-21

### Feat
- Data removida do GameCard, link "Ver jogo na FPB" adicionado

---

## [v0.12.0] — 2026-05-21

### Feat
- Cards unificados (GameCard, Game.tsx, Dashboard) — mesmo design, sem rings

---

## [v0.11.1] — 2026-05-21

### Feat
- Dashboard redesenhado estilo ficha de jogo + `max-w-xl`

---

## [v0.11.0] — 2026-05-21

### Feat
- Dashboard mais compacto + cache 15min + logo + tempo integrado

---

## [v0.10.9] — 2026-05-21

### Fix
- Scrollbar always visible (`overflow-y:scroll`) evita layout shift

---

## [v0.10.8] — 2026-05-21

### Fix
- Volta aos skeleton cards com cabeçalhos de data falsos

---

## [v0.10.7] — 2026-05-21

### Fix
- Skeleton cards substituídos por barra de progresso subtil

---

## [v0.10.6] — 2026-05-21

### Fix
- Título só mobile, segment flutuante, atualizado inline, loading sem stale data

---

## [v0.10.5] — 2026-05-21

### Fix
- Jogos ordenados por hora dentro de cada dia

---

## [v0.10.4] — 2026-05-21

### Fix
- UI/Supabase só atualiza se dados mudaram (evita re-ordering)

---

## [v0.10.3] — 2026-05-21

### Fix
- Header mostra equipas, subtítulo removido, fonte consistente

---

## [v0.10.2] — 2026-05-21

### Fix
- Volta ao estilo v0.8.2 + "Próximos Confrontos" adicionado

---

## [v0.10.1] — 2026-05-21

### Fix
- Cabeçalhos compactos + bordas laterais + texto bold

---

## [v0.10.0] — 2026-05-21

### Feat
- "Próximos Confrontos" + melhoria visual "Últimos Jogos"

---

## [v0.9.2] — 2026-05-21

### Fix
- Mistura gradiente + VS circle + data linhas com estilo antigo de scores/badges

---

## [v0.9.1] — 2026-05-21

### Revert
- Volta ao design anterior do hero card (v0.8.2)

---

## [v0.9.0] — 2026-05-21

### Feat
- Redesign visual do hero card (scoreboard, glow, badge, VS estilizado)

---

## [v0.8.2] — 2026-05-21

### Fix
- Deduplicação de jogos por slug (eliminar duplicados entre épocas)

---

## [v0.8.1] — 2026-05-21

### Revert
- Volta ao H2H (não todos os jogos FC Gaia)

---

## [v0.8.0] — 2026-05-21

### Fix
- "Últimos Jogos" mostra últimos 5 jogos FC Gaia (não apenas H2H)

---

## [v0.7.1] — 2026-05-21

### Fix
- H2H case-insensitive + loading skeleton melhorado

---

## [v0.7.0] — 2026-05-21

### Feat
- "Últimos Jogos" inclui épocas passadas, clicável, header melhorado, mapa removido

---

## [v0.6.1] — 2026-05-21

### Fix
- "Últimos Jogos" — head-to-head específico + data com ano

---

## [v0.6.0] — 2026-05-21

### Feat
- Hora duplicada corrigida + "Últimos Jogos" por escalão

---

## [v0.5.0] — 2026-05-21

### Feat
- Game page — stats removidos, hora corrigida, novo mapa visual

---

## [v0.4.0] — 2026-05-21

### Feat
- `.gitignore`, About page atualizada, Game page redesign

---

## [v0.3.0] — 2026-05-20

### Feat
- Redesign mobile-first (GameCard, SegmentControl, nova paleta)

---

## [v0.2.0] — 2026-05-20

### Feat
- Quick fixes visuais

---

## [v0.1.0] — 2026-02-01

### 🎉 Primeiro deploy
- **GaiensesPT** — app para acompanhar os jogos do FC Gaia (basquetebol)
- Scraping HTML da FPB (Python)
- Cache Supabase
- React + Vite + Tailwind CSS
- Deploy Vercel

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| `v0.x` | Fase GaiensesPT (mono-clube, FC Gaia) |
| `v1.x` | Transição Dribly (multi-clube) |
| `v2.x` | Rebranding, landing, cores dinâmicas |
| `v3.x` | Classificações, estatísticas, competições |
| `v4.x` | Auth Clerk, domínio próprio, perfil |
| `v5.x` | Auth completa, password recovery, sessões |

---

*Gerado a partir do histórico de git com 160+ tags e 430+ commits.*
