import os
from supabase import create_client, Client
from dotenv import load_dotenv
from fpb_parser import fetch_and_parse

load_dotenv()

# --- Configuration ---
# FC Gaia ID = 119
# We can dynamically construct URLs based on season
BASE_CALENDAR_URL = "https://www.fpb.pt/calendario/clube_119/?clube=119"
BASE_RESULTS_URL = "https://www.fpb.pt/resultados/clube_119/?clube=119"

SEASONS = [
    "2023/2024",
    "2024/2025"
]

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set.")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def upsert_to_supabase(data):
    if not data:
        print("No data to upsert.")
        return

    print(f"Upserting {len(data)} records...")
    try:
        for i in range(0, len(data), 100):
            chunk = data[i:i+100]
            response = supabase.table("partidas").upsert(chunk).execute()
        print("Upsert complete.")
    except Exception as e:
        print(f"Error upserting to Supabase: {e}")

def main():
    print("Starting history seed...")
    
    for season in SEASONS:
        print(f"\n--- Processing Season {season} ---")
        
        # Agenda (for completeness, though historical is mostly results)
        agenda_url = f"{BASE_CALENDAR_URL}&epoca={season}"
        agenda_data = fetch_and_parse(agenda_url, is_agenda=True, season=season)
        upsert_to_supabase(agenda_data)
        
        # Results
        results_url = f"{BASE_RESULTS_URL}&epoca={season}"
        results_data = fetch_and_parse(results_url, is_agenda=False, season=season)
        upsert_to_supabase(results_data)

    print("\nHistory seed completed!")

if __name__ == "__main__":
    main()
