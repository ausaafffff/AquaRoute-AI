// client/src/components/Map.jsx
import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Circle,
  Polyline,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapHUD from './MapHUD';

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// 18 Verified Historical Lucknow Waterlogging Zones (Guaranteed Fallback)
const DEFAULT_LUCKNOW_HAZARDS = [
  { id: 1, name: 'Hazratganj Lowpoint', lat: 26.8548, lng: 80.9448, severity: 'high', source: 'NewsDrum' },
  { id: 2, name: 'Gomti Nagar Drainage Basin', lat: 26.8612, lng: 81.0039, severity: 'high', source: 'NewsDrum / TOI' },
  { id: 3, name: 'Aliganj Underpass', lat: 26.9051, lng: 80.9480, severity: 'high', source: 'NewsDrum' },
  { id: 4, name: 'Charbagh Station Road', lat: 26.8335, lng: 80.9264, severity: 'high', source: 'NewsDrum / TOI' },
  { id: 5, name: 'Chowk Old Drain Corridors', lat: 26.8677, lng: 80.9042, severity: 'high', source: 'NewsDrum' },
  { id: 6, name: 'Indira Nagar Munshipulia Belt', lat: 26.8823, lng: 80.9900, severity: 'high', source: 'NewsDrum / TOI' },
  { id: 7, name: 'Alambagh Canal Road', lat: 26.8140, lng: 80.9025, severity: 'high', source: 'NewsDrum' },
  { id: 8, name: 'Park Road Low-lying Spot', lat: 26.8402, lng: 80.9497, severity: 'high', source: 'Times of India' },
  { id: 9, name: 'Ashiyana Residential Lowland', lat: 26.7996, lng: 80.9174, severity: 'moderate', source: 'Times of India' },
  { id: 10, name: 'Faizullaganj Embankment Zone', lat: 26.8991, lng: 80.9286, severity: 'moderate', source: 'Times of India' },
  { id: 11, name: 'Sarojini Nagar Drain Basin', lat: 26.7475, lng: 80.8639, severity: 'moderate', source: 'Times of India' },
  { id: 12, name: 'Jankipuram Extension', lat: 26.9362, lng: 80.9664, severity: 'moderate', source: 'Times of India' },
  { id: 13, name: 'Meerabai Marg Corridor', lat: 26.8481, lng: 80.9472, severity: 'moderate', source: 'Times of India' },
  { id: 14, name: 'Dalibagh Colony Road', lat: 26.8398, lng: 80.9575, severity: 'moderate', source: 'Times of India' },
  { id: 15, name: 'Butler Palace Canal Belt', lat: 26.8436, lng: 80.9558, severity: 'moderate', source: 'Times of India' },
  { id: 16, name: 'Jiamau Culvert Sector', lat: 26.8354, lng: 80.9631, severity: 'moderate', source: 'Times of India' },
  { id: 17, name: 'Pragnarayan Road Lowland', lat: 26.8415, lng: 80.9592, severity: 'moderate', source: 'Times of India' },
  { id: 18, name: 'KD Singh Babu Metro Area', lat: 26.8532, lng: 80.9403, severity: 'moderate', source: 'Times of India' }
];

// Auto-fitting pill marker badge
const createAutoFitIcon = (tag, placeName, bgColor, borderColor) => {
  const displayName = placeName ? placeName.split(',')[0].trim() : tag;
  return L.divIcon({
    className: 'custom-map-pill-marker',
    html: `
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: ${bgColor};
        border: 2px solid ${borderColor};
        color: #ffffff;
        padding: 5px 12px;
        border-radius: 9999px;
        font-family: 'Inter', -apple-system, sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.3px;
        white-space: nowrap;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
        transform: translate(-50%, -50%);
        pointer-events: auto;
        cursor: pointer;
      ">
        <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#ffffff; box-shadow: 0 0 6px #fff;"></span>
        <span>${tag}: ${displayName}</span>
      </div>
    `,
    iconSize: [1, 1],
    iconAnchor: [0, 0]
  });
};

