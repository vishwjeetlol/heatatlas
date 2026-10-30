import time
import httpx
from cachetools import TTLCache
from config import OPEN_METEO_BASE_URL, CACHE_TTL_FORECAST_MIN
from cities import get_city

# Multi-city cache for 60 minutes
_forecast_cache = TTLCache(maxsize=50, ttl=CACHE_TTL_FORECAST_MIN * 60)
_last_fetch_times = {}

async def get_city_forecast(city_id: str = "pune"):
    city = get_city(city_id)
    cache_key = f"{city['id']}_hourly"
    now = time.time()

    cached = _forecast_cache.get(cache_key)
    if cached:
        age_sec = int(now - _last_fetch_times.get(cache_key, now))
        return cached, age_sec

    lat, lon = city["centroid"]
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

    _forecast_cache[cache_key] = data
    _last_fetch_times[cache_key] = now
    return data, 0

async def get_pune_forecast():
    return await get_city_forecast("pune")
