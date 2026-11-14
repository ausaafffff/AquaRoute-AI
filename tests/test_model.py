from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import joblib
import networkx as nx
import os

app = FastAPI(
    title="AquaRoute-AI API",
    description="AI-enabled waterlogging prediction and safe re-routing service for Lucknow.",
    version="1.0.0"
)

# Enable CORS for local frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Load artifacts (Model and Graph)
ROOT = Path.cwd()
model_path = ROOT / "ml" / "models" / "waterlogging_rf_baseline.joblib"
graph_path = ROOT / "data" / "processed" / "lucknow_roads.graphml"

if model_path.exists():
    model = joblib.load(model_path)
    print("Loaded trained Random Forest model successfully.")
else:
    model = None
    print("Warning: Model artifact not found.")

if graph_path.exists():
    G = nx.read_graphml(graph_path)
    print("Loaded spatial road network graph successfully.")
else:
    G = None
    print("Warning: Graph artifact not found.")

class RouteRequest(BaseModel):
    lat: float
    lon: float

class NavigationRequest(BaseModel):
    origin_node: str
    dest_node: str
    penalty_multiplier: float = 15.0

@app.get("/")
def read_root():
    return {
        "status": "Online", 
        "project": "AquaRoute-AI", 
        "city": "Lucknow", 
        "model_loaded": model is not None,
        "graph_loaded": G is not None
    }

@app.post("/predict-waterlogging")
def predict_waterlogging(request: RouteRequest):
    if not (26.70 <= request.lat <= 27.00 and 80.80 <= request.lon <= 81.10):
        raise HTTPException(
            status_code=400, 
            detail="Coordinates out of Lucknow pilot bounding box (lat: 26.70-27.00, lon: 80.80-81.10)."
        )
    
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded on server.")

    features = [[request.lat, request.lon]]
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

    is_waterlogged = bool(prediction == 1)
    recommendation = (
        "High waterlogging risk detected. Recommend re-routing via higher elevation arterial roads."
        if is_waterlogged else 
        "Route is clear. Safe to proceed."
    )

    return {
        "location": {"lat": request.lat, "lon": request.lon},
        "waterlogging_predicted": is_waterlogged,
        "risk_probability": round(float(probability), 2),
        "navigation_advice": recommendation
    }

@app.post("/calculate-route")
def calculate_route(request: NavigationRequest):
    """
    Calculates a risk-aware safe route between two network nodes using dynamic edge cost weighting.
    """
    if G is None:
        raise HTTPException(status_code=500, detail="Road network graph not loaded on server.")
    
    if request.origin_node not in G or request.dest_node not in G:
        raise HTTPException(status_code=404, detail="Origin or destination node not found in graph network.")

    try:
        # Dynamic cost transformation across network edges
        for u, v, data in G.edges(data=True):
            base_length = float(data.get('length', 1.0))
            # Placeholder or model evaluation for edge flood probability (p_flood)
            # In production, this maps edge centroid coordinates to model.predict_proba()
            p_flood = 0.2 if 'waterlogged' in data else 0.05
            
            # Dynamic Weight formula
            dynamic_weight = base_length * (1.0 + request.penalty_multiplier * p_flood)
            data['dynamic_weight'] = dynamic_weight

        # Calculate shortest path using Dijkstra with dynamic weights
        path = nx.shortest_path(G, source=request.origin_node, target=request.dest_node, weight='dynamic_weight')
        path_length = nx.shortest_path_length(G, source=request.origin_node, target=request.dest_node, weight='dynamic_weight')

        return {
            "status": "Success",
            "origin": request.origin_node,
            "destination": request.dest_node,
            "path_nodes": path,
            "total_weighted_cost": round(path_length, 2),
            "node_count": len(path)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Routing calculation failed: {str(e)}")