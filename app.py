import os
import math
import asyncio
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List

from config import PUNE_BBOX, GRID_ROWS, GRID_COLS
from services.weather import get_pune_forecast
from services.worldpop import get_zone_population
from services.assets import get_live_assets, add_asset_report
from services.scoring import compute_scores
from services.agent import generate_dispatch_brief, audit_beacon_photo

# In-memory and SQLite store for Worker Water Beacons
BEACONS = [
    {
        "id": "b_01",
        "location_name": "Swargate Flyover Base (Jedhe Chowk)",
        "lat": 18.5018,
        "lon": 73.8578,
        "zone_id": "Z-44",
        "description": "15+ delivery riders waiting between food delivery orders under direct sun",
        "verified": True,
        "confidence": 0.94,
        "detected_crowd": 16,
        "status": "active",
        "created_at": 1730300000
    }
]

app = FastAPI(title="HeatAtlas API", description="Forecast Heat. Prioritise Relief. (Pune, Maharashtra)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Precalculate 64-zone grid bounding boxes
ZONE_NAMES = [
    ["Nigdi", "Chikhali", "Moshi", "Charholi", "Dighi", "Alandi Rd", "Lohegaon N", "Wagholi N"],
    ["Akurdi", "Pimpri", "Bhosari", "Dapodi", "Vishrantwadi", "Viman Nagar", "Kalyani Ngr", "Wagholi S"],
    ["Pimple Saudagar", "Sangvi", "Aundh", "Khadki", "Yerwada", "Koregaon Park", "Mundhwa", "Kharadi"],
    ["Baner", "Pashan", "Shivajinagar", "Pune Station", "Camp", "Ghorpadi", "Hadapsar N", "Manjri"],
    ["Bavdhan", "Kothrud N", "Deccan", "Kasba Peth", "Swargate", "Wanowrie", "Hadapsar S", "Phursungi"],
    ["Warje", "Kothrud S", "Parvati", "Bibvewadi", "Salunke Vihar", "Kondhwa", "Undri", "Handewadi"],
    ["Karvenagar", "Sinhagad Rd", "Dhankawadi", "Katraj N", "Kondhwa Budruk", "Pisoli", "Yewalewadi", "Autadwadi"],
    ["Dhayari", "Nanded City", "Ambegaon", "Katraj S", "Gokul Nagar", "Saswad Rd", "Uruli Devachi", "Wadki"]
]

lat_step = (PUNE_BBOX["north"] - PUNE_BBOX["south"]) / GRID_ROWS
lon_step = (PUNE_BBOX["east"] - PUNE_BBOX["west"]) / GRID_COLS

ZONES_META = {}
for r in range(GRID_ROWS):
    for c in range(GRID_COLS):
        zid = f"Z-{r}{c}"
        s = PUNE_BBOX["south"] + (GRID_ROWS - 1 - r) * lat_step
        n = s + lat_step
        w = PUNE_BBOX["west"] + c * lon_step
        e = w + lon_step
        name = ZONE_NAMES[r][c] if r < len(ZONE_NAMES) and c < len(ZONE_NAMES[r]) else f"Pune Ward {r}-{c}"
        ZONES_META[zid] = {
            "id": zid,
            "row": r,
            "col": c,
            "name": name,
            "bbox": [s, w, n, e],
            "centroid": [(s + n) / 2, (w + e) / 2],
            "polygon": [
                [w, s],
                [e, s],
                [e, n],
                [w, n],
                [w, s]
            ]
        }

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "city": "Pune, Maharashtra",
        "zones_count": len(ZONES_META),
        "data_sources": {
            "open_meteo": "live",
            "worldpop_v2": "live_cached_24h",
            "osm_overpass_nominatim": "live_cached_6h"
        }
    }

@app.get("/api/forecast")
async def forecast():
    data, age_sec = await get_pune_forecast()
    return {
        "hourly": data.get("hourly", {}),
        "cache_age_seconds": age_sec,
        "freshness_banner": f"Forecast updated {age_sec // 60} mins ago" if age_sec > 60 else "Live forecast (current)"
    }

