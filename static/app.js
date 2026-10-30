// HeatAtlas Frontend - Apple Bento Grid Real Map Implementation
let map = null;
let zoneLayers = [];
let assetMarkers = [];
let allZones = [];
let currentHour = 0;
let sessionToken = 'sess_' + Math.random().toString(36).substring(2, 9);

// Pune Centroid & Bounds
const PUNE_CENTER = [18.5204, 73.8567];

// Initialize Leaflet Map
function initMap() {
  map = L.map('pune-map', {
    zoomControl: false,
    attributionControl: false
  }).setView(PUNE_CENTER, 11);

  // Real OpenStreetMap Tile Layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    opacity: 0.85
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);
}

// Fetch Forecast and Initialize
async function loadData(hour = 0) {
  try {
    const res = await fetch(`/api/zones?hour=${hour}`);
    const data = await res.json();
    allZones = data.zones || [];

    renderZonePolygons(allZones);
    renderPriorityCards(allZones);

    // Select the top critical zone initially
    if (allZones.length > 0) {
      const topZone = allZones.slice().sort((a, b) => b.rd - a.rd)[0];
      selectZone(topZone);
    }

    if (data.cache_age_seconds !== undefined) {
      const mins = Math.floor(data.cache_age_seconds / 60);
      document.getElementById('freshness-text').textContent = mins > 0 ? `${mins}m ago` : 'Live Meteo';
    }
  } catch (err) {
    console.error('Error loading zones:', err);
    showToast('Failed to connect to HeatAtlas API');
  }
}

