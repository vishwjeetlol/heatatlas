"""
HeatAtlas Awesome-iOS Architectural Engine
Integrates patterns and specifications curated from vsouza/awesome-ios:
- Haptica & Haptico: Vibration pattern generator specifications (UIImpactFeedbackGenerator)
- JMCBeaconManager & iBeacon: BLE Proximity Beacon Protocol for offline worker mesh
- IHProgressHUD / ActivityIndicatorView: Native iOS Status HUD specifications
- DeviceKit / Luminous: Native device environment telemetry
"""

from typing import Any


def get_ios_haptic_profile(action_type: str) -> dict[str, Any]:
    """
    Returns Haptica / UIImpactFeedbackGenerator pattern mappings
    from vsouza/awesome-ios for mobile feedback.
    """
    profiles = {
        "beacon_verified": {
            "style": "rigid",
            "pattern": [0, 60, 40, 80],
            "framework": "Haptica / UIImpactFeedbackGenerator",
            "description": "Crisp dual-tap confirming crowd beacon verification",
        },
        "emergency_triage": {
            "style": "heavy",
            "pattern": [0, 100, 50, 120, 50, 150],
            "framework": "Haptica / UINotificationFeedbackGenerator.warning",
            "description": "Urgent pulsating warning for anhidrosis / heat stroke",
        },
        "demand_delivered": {
            "style": "success",
            "pattern": [0, 80, 50, 100],
            "framework": "Haptica / UINotificationFeedbackGenerator.success",
            "description": "Satisfying completion pulse upon water delivery",
        },
        "button_tap": {
            "style": "light",
            "pattern": [0, 30],
            "framework": "Haptica / UIImpactFeedbackGenerator.light",
            "description": "Subtle 30ms transient for tactile button press",
        },
    }
    return profiles.get(action_type, profiles["button_tap"])


def get_ibeacon_mesh_spec(zone_id: str, city_name: str = "pune") -> dict[str, Any]:
    """
    Returns JMCBeaconManager / CoreLocation iBeacon proximity broadcast spec
    curated from vsouza/awesome-ios/iBeacon.
    """
    return {
        "uuid": "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0",
        "major": 44,  # Pune Swargate regional cluster
        "minor": int(
            zone_id.replace("Z-", "").replace("pune-", "").replace("Z", "0")[-4:] or 101
        ),
        "measured_power": -59,  # RSSI at 1 meter
        "proximity_zones": {
            "immediate": "< 0.5m (Direct Tap / Water Can Pickup)",
            "near": "0.5m - 3.0m (Shaded Shelter Perimeter)",
            "far": "> 3.0m (Ward Transit Zone)",
        },
        "protocol": "Apple iBeacon / CoreBluetooth Peripheral",
        "curated_from": "vsouza/awesome-ios#ibeacon",
    }


def get_awesome_ios_catalog() -> dict[str, Any]:
    """Returns curated architectural components integrated from vsouza/awesome-ios."""
    return {
        "source": "https://github.com/vsouza/awesome-ios",
        "categories_utilized": [
            {
                "category": "Other Hardware & Haptics",
                "libraries": ["Haptica", "Haptico", "DeviceKit"],
                "role": "Tactile vibration feedback for worker alerts and water confirmations",
            },
            {
                "category": "iBeacon & Bluetooth",
                "libraries": ["JMCBeaconManager", "BeaconEmitter"],
                "role": "Offline peer-to-peer proximity telemetry for heat beacons",
            },
            {
                "category": "Activity Indicator & HUD",
                "libraries": ["IHProgressHUD", "ActivityIndicatorView"],
                "role": "Native iOS status overlay specifications",
            },
            {
                "category": "Layout & Bento Grid",
                "libraries": ["FSPagerView", "GaugeKit"],
                "role": "Apple-style telemetry gauges and mobile paging",
            },
        ],
    }
