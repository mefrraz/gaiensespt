import os
import requests
from bs4 import BeautifulSoup
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

COMPETITIONS = [
    {"name": "Camp. Distrital Sub14", "url": "https://resultados.tugabasket.com/getCompetitionDetails?competitionId=11038", "id": "sub14"},
    {"name": "Camp. Distrital Sub16", "url": "https://resultados.tugabasket.com/getCompetitionDetails?competitionId=11040", "id": "sub16"},
    {"name": "Camp. Distrital Sub18", "url": "https://resultados.tugabasket.com/getCompetitionDetails?competitionId=11042", "id": "sub18"},
    # Usamos nome com 'Seniores' para o normalizador detetar
    {"name": "Camp. Nacional 1.ª Div. (Seniores)", "url": "https://resultados.tugabasket.com/getCompetitionDetails?competitionId=10904", "id": "seniores"}
]

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set.")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_html(url):
    print(f"Fetching {url}...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.text
    else:
        print(f"Failed to fetch {url}: {response.status_code}")
        return None



def parse_standings(html_content, competition_name):
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Locate all accordions which contain the group names and tables
    accordions = soup.find_all("div", class_="accordion")
    print(f"Found {len(accordions)} accordions for {competition_name}.")
    
    standings_data = []
    
    for acc in accordions:
        # Get Group Name
        title_div = acc.find("div", class_="accordion-title")
        if not title_div:
            continue
            
        group_name = title_div.get_text(strip=True)
        # Assuming format like "3.ª FASE - GRUPO Z"
        
        # Find table
        content_div = acc.find("div", class_="accordion-content")
        if not content_div:
            continue
            
        table = content_div.find("table", class_="standings")
        if not table:
            continue
            
        # Parse rows
        rows = table.find("tbody").find_all("tr")
        
        group_standings = []
        has_gaia = False
        
        for row in rows:
            cols = row.find_all("td")
            if len(cols) < 6:
                continue
                
            pos_text = cols[0].get_text(strip=True)
            original_team_name = cols[1].get_text(strip=True)
            
            # Keep original name
            team_name = original_team_name
            
            # Check if this is a Gaia team (using original name to be safe)
            if "GAIA" in original_team_name.upper():
                has_gaia = True
                
            try:
                # Column mapping based on inspection:
                # 0: Pos
                # 1: Team
                # 2: J
                # 3: V
                # 4: D
                # 5: PTS
                
                games = int(cols[2].get_text(strip=True))
                wins = int(cols[3].get_text(strip=True))
                losses = int(cols[4].get_text(strip=True))
                points = int(cols[5].get_text(strip=True))
                pos = int(pos_text)
                
                group_standings.append({
                    "competicao": competition_name,
                    "grupo": group_name,
                    "equipa": team_name,
                    "posicao": pos,
                    "jogos": games,
                    "vitorias": wins,
                    "derrotas": losses,
                    "pontos": points
                })
            except ValueError as e:
                print(f"Error parsing row: {e}")
                continue
        
        # Only add this group if Gaia is in it (to keep relevant data)
        if has_gaia:
            print(f"Found Gaia in group: {group_name} ({competition_name})")
            standings_data.extend(group_standings)
            
    return standings_data

def upsert_standings(data):
    if not data:
        print("No standings data to upsert.")
        return
        
    print(f"Upserting {len(data)} standing records...")
    try:
        # Upsert in chunks
        for i in range(0, len(data), 100):
            chunk = data[i:i+100]
            supabase.table("classificacoes_2025_2026").upsert(chunk, on_conflict="competicao,grupo,equipa").execute()
        print("Upsert complete.")
    except Exception as e:
        print(f"Error upserting to Supabase: {e}")

def main():
    print("Starting Standings Scraper for Multiple Competitions...")
    
    all_data = []

    for comp in COMPETITIONS:
        print(f"Processing {comp['name']}...")
        html = fetch_html(comp['url'])
        
        # Fallback for Sub14 (development mainly)
        if not html and comp['id'] == 'sub14' and os.path.exists("temp_tuga.html"):
             print("Using local temp_tuga.html fallback for Sub14...")
             with open("temp_tuga.html", "r") as f:
                 html = f.read()
        
        if html:
            comp_data = parse_standings(html, comp['name'])
            all_data.extend(comp_data)
        else:
            print(f"Could not get HTML content for {comp['name']}")

    if all_data:
        upsert_standings(all_data)

if __name__ == "__main__":
    main()
