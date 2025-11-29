import pandas as pd
import json
import sqlite3

# ---------------------------------------------
# 1) Load mappings
# ---------------------------------------------
with open("region_mappings.json") as f:
    REGION_MAP = json.load(f)

with open("colony_mappings.json") as f:
    COLONY_MAP = json.load(f)

# ---------------------------------------------
# 2) Load raw CSV (from SlaveVoyages)
# ---------------------------------------------
df = pd.read_csv("trans-atlantic.csv")

# Standardize column names for internal use
df = df.rename(columns={
    "Voyage ID": "voyage_id",
    "Year arrived with captives": "year",
    "Principal region of captive purchase": "departure_region_raw",
    "Principal place where captives were landed (IMP)": "arrival_colony_raw",
    "Total disembarked (IMP)": "enslaved_count"
})

# Filter out missing data
df = df.dropna(subset=["departure_region_raw", "arrival_colony_raw", "enslaved_count"])

# ---------------------------------------------
# 3) Apply region & colony mappings
# ---------------------------------------------
def map_region(r):
    return REGION_MAP.get(r, None)

def map_colony(c):
    return COLONY_MAP.get(c, None)

df["region_id"] = df["departure_region_raw"].apply(map_region)
df["colony"] = df["arrival_colony_raw"].apply(map_colony)

# Remove unknowns for now
df = df.dropna(subset=["region_id", "colony"])

# ensure enslaved_count numeric
df["enslaved_count"] = pd.to_numeric(df["enslaved_count"], errors="coerce").fillna(0)

# ---------------------------------------------
# 4) Aggregate statistics
# ---------------------------------------------
# We want: P(region | colony) = total enslaved from region to colony / total enslaved to colony
grouped = df.groupby(["colony", "region_id"])["enslaved_count"].sum().reset_index(name="total_from_region")

# compute total per colony
totals = grouped.groupby("colony")["total_from_region"].sum().reset_index(name="total_to_colony")

# merge totals
merged = grouped.merge(totals, on="colony")
merged["probability"] = merged["total_from_region"] / merged["total_to_colony"]

# Optional: group by year range (century)
df["year_group"] = (df["year"] // 25) * 25  # group by 25-year ranges
grouped_year = df.groupby(["colony", "region_id", "year_group"])["enslaved_count"].sum().reset_index(name="count")

# compute year-based probabilities
year_totals = grouped_year.groupby(["colony", "year_group"])["count"].sum().reset_index(name="total_c")
merged_year = grouped_year.merge(year_totals, on=["colony", "year_group"])
merged_year["probability"] = merged_year["count"] / merged_year["total_c"]

print("Colony-Region Probability Stats:"
      , merged[["colony", "region_id", "probability"]]
      , sep="\n"
      , end="\n\n"
      )

print("Colony-Region Probability Stats (by year):"
      , merged_year[["colony", "year_group", "region_id", "probability"]]
      , sep="\n"
      , end="\n\n"
      )

# ---------------------------------------------
# 5) Load into SQLite (colony_region_stats)
# ---------------------------------------------
conn = sqlite3.connect("ancestry.db")
cursor = conn.cursor()

# Create table if it does not exist (simple schema for SQLite)
cursor.execute("""
CREATE TABLE IF NOT EXISTS colony_region_stats (
    colony TEXT,
    region_id TEXT,
    year_start INTEGER,
    year_end INTEGER,
    probability REAL
)
""")

SQL_INSERT = """
INSERT INTO colony_region_stats (colony, region_id, year_start, year_end, probability)
VALUES (?, ?, ?, ?, ?)
"""

rows = []
for _, r in merged_year.iterrows():
    year_start = int(r["year_group"])
    year_end = year_start + 24
    rows.append((
        r["colony"],
        r["region_id"],
        year_start,
        year_end,
        float(r["probability"])
    ))

cursor.executemany(SQL_INSERT, rows)
conn.commit()
cursor.close()
conn.close()

print("Finished generating colony_region_stats.")
