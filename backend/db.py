import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv(Path(__file__).resolve().parent / ".env")


def _required_setting(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(
            f"{name} is not configured. Add it to backend/.env before starting the API."
        )
    return value


supabase_url = _required_setting("SUPABASE_URL")
supabase_key = _required_setting("SUPABASE_SECRET_KEY")
supabase: Client = create_client(supabase_url, supabase_key)