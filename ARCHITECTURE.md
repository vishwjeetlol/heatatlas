# HeatAtlas System Architecture (FORGE '26)

```mermaid
flowchart TD
    subgraph Client["Mobile Web Frontend (React 18 + Vite + Leaflet)"]
        UI["Phone Frame UI (Apple Bento Grid)"]
        Map["Leaflet GIS (OSM Tiles + 64 Zones + Dynamic Zoom)"]
        Scrub["24h Timeline Heat Scrubber"]
        Triage["Heat Stroke 2-Tap Triage"]
        BeaconUI["Water Demand Beacon + Camera/Audio"]
        Corridor["Canopy Cool Route vs Highway Route"]
    end

    subgraph Backend["FastAPI Python 3.11 High-Performance Engine"]
        API["FastAPI REST Endpoints (/api/zones, /api/assets, /api/beacons)"]
        Math["Deterministic Formula Engine (Eh, Vh, Rd)"]
        Guard["Deterministic Hallucination Guardrail Validator"]
        DB[("SQLite: Verified Crowd Reports & Beacons")]
    end

    subgraph AI["Google Gemini 2.0 Flash Agent"]
        Gemini["Gemini 2.0 Flash (Multimodal Vision & Voice)"]
        Vision["Photo Proof Verification (Crowd & Heat Detection)"]
        Tools["5 Read-Only Tools (Forecast, Pop, Assets, Scores, Nearest)"]
        Brief["WhatsApp Dispatch Brief Synthesizer"]
    end

    subgraph Upstream["Live Upstream Feeds (Rule 4 Zero Mocks)"]
        Meteo["Open-Meteo Hourly Forecast API"]
        WorldPop["WorldPop v2 1km Polygon Demographics"]
        OSM["OpenStreetMap Live Nodes (Overpass + Nominatim)"]
    end

    UI --> API
    Map --> API
    API --> Math
    API --> Guard
    API <--> Gemini
    Gemini --> Vision
    Gemini --> Tools
    Tools --> Math
    API --> DB
    API <--> Meteo
    API <--> WorldPop
    API <--> OSM
```

### Core Deterministic Mathematical Engine (Python)
- **Heat Exposure ($E_h$):** $\text{Population} \times H_{38}$
- **Vulnerable Person-Hours ($V_h$):** $(\text{Child Pop} + \text{Elderly Pop}) \times H_{38}$
- **Relief Deficit ($R_d$):** $\frac{V_h}{\text{Working Taps} + 2 \times \text{Clinics} + 1}$
- **Consensus Rule:** Taps marked dry when $\ge 2$ distinct session tokens report dry within 24h.
- **Multimodal AI Rule:** Gemini 2.0 Flash audits photos of stranded workers before broadcasting emergency beacons.
