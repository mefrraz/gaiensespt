import requests
from bs4 import BeautifulSoup

def check_url(url, season_label):
    print(f"\n--- Checking {season_label} ---")
    print(f"URL: {url}")
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Check for season selector
        print("Searching for season links...")
        links = soup.find_all("a", href=True)
        found_links = 0
        for link in links:
            href = link['href']
            if "epoca=" in href or "2023" in href or "2024" in href:
                print(f"Found link: {href}")
                found_links += 1
                if found_links > 10:
                    break
                    
        dates = soup.select("h3.date")
        print(f"Found {len(dates)} dates.")
        for i, d in enumerate(dates[:3]):
            print(f"Date {i}: {d.get_text(strip=True)}")
            
    except Exception as e:
        print(f"Error: {e}")

def main():
    variations = [
        ("Base with epoca", "https://www.fpb.pt/calendario/clube_119/?clube=119&epoca=2023/2024"),
        ("With trailing &", "https://www.fpb.pt/calendario/clube_119/?clube=119&epoca=2023/2024&"),
        ("Encoded slash", "https://www.fpb.pt/calendario/clube_119/?clube=119&epoca=2023%2F2024"),
        ("Only ID in path", "https://www.fpb.pt/calendario/clube_119/2023-2024"), 
    ]
    
    for label, url in variations:
        check_url(url, label)

if __name__ == "__main__":
    main()
