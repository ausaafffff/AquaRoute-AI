import folium, pandas as pd
from pathlib import Path

ROOT = Path.cwd().parent if Path.cwd().name == "notebooks" else Path.cwd()
PROC = ROOT / "data" / "processed"
PROC.mkdir(parents=True, exist_ok=True)

grid = pd.read_csv(ROOT / "data" / "raw" / "lucknow_grid_elevation.csv")
labels = pd.read_csv(ROOT / "data" / "labels" / "waterlogging_reports.csv").drop_duplicates("location_name")

m = folium.Map(location=[26.86, 80.95], zoom_start=12)

# red = lowest quarter of the city, blue = highest quarter, grey = in between
low, high = grid["elevation"].quantile(0.25), grid["elevation"].quantile(0.75)
for _, r in grid.iterrows():
    color = "red" if r["elevation"] <= low else "blue" if r["elevation"] >= high else "gray"
    folium.CircleMarker([r["lat"], r["lon"]], radius=4, color=color, fill=True,
                        fill_opacity=0.7, tooltip=f"{r['elevation']:.0f} m").add_to(m)

# your flooded neighbourhoods on top
for _, r in labels.iterrows():
    folium.Marker([r["lat"], r["lon"]], tooltip=r["location_name"],
                  icon=folium.Icon(color="green")).add_to(m)

m.save(PROC / "elevation_map.html")
m   # shows the map right inside the notebook