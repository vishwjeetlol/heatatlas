"""
Deterministic scoring engine for HeatAtlas.
All calculations are performed strictly in Python.
Formulas:
- Hours_above_38C: Count of hourly apparent_temperature > 38.0C
- Eh (Heat Exposure Person-Hours) = Population * Hours_above_38C
- Vh (Vulnerable Person-Hours) = (Child_Pop + Elderly_Pop) * Hours_above_38C
- Rd (Relief Deficit) = Vh / (Working_Water_Taps + 2 * Clinics + 1)
"""

def compute_scores(pop: int, child_pop: int, elderly_pop: int, hours_above_38: int, working_taps: int, clinics: int) -> dict:
    if hours_above_38 <= 0:
        return {
            "hours_above_38": 0,
            "eh": 0,
            "vh": 0,
            "rd": 0.0,
            "tier": "No heat risk"
        }

    eh = int(pop * hours_above_38)
    vh = int((child_pop + elderly_pop) * hours_above_38)
    denom = working_taps + (2 * clinics) + 1
    rd = round(vh / denom, 1)

    # Priority Tier assignment (calculated relative or absolute thresholds)
    if rd >= 7000:
        tier = "Critical"
    elif rd >= 4000:
        tier = "High"
    elif rd >= 1500:
        tier = "Moderate"
    else:
        tier = "Low"

    return {
        "hours_above_38": hours_above_38,
        "eh": eh,
        "vh": vh,
        "rd": rd,
        "tier": tier
    }
