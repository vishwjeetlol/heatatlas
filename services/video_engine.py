import os
import json


def generate_heatatlas_remotion_manifest(
    city="Pune", peak_temp=42.4, beacons_count=5, ngos_count=12
):
    """
    Generates Remotion video timeline configuration for dynamic video dispatch rendering.
    """
    manifest = {
        "composition": "HeatAtlasDailyDispatch",
        "fps": 30,
        "durationInFrames": 300,  # 10 seconds
        "width": 1080,
        "height": 1920,  # Vertical 9:16 mobile brief
        "props": {
            "city": city,
            "peakTemp": peak_temp,
            "beaconsCount": beacons_count,
            "ngosCount": ngos_count,
            "primaryTarget": "Swargate Flyover Transit Hub",
            "criticalHours": "12:00 - 16:00",
            "action": "Immediate 200 Canister Water Drop",
        },
    }
    return manifest


if __name__ == "__main__":
    m = generate_heatatlas_remotion_manifest()
    print("Remotion Video Timeline Manifest generated:", json.dumps(m, indent=2))
