# AquaRoute-AI

[![Live Demo](https://img.shields.io/badge/live-demo-1677ff)](https://aqua-route-ai.vercel.app/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

AquaRoute-AI is a university IBM project that explores AI and geospatial methods for urban mobility and waterlogging risk awareness in Lucknow, India. It combines a Python API, a Random Forest experiment, geospatial analysis notebooks, and an interactive React map interface.

> **Prototype notice:** AquaRoute-AI is an academic demonstration, not an emergency service or real-time navigation system. Estimates and generated route paths should not be used for travel decisions without checking current official advisories and road conditions.

## Features

- Compare a direct route with an estimated flood-aware alternative.
- Select locations from 22 configured Lucknow hotspots.
- Search for streets and landmarks through OpenStreetMap/Nominatim.
- Place custom start or destination points on an interactive Leaflet map.
- Adjust simulated rainfall and view estimated route risk indicators.
- Visualize waterlogging zones and route summaries.
- Fall back to client-side calculations when the API is unavailable.

## Technology

| Area | Technologies |
|---|---|
| Frontend | React 19, Vite, React-Leaflet, Leaflet, Axios, Lucide React |
| Backend | Python, FastAPI, Uvicorn |
| Machine learning | scikit-learn, pandas, NumPy, Joblib |
| Geospatial analysis | Jupyter Notebook, OSMnx, NetworkX, GeoPandas |

## Repository Structure

```text
.
├── app.py                  # FastAPI application and route-risk API
├── client/                 # React + Vite frontend
│   ├── services/           # API and location-search integration
│   └── src/                # Application components and styles
├── data/                   # Dataset and waterlogging labels
├── docs/                   # Project label notes and documentation
├── ml/models/              # Baseline model and trained artifact
├── notebooks/              # Data, geospatial, and modeling notebooks
├── scripts/                # Routing and utility experiments
├── src/                    # Feature engineering and data collection code
├── tests/                  # Python tests and model prototype
├── requirements.txt        # Python dependencies
└── LICENSE
```

## Getting Started

### Prerequisites

- Python 3.10 or later
- Node.js 18 or later with npm

### 1. Clone the repository

```bash
git clone https://github.com/ausaafffff/AquaRoute-AI.git
cd AquaRoute-AI
```

### 2. Run the backend

```bash
python -m venv .venv

# macOS/Linux
source .venv/bin/activate

# Windows PowerShell
# .venv\Scripts\Activate.ps1

python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

The API runs at `http://localhost:5000` by default.

Interactive API documentation is available at `http://localhost:5000/docs`.

### 3. Run the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

By default, the frontend targets `http://localhost:5000/api`. Set `VITE_API_URL` before starting Vite to use a different API base URL.

```bash
VITE_API_URL=https://your-api.example.com/api npm run dev
```

### Production build

```bash
cd client
npm run build
npm run preview
```

## API

### `GET /api/health`

Check service availability.

```json
{
  "status": "online",
  "service": "AquaRoute-AI Backend"
}
```

### `GET /api/locations`

Return the configured Lucknow locations and their coordinates.

### `POST /api/route`

Calculate direct and alternate route estimates.

```json
{
  "startId": "charbagh",
  "endId": "gomti_nagar",
  "rainfallMm": 40,
  "customStart": null,
  "customEnd": null
}
```

| Field | Type | Description |
|---|---|---|
| `startId` | string | Configured origin ID; defaults to `charbagh` |
| `endId` | string | Configured destination ID; defaults to `gomti_nagar` |
| `rainfallMm` | number | Simulated rainfall in millimetres |
| `customStart` | object | Optional custom origin with `lat` and `lng` |
| `customEnd` | object | Optional custom destination with `lat` and `lng` |

The response includes `source`, `destination`, `rainfall`, `defaultRoute`, and `safeRoute`. Route objects contain a coordinate `path`, distance, ETA, risk level, and risk-related metrics.

## Development

Run the feature tests:

```bash
python -m pytest tests/test_features.py
```

Run frontend checks:

```bash
cd client
npm run lint
npm run build
```

## Data and Model Notes

- The API contains 22 verified Lucknow hotspots and elevation values.
- A baseline Random Forest artifact is loaded from `ml/models/waterlogging_rf_baseline.joblib` when available.
- If the artifact cannot be loaded, the API uses an elevation-and-rainfall fallback formula.
- Route geometry is generated from coordinate waypoints and is illustrative rather than verified road-network routing.
- Live weather, traffic, road closures, and official flood alerts are not integrated.
- Historical labels and model behavior should be independently validated before research or operational use.

## License

Released under the [MIT License](LICENSE).

## Authors

Developed by **Ausaaf Siddiqui** and **Pawan Pandey**, Final Year BCA students specializing in Data Science and Artificial Intelligence at Shri Ramswaroop Memorial University, as a university IBM project.
