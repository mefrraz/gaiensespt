# GaiensesPT 🏀

**A app oficial dos adeptos do FC Gaia Basquetebol.**

Acompanha todos os jogos, resultados e agenda das equipas do FC Gaia em tempo real.

🔗 **[gaiensespt.vercel.app](https://gaiensespt.vercel.app)**

---

## ✨ Funcionalidades

- 📅 **Agenda** - Todos os próximos jogos com hora e local
- 🏆 **Resultados** - Resultados atualizados automaticamente
- 📍 **Localização** - Abre o GPS para os pavilhões
- 📱 **PWA** - Instala como app no telemóvel
- 🌙 **Modo Escuro** - Design premium adaptativo
- 📤 **Partilha** - Partilha jogos com amigos
- 📆 **Calendário** - Adiciona jogos ao Google Calendar

---

## 🔄 Atualização Automática

Os dados são obtidos automaticamente da **Federação Portuguesa de Basquetebol (FPB)**.

| Dia | Frequência |
|-----|------------|
| Segunda a Sexta | 15:00 e 21:00 |
| Sábado e Domingo | A cada 30 min (10:00 - 21:00) |

---

## 🛠️ Tecnologias

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Scraper**: Python (BeautifulSoup)
- **Automação**: GitHub Actions
- **Deploy**: Vercel

---

## 📁 Estrutura

```
/scraper    → Script Python de extração de dados
/web        → Aplicação React
/supabase   → Scripts SQL para a base de dados
/.github    → Workflows de automação
```

---

## 🚀 Configuração Local

### Requisitos
- Node.js 18+
- Python 3.10+
- Conta Supabase

### 1. Base de Dados (Supabase)
1. Cria um projeto em [supabase.com](https://supabase.com)
2. Corre o script `supabase/schema.sql` no SQL Editor
3. Guarda as credenciais (URL, anon key, service role key)

### 2. Frontend
```bash
cd web
cp .env.example .env  # Adiciona as credenciais Supabase
npm install
npm run dev
```

### 3. Scraper
```bash
cd scraper
pip install -r requirements.txt
python main.py
```

### 4. GitHub Actions
Em **Settings > Secrets**, adiciona:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 👤 Criador

**André Ferraz** - Atleta do FC Gaia & Criador dos Gaienses

📸 [@gaiensespt](https://instagram.com/gaiensespt)

---

## 📄 Licença

Este projeto é não oficial e não está afiliado ao FC Gaia ou à FPB.
