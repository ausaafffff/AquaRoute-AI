// client/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 22+ Core Key Lucknow Locations
export const LUCKNOW_LOCATIONS = [
  { id: 'alambagh', name: 'Alambagh', lat: 26.8140, lng: 80.9025 },
  { id: 'aliganj', name: 'Aliganj', lat: 26.9051, lng: 80.9480 },
  { id: 'aminabad', name: 'Aminabad Bazaar', lat: 26.8450, lng: 80.9270 },
  { id: 'ashiyana', name: 'Ashiyana', lat: 26.7996, lng: 80.9174 },
  { id: 'butler_palace', name: 'Butler Palace Colony', lat: 26.8436, lng: 80.9558 },
  { id: 'charbagh', name: 'Charbagh Railway Station', lat: 26.8335, lng: 80.9264 },
  { id: 'chowk', name: 'Chowk Heritage Area', lat: 26.8677, lng: 80.9042 },
  { id: 'dalibagh', name: 'Dalibagh', lat: 26.8398, lng: 80.9575 },
  { id: 'faizullaganj', name: 'Faizullaganj', lat: 26.8991, lng: 80.9286 },
  { id: 'gomti_nagar', name: 'Gomti Nagar', lat: 26.8612, lng: 81.0039 },
  { id: 'hazratganj', name: 'Hazratganj', lat: 26.8548, lng: 80.9448 },
  { id: 'indira_nagar', name: 'Indira Nagar', lat: 26.8823, lng: 80.9900 },
  { id: 'jankipuram_ext', name: 'Jankipuram Extension', lat: 26.9362, lng: 80.9664 },
  { id: 'jiamau', name: 'Jiamau', lat: 26.8354, lng: 80.9631 },
  { id: 'kdsingh_metro', name: 'KD Singh Babu Metro Station', lat: 26.8532, lng: 80.9403 },
  { id: 'meerabai_marg', name: 'Meerabai Marg', lat: 26.8481, lng: 80.9472 },
  { id: 'park_road', name: 'Park Road', lat: 26.8402, lng: 80.9497 },
  { id: 'polytechnic', name: 'Polytechnic Chauraha', lat: 26.8720, lng: 80.9980 },
  { id: 'pragnarayan_rd', name: 'Pragnarayan Road', lat: 26.8415, lng: 80.9592 },
  { id: 'sarojini_nagar', name: 'Sarojini Nagar', lat: 26.7475, lng: 80.8639 },
  { id: 'telibagh', name: 'Telibagh Raebareli Rd', lat: 26.7820, lng: 80.9320 },
  { id: 'airport', name: 'CCS International Airport', lat: 26.7606, lng: 80.8893 }
];

export const WATERLOGGED_ZONES = [
  { id: 1, name: 'Hazratganj Lowpoint', lat: 26.8548, lng: 80.9448, severity: 'high', waterDepthCm: 48, radius: 450, source: 'NewsDrum' },
  { id: 2, name: 'Gomti Nagar Drainage Basin', lat: 26.8612, lng: 81.0039, severity: 'high', waterDepthCm: 50, radius: 480, source: 'NewsDrum / TOI' },
  { id: 3, name: 'Aliganj Underpass', lat: 26.9051, lng: 80.9480, severity: 'high', waterDepthCm: 45, radius: 420, source: 'NewsDrum' },
  { id: 4, name: 'Charbagh Station Road', lat: 26.8335, lng: 80.9264, severity: 'high', waterDepthCm: 55, radius: 500, source: 'NewsDrum / TOI' },
  { id: 5, name: 'Chowk Old Drain Corridors', lat: 26.8677, lng: 80.9042, severity: 'high', waterDepthCm: 42, radius: 400, source: 'NewsDrum' },
  { id: 6, name: 'Indira Nagar Munshipulia Belt', lat: 26.8823, lng: 80.9900, severity: 'high', waterDepthCm: 46, radius: 450, source: 'NewsDrum / TOI' },
  { id: 7, name: 'Alambagh Canal Road', lat: 26.8140, lng: 80.9025, severity: 'high', waterDepthCm: 52, radius: 480, source: 'NewsDrum' },
  { id: 8, name: 'Park Road Low-lying Spot', lat: 26.8402, lng: 80.9497, severity: 'high', waterDepthCm: 40, radius: 380, source: 'Times of India' },
  { id: 9, name: 'Ashiyana Residential Lowland', lat: 26.7996, lng: 80.9174, severity: 'medium', waterDepthCm: 32, radius: 360, source: 'Times of India' },
  { id: 10, name: 'Faizullaganj Embankment Zone', lat: 26.8991, lng: 80.9286, severity: 'medium', waterDepthCm: 35, radius: 390, source: 'Times of India' },
  { id: 11, name: 'Sarojini Nagar Drain Basin', lat: 26.7475, lng: 80.8639, severity: 'medium', waterDepthCm: 30, radius: 340, source: 'Times of India' },
  { id: 12, name: 'Jankipuram Extension', lat: 26.9362, lng: 80.9664, severity: 'medium', waterDepthCm: 28, radius: 320, source: 'Times of India' },
  { id: 13, name: 'Meerabai Marg Corridor', lat: 26.8481, lng: 80.9472, severity: 'medium', waterDepthCm: 26, radius: 300, source: 'Times of India' },
  { id: 14, name: 'Dalibagh Colony Road', lat: 26.8398, lng: 80.9575, severity: 'medium', waterDepthCm: 29, radius: 310, source: 'Times of India' },
  { id: 15, name: 'Butler Palace Canal Belt', lat: 26.8436, lng: 80.9558, severity: 'medium', waterDepthCm: 27, radius: 300, source: 'Times of India' },
  { id: 16, name: 'Jiamau Culvert Sector', lat: 26.8354, lng: 80.9631, severity: 'medium', waterDepthCm: 25, radius: 290, source: 'Times of India' },
  { id: 17, name: 'Pragnarayan Road Lowland', lat: 26.8415, lng: 80.9592, severity: 'medium', waterDepthCm: 26, radius: 300, source: 'Times of India' },
  { id: 18, name: 'KD Singh Babu Metro Area', lat: 26.8532, lng: 80.9403, severity: 'medium', waterDepthCm: 30, radius: 320, source: 'Times of India' }
];

