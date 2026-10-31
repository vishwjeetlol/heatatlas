import math
from typing import List, Optional
from pydantic import BaseModel, Field


class ZoneTelemetryInput(BaseModel):
    """Pydantic boundary validator ensuring non-negative physical telemetry inputs."""

    pop: int = Field(ge=0, description="Total residential population from WorldPop v2")
    child_pop: int = Field(ge=0, description="Child population (0-14 yrs)")
    elderly_pop: int = Field(ge=0, description="Elderly population (65+ yrs)")
    hours_above_38: int = Field(
        ge=0, le=48, description="Forecast hours with apparent temp >= 38°C"
    )
    working_taps: int = Field(
        ge=0, description="Crowd-verified working drinking water taps"
    )
    clinics: int = Field(ge=0, description="Primary health clinics / ORS centers")
    peak_apparent_temp: float = Field(default=38.0, ge=-10.0, le=65.0)
    relative_humidity_pct: float = Field(default=38.0, ge=1.0, le=100.0)
    sky_view_factor: float = Field(default=0.65, ge=0.1, le=1.0)
    transient_worker_flux: float = Field(default=1.0, ge=0.5, le=3.0)
    consecutive_heat_streak: int = Field(default=0, ge=0, le=48)


def compute_stull_wet_bulb(temp_c: float, rh_pct: float) -> float:
    """
    Computes psychrometric Wet-Bulb Temperature (Tw, °C) from dry-bulb/ambient temperature (T, °C)
    and relative humidity (RH, %) using the empirical inverse-tangent formulation of:
      Stull, R. (2011): 'Wet-Bulb Temperature from Relative Humidity and Air Temperature',
      Journal of Applied Meteorology and Climatology, Vol. 50, pp. 2267–2269.
    Published verification points:
      - T = 20.0°C, RH = 50.0% -> Tw = 13.70°C
      - T = 42.0°C, RH = 38.0% -> Tw = 29.68°C
    """
    t = max(-20.0, min(60.0, float(temp_c)))
    rh = max(1.0, min(100.0, float(rh_pct)))
    tw = (
        t * math.atan(0.151977 * math.sqrt(rh + 8.313659))
        + math.atan(t + rh)
        - math.atan(rh - 1.676331)
        + 0.00391838 * (rh**1.5) * math.atan(0.023101 * rh)
        - 4.686035
    )
    return round(tw, 2)


def _longest_streak_above_38(
    hourly_temps: Optional[List[float]], fallback_hours: int
) -> int:
    if not hourly_temps:
        return max(0, int(fallback_hours))
    best = 0
    curr = 0
    for t in hourly_temps:
        if t >= 38.0:
            curr += 1
            if curr > best:
                best = curr
        else:
            curr = 0
    return best


