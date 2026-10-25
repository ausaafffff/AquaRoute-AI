"""Feature engineering for AquaRoute-AI (waterlogging prediction, Lucknow)."""
from pathlib import Path

import numpy as np
import pandas as pd

RAIN_WINDOWS = [3, 6, 24, 72]                 # hours, besides rain_1h
RAIN_COLS = ["rain_1h", "rain_3h", "rain_6h", "rain_24h", "rain_72h"]
NEIGHBOUR_RADIUS_DEG = 0.025                  # ~2.5 km, for relative_elev
MAX_MATCH_DEG = 0.01                          # ~1 km, report to grid distance


def find_project_root(start=None) -> Path:
    """Walk upwards from `start` until a folder containing .git is found."""
    root = Path(start or Path.cwd()).resolve()
    while not (root / ".git").exists() and root != root.parent:
        root = root.parent
    return root


def build_rain_features(raw_rain: pd.DataFrame) -> pd.DataFrame:
    """Hourly rolling rainfall sums.

    raw_rain needs columns 'time' and 'precipitation' (mm per hour).
    The first hours of the series are NaN because their windows are incomplete.
    """
    r = raw_rain.copy()
    r["time"] = pd.to_datetime(r["time"])
    r = r.set_index("time").asfreq("h")           # strict hourly index
    if r["precipitation"].isna().any():
        raise ValueError("missing hours in rainfall data")

    rain = pd.DataFrame(index=r.index)
    rain["rain_1h"] = r["precipitation"]
    for h in RAIN_WINDOWS:
        rain[f"rain_{h}h"] = r["precipitation"].rolling(h, min_periods=h).sum()
    return rain


def build_terrain_features(raw_grid: pd.DataFrame) -> pd.DataFrame:
    """Add relative_elev = elevation minus the mean of neighbours within ~2.5 km.

    raw_grid needs columns 'lat', 'lon', 'elevation'.
    Negative values mean the point is lower than its surroundings.
    """
    e = raw_grid.copy()
    coords = e[["lat", "lon"]].to_numpy()
    elev = e["elevation"].to_numpy()
    dist = np.sqrt(((coords[:, None, :] - coords[None, :, :]) ** 2).sum(-1))

    mask = (dist > 0) & (dist <= NEIGHBOUR_RADIUS_DEG)   # self excluded
    e["relative_elev"] = elev - (mask * elev[None, :]).sum(1) / mask.sum(1)
    return e


def build_training_table(rain: pd.DataFrame, grid: pd.DataFrame,
                         labels: pd.DataFrame) -> pd.DataFrame:
    """One row per reported place and event.

    Event hour = hour of peak rain_1h on the report date.
    Reports farther than MAX_MATCH_DEG from the grid are skipped.
    """
    labels = labels.copy()
    labels["date"] = pd.to_datetime(labels["date"])
    labels["label"] = (labels["severity"].str.lower() != "none").astype(int)

    rows = []
    for _, rep in labels.iterrows():
        day = rain[rain.index.strftime("%Y-%m-%d") == rep["date"].strftime("%Y-%m-%d")]
        if day.empty:
            print("No rain data for", rep["date"].date())
            continue
        hour = day["rain_1h"].idxmax()

        dist2 = (grid["lat"] - rep["lat"]) ** 2 + (grid["lon"] - rep["lon"]) ** 2
        if np.sqrt(dist2.min()) > MAX_MATCH_DEG:
            print("Skipping (too far from grid):", rep["location_name"])
            continue
        t = grid.loc[dist2.idxmin()]

        rows.append({
            "location_name": rep["location_name"],
            "event_hour": hour,
            "label": rep["label"],
            **rain.loc[hour, RAIN_COLS].to_dict(),
            "elevation": t["elevation"],
            "relative_elev": t["relative_elev"],
        })
    return pd.DataFrame(rows)