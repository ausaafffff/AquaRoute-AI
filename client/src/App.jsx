// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import MapView from './components/Map';
import LocationSearch from './components/LocationSearch';
import { LUCKNOW_LOCATIONS, getSafeRoute } from '../services/api';
import {
  Navigation,
  CloudRain,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Layers,
  RefreshCw,
  Waves,
  Activity,
  Droplets,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import './App.css';

export default function App() {
  const [backendOnline, setBackendOnline] = useState(false);
  const [startPoint, setStartPoint] = useState(LUCKNOW_LOCATIONS[5]); // Charbagh
  const [endPoint, setEndPoint] = useState(LUCKNOW_LOCATIONS[9]);     // Gomti Nagar
  const [rainIntensity, setRainIntensity] = useState(55);
  const [showZones, setShowZones] = useState(true);
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);

  async function handleCalculateRoute(overrideStart = null, overrideEnd = null) {
    setLoading(true);
    try {
      const source = overrideStart || startPoint;
      const destination = overrideEnd || endPoint;
      const data = await getSafeRoute({
        rainfallMm: rainIntensity,
        customStart: source,
        customEnd: destination
      });
      setRouteData(data);
    } catch (err) {
      console.error('Routing calculation error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleCalculateRoute();

    fetch('https://aquaroute-ai.onrender.com/api/health')
      .then((res) => {
        if (res.ok) setBackendOnline(true);
      })
      .catch(() => {
        fetch('http://localhost:5000/api/health')
          .then((r) => r.ok && setBackendOnline(true))
          .catch(() => setBackendOnline(false));
      });
  }, []);

  // Map click sets custom Destination
  const handleMapClick = (latlng) => {
    const customPoint = {
      id: `map_${Date.now()}`,
      name: `Dropped Pin (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
      lat: latlng.lat,
      lng: latlng.lng,
      elevation: 118.0
    };
    setEndPoint(customPoint);
    handleCalculateRoute(startPoint, customPoint);
  };

  // Quick Preset Scenarios
  const applyPreset = (startId, endId) => {
    const start = LUCKNOW_LOCATIONS.find((l) => l.id === startId);
    const end = LUCKNOW_LOCATIONS.find((l) => l.id === endId);
    if (start && end) {
      setStartPoint(start);
      setEndPoint(end);
      handleCalculateRoute(start, end);
    }
  };

  return (
    <div className="app-container">
      <div className="ambient-glow top-left"></div>
      <div className="ambient-glow bottom-right"></div>

      <header className="navbar">
        <div className="logo-group">
          <div className="logo-icon-box">
            <Waves className="logo-icon" size={24} />
          </div>
          <div>
            <div className="title-row">
              <h1 className="brand-title">AquaRoute<span className="brand-accent"> AI</span></h1>
            </div>
            <p className="brand-subtitle">Lucknow Smart-City Flood Prediction & Autonomous Rerouting</p>
          </div>
        </div>

        <div className="navbar-stats">
          <div className="telemetry-pill">
            <Activity size={14} className={backendOnline ? "accent-emerald" : "accent-cyan"} />
            <span>
              RF Model: <strong>{backendOnline ? "v1.0 (Active)" : "Offline (Local)"}</strong>
            </span>
          </div>

          <div className="telemetry-pill">
            <Droplets size={14} className="accent-blue" />
            <span>Rain Sensor: <strong>{rainIntensity} mm/h</strong></span>
          </div>

          <a
            href="https://github.com/ausaafffff/AquaRoute-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="telemetry-pill github-pill"
            title="View Source on GitHub"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            <span>ausaafffff/AquaRoute-AI</span>
          </a>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <div className="quick-presets">
            <span className="preset-label">Quick Scenarios:</span>
            <div className="preset-chips">
              <button onClick={() => applyPreset('charbagh', 'hazratganj')}>Station to Market</button>
              <button onClick={() => applyPreset('alambagh', 'airport')}>Airport Transit</button>
              <button onClick={() => applyPreset('chowk', 'gomti_nagar')}>Old to New City</button>
            </div>
          </div>

          <div className="glass-card">
            <div className="card-header-styled">
              <Compass size={18} className="accent-cyan" />
              <h3>Mission Parameters</h3>
            </div>

            {/* Live Search for Origin */}
            <LocationSearch
              label="Starting Point (Origin)"
              placeholder="Search origin address, street, or hotspot..."
              value={startPoint}
              onSelect={(item) => {
                setStartPoint(item);
                handleCalculateRoute(item, endPoint);
              }}
            />

            {/* Live Search for Destination */}
            <LocationSearch
              label="Destination Point"
              placeholder="Search destination, mall, landmark, or street..."
              value={endPoint}
              onSelect={(item) => {
                setEndPoint(item);
                handleCalculateRoute(startPoint, item);
              }}
            />

            <div className="rain-slider-container">
              <div className="slider-header-flex">
                <span className="slider-title"><CloudRain size={16} /> Simulated Rain Influx</span>
                <span className={`rain-badge-value ${rainIntensity > 60 ? 'storm' : rainIntensity > 30 ? 'moderate' : 'light'}`}>
                  {rainIntensity} mm/hr
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={rainIntensity}
                onChange={(e) => setRainIntensity(Number(e.target.value))}
                className="styled-slider"
              />
              <div className="rain-scale-labels">
                <span className={rainIntensity <= 25 ? 'highlight' : ''}>Drizzle</span>
                <span className={rainIntensity > 25 && rainIntensity <= 60 ? 'highlight' : ''}>Heavy Monsoon</span>
                <span className={rainIntensity > 60 ? 'highlight-danger' : ''}>Cloudburst</span>
              </div>
            </div>

            <button
              className="btn-glow-primary"
              onClick={() => handleCalculateRoute()}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="spin" size={18} /> Re-routing Neural Grid...
                </>
              ) : (
                <>
                  <Navigation size={18} /> Compute Safe Alternate Route
                </>
              )}
            </button>

            <button
              className="btn-ghost-secondary"
              onClick={() => setShowZones(!showZones)}
            >
              <Layers size={16} /> {showZones ? 'Hide Active Hazard Spheres' : 'Show Active Hazard Spheres'}
            </button>
          </div>

          {routeData && (
            <div className="glass-card comparison-section">
              <div className="card-header-styled">
                <ShieldCheck size={18} className="accent-emerald" />
                <h3>Telemetry Analysis</h3>
              </div>

              <div className="comparison-card safe-card">
                <div className="comparison-badge green">
                  <CheckCircle2 size={12} /> RECOMMENDED BY AI
                </div>
                <div className="card-inner-title">AquaRoute Flood-Safe Detour</div>

                <div className="metrics-triad">
                  <div className="metric-cell">
                    <span className="metric-val text-green">{routeData.safeRoute.etaMins}</span>
                    <span className="metric-lbl">EST. MINS</span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-val">{routeData.safeRoute.distanceKm}</span>
                    <span className="metric-lbl">DISTANCE (KM)</span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-val text-green">0</span>
                    <span className="metric-lbl">FLOODED PTS</span>
                  </div>
                </div>

                <div className="smart-perk">
                  <TrendingUp size={14} className="accent-emerald" />
                  <span><strong>{routeData.safeRoute.riskReductionPct}% safer</strong> through high-elevation ridges (+120m).</span>
                </div>
              </div>

              <div className="comparison-card danger-card">
                <div className="comparison-badge red">
                  <AlertTriangle size={12} /> FLOOD INUNDATION DETECTED
                </div>
                <div className="card-inner-title">Direct Standard Route</div>

                <div className="metrics-triad">
                  <div className="metric-cell">
                    <span className="metric-val text-red">{routeData.defaultRoute.etaMins}</span>
                    <span className="metric-lbl">DELAYED MINS</span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-val">{routeData.defaultRoute.distanceKm}</span>
                    <span className="metric-lbl">DISTANCE (KM)</span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-val text-red">~{routeData.defaultRoute.floodedSegments}</span>
                    <span className="metric-lbl">FLOODED PTS</span>
                  </div>
                </div>

                <div className="flood-meter">
                  <div className="meter-label">
                    <span>Est. Max Submersion:</span>
                    <strong>~{routeData.defaultRoute.waterDepthMaxCm} cm</strong>
                  </div>
                  <div className="meter-track">
                    <div
                      className="meter-fill"
                      style={{ width: `${Math.min(100, (routeData.defaultRoute.waterDepthMaxCm / 60) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        <main className="map-section">
          <MapView
            routeData={routeData}
            showZones={showZones}
            rainIntensity={rainIntensity}
            onMapClick={handleMapClick}
          />
        </main>
      </div>
    </div>
  );
}