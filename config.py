import os
from dotenv import load_dotenv

load_dotenv()

PUNE_BBOX = {
    "south": 18.41,
    "west": 73.70,
    "north": 18.65,
    "east": 73.95
}

GRID_ROWS = 8
GRID_COLS = 8

OPEN_METEO_BASE_URL = os.getenv("OPEN_METEO_BASE_URL", "https://api.open-meteo.com")
WORLDPOP_BASE_URL = os.getenv("WORLDPOP_BASE_URL", "https://api.worldpop.org")
OVERPASS_URL = os.getenv("OVERPASS_URL", "https://overpass-api.de/api/interpreter")
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

CACHE_TTL_FORECAST_MIN = int(os.getenv("CACHE_TTL_FORECAST_MIN", "60"))
CACHE_TTL_ASSETS_H = int(os.getenv("CACHE_TTL_ASSETS_H", "6"))
CACHE_TTL_POP_H = int(os.getenv("CACHE_TTL_POP_H", "24"))

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./heatatlas.db")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
