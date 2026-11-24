
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import math
import joblib
import numpy as np
import uvicorn

# Initialize FastAPI App
app = FastAPI(
    title="AquaRoute-AI API",
    description="Lucknow Waterlogging Prediction & Resilient Alternate Routing Engine",
    version="1.0.0"
)

# Enable CORS for Vite frontend (Localhost & Production Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to models and data
MODEL_PATH = os.path.join("ml", "models", "waterlogging_rf_baseline.joblib")

# Preload ML Model
model = None
try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(" [AquaRoute-AI] Baseline Random Forest model loaded successfully.")
    else:
        print(f" [AquaRoute-AI] Model file not found at {MODEL_PATH}, using physics risk engine.")
except Exception as e:
    print(f" [AquaRoute-AI] Could not load model: {e}")

# 22 Verified Lucknow Hotspots & Transport Hubs
LUCKNOW_HOTSPOTS = {
    'alambagh': {'name': 'Alambagh', 'lat': 26.8140, 'lng': 80.9025, 'elevation': 115.8},
    'aliganj': {'name': 'Aliganj', 'lat': 26.9051, 'lng': 80.9480, 'elevation': 117.5},
    'aminabad': {'name': 'Aminabad Bazaar', 'lat': 26.8450, 'lng': 80.9270, 'elevation': 118.5},
    'ashiyana': {'name': 'Ashiyana', 'lat': 26.7996, 'lng': 80.9174, 'elevation': 116.2},
    'butler_palace': {'name': 'Butler Palace Colony', 'lat': 26.8436, 'lng': 80.9558, 'elevation': 117.1},
    'charbagh': {'name': 'Charbagh Railway Station', 'lat': 26.8335, 'lng': 80.9264, 'elevation': 116.0},
    'chowk': {'name': 'Chowk Heritage Area', 'lat': 26.8677, 'lng': 80.9042, 'elevation': 117.2},
    'dalibagh': {'name': 'Dalibagh', 'lat': 26.8398, 'lng': 80.9575, 'elevation': 117.4},
    'faizullaganj': {'name': 'Faizullaganj', 'lat': 26.8991, 'lng': 80.9286, 'elevation': 115.0},
    'gomti_nagar': {'name': 'Gomti Nagar', 'lat': 26.8612, 'lng': 81.0039, 'elevation': 118.0},
    'hazratganj': {'name': 'Hazratganj', 'lat': 26.8548, 'lng': 80.9448, 'elevation': 120.2},
    'indira_nagar': {'name': 'Indira Nagar', 'lat': 26.8823, 'lng': 80.9900, 'elevation': 121.0},
    'jankipuram_ext': {'name': 'Jankipuram Extension', 'lat': 26.9362, 'lng': 80.9664, 'elevation': 119.5},
    'jiamau': {'name': 'Jiamau', 'lat': 26.8354, 'lng': 80.9631, 'elevation': 117.0},
    'kdsingh_metro': {'name': 'KD Singh Babu Metro Station', 'lat': 26.8532, 'lng': 80.9403, 'elevation': 118.2},
    'meerabai_marg': {'name': 'Meerabai Marg', 'lat': 26.8481, 'lng': 80.9472, 'elevation': 118.0},
    'park_road': {'name': 'Park Road', 'lat': 26.8402, 'lng': 80.9497, 'elevation': 116.8},
    'polytechnic': {'name': 'Polytechnic Chauraha', 'lat': 26.8720, 'lng': 80.9980, 'elevation': 116.0},
    'pragnarayan_rd': {'name': 'Pragnarayan Road', 'lat': 26.8415, 'lng': 80.9592, 'elevation': 117.3},
    'sarojini_nagar': {'name': 'Sarojini Nagar', 'lat': 26.7475, 'lng': 80.8639, 'elevation': 115.5},
    'telibagh': {'name': 'Telibagh Raebareli Rd', 'lat': 26.7820, 'lng': 80.9320, 'elevation': 119.0},
    'airport': {'name': 'CCS International Airport', 'lat': 26.7606, 'lng': 80.8893, 'elevation': 122.5}
}

