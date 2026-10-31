"""
Deterministic & Non-Linear Biometeorological Scoring Engine for HeatAtlas.
All calculations are performed strictly in Python with Pydantic input validation.

Core Spec Formulas (preserved for deterministic auditability):
- Hours_above_38C: Count of hourly apparent_temperature > 38.0C
- Eh (Heat Exposure Person-Hours) = Population * Hours_above_38C
- Vh (Vulnerable Person-Hours) = (Child_Pop + Elderly_Pop) * Hours_above_38C
- Rd (Relief Deficit) = Vh / (Working_Water_Taps + 2 * Clinics + 1)

Advanced Biometeorological & Queuing Extensions:
- WBGT J-Curve Severity Multiplier: 1.0 + 0.08 * max(0, peak_temp - 38.0) ** 1.35
- Sky View Factor (SVF) Urban Canyon Adjustment: Accounts for longwave radiation trapping in dense wards
- Diurnal Transient Gig-Worker Flux: Models daytime outdoor worker influx during peak transit hours
- Consecutive-Hour Thermal Clustering: Longest unbroken streak of hours >= 38.0C
- Capacity Saturation Decay: Accounts for queuing congestion when Population / Asset capacity is high
"""

from typing import Optional, List
from pydantic import BaseModel, Field


class ScoringInput(BaseModel):
    """Validated non-negative telemetry inputs for zone heat deficit computation."""
    pop: int = Field(ge=0, description="Total zone population from WorldPop v2")
    child_pop: int = Field(ge=0, description="Under-5 child population")
    elderly_pop: int = Field(ge=0, description="Over-65 elderly population")
    hours_above_38: int = Field(ge=0, le=72, description="Count of forecast hours >= 38C")
    working_taps: int = Field(ge=0, description="Verified working drinking water taps")
    clinics: int = Field(ge=0, description="Verified clinics and hospitals")
    peak_apparent_temp: float = Field(default=38.0, description="Peak apparent temperature (C)")
    consecutive_heat_streak: int = Field(default=0, ge=0, description="Max consecutive hours >= 38C")
    sky_view_factor: float = Field(default=0.65, ge=0.1, le=1.0, description="Urban Canyon Sky View Factor (SVF)")
    transient_worker_flux: float = Field(default=1.15, ge=1.0, le=2.5, description="Diurnal outdoor gig-worker influx multiplier")


def compute_consecutive_streak(hourly_temps: Optional[List[float]], threshold: float = 38.0) -> int:
    """Computes the maximum consecutive hours where apparent temperature meets/exceeds threshold."""
    if not hourly_temps:
        return 0
    max_streak = 0
    cur_streak = 0
    for temp in hourly_temps:
        if temp is not None and float(temp) >= threshold:
            cur_streak += 1
            if cur_streak > max_streak:
                max_streak = cur_streak
        else:
            cur_streak = 0
    return max_streak


def compute_scores(
    pop: int,
    child_pop: int,
    elderly_pop: int,
    hours_above_38: int,
    working_taps: int,
    clinics: int,
    peak_apparent_temp: Optional[float] = None,
    hourly_temps: Optional[List[float]] = None,
    sky_view_factor: float = 0.65,
    transient_worker_flux: float = 1.15,
) -> dict:
    # Defensive non-negative clamping before Pydantic validation
    safe_pop = max(0, int(pop or 0))
    safe_child = max(0, min(safe_pop, int(child_pop or 0)))
    safe_elderly = max(0, min(safe_pop - safe_child, int(elderly_pop or 0)))
    safe_hours = max(0, min(72, int(hours_above_38 or 0)))
    safe_taps = max(0, int(working_taps or 0))
    safe_clinics = max(0, int(clinics or 0))
    safe_svf = max(0.1, min(1.0, float(sky_view_factor or 0.65)))
    safe_flux = max(1.0, min(2.5, float(transient_worker_flux or 1.15)))

    streak = compute_consecutive_streak(hourly_temps, 38.0) if hourly_temps else safe_hours
    inferred_peak = (
        max([float(t) for t in hourly_temps if t is not None], default=38.0)
        if hourly_temps
        else (float(peak_apparent_temp) if peak_apparent_temp is not None else (44.2 if safe_hours > 0 else 34.0))
    )

    validated = ScoringInput(
        pop=safe_pop,
        child_pop=safe_child,
        elderly_pop=safe_elderly,
        hours_above_38=safe_hours,
        working_taps=safe_taps,
        clinics=safe_clinics,
        peak_apparent_temp=inferred_peak,
        consecutive_heat_streak=streak,
        sky_view_factor=safe_svf,
        transient_worker_flux=safe_flux,
    )

    if validated.hours_above_38 <= 0:
        return {
            "hours_above_38": 0,
            "eh": 0,
            "vh": 0,
            "rd": 0.0,
            "non_linear_rd": 0.0,
            "wbgt_severity_multiplier": 1.0,
            "sky_view_factor": validated.sky_view_factor,
            "transient_worker_flux": validated.transient_worker_flux,
            "consecutive_heat_streak": 0,
            "capacity_saturation_ratio": 0.0,
            "tier": "No heat risk",
        }

    eh = int(validated.pop * validated.hours_above_38)
    vh = int((validated.child_pop + validated.elderly_pop) * validated.hours_above_38)
    denom = max(1, validated.working_taps + (2 * validated.clinics) + 1)
    rd = round(vh / denom, 1)

    # Non-linear J-curve thermal stress multiplier (physiological heatstroke risk above 38°C)
    excess_temp = max(0.0, validated.peak_apparent_temp - 38.0)
    wbgt_multiplier = round(1.0 + 0.08 * (excess_temp ** 1.35), 3)

    # Sky View Factor (SVF) canyon radiation trapping factor (lower SVF = narrower canyon = more trapped heat)
    svf_canyon_factor = round(1.0 + 0.15 * (1.0 - validated.sky_view_factor), 3)

    # Temporal clustering penalty (continuous unbroken solar/thermal exposure >= 4 hours)
    temporal_cluster_factor = 1.0 + (0.05 * max(0, validated.consecutive_heat_streak - 3))

    # Resource capacity saturation decay (each tap serves ~250 people/hr, each clinic ~500)
    effective_daytime_pop = int(validated.pop * validated.transient_worker_flux)
    nominal_hourly_capacity = max(250, (validated.working_taps * 250) + (validated.clinics * 500))
    capacity_saturation_ratio = round(effective_daytime_pop / nominal_hourly_capacity, 2)
    saturation_penalty = min(2.0, 1.0 + 0.02 * max(0.0, capacity_saturation_ratio - 10.0))

    non_linear_rd = round(
        rd * wbgt_multiplier * svf_canyon_factor * temporal_cluster_factor * saturation_penalty * validated.transient_worker_flux,
        1,
    )

    if rd >= 7000:
        tier = "Critical"
    elif rd >= 4000:
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
        "wbgt_severity_multiplier": wbgt_multiplier,
        "sky_view_factor": validated.sky_view_factor,
        "transient_worker_flux": validated.transient_worker_flux,
        "consecutive_heat_streak": validated.consecutive_heat_streak,
        "capacity_saturation_ratio": capacity_saturation_ratio,
        "tier": tier,
    }
