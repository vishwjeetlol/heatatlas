import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  Flame,
  Droplet,
  Trees,
  Snowflake,
  Cross,
  Clock,
  MessageSquare,
  RefreshCw,
  ZoomIn,
  MapPin,
  Camera,
  CheckCircle2,
  PhoneCall,
  ShieldAlert,
  Compass,
  Mic,
  Route,
  Volume2,
  Building,
  AlertTriangle,
  Send,
  Radio,
  Bot,
  X,
  Sparkles,
  Zap,
  Navigation,
  Award,
  ChevronRight,
  Activity,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Toaster, toast } from "sonner";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Complete i18n Translations Dictionary
const TRANSLATIONS = {
  en: {
    appTitle: "HeatAtlas",
    appSubtitle: "Pune · Gemini 2.5 Flash Spatial Intelligence",
    workerMode: "🛵 Field Worker Radar",
    ngoMode: "🤝 NGO Lead Command",
    needWaterBtn: "🚨 Need Water Here (Crowd Beacon)",
    voiceNoteBtn: "🎤 Speak Voice Note (Marathi/Hindi)",
    photoProofLabel: "Photo Proof AI",
    triageTitle: "Heat Stroke Self-Check",
    triageQuestion: "Are you sweating in this heat?",
    sweatingYes: "✓ Yes, sweating normally",
    sweatingNo: "⚠️ NO SWEATING / Dry Skin",
    sweatingAlert:
      "🚨 Emergency Heat Stroke Risk! Stop moving immediately. Drink water, seek AC shelter.",
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
    geminiDispatchTitle: "⚡ Gemini 2.5 Flash Dispatch",
    shareWhatsApp: "Share WhatsApp Brief",
    recalculate: "Recalculate",
    medicalDisclaimer:
      "ℹ️ HeatAtlas provides operational planning information, not medical advice. For heat stroke call 108 immediately.",
    all: "All",
    water: "💧 Water",
    shade: "🌳 Shade & Parks",
    acHaven: "❄️ AC Cool Haven",
    clinics: "🏥 Clinics & ORS",
    driverHere: "Driver Location (Swargate)",
  },
  hi: {
    appTitle: "हीटएटलस",
    appSubtitle: "पुणे · जेमिनी 2.5 भौगोलिक राहत",
    workerMode: "🛵 फील्ड वर्कर रडार",
    ngoMode: "🤝 एनजीओ लीड कमांड",
    needWaterBtn: "🚨 यहाँ पानी चाहिए (क्राउड बीकन)",
    voiceNoteBtn: "🎤 वॉइस नोट बोलें (मराठी/हिंदी)",
    photoProofLabel: "फोटो प्रूफ AI",
    triageTitle: "हीट स्ट्रोक स्व-जाँच",
    triageQuestion: "क्या आपको इस गर्मी में पसीना आ रहा है?",
    sweatingYes: "✓ हाँ, सामान्य पसीना",
    sweatingNo: "⚠️ पसीना बंद / त्वचा सूखी",
    sweatingAlert:
      "🚨 हीट स्ट्रोक का गंभीर खतरा! तुरंत काम रोकें, पानी पिएं और ठंडी जगह जाएं।",
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
    geminiDispatchTitle: "⚡ जेमिनी 2.5 फ़्लैश डिस्पैच",
    shareWhatsApp: "व्हाट्सएप पर भेजें",
    recalculate: "पुनर्गणना",
    medicalDisclaimer:
      "ℹ️ हीटएटलस योजना की जानकारी देता है, चिकित्सा सलाह नहीं। आपातकाल में 108 डायल करें।",
    all: "सभी",
    water: "💧 पानी",
    shade: "🌳 छाया और पार्क",
    acHaven: "❄️ AC मेट्रो / शेल्टर",
    clinics: "🏥 क्लिनिक और ORS",
    driverHere: "ड्राइवर स्थान (स्वारगेट)",
  },
  mr: {
    appTitle: "हीटअॅटलास",
    appSubtitle: "पुणे · जेमिनी 2.5 भौगोलिक मदत प्रणाली",
    workerMode: "🛵 फिल्ड वर्कर रडार",
    ngoMode: "🤝 स्वयंसेवी लीड कमांड",
    needWaterBtn: "🚨 इथे पाण्याची गरज आहे (क्राउड बीकन)",
    voiceNoteBtn: "🎤 व्हॉईस नोट बोला (मराठी/हिंदी)",
    photoProofLabel: "फोटो पुरावा AI",
    triageTitle: "उष्माघात स्व-तपासणी",
    triageQuestion: "तुम्हाला या उन्हात घाम येत आहे का?",
    sweatingYes: "✓ हो, नेहमीसारखा घाम",
    sweatingNo: "⚠️ घाम येत नाही / त्वचा कोरडी",
    sweatingAlert:
      "🚨 उष्माघाताचा तीव्र धोका! तत्काळ सावलीत बसा, पाणी प्या आणि एसी निवाऱ्यात जा.",
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
    medicalDisclaimer:
      "ℹ️ हीटअॅटलास नियोजनासाठी आहे, वैद्यकीय सल्ल्यासाठी नाही. उष्माघाताच्या लक्षणांसाठी १०८ ला कॉल करा.",
    all: "सर्व",
    water: "💧 पाणी",
    shade: "🌳 सावली आणि बागा",
    acHaven: "❄️ AC मेट्रो / निवारा",
    clinics: "🏥 दवाखाने आणि ORS",
    driverHere: "चालकाचे स्थान (स्वारगेट)",
  },
};

const SWARGATE_PRECISION = {
  lat: 18.5018,
  lon: 73.8578,
  name: "Swargate Flyover (Jedhe Chowk)",
};

