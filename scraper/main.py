import os
import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
from fpb_parser import fetch_and_parse

load_dotenv()

# --- Configuration ---
AGENDA_URL = os.getenv("AGENDA_URL", "https://www.fpb.pt/calendario/clube_119/")
RESULTADOS_URL = os.getenv("RESULTADOS_URL", "https://www.fpb.pt/resultados/clube_119/")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set.")

def get_supabase_client() -> Optional[Client]:
    if SUPABASE_URL and SUPABASE_KEY:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    return None

supabase = get_supabase_client()

def upsert_to_supabase(data):
    if not supabase:
        print("Supabase client not initialized. Skipping upsert.")
        return

    if not data:
        print("No data to upsert.")
        return

    print(f"Upserting {len(data)} records to Supabase...")
    try:
        for i in range(0, len(data), 100):
            chunk = data[i:i+100]
            response = supabase.table("partidas").upsert(chunk).execute()
        print("Upsert complete.")
    except Exception as e:
        print(f"Error upserting to Supabase: {e}")

def update_last_scrape():
    """Update the last_scrape timestamp in metadata table."""
    if not supabase:
        return
    try:
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        supabase.table("metadata").upsert({
            "key": "last_scrape",
            "value": now,
            "updated_at": now
        }).execute()
        print(f"Updated last_scrape to {now}")
    except Exception as e:
        print(f"Error updating last_scrape: {e}")

def main():
    print(f"Assuming Agenda URL: {AGENDA_URL}")
    print(f"Assuming Resultados URL: {RESULTADOS_URL}")

    # Process Agenda (Current Season)
    agenda_games = fetch_and_parse(AGENDA_URL, is_agenda=True, season='2025/2026')
    upsert_to_supabase(agenda_games)

    # Process Resultados (Current Season)
    results_games = fetch_and_parse(RESULTADOS_URL, is_agenda=False, season='2025/2026')
    upsert_to_supabase(results_games)
    
    # Update last scrape timestamp
    update_last_scrape()

if __name__ == "__main__":
    main()
