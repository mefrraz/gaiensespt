import argparse
import subprocess
import os

# CONFIGURATION FOR PAST SEASONS
# User: Fill in the URLs for the seasons you want to scrape.
PAST_SEASONS = {
    "2022/2023": {
        "games": {
            "agenda_url": "https://www.fpb.pt/calendario/clube_119/?clube=119&epoca=2022/2023&",
            "results_url": "https://www.fpb.pt/resultados/clube_119/?clube=119&epoca=2022/2023&",
            "table": "games_2022_2023"
        },
        "standings": {
            "table": "classificacoes_2022_2023" 
        }
    },
    "2023/2024": {
        "games": {
            "agenda_url": "https://www.fpb.pt/calendario/clube_119/?clube=119&epoca=2023/2024&",
            "results_url": "https://www.fpb.pt/resultados/clube_119/?clube=119&epoca=2023/2024&",
            "table": "games_2023_2024"
        }
    },
    "2024/2025": {
        "games": {
            "agenda_url": "https://www.fpb.pt/calendario/clube_119/?clube=119&epoca=2024/2025&",
            "results_url": "https://www.fpb.pt/resultados/clube_119/?clube=119&epoca=2024/2025&",
            "table": "games_2024_2025"
        }
    },
    "2025/2026": {
        "games": {
            "agenda_url": "https://www.fpb.pt/calendario/clube_119/?clube=119&epoca=2025/2026&",
            "results_url": "https://www.fpb.pt/resultados/clube_119/?clube=119&epoca=2025/2026&",
            "table": "games_2025_2026"
        }
    }
}

def run_scraper(season, agenda_url, results_url, table):
    print(f"--- Scraping Games for Season {season} ---")
    if "PLACEHOLDER" in agenda_url or "PLACEHOLDER" in results_url:
        print(f"Skipping {season} because URLs are not configured.")
        return

    cmd = [
        "python3", "scraper/main.py",
        "--season", season,
        "--table", table,
        "--agenda-url", agenda_url,
        "--results-url", results_url
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print(f"Successfully scraped {season}.")
    except subprocess.CalledProcessError as e:
        print(f"Error scraping {season}: {e}")

def run_standings_scraper(season, url, table):
    print(f"--- Scraping Standings for Season {season} ---")
    if "PLACEHOLDER" in url or not url:
        print(f"Skipping standings for {season} because URL is not configured.")
        return

    cmd = [
        "python3", "scraper/standings.py",
        "--season", season,
        "--table", table,
        "--url", url
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print(f"Successfully scraped standings for {season}.")
    except subprocess.CalledProcessError as e:
        print(f"Error scraping standings for {season}: {e}")

def main():
    parser = argparse.ArgumentParser(description="Run Scrapers for Past Seasons")
    parser.add_argument("--season", type=str, help="Specific season to scrape (e.g. 2022/2023). If not provided, tries all configured seasons.")
    args = parser.parse_args()

    if args.season:
        if args.season in PAST_SEASONS:
            # Scrape Games
            if "games" in PAST_SEASONS[args.season]:
                config = PAST_SEASONS[args.season]["games"]
                run_scraper(args.season, config["agenda_url"], config["results_url"], config["table"])
            
            # Scrape Standings
            if "standings" in PAST_SEASONS[args.season] and "url" in PAST_SEASONS[args.season]["standings"]:
                 s_config = PAST_SEASONS[args.season]["standings"]
                 run_standings_scraper(args.season, s_config["url"], s_config["table"])

        else:
            print(f"Season {args.season} not found in configuration.")
    else:
        for season, data in PAST_SEASONS.items():
            # Scrape Games
            if "games" in data:
                run_scraper(season, data["games"]["agenda_url"], data["games"]["results_url"], data["games"]["table"])
            
            # Scrape Standings
            if "standings" in data and "url" in data["standings"]:
                run_standings_scraper(season, data["standings"]["url"], data["standings"]["table"])

if __name__ == "__main__":
    main()
