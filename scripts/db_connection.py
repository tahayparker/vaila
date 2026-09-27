# \scripts\db_connection.py
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file in the current directory
load_dotenv()

def get_supabase_client() -> Client:
    """
    Initializes and returns a Supabase client instance using environment variables.

    Uses the SERVICE ROLE KEY for administrative access, bypassing RLS.
    Ensure the key is kept secret and secure.
    """
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url:
        raise ValueError("Supabase URL not set in environment variables (SUPABASE_URL).")
    if not key:
        raise ValueError("Supabase Service Role Key not set in environment variables (SUPABASE_SERVICE_ROLE_KEY).")

    url = url.strip().strip('"').strip("'")
    key = key.strip().strip('"').strip("'")

    try:
        supabase: Client = create_client(url, key)

        print("Supabase client initialized successfully (using Service Role Key - RLS bypassed).")
        return supabase
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")
        raise