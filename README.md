# AquaRoute-AI

**AI-assisted waterlogging risk estimation and route planning for Lucknow, India**  
University IBM Project

AquaRoute-AI is a prototype that explores how rainfall, terrain and reported waterlogging locations can inform safer urban travel. It pairs a Python API with a React map-based client and a collection of geospatial and machine-learning notebooks. The current demo focuses on selected locations in Lucknow.

# AquaRoute-AI

**AI-assisted waterlogging risk estimation and route planning for Lucknow, India**  
University IBM Project

AquaRoute-AI is a prototype that combines rainfall, elevation and reported waterlogging data to estimate route risk and suggest safer alternatives. It uses a Python API, a React/Leaflet frontend, geospatial utilities and machine-learning experiments.

The current client supports live location searching, custom map pins and rain-intensity simulation. It remains a demonstration system rather than an emergency or live navigation tool.

> **Important:** 
> - This is an academic prototype, not an emergency service or a live navigation system. Its risk estimates and suggested paths are approximations, may rely on static or illustrative data, and should not be used as the sole basis for travel decisions. Check current local advisories and road conditions before travelling.
> - Risk estimates and route paths are approximations based on static data, heuristic calculations and an optional model artifact. Verify current local advisories and road conditions before travelling.

## Features

- Search for origin and destination locations in Lucknow.
- Query OpenStreetMap/Nominatim for streets, landmarks, hospitals and other places.
- Select locations from the built-in Lucknow hotspot catalogue.
- Place a custom destination directly on the interactive map.
- Adjust simulated rainfall intensity.
- Compare a direct route with a generated flood-aware alternative.
- Visualize reported hazard zones and dynamically sized risk circles.
- Automatically fall back to client-side route estimation when the backend is unavailable.
- View estimated distance, travel time, flooded segments and water depth.

## Location Search

The frontend provides separate autocomplete search controls for the origin and destination.

### Search behavior

- Searches are debounced before API requests.
- Matching entries from the local Lucknow location catalogue appear immediately.
- With at least three characters, the service queries OpenStreetMap's Nominatim service for additional results across Lucknow.
- Duplicate coordinates are removed before combining local and external results.
- Results can include streets, landmarks, malls, hospitals and local points of interest.
- If Nominatim is unavailable or a network request fails, local results remain available.
- Blank search fields display a short list of popular local hotspots.
- Clicking the map sets a custom destination pin.

Live search results are converted into coordinates with an assumed elevation of `118.0 m`. Because Nominatim data is external, its availability and accuracy depend on the public search service.

## Technology

### Frontend

- React
- Vite
- React-Leaflet
- Leaflet
- Lucide React
- Nominatim/OpenStreetMap search
- OpenStreetMap map tiles
- Axios and native `fetch`

### Backend

- Python
- Flask
- Flask-CORS
- NumPy
- Joblib
- Gunicorn

### Data and Machine Learning

- Jupyter Notebook
- pandas
- scikit-learn
- OSMnx
- NetworkX
- GeoPandas
- Random Forest model experiments

Python dependencies are listed in [`requirements.txt`](requirements.txt), and frontend dependencies are in [`client/package.json`](client/package.json).

## Repository Layout

```text
.
├── app.py                         # Flask API and route-risk estimation
├── client/
│   ├── services/api.js            # Location search, API requests and local fallback
│   ├── public/                    # Static public assets
│   └── src/
│       ├── App.jsx                # Application state and dashboard
│       ├── components/
│       │   ├── LocationSearch.jsx # Autocomplete location search
│       │   └── Map.jsx            # Leaflet map, routes and hazard circles
│       └── App.css                # Application styling
├── data/
│   └── labels/
│       └── waterlogging_reports.csv
├── docs/
│   └── label_log.md               # Data-label research and caveats
├── ml/
│   └── models/
│       ├── baseline_models.py
│       └── waterlogging_rf_baseline.joblib
├── notebooks/                     # Rainfall, roads, elevation and model analysis
├── scripts/
│   └── routing.py                 # NetworkX/OSMnx routing experiments
├── src/
│   ├── features.py
│   ├── collection/                # Data collection utilities
│   └── label_checks.py
├── tests/
│   ├── test_features.py
│   └── test_model.py
├── requirements.txt
└── LICENSE
```

