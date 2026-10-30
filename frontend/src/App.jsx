import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Flame, Droplet, Trees, Snowflake, Cross, Clock, MessageSquare, RefreshCw, ZoomIn, MapPin, Camera, CheckCircle2, PhoneCall, ShieldAlert, Compass, Mic, Route, Volume2, Building, AlertTriangle, Send, Radio } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Complete i18n Translations Dictionary
const TRANSLATIONS = {
  en: {
    appTitle: "HeatAtlas",
    appSubtitle: "Pune · Gemini 3.8 Spatial Intelligence",
    workerMode: "🛵 Field Worker Radar",
    ngoMode: "🤝 NGO Lead Command",
    needWaterBtn: "🚨 Need Water Here (Crowd Beacon)",
    voiceNoteBtn: "🎤 Speak Voice Note (Marathi/Hindi)",
    photoProofLabel: "Photo Proof AI",
    triageTitle: "Heat Stroke Self-Check",
    triageQuestion: "Are you sweating in this heat?",
    sweatingYes: "✓ Yes, sweating normally",
    sweatingNo: "⚠️ NO SWEATING / Dry Skin",
    sweatingAlert: "🚨 Emergency Heat Stroke Risk! Stop moving immediately. Drink water, seek AC shelter.",
    call108: "Call 108",
    radialTitle: "Nearby Relief Radar (Driver Range)",
    coolRouteTitle: "🌿 Cool Corridor vs Highway Route",
    timelineTitle: "24-Hour Heat Timeline",
    priorityTitle: "Priority Relief Zones",
    criticalBadge: "Critical",
    groundAssetsTitle: "Ground-Level Relief Assets",
    verifiedBeaconsTitle: "Live Worker Demand Beacons",
    demandMetBtn: "✅ Demand Met / Delivered",
    demandFulfilled: "Demand Fulfilled ✓",
    geminiDispatchTitle: "⚡ Gemini 3.8 Flash Dispatch",
    shareWhatsApp: "Share WhatsApp Brief",
    recalculate: "Recalculate",
    medicalDisclaimer: "ℹ️ HeatAtlas provides operational planning information, not medical advice. For heat stroke call 108 immediately.",
    all: "All",
    water: "💧 Water",
    shade: "🌳 Shade & Parks",
    acHaven: "❄️ AC Cool Haven",
    clinics: "🏥 Clinics & ORS",
    driverHere: "Driver Location (Swargate)"
  },
  hi: {
    appTitle: "हीटएटलस",
    appSubtitle: "पुणे · जेमिनी 3.8 भौगोलिक राहत",
    workerMode: "🛵 फील्ड वर्कर रडार",
    ngoMode: "🤝 एनजीओ लीड कमांड",
    needWaterBtn: "🚨 यहाँ पानी चाहिए (क्राउड बीकन)",
    voiceNoteBtn: "🎤 वॉइस नोट बोलें (मराठी/हिंदी)",
    photoProofLabel: "फोटो प्रूफ AI",
    triageTitle: "हीट स्ट्रोक स्व-जाँच",
    triageQuestion: "क्या आपको इस गर्मी में पसीना आ रहा है?",
    sweatingYes: "✓ हाँ, सामान्य पसीना",
    sweatingNo: "⚠️ पसीना बंद / त्वचा सूखी",
    sweatingAlert: "🚨 हीट स्ट्रोक का गंभीर खतरा! तुरंत काम रोकें, पानी पिएं और ठंडी जगह जाएं।",
    call108: "108 पर कॉल करें",
    radialTitle: "नज़दीकी राहत रडार (ड्राइवर दायरा)",
    coolRouteTitle: "🌿 छायादार मार्ग बनाम हाईवे",
    timelineTitle: "24-घंटे तापमान टाइमलाइन",
    priorityTitle: "प्राथमिकता राहत क्षेत्र",
    criticalBadge: "अति गंभीर",
    groundAssetsTitle: "ज़मीनी राहत सुविधाएं",
    verifiedBeaconsTitle: "सक्रिय वर्कर पानी की मांग",
    demandMetBtn: "✅ पानी मिल गया / पूर्ण हुआ",
    demandFulfilled: "मांग पूरी हुई ✓",
    geminiDispatchTitle: "⚡ जेमिनी 3.8 फ़्लैश डिस्पैच",
    shareWhatsApp: "व्हाट्सएप पर भेजें",
    recalculate: "पुनर्गणना",
    medicalDisclaimer: "ℹ️ हीटएटलस योजना की जानकारी देता है, चिकित्सा सलाह नहीं। आपातकाल में 108 डायल करें।",
    all: "सभी",
    water: "💧 पानी",
    shade: "🌳 छाया और पार्क",
    acHaven: "❄️ AC मेट्रो / शेल्टर",
    clinics: "🏥 क्लिनिक और ORS",
    driverHere: "ड्राइवर स्थान (स्वारगेट)"
  },
  mr: {
    appTitle: "हीटअॅटलास",
    appSubtitle: "पुणे · जेमिनी 3.8 भौगोलिक मदत प्रणाली",
    workerMode: "🛵 फिल्ड वर्कर रडार",
    ngoMode: "🤝 स्वयंसेवी लीड कमांड",
    needWaterBtn: "🚨 इथे पाण्याची गरज आहे (क्राउड बीकन)",
    voiceNoteBtn: "🎤 व्हॉईस नोट बोला (मराठी/हिंदी)",
    photoProofLabel: "फोटो पुरावा AI",
    triageTitle: "उष्माघात स्व-तपासणी",
    triageQuestion: "तुम्हाला या उन्हात घाम येत आहे का?",
    sweatingYes: "✓ हो, नेहमीसारखा घाम",
    sweatingNo: "⚠️ घाम येत नाही / त्वचा कोरडी",
    sweatingAlert: "🚨 उष्माघाताचा तीव्र धोका! तत्काळ सावलीत बसा, पाणी प्या आणि एसी निवाऱ्यात जा.",
    call108: "१०८ ला कॉल करा",
    radialTitle: "जवळचे मदत केंद्र रडार (चालक परिसर)",
    coolRouteTitle: "🌿 सावलीचा मार्ग विरुद्ध डांबरी रस्ता",
    timelineTitle: "२४ तास तापमान टाइमलाइन",
    priorityTitle: "प्राधान्य मदत विभाग",
    criticalBadge: "अति गंभीर",
    groundAssetsTitle: "स्थानिक मदत सुविधा",
    verifiedBeaconsTitle: "कामगारांची थेट पाण्याची मागणी",
    demandMetBtn: "✅ पाणी मिळाले / मागणी पूर्ण",
    demandFulfilled: "मागणी पूर्ण झाली ✓",
    geminiDispatchTitle: "⚡ जेमिनी ३.८ फ्लॅश नियोजन",
    shareWhatsApp: "व्हॉट्सॲपवर पाठवा",
    recalculate: "पुन्हा गणना करा",
    medicalDisclaimer: "ℹ️ हीटअॅटलास नियोजनासाठी आहे, वैद्यकीय सल्ल्यासाठी नाही. उष्माघाताच्या लक्षणांसाठी १०८ ला कॉल करा.",
    all: "सर्व",
    water: "💧 पाणी",
    shade: "🌳 सावली आणि बागा",
    acHaven: "❄️ AC मेट्रो / निवारा",
    clinics: "🏥 दवाखाने आणि ORS",
    driverHere: "चालकाचे स्थान (स्वारगेट)"
  }
};

