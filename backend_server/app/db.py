"""
Supabase client factory — used by all backend services.
Provides separate clients for service_role database access and anon key auth.
"""
from supabase import create_client, Client
from app.config import Config


def get_supabase() -> Client:
    """Returns a Supabase client using the service_role key for full DB access."""
    if not Config.SUPABASE_URL or not Config.SUPABASE_SERVICE_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
    return create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)


def get_anon_supabase() -> Client:
    """Returns a Supabase client using the anon key for user auth (sign in)."""
    if not Config.SUPABASE_URL or not Config.SUPABASE_ANON_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env")
    return create_client(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY)