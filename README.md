# AquaRoute-AI

**AI-assisted waterlogging risk estimation and route planning for Lucknow, India**  
University IBM Project

AquaRoute-AI is a prototype that explores how rainfall, terrain and reported waterlogging locations can inform safer urban travel. It pairs a Python API with a React map-based client and a collection of geospatial and machine-learning notebooks. The current demo focuses on selected locations in Lucknow.

> **Important:** This is an academic prototype, not an emergency service or a live navigation system. Its risk estimates and suggested paths are approximations, may rely on static or illustrative data, and should not be used as the sole basis for travel decisions. Check current local advisories and road conditions before travelling.

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
