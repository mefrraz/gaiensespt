# Feature Proposals for FC Gaia App

Based on the available data sources (FPB website) and your goal to create a premium, data-rich experience, here are the suggested next steps.

## 1. Team Dashboard & Rosters (Painel de Equipa)
This is the most impactful feature to "wow" users and provide deep value, as requested.

### Concept
A dedicated page for each FC Gaia squad (Sub-14, Sub-16, Seniors, etc.) that goes beyond just results.

### Features
- **Roster (Plantel):** List of all players with photos (if available), numbers, and positions.
- **Player Stats (Média por Atleta):**
  - Use data from "Fichas de Jogo" (Game Sheets) available on FPB.
  - Metrics: Points per game (PTS), Fouls, Minutes (if available).
  - *Challenge*: Parsing PDF game sheets or detailed HTML stats requires a more advanced scraper.
- **Team Averages:** Points scored/conceded per game for this specific squad.

### Implementation Strategy
- **Scraper:** Update scraper to visit the "Equipa" page on FPB to get the roster.
- **Database:** Create `players` and `team_stats` tables.

---

## 2. League Tables (Classificações)
Currently, we only show games. Users want to know "Where are we in the table?".

### Concept
Automated standings table for each competition FC Gaia participates in.

### Features
- **Live Standings:** Rank, Points, Games Played, W/L record.
- **Form Guide:** Small icons showing last 5 games (e.g., ✅ ❌ ✅ ✅ ➖).
- **Promotion/Relegation Zones:** Visual indicators for important table positions.

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
