# FC Gaia Basquetebol - Ecossistema de Dados

Este projeto automatiza a recolha de dados (agenda e resultados) do FC Gaia Basquetebol e apresenta-os num website moderno.

## Componentes

1.  **Scraper (Python)**: Recolhe dados da FPB e atualiza a base de dados.
2.  **Base de Dados (Supabase)**: Armazena os jogos.
3.  **Website (React/Vite)**: Apresenta os dados em tempo real.
4.  **Automação (GitHub Actions)**: Executa o scraper periodicamente.

## Configuração

### 1. Supabase

1.  Crie um projeto no [Supabase](https://supabase.com/).
2.  Vá ao **SQL Editor** e corra o script em `supabase/schema.sql` para criar a tabela e índices.
3.  Obtenha as credenciais em **Project Settings > API**:
    *   `Project URL`
    *   `anon` public key (para o Frontend)
    *   `service_role` secret key (para o Scraper - **MANTENHA SECRETO**)

### 2. GitHub Actions (Automação)

No repositório GitHub, vá a **Settings > Secrets and variables > Actions** e adicione:

*   `SUPABASE_URL`: O URL do seu projeto.
*   `SUPABASE_SERVICE_ROLE_KEY`: A chave `service_role`.

O scraper irá rodar automaticamente nos horários definidos:
*   Dias úteis: 15:00, 21:00
*   Fins de semana: 11:00, 13:00, 15:00, 17:00, 18:30, 20:00, 21:30

### 3. Website (Frontend)

Localmente (necessita Node.js):

1.  Entre na pasta `web`: `cd web`
2.  Crie um ficheiro `.env` baseado nas chaves:
    ```env
    VITE_SUPABASE_URL=seu_url_aqui
    VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
    ```
3.  Instale e corra:
    ```bash
    npm install
    npm run dev
    ```

## Estrutura do Projeto

*   `/scraper`: Código Python para extração de dados.
*   `/web`: Código React da aplicação web.
*   `/supabase`: Scripts SQL.
*   `/.github`: Workflows de automação.