def compute_scores(
    pop: int,
    child_pop: int,
    elderly_pop: int,
    hours_above_38: int,
    working_taps: int,
    clinics: int,
    peak_apparent_temp: float = 38.0,
    hourly_temps: Optional[List[float]] = None,
    sky_view_factor: float = 0.65,
    transient_worker_flux: float = 1.0,
    relative_humidity_pct: float = 38.0,
    dry_bulb_temp_c: Optional[float] = None,
) -> dict:
    """
    Deterministic Spatial Relief Deficit Engine:
    1. Heat Exposure Person-Hours: Eh = Pop * Hours_above_38C
    2. Vulnerable Person-Hours: Vh = (Child_Pop_0_14 + Elderly_Pop_65_plus) * Hours_above_38C
    3. Core Spec Relief Deficit: Rd = Vh / (1 + Working_Taps + 2 * Clinics)
    4. Extended Non-Linear Priority Score (non_linear_rd):
       Explicit product of 3 documented factors:
         non_linear_rd = Rd * thermal_tw_factor * density_svf_factor * sphere_saturation_factor
       where:
         - thermal_tw_factor = 1 + 0.08 * max(0, peak_apparent_temp - 38)^1.35
         - density_svf_factor = 1 + 0.15 * (1 - built_up_density_svf_proxy)
         - sphere_saturation_factor = min(1.5, 1 + 0.015 * max(0, capacity_saturation_ratio - 1.0))
           referenced against Sphere Humanitarian Standard (Water Supply Standard 1: 250 persons/tap headcount).
    """
    streak = _longest_streak_above_38(hourly_temps, hours_above_38)
    validated = ZoneTelemetryInput(
        pop=max(0, int(pop)),
        child_pop=max(0, int(child_pop)),
        elderly_pop=max(0, int(elderly_pop)),
        hours_above_38=max(0, min(48, int(hours_above_38))),
        working_taps=max(0, int(working_taps)),
        clinics=max(0, int(clinics)),
        peak_apparent_temp=max(-10.0, min(65.0, float(peak_apparent_temp))),
        relative_humidity_pct=max(1.0, min(100.0, float(relative_humidity_pct))),
        sky_view_factor=max(0.1, min(1.0, float(sky_view_factor))),
        transient_worker_flux=max(0.5, min(3.0, float(transient_worker_flux))),
        consecutive_heat_streak=max(0, min(48, int(streak))),
    )

    # Stull (2011) psychrometric wet-bulb temperature strictly requires dry-bulb air temperature (T) and RH.
    # Apparent temperature is maintained separately for the empirical heat strain factor.
    air_temp_input = (
        float(dry_bulb_temp_c)
        if dry_bulb_temp_c is not None
        else validated.peak_apparent_temp
    )
    stull_tw = compute_stull_wet_bulb(air_temp_input, validated.relative_humidity_pct)

    if validated.hours_above_38 <= 0:
        return {
            "hours_above_38": 0,
            "eh": 0,
            "vh": 0,
            "rd": 0.0,
            "non_linear_rd": 0.0,
            "stull_wet_bulb_c": stull_tw,
            "psychrometric_tw_strain_factor": 1.0,
            "wbgt_severity_multiplier": 1.0,  # Backward compatibility alias
            "sky_view_factor": validated.sky_view_factor,
            "transient_worker_flux": validated.transient_worker_flux,
            "consecutive_heat_streak": 0,
            "capacity_saturation_ratio": 0.0,
            "sphere_persons_per_tap": 0.0,
            "multiplier_breakdown": {
                "psychrometric_tw_factor": 1.0,
                "thermal_tw_factor": 1.0,  # Backward compatibility alias
                "density_svf_factor": 1.0,
                "sphere_saturation_factor": 1.0,
                "combined_multiplier": 1.0,
                "exact_identity": "non_linear_rd = round(rd * combined_multiplier, 1)",
            },
            "tier": "No heat risk",
            "coefficient_provenance": {
                "base_formula": "Deterministic spec: Rd = Vh / (1 + Taps + 2*Clinics)",
                "wet_bulb_model": "Stull (2011) psychrometric Tw (J. Appl. Meteor. Climatol. 50:2267-2269). Note: Psychrometric Tw is distinct from ISO 7243 WBGT, which requires black-globe solar radiation and anemometer measurements.",
                "operational_threshold": "PMC Heat Action Plan Tier-2 Orange Alert operational activation trigger (apparent temp >= 38.0°C)",
                "sphere_standard": "Sphere Humanitarian Standard (Water Supply Standard 1): 250 persons per tap headcount",
                "heuristic_weights": "3-factor operational heuristic (psychrometric_tw_factor * density_svf_factor * sphere_saturation_factor)",
            },
        }

    eh = int(validated.pop * validated.hours_above_38)
    vh = int((validated.child_pop + validated.elderly_pop) * validated.hours_above_38)
    denom = max(1, validated.working_taps + (2 * validated.clinics) + 1)
    rd = round(vh / denom, 1)

    # Factor 1: Psychrometric heat-strain multiplier scaled above PMC Heat Action Plan 38°C operational threshold
    excess_temp = max(0.0, validated.peak_apparent_temp - 38.0)
    heat_strain_multiplier = round(1.0 + 0.08 * (excess_temp**1.35), 3)

    # Factor 2: Built-up density SVF proxy retention factor
    svf_canyon_factor = round(1.0 + 0.15 * (1.0 - validated.sky_view_factor), 3)

    # Factor 3: Sphere Humanitarian Standard (250 persons per working tap headcount capacity; 500 per primary clinic)
    effective_daytime_pop = int(validated.pop * validated.transient_worker_flux)
    sphere_nominal_headcount_capacity = max(
        250, (validated.working_taps * 250) + (validated.clinics * 500)
    )
    capacity_saturation_ratio = round(
        effective_daytime_pop / sphere_nominal_headcount_capacity, 2
    )
    sphere_persons_per_tap = round(validated.pop / max(1, validated.working_taps), 1)
    saturation_penalty = round(
        min(1.5, 1.0 + 0.015 * max(0.0, capacity_saturation_ratio - 1.0)), 3
    )

    combined_multiplier = round(
        heat_strain_multiplier * svf_canyon_factor * saturation_penalty, 3
    )
    non_linear_rd = round(rd * combined_multiplier, 1)

    if rd >= 5000:
        tier = "Critical"
    elif rd >= 3000:
        tier = "High"
    elif rd >= 1500:
        tier = "Moderate"
    else:
        tier = "Low"

    return {
        "hours_above_38": validated.hours_above_38,
        "eh": eh,
        "vh": vh,
        "rd": rd,
        "non_linear_rd": non_linear_rd,
        "stull_wet_bulb_c": stull_tw,
        "psychrometric_tw_strain_factor": heat_strain_multiplier,
        "wbgt_severity_multiplier": heat_strain_multiplier,  # Backward compatibility alias
        "sky_view_factor": validated.sky_view_factor,
        "transient_worker_flux": validated.transient_worker_flux,
        "consecutive_heat_streak": validated.consecutive_heat_streak,
        "capacity_saturation_ratio": capacity_saturation_ratio,
        "sphere_persons_per_tap": sphere_persons_per_tap,
        "multiplier_breakdown": {
            "psychrometric_tw_factor": heat_strain_multiplier,
            "thermal_tw_factor": heat_strain_multiplier,  # Backward compatibility alias
            "density_svf_factor": svf_canyon_factor,
            "sphere_saturation_factor": saturation_penalty,
            "combined_multiplier": combined_multiplier,
            "exact_identity": "non_linear_rd = round(rd * combined_multiplier, 1)",
        },
        "tier": tier,
        "coefficient_provenance": {
            "base_formula": "Deterministic spec: Rd = Vh / (1 + Taps + 2*Clinics)",
            "wet_bulb_model": "Stull (2011) psychrometric Tw (J. Appl. Meteor. Climatol. 50:2267-2269). Note: Psychrometric Tw is distinct from ISO 7243 WBGT, which requires black-globe solar radiation and anemometer measurements.",
            "operational_threshold": "PMC Heat Action Plan Tier-2 Orange Alert operational activation trigger (apparent temp >= 38.0°C)",
            "sphere_standard": "Sphere Humanitarian Standard (Water Supply Standard 1): 250 persons per tap headcount",
            "heuristic_weights": "3-factor operational heuristic (psychrometric_tw_factor * density_svf_factor * sphere_saturation_factor)",
        },
    }


