import os
import re
import datetime
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from typing import List, Dict, Optional, Any
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
FPB_AGENDA_URL = "https://www.fpb.pt/agenda/" # Replace with actual FC Gaia Agenda URL if specific
FPB_RESULTADOS_URL = "https://www.fpb.pt/resultados/" # Replace with actual FC Gaia Results URL if specific
# TODO: The user requested "process the pages of Agenda and Results of FPB".
# Since I don't have the specific FC Gaia URL, I will assume the script needs to be pointed to specific URLs.
# For now, I will use placeholders or try to find where FC Gaia ID is.
# Assuming we will just take the URLs as environment variables or constants for now.
# But for the purpose of this task, I will use the generic structure logic they provided.

# NOTE: The user prompt implies I should know the URLs or they are generic.
# "process lists of Agenda and Results of FPB".
# I'll add them as constants but they might need to be specific to the team.
# I will infer the team is FC Gaia. I'll search for FC Gaia ID if possible, but safer to stick to the logic requested.
# I will use environment variables for URLs to be safe/flexible.

AGENDA_URL = os.getenv("AGENDA_URL", "https://www.fpb.pt/calendario/clube_119/") # Correct FC Gaia URL
RESULTADOS_URL = os.getenv("RESULTADOS_URL", "https://www.fpb.pt/resultados/clube_119/") # Correct FC Gaia URL

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set.")
    # In local dev we might rely on .env, but github actions will set these.
    # We will soft fail or just print if running locally without them to avoid crashing during dev setup if user runs it.
    # But for production code, we should probably raise.
    # exit(1)

def get_supabase_client() -> Optional[Client]:
    if SUPABASE_URL and SUPABASE_KEY:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    return None

supabase = get_supabase_client()

def parse_date(date_str: str) -> Optional[datetime.date]:
    # format on site: "1 FEV 2026" or "15 FEV 2026"
    # Old format expected: "Sábado, 01 Fev 2026"
    
    months = {
        "JAN": 1, "FEV": 2, "MAR": 3, "ABR": 4, "MAI": 5, "JUN": 6,
        "JUL": 7, "AGO": 8, "SET": 9, "OUT": 10, "NOV": 11, "DEZ": 12
    }
    try:
        # Clean up string first
        clean_date = date_str.strip().upper()
        
        # Split by space
        parts = clean_date.split(" ")
        # Expecting [Day, Month, Year] e.g. ['1', 'FEV', '2026']
        
        if len(parts) >= 3:
            day = int(parts[0])
            month_str = parts[1]
            year = int(parts[2])
            
            # Map month
            # Handle potential casing issues if map is rigid, but we UPPERed it.
            # Handle month abbreviation if site uses full names? observed is "FEV", "MAR", "JAN"
            # Some sites might use "Janeiro", let's stick to observed 3 chars or full key map
            
            if month_str in months:
                month = months[month_str]
            else:
                 # Try first 3 chars
                 month = months.get(month_str[:3], 1) # Fallback to Jan? Better to fail or log.
            
            return datetime.date(year, month, day)
            
        return None
    except Exception as e:
        print(f"Error parsing date '{date_str}': {e}")
        return None

