import sqlite3
import os
import time
import httpx
from config import NOMINATIM_URL
from cities import get_city, CITIES

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

_assets_cache = {}

async def get_live_assets(city_id: str = "pune"):
    city = get_city(city_id)
    cid = city["id"]

    cached = _assets_cache.get(cid)
    if cached and (time.time() - cached.get("time", 0) < 21600):
        return cached["assets"]

    curated = list(city.get("assets", []))

    # Query crowd consensus from SQLite
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        SELECT osm_id, COUNT(DISTINCT session_token) as dry_votes
        FROM asset_reports
        WHERE status = 'dry' AND created_at > ?
        GROUP BY osm_id
    """, (time.time() - 86400,))
    dry_counts = dict(cur.fetchall())
    conn.close()

    for a in curated:
        if dry_counts.get(a["osm_id"], 0) >= 2:
            a["status"] = "dry"

    _assets_cache[cid] = {"assets": curated, "time": time.time()}
    return curated

def add_asset_report(osm_id: str, status: str, session_token: str):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO asset_reports (osm_id, status, session_token, created_at)
        VALUES (?, ?, ?, ?)
    """, (osm_id, status, session_token, time.time()))
    conn.commit()
    conn.close()
    _assets_cache.clear()
