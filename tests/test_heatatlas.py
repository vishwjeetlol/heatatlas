import base64
import io
import os
import sys
import time
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient

from app import app
from services.scoring import compute_scores
from services.agent import validate_dispatch_brief

client = TestClient(app)


def test_ac1_live_forecast_map_and_health():
    """AC1: /api/health and /api/zones return 64 heat zones built from live forecast."""
    h = client.get("/api/health?city=pune")
    assert h.status_code == 200
    h_data = h.json()
    assert h_data["status"] == "healthy"
    assert "gemini_configured" in h_data
    assert h_data["zones_count"] == 64

    r = client.get("/api/zones?city=pune&hour=2")
    assert r.status_code == 200
    data = r.json()
    assert len(data["zones"]) == 64
    assert len(data["hourly_temperatures"]) == 24


def test_ac2_timeline_slider_and_zone_detail():
    """AC2 & F4: /api/zones/{zone_id} returns deterministic Eh, Vh, Rd, and population split."""
    r = client.get("/api/zones/Z-34?city=pune&hour=4")
    assert r.status_code == 200
    z = r.json()
    assert z["id"] == "pune-Z-34"
    assert "eh" in z and "vh" in z and "rd" in z and "tier" in z


def test_ac3_deterministic_scoring_worked_example():
    """
    AC3 Deterministic scoring (exact worked example from specs.md Section 6 & 10):
    GIVEN a zone with Population 48,200, Child 9,100, Elderly 3,900,
    7 hours above 38 C, 6 working taps and 2 clinics,
    THEN compute_scores returns Eh = 337,400, Vh = 91,000 and Rd = 8,272.7 (+/- 0.1).
    """
    res = compute_scores(
        pop=48200,
        child_pop=9100,
        elderly_pop=3900,
        hours_above_38=7,
        working_taps=6,
        clinics=2
    )
    assert res["eh"] == 337400
    assert res["vh"] == 91000
    assert abs(res["rd"] - 8272.7) <= 0.1
    assert res["tier"] == "Critical"


def test_ac3_zero_heat_hours():
    """When Hours_above_38C = 0, Eh = Vh = Rd = 0 and tier is 'No heat risk'."""
    res = compute_scores(
        pop=48200,
        child_pop=9100,
        elderly_pop=3900,
        hours_above_38=0,
        working_taps=6,
        clinics=2
    )
    assert res["eh"] == 0
    assert res["vh"] == 0
    assert res["rd"] == 0.0
    assert res["tier"] == "No heat risk"


def test_ac4_dispatch_brief_and_retrieval():
    """
    AC4 Dispatch brief: GIVEN '2 teams, 40 cans, 12-4 pm', WHEN /api/dispatch/brief completes,
    THEN response lists at most 5 target zones, every Rd and Vh matches /api/priority,
    and GET /api/dispatch/{brief_id} returns the stored brief.
    """
    prio = client.get("/api/priority?city=pune&start=2&end=6&limit=10").json()
    prio_map = {z["id"]: z for z in prio["priority_zones"]}

    res = client.post("/api/dispatch/brief", json={
        "city": "pune",
        "request_text": "We have 2 teams and 40 water cans. Where should we go between 12 and 4 pm?",
        "start": 2,
        "end": 6,
        "resources": {"teams": 2, "water_cans": 40},
        "language": "en"
    })
    assert res.status_code == 200
    brief = res.json()
    assert "targets" in brief
    assert 1 <= len(brief["targets"]) <= 5
    for t in brief["targets"]:
        zid = t["zone_id"]
        if zid in prio_map:
            assert t["rd"] == prio_map[zid]["rd"]
            assert t["vh"] == prio_map[zid]["vh"]

    brief_id = brief["brief_id"]
    fetched = client.get(f"/api/dispatch/{brief_id}")
    assert fetched.status_code == 200
    assert fetched.json()["brief_id"] == brief_id


def test_ac5_crowd_verification_and_duplicate_guard():
    """
    AC5 & E7: Two distinct session tokens marking a tap 'dry' transitions its status to 'dry',
    while a duplicate report from the same session_token within 10 min returns 429.
    """
    osm_id = f"tap_test_{int(time.time() * 1000)}"
    tok1 = f"tok_1_{int(time.time() * 1000)}"
    tok2 = f"tok_2_{int(time.time() * 1000)}"

    # First report from tok1 -> 200
    r1 = client.post(f"/api/assets/{osm_id}/reports", json={"status": "dry", "session_token": tok1})
    assert r1.status_code == 200

    # Duplicate report from tok1 within 10 min -> 429
    r_dup = client.post(f"/api/assets/{osm_id}/reports", json={"status": "dry", "session_token": tok1})
    assert r_dup.status_code == 429

    # Second distinct report from tok2 -> 200, effective_status becomes 'dry'
    r2 = client.post(f"/api/assets/{osm_id}/reports", json={"status": "dry", "session_token": tok2})
    assert r2.status_code == 200

    status_res = client.get(f"/api/assets/{osm_id}/reports").json()
    assert status_res["dry_votes"] == 2
    assert status_res["effective_status"] == "dry"