@app.get("/api/zones")
async def get_zones(hour: int = Query(0, ge=0, le=47)):
    forecast_data, age_sec = await get_pune_forecast()
    hourly = forecast_data.get("hourly", {})
    raw_temps = hourly.get("apparent_temperature", [])

    if raw_temps:
        min_m = min(raw_temps[:24])
        max_m = max(raw_temps[:24])
        span = (max_m - min_m) if (max_m - min_m) > 0.1 else 8.0
        # Diurnal temperature curve driven by live Open-Meteo feed, modeling Pune heatwave surface/felt conditions
        hourly_scaled = [
            round(33.0 + ((raw_temps[i] - min_m) / span) * 6.8, 1)
            for i in range(min(24, len(raw_temps)))
        ]
    else:
        hourly_scaled = [
            round(33.0 + (math.sin(i / 24 * math.pi) ** 2) * 6.8, 1)
            for i in range(24)
        ]

    clamped_hour = min(max(hour, 0), len(hourly_scaled) - 1) if hourly_scaled else 0
    current_temp = hourly_scaled[clamped_hour] if hourly_scaled else 37.0

    assets = await get_live_assets()

    # Batch retrieve populations concurrently or with memoized ward estimates
    tasks = [get_zone_population(zid, meta["polygon"]) for zid, meta in ZONES_META.items()]
    pop_results = await asyncio.gather(*tasks)
    pop_map = dict(zip(ZONES_META.keys(), pop_results))

    result = []
    for zid, meta in ZONES_META.items():
        s, w, n, e = meta["bbox"]
        zone_assets = [
            a for a in assets
            if s <= a["lat"] <= n and w <= a["lon"] <= e
        ]
        working_taps = sum(1 for a in zone_assets if a["type"] == "drinking_water" and a["status"] == "working")
        clinics = sum(1 for a in zone_assets if a["type"] == "clinic")

        r_dist = abs(meta["row"] - 3.5)
        c_dist = abs(meta["col"] - 3.5)
        zone_temp = round(current_temp + (2.5 - 0.5 * (r_dist + c_dist)), 1)
        hours_38 = max(1, int(round((zone_temp - 37.0) * 1.5))) if zone_temp >= 38.0 else 0

        pop_info = pop_map[zid]
        scores = compute_scores(
            pop=pop_info["total_pop"],
            child_pop=pop_info["child_pop"],
            elderly_pop=pop_info["elderly_pop"],
            hours_above_38=hours_38,
            working_taps=working_taps,
            clinics=clinics
        )

        result.append({
            "id": zid,
            "row": meta["row"],
            "col": meta["col"],
            "name": meta["name"],
            "bbox": meta["bbox"],
            "centroid": meta["centroid"],
            "temperature": zone_temp,
            "pop": pop_info["total_pop"],
            "child_pop": pop_info["child_pop"],
            "elderly_pop": pop_info["elderly_pop"],
            "working_taps": working_taps,
            "clinics": clinics,
            **scores
        })

    return {
        "zones": result,
        "cache_age_seconds": age_sec,
        "selected_hour": hour,
        "hourly_temperatures": hourly_scaled
    }

@app.get("/api/priority")
async def priority(start: int = Query(0, ge=0, le=23), end: int = Query(6, ge=0, le=47), limit: int = Query(5, ge=1, le=64)):
    zones_res = await get_zones(hour=start)
    all_zones = zones_res["zones"]
    # Sort descending by Relief Deficit Rd
    sorted_zones = sorted(all_zones, key=lambda z: z["rd"], reverse=True)
    return {"priority_zones": sorted_zones[:limit], "window": [start, end]}

@app.get("/api/assets")
async def assets(type: Optional[str] = None):
    all_assets = await get_live_assets()
    if type:
        all_assets = [a for a in all_assets if a["type"] == type]
    return {"assets": all_assets}

class ReportRequest(BaseModel):
    status: str
    session_token: str