def _kendall_tau(order_a: List[str], order_b: List[str]) -> float:
    """Computes exact Kendall-tau rank correlation coefficient between two zone rankings."""
    n = len(order_a)
    if n <= 1:
        return 1.0
    rank_b = {zid: idx for idx, zid in enumerate(order_b)}
    b_indices = [rank_b[zid] for zid in order_a if zid in rank_b]
    m = len(b_indices)
    if m <= 1:
        return 1.0
    concordant = 0
    discordant = 0
    for i in range(m):
        for j in range(i + 1, m):
            if b_indices[i] < b_indices[j]:
                concordant += 1
            elif b_indices[i] > b_indices[j]:
                discordant += 1
    total_pairs = m * (m - 1) // 2
    return round((concordant - discordant) / max(1, total_pairs), 4)


def compute_ablation_study(zones: List[dict]) -> dict:
    """
    Runs a formal 4-stage ablation study across all 64 zones comparing:
      - M0 (Population-Only Naive Baseline): Vh = (Child + Elderly) * H38 (ignoring taps & clinics)
      - M1 (Core Spec Rd): Rd = Vh / (1 + Taps + 2*Clinics)
      - M2 (+ Thermal & Built-Up Density Proxy): Rd * thermal_tw_factor * density_svf_factor
      - M3 (+ Sphere 250-Person/Tap Saturation): Full non_linear_rd
    Reports Kendall-tau rank correlation and top-5 zone shifts across variants.
    """
    if not zones:
        return {"status": "empty", "variants": []}

    # M0: Naive Vulnerability-Only Baseline (ignoring OSM water & clinic supply)
    m0_pop_only = [
        z["id"] for z in sorted(zones, key=lambda x: x.get("vh", 0), reverse=True)
    ]
    # M1: Core Spec Rd = Vh / (1 + Taps + 2*Clinics)
    m1_spec_rd = [
        z["id"] for z in sorted(zones, key=lambda x: x.get("rd", 0.0), reverse=True)
    ]
    # M2: Spec Rd * Thermal * Built-Up Density Proxy
    m2_thermal_svf = [
        z["id"]
        for z in sorted(
            zones,
            key=lambda x: (
                x.get("rd", 0.0)
                * x.get("wbgt_severity_multiplier", 1.0)
                * (1.0 + 0.15 * (1.0 - x.get("sky_view_factor", 0.65)))
            ),
            reverse=True,
        )
    ]
    # M3: Full Extended Non-Linear Rd (with Sphere 250-person/tap headcount saturation)
    m3_full = [
        z["id"]
        for z in sorted(zones, key=lambda x: x.get("non_linear_rd", 0.0), reverse=True)
    ]

    return {
        "methodology": "Pairwise Kendall-tau rank correlation across all 64 Pune wards (demonstrating how OSM supply denominator and thermal/saturation modifiers re-order naive population rankings)",
        "baseline_spec_rd_top_5": m1_spec_rd[:5],
        "naive_pop_only_top_5": m0_pop_only[:5],
        "ablation_variants": [
            {
                "model_id": "M0_naive_vulnerability_only_no_supply",
                "formula": "Vh = (Child_Pop + Elderly_Pop) * H38 [Ignores OSM taps & clinics]",
                "kendall_tau_vs_spec_rd": _kendall_tau(m1_spec_rd, m0_pop_only),
                "top_3_zones": m0_pop_only[:3],
                "calibration_status": "Naive population-only baseline (over-allocates to well-served populous wards)",
            },
            {
                "model_id": "M1_core_spec_rd",
                "formula": "Rd = Vh / (1 + Taps + 2*Clinics)",
                "kendall_tau_vs_spec_rd": 1.0,
                "top_3_zones": m1_spec_rd[:3],
                "calibration_status": "Core Deterministic Spec (incorporates 64-ward OSM water & clinic supply)",
            },
            {
                "model_id": "M2_plus_thermal_and_density_proxy",
                "formula": "M1 * thermal_tw_factor * density_svf_factor",
                "kendall_tau_vs_spec_rd": _kendall_tau(m1_spec_rd, m2_thermal_svf),
                "top_3_zones": m2_thermal_svf[:3],
                "calibration_status": "Heuristic thermal + built-up density modifier",
            },
            {
                "model_id": "M3_plus_sphere_250_saturation",
                "formula": "M2 * sphere_saturation_factor",
                "kendall_tau_vs_spec_rd": _kendall_tau(m1_spec_rd, m3_full),
                "top_3_zones": m3_full[:3],
                "calibration_status": "Sphere Standard (250 persons/tap headcount) + saturation penalty",
            },
        ],
    }
