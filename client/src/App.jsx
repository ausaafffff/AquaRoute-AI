// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import MapView from './components/Map';
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
  const [startId, setStartId] = useState('charbagh');
  const [endId, setEndId] = useState('gomti_nagar');
  const [rainIntensity, setRainIntensity] = useState(55);
  const [showZones, setShowZones] = useState(true);
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [customEndCoords, setCustomEndCoords] = useState(null);

  async function handleCalculateRoute(overrideEnd = null) {
    setLoading(true);
    try {
      const destination = overrideEnd || customEndCoords;
      const data = await getSafeRoute({
        startId,
        endId,
        rainfallMm: rainIntensity,
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

    // Check live connection to Python Flask backend
    fetch('http://localhost:5000/api/health')
      .then((res) => {
        if (res.ok) setBackendOnline(true);
      })
      .catch(() => setBackendOnline(false));
  }, []);

  const handleMapClick = (latlng) => {
    const customPoint = {
      name: `Pin (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
      lat: latlng.lat,
      lng: latlng.lng,
      elevation: 118.0
    };
    setCustomEndCoords(customPoint);
    handleCalculateRoute(customPoint);
  };

  const applyPreset = (start, end) => {
    setCustomEndCoords(null);
    setStartId(start);
    setEndId(end);
    getSafeRoute({ startId: start, endId: end, rainfallMm: rainIntensity }).then(setRouteData);
  };

  return (
    <div className="app-container">
      <div className="ambient-glow top-left"></div>
      <div className="ambient-glow bottom-right"></div>

      {/* Top Futuristic Navigation Bar */}
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

          {/* GitHub Repo Button with universal inline SVG */}
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

      {/* Main Body */}
      <div className="main-content">
        <aside className="sidebar">
          {/* Quick Presets */}
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

            <div className="input-group-modern">
              <label>Starting Point (Origin)</label>
              <div className="select-container">
                <select value={startId} onChange={(e) => setStartId(e.target.value)}>
                  {LUCKNOW_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id} disabled={loc.id === endId}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group-modern">
              <label>
                Destination Point {customEndCoords && <span className="custom-indicator">(Map Dropped)</span>}
              </label>
              <div className="select-container">
                <select
                  value={customEndCoords ? 'custom' : endId}
                  onChange={(e) => {
                    setCustomEndCoords(null);
                    setEndId(e.target.value);
                  }}
                >
                  {customEndCoords && <option value="custom">{customEndCoords.name}</option>}
                  {LUCKNOW_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id} disabled={loc.id === startId}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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