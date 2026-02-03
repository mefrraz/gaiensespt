# GaiensesPT - Portal do Adepto FC Gaia Basquetebol

Bem-vindo ao repositório oficial do GaiensesPT.

🔴 **Acede à App:** [gaiensespt.vercel.app](https://gaiensespt.vercel.app)

---

## 📖 Para Utilizadores

Esta é a aplicação que centraliza toda a informação das equipas de basquetebol do FC Gaia.

### Funcionalidades Principais
*   📅 **Agenda Completa:** Todos os jogos futuros com indicação de dias, horas e pavilhões.
*   📊 **Resultados em Tempo Real:** Resultados atualizados automaticamente após os jogos (ou durante, dependendo da fonte).
*   🏆 **Classificações Históricas:** Consulta a tabela classificativa da época atual e de épocas passadas (desde 2022).
*   📍 **Navegação:** Botão direto para abrir a localização do pavilhão no Google Maps/Waze.
*   📱 **PWA:** Podes instalar como se fosse uma aplicação nativa no teu telemóvel (Android/iOS).

### Dados Históricos
A plataforma permite viajar no tempo e consultar classificações das épocas 2022/2023, 2023/2024 e 2024/2025, preservando a memória desportiva do clube.

---

## 🛠 Para Desenvolvedores (Técnico)

Este projeto utiliza uma stack moderna para garantir performance, facilidade de manutenção e updates automáticos.

### 🏗 Arquitetura & Tecnologias
*   **Frontend:** React (Vite) + TypeScript + TailwindCSS.
*   **Data Storage:** Supabase (PostgreSQL).
*   **Data Scrapers:**
    *   **Python (`scrapers/scrape_games.py`):** Raspa jogos e resultados atuais da FPB/Tugabasket.
    *   **Node.js/Playwright (`scrapers/scrape_history.js`):** Raspa classificações históricas e complexas que requerem interação com a página (dropdowns, javascript).
*   **CI/CD & Automação:** GitHub Actions.

### 📂 Estrutura do Projeto
```
/scrapers      - Scripts de extração de dados (Python & Node.js)
/web           - Aplicação Frontend (React + Vite)
/database      - Scripts SQL para migrações e configuração do Supabase
/.github       - Workflows de automação (Github Actions)
```

### 🤖 Automação (GitHub Actions)
O sistema está desenhado para ser autónomo para a época corrente, mas manual para dados históricos (que não mudam).

1.  **Update Current Season (`update_current_season.yml`)**
    *   **Frequência:** Diária (06:00 UTC).
    *   **O que faz:** Executa o script Python para buscar os jogos da época atual (`2025/2026`) e atualiza a tabela `games_2025_2026`.
    *   **Trigger:** Cron ou Manual.

2.  **Scrape Historical Data (`scrape_history.yml`)**
    *   **Frequência:** Apenas Manual (`workflow_dispatch`).
    *   **O que faz:** Executa o script Playwright para raspar classificações de épocas passadas (2022-2025) e popula as tabelas `classificacoes_YYYY_YYYY`.
    *   **Porquê manual?** Como são dados históricos, só precisam de ser carregados uma vez ou se houver correções.

### ⚙️ Configuração Local

**Pré-requisitos:** Node.js 18+, Python 3.10+, Conta Supabase.

#### 1. Setup Variáveis de Ambiente
Cria um ficheiro `.env` na raiz do projeto (ver `.env.example` se existir, ou baseia-te nisto):
```env
VITE_SUPABASE_URL=tua_url_supabase
VITE_SUPABASE_ANON_KEY=tua_key_anon
SUPABASE_URL=tua_url_supabase (para python)
SUPABASE_KEY=tua_service_role_key (para python/escrita)
```

#### 2. Correr Scraper de Jogos (Python)
```bash
pip install -r scrapers/requirements.txt
python scrapers/scrape_games.py --season "2025/2026"
```

#### 3. Correr Scraper de Histórico (Node.js)
```bash
npm install # na raiz ou onde estiver o package.json
node scrapers/scrape_history.js
```

#### 4. Frontend
```bash
cd web
npm install
npm run dev
```

---

## Licença
Este projeto não está afiliado oficialmente ao FC Gaia ou à FPB. Criado por adeptos, para adeptos.
