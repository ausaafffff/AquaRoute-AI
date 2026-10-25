import numpy as np
import pandas as pd
import pytest

from src.features import build_rain_features, build_terrain_features


def _raw_rain(values):
    t = pd.date_range("2024-01-01", periods=len(values), freq="h")
    return pd.DataFrame({"time": t, "precipitation": values})


def test_rolling_sum_and_nan_start():
    rain = build_rain_features(_raw_rain([1.0] * 5))
    assert rain["rain_3h"].iloc[2] == 3.0          # third hour: 1 + 1 + 1
    assert np.isnan(rain["rain_3h"].iloc[1])       # incomplete window


def test_missing_hour_raises():
    raw = _raw_rain([1.0] * 5).drop(index=2)
    with pytest.raises(ValueError):
        build_rain_features(raw)


def test_relative_elev_marks_a_dip():
    grid = pd.DataFrame({"lat": [26.0] * 3, "lon": [80.0, 80.01, 80.02],
                         "elevation": [10.0, 5.0, 10.0]})
    out = build_terrain_features(grid)
    assert out["relative_elev"].iloc[1] == pytest.approx(-5.0)   # lower than both neighbours