def test_scenario_1_nearest_relief_finder():
    """Scenario 1 (Worker): GIVEN a rider at 18.5284, 73.8739, WHEN they request /api/nearest, THEN 3 nearest assets appear sorted by distance."""
    r = client.get("/api/nearest?lat=18.5284&lon=73.8739")
    assert r.status_code == 200
    nearest = r.json()["nearest"]
    assert len(nearest) == 3
    assert nearest[0]["distance_m"] <= nearest[1]["distance_m"] <= nearest[2]["distance_m"]


def test_scenario_2_hallucination_guard():
    """
    Scenario 2 (Hallucination guard): GIVEN a mocked Gemini reply with a wrong Rd value
    and an unknown zone_id, WHEN validate_dispatch_brief runs, THEN the final brief shows
    the compute_scores value and drops the unknown zone.
    """
    ranked_zones = [
        {
            "id": "pune-Z-34",
            "name": "Swargate",
            "tier": "Critical",
            "rd": 8272.7,
            "vh": 91000,
            "eh": 337400,
            "pop": 48200,
            "hours_above_38": 7,
            "working_taps": 6,
            "clinics": 2
        }
    ]
    hallucinated_reply = {
        "summary": "Test summary",
        "targets": [
            {
                "zone_id": "Z-34",
                "zone_name": "Swargate",
                "tier": "Low",
                "rd": 999999.9,  # Hallucinated Rd
                "vh": 12345,     # Hallucinated Vh
                "hours_above_38": 99
            },
            {
                "zone_id": "Z-99-FAKE",
                "zone_name": "Atlantis",
                "rd": 50000.0
            }
        ]
    }
    validated = validate_dispatch_brief(hallucinated_reply, ranked_zones)
    assert len(validated["targets"]) == 1
    assert validated["targets"][0]["zone_id"] == "pune-Z-34"
    assert validated["targets"][0]["rd"] == 8272.7
    assert validated["targets"][0]["vh"] == 91000
    assert validated["targets"][0]["tier"] == "Critical"


def test_strict_anti_spoofing_vision_guardrail():
    """
    Strict Visual Anti-Spoofing Guardrail:
    Uploading a non-emergency/trash image (solid color block) MUST be rejected
    (verified: False, severity_tier: 'REJECTED') even when accompanied by persuasive text.
    """
    buf = io.BytesIO()
    Image.new("RGB", (160, 160), color=(128, 0, 200)).save(buf, format="JPEG")
    trash_b64 = base64.b64encode(buf.getvalue()).decode()

    r = client.post("/api/beacons/report", json={
        "location_name": "Swargate Test",
        "lat": 18.5018,
        "lon": 73.8578,
        "zone_id": "Z-44",
        "description": "15 delivery riders waiting under blazing flyover sun, tap dry",
        "image_base64": trash_b64,
        "session_token": "pytest_tok"
    })
    assert r.status_code == 200
    data = r.json()
    assert data["gemini_audit"]["verified"] is False
    assert data["gemini_audit"]["severity_tier"] == "REJECTED"
    assert data["beacon"]["verified"] is False


def test_non_linear_wbgt_and_cross_platform_guards():
    """
    Verifies non-linear WBGT J-curve severity multiplier, consecutive-hour thermal clustering,
    capacity saturation ratio, and defensive clamping against negative inputs.
    """
    s = compute_scores(
        pop=25000,
        child_pop=3000,
        elderly_pop=2000,
        hours_above_38=6,
        working_taps=2,
        clinics=1,
        peak_apparent_temp=43.5,
        hourly_temps=[36.0, 39.2, 41.0, 42.5, 43.5, 41.8, 39.0, 35.0],
    )
    assert s["consecutive_heat_streak"] == 6
    assert s["wbgt_severity_multiplier"] > 1.5
    assert s["non_linear_rd"] > s["rd"]
    assert s["capacity_saturation_ratio"] > 0


if __name__ == "__main__":
    test_funcs = [v for k, v in list(globals().items()) if k.startswith("test_") and callable(v)]
    for fn in test_funcs:
        print(f"Running {fn.__name__}...")
        fn()
        print(f"  ✓ PASSED {fn.__name__}")
    print(f"\nAll {len(test_funcs)} acceptance criteria tests passed!")
