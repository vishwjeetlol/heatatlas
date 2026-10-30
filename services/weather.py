import time
import httpx
from cachetools import TTLCache
from config import OPEN_METEO_BASE_URL, CACHE_TTL_FORECAST_MIN, PUNE_BBOX

# Cache for 60 minutes
_forecast_cache = TTLCache(maxsize=10, ttl=CACHE_TTL_FORECAST_MIN * 60)
_last_fetch_time = 0

async def get_pune_forecast():
    global _last_fetch_time
    cached = _forecast_cache.get("pune_hourly")
    if cached:
        return cached, int(time.time() - _last_fetch_time)

    # Centroid of Pune bounding box
    lat = (PUNE_BBOX["south"] + PUNE_BBOX["north"]) / 2
    lon = (PUNE_BBOX["west"] + PUNE_BBOX["east"]) / 2

    url = f"{OPEN_METEO_BASE_URL}/v1/forecast"
    params = {
        "latitude": f"{lat:.4f}",
        "longitude": f"{lon:.4f}",
        "hourly": "temperature_2m,apparent_temperature,relative_humidity_2m",
        "timezone": "Asia/Kolkata",
        "forecast_days": 2
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    _forecast_cache["pune_hourly"] = data
    _last_fetch_time = time.time()
    return data, 0