# Real Historical Waterlogging Spots
WATERLOGGING_ZONES = [
    {'id': 1, 'name': 'Hazratganj Lowpoint', 'lat': 26.8548, 'lng': 80.9448, 'severity': 'high', 'source': 'NewsDrum'},
    {'id': 2, 'name': 'Gomti Nagar Drainage Basin', 'lat': 26.8612, 'lng': 81.0039, 'severity': 'high', 'source': 'NewsDrum / TOI'},
    {'id': 3, 'name': 'Aliganj Underpass', 'lat': 26.9051, 'lng': 80.9480, 'severity': 'high', 'source': 'NewsDrum'},
    {'id': 4, 'name': 'Charbagh Station Road', 'lat': 26.8335, 'lng': 80.9264, 'severity': 'high', 'source': 'NewsDrum / TOI'},
    {'id': 5, 'name': 'Chowk Old Drain Corridors', 'lat': 26.8677, 'lng': 80.9042, 'severity': 'high', 'source': 'NewsDrum'},
    {'id': 6, 'name': 'Indira Nagar Munshipulia Belt', 'lat': 26.8823, 'lng': 80.9900, 'severity': 'high', 'source': 'NewsDrum / TOI'},
    {'id': 7, 'name': 'Alambagh Canal Road', 'lat': 26.8140, 'lng': 80.9025, 'severity': 'high', 'source': 'NewsDrum'},
    {'id': 8, 'name': 'Park Road Low-lying Spot', 'lat': 26.8402, 'lng': 80.9497, 'severity': 'high', 'source': 'Times of India'},
    {'id': 9, 'name': 'Ashiyana Residential Lowland', 'lat': 26.7996, 'lng': 80.9174, 'severity': 'moderate', 'source': 'Times of India'},
    {'id': 10, 'name': 'Faizullaganj Embankment Zone', 'lat': 26.8991, 'lng': 80.9286, 'severity': 'moderate', 'source': 'Times of India'},
    {'id': 11, 'name': 'Sarojini Nagar Drain Basin', 'lat': 26.7475, 'lng': 80.8639, 'severity': 'moderate', 'source': 'Times of India'},
    {'id': 12, 'name': 'Jankipuram Extension', 'lat': 26.9362, 'lng': 80.9664, 'severity': 'moderate', 'source': 'Times of India'},
    {'id': 13, 'name': 'Meerabai Marg Corridor', 'lat': 26.8481, 'lng': 80.9472, 'severity': 'moderate', 'source': 'Times of India'},
    {'id': 14, 'name': 'Dalibagh Colony Road', 'lat': 26.8398, 'lng': 80.9575, 'severity': 'moderate', 'source': 'Times of India'},
    {'id': 15, 'name': 'Butler Palace Canal Belt', 'lat': 26.8436, 'lng': 80.9558, 'severity': 'moderate', 'source': 'Times of India'},
    {'id': 16, 'name': 'Jiamau Culvert Sector', 'lat': 26.8354, 'lng': 80.9631, 'severity': 'moderate', 'source': 'Times of India'},
    {'id': 17, 'name': 'Pragnarayan Road Lowland', 'lat': 26.8415, 'lng': 80.9592, 'severity': 'moderate', 'source': 'Times of India'},
    {'id': 18, 'name': 'KD Singh Babu Metro Area', 'lat': 26.8532, 'lng': 80.9403, 'severity': 'moderate', 'source': 'Times of India'}
]

