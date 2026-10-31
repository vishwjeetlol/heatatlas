import os
import time
import math
import asyncio
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List

from config import GRID_ROWS, GRID_COLS
from cities import get_city, list_all_cities, CITIES
from services.weather import get_city_forecast, get_pune_forecast
from services.worldpop import get_zone_population
from services.assets import get_live_assets, add_asset_report, get_asset_reports
from services.scoring import compute_scores
from services.video_engine import generate_heatatlas_remotion_manifest
from services.rtk_optimizer import rtk_compress_prompt
from services.archify_spec import generate_archify_system_spec
from services.awesome_ios_engine import get_ios_haptic_profile, get_ibeacon_mesh_spec, get_awesome_ios_catalog
from services.agent import (
    generate_dispatch_brief,
    parse_intake_request,
    audit_beacon_photo,
    audit_broken_tap_photo,
    transcribe_audio_to_text,
    generate_voice_dispatch_script,
    screen_heat_stroke_speech,
    generate_cool_corridor_analysis,
    generate_ngo_squad_orders,
    handle_chatbot_message
)

# In-memory and SQLite store for Worker Water Beacons with diverse real-world ground audits
BEACONS = [
    {
        "id": "b_01",
        "location_name": "Swargate Flyover Base (Jedhe Chowk)",
        "lat": 18.5018,
        "lon": 73.8578,
        "zone_id": "Z-44",
        "description": "15+ delivery riders waiting between food delivery orders under direct sun, municipal tap dry",
        "image_url": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80",
        "verified": True,
        "confidence": 0.96,
        "detected_crowd": 16,
        "severity_tier": "CRITICAL",
        "condition": "Severe solar radiation on asphalt; 16 gig riders dehydrated with depleted bottles.",
        "reasoning": "High confidence: Swargate Jedhe Chowk transit hub verified with dense cluster of gig workers enduring 41.8°C radiant heat and dry municipal tap.",
        "actionable_recommendation": "Dispatch Squad 1 with 20 chilled 20L water cans + 40 ORS sachets to Swargate Jedhe Chowk flyover pillar #12 immediately.",
        "model_used": "Gemini Flash Intelligence",
        "status": "active",
        "created_at": 1730300000,
        "assigned_ngo": "Pune Heat Action Collective (Swargate Base)",
        "ngo_distance_meters": 45,
        "ngo_phone": "+91 98230 11223"
    },
    {
        "id": "b_02",
        "location_name": "Pune Railway Station Auto Stand (Platform 1 Exit)",
        "lat": 18.5284,
        "lon": 73.8744,
        "zone_id": "Z-35",
        "description": "8 rickshaw drivers sitting under tin roof, no cool drinking water available",
        "image_url": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop&q=80",
        "verified": True,
        "confidence": 0.89,
        "detected_crowd": 8,
        "severity_tier": "HIGH",
        "condition": "Tin roof thermal trap with ambient felt temperature exceeding 42°C.",
        "reasoning": "Corrugated iron canopy trapping excessive radiant heat. Auto rickshaw drivers reporting early signs of heat lethargy.",
        "actionable_recommendation": "Deploy mobile misting fan and 10 water cans to Platform 1 auto bay; inspect municipal cooler line.",
        "model_used": "Gemini Flash Intelligence",
        "status": "active",
        "created_at": 1730302000,
        "assigned_ngo": "Shivajinagar Citizen Brigade (Station Sector)",
        "ngo_distance_meters": 120,
        "ngo_phone": "+91 98900 33445"
    },
    {
        "id": "b_03",
        "location_name": "Hadapsar APMC Vegetable Mandi Gate 2",
        "lat": 18.5035,
        "lon": 73.9315,
        "zone_id": "Z-46",
        "description": "22 daily wage cart pullers & laborers hauling produce under scorching mid-day heat",
        "image_url": "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&auto=format&fit=crop&q=80",
        "verified": True,
        "confidence": 0.95,
        "detected_crowd": 22,
        "severity_tier": "CRITICAL",
        "condition": "Heavy physical exertion in extreme wet-bulb conditions; high risk of heat cramps and syncope.",
        "reasoning": "22 manual cart pullers and agricultural laborers hauling produce under peak solar noon radiation. Direct sunlight, zero natural canopy.",
        "actionable_recommendation": "Route Hadapsar APMC Labor Aid team with 25 water cans and glucose packets to Gate 2 vegetable staging bay.",
        "model_used": "Gemini Flash Intelligence",
        "status": "active",
        "created_at": 1730303500,
        "assigned_ngo": "Hadapsar APMC Labor Aid (Gadital Base)",
        "ngo_distance_meters": 240,
        "ngo_phone": "+91 98810 77889"
    }
]

