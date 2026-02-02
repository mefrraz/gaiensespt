import os
import time
from supabase import create_client, Client
from dotenv import load_dotenv
from fpb_parser import fetch_and_parse
from playwright.sync_api import sync_playwright

load_dotenv()

# --- Configuration ---
# FC Gaia ID = 119
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

    # Unified 'games' table
    table_name = "games"

    # Deduplicate by slug to avoid "ON CONFLICT DO UPDATE command cannot affect row a second time"
    # This keeps the last occurrence of a slug in the list.
    unique_map = {item['slug']: item for item in data}
    unique_data = list(unique_map.values())
    
    if len(unique_data) < len(data):
        print(f"Removed {len(data) - len(unique_data)} duplicate records.")

    print(f"Upserting {len(unique_data)} records to table '{table_name}'...")
    try:
        for i in range(0, len(unique_data), 100):
            chunk = unique_data[i:i+100]
            # Use count argument properly or ignore return
            supabase.table(table_name).upsert(chunk).execute()
        print("Upsert complete.")
    except Exception as e:
        print(f"Error upserting to Supabase: {e}")

def fetch_html_with_playwright(url, season_label):
    print(f"  [Playwright] Navigating to {url}...")
    
    with sync_playwright() as p:
        # Launch browser (headless=True by default on servers, make sure to install deps)
        browser = p.chromium.launch()
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        )
        page = context.new_page()
        
        try:
            page.goto(url, timeout=60000)
            page.wait_for_selector("div.day-wrapper", timeout=30000)
            
            # Check if we need to switch seasons
            content = page.content()
            # Simple check: if season_label is NOT in the first few dates, we assume we need to switch
            # Or better: Check the active season in the dropdown.
            
            # Helper to check if dates match expected year
            def check_dates_match(target_season):
                # target_season format "2023/2024" -> expect 2023 or 2024
                years = target_season.split("/")
                dates_text = page.locator("h3.date").all_text_contents()
                if not dates_text: return False
                first_dates = " ".join(dates_text[:5])
                return years[0] in first_dates or years[1] in first_dates

            if check_dates_match(season_label):
                print(f"  [Playwright] Season {season_label} seems already loaded.")
                return page.content()
            
            print(f"  [Playwright] Detected mismatch. Attempting to switch to {season_label}...")
            
            # Strategy:
            # 1. If target is "active" but content mismatch -> we must switch away first.
            # 2. Use JS click (more robust than Playwright click for this specific UI).
            
            target_is_active = False
            active_option = page.locator(f"li.option.active[tag='{season_label}']")
            if active_option.count() > 0:
                print(f"  [Playwright] Target {season_label} is marked active but content is wrong. Switching away first.")
                target_is_active = True
                
                # Switch to something else (e.g. current year or just the first other option)
                other_option = page.locator(f"li.option:not([tag='{season_label}'])").first
                
                if other_option.count() > 0:
                    other_text = other_option.inner_text()
                    print(f"  [Playwright] Clicking 'other' option ({other_text}) to reset state using JS...")
                    
                    # Ensure dropdown open
                    toggle = page.locator(".dropdown-toggle").first
                    if toggle.is_visible():
                        toggle.click()
                        page.wait_for_timeout(500)
                    
                    other_option.evaluate("el => el.click()")
                    try:
                        page.wait_for_load_state("networkidle", timeout=5000)
                    except:
                        page.wait_for_timeout(2000)

            # Now click the target
            print(f"  [Playwright] clicking target {season_label} using JS...")
            
            # Ensure dropdown open (again if needed)
            toggle = page.locator(".dropdown-toggle").first
            if toggle.is_visible():
                toggle.click()
                page.wait_for_timeout(500)
            
            option = page.locator(f"li.option[tag='{season_label}']").first
            if not option.count():
                option = page.get_by_text(season_label, exact=True).first
            
            if option.count():
                # JS Click
                option.evaluate("el => el.click()")
                
                print("  [Playwright] Waiting for network idle...")
                try:
                    page.wait_for_load_state("networkidle", timeout=5000)
                except:
                    print("  [Playwright] Network idle timeout, waiting fixed time.")
                    page.wait_for_timeout(3000)
                
                if check_dates_match(season_label):
                    print("  [Playwright] Switch successful!")
                else:
                    print("  [Playwright] Switch might have failed, dates don't match expected years.")
            else:
                 print(f"  [Playwright] Could not find option for {season_label}")

            return page.content()
            
        except Exception as e:
            print(f"  [Playwright] Error: {e}")
            return None
        finally:
            browser.close()

def main():
    print("Starting history seed (Playwright Enhanced)...")
    
    for season in SEASONS:
        print(f"\n--- Processing Season {season} ---")
        
        # Agenda
        agenda_url = f"{BASE_CALENDAR_URL}&epoca={season}"
        html_agenda = fetch_html_with_playwright(agenda_url, season)
        if html_agenda:
            agenda_data = fetch_and_parse(agenda_url, is_agenda=True, season=season, html_content=html_agenda)
            upsert_to_supabase(agenda_data)
        
        # Results
        results_url = f"{BASE_RESULTS_URL}&epoca={season}"
        html_results = fetch_html_with_playwright(results_url, season)
        if html_results:
            results_data = fetch_and_parse(results_url, is_agenda=False, season=season, html_content=html_results)
            upsert_to_supabase(results_data)

    print("\nHistory seed completed!")

if __name__ == "__main__":
    main()