## How It Works

1. The user searches for an origin and destination or places a destination marker on the map.
2. The frontend sends the coordinates, rainfall value and optional custom locations to the Flask API.
3. The backend calculates:
   - Haversine straight-line distance
   - Estimated direct-route distance
   - Estimated alternative-route distance
   - Waterlogging risk
   - Travel estimates
   - Flooded-segment count
   - Maximum estimated water depth
4. The API returns a direct route and a generated detour.
5. The React frontend overlays both routes, start/destination markers and reported hazard areas on Leaflet.
6. If the backend cannot be reached, the frontend calculates a local fallback route and renders the result.

The route geometries are generated from coordinate waypoints. They are not confirmed road-network paths and do not include live traffic or road closures.

## Getting Started

### Prerequisites

- Python 3.10 or later
- Node.js and npm

### 1. Clone the repository

```bash
git clone https://github.com/ausaafffff/AquaRoute-AI.git
cd AquaRoute-AI
```

### 2. Set up the backend

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

The Flask service starts on `http://localhost:5000`.

To deactivate the virtual environment later:

```bash
deactivate
```

### Windows activation

```powershell
.venv\Scripts\Activate.ps1
```

### 3. Start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

The frontend uses `VITE_API_URL` when it is configured. Otherwise, it defaults to:

```text
http://localhost:5000/api
```

To create a production frontend build:

```bash
npm run build
npm run preview
```

## API Reference

### `GET /api/health`

Returns the status of the Flask service.

```json
{
  "status": "online",
  "service": "AquaRoute-AI Backend"
}
```

### `GET /api/locations`

Returns the built-in Lucknow locations with IDs, coordinates and elevation values.

### `POST /api/route`

Calculates direct and alternate route estimates.

Example request:

```json
{
  "startId": "charbagh",
  "endId": "gomti_nagar",
  "rainfallMm": 40,
  "customStart": null,
  "customEnd": null
}
```

Supported fields:

| Field | Type | Description |
| --- | --- | --- |
| `startId` | string | Built-in location ID used when `customStart` is absent |
| `endId` | string | Built-in location ID used when `customEnd` is absent |
| `rainfallMm` | number | Simulated rainfall in millimetres |
| `customStart` | object | Custom origin containing `lat`, `lng` and optionally `elevation` |
| `customEnd` | object | Custom destination containing `lat`, `lng` and optionally `elevation` |

Example response fields:

```text
source
destination
rainfall
defaultRoute
safeRoute
```

Each route contains:

```text
path
distanceKm
etaMins
riskLevel
floodedSegments
waterDepthMaxCm / riskReductionPct
```

Paths are arrays of `[latitude, longitude]` coordinate pairs.