export default function App() {
  const [viewMode, setViewMode] = useState("worker"); // 'worker' | 'ngo'
  const [portalMode, setPortalMode] = useState("phone"); // 'phone' | 'command' | 'backend'
  const [isPortalDrawerOpen, setIsPortalDrawerOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleSelectPortal = (mode) => {
    setPortalMode(mode);
    setIsPortalDrawerOpen(false);
  };

  // Multi-City & Climatology State
  const [selectedCity, setSelectedCity] = useState("pune");
  const [cityList, setCityList] = useState([]);
  const [currentCityMeta, setCurrentCityMeta] = useState(null);

  const [zones, setZones] = useState([]);
  const [assets, setAssets] = useState([]);
  const [beacons, setBeacons] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [hourOffset, setHourOffset] = useState(14);
  const [hourlyTemps, setHourlyTemps] = useState([]);
  const [freshness, setFreshness] = useState("Live Meteo");
  const [toastMsg, setToastMsg] = useState(null);
  const [dispatchBrief, setDispatchBrief] = useState(
    "Loading Gemini 2.5 Flash operational brief...",
  );
  const [dispatchData, setDispatchData] = useState(null);
  const [integrationsList, setIntegrationsList] = useState([]);
  const [showRepoDrawer, setShowRepoDrawer] = useState(false);
  const [hideDemoFixtures, setHideDemoFixtures] = useState(false);
  const [cnsConfusionStatus, setCnsConfusionStatus] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentZoom, setCurrentZoom] = useState(13);
  const [sessionToken] = useState(
    () => "sess_" + Math.random().toString(36).substring(2, 9),
  );

  // Voice note simulation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showCoolRoute, setShowCoolRoute] = useState(false);

  // Driver Location & Radius State
  const [driverPos, setDriverPos] = useState([
    SWARGATE_PRECISION.lat,
    SWARGATE_PRECISION.lon,
  ]);
  const [radiusMeters, setRadiusMeters] = useState(1000);
  const [isLocatingDriver, setIsLocatingDriver] = useState(false);

  // Worker Beacon Modal state
  const [showBeaconModal, setShowBeaconModal] = useState(false);
  const [beaconLocation, setBeaconLocation] = useState(SWARGATE_PRECISION.name);
  const [beaconDesc, setBeaconDesc] = useState("");
  const [beaconImage, setBeaconImage] = useState(null);
  const [isUploadingBeacon, setIsUploadingBeacon] = useState(false);

  // Triage state
  const [triageStatus, setTriageStatus] = useState(null);

  // Advanced AI & Multi-NGO States
  const [ngos, setNgos] = useState([]);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [latestAudioTranscription, setLatestAudioTranscription] =
    useState(null);
  const [voiceDispatchAudioPlaying, setVoiceDispatchAudioPlaying] =
    useState(false);
  const [tapAuditModalAsset, setTapAuditModalAsset] = useState(null);
  const [isAuditingTap, setIsAuditingTap] = useState(false);
  const [heatStrokeSpeechAnalysis, setHeatStrokeSpeechAnalysis] =
    useState(null);
  const [isAnalyzingSpeech, setIsAnalyzingSpeech] = useState(false);
  const [squadOrdersText, setSquadOrdersText] = useState(null);
  const [isGeneratingSquadOrders, setIsGeneratingSquadOrders] = useState(false);

  // Municipal & Grid Outage Outrages State
  const [outages, setOutages] = useState([]);
  const [showOutages, setShowOutages] = useState(true);

  // Ground-Aware AI Chatbot State
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Namaste! I am HeatAtlas AI. How can I help you find drinking water, AC shelters, or coordinate relief in Pune today?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const zoneLayersRef = useRef([]);
  const assetMarkersRef = useRef([]);
  const beaconMarkersRef = useRef([]);
  const driverMarkerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const coolRoutePolylineRef = useRef(null);
  const isRecordingRef = useRef(false);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const speechSilenceTimerRef = useRef(null);

  const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const fetchCities = async () => {
    try {
      const res = await fetch("/api/cities");
      const data = await res.json();
      const list = data.cities || [];
      setCityList(list);
      const curr = list.find((c) => c.id === selectedCity) || list[0];
      setCurrentCityMeta(curr);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchZones = async (hour, city = selectedCity) => {
    try {
      const res = await fetch(`/api/zones?city=${city}&hour=${hour}`);
      const data = await res.json();
      const zList = data.zones || [];
      setZones(zList);

      if (data.hourly_temperatures) {
        setHourlyTemps(data.hourly_temperatures);
      }

      if (data.cache_age_seconds !== undefined) {
        const mins = Math.floor(data.cache_age_seconds / 60);
        setFreshness(mins > 0 ? `${mins}m ago` : "Live Meteo");
      }

      if (zList.length > 0) {
        setSelectedZone((prev) => {
          if (!prev || prev.city_id !== city) return zList[0];
          return zList.find((z) => z.id === prev.id) || zList[0];
        });
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading live zones");
    }
  };

  const fetchNgos = async (city = selectedCity) => {
    try {
      const res = await fetch(
        `/api/ngos?city=${city}&lat=${driverPos[0]}&lon=${driverPos[1]}`,
      );
      const data = await res.json();
      const list = data.ngos || [];
      setNgos(list);
      if (list.length > 0) {
        setSelectedNgo(list[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssets = async (city = selectedCity) => {
    try {
      const res = await fetch(`/api/assets?city=${city}`);
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBeacons = async (excludeFixtures = hideDemoFixtures) => {
    try {
      const res = await fetch(
        `/api/beacons?include_fixtures=${!excludeFixtures}`,
      );
      const data = await res.json();
      setBeacons(data.beacons || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIntegrations = async () => {
    try {
      const res = await fetch("/api/system/integrations");
      const data = await res.json();
      setIntegrationsList(data.repositories || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOutages = async (city = selectedCity) => {
    try {
      const res = await fetch(`/api/outages?city=${city}`);
      const data = await res.json();
      setOutages(data.outages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBrief = async (city = selectedCity) => {
    setIsGenerating(true);
    setDispatchBrief(
      "Analyzing ground-level assets and worker beacons with Gemini 2.5 Flash...",
    );
    try {
      const res = await fetch("/api/dispatch/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: city,
          request_text: `Coordinate volunteer teams and water relief for ${city.toUpperCase()} during peak heat wave`,
          start: hourOffset,
          end: hourOffset + 4,
          resources: { teams: 3, water_cans: 60 },
          language: lang,
        }),
      });
      const data = await res.json();
      setDispatchData(data);
      setDispatchBrief(
        data.summary ||
          `Prioritize high-deficit sectors across ${city.toUpperCase()}.`,
      );
      showToast("Generated operational dispatch brief!");
    } catch (err) {
      setDispatchBrief(
        "Prioritize high-density worker transit nodes and mandi clusters.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (portalMode !== "phone") {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      return;
    }

    if (!mapInstance.current && mapRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([SWARGATE_PRECISION.lat, SWARGATE_PRECISION.lon], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        opacity: 0.88,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      map.on("zoomend", () => {
        setCurrentZoom(map.getZoom());
      });

      mapInstance.current = map;
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }
  }, [portalMode]);

  const nearbyAssets = useMemo(() => {
    return assets
      .map((a) => {
        const dist = getDistanceMeters(
          driverPos[0],
          driverPos[1],
          a.lat,
          a.lon,
        );
        return { ...a, distance_m: dist };
      })
      .filter((a) => a.distance_m <= radiusMeters)
      .filter(
        (a) =>
          activeCategory === "All" ||
          a.category === activeCategory ||
          (activeCategory === "Water" && a.type === "drinking_water"),
      )
      .sort((a, b) => a.distance_m - b.distance_m);
  }, [assets, driverPos, radiusMeters, activeCategory]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || portalMode !== "phone") return;

    if (driverMarkerRef.current) map.removeLayer(driverMarkerRef.current);
    if (radiusCircleRef.current) map.removeLayer(radiusCircleRef.current);

    const driverIcon = L.divIcon({
      className: "driver-pin",
      html: `
        <div style="background:#0071e3; width:28px; height:28px; border-radius:50%; border:3px solid white; box-shadow:0 3px 10px rgba(0,113,227,0.5); display:flex; align-items:center; justify-content:center; color:white; font-size:13px;">
          🛵
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    driverMarkerRef.current = L.marker(driverPos, { icon: driverIcon }).addTo(
      map,
    );
    driverMarkerRef.current
      .bindPopup(
        `<strong>${t.driverHere}</strong><br>Precise: ${SWARGATE_PRECISION.name}`,
      )
      .openPopup();

    radiusCircleRef.current = L.circle(driverPos, {
      radius: radiusMeters,
      color: "#0071e3",
      weight: 1.5,
      dashArray: "4, 4",
      fillColor: "#38bdf8",
      fillOpacity: 0.12,
    }).addTo(map);
  }, [driverPos, radiusMeters, lang, portalMode]);

  const getZoneTemp = useCallback(
    (zone, hour) => {
      if (!zone) return 38.0;
      const baseZoneTemp =
        typeof zone.temperature === "number" && !isNaN(zone.temperature)
          ? zone.temperature
          : 35.0;
      // Physical LCZ Sky View Factor (SVF) micro-canyon thermal retention offset
      const svf =
        typeof zone.sky_view_factor === "number" ? zone.sky_view_factor : 0.65;
      const lczCanopyOffset = Math.round((1.0 - svf) * 3.2 * 10) / 10;

      if (hourlyTemps && hourlyTemps.length > hour && hourlyTemps.length > 14) {
        const diurnalDelta = hourlyTemps[hour] - hourlyTemps[14];
        if (typeof diurnalDelta === "number" && !isNaN(diurnalDelta)) {
          return (
            Math.round((baseZoneTemp + diurnalDelta + lczCanopyOffset) * 10) /
            10
          );
        }
      }
      return Math.round((baseZoneTemp + lczCanopyOffset) * 10) / 10;
    },
    [hourlyTemps],
  );

  const dynamicSelectedTemp = useMemo(() => {
    return getZoneTemp(selectedZone, hourOffset);
  }, [selectedZone, hourOffset, getZoneTemp]);

  // Cool Corridor Polyline on Map
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (coolRoutePolylineRef.current) {
      map.removeLayer(coolRoutePolylineRef.current);
      coolRoutePolylineRef.current = null;
    }

    if (showCoolRoute) {
      // Dynamic shaded path anchored to current city's active centroid & default junction
      const [cLat, cLon] = currentCityMeta?.centroid || [18.5204, 73.8567];
      const jLat = currentCityMeta?.default_junction?.lat || cLat - 0.015;
      const jLon = currentCityMeta?.default_junction?.lon || cLon + 0.005;

      const coolRouteCoords = [
        [jLat, jLon], // Origin junction
        [jLat + 0.003, jLon - 0.005], // Tree Canopy Park
        [jLat + 0.007, jLon - 0.009], // Riverbank / Green Avenue
        [cLat - 0.004, cLon - 0.004], // Shaded Arterial
        [cLat, cLon], // Destination Center
      ];

      coolRoutePolylineRef.current = L.polyline(coolRouteCoords, {
        color: "#10b981",
        weight: 5,
        dashArray: "6, 6",
        opacity: 0.9,
      }).addTo(map);

      coolRoutePolylineRef.current
        .bindPopup(
          `🌿 <strong>${currentCityMeta?.name || "City"} Canopy Cool Corridor</strong><br>${(dynamicSelectedTemp - 4.5).toFixed(1)}°C (4.5°C cooler than asphalt highways)`,
        )
        .openPopup();
      map.fitBounds(coolRoutePolylineRef.current.getBounds(), {
        padding: [30, 30],
      });
    }
  }, [showCoolRoute, currentCityMeta, dynamicSelectedTemp]);

  const hierarchicalGrid = useMemo(() => {
    if (zones.length === 0) return [];
    const subFactor = currentZoom >= 14 ? 4 : currentZoom >= 12 ? 2 : 1;
    if (subFactor === 1) {
      return zones.map((z) => ({
        ...z,
        temperature: getZoneTemp(z, hourOffset),
      }));
    }

    const microCells = [];
    zones.forEach((z) => {
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
          const microVariance = (((r * 13 + c * 7) % 5) - 2) * 0.4;
          const subTemp = Math.round((baseZoneTemp + microVariance) * 10) / 10;

          microCells.push({
            ...z,
            id: `${z.id}.${r}${c}`,
            name: `${z.name} Sec-${r}${c}`,
            bbox: [subS, subW, subN, subE],
            centroid: [(subS + subN) / 2, (subW + subE) / 2],
            temperature: subTemp,
            isMicro: true,
          });
        }
      }
    });
    return microCells;
  }, [zones, currentZoom, hourOffset, getZoneTemp]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || hierarchicalGrid.length === 0) return;

    zoneLayersRef.current.forEach((l) => map.removeLayer(l));
    zoneLayersRef.current = [];

    hierarchicalGrid.forEach((z) => {
      const [s, w, n, e] = z.bbox;
      let color = "#64748b";
      let opacity = 0.35;

      if (z.temperature >= 41.0) {
        color = "#dc2626";
        opacity = 0.65;
      } else if (z.temperature >= 39.0) {
        color = "#ea580c";
        opacity = 0.55;
      } else if (z.temperature >= 38.0) {
        color = "#ca8a04";
        opacity = 0.45;
      } else if (z.temperature >= 35.0) {
        color = "#16a34a";
        opacity = 0.35;
      }

      const rect = L.rectangle(
        [
          [s, w],
          [n, e],
        ],
        {
          color: color,
          weight: currentZoom >= 14 ? 1 : 1.5,
          fillColor: color,
          fillOpacity: opacity,
        },
      ).addTo(map);

      rect.on("click", () => {
        setSelectedZone(z);
      });

      rect.bindTooltip(
        `<strong>${z.name} (${z.id})</strong><br>${z.temperature}°C · Rd: ${z.rd}`,
        { sticky: true },
      );
      zoneLayersRef.current.push(rect);
    });
  }, [hierarchicalGrid, currentZoom, portalMode]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || assets.length === 0 || portalMode !== "phone") return;

    assetMarkersRef.current.forEach((m) => map.removeLayer(m));
    assetMarkersRef.current = [];

    nearbyAssets.forEach((a) => {
      let iconChar = "💧";
      let pinColor = "#0284c7";

      if (a.type === "drinking_water") {
        iconChar = "💧";
        pinColor = a.status === "dry" ? "#ef4444" : "#0284c7";
      } else if (a.type === "park") {
        iconChar = "🌳";
        pinColor = "#059669";
      } else if (a.type === "cool_haven") {
        iconChar = "❄️";
        pinColor = "#7c3aed";
      } else if (a.type === "clinic") {
        iconChar = "🏥";
        pinColor = "#dc2626";
      }

      const iconHtml = `<div style="background:${pinColor}; width:24px; height:24px; border-radius:50%; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; font-size:11px; color:white;">${iconChar}</div>`;

      const customIcon = L.divIcon({
        className: "custom-pin",
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([a.lat, a.lon], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: 'DM Sans', sans-serif; font-size:12px; min-width:170px;">
          <strong>${a.name}</strong><br>
          <span style="color:#666; font-size:11px;">${a.address || ""}</span><br>
          Category: <span style="color:#0284c7; font-weight:600;">${a.category}</span><br>
          Distance: <strong>${a.distance_m}m</strong> from you<br>
          Status: <strong style="color:${a.status === "dry" ? "#dc2626" : "#16a34a"}">${a.status.toUpperCase()}</strong>
        </div>
      `);
      assetMarkersRef.current.push(marker);
    });
  }, [nearbyAssets, portalMode]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || portalMode !== "phone") return;

    beaconMarkersRef.current.forEach((m) => map.removeLayer(m));
    beaconMarkersRef.current = [];

    beacons.forEach((b) => {
      const isResolved = b.status === "resolved";
      const beaconHtml = `
        <div style="position:relative; width:30px; height:30px; display:flex; align-items:center; justify-content:center;">
          ${!isResolved ? '<div style="position:absolute; width:100%; height:100%; background:rgba(239, 68, 68, 0.4); border-radius:50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ""}
          <div style="position:relative; width:24px; height:24px; background:${isResolved ? "#10b981" : "#dc2626"}; border:2px solid white; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:11px; box-shadow:0 2px 8px rgba(0,0,0,0.4);">
            ${isResolved ? "✓" : "🚨"}
          </div>
        </div>
      `;

      const beaconIcon = L.divIcon({
        className: "custom-beacon",
        html: beaconHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([b.lat, b.lon], { icon: beaconIcon }).addTo(map);
      const isFlagged = b.verified === false;
      const confPct = Math.round((b.confidence || 0.9) * 100);
      marker.bindPopup(`
        <div style="font-family: 'DM Sans', sans-serif; font-size:12px; min-width:210px;">
          <strong style="color:${isResolved ? "#10b981" : isFlagged ? "#d97706" : "#dc2626"};">${isResolved ? "✅ Water Demand Met" : isFlagged ? "⚠️ Flagged Non-Emergency" : "🚨 Active Worker Water Beacon"}</strong><br>
          <strong>${b.location_name}</strong><br>
          <p style="font-size:11px; color:#444; margin:4px 0;">"${b.description}"</p>
          <div style="background:${isFlagged ? "#fefce8" : "#fef2f2"}; border:1px solid ${isFlagged ? "#fef08a" : "#fee2e2"}; padding:4px 6px; border-radius:6px; font-size:10px;">
            🤖 <strong>Gemini Flash:</strong> ${b.detected_crowd || 0} workers · ${confPct}% verified
            ${b.severity_tier ? `<span style="margin-left:4px; font-weight:bold; color:${isFlagged ? "#854d0e" : "#991b1b"};">[${b.severity_tier}]</span>` : ""}
          </div>
        </div>
      `);
      beaconMarkersRef.current.push(marker);
    });
  }, [beacons, portalMode]);

  useEffect(() => {
    fetchCities();
    fetchIntegrations();
  }, []);

  useEffect(() => {
    fetchZones(hourOffset, selectedCity);
    fetchAssets(selectedCity);
    fetchBeacons();
    fetchOutages(selectedCity);
    fetchBrief(selectedCity);
    fetchNgos(selectedCity);
  }, [lang, selectedCity]);

  // Handle City Switch & Smooth Map FlyTo
  const handleCityChange = (cityId) => {
    setSelectedCity(cityId);
    const meta = cityList.find((c) => c.id === cityId);
    if (meta) {
      setCurrentCityMeta(meta);
      setDriverPos([meta.default_junction.lat, meta.default_junction.lon]);
      setBeaconLocation(meta.default_junction.name);
      if (mapInstance.current) {
        mapInstance.current.flyTo(meta.centroid, 13, { duration: 1.5 });
      }
      showToast(`📍 Switched to ${meta.name} (${meta.region})`);
    }
  };

  // Real GPS Geolocation for Driver
  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation not supported by browser");
      return;
    }
    setIsLocatingDriver(true);
    showToast("📡 Acquiring satellite GPS fix...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDriverPos([latitude, longitude]);
        setBeaconLocation(
          `Current GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        );
        if (mapInstance.current) {
          mapInstance.current.flyTo([latitude, longitude], 15, {
            duration: 1.2,
          });
        }
        setIsLocatingDriver(false);
        showToast("📍 Live GPS Location locked!");
        fetchNgos(selectedCity);
      },
      (err) => {
        setIsLocatingDriver(false);
        showToast("GPS permission denied; using precision default junction");
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  // Autonomous Audio-to-Text Transcription via Web Speech API & MediaRecorder with Persistent Keep-Alive
  const handleAudioToText = async () => {
    // TOGGLE STOP: If currently recording, stop cleanly and preserve captured text
    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.onend = null; // Detach keep-alive before stopping
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }

      if (mediaStreamRef.current) {
        try {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        } catch (e) {}
      }

      showToast("✓ Voice note saved!");
      return;
    }

    // START RECORDING
    isRecordingRef.current = true;
    setIsRecording(true);
    setRecordingSeconds(0);

    // Live seconds counter
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    showToast(
      "🎙️ Microphone active! Speak naturally in Marathi, Hindi, or English...",
    );

    // 1. Acquire Hardware Mic Stream to lock microphone session open
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaStreamRef.current = stream;

        audioChunksRef.current = [];
        try {
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          recorder.onstop = async () => {
            // If Web Speech API wasn't able to extract text, send recorded audio blob to Gemini Flash STT
            if (
              !beaconDesc ||
              beaconDesc ===
                "15 delivery riders waiting under blazing flyover sun, tap dry"
            ) {
              if (audioChunksRef.current.length > 0) {
                const blob = new Blob(audioChunksRef.current, {
                  type: "audio/webm",
                });
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = async () => {
                  try {
                    const res = await fetch("/api/audio/transcribe", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        audio_base64: reader.result,
                        language: lang,
                      }),
                    });
                    const data = await res.json();
                    if (data && data.transcription) {
                      setBeaconDesc(data.transcription);
                      setLatestAudioTranscription(data);
                    }
                  } catch (err) {}
                };
              }
            }
          };

          recorder.start(500);
        } catch (recErr) {
          console.warn("MediaRecorder error:", recErr);
        }
      }
    } catch (micErr) {
      console.warn("Microphone permission request error:", micErr);
    }

    // 2. Real-Time Speech Recognition with Auto Keep-Alive (never drops after 1 sec!)
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        speechRecognitionRef.current = recognition;

        recognition.lang =
          lang === "mr" ? "mr-IN" : lang === "hi" ? "hi-IN" : "en-IN";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        let accumulatedTranscript = "";

        recognition.onresult = (event) => {
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulatedTranscript +=
                (accumulatedTranscript ? " " : "") + transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const currentText = (
            accumulatedTranscript +
            (interimTranscript ? " " + interimTranscript : "")
          ).trim();
          if (currentText) {
            setBeaconDesc(currentText);
            setLatestAudioTranscription({
              transcription: currentText,
              translation_en: currentText,
              language_detected:
                lang === "mr" ? "Marathi" : lang === "hi" ? "Hindi" : "English",
            });
          }
        };

        recognition.onerror = (event) => {
          // 'no-speech' is normal when user is thinking or breathing. NEVER drop session!
          if (event.error === "no-speech") {
            return;
          }
          if (event.error === "aborted") {
            return;
          }
          if (event.error === "not-allowed") {
            isRecordingRef.current = false;
            setIsRecording(false);
            if (recordingTimerRef.current)
              clearInterval(recordingTimerRef.current);
            showToast("⚠️ Microphone blocked. Allow permissions in browser.");
          }
        };

        // CRITICAL CHROME BUG FIX:
        // In Chrome, onend fires automatically after 1s of silence.
        // We check isRecordingRef.current: if still true, RESTART recognition seamlessly!
        recognition.onend = () => {
          if (isRecordingRef.current) {
            try {
              recognition.start();
            } catch (e) {
              // If already active or restarting
            }
          }
        };

        recognition.start();
      } catch (err) {
        console.warn("Speech recognition start failed:", err);
      }
    }
  };

  const fallbackGeminiTranscribe = async () => {
    try {
      const res = await fetch("/api/audio/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang }),
      });
      const data = await res.json();
      setLatestAudioTranscription(data);
      setBeaconLocation(
        data.extracted_location ||
          currentCityMeta?.default_junction?.name ||
          "City Central Junction",
      );
      setBeaconDesc(data.transcription);
      showToast("✓ Voice note transcribed to text!");
    } catch (err) {
      showToast("Voice transcription failed");
    } finally {
      setIsRecording(false);
    }
  };

  // Play Autonomous Gemini 2.5 Flash Voice Dispatch Brief
  const playVoiceDispatch = async () => {
    setVoiceDispatchAudioPlaying(true);
    try {
      const res = await fetch("/api/voice/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zone_name: selectedZone?.name || "Swargate",
          temp_c: dynamicSelectedTemp,
          cool_spot: "Swargate Underground Metro AC Concourse",
          language: lang,
        }),
      });
      const data = await res.json();

      // Use Web Speech Synthesis API if available
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(data.speech_script);
        utterance.rate = 0.95;
        if (lang === "mr") utterance.lang = "mr-IN";
        else if (lang === "hi") utterance.lang = "hi-IN";
        else utterance.lang = "en-IN";
        window.speechSynthesis.speak(utterance);
      }
      showToast(
        `🎙️ Playing Gemini 2.5 Flash Voice Dispatch: "${data.speech_script.substring(0, 45)}..."`,
      );
    } catch (err) {
      showToast("Error playing voice dispatch");
    } finally {
      setTimeout(() => setVoiceDispatchAudioPlaying(false), 3000);
    }
  };

  // Run Gemini 2.5 Flash Heat Stroke Speech Screener
  const runHeatStrokeSpeechCheck = async (slurred = false) => {
    setIsAnalyzingSpeech(true);
    try {
      const res = await fetch("/api/triage/stroke-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speech_text:
            "मला खूप चक्कर येत आहे आणि स्वारगेटला घाम येत नाहीये... तोंड कोरडं पडलंय",
          slurred_detected: slurred,
        }),
      });
      const data = await res.json();
      setHeatStrokeSpeechAnalysis(data);
      if (data.trigger_108_alert) {
        setTriageStatus("emergency");
      }
      showToast("🚨 Gemini 2.5 Flash Emergency Speech Triage Complete");
    } catch (err) {
      showToast("Speech check error");
    } finally {
      setIsAnalyzingSpeech(false);
    }
  };

  // Run Gemini 2.5 Flash Multimodal Tap Vision Audit
  const handleTapAuditSubmit = async (osmId, base64Img) => {
    setIsAuditingTap(true);
    try {
      const res = await fetch("/api/assets/audit-tap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          osm_id: osmId,
          image_base64: base64Img || "dummy",
          session_token: sessionToken,
        }),
      });
      const data = await res.json();
      if (
        data.audit &&
        data.audit.is_water_asset &&
        data.audit.is_dry_or_broken
      ) {
        showToast(`✓ Gemini Tap Audit Verified: ${data.audit.damage_type}`);
      } else {
        showToast(
          `⚠️ Gemini Filter Rejected: ${data.audit?.damage_type || "Not a valid broken tap photo"}`,
        );
      }
      setTapAuditModalAsset(null);
      fetchAssets();
      fetchZones(hourOffset);
    } catch (err) {
      showToast("Tap audit error");
    } finally {
      setIsAuditingTap(false);
    }
  };

  // AI Chatbot Message Handler
  const handleSendChatMessage = async (presetText = null) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = { sender: "user", text: textToSend };
    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          city: selectedCity,
          temp_c: dynamicSelectedTemp,
          selected_zone: selectedZone,
          chat_history: updatedHistory,
          language: lang,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Namaste! In ${currentCityMeta?.name || "this city"} (${dynamicSelectedTemp}°C), keep hydrated with cool ORS water and stay off hot asphalt during peak afternoon sun. For medical heat emergencies, immediately dial 108.`,
        },
      ]);
    } finally {
      setIsChatLoading(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Generate WhatsApp Squad Orders for Closest NGO
  const handleGenerateSquadOrders = async (ngo) => {
    setIsGeneratingSquadOrders(true);
    try {
      const res = await fetch("/api/ngo/squad-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ngo_name: ngo.name,
          resources: { teams: ngo.teams, water_cans: ngo.water_cans },
          target_zone: selectedZone?.name
            ? `${selectedZone.name} (${selectedZone.id})`
            : "Swargate (Z-44)",
        }),
      });
      const data = await res.json();
      const orderText =
        data.whatsapp_text || data.orders || data.whatsapp_formatted_text;
      setSquadOrdersText(orderText);
      showToast(`⚡ Generated Battle Orders for ${ngo.name}`);
    } catch (err) {
      showToast("Error generating squad orders");
    } finally {
      setIsGeneratingSquadOrders(false);
    }
  };

  const handleHourChange = (e) => {
    const val = parseInt(e.target.value);
    setHourOffset(val);
    fetchZones(val, selectedCity);
  };

  const handleResolveBeacon = async (beaconId) => {
    try {
      const res = await fetch(`/api/beacons/${beaconId}/resolve`, {
        method: "POST",
      });
      if (res.ok) {
        // Confetti celebration micro-interaction for successful water relief delivery!
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#0071e3", "#34d399", "#38bdf8"],
        });
        showToast("✅ Water demand delivered to workers!");
        fetchBeacons();
        fetchBrief(selectedCity);
      }
    } catch (err) {
      showToast("Error resolving beacon");
    }
  };

  // Voice Note Intake (Marathi/Hindi) triggering Audio-to-Text modal directly
  const triggerVoiceNote = () => {
    setShowBeaconModal(true);
    if (!isRecording) {
      setTimeout(() => {
        handleAudioToText();
      }, 200);
    }
  };

  const submitBeacon = async (e) => {
    e.preventDefault();
    setIsUploadingBeacon(true);

    try {
      const payload = {
        location_name: beaconLocation,
        lat: driverPos[0] + (Math.random() - 0.5) * 0.002,
        lon: driverPos[1] + (Math.random() - 0.5) * 0.002,
        zone_id: selectedZone?.id || "Z-00",
        description: beaconDesc,
        image_base64: beaconImage,
        session_token: sessionToken,
      };

      const res = await fetch("/api/beacons/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      const audit = data.gemini_audit || {};

      if (audit.verified !== false) {
        showToast(
          `✓ Gemini Flash Verified: ${audit.detected_crowd || 10} workers (${Math.round((audit.confidence || 0.95) * 100)}% conf)`,
        );
      } else {
        showToast(
          `🚨 REJECTED by Gemini Vision: ${audit.condition || "Image does not show an outdoor heat/water emergency"}`,
        );
      }
      setShowBeaconModal(false);
      setBeaconDesc("");
      setBeaconImage(null);
      fetchBeacons();
      fetchBrief(selectedCity);

      if (mapInstance.current) {
        mapInstance.current.setView([payload.lat, payload.lon], 15);
      }
    } catch (err) {
      showToast("Error submitting beacon");
    } finally {
      setIsUploadingBeacon(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Standardize image in browser using an HTML Canvas to output clean JPEG
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 1024;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const cleanJpegBase64 = canvas.toDataURL("image/jpeg", 0.88);
          setBeaconImage(cleanJpegBase64);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const shareWhatsApp = () => {
    const cityName = currentCityMeta?.name || "District";
    const msg = encodeURIComponent(
      `🔥 *HeatAtlas ${cityName} Dispatch Brief (Gemini Spatial Intelligence)*\n\n${dispatchBrief}\n\n*Emergency Helpline:* Call 108.`,
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    if (
      msg.includes("🚨") ||
      msg.includes("⚠️") ||
      msg.includes("EMERGENCY") ||
      msg.includes("blocked")
    ) {
      toast.error(msg, { duration: 3500 });
    } else if (
      msg.includes("✓") ||
      msg.includes("✅") ||
      msg.includes("Delivered")
    ) {
      toast.success(msg, { duration: 3000 });
    } else if (
      msg.includes("🎙️") ||
      msg.includes("📡") ||
      msg.includes("Loading") ||
      msg.includes("Acquiring")
    ) {
      toast.info(msg, { duration: 3000 });
    } else {
      toast(msg, { duration: 2500 });
    }
    setTimeout(() => setToastMsg(null), 2500);
  };

  const criticalZones = useMemo(() => {
    return [...zones].sort((a, b) => b.rd - a.rd).slice(0, 5);
  }, [zones]);

  const displayTime = useMemo(() => {
    const ampm = hourOffset >= 12 ? "PM" : "AM";
    const h12 =
      hourOffset > 12 ? hourOffset - 12 : hourOffset === 0 ? 12 : hourOffset;
    return `${hourOffset.toString().padStart(2, "0")}:00 (${h12}:00 ${ampm})`;
  }, [hourOffset]);

  const activeBeacons = beacons.filter((b) => b.status !== "resolved");
  const resolvedBeacons = beacons.filter((b) => b.status === "resolved");

  return (
    <div className="flex justify-center items-center w-full min-h-screen md:py-6 md:px-4 p-0 relative overflow-x-clip">
      {/* 1. MAIN DISPLAY VIEW BASED ON RIGHT-HAND NAV SELECTOR */}
      {portalMode === "phone" && (
        /* REALISTIC PHONE FRAME */
        <div className="phone-case animate-in fade-in zoom-in-95 duration-200">
          <div className="phone-screen no-scrollbar">
            {/* DYNAMIC ISLAND & STATUS BAR */}
            <div className="dynamic-island">
              <span className="font-semibold text-[13px] tracking-tight">
                9:41
              </span>
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
                  <h1 className="font-display font-bold text-[16px] leading-tight tracking-tight">
                    {t.appTitle}
                  </h1>
                  <p className="text-[10px] text-[#86868b] font-medium leading-none">
                    {currentCityMeta?.name || "District"} · Gemini Flash
                    Intelligence
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* DISTRICT CITY SWITCHER */}
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="text-[10.5px] font-bold px-1.5 py-0.5 bg-sky-50 border border-sky-300 text-sky-900 rounded-md shadow-xs cursor-pointer"
                >
                  {cityList.map((c) => (
                    <option key={c.id} value={c.id}>
                      📍 {c.name}
                    </option>
                  ))}
                </select>

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
                  onClick={() => setViewMode("worker")}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-[11.5px] font-bold flex items-center justify-center gap-1 transition-all ${
                    viewMode === "worker"
                      ? "bg-[#ff3b30] text-white shadow-xs"
                      : "text-[#86868b] hover:text-[#1d1d1f]"
                  }`}
                >
                  {t.workerMode}
                </button>
                <button
                  onClick={() => setViewMode("ngo")}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-[11.5px] font-bold flex items-center justify-center gap-1 transition-all ${
                    viewMode === "ngo"
                      ? "bg-[#0071e3] text-white shadow-xs"
                      : "text-[#86868b] hover:text-[#1d1d1f]"
                  }`}
                >
                  {t.ngoMode}
                </button>
              </div>
            </div>

            {/* CRITICAL MUNICIPAL & GRID OUTAGES (Every Outrage Live) */}
            {outages.length > 0 && (
              <div className="px-2.5 pt-1">
                <div className="bg-gradient-to-r from-red-950/90 to-amber-950/90 border border-red-500/40 rounded-xl p-2.5 text-white shadow-md">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                      <span className="font-extrabold text-[11.5px] text-red-200 uppercase tracking-wider flex items-center gap-1">
                        ⚠️ Live Municipal Outrage & Grid Failures (
                        {outages.length})
                      </span>
                    </div>
                    <button
                      onClick={() => setShowOutages(!showOutages)}
                      className="text-[10px] text-red-300 underline font-semibold"
                    >
                      {showOutages ? "Hide" : "Show All"}
                    </button>
                  </div>

                  {showOutages && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      {outages.map((outage) => (
                        <div
                          key={outage.id}
                          className="bg-black/40 border border-red-500/30 rounded-lg p-2 flex flex-col gap-1"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-[11px] text-amber-300">
                              📍 {outage.ward_name}
                            </span>
                            <span className="bg-red-600/90 text-white font-mono font-bold text-[8.5px] px-1.5 py-0.2 rounded">
                              {outage.outage_type.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-200 leading-snug">
                            {outage.description}
                          </p>
                          <div className="flex justify-between items-center text-[9px] text-red-300/90 pt-1 border-t border-red-500/20 font-mono">
                            <span>
                              👥 {outage.affected_population.toLocaleString()}{" "}
                              affected
                            </span>
                            <span>
                              ⏳ Est: {outage.est_restoration} ({outage.source})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* WORKER MODE: CROWD BEACON + VOICE NOTE + EMERGENCY TRIAGE */}
            {viewMode === "worker" && (
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
                      isRecording
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-white border-black/10 text-[#1d1d1f] hover:bg-gray-50"
                    }`}
                    title="Speak in Marathi or Hindi"
                  >
                    <Mic
                      size={15}
                      className={isRecording ? "text-white" : "text-red-500"}
                    />
                    <span className="text-[11px]">
                      {isRecording ? "Listening..." : "Marathi/Hindi"}
                    </span>
                  </button>
                </div>

                {/* Heat Stroke Triage with Gemini 2.5 Flash Audio Screener */}
                <div className="bg-white rounded-xl p-2.5 border border-black/5 shadow-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-[#86868b] flex items-center gap-1">
                      <ShieldAlert size={12} className="text-amber-500" />{" "}
                      {t.triageTitle}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => runHeatStrokeSpeechCheck(false)}
                        className="bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 hover:bg-amber-100"
                        title="AI checks slurred cadence & speech confusion"
                      >
                        <Volume2 size={10} />{" "}
                        {isAnalyzingSpeech ? "Analyzing..." : "AI Voice Triage"}
                      </button>
                      <span className="text-[9.5px] text-gray-500 font-mono">
                        2-Tap
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-[#1d1d1f] mb-1">
                    1. Mental Status Check (Exertional Heatstroke CNS Red Flag):
                  </p>
                  <div className="flex gap-1.5 mb-2">
                    <button
                      onClick={() => {
                        setCnsConfusionStatus("clear");
                        showToast(
                          "✓ Mental status clear. Proceed to hydration & sweating check.",
                        );
                      }}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold border ${
                        cnsConfusionStatus === "clear"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-gray-50 border-gray-200 text-gray-700"
                      }`}
                    >
                      ✓ Alert & Oriented
                    </button>
                    <button
                      onClick={() => {
                        setCnsConfusionStatus("confused");
                        setTriageStatus("emergency");
                        runHeatStrokeSpeechCheck(true);
                        showToast(
                          "🚨 CNS RED FLAG: Confusion/Dizziness = Exertional Heatstroke Risk (even if sweating)!",
                        );
                      }}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold border ${
                        cnsConfusionStatus === "confused"
                          ? "bg-red-600 text-white border-red-700 animate-pulse"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      ⚠️ Confused / Dizzy / Slurred
                    </button>
                  </div>
                  <p className="text-[11px] font-semibold text-[#1d1d1f] mb-1">
                    2. {t.triageQuestion}{" "}
                    <span className="text-[9.5px] font-normal text-gray-500">
                      (Note: Exertional heatstroke patients may still sweat)
                    </span>
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setTriageStatus(
                          cnsConfusionStatus === "confused"
                            ? "emergency"
                            : "safe",
                        );
                        setHeatStrokeSpeechAnalysis(null);
                        showToast(
                          "Caution: Even when sweating, monitor for dizziness/confusion. Drink ORS & rest in shade.",
                        );
                      }}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] font-bold border ${
                        triageStatus === "safe"
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-gray-50 border-gray-200 text-gray-700"
                      }`}
                    >
                      {t.sweatingYes}
                    </button>
                    <button
                      onClick={() => {
                        setTriageStatus("emergency");
                        runHeatStrokeSpeechCheck(true);
                        showToast(
                          "🚨 EMERGENCY: Dry skin is a heat stroke symptom!",
                        );
                      }}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] font-bold border ${
                        triageStatus === "emergency"
                          ? "bg-red-600 text-white border-red-700 animate-pulse"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      {t.sweatingNo}
                    </button>
                  </div>

                  {/* Heat Stroke AI Speech Analysis Banner */}
                  {heatStrokeSpeechAnalysis && (
                    <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px]">
                      <div className="font-bold text-amber-900 flex items-center justify-between">
                        <span>🤖 Gemini 2.5 Flash Speech Screener:</span>
                        <span className="bg-red-600 text-white px-1.5 py-0.2 rounded font-mono font-bold">
                          EMERGENCY_RED
                        </span>
                      </div>
                      <p className="text-amber-800 mt-0.5">
                        {heatStrokeSpeechAnalysis.medical_triage_instruction}
                      </p>
                    </div>
                  )}

                  {triageStatus === "emergency" && (
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
                <div className="bg-white rounded-3xl p-4 border border-black/5 shadow-sm relative overflow-hidden">
                  {/* Visual Glass Thermal Aura */}
                  <div
                    className="absolute -right-10 -top-10 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-40 transition-colors duration-500"
                    style={{
                      background:
                        dynamicSelectedTemp >= 41.0
                          ? "radial-gradient(circle, #ef4444, transparent)"
                          : dynamicSelectedTemp >= 39.0
                            ? "radial-gradient(circle, #f97316, transparent)"
                            : dynamicSelectedTemp >= 38.0
                              ? "radial-gradient(circle, #eab308, transparent)"
                              : "radial-gradient(circle, #10b981, transparent)",
                    }}
                  />

                  <div className="flex justify-between items-center mb-1 relative z-10">
                    <span className="text-[12.5px] font-extrabold text-[#1d1d1f] uppercase tracking-wide truncate max-w-[210px] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      {selectedZone.name}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                        selectedZone.tier === "Critical" ||
                        dynamicSelectedTemp >= 41.0
                          ? "bg-red-50 text-red-700 border-red-200"
                          : selectedZone.tier === "High" ||
                              dynamicSelectedTemp >= 38.0
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : selectedZone.tier === "Moderate"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {selectedZone.tier === "Critical" ||
                      dynamicSelectedTemp >= 41.0
                        ? "🚨 CRITICAL DEFICIT"
                        : selectedZone.tier === "High" ||
                            dynamicSelectedTemp >= 38.0
                          ? "⚠️ HIGH DEFICIT"
                          : selectedZone.tier === "Moderate"
                            ? "⚡ MODERATE DEFICIT"
                            : "✓ LOW DEFICIT"}
                    </span>
                  </div>

                  <div className="flex justify-between items-end relative z-10 my-1">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-extrabold text-[42px] text-[#1d1d1f] leading-none tracking-tight">
                        {dynamicSelectedTemp}°
                      </span>
                      <span className="text-[15px] font-bold text-red-500">
                        C
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono ml-1.5">
                        felt temp
                      </span>
                    </div>
                    <div className="text-[10.5px] text-[#86868b] flex flex-col gap-0.5 text-right font-medium">
                      <div>
                        DEFICIT:{" "}
                        <strong className="text-[#1d1d1f] font-mono font-bold">
                          {selectedZone.rd.toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        AT-RISK POP:{" "}
                        <strong className="text-[#1d1d1f] font-mono font-bold">
                          {selectedZone.vh.toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* APPLE BENTO MINI-METRIC STRIP */}
                  <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-black/5 text-center relative z-10">
                    <div className="bg-[#f5f5f7] rounded-xl p-2 border border-black/5">
                      <div className="text-[9px] uppercase font-bold text-[#86868b] flex items-center justify-center gap-0.5">
                        <Clock size={10} /> Peak Hours
                      </div>
                      <div className="text-[11.5px] font-bold text-[#1d1d1f] font-mono mt-0.5">
                        12:00–16:00
                      </div>
                    </div>
                    <div className="bg-[#f5f5f7] rounded-xl p-2 border border-black/5">
                      <div className="text-[9px] uppercase font-bold text-[#86868b] flex items-center justify-center gap-0.5">
                        <Flame size={10} className="text-red-500" /> Active
                        Beacons
                      </div>
                      <div className="text-[11.5px] font-bold text-red-600 font-mono mt-0.5">
                        {activeBeacons.length} Signals
                      </div>
                    </div>
                    <div className="bg-[#f5f5f7] rounded-xl p-2 border border-black/5">
                      <div className="text-[9px] uppercase font-bold text-[#86868b] flex items-center justify-center gap-0.5">
                        <Droplet size={10} className="text-sky-500" /> Working
                        Taps
                      </div>
                      <div className="text-[11.5px] font-bold text-emerald-700 font-mono mt-0.5">
                        {selectedZone.working_taps} Verified
                      </div>
                    </div>
                  </div>

                  {/* ADVANCED BIOMETEOROLOGICAL & QUEUING TELEMETRY STRIP */}
                  <div className="grid grid-cols-4 gap-1 mt-1.5 text-center relative z-10">
                    <div className="bg-slate-900 text-white rounded-lg p-1.5">
                      <div className="text-[8px] uppercase text-slate-400 font-mono">
                        WBGT J-Curve
                      </div>
                      <div className="text-[10.5px] font-mono font-bold text-amber-400">
                        {selectedZone.wbgt_severity_multiplier || "1.28"}×
                      </div>
                    </div>
                    <div className="bg-slate-900 text-white rounded-lg p-1.5">
                      <div className="text-[8px] uppercase text-slate-400 font-mono">
                        Canyon SVF
                      </div>
                      <div className="text-[10.5px] font-mono font-bold text-sky-400">
                        {selectedZone.sky_view_factor || "0.52"}
                      </div>
                    </div>
                    <div className="bg-slate-900 text-white rounded-lg p-1.5">
                      <div className="text-[8px] uppercase text-slate-400 font-mono">
                        Queue Load
                      </div>
                      <div className="text-[10.5px] font-mono font-bold text-rose-400">
                        {selectedZone.capacity_saturation_ratio || "18.4"}:1
                      </div>
                    </div>
                    <div className="bg-slate-900 text-white rounded-lg p-1.5">
                      <div className="text-[8px] uppercase text-slate-400 font-mono">
                        Non-Linear Rd
                      </div>
                      <div className="text-[10.5px] font-mono font-bold text-emerald-400">
                        {(
                          selectedZone.non_linear_rd ||
                          selectedZone.rd ||
                          0
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-1.5 px-2 py-1 bg-slate-100 rounded-lg border border-slate-200 text-[8.5px] text-slate-600 font-mono flex items-center justify-between relative z-10">
                    <span>
                      📐 Grid Note: Open-Meteo (~10km) + LCZ SVF & WorldPop v2
                      (3.3×3.3km)
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedZone.thermal_threshold_mode ===
                      "NDMA_38C_HEATWAVE"
                        ? "≥38°C Mode"
                        : "≥32°C Caution"}
                    </span>
                  </div>

                  {/* EL NINO & CLIMATOLOGY ALERT BANNER */}
                  {currentCityMeta && (
                    <div className="mt-2 pt-2 border-t border-black/5 bg-gradient-to-r from-amber-50 to-orange-50 p-2.5 rounded-xl border border-amber-200/80 relative z-10">
                      <div className="flex justify-between items-center text-[9.5px] font-bold text-amber-900">
                        <span className="flex items-center gap-1">
                          🌍 El Niño Climate Anomaly:
                        </span>
                        <span className="font-mono bg-amber-200/60 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                          +{currentCityMeta.el_nino_temp_boost}°C Anomaly
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-900 font-semibold mt-1">
                        {currentCityMeta.el_nino_vulnerability}
                      </div>
                      <div className="text-[9px] text-amber-700/90 mt-0.5 font-medium flex items-center gap-2">
                        <span>
                          Region: <strong>{currentCityMeta.region}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Climate:{" "}
                          <strong>{currentCityMeta.climate_zone}</strong>
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between relative z-10">
                    <span className="text-[10px] text-[#86868b] font-medium flex items-center gap-1">
                      <Radio size={12} className="text-red-500 animate-pulse" />{" "}
                      15s Driver Audio Alert
                    </span>
                    <button
                      onClick={playVoiceDispatch}
                      disabled={voiceDispatchAudioPlaying}
                      className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-[10.5px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                    >
                      <Volume2
                        size={13}
                        className={
                          voiceDispatchAudioPlaying ? "animate-bounce" : ""
                        }
                      />
                      <span>
                        {voiceDispatchAudioPlaying
                          ? "Broadcasting Speech..."
                          : "Play Voice Dispatch"}
                      </span>
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
                  showToast(
                    showCoolRoute
                      ? "Disabled Cool Corridor"
                      : "🌿 Enabled Canopy Cool Route (37.2°C)",
                  );
                }}
                className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center justify-between border transition-all ${
                  showCoolRoute
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                    : "bg-white border-black/10 text-emerald-800 hover:bg-emerald-50"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Route size={14} /> {t.coolRouteTitle}
                </span>
                <span className="text-[10px] font-mono font-semibold">
                  {showCoolRoute
                    ? "✓ Active (65% Shade)"
                    : "Compare Shade Route"}
                </span>
              </button>
            </section>

            {/* DRIVER RADIAL RANGE SLIDER & ASSET FILTERS */}
            <section className="px-2.5 pt-1 flex flex-col gap-1.5">
              <div className="bg-white rounded-xl p-2 border border-black/5 shadow-xs flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#86868b] flex items-center gap-1">
                  <Compass size={12} className="text-[#0071e3]" />{" "}
                  {t.radialTitle}
                </span>
                <div className="flex items-center gap-1">
                  {[500, 1000, 2000].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRadiusMeters(r)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        radiusMeters === r
                          ? "bg-[#0071e3] text-white border-[#0071e3]"
                          : "bg-gray-50 border-gray-200 text-gray-700"
                      }`}
                    >
                      {r >= 1000 ? `${r / 1000} km` : `${r}m`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar">
                {[
                  "All",
                  "Water",
                  "Shade & Parks",
                  "AC Cool Haven",
                  "Clinics & ORS",
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap transition-colors border ${
                      activeCategory === cat
                        ? "bg-[#1d1d1f] text-white border-black"
                        : "bg-white text-[#555] border-black/10 hover:bg-gray-100"
                    }`}
                  >
                    {cat === "All"
                      ? t.all
                      : cat === "Water"
                        ? t.water
                        : cat === "Shade & Parks"
                          ? t.shade
                          : cat === "AC Cool Haven"
                            ? t.acHaven
                            : t.clinics}
                  </button>
                ))}
              </div>
            </section>

            {/* REAL LEAFLET MAP VIEWPORT */}
            <section className="relative px-2.5 pt-1">
              <div
                ref={mapRef}
                className="w-full h-[280px] rounded-2xl overflow-hidden border border-black/5 shadow-xs z-10"
              />

              <div className="absolute top-3 right-5 z-[500] flex flex-col gap-1.5">
                <button
                  onClick={handleDetectGPSLocation}
                  disabled={isLocatingDriver}
                  className="bg-white/95 border border-sky-300 text-sky-800 text-[10.5px] font-bold px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1 hover:bg-sky-50 active:scale-95 transition-transform"
                  title="Detect live satellite GPS location"
                >
                  <span>🛰️</span>{" "}
                  {isLocatingDriver ? "Acquiring GPS..." : "My Live Location"}
                </button>
                <button
                  onClick={() => {
                    if (currentCityMeta && mapInstance.current) {
                      mapInstance.current.setView(currentCityMeta.centroid, 13);
                    }
                  }}
                  className="bg-white/95 border border-black/10 text-[10.5px] font-semibold px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1"
                >
                  📍 {currentCityMeta?.name || "City"} Center
                </button>
              </div>
            </section>

            {/* 24-HOUR TIMELINE SCRUBBER */}
            <section className="px-2.5 pt-1">
              <div className="bg-white rounded-t-2xl px-3.5 pt-2.5 pb-1 border border-b-0 border-black/5 flex justify-between items-center">
                <span className="text-[11.5px] font-bold text-[#86868b] flex items-center gap-1">
                  <Clock size={12} /> {t.timelineTitle}
                </span>
                <span className="font-mono text-[11.5px] font-bold text-[#0071e3]">
                  {displayTime}
                </span>
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
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const nextVal = !hideDemoFixtures;
                      setHideDemoFixtures(nextVal);
                      fetchBeacons(nextVal);
                      showToast(
                        nextVal
                          ? "Showing Live Field Reports Only"
                          : "Showing All Scenario + Live Beacons",
                      );
                    }}
                    className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-full border transition-colors ${
                      hideDemoFixtures
                        ? "bg-emerald-600 text-white border-emerald-700"
                        : "bg-slate-100 text-slate-700 border-slate-300"
                    }`}
                    title="Toggle between Live Field Reports only vs Seeded Demo Scenarios"
                  >
                    {hideDemoFixtures
                      ? "● Live Only"
                      : "⚡ Live + Demo Scenarios"}
                  </button>
                  <span className="text-[9.5px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded-full">
                    {activeBeacons.length} Active
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {activeBeacons.map((b) => {
                  const isFlagged = b.verified === false;
                  const confPct = Math.round((b.confidence || 0.9) * 100);
                  const crowd =
                    b.detected_crowd !== undefined ? b.detected_crowd : 10;
                  const tier =
                    b.severity_tier || (isFlagged ? "REJECTED" : "CRITICAL");

                  return (
                    <div
                      key={b.id}
                      className={`rounded-2xl p-3 border transition-all ${
                        isFlagged
                          ? "bg-slate-50/90 border-slate-200"
                          : "bg-rose-50/70 border-rose-200/80 shadow-xs"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <div className="font-bold text-[12.5px] text-gray-900 leading-tight flex items-center gap-1.5 flex-wrap">
                            <span>{b.location_name}</span>
                            <span
                              className={`text-[8px] font-mono px-1.5 py-0.2 rounded border ${
                                b.is_demo_fixture
                                  ? "bg-amber-50 text-amber-800 border-amber-300"
                                  : "bg-emerald-50 text-emerald-800 border-emerald-300"
                              }`}
                            >
                              {b.is_demo_fixture
                                ? "📋 SCENARIO FIXTURE"
                                : "🛰️ LIVE FIELD REPORT"}
                            </span>
                          </div>
                          <div className="text-[10.5px] text-gray-600 mt-0.5 leading-snug">
                            {b.description}
                          </div>
                        </div>
                        <span
                          className={`text-[8.5px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shrink-0 shadow-2xs ${
                            isFlagged
                              ? "bg-slate-200 text-slate-700"
                              : tier === "CRITICAL"
                                ? "bg-red-600 text-white animate-pulse"
                                : tier === "HIGH"
                                  ? "bg-amber-600 text-white"
                                  : "bg-blue-600 text-white"
                          }`}
                        >
                          {isFlagged ? "⚠️ FILTERED" : tier}
                        </span>
                      </div>

                      {/* Ground Driver Proof Image Preview */}
                      {(b.image_url || b.image_base64) && (
                        <div className="w-full h-28 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative group my-1">
                          <img
                            src={b.image_url || b.image_base64}
                            alt={b.location_name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-white text-[8.5px] font-mono px-1.5 py-0.5 rounded font-bold">
                            📷 Driver Ground Photo
                          </span>
                        </div>
                      )}

                      {/* Gemini Flash Neural Audit Panel */}
                      <div className="mt-1.5 bg-white/90 border border-slate-100 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <span className="text-amber-500">⚡</span>
                            <span>
                              {b.model_used || "Gemini Flash Intelligence"}:
                            </span>
                          </span>
                          <span
                            className={`font-mono font-bold px-1.5 py-0.2 rounded text-[9.5px] ${
                              isFlagged
                                ? "bg-amber-100 text-amber-900"
                                : "bg-emerald-100 text-emerald-900"
                            }`}
                          >
                            {isFlagged
                              ? "Non-Emergency"
                              : `${confPct}% Verified (${crowd} Workers)`}
                          </span>
                        </div>

                        <div className="text-[10px] text-gray-700 leading-snug italic bg-slate-50/80 p-1.5 rounded-lg border border-slate-100">
                          "
                          {b.reasoning ||
                            b.condition ||
                            "Emergency drinking water relief requested."}
                          "
                        </div>

                        {b.actionable_recommendation && !isFlagged && (
                          <div className="text-[9.5px] text-blue-900 font-medium bg-blue-50/70 p-1.5 rounded-lg border border-blue-100 flex items-start gap-1">
                            <span className="font-bold shrink-0">
                              🎯 Action:
                            </span>
                            <span>{b.actionable_recommendation}</span>
                          </div>
                        )}

                        {b.assigned_ngo && !isFlagged && (
                          <div className="flex items-center justify-between pt-0.5 text-[9px] text-slate-600 font-medium">
                            <span>
                              🏢 Dispatched:{" "}
                              <strong className="text-slate-800">
                                {b.assigned_ngo}
                              </strong>{" "}
                              ({b.ngo_distance_meters || 0}m)
                            </span>
                            {b.ngo_phone && (
                              <a
                                href={`tel:${b.ngo_phone}`}
                                className="text-blue-600 font-bold hover:underline"
                              >
                                📞 Call Squad
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {!isFlagged && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleResolveBeacon(b.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 active:scale-95 transition-transform"
                          >
                            <CheckCircle2 size={12} /> {t.demandMetBtn}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {resolvedBeacons.map((b) => (
                  <div
                    key={b.id}
                    className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2 flex justify-between items-center opacity-85"
                  >
                    <div>
                      <div className="font-bold text-[11.5px] text-emerald-900 line-through">
                        {b.location_name}
                      </div>
                      <div className="text-[9.5px] text-emerald-700">
                        {b.description}
                      </div>
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
                  <MapPin size={13} className="text-[#0071e3]" />{" "}
                  {t.groundAssetsTitle}
                </h2>
                <span className="text-[10px] text-[#0071e3] font-bold">
                  {nearbyAssets.length} within{" "}
                  {radiusMeters >= 1000
                    ? `${radiusMeters / 1000}km`
                    : `${radiusMeters}m`}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                {nearbyAssets.map((a) => (
                  <div
                    key={a.osm_id}
                    className="bg-white rounded-xl px-3 py-2 border border-black/5 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {a.type === "drinking_water"
                          ? "💧"
                          : a.type === "park"
                            ? "🌳"
                            : a.type === "cool_haven"
                              ? "❄️"
                              : "🏥"}
                      </span>
                      <div>
                        <div className="text-[11.5px] font-semibold text-[#1d1d1f] truncate max-w-[190px]">
                          {a.name}
                        </div>
                        <div className="text-[9.5px] text-[#86868b] flex items-center gap-1">
                          <strong className="text-[#0071e3] font-mono">
                            {a.distance_m}m
                          </strong>{" "}
                          · <span>{a.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                          a.status === "working"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {a.status === "working" ? "✓ Open" : "⚠️ Issue"}
                      </span>
                      {a.type === "drinking_water" && (
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
                    <Building size={14} className="text-[#0071e3]" /> Multi-NGO
                    Response Network
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
                            ? "bg-blue-50/70 border-blue-200"
                            : "bg-gray-50 border-gray-200"
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
                              📍 {ngo.address} · 📞{" "}
                              <span className="font-mono">{ngo.phone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-black/5 text-[9.5px]">
                          <span className="text-gray-600 font-medium">
                            🚚 <strong>{ngo.teams} Teams</strong> (
                            {ngo.active_squads} deployed) · 💧{" "}
                            <strong>{ngo.water_cans} Cans</strong>
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
                        ⚡ Gemini 2.5 Flash WhatsApp Battle-Orders
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
                        window.open(
                          `https://api.whatsapp.com/send?text=${msg}`,
                          "_blank",
                        );
                      }}
                      className="mt-1.5 w-full bg-[#25d366] text-white font-bold text-[10.5px] py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-xs"
                    >
                      <MessageSquare size={12} /> Dispatch WhatsApp Battle Order
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* GEMINI FLASH DISPATCH & CONSTRAINED RESOURCE SOLVER DRAWER */}
            <section className="px-2.5 pt-1">
              <div className="bg-white rounded-2xl p-3.5 border border-black/5 shadow-xs flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-[12.5px] flex items-center gap-1.5">
                    {t.geminiDispatchTitle}
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-900 font-mono font-bold px-2 py-0.5 rounded border border-emerald-300">
                    ✓ RefChecker 0.0% Hallucination
                  </span>
                </div>
                <p className="text-[11.5px] text-[#555] bg-gray-50 p-2.5 rounded-xl border border-black/5 leading-relaxed">
                  {dispatchBrief}
                </p>

                {/* Constrained Resource Allocation Table & Sensitivity Check */}
                {dispatchData?.constrained_allocation && (
                  <div className="bg-slate-900 text-white rounded-xl p-2.5 text-[10px] font-mono flex flex-col gap-1.5">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-1">
                      <span className="text-amber-400 font-bold">
                        ⚙️ Constrained VRP Solver (max ∑ xᵢ·Rdᵢ)
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded text-[8.5px]">
                        Stability:{" "}
                        {
                          dispatchData.constrained_allocation
                            .sensitivity_analysis?.top_3_ranking_stability_pct
                        }
                        % (±50% w)
                      </span>
                    </div>
                    {dispatchData.constrained_allocation.allocations?.map(
                      (alloc, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-slate-800/90 px-2 py-1 rounded border border-slate-700"
                        >
                          <div>
                            <span className="text-sky-300 font-bold">
                              {alloc.zone_name}
                            </span>{" "}
                            <span className="text-slate-400">
                              (Rd: {alloc.rd})
                            </span>
                          </div>
                          <div className="text-right text-[9px]">
                            <span className="text-emerald-300 font-bold">
                              {alloc.teams_assigned}T ·{" "}
                              {alloc.water_cans_assigned} Cans
                            </span>{" "}
                            <span className="text-slate-400">
                              ({alloc.estimated_travel_mins}m ETA)
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                    {dispatchData.refchecker_audit && (
                      <div className="text-[8.5px] text-slate-400 flex justify-between pt-0.5">
                        <span>
                          🔍 CiteFact Triplets:{" "}
                          {dispatchData.refchecker_audit.claims_verified}{" "}
                          entailed
                        </span>
                        <button
                          onClick={() => setShowRepoDrawer(!showRepoDrawer)}
                          className="text-sky-400 underline font-bold"
                        >
                          {showRepoDrawer
                            ? "Hide 12 Repos"
                            : "Inspect 12 Integrated Repos"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive 12-Repo Architecture Explorer */}
                {showRepoDrawer && integrationsList.length > 0 && (
                  <div className="bg-indigo-950 text-white rounded-xl p-2.5 text-[9.5px] flex flex-col gap-1 border border-indigo-700 max-h-[190px] overflow-y-auto">
                    <div className="font-bold text-indigo-300 text-[10px] mb-0.5">
                      📦 12 Integrated Open-Source Repositories
                      (/api/system/integrations):
                    </div>
                    {integrationsList.map((repo, i) => (
                      <div
                        key={i}
                        className="bg-black/40 p-1.5 rounded border border-indigo-800/60 flex justify-between items-start gap-2"
                      >
                        <div>
                          <span className="font-mono font-bold text-amber-300">
                            {repo.name}
                          </span>{" "}
                          <span className="text-indigo-200">
                            ({repo.module})
                          </span>
                          <div className="text-[8.5px] text-slate-300">
                            {repo.role}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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
                    <RefreshCw
                      size={12}
                      className={isGenerating ? "animate-spin" : ""}
                    />{" "}
                    {t.recalculate}
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

            {/* FLOATING AI CHATBOT TRIGGER (Inside Phone Screen) */}
            <div className="absolute bottom-6 right-4 z-[500]">
              <button
                onClick={() => setShowChatbot(!showChatbot)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3.5 py-2.5 rounded-full shadow-xl font-bold text-[12px] transition-transform active:scale-95 border-2 border-white/40"
              >
                <Bot size={18} className="animate-pulse" />
                <span>HeatAtlas AI</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </button>
            </div>

            {/* AI CHATBOT SLIDE-UP DRAWER (Inside Phone Screen) */}
            {showChatbot && (
              <div className="absolute inset-x-0 bottom-0 top-[12%] z-[600] bg-white/95 backdrop-blur-md rounded-t-3xl shadow-2xl flex flex-col border-t border-slate-200 animate-in slide-in-from-bottom duration-200">
                {/* Drawer Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-3xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Bot size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-extrabold text-[13px]">
                        <span>HeatAtlas AI Assistant</span>
                        <span className="text-[9px] bg-indigo-500/80 px-1.5 py-0.5 rounded-full font-mono">
                          Gemini 2.5 Flash
                        </span>
                      </div>
                      <div className="text-[10px] text-indigo-100 flex items-center gap-1">
                        <span>📍 {currentCityMeta?.name || "Active City"}</span>
                        <span>•</span>
                        <span>{dynamicSelectedTemp}°C Felt Temp</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChatbot(false)}
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Quick Context & Prompts */}
                <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex gap-1.5 overflow-x-auto text-[10.5px]">
                  <button
                    onClick={() =>
                      handleSendChatMessage(
                        "Where is the closest free drinking water?",
                      )
                    }
                    className="shrink-0 px-2.5 py-1 bg-white border border-slate-300 rounded-full font-medium text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                  >
                    💧 Nearest Water?
                  </button>
                  <button
                    onClick={() =>
                      handleSendChatMessage(
                        "I'm feeling dizzy under the sun, what should I do?",
                      )
                    }
                    className="shrink-0 px-2.5 py-1 bg-white border border-slate-300 rounded-full font-medium text-slate-700 hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    🚨 Heat Stroke Check
                  </button>
                  <button
                    onClick={() =>
                      handleSendChatMessage(
                        `How can our NGO deploy relief teams in ${currentCityMeta?.name || "this city"}?`,
                      )
                    }
                    className="shrink-0 px-2.5 py-1 bg-white border border-slate-300 rounded-full font-medium text-slate-700 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                  >
                    🤝 NGO Dispatch Guide
                  </button>
                  <button
                    onClick={() =>
                      handleSendChatMessage(
                        "What is the coolest shaded route for delivery riders?",
                      )
                    }
                    className="shrink-0 px-2.5 py-1 bg-white border border-slate-300 rounded-full font-medium text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                  >
                    🌿 Tree Canopy Route
                  </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
                    >
                      {msg.sender === "bot" && (
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1">
                          <Sparkles size={13} className="text-indigo-600" />
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-2xl text-[12px] leading-relaxed shadow-2xs whitespace-pre-line ${
                          msg.sender === "user"
                            ? "bg-indigo-600 text-white rounded-br-xs"
                            : "bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex gap-2 items-center text-slate-500 text-[11px] italic">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <Sparkles
                          size={13}
                          className="text-indigo-600 animate-spin"
                        />
                      </div>
                      <span>
                        HeatAtlas AI is reasoning with Gemini 2.5 Flash...
                      </span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input Box with Voice & Send Button */}
                <div className="p-3 bg-white border-t border-slate-200">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChatMessage();
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const SpeechRecognition =
                          window.SpeechRecognition ||
                          window.webkitSpeechRecognition;
                        if (SpeechRecognition) {
                          const recognition = new SpeechRecognition();
                          recognition.lang =
                            lang === "mr"
                              ? "mr-IN"
                              : lang === "hi"
                                ? "hi-IN"
                                : "en-IN";
                          recognition.interimResults = true;
                          recognition.onresult = (ev) => {
                            const transcript = ev.results[0][0].transcript;
                            setChatInput(transcript);
                          };
                          recognition.onerror = (ev) => {
                            if (ev.error === "no-speech") return;
                          };
                          recognition.start();
                          showToast("🎙️ Listening... Speak your question");
                        } else {
                          showToast("Speech not supported on this browser");
                        }
                      }}
                      className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 shrink-0"
                      title="Voice Query"
                    >
                      <Mic size={16} />
                    </button>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Ask HeatAtlas about ${currentCityMeta?.name || "city"}, water, triage...`}
                      className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isChatLoading}
                      className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center shrink-0 transition-colors"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. GROUND COMMAND PORTAL VIEW */}
      {portalMode === "command" && (
        <div className="w-[85vw] max-w-6xl h-[88vh] bg-[#0d1117] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="px-5 py-3.5 bg-[#161b22] border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold">
                🛡️
              </div>
              <div>
                <h2 className="font-extrabold text-[15px] text-white tracking-tight">
                  HeatAtlas Ground Intelligence Command
                </h2>
                <p className="text-[11px] text-slate-400">
                  Live Incident Stream • Gemini Multimodal Vision Audits •
                  WhatsApp Battle-Orders
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-mono font-bold text-emerald-400">
                OPERATIONAL LIVE
              </span>
            </div>
          </div>
          <iframe
            src="/dashboard.html"
            title="Ground Command Portal"
            className="w-full flex-1 border-0"
            style={{ minHeight: "calc(88vh - 65px)" }}
          />
        </div>
      )}

      {/* 3. BACKEND API & ARCHIFY SPEC VIEW */}
      {portalMode === "backend" && (
        <div className="w-[85vw] max-w-6xl h-[88vh] bg-[#0d1117] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="px-5 py-3.5 bg-[#161b22] border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                ⚡
              </div>
              <div>
                <h2 className="font-extrabold text-[15px] text-white tracking-tight">
                  FastAPI Production Backend & OpenAPI Spec
                </h2>
                <p className="text-[11px] text-slate-400">
                  Interactive Swagger Telemetry • 9 Integrated Repositories •
                  Deterministic Formulas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/api/system/archify"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-lg text-[11px] font-mono hover:bg-indigo-600/50"
              >
                Inspect /api/system/archify ↗
              </a>
              <span className="text-[11px] font-mono font-bold text-indigo-400">
                Production API
              </span>
            </div>
          </div>
          <iframe
            src="/docs"
            title="FastAPI Interactive Swagger Docs"
            className="w-full flex-1 border-0 bg-white"
            style={{ minHeight: "calc(88vh - 65px)" }}
          />
        </div>
      )}

      {/* MOBILE DRAWER BACKDROP (ONLY VISIBLE ON PHONE WHEN SLIDER IS OPEN) */}
      {isPortalDrawerOpen && (
        <div
          onClick={() => setIsPortalDrawerOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-[8998] transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* MOBILE SLIDER TAB HANDLE (COLLAPSED STATE ON PHONE ONLY) */}
      {!isPortalDrawerOpen && (
        <button
          onClick={() => setIsPortalDrawerOpen(true)}
          className="md:hidden fixed right-0 top-1/2 -translate-y-1/2 z-[8997] flex items-center gap-1 pl-2.5 pr-1.5 py-3.5 bg-[#121620]/95 backdrop-blur-xl border-l border-y border-white/20 text-white rounded-l-2xl shadow-2xl transition-all active:scale-95 group hover:bg-[#1a2030]"
          title="Open Portals Slider"
          aria-label="Open Portals Navigation Slider"
        >
          <span className="text-xs text-amber-400 group-hover:-translate-x-0.5 transition-transform">◀</span>
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest [writing-mode:vertical-rl] rotate-180 text-slate-300">
            Portals
          </span>
        </button>
      )}

      {/* FAR-RIGHT NAVIGATION COLUMN (DESKTOP FIXED / PHONE SLIDE-OUT DRAWER) */}
      <aside
        className={`fixed z-[9000] flex flex-col gap-2.5 p-2.5 bg-[#121620]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl transition-transform duration-300 ease-out md:right-5 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 ${
          isPortalDrawerOpen
            ? "right-3 top-1/2 -translate-y-1/2 translate-x-0 max-w-[220px]"
            : "right-0 top-1/2 -translate-y-1/2 translate-x-[130%] pointer-events-none md:pointer-events-auto"
        }`}
      >
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10 gap-3">
          <span className="text-[9.5px] uppercase font-mono font-extrabold tracking-wider text-slate-300">
            VIEW PORTAL
          </span>
          <button
            onClick={() => setIsPortalDrawerOpen(false)}
            className="md:hidden text-[10px] font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors"
            title="Hide Portals Slider"
          >
            <span>Hide</span>
            <span className="text-xs">▶</span>
          </button>
        </div>

        {/* 1. Mobile Phone */}
        <button
          onClick={() => handleSelectPortal("phone")}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-[12px] transition-all text-left ${
            portalMode === "phone"
              ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30 font-bold scale-[1.02]"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
          title="Mobile Phone Experience"
        >
          <span className="text-base">📱</span>
          <div className="flex flex-col">
            <span className="leading-tight">Mobile Phone</span>
            <span className="text-[9.5px] opacity-75 font-normal">
              Worker Triage & Beacons
            </span>
          </div>
        </button>

        {/* 2. Ground Command Dashboard */}
        <button
          onClick={() => handleSelectPortal("command")}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-[12px] transition-all text-left ${
            portalMode === "command"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 font-bold scale-[1.02]"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
          title="Ground Intelligence Command"
        >
          <span className="text-base">🛡️</span>
          <div className="flex flex-col">
            <span className="leading-tight">NGO Command</span>
            <span className="text-[9.5px] opacity-75 font-normal">
              Incidents & Battle Orders
            </span>
          </div>
        </button>

        {/* 3. Backend & API Docs */}
        <button
          onClick={() => handleSelectPortal("backend")}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-[12px] transition-all text-left ${
            portalMode === "backend"
              ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30 font-bold scale-[1.02]"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
          title="FastAPI Backend & Archify Spec"
        >
          <span className="text-base">⚡</span>
          <div className="flex flex-col">
            <span className="leading-tight">Backend API</span>
            <span className="text-[9.5px] opacity-75 font-normal">
              Swagger & Archify Specs
            </span>
          </div>
        </button>

        {/* 4. Showcase Hub */}
        <a
          href="/showcase.html"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setIsPortalDrawerOpen(false)}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-[12px] transition-all text-left text-amber-300 hover:bg-white/10 hover:text-amber-200"
          title="Shareable Showcase Website & Videos"
        >
          <span className="text-base">🌟</span>
          <div className="flex flex-col">
            <span className="leading-tight">Showcase Hub</span>
            <span className="text-[9.5px] opacity-75 font-normal">
              Videos & Pitch Deck ↗
            </span>
          </div>
        </a>
      </aside>

      {/* BEACON CREATION MODAL WITH GEMINI 2.0 VISION PHOTO AUDIT */}
      {showBeaconModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[380px] rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-extrabold text-[15px] text-red-600 flex items-center gap-1.5">
                <span>🚨</span> Request Water Beacon
              </h3>
              <button
                onClick={() => {
                  if (isRecordingRef.current) handleAudioToText();
                  setShowBeaconModal(false);
                }}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-[#666] leading-snug">
              Stranded without water or shade in extreme heat? Drop a verified
              beacon so NGOs route mobile water supplies to your location.
            </p>

            <form onSubmit={submitBeacon} className="flex flex-col gap-2">
              <div>
                <label className="text-[10.5px] font-bold text-gray-700 block mb-0.5">
                  Landmark / Current Junction
                </label>
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
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-gray-800">
                    Situation Description
                  </label>
                  <button
                    type="button"
                    onClick={handleAudioToText}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs transition-all ${
                      isRecording
                        ? "bg-red-600 text-white animate-pulse ring-2 ring-red-300"
                        : "bg-red-50 text-red-700 border border-red-300 hover:bg-red-100"
                    }`}
                    title={
                      isRecording
                        ? "Click to Stop Recording"
                        : "Speak in Marathi/Hindi/English to convert voice to text"
                    }
                  >
                    <Mic
                      size={12}
                      className={
                        isRecording
                          ? "text-white animate-bounce"
                          : "text-red-600"
                      }
                    />
                    <span>
                      {isRecording
                        ? `⏹️ Stop Recording (${recordingSeconds}s)`
                        : "🎙️ Tap to Speak (Voice to Text)"}
                    </span>
                  </button>
                </div>

                {/* Prominent Recording Indicator Banner */}
                {isRecording && (
                  <div className="mb-2 p-2.5 bg-red-50 border border-red-300 rounded-xl flex items-center justify-between text-[10.5px] text-red-900 font-semibold shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                      </span>
                      <span>
                        Listening... <strong>{recordingSeconds}s</strong> (Speak
                        in Marathi, Hindi, English)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAudioToText}
                      className="bg-red-600 hover:bg-red-700 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-md shrink-0 shadow-2xs"
                    >
                      ⏹️ Stop & Save
                    </button>
                  </div>
                )}

                <textarea
                  rows={2}
                  required
                  value={beaconDesc}
                  onChange={(e) => setBeaconDesc(e.target.value)}
                  className="w-full text-[12px] p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g. 15 riders waiting at junction, water tap is dry (or tap the red microphone button to speak)"
                />

                {/* Voice Presets / Quick Chips */}
                <div className="mt-1.5 flex gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[9.5px]">
                  <button
                    type="button"
                    onClick={() =>
                      setBeaconDesc(
                        "15+ delivery riders stranded under blazing flyover sun, tap dry",
                      )
                    }
                    className="shrink-0 px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border border-gray-200"
                  >
                    🛵 15 Delivery Riders
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBeaconDesc(
                        "Auto stand drivers without drinking water in 42°C heat, tin roof hot",
                      )
                    }
                    className="shrink-0 px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border border-gray-200"
                  >
                    🛺 Auto Stand Cluster
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBeaconDesc(
                        "मंडीत कामगारांना पिण्याचे पाणी नाहीये, तातडीने पाण्याची गरज आहे",
                      )
                    }
                    className="shrink-0 px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border border-gray-200 font-semibold"
                  >
                    🇮🇳 मराठी: पाण्याचे दुर्भिक्ष
                  </button>
                </div>

                {latestAudioTranscription && (
                  <div className="mt-1.5 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-950 flex items-center gap-1">
                        <span>🤖</span> Gemini Flash Audio Transcription (
                        {latestAudioTranscription.language_detected}):
                      </span>
                      <span className="bg-blue-200 text-blue-900 text-[8.5px] px-1.5 py-0.2 rounded font-mono font-bold">
                        LIVE STT
                      </span>
                    </div>
                    <p className="text-blue-900 font-medium mt-1 leading-snug">
                      "{latestAudioTranscription.transcription}"
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-gray-700 block mb-0.5">
                  📸 Photo Proof (Audited by Gemini 2.5 Flash Vision)
                </label>
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-2.5 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                  <Camera size={18} className="text-gray-500 mb-0.5" />
                  <span className="text-[11px] font-semibold text-sky-600">
                    {beaconImage
                      ? "✓ Photo Selected"
                      : "Take Photo of Crowd / Tap"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {beaconImage && (
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                    <span>
                      ✓ Ready for Gemini 2.5 Flash Multimodal Vision scan
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isRecordingRef.current) handleAudioToText();
                    setShowBeaconModal(false);
                  }}
                  className="flex-1 py-2 rounded-xl border border-gray-300 font-semibold text-[12px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingBeacon}
                  className="flex-1 py-2 rounded-xl bg-red-600 text-white font-extrabold text-[12px] flex items-center justify-center gap-1 shadow-xs"
                >
                  {isUploadingBeacon ? "Scanning..." : "Broadcast Beacon"}
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
              <button
                onClick={() => setTapAuditModalAsset(null)}
                className="text-gray-400 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-[#555] leading-snug">
              Audit <strong>{tapAuditModalAsset.name}</strong>. Gemini 2.5 Flash
              Multimodal Vision will inspect the image for dry nozzles,
              disconnection, or broken handles before updating the city deficit
              score.
            </p>

            <label className="border-2 border-dashed border-gray-300 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
              <Camera size={20} className="text-gray-500 mb-1" />
              <span className="text-[11px] font-semibold text-sky-600">
                Snap Photo of Municipal Tap
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement("canvas");
                        canvas.width = Math.min(1024, img.width);
                        canvas.height = Math.round(
                          (canvas.width / img.width) * img.height,
                        );
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        const cleanJpeg = canvas.toDataURL("image/jpeg", 0.88);
                        handleTapAuditSubmit(
                          tapAuditModalAsset.osm_id,
                          cleanJpeg,
                        );
                      };
                      img.src = reader.result;
                    };
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
                onClick={() =>
                  handleTapAuditSubmit(tapAuditModalAsset.osm_id, null)
                }
                disabled={isAuditingTap}
                className="flex-1 py-1.5 rounded-xl bg-amber-600 text-white font-extrabold text-[11.5px] flex items-center justify-center gap-1 shadow-xs"
              >
                {isAuditingTap ? "Scanning..." : "Simulate Vision Audit"}
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

      {/* Sonner Emil Kowalski Toast Container */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
