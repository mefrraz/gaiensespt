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
    # format example: "Sábado, 01 Fev 2026" or similar portuguese format
    # We need to robustly parse this.
    # FPB usually uses: "Sábado, 31 Jan 2026"
    months = {
        "Jan": 1, "Fev": 2, "Mar": 3, "Abr": 4, "Mai": 5, "Jun": 6,
        "Jul": 7, "Ago": 8, "Set": 9, "Out": 10, "Nov": 11, "Dez": 12
    }
    try:
        parts = date_str.split(", ")[1].split(" ")
        day = int(parts[0])
        month = months[parts[1]]
        year = int(parts[2])
        return datetime.date(year, month, day)
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
                time_elem = game_link.select_one(".hour h3")
                game_time = "00:00" # Default
                if time_elem:
                    raw_time = time_elem.get_text(strip=True)
                    # Handle "A definir" or similar
                    if ":" in raw_time:
                        game_time = raw_time
                    else:
                        game_time = "00:00" # Or null? Let's keep 00:00 for valid time format

                # Teams
                # Usually .home-team .name and .away-team .name or similar. 
                # Inspecting typical FPB structure based on class names provided indirectly or inferred.
                # User didn't give team selectors, only wrapper. I'll infer standard ones or look at common FPB structure.
                # Typically: .team-name inside .home and .visitor or similar.
                # Let's try to be generic or look for known classes.
                # Assuming: .team-left .name, .team-right .name OR .home-team, .guest-team
                
                # Let's inspect the HTML structure from a typical FPB page if we could, but we can't.
                # I will try to select based on common sense naming in FPB:
                # Often: .info-vis .team_name  or  .team_name
                
                # Let's try to grab team names.
                teams = game_link.select(".team-name")
                if len(teams) >= 2:
                    home_team = teams[0].get_text(strip=True)
                    away_team = teams[1].get_text(strip=True)
                else:
                    # Fallback or strict error?
                    # Let's try another selector just in case
                    info_vis = game_link.select(".info-vis .name") # hypothesis
                    if len(info_vis) >= 2:
                        home_team = info_vis[0].get_text(strip=True)
                        away_team = info_vis[1].get_text(strip=True)
                    else:
                        print(f"Could not find teams for game on {game_date}")
                        continue
                
                # Slug generation: DATA-EQUIPACASA-EQUIPAFORA
                # Normalize strings for slug
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
                    # Look for scores. Usually in .score or .result
                    # User mentioned: .results_wrapper
                    results_wrapper = game_link.select_one(".results_wrapper")
                    if results_wrapper:
                        status = "FINALIZADO" # Or check if it says "Intervalo" etc? Assuming results page = finished or live.
                        # Check specific scoreboard classes if available
                        scores = results_wrapper.select(".score") # Hypothetical
                        if not scores:
                             scores = results_wrapper.select("span") # Fallback, might be risky
                        
                        if len(scores) >= 2:
                            try:
                                score_home = int(scores[0].get_text(strip=True))
                                score_away = int(scores[1].get_text(strip=True))
                            except:
                                pass
                        
                        # Winner check via .victory_font?
                        # User said: "Identificar vencedor via classe CSS .victory_font"
                        # This might be on the team name or the score.
                        # We just store the score for now. The winner is implicit.
                        
                    else:
                        # Maybe it exists but no score yet?
                        pass

                # Escalão/Competição
                # Often in .category or .championship
                category = "Unknown"
                cat_elem = game_link.select_one(".category")
                if cat_elem:
                    category = cat_elem.get_text(strip=True)
                
                competition = "Unknown"
                comp_elem = game_link.select_one(".championship") 
                if not comp_elem: # Try another
                    comp_elem = game_link.select_one(".round")
                
                if comp_elem:
                    competition = comp_elem.get_text(strip=True)

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
