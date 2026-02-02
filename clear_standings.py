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

def clear_standings():
    print("Clearing 'classificacoes' table...")
    try:
        # Delete all rows. neq('id', 0) is a trick to delete all if you don't have a better filter, 
        # or we can use a simpler method if permitted. 
        # Supabase-py delete usage: .delete().eq(column, value) usually requirements.
        # But 'classificacoes' might not have a single id column that covers everything easily if not set up as such.
        # Let's check schema. Assuming 'id' exists or we can delete by 'competicao' being NOT NULL.
        
        # Safe bet: delete where competicao is not null (which is all of them)
        response = supabase.table("classificacoes").delete().neq("competicao", "PLACEHOLDER").execute()
        print(f"Cleared table. Response: {response}")
    except Exception as e:
        print(f"Error clearing table: {e}")

if __name__ == "__main__":
    clear_standings()
