#setup and path intialization
import pandas as pd
from pathlib import Path

ROOT=Path.cwd()
while not (ROOT/".git").exists() and ROOT!=ROOT.parent:
    ROOT=ROOT.parent

path = ROOT / "data" / "labels" / "waterlogging_reports.csv"

#------------ cell validation
lab = pd.read_csv(path)
problems = []

need = ["date", "location_name", "lat", "lon", "severity", "source", "source_url"]
missing = [c for c in need if c not in lab.columns]
if missing:
    problems.append(f"missing columns: {missing}")
else:
    if pd.to_datetime(lab["date"], errors="coerce").isna().any():
        problems.append("unparseable dates")
    bad = lab[~lab["severity"].isin(["high", "moderate", "none"])]
    if len(bad): problems.append(f"{len(bad)} rows with unknown severity")
    out = lab[~lab["lat"].between(26.70, 27.00) | ~lab["lon"].between(80.80, 81.10)]
    if len(out): problems.append(f"{len(out)} rows outside the Lucknow box")
    dup = lab.duplicated(["date", "location_name"]).sum()
    if dup: problems.append(f"{dup} duplicate date+place rows")
    pos = lab[lab["severity"] != "none"]
    nourl = pos[pos["source_url"].isna() | (pos["source_url"].astype(str).str.strip() == "")]
    if len(nourl): problems.append(f"{len(nourl)} positives without a source_url")

print("OK" if not problems else "\n".join(problems))
print(lab.groupby("date")["severity"].agg(lambda s: s.value_counts().to_dict()))

#---------- appended events and heavy rain events
lab = pd.read_csv(path)

# Example Guarded Append for 15 Sep 2022 Event (Positive)
URL = "https://timesofindia.indiatimes.com/city/lucknow/lucknow-wades-through-waterlogged-roads/articleshow/94236001.cms"
if not (lab["date"] == "2022-09-15").any():
    rows = [
        ("Park Road", 26.8402, 80.9497, "high"),
        ("Jankipuram Extension", 26.9362, 80.9664, "moderate"),
        ("Meerabai Marg", 26.8481, 80.9472, "moderate"),
        ("Dalibagh", 26.8398, 80.9575, "moderate"),
        ("Butler Palace", 26.8436, 80.9558, "moderate"),
        ("Jiamau", 26.8354, 80.9631, "moderate"),
        ("Pragnarayan Road", 26.8415, 80.9592, "moderate"),
        ("KD Singh Babu Metro Station area", 26.8532, 80.9403, "moderate"),
    ]
    new_pos = pd.DataFrame(rows, columns=["location_name", "lat", "lon", "severity"])
    new_pos["date"] = "2022-09-15"
    new_pos["source"] = "Times of India"
    new_pos["source_url"] = URL
    new_pos = new_pos.reindex(columns=lab.columns)
    lab = pd.concat([lab, new_pos], ignore_index=True)
    print("Added 15 Sep 2022 positive events.")

lab.to_csv(path, index=False)
print("Total rows after appends:", len(lab))

# -----------Pilot evaluation
df = pd.read_csv(path)

# Ensure 'date' column is present
if "date" not in df.columns and "date" in df.index.names:
    df = df.reset_index()

# Deduplicate keeping highest severity per cell per date
severity_rank = {"none": 0, "moderate": 1, "high": 2}
df["severity_rank"] = df["severity"].map(severity_rank)
df = df.sort_values(by="severity_rank", ascending=False)
df_dedup = df.drop_duplicates(subset=["date", "lat", "lon"], keep="first").copy()

print(f"Deduplicated training rows: {len(df_dedup)}")

# Leave-One-Event-Out evaluation loop
events = df_dedup["date"].unique()
print(f"\nEvaluating across {len(events)} distinct events using Leave-One-Event-Out:\n")

for test_event in events:
    train_set = df_dedup[df_dedup["date"] != test_event]
    test_set = df_dedup[df_dedup["date"] == test_event]
    print(f"Test Event: {test_event} | Test Rows: {len(test_set)} | Train Rows: {len(train_set)}")

# ----------final cell validation
lab = pd.read_csv(path)
problems = []

need = ["date", "location_name", "lat", "lon", "severity", "source", "source_url"]
missing = [c for c in need if c not in lab.columns]
if missing:
    problems.append(f"missing columns: {missing}")
else:
    if pd.to_datetime(lab["date"], errors="coerce").isna().any():
        problems.append("unparseable dates")
    bad = lab[~lab["severity"].isin(["high", "moderate", "none"])]
    if len(bad): problems.append(f"{len(bad)} rows with unknown severity")
    out = lab[~lab["lat"].between(26.70, 27.00) | ~lab["lon"].between(80.80, 81.10)]
    if len(out): problems.append(f"{len(out)} rows outside the Lucknow box")
    dup = lab.duplicated(["date", "location_name"]).sum()
    if dup: problems.append(f"{dup} duplicate date+place rows")
    pos = lab[lab["severity"] != "none"]
    nourl = pos[pos["source_url"].isna() | (pos["source_url"].astype(str).str.strip() == "")]
    if len(nourl): problems.append(f"{len(nourl)} positives without a source_url")

print("FINAL CHECK STATUS:", "OK" if not problems else "\n".join(problems))
print(lab.groupby("date")["severity"].agg(lambda s: s.value_counts().to_dict()))