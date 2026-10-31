import sqlite3
import os
import time
import shutil
import httpx
from config import NOMINATIM_URL
from cities import get_city, CITIES

_REPO_DB = os.path.join(os.path.dirname(__file__), "../heatatlas.db")
if os.getenv("VERCEL") or not os.access(os.path.dirname(_REPO_DB), os.W_OK):
    DB_PATH = "/tmp/heatatlas.db"
    if not os.path.exists(DB_PATH) and os.path.exists(_REPO_DB):
        try:
            shutil.copyfile(_REPO_DB, DB_PATH)
        except Exception:
            pass
else:
    DB_PATH = _REPO_DB

def init_db():
    try:
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
    except Exception:
        pass

init_db()

_assets_cache = {}

async def get_live_assets(city_id: str = "pune"):
    city = get_city(city_id)
    cid = city["id"]

    cached = _assets_cache.get(cid)
    if cached and (time.time() - cached.get("time", 0) < 21600):
        return [dict(a) for a in cached["assets"]]

    curated = [dict(a) for a in city.get("assets", [])]

    # Query crowd consensus from SQLite (last 24h)
    cutoff = time.time() - 86400
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        SELECT osm_id, status, COUNT(DISTINCT session_token) as votes
        FROM asset_reports
        WHERE created_at > ?
        GROUP BY osm_id, status
    """, (cutoff,))
    rows = cur.fetchall()
    conn.close()

    dry_counts = {}
    working_counts = {}
    for osm_id, status, votes in rows:
        if status == "dry":
            dry_counts[osm_id] = votes
        elif status == "working":
            working_counts[osm_id] = votes

    for a in curated:
        oid = str(a["osm_id"])
        d_votes = dry_counts.get(oid, 0)
        w_votes = working_counts.get(oid, 0)
        a["dry_reports_24h"] = d_votes
        a["working_reports_24h"] = w_votes
        # Spec rule: 2 or more dry reports from distinct session tokens in last 24h not outnumbered by working reports
        if d_votes >= 2 and d_votes >= w_votes:
            a["status"] = "dry"
        elif w_votes > d_votes and w_votes > 0:
            a["status"] = "working"

    _assets_cache[cid] = {"assets": curated, "time": time.time()}
    return [dict(a) for a in curated]

def add_asset_report(osm_id: str, status: str, session_token: str) -> bool:
    """
    Records a crowd verification report.
    Returns False if a duplicate report from the same session_token for the same osm_id
    was submitted within the last 10 minutes (600 seconds).
    """
    now = time.time()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        SELECT COUNT(*) FROM asset_reports
        WHERE osm_id = ? AND session_token = ? AND created_at > ?
    """, (str(osm_id), session_token, now - 600))
    recent_count = cur.fetchone()[0]
    if recent_count > 0:
        conn.close()
        return False

    cur.execute("""
        INSERT INTO asset_reports (osm_id, status, session_token, created_at)
        VALUES (?, ?, ?, ?)
    """, (str(osm_id), status, session_token, now))
    conn.commit()
    conn.close()
    _assets_cache.clear()
    return True

def get_asset_reports(osm_id: str) -> dict:
    """Returns crowd reports for a specific water tap or clinic in the last 24h."""
    cutoff = time.time() - 86400
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        SELECT status, session_token, created_at
        FROM asset_reports
        WHERE osm_id = ? AND created_at > ?
        ORDER BY created_at DESC
    """, (str(osm_id), cutoff))
    rows = cur.fetchall()
    conn.close()

    reports = [
        {"osm_id": str(osm_id), "status": r[0], "session_token": r[1][:8] + "...", "created_at": r[2]}
        for r in rows
    ]
    dry_tokens = {r[1] for r in rows if r[0] == "dry"}
    working_tokens = {r[1] for r in rows if r[0] == "working"}
    effective_status = "dry" if (len(dry_tokens) >= 2 and len(dry_tokens) >= len(working_tokens)) else "working"

    return {
        "osm_id": str(osm_id),
        "effective_status": effective_status,
        "dry_votes": len(dry_tokens),
        "working_votes": len(working_tokens),
        "reports": reports
    }
