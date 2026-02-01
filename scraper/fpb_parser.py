import requests
import re
import datetime
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional

def parse_date(date_str: str) -> Optional[datetime.date]:
    months = {
        "JAN": 1, "FEV": 2, "MAR": 3, "ABR": 4, "MAI": 5, "JUN": 6,
        "JUL": 7, "AGO": 8, "SET": 9, "OUT": 10, "NOV": 11, "DEZ": 12
    }
    try:
        clean_date = date_str.strip().upper()
        parts = clean_date.split(" ")
        
        if len(parts) >= 3:
            day = int(parts[0])
            month_str = parts[1]
            year = int(parts[2])
            
            if month_str in months:
                month = months[month_str]
            else:
                 month = months.get(month_str[:3], 1)
            
            return datetime.date(year, month, day)
        return None
    except Exception:
        return None

def fetch_and_parse(url: str, is_agenda: bool, season: str = '2025/2026') -> List[Dict[str, Any]]:
    print(f"Fetching {url} for season {season}...")
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

    day_wrappers = soup.select("div.day-wrapper")
    
    for day_wrapper in day_wrappers:
        date_elem = day_wrapper.select_one("h3.date")
        if not date_elem:
            continue
            
        date_text = date_elem.get_text(strip=True)
        game_date = parse_date(date_text)
        
        if not game_date:
            continue

        game_links = day_wrapper.select("a.game-wrapper-a")
        
        for game_link in game_links:
            try:
                # Time
                time_elem = game_link.select_one(".hour h3")
                if not time_elem:
                    time_elem = game_link.select_one(".time") or game_link.select_one(".schedule-time")
                
                game_time = None
                raw_time_text = ""
                
                if time_elem:
                    raw_time_text = time_elem.get_text(strip=True).upper()
                    normalized = raw_time_text.replace("H", ":")
                    match_time = re.search(r'(\d{1,2}:\d{2})', normalized)
                    if match_time:
                         game_time = match_time.group(1).zfill(5)

                # Teams
                team_containers = game_link.select(".team-container")
                if len(team_containers) >= 2:
                    home_elem = team_containers[0].select_one(".sigla") or team_containers[0].select_one(".fullName")
                    home_team = home_elem.get_text(strip=True) if home_elem else "Desconhecido"
                    
                    away_elem = team_containers[1].select_one(".sigla") or team_containers[1].select_one(".fullName")
                    away_team = away_elem.get_text(strip=True) if away_elem else "Desconhecido"
                else:
                    continue
                
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
                    results_wrapper = game_link.select_one(".results_wrapper")
                    
                    if results_wrapper:
                         score_elems = results_wrapper.select("h3.results_text")
                         if len(score_elems) >= 2:
                             status = "FINALIZADO"
                             try:
                                 score_home = int(score_elems[0].get_text(strip=True))
                                 score_away = int(score_elems[1].get_text(strip=True))
                             except:
                                 pass
                    
                    if score_home is None and raw_time_text and "-" in raw_time_text and ":" not in raw_time_text:
                         status = "FINALIZADO"
                         try:
                             parts = raw_time_text.split("-")
                             score_home = int(parts[0].strip())
                             score_away = int(parts[1].strip())
                         except:
                             pass

                    if game_link.select(".victory_font"):
                        status = "FINALIZADO"

                # Category/Competition
                category = "Unknown"
                competition = "Unknown"
                comp_span = game_link.select_one(".competition span")
                if comp_span:
                    full_text = comp_span.get_text(strip=True)
                    if "|" in full_text:
                        parts = full_text.split("|")
                        category = parts[0].strip()
                        competition = parts[1].strip()
                    else:
                        category = full_text
                        competition = full_text

                # Location
                game_location = None
                loc_elem = game_link.select_one(".location-wrapper b")
                if loc_elem:
                    game_location = loc_elem.get_text(strip=True)

                # Logos
                home_logo = None
                away_logo = None
                images = game_link.select("img")
                logo_images = [img['src'] for img in images if 'src' in img.attrs and ('CLU' in img['src'] or 'clubes' in img['src'])]
                
                if len(logo_images) >= 2:
                    home_logo = logo_images[0]
                    away_logo = logo_images[1]

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
                    "local": game_location,
                    "logotipo_casa": home_logo,
                    "logotipo_fora": away_logo,
                    "status": status,
                    "epoca": season  # Added field
                }
                games_data.append(game_data)

            except Exception as e:
                print(f"Error processing game item: {e}")
                continue

    return games_data