### Local API checks

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/locations
```

## Data and Model Notes

- The API includes 22 configured Lucknow locations.
- The repository documents 18 waterlogging-zone records.
- The frontend has its own copy of locations and hazard-zone data.
- The optional Random Forest artifact is stored at `ml/models/waterlogging_rf_baseline.joblib`.
- The Flask API sends elevation, rainfall and a fixed third feature into the model.
- If the artifact is unavailable or incompatible, the API uses an elevation/rainfall fallback formula.
- The frontend fallback uses separate distance, delay and risk calculations.
- `docs/label_log.md` contains project-specific label sources and methodological notes.
- `tests/test_model.py` contains a separate FastAPI prototype and is not the main Flask service.

## Development

Run Python feature tests:

```bash
python -m pytest tests/test_features.py
```

Run frontend checks:

```bash
cd client
npm run lint
npm run build
```

## Limitations

- Search results and map geometry depend on external public services.
- Custom geocoded locations receive an assumed elevation rather than terrain-derived elevation.
- Live weather, live road closures and live traffic are not integrated.
- The frontend does not remove the built-in preset catalogue entirely; presets remain as local search matches and fallback locations.
- The route lines are illustrative and may not follow actual roads.
- The optional model, feature conventions and historical labels require validation before real use.
- Results are not official flood warnings or emergency-routing information.

## License

This project is distributed under the [MIT License](LICENSE).

## Authors

**Ausaaf Siddiqui** and **Pawan Pandey**

Final Year BCA students specializing in Data Science and Artificial Intelligence from Shri Ramswaroop Memorial University. AquaRoute-AI was developed as a university IBM project and combines their interests in AI, geospatial analysis and urban mobility.

## Contents

- [What it does](#what-it-does)
- [How it works](#how-it-works)
- [Technology](#technology)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [API reference](#api-reference)
- [Data and model notes](#data-and-model-notes)
- [Development and tests](#development-and-tests)
- [Limitations](#limitations)
- [License](#license)
- [About Authors](#about-authors)

## What it does

- Provides a catalogue of selected Lucknow neighbourhoods, landmarks and transport hubs.
- Estimates route-level waterlogging risk from rainfall and location elevation, using a trained model when the model artifact is available and a heuristic fallback otherwise.
- Returns a direct-route estimate alongside a lower-risk alternative, including estimated distance, travel time, risk level and other route indicators.
- Includes a React frontend using Leaflet/React-Leaflet for map-oriented interaction, plus a local routing fallback if the API cannot be reached.
- Includes notebooks and supporting code for rainfall data, roads and waterways, elevation, feature engineering, label checks and baseline models.

## How it works

The Flask service in `app.py` accepts a start and end location and a rainfall value. It looks up the selected coordinates and elevations, calculates their straight-line distance with the Haversine formula, and estimates route distances and travel times. The risk calculation uses the Random Forest artifact at `ml/models/waterlogging_rf_baseline.joblib` if it can be loaded; otherwise, the API falls back to a simple rainfall-and-elevation heuristic.

The API then returns a direct route and a generated alternate path with route summary values. These paths are currently generated from a small set of coordinate waypoints; they are **not guaranteed to follow the actual road network**. The repository also contains `scripts/routing.py`, an OSMnx/NetworkX-based network routing utility that applies risk-weighted costs to road edges and expects a model and road graph artifact.

## Technology

- **Backend:** Python, Flask, Flask-CORS, NumPy, Joblib
- **Frontend:** React, Vite, Axios, Leaflet and React-Leaflet
- **Analysis / modeling:** Jupyter notebooks, pandas and scikit-learn
- **Geospatial and routing utilities:** OSMnx, NetworkX and GeoPandas

Python dependencies are listed in [`requirements.txt`](requirements.txt), and JavaScript dependencies and scripts are listed in [`client/package.json`](client/package.json).

## Repository layout

```text
.
├── app.py                 # Flask API and route-risk estimation
├── client/                # React + Vite frontend
│   ├── services/api.js    # API access and local fallback route calculation
│   └── src/               # Frontend application and components
├── data/                  # Project datasets and labels
├── docs/                  # Data-label research notes and documentation
├── ml/models/             # Optional trained model artifact
├── notebooks/             # Data exploration, feature and model notebooks
├── scripts/               # Supporting utilities, including network routing
├── src/                   # Reusable source modules (including feature code)
├── tests/                 # Python tests
├── requirements.txt       # Python dependencies
└── LICENSE                # MIT License
```

## Getting started

### Prerequisites

- Python 3.10 or later is recommended.
- Node.js and npm are needed only to run the frontend.

### 1. Get the code

```bash
git clone https://github.com/ausaafffff/AquaRoute-AI.git
cd AquaRoute-AI
```

### 2. Set up and start the backend

Create a virtual environment and install the repository's Python dependencies:

```bash
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows PowerShell
# .venv\Scripts\Activate.ps1

python -m pip install --upgrade pip
pip install -r requirements.txt
```

Start the Flask API from the repository root:

```bash
python app.py
```

The API listens at `http://localhost:5000`. The Flask app enables CORS for the Vite development origins `http://localhost:5173` and `http://127.0.0.1:5173`.

### 3. Start the frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The frontend API service currently targets `http://localhost:5000/api`.

To create a production frontend build, run `npm run build` from `client/`. To serve that build locally for a preview, run `npm run preview`.

