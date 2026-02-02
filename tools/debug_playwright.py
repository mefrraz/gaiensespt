from playwright.sync_api import sync_playwright

def check_url(url, label):
    print(f"\n--- Checking {label} (Playwright) ---")
    print(f"URL: {url}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)
        
        # Wait for content
        page.wait_for_selector("div.day-wrapper")
        
        # Check dates
        dates = page.locator("h3.date").all_text_contents()
        print(f"Initial dates: {dates[:2]}")
        
        if "2023" not in dates[0] and "2024" not in dates[0]:
            print("Dates incorrect. Attempting to switch season...")
            try:
                # Open dropdown if needed? Or just find text
                # Check if there is a dropdown toggler
                # But subagent just clicked.
                # Let's try locating text "2023/2024"
                
                # First, ensure we see the dropdown. Sometimes it's hidden.
                # Inspecting typical FPB site: "Época" is a dropdown.
                # Let's try to click the seasons selector first if possible.
                # But get_by_text might find the option inside the dropdown.
                
                # Try blindly clicking 2023/2024
                # Or click ".season-selector" or similar?
                # I'll try generic text match.
                
                # Wait, subagent said it clicked "Season selector" then "2023/2024".
                # Coordinates suggests top left/right.
                
                # Let's try to dump inputs/buttons/links with season names
                element = page.get_by_text("2023/2024", exact=False).first
                if element.is_visible():
                     print("Found 2023/2024 text visible.")
                     element.click()
                else:
                     print("2023/2024 text not visible. Finding dropdown...")
                     # Look for a dropdown
                     dropdown = page.locator(".dropdown-toggle").first # Guess
                     if dropdown.count() > 0:
                         dropdown.click()
                         page.get_by_text("2023/2024").click()
                     else:
                         # Try finding any element with current season text to click it
                         current = page.get_by_text("2025/2026").first
                         if current.count() > 0:
                             current.click()
                             page.get_by_text("2023/2024").click()
            
                page.wait_for_timeout(3000) # Wait for update
                
                dates = page.locator("h3.date").all_text_contents()
                print(f"New dates: {dates[:2]}")
                
                with open("debug_page.html", "w") as f:
                    f.write(page.content())
            except Exception as e:
                print(f"Click failed: {e}")
            
        browser.close()

def main():
    variations = [
        ("Base with epoca", "https://www.fpb.pt/calendario/clube_119/?clube=119&epoca=2023/2024"),
    ]
    
    for label, url in variations:
        try:
            check_url(url, label)
        except Exception as e:
            print(f"Error checking {label}: {e}")

if __name__ == "__main__":
    main()