// Auto-center and fit map bounds
function MapController({ start, destination, routeData }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const points = [];

    if (start?.lat && start?.lng) points.push([start.lat, start.lng]);
    if (destination?.lat && destination?.lng) points.push([destination.lat, destination.lng]);

    const path = routeData?.safeRoute?.path || routeData?.safe_route?.path || routeData?.defaultRoute?.path;
    if (Array.isArray(path) && path.length > 0) {
      path.forEach(pt => points.push(pt));
    }

    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [70, 70], maxZoom: 15 });
    } else if (points.length === 1) {
      map.setView(points[0], 13);
    }
  }, [start, destination, routeData, map]);

  return null;
}

// Map click listener for custom pins
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({
          lat: parseFloat(e.latlng.lat.toFixed(4)),
          lng: parseFloat(e.latlng.lng.toFixed(4)),
          name: `Custom Dropped Pin (${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)})`
        });
      }
    }
  });
  return null;
}

export default function Map({
  start,
  destination,
  hazards = [],
  showZones = true,
  showHazards = true,
  routeData = null,
  onMapClick = null
}) {
  const lucknowCenter = [26.8467, 80.9462];

  // Respect showZones first, then showHazards (defaults to true)
  const displayHazards = showZones !== undefined ? showZones : showHazards;

  // Guaranteed hazards list (uses prop if available, else DEFAULT_LUCKNOW_HAZARDS)
  const activeHazards = (hazards && hazards.length > 0) ? hazards : DEFAULT_LUCKNOW_HAZARDS;

  // Resolve Start (handles start prop, routeData.source, and routeData.start)
  const rawStart = (start && typeof start === 'object' && start.lat)
    ? start
    : (routeData?.source || routeData?.start || null);

  const effectiveStart = rawStart ? {
    name: rawStart.name || 'Start Point',
    lat: Number(rawStart.lat),
    lng: Number(rawStart.lng ?? rawStart.lon),
    elevation: rawStart.elevation
  } : null;

  // Resolve Destination (handles destination prop, routeData.destination, and routeData.end)
  const rawDest = (destination && typeof destination === 'object' && destination.lat)
    ? destination
    : (routeData?.destination || routeData?.end || null);

  const effectiveDest = rawDest ? {
    name: rawDest.name || 'Destination Point',
    lat: Number(rawDest.lat),
    lng: Number(rawDest.lng ?? rawDest.lon),
    elevation: rawDest.elevation
  } : null;

  // Resolve Route polylines
  const defaultPath = routeData?.defaultRoute?.path || routeData?.standard_route?.path || [];
  const safePath = routeData?.safeRoute?.path || routeData?.safe_route?.path || [];

  const defaultMeta = routeData?.defaultRoute || routeData?.standard_route;
  const safeMeta = routeData?.safeRoute || routeData?.safe_route;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={lucknowCenter}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <MapController start={effectiveStart} destination={effectiveDest} routeData={routeData} />
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

        {/* Base Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 18 Historical Waterlogging Inundation Zones */}
        {displayHazards && activeHazards.map((zone, idx) => {
          const isHigh = zone.severity?.toLowerCase() === 'high';
          const color = isHigh ? '#ef4444' : '#f59e0b';
          const radius = isHigh ? 550 : 400;

          return (
            <Circle
              key={zone.id || idx}
              center={[zone.lat, zone.lng]}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.28,
                weight: 1.5,
                dashArray: '6, 6'
              }}
            >
              <Tooltip direction="top" opacity={0.96} sticky>
                <div style={{ textAlign: 'left', minWidth: '150px', padding: '3px 0' }}>
                  <div style={{ color: color, fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                    ⚠️ {isHigh ? 'Severe Waterlogging Zone' : 'Moderate Inundation'}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a', marginTop: '2px' }}>
                    {zone.name}
                  </div>
                  {zone.source && (
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
                      Reported by: {zone.source}
                    </div>
                  )}
                </div>
              </Tooltip>
              <Popup>
                <div style={{ padding: '4px' }}>
                  <h4 style={{ margin: '0 0 4px', color: color }}>{zone.name}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                    Historical monsoon waterlogging hazard area.
                  </p>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Standard / Flooded Route (Dashed Red Line) */}
        {defaultPath.length > 0 && (
          <Polyline
            positions={defaultPath}
            pathOptions={{
              color: '#ef4444',
              weight: 4.5,
              opacity: 0.85,
              dashArray: '8, 8'
            }}
          >
            <Tooltip direction="center" opacity={0.95} sticky>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#ef4444' }}>
                Standard Route (Flooded Path)
                {defaultMeta?.etaMins && <div>ETA: {defaultMeta.etaMins} mins (Risk: {defaultMeta.riskLevel})</div>}
              </div>
            </Tooltip>
          </Polyline>
        )}

        {/* AquaRoute-AI Safe Detour (Solid Emerald Line) */}
        {safePath.length > 0 && (
          <Polyline
            positions={safePath}
            pathOptions={{
              color: '#10b981',
              weight: 5.5,
              opacity: 0.95
            }}
          >
            <Tooltip direction="center" opacity={0.95} sticky>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>
                AquaRoute AI Safe Detour
                {safeMeta?.etaMins && <div>ETA: {safeMeta.etaMins} mins (0 Flooded Segments)</div>}
              </div>
            </Tooltip>
          </Polyline>
        )}

        {/* START POINT MARKER */}
        {effectiveStart?.lat && effectiveStart?.lng && (
          <Marker
            position={[effectiveStart.lat, effectiveStart.lng]}
            icon={createAutoFitIcon('Start', effectiveStart.name, '#2563eb', '#60a5fa')}
          >
            <Tooltip direction="top" offset={[0, -12]} opacity={0.98}>
              <div style={{ textAlign: 'left', minWidth: '140px', padding: '2px 0' }}>
                <strong style={{ color: '#2563eb' }}>🟢 Starting Point</strong>
                <div style={{ fontWeight: 600, marginTop: '2px', color: '#0f172a' }}>
                  {effectiveStart.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Lat: {effectiveStart.lat.toFixed(4)}, Lng: {effectiveStart.lng.toFixed(4)}
                </div>
                {effectiveStart.elevation && (
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                    Elevation: {effectiveStart.elevation}m
                  </div>
                )}
              </div>
            </Tooltip>
            <Popup>
              <div style={{ padding: '4px' }}>
                <strong>{effectiveStart.name}</strong>
                <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Starting hub for trip routing</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* DESTINATION POINT MARKER */}
        {effectiveDest?.lat && effectiveDest?.lng && (
          <Marker
            position={[effectiveDest.lat, effectiveDest.lng]}
            icon={createAutoFitIcon('Dest', effectiveDest.name, '#059669', '#34d399')}
          >
            <Tooltip direction="top" offset={[0, -12]} opacity={0.98}>
              <div style={{ textAlign: 'left', minWidth: '140px', padding: '2px 0' }}>
                <strong style={{ color: '#059669' }}>🏁 Destination Point</strong>
                <div style={{ fontWeight: 600, marginTop: '2px', color: '#0f172a' }}>
                  {effectiveDest.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Lat: {effectiveDest.lat.toFixed(4)}, Lng: {effectiveDest.lng.toFixed(4)}
                </div>
                {effectiveDest.elevation && (
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                    Elevation: {effectiveDest.elevation}m
                  </div>
                )}
              </div>
            </Tooltip>
            <Popup>
              <div style={{ padding: '4px' }}>
                <strong>{effectiveDest.name}</strong>
                <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Trip destination point</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* LUCKNOW WATERLOGGING HUD (Bottom-Right Legend Box) */}
      <MapHUD showHazards={displayHazards} activeHazardCount={activeHazards.length} />
    </div>
  );
}