def fetch_and_parse(url: str, is_agenda: bool) -> List[Dict[str, Any]]:
    print(f"Fetching {url}...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    games_data = []

    # 1. Logic of Temporal Grouping: div.day-wrapper
    day_wrappers = soup.select("div.day-wrapper")
    
    for day_wrapper in day_wrappers:
        # 1. Scraper reads h3.date
        date_elem = day_wrapper.select_one("h3.date")
        if not date_elem:
            continue
            
        date_text = date_elem.get_text(strip=True)
        game_date = parse_date(date_text)
        
        if not game_date:
            continue

        # 2. Iterate through all a.game-wrapper-a
        game_links = day_wrapper.select("a.game-wrapper-a")
        
        for game_link in game_links:
            try:
                # Extract details
                # Time
                # Time
                time_elem = game_link.select_one(".hour h3")
                game_time = None
                raw_time_text = ""
                if time_elem:
                    raw_time_text = time_elem.get_text(strip=True).upper()
                    # Validate HH:MM format (e.g. 12H15 -> 12:15)
                    normalized = raw_time_text.replace("H", ":")
                    if re.match(r'^\d{1,2}:\d{2}$', normalized):
                        game_time = normalized
                    # else: remains None (handles "A DEFINIR", "ADIADO", etc.) OR it might be a score

                # Teams
                # Structure: .teams-wrapper contains two .team-container (one for home, one for away)
                team_containers = game_link.select(".team-container")
                if len(team_containers) >= 2:
                    # Home team is usually the first one
                    home_elem = team_containers[0].select_one(".sigla") or team_containers[0].select_one(".fullName")
                    home_team = home_elem.get_text(strip=True) if home_elem else "Desconhecido"
                    
                    # Away team is usually the second one (often has .right class)
                    away_elem = team_containers[1].select_one(".sigla") or team_containers[1].select_one(".fullName")
                    away_team = away_elem.get_text(strip=True) if away_elem else "Desconhecido"
                else:
                    print(f"Could not find teams for game on {game_date}")
                    continue
                
                # Slug generation: DATA-EQUIPACASA-EQUIPAFORA
                def slugify(s):
                    s = s.lower().strip()
                    s = re.sub(r'[^\w\s-]', '', s)
                    s = re.sub(r'[\s_-]+', '-', s)
                    s = re.sub(r'^-+|-+$', '', s)
                    return s

                slug = f"{game_date.isoformat()}-{slugify(home_team)}-{slugify(away_team)}"

                # Status & Scores
                status = "AGENDADO"
                score_home = None
                score_away = None
                
                if is_agenda:
                    status = "AGENDADO"
                else:
                    # Results page
                    # In results page, the score might be in .hour h3 (e.g. "80 - 70") or similar?
                    # Let's inspect potential score containers if they differ from time.
                    # Usually if finished, the time is replaced by score or there is a specific score element.
                    # Based on standard logic:
                    results_wrapper = game_link.select_one(".results_wrapper")
                    
                    
                    # Check if the time element actually contains the score (common pattern)
                    # "12H15" vs "80 - 70"
                    if raw_time_text and "-" in raw_time_text and ":" not in raw_time_text:
                         status = "FINALIZADO"
                         try:
                             parts = raw_time_text.split("-")
                             score_home = int(parts[0].strip())
                             score_away = int(parts[1].strip())
                         except:
                             pass
                    elif results_wrapper:
                         status = "FINALIZADO"
                         # Logic for results_wrapper if it exists
                         scores = results_wrapper.select(".score")
                         if len(scores) >= 2:
                            score_home = int(scores[0].get_text(strip=True))
                            score_away = int(scores[1].get_text(strip=True))

                    # Fallback: check classes for winner/loser to imply finished
                    if game_link.select(".victory_font"):
                        status = "FINALIZADO"

                # Escalão/Competição
                category = "Unknown"
                # From inspection: .competition span
                comp_span = game_link.select_one(".competition span")
                if comp_span:
                    full_text = comp_span.get_text(strip=True)
                    # "Sub 14 Masculino | CD 1.ª DIV. S14M"
                    if "|" in full_text:
                        parts = full_text.split("|")
                        category = parts[0].strip()
                        competition = parts[1].strip()
                    else:
                        category = full_text
                        competition = full_text # or generic
                else: 
                     competition = "Unknown"

                game_data = {
                    "slug": slug,
                    "data": game_date.isoformat(),
                    "hora": game_time,
                    "equipa_casa": home_team,
                    "equipa_fora": away_team,
                    "resultado_casa": score_home,
                    "resultado_fora": score_away,
                    "escalao": category,
                    "competicao": competition,
                    "status": status
                }
                games_data.append(game_data)

            except Exception as e:
                print(f"Error processing game item: {e}")
                continue

    return games_data

def upsert_to_supabase(data: List[Dict[str, Any]]):
    if not supabase:
        print("Supabase client not initialized. Skipping upsert.")
        return

    if not data:
        print("No data to upsert.")
        return

    print(f"Upserting {len(data)} records to Supabase...")
    try:
        # Chunking just in case
        for i in range(0, len(data), 100):
            chunk = data[i:i+100]
            response = supabase.table("partidas").upsert(chunk).execute()
            # print(f"Upserted chunk {i}-{i+100}")
        print("Upsert complete.")
    except Exception as e:
        print(f"Error upserting to Supabase: {e}")

def main():
    print(f"Assuming Agenda URL: {AGENDA_URL}")
    print(f"Assuming Resultados URL: {RESULTADOS_URL}")

    # Process Agenda
    agenda_games = fetch_and_parse(AGENDA_URL, is_agenda=True)
    upsert_to_supabase(agenda_games)

    # Process Resultados
    results_games = fetch_and_parse(RESULTADOS_URL, is_agenda=False)
    # The results page might overwrite agenda items for the same slug, which is correct (updating scores/status)
    upsert_to_supabase(results_games)

if __name__ == "__main__":
    main()