function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Live search across Lucknow using OpenStreetMap + Preset Hubs
 */
export async function searchLucknowPlaces(query) {
  if (!query || query.trim().length < 2) return [];
  const clean = query.trim().toLowerCase();

  // 1. Instant local matches
  const local = LUCKNOW_LOCATIONS.filter((l) =>
    l.name.toLowerCase().includes(clean)
  ).map((l) => ({ ...l, type: 'preset' }));

  // 2. Query OpenStreetMap Nominatim for any street, hospital, mall or landmark in Lucknow
  if (clean.length >= 3) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ', Lucknow, Uttar Pradesh'
      )}&countrycodes=in&limit=6&addressdetails=1`;
      
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      if (res.ok) {
        const data = await res.json();
        const osmResults = data.map((item, idx) => {
          const parts = item.display_name.split(',');
          const mainName = parts[0].trim();
          const subName = parts.slice(1, 3).join(',').trim();
          return {
            id: `osm_${item.place_id || idx}`,
            name: mainName,
            subName: subName || 'Lucknow',
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            elevation: 118.0,
            type: 'osm'
          };
        });

        // Merge without duplicate coordinates
        const combined = [...local];
        for (const osm of osmResults) {
          if (!combined.some((c) => Math.abs(c.lat - osm.lat) < 0.004 && Math.abs(c.lng - osm.lng) < 0.004)) {
            combined.push(osm);
          }
        }
        return combined;
      }
    } catch {
      // Fallback to local on network interruption
    }
  }

  return local;
}

/**
 * Fetch route and waterlogging prediction
 */
export async function getSafeRoute({ startId, endId, rainfallMm = 45, customStart = null, customEnd = null }) {
  try {
    const res = await fetch(`${API_BASE_URL}/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startId, endId, rainfallMm, customStart, customEnd }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    console.warn('Backend API not reachable. Using client routing engine.');
  }

  // Resolve start & end points (supports presets, custom geocoded pins, and map clicks)
  const startLoc = customStart || (LUCKNOW_LOCATIONS.find((l) => l.id === startId) || LUCKNOW_LOCATIONS[0]);
  const endLoc = customEnd || (LUCKNOW_LOCATIONS.find((l) => l.id === endId) || LUCKNOW_LOCATIONS[1]);

  const straightDistKm = calculateHaversineKm(startLoc.lat, startLoc.lng, endLoc.lat, endLoc.lng);
  const defaultDistanceKm = Number((Math.max(1.2, straightDistKm * 1.32)).toFixed(1));
  const safeDistanceKm = Number((defaultDistanceKm * 1.18).toFixed(1));

  const floodRiskFactor = rainfallMm / 100;
  const floodedCount = Math.max(0, Math.min(6, Math.round(floodRiskFactor * (defaultDistanceKm / 2.2))));
  const maxWaterDepth = Math.round(floodRiskFactor * 55);

  const normalTravelMins = Math.round((defaultDistanceKm / 28) * 60);
  const waterDelayMins = Math.round(floodedCount * 8 + (rainfallMm > 35 ? (rainfallMm / 10) * 2.5 : 0));
  const defaultEtaMins = normalTravelMins + waterDelayMins;
  const safeEtaMins = Math.round((safeDistanceKm / 38) * 60) + 3;

  const midLat = (startLoc.lat + endLoc.lat) / 2;
  const midLng = (startLoc.lng + endLoc.lng) / 2;
  const offset = (endLoc.lng - startLoc.lng) >= 0 ? 0.012 : -0.012;

  const directPath = [
    [startLoc.lat, startLoc.lng],
    [midLat - 0.004, midLng - 0.003],
    [midLat, midLng],
    [midLat + 0.004, midLng + 0.002],
    [endLoc.lat, endLoc.lng]
  ];

  const safePath = [
    [startLoc.lat, startLoc.lng],
    [startLoc.lat + 0.008, startLoc.lng + offset],
    [midLat + 0.014, midLng + (offset * 1.4)],
    [endLoc.lat + 0.005, endLoc.lng + (offset * 0.4)],
    [endLoc.lat, endLoc.lng]
  ];

  return {
    source: startLoc,
    destination: endLoc,
    rainfall: rainfallMm,
    defaultRoute: {
      path: directPath,
      distanceKm: defaultDistanceKm,
      etaMins: defaultEtaMins,
      riskLevel: rainfallMm > 50 ? 'CRITICAL' : rainfallMm > 25 ? 'HIGH' : 'MODERATE',
      floodedSegments: floodedCount,
      waterDepthMaxCm: maxWaterDepth
    },
    safeRoute: {
      path: safePath,
      distanceKm: safeDistanceKm,
      etaMins: safeEtaMins,
      riskLevel: 'LOW',
      floodedSegments: 0,
      riskReductionPct: Math.min(97, Math.max(72, Math.round(85 + (rainfallMm / 10))))
    }
  };
}