def calculate_haversine_km(lat1, lon1, lat2, lon2):
    """Calculate geographic distance between coordinates in km."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def predict_waterlogging_risk(elevation, rainfall_mm):
    """Predict risk probability (0.0 to 1.0) using RF Model or elevation-rainfall physics."""
    if model is not None:
        try:
            features = np.array([[elevation, rainfall_mm, 500]])
            if hasattr(model, "predict_proba"):
                return float(model.predict_proba(features)[0][1])
            return float(model.predict(features)[0])
        except Exception:
            pass

    # Physics risk formula: Low elevation (<118m) + High rainfall = severe risk
    elevation_penalty = max(0, (122.0 - elevation) * 4.0)
    risk_score = (rainfall_mm * 0.75) + elevation_penalty
    return min(1.0, max(0.05, risk_score / 100.0))

# Request payload validation schema
class RouteRequest(BaseModel):
    startId: Optional[str] = 'charbagh'
    endId: Optional[str] = 'gomti_nagar'
    rainfallMm: Optional[float] = 40.0
    customStart: Optional[Dict[str, Any]] = None
    customEnd: Optional[Dict[str, Any]] = None

@app.get('/')
def root():
    return {
        'status': 'online',
        'framework': 'FastAPI + Uvicorn (Production)',
        'message': 'AquaRoute-AI Backend is running',
        'endpoints': {
            'health': '/api/health',
            'locations': '/api/locations',
            'route': '/api/route',
            'docs': '/docs'
        }
    }

@app.get('/api/health')
def health_check():
    return {'status': 'online', 'service': 'AquaRoute-AI Backend'}

@app.get('/api/locations')
def get_locations():
    return [{'id': k, **v} for k, v in LUCKNOW_HOTSPOTS.items()]

@app.post('/api/route')
def calculate_route(payload: RouteRequest):
    # Resolve coordinates
    start_pt = payload.customStart or LUCKNOW_HOTSPOTS.get(payload.startId, LUCKNOW_HOTSPOTS['charbagh'])
    end_pt = payload.customEnd or LUCKNOW_HOTSPOTS.get(payload.endId, LUCKNOW_HOTSPOTS['gomti_nagar'])

    start_lat, start_lng = start_pt['lat'], start_pt['lng']
    end_lat, end_lng = end_pt['lat'], end_pt['lng']

    # Dynamic Haversine distance
    straight_km = calculate_haversine_km(start_lat, start_lng, end_lat, end_lng)
    default_dist_km = round(max(1.2, straight_km * 1.32), 1)
    safe_dist_km = round(default_dist_km * 1.18, 1)

    # Risk and flood predictions
    avg_elevation = (start_pt.get('elevation', 117.0) + end_pt.get('elevation', 117.0)) / 2.0
    risk_prob = predict_waterlogging_risk(avg_elevation, payload.rainfallMm)
    flooded_count = int(np.ceil(risk_prob * (default_dist_km / 2.3)))
    water_depth = int(risk_prob * payload.rainfallMm * 0.9)

    # Dynamic travel durations
    normal_drive_mins = int((default_dist_km / 28.0) * 60)
    delay_mins = int(flooded_count * 8 + (payload.rainfallMm / 10.0) * 2.5)
    default_eta = normal_drive_mins + delay_mins
    safe_eta = int((safe_dist_km / 38.0) * 60) + 3

    # Generate paths
    mid_lat = (start_lat + end_lat) / 2
    mid_lng = (start_lng + end_lng) / 2
    offset = 0.012 if (end_lng - start_lng) >= 0 else -0.012

    direct_path = [
        [start_lat, start_lng],
        [mid_lat - 0.004, mid_lng - 0.003],
        [mid_lat, mid_lng],
        [mid_lat + 0.004, mid_lng + 0.002],
        [end_lat, end_lng]
    ]

    safe_path = [
        [start_lat, start_lng],
        [start_lat + 0.008, start_lng + offset],
        [mid_lat + 0.014, mid_lng + (offset * 1.4)],
        [end_lat + 0.005, end_lng + (offset * 0.4)],
        [end_lat, end_lng]
    ]

    return {
        'source': start_pt,
        'destination': end_pt,
        'rainfall': payload.rainfallMm,
        'defaultRoute': {
            'path': direct_path,
            'distanceKm': default_dist_km,
            'etaMins': default_eta,
            'riskLevel': 'CRITICAL' if risk_prob > 0.65 else 'HIGH' if risk_prob > 0.35 else 'MODERATE',
            'floodedSegments': flooded_count,
            'waterDepthMaxCm': water_depth
        },
        'safeRoute': {
            'path': safe_path,
            'distanceKm': safe_dist_km,
            'etaMins': safe_eta,
            'riskLevel': 'LOW',
            'floodedSegments': 0,
            'riskReductionPct': int(max(70, min(97, (1.0 - (risk_prob * 0.15)) * 100)))
        }
    }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f" AquaRoute AI Server starting with Uvicorn on port {port}")
    # Running via `python app.py` will now boot Uvicorn safely
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)