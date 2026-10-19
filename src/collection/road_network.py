import osmnx as ox 
from pathlib import Path #for file path management

ROOT =Path.cwd(). parent if Path.cwd().name =="notebooks" else Path.cwd()
RAW = ROOT / "data" /"raw"
RAW.mkdir(parents=True, exist_ok=True)

ox.settings.cache_folder= ROOT / "data" /"cache"
ox.settings.use_cache=True #this will use to show the downloaded data from cache folder if it is already downloaded. It will not download again.

center = (26.86, 80.95)   # central Lucknow
DIST = 12000              # 12 km radius

#driveable roads
G = ox.graph_from_point(center, dist=DIST, network_type='drive')
ox.save_graphml(G, RAW / "lucknow_roads.graphml")  
print(len(G.nodes), "intersections, ", len(G.edges), "road segments" )

#rivers, canals, drains mapped in openstreet maps
water=ox.features_from_point(center, tags={'waterway':True}, dist=DIST)
water=water.reset_index()
cols = [c for c in ["waterway", "name", "geometry"] if c in water.columns]
water[cols].to_file(RAW / "lucknow_waterways.geojson", driver="GeoJSON")
print(water["waterway"].value_counts())


