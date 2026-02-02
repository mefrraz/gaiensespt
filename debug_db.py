import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set.")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_data():
    print("Checking 'games' table...")
    # Get all distinct seasons
    # Limit to 2000 to get a good sample
    response = supabase.table("games").select("epoca").limit(2000).execute()
    data = response.data
    
    if not data:
        print("TABLE 'games' IS EMPTY!")
    else:
        counts = {}
        for row in data:
            ep = row.get('epoca', 'UNKNOWN')
            counts[ep] = counts.get(ep, 0) + 1
        
        print("Record counts by season:")
        for ep, count in counts.items():
            print(f"  {ep}: {count}")

if __name__ == "__main__":
    check_data()
