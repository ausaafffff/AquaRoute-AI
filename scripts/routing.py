import warnings
import osmnx as ox
import networkx as nx
import joblib
import numpy as np
from pathlib import Path

warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")  #Suppress sklearn warnings for cleaner output

# Setup paths based on your repository structure
ROOT = Path.cwd()
while not (ROOT / ".git").exists() and ROOT != ROOT.parent:
    ROOT = ROOT.parent
MODEL_PATH = ROOT / "ml" / "models" / "waterlogging_rf_baseline.joblib"
GRAPH_PATH = ROOT / "data" / "raw" / "lucknow_roads.graphml"

def calculate_safe_route(origin_latlon, target_latlon, penalty_multiplier=15.0):
    """
    Computes a risk-aware path using OSMnx and waterlogging predictions.
    
    Parameters:
    - origin_latlon: Tuple of (latitude, longitude) for start point
    - target_latlon: Tuple of (latitude, longitude) for destination point
    - penalty_multiplier: Weight multiplier to penalize flooded roads
    """
    # 1. Validate and load assets
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model artifact not found at {MODEL_PATH}")
    if not GRAPH_PATH.exists():
        raise FileNotFoundError(f"Road network graph not found at {GRAPH_PATH}")
        
    model = joblib.load(MODEL_PATH)
    G = ox.load_graphml(GRAPH_PATH)
    print(" Successfully loaded road network graph and ML model!")

    # 2. Find nearest graph nodes to given latitude/longitude coordinates
    # Note: OSMnx expects (X=longitude, Y=latitude)
    origin_node = ox.distance.nearest_nodes(G, X=origin_latlon[1], Y=origin_latlon[0])
    target_node = ox.distance.nearest_nodes(G, X=target_latlon[1], Y=target_latlon[0])
    print(f"Mapped Origin Node: {origin_node} | Target Node: {target_node}")

    # 3. Assign dynamic risk weights to graph edges
    print("Evaluating waterlogging risk and calculating dynamic edge weights...")
    for u, v, data in G.edges(data=True):
        # Retrieve starting node coordinates for the edge segment
        node_data = G.nodes[u]
        lat = float(node_data.get('y', 26.8467))  # Default Lucknow latitude fallback
        lon = float(node_data.get('x', 80.9462))  # Default Lucknow longitude fallback
        
        # Predict flood probability using your baseline model features (lat, lon)
        features = np.array([[lat, lon]])
        flood_prob = float(model.predict_proba(features)[0][1])
        
        # Base physical length of the road segment (in meters)
        base_length = float(data.get('length', 1.0))
        
        # Apply dynamic cost penalty formula:
        # If flood_prob is near 0, cost equals physical length.
        # If flood_prob is high, edge cost spikes heavily, forcing the router to bypass it.
        dynamic_weight = base_length * (1.0 + (penalty_multiplier * flood_prob))
        data['dynamic_weight'] = dynamic_weight

    # 4. Compute shortest path using the risk-adjusted dynamic weights
    try:
        safe_path = nx.shortest_path(G, source=origin_node, target=target_node, weight='dynamic_weight')
        print(f"Safe route successfully computed! Path contains {len(safe_path)} road intersections.")
        return G, safe_path
    except nx.NetworkXNoPath:
        print(" No path found between the specified coordinates.")
        return G, None

if __name__ == "__main__":
    # Example coordinates in Lucknow (e.g., Charbagh area to Hazratganj area)
    origin_coords = (26.8322, 80.9200)
    destination_coords = (26.8467, 80.9462)
    
    # Run the routing engine with a 15x penalty multiplier on flooded segments
    graph, route_nodes = calculate_safe_route(origin_coords, destination_coords, penalty_multiplier=15.0)
    
    if route_nodes:
        print(routing_preview := f"First 5 nodes of the safe route: {route_nodes[:5]}")