## API reference

The current Flask application exposes the following endpoints:

### `GET /api/health`

Returns a simple service status response.

```json
{
  "status": "online",
  "service": "AquaRoute-AI Backend"
}
```

### `GET /api/locations`

Returns the configured Lucknow locations, including their IDs, display names, coordinates and elevation values. Use a returned `id` as `startId` or `endId` in a route request.

### `POST /api/route`

Accepts a JSON request and returns source and destination details, rainfall, and `defaultRoute` and `safeRoute` summaries with coordinate paths.

Example request:

```json
{
  "startId": "charbagh",
  "endId": "gomti_nagar",
  "rainfallMm": 40
}
```

Request fields:

| Field | Type | Description |
| --- | --- | --- |
| `startId` | string | ID of a configured start location. Defaults to `charbagh`. |
| `endId` | string | ID of a configured destination. Defaults to `gomti_nagar`. |
| `rainfallMm` | number | Rainfall input in millimetres. Defaults to `40`. |
| `customStart` | object | Optional custom start point with `lat` and `lng`; may also include `elevation`. |
| `customEnd` | object | Optional custom destination point with `lat` and `lng`; may also include `elevation`. |

A successful response includes:

- `source`, `destination` and `rainfall`
- `defaultRoute`: `path`, `distanceKm`, `etaMins`, `riskLevel`, `floodedSegments` and `waterDepthMaxCm`
- `safeRoute`: `path`, `distanceKm`, `etaMins`, `riskLevel`, `floodedSegments` and `riskReductionPct`

Each `path` is an array of `[latitude, longitude]` coordinate pairs. The route and travel-time values are model/demo estimates, not guaranteed road-network directions or live traffic calculations.

You can check the service with:

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/locations
```

## Data and model notes

- The API defines 22 configured Lucknow locations and 18 waterlogging-zone records in `app.py`.
- The frontend service includes its own location and hazard-zone data and a client-side fallback calculation. Its fallback behavior is not identical to the backend's model/heuristic path.
- The optional Random Forest file is expected at `ml/models/waterlogging_rf_baseline.joblib`. If the file is absent or cannot be loaded, the Flask app logs a message and uses the fallback risk formula.
- The notebooks document the project's exploration and modeling workflow, including rainfall, road/waterway and elevation data, feature engineering, label checks and baseline models.
- `docs/label_log.md` records label research and methodological notes. Review its source references and caveats when using or extending the labels.

The model artifact and input feature conventions should be checked together before training or replacing a model. The API currently supplies elevation, rainfall and a fixed third feature to the model, while other exploratory and routing code may use different feature inputs.

## Development and tests

Run the feature tests from the repository root:

```bash
python -m pytest tests/test_features.py
```

The frontend scripts are available from `client/`:

```bash
npm run lint
npm run build
```

The repository also includes `tests/test_model.py`, a FastAPI-based API prototype. The currently launched service described above is the Flask application in `app.py`; treat the FastAPI file as a separate prototype unless the project is updated to integrate it.

## Limitations

- The demo is scoped to selected locations in Lucknow; location coverage and data quality are limited.
- Rainfall is supplied as a request value in the current API. The service does not fetch live weather data.
- The current Flask route geometry is generated from coordinate waypoints, not computed against live road geometry or traffic conditions.
- Risk estimates depend on the availability, training and feature compatibility of the model artifact, or on a deliberately simple fallback heuristic.
- Historical reports and gridded rainfall data can be incomplete, imprecise or inconsistent. See `docs/label_log.md` and the notebooks for project-specific data notes.
- Risk labels and route summaries are estimates and are not official flood warnings. Do not rely on them for emergency response or real-time navigation.

## License

This project is distributed under the [MIT License](LICENSE).

## About Authors

Ausaaf Siddiqui & Pawan Pandey are the Final Year BCA (Data Science & Artificial Intelligence) students from Shri Ramswaroop Memorial University. We two are passionate learners who's always curious about how the world of tech works and we never hesitate to deep dive into the world of AI.That curiosity and passion led us to build AquaRoute-AI, the most personal and passionate project of our student lives.
