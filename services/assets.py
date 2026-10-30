import sqlite3
import os
import time
import httpx
from config import NOMINATIM_URL

DB_PATH = os.path.join(os.path.dirname(__file__), "../heatatlas.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS asset_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            osm_id TEXT NOT NULL,
            status TEXT NOT NULL,
            session_token TEXT NOT NULL,
            created_at REAL NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

_assets_cache = None
_assets_cached_at = 0

async def get_live_assets():
    global _assets_cache, _assets_cached_at
    if _assets_cache and (time.time() - _assets_cached_at < 21600):
        return _assets_cache

    # Ground-level infrastructure for Pune with precise coordinates around key junctions (Swargate, Hadapsar, Deccan, Station)
    curated = [
        # SWARGATE FLYOVER PRECISION CLUSTER (Jedhe Chowk)
        {"osm_id": "sw_w1", "name": "Jedhe Chowk Traffic Police Drinking Post", "type": "drinking_water", "lat": 18.5022, "lon": 73.8575, "status": "working", "category": "Water", "address": "Jedhe Chowk, Under Swargate Flyover"},
        {"osm_id": "sw_w2", "name": "Swargate ST Bus Stand Cool Tap Booth", "type": "drinking_water", "lat": 18.5012, "lon": 73.8582, "status": "working", "category": "Water", "address": "Platform 1, MSRTC Swargate"},
        {"osm_id": "sw_w3", "name": "Sarasbaug PMC Water Cooler", "type": "drinking_water", "lat": 18.5015, "lon": 73.8524, "status": "working", "category": "Water", "address": "Opp. Sarasbaug Gate 2"},
        {"osm_id": "sw_c1", "name": "Swargate Underground Metro AC Concourse", "type": "cool_haven", "lat": 18.5016, "lon": 73.8584, "status": "working", "category": "AC Cool Haven", "address": "Metro Entrance 1, Jedhe Chowk"},
        {"osm_id": "sw_c2", "name": "Mukundnagar AC Public Hall", "type": "cool_haven", "lat": 18.4985, "lon": 73.8610, "status": "working", "category": "AC Cool Haven", "address": "Mukundnagar Lane 3"},
        {"osm_id": "sw_p1", "name": "Sarasbaug Public Shaded Garden Canopy", "type": "park", "lat": 18.5008, "lon": 73.8535, "status": "working", "category": "Shade & Parks", "address": "Sarasbaug Main Lawns"},
        {"osm_id": "sw_p2", "name": "Peshwe Park Shaded Tree Grove", "type": "park", "lat": 18.4995, "lon": 73.8515, "status": "working", "category": "Shade & Parks", "address": "Peshwe Park Entry"},
        {"osm_id": "sw_h1", "name": "Jedhe Medicals 24/7 ORS & Electrolyte Depot", "type": "clinic", "lat": 18.5014, "lon": 73.8572, "status": "working", "category": "Clinics & ORS", "address": "Shop 4, Jedhe Corner"},
        {"osm_id": "sw_h2", "name": "PMC Urban Health Post Swargate", "type": "clinic", "lat": 18.5028, "lon": 73.8590, "status": "working", "category": "Clinics & ORS", "address": "Behind Bus Depot, Swargate"},

        # HADAPSAR CLUSTER
        {"osm_id": "hd_w1", "name": "Hadapsar Mandi Cool Station", "type": "drinking_water", "lat": 18.5089, "lon": 73.9259, "status": "working", "category": "Water", "address": "Hadapsar APMC Yard Gate 1"},
        {"osm_id": "hd_p1", "name": "Magarpatta Shaded Eco Park", "type": "park", "lat": 18.5140, "lon": 73.9295, "status": "working", "category": "Shade & Parks", "address": "DC Road, Magarpatta"},
        {"osm_id": "hd_h1", "name": "Hadapsar Urban Primary Health Center", "type": "clinic", "lat": 18.5032, "lon": 73.9312, "status": "working", "category": "Clinics & ORS", "address": "Gadital, Hadapsar"},

        # PUNE CENTRAL & STATION CLUSTER
        {"osm_id": "pc_w1", "name": "Pune Station Public Cool Tap", "type": "drinking_water", "lat": 18.5284, "lon": 73.8739, "status": "working", "category": "Water", "address": "Main Entrance, Pune Railway Station"},
        {"osm_id": "pc_c1", "name": "Kasba Peth Metro AC Concourse", "type": "cool_haven", "lat": 18.5213, "lon": 73.8595, "status": "working", "category": "AC Cool Haven", "address": "Kasba Peth Metro Station"},
        {"osm_id": "pc_c2", "name": "Civil Court Interchange AC Concourse", "type": "cool_haven", "lat": 18.5288, "lon": 73.8572, "status": "working", "category": "AC Cool Haven", "address": "Civil Court Underground"},
        {"osm_id": "pc_p1", "name": "Empress Botanical Garden Canopy", "type": "park", "lat": 18.5135, "lon": 73.8962, "status": "working", "category": "Shade & Parks", "address": "Near Race Course, Camp"},
        {"osm_id": "pc_h1", "name": "Sassoon General Hospital (Heat Emergency ICU)", "type": "clinic", "lat": 18.5262, "lon": 73.8735, "status": "working", "category": "Clinics & ORS", "address": "Near Pune Station, Sassoon Rd"},
        {"osm_id": "pc_h2", "name": "KEM Hospital Urban Clinic", "type": "clinic", "lat": 18.5246, "lon": 73.8690, "status": "working", "category": "Clinics & ORS", "address": "Rasta Peth, Pune"}
    ]

    assets = list(curated)

    # Augment with live query
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(
                NOMINATIM_URL,
                params={"q": "clinic in pune", "format": "json", "limit": 6},
                headers={"User-Agent": "HeatAtlasApp/1.0 (contact@heatatlas.app)"}
            )
            if resp.status_code == 200:
                for item in resp.json():
                    assets.append({
                        "osm_id": str(item.get("osm_id", "")),
                        "name": item.get("display_name", "").split(",")[0],
                        "type": "clinic",
                        "category": "Clinics & ORS",
                        "lat": float(item["lat"]),
                        "lon": float(item["lon"]),
                        "status": "working",
                        "address": item.get("display_name", "").split(",")[1:3]
                    })
    except Exception as e:
        print("Live OSM lookup:", e)

    # Overlay crowd verification
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cutoff = time.time() - 86400
    for a in assets:
        cur.execute("""
            SELECT status, COUNT(DISTINCT session_token)
            FROM asset_reports
            WHERE osm_id = ? AND created_at > ?
            GROUP BY status
        """, (a["osm_id"], cutoff))
        counts = dict(cur.fetchall())
        working_count = counts.get("working", 0)
        dry_count = counts.get("dry", 0)
        if dry_count >= 2 and dry_count > working_count:
            a["status"] = "dry"
        a["verification_detail"] = f"{working_count} verified, {dry_count} reported issue"
    conn.close()

    _assets_cache = assets
    _assets_cached_at = time.time()
    return assets

def add_asset_report(osm_id: str, status: str, session_token: str):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO asset_reports (osm_id, status, session_token, created_at)
        VALUES (?, ?, ?, ?)
    """, (osm_id, status, session_token, time.time()))
    conn.commit()
    conn.close()
    global _assets_cached_at
    _assets_cached_at = 0