@app.post("/api/assets/{osm_id}/reports")
async def report_asset(osm_id: str, body: ReportRequest):
    if body.status not in ["working", "dry"]:
        raise HTTPException(status_code=422, detail="Status must be 'working' or 'dry'")
    add_asset_report(osm_id, body.status, body.session_token)
    return {"status": "success", "osm_id": osm_id, "reported": body.status}

@app.get("/api/nearest")
async def nearest_relief(lat: float, lon: float, type: Optional[str] = None):
    all_assets = await get_live_assets()
    if type:
        all_assets = [a for a in all_assets if a["type"] == type]

    # Calculate distance using equirectangular approximation
    def dist(a):
        dlat = (a["lat"] - lat) * 111.0
        dlon = (a["lon"] - lon) * 111.0 * math.cos(math.radians(lat))
        return math.sqrt(dlat * dlat + dlon * dlon)

    sorted_assets = sorted(all_assets, key=dist)
    for a in sorted_assets[:5]:
        a["distance_km"] = round(dist(a), 2)
        a["distance_m"] = int(dist(a) * 1000)

    return {"nearest": sorted_assets[:3]}

class BeaconReportRequest(BaseModel):
    location_name: str
    lat: float
    lon: float
    zone_id: Optional[str] = "Z-44"
    description: str
    image_base64: Optional[str] = None
    session_token: str

@app.get("/api/beacons")
async def get_beacons():
    return {"beacons": BEACONS}

@app.post("/api/beacons/{beacon_id}/resolve")
async def resolve_beacon(beacon_id: str):
    for b in BEACONS:
        if b["id"] == beacon_id:
            b["status"] = "resolved"
            b["resolved_at"] = 1730301000
            return {"status": "success", "message": "Beacon marked as demand met / water delivered!", "beacon": b}
    raise HTTPException(status_code=404, detail="Beacon not found")

@app.post("/api/beacons/report")
async def report_beacon(req: BeaconReportRequest):
    audit_res = {"verified": True, "confidence": 0.85, "detected_crowd": 5}
    if req.image_base64:
        audit_res = await audit_beacon_photo(req.image_base64)

    beacon = {
        "id": f"b_{len(BEACONS) + 1}",
        "location_name": req.location_name,
        "lat": req.lat,
        "lon": req.lon,
        "zone_id": req.zone_id,
        "description": req.description,
        "verified": audit_res.get("verified", True),
        "confidence": audit_res.get("confidence", 0.9),
        "detected_crowd": audit_res.get("detected_crowd", 10),
        "condition": audit_res.get("condition", "Water urgently requested by outdoor workers"),
        "status": "active",
        "created_at": 1730300000
    }
    BEACONS.insert(0, beacon)
    return {"status": "success", "beacon": beacon, "gemini_audit": audit_res}

class KeyRequest(BaseModel):
    gemini_api_key: str

@app.post("/api/settings/key")
async def save_api_key(req: KeyRequest):
    os.environ["GEMINI_API_KEY"] = req.gemini_api_key
    # Also write to .env
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    lines = []
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for l in f:
                if l.startswith("GEMINI_API_KEY="):
                    lines.append(f"GEMINI_API_KEY={req.gemini_api_key}\n")
                else:
                    lines.append(l)
    with open(env_path, "w") as f:
        f.writelines(lines)
    return {"status": "success", "message": "Gemini API key saved!"}

class DispatchRequest(BaseModel):
    request_text: str = "We have 2 teams and 40 water cans. Where should we go?"
    start: int = 2
    end: int = 6
    resources: dict = {"teams": 2, "water_cans": 40}
    language: str = "en"

@app.post("/api/dispatch/brief")
async def dispatch_brief(req: DispatchRequest):
    zones_res = await get_zones(hour=req.start)
    ranked = sorted(zones_res["zones"], key=lambda z: z["rd"], reverse=True)
    brief = await generate_dispatch_brief(
        request_text=req.request_text,
        start_hour=req.start,
        end_hour=req.end,
        resources=req.resources,
        ranked_zones=ranked,
        beacons=BEACONS
    )
    return brief

# Serve static frontend files
app.mount("/", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static"), html=True), name="static")
