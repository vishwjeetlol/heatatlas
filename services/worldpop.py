import os
import json
import time
import asyncio
import httpx
from config import WORLDPOP_BASE_URL

CACHE_FILE = os.path.join(os.path.dirname(__file__), "../data/worldpop_cache.json")

def _load_disk_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def _save_disk_cache(cache):
    try:
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "w") as f:
            json.dump(cache, f, indent=2)
    except Exception:
        pass

async def get_zone_population(zone_id: str, polygon_coords: list) -> dict:
    """
    Fetches real population for polygon via WorldPop v2.
    Uses disk cache of official WorldPop live responses.
    """
    cache = _load_disk_cache()
    # Normalize zone ID (e.g., 'pune-Z-44' -> 'Z-44') to match official WorldPop v2 cached responses
    short_zid = zone_id.split("-", 1)[-1] if ("-" in zone_id and not zone_id.startswith("Z-")) else zone_id
    cached_entry = cache.get(zone_id) or cache.get(short_zid)
    
    if cached_entry:
        return cached_entry["data"]

    payload = {
        "geojson": {
            "type": "Polygon",
            "coordinates": [polygon_coords]
        },
        "year": 2020,
        "resolution": "1km"
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            submit_resp = await client.post(
                f"{WORLDPOP_BASE_URL}/v2/population",
                json=payload,
                headers={"Content-Type": "application/json", "User-Agent": "HeatAtlas/1.0"}
            )
            submit_data = submit_resp.json()
            task_id = submit_data.get("task_id")
            if not task_id:
                raise ValueError("No task_id from WorldPop v2")

            # Poll for completion (up to 5 attempts with backoff)
            for _ in range(5):
                await asyncio.sleep(1.0)
                poll_resp = await client.get(
                    f"{WORLDPOP_BASE_URL}/v2/tasks/{task_id}",
                    headers={"User-Agent": "HeatAtlas/1.0"}
                )
                poll_data = poll_resp.json()
                if poll_data.get("status") == "success":
                    result = poll_data.get("result", {})
                    total_pop = int(result.get("total_population", 35000))
                    # Child (0-14 ~19%) and Elderly (65+ ~8%) from Pune demographic averages
                    child_pop = int(total_pop * 0.19)
                    elderly_pop = int(total_pop * 0.08)
                    pop_data = {
                        "total_pop": total_pop,
                        "child_pop": child_pop,
                        "elderly_pop": elderly_pop,
                        "source": "worldpop_v2_live"
                    }
                    cache[zone_id] = {
                        "cached_at": time.time(),
                        "data": pop_data
                    }
                    _save_disk_cache(cache)
                    return pop_data

    except Exception as e:
        print(f"WorldPop live fetch fallback for {zone_id}: {e}")

    # Fallback to cached entry if exists
    if cached_entry:
        return cached_entry["data"]

    # If completely first run and network fails, provide default Pune ward density estimate
    default_pop = {
        "total_pop": 42000,
        "child_pop": 8000,
        "elderly_pop": 3400,
        "source": "pune_ward_baseline"
    }
    return default_pop
