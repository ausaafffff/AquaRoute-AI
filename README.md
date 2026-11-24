# AquaRoute-AI

[![Live Demo](https://img.shields.io/badge/live-demo-1677ff)](https://aqua-route-ai.vercel.app/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

AquaRoute-AI is a university IBM project that explores AI and geospatial methods for urban mobility and waterlogging risk awareness in Lucknow, India. It combines a Python API, a Random Forest experiment, geospatial analysis notebooks, and an interactive React map interface.

> **Prototype notice:** AquaRoute-AI is an academic demonstration, not an emergency service or real-time navigation system. Estimates and generated route paths should not be used for travel decisions without checking current official advisories and road conditions.

## Introduction

Urban flooding and waterlogging can disrupt transportation, increase travel risks, and limit access to essential areas. AquaRoute-AI is a research-oriented web application that combines machine learning concepts, elevation data, rainfall simulation, and geospatial visualization to raise awareness of potential waterlogging risks.

The project currently demonstrates two estimated routing options:

- A direct route between selected locations.
- A flood-aware alternative that considers elevation and simulated rainfall.

## What Makes AquaRoute AIUseful?

AquaRoute-AI provides an accessible prototype for exploring waterlogging risk during urban travel planning.

- Combines artificial intelligence with geospatial risk analysis.
- Presents 22 configured hotspots across Lucknow.
- Supports both predefined locations and custom map points.
- Allows users to adjust rainfall conditions interactively.
- Compares route distance, estimated travel time, and risk indicators.
- Runs a React interface alongside a FastAPI backend.
- Includes fallback routing calculations when the API is unavailable.

## Features

- Compare a direct route with an estimated flood-aware alternative.
- Select locations from 22 configured Lucknow hotspots.
- Search for streets and landmarks through OpenStreetMap/Nominatim.
- Place custom start or destination points on an interactive Leaflet map.
- Adjust simulated rainfall and view estimated route risk indicators.
- Visualize waterlogging zones and route summaries.
- Fall back to client-side calculations when the API is unavailable.

## How It Works

1. The user selects a start point and destination, or places custom points on the map.
2. The frontend sends the route parameters to the FastAPI backend.
3. The backend estimates route risk using elevation, rainfall, and the available machine learning model.
4. The application returns direct and flood-aware route estimates.
5. React-Leaflet renders the points, route geometry, and waterlogging context on the map.
6. If the backend is unavailable, the frontend uses its client-side fallback calculations.

## Technology

| Area | Technologies |
|---|---|
| Frontend | React 19, Vite, React-Leaflet, Leaflet, Axios, Lucide React |
| Backend | Python, FastAPI, Uvicorn |
| Machine learning | scikit-learn, pandas, NumPy, Joblib |
| Geospatial analysis | Jupyter Notebook, OSMnx, NetworkX, GeoPandas |

## Project Structure

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
.venv\Scripts\Activate.ps1

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

## Available Scripts

### Backend

```bash
python app.py
python -m pytest tests/test_features.py
```

### Frontend

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## API Overview

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

## Deployment

The live frontend is available at:

https://aqua-route-ai.vercel.app/

When deploying, configure `VITE_API_URL` for a production FastAPI endpoint. The frontend and backend can be hosted separately.

## Data and Model Notes

- The API contains 22 verified Lucknow hotspots and elevation values.
- A baseline Random Forest artifact is loaded from `ml/models/waterlogging_rf_baseline.joblib` when available.
- If the artifact cannot be loaded, the API uses an elevation-and-rainfall fallback formula.
- Route geometry is generated from coordinate waypoints and is illustrative rather than verified road-network routing.
- Live weather, traffic, road closures, and official flood alerts are not integrated.
- Historical labels and model behavior should be independently validated before research or operational use.

## Limitations

- This project is an academic prototype, not an emergency or real-time navigation system.
- Route geometry is illustrative and not verified against road-network routing results.
- The application does not integrate live weather, traffic, road closures, or official flood alerts.
- Risk estimates depend on simulated rainfall and available elevation data.
- Model predictions and historical waterlogging labels require further validation.
- Estimates and generated paths should not be used for travel decisions without checking current official advisories and road conditions.

## Contributing

Contributions that improve documentation, testing, data quality, model validation, and geospatial analysis are welcome.

Before submitting a contribution:

1. Fork the repository.
2. Create a descriptive feature or fix branch.
3. Run the relevant backend and frontend checks.
4. Submit a pull request with a clear summary and testing details.

## Security

Do not submit sensitive information, personal location data, API keys, or production credentials in issues or pull requests.

If a security concern is discovered, report it privately to the repository maintainers rather than publishing it in a public issue.

## License

Released under the [MIT License](LICENSE).

## Authors

Developed by **Ausaaf Siddiqui** and **Pawan Pandey**, Final Year BCA students specializing in Data Science and Artificial Intelligence at Shri Ramswaroop Memorial University, as a university IBM project.

## Live Demo

Try AquaRoute-AI at:

https://aqua-route-ai.vercel.app/
