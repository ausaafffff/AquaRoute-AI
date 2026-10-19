import requests
import pandas as pd
from datetime import date, timedelta
from pathlib import Path

LAT, LON = 26.8467, 80.9462  # Lucknow
OUT = Path("data/raw/rain_lucknow_2026.csv")

def fetch_rainfall(start, end):
    r = requests.get(
        "https://archive-api.open-meteo.com/v1/archive",
        params={
            "latitude": LAT, "longitude": LON,
            "start_date": start, "end_date": end,
            "hourly": "precipitation,temperature_2m,relative_humidity_2m",
            "timezone": "Asia/Kolkata",
        },
        timeout=60,
    )
    r.raise_for_status()
    df = pd.DataFrame(r.json()["hourly"])
    df["time"] = pd.to_datetime(df["time"])
    return df

if __name__ == "__main__":
    end = (date.today() - timedelta(days=5)).isoformat()
    df = fetch_rainfall("2026-01-01", end)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT, index=False)
    print("Saved", OUT, "with", len(df), "rows")
    print(df.nlargest(10, "precipitation")[["time", "precipitation"]])