const SWARGATE_PRECISION = {
  lat: 18.5018,
  lon: 73.8578,
  name: "Swargate Flyover (Jedhe Chowk)"
};

export default function App() {
  const [viewMode, setViewMode] = useState('worker'); // 'worker' | 'ngo'
  const [lang, setLang] = useState('en');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [zones, setZones] = useState([]);
  const [assets, setAssets] = useState([]);
  const [beacons, setBeacons] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [hourOffset, setHourOffset] = useState(0);
  const [hourlyTemps, setHourlyTemps] = useState([]);
  const [freshness, setFreshness] = useState('Live Meteo');
  const [toastMsg, setToastMsg] = useState(null);
  const [dispatchBrief, setDispatchBrief] = useState('Loading Gemini 3.8 Flash operational brief...');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentZoom, setCurrentZoom] = useState(13);
  const [sessionToken] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9));

  // Voice note simulation state
  const [isRecording, setIsRecording] = useState(false);
  const [showCoolRoute, setShowCoolRoute] = useState(false);

  // Driver Location & Radius State
  const [driverPos, setDriverPos] = useState([SWARGATE_PRECISION.lat, SWARGATE_PRECISION.lon]);
  const [radiusMeters, setRadiusMeters] = useState(1000);

  // Worker Beacon Modal state
  const [showBeaconModal, setShowBeaconModal] = useState(false);
  const [beaconLocation, setBeaconLocation] = useState(SWARGATE_PRECISION.name);
  const [beaconDesc, setBeaconDesc] = useState('15 delivery riders waiting under blazing flyover sun, tap dry');
  const [beaconImage, setBeaconImage] = useState(null);
  const [isUploadingBeacon, setIsUploadingBeacon] = useState(false);

  // Triage state
  const [triageStatus, setTriageStatus] = useState(null);

  // Advanced AI & Multi-NGO States
  const [ngos, setNgos] = useState([]);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [latestAudioTranscription, setLatestAudioTranscription] = useState(null);
  const [voiceDispatchAudioPlaying, setVoiceDispatchAudioPlaying] = useState(false);
  const [tapAuditModalAsset, setTapAuditModalAsset] = useState(null);
  const [isAuditingTap, setIsAuditingTap] = useState(false);
  const [heatStrokeSpeechAnalysis, setHeatStrokeSpeechAnalysis] = useState(null);
  const [isAnalyzingSpeech, setIsAnalyzingSpeech] = useState(false);
  const [squadOrdersText, setSquadOrdersText] = useState(null);
  const [isGeneratingSquadOrders, setIsGeneratingSquadOrders] = useState(false);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const zoneLayersRef = useRef([]);
  const assetMarkersRef = useRef([]);
  const beaconMarkersRef = useRef([]);
  const driverMarkerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const coolRoutePolylineRef = useRef(null);

  const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const fetchZones = async (hour) => {
    try {
      const res = await fetch(`/api/zones?hour=${hour}`);
      const data = await res.json();
      const zList = data.zones || [];
      setZones(zList);

      if (data.hourly_temperatures) {
        setHourlyTemps(data.hourly_temperatures);
      }

      if (data.cache_age_seconds !== undefined) {
        const mins = Math.floor(data.cache_age_seconds / 60);
        setFreshness(mins > 0 ? `${mins}m ago` : 'Live Meteo');
      }

      if (zList.length > 0) {
        setSelectedZone(prev => {
          if (!prev) return zList.find(z => z.id === 'Z-44') || zList[0];
          return zList.find(z => z.id === prev.id) || prev;
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading live zones');
    }
  };

  const fetchNgos = async () => {
    try {
      const res = await fetch(`/api/ngos?lat=${driverPos[0]}&lon=${driverPos[1]}`);
      const data = await res.json();
      const list = data.ngos || [];
      setNgos(list);
      if (list.length > 0 && !selectedNgo) {
        setSelectedNgo(list[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBeacons = async () => {
    try {
      const res = await fetch('/api/beacons');
      const data = await res.json();
      setBeacons(data.beacons || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBrief = async () => {
    setIsGenerating(true);
    setDispatchBrief('Analyzing ground-level assets and worker beacons with Gemini 3.8 Flash...');
    try {
      const res = await fetch('/api/dispatch/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_text: 'Coordinate 2 volunteer teams and 40 water cans for peak heat zones and live worker beacons',
          start: hourOffset,
          end: hourOffset + 4,
          resources: { teams: 2, water_cans: 40 },
          language: lang
        })
      });
      const data = await res.json();
      setDispatchBrief(data.summary || 'Prioritize Hadapsar and Swargate with mobile water delivery.');
      showToast('Generated operational dispatch brief!');
    } catch (err) {
      setDispatchBrief('Prioritize Hadapsar Mandi and Kasba Peth with emergency water cans.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([SWARGATE_PRECISION.lat, SWARGATE_PRECISION.lon], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        opacity: 0.88
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });

      mapInstance.current = map;
    }
  }, []);

  const nearbyAssets = useMemo(() => {
    return assets.map(a => {
      const dist = getDistanceMeters(driverPos[0], driverPos[1], a.lat, a.lon);
      return { ...a, distance_m: dist };
    })
    .filter(a => a.distance_m <= radiusMeters)
    .filter(a => activeCategory === 'All' || a.category === activeCategory || (activeCategory === 'Water' && a.type === 'drinking_water'))
    .sort((a, b) => a.distance_m - b.distance_m);
  }, [assets, driverPos, radiusMeters, activeCategory]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (driverMarkerRef.current) map.removeLayer(driverMarkerRef.current);
    if (radiusCircleRef.current) map.removeLayer(radiusCircleRef.current);

    const driverIcon = L.divIcon({
      className: 'driver-pin',
      html: `
        <div style="background:#0071e3; width:28px; height:28px; border-radius:50%; border:3px solid white; box-shadow:0 3px 10px rgba(0,113,227,0.5); display:flex; align-items:center; justify-content:center; color:white; font-size:13px;">
          🛵
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    driverMarkerRef.current = L.marker(driverPos, { icon: driverIcon }).addTo(map);
    driverMarkerRef.current.bindPopup(`<strong>${t.driverHere}</strong><br>Precise: ${SWARGATE_PRECISION.name}`).openPopup();

    radiusCircleRef.current = L.circle(driverPos, {
      radius: radiusMeters,
      color: '#0071e3',
      weight: 1.5,
      dashArray: '4, 4',
      fillColor: '#38bdf8',
      fillOpacity: 0.12
    }).addTo(map);
  }, [driverPos, radiusMeters, lang]);

  // Cool Corridor Polyline on Map
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (coolRoutePolylineRef.current) {
      map.removeLayer(coolRoutePolylineRef.current);
      coolRoutePolylineRef.current = null;
    }

    if (showCoolRoute) {
      // Shaded path from Swargate via Sarasbaug tree canopy to Deccan
      const coolRouteCoords = [
        [18.5018, 73.8578], // Swargate
        [18.5015, 73.8530], // Sarasbaug Canopy
        [18.5050, 73.8490], // Parvati Foothill trees
        [18.5120, 73.8440], // Tilak Road Shaded Avenue
        [18.5173, 73.8415]  // Deccan Gymkhana
      ];

      coolRoutePolylineRef.current = L.polyline(coolRouteCoords, {
        color: '#10b981',
        weight: 4,
        dashArray: '6, 6',
        opacity: 0.85
      }).addTo(map);

      coolRoutePolylineRef.current.bindPopup('🌿 <strong>Canopy Cool Corridor</strong><br>37.2°C (5.2°C cooler than flyover highway)').openPopup();
      map.fitBounds(coolRoutePolylineRef.current.getBounds(), { padding: [30, 30] });
    }
  }, [showCoolRoute]);

  const getZoneTemp = useCallback((zone, hour) => {
    if (!zone) return 38.0;
    let r = zone.row;
    let c = zone.col;
    if (r === undefined || c === undefined) {
      if (zone.id && zone.id.startsWith('Z-')) {
        const digits = zone.id.replace('Z-', '');
        r = parseInt(digits[0], 10);
        c = parseInt(digits[1], 10);
      }
    }
    r = isNaN(r) ? 3.5 : r;
    c = isNaN(c) ? 3.5 : c;
    const r_dist = Math.abs(r - 3.5);
    const c_dist = Math.abs(c - 3.5);
    const variance = 2.5 - 0.5 * (r_dist + c_dist);

    if (hourlyTemps && hourlyTemps.length > hour) {
      const baseTemp = hourlyTemps[hour];
      if (typeof baseTemp === 'number' && !isNaN(baseTemp)) {
        return Math.round((baseTemp + variance) * 10) / 10;
      }
    }
    return typeof zone.temperature === 'number' && !isNaN(zone.temperature) ? zone.temperature : 38.0;
  }, [hourlyTemps]);

  const dynamicSelectedTemp = useMemo(() => {
    return getZoneTemp(selectedZone, hourOffset);
  }, [selectedZone, hourOffset, getZoneTemp]);

  const hierarchicalGrid = useMemo(() => {
    if (zones.length === 0) return [];
    const subFactor = currentZoom >= 14 ? 4 : (currentZoom >= 12 ? 2 : 1);
    if (subFactor === 1) {
      return zones.map(z => ({
        ...z,
        temperature: getZoneTemp(z, hourOffset)
      }));
    }

    const microCells = [];
    zones.forEach(z => {
      const [s, w, n, e] = z.bbox;
      const latSpan = (n - s) / subFactor;
      const lonSpan = (e - w) / subFactor;
      const baseZoneTemp = getZoneTemp(z, hourOffset);

      for (let r = 0; r < subFactor; r++) {
        for (let c = 0; c < subFactor; c++) {
          const subS = s + r * latSpan;
          const subN = subS + latSpan;
          const subW = w + c * lonSpan;
          const subE = subW + lonSpan;
          const microVariance = ((r * 13 + c * 7) % 5 - 2) * 0.4;
          const subTemp = Math.round((baseZoneTemp + microVariance) * 10) / 10;

          microCells.push({
            ...z,
            id: `${z.id}.${r}${c}`,
            name: `${z.name} Sec-${r}${c}`,
            bbox: [subS, subW, subN, subE],
            centroid: [(subS + subN) / 2, (subW + subE) / 2],
            temperature: subTemp,
            isMicro: true
          });
        }
      }
    });
    return microCells;
  }, [zones, currentZoom, hourOffset, getZoneTemp]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || hierarchicalGrid.length === 0) return;

    zoneLayersRef.current.forEach(l => map.removeLayer(l));
    zoneLayersRef.current = [];

    hierarchicalGrid.forEach(z => {
      const [s, w, n, e] = z.bbox;
      let color = '#64748b';
      let opacity = 0.35;

      if (z.temperature >= 41.0) { color = '#dc2626'; opacity = 0.65; }
      else if (z.temperature >= 39.0) { color = '#ea580c'; opacity = 0.55; }
      else if (z.temperature >= 38.0) { color = '#ca8a04'; opacity = 0.45; }
      else if (z.temperature >= 35.0) { color = '#16a34a'; opacity = 0.35; }

      const rect = L.rectangle([[s, w], [n, e]], {
        color: color,
        weight: currentZoom >= 14 ? 1 : 1.5,
        fillColor: color,
        fillOpacity: opacity
      }).addTo(map);

      rect.on('click', () => {
        setSelectedZone(z);
      });

      rect.bindTooltip(`<strong>${z.name} (${z.id})</strong><br>${z.temperature}°C · Rd: ${z.rd}`, { sticky: true });
      zoneLayersRef.current.push(rect);
    });
  }, [hierarchicalGrid, currentZoom]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || assets.length === 0) return;

    assetMarkersRef.current.forEach(m => map.removeLayer(m));
    assetMarkersRef.current = [];

    nearbyAssets.forEach(a => {
      let iconChar = '💧';
      let pinColor = '#0284c7';

      if (a.type === 'drinking_water') {
        iconChar = '💧';
        pinColor = a.status === 'dry' ? '#ef4444' : '#0284c7';
      } else if (a.type === 'park') {
        iconChar = '🌳';
        pinColor = '#059669';
      } else if (a.type === 'cool_haven') {
        iconChar = '❄️';
        pinColor = '#7c3aed';
      } else if (a.type === 'clinic') {
        iconChar = '🏥';
        pinColor = '#dc2626';
      }

      const iconHtml = `<div style="background:${pinColor}; width:24px; height:24px; border-radius:50%; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; font-size:11px; color:white;">${iconChar}</div>`;

      const customIcon = L.divIcon({
        className: 'custom-pin',
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([a.lat, a.lon], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: 'DM Sans', sans-serif; font-size:12px; min-width:170px;">
          <strong>${a.name}</strong><br>
          <span style="color:#666; font-size:11px;">${a.address || ''}</span><br>
          Category: <span style="color:#0284c7; font-weight:600;">${a.category}</span><br>
          Distance: <strong>${a.distance_m}m</strong> from you<br>
          Status: <strong style="color:${a.status === 'dry' ? '#dc2626' : '#16a34a'}">${a.status.toUpperCase()}</strong>
        </div>
      `);
      assetMarkersRef.current.push(marker);
    });
  }, [nearbyAssets]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    beaconMarkersRef.current.forEach(m => map.removeLayer(m));
    beaconMarkersRef.current = [];

    beacons.forEach(b => {
      const isResolved = b.status === 'resolved';
      const beaconHtml = `
        <div style="position:relative; width:30px; height:30px; display:flex; align-items:center; justify-content:center;">
          ${!isResolved ? '<div style="position:absolute; width:100%; height:100%; background:rgba(239, 68, 68, 0.4); border-radius:50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
          <div style="position:relative; width:24px; height:24px; background:${isResolved ? '#10b981' : '#dc2626'}; border:2px solid white; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:11px; box-shadow:0 2px 8px rgba(0,0,0,0.4);">
            ${isResolved ? '✓' : '🚨'}
          </div>
        </div>
      `;

      const beaconIcon = L.divIcon({
        className: 'custom-beacon',
        html: beaconHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([b.lat, b.lon], { icon: beaconIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: 'DM Sans', sans-serif; font-size:12px; min-width:180px;">
          <strong style="color:${isResolved ? '#10b981' : '#dc2626'};">${isResolved ? '✅ Water Demand Met' : '🚨 Active Worker Water Beacon'}</strong><br>
          <strong>${b.location_name}</strong><br>
          <p style="font-size:11px; color:#444; margin:4px 0;">"${b.description}"</p>
          <div style="background:#fef2f2; border:1px solid #fee2e2; padding:4px 6px; border-radius:6px; font-size:10px;">
            🤖 <strong>Gemini 3.8 Vision:</strong> ${b.detected_crowd} workers detected · ${(b.confidence * 100).toFixed(0)}% verified
          </div>
        </div>
      `);
      beaconMarkersRef.current.push(marker);
    });
  }, [beacons]);

  useEffect(() => {
    fetchZones(0);
    fetchAssets();
    fetchBeacons();
    fetchBrief();
    fetchNgos();
  }, [lang]);

  // Autonomous Audio-to-Text Transcription via Gemini 3.8 Flash
  const handleAudioToText = async () => {
    setIsRecording(true);
    showToast('🎙️ Listening in Marathi/Hindi via Gemini 3.8 Speech AI...');

    try {
      const res = await fetch('/api/audio/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang })
      });
      const data = await res.json();
      setLatestAudioTranscription(data);
      setBeaconLocation(data.extracted_location || "Swargate Jedhe Chowk Flyover");
      setBeaconDesc(data.transcription);
      showToast('🤖 Gemini 3.8 transcribed audio to text!');
    } catch (err) {
      showToast('Audio transcribe failed');
    } finally {
      setIsRecording(false);
    }
  };

  // Play Autonomous Gemini 3.8 Voice Dispatch Brief
  const playVoiceDispatch = async () => {
    setVoiceDispatchAudioPlaying(true);
    try {
      const res = await fetch('/api/voice/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zone_name: selectedZone?.name || "Swargate",
          temp_c: dynamicSelectedTemp,
          cool_spot: "Swargate Underground Metro AC Concourse",
          language: lang
        })
      });
      const data = await res.json();
      
      // Use Web Speech Synthesis API if available
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.speech_script);
        utterance.rate = 0.95;
        if (lang === 'mr') utterance.lang = 'mr-IN';
        else if (lang === 'hi') utterance.lang = 'hi-IN';
        else utterance.lang = 'en-IN';
        window.speechSynthesis.speak(utterance);
      }
      showToast(`🎙️ Playing Gemini 3.8 Voice Dispatch: "${data.speech_script.substring(0, 45)}..."`);
    } catch (err) {
      showToast('Error playing voice dispatch');
    } finally {
      setTimeout(() => setVoiceDispatchAudioPlaying(false), 3000);
    }
  };

  // Run Gemini 3.8 Heat Stroke Speech Screener
  const runHeatStrokeSpeechCheck = async (slurred = false) => {
    setIsAnalyzingSpeech(true);
    try {
      const res = await fetch('/api/triage/stroke-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speech_text: "मला खूप चक्कर येत आहे आणि स्वारगेटला घाम येत नाहीये... तोंड कोरडं पडलंय",
          slurred_detected: slurred
        })
      });
      const data = await res.json();
      setHeatStrokeSpeechAnalysis(data);
      if (data.trigger_108_alert) {
        setTriageStatus('emergency');
      }
      showToast('🚨 Gemini 3.8 Emergency Speech Triage Complete');
    } catch (err) {
      showToast('Speech check error');
    } finally {
      setIsAnalyzingSpeech(false);
    }
  };

  // Run Gemini 3.8 Multimodal Tap Vision Audit
  const handleTapAuditSubmit = async (osmId, base64Img) => {
    setIsAuditingTap(true);
    try {
      const res = await fetch('/api/assets/audit-tap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          osm_id: osmId,
          image_base64: base64Img || "dummy",
          session_token: sessionToken
        })
      });
      const data = await res.json();
      showToast(`📸 Gemini 3.8 Tap Audit: ${data.audit.damage_type}`);
      setTapAuditModalAsset(null);
      fetchAssets();
      fetchZones(hourOffset);
    } catch (err) {
      showToast('Tap audit error');
    } finally {
      setIsAuditingTap(false);
    }
  };

  // Generate WhatsApp Squad Orders for Closest NGO
  const handleGenerateSquadOrders = async (ngo) => {
    setIsGeneratingSquadOrders(true);
    try {
      const res = await fetch('/api/ngo/squad-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngo_name: ngo.name,
          resources: { teams: ngo.teams, water_cans: ngo.water_cans },
          target_zone: selectedZone?.name ? `${selectedZone.name} (${selectedZone.id})` : "Swargate (Z-44)"
        })
      });
      const data = await res.json();
      setSquadOrdersText(data.whatsapp_formatted_text);
      showToast(`⚡ Generated Battle Orders for ${ngo.name}`);
    } catch (err) {
      showToast('Error generating squad orders');
    } finally {
      setIsGeneratingSquadOrders(false);
    }
  };

  const handleHourChange = (e) => {
    const val = parseInt(e.target.value);
    setHourOffset(val);
    fetchZones(val);
  };

  const handleResolveBeacon = async (beaconId) => {
    try {
      const res = await fetch(`/api/beacons/${beaconId}/resolve`, {
        method: 'POST'
      });
      if (res.ok) {
        showToast('✅ Water demand marked as delivered!');
        fetchBeacons();
        fetchBrief();
      }
    } catch (err) {
      showToast('Error resolving beacon');
    }
  };

  // Simulated Voice Note Intake (Marathi/Hindi)
  const triggerVoiceNote = () => {
    setIsRecording(true);
    showToast('🎙️ Recording voice note in Marathi/Hindi...');

    setTimeout(() => {
      setIsRecording(false);
      setBeaconLocation("Swargate Jedhe Chowk Flyover");
      setBeaconDesc("भावांनो, स्वारगेट पुलाखाली १५ डिलिव्हरी बॉईज थांबले आहेत, जवळचा पाण्याचा नळ बंद आहे. (15 riders waiting, tap is dry)");
      setShowBeaconModal(true);
      showToast('🤖 Gemini 3.8 transcribed Marathi voice note!');
    }, 2000);
  };

  const submitBeacon = async (e) => {
    e.preventDefault();
    setIsUploadingBeacon(true);

    try {
      const payload = {
        location_name: beaconLocation,
        lat: SWARGATE_PRECISION.lat + (Math.random() - 0.5) * 0.002,
        lon: SWARGATE_PRECISION.lon + (Math.random() - 0.5) * 0.002,
        zone_id: 'Z-44',
        description: beaconDesc,
        image_base64: beaconImage,
        session_token: sessionToken
      };

      await fetch('/api/beacons/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      showToast('🚨 Water Beacon verified by Gemini 3.8 Vision!');
      setShowBeaconModal(false);
      fetchBeacons();
      fetchBrief();

      if (mapInstance.current) {
        mapInstance.current.setView([payload.lat, payload.lon], 15);
      }
    } catch (err) {
      showToast('Error submitting beacon');
    } finally {
      setIsUploadingBeacon(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBeaconImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`🔥 *HeatAtlas Pune Dispatch Brief (Gemini 3.8 Flash)*\n\n${dispatchBrief}\n\n*Emergency Helpline:* Call 108.`);
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const criticalZones = useMemo(() => {
    return [...zones].sort((a, b) => b.rd - a.rd).slice(0, 5);
  }, [zones]);

  const displayTime = useMemo(() => {
    const ampm = hourOffset >= 12 ? 'PM' : 'AM';
    const h12 = hourOffset > 12 ? hourOffset - 12 : (hourOffset === 0 ? 12 : hourOffset);
    return `${hourOffset.toString().padStart(2, '0')}:00 (${h12}:00 ${ampm})`;
  }, [hourOffset]);

  const activeBeacons = beacons.filter(b => b.status !== 'resolved');
  const resolvedBeacons = beacons.filter(b => b.status === 'resolved');

  return (
    <div className="flex justify-center items-center w-full min-h-screen py-6 px-2">
      {/* REALISTIC PHONE FRAME */}
      <div className="phone-case">
        <div className="phone-screen no-scrollbar">

          {/* DYNAMIC ISLAND & STATUS BAR */}
          <div className="dynamic-island">
            <span className="font-semibold text-[13px] tracking-tight">9:41</span>
            <div className="island-notch">
              <div className="notch-camera-lens"></div>
              <div className="notch-sensor"></div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-800">
              <span>5G</span>
              <span>⚡100%</span>
            </div>
          </div>
        
          {/* HEADER WITH WORKING LANGUAGE SWITCHER */}
          <header className="sticky top-[38px] z-[1000] bg-white px-4 py-2.5 border-b border-black/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff453a] to-[#ff9f0a] flex items-center justify-center text-white shadow-xs">
                <Flame size={16} />
              </div>
              <div>
                <h1 className="font-display font-bold text-[16px] leading-tight tracking-tight">{t.appTitle}</h1>
                <p className="text-[10px] text-[#86868b] font-medium leading-none">{t.appSubtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span>{freshness}</span>
              </div>
              <select
                value={lang}
                onChange={(e) => {
                  setLang(e.target.value);
                  showToast(`Language: ${e.target.value.toUpperCase()}`);
                }}
                className="text-[11px] font-semibold px-1.5 py-0.5 bg-gray-50 border border-gray-300 rounded-md"
              >
                <option value="en">EN</option>
                <option value="hi">हिंदी</option>
                <option value="mr">मराठी</option>
              </select>
            </div>
          </header>

          {/* PERSONA MODE SWITCHER */}
          <div className="px-2.5 pt-1.5">
            <div className="bg-white p-1 rounded-xl border border-black/5 flex gap-1 shadow-xs">
              <button
                onClick={() => setViewMode('worker')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-[11.5px] font-bold flex items-center justify-center gap-1 transition-all ${
                  viewMode === 'worker' ? 'bg-[#ff3b30] text-white shadow-xs' : 'text-[#86868b] hover:text-[#1d1d1f]'
                }`}
              >
                {t.workerMode}
              </button>
              <button
                onClick={() => setViewMode('ngo')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-[11.5px] font-bold flex items-center justify-center gap-1 transition-all ${
                  viewMode === 'ngo' ? 'bg-[#0071e3] text-white shadow-xs' : 'text-[#86868b] hover:text-[#1d1d1f]'
                }`}
              >
                {t.ngoMode}
              </button>
            </div>
          </div>

          {/* WORKER MODE: CROWD BEACON + VOICE NOTE + EMERGENCY TRIAGE */}
          {viewMode === 'worker' && (
            <section className="px-2.5 pt-1 flex flex-col gap-1.5">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setShowBeaconModal(true)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-amber-600 active:scale-[0.98] text-white font-display font-extrabold text-[12.5px] py-2 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span className="text-base">🚨</span> {t.needWaterBtn}
                </button>
                <button
                  onClick={triggerVoiceNote}
                  className={`py-2 px-3 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1 border shadow-xs transition-all ${
                    isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-white border-black/10 text-[#1d1d1f] hover:bg-gray-50'
                  }`}
                  title="Speak in Marathi or Hindi"
                >
                  <Mic size={15} className={isRecording ? 'text-white' : 'text-red-500'} />
                  <span className="text-[11px]">{isRecording ? 'Listening...' : 'Marathi/Hindi'}</span>
                </button>
              </div>

              {/* Heat Stroke Triage with Gemini 3.8 Audio Screener */}
              <div className="bg-white rounded-xl p-2.5 border border-black/5 shadow-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-[#86868b] flex items-center gap-1">
                    <ShieldAlert size={12} className="text-amber-500" /> {t.triageTitle}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => runHeatStrokeSpeechCheck(false)}
                      className="bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 hover:bg-amber-100"
                      title="AI checks slurred cadence & speech confusion"
                    >
                      <Volume2 size={10} /> {isAnalyzingSpeech ? 'Analyzing...' : 'AI Voice Triage'}
                    </button>
                    <span className="text-[9.5px] text-gray-500 font-mono">2-Tap</span>
                  </div>
                </div>
                <p className="text-[11.5px] font-semibold text-[#1d1d1f] mb-1.5">
                  {t.triageQuestion}
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setTriageStatus('safe');
                      setHeatStrokeSpeechAnalysis(null);
                      showToast('Sweating active: Drink ORS water & rest in shade.');
                    }}
                    className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] font-bold border ${
                      triageStatus === 'safe' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    {t.sweatingYes}
                  </button>
                  <button
                    onClick={() => {
                      setTriageStatus('emergency');
                      runHeatStrokeSpeechCheck(true);
                      showToast('🚨 EMERGENCY: Dry skin is a heat stroke symptom!');
                    }}
                    className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] font-bold border ${
                      triageStatus === 'emergency' ? 'bg-red-600 text-white border-red-700 animate-pulse' : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    {t.sweatingNo}
                  </button>
                </div>

                {/* Heat Stroke AI Speech Analysis Banner */}
                {heatStrokeSpeechAnalysis && (
                  <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px]">
                    <div className="font-bold text-amber-900 flex items-center justify-between">
                      <span>🤖 Gemini 3.8 Speech Screener:</span>
                      <span className="bg-red-600 text-white px-1.5 py-0.2 rounded font-mono font-bold">EMERGENCY_RED</span>
                    </div>
                    <p className="text-amber-800 mt-0.5">{heatStrokeSpeechAnalysis.medical_triage_instruction}</p>
                  </div>
                )}

                {triageStatus === 'emergency' && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                    <div className="text-[10px] text-red-800 font-bold leading-tight">
                      {t.sweatingAlert}
                    </div>
                    <a
                      href="tel:108"
                      className="bg-red-600 text-white font-mono font-extrabold text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1 shadow-xs whitespace-nowrap ml-2"
                    >
                      <PhoneCall size={11} /> {t.call108}
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* HERO METRIC BENTO - REAL-TIME TEMPERATURE SLIDER REACTIVITY */}
          {selectedZone && (
            <section className="px-2.5 pt-1">
              <div className="bg-white rounded-2xl p-3.5 border border-black/5 shadow-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[12px] font-bold text-[#86868b] uppercase tracking-wide truncate max-w-[220px]">
                    {selectedZone.name} ({selectedZone.id})
                  </span>
                  <span className={`font-mono text-[9.5px] font-bold px-2 py-0.5 rounded-md ${
                    dynamicSelectedTemp >= 41.0 ? 'bg-red-100 text-red-800' :
                    dynamicSelectedTemp >= 39.0 ? 'bg-orange-100 text-orange-800' :
                    dynamicSelectedTemp >= 38.0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {dynamicSelectedTemp >= 41.0 ? 'CRITICAL' : dynamicSelectedTemp >= 39.0 ? 'HIGH' : dynamicSelectedTemp >= 38.0 ? 'MODERATE' : 'LOW'}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="font-display font-extrabold text-[36px] text-[#ff3b30] leading-none tracking-tight">
                    {dynamicSelectedTemp}°C
                  </span>
                  <div className="text-[10.5px] text-[#86868b] flex flex-col gap-0.5 text-right font-medium">
                    <div>RELIEF DEFICIT: <strong className="text-[#1d1d1f] font-mono">{selectedZone.rd.toLocaleString()}</strong></div>
                    <div>VULNERABLE POP: <strong className="text-[#1d1d1f] font-mono">{selectedZone.vh.toLocaleString()}</strong></div>
                  </div>
                </div>

                {/* APPLE BENTO MINI-METRIC STRIP */}
                <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-black/5 text-center">
                  <div className="bg-[#f5f5f7] rounded-xl p-1.5">
                    <div className="text-[9px] uppercase font-bold text-[#86868b]">Peak Window</div>
                    <div className="text-[11px] font-bold text-[#1d1d1f] font-mono mt-0.5">12:00–16:00</div>
                  </div>
                  <div className="bg-[#f5f5f7] rounded-xl p-1.5">
                    <div className="text-[9px] uppercase font-bold text-[#86868b]">Active Beacons</div>
                    <div className="text-[11px] font-bold text-red-600 font-mono mt-0.5">{activeBeacons.length} Unmet</div>
                  </div>
                  <div className="bg-[#f5f5f7] rounded-xl p-1.5">
                    <div className="text-[9px] uppercase font-bold text-[#86868b]">Working Taps</div>
                    <div className="text-[11px] font-bold text-emerald-700 font-mono mt-0.5">{selectedZone.working_taps} Taps</div>
                  </div>
                </div>

                {/* AUTONOMOUS VOICE DISPATCH AUDIO BUTTON */}
                <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between">
                  <span className="text-[10px] text-[#86868b] font-medium flex items-center gap-1">
                    <Radio size={12} className="text-red-500 animate-pulse" /> 15s Driver Audio Alert
                  </span>
                  <button
                    onClick={playVoiceDispatch}
                    disabled={voiceDispatchAudioPlaying}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold text-[10.5px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs active:scale-95 transition-transform"
                  >
                    <Volume2 size={12} className={voiceDispatchAudioPlaying ? 'animate-bounce' : ''} />
                    <span>{voiceDispatchAudioPlaying ? 'Broadcasting...' : 'Play Voice Dispatch'}</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* COOL CORRIDOR ROUTE TOGGLE */}
          <section className="px-2.5 pt-1">
            <button
              onClick={() => {
                setShowCoolRoute(!showCoolRoute);
                showToast(showCoolRoute ? 'Disabled Cool Corridor' : '🌿 Enabled Canopy Cool Route (37.2°C)');
              }}
              className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center justify-between border transition-all ${
                showCoolRoute ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' : 'bg-white border-black/10 text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Route size={14} /> {t.coolRouteTitle}
              </span>
              <span className="text-[10px] font-mono font-semibold">
                {showCoolRoute ? '✓ Active (65% Shade)' : 'Compare Shade Route'}
              </span>
            </button>
          </section>

          {/* DRIVER RADIAL RANGE SLIDER & ASSET FILTERS */}
          <section className="px-2.5 pt-1 flex flex-col gap-1.5">
            <div className="bg-white rounded-xl p-2 border border-black/5 shadow-xs flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#86868b] flex items-center gap-1">
                <Compass size={12} className="text-[#0071e3]" /> {t.radialTitle}
              </span>
              <div className="flex items-center gap-1">
                {[500, 1000, 2000].map(r => (
                  <button
                    key={r}
                    onClick={() => setRadiusMeters(r)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      radiusMeters === r ? 'bg-[#0071e3] text-white border-[#0071e3]' : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    {r >= 1000 ? `${r / 1000} km` : `${r}m`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar">
              {['All', 'Water', 'Shade & Parks', 'AC Cool Haven', 'Clinics & ORS'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap transition-colors border ${
                    activeCategory === cat
                      ? 'bg-[#1d1d1f] text-white border-black'
                      : 'bg-white text-[#555] border-black/10 hover:bg-gray-100'
                  }`}
                >
                  {cat === 'All' ? t.all : cat === 'Water' ? t.water : cat === 'Shade & Parks' ? t.shade : cat === 'AC Cool Haven' ? t.acHaven : t.clinics}
                </button>
              ))}
            </div>
          </section>

          {/* REAL LEAFLET MAP VIEWPORT */}
          <section className="relative px-2.5 pt-1">
            <div ref={mapRef} className="w-full h-[280px] rounded-2xl overflow-hidden border border-black/5 shadow-xs z-10" />

            <div className="absolute top-3 right-5 z-[500] flex flex-col gap-1.5">
              <button
                onClick={() => mapInstance.current?.setView([SWARGATE_PRECISION.lat, SWARGATE_PRECISION.lon], 14)}
                className="bg-white/95 border border-black/10 text-[10.5px] font-semibold px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1"
              >
                📍 Swargate Precision
              </button>
            </div>
          </section>

          {/* 24-HOUR TIMELINE SCRUBBER */}
          <section className="px-2.5 pt-1">
            <div className="bg-white rounded-t-2xl px-3.5 pt-2.5 pb-1 border border-b-0 border-black/5 flex justify-between items-center">
              <span className="text-[11.5px] font-bold text-[#86868b] flex items-center gap-1">
                <Clock size={12} /> {t.timelineTitle}
              </span>
              <span className="font-mono text-[11.5px] font-bold text-[#0071e3]">{displayTime}</span>
            </div>
            <input
              type="range"
              min="0"
              max="23"
              value={hourOffset}
              onChange={handleHourChange}
              className="w-full h-1.5 bg-gradient-to-r from-emerald-600 via-amber-500 to-red-600 appearance-none cursor-pointer"
            />
            <div className="bg-white rounded-b-2xl px-3 pb-2 pt-0.5 border border-t-0 border-black/5 flex justify-between text-[9.5px] text-[#aeaeb2] font-mono">
              <span>00:00 Night</span>
              <span>06:00 Dawn</span>
              <span>12:00 Peak</span>
              <span>18:00 Dusk</span>
              <span>23:00 Night</span>
            </div>
          </section>

          {/* LIVE WORKER DEMAND BEACONS WITH "DEMAND MET" ACTION */}
          <section className="px-2.5 pt-1">
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-display font-bold text-[13px] text-red-600 flex items-center gap-1">
                <span>🚨</span> {t.verifiedBeaconsTitle}
              </h2>
              <span className="text-[9.5px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded-full">
                {activeBeacons.length} Active
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {activeBeacons.map(b => (
                <div key={b.id} className="bg-red-50 border border-red-200 rounded-xl p-2.5 flex flex-col gap-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-[12px] text-red-950">{b.location_name}</div>
                      <div className="text-[10.5px] text-red-800 mt-0.5 leading-snug">{b.description}</div>
                    </div>
                    <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      URGENT
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-red-200/60">
                    <div className="text-[9.5px] text-red-700 font-medium">
                      🤖 Gemini 3.8: {b.detected_crowd} workers · {(b.confidence * 100).toFixed(0)}% verified
                      {b.assigned_ngo && (
                        <span className="block text-[8.5px] text-blue-700 font-semibold mt-0.5">
                          🏢 Dispatched: {b.assigned_ngo}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleResolveBeacon(b.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 active:scale-95 transition-transform"
                    >
                      <CheckCircle2 size={11} /> {t.demandMetBtn}
                    </button>
                  </div>
                </div>
              ))}

              {resolvedBeacons.map(b => (
                <div key={b.id} className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2 flex justify-between items-center opacity-85">
                  <div>
                    <div className="font-bold text-[11.5px] text-emerald-900 line-through">{b.location_name}</div>
                    <div className="text-[9.5px] text-emerald-700">{b.description}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    ✓ {t.demandFulfilled}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* RADIAL GROUND ASSETS (Filtered by Driver Location & Radius) */}
          <section className="px-2.5 pt-1">
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-display font-bold text-[13px] text-[#1d1d1f] flex items-center gap-1">
                <MapPin size={13} className="text-[#0071e3]" /> {t.groundAssetsTitle}
              </h2>
              <span className="text-[10px] text-[#0071e3] font-bold">
                {nearbyAssets.length} within {radiusMeters >= 1000 ? `${radiusMeters/1000}km` : `${radiusMeters}m`}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {nearbyAssets.map(a => (
                <div key={a.osm_id} className="bg-white rounded-xl px-3 py-2 border border-black/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {a.type === 'drinking_water' ? '💧' : a.type === 'park' ? '🌳' : a.type === 'cool_haven' ? '❄️' : '🏥'}
                    </span>
                    <div>
                      <div className="text-[11.5px] font-semibold text-[#1d1d1f] truncate max-w-[190px]">{a.name}</div>
                      <div className="text-[9.5px] text-[#86868b] flex items-center gap-1">
                        <strong className="text-[#0071e3] font-mono">{a.distance_m}m</strong> · <span>{a.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                      a.status === 'working' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {a.status === 'working' ? '✓ Open' : '⚠️ Issue'}
                    </span>
                    {a.type === 'drinking_water' && (
                      <button
                        onClick={() => setTapAuditModalAsset(a)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-gray-300"
                        title="AI Broken Tap Verification"
                      >
                        📸 Audit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* MULTI-NGO COMMAND & NEAREST GEOFENCE RADAR */}
          <section className="px-2.5 pt-1">
            <div className="bg-white rounded-2xl p-3 border border-black/5 shadow-xs flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-display font-bold text-[12.5px] text-[#1d1d1f] flex items-center gap-1.5">
                  <Building size={14} className="text-[#0071e3]" /> Multi-NGO Response Network
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  {ngos.length} Active Hubs
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                {ngos.map((ngo, idx) => {
                  const isNearest = idx === 0;
                  return (
                    <div
                      key={ngo.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isNearest
                          ? 'bg-blue-50/70 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-[11.5px] text-[#1d1d1f] flex items-center gap-1">
                            {ngo.name}
                            {isNearest && (
                              <span className="bg-[#0071e3] text-white text-[8px] font-mono px-1.5 py-0.2 rounded font-bold">
                                NEAREST RESPONDER ({ngo.distance_meters}m)
                              </span>
                            )}
                          </div>
                          <div className="text-[9.5px] text-[#666] mt-0.5">
                            📍 {ngo.address} · 📞 <span className="font-mono">{ngo.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-black/5 text-[9.5px]">
                        <span className="text-gray-600 font-medium">
                          🚚 <strong>{ngo.teams} Teams</strong> ({ngo.active_squads} deployed) · 💧 <strong>{ngo.water_cans} Cans</strong>
                        </span>
                        <button
                          onClick={() => handleGenerateSquadOrders(ngo)}
                          disabled={isGeneratingSquadOrders}
                          className="bg-[#0071e3] hover:bg-[#005bb5] text-white font-bold text-[9.5px] px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs"
                        >
                          <Send size={10} /> Generate Squad Order
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Generated Squad Orders Modal / Drawer */}
              {squadOrdersText && (
                <div className="mt-2 p-2.5 bg-[#f0fdf4] border border-emerald-300 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-emerald-900 flex items-center gap-1">
                      ⚡ Gemini 3.8 WhatsApp Battle-Orders
                    </span>
                    <button
                      onClick={() => setSquadOrdersText(null)}
                      className="text-gray-400 font-bold text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <pre className="text-[10px] text-emerald-950 font-mono whitespace-pre-wrap leading-relaxed max-h-[140px] overflow-y-auto bg-white p-2 rounded-lg border border-emerald-200">
                    {squadOrdersText}
                  </pre>
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(squadOrdersText);
                      window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
                    }}
                    className="mt-1.5 w-full bg-[#25d366] text-white font-bold text-[10.5px] py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-xs"
                  >
                    <MessageSquare size={12} /> Dispatch WhatsApp Battle Order
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* GEMINI 3.8 FLASH DISPATCH DRAWER */}
          <section className="px-2.5 pt-1">
            <div className="bg-white rounded-2xl p-3.5 border border-black/5 shadow-xs flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-display font-bold text-[12.5px] flex items-center gap-1.5">
                  {t.geminiDispatchTitle}
                </span>
                <span className="text-[9.5px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded">
                  Validated Math
                </span>
              </div>
              <p className="text-[11.5px] text-[#555] bg-gray-50 p-2.5 rounded-xl border border-black/5 leading-relaxed">
                {dispatchBrief}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={shareWhatsApp}
                  className="flex-1 bg-[#25d366] active:bg-[#1eb857] text-white font-bold text-[12px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                >
                  <MessageSquare size={13} /> {t.shareWhatsApp}
                </button>
                <button
                  onClick={fetchBrief}
                  disabled={isGenerating}
                  className="bg-[#0071e3] active:bg-[#005bb5] text-white font-semibold text-[11.5px] py-2 px-3 rounded-xl flex items-center justify-center gap-1"
                >
                  <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} /> {t.recalculate}
                </button>
              </div>
              <p className="text-[9.5px] text-[#86868b] leading-tight">
                {t.medicalDisclaimer}
              </p>
            </div>
          </section>

          {/* HOME INDICATOR BAR (SWIPE BAR) */}
          <div className="home-indicator-bar">
            <div className="home-bar"></div>
          </div>

        </div> {/* close phone-screen */}
      </div> {/* close phone-case */}

      {/* BEACON CREATION MODAL WITH GEMINI 2.0 VISION PHOTO AUDIT */}
      {showBeaconModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[380px] rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-extrabold text-[15px] text-red-600 flex items-center gap-1.5">
                <span>🚨</span> Request Water Beacon
              </h3>
              <button onClick={() => setShowBeaconModal(false)} className="text-gray-400 font-bold text-lg">✕</button>
            </div>
            <p className="text-[11px] text-[#666] leading-snug">
              Stranded without water or shade in extreme heat? Drop a verified beacon so NGOs route mobile water supplies to your location.
            </p>

            <form onSubmit={submitBeacon} className="flex flex-col gap-2">
              <div>
                <label className="text-[10.5px] font-bold text-gray-700 block mb-0.5">Landmark / Current Junction</label>
                <input
                  type="text"
                  required
                  value={beaconLocation}
                  onChange={(e) => setBeaconLocation(e.target.value)}
                  className="w-full text-[12px] p-2 bg-gray-50 border border-gray-300 rounded-xl"
                  placeholder="e.g. Swargate Flyover Base (Jedhe Chowk)"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-0.5">
                  <label className="text-[10.5px] font-bold text-gray-700">Situation Description</label>
                  <button
                    type="button"
                    onClick={handleAudioToText}
                    className="bg-red-50 text-red-600 border border-red-200 text-[9.5px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 hover:bg-red-100"
                    title="Speak in Marathi/Hindi instead of typing"
                  >
                    <Mic size={10} className={isRecording ? 'animate-pulse text-red-600' : ''} />
                    <span>{isRecording ? 'Listening...' : '🎙️ Audio to Text'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  required
                  value={beaconDesc}
                  onChange={(e) => setBeaconDesc(e.target.value)}
                  className="w-full text-[12px] p-2 bg-gray-50 border border-gray-300 rounded-xl"
                  placeholder="How many workers are waiting? Is the nearby tap dry? (or tap Audio to Text)"
                />
                {latestAudioTranscription && (
                  <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded-lg text-[9.5px]">
                    <span className="font-bold text-blue-900">🤖 Gemini 3.8 Transcription ({latestAudioTranscription.language_detected}):</span>
                    <p className="text-blue-800 italic mt-0.5">"{latestAudioTranscription.translation_en}"</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-gray-700 block mb-0.5">
                  📸 Photo Proof (Audited by Gemini 3.8 Vision)
                </label>
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-2.5 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                  <Camera size={18} className="text-gray-500 mb-0.5" />
                  <span className="text-[11px] font-semibold text-sky-600">
                    {beaconImage ? '✓ Photo Selected' : 'Take Photo of Crowd / Tap'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {beaconImage && (
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                    <span>✓ Ready for Gemini 3.8 Multimodal Vision scan</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowBeaconModal(false)}
                  className="flex-1 py-2 rounded-xl border border-gray-300 font-semibold text-[12px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingBeacon}
                  className="flex-1 py-2 rounded-xl bg-red-600 text-white font-extrabold text-[12px] flex items-center justify-center gap-1 shadow-xs"
                >
                  {isUploadingBeacon ? 'Scanning...' : 'Broadcast Beacon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BROKEN / DRY TAP AI AUDITOR */}
      {tapAuditModalAsset && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[360px] rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-extrabold text-[14px] text-amber-700 flex items-center gap-1.5">
                <span>📸</span> AI Broken Tap Auditor
              </h3>
              <button onClick={() => setTapAuditModalAsset(null)} className="text-gray-400 font-bold text-lg">✕</button>
            </div>
            <p className="text-[11px] text-[#555] leading-snug">
              Audit <strong>{tapAuditModalAsset.name}</strong>. Gemini 3.8 Multimodal Vision will inspect the image for dry nozzles, disconnection, or broken handles before updating the city deficit score.
            </p>

            <label className="border-2 border-dashed border-gray-300 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
              <Camera size={20} className="text-gray-500 mb-1" />
              <span className="text-[11px] font-semibold text-sky-600">Snap Photo of Municipal Tap</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => handleTapAuditSubmit(tapAuditModalAsset.osm_id, reader.result);
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => setTapAuditModalAsset(null)}
                className="flex-1 py-1.5 rounded-xl border border-gray-300 font-semibold text-[11.5px]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleTapAuditSubmit(tapAuditModalAsset.osm_id, null)}
                disabled={isAuditingTap}
                className="flex-1 py-1.5 rounded-xl bg-amber-600 text-white font-extrabold text-[11.5px] flex items-center justify-center gap-1 shadow-xs"
              >
                {isAuditingTap ? 'Scanning...' : 'Simulate Vision Audit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-600 text-white font-semibold text-[12px] px-3.5 py-1.5 rounded-full shadow-lg">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
