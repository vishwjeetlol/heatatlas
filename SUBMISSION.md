# 🏆 HeatAtlas: Forecast Heat. Prioritise Relief.

> **Deterministic Spatial Decision-Support Engine & Multimodal Heatwave Relief Orchestrator**  
> **Team Name:** `Team Strawhats` | **Team Code:** `627JUH`  
> **FORGE'26 Track:** `Theme 2 — Climate, Resource Infrastructure & Global Supply Resilience`  
> **Problem Spectrum:** _Autonomous Emergency Response & Supply Chain Logistics Swarm_ · _Smart Grid & Urban Resource Allocation Controller_  
> _Official Hackathon Submission | Powered by Google Gemini Flash (`gemini-2.5-flash` failover chain), Open-Meteo, WorldPop v2 & OSM Overpass_

---

## 📋 FORGE'26 Official 6-Point Project Submission Checklist

| #     | Submission Field               | Official Link / Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| :---- | :----------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **Problem Statement**          | **Target Issue:** City-wide weather alerts (`40°C Pune`) mask lethal micro-zone heat exposure while afternoon heat spikes trigger MSEDCL grid blackouts and municipal water cuts.<br>**Target Audience:** (1) 10M+ Outdoor Gig & Transit Workers & (2) NGO Volunteer Leads & Municipal Disaster Response Teams.                                                                                                                                                                                                                                                                                     |
| **2** | **Solution Description**       | **Overview:** Splits Pune (`18.41,73.70` to `18.65,73.95`) into 64 micro-zones (`Z-00` to `Z-77`, ~3.3×3.3 km wards) ranked by deterministic Relief Deficit ($R_d$). Gemini Flash (`gemini-2.5-flash`) converts English/Hindi/Marathi voice or text into RefChecker-verified WhatsApp dispatch briefs backed by a Constrained VRP Resource Allocator, while Gemini Multimodal Vision audits broken-tap & crowd distress photos.<br>**Architecture:** FastAPI + React 18 + Leaflet + SQLite. Deterministic Python computes $E_h, V_h, R_d$ from live Open-Meteo, WorldPop v2, and OSM Overpass APIs. |
| **3** | **Prototype Link**             | **Live Web App:** [https://heatatlas.vercel.app/](https://heatatlas.vercel.app/)<br>**Live Health Check:** [https://heatatlas.vercel.app/api/health](https://heatatlas.vercel.app/api/health)                                                                                                                                                                                                                                                                                                                                                                                                       |
| **4** | **Demo Video**                 | **Official YouTube Demo:** [https://youtu.be/C0-BQNND-b8](https://youtu.be/C0-BQNND-b8)<br>**Direct Hosted MP4:** [https://heatatlas.vercel.app/demo.mp4](https://heatatlas.vercel.app/demo.mp4)                                                                                                                                                                                                                                                                                                                                                                                                    |
| **5** | **GitHub Repository**          | **Public Repo:** [https://github.com/vishwjeetlol/heatatlas](https://github.com/vishwjeetlol/heatatlas)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **6** | **Pitch Deck & Checklist PDF** | **Pitch Deck PDF (Live):** [https://heatatlas.vercel.app/HeatAtlas_Pitch_Deck.pdf](https://heatatlas.vercel.app/HeatAtlas_Pitch_Deck.pdf)<br>**Submission Checklist PDF (Live):** [https://heatatlas.vercel.app/HeatAtlas_Submission_Checklist.pdf](https://heatatlas.vercel.app/HeatAtlas_Submission_Checklist.pdf)<br>**GitHub PDF Mirror:** [`HeatAtlas_Pitch_Deck.pdf`](HeatAtlas_Pitch_Deck.pdf)                                                                                                                                                                                               |

---

## 📌 1. Executive Summary & Architectural Philosophy

Across the Indian subcontinent (Pune, Nagpur, Nanded, Mumbai), ambient temperatures routinely breach **38°C–44°C**, turning urban transit corridors into high-risk thermal zones.

> **Core Engineering Principle:** _"We build a deterministic spatial decision-support engine for heatwave relief, where AI interprets human requests and communicates operational decisions, while 100% of underlying deficit math, resource constraints, and safety-critical validations remain grounded in our Python backend."_

### Key Capabilities

1. **2-Step Clinical Heatstroke Triage (CNS Confusion + Anhidrosis Screener):**
   - Exertional heatstroke patients can still sweat; therefore, Step 1 screens for **Central Nervous System (CNS) dysfunction** (confusion, dizziness, slurred speech via Gemini Speech Triage), and Step 2 screens for **anhidrosis** (cessation of sweating / dry hot skin), triggering an immediate **Call 108** emergency dispatch webhook (`/api/webhooks/emergency-108`).
2. **Spatial Heat-Risk Estimation & Model-Grid Resolution Transparency:**
   - Open-Meteo provides hourly meso-scale meteorological forecasts (~10 km grid). HeatAtlas spatially joins those forecasts with **WorldPop v2** demographic cohorts (children 0–14 and elderly 65+) and **OSM Overpass** infrastructure across 64 3.3×3.3 km wards, applying documented Local Climate Zone (LCZ) Sky View Factor ($\text{SVF} \in [0.38, 0.82]$) and Urban Heat Island ($\Delta T_{\text{UHI}}$) adjustments.
3. **Constrained Logistics & Vehicle Routing Optimizer (`ConstrainedLogisticsOptimizer`):**
   - Solves constrained allocation $\max \sum_i x_i R_{d,i}$ subject to $\sum_i w_i \le W_{\text{avail}}$ and $\sum_i t_i \le T_{\text{avail}}$, assigning teams, 20L water cans, and ORS sachets from the nearest NGO depot via Haversine travel-time ETA, with automated $\pm 50\%$ weight sensitivity stability verification.
4. **Strict Multimodal Anti-Spoofing & Crowd Quorum (`2-Vote` Consensus + 10-Min Rate Limit):**
   - Uploaded photos are inspected by Gemini Multimodal Vision (`audit_beacon_photo`, `audit_broken_tap_photo`) where the image is the sole source of truth—non-tap or indoor/screenshot images are strictly rejected (`verified: false`). Tap status transitions require a **2-session quorum** within a 24-hour TTL window, with a 10-minute duplicate guard (`HTTP 429`).
5. **Explicit Data Provenance (`live_field_report` vs `seed_scenario_fixture`):**
   - Live meteorological, demographic, and OSM infrastructure feeds are clearly separated from baseline demonstration scenario fixtures (`?include_fixtures=false` toggle in UI and API).

---

## 🧮 2. Unified Mathematical Relief Scoring Model (`services/scoring.py`)

All documentation (`README.md`, `specs.md`, `HeatAtlas_Pitch_Deck.pdf`) and `services/scoring.py` implement the exact same deterministic formulation:

### 1. Heat Exposure Person-Hours ($E_h$)

$$E_h = \text{Population} \times H_{38}$$

### 2. Vulnerable Person-Hours ($V_h$)

$$V_h = (\text{Child\_Pop}_{0\text{--}14} + \text{Elderly\_Pop}_{65+}) \times H_{38}$$

### 3. Relief Deficit Index ($R_d$)

$$R_d = \frac{V_h}{\text{Working\_Water\_Taps} + (2 \times \text{Clinics}) + 1}$$

- **Worked Example (`specs.md` AC3):** Zone `Z-34` with $H_{38} = 7$ hours, Population `48,200`, Child `9,100`, Elderly `3,900`, `6` working taps, `2` clinics:
  - $E_h = 48,200 \times 7 = 337,400$
  - $V_h = (9,100 + 3,900) \times 7 = 91,000$
  - $R_d = 91,000 / (6 + 4 + 1) = 8,272.7$ (`Critical` tier)
- **Non-Linear Biometeorological Extension (`non_linear_rd`):** Incorporates WBGT J-Curve multiplier $1 + 0.08 \cdot \max(0, T_{\text{peak}} - 38)^{1.35}$, Inverse Sky View Factor canyon trapping $1 + 0.15(1 - \text{SVF})$, consecutive-hour streak penalty, and queuing capacity saturation ratio ($250\text{ pop/tap/hr}$, $500\text{ pop/clinic/hr}$).

---

## 📦 3. 12 Integrated Open-Source Repositories (`/api/system/integrations`)

| #   | Repository                         | Module                        | Engineering Role in HeatAtlas                                                    |
| :-- | :--------------------------------- | :---------------------------- | :------------------------------------------------------------------------------- |
| 1   | `tt-a1i/archify`                   | `services/archify_spec.py`    | Formal System Architecture & State Machine Specification (`/api/system/archify`) |
| 2   | `rtk-ai/rtk`                       | `services/rtk_optimizer.py`   | LLM Token Killer Prompt Compression Proxy (`/api/optimizer/rtk`)                 |
| 3   | `NirDiamant/Prompt_Engineering`    | `services/agent.py`           | Role Prompting, Multilingual Few-Shot Grounding & Self-Correction                |
| 4   | `markrussinovich/refchecker`       | `services/spatial_index.py`   | Atomic Claim-Triplet Extraction & Zero-Hallucination Verification                |
| 5   | `hearthresearch/citefact`          | `services/spatial_index.py`   | Source Provenance Attribution to Open-Meteo, WorldPop & Overpass                 |
| 6   | `agencyenterprise/draft-detective` | `services/spatial_index.py`   | Cross-Target Resource Allocation Consistency Auditor                             |
| 7   | `remotion-dev/remotion`            | `services/video_engine.py`    | Programmatic 1080p Emergency Broadcast Video Timeline Manifest                   |
| 8   | `apple-bento-grid`                 | `frontend/src/App.jsx`        | High-Contrast Thermal Bento Telemetry Cards (WBGT, SVF, Queue Load)              |
| 9   | `hallmark`                         | `static/dashboard.html`       | Editorial Typography & High-Craft Dark Command UI                                |
| 10  | `AThevon/genjutsu`                 | `frontend/src/index.css`      | Pulse Beacon Micro-Interactions & Thermal Transitions                            |
| 11  | `dembrandt/dembrandt`              | `frontend/tailwind.config.js` | Modular Scale & Gestalt Color Contrast Tokens                                    |
| 12  | `security-audit-skill`             | `app.py`                      | Geofence Bounding Validation, Rate-Limiting (`HTTP 429`) & Vision Anti-Spoofing  |

---

## 🚀 4. Quickstart, Environment Setup & Pytest Verification

### 1. Environment Configuration (`.env`)

Copy `.env.example` to `.env` in the repository root and set your Google Gemini API key:

```env
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-2.5-flash
OPEN_METEO_BASE_URL=https://api.open-meteo.com
WORLDPOP_BASE_URL=https://api.worldpop.org
OVERPASS_URL=https://overpass-api.de/api/interpreter
CORS_ORIGINS=http://localhost:5173,https://heatatlas.vercel.app
PORT=8000
DATABASE_URL=sqlite:///./heatatlas.db
```

### 2. Launch the Backend & Frontend

```bash
# 1. Start FastAPI Backend
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# 2. Start React 18 + Vite Frontend (or build static bundle)
cd frontend
npm install
npm run dev
```

### 3. Run the 13 Automated Pytest Acceptance Tests (`tests/test_heatatlas.py`)

```bash
pytest tests/test_heatatlas.py -v
```

---

## ⚠️ 5. Operational Safeguards & Medical Disclaimer

- **Multi-Model Failover & Deterministic Fallback:** `services/agent.py` automatically fails over across `gemini-2.5-flash`, `gemini-3.5-flash`, `gemini-3.5-flash-lite`, and `gemini-flash-lite-latest`, and falls back to the deterministic Python template brief (`ai_generated: false`) if all model quotas are exhausted.
- **Serverless Persistence Note:** On Vercel serverless functions, SQLite state is written to `/tmp/heatatlas.db` for ephemeral prototype execution while deficit math is statelessly recomputed from live APIs; production municipal deployment targets managed PostgreSQL (Neon/Supabase) + Redis.
- **Medical Disclaimer:** HeatAtlas provides operational planning information, not medical advice, and does not replace IMD advisories. For heatstroke symptoms (confusion, dizziness, fainting, or absence of sweating) call **108** immediately.
