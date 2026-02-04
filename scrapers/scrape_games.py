import os
import json
import time
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from fpb_parser import fetch_and_parse

# Load .env from project root (parent of scrapers directory)
load_dotenv(Path(__file__).parent.parent / '.env')

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

def upsert_to_supabase(data, table_name="games"):
    if not supabase:
        print("Supabase client not initialized. Skipping upsert.")
        return

    if not data:
        print("No data to upsert.")
        return

    print(f"Upserting {len(data)} records to Supabase table '{table_name}'...")
    try:
        for i in range(0, len(data), 100):
            chunk = data[i:i+100]
            response = supabase.table(table_name).upsert(chunk).execute()
        print("Upsert complete.")
    except Exception as e:
        print(f"Error upserting to Supabase: {e}")

def update_last_scrape():
    """Update the last_scrape timestamp in metadata table."""
    if not supabase:
        return
    try:
        now = datetime.now(timezone.utc).isoformat()
        supabase.table("metadata").upsert({
            "key": "last_scrape",
            "value": now,
            "updated_at": now
        }).execute()
        print(f"Updated last_scrape to {now}")
    except Exception as e:
        print(f"Error updating last_scrape: {e}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="FC Gaia Game Scraper")
    parser.add_argument("--season", type=str, default="2025/2026", help="Season to scrape (e.g., 2025/2026)")
    parser.add_argument("--table", type=str, default="games_2025_2026", help="Supabase table to upsert data to")
    parser.add_argument("--agenda-url", type=str, default=AGENDA_URL, help="URL for the agenda")
    parser.add_argument("--results-url", type=str, default=RESULTADOS_URL, help="URL for the results")
    
    args = parser.parse_args()

    print(f"Scraping Season: {args.season}")
    print(f"Target Table: {args.table}")
    print(f"Agenda URL: {args.agenda_url}")
    print(f"Resultados URL: {args.results_url}")

    # Process Agenda
    agenda_games = fetch_and_parse(args.agenda_url, is_agenda=True, season=args.season)
    upsert_to_supabase(agenda_games, table_name=args.table)

    # Process Resultados
    results_games = fetch_and_parse(args.results_url, is_agenda=False, season=args.season)
    upsert_to_supabase(results_games, table_name=args.table)
    
    # Update last scrape timestamp (only if scraping current season, or maybe we can just always update it)
    if args.season == "2025/2026": # Only update metadata if scraping current season
        update_last_scrape()

if __name__ == "__main__":
    main()