// Fetch Relief Assets
async function loadAssets() {
  try {
    const res = await fetch('/api/assets');
    const data = await res.json();
    const assets = data.assets || [];

    // Clear old markers
    assetMarkers.forEach(m => map.removeLayer(m));
    assetMarkers = [];

    const listEl = document.getElementById('assets-list');
    listEl.innerHTML = '';

    assets.forEach(a => {
      // Create Custom Map Pin
      const isWater = a.type === 'drinking_water';
      const isDry = a.status === 'dry';
      const pinColor = isWater ? (isDry ? '#ef4444' : '#0284c7') : '#dc2626';
      const iconHtml = `<div style="background:${pinColor}; width:20px; height:20px; border-radius:50%; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; font-size:10px; color:white;">${isWater ? '💧' : '🏥'}</div>`;

      const customIcon = L.divIcon({
        className: 'custom-pin',
        html: iconHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([a.lat, a.lon], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: 'DM Sans', sans-serif; font-size:12px;">
          <strong>${a.name}</strong><br>
          Type: ${isWater ? 'Drinking Water' : 'Health Clinic'}<br>
          Status: <strong style="color:${isDry ? '#dc2626' : '#16a34a'}">${a.status.toUpperCase()}</strong><br>
          <small>${a.verification_detail || ''}</small>
        </div>
      `);
      assetMarkers.push(marker);

      // Add to sidebar assets list
      const card = document.createElement('div');
      card.className = 'asset-card';
      card.innerHTML = `
        <div class="asset-info">
          <span class="asset-icon">${isWater ? '💧' : '🏥'}</span>
          <div>
            <div class="asset-name">${a.name}</div>
            <div class="asset-meta">${a.verification_detail || (isWater ? 'Drinking Water' : 'Emergency Clinic')}</div>
          </div>
        </div>
        <button class="asset-status-btn ${a.status}" onclick="toggleReport('${a.osm_id}', '${a.status}')">
          ${a.status === 'working' ? '✓ Working' : '⚠️ Dry'}
        </button>
      `;
      listEl.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading assets:', err);
  }
}

// Render 64-polygon Pune grid
function renderZonePolygons(zones) {
  zoneLayers.forEach(l => map.removeLayer(l));
  zoneLayers = [];

  zones.forEach(z => {
    const [s, w, n, e] = z.bbox;
    const bounds = [[s, w], [n, e]];

    let color = '#64748b';
    let fillOpacity = 0.45;
    if (z.temperature >= 41.0) { color = '#dc2626'; fillOpacity = 0.7; }
    else if (z.temperature >= 39.0) { color = '#ea580c'; fillOpacity = 0.6; }
    else if (z.temperature >= 38.0) { color = '#ca8a04'; fillOpacity = 0.5; }
    else if (z.temperature >= 35.0) { color = '#16a34a'; fillOpacity = 0.4; }

    const rect = L.rectangle(bounds, {
      color: color,
      weight: 1.5,
      fillColor: color,
      fillOpacity: fillOpacity
    }).addTo(map);

    rect.on('click', () => selectZone(z));
    rect.bindTooltip(`<strong>${z.name} (${z.id})</strong><br>${z.temperature}°C · Rd: ${z.rd}`, { sticky: true });
    zoneLayers.push(rect);
  });
}

// Select Zone & Update Bento Hero
function selectZone(z) {
  document.getElementById('hero-zone-name').textContent = `${z.name} (${z.id})`;
  document.getElementById('hero-temp').textContent = `${z.temperature}°C`;
  document.getElementById('hero-rd').textContent = z.rd.toLocaleString();
  document.getElementById('hero-vh').textContent = z.vh.toLocaleString();

  const tierBadge = document.getElementById('hero-tier');
  tierBadge.textContent = z.tier.toUpperCase();
  tierBadge.className = `tier-badge ${z.tier.toLowerCase()}`;
}

// Render Priority Cards
function renderPriorityCards(zones) {
  const container = document.getElementById('priority-cards-list');
  container.innerHTML = '';

  const sorted = zones.slice().sort((a, b) => b.rd - a.rd).slice(0, 5);
  const criticalCount = zones.filter(z => z.tier === 'Critical').length;
  document.getElementById('critical-count').textContent = `${criticalCount} Critical`;

  sorted.forEach((z, i) => {
    const card = document.createElement('div');
    card.className = 'bento-zone-card';
    card.onclick = () => {
      selectZone(z);
      map.panTo(z.centroid);
    };
    card.innerHTML = `
      <div class="card-top">
        <span class="zone-name">${i + 1}. ${z.name}</span>
        <span class="tier-badge ${z.tier.toLowerCase()}">${z.tier}</span>
      </div>
      <div class="stat-rd">${z.rd.toLocaleString()}</div>
      <div class="card-footer">
        <span>${z.working_taps} Taps · ${z.clinics} Clinics</span>
        <span>${z.temperature}°C</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// Hour Scrubbing
function onHourChange(val) {
  currentHour = parseInt(val);
  const displayHour = (new Date().getHours() + currentHour) % 24;
  const ampm = displayHour >= 12 ? 'PM' : 'AM';
  const h12 = displayHour > 12 ? displayHour - 12 : (displayHour === 0 ? 12 : displayHour);
  document.getElementById('timeline-display').textContent = `+${currentHour}h (${h12}:00 ${ampm})`;

  loadData(currentHour);
}

// Reset Map to Pune
function resetPuneView() {
  map.setView(PUNE_CENTER, 11);
  showToast('Centered on Pune municipal area');
}

// Locate User
function locateUser() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const userLoc = [pos.coords.latitude, pos.coords.longitude];
        map.setView(userLoc, 14);
        L.circleMarker(userLoc, {
          radius: 8,
          color: '#ffffff',
          weight: 2,
          fillColor: '#0071e3',
          fillOpacity: 1
        }).addTo(map).bindPopup('You are here').openPopup();
        showToast('Located your position');
      },
      () => showToast('Could not access GPS location')
    );
  }
}

// Crowd Report Toggle
async function toggleReport(osmId, currentStatus) {
  const newStatus = currentStatus === 'working' ? 'dry' : 'working';
  try {
    const res = await fetch(`/api/assets/${osmId}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, session_token: sessionToken })
    });
    if (res.ok) {
      showToast(`Marked tap as ${newStatus.toUpperCase()}!`);
      loadAssets();
      loadData(currentHour);
    }
  } catch (err) {
    showToast('Failed to record crowd report');
  }
}

// Request Dispatch Brief from Gemini
async function requestDispatchBrief() {
  const summaryEl = document.getElementById('dispatch-summary');
  summaryEl.textContent = 'Calling Gemini 2.0 Flash tool orchestration...';

  try {
    const res = await fetch('/api/dispatch/brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_text: 'Coordinate 2 volunteer teams and 40 water cans for peak heat zones',
        start: currentHour,
        end: currentHour + 4,
        resources: { teams: 2, water_cans: 40 },
        language: 'en'
      })
    });
    const data = await res.json();
    summaryEl.textContent = data.summary || 'Prioritize Hadapsar and Swargate with mobile water delivery.';
    showToast('Generated operational dispatch brief!');
  } catch (err) {
    summaryEl.textContent = 'Prioritize Hadapsar Mandi and Kasba Peth with emergency water cans.';
  }
}

// Share to WhatsApp
function shareToWhatsApp() {
  const summary = document.getElementById('dispatch-summary').textContent;
  const msg = encodeURIComponent(`🔥 *HeatAtlas Pune Dispatch Brief*\n\n${summary}\n\n*Emergency Helpline:* Call 108 for heat exhaustion.`);
  window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
}

// Toast
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

// Startup
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadData(0);
  loadAssets();
  requestDispatchBrief();
});
