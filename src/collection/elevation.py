import numpy as np
import pandas as pd
import requests
import time
from pathlib import Path

ROOT =Path.cwd(). parent if Path.cwd().name =="notebooks" else Path.cwd()
RAW = ROOT / "data" /"raw"
out_csv=RAW / "lucknow_grid_elevation.csv"

#grid over lucknow central(1 km radius)
lats= np.arange(26.76, 26.96, 0.009) 
lons= np.arange(80.85, 81.05, 0.010)
grid = pd.DataFrame(
    [(la, lo) for la in lats for lo in lons],
    columns=["lat", "lon"],
)
print(len(grid), "grid points")

elev = pd.read_csv(out_csv)["elevation"].tolist() if out_csv.exists() else []
print(len(elev), "already done")

for i in range(len(elev), len(grid), 100):
    sub = grid.iloc[i:i+100]
    params = {"latitude": ",".join(f"{v:.5f}" for v in sub["lat"]),
              "longitude": ",".join(f"{v:.5f}" for v in sub["lon"])}

    for attempt in range(5):
        r = requests.get("https://api.open-meteo.com/v1/elevation", params=params, timeout=60)
        if r.status_code == 429:
            wait = 60 * (attempt + 1)
            print(f"Rate limited, waiting {wait}s...")
            time.sleep(wait)
            continue
        r.raise_for_status()
        break
    else:
        print("Still rate limited. Stopping, progress is saved. Try again later.")
        break

    elev += r.json()["elevation"]
    # save progress after every batch
    grid.iloc[:len(elev)].assign(elevation=elev).to_csv(out_csv, index=False)
    print(len(elev), "points done")
    time.sleep(5)

print(pd.Series(elev).describe())


ROOT = Path.cwd().parent if Path.cwd().name == "notebooks" else Path.cwd()
grid = pd.read_csv(ROOT / "data" / "raw" / "lucknow_grid_elevation.csv")
labels = pd.read_csv(ROOT / "data" / "labels" / "waterlogging_reports.csv")

places = labels.drop_duplicates("location_name")[["location_name", "lat", "lon"]].copy()

def nearest_elev(lat, lon):
    d = (grid["lat"] - lat) ** 2 + (grid["lon"] - lon) ** 2
    return grid.loc[d.idxmin(), "elevation"]

places["elevation"] = [nearest_elev(a, b) for a, b in zip(places["lat"], places["lon"])]
print(places[["location_name", "elevation"]])
print("City median:", grid["elevation"].median())