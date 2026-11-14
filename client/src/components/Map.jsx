import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WATERLOGGED_ZONES } from '../../services/api';

// Create custom animated SVG icons
const createCustomIcon = (color, text) =>
  L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background: ${color};
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 800;
        font-size: 11px;
        letter-spacing: 0.4px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.45);
        border: 2px solid #ffffff;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 5px;
      ">
        <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:white;"></span>
        ${text}
      </div>`,
    iconSize: [80, 30],
    iconAnchor: [40, 15]
  });

// Fixes Leaflet container sizing and auto-zooms to Lucknow route
function MapController({ bounds }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size immediately and after layout settles
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
      if (bounds && bounds.length > 1) {
        map.fitBounds(bounds, { padding: [70, 70], maxZoom: 13 });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [bounds, map]);

  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
}

export default function MapView({ routeData, showZones = true, rainIntensity = 40, onMapClick }) {
  const lucknowCenter = [26.8467, 80.9462];

  const bounds = routeData
    ? [...routeData.defaultRoute.path, ...routeData.safeRoute.path]
    : [];

  return (
    <div className="map-wrapper">
      <MapContainer
        center={lucknowCenter}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
        className="leaflet-map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic Auto-Resizer & Bounds Fitter */}
        <MapController bounds={bounds} />
        <MapClickHandler onMapClick={onMapClick} />

        {/* Hazard Inundation Circles */}
        {showZones &&
          WATERLOGGED_ZONES.map((zone) => {
            const isHighRisk = zone.severity === 'high' || rainIntensity > 50;
            const zoneColor = isHighRisk ? '#ef4444' : zone.severity === 'medium' ? '#f59e0b' : '#3b82f6';
            const dynamicRadius = zone.radius * (1 + rainIntensity / 120);

            return (
              <Circle
                key={zone.id}
                center={[zone.lat, zone.lng]}
                radius={dynamicRadius}
                pathOptions={{
                  color: zoneColor,
                  fillColor: zoneColor,
                  fillOpacity: isHighRisk ? 0.38 : 0.22,
                  weight: 2,
                  dashArray: isHighRisk ? '4, 4' : null
                }}
              >
                <Popup>
                  <div style={{ color: '#0f172a', padding: '2px' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: zoneColor, fontSize: '14px', fontWeight: 800 }}>
                      ⚠️ {zone.name}
                    </h4>
                    <p style={{ margin: '3px 0', fontSize: '12px' }}>
                      <strong>Historical Severity:</strong>{' '}
                      <span style={{ textTransform: 'capitalize', color: isHighRisk ? '#dc2626' : '#d97706', fontWeight: 700 }}>
                        {zone.severity}
                      </span>
                    </p>
                    <p style={{ margin: '3px 0', fontSize: '12px' }}>
                      <strong>Predicted Water Depth:</strong> ~{Math.round(zone.waterDepthCm * (rainIntensity / 40))} cm
                    </p>
                    {zone.source && (
                      <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '4px' }}>
                        📰 <em>Source: {zone.source}</em>
                      </p>
                    )}
                  </div>
                </Popup>
              </Circle>
            );
          })}

        {/* Routes */}
        {routeData && (
          <>
            {/* Standard Flooded Route (Red dashed) */}
            <Polyline
              positions={routeData.defaultRoute.path}
              pathOptions={{
                color: '#ef4444',
                weight: 5,
                opacity: 0.75,
                dashArray: '8, 8'
              }}
            />

            {/* AquaRoute Safe Route (Glowing Green) */}
            <Polyline
              positions={routeData.safeRoute.path}
              pathOptions={{
                color: '#10b981',
                weight: 6,
                opacity: 0.95
              }}
            />

            <Marker
              position={[routeData.source.lat, routeData.source.lng]}
              icon={createCustomIcon('#2563eb', 'Start Point')}
            >
              <Popup>
                <strong>Origin:</strong> {routeData.source.name}
              </Popup>
            </Marker>

            <Marker
              position={[routeData.destination.lat, routeData.destination.lng]}
              icon={createCustomIcon('#10b981', 'Destination')}
            >
              <Popup>
                <strong>Destination:</strong> {routeData.destination.name}
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      {/* Floating Modern Legend */}
      <div className="map-legend">
        <div className="legend-title">Lucknow Waterlogging HUD</div>
        <div className="legend-item">
          <span className="legend-line green"></span>
          <span>AquaRoute (Safe Detour)</span>
        </div>
        <div className="legend-item">
          <span className="legend-line red-dashed"></span>
          <span>Direct Route (Flooded)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot red"></span>
          <span>Severe Flood Zone (&lt; 118m)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot orange"></span>
          <span>Moderate Risk Zone</span>
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
          💡 <em>Tip: Click map to set custom pin</em>
        </div>
      </div>
    </div>
  );
}