import requests
from bs4 import BeautifulSoup
from fpb_parser import fetch_and_parse

# FC Gaia ID = 119
AJAX_URL = "https://www.fpb.pt/wp-admin/admin-ajax.php"

SEASONS = [
    "2023/2024",
    "2024/2025"
]

def debug_ajax_season(season):
    print(f"\n--- DEBUGGING AJAX SEASON {season} ---")
    
    params = {
        "action": "get_more_days",
        "epoca": season,
        "clube": 119,
        "wasLoadMore": "false"
    }
    
    print(f"Fetching AJAX: {AJAX_URL} with params {params}")
    
    # Use headers just in case
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.get(AJAX_URL, params=params, headers=headers)
        response.raise_for_status()
    except Exception as e:
        print(f"Failed: {e}")
        return

    # Inspect response (it might be JSON or HTML)
    content = response.content
    # Try creating soup directly from content
    soup = BeautifulSoup(content, "html.parser")
    
    # Use logic similar to fpb_parser but manual here to verify
    day_wrappers = soup.select("div.day-wrapper")
    print(f"Found {len(day_wrappers)} day wrappers.")
    
    games_found = 0
    unique_slugs = set()
    
    # We can reuse fetch_and_parse simply by mocking the request, 
    # but here I effectively want to see if `fpb_parser.py` logic applies to this content.
    # Actually, I can just modify fetch_and_parse to accept HTML content?
    # Or I can just write a small parser here.
    
    # Let's import the parsing logic from fpb_parser? 
    # No, let's just copy the critical inner loop logic or rely on `day_wrappers` count as a proxy.
    # If I see ~40-50 day wrappers, that's good (~130 games / ~3 games per weekend = ~40 weekends).
    
    # Let's look at one date
    if day_wrappers:
        first_day = day_wrappers[0]
        date_elem = first_day.select_one("h3.date")
        if date_elem:
            print(f"First Date Found: {date_elem.get_text(strip=True)}")
            
            # Check for year in the date text
            # If it's 2023/2024 season, first date should be late 2023.
    
    print(f"Response size: {len(content)} bytes")

def main():
    for season in SEASONS:
        debug_ajax_season(season)

if __name__ == "__main__":
    main()