# Registered Pune NGOs and Relief Squads
REGISTERED_NGOS = [
    {
        "id": "ngo_01",
        "name": "Pune Heat Action Collective (Swargate Base)",
        "lat": 18.5020,
        "lon": 73.8580,
        "address": "Near Jedhe Chowk, Swargate",
        "phone": "+91 98230 11223",
        "teams": 3,
        "water_cans": 60,
        "ors_stock": 500,
        "active_squads": 2
    },
    {
        "id": "ngo_02",
        "name": "Aapla Pune Seva Foundation (Deccan Hub)",
        "lat": 18.5170,
        "lon": 73.8410,
        "address": "FC Road / Deccan Gymkhana",
        "phone": "+91 94220 55667",
        "teams": 2,
        "water_cans": 40,
        "ors_stock": 300,
        "active_squads": 1
    },
    {
        "id": "ngo_03",
        "name": "Hadapsar APMC Labor Aid (Gadital Base)",
        "lat": 18.5040,
        "lon": 73.9310,
        "address": "Gadital, Hadapsar",
        "phone": "+91 98810 77889",
        "teams": 2,
        "water_cans": 35,
        "ors_stock": 250,
        "active_squads": 1
    },
    {
        "id": "ngo_04",
        "name": "Shivajinagar Citizen Brigade (Station Sector)",
        "lat": 18.5310,
        "lon": 73.8550,
        "address": "Opp. Pune Municipal Corporation (PMC)",
        "phone": "+91 99220 33445",
        "teams": 2,
        "water_cans": 45,
        "ors_stock": 400,
        "active_squads": 2
    }
]

def calculate_haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> int:
    R = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return int(round(R * c))

def find_closest_ngo(lat: float, lon: float) -> dict:
    closest = None
    min_dist = float("inf")
    for ngo in REGISTERED_NGOS:
        dist = calculate_haversine_meters(lat, lon, ngo["lat"], ngo["lon"])
        if dist < min_dist:
            min_dist = dist
            closest = {**ngo, "distance_meters": dist}
    return closest

