# Label search log

## Pre-existing events (from before this branch)
2024-07-07 | pre-existing | moderate, 5 places | URLs to be re-verified
2026-09-25 | pre-existing | high, 7 places | URLs and year to be re-verified
2022-07-21 | pre-existing | none, 9 places | search status unknown
2024-09-17 | pre-existing | none, 9 places | search status unknown

## Searches on this branch
2025-08-13 | searched EN+HI (2 queries) | no Lucknow report found; rain 12.7 mm/day (moderate) | kept as unconfirmed negative; leads: 8 Aug 2025 (DM school closure, no areas named), 21 Aug 2025 (radar-site only, not usable)
2022-07-30 | searched EN+HI (2 queries) | no Lucknow report found; rain 22.7 mm/day, 33.8 mm/72h | added as unconfirmed negative (9 places)
2022-09-15/16 | searched EN+HI (3 queries) | storm confirmed (ANI, BOOM, ETV Bharat, Patrika, Aaj Tak); no place-level article yet; 2021 HT article rejected (wrong year) | pending; label date provisional 2022-09-15

## Data notes (for the limitations section)
- Rain index timezone: IST (Asia/Kolkata), confirmed in notebook 01 download requests
- 2022-09 storm: news IMD 24-h figure ~155-160 mm; dataset rain_24h = 97.8 mm at 08:00 IST 16 Sep (matches the Met window); gap ~60 mm, cause unconfirmed (likely gridded-data smoothing)
 2022-09-15 | TOI 16 Sep 2022 (waterlogging on Thu 15 Sep, 8 localities); Amar Ujala 15 Sep 2022 (event, verified); ANI/BOOM/ETV/Patrika (event) | added as positive (8 new places; Park Road high: submerged knee-deep; others moderate) | label date 2022-09-15 (core hours 19-23 IST); rain gap: news IMD ~155-160 mm vs dataset rain_24h 97.8 mm; places not in standard set of nine
India Today 16 Sep 2022 14:20 IST (verified from page text; Friday, 2022 confirmed): several areas waterlogged, airport road flooded (not used as a row: vague location), Dilkusha wall collapse (not waterlogging); timings (police at site ~3 am, schools shut 4 am) consistent with IST rain data, supports label date 2022-09-15
2022-09-15 | TOI 16 Sep 2022 (waterlogging on Thu 15 Sep, 8 localities); Amar Ujala 15 Sep 2022 (event, verified); India Today 16 Sep 2022 (event, verified from page text) | added as positive (8 new places; Park Road high: knee-deep, wading to SPM Hospital; others moderate) | label date 2022-09-15 (core hours 19-23 IST); coordinates from Gemini (Maps-grounded), pins spot-checked, Park Road not yet compared with SPM Hospital; several places share a 0.01 degree cell, deduplicate when building the training table; rain gap: news IMD ~155-160 mm vs dataset rain_24h 97.8 mm
2026-10-27 | CSV duplicates found (30 Jul x3, 15 Sep x4, from re-run cells); removed, 15 Sep re-added once with a guard | rows 98 -> 48 -> 56

## Limitations & Methodological Constraints

1. **Unconfirmed Negatives:** Heavy-rain negative days are defined by the absence of digital news reports (English and Hindi searches) exceeding threshold criteria. While backed by high precipitation metrics (`rain_1h` / `rain_72h`), localized minor waterlogging uncaptured by media may occasionally be mislabeled as true negatives.
2. **Cell Overlap & Spatial Granularity:** Multiple reports from severe storms (e.g., 15 Sep 2022) occasionally map to identical spatial grid cells. Resolution was handled by keeping the highest severity rating per cell per date.
3. **Precipitation Data Gap:** Modeled rainfall features reflect available gridded/station data interpolation, which can show variance against official Meteorological Department local station readings.