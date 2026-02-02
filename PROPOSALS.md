# Feature Proposals for FC Gaia App

Based on the available data sources (FPB website) and your goal to create a premium, data-rich experience, here are the suggested next steps.

## 1. Team Dashboard & Rosters (Painel de Equipa)
This is the most impactful feature to "wow" users and provide deep value, as requested.

### Concept
A dedicated page for each FC Gaia squad (Sub-14, Sub-16, Seniors, etc.) that goes beyond just results.

### Data Sources
- **ABP Website / Swish:** Source for rosters (since FC Gaia plays in ABP).
- **Note:** Stats might be limited compared to full FPB game sheets.

### Features
- **Roster (Plantel):** List of all players.
- **Team Averages:** Points scored/conceded per game.

### Implementation Strategy
- **Scraper:** Target ABP website for squad lists.
- **Database:** Create `players` table linked to teams.

---

## 2. League Tables (Classificações)
Currently, we only show games. Users want to know "Where are we in the table?".

### Concept
Automated standings table for each competition FC Gaia participates in.

### Data Sources
- **Primary:** `resultados.tugabasket.com` (JSON API).
    - Endpoint: `getCompetitionDetails?competitionId=XXXX`
    - Provides: Group standings, recent results.
- **Secondary:** `fpb.pt/classificacao/associacao_4/`.

### Features
- **Live Standings:** Rank, Points, Games Played, W/L record.
- **Form Guide:** Small icons showing last 5 games (e.g., ✅ ❌ ✅ ✅ ➖).

### Implementation Strategy
- **Scraper:** Scrape the "Classificação" tab from the FPB competition page.
- **UI:** A "Standings" tab on the Home page or a section in the specific Team Dashboard.

---

## 3. Advanced Opponent Analysis (Scouting)
Leverage the historical data we are already collecting.

### Concept
Before a game, provide a "Scouting Report" on the opponent.

### Features
- **Opponent Form:** How have they played the last 5 games? (even against other teams, if we scrape their full calendar).
- **Common Opponents:** "They lost to Maia Basket by 10, we beat Maia Basket by 15".
- **Venue Difficulty:** Stats on their home court vs away.

---

## 4. Multi-Media Integration (Galeria)
Make the app more visual.

### Concept
Associate photos or videos with specific games.

### Features
- **Game Gallery:** If you have an Instagram or Google Photos album for a game, link it in the Match Center.
- **Highlights:** Embed YouTube highlights if available.

---

## Recommended Roadmap (Ordem Sugerida)
1.  **League Tables (Classificações):** High value, relatively easy to scrape.
2.  **Team Rosters (Plantel Simples):** Names and numbers. Easy to start.
3.  **Player Stats (Estatísticas Avançadas):** Hardest to implement (parsing game sheets), but highest "pro" value.
