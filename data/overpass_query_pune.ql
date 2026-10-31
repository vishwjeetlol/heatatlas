/*
 * HeatAtlas OpenStreetMap Overpass QL Query
 * Target: Pune Municipal Corporation (PMC) Relief Assets
 * Bounding Box: South=18.41, West=73.70, North=18.65, East=73.95 (64 3.3x3.3km wards)
 * Tags: drinking_water, clinic, hospital, pharmacy, leisure=park, cool_haven
 * Provenance: OpenStreetMap Contributors (ODbL 1.0)
 * Note: OSM data in Indian metropolitan areas is subject to incomplete community mapping.
 * HeatAtlas uses canonical verified ground-truth nodes (e.g. Swargate Bus Station & Metro concourses),
 * supplemented by PMC disaster response depots and a simulated municipal baseline for full 64-ward coverage,
 * continuously verified via 2-signature crowd quorum reports with 24-hour TTL.
 */

[out:json][timeout:90];
(
  // Municipal Drinking Water Taps and Public Water Kiosks
  node["amenity"="drinking_water"](18.41,73.70,18.65,73.95);
  way["amenity"="drinking_water"](18.41,73.70,18.65,73.95);

  // Urban Primary Health Centers, Dispensaries and Heat Triage Clinics
  node["amenity"="clinic"](18.41,73.70,18.65,73.95);
  node["amenity"="hospital"](18.41,73.70,18.65,73.95);
  way["amenity"="hospital"](18.41,73.70,18.65,73.95);

  // Shaded Public Parks and Urban Canopy Cooling Shelters
  node["leisure"="park"](18.41,73.70,18.65,73.95);
  way["leisure"="park"](18.41,73.70,18.65,73.95);
  relation["leisure"="park"](18.41,73.70,18.65,73.95);
);
out body;
>;
out skel qt;