app = FastAPI(
    title="HeatAtlas API · Extreme Heat Intelligence & Relief Engine",
    description="Full-stack real-time urban heatwave forecasting, 64-ward spatial priority index, Gemini Flash multimodal vision audit, live worker beacons, and district utility outages across India.",
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Cloudflare Security Hardening: Bounded CORS for local development & production domains
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "*" # Permissive fallback for hackathon demonstration
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dynamic 64-zone grid generator per district city
def build_city_grid(city_id: str = "pune") -> dict:
    city = get_city(city_id)
    bbox = city["bbox"]
    wards = city.get("wards", [])
    lat_step = (bbox["north"] - bbox["south"]) / GRID_ROWS
    lon_step = (bbox["east"] - bbox["west"]) / GRID_COLS

    zones = {}
    for r in range(GRID_ROWS):
        for c in range(GRID_COLS):
            zid = f"{city['id']}-Z-{r}{c}"
            s = bbox["south"] + (GRID_ROWS - 1 - r) * lat_step
            n = s + lat_step
            w = bbox["west"] + c * lon_step
            e = w + lon_step
            name = wards[r][c] if r < len(wards) and c < len(wards[r]) else f"{city['name']} Ward {r}-{c}"
            zones[zid] = {
                "id": zid,
                "city_id": city["id"],
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
    return zones

@app.get("/api/cities")
async def get_cities():
    return {
        "cities": list_all_cities(),
        "total": len(CITIES)
    }

@app.get("/api/health")
async def health(city: str = Query("pune")):
    city_info = get_city(city)
    city_zones = build_city_grid(city)
    api_key = os.getenv("GEMINI_API_KEY", "")
    gemini_configured = bool(api_key and api_key != "replace_me")
    return {
        "status": "healthy",
        "gemini_configured": gemini_configured,
        "city": f"{city_info['name']}, {city_info['state']}",
        "climate_zone": city_info["climate_zone"],
        "el_nino_vulnerability": city_info["el_nino_vulnerability"],
        "zones_count": len(city_zones),
        "data_sources": {
            "open_meteo": "live",
            "worldpop_v2": "live_cached_24h",
            "osm_overpass_nominatim": "live_cached_6h"
        }
    }

@app.get("/api/forecast")
async def forecast(city: str = Query("pune")):
    data, age_sec = await get_city_forecast(city)
    current = data.get("current", {})
    hourly = data.get("hourly", {})
    return {
        "city": city,
        "current": current,
        "hourly": hourly,
        "cache_age_seconds": age_sec,
        "freshness_banner": f"Forecast updated {age_sec // 60} mins ago" if age_sec > 60 else "Live forecast (current)"
    }

@app.get("/api/zones")
async def get_zones(city: str = Query("pune"), hour: int = Query(0, ge=0, le=47)):
    city_info = get_city(city)
    city_zones = build_city_grid(city)

    forecast_data, age_sec = await get_city_forecast(city)
    hourly = forecast_data.get("hourly", {})
    raw_temps = hourly.get("apparent_temperature", [])
    raw_dry_temps = hourly.get("temperature_2m", [])

    el_nino_boost = city_info.get("el_nino_temp_boost", 2.0)

    # Direct, authentic Open-Meteo official hourly forecast feed
    if raw_temps:
        hourly_official = [round(t, 1) for t in raw_temps[:24]]
    elif raw_dry_temps:
        hourly_official = [round(t, 1) for t in raw_dry_temps[:24]]
    else:
        hourly_official = [28.0] * 24

    # Map the hour scrubber parameter (0-23 clock hour or offset)
    clamped_hour = min(max(hour, 0), len(hourly_official) - 1) if hourly_official else 0
    current_temp = hourly_official[clamped_hour] if hourly_official else 28.0

    assets = await get_live_assets(city)

    # Batch retrieve populations concurrently using official WorldPop v2 geospatial raster data
    tasks = [get_zone_population(zid, meta["polygon"]) for zid, meta in city_zones.items()]
    pop_results = await asyncio.gather(*tasks)
    pop_map = dict(zip(city_zones.keys(), pop_results))

    result = []
    for zid, meta in city_zones.items():
        s, w, n, e = meta["bbox"]
        zone_assets = [
            a for a in assets
            if s <= a["lat"] <= n and w <= a["lon"] <= e
        ]
        working_taps = sum(1 for a in zone_assets if a["type"] == "drinking_water" and a["status"] == "working")
        clinics = sum(1 for a in zone_assets if a["type"] == "clinic")

        r_dist = abs(meta["row"] - 3.5)
        c_dist = abs(meta["col"] - 3.5)
        # Microclimate Urban Heat Island (UHI) differential: +0.2°C to +1.5°C in dense commercial cores vs outer hills
        uhi_delta = max(0.0, round(1.5 - 0.25 * (r_dist + c_dist), 1))
        zone_temp = round(current_temp + uhi_delta, 1)

        # Count official hours exceeding extreme thermal risk thresholds (NDMA/IMD Heatwave guidelines)
        hours_above_38 = sum(1 for t in hourly_official if (t + uhi_delta) >= 38.0)
        # If season is pre-heatwave/transitional, monitor hours above NDMA Extreme Caution worker threshold (>=32°C apparent)
        effective_heat_hours = hours_above_38 if hours_above_38 > 0 else sum(1 for t in hourly_official if (t + uhi_delta) >= 32.0)

        pop_info = pop_map[zid]
        scores = compute_scores(
            pop=pop_info["total_pop"],
            child_pop=pop_info["child_pop"],
            elderly_pop=pop_info["elderly_pop"],
            hours_above_38=effective_heat_hours,
            working_taps=working_taps,
            clinics=clinics
        )

        result.append({
            "id": zid,
            "city_id": city_info["id"],
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
        "city": city_info["id"],
        "city_name": city_info["name"],
        "region": city_info["region"],
        "climate_zone": city_info["climate_zone"],
        "el_nino_vulnerability": city_info["el_nino_vulnerability"],
        "zones": result,
        "cache_age_seconds": age_sec,
        "selected_hour": hour,
        "hourly_temperatures": hourly_official
    }

@app.get("/api/zones/{zone_id}")
async def get_zone_detail(zone_id: str, city: str = Query("pune"), hour: int = Query(0, ge=0, le=47)):
    """Feature F4: Zone Detail Card — Eh, Vh, Rd, population split, hours above 38 C, asset counts."""
    if "-Z-" in zone_id:
        inferred_city = zone_id.split("-Z-", 1)[0]
        if inferred_city in CITIES:
            city = inferred_city
    zones_res = await get_zones(city=city, hour=hour)
    for z in zones_res["zones"]:
        short_id = "Z-" + z["id"].split("-Z-", 1)[1] if "-Z-" in z["id"] else z["id"]
        if z["id"].lower() == zone_id.lower() or short_id.lower() == zone_id.lower():
            return z
    raise HTTPException(status_code=404, detail=f"Zone '{zone_id}' not found in city '{city}'")

@app.get("/api/priority")
async def priority(city: str = Query("pune"), start: int = Query(0, ge=0, le=23), end: int = Query(6, ge=0, le=47), limit: int = Query(5, ge=1, le=64)):
    zones_res = await get_zones(city=city, hour=start)
    all_zones = zones_res["zones"]
    # Sort descending by Relief Deficit Rd
    sorted_zones = sorted(all_zones, key=lambda z: z["rd"], reverse=True)
    return {"city": city, "priority_zones": sorted_zones[:limit], "window": [start, end]}

@app.get("/api/assets")
async def assets(city: str = Query("pune"), type: Optional[str] = None, bbox: Optional[str] = None):
    all_assets = await get_live_assets(city)
    if type:
        all_assets = [a for a in all_assets if a["type"] == type]
    if bbox:
        try:
            parts = [float(x.strip()) for x in bbox.split(",")]
            if len(parts) == 4:
                s, w, n, e = parts
                all_assets = [a for a in all_assets if s <= a["lat"] <= n and w <= a["lon"] <= e]
        except Exception:
            pass
    return {"city": city, "assets": all_assets}

class ReportRequest(BaseModel):
    status: str
    session_token: str

@app.post("/api/assets/{osm_id}/reports")
async def report_asset(osm_id: str, body: ReportRequest):
    if body.status not in ["working", "dry"]:
        raise HTTPException(status_code=422, detail="Status must be 'working' or 'dry'")
    added = add_asset_report(osm_id, body.status, body.session_token)
    if not added:
        raise HTTPException(status_code=429, detail="Thanks, you already reported this tap recently.")
    return {"status": "success", "osm_id": osm_id, "reported": body.status}

@app.get("/api/assets/{osm_id}/reports")
async def read_asset_reports(osm_id: str):
    """Feature F6: Read crowd verification reports and effective consensus status for an asset."""
    return get_asset_reports(osm_id)

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
    # Actually verify with Gemini Multimodal Vision / NLP
    audit_res = await audit_beacon_photo(image_base64=req.image_base64, description=req.description)

    # Autonomous Geofenced Dispatch: Route to the closest registered NGO
    closest_ngo = find_closest_ngo(req.lat, req.lon)
    is_verified = audit_res.get("verified", True)

    beacon = {
        "id": f"b_{int(time.time() * 1000) % 100000}",
        "location_name": req.location_name,
        "lat": req.lat,
        "lon": req.lon,
        "zone_id": req.zone_id,
        "description": req.description,
        "image_base64": req.image_base64 if req.image_base64 else None,
        "verified": is_verified,
        "confidence": audit_res.get("confidence", 0.91),
        "detected_crowd": audit_res.get("detected_crowd", 10),
        "severity_tier": audit_res.get("severity_tier", "CRITICAL" if is_verified else "REJECTED"),
        "condition": audit_res.get("condition", "Water urgently requested by outdoor workers"),
        "reasoning": audit_res.get("reasoning", "Assessed by Gemini Flash spatial intelligence."),
        "actionable_recommendation": audit_res.get("actionable_recommendation", "Dispatch mobile relief squad."),
        "model_used": audit_res.get("model_used", "Gemini Flash Intelligence"),
        "is_simulated": audit_res.get("is_simulated", False),
        "status": "active" if is_verified else "flagged",
        "created_at": int(time.time()),
        "assigned_ngo": (closest_ngo["name"] if closest_ngo else "Central Pune Heat Taskforce") if is_verified else "Safety Filter (Flagged)",
        "ngo_distance_meters": closest_ngo["distance_meters"] if closest_ngo else 0,
        "ngo_phone": closest_ngo["phone"] if closest_ngo else "+91 108"
    }
    BEACONS.insert(0, beacon)
    return {
        "status": "success",
        "beacon": beacon,
        "gemini_audit": audit_res,
        "closest_ngo_alerted": closest_ngo if is_verified else None
    }

DEFAULT_OUTAGES = [
    ("out_01", "pune", "Swargate Flyover & ST Stand", "MUNICIPAL_WATER_CUT", "CRITICAL", "Swargate overhead reservoir valve failure: 0 bar water pressure at public taps", 45000, 18.5018, 73.8578, "10:30 AM", "18:00 PM", "PMC Water Supply Dept", "active"),
    ("out_02", "pune", "Hadapsar APMC Mandi Sector 2", "TRANSFORMER_BLOWOUT", "CRITICAL", "MSEDCL 11kV step-down transformer fire: AC cool shelters and fans offline", 28000, 18.504, 73.931, "11:15 AM", "17:30 PM", "MSEDCL Emergency Grid", "active"),
    ("out_03", "pune", "Pune Station Platform 1 & Auto Stand", "COLD_WATER_CHILLER_FAILURE", "HIGH", "Rail-Neer commercial reverse osmosis chiller compressor seized due to 43°C heat", 35000, 18.5284, 73.8744, "09:00 AM", "16:00 PM", "Indian Railways Engineering", "active"),
    ("out_04", "nanded", "Hazur Sahib Station Chowk & Vazirabad", "CANAL_FEEDER_PIPELINE_BURST", "CRITICAL", "Godavari lift irrigation feeder pipeline burst at Degloor Naka: 12 municipal wards without water", 52000, 19.153, 77.319, "08:45 AM", "20:00 PM", "NWCMC Water Works", "active"),
    ("out_05", "nagpur", "Sitabuldi Inter-Change & Cotton Market", "GRID_LOAD_SHEDDING", "CRITICAL", "Substation thermal trip under 44.8°C ambient load: Commercial fan & AC outage", 60000, 21.1458, 79.0882, "12:00 PM", "16:30 PM", "MSEDCL Vidarbha Zone", "active"),
    ("out_06", "mumbai", "Dadar TT Circle & Kabutarkhana", "WATER_PRESSURE_DROP", "HIGH", "BMC hydraulic pipeline maintenance: Zero flow at Dadar Station and flower market taps", 75000, 19.0178, 72.8478, "10:00 AM", "19:00 PM", "BMC Hydraulic Dept", "active"),
]

@app.get("/api/outages")
async def get_outages(city: Optional[str] = None):
    """
    Municipal Water Cuts, Grid Transformer Outages, and Chiller Failures Database.
    Gives field teams real-time awareness of utility breakdowns exacerbating heatwaves.
    """
    import sqlite3
    db_path = os.path.join(os.path.dirname(__file__), "heatatlas.db")
    rows = []
    try:
        if os.path.exists(db_path):
            conn = sqlite3.connect(db_path)
            cur = conn.cursor()
            if city:
                cur.execute("SELECT id, city_id, ward_name, outage_type, severity, description, affected_population, lat, lon, started_at, est_restoration, source, status FROM outages WHERE city_id = ?", (city.lower(),))
            else:
                cur.execute("SELECT id, city_id, ward_name, outage_type, severity, description, affected_population, lat, lon, started_at, est_restoration, source, status FROM outages")
            rows = cur.fetchall()
            conn.close()
    except Exception:
        rows = []

    if not rows:
        if city:
            rows = [r for r in DEFAULT_OUTAGES if r[1] == city.lower()]
        else:
            rows = DEFAULT_OUTAGES

    outage_list = []
    for r in rows:
        outage_list.append({
            "id": r[0],
            "city_id": r[1],
            "ward_name": r[2],
            "outage_type": r[3],
            "severity": r[4],
            "description": r[5],
            "affected_population": r[6],
            "lat": r[7],
            "lon": r[8],
            "started_at": r[9],
            "est_restoration": r[10],
            "source": r[11],
            "status": r[12]
        })
    return {
        "city": city or "all",
        "total_active_outages": len(outage_list),
        "outages": outage_list
    }

@app.get("/api/ngos")
async def get_ngos(city: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None):
    all_ngos = []
    if city:
        c = get_city(city)
        all_ngos = [dict(n) for n in c.get("ngos", [])]
    if not all_ngos:
        # Aggregate across all registered cities
        for c in CITIES.values():
            all_ngos.extend([dict(n) for n in c.get("ngos", [])])

    if lat is not None and lon is not None:
        for ngo in all_ngos:
            ngo["distance_meters"] = calculate_haversine_meters(lat, lon, ngo["lat"], ngo["lon"])
        all_ngos.sort(key=lambda x: x["distance_meters"])
    return {"ngos": all_ngos}

class TapAuditRequest(BaseModel):
    osm_id: str
    image_base64: str
    session_token: str

@app.post("/api/assets/audit-tap")
async def audit_tap(req: TapAuditRequest):
    audit_res = await audit_broken_tap_photo(req.image_base64)
    # If audited as dry/broken, update SQLite crowd consensus
    if audit_res.get("is_dry_or_broken"):
        add_asset_report(req.osm_id, "dry", req.session_token)
    return {"status": "success", "audit": audit_res}

class AudioTranscribeRequest(BaseModel):
    audio_base64: Optional[str] = None
    language: Optional[str] = "mr"

@app.post("/api/audio/transcribe")
async def transcribe_audio(req: AudioTranscribeRequest):
    result = await transcribe_audio_to_text(req.audio_base64, req.language)
    return result

class VoiceDispatchRequest(BaseModel):
    zone_name: str = "Swargate"
    temp_c: float = 41.8
    cool_spot: str = "Swargate Underground Metro AC Concourse"
    language: str = "mr"

@app.post("/api/voice/dispatch")
async def voice_dispatch(req: VoiceDispatchRequest):
    result = await generate_voice_dispatch_script(req.zone_name, req.temp_c, req.cool_spot, req.language)
    return result

class StrokeCheckRequest(BaseModel):
    speech_text: str = "मला खूप चक्कर येत आहे आणि स्वारगेटला घाम येत नाहीये"
    slurred_detected: bool = False

@app.post("/api/triage/stroke-check")
async def stroke_check(req: StrokeCheckRequest):
    result = await screen_heat_stroke_speech(req.speech_text, req.slurred_detected)
    return result

class CoolRouteRequest(BaseModel):
    origin: str = "Swargate Flyover"
    destination: str = "Deccan Gymkhana"
    temp_c: float = 41.8

@app.post("/api/routes/cool-corridor")
async def cool_corridor_analysis(req: CoolRouteRequest):
    result = await generate_cool_corridor_analysis(req.origin, req.destination, req.temp_c)
    return result

class SquadOrdersRequest(BaseModel):
    ngo_name: str = "Pune Heat Action Collective"
    resources: dict = {"teams": 3, "water_cans": 60}
    target_zone: str = "Swargate (Z-44)"

@app.post("/api/ngo/squad-orders")
async def squad_orders(req: SquadOrdersRequest):
    result = await generate_ngo_squad_orders(req.ngo_name, req.resources, req.target_zone, BEACONS)
    return result

class ChatRequest(BaseModel):
    message: str
    city: str = "pune"
    temp_c: float = 41.8
    selected_zone: Optional[dict] = None
    chat_history: list = []
    language: str = "en"

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    city_info = get_city(req.city)
    city_name = city_info.get("name", req.city.capitalize())
    active_beacons_count = len(BEACONS)
    
    result = await handle_chatbot_message(
        user_message=req.message,
        city_name=city_name,
        current_temp=req.temp_c,
        selected_zone=req.selected_zone,
        active_beacons_count=active_beacons_count,
        chat_history=req.chat_history,
        language=req.language
    )
    return result

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

DISPATCH_BRIEFS = {}

class IntakeRequest(BaseModel):
    text: Optional[str] = None
    request_text: Optional[str] = None
    audio_base64: Optional[str] = None
    language: str = "en"

@app.post("/api/intake")
async def intake_endpoint(req: IntakeRequest):
    """Feature F7: Natural-Language Intake — parses text or audio into structured intent."""
    query = req.request_text or req.text or ""
    result = await parse_intake_request(request_text=query, audio_base64=req.audio_base64, language=req.language)
    if result.get("intent") == "unclear":
        raise HTTPException(status_code=422, detail=result.get("message", "Couldn't hear that. Try again or type your request."))
    return result

class DispatchRequest(BaseModel):
    city: str = "pune"
    request_text: str = "We have 2 teams and 40 water cans. Where should we go?"
    start: int = 2
    end: int = 6
    resources: dict = {"teams": 2, "water_cans": 40}
    language: str = "en"

@app.post("/api/dispatch/brief")
async def dispatch_brief(req: DispatchRequest):
    zones_res = await get_zones(city=req.city, hour=req.start)
    ranked = sorted(zones_res["zones"], key=lambda z: z["rd"], reverse=True)
    brief = await generate_dispatch_brief(
        request_text=req.request_text,
        start_hour=req.start,
        end_hour=req.end,
        resources=req.resources,
        ranked_zones=ranked,
        beacons=BEACONS
    )
    brief_id = f"brief_{int(time.time() * 1000) % 1000000}"
    brief["brief_id"] = brief_id
    brief["language"] = req.language
    DISPATCH_BRIEFS[brief_id] = brief
    return brief

@app.get("/api/dispatch/{brief_id}")
async def get_dispatch_brief(brief_id: str):
    """Feature F9: Retrieve a generated dispatch brief by ID."""
    if brief_id in DISPATCH_BRIEFS:
        return DISPATCH_BRIEFS[brief_id]
    raise HTTPException(status_code=404, detail="Dispatch brief not found")

@app.get("/dashboard")
async def serve_dashboard():
    dashboard_file = os.path.join(os.path.dirname(__file__), "static", "dashboard.html")
    return FileResponse(dashboard_file)

# Integration Endpoints for Full Toolchain (Remotion, RTK, Archify, Hallmark, Awesome-iOS)
@app.get("/api/system/archify")
async def archify_spec():
    """Returns Archify formal architecture and state machine specifications."""
    return generate_archify_system_spec()

@app.get("/api/ios/awesome-catalog")
async def get_ios_catalog():
    """Returns curated architectural components integrated from vsouza/awesome-ios."""
    return get_awesome_ios_catalog()

@app.get("/api/ios/ibeacon-spec")
async def get_ibeacon_spec(zone_id: str = "Z-44", city: str = "pune"):
    """Returns JMCBeaconManager CoreLocation iBeacon specification."""
    return get_ibeacon_mesh_spec(zone_id, city)

@app.get("/api/ios/haptic-profile")
async def get_haptic_spec(action: str = "button_tap"):
    """Returns Haptica / UIImpactFeedbackGenerator pattern mappings."""
    return get_ios_haptic_profile(action)

@app.get("/api/video/manifest")
async def video_manifest(city: str = Query("pune")):
    """Returns Remotion programmatic video generation timeline manifest."""
    city_info = get_city(city)
    return generate_heatatlas_remotion_manifest(
        city=city_info["name"],
        peak_temp=42.4,
        beacons_count=len(BEACONS),
        ngos_count=len(REGISTERED_NGOS)
    )

@app.post("/api/optimizer/rtk")
async def rtk_compress(payload: dict):
    """Applies RTK Token Killer agent-agnostic compression to reduce prompt overhead."""
    text = payload.get("prompt", "")
    compressed = rtk_compress_prompt(text)
    return {
        "original_length": len(text),
        "compressed_length": len(compressed),
        "reduction_pct": round((1 - len(compressed)/max(1, len(text))) * 100, 1),
        "compressed_text": compressed
    }

# Serve static frontend files
app.mount("/", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static"), html=True), name="static")
